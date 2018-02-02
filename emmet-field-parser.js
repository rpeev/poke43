(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.emmetFieldParser = {})));
}(this, (function (exports) { 'use strict';

/**
 * A streaming, character code-based string reader
 */
class StreamReader {
	constructor(string, start, end) {
		if (end == null && typeof string === 'string') {
			end = string.length;
		}

		this.string = string;
		this.pos = this.start = start || 0;
		this.end = end;
	}

	/**
	 * Returns true only if the stream is at the end of the file.
	 * @returns {Boolean}
	 */
	eof() {
		return this.pos >= this.end;
	}

	/**
	 * Creates a new stream instance which is limited to given `start` and `end`
	 * range. E.g. its `eof()` method will look at `end` property, not actual
	 * stream end
	 * @param  {Point} start
	 * @param  {Point} end
	 * @return {StreamReader}
	 */
	limit(start, end) {
		return new this.constructor(this.string, start, end);
	}

	/**
	 * Returns the next character code in the stream without advancing it.
	 * Will return NaN at the end of the file.
	 * @returns {Number}
	 */
	peek() {
		return this.string.charCodeAt(this.pos);
	}

	/**
	 * Returns the next character in the stream and advances it.
	 * Also returns <code>undefined</code> when no more characters are available.
	 * @returns {Number}
	 */
	next() {
		if (this.pos < this.string.length) {
			return this.string.charCodeAt(this.pos++);
		}
	}

	/**
	 * `match` can be a character code or a function that takes a character code
	 * and returns a boolean. If the next character in the stream 'matches'
	 * the given argument, it is consumed and returned.
	 * Otherwise, `false` is returned.
	 * @param {Number|Function} match
	 * @returns {Boolean}
	 */
	eat(match) {
		const ch = this.peek();
		const ok = typeof match === 'function' ? match(ch) : ch === match;

		if (ok) {
			this.next();
		}

		return ok;
	}

	/**
	 * Repeatedly calls <code>eat</code> with the given argument, until it
	 * fails. Returns <code>true</code> if any characters were eaten.
	 * @param {Object} match
	 * @returns {Boolean}
	 */
	eatWhile(match) {
		const start = this.pos;
		while (!this.eof() && this.eat(match)) {}
		return this.pos !== start;
	}

	/**
	 * Backs up the stream n characters. Backing it up further than the
	 * start of the current token will cause things to break, so be careful.
	 * @param {Number} n
	 */
	backUp(n) {
		this.pos -= (n || 1);
	}

	/**
	 * Get the string between the start of the current token and the
	 * current stream position.
	 * @returns {String}
	 */
	current() {
		return this.substring(this.start, this.pos);
	}

	/**
	 * Returns substring for given range
	 * @param  {Number} start
	 * @param  {Number} [end]
	 * @return {String}
	 */
	substring(start, end) {
		return this.string.slice(start, end);
	}

	/**
	 * Creates error object with current stream state
	 * @param {String} message
	 * @return {Error}
	 */
	error(message) {
		const err = new Error(`${message} at char ${this.pos + 1}`);
		err.originalMessage = message;
		err.pos = this.pos;
		err.string = this.string;
		return err;
	}
}

/**
 * Methods for consuming quoted values
 */

/**
 * Check if given code is a number
 * @param  {Number}  code
 * @return {Boolean}
 */
function isNumber(code) {
	return code > 47 && code < 58;
}

const DOLLAR      = 36;  // $
const COLON       = 58;  // :
const ESCAPE      = 92;  // \
const OPEN_BRACE  = 123; // {
const CLOSE_BRACE = 125; // }

/**
 * Finds fields in given string and returns object with field-less string
 * and array of fileds found
 * @param  {String} string
 * @return {Object}
 */
function parse(string) {
	const stream = new StreamReader(string);
	const fields = [];
	let cleanString = '', offset = 0, pos = 0;
	let code, field;

	while (!stream.eof()) {
		code = stream.peek();
		pos = stream.pos;

		if (code === ESCAPE) {
			stream.next();
			stream.next();
		} else if (field = consumeField(stream, cleanString.length + pos - offset)) {
			fields.push(field);
			cleanString += stream.string.slice(offset, pos) + field.placeholder;
			offset = stream.pos;
		} else {
			stream.next();
		}
	}

	return new FieldString(cleanString + stream.string.slice(offset), fields);
}

/**
 * Marks given `string` with `fields`: wraps each field range with
 * `${index:placeholder}` (by default) or any other token produced by `token`
 * function, if provided
 * @param  {String} string String to mark
 * @param  {Array} fields Array of field descriptor. A field descriptor is a
 * `{index, location, length}` array. It is important that fields in array
 * must be ordered by their location in string: some fields my refer the same
 * location so they must appear in order that user expects.
 * @param  {Function} [token] Function that generates field token. This function
 * received two arguments: `index` and `placeholder` and should return string
 * @return {String}  String with marked fields
 */
function mark(string, fields, token) {
	token = token || createToken;

	// order fields by their location and appearence
	// NB field ranges should not overlap! (not supported yet)
	const ordered = fields
	.map((field, order) => ({order, field, end: field.location + field.length}))
	.sort((a, b) => (a.end - b.end) || (a.order - b.order));

	// mark ranges in string
	let offset = 0;
	const result = ordered.map(item => {
		const placeholder = string.substr(item.field.location, item.field.length);
		const prefix = string.slice(offset, item.field.location);
		offset = item.end;
		return prefix + token(item.field.index, placeholder);
	});

	return result.join('') + string.slice(offset);
}

/**
 * Creates field token for string
 * @param  {Number} index       Field index
 * @param  {String} placeholder Field placeholder, could be empty string
 * @return {String}
 */
function createToken(index, placeholder) {
	return placeholder ? `\${${index}:${placeholder}}` : `\${${index}}`;
}

/**
 * Consumes field from current stream position: it can be an `$index` or
 * or `${index}` or `${index:placeholder}`
 * @param  {StreamReader} stream
 * @param  {Number}       location Field location in *clean* string
 * @return {Object} Object with `index` and `placeholder` properties if
 * fieald was successfully consumed, `null` otherwise
 */
function consumeField(stream, location) {
	const start = stream.pos;

	if (stream.eat(DOLLAR)) {
		// Possible start of field
		let index = consumeIndex(stream);
		let placeholder = '';

		// consumed $index placeholder
		if (index != null) {
			return new Field(index, placeholder, location);
		}

		if (stream.eat(OPEN_BRACE)) {
			index = consumeIndex(stream);
			if (index != null) {
				if (stream.eat(COLON)) {
					placeholder = consumePlaceholder(stream);
				}

				if (stream.eat(CLOSE_BRACE)) {
					return new Field(index, placeholder, location);
				}
			}
		}
	}

	// If we reached here then there’s no valid field here, revert
	// back to starting position
	stream.pos = start;
}

/**
 * Consumes a placeholder: value right after `:` in field. Could be empty
 * @param  {StreamReader} stream
 * @return {String}
 */
function consumePlaceholder(stream) {
	let code;
	const stack = [];
	stream.start = stream.pos;

	while (!stream.eof()) {
		code = stream.peek();

		if (code === OPEN_BRACE) {
			stack.push(stream.pos);
		} else if (code === CLOSE_BRACE) {
			if (!stack.length) {
				break;
			}
			stack.pop();
		}
		stream.next();
	}

	if (stack.length) {
		throw stream.error('Unable to find matching "}" for curly brace at ' + stack.pop());
	}

	return stream.current();
}

/**
 * Consumes integer from current stream position
 * @param  {StreamReader} stream
 * @return {Number}
 */
function consumeIndex(stream) {
	stream.start = stream.pos;
	if (stream.eatWhile(isNumber)) {
		return Number(stream.current());
	}
}

class Field {
	constructor(index, placeholder, location) {
		this.index = index;
		this.placeholder = placeholder;
		this.location = location;
		this.length = this.placeholder.length;
	}
}

class FieldString {
	/**
	 * @param {String} string
	 * @param {Field[]} fields
	 */
	constructor(string, fields) {
		this.string = string;
		this.fields = fields;
	}

	mark(token) {
		return mark(this.string, this.fields, token);
	}

	toString() {
		return string;
	}
}

exports.parse = parse;
exports.mark = mark;
exports.createToken = createToken;

Object.defineProperty(exports, '__esModule', { value: true });

})));
