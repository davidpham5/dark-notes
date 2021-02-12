import { Auth } from "aws-amplify";
import React, { useEffect, useState } from "react";
import { Link, withRouter } from "react-router-dom";

import Routes from "./Routes";

import "./assets/main.css";
import "./styles/App.css";
import "./styles/Base.css";

function App({ history }) {
  const [state, setState] = useState({
    isAuthenticated: false,
    isAuthenticating: true,
  });

  let time = new Date();
  let isNight = time.toLocaleString("en-US", {
    hour: "numeric",
    hour12: false,
  });

  function userHasAuthenticated(auth) {
    return setState({
      isAuthenticated: auth,
    });
  }

  async function handleLogout(event) {
    event.preventDefault();
    await Auth.signOut();

    userHasAuthenticated(false);
    history.push("/login");
  }
  async function handleAuth() {
    try {
      await Auth.currentSession();
      userHasAuthenticated(true);
    } catch (e) {
      if (e !== "No current user") {
        // alert(e);
      }
    }
  }

  useEffect(() => {
    handleAuth();
    setState({ isAuthenticating: false });
  }, [Auth]);

  function renderApp() {
    const { isAuthenticated, isAuthenticating, nightMode } = state;
    const authProps = {
      isAuthenticated,
      userHasAuthenticated,
    };

    return (
      !isAuthenticating && (
        <div className={`${nightMode ? "night-mode" : ""}`}>
          <header className="neu-shadow top-0 z-40 lg:z-50 w-full max-w-8xl mx-auto bg-white flex-none flex justify-between mb-5">
            <div className="container mx-auto grid grid-cols-2">
              <aside className="logo text-3xl p-3">
                <Link to="/">Dark Notes</Link>
              </aside>
              <nav className="flex justify-end">
                {isAuthenticated ? (
                  <div>
                    <Link to="/login" onClick={handleLogout}>
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

  return renderApp();
}

export default withRouter(App);
