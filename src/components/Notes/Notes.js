import React, { useRef, useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { API, Storage } from "aws-amplify";
import Form from "react-bootstrap/Form";
import LoaderButton from "../Buttons/LoaderButton";
import s3Upload from "../../libs/awsLibs";
import { onError } from '../../libs/errorsLibs';

import "../../../node_modules/medium-editor/dist/css/medium-editor.min.css";
import "../../../node_modules/medium-editor/dist/css/themes/beagle.css";
import Editor from "react-medium-editor";
import config from "../../config";

export default function Notes () {
  const file = useRef(null);
  const { id } = useParams();
  const history = useHistory();
  const [note, setNote] = useState(null);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  function getNote() {
    return API.get("notes", `/notes/${id}`);
  }

  function saveNote(note) {
    return API.put("notes", `/notes/${id}`, {
      body: note,
    });
  }

  function deleteNote(note) {
    return API.del("notes", `/notes/${id}`);
  }

  function validateForm() {
    return content.length > 0;
  };

  function formatFilename(str) {
    return str.replace(/^\w+-/, "");
  }

  // handleChange = (content) => {
  //   this.setState({
  //     content: content,
  //     // [event.target.id]: event.target.value
  //   });
  // };

  // handleTitle(title) {
  //   this.setState({
  //     title: title,
  //   });
  // }

  function handleFileChange (event) {
    file = event.target.files[0];
  };

  async function handleSubmit (event) {
    let attachment;
    let attachmentURL;
    event.preventDefault();

    if (file && file.size > config.MAX_ATTACHMENT_SIZE) {
      alert(
        `Please pick a file smaller than ${
          config.MAX_ATTACHMENT_SIZE / 1000000
        } MB.`
      );
      return;
    }

    setIsLoading(true);

    try {
      if (file) {
        attachment = await s3Upload(file);
      }

      await saveNote({
        content,
        title: note.title,
        attachment: note.attachment,
        attachmentURL: note.attachmentURL
      });

      history.push("/");
    } catch (error) {
     onError(error)
     setIsLoading(false)
    }
  };

  async function handleDelete (event) {
    event.preventDefault();

    const confirmed = window.confirm(
      "Are you sure you want to delete this note?"
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true)

    try {
      await deleteNote();
      history.push("/");
    } catch (error) {
      onError(error);
      setIsDeleting(false);
    }
  };

  // async componentDidMount() {
  //   try {
  //     let attachmentURL;
  //     const note = await this.getNote();
  //     const { content, title, attachment } = note;

  //     if (attachment) {
  //       attachmentURL = await Storage.vault.get(attachment);
  //     }

  //     this.setState({
  //       note,
  //       content,
  //       title,
  //       attachmentURL,
  //     });
  //   } catch (e) {
  //     alert(e);
  //   }
  // }

  // render() {
  //   return (
  //     <div className="UpdateNotes">
  //       {this.state.note && (
  //         <form onSubmit={this.handleSubmit}>
  //           <FormGroup controlId="content">
  //             <label htmlFor="title">Title</label>
  //             <Editor
  //               id="title"
  //               text={this.state.title}
  //               className="editor--title"
  //               value={this.state.title}
  //               onChange={this.handleTitle}
  //               options={{
  //                 toolbar: {
  //                   buttons: [
  //                     "bold",
  //                     "italic",
  //                     "underline",
  //                     "h1",
  //                     "h2",
  //                     "h3",
  //                     "anchor",
  //                     "quote",
  //                   ],
  //                 },
  //                 autoLink: true,
  //                 targetBlank: true,
  //                 placeholder: {
  //                   text: "Title",
  //                 },
  //               }}
  //             />
  //             <label htmlFor="body">Content</label>
  //             <Editor
  //               id="body"
  //               text={this.state.content}
  //               onChange={this.handleChange}
  //               value={this.state.content}
  //               options={{
  //                 toolbar: {
  //                   buttons: [
  //                     "bold",
  //                     "italic",
  //                     "underline",
  //                     "h1",
  //                     "h2",
  //                     "h3",
  //                     "anchor",
  //                     "quote",
  //                   ],
  //                 },
  //                 autoLink: true,
  //                 targetBlank: true,
  //                 placeholder: {
  //                   text: "Tell me a story",
  //                 },
  //               }}
  //             />
  //             {/* <FormControl
  //               className="editable"
  //               onChange={this.handleChange}
  //               value={this.state.content}
  //               componentClass="textarea"
  //             />*/}
  //           </FormGroup>
  //           {/* {this.state.note.attachment &&
  //             <FormGroup>
  //               <ControlLabel>Attachment</ControlLabel>
  //               <FormControl.Static style={{display: 'flex', flexDirection: 'column'}}>
  //                 <a target="_blank" rel="noopener noreferrer" href={this.state.attachmentURL}>
  //                   {this.formatFilename(this.state.note.attachment)}
  //                 </a>
  //                 <Image src={this.state.attachmentURL} thumbnail responsive alt=""/>
  //               </FormControl.Static>
  //             </FormGroup>
  //           } */}

  //           {/* <FormGroup controlId="file">
  //             {!this.state.note.attachment &&
  //               <ControlLabel>Attachment</ControlLabel>
  //             }
  //             <FormControl onChange={this.handleFileChange} type="file" />
  //           </FormGroup> */}
  //           <div className="form--action-buttons">
  //             <LoaderButton
  //               bsStyle="primary"
  //               bsSize="large"
  //               disabled={!this.validateForm()}
  //               type="submit"
  //               isLoading={this.state.isLoading}
  //               text="Save"
  //               loadingText="Saving…"
  //             />

  //             <LoaderButton
  //               bsStyle="danger"
  //               bsSize="large"
  //               isLoading={this.state.isDeleting}
  //               onClick={this.handleDelete}
  //               text="Delete"
  //               loadingText="Deleting…"
  //             />
  //           </div>
  //         </form>
  //       )}
  //     </div>
  //   );
  // }
  useEffect(() => {
    function getNote () {
      return API.get('notes', `/notes/${id}`);
    }

    async function onLoad () {
      try {
        const note = await getNote();
        const { content, attachment } = note;

        if ( attachment ) {
          note.attachmentUrl = await Storage.vault.get(attachment)
        }
        setContent(content);
        setNote(note);
        console.log({note, content});
      } catch (error) {
        onError(error)
      }
    }
    onLoad();
  }, []);

  return (
    <div className="">{note && (
      <Form className="max-w-sm rounded overflow-hidden shadow-lg w-full h-auto bg-gray-900 p-5" onSubmit={handleSubmit}>
        <Form.Group controlId="content">
          <Form.Control
            as="textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="file">
          <Form.Label>Attachment</Form.Label>
          {note.attachment && (
            <p>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={note.attachmentURL}
              >
                {formatFilename(note.attachment)}
              </a>
            </p>
          )}
          <Form.Control onChange={handleFileChange} type="file" />
        </Form.Group>
        <LoaderButton
          block
          size="lg"
          type="submit"
          isLoading={isLoading}
          disabled={!validateForm()}
        >
          Save
        </LoaderButton>
        <LoaderButton
          block
          size="lg"
          variant="danger"
          onClick={handleDelete}
          isLoading={isDeleting}
        >
          Delete
        </LoaderButton>
      </Form>
    )}</div>
  )
}


