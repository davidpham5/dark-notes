import React from 'react'
import ReactDOM from 'react-dom';
const state = {
  eventCount: 0,
  username: ''
}

function LessonApp () {
  return (
    <div>
      <main>
      <p>
        there have been { state.eventCount } events
      </p>
      <p>
        <button className="btn btn-primary" onClick={increment}> Event Handler Button </button>
      </p>
      <p>
        You typed: { state.username }
      </p>
      <p>
        <label htmlFor="">
          <input type="text" onChange={updateUsername}/>
        </label>
      </p>
      </main>
    </div>
  )
}
function increment () {
  setState({eventCount: state.eventCount + 1})
}
function updateUsername (event) {
  setState({username: event.target.value})
}
setState({eventCount: 10})
setState({username: 'David'})

function setState (newState) {
  Object.assign(state, newState)
  renderApp()
}

function renderApp () {
  ReactDOM.render(<LessonApp />, document.getElementById('app'));
}
class EventHandlers extends React.Component {
  render () {
    return <LessonApp />
  }
}

export default EventHandlers