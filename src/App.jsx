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
        <div className="min-h-screen bg-iv-bg text-iv-text">
          <header className="sticky top-0 z-50 border-b border-iv-border bg-iv-surface/80 backdrop-blur-xl">
            <div className="container mx-auto flex items-center justify-between px-6 h-14">
              <Link to="/" className="text-lg font-bold tracking-tight text-iv-accent hover:text-iv-accent-hover transition-colors">
                Dark Notes
              </Link>
              <nav className="flex items-center gap-1">
                {isAuthenticated ? (
                  <>
                    <Link to="/settings" className="px-3 py-1.5 rounded-full text-sm text-iv-secondary hover:text-iv-text hover:bg-iv-raised transition-all duration-150">
                      Settings
                    </Link>
                    <Link to="/login" onClick={handleLogout} className="px-3 py-1.5 rounded-full text-sm text-iv-secondary hover:text-iv-text hover:bg-iv-raised transition-all duration-150">
                      Sign Out
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/signup" className="px-3 py-1.5 rounded-full text-sm text-iv-secondary hover:text-iv-text hover:bg-iv-raised transition-all duration-150">
                      Sign Up
                    </Link>
                    <Link to="/login" className="px-3 py-1.5 rounded-full text-sm font-medium text-iv-bg bg-iv-accent hover:bg-iv-accent-hover transition-all duration-150">
                      Login
                    </Link>
                  </>
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
