// ===== APP LOGGER =====
// Centralised log collection for MyPurim PWA.
//
// All caught (and previously-swallowed) errors are stored in localStorage and
// optionally forwarded to a remote endpoint.
//
// Configuration (set on window BEFORE this script loads):
//   window.LOG_ENDPOINT = 'https://your-collector/api/logs';  // remote sink
//   window.LOG_MIN_LEVEL = 'info';   // 'debug' | 'info' | 'warn' | 'error'
//
// Public API (window.AppLogger):
//   AppLogger.error(msg, details?)
//   AppLogger.warn(msg, details?)
//   AppLogger.info(msg, details?)
//   AppLogger.debug(msg, details?)
//   AppLogger.getLogs()        → Array of log entries
//   AppLogger.clearLogs()
//   AppLogger.exportLogs()     → triggers JSON download

(function () {
  'use strict';

  var STORAGE_KEY  = 'mypurim_logs';
  var MAX_ENTRIES  = 200;           // ring-buffer cap
  var LEVEL_ORDER  = { debug: 0, info: 1, warn: 2, error: 3 };

  // ── helpers ──────────────────────────────────────────────────────────────

  function minLevel() {
    var lvl = (window.LOG_MIN_LEVEL || 'debug').toLowerCase();
    return LEVEL_ORDER.hasOwnProperty(lvl) ? LEVEL_ORDER[lvl] : 0;
  }

  function ts() { return new Date().toISOString(); }

  function serialize(val) {
    if (val === null || val === undefined) return null;
    if (val instanceof Error) {
      return { name: val.name, message: val.message, stack: val.stack || null };
    }
    try { return JSON.parse(JSON.stringify(val)); } catch (_) { return String(val); }
  }

  function readLogs() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (_) { return []; }
  }

  function writeLogs(logs) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    } catch (_) { /* quota exceeded — skip silently */ }
  }

  // ── core append ──────────────────────────────────────────────────────────

  function append(level, message, details) {
    if (LEVEL_ORDER[level] < minLevel()) return;

    var entry = {
      ts:      ts(),
      level:   level,
      msg:     String(message),
      url:     location.href,
      ua:      navigator.userAgent
    };
    if (details !== undefined && details !== null) {
      entry.details = serialize(details);
    }

    // Persist (ring-buffer)
    var logs = readLogs();
    logs.push(entry);
    if (logs.length > MAX_ENTRIES) {
      logs = logs.slice(logs.length - MAX_ENTRIES);
    }
    writeLogs(logs);

    // Forward to remote sink
    sendRemote(entry);

    return entry;
  }

  // ── remote forwarding ────────────────────────────────────────────────────

  function sendRemote(entry) {
    var endpoint = window.LOG_ENDPOINT;
    if (!endpoint) return;
    try {
      var body = JSON.stringify(entry);
      if (navigator.sendBeacon) {
        // sendBeacon survives page unload, perfect for error reporting
        navigator.sendBeacon(endpoint, new Blob([body], { type: 'application/json' }));
      } else {
        fetch(endpoint, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    body,
          keepalive: true
        }).catch(function () { /* remote unreachable — don't recurse */ });
      }
    } catch (_) {}
  }

  // ── patch console.error / console.warn ───────────────────────────────────
  // This automatically captures every console.error / console.warn in the app,
  // including those in catch blocks that already call console.error.

  var _origError = console.error.bind(console);
  var _origWarn  = console.warn.bind(console);

  console.error = function () {
    _origError.apply(console, arguments);
    var parts = [];
    for (var i = 0; i < arguments.length; i++) {
      var a = arguments[i];
      parts.push((a instanceof Error) ? (a.message || String(a)) : String(a));
    }
    // Pass the first Error argument as details if present
    var errorArg = null;
    for (var j = 0; j < arguments.length; j++) {
      if (arguments[j] instanceof Error) { errorArg = arguments[j]; break; }
    }
    append('error', parts.join(' '), errorArg);
  };

  console.warn = function () {
    _origWarn.apply(console, arguments);
    var parts = [];
    for (var i = 0; i < arguments.length; i++) {
      parts.push(String(arguments[i]));
    }
    append('warn', parts.join(' '));
  };

  // ── global uncaught JS errors ─────────────────────────────────────────────

  window.addEventListener('error', function (e) {
    append('error', e.message || 'Uncaught error', {
      filename: e.filename,
      lineno:   e.lineno,
      colno:    e.colno,
      stack:    e.error ? e.error.stack : null
    });
  });

  // ── unhandled promise rejections ──────────────────────────────────────────

  window.addEventListener('unhandledrejection', function (e) {
    var reason = e.reason;
    var msg = (reason instanceof Error)
      ? reason.message
      : String(reason || 'Unhandled promise rejection');
    append('error', 'Unhandled rejection: ' + msg, reason);
  });

  // ── public API ────────────────────────────────────────────────────────────

  window.AppLogger = {
    error: function (msg, details) { return append('error', msg, details); },
    warn:  function (msg, details) { return append('warn',  msg, details); },
    info:  function (msg, details) { return append('info',  msg, details); },
    debug: function (msg, details) { return append('debug', msg, details); },

    getLogs:   readLogs,
    clearLogs: function () { writeLogs([]); },

    /** Download all stored logs as a JSON file. */
    exportLogs: function () {
      var logs = readLogs();
      var json = JSON.stringify(logs, null, 2);
      var blob = new Blob([json], { type: 'application/json' });
      var url  = URL.createObjectURL(blob);
      var a    = document.createElement('a');
      a.href     = url;
      a.download = 'mypurim-logs-' + new Date().toISOString().replace(/[:.]/g, '-') + '.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  AppLogger.info('logger: initialised', { maxEntries: MAX_ENTRIES });

})();
