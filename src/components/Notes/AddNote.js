import React, { Component } from 'react'
import { FormGroup, FormControl, ControlLabel, Image } from 'react-bootstrap'
import LoaderButton from '../Buttons/LoaderButton'
import config from '../../config'
import { API, Storage } from 'aws-amplify'
import s3Upload from '../../libs/awsLibs'
import '../../../node_modules/medium-editor/dist/css/medium-editor.min.css'
import '../../../node_modules/medium-editor/dist/css/themes/beagle.css'
import Editor from 'react-medium-editor'

class AddNote extends Component {
  constructor (props) {
    super(props)

    this.file = null
    this.state = {
      isLoading: null,
      content: '',
      title: '',
      attachmentURL: null
    }
    this.validateForm = this.validateForm.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleFileChange = this.handleFileChange.bind(this)
    this.createNote = this.createNote.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleTitle = this.handleTitle.bind(this)
    this.editorRef = React.createRef()
  }

  createNote (note) {
    return API.post('notes', '/notes', {
      body: note
    })
  }

  validateForm () {
    return this.state.content.length > 0
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

  handleFileChange (event) {
    this.file = event.target.files[0]
  }

  async handleSubmit (event) {
    event.preventDefault()
    let attachmentURL;
    if (this.file && this.file.size > config.MAX_ATTACHMENT_SIZE) {
      alert(`please pick a file smaller than ${config.MAX_ATTACHMENT_SIZE / 1000000} MB`)
      return
    }

    this.setState({ isLoading: true })

    try {
      const attachment = this.file
        ? await s3Upload(this.file)
        : null

      if (attachment) {
        attachmentURL = await Storage.vault.get(attachment)
      }
      await this.createNote({
        attachment: attachment,
        attachmentURL: attachmentURL || this.state.attachmentURL,
        title: this.state.title,
        content: this.state.content,
      })
      this.props.history.push('/')
    } catch (e) {
      alert(e)
      this.setState({ isLoading: false })
    }
  }

  render () {
    return (
      <div className='AddNote'>
        <form onSubmit={this.handleSubmit}>
          <FormGroup controlId="content">
            <label htmlFor='title'>Title</label>
            <Editor
              className='editor--title'
              text={this.state.title}
              className='editor--title'
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
              ref={this.editorRef}
              text={this.state.content}
              onChange={this.handleChange}
              options={{
                toolbar: {
                  buttons: [
                    'bold',
                    'italic',
                    'underline',
                    'h1', 'h2', 'h3',
                    'anchor',
                    'quote',
                    'orderedlist',
                    'unorderedlist',
                    'pre'
                  ]
                },
                autoLink: true,
                targetBlank: true,
                placeholder: {
                  text: 'Tell me a story'
                }
              }}
            />
          </FormGroup>

          {/* <FormGroup controlId="file">
            <ControlLabel>Attachment</ControlLabel>
            <FormControl onChange={this.handleFileChange} type="file" />
          </FormGroup> */}
         <br/>
          <LoaderButton
            bsStyle='primary'
            bsSize='large'
            disabled={!this.validateForm()}
            type='submit'
            isLoading={this.state.isLoading}
            text='Create'
            loadingText='Creating…'
            className='btn btn-primary'
          />
        </form>
      </div>
    )
  }
}

export default AddNote
