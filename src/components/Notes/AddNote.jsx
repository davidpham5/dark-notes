import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { onError } from '../../libs/errorsLibs';
import MarkdownEditor from "./MarkdownEditor";
import { post } from "aws-amplify/api";
import { wordCount, readingTime } from "../../libs/noteHelpers";

export default function AddNote() {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    if (!content.trim()) return;
    setIsLoading(true);
    try {
      await post({
        apiName: "notes",
        path: "/notes",
        options: { body: { title, content, status: "draft" } },
      }).response;
      navigate("/");
    } catch (e) {
      onError(e);
      setIsLoading(false);
    }
  }

  const wc = wordCount(content);
  const rt = readingTime(content);

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto pb-20">
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border-none bg-transparent text-3xl font-bold text-white placeholder-gray-600 outline-none py-4"
      />
      <MarkdownEditor value={content} onChange={setContent} minHeight="calc(100vh - 15rem)" />
      <div className="fixed bottom-0 left-0 right-0 flex items-center justify-between px-6 py-3 border-t border-gray-800" style={{ backgroundColor: '#111827' }}>
        <span className="text-xs text-gray-600">{wc} words · {rt}</span>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="px-4 py-2 rounded-lg border border-gray-700 text-gray-400 hover:bg-gray-800 text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !content.trim()}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
          >
            {isLoading ? "Saving…" : "Save draft"}
          </button>
        </div>
      </div>
    </form>
  );
}
