import { AtpAgent } from "@atproto/api";

export const agent = new AtpAgent({ service: "https://bsky.social" });

const SESSION_KEY = "bsky_session";

export async function loginBluesky(handle, appPassword, authFactorToken) {
  const params = { identifier: handle, password: appPassword };
  if (authFactorToken) params.authFactorToken = authFactorToken.trim();
  const { data } = await agent.login(params);
  const session = {
    did: data.did,
    handle: data.handle,
    accessJwt: data.accessJwt,
    refreshJwt: data.refreshJwt,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function getBlueskySession() {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function logoutBluesky() {
  localStorage.removeItem(SESSION_KEY);
}

export async function resumeBlueskySession() {
  const session = getBlueskySession();
  if (!session) return null;
  await agent.resumeSession(session);
  return session;
}

// Posts an array of strings as a sequential Bluesky thread.
// Each post's reply field references the previous post to chain them.
export async function publishThread(posts) {
  await resumeBlueskySession();

  let reply = undefined;
  for (const text of posts.filter((p) => p.trim())) {
    const result = await agent.post({
      text: text.trim(),
      reply,
      createdAt: new Date().toISOString(),
    });
    const ref = { uri: result.uri, cid: result.cid };
    reply = {
      root: reply ? reply.root : ref,
      parent: ref,
    };
  }
}
