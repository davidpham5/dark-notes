import React, { Component } from 'react'
import '../styles/App.css'

const DEFAULT_QUERY = 'redux'

const PATH_BASE= 'https://hn.algolia.com/api/v1'
const PATH_SEARCH = '/search'
const PARAM_SEARCH = 'query='

const url = `${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${DEFAULT_QUERY}`

class HackerAPI extends Component {
  constructor (props) {
    super(props)

    this.state = {
      result: null,
      searchTerm: DEFAULT_QUERY
    }

    this.setSearchTopStories = this.setSearchTopStories.bind(this)
    this.onSearchChange = this.onSearchChange.bind(this)
    this.onDismiss = this.onDismiss.bind(this)
  }

  setSearchTopStories (result) {
    this.setState({result: result})
  }

  componentDidMount () {
    const {searchTerm} = this.state

    fetch(url)
      .then(resp => resp.json())
      .then(result => this.setSearchTopStories(result))
      .catch(error => error)
  }
}

export default HackerAPI