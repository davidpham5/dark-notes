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
    const { noteId, title, content, createdAt, type, bskyHandle, bskyPostCount, status } = note;
    const date = new Date(createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    if (type === "bluesky") {
      const posts = content ? content.split("\n\n") : [title];
      return (
        <div key={noteId} className="rounded-xl bg-gray-900 border border-gray-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-semibold text-blue-400 bg-blue-900/30 px-2 py-0.5 rounded-full border border-blue-800/40">
              Published · Bluesky
            </span>
            <span className="text-xs text-gray-500">@{bskyHandle}</span>
            <span className="text-xs text-gray-600 ml-auto">{date}</span>
          </div>
          <div className="flex flex-col gap-3">
            {posts.slice(0, 2).map((text, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                    {bskyHandle?.[0]?.toUpperCase() ?? "B"}
                  </div>
                  {i === 0 && posts.length > 1 && (
                    <div className="w-0.5 flex-1 bg-gray-700 mt-1 min-h-3" />
                  )}
                </div>
                <p className={`text-sm text-gray-300 whitespace-pre-wrap leading-relaxed ${i === 0 && posts.length > 1 ? "pb-3" : ""}`}>
                  {text}
                </p>
              </div>
            ))}
            {bskyPostCount > 2 && (
              <p className="text-xs text-gray-600 ml-10">+{bskyPostCount - 2} more posts in thread</p>
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
        <div className="rounded-xl bg-gray-900 border border-gray-800 group-hover:border-gray-600 transition-colors px-6 py-5">
          <div className="flex items-start justify-between gap-4 mb-2">
            <h3 className="text-lg font-semibold text-white leading-snug group-hover:text-blue-300 transition-colors">
              {title || "Untitled"}
            </h3>
            {isDraft ? (
              <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full shrink-0 mt-0.5">Private</span>
            ) : (
              <span className="text-xs text-blue-400 bg-blue-900/30 border border-blue-800/40 px-2 py-0.5 rounded-full shrink-0 mt-0.5">Public</span>
            )}
          </div>
          {ex && (
            <p className="text-sm text-gray-400 leading-relaxed mb-4">{ex}</p>
          )}
          <div className="flex items-center gap-3 text-xs text-gray-600">
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
    const drafts = notes.filter(n => n.type !== "bluesky" && (!n.status || n.status === "draft"));
    const published = notes.filter(n => n.type === "bluesky" || n.status === "published");

    return (
      <div className="flex flex-col gap-8">
        {drafts.length > 0 && (
          <section>
            <h2 className="text-xs uppercase tracking-widest text-gray-600 mb-3">Private</h2>
            <div className="flex flex-col gap-3">
              {drafts.map(renderNoteCard)}
            </div>
          </section>
        )}
        {published.length > 0 && (
          <section>
            <h2 className="text-xs uppercase tracking-widest text-gray-600 mb-3">Public</h2>
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
      <div className="lander-container leading-tight h-screen">
        <section className="">
          <h1 className="lander--title font-black text-9xl">
            Dark Times <div>Require</div> Dark Notes
          </h1>
          <p className="font-light text-2xl pr-5 mr-5">
            Millions of companies of all sizes—from startups to Fortune 500s—use
            Dark Notes' software and APIs to accept forgiveness, send thoughts,
            and manage their biggest dreams online.{" "}
          </p>
        </section>
        <div className="Home--section h-80 rounded-md border-gray-600"></div>
        <div className="md:w-auto">
          <Link
            className="btn btn-primary btn-special btn-rounded "
            to="/signup"
          >
            Get Started
          </Link>
        </div>
      </div>
    );
  }

  function renderNotes() {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Your Notes</h1>
          <Link
            to="/note/new"
            className="px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 hover:border-gray-500 text-sm text-gray-300 hover:text-white transition-colors"
          >
            + New note
          </Link>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center py-24">
            <div className="w-10 h-10 border-4 border-gray-700 border-t-blue-400 rounded-full animate-spin" />
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-24 text-gray-600">
            <p className="text-lg mb-2">Nothing written yet.</p>
            <p className="text-sm">Start a note and publish it as a Bluesky thread.</p>
          </div>
        ) : (
          renderNotesList(notes)
        )}
      </div>
    );
  }

  return (
    <div className="container mt-32">
      {isAuthenticated ? renderNotes() : renderLander()}
    </div>
  );
}
