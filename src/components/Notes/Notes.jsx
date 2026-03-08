import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { get, put, del } from "aws-amplify/api";
import { onError } from '../../libs/errorsLibs';
import MarkdownEditor from "./MarkdownEditor";
import { splitIntoThread } from "../../libs/threadSplitter";
import { wordCount, readingTime } from "../../libs/noteHelpers";

export default function Notes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [saveStatus, setSaveStatus] = useState(''); // '' | 'saving' | 'saved'
  const [showPreview, setShowPreview] = useState(false);
  const autoSaveTimer = useRef(null);

  async function loadNote() {
    try {
      const { body } = await get({ apiName: "notes", path: `/notes/${id}` }).response;
      const data = await body.json();
      const plain = data.content ? data.content.replace(/(<([^>]+)>)/gi, "") : "";
      setContent(plain);
      setTitle(data.title || '');
      setNote(data);
    } catch (error) {
      onError(error);
    }
  }

  async function persistNote(updatedContent, updatedTitle, status) {
    await put({
      apiName: "notes",
      path: `/notes/${id}`,
      options: { body: { content: updatedContent, title: updatedTitle, status: status || "draft" } },
    }).response;
  }

  function scheduleAutoSave(newContent, newTitle, currentStatus) {
    clearTimeout(autoSaveTimer.current);
    setSaveStatus('');
    autoSaveTimer.current = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        await persistNote(newContent, newTitle, currentStatus);
        setSaveStatus('saved');
      } catch (e) {
        setSaveStatus('');
      }
    }, 2000);
  }

  function handleContentChange(value) {
    setContent(value);
    scheduleAutoSave(value, title, note?.status);
  }

  function handleTitleChange(e) {
    setTitle(e.target.value);
    scheduleAutoSave(content, e.target.value, note?.status);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!content.trim()) return;
    setIsSaving(true);
    try {
      await persistNote(content, title, note?.status);
      navigate("/");
    } catch (error) {
      onError(error);
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete this note?")) return;
    setIsDeleting(true);
    try {
      await del({ apiName: "notes", path: `/notes/${id}` }).response;
      navigate("/");
    } catch (error) {
      onError(error);
      setIsDeleting(false);
    }
  }

  function handlePublish() {
    const posts = splitIntoThread(content);
    navigate("/compose", { state: { noteId: id, posts } });
  }

  useEffect(() => {
    loadNote();
    return () => clearTimeout(autoSaveTimer.current);
  }, []);

  const wc = wordCount(content);
  const rt = readingTime(content);
  const isPublished = note?.status === "published";
  const threadPosts = showPreview ? splitIntoThread(content) : [];

  return (
    <div className="max-w-2xl mx-auto pb-20">
      {note && (
        <form onSubmit={handleSave}>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={handleTitleChange}
            className="w-full border-none bg-transparent text-3xl font-bold text-white placeholder-gray-600 outline-none py-4"
          />
          <MarkdownEditor value={content} onChange={handleContentChange} minHeight="calc(100vh - 15rem)" />
        </form>
      )}

      {/* Thread preview panel */}
      {showPreview && (
        <div className="mt-8 border-t border-gray-800 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Thread preview · {threadPosts.length} posts</h3>
            <button
              onClick={() => setShowPreview(false)}
              className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
            >
              Close
            </button>
          </div>
          <div className="flex flex-col gap-1">
            {threadPosts.map((post, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                    {i + 1}
                  </div>
                  {i < threadPosts.length - 1 && (
                    <div className="w-0.5 flex-1 bg-gray-700 mt-1 min-h-4" />
                  )}
                </div>
                <div className={`flex-1 bg-gray-900 rounded-lg p-4 ${i < threadPosts.length - 1 ? "mb-2" : ""}`}>
                  <p className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">{post}</p>
                  <p className="text-xs text-gray-600 mt-2 text-right">{post.length} / 300</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={handlePublish}
              disabled={!content.trim()}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
            >
              Publish to Bluesky →
            </button>
          </div>
        </div>
      )}

      {/* Fixed footer */}
      {note && (
        <div className="fixed bottom-0 left-0 right-0 flex items-center justify-between px-6 py-3 border-t border-gray-800" style={{ backgroundColor: '#111827' }}>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>{wc} words · {rt}</span>
            {saveStatus === 'saving' && <span>Saving…</span>}
            {saveStatus === 'saved' && <span className="text-green-500">Saved</span>}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-3 py-2 rounded-lg border border-gray-800 text-gray-600 hover:border-red-800 hover:text-red-500 text-sm transition-colors"
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="px-3 py-2 rounded-lg border border-gray-700 text-gray-400 hover:bg-gray-800 text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => { setShowPreview(false); persistNote(content, title, note?.status); navigate("/"); }}
              disabled={isSaving || !content.trim()}
              className="px-3 py-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 text-sm transition-colors disabled:opacity-40"
            >
              {isSaving ? "Saving…" : "Save"}
            </button>
            {!isPublished && (
              <button
                type="button"
                onClick={() => setShowPreview(p => !p)}
                disabled={!content.trim()}
                className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
              >
                {showPreview ? "Hide preview" : "Preview as thread →"}
              </button>
            )}
            {isPublished && (
              <span className="px-3 py-2 text-xs text-blue-400 border border-blue-800/40 rounded-lg">
                Public
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


