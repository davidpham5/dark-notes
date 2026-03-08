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
    <div className="bg-iv-surface rounded-2xl p-4 border border-iv-border">
      {index > 0 && <div className="w-0.5 h-4 bg-iv-border ml-4 mb-3" />}
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-iv-accent flex items-center justify-center text-iv-bg font-bold text-sm shrink-0">
          D
        </div>
        <div className="flex-1">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={
              index === 0 ? "What's on your mind?" : "Continue your thread..."
            }
            className="w-full bg-transparent text-iv-text resize-none outline-none placeholder-iv-tertiary min-h-24"
            rows={4}
          />
          <div className="flex justify-between items-center mt-2 border-t border-iv-border pt-2">
            <span
              className={`text-sm font-mono ${
                isOver ? "text-iv-danger" : isWarning ? "text-iv-accent" : "text-iv-tertiary"
              }`}
            >
              {remaining}
            </span>
            {total > 1 && (
              <button
                onClick={onRemove}
                className="text-iv-tertiary text-sm hover:text-iv-danger transition-colors duration-150"
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
        <div className="w-10 h-10 rounded-full bg-iv-accent flex items-center justify-center text-iv-bg font-bold text-sm shrink-0">
          D
        </div>
        {!isLast && <div className="w-0.5 flex-1 bg-iv-border mt-1 min-h-6" />}
      </div>
      <div className={`flex-1 ${!isLast ? "pb-6" : ""}`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-iv-text">David Pham</span>
          <span className="text-iv-secondary text-sm">@{handle}</span>
        </div>
        <p className="text-iv-text whitespace-pre-wrap leading-relaxed">{text}</p>
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
      <div className="max-w-3xl mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-semibold text-iv-text">Preview</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setMode("compose")}
              className="px-4 py-1.5 rounded-full border border-iv-border text-iv-secondary hover:bg-iv-raised transition-all duration-150 text-sm"
            >
              ← Edit
            </button>
            <LoaderButton
              onClick={handlePublish}
              isLoading={isPublishing}
              className="px-5 py-1.5 rounded-full bg-iv-accent hover:bg-iv-accent-hover text-iv-bg text-sm font-semibold transition-all duration-150 active:scale-95"
            >
              Publish to Bluesky
            </LoaderButton>
          </div>
        </div>

        <div className="bg-iv-surface rounded-2xl p-6 border border-iv-border">
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
          <p className="mt-4 text-iv-accent text-sm text-center">
            No Bluesky account connected. Go to Settings to connect before publishing.
          </p>
        )}
      </div>
    );
  }

  // ── Compose mode ────────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-iv-text">Compose Thread</h2>
        <button
          onClick={() => setMode("preview")}
          disabled={!canPreview}
          className="px-4 py-1.5 rounded-full bg-iv-accent hover:bg-iv-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-iv-bg text-sm font-semibold transition-all duration-150 active:scale-95"
        >
          Preview →
        </button>
      </div>

      <div className="flex flex-col gap-3">
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
        className="mt-4 w-full py-3 rounded-2xl border border-dashed border-iv-border text-iv-tertiary hover:border-iv-accent hover:text-iv-accent transition-all duration-150 text-sm"
      >
        + Add post to thread
      </button>
    </div>
  );
}
