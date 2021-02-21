import React, { useEffect, useState } from "react";
import { API } from "aws-amplify";
import { ListGroup } from "react-bootstrap";
import { Link, useHistory } from "react-router-dom";
import { useAppContext } from "../libs/contextLib";
import { BsPencilSquare } from "react-icons/bs";
import { LinkContainer } from "react-router-bootstrap";
// import parser from 'html-react-parser';
import "../styles/App.css";
import "../styles/Base.css";
import { onError } from "../libs/errorsLibs";

const parser = (content) => {
  return <div dangerouslySetInnerHTML={{ __html: content }}></div>;
};

export default function Home() {
  const [notes, setNotes] = useState([]);
  const {isAuthenticated} = useAppContext();
  const [isLoading, setIsLoading] = useState(false);

  const history = useHistory();

  function handleNoteClick(event) {
    event.preventDefault();
    history.push(event.currentTarget.getAttribute("href"));
  }

  function getNotes () {
    return API.get("notes", "/notes");
  };

  useEffect(() => {
    async function onLoad () {
      if (!isAuthenticated) {
        return;
      }

      try {
        const notes = await getNotes();
        setNotes(notes)
      } catch (error) {
        onError(error)
      }
    }
    console.log({isAuthenticated});
    onLoad();

    setIsLoading(false)
  }, [isAuthenticated]);

  function renderNotesList(notes) {
    console.log({notes});

    return (
      <div>
        {notes.map(({ noteId, content, createdAt }) => (
          <LinkContainer key={noteId} to={`/notes/${noteId}`}>
            <ListGroup.Item action>
              <span className="font-weight-bold">
                {parser(content.trim().split("\n")[0])}
              </span>
              <br />
              <span className="text-muted">
                {new Date(createdAt).toLocaleString()}
              </span>
            </ListGroup.Item>
          </LinkContainer>
        ))}
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
        <div className="notes--page-header  flex justify-between">
          <header className="text-lg">Your Notes</header>
          <div className="flex">


              <LinkContainer to="/notes/new">
              <ListGroup.Item action className="py-3 text-nowrap text-truncate flex justify-center items-center">
                <BsPencilSquare size={17} />
                <span className="ml-2 font-weight-bold">Create a new note</span>
              </ListGroup.Item>
            </LinkContainer>

          </div>
        </div>
        <ListGroup className="">
          {!isLoading && renderNotesList(notes)}
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
