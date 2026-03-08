import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { onError } from "../../libs/errorsLibs";
import ProseEditor from "./ProseEditor";
import { post } from "aws-amplify/api";
import { wordCount, readingTime } from "../../libs/noteHelpers";

export default function AddNote() {
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");

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
    <div className="container">
      {" "}
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto pb-20">
        <input
          type="text"
          placeholder="Give it a title…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border-none bg-transparent text-4xl font-light text-iv-text placeholder-iv-tertiary outline-none pt-6 pb-4"
        />
        <hr className="border-iv-border mb-6" />
        <ProseEditor value={content} onChange={setContent} />
        <div
          className="fixed bottom-0 left-0 right-0 flex items-center justify-between px-6 py-3 border-t border-iv-border backdrop-blur-xl"
          style={{ backgroundColor: "rgba(1,2,30,0.88)" }}
        >
          <span className="text-xs text-iv-tertiary">
            {wc} words · {rt}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="px-3 py-1.5 rounded-full border border-iv-border text-iv-secondary hover:bg-iv-raised text-sm transition-all duration-150"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !content.trim()}
              className="px-4 py-1.5 rounded-full bg-iv-accent hover:bg-iv-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-iv-bg text-sm font-semibold transition-all duration-150 active:scale-95"
            >
              {isLoading ? "Saving…" : "Save draft"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
