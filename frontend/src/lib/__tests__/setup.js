import "@testing-library/jest-dom/vitest";

// localStorage polyfill for coverage mode (jsdom can lose environment in v8 coverage)
if (typeof localStorage === "undefined" || localStorage === null) {
  const store = {};
  Object.defineProperty(window, "localStorage", {
    value: {
      getItem: (k) => store[k] ?? null,
      setItem: (k, v) => (store[k] = String(v)),
      removeItem: (k) => delete store[k],
      clear: () => Object.keys(store).forEach((k) => delete store[k]),
      get length() {
        return Object.keys(store).length;
      },
      key: (i) => Object.keys(store)[i] ?? null,
    },
    writable: true,
  });
}

// jsdom polyfill for matchMedia (used by stores.svelte.js for theme detection)
if (!window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
    }),
  });
}
