import React, { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { get, put, del } from "aws-amplify/api";
import { getUrl } from "aws-amplify/storage";
import Form from "react-bootstrap/Form";
import LoaderButton from "../Buttons/LoaderButton";
import s3Upload from "../../libs/awsLibs";
import { onError } from '../../libs/errorsLibs';
import MarkdownEditor from "./MarkdownEditor";

import config from "../../config";

const stripTags = (content) => {
  return content.replace(/(<([^>]+)>)/gi, "");
};

export default function Notes () {
  const file = useRef(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const editorRef = useRef(null);

  async function getNote() {
    const { body } = await get({ apiName: "notes", path: `/notes/${id}` }).response;
    return body.json();
  }

  async function saveNote(note) {
    await put({
      apiName: "notes",
      path: `/notes/${id}`,
      options: { body: note },
    }).response;
  }

  async function deleteNote() {
    await del({ apiName: "notes", path: `/notes/${id}` }).response;
  }

  function validateForm() {
    return content.length > 0;
  };

  function formatFilename(str) {
    return str.replace(/^\w+-/, "");
  }

  function handleContent (value) {
    return setContent(value);
  };

  function handleTitle(event) {
    return setTitle(event.target.value);
  }

  function handleCancel () {
    navigate('/')
  }
  function handleFileChange (event) {
    file.current = event.target.files[0];
  };

  async function handleSubmit (event) {
    var attachment;
    // var attachmentURL;
    event.preventDefault();

    if (file.current && file.current.size > config.MAX_ATTACHMENT_SIZE) {
      alert(
        `Please pick a file smaller than ${
          config.MAX_ATTACHMENT_SIZE / 1000000
        } MB.`
      );
      return;
    }

    setIsLoading(true);

    try {
      if (file.current) {
        attachment = await s3Upload(file.current);
      }

      await saveNote({
        content,
        title,
        attachment: attachment || note.attachment,
        // attachmentURL: attachmentURL || note.attachmentURL
      });

      navigate("/");
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
      navigate("/");
    } catch (error) {
      onError(error);
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    async function onLoad () {
      try {
        const note = await getNote();
        const { title, content, attachment } = note;
        const pristineContent = stripTags(content);

        if (attachment) {
          const { url } = await getUrl({ path: attachment, options: { accessLevel: "private" } });
          note.attachmentURL = url.toString();
        }
        setContent(pristineContent);
        setTitle(title)
        setNote(note);

      } catch (error) {
        onError(error)
      }
    }
    onLoad();
  }, []);

  return (
    <div className="AddNote">{note && (
      <Form className="max-w-5xl rounded overflow-hidden shadow-lg bg-gray-900 p-5" onSubmit={handleSubmit}>
        <Form.Group className="mb-5">
          <Form.Label htmlFor="title">Title</Form.Label>
            <Form.Control
              type="text"
              value={title}
              onChange={handleTitle}
              className="bg-white text-black p-3 rounded w-full"
            />
        </Form.Group>
        <Form.Group controlId="content" className="mb-5">
          <MarkdownEditor value={content} onChange={handleContent} />
        </Form.Group>
        <Form.Group controlId="file" className="">
          <Form.Label>Attachment</Form.Label>
          {note.attachment && (
            <p>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={note.attachmentUrl}
              >
                {formatFilename(note.attachment)}
              </a>
            </p>
          )}
          <Form.Control onChange={handleFileChange} type="file" className="p-5"/>
        </Form.Group>
        <div className="flex gap-5 mt-5">
        <LoaderButton
        block
        size="lg"
        variant="danger"
        onClick={handleDelete}
        isLoading={isDeleting}>
        Delete
      </LoaderButton>
          <div className="flex justify-end flex-auto">
          <LoaderButton
            block
            size="lg"
            variant="cancel"
            onClick={handleCancel}
          >
            Cancel
          </LoaderButton>
          <LoaderButton
          block
          size="lg"
          type="submit"
          isLoading={isLoading}
          disabled={!validateForm()}
        >
          Save
        </LoaderButton>

          </div>


        </div>

      </Form>
    )}</div>
  )
}


