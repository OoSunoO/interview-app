/**
 * Minimalist toast notification system.
 *
 * Usage:
 *   import { toast } from "./toast.js";
 *   toast.success("已保存");
 *   toast.error("保存失败");
 *   toast.info("共 42 条结果");
 */

const listeners = new Set();
let _id = 0;

function emit(entry) {
  for (const fn of listeners) fn(entry);
}

/** Remove a toast by id after a delay */
function scheduleDismiss(id, ms = 2500) {
  setTimeout(() => {
    for (const fn of listeners) fn({ type: "dismiss", id });
  }, ms);
}

function show(message, variant = "info") {
  const id = ++_id;
  emit({ type: "add", id, message, variant });
  scheduleDismiss(id);
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export const toast = {
  info: (msg) => show(msg, "info"),
  success: (msg) => show(msg, "success"),
  error: (msg) => show(msg, "error"),
  /** Manually remove a toast by id */
  dismiss: (id) => {
    for (const fn of listeners) fn({ type: "dismiss", id });
  },
};
