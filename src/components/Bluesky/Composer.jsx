import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { post as apiPost, put } from "aws-amplify/api";
import { publishThread, getBlueskySession } from "../../libs/blueskyLib";
import { onError } from "../../libs/errorsLibs";
import LoaderButton from "../Buttons/LoaderButton";

const MAX_CHARS = 300;

// ─── Post editor card (compose mode) ─────────────────────────────────────────

function PostEditor({ value, index, total, onChange, onRemove }) {
  const remaining = MAX_CHARS - value.length;
  const isOver = remaining < 0;
  const isWarning = remaining >= 0 && remaining < 25;

  return (
    <div className="bg-gray-900 rounded-lg p-4">
      {index > 0 && <div className="w-0.5 h-4 bg-gray-600 ml-4 mb-3" />}
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          D
        </div>
        <div className="flex-1">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={
              index === 0 ? "What's on your mind?" : "Continue your thread..."
            }
            className="w-full bg-transparent text-white resize-none outline-none placeholder-gray-500 min-h-24"
            rows={4}
          />
          <div className="flex justify-between items-center mt-2 border-t border-gray-700 pt-2">
            <span
              className={`text-sm font-mono ${
                isOver
                  ? "text-red-400"
                  : isWarning
                  ? "text-yellow-400"
                  : "text-gray-500"
              }`}
            >
              {remaining}
            </span>
            {total > 1 && (
              <button
                onClick={onRemove}
                className="text-gray-500 text-sm hover:text-red-400 transition-colors"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Bluesky-style preview card ───────────────────────────────────────────────

function BlueskyCard({ text, handle, isLast }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          D
        </div>
        {!isLast && <div className="w-0.5 flex-1 bg-gray-600 mt-1 min-h-6" />}
      </div>
      <div className={`flex-1 ${!isLast ? "pb-6" : ""}`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-bold text-white">David Pham</span>
          <span className="text-gray-400 text-sm">@{handle}</span>
        </div>
        <p className="text-white whitespace-pre-wrap leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

// ─── Main Composer ────────────────────────────────────────────────────────────

export default function Composer() {
  const navigate = useNavigate();
  const location = useLocation();
  const { noteId, posts: initialPosts } = location.state || {};
  const [posts, setPosts] = useState(initialPosts?.length ? initialPosts : [""]);
  const [mode, setMode] = useState(initialPosts?.length ? "preview" : "compose");
  const [isPublishing, setIsPublishing] = useState(false);
  const session = getBlueskySession();

  function updatePost(index, value) {
    const updated = [...posts];
    updated[index] = value;
    setPosts(updated);
  }

  function addPost() {
    setPosts([...posts, ""]);
  }

  function removePost(index) {
    setPosts(posts.filter((_, i) => i !== index));
  }

  const filledPosts = posts.filter((p) => p.trim());
  const canPreview =
    filledPosts.length > 0 && posts.every((p) => p.length <= MAX_CHARS);

  async function markNotePublished(nId) {
    await put({
      apiName: "notes",
      path: `/notes/${nId}`,
      options: { body: { status: "published" } },
    }).response;
  }

  async function saveThreadAsNote(filledPosts) {
    const { body } = await apiPost({
      apiName: "notes",
      path: "/notes",
      options: {
        body: {
          title: filledPosts[0].substring(0, 80),
          content: filledPosts.join("\n\n"),
          type: "bluesky",
          bskyHandle: session.handle,
          bskyPostCount: filledPosts.length,
        },
      },
    }).response;
    return body.json();
  }

  async function handlePublish() {
    if (!session) {
      alert(
        "Please connect your Bluesky account in Settings before publishing."
      );
      return;
    }
    setIsPublishing(true);
    try {
      await publishThread(posts);
      if (noteId) {
        await markNotePublished(noteId);
      } else {
        await saveThreadAsNote(filledPosts);
      }
      navigate("/");
    } catch (e) {
      onError(e);
      setIsPublishing(false);
    }
  }

  // ── Preview mode ────────────────────────────────────────────────────────────
  if (mode === "preview") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold">Preview</h2>
          <div className="flex gap-3">
            <button
              onClick={() => setMode("compose")}
              className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:border-gray-400 transition-colors text-sm"
            >
              ← Edit
            </button>
            <LoaderButton
              onClick={handlePublish}
              isLoading={isPublishing}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm transition-colors"
            >
              Publish to Bluesky
            </LoaderButton>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-6">
          {filledPosts.map((post, i) => (
            <BlueskyCard
              key={i}
              text={post}
              handle={session?.handle ?? "you.bsky.social"}
              isLast={i === filledPosts.length - 1}
            />
          ))}
        </div>

        {!session && (
          <p className="mt-4 text-yellow-400 text-sm text-center">
            No Bluesky account connected. Go to Settings to connect before
            publishing.
          </p>
        )}
      </div>
    );
  }

  // ── Compose mode ────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Compose Thread</h2>
        <button
          onClick={() => setMode("preview")}
          disabled={!canPreview}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm transition-colors"
        >
          Preview →
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {posts.map((post, i) => (
          <PostEditor
            key={i}
            value={post}
            index={i}
            total={posts.length}
            onChange={(val) => updatePost(i, val)}
            onRemove={() => removePost(i)}
          />
        ))}
      </div>

      <button
        onClick={addPost}
        className="mt-4 w-full py-3 rounded-lg border border-dashed border-gray-600 text-gray-400 hover:border-blue-500 hover:text-blue-400 transition-colors text-sm"
      >
        + Add post to thread
      </button>
    </div>
  );
}
