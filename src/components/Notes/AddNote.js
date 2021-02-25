import React, { useRef, useState } from "react";
import Form from "react-bootstrap/Form";
import { useHistory } from 'react-router-dom';
import LoaderButton from "../Buttons/LoaderButton";
import {onError} from '../../libs/errorsLibs';
import s3Upload from "../../libs/awsLibs";
import config from '../../config';

import { API } from "aws-amplify";

export default function AddNote () {
  let file = useRef(null);
  const editorRef = useRef(null);
  const history = useHistory();
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false)
  const [title, setTitle] = useState('');


  function handleTitle(title) {
    return setTitle(title)
  }

  function validateForm() {
    return content.length > 0;
  }

  function handleChange (content) {
    return setContent(content)
  };

  function handleFileChange (event) {
    file = event.target.files[0];
  }

  async function handleSubmit(event) {
    event.preventDefault();
    let attachmentURL;
    if (file && file.size > config.MAX_ATTACHMENT_SIZE) {
      alert(
        `please pick a file smaller than ${
          config.MAX_ATTACHMENT_SIZE / 1000000
        } MB`
        );
      return;
    }

    setIsLoading(true)

  try {
    const attachment = file ? await s3Upload(file) : null;

    // if (attachment) {
    //   attachmentURL = await Storage.vault.get(attachment);
    // }
    await createNote({
      attachment,
      attachmentURL,
      title,
      content
    });
    history.push("/");
    } catch (e) {
      onError(e);
      setIsLoading(false)
    }
  }

  function createNote(note) {
    return API.post("notes", "/notes", {
      body: note,
    });
  }

  return (
    <div className="AddNote max-w-2xl p-5 rounded overflow-hidden shadow-lg w-full h-auto bg-gray-900">
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-5">
          <Form.Label htmlFor="title">Title</Form.Label>
            <Form.Control
            className="editor--title"
            value={title}
            className="editor--title"
            onChange={handleTitle}
          />
        <Form.Label htmlFor="body">Content</Form.Label>
          <Form.Control
            ref={editorRef}
            value={content}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group controlId="file" size="lg">
          <Form.Label>Attachment</Form.Label>
          <Form.Control onChange={handleFileChange} type="file" className="p-5" />
        </Form.Group>
        <br />
        <LoaderButton
          block
          type="submit"
          size="lg"
          variant="primary"
          isLoading={isLoading}
          disabled={!validateForm()}
        >
          Create
        </LoaderButton>
      </Form>
    </div>
  );
}
