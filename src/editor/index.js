import Hammer from 'hammerjs';
import emmet from '@emmetio/expand-abbreviation';
import emmetExtractAbbreviation from '@emmetio/extract-abbreviation';
import emmetParseFields, {
  createToken as emmetCreateToken
} from '@emmetio/field-parser';

import './styles/editor.scss';
import EditorModel from './model';
import EditorView from './view';

class Editor {
  constructor(el) {
    this._el = el;
    this._model = new EditorModel(this._el.textContent);
    this._view = new EditorView(this._el, this._model);
    this._hammer = new Hammer.Manager(this._el, {
      touchAction: 'auto'
    });
    this._tap = new Hammer.Tap();
    this._tap2 = new Hammer.Tap({
      event: 'tap2',
      taps: 2,
      interval: 500
    });
    this._tap3 = new Hammer.Tap({
      event: 'tap3',
      taps: 3,
      interval: 500
    });

    this._view.renderFully();

    this._tap2.recognizeWith(this._tap);
    this._tap3.recognizeWith(this._tap);

    this._hammer.add(this._tap);
    this._hammer.add(this._tap2);
    this._hammer.add(this._tap3);

    this._hammer.on('tap', ev => {
      ev.preventDefault(); // Prevent zoom on double-tap

      this._handleTap(ev);
    });
    this._hammer.on('tap2', ev => {
      this._handleTap2(ev);
    });
    this._hammer.on('tap3', ev => {
      this._handleTap3(ev);
    });
  }

  get content() {
    return this._model.content;
  }

  set content(text) {
    this._model.content = text;
    this._view.renderFully();
  }

  _handleTap(ev) {
    let newCaret = this._view.modelIndices(
      this._view.scrollTouchCoords(this._view.touchCoords(ev))
    );

    this._model.moveCaret(newCaret.iLine, newCaret.iColumn);
    this._view.renderCaretLine();
  }

  _handleTap2(ev) {
    
  }

  _handleTap3(ev) {
    
  }

  _handleMoveBackwardAtSOL() {
    if (this._model.caretIsAtSOL) {
      if (!this._model.caretIsAtFirstLine) {
        this._model.moveToPrevEOL();
        this._view.renderCaretLine();
      }

      return true;
    }

    return false;
  }

  _handleMoveForwardAtEOL() {
    if (this._model.caretIsAtEOL) {
      if (!this._model.caretIsAtLastLine) {
        this._model.moveToNextSOL();
        this._view.renderCaretLine();
      }

      return true;
    }

    return false;
  }

  _joinCaretLineWithNext() {
    let iNextLine = this._model.caret.iLine + 1;

    this._model.updateCaretLine(`${this._model.caretLine}${this._model.line(iNextLine)}`);
    this._model.removeLine(iNextLine);
    this._view.removeLine(iNextLine);
    this._view.renderCaretLine();
  }

  _handleDeleteBackwardAtSOL() {
    if (this._model.caretIsAtSOL) {
      if (!this._model.caretIsAtFirstLine) {
        this._model.moveToPrevEOL();
        this._joinCaretLineWithNext();
      }

      return true;
    }

    return false;
  }

  _handleDeleteForwardAtEOL() {
    if (this._model.caretIsAtEOL) {
      if (!this._model.caretIsAtLastLine) {
        this._joinCaretLineWithNext();
      }

      return true;
    }

    return false;
  }

  _smartMoveBackward(editData) {
    if (editData.part1.length > 1 &&
      this._model.isIndentOnly(editData.part1)
    ) {
      editData.columnDelta += 1;
    }
  }

  moveBackward() {
    if (this._handleMoveBackwardAtSOL()) {
      return this;
    }

    let [part1, part2] = this._model.caretLineParts;
    let editData = {
      part1: part1,
      part2: part2,
      columnDelta: 1
    };

    this._smartMoveBackward(editData);

    this._model.moveBackward(editData.columnDelta);
    this._view.updateCaretLine();

    return this;
  }

  moveForward() {
    if (this._handleMoveForwardAtEOL()) {
      return this;
    }

    this._model.moveForward();
    this._view.updateCaretLine();

    return this;
  }

  moveBackwardWB() {
    if (this._handleMoveBackwardAtSOL()) {
      return this;
    }

    let [part1, part2] = this._model.caretLineParts;
    let match = part1.match(/(\w+)$/);

    if (match) {
      this._model.moveBackward(match[1].length);
      this._view.updateCaretLine();
    } else {
      let match = part1.match(/(\W+)$/);

      if (match) {
        this._model.moveBackward(match[1].length);
        this._view.updateCaretLine();
      }
    }

    return this;
  }

  moveForwardWB() {
    if (this._handleMoveForwardAtEOL()) {
      return this;
    }

    let [part1, part2] = this._model.caretLineParts;
    let match = part2.match(/^(\w+)/);

    if (match) {
      this._model.moveForward(match[1].length);
      this._view.updateCaretLine();
    } else {
      let match = part2.match(/^(\W+)/);

      if (match) {
        this._model.moveForward(match[1].length);
        this._view.updateCaretLine();
      }
    }

    return this;
  }

  moveToSOL() {
    if (this._handleMoveBackwardAtSOL()) {
      return this;
    }

    this._model.moveToSOL();
    this._view.updateCaretLine();

    return this;
  }

  moveToEOL() {
    if (this._handleMoveForwardAtEOL()) {
      return this;
    }

    this._model.moveToEOL();
    this._view.updateCaretLine();

    return this;
  }

  moveToStart() {
    this._model.moveToStart();
    this._view.renderCaretLine();

    return this;
  }

  moveToEnd() {
    this._model.moveToEnd();
    this._view.renderCaretLine();

    return this;
  }

  deleteBackward() {
    if (this._handleDeleteBackwardAtSOL()) {
      return this;
    }

    let [part1, part2] = this._model.caretLineParts;
    let editData = {
      part1: part1,
      part2: part2,
      columnDelta: 1
    };

    this._smartMoveBackward(editData);

    this._model.deleteBackward(editData.columnDelta);
    this._view.updateCaretLine();

    return this;
  }

  deleteForward() {
    if (this._handleDeleteForwardAtEOL()) {
      return this;
    }

    this._model.deleteForward();
    this._view.updateCaretLine();

    return this;
  }

  deleteBackwardWB() {
    if (this._handleDeleteBackwardAtSOL()) {
      return this;
    }

    let [part1, part2] = this._model.caretLineParts;
    let match = part1.match(/(\w+)$/);

    if (match) {
      this._model.deleteBackward(match[1].length);
      this._view.updateCaretLine();
    } else {
      let match = part1.match(/(\W+)$/);

      if (match) {
        this._model.deleteBackward(match[1].length);
        this._view.updateCaretLine();
      }
    }

    return this;
  }

  deleteForwardWB() {
    if (this._handleDeleteForwardAtEOL()) {
      return this;
    }

    let [part1, part2] = this._model.caretLineParts;
    let match = part2.match(/^(\w+)/);

    if (match) {
      this._model.deleteForward(match[1].length);
      this._view.updateCaretLine();
    } else {
      let match = part2.match(/(^\W+)/);

      if (match) {
        this._model.deleteForward(match[1].length);
        this._view.updateCaretLine();
      }
    }

    return this;
  }

  _smartLParen(editData) {
    if (this._model.startsWithWord(editData.part2)) {
      return;
    }

    editData.part += ')';
  }

  _smartLBracket(editData) {
    if (this._model.startsWithWord(editData.part2)) {
      return;
    }

    editData.part += ']';
  }

  _smartLBrace(editData) {
    if (this._model.startsWithWord(editData.part2)) {
      return;
    }

    editData.part += '}';
  }

  _smartApostrophe(editData) {
    if (this._model.endsWithWord(editData.part1) ||
      this._model.startsWithWord(editData.part2)
    ) {
      return;
    }

    editData.part += '\'';
  }

  _smartQuote(editData) {
    if (this._model.endsWithWord(editData.part1) ||
      this._model.startsWithWord(editData.part2)
    ) {
      return;
    }

    editData.part += '"';
  }

  _smartBacktick(editData) {
    if (this._model.endsWithWord(editData.part1) ||
      this._model.startsWithWord(editData.part2)
    ) {
      return;
    }

    editData.part += '`';
  }

  _smartSpace(editData) {
    if (this._model.isIndentOnly(editData.part1)) {
      editData.part += ' ';
      editData.columnDelta += 1;
    }
  }

  _smartNewline(editData) {
    let prevChar = editData.part1[editData.part1.length - 1];
    let nextChar = editData.part2[0];
    let indent = this._model.getIndent(editData.part1);

    if (
      (prevChar === '(' && nextChar === ')') ||
      (prevChar === '[' && nextChar === ']') ||
      (prevChar === '{' && nextChar === '}')
    ) {
      editData.part += `${indent}  \n${indent}`;
      editData.columnDelta += indent.length + 2;
    } else if(
      (prevChar === '(' && nextChar !== ')') ||
      (prevChar === '[' && nextChar !== ']') ||
      (prevChar === '{' && nextChar !== '}')
    ) {
      editData.part += `${indent}  `;
      editData.columnDelta += indent.length + 2;
    } else {
      editData.part += indent;
      editData.columnDelta += indent.length;
    }
  }

  // Assumes at least one newline in editData.part
  _modelEditData(editData) {
    let insertAfterCaretLine = editData.part.split('\n');
    let updateCaretLine = `${editData.part1}${insertAfterCaretLine.shift()}`;
    let iLast = insertAfterCaretLine.length - 1;

    insertAfterCaretLine[iLast] = `${insertAfterCaretLine[iLast]}${editData.part2}`;

    let partBeforeNewCaret = editData.part.slice(0, editData.columnDelta);
    let partBeforeNewCaretLines = partBeforeNewCaret.split('\n');
    let newlinesBeforeNewCaret = partBeforeNewCaretLines.length - 1;

    return {
      updateCaretLine: updateCaretLine,
      insertAfterCaretLine: insertAfterCaretLine,
      newCaret: {
        iLine: editData.caret.iLine + newlinesBeforeNewCaret,
        iColumn: partBeforeNewCaretLines[newlinesBeforeNewCaret].length
      }
    };
  }

  // TODO: Unify this and the various adhoc single line edits into one method
  _applyEdit(editData) {
    let modelEditData = this._modelEditData(editData);

    this._model.updateCaretLine(modelEditData.updateCaretLine);
    modelEditData.insertAfterCaretLine.forEach((line, i) => {
      this._model.insertLineAfter(editData.caret.iLine + i, line);
      this._view.insertLineAfter(editData.caret.iLine + i);
      this._view.renderLine(editData.caret.iLine + i + 1);
    });
    this._model.moveCaret(modelEditData.newCaret.iLine, modelEditData.newCaret.iColumn);
    this._view.renderCaretLine();
  }

  insert(part) {
    let [part1, part2] = this._model.caretLineParts;
    let editData = {
      caret: this._model.caret,
      part1: part1,
      part2: part2,
      part: part,
      columnDelta: part.length
    };

    switch (part) {
    case '(': this._smartLParen(editData); break;
    case '[': this._smartLBracket(editData); break;
    case '{': this._smartLBrace(editData); break;
    case '\'': this._smartApostrophe(editData); break;
    case '"': this._smartQuote(editData); break;
    case '`': this._smartBacktick(editData); break;
    case ' ': this._smartSpace(editData); break;
    case '\n':
      this._smartNewline(editData);
      this._applyEdit(editData);

      return this;
    }

    this._model.updateCaretLine(`${part1}${editData.part}${part2}`);
    this._model.moveForward(editData.columnDelta);
    this._view.updateCaretLine();

    return this;
  }

  expandAbbreviation() {
    let line = this._model.caretLine;
    let abbr = emmetExtractAbbreviation(
      line,
      this._model.caret.iColumn,
      true
    );

    if (abbr) {
      let part1 = line.slice(0, abbr.location);
      let part2 = line.slice(abbr.location + abbr.abbreviation.length);
      let indent = this._model.getIndent(part1);
      let expanded = emmet.expand(abbr.abbreviation, {
        field: emmetCreateToken,
        profile: {
          indent: '  ',
          selfClosingStyle: 'xhtml'
        }
      });
      let expanded1 = expanded.
        split('\n').
        map((l, i) => (i === 0) ? l : `${indent}${l}`).
        join('\n');
      let {string, fields} = emmetParseFields(expanded1);

      if (expanded1.match(/\n/)) {
        this._applyEdit({
          caret: this._model.caret,
          part1: part1,
          part2: part2,
          part: string,
          columnDelta: (fields.length > 0) ? fields[0].location : string.length
        });
      } else {
        this._model.updateCaretLine(`${part1}${string}${part2}`);
        this._model.moveCaret(this._model.caret.iLine,
          part1.length + ((fields.length > 0) ? fields[0].location : string.length));
        this._view.updateCaretLine();
      }
    }

    return this;
  }

  evalJS() {
    const {toString} = Object.prototype;
    const output = (v, comment) => {
      if (window.peek42) {
        peek42.p(v, (comment !== '') ? comment : ' ');
      } else {
        console.log(`// ${comment}\n${v}`);
      }
    };
    const snip = (str, n) => {
      let str1 = str.replace(/\s+/gm, ' ');

      return (str1.length > n) ? `${str1.slice(0, n)}...` : str1;
    };
    let src = this.content;
    let excerpt = snip(src, 101);
    let eval2 = eval;
    let res;

    try {
      res = eval2(src);
    } catch (err) {
      if (!err.sourceURL) {
        err.sourceText = src;
      }

      throw err;
    }

    switch (typeof res) {
    case 'boolean':
    case 'number':
    case 'string':
      output(res, excerpt); break;
    case 'symbol':
      output(String(res), excerpt); break;
    case 'object':
    case 'function':
      output(toString.call(res), excerpt); break;
    case 'undefined':
    default:
      output('\u2713', excerpt); break;
    }

    return this;
  }
}

export {
  EditorModel,
  EditorView
};
export default Editor;
