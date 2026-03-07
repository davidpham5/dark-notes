import React, { useEffect, useState } from "react";
import { get } from "aws-amplify/api";
import { ListGroup } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../libs/contextLib";
import { BsPencilSquare } from "react-icons/bs";
import { LinkContainer } from "react-router-bootstrap";
// import parser from 'html-react-parser';
import "../styles/App.css";
import "../styles/Base.css";
import { onError } from "../libs/errorsLibs";

export const parser = (content) => {
  return <div dangerouslySetInnerHTML={{ __html: content }}></div>;
};

export default function Home() {
  const [notes, setNotes] = useState([]);
  const {isAuthenticated} = useAppContext();
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  function handleNoteClick(event) {
    event.preventDefault();
    navigate(event.currentTarget.getAttribute("href"));
  }

  async function getNotes() {
    const { body } = await get({ apiName: "notes", path: "/notes" }).response;
    return body.json();
  };

  useEffect(() => {
    async function onLoad () {
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

  function renderNotesList(notes) {

    return (
      <div className="flex gap-5 flex-col">
        {notes.map(({ noteId, title, content, createdAt }) => (
          <div className="rounded overflow-hidden shadow-lg w-full h-auto bg-gray-900" key={noteId}>
            {/* <img className="w-full" alt="Sunset in the mountains" /> */}
            <div className="px-6 py-4">
              <div className="font-bold text-xl mb-2 "></div>
              <Link to={`/notes/${noteId}`} className="font-bold text-shadow-green-bold text-giant mb-2">
                {title}
              </Link>
            </div>
            {/*<div className="px-6 pt-4 pb-2">
              <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#photography</span>
              <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#travel</span>
              <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#winter</span>
            </div>
        */}
          </div>
          // <LinkContainer key={noteId} to={`/notes/${noteId}`} className="bg-white ">
          //   <ListGroup.Item action>
          //     <span className="font-weight-bold">
          //       {parser(content.trim().split("\n")[0])}
          //     </span>
          //     <span className="text-muted">
          //       {new Date(createdAt).toLocaleString()}
          //     </span>
          //   </ListGroup.Item>
          // </LinkContainer>
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
              <LinkContainer to="/note/new">
              <ListGroup.Item action className="py-3 text-nowrap text-truncate flex justify-center items-center">
                <BsPencilSquare size={17} />
                <span className="ml-2 font-weight-bold">Create a new note</span>
              </ListGroup.Item>
            </LinkContainer>
          </div>
        </div>
        <ListGroup className="">
          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <div className="w-10 h-10 border-4 border-gray-600 border-t-green-400 rounded-full animate-spin" />
            </div>
          ) : (
            renderNotesList(notes)
          )}
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
