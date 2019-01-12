import poke43 from './base.js';
import Editor from './editor';
import Keyboard from './keyboard';

/* NOTE:
  - Class factory (pokeize) is used instead of just extending from CodeMirror to avoid introducing hard dependency on it and reserve the possibility to add options
  - CodeMirror.fromTextArea creates CodeMirror instance so just extending from it and implementing the Poke43 editor interface methods won't work. Instead, the created CodeMirror instance (either via fromTextArea or the constructor) is augmented with the necessary methods and props using a mixin approach
*/

// Necessary options to prevent native touch keyboard from popping up
const initialize = opts => Object.assign(opts, {
  inputStyle: 'textarea',
  readOnly: 'nocursor'
});

// Poke43 editor interface (without getters/setters)
// implemented in terms of a CodeMirror instance (this)
const editorMixin = {
  // Dummy Poke43 editor DOM element
  _el: {classList: {add() {}, remove() {}}},

  // Fake Poke43 editor view
  _view: {
    showCaret(inst) {
      inst.getWrapperElement().classList.add('pokeized-editing');
    },
    hideCaret(inst) {
      inst.getWrapperElement().classList.remove('pokeized-editing');
    }
  },

  moveBackward() {
    if (this.getSelection().length === 0) {
      this.execCommand('goCharLeft');
    }
    return this;
  },

  moveForward() {
    if (this.getSelection().length === 0) {
      this.execCommand('goCharRight');
    }
    return this;
  },

  moveBackwardWB() {
    if (this.getSelection().length === 0) {
      this.execCommand('goWordLeft');
    }
    return this;
  },

  moveForwardWB() {
    if (this.getSelection().length === 0) {
      this.execCommand('goWordRight');
    }
    return this;
  },

  moveToSOL() {
    if (this.getSelection().length === 0) {
      this.execCommand('goLineStart');
    }
    return this;
  },

  moveToEOL() {
    if (this.getSelection().length === 0) {
      this.execCommand('goLineEnd');
    }
    return this;
  },

  deleteBackward() {
    if (this.getSelection().length === 0) {
      this.execCommand('delCharBefore');
    }
    return this;
  },

  deleteForward() {
    if (this.getSelection().length === 0) {
      this.execCommand('delCharAfter');
    }
    return this;
  },

  deleteBackwardWB() {
    if (this.getSelection().length === 0) {
      this.execCommand('delWordBefore');
    }
    return this;
  },

  deleteForwardWB() {
    if (this.getSelection().length === 0) {
      this.execCommand('delWordAfter');
    }
    return this;
  },

  insert(text) {
    if (this.getSelection().length === 0) {
      this.replaceRange(text, this.getCursor());
    } else {
      this.replaceSelection((text.match(/\s/)) ? '' : text);
    }
    return this;
  },

  expandAbbreviation() {
    console.warn('TODO: Implement expandAbbreviation');
  },

  evalJS() {
    Editor.prototype.evalJS.call(this);
  },

  performUndo() {
    this.execCommand('undo');
  },

  performRedo() {
    this.execCommand('redo');
  }
};

// Poke43 editor interface (getters/setters)
// implemented in terms of a CodeMirror instance (this)
const editorMixinGetSet = {
  [Symbol.toStringTag]: {
    get () { return 'pokeized(CodeMirror)'; }
  },

  content: {
    get() { return this.getValue(); },
    set(text) { this.setValue(text); }
  }
};

// Mix-in the Poke43 editor interface implementation to CodeMirror instance
const editorize = inst => Object.defineProperties(
  Object.assign(inst, editorMixin), editorMixinGetSet
);

const KEYBOARD_SHOW_TIMER = 100;

const setKeyboardShowTimer = inst => {
  let kbd = inst._keyboard;

  if (kbd._hidden) {
    kbd._showTimerId = setTimeout(() => {
      kbd.show();
    }, KEYBOARD_SHOW_TIMER);
  }
};

const clearKeyboardShowTimer = inst => {
  let kbd = inst._keyboard;

  if (kbd._hidden && kbd._showTimerId) {
    clearInterval(kbd._showTimerId);
    kbd._showTimerId = null;
  }
};

// Create and attach Poke43 keyboard to CodeMirror instance
const keyboardize = inst => {
  let el = inst.getWrapperElement();
  let elParent = el.parentElement;
  let elKbd = document.createElement('div');

  el.classList.add('pokeized-editing');
  elParent.insertBefore(elKbd, el);
  inst._keyboard = new Keyboard(inst, elKbd);
  // NOTE: Hack to show keyboard on content click. Better solution?
  inst.on('touchstart', setKeyboardShowTimer);
  inst.on('scroll', clearKeyboardShowTimer);
  inst.on('gutterClick', clearKeyboardShowTimer);

  return inst;
};

// 'pokeized' CodeMirror class factory, use like:
// const PokeMirror = pokeized(CodeMirror);
// ...use like the regular CodeMirror ctor (fromTextArea, constructor, etc)
const pokeized = ctor => class extends ctor {
  static get [Symbol.toStringTag]() {
    return 'pokeized(CodeMirror)';
  }

  static fromTextArea(el, opts) {
    let inst = super.fromTextArea(el, initialize(opts));

    return keyboardize(editorize(inst));
  }

  constructor(el, opts) {
    super(el, initialize(opts));

    keyboardize(editorize(this));
  }
};

Object.assign(poke43, {
  pokeized
});

export {
  pokeized
};
