/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ({

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(190);
	__webpack_require__(193);
	__webpack_require__(195);
	__webpack_require__(202);
	module.exports = __webpack_require__(203);


/***/ },

/***/ 189:
/***/ function(module, exports) {

	// shim for using process in browser

	var process = module.exports = {};
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = setTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    clearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        setTimeout(drainQueue, 0);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },

/***/ 190:
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {module.exports = global["$"] = __webpack_require__(191);
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },

/***/ 191:
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {module.exports = global["jQuery"] = __webpack_require__(192);
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },

/***/ 192:
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
	 * jQuery JavaScript Library v2.2.3
	 * http://jquery.com/
	 *
	 * Includes Sizzle.js
	 * http://sizzlejs.com/
	 *
	 * Copyright jQuery Foundation and other contributors
	 * Released under the MIT license
	 * http://jquery.org/license
	 *
	 * Date: 2016-04-05T19:26Z
	 */

	(function( global, factory ) {

		if ( typeof module === "object" && typeof module.exports === "object" ) {
			// For CommonJS and CommonJS-like environments where a proper `window`
			// is present, execute the factory and get jQuery.
			// For environments that do not have a `window` with a `document`
			// (such as Node.js), expose a factory as module.exports.
			// This accentuates the need for the creation of a real `window`.
			// e.g. var jQuery = require("jquery")(window);
			// See ticket #14549 for more info.
			module.exports = global.document ?
				factory( global, true ) :
				function( w ) {
					if ( !w.document ) {
						throw new Error( "jQuery requires a window with a document" );
					}
					return factory( w );
				};
		} else {
			factory( global );
		}

	// Pass this if window is not defined yet
	}(typeof window !== "undefined" ? window : this, function( window, noGlobal ) {

	// Support: Firefox 18+
	// Can't be in strict mode, several libs including ASP.NET trace
	// the stack via arguments.caller.callee and Firefox dies if
	// you try to trace through "use strict" call chains. (#13335)
	//"use strict";
	var arr = [];

	var document = window.document;

	var slice = arr.slice;

	var concat = arr.concat;

	var push = arr.push;

	var indexOf = arr.indexOf;

	var class2type = {};

	var toString = class2type.toString;

	var hasOwn = class2type.hasOwnProperty;

	var support = {};



	var
		version = "2.2.3",

		// Define a local copy of jQuery
		jQuery = function( selector, context ) {

			// The jQuery object is actually just the init constructor 'enhanced'
			// Need init if jQuery is called (just allow error to be thrown if not included)
			return new jQuery.fn.init( selector, context );
		},

		// Support: Android<4.1
		// Make sure we trim BOM and NBSP
		rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

		// Matches dashed string for camelizing
		rmsPrefix = /^-ms-/,
		rdashAlpha = /-([\da-z])/gi,

		// Used by jQuery.camelCase as callback to replace()
		fcamelCase = function( all, letter ) {
			return letter.toUpperCase();
		};

	jQuery.fn = jQuery.prototype = {

		// The current version of jQuery being used
		jquery: version,

		constructor: jQuery,

		// Start with an empty selector
		selector: "",

		// The default length of a jQuery object is 0
		length: 0,

		toArray: function() {
			return slice.call( this );
		},

		// Get the Nth element in the matched element set OR
		// Get the whole matched element set as a clean array
		get: function( num ) {
			return num != null ?

				// Return just the one element from the set
				( num < 0 ? this[ num + this.length ] : this[ num ] ) :

				// Return all the elements in a clean array
				slice.call( this );
		},

		// Take an array of elements and push it onto the stack
		// (returning the new matched element set)
		pushStack: function( elems ) {

			// Build a new jQuery matched element set
			var ret = jQuery.merge( this.constructor(), elems );

			// Add the old object onto the stack (as a reference)
			ret.prevObject = this;
			ret.context = this.context;

			// Return the newly-formed element set
			return ret;
		},

		// Execute a callback for every element in the matched set.
		each: function( callback ) {
			return jQuery.each( this, callback );
		},

		map: function( callback ) {
			return this.pushStack( jQuery.map( this, function( elem, i ) {
				return callback.call( elem, i, elem );
			} ) );
		},

		slice: function() {
			return this.pushStack( slice.apply( this, arguments ) );
		},

		first: function() {
			return this.eq( 0 );
		},

		last: function() {
			return this.eq( -1 );
		},

		eq: function( i ) {
			var len = this.length,
				j = +i + ( i < 0 ? len : 0 );
			return this.pushStack( j >= 0 && j < len ? [ this[ j ] ] : [] );
		},

		end: function() {
			return this.prevObject || this.constructor();
		},

		// For internal use only.
		// Behaves like an Array's method, not like a jQuery method.
		push: push,
		sort: arr.sort,
		splice: arr.splice
	};

	jQuery.extend = jQuery.fn.extend = function() {
		var options, name, src, copy, copyIsArray, clone,
			target = arguments[ 0 ] || {},
			i = 1,
			length = arguments.length,
			deep = false;

		// Handle a deep copy situation
		if ( typeof target === "boolean" ) {
			deep = target;

			// Skip the boolean and the target
			target = arguments[ i ] || {};
			i++;
		}

		// Handle case when target is a string or something (possible in deep copy)
		if ( typeof target !== "object" && !jQuery.isFunction( target ) ) {
			target = {};
		}

		// Extend jQuery itself if only one argument is passed
		if ( i === length ) {
			target = this;
			i--;
		}

		for ( ; i < length; i++ ) {

			// Only deal with non-null/undefined values
			if ( ( options = arguments[ i ] ) != null ) {

				// Extend the base object
				for ( name in options ) {
					src = target[ name ];
					copy = options[ name ];

					// Prevent never-ending loop
					if ( target === copy ) {
						continue;
					}

					// Recurse if we're merging plain objects or arrays
					if ( deep && copy && ( jQuery.isPlainObject( copy ) ||
						( copyIsArray = jQuery.isArray( copy ) ) ) ) {

						if ( copyIsArray ) {
							copyIsArray = false;
							clone = src && jQuery.isArray( src ) ? src : [];

						} else {
							clone = src && jQuery.isPlainObject( src ) ? src : {};
						}

						// Never move original objects, clone them
						target[ name ] = jQuery.extend( deep, clone, copy );

					// Don't bring in undefined values
					} else if ( copy !== undefined ) {
						target[ name ] = copy;
					}
				}
			}
		}

		// Return the modified object
		return target;
	};

	jQuery.extend( {

		// Unique for each copy of jQuery on the page
		expando: "jQuery" + ( version + Math.random() ).replace( /\D/g, "" ),

		// Assume jQuery is ready without the ready module
		isReady: true,

		error: function( msg ) {
			throw new Error( msg );
		},

		noop: function() {},

		isFunction: function( obj ) {
			return jQuery.type( obj ) === "function";
		},

		isArray: Array.isArray,

		isWindow: function( obj ) {
			return obj != null && obj === obj.window;
		},

		isNumeric: function( obj ) {

			// parseFloat NaNs numeric-cast false positives (null|true|false|"")
			// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
			// subtraction forces infinities to NaN
			// adding 1 corrects loss of precision from parseFloat (#15100)
			var realStringObj = obj && obj.toString();
			return !jQuery.isArray( obj ) && ( realStringObj - parseFloat( realStringObj ) + 1 ) >= 0;
		},

		isPlainObject: function( obj ) {
			var key;

			// Not plain objects:
			// - Any object or value whose internal [[Class]] property is not "[object Object]"
			// - DOM nodes
			// - window
			if ( jQuery.type( obj ) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
				return false;
			}

			// Not own constructor property must be Object
			if ( obj.constructor &&
					!hasOwn.call( obj, "constructor" ) &&
					!hasOwn.call( obj.constructor.prototype || {}, "isPrototypeOf" ) ) {
				return false;
			}

			// Own properties are enumerated firstly, so to speed up,
			// if last one is own, then all properties are own
			for ( key in obj ) {}

			return key === undefined || hasOwn.call( obj, key );
		},

		isEmptyObject: function( obj ) {
			var name;
			for ( name in obj ) {
				return false;
			}
			return true;
		},

		type: function( obj ) {
			if ( obj == null ) {
				return obj + "";
			}

			// Support: Android<4.0, iOS<6 (functionish RegExp)
			return typeof obj === "object" || typeof obj === "function" ?
				class2type[ toString.call( obj ) ] || "object" :
				typeof obj;
		},

		// Evaluates a script in a global context
		globalEval: function( code ) {
			var script,
				indirect = eval;

			code = jQuery.trim( code );

			if ( code ) {

				// If the code includes a valid, prologue position
				// strict mode pragma, execute code by injecting a
				// script tag into the document.
				if ( code.indexOf( "use strict" ) === 1 ) {
					script = document.createElement( "script" );
					script.text = code;
					document.head.appendChild( script ).parentNode.removeChild( script );
				} else {

					// Otherwise, avoid the DOM node creation, insertion
					// and removal by using an indirect global eval

					indirect( code );
				}
			}
		},

		// Convert dashed to camelCase; used by the css and data modules
		// Support: IE9-11+
		// Microsoft forgot to hump their vendor prefix (#9572)
		camelCase: function( string ) {
			return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
		},

		nodeName: function( elem, name ) {
			return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
		},

		each: function( obj, callback ) {
			var length, i = 0;

			if ( isArrayLike( obj ) ) {
				length = obj.length;
				for ( ; i < length; i++ ) {
					if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
						break;
					}
				}
			} else {
				for ( i in obj ) {
					if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
						break;
					}
				}
			}

			return obj;
		},

		// Support: Android<4.1
		trim: function( text ) {
			return text == null ?
				"" :
				( text + "" ).replace( rtrim, "" );
		},

		// results is for internal usage only
		makeArray: function( arr, results ) {
			var ret = results || [];

			if ( arr != null ) {
				if ( isArrayLike( Object( arr ) ) ) {
					jQuery.merge( ret,
						typeof arr === "string" ?
						[ arr ] : arr
					);
				} else {
					push.call( ret, arr );
				}
			}

			return ret;
		},

		inArray: function( elem, arr, i ) {
			return arr == null ? -1 : indexOf.call( arr, elem, i );
		},

		merge: function( first, second ) {
			var len = +second.length,
				j = 0,
				i = first.length;

			for ( ; j < len; j++ ) {
				first[ i++ ] = second[ j ];
			}

			first.length = i;

			return first;
		},

		grep: function( elems, callback, invert ) {
			var callbackInverse,
				matches = [],
				i = 0,
				length = elems.length,
				callbackExpect = !invert;

			// Go through the array, only saving the items
			// that pass the validator function
			for ( ; i < length; i++ ) {
				callbackInverse = !callback( elems[ i ], i );
				if ( callbackInverse !== callbackExpect ) {
					matches.push( elems[ i ] );
				}
			}

			return matches;
		},

		// arg is for internal usage only
		map: function( elems, callback, arg ) {
			var length, value,
				i = 0,
				ret = [];

			// Go through the array, translating each of the items to their new values
			if ( isArrayLike( elems ) ) {
				length = elems.length;
				for ( ; i < length; i++ ) {
					value = callback( elems[ i ], i, arg );

					if ( value != null ) {
						ret.push( value );
					}
				}

			// Go through every key on the object,
			} else {
				for ( i in elems ) {
					value = callback( elems[ i ], i, arg );

					if ( value != null ) {
						ret.push( value );
					}
				}
			}

			// Flatten any nested arrays
			return concat.apply( [], ret );
		},

		// A global GUID counter for objects
		guid: 1,

		// Bind a function to a context, optionally partially applying any
		// arguments.
		proxy: function( fn, context ) {
			var tmp, args, proxy;

			if ( typeof context === "string" ) {
				tmp = fn[ context ];
				context = fn;
				fn = tmp;
			}

			// Quick check to determine if target is callable, in the spec
			// this throws a TypeError, but we will just return undefined.
			if ( !jQuery.isFunction( fn ) ) {
				return undefined;
			}

			// Simulated bind
			args = slice.call( arguments, 2 );
			proxy = function() {
				return fn.apply( context || this, args.concat( slice.call( arguments ) ) );
			};

			// Set the guid of unique handler to the same of original handler, so it can be removed
			proxy.guid = fn.guid = fn.guid || jQuery.guid++;

			return proxy;
		},

		now: Date.now,

		// jQuery.support is not used in Core but other projects attach their
		// properties to it so it needs to exist.
		support: support
	} );

	// JSHint would error on this code due to the Symbol not being defined in ES5.
	// Defining this global in .jshintrc would create a danger of using the global
	// unguarded in another place, it seems safer to just disable JSHint for these
	// three lines.
	/* jshint ignore: start */
	if ( typeof Symbol === "function" ) {
		jQuery.fn[ Symbol.iterator ] = arr[ Symbol.iterator ];
	}
	/* jshint ignore: end */

	// Populate the class2type map
	jQuery.each( "Boolean Number String Function Array Date RegExp Object Error Symbol".split( " " ),
	function( i, name ) {
		class2type[ "[object " + name + "]" ] = name.toLowerCase();
	} );

	function isArrayLike( obj ) {

		// Support: iOS 8.2 (not reproducible in simulator)
		// `in` check used to prevent JIT error (gh-2145)
		// hasOwn isn't used here due to false negatives
		// regarding Nodelist length in IE
		var length = !!obj && "length" in obj && obj.length,
			type = jQuery.type( obj );

		if ( type === "function" || jQuery.isWindow( obj ) ) {
			return false;
		}

		return type === "array" || length === 0 ||
			typeof length === "number" && length > 0 && ( length - 1 ) in obj;
	}
	var Sizzle =
	/*!
	 * Sizzle CSS Selector Engine v2.2.1
	 * http://sizzlejs.com/
	 *
	 * Copyright jQuery Foundation and other contributors
	 * Released under the MIT license
	 * http://jquery.org/license
	 *
	 * Date: 2015-10-17
	 */
	(function( window ) {

	var i,
		support,
		Expr,
		getText,
		isXML,
		tokenize,
		compile,
		select,
		outermostContext,
		sortInput,
		hasDuplicate,

		// Local document vars
		setDocument,
		document,
		docElem,
		documentIsHTML,
		rbuggyQSA,
		rbuggyMatches,
		matches,
		contains,

		// Instance-specific data
		expando = "sizzle" + 1 * new Date(),
		preferredDoc = window.document,
		dirruns = 0,
		done = 0,
		classCache = createCache(),
		tokenCache = createCache(),
		compilerCache = createCache(),
		sortOrder = function( a, b ) {
			if ( a === b ) {
				hasDuplicate = true;
			}
			return 0;
		},

		// General-purpose constants
		MAX_NEGATIVE = 1 << 31,

		// Instance methods
		hasOwn = ({}).hasOwnProperty,
		arr = [],
		pop = arr.pop,
		push_native = arr.push,
		push = arr.push,
		slice = arr.slice,
		// Use a stripped-down indexOf as it's faster than native
		// http://jsperf.com/thor-indexof-vs-for/5
		indexOf = function( list, elem ) {
			var i = 0,
				len = list.length;
			for ( ; i < len; i++ ) {
				if ( list[i] === elem ) {
					return i;
				}
			}
			return -1;
		},

		booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",

		// Regular expressions

		// http://www.w3.org/TR/css3-selectors/#whitespace
		whitespace = "[\\x20\\t\\r\\n\\f]",

		// http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
		identifier = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",

		// Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
		attributes = "\\[" + whitespace + "*(" + identifier + ")(?:" + whitespace +
			// Operator (capture 2)
			"*([*^$|!~]?=)" + whitespace +
			// "Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]"
			"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" + whitespace +
			"*\\]",

		pseudos = ":(" + identifier + ")(?:\\((" +
			// To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
			// 1. quoted (capture 3; capture 4 or capture 5)
			"('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +
			// 2. simple (capture 6)
			"((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" +
			// 3. anything else (capture 2)
			".*" +
			")\\)|)",

		// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
		rwhitespace = new RegExp( whitespace + "+", "g" ),
		rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

		rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
		rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*" ),

		rattributeQuotes = new RegExp( "=" + whitespace + "*([^\\]'\"]*?)" + whitespace + "*\\]", "g" ),

		rpseudo = new RegExp( pseudos ),
		ridentifier = new RegExp( "^" + identifier + "$" ),

		matchExpr = {
			"ID": new RegExp( "^#(" + identifier + ")" ),
			"CLASS": new RegExp( "^\\.(" + identifier + ")" ),
			"TAG": new RegExp( "^(" + identifier + "|[*])" ),
			"ATTR": new RegExp( "^" + attributes ),
			"PSEUDO": new RegExp( "^" + pseudos ),
			"CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
				"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
				"*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
			"bool": new RegExp( "^(?:" + booleans + ")$", "i" ),
			// For use in libraries implementing .is()
			// We use this for POS matching in `select`
			"needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
				whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
		},

		rinputs = /^(?:input|select|textarea|button)$/i,
		rheader = /^h\d$/i,

		rnative = /^[^{]+\{\s*\[native \w/,

		// Easily-parseable/retrievable ID or TAG or CLASS selectors
		rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

		rsibling = /[+~]/,
		rescape = /'|\\/g,

		// CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
		runescape = new RegExp( "\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig" ),
		funescape = function( _, escaped, escapedWhitespace ) {
			var high = "0x" + escaped - 0x10000;
			// NaN means non-codepoint
			// Support: Firefox<24
			// Workaround erroneous numeric interpretation of +"0x"
			return high !== high || escapedWhitespace ?
				escaped :
				high < 0 ?
					// BMP codepoint
					String.fromCharCode( high + 0x10000 ) :
					// Supplemental Plane codepoint (surrogate pair)
					String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
		},

		// Used for iframes
		// See setDocument()
		// Removing the function wrapper causes a "Permission Denied"
		// error in IE
		unloadHandler = function() {
			setDocument();
		};

	// Optimize for push.apply( _, NodeList )
	try {
		push.apply(
			(arr = slice.call( preferredDoc.childNodes )),
			preferredDoc.childNodes
		);
		// Support: Android<4.0
		// Detect silently failing push.apply
		arr[ preferredDoc.childNodes.length ].nodeType;
	} catch ( e ) {
		push = { apply: arr.length ?

			// Leverage slice if possible
			function( target, els ) {
				push_native.apply( target, slice.call(els) );
			} :

			// Support: IE<9
			// Otherwise append directly
			function( target, els ) {
				var j = target.length,
					i = 0;
				// Can't trust NodeList.length
				while ( (target[j++] = els[i++]) ) {}
				target.length = j - 1;
			}
		};
	}

	function Sizzle( selector, context, results, seed ) {
		var m, i, elem, nid, nidselect, match, groups, newSelector,
			newContext = context && context.ownerDocument,

			// nodeType defaults to 9, since context defaults to document
			nodeType = context ? context.nodeType : 9;

		results = results || [];

		// Return early from calls with invalid selector or context
		if ( typeof selector !== "string" || !selector ||
			nodeType !== 1 && nodeType !== 9 && nodeType !== 11 ) {

			return results;
		}

		// Try to shortcut find operations (as opposed to filters) in HTML documents
		if ( !seed ) {

			if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {
				setDocument( context );
			}
			context = context || document;

			if ( documentIsHTML ) {

				// If the selector is sufficiently simple, try using a "get*By*" DOM method
				// (excepting DocumentFragment context, where the methods don't exist)
				if ( nodeType !== 11 && (match = rquickExpr.exec( selector )) ) {

					// ID selector
					if ( (m = match[1]) ) {

						// Document context
						if ( nodeType === 9 ) {
							if ( (elem = context.getElementById( m )) ) {

								// Support: IE, Opera, Webkit
								// TODO: identify versions
								// getElementById can match elements by name instead of ID
								if ( elem.id === m ) {
									results.push( elem );
									return results;
								}
							} else {
								return results;
							}

						// Element context
						} else {

							// Support: IE, Opera, Webkit
							// TODO: identify versions
							// getElementById can match elements by name instead of ID
							if ( newContext && (elem = newContext.getElementById( m )) &&
								contains( context, elem ) &&
								elem.id === m ) {

								results.push( elem );
								return results;
							}
						}

					// Type selector
					} else if ( match[2] ) {
						push.apply( results, context.getElementsByTagName( selector ) );
						return results;

					// Class selector
					} else if ( (m = match[3]) && support.getElementsByClassName &&
						context.getElementsByClassName ) {

						push.apply( results, context.getElementsByClassName( m ) );
						return results;
					}
				}

				// Take advantage of querySelectorAll
				if ( support.qsa &&
					!compilerCache[ selector + " " ] &&
					(!rbuggyQSA || !rbuggyQSA.test( selector )) ) {

					if ( nodeType !== 1 ) {
						newContext = context;
						newSelector = selector;

					// qSA looks outside Element context, which is not what we want
					// Thanks to Andrew Dupont for this workaround technique
					// Support: IE <=8
					// Exclude object elements
					} else if ( context.nodeName.toLowerCase() !== "object" ) {

						// Capture the context ID, setting it first if necessary
						if ( (nid = context.getAttribute( "id" )) ) {
							nid = nid.replace( rescape, "\\$&" );
						} else {
							context.setAttribute( "id", (nid = expando) );
						}

						// Prefix every selector in the list
						groups = tokenize( selector );
						i = groups.length;
						nidselect = ridentifier.test( nid ) ? "#" + nid : "[id='" + nid + "']";
						while ( i-- ) {
							groups[i] = nidselect + " " + toSelector( groups[i] );
						}
						newSelector = groups.join( "," );

						// Expand context for sibling selectors
						newContext = rsibling.test( selector ) && testContext( context.parentNode ) ||
							context;
					}

					if ( newSelector ) {
						try {
							push.apply( results,
								newContext.querySelectorAll( newSelector )
							);
							return results;
						} catch ( qsaError ) {
						} finally {
							if ( nid === expando ) {
								context.removeAttribute( "id" );
							}
						}
					}
				}
			}
		}

		// All others
		return select( selector.replace( rtrim, "$1" ), context, results, seed );
	}

	/**
	 * Create key-value caches of limited size
	 * @returns {function(string, object)} Returns the Object data after storing it on itself with
	 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
	 *	deleting the oldest entry
	 */
	function createCache() {
		var keys = [];

		function cache( key, value ) {
			// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
			if ( keys.push( key + " " ) > Expr.cacheLength ) {
				// Only keep the most recent entries
				delete cache[ keys.shift() ];
			}
			return (cache[ key + " " ] = value);
		}
		return cache;
	}

	/**
	 * Mark a function for special use by Sizzle
	 * @param {Function} fn The function to mark
	 */
	function markFunction( fn ) {
		fn[ expando ] = true;
		return fn;
	}

	/**
	 * Support testing using an element
	 * @param {Function} fn Passed the created div and expects a boolean result
	 */
	function assert( fn ) {
		var div = document.createElement("div");

		try {
			return !!fn( div );
		} catch (e) {
			return false;
		} finally {
			// Remove from its parent by default
			if ( div.parentNode ) {
				div.parentNode.removeChild( div );
			}
			// release memory in IE
			div = null;
		}
	}

	/**
	 * Adds the same handler for all of the specified attrs
	 * @param {String} attrs Pipe-separated list of attributes
	 * @param {Function} handler The method that will be applied
	 */
	function addHandle( attrs, handler ) {
		var arr = attrs.split("|"),
			i = arr.length;

		while ( i-- ) {
			Expr.attrHandle[ arr[i] ] = handler;
		}
	}

	/**
	 * Checks document order of two siblings
	 * @param {Element} a
	 * @param {Element} b
	 * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
	 */
	function siblingCheck( a, b ) {
		var cur = b && a,
			diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
				( ~b.sourceIndex || MAX_NEGATIVE ) -
				( ~a.sourceIndex || MAX_NEGATIVE );

		// Use IE sourceIndex if available on both nodes
		if ( diff ) {
			return diff;
		}

		// Check if b follows a
		if ( cur ) {
			while ( (cur = cur.nextSibling) ) {
				if ( cur === b ) {
					return -1;
				}
			}
		}

		return a ? 1 : -1;
	}

	/**
	 * Returns a function to use in pseudos for input types
	 * @param {String} type
	 */
	function createInputPseudo( type ) {
		return function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === type;
		};
	}

	/**
	 * Returns a function to use in pseudos for buttons
	 * @param {String} type
	 */
	function createButtonPseudo( type ) {
		return function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return (name === "input" || name === "button") && elem.type === type;
		};
	}

	/**
	 * Returns a function to use in pseudos for positionals
	 * @param {Function} fn
	 */
	function createPositionalPseudo( fn ) {
		return markFunction(function( argument ) {
			argument = +argument;
			return markFunction(function( seed, matches ) {
				var j,
					matchIndexes = fn( [], seed.length, argument ),
					i = matchIndexes.length;

				// Match elements found at the specified indexes
				while ( i-- ) {
					if ( seed[ (j = matchIndexes[i]) ] ) {
						seed[j] = !(matches[j] = seed[j]);
					}
				}
			});
		});
	}

	/**
	 * Checks a node for validity as a Sizzle context
	 * @param {Element|Object=} context
	 * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
	 */
	function testContext( context ) {
		return context && typeof context.getElementsByTagName !== "undefined" && context;
	}

	// Expose support vars for convenience
	support = Sizzle.support = {};

	/**
	 * Detects XML nodes
	 * @param {Element|Object} elem An element or a document
	 * @returns {Boolean} True iff elem is a non-HTML XML node
	 */
	isXML = Sizzle.isXML = function( elem ) {
		// documentElement is verified for cases where it doesn't yet exist
		// (such as loading iframes in IE - #4833)
		var documentElement = elem && (elem.ownerDocument || elem).documentElement;
		return documentElement ? documentElement.nodeName !== "HTML" : false;
	};

	/**
	 * Sets document-related variables once based on the current document
	 * @param {Element|Object} [doc] An element or document object to use to set the document
	 * @returns {Object} Returns the current document
	 */
	setDocument = Sizzle.setDocument = function( node ) {
		var hasCompare, parent,
			doc = node ? node.ownerDocument || node : preferredDoc;

		// Return early if doc is invalid or already selected
		if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {
			return document;
		}

		// Update global variables
		document = doc;
		docElem = document.documentElement;
		documentIsHTML = !isXML( document );

		// Support: IE 9-11, Edge
		// Accessing iframe documents after unload throws "permission denied" errors (jQuery #13936)
		if ( (parent = document.defaultView) && parent.top !== parent ) {
			// Support: IE 11
			if ( parent.addEventListener ) {
				parent.addEventListener( "unload", unloadHandler, false );

			// Support: IE 9 - 10 only
			} else if ( parent.attachEvent ) {
				parent.attachEvent( "onunload", unloadHandler );
			}
		}

		/* Attributes
		---------------------------------------------------------------------- */

		// Support: IE<8
		// Verify that getAttribute really returns attributes and not properties
		// (excepting IE8 booleans)
		support.attributes = assert(function( div ) {
			div.className = "i";
			return !div.getAttribute("className");
		});

		/* getElement(s)By*
		---------------------------------------------------------------------- */

		// Check if getElementsByTagName("*") returns only elements
		support.getElementsByTagName = assert(function( div ) {
			div.appendChild( document.createComment("") );
			return !div.getElementsByTagName("*").length;
		});

		// Support: IE<9
		support.getElementsByClassName = rnative.test( document.getElementsByClassName );

		// Support: IE<10
		// Check if getElementById returns elements by name
		// The broken getElementById methods don't pick up programatically-set names,
		// so use a roundabout getElementsByName test
		support.getById = assert(function( div ) {
			docElem.appendChild( div ).id = expando;
			return !document.getElementsByName || !document.getElementsByName( expando ).length;
		});

		// ID find and filter
		if ( support.getById ) {
			Expr.find["ID"] = function( id, context ) {
				if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
					var m = context.getElementById( id );
					return m ? [ m ] : [];
				}
			};
			Expr.filter["ID"] = function( id ) {
				var attrId = id.replace( runescape, funescape );
				return function( elem ) {
					return elem.getAttribute("id") === attrId;
				};
			};
		} else {
			// Support: IE6/7
			// getElementById is not reliable as a find shortcut
			delete Expr.find["ID"];

			Expr.filter["ID"] =  function( id ) {
				var attrId = id.replace( runescape, funescape );
				return function( elem ) {
					var node = typeof elem.getAttributeNode !== "undefined" &&
						elem.getAttributeNode("id");
					return node && node.value === attrId;
				};
			};
		}

		// Tag
		Expr.find["TAG"] = support.getElementsByTagName ?
			function( tag, context ) {
				if ( typeof context.getElementsByTagName !== "undefined" ) {
					return context.getElementsByTagName( tag );

				// DocumentFragment nodes don't have gEBTN
				} else if ( support.qsa ) {
					return context.querySelectorAll( tag );
				}
			} :

			function( tag, context ) {
				var elem,
					tmp = [],
					i = 0,
					// By happy coincidence, a (broken) gEBTN appears on DocumentFragment nodes too
					results = context.getElementsByTagName( tag );

				// Filter out possible comments
				if ( tag === "*" ) {
					while ( (elem = results[i++]) ) {
						if ( elem.nodeType === 1 ) {
							tmp.push( elem );
						}
					}

					return tmp;
				}
				return results;
			};

		// Class
		Expr.find["CLASS"] = support.getElementsByClassName && function( className, context ) {
			if ( typeof context.getElementsByClassName !== "undefined" && documentIsHTML ) {
				return context.getElementsByClassName( className );
			}
		};

		/* QSA/matchesSelector
		---------------------------------------------------------------------- */

		// QSA and matchesSelector support

		// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
		rbuggyMatches = [];

		// qSa(:focus) reports false when true (Chrome 21)
		// We allow this because of a bug in IE8/9 that throws an error
		// whenever `document.activeElement` is accessed on an iframe
		// So, we allow :focus to pass through QSA all the time to avoid the IE error
		// See http://bugs.jquery.com/ticket/13378
		rbuggyQSA = [];

		if ( (support.qsa = rnative.test( document.querySelectorAll )) ) {
			// Build QSA regex
			// Regex strategy adopted from Diego Perini
			assert(function( div ) {
				// Select is set to empty string on purpose
				// This is to test IE's treatment of not explicitly
				// setting a boolean content attribute,
				// since its presence should be enough
				// http://bugs.jquery.com/ticket/12359
				docElem.appendChild( div ).innerHTML = "<a id='" + expando + "'></a>" +
					"<select id='" + expando + "-\r\\' msallowcapture=''>" +
					"<option selected=''></option></select>";

				// Support: IE8, Opera 11-12.16
				// Nothing should be selected when empty strings follow ^= or $= or *=
				// The test attribute must be unknown in Opera but "safe" for WinRT
				// http://msdn.microsoft.com/en-us/library/ie/hh465388.aspx#attribute_section
				if ( div.querySelectorAll("[msallowcapture^='']").length ) {
					rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
				}

				// Support: IE8
				// Boolean attributes and "value" are not treated correctly
				if ( !div.querySelectorAll("[selected]").length ) {
					rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
				}

				// Support: Chrome<29, Android<4.4, Safari<7.0+, iOS<7.0+, PhantomJS<1.9.8+
				if ( !div.querySelectorAll( "[id~=" + expando + "-]" ).length ) {
					rbuggyQSA.push("~=");
				}

				// Webkit/Opera - :checked should return selected option elements
				// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
				// IE8 throws error here and will not see later tests
				if ( !div.querySelectorAll(":checked").length ) {
					rbuggyQSA.push(":checked");
				}

				// Support: Safari 8+, iOS 8+
				// https://bugs.webkit.org/show_bug.cgi?id=136851
				// In-page `selector#id sibing-combinator selector` fails
				if ( !div.querySelectorAll( "a#" + expando + "+*" ).length ) {
					rbuggyQSA.push(".#.+[+~]");
				}
			});

			assert(function( div ) {
				// Support: Windows 8 Native Apps
				// The type and name attributes are restricted during .innerHTML assignment
				var input = document.createElement("input");
				input.setAttribute( "type", "hidden" );
				div.appendChild( input ).setAttribute( "name", "D" );

				// Support: IE8
				// Enforce case-sensitivity of name attribute
				if ( div.querySelectorAll("[name=d]").length ) {
					rbuggyQSA.push( "name" + whitespace + "*[*^$|!~]?=" );
				}

				// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
				// IE8 throws error here and will not see later tests
				if ( !div.querySelectorAll(":enabled").length ) {
					rbuggyQSA.push( ":enabled", ":disabled" );
				}

				// Opera 10-11 does not throw on post-comma invalid pseudos
				div.querySelectorAll("*,:x");
				rbuggyQSA.push(",.*:");
			});
		}

		if ( (support.matchesSelector = rnative.test( (matches = docElem.matches ||
			docElem.webkitMatchesSelector ||
			docElem.mozMatchesSelector ||
			docElem.oMatchesSelector ||
			docElem.msMatchesSelector) )) ) {

			assert(function( div ) {
				// Check to see if it's possible to do matchesSelector
				// on a disconnected node (IE 9)
				support.disconnectedMatch = matches.call( div, "div" );

				// This should fail with an exception
				// Gecko does not error, returns false instead
				matches.call( div, "[s!='']:x" );
				rbuggyMatches.push( "!=", pseudos );
			});
		}

		rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );
		rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join("|") );

		/* Contains
		---------------------------------------------------------------------- */
		hasCompare = rnative.test( docElem.compareDocumentPosition );

		// Element contains another
		// Purposefully self-exclusive
		// As in, an element does not contain itself
		contains = hasCompare || rnative.test( docElem.contains ) ?
			function( a, b ) {
				var adown = a.nodeType === 9 ? a.documentElement : a,
					bup = b && b.parentNode;
				return a === bup || !!( bup && bup.nodeType === 1 && (
					adown.contains ?
						adown.contains( bup ) :
						a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
				));
			} :
			function( a, b ) {
				if ( b ) {
					while ( (b = b.parentNode) ) {
						if ( b === a ) {
							return true;
						}
					}
				}
				return false;
			};

		/* Sorting
		---------------------------------------------------------------------- */

		// Document order sorting
		sortOrder = hasCompare ?
		function( a, b ) {

			// Flag for duplicate removal
			if ( a === b ) {
				hasDuplicate = true;
				return 0;
			}

			// Sort on method existence if only one input has compareDocumentPosition
			var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
			if ( compare ) {
				return compare;
			}

			// Calculate position if both inputs belong to the same document
			compare = ( a.ownerDocument || a ) === ( b.ownerDocument || b ) ?
				a.compareDocumentPosition( b ) :

				// Otherwise we know they are disconnected
				1;

			// Disconnected nodes
			if ( compare & 1 ||
				(!support.sortDetached && b.compareDocumentPosition( a ) === compare) ) {

				// Choose the first element that is related to our preferred document
				if ( a === document || a.ownerDocument === preferredDoc && contains(preferredDoc, a) ) {
					return -1;
				}
				if ( b === document || b.ownerDocument === preferredDoc && contains(preferredDoc, b) ) {
					return 1;
				}

				// Maintain original order
				return sortInput ?
					( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
					0;
			}

			return compare & 4 ? -1 : 1;
		} :
		function( a, b ) {
			// Exit early if the nodes are identical
			if ( a === b ) {
				hasDuplicate = true;
				return 0;
			}

			var cur,
				i = 0,
				aup = a.parentNode,
				bup = b.parentNode,
				ap = [ a ],
				bp = [ b ];

			// Parentless nodes are either documents or disconnected
			if ( !aup || !bup ) {
				return a === document ? -1 :
					b === document ? 1 :
					aup ? -1 :
					bup ? 1 :
					sortInput ?
					( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
					0;

			// If the nodes are siblings, we can do a quick check
			} else if ( aup === bup ) {
				return siblingCheck( a, b );
			}

			// Otherwise we need full lists of their ancestors for comparison
			cur = a;
			while ( (cur = cur.parentNode) ) {
				ap.unshift( cur );
			}
			cur = b;
			while ( (cur = cur.parentNode) ) {
				bp.unshift( cur );
			}

			// Walk down the tree looking for a discrepancy
			while ( ap[i] === bp[i] ) {
				i++;
			}

			return i ?
				// Do a sibling check if the nodes have a common ancestor
				siblingCheck( ap[i], bp[i] ) :

				// Otherwise nodes in our document sort first
				ap[i] === preferredDoc ? -1 :
				bp[i] === preferredDoc ? 1 :
				0;
		};

		return document;
	};

	Sizzle.matches = function( expr, elements ) {
		return Sizzle( expr, null, null, elements );
	};

	Sizzle.matchesSelector = function( elem, expr ) {
		// Set document vars if needed
		if ( ( elem.ownerDocument || elem ) !== document ) {
			setDocument( elem );
		}

		// Make sure that attribute selectors are quoted
		expr = expr.replace( rattributeQuotes, "='$1']" );

		if ( support.matchesSelector && documentIsHTML &&
			!compilerCache[ expr + " " ] &&
			( !rbuggyMatches || !rbuggyMatches.test( expr ) ) &&
			( !rbuggyQSA     || !rbuggyQSA.test( expr ) ) ) {

			try {
				var ret = matches.call( elem, expr );

				// IE 9's matchesSelector returns false on disconnected nodes
				if ( ret || support.disconnectedMatch ||
						// As well, disconnected nodes are said to be in a document
						// fragment in IE 9
						elem.document && elem.document.nodeType !== 11 ) {
					return ret;
				}
			} catch (e) {}
		}

		return Sizzle( expr, document, null, [ elem ] ).length > 0;
	};

	Sizzle.contains = function( context, elem ) {
		// Set document vars if needed
		if ( ( context.ownerDocument || context ) !== document ) {
			setDocument( context );
		}
		return contains( context, elem );
	};

	Sizzle.attr = function( elem, name ) {
		// Set document vars if needed
		if ( ( elem.ownerDocument || elem ) !== document ) {
			setDocument( elem );
		}

		var fn = Expr.attrHandle[ name.toLowerCase() ],
			// Don't get fooled by Object.prototype properties (jQuery #13807)
			val = fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?
				fn( elem, name, !documentIsHTML ) :
				undefined;

		return val !== undefined ?
			val :
			support.attributes || !documentIsHTML ?
				elem.getAttribute( name ) :
				(val = elem.getAttributeNode(name)) && val.specified ?
					val.value :
					null;
	};

	Sizzle.error = function( msg ) {
		throw new Error( "Syntax error, unrecognized expression: " + msg );
	};

	/**
	 * Document sorting and removing duplicates
	 * @param {ArrayLike} results
	 */
	Sizzle.uniqueSort = function( results ) {
		var elem,
			duplicates = [],
			j = 0,
			i = 0;

		// Unless we *know* we can detect duplicates, assume their presence
		hasDuplicate = !support.detectDuplicates;
		sortInput = !support.sortStable && results.slice( 0 );
		results.sort( sortOrder );

		if ( hasDuplicate ) {
			while ( (elem = results[i++]) ) {
				if ( elem === results[ i ] ) {
					j = duplicates.push( i );
				}
			}
			while ( j-- ) {
				results.splice( duplicates[ j ], 1 );
			}
		}

		// Clear input after sorting to release objects
		// See https://github.com/jquery/sizzle/pull/225
		sortInput = null;

		return results;
	};

	/**
	 * Utility function for retrieving the text value of an array of DOM nodes
	 * @param {Array|Element} elem
	 */
	getText = Sizzle.getText = function( elem ) {
		var node,
			ret = "",
			i = 0,
			nodeType = elem.nodeType;

		if ( !nodeType ) {
			// If no nodeType, this is expected to be an array
			while ( (node = elem[i++]) ) {
				// Do not traverse comment nodes
				ret += getText( node );
			}
		} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
			// Use textContent for elements
			// innerText usage removed for consistency of new lines (jQuery #11153)
			if ( typeof elem.textContent === "string" ) {
				return elem.textContent;
			} else {
				// Traverse its children
				for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
					ret += getText( elem );
				}
			}
		} else if ( nodeType === 3 || nodeType === 4 ) {
			return elem.nodeValue;
		}
		// Do not include comment or processing instruction nodes

		return ret;
	};

	Expr = Sizzle.selectors = {

		// Can be adjusted by the user
		cacheLength: 50,

		createPseudo: markFunction,

		match: matchExpr,

		attrHandle: {},

		find: {},

		relative: {
			">": { dir: "parentNode", first: true },
			" ": { dir: "parentNode" },
			"+": { dir: "previousSibling", first: true },
			"~": { dir: "previousSibling" }
		},

		preFilter: {
			"ATTR": function( match ) {
				match[1] = match[1].replace( runescape, funescape );

				// Move the given value to match[3] whether quoted or unquoted
				match[3] = ( match[3] || match[4] || match[5] || "" ).replace( runescape, funescape );

				if ( match[2] === "~=" ) {
					match[3] = " " + match[3] + " ";
				}

				return match.slice( 0, 4 );
			},

			"CHILD": function( match ) {
				/* matches from matchExpr["CHILD"]
					1 type (only|nth|...)
					2 what (child|of-type)
					3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
					4 xn-component of xn+y argument ([+-]?\d*n|)
					5 sign of xn-component
					6 x of xn-component
					7 sign of y-component
					8 y of y-component
				*/
				match[1] = match[1].toLowerCase();

				if ( match[1].slice( 0, 3 ) === "nth" ) {
					// nth-* requires argument
					if ( !match[3] ) {
						Sizzle.error( match[0] );
					}

					// numeric x and y parameters for Expr.filter.CHILD
					// remember that false/true cast respectively to 0/1
					match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
					match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );

				// other types prohibit arguments
				} else if ( match[3] ) {
					Sizzle.error( match[0] );
				}

				return match;
			},

			"PSEUDO": function( match ) {
				var excess,
					unquoted = !match[6] && match[2];

				if ( matchExpr["CHILD"].test( match[0] ) ) {
					return null;
				}

				// Accept quoted arguments as-is
				if ( match[3] ) {
					match[2] = match[4] || match[5] || "";

				// Strip excess characters from unquoted arguments
				} else if ( unquoted && rpseudo.test( unquoted ) &&
					// Get excess from tokenize (recursively)
					(excess = tokenize( unquoted, true )) &&
					// advance to the next closing parenthesis
					(excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

					// excess is a negative index
					match[0] = match[0].slice( 0, excess );
					match[2] = unquoted.slice( 0, excess );
				}

				// Return only captures needed by the pseudo filter method (type and argument)
				return match.slice( 0, 3 );
			}
		},

		filter: {

			"TAG": function( nodeNameSelector ) {
				var nodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
				return nodeNameSelector === "*" ?
					function() { return true; } :
					function( elem ) {
						return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
					};
			},

			"CLASS": function( className ) {
				var pattern = classCache[ className + " " ];

				return pattern ||
					(pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
					classCache( className, function( elem ) {
						return pattern.test( typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== "undefined" && elem.getAttribute("class") || "" );
					});
			},

			"ATTR": function( name, operator, check ) {
				return function( elem ) {
					var result = Sizzle.attr( elem, name );

					if ( result == null ) {
						return operator === "!=";
					}
					if ( !operator ) {
						return true;
					}

					result += "";

					return operator === "=" ? result === check :
						operator === "!=" ? result !== check :
						operator === "^=" ? check && result.indexOf( check ) === 0 :
						operator === "*=" ? check && result.indexOf( check ) > -1 :
						operator === "$=" ? check && result.slice( -check.length ) === check :
						operator === "~=" ? ( " " + result.replace( rwhitespace, " " ) + " " ).indexOf( check ) > -1 :
						operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
						false;
				};
			},

			"CHILD": function( type, what, argument, first, last ) {
				var simple = type.slice( 0, 3 ) !== "nth",
					forward = type.slice( -4 ) !== "last",
					ofType = what === "of-type";

				return first === 1 && last === 0 ?

					// Shortcut for :nth-*(n)
					function( elem ) {
						return !!elem.parentNode;
					} :

					function( elem, context, xml ) {
						var cache, uniqueCache, outerCache, node, nodeIndex, start,
							dir = simple !== forward ? "nextSibling" : "previousSibling",
							parent = elem.parentNode,
							name = ofType && elem.nodeName.toLowerCase(),
							useCache = !xml && !ofType,
							diff = false;

						if ( parent ) {

							// :(first|last|only)-(child|of-type)
							if ( simple ) {
								while ( dir ) {
									node = elem;
									while ( (node = node[ dir ]) ) {
										if ( ofType ?
											node.nodeName.toLowerCase() === name :
											node.nodeType === 1 ) {

											return false;
										}
									}
									// Reverse direction for :only-* (if we haven't yet done so)
									start = dir = type === "only" && !start && "nextSibling";
								}
								return true;
							}

							start = [ forward ? parent.firstChild : parent.lastChild ];

							// non-xml :nth-child(...) stores cache data on `parent`
							if ( forward && useCache ) {

								// Seek `elem` from a previously-cached index

								// ...in a gzip-friendly way
								node = parent;
								outerCache = node[ expando ] || (node[ expando ] = {});

								// Support: IE <9 only
								// Defend against cloned attroperties (jQuery gh-1709)
								uniqueCache = outerCache[ node.uniqueID ] ||
									(outerCache[ node.uniqueID ] = {});

								cache = uniqueCache[ type ] || [];
								nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
								diff = nodeIndex && cache[ 2 ];
								node = nodeIndex && parent.childNodes[ nodeIndex ];

								while ( (node = ++nodeIndex && node && node[ dir ] ||

									// Fallback to seeking `elem` from the start
									(diff = nodeIndex = 0) || start.pop()) ) {

									// When found, cache indexes on `parent` and break
									if ( node.nodeType === 1 && ++diff && node === elem ) {
										uniqueCache[ type ] = [ dirruns, nodeIndex, diff ];
										break;
									}
								}

							} else {
								// Use previously-cached element index if available
								if ( useCache ) {
									// ...in a gzip-friendly way
									node = elem;
									outerCache = node[ expando ] || (node[ expando ] = {});

									// Support: IE <9 only
									// Defend against cloned attroperties (jQuery gh-1709)
									uniqueCache = outerCache[ node.uniqueID ] ||
										(outerCache[ node.uniqueID ] = {});

									cache = uniqueCache[ type ] || [];
									nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
									diff = nodeIndex;
								}

								// xml :nth-child(...)
								// or :nth-last-child(...) or :nth(-last)?-of-type(...)
								if ( diff === false ) {
									// Use the same loop as above to seek `elem` from the start
									while ( (node = ++nodeIndex && node && node[ dir ] ||
										(diff = nodeIndex = 0) || start.pop()) ) {

										if ( ( ofType ?
											node.nodeName.toLowerCase() === name :
											node.nodeType === 1 ) &&
											++diff ) {

											// Cache the index of each encountered element
											if ( useCache ) {
												outerCache = node[ expando ] || (node[ expando ] = {});

												// Support: IE <9 only
												// Defend against cloned attroperties (jQuery gh-1709)
												uniqueCache = outerCache[ node.uniqueID ] ||
													(outerCache[ node.uniqueID ] = {});

												uniqueCache[ type ] = [ dirruns, diff ];
											}

											if ( node === elem ) {
												break;
											}
										}
									}
								}
							}

							// Incorporate the offset, then check against cycle size
							diff -= last;
							return diff === first || ( diff % first === 0 && diff / first >= 0 );
						}
					};
			},

			"PSEUDO": function( pseudo, argument ) {
				// pseudo-class names are case-insensitive
				// http://www.w3.org/TR/selectors/#pseudo-classes
				// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
				// Remember that setFilters inherits from pseudos
				var args,
					fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
						Sizzle.error( "unsupported pseudo: " + pseudo );

				// The user may use createPseudo to indicate that
				// arguments are needed to create the filter function
				// just as Sizzle does
				if ( fn[ expando ] ) {
					return fn( argument );
				}

				// But maintain support for old signatures
				if ( fn.length > 1 ) {
					args = [ pseudo, pseudo, "", argument ];
					return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
						markFunction(function( seed, matches ) {
							var idx,
								matched = fn( seed, argument ),
								i = matched.length;
							while ( i-- ) {
								idx = indexOf( seed, matched[i] );
								seed[ idx ] = !( matches[ idx ] = matched[i] );
							}
						}) :
						function( elem ) {
							return fn( elem, 0, args );
						};
				}

				return fn;
			}
		},

		pseudos: {
			// Potentially complex pseudos
			"not": markFunction(function( selector ) {
				// Trim the selector passed to compile
				// to avoid treating leading and trailing
				// spaces as combinators
				var input = [],
					results = [],
					matcher = compile( selector.replace( rtrim, "$1" ) );

				return matcher[ expando ] ?
					markFunction(function( seed, matches, context, xml ) {
						var elem,
							unmatched = matcher( seed, null, xml, [] ),
							i = seed.length;

						// Match elements unmatched by `matcher`
						while ( i-- ) {
							if ( (elem = unmatched[i]) ) {
								seed[i] = !(matches[i] = elem);
							}
						}
					}) :
					function( elem, context, xml ) {
						input[0] = elem;
						matcher( input, null, xml, results );
						// Don't keep the element (issue #299)
						input[0] = null;
						return !results.pop();
					};
			}),

			"has": markFunction(function( selector ) {
				return function( elem ) {
					return Sizzle( selector, elem ).length > 0;
				};
			}),

			"contains": markFunction(function( text ) {
				text = text.replace( runescape, funescape );
				return function( elem ) {
					return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
				};
			}),

			// "Whether an element is represented by a :lang() selector
			// is based solely on the element's language value
			// being equal to the identifier C,
			// or beginning with the identifier C immediately followed by "-".
			// The matching of C against the element's language value is performed case-insensitively.
			// The identifier C does not have to be a valid language name."
			// http://www.w3.org/TR/selectors/#lang-pseudo
			"lang": markFunction( function( lang ) {
				// lang value must be a valid identifier
				if ( !ridentifier.test(lang || "") ) {
					Sizzle.error( "unsupported lang: " + lang );
				}
				lang = lang.replace( runescape, funescape ).toLowerCase();
				return function( elem ) {
					var elemLang;
					do {
						if ( (elemLang = documentIsHTML ?
							elem.lang :
							elem.getAttribute("xml:lang") || elem.getAttribute("lang")) ) {

							elemLang = elemLang.toLowerCase();
							return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
						}
					} while ( (elem = elem.parentNode) && elem.nodeType === 1 );
					return false;
				};
			}),

			// Miscellaneous
			"target": function( elem ) {
				var hash = window.location && window.location.hash;
				return hash && hash.slice( 1 ) === elem.id;
			},

			"root": function( elem ) {
				return elem === docElem;
			},

			"focus": function( elem ) {
				return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
			},

			// Boolean properties
			"enabled": function( elem ) {
				return elem.disabled === false;
			},

			"disabled": function( elem ) {
				return elem.disabled === true;
			},

			"checked": function( elem ) {
				// In CSS3, :checked should return both checked and selected elements
				// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
				var nodeName = elem.nodeName.toLowerCase();
				return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
			},

			"selected": function( elem ) {
				// Accessing this property makes selected-by-default
				// options in Safari work properly
				if ( elem.parentNode ) {
					elem.parentNode.selectedIndex;
				}

				return elem.selected === true;
			},

			// Contents
			"empty": function( elem ) {
				// http://www.w3.org/TR/selectors/#empty-pseudo
				// :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
				//   but not by others (comment: 8; processing instruction: 7; etc.)
				// nodeType < 6 works because attributes (2) do not appear as children
				for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
					if ( elem.nodeType < 6 ) {
						return false;
					}
				}
				return true;
			},

			"parent": function( elem ) {
				return !Expr.pseudos["empty"]( elem );
			},

			// Element/input types
			"header": function( elem ) {
				return rheader.test( elem.nodeName );
			},

			"input": function( elem ) {
				return rinputs.test( elem.nodeName );
			},

			"button": function( elem ) {
				var name = elem.nodeName.toLowerCase();
				return name === "input" && elem.type === "button" || name === "button";
			},

			"text": function( elem ) {
				var attr;
				return elem.nodeName.toLowerCase() === "input" &&
					elem.type === "text" &&

					// Support: IE<8
					// New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
					( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === "text" );
			},

			// Position-in-collection
			"first": createPositionalPseudo(function() {
				return [ 0 ];
			}),

			"last": createPositionalPseudo(function( matchIndexes, length ) {
				return [ length - 1 ];
			}),

			"eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
				return [ argument < 0 ? argument + length : argument ];
			}),

			"even": createPositionalPseudo(function( matchIndexes, length ) {
				var i = 0;
				for ( ; i < length; i += 2 ) {
					matchIndexes.push( i );
				}
				return matchIndexes;
			}),

			"odd": createPositionalPseudo(function( matchIndexes, length ) {
				var i = 1;
				for ( ; i < length; i += 2 ) {
					matchIndexes.push( i );
				}
				return matchIndexes;
			}),

			"lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
				var i = argument < 0 ? argument + length : argument;
				for ( ; --i >= 0; ) {
					matchIndexes.push( i );
				}
				return matchIndexes;
			}),

			"gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
				var i = argument < 0 ? argument + length : argument;
				for ( ; ++i < length; ) {
					matchIndexes.push( i );
				}
				return matchIndexes;
			})
		}
	};

	Expr.pseudos["nth"] = Expr.pseudos["eq"];

	// Add button/input type pseudos
	for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
		Expr.pseudos[ i ] = createInputPseudo( i );
	}
	for ( i in { submit: true, reset: true } ) {
		Expr.pseudos[ i ] = createButtonPseudo( i );
	}

	// Easy API for creating new setFilters
	function setFilters() {}
	setFilters.prototype = Expr.filters = Expr.pseudos;
	Expr.setFilters = new setFilters();

	tokenize = Sizzle.tokenize = function( selector, parseOnly ) {
		var matched, match, tokens, type,
			soFar, groups, preFilters,
			cached = tokenCache[ selector + " " ];

		if ( cached ) {
			return parseOnly ? 0 : cached.slice( 0 );
		}

		soFar = selector;
		groups = [];
		preFilters = Expr.preFilter;

		while ( soFar ) {

			// Comma and first run
			if ( !matched || (match = rcomma.exec( soFar )) ) {
				if ( match ) {
					// Don't consume trailing commas as valid
					soFar = soFar.slice( match[0].length ) || soFar;
				}
				groups.push( (tokens = []) );
			}

			matched = false;

			// Combinators
			if ( (match = rcombinators.exec( soFar )) ) {
				matched = match.shift();
				tokens.push({
					value: matched,
					// Cast descendant combinators to space
					type: match[0].replace( rtrim, " " )
				});
				soFar = soFar.slice( matched.length );
			}

			// Filters
			for ( type in Expr.filter ) {
				if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
					(match = preFilters[ type ]( match ))) ) {
					matched = match.shift();
					tokens.push({
						value: matched,
						type: type,
						matches: match
					});
					soFar = soFar.slice( matched.length );
				}
			}

			if ( !matched ) {
				break;
			}
		}

		// Return the length of the invalid excess
		// if we're just parsing
		// Otherwise, throw an error or return tokens
		return parseOnly ?
			soFar.length :
			soFar ?
				Sizzle.error( selector ) :
				// Cache the tokens
				tokenCache( selector, groups ).slice( 0 );
	};

	function toSelector( tokens ) {
		var i = 0,
			len = tokens.length,
			selector = "";
		for ( ; i < len; i++ ) {
			selector += tokens[i].value;
		}
		return selector;
	}

	function addCombinator( matcher, combinator, base ) {
		var dir = combinator.dir,
			checkNonElements = base && dir === "parentNode",
			doneName = done++;

		return combinator.first ?
			// Check against closest ancestor/preceding element
			function( elem, context, xml ) {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						return matcher( elem, context, xml );
					}
				}
			} :

			// Check against all ancestor/preceding elements
			function( elem, context, xml ) {
				var oldCache, uniqueCache, outerCache,
					newCache = [ dirruns, doneName ];

				// We can't set arbitrary data on XML nodes, so they don't benefit from combinator caching
				if ( xml ) {
					while ( (elem = elem[ dir ]) ) {
						if ( elem.nodeType === 1 || checkNonElements ) {
							if ( matcher( elem, context, xml ) ) {
								return true;
							}
						}
					}
				} else {
					while ( (elem = elem[ dir ]) ) {
						if ( elem.nodeType === 1 || checkNonElements ) {
							outerCache = elem[ expando ] || (elem[ expando ] = {});

							// Support: IE <9 only
							// Defend against cloned attroperties (jQuery gh-1709)
							uniqueCache = outerCache[ elem.uniqueID ] || (outerCache[ elem.uniqueID ] = {});

							if ( (oldCache = uniqueCache[ dir ]) &&
								oldCache[ 0 ] === dirruns && oldCache[ 1 ] === doneName ) {

								// Assign to newCache so results back-propagate to previous elements
								return (newCache[ 2 ] = oldCache[ 2 ]);
							} else {
								// Reuse newcache so results back-propagate to previous elements
								uniqueCache[ dir ] = newCache;

								// A match means we're done; a fail means we have to keep checking
								if ( (newCache[ 2 ] = matcher( elem, context, xml )) ) {
									return true;
								}
							}
						}
					}
				}
			};
	}

	function elementMatcher( matchers ) {
		return matchers.length > 1 ?
			function( elem, context, xml ) {
				var i = matchers.length;
				while ( i-- ) {
					if ( !matchers[i]( elem, context, xml ) ) {
						return false;
					}
				}
				return true;
			} :
			matchers[0];
	}

	function multipleContexts( selector, contexts, results ) {
		var i = 0,
			len = contexts.length;
		for ( ; i < len; i++ ) {
			Sizzle( selector, contexts[i], results );
		}
		return results;
	}

	function condense( unmatched, map, filter, context, xml ) {
		var elem,
			newUnmatched = [],
			i = 0,
			len = unmatched.length,
			mapped = map != null;

		for ( ; i < len; i++ ) {
			if ( (elem = unmatched[i]) ) {
				if ( !filter || filter( elem, context, xml ) ) {
					newUnmatched.push( elem );
					if ( mapped ) {
						map.push( i );
					}
				}
			}
		}

		return newUnmatched;
	}

	function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
		if ( postFilter && !postFilter[ expando ] ) {
			postFilter = setMatcher( postFilter );
		}
		if ( postFinder && !postFinder[ expando ] ) {
			postFinder = setMatcher( postFinder, postSelector );
		}
		return markFunction(function( seed, results, context, xml ) {
			var temp, i, elem,
				preMap = [],
				postMap = [],
				preexisting = results.length,

				// Get initial elements from seed or context
				elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),

				// Prefilter to get matcher input, preserving a map for seed-results synchronization
				matcherIn = preFilter && ( seed || !selector ) ?
					condense( elems, preMap, preFilter, context, xml ) :
					elems,

				matcherOut = matcher ?
					// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
					postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

						// ...intermediate processing is necessary
						[] :

						// ...otherwise use results directly
						results :
					matcherIn;

			// Find primary matches
			if ( matcher ) {
				matcher( matcherIn, matcherOut, context, xml );
			}

			// Apply postFilter
			if ( postFilter ) {
				temp = condense( matcherOut, postMap );
				postFilter( temp, [], context, xml );

				// Un-match failing elements by moving them back to matcherIn
				i = temp.length;
				while ( i-- ) {
					if ( (elem = temp[i]) ) {
						matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
					}
				}
			}

			if ( seed ) {
				if ( postFinder || preFilter ) {
					if ( postFinder ) {
						// Get the final matcherOut by condensing this intermediate into postFinder contexts
						temp = [];
						i = matcherOut.length;
						while ( i-- ) {
							if ( (elem = matcherOut[i]) ) {
								// Restore matcherIn since elem is not yet a final match
								temp.push( (matcherIn[i] = elem) );
							}
						}
						postFinder( null, (matcherOut = []), temp, xml );
					}

					// Move matched elements from seed to results to keep them synchronized
					i = matcherOut.length;
					while ( i-- ) {
						if ( (elem = matcherOut[i]) &&
							(temp = postFinder ? indexOf( seed, elem ) : preMap[i]) > -1 ) {

							seed[temp] = !(results[temp] = elem);
						}
					}
				}

			// Add elements to results, through postFinder if defined
			} else {
				matcherOut = condense(
					matcherOut === results ?
						matcherOut.splice( preexisting, matcherOut.length ) :
						matcherOut
				);
				if ( postFinder ) {
					postFinder( null, results, matcherOut, xml );
				} else {
					push.apply( results, matcherOut );
				}
			}
		});
	}

	function matcherFromTokens( tokens ) {
		var checkContext, matcher, j,
			len = tokens.length,
			leadingRelative = Expr.relative[ tokens[0].type ],
			implicitRelative = leadingRelative || Expr.relative[" "],
			i = leadingRelative ? 1 : 0,

			// The foundational matcher ensures that elements are reachable from top-level context(s)
			matchContext = addCombinator( function( elem ) {
				return elem === checkContext;
			}, implicitRelative, true ),
			matchAnyContext = addCombinator( function( elem ) {
				return indexOf( checkContext, elem ) > -1;
			}, implicitRelative, true ),
			matchers = [ function( elem, context, xml ) {
				var ret = ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
					(checkContext = context).nodeType ?
						matchContext( elem, context, xml ) :
						matchAnyContext( elem, context, xml ) );
				// Avoid hanging onto element (issue #299)
				checkContext = null;
				return ret;
			} ];

		for ( ; i < len; i++ ) {
			if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
				matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];
			} else {
				matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );

				// Return special upon seeing a positional matcher
				if ( matcher[ expando ] ) {
					// Find the next relative operator (if any) for proper handling
					j = ++i;
					for ( ; j < len; j++ ) {
						if ( Expr.relative[ tokens[j].type ] ) {
							break;
						}
					}
					return setMatcher(
						i > 1 && elementMatcher( matchers ),
						i > 1 && toSelector(
							// If the preceding token was a descendant combinator, insert an implicit any-element `*`
							tokens.slice( 0, i - 1 ).concat({ value: tokens[ i - 2 ].type === " " ? "*" : "" })
						).replace( rtrim, "$1" ),
						matcher,
						i < j && matcherFromTokens( tokens.slice( i, j ) ),
						j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
						j < len && toSelector( tokens )
					);
				}
				matchers.push( matcher );
			}
		}

		return elementMatcher( matchers );
	}

	function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
		var bySet = setMatchers.length > 0,
			byElement = elementMatchers.length > 0,
			superMatcher = function( seed, context, xml, results, outermost ) {
				var elem, j, matcher,
					matchedCount = 0,
					i = "0",
					unmatched = seed && [],
					setMatched = [],
					contextBackup = outermostContext,
					// We must always have either seed elements or outermost context
					elems = seed || byElement && Expr.find["TAG"]( "*", outermost ),
					// Use integer dirruns iff this is the outermost matcher
					dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1),
					len = elems.length;

				if ( outermost ) {
					outermostContext = context === document || context || outermost;
				}

				// Add elements passing elementMatchers directly to results
				// Support: IE<9, Safari
				// Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
				for ( ; i !== len && (elem = elems[i]) != null; i++ ) {
					if ( byElement && elem ) {
						j = 0;
						if ( !context && elem.ownerDocument !== document ) {
							setDocument( elem );
							xml = !documentIsHTML;
						}
						while ( (matcher = elementMatchers[j++]) ) {
							if ( matcher( elem, context || document, xml) ) {
								results.push( elem );
								break;
							}
						}
						if ( outermost ) {
							dirruns = dirrunsUnique;
						}
					}

					// Track unmatched elements for set filters
					if ( bySet ) {
						// They will have gone through all possible matchers
						if ( (elem = !matcher && elem) ) {
							matchedCount--;
						}

						// Lengthen the array for every element, matched or not
						if ( seed ) {
							unmatched.push( elem );
						}
					}
				}

				// `i` is now the count of elements visited above, and adding it to `matchedCount`
				// makes the latter nonnegative.
				matchedCount += i;

				// Apply set filters to unmatched elements
				// NOTE: This can be skipped if there are no unmatched elements (i.e., `matchedCount`
				// equals `i`), unless we didn't visit _any_ elements in the above loop because we have
				// no element matchers and no seed.
				// Incrementing an initially-string "0" `i` allows `i` to remain a string only in that
				// case, which will result in a "00" `matchedCount` that differs from `i` but is also
				// numerically zero.
				if ( bySet && i !== matchedCount ) {
					j = 0;
					while ( (matcher = setMatchers[j++]) ) {
						matcher( unmatched, setMatched, context, xml );
					}

					if ( seed ) {
						// Reintegrate element matches to eliminate the need for sorting
						if ( matchedCount > 0 ) {
							while ( i-- ) {
								if ( !(unmatched[i] || setMatched[i]) ) {
									setMatched[i] = pop.call( results );
								}
							}
						}

						// Discard index placeholder values to get only actual matches
						setMatched = condense( setMatched );
					}

					// Add matches to results
					push.apply( results, setMatched );

					// Seedless set matches succeeding multiple successful matchers stipulate sorting
					if ( outermost && !seed && setMatched.length > 0 &&
						( matchedCount + setMatchers.length ) > 1 ) {

						Sizzle.uniqueSort( results );
					}
				}

				// Override manipulation of globals by nested matchers
				if ( outermost ) {
					dirruns = dirrunsUnique;
					outermostContext = contextBackup;
				}

				return unmatched;
			};

		return bySet ?
			markFunction( superMatcher ) :
			superMatcher;
	}

	compile = Sizzle.compile = function( selector, match /* Internal Use Only */ ) {
		var i,
			setMatchers = [],
			elementMatchers = [],
			cached = compilerCache[ selector + " " ];

		if ( !cached ) {
			// Generate a function of recursive functions that can be used to check each element
			if ( !match ) {
				match = tokenize( selector );
			}
			i = match.length;
			while ( i-- ) {
				cached = matcherFromTokens( match[i] );
				if ( cached[ expando ] ) {
					setMatchers.push( cached );
				} else {
					elementMatchers.push( cached );
				}
			}

			// Cache the compiled function
			cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );

			// Save selector and tokenization
			cached.selector = selector;
		}
		return cached;
	};

	/**
	 * A low-level selection function that works with Sizzle's compiled
	 *  selector functions
	 * @param {String|Function} selector A selector or a pre-compiled
	 *  selector function built with Sizzle.compile
	 * @param {Element} context
	 * @param {Array} [results]
	 * @param {Array} [seed] A set of elements to match against
	 */
	select = Sizzle.select = function( selector, context, results, seed ) {
		var i, tokens, token, type, find,
			compiled = typeof selector === "function" && selector,
			match = !seed && tokenize( (selector = compiled.selector || selector) );

		results = results || [];

		// Try to minimize operations if there is only one selector in the list and no seed
		// (the latter of which guarantees us context)
		if ( match.length === 1 ) {

			// Reduce context if the leading compound selector is an ID
			tokens = match[0] = match[0].slice( 0 );
			if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
					support.getById && context.nodeType === 9 && documentIsHTML &&
					Expr.relative[ tokens[1].type ] ) {

				context = ( Expr.find["ID"]( token.matches[0].replace(runescape, funescape), context ) || [] )[0];
				if ( !context ) {
					return results;

				// Precompiled matchers will still verify ancestry, so step up a level
				} else if ( compiled ) {
					context = context.parentNode;
				}

				selector = selector.slice( tokens.shift().value.length );
			}

			// Fetch a seed set for right-to-left matching
			i = matchExpr["needsContext"].test( selector ) ? 0 : tokens.length;
			while ( i-- ) {
				token = tokens[i];

				// Abort if we hit a combinator
				if ( Expr.relative[ (type = token.type) ] ) {
					break;
				}
				if ( (find = Expr.find[ type ]) ) {
					// Search, expanding context for leading sibling combinators
					if ( (seed = find(
						token.matches[0].replace( runescape, funescape ),
						rsibling.test( tokens[0].type ) && testContext( context.parentNode ) || context
					)) ) {

						// If seed is empty or no tokens remain, we can return early
						tokens.splice( i, 1 );
						selector = seed.length && toSelector( tokens );
						if ( !selector ) {
							push.apply( results, seed );
							return results;
						}

						break;
					}
				}
			}
		}

		// Compile and execute a filtering function if one is not provided
		// Provide `match` to avoid retokenization if we modified the selector above
		( compiled || compile( selector, match ) )(
			seed,
			context,
			!documentIsHTML,
			results,
			!context || rsibling.test( selector ) && testContext( context.parentNode ) || context
		);
		return results;
	};

	// One-time assignments

	// Sort stability
	support.sortStable = expando.split("").sort( sortOrder ).join("") === expando;

	// Support: Chrome 14-35+
	// Always assume duplicates if they aren't passed to the comparison function
	support.detectDuplicates = !!hasDuplicate;

	// Initialize against the default document
	setDocument();

	// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
	// Detached nodes confoundingly follow *each other*
	support.sortDetached = assert(function( div1 ) {
		// Should return 1, but returns 4 (following)
		return div1.compareDocumentPosition( document.createElement("div") ) & 1;
	});

	// Support: IE<8
	// Prevent attribute/property "interpolation"
	// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
	if ( !assert(function( div ) {
		div.innerHTML = "<a href='#'></a>";
		return div.firstChild.getAttribute("href") === "#" ;
	}) ) {
		addHandle( "type|href|height|width", function( elem, name, isXML ) {
			if ( !isXML ) {
				return elem.getAttribute( name, name.toLowerCase() === "type" ? 1 : 2 );
			}
		});
	}

	// Support: IE<9
	// Use defaultValue in place of getAttribute("value")
	if ( !support.attributes || !assert(function( div ) {
		div.innerHTML = "<input/>";
		div.firstChild.setAttribute( "value", "" );
		return div.firstChild.getAttribute( "value" ) === "";
	}) ) {
		addHandle( "value", function( elem, name, isXML ) {
			if ( !isXML && elem.nodeName.toLowerCase() === "input" ) {
				return elem.defaultValue;
			}
		});
	}

	// Support: IE<9
	// Use getAttributeNode to fetch booleans when getAttribute lies
	if ( !assert(function( div ) {
		return div.getAttribute("disabled") == null;
	}) ) {
		addHandle( booleans, function( elem, name, isXML ) {
			var val;
			if ( !isXML ) {
				return elem[ name ] === true ? name.toLowerCase() :
						(val = elem.getAttributeNode( name )) && val.specified ?
						val.value :
					null;
			}
		});
	}

	return Sizzle;

	})( window );



	jQuery.find = Sizzle;
	jQuery.expr = Sizzle.selectors;
	jQuery.expr[ ":" ] = jQuery.expr.pseudos;
	jQuery.uniqueSort = jQuery.unique = Sizzle.uniqueSort;
	jQuery.text = Sizzle.getText;
	jQuery.isXMLDoc = Sizzle.isXML;
	jQuery.contains = Sizzle.contains;



	var dir = function( elem, dir, until ) {
		var matched = [],
			truncate = until !== undefined;

		while ( ( elem = elem[ dir ] ) && elem.nodeType !== 9 ) {
			if ( elem.nodeType === 1 ) {
				if ( truncate && jQuery( elem ).is( until ) ) {
					break;
				}
				matched.push( elem );
			}
		}
		return matched;
	};


	var siblings = function( n, elem ) {
		var matched = [];

		for ( ; n; n = n.nextSibling ) {
			if ( n.nodeType === 1 && n !== elem ) {
				matched.push( n );
			}
		}

		return matched;
	};


	var rneedsContext = jQuery.expr.match.needsContext;

	var rsingleTag = ( /^<([\w-]+)\s*\/?>(?:<\/\1>|)$/ );



	var risSimple = /^.[^:#\[\.,]*$/;

	// Implement the identical functionality for filter and not
	function winnow( elements, qualifier, not ) {
		if ( jQuery.isFunction( qualifier ) ) {
			return jQuery.grep( elements, function( elem, i ) {
				/* jshint -W018 */
				return !!qualifier.call( elem, i, elem ) !== not;
			} );

		}

		if ( qualifier.nodeType ) {
			return jQuery.grep( elements, function( elem ) {
				return ( elem === qualifier ) !== not;
			} );

		}

		if ( typeof qualifier === "string" ) {
			if ( risSimple.test( qualifier ) ) {
				return jQuery.filter( qualifier, elements, not );
			}

			qualifier = jQuery.filter( qualifier, elements );
		}

		return jQuery.grep( elements, function( elem ) {
			return ( indexOf.call( qualifier, elem ) > -1 ) !== not;
		} );
	}

	jQuery.filter = function( expr, elems, not ) {
		var elem = elems[ 0 ];

		if ( not ) {
			expr = ":not(" + expr + ")";
		}

		return elems.length === 1 && elem.nodeType === 1 ?
			jQuery.find.matchesSelector( elem, expr ) ? [ elem ] : [] :
			jQuery.find.matches( expr, jQuery.grep( elems, function( elem ) {
				return elem.nodeType === 1;
			} ) );
	};

	jQuery.fn.extend( {
		find: function( selector ) {
			var i,
				len = this.length,
				ret = [],
				self = this;

			if ( typeof selector !== "string" ) {
				return this.pushStack( jQuery( selector ).filter( function() {
					for ( i = 0; i < len; i++ ) {
						if ( jQuery.contains( self[ i ], this ) ) {
							return true;
						}
					}
				} ) );
			}

			for ( i = 0; i < len; i++ ) {
				jQuery.find( selector, self[ i ], ret );
			}

			// Needed because $( selector, context ) becomes $( context ).find( selector )
			ret = this.pushStack( len > 1 ? jQuery.unique( ret ) : ret );
			ret.selector = this.selector ? this.selector + " " + selector : selector;
			return ret;
		},
		filter: function( selector ) {
			return this.pushStack( winnow( this, selector || [], false ) );
		},
		not: function( selector ) {
			return this.pushStack( winnow( this, selector || [], true ) );
		},
		is: function( selector ) {
			return !!winnow(
				this,

				// If this is a positional/relative selector, check membership in the returned set
				// so $("p:first").is("p:last") won't return true for a doc with two "p".
				typeof selector === "string" && rneedsContext.test( selector ) ?
					jQuery( selector ) :
					selector || [],
				false
			).length;
		}
	} );


	// Initialize a jQuery object


	// A central reference to the root jQuery(document)
	var rootjQuery,

		// A simple way to check for HTML strings
		// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
		// Strict HTML recognition (#11290: must start with <)
		rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,

		init = jQuery.fn.init = function( selector, context, root ) {
			var match, elem;

			// HANDLE: $(""), $(null), $(undefined), $(false)
			if ( !selector ) {
				return this;
			}

			// Method init() accepts an alternate rootjQuery
			// so migrate can support jQuery.sub (gh-2101)
			root = root || rootjQuery;

			// Handle HTML strings
			if ( typeof selector === "string" ) {
				if ( selector[ 0 ] === "<" &&
					selector[ selector.length - 1 ] === ">" &&
					selector.length >= 3 ) {

					// Assume that strings that start and end with <> are HTML and skip the regex check
					match = [ null, selector, null ];

				} else {
					match = rquickExpr.exec( selector );
				}

				// Match html or make sure no context is specified for #id
				if ( match && ( match[ 1 ] || !context ) ) {

					// HANDLE: $(html) -> $(array)
					if ( match[ 1 ] ) {
						context = context instanceof jQuery ? context[ 0 ] : context;

						// Option to run scripts is true for back-compat
						// Intentionally let the error be thrown if parseHTML is not present
						jQuery.merge( this, jQuery.parseHTML(
							match[ 1 ],
							context && context.nodeType ? context.ownerDocument || context : document,
							true
						) );

						// HANDLE: $(html, props)
						if ( rsingleTag.test( match[ 1 ] ) && jQuery.isPlainObject( context ) ) {
							for ( match in context ) {

								// Properties of context are called as methods if possible
								if ( jQuery.isFunction( this[ match ] ) ) {
									this[ match ]( context[ match ] );

								// ...and otherwise set as attributes
								} else {
									this.attr( match, context[ match ] );
								}
							}
						}

						return this;

					// HANDLE: $(#id)
					} else {
						elem = document.getElementById( match[ 2 ] );

						// Support: Blackberry 4.6
						// gEBID returns nodes no longer in the document (#6963)
						if ( elem && elem.parentNode ) {

							// Inject the element directly into the jQuery object
							this.length = 1;
							this[ 0 ] = elem;
						}

						this.context = document;
						this.selector = selector;
						return this;
					}

				// HANDLE: $(expr, $(...))
				} else if ( !context || context.jquery ) {
					return ( context || root ).find( selector );

				// HANDLE: $(expr, context)
				// (which is just equivalent to: $(context).find(expr)
				} else {
					return this.constructor( context ).find( selector );
				}

			// HANDLE: $(DOMElement)
			} else if ( selector.nodeType ) {
				this.context = this[ 0 ] = selector;
				this.length = 1;
				return this;

			// HANDLE: $(function)
			// Shortcut for document ready
			} else if ( jQuery.isFunction( selector ) ) {
				return root.ready !== undefined ?
					root.ready( selector ) :

					// Execute immediately if ready is not present
					selector( jQuery );
			}

			if ( selector.selector !== undefined ) {
				this.selector = selector.selector;
				this.context = selector.context;
			}

			return jQuery.makeArray( selector, this );
		};

	// Give the init function the jQuery prototype for later instantiation
	init.prototype = jQuery.fn;

	// Initialize central reference
	rootjQuery = jQuery( document );


	var rparentsprev = /^(?:parents|prev(?:Until|All))/,

		// Methods guaranteed to produce a unique set when starting from a unique set
		guaranteedUnique = {
			children: true,
			contents: true,
			next: true,
			prev: true
		};

	jQuery.fn.extend( {
		has: function( target ) {
			var targets = jQuery( target, this ),
				l = targets.length;

			return this.filter( function() {
				var i = 0;
				for ( ; i < l; i++ ) {
					if ( jQuery.contains( this, targets[ i ] ) ) {
						return true;
					}
				}
			} );
		},

		closest: function( selectors, context ) {
			var cur,
				i = 0,
				l = this.length,
				matched = [],
				pos = rneedsContext.test( selectors ) || typeof selectors !== "string" ?
					jQuery( selectors, context || this.context ) :
					0;

			for ( ; i < l; i++ ) {
				for ( cur = this[ i ]; cur && cur !== context; cur = cur.parentNode ) {

					// Always skip document fragments
					if ( cur.nodeType < 11 && ( pos ?
						pos.index( cur ) > -1 :

						// Don't pass non-elements to Sizzle
						cur.nodeType === 1 &&
							jQuery.find.matchesSelector( cur, selectors ) ) ) {

						matched.push( cur );
						break;
					}
				}
			}

			return this.pushStack( matched.length > 1 ? jQuery.uniqueSort( matched ) : matched );
		},

		// Determine the position of an element within the set
		index: function( elem ) {

			// No argument, return index in parent
			if ( !elem ) {
				return ( this[ 0 ] && this[ 0 ].parentNode ) ? this.first().prevAll().length : -1;
			}

			// Index in selector
			if ( typeof elem === "string" ) {
				return indexOf.call( jQuery( elem ), this[ 0 ] );
			}

			// Locate the position of the desired element
			return indexOf.call( this,

				// If it receives a jQuery object, the first element is used
				elem.jquery ? elem[ 0 ] : elem
			);
		},

		add: function( selector, context ) {
			return this.pushStack(
				jQuery.uniqueSort(
					jQuery.merge( this.get(), jQuery( selector, context ) )
				)
			);
		},

		addBack: function( selector ) {
			return this.add( selector == null ?
				this.prevObject : this.prevObject.filter( selector )
			);
		}
	} );

	function sibling( cur, dir ) {
		while ( ( cur = cur[ dir ] ) && cur.nodeType !== 1 ) {}
		return cur;
	}

	jQuery.each( {
		parent: function( elem ) {
			var parent = elem.parentNode;
			return parent && parent.nodeType !== 11 ? parent : null;
		},
		parents: function( elem ) {
			return dir( elem, "parentNode" );
		},
		parentsUntil: function( elem, i, until ) {
			return dir( elem, "parentNode", until );
		},
		next: function( elem ) {
			return sibling( elem, "nextSibling" );
		},
		prev: function( elem ) {
			return sibling( elem, "previousSibling" );
		},
		nextAll: function( elem ) {
			return dir( elem, "nextSibling" );
		},
		prevAll: function( elem ) {
			return dir( elem, "previousSibling" );
		},
		nextUntil: function( elem, i, until ) {
			return dir( elem, "nextSibling", until );
		},
		prevUntil: function( elem, i, until ) {
			return dir( elem, "previousSibling", until );
		},
		siblings: function( elem ) {
			return siblings( ( elem.parentNode || {} ).firstChild, elem );
		},
		children: function( elem ) {
			return siblings( elem.firstChild );
		},
		contents: function( elem ) {
			return elem.contentDocument || jQuery.merge( [], elem.childNodes );
		}
	}, function( name, fn ) {
		jQuery.fn[ name ] = function( until, selector ) {
			var matched = jQuery.map( this, fn, until );

			if ( name.slice( -5 ) !== "Until" ) {
				selector = until;
			}

			if ( selector && typeof selector === "string" ) {
				matched = jQuery.filter( selector, matched );
			}

			if ( this.length > 1 ) {

				// Remove duplicates
				if ( !guaranteedUnique[ name ] ) {
					jQuery.uniqueSort( matched );
				}

				// Reverse order for parents* and prev-derivatives
				if ( rparentsprev.test( name ) ) {
					matched.reverse();
				}
			}

			return this.pushStack( matched );
		};
	} );
	var rnotwhite = ( /\S+/g );



	// Convert String-formatted options into Object-formatted ones
	function createOptions( options ) {
		var object = {};
		jQuery.each( options.match( rnotwhite ) || [], function( _, flag ) {
			object[ flag ] = true;
		} );
		return object;
	}

	/*
	 * Create a callback list using the following parameters:
	 *
	 *	options: an optional list of space-separated options that will change how
	 *			the callback list behaves or a more traditional option object
	 *
	 * By default a callback list will act like an event callback list and can be
	 * "fired" multiple times.
	 *
	 * Possible options:
	 *
	 *	once:			will ensure the callback list can only be fired once (like a Deferred)
	 *
	 *	memory:			will keep track of previous values and will call any callback added
	 *					after the list has been fired right away with the latest "memorized"
	 *					values (like a Deferred)
	 *
	 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
	 *
	 *	stopOnFalse:	interrupt callings when a callback returns false
	 *
	 */
	jQuery.Callbacks = function( options ) {

		// Convert options from String-formatted to Object-formatted if needed
		// (we check in cache first)
		options = typeof options === "string" ?
			createOptions( options ) :
			jQuery.extend( {}, options );

		var // Flag to know if list is currently firing
			firing,

			// Last fire value for non-forgettable lists
			memory,

			// Flag to know if list was already fired
			fired,

			// Flag to prevent firing
			locked,

			// Actual callback list
			list = [],

			// Queue of execution data for repeatable lists
			queue = [],

			// Index of currently firing callback (modified by add/remove as needed)
			firingIndex = -1,

			// Fire callbacks
			fire = function() {

				// Enforce single-firing
				locked = options.once;

				// Execute callbacks for all pending executions,
				// respecting firingIndex overrides and runtime changes
				fired = firing = true;
				for ( ; queue.length; firingIndex = -1 ) {
					memory = queue.shift();
					while ( ++firingIndex < list.length ) {

						// Run callback and check for early termination
						if ( list[ firingIndex ].apply( memory[ 0 ], memory[ 1 ] ) === false &&
							options.stopOnFalse ) {

							// Jump to end and forget the data so .add doesn't re-fire
							firingIndex = list.length;
							memory = false;
						}
					}
				}

				// Forget the data if we're done with it
				if ( !options.memory ) {
					memory = false;
				}

				firing = false;

				// Clean up if we're done firing for good
				if ( locked ) {

					// Keep an empty list if we have data for future add calls
					if ( memory ) {
						list = [];

					// Otherwise, this object is spent
					} else {
						list = "";
					}
				}
			},

			// Actual Callbacks object
			self = {

				// Add a callback or a collection of callbacks to the list
				add: function() {
					if ( list ) {

						// If we have memory from a past run, we should fire after adding
						if ( memory && !firing ) {
							firingIndex = list.length - 1;
							queue.push( memory );
						}

						( function add( args ) {
							jQuery.each( args, function( _, arg ) {
								if ( jQuery.isFunction( arg ) ) {
									if ( !options.unique || !self.has( arg ) ) {
										list.push( arg );
									}
								} else if ( arg && arg.length && jQuery.type( arg ) !== "string" ) {

									// Inspect recursively
									add( arg );
								}
							} );
						} )( arguments );

						if ( memory && !firing ) {
							fire();
						}
					}
					return this;
				},

				// Remove a callback from the list
				remove: function() {
					jQuery.each( arguments, function( _, arg ) {
						var index;
						while ( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
							list.splice( index, 1 );

							// Handle firing indexes
							if ( index <= firingIndex ) {
								firingIndex--;
							}
						}
					} );
					return this;
				},

				// Check if a given callback is in the list.
				// If no argument is given, return whether or not list has callbacks attached.
				has: function( fn ) {
					return fn ?
						jQuery.inArray( fn, list ) > -1 :
						list.length > 0;
				},

				// Remove all callbacks from the list
				empty: function() {
					if ( list ) {
						list = [];
					}
					return this;
				},

				// Disable .fire and .add
				// Abort any current/pending executions
				// Clear all callbacks and values
				disable: function() {
					locked = queue = [];
					list = memory = "";
					return this;
				},
				disabled: function() {
					return !list;
				},

				// Disable .fire
				// Also disable .add unless we have memory (since it would have no effect)
				// Abort any pending executions
				lock: function() {
					locked = queue = [];
					if ( !memory ) {
						list = memory = "";
					}
					return this;
				},
				locked: function() {
					return !!locked;
				},

				// Call all callbacks with the given context and arguments
				fireWith: function( context, args ) {
					if ( !locked ) {
						args = args || [];
						args = [ context, args.slice ? args.slice() : args ];
						queue.push( args );
						if ( !firing ) {
							fire();
						}
					}
					return this;
				},

				// Call all the callbacks with the given arguments
				fire: function() {
					self.fireWith( this, arguments );
					return this;
				},

				// To know if the callbacks have already been called at least once
				fired: function() {
					return !!fired;
				}
			};

		return self;
	};


	jQuery.extend( {

		Deferred: function( func ) {
			var tuples = [

					// action, add listener, listener list, final state
					[ "resolve", "done", jQuery.Callbacks( "once memory" ), "resolved" ],
					[ "reject", "fail", jQuery.Callbacks( "once memory" ), "rejected" ],
					[ "notify", "progress", jQuery.Callbacks( "memory" ) ]
				],
				state = "pending",
				promise = {
					state: function() {
						return state;
					},
					always: function() {
						deferred.done( arguments ).fail( arguments );
						return this;
					},
					then: function( /* fnDone, fnFail, fnProgress */ ) {
						var fns = arguments;
						return jQuery.Deferred( function( newDefer ) {
							jQuery.each( tuples, function( i, tuple ) {
								var fn = jQuery.isFunction( fns[ i ] ) && fns[ i ];

								// deferred[ done | fail | progress ] for forwarding actions to newDefer
								deferred[ tuple[ 1 ] ]( function() {
									var returned = fn && fn.apply( this, arguments );
									if ( returned && jQuery.isFunction( returned.promise ) ) {
										returned.promise()
											.progress( newDefer.notify )
											.done( newDefer.resolve )
											.fail( newDefer.reject );
									} else {
										newDefer[ tuple[ 0 ] + "With" ](
											this === promise ? newDefer.promise() : this,
											fn ? [ returned ] : arguments
										);
									}
								} );
							} );
							fns = null;
						} ).promise();
					},

					// Get a promise for this deferred
					// If obj is provided, the promise aspect is added to the object
					promise: function( obj ) {
						return obj != null ? jQuery.extend( obj, promise ) : promise;
					}
				},
				deferred = {};

			// Keep pipe for back-compat
			promise.pipe = promise.then;

			// Add list-specific methods
			jQuery.each( tuples, function( i, tuple ) {
				var list = tuple[ 2 ],
					stateString = tuple[ 3 ];

				// promise[ done | fail | progress ] = list.add
				promise[ tuple[ 1 ] ] = list.add;

				// Handle state
				if ( stateString ) {
					list.add( function() {

						// state = [ resolved | rejected ]
						state = stateString;

					// [ reject_list | resolve_list ].disable; progress_list.lock
					}, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );
				}

				// deferred[ resolve | reject | notify ]
				deferred[ tuple[ 0 ] ] = function() {
					deferred[ tuple[ 0 ] + "With" ]( this === deferred ? promise : this, arguments );
					return this;
				};
				deferred[ tuple[ 0 ] + "With" ] = list.fireWith;
			} );

			// Make the deferred a promise
			promise.promise( deferred );

			// Call given func if any
			if ( func ) {
				func.call( deferred, deferred );
			}

			// All done!
			return deferred;
		},

		// Deferred helper
		when: function( subordinate /* , ..., subordinateN */ ) {
			var i = 0,
				resolveValues = slice.call( arguments ),
				length = resolveValues.length,

				// the count of uncompleted subordinates
				remaining = length !== 1 ||
					( subordinate && jQuery.isFunction( subordinate.promise ) ) ? length : 0,

				// the master Deferred.
				// If resolveValues consist of only a single Deferred, just use that.
				deferred = remaining === 1 ? subordinate : jQuery.Deferred(),

				// Update function for both resolve and progress values
				updateFunc = function( i, contexts, values ) {
					return function( value ) {
						contexts[ i ] = this;
						values[ i ] = arguments.length > 1 ? slice.call( arguments ) : value;
						if ( values === progressValues ) {
							deferred.notifyWith( contexts, values );
						} else if ( !( --remaining ) ) {
							deferred.resolveWith( contexts, values );
						}
					};
				},

				progressValues, progressContexts, resolveContexts;

			// Add listeners to Deferred subordinates; treat others as resolved
			if ( length > 1 ) {
				progressValues = new Array( length );
				progressContexts = new Array( length );
				resolveContexts = new Array( length );
				for ( ; i < length; i++ ) {
					if ( resolveValues[ i ] && jQuery.isFunction( resolveValues[ i ].promise ) ) {
						resolveValues[ i ].promise()
							.progress( updateFunc( i, progressContexts, progressValues ) )
							.done( updateFunc( i, resolveContexts, resolveValues ) )
							.fail( deferred.reject );
					} else {
						--remaining;
					}
				}
			}

			// If we're not waiting on anything, resolve the master
			if ( !remaining ) {
				deferred.resolveWith( resolveContexts, resolveValues );
			}

			return deferred.promise();
		}
	} );


	// The deferred used on DOM ready
	var readyList;

	jQuery.fn.ready = function( fn ) {

		// Add the callback
		jQuery.ready.promise().done( fn );

		return this;
	};

	jQuery.extend( {

		// Is the DOM ready to be used? Set to true once it occurs.
		isReady: false,

		// A counter to track how many items to wait for before
		// the ready event fires. See #6781
		readyWait: 1,

		// Hold (or release) the ready event
		holdReady: function( hold ) {
			if ( hold ) {
				jQuery.readyWait++;
			} else {
				jQuery.ready( true );
			}
		},

		// Handle when the DOM is ready
		ready: function( wait ) {

			// Abort if there are pending holds or we're already ready
			if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
				return;
			}

			// Remember that the DOM is ready
			jQuery.isReady = true;

			// If a normal DOM Ready event fired, decrement, and wait if need be
			if ( wait !== true && --jQuery.readyWait > 0 ) {
				return;
			}

			// If there are functions bound, to execute
			readyList.resolveWith( document, [ jQuery ] );

			// Trigger any bound ready events
			if ( jQuery.fn.triggerHandler ) {
				jQuery( document ).triggerHandler( "ready" );
				jQuery( document ).off( "ready" );
			}
		}
	} );

	/**
	 * The ready event handler and self cleanup method
	 */
	function completed() {
		document.removeEventListener( "DOMContentLoaded", completed );
		window.removeEventListener( "load", completed );
		jQuery.ready();
	}

	jQuery.ready.promise = function( obj ) {
		if ( !readyList ) {

			readyList = jQuery.Deferred();

			// Catch cases where $(document).ready() is called
			// after the browser event has already occurred.
			// Support: IE9-10 only
			// Older IE sometimes signals "interactive" too soon
			if ( document.readyState === "complete" ||
				( document.readyState !== "loading" && !document.documentElement.doScroll ) ) {

				// Handle it asynchronously to allow scripts the opportunity to delay ready
				window.setTimeout( jQuery.ready );

			} else {

				// Use the handy event callback
				document.addEventListener( "DOMContentLoaded", completed );

				// A fallback to window.onload, that will always work
				window.addEventListener( "load", completed );
			}
		}
		return readyList.promise( obj );
	};

	// Kick off the DOM ready check even if the user does not
	jQuery.ready.promise();




	// Multifunctional method to get and set values of a collection
	// The value/s can optionally be executed if it's a function
	var access = function( elems, fn, key, value, chainable, emptyGet, raw ) {
		var i = 0,
			len = elems.length,
			bulk = key == null;

		// Sets many values
		if ( jQuery.type( key ) === "object" ) {
			chainable = true;
			for ( i in key ) {
				access( elems, fn, i, key[ i ], true, emptyGet, raw );
			}

		// Sets one value
		} else if ( value !== undefined ) {
			chainable = true;

			if ( !jQuery.isFunction( value ) ) {
				raw = true;
			}

			if ( bulk ) {

				// Bulk operations run against the entire set
				if ( raw ) {
					fn.call( elems, value );
					fn = null;

				// ...except when executing function values
				} else {
					bulk = fn;
					fn = function( elem, key, value ) {
						return bulk.call( jQuery( elem ), value );
					};
				}
			}

			if ( fn ) {
				for ( ; i < len; i++ ) {
					fn(
						elems[ i ], key, raw ?
						value :
						value.call( elems[ i ], i, fn( elems[ i ], key ) )
					);
				}
			}
		}

		return chainable ?
			elems :

			// Gets
			bulk ?
				fn.call( elems ) :
				len ? fn( elems[ 0 ], key ) : emptyGet;
	};
	var acceptData = function( owner ) {

		// Accepts only:
		//  - Node
		//    - Node.ELEMENT_NODE
		//    - Node.DOCUMENT_NODE
		//  - Object
		//    - Any
		/* jshint -W018 */
		return owner.nodeType === 1 || owner.nodeType === 9 || !( +owner.nodeType );
	};




	function Data() {
		this.expando = jQuery.expando + Data.uid++;
	}

	Data.uid = 1;

	Data.prototype = {

		register: function( owner, initial ) {
			var value = initial || {};

			// If it is a node unlikely to be stringify-ed or looped over
			// use plain assignment
			if ( owner.nodeType ) {
				owner[ this.expando ] = value;

			// Otherwise secure it in a non-enumerable, non-writable property
			// configurability must be true to allow the property to be
			// deleted with the delete operator
			} else {
				Object.defineProperty( owner, this.expando, {
					value: value,
					writable: true,
					configurable: true
				} );
			}
			return owner[ this.expando ];
		},
		cache: function( owner ) {

			// We can accept data for non-element nodes in modern browsers,
			// but we should not, see #8335.
			// Always return an empty object.
			if ( !acceptData( owner ) ) {
				return {};
			}

			// Check if the owner object already has a cache
			var value = owner[ this.expando ];

			// If not, create one
			if ( !value ) {
				value = {};

				// We can accept data for non-element nodes in modern browsers,
				// but we should not, see #8335.
				// Always return an empty object.
				if ( acceptData( owner ) ) {

					// If it is a node unlikely to be stringify-ed or looped over
					// use plain assignment
					if ( owner.nodeType ) {
						owner[ this.expando ] = value;

					// Otherwise secure it in a non-enumerable property
					// configurable must be true to allow the property to be
					// deleted when data is removed
					} else {
						Object.defineProperty( owner, this.expando, {
							value: value,
							configurable: true
						} );
					}
				}
			}

			return value;
		},
		set: function( owner, data, value ) {
			var prop,
				cache = this.cache( owner );

			// Handle: [ owner, key, value ] args
			if ( typeof data === "string" ) {
				cache[ data ] = value;

			// Handle: [ owner, { properties } ] args
			} else {

				// Copy the properties one-by-one to the cache object
				for ( prop in data ) {
					cache[ prop ] = data[ prop ];
				}
			}
			return cache;
		},
		get: function( owner, key ) {
			return key === undefined ?
				this.cache( owner ) :
				owner[ this.expando ] && owner[ this.expando ][ key ];
		},
		access: function( owner, key, value ) {
			var stored;

			// In cases where either:
			//
			//   1. No key was specified
			//   2. A string key was specified, but no value provided
			//
			// Take the "read" path and allow the get method to determine
			// which value to return, respectively either:
			//
			//   1. The entire cache object
			//   2. The data stored at the key
			//
			if ( key === undefined ||
					( ( key && typeof key === "string" ) && value === undefined ) ) {

				stored = this.get( owner, key );

				return stored !== undefined ?
					stored : this.get( owner, jQuery.camelCase( key ) );
			}

			// When the key is not a string, or both a key and value
			// are specified, set or extend (existing objects) with either:
			//
			//   1. An object of properties
			//   2. A key and value
			//
			this.set( owner, key, value );

			// Since the "set" path can have two possible entry points
			// return the expected data based on which path was taken[*]
			return value !== undefined ? value : key;
		},
		remove: function( owner, key ) {
			var i, name, camel,
				cache = owner[ this.expando ];

			if ( cache === undefined ) {
				return;
			}

			if ( key === undefined ) {
				this.register( owner );

			} else {

				// Support array or space separated string of keys
				if ( jQuery.isArray( key ) ) {

					// If "name" is an array of keys...
					// When data is initially created, via ("key", "val") signature,
					// keys will be converted to camelCase.
					// Since there is no way to tell _how_ a key was added, remove
					// both plain key and camelCase key. #12786
					// This will only penalize the array argument path.
					name = key.concat( key.map( jQuery.camelCase ) );
				} else {
					camel = jQuery.camelCase( key );

					// Try the string as a key before any manipulation
					if ( key in cache ) {
						name = [ key, camel ];
					} else {

						// If a key with the spaces exists, use it.
						// Otherwise, create an array by matching non-whitespace
						name = camel;
						name = name in cache ?
							[ name ] : ( name.match( rnotwhite ) || [] );
					}
				}

				i = name.length;

				while ( i-- ) {
					delete cache[ name[ i ] ];
				}
			}

			// Remove the expando if there's no more data
			if ( key === undefined || jQuery.isEmptyObject( cache ) ) {

				// Support: Chrome <= 35-45+
				// Webkit & Blink performance suffers when deleting properties
				// from DOM nodes, so set to undefined instead
				// https://code.google.com/p/chromium/issues/detail?id=378607
				if ( owner.nodeType ) {
					owner[ this.expando ] = undefined;
				} else {
					delete owner[ this.expando ];
				}
			}
		},
		hasData: function( owner ) {
			var cache = owner[ this.expando ];
			return cache !== undefined && !jQuery.isEmptyObject( cache );
		}
	};
	var dataPriv = new Data();

	var dataUser = new Data();



	//	Implementation Summary
	//
	//	1. Enforce API surface and semantic compatibility with 1.9.x branch
	//	2. Improve the module's maintainability by reducing the storage
	//		paths to a single mechanism.
	//	3. Use the same single mechanism to support "private" and "user" data.
	//	4. _Never_ expose "private" data to user code (TODO: Drop _data, _removeData)
	//	5. Avoid exposing implementation details on user objects (eg. expando properties)
	//	6. Provide a clear path for implementation upgrade to WeakMap in 2014

	var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
		rmultiDash = /[A-Z]/g;

	function dataAttr( elem, key, data ) {
		var name;

		// If nothing was found internally, try to fetch any
		// data from the HTML5 data-* attribute
		if ( data === undefined && elem.nodeType === 1 ) {
			name = "data-" + key.replace( rmultiDash, "-$&" ).toLowerCase();
			data = elem.getAttribute( name );

			if ( typeof data === "string" ) {
				try {
					data = data === "true" ? true :
						data === "false" ? false :
						data === "null" ? null :

						// Only convert to a number if it doesn't change the string
						+data + "" === data ? +data :
						rbrace.test( data ) ? jQuery.parseJSON( data ) :
						data;
				} catch ( e ) {}

				// Make sure we set the data so it isn't changed later
				dataUser.set( elem, key, data );
			} else {
				data = undefined;
			}
		}
		return data;
	}

	jQuery.extend( {
		hasData: function( elem ) {
			return dataUser.hasData( elem ) || dataPriv.hasData( elem );
		},

		data: function( elem, name, data ) {
			return dataUser.access( elem, name, data );
		},

		removeData: function( elem, name ) {
			dataUser.remove( elem, name );
		},

		// TODO: Now that all calls to _data and _removeData have been replaced
		// with direct calls to dataPriv methods, these can be deprecated.
		_data: function( elem, name, data ) {
			return dataPriv.access( elem, name, data );
		},

		_removeData: function( elem, name ) {
			dataPriv.remove( elem, name );
		}
	} );

	jQuery.fn.extend( {
		data: function( key, value ) {
			var i, name, data,
				elem = this[ 0 ],
				attrs = elem && elem.attributes;

			// Gets all values
			if ( key === undefined ) {
				if ( this.length ) {
					data = dataUser.get( elem );

					if ( elem.nodeType === 1 && !dataPriv.get( elem, "hasDataAttrs" ) ) {
						i = attrs.length;
						while ( i-- ) {

							// Support: IE11+
							// The attrs elements can be null (#14894)
							if ( attrs[ i ] ) {
								name = attrs[ i ].name;
								if ( name.indexOf( "data-" ) === 0 ) {
									name = jQuery.camelCase( name.slice( 5 ) );
									dataAttr( elem, name, data[ name ] );
								}
							}
						}
						dataPriv.set( elem, "hasDataAttrs", true );
					}
				}

				return data;
			}

			// Sets multiple values
			if ( typeof key === "object" ) {
				return this.each( function() {
					dataUser.set( this, key );
				} );
			}

			return access( this, function( value ) {
				var data, camelKey;

				// The calling jQuery object (element matches) is not empty
				// (and therefore has an element appears at this[ 0 ]) and the
				// `value` parameter was not undefined. An empty jQuery object
				// will result in `undefined` for elem = this[ 0 ] which will
				// throw an exception if an attempt to read a data cache is made.
				if ( elem && value === undefined ) {

					// Attempt to get data from the cache
					// with the key as-is
					data = dataUser.get( elem, key ) ||

						// Try to find dashed key if it exists (gh-2779)
						// This is for 2.2.x only
						dataUser.get( elem, key.replace( rmultiDash, "-$&" ).toLowerCase() );

					if ( data !== undefined ) {
						return data;
					}

					camelKey = jQuery.camelCase( key );

					// Attempt to get data from the cache
					// with the key camelized
					data = dataUser.get( elem, camelKey );
					if ( data !== undefined ) {
						return data;
					}

					// Attempt to "discover" the data in
					// HTML5 custom data-* attrs
					data = dataAttr( elem, camelKey, undefined );
					if ( data !== undefined ) {
						return data;
					}

					// We tried really hard, but the data doesn't exist.
					return;
				}

				// Set the data...
				camelKey = jQuery.camelCase( key );
				this.each( function() {

					// First, attempt to store a copy or reference of any
					// data that might've been store with a camelCased key.
					var data = dataUser.get( this, camelKey );

					// For HTML5 data-* attribute interop, we have to
					// store property names with dashes in a camelCase form.
					// This might not apply to all properties...*
					dataUser.set( this, camelKey, value );

					// *... In the case of properties that might _actually_
					// have dashes, we need to also store a copy of that
					// unchanged property.
					if ( key.indexOf( "-" ) > -1 && data !== undefined ) {
						dataUser.set( this, key, value );
					}
				} );
			}, null, value, arguments.length > 1, null, true );
		},

		removeData: function( key ) {
			return this.each( function() {
				dataUser.remove( this, key );
			} );
		}
	} );


	jQuery.extend( {
		queue: function( elem, type, data ) {
			var queue;

			if ( elem ) {
				type = ( type || "fx" ) + "queue";
				queue = dataPriv.get( elem, type );

				// Speed up dequeue by getting out quickly if this is just a lookup
				if ( data ) {
					if ( !queue || jQuery.isArray( data ) ) {
						queue = dataPriv.access( elem, type, jQuery.makeArray( data ) );
					} else {
						queue.push( data );
					}
				}
				return queue || [];
			}
		},

		dequeue: function( elem, type ) {
			type = type || "fx";

			var queue = jQuery.queue( elem, type ),
				startLength = queue.length,
				fn = queue.shift(),
				hooks = jQuery._queueHooks( elem, type ),
				next = function() {
					jQuery.dequeue( elem, type );
				};

			// If the fx queue is dequeued, always remove the progress sentinel
			if ( fn === "inprogress" ) {
				fn = queue.shift();
				startLength--;
			}

			if ( fn ) {

				// Add a progress sentinel to prevent the fx queue from being
				// automatically dequeued
				if ( type === "fx" ) {
					queue.unshift( "inprogress" );
				}

				// Clear up the last queue stop function
				delete hooks.stop;
				fn.call( elem, next, hooks );
			}

			if ( !startLength && hooks ) {
				hooks.empty.fire();
			}
		},

		// Not public - generate a queueHooks object, or return the current one
		_queueHooks: function( elem, type ) {
			var key = type + "queueHooks";
			return dataPriv.get( elem, key ) || dataPriv.access( elem, key, {
				empty: jQuery.Callbacks( "once memory" ).add( function() {
					dataPriv.remove( elem, [ type + "queue", key ] );
				} )
			} );
		}
	} );

	jQuery.fn.extend( {
		queue: function( type, data ) {
			var setter = 2;

			if ( typeof type !== "string" ) {
				data = type;
				type = "fx";
				setter--;
			}

			if ( arguments.length < setter ) {
				return jQuery.queue( this[ 0 ], type );
			}

			return data === undefined ?
				this :
				this.each( function() {
					var queue = jQuery.queue( this, type, data );

					// Ensure a hooks for this queue
					jQuery._queueHooks( this, type );

					if ( type === "fx" && queue[ 0 ] !== "inprogress" ) {
						jQuery.dequeue( this, type );
					}
				} );
		},
		dequeue: function( type ) {
			return this.each( function() {
				jQuery.dequeue( this, type );
			} );
		},
		clearQueue: function( type ) {
			return this.queue( type || "fx", [] );
		},

		// Get a promise resolved when queues of a certain type
		// are emptied (fx is the type by default)
		promise: function( type, obj ) {
			var tmp,
				count = 1,
				defer = jQuery.Deferred(),
				elements = this,
				i = this.length,
				resolve = function() {
					if ( !( --count ) ) {
						defer.resolveWith( elements, [ elements ] );
					}
				};

			if ( typeof type !== "string" ) {
				obj = type;
				type = undefined;
			}
			type = type || "fx";

			while ( i-- ) {
				tmp = dataPriv.get( elements[ i ], type + "queueHooks" );
				if ( tmp && tmp.empty ) {
					count++;
					tmp.empty.add( resolve );
				}
			}
			resolve();
			return defer.promise( obj );
		}
	} );
	var pnum = ( /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/ ).source;

	var rcssNum = new RegExp( "^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i" );


	var cssExpand = [ "Top", "Right", "Bottom", "Left" ];

	var isHidden = function( elem, el ) {

			// isHidden might be called from jQuery#filter function;
			// in that case, element will be second argument
			elem = el || elem;
			return jQuery.css( elem, "display" ) === "none" ||
				!jQuery.contains( elem.ownerDocument, elem );
		};



	function adjustCSS( elem, prop, valueParts, tween ) {
		var adjusted,
			scale = 1,
			maxIterations = 20,
			currentValue = tween ?
				function() { return tween.cur(); } :
				function() { return jQuery.css( elem, prop, "" ); },
			initial = currentValue(),
			unit = valueParts && valueParts[ 3 ] || ( jQuery.cssNumber[ prop ] ? "" : "px" ),

			// Starting value computation is required for potential unit mismatches
			initialInUnit = ( jQuery.cssNumber[ prop ] || unit !== "px" && +initial ) &&
				rcssNum.exec( jQuery.css( elem, prop ) );

		if ( initialInUnit && initialInUnit[ 3 ] !== unit ) {

			// Trust units reported by jQuery.css
			unit = unit || initialInUnit[ 3 ];

			// Make sure we update the tween properties later on
			valueParts = valueParts || [];

			// Iteratively approximate from a nonzero starting point
			initialInUnit = +initial || 1;

			do {

				// If previous iteration zeroed out, double until we get *something*.
				// Use string for doubling so we don't accidentally see scale as unchanged below
				scale = scale || ".5";

				// Adjust and apply
				initialInUnit = initialInUnit / scale;
				jQuery.style( elem, prop, initialInUnit + unit );

			// Update scale, tolerating zero or NaN from tween.cur()
			// Break the loop if scale is unchanged or perfect, or if we've just had enough.
			} while (
				scale !== ( scale = currentValue() / initial ) && scale !== 1 && --maxIterations
			);
		}

		if ( valueParts ) {
			initialInUnit = +initialInUnit || +initial || 0;

			// Apply relative offset (+=/-=) if specified
			adjusted = valueParts[ 1 ] ?
				initialInUnit + ( valueParts[ 1 ] + 1 ) * valueParts[ 2 ] :
				+valueParts[ 2 ];
			if ( tween ) {
				tween.unit = unit;
				tween.start = initialInUnit;
				tween.end = adjusted;
			}
		}
		return adjusted;
	}
	var rcheckableType = ( /^(?:checkbox|radio)$/i );

	var rtagName = ( /<([\w:-]+)/ );

	var rscriptType = ( /^$|\/(?:java|ecma)script/i );



	// We have to close these tags to support XHTML (#13200)
	var wrapMap = {

		// Support: IE9
		option: [ 1, "<select multiple='multiple'>", "</select>" ],

		// XHTML parsers do not magically insert elements in the
		// same way that tag soup parsers do. So we cannot shorten
		// this by omitting <tbody> or other required elements.
		thead: [ 1, "<table>", "</table>" ],
		col: [ 2, "<table><colgroup>", "</colgroup></table>" ],
		tr: [ 2, "<table><tbody>", "</tbody></table>" ],
		td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

		_default: [ 0, "", "" ]
	};

	// Support: IE9
	wrapMap.optgroup = wrapMap.option;

	wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
	wrapMap.th = wrapMap.td;


	function getAll( context, tag ) {

		// Support: IE9-11+
		// Use typeof to avoid zero-argument method invocation on host objects (#15151)
		var ret = typeof context.getElementsByTagName !== "undefined" ?
				context.getElementsByTagName( tag || "*" ) :
				typeof context.querySelectorAll !== "undefined" ?
					context.querySelectorAll( tag || "*" ) :
				[];

		return tag === undefined || tag && jQuery.nodeName( context, tag ) ?
			jQuery.merge( [ context ], ret ) :
			ret;
	}


	// Mark scripts as having already been evaluated
	function setGlobalEval( elems, refElements ) {
		var i = 0,
			l = elems.length;

		for ( ; i < l; i++ ) {
			dataPriv.set(
				elems[ i ],
				"globalEval",
				!refElements || dataPriv.get( refElements[ i ], "globalEval" )
			);
		}
	}


	var rhtml = /<|&#?\w+;/;

	function buildFragment( elems, context, scripts, selection, ignored ) {
		var elem, tmp, tag, wrap, contains, j,
			fragment = context.createDocumentFragment(),
			nodes = [],
			i = 0,
			l = elems.length;

		for ( ; i < l; i++ ) {
			elem = elems[ i ];

			if ( elem || elem === 0 ) {

				// Add nodes directly
				if ( jQuery.type( elem ) === "object" ) {

					// Support: Android<4.1, PhantomJS<2
					// push.apply(_, arraylike) throws on ancient WebKit
					jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

				// Convert non-html into a text node
				} else if ( !rhtml.test( elem ) ) {
					nodes.push( context.createTextNode( elem ) );

				// Convert html into DOM nodes
				} else {
					tmp = tmp || fragment.appendChild( context.createElement( "div" ) );

					// Deserialize a standard representation
					tag = ( rtagName.exec( elem ) || [ "", "" ] )[ 1 ].toLowerCase();
					wrap = wrapMap[ tag ] || wrapMap._default;
					tmp.innerHTML = wrap[ 1 ] + jQuery.htmlPrefilter( elem ) + wrap[ 2 ];

					// Descend through wrappers to the right content
					j = wrap[ 0 ];
					while ( j-- ) {
						tmp = tmp.lastChild;
					}

					// Support: Android<4.1, PhantomJS<2
					// push.apply(_, arraylike) throws on ancient WebKit
					jQuery.merge( nodes, tmp.childNodes );

					// Remember the top-level container
					tmp = fragment.firstChild;

					// Ensure the created nodes are orphaned (#12392)
					tmp.textContent = "";
				}
			}
		}

		// Remove wrapper from fragment
		fragment.textContent = "";

		i = 0;
		while ( ( elem = nodes[ i++ ] ) ) {

			// Skip elements already in the context collection (trac-4087)
			if ( selection && jQuery.inArray( elem, selection ) > -1 ) {
				if ( ignored ) {
					ignored.push( elem );
				}
				continue;
			}

			contains = jQuery.contains( elem.ownerDocument, elem );

			// Append to fragment
			tmp = getAll( fragment.appendChild( elem ), "script" );

			// Preserve script evaluation history
			if ( contains ) {
				setGlobalEval( tmp );
			}

			// Capture executables
			if ( scripts ) {
				j = 0;
				while ( ( elem = tmp[ j++ ] ) ) {
					if ( rscriptType.test( elem.type || "" ) ) {
						scripts.push( elem );
					}
				}
			}
		}

		return fragment;
	}


	( function() {
		var fragment = document.createDocumentFragment(),
			div = fragment.appendChild( document.createElement( "div" ) ),
			input = document.createElement( "input" );

		// Support: Android 4.0-4.3, Safari<=5.1
		// Check state lost if the name is set (#11217)
		// Support: Windows Web Apps (WWA)
		// `name` and `type` must use .setAttribute for WWA (#14901)
		input.setAttribute( "type", "radio" );
		input.setAttribute( "checked", "checked" );
		input.setAttribute( "name", "t" );

		div.appendChild( input );

		// Support: Safari<=5.1, Android<4.2
		// Older WebKit doesn't clone checked state correctly in fragments
		support.checkClone = div.cloneNode( true ).cloneNode( true ).lastChild.checked;

		// Support: IE<=11+
		// Make sure textarea (and checkbox) defaultValue is properly cloned
		div.innerHTML = "<textarea>x</textarea>";
		support.noCloneChecked = !!div.cloneNode( true ).lastChild.defaultValue;
	} )();


	var
		rkeyEvent = /^key/,
		rmouseEvent = /^(?:mouse|pointer|contextmenu|drag|drop)|click/,
		rtypenamespace = /^([^.]*)(?:\.(.+)|)/;

	function returnTrue() {
		return true;
	}

	function returnFalse() {
		return false;
	}

	// Support: IE9
	// See #13393 for more info
	function safeActiveElement() {
		try {
			return document.activeElement;
		} catch ( err ) { }
	}

	function on( elem, types, selector, data, fn, one ) {
		var origFn, type;

		// Types can be a map of types/handlers
		if ( typeof types === "object" ) {

			// ( types-Object, selector, data )
			if ( typeof selector !== "string" ) {

				// ( types-Object, data )
				data = data || selector;
				selector = undefined;
			}
			for ( type in types ) {
				on( elem, type, selector, data, types[ type ], one );
			}
			return elem;
		}

		if ( data == null && fn == null ) {

			// ( types, fn )
			fn = selector;
			data = selector = undefined;
		} else if ( fn == null ) {
			if ( typeof selector === "string" ) {

				// ( types, selector, fn )
				fn = data;
				data = undefined;
			} else {

				// ( types, data, fn )
				fn = data;
				data = selector;
				selector = undefined;
			}
		}
		if ( fn === false ) {
			fn = returnFalse;
		} else if ( !fn ) {
			return elem;
		}

		if ( one === 1 ) {
			origFn = fn;
			fn = function( event ) {

				// Can use an empty set, since event contains the info
				jQuery().off( event );
				return origFn.apply( this, arguments );
			};

			// Use same guid so caller can remove using origFn
			fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
		}
		return elem.each( function() {
			jQuery.event.add( this, types, fn, data, selector );
		} );
	}

	/*
	 * Helper functions for managing events -- not part of the public interface.
	 * Props to Dean Edwards' addEvent library for many of the ideas.
	 */
	jQuery.event = {

		global: {},

		add: function( elem, types, handler, data, selector ) {

			var handleObjIn, eventHandle, tmp,
				events, t, handleObj,
				special, handlers, type, namespaces, origType,
				elemData = dataPriv.get( elem );

			// Don't attach events to noData or text/comment nodes (but allow plain objects)
			if ( !elemData ) {
				return;
			}

			// Caller can pass in an object of custom data in lieu of the handler
			if ( handler.handler ) {
				handleObjIn = handler;
				handler = handleObjIn.handler;
				selector = handleObjIn.selector;
			}

			// Make sure that the handler has a unique ID, used to find/remove it later
			if ( !handler.guid ) {
				handler.guid = jQuery.guid++;
			}

			// Init the element's event structure and main handler, if this is the first
			if ( !( events = elemData.events ) ) {
				events = elemData.events = {};
			}
			if ( !( eventHandle = elemData.handle ) ) {
				eventHandle = elemData.handle = function( e ) {

					// Discard the second event of a jQuery.event.trigger() and
					// when an event is called after a page has unloaded
					return typeof jQuery !== "undefined" && jQuery.event.triggered !== e.type ?
						jQuery.event.dispatch.apply( elem, arguments ) : undefined;
				};
			}

			// Handle multiple events separated by a space
			types = ( types || "" ).match( rnotwhite ) || [ "" ];
			t = types.length;
			while ( t-- ) {
				tmp = rtypenamespace.exec( types[ t ] ) || [];
				type = origType = tmp[ 1 ];
				namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

				// There *must* be a type, no attaching namespace-only handlers
				if ( !type ) {
					continue;
				}

				// If event changes its type, use the special event handlers for the changed type
				special = jQuery.event.special[ type ] || {};

				// If selector defined, determine special event api type, otherwise given type
				type = ( selector ? special.delegateType : special.bindType ) || type;

				// Update special based on newly reset type
				special = jQuery.event.special[ type ] || {};

				// handleObj is passed to all event handlers
				handleObj = jQuery.extend( {
					type: type,
					origType: origType,
					data: data,
					handler: handler,
					guid: handler.guid,
					selector: selector,
					needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
					namespace: namespaces.join( "." )
				}, handleObjIn );

				// Init the event handler queue if we're the first
				if ( !( handlers = events[ type ] ) ) {
					handlers = events[ type ] = [];
					handlers.delegateCount = 0;

					// Only use addEventListener if the special events handler returns false
					if ( !special.setup ||
						special.setup.call( elem, data, namespaces, eventHandle ) === false ) {

						if ( elem.addEventListener ) {
							elem.addEventListener( type, eventHandle );
						}
					}
				}

				if ( special.add ) {
					special.add.call( elem, handleObj );

					if ( !handleObj.handler.guid ) {
						handleObj.handler.guid = handler.guid;
					}
				}

				// Add to the element's handler list, delegates in front
				if ( selector ) {
					handlers.splice( handlers.delegateCount++, 0, handleObj );
				} else {
					handlers.push( handleObj );
				}

				// Keep track of which events have ever been used, for event optimization
				jQuery.event.global[ type ] = true;
			}

		},

		// Detach an event or set of events from an element
		remove: function( elem, types, handler, selector, mappedTypes ) {

			var j, origCount, tmp,
				events, t, handleObj,
				special, handlers, type, namespaces, origType,
				elemData = dataPriv.hasData( elem ) && dataPriv.get( elem );

			if ( !elemData || !( events = elemData.events ) ) {
				return;
			}

			// Once for each type.namespace in types; type may be omitted
			types = ( types || "" ).match( rnotwhite ) || [ "" ];
			t = types.length;
			while ( t-- ) {
				tmp = rtypenamespace.exec( types[ t ] ) || [];
				type = origType = tmp[ 1 ];
				namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

				// Unbind all events (on this namespace, if provided) for the element
				if ( !type ) {
					for ( type in events ) {
						jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
					}
					continue;
				}

				special = jQuery.event.special[ type ] || {};
				type = ( selector ? special.delegateType : special.bindType ) || type;
				handlers = events[ type ] || [];
				tmp = tmp[ 2 ] &&
					new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" );

				// Remove matching events
				origCount = j = handlers.length;
				while ( j-- ) {
					handleObj = handlers[ j ];

					if ( ( mappedTypes || origType === handleObj.origType ) &&
						( !handler || handler.guid === handleObj.guid ) &&
						( !tmp || tmp.test( handleObj.namespace ) ) &&
						( !selector || selector === handleObj.selector ||
							selector === "**" && handleObj.selector ) ) {
						handlers.splice( j, 1 );

						if ( handleObj.selector ) {
							handlers.delegateCount--;
						}
						if ( special.remove ) {
							special.remove.call( elem, handleObj );
						}
					}
				}

				// Remove generic event handler if we removed something and no more handlers exist
				// (avoids potential for endless recursion during removal of special event handlers)
				if ( origCount && !handlers.length ) {
					if ( !special.teardown ||
						special.teardown.call( elem, namespaces, elemData.handle ) === false ) {

						jQuery.removeEvent( elem, type, elemData.handle );
					}

					delete events[ type ];
				}
			}

			// Remove data and the expando if it's no longer used
			if ( jQuery.isEmptyObject( events ) ) {
				dataPriv.remove( elem, "handle events" );
			}
		},

		dispatch: function( event ) {

			// Make a writable jQuery.Event from the native event object
			event = jQuery.event.fix( event );

			var i, j, ret, matched, handleObj,
				handlerQueue = [],
				args = slice.call( arguments ),
				handlers = ( dataPriv.get( this, "events" ) || {} )[ event.type ] || [],
				special = jQuery.event.special[ event.type ] || {};

			// Use the fix-ed jQuery.Event rather than the (read-only) native event
			args[ 0 ] = event;
			event.delegateTarget = this;

			// Call the preDispatch hook for the mapped type, and let it bail if desired
			if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
				return;
			}

			// Determine handlers
			handlerQueue = jQuery.event.handlers.call( this, event, handlers );

			// Run delegates first; they may want to stop propagation beneath us
			i = 0;
			while ( ( matched = handlerQueue[ i++ ] ) && !event.isPropagationStopped() ) {
				event.currentTarget = matched.elem;

				j = 0;
				while ( ( handleObj = matched.handlers[ j++ ] ) &&
					!event.isImmediatePropagationStopped() ) {

					// Triggered event must either 1) have no namespace, or 2) have namespace(s)
					// a subset or equal to those in the bound event (both can have no namespace).
					if ( !event.rnamespace || event.rnamespace.test( handleObj.namespace ) ) {

						event.handleObj = handleObj;
						event.data = handleObj.data;

						ret = ( ( jQuery.event.special[ handleObj.origType ] || {} ).handle ||
							handleObj.handler ).apply( matched.elem, args );

						if ( ret !== undefined ) {
							if ( ( event.result = ret ) === false ) {
								event.preventDefault();
								event.stopPropagation();
							}
						}
					}
				}
			}

			// Call the postDispatch hook for the mapped type
			if ( special.postDispatch ) {
				special.postDispatch.call( this, event );
			}

			return event.result;
		},

		handlers: function( event, handlers ) {
			var i, matches, sel, handleObj,
				handlerQueue = [],
				delegateCount = handlers.delegateCount,
				cur = event.target;

			// Support (at least): Chrome, IE9
			// Find delegate handlers
			// Black-hole SVG <use> instance trees (#13180)
			//
			// Support: Firefox<=42+
			// Avoid non-left-click in FF but don't block IE radio events (#3861, gh-2343)
			if ( delegateCount && cur.nodeType &&
				( event.type !== "click" || isNaN( event.button ) || event.button < 1 ) ) {

				for ( ; cur !== this; cur = cur.parentNode || this ) {

					// Don't check non-elements (#13208)
					// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
					if ( cur.nodeType === 1 && ( cur.disabled !== true || event.type !== "click" ) ) {
						matches = [];
						for ( i = 0; i < delegateCount; i++ ) {
							handleObj = handlers[ i ];

							// Don't conflict with Object.prototype properties (#13203)
							sel = handleObj.selector + " ";

							if ( matches[ sel ] === undefined ) {
								matches[ sel ] = handleObj.needsContext ?
									jQuery( sel, this ).index( cur ) > -1 :
									jQuery.find( sel, this, null, [ cur ] ).length;
							}
							if ( matches[ sel ] ) {
								matches.push( handleObj );
							}
						}
						if ( matches.length ) {
							handlerQueue.push( { elem: cur, handlers: matches } );
						}
					}
				}
			}

			// Add the remaining (directly-bound) handlers
			if ( delegateCount < handlers.length ) {
				handlerQueue.push( { elem: this, handlers: handlers.slice( delegateCount ) } );
			}

			return handlerQueue;
		},

		// Includes some event props shared by KeyEvent and MouseEvent
		props: ( "altKey bubbles cancelable ctrlKey currentTarget detail eventPhase " +
			"metaKey relatedTarget shiftKey target timeStamp view which" ).split( " " ),

		fixHooks: {},

		keyHooks: {
			props: "char charCode key keyCode".split( " " ),
			filter: function( event, original ) {

				// Add which for key events
				if ( event.which == null ) {
					event.which = original.charCode != null ? original.charCode : original.keyCode;
				}

				return event;
			}
		},

		mouseHooks: {
			props: ( "button buttons clientX clientY offsetX offsetY pageX pageY " +
				"screenX screenY toElement" ).split( " " ),
			filter: function( event, original ) {
				var eventDoc, doc, body,
					button = original.button;

				// Calculate pageX/Y if missing and clientX/Y available
				if ( event.pageX == null && original.clientX != null ) {
					eventDoc = event.target.ownerDocument || document;
					doc = eventDoc.documentElement;
					body = eventDoc.body;

					event.pageX = original.clientX +
						( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) -
						( doc && doc.clientLeft || body && body.clientLeft || 0 );
					event.pageY = original.clientY +
						( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) -
						( doc && doc.clientTop  || body && body.clientTop  || 0 );
				}

				// Add which for click: 1 === left; 2 === middle; 3 === right
				// Note: button is not normalized, so don't use it
				if ( !event.which && button !== undefined ) {
					event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
				}

				return event;
			}
		},

		fix: function( event ) {
			if ( event[ jQuery.expando ] ) {
				return event;
			}

			// Create a writable copy of the event object and normalize some properties
			var i, prop, copy,
				type = event.type,
				originalEvent = event,
				fixHook = this.fixHooks[ type ];

			if ( !fixHook ) {
				this.fixHooks[ type ] = fixHook =
					rmouseEvent.test( type ) ? this.mouseHooks :
					rkeyEvent.test( type ) ? this.keyHooks :
					{};
			}
			copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;

			event = new jQuery.Event( originalEvent );

			i = copy.length;
			while ( i-- ) {
				prop = copy[ i ];
				event[ prop ] = originalEvent[ prop ];
			}

			// Support: Cordova 2.5 (WebKit) (#13255)
			// All events should have a target; Cordova deviceready doesn't
			if ( !event.target ) {
				event.target = document;
			}

			// Support: Safari 6.0+, Chrome<28
			// Target should not be a text node (#504, #13143)
			if ( event.target.nodeType === 3 ) {
				event.target = event.target.parentNode;
			}

			return fixHook.filter ? fixHook.filter( event, originalEvent ) : event;
		},

		special: {
			load: {

				// Prevent triggered image.load events from bubbling to window.load
				noBubble: true
			},
			focus: {

				// Fire native event if possible so blur/focus sequence is correct
				trigger: function() {
					if ( this !== safeActiveElement() && this.focus ) {
						this.focus();
						return false;
					}
				},
				delegateType: "focusin"
			},
			blur: {
				trigger: function() {
					if ( this === safeActiveElement() && this.blur ) {
						this.blur();
						return false;
					}
				},
				delegateType: "focusout"
			},
			click: {

				// For checkbox, fire native event so checked state will be right
				trigger: function() {
					if ( this.type === "checkbox" && this.click && jQuery.nodeName( this, "input" ) ) {
						this.click();
						return false;
					}
				},

				// For cross-browser consistency, don't fire native .click() on links
				_default: function( event ) {
					return jQuery.nodeName( event.target, "a" );
				}
			},

			beforeunload: {
				postDispatch: function( event ) {

					// Support: Firefox 20+
					// Firefox doesn't alert if the returnValue field is not set.
					if ( event.result !== undefined && event.originalEvent ) {
						event.originalEvent.returnValue = event.result;
					}
				}
			}
		}
	};

	jQuery.removeEvent = function( elem, type, handle ) {

		// This "if" is needed for plain objects
		if ( elem.removeEventListener ) {
			elem.removeEventListener( type, handle );
		}
	};

	jQuery.Event = function( src, props ) {

		// Allow instantiation without the 'new' keyword
		if ( !( this instanceof jQuery.Event ) ) {
			return new jQuery.Event( src, props );
		}

		// Event object
		if ( src && src.type ) {
			this.originalEvent = src;
			this.type = src.type;

			// Events bubbling up the document may have been marked as prevented
			// by a handler lower down the tree; reflect the correct value.
			this.isDefaultPrevented = src.defaultPrevented ||
					src.defaultPrevented === undefined &&

					// Support: Android<4.0
					src.returnValue === false ?
				returnTrue :
				returnFalse;

		// Event type
		} else {
			this.type = src;
		}

		// Put explicitly provided properties onto the event object
		if ( props ) {
			jQuery.extend( this, props );
		}

		// Create a timestamp if incoming event doesn't have one
		this.timeStamp = src && src.timeStamp || jQuery.now();

		// Mark it as fixed
		this[ jQuery.expando ] = true;
	};

	// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
	// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
	jQuery.Event.prototype = {
		constructor: jQuery.Event,
		isDefaultPrevented: returnFalse,
		isPropagationStopped: returnFalse,
		isImmediatePropagationStopped: returnFalse,

		preventDefault: function() {
			var e = this.originalEvent;

			this.isDefaultPrevented = returnTrue;

			if ( e ) {
				e.preventDefault();
			}
		},
		stopPropagation: function() {
			var e = this.originalEvent;

			this.isPropagationStopped = returnTrue;

			if ( e ) {
				e.stopPropagation();
			}
		},
		stopImmediatePropagation: function() {
			var e = this.originalEvent;

			this.isImmediatePropagationStopped = returnTrue;

			if ( e ) {
				e.stopImmediatePropagation();
			}

			this.stopPropagation();
		}
	};

	// Create mouseenter/leave events using mouseover/out and event-time checks
	// so that event delegation works in jQuery.
	// Do the same for pointerenter/pointerleave and pointerover/pointerout
	//
	// Support: Safari 7 only
	// Safari sends mouseenter too often; see:
	// https://code.google.com/p/chromium/issues/detail?id=470258
	// for the description of the bug (it existed in older Chrome versions as well).
	jQuery.each( {
		mouseenter: "mouseover",
		mouseleave: "mouseout",
		pointerenter: "pointerover",
		pointerleave: "pointerout"
	}, function( orig, fix ) {
		jQuery.event.special[ orig ] = {
			delegateType: fix,
			bindType: fix,

			handle: function( event ) {
				var ret,
					target = this,
					related = event.relatedTarget,
					handleObj = event.handleObj;

				// For mouseenter/leave call the handler if related is outside the target.
				// NB: No relatedTarget if the mouse left/entered the browser window
				if ( !related || ( related !== target && !jQuery.contains( target, related ) ) ) {
					event.type = handleObj.origType;
					ret = handleObj.handler.apply( this, arguments );
					event.type = fix;
				}
				return ret;
			}
		};
	} );

	jQuery.fn.extend( {
		on: function( types, selector, data, fn ) {
			return on( this, types, selector, data, fn );
		},
		one: function( types, selector, data, fn ) {
			return on( this, types, selector, data, fn, 1 );
		},
		off: function( types, selector, fn ) {
			var handleObj, type;
			if ( types && types.preventDefault && types.handleObj ) {

				// ( event )  dispatched jQuery.Event
				handleObj = types.handleObj;
				jQuery( types.delegateTarget ).off(
					handleObj.namespace ?
						handleObj.origType + "." + handleObj.namespace :
						handleObj.origType,
					handleObj.selector,
					handleObj.handler
				);
				return this;
			}
			if ( typeof types === "object" ) {

				// ( types-object [, selector] )
				for ( type in types ) {
					this.off( type, selector, types[ type ] );
				}
				return this;
			}
			if ( selector === false || typeof selector === "function" ) {

				// ( types [, fn] )
				fn = selector;
				selector = undefined;
			}
			if ( fn === false ) {
				fn = returnFalse;
			}
			return this.each( function() {
				jQuery.event.remove( this, types, fn, selector );
			} );
		}
	} );


	var
		rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:-]+)[^>]*)\/>/gi,

		// Support: IE 10-11, Edge 10240+
		// In IE/Edge using regex groups here causes severe slowdowns.
		// See https://connect.microsoft.com/IE/feedback/details/1736512/
		rnoInnerhtml = /<script|<style|<link/i,

		// checked="checked" or checked
		rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
		rscriptTypeMasked = /^true\/(.*)/,
		rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;

	// Manipulating tables requires a tbody
	function manipulationTarget( elem, content ) {
		return jQuery.nodeName( elem, "table" ) &&
			jQuery.nodeName( content.nodeType !== 11 ? content : content.firstChild, "tr" ) ?

			elem.getElementsByTagName( "tbody" )[ 0 ] ||
				elem.appendChild( elem.ownerDocument.createElement( "tbody" ) ) :
			elem;
	}

	// Replace/restore the type attribute of script elements for safe DOM manipulation
	function disableScript( elem ) {
		elem.type = ( elem.getAttribute( "type" ) !== null ) + "/" + elem.type;
		return elem;
	}
	function restoreScript( elem ) {
		var match = rscriptTypeMasked.exec( elem.type );

		if ( match ) {
			elem.type = match[ 1 ];
		} else {
			elem.removeAttribute( "type" );
		}

		return elem;
	}

	function cloneCopyEvent( src, dest ) {
		var i, l, type, pdataOld, pdataCur, udataOld, udataCur, events;

		if ( dest.nodeType !== 1 ) {
			return;
		}

		// 1. Copy private data: events, handlers, etc.
		if ( dataPriv.hasData( src ) ) {
			pdataOld = dataPriv.access( src );
			pdataCur = dataPriv.set( dest, pdataOld );
			events = pdataOld.events;

			if ( events ) {
				delete pdataCur.handle;
				pdataCur.events = {};

				for ( type in events ) {
					for ( i = 0, l = events[ type ].length; i < l; i++ ) {
						jQuery.event.add( dest, type, events[ type ][ i ] );
					}
				}
			}
		}

		// 2. Copy user data
		if ( dataUser.hasData( src ) ) {
			udataOld = dataUser.access( src );
			udataCur = jQuery.extend( {}, udataOld );

			dataUser.set( dest, udataCur );
		}
	}

	// Fix IE bugs, see support tests
	function fixInput( src, dest ) {
		var nodeName = dest.nodeName.toLowerCase();

		// Fails to persist the checked state of a cloned checkbox or radio button.
		if ( nodeName === "input" && rcheckableType.test( src.type ) ) {
			dest.checked = src.checked;

		// Fails to return the selected option to the default selected state when cloning options
		} else if ( nodeName === "input" || nodeName === "textarea" ) {
			dest.defaultValue = src.defaultValue;
		}
	}

	function domManip( collection, args, callback, ignored ) {

		// Flatten any nested arrays
		args = concat.apply( [], args );

		var fragment, first, scripts, hasScripts, node, doc,
			i = 0,
			l = collection.length,
			iNoClone = l - 1,
			value = args[ 0 ],
			isFunction = jQuery.isFunction( value );

		// We can't cloneNode fragments that contain checked, in WebKit
		if ( isFunction ||
				( l > 1 && typeof value === "string" &&
					!support.checkClone && rchecked.test( value ) ) ) {
			return collection.each( function( index ) {
				var self = collection.eq( index );
				if ( isFunction ) {
					args[ 0 ] = value.call( this, index, self.html() );
				}
				domManip( self, args, callback, ignored );
			} );
		}

		if ( l ) {
			fragment = buildFragment( args, collection[ 0 ].ownerDocument, false, collection, ignored );
			first = fragment.firstChild;

			if ( fragment.childNodes.length === 1 ) {
				fragment = first;
			}

			// Require either new content or an interest in ignored elements to invoke the callback
			if ( first || ignored ) {
				scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
				hasScripts = scripts.length;

				// Use the original fragment for the last item
				// instead of the first because it can end up
				// being emptied incorrectly in certain situations (#8070).
				for ( ; i < l; i++ ) {
					node = fragment;

					if ( i !== iNoClone ) {
						node = jQuery.clone( node, true, true );

						// Keep references to cloned scripts for later restoration
						if ( hasScripts ) {

							// Support: Android<4.1, PhantomJS<2
							// push.apply(_, arraylike) throws on ancient WebKit
							jQuery.merge( scripts, getAll( node, "script" ) );
						}
					}

					callback.call( collection[ i ], node, i );
				}

				if ( hasScripts ) {
					doc = scripts[ scripts.length - 1 ].ownerDocument;

					// Reenable scripts
					jQuery.map( scripts, restoreScript );

					// Evaluate executable scripts on first document insertion
					for ( i = 0; i < hasScripts; i++ ) {
						node = scripts[ i ];
						if ( rscriptType.test( node.type || "" ) &&
							!dataPriv.access( node, "globalEval" ) &&
							jQuery.contains( doc, node ) ) {

							if ( node.src ) {

								// Optional AJAX dependency, but won't run scripts if not present
								if ( jQuery._evalUrl ) {
									jQuery._evalUrl( node.src );
								}
							} else {
								jQuery.globalEval( node.textContent.replace( rcleanScript, "" ) );
							}
						}
					}
				}
			}
		}

		return collection;
	}

	function remove( elem, selector, keepData ) {
		var node,
			nodes = selector ? jQuery.filter( selector, elem ) : elem,
			i = 0;

		for ( ; ( node = nodes[ i ] ) != null; i++ ) {
			if ( !keepData && node.nodeType === 1 ) {
				jQuery.cleanData( getAll( node ) );
			}

			if ( node.parentNode ) {
				if ( keepData && jQuery.contains( node.ownerDocument, node ) ) {
					setGlobalEval( getAll( node, "script" ) );
				}
				node.parentNode.removeChild( node );
			}
		}

		return elem;
	}

	jQuery.extend( {
		htmlPrefilter: function( html ) {
			return html.replace( rxhtmlTag, "<$1></$2>" );
		},

		clone: function( elem, dataAndEvents, deepDataAndEvents ) {
			var i, l, srcElements, destElements,
				clone = elem.cloneNode( true ),
				inPage = jQuery.contains( elem.ownerDocument, elem );

			// Fix IE cloning issues
			if ( !support.noCloneChecked && ( elem.nodeType === 1 || elem.nodeType === 11 ) &&
					!jQuery.isXMLDoc( elem ) ) {

				// We eschew Sizzle here for performance reasons: http://jsperf.com/getall-vs-sizzle/2
				destElements = getAll( clone );
				srcElements = getAll( elem );

				for ( i = 0, l = srcElements.length; i < l; i++ ) {
					fixInput( srcElements[ i ], destElements[ i ] );
				}
			}

			// Copy the events from the original to the clone
			if ( dataAndEvents ) {
				if ( deepDataAndEvents ) {
					srcElements = srcElements || getAll( elem );
					destElements = destElements || getAll( clone );

					for ( i = 0, l = srcElements.length; i < l; i++ ) {
						cloneCopyEvent( srcElements[ i ], destElements[ i ] );
					}
				} else {
					cloneCopyEvent( elem, clone );
				}
			}

			// Preserve script evaluation history
			destElements = getAll( clone, "script" );
			if ( destElements.length > 0 ) {
				setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
			}

			// Return the cloned set
			return clone;
		},

		cleanData: function( elems ) {
			var data, elem, type,
				special = jQuery.event.special,
				i = 0;

			for ( ; ( elem = elems[ i ] ) !== undefined; i++ ) {
				if ( acceptData( elem ) ) {
					if ( ( data = elem[ dataPriv.expando ] ) ) {
						if ( data.events ) {
							for ( type in data.events ) {
								if ( special[ type ] ) {
									jQuery.event.remove( elem, type );

								// This is a shortcut to avoid jQuery.event.remove's overhead
								} else {
									jQuery.removeEvent( elem, type, data.handle );
								}
							}
						}

						// Support: Chrome <= 35-45+
						// Assign undefined instead of using delete, see Data#remove
						elem[ dataPriv.expando ] = undefined;
					}
					if ( elem[ dataUser.expando ] ) {

						// Support: Chrome <= 35-45+
						// Assign undefined instead of using delete, see Data#remove
						elem[ dataUser.expando ] = undefined;
					}
				}
			}
		}
	} );

	jQuery.fn.extend( {

		// Keep domManip exposed until 3.0 (gh-2225)
		domManip: domManip,

		detach: function( selector ) {
			return remove( this, selector, true );
		},

		remove: function( selector ) {
			return remove( this, selector );
		},

		text: function( value ) {
			return access( this, function( value ) {
				return value === undefined ?
					jQuery.text( this ) :
					this.empty().each( function() {
						if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
							this.textContent = value;
						}
					} );
			}, null, value, arguments.length );
		},

		append: function() {
			return domManip( this, arguments, function( elem ) {
				if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
					var target = manipulationTarget( this, elem );
					target.appendChild( elem );
				}
			} );
		},

		prepend: function() {
			return domManip( this, arguments, function( elem ) {
				if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
					var target = manipulationTarget( this, elem );
					target.insertBefore( elem, target.firstChild );
				}
			} );
		},

		before: function() {
			return domManip( this, arguments, function( elem ) {
				if ( this.parentNode ) {
					this.parentNode.insertBefore( elem, this );
				}
			} );
		},

		after: function() {
			return domManip( this, arguments, function( elem ) {
				if ( this.parentNode ) {
					this.parentNode.insertBefore( elem, this.nextSibling );
				}
			} );
		},

		empty: function() {
			var elem,
				i = 0;

			for ( ; ( elem = this[ i ] ) != null; i++ ) {
				if ( elem.nodeType === 1 ) {

					// Prevent memory leaks
					jQuery.cleanData( getAll( elem, false ) );

					// Remove any remaining nodes
					elem.textContent = "";
				}
			}

			return this;
		},

		clone: function( dataAndEvents, deepDataAndEvents ) {
			dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
			deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

			return this.map( function() {
				return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
			} );
		},

		html: function( value ) {
			return access( this, function( value ) {
				var elem = this[ 0 ] || {},
					i = 0,
					l = this.length;

				if ( value === undefined && elem.nodeType === 1 ) {
					return elem.innerHTML;
				}

				// See if we can take a shortcut and just use innerHTML
				if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
					!wrapMap[ ( rtagName.exec( value ) || [ "", "" ] )[ 1 ].toLowerCase() ] ) {

					value = jQuery.htmlPrefilter( value );

					try {
						for ( ; i < l; i++ ) {
							elem = this[ i ] || {};

							// Remove element nodes and prevent memory leaks
							if ( elem.nodeType === 1 ) {
								jQuery.cleanData( getAll( elem, false ) );
								elem.innerHTML = value;
							}
						}

						elem = 0;

					// If using innerHTML throws an exception, use the fallback method
					} catch ( e ) {}
				}

				if ( elem ) {
					this.empty().append( value );
				}
			}, null, value, arguments.length );
		},

		replaceWith: function() {
			var ignored = [];

			// Make the changes, replacing each non-ignored context element with the new content
			return domManip( this, arguments, function( elem ) {
				var parent = this.parentNode;

				if ( jQuery.inArray( this, ignored ) < 0 ) {
					jQuery.cleanData( getAll( this ) );
					if ( parent ) {
						parent.replaceChild( elem, this );
					}
				}

			// Force callback invocation
			}, ignored );
		}
	} );

	jQuery.each( {
		appendTo: "append",
		prependTo: "prepend",
		insertBefore: "before",
		insertAfter: "after",
		replaceAll: "replaceWith"
	}, function( name, original ) {
		jQuery.fn[ name ] = function( selector ) {
			var elems,
				ret = [],
				insert = jQuery( selector ),
				last = insert.length - 1,
				i = 0;

			for ( ; i <= last; i++ ) {
				elems = i === last ? this : this.clone( true );
				jQuery( insert[ i ] )[ original ]( elems );

				// Support: QtWebKit
				// .get() because push.apply(_, arraylike) throws
				push.apply( ret, elems.get() );
			}

			return this.pushStack( ret );
		};
	} );


	var iframe,
		elemdisplay = {

			// Support: Firefox
			// We have to pre-define these values for FF (#10227)
			HTML: "block",
			BODY: "block"
		};

	/**
	 * Retrieve the actual display of a element
	 * @param {String} name nodeName of the element
	 * @param {Object} doc Document object
	 */

	// Called only from within defaultDisplay
	function actualDisplay( name, doc ) {
		var elem = jQuery( doc.createElement( name ) ).appendTo( doc.body ),

			display = jQuery.css( elem[ 0 ], "display" );

		// We don't have any data stored on the element,
		// so use "detach" method as fast way to get rid of the element
		elem.detach();

		return display;
	}

	/**
	 * Try to determine the default display value of an element
	 * @param {String} nodeName
	 */
	function defaultDisplay( nodeName ) {
		var doc = document,
			display = elemdisplay[ nodeName ];

		if ( !display ) {
			display = actualDisplay( nodeName, doc );

			// If the simple way fails, read from inside an iframe
			if ( display === "none" || !display ) {

				// Use the already-created iframe if possible
				iframe = ( iframe || jQuery( "<iframe frameborder='0' width='0' height='0'/>" ) )
					.appendTo( doc.documentElement );

				// Always write a new HTML skeleton so Webkit and Firefox don't choke on reuse
				doc = iframe[ 0 ].contentDocument;

				// Support: IE
				doc.write();
				doc.close();

				display = actualDisplay( nodeName, doc );
				iframe.detach();
			}

			// Store the correct default display
			elemdisplay[ nodeName ] = display;
		}

		return display;
	}
	var rmargin = ( /^margin/ );

	var rnumnonpx = new RegExp( "^(" + pnum + ")(?!px)[a-z%]+$", "i" );

	var getStyles = function( elem ) {

			// Support: IE<=11+, Firefox<=30+ (#15098, #14150)
			// IE throws on elements created in popups
			// FF meanwhile throws on frame elements through "defaultView.getComputedStyle"
			var view = elem.ownerDocument.defaultView;

			if ( !view || !view.opener ) {
				view = window;
			}

			return view.getComputedStyle( elem );
		};

	var swap = function( elem, options, callback, args ) {
		var ret, name,
			old = {};

		// Remember the old values, and insert the new ones
		for ( name in options ) {
			old[ name ] = elem.style[ name ];
			elem.style[ name ] = options[ name ];
		}

		ret = callback.apply( elem, args || [] );

		// Revert the old values
		for ( name in options ) {
			elem.style[ name ] = old[ name ];
		}

		return ret;
	};


	var documentElement = document.documentElement;



	( function() {
		var pixelPositionVal, boxSizingReliableVal, pixelMarginRightVal, reliableMarginLeftVal,
			container = document.createElement( "div" ),
			div = document.createElement( "div" );

		// Finish early in limited (non-browser) environments
		if ( !div.style ) {
			return;
		}

		// Support: IE9-11+
		// Style of cloned element affects source element cloned (#8908)
		div.style.backgroundClip = "content-box";
		div.cloneNode( true ).style.backgroundClip = "";
		support.clearCloneStyle = div.style.backgroundClip === "content-box";

		container.style.cssText = "border:0;width:8px;height:0;top:0;left:-9999px;" +
			"padding:0;margin-top:1px;position:absolute";
		container.appendChild( div );

		// Executing both pixelPosition & boxSizingReliable tests require only one layout
		// so they're executed at the same time to save the second computation.
		function computeStyleTests() {
			div.style.cssText =

				// Support: Firefox<29, Android 2.3
				// Vendor-prefix box-sizing
				"-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;" +
				"position:relative;display:block;" +
				"margin:auto;border:1px;padding:1px;" +
				"top:1%;width:50%";
			div.innerHTML = "";
			documentElement.appendChild( container );

			var divStyle = window.getComputedStyle( div );
			pixelPositionVal = divStyle.top !== "1%";
			reliableMarginLeftVal = divStyle.marginLeft === "2px";
			boxSizingReliableVal = divStyle.width === "4px";

			// Support: Android 4.0 - 4.3 only
			// Some styles come back with percentage values, even though they shouldn't
			div.style.marginRight = "50%";
			pixelMarginRightVal = divStyle.marginRight === "4px";

			documentElement.removeChild( container );
		}

		jQuery.extend( support, {
			pixelPosition: function() {

				// This test is executed only once but we still do memoizing
				// since we can use the boxSizingReliable pre-computing.
				// No need to check if the test was already performed, though.
				computeStyleTests();
				return pixelPositionVal;
			},
			boxSizingReliable: function() {
				if ( boxSizingReliableVal == null ) {
					computeStyleTests();
				}
				return boxSizingReliableVal;
			},
			pixelMarginRight: function() {

				// Support: Android 4.0-4.3
				// We're checking for boxSizingReliableVal here instead of pixelMarginRightVal
				// since that compresses better and they're computed together anyway.
				if ( boxSizingReliableVal == null ) {
					computeStyleTests();
				}
				return pixelMarginRightVal;
			},
			reliableMarginLeft: function() {

				// Support: IE <=8 only, Android 4.0 - 4.3 only, Firefox <=3 - 37
				if ( boxSizingReliableVal == null ) {
					computeStyleTests();
				}
				return reliableMarginLeftVal;
			},
			reliableMarginRight: function() {

				// Support: Android 2.3
				// Check if div with explicit width and no margin-right incorrectly
				// gets computed margin-right based on width of container. (#3333)
				// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
				// This support function is only executed once so no memoizing is needed.
				var ret,
					marginDiv = div.appendChild( document.createElement( "div" ) );

				// Reset CSS: box-sizing; display; margin; border; padding
				marginDiv.style.cssText = div.style.cssText =

					// Support: Android 2.3
					// Vendor-prefix box-sizing
					"-webkit-box-sizing:content-box;box-sizing:content-box;" +
					"display:block;margin:0;border:0;padding:0";
				marginDiv.style.marginRight = marginDiv.style.width = "0";
				div.style.width = "1px";
				documentElement.appendChild( container );

				ret = !parseFloat( window.getComputedStyle( marginDiv ).marginRight );

				documentElement.removeChild( container );
				div.removeChild( marginDiv );

				return ret;
			}
		} );
	} )();


	function curCSS( elem, name, computed ) {
		var width, minWidth, maxWidth, ret,
			style = elem.style;

		computed = computed || getStyles( elem );
		ret = computed ? computed.getPropertyValue( name ) || computed[ name ] : undefined;

		// Support: Opera 12.1x only
		// Fall back to style even without computed
		// computed is undefined for elems on document fragments
		if ( ( ret === "" || ret === undefined ) && !jQuery.contains( elem.ownerDocument, elem ) ) {
			ret = jQuery.style( elem, name );
		}

		// Support: IE9
		// getPropertyValue is only needed for .css('filter') (#12537)
		if ( computed ) {

			// A tribute to the "awesome hack by Dean Edwards"
			// Android Browser returns percentage for some values,
			// but width seems to be reliably pixels.
			// This is against the CSSOM draft spec:
			// http://dev.w3.org/csswg/cssom/#resolved-values
			if ( !support.pixelMarginRight() && rnumnonpx.test( ret ) && rmargin.test( name ) ) {

				// Remember the original values
				width = style.width;
				minWidth = style.minWidth;
				maxWidth = style.maxWidth;

				// Put in the new values to get a computed value out
				style.minWidth = style.maxWidth = style.width = ret;
				ret = computed.width;

				// Revert the changed values
				style.width = width;
				style.minWidth = minWidth;
				style.maxWidth = maxWidth;
			}
		}

		return ret !== undefined ?

			// Support: IE9-11+
			// IE returns zIndex value as an integer.
			ret + "" :
			ret;
	}


	function addGetHookIf( conditionFn, hookFn ) {

		// Define the hook, we'll check on the first run if it's really needed.
		return {
			get: function() {
				if ( conditionFn() ) {

					// Hook not needed (or it's not possible to use it due
					// to missing dependency), remove it.
					delete this.get;
					return;
				}

				// Hook needed; redefine it so that the support test is not executed again.
				return ( this.get = hookFn ).apply( this, arguments );
			}
		};
	}


	var

		// Swappable if display is none or starts with table
		// except "table", "table-cell", or "table-caption"
		// See here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
		rdisplayswap = /^(none|table(?!-c[ea]).+)/,

		cssShow = { position: "absolute", visibility: "hidden", display: "block" },
		cssNormalTransform = {
			letterSpacing: "0",
			fontWeight: "400"
		},

		cssPrefixes = [ "Webkit", "O", "Moz", "ms" ],
		emptyStyle = document.createElement( "div" ).style;

	// Return a css property mapped to a potentially vendor prefixed property
	function vendorPropName( name ) {

		// Shortcut for names that are not vendor prefixed
		if ( name in emptyStyle ) {
			return name;
		}

		// Check for vendor prefixed names
		var capName = name[ 0 ].toUpperCase() + name.slice( 1 ),
			i = cssPrefixes.length;

		while ( i-- ) {
			name = cssPrefixes[ i ] + capName;
			if ( name in emptyStyle ) {
				return name;
			}
		}
	}

	function setPositiveNumber( elem, value, subtract ) {

		// Any relative (+/-) values have already been
		// normalized at this point
		var matches = rcssNum.exec( value );
		return matches ?

			// Guard against undefined "subtract", e.g., when used as in cssHooks
			Math.max( 0, matches[ 2 ] - ( subtract || 0 ) ) + ( matches[ 3 ] || "px" ) :
			value;
	}

	function augmentWidthOrHeight( elem, name, extra, isBorderBox, styles ) {
		var i = extra === ( isBorderBox ? "border" : "content" ) ?

			// If we already have the right measurement, avoid augmentation
			4 :

			// Otherwise initialize for horizontal or vertical properties
			name === "width" ? 1 : 0,

			val = 0;

		for ( ; i < 4; i += 2 ) {

			// Both box models exclude margin, so add it if we want it
			if ( extra === "margin" ) {
				val += jQuery.css( elem, extra + cssExpand[ i ], true, styles );
			}

			if ( isBorderBox ) {

				// border-box includes padding, so remove it if we want content
				if ( extra === "content" ) {
					val -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
				}

				// At this point, extra isn't border nor margin, so remove border
				if ( extra !== "margin" ) {
					val -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
				}
			} else {

				// At this point, extra isn't content, so add padding
				val += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

				// At this point, extra isn't content nor padding, so add border
				if ( extra !== "padding" ) {
					val += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
				}
			}
		}

		return val;
	}

	function getWidthOrHeight( elem, name, extra ) {

		// Start with offset property, which is equivalent to the border-box value
		var valueIsBorderBox = true,
			val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
			styles = getStyles( elem ),
			isBorderBox = jQuery.css( elem, "boxSizing", false, styles ) === "border-box";

		// Support: IE11 only
		// In IE 11 fullscreen elements inside of an iframe have
		// 100x too small dimensions (gh-1764).
		if ( document.msFullscreenElement && window.top !== window ) {

			// Support: IE11 only
			// Running getBoundingClientRect on a disconnected node
			// in IE throws an error.
			if ( elem.getClientRects().length ) {
				val = Math.round( elem.getBoundingClientRect()[ name ] * 100 );
			}
		}

		// Some non-html elements return undefined for offsetWidth, so check for null/undefined
		// svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
		// MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
		if ( val <= 0 || val == null ) {

			// Fall back to computed then uncomputed css if necessary
			val = curCSS( elem, name, styles );
			if ( val < 0 || val == null ) {
				val = elem.style[ name ];
			}

			// Computed unit is not pixels. Stop here and return.
			if ( rnumnonpx.test( val ) ) {
				return val;
			}

			// Check for style in case a browser which returns unreliable values
			// for getComputedStyle silently falls back to the reliable elem.style
			valueIsBorderBox = isBorderBox &&
				( support.boxSizingReliable() || val === elem.style[ name ] );

			// Normalize "", auto, and prepare for extra
			val = parseFloat( val ) || 0;
		}

		// Use the active box-sizing model to add/subtract irrelevant styles
		return ( val +
			augmentWidthOrHeight(
				elem,
				name,
				extra || ( isBorderBox ? "border" : "content" ),
				valueIsBorderBox,
				styles
			)
		) + "px";
	}

	function showHide( elements, show ) {
		var display, elem, hidden,
			values = [],
			index = 0,
			length = elements.length;

		for ( ; index < length; index++ ) {
			elem = elements[ index ];
			if ( !elem.style ) {
				continue;
			}

			values[ index ] = dataPriv.get( elem, "olddisplay" );
			display = elem.style.display;
			if ( show ) {

				// Reset the inline display of this element to learn if it is
				// being hidden by cascaded rules or not
				if ( !values[ index ] && display === "none" ) {
					elem.style.display = "";
				}

				// Set elements which have been overridden with display: none
				// in a stylesheet to whatever the default browser style is
				// for such an element
				if ( elem.style.display === "" && isHidden( elem ) ) {
					values[ index ] = dataPriv.access(
						elem,
						"olddisplay",
						defaultDisplay( elem.nodeName )
					);
				}
			} else {
				hidden = isHidden( elem );

				if ( display !== "none" || !hidden ) {
					dataPriv.set(
						elem,
						"olddisplay",
						hidden ? display : jQuery.css( elem, "display" )
					);
				}
			}
		}

		// Set the display of most of the elements in a second loop
		// to avoid the constant reflow
		for ( index = 0; index < length; index++ ) {
			elem = elements[ index ];
			if ( !elem.style ) {
				continue;
			}
			if ( !show || elem.style.display === "none" || elem.style.display === "" ) {
				elem.style.display = show ? values[ index ] || "" : "none";
			}
		}

		return elements;
	}

	jQuery.extend( {

		// Add in style property hooks for overriding the default
		// behavior of getting and setting a style property
		cssHooks: {
			opacity: {
				get: function( elem, computed ) {
					if ( computed ) {

						// We should always get a number back from opacity
						var ret = curCSS( elem, "opacity" );
						return ret === "" ? "1" : ret;
					}
				}
			}
		},

		// Don't automatically add "px" to these possibly-unitless properties
		cssNumber: {
			"animationIterationCount": true,
			"columnCount": true,
			"fillOpacity": true,
			"flexGrow": true,
			"flexShrink": true,
			"fontWeight": true,
			"lineHeight": true,
			"opacity": true,
			"order": true,
			"orphans": true,
			"widows": true,
			"zIndex": true,
			"zoom": true
		},

		// Add in properties whose names you wish to fix before
		// setting or getting the value
		cssProps: {
			"float": "cssFloat"
		},

		// Get and set the style property on a DOM Node
		style: function( elem, name, value, extra ) {

			// Don't set styles on text and comment nodes
			if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
				return;
			}

			// Make sure that we're working with the right name
			var ret, type, hooks,
				origName = jQuery.camelCase( name ),
				style = elem.style;

			name = jQuery.cssProps[ origName ] ||
				( jQuery.cssProps[ origName ] = vendorPropName( origName ) || origName );

			// Gets hook for the prefixed version, then unprefixed version
			hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

			// Check if we're setting a value
			if ( value !== undefined ) {
				type = typeof value;

				// Convert "+=" or "-=" to relative numbers (#7345)
				if ( type === "string" && ( ret = rcssNum.exec( value ) ) && ret[ 1 ] ) {
					value = adjustCSS( elem, name, ret );

					// Fixes bug #9237
					type = "number";
				}

				// Make sure that null and NaN values aren't set (#7116)
				if ( value == null || value !== value ) {
					return;
				}

				// If a number was passed in, add the unit (except for certain CSS properties)
				if ( type === "number" ) {
					value += ret && ret[ 3 ] || ( jQuery.cssNumber[ origName ] ? "" : "px" );
				}

				// Support: IE9-11+
				// background-* props affect original clone's values
				if ( !support.clearCloneStyle && value === "" && name.indexOf( "background" ) === 0 ) {
					style[ name ] = "inherit";
				}

				// If a hook was provided, use that value, otherwise just set the specified value
				if ( !hooks || !( "set" in hooks ) ||
					( value = hooks.set( elem, value, extra ) ) !== undefined ) {

					style[ name ] = value;
				}

			} else {

				// If a hook was provided get the non-computed value from there
				if ( hooks && "get" in hooks &&
					( ret = hooks.get( elem, false, extra ) ) !== undefined ) {

					return ret;
				}

				// Otherwise just get the value from the style object
				return style[ name ];
			}
		},

		css: function( elem, name, extra, styles ) {
			var val, num, hooks,
				origName = jQuery.camelCase( name );

			// Make sure that we're working with the right name
			name = jQuery.cssProps[ origName ] ||
				( jQuery.cssProps[ origName ] = vendorPropName( origName ) || origName );

			// Try prefixed name followed by the unprefixed name
			hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

			// If a hook was provided get the computed value from there
			if ( hooks && "get" in hooks ) {
				val = hooks.get( elem, true, extra );
			}

			// Otherwise, if a way to get the computed value exists, use that
			if ( val === undefined ) {
				val = curCSS( elem, name, styles );
			}

			// Convert "normal" to computed value
			if ( val === "normal" && name in cssNormalTransform ) {
				val = cssNormalTransform[ name ];
			}

			// Make numeric if forced or a qualifier was provided and val looks numeric
			if ( extra === "" || extra ) {
				num = parseFloat( val );
				return extra === true || isFinite( num ) ? num || 0 : val;
			}
			return val;
		}
	} );

	jQuery.each( [ "height", "width" ], function( i, name ) {
		jQuery.cssHooks[ name ] = {
			get: function( elem, computed, extra ) {
				if ( computed ) {

					// Certain elements can have dimension info if we invisibly show them
					// but it must have a current display style that would benefit
					return rdisplayswap.test( jQuery.css( elem, "display" ) ) &&
						elem.offsetWidth === 0 ?
							swap( elem, cssShow, function() {
								return getWidthOrHeight( elem, name, extra );
							} ) :
							getWidthOrHeight( elem, name, extra );
				}
			},

			set: function( elem, value, extra ) {
				var matches,
					styles = extra && getStyles( elem ),
					subtract = extra && augmentWidthOrHeight(
						elem,
						name,
						extra,
						jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
						styles
					);

				// Convert to pixels if value adjustment is needed
				if ( subtract && ( matches = rcssNum.exec( value ) ) &&
					( matches[ 3 ] || "px" ) !== "px" ) {

					elem.style[ name ] = value;
					value = jQuery.css( elem, name );
				}

				return setPositiveNumber( elem, value, subtract );
			}
		};
	} );

	jQuery.cssHooks.marginLeft = addGetHookIf( support.reliableMarginLeft,
		function( elem, computed ) {
			if ( computed ) {
				return ( parseFloat( curCSS( elem, "marginLeft" ) ) ||
					elem.getBoundingClientRect().left -
						swap( elem, { marginLeft: 0 }, function() {
							return elem.getBoundingClientRect().left;
						} )
					) + "px";
			}
		}
	);

	// Support: Android 2.3
	jQuery.cssHooks.marginRight = addGetHookIf( support.reliableMarginRight,
		function( elem, computed ) {
			if ( computed ) {
				return swap( elem, { "display": "inline-block" },
					curCSS, [ elem, "marginRight" ] );
			}
		}
	);

	// These hooks are used by animate to expand properties
	jQuery.each( {
		margin: "",
		padding: "",
		border: "Width"
	}, function( prefix, suffix ) {
		jQuery.cssHooks[ prefix + suffix ] = {
			expand: function( value ) {
				var i = 0,
					expanded = {},

					// Assumes a single number if not a string
					parts = typeof value === "string" ? value.split( " " ) : [ value ];

				for ( ; i < 4; i++ ) {
					expanded[ prefix + cssExpand[ i ] + suffix ] =
						parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
				}

				return expanded;
			}
		};

		if ( !rmargin.test( prefix ) ) {
			jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
		}
	} );

	jQuery.fn.extend( {
		css: function( name, value ) {
			return access( this, function( elem, name, value ) {
				var styles, len,
					map = {},
					i = 0;

				if ( jQuery.isArray( name ) ) {
					styles = getStyles( elem );
					len = name.length;

					for ( ; i < len; i++ ) {
						map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
					}

					return map;
				}

				return value !== undefined ?
					jQuery.style( elem, name, value ) :
					jQuery.css( elem, name );
			}, name, value, arguments.length > 1 );
		},
		show: function() {
			return showHide( this, true );
		},
		hide: function() {
			return showHide( this );
		},
		toggle: function( state ) {
			if ( typeof state === "boolean" ) {
				return state ? this.show() : this.hide();
			}

			return this.each( function() {
				if ( isHidden( this ) ) {
					jQuery( this ).show();
				} else {
					jQuery( this ).hide();
				}
			} );
		}
	} );


	function Tween( elem, options, prop, end, easing ) {
		return new Tween.prototype.init( elem, options, prop, end, easing );
	}
	jQuery.Tween = Tween;

	Tween.prototype = {
		constructor: Tween,
		init: function( elem, options, prop, end, easing, unit ) {
			this.elem = elem;
			this.prop = prop;
			this.easing = easing || jQuery.easing._default;
			this.options = options;
			this.start = this.now = this.cur();
			this.end = end;
			this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
		},
		cur: function() {
			var hooks = Tween.propHooks[ this.prop ];

			return hooks && hooks.get ?
				hooks.get( this ) :
				Tween.propHooks._default.get( this );
		},
		run: function( percent ) {
			var eased,
				hooks = Tween.propHooks[ this.prop ];

			if ( this.options.duration ) {
				this.pos = eased = jQuery.easing[ this.easing ](
					percent, this.options.duration * percent, 0, 1, this.options.duration
				);
			} else {
				this.pos = eased = percent;
			}
			this.now = ( this.end - this.start ) * eased + this.start;

			if ( this.options.step ) {
				this.options.step.call( this.elem, this.now, this );
			}

			if ( hooks && hooks.set ) {
				hooks.set( this );
			} else {
				Tween.propHooks._default.set( this );
			}
			return this;
		}
	};

	Tween.prototype.init.prototype = Tween.prototype;

	Tween.propHooks = {
		_default: {
			get: function( tween ) {
				var result;

				// Use a property on the element directly when it is not a DOM element,
				// or when there is no matching style property that exists.
				if ( tween.elem.nodeType !== 1 ||
					tween.elem[ tween.prop ] != null && tween.elem.style[ tween.prop ] == null ) {
					return tween.elem[ tween.prop ];
				}

				// Passing an empty string as a 3rd parameter to .css will automatically
				// attempt a parseFloat and fallback to a string if the parse fails.
				// Simple values such as "10px" are parsed to Float;
				// complex values such as "rotate(1rad)" are returned as-is.
				result = jQuery.css( tween.elem, tween.prop, "" );

				// Empty strings, null, undefined and "auto" are converted to 0.
				return !result || result === "auto" ? 0 : result;
			},
			set: function( tween ) {

				// Use step hook for back compat.
				// Use cssHook if its there.
				// Use .style if available and use plain properties where available.
				if ( jQuery.fx.step[ tween.prop ] ) {
					jQuery.fx.step[ tween.prop ]( tween );
				} else if ( tween.elem.nodeType === 1 &&
					( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null ||
						jQuery.cssHooks[ tween.prop ] ) ) {
					jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
				} else {
					tween.elem[ tween.prop ] = tween.now;
				}
			}
		}
	};

	// Support: IE9
	// Panic based approach to setting things on disconnected nodes
	Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
		set: function( tween ) {
			if ( tween.elem.nodeType && tween.elem.parentNode ) {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	};

	jQuery.easing = {
		linear: function( p ) {
			return p;
		},
		swing: function( p ) {
			return 0.5 - Math.cos( p * Math.PI ) / 2;
		},
		_default: "swing"
	};

	jQuery.fx = Tween.prototype.init;

	// Back Compat <1.8 extension point
	jQuery.fx.step = {};




	var
		fxNow, timerId,
		rfxtypes = /^(?:toggle|show|hide)$/,
		rrun = /queueHooks$/;

	// Animations created synchronously will run synchronously
	function createFxNow() {
		window.setTimeout( function() {
			fxNow = undefined;
		} );
		return ( fxNow = jQuery.now() );
	}

	// Generate parameters to create a standard animation
	function genFx( type, includeWidth ) {
		var which,
			i = 0,
			attrs = { height: type };

		// If we include width, step value is 1 to do all cssExpand values,
		// otherwise step value is 2 to skip over Left and Right
		includeWidth = includeWidth ? 1 : 0;
		for ( ; i < 4 ; i += 2 - includeWidth ) {
			which = cssExpand[ i ];
			attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
		}

		if ( includeWidth ) {
			attrs.opacity = attrs.width = type;
		}

		return attrs;
	}

	function createTween( value, prop, animation ) {
		var tween,
			collection = ( Animation.tweeners[ prop ] || [] ).concat( Animation.tweeners[ "*" ] ),
			index = 0,
			length = collection.length;
		for ( ; index < length; index++ ) {
			if ( ( tween = collection[ index ].call( animation, prop, value ) ) ) {

				// We're done with this property
				return tween;
			}
		}
	}

	function defaultPrefilter( elem, props, opts ) {
		/* jshint validthis: true */
		var prop, value, toggle, tween, hooks, oldfire, display, checkDisplay,
			anim = this,
			orig = {},
			style = elem.style,
			hidden = elem.nodeType && isHidden( elem ),
			dataShow = dataPriv.get( elem, "fxshow" );

		// Handle queue: false promises
		if ( !opts.queue ) {
			hooks = jQuery._queueHooks( elem, "fx" );
			if ( hooks.unqueued == null ) {
				hooks.unqueued = 0;
				oldfire = hooks.empty.fire;
				hooks.empty.fire = function() {
					if ( !hooks.unqueued ) {
						oldfire();
					}
				};
			}
			hooks.unqueued++;

			anim.always( function() {

				// Ensure the complete handler is called before this completes
				anim.always( function() {
					hooks.unqueued--;
					if ( !jQuery.queue( elem, "fx" ).length ) {
						hooks.empty.fire();
					}
				} );
			} );
		}

		// Height/width overflow pass
		if ( elem.nodeType === 1 && ( "height" in props || "width" in props ) ) {

			// Make sure that nothing sneaks out
			// Record all 3 overflow attributes because IE9-10 do not
			// change the overflow attribute when overflowX and
			// overflowY are set to the same value
			opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

			// Set display property to inline-block for height/width
			// animations on inline elements that are having width/height animated
			display = jQuery.css( elem, "display" );

			// Test default display if display is currently "none"
			checkDisplay = display === "none" ?
				dataPriv.get( elem, "olddisplay" ) || defaultDisplay( elem.nodeName ) : display;

			if ( checkDisplay === "inline" && jQuery.css( elem, "float" ) === "none" ) {
				style.display = "inline-block";
			}
		}

		if ( opts.overflow ) {
			style.overflow = "hidden";
			anim.always( function() {
				style.overflow = opts.overflow[ 0 ];
				style.overflowX = opts.overflow[ 1 ];
				style.overflowY = opts.overflow[ 2 ];
			} );
		}

		// show/hide pass
		for ( prop in props ) {
			value = props[ prop ];
			if ( rfxtypes.exec( value ) ) {
				delete props[ prop ];
				toggle = toggle || value === "toggle";
				if ( value === ( hidden ? "hide" : "show" ) ) {

					// If there is dataShow left over from a stopped hide or show
					// and we are going to proceed with show, we should pretend to be hidden
					if ( value === "show" && dataShow && dataShow[ prop ] !== undefined ) {
						hidden = true;
					} else {
						continue;
					}
				}
				orig[ prop ] = dataShow && dataShow[ prop ] || jQuery.style( elem, prop );

			// Any non-fx value stops us from restoring the original display value
			} else {
				display = undefined;
			}
		}

		if ( !jQuery.isEmptyObject( orig ) ) {
			if ( dataShow ) {
				if ( "hidden" in dataShow ) {
					hidden = dataShow.hidden;
				}
			} else {
				dataShow = dataPriv.access( elem, "fxshow", {} );
			}

			// Store state if its toggle - enables .stop().toggle() to "reverse"
			if ( toggle ) {
				dataShow.hidden = !hidden;
			}
			if ( hidden ) {
				jQuery( elem ).show();
			} else {
				anim.done( function() {
					jQuery( elem ).hide();
				} );
			}
			anim.done( function() {
				var prop;

				dataPriv.remove( elem, "fxshow" );
				for ( prop in orig ) {
					jQuery.style( elem, prop, orig[ prop ] );
				}
			} );
			for ( prop in orig ) {
				tween = createTween( hidden ? dataShow[ prop ] : 0, prop, anim );

				if ( !( prop in dataShow ) ) {
					dataShow[ prop ] = tween.start;
					if ( hidden ) {
						tween.end = tween.start;
						tween.start = prop === "width" || prop === "height" ? 1 : 0;
					}
				}
			}

		// If this is a noop like .hide().hide(), restore an overwritten display value
		} else if ( ( display === "none" ? defaultDisplay( elem.nodeName ) : display ) === "inline" ) {
			style.display = display;
		}
	}

	function propFilter( props, specialEasing ) {
		var index, name, easing, value, hooks;

		// camelCase, specialEasing and expand cssHook pass
		for ( index in props ) {
			name = jQuery.camelCase( index );
			easing = specialEasing[ name ];
			value = props[ index ];
			if ( jQuery.isArray( value ) ) {
				easing = value[ 1 ];
				value = props[ index ] = value[ 0 ];
			}

			if ( index !== name ) {
				props[ name ] = value;
				delete props[ index ];
			}

			hooks = jQuery.cssHooks[ name ];
			if ( hooks && "expand" in hooks ) {
				value = hooks.expand( value );
				delete props[ name ];

				// Not quite $.extend, this won't overwrite existing keys.
				// Reusing 'index' because we have the correct "name"
				for ( index in value ) {
					if ( !( index in props ) ) {
						props[ index ] = value[ index ];
						specialEasing[ index ] = easing;
					}
				}
			} else {
				specialEasing[ name ] = easing;
			}
		}
	}

	function Animation( elem, properties, options ) {
		var result,
			stopped,
			index = 0,
			length = Animation.prefilters.length,
			deferred = jQuery.Deferred().always( function() {

				// Don't match elem in the :animated selector
				delete tick.elem;
			} ),
			tick = function() {
				if ( stopped ) {
					return false;
				}
				var currentTime = fxNow || createFxNow(),
					remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),

					// Support: Android 2.3
					// Archaic crash bug won't allow us to use `1 - ( 0.5 || 0 )` (#12497)
					temp = remaining / animation.duration || 0,
					percent = 1 - temp,
					index = 0,
					length = animation.tweens.length;

				for ( ; index < length ; index++ ) {
					animation.tweens[ index ].run( percent );
				}

				deferred.notifyWith( elem, [ animation, percent, remaining ] );

				if ( percent < 1 && length ) {
					return remaining;
				} else {
					deferred.resolveWith( elem, [ animation ] );
					return false;
				}
			},
			animation = deferred.promise( {
				elem: elem,
				props: jQuery.extend( {}, properties ),
				opts: jQuery.extend( true, {
					specialEasing: {},
					easing: jQuery.easing._default
				}, options ),
				originalProperties: properties,
				originalOptions: options,
				startTime: fxNow || createFxNow(),
				duration: options.duration,
				tweens: [],
				createTween: function( prop, end ) {
					var tween = jQuery.Tween( elem, animation.opts, prop, end,
							animation.opts.specialEasing[ prop ] || animation.opts.easing );
					animation.tweens.push( tween );
					return tween;
				},
				stop: function( gotoEnd ) {
					var index = 0,

						// If we are going to the end, we want to run all the tweens
						// otherwise we skip this part
						length = gotoEnd ? animation.tweens.length : 0;
					if ( stopped ) {
						return this;
					}
					stopped = true;
					for ( ; index < length ; index++ ) {
						animation.tweens[ index ].run( 1 );
					}

					// Resolve when we played the last frame; otherwise, reject
					if ( gotoEnd ) {
						deferred.notifyWith( elem, [ animation, 1, 0 ] );
						deferred.resolveWith( elem, [ animation, gotoEnd ] );
					} else {
						deferred.rejectWith( elem, [ animation, gotoEnd ] );
					}
					return this;
				}
			} ),
			props = animation.props;

		propFilter( props, animation.opts.specialEasing );

		for ( ; index < length ; index++ ) {
			result = Animation.prefilters[ index ].call( animation, elem, props, animation.opts );
			if ( result ) {
				if ( jQuery.isFunction( result.stop ) ) {
					jQuery._queueHooks( animation.elem, animation.opts.queue ).stop =
						jQuery.proxy( result.stop, result );
				}
				return result;
			}
		}

		jQuery.map( props, createTween, animation );

		if ( jQuery.isFunction( animation.opts.start ) ) {
			animation.opts.start.call( elem, animation );
		}

		jQuery.fx.timer(
			jQuery.extend( tick, {
				elem: elem,
				anim: animation,
				queue: animation.opts.queue
			} )
		);

		// attach callbacks from options
		return animation.progress( animation.opts.progress )
			.done( animation.opts.done, animation.opts.complete )
			.fail( animation.opts.fail )
			.always( animation.opts.always );
	}

	jQuery.Animation = jQuery.extend( Animation, {
		tweeners: {
			"*": [ function( prop, value ) {
				var tween = this.createTween( prop, value );
				adjustCSS( tween.elem, prop, rcssNum.exec( value ), tween );
				return tween;
			} ]
		},

		tweener: function( props, callback ) {
			if ( jQuery.isFunction( props ) ) {
				callback = props;
				props = [ "*" ];
			} else {
				props = props.match( rnotwhite );
			}

			var prop,
				index = 0,
				length = props.length;

			for ( ; index < length ; index++ ) {
				prop = props[ index ];
				Animation.tweeners[ prop ] = Animation.tweeners[ prop ] || [];
				Animation.tweeners[ prop ].unshift( callback );
			}
		},

		prefilters: [ defaultPrefilter ],

		prefilter: function( callback, prepend ) {
			if ( prepend ) {
				Animation.prefilters.unshift( callback );
			} else {
				Animation.prefilters.push( callback );
			}
		}
	} );

	jQuery.speed = function( speed, easing, fn ) {
		var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
			complete: fn || !fn && easing ||
				jQuery.isFunction( speed ) && speed,
			duration: speed,
			easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
		};

		opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ?
			opt.duration : opt.duration in jQuery.fx.speeds ?
				jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;

		// Normalize opt.queue - true/undefined/null -> "fx"
		if ( opt.queue == null || opt.queue === true ) {
			opt.queue = "fx";
		}

		// Queueing
		opt.old = opt.complete;

		opt.complete = function() {
			if ( jQuery.isFunction( opt.old ) ) {
				opt.old.call( this );
			}

			if ( opt.queue ) {
				jQuery.dequeue( this, opt.queue );
			}
		};

		return opt;
	};

	jQuery.fn.extend( {
		fadeTo: function( speed, to, easing, callback ) {

			// Show any hidden elements after setting opacity to 0
			return this.filter( isHidden ).css( "opacity", 0 ).show()

				// Animate to the value specified
				.end().animate( { opacity: to }, speed, easing, callback );
		},
		animate: function( prop, speed, easing, callback ) {
			var empty = jQuery.isEmptyObject( prop ),
				optall = jQuery.speed( speed, easing, callback ),
				doAnimation = function() {

					// Operate on a copy of prop so per-property easing won't be lost
					var anim = Animation( this, jQuery.extend( {}, prop ), optall );

					// Empty animations, or finishing resolves immediately
					if ( empty || dataPriv.get( this, "finish" ) ) {
						anim.stop( true );
					}
				};
				doAnimation.finish = doAnimation;

			return empty || optall.queue === false ?
				this.each( doAnimation ) :
				this.queue( optall.queue, doAnimation );
		},
		stop: function( type, clearQueue, gotoEnd ) {
			var stopQueue = function( hooks ) {
				var stop = hooks.stop;
				delete hooks.stop;
				stop( gotoEnd );
			};

			if ( typeof type !== "string" ) {
				gotoEnd = clearQueue;
				clearQueue = type;
				type = undefined;
			}
			if ( clearQueue && type !== false ) {
				this.queue( type || "fx", [] );
			}

			return this.each( function() {
				var dequeue = true,
					index = type != null && type + "queueHooks",
					timers = jQuery.timers,
					data = dataPriv.get( this );

				if ( index ) {
					if ( data[ index ] && data[ index ].stop ) {
						stopQueue( data[ index ] );
					}
				} else {
					for ( index in data ) {
						if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
							stopQueue( data[ index ] );
						}
					}
				}

				for ( index = timers.length; index--; ) {
					if ( timers[ index ].elem === this &&
						( type == null || timers[ index ].queue === type ) ) {

						timers[ index ].anim.stop( gotoEnd );
						dequeue = false;
						timers.splice( index, 1 );
					}
				}

				// Start the next in the queue if the last step wasn't forced.
				// Timers currently will call their complete callbacks, which
				// will dequeue but only if they were gotoEnd.
				if ( dequeue || !gotoEnd ) {
					jQuery.dequeue( this, type );
				}
			} );
		},
		finish: function( type ) {
			if ( type !== false ) {
				type = type || "fx";
			}
			return this.each( function() {
				var index,
					data = dataPriv.get( this ),
					queue = data[ type + "queue" ],
					hooks = data[ type + "queueHooks" ],
					timers = jQuery.timers,
					length = queue ? queue.length : 0;

				// Enable finishing flag on private data
				data.finish = true;

				// Empty the queue first
				jQuery.queue( this, type, [] );

				if ( hooks && hooks.stop ) {
					hooks.stop.call( this, true );
				}

				// Look for any active animations, and finish them
				for ( index = timers.length; index--; ) {
					if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
						timers[ index ].anim.stop( true );
						timers.splice( index, 1 );
					}
				}

				// Look for any animations in the old queue and finish them
				for ( index = 0; index < length; index++ ) {
					if ( queue[ index ] && queue[ index ].finish ) {
						queue[ index ].finish.call( this );
					}
				}

				// Turn off finishing flag
				delete data.finish;
			} );
		}
	} );

	jQuery.each( [ "toggle", "show", "hide" ], function( i, name ) {
		var cssFn = jQuery.fn[ name ];
		jQuery.fn[ name ] = function( speed, easing, callback ) {
			return speed == null || typeof speed === "boolean" ?
				cssFn.apply( this, arguments ) :
				this.animate( genFx( name, true ), speed, easing, callback );
		};
	} );

	// Generate shortcuts for custom animations
	jQuery.each( {
		slideDown: genFx( "show" ),
		slideUp: genFx( "hide" ),
		slideToggle: genFx( "toggle" ),
		fadeIn: { opacity: "show" },
		fadeOut: { opacity: "hide" },
		fadeToggle: { opacity: "toggle" }
	}, function( name, props ) {
		jQuery.fn[ name ] = function( speed, easing, callback ) {
			return this.animate( props, speed, easing, callback );
		};
	} );

	jQuery.timers = [];
	jQuery.fx.tick = function() {
		var timer,
			i = 0,
			timers = jQuery.timers;

		fxNow = jQuery.now();

		for ( ; i < timers.length; i++ ) {
			timer = timers[ i ];

			// Checks the timer has not already been removed
			if ( !timer() && timers[ i ] === timer ) {
				timers.splice( i--, 1 );
			}
		}

		if ( !timers.length ) {
			jQuery.fx.stop();
		}
		fxNow = undefined;
	};

	jQuery.fx.timer = function( timer ) {
		jQuery.timers.push( timer );
		if ( timer() ) {
			jQuery.fx.start();
		} else {
			jQuery.timers.pop();
		}
	};

	jQuery.fx.interval = 13;
	jQuery.fx.start = function() {
		if ( !timerId ) {
			timerId = window.setInterval( jQuery.fx.tick, jQuery.fx.interval );
		}
	};

	jQuery.fx.stop = function() {
		window.clearInterval( timerId );

		timerId = null;
	};

	jQuery.fx.speeds = {
		slow: 600,
		fast: 200,

		// Default speed
		_default: 400
	};


	// Based off of the plugin by Clint Helfers, with permission.
	// http://web.archive.org/web/20100324014747/http://blindsignals.com/index.php/2009/07/jquery-delay/
	jQuery.fn.delay = function( time, type ) {
		time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
		type = type || "fx";

		return this.queue( type, function( next, hooks ) {
			var timeout = window.setTimeout( next, time );
			hooks.stop = function() {
				window.clearTimeout( timeout );
			};
		} );
	};


	( function() {
		var input = document.createElement( "input" ),
			select = document.createElement( "select" ),
			opt = select.appendChild( document.createElement( "option" ) );

		input.type = "checkbox";

		// Support: iOS<=5.1, Android<=4.2+
		// Default value for a checkbox should be "on"
		support.checkOn = input.value !== "";

		// Support: IE<=11+
		// Must access selectedIndex to make default options select
		support.optSelected = opt.selected;

		// Support: Android<=2.3
		// Options inside disabled selects are incorrectly marked as disabled
		select.disabled = true;
		support.optDisabled = !opt.disabled;

		// Support: IE<=11+
		// An input loses its value after becoming a radio
		input = document.createElement( "input" );
		input.value = "t";
		input.type = "radio";
		support.radioValue = input.value === "t";
	} )();


	var boolHook,
		attrHandle = jQuery.expr.attrHandle;

	jQuery.fn.extend( {
		attr: function( name, value ) {
			return access( this, jQuery.attr, name, value, arguments.length > 1 );
		},

		removeAttr: function( name ) {
			return this.each( function() {
				jQuery.removeAttr( this, name );
			} );
		}
	} );

	jQuery.extend( {
		attr: function( elem, name, value ) {
			var ret, hooks,
				nType = elem.nodeType;

			// Don't get/set attributes on text, comment and attribute nodes
			if ( nType === 3 || nType === 8 || nType === 2 ) {
				return;
			}

			// Fallback to prop when attributes are not supported
			if ( typeof elem.getAttribute === "undefined" ) {
				return jQuery.prop( elem, name, value );
			}

			// All attributes are lowercase
			// Grab necessary hook if one is defined
			if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
				name = name.toLowerCase();
				hooks = jQuery.attrHooks[ name ] ||
					( jQuery.expr.match.bool.test( name ) ? boolHook : undefined );
			}

			if ( value !== undefined ) {
				if ( value === null ) {
					jQuery.removeAttr( elem, name );
					return;
				}

				if ( hooks && "set" in hooks &&
					( ret = hooks.set( elem, value, name ) ) !== undefined ) {
					return ret;
				}

				elem.setAttribute( name, value + "" );
				return value;
			}

			if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
				return ret;
			}

			ret = jQuery.find.attr( elem, name );

			// Non-existent attributes return null, we normalize to undefined
			return ret == null ? undefined : ret;
		},

		attrHooks: {
			type: {
				set: function( elem, value ) {
					if ( !support.radioValue && value === "radio" &&
						jQuery.nodeName( elem, "input" ) ) {
						var val = elem.value;
						elem.setAttribute( "type", value );
						if ( val ) {
							elem.value = val;
						}
						return value;
					}
				}
			}
		},

		removeAttr: function( elem, value ) {
			var name, propName,
				i = 0,
				attrNames = value && value.match( rnotwhite );

			if ( attrNames && elem.nodeType === 1 ) {
				while ( ( name = attrNames[ i++ ] ) ) {
					propName = jQuery.propFix[ name ] || name;

					// Boolean attributes get special treatment (#10870)
					if ( jQuery.expr.match.bool.test( name ) ) {

						// Set corresponding property to false
						elem[ propName ] = false;
					}

					elem.removeAttribute( name );
				}
			}
		}
	} );

	// Hooks for boolean attributes
	boolHook = {
		set: function( elem, value, name ) {
			if ( value === false ) {

				// Remove boolean attributes when set to false
				jQuery.removeAttr( elem, name );
			} else {
				elem.setAttribute( name, name );
			}
			return name;
		}
	};
	jQuery.each( jQuery.expr.match.bool.source.match( /\w+/g ), function( i, name ) {
		var getter = attrHandle[ name ] || jQuery.find.attr;

		attrHandle[ name ] = function( elem, name, isXML ) {
			var ret, handle;
			if ( !isXML ) {

				// Avoid an infinite loop by temporarily removing this function from the getter
				handle = attrHandle[ name ];
				attrHandle[ name ] = ret;
				ret = getter( elem, name, isXML ) != null ?
					name.toLowerCase() :
					null;
				attrHandle[ name ] = handle;
			}
			return ret;
		};
	} );




	var rfocusable = /^(?:input|select|textarea|button)$/i,
		rclickable = /^(?:a|area)$/i;

	jQuery.fn.extend( {
		prop: function( name, value ) {
			return access( this, jQuery.prop, name, value, arguments.length > 1 );
		},

		removeProp: function( name ) {
			return this.each( function() {
				delete this[ jQuery.propFix[ name ] || name ];
			} );
		}
	} );

	jQuery.extend( {
		prop: function( elem, name, value ) {
			var ret, hooks,
				nType = elem.nodeType;

			// Don't get/set properties on text, comment and attribute nodes
			if ( nType === 3 || nType === 8 || nType === 2 ) {
				return;
			}

			if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {

				// Fix name and attach hooks
				name = jQuery.propFix[ name ] || name;
				hooks = jQuery.propHooks[ name ];
			}

			if ( value !== undefined ) {
				if ( hooks && "set" in hooks &&
					( ret = hooks.set( elem, value, name ) ) !== undefined ) {
					return ret;
				}

				return ( elem[ name ] = value );
			}

			if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
				return ret;
			}

			return elem[ name ];
		},

		propHooks: {
			tabIndex: {
				get: function( elem ) {

					// elem.tabIndex doesn't always return the
					// correct value when it hasn't been explicitly set
					// http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
					// Use proper attribute retrieval(#12072)
					var tabindex = jQuery.find.attr( elem, "tabindex" );

					return tabindex ?
						parseInt( tabindex, 10 ) :
						rfocusable.test( elem.nodeName ) ||
							rclickable.test( elem.nodeName ) && elem.href ?
								0 :
								-1;
				}
			}
		},

		propFix: {
			"for": "htmlFor",
			"class": "className"
		}
	} );

	// Support: IE <=11 only
	// Accessing the selectedIndex property
	// forces the browser to respect setting selected
	// on the option
	// The getter ensures a default option is selected
	// when in an optgroup
	if ( !support.optSelected ) {
		jQuery.propHooks.selected = {
			get: function( elem ) {
				var parent = elem.parentNode;
				if ( parent && parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
				return null;
			},
			set: function( elem ) {
				var parent = elem.parentNode;
				if ( parent ) {
					parent.selectedIndex;

					if ( parent.parentNode ) {
						parent.parentNode.selectedIndex;
					}
				}
			}
		};
	}

	jQuery.each( [
		"tabIndex",
		"readOnly",
		"maxLength",
		"cellSpacing",
		"cellPadding",
		"rowSpan",
		"colSpan",
		"useMap",
		"frameBorder",
		"contentEditable"
	], function() {
		jQuery.propFix[ this.toLowerCase() ] = this;
	} );




	var rclass = /[\t\r\n\f]/g;

	function getClass( elem ) {
		return elem.getAttribute && elem.getAttribute( "class" ) || "";
	}

	jQuery.fn.extend( {
		addClass: function( value ) {
			var classes, elem, cur, curValue, clazz, j, finalValue,
				i = 0;

			if ( jQuery.isFunction( value ) ) {
				return this.each( function( j ) {
					jQuery( this ).addClass( value.call( this, j, getClass( this ) ) );
				} );
			}

			if ( typeof value === "string" && value ) {
				classes = value.match( rnotwhite ) || [];

				while ( ( elem = this[ i++ ] ) ) {
					curValue = getClass( elem );
					cur = elem.nodeType === 1 &&
						( " " + curValue + " " ).replace( rclass, " " );

					if ( cur ) {
						j = 0;
						while ( ( clazz = classes[ j++ ] ) ) {
							if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
								cur += clazz + " ";
							}
						}

						// Only assign if different to avoid unneeded rendering.
						finalValue = jQuery.trim( cur );
						if ( curValue !== finalValue ) {
							elem.setAttribute( "class", finalValue );
						}
					}
				}
			}

			return this;
		},

		removeClass: function( value ) {
			var classes, elem, cur, curValue, clazz, j, finalValue,
				i = 0;

			if ( jQuery.isFunction( value ) ) {
				return this.each( function( j ) {
					jQuery( this ).removeClass( value.call( this, j, getClass( this ) ) );
				} );
			}

			if ( !arguments.length ) {
				return this.attr( "class", "" );
			}

			if ( typeof value === "string" && value ) {
				classes = value.match( rnotwhite ) || [];

				while ( ( elem = this[ i++ ] ) ) {
					curValue = getClass( elem );

					// This expression is here for better compressibility (see addClass)
					cur = elem.nodeType === 1 &&
						( " " + curValue + " " ).replace( rclass, " " );

					if ( cur ) {
						j = 0;
						while ( ( clazz = classes[ j++ ] ) ) {

							// Remove *all* instances
							while ( cur.indexOf( " " + clazz + " " ) > -1 ) {
								cur = cur.replace( " " + clazz + " ", " " );
							}
						}

						// Only assign if different to avoid unneeded rendering.
						finalValue = jQuery.trim( cur );
						if ( curValue !== finalValue ) {
							elem.setAttribute( "class", finalValue );
						}
					}
				}
			}

			return this;
		},

		toggleClass: function( value, stateVal ) {
			var type = typeof value;

			if ( typeof stateVal === "boolean" && type === "string" ) {
				return stateVal ? this.addClass( value ) : this.removeClass( value );
			}

			if ( jQuery.isFunction( value ) ) {
				return this.each( function( i ) {
					jQuery( this ).toggleClass(
						value.call( this, i, getClass( this ), stateVal ),
						stateVal
					);
				} );
			}

			return this.each( function() {
				var className, i, self, classNames;

				if ( type === "string" ) {

					// Toggle individual class names
					i = 0;
					self = jQuery( this );
					classNames = value.match( rnotwhite ) || [];

					while ( ( className = classNames[ i++ ] ) ) {

						// Check each className given, space separated list
						if ( self.hasClass( className ) ) {
							self.removeClass( className );
						} else {
							self.addClass( className );
						}
					}

				// Toggle whole class name
				} else if ( value === undefined || type === "boolean" ) {
					className = getClass( this );
					if ( className ) {

						// Store className if set
						dataPriv.set( this, "__className__", className );
					}

					// If the element has a class name or if we're passed `false`,
					// then remove the whole classname (if there was one, the above saved it).
					// Otherwise bring back whatever was previously saved (if anything),
					// falling back to the empty string if nothing was stored.
					if ( this.setAttribute ) {
						this.setAttribute( "class",
							className || value === false ?
							"" :
							dataPriv.get( this, "__className__" ) || ""
						);
					}
				}
			} );
		},

		hasClass: function( selector ) {
			var className, elem,
				i = 0;

			className = " " + selector + " ";
			while ( ( elem = this[ i++ ] ) ) {
				if ( elem.nodeType === 1 &&
					( " " + getClass( elem ) + " " ).replace( rclass, " " )
						.indexOf( className ) > -1
				) {
					return true;
				}
			}

			return false;
		}
	} );




	var rreturn = /\r/g,
		rspaces = /[\x20\t\r\n\f]+/g;

	jQuery.fn.extend( {
		val: function( value ) {
			var hooks, ret, isFunction,
				elem = this[ 0 ];

			if ( !arguments.length ) {
				if ( elem ) {
					hooks = jQuery.valHooks[ elem.type ] ||
						jQuery.valHooks[ elem.nodeName.toLowerCase() ];

					if ( hooks &&
						"get" in hooks &&
						( ret = hooks.get( elem, "value" ) ) !== undefined
					) {
						return ret;
					}

					ret = elem.value;

					return typeof ret === "string" ?

						// Handle most common string cases
						ret.replace( rreturn, "" ) :

						// Handle cases where value is null/undef or number
						ret == null ? "" : ret;
				}

				return;
			}

			isFunction = jQuery.isFunction( value );

			return this.each( function( i ) {
				var val;

				if ( this.nodeType !== 1 ) {
					return;
				}

				if ( isFunction ) {
					val = value.call( this, i, jQuery( this ).val() );
				} else {
					val = value;
				}

				// Treat null/undefined as ""; convert numbers to string
				if ( val == null ) {
					val = "";

				} else if ( typeof val === "number" ) {
					val += "";

				} else if ( jQuery.isArray( val ) ) {
					val = jQuery.map( val, function( value ) {
						return value == null ? "" : value + "";
					} );
				}

				hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

				// If set returns undefined, fall back to normal setting
				if ( !hooks || !( "set" in hooks ) || hooks.set( this, val, "value" ) === undefined ) {
					this.value = val;
				}
			} );
		}
	} );

	jQuery.extend( {
		valHooks: {
			option: {
				get: function( elem ) {

					var val = jQuery.find.attr( elem, "value" );
					return val != null ?
						val :

						// Support: IE10-11+
						// option.text throws exceptions (#14686, #14858)
						// Strip and collapse whitespace
						// https://html.spec.whatwg.org/#strip-and-collapse-whitespace
						jQuery.trim( jQuery.text( elem ) ).replace( rspaces, " " );
				}
			},
			select: {
				get: function( elem ) {
					var value, option,
						options = elem.options,
						index = elem.selectedIndex,
						one = elem.type === "select-one" || index < 0,
						values = one ? null : [],
						max = one ? index + 1 : options.length,
						i = index < 0 ?
							max :
							one ? index : 0;

					// Loop through all the selected options
					for ( ; i < max; i++ ) {
						option = options[ i ];

						// IE8-9 doesn't update selected after form reset (#2551)
						if ( ( option.selected || i === index ) &&

								// Don't return options that are disabled or in a disabled optgroup
								( support.optDisabled ?
									!option.disabled : option.getAttribute( "disabled" ) === null ) &&
								( !option.parentNode.disabled ||
									!jQuery.nodeName( option.parentNode, "optgroup" ) ) ) {

							// Get the specific value for the option
							value = jQuery( option ).val();

							// We don't need an array for one selects
							if ( one ) {
								return value;
							}

							// Multi-Selects return an array
							values.push( value );
						}
					}

					return values;
				},

				set: function( elem, value ) {
					var optionSet, option,
						options = elem.options,
						values = jQuery.makeArray( value ),
						i = options.length;

					while ( i-- ) {
						option = options[ i ];
						if ( option.selected =
							jQuery.inArray( jQuery.valHooks.option.get( option ), values ) > -1
						) {
							optionSet = true;
						}
					}

					// Force browsers to behave consistently when non-matching value is set
					if ( !optionSet ) {
						elem.selectedIndex = -1;
					}
					return values;
				}
			}
		}
	} );

	// Radios and checkboxes getter/setter
	jQuery.each( [ "radio", "checkbox" ], function() {
		jQuery.valHooks[ this ] = {
			set: function( elem, value ) {
				if ( jQuery.isArray( value ) ) {
					return ( elem.checked = jQuery.inArray( jQuery( elem ).val(), value ) > -1 );
				}
			}
		};
		if ( !support.checkOn ) {
			jQuery.valHooks[ this ].get = function( elem ) {
				return elem.getAttribute( "value" ) === null ? "on" : elem.value;
			};
		}
	} );




	// Return jQuery for attributes-only inclusion


	var rfocusMorph = /^(?:focusinfocus|focusoutblur)$/;

	jQuery.extend( jQuery.event, {

		trigger: function( event, data, elem, onlyHandlers ) {

			var i, cur, tmp, bubbleType, ontype, handle, special,
				eventPath = [ elem || document ],
				type = hasOwn.call( event, "type" ) ? event.type : event,
				namespaces = hasOwn.call( event, "namespace" ) ? event.namespace.split( "." ) : [];

			cur = tmp = elem = elem || document;

			// Don't do events on text and comment nodes
			if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
				return;
			}

			// focus/blur morphs to focusin/out; ensure we're not firing them right now
			if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
				return;
			}

			if ( type.indexOf( "." ) > -1 ) {

				// Namespaced trigger; create a regexp to match event type in handle()
				namespaces = type.split( "." );
				type = namespaces.shift();
				namespaces.sort();
			}
			ontype = type.indexOf( ":" ) < 0 && "on" + type;

			// Caller can pass in a jQuery.Event object, Object, or just an event type string
			event = event[ jQuery.expando ] ?
				event :
				new jQuery.Event( type, typeof event === "object" && event );

			// Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
			event.isTrigger = onlyHandlers ? 2 : 3;
			event.namespace = namespaces.join( "." );
			event.rnamespace = event.namespace ?
				new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" ) :
				null;

			// Clean up the event in case it is being reused
			event.result = undefined;
			if ( !event.target ) {
				event.target = elem;
			}

			// Clone any incoming data and prepend the event, creating the handler arg list
			data = data == null ?
				[ event ] :
				jQuery.makeArray( data, [ event ] );

			// Allow special events to draw outside the lines
			special = jQuery.event.special[ type ] || {};
			if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
				return;
			}

			// Determine event propagation path in advance, per W3C events spec (#9951)
			// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
			if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {

				bubbleType = special.delegateType || type;
				if ( !rfocusMorph.test( bubbleType + type ) ) {
					cur = cur.parentNode;
				}
				for ( ; cur; cur = cur.parentNode ) {
					eventPath.push( cur );
					tmp = cur;
				}

				// Only add window if we got to document (e.g., not plain obj or detached DOM)
				if ( tmp === ( elem.ownerDocument || document ) ) {
					eventPath.push( tmp.defaultView || tmp.parentWindow || window );
				}
			}

			// Fire handlers on the event path
			i = 0;
			while ( ( cur = eventPath[ i++ ] ) && !event.isPropagationStopped() ) {

				event.type = i > 1 ?
					bubbleType :
					special.bindType || type;

				// jQuery handler
				handle = ( dataPriv.get( cur, "events" ) || {} )[ event.type ] &&
					dataPriv.get( cur, "handle" );
				if ( handle ) {
					handle.apply( cur, data );
				}

				// Native handler
				handle = ontype && cur[ ontype ];
				if ( handle && handle.apply && acceptData( cur ) ) {
					event.result = handle.apply( cur, data );
					if ( event.result === false ) {
						event.preventDefault();
					}
				}
			}
			event.type = type;

			// If nobody prevented the default action, do it now
			if ( !onlyHandlers && !event.isDefaultPrevented() ) {

				if ( ( !special._default ||
					special._default.apply( eventPath.pop(), data ) === false ) &&
					acceptData( elem ) ) {

					// Call a native DOM method on the target with the same name name as the event.
					// Don't do default actions on window, that's where global variables be (#6170)
					if ( ontype && jQuery.isFunction( elem[ type ] ) && !jQuery.isWindow( elem ) ) {

						// Don't re-trigger an onFOO event when we call its FOO() method
						tmp = elem[ ontype ];

						if ( tmp ) {
							elem[ ontype ] = null;
						}

						// Prevent re-triggering of the same event, since we already bubbled it above
						jQuery.event.triggered = type;
						elem[ type ]();
						jQuery.event.triggered = undefined;

						if ( tmp ) {
							elem[ ontype ] = tmp;
						}
					}
				}
			}

			return event.result;
		},

		// Piggyback on a donor event to simulate a different one
		simulate: function( type, elem, event ) {
			var e = jQuery.extend(
				new jQuery.Event(),
				event,
				{
					type: type,
					isSimulated: true

					// Previously, `originalEvent: {}` was set here, so stopPropagation call
					// would not be triggered on donor event, since in our own
					// jQuery.event.stopPropagation function we had a check for existence of
					// originalEvent.stopPropagation method, so, consequently it would be a noop.
					//
					// But now, this "simulate" function is used only for events
					// for which stopPropagation() is noop, so there is no need for that anymore.
					//
					// For the 1.x branch though, guard for "click" and "submit"
					// events is still used, but was moved to jQuery.event.stopPropagation function
					// because `originalEvent` should point to the original event for the constancy
					// with other events and for more focused logic
				}
			);

			jQuery.event.trigger( e, null, elem );

			if ( e.isDefaultPrevented() ) {
				event.preventDefault();
			}
		}

	} );

	jQuery.fn.extend( {

		trigger: function( type, data ) {
			return this.each( function() {
				jQuery.event.trigger( type, data, this );
			} );
		},
		triggerHandler: function( type, data ) {
			var elem = this[ 0 ];
			if ( elem ) {
				return jQuery.event.trigger( type, data, elem, true );
			}
		}
	} );


	jQuery.each( ( "blur focus focusin focusout load resize scroll unload click dblclick " +
		"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
		"change select submit keydown keypress keyup error contextmenu" ).split( " " ),
		function( i, name ) {

		// Handle event binding
		jQuery.fn[ name ] = function( data, fn ) {
			return arguments.length > 0 ?
				this.on( name, null, data, fn ) :
				this.trigger( name );
		};
	} );

	jQuery.fn.extend( {
		hover: function( fnOver, fnOut ) {
			return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
		}
	} );




	support.focusin = "onfocusin" in window;


	// Support: Firefox
	// Firefox doesn't have focus(in | out) events
	// Related ticket - https://bugzilla.mozilla.org/show_bug.cgi?id=687787
	//
	// Support: Chrome, Safari
	// focus(in | out) events fire after focus & blur events,
	// which is spec violation - http://www.w3.org/TR/DOM-Level-3-Events/#events-focusevent-event-order
	// Related ticket - https://code.google.com/p/chromium/issues/detail?id=449857
	if ( !support.focusin ) {
		jQuery.each( { focus: "focusin", blur: "focusout" }, function( orig, fix ) {

			// Attach a single capturing handler on the document while someone wants focusin/focusout
			var handler = function( event ) {
				jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ) );
			};

			jQuery.event.special[ fix ] = {
				setup: function() {
					var doc = this.ownerDocument || this,
						attaches = dataPriv.access( doc, fix );

					if ( !attaches ) {
						doc.addEventListener( orig, handler, true );
					}
					dataPriv.access( doc, fix, ( attaches || 0 ) + 1 );
				},
				teardown: function() {
					var doc = this.ownerDocument || this,
						attaches = dataPriv.access( doc, fix ) - 1;

					if ( !attaches ) {
						doc.removeEventListener( orig, handler, true );
						dataPriv.remove( doc, fix );

					} else {
						dataPriv.access( doc, fix, attaches );
					}
				}
			};
		} );
	}
	var location = window.location;

	var nonce = jQuery.now();

	var rquery = ( /\?/ );



	// Support: Android 2.3
	// Workaround failure to string-cast null input
	jQuery.parseJSON = function( data ) {
		return JSON.parse( data + "" );
	};


	// Cross-browser xml parsing
	jQuery.parseXML = function( data ) {
		var xml;
		if ( !data || typeof data !== "string" ) {
			return null;
		}

		// Support: IE9
		try {
			xml = ( new window.DOMParser() ).parseFromString( data, "text/xml" );
		} catch ( e ) {
			xml = undefined;
		}

		if ( !xml || xml.getElementsByTagName( "parsererror" ).length ) {
			jQuery.error( "Invalid XML: " + data );
		}
		return xml;
	};


	var
		rhash = /#.*$/,
		rts = /([?&])_=[^&]*/,
		rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg,

		// #7653, #8125, #8152: local protocol detection
		rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
		rnoContent = /^(?:GET|HEAD)$/,
		rprotocol = /^\/\//,

		/* Prefilters
		 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
		 * 2) These are called:
		 *    - BEFORE asking for a transport
		 *    - AFTER param serialization (s.data is a string if s.processData is true)
		 * 3) key is the dataType
		 * 4) the catchall symbol "*" can be used
		 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
		 */
		prefilters = {},

		/* Transports bindings
		 * 1) key is the dataType
		 * 2) the catchall symbol "*" can be used
		 * 3) selection will start with transport dataType and THEN go to "*" if needed
		 */
		transports = {},

		// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
		allTypes = "*/".concat( "*" ),

		// Anchor tag for parsing the document origin
		originAnchor = document.createElement( "a" );
		originAnchor.href = location.href;

	// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
	function addToPrefiltersOrTransports( structure ) {

		// dataTypeExpression is optional and defaults to "*"
		return function( dataTypeExpression, func ) {

			if ( typeof dataTypeExpression !== "string" ) {
				func = dataTypeExpression;
				dataTypeExpression = "*";
			}

			var dataType,
				i = 0,
				dataTypes = dataTypeExpression.toLowerCase().match( rnotwhite ) || [];

			if ( jQuery.isFunction( func ) ) {

				// For each dataType in the dataTypeExpression
				while ( ( dataType = dataTypes[ i++ ] ) ) {

					// Prepend if requested
					if ( dataType[ 0 ] === "+" ) {
						dataType = dataType.slice( 1 ) || "*";
						( structure[ dataType ] = structure[ dataType ] || [] ).unshift( func );

					// Otherwise append
					} else {
						( structure[ dataType ] = structure[ dataType ] || [] ).push( func );
					}
				}
			}
		};
	}

	// Base inspection function for prefilters and transports
	function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

		var inspected = {},
			seekingTransport = ( structure === transports );

		function inspect( dataType ) {
			var selected;
			inspected[ dataType ] = true;
			jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
				var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
				if ( typeof dataTypeOrTransport === "string" &&
					!seekingTransport && !inspected[ dataTypeOrTransport ] ) {

					options.dataTypes.unshift( dataTypeOrTransport );
					inspect( dataTypeOrTransport );
					return false;
				} else if ( seekingTransport ) {
					return !( selected = dataTypeOrTransport );
				}
			} );
			return selected;
		}

		return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
	}

	// A special extend for ajax options
	// that takes "flat" options (not to be deep extended)
	// Fixes #9887
	function ajaxExtend( target, src ) {
		var key, deep,
			flatOptions = jQuery.ajaxSettings.flatOptions || {};

		for ( key in src ) {
			if ( src[ key ] !== undefined ) {
				( flatOptions[ key ] ? target : ( deep || ( deep = {} ) ) )[ key ] = src[ key ];
			}
		}
		if ( deep ) {
			jQuery.extend( true, target, deep );
		}

		return target;
	}

	/* Handles responses to an ajax request:
	 * - finds the right dataType (mediates between content-type and expected dataType)
	 * - returns the corresponding response
	 */
	function ajaxHandleResponses( s, jqXHR, responses ) {

		var ct, type, finalDataType, firstDataType,
			contents = s.contents,
			dataTypes = s.dataTypes;

		// Remove auto dataType and get content-type in the process
		while ( dataTypes[ 0 ] === "*" ) {
			dataTypes.shift();
			if ( ct === undefined ) {
				ct = s.mimeType || jqXHR.getResponseHeader( "Content-Type" );
			}
		}

		// Check if we're dealing with a known content-type
		if ( ct ) {
			for ( type in contents ) {
				if ( contents[ type ] && contents[ type ].test( ct ) ) {
					dataTypes.unshift( type );
					break;
				}
			}
		}

		// Check to see if we have a response for the expected dataType
		if ( dataTypes[ 0 ] in responses ) {
			finalDataType = dataTypes[ 0 ];
		} else {

			// Try convertible dataTypes
			for ( type in responses ) {
				if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[ 0 ] ] ) {
					finalDataType = type;
					break;
				}
				if ( !firstDataType ) {
					firstDataType = type;
				}
			}

			// Or just use first one
			finalDataType = finalDataType || firstDataType;
		}

		// If we found a dataType
		// We add the dataType to the list if needed
		// and return the corresponding response
		if ( finalDataType ) {
			if ( finalDataType !== dataTypes[ 0 ] ) {
				dataTypes.unshift( finalDataType );
			}
			return responses[ finalDataType ];
		}
	}

	/* Chain conversions given the request and the original response
	 * Also sets the responseXXX fields on the jqXHR instance
	 */
	function ajaxConvert( s, response, jqXHR, isSuccess ) {
		var conv2, current, conv, tmp, prev,
			converters = {},

			// Work with a copy of dataTypes in case we need to modify it for conversion
			dataTypes = s.dataTypes.slice();

		// Create converters map with lowercased keys
		if ( dataTypes[ 1 ] ) {
			for ( conv in s.converters ) {
				converters[ conv.toLowerCase() ] = s.converters[ conv ];
			}
		}

		current = dataTypes.shift();

		// Convert to each sequential dataType
		while ( current ) {

			if ( s.responseFields[ current ] ) {
				jqXHR[ s.responseFields[ current ] ] = response;
			}

			// Apply the dataFilter if provided
			if ( !prev && isSuccess && s.dataFilter ) {
				response = s.dataFilter( response, s.dataType );
			}

			prev = current;
			current = dataTypes.shift();

			if ( current ) {

			// There's only work to do if current dataType is non-auto
				if ( current === "*" ) {

					current = prev;

				// Convert response if prev dataType is non-auto and differs from current
				} else if ( prev !== "*" && prev !== current ) {

					// Seek a direct converter
					conv = converters[ prev + " " + current ] || converters[ "* " + current ];

					// If none found, seek a pair
					if ( !conv ) {
						for ( conv2 in converters ) {

							// If conv2 outputs current
							tmp = conv2.split( " " );
							if ( tmp[ 1 ] === current ) {

								// If prev can be converted to accepted input
								conv = converters[ prev + " " + tmp[ 0 ] ] ||
									converters[ "* " + tmp[ 0 ] ];
								if ( conv ) {

									// Condense equivalence converters
									if ( conv === true ) {
										conv = converters[ conv2 ];

									// Otherwise, insert the intermediate dataType
									} else if ( converters[ conv2 ] !== true ) {
										current = tmp[ 0 ];
										dataTypes.unshift( tmp[ 1 ] );
									}
									break;
								}
							}
						}
					}

					// Apply converter (if not an equivalence)
					if ( conv !== true ) {

						// Unless errors are allowed to bubble, catch and return them
						if ( conv && s.throws ) {
							response = conv( response );
						} else {
							try {
								response = conv( response );
							} catch ( e ) {
								return {
									state: "parsererror",
									error: conv ? e : "No conversion from " + prev + " to " + current
								};
							}
						}
					}
				}
			}
		}

		return { state: "success", data: response };
	}

	jQuery.extend( {

		// Counter for holding the number of active queries
		active: 0,

		// Last-Modified header cache for next request
		lastModified: {},
		etag: {},

		ajaxSettings: {
			url: location.href,
			type: "GET",
			isLocal: rlocalProtocol.test( location.protocol ),
			global: true,
			processData: true,
			async: true,
			contentType: "application/x-www-form-urlencoded; charset=UTF-8",
			/*
			timeout: 0,
			data: null,
			dataType: null,
			username: null,
			password: null,
			cache: null,
			throws: false,
			traditional: false,
			headers: {},
			*/

			accepts: {
				"*": allTypes,
				text: "text/plain",
				html: "text/html",
				xml: "application/xml, text/xml",
				json: "application/json, text/javascript"
			},

			contents: {
				xml: /\bxml\b/,
				html: /\bhtml/,
				json: /\bjson\b/
			},

			responseFields: {
				xml: "responseXML",
				text: "responseText",
				json: "responseJSON"
			},

			// Data converters
			// Keys separate source (or catchall "*") and destination types with a single space
			converters: {

				// Convert anything to text
				"* text": String,

				// Text to html (true = no transformation)
				"text html": true,

				// Evaluate text as a json expression
				"text json": jQuery.parseJSON,

				// Parse text as xml
				"text xml": jQuery.parseXML
			},

			// For options that shouldn't be deep extended:
			// you can add your own custom options here if
			// and when you create one that shouldn't be
			// deep extended (see ajaxExtend)
			flatOptions: {
				url: true,
				context: true
			}
		},

		// Creates a full fledged settings object into target
		// with both ajaxSettings and settings fields.
		// If target is omitted, writes into ajaxSettings.
		ajaxSetup: function( target, settings ) {
			return settings ?

				// Building a settings object
				ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :

				// Extending ajaxSettings
				ajaxExtend( jQuery.ajaxSettings, target );
		},

		ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
		ajaxTransport: addToPrefiltersOrTransports( transports ),

		// Main method
		ajax: function( url, options ) {

			// If url is an object, simulate pre-1.5 signature
			if ( typeof url === "object" ) {
				options = url;
				url = undefined;
			}

			// Force options to be an object
			options = options || {};

			var transport,

				// URL without anti-cache param
				cacheURL,

				// Response headers
				responseHeadersString,
				responseHeaders,

				// timeout handle
				timeoutTimer,

				// Url cleanup var
				urlAnchor,

				// To know if global events are to be dispatched
				fireGlobals,

				// Loop variable
				i,

				// Create the final options object
				s = jQuery.ajaxSetup( {}, options ),

				// Callbacks context
				callbackContext = s.context || s,

				// Context for global events is callbackContext if it is a DOM node or jQuery collection
				globalEventContext = s.context &&
					( callbackContext.nodeType || callbackContext.jquery ) ?
						jQuery( callbackContext ) :
						jQuery.event,

				// Deferreds
				deferred = jQuery.Deferred(),
				completeDeferred = jQuery.Callbacks( "once memory" ),

				// Status-dependent callbacks
				statusCode = s.statusCode || {},

				// Headers (they are sent all at once)
				requestHeaders = {},
				requestHeadersNames = {},

				// The jqXHR state
				state = 0,

				// Default abort message
				strAbort = "canceled",

				// Fake xhr
				jqXHR = {
					readyState: 0,

					// Builds headers hashtable if needed
					getResponseHeader: function( key ) {
						var match;
						if ( state === 2 ) {
							if ( !responseHeaders ) {
								responseHeaders = {};
								while ( ( match = rheaders.exec( responseHeadersString ) ) ) {
									responseHeaders[ match[ 1 ].toLowerCase() ] = match[ 2 ];
								}
							}
							match = responseHeaders[ key.toLowerCase() ];
						}
						return match == null ? null : match;
					},

					// Raw string
					getAllResponseHeaders: function() {
						return state === 2 ? responseHeadersString : null;
					},

					// Caches the header
					setRequestHeader: function( name, value ) {
						var lname = name.toLowerCase();
						if ( !state ) {
							name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
							requestHeaders[ name ] = value;
						}
						return this;
					},

					// Overrides response content-type header
					overrideMimeType: function( type ) {
						if ( !state ) {
							s.mimeType = type;
						}
						return this;
					},

					// Status-dependent callbacks
					statusCode: function( map ) {
						var code;
						if ( map ) {
							if ( state < 2 ) {
								for ( code in map ) {

									// Lazy-add the new callback in a way that preserves old ones
									statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
								}
							} else {

								// Execute the appropriate callbacks
								jqXHR.always( map[ jqXHR.status ] );
							}
						}
						return this;
					},

					// Cancel the request
					abort: function( statusText ) {
						var finalText = statusText || strAbort;
						if ( transport ) {
							transport.abort( finalText );
						}
						done( 0, finalText );
						return this;
					}
				};

			// Attach deferreds
			deferred.promise( jqXHR ).complete = completeDeferred.add;
			jqXHR.success = jqXHR.done;
			jqXHR.error = jqXHR.fail;

			// Remove hash character (#7531: and string promotion)
			// Add protocol if not provided (prefilters might expect it)
			// Handle falsy url in the settings object (#10093: consistency with old signature)
			// We also use the url parameter if available
			s.url = ( ( url || s.url || location.href ) + "" ).replace( rhash, "" )
				.replace( rprotocol, location.protocol + "//" );

			// Alias method option to type as per ticket #12004
			s.type = options.method || options.type || s.method || s.type;

			// Extract dataTypes list
			s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().match( rnotwhite ) || [ "" ];

			// A cross-domain request is in order when the origin doesn't match the current origin.
			if ( s.crossDomain == null ) {
				urlAnchor = document.createElement( "a" );

				// Support: IE8-11+
				// IE throws exception if url is malformed, e.g. http://example.com:80x/
				try {
					urlAnchor.href = s.url;

					// Support: IE8-11+
					// Anchor's host property isn't correctly set when s.url is relative
					urlAnchor.href = urlAnchor.href;
					s.crossDomain = originAnchor.protocol + "//" + originAnchor.host !==
						urlAnchor.protocol + "//" + urlAnchor.host;
				} catch ( e ) {

					// If there is an error parsing the URL, assume it is crossDomain,
					// it can be rejected by the transport if it is invalid
					s.crossDomain = true;
				}
			}

			// Convert data if not already a string
			if ( s.data && s.processData && typeof s.data !== "string" ) {
				s.data = jQuery.param( s.data, s.traditional );
			}

			// Apply prefilters
			inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

			// If request was aborted inside a prefilter, stop there
			if ( state === 2 ) {
				return jqXHR;
			}

			// We can fire global events as of now if asked to
			// Don't fire events if jQuery.event is undefined in an AMD-usage scenario (#15118)
			fireGlobals = jQuery.event && s.global;

			// Watch for a new set of requests
			if ( fireGlobals && jQuery.active++ === 0 ) {
				jQuery.event.trigger( "ajaxStart" );
			}

			// Uppercase the type
			s.type = s.type.toUpperCase();

			// Determine if request has content
			s.hasContent = !rnoContent.test( s.type );

			// Save the URL in case we're toying with the If-Modified-Since
			// and/or If-None-Match header later on
			cacheURL = s.url;

			// More options handling for requests with no content
			if ( !s.hasContent ) {

				// If data is available, append data to url
				if ( s.data ) {
					cacheURL = ( s.url += ( rquery.test( cacheURL ) ? "&" : "?" ) + s.data );

					// #9682: remove data so that it's not used in an eventual retry
					delete s.data;
				}

				// Add anti-cache in url if needed
				if ( s.cache === false ) {
					s.url = rts.test( cacheURL ) ?

						// If there is already a '_' parameter, set its value
						cacheURL.replace( rts, "$1_=" + nonce++ ) :

						// Otherwise add one to the end
						cacheURL + ( rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + nonce++;
				}
			}

			// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
			if ( s.ifModified ) {
				if ( jQuery.lastModified[ cacheURL ] ) {
					jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
				}
				if ( jQuery.etag[ cacheURL ] ) {
					jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
				}
			}

			// Set the correct header, if data is being sent
			if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
				jqXHR.setRequestHeader( "Content-Type", s.contentType );
			}

			// Set the Accepts header for the server, depending on the dataType
			jqXHR.setRequestHeader(
				"Accept",
				s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[ 0 ] ] ?
					s.accepts[ s.dataTypes[ 0 ] ] +
						( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
					s.accepts[ "*" ]
			);

			// Check for headers option
			for ( i in s.headers ) {
				jqXHR.setRequestHeader( i, s.headers[ i ] );
			}

			// Allow custom headers/mimetypes and early abort
			if ( s.beforeSend &&
				( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {

				// Abort if not done already and return
				return jqXHR.abort();
			}

			// Aborting is no longer a cancellation
			strAbort = "abort";

			// Install callbacks on deferreds
			for ( i in { success: 1, error: 1, complete: 1 } ) {
				jqXHR[ i ]( s[ i ] );
			}

			// Get transport
			transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

			// If no transport, we auto-abort
			if ( !transport ) {
				done( -1, "No Transport" );
			} else {
				jqXHR.readyState = 1;

				// Send global event
				if ( fireGlobals ) {
					globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
				}

				// If request was aborted inside ajaxSend, stop there
				if ( state === 2 ) {
					return jqXHR;
				}

				// Timeout
				if ( s.async && s.timeout > 0 ) {
					timeoutTimer = window.setTimeout( function() {
						jqXHR.abort( "timeout" );
					}, s.timeout );
				}

				try {
					state = 1;
					transport.send( requestHeaders, done );
				} catch ( e ) {

					// Propagate exception as error if not done
					if ( state < 2 ) {
						done( -1, e );

					// Simply rethrow otherwise
					} else {
						throw e;
					}
				}
			}

			// Callback for when everything is done
			function done( status, nativeStatusText, responses, headers ) {
				var isSuccess, success, error, response, modified,
					statusText = nativeStatusText;

				// Called once
				if ( state === 2 ) {
					return;
				}

				// State is "done" now
				state = 2;

				// Clear timeout if it exists
				if ( timeoutTimer ) {
					window.clearTimeout( timeoutTimer );
				}

				// Dereference transport for early garbage collection
				// (no matter how long the jqXHR object will be used)
				transport = undefined;

				// Cache response headers
				responseHeadersString = headers || "";

				// Set readyState
				jqXHR.readyState = status > 0 ? 4 : 0;

				// Determine if successful
				isSuccess = status >= 200 && status < 300 || status === 304;

				// Get response data
				if ( responses ) {
					response = ajaxHandleResponses( s, jqXHR, responses );
				}

				// Convert no matter what (that way responseXXX fields are always set)
				response = ajaxConvert( s, response, jqXHR, isSuccess );

				// If successful, handle type chaining
				if ( isSuccess ) {

					// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
					if ( s.ifModified ) {
						modified = jqXHR.getResponseHeader( "Last-Modified" );
						if ( modified ) {
							jQuery.lastModified[ cacheURL ] = modified;
						}
						modified = jqXHR.getResponseHeader( "etag" );
						if ( modified ) {
							jQuery.etag[ cacheURL ] = modified;
						}
					}

					// if no content
					if ( status === 204 || s.type === "HEAD" ) {
						statusText = "nocontent";

					// if not modified
					} else if ( status === 304 ) {
						statusText = "notmodified";

					// If we have data, let's convert it
					} else {
						statusText = response.state;
						success = response.data;
						error = response.error;
						isSuccess = !error;
					}
				} else {

					// Extract error from statusText and normalize for non-aborts
					error = statusText;
					if ( status || !statusText ) {
						statusText = "error";
						if ( status < 0 ) {
							status = 0;
						}
					}
				}

				// Set data for the fake xhr object
				jqXHR.status = status;
				jqXHR.statusText = ( nativeStatusText || statusText ) + "";

				// Success/Error
				if ( isSuccess ) {
					deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
				} else {
					deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
				}

				// Status-dependent callbacks
				jqXHR.statusCode( statusCode );
				statusCode = undefined;

				if ( fireGlobals ) {
					globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
						[ jqXHR, s, isSuccess ? success : error ] );
				}

				// Complete
				completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

				if ( fireGlobals ) {
					globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );

					// Handle the global AJAX counter
					if ( !( --jQuery.active ) ) {
						jQuery.event.trigger( "ajaxStop" );
					}
				}
			}

			return jqXHR;
		},

		getJSON: function( url, data, callback ) {
			return jQuery.get( url, data, callback, "json" );
		},

		getScript: function( url, callback ) {
			return jQuery.get( url, undefined, callback, "script" );
		}
	} );

	jQuery.each( [ "get", "post" ], function( i, method ) {
		jQuery[ method ] = function( url, data, callback, type ) {

			// Shift arguments if data argument was omitted
			if ( jQuery.isFunction( data ) ) {
				type = type || callback;
				callback = data;
				data = undefined;
			}

			// The url can be an options object (which then must have .url)
			return jQuery.ajax( jQuery.extend( {
				url: url,
				type: method,
				dataType: type,
				data: data,
				success: callback
			}, jQuery.isPlainObject( url ) && url ) );
		};
	} );


	jQuery._evalUrl = function( url ) {
		return jQuery.ajax( {
			url: url,

			// Make this explicit, since user can override this through ajaxSetup (#11264)
			type: "GET",
			dataType: "script",
			async: false,
			global: false,
			"throws": true
		} );
	};


	jQuery.fn.extend( {
		wrapAll: function( html ) {
			var wrap;

			if ( jQuery.isFunction( html ) ) {
				return this.each( function( i ) {
					jQuery( this ).wrapAll( html.call( this, i ) );
				} );
			}

			if ( this[ 0 ] ) {

				// The elements to wrap the target around
				wrap = jQuery( html, this[ 0 ].ownerDocument ).eq( 0 ).clone( true );

				if ( this[ 0 ].parentNode ) {
					wrap.insertBefore( this[ 0 ] );
				}

				wrap.map( function() {
					var elem = this;

					while ( elem.firstElementChild ) {
						elem = elem.firstElementChild;
					}

					return elem;
				} ).append( this );
			}

			return this;
		},

		wrapInner: function( html ) {
			if ( jQuery.isFunction( html ) ) {
				return this.each( function( i ) {
					jQuery( this ).wrapInner( html.call( this, i ) );
				} );
			}

			return this.each( function() {
				var self = jQuery( this ),
					contents = self.contents();

				if ( contents.length ) {
					contents.wrapAll( html );

				} else {
					self.append( html );
				}
			} );
		},

		wrap: function( html ) {
			var isFunction = jQuery.isFunction( html );

			return this.each( function( i ) {
				jQuery( this ).wrapAll( isFunction ? html.call( this, i ) : html );
			} );
		},

		unwrap: function() {
			return this.parent().each( function() {
				if ( !jQuery.nodeName( this, "body" ) ) {
					jQuery( this ).replaceWith( this.childNodes );
				}
			} ).end();
		}
	} );


	jQuery.expr.filters.hidden = function( elem ) {
		return !jQuery.expr.filters.visible( elem );
	};
	jQuery.expr.filters.visible = function( elem ) {

		// Support: Opera <= 12.12
		// Opera reports offsetWidths and offsetHeights less than zero on some elements
		// Use OR instead of AND as the element is not visible if either is true
		// See tickets #10406 and #13132
		return elem.offsetWidth > 0 || elem.offsetHeight > 0 || elem.getClientRects().length > 0;
	};




	var r20 = /%20/g,
		rbracket = /\[\]$/,
		rCRLF = /\r?\n/g,
		rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
		rsubmittable = /^(?:input|select|textarea|keygen)/i;

	function buildParams( prefix, obj, traditional, add ) {
		var name;

		if ( jQuery.isArray( obj ) ) {

			// Serialize array item.
			jQuery.each( obj, function( i, v ) {
				if ( traditional || rbracket.test( prefix ) ) {

					// Treat each array item as a scalar.
					add( prefix, v );

				} else {

					// Item is non-scalar (array or object), encode its numeric index.
					buildParams(
						prefix + "[" + ( typeof v === "object" && v != null ? i : "" ) + "]",
						v,
						traditional,
						add
					);
				}
			} );

		} else if ( !traditional && jQuery.type( obj ) === "object" ) {

			// Serialize object item.
			for ( name in obj ) {
				buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
			}

		} else {

			// Serialize scalar item.
			add( prefix, obj );
		}
	}

	// Serialize an array of form elements or a set of
	// key/values into a query string
	jQuery.param = function( a, traditional ) {
		var prefix,
			s = [],
			add = function( key, value ) {

				// If value is a function, invoke it and return its value
				value = jQuery.isFunction( value ) ? value() : ( value == null ? "" : value );
				s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
			};

		// Set traditional to true for jQuery <= 1.3.2 behavior.
		if ( traditional === undefined ) {
			traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
		}

		// If an array was passed in, assume that it is an array of form elements.
		if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {

			// Serialize the form elements
			jQuery.each( a, function() {
				add( this.name, this.value );
			} );

		} else {

			// If traditional, encode the "old" way (the way 1.3.2 or older
			// did it), otherwise encode params recursively.
			for ( prefix in a ) {
				buildParams( prefix, a[ prefix ], traditional, add );
			}
		}

		// Return the resulting serialization
		return s.join( "&" ).replace( r20, "+" );
	};

	jQuery.fn.extend( {
		serialize: function() {
			return jQuery.param( this.serializeArray() );
		},
		serializeArray: function() {
			return this.map( function() {

				// Can add propHook for "elements" to filter or add form elements
				var elements = jQuery.prop( this, "elements" );
				return elements ? jQuery.makeArray( elements ) : this;
			} )
			.filter( function() {
				var type = this.type;

				// Use .is( ":disabled" ) so that fieldset[disabled] works
				return this.name && !jQuery( this ).is( ":disabled" ) &&
					rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
					( this.checked || !rcheckableType.test( type ) );
			} )
			.map( function( i, elem ) {
				var val = jQuery( this ).val();

				return val == null ?
					null :
					jQuery.isArray( val ) ?
						jQuery.map( val, function( val ) {
							return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
						} ) :
						{ name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
			} ).get();
		}
	} );


	jQuery.ajaxSettings.xhr = function() {
		try {
			return new window.XMLHttpRequest();
		} catch ( e ) {}
	};

	var xhrSuccessStatus = {

			// File protocol always yields status code 0, assume 200
			0: 200,

			// Support: IE9
			// #1450: sometimes IE returns 1223 when it should be 204
			1223: 204
		},
		xhrSupported = jQuery.ajaxSettings.xhr();

	support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
	support.ajax = xhrSupported = !!xhrSupported;

	jQuery.ajaxTransport( function( options ) {
		var callback, errorCallback;

		// Cross domain only allowed if supported through XMLHttpRequest
		if ( support.cors || xhrSupported && !options.crossDomain ) {
			return {
				send: function( headers, complete ) {
					var i,
						xhr = options.xhr();

					xhr.open(
						options.type,
						options.url,
						options.async,
						options.username,
						options.password
					);

					// Apply custom fields if provided
					if ( options.xhrFields ) {
						for ( i in options.xhrFields ) {
							xhr[ i ] = options.xhrFields[ i ];
						}
					}

					// Override mime type if needed
					if ( options.mimeType && xhr.overrideMimeType ) {
						xhr.overrideMimeType( options.mimeType );
					}

					// X-Requested-With header
					// For cross-domain requests, seeing as conditions for a preflight are
					// akin to a jigsaw puzzle, we simply never set it to be sure.
					// (it can always be set on a per-request basis or even using ajaxSetup)
					// For same-domain requests, won't change header if already provided.
					if ( !options.crossDomain && !headers[ "X-Requested-With" ] ) {
						headers[ "X-Requested-With" ] = "XMLHttpRequest";
					}

					// Set headers
					for ( i in headers ) {
						xhr.setRequestHeader( i, headers[ i ] );
					}

					// Callback
					callback = function( type ) {
						return function() {
							if ( callback ) {
								callback = errorCallback = xhr.onload =
									xhr.onerror = xhr.onabort = xhr.onreadystatechange = null;

								if ( type === "abort" ) {
									xhr.abort();
								} else if ( type === "error" ) {

									// Support: IE9
									// On a manual native abort, IE9 throws
									// errors on any property access that is not readyState
									if ( typeof xhr.status !== "number" ) {
										complete( 0, "error" );
									} else {
										complete(

											// File: protocol always yields status 0; see #8605, #14207
											xhr.status,
											xhr.statusText
										);
									}
								} else {
									complete(
										xhrSuccessStatus[ xhr.status ] || xhr.status,
										xhr.statusText,

										// Support: IE9 only
										// IE9 has no XHR2 but throws on binary (trac-11426)
										// For XHR2 non-text, let the caller handle it (gh-2498)
										( xhr.responseType || "text" ) !== "text"  ||
										typeof xhr.responseText !== "string" ?
											{ binary: xhr.response } :
											{ text: xhr.responseText },
										xhr.getAllResponseHeaders()
									);
								}
							}
						};
					};

					// Listen to events
					xhr.onload = callback();
					errorCallback = xhr.onerror = callback( "error" );

					// Support: IE9
					// Use onreadystatechange to replace onabort
					// to handle uncaught aborts
					if ( xhr.onabort !== undefined ) {
						xhr.onabort = errorCallback;
					} else {
						xhr.onreadystatechange = function() {

							// Check readyState before timeout as it changes
							if ( xhr.readyState === 4 ) {

								// Allow onerror to be called first,
								// but that will not handle a native abort
								// Also, save errorCallback to a variable
								// as xhr.onerror cannot be accessed
								window.setTimeout( function() {
									if ( callback ) {
										errorCallback();
									}
								} );
							}
						};
					}

					// Create the abort callback
					callback = callback( "abort" );

					try {

						// Do send the request (this may raise an exception)
						xhr.send( options.hasContent && options.data || null );
					} catch ( e ) {

						// #14683: Only rethrow if this hasn't been notified as an error yet
						if ( callback ) {
							throw e;
						}
					}
				},

				abort: function() {
					if ( callback ) {
						callback();
					}
				}
			};
		}
	} );




	// Install script dataType
	jQuery.ajaxSetup( {
		accepts: {
			script: "text/javascript, application/javascript, " +
				"application/ecmascript, application/x-ecmascript"
		},
		contents: {
			script: /\b(?:java|ecma)script\b/
		},
		converters: {
			"text script": function( text ) {
				jQuery.globalEval( text );
				return text;
			}
		}
	} );

	// Handle cache's special case and crossDomain
	jQuery.ajaxPrefilter( "script", function( s ) {
		if ( s.cache === undefined ) {
			s.cache = false;
		}
		if ( s.crossDomain ) {
			s.type = "GET";
		}
	} );

	// Bind script tag hack transport
	jQuery.ajaxTransport( "script", function( s ) {

		// This transport only deals with cross domain requests
		if ( s.crossDomain ) {
			var script, callback;
			return {
				send: function( _, complete ) {
					script = jQuery( "<script>" ).prop( {
						charset: s.scriptCharset,
						src: s.url
					} ).on(
						"load error",
						callback = function( evt ) {
							script.remove();
							callback = null;
							if ( evt ) {
								complete( evt.type === "error" ? 404 : 200, evt.type );
							}
						}
					);

					// Use native DOM manipulation to avoid our domManip AJAX trickery
					document.head.appendChild( script[ 0 ] );
				},
				abort: function() {
					if ( callback ) {
						callback();
					}
				}
			};
		}
	} );




	var oldCallbacks = [],
		rjsonp = /(=)\?(?=&|$)|\?\?/;

	// Default jsonp settings
	jQuery.ajaxSetup( {
		jsonp: "callback",
		jsonpCallback: function() {
			var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( nonce++ ) );
			this[ callback ] = true;
			return callback;
		}
	} );

	// Detect, normalize options and install callbacks for jsonp requests
	jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

		var callbackName, overwritten, responseContainer,
			jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
				"url" :
				typeof s.data === "string" &&
					( s.contentType || "" )
						.indexOf( "application/x-www-form-urlencoded" ) === 0 &&
					rjsonp.test( s.data ) && "data"
			);

		// Handle iff the expected data type is "jsonp" or we have a parameter to set
		if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {

			// Get callback name, remembering preexisting value associated with it
			callbackName = s.jsonpCallback = jQuery.isFunction( s.jsonpCallback ) ?
				s.jsonpCallback() :
				s.jsonpCallback;

			// Insert callback into url or form data
			if ( jsonProp ) {
				s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
			} else if ( s.jsonp !== false ) {
				s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
			}

			// Use data converter to retrieve json after script execution
			s.converters[ "script json" ] = function() {
				if ( !responseContainer ) {
					jQuery.error( callbackName + " was not called" );
				}
				return responseContainer[ 0 ];
			};

			// Force json dataType
			s.dataTypes[ 0 ] = "json";

			// Install callback
			overwritten = window[ callbackName ];
			window[ callbackName ] = function() {
				responseContainer = arguments;
			};

			// Clean-up function (fires after converters)
			jqXHR.always( function() {

				// If previous value didn't exist - remove it
				if ( overwritten === undefined ) {
					jQuery( window ).removeProp( callbackName );

				// Otherwise restore preexisting value
				} else {
					window[ callbackName ] = overwritten;
				}

				// Save back as free
				if ( s[ callbackName ] ) {

					// Make sure that re-using the options doesn't screw things around
					s.jsonpCallback = originalSettings.jsonpCallback;

					// Save the callback name for future use
					oldCallbacks.push( callbackName );
				}

				// Call if it was a function and we have a response
				if ( responseContainer && jQuery.isFunction( overwritten ) ) {
					overwritten( responseContainer[ 0 ] );
				}

				responseContainer = overwritten = undefined;
			} );

			// Delegate to script
			return "script";
		}
	} );




	// Argument "data" should be string of html
	// context (optional): If specified, the fragment will be created in this context,
	// defaults to document
	// keepScripts (optional): If true, will include scripts passed in the html string
	jQuery.parseHTML = function( data, context, keepScripts ) {
		if ( !data || typeof data !== "string" ) {
			return null;
		}
		if ( typeof context === "boolean" ) {
			keepScripts = context;
			context = false;
		}
		context = context || document;

		var parsed = rsingleTag.exec( data ),
			scripts = !keepScripts && [];

		// Single tag
		if ( parsed ) {
			return [ context.createElement( parsed[ 1 ] ) ];
		}

		parsed = buildFragment( [ data ], context, scripts );

		if ( scripts && scripts.length ) {
			jQuery( scripts ).remove();
		}

		return jQuery.merge( [], parsed.childNodes );
	};


	// Keep a copy of the old load method
	var _load = jQuery.fn.load;

	/**
	 * Load a url into a page
	 */
	jQuery.fn.load = function( url, params, callback ) {
		if ( typeof url !== "string" && _load ) {
			return _load.apply( this, arguments );
		}

		var selector, type, response,
			self = this,
			off = url.indexOf( " " );

		if ( off > -1 ) {
			selector = jQuery.trim( url.slice( off ) );
			url = url.slice( 0, off );
		}

		// If it's a function
		if ( jQuery.isFunction( params ) ) {

			// We assume that it's the callback
			callback = params;
			params = undefined;

		// Otherwise, build a param string
		} else if ( params && typeof params === "object" ) {
			type = "POST";
		}

		// If we have elements to modify, make the request
		if ( self.length > 0 ) {
			jQuery.ajax( {
				url: url,

				// If "type" variable is undefined, then "GET" method will be used.
				// Make value of this field explicit since
				// user can override it through ajaxSetup method
				type: type || "GET",
				dataType: "html",
				data: params
			} ).done( function( responseText ) {

				// Save response for use in complete callback
				response = arguments;

				self.html( selector ?

					// If a selector was specified, locate the right elements in a dummy div
					// Exclude scripts to avoid IE 'Permission Denied' errors
					jQuery( "<div>" ).append( jQuery.parseHTML( responseText ) ).find( selector ) :

					// Otherwise use the full result
					responseText );

			// If the request succeeds, this function gets "data", "status", "jqXHR"
			// but they are ignored because response was set above.
			// If it fails, this function gets "jqXHR", "status", "error"
			} ).always( callback && function( jqXHR, status ) {
				self.each( function() {
					callback.apply( this, response || [ jqXHR.responseText, status, jqXHR ] );
				} );
			} );
		}

		return this;
	};




	// Attach a bunch of functions for handling common AJAX events
	jQuery.each( [
		"ajaxStart",
		"ajaxStop",
		"ajaxComplete",
		"ajaxError",
		"ajaxSuccess",
		"ajaxSend"
	], function( i, type ) {
		jQuery.fn[ type ] = function( fn ) {
			return this.on( type, fn );
		};
	} );




	jQuery.expr.filters.animated = function( elem ) {
		return jQuery.grep( jQuery.timers, function( fn ) {
			return elem === fn.elem;
		} ).length;
	};




	/**
	 * Gets a window from an element
	 */
	function getWindow( elem ) {
		return jQuery.isWindow( elem ) ? elem : elem.nodeType === 9 && elem.defaultView;
	}

	jQuery.offset = {
		setOffset: function( elem, options, i ) {
			var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
				position = jQuery.css( elem, "position" ),
				curElem = jQuery( elem ),
				props = {};

			// Set position first, in-case top/left are set even on static elem
			if ( position === "static" ) {
				elem.style.position = "relative";
			}

			curOffset = curElem.offset();
			curCSSTop = jQuery.css( elem, "top" );
			curCSSLeft = jQuery.css( elem, "left" );
			calculatePosition = ( position === "absolute" || position === "fixed" ) &&
				( curCSSTop + curCSSLeft ).indexOf( "auto" ) > -1;

			// Need to be able to calculate position if either
			// top or left is auto and position is either absolute or fixed
			if ( calculatePosition ) {
				curPosition = curElem.position();
				curTop = curPosition.top;
				curLeft = curPosition.left;

			} else {
				curTop = parseFloat( curCSSTop ) || 0;
				curLeft = parseFloat( curCSSLeft ) || 0;
			}

			if ( jQuery.isFunction( options ) ) {

				// Use jQuery.extend here to allow modification of coordinates argument (gh-1848)
				options = options.call( elem, i, jQuery.extend( {}, curOffset ) );
			}

			if ( options.top != null ) {
				props.top = ( options.top - curOffset.top ) + curTop;
			}
			if ( options.left != null ) {
				props.left = ( options.left - curOffset.left ) + curLeft;
			}

			if ( "using" in options ) {
				options.using.call( elem, props );

			} else {
				curElem.css( props );
			}
		}
	};

	jQuery.fn.extend( {
		offset: function( options ) {
			if ( arguments.length ) {
				return options === undefined ?
					this :
					this.each( function( i ) {
						jQuery.offset.setOffset( this, options, i );
					} );
			}

			var docElem, win,
				elem = this[ 0 ],
				box = { top: 0, left: 0 },
				doc = elem && elem.ownerDocument;

			if ( !doc ) {
				return;
			}

			docElem = doc.documentElement;

			// Make sure it's not a disconnected DOM node
			if ( !jQuery.contains( docElem, elem ) ) {
				return box;
			}

			box = elem.getBoundingClientRect();
			win = getWindow( doc );
			return {
				top: box.top + win.pageYOffset - docElem.clientTop,
				left: box.left + win.pageXOffset - docElem.clientLeft
			};
		},

		position: function() {
			if ( !this[ 0 ] ) {
				return;
			}

			var offsetParent, offset,
				elem = this[ 0 ],
				parentOffset = { top: 0, left: 0 };

			// Fixed elements are offset from window (parentOffset = {top:0, left: 0},
			// because it is its only offset parent
			if ( jQuery.css( elem, "position" ) === "fixed" ) {

				// Assume getBoundingClientRect is there when computed position is fixed
				offset = elem.getBoundingClientRect();

			} else {

				// Get *real* offsetParent
				offsetParent = this.offsetParent();

				// Get correct offsets
				offset = this.offset();
				if ( !jQuery.nodeName( offsetParent[ 0 ], "html" ) ) {
					parentOffset = offsetParent.offset();
				}

				// Add offsetParent borders
				parentOffset.top += jQuery.css( offsetParent[ 0 ], "borderTopWidth", true );
				parentOffset.left += jQuery.css( offsetParent[ 0 ], "borderLeftWidth", true );
			}

			// Subtract parent offsets and element margins
			return {
				top: offset.top - parentOffset.top - jQuery.css( elem, "marginTop", true ),
				left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true )
			};
		},

		// This method will return documentElement in the following cases:
		// 1) For the element inside the iframe without offsetParent, this method will return
		//    documentElement of the parent window
		// 2) For the hidden or detached element
		// 3) For body or html element, i.e. in case of the html node - it will return itself
		//
		// but those exceptions were never presented as a real life use-cases
		// and might be considered as more preferable results.
		//
		// This logic, however, is not guaranteed and can change at any point in the future
		offsetParent: function() {
			return this.map( function() {
				var offsetParent = this.offsetParent;

				while ( offsetParent && jQuery.css( offsetParent, "position" ) === "static" ) {
					offsetParent = offsetParent.offsetParent;
				}

				return offsetParent || documentElement;
			} );
		}
	} );

	// Create scrollLeft and scrollTop methods
	jQuery.each( { scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function( method, prop ) {
		var top = "pageYOffset" === prop;

		jQuery.fn[ method ] = function( val ) {
			return access( this, function( elem, method, val ) {
				var win = getWindow( elem );

				if ( val === undefined ) {
					return win ? win[ prop ] : elem[ method ];
				}

				if ( win ) {
					win.scrollTo(
						!top ? val : win.pageXOffset,
						top ? val : win.pageYOffset
					);

				} else {
					elem[ method ] = val;
				}
			}, method, val, arguments.length );
		};
	} );

	// Support: Safari<7-8+, Chrome<37-44+
	// Add the top/left cssHooks using jQuery.fn.position
	// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
	// Blink bug: https://code.google.com/p/chromium/issues/detail?id=229280
	// getComputedStyle returns percent when specified for top/left/bottom/right;
	// rather than make the css module depend on the offset module, just check for it here
	jQuery.each( [ "top", "left" ], function( i, prop ) {
		jQuery.cssHooks[ prop ] = addGetHookIf( support.pixelPosition,
			function( elem, computed ) {
				if ( computed ) {
					computed = curCSS( elem, prop );

					// If curCSS returns percentage, fallback to offset
					return rnumnonpx.test( computed ) ?
						jQuery( elem ).position()[ prop ] + "px" :
						computed;
				}
			}
		);
	} );


	// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
	jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
		jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name },
			function( defaultExtra, funcName ) {

			// Margin is only for outerHeight, outerWidth
			jQuery.fn[ funcName ] = function( margin, value ) {
				var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
					extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

				return access( this, function( elem, type, value ) {
					var doc;

					if ( jQuery.isWindow( elem ) ) {

						// As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there
						// isn't a whole lot we can do. See pull request at this URL for discussion:
						// https://github.com/jquery/jquery/pull/764
						return elem.document.documentElement[ "client" + name ];
					}

					// Get document width or height
					if ( elem.nodeType === 9 ) {
						doc = elem.documentElement;

						// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
						// whichever is greatest
						return Math.max(
							elem.body[ "scroll" + name ], doc[ "scroll" + name ],
							elem.body[ "offset" + name ], doc[ "offset" + name ],
							doc[ "client" + name ]
						);
					}

					return value === undefined ?

						// Get width or height on the element, requesting but not forcing parseFloat
						jQuery.css( elem, type, extra ) :

						// Set width or height on the element
						jQuery.style( elem, type, value, extra );
				}, type, chainable ? margin : undefined, chainable, null );
			};
		} );
	} );


	jQuery.fn.extend( {

		bind: function( types, data, fn ) {
			return this.on( types, null, data, fn );
		},
		unbind: function( types, fn ) {
			return this.off( types, null, fn );
		},

		delegate: function( selector, types, data, fn ) {
			return this.on( types, selector, data, fn );
		},
		undelegate: function( selector, types, fn ) {

			// ( namespace ) or ( selector, types [, fn] )
			return arguments.length === 1 ?
				this.off( selector, "**" ) :
				this.off( types, selector || "**", fn );
		},
		size: function() {
			return this.length;
		}
	} );

	jQuery.fn.andSelf = jQuery.fn.addBack;




	// Register as a named AMD module, since jQuery can be concatenated with other
	// files that may use define, but not via a proper concatenation script that
	// understands anonymous AMD modules. A named AMD is safest and most robust
	// way to register. Lowercase jquery is used because AMD module names are
	// derived from file names, and jQuery is normally delivered in a lowercase
	// file name. Do this after creating the global so that if an AMD module wants
	// to call noConflict to hide this version of jQuery, it will work.

	// Note that for maximum portability, libraries that are not jQuery should
	// declare themselves as anonymous modules, and avoid setting a global if an
	// AMD loader is present. jQuery is a special case. For more information, see
	// https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon

	if ( true ) {
		!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function() {
			return jQuery;
		}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	}



	var

		// Map over jQuery in case of overwrite
		_jQuery = window.jQuery,

		// Map over the $ in case of overwrite
		_$ = window.$;

	jQuery.noConflict = function( deep ) {
		if ( window.$ === jQuery ) {
			window.$ = _$;
		}

		if ( deep && window.jQuery === jQuery ) {
			window.jQuery = _jQuery;
		}

		return jQuery;
	};

	// Expose jQuery and $ identifiers, even in AMD
	// (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
	// and CommonJS for browser emulators (#13566)
	if ( !noGlobal ) {
		window.jQuery = window.$ = jQuery;
	}

	return jQuery;
	}));


/***/ },

/***/ 193:
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {module.exports = global["Resample"] = __webpack_require__(194);
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },

/***/ 194:
/***/ function(module, exports) {

	/*** IMPORTS FROM imports-loader ***/
	(function() {

	var Resample = (function (canvas) {

	 // (C) WebReflection Mit Style License

	 // Resample function, accepts an image
	 // as url, base64 string, or Image/HTMLImgElement
	 // optional width or height, and a callback
	 // to invoke on operation complete
	 function Resample(img, width, height, onresample) {
	  var
	   // check the image type
	   load = typeof img == "string",
	   // Image pointer
	   i = load || img
	  ;
	  // if string, a new Image is needed
	  if (load) {
	   i = new Image;
	   // with propers callbacks
	   i.onload = onload;
	   i.onerror = onerror;
	  }
	  // easy/cheap way to store info
	  i._onresample = onresample;
	  i._width = width;
	  i._height = height;
	  // if string, we trust the onload event
	  // otherwise we call onload directly
	  // with the image as callback context
	  load ? (i.src = img) : onload.call(img);
	 }
	 
	 // just in case something goes wrong
	 function onerror() {
	  throw ("not found: " + this.src);
	 }
	 
	 // called when the Image is ready
	 function onload() {
	  var
	   // minifier friendly
	   img = this,
	   // the desired width, if any
	   width = img._width,
	   // the desired height, if any
	   height = img._height,
	   // the callback
	   onresample = img._onresample
	  ;
	  // if width and height are both specified
	  // the resample uses these pixels
	  // if width is specified but not the height
	  // the resample respects proportions
	  // accordingly with orginal size
	  // same is if there is a height, but no width
	  width == null && (width = round(img.width * height / img.height));
	  height == null && (height = round(img.height * width / img.width));
	  // remove (hopefully) stored info
	  delete img._onresample;
	  delete img._width;
	  delete img._height;
	  // when we reassign a canvas size
	  // this clears automatically
	  // the size should be exactly the same
	  // of the final image
	  // so that toDataURL ctx method
	  // will return the whole canvas as png
	  // without empty spaces or lines
	  canvas.width = width;
	  canvas.height = height;
	  // drawImage has different overloads
	  // in this case we need the following one ...
	  context.drawImage(
	   // original image
	   img,
	   // starting x point
	   0,
	   // starting y point
	   0,
	   // image width
	   img.width,
	   // image height
	   img.height,
	   // destination x point
	   0,
	   // destination y point
	   0,
	   // destination width
	   width,
	   // destination height
	   height
	  );
	  // retrieve the canvas content as
	  // base4 encoded PNG image
	  // and pass the result to the callback
	  onresample(canvas.toDataURL("image/png"));
	 }
	 
	 var
	  // point one, use every time ...
	  context = canvas.getContext("2d"),
	  // local scope shortcut
	  round = Math.round
	 ;
	 
	 return Resample;
	 
	}(
	 // lucky us we don't even need to append
	 // and render anything on the screen
	 // let's keep this DOM node in RAM
	 // for all resizes we want
	 this.document.createElement("canvas"))
	);


	/*** EXPORTS FROM exports-loader ***/
	module.exports = Resample
	}.call(window));

/***/ },

/***/ 195:
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(console) {var idbModules = {  // jshint ignore:line
	    util: {
	        cleanInterface: false
	    }
	};

	(function () {
	    'use strict';

	    var testObject = {test: true};
	    //Test whether Object.defineProperty really works.
	    if (Object.defineProperty) {
	        try {
	            Object.defineProperty(testObject, 'test', { enumerable: false });
	            if (testObject.test) {
	                idbModules.util.cleanInterface = true;      // jshint ignore:line
	            }
	        } catch (e) {
	        //Object.defineProperty does not work as intended.
	        }
	    }
	})();

	(function(idbModules) {
	    'use strict';

	    /**
	     * A utility method to callback onsuccess, onerror, etc as soon as the calling function's context is over
	     * @param {Object} fn
	     * @param {Object} context
	     * @param {Object} argArray
	     */
	    function callback(fn, context, event) {
	        //window.setTimeout(function(){
	        event.target = context;
	        (typeof context[fn] === "function") && context[fn].apply(context, [event]);
	        //}, 1);
	    }

	    /**
	     * Shim the DOMStringList object.
	     *
	     */
	    var StringList = function() {
	        this.length = 0;
	        this._items = [];
	        //Internal functions on the prototype have been made non-enumerable below.
	        if (idbModules.util.cleanInterface) {
	            Object.defineProperty(this, '_items', {
	                enumerable: false
	            });
	        }
	    };
	    StringList.prototype = {
	        // Interface.
	        contains: function(str) {
	            return -1 !== this._items.indexOf(str);
	        },
	        item: function(key) {
	            return this._items[key];
	        },

	        // Helpers. Should only be used internally.
	        indexOf: function(str) {
	            return this._items.indexOf(str);
	        },
	        push: function(item) {
	            this._items.push(item);
	            this.length += 1;
	            for (var i = 0; i < this._items.length; i++) {
	                this[i] = this._items[i];
	            }
	        },
	        splice: function(/*index, howmany, item1, ..., itemX*/) {
	            this._items.splice.apply(this._items, arguments);
	            this.length = this._items.length;
	            for (var i in this) {
	                if (i === String(parseInt(i, 10))) {
	                    delete this[i];
	                }
	            }
	            for (i = 0; i < this._items.length; i++) {
	                this[i] = this._items[i];
	            }
	        }
	    };
	    if (idbModules.util.cleanInterface) {
	        for (var i in {
	            'indexOf': false,
	            'push': false,
	            'splice': false
	        }) {
	            Object.defineProperty(StringList.prototype, i, {
	                enumerable: false
	            });
	        }
	    }

	    idbModules.util.callback = callback;
	    idbModules.util.StringList = StringList;
	    idbModules.util.quote = function(arg) {
	        return "\"" + arg + "\"";
	    };

	}(idbModules));

	(function (idbModules) {
	    'use strict';

	    /**
	     * Polyfills missing features in the browser's native IndexedDB implementation.
	     * This is used for browsers that DON'T support WebSQL but DO support IndexedDB
	     */
	    function polyfill() {
	        if (navigator.userAgent.match(/MSIE/) ||
	            navigator.userAgent.match(/Trident/) ||
	            navigator.userAgent.match(/Edge/)) {
	            // Internet Explorer's native IndexedDB does not support compound keys
	            compoundKeyPolyfill();
	        }
	    }

	    /**
	     * Polyfills support for compound keys
	     */
	    function compoundKeyPolyfill() {
	        var cmp = IDBFactory.prototype.cmp;
	        var createObjectStore = IDBDatabase.prototype.createObjectStore;
	        var createIndex = IDBObjectStore.prototype.createIndex;
	        var add = IDBObjectStore.prototype.add;
	        var put = IDBObjectStore.prototype.put;
	        var indexGet = IDBIndex.prototype.get;
	        var indexGetKey = IDBIndex.prototype.getKey;
	        var indexCursor = IDBIndex.prototype.openCursor;
	        var indexKeyCursor = IDBIndex.prototype.openKeyCursor;
	        var storeGet = IDBObjectStore.prototype.get;
	        var storeDelete = IDBObjectStore.prototype.delete;
	        var storeCursor = IDBObjectStore.prototype.openCursor;
	        var storeKeyCursor = IDBObjectStore.prototype.openKeyCursor;
	        var bound = IDBKeyRange.bound;
	        var upperBound = IDBKeyRange.upperBound;
	        var lowerBound = IDBKeyRange.lowerBound;
	        var only = IDBKeyRange.only;
	        var requestResult = Object.getOwnPropertyDescriptor(IDBRequest.prototype, 'result');
	        var cursorPrimaryKey = Object.getOwnPropertyDescriptor(IDBCursor.prototype, 'primaryKey');
	        var cursorKey = Object.getOwnPropertyDescriptor(IDBCursor.prototype, 'key');
	        var cursorValue = Object.getOwnPropertyDescriptor(IDBCursorWithValue.prototype, 'value');

	        IDBFactory.prototype.cmp = function(key1, key2) {
	            var args = Array.prototype.slice.call(arguments);
	            if (key1 instanceof Array) {
	                args[0] = encodeCompoundKey(key1);
	            }
	            if (key2 instanceof Array) {
	                args[1] = encodeCompoundKey(key2);
	            }
	            return cmp.apply(this, args);
	        };

	        IDBDatabase.prototype.createObjectStore = function(name, opts) {
	            if (opts && opts.keyPath instanceof Array) {
	                opts.keyPath = encodeCompoundKeyPath(opts.keyPath);
	            }
	            return createObjectStore.apply(this, arguments);
	        };

	        IDBObjectStore.prototype.createIndex = function(name, keyPath, opts) {
	            var args = Array.prototype.slice.call(arguments);
	            if (keyPath instanceof Array) {
	                args[1] = encodeCompoundKeyPath(keyPath);
	            }
	            return createIndex.apply(this, args);
	        };

	        IDBObjectStore.prototype.add = function(value, key) {
	            return this.__insertData(add, arguments);
	        };

	        IDBObjectStore.prototype.put = function(value, key) {
	            return this.__insertData(put, arguments);
	        };

	        IDBObjectStore.prototype.__insertData = function(method, args) {
	            args = Array.prototype.slice.call(args);
	            var value = args[0];
	            var key = args[1];

	            // out-of-line key
	            if (key instanceof Array) {
	                args[1] = encodeCompoundKey(key);
	            }

	            if (typeof value === 'object') {
	                // inline key
	                if (isCompoundKey(this.keyPath)) {
	                    setInlineCompoundKey(value, this.keyPath);
	                }

	                // inline indexes
	                for (var i = 0; i < this.indexNames.length; i++) {
	                    var index = this.index(this.indexNames[i]);
	                    if (isCompoundKey(index.keyPath)) {
	                        try {
	                            setInlineCompoundKey(value, index.keyPath);
	                        }
	                        catch (e) {
	                            // The value doesn't have a valid key for this index.
	                        }
	                    }
	                }
	            }
	            return method.apply(this, args);
	        };

	        IDBIndex.prototype.get = function(key) {
	            var args = Array.prototype.slice.call(arguments);
	            if (key instanceof Array) {
	                args[0] = encodeCompoundKey(key);
	            }
	            return indexGet.apply(this, args);
	        };

	        IDBIndex.prototype.getKey = function(key) {
	            var args = Array.prototype.slice.call(arguments);
	            if (key instanceof Array) {
	                args[0] = encodeCompoundKey(key);
	            }
	            return indexGetKey.apply(this, args);
	        };

	        IDBIndex.prototype.openCursor = function(key) {
	            var args = Array.prototype.slice.call(arguments);
	            if (key instanceof Array) {
	                args[0] = encodeCompoundKey(key);
	            }
	            return indexCursor.apply(this, args);
	        };

	        IDBIndex.prototype.openKeyCursor = function(key) {
	            var args = Array.prototype.slice.call(arguments);
	            if (key instanceof Array) {
	                args[0] = encodeCompoundKey(key);
	            }
	            return indexKeyCursor.apply(this, args);
	        };

	        IDBObjectStore.prototype.get = function(key) {
	            var args = Array.prototype.slice.call(arguments);
	            if (key instanceof Array) {
	                args[0] = encodeCompoundKey(key);
	            }
	            return storeGet.apply(this, args);
	        };

	        IDBObjectStore.prototype.delete = function(key) {
	            var args = Array.prototype.slice.call(arguments);
	            if (key instanceof Array) {
	                args[0] = encodeCompoundKey(key);
	            }
	            return storeDelete.apply(this, args);
	        };

	        IDBObjectStore.prototype.openCursor = function(key) {
	            var args = Array.prototype.slice.call(arguments);
	            if (key instanceof Array) {
	                args[0] = encodeCompoundKey(key);
	            }
	            return storeCursor.apply(this, args);
	        };

	        IDBObjectStore.prototype.openKeyCursor = function(key) {
	            var args = Array.prototype.slice.call(arguments);
	            if (key instanceof Array) {
	                args[0] = encodeCompoundKey(key);
	            }
	            return storeKeyCursor.apply(this, args);
	        };

	        IDBKeyRange.bound = function(lower, upper, lowerOpen, upperOpen) {
	            var args = Array.prototype.slice.call(arguments);
	            if (lower instanceof Array) {
	                args[0] = encodeCompoundKey(lower);
	            }
	            if (upper instanceof Array) {
	                args[1] = encodeCompoundKey(upper);
	            }
	            return bound.apply(IDBKeyRange, args);
	        };

	        IDBKeyRange.upperBound = function(key, open) {
	            var args = Array.prototype.slice.call(arguments);
	            if (key instanceof Array) {
	                args[0] = encodeCompoundKey(key);
	            }
	            return upperBound.apply(IDBKeyRange, args);
	        };

	        IDBKeyRange.lowerBound = function(key, open) {
	            var args = Array.prototype.slice.call(arguments);
	            if (key instanceof Array) {
	                args[0] = encodeCompoundKey(key);
	            }
	            return lowerBound.apply(IDBKeyRange, args);
	        };

	        IDBKeyRange.only = function(key) {
	            var args = Array.prototype.slice.call(arguments);
	            if (key instanceof Array) {
	                args[0] = encodeCompoundKey(key);
	            }
	            return only.apply(IDBKeyRange, args);
	        };

	        Object.defineProperty(IDBRequest.prototype, 'result', {
	            enumerable: requestResult.enumerable,
	            configurable: requestResult.configurable,
	            get: function() {
	                var result = requestResult.get.call(this);
	                return removeInlineCompoundKey(result);
	            }
	        });

	        Object.defineProperty(IDBCursor.prototype, 'primaryKey', {
	            enumerable: cursorPrimaryKey.enumerable,
	            configurable: cursorPrimaryKey.configurable,
	            get: function() {
	                var result = cursorPrimaryKey.get.call(this);
	                return removeInlineCompoundKey(result);
	            }
	        });

	        Object.defineProperty(IDBCursor.prototype, 'key', {
	            enumerable: cursorKey.enumerable,
	            configurable: cursorKey.configurable,
	            get: function() {
	                var result = cursorKey.get.call(this);
	                return removeInlineCompoundKey(result);
	            }
	        });

	        Object.defineProperty(IDBCursorWithValue.prototype, 'value', {
	            enumerable: cursorValue.enumerable,
	            configurable: cursorValue.configurable,
	            get: function() {
	                var result = cursorValue.get.call(this);
	                return removeInlineCompoundKey(result);
	            }
	        });

	        try {
	            if (!IDBTransaction.VERSION_CHANGE) {
	                IDBTransaction.VERSION_CHANGE = 'versionchange';
	            }
	        }
	        catch (e) {}
	    }

	    var compoundKeysPropertyName = '__$$compoundKey';
	    var propertySeparatorRegExp = /\$\$/g;
	    var propertySeparator = '$$$$';         // "$$" after RegExp escaping
	    var keySeparator = '$_$';

	    function isCompoundKey(keyPath) {
	        return keyPath && (keyPath.indexOf(compoundKeysPropertyName + '.') === 0);
	    }

	    function encodeCompoundKeyPath(keyPath) {
	        // Encoded dotted properties
	        // ["name.first", "name.last"] ==> ["name$$first", "name$$last"]
	        for (var i = 0; i < keyPath.length; i++) {
	            keyPath[i] = keyPath[i].replace(/\./g, propertySeparator);
	        }

	        // Encode the array as a single property
	        // ["name$$first", "name$$last"] => "__$$compoundKey.name$$first$_$name$$last"
	        return compoundKeysPropertyName + '.' + keyPath.join(keySeparator);
	    }

	    function decodeCompoundKeyPath(keyPath) {
	        // Remove the "__$$compoundKey." prefix
	        keyPath = keyPath.substr(compoundKeysPropertyName.length + 1);

	        // Split the properties into an array
	        // "name$$first$_$name$$last" ==> ["name$$first", "name$$last"]
	        keyPath = keyPath.split(keySeparator);

	        // Decode dotted properties
	        // ["name$$first", "name$$last"] ==> ["name.first", "name.last"]
	        for (var i = 0; i < keyPath.length; i++) {
	            keyPath[i] = keyPath[i].replace(propertySeparatorRegExp, '.');
	        }
	        return keyPath;
	    }

	    function setInlineCompoundKey(value, encodedKeyPath) {
	        // Encode the key
	        var keyPath = decodeCompoundKeyPath(encodedKeyPath);
	        var key = idbModules.Key.getValue(value, keyPath);
	        var encodedKey = encodeCompoundKey(key);

	        // Store the encoded key inline
	        encodedKeyPath = encodedKeyPath.substr(compoundKeysPropertyName.length + 1);
	        value[compoundKeysPropertyName] = value[compoundKeysPropertyName] || {};
	        value[compoundKeysPropertyName][encodedKeyPath] = encodedKey;
	    }

	    function removeInlineCompoundKey(value) {
	        if (typeof value === "string" && isCompoundKey(value)) {
	            return decodeCompoundKey(value);
	        }
	        else if (value && typeof value[compoundKeysPropertyName] === "object") {
	            delete value[compoundKeysPropertyName];
	        }
	        return value;
	    }

	    function encodeCompoundKey(key) {
	        // Validate and encode the key
	        idbModules.Key.validate(key);
	        key = idbModules.Key.encode(key);

	        // Prepend the "__$$compoundKey." prefix
	        key = compoundKeysPropertyName + '.' + key;

	        validateKeyLength(key);
	        return key;
	    }

	    function decodeCompoundKey(key) {
	        validateKeyLength(key);

	        // Remove the "__$$compoundKey." prefix
	        key = key.substr(compoundKeysPropertyName.length + 1);

	        // Decode the key
	        key = idbModules.Key.decode(key);
	        return key;
	    }

	    function validateKeyLength(key) {
	        // BUG: Internet Explorer truncates string keys at 889 characters
	        if (key.length > 889) {
	            throw idbModules.util.createDOMException("DataError", "The encoded key is " + key.length + " characters long, but IE only allows 889 characters. Consider replacing numeric keys with strings to reduce the encoded length.");
	        }
	    }

	    idbModules.polyfill = polyfill;
	})(idbModules);

	(function(idbModules){
	    'use strict';

	    /**
	     * Implementation of the Structured Cloning Algorithm.  Supports the
	     * following object types:
	     * - Blob
	     * - Boolean
	     * - Date object
	     * - File object (deserialized as Blob object).
	     * - Number object
	     * - RegExp object
	     * - String object
	     * This is accomplished by doing the following:
	     * 1) Using the cycle/decycle functions from:
	     *    https://github.com/douglascrockford/JSON-js/blob/master/cycle.js
	     * 2) Serializing/deserializing objects to/from string that don't work with
	     *    JSON.stringify and JSON.parse by using object specific logic (eg use 
	     *    the FileReader API to convert a Blob or File object to a data URL.   
	     * 3) JSON.stringify and JSON.parse do the final conversion to/from string.
	     */
	    var Sca = (function(){
	        return {
	            decycle: function(object, callback) {
	                //From: https://github.com/douglascrockford/JSON-js/blob/master/cycle.js
	                // Contains additional logic to convert the following object types to string
	                // so that they can properly be encoded using JSON.stringify:
	                //  *Boolean
	                //  *Date
	                //  *File
	                //  *Blob
	                //  *Number
	                //  *Regex
	                // Make a deep copy of an object or array, assuring that there is at most
	                // one instance of each object or array in the resulting structure. The
	                // duplicate references (which might be forming cycles) are replaced with
	                // an object of the form
	                //      {$ref: PATH}
	                // where the PATH is a JSONPath string that locates the first occurance.
	                // So,
	                //      var a = [];
	                //      a[0] = a;
	                //      return JSON.stringify(JSON.decycle(a));
	                // produces the string '[{"$ref":"$"}]'.

	                // JSONPath is used to locate the unique object. $ indicates the top level of
	                // the object or array. [NUMBER] or [STRING] indicates a child member or
	                // property.

	                var objects = [],   // Keep a reference to each unique object or array
	                paths = [],     // Keep the path to each unique object or array
	                queuedObjects = [],
	                returnCallback = callback;

	                /**
	                 * Check the queue to see if all objects have been processed.
	                 * if they have, call the callback with the converted object.
	                 */
	                function checkForCompletion() {
	                    if (queuedObjects.length === 0) {
	                        returnCallback(derezObj);
	                    }    
	                }

	                /**
	                 * Convert a blob to a data URL.
	                 * @param {Blob} blob to convert.
	                 * @param {String} path of blob in object being encoded.
	                 */
	                function readBlobAsDataURL(blob, path) {
	                    var reader = new FileReader();
	                    reader.onloadend = function(loadedEvent) {
	                        var dataURL = loadedEvent.target.result;
	                        var blobtype = 'Blob';
	                        if (blob instanceof File) {
	                            //blobtype = 'File';
	                        }
	                        updateEncodedBlob(dataURL, path, blobtype);
	                    };
	                    reader.readAsDataURL(blob);
	                }
	                
	                /**
	                 * Async handler to update a blob object to a data URL for encoding.
	                 * @param {String} dataURL
	                 * @param {String} path
	                 * @param {String} blobtype - file if the blob is a file; blob otherwise
	                 */
	                function updateEncodedBlob(dataURL, path, blobtype) {
	                    var encoded = queuedObjects.indexOf(path);
	                    path = path.replace('$','derezObj');
	                    eval(path+'.$enc="'+dataURL+'"');
	                    eval(path+'.$type="'+blobtype+'"');
	                    queuedObjects.splice(encoded, 1);
	                    checkForCompletion();
	                }

	                function derez(value, path) {

	                    // The derez recurses through the object, producing the deep copy.

	                    var i,          // The loop counter
	                    name,       // Property name
	                    nu;         // The new object or array

	                    // typeof null === 'object', so go on if this value is really an object but not
	                    // one of the weird builtin objects.

	                    if (typeof value === 'object' && value !== null &&
	                        !(value instanceof Boolean) &&
	                        !(value instanceof Date)    &&
	                        !(value instanceof Number)  &&
	                        !(value instanceof RegExp)  &&
	                        !(value instanceof Blob)  &&
	                        !(value instanceof String)) {

	                        // If the value is an object or array, look to see if we have already
	                        // encountered it. If so, return a $ref/path object. This is a hard way,
	                        // linear search that will get slower as the number of unique objects grows.

	                        for (i = 0; i < objects.length; i += 1) {
	                            if (objects[i] === value) {
	                                return {$ref: paths[i]};
	                            }
	                        }

	                        // Otherwise, accumulate the unique value and its path.

	                        objects.push(value);
	                        paths.push(path);

	                        // If it is an array, replicate the array.

	                        if (Object.prototype.toString.apply(value) === '[object Array]') {
	                            nu = [];
	                            for (i = 0; i < value.length; i += 1) {
	                                nu[i] = derez(value[i], path + '[' + i + ']');
	                            }
	                        } else {
	                            // If it is an object, replicate the object.
	                            nu = {};
	                            for (name in value) {
	                                if (Object.prototype.hasOwnProperty.call(value, name)) {
	                                    nu[name] = derez(value[name],
	                                     path + '[' + JSON.stringify(name) + ']');
	                                }
	                            }
	                        }

	                        return nu;
	                    } else if (value instanceof Blob) {
	                        //Queue blob for conversion
	                        queuedObjects.push(path);
	                        readBlobAsDataURL(value, path);
	                    } else if (value instanceof Boolean) {
	                        value = {
	                            '$type': 'Boolean',
	                            '$enc': value.toString()
	                        };
	                    } else if (value instanceof Date) {
	                        value = {
	                            '$type': 'Date',
	                            '$enc': value.getTime()
	                        };
	                    } else if (value instanceof Number) {
	                        value = {
	                            '$type': 'Number',
	                            '$enc': value.toString()
	                        };
	                    } else if (value instanceof RegExp) {
	                        value = {
	                            '$type': 'RegExp',
	                            '$enc': value.toString()
	                        };
	                    } else if (typeof value === 'number') {
	                        value = {
	                            '$type': 'number',
	                            '$enc': value + ''  // handles NaN, Infinity, Negative Infinity
	                        };
	                    } else if (value === undefined) {
	                        value = {
	                            '$type': 'undefined'
	                        };
	                    }
	                    return value;
	                }
	                var derezObj = derez(object, '$');
	                checkForCompletion();
	            },
	                
	            retrocycle: function retrocycle($) {
	                //From: https://github.com/douglascrockford/JSON-js/blob/master/cycle.js
	                // Contains additional logic to convert strings to the following object types 
	                // so that they can properly be decoded:
	                //  *Boolean
	                //  *Date
	                //  *File
	                //  *Blob
	                //  *Number
	                //  *Regex
	                // Restore an object that was reduced by decycle. Members whose values are
	                // objects of the form
	                //      {$ref: PATH}
	                // are replaced with references to the value found by the PATH. This will
	                // restore cycles. The object will be mutated.

	                // The eval function is used to locate the values described by a PATH. The
	                // root object is kept in a $ variable. A regular expression is used to
	                // assure that the PATH is extremely well formed. The regexp contains nested
	                // * quantifiers. That has been known to have extremely bad performance
	                // problems on some browsers for very long strings. A PATH is expected to be
	                // reasonably short. A PATH is allowed to belong to a very restricted subset of
	                // Goessner's JSONPath.

	                // So,
	                //      var s = '[{"$ref":"$"}]';
	                //      return JSON.retrocycle(JSON.parse(s));
	                // produces an array containing a single element which is the array itself.

	                var px = /^\$(?:\[(?:\d+|\"(?:[^\\\"\u0000-\u001f]|\\([\\\"\/bfnrt]|u[0-9a-zA-Z]{4}))*\")\])*$/;
	                
	                /**
	                 * Converts the specified data URL to a Blob object
	                 * @param {String} dataURL to convert to a Blob
	                 * @returns {Blob} the converted Blob object
	                 */
	                function dataURLToBlob(dataURL) {
	                    var BASE64_MARKER = ';base64,',
	                        contentType,
	                        parts,
	                        raw;
	                    if (dataURL.indexOf(BASE64_MARKER) === -1) {
	                        parts = dataURL.split(',');
	                        contentType = parts[0].split(':')[1];
	                        raw = parts[1];

	                        return new Blob([raw], {type: contentType});
	                    }

	                    parts = dataURL.split(BASE64_MARKER);
	                    contentType = parts[0].split(':')[1];
	                    raw = window.atob(parts[1]);
	                    var rawLength = raw.length;
	                    var uInt8Array = new Uint8Array(rawLength);

	                    for (var i = 0; i < rawLength; ++i) {
	                        uInt8Array[i] = raw.charCodeAt(i);
	                    }
	                    return new Blob([uInt8Array.buffer], {type: contentType});
	                }
	                
	                function rez(value) {
	                    // The rez function walks recursively through the object looking for $ref
	                    // properties. When it finds one that has a value that is a path, then it
	                    // replaces the $ref object with a reference to the value that is found by
	                    // the path.

	                    var i, item, name, path;

	                    if (value && typeof value === 'object') {
	                        if (Object.prototype.toString.apply(value) === '[object Array]') {
	                            for (i = 0; i < value.length; i += 1) {
	                                item = value[i];
	                                if (item && typeof item === 'object') {
	                                    path = item.$ref;
	                                    if (typeof path === 'string' && px.test(path)) {
	                                        value[i] = eval(path);
	                                    } else {
	                                        value[i] = rez(item);
	                                    }
	                                }
	                            }
	                        } else {
	                            if (value.$type !== undefined) {
	                                switch(value.$type) {
	                                    case 'Blob':
	                                    case 'File':
	                                        value = dataURLToBlob(value.$enc);
	                                        break;
	                                    case 'Boolean':
	                                        value = Boolean(value.$enc === 'true');
	                                        break;
	                                    case 'Date':
	                                        value = new Date(value.$enc);
	                                        break;
	                                    case 'Number':
	                                        value = Number(value.$enc);
	                                        break;
	                                    case 'RegExp':
	                                        value = eval(value.$enc);
	                                        break;
	                                    case 'number':
	                                        value = parseFloat(value.$enc);
	                                        break;
	                                    case 'undefined':
	                                        value = undefined;
	                                        break;
	                                }
	                            } else {
	                                for (name in value) {
	                                    if (typeof value[name] === 'object') {
	                                        item = value[name];
	                                        if (item) {
	                                            path = item.$ref;
	                                            if (typeof path === 'string' && px.test(path)) {
	                                                value[name] = eval(path);
	                                            } else {
	                                                value[name] = rez(item);
	                                            }
	                                        }
	                                    }   
	                                }
	                            }
	                        }
	                    }
	                    return value;
	                }
	                return rez($);

	            },

	            /**
	             * Encode the specified object as a string.  Because of the asynchronus
	             * conversion of Blob/File to string, the encode function requires
	             * a callback
	             * @param {Object} val the value to convert.
	             * @param {function} callback the function to call once conversion is
	             * complete.  The callback gets called with the converted value.
	             */
	            "encode": function(val, callback){
	                function finishEncode(val) {
	                    callback(JSON.stringify(val));
	                }
	                this.decycle(val, finishEncode);                        
	            },
	                    
	            /**
	             * Deserialize the specified string to an object
	             * @param {String} val the serialized string
	             * @returns {Object} the deserialized object
	             */
	            "decode": function(val){
	                return this.retrocycle(JSON.parse(val));
	            }
	        };
	    }());
	    idbModules.Sca = Sca;
	}(idbModules));

	(function(idbModules) {
	    "use strict";

	    /**
	     * Encodes the keys based on their types. This is required to maintain collations
	     */
	    var collations = ["undefined", "number", "date", "string", "array"];

	    /**
	     * The sign values for numbers, ordered from least to greatest.
	     *  - "negativeInfinity": Sorts below all other values.
	     *  - "bigNegative": Negative values less than or equal to negative one.
	     *  - "smallNegative": Negative values between negative one and zero, noninclusive.
	     *  - "smallPositive": Positive values between zero and one, including zero but not one.
	     *  - "largePositive": Positive values greater than or equal to one.
	     *  - "positiveInfinity": Sorts above all other values.
	     */
	    var signValues = ["negativeInfinity", "bigNegative", "smallNegative", "smallPositive", "bigPositive", "positiveInfinity"];

	    var types = {
	        // Undefined is not a valid key type.  It's only used when there is no key.
	        undefined: {
	            encode: function(key) {
	                return collations.indexOf("undefined") + "-";
	            },
	            decode: function(key) {
	                return undefined;
	            }
	        },

	        // Dates are encoded as ISO 8601 strings, in UTC time zone.
	        date: {
	            encode: function(key) {
	                return collations.indexOf("date") + "-" + key.toJSON();
	            },
	            decode: function(key) {
	                return new Date(key.substring(2));
	            }
	        },

	        // Numbers are represented in a lexically sortable base-32 sign-exponent-mantissa
	        // notation.
	        //
	        // sign: takes a value between zero and five, inclusive. Represents infinite cases
	        //     and the signs of both the exponent and the fractional part of the number.
	        // exponent: paded to two base-32 digits, represented by the 32's compliment in the
	        //     "smallPositive" and "bigNegative" cases to ensure proper lexical sorting.
	        // mantissa: also called the fractional part. Normed 11-digit base-32 representation.
	        //     Represented by the 32's compliment in the "smallNegative" and "bigNegative"
	        //     cases to ensure proper lexical sorting.
	        number: {
	            // The encode step checks for six numeric cases and generates 14-digit encoded
	            // sign-exponent-mantissa strings.
	            encode: function(key) {
	                var key32 = Math.abs(key).toString(32);
	                // Get the index of the decimal.
	                var decimalIndex = key32.indexOf(".");
	                // Remove the decimal.
	                key32 = (decimalIndex !== -1) ? key32.replace(".", "") : key32;
	                // Get the index of the first significant digit.
	                var significantDigitIndex = key32.search(/[^0]/);
	                // Truncate leading zeros.
	                key32 = key32.slice(significantDigitIndex);
	                var sign, exponent = zeros(2), mantissa = zeros(11);

	                // Finite cases:
	                if (isFinite(key)) {
	                    // Negative cases:
	                    if (key < 0) {
	                        // Negative exponent case:
	                        if (key > -1) {
	                            sign = signValues.indexOf("smallNegative");
	                            exponent = padBase32Exponent(significantDigitIndex);
	                            mantissa = flipBase32(padBase32Mantissa(key32));
	                        }
	                        // Non-negative exponent case:
	                        else {
	                            sign = signValues.indexOf("bigNegative");
	                            exponent = flipBase32(padBase32Exponent(
	                                (decimalIndex !== -1) ? decimalIndex : key32.length
	                            ));
	                            mantissa = flipBase32(padBase32Mantissa(key32));
	                        }
	                    }
	                    // Non-negative cases:
	                    else {
	                        // Negative exponent case:
	                        if (key < 1) {
	                            sign = signValues.indexOf("smallPositive");
	                            exponent = flipBase32(padBase32Exponent(significantDigitIndex));
	                            mantissa = padBase32Mantissa(key32);
	                        }
	                        // Non-negative exponent case:
	                        else {
	                            sign = signValues.indexOf("bigPositive");
	                            exponent = padBase32Exponent(
	                                (decimalIndex !== -1) ? decimalIndex : key32.length
	                            );
	                            mantissa = padBase32Mantissa(key32);
	                        }
	                    }
	                }
	                // Infinite cases:
	                else {
	                    sign = signValues.indexOf(
	                        key > 0 ? "positiveInfinity" : "negativeInfinity"
	                    );
	                }

	                return collations.indexOf("number") + "-" + sign + exponent + mantissa;
	            },
	            // The decode step must interpret the sign, reflip values encoded as the 32's complements,
	            // apply signs to the exponent and mantissa, do the base-32 power operation, and return
	            // the original JavaScript number values.
	            decode: function(key) {
	                var sign = +key.substr(2, 1);
	                var exponent = key.substr(3, 2);
	                var mantissa = key.substr(5, 11);

	                switch (signValues[sign]) {
	                    case "negativeInfinity":
	                        return -Infinity;
	                    case "positiveInfinity":
	                        return Infinity;
	                    case "bigPositive":
	                        return pow32(mantissa, exponent);
	                    case "smallPositive":
	                        exponent = negate(flipBase32(exponent));
	                        return pow32(mantissa, exponent);
	                    case "smallNegative":
	                        exponent = negate(exponent);
	                        mantissa = flipBase32(mantissa);
	                        return -pow32(mantissa, exponent);
	                    case "bigNegative":
	                        exponent = flipBase32(exponent);
	                        mantissa = flipBase32(mantissa);
	                        return -pow32(mantissa, exponent);
	                    default:
	                        throw new Error("Invalid number.");
	                }
	            }
	        },

	        // Strings are encoded as JSON strings (with quotes and unicode characters escaped).
	        //
	        // IF the strings are in an array, then some extra encoding is done to make sorting work correctly:
	        // Since we can't force all strings to be the same length, we need to ensure that characters line-up properly
	        // for sorting, while also accounting for the extra characters that are added when the array itself is encoded as JSON.
	        // To do this, each character of the string is prepended with a dash ("-"), and a space is added to the end of the string.
	        // This effectively doubles the size of every string, but it ensures that when two arrays of strings are compared,
	        // the indexes of each string's characters line up with each other.
	        string: {
	            encode: function(key, inArray) {
	                if (inArray) {
	                    // prepend each character with a dash, and append a space to the end
	                    key = key.replace(/(.)/g, '-$1') + ' ';
	                }
	                return collations.indexOf("string") + "-" + key;
	            },
	            decode: function(key, inArray) {
	                key = key.substring(2);
	                if (inArray) {
	                    // remove the space at the end, and the dash before each character
	                    key = key.substr(0, key.length - 1).replace(/-(.)/g, '$1');
	                }
	                return key;
	            }
	        },

	        // Arrays are encoded as JSON strings.
	        // An extra, value is added to each array during encoding to make empty arrays sort correctly.
	        array: {
	            encode: function(key) {
	                var encoded = [];
	                for (var i = 0; i < key.length; i++) {
	                    var item = key[i];
	                    var encodedItem = idbModules.Key.encode(item, true);        // encode the array item
	                    encoded[i] = encodedItem;
	                }
	                encoded.push(collations.indexOf("undefined") + "-");            // append an extra item, so empty arrays sort correctly
	                return collations.indexOf("array") + "-" + JSON.stringify(encoded);
	            },
	            decode: function(key) {
	                var decoded = JSON.parse(key.substring(2));
	                decoded.pop();                                                  // remove the extra item
	                for (var i = 0; i < decoded.length; i++) {
	                    var item = decoded[i];
	                    var decodedItem = idbModules.Key.decode(item, true);        // decode the item
	                    decoded[i] = decodedItem;
	                }
	                return decoded;
	            }
	        }
	    };

	    /**
	     * Return a padded base-32 exponent value.
	     * @param {number}
	     * @return {string}
	     */
	    function padBase32Exponent(n) {
	        n = n.toString(32);
	        return (n.length === 1) ? "0" + n : n;
	    }

	    /**
	     * Return a padded base-32 mantissa.
	     * @param {string}
	     * @return {string}
	     */
	    function padBase32Mantissa(s) {
	        return (s + zeros(11)).slice(0, 11);
	    }

	    /**
	     * Flips each digit of a base-32 encoded string.
	     * @param {string} encoded
	     */
	    function flipBase32(encoded) {
	        var flipped = "";
	        for (var i = 0; i < encoded.length; i++) {
	            flipped += (31 - parseInt(encoded[i], 32)).toString(32);
	        }
	        return flipped;
	    }

	    /**
	     * Base-32 power function.
	     * RESEARCH: This function does not precisely decode floats because it performs
	     * floating point arithmetic to recover values. But can the original values be
	     * recovered exactly?
	     * Someone may have already figured out a good way to store JavaScript floats as
	     * binary strings and convert back. Barring a better method, however, one route
	     * may be to generate decimal strings that `parseFloat` decodes predictably.
	     * @param {string}
	     * @param {string}
	     * @return {number}
	     */
	    function pow32(mantissa, exponent) {
	        var whole, fraction, expansion;
	        exponent = parseInt(exponent, 32);
	        if (exponent < 0) {
	            return roundToPrecision(
	                parseInt(mantissa, 32) * Math.pow(32, exponent - 10)
	            );
	        }
	        else {
	            if (exponent < 11) {
	                whole = mantissa.slice(0, exponent);
	                whole = parseInt(whole, 32);
	                fraction = mantissa.slice(exponent);
	                fraction = parseInt(fraction, 32) * Math.pow(32, exponent - 11);
	                return roundToPrecision(whole + fraction);
	            }
	            else {
	                expansion = mantissa + zeros(exponent - 11);
	                return parseInt(expansion, 32);
	            }
	        }
	    }

	    /**
	     *
	     */
	    function roundToPrecision(num, precision) {
	        precision = precision || 16;
	        return parseFloat(num.toPrecision(precision));
	    }

	    /**
	     * Returns a string of n zeros.
	     * @param {number}
	     * @return {string}
	     */
	    function zeros(n) {
	        var result = "";
	        while (n--) {
	            result = result + "0";
	        }
	        return result;
	    }

	    /**
	     * Negates numeric strings.
	     * @param {string}
	     * @return {string}
	     */
	    function negate(s) {
	        return "-" + s;
	    }

	    /**
	     * Returns the string "number", "date", "string", or "array".
	     */
	    function getType(key) {
	        if (key instanceof Date) {
	            return "date";
	        }
	        if (key instanceof Array) {
	            return "array";
	        }
	        return typeof key;
	    }

	    /**
	     * Keys must be strings, numbers, Dates, or Arrays
	     */
	    function validate(key) {
	        var type = getType(key);
	        if (type === "array") {
	            for (var i = 0; i < key.length; i++) {
	                validate(key[i]);
	            }
	        }
	        else if (!types[type] || (type !== "string" && isNaN(key))) {
	            throw idbModules.util.createDOMException("DataError", "Not a valid key");
	        }
	    }

	    /**
	     * Returns the value of an inline key
	     * @param {object} source
	     * @param {string|array} keyPath
	     */
	    function getValue(source, keyPath) {
	        try {
	            if (keyPath instanceof Array) {
	                var arrayValue = [];
	                for (var i = 0; i < keyPath.length; i++) {
	                    arrayValue.push(eval("source." + keyPath[i]));
	                }
	                return arrayValue;
	            } else {
	                return eval("source." + keyPath);
	            }
	        }
	        catch (e) {
	            return undefined;
	        }
	    }

	    /**
	     * Sets the inline key value
	     * @param {object} source
	     * @param {string} keyPath
	     * @param {*} value
	     */
	    function setValue(source, keyPath, value) {
	        var props = keyPath.split('.');
	        for (var i = 0; i < props.length - 1; i++) {
	            var prop = props[i];
	            source = source[prop] = source[prop] || {};
	        }
	        source[props[props.length - 1]] = value;
	    }

	    /**
	     * Determines whether an index entry matches a multi-entry key value.
	     * @param {string} encodedEntry     The entry value (already encoded)
	     * @param {string} encodedKey       The full index key (already encoded)
	     * @returns {boolean}
	     */
	    function isMultiEntryMatch(encodedEntry, encodedKey) {
	        var keyType = collations[encodedKey.substring(0, 1)];

	        if (keyType === "array") {
	            return encodedKey.indexOf(encodedEntry) > 1;
	        }
	        else {
	            return encodedKey === encodedEntry;
	        }
	    }

	    function isKeyInRange(key, range) {
	        var lowerMatch = range.lower === undefined;
	        var upperMatch = range.upper === undefined;
	        var encodedKey = idbModules.Key.encode(key, true);

	        if (range.lower !== undefined) {
	            if (range.lowerOpen && encodedKey > range.__lower) {
	                lowerMatch = true;
	            }
	            if (!range.lowerOpen && encodedKey >= range.__lower) {
	                lowerMatch = true;
	            }
	        }
	        if (range.upper !== undefined) {
	            if (range.upperOpen && encodedKey < range.__upper) {
	                upperMatch = true;
	            }
	            if (!range.upperOpen && encodedKey <= range.__upper) {
	                upperMatch = true;
	            }
	        }

	        return lowerMatch && upperMatch;
	    }

	    function findMultiEntryMatches(keyEntry, range) {
	        var matches = [];

	        if (keyEntry instanceof Array) {
	            for (var i = 0; i < keyEntry.length; i++) {
	                var key = keyEntry[i];

	                if (key instanceof Array) {
	                    if (range.lower === range.upper) {
	                        continue;
	                    }
	                    if (key.length === 1) {
	                        key = key[0];
	                    } else {
	                        var nested = findMultiEntryMatches(key, range);
	                        if (nested.length > 0) {
	                            matches.push(key);
	                        }
	                        continue;
	                    }
	                }

	                if (isKeyInRange(key, range)) {
	                    matches.push(key);
	                }
	            }
	        } else {
	            if (isKeyInRange(keyEntry, range)) {
	                matches.push(keyEntry);
	            }
	        }
	        return matches;
	    }

	    idbModules.Key = {
	        encode: function(key, inArray) {
	            if (key === undefined) {
	                return null;
	            }
	            return types[getType(key)].encode(key, inArray);
	        },
	        decode: function(key, inArray) {
	            if (typeof key !== "string") {
	                return undefined;
	            }
	            return types[collations[key.substring(0, 1)]].decode(key, inArray);
	        },
	        validate: validate,
	        getValue: getValue,
	        setValue: setValue,
	        isMultiEntryMatch: isMultiEntryMatch,
	        findMultiEntryMatches: findMultiEntryMatches
	    };
	}(idbModules));

	(function(idbModules) {
	    'use strict';

	    /**
	     * Creates a native Event object, for browsers that support it
	     * @returns {Event}
	     */
	    function createNativeEvent(type, debug) {
	        var event = new Event(type);
	        event.debug = debug;

	        // Make the "target" writable
	        Object.defineProperty(event, 'target', {
	            writable: true
	        });

	        return event;
	    }

	    /**
	     * A shim Event class, for browsers that don't allow us to create native Event objects.
	     * @constructor
	     */
	    function ShimEvent(type, debug) {
	        this.type = type;
	        this.debug = debug;
	        this.bubbles = false;
	        this.cancelable = false;
	        this.eventPhase = 0;
	        this.timeStamp = new Date().valueOf();
	    }

	    var useNativeEvent = false;
	    try {
	        // Test whether we can use the browser's native Event class
	        var test = createNativeEvent('test type', 'test debug');
	        var target = {test: 'test target'};
	        test.target = target;

	        if (test instanceof Event && test.type === 'test type' && test.debug === 'test debug' && test.target === target) {
	            // Native events work as expected
	            useNativeEvent = true;
	        }
	    }
	    catch (e) {}

	    if (useNativeEvent) {
	        idbModules.Event = Event;
	        idbModules.IDBVersionChangeEvent = Event;
	        idbModules.util.createEvent = createNativeEvent;
	    }
	    else {
	        idbModules.Event = ShimEvent;
	        idbModules.IDBVersionChangeEvent = ShimEvent;
	        idbModules.util.createEvent = function(type, debug) {
	            return new ShimEvent(type, debug);
	        };
	    }
	}(idbModules));

	(function(idbModules) {
	    'use strict';

	    /**
	     * Creates a native DOMException, for browsers that support it
	     * @returns {DOMException}
	     */
	    function createNativeDOMException(name, message) {
	        var e = new DOMException.prototype.constructor(0, message);
	        e.name = name || 'DOMException';
	        e.message = message;
	        return e;
	    }

	    /**
	     * Creates a native DOMError, for browsers that support it
	     * @returns {DOMError}
	     */
	    function createNativeDOMError(name, message) {
	        name = name || 'DOMError';
	        var e = new DOMError(name, message);
	        e.name === name || (e.name = name);
	        e.message === message || (e.message = message);
	        return e;
	    }

	    /**
	     * Creates a generic Error object
	     * @returns {Error}
	     */
	    function createError(name, message) {
	        var e = new Error(message);
	        e.name = name || 'DOMException';
	        e.message = message;
	        return e;
	    }

	    /**
	     * Logs detailed error information to the console.
	     * @param {string} name
	     * @param {string} message
	     * @param {string|Error|null} error
	     */
	    idbModules.util.logError = function(name, message, error) {
	        if (idbModules.DEBUG) {
	            if (error && error.message) {
	                error = error.message;
	            }

	            var method = typeof(console.error) === 'function' ? 'error' : 'log';
	            console[method](name + ': ' + message + '. ' + (error || ''));
	            console.trace && console.trace();
	        }
	    };

	    /**
	     * Finds the error argument.  This is useful because some WebSQL callbacks
	     * pass the error as the first argument, and some pass it as the second argument.
	     * @param {array} args
	     * @returns {Error|DOMException|undefined}
	     */
	    idbModules.util.findError = function(args) {
	        var err;
	        if (args) {
	            if (args.length === 1) {
	                return args[0];
	            }
	            for (var i = 0; i < args.length; i++) {
	                var arg = args[i];
	                if (arg instanceof Error || arg instanceof DOMException) {
	                    return arg;
	                }
	                else if (arg && typeof arg.message === "string") {
	                    err = arg;
	                }
	            }
	        }
	        return err;
	    };

	    var test, useNativeDOMException = false, useNativeDOMError = false;

	    // Test whether we can use the browser's native DOMException class
	    try {
	        test = createNativeDOMException('test name', 'test message');
	        if (test instanceof DOMException && test.name === 'test name' && test.message === 'test message') {
	            // Native DOMException works as expected
	            useNativeDOMException = true;
	        }
	    }
	    catch (e) {}

	    // Test whether we can use the browser's native DOMError class
	    try {
	        test = createNativeDOMError('test name', 'test message');
	        if (test instanceof DOMError && test.name === 'test name' && test.message === 'test message') {
	            // Native DOMError works as expected
	            useNativeDOMError = true;
	        }
	    }
	    catch (e) {}

	    if (useNativeDOMException) {
	        idbModules.DOMException = DOMException;
	        idbModules.util.createDOMException = function(name, message, error) {
	            idbModules.util.logError(name, message, error);
	            return createNativeDOMException(name, message);
	        };
	    }
	    else {
	        idbModules.DOMException = Error;
	        idbModules.util.createDOMException = function(name, message, error) {
	            idbModules.util.logError(name, message, error);
	            return createError(name, message);
	        };
	    }

	    if (useNativeDOMError) {
	        idbModules.DOMError = DOMError;
	        idbModules.util.createDOMError = function(name, message, error) {
	            idbModules.util.logError(name, message, error);
	            return createNativeDOMError(name, message);
	        };
	    }
	    else {
	        idbModules.DOMError = Error;
	        idbModules.util.createDOMError = function(name, message, error) {
	            idbModules.util.logError(name, message, error);
	            return createError(name, message);
	        };
	    }
	}(idbModules));

	(function(idbModules){
	    'use strict';

	    /**
	     * The IDBRequest Object that is returns for all async calls
	     * http://dvcs.w3.org/hg/IndexedDB/raw-file/tip/Overview.html#request-api
	     */
	    function IDBRequest(){
	        this.onsuccess = this.onerror = this.result = this.error = this.source = this.transaction = null;
	        this.readyState = "pending";
	    }

	    /**
	     * The IDBOpenDBRequest called when a database is opened
	     */
	    function IDBOpenDBRequest(){
	        this.onblocked = this.onupgradeneeded = null;
	    }
	    IDBOpenDBRequest.prototype = new IDBRequest();
	    IDBOpenDBRequest.prototype.constructor = IDBOpenDBRequest;
	    
	    idbModules.IDBRequest = IDBRequest;
	    idbModules.IDBOpenDBRequest = IDBOpenDBRequest;
	    
	}(idbModules));

	(function(idbModules, undefined){
	    'use strict';

	    /**
	     * The IndexedDB KeyRange object
	     * http://dvcs.w3.org/hg/IndexedDB/raw-file/tip/Overview.html#dfn-key-range
	     * @param {Object} lower
	     * @param {Object} upper
	     * @param {Object} lowerOpen
	     * @param {Object} upperOpen
	     */
	    function IDBKeyRange(lower, upper, lowerOpen, upperOpen){
	        if (lower !== undefined) {
	            idbModules.Key.validate(lower);
	        }
	        if (upper !== undefined) {
	            idbModules.Key.validate(upper);
	        }

	        this.lower = lower;
	        this.upper = upper;
	        this.lowerOpen = !!lowerOpen;
	        this.upperOpen = !!upperOpen;
	    }

	    IDBKeyRange.only = function(value){
	        return new IDBKeyRange(value, value, false, false);
	    };

	    IDBKeyRange.lowerBound = function(value, open){
	        return new IDBKeyRange(value, undefined, open, undefined);
	    };
	    IDBKeyRange.upperBound = function(value, open){
	        return new IDBKeyRange(undefined, value, undefined, open);
	    };
	    IDBKeyRange.bound = function(lower, upper, lowerOpen, upperOpen){
	        return new IDBKeyRange(lower, upper, lowerOpen, upperOpen);
	    };

	    idbModules.IDBKeyRange = IDBKeyRange;

	}(idbModules));

	(function(idbModules, undefined){
	    'use strict';

	    /**
	     * The IndexedDB Cursor Object
	     * http://dvcs.w3.org/hg/IndexedDB/raw-file/tip/Overview.html#idl-def-IDBCursor
	     * @param {IDBKeyRange} range
	     * @param {string} direction
	     * @param {IDBObjectStore} store
	     * @param {IDBObjectStore|IDBIndex} source
	     * @param {string} keyColumnName
	     * @param {string} valueColumnName
	     * @param {boolean} count
	     */
	    function IDBCursor(range, direction, store, source, keyColumnName, valueColumnName, count){
	        // Calling openCursor on an index or objectstore with null is allowed but we treat it as undefined internally
	        if (range === null) {
	            range = undefined;
	        }
	        if (range !== undefined && !(range instanceof idbModules.IDBKeyRange)) {
	            range = new idbModules.IDBKeyRange(range, range, false, false);
	        }
	        store.transaction.__assertActive();
	        if (direction !== undefined && ["next", "prev", "nextunique", "prevunique"].indexOf(direction) === -1) {
	            throw new TypeError(direction + "is not a valid cursor direction");
	        }

	        this.source = source;
	        this.direction = direction || "next";
	        this.key = undefined;
	        this.primaryKey = undefined;
	        this.__store = store;
	        this.__range = range;
	        this.__req = new idbModules.IDBRequest();
	        this.__keyColumnName = keyColumnName;
	        this.__valueColumnName = valueColumnName;
	        this.__valueDecoder = valueColumnName === "value" ? idbModules.Sca : idbModules.Key;
	        this.__count = count;
	        this.__offset = -1; // Setting this to -1 as continue will set it to 0 anyway
	        this.__lastKeyContinued = undefined; // Used when continuing with a key
	        this.__multiEntryIndex = source instanceof idbModules.IDBIndex ? source.multiEntry : false;
	        this.__unique = this.direction.indexOf("unique") !== -1;

	        if (range !== undefined) {
	            // Encode the key range and cache the encoded values, so we don't have to re-encode them over and over
	            range.__lower = range.lower !== undefined && idbModules.Key.encode(range.lower, this.__multiEntryIndex);
	            range.__upper = range.upper !== undefined && idbModules.Key.encode(range.upper, this.__multiEntryIndex);
	        }

	        this["continue"]();
	    }

	    IDBCursor.prototype.__find = function (/* key, tx, success, error, recordsToLoad */) {
	        var args = Array.prototype.slice.call(arguments);
	        if (this.__multiEntryIndex) {
	            this.__findMultiEntry.apply(this, args);
	        } else {
	            this.__findBasic.apply(this, args);
	        }
	    };

	    IDBCursor.prototype.__findBasic = function (key, tx, success, error, recordsToLoad) {
	        recordsToLoad = recordsToLoad || 1;

	        var me = this;
	        var quotedKeyColumnName = idbModules.util.quote(me.__keyColumnName);
	        var sql = ["SELECT * FROM", idbModules.util.quote(me.__store.name)];
	        var sqlValues = [];
	        sql.push("WHERE", quotedKeyColumnName, "NOT NULL");
	        if (me.__range && (me.__range.lower !== undefined || me.__range.upper !== undefined )) {
	            sql.push("AND");
	            if (me.__range.lower !== undefined) {
	                sql.push(quotedKeyColumnName, (me.__range.lowerOpen ? ">" : ">="), "?");
	                sqlValues.push(me.__range.__lower);
	            }
	            (me.__range.lower !== undefined && me.__range.upper !== undefined) && sql.push("AND");
	            if (me.__range.upper !== undefined) {
	                sql.push(quotedKeyColumnName, (me.__range.upperOpen ? "<" : "<="), "?");
	                sqlValues.push(me.__range.__upper);
	            }
	        }
	        if (typeof key !== "undefined") {
	            me.__lastKeyContinued = key;
	            me.__offset = 0;
	        }
	        if (me.__lastKeyContinued !== undefined) {
	            sql.push("AND", quotedKeyColumnName, ">= ?");
	            idbModules.Key.validate(me.__lastKeyContinued);
	            sqlValues.push(idbModules.Key.encode(me.__lastKeyContinued));
	        }

	        // Determine the ORDER BY direction based on the cursor.
	        var direction = me.direction === 'prev' || me.direction === 'prevunique' ? 'DESC' : 'ASC';

	        if (!me.__count) {
	            sql.push("ORDER BY", quotedKeyColumnName, direction);
	            sql.push("LIMIT", recordsToLoad, "OFFSET", me.__offset);
	        }
	        sql = sql.join(" ");
	        idbModules.DEBUG && console.log(sql, sqlValues);

	        me.__prefetchedData = null;
	        me.__prefetchedIndex = 0;
	        tx.executeSql(sql, sqlValues, function (tx, data) {
	            if (me.__count) {
	                success(undefined, data.rows.length, undefined);
	            }
	            else if (data.rows.length > 1) {
	                me.__prefetchedData = data.rows;
	                me.__prefetchedIndex = 0;
	                idbModules.DEBUG && console.log("Preloaded " + me.__prefetchedData.length + " records for cursor");
	                me.__decode(data.rows.item(0), success);
	            }
	            else if (data.rows.length === 1) {
	                me.__decode(data.rows.item(0), success);
	            }
	            else {
	                idbModules.DEBUG && console.log("Reached end of cursors");
	                success(undefined, undefined, undefined);
	            }
	        }, function (tx, err) {
	            idbModules.DEBUG && console.log("Could not execute Cursor.continue", sql, sqlValues);
	            error(err);
	        });
	    };

	    IDBCursor.prototype.__findMultiEntry = function (key, tx, success, error) {
	        var me = this;

	        if (me.__prefetchedData && me.__prefetchedData.length === me.__prefetchedIndex) {
	            idbModules.DEBUG && console.log("Reached end of multiEntry cursor");
	            success(undefined, undefined, undefined);
	            return;
	        }

	        var quotedKeyColumnName = idbModules.util.quote(me.__keyColumnName);
	        var sql = ["SELECT * FROM", idbModules.util.quote(me.__store.name)];
	        var sqlValues = [];
	        sql.push("WHERE", quotedKeyColumnName, "NOT NULL");
	        if (me.__range && (me.__range.lower !== undefined && me.__range.upper !== undefined)) {
	            if (me.__range.upper.indexOf(me.__range.lower) === 0) {
	                sql.push("AND", quotedKeyColumnName, "LIKE ?");
	                sqlValues.push("%" + me.__range.__lower.slice(0, -1) + "%");
	            }
	        }
	        if (typeof key !== "undefined") {
	            me.__lastKeyContinued = key;
	            me.__offset = 0;
	        }
	        if (me.__lastKeyContinued !== undefined) {
	            sql.push("AND", quotedKeyColumnName, ">= ?");
	            idbModules.Key.validate(me.__lastKeyContinued);
	            sqlValues.push(idbModules.Key.encode(me.__lastKeyContinued));
	        }

	        // Determine the ORDER BY direction based on the cursor.
	        var direction = me.direction === 'prev' || me.direction === 'prevunique' ? 'DESC' : 'ASC';

	        if (!me.__count) {
	            sql.push("ORDER BY key", direction);
	        }
	        sql = sql.join(" ");
	        idbModules.DEBUG && console.log(sql, sqlValues);

	        me.__prefetchedData = null;
	        me.__prefetchedIndex = 0;
	        tx.executeSql(sql, sqlValues, function (tx, data) {
	            me.__multiEntryOffset = data.rows.length;

	            if (data.rows.length > 0) {
	                var rows = [];

	                for (var i = 0; i < data.rows.length; i++) {
	                    var rowItem = data.rows.item(i);
	                    var rowKey = idbModules.Key.decode(rowItem[me.__keyColumnName], true);
	                    var matches = idbModules.Key.findMultiEntryMatches(rowKey, me.__range);

	                    for (var j = 0; j < matches.length; j++) {
	                        var matchingKey = matches[j];
	                        var clone = {
	                            matchingKey: idbModules.Key.encode(matchingKey, true),
	                            key: rowItem.key
	                        };
	                        clone[me.__keyColumnName] = rowItem[me.__keyColumnName];
	                        clone[me.__valueColumnName] = rowItem[me.__valueColumnName];
	                        rows.push(clone);
	                    }
	                }

	                var reverse = me.direction.indexOf("prev") === 0;
	                rows.sort(function (a, b) {
	                    if (a.matchingKey.replace('[','z') < b.matchingKey.replace('[','z')) {
	                        return reverse ? 1 : -1;
	                    }
	                    if (a.matchingKey.replace('[','z') > b.matchingKey.replace('[','z')) {
	                        return reverse ? -1 : 1;
	                    }
	                    if (a.key < b.key) {
	                        return me.direction === "prev" ? 1 : -1;
	                    }
	                    if (a.key > b.key) {
	                        return me.direction === "prev" ? -1 : 1;
	                    }
	                    return 0;
	                });

	                me.__prefetchedData = {
	                    data: rows,
	                    length: rows.length,
	                    item: function (index) {
	                        return this.data[index];
	                    }
	                };
	                me.__prefetchedIndex = 0;

	                if (me.__count) {
	                    success(undefined, rows.length, undefined);
	                }
	                else if (rows.length > 1) {
	                    idbModules.DEBUG && console.log("Preloaded " + me.__prefetchedData.length + " records for multiEntry cursor");
	                    me.__decode(rows[0], success);
	                } else if (rows.length === 1) {
	                    idbModules.DEBUG && console.log("Reached end of multiEntry cursor");
	                    me.__decode(rows[0], success);
	                } else {
	                    idbModules.DEBUG && console.log("Reached end of multiEntry cursor");
	                    success(undefined, undefined, undefined);
	                }
	            }
	            else {
	                idbModules.DEBUG && console.log("Reached end of multiEntry cursor");
	                success(undefined, undefined, undefined);
	            }
	        }, function (tx, err) {
	            idbModules.DEBUG && console.log("Could not execute Cursor.continue", sql, sqlValues);
	            error(err);
	        });
	    };

	    /**
	     * Creates an "onsuccess" callback
	     * @private
	     */
	    IDBCursor.prototype.__onsuccess = function(success) {
	        var me = this;
	        return function(key, value, primaryKey) {
	            if (me.__count) {
	                success(value, me.__req);
	            }
	            else {
	                me.key = key === undefined ? null : key;
	                me.value = value === undefined ? null : value;
	                me.primaryKey = primaryKey === undefined ? null : primaryKey;
	                var result = key === undefined ? null : me;
	                success(result, me.__req);
	            }
	        };
	    };

	    IDBCursor.prototype.__decode = function (rowItem, callback) {
	        if (this.__multiEntryIndex && this.__unique) {
	            if (!this.__matchedKeys) {
	                this.__matchedKeys = {};
	            }
	            if (this.__matchedKeys[rowItem.matchingKey]) {
	                callback(undefined, undefined, undefined);
	                return;
	            }
	            this.__matchedKeys[rowItem.matchingKey] = true;
	        }
	        var key = idbModules.Key.decode(this.__multiEntryIndex ? rowItem.matchingKey : rowItem[this.__keyColumnName], this.__multiEntryIndex);
	        var val = this.__valueDecoder.decode(rowItem[this.__valueColumnName]);
	        var primaryKey = idbModules.Key.decode(rowItem.key);
	        callback(key, val, primaryKey);
	    };

	    IDBCursor.prototype["continue"] = function (key) {
	        var recordsToPreloadOnContinue = idbModules.cursorPreloadPackSize || 100;
	        var me = this;

	        this.__store.transaction.__pushToQueue(me.__req, function cursorContinue(tx, args, success, error) {
	            me.__offset++;

	            if (me.__prefetchedData) {
	                // We have pre-loaded data for the cursor
	                me.__prefetchedIndex++;
	                if (me.__prefetchedIndex < me.__prefetchedData.length) {
	                    me.__decode(me.__prefetchedData.item(me.__prefetchedIndex), me.__onsuccess(success));
	                    return;
	                }
	            }

	            // No pre-fetched data, do query
	            me.__find(key, tx, me.__onsuccess(success), error, recordsToPreloadOnContinue);
	        });
	    };

	    IDBCursor.prototype.advance = function(count){
	        if (count <= 0) {
	            throw idbModules.util.createDOMException("Type Error", "Count is invalid - 0 or negative", count);
	        }
	        var me = this;
	        this.__store.transaction.__pushToQueue(me.__req, function cursorAdvance(tx, args, success, error){
	            me.__offset += count;
	            me.__find(undefined, tx, me.__onsuccess(success), error);
	        });
	    };

	    IDBCursor.prototype.update = function(valueToUpdate){
	        var me = this;
	        me.__store.transaction.__assertWritable();
	        return me.__store.transaction.__addToTransactionQueue(function cursorUpdate(tx, args, success, error){
	            idbModules.Sca.encode(valueToUpdate, function(encoded) {
	                me.__find(undefined, tx, function(key, value, primaryKey){
	                    var store = me.__store;
	                    var params = [encoded];
	                    var sql = ["UPDATE", idbModules.util.quote(store.name), "SET value = ?"];
	                    idbModules.Key.validate(primaryKey);

	                    // Also correct the indexes in the table
	                    for (var i = 0; i < store.indexNames.length; i++) {
	                        var index = store.__indexes[store.indexNames[i]];
	                        var indexKey = idbModules.Key.getValue(valueToUpdate, index.keyPath);
	                        sql.push(",", idbModules.util.quote(index.name), "= ?");
	                        params.push(idbModules.Key.encode(indexKey, index.multiEntry));
	                    }

	                    sql.push("WHERE key = ?");
	                    params.push(idbModules.Key.encode(primaryKey));

	                    idbModules.DEBUG && console.log(sql.join(" "), encoded, key, primaryKey);
	                    tx.executeSql(sql.join(" "), params, function(tx, data){
	                        me.__prefetchedData = null;
	                        me.__prefetchedIndex = 0;
	                        if (data.rowsAffected === 1) {
	                            success(key);
	                        }
	                        else {
	                            error("No rows with key found" + key);
	                        }
	                    }, function(tx, data){
	                        error(data);
	                    });
	                }, error);
	            });
	        });
	    };

	    IDBCursor.prototype["delete"] = function(){
	        var me = this;
	        me.__store.transaction.__assertWritable();
	        return this.__store.transaction.__addToTransactionQueue(function cursorDelete(tx, args, success, error){
	            me.__find(undefined, tx, function(key, value, primaryKey){
	                var sql = "DELETE FROM  " + idbModules.util.quote(me.__store.name) + " WHERE key = ?";
	                idbModules.DEBUG && console.log(sql, key, primaryKey);
	                idbModules.Key.validate(primaryKey);
	                tx.executeSql(sql, [idbModules.Key.encode(primaryKey)], function(tx, data){
	                    me.__prefetchedData = null;
	                    me.__prefetchedIndex = 0;
	                    if (data.rowsAffected === 1) {
	                        // lower the offset or we will miss a row
	                        me.__offset--;
	                        success(undefined);
	                    }
	                    else {
	                        error("No rows with key found" + key);
	                    }
	                }, function(tx, data){
	                    error(data);
	                });
	            }, error);
	        });
	    };

	    idbModules.IDBCursor = IDBCursor;
	}(idbModules));

	(function(idbModules, undefined) {
	    'use strict';

	    /**
	     * IDB Index
	     * http://www.w3.org/TR/IndexedDB/#idl-def-IDBIndex
	     * @param {IDBObjectStore} store
	     * @param {IDBIndexProperties} indexProperties
	     * @constructor
	     */
	    function IDBIndex(store, indexProperties) {
	        this.objectStore = store;
	        this.name = indexProperties.columnName;
	        this.keyPath = indexProperties.keyPath;
	        this.multiEntry = indexProperties.optionalParams && indexProperties.optionalParams.multiEntry;
	        this.unique = indexProperties.optionalParams && indexProperties.optionalParams.unique;
	        this.__deleted = !!indexProperties.__deleted;
	    }

	    /**
	     * Clones an IDBIndex instance for a different IDBObjectStore instance.
	     * @param {IDBIndex} index
	     * @param {IDBObjectStore} store
	     * @protected
	     */
	    IDBIndex.__clone = function(index, store) {
	        return new IDBIndex(store, {
	            columnName: index.name,
	            keyPath: index.keyPath,
	            optionalParams: {
	                multiEntry: index.multiEntry,
	                unique: index.unique
	            }
	        });
	    };

	    /**
	     * Creates a new index on an object store.
	     * @param {IDBObjectStore} store
	     * @param {IDBIndex} index
	     * @returns {IDBIndex}
	     * @protected
	     */
	    IDBIndex.__createIndex = function(store, index) {
	        var columnExists = !!store.__indexes[index.name] && store.__indexes[index.name].__deleted;

	        // Add the index to the IDBObjectStore
	        store.__indexes[index.name] = index;
	        store.indexNames.push(index.name);

	        // Create the index in WebSQL
	        var transaction = store.transaction;
	        transaction.__addToTransactionQueue(function createIndex(tx, args, success, failure) {
	            function error(tx, err) {
	                failure(idbModules.util.createDOMException(0, "Could not create index \"" + index.name + "\"", err));
	            }

	            function applyIndex(tx) {
	                // Update the object store's index list
	                IDBIndex.__updateIndexList(store, tx, function() {
	                    // Add index entries for all existing records
	                    tx.executeSql("SELECT * FROM " + idbModules.util.quote(store.name), [], function(tx, data) {
	                        idbModules.DEBUG && console.log("Adding existing " + store.name + " records to the " + index.name + " index");
	                        addIndexEntry(0);

	                        function addIndexEntry(i) {
	                            if (i < data.rows.length) {
	                                try {
	                                    var value = idbModules.Sca.decode(data.rows.item(i).value);
	                                    var indexKey = idbModules.Key.getValue(value, index.keyPath);
	                                    indexKey = idbModules.Key.encode(indexKey, index.multiEntry);

	                                    tx.executeSql("UPDATE " + idbModules.util.quote(store.name) + " set " + idbModules.util.quote(index.name) + " = ? where key = ?", [indexKey, data.rows.item(i).key], function(tx, data) {
	                                        addIndexEntry(i + 1);
	                                    }, error);
	                                }
	                                catch (e) {
	                                    // Not a valid value to insert into index, so just continue
	                                    addIndexEntry(i + 1);
	                                }
	                            }
	                            else {
	                                success(store);
	                            }
	                        }
	                    }, error);
	                }, error);
	            }

	            if (columnExists) {
	                // For a previously existing index, just update the index entries in the existing column
	                applyIndex(tx);
	            }
	            else {
	                // For a new index, add a new column to the object store, then apply the index
	                var sql = ["ALTER TABLE", idbModules.util.quote(store.name), "ADD", idbModules.util.quote(index.name), "BLOB"].join(" ");
	                idbModules.DEBUG && console.log(sql);
	                tx.executeSql(sql, [], applyIndex, error);
	            }
	        });
	    };

	    /**
	     * Deletes an index from an object store.
	     * @param {IDBObjectStore} store
	     * @param {IDBIndex} index
	     * @protected
	     */
	    IDBIndex.__deleteIndex = function(store, index) {
	        // Remove the index from the IDBObjectStore
	        store.__indexes[index.name].__deleted = true;
	        store.indexNames.splice(store.indexNames.indexOf(index.name), 1);

	        // Remove the index in WebSQL
	        var transaction = store.transaction;
	        transaction.__addToTransactionQueue(function createIndex(tx, args, success, failure) {
	            function error(tx, err) {
	                failure(idbModules.util.createDOMException(0, "Could not delete index \"" + index.name + "\"", err));
	            }

	            // Update the object store's index list
	            IDBIndex.__updateIndexList(store, tx, success, error);
	        });
	    };

	    /**
	     * Updates index list for the given object store.
	     * @param {IDBObjectStore} store
	     * @param {object} tx
	     * @param {function} success
	     * @param {function} failure
	     */
	    IDBIndex.__updateIndexList = function(store, tx, success, failure) {
	        var indexList = {};
	        for (var i = 0; i < store.indexNames.length; i++) {
	            var idx = store.__indexes[store.indexNames[i]];
	            /** @type {IDBIndexProperties} **/
	            indexList[idx.name] = {
	                columnName: idx.name,
	                keyPath: idx.keyPath,
	                optionalParams: {
	                    unique: idx.unique,
	                    multiEntry: idx.multiEntry
	                },
	                deleted: !!idx.deleted
	            };
	        }

	        idbModules.DEBUG && console.log("Updating the index list for " + store.name, indexList);
	        tx.executeSql("UPDATE __sys__ set indexList = ? where name = ?", [JSON.stringify(indexList), store.name], function() {
	            success(store);
	        }, failure);
	    };

	    /**
	     * Retrieves index data for the given key
	     * @param {*|IDBKeyRange} key
	     * @param {string} opType
	     * @returns {IDBRequest}
	     * @private
	     */
	    IDBIndex.prototype.__fetchIndexData = function(key, opType) {
	        var me = this;
	        var hasKey, encodedKey;

	        // key is optional
	        if (arguments.length === 1) {
	            opType = key;
	            hasKey = false;
	        }
	        else {
	            idbModules.Key.validate(key);
	            encodedKey = idbModules.Key.encode(key, me.multiEntry);
	            hasKey = true;
	        }

	        return me.objectStore.transaction.__addToTransactionQueue(function fetchIndexData(tx, args, success, error) {
	            var sql = ["SELECT * FROM", idbModules.util.quote(me.objectStore.name), "WHERE", idbModules.util.quote(me.name), "NOT NULL"];
	            var sqlValues = [];
	            if (hasKey) {
	                if (me.multiEntry) {
	                    sql.push("AND", idbModules.util.quote(me.name), "LIKE ?");
	                    sqlValues.push("%" + encodedKey + "%");
	                }
	                else {
	                    sql.push("AND", idbModules.util.quote(me.name), "= ?");
	                    sqlValues.push(encodedKey);
	                }
	            }
	            idbModules.DEBUG && console.log("Trying to fetch data for Index", sql.join(" "), sqlValues);
	            tx.executeSql(sql.join(" "), sqlValues, function(tx, data) {
	                var recordCount = 0, record = null;
	                if (me.multiEntry) {
	                    for (var i = 0; i < data.rows.length; i++) {
	                        var row = data.rows.item(i);
	                        var rowKey = idbModules.Key.decode(row[me.name]);
	                        if (hasKey && idbModules.Key.isMultiEntryMatch(encodedKey, row[me.name])) {
	                            recordCount++;
	                            record = record || row;
	                        }
	                        else if (!hasKey && rowKey !== undefined) {
	                            recordCount = recordCount + (rowKey instanceof Array ? rowKey.length : 1);
	                            record = record || row;
	                        }
	                    }
	                }
	                else {
	                    recordCount = data.rows.length;
	                    record = recordCount && data.rows.item(0);
	                }

	                if (opType === "count") {
	                    success(recordCount);
	                }
	                else if (recordCount === 0) {
	                    success(undefined);
	                }
	                else if (opType === "key") {
	                    success(idbModules.Key.decode(record.key));
	                }
	                else { // when opType is value
	                    success(idbModules.Sca.decode(record.value));
	                }
	            }, error);
	        });
	    };

	    /**
	     * Opens a cursor over the given key range.
	     * @param {IDBKeyRange} range
	     * @param {string} direction
	     * @returns {IDBRequest}
	     */
	    IDBIndex.prototype.openCursor = function(range, direction) {
	        return new idbModules.IDBCursor(range, direction, this.objectStore, this, this.name, "value").__req;
	    };

	    /**
	     * Opens a cursor over the given key range.  The cursor only includes key values, not data.
	     * @param {IDBKeyRange} range
	     * @param {string} direction
	     * @returns {IDBRequest}
	     */
	    IDBIndex.prototype.openKeyCursor = function(range, direction) {
	        return new idbModules.IDBCursor(range, direction, this.objectStore, this, this.name, "key").__req;
	    };

	    IDBIndex.prototype.get = function(key) {
	        if (arguments.length === 0) {
	            throw new TypeError("No key was specified");
	        }

	        return this.__fetchIndexData(key, "value");
	    };

	    IDBIndex.prototype.getKey = function(key) {
	        if (arguments.length === 0) {
	            throw new TypeError("No key was specified");
	        }

	        return this.__fetchIndexData(key, "key");
	    };

	    IDBIndex.prototype.count = function(key) {
	        // key is optional
	        if (key === undefined) {
	            return this.__fetchIndexData("count");
	        }
	        else if (key instanceof idbModules.IDBKeyRange) {
	            return new idbModules.IDBCursor(key, "next", this.objectStore, this, this.name, "value", true).__req;
	        }
	        else {
	            return this.__fetchIndexData(key, "count");
	        }
	    };

	    idbModules.IDBIndex = IDBIndex;
	}(idbModules));

	(function(idbModules) {
	    'use strict';

	    /**
	     * IndexedDB Object Store
	     * http://dvcs.w3.org/hg/IndexedDB/raw-file/tip/Overview.html#idl-def-IDBObjectStore
	     * @param {IDBObjectStoreProperties} storeProperties
	     * @param {IDBTransaction} transaction
	     * @constructor
	     */
	    function IDBObjectStore(storeProperties, transaction) {
	        this.name = storeProperties.name;
	        this.keyPath = JSON.parse(storeProperties.keyPath);
	        this.transaction = transaction;

	        // autoInc is numeric (0/1) on WinPhone
	        this.autoIncrement = typeof storeProperties.autoInc === "string" ? storeProperties.autoInc === "true" : !!storeProperties.autoInc;

	        this.__indexes = {};
	        this.indexNames = new idbModules.util.StringList();
	        var indexList = JSON.parse(storeProperties.indexList);
	        for (var indexName in indexList) {
	            if (indexList.hasOwnProperty(indexName)) {
	                var index = new idbModules.IDBIndex(this, indexList[indexName]);
	                this.__indexes[index.name] = index;
	                if (!index.__deleted) {
	                    this.indexNames.push(index.name);
	                }
	            }
	        }
	    }

	    /**
	     * Clones an IDBObjectStore instance for a different IDBTransaction instance.
	     * @param {IDBObjectStore} store
	     * @param {IDBTransaction} transaction
	     * @protected
	     */
	    IDBObjectStore.__clone = function(store, transaction) {
	        var newStore = new IDBObjectStore({
	            name: store.name,
	            keyPath: JSON.stringify(store.keyPath),
	            autoInc: JSON.stringify(store.autoIncrement),
	            indexList: "{}"
	        }, transaction);
	        newStore.__indexes = store.__indexes;
	        newStore.indexNames = store.indexNames;
	        return newStore;
	    };

	    /**
	     * Creates a new object store in the database.
	     * @param {IDBDatabase} db
	     * @param {IDBObjectStore} store
	     * @protected
	     */
	    IDBObjectStore.__createObjectStore = function(db, store) {
	        // Add the object store to the IDBDatabase
	        db.__objectStores[store.name] = store;
	        db.objectStoreNames.push(store.name);

	        // Add the object store to WebSQL
	        var transaction = db.__versionTransaction;
	        idbModules.IDBTransaction.__assertVersionChange(transaction);
	        transaction.__addToTransactionQueue(function createObjectStore(tx, args, success, failure) {
	            function error(tx, err) {
	                throw idbModules.util.createDOMException(0, "Could not create object store \"" + store.name + "\"", err);
	            }

	            //key INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL UNIQUE
	            var sql = ["CREATE TABLE", idbModules.util.quote(store.name), "(key BLOB", store.autoIncrement ? "UNIQUE, inc INTEGER PRIMARY KEY AUTOINCREMENT" : "PRIMARY KEY", ", value BLOB)"].join(" ");
	            idbModules.DEBUG && console.log(sql);
	            tx.executeSql(sql, [], function(tx, data) {
	                tx.executeSql("INSERT INTO __sys__ VALUES (?,?,?,?)", [store.name, JSON.stringify(store.keyPath), store.autoIncrement, "{}"], function() {
	                    success(store);
	                }, error);
	            }, error);
	        });
	    };

	    /**
	     * Deletes an object store from the database.
	     * @param {IDBDatabase} db
	     * @param {IDBObjectStore} store
	     * @protected
	     */
	    IDBObjectStore.__deleteObjectStore = function(db, store) {
	        // Remove the object store from the IDBDatabase
	        db.__objectStores[store.name] = undefined;
	        db.objectStoreNames.splice(db.objectStoreNames.indexOf(store.name), 1);

	        // Remove the object store from WebSQL
	        var transaction = db.__versionTransaction;
	        idbModules.IDBTransaction.__assertVersionChange(transaction);
	        transaction.__addToTransactionQueue(function deleteObjectStore(tx, args, success, failure) {
	            function error(tx, err) {
	                failure(idbModules.util.createDOMException(0, "Could not delete ObjectStore", err));
	            }

	            tx.executeSql("SELECT * FROM __sys__ where name = ?", [store.name], function(tx, data) {
	                if (data.rows.length > 0) {
	                    tx.executeSql("DROP TABLE " + idbModules.util.quote(store.name), [], function() {
	                        tx.executeSql("DELETE FROM __sys__ WHERE name = ?", [store.name], function() {
	                            success();
	                        }, error);
	                    }, error);
	                }
	            });
	        });
	    };

	    /**
	     * Determines whether the given inline or out-of-line key is valid, according to the object store's schema.
	     * @param {*} value     Used for inline keys
	     * @param {*} key       Used for out-of-line keys
	     * @private
	     */
	    IDBObjectStore.prototype.__validateKey = function(value, key) {
	        if (this.keyPath) {
	            if (typeof key !== "undefined") {
	                throw idbModules.util.createDOMException("DataError", "The object store uses in-line keys and the key parameter was provided", this);
	            }
	            else if (value && typeof value === "object") {
	                key = idbModules.Key.getValue(value, this.keyPath);
	                if (key === undefined) {
	                    if (this.autoIncrement) {
	                        // A key will be generated
	                        return;
	                    }
	                    else {
	                        throw idbModules.util.createDOMException("DataError", "Could not eval key from keyPath");
	                    }
	                }
	            }
	            else {
	                throw idbModules.util.createDOMException("DataError", "KeyPath was specified, but value was not an object");
	            }
	        }
	        else {
	            if (typeof key === "undefined") {
	                if (this.autoIncrement) {
	                    // A key will be generated
	                    return;
	                }
	                else {
	                    throw idbModules.util.createDOMException("DataError", "The object store uses out-of-line keys and has no key generator and the key parameter was not provided. ", this);
	                }
	            }
	        }

	        idbModules.Key.validate(key);
	    };

	    /**
	     * From the store properties and object, extracts the value for the key in hte object Store
	     * If the table has auto increment, get the next in sequence
	     * @param {Object} tx
	     * @param {Object} value
	     * @param {Object} key
	     * @param {function} success
	     * @param {function} failure
	     */
	    IDBObjectStore.prototype.__deriveKey = function(tx, value, key, success, failure) {
	        var me = this;

	        function getNextAutoIncKey(callback) {
	            tx.executeSql("SELECT * FROM sqlite_sequence where name like ?", [me.name], function(tx, data) {
	                if (data.rows.length !== 1) {
	                    callback(1);
	                }
	                else {
	                    callback(data.rows.item(0).seq + 1);
	                }
	            }, function(tx, error) {
	                failure(idbModules.util.createDOMException("DataError", "Could not get the auto increment value for key", error));
	            });
	        }

	        if (me.keyPath) {
	            var primaryKey = idbModules.Key.getValue(value, me.keyPath);
	            if (primaryKey === undefined && me.autoIncrement) {
	                getNextAutoIncKey(function(primaryKey) {
	                    try {
	                        // Update the value with the new key
	                        idbModules.Key.setValue(value, me.keyPath, primaryKey);
	                        success(primaryKey);
	                    }
	                    catch (e) {
	                        failure(idbModules.util.createDOMException("DataError", "Could not assign a generated value to the keyPath", e));
	                    }
	                });
	            }
	            else {
	                success(primaryKey);
	            }
	        }
	        else {
	            if (typeof key === "undefined" && me.autoIncrement) {
	                // Looks like this has autoInc, so lets get the next in sequence and return that.
	                getNextAutoIncKey(success);
	            }
	            else {
	                success(key);
	            }
	        }
	    };

	    IDBObjectStore.prototype.__insertData = function(tx, encoded, value, primaryKey, success, error) {
	        try {
	            var paramMap = {};
	            if (typeof primaryKey !== "undefined") {
	                idbModules.Key.validate(primaryKey);
	                paramMap.key = idbModules.Key.encode(primaryKey);
	            }
	            for (var i = 0; i < this.indexNames.length; i++) {
	                var index = this.__indexes[this.indexNames[i]];
	                paramMap[index.name] = idbModules.Key.encode(idbModules.Key.getValue(value, index.keyPath), index.multiEntry);
	            }
	            var sqlStart = ["INSERT INTO ", idbModules.util.quote(this.name), "("];
	            var sqlEnd = [" VALUES ("];
	            var sqlValues = [];
	            for (var key in paramMap) {
	                sqlStart.push(idbModules.util.quote(key) + ",");
	                sqlEnd.push("?,");
	                sqlValues.push(paramMap[key]);
	            }
	            // removing the trailing comma
	            sqlStart.push("value )");
	            sqlEnd.push("?)");
	            sqlValues.push(encoded);

	            var sql = sqlStart.join(" ") + sqlEnd.join(" ");

	            idbModules.DEBUG && console.log("SQL for adding", sql, sqlValues);
	            tx.executeSql(sql, sqlValues, function(tx, data) {
	                idbModules.Sca.encode(primaryKey, function(primaryKey) {
	                    primaryKey = idbModules.Sca.decode(primaryKey);
	                    success(primaryKey);
	                });
	            }, function(tx, err) {
	                error(idbModules.util.createDOMError("ConstraintError", err.message, err));
	            });
	        }
	        catch (e) {
	            error(e);
	        }
	    };

	    IDBObjectStore.prototype.add = function(value, key) {
	        var me = this;
	        if (arguments.length === 0) {
	            throw new TypeError("No value was specified");
	        }
	        this.__validateKey(value, key);
	        me.transaction.__assertWritable();

	        var request = me.transaction.__createRequest();
	        me.transaction.__pushToQueue(request, function objectStoreAdd(tx, args, success, error) {
	            me.__deriveKey(tx, value, key, function(primaryKey) {
	                idbModules.Sca.encode(value, function(encoded) {
	                    me.__insertData(tx, encoded, value, primaryKey, success, error);
	                });
	            }, error);
	        });
	        return request;
	    };

	    IDBObjectStore.prototype.put = function(value, key) {
	        var me = this;
	        if (arguments.length === 0) {
	            throw new TypeError("No value was specified");
	        }
	        this.__validateKey(value, key);
	        me.transaction.__assertWritable();

	        var request = me.transaction.__createRequest();
	        me.transaction.__pushToQueue(request, function objectStorePut(tx, args, success, error) {
	            me.__deriveKey(tx, value, key, function(primaryKey) {
	                idbModules.Sca.encode(value, function(encoded) {
	                    // First try to delete if the record exists
	                    idbModules.Key.validate(primaryKey);
	                    var sql = "DELETE FROM " + idbModules.util.quote(me.name) + " where key = ?";
	                    tx.executeSql(sql, [idbModules.Key.encode(primaryKey)], function(tx, data) {
	                        idbModules.DEBUG && console.log("Did the row with the", primaryKey, "exist? ", data.rowsAffected);
	                        me.__insertData(tx, encoded, value, primaryKey, success, error);
	                    }, function(tx, err) {
	                        error(err);
	                    });
	                });
	            }, error);
	        });
	        return request;
	    };

	    IDBObjectStore.prototype.get = function(key) {
	        // TODO Key should also be a key range
	        var me = this;

	        if (arguments.length === 0) {
	            throw new TypeError("No key was specified");
	        }

	        idbModules.Key.validate(key);
	        var primaryKey = idbModules.Key.encode(key);
	        return me.transaction.__addToTransactionQueue(function objectStoreGet(tx, args, success, error) {
	            idbModules.DEBUG && console.log("Fetching", me.name, primaryKey);
	            tx.executeSql("SELECT * FROM " + idbModules.util.quote(me.name) + " where key = ?", [primaryKey], function(tx, data) {
	                idbModules.DEBUG && console.log("Fetched data", data);
	                var value;
	                try {
	                    // Opera can't deal with the try-catch here.
	                    if (0 === data.rows.length) {
	                        return success();
	                    }

	                    value = idbModules.Sca.decode(data.rows.item(0).value);
	                }
	                catch (e) {
	                    // If no result is returned, or error occurs when parsing JSON
	                    idbModules.DEBUG && console.log(e);
	                }
	                success(value);
	            }, function(tx, err) {
	                error(err);
	            });
	        });
	    };

	    IDBObjectStore.prototype["delete"] = function(key) {
	        var me = this;

	        if (arguments.length === 0) {
	            throw new TypeError("No key was specified");
	        }

	        me.transaction.__assertWritable();
	        idbModules.Key.validate(key);
	        var primaryKey = idbModules.Key.encode(key);
	        // TODO key should also support key ranges
	        return me.transaction.__addToTransactionQueue(function objectStoreDelete(tx, args, success, error) {
	            idbModules.DEBUG && console.log("Fetching", me.name, primaryKey);
	            tx.executeSql("DELETE FROM " + idbModules.util.quote(me.name) + " where key = ?", [primaryKey], function(tx, data) {
	                idbModules.DEBUG && console.log("Deleted from database", data.rowsAffected);
	                success();
	            }, function(tx, err) {
	                error(err);
	            });
	        });
	    };

	    IDBObjectStore.prototype.clear = function() {
	        var me = this;
	        me.transaction.__assertWritable();
	        return me.transaction.__addToTransactionQueue(function objectStoreClear(tx, args, success, error) {
	            tx.executeSql("DELETE FROM " + idbModules.util.quote(me.name), [], function(tx, data) {
	                idbModules.DEBUG && console.log("Cleared all records from database", data.rowsAffected);
	                success();
	            }, function(tx, err) {
	                error(err);
	            });
	        });
	    };

	    IDBObjectStore.prototype.count = function(key) {
	        if (key instanceof idbModules.IDBKeyRange) {
	            return new idbModules.IDBCursor(key, "next", this, this, "key", "value", true).__req;
	        }
	        else {
	            var me = this;
	            var hasKey = false;

	            // key is optional
	            if (key !== undefined) {
	                hasKey = true;
	                idbModules.Key.validate(key);
	            }

	            return me.transaction.__addToTransactionQueue(function objectStoreCount(tx, args, success, error) {
	                var sql = "SELECT * FROM " + idbModules.util.quote(me.name) + (hasKey ? " WHERE key = ?" : "");
	                var sqlValues = [];
	                hasKey && sqlValues.push(idbModules.Key.encode(key));
	                tx.executeSql(sql, sqlValues, function(tx, data) {
	                    success(data.rows.length);
	                }, function(tx, err) {
	                    error(err);
	                });
	            });
	        }
	    };

	    IDBObjectStore.prototype.openCursor = function(range, direction) {
	        return new idbModules.IDBCursor(range, direction, this, this, "key", "value").__req;
	    };

	    IDBObjectStore.prototype.index = function(indexName) {
	        if (arguments.length === 0) {
	            throw new TypeError("No index name was specified");
	        }
	        var index = this.__indexes[indexName];
	        if (!index) {
	            throw idbModules.util.createDOMException("NotFoundError", "Index \"" + indexName + "\" does not exist on " + this.name);
	        }

	        return idbModules.IDBIndex.__clone(index, this);
	    };

	    /**
	     * Creates a new index on the object store.
	     * @param {string} indexName
	     * @param {string} keyPath
	     * @param {object} optionalParameters
	     * @returns {IDBIndex}
	     */
	    IDBObjectStore.prototype.createIndex = function(indexName, keyPath, optionalParameters) {
	        if (arguments.length === 0) {
	            throw new TypeError("No index name was specified");
	        }
	        if (arguments.length === 1) {
	            throw new TypeError("No key path was specified");
	        }
	        if (keyPath instanceof Array && optionalParameters && optionalParameters.multiEntry) {
	            throw idbModules.util.createDOMException("InvalidAccessError", "The keyPath argument was an array and the multiEntry option is true.");
	        }
	        if (this.__indexes[indexName] && !this.__indexes[indexName].__deleted) {
	            throw idbModules.util.createDOMException("ConstraintError", "Index \"" + indexName + "\" already exists on " + this.name);
	        }

	        this.transaction.__assertVersionChange();

	        optionalParameters = optionalParameters || {};
	        /** @name IDBIndexProperties **/
	        var indexProperties = {
	            columnName: indexName,
	            keyPath: keyPath,
	            optionalParams: {
	                unique: !!optionalParameters.unique,
	                multiEntry: !!optionalParameters.multiEntry
	            }
	        };
	        var index = new idbModules.IDBIndex(this, indexProperties);
	        idbModules.IDBIndex.__createIndex(this, index);
	        return index;
	    };

	    IDBObjectStore.prototype.deleteIndex = function(indexName) {
	        if (arguments.length === 0) {
	            throw new TypeError("No index name was specified");
	        }
	        var index = this.__indexes[indexName];
	        if (!index) {
	            throw idbModules.util.createDOMException("NotFoundError", "Index \"" + indexName + "\" does not exist on " + this.name);
	        }
	        this.transaction.__assertVersionChange();

	        idbModules.IDBIndex.__deleteIndex(this, index);
	    };

	    idbModules.IDBObjectStore = IDBObjectStore;
	}(idbModules));

	(function(idbModules) {
	    'use strict';

	    var uniqueID = 0;

	    /**
	     * The IndexedDB Transaction
	     * http://dvcs.w3.org/hg/IndexedDB/raw-file/tip/Overview.html#idl-def-IDBTransaction
	     * @param {IDBDatabase} db
	     * @param {string[]} storeNames
	     * @param {string} mode
	     * @constructor
	     */
	    function IDBTransaction(db, storeNames, mode) {
	        this.__id = ++uniqueID; // for debugging simultaneous transactions
	        this.__active = true;
	        this.__running = false;
	        this.__errored = false;
	        this.__requests = [];
	        this.__storeNames = storeNames;
	        this.mode = mode;
	        this.db = db;
	        this.error = null;
	        this.onabort = this.onerror = this.oncomplete = null;

	        // Kick off the transaction as soon as all synchronous code is done.
	        var me = this;
	        setTimeout(function() { me.__executeRequests(); }, 0);
	    }

	    IDBTransaction.prototype.__executeRequests = function() {
	        if (this.__running) {
	            idbModules.DEBUG && console.log("Looks like the request set is already running", this.mode);
	            return;
	        }

	        this.__running = true;
	        var me = this;

	        me.db.__db.transaction(function executeRequests(tx) {
	                me.__tx = tx;
	                var q = null, i = 0;

	                function success(result, req) {
	                    if (req) {
	                        q.req = req;// Need to do this in case of cursors
	                    }
	                    q.req.readyState = "done";
	                    q.req.result = result;
	                    delete q.req.error;
	                    var e = idbModules.util.createEvent("success");
	                    idbModules.util.callback("onsuccess", q.req, e);
	                    i++;
	                    executeNextRequest();
	                }

	                function error(tx, err) {
	                    err = idbModules.util.findError(arguments);
	                    try {
	                        // Fire an error event for the current IDBRequest
	                        q.req.readyState = "done";
	                        q.req.error = err || "DOMError";
	                        q.req.result = undefined;
	                        var e = idbModules.util.createEvent("error", err);
	                        idbModules.util.callback("onerror", q.req, e);
	                    }
	                    finally {
	                        // Fire an error event for the transaction
	                        transactionError(err);
	                    }
	                }

	                function executeNextRequest() {
	                    if (i >= me.__requests.length) {
	                        // All requests in the transaction are done
	                        me.__requests = [];
	                        if (me.__active) {
	                            me.__active = false;
	                            transactionFinished();
	                        }
	                    }
	                    else {
	                        try {
	                            q = me.__requests[i];
	                            q.op(tx, q.args, success, error);
	                        }
	                        catch (e) {
	                            error(e);
	                        }
	                    }
	                }

	                executeNextRequest();
	            },

	            function webSqlError(err) {
	                transactionError(err);
	            }
	        );

	        function transactionError(err) {
	            idbModules.util.logError("Error", "An error occurred in a transaction", err);

	            if (me.__errored) {
	                // We've already called "onerror", "onabort", or thrown, so don't do it again.
	                return;
	            }

	            me.__errored = true;

	            if (!me.__active) {
	                // The transaction has already completed, so we can't call "onerror" or "onabort".
	                // So throw the error instead.
	                throw err;
	            }

	            try {
	                me.error = err;
	                var evt = idbModules.util.createEvent("error");
	                idbModules.util.callback("onerror", me, evt);
	                idbModules.util.callback("onerror", me.db, evt);
	            }
	            finally {
	                me.abort();
	            }
	        }

	        function transactionFinished() {
	            idbModules.DEBUG && console.log("Transaction completed");
	            var evt = idbModules.util.createEvent("complete");
	            try {
	                idbModules.util.callback("oncomplete", me, evt);
	                idbModules.util.callback("__oncomplete", me, evt);
	            }
	            catch (e) {
	                // An error occurred in the "oncomplete" handler.
	                // It's too late to call "onerror" or "onabort". Throw a global error instead.
	                // (this may seem odd/bad, but it's how all native IndexedDB implementations work)
	                me.__errored = true;
	                throw e;
	            }
	        }
	    };

	    /**
	     * Creates a new IDBRequest for the transaction.
	     * NOTE: The transaction is not queued util you call {@link IDBTransaction#__pushToQueue}
	     * @returns {IDBRequest}
	     * @protected
	     */
	    IDBTransaction.prototype.__createRequest = function() {
	        var request = new idbModules.IDBRequest();
	        request.source = this.db;
	        request.transaction = this;
	        return request;
	    };

	    /**
	     * Adds a callback function to the transaction queue
	     * @param {function} callback
	     * @param {*} args
	     * @returns {IDBRequest}
	     * @protected
	     */
	    IDBTransaction.prototype.__addToTransactionQueue = function(callback, args) {
	        var request = this.__createRequest();
	        this.__pushToQueue(request, callback, args);
	        return request;
	    };

	    /**
	     * Adds an IDBRequest to the transaction queue
	     * @param {IDBRequest} request
	     * @param {function} callback
	     * @param {*} args
	     * @protected
	     */
	    IDBTransaction.prototype.__pushToQueue = function(request, callback, args) {
	        this.__assertActive();
	        this.__requests.push({
	            "op": callback,
	            "args": args,
	            "req": request
	        });
	    };

	    IDBTransaction.prototype.__assertActive = function() {
	        if (!this.__active) {
	            throw idbModules.util.createDOMException("TransactionInactiveError", "A request was placed against a transaction which is currently not active, or which is finished");
	        }
	    };

	    IDBTransaction.prototype.__assertWritable = function() {
	        if (this.mode === IDBTransaction.READ_ONLY) {
	            throw idbModules.util.createDOMException("ReadOnlyError", "The transaction is read only");
	        }
	    };

	    IDBTransaction.prototype.__assertVersionChange = function() {
	        IDBTransaction.__assertVersionChange(this);
	    };

	    IDBTransaction.__assertVersionChange = function(tx) {
	        if (!tx || tx.mode !== IDBTransaction.VERSION_CHANGE) {
	            throw idbModules.util.createDOMException("InvalidStateError", "Not a version transaction");
	        }
	    };

	    /**
	     * Returns the specified object store.
	     * @param {string} objectStoreName
	     * @returns {IDBObjectStore}
	     */
	    IDBTransaction.prototype.objectStore = function(objectStoreName) {
	        if (arguments.length === 0) {
	            throw new TypeError("No object store name was specified");
	        }
	        if (!this.__active) {
	            throw idbModules.util.createDOMException("InvalidStateError", "A request was placed against a transaction which is currently not active, or which is finished");
	        }
	        if (this.__storeNames.indexOf(objectStoreName) === -1 && this.mode !== IDBTransaction.VERSION_CHANGE) {
	            throw idbModules.util.createDOMException("NotFoundError", objectStoreName + " is not participating in this transaction");
	        }
	        var store = this.db.__objectStores[objectStoreName];
	        if (!store) {
	            throw idbModules.util.createDOMException("NotFoundError", objectStoreName + " does not exist in " + this.db.name);
	        }

	        return idbModules.IDBObjectStore.__clone(store, this);
	    };

	    IDBTransaction.prototype.abort = function() {
	        var me = this;
	        idbModules.DEBUG && console.log("The transaction was aborted", me);
	        me.__active = false;
	        var evt = idbModules.util.createEvent("abort");

	        // Fire the "onabort" event asynchronously, so errors don't bubble
	        setTimeout(function() {
	            idbModules.util.callback("onabort", me, evt);
	        }, 0);
	    };

	    IDBTransaction.READ_ONLY = "readonly";
	    IDBTransaction.READ_WRITE = "readwrite";
	    IDBTransaction.VERSION_CHANGE = "versionchange";

	    idbModules.IDBTransaction = IDBTransaction;
	}(idbModules));

	(function(idbModules){
	    'use strict';

	    /**
	     * IDB Database Object
	     * http://dvcs.w3.org/hg/IndexedDB/raw-file/tip/Overview.html#database-interface
	     * @constructor
	     */
	    function IDBDatabase(db, name, version, storeProperties){
	        this.__db = db;
	        this.__closed = false;
	        this.version = version;
	        this.name = name;
	        this.onabort = this.onerror = this.onversionchange = null;

	        this.__objectStores = {};
	        this.objectStoreNames = new idbModules.util.StringList();
	        for (var i = 0; i < storeProperties.rows.length; i++) {
	            var store = new idbModules.IDBObjectStore(storeProperties.rows.item(i));
	            this.__objectStores[store.name] = store;
	            this.objectStoreNames.push(store.name);
	        }
	    }

	    /**
	     * Creates a new object store.
	     * @param {string} storeName
	     * @param {object} [createOptions]
	     * @returns {IDBObjectStore}
	     */
	    IDBDatabase.prototype.createObjectStore = function(storeName, createOptions){
	        if (arguments.length === 0) {
	            throw new TypeError("No object store name was specified");
	        }
	        if (this.__objectStores[storeName]) {
	            throw idbModules.util.createDOMException("ConstraintError", "Object store \"" + storeName + "\" already exists in " + this.name);
	        }
	        this.__versionTransaction.__assertVersionChange();

	        createOptions = createOptions || {};
	        /** @name IDBObjectStoreProperties **/
	        var storeProperties = {
	            name: storeName,
	            keyPath: JSON.stringify(createOptions.keyPath || null),
	            autoInc: JSON.stringify(createOptions.autoIncrement),
	            indexList: "{}"
	        };
	        var store = new idbModules.IDBObjectStore(storeProperties, this.__versionTransaction);
	        idbModules.IDBObjectStore.__createObjectStore(this, store);
	        return store;
	    };

	    /**
	     * Deletes an object store.
	     * @param {string} storeName
	     */
	    IDBDatabase.prototype.deleteObjectStore = function(storeName){
	        if (arguments.length === 0) {
	            throw new TypeError("No object store name was specified");
	        }
	        var store = this.__objectStores[storeName];
	        if (!store) {
	            throw idbModules.util.createDOMException("NotFoundError", "Object store \"" + storeName + "\" does not exist in " + this.name);
	        }
	        this.__versionTransaction.__assertVersionChange();

	        idbModules.IDBObjectStore.__deleteObjectStore(this, store);
	    };

	    IDBDatabase.prototype.close = function(){
	        this.__closed = true;
	    };

	    /**
	     * Starts a new transaction.
	     * @param {string|string[]} storeNames
	     * @param {string} mode
	     * @returns {IDBTransaction}
	     */
	    IDBDatabase.prototype.transaction = function(storeNames, mode){
	        if (this.__closed) {
	            throw idbModules.util.createDOMException("InvalidStateError", "An attempt was made to start a new transaction on a database connection that is not open");
	        }

	        if (typeof mode === "number") {
	            mode = mode === 1 ? IDBTransaction.READ_WRITE : IDBTransaction.READ_ONLY;
	            idbModules.DEBUG && console.log("Mode should be a string, but was specified as ", mode);
	        }
	        else {
	            mode = mode || IDBTransaction.READ_ONLY;
	        }

	        if (mode !== IDBTransaction.READ_ONLY && mode !== IDBTransaction.READ_WRITE) {
	            throw new TypeError("Invalid transaction mode: " + mode);
	        }

	        storeNames = typeof storeNames === "string" ? [storeNames] : storeNames;
	        if (storeNames.length === 0) {
	            throw idbModules.util.createDOMException("InvalidAccessError", "No object store names were specified");
	        }
	        for (var i = 0; i < storeNames.length; i++) {
	            if (!this.objectStoreNames.contains(storeNames[i])) {
	                throw idbModules.util.createDOMException("NotFoundError", "The \"" + storeNames[i] + "\" object store does not exist");
	            }
	        }

	        var transaction = new idbModules.IDBTransaction(this, storeNames, mode);
	        return transaction;
	    };
	    
	    idbModules.IDBDatabase = IDBDatabase;
	}(idbModules));

	(function(idbModules) {
	    'use strict';

	    var DEFAULT_DB_SIZE = 4 * 1024 * 1024;
	    var sysdb;

	    /**
	     * Craetes the sysDB to keep track of version numbers for databases
	     **/
	    function createSysDB(success, failure) {
	        function sysDbCreateError(tx, err) {
	            err = idbModules.util.findError(arguments);
	            idbModules.DEBUG && console.log("Error in sysdb transaction - when creating dbVersions", err);
	            failure(err);
	        }

	        if (sysdb) {
	            success();
	        }
	        else {
	            sysdb = window.openDatabase("__sysdb__", 1, "System Database", DEFAULT_DB_SIZE);
	            sysdb.transaction(function(tx) {
	                tx.executeSql("CREATE TABLE IF NOT EXISTS dbVersions (name VARCHAR(255), version INT);", [], success, sysDbCreateError);
	            }, sysDbCreateError);
	        }
	    }

	    /**
	     * IDBFactory Class
	     * https://w3c.github.io/IndexedDB/#idl-def-IDBFactory
	     * @constructor
	     */
	    function IDBFactory() {
	        this.modules = idbModules;
	    }

	    /**
	     * The IndexedDB Method to create a new database and return the DB
	     * @param {string} name
	     * @param {number} version
	     */
	    IDBFactory.prototype.open = function(name, version) {
	        var req = new idbModules.IDBOpenDBRequest();
	        var calledDbCreateError = false;

	        if (arguments.length === 0) {
	            throw new TypeError('Database name is required');
	        }
	        else if (arguments.length === 2) {
	            version = parseFloat(version);
	            if (isNaN(version) || !isFinite(version) || version <= 0) {
	                throw new TypeError('Invalid database version: ' + version);
	            }
	        }
	        name = name + ''; // cast to a string

	        function dbCreateError(tx, err) {
	            if (calledDbCreateError) {
	                return;
	            }
	            err = idbModules.util.findError(arguments);
	            calledDbCreateError = true;
	            var evt = idbModules.util.createEvent("error", arguments);
	            req.readyState = "done";
	            req.error = err || "DOMError";
	            idbModules.util.callback("onerror", req, evt);
	        }

	        function openDB(oldVersion) {
	            var db = window.openDatabase(name, 1, name, DEFAULT_DB_SIZE);
	            req.readyState = "done";
	            if (typeof version === "undefined") {
	                version = oldVersion || 1;
	            }
	            if (version <= 0 || oldVersion > version) {
	                var err = idbModules.util.createDOMError("VersionError", "An attempt was made to open a database using a lower version than the existing version.", version);
	                dbCreateError(err);
	                return;
	            }

	            db.transaction(function(tx) {
	                tx.executeSql("CREATE TABLE IF NOT EXISTS __sys__ (name VARCHAR(255), keyPath VARCHAR(255), autoInc BOOLEAN, indexList BLOB)", [], function() {
	                    tx.executeSql("SELECT * FROM __sys__", [], function(tx, data) {
	                        var e = idbModules.util.createEvent("success");
	                        req.source = req.result = new idbModules.IDBDatabase(db, name, version, data);
	                        if (oldVersion < version) {
	                            // DB Upgrade in progress
	                            sysdb.transaction(function(systx) {
	                                systx.executeSql("UPDATE dbVersions set version = ? where name = ?", [version, name], function() {
	                                    var e = idbModules.util.createEvent("upgradeneeded");
	                                    e.oldVersion = oldVersion;
	                                    e.newVersion = version;
	                                    req.transaction = req.result.__versionTransaction = new idbModules.IDBTransaction(req.source, [], idbModules.IDBTransaction.VERSION_CHANGE);
	                                    req.transaction.__addToTransactionQueue(function onupgradeneeded(tx, args, success) {
	                                        idbModules.util.callback("onupgradeneeded", req, e);
	                                        success();
	                                    });
	                                    req.transaction.__oncomplete = function() {
	                                        req.transaction = null;
	                                        var e = idbModules.util.createEvent("success");
	                                        idbModules.util.callback("onsuccess", req, e);
	                                    };
	                                }, dbCreateError);
	                            }, dbCreateError);
	                        } else {
	                            idbModules.util.callback("onsuccess", req, e);
	                        }
	                    }, dbCreateError);
	                }, dbCreateError);
	            }, dbCreateError);
	        }

	        createSysDB(function() {
	            sysdb.transaction(function(tx) {
	                tx.executeSql("SELECT * FROM dbVersions where name = ?", [name], function(tx, data) {
	                    if (data.rows.length === 0) {
	                        // Database with this name does not exist
	                        tx.executeSql("INSERT INTO dbVersions VALUES (?,?)", [name, version || 1], function() {
	                            openDB(0);
	                        }, dbCreateError);
	                    } else {
	                        openDB(data.rows.item(0).version);
	                    }
	                }, dbCreateError);
	            }, dbCreateError);
	        }, dbCreateError);

	        return req;
	    };

	    /**
	     * Deletes a database
	     * @param {string} name
	     * @returns {IDBOpenDBRequest}
	     */
	    IDBFactory.prototype.deleteDatabase = function(name) {
	        var req = new idbModules.IDBOpenDBRequest();
	        var calledDBError = false;
	        var version = null;

	        if (arguments.length === 0) {
	            throw new TypeError('Database name is required');
	        }
	        name = name + ''; // cast to a string

	        function dbError(tx, err) {
	            if (calledDBError) {
	                return;
	            }
	            err = idbModules.util.findError(arguments);
	            req.readyState = "done";
	            req.error = err || "DOMError";
	            var e = idbModules.util.createEvent("error");
	            e.debug = arguments;
	            idbModules.util.callback("onerror", req, e);
	            calledDBError = true;
	        }

	        function deleteFromDbVersions() {
	            sysdb.transaction(function(systx) {
	                systx.executeSql("DELETE FROM dbVersions where name = ? ", [name], function() {
	                    req.result = undefined;
	                    var e = idbModules.util.createEvent("success");
	                    e.newVersion = null;
	                    e.oldVersion = version;
	                    idbModules.util.callback("onsuccess", req, e);
	                }, dbError);
	            }, dbError);
	        }

	        createSysDB(function() {
	            sysdb.transaction(function(systx) {
	                systx.executeSql("SELECT * FROM dbVersions where name = ?", [name], function(tx, data) {
	                    if (data.rows.length === 0) {
	                        req.result = undefined;
	                        var e = idbModules.util.createEvent("success");
	                        e.newVersion = null;
	                        e.oldVersion = version;
	                        idbModules.util.callback("onsuccess", req, e);
	                        return;
	                    }
	                    version = data.rows.item(0).version;
	                    var db = window.openDatabase(name, 1, name, DEFAULT_DB_SIZE);
	                    db.transaction(function(tx) {
	                        tx.executeSql("SELECT * FROM __sys__", [], function(tx, data) {
	                            var tables = data.rows;
	                            (function deleteTables(i) {
	                                if (i >= tables.length) {
	                                    // If all tables are deleted, delete the housekeeping tables
	                                    tx.executeSql("DROP TABLE IF EXISTS __sys__", [], function() {
	                                        // Finally, delete the record for this DB from sysdb
	                                        deleteFromDbVersions();
	                                    }, dbError);
	                                } else {
	                                    // Delete all tables in this database, maintained in the sys table
	                                    tx.executeSql("DROP TABLE " + idbModules.util.quote(tables.item(i).name), [], function() {
	                                        deleteTables(i + 1);
	                                    }, function() {
	                                        deleteTables(i + 1);
	                                    });
	                                }
	                            }(0));
	                        }, function(e) {
	                            // __sysdb table does not exist, but that does not mean delete did not happen
	                            deleteFromDbVersions();
	                        });
	                    });
	                }, dbError);
	            }, dbError);
	        }, dbError);

	        return req;
	    };

	    /**
	     * Compares two keys
	     * @param key1
	     * @param key2
	     * @returns {number}
	     */
	    IDBFactory.prototype.cmp = function(key1, key2) {
	        if (arguments.length < 2) {
	            throw new TypeError("You must provide two keys to be compared");
	        }

	        idbModules.Key.validate(key1);
	        idbModules.Key.validate(key2);
	        var encodedKey1 = idbModules.Key.encode(key1);
	        var encodedKey2 = idbModules.Key.encode(key2);
	        var result = encodedKey1 > encodedKey2 ? 1 : encodedKey1 === encodedKey2 ? 0 : -1;
	        
	        if (idbModules.DEBUG) {
	            // verify that the keys encoded correctly
	            var decodedKey1 = idbModules.Key.decode(encodedKey1);
	            var decodedKey2 = idbModules.Key.decode(encodedKey2);
	            if (typeof key1 === "object") {
	                key1 = JSON.stringify(key1);
	                decodedKey1 = JSON.stringify(decodedKey1);
	            }
	            if (typeof key2 === "object") {
	                key2 = JSON.stringify(key2);
	                decodedKey2 = JSON.stringify(decodedKey2);
	            }

	            // encoding/decoding mismatches are usually due to a loss of floating-point precision
	            if (decodedKey1 !== key1) {
	                console.warn(key1 + ' was incorrectly encoded as ' + decodedKey1);
	            }
	            if (decodedKey2 !== key2) {
	                console.warn(key2 + ' was incorrectly encoded as ' + decodedKey2);
	            }
	        }
	        
	        return result;
	    };


	    idbModules.shimIndexedDB = new IDBFactory();
	    idbModules.IDBFactory = IDBFactory;
	}(idbModules));

	(function(window, idbModules){
	    'use strict';

	    function shim(name, value) {
	        try {
	            // Try setting the property. This will fail if the property is read-only.
	            window[name] = value;
	        }
	        catch (e) {}

	        if (window[name] !== value && Object.defineProperty) {
	            // Setting a read-only property failed, so try re-defining the property
	            try {
	                Object.defineProperty(window, name, {
	                    value: value
	                });
	            }
	            catch (e) {}

	            if (window[name] !== value) {
	                window.console && console.warn && console.warn('Unable to shim ' + name);
	            }
	        }
	    }

	    shim('shimIndexedDB', idbModules.shimIndexedDB);
	    if (window.shimIndexedDB) {
	        window.shimIndexedDB.__useShim = function(){
	            if (typeof window.openDatabase !== "undefined") {
	                // Polyfill ALL of IndexedDB, using WebSQL
	                shim('indexedDB', idbModules.shimIndexedDB);
	                shim('IDBFactory', idbModules.IDBFactory);
	                shim('IDBDatabase', idbModules.IDBDatabase);
	                shim('IDBObjectStore', idbModules.IDBObjectStore);
	                shim('IDBIndex', idbModules.IDBIndex);
	                shim('IDBTransaction', idbModules.IDBTransaction);
	                shim('IDBCursor', idbModules.IDBCursor);
	                shim('IDBKeyRange', idbModules.IDBKeyRange);
	                shim('IDBRequest', idbModules.IDBRequest);
	                shim('IDBOpenDBRequest', idbModules.IDBOpenDBRequest);
	                shim('IDBVersionChangeEvent', idbModules.IDBVersionChangeEvent);
	            }
	            else if (typeof window.indexedDB === "object") {
	                // Polyfill the missing IndexedDB features
	                idbModules.polyfill();
	            }
	        };

	        window.shimIndexedDB.__debug = function(val){
	            idbModules.DEBUG = val;
	        };
	    }
	    
	    // Workaround to prevent an error in Firefox
	    if(!('indexedDB' in window)) {
	        window.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.oIndexedDB || window.msIndexedDB;
	    }
	    
	    // Detect browsers with known IndexedDb issues (e.g. Android pre-4.4)
	    var poorIndexedDbSupport = false;
	    if (navigator.userAgent.match(/Android 2/) || navigator.userAgent.match(/Android 3/) || navigator.userAgent.match(/Android 4\.[0-3]/)) {
	        /* Chrome is an exception. It supports IndexedDb */
	        if (!navigator.userAgent.match(/Chrome/)) {
	            poorIndexedDbSupport = true;
	        }
	    }

	    if ((typeof window.indexedDB === "undefined" || !window.indexedDB || poorIndexedDbSupport) && typeof window.openDatabase !== "undefined") {
	        window.shimIndexedDB.__useShim();
	    }
	    else {
	        window.IDBDatabase = window.IDBDatabase || window.webkitIDBDatabase;
	        window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction;
	        window.IDBCursor = window.IDBCursor || window.webkitIDBCursor;
	        window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange;
	        if(!window.IDBTransaction){
	            window.IDBTransaction = {};
	        }
	        /* Some browsers (e.g. Chrome 18 on Android) support IndexedDb but do not allow writing of these properties */
	        try {
	            window.IDBTransaction.READ_ONLY = window.IDBTransaction.READ_ONLY || "readonly";
	            window.IDBTransaction.READ_WRITE = window.IDBTransaction.READ_WRITE || "readwrite";
	        } catch (e) {}
	    }
	    
	}(window, idbModules));


	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(196)))

/***/ },

/***/ 196:
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {/*global window, global*/
	var util = __webpack_require__(197)
	var assert = __webpack_require__(200)
	var now = __webpack_require__(201)

	var slice = Array.prototype.slice
	var console
	var times = {}

	if (typeof global !== "undefined" && global.console) {
	    console = global.console
	} else if (typeof window !== "undefined" && window.console) {
	    console = window.console
	} else {
	    console = {}
	}

	var functions = [
	    [log, "log"],
	    [info, "info"],
	    [warn, "warn"],
	    [error, "error"],
	    [time, "time"],
	    [timeEnd, "timeEnd"],
	    [trace, "trace"],
	    [dir, "dir"],
	    [consoleAssert, "assert"]
	]

	for (var i = 0; i < functions.length; i++) {
	    var tuple = functions[i]
	    var f = tuple[0]
	    var name = tuple[1]

	    if (!console[name]) {
	        console[name] = f
	    }
	}

	module.exports = console

	function log() {}

	function info() {
	    console.log.apply(console, arguments)
	}

	function warn() {
	    console.log.apply(console, arguments)
	}

	function error() {
	    console.warn.apply(console, arguments)
	}

	function time(label) {
	    times[label] = now()
	}

	function timeEnd(label) {
	    var time = times[label]
	    if (!time) {
	        throw new Error("No such label: " + label)
	    }

	    var duration = now() - time
	    console.log(label + ": " + duration + "ms")
	}

	function trace() {
	    var err = new Error()
	    err.name = "Trace"
	    err.message = util.format.apply(null, arguments)
	    console.error(err.stack)
	}

	function dir(object) {
	    console.log(util.inspect(object) + "\n")
	}

	function consoleAssert(expression) {
	    if (!expression) {
	        var arr = slice.call(arguments, 1)
	        assert.ok(false, util.format.apply(null, arr))
	    }
	}

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },

/***/ 197:
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, process, console) {// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	var formatRegExp = /%[sdj%]/g;
	exports.format = function(f) {
	  if (!isString(f)) {
	    var objects = [];
	    for (var i = 0; i < arguments.length; i++) {
	      objects.push(inspect(arguments[i]));
	    }
	    return objects.join(' ');
	  }

	  var i = 1;
	  var args = arguments;
	  var len = args.length;
	  var str = String(f).replace(formatRegExp, function(x) {
	    if (x === '%%') return '%';
	    if (i >= len) return x;
	    switch (x) {
	      case '%s': return String(args[i++]);
	      case '%d': return Number(args[i++]);
	      case '%j':
	        try {
	          return JSON.stringify(args[i++]);
	        } catch (_) {
	          return '[Circular]';
	        }
	      default:
	        return x;
	    }
	  });
	  for (var x = args[i]; i < len; x = args[++i]) {
	    if (isNull(x) || !isObject(x)) {
	      str += ' ' + x;
	    } else {
	      str += ' ' + inspect(x);
	    }
	  }
	  return str;
	};


	// Mark that a method should not be used.
	// Returns a modified function which warns once by default.
	// If --no-deprecation is set, then it is a no-op.
	exports.deprecate = function(fn, msg) {
	  // Allow for deprecating things in the process of starting up.
	  if (isUndefined(global.process)) {
	    return function() {
	      return exports.deprecate(fn, msg).apply(this, arguments);
	    };
	  }

	  if (process.noDeprecation === true) {
	    return fn;
	  }

	  var warned = false;
	  function deprecated() {
	    if (!warned) {
	      if (process.throwDeprecation) {
	        throw new Error(msg);
	      } else if (process.traceDeprecation) {
	        console.trace(msg);
	      } else {
	        console.error(msg);
	      }
	      warned = true;
	    }
	    return fn.apply(this, arguments);
	  }

	  return deprecated;
	};


	var debugs = {};
	var debugEnviron;
	exports.debuglog = function(set) {
	  if (isUndefined(debugEnviron))
	    debugEnviron = process.env.NODE_DEBUG || '';
	  set = set.toUpperCase();
	  if (!debugs[set]) {
	    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
	      var pid = process.pid;
	      debugs[set] = function() {
	        var msg = exports.format.apply(exports, arguments);
	        console.error('%s %d: %s', set, pid, msg);
	      };
	    } else {
	      debugs[set] = function() {};
	    }
	  }
	  return debugs[set];
	};


	/**
	 * Echos the value of a value. Trys to print the value out
	 * in the best way possible given the different types.
	 *
	 * @param {Object} obj The object to print out.
	 * @param {Object} opts Optional options object that alters the output.
	 */
	/* legacy: obj, showHidden, depth, colors*/
	function inspect(obj, opts) {
	  // default options
	  var ctx = {
	    seen: [],
	    stylize: stylizeNoColor
	  };
	  // legacy...
	  if (arguments.length >= 3) ctx.depth = arguments[2];
	  if (arguments.length >= 4) ctx.colors = arguments[3];
	  if (isBoolean(opts)) {
	    // legacy...
	    ctx.showHidden = opts;
	  } else if (opts) {
	    // got an "options" object
	    exports._extend(ctx, opts);
	  }
	  // set default options
	  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
	  if (isUndefined(ctx.depth)) ctx.depth = 2;
	  if (isUndefined(ctx.colors)) ctx.colors = false;
	  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
	  if (ctx.colors) ctx.stylize = stylizeWithColor;
	  return formatValue(ctx, obj, ctx.depth);
	}
	exports.inspect = inspect;


	// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
	inspect.colors = {
	  'bold' : [1, 22],
	  'italic' : [3, 23],
	  'underline' : [4, 24],
	  'inverse' : [7, 27],
	  'white' : [37, 39],
	  'grey' : [90, 39],
	  'black' : [30, 39],
	  'blue' : [34, 39],
	  'cyan' : [36, 39],
	  'green' : [32, 39],
	  'magenta' : [35, 39],
	  'red' : [31, 39],
	  'yellow' : [33, 39]
	};

	// Don't use 'blue' not visible on cmd.exe
	inspect.styles = {
	  'special': 'cyan',
	  'number': 'yellow',
	  'boolean': 'yellow',
	  'undefined': 'grey',
	  'null': 'bold',
	  'string': 'green',
	  'date': 'magenta',
	  // "name": intentionally not styling
	  'regexp': 'red'
	};


	function stylizeWithColor(str, styleType) {
	  var style = inspect.styles[styleType];

	  if (style) {
	    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
	           '\u001b[' + inspect.colors[style][1] + 'm';
	  } else {
	    return str;
	  }
	}


	function stylizeNoColor(str, styleType) {
	  return str;
	}


	function arrayToHash(array) {
	  var hash = {};

	  array.forEach(function(val, idx) {
	    hash[val] = true;
	  });

	  return hash;
	}


	function formatValue(ctx, value, recurseTimes) {
	  // Provide a hook for user-specified inspect functions.
	  // Check that value is an object with an inspect function on it
	  if (ctx.customInspect &&
	      value &&
	      isFunction(value.inspect) &&
	      // Filter out the util module, it's inspect function is special
	      value.inspect !== exports.inspect &&
	      // Also filter out any prototype objects using the circular check.
	      !(value.constructor && value.constructor.prototype === value)) {
	    var ret = value.inspect(recurseTimes, ctx);
	    if (!isString(ret)) {
	      ret = formatValue(ctx, ret, recurseTimes);
	    }
	    return ret;
	  }

	  // Primitive types cannot have properties
	  var primitive = formatPrimitive(ctx, value);
	  if (primitive) {
	    return primitive;
	  }

	  // Look up the keys of the object.
	  var keys = Object.keys(value);
	  var visibleKeys = arrayToHash(keys);

	  if (ctx.showHidden) {
	    keys = Object.getOwnPropertyNames(value);
	  }

	  // IE doesn't make error fields non-enumerable
	  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
	  if (isError(value)
	      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
	    return formatError(value);
	  }

	  // Some type of object without properties can be shortcutted.
	  if (keys.length === 0) {
	    if (isFunction(value)) {
	      var name = value.name ? ': ' + value.name : '';
	      return ctx.stylize('[Function' + name + ']', 'special');
	    }
	    if (isRegExp(value)) {
	      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
	    }
	    if (isDate(value)) {
	      return ctx.stylize(Date.prototype.toString.call(value), 'date');
	    }
	    if (isError(value)) {
	      return formatError(value);
	    }
	  }

	  var base = '', array = false, braces = ['{', '}'];

	  // Make Array say that they are Array
	  if (isArray(value)) {
	    array = true;
	    braces = ['[', ']'];
	  }

	  // Make functions say that they are functions
	  if (isFunction(value)) {
	    var n = value.name ? ': ' + value.name : '';
	    base = ' [Function' + n + ']';
	  }

	  // Make RegExps say that they are RegExps
	  if (isRegExp(value)) {
	    base = ' ' + RegExp.prototype.toString.call(value);
	  }

	  // Make dates with properties first say the date
	  if (isDate(value)) {
	    base = ' ' + Date.prototype.toUTCString.call(value);
	  }

	  // Make error with message first say the error
	  if (isError(value)) {
	    base = ' ' + formatError(value);
	  }

	  if (keys.length === 0 && (!array || value.length == 0)) {
	    return braces[0] + base + braces[1];
	  }

	  if (recurseTimes < 0) {
	    if (isRegExp(value)) {
	      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
	    } else {
	      return ctx.stylize('[Object]', 'special');
	    }
	  }

	  ctx.seen.push(value);

	  var output;
	  if (array) {
	    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
	  } else {
	    output = keys.map(function(key) {
	      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
	    });
	  }

	  ctx.seen.pop();

	  return reduceToSingleString(output, base, braces);
	}


	function formatPrimitive(ctx, value) {
	  if (isUndefined(value))
	    return ctx.stylize('undefined', 'undefined');
	  if (isString(value)) {
	    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
	                                             .replace(/'/g, "\\'")
	                                             .replace(/\\"/g, '"') + '\'';
	    return ctx.stylize(simple, 'string');
	  }
	  if (isNumber(value))
	    return ctx.stylize('' + value, 'number');
	  if (isBoolean(value))
	    return ctx.stylize('' + value, 'boolean');
	  // For some reason typeof null is "object", so special case here.
	  if (isNull(value))
	    return ctx.stylize('null', 'null');
	}


	function formatError(value) {
	  return '[' + Error.prototype.toString.call(value) + ']';
	}


	function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
	  var output = [];
	  for (var i = 0, l = value.length; i < l; ++i) {
	    if (hasOwnProperty(value, String(i))) {
	      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
	          String(i), true));
	    } else {
	      output.push('');
	    }
	  }
	  keys.forEach(function(key) {
	    if (!key.match(/^\d+$/)) {
	      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
	          key, true));
	    }
	  });
	  return output;
	}


	function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
	  var name, str, desc;
	  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
	  if (desc.get) {
	    if (desc.set) {
	      str = ctx.stylize('[Getter/Setter]', 'special');
	    } else {
	      str = ctx.stylize('[Getter]', 'special');
	    }
	  } else {
	    if (desc.set) {
	      str = ctx.stylize('[Setter]', 'special');
	    }
	  }
	  if (!hasOwnProperty(visibleKeys, key)) {
	    name = '[' + key + ']';
	  }
	  if (!str) {
	    if (ctx.seen.indexOf(desc.value) < 0) {
	      if (isNull(recurseTimes)) {
	        str = formatValue(ctx, desc.value, null);
	      } else {
	        str = formatValue(ctx, desc.value, recurseTimes - 1);
	      }
	      if (str.indexOf('\n') > -1) {
	        if (array) {
	          str = str.split('\n').map(function(line) {
	            return '  ' + line;
	          }).join('\n').substr(2);
	        } else {
	          str = '\n' + str.split('\n').map(function(line) {
	            return '   ' + line;
	          }).join('\n');
	        }
	      }
	    } else {
	      str = ctx.stylize('[Circular]', 'special');
	    }
	  }
	  if (isUndefined(name)) {
	    if (array && key.match(/^\d+$/)) {
	      return str;
	    }
	    name = JSON.stringify('' + key);
	    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
	      name = name.substr(1, name.length - 2);
	      name = ctx.stylize(name, 'name');
	    } else {
	      name = name.replace(/'/g, "\\'")
	                 .replace(/\\"/g, '"')
	                 .replace(/(^"|"$)/g, "'");
	      name = ctx.stylize(name, 'string');
	    }
	  }

	  return name + ': ' + str;
	}


	function reduceToSingleString(output, base, braces) {
	  var numLinesEst = 0;
	  var length = output.reduce(function(prev, cur) {
	    numLinesEst++;
	    if (cur.indexOf('\n') >= 0) numLinesEst++;
	    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
	  }, 0);

	  if (length > 60) {
	    return braces[0] +
	           (base === '' ? '' : base + '\n ') +
	           ' ' +
	           output.join(',\n  ') +
	           ' ' +
	           braces[1];
	  }

	  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
	}


	// NOTE: These type checking functions intentionally don't use `instanceof`
	// because it is fragile and can be easily faked with `Object.create()`.
	function isArray(ar) {
	  return Array.isArray(ar);
	}
	exports.isArray = isArray;

	function isBoolean(arg) {
	  return typeof arg === 'boolean';
	}
	exports.isBoolean = isBoolean;

	function isNull(arg) {
	  return arg === null;
	}
	exports.isNull = isNull;

	function isNullOrUndefined(arg) {
	  return arg == null;
	}
	exports.isNullOrUndefined = isNullOrUndefined;

	function isNumber(arg) {
	  return typeof arg === 'number';
	}
	exports.isNumber = isNumber;

	function isString(arg) {
	  return typeof arg === 'string';
	}
	exports.isString = isString;

	function isSymbol(arg) {
	  return typeof arg === 'symbol';
	}
	exports.isSymbol = isSymbol;

	function isUndefined(arg) {
	  return arg === void 0;
	}
	exports.isUndefined = isUndefined;

	function isRegExp(re) {
	  return isObject(re) && objectToString(re) === '[object RegExp]';
	}
	exports.isRegExp = isRegExp;

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}
	exports.isObject = isObject;

	function isDate(d) {
	  return isObject(d) && objectToString(d) === '[object Date]';
	}
	exports.isDate = isDate;

	function isError(e) {
	  return isObject(e) &&
	      (objectToString(e) === '[object Error]' || e instanceof Error);
	}
	exports.isError = isError;

	function isFunction(arg) {
	  return typeof arg === 'function';
	}
	exports.isFunction = isFunction;

	function isPrimitive(arg) {
	  return arg === null ||
	         typeof arg === 'boolean' ||
	         typeof arg === 'number' ||
	         typeof arg === 'string' ||
	         typeof arg === 'symbol' ||  // ES6 symbol
	         typeof arg === 'undefined';
	}
	exports.isPrimitive = isPrimitive;

	exports.isBuffer = __webpack_require__(198);

	function objectToString(o) {
	  return Object.prototype.toString.call(o);
	}


	function pad(n) {
	  return n < 10 ? '0' + n.toString(10) : n.toString(10);
	}


	var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
	              'Oct', 'Nov', 'Dec'];

	// 26 Feb 16:19:34
	function timestamp() {
	  var d = new Date();
	  var time = [pad(d.getHours()),
	              pad(d.getMinutes()),
	              pad(d.getSeconds())].join(':');
	  return [d.getDate(), months[d.getMonth()], time].join(' ');
	}


	// log is just a thin wrapper to console.log that prepends a timestamp
	exports.log = function() {
	  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
	};


	/**
	 * Inherit the prototype methods from one constructor into another.
	 *
	 * The Function.prototype.inherits from lang.js rewritten as a standalone
	 * function (not on Function.prototype). NOTE: If this file is to be loaded
	 * during bootstrapping this function needs to be rewritten using some native
	 * functions as prototype setup using normal JavaScript does not work as
	 * expected during bootstrapping (see mirror.js in r114903).
	 *
	 * @param {function} ctor Constructor function which needs to inherit the
	 *     prototype.
	 * @param {function} superCtor Constructor function to inherit prototype from.
	 */
	exports.inherits = __webpack_require__(199);

	exports._extend = function(origin, add) {
	  // Don't do anything if add isn't an object
	  if (!add || !isObject(add)) return origin;

	  var keys = Object.keys(add);
	  var i = keys.length;
	  while (i--) {
	    origin[keys[i]] = add[keys[i]];
	  }
	  return origin;
	};

	function hasOwnProperty(obj, prop) {
	  return Object.prototype.hasOwnProperty.call(obj, prop);
	}

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(189), __webpack_require__(196)))

/***/ },

/***/ 198:
/***/ function(module, exports) {

	module.exports = function isBuffer(arg) {
	  return arg && typeof arg === 'object'
	    && typeof arg.copy === 'function'
	    && typeof arg.fill === 'function'
	    && typeof arg.readUInt8 === 'function';
	}

/***/ },

/***/ 199:
/***/ function(module, exports) {

	if (typeof Object.create === 'function') {
	  // implementation from standard node.js 'util' module
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    ctor.prototype = Object.create(superCtor.prototype, {
	      constructor: {
	        value: ctor,
	        enumerable: false,
	        writable: true,
	        configurable: true
	      }
	    });
	  };
	} else {
	  // old school shim for old browsers
	  module.exports = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor
	    var TempCtor = function () {}
	    TempCtor.prototype = superCtor.prototype
	    ctor.prototype = new TempCtor()
	    ctor.prototype.constructor = ctor
	  }
	}


/***/ },

/***/ 200:
/***/ function(module, exports, __webpack_require__) {

	// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
	//
	// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
	//
	// Originally from narwhal.js (http://narwhaljs.org)
	// Copyright (c) 2009 Thomas Robinson <280north.com>
	//
	// Permission is hereby granted, free of charge, to any person obtaining a copy
	// of this software and associated documentation files (the 'Software'), to
	// deal in the Software without restriction, including without limitation the
	// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
	// sell copies of the Software, and to permit persons to whom the Software is
	// furnished to do so, subject to the following conditions:
	//
	// The above copyright notice and this permission notice shall be included in
	// all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
	// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
	// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

	// when used in node, this will actually load the util module we depend on
	// versus loading the builtin util module as happens otherwise
	// this is a bug in node module loading as far as I am concerned
	var util = __webpack_require__(197);

	var pSlice = Array.prototype.slice;
	var hasOwn = Object.prototype.hasOwnProperty;

	// 1. The assert module provides functions that throw
	// AssertionError's when particular conditions are not met. The
	// assert module must conform to the following interface.

	var assert = module.exports = ok;

	// 2. The AssertionError is defined in assert.
	// new assert.AssertionError({ message: message,
	//                             actual: actual,
	//                             expected: expected })

	assert.AssertionError = function AssertionError(options) {
	  this.name = 'AssertionError';
	  this.actual = options.actual;
	  this.expected = options.expected;
	  this.operator = options.operator;
	  if (options.message) {
	    this.message = options.message;
	    this.generatedMessage = false;
	  } else {
	    this.message = getMessage(this);
	    this.generatedMessage = true;
	  }
	  var stackStartFunction = options.stackStartFunction || fail;

	  if (Error.captureStackTrace) {
	    Error.captureStackTrace(this, stackStartFunction);
	  }
	  else {
	    // non v8 browsers so we can have a stacktrace
	    var err = new Error();
	    if (err.stack) {
	      var out = err.stack;

	      // try to strip useless frames
	      var fn_name = stackStartFunction.name;
	      var idx = out.indexOf('\n' + fn_name);
	      if (idx >= 0) {
	        // once we have located the function frame
	        // we need to strip out everything before it (and its line)
	        var next_line = out.indexOf('\n', idx + 1);
	        out = out.substring(next_line + 1);
	      }

	      this.stack = out;
	    }
	  }
	};

	// assert.AssertionError instanceof Error
	util.inherits(assert.AssertionError, Error);

	function replacer(key, value) {
	  if (util.isUndefined(value)) {
	    return '' + value;
	  }
	  if (util.isNumber(value) && !isFinite(value)) {
	    return value.toString();
	  }
	  if (util.isFunction(value) || util.isRegExp(value)) {
	    return value.toString();
	  }
	  return value;
	}

	function truncate(s, n) {
	  if (util.isString(s)) {
	    return s.length < n ? s : s.slice(0, n);
	  } else {
	    return s;
	  }
	}

	function getMessage(self) {
	  return truncate(JSON.stringify(self.actual, replacer), 128) + ' ' +
	         self.operator + ' ' +
	         truncate(JSON.stringify(self.expected, replacer), 128);
	}

	// At present only the three keys mentioned above are used and
	// understood by the spec. Implementations or sub modules can pass
	// other keys to the AssertionError's constructor - they will be
	// ignored.

	// 3. All of the following functions must throw an AssertionError
	// when a corresponding condition is not met, with a message that
	// may be undefined if not provided.  All assertion methods provide
	// both the actual and expected values to the assertion error for
	// display purposes.

	function fail(actual, expected, message, operator, stackStartFunction) {
	  throw new assert.AssertionError({
	    message: message,
	    actual: actual,
	    expected: expected,
	    operator: operator,
	    stackStartFunction: stackStartFunction
	  });
	}

	// EXTENSION! allows for well behaved errors defined elsewhere.
	assert.fail = fail;

	// 4. Pure assertion tests whether a value is truthy, as determined
	// by !!guard.
	// assert.ok(guard, message_opt);
	// This statement is equivalent to assert.equal(true, !!guard,
	// message_opt);. To test strictly for the value true, use
	// assert.strictEqual(true, guard, message_opt);.

	function ok(value, message) {
	  if (!value) fail(value, true, message, '==', assert.ok);
	}
	assert.ok = ok;

	// 5. The equality assertion tests shallow, coercive equality with
	// ==.
	// assert.equal(actual, expected, message_opt);

	assert.equal = function equal(actual, expected, message) {
	  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
	};

	// 6. The non-equality assertion tests for whether two objects are not equal
	// with != assert.notEqual(actual, expected, message_opt);

	assert.notEqual = function notEqual(actual, expected, message) {
	  if (actual == expected) {
	    fail(actual, expected, message, '!=', assert.notEqual);
	  }
	};

	// 7. The equivalence assertion tests a deep equality relation.
	// assert.deepEqual(actual, expected, message_opt);

	assert.deepEqual = function deepEqual(actual, expected, message) {
	  if (!_deepEqual(actual, expected)) {
	    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
	  }
	};

	function _deepEqual(actual, expected) {
	  // 7.1. All identical values are equivalent, as determined by ===.
	  if (actual === expected) {
	    return true;

	  } else if (util.isBuffer(actual) && util.isBuffer(expected)) {
	    if (actual.length != expected.length) return false;

	    for (var i = 0; i < actual.length; i++) {
	      if (actual[i] !== expected[i]) return false;
	    }

	    return true;

	  // 7.2. If the expected value is a Date object, the actual value is
	  // equivalent if it is also a Date object that refers to the same time.
	  } else if (util.isDate(actual) && util.isDate(expected)) {
	    return actual.getTime() === expected.getTime();

	  // 7.3 If the expected value is a RegExp object, the actual value is
	  // equivalent if it is also a RegExp object with the same source and
	  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
	  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
	    return actual.source === expected.source &&
	           actual.global === expected.global &&
	           actual.multiline === expected.multiline &&
	           actual.lastIndex === expected.lastIndex &&
	           actual.ignoreCase === expected.ignoreCase;

	  // 7.4. Other pairs that do not both pass typeof value == 'object',
	  // equivalence is determined by ==.
	  } else if (!util.isObject(actual) && !util.isObject(expected)) {
	    return actual == expected;

	  // 7.5 For all other Object pairs, including Array objects, equivalence is
	  // determined by having the same number of owned properties (as verified
	  // with Object.prototype.hasOwnProperty.call), the same set of keys
	  // (although not necessarily the same order), equivalent values for every
	  // corresponding key, and an identical 'prototype' property. Note: this
	  // accounts for both named and indexed properties on Arrays.
	  } else {
	    return objEquiv(actual, expected);
	  }
	}

	function isArguments(object) {
	  return Object.prototype.toString.call(object) == '[object Arguments]';
	}

	function objEquiv(a, b) {
	  if (util.isNullOrUndefined(a) || util.isNullOrUndefined(b))
	    return false;
	  // an identical 'prototype' property.
	  if (a.prototype !== b.prototype) return false;
	  // if one is a primitive, the other must be same
	  if (util.isPrimitive(a) || util.isPrimitive(b)) {
	    return a === b;
	  }
	  var aIsArgs = isArguments(a),
	      bIsArgs = isArguments(b);
	  if ((aIsArgs && !bIsArgs) || (!aIsArgs && bIsArgs))
	    return false;
	  if (aIsArgs) {
	    a = pSlice.call(a);
	    b = pSlice.call(b);
	    return _deepEqual(a, b);
	  }
	  var ka = objectKeys(a),
	      kb = objectKeys(b),
	      key, i;
	  // having the same number of owned properties (keys incorporates
	  // hasOwnProperty)
	  if (ka.length != kb.length)
	    return false;
	  //the same set of keys (although not necessarily the same order),
	  ka.sort();
	  kb.sort();
	  //~~~cheap key test
	  for (i = ka.length - 1; i >= 0; i--) {
	    if (ka[i] != kb[i])
	      return false;
	  }
	  //equivalent values for every corresponding key, and
	  //~~~possibly expensive deep test
	  for (i = ka.length - 1; i >= 0; i--) {
	    key = ka[i];
	    if (!_deepEqual(a[key], b[key])) return false;
	  }
	  return true;
	}

	// 8. The non-equivalence assertion tests for any deep inequality.
	// assert.notDeepEqual(actual, expected, message_opt);

	assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
	  if (_deepEqual(actual, expected)) {
	    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
	  }
	};

	// 9. The strict equality assertion tests strict equality, as determined by ===.
	// assert.strictEqual(actual, expected, message_opt);

	assert.strictEqual = function strictEqual(actual, expected, message) {
	  if (actual !== expected) {
	    fail(actual, expected, message, '===', assert.strictEqual);
	  }
	};

	// 10. The strict non-equality assertion tests for strict inequality, as
	// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

	assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
	  if (actual === expected) {
	    fail(actual, expected, message, '!==', assert.notStrictEqual);
	  }
	};

	function expectedException(actual, expected) {
	  if (!actual || !expected) {
	    return false;
	  }

	  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
	    return expected.test(actual);
	  } else if (actual instanceof expected) {
	    return true;
	  } else if (expected.call({}, actual) === true) {
	    return true;
	  }

	  return false;
	}

	function _throws(shouldThrow, block, expected, message) {
	  var actual;

	  if (util.isString(expected)) {
	    message = expected;
	    expected = null;
	  }

	  try {
	    block();
	  } catch (e) {
	    actual = e;
	  }

	  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
	            (message ? ' ' + message : '.');

	  if (shouldThrow && !actual) {
	    fail(actual, expected, 'Missing expected exception' + message);
	  }

	  if (!shouldThrow && expectedException(actual, expected)) {
	    fail(actual, expected, 'Got unwanted exception' + message);
	  }

	  if ((shouldThrow && actual && expected &&
	      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
	    throw actual;
	  }
	}

	// 11. Expected to throw an error:
	// assert.throws(block, Error_opt, message_opt);

	assert.throws = function(block, /*optional*/error, /*optional*/message) {
	  _throws.apply(this, [true].concat(pSlice.call(arguments)));
	};

	// EXTENSION! This is annoying to write outside this module.
	assert.doesNotThrow = function(block, /*optional*/message) {
	  _throws.apply(this, [false].concat(pSlice.call(arguments)));
	};

	assert.ifError = function(err) { if (err) {throw err;}};

	var objectKeys = Object.keys || function (obj) {
	  var keys = [];
	  for (var key in obj) {
	    if (hasOwn.call(obj, key)) keys.push(key);
	  }
	  return keys;
	};


/***/ },

/***/ 201:
/***/ function(module, exports) {

	module.exports = now

	function now() {
	    return new Date().getTime()
	}


/***/ },

/***/ 202:
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, process) {/*
	 *  Sugar Library date
	 *
	 *  Freely distributable and licensed under the MIT-style license.
	 *  Copyright (c) 2013 Andrew Plummer
	 *  http://sugarjs.com/
	 *
	 * ---------------------------- */
	(function(){
	  'use strict';
	  

	  /***
	   * @package Core
	   * @description Core method extension and restoration.
	   ***/

	  // The global to export.
	  var Sugar = {};

	  // An optimization for GCC.
	  var object = Object;

	  // The global context
	  var globalContext = typeof global !== 'undefined' ? global : window;

	  // Is the environment node?
	  var hasExports = typeof module !== 'undefined' && module.exports;

	  // No conflict mode
	  var noConflict = hasExports && typeof process !== 'undefined' ? process.env['SUGAR_NO_CONFLICT'] : false;

	  // Internal hasOwnProperty
	  var internalHasOwnProperty = object.prototype.hasOwnProperty;

	  // Property descriptors exist in IE8 but will error when trying to define a property on
	  // native objects. IE8 does not have defineProperies, however, so this check saves a try/catch block.
	  var propertyDescriptorSupport = !!(object.defineProperty && object.defineProperties);

	  // Natives by name.
	  var natives = 'Boolean,Number,String,Array,Date,RegExp,Function'.split(',');

	  // Proxy objects by class.
	  var proxies = {};

	  function initializeGlobal() {
	    Sugar = {
	      /***
	       * @method Sugar.extend(<target>, <methods>, [instance] = true)
	       * @short This method exposes Sugar's core ability to extend Javascript natives, and is useful for creating custom plugins.
	       * @extra <target> should be the Javascript native function such as %String%, %Number%, etc. <methods> is an object containing the methods to extend. When [instance] is true the methods will be mapped to <target>'s prototype, if false they will be mapped onto <target> itself. For more see @global.
	       ***/
	      'extend': extend,

	      /***
	       * @method Sugar.restore(<target>, ...)
	       * @short Restores Sugar methods that may have been overwritten by other scripts.
	       * @extra <target> should be the Javascript native function such as %String%, %Number%, etc. Arguments after this may be an enumerated list of method names to restore or can be omitted to restore all.
	       ***/
	      'restore': restore,

	      /***
	       * @method Sugar.revert(<target>, ...)
	       * @short Reverts Sugar methods to what the were before they were added.
	       * @extra This method can be useful if Sugar methods are causing conflicts with other scripts. <target> should be the Javascript native function such as %String%, %Number%, etc. Arguments after this may be an enumerated list of method names to revert or can be omitted to revert all.
	       * @short Reverts stuff.
	       ***/
	      'revert': revert,

	      'noConflict': noConflict
	    };
	    if (hasExports) {
	      module.exports = Sugar;
	    } else {
	      globalContext['Sugar'] = Sugar;
	    }
	  }

	  function initializeNatives() {
	    iterateOverObject(natives.concat('Object'), function(i, name) {
	      proxies[globalContext[name]] = name;
	      Sugar[name] = {};
	    });
	  }

	  // Class extending methods

	  function extend(klass, methods, instance, polyfill, override) {
	    var extendee;
	    instance = instance !== false;
	    extendee = instance ? klass.prototype : klass;
	    iterateOverObject(methods, function(name, prop) {
	      var existing = checkGlobal('method', klass, name, extendee),
	          original = checkGlobal('original', klass, name, extendee),
	          existed  = name in extendee;
	      if(typeof polyfill === 'function' && existing) {
	        prop = wrapExisting(existing, prop, polyfill);
	      }
	      defineOnGlobal(klass, name, instance, original, prop, existed);
	      if(canDefineOnNative(klass, polyfill, existing, override)) {
	        setProperty(extendee, name, prop);
	      }
	    });
	  }

	  function alias(klass, target, source) {
	    var method = getProxy(klass)[source];
	    var obj = {};
	    obj[target] = method['method'];
	    extend(klass, obj, method['instance']);
	  }

	  function restore(klass, methods) {
	    if(noConflict) return;
	    return batchMethodExecute(klass, methods, function(target, name, m) {
	      setProperty(target, name, m.method);
	    });
	  }

	  function revert(klass, methods) {
	    return batchMethodExecute(klass, methods, function(target, name, m) {
	      if(m['existed']) {
	        setProperty(target, name, m['original']);
	      } else {
	        delete target[name];
	      }
	    });
	  }

	  function batchMethodExecute(klass, methods, fn) {
	    var all = !methods, changed = false;
	    if(typeof methods === 'string') methods = [methods];
	    iterateOverObject(getProxy(klass), function(name, m) {
	      if(all || methods.indexOf(name) !== -1) {
	        changed = true;
	        fn(m['instance'] ? klass.prototype : klass, name, m);
	      }
	    });
	    return changed;
	  }

	  function checkGlobal(type, klass, name, extendee) {
	    var proxy = getProxy(klass), methodExists;
	    methodExists = proxy && hasOwnProperty(proxy, name);
	    if(methodExists) {
	      return proxy[name][type];
	    } else {
	      return extendee[name];
	    }
	  }

	  function canDefineOnNative(klass, polyfill, existing, override) {
	    if(override) {
	      return true;
	    } else if(polyfill === true) {
	      return !existing;
	    }
	    return !noConflict || !proxies[klass];
	  }

	  function wrapExisting(originalFn, extendedFn, condition) {
	    return function(a) {
	      return condition.apply(this, arguments) ?
	             extendedFn.apply(this, arguments) :
	             originalFn.apply(this, arguments);
	    }
	  }

	  function wrapInstanceAsClass(fn) {
	    return function(obj) {
	      var args = arguments, newArgs = [], i;
	      for(i = 1;i < args.length;i++) {
	        newArgs.push(args[i]);
	      }
	      return fn.apply(obj, newArgs);
	    };
	  }

	  function defineOnGlobal(klass, name, instance, original, prop, existed) {
	    var proxy = getProxy(klass), result;
	    if(!proxy) return;
	    result = instance ? wrapInstanceAsClass(prop) : prop;
	    setProperty(proxy, name, result, true);
	    if(typeof prop === 'function') {
	      setProperty(result, 'original', original);
	      setProperty(result, 'method', prop);
	      setProperty(result, 'existed', existed);
	      setProperty(result, 'instance', instance);
	    }
	  }

	  function getProxy(klass) {
	    return Sugar[proxies[klass]];
	  }

	  function setProperty(target, name, property, enumerable) {
	    if(propertyDescriptorSupport) {
	      object.defineProperty(target, name, {
	        'value': property,
	        'enumerable': !!enumerable,
	        'configurable': true,
	        'writable': true
	      });
	    } else {
	      target[name] = property;
	    }
	  }

	  function iterateOverObject(obj, fn) {
	    var key;
	    for(key in obj) {
	      if(!hasOwnProperty(obj, key)) continue;
	      if(fn.call(obj, key, obj[key], obj) === false) break;
	    }
	  }

	  function hasOwnProperty(obj, prop) {
	    return !!obj && internalHasOwnProperty.call(obj, prop);
	  }

	  initializeGlobal();
	  initializeNatives();

	  


	  /***
	   * @package Common
	   * @description Internal utility and common methods.
	   ***/


	  // A few optimizations for Google Closure Compiler will save us a couple kb in the release script.
	  var object = Object, array = Array, regexp = RegExp, date = Date, string = String, number = Number, func = Function, math = Math, Undefined;

	  var sugarObject = Sugar.Object, sugarArray = Sugar.Array, sugarDate = Sugar.Date, sugarString = Sugar.String, sugarNumber = Sugar.Number;

	  // Internal toString
	  var internalToString = object.prototype.toString;

	  // Are regexes type function?
	  var regexIsFunction = typeof regexp() === 'function';

	  // Do strings have no keys?
	  var noKeysInStringObjects = !('0' in new string('a'));

	  // Type check methods need a way to be accessed dynamically.
	  var typeChecks = {};

	  // Classes that can be matched by value
	  var matchedByValueReg = /^\[object Date|Array|String|Number|RegExp|Boolean|Arguments\]$/;

	  var isBoolean  = buildPrimitiveClassCheck('boolean', natives[0]);
	  var isNumber   = buildPrimitiveClassCheck('number',  natives[1]);
	  var isString   = buildPrimitiveClassCheck('string',  natives[2]);

	  var isArray    = buildClassCheck(natives[3]);
	  var isDate     = buildClassCheck(natives[4]);
	  var isRegExp   = buildClassCheck(natives[5]);


	  // Wanted to enhance performance here by using simply "typeof"
	  // but Firefox has two major issues that make this impossible,
	  // one fixed, the other not. Despite being typeof "function"
	  // the objects below still report in as [object Function], so
	  // we need to perform a full class check here.
	  //
	  // 1. Regexes can be typeof "function" in FF < 3
	  //    https://bugzilla.mozilla.org/show_bug.cgi?id=61911 (fixed)
	  //
	  // 2. HTMLEmbedElement and HTMLObjectElement are be typeof "function"
	  //    https://bugzilla.mozilla.org/show_bug.cgi?id=268945 (won't fix)
	  //
	  var isFunction = buildClassCheck(natives[6]);

	  function isClass(obj, klass, cached) {
	    var k = cached || className(obj);
	    return k === '[object '+klass+']';
	  }

	  function buildClassCheck(klass) {
	    var fn = (klass === 'Array' && array.isArray) || function(obj, cached) {
	      return isClass(obj, klass, cached);
	    };
	    typeChecks[klass] = fn;
	    return fn;
	  }

	  function buildPrimitiveClassCheck(type, klass) {
	    var fn = function(obj) {
	      if(isObjectType(obj)) {
	        return isClass(obj, klass);
	      }
	      return typeof obj === type;
	    }
	    typeChecks[klass] = fn;
	    return fn;
	  }

	  function className(obj) {
	    return internalToString.call(obj);
	  }

	  function extendSimilar(klass, set, fn, instance, polyfill, override) {
	    var methods = {};
	    set = isString(set) ? set.split(',') : set;
	    set.forEach(function(name, i) {
	      fn(methods, name, i);
	    });
	    extend(klass, methods, instance, polyfill, override);
	  }

	  // Argument helpers

	  function isArgumentsObject(obj) {
	    // .callee exists on Arguments objects in < IE8
	    return hasProperty(obj, 'length') && (className(obj) === '[object Arguments]' || !!obj.callee);
	  }

	  function multiArgs(args, fn, from) {
	    var result = [], i = from || 0, len;
	    for(len = args.length; i < len; i++) {
	      result.push(args[i]);
	      if(fn) fn.call(args, args[i], i);
	    }
	    return result;
	  }

	  function flattenedArgs(args, fn, from) {
	    var arg = args[from || 0];
	    if(isArray(arg)) {
	      args = arg;
	      from = 0;
	    }
	    return multiArgs(args, fn, from);
	  }

	  function checkCallback(fn) {
	    if(!fn || !fn.call) {
	      throw new TypeError('Callback is not callable');
	    }
	  }


	  // General helpers

	  function isDefined(o) {
	    return o !== Undefined;
	  }

	  function isUndefined(o) {
	    return o === Undefined;
	  }


	  // Object helpers

	  function hasProperty(obj, prop) {
	    return !isPrimitiveType(obj) && prop in obj;
	  }

	  function isObjectType(obj) {
	    // 1. Check for null
	    // 2. Check for regexes in environments where they are "functions".
	    return !!obj && (typeof obj === 'object' || (regexIsFunction && isRegExp(obj)));
	  }

	  function isPrimitiveType(obj) {
	    var type = typeof obj;
	    return obj == null || type === 'string' || type === 'number' || type === 'boolean';
	  }

	  function isPlainObject(obj, klass) {
	    klass = klass || className(obj);
	    try {
	      // Not own constructor property must be Object
	      // This code was borrowed from jQuery.isPlainObject
	      if (obj && obj.constructor &&
	            !hasOwnProperty(obj, 'constructor') &&
	            !hasOwnProperty(obj.constructor.prototype, 'isPrototypeOf')) {
	        return false;
	      }
	    } catch (e) {
	      // IE8,9 Will throw exceptions on certain host objects.
	      return false;
	    }
	    // === on the constructor is not safe across iframes
	    // 'hasOwnProperty' ensures that the object also inherits
	    // from Object, which is false for DOMElements in IE.
	    return !!obj && klass === '[object Object]' && 'hasOwnProperty' in obj;
	  }

	  function simpleRepeat(n, fn) {
	    for(var i = 0; i < n; i++) {
	      fn(i);
	    }
	  }

	  function simpleMerge(target, source) {
	    iterateOverObject(source, function(key) {
	      target[key] = source[key];
	    });
	    return target;
	  }

	   // Make primtives types like strings into objects.
	   function coercePrimitiveToObject(obj) {
	     if(isPrimitiveType(obj)) {
	       obj = object(obj);
	     }
	     if(noKeysInStringObjects && isString(obj)) {
	       forceStringCoercion(obj);
	     }
	     return obj;
	   }

	   // Force strings to have their indexes set in
	   // environments that don't do this automatically.
	   function forceStringCoercion(obj) {
	     var i = 0, chr;
	     while(chr = obj.charAt(i)) {
	       obj[i++] = chr;
	     }
	   }

	  // Hash definition

	  function Hash(obj) {
	    simpleMerge(this, coercePrimitiveToObject(obj));
	  };

	  Hash.prototype.constructor = object;

	  // Math helpers

	  var abs   = math.abs;
	  var pow   = math.pow;
	  var ceil  = math.ceil;
	  var floor = math.floor;
	  var round = math.round;
	  var min   = math.min;
	  var max   = math.max;

	  function withPrecision(val, precision, fn) {
	    var multiplier = pow(10, abs(precision || 0));
	    fn = fn || round;
	    if(precision < 0) multiplier = 1 / multiplier;
	    return fn(val * multiplier) / multiplier;
	  }

	  // Full width number helpers

	  var HalfWidthZeroCode = 0x30;
	  var HalfWidthNineCode = 0x39;
	  var FullWidthZeroCode = 0xff10;
	  var FullWidthNineCode = 0xff19;

	  var HalfWidthPeriod = '.';
	  var FullWidthPeriod = '．';
	  var HalfWidthComma  = ',';

	  // Used here and later in the Date package.
	  var FullWidthDigits   = '';

	  var NumberNormalizeMap = {};
	  var NumberNormalizeReg;

	  function codeIsNumeral(code) {
	    return (code >= HalfWidthZeroCode && code <= HalfWidthNineCode) ||
	           (code >= FullWidthZeroCode && code <= FullWidthNineCode);
	  }

	  function buildNumberHelpers() {
	    var digit, i;
	    for(i = 0; i <= 9; i++) {
	      digit = chr(i + FullWidthZeroCode);
	      FullWidthDigits += digit;
	      NumberNormalizeMap[digit] = chr(i + HalfWidthZeroCode);
	    }
	    NumberNormalizeMap[HalfWidthComma] = '';
	    NumberNormalizeMap[FullWidthPeriod] = HalfWidthPeriod;
	    // Mapping this to itself to easily be able to easily
	    // capture it in stringToNumber to detect decimals later.
	    NumberNormalizeMap[HalfWidthPeriod] = HalfWidthPeriod;
	    NumberNormalizeReg = regexp('[' + FullWidthDigits + FullWidthPeriod + HalfWidthComma + HalfWidthPeriod + ']', 'g');
	  }

	  // String helpers

	  function chr(num) {
	    return string.fromCharCode(num);
	  }

	  // WhiteSpace/LineTerminator as defined in ES5.1 plus Unicode characters in the Space, Separator category.
	  function getTrimmableCharacters() {
	    return '\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u2028\u2029\u3000\uFEFF';
	  }

	  function repeatString(str, num) {
	    var result = '';
	    str = str.toString();
	    while (num > 0) {
	      if (num & 1) {
	        result += str;
	      }
	      if (num >>= 1) {
	        str += str;
	      }
	    }
	    return result;
	  }

	  // Returns taking into account full-width characters, commas, and decimals.
	  function stringToNumber(str, base) {
	    var sanitized, isDecimal;
	    sanitized = str.replace(NumberNormalizeReg, function(chr) {
	      var replacement = NumberNormalizeMap[chr];
	      if(replacement === HalfWidthPeriod) {
	        isDecimal = true;
	      }
	      return replacement;
	    });
	    return isDecimal ? parseFloat(sanitized) : parseInt(sanitized, base || 10);
	  }


	  // Used by Number and Date

	  function padNumber(num, place, sign, base) {
	    var str = abs(num).toString(base || 10);
	    str = repeatString('0', place - str.replace(/\.\d+/, '').length) + str;
	    if(sign || num < 0) {
	      str = (num < 0 ? '-' : '+') + str;
	    }
	    return str;
	  }

	  function getOrdinalizedSuffix(num) {
	    if(num >= 11 && num <= 13) {
	      return 'th';
	    } else {
	      switch(num % 10) {
	        case 1:  return 'st';
	        case 2:  return 'nd';
	        case 3:  return 'rd';
	        default: return 'th';
	      }
	    }
	  }


	  // RegExp helpers

	  function getRegExpFlags(reg, add) {
	    var flags = '';
	    add = add || '';
	    function checkFlag(prop, flag) {
	      if(prop || add.indexOf(flag) > -1) {
	        flags += flag;
	      }
	    }
	    checkFlag(reg.multiline, 'm');
	    checkFlag(reg.ignoreCase, 'i');
	    checkFlag(reg.global, 'g');
	    checkFlag(reg.sticky, 'y');
	    return flags;
	  }

	  function escapeRegExp(str) {
	    if(!isString(str)) str = string(str);
	    return str.replace(/([\\\/\'*+?|()\[\]{}.^$-])/g,'\\$1');
	  }


	  // Date helpers

	  function callDateGet(d, method) {
	    return d['get' + (d._utc ? 'UTC' : '') + method]();
	  }

	  function callDateSet(d, method, value) {
	    return d['set' + (d._utc ? 'UTC' : '') + method](value);
	  }

	  // Used by Array#unique and Object.equal

	  function stringify(thing, stack) {
	    var type = typeof thing,
	        thingIsObject,
	        thingIsArray,
	        klass, value,
	        arr, key, i, len;

	    // Return quickly if string to save cycles
	    if(type === 'string') return thing;

	    klass         = internalToString.call(thing);
	    thingIsObject = isPlainObject(thing, klass);
	    thingIsArray  = isArray(thing, klass);

	    if(thing != null && thingIsObject || thingIsArray) {
	      // This method for checking for cyclic structures was egregiously stolen from
	      // the ingenious method by @kitcambridge from the Underscore script:
	      // https://github.com/documentcloud/underscore/issues/240
	      if(!stack) stack = [];
	      // Allowing a step into the structure before triggering this
	      // script to save cycles on standard JSON structures and also to
	      // try as hard as possible to catch basic properties that may have
	      // been modified.
	      if(stack.length > 1) {
	        i = stack.length;
	        while (i--) {
	          if (stack[i] === thing) {
	            return 'CYC';
	          }
	        }
	      }
	      stack.push(thing);
	      value = thing.valueOf() + string(thing.constructor);
	      arr = thingIsArray ? thing : object.keys(thing).sort();
	      for(i = 0, len = arr.length; i < len; i++) {
	        key = thingIsArray ? i : arr[i];
	        value += key + stringify(thing[key], stack);
	      }
	      stack.pop();
	    } else if(1 / thing === -Infinity) {
	      value = '-0';
	    } else {
	      value = string(thing && thing.valueOf ? thing.valueOf() : thing);
	    }
	    return type + klass + value;
	  }

	  function isEqual(a, b) {
	    if(a === b) {
	      // Return quickly up front when matching by reference,
	      // but be careful about 0 !== -0.
	      return a !== 0 || 1 / a === 1 / b;
	    } else if(objectIsMatchedByValue(a) && objectIsMatchedByValue(b)) {
	      return stringify(a) === stringify(b);
	    }
	    return false;
	  }

	  function objectIsMatchedByValue(obj) {
	    // Only known objects are matched by value. This is notably excluding functions, DOM Elements, and instances of
	    // user-created classes. The latter can arguably be matched by value, but distinguishing between these and
	    // host objects -- which should never be compared by value -- is very tricky so not dealing with it here.
	    var klass = className(obj);
	    return matchedByValueReg.test(klass) || isPlainObject(obj, klass);
	  }


	  // Used by Array#at and String#at

	  function getEntriesForIndexes(obj, args, isString) {
	    var result,
	        length    = obj.length,
	        argsLen   = args.length,
	        overshoot = args[argsLen - 1] !== false,
	        multiple  = argsLen > (overshoot ? 1 : 2);
	    if(!multiple) {
	      return entryAtIndex(obj, length, args[0], overshoot, isString);
	    }
	    result = [];
	    multiArgs(args, function(index) {
	      if(isBoolean(index)) return false;
	      result.push(entryAtIndex(obj, length, index, overshoot, isString));
	    });
	    return result;
	  }

	  function entryAtIndex(obj, length, index, overshoot, isString) {
	    if(overshoot) {
	      index = index % length;
	      if(index < 0) index = length + index;
	    }
	    return isString ? obj.charAt(index) : obj[index];
	  }

	  // Used by the Array and Object packages.

	  function transformArgument(el, map, context, mapArgs) {
	    if(!map) {
	      return el;
	    } else if(map.apply) {
	      return map.apply(context, mapArgs || []);
	    } else if(isFunction(el[map])) {
	      return el[map].call(el);
	    } else {
	      return el[map];
	    }
	  }

	   function keysWithObjectCoercion(obj) {
	     return object.keys(coercePrimitiveToObject(obj));
	   }


	  // Object class methods implemented as instance methods. This method
	  // is being called only on Hash and Object itself, so we don't want
	  // to go through extend() here as it will create proxies that already
	  // exist, which we want to avoid.

	  function buildObjectInstanceMethods(set, target) {
	    set.forEach(function(name) {
	      var classFn = sugarObject[name === 'equals' ? 'equal' : name];
	      var fn = function() {
	        var args = arguments, newArgs = [this], i;
	        for(i = 0;i < args.length;i++) {
	          newArgs.push(args[i]);
	        }
	        return classFn.apply(null, newArgs);
	      }
	      setProperty(target.prototype, name, fn);
	    });
	  }

	  buildNumberHelpers();


	  

	  /***
	   * @package Date
	   * @dependency core
	   * @description Date parsing and formatting, relative formats like "1 minute ago", Number methods like "daysAgo", localization support with default English locale definition.
	   *
	   ***/

	  var English;
	  var CurrentLocalization;

	  var TimeFormat = ['ampm','hour','minute','second','ampm','utc','offset_sign','offset_hours','offset_minutes','ampm'];
	  var DecimalReg = '(?:[,.]\\d+)?';
	  var HoursReg   = '\\d{1,2}' + DecimalReg;
	  var SixtyReg   = '[0-5]\\d' + DecimalReg;
	  var RequiredTime = '({t})?\\s*('+HoursReg+')(?:{h}('+SixtyReg+')?{m}(?::?('+SixtyReg+'){s})?\\s*(?:({t})|(Z)|(?:([+-])(\\d{2,2})(?::?(\\d{2,2}))?)?)?|\\s*({t}))';

	  var KanjiDigits = '〇一二三四五六七八九十百千万';
	  var AsianDigitMap = {};
	  var AsianDigitReg;

	  var DateArgumentUnits;
	  var DateUnitsReversed;
	  var CoreDateFormats = [];
	  var CompiledOutputFormats = {};

	  var DateFormatTokens = {

	    'yyyy': function(d) {
	      return callDateGet(d, 'FullYear');
	    },

	    'yy': function(d) {
	      return callDateGet(d, 'FullYear') % 100;
	    },

	    'ord': function(d) {
	      var date = callDateGet(d, 'Date');
	      return date + getOrdinalizedSuffix(date);
	    },

	    'tz': function(d) {
	      return getUTCOffset(d);
	    },

	    'isotz': function(d) {
	      return getUTCOffset(d, true);
	    },

	    'Z': function(d) {
	      return getUTCOffset(d);
	    },

	    'ZZ': function(d) {
	      return getUTCOffset(d).replace(/(\d{2})$/, ':$1');
	    }

	  };

	  var DateUnits = [
	    {
	      name: 'year',
	      method: 'FullYear',
	      ambiguous: true,
	      multiplier: 365.25 * 24 * 60 * 60 * 1000
	    },
	    {
	      name: 'month',
	      method: 'Month',
	      ambiguous: true,
	      multiplier: 30.4375 * 24 * 60 * 60 * 1000
	    },
	    {
	      name: 'week',
	      method: 'ISOWeek',
	      multiplier: 7 * 24 * 60 * 60 * 1000
	    },
	    {
	      name: 'day',
	      method: 'Date',
	      ambiguous: true,
	      multiplier: 24 * 60 * 60 * 1000
	    },
	    {
	      name: 'hour',
	      method: 'Hours',
	      multiplier: 60 * 60 * 1000
	    },
	    {
	      name: 'minute',
	      method: 'Minutes',
	      multiplier: 60 * 1000
	    },
	    {
	      name: 'second',
	      method: 'Seconds',
	      multiplier: 1000
	    },
	    {
	      name: 'millisecond',
	      method: 'Milliseconds',
	      multiplier: 1
	    }
	  ];




	  // Date Localization

	  var Localizations = {};

	  // Localization object

	  function Localization(l) {
	    simpleMerge(this, l);
	    this.compiledFormats = CoreDateFormats.concat();
	  }

	  Localization.prototype = {

	    get: function(prop) {
	      return this[prop] || '';
	    },

	    getMonth: function(n) {
	      if(isNumber(n)) {
	        return n - 1;
	      } else {
	        return this['months'].indexOf(n) % 12;
	      }
	    },

	    getWeekday: function(n) {
	      return this['weekdays'].indexOf(n) % 7;
	    },

	    getNumber: function(n, digit) {
	      var mapped = this.ordinalNumberMap[n];
	      if(mapped) {
	        if(digit) {
	          mapped = mapped % 10;
	        }
	        return mapped;
	      }
	      return isNumber(n) ? n : 1;
	    },

	    getNumericDate: function(n) {
	      var self = this;
	      return n.replace(regexp(this['num'], 'g'), function(d) {
	        var num = self.getNumber(d, true);
	        return num || '';
	      });
	    },

	    getUnitIndex: function(n) {
	      return this['units'].indexOf(n) % 8;
	    },

	    getRelativeFormat: function(adu) {
	      return this.convertAdjustedToFormat(adu, adu[2] > 0 ? 'future' : 'past');
	    },

	    getDuration: function(ms) {
	      return this.convertAdjustedToFormat(getAdjustedUnitForNumber(ms), 'duration');
	    },

	    hasVariant: function(code) {
	      code = code || this.code;
	      return code === 'en' || code === 'en-US' ? true : this['variant'];
	    },

	    matchAM: function(str) {
	      return str === this.get('ampm')[0];
	    },

	    matchPM: function(str) {
	      return str && str === this.get('ampm')[1];
	    },

	    convertAdjustedToFormat: function(adu, mode) {
	      var sign, unit, mult,
	          num    = adu[0],
	          u      = adu[1],
	          ms     = adu[2],
	          format = this[mode] || this['relative'];
	      if(isFunction(format)) {
	        return format.call(this, num, u, ms, mode);
	      }
	      mult = !this['plural'] || num === 1 ? 0 : 1;
	      unit = this['units'][mult * 8 + u] || this['units'][u];
	      if(this['capitalizeUnit']) unit = simpleCapitalize(unit);
	      sign = this['modifiers'].filter(function(m) { return m.name == 'sign' && m.value == (ms > 0 ? 1 : -1); })[0];
	      return format.replace(/\{(.*?)\}/g, function(full, match) {
	        switch(match) {
	          case 'num': return num;
	          case 'unit': return unit;
	          case 'sign': return sign.src;
	        }
	      });
	    },

	    getFormats: function() {
	      return this.cachedFormat ? [this.cachedFormat].concat(this.compiledFormats) : this.compiledFormats;
	    },

	    addFormat: function(src, allowsTime, match, variant, iso) {
	      var to = match || [], loc = this, time, timeMarkers, lastIsNumeral;

	      src = src.replace(/\s+/g, '[,. ]*');
	      src = src.replace(/\{([^,]+?)\}/g, function(all, k) {
	        var value, arr, result,
	            opt   = k.match(/\?$/),
	            nc    = k.match(/^(\d+)\??$/),
	            slice = k.match(/(\d)(?:-(\d))?/),
	            key   = k.replace(/[^a-z]+$/, '');
	        if(nc) {
	          value = loc.get('tokens')[nc[1]];
	        } else if(loc[key]) {
	          value = loc[key];
	        } else if(loc[key + 's']) {
	          value = loc[key + 's'];
	          if(slice) {
	            // Can't use filter here as Prototype hijacks the method and doesn't
	            // pass an index, so use a simple loop instead!
	            arr = [];
	            value.forEach(function(m, i) {
	              var mod = i % (loc['units'] ? 8 : value.length);
	              if(mod >= slice[1] && mod <= (slice[2] || slice[1])) {
	                arr.push(m);
	              }
	            });
	            value = arr;
	          }
	          value = arrayToAlternates(value);
	        }
	        if(!value) {
	          return '';
	        }
	        if(nc) {
	          result = '(?:' + value + ')';
	        } else {
	          if(!match) {
	            to.push(key);
	          }
	          result = '(' + value + ')';
	        }
	        if(opt) {
	          result += '?';
	        }
	        return result;
	      });
	      if(allowsTime) {
	        time = prepareTime(RequiredTime, loc, iso);
	        timeMarkers = ['t','[\\s\\u3000]'].concat(loc.get('timeMarker'));
	        lastIsNumeral = src.match(/\\d\{\d,\d\}\)+\??$/);
	        addDateInputFormat(loc, '(?:' + time + ')[,\\s\\u3000]+?' + src, TimeFormat.concat(to), variant);
	        addDateInputFormat(loc, src + '(?:[,\\s]*(?:' + timeMarkers.join('|') + (lastIsNumeral ? '+' : '*') +')' + time + ')?', to.concat(TimeFormat), variant);
	      } else {
	        addDateInputFormat(loc, src, to, variant);
	      }
	    }

	  };


	  // Localization helpers

	  function getLocalization(localeCode, fallback) {
	    var loc;
	    if(!isString(localeCode)) localeCode = '';
	    loc = Localizations[localeCode] || Localizations[localeCode.slice(0,2)];
	    if(fallback === false && !loc) {
	      throw new TypeError('Invalid locale.');
	    }
	    return loc || CurrentLocalization;
	  }

	  function setLocalization(localeCode, set) {
	    var loc;

	    function initializeField(name) {
	      var val = loc[name];
	      if(isString(val)) {
	        loc[name] = val.split(',');
	      } else if(!val) {
	        loc[name] = [];
	      }
	    }

	    function eachAlternate(str, fn) {
	      str = str.split('+').map(function(split) {
	        return split.replace(/(.+):(.+)$/, function(full, base, suffixes) {
	          return suffixes.split('|').map(function(suffix) {
	            return base + suffix;
	          }).join('|');
	        });
	      }).join('|');
	      return str.split('|').forEach(fn);
	    }

	    function setArray(name, abbreviationSize, multiple) {
	      var arr = [];
	      loc[name].forEach(function(full, i) {
	        if(abbreviationSize) {
	          full += '+' + full.slice(0, abbreviationSize);
	        }
	        eachAlternate(full, function(alt, j) {
	          arr[j * multiple + i] = alt.toLowerCase();
	        });
	      });
	      loc[name] = arr;
	    }

	    function getDigit(start, stop, allowNumbers) {
	      var str = '\\d{' + start + ',' + stop + '}';
	      if(allowNumbers) str += '|(?:' + arrayToAlternates(loc.get('numbers')) + ')+';
	      return str;
	    }

	    function getNum() {
	      var numbers = loc.get('numbers');
	      var arr = ['-?\\d+'].concat(loc.get('articles'));
	      if(numbers) {
	        arr = arr.concat(numbers);
	      }
	      return arrayToAlternates(arr);
	    }

	    function getAbbreviationSize(type) {
	      // Month suffixes like those found in Asian languages
	      // serve as a good proxy to detect month/weekday abbreviations.
	      var hasMonthSuffix = !!loc['monthSuffix'];
	      return loc[type + 'Abbreviate'] || (hasMonthSuffix ? null : 3);
	    }

	    function setDefault(name, value) {
	      loc[name] = loc[name] || value;
	    }

	    function buildNumbers() {
	      var map = loc.ordinalNumberMap = {}, all = [];
	      loc['numbers'].forEach(function(full, i) {
	        eachAlternate(full, function(alt) {
	          all.push(alt);
	          map[alt] = i + 1;
	        });
	      });
	      loc['numbers'] = all;
	    }

	    function buildModifiers() {
	      var arr = [];
	      loc.modifiersByName = {};
	      loc['modifiers'].push({ 'name': 'day', 'src': 'yesterday', 'value': -1 });
	      loc['modifiers'].push({ 'name': 'day', 'src': 'today', 'value': 0 });
	      loc['modifiers'].push({ 'name': 'day', 'src': 'tomorrow', 'value': 1 });
	      loc['modifiers'].forEach(function(modifier) {
	        var name = modifier.name;
	        eachAlternate(modifier.src, function(t) {
	          var locEntry = loc[name];
	          loc.modifiersByName[t] = modifier;
	          arr.push({ name: name, src: t, value: modifier.value });
	          loc[name] = locEntry ? locEntry + '|' + t : t;
	        });
	      });
	      loc['day'] += '|' + arrayToAlternates(loc['weekdays']);
	      loc['modifiers'] = arr;
	    }

	    // Initialize the locale
	    loc = new Localization(set);
	    initializeField('modifiers');
	    'months,weekdays,units,numbers,articles,tokens,timeMarker,ampm,timeSuffixes,dateParse,timeParse'.split(',').forEach(initializeField);

	    buildNumbers();

	    setArray('months', getAbbreviationSize('month'), 12);
	    setArray('weekdays', getAbbreviationSize('weekday'), 7);
	    setArray('units', false, 8);

	    setDefault('code', localeCode);
	    setDefault('date', getDigit(1,2, loc['digitDate']));
	    setDefault('year', "'\\d{2}|" + getDigit(4,4));
	    setDefault('num', getNum());

	    buildModifiers();

	    if(loc['monthSuffix']) {
	      loc['month'] = getDigit(1,2);
	      loc['months'] = '1,2,3,4,5,6,7,8,9,10,11,12'.split(',').map(function(n) { return n + loc['monthSuffix']; });
	    }
	    loc['full_month'] = getDigit(1,2) + '|' + arrayToAlternates(loc['months']);

	    // The order of these formats is very important. Order is reversed so formats that come
	    // later will take precedence over formats that come before. This generally means that
	    // more specific formats should come later, however, the {year} format should come before
	    // {day}, as 2011 needs to be parsed as a year (2011) and not date (20) + hours (11)

	    // If the locale has time suffixes then add a time only format for that locale
	    // that is separate from the core English-based one.
	    if(loc['timeSuffixes'].length > 0) {
	      loc.addFormat(prepareTime(RequiredTime, loc), false, TimeFormat);
	    }

	    loc.addFormat('{day}', true);
	    loc.addFormat('{month}' + (loc['monthSuffix'] || ''));
	    loc.addFormat('{year}' + (loc['yearSuffix'] || ''));

	    loc['timeParse'].forEach(function(src) {
	      loc.addFormat(src, true);
	    });

	    loc['dateParse'].forEach(function(src) {
	      loc.addFormat(src);
	    });

	    return Localizations[localeCode] = loc;
	  }


	  // General helpers

	  function addDateInputFormat(locale, format, match, variant) {
	    locale.compiledFormats.unshift({
	      variant: !!variant,
	      locale: locale,
	      reg: regexp('^' + format + '$', 'i'),
	      to: match
	    });
	  }

	  function simpleCapitalize(str) {
	    return str.slice(0,1).toUpperCase() + str.slice(1);
	  }

	  function arrayToAlternates(arr) {
	    return arr.filter(function(el) {
	      return !!el;
	    }).join('|');
	  }

	  function getNewDate() {
	    var fn = sugarDate['newDateInternal'];
	    return fn ? fn() : new date;
	  }

	  function cloneDate(d) {
	    var cloned = new date(d.getTime());
	    setUTC(cloned, !!d._utc);
	    return cloned;
	  }

	  // Normal callDateSet method with ability
	  // to handle ISOWeek setting as well.
	  function callDateSetWithWeek(d, method, value) {
	    if(method === 'ISOWeek') {
	      return setWeekNumber(d, value);
	    } else {
	      return callDateSet(d, method, value);
	    }
	  }

	  function isValid(d) {
	    return !isNaN(d.getTime());
	  }

	  function isLeapYear(d) {
	    var year = callDateGet(d, 'FullYear');
	    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
	  }

	  // UTC helpers

	  function setUTC(d, force) {
	    setProperty(d, '_utc', !!force);
	    return d;
	  }

	  function isUTC(d) {
	    return !!d._utc || d.getTimezoneOffset() === 0;
	  }

	  function getUTCOffset(d, iso) {
	    var offset = d._utc ? 0 : d.getTimezoneOffset();
	    var colon  = iso === true ? ':' : '';
	    if(!offset && iso) return 'Z';
	    return padNumber(floor(-offset / 60), 2, true) + colon + padNumber(abs(offset % 60), 2);
	  }

	  // Date argument helpers

	  function collectDateArguments(args, allowDuration) {
	    var obj;
	    if(isObjectType(args[0])) {
	      return args;
	    } else if (isNumber(args[0]) && !isNumber(args[1])) {
	      return [args[0]];
	    } else if (isString(args[0]) && allowDuration) {
	      return [getDateParamsFromString(args[0]), args[1]];
	    }
	    obj = {};
	    DateArgumentUnits.forEach(function(u,i) {
	      obj[u.name] = args[i];
	    });
	    return [obj];
	  }

	  function getDateParamsFromString(str, num) {
	    var match, num, params = {};
	    match = str.match(/^(-?\d+)?\s?(\w+?)s?$/i);
	    if(match) {
	      if(isUndefined(num)) {
	        num = parseInt(match[1]);
	        if(isNaN(num)) {
	          num = 1;
	        }
	      }
	      params[match[2].toLowerCase()] = num;
	    }
	    return params;
	  }

	  // Date iteration helpers

	  function iterateOverDateUnits(fn, from, to) {
	    var i, unit;
	    if(isUndefined(to)) to = DateUnitsReversed.length;
	    for(i = from || 0; i < to; i++) {
	      unit = DateUnitsReversed[i];
	      if(fn(unit.name, unit, i) === false) {
	        break;
	      }
	    }
	  }

	  // Date shifting helpers

	  function advanceDate(d, args) {
	    var args = collectDateArguments(args, true);
	    return updateDate(d, args[0], args[1], 1);
	  }

	  function setDate(d, args) {
	    var args = collectDateArguments(args);
	    return updateDate(d, args[0], args[1])
	  }

	  function resetDate(d, unit) {
	    var params = {}, recognized;
	    unit = unit || 'hours';
	    if(unit === 'date') unit = 'days';
	    recognized = DateUnits.some(function(u) {
	      return unit === u.name || unit === u.name + 's';
	    });
	    params[unit] = unit.match(/^days?/) ? 1 : 0;
	    return recognized ? setDate(d, [params, true]) : d;
	  }

	  function setWeekday(d, dow, forward) {
	    if(isUndefined(dow)) return;
	    // Dates like "the 2nd Tuesday of June" need to be set forward
	    // so make sure that the day of the week reflects that here.
	    if (forward && dow % 7 < d.getDay()) {
	      dow += 7;
	    }
	    return callDateSet(d, 'Date', callDateGet(d, 'Date') + dow - callDateGet(d, 'Day'));
	  }

	  function moveToBeginningOfUnit(d, unit) {
	    var set = {};
	    switch(unit) {
	      case 'year':  set['year']    = callDateGet(d, 'FullYear'); break;
	      case 'month': set['month']   = callDateGet(d, 'Month');    break;
	      case 'day':   set['day']     = callDateGet(d, 'Date');     break;
	      case 'week':  set['weekday'] = 0; break;
	    }
	    return setDate(d, [set, true]);
	  }

	  function moveToEndOfUnit(d, unit) {
	    var set = { 'hours': 23, 'minutes': 59, 'seconds': 59, 'milliseconds': 999 };
	    switch(unit) {
	      case 'year':  set['month']   = 11; set['day'] = 31; break;
	      case 'month': set['day']     = getDaysInMonth(d);  break;
	      case 'week':  set['weekday'] = 6;                   break;
	    }
	    return setDate(d, [set, true]);
	  }

	  // Date parsing helpers

	  function getFormatMatch(match, arr) {
	    var obj = {}, value, num;
	    arr.forEach(function(key, i) {
	      value = match[i + 1];
	      if(isUndefined(value) || value === '') return;
	      if(key === 'year') {
	        obj.yearAsString = value.replace(/'/, '');
	      }
	      num = parseFloat(value.replace(/'/, '').replace(/,/, '.'));
	      obj[key] = !isNaN(num) ? num : value.toLowerCase();
	    });
	    return obj;
	  }

	  function cleanDateInput(str) {
	    str = str.trim().replace(/^just (?=now)|\.+$/i, '');
	    return convertAsianDigits(str);
	  }

	  function convertAsianDigits(str) {
	    return str.replace(AsianDigitReg, function(full, disallowed, match) {
	      var sum = 0, place = 1, lastWasHolder, lastHolder;
	      if(disallowed) return full;
	      match.split('').reverse().forEach(function(letter) {
	        var value = AsianDigitMap[letter], holder = value > 9;
	        if(holder) {
	          if(lastWasHolder) sum += place;
	          place *= value / (lastHolder || 1);
	          lastHolder = value;
	        } else {
	          if(lastWasHolder === false) {
	            place *= 10;
	          }
	          sum += place * value;
	        }
	        lastWasHolder = holder;
	      });
	      if(lastWasHolder) sum += place;
	      return sum;
	    });
	  }

	  function getExtendedDate(contextDate, f, localeCode, prefer, forceUTC) {
	    // TODO can we split this up into smaller methods?
	    var d, relative, baseLocalization, afterCallbacks, loc, set, unit, unitIndex, weekday, num, tmp, weekdayForward;

	    d = getNewDate();
	    afterCallbacks = [];

	    function afterDateSet(fn) {
	      afterCallbacks.push(fn);
	    }

	    function fireCallbacks() {
	      afterCallbacks.forEach(function(fn) {
	        fn.call();
	      });
	    }

	    function getWeekdayWithMultiplier(w) {
	      var num = set['num'] && !set['unit'] ? set['num'] : 1;
	      return (7 * (num - 1)) + w;
	    }

	    function setWeekdayOfMonth() {
	      setWeekday(d, set['weekday'], true);
	    }

	    function setUnitEdge() {
	      var modifier = loc.modifiersByName[set['edge']];
	      iterateOverDateUnits(function(name) {
	        if(isDefined(set[name])) {
	          unit = name;
	          return false;
	        }
	      }, 4);
	      if(unit === 'year') {
	        set.specificity = 'month';
	      } else if(unit === 'month' || unit === 'week') {
	        set.specificity = 'day';
	      }
	      if(modifier.value < 0) {
	        moveToEndOfUnit(d, unit);
	      } else {
	        moveToBeginningOfUnit(d, unit);
	      }
	      // This value of -2 is arbitrary but it's a nice clean way to hook into this system.
	      if(modifier.value === -2) resetDate(d);
	    }

	    function separateAbsoluteUnits() {
	      var params;
	      iterateOverDateUnits(function(name, u, i) {
	        if(name === 'day') name = 'date';
	        if(isDefined(set[name])) {
	          // If there is a time unit set that is more specific than
	          // the matched unit we have a string like "5:30am in 2 minutes",
	          // which is meaningless, so invalidate the date...
	          if(i >= unitIndex) {
	            invalidateDate(d);
	            return false;
	          }
	          // ...otherwise set the params to set the absolute date
	          // as a callback after the relative date has been set.
	          params = params || {};
	          params[name] = set[name];
	          delete set[name];
	        }
	      });
	      if(params) {
	        afterDateSet(function() {
	          setDate(d, [params, true]);
	        });
	      }
	    }

	    setUTC(d, forceUTC);

	    if(isDate(f)) {
	      // If the source here is already a date object, then the operation
	      // is the same as cloning the date, which preserves the UTC flag.
	      setUTC(d, isUTC(f)).setTime(f.getTime());
	    } else if(isNumber(f) || f === null) {
	      d.setTime(f);
	    } else if(isObjectType(f)) {
	      setDate(d, [f, true]);
	      set = f;
	    } else if(isString(f)) {

	      // The act of getting the localization will pre-initialize
	      // if it is missing and add the required formats.
	      baseLocalization = getLocalization(localeCode);

	      // Clean the input and convert Kanji based numerals if they exist.
	      f = cleanDateInput(f);

	      if(baseLocalization) {
	        iterateOverObject(baseLocalization.getFormats(), function(i, dif) {
	          var match = f.match(dif.reg);
	          if(match) {

	            loc = dif.locale;
	            set = getFormatMatch(match, dif.to, loc);
	            loc.cachedFormat = dif;

	            if(set['utc']) {
	              setUTC(d, true);
	            }

	            if(set.timestamp) {
	              set = set.timestamp;
	              return false;
	            }

	            if(dif.variant && !isString(set['month']) && (isString(set['date']) || baseLocalization.hasVariant(localeCode))) {
	              // If there's a variant (crazy Endian American format), swap the month and day.
	              tmp = set['month'];
	              set['month'] = set['date'];
	              set['date']  = tmp;
	            }

	            if(hasAbbreviatedYear(set)) {
	              // If the year is 2 digits then get the implied century.
	              set['year'] = getYearFromAbbreviation(set['year']);
	            }

	            if(set['month']) {
	              // Set the month which may be localized.
	              set['month'] = loc.getMonth(set['month']);
	              if(set['shift'] && !set['unit']) set['unit'] = loc['units'][7];
	            }

	            if(set['weekday'] && set['date']) {
	              // If there is both a weekday and a date, the date takes precedence.
	              delete set['weekday'];
	            } else if(set['weekday']) {
	              // Otherwise set a localized weekday.
	              set['weekday'] = loc.getWeekday(set['weekday']);
	              if(set['shift'] && !set['unit']) {
	                set['unit'] = loc['units'][5];
	              }
	            }

	            if(set['day'] && (tmp = loc.modifiersByName[set['day']])) {
	              // Relative day localizations such as "today" and "tomorrow".
	              set['day'] = tmp.value;
	              resetDate(d);
	              relative = true;
	            } else if(set['day'] && (weekday = loc.getWeekday(set['day'])) > -1) {
	              // If the day is a weekday, then set that instead.
	              delete set['day'];
	              set['weekday'] = getWeekdayWithMultiplier(weekday);
	              if(set['num'] && set['month']) {
	                // If we have "the 2nd Tuesday of June", then pass the "weekdayForward" flag
	                // along to updateDate so that the date does not accidentally traverse into
	                // the previous month. This needs to be independent of the "prefer" flag because
	                // we are only ensuring that the weekday is in the future, not the entire date.
	                weekdayForward = true;
	              }
	            }

	            if(set['date'] && !isNumber(set['date'])) {
	              set['date'] = loc.getNumericDate(set['date']);
	            }

	            if(loc.matchPM(set['ampm']) && set['hour'] < 12) {
	              // If the time is 1pm-11pm advance the time by 12 hours.
	              set['hour'] += 12;
	            } else if(loc.matchAM(set['ampm']) && set['hour'] === 12) {
	              // If it is 12:00am then set the hour to 0.
	              set['hour'] = 0;
	            }

	            if('offset_hours' in set || 'offset_minutes' in set) {
	              // Adjust for timezone offset
	              setUTC(d, true);
	              set['offset_minutes'] = set['offset_minutes'] || 0;
	              set['offset_minutes'] += set['offset_hours'] * 60;
	              if(set['offset_sign'] === '-') {
	                set['offset_minutes'] *= -1;
	              }
	              set['minute'] -= set['offset_minutes'];
	            }

	            if(set['unit']) {
	              // Date has a unit like "days", "months", etc. are all relative to the current date.
	              relative  = true;
	              num       = loc.getNumber(set['num']);
	              unitIndex = loc.getUnitIndex(set['unit']);
	              unit      = English['units'][unitIndex];

	              // Formats like "the 15th of last month" or "6:30pm of next week"
	              // contain absolute units in addition to relative ones, so separate
	              // them here, remove them from the params, and set up a callback to
	              // set them after the relative ones have been set.
	              separateAbsoluteUnits();

	              if(set['shift']) {
	                // Shift and unit, ie "next month", "last week", etc.
	                num *= (tmp = loc.modifiersByName[set['shift']]) ? tmp.value : 0;
	              }

	              if(set['sign'] && (tmp = loc.modifiersByName[set['sign']])) {
	                // Unit and sign, ie "months ago", "weeks from now", etc.
	                num *= tmp.value;
	              }

	              if(isDefined(set['weekday'])) {
	                // Units can be with non-relative dates, set here. ie "the day after monday"
	                setDate(d, [{'weekday': set['weekday'] }, true]);
	                delete set['weekday'];
	              }

	              // Finally shift the unit.
	              set[unit] = (set[unit] || 0) + num;
	            }

	            if(set['edge']) {
	              // If there is an "edge" it needs to be set after the
	              // other fields are set. ie "the end of February"
	              afterDateSet(setUnitEdge);
	            }

	            if(set['year_sign'] === '-') {
	              set['year'] *= -1;
	            }

	            iterateOverDateUnits(function(name, unit, i) {
	              var value = set[name], fraction = value % 1;
	              if(fraction) {
	                set[DateUnitsReversed[i - 1].name] = round(fraction * (name === 'second' ? 1000 : 60));
	                set[name] = floor(value);
	              }
	            }, 1, 4);
	            return false;
	          }
	        });
	      }
	      if(!set) {
	        // The Date constructor does something tricky like checking the number
	        // of arguments so simply passing in undefined won't work.
	        if(!/^now$/i.test(f)) {
	          d = new date(f);
	        }
	        if(forceUTC) {
	          // Falling back to system date here which cannot be parsed as UTC,
	          // so if we're forcing UTC then simply add the offset.
	          d.addMinutes(-d.getTimezoneOffset());
	        }
	      } else if(relative) {
	        if (contextDate) {
	          // If this is a relative date and is being created via an instance
	          // method (usually "[unit]FromNow", etc), then use the original date
	          // (that the instance method was called on) as the starting point
	          // rather than the freshly created date above to avoid subtle
	          // discrepancies due to the fact that the fresh date was created
	          // slightly later.
	          d = cloneDate(contextDate);
	        }
	        advanceDate(d, [set]);
	      } else {
	        if(d._utc) {
	          // UTC times can traverse into other days or even months,
	          // so preemtively reset the time here to prevent this.
	          resetDate(d);
	        }
	        updateDate(d, set, true, false, prefer, weekdayForward);
	      }
	      fireCallbacks();
	      // A date created by parsing a string presumes that the format *itself* is UTC, but
	      // not that the date, once created, should be manipulated as such. In other words,
	      // if you are creating a date object from a server time "2012-11-15T12:00:00Z",
	      // in the majority of cases you are using it to create a date that will, after creation,
	      // be manipulated as local, so reset the utc flag here.
	      setUTC(d, false);
	    }
	    return {
	      date: d,
	      set: set
	    }
	  }

	  function hasAbbreviatedYear(obj) {
	    return obj.yearAsString && obj.yearAsString.length === 2;
	  }

	  // If the year is two digits, add the most appropriate century prefix.
	  function getYearFromAbbreviation(year) {
	    return round(callDateGet(getNewDate(), 'FullYear') / 100) * 100 - round(year / 100) * 100 + year;
	  }

	  function getShortHour(d) {
	    var hours = callDateGet(d, 'Hours');
	    return hours === 0 ? 12 : hours - (floor(hours / 13) * 12);
	  }

	  // weeksSince won't work here as the result needs to be floored, not rounded.
	  function getWeekNumber(date) {
	    date = cloneDate(date);
	    var dow = callDateGet(date, 'Day') || 7;
	    resetDate(advanceDate(date, [(4 - dow) + ' days']));
	    return 1 + floor(sugarDate.daysSince(date, moveToBeginningOfUnit(cloneDate(date), 'year')) / 7);
	  }

	  function setWeekNumber(date, num) {
	    var weekday = callDateGet(date, 'Day') || 7;
	    if(isUndefined(num)) return;
	    setDate(date, [{ 'month': 0, 'date': 4 }]);
	    setDate(date, [{ 'weekday': 1 }]);
	    if(num > 1) {
	      advanceDate(date, [{ 'weeks': num - 1 }]);
	    }
	    if(weekday !== 1) {
	      advanceDate(date, [{ 'days': weekday - 1 }]);
	    }
	    return date.getTime();
	  }

	  function getDaysInMonth(d) {
	    return 32 - callDateGet(new date(callDateGet(d, 'FullYear'), callDateGet(d, 'Month'), 32), 'Date');
	  }

	  // Gets an "adjusted date unit" which is a way of representing
	  // the largest possible meaningful unit. In other words, if passed
	  // 3600000, this will return an array which represents "1 hour".
	  function getAdjustedUnit(ms, fn) {
	    var unitIndex = 0, value = 0;
	    iterateOverObject(DateUnits, function(i, unit) {
	      value = abs(fn(unit));
	      if(value >= 1) {
	        unitIndex = 7 - i;
	        return false;
	      }
	    });
	    return [value, unitIndex, ms];
	  }

	  // Gets the adjusted unit based on simple division by
	  // date unit multiplier.
	  function getAdjustedUnitForNumber(ms) {
	    return getAdjustedUnit(ms, function(unit) {
	      return floor(withPrecision(ms / unit.multiplier, 1));
	    });
	  }

	  // Gets the adjusted unit using the [unit]FromNow methods,
	  // which use internal date methods that neatly avoid vaguely
	  // defined units of time (days in month, leap years, etc).
	  function getAdjustedUnitForDate(d) {
	    var ms = sugarDate.millisecondsFromNow(d);
	    if (d.getTime() > date.now()) {

	      // This adjustment is solely to allow
	      // Date.create('1 year from now').relative() to remain
	      // "1 year from now" instead of "11 months from now",
	      // as it would be due to the fact that the internal
	      // "now" date in "relative" is created slightly after
	      // that in "create".
	      d = new date(d.getTime() + 10);
	    }
	    return getAdjustedUnit(ms, function(unit) {
	      return abs(sugarDate[unit.name + 'sFromNow'](d));
	    });
	  }

	  // Date format token helpers

	  function createMeridianTokens(slice, caps) {
	    var fn = function(d, localeCode) {
	      var hours = callDateGet(d, 'Hours');
	      return getLocalization(localeCode).get('ampm')[floor(hours / 12)] || '';
	    }
	    createFormatToken('t', fn, 1);
	    createFormatToken('tt', fn);
	    createFormatToken('T', fn, 1, 1);
	    createFormatToken('TT', fn, null, 2);
	  }

	  function createWeekdayTokens(slice, caps) {
	    var fn = function(d, localeCode) {
	      var dow = callDateGet(d, 'Day');
	      return getLocalization(localeCode)['weekdays'][dow];
	    }
	    createFormatToken('do', fn, 2);
	    createFormatToken('Do', fn, 2, 1);
	    createFormatToken('dow', fn, 3);
	    createFormatToken('Dow', fn, 3, 1);
	    createFormatToken('weekday', fn);
	    createFormatToken('Weekday', fn, null, 1);
	  }

	  function createMonthTokens(slice, caps) {
	    createMonthToken('mon', 0, 3);
	    createMonthToken('month', 0);

	    // For inflected month forms, namely Russian.
	    createMonthToken('month2', 1);
	    createMonthToken('month3', 2);
	  }

	  function createMonthToken(token, multiplier, slice) {
	    var fn = function(d, localeCode) {
	      var month = callDateGet(d, 'Month');
	      return getLocalization(localeCode)['months'][month + (multiplier * 12)];
	    };
	    createFormatToken(token, fn, slice);
	    createFormatToken(simpleCapitalize(token), fn, slice, 1);
	  }

	  function createFormatToken(t, fn, slice, caps) {
	    DateFormatTokens[t] = function(d, localeCode) {
	      var str = fn(d, localeCode);
	      if(slice) str = str.slice(0, slice);
	      if(caps)  str = str.slice(0, caps).toUpperCase() + str.slice(caps);
	      return str;
	    }
	  }

	  function createPaddedToken(t, fn, ms) {
	    DateFormatTokens[t] = fn;
	    DateFormatTokens[t + t] = function (d, localeCode) {
	      return padNumber(fn(d, localeCode), 2);
	    };
	    if(ms) {
	      DateFormatTokens[t + t + t] = function (d, localeCode) {
	        return padNumber(fn(d, localeCode), 3);
	      };
	      DateFormatTokens[t + t + t + t] = function (d, localeCode) {
	        return padNumber(fn(d, localeCode), 4);
	      };
	    }
	  }


	  // Date formatting helpers

	  function buildCompiledOutputFormat(format) {
	    var match = format.match(/(\{\w+\})|[^{}]+/g);
	    CompiledOutputFormats[format] = match.map(function(p) {
	      p.replace(/\{(\w+)\}/, function(full, token) {
	        p = DateFormatTokens[token] || token;
	        return token;
	      });
	      return p;
	    });
	  }

	  function executeCompiledOutputFormat(date, format, localeCode) {
	    var compiledFormat, length, i, t, result = '';
	    compiledFormat = CompiledOutputFormats[format];
	    for(i = 0, length = compiledFormat.length; i < length; i++) {
	      t = compiledFormat[i];
	      result += isFunction(t) ? t(date, localeCode) : t;
	    }
	    return result;
	  }

	  function formatDate(date, format, relative, localeCode) {
	    var adu;
	    if(!isValid(date)) {
	      return 'Invalid Date';
	    } else if(isString(sugarDate[format])) {
	      format = sugarDate[format];
	    } else if(isFunction(format)) {
	      adu = getAdjustedUnitForDate(date);
	      format = format.apply(date, adu.concat(getLocalization(localeCode)));
	    }
	    if(!format && relative) {
	      adu = adu || getAdjustedUnitForDate(date);
	      // Adjust up if time is in ms, as this doesn't
	      // look very good for a standard relative date.
	      if(adu[1] === 0) {
	        adu[1] = 1;
	        adu[0] = 1;
	      }
	      return getLocalization(localeCode).getRelativeFormat(adu);
	    }
	    format = format || 'long';
	    if(format === 'short' || format === 'long' || format === 'full') {
	      format = getLocalization(localeCode)[format];
	    }

	    if(!CompiledOutputFormats[format]) {
	      buildCompiledOutputFormat(format);
	    }

	    return executeCompiledOutputFormat(date, format, localeCode);
	  }

	  // Date comparison helpers

	  function fullCompareDate(d, f, margin, utc) {
	    var tmp, comp;
	    if(!isValid(d)) return;
	    if(isString(f)) {
	      f = f.trim().toLowerCase();
	      comp = setUTC(cloneDate(d), utc);
	      switch(true) {
	        case f === 'future':  return d.getTime() > getNewDate().getTime();
	        case f === 'past':    return d.getTime() < getNewDate().getTime();
	        case f === 'weekday': return callDateGet(comp, 'Day') > 0 && callDateGet(comp, 'Day') < 6;
	        case f === 'weekend': return callDateGet(comp, 'Day') === 0 || callDateGet(comp, 'Day') === 6;
	        case (tmp = English['weekdays'].indexOf(f) % 7) > -1: return callDateGet(comp, 'Day') === tmp;
	        case (tmp = English['months'].indexOf(f) % 12) > -1:  return callDateGet(comp, 'Month') === tmp;
	      }
	    }
	    return compareDate(d, f, null, margin, utc);
	  }

	  function compareDate(d, find, localeCode, buffer, forceUTC) {
	    var p, t, min, max, override, accuracy = 0, loBuffer = 0, hiBuffer = 0;
	    p = getExtendedDate(null, find, localeCode, null, forceUTC);
	    if(buffer > 0) {
	      loBuffer = hiBuffer = buffer;
	      override = true;
	    }
	    if(!isValid(p.date)) return false;
	    if(p.set && p.set.specificity) {
	      if(p.set['edge'] || p.set['shift']) {
	        moveToBeginningOfUnit(p.date, p.set.specificity);
	      }
	      if(p.set.specificity === 'month') {
	        max = moveToEndOfUnit(cloneDate(p.date), p.set.specificity).getTime();
	      } else {
	        max = advanceDate(cloneDate(p.date), ['1 ' + p.set.specificity]).getTime() - 1;
	      }
	      if(!override && p.set['sign'] && p.set.specificity !== 'millisecond') {
	        // If the time is relative, there can occasionally be an disparity between the relative date
	        // and "now", which it is being compared to, so set an extra buffer to account for this.
	        loBuffer = 50;
	        hiBuffer = -50;
	      }
	    }
	    t   = d.getTime();
	    min = p.date.getTime();
	    max = max || (min + accuracy);
	    max = compensateForTimezoneTraversal(d, min, max);
	    return t >= (min - loBuffer) && t <= (max + hiBuffer);
	  }

	  function compensateForTimezoneTraversal(d, min, max) {
	    var dMin, dMax, minOffset, maxOffset;
	    dMin = new date(min);
	    dMax = setUTC(new date(max), isUTC(d));
	    if(callDateGet(dMax, 'Hours') !== 23) {
	      minOffset = dMin.getTimezoneOffset();
	      maxOffset = dMax.getTimezoneOffset();
	      if(minOffset !== maxOffset) {
	        max += (maxOffset - minOffset).minutes();
	      }
	    }
	    return max;
	  }

	  function updateDate(d, params, reset, advance, prefer, weekdayForward) {
	    var specificityIndex;

	    function getParam(key) {
	      return isDefined(params[key]) ? params[key] : params[key + 's'];
	    }

	    function paramExists(key) {
	      return isDefined(getParam(key));
	    }

	    function uniqueParamExists(key, isDay) {
	      return paramExists(key) || (isDay && paramExists('weekday') && !paramExists('month'));
	    }

	    function canDisambiguate() {
	      switch(prefer) {
	        case -1: return d > getNewDate();
	        case  1: return d < getNewDate();
	      }
	    }

	    if(isNumber(params) && advance) {
	      // If param is a number and we're advancing, the number is presumed to be milliseconds.
	      params = { 'milliseconds': params };
	    } else if(isNumber(params)) {
	      // Otherwise just set the timestamp and return.
	      d.setTime(params);
	      return d;
	    }

	    // "date" can also be passed for the day
	    if(isDefined(params['date'])) {
	      params['day'] = params['date'];
	    }

	    // Reset any unit lower than the least specific unit set. Do not do this for weeks
	    // or for years. This needs to be performed before the acutal setting of the date
	    // because the order needs to be reversed in order to get the lowest specificity,
	    // also because higher order units can be overwritten by lower order units, such
	    // as setting hour: 3, minute: 345, etc.
	    iterateOverDateUnits(function(name, unit, i) {
	      var isDay = name === 'day';
	      if(uniqueParamExists(name, isDay)) {
	        params.specificity = name;
	        specificityIndex = +i;
	        return false;
	      } else if(reset && name !== 'week' && (!isDay || !paramExists('week'))) {
	        // Days are relative to months, not weeks, so don't reset if a week exists.
	        callDateSet(d, unit.method, (isDay ? 1 : 0));
	      }
	    });

	    // Now actually set or advance the date in order, higher units first.
	    DateUnits.forEach(function(u, i) {
	      var name = u.name, method = u.method, higherUnit = DateUnits[i - 1], value;
	      value = getParam(name)
	      if(isUndefined(value)) return;
	      if(advance) {
	        if(name === 'week') {
	          value *= 7;
	          method = 'Date';
	        }
	        value = (value * advance) + callDateGet(d, method);
	      } else if(name === 'month' && paramExists('day')) {
	        // When setting the month, there is a chance that we will traverse into a new month.
	        // This happens in DST shifts, for example June 1st DST jumping to January 1st
	        // (non-DST) will have a shift of -1:00 which will traverse into the previous year.
	        // Prevent this by proactively setting the day when we know it will be set again anyway.
	        // It can also happen when there are not enough days in the target month. This second
	        // situation is identical to checkMonthTraversal below, however when we are advancing
	        // we want to reset the date to "the last date in the target month". In the case of
	        // DST shifts, however, we want to avoid the "edges" of months as that is where this
	        // unintended traversal can happen. This is the reason for the different handling of
	        // two similar but slightly different situations.
	        //
	        // TL;DR This method avoids the edges of a month IF not advancing and the date is going
	        // to be set anyway, while checkMonthTraversal resets the date to the last day if advancing.
	        //
	        callDateSet(d, 'Date', 15);
	      }
	      callDateSetWithWeek(d, method, value);
	      if(advance && name === 'month') {
	        checkMonthTraversal(d, value);
	      }
	    });

	    // If a weekday is included in the params and no 'date' parameter
	    // is overriding, set it here after all other units have been set.
	    // Note that the date has to be perfectly set before disambiguation
	    // so that a proper comparison can be made.
	    if(!advance && !paramExists('day') && paramExists('weekday')) {
	      setWeekday(d, getParam('weekday'), weekdayForward);
	    }

	    // If past or future is preferred, then the process of "disambiguation" will ensure that an
	    // ambiguous time/date ("4pm", "thursday", "June", etc.) will be in the past or future.
	    if(canDisambiguate()) {
	      iterateOverDateUnits(function(name, u) {
	        var ambiguous = u.ambiguous || (name === 'week' && paramExists('weekday'));
	        if(ambiguous && !uniqueParamExists(name, name === 'day')) {
	          sugarDate[u.addMethod](d, prefer);
	          return false;
	        } else if(name === 'year' && hasAbbreviatedYear(params)) {
	          advanceDate(d, [{'years': 100 * prefer}]);
	        }
	      }, specificityIndex + 1);
	    }
	    return d;
	  }

	  // The ISO format allows times strung together without a demarcating ":", so make sure
	  // that these markers are now optional.
	  function prepareTime(format, loc, iso) {
	    var timeSuffixMapping = {'h':0,'m':1,'s':2}, add;
	    loc = loc || English;
	    return format.replace(/{([a-z])}/g, function(full, token) {
	      var separators = [],
	          isHours = token === 'h',
	          tokenIsRequired = isHours && !iso;
	      if(token === 't') {
	        return loc.get('ampm').join('|');
	      } else {
	        if(isHours) {
	          separators.push(':');
	        }
	        if(add = loc['timeSuffixes'][timeSuffixMapping[token]]) {
	          separators.push(add + '\\s*');
	        }
	        return separators.length === 0 ? '' : '(?:' + separators.join('|') + ')' + (tokenIsRequired ? '' : '?');
	      }
	    });
	  }

	  // If the month is being set, then we don't want to accidentally
	  // traverse into a new month just because the target month doesn't have enough
	  // days. In other words, "5 months ago" from July 30th is still February, even
	  // though there is no February 30th, so it will of necessity be February 28th
	  // (or 29th in the case of a leap year).
	  function checkMonthTraversal(date, targetMonth) {
	    if(targetMonth < 0) {
	      targetMonth = targetMonth % 12 + 12;
	    }
	    if(targetMonth % 12 !== callDateGet(date, 'Month')) {
	      callDateSet(date, 'Date', 0);
	    }
	  }

	  function createDateFromArgs(contextDate, args, prefer, forceUTC) {
	    var f, localeCode;
	    if(isNumber(args[1])) {
	      // If the second argument is a number, then we have an
	      // enumerated constructor type as in "new Date(2003, 2, 12);"
	      f = collectDateArguments(args)[0];
	    } else {
	      f = args[0];
	      localeCode = args[1];
	    }
	    return createDate(contextDate, f, localeCode, prefer, forceUTC);
	  }

	  function createDate(contextDate, f, localeCode, prefer, forceUTC) {
	    return getExtendedDate(contextDate, f, localeCode, prefer, forceUTC).date;
	  }

	  function invalidateDate(d) {
	    d.setTime(NaN);
	  }

	  function buildDateUnits() {
	    DateUnitsReversed = DateUnits.concat().reverse();
	    DateArgumentUnits = DateUnits.concat();
	    DateArgumentUnits.splice(2,1);
	  }


	  /***
	   * @method [units]Since([d], [locale] = currentLocale)
	   * @returns Number
	   * @short Returns the time since [d] in the appropriate unit.
	   * @extra [d] will accept a date object, timestamp, or text format. If not specified, [d] is assumed to be now. [locale] can be passed to specify the locale that the date is in. %[unit]Ago% is provided as an alias to make this more readable when [d] is assumed to be the current date. For more see @date_format.
	   *
	   * @set
	   *   millisecondsSince
	   *   secondsSince
	   *   minutesSince
	   *   hoursSince
	   *   daysSince
	   *   weeksSince
	   *   monthsSince
	   *   yearsSince
	   *
	   * @example
	   *
	   *   Date.create().millisecondsSince('1 hour ago') -> 3,600,000
	   *   Date.create().daysSince('1 week ago')         -> 7
	   *   Date.create().yearsSince('15 years ago')      -> 15
	   *   Date.create('15 years ago').yearsAgo()        -> 15
	   *
	   ***
	   * @method [units]Ago()
	   * @returns Number
	   * @short Returns the time ago in the appropriate unit.
	   *
	   * @set
	   *   millisecondsAgo
	   *   secondsAgo
	   *   minutesAgo
	   *   hoursAgo
	   *   daysAgo
	   *   weeksAgo
	   *   monthsAgo
	   *   yearsAgo
	   *
	   * @example
	   *
	   *   Date.create('last year').millisecondsAgo() -> 3,600,000
	   *   Date.create('last year').daysAgo()         -> 7
	   *   Date.create('last year').yearsAgo()        -> 15
	   *
	   ***
	   * @method [units]Until([d], [locale] = currentLocale)
	   * @returns Number
	   * @short Returns the time until [d] in the appropriate unit.
	   * @extra [d] will accept a date object, timestamp, or text format. If not specified, [d] is assumed to be now. [locale] can be passed to specify the locale that the date is in. %[unit]FromNow% is provided as an alias to make this more readable when [d] is assumed to be the current date. For more see @date_format.
	   *
	   * @set
	   *   millisecondsUntil
	   *   secondsUntil
	   *   minutesUntil
	   *   hoursUntil
	   *   daysUntil
	   *   weeksUntil
	   *   monthsUntil
	   *   yearsUntil
	   *
	   * @example
	   *
	   *   Date.create().millisecondsUntil('1 hour from now') -> 3,600,000
	   *   Date.create().daysUntil('1 week from now')         -> 7
	   *   Date.create().yearsUntil('15 years from now')      -> 15
	   *   Date.create('15 years from now').yearsFromNow()    -> 15
	   *
	   ***
	   * @method [units]FromNow()
	   * @returns Number
	   * @short Returns the time from now in the appropriate unit.
	   *
	   * @set
	   *   millisecondsFromNow
	   *   secondsFromNow
	   *   minutesFromNow
	   *   hoursFromNow
	   *   daysFromNow
	   *   weeksFromNow
	   *   monthsFromNow
	   *   yearsFromNow
	   *
	   * @example
	   *
	   *   Date.create('next year').millisecondsFromNow() -> 3,600,000
	   *   Date.create('next year').daysFromNow()         -> 7
	   *   Date.create('next year').yearsFromNow()        -> 15
	   *
	   ***
	   * @method add[Units](<num>, [reset] = false)
	   * @returns Date
	   * @short Adds <num> of the unit to the date. If [reset] is true, all lower units will be reset.
	   * @extra Note that "months" is ambiguous as a unit of time. If the target date falls on a day that does not exist (ie. August 31 -> February 31), the date will be shifted to the last day of the month. Don't use %addMonths% if you need precision.
	   *
	   * @set
	   *   addMilliseconds
	   *   addSeconds
	   *   addMinutes
	   *   addHours
	   *   addDays
	   *   addWeeks
	   *   addMonths
	   *   addYears
	   *
	   * @example
	   *
	   *   Date.create().addMilliseconds(5) -> current time + 5 milliseconds
	   *   Date.create().addDays(5)         -> current time + 5 days
	   *   Date.create().addYears(5)        -> current time + 5 years
	   *
	   ***
	   * @method isLast[Unit]()
	   * @returns Boolean
	   * @short Returns true if the date is last week/month/year.
	   *
	   * @set
	   *   isLastWeek
	   *   isLastMonth
	   *   isLastYear
	   *
	   * @example
	   *
	   *   Date.create('yesterday').isLastWeek()  -> true or false?
	   *   Date.create('yesterday').isLastMonth() -> probably not...
	   *   Date.create('yesterday').isLastYear()  -> even less likely...
	   *
	   ***
	   * @method isThis[Unit]()
	   * @returns Boolean
	   * @short Returns true if the date is this week/month/year.
	   *
	   * @set
	   *   isThisWeek
	   *   isThisMonth
	   *   isThisYear
	   *
	   * @example
	   *
	   *   Date.create('tomorrow').isThisWeek()  -> true or false?
	   *   Date.create('tomorrow').isThisMonth() -> probably...
	   *   Date.create('tomorrow').isThisYear()  -> signs point to yes...
	   *
	   ***
	   * @method isNext[Unit]()
	   * @returns Boolean
	   * @short Returns true if the date is next week/month/year.
	   *
	   * @set
	   *   isNextWeek
	   *   isNextMonth
	   *   isNextYear
	   *
	   * @example
	   *
	   *   Date.create('tomorrow').isNextWeek()  -> true or false?
	   *   Date.create('tomorrow').isNextMonth() -> probably not...
	   *   Date.create('tomorrow').isNextYear()  -> even less likely...
	   *
	   ***
	   * @method beginningOf[Unit]()
	   * @returns Date
	   * @short Sets the date to the beginning of the appropriate unit.
	   *
	   * @set
	   *   beginningOfDay
	   *   beginningOfWeek
	   *   beginningOfMonth
	   *   beginningOfYear
	   *
	   * @example
	   *
	   *   Date.create().beginningOfDay()   -> the beginning of today (resets the time)
	   *   Date.create().beginningOfWeek()  -> the beginning of the week
	   *   Date.create().beginningOfMonth() -> the beginning of the month
	   *   Date.create().beginningOfYear()  -> the beginning of the year
	   *
	   ***
	   * @method endOf[Unit]()
	   * @returns Date
	   * @short Sets the date to the end of the appropriate unit.
	   *
	   * @set
	   *   endOfDay
	   *   endOfWeek
	   *   endOfMonth
	   *   endOfYear
	   *
	   * @example
	   *
	   *   Date.create().endOfDay()   -> the end of today (sets the time to 23:59:59.999)
	   *   Date.create().endOfWeek()  -> the end of the week
	   *   Date.create().endOfMonth() -> the end of the month
	   *   Date.create().endOfYear()  -> the end of the year
	   *
	   ***/

	  function buildDateMethods() {
	    extendSimilar(date, DateUnits, function(methods, u, i) {
	      var name = u.name, caps = simpleCapitalize(name), since, until;
	      u.addMethod = 'add' + caps + 's';

	      function add(num, reset) {
	        var set = {};
	        set[name] = num;
	        return advanceDate(this, [set, reset]);
	      }

	      function timeDistanceNumeric(d1, d2) {
	        var n = (d1.getTime() - d2.getTime()) / u.multiplier;
	        return n < 0 ? ceil(n) : floor(n);
	      }

	      function addUnit(d, n, dsc) {
	        var d2;
	        add.call(d, n);
	        // "dsc" = "date shift compensation"
	        // This number should only be passed when traversing months to
	        // compensate for date shifting. For example, calling "1 month ago"
	        // on March 30th will result in February 28th, as there are not enough
	        // days. This is not an issue when creating new dates, as "2 months ago"
	        // gives an exact target to set, and the date shift is expected. However,
	        // when counting months using unit traversal, the date needs to stay the
	        // same if possible. To compensate for this, we need to try to reset the
	        // date after every iteration, and use the result if possible.
	        if (dsc && callDateGet(d, 'Date') !== dsc) {
	          d2 = cloneDate(d);
	          callDateSet(d2, 'Date', dsc);
	          if (callDateGet(d2, 'Date') === dsc) {
	            return d2;
	          }
	        }
	        return d;
	      }

	      function timeDistanceTraversal(d1, d2) {
	        var d, inc, n, dsc, count = 0;
	        d = cloneDate(d1);
	        inc = d1 < d2;
	        n = inc ? 1 : -1
	        dsc = name === 'month' && callDateGet(d, 'Date');
	        d = addUnit(d, n, dsc);
	        while (inc ? d <= d2 : d >= d2) {
	          count += -n;
	          d = addUnit(d, n, dsc);
	        }
	        return count;
	      }

	      function compareSince(fn, d, args) {
	        return fn(d, createDateFromArgs(d, args, 0, false));
	      }

	      function compareUntil(fn, d, args) {
	        return fn(createDateFromArgs(d, args, 0, false), d);
	      }

	      if(i < 3) {
	        ['Last','This','Next'].forEach(function(shift) {
	          methods['is' + shift + caps] = function() {
	            return compareDate(this, shift + ' ' + name, 'en');
	          };
	        });
	      }
	      if(i < 4) {
	        methods['beginningOf' + caps] = function() {
	          return moveToBeginningOfUnit(this, name);
	        };
	        methods['endOf' + caps] = function() {
	          return moveToEndOfUnit(this, name);
	        };
	        since = function() {
	          return compareSince(timeDistanceTraversal, this, arguments);
	        };
	        until = function() {
	          return compareUntil(timeDistanceTraversal, this, arguments);
	        };
	      } else {
	        since = function() {
	          return compareSince(timeDistanceNumeric, this, arguments);
	        };
	        until = function() {
	          return compareUntil(timeDistanceNumeric, this, arguments);
	        };
	      }
	      methods[name + 'sAgo']     = until;
	      methods[name + 'sUntil']   = until;
	      methods[name + 'sSince']   = since;
	      methods[name + 'sFromNow'] = since;

	      methods[u.addMethod] = add;
	      buildNumberToDateAlias(u, u.multiplier);
	    });
	  }

	  function buildCoreInputFormats() {
	    English.addFormat('([+-])?(\\d{4,4})[-.\\/]?{full_month}[-.]?(\\d{1,2})?', true, ['year_sign','year','month','date'], false, true);
	    English.addFormat('(\\d{1,2})[-.\\/]{full_month}(?:[-.\\/](\\d{2,4}))?', true, ['date','month','year'], true);
	    English.addFormat('{full_month}[-.](\\d{4,4})', false, ['month','year']);
	    English.addFormat('\\/Date\\((\\d+(?:[+-]\\d{4,4})?)\\)\\/', false, ['timestamp'])
	    English.addFormat(prepareTime(RequiredTime, English), false, TimeFormat)

	    // When a new locale is initialized it will have the CoreDateFormats initialized by default.
	    // From there, adding new formats will push them in front of the previous ones, so the core
	    // formats will be the last to be reached. However, the core formats themselves have English
	    // months in them, which means that English needs to first be initialized and creates a race
	    // condition. I'm getting around this here by adding these generalized formats in the order
	    // specific -> general, which will mean they will be added to the English localization in
	    // general -> specific order, then chopping them off the front and reversing to get the correct
	    // order. Note that there are 7 formats as 2 have times which adds a front and a back format.
	    CoreDateFormats = English.compiledFormats.slice(0,7).reverse();
	    English.compiledFormats = English.compiledFormats.slice(7).concat(CoreDateFormats);
	  }

	  function buildFormatTokens() {

	    createPaddedToken('f', function(d) {
	      return callDateGet(d, 'Milliseconds');
	    }, true);

	    createPaddedToken('s', function(d) {
	      return callDateGet(d, 'Seconds');
	    });

	    createPaddedToken('m', function(d) {
	      return callDateGet(d, 'Minutes');
	    });

	    createPaddedToken('h', function(d) {
	      return callDateGet(d, 'Hours') % 12 || 12;
	    });

	    createPaddedToken('H', function(d) {
	      return callDateGet(d, 'Hours');
	    });

	    createPaddedToken('d', function(d) {
	      return callDateGet(d, 'Date');
	    });

	    createPaddedToken('M', function(d) {
	      return callDateGet(d, 'Month') + 1;
	    });

	    createMeridianTokens();
	    createWeekdayTokens();
	    createMonthTokens();

	    // Aliases
	    DateFormatTokens['ms']           = DateFormatTokens['f'];
	    DateFormatTokens['milliseconds'] = DateFormatTokens['f'];
	    DateFormatTokens['seconds']      = DateFormatTokens['s'];
	    DateFormatTokens['minutes']      = DateFormatTokens['m'];
	    DateFormatTokens['hours']        = DateFormatTokens['h'];
	    DateFormatTokens['24hr']         = DateFormatTokens['H'];
	    DateFormatTokens['12hr']         = DateFormatTokens['h'];
	    DateFormatTokens['date']         = DateFormatTokens['d'];
	    DateFormatTokens['day']          = DateFormatTokens['d'];
	    DateFormatTokens['year']         = DateFormatTokens['yyyy'];

	  }

	  function buildFormatShortcuts() {
	    extendSimilar(date, 'short,long,full', function(methods, name) {
	      methods[name] = function(localeCode) {
	        return formatDate(this, name, false, localeCode);
	      }
	    });
	  }

	  function buildAsianDigits() {
	    KanjiDigits.split('').forEach(function(digit, value) {
	      var holder;
	      if(value > 9) {
	        value = pow(10, value - 9);
	      }
	      AsianDigitMap[digit] = value;
	    });
	    simpleMerge(AsianDigitMap, NumberNormalizeMap);
	    // Kanji numerals may also be included in phrases which are text-based rather
	    // than actual numbers such as Chinese weekdays (上周三), and "the day before
	    // yesterday" (一昨日) in Japanese, so don't match these.
	    AsianDigitReg = regexp('([期週周])?([' + KanjiDigits + FullWidthDigits + ']+)(?!昨)', 'g');
	  }

	   /***
	   * @method is[Day]()
	   * @returns Boolean
	   * @short Returns true if the date falls on that day.
	   * @extra Also available: %isYesterday%, %isToday%, %isTomorrow%, %isWeekday%, and %isWeekend%.
	   *
	   * @set
	   *   isToday
	   *   isYesterday
	   *   isTomorrow
	   *   isWeekday
	   *   isWeekend
	   *   isSunday
	   *   isMonday
	   *   isTuesday
	   *   isWednesday
	   *   isThursday
	   *   isFriday
	   *   isSaturday
	   *
	   * @example
	   *
	   *   Date.create('tomorrow').isToday() -> false
	   *   Date.create('thursday').isTomorrow() -> ?
	   *   Date.create('yesterday').isWednesday() -> ?
	   *   Date.create('today').isWeekend() -> ?
	   *
	   ***
	   * @method isFuture()
	   * @returns Boolean
	   * @short Returns true if the date is in the future.
	   * @example
	   *
	   *   Date.create('next week').isFuture() -> true
	   *   Date.create('last week').isFuture() -> false
	   *
	   ***
	   * @method isPast()
	   * @returns Boolean
	   * @short Returns true if the date is in the past.
	   * @example
	   *
	   *   Date.create('last week').isPast() -> true
	   *   Date.create('next week').isPast() -> false
	   *
	   ***/
	  function buildRelativeAliases() {
	    var special  = 'today,yesterday,tomorrow,weekday,weekend,future,past'.split(',');
	    var weekdays = English['weekdays'].slice(0,7);
	    var months   = English['months'].slice(0,12);
	    extendSimilar(date, special.concat(weekdays).concat(months), function(methods, name) {
	      methods['is'+ simpleCapitalize(name)] = function(utc) {
	        return fullCompareDate(this, name, 0, utc);
	      };
	    });
	  }

	  function buildUTCAliases() {
	    extend(date, {
	      'utc': {
	        'create': function() {
	          return createDateFromArgs(null, arguments, 0, true);
	        },

	        'past': function() {
	          return createDateFromArgs(null, arguments, -1, true);
	        },

	        'future': function() {
	          return createDateFromArgs(null, arguments, 1, true);
	        }
	      }
	    }, false);
	  }

	  function setDateProperties() {
	    extend(date, {
	      'RFC1123': '{Dow}, {dd} {Mon} {yyyy} {HH}:{mm}:{ss} {tz}',
	      'RFC1036': '{Weekday}, {dd}-{Mon}-{yy} {HH}:{mm}:{ss} {tz}',
	      'ISO8601_DATE': '{yyyy}-{MM}-{dd}',
	      'ISO8601_DATETIME': '{yyyy}-{MM}-{dd}T{HH}:{mm}:{ss}.{fff}{isotz}'
	    }, false);
	  }


	  extend(date, {

	     /***
	     * @method Date.create(<d>, [locale] = currentLocale)
	     * @returns Date
	     * @short Alternate Date constructor which understands many different text formats, a timestamp, or another date.
	     * @extra If no argument is given, date is assumed to be now. %Date.create% additionally can accept enumerated parameters as with the standard date constructor. [locale] can be passed to specify the locale that the date is in. When unspecified, the current locale (default is English) is assumed. UTC-based dates can be created through the %utc% object. For more see @date_format.
	     * @set
	     *   Date.utc.create
	     *
	     * @example
	     *
	     *   Date.create('July')          -> July of this year
	     *   Date.create('1776')          -> 1776
	     *   Date.create('today')         -> today
	     *   Date.create('wednesday')     -> This wednesday
	     *   Date.create('next friday')   -> Next friday
	     *   Date.create('July 4, 1776')  -> July 4, 1776
	     *   Date.create(-446806800000)   -> November 5, 1955
	     *   Date.create(1776, 6, 4)      -> July 4, 1776
	     *   Date.create('1776年07月04日', 'ja') -> July 4, 1776
	     *   Date.utc.create('July 4, 1776', 'en')  -> July 4, 1776
	     *
	     ***/
	    'create': function() {
	      return createDateFromArgs(null, arguments);
	    },

	     /***
	     * @method Date.past(<d>, [locale] = currentLocale)
	     * @returns Date
	     * @short Alternate form of %Date.create% with any ambiguity assumed to be the past.
	     * @extra For example %"Sunday"% can be either "the Sunday coming up" or "the Sunday last" depending on context. Note that dates explicitly in the future ("next Sunday") will remain in the future. This method simply provides a hint when ambiguity exists. UTC-based dates can be created through the %utc% object. For more, see @date_format.
	     * @set
	     *   Date.utc.past
	     *
	     * @example
	     *
	     *   Date.past('July')          -> July of this year or last depending on the current month
	     *   Date.past('Wednesday')     -> This wednesday or last depending on the current weekday
	     *
	     ***/
	    'past': function() {
	      return createDateFromArgs(null, arguments, -1);
	    },

	     /***
	     * @method Date.future(<d>, [locale] = currentLocale)
	     * @returns Date
	     * @short Alternate form of %Date.create% with any ambiguity assumed to be the future.
	     * @extra For example %"Sunday"% can be either "the Sunday coming up" or "the Sunday last" depending on context. Note that dates explicitly in the past ("last Sunday") will remain in the past. This method simply provides a hint when ambiguity exists. UTC-based dates can be created through the %utc% object. For more, see @date_format.
	     * @set
	     *   Date.utc.future
	     *
	     * @example
	     *
	     *   Date.future('July')          -> July of this year or next depending on the current month
	     *   Date.future('Wednesday')     -> This wednesday or next depending on the current weekday
	     *
	     ***/
	    'future': function() {
	      return createDateFromArgs(null, arguments, 1);
	    },

	     /***
	     * @method Date.addLocale(<code>, <set>)
	     * @returns Locale
	     * @short Adds a locale <set> to the locales understood by Sugar.
	     * @extra For more see @date_format.
	     *
	     ***/
	    'addLocale': function(localeCode, set) {
	      return setLocalization(localeCode, set);
	    },

	     /***
	     * @method Date.setLocale(<code>)
	     * @returns Locale
	     * @short Sets the current locale to be used with dates.
	     * @extra Sugar has support for 13 locales that are available through the "Date Locales" package. In addition you can define a new locale with %Date.addLocale%. For more see @date_format.
	     *
	     ***/
	    'setLocale': function(localeCode, set) {
	      var loc = getLocalization(localeCode, false);
	      CurrentLocalization = loc;
	      // The code is allowed to be more specific than the codes which are required:
	      // i.e. zh-CN or en-US. Currently this only affects US date variants such as 8/10/2000.
	      if(localeCode && localeCode !== loc['code']) {
	        loc['code'] = localeCode;
	      }
	      return loc;
	    },

	     /***
	     * @method Date.getLocale([code] = current)
	     * @returns Locale
	     * @short Gets the locale for the given code, or the current locale.
	     * @extra The resulting locale object can be manipulated to provide more control over date localizations. For more about locales, see @date_format.
	     *
	     ***/
	    'getLocale': function(localeCode) {
	      return !localeCode ? CurrentLocalization : getLocalization(localeCode, false);
	    },

	     /**
	     * @method Date.addFormat(<format>, <match>, [code] = null)
	     * @returns Nothing
	     * @short Manually adds a new date input format.
	     * @extra This method allows fine grained control for alternate formats. <format> is a string that can have regex tokens inside. <match> is an array of the tokens that each regex capturing group will map to, for example %year%, %date%, etc. For more, see @date_format.
	     *
	     **/
	    'addFormat': function(format, match, localeCode) {
	      addDateInputFormat(getLocalization(localeCode), format, match);
	    }

	  }, false);

	  extend(date, {

	     /***
	     * @method set(<set>, [reset] = false)
	     * @returns Date
	     * @short Sets the date object.
	     * @extra This method can accept multiple formats including a single number as a timestamp, an object, or enumerated parameters (as with the Date constructor). If [reset] is %true%, any units more specific than those passed will be reset.
	     *
	     * @example
	     *
	     *   new Date().set({ year: 2011, month: 11, day: 31 }) -> December 31, 2011
	     *   new Date().set(2011, 11, 31)                       -> December 31, 2011
	     *   new Date().set(86400000)                           -> 1 day after Jan 1, 1970
	     *   new Date().set({ year: 2004, month: 6 }, true)     -> June 1, 2004, 00:00:00.000
	     *
	     ***/
	    'set': function() {
	      return setDate(this, arguments);
	    },

	     /***
	     * @method setWeekday()
	     * @returns Nothing
	     * @short Sets the weekday of the date.
	     * @extra In order to maintain a parallel with %getWeekday% (which itself is an alias for Javascript native %getDay%), Sunday is considered day %0%. This contrasts with ISO-8601 standard (used in %getISOWeek% and %setISOWeek%) which places Sunday at the end of the week (day 7). This effectively means that passing %0% to this method while in the middle of a week will rewind the date, where passing %7% will advance it.
	     *
	     * @example
	     *
	     *   d = new Date(); d.setWeekday(1); d; -> Monday of this week
	     *   d = new Date(); d.setWeekday(6); d; -> Saturday of this week
	     *
	     ***/
	    'setWeekday': function(dow) {
	      return setWeekday(this, dow);
	    },

	     /***
	     * @method setISOWeek(<num>)
	     * @returns Nothing
	     * @short Sets the week (of the year) as defined by the ISO-8601 standard.
	     * @extra Note that this standard places Sunday at the end of the week (day 7).
	     *
	     * @example
	     *
	     *   d = new Date(); d.setISOWeek(15); d; -> 15th week of the year
	     *
	     ***/
	    'setISOWeek': function(num) {
	      return setWeekNumber(this, num);
	    },

	     /***
	     * @method getISOWeek()
	     * @returns Number
	     * @short Gets the date's week (of the year) as defined by the ISO-8601 standard.
	     * @extra Note that this standard places Sunday at the end of the week (day 7). If %utc% is set on the date, the week will be according to UTC time.
	     *
	     * @example
	     *
	     *   new Date().getISOWeek()    -> today's week of the year
	     *
	     ***/
	    'getISOWeek': function() {
	      return getWeekNumber(this);
	    },

	     /***
	     * @method beginningOfISOWeek()
	     * @returns Date
	     * @short Set the date to the beginning of week as defined by this ISO-8601 standard.
	     * @extra Note that this standard places Monday at the start of the week.
	     * @example
	     *
	     *   Date.create().beginningOfISOWeek() -> Monday
	     *
	     ***/
	    'beginningOfISOWeek': function() {
	      var day = this.getDay();
	      if(day === 0) {
	        day = -6;
	      } else if(day !== 1) {
	        day = 1;
	      }
	      setWeekday(this, day);
	      return resetDate(this);
	    },

	     /***
	     * @method endOfISOWeek()
	     * @returns Date
	     * @short Set the date to the end of week as defined by this ISO-8601 standard.
	     * @extra Note that this standard places Sunday at the end of the week.
	     * @example
	     *
	     *   Date.create().endOfISOWeek() -> Sunday
	     *
	     ***/
	    'endOfISOWeek': function() {
	      if(this.getDay() !== 0) {
	        setWeekday(this, 7);
	      }
	      return moveToEndOfUnit(this, 'day');
	    },

	     /***
	     * @method getUTCOffset([iso])
	     * @returns String
	     * @short Returns a string representation of the offset from UTC time. If [iso] is true the offset will be in ISO8601 format.
	     * @example
	     *
	     *   new Date().getUTCOffset()     -> "+0900"
	     *   new Date().getUTCOffset(true) -> "+09:00"
	     *
	     ***/
	    'getUTCOffset': function(iso) {
	      return getUTCOffset(this, iso);
	    },

	     /***
	     * @method setUTC([on] = false)
	     * @returns Date
	     * @short Sets the internal utc flag for the date. When on, UTC-based methods will be called internally.
	     * @extra For more see @date_format.
	     * @example
	     *
	     *   new Date().setUTC(true)
	     *   new Date().setUTC(false)
	     *
	     ***/
	    'setUTC': function(set) {
	      return setUTC(this, set);
	    },

	     /***
	     * @method isUTC()
	     * @returns Boolean
	     * @short Returns true if the date has no timezone offset.
	     * @extra This will also return true for utc-based dates (dates that have the %utc% method set true). Note that even if the utc flag is set, %getTimezoneOffset% will always report the same thing as Javascript always reports that based on the environment's locale.
	     * @example
	     *
	     *   new Date().isUTC()           -> true or false?
	     *   new Date().utc(true).isUTC() -> true
	     *
	     ***/
	    'isUTC': function() {
	      return isUTC(this);
	    },

	     /***
	     * @method advance(<set>, [reset] = false)
	     * @returns Date
	     * @short Sets the date forward.
	     * @extra This method can accept multiple formats including an object, a string in the format %3 days%, a single number as milliseconds, or enumerated parameters (as with the Date constructor). If [reset] is %true%, any units more specific than those passed will be reset. For more see @date_format.
	     * @example
	     *
	     *   new Date().advance({ year: 2 }) -> 2 years in the future
	     *   new Date().advance('2 days')    -> 2 days in the future
	     *   new Date().advance(0, 2, 3)     -> 2 months 3 days in the future
	     *   new Date().advance(86400000)    -> 1 day in the future
	     *
	     ***/
	    'advance': function() {
	      return advanceDate(this, arguments);
	    },

	     /***
	     * @method rewind(<set>, [reset] = false)
	     * @returns Date
	     * @short Sets the date back.
	     * @extra This method can accept multiple formats including a single number as a timestamp, an object, or enumerated parameters (as with the Date constructor). If [reset] is %true%, any units more specific than those passed will be reset. For more see @date_format.
	     * @example
	     *
	     *   new Date().rewind({ year: 2 }) -> 2 years in the past
	     *   new Date().rewind(0, 2, 3)     -> 2 months 3 days in the past
	     *   new Date().rewind(86400000)    -> 1 day in the past
	     *
	     ***/
	    'rewind': function() {
	      var args = collectDateArguments(arguments, true);
	      return updateDate(this, args[0], args[1], -1);
	    },

	     /***
	     * @method isValid()
	     * @returns Boolean
	     * @short Returns true if the date is valid.
	     * @example
	     *
	     *   new Date().isValid()         -> true
	     *   new Date('flexor').isValid() -> false
	     *
	     ***/
	    'isValid': function() {
	      return isValid(this);
	    },

	     /***
	     * @method isAfter(<d>, [margin] = 0)
	     * @returns Boolean
	     * @short Returns true if the date is after the <d>.
	     * @extra [margin] is to allow extra margin of error (in ms). <d> will accept a date object, timestamp, or text format. If not specified, <d> is assumed to be now. See @date_format for more.
	     * @example
	     *
	     *   new Date().isAfter('tomorrow')  -> false
	     *   new Date().isAfter('yesterday') -> true
	     *
	     ***/
	    'isAfter': function(d, margin, utc) {
	      return this.getTime() > createDate(null, d).getTime() - (margin || 0);
	    },

	     /***
	     * @method isBefore(<d>, [margin] = 0)
	     * @returns Boolean
	     * @short Returns true if the date is before <d>.
	     * @extra [margin] is to allow extra margin of error (in ms). <d> will accept a date object, timestamp, or text format. If not specified, <d> is assumed to be now. See @date_format for more.
	     * @example
	     *
	     *   new Date().isBefore('tomorrow')  -> true
	     *   new Date().isBefore('yesterday') -> false
	     *
	     ***/
	    'isBefore': function(d, margin) {
	      return this.getTime() < createDate(null, d).getTime() + (margin || 0);
	    },

	     /***
	     * @method isBetween(<d1>, <d2>, [margin] = 0)
	     * @returns Boolean
	     * @short Returns true if the date falls between <d1> and <d2>.
	     * @extra [margin] is to allow extra margin of error (in ms). <d1> and <d2> will accept a date object, timestamp, or text format. If not specified, they are assumed to be now. See @date_format for more.
	     * @example
	     *
	     *   new Date().isBetween('yesterday', 'tomorrow')    -> true
	     *   new Date().isBetween('last year', '2 years ago') -> false
	     *
	     ***/
	    'isBetween': function(d1, d2, margin) {
	      var t  = this.getTime();
	      var t1 = createDate(null, d1).getTime();
	      var t2 = createDate(null, d2).getTime();
	      var lo = min(t1, t2);
	      var hi = max(t1, t2);
	      margin = margin || 0;
	      return (lo - margin < t) && (hi + margin > t);
	    },

	     /***
	     * @method isLeapYear()
	     * @returns Boolean
	     * @short Returns true if the date is a leap year.
	     * @example
	     *
	     *   Date.create('2000').isLeapYear() -> true
	     *
	     ***/
	    'isLeapYear': function() {
	      return isLeapYear(this);
	    },

	     /***
	     * @method daysInMonth()
	     * @returns Number
	     * @short Returns the number of days in the date's month.
	     * @example
	     *
	     *   Date.create('May').daysInMonth()            -> 31
	     *   Date.create('February, 2000').daysInMonth() -> 29
	     *
	     ***/
	    'daysInMonth': function() {
	      return getDaysInMonth(this);
	    },

	     /***
	     * @method format(<format>, [locale] = currentLocale)
	     * @returns String
	     * @short Formats and outputs the date.
	     * @extra <format> can be a number of pre-determined formats or a string of tokens. Locale-specific formats are %short%, %long%, and %full% which have their own aliases and can be called with %date.short()%, etc. If <format> is not specified the %long% format is assumed. [locale] specifies a locale code to use (if not specified the current locale is used). See @date_format for more details.
	     *
	     * @set
	     *   short
	     *   long
	     *   full
	     *
	     * @example
	     *
	     *   Date.create().format()                                   -> ex. July 4, 2003
	     *   Date.create().format('{Weekday} {d} {Month}, {yyyy}')    -> ex. Monday July 4, 2003
	     *   Date.create().format('{hh}:{mm}')                        -> ex. 15:57
	     *   Date.create().format('{12hr}:{mm}{tt}')                  -> ex. 3:57pm
	     *   Date.create().format(Date.ISO8601_DATETIME)              -> ex. 2011-07-05 12:24:55.528Z
	     *   Date.create('last week').format('short', 'ja')                -> ex. 先週
	     *   Date.create('yesterday').format(function(value,unit,ms,loc) {
	     *     // value = 1, unit = 3, ms = -86400000, loc = [current locale object]
	     *   });                                                      -> ex. 1 day ago
	     *
	     ***/
	    'format': function(f, localeCode) {
	      return formatDate(this, f, false, localeCode);
	    },

	     /***
	     * @method relative([fn], [locale] = currentLocale)
	     * @returns String
	     * @short Returns a relative date string offset to the current time.
	     * @extra [fn] can be passed to provide for more granular control over the resulting string. [fn] is passed 4 arguments: the adjusted value, unit, offset in milliseconds, and a localization object. As an alternate syntax, [locale] can also be passed as the first (and only) parameter. For more, see @date_format.
	     * @example
	     *
	     *   Date.create('90 seconds ago').relative() -> 1 minute ago
	     *   Date.create('January').relative()        -> ex. 5 months ago
	     *   Date.create('January').relative('ja')    -> 3ヶ月前
	     *   Date.create('120 minutes ago').relative(function(val,unit,ms,loc) {
	     *     // value = 2, unit = 3, ms = -7200, loc = [current locale object]
	     *   });                                      -> ex. 5 months ago
	     *
	     ***/
	    'relative': function(fn, localeCode) {
	      if(isString(fn)) {
	        localeCode = fn;
	        fn = null;
	      }
	      return formatDate(this, fn, true, localeCode);
	    },

	     /***
	     * @method is(<f>, [margin] = 0, [utc] = false)
	     * @returns Boolean
	     * @short Returns true if the date is <f>.
	     * @extra <f> will accept a date object, timestamp, or text format. %is% additionally understands more generalized expressions like month/weekday names, 'today', etc, and compares to the precision implied in <f>. [margin] allows an extra margin of error in milliseconds. [utc] will treat the compared date as UTC. For more, see @date_format.
	     * @example
	     *
	     *   Date.create().is('July')               -> true or false?
	     *   Date.create().is('1776')               -> false
	     *   Date.create().is('today')              -> true
	     *   Date.create().is('weekday')            -> true or false?
	     *   Date.create().is('July 4, 1776')       -> false
	     *   Date.create().is(-6106093200000)       -> false
	     *   Date.create().is(new Date(1776, 6, 4)) -> false
	     *
	     ***/
	    'is': function(f, margin, utc) {
	      return fullCompareDate(this, f, margin, utc);
	    },

	     /***
	     * @method reset([unit] = 'hours')
	     * @returns Date
	     * @short Resets the unit passed and all smaller units. Default is "hours", effectively resetting the time.
	     * @example
	     *
	     *   Date.create().reset('day')   -> Beginning of today
	     *   Date.create().reset('month') -> 1st of the month
	     *
	     ***/
	    'reset': function(unit) {
	      return resetDate(this, unit);
	    },

	     /***
	     * @method clone()
	     * @returns Date
	     * @short Clones the date.
	     * @example
	     *
	     *   Date.create().clone() -> Copy of now
	     *
	     ***/
	    'clone': function() {
	      return cloneDate(this);
	    },

	     /***
	     * @method iso()
	     * @alias toISOString
	     *
	     ***/
	    'iso': function() {
	      return this.toISOString();
	    },

	     /***
	     * @method getWeekday()
	     * @returns Number
	     * @short Alias for %getDay%.
	     * @set
	     *   getUTCWeekday
	     *
	     * @example
	     *
	     +   Date.create().getWeekday();    -> (ex.) 3
	     +   Date.create().getUTCWeekday();    -> (ex.) 3
	     *
	     ***/
	    'getWeekday': function() {
	      return this.getDay();
	    },

	    'getUTCWeekday': function() {
	      return this.getUTCDay();
	    }

	  });


	  /***
	   * Number module
	   *
	   ***/

	  /***
	   * @method [unit]()
	   * @returns Number
	   * @short Takes the number as a corresponding unit of time and converts to milliseconds.
	   * @extra Method names can be singular or plural.  Note that as "a month" is ambiguous as a unit of time, %months% will be equivalent to 30.4375 days, the average number in a month. Be careful using %months% if you need exact precision.
	   *
	   * @set
	   *   millisecond
	   *   milliseconds
	   *   second
	   *   seconds
	   *   minute
	   *   minutes
	   *   hour
	   *   hours
	   *   day
	   *   days
	   *   week
	   *   weeks
	   *   month
	   *   months
	   *   year
	   *   years
	   *
	   * @example
	   *
	   *   (5).milliseconds() -> 5
	   *   (10).hours()       -> 36000000
	   *   (1).day()          -> 86400000
	   *
	   ***
	   * @method [unit]Before([d], [locale] = currentLocale)
	   * @returns Date
	   * @short Returns a date that is <n> units before [d], where <n> is the number.
	   * @extra [d] will accept a date object, timestamp, or text format. Note that "months" is ambiguous as a unit of time. If the target date falls on a day that does not exist (ie. August 31 -> February 31), the date will be shifted to the last day of the month. Be careful using %monthsBefore% if you need exact precision. See @date_format for more.
	   *
	   * @set
	   *   millisecondBefore
	   *   millisecondsBefore
	   *   secondBefore
	   *   secondsBefore
	   *   minuteBefore
	   *   minutesBefore
	   *   hourBefore
	   *   hoursBefore
	   *   dayBefore
	   *   daysBefore
	   *   weekBefore
	   *   weeksBefore
	   *   monthBefore
	   *   monthsBefore
	   *   yearBefore
	   *   yearsBefore
	   *
	   * @example
	   *
	   *   (5).daysBefore('tuesday')          -> 5 days before tuesday of this week
	   *   (1).yearBefore('January 23, 1997') -> January 23, 1996
	   *
	   ***
	   * @method [unit]Ago()
	   * @returns Date
	   * @short Returns a date that is <n> units ago.
	   * @extra Note that "months" is ambiguous as a unit of time. If the target date falls on a day that does not exist (ie. August 31 -> February 31), the date will be shifted to the last day of the month. Be careful using %monthsAgo% if you need exact precision.
	   *
	   * @set
	   *   millisecondAgo
	   *   millisecondsAgo
	   *   secondAgo
	   *   secondsAgo
	   *   minuteAgo
	   *   minutesAgo
	   *   hourAgo
	   *   hoursAgo
	   *   dayAgo
	   *   daysAgo
	   *   weekAgo
	   *   weeksAgo
	   *   monthAgo
	   *   monthsAgo
	   *   yearAgo
	   *   yearsAgo
	   *
	   * @example
	   *
	   *   (5).weeksAgo() -> 5 weeks ago
	   *   (1).yearAgo()  -> January 23, 1996
	   *
	   ***
	   * @method [unit]After([d], [locale] = currentLocale)
	   * @returns Date
	   * @short Returns a date <n> units after [d], where <n> is the number.
	   * @extra [d] will accept a date object, timestamp, or text format. Note that "months" is ambiguous as a unit of time. If the target date falls on a day that does not exist (ie. August 31 -> February 31), the date will be shifted to the last day of the month. Be careful using %monthsAfter% if you need exact precision. See @date_format for more.
	   *
	   * @set
	   *   millisecondAfter
	   *   millisecondsAfter
	   *   secondAfter
	   *   secondsAfter
	   *   minuteAfter
	   *   minutesAfter
	   *   hourAfter
	   *   hoursAfter
	   *   dayAfter
	   *   daysAfter
	   *   weekAfter
	   *   weeksAfter
	   *   monthAfter
	   *   monthsAfter
	   *   yearAfter
	   *   yearsAfter
	   *
	   * @example
	   *
	   *   (5).daysAfter('tuesday')          -> 5 days after tuesday of this week
	   *   (1).yearAfter('January 23, 1997') -> January 23, 1998
	   *
	   ***
	   * @method [unit]FromNow()
	   * @returns Date
	   * @short Returns a date <n> units from now.
	   * @extra Note that "months" is ambiguous as a unit of time. If the target date falls on a day that does not exist (ie. August 31 -> February 31), the date will be shifted to the last day of the month. Be careful using %monthsFromNow% if you need exact precision.
	   *
	   * @set
	   *   millisecondFromNow
	   *   millisecondsFromNow
	   *   secondFromNow
	   *   secondsFromNow
	   *   minuteFromNow
	   *   minutesFromNow
	   *   hourFromNow
	   *   hoursFromNow
	   *   dayFromNow
	   *   daysFromNow
	   *   weekFromNow
	   *   weeksFromNow
	   *   monthFromNow
	   *   monthsFromNow
	   *   yearFromNow
	   *   yearsFromNow
	   *
	   * @example
	   *
	   *   (5).weeksFromNow() -> 5 weeks ago
	   *   (1).yearFromNow()  -> January 23, 1998
	   *
	   ***/
	  function buildNumberToDateAlias(u, multiplier) {
	    var name = u.name, methods = {};
	    function base() {
	      return round(this * multiplier);
	    }
	    function after() {
	      return sugarDate[u.addMethod](createDateFromArgs(null, arguments), this);
	    }
	    function before() {
	      return sugarDate[u.addMethod](createDateFromArgs(null, arguments), -this);
	    }
	    methods[name] = base;
	    methods[name + 's'] = base;
	    methods[name + 'Before'] = before;
	    methods[name + 'sBefore'] = before;
	    methods[name + 'Ago'] = before;
	    methods[name + 'sAgo'] = before;
	    methods[name + 'After'] = after;
	    methods[name + 'sAfter'] = after;
	    methods[name + 'FromNow'] = after;
	    methods[name + 'sFromNow'] = after;
	    extend(number, methods);
	  }

	  extend(number, {

	     /***
	     * @method duration([locale] = currentLocale)
	     * @returns String
	     * @short Takes the number as milliseconds and returns a unit-adjusted localized string.
	     * @extra This method is the same as %Date#relative% without the localized equivalent of "from now" or "ago". [locale] can be passed as the first (and only) parameter. Note that this method is only available when the dates package is included.
	     * @example
	     *
	     *   (500).duration() -> '500 milliseconds'
	     *   (1200).duration() -> '1 second'
	     *   (75).minutes().duration() -> '1 hour'
	     *   (75).minutes().duration('es') -> '1 hora'
	     *
	     ***/
	    'duration': function(localeCode) {
	      return getLocalization(localeCode).getDuration(this);
	    }

	  });


	  English = CurrentLocalization = sugarDate.addLocale('en', {
	    'plural':     true,
	    'timeMarker': 'at',
	    'ampm':       'am,pm',
	    'months':     'January,February,March,April,May,June,July,August,September,October,November,December',
	    'weekdays':   'Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday',
	    'units':      'millisecond:|s,second:|s,minute:|s,hour:|s,day:|s,week:|s,month:|s,year:|s',
	    'numbers':    'one,two,three,four,five,six,seven,eight,nine,ten',
	    'articles':   'a,an,the',
	    'tokens':     'the,st|nd|rd|th,of',
	    'short':      '{Month} {d}, {yyyy}',
	    'long':       '{Month} {d}, {yyyy} {h}:{mm}{tt}',
	    'full':       '{Weekday} {Month} {d}, {yyyy} {h}:{mm}:{ss}{tt}',
	    'past':       '{num} {unit} {sign}',
	    'future':     '{num} {unit} {sign}',
	    'duration':   '{num} {unit}',
	    'modifiers': [
	      { 'name': 'sign',  'src': 'ago|before', 'value': -1 },
	      { 'name': 'sign',  'src': 'from now|after|from|in|later', 'value': 1 },
	      { 'name': 'edge',  'src': 'last day', 'value': -2 },
	      { 'name': 'edge',  'src': 'end', 'value': -1 },
	      { 'name': 'edge',  'src': 'first day|beginning', 'value': 1 },
	      { 'name': 'shift', 'src': 'last', 'value': -1 },
	      { 'name': 'shift', 'src': 'the|this', 'value': 0 },
	      { 'name': 'shift', 'src': 'next', 'value': 1 }
	    ],
	    'dateParse': [
	      '{month} {year}',
	      '{shift} {unit=5-7}',
	      '{0?} {date}{1}',
	      '{0?} {edge} of {shift?} {unit=4-7?} {month?} {year?}'
	    ],
	    'timeParse': [
	      '{num} {unit} {sign}',
	      '{sign} {num} {unit}',
	      '{0} {num}{1} {day} of {month} {year?}',
	      '{weekday?} {month} {date}{1?} {year?}',
	      '{date} {month} {year}',
	      '{date} {month}',
	      '{shift} {weekday}',
	      '{shift} week {weekday}',
	      '{weekday} {2?} {shift} week',
	      '{num} {unit=4-5} {sign} {day}',
	      '{0?} {date}{1} of {month}',
	      '{0?}{month?} {date?}{1?} of {shift} {unit=6-7}',
	      '{edge} of {day}'
	    ]
	  });

	  buildDateUnits();
	  buildDateMethods();
	  buildCoreInputFormats();
	  buildFormatTokens();
	  buildFormatShortcuts();
	  buildAsianDigits();
	  buildRelativeAliases();
	  buildUTCAliases();
	  setDateProperties();


	})();

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(189)))

/***/ },

/***/ 203:
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(console) {/*** IMPORTS FROM imports-loader ***/
	var jQuery = __webpack_require__(204);

	/*!
	 * jquery oembed plugin
	 *
	 * Copyright (c) 2009 Richard Chamorro
	 * Licensed under the MIT license
	 *
	 * Orignal Author: Richard Chamorro
	 * Forked by Andrew Mee to Provide a slightly diffent kind of embedding experience
	 */
	(function ($) {
	    $.fn.oembed = function (url, options, embedAction) {

	        settings = $.extend(true, $.fn.oembed.defaults, options);
	        var shortURLList = ["0rz.tw", "1link.in", "1url.com", "2.gp", "2big.at", "2tu.us", "3.ly", "307.to", "4ms.me", "4sq.com", "4url.cc", "6url.com", "7.ly", "a.gg", "a.nf", "aa.cx", "abcurl.net",
	            "ad.vu", "adf.ly", "adjix.com", "afx.cc", "all.fuseurl.com", "alturl.com", "amzn.to", "ar.gy", "arst.ch", "atu.ca", "azc.cc", "b23.ru", "b2l.me", "bacn.me", "bcool.bz", "binged.it",
	            "bit.ly", "bizj.us", "bloat.me", "bravo.ly", "bsa.ly", "budurl.com", "canurl.com", "chilp.it", "chzb.gr", "cl.lk", "cl.ly", "clck.ru", "cli.gs", "cliccami.info",
	            "clickthru.ca", "clop.in", "conta.cc", "cort.as", "cot.ag", "crks.me", "ctvr.us", "cutt.us", "dai.ly", "decenturl.com", "dfl8.me", "digbig.com",
	            "http:\/\/digg\.com\/[^\/]+$", "disq.us", "dld.bz", "dlvr.it", "do.my", "doiop.com", "dopen.us", "easyuri.com", "easyurl.net", "eepurl.com", "eweri.com",
	            "fa.by", "fav.me", "fb.me", "fbshare.me", "ff.im", "fff.to", "fire.to", "firsturl.de", "firsturl.net", "flic.kr", "flq.us", "fly2.ws", "fon.gs", "freak.to",
	            "fuseurl.com", "fuzzy.to", "fwd4.me", "fwib.net", "g.ro.lt", "gizmo.do", "gl.am", "go.9nl.com", "go.ign.com", "go.usa.gov", "goo.gl", "goshrink.com", "gurl.es",
	            "hex.io", "hiderefer.com", "hmm.ph", "href.in", "hsblinks.com", "htxt.it", "huff.to", "hulu.com", "hurl.me", "hurl.ws", "icanhaz.com", "idek.net", "ilix.in", "is.gd",
	            "its.my", "ix.lt", "j.mp", "jijr.com", "kl.am", "klck.me", "korta.nu", "krunchd.com", "l9k.net", "lat.ms", "liip.to", "liltext.com", "linkbee.com", "linkbun.ch",
	            "liurl.cn", "ln-s.net", "ln-s.ru", "lnk.gd", "lnk.ms", "lnkd.in", "lnkurl.com", "lru.jp", "lt.tl", "lurl.no", "macte.ch", "mash.to", "merky.de", "migre.me", "miniurl.com",
	            "minurl.fr", "mke.me", "moby.to", "moourl.com", "mrte.ch", "myloc.me", "myurl.in", "n.pr", "nbc.co", "nblo.gs", "nn.nf", "not.my", "notlong.com", "nsfw.in",
	            "nutshellurl.com", "nxy.in", "nyti.ms", "o-x.fr", "oc1.us", "om.ly", "omf.gd", "omoikane.net", "on.cnn.com", "on.mktw.net", "onforb.es", "orz.se", "ow.ly", "ping.fm",
	            "pli.gs", "pnt.me", "politi.co", "post.ly", "pp.gg", "profile.to", "ptiturl.com", "pub.vitrue.com", "qlnk.net", "qte.me", "qu.tc", "qy.fi", "r.ebay.com", "r.im", "rb6.me", "read.bi",
	            "readthis.ca", "reallytinyurl.com", "redir.ec", "redirects.ca", "redirx.com", "retwt.me", "ri.ms", "rickroll.it", "riz.gd", "rt.nu", "ru.ly", "rubyurl.com", "rurl.org",
	            "rww.tw", "s4c.in", "s7y.us", "safe.mn", "sameurl.com", "sdut.us", "shar.es", "shink.de", "shorl.com", "short.ie", "short.to", "shortlinks.co.uk", "shorturl.com",
	            "shout.to", "show.my", "shrinkify.com", "shrinkr.com", "shrt.fr", "shrt.st", "shrten.com", "shrunkin.com", "simurl.com", "slate.me", "smallr.com", "smsh.me", "smurl.name",
	            "sn.im", "snipr.com", "snipurl.com", "snurl.com", "sp2.ro", "spedr.com", "srnk.net", "srs.li", "starturl.com", "stks.co", "su.pr", "surl.co.uk", "surl.hu", "t.cn", "t.co", "t.lh.com",
	            "ta.gd", "tbd.ly", "tcrn.ch", "tgr.me", "tgr.ph", "tighturl.com", "tiniuri.com", "tiny.cc", "tiny.ly", "tiny.pl", "tinylink.in", "tinyuri.ca", "tinyurl.com", "tk.", "tl.gd",
	            "tmi.me", "tnij.org", "tnw.to", "tny.com", "to.ly", "togoto.us", "totc.us", "toysr.us", "tpm.ly", "tr.im", "tra.kz", "trunc.it", "twhub.com", "twirl.at",
	            "twitclicks.com", "twitterurl.net", "twitterurl.org", "twiturl.de", "twurl.cc", "twurl.nl", "u.mavrev.com", "u.nu", "u76.org", "ub0.cc", "ulu.lu", "updating.me", "ur1.ca",
	            "url.az", "url.co.uk", "url.ie", "url360.me", "url4.eu", "urlborg.com", "urlbrief.com", "urlcover.com", "urlcut.com", "urlenco.de", "urli.nl", "urls.im",
	            "urlshorteningservicefortwitter.com", "urlx.ie", "urlzen.com", "usat.ly", "use.my", "vb.ly", "vevo.ly", "vgn.am", "vl.am", "vm.lc", "w55.de", "wapo.st", "wapurl.co.uk", "wipi.es",
	            "wp.me", "x.vu", "xr.com", "xrl.in", "xrl.us", "xurl.es", "xurl.jp", "y.ahoo.it", "yatuc.com", "ye.pe", "yep.it", "yfrog.com", "yhoo.it", "yiyd.com", "youtu.be", "yuarel.com",
	            "z0p.de", "zi.ma", "zi.mu", "zipmyurl.com", "zud.me", "zurl.ws", "zz.gd", "zzang.kr", "›.ws", "✩.ws", "✿.ws", "❥.ws", "➔.ws", "➞.ws", "➡.ws", "➨.ws", "➯.ws", "➹.ws", "➽.ws"];

	        if ($('#jqoembeddata').length === 0) $('<span id="jqoembeddata"></span>').appendTo('body');

	        return this.each(function () {
	            var container = $(this),
	                resourceURL = (url && (!url.indexOf('http://') || !url.indexOf('https://'))) ? url : container.attr("href"),
	                provider;

	            if (embedAction) {
	                settings.onEmbed = embedAction;
	            }
	            else if (!settings.onEmbed) {
	                settings.onEmbed = function (oembedData) {
	                    $.fn.oembed.insertCode(this, settings.embedMethod, oembedData);
	                };
	            }

	            if (resourceURL !== null && resourceURL !== undefined) {
	                //Check if shorten URL
/*	                
	                for (var j = 0, l = shortURLList.length; j < l; j++) {
	                    var regExp = new RegExp('://' + shortURLList[j] + '/', "i");

	                    if (resourceURL.match(regExp) !== null) {
	                        //AJAX to http://api.longurl.org/v2/expand?url=http://bit.ly/JATvIs&format=json&callback=hhh
	                        var ajaxopts = $.extend({
	                            url: "http://api.longurl.org/v2/expand",
	                            dataType: 'jsonp',
	                            data: {
	                                url: resourceURL,
	                                format: "json"
	                                //callback: "?"
	                            },
	                            success: function (data) {
	                                //this = $.fn.oembed;
	                                resourceURL = data['long-url'];
	                                provider = $.fn.oembed.getOEmbedProvider(data['long-url']);

	                                //remove fallback
	                                if (!!settings.fallback === false) {
	                                    provider = provider.name.toLowerCase() === 'opengraph' ? null : provider;
	                                }

	                                if (provider !== null) {
	                                    provider.params = getNormalizedParams(settings[provider.name]) || {};
	                                    provider.maxWidth = settings.maxWidth;
	                                    provider.maxHeight = settings.maxHeight;
	                                    embedCode(container, resourceURL, provider);
	                                } else {
	                                    settings.onProviderNotFound.call(container, resourceURL);
	                                }
	                            },
	                            error: function () {
	                                settings.onError.call(container, resourceURL)
	                            }
	                        }, settings.ajaxOptions || {});

	                        $.ajax(ajaxopts);

	                        return container;
	                    }
	                }
	                
*/	                
	                provider = $.fn.oembed.getOEmbedProvider(resourceURL);

	                //remove fallback
	                if (!!settings.fallback === false) {
	                    provider = provider.name.toLowerCase() === 'opengraph' ? null : provider;
	                }
	                if (provider !== null) {
	                    provider.params = getNormalizedParams(settings[provider.name]) || {};
	                    provider.maxWidth = settings.maxWidth;
	                    provider.maxHeight = settings.maxHeight;
	                    embedCode(container, resourceURL, provider);
	                } else {
	                    settings.onProviderNotFound.call(container, resourceURL);
	                }
	            }
	            return container;
	        });
	    };

	    var settings;

	    // Plugin defaults
	    $.fn.oembed.defaults = {
	        fallback: true,
	        maxWidth: null,
	        maxHeight: null,
	        includeHandle: true,
	        embedMethod: 'auto',
	        // "auto", "append", "fill"
	        onProviderNotFound: function () {
	        },
	        beforeEmbed: function () {
	        },
	        afterEmbed: function () {
	        },
	        onEmbed: false,
	        onError: function (a, b, c, d) {
	            console.log('err:', a, b, c, d)
	        },
	        ajaxOptions: {}
	    };

	    /* Private functions */
	    function rand(length, current) { //Found on http://stackoverflow.com/questions/1349404/generate-a-string-of-5-random-characters-in-javascript
	        current = current ? current : '';
	        return length ? rand(--length, "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz".charAt(Math.floor(Math.random() * 60)) + current) : current;
	    }

	    function getRequestUrl(provider, externalUrl) {
	        var url = provider.apiendpoint,
	            qs = "",
	            i;
	        url += (url.indexOf("?") <= 0) ? "?" : "&";
	        url = url.replace('#', '%23');

	        if (provider.maxWidth !== null && (typeof provider.params.maxwidth === 'undefined' || provider.params.maxwidth === null)) {
	            provider.params.maxwidth = provider.maxWidth;
	        }

	        if (provider.maxHeight !== null && (typeof provider.params.maxheight === 'undefined' || provider.params.maxheight === null)) {
	            provider.params.maxheight = provider.maxHeight;
	        }

	        for (i in provider.params) {
	            // We don't want them to jack everything up by changing the callback parameter
	            if (i == provider.callbackparameter)
	                continue;

	            // allows the options to be set to null, don't send null values to the server as parameters
	            if (provider.params[i] !== null)
	                qs += "&" + escape(i) + "=" + provider.params[i];
	        }

	        url += "format=" + provider.format + "&url=" + escape(externalUrl) + qs;
	        if (provider.dataType != 'json')
	            url += "&" + provider.callbackparameter + "=?";

	        return url;
	    }

	    function success(oembedData, externalUrl, container) {
	        settings.beforeEmbed.call(container, oembedData);
	        settings.onEmbed.call(container, oembedData);
	        $('#jqoembeddata').data(externalUrl, oembedData.code);
	        settings.afterEmbed.call(container, oembedData);
	    }

	    function embedCode(container, externalUrl, embedProvider) {
	        if ($('#jqoembeddata').data(externalUrl) != undefined && embedProvider.embedtag.tag != 'iframe') {
	            var oembedData = {code: $('#jqoembeddata').data(externalUrl)};
	            success(oembedData, externalUrl, container);
	        } else if (embedProvider.yql) {
	            var from = embedProvider.yql.from || 'htmlstring';
	            var url = embedProvider.yql.url ? embedProvider.yql.url(externalUrl) : externalUrl;
	            var query = 'SELECT * FROM ' + from
	                + ' WHERE url="' + (url) + '"'
	                + " and " + (/html/.test(from) ? 'xpath' : 'itemPath') + "='" + (embedProvider.yql.xpath || '/') + "'";
	            if (from == 'html')
	                query += " and compat='html5'";
	            var ajaxopts = $.extend({
	                url: "//query.yahooapis.com/v1/public/yql",
	                dataType: 'jsonp',
	                data: {
	                    q: query,
	                    format: "json",
	                    env: 'store://datatables.org/alltableswithkeys',
	                    callback: "?"
	                },
	                success: function (data) {
	                    var result;

	                    if (embedProvider.yql.xpath && embedProvider.yql.xpath == '//meta|//title|//link') {
	                        var meta = {};

	                        if (data.query == null) {
	                            data.query = {};
	                        }
	                        if (data.query.results == null) {
	                            data.query.results = {"meta": []};
	                        }
	                        for (var i = 0, l = data.query.results.meta.length; i < l; i++) {
	                            var name = data.query.results.meta[i].name || data.query.results.meta[i].property || null;
	                            if (name == null)continue;
	                            meta[name.toLowerCase()] = data.query.results.meta[i].content;
	                        }
	                        if (!meta.hasOwnProperty("title") || !meta.hasOwnProperty("og:title")) {
	                            if (data.query.results.title != null) {
	                                meta.title = data.query.results.title;
	                            }
	                        }
	                        if (!meta.hasOwnProperty("og:image") && data.query.results.hasOwnProperty("link")) {
	                            for (var i = 0, l = data.query.results.link.length; i < l; i++) {
	                                if (data.query.results.link[i].hasOwnProperty("rel")) {
	                                    if (data.query.results.link[i].rel == "apple-touch-icon") {
	                                        if (data.query.results.link[i].href.charAt(0) == "/") {
	                                            meta["og:image"] = url.match(/^(([a-z]+:)?(\/\/)?[^\/]+\/).*$/)[1] + data.query.results.link[i].href;
	                                        } else {
	                                            meta["og:image"] = data.query.results.link[i].href;
	                                        }
	                                    }
	                                }
	                            }
	                        }
	                        result = embedProvider.yql.datareturn(meta);
	                    } else {
	                        result = embedProvider.yql.datareturn ? embedProvider.yql.datareturn(data.query.results) : data.query.results.result;
	                    }
	                    if (result === false)return;
	                    var oembedData = $.extend({}, result);
	                    oembedData.code = result;
	                    success(oembedData, externalUrl, container);
	                },
	                error: settings.onError.call(container, externalUrl, embedProvider)
	            }, settings.ajaxOptions || {});
	            $.ajax(ajaxopts);
	        } else if (embedProvider.templateRegex) {
	            if (embedProvider.embedtag.tag !== '') {
	                var flashvars = embedProvider.embedtag.flashvars || '';
	                var tag = embedProvider.embedtag.tag || 'embed';
	                var width = embedProvider.embedtag.width || 'auto';
	                var height = embedProvider.embedtag.height || 'auto';
	                var src = externalUrl.replace(embedProvider.templateRegex, embedProvider.apiendpoint);

	                if (!embedProvider.nocache) {
	                    src += '&jqoemcache=' + rand(5);
	                }

	                if (embedProvider.apikey) {
	                    src = src.replace('_APIKEY_', settings.apikeys[embedProvider.name]);
	                }

	                var code = $('<' + tag + '/>').attr('src', src).attr('width', width)
	                    .attr('height', height)
	                    .attr('allowfullscreen', embedProvider.embedtag.allowfullscreen || 'true')
	                    .attr('allowscriptaccess', embedProvider.embedtag.allowfullscreen || 'always')
	                    .css('max-height', settings.maxHeight || 'auto')
	                    .css('max-width', settings.maxWidth || 'auto');

	                if (tag == 'embed') {
	                    code.attr('type', embedProvider.embedtag.type || "application/x-shockwave-flash")
	                        .attr('flashvars', externalUrl.replace(embedProvider.templateRegex, flashvars));
	                }

	                if (tag == 'iframe') {
	                    code.attr('scrolling', embedProvider.embedtag.scrolling || "no")
	                        .attr('frameborder', embedProvider.embedtag.frameborder || "0");

	                }

	                if (tag == 'img') {
	                    var link = $('<a target="_blank" href="' + src + '" />');
	                    link.append(code);
	                    code = link;
	                }

	                success({code: code}, externalUrl, container);
	            } else if (embedProvider.apiendpoint) {
	                //Add APIkey if true
	                if (embedProvider.apikey)
	                    embedProvider.apiendpoint = embedProvider.apiendpoint.replace('_APIKEY_', settings.apikeys[embedProvider.name]);

	                ajaxopts = $.extend({
	                    url: externalUrl.replace(embedProvider.templateRegex, embedProvider.apiendpoint),
	                    dataType: 'jsonp',
	                    success: function (data) {
	                        var oembedData = $.extend({}, data);
	                        oembedData.code = embedProvider.templateData(data);
	                        success(oembedData, externalUrl, container);
	                    },
	                    error: settings.onError.call(container, externalUrl, embedProvider)
	                }, settings.ajaxOptions || {});
	                $.ajax(ajaxopts);
	            } else {
	                success({code: externalUrl.replace(embedProvider.templateRegex, embedProvider.template)}, externalUrl, container);
	            }
	        } else {

	            var requestUrl = getRequestUrl(embedProvider, externalUrl);
	            ajaxopts = $.extend({
	                url: requestUrl,
	                dataType: embedProvider.dataType || 'jsonp',
	                success: function (data) {
	                    var oembedData = $.extend({}, data);
	                    switch (oembedData.type) {
	                        case "file": //Deviant Art has this
	                        case "photo":
	                            oembedData.code = $.fn.oembed.getPhotoCode(externalUrl, oembedData);
	                            break;
	                        case "video":
	                        case "rich":
	                            oembedData.code = $.fn.oembed.getRichCode(externalUrl, oembedData);
	                            break;
	                        default:
	                            oembedData.code = $.fn.oembed.getGenericCode(externalUrl, oembedData);
	                            break;
	                    }
	                    success(oembedData, externalUrl, container);
	                },
	                error: settings.onError.call(container, externalUrl, embedProvider)
	            }, settings.ajaxOptions || {});
	            $.ajax(ajaxopts);
	        }
	    }

	    function getNormalizedParams(params) {
	        if (params === null) return null;
	        var key, normalizedParams = {};
	        for (key in params) {
	            if (key !== null) normalizedParams[key.toLowerCase()] = params[key];
	        }
	        return normalizedParams;
	    }

	    /* Public functions */
	    $.fn.oembed.insertCode = function (container, embedMethod, oembedData) {
	        if (oembedData === null)
	            return;

	        if (embedMethod === 'auto' && container.attr('href') !== null) {
	            embedMethod = 'append';
	        } else if (embedMethod == 'auto') {
	            embedMethod = 'replace';
	        }

	        switch (embedMethod) {
	            case "replace":
	                container.replaceWith(oembedData.code);
	                break;
	            case "fill":
	                container.html(oembedData.code);
	                break;
	            case "append":
	                container.wrap('<div class="oembedall-container"></div>');
	                var oembedContainer = container.parent();
	                if (settings.includeHandle) {
	                    $('<span class="oembedall-closehide">&darr;</span>').insertBefore(container).click(function () {
	                        var encodedString = encodeURIComponent($(this).text());
	                        $(this).html((encodedString == '%E2%86%91') ? '&darr;' : '&uarr;');
	                        $(this).parent().children().last().toggle();
	                    });
	                }
	                //oembedContainer.append('<br/>');
	                try {
	                    oembedData.code.clone().appendTo(oembedContainer);
	                } catch (e) {
	                    oembedContainer.append(oembedData.code);
	                }
	                /* Make videos semi-responsive
	                 * If parent div width less than embeded iframe video then iframe gets shrunk to fit smaller width
	                 * If parent div width greater thans embed iframe use the max widht
	                 * - works on youtubes and vimeo
	                 */
	                if (settings.maxWidth) {
	                    var post_width = oembedContainer.parent().width();
	                    if (post_width < settings.maxWidth) {
	                        var iframe_width_orig = $('iframe', oembedContainer).width();
	                        var iframe_height_orig = $('iframe', oembedContainer).height();
	                        var ratio = iframe_width_orig / post_width;
	                        $('iframe', oembedContainer).width(iframe_width_orig / ratio);
	                        $('iframe', oembedContainer).height(iframe_height_orig / ratio);
	                    } else {
	                        if (settings.maxWidth) {
	                            $('iframe', oembedContainer).width(settings.maxWidth);
	                        }
	                        if (settings.maxHeight) {
	                            $('iframe', oembedContainer).height(settings.maxHeight);
	                        }
	                    }
	                }
	                break;
	        }
	    };

	    $.fn.oembed.getPhotoCode = function (url, oembedData) {
	        var code;
	        var alt = oembedData.title ? oembedData.title : '';
	        alt += oembedData.author_name ? ' - ' + oembedData.author_name : '';
	        alt += oembedData.provider_name ? ' - ' + oembedData.provider_name : '';

	        if (oembedData.url) {
	            code = '<div><a href="' + url + '" target=\'_blank\'><img src="' + oembedData.url + '" alt="' + alt + '"/></a></div>';
	        } else if (oembedData.thumbnail_url) {
	            var newURL = oembedData.thumbnail_url.replace('_s', '_b');
	            code = '<div><a href="' + url + '" target=\'_blank\'><img src="' + newURL + '" alt="' + alt + '"/></a></div>';
	        } else {
	            code = '<div>Error loading this picture</div>';
	        }

	        if (oembedData.html) {
	            code += "<div>" + oembedData.html + "</div>";
	        }

	        return code;
	    };

	    $.fn.oembed.getRichCode = function (url, oembedData) {
	        return oembedData.html;
	    };

	    $.fn.oembed.getGenericCode = function (url, oembedData) {
	        var title = ((oembedData.title) && (oembedData.title !== null)) ? oembedData.title : url;
	        var code = '<a href="' + url + '">' + title + '</a>';

	        if (oembedData.html) {
	            code += "<div>" + oembedData.html + "</div>";
	        }

	        return code;
	    };

	    $.fn.oembed.getOEmbedProvider = function (url) {
	        for (var i = 0; i < $.fn.oembed.providers.length; i++) {
	            for (var j = 0, l = $.fn.oembed.providers[i].urlschemes.length; j < l; j++) {
	                var regExp = new RegExp($.fn.oembed.providers[i].urlschemes[j], "i");

	                if (url.match(regExp) !== null)
	                    return $.fn.oembed.providers[i];
	            }
	        }
	        return null;
	    };

	    // Constructor Function for OEmbedProvider Class.
	    $.fn.oembed.OEmbedProvider = function (name, type, urlschemesarray, apiendpoint, extraSettings) {
	        this.name = name;
	        this.type = type; // "photo", "video", "link", "rich", null
	        this.urlschemes = urlschemesarray;
	        this.apiendpoint = apiendpoint;
	        this.maxWidth = 500;
	        this.maxHeight = 400;
	        extraSettings = extraSettings || {};

	        if (extraSettings.useYQL) {

	            if (extraSettings.useYQL == 'xml') {
	                extraSettings.yql = {
	                    xpath: "//oembed/html",
	                    from: 'xml',
	                    apiendpoint: this.apiendpoint,
	                    url: function (externalurl) {
	                        return this.apiendpoint + '?format=xml&url=' + externalurl
	                    },
	                    datareturn: function (results) {
	                        return results.html.replace(/.*\[CDATA\[(.*)\]\]>$/, '$1') || ''
	                    }
	                };
	            } else {
	                extraSettings.yql = {
	                    from: 'json',
	                    apiendpoint: this.apiendpoint,
	                    url: function (externalurl) {
	                        return this.apiendpoint + '?format=json&url=' + externalurl
	                    },
	                    datareturn: function (results) {
	                        if (results.json.type != 'video' && (results.json.url || results.json.thumbnail_url)) {
	                            return '<img src="' + (results.json.url || results.json.thumbnail_url) + '" />';
	                        }
	                        return results.json.html || ''
	                    }
	                };
	            }
	            this.apiendpoint = null;
	        }


	        for (var property in extraSettings) {
	            this[property] = extraSettings[property];
	        }

	        this.format = this.format || 'json';
	        this.callbackparameter = this.callbackparameter || "callback";
	        this.embedtag = this.embedtag || {tag: ""};


	    };

	    /*
	     * Function to update existing providers
	     *
	     * @param  {String}    name             The name of the provider
	     * @param  {String}    type             The type of the provider can be "file", "photo", "video", "rich"
	     * @param  {String}    urlshemesarray   Array of url of the provider
	     * @param  {String}    apiendpoint      The endpoint of the provider
	     * @param  {String}    extraSettings    Extra settings of the provider
	     */
	    $.fn.updateOEmbedProvider = function (name, type, urlschemesarray, apiendpoint, extraSettings) {
	        for (var i = 0; i < $.fn.oembed.providers.length; i++) {
	            if ($.fn.oembed.providers[i].name === name) {
	                if (type !== null) {
	                    $.fn.oembed.providers[i].type = type;
	                }
	                if (urlschemesarray !== null) {
	                    $.fn.oembed.providers[i].urlschemes = urlschemesarray;
	                }
	                if (apiendpoint !== null) {
	                    $.fn.oembed.providers[i].apiendpoint = apiendpoint;
	                }
	                if (extraSettings !== null) {
	                    $.fn.oembed.providers[i].extraSettings = extraSettings;
	                    for (var property in extraSettings) {
	                        if (property !== null && extraSettings[property] !== null) {
	                            $.fn.oembed.providers[i][property] = extraSettings[property];
	                        }
	                    }
	                }
	            }
	        }
	    };

	    /* Native & common providers */
	    $.fn.oembed.providers = [

	        //Video
	        new $.fn.oembed.OEmbedProvider("youtube", "video", ["youtube\\.com/watch.+v=[\\w-]+&?", "youtu\\.be/[\\w-]+", "youtube.com/embed"], 'https://www.youtube.com/embed/$1?wmode=transparent', {
	            templateRegex: /.*(?:v\=|be\/|embed\/)([\w\-]+)&?.*/, embedtag: {tag: 'iframe', width: '425', height: '349'}
	        }),

	        //new $.fn.oembed.OEmbedProvider("youtube", "video", ["youtube\\.com/watch.+v=[\\w-]+&?", "youtu\\.be/[\\w-]+"], 'http://www.youtube.com/oembed', {useYQL:'json'}),
	        //new $.fn.oembed.OEmbedProvider("youtubeiframe", "video", ["youtube.com/embed"],  "$1?wmode=transparent",
	        //  {templateRegex:/(.*)/,embedtag : {tag: 'iframe', width:'425',height: '349'}}),
	        new $.fn.oembed.OEmbedProvider("wistia", "video", ["wistia.com/m/.+", "wistia.com/embed/.+", "wi.st/m/.+", "wi.st/embed/.+"], 'http://fast.wistia.com/oembed', {useYQL: 'json'}),
	        new $.fn.oembed.OEmbedProvider("xtranormal", "video", ["xtranormal\\.com/watch/.+"], "http://www.xtranormal.com/xtraplayr/$1/$2", {
	            templateRegex: /.*com\/watch\/([\w\-]+)\/([\w\-]+).*/, embedtag: {tag: 'iframe', width: '320', height: '269'}}),
	        new $.fn.oembed.OEmbedProvider("scivee", "video", ["scivee.tv/node/.+"], "http://www.scivee.tv/flash/embedCast.swf?", {
	            templateRegex: /.*tv\/node\/(.+)/, embedtag: {width: '480', height: '400', flashvars: "id=$1&type=3"}}),
	        new $.fn.oembed.OEmbedProvider("veoh", "video", ["veoh.com/watch/.+"], "http://www.veoh.com/swf/webplayer/WebPlayer.swf?version=AFrontend.5.7.0.1337&permalinkId=$1&player=videodetailsembedded&videoAutoPlay=0&id=anonymous", {
	            templateRegex: /.*watch\/([^\?]+).*/, embedtag: {width: '410', height: '341'}}),
	        new $.fn.oembed.OEmbedProvider("gametrailers", "video", ["gametrailers\\.com/video/.+"], "http://media.mtvnservices.com/mgid:moses:video:gametrailers.com:$2", {
	            templateRegex: /.*com\/video\/([\w\-]+)\/([\w\-]+).*/, embedtag: {width: '512', height: '288' }}),
	        new $.fn.oembed.OEmbedProvider("funnyordie", "video", ["funnyordie\\.com/videos/.+"], "http://player.ordienetworks.com/flash/fodplayer.swf?", {
	            templateRegex: /.*videos\/([^\/]+)\/([^\/]+)?/, embedtag: {width: 512, height: 328, flashvars: "key=$1"}}),
	        new $.fn.oembed.OEmbedProvider("colledgehumour", "video", ["collegehumor\\.com/video/.+"], "http://www.collegehumor.com/moogaloop/moogaloop.swf?clip_id=$1&use_node_id=true&fullscreen=1",
	            {templateRegex: /.*video\/([^\/]+).*/, embedtag: {width: 600, height: 338}}),
	        new $.fn.oembed.OEmbedProvider("metacafe", "video", ["metacafe\\.com/watch/.+"], "http://www.metacafe.com/fplayer/$1/$2.swf",
	            {templateRegex: /.*watch\/(\d+)\/(\w+)\/.*/, embedtag: {width: 400, height: 345}}),
	        new $.fn.oembed.OEmbedProvider("bambuser", "video", ["bambuser\\.com\/channel\/.*\/broadcast\/.*"], "http://static.bambuser.com/r/player.swf?vid=$1",
	            {templateRegex: /.*bambuser\.com\/channel\/.*\/broadcast\/(\w+).*/, embedtag: {width: 512, height: 339 }}),
	        new $.fn.oembed.OEmbedProvider("twitvid", "video", ["twitvid\\.com/.+"], "http://www.twitvid.com/embed.php?guid=$1&autoplay=0",
	            {templateRegex: /.*twitvid\.com\/(\w+).*/, embedtag: {tag: 'iframe', width: 480, height: 360 }}),
	        new $.fn.oembed.OEmbedProvider("aniboom", "video", ["aniboom\\.com/animation-video/.+"], "http://api.aniboom.com/e/$1",
	            {templateRegex: /.*animation-video\/(\d+).*/, embedtag: {width: 594, height: 334}}),
	        new $.fn.oembed.OEmbedProvider("vzaar", "video", ["vzaar\\.com/videos/.+", "vzaar.tv/.+"], "http://view.vzaar.com/$1/player?",
	            {templateRegex: /.*\/(\d+).*/, embedtag: {tag: 'iframe', width: 576, height: 324 }}),
	        new $.fn.oembed.OEmbedProvider("snotr", "video", ["snotr\\.com/video/.+"], "http://www.snotr.com/embed/$1",
	            {templateRegex: /.*\/(\d+).*/, embedtag: {tag: 'iframe', width: 400, height: 330}, nocache: 1 }),
	        new $.fn.oembed.OEmbedProvider("youku", "video", ["v.youku.com/v_show/id_.+"], "http://player.youku.com/player.php/sid/$1/v.swf",
	            {templateRegex: /.*id_(.+)\.html.*/, embedtag: {width: 480, height: 400}, nocache: 1 }),
	        new $.fn.oembed.OEmbedProvider("tudou", "video", ["tudou.com/programs/view/.+\/"], "http://www.tudou.com/v/$1/v.swf",
	            {templateRegex: /.*view\/(.+)\//, embedtag: {width: 480, height: 400}, nocache: 1 }),
	        new $.fn.oembed.OEmbedProvider("embedr", "video", ["embedr\\.com/playlist/.+"], "http://embedr.com/swf/slider/$1/425/520/default/false/std?",
	            {templateRegex: /.*playlist\/([^\/]+).*/, embedtag: {width: 425, height: 520}}),
	        new $.fn.oembed.OEmbedProvider("blip", "video", ["blip\\.tv/.+"], "//blip.tv/oembed/"),
	        new $.fn.oembed.OEmbedProvider("minoto-video", "video", ["http://api.minoto-video.com/publishers/.+/videos/.+", "http://dashboard.minoto-video.com/main/video/details/.+", "http://embed.minoto-video.com/.+"], "http://api.minoto-video.com/services/oembed.json", {useYQL: 'json'}),
	        new $.fn.oembed.OEmbedProvider("animoto", "video", ["animoto.com/play/.+"], "http://animoto.com/services/oembed"),
	        new $.fn.oembed.OEmbedProvider("hulu", "video", ["hulu\\.com/watch/.*"], "//www.hulu.com/api/oembed.json"),
	        new $.fn.oembed.OEmbedProvider("ustream", "video", ["ustream\\.tv/recorded/.*"], "http://www.ustream.tv/oembed", {useYQL: 'json'}),
	        new $.fn.oembed.OEmbedProvider("videojug", "video", ["videojug\\.com/(film|payer|interview).*"], "http://www.videojug.com/oembed.json", {useYQL: 'json'}),
	        new $.fn.oembed.OEmbedProvider("sapo", "video", ["videos\\.sapo\\.pt/.*"], "http://videos.sapo.pt/oembed", {useYQL: 'json'}),
	        new $.fn.oembed.OEmbedProvider("vodpod", "video", ["vodpod.com/watch/.*"], "http://vodpod.com/oembed.js", {useYQL: 'json'}),
	        new $.fn.oembed.OEmbedProvider("vimeo", "video", ["www\.vimeo\.com\/groups\/.*\/videos\/.*", "www\.vimeo\.com\/.*", "vimeo\.com\/groups\/.*\/videos\/.*", "vimeo\.com\/.*"], "//vimeo.com/api/oembed.json"),
	        new $.fn.oembed.OEmbedProvider("dailymotion", "video", ["dailymotion\\.com/video/.+"], "//www.dailymotion.com/embed/video/$1",
	            {templateRegex: /.*com\/video\/([\w\-]+)&?.*/, embedtag: {tag: 'iframe', width: 480, height: 270}, nocache: 1 }),
	        new $.fn.oembed.OEmbedProvider("5min", "video", ["www\\.5min\\.com/.+"], 'http://api.5min.com/oembed.xml', {useYQL: 'xml'}),
	        new $.fn.oembed.OEmbedProvider("National Film Board of Canada", "video", ["nfb\\.ca/film/.+"], 'http://www.nfb.ca/remote/services/oembed/', {useYQL: 'json'}),
	        new $.fn.oembed.OEmbedProvider("qik", "video", ["qik\\.com/\\w+"], 'http://qik.com/api/oembed.json', {useYQL: 'json'}),
	        new $.fn.oembed.OEmbedProvider("revision3", "video", ["revision3\\.com"], "http://revision3.com/api/oembed/"),
	        new $.fn.oembed.OEmbedProvider("dotsub", "video", ["dotsub\\.com/view/.+"], "http://dotsub.com/services/oembed", {useYQL: 'json'}),
	        new $.fn.oembed.OEmbedProvider("clikthrough", "video", ["clikthrough\\.com/theater/video/\\d+"], "http://clikthrough.com/services/oembed"),
	        new $.fn.oembed.OEmbedProvider("Kinomap", "video", ["kinomap\\.com/.+"], "http://www.kinomap.com/oembed"),
	        new $.fn.oembed.OEmbedProvider("VHX", "video", ["vhx.tv/.+"], "http://vhx.tv/services/oembed.json"),
	        new $.fn.oembed.OEmbedProvider("bambuser", "video", ["bambuser.com/.+"], "http://api.bambuser.com/oembed/iframe.json"),
	        new $.fn.oembed.OEmbedProvider("justin.tv", "video", ["justin.tv/.+"], 'http://api.justin.tv/api/embed/from_url.json', {useYQL: 'json'}),
	        new $.fn.oembed.OEmbedProvider("vine", "video", ["vine.co/v/.*"], null,
	            {
	                templateRegex: /https?:\/\/w?w?w?.?vine\.co\/v\/([a-zA-Z0-9]*).*/,
	                template: '<iframe src="https://vine.co/v/$1/embed/postcard" width="600" height="600" allowfullscreen="true" allowscriptaccess="always" scrolling="no" frameborder="0"></iframe>' +
	                    '<script async src="//platform.vine.co/static/scripts/embed.js" charset="utf-8"></script>',
	                nocache: 1
	            }),
	        new $.fn.oembed.OEmbedProvider("boxofficebuz", "video", ["boxofficebuz\\.com\\/embed/.+"], "http://boxofficebuz.com/embed/$1/$2", {templateRegex: [/.*boxofficebuz\.com\/embed\/(\w+)\/([\w*\-*]+)/], embedtag: {tag: 'iframe', width: 480, height: 360 }}),
	        new $.fn.oembed.OEmbedProvider("clipsyndicate", "video", ["clipsyndicate\\.com/video/play/.+", "clipsyndicate\\.com/embed/iframe\?.+"], "http://eplayer.clipsyndicate.com/embed/iframe?pf_id=1&show_title=0&va_id=$1&windows=1", {templateRegex: [/.*www\.clipsyndicate\.com\/video\/play\/(\w+)\/.*/, /.*eplayer\.clipsyndicate\.com\/embed\/iframe\?.*va_id=(\w+).*.*/], embedtag: {tag: 'iframe', width: 480, height: 360 }, nocache: 1}),
	        new $.fn.oembed.OEmbedProvider("coub", "video", ["coub\\.com/.+"], "http://www.coub.com/embed/$1?muted=false&autostart=false&originalSize=false&hideTopBar=false&noSiteButtons=false&startWithHD=false", {templateRegex: [/.*coub\.com\/embed\/(\w+)\?*.*/, /.*coub\.com\/view\/(\w+).*/], embedtag: {tag: 'iframe', width: 480, height: 360 }, nocache: 1}),
	        new $.fn.oembed.OEmbedProvider("discoverychannel", "video", ["snagplayer\\.video\\.dp\\.discovery\\.com/.+"], "http://snagplayer.video.dp.discovery.com/$1/snag-it-player.htm?auto=no", {templateRegex: [/.*snagplayer\.video\.dp\.discovery\/(\w+).*/], embedtag: {tag: 'iframe', width: 480, height: 360 }}),
	        new $.fn.oembed.OEmbedProvider("telly", "video", ["telly\\.com/.+"], "http://www.telly.com/embed.php?guid=$1&autoplay=0", {templateRegex: [/.*telly\.com\/embed\.php\?guid=(\w+).*/, /.*telly\.com\/(\w+).*/], embedtag: {tag: 'iframe', width: 480, height: 360 }}),
	        new $.fn.oembed.OEmbedProvider("minilogs", "video", ["minilogs\\.com/.+"], "http://www.minilogs.com/e/$1", {templateRegex: [/.*minilogs\.com\/e\/(\w+).*/, /.*minilogs\.com\/(\w+).*/], embedtag: {tag: 'iframe', width: 480, height: 360 }, nocache: 1}),
	        new $.fn.oembed.OEmbedProvider("viddy", "video", ["viddy\\.com/.+"], "http://www.viddy.com/embed/video/$1", {templateRegex: [/.*viddy\.com\/embed\/video\/(\.*)/, /.*viddy\.com\/video\/(\.*)/], embedtag: {tag: 'iframe', width: 480, height: 360 }, nocache: 1}),
	        new $.fn.oembed.OEmbedProvider("worldstarhiphop", "video", ["worldstarhiphop\\.com\/embed/.+"], "http://www.worldstarhiphop.com/embed/$1", {templateRegex: /.*worldstarhiphop\.com\/embed\/(\w+).*/, embedtag: {tag: 'iframe', width: 480, height: 360 }, nocache: 1}),
	        new $.fn.oembed.OEmbedProvider("zapiks", "video", ["zapiks\\.fr\/.+"], "http://www.zapiks.fr/index.php?action=playerIframe&media_id=$1&autoStart=fals", {templateRegex: /.*zapiks\.fr\/index.php\?[\w\=\&]*media_id=(\w+).*/, embedtag: {tag: 'iframe', width: 480, height: 360 }, nocache: 1}),

	        //Audio
	        new $.fn.oembed.OEmbedProvider("official.fm", "rich", ["official.fm/.+"], 'http://official.fm/services/oembed', {useYQL: 'json'}),
	        new $.fn.oembed.OEmbedProvider("chirbit", "rich", ["chirb.it/.+"], 'http://chirb.it/oembed.json', {useYQL: 'json'}),
	        new $.fn.oembed.OEmbedProvider("chirbit", "audio", ["chirb\\.it/.+"], "http://chirb.it/wp/$1", {templateRegex: [/.*chirb\.it\/wp\/(\w+).*/, /.*chirb\.it\/(\w+).*/], embedtag: {tag: 'iframe', width: 480, height: 360 }, nocache: 1}),
	        new $.fn.oembed.OEmbedProvider("Huffduffer", "rich", ["huffduffer.com/[-.\\w@]+/\\d+"], "http://huffduffer.com/oembed"),
	        new $.fn.oembed.OEmbedProvider("Spotify", "rich", ["open.spotify.com/(track|album|user)/"], "https://embed.spotify.com/oembed/"),
	        new $.fn.oembed.OEmbedProvider("shoudio", "rich", ["shoudio.com/.+", "shoud.io/.+"], "http://shoudio.com/api/oembed"),
	        new $.fn.oembed.OEmbedProvider("mixcloud", "rich", ["mixcloud.com/.+"], 'http://www.mixcloud.com/oembed/', {useYQL: 'json'}),
	        new $.fn.oembed.OEmbedProvider("rdio.com", "rich", ["rd.io/.+", "rdio.com"], "http://www.rdio.com/api/oembed/"),
	        new $.fn.oembed.OEmbedProvider("Soundcloud", "rich", ["soundcloud.com/.+", "snd.sc/.+"], "//soundcloud.com/oembed", {format: 'js'}),
	        new $.fn.oembed.OEmbedProvider("bandcamp", "rich", ["bandcamp\\.com/album/.+"], null,
	            {
	                yql: {
	                    xpath: "//meta[contains(@content, \\'EmbeddedPlayer\\')]",
	                    from: 'html',
	                    datareturn: function (results) {
	                        return results.meta ? '<iframe width="400" height="100" src="' + results.meta.content + '" allowtransparency="true" frameborder="0"></iframe>' : false;
	                    }
	                }
	            }),

	        //Photo
	        new $.fn.oembed.OEmbedProvider("deviantart", "photo", ["deviantart.com/.+", "fav.me/.+", "deviantart.com/.+"], "//backend.deviantart.com/oembed", {format: 'jsonp'}),
	        new $.fn.oembed.OEmbedProvider("skitch", "photo", ["skitch.com/.+"], null,
	            {
	                yql: {
	                    xpath: "json",
	                    from: 'json',
	                    url: function (externalurl) {
	                        return 'http://skitch.com/oembed/?format=json&url=' + externalurl
	                    },
	                    datareturn: function (data) {
	                        return $.fn.oembed.getPhotoCode(data.json.url, data.json);
	                    }
	                }
	            }),
	        new $.fn.oembed.OEmbedProvider("mobypicture", "photo", ["mobypicture.com/user/.+/view/.+", "moby.to/.+"], "http://api.mobypicture.com/oEmbed"),
	        new $.fn.oembed.OEmbedProvider("flickr", "photo", ["flickr\\.com/photos/.+"], "//flickr.com/services/oembed", {callbackparameter: 'jsoncallback'}),
	        new $.fn.oembed.OEmbedProvider("photobucket", "photo", ["photobucket\\.com/(albums|groups)/.+"], "http://photobucket.com/oembed/"),
	        new $.fn.oembed.OEmbedProvider("instagram", "photo", ["instagr\\.?am(\\.com)?/.+"], "//api.instagram.com/oembed"),
	        //new $.fn.oembed.OEmbedProvider("yfrog", "photo", ["yfrog\\.(com|ru|com\\.tr|it|fr|co\\.il|co\\.uk|com\\.pl|pl|eu|us)/.+"], "http://www.yfrog.com/api/oembed",{useYQL:"json"}),
	        new $.fn.oembed.OEmbedProvider("SmugMug", "photo", ["smugmug.com/[-.\\w@]+/.+"], "http://api.smugmug.com/services/oembed/"),
	        new $.fn.oembed.OEmbedProvider("dribbble", "photo", ["dribbble.com/shots/.+"], "http://api.dribbble.com/shots/$1?callback=?",
	            {
	                templateRegex: /.*shots\/([\d]+).*/,
	                templateData: function (data) {
	                    if (!data.image_teaser_url) {
	                        return false;
	                    }
	                    return  '<img src="' + data.image_teaser_url + '"/>';
	                }
	            }),
	        new $.fn.oembed.OEmbedProvider("chart.ly", "photo", ["chart\\.ly/[a-z0-9]{6,8}"], "http://chart.ly/uploads/large_$1.png",
	            {templateRegex: /.*ly\/([^\/]+).*/, embedtag: {tag: 'img'}, nocache: 1}),
	        //new $.fn.oembed.OEmbedProvider("stocktwits.com", "photo", ["stocktwits\\.com/message/.+"], "http://charts.stocktwits.com/production/original_$1.png?",
	        //  { templateRegex: /.*message\/([^\/]+).*/, embedtag: { tag: 'img'},nocache:1 }),
	        new $.fn.oembed.OEmbedProvider("circuitlab", "photo", ["circuitlab.com/circuit/.+"], "https://www.circuitlab.com/circuit/$1/screenshot/540x405/",
	            {templateRegex: /.*circuit\/([^\/]+).*/, embedtag: {tag: 'img'}, nocache: 1}),
	        new $.fn.oembed.OEmbedProvider("23hq", "photo", ["23hq.com/[-.\\w@]+/photo/.+"], "http://www.23hq.com/23/oembed", {useYQL: "json"}),
	        new $.fn.oembed.OEmbedProvider("img.ly", "photo", ["img\\.ly/.+"], "//img.ly/show/thumb/$1",
	            {templateRegex: /.*ly\/([^\/]+).*/, embedtag: {tag: 'img'}, nocache: 1}),
	        new $.fn.oembed.OEmbedProvider("twitgoo.com", "photo", ["twitgoo\\.com/.+"], "http://twitgoo.com/show/thumb/$1",
	            {templateRegex: /.*com\/([^\/]+).*/, embedtag: {tag: 'img'}, nocache: 1}),
	        new $.fn.oembed.OEmbedProvider("imgur.com", "photo", ["imgur\\.com/gallery/.+"], "https://imgur.com/$1l.jpg",
	            {templateRegex: /.*gallery\/([^\/]+).*/, embedtag: {tag: 'img'}, nocache: 1}),
	        new $.fn.oembed.OEmbedProvider("imgur.com", "photo", ["imgur\\.com/.+"], "https://imgur.com/$1.png",
	            {templateRegex: /.*\/([^\/]+).*/, embedtag: {tag: 'img'}, nocache: 1}),
	        new $.fn.oembed.OEmbedProvider("visual.ly", "rich", ["visual\\.ly/.+"], null,
	            {
	                yql: {
	                    xpath: "//a[@id=\\'gc_article_graphic_image\\']/img",
	                    from: 'htmlstring'
	                }
	            }),
	        /*new $.fn.oembed.OEmbedProvider("gravatar", "photo", ["mailto:.+"], null,
	            {
	                templateRegex: /mailto:([^\/]+).,
	                template: function (wm, email) {
	                    return '<img src="https://gravatar.com/avatar/' + email.md5() + '.jpg" alt="on Gravtar" class="jqoaImg">';
	                }
	            }),*/
	        new $.fn.oembed.OEmbedProvider("achewood", "photo", ["achewood\\.com\\/index.php\\?date=.+"], "http://www.achewood.com/comic.php?date=$1", {templateRegex: /.*achewood\.com\/index.php\?date=(\w+).*/, embedtag: {tag: 'iframe', width: 480, height: 360 }, nocache: 1}),
	        new $.fn.oembed.OEmbedProvider("fotokritik", "photo", ["fotokritik\\.com/.+"], "http://www.fotokritik.com/embed/$1", {templateRegex: [/.*fotokritik\.com\/embed\/(\w+).*/, /.*fotokritik\.com\/(\w+).*/], embedtag: {tag: 'iframe', width: 480, height: 360 }, nocache: 1}),
	        new $.fn.oembed.OEmbedProvider("giflike", "photo", ["giflike\\.com/.+"], "http://www.giflike.com/embed/$1", {templateRegex: [/.*giflike\.com\/embed\/(\w+).*/, /.*giflike\.com\/a\/(\w+).*/], embedtag: {tag: 'iframe', width: 480, height: 360 }, nocache: 1}),

	        //Rich
	        new $.fn.oembed.OEmbedProvider("twitter", "rich", ["twitter.com/.+"], "https://api.twitter.com/1/statuses/oembed.json"),
	        new $.fn.oembed.OEmbedProvider("gmep", "rich", ["gmep.imeducate.com/.*", "gmep.org/.*"], "http://gmep.org/oembed.json"),
	        new $.fn.oembed.OEmbedProvider("urtak", "rich", ["urtak.com/(u|clr)/.+"], "http://oembed.urtak.com/1/oembed"),
	        new $.fn.oembed.OEmbedProvider("cacoo", "rich", ["cacoo.com/.+"], "http://cacoo.com/oembed.json"),
	        new $.fn.oembed.OEmbedProvider("dailymile", "rich", ["dailymile.com/people/.*/entries/.*"], "http://api.dailymile.com/oembed"),
	        new $.fn.oembed.OEmbedProvider("dipity", "rich", ["dipity.com/timeline/.+"], 'http://www.dipity.com/oembed/timeline/', {useYQL: 'json'}),
	        new $.fn.oembed.OEmbedProvider("sketchfab", "rich", ["sketchfab.com/show/.+"], 'http://sketchfab.com/oembed', {useYQL: 'json'}),
	        new $.fn.oembed.OEmbedProvider("speakerdeck", "rich", ["speakerdeck.com/.+"], 'http://speakerdeck.com/oembed.json', {useYQL: 'json'}),
	        new $.fn.oembed.OEmbedProvider("popplet", "rich", ["popplet.com/app/.*"], "http://popplet.com/app/Popplet_Alpha.swf?page_id=$1&em=1",
	            {
	                templateRegex: /.*#\/([^\/]+).*/,
	                embedtag: {
	                    width: 460,
	                    height: 460
	                }
	            }),

	        new $.fn.oembed.OEmbedProvider("pearltrees", "rich", ["pearltrees.com/.*"], "http://cdn.pearltrees.com/s/embed/getApp?",
	            {
	                templateRegex: /.*N-f=1_(\d+).*N-p=(\d+).*/,
	                embedtag: {
	                    width: 460,
	                    height: 460,
	                    flashvars: "lang=en_US&amp;embedId=pt-embed-$1-693&amp;treeId=$1&amp;pearlId=$2&amp;treeTitle=Diagrams%2FVisualization&amp;site=www.pearltrees.com%2FF"
	                }
	            }),

	        new $.fn.oembed.OEmbedProvider("prezi", "rich", ["prezi.com/.*"], "//prezi.com/bin/preziloader.swf?",
	            {
	                templateRegex: /.*com\/([^\/]+)\/.*/,
	                embedtag: {
	                    width: 550,
	                    height: 400,
	                    flashvars: "prezi_id=$1&amp;lock_to_path=0&amp;color=ffffff&amp;autoplay=no&amp;autohide_ctrls=0"
	                }
	            }),

	        new $.fn.oembed.OEmbedProvider("tourwrist", "rich", ["tourwrist.com/tours/.+"], null,
	            {
	                templateRegex: /.*tours.([\d]+).*/,
	                template: function (wm, tourid) {
	                    setTimeout(function () {
	                        if (loadEmbeds)loadEmbeds();
	                    }, 2000);
	                    return "<div id='" + tourid + "' class='tourwrist-tour-embed direct'></div> <script type='text/javascript' src='http://tourwrist.com/tour_embed.js'></script>";
	                }
	            }),

	        new $.fn.oembed.OEmbedProvider("meetup", "rich", ["meetup\\.(com|ps)/.+"], "http://api.meetup.com/oembed"),
	        new $.fn.oembed.OEmbedProvider("ebay", "rich", ["\\.ebay\\.*"], "http://togo.ebay.com/togo/togo.swf?2008013100",
	            {
	                templateRegex: /.*\/([^\/]+)\/(\d{10,13}).*/,
	                embedtag: {
	                    width: 355,
	                    height: 300,
	                    flashvars: "base=http://togo.ebay.com/togo/&lang=en-us&mode=normal&itemid=$2&query=$1"
	                }
	            }),
	        new $.fn.oembed.OEmbedProvider("wikipedia", "rich", ["wikipedia.org/wiki/.+"], "http://$1.wikipedia.org/w/api.php?action=parse&page=$2&format=json&section=0&callback=?", {
	            templateRegex: /.*\/\/([\w]+).*\/wiki\/([^\/]+).*/,
	            templateData: function (data) {
	                if (!data.parse)
	                    return false;
	                var text = data.parse['text']['*'].replace(/href="\/wiki/g, 'href="http://en.wikipedia.org/wiki');
	                return  '<div id="content"><h3><a class="nav-link" href="http://en.wikipedia.org/wiki/' + data.parse['displaytitle'] + '">' + data.parse['displaytitle'] + '</a></h3>' + text + '</div>';
	            }
	        }),
	        new $.fn.oembed.OEmbedProvider("imdb", "rich", ["imdb.com/title/.+"], "http://www.imdbapi.com/?i=$1&callback=?",
	            {
	                templateRegex: /.*\/title\/([^\/]+).*/,
	                templateData: function (data) {
	                    if (!data.Title)
	                        return false;
	                    return  '<div id="content"><h3><a class="nav-link" href="http://imdb.com/title/' + data.imdbID + '/">' + data.Title + '</a> (' + data.Year + ')</h3><p>Rating: ' + data.imdbRating + '<br/>Genre: ' + data.Genre + '<br/>Starring: ' + data.Actors + '</p></div>  <div id="view-photo-caption">' + data.Plot + '</div></div>';
	                }
	            }),
	        new $.fn.oembed.OEmbedProvider("livejournal", "rich", ["livejournal.com/"], "http://ljpic.seacrow.com/json/$2$4?jsonp=?"
	            , {
	                templateRegex: /(http:\/\/(((?!users).)+)\.livejournal\.com|.*users\.livejournal\.com\/([^\/]+)).*/,
	                templateData: function (data) {
	                    if (!data.username)
	                        return false;
	                    return  '<div><img src="' + data.image + '" align="left" style="margin-right: 1em;" /><span class="oembedall-ljuser"><a href="http://' + data.username + '.livejournal.com/profile"><img src="http://www.livejournal.com/img/userinfo.gif" alt="[info]" width="17" height="17" /></a><a href="http://' + data.username + '.livejournal.com/">' + data.username + '</a></span><br />' + data.name + '</div>';
	                }
	            }),
	        new $.fn.oembed.OEmbedProvider("circuitbee", "rich", ["circuitbee\\.com/circuit/view/.+"], "http://c.circuitbee.com/build/r/schematic-embed.html?id=$1",
	            {
	                templateRegex: /.*circuit\/view\/(\d+).*/,
	                embedtag: {
	                    tag: 'iframe',
	                    width: '500',
	                    height: '350'
	                }
	            }),

	        new $.fn.oembed.OEmbedProvider("googlecalendar", "rich", ["www.google.com/calendar/embed?.+"], "$1",
	            {templateRegex: /(.*)/, embedtag: {tag: 'iframe', width: '800', height: '600' }}),
	        new $.fn.oembed.OEmbedProvider("jsfiddle", "rich", ["jsfiddle.net/[^/]+/?"], "http://jsfiddle.net/$1/embedded/result,js,resources,html,css/?",
	            {templateRegex: /.*net\/([^\/]+).*/, embedtag: {tag: 'iframe', width: '100%', height: '300' }}),
	        new $.fn.oembed.OEmbedProvider("jsbin", "rich", ["jsbin.com/.+"], "http://jsbin.com/$1/?",
	            {templateRegex: /.*com\/([^\/]+).*/, embedtag: {tag: 'iframe', width: '100%', height: '300' }}),
	        new $.fn.oembed.OEmbedProvider("jotform", "rich", ["form.jotform.co/form/.+"], "$1?",
	            {templateRegex: /(.*)/, embedtag: {tag: 'iframe', width: '100%', height: '507' }}),
	        new $.fn.oembed.OEmbedProvider("reelapp", "rich", ["reelapp\\.com/.+"], "http://www.reelapp.com/$1/embed",
	            {templateRegex: /.*com\/(\S{6}).*/, embedtag: {tag: 'iframe', width: '400', height: '338'}}),
	        new $.fn.oembed.OEmbedProvider("linkedin", "rich", ["linkedin.com/pub/.+"], "https://www.linkedin.com/cws/member/public_profile?public_profile_url=$1&format=inline&isFramed=true",
	            {templateRegex: /(.*)/, embedtag: {tag: 'iframe', width: '368px', height: 'auto'}}),
	        new $.fn.oembed.OEmbedProvider("timetoast", "rich", ["timetoast.com/timelines/[0-9]+"], "http://www.timetoast.com/flash/TimelineViewer.swf?passedTimelines=$1",
	            {templateRegex: /.*timelines\/([0-9]*)/, embedtag: { width: 550, height: 400}, nocache: 1}),
	        new $.fn.oembed.OEmbedProvider("pastebin", "rich", ["pastebin\\.com/[\\S]{8}"], "http://pastebin.com/embed_iframe.php?i=$1",
	            {templateRegex: /.*\/(\S{8}).*/, embedtag: {tag: 'iframe', width: '100%', height: 'auto'}}),
	        new $.fn.oembed.OEmbedProvider("mixlr", "rich", ["mixlr.com/.+"], "http://mixlr.com/embed/$1?autoplay=ae",
	            {templateRegex: /.*com\/([^\/]+).*/, embedtag: {tag: 'iframe', width: '100%', height: 'auto' }}),
	        new $.fn.oembed.OEmbedProvider("pastie", "rich", ["pastie\\.org/pastes/.+"], null, {yql: {xpath: '//pre[@class="textmate-source"]'}}),
	        new $.fn.oembed.OEmbedProvider("github", "rich", ["gist.github.com/.+"], "https://github.com/api/oembed"),
	        new $.fn.oembed.OEmbedProvider("github", "rich", ["github.com/[-.\\w@]+/[-.\\w@]+"], "https://api.github.com/repos/$1/$2?callback=?"
	            , {templateRegex: /.*\/([^\/]+)\/([^\/]+).*/,
	                templateData: function (data) {
	                    if (!data.data.html_url)return false;
	                    return  '<div class="oembedall-githubrepos"><h3><a href="' + data.data.html_url + '">' + data.data.name + '</a></h3><div class="oembedall-body"><p class="oembedall-description">' + data.data.description + '</p>'
	                    + '<p class="oembedall-updated-at">Last updated: ' + data.data.pushed_at + '</p></div><div class="oembedall-repo-stats"><p class="oembedall-language">' + data.data.language + '</p><p class="oembedall-watchers"><a title="Watchers" target="_blank" href="' + data.data.html_url + '/watchers">&#x25c9; ' + data.data.subscribers_count + '</a></p><p class="oembedall-forks"><a title="Forks" target="_blank" href="' + data.data.html_url + '/network">&#x0265; ' + data.data.forks + '</a></p></div></div>';
	                }
	            }),
	        new $.fn.oembed.OEmbedProvider("facebook", "rich", ["facebook.com"], null
	            , {templateRegex: /.*\/([^\/]+)\/([^\/]+).*/,
	                template: function (url) {
	                    // adding script directly to DOM to make sure that it is loaded correctly.
	                    if (!$.fn.oembed.facebokScriptHasBeenAdded) {
	                        $('<div id="fb-root"></div>').appendTo('body');
	                        var script = document.createElement('script');
	                        script.type = 'text/javascript';
	                        script.text = '(function(d, s, id) {var js, fjs = d.getElementsByTagName(s)[0];if (d.getElementById(id)) return;js = d.createElement(s); js.id = id;js.src = "//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.0";fjs.parentNode.insertBefore(js, fjs);}(document, "script", "facebook-jssdk"));';
	                        document.body.appendChild(script);
	                        $.fn.oembed.facebokScriptHasBeenAdded = true;
	                    }

	                    // returning template with url of facebook post.
	                    return '<div class="fb-post" data-href="' + url + '" data-width="520"><div class="fb-xfbml-parse-ignore"><a href="' + url + '"></div></div>';

	                }
	            }),
	        /*
	         // Saving old implementation of Facebook in case we will need it as example in the future.
	         new $.fn.oembed.OEmbedProvider("facebook", "rich", ["facebook.com/(people/[^\\/]+/\\d+|[^\\/]+$)"], "https://graph.facebook.com/$2$3/?callback=?"
	         ,{templateRegex:/.*facebook.com\/(people\/[^\/]+\/(\d+).*|([^\/]+$))/,
	         templateData : function(data){ if(!data.id)return false;
	         var out =  '<div class="oembedall-facebook1"><div class="oembedall-facebook2"><a href="http://www.facebook.com/">facebook</a> ';
	         if(data.from) out += '<a href="http://www.facebook.com/'+data.from.id+'">'+data.from.name+'</a>';
	         else if(data.link) out += '<a href="'+data.link+'">'+data.name+'</a>';
	         else if(data.username) out += '<a href="http://www.facebook.com/'+data.username+'">'+data.name+'</a>';
	         else out += '<a href="http://www.facebook.com/'+data.id+'">'+data.name+'</a>';
	         out += '</div><div class="oembedall-facebookBody"><div class="contents">';
	         if(data.picture) out += '<a href="'+data.link+'"><img src="'+data.picture+'"></a>';
	         else out += '<img src="https://graph.facebook.com/'+data.id+'/picture">';
	         if(data.from) out += '<a href="'+data.link+'">'+data.name+'</a>';
	         if(data.founded) out += 'Founded: <strong>'+data.founded+'</strong><br>';
	         if(data.category) out += 'Category: <strong>'+data.category+'</strong><br>';
	         if(data.website) out += 'Website: <strong><a href="'+data.website+'">'+data.website+'</a></strong><br>';
	         if(data.gender) out += 'Gender: <strong>'+data.gender+'</strong><br>';
	         if(data.description) out += data.description + '<br>';
	         out += '</div></div>';
	         return out;
	         }
	         }),
	         */
	        new $.fn.oembed.OEmbedProvider("stackoverflow", "rich", ["stackoverflow.com/questions/[\\d]+"], "http://api.stackoverflow.com/1.1/questions/$1?body=true&jsonp=?"
	            , {templateRegex: /.*questions\/([\d]+).*/,
	                templateData: function (data) {
	                    if (!data.questions)
	                        return false;
	                    var q = data.questions[0];
	                    var body = $(q.body).text();
	                    var out = '<div class="oembedall-stoqembed"><div class="oembedall-statscontainer"><div class="oembedall-statsarrow"></div><div class="oembedall-stats"><div class="oembedall-vote"><div class="oembedall-votes">'
	                        + '<span class="oembedall-vote-count-post"><strong>' + (q.up_vote_count - q.down_vote_count) + '</strong></span><div class="oembedall-viewcount">vote(s)</div></div>'
	                        + '</div><div class="oembedall-status"><strong>' + q.answer_count + '</strong>answer</div></div><div class="oembedall-views">' + q.view_count + ' view(s)</div></div>'
	                        + '<div class="oembedall-summary"><h3><a class="oembedall-question-hyperlink" href="http://stackoverflow.com/questions/' + q.question_id + '/">' + q.title + '</a></h3>'
	                        + '<div class="oembedall-excerpt">' + body.substring(0, 100) + '...</div><div class="oembedall-tags">';
	                    for (i in q.tags) {
	                        out += '<a title="" class="oembedall-post-tag" href="http://stackoverflow.com/questions/tagged/' + q.tags[i] + '">' + q.tags[i] + '</a>';
	                    }

	                    out += '</div><div class="oembedall-fr"><div class="oembedall-user-info"><div class="oembedall-user-gravatar32"><a href="http://stackoverflow.com/users/' + q.owner.user_id + '/' + q.owner.display_name + '">'
	                        + '<img width="32" height="32" alt="" src="https://www.gravatar.com/avatar/' + q.owner.email_hash + '?s=32&amp;d=identicon&amp;r=PG"></a></div><div class="oembedall-user-details">'
	                        + '<a href="http://stackoverflow.com/users/' + q.owner.user_id + '/' + q.owner.display_name + '">' + q.owner.display_name + '</a><br><span title="reputation score" class="oembedall-reputation-score">'
	                        + q.owner.reputation + '</span></div></div></div></div></div>';
	                    return out;
	                }
	            }),
	        new $.fn.oembed.OEmbedProvider("wordpress", "rich", ["wordpress\\.com/.+", "blogs\\.cnn\\.com/.+", "techcrunch\\.com/.+", "wp\\.me/.+"], "http://public-api.wordpress.com/oembed/1.0/?for=jquery-oembed-all"),
	        new $.fn.oembed.OEmbedProvider("screenr", "rich", ["screenr\.com"], "http://www.screenr.com/embed/$1",
	            {templateRegex: /.*\/([^\/]+).*/, embedtag: {tag: 'iframe', width: '650', height: 396}}) ,
	        new $.fn.oembed.OEmbedProvider("gigpans", "rich", ["gigapan\\.org/[-.\\w@]+/\\d+"], "http://gigapan.org/gigapans/$1/options/nosnapshots/iframe/flash.html",
	            {templateRegex: /.*\/(\d+)\/?.*/, embedtag: {tag: 'iframe', width: '100%', height: 400 }}),
	        new $.fn.oembed.OEmbedProvider("scribd", "rich", ["scribd\\.com/.+"], "http://www.scribd.com/embeds/$1/content?start_page=1&view_mode=list",
	            {templateRegex: /.*doc\/([^\/]+).*/, embedtag: {tag: 'iframe', width: '100%', height: 600}}),
	        new $.fn.oembed.OEmbedProvider("kickstarter", "rich", ["kickstarter\\.com/projects/.+"], "$1/widget/video.html",
	            {templateRegex: /([^\?]+).*/, embedtag: {tag: 'iframe', width: '220', height: 380}, nocache: 1}),
	        new $.fn.oembed.OEmbedProvider("amazon", "rich", ["amzn.com/B+", "amazon.com.*/(B\\S+)($|\\/.*)"], "http://rcm.amazon.com/e/cm?t=_APIKEY_&o=1&p=8&l=as1&asins=$1&ref=qf_br_asin_til&fc1=000000&IS2=1&lt1=_blank&m=amazon&lc1=0000FF&bc1=000000&bg1=FFFFFF&f=ifr",
	            {
	                apikey: true,
	                templateRegex: /.*\/(B[0-9A-Z]+)($|\/.*)/,
	                embedtag: {
	                    tag: 'iframe',
	                    width: '120px',
	                    height: '240px'}
	            }),
	        new $.fn.oembed.OEmbedProvider("slideshare", "rich", ["slideshare\.net"], "//www.slideshare.net/api/oembed/2", {format: 'jsonp'}),
	        new $.fn.oembed.OEmbedProvider("roomsharejp", "rich", ["roomshare\\.jp/(en/)?post/.*"], "http://roomshare.jp/oembed.json"),
	        new $.fn.oembed.OEmbedProvider("lanyard", "rich", ["lanyrd.com/\\d+/.+"], null,
	            {
	                yql: {
	                    xpath: '(//div[@class="primary"])[1]',
	                    from: 'htmlstring',
	                    datareturn: function (results) {
	                        if (!results.result)
	                            return false;
	                        return '<div class="oembedall-lanyard">' + results.result + '</div>';
	                    }
	                }
	            }),
	        new $.fn.oembed.OEmbedProvider("asciiartfarts", "rich", ["asciiartfarts.com/\\d+.html"], null,
	            {
	                yql: {
	                    xpath: '//pre/font',
	                    from: 'htmlstring',
	                    datareturn: function (results) {
	                        if (!results.result)
	                            return false;
	                        return '<pre style="background-color:#000;">' + results.result + '</div>';
	                    }
	                }
	            }),
	        new $.fn.oembed.OEmbedProvider("coveritlive", "rich", ["coveritlive.com/"], null, {
	            templateRegex: /(.*)/,
	            template: '<iframe src="$1" allowtransparency="true" scrolling="no" width="615px" frameborder="0" height="625px"></iframe>'}),
	        new $.fn.oembed.OEmbedProvider("polldaddy", "rich", ["polldaddy.com/"], null, {
	            templateRegex: /(?:https?:\/\/w?w?w?.?polldaddy.com\/poll\/)([0-9]*)\//,
	            template: '<script async type="text/javascript" charset="utf-8" src="http://static.polldaddy.com/p/$1.js"></script>',
	            nocache: 1
	        }),
	        new $.fn.oembed.OEmbedProvider("360io", "rich", ["360\\.io/.+"], "http://360.io/$1", {templateRegex: /.*360\.io\/(\w+).*/, embedtag: {tag: 'iframe', width: 480, height: 360 }, nocache: 1}),
	        new $.fn.oembed.OEmbedProvider("bubbli", "rich", ["on\\.bubb\\.li/.+"], "http://on.bubb.li/$1", {templateRegex: /.*on\.bubb\.li\/(\w+).*/, embedtag: {tag: 'iframe', width: 480, height: 360}, nocache: 1 }),
	        new $.fn.oembed.OEmbedProvider("cloudup", "rich", ["cloudup\\.com/.+"], "http://cloudup.com/$1?chromeless", {templateRegex: [/.*cloudup\.com\/(\w+).*/], embedtag: {tag: 'iframe', width: 480, height: 360 }}),
	        new $.fn.oembed.OEmbedProvider("codepen", "rich", ["codepen.io/.+"], "http://codepen.io/$1/embed/$2", {templateRegex: [/.*io\/(\w+)\/pen\/(\w+).*/, /.*io\/(\w+)\/full\/(\w+).*/], embedtag: {tag: 'iframe', width: '100%', height: '300'}, nocache: 1 }),
	        new $.fn.oembed.OEmbedProvider("googleviews", "rich", ["(.*maps\\.google\\.com\\/maps\\?).+(output=svembed).+(cbp=(.*)).*"], "https://maps.google.com/maps?layer=c&panoid=$3&ie=UTF8&source=embed&output=svembed&cbp=$5", {templateRegex: /(.*maps\.google\.com\/maps\?).+(panoid=(\w+)&).*(cbp=(.*)).*/, embedtag: {tag: 'iframe', width: 480, height: 360}, nocache: 1 }),
	        new $.fn.oembed.OEmbedProvider("googlemaps", "rich", ["google\\.com\/maps\/place/.+"], "http://maps.google.com/maps?t=m&q=$1&output=embed", {templateRegex: /.*google\.com\/maps\/place\/([\w\+]*)\/.*/, embedtag: {tag: 'iframe', width: 480, height: 360 }, nocache: 1}),
	        new $.fn.oembed.OEmbedProvider("imajize", "rich", ["embed\\.imajize\\.com/.+"], "http://embed.imajize.com/$1", {templateRegex: /.*embed\.imajize\.com\/(.*)/, embedtag: {tag: 'iframe', width: 480, height: 360 }, nocache: 1}),
	        new $.fn.oembed.OEmbedProvider("mapjam", "rich", ["mapjam\\.com/.+"], "http://www.mapjam.com/$1", {templateRegex: /.*mapjam\.com\/(.*)/, embedtag: {tag: 'iframe', width: 480, height: 360 }, nocache: 1}),
	        new $.fn.oembed.OEmbedProvider("polar", "rich", ["polarb\\.com/.+"], "http://assets-polarb-com.a.ssl.fastly.net/api/v4/publishers/unknown/embedded_polls/iframe?poll_id=$1", {templateRegex: /.*polarb\.com\/polls\/(\w+).*/, embedtag: {tag: 'iframe', width: 480, height: 360 }, nocache: 1}),
	        new $.fn.oembed.OEmbedProvider("ponga", "rich", ["ponga\\.com/.+"], "https://www.ponga.com/embedded?id=$1", {templateRegex: [/.*ponga\.com\/embedded\?id=(\w+).*/, /.*ponga\.com\/(\w+).*/], embedtag: {tag: 'iframe', width: 480, height: 360 }, nocache: 1}),

	        //Use Open Graph Where applicable
	        new $.fn.oembed.OEmbedProvider("opengraph", "rich", [".*"], null,
	            {
	                yql: {
	                    xpath: "//meta|//title|//link",
	                    from: 'html',
	                    datareturn: function (results) {
	                        if (!results['og:title'] && results['title'] && results['description'])
	                            results['og:title'] = results['title'];

	                        if (!results['og:title'] && !results['title'])
	                            return false;

	                        var code = $('<p/>');
	                        if (results['og:video']) {
	                            var embed = $('<embed src="' + results['og:video'] + '"/>');
	                            embed.attr('type', results['og:video:type'] || "application/x-shockwave-flash")
	                                .css('max-height', settings.maxHeight || 'auto')
	                                .css('max-width', settings.maxWidth || 'auto');
	                            if (results['og:video:width'])
	                                embed.attr('width', results['og:video:width']);
	                            if (results['og:video:height'])
	                                embed.attr('height', results['og:video:height']);
	                            code.append(embed);
	                        } else if (results['og:image']) {
	                            var img = $('<img src="' + results['og:image'].replace("?fb", "") + '">');
	                            img.css('max-height', settings.maxHeight || 'auto').css('max-width', settings.maxWidth || 'auto');

	                            var width, height = null;
	                            if (results['og:image:width']) {
	                                width = results['og:image:width'].match(/\d+$/);
	                                width = parseInt(width, 10);
	                            }
	                            if (results['og:image:height']) {
	                                height = results['og:image:height'].match(/\d+$/);
	                                height = parseInt(height, 10);
	                            }
	                            if (width && settings.maxWidth && width > settings.maxWidth && height) {
	                                var ratio = height / width;
	                                width = settings.maxWidth;
	                                height = ratio * width;
	                            }
	                            if (height && settings.maxHeight && height > settings.maxHeight && width) {
	                                var ratio = width / height;
	                                height = settings.maxHeight;
	                                width = ratio * height;
	                            }

	                            if (width)
	                                img.attr('width', width);
	                            if (height)
	                                img.attr('height', height);
	                            code.append(img);
	                        }

	                        if (results['og:title'])
	                            code.append('<b>' + results['og:title'] + '</b><br/>');

	                        if (results['og:description'])
	                            code.append(results['og:description'] + '<br/>');
	                        else if (results['description'])
	                            code.append(results['description'] + '<br/>');

	                        return code;
	                    }
	                }
	            }
	        )

	    ];
	})(jQuery);
	//This is needed for gravatar :(
	String.prototype.md5=function(){var a=function(a,b){var c=(a&65535)+(b&65535);var d=(a>>16)+(b>>16)+(c>>16);return d<<16|c&65535};var b=function(a,b){return a<<b|a>>>32-b};var c=function(c,d,e,f,g,h){return a(b(a(a(d,c),a(f,h)),g),e)};var d=function(a,b,d,e,f,g,h){return c(b&d|~b&e,a,b,f,g,h)};var e=function(a,b,d,e,f,g,h){return c(b&e|d&~e,a,b,f,g,h)};var f=function(a,b,d,e,f,g,h){return c(b^d^e,a,b,f,g,h)};var g=function(a,b,d,e,f,g,h){return c(d^(b|~e),a,b,f,g,h)};var h=function(b){var c,h,i,j,k,l=b.length;var m=1732584193;var n=-271733879;var o=-1732584194;var p=271733878;for(k=0;k<l;k+=16){c=m;h=n;i=o;j=p;m=d(m,n,o,p,b[k+0],7,-680876936);p=d(p,m,n,o,b[k+1],12,-389564586);o=d(o,p,m,n,b[k+2],17,606105819);n=d(n,o,p,m,b[k+3],22,-1044525330);m=d(m,n,o,p,b[k+4],7,-176418897);p=d(p,m,n,o,b[k+5],12,1200080426);o=d(o,p,m,n,b[k+6],17,-1473231341);n=d(n,o,p,m,b[k+7],22,-45705983);m=d(m,n,o,p,b[k+8],7,1770035416);p=d(p,m,n,o,b[k+9],12,-1958414417);o=d(o,p,m,n,b[k+10],17,-42063);n=d(n,o,p,m,b[k+11],22,-1990404162);m=d(m,n,o,p,b[k+12],7,1804603682);p=d(p,m,n,o,b[k+13],12,-40341101);o=d(o,p,m,n,b[k+14],17,-1502002290);n=d(n,o,p,m,b[k+15],22,1236535329);m=e(m,n,o,p,b[k+1],5,-165796510);p=e(p,m,n,o,b[k+6],9,-1069501632);o=e(o,p,m,n,b[k+11],14,643717713);n=e(n,o,p,m,b[k+0],20,-373897302);m=e(m,n,o,p,b[k+5],5,-701558691);p=e(p,m,n,o,b[k+10],9,38016083);o=e(o,p,m,n,b[k+15],14,-660478335);n=e(n,o,p,m,b[k+4],20,-405537848);m=e(m,n,o,p,b[k+9],5,568446438);p=e(p,m,n,o,b[k+14],9,-1019803690);o=e(o,p,m,n,b[k+3],14,-187363961);n=e(n,o,p,m,b[k+8],20,1163531501);m=e(m,n,o,p,b[k+13],5,-1444681467);p=e(p,m,n,o,b[k+2],9,-51403784);o=e(o,p,m,n,b[k+7],14,1735328473);n=e(n,o,p,m,b[k+12],20,-1926607734);m=f(m,n,o,p,b[k+5],4,-378558);p=f(p,m,n,o,b[k+8],11,-2022574463);o=f(o,p,m,n,b[k+11],16,1839030562);n=f(n,o,p,m,b[k+14],23,-35309556);m=f(m,n,o,p,b[k+1],4,-1530992060);p=f(p,m,n,o,b[k+4],11,1272893353);o=f(o,p,m,n,b[k+7],16,-155497632);n=f(n,o,p,m,b[k+10],23,-1094730640);m=f(m,n,o,p,b[k+13],4,681279174);p=f(p,m,n,o,b[k+0],11,-358537222);o=f(o,p,m,n,b[k+3],16,-722521979);n=f(n,o,p,m,b[k+6],23,76029189);m=f(m,n,o,p,b[k+9],4,-640364487);p=f(p,m,n,o,b[k+12],11,-421815835);o=f(o,p,m,n,b[k+15],16,530742520);n=f(n,o,p,m,b[k+2],23,-995338651);m=g(m,n,o,p,b[k+0],6,-198630844);p=g(p,m,n,o,b[k+7],10,1126891415);o=g(o,p,m,n,b[k+14],15,-1416354905);n=g(n,o,p,m,b[k+5],21,-57434055);m=g(m,n,o,p,b[k+12],6,1700485571);p=g(p,m,n,o,b[k+3],10,-1894986606);o=g(o,p,m,n,b[k+10],15,-1051523);n=g(n,o,p,m,b[k+1],21,-2054922799);m=g(m,n,o,p,b[k+8],6,1873313359);p=g(p,m,n,o,b[k+15],10,-30611744);o=g(o,p,m,n,b[k+6],15,-1560198380);n=g(n,o,p,m,b[k+13],21,1309151649);m=g(m,n,o,p,b[k+4],6,-145523070);p=g(p,m,n,o,b[k+11],10,-1120210379);o=g(o,p,m,n,b[k+2],15,718787259);n=g(n,o,p,m,b[k+9],21,-343485551);m=a(m,c);n=a(n,h);o=a(o,i);p=a(p,j)}return[m,n,o,p]};var i=function(a){var b="0123456789abcdef",c="",d,e=a.length*4;for(d=0;d<e;d++){c+=b.charAt(a[d>>2]>>d%4*8+4&15)+b.charAt(a[d>>2]>>d%4*8&15)}return c};var j=function(a){var b=(a.length+8>>6)+1;var c=[],d,e=b*16,f,g=a.length;for(d=0;d<e;d++){c.push(0)}for(f=0;f<g;f++){c[f>>2]|=(a.charCodeAt(f)&255)<<f%4*8}c[f>>2]|=128<<f%4*8;c[b*16-2]=g*8;return c};return i(h(j(this)))};


	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(196)))

/***/ },

/***/ 204:
/***/ function(module, exports) {

	module.exports = jQuery;

/***/ }

/******/ });
//# sourceMappingURL=1-vendor.js.map