import { signOut, fetchAuthSession } from 'aws-amplify/auth';
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

import { AppContext } from "./libs/contextLib";
import Routes from "./Routes";

import "./assets/main.css";
import "./styles/App.css";
import "./styles/Base.css";

function App() {
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [isAuthenticated, userHasAuthenticated] = useState(false);
  const navigate = useNavigate();

  async function handleLogout(event) {
    event.preventDefault();
    await signOut();

    userHasAuthenticated(false);
    navigate("/login");
  }

  async function handleAuth() {
    try {
      const { tokens } = await fetchAuthSession({ forceRefresh: false });
      userHasAuthenticated(!!tokens);
    } catch (e) {
      if (e !== "No current user") {
        alert(e);
      }
    }
    setIsAuthenticating(false);
  }

  useEffect(() => {
    handleAuth();
  }, []);

  function renderApp() {
    return (
      !isAuthenticating && (
        <div className="bg-gray-800 text-white dark:bg-gray-800">
          <header className="neu-shadow top-0 z-40 lg:z-50 w-full max-w-8xl mx-auto bg-white text-black flex-none flex justify-between mb-5">
            <div className="container mx-auto grid grid-cols-2">
              <aside className="logo text-3xl p-3">
                <Link to="/">Dark Notes</Link>
              </aside>
              <nav className="flex justify-end">
                {isAuthenticated ? (
                  <div className="flex justify-evenly items-center p-1">
                    <Link to="/settings">
                      <span className="pl-3 pr-3">Settings</span>
                    </Link>
                    <Link to="/login" onClick={handleLogout}>
                      Sign Out
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
            <AppContext.Provider
              value={{ isAuthenticated, userHasAuthenticated }}
            >
              <Routes />
            </AppContext.Provider>
          </div>
        </div>
      )
    );
  }

  return renderApp();
}

export default App;
