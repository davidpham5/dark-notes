import React, { Component } from "react";
import { Link } from "react-router-dom";
import { PageHeader, ListGroup } from "react-bootstrap";
import { API } from "aws-amplify";
// import parser from 'html-react-parser';

import "../styles/App.css";
import "../styles/Base.css";

const parser = (content) => {
  return <div dangerouslySetInnerHTML={{ __html: content }}></div>;
};

export default class Home extends Component {
  state = {
    loading: false,
    notes: [],
  };

  handleNoteClick = (event) => {
    event.preventDefault();
    this.props.history.push(event.currentTarget.getAttribute("href"));
  };

  notes() {
    return API.get("notes", "/notes");
  }

  async componentDidMount() {
    if (!this.props.isAuthenticated) {
      return;
    }

    try {
      const notes = await this.notes();
      this.setState({ notes });
    } catch (e) {
      alert(e);
    }

    this.setState({ isLoading: false });
  }

  renderNotesList(notes) {
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

  renderLander() {
    return (
      <div>
        <div className="">
          <div className="lander">
            <div className="container mx-auto">
              <div className="bg-yellow mx-4 mb-4 lg:mb-16 lg:mx-12 xl:mx-16 relative">
                <div className="max-w-lg px-2 mx-auto py-20">
                  <div className="bg-dark mt-4 lg:mt-0 leading-none w-full text-center p-1 -rotate-3 text-3xl font-hand text-yellow">
                    Write something. Avoid the birds.
                  </div>
                </div>
                <p className="mt-16 text-xl">
                  Believe in you. Not your label. Are you an aspiring designer,
                  developer, marketer, or gourmet donut maker? Do you need to
                  find a way to make your designs way less boring and more
                  memorable? Well then, this course is for you.
                </p>
              </div>
            </div>
          </div>
          <div className="Home--section">
            <div className="lander-container">
              <h1 className="lander--title">
                Dark Times <div>Require</div> Dark Notes
              </h1>
              <div className="lander--subtitle">
                It's dangerous out there.
                <div>Take this with you.</div>
              </div>

              <Link
                className="btn btn-primary btn-special btn-rounded"
                to="/signup"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderNotes() {
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
          {!this.state.isLoading && this.renderNotesList(this.state.notes)}
        </ListGroup>
      </div>
    );
  }

  render() {
    return (
      <div className="Home">
        {this.props.isAuthenticated ? this.renderNotes() : this.renderLander()}
      </div>
    );
  }
}
