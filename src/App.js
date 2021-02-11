import React, { Component, Fragment } from "react";
import "./styles/App.css";
import "./styles/Base.css";
import "./assets/main.css";

// import HackerNews from './components/HackerNews'
// import Location from './models/Location'
// import Weather from './models/Weather'
import { Link, withRouter } from "react-router-dom";
import Routes from "./Routes";
import { Auth } from "aws-amplify";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isAuthenticated: false,
      isAuthenticating: true,
    };

    var time = new Date();
    var isNight = time.toLocaleString("en-US", {
      hour: "numeric",
      hour12: false,
    });
    this.nightMode = isNight <= 19; // 7pm
    this.userHasAuthenticated = this.userHasAuthenticated.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
  }

  userHasAuthenticated(auth) {
    this.setState({
      isAuthenticated: auth,
    });
  }

  async handleLogout(event) {
    await Auth.signOut();

    this.userHasAuthenticated(false);
    this.props.history.push("/login");
  }

  async componentDidMount() {
    try {
      await Auth.currentSession();
      this.userHasAuthenticated(true);
    } catch (e) {
      if (e !== "No current user") {
        alert(e);
      }
    }
    this.setState({ isAuthenticating: false });
  }

  render() {
    const { isAuthenticated } = this.state;
    const authProps = {
      isAuthenticated: isAuthenticated,
      userHasAuthenticated: this.userHasAuthenticated,
    };
    return (
      !this.state.isAuthenticating && (
        <div className={`App ${this.nightMode ? "night-mode" : ""}`}>
          <header className="App-header">
            <h1 className="App-title">
              <Link to="/">
                {/* dpham<span className="symbol">&nbsp;♥&nbsp;</span>
                Home of HyperText Products */}
                Dark Note
              </Link>
            </h1>
          </header>
          <div className="top-nav-wide">
            {this.state.isAuthenticated ? (
              <div>
                <Link to="/">Home</Link>
                <Link to="/login" onClick={this.handleLogout}>
                  Logout
                </Link>
              </div>
            ) : (
              <Fragment>
                <Link to="/">Home</Link>
                <Link to="/signup">Signup</Link>
                <Link to="/login">Login</Link>
              </Fragment>
            )}
            <br />
          </div>

          <div className="wrapper--center">
            <Routes bindings={authProps} />
          </div>
          <div className="wrapper">
            {/* {this.state.isAuthenticated
              ? <HackerNews />
              : ''
            } */}
            <aside className="sidebar">
              <div className="form-controls">
                {/* {this.state.isAuthenticated
                  ? <Location />
                  : ''
                }
                {this.state.isAuthenticated
                  ? <Weather />
                  : ''
                } */}
              </div>
            </aside>
          </div>
        </div>
      )
    );
  }
}

export default withRouter(App);
