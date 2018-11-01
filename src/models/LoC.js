import React, { Component } from 'react'
import axios from 'axios'

const basePath = `https://chroniclingamerica.loc.gov`
const queryTerm = `search`
const queryTypeTitles = `titles`
const queryTypePages = `pages`
const queryTypeResults = 'results'
const queryFormat = 'json'
const query = 'terms'

class LoC extends Component {
  constructor (props) {
    super(props)
    this.state = {
      searchTerm: '',
      results: ''
    }
    this.searchLoC = this.searchLoC.bind(this)
    this.fetchSearchTerm = this.fetchSearchTerm.bind(this)
  }

  searchLoC (term) {
    console.log(term)
    this.setState({searchTerm: term})
  }

  fetchSearchTerm (searchTerm) {
    searchTerm = `michigan`
    axios(`${basePath}/${queryTerm}/${queryTypeTitles}/${queryTypeResults}/?${query}=${searchTerm}&format=${queryFormat}`)
      .then((resp) => {
        console.log(resp)
        this.setState({results: resp.data})
      })
      .catch(error => error)
  }
  componentDidMount () {
    this.fetchSearchTerm()
  }
  render () {
    const { results } = this.state
    if ( !results ) return null;
    return (
      <div>{ results.items.map((item) => {
        return <p key={item.id}>{ item.city }, {item.country}</p>
      }) }</div>
    )
  }
}

export default LoC
