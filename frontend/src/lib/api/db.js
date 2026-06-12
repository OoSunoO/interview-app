const DB_NAME = "interview_app";
const DB_VERSION = 1;

const STORES = ["progress", "sessions", "dailyStats", "tagDefs"];

const hasIDB = typeof indexedDB !== "undefined";

let dbPromise = null;

function openDB() {
  if (!hasIDB) return Promise.reject(new Error("IndexedDB not available"));
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      for (const name of STORES) {
        if (!db.objectStoreNames.contains(name)) {
          db.createObjectStore(name);
        }
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => {
      dbPromise = null;
      reject(req.error);
    };
  });
  return dbPromise;
}

function txn(store, mode) {
  return openDB().then((db) => db.transaction(store, mode).objectStore(store));
}

export async function idbGet(store, key) {
  try {
    const store_ = await txn(store, "readonly");
    return new Promise((resolve) => {
      const req = store_.get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(undefined);
    });
  } catch {
    return undefined;
  }
}

export async function idbSet(store, key, value) {
  try {
    const store_ = await txn(store, "readwrite");
    return new Promise((resolve) => {
      const req = store_.put(value, key);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

export async function idbDelete(store, key) {
  try {
    const store_ = await txn(store, "readwrite");
    return new Promise((resolve) => {
      const req = store_.delete(key);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

export async function idbClear(store) {
  try {
    const store_ = await txn(store, "readwrite");
    return new Promise((resolve) => {
      const req = store_.clear();
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}
