import { API } from "aws-amplify";
import React, { useEffect, useState } from "react";
import { ListGroup, PageHeader } from "react-bootstrap";
import { Link } from "react-router-dom";

// import parser from 'html-react-parser';

import "../styles/App.css";
import "../styles/Base.css";

const parser = (content) => {
  return <div dangerouslySetInnerHTML={{ __html: content }}></div>;
};

export default function Home({ isAuthenticated }) {
  const [state, setState] = useState({
    loading: false,
    notes: [],
  });

  function handleNoteClick(event) {
    event.preventDefault();
    this.props.history.push(event.currentTarget.getAttribute("href"));
  }

  function notes() {
    return API.get("notes", "/notes");
  }

  const getNotes = async () => {
    try {
      const notes = await notes();
      setState({ notes });
    } catch (e) {
      alert(e);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    getNotes();
    setState({ isLoading: false });
  }, [isAuthenticated]);

  function renderNotesList(notes) {
    function displayTitle(note) {
      return !note.title ? "" : parser(note.title.toUpperCase());
    }
    function displayBodyContent(note) {
      return parser(note.content.trim().split("\n")[0]);
    }

    return (
      <div>
        <div className="grid-3x3">
          {[{}].concat(notes).map((note, i) => {
            return i !== 0 ? (
              <div className="card card--borderless" key={note.noteId}>
                {/* <section>
                      <div className="card--hero">
                        {
                          note.attachmentURL
                          ? <Image src={note.attachmentURL} thumbnail responsive alt=""/>
                          : ''
                        }
                      </div>
                    </section> */}
                <section>
                  <div className="card--header">
                    <h2>
                      <a href={`/notes/${note.noteId}`}>{displayTitle(note)}</a>
                    </h2>
                  </div>
                  <div className="card--body">
                    {!note.title ? (
                      <a href={`/notes/${note.noteId}`}>
                        {displayBodyContent(note)}
                      </a>
                    ) : (
                      displayBodyContent(note)
                    )}
                  </div>
                  <aside className="meta">
                    {new Date(note.createdAt).toLocaleString()}
                  </aside>
                </section>
              </div>
            ) : (
              /* <ListGroupItem
                  key={note.noteId}
                  href={`/notes/${note.noteId}`}
                  onClick={this.handleNoteClick}
                  header={note.content.trim().split("\n")[0]}
                >
                  {"Created: " + new Date(note.createdAt).toLocaleString()}
                </ListGroupItem>
              */
              ""
            );
          })}
        </div>
      </div>
    );
  }

  function renderLander() {
    return (
      <div className="lander-container leading-tight h-screen">
        <section className="mt-16">
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
      <div className="notes">
        <div className="notes--page-header">
          <PageHeader>Your Notes</PageHeader>
          <h4>
            <Link className="add-note" to="/notes/new">
              {"\uFF0B"} Add Note
            </Link>
          </h4>
        </div>
        <ListGroup>
          {!state.isLoading && renderNotesList(this.state.notes)}
        </ListGroup>
      </div>
    );
  }

  return (
    <div className="container mt-32">
      {isAuthenticated ? renderNotes() : renderLander()}
    </div>
  );
}
