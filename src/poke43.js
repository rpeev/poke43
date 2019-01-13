import poke43 from './base.js';
import './styles/base.scss';
import Editor, {
  EditorModel,
  EditorView
} from './editor';
import Keyboard, {
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
} from './keyboard';
import {pokeized} from './codemirror';

class Poke {
  constructor(el, {
    codemirror = null
  } = {}) {
    this._el = el;

    this._el.classList.add('poke43-poke');

    if (codemirror) {
      Poke.PokeMirror = Poke.PokeMirror || pokeized(CodeMirror);

      this._editor = new Poke.PokeMirror(this._el, codemirror);
      this._keyboard = this._editor._keyboard;
    } else {
      this._elEditor = document.createElement('div');
      this._editor = new Editor(this._elEditor);
      this._elKeyboard = document.createElement('div');
      this._keyboard = new Keyboard(this._editor, this._elKeyboard);

      this._el.textContent = '';
      this._el.appendChild(this._elEditor);
      this._el.appendChild(this._elKeyboard);

      this._editor._hammer.on('tap', ev => this._keyboard.show());
    }
  }
}

Object.assign(poke43, {
  Poke,
  pokeized,
  Editor,
  EditorModel,
  EditorView,
  Keyboard,
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
});

export {
  Poke,
  pokeize,
  Editor,
  EditorModel,
  EditorView,
  Keyboard,
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
export default poke43;
