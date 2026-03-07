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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-2xl w-full max-w-sm mx-4 overflow-hidden shadow-2xl border border-gray-700">

        {/* Header */}
        <div className="px-6 pt-8 pb-5 text-center border-b border-gray-800">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-4 text-2xl font-black text-white">
            DN
          </div>
          {step === 'credentials' ? (
            <>
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Dark Notes wants to</p>
              <h2 className="text-xl font-bold text-white">Connect to Bluesky</h2>
            </>
          ) : (
            <>
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Two-factor authentication</p>
              <h2 className="text-xl font-bold text-white">Check your email</h2>
            </>
          )}
        </div>

        {step === 'credentials' ? (
          <>
            {/* Permissions */}
            <div className="px-6 py-5 border-b border-gray-800">
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Permissions requested</p>
              <ul className="flex flex-col gap-3">
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-blue-900/60 text-blue-400 flex items-center justify-center text-xs shrink-0">✓</span>
                  <div>
                    <p className="text-sm text-white font-medium">Read your profile</p>
                    <p className="text-xs text-gray-500">Access your handle and account info</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-blue-900/60 text-blue-400 flex items-center justify-center text-xs shrink-0">✓</span>
                  <div>
                    <p className="text-sm text-white font-medium">Post to your feed</p>
                    <p className="text-xs text-gray-500">Publish threads on your behalf</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Credentials form */}
            <form onSubmit={handleCredentialsSubmit} className="px-6 py-5 flex flex-col gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Bluesky handle</label>
                <input
                  type="text"
                  placeholder="you.bsky.social"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  autoFocus
                  className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">App password</label>
                <input
                  type="password"
                  placeholder="xxxx-xxxx-xxxx-xxxx"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Generate one in Bluesky → Settings → Privacy and Security
                </p>
              </div>

              {error && <p className="text-xs text-red-400">{error}</p>}

              <div className="flex gap-2 mt-1">
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 py-2 rounded-lg border border-gray-700 text-gray-400 hover:bg-gray-800 text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !handle || !password}
                  className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
                >
                  {isLoading ? 'Checking...' : 'Authorize'}
                </button>
              </div>
            </form>
          </>
        ) : (
          /* Token form */
          <form onSubmit={handleTokenSubmit} className="px-6 py-5 flex flex-col gap-4">
            <div className="bg-gray-800 rounded-lg px-4 py-3">
              <p className="text-xs text-gray-500 mb-0.5">Signing in as</p>
              <p className="text-sm text-white font-medium">@{handle}</p>
            </div>

            <p className="text-sm text-gray-400 leading-relaxed">
              Bluesky sent a sign-in code to your email address. Enter it below to continue.
            </p>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Sign-in code</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="XXXXXX"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                autoFocus
                className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 tracking-widest text-center font-mono"
              />
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 py-2 rounded-lg border border-gray-700 text-gray-400 hover:bg-gray-800 text-sm transition-colors"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={isLoading || !token}
                className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
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
    <div className="max-w-2xl">
      <h1 className="text-2xl mb-8">Settings</h1>

      <section>
        <h2 className="text-xl font-semibold mb-4 text-blue-400">Bluesky</h2>

        {bskySession ? (
          <div className="bg-gray-900 rounded-xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {bskySession.handle[0].toUpperCase()}
              </div>
              <div>
                <p className="text-white font-semibold">@{bskySession.handle}</p>
                <p className="text-xs text-gray-500 mt-0.5">{bskySession.did}</p>
              </div>
            </div>
            <button
              onClick={handleDisconnect}
              className="px-4 py-2 rounded-lg border border-gray-700 text-gray-400 hover:border-red-700 hover:text-red-400 text-sm transition-colors"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <div className="bg-gray-900 rounded-xl p-5 flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Not connected</p>
              <p className="text-sm text-gray-500 mt-0.5">Link your Bluesky account to publish threads</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
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
