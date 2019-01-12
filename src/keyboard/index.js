import Hammer from 'hammerjs';

import poke43 from '../base';
import symBlockPoke43HTML from './layouts/sym-block-poke43.html';
import symBlockTextasticHTML from './layouts/sym-block-textastic.html';
import custBlockHTML from './layouts/cust-block.html';
import langBlockEnUsQwertyHTML from './layouts/lang-block-en-us-qwerty.html';
import langBlockEnUsQwertySymHTML from './layouts/lang-block-en-us-qwerty-sym.html';
import langBlockBgBgPhoneticHTML from './layouts/lang-block-bg-bg-phonetic.html';
import langBlockBgBgPhoneticSymHTML from './layouts/lang-block-bg-bg-phonetic-sym.html';
import './styles/keyboard.scss';
import Key from './key';
import EditorKey, {
  EditorKeyCharacter,
  EditorKeyCharacterSpaceMove,
  EditorKeyCharacterSpaceMoveWB,
  EditorKeyCharacterEnterDelete,
  EditorKeyCharacterEnterDeleteWB,
  EditorKeyCharSymSpaceMove,
  EditorKeyCharSymSpaceMoveWB,
  EditorKeyCharSymEnterDelete,
  EditorKeyCharSymEnterDeleteWB,
  EditorKeySymbol,
  EditorKeyCustom
} from './editor-key';
import KeyboardKey from './keyboard-key';

class Keyboard {
  static _symBlockPoke43Layout = symBlockPoke43HTML;
  static _symBlockTextasticLayout = symBlockTextasticHTML;
  static _custBlockLayout = custBlockHTML;
  static _langBlockEnUsQwertyLayout = langBlockEnUsQwertyHTML;
  static _langBlockEnUsQwertySymLayout = langBlockEnUsQwertySymHTML;
  static _langBlockBgBgPhoneticLayout = langBlockBgBgPhoneticHTML;
  static _langBlockBgBgPhoneticSymLayout = langBlockBgBgPhoneticSymHTML;

  constructor(editor, el) {
    this._editor = editor;
    this._el = el;
    this._rowEls = this._getRowEls();
    this._keys = this._getKeys();
    this._symBlockActive = true;
    this._symBlockLayout = 'Poke43';
    this._custBlockActive = false;
    this._langBlockLayout = 'EnUsQwerty';
    this._hammer = new Hammer.Manager(this._el);

    this._el.classList.add('poke43-keyboard');

    if (this._rowEls.length === 0) {
      this._renderDefaultLayout();

      this._rowEls = this._getRowEls();
      this._keys = this._getKeys();
    }

    this._hammer.add(new Hammer.Tap());
    this._hammer.add(new Hammer.Swipe({
      direction: Hammer.DIRECTION_ALL,
      treshold: 2,
      velocity: 0.05
    }));

    this._hammer.on('tap', ev => {
      ev.preventDefault(); // Prevent zoom on double-tap
    });
    this._hammer.on('swipe', ev => {

    });

    this._symBlockActive && this[`_symBlock${this._symBlockLayout}Show`]();
    this._custBlockActive && this._custBlockShow();
    this[`_langBlock${this._langBlockLayout}Show`]();
  }

  _getRowEls() {
    return [].slice.call(
      this._el.querySelectorAll('.poke43-keyboard-row')
    );
  }

  _getKeys() {
    return [].map.call(
      this._el.querySelectorAll('.poke43-keyboard-row > span'),
      elKey => new poke43[elKey.dataset.type](
        (elKey.dataset.type === 'KeyboardKey') ? this : this._editor, elKey
      )
    );
  }

  _hideRowEls(indices) {
    indices.forEach(i => this._rowEls[i].style.display = 'none');
  }

  _showRowEls(indices) {
    indices.forEach(i => this._rowEls[i].style.display = 'block');
  }

  get _symBlockPoke43Indices() { return [0]; }
  _symBlockPoke43Hide() { this._hideRowEls(this._symBlockPoke43Indices); }
  _symBlockPoke43Show() { this._showRowEls(this._symBlockPoke43Indices); }
  get _symBlockPoke43Layout() {
    return this.constructor._symBlockPoke43Layout;
  }

  get _symBlockTextasticIndices() { return [1]; }
  _symBlockTextasticHide() { this._hideRowEls(this._symBlockTextasticIndices); }
  _symBlockTextasticShow() { this._showRowEls(this._symBlockTextasticIndices); }
  get _symBlockTextasticLayout() {
    return this.constructor._symBlockTextasticLayout;
  }

  get _custBlockIndices() { return [2]; }
  _custBlockHide() { this._hideRowEls(this._custBlockIndices); }
  _custBlockShow() { this._showRowEls(this._custBlockIndices); }
  get _custBlockLayout() {
    return this.constructor._custBlockLayout;
  }

  get _langBlockEnUsQwertyIndices() { return [3, 4, 5]; }
  _langBlockEnUsQwertyHide() {
    this._hideRowEls(this._langBlockEnUsQwertyIndices);
    this._hideRowEls(this._langBlockEnUsQwertySymIndices);
  }
  _langBlockEnUsQwertyShow() {
    this._showRowEls((this._symBlockActive) ?
      this._langBlockEnUsQwertyIndices :
      this._langBlockEnUsQwertySymIndices);
  }
  get _langBlockEnUsQwertyLayout() {
    return this.constructor._langBlockEnUsQwertyLayout;
  }

  get _langBlockEnUsQwertySymIndices() { return [6, 7, 8]; }
  _langBlockEnUsQwertySymHide() { this._hideRowEls(this._langBlockEnUsQwertySymIndices); }
  _langBlockEnUsQwertySymShow() { this._showRowEls(this._langBlockEnUsQwertySymIndices); }
  get _langBlockEnUsQwertySymLayout() {
    return this.constructor._langBlockEnUsQwertySymLayout;
  }

  get _langBlockBgBgPhoneticIndices() { return [9, 10, 11]; }
  _langBlockBgBgPhoneticHide() {
    this._hideRowEls(this._langBlockBgBgPhoneticIndices);
    this._hideRowEls(this._langBlockBgBgPhoneticSymIndices);
  }
  _langBlockBgBgPhoneticShow() {
    this._showRowEls((this._symBlockActive) ?
      this._langBlockBgBgPhoneticIndices :
      this._langBlockBgBgPhoneticSymIndices);
  }
  get _langBlockBgBgPhoneticLayout() {
    return this.constructor._langBlockBgBgPhoneticLayout;
  }

  get _langBlockBgBgPhoneticSymIndices() { return [12, 13, 14]; }
  _langBlockBgBgPhoneticSymHide() { this._hideRowEls(this._langBlockBgBgPhoneticSymIndices); }
  _langBlockBgBgPhoneticSymShow() { this._showRowEls(this._langBlockBgBgPhoneticSymIndices); }
  get _langBlockBgBgPhoneticSymLayout() {
    return this.constructor._langBlockBgBgPhoneticSymLayout;
  }

  _renderDefaultLayout() {
    this._el.innerHTML = `
${this._symBlockPoke43Layout}
${this._symBlockTextasticLayout}
${this._custBlockLayout}
${this._langBlockEnUsQwertyLayout}
${this._langBlockEnUsQwertySymLayout}
${this._langBlockBgBgPhoneticLayout}
${this._langBlockBgBgPhoneticSymLayout}
    `;
  }

  toggleSymBlock() {
    if (this._symBlockActive) {
      this._symBlockPoke43Hide();
      this._symBlockTextasticHide();

      this._symBlockActive = false;
    } else {
      switch (this._symBlockLayout) {
      case 'Poke43':
        this._symBlockTextasticHide();
        this._symBlockPoke43Show();

        break;
      case 'Textastic':
        this._symBlockPoke43Hide();
        this._symBlockTextasticShow();

        break;
      }

      this._symBlockActive = true;
    }

    this[`_langBlock${this._langBlockLayout}Hide`]();
    this[`_langBlock${this._langBlockLayout}Show`]();
  }

  cycleSymBlockLayouts() {
    if (!this._symBlockActive) {
      return;
    }

    switch (this._symBlockLayout) {
    case 'Poke43':
      this._symBlockPoke43Hide();
      this._symBlockTextasticShow();

      this._symBlockLayout = 'Textastic';

      break;
    case 'Textastic':
      this._symBlockTextasticHide();
      this._symBlockPoke43Show();

      this._symBlockLayout = 'Poke43';

      break;
    }
  }

  toggleCustBlock() {
    /*if (this._custBlockActive) {
      this._custBlockHide();

      this._custBlockActive = false;
    } else {
      this._custBlockShow();

      this._custBlockActive = true;
    }*/
  }

  cycleLangBlockLayouts() {
    switch (this._langBlockLayout) {
    case 'EnUsQwerty':
      this._langBlockEnUsQwertyHide();
      this._langBlockBgBgPhoneticShow();

      this._langBlockLayout = 'BgBgPhonetic';

      break;
    case 'BgBgPhonetic':
      this._langBlockBgBgPhoneticHide();
      this._langBlockEnUsQwertyShow();

      this._langBlockLayout = 'EnUsQwerty';

      break;
    }
  }

  hide() {
    if (this._el.style.display !== 'none') {
      this._el.style.display = 'none';
      this._editor._el.classList.remove('poke43-editor-editing');
      // NOTE: Passing editor instance needed for CodeMirror interop
      this._editor._view.hideCaret(this._editor);
    }
  }

  show() {
    if (this._el.style.display === 'none') {
      this._el.style.display = '';
      this._editor._el.classList.add('poke43-editor-editing');
      // NOTE: Passing editor instance needed for CodeMirror interop
      this._editor._view.showCaret(this._editor);
    }
  }

  expandAbbreviation() {
    this._editor.expandAbbreviation();
  }

  evalJS() {
    this._editor.evalJS();
  }
}

export {
  Key,
  EditorKey,
  EditorKeyCharacter,
  EditorKeyCharacterSpaceMove,
  EditorKeyCharacterSpaceMoveWB,
  EditorKeyCharacterEnterDelete,
  EditorKeyCharacterEnterDeleteWB,
  EditorKeyCharSymSpaceMove,
  EditorKeyCharSymSpaceMoveWB,
  EditorKeyCharSymEnterDelete,
  EditorKeyCharSymEnterDeleteWB,
  EditorKeySymbol,
  EditorKeyCustom,
  KeyboardKey
};
export default Keyboard;
