import React, { useState } from 'react';
import { loginBluesky, logoutBluesky, getBlueskySession } from '../libs/blueskyLib';

function ConsentModal({ onAuthorize, onCancel }) {
  const [handle, setHandle] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [step, setStep] = useState('credentials'); // 'credentials' | 'token'
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCredentialsSubmit(e) {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await onAuthorize(handle, password);
    } catch (err) {
      if (err?.error === 'AuthFactorTokenRequired') {
        setStep('token');
      } else {
        setError('Could not sign in. Check your handle and app password.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleTokenSubmit(e) {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await onAuthorize(handle, password, token);
    } catch (err) {
      setError('Invalid code. Check your email and try again.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleBack() {
    setStep('credentials');
    setToken('');
    setError('');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-iv-surface rounded-3xl w-full max-w-sm mx-4 overflow-hidden shadow-2xl border border-iv-border animate-slide-up">

        {/* Header */}
        <div className="px-6 pt-8 pb-5 text-center border-b border-iv-border">
          <div className="w-14 h-14 rounded-2xl bg-iv-accent flex items-center justify-center mx-auto mb-4 text-2xl font-black text-iv-bg">
            DN
          </div>
          {step === 'credentials' ? (
            <>
              <p className="text-xs text-iv-tertiary uppercase tracking-widest mb-1">Dark Notes wants to</p>
              <h2 className="text-xl font-bold text-iv-text">Connect to Bluesky</h2>
            </>
          ) : (
            <>
              <p className="text-xs text-iv-tertiary uppercase tracking-widest mb-1">Two-factor authentication</p>
              <h2 className="text-xl font-bold text-iv-text">Check your email</h2>
            </>
          )}
        </div>

        {step === 'credentials' ? (
          <>
            {/* Permissions */}
            <div className="px-6 py-5 border-b border-iv-border">
              <p className="text-xs text-iv-tertiary uppercase tracking-widest mb-3">Permissions requested</p>
              <ul className="flex flex-col gap-3">
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-iv-raised text-iv-accent flex items-center justify-center text-xs shrink-0">✓</span>
                  <div>
                    <p className="text-sm text-iv-text font-medium">Read your profile</p>
                    <p className="text-xs text-iv-secondary">Access your handle and account info</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-iv-raised text-iv-accent flex items-center justify-center text-xs shrink-0">✓</span>
                  <div>
                    <p className="text-sm text-iv-text font-medium">Post to your feed</p>
                    <p className="text-xs text-iv-secondary">Publish threads on your behalf</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Credentials form */}
            <form onSubmit={handleCredentialsSubmit} className="px-6 py-5 flex flex-col gap-3">
              <div>
                <label className="block text-xs text-iv-secondary mb-1.5">Bluesky handle</label>
                <input
                  type="text"
                  placeholder="you.bsky.social"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  autoFocus
                  className="w-full bg-iv-raised text-iv-text rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-iv-accent border border-iv-border"
                />
              </div>
              <div>
                <label className="block text-xs text-iv-secondary mb-1.5">App password</label>
                <input
                  type="password"
                  placeholder="xxxx-xxxx-xxxx-xxxx"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-iv-raised text-iv-text rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-iv-accent border border-iv-border"
                />
                <p className="text-xs text-iv-tertiary mt-1.5">
                  Generate one in Bluesky → Settings → Privacy and Security
                </p>
              </div>

              {error && <p className="text-xs text-iv-danger">{error}</p>}

              <div className="flex gap-2 mt-1">
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 py-2 rounded-full border border-iv-border text-iv-secondary hover:bg-iv-raised text-sm transition-all duration-150"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !handle || !password}
                  className="flex-1 py-2 rounded-full bg-iv-accent hover:bg-iv-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-iv-bg text-sm font-semibold transition-all duration-150 active:scale-95"
                >
                  {isLoading ? 'Checking...' : 'Authorize'}
                </button>
              </div>
            </form>
          </>
        ) : (
          /* Token form */
          <form onSubmit={handleTokenSubmit} className="px-6 py-5 flex flex-col gap-4">
            <div className="bg-iv-raised rounded-xl px-4 py-3 border border-iv-border">
              <p className="text-xs text-iv-tertiary mb-0.5">Signing in as</p>
              <p className="text-sm text-iv-text font-medium">@{handle}</p>
            </div>

            <p className="text-sm text-iv-secondary leading-relaxed">
              Bluesky sent a sign-in code to your email address. Enter it below to continue.
            </p>

            <div>
              <label className="block text-xs text-iv-secondary mb-1.5">Sign-in code</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="XXXXXX"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                autoFocus
                className="w-full bg-iv-raised text-iv-text rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-iv-accent tracking-widest text-center font-mono border border-iv-border"
              />
            </div>

            {error && <p className="text-xs text-iv-danger">{error}</p>}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 py-2 rounded-full border border-iv-border text-iv-secondary hover:bg-iv-raised text-sm transition-all duration-150"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={isLoading || !token}
                className="flex-1 py-2 rounded-full bg-iv-accent hover:bg-iv-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-iv-bg text-sm font-semibold transition-all duration-150 active:scale-95"
              >
                {isLoading ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function Settings() {
  const [bskySession, setBskySession] = useState(getBlueskySession());
  const [showModal, setShowModal] = useState(false);

  async function handleAuthorize(handle, password, token) {
    const session = await loginBluesky(handle, password, token);
    setBskySession(session);
    setShowModal(false);
  }

  function handleDisconnect() {
    logoutBluesky();
    setBskySession(null);
  }

  return (
    <div className="max-w-3xl py-8">
      <h1 className="text-xl font-semibold text-iv-text mb-8">Settings</h1>

      <section>
        <h2 className="text-xs font-medium uppercase tracking-widest text-iv-tertiary mb-4">Bluesky</h2>

        {bskySession ? (
          <div className="bg-iv-surface rounded-2xl p-5 flex items-center justify-between border border-iv-border">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-iv-accent flex items-center justify-center text-iv-bg font-bold text-sm shrink-0">
                {bskySession.handle[0].toUpperCase()}
              </div>
              <div>
                <p className="text-iv-text font-semibold">@{bskySession.handle}</p>
                <p className="text-xs text-iv-tertiary mt-0.5">{bskySession.did}</p>
              </div>
            </div>
            <button
              onClick={handleDisconnect}
              className="px-4 py-1.5 rounded-full border border-iv-border text-iv-secondary hover:text-iv-danger hover:border-iv-danger text-sm transition-all duration-150"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <div className="bg-iv-surface rounded-2xl p-5 flex items-center justify-between border border-iv-border">
            <div>
              <p className="text-iv-text font-medium">Not connected</p>
              <p className="text-sm text-iv-secondary mt-0.5">Link your Bluesky account to publish threads</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-1.5 rounded-full bg-iv-accent hover:bg-iv-accent-hover text-iv-bg text-sm font-semibold transition-all duration-150 active:scale-95"
            >
              Connect
            </button>
          </div>
        )}
      </section>

      {showModal && (
        <ConsentModal
          onAuthorize={handleAuthorize}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
