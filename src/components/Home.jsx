import React, { useEffect, useState } from "react";
import { get } from "aws-amplify/api";
import { Link } from "react-router-dom";
import { useAppContext } from "../libs/contextLib";
import "../styles/App.css";
import "../styles/Base.css";
import { onError } from "../libs/errorsLibs";
import { wordCount, readingTime, excerpt } from "../libs/noteHelpers";

export const parser = (content) => {
  return <div dangerouslySetInnerHTML={{ __html: content }}></div>;
};

export default function Home() {
  const [notes, setNotes] = useState([]);
  const { isAuthenticated } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);

  async function getNotes() {
    const { body } = await get({ apiName: "notes", path: "/notes" }).response;
    return body.json();
  }

  useEffect(() => {
    async function onLoad() {
      if (!isAuthenticated) {
        return;
      }

      setIsLoading(true);
      try {
        const notes = await getNotes();
        setNotes(notes);
      } catch (error) {
        onError(error);
      } finally {
        setIsLoading(false);
      }
    }

    onLoad();
  }, [isAuthenticated]);

  function renderNoteCard(note) {
    const {
      noteId,
      title,
      content,
      createdAt,
      type,
      bskyHandle,
      bskyPostCount,
      status,
    } = note;
    const date = new Date(createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    if (type === "bluesky") {
      const posts = content ? content.split("\n\n") : [title];
      return (
        <div
          key={noteId}
          className="rounded-2xl bg-iv-surface border border-iv-border p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-semibold text-iv-accent bg-iv-raised px-2.5 py-0.5 rounded-full border border-iv-border">
              Public · Bluesky
            </span>
            <span className="text-xs text-iv-secondary">@{bskyHandle}</span>
            <span className="text-xs text-iv-tertiary ml-auto">{date}</span>
          </div>
          <div className="flex flex-col gap-3">
            {posts.slice(0, 2).map((text, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-iv-accent flex items-center justify-center text-iv-bg font-bold text-xs shrink-0">
                    {bskyHandle?.[0]?.toUpperCase() ?? "B"}
                  </div>
                  {i === 0 && posts.length > 1 && (
                    <div className="w-0.5 flex-1 bg-iv-border mt-1 min-h-3" />
                  )}
                </div>
                <p
                  className={`text-sm text-iv-text whitespace-pre-wrap leading-relaxed ${i === 0 && posts.length > 1 ? "pb-3" : ""}`}
                >
                  {text}
                </p>
              </div>
            ))}
            {bskyPostCount > 2 && (
              <p className="text-xs text-iv-tertiary ml-10">
                +{bskyPostCount - 2} more posts in thread
              </p>
            )}
          </div>
        </div>
      );
    }

    const wc = wordCount(content);
    const rt = readingTime(content);
    const ex = excerpt(content);
    const isDraft = !status || status === "draft";

    return (
      <Link key={noteId} to={`/notes/${noteId}`} className="block group">
        <div className="rounded-2xl bg-iv-surface border border-iv-border px-6 py-5 transition-all duration-150 group-hover:border-iv-tertiary group-hover:-translate-y-px">
          <div className="flex items-start justify-between gap-4 mb-2">
            <h3 className="text-base font-semibold  leading-snug transition-colors duration-150">
              {title || "Untitled"}
            </h3>
            {isDraft ? (
              <span className="text-xs text-iv-tertiary bg-iv-raised px-2.5 py-0.5 rounded-full shrink-0 mt-0.5">
                Private
              </span>
            ) : (
              <span className="text-xs text-iv-accent bg-iv-raised border border-iv-border px-2.5 py-0.5 rounded-full shrink-0 mt-0.5">
                Public
              </span>
            )}
          </div>
          {ex && (
            <p className="text-sm text-iv-secondary leading-relaxed mb-4">
              {ex}
            </p>
          )}
          <div className="flex items-center gap-2 text-xs text-iv-tertiary">
            <span>{date}</span>
            <span>·</span>
            <span>{wc} words</span>
            <span>·</span>
            <span>{rt}</span>
          </div>
        </div>
      </Link>
    );
  }

  function renderNotesList(notes) {
    const drafts = notes.filter(
      (n) => n.type !== "bluesky" && (!n.status || n.status === "draft"),
    );
    const published = notes.filter(
      (n) => n.type === "bluesky" || n.status === "published",
    );

    return (
      <div className="flex flex-col gap-10">
        {drafts.length > 0 && (
          <section>
            <div className="flex flex-col gap-3">
              {drafts.map(renderNoteCard)}
            </div>
          </section>
        )}
        {published.length > 0 && (
          <section>
            <h2 className="text-xs uppercase tracking-widest text-iv-tertiary mb-4 font-medium">
              Public
            </h2>
            <div className="flex flex-col gap-3">
              {published.map(renderNoteCard)}
            </div>
          </section>
        )}
      </div>
    );
  }

  function renderLander() {
    return (
      <div className="min-h-screen flex flex-col justify-center max-w-3xl mx-auto px-6 py-24">
        <h1 className="text-5xl font-bold text-iv-text leading-tight mb-6">
          Dark Times Require
          <br />
          Dark Notes
        </h1>
        <p className="text-lg text-iv-secondary leading-relaxed mb-10 max-w-md">
          A place to write long-form thoughts before publishing them as Bluesky
          threads.
        </p>
        <Link
          to="/signup"
          className="inline-flex items-center px-6 py-3 rounded-full bg-iv-accent hover:bg-iv-accent-hover text-iv-bg font-semibold text-sm transition-all duration-150 active:scale-95 w-fit"
        >
          Get started
        </Link>
      </div>
    );
  }

  function renderNotes() {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-semibold text-iv-text">Notes</h1>
          <Link
            to="/note/new"
            className="px-4 py-2 rounded-full bg-iv-text hover:bg-iv-accent-hover text-iv-bg text-sm font-semibold transition-all duration-150 active:scale-95"
          >
            + Blah Blah Blah
          </Link>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center py-24">
            <div className="w-8 h-8 border-2 border-iv-border border-t-iv-accent rounded-full animate-spin" />
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-iv-secondary mb-1">Nothing written yet.</p>
            <p className="text-sm text-iv-tertiary">
              Start a note and publish it as a Bluesky thread.
            </p>
          </div>
        ) : (
          renderNotesList(notes)
        )}
      </div>
    );
  }

  return (
    <div className="container">
      {isAuthenticated ? renderNotes() : renderLander()}
    </div>
  );
}
