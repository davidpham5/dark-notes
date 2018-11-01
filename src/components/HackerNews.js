import React, { Component } from 'react'
import axios from 'axios'
import '../styles/App.css'
import '../styles/Base.css'
import Button from './Buttons/Btn'

const PATH_BASE = 'https://hn.algolia.com/api/v1'
const PATH_SEARCH = '/search'
const DEFAULT_QUERY = 'redux'
const PARAM_SEARCH = 'query='
const PARAM_PAGE = 'page='
const DEFAULT_HITS_PER_PAGE = '20'
const PARAM_HPP = 'hitsPerPage='
// const url = `${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}`

const CancelToken = axios.CancelToken
const source = CancelToken.source()

class HackerNews extends Component {
  constructor (props) {
    super(props)

    this.state = {
      results: null,
      searchKey: '',
      searchTerm: DEFAULT_QUERY,
      error: null
    }
    this.onDismiss = this.onDismiss.bind(this)
    this.setSearchTopStories = this.setSearchTopStories.bind(this)
    this.onSearchChange = this.onSearchChange.bind(this)
    this.onSearchSubmit = this.onSearchSubmit.bind(this)
    this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this)

    this.needsToSearchTopStories = this.needsToSearchTopStories.bind(this)
  }
  onDismiss (id) {
    // const updatedList = this.state.result.hits.filter(item => item.objectID !== id)

    // this.setState({
    //   result: {
    //     hits: updatedList
    //   }
    // })
    const isNotId = item => item.objectID !== id
    const updatedHits = this.state.result.hits.filter(isNotId)
    // use Object.assign() to create new object, copy this.state.result, and update hits property
    // this.setState({ result: Object.assign({}, this.state.result, {hits: updatedHits}) })
    // object spread to do the same
    this.setState({ result: {...this.state.result, hits: updatedHits} })
  }

  onSearchChange (event) {
    this.setState({
      searchTerm: event.target.value
    })
  }

  onSearchSubmit (event) {
    const { searchTerm } = this.state
    this.setState({ searchKey: searchTerm })

    if (this.needsToSearchTopStories(searchTerm)) {
      this.fetchSearchTopStories(searchTerm)
      event.preventDefault()
    }
    event.preventDefault()
  }

  setSearchTopStories (result) {
    const { hits, page } = result
    const { searchKey, results } = this.state

    const oldHits = results && results[searchKey]
      ? results[searchKey].hits
      : []

    const updateHits = [...oldHits, ...hits]

    this.setState({
      results: {
        ...results,
        [searchKey]: { hits: updateHits, page: page }
      }}
    )
  }

  fetchSearchTopStories (searchTerm, page = 0) {
    // fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HITS_PER_PAGE}`)
    // .then(response => response.json())
    // .then(result => this.setSearchTopStories(result))

    axios(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HITS_PER_PAGE}`, {
      cancelToken: source.token
    })
      .then(result => this.setSearchTopStories(result.data))
      .catch(error => {
        if (axios.isCancel(error)) {
          // user navigates away during the get request
          console.log('request canceled', error.message)
        } else {
          this.setState({ error })
        }
      })
  }

  needsToSearchTopStories (searchTerm) {
    // console.log(!this.state.results[searchTerm])
    return !this.state.results[searchTerm]
  }

  componentDidMount () {
    const { searchTerm } = this.state
    this.setState({ searchKey: searchTerm })
    this.fetchSearchTopStories(searchTerm)
  }

  render () {
    const { searchTerm, results, searchKey, error } = this.state
    const page = (results && results[searchKey] && results[searchKey].page) || 0 // (result ? show result.page) || 0
    const list = (results && results[searchKey] && results[searchKey].hits) || []

    return (
      <main className='main'>
        <div className='page'>
          <div className='interactions'>
            <h3>Hacker News on React</h3>
            <Search onChange={this.onSearchChange} value={searchTerm} onSubmit={this.onSearchSubmit}>
              {' '}
                Search All{' '}
            </Search>
            {/* { results
                    ? <Table list={list} onDismiss={this.onDismiss} />
                    : null
                  } */}
            {error ? <p>
                  Someting went wrong
            </p> : <Table list={list} onDismiss={this.onDismiss} />}
          </div>

          <div className='interactions'>
            <Button className='btn btn-primary' onClick={() => {
              this.fetchSearchTopStories(searchKey, page + 1)
            }}>
              More
            </Button>
          </div>
        </div>
      </main>
    )
  }
}

const Search = ({ value, onChange, onSubmit, children }) => {
  return (
    <form action='' className='form-group' onSubmit={onSubmit}>
      <label htmlFor='search'>{children}</label>
      <div className='input-group'>
        <input type='text' id='search' onChange={onChange} value={value} autoComplete='off' />
        <button type='submit' className='btn btn-primary'>Submit</button>
      </div>
    </form>
  )
}

const Table = ({list, pattern, onDismiss}) => {
  return (
    <div className='table'>
      {
        list
        // .filter(isSearched(pattern))
          .map((item) => {
            return (
              <div key={item.objectID} className='table-row'>
                <div className='react-list'>
                  <a href={item.url} target='_blank'>{item.title}</a>&nbsp; by <span>{item.author}</span>
                  <div>Comments: {item.number_comments}</div>
                  <div>Points: {item.points}</div>
                </div>
                <Button className={`btn btn-link`} onClick={() => onDismiss(item.objectID)}>
                &times;
                </Button>
              </div>
            )
          })
      }
    </div>
  )
}
export default HackerNews

export {
  Search,
  Table
}
