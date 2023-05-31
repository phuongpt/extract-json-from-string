window["extractJson"] =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

var JSONParser = __webpack_require__(1);

var jsonify = function jsonify(almostJson) {
  try {
    return JSON.parse(almostJson);
  } catch (e) {
    almostJson = almostJson.replace(/([a-zA-Z0-9_$]+\s*):/g, '"$1":').replace(/'([^']+?)'([\s,\]\}])/g, '"$1"$2');
    return JSONParser.parse(almostJson);
  }
};

var chars = {
  '[': ']',
  '{': '}'
};

var any = function any(iteree, iterator) {
  var result = void 0;
  for (var i = 0; i < iteree.length; i++) {
    result = iterator(iteree[i], i, iteree);
    if (result) {
      break;
    }
  }
  return result;
};

var extract = function extract(str) {
  var startIndex = str.search(/[\{\[]/);
  if (startIndex === -1) {
    return null;
  }

  var openingChar = str[startIndex];
  var closingChar = chars[openingChar];
  var endIndex = -1;
  var count = 0;

  str = str.substring(startIndex);
  any(str, function (letter, i) {
    if (letter === openingChar) {
      count++;
    } else if (letter === closingChar) {
      count--;
    }

    if (!count) {
      endIndex = i;
      return true;
    }
  });

  if (endIndex === -1) {
    return null;
  }

  var obj = str.substring(0, endIndex + 1);
  return obj;
};

module.exports = function (str) {
  var result = void 0;
  var objects = [];
  while ((result = extract(str)) !== null) {
    try {
      var obj = jsonify(result);
      objects.push(obj);
    } catch (e) {
      // Do nothing
    }
    str = str.replace(result, '');
  }

  return objects;
};

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = void 0;
function parse(s) {
    try {
        return JSON.parse(s);
    }
    catch (e) {
        const [data, reminding] = parseAny(s, e);
        parse.lastParseReminding = reminding;
        if (parse.onExtraToken && reminding.length > 0) {
            parse.onExtraToken(s, data, reminding);
        }
        return data;
    }
}
exports.parse = parse;
(function (parse) {
    parse.onExtraToken = (text, data, reminding) => {
        console.error('parsed json with extra tokens:', {
            text,
            data,
            reminding,
        });
    };
})(parse = exports.parse || (exports.parse = {}));
function parseAny(s, e) {
    const parser = parsers[s[0]];
    if (!parser) {
        console.error(`no parser registered for ${JSON.stringify(s[0])}:`, { s });
        throw e;
    }
    return parser(s, e);
}
const parsers = {};
function skipSpace(s) {
    return s.trimLeft();
}
parsers[' '] = parseSpace;
parsers['\r'] = parseSpace;
parsers['\n'] = parseSpace;
parsers['\t'] = parseSpace;
function parseSpace(s, e) {
    s = skipSpace(s);
    return parseAny(s, e);
}
parsers['['] = parseArray;
function parseArray(s, e) {
    s = s.substr(1); // skip starting '['
    const acc = [];
    s = skipSpace(s);
    for (; s.length > 0;) {
        if (s[0] === ']') {
            s = s.substr(1); // skip ending ']'
            break;
        }
        const res = parseAny(s, e);
        acc.push(res[0]);
        s = res[1];
        s = skipSpace(s);
        if (s[0] === ',') {
            s = s.substring(1);
            s = skipSpace(s);
        }
    }
    return [acc, s];
}
for (const c of '0123456789.-'.slice()) {
    parsers[c] = parseNumber;
}
function parseNumber(s) {
    for (let i = 0; i < s.length; i++) {
        const c = s[i];
        if (parsers[c] === parseNumber) {
            continue;
        }
        const num = s.substring(0, i);
        s = s.substring(i);
        return [numToStr(num), s];
    }
    return [numToStr(s), ''];
}
function numToStr(s) {
    if (s === '-') {
        return -0;
    }
    const num = +s;
    if (Number.isNaN(num)) {
        return s;
    }
    return num;
}
parsers['"'] = parseString;
function parseString(s) {
    for (let i = 1; i < s.length; i++) {
        const c = s[i];
        if (c === '\\') {
            i++;
            continue;
        }
        if (c === '"') {
            const str = s.substring(0, i + 1);
            s = s.substring(i + 1);
            return [JSON.parse(str), s];
        }
    }
    return [JSON.parse(s + '"'), ''];
}
parsers['{'] = parseObject;
function parseObject(s, e) {
    s = s.substr(1); // skip starting '{'
    const acc = {};
    s = skipSpace(s);
    for (; s.length > 0;) {
        if (s[0] === '}') {
            s = s.substr(1); // skip ending '}'
            break;
        }
        const keyRes = parseAny(s, e);
        const key = keyRes[0];
        s = keyRes[1];
        s = skipSpace(s);
        if (s[0] !== ':') {
            acc[key] = undefined;
            break;
        }
        s = s.substr(1); // skip ':'
        s = skipSpace(s);
        if (s.length === 0) {
            acc[key] = undefined;
            break;
        }
        const valueRes = parseAny(s, e);
        acc[key] = valueRes[0];
        s = valueRes[1];
        s = skipSpace(s);
        if (s[0] === ',') {
            s = s.substr(1);
            s = skipSpace(s);
        }
    }
    return [acc, s];
}
parsers['t'] = parseTrue;
function parseTrue(s, e) {
    return parseToken(s, `true`, true, e);
}
parsers['f'] = parseFalse;
function parseFalse(s, e) {
    return parseToken(s, `false`, false, e);
}
parsers['n'] = parseNull;
function parseNull(s, e) {
    return parseToken(s, `null`, null, e);
}
function parseToken(s, tokenStr, tokenVal, e) {
    for (let i = tokenStr.length; i >= 1; i--) {
        if (s.startsWith(tokenStr.slice(0, i))) {
            return [tokenVal, s.slice(i)];
        }
    }
    /* istanbul ignore next */
    {
        const prefix = JSON.stringify(s.slice(0, tokenStr.length));
        console.error(`unknown token starting with ${prefix}:`, { s });
        throw e;
    }
}
//# sourceMappingURL=parse.js.map

/***/ })
/******/ ]);