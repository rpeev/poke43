class EditorView {
  constructor(el, model) {
    this._el = el;
    this._model = model;

    this._el.classList.add('poke43-editor');
    this._el.classList.add('poke43-editor-editing');
  }

  get _renderedCaretLineIndex() {
    return Number(this._el.dataset.renderedCaretLineIndex);
  }

  set _renderedCaretLineIndex(iLine) {
    this._el.dataset.renderedCaretLineIndex = iLine;
  }

  get _lineHTML() {
    return `<span class="poke43-line-part">\u200b</span>`;
  }

  get _caretLineHTML() {
    return `<span class="poke43-line-part poke43-line-part1">\u200b</span>\
<span class="poke43-line-part poke43-line-caret poke43-blink-border-color">\u200b</span>\
<span class="poke43-line-part poke43-line-part2">\u200b</span>`;
  }

  insertLineBefore(iLine) {
    let elRefLine = this._el.children[iLine];
    let elNewLine = document.createElement('div');

    elNewLine.classList.add('poke43-line');

    this._el.insertBefore(elNewLine, elRefLine);

    return this;
  }

  insertLineAfter(iLine) {
    let elRefLine = this._el.children[iLine].nextElementSibling;
    let elNewLine = document.createElement('div');

    elNewLine.classList.add('poke43-line');

    this._el.insertBefore(elNewLine, elRefLine);

    return this;
  }

  removeLine(iLine) {
    let elLine = this._el.children[iLine];

    this._el.removeChild(elLine);

    return this;
  }

  renderLine(iLine) {
    let line = this._model.line(iLine);
    let elLine = this._el.children[iLine];

    elLine.classList.remove('poke43-line-active');
    elLine.innerHTML = this._lineHTML;
    elLine.children[0].textContent = line || '\u200b';

    return this;
  }

  renderCaretLine() {
    let renderedCaretLineIndex = this._renderedCaretLineIndex;
    let {iLine} = this._model.caret;
    let [part1, part2] = this._model.caretLineParts;
    let elLine = this._el.children[iLine];

    if (!Number.isNaN(renderedCaretLineIndex) && iLine != renderedCaretLineIndex) {
      try {
        // TODO: Line insertion/removal can make renderedCaretLineIndex incorrect/invalid, recalc on insert/remove?
        this.renderLine(renderedCaretLineIndex);
      } catch (err) {}
    }
    this._renderedCaretLineIndex = iLine;

    elLine.classList.add('poke43-line-active');
    elLine.innerHTML = this._caretLineHTML;
    elLine.children[0].textContent = part1 || '\u200b';
    elLine.children[2].textContent = part2 || '\u200b';

    this.revealCaret();

    return this;
  }

  renderFully() {
    this._el.textContent = '';

    this._model.lines.forEach((line, i) => {
      this.insertLineBefore(i);
      this.renderLine(i);
    });

    return this.renderCaretLine();
  }

  updateLine(iLine) {
    let renderedCaretLineIndex = this._renderedCaretLineIndex;
    let line = this._model.line(iLine);
    let elLine = this._el.children[iLine];

    if (iLine === renderedCaretLineIndex) {
      throw RangeError(`Attempting to update rendered caret line at index ${iLine} like regular line`);
    }

    elLine.children[0].textContent = line || '\u200b';

    return this;
  }

  updateCaretLine() {
    let renderedCaretLineIndex = this._renderedCaretLineIndex;
    let {iLine} = this._model.caret;
    let [part1, part2] = this._model.caretLineParts;
    let elLine = this._el.children[iLine];

    if (iLine != renderedCaretLineIndex) {
      throw RangeError(`Attempting to update rendered regular line at index ${iLine} like caret line (at index ${renderedCaretLineIndex})`);
    }

    elLine.children[0].textContent = part1 || '\u200b';
    elLine.children[2].textContent = part2 || '\u200b';

    this.revealCaret();

    return this;
  }

  hideCaret() {
    let {iLine} = this._model.caret;
    let elLine = this._el.children[iLine];

    elLine.children[1].style.visibility = 'hidden';

    return this;
  }

  showCaret() {
    let {iLine} = this._model.caret;
    let elLine = this._el.children[iLine];

    elLine.children[1].style.visibility = 'visible';

    return this;
  }

  revealCaret() {
    let caretRect = this.caretRect;
    let rect = this.rect;
    let leftDelta = (caretRect.left - 2) - rect.left;
    let topDelta = (caretRect.top - 3) - rect.top;
    let rightDelta = rect.right - (caretRect.right + 2);
    let bottomDelta = rect.bottom - (caretRect.bottom + 3);

    if (leftDelta < 0) {
      this._el.scrollLeft += leftDelta;
    }

    if (topDelta < 0) {
      this._el.scrollTop += topDelta;
    }

    if (rightDelta < 0) {
      this._el.scrollLeft -= rightDelta;
    }

    if (bottomDelta < 0) {
      this._el.scrollTop -= bottomDelta;
    }

    return this;
  }

  get lineHeight() {
    return this._el.children[0].getBoundingClientRect().height;
  }

  get caretRect() {
    let elCaret = this._el.children[this._model.caret.iLine].children[1];

    return elCaret.getBoundingClientRect();
  }

  get rect() {
    return this._el.getBoundingClientRect();
  }

  get scrollPos() {
    return {
      left: this._el.scrollLeft,
      top: this._el.scrollTop
    };
  }

  touchCoords(ev, iPointer = 0) {
    let rect = this.rect;

    return {
      x: ev.pointers[iPointer].clientX - rect.left,
      y: ev.pointers[iPointer].clientY - rect.top
    };
  }

  scrollTouchCoords(touchCoords) {
    let scrollPos = this.scrollPos;

    return {
      x: scrollPos.left + touchCoords.x,
      y: scrollPos.top + touchCoords.y
    };
  }

  // Turns out iColumn calculation works pretty good for non monospaced fonts as well
  modelIndices(scrollTouchCoords) {
    let iLine = Math.min(
      Math.floor(scrollTouchCoords.y / this.lineHeight),
      this._model.lines.length - 1
    );
    let iColumn = this._model.line(iLine).length;
    let elLine = this._el.children[iLine];

    for (let i = 0, len = elLine.children.length; i < len; i++) {
      let elPart = elLine.children[i];
      let text = elPart.textContent;

      if (text.length > 1) {
        let partRect = elPart.getBoundingClientRect();
        let charWidth = partRect.width / text.length;

        iColumn = Math.min(
          Math.floor(scrollTouchCoords.x / charWidth),
          iColumn
        );

        break;
      }
    }

    return {
      iLine: iLine,
      iColumn: iColumn
    };
  }
}

export default EditorView;
