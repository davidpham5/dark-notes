import React, { Component, Fragment } from "react";
import "./styles/App.css";
import "./styles/Base.css";
import "./assets/main.css";

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
        // alert(e);
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
        <div className={` ${this.nightMode ? "night-mode" : ""}`}>
          <header className="neu-shadow top-0 z-40 lg:z-50 w-full max-w-8xl mx-auto bg-white flex-none flex justify-between mb-5">
            <div className="container mx-auto grid grid-cols-2">
              <aside className="logo text-3xl p-3">
                <Link to="/">Dark Notes</Link>
              </aside>
              <nav className="flex justify-end">
                {this.state.isAuthenticated ? (
                  <div>
                    <Link to="/login" onClick={this.handleLogout}>
                      Logout
                    </Link>
                  </div>
                ) : (
                  <ul className="flex justify-evenly items-center p-1">
                    <li className="p-1 pr-3 text-md">
                      <Link to="/signup">Sign Up</Link>
                    </li>
                    <li className="p-1 text-md">
                      <Link to="/login">Login</Link>
                    </li>
                  </ul>
                )}
              </nav>
            </div>
          </header>

          <div className="wrapper--center">
            <Routes bindings={authProps} />
          </div>
        </div>
      )
    );
  }
}

export default withRouter(App);
