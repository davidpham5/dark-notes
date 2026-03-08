import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { get, put, del } from "aws-amplify/api";
import { onError } from "../../libs/errorsLibs";
import ProseEditor from "./ProseEditor";
import { splitIntoThread } from "../../libs/threadSplitter";
import { wordCount, readingTime } from "../../libs/noteHelpers";

export default function Notes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [saveStatus, setSaveStatus] = useState(""); // '' | 'saving' | 'saved'
  const [showPreview, setShowPreview] = useState(false);
  const autoSaveTimer = useRef(null);

  async function loadNote() {
    try {
      const { body } = await get({ apiName: "notes", path: `/notes/${id}` })
        .response;
      const data = await body.json();
      const plain = data.content
        ? data.content.replace(/(<([^>]+)>)/gi, "")
        : "";
      setContent(plain);
      setTitle(data.title || "");
      setNote(data);
    } catch (error) {
      onError(error);
    }
  }

  async function persistNote(updatedContent, updatedTitle, status) {
    await put({
      apiName: "notes",
      path: `/notes/${id}`,
      options: {
        body: {
          content: updatedContent,
          title: updatedTitle,
          status: status || "draft",
        },
      },
    }).response;
  }

  function scheduleAutoSave(newContent, newTitle, currentStatus) {
    clearTimeout(autoSaveTimer.current);
    setSaveStatus("");
    autoSaveTimer.current = setTimeout(async () => {
      setSaveStatus("saving");
      try {
        await persistNote(newContent, newTitle, currentStatus);
        setSaveStatus("saved");
      } catch (e) {
        setSaveStatus("");
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
  const threadPosts = content.trim() ? splitIntoThread(content) : [];
  const postCount = threadPosts.length;

  return (
    <div className="container">
      <div className="max-w-3xl mx-auto pb-20">
        {note && (
          <form onSubmit={handleSave}>
            <input
              type="text"
              placeholder="Give it a title…"
              value={title}
              onChange={handleTitleChange}
              className="w-full border-none bg-transparent text-4xl font-light text-iv-text placeholder-iv-tertiary outline-none pt-6 pb-4"
            />
            <hr className="border-iv-border mb-6" />
            <ProseEditor value={content} onChange={handleContentChange} />
          </form>
        )}

        {/* Thread preview panel */}
        {showPreview && threadPosts.length > 0 && (
          <div className="mt-8 border-t border-iv-border pt-6 animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xs font-medium text-iv-tertiary uppercase tracking-widest">
                Thread preview · {threadPosts.length} posts
              </h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-xs text-iv-tertiary hover:text-iv-secondary transition-colors duration-150"
              >
                Close
              </button>
            </div>
            <div className="flex flex-col gap-1">
              {threadPosts.map((post, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-iv-accent flex items-center justify-center text-iv-bg font-bold text-xs shrink-0">
                      {i + 1}
                    </div>
                    {i < threadPosts.length - 1 && (
                      <div className="w-0.5 flex-1 bg-iv-border mt-1 min-h-4" />
                    )}
                  </div>
                  <div
                    className={`flex-1 bg-iv-surface rounded-2xl p-4 ${i < threadPosts.length - 1 ? "mb-2" : ""}`}
                  >
                    <p className="text-sm text-iv-text whitespace-pre-wrap leading-relaxed">
                      {post}
                    </p>
                    <p
                      className={`text-xs mt-2 text-right ${post.length > 270 ? "text-iv-accent" : "text-iv-tertiary"}`}
                    >
                      {post.length} / 300
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={handlePublish}
                disabled={!content.trim()}
                className="px-5 py-2.5 rounded-full bg-iv-accent hover:bg-iv-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-iv-bg text-sm font-semibold transition-all duration-150 active:scale-95"
              >
                Publish to Bluesky →
              </button>
            </div>
          </div>
        )}

        {/* Fixed footer */}
        {note && (
          <div
            className="fixed bottom-0 left-0 right-0 flex items-center justify-between px-6 py-3 border-t border-iv-border backdrop-blur-xl"
            style={{ backgroundColor: "rgba(1,2,30,0.88)" }}
          >
            <div className="flex items-center gap-3 text-xs text-iv-tertiary">
              <span>
                {wc} words · {rt}
              </span>
              {postCount > 0 && (
                <span className="text-iv-accent">
                  ~{postCount} {postCount === 1 ? "post" : "posts"}
                </span>
              )}
              {saveStatus === "saving" && (
                <span className="animate-pulse">Saving…</span>
              )}
              {saveStatus === "saved" && (
                <span className="text-iv-success">Saved</span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-3 py-1.5 rounded-full text-iv-tertiary hover:text-iv-danger text-sm transition-colors duration-150"
              >
                {isDeleting ? "Deleting…" : "Delete"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="px-3 py-1.5 rounded-full border border-iv-border text-iv-secondary hover:bg-iv-raised text-sm transition-all duration-150"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPreview(false);
                  persistNote(content, title, note?.status);
                  navigate("/");
                }}
                disabled={isSaving || !content.trim()}
                className="px-3 py-1.5 rounded-full border border-iv-border text-iv-secondary hover:bg-iv-raised text-sm transition-all duration-150 disabled:opacity-40"
              >
                {isSaving ? "Saving…" : "Save"}
              </button>
              {!isPublished && (
                <button
                  type="button"
                  onClick={() => setShowPreview((p) => !p)}
                  disabled={!content.trim()}
                  className="px-4 py-1.5 rounded-full bg-iv-accent hover:bg-iv-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-iv-bg text-sm font-semibold transition-all duration-150 active:scale-95"
                >
                  {showPreview ? "Hide preview" : "Preview as thread →"}
                </button>
              )}
              {isPublished && (
                <span className="px-3 py-1.5 text-xs text-iv-accent border border-iv-border rounded-full">
                  Public
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
