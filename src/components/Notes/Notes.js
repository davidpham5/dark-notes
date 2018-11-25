import React, { Component } from 'react'
import { API, Storage } from 'aws-amplify'
import config from '../../config'
import { FormGroup, FormControl, ControlLabel, Image } from "react-bootstrap";
import LoaderButton from "../Buttons/LoaderButton";
import s3Upload from "../../libs/awsLibs";
import '../../../node_modules/medium-editor/dist/css/medium-editor.min.css'
import '../../../node_modules/medium-editor/dist/css/themes/beagle.css'
import Editor from 'react-medium-editor'
class Notes extends Component {
  constructor (props) {
    super(props)

    this.file = null
    this.state = {
      isLoading: null,
      isDeleting: null,
      note: null,
      content: '',
      title: '',
      attachmentURL: null
    }
    this.getNote = this.getNote.bind(this)
    this.validateForm = this.validateForm.bind(this)
    this.formatFilename = this.formatFilename.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleTitle = this.handleTitle.bind(this)
    this.handleFileChange = this.handleFileChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
    this.saveNote = this.saveNote.bind(this)
    this.deleteNote = this.deleteNote.bind(this)
    this.handleDete = this.handleDelete.bind(this)
  }

  getNote () {
    return API.get('notes', `/notes/${this.props.match.params.id}`)
  }

  saveNote (note) {
    return API.put('notes', `/notes/${this.props.match.params.id}`, {
      body: note
    })
  }

  deleteNote (note) {
    return API.del('notes', `/notes/${this.props.match.params.id}`)
  }

  validateForm () {
    return this.state.content.length > 0
  }

  formatFilename (str) {
    return str.replace(/^\w+-/, '')
  }

  handleChange = (content) => {
    this.setState({
      content: content
      // [event.target.id]: event.target.value
    })
  }

  handleTitle (title) {
    this.setState({
      title: title
    })
  }

  handleFileChange =  (event) => {
    this.file = event.target.files[0]
  }

  handleSubmit = async (event) => {
    let attachment
    let attachmentURL
    event.preventDefault()

    if (this.file && this.file.size > config.MAX_ATTACHMENT_SIZE) {
      alert (`Please pick a file smaller than ${config.MAX_ATTACHMENT_SIZE/1000000} MB.`)
      return
    }

    this.setState({ isLoading: true })

    try {
      if (this.file) {
        attachment = await s3Upload(this.file)
      }

      await this.saveNote({
        content: this.state.content,
        title: this.state.title,
        attachment: attachment || this.state.note.attachment,
        attachmentURL: attachmentURL || this.state.attachmentURL
      })

      this.props.history.push('/')
    } catch (error) {
      console.log(error)
      this.setState({ isLoading: false })
    }
  }

  handleDelete = async (event) => {
    event.preventDefault()

    const confirmed = window.confirm('Are you sure you want to delete this note?')

    if (!confirmed) {
      return
    }

    this.setState( {isDeleting: true} )

    try {
      await this.deleteNote()
      this.props.history.push('/')
    } catch (error) {
      console.log(error)
      this.setState({ isDeleting: false })
    }
  }

  async componentDidMount () {
    try {
      let attachmentURL
      const note = await this.getNote()
      const { content, title, attachment } = note

      if (attachment) {
        attachmentURL = await Storage.vault.get(attachment)
      }

      this.setState({
        note,
        content,
        title,
        attachmentURL
      })
    } catch (e) {
      alert(e)
    }
  }

  render () {
    return (
      <div className="UpdateNotes">
        {this.state.note &&
          <form onSubmit={this.handleSubmit}>
            <FormGroup controlId="content">
              <label htmlFor='title'>Title</label>
              <Editor
              id="title"
              text={this.state.title}
              className='editor--title'
              value={this.state.title}
              onChange={this.handleTitle}
              options={{
                toolbar: {
                  buttons: [
                    'bold',
                    'italic',
                    'underline',
                    'h1', 'h2', 'h3',
                    'anchor',
                    'quote'
                  ]
                },
                autoLink: true,
                targetBlank: true,
                placeholder: {
                  text: 'Title'
                }
              }}
            />
            <label htmlFor='body'>Content</label>
            <Editor
                id='body'
                text={this.state.content}
                onChange={this.handleChange}
                value={this.state.content}
                options={{
                  toolbar: {
                    buttons: [
                      'bold',
                      'italic',
                      'underline',
                      'h1', 'h2', 'h3',
                      'anchor',
                      'quote'
                    ]
                  },
                  autoLink: true,
                  targetBlank: true,
                  placeholder: {
                    text: 'Tell me a story'
                  }
                }}
            />
              {/* <FormControl
                className="editable"
                onChange={this.handleChange}
                value={this.state.content}
                componentClass="textarea"
              />*/}
            </FormGroup>
            {/* {this.state.note.attachment &&
              <FormGroup>
                <ControlLabel>Attachment</ControlLabel>
                <FormControl.Static style={{display: 'flex', flexDirection: 'column'}}>
                  <a target="_blank" rel="noopener noreferrer" href={this.state.attachmentURL}>
                    {this.formatFilename(this.state.note.attachment)}
                  </a>
                  <Image src={this.state.attachmentURL} thumbnail responsive alt=""/>
                </FormControl.Static>
              </FormGroup>
            } */}

            {/* <FormGroup controlId="file">
              {!this.state.note.attachment &&
                <ControlLabel>Attachment</ControlLabel>
              }
              <FormControl onChange={this.handleFileChange} type="file" />
            </FormGroup> */}
            <div className="form--action-buttons">
              <LoaderButton bsStyle="primary" bsSize="large" disabled={!this.validateForm()}
                type="submit" isLoading={this.state.isLoading} text="Save" loadingText="Saving…"/>

              <LoaderButton bsStyle="danger" bsSize="large" isLoading={this.state.isDeleting}
              onClick={this.handleDelete} text="Delete" loadingText="Deleting…"/>
            </div>
          </form>
        }
      </div>
    )
  }
}

export default Notes
