/**
 * Gist Sync — multi-tenant progress sync via GitHub Gist
 *
 * Every user gets their own localStorage prefix keyed by username.
 * Token & Gist ID are per-device; username determines the slot.
 *
 * Data shape stored in the Gist file:
 *   { version, revision, updated_at, username, progress, sessions, daily_stats, daily_goal }
 */

const TOKEN_KEY = "gist_token";
const GIST_ID_KEY = "gist_id";
const USERNAME_KEY = "quiz_username";
const GIST_DESCRIPTION = "面试题 App — 答题记录同步 (auto)";
const GIST_FILENAME = "interview-progress.json";
const API_BASE = "https://api.github.com";

// ── Storage helpers (localStorage) ───────────────────────────────

function lsGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function lsSet(key, val) {
  try {
    localStorage.setItem(key, val);
  } catch {
    /* ignore */
  }
}

function lsRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

// ── Slot-keyed progress helpers ──────────────────────────────────

function slotKey(username, base) {
  return `${base}_${username}`;
}

function readSlot(username, baseKey) {
  try {
    return JSON.parse(localStorage.getItem(slotKey(username, baseKey)) || "{}");
  } catch {
    return baseKey.includes("sessions") ? [] : {};
  }
}

function writeSlot(username, baseKey, data) {
  try {
    localStorage.setItem(slotKey(username, baseKey), JSON.stringify(data));
  } catch (e) {
    console.warn("localStorage write failed:", e);
  }
}

// ── Token management ────────────────────────────────────────────

function getToken() {
  return lsGet(TOKEN_KEY);
}

function setToken(token) {
  lsSet(TOKEN_KEY, token);
}

function hasToken() {
  return !!getToken();
}

function clearToken() {
  lsRemove(TOKEN_KEY);
  lsRemove(GIST_ID_KEY);
}

function getUsername() {
  return lsGet(USERNAME_KEY);
}

function setUsername(name) {
  lsSet(USERNAME_KEY, name);
}

function hasUsername() {
  return !!getUsername();
}

// ── GitHub Gist API calls ────────────────────────────────────────

/**
 * Headers for authenticated GitHub API requests.
 */
function authHeaders(token) {
  return {
    Authorization: `token ${token}`,
    Accept: "application/vnd.github.v3+json",
    "Content-Type": "application/json",
  };
}

/**
 * Validate a Personal Access Token by hitting the /user endpoint.
 * Returns { ok, login } or { ok: false, error }.
 */
async function validateToken(token) {
  try {
    const res = await fetch(`${API_BASE}/user`, { headers: authHeaders(token) });
    if (!res.ok) {
      if (res.status === 401) return { ok: false, error: "Token 无效或已过期" };
      return { ok: false, error: `GitHub API 错误: ${res.status}` };
    }
    const data = await res.json();
    return { ok: true, login: data.login };
  } catch (e) {
    return { ok: false, error: "网络错误，无法验证 Token" };
  }
}

/**
 * Find existing Gist by description, or create a new one.
 * Returns { gistId } or throws.
 */
async function findOrCreateGist(token) {
  const existingId = lsGet(GIST_ID_KEY);
  if (existingId) {
    // Verify it still exists
    const check = await fetch(`${API_BASE}/gists/${existingId}`, {
      headers: authHeaders(token),
    });
    if (check.ok) return { gistId: existingId };
    // Gist was deleted — clear cached ID and recreate
    lsRemove(GIST_ID_KEY);
  }

  // List user's gists, find by description
  const listRes = await fetch(`${API_BASE}/gists?per_page=100`, {
    headers: authHeaders(token),
  });
  if (listRes.ok) {
    const gists = await listRes.json();
    const match = gists.find((g) => g.description === GIST_DESCRIPTION);
    if (match) {
      lsSet(GIST_ID_KEY, match.id);
      return { gistId: match.id };
    }
  }

  // Create new gist
  const username = getUsername() || "user";
  const now = new Date().toISOString();
  const body = JSON.stringify({
    description: GIST_DESCRIPTION,
    public: false,
    files: {
      [GIST_FILENAME]: {
        content: JSON.stringify(
          {
            version: 1,
            revision: 1,
            updated_at: now,
            username,
            progress: {},
            sessions: [],
            daily_stats: {},
            daily_goal: 0,
          },
          null,
          2,
        ),
      },
    },
  });

  const createRes = await fetch(`${API_BASE}/gists`, {
    method: "POST",
    headers: authHeaders(token),
    body,
  });

  if (!createRes.ok) {
    if (createRes.status === 401) throw new Error("Token 已失效");
    if (createRes.status === 403) throw new Error("API 限流，请稍后再试");
    throw new Error(`创建 Gist 失败: ${createRes.status}`);
  }

  const created = await createRes.json();
  lsSet(GIST_ID_KEY, created.id);
  return { gistId: created.id };
}

/**
 * Read progress data from a Gist.
 * Returns the parsed payload or null if the file doesn't exist.
 */
async function readProgress(token, gistId) {
  const res = await fetch(`${API_BASE}/gists/${gistId}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) {
    if (res.status === 404) return null;
    if (res.status === 401) throw new Error("Token 已失效");
    throw new Error(`读取 Gist 失败: ${res.status}`);
  }
  const gist = await res.json();
  const file = gist.files?.[GIST_FILENAME];
  if (!file) return null;
  try {
    return JSON.parse(file.content);
  } catch {
    return null;
  }
}

/**
 * Write/overwrite progress data to a Gist.
 * Increments revision. Returns the updated payload or throws.
 */
async function writeProgress(token, gistId, data) {
  const now = new Date().toISOString();
  const payload = {
    ...data,
    revision: (data.revision || 0) + 1,
    updated_at: now,
  };

  const res = await fetch(`${API_BASE}/gists/${gistId}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({
      files: {
        [GIST_FILENAME]: {
          content: JSON.stringify(payload, null, 2),
        },
      },
    }),
  });

  if (!res.ok) {
    if (res.status === 401) throw new Error("Token 已失效，请在设置中重新配置");
    if (res.status === 404) throw new Error("Gist 已被删除，将自动重建");
    throw new Error(`写入 Gist 失败: ${res.status}`);
  }

  return payload;
}

// ── Sync operations ──────────────────────────────────────────────

/**
 * Collect current local data for a given username.
 */
function collectLocalData(username) {
  return {
    version: 1,
    revision: 0,
    updated_at: new Date().toISOString(),
    username: username || "unknown",
    progress: readSlot(username, "quiz_progress"),
    sessions: readSlot(username, "quiz_review_sessions"),
    daily_stats: readSlot(username, "quiz_daily_stats"),
    daily_goal: (() => {
      try {
        return parseInt(localStorage.getItem("quiz_daily_goal") || "0", 10);
      } catch {
        return 0;
      }
    })(),
  };
}

/**
 * Apply remote data to local storage for a given username.
 */
function applyRemoteData(username, data) {
  if (data.progress) writeSlot(username, "quiz_progress", data.progress);
  if (data.sessions) writeSlot(username, "quiz_review_sessions", data.sessions);
  if (data.daily_stats) writeSlot(username, "quiz_daily_stats", data.daily_stats);
  if (typeof data.daily_goal === "number") {
    try {
      localStorage.setItem("quiz_daily_goal", String(data.daily_goal));
    } catch {
      /* ignore */
    }
  }
}

/**
 * Push local data → Gist.
 * Returns { ok, error, revision }.
 */
async function syncOut(token, gistId) {
  const username = getUsername();
  if (!username) return { ok: false, error: "未设置用户名" };

  try {
    const localData = collectLocalData(username);
    const remote = await readProgress(token, gistId);

    let merged;
    if (remote && (remote.revision || 0) > (localData.revision || 0)) {
      // Remote is newer — merge local changes on top
      merged = {
        ...remote,
        progress: { ...remote.progress, ...localData.progress },
        sessions: mergeSessions(remote.sessions, localData.sessions),
        daily_stats: mergeDailyStats(remote.daily_stats, localData.daily_stats),
        daily_goal: localData.daily_goal || remote.daily_goal || 0,
        username: localData.username,
      };
    } else {
      merged = localData;
    }

    const result = await writeProgress(token, gistId, merged);
    return { ok: true, revision: result.revision, timestamp: result.updated_at };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

/**
 * Pull Gist data → local storage.
 * Returns { ok, hasData, error }.
 */
async function syncIn(token, gistId) {
  const username = getUsername();
  if (!username) return { ok: false, error: "未设置用户名", hasData: false };

  try {
    const remote = await readProgress(token, gistId);
    if (!remote || !remote.progress) {
      return { ok: true, hasData: false };
    }

    // Only restore if remote revision >= local revision or local is empty
    const localProgress = readSlot(username, "quiz_progress");
    const localRev = localProgress?._syncRevision || 0;
    const remoteRev = remote.revision || 0;

    if (remoteRev > localRev || Object.keys(localProgress).length === 0) {
      applyRemoteData(username, remote);
      return { ok: true, hasData: true, restored: true };
    }

    return { ok: true, hasData: true, restored: false };
  } catch (e) {
    return { ok: false, error: e.message, hasData: false };
  }
}

/**
 * Merge two session arrays by id, deduplicating.
 */
function mergeSessions(remote, local) {
  const map = new Map();
  for (const s of remote || []) map.set(s.id, s);
  for (const s of local || []) {
    // Use compound key: id + reviewed_at to avoid conflicts
    const key = s.id;
    if (!map.has(key) || new Date(s.reviewed_at) > new Date(map.get(key).reviewed_at)) {
      map.set(key, s);
    }
  }
  return Array.from(map.values())
    .sort((a, b) => new Date(a.reviewed_at) - new Date(b.reviewed_at))
    .slice(-500);
}

/**
 * Merge daily stats objects (keyed by date string).
 */
function mergeDailyStats(remote, local) {
  return { ...(remote || {}), ...(local || {}) };
}

// ── Debounced sync queue ─────────────────────────────────────────

let _syncTimer = null;
let _syncPromise = null;
let _syncStatus = "idle"; // idle | syncing | synced | error
let _syncError = null;
let _lastSyncTime = null;
let _statusListeners = [];

function getSyncStatus() {
  return { status: _syncStatus, error: _syncError, lastSync: _lastSyncTime };
}

function setSyncStatus(status, error) {
  _syncStatus = status;
  _syncError = error || null;
  notifyListeners();
}

function notifyListeners() {
  for (const fn of _statusListeners) {
    try {
      fn({ status: _syncStatus, error: _syncError, lastSync: _lastSyncTime });
    } catch {
      /* ignore */
    }
  }
}

/**
 * Subscribe to sync status changes. Returns unsubscribe function.
 */
function onStatusChange(fn) {
  _statusListeners.push(fn);
  return () => {
    _statusListeners = _statusListeners.filter((f) => f !== fn);
  };
}

/**
 * Queue a sync operation (debounced 500ms).
 * Multiple rapid calls are coalesced.
 */
function queueSync() {
  if (_syncTimer) clearTimeout(_syncTimer);

  _syncTimer = setTimeout(async () => {
    _syncTimer = null;
    await executeSync();
  }, 500);
}

/**
 * Force immediate sync, bypassing the debounce.
 */
async function forceSync() {
  if (_syncTimer) {
    clearTimeout(_syncTimer);
    _syncTimer = null;
  }
  return executeSync();
}

async function executeSync() {
  const token = getToken();
  const gistId = lsGet(GIST_ID_KEY);
  if (!token || !gistId) return;

  setSyncStatus("syncing");

  try {
    const result = await syncOut(token, gistId);
    if (result.ok) {
      _lastSyncTime = new Date().toISOString();
      setSyncStatus("synced");
    } else {
      setSyncStatus("error", result.error);
    }
  } catch (e) {
    setSyncStatus("error", e.message);
  }
}

/**
 * Initial setup: validate token, find/create gist, and optionally restore data.
 */
async function setupSync(token, username) {
  setToken(token);
  setUsername(username);

  // Validate the token
  const validation = await validateToken(token);
  if (!validation.ok) {
    clearToken();
    return { ok: false, error: validation.error };
  }

  // Find or create Gist
  let gistId;
  try {
    const result = await findOrCreateGist(token);
    gistId = result.gistId;
  } catch (e) {
    clearToken();
    return { ok: false, error: e.message };
  }

  // Attempt first sync-in (restore from cloud)
  const syncResult = await syncIn(token, gistId);
  if (!syncResult.ok) {
    // Non-fatal — local data remains intact
    console.warn("Gist sync initial restore failed:", syncResult.error);
  }

  // Queue a sync-out to ensure cloud has latest local data
  queueSync();

  return { ok: true, restored: syncResult.hasData && syncResult.restored };
}

/**
 * Teardown: clear token and Gist ID. Does NOT touch progress data.
 */
function teardownSync() {
  clearToken();
  setSyncStatus("idle");
}

// ── Hook for beforeunload ────────────────────────────────────────
function installBeforeUnloadHook() {
  if (typeof window === "undefined") return;
  window.addEventListener("beforeunload", () => {
    if (hasToken() && lsGet(GIST_ID_KEY)) {
      // Synchronous attempt — fire-and-forget with keepalive
      const token = getToken();
      const gistId = lsGet(GIST_ID_KEY);
      const username = getUsername();
      if (token && gistId && username) {
        const data = collectLocalData(username);
        fetch(`${API_BASE}/gists/${gistId}`, {
          method: "PATCH",
          headers: authHeaders(token),
          body: JSON.stringify({
            files: {
              [GIST_FILENAME]: {
                content: JSON.stringify(
                  {
                    ...data,
                    revision: (data.revision || 0) + 1,
                    updated_at: new Date().toISOString(),
                  },
                  null,
                  2,
                ),
              },
            },
          }),
          keepalive: true,
        }).catch(() => {});
      }
    }
  });
}

// ── Migrate legacy progress keys to slot-based keys ──────────────
function migrateToSlotKeys() {
  const username = getUsername();
  if (!username) return;

  const legacyKeys = [
    ["quiz_progress", "quiz_progress"],
    ["quiz_review_sessions", "quiz_review_sessions"],
    ["quiz_daily_stats", "quiz_daily_stats"],
  ];

  for (const [legacy, base] of legacyKeys) {
    const slot = slotKey(username, base);
    if (localStorage.getItem(legacy) && !localStorage.getItem(slot)) {
      try {
        const val = localStorage.getItem(legacy);
        localStorage.setItem(slot, val);
        // Don't remove legacy — other code may still read it
      } catch {
        /* ignore */
      }
    }
  }
}

// ── Export ───────────────────────────────────────────────────────

export const gistSync = {
  // Token management
  getToken,
  setToken,
  hasToken,
  clearToken,
  getUsername,
  setUsername,
  hasUsername,

  // Gist operations
  validateToken,
  findOrCreateGist,
  readProgress,
  writeProgress,
  syncOut,
  syncIn,

  // Sync engine
  queueSync,
  forceSync,
  setupSync,
  teardownSync,
  onStatusChange,
  getSyncStatus,

  // Lifecycle
  installBeforeUnloadHook,
  migrateToSlotKeys,

  // Internal (for testing)
  slotKey,
  readSlot,
  writeSlot,
  collectLocalData,
  applyRemoteData,
  mergeSessions,
  mergeDailyStats,
};
