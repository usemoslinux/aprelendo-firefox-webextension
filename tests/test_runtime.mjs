import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { setTimeout as delay } from 'node:timers/promises';
import { pathToFileURL } from 'node:url';

let importCounter = 0;
const quietConsole = { ...console, error() {}, warn() {} };

function createEventHook() {
  const listeners = [];
  return {
    listeners,
    addListener(listener) {
      listeners.push(listener);
    },
  };
}

function installGlobals(overrides) {
  const previous = {
    browser: globalThis.browser,
    chrome: globalThis.chrome,
    document: globalThis.document,
    window: globalThis.window,
    requestAnimationFrame: globalThis.requestAnimationFrame,
    console: globalThis.console,
  };

  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) {
      delete globalThis[key];
    } else {
      globalThis[key] = value;
    }
  }

  return () => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) {
        delete globalThis[key];
      } else {
        globalThis[key] = value;
      }
    }
  };
}

async function importFresh(relativePath) {
  const href = pathToFileURL(path.resolve(process.cwd(), relativePath)).href;
  return import(`${href}?test=${importCounter++}`);
}

function createBackgroundBrowser({
  tabsQueryResult = [],
  scriptResult = { pageLang: '', text: '' },
  syncGet = async () => ({}),
  localGet = async () => ({}),
  localizedMenuTitle = 'Localized menu title',
} = {}) {
  const runtimeOnMessage = createEventHook();
  const runtimeOnInstalled = createEventHook();
  const commandsOnCommand = createEventHook();
  const contextMenuOnClicked = createEventHook();
  const storageOnChanged = createEventHook();

  const calls = {
    contextMenusCreate: [],
    tabsCreate: [],
    tabsUpdate: [],
    localSet: [],
  };

  const browser = {
    runtime: {
      onMessage: runtimeOnMessage,
      onInstalled: runtimeOnInstalled,
    },
    commands: {
      onCommand: commandsOnCommand,
    },
    contextMenus: {
      onClicked: contextMenuOnClicked,
      create(details) {
        calls.contextMenusCreate.push(details);
      },
    },
    storage: {
      sync: {
        get: syncGet,
      },
      local: {
        get: localGet,
        async set(value) {
          calls.localSet.push(value);
        },
      },
      onChanged: storageOnChanged,
    },
    tabs: {
      async query() {
        return tabsQueryResult;
      },
      async create(details) {
        calls.tabsCreate.push(details);
      },
      async update(tabId, details) {
        calls.tabsUpdate.push({ tabId, details });
      },
    },
    scripting: {
      async executeScript() {
        return [{ result: scriptResult }];
      },
    },
    i18n: {
      getMessage(key) {
        return key === 'contextMenuAutoDetectTitle' ? localizedMenuTitle : key;
      },
    },
  };

  return {
    browser,
    hooks: {
      runtimeOnMessage,
      runtimeOnInstalled,
      commandsOnCommand,
      contextMenuOnClicked,
      storageOnChanged,
    },
    calls,
  };
}

async function callMessageListener(listener, message) {
  return new Promise((resolve) => {
    const keepChannelOpen = listener(message, null, resolve);
    assert.equal(keepChannelOpen, true);
  });
}

class FakeClassList {
  constructor(element) {
    this.element = element;
    this.classes = new Set();
  }

  setFromString(value) {
    this.classes = new Set(String(value).split(/\s+/).filter(Boolean));
    this.sync();
  }

  sync() {
    this.element._className = Array.from(this.classes).join(' ');
  }

  add(...values) {
    for (const value of values) this.classes.add(value);
    this.sync();
  }

  remove(...values) {
    for (const value of values) this.classes.delete(value);
    this.sync();
  }

  contains(value) {
    return this.classes.has(value);
  }
}

class FakeFragment {
  constructor() {
    this.children = [];
  }

  appendChild(child) {
    this.children.push(child);
    return child;
  }
}

class FakeElement {
  constructor(tagName, ownerDocument) {
    this.tagName = String(tagName).toUpperCase();
    this.ownerDocument = ownerDocument;
    this.children = [];
    this.parentElement = null;
    this.listeners = new Map();
    this.attributes = new Map();
    this.classList = new FakeClassList(this);
    this._className = '';
    this._id = '';
    this.textContent = '';
    this.scrollTop = 0;
    this.clientHeight = 300;
    this.offsetHeight = 20;
    this.type = '';
  }

  set id(value) {
    if (this._id) {
      this.ownerDocument.ids.delete(this._id);
    }
    this._id = value;
    if (value) {
      this.ownerDocument.ids.set(value, this);
    }
  }

  get id() {
    return this._id;
  }

  set className(value) {
    this.classList.setFromString(value);
  }

  get className() {
    return this._className;
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }

  removeAttribute(name) {
    this.attributes.delete(name);
  }

  appendChild(child) {
    if (child instanceof FakeFragment) {
      for (const fragmentChild of child.children) {
        this.appendChild(fragmentChild);
      }
      return child;
    }

    child.parentElement = this;
    this.children.push(child);
    return child;
  }

  replaceChildren(...children) {
    this.children = [];
    for (const child of children) {
      this.appendChild(child);
    }
  }

  addEventListener(type, handler) {
    const handlers = this.listeners.get(type) || [];
    handlers.push(handler);
    this.listeners.set(type, handlers);
  }

  async dispatchEvent(event) {
    const handlers = this.listeners.get(event.type) || [];
    for (const handler of handlers) {
      await handler({ ...event, currentTarget: this });
    }
  }

  focus() {
    this.ownerDocument.activeElement = this;
  }

  closest(selector) {
    if (selector === '.button' && this.classList.contains('button')) {
      return this;
    }
    return this.parentElement ? this.parentElement.closest(selector) : null;
  }

  querySelector(selector) {
    for (const child of this.children) {
      if (selector === '.button' && child.classList.contains('button')) {
        return child;
      }
      if (selector === '.detected' && child.classList.contains('detected')) {
        return child;
      }
      const nested = child.querySelector(selector);
      if (nested) return nested;
    }
    return null;
  }

  getBoundingClientRect() {
    if (!this.parentElement) {
      return { top: 0 };
    }
    const index = this.parentElement.children.indexOf(this);
    return { top: index * 24 };
  }
}

class FakeDocument {
  constructor() {
    this.listeners = new Map();
    this.ids = new Map();
    this.activeElement = null;
    this.body = new FakeElement('body', this);
  }

  addEventListener(type, handler) {
    const handlers = this.listeners.get(type) || [];
    handlers.push(handler);
    this.listeners.set(type, handlers);
  }

  async dispatchDOMContentLoaded() {
    const handlers = this.listeners.get('DOMContentLoaded') || [];
    for (const handler of handlers) {
      await handler();
    }
  }

  createElement(tagName) {
    return new FakeElement(tagName, this);
  }

  createDocumentFragment() {
    return new FakeFragment();
  }

  querySelector(selector) {
    if (selector.startsWith('#')) {
      return this.getElementById(selector.slice(1));
    }
    return this.body.querySelector(selector);
  }

  getElementById(id) {
    return this.ids.get(id) || null;
  }
}

function createPopupEnvironment({
  detectedLanguage = 'fr',
  pickResponse = { ok: true },
  cachedLanguages = [
    { code: 'en', name: 'englishName' },
    { code: 'fr', name: 'frenchName' },
  ],
} = {}) {
  const document = new FakeDocument();
  const popupError = document.createElement('p');
  popupError.id = 'popup-error';
  popupError.className = 'hidden';
  document.body.appendChild(popupError);

  const popupContent = document.createElement('div');
  popupContent.id = 'popup-content';
  document.body.appendChild(popupContent);

  const windowMock = {
    closeCount: 0,
    close() {
      this.closeCount += 1;
    },
  };

  const browser = {
    i18n: {
      getMessage(key) {
        return {
          englishName: 'English',
          frenchName: 'French',
        }[key] || key;
      },
    },
    storage: {
      local: {
        async get() {
          return { cached_languages: cachedLanguages };
        },
      },
      sync: {
        async get() {
          return {};
        },
      },
    },
    runtime: {
      async sendMessage(message) {
        if (message?.action === 'getDetectedLanguage') {
          return { lang: detectedLanguage };
        }
        return pickResponse;
      },
    },
  };

  return {
    document,
    popupError,
    popupContent,
    windowMock,
    browser,
  };
}

test('background registers a localized context menu on install', async (t) => {
  const { browser, hooks, calls } = createBackgroundBrowser({
    tabsQueryResult: [{ id: 1, url: 'https://example.com', index: 0 }],
  });
  const restore = installGlobals({
    browser,
    chrome: undefined,
    document: undefined,
    window: undefined,
    requestAnimationFrame: undefined,
    console: quietConsole,
    console: quietConsole,
  });
  t.after(restore);

  await importFresh('./background.js');
  assert.equal(hooks.runtimeOnInstalled.listeners.length, 1);

  hooks.runtimeOnInstalled.listeners[0]();
  await delay(0);

  assert.equal(calls.contextMenusCreate[0].title, 'Localized menu title');
});

test('background returns an error response instead of redirecting unsupported pages', async (t) => {
  const { browser, hooks, calls } = createBackgroundBrowser({
    tabsQueryResult: [{ id: 7, url: 'about:addons', index: 2 }],
    syncGet: async (keys) => {
      if (Array.isArray(keys) && keys.includes('open_in_new_tab')) {
        return { open_in_new_tab: true };
      }
      return {};
    },
  });
  const restore = installGlobals({
    browser,
    chrome: undefined,
    document: undefined,
    window: undefined,
    requestAnimationFrame: undefined,
    console: quietConsole,
    console: quietConsole,
  });
  t.after(restore);

  await importFresh('./background.js');
  const response = await callMessageListener(hooks.runtimeOnMessage.listeners[0], {
    lang: 'en',
  });

  assert.equal(response.ok, false);
  assert.match(response.error, /cannot be sent to Aprelendo/);
  assert.equal(calls.tabsCreate.length, 0);
  assert.equal(calls.tabsUpdate.length, 0);
});

test('background normalizes page language metadata before heuristics', async (t) => {
  const { browser, hooks } = createBackgroundBrowser({
    tabsQueryResult: [{ id: 3, url: 'https://example.com', index: 0 }],
    scriptResult: { pageLang: 'pt-BR', text: '' },
  });
  const restore = installGlobals({
    browser,
    chrome: undefined,
    document: undefined,
    window: undefined,
    requestAnimationFrame: undefined,
    console: quietConsole,
    console: quietConsole,
  });
  t.after(restore);

  await importFresh('./background.js');
  const response = await callMessageListener(hooks.runtimeOnMessage.listeners[0], {
    action: 'getDetectedLanguage',
  });

  assert.deepEqual(response, { lang: 'pt' });
});

test('background command flow falls back to shortcut language when detection fails', async (t) => {
  const { browser, hooks, calls } = createBackgroundBrowser({
    tabsQueryResult: [{ id: 5, url: 'https://example.com/article', index: 1 }],
    scriptResult: { pageLang: '', text: '' },
    syncGet: async (keys) => {
      if (Array.isArray(keys) && keys.includes('shortcut_lang')) {
        return { shortcut_lang: 'es' };
      }
      if (Array.isArray(keys) && keys.includes('open_in_new_tab')) {
        return { open_in_new_tab: true };
      }
      return {};
    },
  });
  const restore = installGlobals({
    browser,
    chrome: undefined,
    document: undefined,
    window: undefined,
    requestAnimationFrame: undefined,
    console: quietConsole,
    console: quietConsole,
  });
  t.after(restore);

  await importFresh('./background.js');
  await hooks.commandsOnCommand.listeners[0]('add-page');

  assert.equal(calls.tabsCreate.length, 1);
  assert.match(calls.tabsCreate[0].url, /lang=es/);
  assert.match(calls.tabsCreate[0].url, /example\.com%2Farticle/);
});

test('background uses a configured self-hosted Aprelendo server', async (t) => {
  const { browser, hooks, calls } = createBackgroundBrowser({
    tabsQueryResult: [{ id: 9, url: 'https://example.com/article', index: 0 }],
    syncGet: async (keys) => {
      if (Array.isArray(keys) && keys.includes('open_in_new_tab')) {
        return { open_in_new_tab: true };
      }
      return {};
    },
    localGet: async (keys) => {
      if (Array.isArray(keys) && keys.includes('aprelendo_base_url')) {
        return { aprelendo_base_url: 'https://self-hosted.example/aprelendo/' };
      }
      return {};
    },
  });
  const restore = installGlobals({
    browser,
    chrome: undefined,
    document: undefined,
    window: undefined,
    requestAnimationFrame: undefined,
    console: quietConsole,
    console: quietConsole,
  });
  t.after(restore);

  await importFresh('./background.js');
  const response = await callMessageListener(hooks.runtimeOnMessage.listeners[0], {
    lang: 'en',
  });

  assert.deepEqual(response, { ok: true });
  assert.equal(calls.tabsCreate.length, 1);
  assert.equal(
    calls.tabsCreate[0].url,
    'https://self-hosted.example/aprelendo/addtext.php?lang=en&url=https%3A%2F%2Fexample.com%2Farticle',
  );
});

test('popup renders native buttons and focuses the detected language', async (t) => {
  const { browser, document, popupContent, windowMock } = createPopupEnvironment({
    detectedLanguage: 'fr',
  });
  const restore = installGlobals({
    browser,
    chrome: undefined,
    document,
    window: windowMock,
    requestAnimationFrame: (callback) => callback(),
    console: quietConsole,
    console: quietConsole,
  });
  t.after(restore);

  await importFresh('./popup/choose_lang.js');
  await document.dispatchDOMContentLoaded();

  assert.equal(popupContent.children.length, 2);
  assert.equal(popupContent.children[0].tagName, 'BUTTON');
  assert.equal(document.activeElement?.id, 'fr');
  assert.equal(document.getElementById('fr')?.getAttribute('aria-current'), 'true');
});

test('popup keeps the popup open and shows an error when add-page fails', async (t) => {
  const { browser, document, popupContent, popupError, windowMock } = createPopupEnvironment({
    detectedLanguage: 'fr',
    pickResponse: { ok: false, error: 'This page cannot be sent to Aprelendo.' },
  });
  const restore = installGlobals({
    browser,
    chrome: undefined,
    document,
    window: windowMock,
    requestAnimationFrame: (callback) => callback(),
    console: quietConsole,
    console: quietConsole,
  });
  t.after(restore);

  await importFresh('./popup/choose_lang.js');
  await document.dispatchDOMContentLoaded();

  const targetButton = document.getElementById('en');
  await popupContent.dispatchEvent({ type: 'click', target: targetButton });
  await delay(0);

  assert.equal(windowMock.closeCount, 0);
  assert.equal(popupError.textContent, 'This page cannot be sent to Aprelendo.');
  assert.equal(document.activeElement, targetButton);
  assert.equal(popupError.classList.contains('hidden'), false);
});

test('popup closes after a successful add-page selection', async (t) => {
  const { browser, document, popupContent, popupError, windowMock } = createPopupEnvironment({
    detectedLanguage: 'fr',
    pickResponse: { ok: true },
  });
  const restore = installGlobals({
    browser,
    chrome: undefined,
    document,
    window: windowMock,
    requestAnimationFrame: (callback) => callback(),
    console: quietConsole,
    console: quietConsole,
  });
  t.after(restore);

  await importFresh('./popup/choose_lang.js');
  await document.dispatchDOMContentLoaded();

  const targetButton = document.getElementById('en');
  await popupContent.dispatchEvent({ type: 'click', target: targetButton });
  await delay(0);

  assert.equal(windowMock.closeCount, 1);
  assert.equal(popupError.classList.contains('hidden'), true);
});
