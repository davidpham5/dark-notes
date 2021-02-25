import React, { useRef, useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { API, Storage } from "aws-amplify";
import Form from "react-bootstrap/Form";
import LoaderButton from "../Buttons/LoaderButton";
import s3Upload from "../../libs/awsLibs";
import { onError } from '../../libs/errorsLibs';

import config from "../../config";

const stripTags = (content) => {
  return content.replace(/(<([^>]+)>)/gi, "");
};

export default function Notes () {
  const file = useRef(null);
  const { id } = useParams();
  const history = useHistory();
  const [note, setNote] = useState(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const editorRef = useRef(null);

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

  function handleContent (content) {
    return setContent(content)
  };

  function handleTitle(title) {
    return setTitle(title)
  }

  function handleCancel () {
    history.push('/')
  }
  function handleFileChange (event) {
    file.current = event.target.files[0];
  };

  async function handleSubmit (event) {
    var attachment;
    // var attachmentURL;
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
        title,
        attachment: attachment || note.attachment,
        // attachmentURL: attachmentURL || note.attachmentURL
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

  useEffect(() => {
    function getNote () {
      return API.get('notes', `/notes/${id}`);
    }

    async function onLoad () {
      try {
        const note = await getNote();
        const { title, content, attachment } = note;
        const pristineContent = stripTags(content);

        if (attachment) {
          note.attachmentURL = await Storage.vault.get(attachment);
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
    <div className="">{note && (
      <Form className="max-w-5xl rounded overflow-hidden shadow-lg bg-gray-900 p-5" onSubmit={handleSubmit}>
        <Form.Group className="mb-5">
          <Form.Label htmlFor="title">Title</Form.Label>
            <Form.Control
              className="bg-white text-black p-3 rounded"
              value={title}
              onChange={handleTitle}
            />
        </Form.Group>
        <Form.Group controlId="content" className="mb-5">
          <Form.Control
            ref={editorRef}
            text={content}
            onChange={handleContent}
            className="bg-white text-black p-3 rounded"
          />
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
          <Form.Control onChange={handleFileChange} type="file" />
        </Form.Group>
        <div className="flex gap-5 mt-5">
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
            variant="cancel"
            onClick={handleCancel}
          >
            Cancel
          </LoaderButton>
          <div className="flex justify-end flex-auto">
            <LoaderButton
              block
              size="lg"
              variant="danger"
              onClick={handleDelete}
              isLoading={isDeleting}>
              Delete
            </LoaderButton>
          </div>
        </div>

      </Form>
    )}</div>
  )
}


