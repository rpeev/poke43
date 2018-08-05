import {
  name as LIB_NAME,
  version as LIB_VERSION
} from '../package.json';
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

class Poke {
  constructor(el) {
    this._el = el;
    this._elEditor = document.createElement('div');
    this._editor = new Editor(this._elEditor);
    this._elKeyboard = document.createElement('div');
    this._keyboard = new Keyboard(this._editor, this._elKeyboard);

    this._el.classList.add('poke43-poke');
    this._el.textContent = '';
    this._el.appendChild(this._elEditor);
    this._el.appendChild(this._elKeyboard);

    this._editor._hammer.on('tap', ev => this._keyboard.show());
  }
}

const poke43 = {
  get [Symbol.toStringTag]() {
    return LIB_NAME;
  },
  version: LIB_VERSION,
  Poke,
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

export {
  Poke,
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
