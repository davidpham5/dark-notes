import React, { useRef, useState } from "react";
import Form from "react-bootstrap/Form";
import { useNavigate } from 'react-router-dom';
import LoaderButton from "../Buttons/LoaderButton";
import {onError} from '../../libs/errorsLibs';
import s3Upload from "../../libs/awsLibs";
import config from '../../config';
import MarkdownEditor from "./MarkdownEditor";

import { post } from "aws-amplify/api";

export default function AddNote () {
  let file = useRef(null);
  const editorRef = useRef(null);
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false)
  const [title, setTitle] = useState('');


  function handleTitle(event) {
    return setTitle(event.target.value)
  }

  function validateForm() {
    return content.length > 0;
  }

  function handleChange (value) {
    return setContent(value)
  };

  function handleFileChange (event) {
    file.current = event.target.files[0];
  }

  async function handleSubmit(event) {
    event.preventDefault();
    let attachmentURL;
    if (file.current && file.current.size > config.MAX_ATTACHMENT_SIZE) {
      alert(
        `please pick a file smaller than ${
          config.MAX_ATTACHMENT_SIZE / 1000000
        } MB`
        );
      return;
    }

    setIsLoading(true)

  try {
    const attachment = file.current ? await s3Upload(file.current) : null;

    // if (attachment) {
    //   attachmentURL = await Storage.vault.get(attachment);
    // }
    await createNote({
      attachment,
      attachmentURL,
      title,
      content
    });
    navigate("/");
    } catch (e) {
      onError(e);
      setIsLoading(false)
    }
  }

  async function createNote(note) {
    const { body } = await post({
      apiName: "notes",
      path: "/notes",
      options: { body: note },
    }).response;
    return body.json();
  }

  return (
    <div className="AddNote max-w-2xl p-5 rounded overflow-hidden shadow-lg w-full h-auto bg-gray-900">
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-5">
          <Form.Label htmlFor="title">Title</Form.Label>
            <Form.Control
              value={title}
              onChange={handleTitle}
              className="bg-white text-black p-3 rounded w-full"
            />
        <Form.Label htmlFor="body">Content</Form.Label>
          <MarkdownEditor value={content} onChange={handleChange} />
        </Form.Group>

        <Form.Group controlId="file">
          <Form.Label>Attachment</Form.Label>
          <Form.Control onChange={handleFileChange} type="file" className="p-5" />
        </Form.Group>
        <br />
        <LoaderButton
          block
          type="submit"
         
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
