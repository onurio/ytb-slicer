var videos = require("./videos.json");
var Max = require("max-api");
var $bFvJb$buffer = require("buffer");
var $bFvJb$string_decoder = require("string_decoder");
var $bFvJb$process = require("process");
var $bFvJb$http = require("http");
var $bFvJb$https = require("https");
var $bFvJb$stream = require("stream");
var $bFvJb$path = require("path");
var $bFvJb$util = require("util");
var $bFvJb$events = require("events");
var $bFvJb$child_process = require("child_process");
var $bFvJb$os = require("os");
var $bFvJb$fs = require("fs");
var $bFvJb$querystring = require("querystring");
var $bFvJb$timers = require("timers");
var $bFvJb$vm = require("vm");

var $parcel$global =
  typeof globalThis !== "undefined"
    ? globalThis
    : typeof self !== "undefined"
    ? self
    : typeof window !== "undefined"
    ? window
    : typeof global !== "undefined"
    ? global
    : {};
function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {
    get: v,
    set: s,
    enumerable: true,
    configurable: true,
  });
}
var $parcel$modules = {};
var $parcel$inits = {};

var parcelRequire = $parcel$global["parcelRequire99ba"];
if (parcelRequire == null) {
  parcelRequire = function (id) {
    if (id in $parcel$modules) {
      return $parcel$modules[id].exports;
    }
    if (id in $parcel$inits) {
      var init = $parcel$inits[id];
      delete $parcel$inits[id];
      var module = { id: id, exports: {} };
      $parcel$modules[id] = module;
      init.call(module.exports, module, module.exports);
      return module.exports;
    }
    var err = new Error("Cannot find module '" + id + "'");
    err.code = "MODULE_NOT_FOUND";
    throw err;
  };

  parcelRequire.register = function register(id, init) {
    $parcel$inits[id] = init;
  };

  $parcel$global["parcelRequire99ba"] = parcelRequire;
}
parcelRequire.register("1Vc1h", function (module, exports) {
  var $1664702c653a110c$require$Buffer = $bFvJb$buffer.Buffer;

  (function (sax) {
    sax.parser = function (strict, opt) {
      return new SAXParser(strict, opt);
    };
    sax.SAXParser = SAXParser;
    sax.SAXStream = SAXStream;
    sax.createStream = createStream;
    // When we pass the MAX_BUFFER_LENGTH position, start checking for buffer overruns.
    // When we check, schedule the next check for MAX_BUFFER_LENGTH - (max(buffer lengths)),
    // since that's the earliest that a buffer overrun could occur.  This way, checks are
    // as rare as required, but as often as necessary to ensure never crossing this bound.
    // Furthermore, buffers are only tested at most once per write(), so passing a very
    // large string into write() might have undesirable effects, but this is manageable by
    // the caller, so it is assumed to be safe.  Thus, a call to write() may, in the extreme
    // edge case, result in creating at most one complete copy of the string passed in.
    // Set to Infinity to have unlimited buffers.
    sax.MAX_BUFFER_LENGTH = 65536;
    var buffers = [
      "comment",
      "sgmlDecl",
      "textNode",
      "tagName",
      "doctype",
      "procInstName",
      "procInstBody",
      "entity",
      "attribName",
      "attribValue",
      "cdata",
      "script",
    ];
    sax.EVENTS = [
      "text",
      "processinginstruction",
      "sgmldeclaration",
      "doctype",
      "comment",
      "opentagstart",
      "attribute",
      "opentag",
      "closetag",
      "opencdata",
      "cdata",
      "closecdata",
      "error",
      "end",
      "ready",
      "script",
      "opennamespace",
      "closenamespace",
    ];
    function SAXParser(strict, opt) {
      if (!(this instanceof SAXParser)) return new SAXParser(strict, opt);
      var parser = this;
      clearBuffers(parser);
      parser.q = parser.c = "";
      parser.bufferCheckPosition = sax.MAX_BUFFER_LENGTH;
      parser.opt = opt || {};
      parser.opt.lowercase = parser.opt.lowercase || parser.opt.lowercasetags;
      parser.looseCase = parser.opt.lowercase ? "toLowerCase" : "toUpperCase";
      parser.tags = [];
      parser.closed = parser.closedRoot = parser.sawRoot = false;
      parser.tag = parser.error = null;
      parser.strict = !!strict;
      parser.noscript = !!(strict || parser.opt.noscript);
      parser.state = S.BEGIN;
      parser.strictEntities = parser.opt.strictEntities;
      parser.ENTITIES = parser.strictEntities
        ? Object.create(sax.XML_ENTITIES)
        : Object.create(sax.ENTITIES);
      parser.attribList = [];
      // namespaces form a prototype chain.
      // it always points at the current tag,
      // which protos to its parent tag.
      if (parser.opt.xmlns) parser.ns = Object.create(rootNS);
      // mostly just for error reporting
      parser.trackPosition = parser.opt.position !== false;
      if (parser.trackPosition)
        parser.position = parser.line = parser.column = 0;
      emit(parser, "onready");
    }
    if (!Object.create)
      Object.create = function (o) {
        function F() {}
        F.prototype = o;
        var newf = new F();
        return newf;
      };
    if (!Object.keys)
      Object.keys = function (o) {
        var a = [];
        for (var i in o) if (o.hasOwnProperty(i)) a.push(i);
        return a;
      };
    function checkBufferLength(parser) {
      var maxAllowed = Math.max(sax.MAX_BUFFER_LENGTH, 10);
      var maxActual = 0;
      for (var i = 0, l = buffers.length; i < l; i++) {
        var len = parser[buffers[i]].length;
        if (len > maxAllowed)
          // Text/cdata nodes can get big, and since they're buffered,
          // we can get here under normal conditions.
          // Avoid issues by emitting the text node now,
          // so at least it won't get any bigger.
          switch (buffers[i]) {
            case "textNode":
              closeText(parser);
              break;
            case "cdata":
              emitNode(parser, "oncdata", parser.cdata);
              parser.cdata = "";
              break;
            case "script":
              emitNode(parser, "onscript", parser.script);
              parser.script = "";
              break;
            default:
              error(parser, "Max buffer length exceeded: " + buffers[i]);
          }
        maxActual = Math.max(maxActual, len);
      }
      // schedule the next check for the earliest possible buffer overrun.
      var m = sax.MAX_BUFFER_LENGTH - maxActual;
      parser.bufferCheckPosition = m + parser.position;
    }
    function clearBuffers(parser) {
      for (var i = 0, l = buffers.length; i < l; i++) parser[buffers[i]] = "";
    }
    function flushBuffers(parser) {
      closeText(parser);
      if (parser.cdata !== "") {
        emitNode(parser, "oncdata", parser.cdata);
        parser.cdata = "";
      }
      if (parser.script !== "") {
        emitNode(parser, "onscript", parser.script);
        parser.script = "";
      }
    }
    SAXParser.prototype = {
      end: function () {
        end(this);
      },
      write: write,
      resume: function () {
        this.error = null;
        return this;
      },
      close: function () {
        return this.write(null);
      },
      flush: function () {
        flushBuffers(this);
      },
    };
    var Stream;
    try {
      Stream = $1664702c653a110c$import$e5e1c8a3329a23d5$6a4eb2e7fc9e8903;
    } catch (ex) {
      Stream = function () {};
    }
    var streamWraps = sax.EVENTS.filter(function (ev) {
      return ev !== "error" && ev !== "end";
    });
    function createStream(strict, opt) {
      return new SAXStream(strict, opt);
    }
    function SAXStream(strict, opt) {
      if (!(this instanceof SAXStream)) return new SAXStream(strict, opt);
      Stream.apply(this);
      this._parser = new SAXParser(strict, opt);
      this.writable = true;
      this.readable = true;
      var me = this;
      this._parser.onend = function () {
        me.emit("end");
      };
      this._parser.onerror = function (er) {
        me.emit("error", er);
        // if didn't throw, then means error was handled.
        // go ahead and clear error, so we can write again.
        me._parser.error = null;
      };
      this._decoder = null;
      streamWraps.forEach(function (ev) {
        Object.defineProperty(me, "on" + ev, {
          get: function () {
            return me._parser["on" + ev];
          },
          set: function (h) {
            if (!h) {
              me.removeAllListeners(ev);
              me._parser["on" + ev] = h;
              return h;
            }
            me.on(ev, h);
          },
          enumerable: true,
          configurable: false,
        });
      });
    }
    SAXStream.prototype = Object.create(Stream.prototype, {
      constructor: {
        value: SAXStream,
      },
    });
    SAXStream.prototype.write = function (data) {
      if (
        typeof $1664702c653a110c$require$Buffer === "function" &&
        typeof $1664702c653a110c$require$Buffer.isBuffer === "function" &&
        $1664702c653a110c$require$Buffer.isBuffer(data)
      ) {
        if (!this._decoder) {
          var SD = $bFvJb$string_decoder.StringDecoder;
          this._decoder = new SD("utf8");
        }
        data = this._decoder.write(data);
      }
      this._parser.write(data.toString());
      this.emit("data", data);
      return true;
    };
    SAXStream.prototype.end = function (chunk) {
      if (chunk && chunk.length) this.write(chunk);
      this._parser.end();
      return true;
    };
    SAXStream.prototype.on = function (ev, handler) {
      var me = this;
      if (!me._parser["on" + ev] && streamWraps.indexOf(ev) !== -1)
        me._parser["on" + ev] = function () {
          var args =
            arguments.length === 1
              ? [arguments[0]]
              : Array.apply(null, arguments);
          args.splice(0, 0, ev);
          me.emit.apply(me, args);
        };
      return Stream.prototype.on.call(me, ev, handler);
    };
    // this really needs to be replaced with character classes.
    // XML allows all manner of ridiculous numbers and digits.
    var CDATA = "[CDATA[";
    var DOCTYPE = "DOCTYPE";
    var XML_NAMESPACE = "http://www.w3.org/XML/1998/namespace";
    var XMLNS_NAMESPACE = "http://www.w3.org/2000/xmlns/";
    var rootNS = {
      xml: XML_NAMESPACE,
      xmlns: XMLNS_NAMESPACE,
    };
    // http://www.w3.org/TR/REC-xml/#NT-NameStartChar
    // This implementation works on strings, a single character at a time
    // as such, it cannot ever support astral-plane characters (10000-EFFFF)
    // without a significant breaking change to either this  parser, or the
    // JavaScript language.  Implementation of an emoji-capable xml parser
    // is left as an exercise for the reader.
    var nameStart =
      /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/;
    var nameBody =
      /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;
    var entityStart =
      /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/;
    var entityBody =
      /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;
    function isWhitespace(c) {
      return c === " " || c === "\n" || c === "\r" || c === "	";
    }
    function isQuote(c) {
      return c === '"' || c === "'";
    }
    function isAttribEnd(c) {
      return c === ">" || isWhitespace(c);
    }
    function isMatch(regex, c) {
      return regex.test(c);
    }
    function notMatch(regex, c) {
      return !isMatch(regex, c);
    }
    var S = 0;
    sax.STATE = {
      BEGIN: S++,
      BEGIN_WHITESPACE: S++,
      TEXT: S++,
      TEXT_ENTITY: S++,
      OPEN_WAKA: S++,
      SGML_DECL: S++,
      SGML_DECL_QUOTED: S++,
      DOCTYPE: S++,
      DOCTYPE_QUOTED: S++,
      DOCTYPE_DTD: S++,
      DOCTYPE_DTD_QUOTED: S++,
      COMMENT_STARTING: S++,
      COMMENT: S++,
      COMMENT_ENDING: S++,
      COMMENT_ENDED: S++,
      CDATA: S++,
      CDATA_ENDING: S++,
      CDATA_ENDING_2: S++,
      PROC_INST: S++,
      PROC_INST_BODY: S++,
      PROC_INST_ENDING: S++,
      OPEN_TAG: S++,
      OPEN_TAG_SLASH: S++,
      ATTRIB: S++,
      ATTRIB_NAME: S++,
      ATTRIB_NAME_SAW_WHITE: S++,
      ATTRIB_VALUE: S++,
      ATTRIB_VALUE_QUOTED: S++,
      ATTRIB_VALUE_CLOSED: S++,
      ATTRIB_VALUE_UNQUOTED: S++,
      ATTRIB_VALUE_ENTITY_Q: S++,
      ATTRIB_VALUE_ENTITY_U: S++,
      CLOSE_TAG: S++,
      CLOSE_TAG_SAW_WHITE: S++,
      SCRIPT: S++,
      SCRIPT_ENDING: S++, // <script> ... <
    };
    sax.XML_ENTITIES = {
      amp: "&",
      gt: ">",
      lt: "<",
      quot: '"',
      apos: "'",
    };
    sax.ENTITIES = {
      amp: "&",
      gt: ">",
      lt: "<",
      quot: '"',
      apos: "'",
      AElig: 198,
      Aacute: 193,
      Acirc: 194,
      Agrave: 192,
      Aring: 197,
      Atilde: 195,
      Auml: 196,
      Ccedil: 199,
      ETH: 208,
      Eacute: 201,
      Ecirc: 202,
      Egrave: 200,
      Euml: 203,
      Iacute: 205,
      Icirc: 206,
      Igrave: 204,
      Iuml: 207,
      Ntilde: 209,
      Oacute: 211,
      Ocirc: 212,
      Ograve: 210,
      Oslash: 216,
      Otilde: 213,
      Ouml: 214,
      THORN: 222,
      Uacute: 218,
      Ucirc: 219,
      Ugrave: 217,
      Uuml: 220,
      Yacute: 221,
      aacute: 225,
      acirc: 226,
      aelig: 230,
      agrave: 224,
      aring: 229,
      atilde: 227,
      auml: 228,
      ccedil: 231,
      eacute: 233,
      ecirc: 234,
      egrave: 232,
      eth: 240,
      euml: 235,
      iacute: 237,
      icirc: 238,
      igrave: 236,
      iuml: 239,
      ntilde: 241,
      oacute: 243,
      ocirc: 244,
      ograve: 242,
      oslash: 248,
      otilde: 245,
      ouml: 246,
      szlig: 223,
      thorn: 254,
      uacute: 250,
      ucirc: 251,
      ugrave: 249,
      uuml: 252,
      yacute: 253,
      yuml: 255,
      copy: 169,
      reg: 174,
      nbsp: 160,
      iexcl: 161,
      cent: 162,
      pound: 163,
      curren: 164,
      yen: 165,
      brvbar: 166,
      sect: 167,
      uml: 168,
      ordf: 170,
      laquo: 171,
      not: 172,
      shy: 173,
      macr: 175,
      deg: 176,
      plusmn: 177,
      sup1: 185,
      sup2: 178,
      sup3: 179,
      acute: 180,
      micro: 181,
      para: 182,
      middot: 183,
      cedil: 184,
      ordm: 186,
      raquo: 187,
      frac14: 188,
      frac12: 189,
      frac34: 190,
      iquest: 191,
      times: 215,
      divide: 247,
      OElig: 338,
      oelig: 339,
      Scaron: 352,
      scaron: 353,
      Yuml: 376,
      fnof: 402,
      circ: 710,
      tilde: 732,
      Alpha: 913,
      Beta: 914,
      Gamma: 915,
      Delta: 916,
      Epsilon: 917,
      Zeta: 918,
      Eta: 919,
      Theta: 920,
      Iota: 921,
      Kappa: 922,
      Lambda: 923,
      Mu: 924,
      Nu: 925,
      Xi: 926,
      Omicron: 927,
      Pi: 928,
      Rho: 929,
      Sigma: 931,
      Tau: 932,
      Upsilon: 933,
      Phi: 934,
      Chi: 935,
      Psi: 936,
      Omega: 937,
      alpha: 945,
      beta: 946,
      gamma: 947,
      delta: 948,
      epsilon: 949,
      zeta: 950,
      eta: 951,
      theta: 952,
      iota: 953,
      kappa: 954,
      lambda: 955,
      mu: 956,
      nu: 957,
      xi: 958,
      omicron: 959,
      pi: 960,
      rho: 961,
      sigmaf: 962,
      sigma: 963,
      tau: 964,
      upsilon: 965,
      phi: 966,
      chi: 967,
      psi: 968,
      omega: 969,
      thetasym: 977,
      upsih: 978,
      piv: 982,
      ensp: 8194,
      emsp: 8195,
      thinsp: 8201,
      zwnj: 8204,
      zwj: 8205,
      lrm: 8206,
      rlm: 8207,
      ndash: 8211,
      mdash: 8212,
      lsquo: 8216,
      rsquo: 8217,
      sbquo: 8218,
      ldquo: 8220,
      rdquo: 8221,
      bdquo: 8222,
      dagger: 8224,
      Dagger: 8225,
      bull: 8226,
      hellip: 8230,
      permil: 8240,
      prime: 8242,
      Prime: 8243,
      lsaquo: 8249,
      rsaquo: 8250,
      oline: 8254,
      frasl: 8260,
      euro: 8364,
      image: 8465,
      weierp: 8472,
      real: 8476,
      trade: 8482,
      alefsym: 8501,
      larr: 8592,
      uarr: 8593,
      rarr: 8594,
      darr: 8595,
      harr: 8596,
      crarr: 8629,
      lArr: 8656,
      uArr: 8657,
      rArr: 8658,
      dArr: 8659,
      hArr: 8660,
      forall: 8704,
      part: 8706,
      exist: 8707,
      empty: 8709,
      nabla: 8711,
      isin: 8712,
      notin: 8713,
      ni: 8715,
      prod: 8719,
      sum: 8721,
      minus: 8722,
      lowast: 8727,
      radic: 8730,
      prop: 8733,
      infin: 8734,
      ang: 8736,
      and: 8743,
      or: 8744,
      cap: 8745,
      cup: 8746,
      int: 8747,
      there4: 8756,
      sim: 8764,
      cong: 8773,
      asymp: 8776,
      ne: 8800,
      equiv: 8801,
      le: 8804,
      ge: 8805,
      sub: 8834,
      sup: 8835,
      nsub: 8836,
      sube: 8838,
      supe: 8839,
      oplus: 8853,
      otimes: 8855,
      perp: 8869,
      sdot: 8901,
      lceil: 8968,
      rceil: 8969,
      lfloor: 8970,
      rfloor: 8971,
      lang: 9001,
      rang: 9002,
      loz: 9674,
      spades: 9824,
      clubs: 9827,
      hearts: 9829,
      diams: 9830,
    };
    Object.keys(sax.ENTITIES).forEach(function (key) {
      var e = sax.ENTITIES[key];
      var s = typeof e === "number" ? String.fromCharCode(e) : e;
      sax.ENTITIES[key] = s;
    });
    for (var s in sax.STATE) sax.STATE[sax.STATE[s]] = s;
    // shorthand
    S = sax.STATE;
    function emit(parser, event, data) {
      parser[event] && parser[event](data);
    }
    function emitNode(parser, nodeType, data) {
      if (parser.textNode) closeText(parser);
      emit(parser, nodeType, data);
    }
    function closeText(parser) {
      parser.textNode = textopts(parser.opt, parser.textNode);
      if (parser.textNode) emit(parser, "ontext", parser.textNode);
      parser.textNode = "";
    }
    function textopts(opt, text) {
      if (opt.trim) text = text.trim();
      if (opt.normalize) text = text.replace(/\s+/g, " ");
      return text;
    }
    function error(parser, er) {
      closeText(parser);
      if (parser.trackPosition)
        er +=
          "\nLine: " +
          parser.line +
          "\nColumn: " +
          parser.column +
          "\nChar: " +
          parser.c;
      er = new Error(er);
      parser.error = er;
      emit(parser, "onerror", er);
      return parser;
    }
    function end(parser) {
      if (parser.sawRoot && !parser.closedRoot)
        strictFail(parser, "Unclosed root tag");
      if (
        parser.state !== S.BEGIN &&
        parser.state !== S.BEGIN_WHITESPACE &&
        parser.state !== S.TEXT
      )
        error(parser, "Unexpected end");
      closeText(parser);
      parser.c = "";
      parser.closed = true;
      emit(parser, "onend");
      SAXParser.call(parser, parser.strict, parser.opt);
      return parser;
    }
    function strictFail(parser, message) {
      if (typeof parser !== "object" || !(parser instanceof SAXParser))
        throw new Error("bad call to strictFail");
      if (parser.strict) error(parser, message);
    }
    function newTag(parser) {
      if (!parser.strict) parser.tagName = parser.tagName[parser.looseCase]();
      var parent = parser.tags[parser.tags.length - 1] || parser;
      var tag = (parser.tag = {
        name: parser.tagName,
        attributes: {},
      });
      // will be overridden if tag contails an xmlns="foo" or xmlns:foo="bar"
      if (parser.opt.xmlns) tag.ns = parent.ns;
      parser.attribList.length = 0;
      emitNode(parser, "onopentagstart", tag);
    }
    function qname(name, attribute) {
      var i = name.indexOf(":");
      var qualName = i < 0 ? ["", name] : name.split(":");
      var prefix = qualName[0];
      var local = qualName[1];
      // <x "xmlns"="http://foo">
      if (attribute && name === "xmlns") {
        prefix = "xmlns";
        local = "";
      }
      return {
        prefix: prefix,
        local: local,
      };
    }
    function attrib(parser) {
      if (!parser.strict)
        parser.attribName = parser.attribName[parser.looseCase]();
      if (
        parser.attribList.indexOf(parser.attribName) !== -1 ||
        parser.tag.attributes.hasOwnProperty(parser.attribName)
      ) {
        parser.attribName = parser.attribValue = "";
        return;
      }
      if (parser.opt.xmlns) {
        var qn = qname(parser.attribName, true);
        var prefix = qn.prefix;
        var local = qn.local;
        if (prefix === "xmlns") {
          // namespace binding attribute. push the binding into scope
          if (local === "xml" && parser.attribValue !== XML_NAMESPACE)
            strictFail(
              parser,
              "xml: prefix must be bound to " +
                XML_NAMESPACE +
                "\n" +
                "Actual: " +
                parser.attribValue
            );
          else if (local === "xmlns" && parser.attribValue !== XMLNS_NAMESPACE)
            strictFail(
              parser,
              "xmlns: prefix must be bound to " +
                XMLNS_NAMESPACE +
                "\n" +
                "Actual: " +
                parser.attribValue
            );
          else {
            var tag = parser.tag;
            var parent = parser.tags[parser.tags.length - 1] || parser;
            if (tag.ns === parent.ns) tag.ns = Object.create(parent.ns);
            tag.ns[local] = parser.attribValue;
          }
        }
        // defer onattribute events until all attributes have been seen
        // so any new bindings can take effect. preserve attribute order
        // so deferred events can be emitted in document order
        parser.attribList.push([parser.attribName, parser.attribValue]);
      } else {
        // in non-xmlns mode, we can emit the event right away
        parser.tag.attributes[parser.attribName] = parser.attribValue;
        emitNode(parser, "onattribute", {
          name: parser.attribName,
          value: parser.attribValue,
        });
      }
      parser.attribName = parser.attribValue = "";
    }
    function openTag(parser, selfClosing) {
      if (parser.opt.xmlns) {
        // emit namespace binding events
        var tag = parser.tag;
        // add namespace info to tag
        var qn = qname(parser.tagName);
        tag.prefix = qn.prefix;
        tag.local = qn.local;
        tag.uri = tag.ns[qn.prefix] || "";
        if (tag.prefix && !tag.uri) {
          strictFail(
            parser,
            "Unbound namespace prefix: " + JSON.stringify(parser.tagName)
          );
          tag.uri = qn.prefix;
        }
        var parent = parser.tags[parser.tags.length - 1] || parser;
        if (tag.ns && parent.ns !== tag.ns)
          Object.keys(tag.ns).forEach(function (p) {
            emitNode(parser, "onopennamespace", {
              prefix: p,
              uri: tag.ns[p],
            });
          });
        // handle deferred onattribute events
        // Note: do not apply default ns to attributes:
        //   http://www.w3.org/TR/REC-xml-names/#defaulting
        for (var i = 0, l = parser.attribList.length; i < l; i++) {
          var nv = parser.attribList[i];
          var name = nv[0];
          var value = nv[1];
          var qualName = qname(name, true);
          var prefix = qualName.prefix;
          var local = qualName.local;
          var uri = prefix === "" ? "" : tag.ns[prefix] || "";
          var a = {
            name: name,
            value: value,
            prefix: prefix,
            local: local,
            uri: uri,
          };
          // if there's any attributes with an undefined namespace,
          // then fail on them now.
          if (prefix && prefix !== "xmlns" && !uri) {
            strictFail(
              parser,
              "Unbound namespace prefix: " + JSON.stringify(prefix)
            );
            a.uri = prefix;
          }
          parser.tag.attributes[name] = a;
          emitNode(parser, "onattribute", a);
        }
        parser.attribList.length = 0;
      }
      parser.tag.isSelfClosing = !!selfClosing;
      // process the tag
      parser.sawRoot = true;
      parser.tags.push(parser.tag);
      emitNode(parser, "onopentag", parser.tag);
      if (!selfClosing) {
        // special case for <script> in non-strict mode.
        if (!parser.noscript && parser.tagName.toLowerCase() === "script")
          parser.state = S.SCRIPT;
        else parser.state = S.TEXT;
        parser.tag = null;
        parser.tagName = "";
      }
      parser.attribName = parser.attribValue = "";
      parser.attribList.length = 0;
    }
    function closeTag(parser) {
      if (!parser.tagName) {
        strictFail(parser, "Weird empty close tag.");
        parser.textNode += "</>";
        parser.state = S.TEXT;
        return;
      }
      if (parser.script) {
        if (parser.tagName !== "script") {
          parser.script += "</" + parser.tagName + ">";
          parser.tagName = "";
          parser.state = S.SCRIPT;
          return;
        }
        emitNode(parser, "onscript", parser.script);
        parser.script = "";
      }
      // first make sure that the closing tag actually exists.
      // <a><b></c></b></a> will close everything, otherwise.
      var t = parser.tags.length;
      var tagName = parser.tagName;
      if (!parser.strict) tagName = tagName[parser.looseCase]();
      var closeTo = tagName;
      while (t--) {
        var close = parser.tags[t];
        if (close.name !== closeTo)
          // fail the first time in strict mode
          strictFail(parser, "Unexpected close tag");
        else break;
      }
      // didn't find it.  we already failed for strict, so just abort.
      if (t < 0) {
        strictFail(parser, "Unmatched closing tag: " + parser.tagName);
        parser.textNode += "</" + parser.tagName + ">";
        parser.state = S.TEXT;
        return;
      }
      parser.tagName = tagName;
      var s = parser.tags.length;
      while (s-- > t) {
        var tag = (parser.tag = parser.tags.pop());
        parser.tagName = parser.tag.name;
        emitNode(parser, "onclosetag", parser.tagName);
        var x = {};
        for (var i in tag.ns) x[i] = tag.ns[i];
        var parent = parser.tags[parser.tags.length - 1] || parser;
        if (parser.opt.xmlns && tag.ns !== parent.ns)
          // remove namespace bindings introduced by tag
          Object.keys(tag.ns).forEach(function (p) {
            var n = tag.ns[p];
            emitNode(parser, "onclosenamespace", {
              prefix: p,
              uri: n,
            });
          });
      }
      if (t === 0) parser.closedRoot = true;
      parser.tagName = parser.attribValue = parser.attribName = "";
      parser.attribList.length = 0;
      parser.state = S.TEXT;
    }
    function parseEntity(parser) {
      var entity = parser.entity;
      var entityLC = entity.toLowerCase();
      var num;
      var numStr = "";
      if (parser.ENTITIES[entity]) return parser.ENTITIES[entity];
      if (parser.ENTITIES[entityLC]) return parser.ENTITIES[entityLC];
      entity = entityLC;
      if (entity.charAt(0) === "#") {
        if (entity.charAt(1) === "x") {
          entity = entity.slice(2);
          num = parseInt(entity, 16);
          numStr = num.toString(16);
        } else {
          entity = entity.slice(1);
          num = parseInt(entity, 10);
          numStr = num.toString(10);
        }
      }
      entity = entity.replace(/^0+/, "");
      if (isNaN(num) || numStr.toLowerCase() !== entity) {
        strictFail(parser, "Invalid character entity");
        return "&" + parser.entity + ";";
      }
      return String.fromCodePoint(num);
    }
    function beginWhiteSpace(parser, c) {
      if (c === "<") {
        parser.state = S.OPEN_WAKA;
        parser.startTagPosition = parser.position;
      } else if (!isWhitespace(c)) {
        // have to process this as a text node.
        // weird, but happens.
        strictFail(parser, "Non-whitespace before first tag.");
        parser.textNode = c;
        parser.state = S.TEXT;
      }
    }
    function charAt(chunk, i) {
      var result = "";
      if (i < chunk.length) result = chunk.charAt(i);
      return result;
    }
    function write(chunk) {
      var parser = this;
      if (this.error) throw this.error;
      if (parser.closed)
        return error(
          parser,
          "Cannot write after close. Assign an onready handler."
        );
      if (chunk === null) return end(parser);
      if (typeof chunk === "object") chunk = chunk.toString();
      var i = 0;
      var c = "";
      while (true) {
        c = charAt(chunk, i++);
        parser.c = c;
        if (!c) break;
        if (parser.trackPosition) {
          parser.position++;
          if (c === "\n") {
            parser.line++;
            parser.column = 0;
          } else parser.column++;
        }
        switch (parser.state) {
          case S.BEGIN:
            parser.state = S.BEGIN_WHITESPACE;
            if (c === "\uFEFF") continue;
            beginWhiteSpace(parser, c);
            continue;
          case S.BEGIN_WHITESPACE:
            beginWhiteSpace(parser, c);
            continue;
          case S.TEXT:
            if (parser.sawRoot && !parser.closedRoot) {
              var starti = i - 1;
              while (c && c !== "<" && c !== "&") {
                c = charAt(chunk, i++);
                if (c && parser.trackPosition) {
                  parser.position++;
                  if (c === "\n") {
                    parser.line++;
                    parser.column = 0;
                  } else parser.column++;
                }
              }
              parser.textNode += chunk.substring(starti, i - 1);
            }
            if (
              c === "<" &&
              !(parser.sawRoot && parser.closedRoot && !parser.strict)
            ) {
              parser.state = S.OPEN_WAKA;
              parser.startTagPosition = parser.position;
            } else {
              if (!isWhitespace(c) && (!parser.sawRoot || parser.closedRoot))
                strictFail(parser, "Text data outside of root node.");
              if (c === "&") parser.state = S.TEXT_ENTITY;
              else parser.textNode += c;
            }
            continue;
          case S.SCRIPT:
            // only non-strict
            if (c === "<") parser.state = S.SCRIPT_ENDING;
            else parser.script += c;
            continue;
          case S.SCRIPT_ENDING:
            if (c === "/") parser.state = S.CLOSE_TAG;
            else {
              parser.script += "<" + c;
              parser.state = S.SCRIPT;
            }
            continue;
          case S.OPEN_WAKA:
            // either a /, ?, !, or text is coming next.
            if (c === "!") {
              parser.state = S.SGML_DECL;
              parser.sgmlDecl = "";
            } else if (isWhitespace(c));
            else if (isMatch(nameStart, c)) {
              parser.state = S.OPEN_TAG;
              parser.tagName = c;
            } else if (c === "/") {
              parser.state = S.CLOSE_TAG;
              parser.tagName = "";
            } else if (c === "?") {
              parser.state = S.PROC_INST;
              parser.procInstName = parser.procInstBody = "";
            } else {
              strictFail(parser, "Unencoded <");
              // if there was some whitespace, then add that in.
              if (parser.startTagPosition + 1 < parser.position) {
                var pad = parser.position - parser.startTagPosition;
                c = new Array(pad).join(" ") + c;
              }
              parser.textNode += "<" + c;
              parser.state = S.TEXT;
            }
            continue;
          case S.SGML_DECL:
            if ((parser.sgmlDecl + c).toUpperCase() === CDATA) {
              emitNode(parser, "onopencdata");
              parser.state = S.CDATA;
              parser.sgmlDecl = "";
              parser.cdata = "";
            } else if (parser.sgmlDecl + c === "--") {
              parser.state = S.COMMENT;
              parser.comment = "";
              parser.sgmlDecl = "";
            } else if ((parser.sgmlDecl + c).toUpperCase() === DOCTYPE) {
              parser.state = S.DOCTYPE;
              if (parser.doctype || parser.sawRoot)
                strictFail(
                  parser,
                  "Inappropriately located doctype declaration"
                );
              parser.doctype = "";
              parser.sgmlDecl = "";
            } else if (c === ">") {
              emitNode(parser, "onsgmldeclaration", parser.sgmlDecl);
              parser.sgmlDecl = "";
              parser.state = S.TEXT;
            } else if (isQuote(c)) {
              parser.state = S.SGML_DECL_QUOTED;
              parser.sgmlDecl += c;
            } else parser.sgmlDecl += c;
            continue;
          case S.SGML_DECL_QUOTED:
            if (c === parser.q) {
              parser.state = S.SGML_DECL;
              parser.q = "";
            }
            parser.sgmlDecl += c;
            continue;
          case S.DOCTYPE:
            if (c === ">") {
              parser.state = S.TEXT;
              emitNode(parser, "ondoctype", parser.doctype);
              parser.doctype = true; // just remember that we saw it.
            } else {
              parser.doctype += c;
              if (c === "[") parser.state = S.DOCTYPE_DTD;
              else if (isQuote(c)) {
                parser.state = S.DOCTYPE_QUOTED;
                parser.q = c;
              }
            }
            continue;
          case S.DOCTYPE_QUOTED:
            parser.doctype += c;
            if (c === parser.q) {
              parser.q = "";
              parser.state = S.DOCTYPE;
            }
            continue;
          case S.DOCTYPE_DTD:
            parser.doctype += c;
            if (c === "]") parser.state = S.DOCTYPE;
            else if (isQuote(c)) {
              parser.state = S.DOCTYPE_DTD_QUOTED;
              parser.q = c;
            }
            continue;
          case S.DOCTYPE_DTD_QUOTED:
            parser.doctype += c;
            if (c === parser.q) {
              parser.state = S.DOCTYPE_DTD;
              parser.q = "";
            }
            continue;
          case S.COMMENT:
            if (c === "-") parser.state = S.COMMENT_ENDING;
            else parser.comment += c;
            continue;
          case S.COMMENT_ENDING:
            if (c === "-") {
              parser.state = S.COMMENT_ENDED;
              parser.comment = textopts(parser.opt, parser.comment);
              if (parser.comment) emitNode(parser, "oncomment", parser.comment);
              parser.comment = "";
            } else {
              parser.comment += "-" + c;
              parser.state = S.COMMENT;
            }
            continue;
          case S.COMMENT_ENDED:
            if (c !== ">") {
              strictFail(parser, "Malformed comment");
              // allow <!-- blah -- bloo --> in non-strict mode,
              // which is a comment of " blah -- bloo "
              parser.comment += "--" + c;
              parser.state = S.COMMENT;
            } else parser.state = S.TEXT;
            continue;
          case S.CDATA:
            if (c === "]") parser.state = S.CDATA_ENDING;
            else parser.cdata += c;
            continue;
          case S.CDATA_ENDING:
            if (c === "]") parser.state = S.CDATA_ENDING_2;
            else {
              parser.cdata += "]" + c;
              parser.state = S.CDATA;
            }
            continue;
          case S.CDATA_ENDING_2:
            if (c === ">") {
              if (parser.cdata) emitNode(parser, "oncdata", parser.cdata);
              emitNode(parser, "onclosecdata");
              parser.cdata = "";
              parser.state = S.TEXT;
            } else if (c === "]") parser.cdata += "]";
            else {
              parser.cdata += "]]" + c;
              parser.state = S.CDATA;
            }
            continue;
          case S.PROC_INST:
            if (c === "?") parser.state = S.PROC_INST_ENDING;
            else if (isWhitespace(c)) parser.state = S.PROC_INST_BODY;
            else parser.procInstName += c;
            continue;
          case S.PROC_INST_BODY:
            if (!parser.procInstBody && isWhitespace(c)) continue;
            else if (c === "?") parser.state = S.PROC_INST_ENDING;
            else parser.procInstBody += c;
            continue;
          case S.PROC_INST_ENDING:
            if (c === ">") {
              emitNode(parser, "onprocessinginstruction", {
                name: parser.procInstName,
                body: parser.procInstBody,
              });
              parser.procInstName = parser.procInstBody = "";
              parser.state = S.TEXT;
            } else {
              parser.procInstBody += "?" + c;
              parser.state = S.PROC_INST_BODY;
            }
            continue;
          case S.OPEN_TAG:
            if (isMatch(nameBody, c)) parser.tagName += c;
            else {
              newTag(parser);
              if (c === ">") openTag(parser);
              else if (c === "/") parser.state = S.OPEN_TAG_SLASH;
              else {
                if (!isWhitespace(c))
                  strictFail(parser, "Invalid character in tag name");
                parser.state = S.ATTRIB;
              }
            }
            continue;
          case S.OPEN_TAG_SLASH:
            if (c === ">") {
              openTag(parser, true);
              closeTag(parser);
            } else {
              strictFail(
                parser,
                "Forward-slash in opening tag not followed by >"
              );
              parser.state = S.ATTRIB;
            }
            continue;
          case S.ATTRIB:
            // haven't read the attribute name yet.
            if (isWhitespace(c)) continue;
            else if (c === ">") openTag(parser);
            else if (c === "/") parser.state = S.OPEN_TAG_SLASH;
            else if (isMatch(nameStart, c)) {
              parser.attribName = c;
              parser.attribValue = "";
              parser.state = S.ATTRIB_NAME;
            } else strictFail(parser, "Invalid attribute name");
            continue;
          case S.ATTRIB_NAME:
            if (c === "=") parser.state = S.ATTRIB_VALUE;
            else if (c === ">") {
              strictFail(parser, "Attribute without value");
              parser.attribValue = parser.attribName;
              attrib(parser);
              openTag(parser);
            } else if (isWhitespace(c)) parser.state = S.ATTRIB_NAME_SAW_WHITE;
            else if (isMatch(nameBody, c)) parser.attribName += c;
            else strictFail(parser, "Invalid attribute name");
            continue;
          case S.ATTRIB_NAME_SAW_WHITE:
            if (c === "=") parser.state = S.ATTRIB_VALUE;
            else if (isWhitespace(c)) continue;
            else {
              strictFail(parser, "Attribute without value");
              parser.tag.attributes[parser.attribName] = "";
              parser.attribValue = "";
              emitNode(parser, "onattribute", {
                name: parser.attribName,
                value: "",
              });
              parser.attribName = "";
              if (c === ">") openTag(parser);
              else if (isMatch(nameStart, c)) {
                parser.attribName = c;
                parser.state = S.ATTRIB_NAME;
              } else {
                strictFail(parser, "Invalid attribute name");
                parser.state = S.ATTRIB;
              }
            }
            continue;
          case S.ATTRIB_VALUE:
            if (isWhitespace(c)) continue;
            else if (isQuote(c)) {
              parser.q = c;
              parser.state = S.ATTRIB_VALUE_QUOTED;
            } else {
              strictFail(parser, "Unquoted attribute value");
              parser.state = S.ATTRIB_VALUE_UNQUOTED;
              parser.attribValue = c;
            }
            continue;
          case S.ATTRIB_VALUE_QUOTED:
            if (c !== parser.q) {
              if (c === "&") parser.state = S.ATTRIB_VALUE_ENTITY_Q;
              else parser.attribValue += c;
              continue;
            }
            attrib(parser);
            parser.q = "";
            parser.state = S.ATTRIB_VALUE_CLOSED;
            continue;
          case S.ATTRIB_VALUE_CLOSED:
            if (isWhitespace(c)) parser.state = S.ATTRIB;
            else if (c === ">") openTag(parser);
            else if (c === "/") parser.state = S.OPEN_TAG_SLASH;
            else if (isMatch(nameStart, c)) {
              strictFail(parser, "No whitespace between attributes");
              parser.attribName = c;
              parser.attribValue = "";
              parser.state = S.ATTRIB_NAME;
            } else strictFail(parser, "Invalid attribute name");
            continue;
          case S.ATTRIB_VALUE_UNQUOTED:
            if (!isAttribEnd(c)) {
              if (c === "&") parser.state = S.ATTRIB_VALUE_ENTITY_U;
              else parser.attribValue += c;
              continue;
            }
            attrib(parser);
            if (c === ">") openTag(parser);
            else parser.state = S.ATTRIB;
            continue;
          case S.CLOSE_TAG:
            if (!parser.tagName) {
              if (isWhitespace(c)) continue;
              else if (notMatch(nameStart, c)) {
                if (parser.script) {
                  parser.script += "</" + c;
                  parser.state = S.SCRIPT;
                } else strictFail(parser, "Invalid tagname in closing tag.");
              } else parser.tagName = c;
            } else if (c === ">") closeTag(parser);
            else if (isMatch(nameBody, c)) parser.tagName += c;
            else if (parser.script) {
              parser.script += "</" + parser.tagName;
              parser.tagName = "";
              parser.state = S.SCRIPT;
            } else {
              if (!isWhitespace(c))
                strictFail(parser, "Invalid tagname in closing tag");
              parser.state = S.CLOSE_TAG_SAW_WHITE;
            }
            continue;
          case S.CLOSE_TAG_SAW_WHITE:
            if (isWhitespace(c)) continue;
            if (c === ">") closeTag(parser);
            else strictFail(parser, "Invalid characters in closing tag");
            continue;
          case S.TEXT_ENTITY:
          case S.ATTRIB_VALUE_ENTITY_Q:
          case S.ATTRIB_VALUE_ENTITY_U:
            var returnState;
            var buffer;
            switch (parser.state) {
              case S.TEXT_ENTITY:
                returnState = S.TEXT;
                buffer = "textNode";
                break;
              case S.ATTRIB_VALUE_ENTITY_Q:
                returnState = S.ATTRIB_VALUE_QUOTED;
                buffer = "attribValue";
                break;
              case S.ATTRIB_VALUE_ENTITY_U:
                returnState = S.ATTRIB_VALUE_UNQUOTED;
                buffer = "attribValue";
                break;
            }
            if (c === ";") {
              parser[buffer] += parseEntity(parser);
              parser.entity = "";
              parser.state = returnState;
            } else if (
              isMatch(parser.entity.length ? entityBody : entityStart, c)
            )
              parser.entity += c;
            else {
              strictFail(parser, "Invalid character in entity name");
              parser[buffer] += "&" + parser.entity + c;
              parser.entity = "";
              parser.state = returnState;
            }
            continue;
          default:
            throw new Error(parser, "Unknown state: " + parser.state);
        }
      } // while
      if (parser.position >= parser.bufferCheckPosition)
        checkBufferLength(parser);
      return parser;
    }
    /*! http://mths.be/fromcodepoint v0.1.0 by @mathias */ /* istanbul ignore next */ if (
      !String.fromCodePoint
    )
      (function () {
        var stringFromCharCode = String.fromCharCode;
        var floor = Math.floor;
        var fromCodePoint = function () {
          var MAX_SIZE = 0x4000;
          var codeUnits = [];
          var highSurrogate;
          var lowSurrogate;
          var index = -1;
          var length = arguments.length;
          if (!length) return "";
          var result = "";
          while (++index < length) {
            var codePoint = Number(arguments[index]);
            if (
              !isFinite(codePoint) || // `NaN`, `+Infinity`, or `-Infinity`
              codePoint < 0 || // not a valid Unicode code point
              codePoint > 0x10ffff || // not a valid Unicode code point
              floor(codePoint) !== codePoint // not an integer
            )
              throw RangeError("Invalid code point: " + codePoint);
            if (codePoint <= 0xffff) codeUnits.push(codePoint);
            else {
              // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
              codePoint -= 0x10000;
              highSurrogate = (codePoint >> 10) + 0xd800;
              lowSurrogate = (codePoint % 0x400) + 0xdc00;
              codeUnits.push(highSurrogate, lowSurrogate);
            }
            if (index + 1 === length || codeUnits.length > MAX_SIZE) {
              result += stringFromCharCode.apply(null, codeUnits);
              codeUnits.length = 0;
            }
          }
          return result;
        };
        /* istanbul ignore next */ if (Object.defineProperty)
          Object.defineProperty(String, "fromCodePoint", {
            value: fromCodePoint,
            configurable: true,
            writable: true,
          });
        else String.fromCodePoint = fromCodePoint;
      })();
  })(module.exports);
});

parcelRequire.register("7XA7f", function (module, exports) {
  "use strict";
  var $5cba0eef33ad0e88$var$__importDefault =
    (module.exports && module.exports.__importDefault) ||
    function (mod) {
      return mod && mod.__esModule
        ? mod
        : {
            default: mod,
          };
    };

  const $5cba0eef33ad0e88$var$http_1 =
    $5cba0eef33ad0e88$var$__importDefault($bFvJb$http);

  const $5cba0eef33ad0e88$var$https_1 =
    $5cba0eef33ad0e88$var$__importDefault($bFvJb$https);

  const $5cba0eef33ad0e88$var$httpLibs = {
    "http:": $5cba0eef33ad0e88$var$http_1.default,
    "https:": $5cba0eef33ad0e88$var$https_1.default,
  };
  const $5cba0eef33ad0e88$var$redirectStatusCodes = new Set([
    301, 302, 303, 307, 308,
  ]);
  const $5cba0eef33ad0e88$var$retryStatusCodes = new Set([429, 503]);
  // `request`, `response`, `abort`, left out, miniget will emit these.
  const $5cba0eef33ad0e88$var$requestEvents = [
    "connect",
    "continue",
    "information",
    "socket",
    "timeout",
    "upgrade",
  ];
  const $5cba0eef33ad0e88$var$responseEvents = ["aborted"];
  $5cba0eef33ad0e88$var$Miniget.MinigetError = class MinigetError extends (
    Error
  ) {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
    }
  };
  $5cba0eef33ad0e88$var$Miniget.defaultOptions = {
    maxRedirects: 10,
    maxRetries: 2,
    maxReconnects: 0,
    backoff: {
      inc: 100,
      max: 10000,
    },
  };
  function $5cba0eef33ad0e88$var$Miniget(url, options = {}) {
    var _a;
    const opts = Object.assign(
      {},
      $5cba0eef33ad0e88$var$Miniget.defaultOptions,
      options
    );
    const stream = new $bFvJb$stream.PassThrough({
      highWaterMark: opts.highWaterMark,
    });
    stream.destroyed = stream.aborted = false;
    let activeRequest;
    let activeResponse;
    let activeDecodedStream;
    let redirects = 0;
    let retries = 0;
    let retryTimeout;
    let reconnects = 0;
    let contentLength;
    let acceptRanges = false;
    let rangeStart = 0,
      rangeEnd;
    let downloaded = 0;
    // Check if this is a ranged request.
    if ((_a = opts.headers) === null || _a === void 0 ? void 0 : _a.Range) {
      let r = /bytes=(\d+)-(\d+)?/.exec(`${opts.headers.Range}`);
      if (r) {
        rangeStart = parseInt(r[1], 10);
        rangeEnd = parseInt(r[2], 10);
      }
    }
    // Add `Accept-Encoding` header.
    if (opts.acceptEncoding)
      opts.headers = Object.assign(
        {
          "Accept-Encoding": Object.keys(opts.acceptEncoding).join(", "),
        },
        opts.headers
      );
    const downloadHasStarted = () => activeDecodedStream && downloaded > 0;
    const downloadComplete = () =>
      !acceptRanges || downloaded === contentLength;
    const reconnect = (err) => {
      activeDecodedStream = null;
      retries = 0;
      let inc = opts.backoff.inc;
      let ms = Math.min(inc, opts.backoff.max);
      retryTimeout = setTimeout(doDownload, ms);
      stream.emit("reconnect", reconnects, err);
    };
    const reconnectIfEndedEarly = (err) => {
      if (
        options.method !== "HEAD" &&
        !downloadComplete() &&
        reconnects++ < opts.maxReconnects
      ) {
        reconnect(err);
        return true;
      }
      return false;
    };
    const retryRequest = (retryOptions) => {
      if (stream.destroyed) return false;
      if (downloadHasStarted()) return reconnectIfEndedEarly(retryOptions.err);
      else if (
        (!retryOptions.err || retryOptions.err.message === "ENOTFOUND") &&
        retries++ < opts.maxRetries
      ) {
        let ms =
          retryOptions.retryAfter ||
          Math.min(retries * opts.backoff.inc, opts.backoff.max);
        retryTimeout = setTimeout(doDownload, ms);
        stream.emit("retry", retries, retryOptions.err);
        return true;
      }
      return false;
    };
    const forwardEvents = (ee, events) => {
      for (let event of events) ee.on(event, stream.emit.bind(stream, event));
    };
    const doDownload = () => {
      let parsed = {},
        httpLib;
      try {
        let urlObj = typeof url === "string" ? new URL(url) : url;
        parsed = Object.assign(
          {},
          {
            host: urlObj.host,
            hostname: urlObj.hostname,
            path: urlObj.pathname + urlObj.search + urlObj.hash,
            port: urlObj.port,
            protocol: urlObj.protocol,
          }
        );
        if (urlObj.username)
          parsed.auth = `${urlObj.username}:${urlObj.password}`;
        httpLib = $5cba0eef33ad0e88$var$httpLibs[String(parsed.protocol)];
      } catch (err) {
        // Let the error be caught by the if statement below.
      }
      if (!httpLib) {
        stream.emit(
          "error",
          new $5cba0eef33ad0e88$var$Miniget.MinigetError(`Invalid URL: ${url}`)
        );
        return;
      }
      Object.assign(parsed, opts);
      if (acceptRanges && downloaded > 0) {
        let start = downloaded + rangeStart;
        let end = rangeEnd || "";
        parsed.headers = Object.assign({}, parsed.headers, {
          Range: `bytes=${start}-${end}`,
        });
      }
      if (opts.transform) {
        try {
          parsed = opts.transform(parsed);
        } catch (err) {
          stream.emit("error", err);
          return;
        }
        if (!parsed || parsed.protocol) {
          httpLib =
            $5cba0eef33ad0e88$var$httpLibs[
              String(
                parsed === null || parsed === void 0 ? void 0 : parsed.protocol
              )
            ];
          if (!httpLib) {
            stream.emit(
              "error",
              new $5cba0eef33ad0e88$var$Miniget.MinigetError(
                "Invalid URL object from `transform` function"
              )
            );
            return;
          }
        }
      }
      const onError = (err) => {
        if (stream.destroyed || stream.readableEnded) return;
        cleanup();
        if (
          !retryRequest({
            err: err,
          })
        )
          stream.emit("error", err);
        else activeRequest.removeListener("close", onRequestClose);
      };
      const onRequestClose = () => {
        cleanup();
        retryRequest({});
      };
      const cleanup = () => {
        activeRequest.removeListener("close", onRequestClose);
        activeResponse === null ||
          activeResponse === void 0 ||
          activeResponse.removeListener("data", onData);
        activeDecodedStream === null ||
          activeDecodedStream === void 0 ||
          activeDecodedStream.removeListener("end", onEnd);
      };
      const onData = (chunk) => {
        downloaded += chunk.length;
      };
      const onEnd = () => {
        cleanup();
        if (!reconnectIfEndedEarly()) stream.end();
      };
      activeRequest = httpLib.request(parsed, (res) => {
        // Needed for node v10, v12.
        // istanbul ignore next
        if (stream.destroyed) return;
        if ($5cba0eef33ad0e88$var$redirectStatusCodes.has(res.statusCode)) {
          if (redirects++ >= opts.maxRedirects)
            stream.emit(
              "error",
              new $5cba0eef33ad0e88$var$Miniget.MinigetError(
                "Too many redirects"
              )
            );
          else {
            if (res.headers.location) url = res.headers.location;
            else {
              let err = new $5cba0eef33ad0e88$var$Miniget.MinigetError(
                "Redirect status code given with no location",
                res.statusCode
              );
              stream.emit("error", err);
              cleanup();
              return;
            }
            setTimeout(
              doDownload,
              parseInt(res.headers["retry-after"] || "0", 10) * 1000
            );
            stream.emit("redirect", url);
          }
          cleanup();
          return;
          // Check for rate limiting.
        } else if ($5cba0eef33ad0e88$var$retryStatusCodes.has(res.statusCode)) {
          if (
            !retryRequest({
              retryAfter: parseInt(res.headers["retry-after"] || "0", 10),
            })
          ) {
            let err = new $5cba0eef33ad0e88$var$Miniget.MinigetError(
              `Status code: ${res.statusCode}`,
              res.statusCode
            );
            stream.emit("error", err);
          }
          cleanup();
          return;
        } else if (
          res.statusCode &&
          (res.statusCode < 200 || res.statusCode >= 400)
        ) {
          let err = new $5cba0eef33ad0e88$var$Miniget.MinigetError(
            `Status code: ${res.statusCode}`,
            res.statusCode
          );
          if (res.statusCode >= 500) onError(err);
          else stream.emit("error", err);
          cleanup();
          return;
        }
        activeDecodedStream = res;
        if (opts.acceptEncoding && res.headers["content-encoding"])
          for (let enc of res.headers["content-encoding"]
            .split(", ")
            .reverse()) {
            let fn = opts.acceptEncoding[enc];
            if (fn) {
              activeDecodedStream = activeDecodedStream.pipe(fn());
              activeDecodedStream.on("error", onError);
            }
          }
        if (!contentLength) {
          contentLength = parseInt(`${res.headers["content-length"]}`, 10);
          acceptRanges =
            res.headers["accept-ranges"] === "bytes" &&
            contentLength > 0 &&
            opts.maxReconnects > 0;
        }
        res.on("data", onData);
        activeDecodedStream.on("end", onEnd);
        activeDecodedStream.pipe(stream, {
          end: !acceptRanges,
        });
        activeResponse = res;
        stream.emit("response", res);
        res.on("error", onError);
        forwardEvents(res, $5cba0eef33ad0e88$var$responseEvents);
      });
      activeRequest.on("error", onError);
      activeRequest.on("close", onRequestClose);
      forwardEvents(activeRequest, $5cba0eef33ad0e88$var$requestEvents);
      if (stream.destroyed) streamDestroy(...destroyArgs);
      stream.emit("request", activeRequest);
      activeRequest.end();
    };
    stream.abort = (err) => {
      console.warn(
        "`MinigetStream#abort()` has been deprecated in favor of `MinigetStream#destroy()`"
      );
      stream.aborted = true;
      stream.emit("abort");
      stream.destroy(err);
    };
    let destroyArgs;
    const streamDestroy = (err) => {
      activeRequest.destroy(err);
      activeDecodedStream === null ||
        activeDecodedStream === void 0 ||
        activeDecodedStream.unpipe(stream);
      activeDecodedStream === null ||
        activeDecodedStream === void 0 ||
        activeDecodedStream.destroy();
      clearTimeout(retryTimeout);
    };
    stream._destroy = (...args) => {
      stream.destroyed = true;
      if (activeRequest) streamDestroy(...args);
      else destroyArgs = args;
    };
    stream.text = () =>
      new Promise((resolve, reject) => {
        let body = "";
        stream.setEncoding("utf8");
        stream.on("data", (chunk) => (body += chunk));
        stream.on("end", () => resolve(body));
        stream.on("error", reject);
      });
    $bFvJb$process.nextTick(doDownload);
    return stream;
  }
  module.exports = $5cba0eef33ad0e88$var$Miniget;
});

parcelRequire.register("8ZGq3", function (module, exports) {
  module.exports = JSON.parse(
    '{"name":"ytdl-core","description":"YouTube video downloader in pure javascript.","keywords":["youtube","video","download"],"version":"0.0.0-development","repository":{"type":"git","url":"git://github.com/fent/node-ytdl-core.git"},"author":"fent <fentbox@gmail.com> (https://github.com/fent)","contributors":["Tobias Kutscha (https://github.com/TimeForANinja)","Andrew Kelley (https://github.com/andrewrk)","Mauricio Allende (https://github.com/mallendeo)","Rodrigo Altamirano (https://github.com/raltamirano)","Jim Buck (https://github.com/JimmyBoh)","Paweł Ruciński (https://github.com/Roki100)","Alexander Paolini (https://github.com/Million900o)"],"main":"./lib/index.js","types":"./typings/index.d.ts","files":["lib","typings"],"scripts":{"test":"nyc --reporter=lcov --reporter=text-summary npm run test:unit","test:unit":"mocha --ignore test/irl-test.js test/*-test.js --timeout 4000","test:irl":"mocha --timeout 16000 test/irl-test.js","lint":"eslint ./","lint:fix":"eslint --fix ./","lint:typings":"tslint typings/index.d.ts","lint:typings:fix":"tslint --fix typings/index.d.ts"},"dependencies":{"m3u8stream":"^0.8.6","miniget":"^4.2.2","sax":"^1.1.3"},"devDependencies":{"@types/node":"^13.1.0","assert-diff":"^3.0.1","dtslint":"^3.6.14","eslint":"^6.8.0","mocha":"^7.0.0","muk-require":"^1.2.0","nock":"^13.0.4","nyc":"^15.0.0","sinon":"^9.0.0","stream-equal":"~1.1.0","typescript":"^3.9.7"},"engines":{"node":">=12"},"license":"MIT"}'
  );
});

parcelRequire.register("eVT2b", function (module, exports) {
  "use strict";
  Object.defineProperty(module.exports, "__esModule", {
    value: true,
  });

  /**
   * A very simple m3u8 playlist file parser that detects tags and segments.
   */ class $adf1143074688897$var$m3u8Parser extends $bFvJb$stream.Writable {
    constructor() {
      super();
      this._lastLine = "";
      this._seq = 0;
      this._nextItemDuration = null;
      this._nextItemRange = null;
      this._lastItemRangeEnd = 0;
      this.on("finish", () => {
        this._parseLine(this._lastLine);
        this.emit("end");
      });
    }
    _parseAttrList(value) {
      let attrs = {};
      let regex = /([A-Z0-9-]+)=(?:"([^"]*?)"|([^,]*?))/g;
      let match;
      while ((match = regex.exec(value)) !== null)
        attrs[match[1]] = match[2] || match[3];
      return attrs;
    }
    _parseRange(value) {
      if (!value) return null;
      let svalue = value.split("@");
      let start = svalue[1] ? parseInt(svalue[1]) : this._lastItemRangeEnd + 1;
      let end = start + parseInt(svalue[0]) - 1;
      let range = {
        start: start,
        end: end,
      };
      this._lastItemRangeEnd = range.end;
      return range;
    }
    _parseLine(line) {
      let match = line.match(/^#(EXT[A-Z0-9-]+)(?::(.*))?/);
      if (match) {
        // This is a tag.
        const tag = match[1];
        const value = match[2] || "";
        switch (tag) {
          case "EXT-X-PROGRAM-DATE-TIME":
            this.emit("starttime", new Date(value).getTime());
            break;
          case "EXT-X-MEDIA-SEQUENCE":
            this._seq = parseInt(value);
            break;
          case "EXT-X-MAP": {
            let attrs = this._parseAttrList(value);
            if (!attrs.URI) {
              this.destroy(
                new Error("`EXT-X-MAP` found without required attribute `URI`")
              );
              return;
            }
            this.emit("item", {
              url: attrs.URI,
              seq: this._seq,
              init: true,
              duration: 0,
              range: this._parseRange(attrs.BYTERANGE),
            });
            break;
          }
          case "EXT-X-BYTERANGE":
            this._nextItemRange = this._parseRange(value);
            break;
          case "EXTINF":
            this._nextItemDuration = Math.round(
              parseFloat(value.split(",")[0]) * 1000
            );
            break;
          case "EXT-X-ENDLIST":
            this.emit("endlist");
            break;
        }
      } else if (!/^#/.test(line) && line.trim()) {
        // This is a segment
        this.emit("item", {
          url: line.trim(),
          seq: this._seq++,
          duration: this._nextItemDuration,
          range: this._nextItemRange,
        });
        this._nextItemRange = null;
      }
    }
    _write(chunk, encoding, callback) {
      let lines = chunk.toString("utf8").split("\n");
      if (this._lastLine) lines[0] = this._lastLine + lines[0];
      lines.forEach((line, i) => {
        if (this.destroyed) return;
        if (i < lines.length - 1) this._parseLine(line);
        // Save the last line in case it has been broken up.
        else this._lastLine = line;
      });
      callback();
    }
  }
  module.exports.default = $adf1143074688897$var$m3u8Parser;
});

parcelRequire.register("dFBuc", function (module, exports) {
  "use strict";
  var $9f3c2eab8727b8fa$var$__importDefault =
    (module.exports && module.exports.__importDefault) ||
    function (mod) {
      return mod && mod.__esModule
        ? mod
        : {
            default: mod,
          };
    };
  Object.defineProperty(module.exports, "__esModule", {
    value: true,
  });

  const $9f3c2eab8727b8fa$var$sax_1 = $9f3c2eab8727b8fa$var$__importDefault(
    parcelRequire("1Vc1h")
  );

  var $fKWuu = parcelRequire("fKWuu");
  /**
   * A wrapper around sax that emits segments.
   */ class $9f3c2eab8727b8fa$var$DashMPDParser extends $bFvJb$stream.Writable {
    constructor(targetID) {
      super();
      this._parser = $9f3c2eab8727b8fa$var$sax_1.default.createStream(false, {
        lowercase: true,
      });
      this._parser.on("error", this.destroy.bind(this));
      let lastTag;
      let currtime = 0;
      let seq = 0;
      let segmentTemplate;
      let timescale, offset, duration, baseURL;
      let timeline = [];
      let getSegments = false;
      let gotSegments = false;
      let isStatic;
      let treeLevel;
      let periodStart;
      const tmpl = (str) => {
        const context = {
          RepresentationID: targetID,
          Number: seq,
          Time: currtime,
        };
        return str.replace(/\$(\w+)\$/g, (m, p1) => `${context[p1]}`);
      };
      this._parser.on("opentag", (node) => {
        switch (node.name) {
          case "mpd":
            currtime = node.attributes.availabilitystarttime
              ? new Date(node.attributes.availabilitystarttime).getTime()
              : 0;
            isStatic = node.attributes.type !== "dynamic";
            break;
          case "period":
            // Reset everything on <Period> tag.
            seq = 0;
            timescale = 1000;
            duration = 0;
            offset = 0;
            baseURL = [];
            treeLevel = 0;
            periodStart = $fKWuu.durationStr(node.attributes.start) || 0;
            break;
          case "segmentlist":
            seq = parseInt(node.attributes.startnumber) || seq;
            timescale = parseInt(node.attributes.timescale) || timescale;
            duration = parseInt(node.attributes.duration) || duration;
            offset = parseInt(node.attributes.presentationtimeoffset) || offset;
            break;
          case "segmenttemplate":
            segmentTemplate = node.attributes;
            seq = parseInt(node.attributes.startnumber) || seq;
            timescale = parseInt(node.attributes.timescale) || timescale;
            break;
          case "segmenttimeline":
          case "baseurl":
            lastTag = node.name;
            break;
          case "s":
            timeline.push({
              duration: parseInt(node.attributes.d),
              repeat: parseInt(node.attributes.r),
              time: parseInt(node.attributes.t),
            });
            break;
          case "adaptationset":
          case "representation":
            treeLevel++;
            if (!targetID) targetID = node.attributes.id;
            getSegments = node.attributes.id === `${targetID}`;
            if (getSegments) {
              if (periodStart) currtime += periodStart;
              if (offset) currtime -= (offset / timescale) * 1000;
              this.emit("starttime", currtime);
            }
            break;
          case "initialization":
            if (getSegments)
              this.emit("item", {
                url:
                  baseURL.filter((s) => !!s).join("") +
                  node.attributes.sourceurl,
                seq: seq,
                init: true,
                duration: 0,
              });
            break;
          case "segmenturl":
            if (getSegments) {
              gotSegments = true;
              let tl = timeline.shift();
              let segmentDuration =
                (((tl === null || tl === void 0 ? void 0 : tl.duration) ||
                  duration) /
                  timescale) *
                1000;
              this.emit("item", {
                url:
                  baseURL.filter((s) => !!s).join("") + node.attributes.media,
                seq: seq++,
                duration: segmentDuration,
              });
              currtime += segmentDuration;
            }
            break;
        }
      });
      const onEnd = () => {
        if (isStatic) this.emit("endlist");
        if (!getSegments)
          this.destroy(Error(`Representation '${targetID}' not found`));
        else this.emit("end");
      };
      this._parser.on("closetag", (tagName) => {
        switch (tagName) {
          case "adaptationset":
          case "representation":
            treeLevel--;
            if (segmentTemplate && timeline.length) {
              gotSegments = true;
              if (segmentTemplate.initialization)
                this.emit("item", {
                  url:
                    baseURL.filter((s) => !!s).join("") +
                    tmpl(segmentTemplate.initialization),
                  seq: seq,
                  init: true,
                  duration: 0,
                });
              for (let {
                duration: itemDuration,
                repeat: repeat,
                time: time,
              } of timeline) {
                itemDuration = (itemDuration / timescale) * 1000;
                repeat = repeat || 1;
                currtime = time || currtime;
                for (let i = 0; i < repeat; i++) {
                  this.emit("item", {
                    url:
                      baseURL.filter((s) => !!s).join("") +
                      tmpl(segmentTemplate.media),
                    seq: seq++,
                    duration: itemDuration,
                  });
                  currtime += itemDuration;
                }
              }
            }
            if (gotSegments) {
              this.emit("endearly");
              onEnd();
              this._parser.removeAllListeners();
              this.removeAllListeners("finish");
            }
            break;
        }
      });
      this._parser.on("text", (text) => {
        if (lastTag === "baseurl") {
          baseURL[treeLevel] = text;
          lastTag = null;
        }
      });
      this.on("finish", onEnd);
    }
    _write(chunk, encoding, callback) {
      this._parser.write(chunk);
      callback();
    }
  }
  module.exports.default = $9f3c2eab8727b8fa$var$DashMPDParser;
});
parcelRequire.register("fKWuu", function (module, exports) {
  "use strict";
  Object.defineProperty(module.exports, "__esModule", {
    value: true,
  });
  module.exports.durationStr = module.exports.humanStr = void 0;
  const $b78885f33a064ca4$var$numberFormat = /^\d+$/;
  const $b78885f33a064ca4$var$timeFormat =
    /^(?:(?:(\d+):)?(\d{1,2}):)?(\d{1,2})(?:\.(\d{3}))?$/;
  const $b78885f33a064ca4$var$timeUnits = {
    ms: 1,
    s: 1000,
    m: 60000,
    h: 3600000,
  };
  /**
   * Converts human friendly time to milliseconds. Supports the format
   * 00:00:00.000 for hours, minutes, seconds, and milliseconds respectively.
   * And 0ms, 0s, 0m, 0h, and together 1m1s.
   *
   * @param {number|string} time
   * @returns {number}
   */ module.exports.humanStr = (time) => {
    if (typeof time === "number") return time;
    if ($b78885f33a064ca4$var$numberFormat.test(time)) return +time;
    const firstFormat = $b78885f33a064ca4$var$timeFormat.exec(time);
    if (firstFormat)
      return (
        +(firstFormat[1] || 0) * $b78885f33a064ca4$var$timeUnits.h +
        +(firstFormat[2] || 0) * $b78885f33a064ca4$var$timeUnits.m +
        +firstFormat[3] * $b78885f33a064ca4$var$timeUnits.s +
        +(firstFormat[4] || 0)
      );
    else {
      let total = 0;
      const r = /(-?\d+)(ms|s|m|h)/g;
      let rs;
      while ((rs = r.exec(time)) !== null)
        total += +rs[1] * $b78885f33a064ca4$var$timeUnits[rs[2]];
      return total;
    }
  };
  /**
   * Parses a duration string in the form of "123.456S", returns milliseconds.
   *
   * @param {string} time
   * @returns {number}
   */ module.exports.durationStr = (time) => {
    let total = 0;
    const r = /(\d+(?:\.\d+)?)(S|M|H)/g;
    let rs;
    while ((rs = r.exec(time)) !== null)
      total += +rs[1] * $b78885f33a064ca4$var$timeUnits[rs[2].toLowerCase()];
    return total;
  };
});

parcelRequire.register("3nKoH", function (module, exports) {
  /*jshint node:true*/ var $2767829f9004576b$var$__dirname =
    "node_modules/fluent-ffmpeg/lib";
  ("use strict");

  var $2767829f9004576b$require$EventEmitter = $bFvJb$events.EventEmitter;

  var $gOWQU = parcelRequire("gOWQU");
  var $2767829f9004576b$var$ARGLISTS = [
    "_global",
    "_audio",
    "_audioFilters",
    "_video",
    "_videoFilters",
    "_sizeFilters",
    "_complexFilters",
  ];
  /**
   * Create an ffmpeg command
   *
   * Can be called with or without the 'new' operator, and the 'input' parameter
   * may be specified as 'options.source' instead (or passed later with the
   * addInput method).
   *
   * @constructor
   * @param {String|ReadableStream} [input] input file path or readable stream
   * @param {Object} [options] command options
   * @param {Object} [options.logger=<no logging>] logger object with 'error', 'warning', 'info' and 'debug' methods
   * @param {Number} [options.niceness=0] ffmpeg process niceness, ignored on Windows
   * @param {Number} [options.priority=0] alias for `niceness`
   * @param {String} [options.presets="fluent-ffmpeg/lib/presets"] directory to load presets from
   * @param {String} [options.preset="fluent-ffmpeg/lib/presets"] alias for `presets`
   * @param {String} [options.stdoutLines=100] maximum lines of ffmpeg output to keep in memory, use 0 for unlimited
   * @param {Number} [options.timeout=<no timeout>] ffmpeg processing timeout in seconds
   * @param {String|ReadableStream} [options.source=<no input>] alias for the `input` parameter
   */ function $2767829f9004576b$var$FfmpegCommand(input, options) {
    // Make 'new' optional
    if (!(this instanceof $2767829f9004576b$var$FfmpegCommand))
      return new $2767829f9004576b$var$FfmpegCommand(input, options);
    $2767829f9004576b$require$EventEmitter.call(this);
    if (typeof input === "object" && !("readable" in input))
      // Options object passed directly
      options = input;
    else {
      // Input passed first
      options = options || {};
      options.source = input;
    }
    // Add input if present
    this._inputs = [];
    if (options.source) this.input(options.source);
    // Add target-less output for backwards compatibility
    this._outputs = [];
    this.output();
    // Create argument lists
    var self = this;
    ["_global", "_complexFilters"].forEach(function (prop) {
      self[prop] = $gOWQU.args();
    });
    // Set default option values
    options.stdoutLines = "stdoutLines" in options ? options.stdoutLines : 100;
    options.presets =
      options.presets ||
      options.preset ||
      $bFvJb$path.join($2767829f9004576b$var$__dirname, "presets");
    options.niceness = options.niceness || options.priority || 0;
    // Save options
    this.options = options;
    // Setup logger
    this.logger = options.logger || {
      debug: function () {},
      info: function () {},
      warn: function () {},
      error: function () {},
    };
  }
  $bFvJb$util.inherits(
    $2767829f9004576b$var$FfmpegCommand,
    $2767829f9004576b$require$EventEmitter
  );
  module.exports = $2767829f9004576b$var$FfmpegCommand;
  /**
   * Clone an ffmpeg command
   *
   * This method is useful when you want to process the same input multiple times.
   * It returns a new FfmpegCommand instance with the exact same options.
   *
   * All options set _after_ the clone() call will only be applied to the instance
   * it has been called on.
   *
   * @example
   *   var command = ffmpeg('/path/to/source.avi')
   *     .audioCodec('libfaac')
   *     .videoCodec('libx264')
   *     .format('mp4');
   *
   *   command.clone()
   *     .size('320x200')
   *     .save('/path/to/output-small.mp4');
   *
   *   command.clone()
   *     .size('640x400')
   *     .save('/path/to/output-medium.mp4');
   *
   *   command.save('/path/to/output-original-size.mp4');
   *
   * @method FfmpegCommand#clone
   * @return FfmpegCommand
   */ $2767829f9004576b$var$FfmpegCommand.prototype.clone = function () {
    var clone = new $2767829f9004576b$var$FfmpegCommand();
    var self = this;
    // Clone options and logger
    clone.options = this.options;
    clone.logger = this.logger;
    // Clone inputs
    clone._inputs = this._inputs.map(function (input) {
      return {
        source: input.source,
        options: input.options.clone(),
      };
    });
    // Create first output
    if ("target" in this._outputs[0]) {
      // We have outputs set, don't clone them and create first output
      clone._outputs = [];
      clone.output();
    } else {
      // No outputs set, clone first output options
      clone._outputs = [
        (clone._currentOutput = {
          flags: {},
        }),
      ];
      [
        "audio",
        "audioFilters",
        "video",
        "videoFilters",
        "sizeFilters",
        "options",
      ].forEach(function (key) {
        clone._currentOutput[key] = self._currentOutput[key].clone();
      });
      if (this._currentOutput.sizeData) {
        clone._currentOutput.sizeData = {};
        $gOWQU.copy(
          this._currentOutput.sizeData,
          clone._currentOutput.sizeData
        );
      }
      $gOWQU.copy(this._currentOutput.flags, clone._currentOutput.flags);
    }
    // Clone argument lists
    ["_global", "_complexFilters"].forEach(function (prop) {
      clone[prop] = self[prop].clone();
    });
    return clone;
  };

  /* Add methods from options submodules */ parcelRequire("6TC10")(
    $2767829f9004576b$var$FfmpegCommand.prototype
  );

  parcelRequire("hyjzu")($2767829f9004576b$var$FfmpegCommand.prototype);

  parcelRequire("e14We")($2767829f9004576b$var$FfmpegCommand.prototype);

  parcelRequire("b4lGs")($2767829f9004576b$var$FfmpegCommand.prototype);

  parcelRequire("hK0sm")($2767829f9004576b$var$FfmpegCommand.prototype);

  parcelRequire("bKZ8J")($2767829f9004576b$var$FfmpegCommand.prototype);

  parcelRequire("kaFwp")($2767829f9004576b$var$FfmpegCommand.prototype);

  /* Add processor methods */ parcelRequire("4wWgO")(
    $2767829f9004576b$var$FfmpegCommand.prototype
  );

  /* Add capabilities methods */ parcelRequire("lCJVB")(
    $2767829f9004576b$var$FfmpegCommand.prototype
  );
  $2767829f9004576b$var$FfmpegCommand.setFfmpegPath = function (path) {
    new $2767829f9004576b$var$FfmpegCommand().setFfmpegPath(path);
  };
  $2767829f9004576b$var$FfmpegCommand.setFfprobePath = function (path) {
    new $2767829f9004576b$var$FfmpegCommand().setFfprobePath(path);
  };
  $2767829f9004576b$var$FfmpegCommand.setFlvtoolPath = function (path) {
    new $2767829f9004576b$var$FfmpegCommand().setFlvtoolPath(path);
  };
  $2767829f9004576b$var$FfmpegCommand.availableFilters =
    $2767829f9004576b$var$FfmpegCommand.getAvailableFilters = function (
      callback
    ) {
      new $2767829f9004576b$var$FfmpegCommand().availableFilters(callback);
    };
  $2767829f9004576b$var$FfmpegCommand.availableCodecs =
    $2767829f9004576b$var$FfmpegCommand.getAvailableCodecs = function (
      callback
    ) {
      new $2767829f9004576b$var$FfmpegCommand().availableCodecs(callback);
    };
  $2767829f9004576b$var$FfmpegCommand.availableFormats =
    $2767829f9004576b$var$FfmpegCommand.getAvailableFormats = function (
      callback
    ) {
      new $2767829f9004576b$var$FfmpegCommand().availableFormats(callback);
    };
  $2767829f9004576b$var$FfmpegCommand.availableEncoders =
    $2767829f9004576b$var$FfmpegCommand.getAvailableEncoders = function (
      callback
    ) {
      new $2767829f9004576b$var$FfmpegCommand().availableEncoders(callback);
    };

  /* Add ffprobe methods */ parcelRequire("2LqKM")(
    $2767829f9004576b$var$FfmpegCommand.prototype
  );
  $2767829f9004576b$var$FfmpegCommand.ffprobe = function (file) {
    var instance = new $2767829f9004576b$var$FfmpegCommand(file);
    instance.ffprobe.apply(instance, Array.prototype.slice.call(arguments, 1));
  };

  /* Add processing recipes */ parcelRequire("adNg8")(
    $2767829f9004576b$var$FfmpegCommand.prototype
  );
});
parcelRequire.register("gOWQU", function (module, exports) {
  /*jshint node:true*/
  var $c3eef7b76ebda48e$require$Buffer = $bFvJb$buffer.Buffer;
  ("use strict");

  var $c3eef7b76ebda48e$require$exec = $bFvJb$child_process.exec;

  var $c3eef7b76ebda48e$var$isWindows = $bFvJb$os
    .platform()
    .match(/win(32|64)/);

  var $d2MMG = parcelRequire("d2MMG");
  var $c3eef7b76ebda48e$var$nlRegexp = /\r\n|\r|\n/g;
  var $c3eef7b76ebda48e$var$streamRegexp = /^\[?(.*?)\]?$/;
  var $c3eef7b76ebda48e$var$filterEscapeRegexp = /[,]/;
  var $c3eef7b76ebda48e$var$whichCache = {};
  /**
   * Parse progress line from ffmpeg stderr
   *
   * @param {String} line progress line
   * @return progress object
   * @private
   */ function $c3eef7b76ebda48e$var$parseProgressLine(line) {
    var progress = {};
    // Remove all spaces after = and trim
    line = line.replace(/=\s+/g, "=").trim();
    var progressParts = line.split(" ");
    // Split every progress part by "=" to get key and value
    for (var i = 0; i < progressParts.length; i++) {
      var progressSplit = progressParts[i].split("=", 2);
      var key = progressSplit[0];
      var value = progressSplit[1];
      // This is not a progress line
      if (typeof value === "undefined") return null;
      progress[key] = value;
    }
    return progress;
  }
  var $c3eef7b76ebda48e$var$utils = (module.exports = {
    isWindows: $c3eef7b76ebda48e$var$isWindows,
    streamRegexp: $c3eef7b76ebda48e$var$streamRegexp,
    /**
     * Copy an object keys into another one
     *
     * @param {Object} source source object
     * @param {Object} dest destination object
     * @private
     */ copy: function (source, dest) {
      Object.keys(source).forEach(function (key) {
        dest[key] = source[key];
      });
    },
    /**
     * Create an argument list
     *
     * Returns a function that adds new arguments to the list.
     * It also has the following methods:
     * - clear() empties the argument list
     * - get() returns the argument list
     * - find(arg, count) finds 'arg' in the list and return the following 'count' items, or undefined if not found
     * - remove(arg, count) remove 'arg' in the list as well as the following 'count' items
     *
     * @private
     */ args: function () {
      var list = [];
      // Append argument(s) to the list
      var argfunc = function () {
        if (arguments.length === 1 && Array.isArray(arguments[0]))
          list = list.concat(arguments[0]);
        else list = list.concat([].slice.call(arguments));
      };
      // Clear argument list
      argfunc.clear = function () {
        list = [];
      };
      // Return argument list
      argfunc.get = function () {
        return list;
      };
      // Find argument 'arg' in list, and if found, return an array of the 'count' items that follow it
      argfunc.find = function (arg, count) {
        var index = list.indexOf(arg);
        if (index !== -1)
          return list.slice(index + 1, index + 1 + (count || 0));
      };
      // Find argument 'arg' in list, and if found, remove it as well as the 'count' items that follow it
      argfunc.remove = function (arg, count) {
        var index = list.indexOf(arg);
        if (index !== -1) list.splice(index, (count || 0) + 1);
      };
      // Clone argument list
      argfunc.clone = function () {
        var cloned = $c3eef7b76ebda48e$var$utils.args();
        cloned(list);
        return cloned;
      };
      return argfunc;
    },
    /**
     * Generate filter strings
     *
     * @param {String[]|Object[]} filters filter specifications. When using objects,
     *   each must have the following properties:
     * @param {String} filters.filter filter name
     * @param {String|Array} [filters.inputs] (array of) input stream specifier(s) for the filter,
     *   defaults to ffmpeg automatically choosing the first unused matching streams
     * @param {String|Array} [filters.outputs] (array of) output stream specifier(s) for the filter,
     *   defaults to ffmpeg automatically assigning the output to the output file
     * @param {Object|String|Array} [filters.options] filter options, can be omitted to not set any options
     * @return String[]
     * @private
     */ makeFilterStrings: function (filters) {
      return filters.map(function (filterSpec) {
        if (typeof filterSpec === "string") return filterSpec;
        var filterString = "";
        // Filter string format is:
        // [input1][input2]...filter[output1][output2]...
        // The 'filter' part can optionaly have arguments:
        //   filter=arg1:arg2:arg3
        //   filter=arg1=v1:arg2=v2:arg3=v3
        // Add inputs
        if (Array.isArray(filterSpec.inputs))
          filterString += filterSpec.inputs
            .map(function (streamSpec) {
              return streamSpec.replace(
                $c3eef7b76ebda48e$var$streamRegexp,
                "[$1]"
              );
            })
            .join("");
        else if (typeof filterSpec.inputs === "string")
          filterString += filterSpec.inputs.replace(
            $c3eef7b76ebda48e$var$streamRegexp,
            "[$1]"
          );
        // Add filter
        filterString += filterSpec.filter;
        // Add options
        if (filterSpec.options) {
          if (
            typeof filterSpec.options === "string" ||
            typeof filterSpec.options === "number"
          )
            // Option string
            filterString += "=" + filterSpec.options;
          else if (Array.isArray(filterSpec.options))
            // Option array (unnamed options)
            filterString +=
              "=" +
              filterSpec.options
                .map(function (option) {
                  if (
                    typeof option === "string" &&
                    option.match($c3eef7b76ebda48e$var$filterEscapeRegexp)
                  )
                    return "'" + option + "'";
                  else return option;
                })
                .join(":");
          else if (Object.keys(filterSpec.options).length)
            // Option object (named options)
            filterString +=
              "=" +
              Object.keys(filterSpec.options)
                .map(function (option) {
                  var value = filterSpec.options[option];
                  if (
                    typeof value === "string" &&
                    value.match($c3eef7b76ebda48e$var$filterEscapeRegexp)
                  )
                    value = "'" + value + "'";
                  return option + "=" + value;
                })
                .join(":");
        }
        // Add outputs
        if (Array.isArray(filterSpec.outputs))
          filterString += filterSpec.outputs
            .map(function (streamSpec) {
              return streamSpec.replace(
                $c3eef7b76ebda48e$var$streamRegexp,
                "[$1]"
              );
            })
            .join("");
        else if (typeof filterSpec.outputs === "string")
          filterString += filterSpec.outputs.replace(
            $c3eef7b76ebda48e$var$streamRegexp,
            "[$1]"
          );
        return filterString;
      });
    },
    /**
     * Search for an executable
     *
     * Uses 'which' or 'where' depending on platform
     *
     * @param {String} name executable name
     * @param {Function} callback callback with signature (err, path)
     * @private
     */ which: function (name, callback) {
      if (name in $c3eef7b76ebda48e$var$whichCache)
        return callback(null, $c3eef7b76ebda48e$var$whichCache[name]);
      $d2MMG(name, function (err, result) {
        if (err)
          // Treat errors as not found
          return callback(null, ($c3eef7b76ebda48e$var$whichCache[name] = ""));
        callback(null, ($c3eef7b76ebda48e$var$whichCache[name] = result));
      });
    },
    /**
     * Convert a [[hh:]mm:]ss[.xxx] timemark into seconds
     *
     * @param {String} timemark timemark string
     * @return Number
     * @private
     */ timemarkToSeconds: function (timemark) {
      if (typeof timemark === "number") return timemark;
      if (timemark.indexOf(":") === -1 && timemark.indexOf(".") >= 0)
        return Number(timemark);
      var parts = timemark.split(":");
      // add seconds
      var secs = Number(parts.pop());
      if (parts.length)
        // add minutes
        secs += Number(parts.pop()) * 60;
      if (parts.length)
        // add hours
        secs += Number(parts.pop()) * 3600;
      return secs;
    },
    /**
     * Extract codec data from ffmpeg stderr and emit 'codecData' event if appropriate
     * Call it with an initially empty codec object once with each line of stderr output until it returns true
     *
     * @param {FfmpegCommand} command event emitter
     * @param {String} stderrLine ffmpeg stderr output line
     * @param {Object} codecObject object used to accumulate codec data between calls
     * @return {Boolean} true if codec data is complete (and event was emitted), false otherwise
     * @private
     */ extractCodecData: function (command, stderrLine, codecsObject) {
      var inputPattern = /Input #[0-9]+, ([^ ]+),/;
      var durPattern = /Duration\: ([^,]+)/;
      var audioPattern = /Audio\: (.*)/;
      var videoPattern = /Video\: (.*)/;
      if (!("inputStack" in codecsObject)) {
        codecsObject.inputStack = [];
        codecsObject.inputIndex = -1;
        codecsObject.inInput = false;
      }
      var inputStack = codecsObject.inputStack;
      var inputIndex = codecsObject.inputIndex;
      var inInput = codecsObject.inInput;
      var format, dur, audio, video;
      if ((format = stderrLine.match(inputPattern))) {
        inInput = codecsObject.inInput = true;
        inputIndex = codecsObject.inputIndex = codecsObject.inputIndex + 1;
        inputStack[inputIndex] = {
          format: format[1],
          audio: "",
          video: "",
          duration: "",
        };
      } else if (inInput && (dur = stderrLine.match(durPattern)))
        inputStack[inputIndex].duration = dur[1];
      else if (inInput && (audio = stderrLine.match(audioPattern))) {
        audio = audio[1].split(", ");
        inputStack[inputIndex].audio = audio[0];
        inputStack[inputIndex].audio_details = audio;
      } else if (inInput && (video = stderrLine.match(videoPattern))) {
        video = video[1].split(", ");
        inputStack[inputIndex].video = video[0];
        inputStack[inputIndex].video_details = video;
      } else if (/Output #\d+/.test(stderrLine))
        inInput = codecsObject.inInput = false;
      else if (
        /Stream mapping:|Press (\[q\]|ctrl-c) to stop/.test(stderrLine)
      ) {
        command.emit.apply(command, ["codecData"].concat(inputStack));
        return true;
      }
      return false;
    },
    /**
     * Extract progress data from ffmpeg stderr and emit 'progress' event if appropriate
     *
     * @param {FfmpegCommand} command event emitter
     * @param {String} stderrLine ffmpeg stderr data
     * @private
     */ extractProgress: function (command, stderrLine) {
      var progress = $c3eef7b76ebda48e$var$parseProgressLine(stderrLine);
      if (progress) {
        // build progress report object
        var ret = {
          frames: parseInt(progress.frame, 10),
          currentFps: parseInt(progress.fps, 10),
          currentKbps: progress.bitrate
            ? parseFloat(progress.bitrate.replace("kbits/s", ""))
            : 0,
          targetSize: parseInt(progress.size || progress.Lsize, 10),
          timemark: progress.time,
        };
        // calculate percent progress using duration
        if (
          command._ffprobeData &&
          command._ffprobeData.format &&
          command._ffprobeData.format.duration
        ) {
          var duration = Number(command._ffprobeData.format.duration);
          if (!isNaN(duration))
            ret.percent =
              ($c3eef7b76ebda48e$var$utils.timemarkToSeconds(ret.timemark) /
                duration) *
              100;
        }
        command.emit("progress", ret);
      }
    },
    /**
     * Extract error message(s) from ffmpeg stderr
     *
     * @param {String} stderr ffmpeg stderr data
     * @return {String}
     * @private
     */ extractError: function (stderr) {
      // Only return the last stderr lines that don't start with a space or a square bracket
      return stderr
        .split($c3eef7b76ebda48e$var$nlRegexp)
        .reduce(function (messages, message) {
          if (message.charAt(0) === " " || message.charAt(0) === "[") return [];
          else {
            messages.push(message);
            return messages;
          }
        }, [])
        .join("\n");
    },
    /**
     * Creates a line ring buffer object with the following methods:
     * - append(str) : appends a string or buffer
     * - get() : returns the whole string
     * - close() : prevents further append() calls and does a last call to callbacks
     * - callback(cb) : calls cb for each line (incl. those already in the ring)
     *
     * @param {Numebr} maxLines maximum number of lines to store (<= 0 for unlimited)
     */ linesRing: function (maxLines) {
      var cbs = [];
      var lines = [];
      var current = null;
      var closed = false;
      var max = maxLines - 1;
      function emit(line) {
        cbs.forEach(function (cb) {
          cb(line);
        });
      }
      return {
        callback: function (cb) {
          lines.forEach(function (l) {
            cb(l);
          });
          cbs.push(cb);
        },
        append: function (str) {
          if (closed) return;
          if (str instanceof $c3eef7b76ebda48e$require$Buffer) str = "" + str;
          if (!str || str.length === 0) return;
          var newLines = str.split($c3eef7b76ebda48e$var$nlRegexp);
          if (newLines.length === 1) {
            if (current !== null) current = current + newLines.shift();
            else current = newLines.shift();
          } else {
            if (current !== null) {
              current = current + newLines.shift();
              emit(current);
              lines.push(current);
            }
            current = newLines.pop();
            newLines.forEach(function (l) {
              emit(l);
              lines.push(l);
            });
            if (max > -1 && lines.length > max)
              lines.splice(0, lines.length - max);
          }
        },
        get: function () {
          if (current !== null) return lines.concat([current]).join("\n");
          else return lines.join("\n");
        },
        close: function () {
          if (closed) return;
          if (current !== null) {
            emit(current);
            lines.push(current);
            if (max > -1 && lines.length > max) lines.shift();
            current = null;
          }
          closed = true;
        },
      };
    },
  });
});
parcelRequire.register("d2MMG", function (module, exports) {
  module.exports = $97f14dcbdc726eaa$var$which;
  $97f14dcbdc726eaa$var$which.sync = $97f14dcbdc726eaa$var$whichSync;
  var $97f14dcbdc726eaa$var$isWindows =
    $bFvJb$process.platform === "win32" || false || false;

  var $97f14dcbdc726eaa$var$COLON = $97f14dcbdc726eaa$var$isWindows ? ";" : ":";

  var $iHffM = parcelRequire("iHffM");
  function $97f14dcbdc726eaa$var$getNotFoundError(cmd) {
    var er = new Error("not found: " + cmd);
    er.code = "ENOENT";
    return er;
  }
  function $97f14dcbdc726eaa$var$getPathInfo(cmd, opt) {
    var colon = opt.colon || $97f14dcbdc726eaa$var$COLON;
    var pathEnv = opt.path || undefined || "";
    var pathExt = [""];
    pathEnv = pathEnv.split(colon);
    var pathExtExe = "";
    if ($97f14dcbdc726eaa$var$isWindows) {
      pathEnv.unshift($bFvJb$process.cwd());
      pathExtExe = opt.pathExt || undefined || ".EXE;.CMD;.BAT;.COM";
      pathExt = pathExtExe.split(colon);
      // Always test the cmd itself first.  isexe will check to make sure
      // it's found in the pathExt set.
      if (cmd.indexOf(".") !== -1 && pathExt[0] !== "") pathExt.unshift("");
    }
    // If it has a slash, then we don't bother searching the pathenv.
    // just check the file itself, and that's it.
    if (cmd.match(/\//) || ($97f14dcbdc726eaa$var$isWindows && cmd.match(/\\/)))
      pathEnv = [""];
    return {
      env: pathEnv,
      ext: pathExt,
      extExe: pathExtExe,
    };
  }
  function $97f14dcbdc726eaa$var$which(cmd, opt, cb) {
    if (typeof opt === "function") {
      cb = opt;
      opt = {};
    }
    var info = $97f14dcbdc726eaa$var$getPathInfo(cmd, opt);
    var pathEnv = info.env;
    var pathExt = info.ext;
    var pathExtExe = info.extExe;
    var found = [];
    (function F(i, l) {
      if (i === l) {
        if (opt.all && found.length) return cb(null, found);
        else return cb($97f14dcbdc726eaa$var$getNotFoundError(cmd));
      }
      var pathPart = pathEnv[i];
      if (pathPart.charAt(0) === '"' && pathPart.slice(-1) === '"')
        pathPart = pathPart.slice(1, -1);
      var p = $bFvJb$path.join(pathPart, cmd);
      if (!pathPart && /^\.[\\\/]/.test(cmd)) p = cmd.slice(0, 2) + p;
      (function E(ii, ll) {
        if (ii === ll) return F(i + 1, l);
        var ext = pathExt[ii];
        $iHffM(
          p + ext,
          {
            pathExt: pathExtExe,
          },
          function (er, is) {
            if (!er && is) {
              if (opt.all) found.push(p + ext);
              else return cb(null, p + ext);
            }
            return E(ii + 1, ll);
          }
        );
      })(0, pathExt.length);
    })(0, pathEnv.length);
  }
  function $97f14dcbdc726eaa$var$whichSync(cmd, opt) {
    opt = opt || {};
    var info = $97f14dcbdc726eaa$var$getPathInfo(cmd, opt);
    var pathEnv = info.env;
    var pathExt = info.ext;
    var pathExtExe = info.extExe;
    var found = [];
    for (var i = 0, l = pathEnv.length; i < l; i++) {
      var pathPart = pathEnv[i];
      if (pathPart.charAt(0) === '"' && pathPart.slice(-1) === '"')
        pathPart = pathPart.slice(1, -1);
      var p = $bFvJb$path.join(pathPart, cmd);
      if (!pathPart && /^\.[\\\/]/.test(cmd)) p = cmd.slice(0, 2) + p;
      for (var j = 0, ll = pathExt.length; j < ll; j++) {
        var cur = p + pathExt[j];
        var is;
        try {
          is = $iHffM.sync(cur, {
            pathExt: pathExtExe,
          });
          if (is) {
            if (opt.all) found.push(cur);
            else return cur;
          }
        } catch (ex) {}
      }
    }
    if (opt.all && found.length) return found;
    if (opt.nothrow) return null;
    throw $97f14dcbdc726eaa$var$getNotFoundError(cmd);
  }
});
parcelRequire.register("iHffM", function (module, exports) {
  var $d9c8132d681abf95$var$core;

  if ($bFvJb$process.platform === "win32" || $parcel$global.TESTING_WINDOWS)
    $d9c8132d681abf95$var$core = parcelRequire("hH5n7");
  else $d9c8132d681abf95$var$core = parcelRequire("6u5Es");
  module.exports = $d9c8132d681abf95$var$isexe;
  $d9c8132d681abf95$var$isexe.sync = $d9c8132d681abf95$var$sync;
  function $d9c8132d681abf95$var$isexe(path, options, cb) {
    if (typeof options === "function") {
      cb = options;
      options = {};
    }
    if (!cb) {
      if (typeof Promise !== "function")
        throw new TypeError("callback not provided");
      return new Promise(function (resolve, reject) {
        $d9c8132d681abf95$var$isexe(path, options || {}, function (er, is) {
          if (er) reject(er);
          else resolve(is);
        });
      });
    }
    $d9c8132d681abf95$var$core(path, options || {}, function (er, is) {
      // ignore EACCES because that just means we aren't allowed to run it
      if (er) {
        if (er.code === "EACCES" || (options && options.ignoreErrors)) {
          er = null;
          is = false;
        }
      }
      cb(er, is);
    });
  }
  function $d9c8132d681abf95$var$sync(path, options) {
    // my kingdom for a filtered catch
    try {
      return $d9c8132d681abf95$var$core.sync(path, options || {});
    } catch (er) {
      if ((options && options.ignoreErrors) || er.code === "EACCES")
        return false;
      else throw er;
    }
  }
});
parcelRequire.register("hH5n7", function (module, exports) {
  module.exports = $ce1a9e952bcf5b9f$var$isexe;
  $ce1a9e952bcf5b9f$var$isexe.sync = $ce1a9e952bcf5b9f$var$sync;

  function $ce1a9e952bcf5b9f$var$checkPathExt(path, options) {
    var pathext = options.pathExt !== undefined ? options.pathExt : undefined;
    if (!pathext) return true;
    pathext = pathext.split(";");
    if (pathext.indexOf("") !== -1) return true;
    for (var i = 0; i < pathext.length; i++) {
      var p = pathext[i].toLowerCase();
      if (p && path.substr(-p.length).toLowerCase() === p) return true;
    }
    return false;
  }
  function $ce1a9e952bcf5b9f$var$checkStat(stat, path, options) {
    if (!stat.isSymbolicLink() && !stat.isFile()) return false;
    return $ce1a9e952bcf5b9f$var$checkPathExt(path, options);
  }
  function $ce1a9e952bcf5b9f$var$isexe(path, options, cb) {
    $bFvJb$fs.stat(path, function (er, stat) {
      cb(er, er ? false : $ce1a9e952bcf5b9f$var$checkStat(stat, path, options));
    });
  }
  function $ce1a9e952bcf5b9f$var$sync(path, options) {
    return $ce1a9e952bcf5b9f$var$checkStat(
      $bFvJb$fs.statSync(path),
      path,
      options
    );
  }
});

parcelRequire.register("6u5Es", function (module, exports) {
  module.exports = $4b89edb59123e8b3$var$isexe;
  $4b89edb59123e8b3$var$isexe.sync = $4b89edb59123e8b3$var$sync;

  function $4b89edb59123e8b3$var$isexe(path, options, cb) {
    $bFvJb$fs.stat(path, function (er, stat) {
      cb(er, er ? false : $4b89edb59123e8b3$var$checkStat(stat, options));
    });
  }
  function $4b89edb59123e8b3$var$sync(path, options) {
    return $4b89edb59123e8b3$var$checkStat($bFvJb$fs.statSync(path), options);
  }
  function $4b89edb59123e8b3$var$checkStat(stat, options) {
    return stat.isFile() && $4b89edb59123e8b3$var$checkMode(stat, options);
  }
  function $4b89edb59123e8b3$var$checkMode(stat, options) {
    var mod = stat.mode;
    var uid = stat.uid;
    var gid = stat.gid;
    var myUid =
      options.uid !== undefined
        ? options.uid
        : $bFvJb$process.getuid && $bFvJb$process.getuid();
    var myGid =
      options.gid !== undefined
        ? options.gid
        : $bFvJb$process.getgid && $bFvJb$process.getgid();
    var u = parseInt("100", 8);
    var g = parseInt("010", 8);
    var o = parseInt("001", 8);
    var ug = u | g;
    var ret =
      mod & o ||
      (mod & g && gid === myGid) ||
      (mod & u && uid === myUid) ||
      (mod & ug && myUid === 0);
    return ret;
  }
});

parcelRequire.register("6TC10", function (module, exports) {
  /*jshint node:true*/ "use strict";

  var $gOWQU = parcelRequire("gOWQU");
  /*
   *! Input-related methods
   */ module.exports = function (proto) {
    /**
     * Add an input to command
     *
     * Also switches "current input", that is the input that will be affected
     * by subsequent input-related methods.
     *
     * Note: only one stream input is supported for now.
     *
     * @method FfmpegCommand#input
     * @category Input
     * @aliases mergeAdd,addInput
     *
     * @param {String|Readable} source input file path or readable stream
     * @return FfmpegCommand
     */ proto.mergeAdd =
      proto.addInput =
      proto.input =
        function (source) {
          var isFile = false;
          var isStream = false;
          if (typeof source !== "string") {
            if (!("readable" in source) || !source.readable)
              throw new Error("Invalid input");
            var hasInputStream = this._inputs.some(function (input) {
              return input.isStream;
            });
            if (hasInputStream)
              throw new Error("Only one input stream is supported");
            isStream = true;
            source.pause();
          } else {
            var protocol = source.match(/^([a-z]{2,}):/i);
            isFile = !protocol || protocol[0] === "file";
          }
          this._inputs.push(
            (this._currentInput = {
              source: source,
              isFile: isFile,
              isStream: isStream,
              options: $gOWQU.args(),
            })
          );
          return this;
        };
    /**
     * Specify input format for the last specified input
     *
     * @method FfmpegCommand#inputFormat
     * @category Input
     * @aliases withInputFormat,fromFormat
     *
     * @param {String} format input format
     * @return FfmpegCommand
     */ proto.withInputFormat =
      proto.inputFormat =
      proto.fromFormat =
        function (format) {
          if (!this._currentInput) throw new Error("No input specified");
          this._currentInput.options("-f", format);
          return this;
        };
    /**
     * Specify input FPS for the last specified input
     * (only valid for raw video formats)
     *
     * @method FfmpegCommand#inputFps
     * @category Input
     * @aliases withInputFps,withInputFPS,withFpsInput,withFPSInput,inputFPS,inputFps,fpsInput
     *
     * @param {Number} fps input FPS
     * @return FfmpegCommand
     */ proto.withInputFps =
      proto.withInputFPS =
      proto.withFpsInput =
      proto.withFPSInput =
      proto.inputFPS =
      proto.inputFps =
      proto.fpsInput =
      proto.FPSInput =
        function (fps) {
          if (!this._currentInput) throw new Error("No input specified");
          this._currentInput.options("-r", fps);
          return this;
        };
    /**
     * Use native framerate for the last specified input
     *
     * @method FfmpegCommand#native
     * @category Input
     * @aliases nativeFramerate,withNativeFramerate
     *
     * @return FfmmegCommand
     */ proto.nativeFramerate =
      proto.withNativeFramerate =
      proto.native =
        function () {
          if (!this._currentInput) throw new Error("No input specified");
          this._currentInput.options("-re");
          return this;
        };
    /**
     * Specify input seek time for the last specified input
     *
     * @method FfmpegCommand#seekInput
     * @category Input
     * @aliases setStartTime,seekTo
     *
     * @param {String|Number} seek seek time in seconds or as a '[hh:[mm:]]ss[.xxx]' string
     * @return FfmpegCommand
     */ proto.setStartTime = proto.seekInput = function (seek) {
      if (!this._currentInput) throw new Error("No input specified");
      this._currentInput.options("-ss", seek);
      return this;
    };
    /**
     * Loop over the last specified input
     *
     * @method FfmpegCommand#loop
     * @category Input
     *
     * @param {String|Number} [duration] loop duration in seconds or as a '[[hh:]mm:]ss[.xxx]' string
     * @return FfmpegCommand
     */ proto.loop = function (duration) {
      if (!this._currentInput) throw new Error("No input specified");
      this._currentInput.options("-loop", "1");
      if (typeof duration !== "undefined") this.duration(duration);
      return this;
    };
  };
});

parcelRequire.register("hyjzu", function (module, exports) {
  /*jshint node:true*/ "use strict";

  var $gOWQU = parcelRequire("gOWQU");
  /*
   *! Audio-related methods
   */ module.exports = function (proto) {
    /**
     * Disable audio in the output
     *
     * @method FfmpegCommand#noAudio
     * @category Audio
     * @aliases withNoAudio
     * @return FfmpegCommand
     */ proto.withNoAudio = proto.noAudio = function () {
      this._currentOutput.audio.clear();
      this._currentOutput.audioFilters.clear();
      this._currentOutput.audio("-an");
      return this;
    };
    /**
     * Specify audio codec
     *
     * @method FfmpegCommand#audioCodec
     * @category Audio
     * @aliases withAudioCodec
     *
     * @param {String} codec audio codec name
     * @return FfmpegCommand
     */ proto.withAudioCodec = proto.audioCodec = function (codec) {
      this._currentOutput.audio("-acodec", codec);
      return this;
    };
    /**
     * Specify audio bitrate
     *
     * @method FfmpegCommand#audioBitrate
     * @category Audio
     * @aliases withAudioBitrate
     *
     * @param {String|Number} bitrate audio bitrate in kbps (with an optional 'k' suffix)
     * @return FfmpegCommand
     */ proto.withAudioBitrate = proto.audioBitrate = function (bitrate) {
      this._currentOutput.audio("-b:a", ("" + bitrate).replace(/k?$/, "k"));
      return this;
    };
    /**
     * Specify audio channel count
     *
     * @method FfmpegCommand#audioChannels
     * @category Audio
     * @aliases withAudioChannels
     *
     * @param {Number} channels channel count
     * @return FfmpegCommand
     */ proto.withAudioChannels = proto.audioChannels = function (channels) {
      this._currentOutput.audio("-ac", channels);
      return this;
    };
    /**
     * Specify audio frequency
     *
     * @method FfmpegCommand#audioFrequency
     * @category Audio
     * @aliases withAudioFrequency
     *
     * @param {Number} freq audio frequency in Hz
     * @return FfmpegCommand
     */ proto.withAudioFrequency = proto.audioFrequency = function (freq) {
      this._currentOutput.audio("-ar", freq);
      return this;
    };
    /**
     * Specify audio quality
     *
     * @method FfmpegCommand#audioQuality
     * @category Audio
     * @aliases withAudioQuality
     *
     * @param {Number} quality audio quality factor
     * @return FfmpegCommand
     */ proto.withAudioQuality = proto.audioQuality = function (quality) {
      this._currentOutput.audio("-aq", quality);
      return this;
    };
    /**
     * Specify custom audio filter(s)
     *
     * Can be called both with one or many filters, or a filter array.
     *
     * @example
     * command.audioFilters('filter1');
     *
     * @example
     * command.audioFilters('filter1', 'filter2=param1=value1:param2=value2');
     *
     * @example
     * command.audioFilters(['filter1', 'filter2']);
     *
     * @example
     * command.audioFilters([
     *   {
     *     filter: 'filter1'
     *   },
     *   {
     *     filter: 'filter2',
     *     options: 'param=value:param=value'
     *   }
     * ]);
     *
     * @example
     * command.audioFilters(
     *   {
     *     filter: 'filter1',
     *     options: ['value1', 'value2']
     *   },
     *   {
     *     filter: 'filter2',
     *     options: { param1: 'value1', param2: 'value2' }
     *   }
     * );
     *
     * @method FfmpegCommand#audioFilters
     * @aliases withAudioFilter,withAudioFilters,audioFilter
     * @category Audio
     *
     * @param {...String|String[]|Object[]} filters audio filter strings, string array or
     *   filter specification array, each with the following properties:
     * @param {String} filters.filter filter name
     * @param {String|String[]|Object} [filters.options] filter option string, array, or object
     * @return FfmpegCommand
     */ proto.withAudioFilter =
      proto.withAudioFilters =
      proto.audioFilter =
      proto.audioFilters =
        function (filters) {
          if (arguments.length > 1) filters = [].slice.call(arguments);
          if (!Array.isArray(filters)) filters = [filters];
          this._currentOutput.audioFilters($gOWQU.makeFilterStrings(filters));
          return this;
        };
  };
});

parcelRequire.register("e14We", function (module, exports) {
  /*jshint node:true*/ "use strict";

  var $gOWQU = parcelRequire("gOWQU");
  /*
   *! Video-related methods
   */ module.exports = function (proto) {
    /**
     * Disable video in the output
     *
     * @method FfmpegCommand#noVideo
     * @category Video
     * @aliases withNoVideo
     *
     * @return FfmpegCommand
     */ proto.withNoVideo = proto.noVideo = function () {
      this._currentOutput.video.clear();
      this._currentOutput.videoFilters.clear();
      this._currentOutput.video("-vn");
      return this;
    };
    /**
     * Specify video codec
     *
     * @method FfmpegCommand#videoCodec
     * @category Video
     * @aliases withVideoCodec
     *
     * @param {String} codec video codec name
     * @return FfmpegCommand
     */ proto.withVideoCodec = proto.videoCodec = function (codec) {
      this._currentOutput.video("-vcodec", codec);
      return this;
    };
    /**
     * Specify video bitrate
     *
     * @method FfmpegCommand#videoBitrate
     * @category Video
     * @aliases withVideoBitrate
     *
     * @param {String|Number} bitrate video bitrate in kbps (with an optional 'k' suffix)
     * @param {Boolean} [constant=false] enforce constant bitrate
     * @return FfmpegCommand
     */ proto.withVideoBitrate = proto.videoBitrate = function (
      bitrate,
      constant
    ) {
      bitrate = ("" + bitrate).replace(/k?$/, "k");
      this._currentOutput.video("-b:v", bitrate);
      if (constant)
        this._currentOutput.video(
          "-maxrate",
          bitrate,
          "-minrate",
          bitrate,
          "-bufsize",
          "3M"
        );
      return this;
    };
    /**
     * Specify custom video filter(s)
     *
     * Can be called both with one or many filters, or a filter array.
     *
     * @example
     * command.videoFilters('filter1');
     *
     * @example
     * command.videoFilters('filter1', 'filter2=param1=value1:param2=value2');
     *
     * @example
     * command.videoFilters(['filter1', 'filter2']);
     *
     * @example
     * command.videoFilters([
     *   {
     *     filter: 'filter1'
     *   },
     *   {
     *     filter: 'filter2',
     *     options: 'param=value:param=value'
     *   }
     * ]);
     *
     * @example
     * command.videoFilters(
     *   {
     *     filter: 'filter1',
     *     options: ['value1', 'value2']
     *   },
     *   {
     *     filter: 'filter2',
     *     options: { param1: 'value1', param2: 'value2' }
     *   }
     * );
     *
     * @method FfmpegCommand#videoFilters
     * @category Video
     * @aliases withVideoFilter,withVideoFilters,videoFilter
     *
     * @param {...String|String[]|Object[]} filters video filter strings, string array or
     *   filter specification array, each with the following properties:
     * @param {String} filters.filter filter name
     * @param {String|String[]|Object} [filters.options] filter option string, array, or object
     * @return FfmpegCommand
     */ proto.withVideoFilter =
      proto.withVideoFilters =
      proto.videoFilter =
      proto.videoFilters =
        function (filters) {
          if (arguments.length > 1) filters = [].slice.call(arguments);
          if (!Array.isArray(filters)) filters = [filters];
          this._currentOutput.videoFilters($gOWQU.makeFilterStrings(filters));
          return this;
        };
    /**
     * Specify output FPS
     *
     * @method FfmpegCommand#fps
     * @category Video
     * @aliases withOutputFps,withOutputFPS,withFpsOutput,withFPSOutput,withFps,withFPS,outputFPS,outputFps,fpsOutput,FPSOutput,FPS
     *
     * @param {Number} fps output FPS
     * @return FfmpegCommand
     */ proto.withOutputFps =
      proto.withOutputFPS =
      proto.withFpsOutput =
      proto.withFPSOutput =
      proto.withFps =
      proto.withFPS =
      proto.outputFPS =
      proto.outputFps =
      proto.fpsOutput =
      proto.FPSOutput =
      proto.fps =
      proto.FPS =
        function (fps) {
          this._currentOutput.video("-r", fps);
          return this;
        };
    /**
     * Only transcode a certain number of frames
     *
     * @method FfmpegCommand#frames
     * @category Video
     * @aliases takeFrames,withFrames
     *
     * @param {Number} frames frame count
     * @return FfmpegCommand
     */ proto.takeFrames =
      proto.withFrames =
      proto.frames =
        function (frames) {
          this._currentOutput.video("-vframes", frames);
          return this;
        };
  };
});

parcelRequire.register("b4lGs", function (module, exports) {
  /*jshint node:true*/ "use strict";
  /*
   *! Size helpers
   */ /**
   * Return filters to pad video to width*height,
   *
   * @param {Number} width output width
   * @param {Number} height output height
   * @param {Number} aspect video aspect ratio (without padding)
   * @param {Number} color padding color
   * @return scale/pad filters
   * @private
   */ function $80f0e35dc9cac0d2$var$getScalePadFilters(
    width,
    height,
    aspect,
    color
  ) {
    /*
    let a be the input aspect ratio, A be the requested aspect ratio

    if a > A, padding is done on top and bottom
    if a < A, padding is done on left and right
   */ return [
      /*
      In both cases, we first have to scale the input to match the requested size.
      When using computed width/height, we truncate them to multiples of 2
     */ {
        filter: "scale",
        options: {
          w:
            "if(gt(a," +
            aspect +
            ")," +
            width +
            ",trunc(" +
            height +
            "*a/2)*2)",
          h:
            "if(lt(a," +
            aspect +
            ")," +
            height +
            ",trunc(" +
            width +
            "/a/2)*2)",
        },
      },
      /*
      Then we pad the scaled input to match the target size
      (here iw and ih refer to the padding input, i.e the scaled output)
     */ {
        filter: "pad",
        options: {
          w: width,
          h: height,
          x: "if(gt(a," + aspect + "),0,(" + width + "-iw)/2)",
          y: "if(lt(a," + aspect + "),0,(" + height + "-ih)/2)",
          color: color,
        },
      },
    ];
  }
  /**
   * Recompute size filters
   *
   * @param {Object} output
   * @param {String} key newly-added parameter name ('size', 'aspect' or 'pad')
   * @param {String} value newly-added parameter value
   * @return filter string array
   * @private
   */ function $80f0e35dc9cac0d2$var$createSizeFilters(output, key, value) {
    // Store parameters
    var data = (output.sizeData = output.sizeData || {});
    data[key] = value;
    if (!("size" in data))
      // No size requested, keep original size
      return [];
    // Try to match the different size string formats
    var fixedSize = data.size.match(/([0-9]+)x([0-9]+)/);
    var fixedWidth = data.size.match(/([0-9]+)x\?/);
    var fixedHeight = data.size.match(/\?x([0-9]+)/);
    var percentRatio = data.size.match(/\b([0-9]{1,3})%/);
    var width, height, aspect;
    if (percentRatio) {
      var ratio = Number(percentRatio[1]) / 100;
      return [
        {
          filter: "scale",
          options: {
            w: "trunc(iw*" + ratio + "/2)*2",
            h: "trunc(ih*" + ratio + "/2)*2",
          },
        },
      ];
    } else if (fixedSize) {
      // Round target size to multiples of 2
      width = Math.round(Number(fixedSize[1]) / 2) * 2;
      height = Math.round(Number(fixedSize[2]) / 2) * 2;
      aspect = width / height;
      if (data.pad)
        return $80f0e35dc9cac0d2$var$getScalePadFilters(
          width,
          height,
          aspect,
          data.pad
        );
      // No autopad requested, rescale to target size
      else
        return [
          {
            filter: "scale",
            options: {
              w: width,
              h: height,
            },
          },
        ];
    } else if (fixedWidth || fixedHeight) {
      if ("aspect" in data) {
        // Specified aspect ratio
        width = fixedWidth
          ? fixedWidth[1]
          : Math.round(Number(fixedHeight[1]) * data.aspect);
        height = fixedHeight
          ? fixedHeight[1]
          : Math.round(Number(fixedWidth[1]) / data.aspect);
        // Round to multiples of 2
        width = Math.round(width / 2) * 2;
        height = Math.round(height / 2) * 2;
        if (data.pad)
          return $80f0e35dc9cac0d2$var$getScalePadFilters(
            width,
            height,
            data.aspect,
            data.pad
          );
        // No autopad requested, rescale to target size
        else
          return [
            {
              filter: "scale",
              options: {
                w: width,
                h: height,
              },
            },
          ];
      } else {
        // Keep input aspect ratio
        if (fixedWidth)
          return [
            {
              filter: "scale",
              options: {
                w: Math.round(Number(fixedWidth[1]) / 2) * 2,
                h: "trunc(ow/a/2)*2",
              },
            },
          ];
        else
          return [
            {
              filter: "scale",
              options: {
                w: "trunc(oh*a/2)*2",
                h: Math.round(Number(fixedHeight[1]) / 2) * 2,
              },
            },
          ];
      }
    } else throw new Error("Invalid size specified: " + data.size);
  }
  /*
   *! Video size-related methods
   */ module.exports = function (proto) {
    /**
     * Keep display aspect ratio
     *
     * This method is useful when converting an input with non-square pixels to an output format
     * that does not support non-square pixels.  It rescales the input so that the display aspect
     * ratio is the same.
     *
     * @method FfmpegCommand#keepDAR
     * @category Video size
     * @aliases keepPixelAspect,keepDisplayAspect,keepDisplayAspectRatio
     *
     * @return FfmpegCommand
     */ proto.keepPixelAspect =
      proto.keepDisplayAspect =
      proto.keepDisplayAspectRatio =
      proto.keepDAR =
        function () {
          return this.videoFilters([
            {
              filter: "scale",
              options: {
                w: "if(gt(sar,1),iw*sar,iw)",
                h: "if(lt(sar,1),ih/sar,ih)",
              },
            },
            {
              filter: "setsar",
              options: "1",
            },
          ]);
        };
    /**
     * Set output size
     *
     * The 'size' parameter can have one of 4 forms:
     * - 'X%': rescale to xx % of the original size
     * - 'WxH': specify width and height
     * - 'Wx?': specify width and compute height from input aspect ratio
     * - '?xH': specify height and compute width from input aspect ratio
     *
     * Note: both dimensions will be truncated to multiples of 2.
     *
     * @method FfmpegCommand#size
     * @category Video size
     * @aliases withSize,setSize
     *
     * @param {String} size size string, eg. '33%', '320x240', '320x?', '?x240'
     * @return FfmpegCommand
     */ proto.withSize =
      proto.setSize =
      proto.size =
        function (size) {
          var filters = $80f0e35dc9cac0d2$var$createSizeFilters(
            this._currentOutput,
            "size",
            size
          );
          this._currentOutput.sizeFilters.clear();
          this._currentOutput.sizeFilters(filters);
          return this;
        };
    /**
     * Set output aspect ratio
     *
     * @method FfmpegCommand#aspect
     * @category Video size
     * @aliases withAspect,withAspectRatio,setAspect,setAspectRatio,aspectRatio
     *
     * @param {String|Number} aspect aspect ratio (number or 'X:Y' string)
     * @return FfmpegCommand
     */ proto.withAspect =
      proto.withAspectRatio =
      proto.setAspect =
      proto.setAspectRatio =
      proto.aspect =
      proto.aspectRatio =
        function (aspect) {
          var a = Number(aspect);
          if (isNaN(a)) {
            var match = aspect.match(/^(\d+):(\d+)$/);
            if (match) a = Number(match[1]) / Number(match[2]);
            else throw new Error("Invalid aspect ratio: " + aspect);
          }
          var filters = $80f0e35dc9cac0d2$var$createSizeFilters(
            this._currentOutput,
            "aspect",
            a
          );
          this._currentOutput.sizeFilters.clear();
          this._currentOutput.sizeFilters(filters);
          return this;
        };
    /**
     * Enable auto-padding the output
     *
     * @method FfmpegCommand#autopad
     * @category Video size
     * @aliases applyAutopadding,applyAutoPadding,applyAutopad,applyAutoPad,withAutopadding,withAutoPadding,withAutopad,withAutoPad,autoPad
     *
     * @param {Boolean} [pad=true] enable/disable auto-padding
     * @param {String} [color='black'] pad color
     */ proto.applyAutopadding =
      proto.applyAutoPadding =
      proto.applyAutopad =
      proto.applyAutoPad =
      proto.withAutopadding =
      proto.withAutoPadding =
      proto.withAutopad =
      proto.withAutoPad =
      proto.autoPad =
      proto.autopad =
        function (pad, color) {
          // Allow autopad(color)
          if (typeof pad === "string") {
            color = pad;
            pad = true;
          }
          // Allow autopad() and autopad(undefined, color)
          if (typeof pad === "undefined") pad = true;
          var filters = $80f0e35dc9cac0d2$var$createSizeFilters(
            this._currentOutput,
            "pad",
            pad ? color || "black" : false
          );
          this._currentOutput.sizeFilters.clear();
          this._currentOutput.sizeFilters(filters);
          return this;
        };
  };
});

parcelRequire.register("hK0sm", function (module, exports) {
  /*jshint node:true*/ "use strict";

  var $gOWQU = parcelRequire("gOWQU");
  /*
   *! Output-related methods
   */ module.exports = function (proto) {
    /**
     * Add output
     *
     * @method FfmpegCommand#output
     * @category Output
     * @aliases addOutput
     *
     * @param {String|Writable} target target file path or writable stream
     * @param {Object} [pipeopts={}] pipe options (only applies to streams)
     * @return FfmpegCommand
     */ proto.addOutput = proto.output = function (target, pipeopts) {
      var isFile = false;
      if (!target && this._currentOutput)
        // No target is only allowed when called from constructor
        throw new Error("Invalid output");
      if (target && typeof target !== "string") {
        if (!("writable" in target) || !target.writable)
          throw new Error("Invalid output");
      } else if (typeof target === "string") {
        var protocol = target.match(/^([a-z]{2,}):/i);
        isFile = !protocol || protocol[0] === "file";
      }
      if (target && !("target" in this._currentOutput)) {
        // For backwards compatibility, set target for first output
        this._currentOutput.target = target;
        this._currentOutput.isFile = isFile;
        this._currentOutput.pipeopts = pipeopts || {};
      } else {
        if (target && typeof target !== "string") {
          var hasOutputStream = this._outputs.some(function (output) {
            return typeof output.target !== "string";
          });
          if (hasOutputStream)
            throw new Error("Only one output stream is supported");
        }
        this._outputs.push(
          (this._currentOutput = {
            target: target,
            isFile: isFile,
            flags: {},
            pipeopts: pipeopts || {},
          })
        );
        var self = this;
        [
          "audio",
          "audioFilters",
          "video",
          "videoFilters",
          "sizeFilters",
          "options",
        ].forEach(function (key) {
          self._currentOutput[key] = $gOWQU.args();
        });
        if (!target)
          // Call from constructor: remove target key
          delete this._currentOutput.target;
      }
      return this;
    };
    /**
     * Specify output seek time
     *
     * @method FfmpegCommand#seek
     * @category Input
     * @aliases seekOutput
     *
     * @param {String|Number} seek seek time in seconds or as a '[hh:[mm:]]ss[.xxx]' string
     * @return FfmpegCommand
     */ proto.seekOutput = proto.seek = function (seek) {
      this._currentOutput.options("-ss", seek);
      return this;
    };
    /**
     * Set output duration
     *
     * @method FfmpegCommand#duration
     * @category Output
     * @aliases withDuration,setDuration
     *
     * @param {String|Number} duration duration in seconds or as a '[[hh:]mm:]ss[.xxx]' string
     * @return FfmpegCommand
     */ proto.withDuration =
      proto.setDuration =
      proto.duration =
        function (duration) {
          this._currentOutput.options("-t", duration);
          return this;
        };
    /**
     * Set output format
     *
     * @method FfmpegCommand#format
     * @category Output
     * @aliases toFormat,withOutputFormat,outputFormat
     *
     * @param {String} format output format name
     * @return FfmpegCommand
     */ proto.toFormat =
      proto.withOutputFormat =
      proto.outputFormat =
      proto.format =
        function (format) {
          this._currentOutput.options("-f", format);
          return this;
        };
    /**
     * Add stream mapping to output
     *
     * @method FfmpegCommand#map
     * @category Output
     *
     * @param {String} spec stream specification string, with optional square brackets
     * @return FfmpegCommand
     */ proto.map = function (spec) {
      this._currentOutput.options(
        "-map",
        spec.replace($gOWQU.streamRegexp, "[$1]")
      );
      return this;
    };
    /**
     * Run flvtool2/flvmeta on output
     *
     * @method FfmpegCommand#flvmeta
     * @category Output
     * @aliases updateFlvMetadata
     *
     * @return FfmpegCommand
     */ proto.updateFlvMetadata = proto.flvmeta = function () {
      this._currentOutput.flags.flvmeta = true;
      return this;
    };
  };
});

parcelRequire.register("bKZ8J", function (module, exports) {
  /*jshint node:true*/ "use strict";

  var $gOWQU = parcelRequire("gOWQU");
  /*
   *! Custom options methods
   */ module.exports = function (proto) {
    /**
     * Add custom input option(s)
     *
     * When passing a single string or an array, each string containing two
     * words is split (eg. inputOptions('-option value') is supported) for
     * compatibility reasons.  This is not the case when passing more than
     * one argument.
     *
     * @example
     * command.inputOptions('option1');
     *
     * @example
     * command.inputOptions('option1', 'option2');
     *
     * @example
     * command.inputOptions(['option1', 'option2']);
     *
     * @method FfmpegCommand#inputOptions
     * @category Custom options
     * @aliases addInputOption,addInputOptions,withInputOption,withInputOptions,inputOption
     *
     * @param {...String} options option string(s) or string array
     * @return FfmpegCommand
     */ proto.addInputOption =
      proto.addInputOptions =
      proto.withInputOption =
      proto.withInputOptions =
      proto.inputOption =
      proto.inputOptions =
        function (options) {
          if (!this._currentInput) throw new Error("No input specified");
          var doSplit = true;
          if (arguments.length > 1) {
            options = [].slice.call(arguments);
            doSplit = false;
          }
          if (!Array.isArray(options)) options = [options];
          this._currentInput.options(
            options.reduce(function (options, option) {
              var split = String(option).split(" ");
              if (doSplit && split.length === 2)
                options.push(split[0], split[1]);
              else options.push(option);
              return options;
            }, [])
          );
          return this;
        };
    /**
     * Add custom output option(s)
     *
     * @example
     * command.outputOptions('option1');
     *
     * @example
     * command.outputOptions('option1', 'option2');
     *
     * @example
     * command.outputOptions(['option1', 'option2']);
     *
     * @method FfmpegCommand#outputOptions
     * @category Custom options
     * @aliases addOutputOption,addOutputOptions,addOption,addOptions,withOutputOption,withOutputOptions,withOption,withOptions,outputOption
     *
     * @param {...String} options option string(s) or string array
     * @return FfmpegCommand
     */ proto.addOutputOption =
      proto.addOutputOptions =
      proto.addOption =
      proto.addOptions =
      proto.withOutputOption =
      proto.withOutputOptions =
      proto.withOption =
      proto.withOptions =
      proto.outputOption =
      proto.outputOptions =
        function (options) {
          var doSplit = true;
          if (arguments.length > 1) {
            options = [].slice.call(arguments);
            doSplit = false;
          }
          if (!Array.isArray(options)) options = [options];
          this._currentOutput.options(
            options.reduce(function (options, option) {
              var split = String(option).split(" ");
              if (doSplit && split.length === 2)
                options.push(split[0], split[1]);
              else options.push(option);
              return options;
            }, [])
          );
          return this;
        };
    /**
     * Specify a complex filtergraph
     *
     * Calling this method will override any previously set filtergraph, but you can set
     * as many filters as needed in one call.
     *
     * @example <caption>Overlay an image over a video (using a filtergraph string)</caption>
     *   ffmpeg()
     *     .input('video.avi')
     *     .input('image.png')
     *     .complexFilter('[0:v][1:v]overlay[out]', ['out']);
     *
     * @example <caption>Overlay an image over a video (using a filter array)</caption>
     *   ffmpeg()
     *     .input('video.avi')
     *     .input('image.png')
     *     .complexFilter([{
     *       filter: 'overlay',
     *       inputs: ['0:v', '1:v'],
     *       outputs: ['out']
     *     }], ['out']);
     *
     * @example <caption>Split video into RGB channels and output a 3x1 video with channels side to side</caption>
     *  ffmpeg()
     *    .input('video.avi')
     *    .complexFilter([
     *      // Duplicate video stream 3 times into streams a, b, and c
     *      { filter: 'split', options: '3', outputs: ['a', 'b', 'c'] },
     *
     *      // Create stream 'red' by cancelling green and blue channels from stream 'a'
     *      { filter: 'lutrgb', options: { g: 0, b: 0 }, inputs: 'a', outputs: 'red' },
     *
     *      // Create stream 'green' by cancelling red and blue channels from stream 'b'
     *      { filter: 'lutrgb', options: { r: 0, b: 0 }, inputs: 'b', outputs: 'green' },
     *
     *      // Create stream 'blue' by cancelling red and green channels from stream 'c'
     *      { filter: 'lutrgb', options: { r: 0, g: 0 }, inputs: 'c', outputs: 'blue' },
     *
     *      // Pad stream 'red' to 3x width, keeping the video on the left, and name output 'padded'
     *      { filter: 'pad', options: { w: 'iw*3', h: 'ih' }, inputs: 'red', outputs: 'padded' },
     *
     *      // Overlay 'green' onto 'padded', moving it to the center, and name output 'redgreen'
     *      { filter: 'overlay', options: { x: 'w', y: 0 }, inputs: ['padded', 'green'], outputs: 'redgreen'},
     *
     *      // Overlay 'blue' onto 'redgreen', moving it to the right
     *      { filter: 'overlay', options: { x: '2*w', y: 0 }, inputs: ['redgreen', 'blue']},
     *    ]);
     *
     * @method FfmpegCommand#complexFilter
     * @category Custom options
     * @aliases filterGraph
     *
     * @param {String|Array} spec filtergraph string or array of filter specification
     *   objects, each having the following properties:
     * @param {String} spec.filter filter name
     * @param {String|Array} [spec.inputs] (array of) input stream specifier(s) for the filter,
     *   defaults to ffmpeg automatically choosing the first unused matching streams
     * @param {String|Array} [spec.outputs] (array of) output stream specifier(s) for the filter,
     *   defaults to ffmpeg automatically assigning the output to the output file
     * @param {Object|String|Array} [spec.options] filter options, can be omitted to not set any options
     * @param {Array} [map] (array of) stream specifier(s) from the graph to include in
     *   ffmpeg output, defaults to ffmpeg automatically choosing the first matching streams.
     * @return FfmpegCommand
     */ proto.filterGraph = proto.complexFilter = function (spec, map) {
      this._complexFilters.clear();
      if (!Array.isArray(spec)) spec = [spec];
      this._complexFilters(
        "-filter_complex",
        $gOWQU.makeFilterStrings(spec).join(";")
      );
      if (Array.isArray(map)) {
        var self = this;
        map.forEach(function (streamSpec) {
          self._complexFilters(
            "-map",
            streamSpec.replace($gOWQU.streamRegexp, "[$1]")
          );
        });
      } else if (typeof map === "string")
        this._complexFilters("-map", map.replace($gOWQU.streamRegexp, "[$1]"));
      return this;
    };
  };
});

parcelRequire.register("kaFwp", function (module, exports) {
  /*jshint node:true*/ "use strict";

  /*
   *! Miscellaneous methods
   */ module.exports = function (proto) {
    /**
     * Use preset
     *
     * @method FfmpegCommand#preset
     * @category Miscellaneous
     * @aliases usingPreset
     *
     * @param {String|Function} preset preset name or preset function
     */ proto.usingPreset = proto.preset = function (preset) {
      if (typeof preset === "function") preset(this);
      else
        try {
          var modulePath = $bFvJb$path.join(this.options.presets, preset);
          var module1 = require(modulePath);
          if (typeof module1.load === "function") module1.load(this);
          else
            throw new Error("preset " + modulePath + " has no load() function");
        } catch (err) {
          throw new Error(
            "preset " + modulePath + " could not be loaded: " + err.message
          );
        }
      return this;
    };
  };
});

parcelRequire.register("4wWgO", function (module, exports) {
  /*jshint node:true*/ "use strict";

  var $34c759d073ac7609$require$spawn = $bFvJb$child_process.spawn;

  var $aK4hl = parcelRequire("aK4hl");

  var $gOWQU = parcelRequire("gOWQU");
  var $34c759d073ac7609$var$nlRegexp = /\r\n|\r|\n/g;
  /*
   *! Processor methods
   */ /**
   * Run ffprobe asynchronously and store data in command
   *
   * @param {FfmpegCommand} command
   * @private
   */ function $34c759d073ac7609$var$runFfprobe(command) {
    const inputProbeIndex = 0;
    if (command._inputs[inputProbeIndex].isStream)
      // Don't probe input streams as this will consume them
      return;
    command.ffprobe(inputProbeIndex, function (err, data) {
      command._ffprobeData = data;
    });
  }
  module.exports = function (proto) {
    /**
     * Emitted just after ffmpeg has been spawned.
     *
     * @event FfmpegCommand#start
     * @param {String} command ffmpeg command line
     */ /**
     * Emitted when ffmpeg reports progress information
     *
     * @event FfmpegCommand#progress
     * @param {Object} progress progress object
     * @param {Number} progress.frames number of frames transcoded
     * @param {Number} progress.currentFps current processing speed in frames per second
     * @param {Number} progress.currentKbps current output generation speed in kilobytes per second
     * @param {Number} progress.targetSize current output file size
     * @param {String} progress.timemark current video timemark
     * @param {Number} [progress.percent] processing progress (may not be available depending on input)
     */ /**
     * Emitted when ffmpeg outputs to stderr
     *
     * @event FfmpegCommand#stderr
     * @param {String} line stderr output line
     */ /**
     * Emitted when ffmpeg reports input codec data
     *
     * @event FfmpegCommand#codecData
     * @param {Object} codecData codec data object
     * @param {String} codecData.format input format name
     * @param {String} codecData.audio input audio codec name
     * @param {String} codecData.audio_details input audio codec parameters
     * @param {String} codecData.video input video codec name
     * @param {String} codecData.video_details input video codec parameters
     */ /**
     * Emitted when an error happens when preparing or running a command
     *
     * @event FfmpegCommand#error
     * @param {Error} error error object, with optional properties 'inputStreamError' / 'outputStreamError' for errors on their respective streams
     * @param {String|null} stdout ffmpeg stdout, unless outputting to a stream
     * @param {String|null} stderr ffmpeg stderr
     */ /**
     * Emitted when a command finishes processing
     *
     * @event FfmpegCommand#end
     * @param {Array|String|null} [filenames|stdout] generated filenames when taking screenshots, ffmpeg stdout when not outputting to a stream, null otherwise
     * @param {String|null} stderr ffmpeg stderr
     */ /**
     * Spawn an ffmpeg process
     *
     * The 'options' argument may contain the following keys:
     * - 'niceness': specify process niceness, ignored on Windows (default: 0)
     * - `cwd`: change working directory
     * - 'captureStdout': capture stdout and pass it to 'endCB' as its 2nd argument (default: false)
     * - 'stdoutLines': override command limit (default: use command limit)
     *
     * The 'processCB' callback, if present, is called as soon as the process is created and
     * receives a nodejs ChildProcess object.  It may not be called at all if an error happens
     * before spawning the process.
     *
     * The 'endCB' callback is called either when an error occurs or when the ffmpeg process finishes.
     *
     * @method FfmpegCommand#_spawnFfmpeg
     * @param {Array} args ffmpeg command line argument list
     * @param {Object} [options] spawn options (see above)
     * @param {Function} [processCB] callback called with process object and stdout/stderr ring buffers when process has been created
     * @param {Function} endCB callback called with error (if applicable) and stdout/stderr ring buffers when process finished
     * @private
     */ proto._spawnFfmpeg = function (args, options, processCB, endCB) {
      // Enable omitting options
      if (typeof options === "function") {
        endCB = processCB;
        processCB = options;
        options = {};
      }
      // Enable omitting processCB
      if (typeof endCB === "undefined") {
        endCB = processCB;
        processCB = function () {};
      }
      var maxLines =
        "stdoutLines" in options
          ? options.stdoutLines
          : this.options.stdoutLines;
      // Find ffmpeg
      this._getFfmpegPath(function (err, command) {
        if (err) return endCB(err);
        else if (!command || command.length === 0)
          return endCB(new Error("Cannot find ffmpeg"));
        // Apply niceness
        if (options.niceness && options.niceness !== 0 && !$gOWQU.isWindows) {
          args.unshift("-n", options.niceness, command);
          command = "nice";
        }
        var stdoutRing = $gOWQU.linesRing(maxLines);
        var stdoutClosed = false;
        var stderrRing = $gOWQU.linesRing(maxLines);
        var stderrClosed = false;
        // Spawn process
        var ffmpegProc = $34c759d073ac7609$require$spawn(
          command,
          args,
          options
        );
        if (ffmpegProc.stderr) ffmpegProc.stderr.setEncoding("utf8");
        ffmpegProc.on("error", function (err) {
          endCB(err);
        });
        // Ensure we wait for captured streams to end before calling endCB
        var exitError = null;
        function handleExit(err) {
          if (err) exitError = err;
          if (
            processExited &&
            (stdoutClosed || !options.captureStdout) &&
            stderrClosed
          )
            endCB(exitError, stdoutRing, stderrRing);
        }
        // Handle process exit
        var processExited = false;
        ffmpegProc.on("exit", function (code, signal) {
          processExited = true;
          if (signal)
            handleExit(new Error("ffmpeg was killed with signal " + signal));
          else if (code)
            handleExit(new Error("ffmpeg exited with code " + code));
          else handleExit();
        });
        // Capture stdout if specified
        if (options.captureStdout) {
          ffmpegProc.stdout.on("data", function (data) {
            stdoutRing.append(data);
          });
          ffmpegProc.stdout.on("close", function () {
            stdoutRing.close();
            stdoutClosed = true;
            handleExit();
          });
        }
        // Capture stderr if specified
        ffmpegProc.stderr.on("data", function (data) {
          stderrRing.append(data);
        });
        ffmpegProc.stderr.on("close", function () {
          stderrRing.close();
          stderrClosed = true;
          handleExit();
        });
        // Call process callback
        processCB(ffmpegProc, stdoutRing, stderrRing);
      });
    };
    /**
     * Build the argument list for an ffmpeg command
     *
     * @method FfmpegCommand#_getArguments
     * @return argument list
     * @private
     */ proto._getArguments = function () {
      var complexFilters = this._complexFilters.get();
      var fileOutput = this._outputs.some(function (output) {
        return output.isFile;
      });
      return [].concat(
        // Inputs and input options
        this._inputs.reduce(function (args, input) {
          var source =
            typeof input.source === "string" ? input.source : "pipe:0";
          // For each input, add input options, then '-i <source>'
          return args.concat(input.options.get(), ["-i", source]);
        }, []), // Global options
        this._global.get(), // Overwrite if we have file outputs
        fileOutput ? ["-y"] : [], // Complex filters
        complexFilters, // Outputs, filters and output options
        this._outputs.reduce(function (args, output) {
          var sizeFilters = $gOWQU.makeFilterStrings(output.sizeFilters.get());
          var audioFilters = output.audioFilters.get();
          var videoFilters = output.videoFilters.get().concat(sizeFilters);
          var outputArg;
          if (!output.target) outputArg = [];
          else if (typeof output.target === "string")
            outputArg = [output.target];
          else outputArg = ["pipe:1"];
          return args.concat(
            output.audio.get(),
            audioFilters.length ? ["-filter:a", audioFilters.join(",")] : [],
            output.video.get(),
            videoFilters.length ? ["-filter:v", videoFilters.join(",")] : [],
            output.options.get(),
            outputArg
          );
        }, [])
      );
    };
    /**
     * Prepare execution of an ffmpeg command
     *
     * Checks prerequisites for the execution of the command (codec/format availability, flvtool...),
     * then builds the argument list for ffmpeg and pass them to 'callback'.
     *
     * @method FfmpegCommand#_prepare
     * @param {Function} callback callback with signature (err, args)
     * @param {Boolean} [readMetadata=false] read metadata before processing
     * @private
     */ proto._prepare = function (callback, readMetadata) {
      var self = this;
      $aK4hl.waterfall(
        [
          // Check codecs and formats
          function (cb) {
            self._checkCapabilities(cb);
          },
          // Read metadata if required
          function (cb) {
            if (!readMetadata) return cb();
            self.ffprobe(0, function (err, data) {
              if (!err) self._ffprobeData = data;
              cb();
            });
          },
          // Check for flvtool2/flvmeta if necessary
          function (cb) {
            var flvmeta = self._outputs.some(function (output) {
              // Remove flvmeta flag on non-file output
              if (output.flags.flvmeta && !output.isFile) {
                self.logger.warn(
                  "Updating flv metadata is only supported for files"
                );
                output.flags.flvmeta = false;
              }
              return output.flags.flvmeta;
            });
            if (flvmeta)
              self._getFlvtoolPath(function (err) {
                cb(err);
              });
            else cb();
          },
          // Build argument list
          function (cb) {
            var args;
            try {
              args = self._getArguments();
            } catch (e) {
              return cb(e);
            }
            cb(null, args);
          },
          // Add "-strict experimental" option where needed
          function (args, cb) {
            self.availableEncoders(function (err, encoders) {
              for (var i = 0; i < args.length; i++)
                if (args[i] === "-acodec" || args[i] === "-vcodec") {
                  i++;
                  if (args[i] in encoders && encoders[args[i]].experimental) {
                    args.splice(i + 1, 0, "-strict", "experimental");
                    i += 2;
                  }
                }
              cb(null, args);
            });
          },
        ],
        callback
      );
      if (!readMetadata) {
        // Read metadata as soon as 'progress' listeners are added
        if (this.listeners("progress").length > 0)
          // Read metadata in parallel
          $34c759d073ac7609$var$runFfprobe(this);
        // Read metadata as soon as the first 'progress' listener is added
        else
          this.once("newListener", function (event) {
            if (event === "progress") $34c759d073ac7609$var$runFfprobe(this);
          });
      }
    };
    /**
     * Run ffmpeg command
     *
     * @method FfmpegCommand#run
     * @category Processing
     * @aliases exec,execute
     */ proto.exec =
      proto.execute =
      proto.run =
        function () {
          var self = this;
          // Check if at least one output is present
          var outputPresent = this._outputs.some(function (output) {
            return "target" in output;
          });
          if (!outputPresent) throw new Error("No output specified");
          // Get output stream if any
          var outputStream = this._outputs.filter(function (output) {
            return typeof output.target !== "string";
          })[0];
          // Get input stream if any
          var inputStream = this._inputs.filter(function (input) {
            return typeof input.source !== "string";
          })[0];
          // Ensure we send 'end' or 'error' only once
          var ended = false;
          function emitEnd(err, stdout, stderr) {
            if (!ended) {
              ended = true;
              if (err) self.emit("error", err, stdout, stderr);
              else self.emit("end", stdout, stderr);
            }
          }
          self._prepare(function (err, args) {
            if (err) return emitEnd(err);
            // Run ffmpeg
            self._spawnFfmpeg(
              args,
              {
                captureStdout: !outputStream,
                niceness: self.options.niceness,
                cwd: self.options.cwd,
              },
              function processCB(ffmpegProc, stdoutRing, stderrRing) {
                self.ffmpegProc = ffmpegProc;
                self.emit("start", "ffmpeg " + args.join(" "));
                // Pipe input stream if any
                if (inputStream) {
                  inputStream.source.on("error", function (err) {
                    var reportingErr = new Error(
                      "Input stream error: " + err.message
                    );
                    reportingErr.inputStreamError = err;
                    emitEnd(reportingErr);
                    ffmpegProc.kill();
                  });
                  inputStream.source.resume();
                  inputStream.source.pipe(ffmpegProc.stdin);
                  // Set stdin error handler on ffmpeg (prevents nodejs catching the error, but
                  // ffmpeg will fail anyway, so no need to actually handle anything)
                  ffmpegProc.stdin.on("error", function () {});
                }
                // Setup timeout if requested
                var processTimer;
                if (self.options.timeout)
                  processTimer = setTimeout(function () {
                    var msg =
                      "process ran into a timeout (" +
                      self.options.timeout +
                      "s)";
                    emitEnd(new Error(msg), stdoutRing.get(), stderrRing.get());
                    ffmpegProc.kill();
                  }, self.options.timeout * 1000);
                if (outputStream) {
                  // Pipe ffmpeg stdout to output stream
                  ffmpegProc.stdout.pipe(
                    outputStream.target,
                    outputStream.pipeopts
                  );
                  // Handle output stream events
                  outputStream.target.on("close", function () {
                    self.logger.debug(
                      "Output stream closed, scheduling kill for ffmpeg process"
                    );
                    // Don't kill process yet, to give a chance to ffmpeg to
                    // terminate successfully first  This is necessary because
                    // under load, the process 'exit' event sometimes happens
                    // after the output stream 'close' event.
                    setTimeout(function () {
                      emitEnd(new Error("Output stream closed"));
                      ffmpegProc.kill();
                    }, 20);
                  });
                  outputStream.target.on("error", function (err) {
                    self.logger.debug(
                      "Output stream error, killing ffmpeg process"
                    );
                    var reportingErr = new Error(
                      "Output stream error: " + err.message
                    );
                    reportingErr.outputStreamError = err;
                    emitEnd(reportingErr, stdoutRing.get(), stderrRing.get());
                    ffmpegProc.kill("SIGKILL");
                  });
                }
                // Setup stderr handling
                if (stderrRing) {
                  // 'stderr' event
                  if (self.listeners("stderr").length)
                    stderrRing.callback(function (line) {
                      self.emit("stderr", line);
                    });
                  // 'codecData' event
                  if (self.listeners("codecData").length) {
                    var codecDataSent = false;
                    var codecObject = {};
                    stderrRing.callback(function (line) {
                      if (!codecDataSent)
                        codecDataSent = $gOWQU.extractCodecData(
                          self,
                          line,
                          codecObject
                        );
                    });
                  }
                  // 'progress' event
                  if (self.listeners("progress").length)
                    stderrRing.callback(function (line) {
                      $gOWQU.extractProgress(self, line);
                    });
                }
              },
              function endCB(err, stdoutRing, stderrRing) {
                delete self.ffmpegProc;
                if (err) {
                  if (err.message.match(/ffmpeg exited with code/))
                    // Add ffmpeg error message
                    err.message += ": " + $gOWQU.extractError(stderrRing.get());
                  emitEnd(err, stdoutRing.get(), stderrRing.get());
                } else {
                  // Find out which outputs need flv metadata
                  var flvmeta = self._outputs.filter(function (output) {
                    return output.flags.flvmeta;
                  });
                  if (flvmeta.length)
                    self._getFlvtoolPath(function (err, flvtool) {
                      if (err) return emitEnd(err);
                      $aK4hl.each(
                        flvmeta,
                        function (output, cb) {
                          $34c759d073ac7609$require$spawn(flvtool, [
                            "-U",
                            output.target,
                          ])
                            .on("error", function (err) {
                              cb(
                                new Error(
                                  "Error running " +
                                    flvtool +
                                    " on " +
                                    output.target +
                                    ": " +
                                    err.message
                                )
                              );
                            })
                            .on("exit", function (code, signal) {
                              if (code !== 0 || signal)
                                cb(
                                  new Error(
                                    flvtool +
                                      " " +
                                      (signal
                                        ? "received signal " + signal
                                        : "exited with code " + code)
                                  ) +
                                    " when running on " +
                                    output.target
                                );
                              else cb();
                            });
                        },
                        function (err) {
                          if (err) emitEnd(err);
                          else
                            emitEnd(null, stdoutRing.get(), stderrRing.get());
                        }
                      );
                    });
                  else emitEnd(null, stdoutRing.get(), stderrRing.get());
                }
              }
            );
          });
        };
    /**
     * Renice current and/or future ffmpeg processes
     *
     * Ignored on Windows platforms.
     *
     * @method FfmpegCommand#renice
     * @category Processing
     *
     * @param {Number} [niceness=0] niceness value between -20 (highest priority) and 20 (lowest priority)
     * @return FfmpegCommand
     */ proto.renice = function (niceness) {
      if (!$gOWQU.isWindows) {
        niceness = niceness || 0;
        if (niceness < -20 || niceness > 20)
          this.logger.warn(
            "Invalid niceness value: " +
              niceness +
              ", must be between -20 and 20"
          );
        niceness = Math.min(20, Math.max(-20, niceness));
        this.options.niceness = niceness;
        if (this.ffmpegProc) {
          var logger = this.logger;
          var pid = this.ffmpegProc.pid;
          var renice = $34c759d073ac7609$require$spawn("renice", [
            niceness,
            "-p",
            pid,
          ]);
          renice.on("error", function (err) {
            logger.warn("could not renice process " + pid + ": " + err.message);
          });
          renice.on("exit", function (code, signal) {
            if (signal)
              logger.warn(
                "could not renice process " +
                  pid +
                  ": renice was killed by signal " +
                  signal
              );
            else if (code)
              logger.warn(
                "could not renice process " +
                  pid +
                  ": renice exited with " +
                  code
              );
            else
              logger.info(
                "successfully reniced process " +
                  pid +
                  " to " +
                  niceness +
                  " niceness"
              );
          });
        }
      }
      return this;
    };
    /**
     * Kill current ffmpeg process, if any
     *
     * @method FfmpegCommand#kill
     * @category Processing
     *
     * @param {String} [signal=SIGKILL] signal name
     * @return FfmpegCommand
     */ proto.kill = function (signal) {
      if (!this.ffmpegProc)
        this.logger.warn("No running ffmpeg process, cannot send signal");
      else this.ffmpegProc.kill(signal || "SIGKILL");
      return this;
    };
  };
});
parcelRequire.register("aK4hl", function (module, exports) {
  $parcel$export(
    module.exports,
    "each",
    () => $0c84690c59b4ccb2$export$79b2f7037acddd43
  );
  $parcel$export(
    module.exports,
    "waterfall",
    () => $0c84690c59b4ccb2$export$981f466e0ef96280
  );
  /**
   * Creates a continuation function with some arguments already applied.
   *
   * Useful as a shorthand when combined with other control flow functions. Any
   * arguments passed to the returned function are added to the arguments
   * originally passed to apply.
   *
   * @name apply
   * @static
   * @memberOf module:Utils
   * @method
   * @category Util
   * @param {Function} fn - The function you want to eventually apply all
   * arguments to. Invokes with (arguments...).
   * @param {...*} arguments... - Any number of arguments to automatically apply
   * when the continuation is called.
   * @returns {Function} the partially-applied function
   * @example
   *
   * // using apply
   * async.parallel([
   *     async.apply(fs.writeFile, 'testfile1', 'test1'),
   *     async.apply(fs.writeFile, 'testfile2', 'test2')
   * ]);
   *
   *
   * // the same process without using apply
   * async.parallel([
   *     function(callback) {
   *         fs.writeFile('testfile1', 'test1', callback);
   *     },
   *     function(callback) {
   *         fs.writeFile('testfile2', 'test2', callback);
   *     }
   * ]);
   *
   * // It's possible to pass any number of additional arguments when calling the
   * // continuation:
   *
   * node> var fn = async.apply(sys.puts, 'one');
   * node> fn('two', 'three');
   * one
   * two
   * three
   */
  function $0c84690c59b4ccb2$export$5635d7ef4b8fee1c(fn, ...args) {
    return (...callArgs) => fn(...args, ...callArgs);
  }
  function $0c84690c59b4ccb2$var$initialParams(fn) {
    return function (...args /*, callback*/) {
      var callback = args.pop();
      return fn.call(this, args, callback);
    };
  }
  /* istanbul ignore file */ var $0c84690c59b4ccb2$var$hasQueueMicrotask =
    typeof queueMicrotask === "function" && queueMicrotask;
  var $0c84690c59b4ccb2$var$hasSetImmediate =
    typeof setImmediate === "function" && setImmediate;
  var $0c84690c59b4ccb2$var$hasNextTick =
    typeof $bFvJb$process === "object" &&
    typeof $bFvJb$process.nextTick === "function";
  function $0c84690c59b4ccb2$var$fallback(fn) {
    setTimeout(fn, 0);
  }
  function $0c84690c59b4ccb2$var$wrap(defer) {
    return (fn, ...args) => defer(() => fn(...args));
  }
  var $0c84690c59b4ccb2$var$_defer;
  if ($0c84690c59b4ccb2$var$hasQueueMicrotask)
    $0c84690c59b4ccb2$var$_defer = queueMicrotask;
  else if ($0c84690c59b4ccb2$var$hasSetImmediate)
    $0c84690c59b4ccb2$var$_defer = setImmediate;
  else if ($0c84690c59b4ccb2$var$hasNextTick)
    $0c84690c59b4ccb2$var$_defer = $bFvJb$process.nextTick;
  else $0c84690c59b4ccb2$var$_defer = $0c84690c59b4ccb2$var$fallback;
  var $0c84690c59b4ccb2$export$c233f08fbfea0913 = $0c84690c59b4ccb2$var$wrap(
    $0c84690c59b4ccb2$var$_defer
  );
  /**
   * Take a sync function and make it async, passing its return value to a
   * callback. This is useful for plugging sync functions into a waterfall,
   * series, or other async functions. Any arguments passed to the generated
   * function will be passed to the wrapped function (except for the final
   * callback argument). Errors thrown will be passed to the callback.
   *
   * If the function passed to `asyncify` returns a Promise, that promises's
   * resolved/rejected state will be used to call the callback, rather than simply
   * the synchronous return value.
   *
   * This also means you can asyncify ES2017 `async` functions.
   *
   * @name asyncify
   * @static
   * @memberOf module:Utils
   * @method
   * @alias wrapSync
   * @category Util
   * @param {Function} func - The synchronous function, or Promise-returning
   * function to convert to an {@link AsyncFunction}.
   * @returns {AsyncFunction} An asynchronous wrapper of the `func`. To be
   * invoked with `(args..., callback)`.
   * @example
   *
   * // passing a regular synchronous function
   * async.waterfall([
   *     async.apply(fs.readFile, filename, "utf8"),
   *     async.asyncify(JSON.parse),
   *     function (data, next) {
   *         // data is the result of parsing the text.
   *         // If there was a parsing error, it would have been caught.
   *     }
   * ], callback);
   *
   * // passing a function returning a promise
   * async.waterfall([
   *     async.apply(fs.readFile, filename, "utf8"),
   *     async.asyncify(function (contents) {
   *         return db.model.create(contents);
   *     }),
   *     function (model, next) {
   *         // `model` is the instantiated model object.
   *         // If there was an error, this function would be skipped.
   *     }
   * ], callback);
   *
   * // es2017 example, though `asyncify` is not needed if your JS environment
   * // supports async functions out of the box
   * var q = async.queue(async.asyncify(async function(file) {
   *     var intermediateStep = await processFile(file);
   *     return await somePromise(intermediateStep)
   * }));
   *
   * q.push(files);
   */ function $0c84690c59b4ccb2$export$b5d55b15b1db3122(func) {
    if ($0c84690c59b4ccb2$var$isAsync(func))
      return function (...args /*, callback*/) {
        const callback = args.pop();
        const promise = func.apply(this, args);
        return $0c84690c59b4ccb2$var$handlePromise(promise, callback);
      };
    return $0c84690c59b4ccb2$var$initialParams(function (args, callback) {
      var result;
      try {
        result = func.apply(this, args);
      } catch (e) {
        return callback(e);
      }
      // if result is Promise object
      if (result && typeof result.then === "function")
        return $0c84690c59b4ccb2$var$handlePromise(result, callback);
      else callback(null, result);
    });
  }
  function $0c84690c59b4ccb2$var$handlePromise(promise, callback) {
    return promise.then(
      (value) => {
        $0c84690c59b4ccb2$var$invokeCallback(callback, null, value);
      },
      (err) => {
        $0c84690c59b4ccb2$var$invokeCallback(
          callback,
          err && err.message ? err : new Error(err)
        );
      }
    );
  }
  function $0c84690c59b4ccb2$var$invokeCallback(callback, error, value) {
    try {
      callback(error, value);
    } catch (err) {
      $0c84690c59b4ccb2$export$c233f08fbfea0913((e) => {
        throw e;
      }, err);
    }
  }
  function $0c84690c59b4ccb2$var$isAsync(fn) {
    return fn[Symbol.toStringTag] === "AsyncFunction";
  }
  function $0c84690c59b4ccb2$var$isAsyncGenerator(fn) {
    return fn[Symbol.toStringTag] === "AsyncGenerator";
  }
  function $0c84690c59b4ccb2$var$isAsyncIterable(obj) {
    return typeof obj[Symbol.asyncIterator] === "function";
  }
  function $0c84690c59b4ccb2$var$wrapAsync(asyncFn) {
    if (typeof asyncFn !== "function") throw new Error("expected a function");
    return $0c84690c59b4ccb2$var$isAsync(asyncFn)
      ? $0c84690c59b4ccb2$export$b5d55b15b1db3122(asyncFn)
      : asyncFn;
  }
  // conditionally promisify a function.
  // only return a promise if a callback is omitted
  function $0c84690c59b4ccb2$var$awaitify(asyncFn, arity = asyncFn.length) {
    if (!arity) throw new Error("arity is undefined");
    function awaitable(...args) {
      if (typeof args[arity - 1] === "function")
        return asyncFn.apply(this, args);
      return new Promise((resolve, reject) => {
        args[arity - 1] = (err, ...cbArgs) => {
          if (err) return reject(err);
          resolve(cbArgs.length > 1 ? cbArgs : cbArgs[0]);
        };
        asyncFn.apply(this, args);
      });
    }
    return awaitable;
  }
  function $0c84690c59b4ccb2$var$applyEach(eachfn) {
    return function applyEach(fns, ...callArgs) {
      const go = $0c84690c59b4ccb2$var$awaitify(function (callback) {
        var that = this;
        return eachfn(
          fns,
          (fn, cb) => {
            $0c84690c59b4ccb2$var$wrapAsync(fn).apply(
              that,
              callArgs.concat(cb)
            );
          },
          callback
        );
      });
      return go;
    };
  }
  function $0c84690c59b4ccb2$var$_asyncMap(eachfn, arr, iteratee, callback) {
    arr = arr || [];
    var results = [];
    var counter = 0;
    var _iteratee = $0c84690c59b4ccb2$var$wrapAsync(iteratee);
    return eachfn(
      arr,
      (value, _, iterCb) => {
        var index = counter++;
        _iteratee(value, (err, v) => {
          results[index] = v;
          iterCb(err);
        });
      },
      (err) => {
        callback(err, results);
      }
    );
  }
  function $0c84690c59b4ccb2$var$isArrayLike(value) {
    return (
      value &&
      typeof value.length === "number" &&
      value.length >= 0 &&
      value.length % 1 === 0
    );
  }
  // A temporary value used to identify if the loop should be broken.
  // See #1064, #1293
  const $0c84690c59b4ccb2$var$breakLoop = {};
  function $0c84690c59b4ccb2$var$once(fn) {
    function wrapper(...args) {
      if (fn === null) return;
      var callFn = fn;
      fn = null;
      callFn.apply(this, args);
    }
    Object.assign(wrapper, fn);
    return wrapper;
  }
  function $0c84690c59b4ccb2$var$getIterator(coll) {
    return coll[Symbol.iterator] && coll[Symbol.iterator]();
  }
  function $0c84690c59b4ccb2$var$createArrayIterator(coll) {
    var i = -1;
    var len = coll.length;
    return function next() {
      return ++i < len
        ? {
            value: coll[i],
            key: i,
          }
        : null;
    };
  }
  function $0c84690c59b4ccb2$var$createES2015Iterator(iterator) {
    var i = -1;
    return function next() {
      var item = iterator.next();
      if (item.done) return null;
      i++;
      return {
        value: item.value,
        key: i,
      };
    };
  }
  function $0c84690c59b4ccb2$var$createObjectIterator(obj) {
    var okeys = obj ? Object.keys(obj) : [];
    var i = -1;
    var len = okeys.length;
    return function next() {
      var key = okeys[++i];
      if (key === "__proto__") return next();
      return i < len
        ? {
            value: obj[key],
            key: key,
          }
        : null;
    };
  }
  function $0c84690c59b4ccb2$var$createIterator(coll) {
    if ($0c84690c59b4ccb2$var$isArrayLike(coll))
      return $0c84690c59b4ccb2$var$createArrayIterator(coll);
    var iterator = $0c84690c59b4ccb2$var$getIterator(coll);
    return iterator
      ? $0c84690c59b4ccb2$var$createES2015Iterator(iterator)
      : $0c84690c59b4ccb2$var$createObjectIterator(coll);
  }
  function $0c84690c59b4ccb2$var$onlyOnce(fn) {
    return function (...args) {
      if (fn === null) throw new Error("Callback was already called.");
      var callFn = fn;
      fn = null;
      callFn.apply(this, args);
    };
  }
  // for async generators
  function $0c84690c59b4ccb2$var$asyncEachOfLimit(
    generator,
    limit,
    iteratee,
    callback
  ) {
    let done = false;
    let canceled = false;
    let awaiting = false;
    let running = 0;
    let idx = 0;
    function replenish() {
      //console.log('replenish')
      if (running >= limit || awaiting || done) return;
      //console.log('replenish awaiting')
      awaiting = true;
      generator
        .next()
        .then(({ value: value, done: iterDone }) => {
          //console.log('got value', value)
          if (canceled || done) return;
          awaiting = false;
          if (iterDone) {
            done = true;
            if (running <= 0)
              //console.log('done nextCb')
              callback(null);
            return;
          }
          running++;
          iteratee(value, idx, iterateeCallback);
          idx++;
          replenish();
        })
        .catch(handleError);
    }
    function iterateeCallback(err, result) {
      //console.log('iterateeCallback')
      running -= 1;
      if (canceled) return;
      if (err) return handleError(err);
      if (err === false) {
        done = true;
        canceled = true;
        return;
      }
      if (
        result === $0c84690c59b4ccb2$var$breakLoop ||
        (done && running <= 0)
      ) {
        done = true;
        //console.log('done iterCb')
        return callback(null);
      }
      replenish();
    }
    function handleError(err) {
      if (canceled) return;
      awaiting = false;
      done = true;
      callback(err);
    }
    replenish();
  }
  var $0c84690c59b4ccb2$var$eachOfLimit = (limit) => {
    return (obj, iteratee, callback) => {
      callback = $0c84690c59b4ccb2$var$once(callback);
      if (limit <= 0)
        throw new RangeError("concurrency limit cannot be less than 1");
      if (!obj) return callback(null);
      if ($0c84690c59b4ccb2$var$isAsyncGenerator(obj))
        return $0c84690c59b4ccb2$var$asyncEachOfLimit(
          obj,
          limit,
          iteratee,
          callback
        );
      if ($0c84690c59b4ccb2$var$isAsyncIterable(obj))
        return $0c84690c59b4ccb2$var$asyncEachOfLimit(
          obj[Symbol.asyncIterator](),
          limit,
          iteratee,
          callback
        );
      var nextElem = $0c84690c59b4ccb2$var$createIterator(obj);
      var done = false;
      var canceled = false;
      var running = 0;
      var looping = false;
      function iterateeCallback(err, value) {
        if (canceled) return;
        running -= 1;
        if (err) {
          done = true;
          callback(err);
        } else if (err === false) {
          done = true;
          canceled = true;
        } else if (
          value === $0c84690c59b4ccb2$var$breakLoop ||
          (done && running <= 0)
        ) {
          done = true;
          return callback(null);
        } else if (!looping) replenish();
      }
      function replenish() {
        looping = true;
        while (running < limit && !done) {
          var elem = nextElem();
          if (elem === null) {
            done = true;
            if (running <= 0) callback(null);
            return;
          }
          running += 1;
          iteratee(
            elem.value,
            elem.key,
            $0c84690c59b4ccb2$var$onlyOnce(iterateeCallback)
          );
        }
        looping = false;
      }
      replenish();
    };
  };
  /**
   * The same as [`eachOf`]{@link module:Collections.eachOf} but runs a maximum of `limit` async operations at a
   * time.
   *
   * @name eachOfLimit
   * @static
   * @memberOf module:Collections
   * @method
   * @see [async.eachOf]{@link module:Collections.eachOf}
   * @alias forEachOfLimit
   * @category Collection
   * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
   * @param {number} limit - The maximum number of async operations at a time.
   * @param {AsyncFunction} iteratee - An async function to apply to each
   * item in `coll`. The `key` is the item's key, or index in the case of an
   * array.
   * Invoked with (item, key, callback).
   * @param {Function} [callback] - A callback which is called when all
   * `iteratee` functions have finished, or an error occurs. Invoked with (err).
   * @returns {Promise} a promise, if a callback is omitted
   */ function $0c84690c59b4ccb2$var$eachOfLimit$1(
    coll,
    limit,
    iteratee,
    callback
  ) {
    return $0c84690c59b4ccb2$var$eachOfLimit(limit)(
      coll,
      $0c84690c59b4ccb2$var$wrapAsync(iteratee),
      callback
    );
  }
  var $0c84690c59b4ccb2$export$8b05461b96b91438 =
    $0c84690c59b4ccb2$var$awaitify($0c84690c59b4ccb2$var$eachOfLimit$1, 4);
  // eachOf implementation optimized for array-likes
  function $0c84690c59b4ccb2$var$eachOfArrayLike(coll, iteratee, callback) {
    callback = $0c84690c59b4ccb2$var$once(callback);
    var index = 0,
      completed = 0,
      { length: length } = coll,
      canceled = false;
    if (length === 0) callback(null);
    function iteratorCallback(err, value) {
      if (err === false) canceled = true;
      if (canceled === true) return;
      if (err) callback(err);
      else if (
        ++completed === length ||
        value === $0c84690c59b4ccb2$var$breakLoop
      )
        callback(null);
    }
    for (; index < length; index++)
      iteratee(
        coll[index],
        index,
        $0c84690c59b4ccb2$var$onlyOnce(iteratorCallback)
      );
  }
  // a generic version of eachOf which can handle array, object, and iterator cases.
  function $0c84690c59b4ccb2$var$eachOfGeneric(coll, iteratee, callback) {
    return $0c84690c59b4ccb2$export$8b05461b96b91438(
      coll,
      Infinity,
      iteratee,
      callback
    );
  }
  /**
   * Like [`each`]{@link module:Collections.each}, except that it passes the key (or index) as the second argument
   * to the iteratee.
   *
   * @name eachOf
   * @static
   * @memberOf module:Collections
   * @method
   * @alias forEachOf
   * @category Collection
   * @see [async.each]{@link module:Collections.each}
   * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
   * @param {AsyncFunction} iteratee - A function to apply to each
   * item in `coll`.
   * The `key` is the item's key, or index in the case of an array.
   * Invoked with (item, key, callback).
   * @param {Function} [callback] - A callback which is called when all
   * `iteratee` functions have finished, or an error occurs. Invoked with (err).
   * @returns {Promise} a promise, if a callback is omitted
   * @example
   *
   * // dev.json is a file containing a valid json object config for dev environment
   * // dev.json is a file containing a valid json object config for test environment
   * // prod.json is a file containing a valid json object config for prod environment
   * // invalid.json is a file with a malformed json object
   *
   * let configs = {}; //global variable
   * let validConfigFileMap = {dev: 'dev.json', test: 'test.json', prod: 'prod.json'};
   * let invalidConfigFileMap = {dev: 'dev.json', test: 'test.json', invalid: 'invalid.json'};
   *
   * // asynchronous function that reads a json file and parses the contents as json object
   * function parseFile(file, key, callback) {
   *     fs.readFile(file, "utf8", function(err, data) {
   *         if (err) return calback(err);
   *         try {
   *             configs[key] = JSON.parse(data);
   *         } catch (e) {
   *             return callback(e);
   *         }
   *         callback();
   *     });
   * }
   *
   * // Using callbacks
   * async.forEachOf(validConfigFileMap, parseFile, function (err) {
   *     if (err) {
   *         console.error(err);
   *     } else {
   *         console.log(configs);
   *         // configs is now a map of JSON data, e.g.
   *         // { dev: //parsed dev.json, test: //parsed test.json, prod: //parsed prod.json}
   *     }
   * });
   *
   * //Error handing
   * async.forEachOf(invalidConfigFileMap, parseFile, function (err) {
   *     if (err) {
   *         console.error(err);
   *         // JSON parse error exception
   *     } else {
   *         console.log(configs);
   *     }
   * });
   *
   * // Using Promises
   * async.forEachOf(validConfigFileMap, parseFile)
   * .then( () => {
   *     console.log(configs);
   *     // configs is now a map of JSON data, e.g.
   *     // { dev: //parsed dev.json, test: //parsed test.json, prod: //parsed prod.json}
   * }).catch( err => {
   *     console.error(err);
   * });
   *
   * //Error handing
   * async.forEachOf(invalidConfigFileMap, parseFile)
   * .then( () => {
   *     console.log(configs);
   * }).catch( err => {
   *     console.error(err);
   *     // JSON parse error exception
   * });
   *
   * // Using async/await
   * async () => {
   *     try {
   *         let result = await async.forEachOf(validConfigFileMap, parseFile);
   *         console.log(configs);
   *         // configs is now a map of JSON data, e.g.
   *         // { dev: //parsed dev.json, test: //parsed test.json, prod: //parsed prod.json}
   *     }
   *     catch (err) {
   *         console.log(err);
   *     }
   * }
   *
   * //Error handing
   * async () => {
   *     try {
   *         let result = await async.forEachOf(invalidConfigFileMap, parseFile);
   *         console.log(configs);
   *     }
   *     catch (err) {
   *         console.log(err);
   *         // JSON parse error exception
   *     }
   * }
   *
   */ function $0c84690c59b4ccb2$var$eachOf(coll, iteratee, callback) {
    var eachOfImplementation = $0c84690c59b4ccb2$var$isArrayLike(coll)
      ? $0c84690c59b4ccb2$var$eachOfArrayLike
      : $0c84690c59b4ccb2$var$eachOfGeneric;
    return eachOfImplementation(
      coll,
      $0c84690c59b4ccb2$var$wrapAsync(iteratee),
      callback
    );
  }
  var $0c84690c59b4ccb2$export$d10d68e43a57bce9 =
    $0c84690c59b4ccb2$var$awaitify($0c84690c59b4ccb2$var$eachOf, 3);
  /**
   * Produces a new collection of values by mapping each value in `coll` through
   * the `iteratee` function. The `iteratee` is called with an item from `coll`
   * and a callback for when it has finished processing. Each of these callbacks
   * takes 2 arguments: an `error`, and the transformed item from `coll`. If
   * `iteratee` passes an error to its callback, the main `callback` (for the
   * `map` function) is immediately called with the error.
   *
   * Note, that since this function applies the `iteratee` to each item in
   * parallel, there is no guarantee that the `iteratee` functions will complete
   * in order. However, the results array will be in the same order as the
   * original `coll`.
   *
   * If `map` is passed an Object, the results will be an Array.  The results
   * will roughly be in the order of the original Objects' keys (but this can
   * vary across JavaScript engines).
   *
   * @name map
   * @static
   * @memberOf module:Collections
   * @method
   * @category Collection
   * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
   * @param {AsyncFunction} iteratee - An async function to apply to each item in
   * `coll`.
   * The iteratee should complete with the transformed item.
   * Invoked with (item, callback).
   * @param {Function} [callback] - A callback which is called when all `iteratee`
   * functions have finished, or an error occurs. Results is an Array of the
   * transformed items from the `coll`. Invoked with (err, results).
   * @returns {Promise} a promise, if no callback is passed
   * @example
   *
   * // file1.txt is a file that is 1000 bytes in size
   * // file2.txt is a file that is 2000 bytes in size
   * // file3.txt is a file that is 3000 bytes in size
   * // file4.txt does not exist
   *
   * const fileList = ['file1.txt','file2.txt','file3.txt'];
   * const withMissingFileList = ['file1.txt','file2.txt','file4.txt'];
   *
   * // asynchronous function that returns the file size in bytes
   * function getFileSizeInBytes(file, callback) {
   *     fs.stat(file, function(err, stat) {
   *         if (err) {
   *             return callback(err);
   *         }
   *         callback(null, stat.size);
   *     });
   * }
   *
   * // Using callbacks
   * async.map(fileList, getFileSizeInBytes, function(err, results) {
   *     if (err) {
   *         console.log(err);
   *     } else {
   *         console.log(results);
   *         // results is now an array of the file size in bytes for each file, e.g.
   *         // [ 1000, 2000, 3000]
   *     }
   * });
   *
   * // Error Handling
   * async.map(withMissingFileList, getFileSizeInBytes, function(err, results) {
   *     if (err) {
   *         console.log(err);
   *         // [ Error: ENOENT: no such file or directory ]
   *     } else {
   *         console.log(results);
   *     }
   * });
   *
   * // Using Promises
   * async.map(fileList, getFileSizeInBytes)
   * .then( results => {
   *     console.log(results);
   *     // results is now an array of the file size in bytes for each file, e.g.
   *     // [ 1000, 2000, 3000]
   * }).catch( err => {
   *     console.log(err);
   * });
   *
   * // Error Handling
   * async.map(withMissingFileList, getFileSizeInBytes)
   * .then( results => {
   *     console.log(results);
   * }).catch( err => {
   *     console.log(err);
   *     // [ Error: ENOENT: no such file or directory ]
   * });
   *
   * // Using async/await
   * async () => {
   *     try {
   *         let results = await async.map(fileList, getFileSizeInBytes);
   *         console.log(results);
   *         // results is now an array of the file size in bytes for each file, e.g.
   *         // [ 1000, 2000, 3000]
   *     }
   *     catch (err) {
   *         console.log(err);
   *     }
   * }
   *
   * // Error Handling
   * async () => {
   *     try {
   *         let results = await async.map(withMissingFileList, getFileSizeInBytes);
   *         console.log(results);
   *     }
   *     catch (err) {
   *         console.log(err);
   *         // [ Error: ENOENT: no such file or directory ]
   *     }
   * }
   *
   */ function $0c84690c59b4ccb2$var$map(coll, iteratee, callback) {
    return $0c84690c59b4ccb2$var$_asyncMap(
      $0c84690c59b4ccb2$export$d10d68e43a57bce9,
      coll,
      iteratee,
      callback
    );
  }
  var $0c84690c59b4ccb2$export$871de8747c9eaa88 =
    $0c84690c59b4ccb2$var$awaitify($0c84690c59b4ccb2$var$map, 3);
  /**
   * Applies the provided arguments to each function in the array, calling
   * `callback` after all functions have completed. If you only provide the first
   * argument, `fns`, then it will return a function which lets you pass in the
   * arguments as if it were a single function call. If more arguments are
   * provided, `callback` is required while `args` is still optional. The results
   * for each of the applied async functions are passed to the final callback
   * as an array.
   *
   * @name applyEach
   * @static
   * @memberOf module:ControlFlow
   * @method
   * @category Control Flow
   * @param {Array|Iterable|AsyncIterable|Object} fns - A collection of {@link AsyncFunction}s
   * to all call with the same arguments
   * @param {...*} [args] - any number of separate arguments to pass to the
   * function.
   * @param {Function} [callback] - the final argument should be the callback,
   * called when all functions have completed processing.
   * @returns {AsyncFunction} - Returns a function that takes no args other than
   * an optional callback, that is the result of applying the `args` to each
   * of the functions.
   * @example
   *
   * const appliedFn = async.applyEach([enableSearch, updateSchema], 'bucket')
   *
   * appliedFn((err, results) => {
   *     // results[0] is the results for `enableSearch`
   *     // results[1] is the results for `updateSchema`
   * });
   *
   * // partial application example:
   * async.each(
   *     buckets,
   *     async (bucket) => async.applyEach([enableSearch, updateSchema], bucket)(),
   *     callback
   * );
   */ var $0c84690c59b4ccb2$export$e0fc6250e304edaf =
    $0c84690c59b4ccb2$var$applyEach($0c84690c59b4ccb2$export$871de8747c9eaa88);
  /**
   * The same as [`eachOf`]{@link module:Collections.eachOf} but runs only a single async operation at a time.
   *
   * @name eachOfSeries
   * @static
   * @memberOf module:Collections
   * @method
   * @see [async.eachOf]{@link module:Collections.eachOf}
   * @alias forEachOfSeries
   * @category Collection
   * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
   * @param {AsyncFunction} iteratee - An async function to apply to each item in
   * `coll`.
   * Invoked with (item, key, callback).
   * @param {Function} [callback] - A callback which is called when all `iteratee`
   * functions have finished, or an error occurs. Invoked with (err).
   * @returns {Promise} a promise, if a callback is omitted
   */ function $0c84690c59b4ccb2$var$eachOfSeries(coll, iteratee, callback) {
    return $0c84690c59b4ccb2$export$8b05461b96b91438(
      coll,
      1,
      iteratee,
      callback
    );
  }
  var $0c84690c59b4ccb2$export$750e7e5fea3b0654 =
    $0c84690c59b4ccb2$var$awaitify($0c84690c59b4ccb2$var$eachOfSeries, 3);
  /**
   * The same as [`map`]{@link module:Collections.map} but runs only a single async operation at a time.
   *
   * @name mapSeries
   * @static
   * @memberOf module:Collections
   * @method
   * @see [async.map]{@link module:Collections.map}
   * @category Collection
   * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
   * @param {AsyncFunction} iteratee - An async function to apply to each item in
   * `coll`.
   * The iteratee should complete with the transformed item.
   * Invoked with (item, callback).
   * @param {Function} [callback] - A callback which is called when all `iteratee`
   * functions have finished, or an error occurs. Results is an array of the
   * transformed items from the `coll`. Invoked with (err, results).
   * @returns {Promise} a promise, if no callback is passed
   */ function $0c84690c59b4ccb2$var$mapSeries(coll, iteratee, callback) {
    return $0c84690c59b4ccb2$var$_asyncMap(
      $0c84690c59b4ccb2$export$750e7e5fea3b0654,
      coll,
      iteratee,
      callback
    );
  }
  var $0c84690c59b4ccb2$export$9a85c32cda85b0dd =
    $0c84690c59b4ccb2$var$awaitify($0c84690c59b4ccb2$var$mapSeries, 3);
  /**
   * The same as [`applyEach`]{@link module:ControlFlow.applyEach} but runs only a single async operation at a time.
   *
   * @name applyEachSeries
   * @static
   * @memberOf module:ControlFlow
   * @method
   * @see [async.applyEach]{@link module:ControlFlow.applyEach}
   * @category Control Flow
   * @param {Array|Iterable|AsyncIterable|Object} fns - A collection of {@link AsyncFunction}s to all
   * call with the same arguments
   * @param {...*} [args] - any number of separate arguments to pass to the
   * function.
   * @param {Function} [callback] - the final argument should be the callback,
   * called when all functions have completed processing.
   * @returns {AsyncFunction} - A function, that when called, is the result of
   * appling the `args` to the list of functions.  It takes no args, other than
   * a callback.
   */ var $0c84690c59b4ccb2$export$cdb63afc167779e =
    $0c84690c59b4ccb2$var$applyEach($0c84690c59b4ccb2$export$9a85c32cda85b0dd);
  const $0c84690c59b4ccb2$var$PROMISE_SYMBOL = Symbol("promiseCallback");
  function $0c84690c59b4ccb2$var$promiseCallback() {
    let resolve, reject;
    function callback(err, ...args) {
      if (err) return reject(err);
      resolve(args.length > 1 ? args : args[0]);
    }
    callback[$0c84690c59b4ccb2$var$PROMISE_SYMBOL] = new Promise((res, rej) => {
      (resolve = res), (reject = rej);
    });
    return callback;
  }
  /**
   * Determines the best order for running the {@link AsyncFunction}s in `tasks`, based on
   * their requirements. Each function can optionally depend on other functions
   * being completed first, and each function is run as soon as its requirements
   * are satisfied.
   *
   * If any of the {@link AsyncFunction}s pass an error to their callback, the `auto` sequence
   * will stop. Further tasks will not execute (so any other functions depending
   * on it will not run), and the main `callback` is immediately called with the
   * error.
   *
   * {@link AsyncFunction}s also receive an object containing the results of functions which
   * have completed so far as the first argument, if they have dependencies. If a
   * task function has no dependencies, it will only be passed a callback.
   *
   * @name auto
   * @static
   * @memberOf module:ControlFlow
   * @method
   * @category Control Flow
   * @param {Object} tasks - An object. Each of its properties is either a
   * function or an array of requirements, with the {@link AsyncFunction} itself the last item
   * in the array. The object's key of a property serves as the name of the task
   * defined by that property, i.e. can be used when specifying requirements for
   * other tasks. The function receives one or two arguments:
   * * a `results` object, containing the results of the previously executed
   *   functions, only passed if the task has any dependencies,
   * * a `callback(err, result)` function, which must be called when finished,
   *   passing an `error` (which can be `null`) and the result of the function's
   *   execution.
   * @param {number} [concurrency=Infinity] - An optional `integer` for
   * determining the maximum number of tasks that can be run in parallel. By
   * default, as many as possible.
   * @param {Function} [callback] - An optional callback which is called when all
   * the tasks have been completed. It receives the `err` argument if any `tasks`
   * pass an error to their callback. Results are always returned; however, if an
   * error occurs, no further `tasks` will be performed, and the results object
   * will only contain partial results. Invoked with (err, results).
   * @returns {Promise} a promise, if a callback is not passed
   * @example
   *
   * //Using Callbacks
   * async.auto({
   *     get_data: function(callback) {
   *         // async code to get some data
   *         callback(null, 'data', 'converted to array');
   *     },
   *     make_folder: function(callback) {
   *         // async code to create a directory to store a file in
   *         // this is run at the same time as getting the data
   *         callback(null, 'folder');
   *     },
   *     write_file: ['get_data', 'make_folder', function(results, callback) {
   *         // once there is some data and the directory exists,
   *         // write the data to a file in the directory
   *         callback(null, 'filename');
   *     }],
   *     email_link: ['write_file', function(results, callback) {
   *         // once the file is written let's email a link to it...
   *         callback(null, {'file':results.write_file, 'email':'user@example.com'});
   *     }]
   * }, function(err, results) {
   *     if (err) {
   *         console.log('err = ', err);
   *     }
   *     console.log('results = ', results);
   *     // results = {
   *     //     get_data: ['data', 'converted to array']
   *     //     make_folder; 'folder',
   *     //     write_file: 'filename'
   *     //     email_link: { file: 'filename', email: 'user@example.com' }
   *     // }
   * });
   *
   * //Using Promises
   * async.auto({
   *     get_data: function(callback) {
   *         console.log('in get_data');
   *         // async code to get some data
   *         callback(null, 'data', 'converted to array');
   *     },
   *     make_folder: function(callback) {
   *         console.log('in make_folder');
   *         // async code to create a directory to store a file in
   *         // this is run at the same time as getting the data
   *         callback(null, 'folder');
   *     },
   *     write_file: ['get_data', 'make_folder', function(results, callback) {
   *         // once there is some data and the directory exists,
   *         // write the data to a file in the directory
   *         callback(null, 'filename');
   *     }],
   *     email_link: ['write_file', function(results, callback) {
   *         // once the file is written let's email a link to it...
   *         callback(null, {'file':results.write_file, 'email':'user@example.com'});
   *     }]
   * }).then(results => {
   *     console.log('results = ', results);
   *     // results = {
   *     //     get_data: ['data', 'converted to array']
   *     //     make_folder; 'folder',
   *     //     write_file: 'filename'
   *     //     email_link: { file: 'filename', email: 'user@example.com' }
   *     // }
   * }).catch(err => {
   *     console.log('err = ', err);
   * });
   *
   * //Using async/await
   * async () => {
   *     try {
   *         let results = await async.auto({
   *             get_data: function(callback) {
   *                 // async code to get some data
   *                 callback(null, 'data', 'converted to array');
   *             },
   *             make_folder: function(callback) {
   *                 // async code to create a directory to store a file in
   *                 // this is run at the same time as getting the data
   *                 callback(null, 'folder');
   *             },
   *             write_file: ['get_data', 'make_folder', function(results, callback) {
   *                 // once there is some data and the directory exists,
   *                 // write the data to a file in the directory
   *                 callback(null, 'filename');
   *             }],
   *             email_link: ['write_file', function(results, callback) {
   *                 // once the file is written let's email a link to it...
   *                 callback(null, {'file':results.write_file, 'email':'user@example.com'});
   *             }]
   *         });
   *         console.log('results = ', results);
   *         // results = {
   *         //     get_data: ['data', 'converted to array']
   *         //     make_folder; 'folder',
   *         //     write_file: 'filename'
   *         //     email_link: { file: 'filename', email: 'user@example.com' }
   *         // }
   *     }
   *     catch (err) {
   *         console.log(err);
   *     }
   * }
   *
   */ function $0c84690c59b4ccb2$export$dfb5619354ba860(
    tasks,
    concurrency,
    callback
  ) {
    if (typeof concurrency !== "number") {
      // concurrency is optional, shift the args.
      callback = concurrency;
      concurrency = null;
    }
    callback = $0c84690c59b4ccb2$var$once(
      callback || $0c84690c59b4ccb2$var$promiseCallback()
    );
    var numTasks = Object.keys(tasks).length;
    if (!numTasks) return callback(null);
    if (!concurrency) concurrency = numTasks;
    var results = {};
    var runningTasks = 0;
    var canceled = false;
    var hasError = false;
    var listeners = Object.create(null);
    var readyTasks = [];
    // for cycle detection:
    var readyToCheck = []; // tasks that have been identified as reachable
    // without the possibility of returning to an ancestor task
    var uncheckedDependencies = {};
    Object.keys(tasks).forEach((key) => {
      var task = tasks[key];
      if (!Array.isArray(task)) {
        // no dependencies
        enqueueTask(key, [task]);
        readyToCheck.push(key);
        return;
      }
      var dependencies = task.slice(0, task.length - 1);
      var remainingDependencies = dependencies.length;
      if (remainingDependencies === 0) {
        enqueueTask(key, task);
        readyToCheck.push(key);
        return;
      }
      uncheckedDependencies[key] = remainingDependencies;
      dependencies.forEach((dependencyName) => {
        if (!tasks[dependencyName])
          throw new Error(
            "async.auto task `" +
              key +
              "` has a non-existent dependency `" +
              dependencyName +
              "` in " +
              dependencies.join(", ")
          );
        addListener(dependencyName, () => {
          remainingDependencies--;
          if (remainingDependencies === 0) enqueueTask(key, task);
        });
      });
    });
    checkForDeadlocks();
    processQueue();
    function enqueueTask(key, task) {
      readyTasks.push(() => runTask(key, task));
    }
    function processQueue() {
      if (canceled) return;
      if (readyTasks.length === 0 && runningTasks === 0)
        return callback(null, results);
      while (readyTasks.length && runningTasks < concurrency) {
        var run = readyTasks.shift();
        run();
      }
    }
    function addListener(taskName, fn) {
      var taskListeners = listeners[taskName];
      if (!taskListeners) taskListeners = listeners[taskName] = [];
      taskListeners.push(fn);
    }
    function taskComplete(taskName) {
      var taskListeners = listeners[taskName] || [];
      taskListeners.forEach((fn) => fn());
      processQueue();
    }
    function runTask(key, task) {
      if (hasError) return;
      var taskCallback = $0c84690c59b4ccb2$var$onlyOnce((err, ...result) => {
        runningTasks--;
        if (err === false) {
          canceled = true;
          return;
        }
        if (result.length < 2) [result] = result;
        if (err) {
          var safeResults = {};
          Object.keys(results).forEach((rkey) => {
            safeResults[rkey] = results[rkey];
          });
          safeResults[key] = result;
          hasError = true;
          listeners = Object.create(null);
          if (canceled) return;
          callback(err, safeResults);
        } else {
          results[key] = result;
          taskComplete(key);
        }
      });
      runningTasks++;
      var taskFn = $0c84690c59b4ccb2$var$wrapAsync(task[task.length - 1]);
      if (task.length > 1) taskFn(results, taskCallback);
      else taskFn(taskCallback);
    }
    function checkForDeadlocks() {
      // Kahn's algorithm
      // https://en.wikipedia.org/wiki/Topological_sorting#Kahn.27s_algorithm
      // http://connalle.blogspot.com/2013/10/topological-sortingkahn-algorithm.html
      var currentTask;
      var counter = 0;
      while (readyToCheck.length) {
        currentTask = readyToCheck.pop();
        counter++;
        getDependents(currentTask).forEach((dependent) => {
          if (--uncheckedDependencies[dependent] === 0)
            readyToCheck.push(dependent);
        });
      }
      if (counter !== numTasks)
        throw new Error(
          "async.auto cannot execute tasks due to a recursive dependency"
        );
    }
    function getDependents(taskName) {
      var result = [];
      Object.keys(tasks).forEach((key) => {
        const task = tasks[key];
        if (Array.isArray(task) && task.indexOf(taskName) >= 0)
          result.push(key);
      });
      return result;
    }
    return callback[$0c84690c59b4ccb2$var$PROMISE_SYMBOL];
  }
  var $0c84690c59b4ccb2$var$FN_ARGS =
    /^(?:async\s+)?(?:function)?\s*\w*\s*\(\s*([^)]+)\s*\)(?:\s*{)/;
  var $0c84690c59b4ccb2$var$ARROW_FN_ARGS =
    /^(?:async\s+)?\(?\s*([^)=]+)\s*\)?(?:\s*=>)/;
  var $0c84690c59b4ccb2$var$FN_ARG_SPLIT = /,/;
  var $0c84690c59b4ccb2$var$FN_ARG = /(=.+)?(\s*)$/;
  function $0c84690c59b4ccb2$var$stripComments(string) {
    let stripped = "";
    let index = 0;
    let endBlockComment = string.indexOf("*/");
    while (index < string.length) {
      if (string[index] === "/" && string[index + 1] === "/") {
        // inline comment
        let endIndex = string.indexOf("\n", index);
        index = endIndex === -1 ? string.length : endIndex;
      } else if (
        endBlockComment !== -1 &&
        string[index] === "/" &&
        string[index + 1] === "*"
      ) {
        // block comment
        let endIndex = string.indexOf("*/", index);
        if (endIndex !== -1) {
          index = endIndex + 2;
          endBlockComment = string.indexOf("*/", index);
        } else {
          stripped += string[index];
          index++;
        }
      } else {
        stripped += string[index];
        index++;
      }
    }
    return stripped;
  }
  function $0c84690c59b4ccb2$var$parseParams(func) {
    const src = $0c84690c59b4ccb2$var$stripComments(func.toString());
    let match = src.match($0c84690c59b4ccb2$var$FN_ARGS);
    if (!match) match = src.match($0c84690c59b4ccb2$var$ARROW_FN_ARGS);
    if (!match)
      throw new Error("could not parse args in autoInject\nSource:\n" + src);
    let [, args] = match;
    return args
      .replace(/\s/g, "")
      .split($0c84690c59b4ccb2$var$FN_ARG_SPLIT)
      .map((arg) => arg.replace($0c84690c59b4ccb2$var$FN_ARG, "").trim());
  }
  /**
   * A dependency-injected version of the [async.auto]{@link module:ControlFlow.auto} function. Dependent
   * tasks are specified as parameters to the function, after the usual callback
   * parameter, with the parameter names matching the names of the tasks it
   * depends on. This can provide even more readable task graphs which can be
   * easier to maintain.
   *
   * If a final callback is specified, the task results are similarly injected,
   * specified as named parameters after the initial error parameter.
   *
   * The autoInject function is purely syntactic sugar and its semantics are
   * otherwise equivalent to [async.auto]{@link module:ControlFlow.auto}.
   *
   * @name autoInject
   * @static
   * @memberOf module:ControlFlow
   * @method
   * @see [async.auto]{@link module:ControlFlow.auto}
   * @category Control Flow
   * @param {Object} tasks - An object, each of whose properties is an {@link AsyncFunction} of
   * the form 'func([dependencies...], callback). The object's key of a property
   * serves as the name of the task defined by that property, i.e. can be used
   * when specifying requirements for other tasks.
   * * The `callback` parameter is a `callback(err, result)` which must be called
   *   when finished, passing an `error` (which can be `null`) and the result of
   *   the function's execution. The remaining parameters name other tasks on
   *   which the task is dependent, and the results from those tasks are the
   *   arguments of those parameters.
   * @param {Function} [callback] - An optional callback which is called when all
   * the tasks have been completed. It receives the `err` argument if any `tasks`
   * pass an error to their callback, and a `results` object with any completed
   * task results, similar to `auto`.
   * @returns {Promise} a promise, if no callback is passed
   * @example
   *
   * //  The example from `auto` can be rewritten as follows:
   * async.autoInject({
   *     get_data: function(callback) {
   *         // async code to get some data
   *         callback(null, 'data', 'converted to array');
   *     },
   *     make_folder: function(callback) {
   *         // async code to create a directory to store a file in
   *         // this is run at the same time as getting the data
   *         callback(null, 'folder');
   *     },
   *     write_file: function(get_data, make_folder, callback) {
   *         // once there is some data and the directory exists,
   *         // write the data to a file in the directory
   *         callback(null, 'filename');
   *     },
   *     email_link: function(write_file, callback) {
   *         // once the file is written let's email a link to it...
   *         // write_file contains the filename returned by write_file.
   *         callback(null, {'file':write_file, 'email':'user@example.com'});
   *     }
   * }, function(err, results) {
   *     console.log('err = ', err);
   *     console.log('email_link = ', results.email_link);
   * });
   *
   * // If you are using a JS minifier that mangles parameter names, `autoInject`
   * // will not work with plain functions, since the parameter names will be
   * // collapsed to a single letter identifier.  To work around this, you can
   * // explicitly specify the names of the parameters your task function needs
   * // in an array, similar to Angular.js dependency injection.
   *
   * // This still has an advantage over plain `auto`, since the results a task
   * // depends on are still spread into arguments.
   * async.autoInject({
   *     //...
   *     write_file: ['get_data', 'make_folder', function(get_data, make_folder, callback) {
   *         callback(null, 'filename');
   *     }],
   *     email_link: ['write_file', function(write_file, callback) {
   *         callback(null, {'file':write_file, 'email':'user@example.com'});
   *     }]
   *     //...
   * }, function(err, results) {
   *     console.log('err = ', err);
   *     console.log('email_link = ', results.email_link);
   * });
   */ function $0c84690c59b4ccb2$export$868ec1c38c3c8735(tasks, callback) {
    var newTasks = {};
    Object.keys(tasks).forEach((key) => {
      var taskFn = tasks[key];
      var params;
      var fnIsAsync = $0c84690c59b4ccb2$var$isAsync(taskFn);
      var hasNoDeps =
        (!fnIsAsync && taskFn.length === 1) ||
        (fnIsAsync && taskFn.length === 0);
      if (Array.isArray(taskFn)) {
        params = [...taskFn];
        taskFn = params.pop();
        newTasks[key] = params.concat(params.length > 0 ? newTask : taskFn);
      } else if (hasNoDeps)
        // no dependencies, use the function as-is
        newTasks[key] = taskFn;
      else {
        params = $0c84690c59b4ccb2$var$parseParams(taskFn);
        if (taskFn.length === 0 && !fnIsAsync && params.length === 0)
          throw new Error(
            "autoInject task functions require explicit parameters."
          );
        // remove callback param
        if (!fnIsAsync) params.pop();
        newTasks[key] = params.concat(newTask);
      }
      function newTask(results, taskCb) {
        var newArgs = params.map((name) => results[name]);
        newArgs.push(taskCb);
        $0c84690c59b4ccb2$var$wrapAsync(taskFn)(...newArgs);
      }
    });
    return $0c84690c59b4ccb2$export$dfb5619354ba860(newTasks, callback);
  }
  // Simple doubly linked list (https://en.wikipedia.org/wiki/Doubly_linked_list) implementation
  // used for queues. This implementation assumes that the node provided by the user can be modified
  // to adjust the next and last properties. We implement only the minimal functionality
  // for queue support.
  class $0c84690c59b4ccb2$var$DLL {
    constructor() {
      this.head = this.tail = null;
      this.length = 0;
    }
    removeLink(node) {
      if (node.prev) node.prev.next = node.next;
      else this.head = node.next;
      if (node.next) node.next.prev = node.prev;
      else this.tail = node.prev;
      node.prev = node.next = null;
      this.length -= 1;
      return node;
    }
    empty() {
      while (this.head) this.shift();
      return this;
    }
    insertAfter(node, newNode) {
      newNode.prev = node;
      newNode.next = node.next;
      if (node.next) node.next.prev = newNode;
      else this.tail = newNode;
      node.next = newNode;
      this.length += 1;
    }
    insertBefore(node, newNode) {
      newNode.prev = node.prev;
      newNode.next = node;
      if (node.prev) node.prev.next = newNode;
      else this.head = newNode;
      node.prev = newNode;
      this.length += 1;
    }
    unshift(node) {
      if (this.head) this.insertBefore(this.head, node);
      else $0c84690c59b4ccb2$var$setInitial(this, node);
    }
    push(node) {
      if (this.tail) this.insertAfter(this.tail, node);
      else $0c84690c59b4ccb2$var$setInitial(this, node);
    }
    shift() {
      return this.head && this.removeLink(this.head);
    }
    pop() {
      return this.tail && this.removeLink(this.tail);
    }
    toArray() {
      return [...this];
    }
    *[Symbol.iterator]() {
      var cur = this.head;
      while (cur) {
        yield cur.data;
        cur = cur.next;
      }
    }
    remove(testFn) {
      var curr = this.head;
      while (curr) {
        var { next: next } = curr;
        if (testFn(curr)) this.removeLink(curr);
        curr = next;
      }
      return this;
    }
  }
  function $0c84690c59b4ccb2$var$setInitial(dll, node) {
    dll.length = 1;
    dll.head = dll.tail = node;
  }
  function $0c84690c59b4ccb2$var$queue(worker, concurrency, payload) {
    if (concurrency == null) concurrency = 1;
    else if (concurrency === 0)
      throw new RangeError("Concurrency must not be zero");
    var _worker = $0c84690c59b4ccb2$var$wrapAsync(worker);
    var numRunning = 0;
    var workersList = [];
    const events = {
      error: [],
      drain: [],
      saturated: [],
      unsaturated: [],
      empty: [],
    };
    function on(event, handler) {
      events[event].push(handler);
    }
    function once(event, handler) {
      const handleAndRemove = (...args) => {
        off(event, handleAndRemove);
        handler(...args);
      };
      events[event].push(handleAndRemove);
    }
    function off(event, handler) {
      if (!event) return Object.keys(events).forEach((ev) => (events[ev] = []));
      if (!handler) return (events[event] = []);
      events[event] = events[event].filter((ev) => ev !== handler);
    }
    function trigger(event, ...args) {
      events[event].forEach((handler) => handler(...args));
    }
    var processingScheduled = false;
    function _insert(data, insertAtFront, rejectOnError, callback) {
      if (callback != null && typeof callback !== "function")
        throw new Error("task callback must be a function");
      q.started = true;
      var res, rej;
      function promiseCallback(err, ...args) {
        // we don't care about the error, let the global error handler
        // deal with it
        if (err) return rejectOnError ? rej(err) : res();
        if (args.length <= 1) return res(args[0]);
        res(args);
      }
      var item = q._createTaskItem(
        data,
        rejectOnError ? promiseCallback : callback || promiseCallback
      );
      if (insertAtFront) q._tasks.unshift(item);
      else q._tasks.push(item);
      if (!processingScheduled) {
        processingScheduled = true;
        $0c84690c59b4ccb2$export$c233f08fbfea0913(() => {
          processingScheduled = false;
          q.process();
        });
      }
      if (rejectOnError || !callback)
        return new Promise((resolve, reject) => {
          res = resolve;
          rej = reject;
        });
    }
    function _createCB(tasks) {
      return function (err, ...args) {
        numRunning -= 1;
        for (var i = 0, l = tasks.length; i < l; i++) {
          var task = tasks[i];
          var index = workersList.indexOf(task);
          if (index === 0) workersList.shift();
          else if (index > 0) workersList.splice(index, 1);
          task.callback(err, ...args);
          if (err != null) trigger("error", err, task.data);
        }
        if (numRunning <= q.concurrency - q.buffer) trigger("unsaturated");
        if (q.idle()) trigger("drain");
        q.process();
      };
    }
    function _maybeDrain(data) {
      if (data.length === 0 && q.idle()) {
        // call drain immediately if there are no tasks
        $0c84690c59b4ccb2$export$c233f08fbfea0913(() => trigger("drain"));
        return true;
      }
      return false;
    }
    const eventMethod = (name) => (handler) => {
      if (!handler)
        return new Promise((resolve, reject) => {
          once(name, (err, data) => {
            if (err) return reject(err);
            resolve(data);
          });
        });
      off(name);
      on(name, handler);
    };
    var isProcessing = false;
    var q = {
      _tasks: new $0c84690c59b4ccb2$var$DLL(),
      _createTaskItem(data, callback) {
        return {
          data: data,
          callback: callback,
        };
      },
      *[Symbol.iterator]() {
        yield* q._tasks[Symbol.iterator]();
      },
      concurrency: concurrency,
      payload: payload,
      buffer: concurrency / 4,
      started: false,
      paused: false,
      push(data, callback) {
        if (Array.isArray(data)) {
          if (_maybeDrain(data)) return;
          return data.map((datum) => _insert(datum, false, false, callback));
        }
        return _insert(data, false, false, callback);
      },
      pushAsync(data, callback) {
        if (Array.isArray(data)) {
          if (_maybeDrain(data)) return;
          return data.map((datum) => _insert(datum, false, true, callback));
        }
        return _insert(data, false, true, callback);
      },
      kill() {
        off();
        q._tasks.empty();
      },
      unshift(data, callback) {
        if (Array.isArray(data)) {
          if (_maybeDrain(data)) return;
          return data.map((datum) => _insert(datum, true, false, callback));
        }
        return _insert(data, true, false, callback);
      },
      unshiftAsync(data, callback) {
        if (Array.isArray(data)) {
          if (_maybeDrain(data)) return;
          return data.map((datum) => _insert(datum, true, true, callback));
        }
        return _insert(data, true, true, callback);
      },
      remove(testFn) {
        q._tasks.remove(testFn);
      },
      process() {
        // Avoid trying to start too many processing operations. This can occur
        // when callbacks resolve synchronously (#1267).
        if (isProcessing) return;
        isProcessing = true;
        while (!q.paused && numRunning < q.concurrency && q._tasks.length) {
          var tasks = [],
            data = [];
          var l = q._tasks.length;
          if (q.payload) l = Math.min(l, q.payload);
          for (var i = 0; i < l; i++) {
            var node = q._tasks.shift();
            tasks.push(node);
            workersList.push(node);
            data.push(node.data);
          }
          numRunning += 1;
          if (q._tasks.length === 0) trigger("empty");
          if (numRunning === q.concurrency) trigger("saturated");
          var cb = $0c84690c59b4ccb2$var$onlyOnce(_createCB(tasks));
          _worker(data, cb);
        }
        isProcessing = false;
      },
      length() {
        return q._tasks.length;
      },
      running() {
        return numRunning;
      },
      workersList() {
        return workersList;
      },
      idle() {
        return q._tasks.length + numRunning === 0;
      },
      pause() {
        q.paused = true;
      },
      resume() {
        if (q.paused === false) return;
        q.paused = false;
        $0c84690c59b4ccb2$export$c233f08fbfea0913(q.process);
      },
    };
    // define these as fixed properties, so people get useful errors when updating
    Object.defineProperties(q, {
      saturated: {
        writable: false,
        value: eventMethod("saturated"),
      },
      unsaturated: {
        writable: false,
        value: eventMethod("unsaturated"),
      },
      empty: {
        writable: false,
        value: eventMethod("empty"),
      },
      drain: {
        writable: false,
        value: eventMethod("drain"),
      },
      error: {
        writable: false,
        value: eventMethod("error"),
      },
    });
    return q;
  }
  /**
   * Creates a `cargo` object with the specified payload. Tasks added to the
   * cargo will be processed altogether (up to the `payload` limit). If the
   * `worker` is in progress, the task is queued until it becomes available. Once
   * the `worker` has completed some tasks, each callback of those tasks is
   * called. Check out [these](https://camo.githubusercontent.com/6bbd36f4cf5b35a0f11a96dcd2e97711ffc2fb37/68747470733a2f2f662e636c6f75642e6769746875622e636f6d2f6173736574732f313637363837312f36383130382f62626330636662302d356632392d313165322d393734662d3333393763363464633835382e676966) [animations](https://camo.githubusercontent.com/f4810e00e1c5f5f8addbe3e9f49064fd5d102699/68747470733a2f2f662e636c6f75642e6769746875622e636f6d2f6173736574732f313637363837312f36383130312f38346339323036362d356632392d313165322d383134662d3964336430323431336266642e676966)
   * for how `cargo` and `queue` work.
   *
   * While [`queue`]{@link module:ControlFlow.queue} passes only one task to one of a group of workers
   * at a time, cargo passes an array of tasks to a single worker, repeating
   * when the worker is finished.
   *
   * @name cargo
   * @static
   * @memberOf module:ControlFlow
   * @method
   * @see [async.queue]{@link module:ControlFlow.queue}
   * @category Control Flow
   * @param {AsyncFunction} worker - An asynchronous function for processing an array
   * of queued tasks. Invoked with `(tasks, callback)`.
   * @param {number} [payload=Infinity] - An optional `integer` for determining
   * how many tasks should be processed per round; if omitted, the default is
   * unlimited.
   * @returns {module:ControlFlow.QueueObject} A cargo object to manage the tasks. Callbacks can
   * attached as certain properties to listen for specific events during the
   * lifecycle of the cargo and inner queue.
   * @example
   *
   * // create a cargo object with payload 2
   * var cargo = async.cargo(function(tasks, callback) {
   *     for (var i=0; i<tasks.length; i++) {
   *         console.log('hello ' + tasks[i].name);
   *     }
   *     callback();
   * }, 2);
   *
   * // add some items
   * cargo.push({name: 'foo'}, function(err) {
   *     console.log('finished processing foo');
   * });
   * cargo.push({name: 'bar'}, function(err) {
   *     console.log('finished processing bar');
   * });
   * await cargo.push({name: 'baz'});
   * console.log('finished processing baz');
   */ function $0c84690c59b4ccb2$export$f9549d7e5aef7637(worker, payload) {
    return $0c84690c59b4ccb2$var$queue(worker, 1, payload);
  }
  /**
   * Creates a `cargoQueue` object with the specified payload. Tasks added to the
   * cargoQueue will be processed together (up to the `payload` limit) in `concurrency` parallel workers.
   * If the all `workers` are in progress, the task is queued until one becomes available. Once
   * a `worker` has completed some tasks, each callback of those tasks is
   * called. Check out [these](https://camo.githubusercontent.com/6bbd36f4cf5b35a0f11a96dcd2e97711ffc2fb37/68747470733a2f2f662e636c6f75642e6769746875622e636f6d2f6173736574732f313637363837312f36383130382f62626330636662302d356632392d313165322d393734662d3333393763363464633835382e676966) [animations](https://camo.githubusercontent.com/f4810e00e1c5f5f8addbe3e9f49064fd5d102699/68747470733a2f2f662e636c6f75642e6769746875622e636f6d2f6173736574732f313637363837312f36383130312f38346339323036362d356632392d313165322d383134662d3964336430323431336266642e676966)
   * for how `cargo` and `queue` work.
   *
   * While [`queue`]{@link module:ControlFlow.queue} passes only one task to one of a group of workers
   * at a time, and [`cargo`]{@link module:ControlFlow.cargo} passes an array of tasks to a single worker,
   * the cargoQueue passes an array of tasks to multiple parallel workers.
   *
   * @name cargoQueue
   * @static
   * @memberOf module:ControlFlow
   * @method
   * @see [async.queue]{@link module:ControlFlow.queue}
   * @see [async.cargo]{@link module:ControlFLow.cargo}
   * @category Control Flow
   * @param {AsyncFunction} worker - An asynchronous function for processing an array
   * of queued tasks. Invoked with `(tasks, callback)`.
   * @param {number} [concurrency=1] - An `integer` for determining how many
   * `worker` functions should be run in parallel.  If omitted, the concurrency
   * defaults to `1`.  If the concurrency is `0`, an error is thrown.
   * @param {number} [payload=Infinity] - An optional `integer` for determining
   * how many tasks should be processed per round; if omitted, the default is
   * unlimited.
   * @returns {module:ControlFlow.QueueObject} A cargoQueue object to manage the tasks. Callbacks can
   * attached as certain properties to listen for specific events during the
   * lifecycle of the cargoQueue and inner queue.
   * @example
   *
   * // create a cargoQueue object with payload 2 and concurrency 2
   * var cargoQueue = async.cargoQueue(function(tasks, callback) {
   *     for (var i=0; i<tasks.length; i++) {
   *         console.log('hello ' + tasks[i].name);
   *     }
   *     callback();
   * }, 2, 2);
   *
   * // add some items
   * cargoQueue.push({name: 'foo'}, function(err) {
   *     console.log('finished processing foo');
   * });
   * cargoQueue.push({name: 'bar'}, function(err) {
   *     console.log('finished processing bar');
   * });
   * cargoQueue.push({name: 'baz'}, function(err) {
   *     console.log('finished processing baz');
   * });
   * cargoQueue.push({name: 'boo'}, function(err) {
   *     console.log('finished processing boo');
   * });
   */ function $0c84690c59b4ccb2$export$687de40d137ed486(
    worker,
    concurrency,
    payload
  ) {
    return $0c84690c59b4ccb2$var$queue(worker, concurrency, payload);
  }
  /**
   * Reduces `coll` into a single value using an async `iteratee` to return each
   * successive step. `memo` is the initial state of the reduction. This function
   * only operates in series.
   *
   * For performance reasons, it may make sense to split a call to this function
   * into a parallel map, and then use the normal `Array.prototype.reduce` on the
   * results. This function is for situations where each step in the reduction
   * needs to be async; if you can get the data before reducing it, then it's
   * probably a good idea to do so.
   *
   * @name reduce
   * @static
   * @memberOf module:Collections
   * @method
   * @alias inject
   * @alias foldl
   * @category Collection
   * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
   * @param {*} memo - The initial state of the reduction.
   * @param {AsyncFunction} iteratee - A function applied to each item in the
   * array to produce the next step in the reduction.
   * The `iteratee` should complete with the next state of the reduction.
   * If the iteratee completes with an error, the reduction is stopped and the
   * main `callback` is immediately called with the error.
   * Invoked with (memo, item, callback).
   * @param {Function} [callback] - A callback which is called after all the
   * `iteratee` functions have finished. Result is the reduced value. Invoked with
   * (err, result).
   * @returns {Promise} a promise, if no callback is passed
   * @example
   *
   * // file1.txt is a file that is 1000 bytes in size
   * // file2.txt is a file that is 2000 bytes in size
   * // file3.txt is a file that is 3000 bytes in size
   * // file4.txt does not exist
   *
   * const fileList = ['file1.txt','file2.txt','file3.txt'];
   * const withMissingFileList = ['file1.txt','file2.txt','file3.txt', 'file4.txt'];
   *
   * // asynchronous function that computes the file size in bytes
   * // file size is added to the memoized value, then returned
   * function getFileSizeInBytes(memo, file, callback) {
   *     fs.stat(file, function(err, stat) {
   *         if (err) {
   *             return callback(err);
   *         }
   *         callback(null, memo + stat.size);
   *     });
   * }
   *
   * // Using callbacks
   * async.reduce(fileList, 0, getFileSizeInBytes, function(err, result) {
   *     if (err) {
   *         console.log(err);
   *     } else {
   *         console.log(result);
   *         // 6000
   *         // which is the sum of the file sizes of the three files
   *     }
   * });
   *
   * // Error Handling
   * async.reduce(withMissingFileList, 0, getFileSizeInBytes, function(err, result) {
   *     if (err) {
   *         console.log(err);
   *         // [ Error: ENOENT: no such file or directory ]
   *     } else {
   *         console.log(result);
   *     }
   * });
   *
   * // Using Promises
   * async.reduce(fileList, 0, getFileSizeInBytes)
   * .then( result => {
   *     console.log(result);
   *     // 6000
   *     // which is the sum of the file sizes of the three files
   * }).catch( err => {
   *     console.log(err);
   * });
   *
   * // Error Handling
   * async.reduce(withMissingFileList, 0, getFileSizeInBytes)
   * .then( result => {
   *     console.log(result);
   * }).catch( err => {
   *     console.log(err);
   *     // [ Error: ENOENT: no such file or directory ]
   * });
   *
   * // Using async/await
   * async () => {
   *     try {
   *         let result = await async.reduce(fileList, 0, getFileSizeInBytes);
   *         console.log(result);
   *         // 6000
   *         // which is the sum of the file sizes of the three files
   *     }
   *     catch (err) {
   *         console.log(err);
   *     }
   * }
   *
   * // Error Handling
   * async () => {
   *     try {
   *         let result = await async.reduce(withMissingFileList, 0, getFileSizeInBytes);
   *         console.log(result);
   *     }
   *     catch (err) {
   *         console.log(err);
   *         // [ Error: ENOENT: no such file or directory ]
   *     }
   * }
   *
   */ function $0c84690c59b4ccb2$var$reduce(coll, memo, iteratee, callback) {
    callback = $0c84690c59b4ccb2$var$once(callback);
    var _iteratee = $0c84690c59b4ccb2$var$wrapAsync(iteratee);
    return $0c84690c59b4ccb2$export$750e7e5fea3b0654(
      coll,
      (x, i, iterCb) => {
        _iteratee(memo, x, (err, v) => {
          memo = v;
          iterCb(err);
        });
      },
      (err) => callback(err, memo)
    );
  }
  var $0c84690c59b4ccb2$export$533b26079ad0b4b = $0c84690c59b4ccb2$var$awaitify(
    $0c84690c59b4ccb2$var$reduce,
    4
  );
  /**
   * Version of the compose function that is more natural to read. Each function
   * consumes the return value of the previous function. It is the equivalent of
   * [compose]{@link module:ControlFlow.compose} with the arguments reversed.
   *
   * Each function is executed with the `this` binding of the composed function.
   *
   * @name seq
   * @static
   * @memberOf module:ControlFlow
   * @method
   * @see [async.compose]{@link module:ControlFlow.compose}
   * @category Control Flow
   * @param {...AsyncFunction} functions - the asynchronous functions to compose
   * @returns {Function} a function that composes the `functions` in order
   * @example
   *
   * // Requires lodash (or underscore), express3 and dresende's orm2.
   * // Part of an app, that fetches cats of the logged user.
   * // This example uses `seq` function to avoid overnesting and error
   * // handling clutter.
   * app.get('/cats', function(request, response) {
   *     var User = request.models.User;
   *     async.seq(
   *         User.get.bind(User),  // 'User.get' has signature (id, callback(err, data))
   *         function(user, fn) {
   *             user.getCats(fn);      // 'getCats' has signature (callback(err, data))
   *         }
   *     )(req.session.user_id, function (err, cats) {
   *         if (err) {
   *             console.error(err);
   *             response.json({ status: 'error', message: err.message });
   *         } else {
   *             response.json({ status: 'ok', message: 'Cats found', data: cats });
   *         }
   *     });
   * });
   */ function $0c84690c59b4ccb2$export$1041d4276c328e4d(...functions) {
    var _functions = functions.map($0c84690c59b4ccb2$var$wrapAsync);
    return function (...args) {
      var that = this;
      var cb = args[args.length - 1];
      if (typeof cb == "function") args.pop();
      else cb = $0c84690c59b4ccb2$var$promiseCallback();
      $0c84690c59b4ccb2$export$533b26079ad0b4b(
        _functions,
        args,
        (newargs, fn, iterCb) => {
          fn.apply(
            that,
            newargs.concat((err, ...nextargs) => {
              iterCb(err, nextargs);
            })
          );
        },
        (err, results) => cb(err, ...results)
      );
      return cb[$0c84690c59b4ccb2$var$PROMISE_SYMBOL];
    };
  }
  /**
   * Creates a function which is a composition of the passed asynchronous
   * functions. Each function consumes the return value of the function that
   * follows. Composing functions `f()`, `g()`, and `h()` would produce the result
   * of `f(g(h()))`, only this version uses callbacks to obtain the return values.
   *
   * If the last argument to the composed function is not a function, a promise
   * is returned when you call it.
   *
   * Each function is executed with the `this` binding of the composed function.
   *
   * @name compose
   * @static
   * @memberOf module:ControlFlow
   * @method
   * @category Control Flow
   * @param {...AsyncFunction} functions - the asynchronous functions to compose
   * @returns {Function} an asynchronous function that is the composed
   * asynchronous `functions`
   * @example
   *
   * function add1(n, callback) {
   *     setTimeout(function () {
   *         callback(null, n + 1);
   *     }, 10);
   * }
   *
   * function mul3(n, callback) {
   *     setTimeout(function () {
   *         callback(null, n * 3);
   *     }, 10);
   * }
   *
   * var add1mul3 = async.compose(mul3, add1);
   * add1mul3(4, function (err, result) {
   *     // result now equals 15
   * });
   */ function $0c84690c59b4ccb2$export$f672e0b6f7222cd7(...args) {
    return $0c84690c59b4ccb2$export$1041d4276c328e4d(...args.reverse());
  }
  /**
   * The same as [`map`]{@link module:Collections.map} but runs a maximum of `limit` async operations at a time.
   *
   * @name mapLimit
   * @static
   * @memberOf module:Collections
   * @method
   * @see [async.map]{@link module:Collections.map}
   * @category Collection
   * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
   * @param {number} limit - The maximum number of async operations at a time.
   * @param {AsyncFunction} iteratee - An async function to apply to each item in
   * `coll`.
   * The iteratee should complete with the transformed item.
   * Invoked with (item, callback).
   * @param {Function} [callback] - A callback which is called when all `iteratee`
   * functions have finished, or an error occurs. Results is an array of the
   * transformed items from the `coll`. Invoked with (err, results).
   * @returns {Promise} a promise, if no callback is passed
   */ function $0c84690c59b4ccb2$var$mapLimit(coll, limit, iteratee, callback) {
    return $0c84690c59b4ccb2$var$_asyncMap(
      $0c84690c59b4ccb2$var$eachOfLimit(limit),
      coll,
      iteratee,
      callback
    );
  }
  var $0c84690c59b4ccb2$export$6a28d19bcc59197c =
    $0c84690c59b4ccb2$var$awaitify($0c84690c59b4ccb2$var$mapLimit, 4);
  /**
   * The same as [`concat`]{@link module:Collections.concat} but runs a maximum of `limit` async operations at a time.
   *
   * @name concatLimit
   * @static
   * @memberOf module:Collections
   * @method
   * @see [async.concat]{@link module:Collections.concat}
   * @category Collection
   * @alias flatMapLimit
   * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
   * @param {number} limit - The maximum number of async operations at a time.
   * @param {AsyncFunction} iteratee - A function to apply to each item in `coll`,
   * which should use an array as its result. Invoked with (item, callback).
   * @param {Function} [callback] - A callback which is called after all the
   * `iteratee` functions have finished, or an error occurs. Results is an array
   * containing the concatenated results of the `iteratee` function. Invoked with
   * (err, results).
   * @returns A Promise, if no callback is passed
   */ function $0c84690c59b4ccb2$var$concatLimit(
    coll,
    limit,
    iteratee,
    callback
  ) {
    var _iteratee = $0c84690c59b4ccb2$var$wrapAsync(iteratee);
    return $0c84690c59b4ccb2$export$6a28d19bcc59197c(
      coll,
      limit,
      (val, iterCb) => {
        _iteratee(val, (err, ...args) => {
          if (err) return iterCb(err);
          return iterCb(err, args);
        });
      },
      (err, mapResults) => {
        var result = [];
        for (var i = 0; i < mapResults.length; i++)
          if (mapResults[i]) result = result.concat(...mapResults[i]);
        return callback(err, result);
      }
    );
  }
  var $0c84690c59b4ccb2$export$4f1520afe59a31db =
    $0c84690c59b4ccb2$var$awaitify($0c84690c59b4ccb2$var$concatLimit, 4);
  /**
   * Applies `iteratee` to each item in `coll`, concatenating the results. Returns
   * the concatenated list. The `iteratee`s are called in parallel, and the
   * results are concatenated as they return. The results array will be returned in
   * the original order of `coll` passed to the `iteratee` function.
   *
   * @name concat
   * @static
   * @memberOf module:Collections
   * @method
   * @category Collection
   * @alias flatMap
   * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
   * @param {AsyncFunction} iteratee - A function to apply to each item in `coll`,
   * which should use an array as its result. Invoked with (item, callback).
   * @param {Function} [callback] - A callback which is called after all the
   * `iteratee` functions have finished, or an error occurs. Results is an array
   * containing the concatenated results of the `iteratee` function. Invoked with
   * (err, results).
   * @returns A Promise, if no callback is passed
   * @example
   *
   * // dir1 is a directory that contains file1.txt, file2.txt
   * // dir2 is a directory that contains file3.txt, file4.txt
   * // dir3 is a directory that contains file5.txt
   * // dir4 does not exist
   *
   * let directoryList = ['dir1','dir2','dir3'];
   * let withMissingDirectoryList = ['dir1','dir2','dir3', 'dir4'];
   *
   * // Using callbacks
   * async.concat(directoryList, fs.readdir, function(err, results) {
   *    if (err) {
   *        console.log(err);
   *    } else {
   *        console.log(results);
   *        // [ 'file1.txt', 'file2.txt', 'file3.txt', 'file4.txt', file5.txt ]
   *    }
   * });
   *
   * // Error Handling
   * async.concat(withMissingDirectoryList, fs.readdir, function(err, results) {
   *    if (err) {
   *        console.log(err);
   *        // [ Error: ENOENT: no such file or directory ]
   *        // since dir4 does not exist
   *    } else {
   *        console.log(results);
   *    }
   * });
   *
   * // Using Promises
   * async.concat(directoryList, fs.readdir)
   * .then(results => {
   *     console.log(results);
   *     // [ 'file1.txt', 'file2.txt', 'file3.txt', 'file4.txt', file5.txt ]
   * }).catch(err => {
   *      console.log(err);
   * });
   *
   * // Error Handling
   * async.concat(withMissingDirectoryList, fs.readdir)
   * .then(results => {
   *     console.log(results);
   * }).catch(err => {
   *     console.log(err);
   *     // [ Error: ENOENT: no such file or directory ]
   *     // since dir4 does not exist
   * });
   *
   * // Using async/await
   * async () => {
   *     try {
   *         let results = await async.concat(directoryList, fs.readdir);
   *         console.log(results);
   *         // [ 'file1.txt', 'file2.txt', 'file3.txt', 'file4.txt', file5.txt ]
   *     } catch (err) {
   *         console.log(err);
   *     }
   * }
   *
   * // Error Handling
   * async () => {
   *     try {
   *         let results = await async.concat(withMissingDirectoryList, fs.readdir);
   *         console.log(results);
   *     } catch (err) {
   *         console.log(err);
   *         // [ Error: ENOENT: no such file or directory ]
   *         // since dir4 does not exist
   *     }
   * }
   *
   */ function $0c84690c59b4ccb2$var$concat(coll, iteratee, callback) {
    return $0c84690c59b4ccb2$export$4f1520afe59a31db(
      coll,
      Infinity,
      iteratee,
      callback
    );
  }
  var $0c84690c59b4ccb2$export$ee1b3e54f0441b22 =
    $0c84690c59b4ccb2$var$awaitify($0c84690c59b4ccb2$var$concat, 3);
  /**
   * The same as [`concat`]{@link module:Collections.concat} but runs only a single async operation at a time.
   *
   * @name concatSeries
   * @static
   * @memberOf module:Collections
   * @method
   * @see [async.concat]{@link module:Collections.concat}
   * @category Collection
   * @alias flatMapSeries
   * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
   * @param {AsyncFunction} iteratee - A function to apply to each item in `coll`.
   * The iteratee should complete with an array an array of results.
   * Invoked with (item, callback).
   * @param {Function} [callback] - A callback which is called after all the
   * `iteratee` functions have finished, or an error occurs. Results is an array
   * containing the concatenated results of the `iteratee` function. Invoked with
   * (err, results).
   * @returns A Promise, if no callback is passed
   */ function $0c84690c59b4ccb2$var$concatSeries(coll, iteratee, callback) {
    return $0c84690c59b4ccb2$export$4f1520afe59a31db(
      coll,
      1,
      iteratee,
      callback
    );
  }
  var $0c84690c59b4ccb2$export$b6df61d74da01b63 =
    $0c84690c59b4ccb2$var$awaitify($0c84690c59b4ccb2$var$concatSeries, 3);
  /**
   * Returns a function that when called, calls-back with the values provided.
   * Useful as the first function in a [`waterfall`]{@link module:ControlFlow.waterfall}, or for plugging values in to
   * [`auto`]{@link module:ControlFlow.auto}.
   *
   * @name constant
   * @static
   * @memberOf module:Utils
   * @method
   * @category Util
   * @param {...*} arguments... - Any number of arguments to automatically invoke
   * callback with.
   * @returns {AsyncFunction} Returns a function that when invoked, automatically
   * invokes the callback with the previous given arguments.
   * @example
   *
   * async.waterfall([
   *     async.constant(42),
   *     function (value, next) {
   *         // value === 42
   *     },
   *     //...
   * ], callback);
   *
   * async.waterfall([
   *     async.constant(filename, "utf8"),
   *     fs.readFile,
   *     function (fileData, next) {
   *         //...
   *     }
   *     //...
   * ], callback);
   *
   * async.auto({
   *     hostname: async.constant("https://server.net/"),
   *     port: findFreePort,
   *     launchServer: ["hostname", "port", function (options, cb) {
   *         startServer(options, cb);
   *     }],
   *     //...
   * }, callback);
   */ function $0c84690c59b4ccb2$export$c983f826f44ff86(...args) {
    return function (...ignoredArgs /*, callback*/) {
      var callback = ignoredArgs.pop();
      return callback(null, ...args);
    };
  }
  function $0c84690c59b4ccb2$var$_createTester(check, getResult) {
    return (eachfn, arr, _iteratee, cb) => {
      var testPassed = false;
      var testResult;
      const iteratee = $0c84690c59b4ccb2$var$wrapAsync(_iteratee);
      eachfn(
        arr,
        (value, _, callback) => {
          iteratee(value, (err, result) => {
            if (err || err === false) return callback(err);
            if (check(result) && !testResult) {
              testPassed = true;
              testResult = getResult(true, value);
              return callback(null, $0c84690c59b4ccb2$var$breakLoop);
            }
            callback();
          });
        },
        (err) => {
          if (err) return cb(err);
          cb(null, testPassed ? testResult : getResult(false));
        }
      );
    };
  }
  /**
 * Returns the first value in `coll` that passes an async truth test. The
 * `iteratee` is applied in parallel, meaning the first iteratee to return
 * `true` will fire the detect `callback` with that result. That means the
 * result might not be the first item in the original `coll` (in terms of order)
 * that passes the test.

 * If order within the original `coll` is important, then look at
 * [`detectSeries`]{@link module:Collections.detectSeries}.
 *
 * @name detect
 * @static
 * @memberOf module:Collections
 * @method
 * @alias find
 * @category Collections
 * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - A truth test to apply to each item in `coll`.
 * The iteratee must complete with a boolean value as its result.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called as soon as any
 * iteratee returns `true`, or after all the `iteratee` functions have finished.
 * Result will be the first item in the array that passes the truth test
 * (iteratee) or the value `undefined` if none passed. Invoked with
 * (err, result).
 * @returns {Promise} a promise, if a callback is omitted
 * @example
 *
 * // dir1 is a directory that contains file1.txt, file2.txt
 * // dir2 is a directory that contains file3.txt, file4.txt
 * // dir3 is a directory that contains file5.txt
 *
 * // asynchronous function that checks if a file exists
 * function fileExists(file, callback) {
 *    fs.access(file, fs.constants.F_OK, (err) => {
 *        callback(null, !err);
 *    });
 * }
 *
 * async.detect(['file3.txt','file2.txt','dir1/file1.txt'], fileExists,
 *    function(err, result) {
 *        console.log(result);
 *        // dir1/file1.txt
 *        // result now equals the first file in the list that exists
 *    }
 *);
 *
 * // Using Promises
 * async.detect(['file3.txt','file2.txt','dir1/file1.txt'], fileExists)
 * .then(result => {
 *     console.log(result);
 *     // dir1/file1.txt
 *     // result now equals the first file in the list that exists
 * }).catch(err => {
 *     console.log(err);
 * });
 *
 * // Using async/await
 * async () => {
 *     try {
 *         let result = await async.detect(['file3.txt','file2.txt','dir1/file1.txt'], fileExists);
 *         console.log(result);
 *         // dir1/file1.txt
 *         // result now equals the file in the list that exists
 *     }
 *     catch (err) {
 *         console.log(err);
 *     }
 * }
 *
 */ function $0c84690c59b4ccb2$var$detect(coll, iteratee, callback) {
    return $0c84690c59b4ccb2$var$_createTester(
      (bool) => bool,
      (res, item) => item
    )($0c84690c59b4ccb2$export$d10d68e43a57bce9, coll, iteratee, callback);
  }
  var $0c84690c59b4ccb2$export$17b446b869dad473 =
    $0c84690c59b4ccb2$var$awaitify($0c84690c59b4ccb2$var$detect, 3);
  /**
   * The same as [`detect`]{@link module:Collections.detect} but runs a maximum of `limit` async operations at a
   * time.
   *
   * @name detectLimit
   * @static
   * @memberOf module:Collections
   * @method
   * @see [async.detect]{@link module:Collections.detect}
   * @alias findLimit
   * @category Collections
   * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
   * @param {number} limit - The maximum number of async operations at a time.
   * @param {AsyncFunction} iteratee - A truth test to apply to each item in `coll`.
   * The iteratee must complete with a boolean value as its result.
   * Invoked with (item, callback).
   * @param {Function} [callback] - A callback which is called as soon as any
   * iteratee returns `true`, or after all the `iteratee` functions have finished.
   * Result will be the first item in the array that passes the truth test
   * (iteratee) or the value `undefined` if none passed. Invoked with
   * (err, result).
   * @returns {Promise} a promise, if a callback is omitted
   */ function $0c84690c59b4ccb2$var$detectLimit(
    coll,
    limit,
    iteratee,
    callback
  ) {
    return $0c84690c59b4ccb2$var$_createTester(
      (bool) => bool,
      (res, item) => item
    )($0c84690c59b4ccb2$var$eachOfLimit(limit), coll, iteratee, callback);
  }
  var $0c84690c59b4ccb2$export$922bcf02f3a5b284 =
    $0c84690c59b4ccb2$var$awaitify($0c84690c59b4ccb2$var$detectLimit, 4);
  /**
   * The same as [`detect`]{@link module:Collections.detect} but runs only a single async operation at a time.
   *
   * @name detectSeries
   * @static
   * @memberOf module:Collections
   * @method
   * @see [async.detect]{@link module:Collections.detect}
   * @alias findSeries
   * @category Collections
   * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
   * @param {AsyncFunction} iteratee - A truth test to apply to each item in `coll`.
   * The iteratee must complete with a boolean value as its result.
   * Invoked with (item, callback).
   * @param {Function} [callback] - A callback which is called as soon as any
   * iteratee returns `true`, or after all the `iteratee` functions have finished.
   * Result will be the first item in the array that passes the truth test
   * (iteratee) or the value `undefined` if none passed. Invoked with
   * (err, result).
   * @returns {Promise} a promise, if a callback is omitted
   */ function $0c84690c59b4ccb2$var$detectSeries(coll, iteratee, callback) {
    return $0c84690c59b4ccb2$var$_createTester(
      (bool) => bool,
      (res, item) => item
    )($0c84690c59b4ccb2$var$eachOfLimit(1), coll, iteratee, callback);
  }
  var $0c84690c59b4ccb2$export$922a9a31d0cff2ee =
    $0c84690c59b4ccb2$var$awaitify($0c84690c59b4ccb2$var$detectSeries, 3);
  function $0c84690c59b4ccb2$var$consoleFunc(name) {
    return (fn, ...args) =>
      $0c84690c59b4ccb2$var$wrapAsync(fn)(...args, (err, ...resultArgs) => {
        /* istanbul ignore else */ if (typeof console === "object") {
          /* istanbul ignore else */ if (err) {
            /* istanbul ignore else */ if (console.error) console.error(err);
          } else if (console[name]) resultArgs.forEach((x) => console[name](x));
        }
      });
  }
  /**
   * Logs the result of an [`async` function]{@link AsyncFunction} to the
   * `console` using `console.dir` to display the properties of the resulting object.
   * Only works in Node.js or in browsers that support `console.dir` and
   * `console.error` (such as FF and Chrome).
   * If multiple arguments are returned from the async function,
   * `console.dir` is called on each argument in order.
   *
   * @name dir
   * @static
   * @memberOf module:Utils
   * @method
   * @category Util
   * @param {AsyncFunction} function - The function you want to eventually apply
   * all arguments to.
   * @param {...*} arguments... - Any number of arguments to apply to the function.
   * @example
   *
   * // in a module
   * var hello = function(name, callback) {
   *     setTimeout(function() {
   *         callback(null, {hello: name});
   *     }, 1000);
   * };
   *
   * // in the node repl
   * node> async.dir(hello, 'world');
   * {hello: 'world'}
   */ var $0c84690c59b4ccb2$export$147ec2801e896265 =
    $0c84690c59b4ccb2$var$consoleFunc("dir");
  /**
   * The post-check version of [`whilst`]{@link module:ControlFlow.whilst}. To reflect the difference in
   * the order of operations, the arguments `test` and `iteratee` are switched.
   *
   * `doWhilst` is to `whilst` as `do while` is to `while` in plain JavaScript.
   *
   * @name doWhilst
   * @static
   * @memberOf module:ControlFlow
   * @method
   * @see [async.whilst]{@link module:ControlFlow.whilst}
   * @category Control Flow
   * @param {AsyncFunction} iteratee - A function which is called each time `test`
   * passes. Invoked with (callback).
   * @param {AsyncFunction} test - asynchronous truth test to perform after each
   * execution of `iteratee`. Invoked with (...args, callback), where `...args` are the
   * non-error args from the previous callback of `iteratee`.
   * @param {Function} [callback] - A callback which is called after the test
   * function has failed and repeated execution of `iteratee` has stopped.
   * `callback` will be passed an error and any arguments passed to the final
   * `iteratee`'s callback. Invoked with (err, [results]);
   * @returns {Promise} a promise, if no callback is passed
   */ function $0c84690c59b4ccb2$var$doWhilst(iteratee, test, callback) {
    callback = $0c84690c59b4ccb2$var$onlyOnce(callback);
    var _fn = $0c84690c59b4ccb2$var$wrapAsync(iteratee);
    var _test = $0c84690c59b4ccb2$var$wrapAsync(test);
    var results;
    function next(err, ...args) {
      if (err) return callback(err);
      if (err === false) return;
      results = args;
      _test(...args, check);
    }
    function check(err, truth) {
      if (err) return callback(err);
      if (err === false) return;
      if (!truth) return callback(null, ...results);
      _fn(next);
    }
    return check(null, true);
  }
  var $0c84690c59b4ccb2$export$353f40bf1add0d75 =
    $0c84690c59b4ccb2$var$awaitify($0c84690c59b4ccb2$var$doWhilst, 3);
  /**
   * Like ['doWhilst']{@link module:ControlFlow.doWhilst}, except the `test` is inverted. Note the
   * argument ordering differs from `until`.
   *
   * @name doUntil
   * @static
   * @memberOf module:ControlFlow
   * @method
   * @see [async.doWhilst]{@link module:ControlFlow.doWhilst}
   * @category Control Flow
   * @param {AsyncFunction} iteratee - An async function which is called each time
   * `test` fails. Invoked with (callback).
   * @param {AsyncFunction} test - asynchronous truth test to perform after each
   * execution of `iteratee`. Invoked with (...args, callback), where `...args` are the
   * non-error args from the previous callback of `iteratee`
   * @param {Function} [callback] - A callback which is called after the test
   * function has passed and repeated execution of `iteratee` has stopped. `callback`
   * will be passed an error and any arguments passed to the final `iteratee`'s
   * callback. Invoked with (err, [results]);
   * @returns {Promise} a promise, if no callback is passed
   */ function $0c84690c59b4ccb2$export$16f3a0560cc13fb4(
    iteratee,
    test,
    callback
  ) {
    const _test = $0c84690c59b4ccb2$var$wrapAsync(test);
    return $0c84690c59b4ccb2$export$353f40bf1add0d75(
      iteratee,
      (...args) => {
        const cb = args.pop();
        _test(...args, (err, truth) => cb(err, !truth));
      },
      callback
    );
  }
  function $0c84690c59b4ccb2$var$_withoutIndex(iteratee) {
    return (value, index, callback) => iteratee(value, callback);
  }
  /**
   * Applies the function `iteratee` to each item in `coll`, in parallel.
   * The `iteratee` is called with an item from the list, and a callback for when
   * it has finished. If the `iteratee` passes an error to its `callback`, the
   * main `callback` (for the `each` function) is immediately called with the
   * error.
   *
   * Note, that since this function applies `iteratee` to each item in parallel,
   * there is no guarantee that the iteratee functions will complete in order.
   *
   * @name each
   * @static
   * @memberOf module:Collections
   * @method
   * @alias forEach
   * @category Collection
   * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
   * @param {AsyncFunction} iteratee - An async function to apply to
   * each item in `coll`. Invoked with (item, callback).
   * The array index is not passed to the iteratee.
   * If you need the index, use `eachOf`.
   * @param {Function} [callback] - A callback which is called when all
   * `iteratee` functions have finished, or an error occurs. Invoked with (err).
   * @returns {Promise} a promise, if a callback is omitted
   * @example
   *
   * // dir1 is a directory that contains file1.txt, file2.txt
   * // dir2 is a directory that contains file3.txt, file4.txt
   * // dir3 is a directory that contains file5.txt
   * // dir4 does not exist
   *
   * const fileList = [ 'dir1/file2.txt', 'dir2/file3.txt', 'dir/file5.txt'];
   * const withMissingFileList = ['dir1/file1.txt', 'dir4/file2.txt'];
   *
   * // asynchronous function that deletes a file
   * const deleteFile = function(file, callback) {
   *     fs.unlink(file, callback);
   * };
   *
   * // Using callbacks
   * async.each(fileList, deleteFile, function(err) {
   *     if( err ) {
   *         console.log(err);
   *     } else {
   *         console.log('All files have been deleted successfully');
   *     }
   * });
   *
   * // Error Handling
   * async.each(withMissingFileList, deleteFile, function(err){
   *     console.log(err);
   *     // [ Error: ENOENT: no such file or directory ]
   *     // since dir4/file2.txt does not exist
   *     // dir1/file1.txt could have been deleted
   * });
   *
   * // Using Promises
   * async.each(fileList, deleteFile)
   * .then( () => {
   *     console.log('All files have been deleted successfully');
   * }).catch( err => {
   *     console.log(err);
   * });
   *
   * // Error Handling
   * async.each(fileList, deleteFile)
   * .then( () => {
   *     console.log('All files have been deleted successfully');
   * }).catch( err => {
   *     console.log(err);
   *     // [ Error: ENOENT: no such file or directory ]
   *     // since dir4/file2.txt does not exist
   *     // dir1/file1.txt could have been deleted
   * });
   *
   * // Using async/await
   * async () => {
   *     try {
   *         await async.each(files, deleteFile);
   *     }
   *     catch (err) {
   *         console.log(err);
   *     }
   * }
   *
   * // Error Handling
   * async () => {
   *     try {
   *         await async.each(withMissingFileList, deleteFile);
   *     }
   *     catch (err) {
   *         console.log(err);
   *         // [ Error: ENOENT: no such file or directory ]
   *         // since dir4/file2.txt does not exist
   *         // dir1/file1.txt could have been deleted
   *     }
   * }
   *
   */ function $0c84690c59b4ccb2$var$eachLimit(coll, iteratee, callback) {
    return $0c84690c59b4ccb2$export$d10d68e43a57bce9(
      coll,
      $0c84690c59b4ccb2$var$_withoutIndex(
        $0c84690c59b4ccb2$var$wrapAsync(iteratee)
      ),
      callback
    );
  }
  var $0c84690c59b4ccb2$export$79b2f7037acddd43 =
    $0c84690c59b4ccb2$var$awaitify($0c84690c59b4ccb2$var$eachLimit, 3);
  /**
   * The same as [`each`]{@link module:Collections.each} but runs a maximum of `limit` async operations at a time.
   *
   * @name eachLimit
   * @static
   * @memberOf module:Collections
   * @method
   * @see [async.each]{@link module:Collections.each}
   * @alias forEachLimit
   * @category Collection
   * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
   * @param {number} limit - The maximum number of async operations at a time.
   * @param {AsyncFunction} iteratee - An async function to apply to each item in
   * `coll`.
   * The array index is not passed to the iteratee.
   * If you need the index, use `eachOfLimit`.
   * Invoked with (item, callback).
   * @param {Function} [callback] - A callback which is called when all
   * `iteratee` functions have finished, or an error occurs. Invoked with (err).
   * @returns {Promise} a promise, if a callback is omitted
   */ function $0c84690c59b4ccb2$var$eachLimit$1(
    coll,
    limit,
    iteratee,
    callback
  ) {
    return $0c84690c59b4ccb2$var$eachOfLimit(limit)(
      coll,
      $0c84690c59b4ccb2$var$_withoutIndex(
        $0c84690c59b4ccb2$var$wrapAsync(iteratee)
      ),
      callback
    );
  }
  var $0c84690c59b4ccb2$export$2a2080ddac50d6b8 =
    $0c84690c59b4ccb2$var$awaitify($0c84690c59b4ccb2$var$eachLimit$1, 4);
  /**
 * The same as [`each`]{@link module:Collections.each} but runs only a single async operation at a time.
 *
 * Note, that unlike [`each`]{@link module:Collections.each}, this function applies iteratee to each item
 * in series and therefore the iteratee functions will complete in order.

 * @name eachSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.each]{@link module:Collections.each}
 * @alias forEachSeries
 * @category Collection
 * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async function to apply to each
 * item in `coll`.
 * The array index is not passed to the iteratee.
 * If you need the index, use `eachOfSeries`.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called when all
 * `iteratee` functions have finished, or an error occurs. Invoked with (err).
 * @returns {Promise} a promise, if a callback is omitted
 */ function $0c84690c59b4ccb2$var$eachSeries(coll, iteratee, callback) {
    return $0c84690c59b4ccb2$export$2a2080ddac50d6b8(
      coll,
      1,
      iteratee,
      callback
    );
  }
  var $0c84690c59b4ccb2$export$9bd663f1fadd104c =
    $0c84690c59b4ccb2$var$awaitify($0c84690c59b4ccb2$var$eachSeries, 3);
  /**
   * Wrap an async function and ensure it calls its callback on a later tick of
   * the event loop.  If the function already calls its callback on a next tick,
   * no extra deferral is added. This is useful for preventing stack overflows
   * (`RangeError: Maximum call stack size exceeded`) and generally keeping
   * [Zalgo](http://blog.izs.me/post/59142742143/designing-apis-for-asynchrony)
   * contained. ES2017 `async` functions are returned as-is -- they are immune
   * to Zalgo's corrupting influences, as they always resolve on a later tick.
   *
   * @name ensureAsync
   * @static
   * @memberOf module:Utils
   * @method
   * @category Util
   * @param {AsyncFunction} fn - an async function, one that expects a node-style
   * callback as its last argument.
   * @returns {AsyncFunction} Returns a wrapped function with the exact same call
   * signature as the function passed in.
   * @example
   *
   * function sometimesAsync(arg, callback) {
   *     if (cache[arg]) {
   *         return callback(null, cache[arg]); // this would be synchronous!!
   *     } else {
   *         doSomeIO(arg, callback); // this IO would be asynchronous
   *     }
   * }
   *
   * // this has a risk of stack overflows if many results are cached in a row
   * async.mapSeries(args, sometimesAsync, done);
   *
   * // this will defer sometimesAsync's callback if necessary,
   * // preventing stack overflows
   * async.mapSeries(args, async.ensureAsync(sometimesAsync), done);
   */ function $0c84690c59b4ccb2$export$85d5b9ccf228381c(fn) {
    if ($0c84690c59b4ccb2$var$isAsync(fn)) return fn;
    return function (...args /*, callback*/) {
      var callback = args.pop();
      var sync = true;
      args.push((...innerArgs) => {
        if (sync)
          $0c84690c59b4ccb2$export$c233f08fbfea0913(() =>
            callback(...innerArgs)
          );
        else callback(...innerArgs);
      });
      fn.apply(this, args);
      sync = false;
    };
  }
  /**
   * Returns `true` if every element in `coll` satisfies an async test. If any
   * iteratee call returns `false`, the main `callback` is immediately called.
   *
   * @name every
   * @static
   * @memberOf module:Collections
   * @method
   * @alias all
   * @category Collection
   * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
   * @param {AsyncFunction} iteratee - An async truth test to apply to each item
   * in the collection in parallel.
   * The iteratee must complete with a boolean result value.
   * Invoked with (item, callback).
   * @param {Function} [callback] - A callback which is called after all the
   * `iteratee` functions have finished. Result will be either `true` or `false`
   * depending on the values of the async tests. Invoked with (err, result).
   * @returns {Promise} a promise, if no callback provided
   * @example
   *
   * // dir1 is a directory that contains file1.txt, file2.txt
   * // dir2 is a directory that contains file3.txt, file4.txt
   * // dir3 is a directory that contains file5.txt
   * // dir4 does not exist
   *
   * const fileList = ['dir1/file1.txt','dir2/file3.txt','dir3/file5.txt'];
   * const withMissingFileList = ['file1.txt','file2.txt','file4.txt'];
   *
   * // asynchronous function that checks if a file exists
   * function fileExists(file, callback) {
   *    fs.access(file, fs.constants.F_OK, (err) => {
   *        callback(null, !err);
   *    });
   * }
   *
   * // Using callbacks
   * async.every(fileList, fileExists, function(err, result) {
   *     console.log(result);
   *     // true
   *     // result is true since every file exists
   * });
   *
   * async.every(withMissingFileList, fileExists, function(err, result) {
   *     console.log(result);
   *     // false
   *     // result is false since NOT every file exists
   * });
   *
   * // Using Promises
   * async.every(fileList, fileExists)
   * .then( result => {
   *     console.log(result);
   *     // true
   *     // result is true since every file exists
   * }).catch( err => {
   *     console.log(err);
   * });
   *
   * async.every(withMissingFileList, fileExists)
   * .then( result => {
   *     console.log(result);
   *     // false
   *     // result is false since NOT every file exists
   * }).catch( err => {
   *     console.log(err);
   * });
   *
   * // Using async/await
   * async () => {
   *     try {
   *         let result = await async.every(fileList, fileExists);
   *         console.log(result);
   *         // true
   *         // result is true since every file exists
   *     }
   *     catch (err) {
   *         console.log(err);
   *     }
   * }
   *
   * async () => {
   *     try {
   *         let result = await async.every(withMissingFileList, fileExists);
   *         console.log(result);
   *         // false
   *         // result is false since NOT every file exists
   *     }
   *     catch (err) {
   *         console.log(err);
   *     }
   * }
   *
   */ function $0c84690c59b4ccb2$var$every(coll, iteratee, callback) {
    return $0c84690c59b4ccb2$var$_createTester(
      (bool) => !bool,
      (res) => !res
    )($0c84690c59b4ccb2$export$d10d68e43a57bce9, coll, iteratee, callback);
  }
  var $0c84690c59b4ccb2$export$7ecc1a3b11b57dab =
    $0c84690c59b4ccb2$var$awaitify($0c84690c59b4ccb2$var$every, 3);
  /**
   * The same as [`every`]{@link module:Collections.every} but runs a maximum of `limit` async operations at a time.
   *
   * @name everyLimit
   * @static
   * @memberOf module:Collections
   * @method
   * @see [async.every]{@link module:Collections.every}
   * @alias allLimit
   * @category Collection
   * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
   * @param {number} limit - The maximum number of async operations at a time.
   * @param {AsyncFunction} iteratee - An async truth test to apply to each item
   * in the collection in parallel.
   * The iteratee must complete with a boolean result value.
   * Invoked with (item, callback).
   * @param {Function} [callback] - A callback which is called after all the
   * `iteratee` functions have finished. Result will be either `true` or `false`
   * depending on the values of the async tests. Invoked with (err, result).
   * @returns {Promise} a promise, if no callback provided
   */ function $0c84690c59b4ccb2$var$everyLimit(
    coll,
    limit,
    iteratee,
    callback
  ) {
    return $0c84690c59b4ccb2$var$_createTester(
      (bool) => !bool,
      (res) => !res
    )($0c84690c59b4ccb2$var$eachOfLimit(limit), coll, iteratee, callback);
  }
  var $0c84690c59b4ccb2$export$61377f8da40b9b4c =
    $0c84690c59b4ccb2$var$awaitify($0c84690c59b4ccb2$var$everyLimit, 4);
  /**
   * The same as [`every`]{@link module:Collections.every} but runs only a single async operation at a time.
   *
   * @name everySeries
   * @static
   * @memberOf module:Collections
   * @method
   * @see [async.every]{@link module:Collections.every}
   * @alias allSeries
   * @category Collection
   * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
   * @param {AsyncFunction} iteratee - An async truth test to apply to each item
   * in the collection in series.
   * The iteratee must complete with a boolean result value.
   * Invoked with (item, callback).
   * @param {Function} [callback] - A callback which is called after all the
   * `iteratee` functions have finished. Result will be either `true` or `false`
   * depending on the values of the async tests. Invoked with (err, result).
   * @returns {Promise} a promise, if no callback provided
   */ function $0c84690c59b4ccb2$var$everySeries(coll, iteratee, callback) {
    return $0c84690c59b4ccb2$var$_createTester(
      (bool) => !bool,
      (res) => !res
    )($0c84690c59b4ccb2$export$750e7e5fea3b0654, coll, iteratee, callback);
  }
  var $0c84690c59b4ccb2$export$7ce9462b07c48a66 =
    $0c84690c59b4ccb2$var$awaitify($0c84690c59b4ccb2$var$everySeries, 3);
  function $0c84690c59b4ccb2$var$filterArray(eachfn, arr, iteratee, callback) {
    var truthValues = new Array(arr.length);
    eachfn(
      arr,
      (x, index, iterCb) => {
        iteratee(x, (err, v) => {
          truthValues[index] = !!v;
          iterCb(err);
        });
      },
      (err) => {
        if (err) return callback(err);
        var results = [];
        for (var i = 0; i < arr.length; i++)
          if (truthValues[i]) results.push(arr[i]);
        callback(null, results);
      }
    );
  }
  function $0c84690c59b4ccb2$var$filterGeneric(
    eachfn,
    coll,
    iteratee,
    callback
  ) {
    var results = [];
    eachfn(
      coll,
      (x, index, iterCb) => {
        iteratee(x, (err, v) => {
          if (err) return iterCb(err);
          if (v)
            results.push({
              index: index,
              value: x,
            });
          iterCb(err);
        });
      },
      (err) => {
        if (err) return callback(err);
        callback(
          null,
          results.sort((a, b) => a.index - b.index).map((v) => v.value)
        );
      }
    );
  }
  function $0c84690c59b4ccb2$var$_filter(eachfn, coll, iteratee, callback) {
    var filter = $0c84690c59b4ccb2$var$isArrayLike(coll)
      ? $0c84690c59b4ccb2$var$filterArray
      : $0c84690c59b4ccb2$var$filterGeneric;
    return filter(
      eachfn,
      coll,
      $0c84690c59b4ccb2$var$wrapAsync(iteratee),
      callback
    );
  }
  /**
   * Returns a new array of all the values in `coll` which pass an async truth
   * test. This operation is performed in parallel, but the results array will be
   * in the same order as the original.
   *
   * @name filter
   * @static
   * @memberOf module:Collections
   * @method
   * @alias select
   * @category Collection
   * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
   * @param {Function} iteratee - A truth test to apply to each item in `coll`.
   * The `iteratee` is passed a `callback(err, truthValue)`, which must be called
   * with a boolean argument once it has completed. Invoked with (item, callback).
   * @param {Function} [callback] - A callback which is called after all the
   * `iteratee` functions have finished. Invoked with (err, results).
   * @returns {Promise} a promise, if no callback provided
   * @example
   *
   * // dir1 is a directory that contains file1.txt, file2.txt
   * // dir2 is a directory that contains file3.txt, file4.txt
   * // dir3 is a directory that contains file5.txt
   *
   * const files = ['dir1/file1.txt','dir2/file3.txt','dir3/file6.txt'];
   *
   * // asynchronous function that checks if a file exists
   * function fileExists(file, callback) {
   *    fs.access(file, fs.constants.F_OK, (err) => {
   *        callback(null, !err);
   *    });
   * }
   *
   * // Using callbacks
   * async.filter(files, fileExists, function(err, results) {
   *    if(err) {
   *        console.log(err);
   *    } else {
   *        console.log(results);
   *        // [ 'dir1/file1.txt', 'dir2/file3.txt' ]
   *        // results is now an array of the existing files
   *    }
   * });
   *
   * // Using Promises
   * async.filter(files, fileExists)
   * .then(results => {
   *     console.log(results);
   *     // [ 'dir1/file1.txt', 'dir2/file3.txt' ]
   *     // results is now an array of the existing files
   * }).catch(err => {
   *     console.log(err);
   * });
   *
   * // Using async/await
   * async () => {
   *     try {
   *         let results = await async.filter(files, fileExists);
   *         console.log(results);
   *         // [ 'dir1/file1.txt', 'dir2/file3.txt' ]
   *         // results is now an array of the existing files
   *     }
   *     catch (err) {
   *         console.log(err);
   *     }
   * }
   *
   */ function $0c84690c59b4ccb2$var$filter(coll, iteratee, callback) {
    return $0c84690c59b4ccb2$var$_filter(
      $0c84690c59b4ccb2$export$d10d68e43a57bce9,
      coll,
      iteratee,
      callback
    );
  }
  var $0c84690c59b4ccb2$export$3dea766d36a8935f =
    $0c84690c59b4ccb2$var$awaitify($0c84690c59b4ccb2$var$filter, 3);
  /**
   * The same as [`filter`]{@link module:Collections.filter} but runs a maximum of `limit` async operations at a
   * time.
   *
   * @name filterLimit
   * @static
   * @memberOf module:Collections
   * @method
   * @see [async.filter]{@link module:Collections.filter}
   * @alias selectLimit
   * @category Collection
   * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
   * @param {number} limit - The maximum number of async operations at a time.
   * @param {Function} iteratee - A truth test to apply to each item in `coll`.
   * The `iteratee` is passed a `callback(err, truthValue)`, which must be called
   * with a boolean argument once it has completed. Invoked with (item, callback).
   * @param {Function} [callback] - A callback which is called after all the
   * `iteratee` functions have finished. Invoked with (err, results).
   * @returns {Promise} a promise, if no callback provided
   */ function $0c84690c59b4ccb2$var$filterLimit(
    coll,
    limit,
    iteratee,
    callback
  ) {
    return $0c84690c59b4ccb2$var$_filter(
      $0c84690c59b4ccb2$var$eachOfLimit(limit),
      coll,
      iteratee,
      callback
    );
  }
  var $0c84690c59b4ccb2$export$6a93acd3681313ac =
    $0c84690c59b4ccb2$var$awaitify($0c84690c59b4ccb2$var$filterLimit, 4);
  /**
   * The same as [`filter`]{@link module:Collections.filter} but runs only a single async operation at a time.
   *
   * @name filterSeries
   * @static
   * @memberOf module:Collections
   * @method
   * @see [async.filter]{@link module:Collections.filter}
   * @alias selectSeries
   * @category Collection
   * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
   * @param {Function} iteratee - A truth test to apply to each item in `coll`.
   * The `iteratee` is passed a `callback(err, truthValue)`, which must be called
   * with a boolean argument once it has completed. Invoked with (item, callback).
   * @param {Function} [callback] - A callback which is called after all the
   * `iteratee` functions have finished. Invoked with (err, results)
   * @returns {Promise} a promise, if no callback provided
   */ function $0c84690c59b4ccb2$var$filterSeries(coll, iteratee, callback) {
    return $0c84690c59b4ccb2$var$_filter(
      $0c84690c59b4ccb2$export$750e7e5fea3b0654,
      coll,
      iteratee,
      callback
    );
  }
  var $0c84690c59b4ccb2$export$ddcc38daaa46257c =
    $0c84690c59b4ccb2$var$awaitify($0c84690c59b4ccb2$var$filterSeries, 3);
  /**
 * Calls the asynchronous function `fn` with a callback parameter that allows it
 * to call itself again, in series, indefinitely.

 * If an error is passed to the callback then `errback` is called with the
 * error, and execution stops, otherwise it will never be called.
 *
 * @name forever
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {AsyncFunction} fn - an async function to call repeatedly.
 * Invoked with (next).
 * @param {Function} [errback] - when `fn` passes an error to it's callback,
 * this function will be called, and execution stops. Invoked with (err).
 * @returns {Promise} a promise that rejects if an error occurs and an errback
 * is not passed
 * @example
 *
 * async.forever(
 *     function(next) {
 *         // next is suitable for passing to things that need a callback(err [, whatever]);
 *         // it will result in this function being called again.
 *     },
 *     function(err) {
 *         // if next is called with a value in its first parameter, it will appear
 *         // in here as 'err', and execution will stop.
 *     }
 * );
 */ function $0c84690c59b4ccb2$var$forever(fn, errback) {
    var done = $0c84690c59b4ccb2$var$onlyOnce(errback);
    var task = $0c84690c59b4ccb2$var$wrapAsync(
      $0c84690c59b4ccb2$export$85d5b9ccf228381c(fn)
    );
    function next(err) {
      if (err) return done(err);
      if (err === false) return;
      task(next);
    }
    return next();
  }
  var $0c84690c59b4ccb2$export$116a0f7f2303acd8 =
    $0c84690c59b4ccb2$var$awaitify($0c84690c59b4ccb2$var$forever, 2);
  /**
   * The same as [`groupBy`]{@link module:Collections.groupBy} but runs a maximum of `limit` async operations at a time.
   *
   * @name groupByLimit
   * @static
   * @memberOf module:Collections
   * @method
   * @see [async.groupBy]{@link module:Collections.groupBy}
   * @category Collection
   * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
   * @param {number} limit - The maximum number of async operations at a time.
   * @param {AsyncFunction} iteratee - An async function to apply to each item in
   * `coll`.
   * The iteratee should complete with a `key` to group the value under.
   * Invoked with (value, callback).
   * @param {Function} [callback] - A callback which is called when all `iteratee`
   * functions have finished, or an error occurs. Result is an `Object` whoses
   * properties are arrays of values which returned the corresponding key.
   * @returns {Promise} a promise, if no callback is passed
   */ function $0c84690c59b4ccb2$var$groupByLimit(
    coll,
    limit,
    iteratee,
    callback
  ) {
    var _iteratee = $0c84690c59b4ccb2$var$wrapAsync(iteratee);
    return $0c84690c59b4ccb2$export$6a28d19bcc59197c(
      coll,
      limit,
      (val, iterCb) => {
        _iteratee(val, (err, key) => {
          if (err) return iterCb(err);
          return iterCb(err, {
            key: key,
            val: val,
          });
        });
      },
      (err, mapResults) => {
        var result = {};
        // from MDN, handle object having an `hasOwnProperty` prop
        var { hasOwnProperty: hasOwnProperty } = Object.prototype;
        for (var i = 0; i < mapResults.length; i++)
          if (mapResults[i]) {
            var { key: key } = mapResults[i];
            var { val: val } = mapResults[i];
            if (hasOwnProperty.call(result, key)) result[key].push(val);
            else result[key] = [val];
          }
        return callback(err, result);
      }
    );
  }
  var $0c84690c59b4ccb2$export$335ad4c8e8977a4b =
    $0c84690c59b4ccb2$var$awaitify($0c84690c59b4ccb2$var$groupByLimit, 4);
  /**
   * Returns a new object, where each value corresponds to an array of items, from
   * `coll`, that returned the corresponding key. That is, the keys of the object
   * correspond to the values passed to the `iteratee` callback.
   *
   * Note: Since this function applies the `iteratee` to each item in parallel,
   * there is no guarantee that the `iteratee` functions will complete in order.
   * However, the values for each key in the `result` will be in the same order as
   * the original `coll`. For Objects, the values will roughly be in the order of
   * the original Objects' keys (but this can vary across JavaScript engines).
   *
   * @name groupBy
   * @static
   * @memberOf module:Collections
   * @method
   * @category Collection
   * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
   * @param {AsyncFunction} iteratee - An async function to apply to each item in
   * `coll`.
   * The iteratee should complete with a `key` to group the value under.
   * Invoked with (value, callback).
   * @param {Function} [callback] - A callback which is called when all `iteratee`
   * functions have finished, or an error occurs. Result is an `Object` whoses
   * properties are arrays of values which returned the corresponding key.
   * @returns {Promise} a promise, if no callback is passed
   * @example
   *
   * // dir1 is a directory that contains file1.txt, file2.txt
   * // dir2 is a directory that contains file3.txt, file4.txt
   * // dir3 is a directory that contains file5.txt
   * // dir4 does not exist
   *
   * const files = ['dir1/file1.txt','dir2','dir4']
   *
   * // asynchronous function that detects file type as none, file, or directory
   * function detectFile(file, callback) {
   *     fs.stat(file, function(err, stat) {
   *         if (err) {
   *             return callback(null, 'none');
   *         }
   *         callback(null, stat.isDirectory() ? 'directory' : 'file');
   *     });
   * }
   *
   * //Using callbacks
   * async.groupBy(files, detectFile, function(err, result) {
   *     if(err) {
   *         console.log(err);
   *     } else {
   *	       console.log(result);
   *         // {
   *         //     file: [ 'dir1/file1.txt' ],
   *         //     none: [ 'dir4' ],
   *         //     directory: [ 'dir2']
   *         // }
   *         // result is object containing the files grouped by type
   *     }
   * });
   *
   * // Using Promises
   * async.groupBy(files, detectFile)
   * .then( result => {
   *     console.log(result);
   *     // {
   *     //     file: [ 'dir1/file1.txt' ],
   *     //     none: [ 'dir4' ],
   *     //     directory: [ 'dir2']
   *     // }
   *     // result is object containing the files grouped by type
   * }).catch( err => {
   *     console.log(err);
   * });
   *
   * // Using async/await
   * async () => {
   *     try {
   *         let result = await async.groupBy(files, detectFile);
   *         console.log(result);
   *         // {
   *         //     file: [ 'dir1/file1.txt' ],
   *         //     none: [ 'dir4' ],
   *         //     directory: [ 'dir2']
   *         // }
   *         // result is object containing the files grouped by type
   *     }
   *     catch (err) {
   *         console.log(err);
   *     }
   * }
   *
   */ function $0c84690c59b4ccb2$export$3f063810d7bf01bd(
    coll,
    iteratee,
    callback
  ) {
    return $0c84690c59b4ccb2$export$335ad4c8e8977a4b(
      coll,
      Infinity,
      iteratee,
      callback
    );
  }
  /**
   * The same as [`groupBy`]{@link module:Collections.groupBy} but runs only a single async operation at a time.
   *
   * @name groupBySeries
   * @static
   * @memberOf module:Collections
   * @method
   * @see [async.groupBy]{@link module:Collections.groupBy}
   * @category Collection
   * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
   * @param {AsyncFunction} iteratee - An async function to apply to each item in
   * `coll`.
   * The iteratee should complete with a `key` to group the value under.
   * Invoked with (value, callback).
   * @param {Function} [callback] - A callback which is called when all `iteratee`
   * functions have finished, or an error occurs. Result is an `Object` whose
   * properties are arrays of values which returned the corresponding key.
   * @returns {Promise} a promise, if no callback is passed
   */ function $0c84690c59b4ccb2$export$d0689f2b629adbdb(
    coll,
    iteratee,
    callback
  ) {
    return $0c84690c59b4ccb2$export$335ad4c8e8977a4b(
      coll,
      1,
      iteratee,
      callback
    );
  }
  /**
   * Logs the result of an `async` function to the `console`. Only works in
   * Node.js or in browsers that support `console.log` and `console.error` (such
   * as FF and Chrome). If multiple arguments are returned from the async
   * function, `console.log` is called on each argument in order.
   *
   * @name log
   * @static
   * @memberOf module:Utils
   * @method
   * @category Util
   * @param {AsyncFunction} function - The function you want to eventually apply
   * all arguments to.
   * @param {...*} arguments... - Any number of arguments to apply to the function.
   * @example
   *
   * // in a module
   * var hello = function(name, callback) {
   *     setTimeout(function() {
   *         callback(null, 'hello ' + name);
   *     }, 1000);
   * };
   *
   * // in the node repl
   * node> async.log(hello, 'world');
   * 'hello world'
   */ var $0c84690c59b4ccb2$export$bef1f36f5486a6a3 =
    $0c84690c59b4ccb2$var$consoleFunc("log");
  /**
   * The same as [`mapValues`]{@link module:Collections.mapValues} but runs a maximum of `limit` async operations at a
   * time.
   *
   * @name mapValuesLimit
   * @static
   * @memberOf module:Collections
   * @method
   * @see [async.mapValues]{@link module:Collections.mapValues}
   * @category Collection
   * @param {Object} obj - A collection to iterate over.
   * @param {number} limit - The maximum number of async operations at a time.
   * @param {AsyncFunction} iteratee - A function to apply to each value and key
   * in `coll`.
   * The iteratee should complete with the transformed value as its result.
   * Invoked with (value, key, callback).
   * @param {Function} [callback] - A callback which is called when all `iteratee`
   * functions have finished, or an error occurs. `result` is a new object consisting
   * of each key from `obj`, with each transformed value on the right-hand side.
   * Invoked with (err, result).
   * @returns {Promise} a promise, if no callback is passed
   */ function $0c84690c59b4ccb2$var$mapValuesLimit(
    obj,
    limit,
    iteratee,
    callback
  ) {
    callback = $0c84690c59b4ccb2$var$once(callback);
    var newObj = {};
    var _iteratee = $0c84690c59b4ccb2$var$wrapAsync(iteratee);
    return $0c84690c59b4ccb2$var$eachOfLimit(limit)(
      obj,
      (val, key, next) => {
        _iteratee(val, key, (err, result) => {
          if (err) return next(err);
          newObj[key] = result;
          next(err);
        });
      },
      (err) => callback(err, newObj)
    );
  }
  var $0c84690c59b4ccb2$export$d5d82430c6fa645f =
    $0c84690c59b4ccb2$var$awaitify($0c84690c59b4ccb2$var$mapValuesLimit, 4);
  /**
   * A relative of [`map`]{@link module:Collections.map}, designed for use with objects.
   *
   * Produces a new Object by mapping each value of `obj` through the `iteratee`
   * function. The `iteratee` is called each `value` and `key` from `obj` and a
   * callback for when it has finished processing. Each of these callbacks takes
   * two arguments: an `error`, and the transformed item from `obj`. If `iteratee`
   * passes an error to its callback, the main `callback` (for the `mapValues`
   * function) is immediately called with the error.
   *
   * Note, the order of the keys in the result is not guaranteed.  The keys will
   * be roughly in the order they complete, (but this is very engine-specific)
   *
   * @name mapValues
   * @static
   * @memberOf module:Collections
   * @method
   * @category Collection
   * @param {Object} obj - A collection to iterate over.
   * @param {AsyncFunction} iteratee - A function to apply to each value and key
   * in `coll`.
   * The iteratee should complete with the transformed value as its result.
   * Invoked with (value, key, callback).
   * @param {Function} [callback] - A callback which is called when all `iteratee`
   * functions have finished, or an error occurs. `result` is a new object consisting
   * of each key from `obj`, with each transformed value on the right-hand side.
   * Invoked with (err, result).
   * @returns {Promise} a promise, if no callback is passed
   * @example
   *
   * // file1.txt is a file that is 1000 bytes in size
   * // file2.txt is a file that is 2000 bytes in size
   * // file3.txt is a file that is 3000 bytes in size
   * // file4.txt does not exist
   *
   * const fileMap = {
   *     f1: 'file1.txt',
   *     f2: 'file2.txt',
   *     f3: 'file3.txt'
   * };
   *
   * const withMissingFileMap = {
   *     f1: 'file1.txt',
   *     f2: 'file2.txt',
   *     f3: 'file4.txt'
   * };
   *
   * // asynchronous function that returns the file size in bytes
   * function getFileSizeInBytes(file, key, callback) {
   *     fs.stat(file, function(err, stat) {
   *         if (err) {
   *             return callback(err);
   *         }
   *         callback(null, stat.size);
   *     });
   * }
   *
   * // Using callbacks
   * async.mapValues(fileMap, getFileSizeInBytes, function(err, result) {
   *     if (err) {
   *         console.log(err);
   *     } else {
   *         console.log(result);
   *         // result is now a map of file size in bytes for each file, e.g.
   *         // {
   *         //     f1: 1000,
   *         //     f2: 2000,
   *         //     f3: 3000
   *         // }
   *     }
   * });
   *
   * // Error handling
   * async.mapValues(withMissingFileMap, getFileSizeInBytes, function(err, result) {
   *     if (err) {
   *         console.log(err);
   *         // [ Error: ENOENT: no such file or directory ]
   *     } else {
   *         console.log(result);
   *     }
   * });
   *
   * // Using Promises
   * async.mapValues(fileMap, getFileSizeInBytes)
   * .then( result => {
   *     console.log(result);
   *     // result is now a map of file size in bytes for each file, e.g.
   *     // {
   *     //     f1: 1000,
   *     //     f2: 2000,
   *     //     f3: 3000
   *     // }
   * }).catch (err => {
   *     console.log(err);
   * });
   *
   * // Error Handling
   * async.mapValues(withMissingFileMap, getFileSizeInBytes)
   * .then( result => {
   *     console.log(result);
   * }).catch (err => {
   *     console.log(err);
   *     // [ Error: ENOENT: no such file or directory ]
   * });
   *
   * // Using async/await
   * async () => {
   *     try {
   *         let result = await async.mapValues(fileMap, getFileSizeInBytes);
   *         console.log(result);
   *         // result is now a map of file size in bytes for each file, e.g.
   *         // {
   *         //     f1: 1000,
   *         //     f2: 2000,
   *         //     f3: 3000
   *         // }
   *     }
   *     catch (err) {
   *         console.log(err);
   *     }
   * }
   *
   * // Error Handling
   * async () => {
   *     try {
   *         let result = await async.mapValues(withMissingFileMap, getFileSizeInBytes);
   *         console.log(result);
   *     }
   *     catch (err) {
   *         console.log(err);
   *         // [ Error: ENOENT: no such file or directory ]
   *     }
   * }
   *
   */ function $0c84690c59b4ccb2$export$825e789796ab7275(
    obj,
    iteratee,
    callback
  ) {
    return $0c84690c59b4ccb2$export$d5d82430c6fa645f(
      obj,
      Infinity,
      iteratee,
      callback
    );
  }
  /**
   * The same as [`mapValues`]{@link module:Collections.mapValues} but runs only a single async operation at a time.
   *
   * @name mapValuesSeries
   * @static
   * @memberOf module:Collections
   * @method
   * @see [async.mapValues]{@link module:Collections.mapValues}
   * @category Collection
   * @param {Object} obj - A collection to iterate over.
   * @param {AsyncFunction} iteratee - A function to apply to each value and key
   * in `coll`.
   * The iteratee should complete with the transformed value as its result.
   * Invoked with (value, key, callback).
   * @param {Function} [callback] - A callback which is called when all `iteratee`
   * functions have finished, or an error occurs. `result` is a new object consisting
   * of each key from `obj`, with each transformed value on the right-hand side.
   * Invoked with (err, result).
   * @returns {Promise} a promise, if no callback is passed
   */ function $0c84690c59b4ccb2$export$8fbd16e43ec40b44(
    obj,
    iteratee,
    callback
  ) {
    return $0c84690c59b4ccb2$export$d5d82430c6fa645f(
      obj,
      1,
      iteratee,
      callback
    );
  }
  /**
   * Caches the results of an async function. When creating a hash to store
   * function results against, the callback is omitted from the hash and an
   * optional hash function can be used.
   *
   * **Note: if the async function errs, the result will not be cached and
   * subsequent calls will call the wrapped function.**
   *
   * If no hash function is specified, the first argument is used as a hash key,
   * which may work reasonably if it is a string or a data type that converts to a
   * distinct string. Note that objects and arrays will not behave reasonably.
   * Neither will cases where the other arguments are significant. In such cases,
   * specify your own hash function.
   *
   * The cache of results is exposed as the `memo` property of the function
   * returned by `memoize`.
   *
   * @name memoize
   * @static
   * @memberOf module:Utils
   * @method
   * @category Util
   * @param {AsyncFunction} fn - The async function to proxy and cache results from.
   * @param {Function} hasher - An optional function for generating a custom hash
   * for storing results. It has all the arguments applied to it apart from the
   * callback, and must be synchronous.
   * @returns {AsyncFunction} a memoized version of `fn`
   * @example
   *
   * var slow_fn = function(name, callback) {
   *     // do something
   *     callback(null, result);
   * };
   * var fn = async.memoize(slow_fn);
   *
   * // fn can now be used as if it were slow_fn
   * fn('some name', function() {
   *     // callback
   * });
   */ function $0c84690c59b4ccb2$export$fc10aeed3a532e2a(
    fn,
    hasher = (v) => v
  ) {
    var memo = Object.create(null);
    var queues = Object.create(null);
    var _fn = $0c84690c59b4ccb2$var$wrapAsync(fn);
    var memoized = $0c84690c59b4ccb2$var$initialParams((args, callback) => {
      var key = hasher(...args);
      if (key in memo)
        $0c84690c59b4ccb2$export$c233f08fbfea0913(() =>
          callback(null, ...memo[key])
        );
      else if (key in queues) queues[key].push(callback);
      else {
        queues[key] = [callback];
        _fn(...args, (err, ...resultArgs) => {
          // #1465 don't memoize if an error occurred
          if (!err) memo[key] = resultArgs;
          var q = queues[key];
          delete queues[key];
          for (var i = 0, l = q.length; i < l; i++) q[i](err, ...resultArgs);
        });
      }
    });
    memoized.memo = memo;
    memoized.unmemoized = fn;
    return memoized;
  }
  /* istanbul ignore file */ /**
   * Calls `callback` on a later loop around the event loop. In Node.js this just
   * calls `process.nextTick`.  In the browser it will use `setImmediate` if
   * available, otherwise `setTimeout(callback, 0)`, which means other higher
   * priority events may precede the execution of `callback`.
   *
   * This is used internally for browser-compatibility purposes.
   *
   * @name nextTick
   * @static
   * @memberOf module:Utils
   * @method
   * @see [async.setImmediate]{@link module:Utils.setImmediate}
   * @category Util
   * @param {Function} callback - The function to call on a later loop around
   * the event loop. Invoked with (args...).
   * @param {...*} args... - any number of additional arguments to pass to the
   * callback on the next tick.
   * @example
   *
   * var call_order = [];
   * async.nextTick(function() {
   *     call_order.push('two');
   *     // call_order now equals ['one','two']
   * });
   * call_order.push('one');
   *
   * async.setImmediate(function (a, b, c) {
   *     // a, b, and c equal 1, 2, and 3
   * }, 1, 2, 3);
   */ var $0c84690c59b4ccb2$var$_defer$1;
  if ($0c84690c59b4ccb2$var$hasNextTick)
    $0c84690c59b4ccb2$var$_defer$1 = $bFvJb$process.nextTick;
  else if ($0c84690c59b4ccb2$var$hasSetImmediate)
    $0c84690c59b4ccb2$var$_defer$1 = setImmediate;
  else $0c84690c59b4ccb2$var$_defer$1 = $0c84690c59b4ccb2$var$fallback;
  var $0c84690c59b4ccb2$export$bdd553fddd433dcb = $0c84690c59b4ccb2$var$wrap(
    $0c84690c59b4ccb2$var$_defer$1
  );
  var $0c84690c59b4ccb2$var$parallel = $0c84690c59b4ccb2$var$awaitify(
    (eachfn, tasks, callback) => {
      var results = $0c84690c59b4ccb2$var$isArrayLike(tasks) ? [] : {};
      eachfn(
        tasks,
        (task, key, taskCb) => {
          $0c84690c59b4ccb2$var$wrapAsync(task)((err, ...result) => {
            if (result.length < 2) [result] = result;
            results[key] = result;
            taskCb(err);
          });
        },
        (err) => callback(err, results)
      );
    },
    3
  );
  /**
   * Run the `tasks` collection of functions in parallel, without waiting until
   * the previous function has completed. If any of the functions pass an error to
   * its callback, the main `callback` is immediately called with the value of the
   * error. Once the `tasks` have completed, the results are passed to the final
   * `callback` as an array.
   *
   * **Note:** `parallel` is about kicking-off I/O tasks in parallel, not about
   * parallel execution of code.  If your tasks do not use any timers or perform
   * any I/O, they will actually be executed in series.  Any synchronous setup
   * sections for each task will happen one after the other.  JavaScript remains
   * single-threaded.
   *
   * **Hint:** Use [`reflect`]{@link module:Utils.reflect} to continue the
   * execution of other tasks when a task fails.
   *
   * It is also possible to use an object instead of an array. Each property will
   * be run as a function and the results will be passed to the final `callback`
   * as an object instead of an array. This can be a more readable way of handling
   * results from {@link async.parallel}.
   *
   * @name parallel
   * @static
   * @memberOf module:ControlFlow
   * @method
   * @category Control Flow
   * @param {Array|Iterable|AsyncIterable|Object} tasks - A collection of
   * [async functions]{@link AsyncFunction} to run.
   * Each async function can complete with any number of optional `result` values.
   * @param {Function} [callback] - An optional callback to run once all the
   * functions have completed successfully. This function gets a results array
   * (or object) containing all the result arguments passed to the task callbacks.
   * Invoked with (err, results).
   * @returns {Promise} a promise, if a callback is not passed
   *
   * @example
   *
   * //Using Callbacks
   * async.parallel([
   *     function(callback) {
   *         setTimeout(function() {
   *             callback(null, 'one');
   *         }, 200);
   *     },
   *     function(callback) {
   *         setTimeout(function() {
   *             callback(null, 'two');
   *         }, 100);
   *     }
   * ], function(err, results) {
   *     console.log(results);
   *     // results is equal to ['one','two'] even though
   *     // the second function had a shorter timeout.
   * });
   *
   * // an example using an object instead of an array
   * async.parallel({
   *     one: function(callback) {
   *         setTimeout(function() {
   *             callback(null, 1);
   *         }, 200);
   *     },
   *     two: function(callback) {
   *         setTimeout(function() {
   *             callback(null, 2);
   *         }, 100);
   *     }
   * }, function(err, results) {
   *     console.log(results);
   *     // results is equal to: { one: 1, two: 2 }
   * });
   *
   * //Using Promises
   * async.parallel([
   *     function(callback) {
   *         setTimeout(function() {
   *             callback(null, 'one');
   *         }, 200);
   *     },
   *     function(callback) {
   *         setTimeout(function() {
   *             callback(null, 'two');
   *         }, 100);
   *     }
   * ]).then(results => {
   *     console.log(results);
   *     // results is equal to ['one','two'] even though
   *     // the second function had a shorter timeout.
   * }).catch(err => {
   *     console.log(err);
   * });
   *
   * // an example using an object instead of an array
   * async.parallel({
   *     one: function(callback) {
   *         setTimeout(function() {
   *             callback(null, 1);
   *         }, 200);
   *     },
   *     two: function(callback) {
   *         setTimeout(function() {
   *             callback(null, 2);
   *         }, 100);
   *     }
   * }).then(results => {
   *     console.log(results);
   *     // results is equal to: { one: 1, two: 2 }
   * }).catch(err => {
   *     console.log(err);
   * });
   *
   * //Using async/await
   * async () => {
   *     try {
   *         let results = await async.parallel([
   *             function(callback) {
   *                 setTimeout(function() {
   *                     callback(null, 'one');
   *                 }, 200);
   *             },
   *             function(callback) {
   *                 setTimeout(function() {
   *                     callback(null, 'two');
   *                 }, 100);
   *             }
   *         ]);
   *         console.log(results);
   *         // results is equal to ['one','two'] even though
   *         // the second function had a shorter timeout.
   *     }
   *     catch (err) {
   *         console.log(err);
   *     }
   * }
   *
   * // an example using an object instead of an array
   * async () => {
   *     try {
   *         let results = await async.parallel({
   *             one: function(callback) {
   *                 setTimeout(function() {
   *                     callback(null, 1);
   *                 }, 200);
   *             },
   *            two: function(callback) {
   *                 setTimeout(function() {
   *                     callback(null, 2);
   *                 }, 100);
   *            }
   *         });
   *         console.log(results);
   *         // results is equal to: { one: 1, two: 2 }
   *     }
   *     catch (err) {
   *         console.log(err);
   *     }
   * }
   *
   */ function $0c84690c59b4ccb2$export$451942af9381149c(tasks, callback) {
    return $0c84690c59b4ccb2$var$parallel(
      $0c84690c59b4ccb2$export$d10d68e43a57bce9,
      tasks,
      callback
    );
  }
  /**
   * The same as [`parallel`]{@link module:ControlFlow.parallel} but runs a maximum of `limit` async operations at a
   * time.
   *
   * @name parallelLimit
   * @static
   * @memberOf module:ControlFlow
   * @method
   * @see [async.parallel]{@link module:ControlFlow.parallel}
   * @category Control Flow
   * @param {Array|Iterable|AsyncIterable|Object} tasks - A collection of
   * [async functions]{@link AsyncFunction} to run.
   * Each async function can complete with any number of optional `result` values.
   * @param {number} limit - The maximum number of async operations at a time.
   * @param {Function} [callback] - An optional callback to run once all the
   * functions have completed successfully. This function gets a results array
   * (or object) containing all the result arguments passed to the task callbacks.
   * Invoked with (err, results).
   * @returns {Promise} a promise, if a callback is not passed
   */ function $0c84690c59b4ccb2$export$362c0a688af131a0(
    tasks,
    limit,
    callback
  ) {
    return $0c84690c59b4ccb2$var$parallel(
      $0c84690c59b4ccb2$var$eachOfLimit(limit),
      tasks,
      callback
    );
  }
  /**
   * A queue of tasks for the worker function to complete.
   * @typedef {Iterable} QueueObject
   * @memberOf module:ControlFlow
   * @property {Function} length - a function returning the number of items
   * waiting to be processed. Invoke with `queue.length()`.
   * @property {boolean} started - a boolean indicating whether or not any
   * items have been pushed and processed by the queue.
   * @property {Function} running - a function returning the number of items
   * currently being processed. Invoke with `queue.running()`.
   * @property {Function} workersList - a function returning the array of items
   * currently being processed. Invoke with `queue.workersList()`.
   * @property {Function} idle - a function returning false if there are items
   * waiting or being processed, or true if not. Invoke with `queue.idle()`.
   * @property {number} concurrency - an integer for determining how many `worker`
   * functions should be run in parallel. This property can be changed after a
   * `queue` is created to alter the concurrency on-the-fly.
   * @property {number} payload - an integer that specifies how many items are
   * passed to the worker function at a time. only applies if this is a
   * [cargo]{@link module:ControlFlow.cargo} object
   * @property {AsyncFunction} push - add a new task to the `queue`. Calls `callback`
   * once the `worker` has finished processing the task. Instead of a single task,
   * a `tasks` array can be submitted. The respective callback is used for every
   * task in the list. Invoke with `queue.push(task, [callback])`,
   * @property {AsyncFunction} unshift - add a new task to the front of the `queue`.
   * Invoke with `queue.unshift(task, [callback])`.
   * @property {AsyncFunction} pushAsync - the same as `q.push`, except this returns
   * a promise that rejects if an error occurs.
   * @property {AsyncFunction} unshiftAsync - the same as `q.unshift`, except this returns
   * a promise that rejects if an error occurs.
   * @property {Function} remove - remove items from the queue that match a test
   * function.  The test function will be passed an object with a `data` property,
   * and a `priority` property, if this is a
   * [priorityQueue]{@link module:ControlFlow.priorityQueue} object.
   * Invoked with `queue.remove(testFn)`, where `testFn` is of the form
   * `function ({data, priority}) {}` and returns a Boolean.
   * @property {Function} saturated - a function that sets a callback that is
   * called when the number of running workers hits the `concurrency` limit, and
   * further tasks will be queued.  If the callback is omitted, `q.saturated()`
   * returns a promise for the next occurrence.
   * @property {Function} unsaturated - a function that sets a callback that is
   * called when the number of running workers is less than the `concurrency` &
   * `buffer` limits, and further tasks will not be queued. If the callback is
   * omitted, `q.unsaturated()` returns a promise for the next occurrence.
   * @property {number} buffer - A minimum threshold buffer in order to say that
   * the `queue` is `unsaturated`.
   * @property {Function} empty - a function that sets a callback that is called
   * when the last item from the `queue` is given to a `worker`. If the callback
   * is omitted, `q.empty()` returns a promise for the next occurrence.
   * @property {Function} drain - a function that sets a callback that is called
   * when the last item from the `queue` has returned from the `worker`. If the
   * callback is omitted, `q.drain()` returns a promise for the next occurrence.
   * @property {Function} error - a function that sets a callback that is called
   * when a task errors. Has the signature `function(error, task)`. If the
   * callback is omitted, `error()` returns a promise that rejects on the next
   * error.
   * @property {boolean} paused - a boolean for determining whether the queue is
   * in a paused state.
   * @property {Function} pause - a function that pauses the processing of tasks
   * until `resume()` is called. Invoke with `queue.pause()`.
   * @property {Function} resume - a function that resumes the processing of
   * queued tasks when the queue is paused. Invoke with `queue.resume()`.
   * @property {Function} kill - a function that removes the `drain` callback and
   * empties remaining tasks from the queue forcing it to go idle. No more tasks
   * should be pushed to the queue after calling this function. Invoke with `queue.kill()`.
   *
   * @example
   * const q = async.queue(worker, 2)
   * q.push(item1)
   * q.push(item2)
   * q.push(item3)
   * // queues are iterable, spread into an array to inspect
   * const items = [...q] // [item1, item2, item3]
   * // or use for of
   * for (let item of q) {
   *     console.log(item)
   * }
   *
   * q.drain(() => {
   *     console.log('all done')
   * })
   * // or
   * await q.drain()
   */ /**
   * Creates a `queue` object with the specified `concurrency`. Tasks added to the
   * `queue` are processed in parallel (up to the `concurrency` limit). If all
   * `worker`s are in progress, the task is queued until one becomes available.
   * Once a `worker` completes a `task`, that `task`'s callback is called.
   *
   * @name queue
   * @static
   * @memberOf module:ControlFlow
   * @method
   * @category Control Flow
   * @param {AsyncFunction} worker - An async function for processing a queued task.
   * If you want to handle errors from an individual task, pass a callback to
   * `q.push()`. Invoked with (task, callback).
   * @param {number} [concurrency=1] - An `integer` for determining how many
   * `worker` functions should be run in parallel.  If omitted, the concurrency
   * defaults to `1`.  If the concurrency is `0`, an error is thrown.
   * @returns {module:ControlFlow.QueueObject} A queue object to manage the tasks. Callbacks can be
   * attached as certain properties to listen for specific events during the
   * lifecycle of the queue.
   * @example
   *
   * // create a queue object with concurrency 2
   * var q = async.queue(function(task, callback) {
   *     console.log('hello ' + task.name);
   *     callback();
   * }, 2);
   *
   * // assign a callback
   * q.drain(function() {
   *     console.log('all items have been processed');
   * });
   * // or await the end
   * await q.drain()
   *
   * // assign an error callback
   * q.error(function(err, task) {
   *     console.error('task experienced an error');
   * });
   *
   * // add some items to the queue
   * q.push({name: 'foo'}, function(err) {
   *     console.log('finished processing foo');
   * });
   * // callback is optional
   * q.push({name: 'bar'});
   *
   * // add some items to the queue (batch-wise)
   * q.push([{name: 'baz'},{name: 'bay'},{name: 'bax'}], function(err) {
   *     console.log('finished processing item');
   * });
   *
   * // add some items to the front of the queue
   * q.unshift({name: 'bar'}, function (err) {
   *     console.log('finished processing bar');
   * });
   */ function $0c84690c59b4ccb2$export$4f7fa46ff53e516f(worker, concurrency) {
    var _worker = $0c84690c59b4ccb2$var$wrapAsync(worker);
    return $0c84690c59b4ccb2$var$queue(
      (items, cb) => {
        _worker(items[0], cb);
      },
      concurrency,
      1
    );
  }
  // Binary min-heap implementation used for priority queue.
  // Implementation is stable, i.e. push time is considered for equal priorities
  class $0c84690c59b4ccb2$var$Heap {
    constructor() {
      this.heap = [];
      this.pushCount = Number.MIN_SAFE_INTEGER;
    }
    get length() {
      return this.heap.length;
    }
    empty() {
      this.heap = [];
      return this;
    }
    percUp(index) {
      let p;
      while (
        index > 0 &&
        $0c84690c59b4ccb2$var$smaller(
          this.heap[index],
          this.heap[(p = $0c84690c59b4ccb2$var$parent(index))]
        )
      ) {
        let t = this.heap[index];
        this.heap[index] = this.heap[p];
        this.heap[p] = t;
        index = p;
      }
    }
    percDown(index) {
      let l;
      while ((l = $0c84690c59b4ccb2$var$leftChi(index)) < this.heap.length) {
        if (
          l + 1 < this.heap.length &&
          $0c84690c59b4ccb2$var$smaller(this.heap[l + 1], this.heap[l])
        )
          l = l + 1;
        if ($0c84690c59b4ccb2$var$smaller(this.heap[index], this.heap[l]))
          break;
        let t = this.heap[index];
        this.heap[index] = this.heap[l];
        this.heap[l] = t;
        index = l;
      }
    }
    push(node) {
      node.pushCount = ++this.pushCount;
      this.heap.push(node);
      this.percUp(this.heap.length - 1);
    }
    unshift(node) {
      return this.heap.push(node);
    }
    shift() {
      let [top] = this.heap;
      this.heap[0] = this.heap[this.heap.length - 1];
      this.heap.pop();
      this.percDown(0);
      return top;
    }
    toArray() {
      return [...this];
    }
    *[Symbol.iterator]() {
      for (let i = 0; i < this.heap.length; i++) yield this.heap[i].data;
    }
    remove(testFn) {
      let j = 0;
      for (let i = 0; i < this.heap.length; i++)
        if (!testFn(this.heap[i])) {
          this.heap[j] = this.heap[i];
          j++;
        }
      this.heap.splice(j);
      for (
        let i = $0c84690c59b4ccb2$var$parent(this.heap.length - 1);
        i >= 0;
        i--
      )
        this.percDown(i);
      return this;
    }
  }
  function $0c84690c59b4ccb2$var$leftChi(i) {
    return (i << 1) + 1;
  }
  function $0c84690c59b4ccb2$var$parent(i) {
    return ((i + 1) >> 1) - 1;
  }
  function $0c84690c59b4ccb2$var$smaller(x, y) {
    if (x.priority !== y.priority) return x.priority < y.priority;
    else return x.pushCount < y.pushCount;
  }
  /**
   * The same as [async.queue]{@link module:ControlFlow.queue} only tasks are assigned a priority and
   * completed in ascending priority order.
   *
   * @name priorityQueue
   * @static
   * @memberOf module:ControlFlow
   * @method
   * @see [async.queue]{@link module:ControlFlow.queue}
   * @category Control Flow
   * @param {AsyncFunction} worker - An async function for processing a queued task.
   * If you want to handle errors from an individual task, pass a callback to
   * `q.push()`.
   * Invoked with (task, callback).
   * @param {number} concurrency - An `integer` for determining how many `worker`
   * functions should be run in parallel.  If omitted, the concurrency defaults to
   * `1`.  If the concurrency is `0`, an error is thrown.
   * @returns {module:ControlFlow.QueueObject} A priorityQueue object to manage the tasks. There are three
   * differences between `queue` and `priorityQueue` objects:
   * * `push(task, priority, [callback])` - `priority` should be a number. If an
   *   array of `tasks` is given, all tasks will be assigned the same priority.
   * * `pushAsync(task, priority, [callback])` - the same as `priorityQueue.push`,
   *   except this returns a promise that rejects if an error occurs.
   * * The `unshift` and `unshiftAsync` methods were removed.
   */ function $0c84690c59b4ccb2$export$25579debde666a98(worker, concurrency) {
    // Start with a normal queue
    var q = $0c84690c59b4ccb2$export$4f7fa46ff53e516f(worker, concurrency);
    var { push: push, pushAsync: pushAsync } = q;
    q._tasks = new $0c84690c59b4ccb2$var$Heap();
    q._createTaskItem = ({ data: data, priority: priority }, callback) => {
      return {
        data: data,
        priority: priority,
        callback: callback,
      };
    };
    function createDataItems(tasks, priority) {
      if (!Array.isArray(tasks))
        return {
          data: tasks,
          priority: priority,
        };
      return tasks.map((data) => {
        return {
          data: data,
          priority: priority,
        };
      });
    }
    // Override push to accept second parameter representing priority
    q.push = function (data, priority = 0, callback) {
      return push(createDataItems(data, priority), callback);
    };
    q.pushAsync = function (data, priority = 0, callback) {
      return pushAsync(createDataItems(data, priority), callback);
    };
    // Remove unshift functions
    delete q.unshift;
    delete q.unshiftAsync;
    return q;
  }
  /**
   * Runs the `tasks` array of functions in parallel, without waiting until the
   * previous function has completed. Once any of the `tasks` complete or pass an
   * error to its callback, the main `callback` is immediately called. It's
   * equivalent to `Promise.race()`.
   *
   * @name race
   * @static
   * @memberOf module:ControlFlow
   * @method
   * @category Control Flow
   * @param {Array} tasks - An array containing [async functions]{@link AsyncFunction}
   * to run. Each function can complete with an optional `result` value.
   * @param {Function} callback - A callback to run once any of the functions have
   * completed. This function gets an error or result from the first function that
   * completed. Invoked with (err, result).
   * @returns {Promise} a promise, if a callback is omitted
   * @example
   *
   * async.race([
   *     function(callback) {
   *         setTimeout(function() {
   *             callback(null, 'one');
   *         }, 200);
   *     },
   *     function(callback) {
   *         setTimeout(function() {
   *             callback(null, 'two');
   *         }, 100);
   *     }
   * ],
   * // main callback
   * function(err, result) {
   *     // the result will be equal to 'two' as it finishes earlier
   * });
   */ function $0c84690c59b4ccb2$var$race(tasks, callback) {
    callback = $0c84690c59b4ccb2$var$once(callback);
    if (!Array.isArray(tasks))
      return callback(
        new TypeError("First argument to race must be an array of functions")
      );
    if (!tasks.length) return callback();
    for (var i = 0, l = tasks.length; i < l; i++)
      $0c84690c59b4ccb2$var$wrapAsync(tasks[i])(callback);
  }
  var $0c84690c59b4ccb2$export$236c05de452bec2 = $0c84690c59b4ccb2$var$awaitify(
    $0c84690c59b4ccb2$var$race,
    2
  );
  /**
   * Same as [`reduce`]{@link module:Collections.reduce}, only operates on `array` in reverse order.
   *
   * @name reduceRight
   * @static
   * @memberOf module:Collections
   * @method
   * @see [async.reduce]{@link module:Collections.reduce}
   * @alias foldr
   * @category Collection
   * @param {Array} array - A collection to iterate over.
   * @param {*} memo - The initial state of the reduction.
   * @param {AsyncFunction} iteratee - A function applied to each item in the
   * array to produce the next step in the reduction.
   * The `iteratee` should complete with the next state of the reduction.
   * If the iteratee completes with an error, the reduction is stopped and the
   * main `callback` is immediately called with the error.
   * Invoked with (memo, item, callback).
   * @param {Function} [callback] - A callback which is called after all the
   * `iteratee` functions have finished. Result is the reduced value. Invoked with
   * (err, result).
   * @returns {Promise} a promise, if no callback is passed
   */ function $0c84690c59b4ccb2$export$7fef8bcdbb34f435(
    array,
    memo,
    iteratee,
    callback
  ) {
    var reversed = [...array].reverse();
    return $0c84690c59b4ccb2$export$533b26079ad0b4b(
      reversed,
      memo,
      iteratee,
      callback
    );
  }
  /**
   * Wraps the async function in another function that always completes with a
   * result object, even when it errors.
   *
   * The result object has either the property `error` or `value`.
   *
   * @name reflect
   * @static
   * @memberOf module:Utils
   * @method
   * @category Util
   * @param {AsyncFunction} fn - The async function you want to wrap
   * @returns {Function} - A function that always passes null to it's callback as
   * the error. The second argument to the callback will be an `object` with
   * either an `error` or a `value` property.
   * @example
   *
   * async.parallel([
   *     async.reflect(function(callback) {
   *         // do some stuff ...
   *         callback(null, 'one');
   *     }),
   *     async.reflect(function(callback) {
   *         // do some more stuff but error ...
   *         callback('bad stuff happened');
   *     }),
   *     async.reflect(function(callback) {
   *         // do some more stuff ...
   *         callback(null, 'two');
   *     })
   * ],
   * // optional callback
   * function(err, results) {
   *     // values
   *     // results[0].value = 'one'
   *     // results[1].error = 'bad stuff happened'
   *     // results[2].value = 'two'
   * });
   */ function $0c84690c59b4ccb2$export$9debe8cffacea23(fn) {
    var _fn = $0c84690c59b4ccb2$var$wrapAsync(fn);
    return $0c84690c59b4ccb2$var$initialParams(function reflectOn(
      args,
      reflectCallback
    ) {
      args.push((error, ...cbArgs) => {
        let retVal = {};
        if (error) retVal.error = error;
        if (cbArgs.length > 0) {
          var value = cbArgs;
          if (cbArgs.length <= 1) [value] = cbArgs;
          retVal.value = value;
        }
        reflectCallback(null, retVal);
      });
      return _fn.apply(this, args);
    });
  }
  /**
   * A helper function that wraps an array or an object of functions with `reflect`.
   *
   * @name reflectAll
   * @static
   * @memberOf module:Utils
   * @method
   * @see [async.reflect]{@link module:Utils.reflect}
   * @category Util
   * @param {Array|Object|Iterable} tasks - The collection of
   * [async functions]{@link AsyncFunction} to wrap in `async.reflect`.
   * @returns {Array} Returns an array of async functions, each wrapped in
   * `async.reflect`
   * @example
   *
   * let tasks = [
   *     function(callback) {
   *         setTimeout(function() {
   *             callback(null, 'one');
   *         }, 200);
   *     },
   *     function(callback) {
   *         // do some more stuff but error ...
   *         callback(new Error('bad stuff happened'));
   *     },
   *     function(callback) {
   *         setTimeout(function() {
   *             callback(null, 'two');
   *         }, 100);
   *     }
   * ];
   *
   * async.parallel(async.reflectAll(tasks),
   * // optional callback
   * function(err, results) {
   *     // values
   *     // results[0].value = 'one'
   *     // results[1].error = Error('bad stuff happened')
   *     // results[2].value = 'two'
   * });
   *
   * // an example using an object instead of an array
   * let tasks = {
   *     one: function(callback) {
   *         setTimeout(function() {
   *             callback(null, 'one');
   *         }, 200);
   *     },
   *     two: function(callback) {
   *         callback('two');
   *     },
   *     three: function(callback) {
   *         setTimeout(function() {
   *             callback(null, 'three');
   *         }, 100);
   *     }
   * };
   *
   * async.parallel(async.reflectAll(tasks),
   * // optional callback
   * function(err, results) {
   *     // values
   *     // results.one.value = 'one'
   *     // results.two.error = 'two'
   *     // results.three.value = 'three'
   * });
   */ function $0c84690c59b4ccb2$export$1a54554d0a489acc(tasks) {
    var results;
    if (Array.isArray(tasks))
      results = tasks.map($0c84690c59b4ccb2$export$9debe8cffacea23);
    else {
      results = {};
      Object.keys(tasks).forEach((key) => {
        results[key] = $0c84690c59b4ccb2$export$9debe8cffacea23.call(
          this,
          tasks[key]
        );
      });
    }
    return results;
  }
  function $0c84690c59b4ccb2$var$reject(eachfn, arr, _iteratee, callback) {
    const iteratee = $0c84690c59b4ccb2$var$wrapAsync(_iteratee);
    return $0c84690c59b4ccb2$var$_filter(
      eachfn,
      arr,
      (value, cb) => {
        iteratee(value, (err, v) => {
          cb(err, !v);
        });
      },
      callback
    );
  }
  /**
   * The opposite of [`filter`]{@link module:Collections.filter}. Removes values that pass an `async` truth test.
   *
   * @name reject
   * @static
   * @memberOf module:Collections
   * @method
   * @see [async.filter]{@link module:Collections.filter}
   * @category Collection
   * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
   * @param {Function} iteratee - An async truth test to apply to each item in
   * `coll`.
   * The should complete with a boolean value as its `result`.
   * Invoked with (item, callback).
   * @param {Function} [callback] - A callback which is called after all the
   * `iteratee` functions have finished. Invoked with (err, results).
   * @returns {Promise} a promise, if no callback is passed
   * @example
   *
   * // dir1 is a directory that contains file1.txt, file2.txt
   * // dir2 is a directory that contains file3.txt, file4.txt
   * // dir3 is a directory that contains file5.txt
   *
   * const fileList = ['dir1/file1.txt','dir2/file3.txt','dir3/file6.txt'];
   *
   * // asynchronous function that checks if a file exists
   * function fileExists(file, callback) {
   *    fs.access(file, fs.constants.F_OK, (err) => {
   *        callback(null, !err);
   *    });
   * }
   *
   * // Using callbacks
   * async.reject(fileList, fileExists, function(err, results) {
   *    // [ 'dir3/file6.txt' ]
   *    // results now equals an array of the non-existing files
   * });
   *
   * // Using Promises
   * async.reject(fileList, fileExists)
   * .then( results => {
   *     console.log(results);
   *     // [ 'dir3/file6.txt' ]
   *     // results now equals an array of the non-existing files
   * }).catch( err => {
   *     console.log(err);
   * });
   *
   * // Using async/await
   * async () => {
   *     try {
   *         let results = await async.reject(fileList, fileExists);
   *         console.log(results);
   *         // [ 'dir3/file6.txt' ]
   *         // results now equals an array of the non-existing files
   *     }
   *     catch (err) {
   *         console.log(err);
   *     }
   * }
   *
   */ function $0c84690c59b4ccb2$var$reject$1(coll, iteratee, callback) {
    return $0c84690c59b4ccb2$var$reject(
      $0c84690c59b4ccb2$export$d10d68e43a57bce9,
      coll,
      iteratee,
      callback
    );
  }
  var $0c84690c59b4ccb2$export$2800f3ceda99eb84 =
    $0c84690c59b4ccb2$var$awaitify($0c84690c59b4ccb2$var$reject$1, 3);
  /**
   * The same as [`reject`]{@link module:Collections.reject} but runs a maximum of `limit` async operations at a
   * time.
   *
   * @name rejectLimit
   * @static
   * @memberOf module:Collections
   * @method
   * @see [async.reject]{@link module:Collections.reject}
   * @category Collection
   * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
   * @param {number} limit - The maximum number of async operations at a time.
   * @param {Function} iteratee - An async truth test to apply to each item in
   * `coll`.
   * The should complete with a boolean value as its `result`.
   * Invoked with (item, callback).
   * @param {Function} [callback] - A callback which is called after all the
   * `iteratee` functions have finished. Invoked with (err, results).
   * @returns {Promise} a promise, if no callback is passed
   */ function $0c84690c59b4ccb2$var$rejectLimit(
    coll,
    limit,
    iteratee,
    callback
  ) {
    return $0c84690c59b4ccb2$var$reject(
      $0c84690c59b4ccb2$var$eachOfLimit(limit),
      coll,
      iteratee,
      callback
    );
  }
  var $0c84690c59b4ccb2$export$b59d647fa1894da8 =
    $0c84690c59b4ccb2$var$awaitify($0c84690c59b4ccb2$var$rejectLimit, 4);
  /**
   * The same as [`reject`]{@link module:Collections.reject} but runs only a single async operation at a time.
   *
   * @name rejectSeries
   * @static
   * @memberOf module:Collections
   * @method
   * @see [async.reject]{@link module:Collections.reject}
   * @category Collection
   * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
   * @param {Function} iteratee - An async truth test to apply to each item in
   * `coll`.
   * The should complete with a boolean value as its `result`.
   * Invoked with (item, callback).
   * @param {Function} [callback] - A callback which is called after all the
   * `iteratee` functions have finished. Invoked with (err, results).
   * @returns {Promise} a promise, if no callback is passed
   */ function $0c84690c59b4ccb2$var$rejectSeries(coll, iteratee, callback) {
    return $0c84690c59b4ccb2$var$reject(
      $0c84690c59b4ccb2$export$750e7e5fea3b0654,
      coll,
      iteratee,
      callback
    );
  }
  var $0c84690c59b4ccb2$export$d68373657532124d =
    $0c84690c59b4ccb2$var$awaitify($0c84690c59b4ccb2$var$rejectSeries, 3);
  function $0c84690c59b4ccb2$var$constant$1(value) {
    return function () {
      return value;
    };
  }
  /**
   * Attempts to get a successful response from `task` no more than `times` times
   * before returning an error. If the task is successful, the `callback` will be
   * passed the result of the successful task. If all attempts fail, the callback
   * will be passed the error and result (if any) of the final attempt.
   *
   * @name retry
   * @static
   * @memberOf module:ControlFlow
   * @method
   * @category Control Flow
   * @see [async.retryable]{@link module:ControlFlow.retryable}
   * @param {Object|number} [opts = {times: 5, interval: 0}| 5] - Can be either an
   * object with `times` and `interval` or a number.
   * * `times` - The number of attempts to make before giving up.  The default
   *   is `5`.
   * * `interval` - The time to wait between retries, in milliseconds.  The
   *   default is `0`. The interval may also be specified as a function of the
   *   retry count (see example).
   * * `errorFilter` - An optional synchronous function that is invoked on
   *   erroneous result. If it returns `true` the retry attempts will continue;
   *   if the function returns `false` the retry flow is aborted with the current
   *   attempt's error and result being returned to the final callback.
   *   Invoked with (err).
   * * If `opts` is a number, the number specifies the number of times to retry,
   *   with the default interval of `0`.
   * @param {AsyncFunction} task - An async function to retry.
   * Invoked with (callback).
   * @param {Function} [callback] - An optional callback which is called when the
   * task has succeeded, or after the final failed attempt. It receives the `err`
   * and `result` arguments of the last attempt at completing the `task`. Invoked
   * with (err, results).
   * @returns {Promise} a promise if no callback provided
   *
   * @example
   *
   * // The `retry` function can be used as a stand-alone control flow by passing
   * // a callback, as shown below:
   *
   * // try calling apiMethod 3 times
   * async.retry(3, apiMethod, function(err, result) {
   *     // do something with the result
   * });
   *
   * // try calling apiMethod 3 times, waiting 200 ms between each retry
   * async.retry({times: 3, interval: 200}, apiMethod, function(err, result) {
   *     // do something with the result
   * });
   *
   * // try calling apiMethod 10 times with exponential backoff
   * // (i.e. intervals of 100, 200, 400, 800, 1600, ... milliseconds)
   * async.retry({
   *   times: 10,
   *   interval: function(retryCount) {
   *     return 50 * Math.pow(2, retryCount);
   *   }
   * }, apiMethod, function(err, result) {
   *     // do something with the result
   * });
   *
   * // try calling apiMethod the default 5 times no delay between each retry
   * async.retry(apiMethod, function(err, result) {
   *     // do something with the result
   * });
   *
   * // try calling apiMethod only when error condition satisfies, all other
   * // errors will abort the retry control flow and return to final callback
   * async.retry({
   *   errorFilter: function(err) {
   *     return err.message === 'Temporary error'; // only retry on a specific error
   *   }
   * }, apiMethod, function(err, result) {
   *     // do something with the result
   * });
   *
   * // to retry individual methods that are not as reliable within other
   * // control flow functions, use the `retryable` wrapper:
   * async.auto({
   *     users: api.getUsers.bind(api),
   *     payments: async.retryable(3, api.getPayments.bind(api))
   * }, function(err, results) {
   *     // do something with the results
   * });
   *
   */ const $0c84690c59b4ccb2$var$DEFAULT_TIMES = 5;
  const $0c84690c59b4ccb2$var$DEFAULT_INTERVAL = 0;
  function $0c84690c59b4ccb2$export$9369b12211e1fce4(opts, task, callback) {
    var options = {
      times: $0c84690c59b4ccb2$var$DEFAULT_TIMES,
      intervalFunc: $0c84690c59b4ccb2$var$constant$1(
        $0c84690c59b4ccb2$var$DEFAULT_INTERVAL
      ),
    };
    if (arguments.length < 3 && typeof opts === "function") {
      callback = task || $0c84690c59b4ccb2$var$promiseCallback();
      task = opts;
    } else {
      $0c84690c59b4ccb2$var$parseTimes(options, opts);
      callback = callback || $0c84690c59b4ccb2$var$promiseCallback();
    }
    if (typeof task !== "function")
      throw new Error("Invalid arguments for async.retry");
    var _task = $0c84690c59b4ccb2$var$wrapAsync(task);
    var attempt = 1;
    function retryAttempt() {
      _task((err, ...args) => {
        if (err === false) return;
        if (
          err &&
          attempt++ < options.times &&
          (typeof options.errorFilter != "function" || options.errorFilter(err))
        )
          setTimeout(retryAttempt, options.intervalFunc(attempt - 1));
        else callback(err, ...args);
      });
    }
    retryAttempt();
    return callback[$0c84690c59b4ccb2$var$PROMISE_SYMBOL];
  }
  function $0c84690c59b4ccb2$var$parseTimes(acc, t) {
    if (typeof t === "object") {
      acc.times = +t.times || $0c84690c59b4ccb2$var$DEFAULT_TIMES;
      acc.intervalFunc =
        typeof t.interval === "function"
          ? t.interval
          : $0c84690c59b4ccb2$var$constant$1(
              +t.interval || $0c84690c59b4ccb2$var$DEFAULT_INTERVAL
            );
      acc.errorFilter = t.errorFilter;
    } else if (typeof t === "number" || typeof t === "string")
      acc.times = +t || $0c84690c59b4ccb2$var$DEFAULT_TIMES;
    else throw new Error("Invalid arguments for async.retry");
  }
  /**
   * A close relative of [`retry`]{@link module:ControlFlow.retry}.  This method
   * wraps a task and makes it retryable, rather than immediately calling it
   * with retries.
   *
   * @name retryable
   * @static
   * @memberOf module:ControlFlow
   * @method
   * @see [async.retry]{@link module:ControlFlow.retry}
   * @category Control Flow
   * @param {Object|number} [opts = {times: 5, interval: 0}| 5] - optional
   * options, exactly the same as from `retry`, except for a `opts.arity` that
   * is the arity of the `task` function, defaulting to `task.length`
   * @param {AsyncFunction} task - the asynchronous function to wrap.
   * This function will be passed any arguments passed to the returned wrapper.
   * Invoked with (...args, callback).
   * @returns {AsyncFunction} The wrapped function, which when invoked, will
   * retry on an error, based on the parameters specified in `opts`.
   * This function will accept the same parameters as `task`.
   * @example
   *
   * async.auto({
   *     dep1: async.retryable(3, getFromFlakyService),
   *     process: ["dep1", async.retryable(3, function (results, cb) {
   *         maybeProcessData(results.dep1, cb);
   *     })]
   * }, callback);
   */ function $0c84690c59b4ccb2$export$9e1b8e833f44ff21(opts, task) {
    if (!task) {
      task = opts;
      opts = null;
    }
    let arity = (opts && opts.arity) || task.length;
    if ($0c84690c59b4ccb2$var$isAsync(task)) arity += 1;
    var _task = $0c84690c59b4ccb2$var$wrapAsync(task);
    return $0c84690c59b4ccb2$var$initialParams((args, callback) => {
      if (args.length < arity - 1 || callback == null) {
        args.push(callback);
        callback = $0c84690c59b4ccb2$var$promiseCallback();
      }
      function taskFn(cb) {
        _task(...args, cb);
      }
      if (opts)
        $0c84690c59b4ccb2$export$9369b12211e1fce4(opts, taskFn, callback);
      else $0c84690c59b4ccb2$export$9369b12211e1fce4(taskFn, callback);
      return callback[$0c84690c59b4ccb2$var$PROMISE_SYMBOL];
    });
  }
  /**
   * Run the functions in the `tasks` collection in series, each one running once
   * the previous function has completed. If any functions in the series pass an
   * error to its callback, no more functions are run, and `callback` is
   * immediately called with the value of the error. Otherwise, `callback`
   * receives an array of results when `tasks` have completed.
   *
   * It is also possible to use an object instead of an array. Each property will
   * be run as a function, and the results will be passed to the final `callback`
   * as an object instead of an array. This can be a more readable way of handling
   *  results from {@link async.series}.
   *
   * **Note** that while many implementations preserve the order of object
   * properties, the [ECMAScript Language Specification](http://www.ecma-international.org/ecma-262/5.1/#sec-8.6)
   * explicitly states that
   *
   * > The mechanics and order of enumerating the properties is not specified.
   *
   * So if you rely on the order in which your series of functions are executed,
   * and want this to work on all platforms, consider using an array.
   *
   * @name series
   * @static
   * @memberOf module:ControlFlow
   * @method
   * @category Control Flow
   * @param {Array|Iterable|AsyncIterable|Object} tasks - A collection containing
   * [async functions]{@link AsyncFunction} to run in series.
   * Each function can complete with any number of optional `result` values.
   * @param {Function} [callback] - An optional callback to run once all the
   * functions have completed. This function gets a results array (or object)
   * containing all the result arguments passed to the `task` callbacks. Invoked
   * with (err, result).
   * @return {Promise} a promise, if no callback is passed
   * @example
   *
   * //Using Callbacks
   * async.series([
   *     function(callback) {
   *         setTimeout(function() {
   *             // do some async task
   *             callback(null, 'one');
   *         }, 200);
   *     },
   *     function(callback) {
   *         setTimeout(function() {
   *             // then do another async task
   *             callback(null, 'two');
   *         }, 100);
   *     }
   * ], function(err, results) {
   *     console.log(results);
   *     // results is equal to ['one','two']
   * });
   *
   * // an example using objects instead of arrays
   * async.series({
   *     one: function(callback) {
   *         setTimeout(function() {
   *             // do some async task
   *             callback(null, 1);
   *         }, 200);
   *     },
   *     two: function(callback) {
   *         setTimeout(function() {
   *             // then do another async task
   *             callback(null, 2);
   *         }, 100);
   *     }
   * }, function(err, results) {
   *     console.log(results);
   *     // results is equal to: { one: 1, two: 2 }
   * });
   *
   * //Using Promises
   * async.series([
   *     function(callback) {
   *         setTimeout(function() {
   *             callback(null, 'one');
   *         }, 200);
   *     },
   *     function(callback) {
   *         setTimeout(function() {
   *             callback(null, 'two');
   *         }, 100);
   *     }
   * ]).then(results => {
   *     console.log(results);
   *     // results is equal to ['one','two']
   * }).catch(err => {
   *     console.log(err);
   * });
   *
   * // an example using an object instead of an array
   * async.series({
   *     one: function(callback) {
   *         setTimeout(function() {
   *             // do some async task
   *             callback(null, 1);
   *         }, 200);
   *     },
   *     two: function(callback) {
   *         setTimeout(function() {
   *             // then do another async task
   *             callback(null, 2);
   *         }, 100);
   *     }
   * }).then(results => {
   *     console.log(results);
   *     // results is equal to: { one: 1, two: 2 }
   * }).catch(err => {
   *     console.log(err);
   * });
   *
   * //Using async/await
   * async () => {
   *     try {
   *         let results = await async.series([
   *             function(callback) {
   *                 setTimeout(function() {
   *                     // do some async task
   *                     callback(null, 'one');
   *                 }, 200);
   *             },
   *             function(callback) {
   *                 setTimeout(function() {
   *                     // then do another async task
   *                     callback(null, 'two');
   *                 }, 100);
   *             }
   *         ]);
   *         console.log(results);
   *         // results is equal to ['one','two']
   *     }
   *     catch (err) {
   *         console.log(err);
   *     }
   * }
   *
   * // an example using an object instead of an array
   * async () => {
   *     try {
   *         let results = await async.parallel({
   *             one: function(callback) {
   *                 setTimeout(function() {
   *                     // do some async task
   *                     callback(null, 1);
   *                 }, 200);
   *             },
   *            two: function(callback) {
   *                 setTimeout(function() {
   *                     // then do another async task
   *                     callback(null, 2);
   *                 }, 100);
   *            }
   *         });
   *         console.log(results);
   *         // results is equal to: { one: 1, two: 2 }
   *     }
   *     catch (err) {
   *         console.log(err);
   *     }
   * }
   *
   */ function $0c84690c59b4ccb2$export$7589597339a0562d(tasks, callback) {
    return $0c84690c59b4ccb2$var$parallel(
      $0c84690c59b4ccb2$export$750e7e5fea3b0654,
      tasks,
      callback
    );
  }
  /**
   * Returns `true` if at least one element in the `coll` satisfies an async test.
   * If any iteratee call returns `true`, the main `callback` is immediately
   * called.
   *
   * @name some
   * @static
   * @memberOf module:Collections
   * @method
   * @alias any
   * @category Collection
   * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
   * @param {AsyncFunction} iteratee - An async truth test to apply to each item
   * in the collections in parallel.
   * The iteratee should complete with a boolean `result` value.
   * Invoked with (item, callback).
   * @param {Function} [callback] - A callback which is called as soon as any
   * iteratee returns `true`, or after all the iteratee functions have finished.
   * Result will be either `true` or `false` depending on the values of the async
   * tests. Invoked with (err, result).
   * @returns {Promise} a promise, if no callback provided
   * @example
   *
   * // dir1 is a directory that contains file1.txt, file2.txt
   * // dir2 is a directory that contains file3.txt, file4.txt
   * // dir3 is a directory that contains file5.txt
   * // dir4 does not exist
   *
   * // asynchronous function that checks if a file exists
   * function fileExists(file, callback) {
   *    fs.access(file, fs.constants.F_OK, (err) => {
   *        callback(null, !err);
   *    });
   * }
   *
   * // Using callbacks
   * async.some(['dir1/missing.txt','dir2/missing.txt','dir3/file5.txt'], fileExists,
   *    function(err, result) {
   *        console.log(result);
   *        // true
   *        // result is true since some file in the list exists
   *    }
   *);
   *
   * async.some(['dir1/missing.txt','dir2/missing.txt','dir4/missing.txt'], fileExists,
   *    function(err, result) {
   *        console.log(result);
   *        // false
   *        // result is false since none of the files exists
   *    }
   *);
   *
   * // Using Promises
   * async.some(['dir1/missing.txt','dir2/missing.txt','dir3/file5.txt'], fileExists)
   * .then( result => {
   *     console.log(result);
   *     // true
   *     // result is true since some file in the list exists
   * }).catch( err => {
   *     console.log(err);
   * });
   *
   * async.some(['dir1/missing.txt','dir2/missing.txt','dir4/missing.txt'], fileExists)
   * .then( result => {
   *     console.log(result);
   *     // false
   *     // result is false since none of the files exists
   * }).catch( err => {
   *     console.log(err);
   * });
   *
   * // Using async/await
   * async () => {
   *     try {
   *         let result = await async.some(['dir1/missing.txt','dir2/missing.txt','dir3/file5.txt'], fileExists);
   *         console.log(result);
   *         // true
   *         // result is true since some file in the list exists
   *     }
   *     catch (err) {
   *         console.log(err);
   *     }
   * }
   *
   * async () => {
   *     try {
   *         let result = await async.some(['dir1/missing.txt','dir2/missing.txt','dir4/missing.txt'], fileExists);
   *         console.log(result);
   *         // false
   *         // result is false since none of the files exists
   *     }
   *     catch (err) {
   *         console.log(err);
   *     }
   * }
   *
   */ function $0c84690c59b4ccb2$var$some(coll, iteratee, callback) {
    return $0c84690c59b4ccb2$var$_createTester(Boolean, (res) => res)(
      $0c84690c59b4ccb2$export$d10d68e43a57bce9,
      coll,
      iteratee,
      callback
    );
  }
  var $0c84690c59b4ccb2$export$ad14ef4001db2bcd =
    $0c84690c59b4ccb2$var$awaitify($0c84690c59b4ccb2$var$some, 3);
  /**
   * The same as [`some`]{@link module:Collections.some} but runs a maximum of `limit` async operations at a time.
   *
   * @name someLimit
   * @static
   * @memberOf module:Collections
   * @method
   * @see [async.some]{@link module:Collections.some}
   * @alias anyLimit
   * @category Collection
   * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
   * @param {number} limit - The maximum number of async operations at a time.
   * @param {AsyncFunction} iteratee - An async truth test to apply to each item
   * in the collections in parallel.
   * The iteratee should complete with a boolean `result` value.
   * Invoked with (item, callback).
   * @param {Function} [callback] - A callback which is called as soon as any
   * iteratee returns `true`, or after all the iteratee functions have finished.
   * Result will be either `true` or `false` depending on the values of the async
   * tests. Invoked with (err, result).
   * @returns {Promise} a promise, if no callback provided
   */ function $0c84690c59b4ccb2$var$someLimit(
    coll,
    limit,
    iteratee,
    callback
  ) {
    return $0c84690c59b4ccb2$var$_createTester(Boolean, (res) => res)(
      $0c84690c59b4ccb2$var$eachOfLimit(limit),
      coll,
      iteratee,
      callback
    );
  }
  var $0c84690c59b4ccb2$export$eb635e263b5ded90 =
    $0c84690c59b4ccb2$var$awaitify($0c84690c59b4ccb2$var$someLimit, 4);
  /**
   * The same as [`some`]{@link module:Collections.some} but runs only a single async operation at a time.
   *
   * @name someSeries
   * @static
   * @memberOf module:Collections
   * @method
   * @see [async.some]{@link module:Collections.some}
   * @alias anySeries
   * @category Collection
   * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
   * @param {AsyncFunction} iteratee - An async truth test to apply to each item
   * in the collections in series.
   * The iteratee should complete with a boolean `result` value.
   * Invoked with (item, callback).
   * @param {Function} [callback] - A callback which is called as soon as any
   * iteratee returns `true`, or after all the iteratee functions have finished.
   * Result will be either `true` or `false` depending on the values of the async
   * tests. Invoked with (err, result).
   * @returns {Promise} a promise, if no callback provided
   */ function $0c84690c59b4ccb2$var$someSeries(coll, iteratee, callback) {
    return $0c84690c59b4ccb2$var$_createTester(Boolean, (res) => res)(
      $0c84690c59b4ccb2$export$750e7e5fea3b0654,
      coll,
      iteratee,
      callback
    );
  }
  var $0c84690c59b4ccb2$export$c072acdb5b2ad89 = $0c84690c59b4ccb2$var$awaitify(
    $0c84690c59b4ccb2$var$someSeries,
    3
  );
  /**
   * Sorts a list by the results of running each `coll` value through an async
   * `iteratee`.
   *
   * @name sortBy
   * @static
   * @memberOf module:Collections
   * @method
   * @category Collection
   * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
   * @param {AsyncFunction} iteratee - An async function to apply to each item in
   * `coll`.
   * The iteratee should complete with a value to use as the sort criteria as
   * its `result`.
   * Invoked with (item, callback).
   * @param {Function} callback - A callback which is called after all the
   * `iteratee` functions have finished, or an error occurs. Results is the items
   * from the original `coll` sorted by the values returned by the `iteratee`
   * calls. Invoked with (err, results).
   * @returns {Promise} a promise, if no callback passed
   * @example
   *
   * // bigfile.txt is a file that is 251100 bytes in size
   * // mediumfile.txt is a file that is 11000 bytes in size
   * // smallfile.txt is a file that is 121 bytes in size
   *
   * // asynchronous function that returns the file size in bytes
   * function getFileSizeInBytes(file, callback) {
   *     fs.stat(file, function(err, stat) {
   *         if (err) {
   *             return callback(err);
   *         }
   *         callback(null, stat.size);
   *     });
   * }
   *
   * // Using callbacks
   * async.sortBy(['mediumfile.txt','smallfile.txt','bigfile.txt'], getFileSizeInBytes,
   *     function(err, results) {
   *         if (err) {
   *             console.log(err);
   *         } else {
   *             console.log(results);
   *             // results is now the original array of files sorted by
   *             // file size (ascending by default), e.g.
   *             // [ 'smallfile.txt', 'mediumfile.txt', 'bigfile.txt']
   *         }
   *     }
   * );
   *
   * // By modifying the callback parameter the
   * // sorting order can be influenced:
   *
   * // ascending order
   * async.sortBy(['mediumfile.txt','smallfile.txt','bigfile.txt'], function(file, callback) {
   *     getFileSizeInBytes(file, function(getFileSizeErr, fileSize) {
   *         if (getFileSizeErr) return callback(getFileSizeErr);
   *         callback(null, fileSize);
   *     });
   * }, function(err, results) {
   *         if (err) {
   *             console.log(err);
   *         } else {
   *             console.log(results);
   *             // results is now the original array of files sorted by
   *             // file size (ascending by default), e.g.
   *             // [ 'smallfile.txt', 'mediumfile.txt', 'bigfile.txt']
   *         }
   *     }
   * );
   *
   * // descending order
   * async.sortBy(['bigfile.txt','mediumfile.txt','smallfile.txt'], function(file, callback) {
   *     getFileSizeInBytes(file, function(getFileSizeErr, fileSize) {
   *         if (getFileSizeErr) {
   *             return callback(getFileSizeErr);
   *         }
   *         callback(null, fileSize * -1);
   *     });
   * }, function(err, results) {
   *         if (err) {
   *             console.log(err);
   *         } else {
   *             console.log(results);
   *             // results is now the original array of files sorted by
   *             // file size (ascending by default), e.g.
   *             // [ 'bigfile.txt', 'mediumfile.txt', 'smallfile.txt']
   *         }
   *     }
   * );
   *
   * // Error handling
   * async.sortBy(['mediumfile.txt','smallfile.txt','missingfile.txt'], getFileSizeInBytes,
   *     function(err, results) {
   *         if (err) {
   *             console.log(err);
   *             // [ Error: ENOENT: no such file or directory ]
   *         } else {
   *             console.log(results);
   *         }
   *     }
   * );
   *
   * // Using Promises
   * async.sortBy(['mediumfile.txt','smallfile.txt','bigfile.txt'], getFileSizeInBytes)
   * .then( results => {
   *     console.log(results);
   *     // results is now the original array of files sorted by
   *     // file size (ascending by default), e.g.
   *     // [ 'smallfile.txt', 'mediumfile.txt', 'bigfile.txt']
   * }).catch( err => {
   *     console.log(err);
   * });
   *
   * // Error handling
   * async.sortBy(['mediumfile.txt','smallfile.txt','missingfile.txt'], getFileSizeInBytes)
   * .then( results => {
   *     console.log(results);
   * }).catch( err => {
   *     console.log(err);
   *     // [ Error: ENOENT: no such file or directory ]
   * });
   *
   * // Using async/await
   * (async () => {
   *     try {
   *         let results = await async.sortBy(['bigfile.txt','mediumfile.txt','smallfile.txt'], getFileSizeInBytes);
   *         console.log(results);
   *         // results is now the original array of files sorted by
   *         // file size (ascending by default), e.g.
   *         // [ 'smallfile.txt', 'mediumfile.txt', 'bigfile.txt']
   *     }
   *     catch (err) {
   *         console.log(err);
   *     }
   * })();
   *
   * // Error handling
   * async () => {
   *     try {
   *         let results = await async.sortBy(['missingfile.txt','mediumfile.txt','smallfile.txt'], getFileSizeInBytes);
   *         console.log(results);
   *     }
   *     catch (err) {
   *         console.log(err);
   *         // [ Error: ENOENT: no such file or directory ]
   *     }
   * }
   *
   */ function $0c84690c59b4ccb2$var$sortBy(coll, iteratee, callback) {
    var _iteratee = $0c84690c59b4ccb2$var$wrapAsync(iteratee);
    return $0c84690c59b4ccb2$export$871de8747c9eaa88(
      coll,
      (x, iterCb) => {
        _iteratee(x, (err, criteria) => {
          if (err) return iterCb(err);
          iterCb(err, {
            value: x,
            criteria: criteria,
          });
        });
      },
      (err, results) => {
        if (err) return callback(err);
        callback(
          null,
          results.sort(comparator).map((v) => v.value)
        );
      }
    );
    function comparator(left, right) {
      var a = left.criteria,
        b = right.criteria;
      return a < b ? -1 : a > b ? 1 : 0;
    }
  }
  var $0c84690c59b4ccb2$export$b035e44d7bb4278f =
    $0c84690c59b4ccb2$var$awaitify($0c84690c59b4ccb2$var$sortBy, 3);
  /**
   * Sets a time limit on an asynchronous function. If the function does not call
   * its callback within the specified milliseconds, it will be called with a
   * timeout error. The code property for the error object will be `'ETIMEDOUT'`.
   *
   * @name timeout
   * @static
   * @memberOf module:Utils
   * @method
   * @category Util
   * @param {AsyncFunction} asyncFn - The async function to limit in time.
   * @param {number} milliseconds - The specified time limit.
   * @param {*} [info] - Any variable you want attached (`string`, `object`, etc)
   * to timeout Error for more information..
   * @returns {AsyncFunction} Returns a wrapped function that can be used with any
   * of the control flow functions.
   * Invoke this function with the same parameters as you would `asyncFunc`.
   * @example
   *
   * function myFunction(foo, callback) {
   *     doAsyncTask(foo, function(err, data) {
   *         // handle errors
   *         if (err) return callback(err);
   *
   *         // do some stuff ...
   *
   *         // return processed data
   *         return callback(null, data);
   *     });
   * }
   *
   * var wrapped = async.timeout(myFunction, 1000);
   *
   * // call `wrapped` as you would `myFunction`
   * wrapped({ bar: 'bar' }, function(err, data) {
   *     // if `myFunction` takes < 1000 ms to execute, `err`
   *     // and `data` will have their expected values
   *
   *     // else `err` will be an Error with the code 'ETIMEDOUT'
   * });
   */ function $0c84690c59b4ccb2$export$83e74882c5df8fe1(
    asyncFn,
    milliseconds,
    info
  ) {
    var fn = $0c84690c59b4ccb2$var$wrapAsync(asyncFn);
    return $0c84690c59b4ccb2$var$initialParams((args, callback) => {
      var timedOut = false;
      var timer;
      function timeoutCallback() {
        var name = asyncFn.name || "anonymous";
        var error = new Error('Callback function "' + name + '" timed out.');
        error.code = "ETIMEDOUT";
        if (info) error.info = info;
        timedOut = true;
        callback(error);
      }
      args.push((...cbArgs) => {
        if (!timedOut) {
          callback(...cbArgs);
          clearTimeout(timer);
        }
      });
      // setup timer and call original function
      timer = setTimeout(timeoutCallback, milliseconds);
      fn(...args);
    });
  }
  function $0c84690c59b4ccb2$var$range(size) {
    var result = Array(size);
    while (size--) result[size] = size;
    return result;
  }
  /**
   * The same as [times]{@link module:ControlFlow.times} but runs a maximum of `limit` async operations at a
   * time.
   *
   * @name timesLimit
   * @static
   * @memberOf module:ControlFlow
   * @method
   * @see [async.times]{@link module:ControlFlow.times}
   * @category Control Flow
   * @param {number} count - The number of times to run the function.
   * @param {number} limit - The maximum number of async operations at a time.
   * @param {AsyncFunction} iteratee - The async function to call `n` times.
   * Invoked with the iteration index and a callback: (n, next).
   * @param {Function} callback - see [async.map]{@link module:Collections.map}.
   * @returns {Promise} a promise, if no callback is provided
   */ function $0c84690c59b4ccb2$export$5ebd4c84811c422b(
    count,
    limit,
    iteratee,
    callback
  ) {
    var _iteratee = $0c84690c59b4ccb2$var$wrapAsync(iteratee);
    return $0c84690c59b4ccb2$export$6a28d19bcc59197c(
      $0c84690c59b4ccb2$var$range(count),
      limit,
      _iteratee,
      callback
    );
  }
  /**
   * Calls the `iteratee` function `n` times, and accumulates results in the same
   * manner you would use with [map]{@link module:Collections.map}.
   *
   * @name times
   * @static
   * @memberOf module:ControlFlow
   * @method
   * @see [async.map]{@link module:Collections.map}
   * @category Control Flow
   * @param {number} n - The number of times to run the function.
   * @param {AsyncFunction} iteratee - The async function to call `n` times.
   * Invoked with the iteration index and a callback: (n, next).
   * @param {Function} callback - see {@link module:Collections.map}.
   * @returns {Promise} a promise, if no callback is provided
   * @example
   *
   * // Pretend this is some complicated async factory
   * var createUser = function(id, callback) {
   *     callback(null, {
   *         id: 'user' + id
   *     });
   * };
   *
   * // generate 5 users
   * async.times(5, function(n, next) {
   *     createUser(n, function(err, user) {
   *         next(err, user);
   *     });
   * }, function(err, users) {
   *     // we should now have 5 users
   * });
   */ function $0c84690c59b4ccb2$export$b5bc26e198ce73d0(
    n,
    iteratee,
    callback
  ) {
    return $0c84690c59b4ccb2$export$5ebd4c84811c422b(
      n,
      Infinity,
      iteratee,
      callback
    );
  }
  /**
   * The same as [times]{@link module:ControlFlow.times} but runs only a single async operation at a time.
   *
   * @name timesSeries
   * @static
   * @memberOf module:ControlFlow
   * @method
   * @see [async.times]{@link module:ControlFlow.times}
   * @category Control Flow
   * @param {number} n - The number of times to run the function.
   * @param {AsyncFunction} iteratee - The async function to call `n` times.
   * Invoked with the iteration index and a callback: (n, next).
   * @param {Function} callback - see {@link module:Collections.map}.
   * @returns {Promise} a promise, if no callback is provided
   */ function $0c84690c59b4ccb2$export$51c3f8bb1fe6838c(
    n,
    iteratee,
    callback
  ) {
    return $0c84690c59b4ccb2$export$5ebd4c84811c422b(n, 1, iteratee, callback);
  }
  /**
   * A relative of `reduce`.  Takes an Object or Array, and iterates over each
   * element in parallel, each step potentially mutating an `accumulator` value.
   * The type of the accumulator defaults to the type of collection passed in.
   *
   * @name transform
   * @static
   * @memberOf module:Collections
   * @method
   * @category Collection
   * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
   * @param {*} [accumulator] - The initial state of the transform.  If omitted,
   * it will default to an empty Object or Array, depending on the type of `coll`
   * @param {AsyncFunction} iteratee - A function applied to each item in the
   * collection that potentially modifies the accumulator.
   * Invoked with (accumulator, item, key, callback).
   * @param {Function} [callback] - A callback which is called after all the
   * `iteratee` functions have finished. Result is the transformed accumulator.
   * Invoked with (err, result).
   * @returns {Promise} a promise, if no callback provided
   * @example
   *
   * // file1.txt is a file that is 1000 bytes in size
   * // file2.txt is a file that is 2000 bytes in size
   * // file3.txt is a file that is 3000 bytes in size
   *
   * // helper function that returns human-readable size format from bytes
   * function formatBytes(bytes, decimals = 2) {
   *   // implementation not included for brevity
   *   return humanReadbleFilesize;
   * }
   *
   * const fileList = ['file1.txt','file2.txt','file3.txt'];
   *
   * // asynchronous function that returns the file size, transformed to human-readable format
   * // e.g. 1024 bytes = 1KB, 1234 bytes = 1.21 KB, 1048576 bytes = 1MB, etc.
   * function transformFileSize(acc, value, key, callback) {
   *     fs.stat(value, function(err, stat) {
   *         if (err) {
   *             return callback(err);
   *         }
   *         acc[key] = formatBytes(stat.size);
   *         callback(null);
   *     });
   * }
   *
   * // Using callbacks
   * async.transform(fileList, transformFileSize, function(err, result) {
   *     if(err) {
   *         console.log(err);
   *     } else {
   *         console.log(result);
   *         // [ '1000 Bytes', '1.95 KB', '2.93 KB' ]
   *     }
   * });
   *
   * // Using Promises
   * async.transform(fileList, transformFileSize)
   * .then(result => {
   *     console.log(result);
   *     // [ '1000 Bytes', '1.95 KB', '2.93 KB' ]
   * }).catch(err => {
   *     console.log(err);
   * });
   *
   * // Using async/await
   * (async () => {
   *     try {
   *         let result = await async.transform(fileList, transformFileSize);
   *         console.log(result);
   *         // [ '1000 Bytes', '1.95 KB', '2.93 KB' ]
   *     }
   *     catch (err) {
   *         console.log(err);
   *     }
   * })();
   *
   * @example
   *
   * // file1.txt is a file that is 1000 bytes in size
   * // file2.txt is a file that is 2000 bytes in size
   * // file3.txt is a file that is 3000 bytes in size
   *
   * // helper function that returns human-readable size format from bytes
   * function formatBytes(bytes, decimals = 2) {
   *   // implementation not included for brevity
   *   return humanReadbleFilesize;
   * }
   *
   * const fileMap = { f1: 'file1.txt', f2: 'file2.txt', f3: 'file3.txt' };
   *
   * // asynchronous function that returns the file size, transformed to human-readable format
   * // e.g. 1024 bytes = 1KB, 1234 bytes = 1.21 KB, 1048576 bytes = 1MB, etc.
   * function transformFileSize(acc, value, key, callback) {
   *     fs.stat(value, function(err, stat) {
   *         if (err) {
   *             return callback(err);
   *         }
   *         acc[key] = formatBytes(stat.size);
   *         callback(null);
   *     });
   * }
   *
   * // Using callbacks
   * async.transform(fileMap, transformFileSize, function(err, result) {
   *     if(err) {
   *         console.log(err);
   *     } else {
   *         console.log(result);
   *         // { f1: '1000 Bytes', f2: '1.95 KB', f3: '2.93 KB' }
   *     }
   * });
   *
   * // Using Promises
   * async.transform(fileMap, transformFileSize)
   * .then(result => {
   *     console.log(result);
   *     // { f1: '1000 Bytes', f2: '1.95 KB', f3: '2.93 KB' }
   * }).catch(err => {
   *     console.log(err);
   * });
   *
   * // Using async/await
   * async () => {
   *     try {
   *         let result = await async.transform(fileMap, transformFileSize);
   *         console.log(result);
   *         // { f1: '1000 Bytes', f2: '1.95 KB', f3: '2.93 KB' }
   *     }
   *     catch (err) {
   *         console.log(err);
   *     }
   * }
   *
   */ function $0c84690c59b4ccb2$export$51186ad6e864892a(
    coll,
    accumulator,
    iteratee,
    callback
  ) {
    if (arguments.length <= 3 && typeof accumulator === "function") {
      callback = iteratee;
      iteratee = accumulator;
      accumulator = Array.isArray(coll) ? [] : {};
    }
    callback = $0c84690c59b4ccb2$var$once(
      callback || $0c84690c59b4ccb2$var$promiseCallback()
    );
    var _iteratee = $0c84690c59b4ccb2$var$wrapAsync(iteratee);
    $0c84690c59b4ccb2$export$d10d68e43a57bce9(
      coll,
      (v, k, cb) => {
        _iteratee(accumulator, v, k, cb);
      },
      (err) => callback(err, accumulator)
    );
    return callback[$0c84690c59b4ccb2$var$PROMISE_SYMBOL];
  }
  /**
   * It runs each task in series but stops whenever any of the functions were
   * successful. If one of the tasks were successful, the `callback` will be
   * passed the result of the successful task. If all tasks fail, the callback
   * will be passed the error and result (if any) of the final attempt.
   *
   * @name tryEach
   * @static
   * @memberOf module:ControlFlow
   * @method
   * @category Control Flow
   * @param {Array|Iterable|AsyncIterable|Object} tasks - A collection containing functions to
   * run, each function is passed a `callback(err, result)` it must call on
   * completion with an error `err` (which can be `null`) and an optional `result`
   * value.
   * @param {Function} [callback] - An optional callback which is called when one
   * of the tasks has succeeded, or all have failed. It receives the `err` and
   * `result` arguments of the last attempt at completing the `task`. Invoked with
   * (err, results).
   * @returns {Promise} a promise, if no callback is passed
   * @example
   * async.tryEach([
   *     function getDataFromFirstWebsite(callback) {
   *         // Try getting the data from the first website
   *         callback(err, data);
   *     },
   *     function getDataFromSecondWebsite(callback) {
   *         // First website failed,
   *         // Try getting the data from the backup website
   *         callback(err, data);
   *     }
   * ],
   * // optional callback
   * function(err, results) {
   *     Now do something with the data.
   * });
   *
   */ function $0c84690c59b4ccb2$var$tryEach(tasks, callback) {
    var error = null;
    var result;
    return $0c84690c59b4ccb2$export$9bd663f1fadd104c(
      tasks,
      (task, taskCb) => {
        $0c84690c59b4ccb2$var$wrapAsync(task)((err, ...args) => {
          if (err === false) return taskCb(err);
          if (args.length < 2) [result] = args;
          else result = args;
          error = err;
          taskCb(err ? null : {});
        });
      },
      () => callback(error, result)
    );
  }
  var $0c84690c59b4ccb2$export$c382910393876e1e =
    $0c84690c59b4ccb2$var$awaitify($0c84690c59b4ccb2$var$tryEach);
  /**
   * Undoes a [memoize]{@link module:Utils.memoize}d function, reverting it to the original,
   * unmemoized form. Handy for testing.
   *
   * @name unmemoize
   * @static
   * @memberOf module:Utils
   * @method
   * @see [async.memoize]{@link module:Utils.memoize}
   * @category Util
   * @param {AsyncFunction} fn - the memoized function
   * @returns {AsyncFunction} a function that calls the original unmemoized function
   */ function $0c84690c59b4ccb2$export$a8183b28ba2fbf41(fn) {
    return (...args) => {
      return (fn.unmemoized || fn)(...args);
    };
  }
  /**
   * Repeatedly call `iteratee`, while `test` returns `true`. Calls `callback` when
   * stopped, or an error occurs.
   *
   * @name whilst
   * @static
   * @memberOf module:ControlFlow
   * @method
   * @category Control Flow
   * @param {AsyncFunction} test - asynchronous truth test to perform before each
   * execution of `iteratee`. Invoked with ().
   * @param {AsyncFunction} iteratee - An async function which is called each time
   * `test` passes. Invoked with (callback).
   * @param {Function} [callback] - A callback which is called after the test
   * function has failed and repeated execution of `iteratee` has stopped. `callback`
   * will be passed an error and any arguments passed to the final `iteratee`'s
   * callback. Invoked with (err, [results]);
   * @returns {Promise} a promise, if no callback is passed
   * @example
   *
   * var count = 0;
   * async.whilst(
   *     function test(cb) { cb(null, count < 5); },
   *     function iter(callback) {
   *         count++;
   *         setTimeout(function() {
   *             callback(null, count);
   *         }, 1000);
   *     },
   *     function (err, n) {
   *         // 5 seconds have passed, n = 5
   *     }
   * );
   */ function $0c84690c59b4ccb2$var$whilst(test, iteratee, callback) {
    callback = $0c84690c59b4ccb2$var$onlyOnce(callback);
    var _fn = $0c84690c59b4ccb2$var$wrapAsync(iteratee);
    var _test = $0c84690c59b4ccb2$var$wrapAsync(test);
    var results = [];
    function next(err, ...rest) {
      if (err) return callback(err);
      results = rest;
      if (err === false) return;
      _test(check);
    }
    function check(err, truth) {
      if (err) return callback(err);
      if (err === false) return;
      if (!truth) return callback(null, ...results);
      _fn(next);
    }
    return _test(check);
  }
  var $0c84690c59b4ccb2$export$da38dd6790b15d8f =
    $0c84690c59b4ccb2$var$awaitify($0c84690c59b4ccb2$var$whilst, 3);
  /**
   * Repeatedly call `iteratee` until `test` returns `true`. Calls `callback` when
   * stopped, or an error occurs. `callback` will be passed an error and any
   * arguments passed to the final `iteratee`'s callback.
   *
   * The inverse of [whilst]{@link module:ControlFlow.whilst}.
   *
   * @name until
   * @static
   * @memberOf module:ControlFlow
   * @method
   * @see [async.whilst]{@link module:ControlFlow.whilst}
   * @category Control Flow
   * @param {AsyncFunction} test - asynchronous truth test to perform before each
   * execution of `iteratee`. Invoked with (callback).
   * @param {AsyncFunction} iteratee - An async function which is called each time
   * `test` fails. Invoked with (callback).
   * @param {Function} [callback] - A callback which is called after the test
   * function has passed and repeated execution of `iteratee` has stopped. `callback`
   * will be passed an error and any arguments passed to the final `iteratee`'s
   * callback. Invoked with (err, [results]);
   * @returns {Promise} a promise, if a callback is not passed
   *
   * @example
   * const results = []
   * let finished = false
   * async.until(function test(cb) {
   *     cb(null, finished)
   * }, function iter(next) {
   *     fetchPage(url, (err, body) => {
   *         if (err) return next(err)
   *         results = results.concat(body.objects)
   *         finished = !!body.next
   *         next(err)
   *     })
   * }, function done (err) {
   *     // all pages have been fetched
   * })
   */ function $0c84690c59b4ccb2$export$a40009bd2c363351(
    test,
    iteratee,
    callback
  ) {
    const _test = $0c84690c59b4ccb2$var$wrapAsync(test);
    return $0c84690c59b4ccb2$export$da38dd6790b15d8f(
      (cb) => _test((err, truth) => cb(err, !truth)),
      iteratee,
      callback
    );
  }
  /**
   * Runs the `tasks` array of functions in series, each passing their results to
   * the next in the array. However, if any of the `tasks` pass an error to their
   * own callback, the next function is not executed, and the main `callback` is
   * immediately called with the error.
   *
   * @name waterfall
   * @static
   * @memberOf module:ControlFlow
   * @method
   * @category Control Flow
   * @param {Array} tasks - An array of [async functions]{@link AsyncFunction}
   * to run.
   * Each function should complete with any number of `result` values.
   * The `result` values will be passed as arguments, in order, to the next task.
   * @param {Function} [callback] - An optional callback to run once all the
   * functions have completed. This will be passed the results of the last task's
   * callback. Invoked with (err, [results]).
   * @returns {Promise} a promise, if a callback is omitted
   * @example
   *
   * async.waterfall([
   *     function(callback) {
   *         callback(null, 'one', 'two');
   *     },
   *     function(arg1, arg2, callback) {
   *         // arg1 now equals 'one' and arg2 now equals 'two'
   *         callback(null, 'three');
   *     },
   *     function(arg1, callback) {
   *         // arg1 now equals 'three'
   *         callback(null, 'done');
   *     }
   * ], function (err, result) {
   *     // result now equals 'done'
   * });
   *
   * // Or, with named functions:
   * async.waterfall([
   *     myFirstFunction,
   *     mySecondFunction,
   *     myLastFunction,
   * ], function (err, result) {
   *     // result now equals 'done'
   * });
   * function myFirstFunction(callback) {
   *     callback(null, 'one', 'two');
   * }
   * function mySecondFunction(arg1, arg2, callback) {
   *     // arg1 now equals 'one' and arg2 now equals 'two'
   *     callback(null, 'three');
   * }
   * function myLastFunction(arg1, callback) {
   *     // arg1 now equals 'three'
   *     callback(null, 'done');
   * }
   */ function $0c84690c59b4ccb2$var$waterfall(tasks, callback) {
    callback = $0c84690c59b4ccb2$var$once(callback);
    if (!Array.isArray(tasks))
      return callback(
        new Error("First argument to waterfall must be an array of functions")
      );
    if (!tasks.length) return callback();
    var taskIndex = 0;
    function nextTask(args) {
      var task = $0c84690c59b4ccb2$var$wrapAsync(tasks[taskIndex++]);
      task(...args, $0c84690c59b4ccb2$var$onlyOnce(next));
    }
    function next(err, ...args) {
      if (err === false) return;
      if (err || taskIndex === tasks.length) return callback(err, ...args);
      nextTask(args);
    }
    nextTask([]);
  }
  var $0c84690c59b4ccb2$export$981f466e0ef96280 =
    $0c84690c59b4ccb2$var$awaitify($0c84690c59b4ccb2$var$waterfall);
  /**
   * An "async function" in the context of Async is an asynchronous function with
   * a variable number of parameters, with the final parameter being a callback.
   * (`function (arg1, arg2, ..., callback) {}`)
   * The final callback is of the form `callback(err, results...)`, which must be
   * called once the function is completed.  The callback should be called with a
   * Error as its first argument to signal that an error occurred.
   * Otherwise, if no error occurred, it should be called with `null` as the first
   * argument, and any additional `result` arguments that may apply, to signal
   * successful completion.
   * The callback must be called exactly once, ideally on a later tick of the
   * JavaScript event loop.
   *
   * This type of function is also referred to as a "Node-style async function",
   * or a "continuation passing-style function" (CPS). Most of the methods of this
   * library are themselves CPS/Node-style async functions, or functions that
   * return CPS/Node-style async functions.
   *
   * Wherever we accept a Node-style async function, we also directly accept an
   * [ES2017 `async` function]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function}.
   * In this case, the `async` function will not be passed a final callback
   * argument, and any thrown error will be used as the `err` argument of the
   * implicit callback, and the return value will be used as the `result` value.
   * (i.e. a `rejected` of the returned Promise becomes the `err` callback
   * argument, and a `resolved` value becomes the `result`.)
   *
   * Note, due to JavaScript limitations, we can only detect native `async`
   * functions and not transpilied implementations.
   * Your environment must have `async`/`await` support for this to work.
   * (e.g. Node > v7.6, or a recent version of a modern browser).
   * If you are using `async` functions through a transpiler (e.g. Babel), you
   * must still wrap the function with [asyncify]{@link module:Utils.asyncify},
   * because the `async function` will be compiled to an ordinary function that
   * returns a promise.
   *
   * @typedef {Function} AsyncFunction
   * @static
   */ var $0c84690c59b4ccb2$var$index = {
    apply: $0c84690c59b4ccb2$export$5635d7ef4b8fee1c,
    applyEach: $0c84690c59b4ccb2$export$e0fc6250e304edaf,
    applyEachSeries: $0c84690c59b4ccb2$export$cdb63afc167779e,
    asyncify: $0c84690c59b4ccb2$export$b5d55b15b1db3122,
    auto: $0c84690c59b4ccb2$export$dfb5619354ba860,
    autoInject: $0c84690c59b4ccb2$export$868ec1c38c3c8735,
    cargo: $0c84690c59b4ccb2$export$f9549d7e5aef7637,
    cargoQueue: $0c84690c59b4ccb2$export$687de40d137ed486,
    compose: $0c84690c59b4ccb2$export$f672e0b6f7222cd7,
    concat: $0c84690c59b4ccb2$export$ee1b3e54f0441b22,
    concatLimit: $0c84690c59b4ccb2$export$4f1520afe59a31db,
    concatSeries: $0c84690c59b4ccb2$export$b6df61d74da01b63,
    constant: $0c84690c59b4ccb2$export$c983f826f44ff86,
    detect: $0c84690c59b4ccb2$export$17b446b869dad473,
    detectLimit: $0c84690c59b4ccb2$export$922bcf02f3a5b284,
    detectSeries: $0c84690c59b4ccb2$export$922a9a31d0cff2ee,
    dir: $0c84690c59b4ccb2$export$147ec2801e896265,
    doUntil: $0c84690c59b4ccb2$export$16f3a0560cc13fb4,
    doWhilst: $0c84690c59b4ccb2$export$353f40bf1add0d75,
    each: $0c84690c59b4ccb2$export$79b2f7037acddd43,
    eachLimit: $0c84690c59b4ccb2$export$2a2080ddac50d6b8,
    eachOf: $0c84690c59b4ccb2$export$d10d68e43a57bce9,
    eachOfLimit: $0c84690c59b4ccb2$export$8b05461b96b91438,
    eachOfSeries: $0c84690c59b4ccb2$export$750e7e5fea3b0654,
    eachSeries: $0c84690c59b4ccb2$export$9bd663f1fadd104c,
    ensureAsync: $0c84690c59b4ccb2$export$85d5b9ccf228381c,
    every: $0c84690c59b4ccb2$export$7ecc1a3b11b57dab,
    everyLimit: $0c84690c59b4ccb2$export$61377f8da40b9b4c,
    everySeries: $0c84690c59b4ccb2$export$7ce9462b07c48a66,
    filter: $0c84690c59b4ccb2$export$3dea766d36a8935f,
    filterLimit: $0c84690c59b4ccb2$export$6a93acd3681313ac,
    filterSeries: $0c84690c59b4ccb2$export$ddcc38daaa46257c,
    forever: $0c84690c59b4ccb2$export$116a0f7f2303acd8,
    groupBy: $0c84690c59b4ccb2$export$3f063810d7bf01bd,
    groupByLimit: $0c84690c59b4ccb2$export$335ad4c8e8977a4b,
    groupBySeries: $0c84690c59b4ccb2$export$d0689f2b629adbdb,
    log: $0c84690c59b4ccb2$export$bef1f36f5486a6a3,
    map: $0c84690c59b4ccb2$export$871de8747c9eaa88,
    mapLimit: $0c84690c59b4ccb2$export$6a28d19bcc59197c,
    mapSeries: $0c84690c59b4ccb2$export$9a85c32cda85b0dd,
    mapValues: $0c84690c59b4ccb2$export$825e789796ab7275,
    mapValuesLimit: $0c84690c59b4ccb2$export$d5d82430c6fa645f,
    mapValuesSeries: $0c84690c59b4ccb2$export$8fbd16e43ec40b44,
    memoize: $0c84690c59b4ccb2$export$fc10aeed3a532e2a,
    nextTick: $0c84690c59b4ccb2$export$bdd553fddd433dcb,
    parallel: $0c84690c59b4ccb2$export$451942af9381149c,
    parallelLimit: $0c84690c59b4ccb2$export$362c0a688af131a0,
    priorityQueue: $0c84690c59b4ccb2$export$25579debde666a98,
    queue: $0c84690c59b4ccb2$export$4f7fa46ff53e516f,
    race: $0c84690c59b4ccb2$export$236c05de452bec2,
    reduce: $0c84690c59b4ccb2$export$533b26079ad0b4b,
    reduceRight: $0c84690c59b4ccb2$export$7fef8bcdbb34f435,
    reflect: $0c84690c59b4ccb2$export$9debe8cffacea23,
    reflectAll: $0c84690c59b4ccb2$export$1a54554d0a489acc,
    reject: $0c84690c59b4ccb2$export$2800f3ceda99eb84,
    rejectLimit: $0c84690c59b4ccb2$export$b59d647fa1894da8,
    rejectSeries: $0c84690c59b4ccb2$export$d68373657532124d,
    retry: $0c84690c59b4ccb2$export$9369b12211e1fce4,
    retryable: $0c84690c59b4ccb2$export$9e1b8e833f44ff21,
    seq: $0c84690c59b4ccb2$export$1041d4276c328e4d,
    series: $0c84690c59b4ccb2$export$7589597339a0562d,
    setImmediate: $0c84690c59b4ccb2$export$c233f08fbfea0913,
    some: $0c84690c59b4ccb2$export$ad14ef4001db2bcd,
    someLimit: $0c84690c59b4ccb2$export$eb635e263b5ded90,
    someSeries: $0c84690c59b4ccb2$export$c072acdb5b2ad89,
    sortBy: $0c84690c59b4ccb2$export$b035e44d7bb4278f,
    timeout: $0c84690c59b4ccb2$export$83e74882c5df8fe1,
    times: $0c84690c59b4ccb2$export$b5bc26e198ce73d0,
    timesLimit: $0c84690c59b4ccb2$export$5ebd4c84811c422b,
    timesSeries: $0c84690c59b4ccb2$export$51c3f8bb1fe6838c,
    transform: $0c84690c59b4ccb2$export$51186ad6e864892a,
    tryEach: $0c84690c59b4ccb2$export$c382910393876e1e,
    unmemoize: $0c84690c59b4ccb2$export$a8183b28ba2fbf41,
    until: $0c84690c59b4ccb2$export$a40009bd2c363351,
    waterfall: $0c84690c59b4ccb2$export$981f466e0ef96280,
    whilst: $0c84690c59b4ccb2$export$da38dd6790b15d8f,
    // aliases
    all: $0c84690c59b4ccb2$export$7ecc1a3b11b57dab,
    allLimit: $0c84690c59b4ccb2$export$61377f8da40b9b4c,
    allSeries: $0c84690c59b4ccb2$export$7ce9462b07c48a66,
    any: $0c84690c59b4ccb2$export$ad14ef4001db2bcd,
    anyLimit: $0c84690c59b4ccb2$export$eb635e263b5ded90,
    anySeries: $0c84690c59b4ccb2$export$c072acdb5b2ad89,
    find: $0c84690c59b4ccb2$export$17b446b869dad473,
    findLimit: $0c84690c59b4ccb2$export$922bcf02f3a5b284,
    findSeries: $0c84690c59b4ccb2$export$922a9a31d0cff2ee,
    flatMap: $0c84690c59b4ccb2$export$ee1b3e54f0441b22,
    flatMapLimit: $0c84690c59b4ccb2$export$4f1520afe59a31db,
    flatMapSeries: $0c84690c59b4ccb2$export$b6df61d74da01b63,
    forEach: $0c84690c59b4ccb2$export$79b2f7037acddd43,
    forEachSeries: $0c84690c59b4ccb2$export$9bd663f1fadd104c,
    forEachLimit: $0c84690c59b4ccb2$export$2a2080ddac50d6b8,
    forEachOf: $0c84690c59b4ccb2$export$d10d68e43a57bce9,
    forEachOfSeries: $0c84690c59b4ccb2$export$750e7e5fea3b0654,
    forEachOfLimit: $0c84690c59b4ccb2$export$8b05461b96b91438,
    inject: $0c84690c59b4ccb2$export$533b26079ad0b4b,
    foldl: $0c84690c59b4ccb2$export$533b26079ad0b4b,
    foldr: $0c84690c59b4ccb2$export$7fef8bcdbb34f435,
    select: $0c84690c59b4ccb2$export$3dea766d36a8935f,
    selectLimit: $0c84690c59b4ccb2$export$6a93acd3681313ac,
    selectSeries: $0c84690c59b4ccb2$export$ddcc38daaa46257c,
    wrapSync: $0c84690c59b4ccb2$export$b5d55b15b1db3122,
    during: $0c84690c59b4ccb2$export$da38dd6790b15d8f,
    doDuring: $0c84690c59b4ccb2$export$353f40bf1add0d75,
  };
  var $0c84690c59b4ccb2$export$2e2bcd8739ae039 = $0c84690c59b4ccb2$var$index;
});

parcelRequire.register("lCJVB", function (module, exports) {
  /*jshint node:true*/ "use strict";

  var $aK4hl = parcelRequire("aK4hl");

  var $gOWQU = parcelRequire("gOWQU");
  /*
   *! Capability helpers
   */ var $fbe0c5f28b372c17$var$avCodecRegexp =
    /^\s*([D ])([E ])([VAS])([S ])([D ])([T ]) ([^ ]+) +(.*)$/;
  var $fbe0c5f28b372c17$var$ffCodecRegexp =
    /^\s*([D\.])([E\.])([VAS])([I\.])([L\.])([S\.]) ([^ ]+) +(.*)$/;
  var $fbe0c5f28b372c17$var$ffEncodersRegexp = /\(encoders:([^\)]+)\)/;
  var $fbe0c5f28b372c17$var$ffDecodersRegexp = /\(decoders:([^\)]+)\)/;
  var $fbe0c5f28b372c17$var$encodersRegexp =
    /^\s*([VAS\.])([F\.])([S\.])([X\.])([B\.])([D\.]) ([^ ]+) +(.*)$/;
  var $fbe0c5f28b372c17$var$formatRegexp = /^\s*([D ])([E ]) ([^ ]+) +(.*)$/;
  var $fbe0c5f28b372c17$var$lineBreakRegexp = /\r\n|\r|\n/;
  var $fbe0c5f28b372c17$var$filterRegexp =
    /^(?: [T\.][S\.][C\.] )?([^ ]+) +(AA?|VV?|\|)->(AA?|VV?|\|) +(.*)$/;
  var $fbe0c5f28b372c17$var$cache = {};
  module.exports = function (proto) {
    /**
     * Manually define the ffmpeg binary full path.
     *
     * @method FfmpegCommand#setFfmpegPath
     *
     * @param {String} ffmpegPath The full path to the ffmpeg binary.
     * @return FfmpegCommand
     */ proto.setFfmpegPath = function (ffmpegPath) {
      $fbe0c5f28b372c17$var$cache.ffmpegPath = ffmpegPath;
      return this;
    };
    /**
     * Manually define the ffprobe binary full path.
     *
     * @method FfmpegCommand#setFfprobePath
     *
     * @param {String} ffprobePath The full path to the ffprobe binary.
     * @return FfmpegCommand
     */ proto.setFfprobePath = function (ffprobePath) {
      $fbe0c5f28b372c17$var$cache.ffprobePath = ffprobePath;
      return this;
    };
    /**
     * Manually define the flvtool2/flvmeta binary full path.
     *
     * @method FfmpegCommand#setFlvtoolPath
     *
     * @param {String} flvtool The full path to the flvtool2 or flvmeta binary.
     * @return FfmpegCommand
     */ proto.setFlvtoolPath = function (flvtool) {
      $fbe0c5f28b372c17$var$cache.flvtoolPath = flvtool;
      return this;
    };
    /**
     * Forget executable paths
     *
     * (only used for testing purposes)
     *
     * @method FfmpegCommand#_forgetPaths
     * @private
     */ proto._forgetPaths = function () {
      delete $fbe0c5f28b372c17$var$cache.ffmpegPath;
      delete $fbe0c5f28b372c17$var$cache.ffprobePath;
      delete $fbe0c5f28b372c17$var$cache.flvtoolPath;
    };
    /**
     * Check for ffmpeg availability
     *
     * If the FFMPEG_PATH environment variable is set, try to use it.
     * If it is unset or incorrect, try to find ffmpeg in the PATH instead.
     *
     * @method FfmpegCommand#_getFfmpegPath
     * @param {Function} callback callback with signature (err, path)
     * @private
     */ proto._getFfmpegPath = function (callback) {
      if ("ffmpegPath" in $fbe0c5f28b372c17$var$cache)
        return callback(null, $fbe0c5f28b372c17$var$cache.ffmpegPath);
      $aK4hl.waterfall(
        [
          // Try FFMPEG_PATH
          function (cb) {
            cb(null, "");
          },
          // Search in the PATH
          function (ffmpeg, cb) {
            if (ffmpeg.length) return cb(null, ffmpeg);
            $gOWQU.which("ffmpeg", function (err, ffmpeg) {
              cb(err, ffmpeg);
            });
          },
        ],
        function (err, ffmpeg) {
          if (err) callback(err);
          else
            callback(
              null,
              ($fbe0c5f28b372c17$var$cache.ffmpegPath = ffmpeg || "")
            );
        }
      );
    };
    /**
     * Check for ffprobe availability
     *
     * If the FFPROBE_PATH environment variable is set, try to use it.
     * If it is unset or incorrect, try to find ffprobe in the PATH instead.
     * If this still fails, try to find ffprobe in the same directory as ffmpeg.
     *
     * @method FfmpegCommand#_getFfprobePath
     * @param {Function} callback callback with signature (err, path)
     * @private
     */ proto._getFfprobePath = function (callback) {
      var self = this;
      if ("ffprobePath" in $fbe0c5f28b372c17$var$cache)
        return callback(null, $fbe0c5f28b372c17$var$cache.ffprobePath);
      $aK4hl.waterfall(
        [
          // Try FFPROBE_PATH
          function (cb) {
            cb(null, "");
          },
          // Search in the PATH
          function (ffprobe, cb) {
            if (ffprobe.length) return cb(null, ffprobe);
            $gOWQU.which("ffprobe", function (err, ffprobe) {
              cb(err, ffprobe);
            });
          },
          // Search in the same directory as ffmpeg
          function (ffprobe, cb) {
            if (ffprobe.length) return cb(null, ffprobe);
            self._getFfmpegPath(function (err, ffmpeg) {
              if (err) cb(err);
              else if (ffmpeg.length) {
                var name = $gOWQU.isWindows ? "ffprobe.exe" : "ffprobe";
                var ffprobe = $bFvJb$path.join(
                  $bFvJb$path.dirname(ffmpeg),
                  name
                );
                $bFvJb$fs.exists(ffprobe, function (exists) {
                  cb(null, exists ? ffprobe : "");
                });
              } else cb(null, "");
            });
          },
        ],
        function (err, ffprobe) {
          if (err) callback(err);
          else
            callback(
              null,
              ($fbe0c5f28b372c17$var$cache.ffprobePath = ffprobe || "")
            );
        }
      );
    };
    /**
     * Check for flvtool2/flvmeta availability
     *
     * If the FLVTOOL2_PATH or FLVMETA_PATH environment variable are set, try to use them.
     * If both are either unset or incorrect, try to find flvtool2 or flvmeta in the PATH instead.
     *
     * @method FfmpegCommand#_getFlvtoolPath
     * @param {Function} callback callback with signature (err, path)
     * @private
     */ proto._getFlvtoolPath = function (callback) {
      if ("flvtoolPath" in $fbe0c5f28b372c17$var$cache)
        return callback(null, $fbe0c5f28b372c17$var$cache.flvtoolPath);
      $aK4hl.waterfall(
        [
          // Try FLVMETA_PATH
          function (cb) {
            cb(null, "");
          },
          // Try FLVTOOL2_PATH
          function (flvtool, cb) {
            if (flvtool.length) return cb(null, flvtool);
            cb(null, "");
          },
          // Search for flvmeta in the PATH
          function (flvtool, cb) {
            if (flvtool.length) return cb(null, flvtool);
            $gOWQU.which("flvmeta", function (err, flvmeta) {
              cb(err, flvmeta);
            });
          },
          // Search for flvtool2 in the PATH
          function (flvtool, cb) {
            if (flvtool.length) return cb(null, flvtool);
            $gOWQU.which("flvtool2", function (err, flvtool2) {
              cb(err, flvtool2);
            });
          },
        ],
        function (err, flvtool) {
          if (err) callback(err);
          else
            callback(
              null,
              ($fbe0c5f28b372c17$var$cache.flvtoolPath = flvtool || "")
            );
        }
      );
    };
    /**
     * A callback passed to {@link FfmpegCommand#availableFilters}.
     *
     * @callback FfmpegCommand~filterCallback
     * @param {Error|null} err error object or null if no error happened
     * @param {Object} filters filter object with filter names as keys and the following
     *   properties for each filter:
     * @param {String} filters.description filter description
     * @param {String} filters.input input type, one of 'audio', 'video' and 'none'
     * @param {Boolean} filters.multipleInputs whether the filter supports multiple inputs
     * @param {String} filters.output output type, one of 'audio', 'video' and 'none'
     * @param {Boolean} filters.multipleOutputs whether the filter supports multiple outputs
     */ /**
     * Query ffmpeg for available filters
     *
     * @method FfmpegCommand#availableFilters
     * @category Capabilities
     * @aliases getAvailableFilters
     *
     * @param {FfmpegCommand~filterCallback} callback callback function
     */ proto.availableFilters = proto.getAvailableFilters = function (
      callback
    ) {
      if ("filters" in $fbe0c5f28b372c17$var$cache)
        return callback(null, $fbe0c5f28b372c17$var$cache.filters);
      this._spawnFfmpeg(
        ["-filters"],
        {
          captureStdout: true,
          stdoutLines: 0,
        },
        function (err, stdoutRing) {
          if (err) return callback(err);
          var stdout = stdoutRing.get();
          var lines = stdout.split("\n");
          var data = {};
          var types = {
            A: "audio",
            V: "video",
            "|": "none",
          };
          lines.forEach(function (line) {
            var match = line.match($fbe0c5f28b372c17$var$filterRegexp);
            if (match)
              data[match[1]] = {
                description: match[4],
                input: types[match[2].charAt(0)],
                multipleInputs: match[2].length > 1,
                output: types[match[3].charAt(0)],
                multipleOutputs: match[3].length > 1,
              };
          });
          callback(null, ($fbe0c5f28b372c17$var$cache.filters = data));
        }
      );
    };
    /**
     * A callback passed to {@link FfmpegCommand#availableCodecs}.
     *
     * @callback FfmpegCommand~codecCallback
     * @param {Error|null} err error object or null if no error happened
     * @param {Object} codecs codec object with codec names as keys and the following
     *   properties for each codec (more properties may be available depending on the
     *   ffmpeg version used):
     * @param {String} codecs.description codec description
     * @param {Boolean} codecs.canDecode whether the codec is able to decode streams
     * @param {Boolean} codecs.canEncode whether the codec is able to encode streams
     */ /**
     * Query ffmpeg for available codecs
     *
     * @method FfmpegCommand#availableCodecs
     * @category Capabilities
     * @aliases getAvailableCodecs
     *
     * @param {FfmpegCommand~codecCallback} callback callback function
     */ proto.availableCodecs = proto.getAvailableCodecs = function (callback) {
      if ("codecs" in $fbe0c5f28b372c17$var$cache)
        return callback(null, $fbe0c5f28b372c17$var$cache.codecs);
      this._spawnFfmpeg(
        ["-codecs"],
        {
          captureStdout: true,
          stdoutLines: 0,
        },
        function (err, stdoutRing) {
          if (err) return callback(err);
          var stdout = stdoutRing.get();
          var lines = stdout.split($fbe0c5f28b372c17$var$lineBreakRegexp);
          var data = {};
          lines.forEach(function (line) {
            var match = line.match($fbe0c5f28b372c17$var$avCodecRegexp);
            if (match && match[7] !== "=")
              data[match[7]] = {
                type: {
                  V: "video",
                  A: "audio",
                  S: "subtitle",
                }[match[3]],
                description: match[8],
                canDecode: match[1] === "D",
                canEncode: match[2] === "E",
                drawHorizBand: match[4] === "S",
                directRendering: match[5] === "D",
                weirdFrameTruncation: match[6] === "T",
              };
            match = line.match($fbe0c5f28b372c17$var$ffCodecRegexp);
            if (match && match[7] !== "=") {
              var codecData = (data[match[7]] = {
                type: {
                  V: "video",
                  A: "audio",
                  S: "subtitle",
                }[match[3]],
                description: match[8],
                canDecode: match[1] === "D",
                canEncode: match[2] === "E",
                intraFrameOnly: match[4] === "I",
                isLossy: match[5] === "L",
                isLossless: match[6] === "S",
              });
              var encoders = codecData.description.match(
                $fbe0c5f28b372c17$var$ffEncodersRegexp
              );
              encoders = encoders ? encoders[1].trim().split(" ") : [];
              var decoders = codecData.description.match(
                $fbe0c5f28b372c17$var$ffDecodersRegexp
              );
              decoders = decoders ? decoders[1].trim().split(" ") : [];
              if (encoders.length || decoders.length) {
                var coderData = {};
                $gOWQU.copy(codecData, coderData);
                delete coderData.canEncode;
                delete coderData.canDecode;
                encoders.forEach(function (name) {
                  data[name] = {};
                  $gOWQU.copy(coderData, data[name]);
                  data[name].canEncode = true;
                });
                decoders.forEach(function (name) {
                  if (name in data) data[name].canDecode = true;
                  else {
                    data[name] = {};
                    $gOWQU.copy(coderData, data[name]);
                    data[name].canDecode = true;
                  }
                });
              }
            }
          });
          callback(null, ($fbe0c5f28b372c17$var$cache.codecs = data));
        }
      );
    };
    /**
     * A callback passed to {@link FfmpegCommand#availableEncoders}.
     *
     * @callback FfmpegCommand~encodersCallback
     * @param {Error|null} err error object or null if no error happened
     * @param {Object} encoders encoders object with encoder names as keys and the following
     *   properties for each encoder:
     * @param {String} encoders.description codec description
     * @param {Boolean} encoders.type "audio", "video" or "subtitle"
     * @param {Boolean} encoders.frameMT whether the encoder is able to do frame-level multithreading
     * @param {Boolean} encoders.sliceMT whether the encoder is able to do slice-level multithreading
     * @param {Boolean} encoders.experimental whether the encoder is experimental
     * @param {Boolean} encoders.drawHorizBand whether the encoder supports draw_horiz_band
     * @param {Boolean} encoders.directRendering whether the encoder supports direct encoding method 1
     */ /**
     * Query ffmpeg for available encoders
     *
     * @method FfmpegCommand#availableEncoders
     * @category Capabilities
     * @aliases getAvailableEncoders
     *
     * @param {FfmpegCommand~encodersCallback} callback callback function
     */ proto.availableEncoders = proto.getAvailableEncoders = function (
      callback
    ) {
      if ("encoders" in $fbe0c5f28b372c17$var$cache)
        return callback(null, $fbe0c5f28b372c17$var$cache.encoders);
      this._spawnFfmpeg(
        ["-encoders"],
        {
          captureStdout: true,
          stdoutLines: 0,
        },
        function (err, stdoutRing) {
          if (err) return callback(err);
          var stdout = stdoutRing.get();
          var lines = stdout.split($fbe0c5f28b372c17$var$lineBreakRegexp);
          var data = {};
          lines.forEach(function (line) {
            var match = line.match($fbe0c5f28b372c17$var$encodersRegexp);
            if (match && match[7] !== "=")
              data[match[7]] = {
                type: {
                  V: "video",
                  A: "audio",
                  S: "subtitle",
                }[match[1]],
                description: match[8],
                frameMT: match[2] === "F",
                sliceMT: match[3] === "S",
                experimental: match[4] === "X",
                drawHorizBand: match[5] === "B",
                directRendering: match[6] === "D",
              };
          });
          callback(null, ($fbe0c5f28b372c17$var$cache.encoders = data));
        }
      );
    };
    /**
     * A callback passed to {@link FfmpegCommand#availableFormats}.
     *
     * @callback FfmpegCommand~formatCallback
     * @param {Error|null} err error object or null if no error happened
     * @param {Object} formats format object with format names as keys and the following
     *   properties for each format:
     * @param {String} formats.description format description
     * @param {Boolean} formats.canDemux whether the format is able to demux streams from an input file
     * @param {Boolean} formats.canMux whether the format is able to mux streams into an output file
     */ /**
     * Query ffmpeg for available formats
     *
     * @method FfmpegCommand#availableFormats
     * @category Capabilities
     * @aliases getAvailableFormats
     *
     * @param {FfmpegCommand~formatCallback} callback callback function
     */ proto.availableFormats = proto.getAvailableFormats = function (
      callback
    ) {
      if ("formats" in $fbe0c5f28b372c17$var$cache)
        return callback(null, $fbe0c5f28b372c17$var$cache.formats);
      // Run ffmpeg -formats
      this._spawnFfmpeg(
        ["-formats"],
        {
          captureStdout: true,
          stdoutLines: 0,
        },
        function (err, stdoutRing) {
          if (err) return callback(err);
          // Parse output
          var stdout = stdoutRing.get();
          var lines = stdout.split($fbe0c5f28b372c17$var$lineBreakRegexp);
          var data = {};
          lines.forEach(function (line) {
            var match = line.match($fbe0c5f28b372c17$var$formatRegexp);
            if (match)
              match[3].split(",").forEach(function (format) {
                if (!(format in data))
                  data[format] = {
                    description: match[4],
                    canDemux: false,
                    canMux: false,
                  };
                if (match[1] === "D") data[format].canDemux = true;
                if (match[2] === "E") data[format].canMux = true;
              });
          });
          callback(null, ($fbe0c5f28b372c17$var$cache.formats = data));
        }
      );
    };
    /**
     * Check capabilities before executing a command
     *
     * Checks whether all used codecs and formats are indeed available
     *
     * @method FfmpegCommand#_checkCapabilities
     * @param {Function} callback callback with signature (err)
     * @private
     */ proto._checkCapabilities = function (callback) {
      var self = this;
      $aK4hl.waterfall(
        [
          // Get available formats
          function (cb) {
            self.availableFormats(cb);
          },
          // Check whether specified formats are available
          function (formats, cb) {
            var unavailable;
            // Output format(s)
            unavailable = self._outputs.reduce(function (fmts, output) {
              var format = output.options.find("-f", 1);
              if (format) {
                if (!(format[0] in formats) || !formats[format[0]].canMux)
                  fmts.push(format);
              }
              return fmts;
            }, []);
            if (unavailable.length === 1)
              return cb(
                new Error(
                  "Output format " + unavailable[0] + " is not available"
                )
              );
            else if (unavailable.length > 1)
              return cb(
                new Error(
                  "Output formats " +
                    unavailable.join(", ") +
                    " are not available"
                )
              );
            // Input format(s)
            unavailable = self._inputs.reduce(function (fmts, input) {
              var format = input.options.find("-f", 1);
              if (format) {
                if (!(format[0] in formats) || !formats[format[0]].canDemux)
                  fmts.push(format[0]);
              }
              return fmts;
            }, []);
            if (unavailable.length === 1)
              return cb(
                new Error(
                  "Input format " + unavailable[0] + " is not available"
                )
              );
            else if (unavailable.length > 1)
              return cb(
                new Error(
                  "Input formats " +
                    unavailable.join(", ") +
                    " are not available"
                )
              );
            cb();
          },
          // Get available codecs
          function (cb) {
            self.availableEncoders(cb);
          },
          // Check whether specified codecs are available and add strict experimental options if needed
          function (encoders, cb) {
            var unavailable;
            // Audio codec(s)
            unavailable = self._outputs.reduce(function (cdcs, output) {
              var acodec = output.audio.find("-acodec", 1);
              if (acodec && acodec[0] !== "copy") {
                if (
                  !(acodec[0] in encoders) ||
                  encoders[acodec[0]].type !== "audio"
                )
                  cdcs.push(acodec[0]);
              }
              return cdcs;
            }, []);
            if (unavailable.length === 1)
              return cb(
                new Error("Audio codec " + unavailable[0] + " is not available")
              );
            else if (unavailable.length > 1)
              return cb(
                new Error(
                  "Audio codecs " +
                    unavailable.join(", ") +
                    " are not available"
                )
              );
            // Video codec(s)
            unavailable = self._outputs.reduce(function (cdcs, output) {
              var vcodec = output.video.find("-vcodec", 1);
              if (vcodec && vcodec[0] !== "copy") {
                if (
                  !(vcodec[0] in encoders) ||
                  encoders[vcodec[0]].type !== "video"
                )
                  cdcs.push(vcodec[0]);
              }
              return cdcs;
            }, []);
            if (unavailable.length === 1)
              return cb(
                new Error("Video codec " + unavailable[0] + " is not available")
              );
            else if (unavailable.length > 1)
              return cb(
                new Error(
                  "Video codecs " +
                    unavailable.join(", ") +
                    " are not available"
                )
              );
            cb();
          },
        ],
        callback
      );
    };
  };
});

parcelRequire.register("2LqKM", function (module, exports) {
  /*jshint node:true, laxcomma:true*/ "use strict";

  var $2034b945367a7922$require$spawn = $bFvJb$child_process.spawn;
  function $2034b945367a7922$var$legacyTag(key) {
    return key.match(/^TAG:/);
  }
  function $2034b945367a7922$var$legacyDisposition(key) {
    return key.match(/^DISPOSITION:/);
  }
  function $2034b945367a7922$var$parseFfprobeOutput(out) {
    var lines = out.split(/\r\n|\r|\n/);
    lines = lines.filter(function (line) {
      return line.length > 0;
    });
    var data = {
      streams: [],
      format: {},
      chapters: [],
    };
    function parseBlock(name) {
      var data = {};
      var line = lines.shift();
      while (typeof line !== "undefined") {
        if (line.toLowerCase() == "[/" + name + "]") return data;
        else if (line.match(/^\[/)) {
          line = lines.shift();
          continue;
        }
        var kv = line.match(/^([^=]+)=(.*)$/);
        if (kv) {
          if (!kv[1].match(/^TAG:/) && kv[2].match(/^[0-9]+(\.[0-9]+)?$/))
            data[kv[1]] = Number(kv[2]);
          else data[kv[1]] = kv[2];
        }
        line = lines.shift();
      }
      return data;
    }
    var line = lines.shift();
    while (typeof line !== "undefined") {
      if (line.match(/^\[stream/i)) {
        var stream = parseBlock("stream");
        data.streams.push(stream);
      } else if (line.match(/^\[chapter/i)) {
        var chapter = parseBlock("chapter");
        data.chapters.push(chapter);
      } else if (line.toLowerCase() === "[format]")
        data.format = parseBlock("format");
      line = lines.shift();
    }
    return data;
  }
  module.exports = function (proto) {
    /**
     * A callback passed to the {@link FfmpegCommand#ffprobe} method.
     *
     * @callback FfmpegCommand~ffprobeCallback
     *
     * @param {Error|null} err error object or null if no error happened
     * @param {Object} ffprobeData ffprobe output data; this object
     *   has the same format as what the following command returns:
     *
     *     `ffprobe -print_format json -show_streams -show_format INPUTFILE`
     * @param {Array} ffprobeData.streams stream information
     * @param {Object} ffprobeData.format format information
     */ /**
     * Run ffprobe on last specified input
     *
     * @method FfmpegCommand#ffprobe
     * @category Metadata
     *
     * @param {?Number} [index] 0-based index of input to probe (defaults to last input)
     * @param {?String[]} [options] array of output options to return
     * @param {FfmpegCommand~ffprobeCallback} callback callback function
     *
     */ proto.ffprobe = function () {
      var input,
        index = null,
        options = [],
        callback;
      // the last argument should be the callback
      var callback = arguments[arguments.length - 1];
      var ended = false;
      function handleCallback(err, data) {
        if (!ended) {
          ended = true;
          callback(err, data);
        }
      }
      // map the arguments to the correct variable names
      switch (arguments.length) {
        case 3:
          index = arguments[0];
          options = arguments[1];
          break;
        case 2:
          if (typeof arguments[0] === "number") index = arguments[0];
          else if (Array.isArray(arguments[0])) options = arguments[0];
          break;
      }
      if (index === null) {
        if (!this._currentInput)
          return handleCallback(new Error("No input specified"));
        input = this._currentInput;
      } else {
        input = this._inputs[index];
        if (!input) return handleCallback(new Error("Invalid input index"));
      }
      // Find ffprobe
      this._getFfprobePath(function (err, path) {
        if (err) return handleCallback(err);
        else if (!path) return handleCallback(new Error("Cannot find ffprobe"));
        var stdout = "";
        var stdoutClosed = false;
        var stderr = "";
        var stderrClosed = false;
        // Spawn ffprobe
        var src = input.isStream ? "pipe:0" : input.source;
        var ffprobe = $2034b945367a7922$require$spawn(
          path,
          ["-show_streams", "-show_format"].concat(options, src)
        );
        if (input.isStream) {
          // Skip errors on stdin. These get thrown when ffprobe is complete and
          // there seems to be no way hook in and close stdin before it throws.
          ffprobe.stdin.on("error", function (err) {
            if (["ECONNRESET", "EPIPE"].indexOf(err.code) >= 0) return;
            handleCallback(err);
          });
          // Once ffprobe's input stream closes, we need no more data from the
          // input
          ffprobe.stdin.on("close", function () {
            input.source.pause();
            input.source.unpipe(ffprobe.stdin);
          });
          input.source.pipe(ffprobe.stdin);
        }
        ffprobe.on("error", callback);
        // Ensure we wait for captured streams to end before calling callback
        var exitError = null;
        function handleExit(err) {
          if (err) exitError = err;
          if (processExited && stdoutClosed && stderrClosed) {
            if (exitError) {
              if (stderr) exitError.message += "\n" + stderr;
              return handleCallback(exitError);
            }
            // Process output
            var data = $2034b945367a7922$var$parseFfprobeOutput(stdout);
            // Handle legacy output with "TAG:x" and "DISPOSITION:x" keys
            [data.format].concat(data.streams).forEach(function (target) {
              if (target) {
                var legacyTagKeys = Object.keys(target).filter(
                  $2034b945367a7922$var$legacyTag
                );
                if (legacyTagKeys.length) {
                  target.tags = target.tags || {};
                  legacyTagKeys.forEach(function (tagKey) {
                    target.tags[tagKey.substr(4)] = target[tagKey];
                    delete target[tagKey];
                  });
                }
                var legacyDispositionKeys = Object.keys(target).filter(
                  $2034b945367a7922$var$legacyDisposition
                );
                if (legacyDispositionKeys.length) {
                  target.disposition = target.disposition || {};
                  legacyDispositionKeys.forEach(function (dispositionKey) {
                    target.disposition[dispositionKey.substr(12)] =
                      target[dispositionKey];
                    delete target[dispositionKey];
                  });
                }
              }
            });
            handleCallback(null, data);
          }
        }
        // Handle ffprobe exit
        var processExited = false;
        ffprobe.on("exit", function (code, signal) {
          processExited = true;
          if (code) handleExit(new Error("ffprobe exited with code " + code));
          else if (signal)
            handleExit(new Error("ffprobe was killed with signal " + signal));
          else handleExit();
        });
        // Handle stdout/stderr streams
        ffprobe.stdout.on("data", function (data) {
          stdout += data;
        });
        ffprobe.stdout.on("close", function () {
          stdoutClosed = true;
          handleExit();
        });
        ffprobe.stderr.on("data", function (data) {
          stderr += data;
        });
        ffprobe.stderr.on("close", function () {
          stderrClosed = true;
          handleExit();
        });
      });
    };
  };
});

parcelRequire.register("adNg8", function (module, exports) {
  /*jshint node:true*/
  "use strict";

  var $7711541dd02fffe6$require$PassThrough = $bFvJb$stream.PassThrough;

  var $aK4hl = parcelRequire("aK4hl");

  var $gOWQU = parcelRequire("gOWQU");
  /*
   * Useful recipes for commands
   */ module.exports = function recipes(proto) {
    /**
     * Execute ffmpeg command and save output to a file
     *
     * @method FfmpegCommand#save
     * @category Processing
     * @aliases saveToFile
     *
     * @param {String} output file path
     * @return FfmpegCommand
     */ proto.saveToFile = proto.save = function (output) {
      this.output(output).run();
      return this;
    };
    /**
     * Execute ffmpeg command and save output to a stream
     *
     * If 'stream' is not specified, a PassThrough stream is created and returned.
     * 'options' will be used when piping ffmpeg output to the output stream
     * (@see http://nodejs.org/api/stream.html#stream_readable_pipe_destination_options)
     *
     * @method FfmpegCommand#pipe
     * @category Processing
     * @aliases stream,writeToStream
     *
     * @param {stream.Writable} [stream] output stream
     * @param {Object} [options={}] pipe options
     * @return Output stream
     */ proto.writeToStream =
      proto.pipe =
      proto.stream =
        function (stream, options) {
          if (stream && !("writable" in stream)) {
            options = stream;
            stream = undefined;
          }
          if (!stream) {
            if ($bFvJb$process.version.match(/v0\.8\./))
              throw new Error(
                "PassThrough stream is not supported on node v0.8"
              );
            stream = new $7711541dd02fffe6$require$PassThrough();
          }
          this.output(stream, options).run();
          return stream;
        };
    /**
     * Generate images from a video
     *
     * Note: this method makes the command emit a 'filenames' event with an array of
     * the generated image filenames.
     *
     * @method FfmpegCommand#screenshots
     * @category Processing
     * @aliases takeScreenshots,thumbnail,thumbnails,screenshot
     *
     * @param {Number|Object} [config=1] screenshot count or configuration object with
     *   the following keys:
     * @param {Number} [config.count] number of screenshots to take; using this option
     *   takes screenshots at regular intervals (eg. count=4 would take screens at 20%, 40%,
     *   60% and 80% of the video length).
     * @param {String} [config.folder='.'] output folder
     * @param {String} [config.filename='tn.png'] output filename pattern, may contain the following
     *   tokens:
     *   - '%s': offset in seconds
     *   - '%w': screenshot width
     *   - '%h': screenshot height
     *   - '%r': screenshot resolution (same as '%wx%h')
     *   - '%f': input filename
     *   - '%b': input basename (filename w/o extension)
     *   - '%i': index of screenshot in timemark array (can be zero-padded by using it like `%000i`)
     * @param {Number[]|String[]} [config.timemarks] array of timemarks to take screenshots
     *   at; each timemark may be a number of seconds, a '[[hh:]mm:]ss[.xxx]' string or a
     *   'XX%' string.  Overrides 'count' if present.
     * @param {Number[]|String[]} [config.timestamps] alias for 'timemarks'
     * @param {Boolean} [config.fastSeek] use fast seek (less accurate)
     * @param {String} [config.size] screenshot size, with the same syntax as {@link FfmpegCommand#size}
     * @param {String} [folder] output folder (legacy alias for 'config.folder')
     * @return FfmpegCommand
     */ proto.takeScreenshots =
      proto.thumbnail =
      proto.thumbnails =
      proto.screenshot =
      proto.screenshots =
        function (config, folder) {
          var self = this;
          var source = this._currentInput.source;
          config = config || {
            count: 1,
          };
          // Accept a number of screenshots instead of a config object
          if (typeof config === "number")
            config = {
              count: config,
            };
          // Accept a second 'folder' parameter instead of config.folder
          if (!("folder" in config)) config.folder = folder || ".";
          // Accept 'timestamps' instead of 'timemarks'
          if ("timestamps" in config) config.timemarks = config.timestamps;
          // Compute timemarks from count if not present
          if (!("timemarks" in config)) {
            if (!config.count)
              throw new Error(
                "Cannot take screenshots: neither a count nor a timemark list are specified"
              );
            var interval = 100 / (1 + config.count);
            config.timemarks = [];
            for (var i = 0; i < config.count; i++)
              config.timemarks.push(interval * (i + 1) + "%");
          }
          // Parse size option
          if ("size" in config) {
            var fixedSize = config.size.match(/^(\d+)x(\d+)$/);
            var fixedWidth = config.size.match(/^(\d+)x\?$/);
            var fixedHeight = config.size.match(/^\?x(\d+)$/);
            var percentSize = config.size.match(/^(\d+)%$/);
            if (!fixedSize && !fixedWidth && !fixedHeight && !percentSize)
              throw new Error("Invalid size parameter: " + config.size);
          }
          // Metadata helper
          var metadata;
          function getMetadata(cb) {
            if (metadata) cb(null, metadata);
            else
              self.ffprobe(function (err, meta) {
                metadata = meta;
                cb(err, meta);
              });
          }
          $aK4hl.waterfall(
            [
              // Compute percent timemarks if any
              function computeTimemarks(next) {
                if (
                  config.timemarks.some(function (t) {
                    return ("" + t).match(/^[\d.]+%$/);
                  })
                ) {
                  if (typeof source !== "string")
                    return next(
                      new Error(
                        "Cannot compute screenshot timemarks with an input stream, please specify fixed timemarks"
                      )
                    );
                  getMetadata(function (err, meta) {
                    if (err) next(err);
                    else {
                      // Select video stream with the highest resolution
                      var vstream = meta.streams.reduce(
                        function (biggest, stream) {
                          if (
                            stream.codec_type === "video" &&
                            stream.width * stream.height >
                              biggest.width * biggest.height
                          )
                            return stream;
                          else return biggest;
                        },
                        {
                          width: 0,
                          height: 0,
                        }
                      );
                      if (vstream.width === 0)
                        return next(
                          new Error(
                            "No video stream in input, cannot take screenshots"
                          )
                        );
                      var duration = Number(vstream.duration);
                      if (isNaN(duration))
                        duration = Number(meta.format.duration);
                      if (isNaN(duration))
                        return next(
                          new Error(
                            "Could not get input duration, please specify fixed timemarks"
                          )
                        );
                      config.timemarks = config.timemarks.map(function (mark) {
                        if (("" + mark).match(/^([\d.]+)%$/))
                          return (duration * parseFloat(mark)) / 100;
                        else return mark;
                      });
                      next();
                    }
                  });
                } else next();
              },
              // Turn all timemarks into numbers and sort them
              function normalizeTimemarks(next) {
                config.timemarks = config.timemarks
                  .map(function (mark) {
                    return $gOWQU.timemarkToSeconds(mark);
                  })
                  .sort(function (a, b) {
                    return a - b;
                  });
                next();
              },
              // Add '_%i' to pattern when requesting multiple screenshots and no variable token is present
              function fixPattern(next) {
                var pattern = config.filename || "tn.png";
                if (pattern.indexOf(".") === -1) pattern += ".png";
                if (config.timemarks.length > 1 && !pattern.match(/%(s|0*i)/)) {
                  var ext = $bFvJb$path.extname(pattern);
                  pattern = $bFvJb$path.join(
                    $bFvJb$path.dirname(pattern),
                    $bFvJb$path.basename(pattern, ext) + "_%i" + ext
                  );
                }
                next(null, pattern);
              },
              // Replace filename tokens (%f, %b) in pattern
              function replaceFilenameTokens(pattern, next) {
                if (pattern.match(/%[bf]/)) {
                  if (typeof source !== "string")
                    return next(
                      new Error(
                        "Cannot replace %f or %b when using an input stream"
                      )
                    );
                  pattern = pattern
                    .replace(/%f/g, $bFvJb$path.basename(source))
                    .replace(
                      /%b/g,
                      $bFvJb$path.basename(source, $bFvJb$path.extname(source))
                    );
                }
                next(null, pattern);
              },
              // Compute size if needed
              function getSize(pattern, next) {
                if (pattern.match(/%[whr]/)) {
                  if (fixedSize)
                    return next(null, pattern, fixedSize[1], fixedSize[2]);
                  getMetadata(function (err, meta) {
                    if (err)
                      return next(
                        new Error(
                          "Could not determine video resolution to replace %w, %h or %r"
                        )
                      );
                    var vstream = meta.streams.reduce(
                      function (biggest, stream) {
                        if (
                          stream.codec_type === "video" &&
                          stream.width * stream.height >
                            biggest.width * biggest.height
                        )
                          return stream;
                        else return biggest;
                      },
                      {
                        width: 0,
                        height: 0,
                      }
                    );
                    if (vstream.width === 0)
                      return next(
                        new Error(
                          "No video stream in input, cannot replace %w, %h or %r"
                        )
                      );
                    var width = vstream.width;
                    var height = vstream.height;
                    if (fixedWidth) {
                      height = (height * Number(fixedWidth[1])) / width;
                      width = Number(fixedWidth[1]);
                    } else if (fixedHeight) {
                      width = (width * Number(fixedHeight[1])) / height;
                      height = Number(fixedHeight[1]);
                    } else if (percentSize) {
                      width = (width * Number(percentSize[1])) / 100;
                      height = (height * Number(percentSize[1])) / 100;
                    }
                    next(
                      null,
                      pattern,
                      Math.round(width / 2) * 2,
                      Math.round(height / 2) * 2
                    );
                  });
                } else next(null, pattern, -1, -1);
              },
              // Replace size tokens (%w, %h, %r) in pattern
              function replaceSizeTokens(pattern, width, height, next) {
                pattern = pattern
                  .replace(/%r/g, "%wx%h")
                  .replace(/%w/g, width)
                  .replace(/%h/g, height);
                next(null, pattern);
              },
              // Replace variable tokens in pattern (%s, %i) and generate filename list
              function replaceVariableTokens(pattern, next) {
                var filenames = config.timemarks.map(function (t, i) {
                  return pattern
                    .replace(/%s/g, $gOWQU.timemarkToSeconds(t))
                    .replace(/%(0*)i/g, function (match, padding) {
                      var idx = "" + (i + 1);
                      return (
                        padding.substr(
                          0,
                          Math.max(0, padding.length + 1 - idx.length)
                        ) + idx
                      );
                    });
                });
                self.emit("filenames", filenames);
                next(null, filenames);
              },
              // Create output directory
              function createDirectory(filenames, next) {
                $bFvJb$fs.exists(config.folder, function (exists) {
                  if (!exists)
                    $bFvJb$fs.mkdir(config.folder, function (err) {
                      if (err) next(err);
                      else next(null, filenames);
                    });
                  else next(null, filenames);
                });
              },
            ],
            function runCommand(err, filenames) {
              if (err) return self.emit("error", err);
              var count = config.timemarks.length;
              var split;
              var filters = [
                (split = {
                  filter: "split",
                  options: count,
                  outputs: [],
                }),
              ];
              if ("size" in config) {
                // Set size to generate size filters
                self.size(config.size);
                // Get size filters and chain them with 'sizeN' stream names
                var sizeFilters = self._currentOutput.sizeFilters
                  .get()
                  .map(function (f, i) {
                    if (i > 0) f.inputs = "size" + (i - 1);
                    f.outputs = "size" + i;
                    return f;
                  });
                // Input last size filter output into split filter
                split.inputs = "size" + (sizeFilters.length - 1);
                // Add size filters in front of split filter
                filters = sizeFilters.concat(filters);
                // Remove size filters
                self._currentOutput.sizeFilters.clear();
              }
              var first = 0;
              for (var i = 0; i < count; i++) {
                var stream = "screen" + i;
                split.outputs.push(stream);
                if (i === 0) {
                  first = config.timemarks[i];
                  self.seekInput(first);
                }
                self
                  .output($bFvJb$path.join(config.folder, filenames[i]))
                  .frames(1)
                  .map(stream);
                if (i > 0) self.seek(config.timemarks[i] - first);
              }
              self.complexFilter(filters);
              self.run();
            }
          );
          return this;
        };
    /**
     * Merge (concatenate) inputs to a single file
     *
     * @method FfmpegCommand#concat
     * @category Processing
     * @aliases concatenate,mergeToFile
     *
     * @param {String|Writable} target output file or writable stream
     * @param {Object} [options] pipe options (only used when outputting to a writable stream)
     * @return FfmpegCommand
     */ proto.mergeToFile =
      proto.concatenate =
      proto.concat =
        function (target, options) {
          // Find out which streams are present in the first non-stream input
          var fileInput = this._inputs.filter(function (input) {
            return !input.isStream;
          })[0];
          var self = this;
          this.ffprobe(this._inputs.indexOf(fileInput), function (err, data) {
            if (err) return self.emit("error", err);
            var hasAudioStreams = data.streams.some(function (stream) {
              return stream.codec_type === "audio";
            });
            var hasVideoStreams = data.streams.some(function (stream) {
              return stream.codec_type === "video";
            });
            // Setup concat filter and start processing
            self
              .output(target, options)
              .complexFilter({
                filter: "concat",
                options: {
                  n: self._inputs.length,
                  v: hasVideoStreams ? 1 : 0,
                  a: hasAudioStreams ? 1 : 0,
                },
              })
              .run();
          });
          return this;
        };
  };
});

var $383e46f26d360885$require$Buffer = $bFvJb$buffer.Buffer;

const $383e46f26d360885$var$exec = $bFvJb$util.promisify(
  $bFvJb$child_process.exec
);

var $eebb97b722c83852$exports = {};

var $eebb97b722c83852$require$PassThrough = $bFvJb$stream.PassThrough;
var $2cd12ba1b1bd64cd$exports = {};

var $1Vc1h = parcelRequire("1Vc1h");

var $7XA7f = parcelRequire("7XA7f");
/**
 * Extract string inbetween another.
 *
 * @param {string} haystack
 * @param {string} left
 * @param {string} right
 * @returns {string}
 */ var $9e487c419ed1bfee$export$cf95c51b03f10bae;
/**
 * Get a number from an abbreviated number string.
 *
 * @param {string} string
 * @returns {number}
 */ var $9e487c419ed1bfee$export$f18057c1757876c5;
/**
 * Match begin and end braces of input JS, return only JS
 *
 * @param {string} mixedJson
 * @returns {string}
 */ var $9e487c419ed1bfee$export$beb63bc92c294b1d;
/**
 * Checks if there is a playability error.
 *
 * @param {Object} player_response
 * @param {Array.<string>} statuses
 * @param {Error} ErrorType
 * @returns {!Error}
 */ var $9e487c419ed1bfee$export$8d19b782e6cae425;
/**
 * Does a miniget request and calls options.requestCallback if present
 *
 * @param {string} url the request url
 * @param {Object} options an object with optional requestOptions and requestCallback parameters
 * @param {Object} requestOptionsOverwrite overwrite of options.requestOptions
 * @returns {miniget.Stream}
 */ var $9e487c419ed1bfee$export$cbbbf91b85781804;
/**
 * Temporary helper to help deprecating a few properties.
 *
 * @param {Object} obj
 * @param {string} prop
 * @param {Object} value
 * @param {string} oldPath
 * @param {string} newPath
 */ var $9e487c419ed1bfee$export$b680e6b2c82f8c2f;
var $9e487c419ed1bfee$export$6ccd8c5da0dcc4f;
var $9e487c419ed1bfee$export$2e6670267debbbbd;
/**
 * Gets random IPv6 Address from a block
 *
 * @param {string} ip the IPv6 block in CIDR-Notation
 * @returns {string}
 */ var $9e487c419ed1bfee$export$172352d6ffeaaf22;
var $9e487c419ed1bfee$export$d8edbef20cc36333;
var $9e487c419ed1bfee$export$73f7dfe1bf8dc8ad;

var $7XA7f = parcelRequire("7XA7f");
$9e487c419ed1bfee$export$cf95c51b03f10bae = (haystack, left, right) => {
  let pos;
  if (left instanceof RegExp) {
    const match = haystack.match(left);
    if (!match) return "";
    pos = match.index + match[0].length;
  } else {
    pos = haystack.indexOf(left);
    if (pos === -1) return "";
    pos += left.length;
  }
  haystack = haystack.slice(pos);
  pos = haystack.indexOf(right);
  if (pos === -1) return "";
  haystack = haystack.slice(0, pos);
  return haystack;
};
$9e487c419ed1bfee$export$f18057c1757876c5 = (string) => {
  const match = string
    .replace(",", ".")
    .replace(" ", "")
    .match(/([\d,.]+)([MK]?)/);
  if (match) {
    let [, num, multi] = match;
    num = parseFloat(num);
    return Math.round(
      multi === "M" ? num * 1000000 : multi === "K" ? num * 1000 : num
    );
  }
  return null;
};
/**
 * Escape sequences for cutAfterJS
 * @param {string} start the character string the escape sequence
 * @param {string} end the character string to stop the escape seequence
 * @param {undefined|Regex} startPrefix a regex to check against the preceding 10 characters
 */ const $9e487c419ed1bfee$var$ESCAPING_SEQUENZES = [
  // Strings
  {
    start: '"',
    end: '"',
  },
  {
    start: "'",
    end: "'",
  },
  {
    start: "`",
    end: "`",
  },
  // RegeEx
  {
    start: "/",
    end: "/",
    startPrefix: /(^|[[{:;,/])\s?$/,
  },
];
$9e487c419ed1bfee$export$beb63bc92c294b1d = (mixedJson) => {
  // Define the general open and closing tag
  let open, close;
  if (mixedJson[0] === "[") {
    open = "[";
    close = "]";
  } else if (mixedJson[0] === "{") {
    open = "{";
    close = "}";
  }
  if (!open)
    throw new Error(
      `Can't cut unsupported JSON (need to begin with [ or { ) but got: ${mixedJson[0]}`
    );
  // States if the loop is currently inside an escaped js object
  let isEscapedObject = null;
  // States if the current character is treated as escaped or not
  let isEscaped = false;
  // Current open brackets to be closed
  let counter = 0;
  let i;
  // Go through all characters from the start
  for (i = 0; i < mixedJson.length; i++) {
    // End of current escaped object
    if (
      !isEscaped &&
      isEscapedObject !== null &&
      mixedJson[i] === isEscapedObject.end
    ) {
      isEscapedObject = null;
      continue;
      // Might be the start of a new escaped object
    } else if (!isEscaped && isEscapedObject === null) {
      for (const escaped of $9e487c419ed1bfee$var$ESCAPING_SEQUENZES) {
        if (mixedJson[i] !== escaped.start) continue;
        // Test startPrefix against last 10 characters
        if (
          !escaped.startPrefix ||
          mixedJson.substring(i - 10, i).match(escaped.startPrefix)
        ) {
          isEscapedObject = escaped;
          break;
        }
      }
      // Continue if we found a new escaped object
      if (isEscapedObject !== null) continue;
    }
    // Toggle the isEscaped boolean for every backslash
    // Reset for every regular character
    isEscaped = mixedJson[i] === "\\" && !isEscaped;
    if (isEscapedObject !== null) continue;
    if (mixedJson[i] === open) counter++;
    else if (mixedJson[i] === close) counter--;
    // All brackets have been closed, thus end of JSON is reached
    if (counter === 0)
      // Return the cut JSON
      return mixedJson.substring(0, i + 1);
  }
  // We ran through the whole string and ended up with an unclosed bracket
  throw Error("Can't cut unsupported JSON (no matching closing bracket found)");
};
$9e487c419ed1bfee$export$8d19b782e6cae425 = (
  player_response,
  statuses,
  ErrorType = Error
) => {
  let playability = player_response && player_response.playabilityStatus;
  if (playability && statuses.includes(playability.status))
    return new ErrorType(
      playability.reason || (playability.messages && playability.messages[0])
    );
  return null;
};
$9e487c419ed1bfee$export$cbbbf91b85781804 = (
  url,
  options = {},
  requestOptionsOverwrite
) => {
  const req = $7XA7f(url, requestOptionsOverwrite || options.requestOptions);
  if (typeof options.requestCallback === "function")
    options.requestCallback(req);
  return req;
};
$9e487c419ed1bfee$export$b680e6b2c82f8c2f = (
  obj,
  prop,
  value,
  oldPath,
  newPath
) => {
  Object.defineProperty(obj, prop, {
    get: () => {
      console.warn(
        `\`${oldPath}\` will be removed in a near future release, ` +
          `use \`${newPath}\` instead.`
      );
      return value;
    },
  });
};

var $8ZGq3 = parcelRequire("8ZGq3");
const $9e487c419ed1bfee$var$UPDATE_INTERVAL = 43200000;
$9e487c419ed1bfee$export$6ccd8c5da0dcc4f = 0;
$9e487c419ed1bfee$export$2e6670267debbbbd = () => {
  if (
    !$8ZGq3.version.startsWith("0.0.0-") &&
    Date.now() - $9e487c419ed1bfee$export$6ccd8c5da0dcc4f >=
      $9e487c419ed1bfee$var$UPDATE_INTERVAL
  ) {
    $9e487c419ed1bfee$export$6ccd8c5da0dcc4f = Date.now();
    return $7XA7f(
      "https://api.github.com/repos/fent/node-ytdl-core/releases/latest",
      {
        headers: {
          "User-Agent": "ytdl-core",
        },
      }
    )
      .text()
      .then(
        (response) => {
          if (JSON.parse(response).tag_name !== `v${$8ZGq3.version}`)
            console.warn(
              '\x1b[33mWARNING:\x1b[0m ytdl-core is out of date! Update with "npm install ytdl-core@latest".'
            );
        },
        (err) => {
          console.warn("Error checking for updates:", err.message);
          console.warn(
            "You can disable this check by setting the `YTDL_NO_UPDATE` env variable."
          );
        }
      );
  }
  return null;
};
$9e487c419ed1bfee$export$172352d6ffeaaf22 = (ip) => {
  // Start with a fast Regex-Check
  if (!$9e487c419ed1bfee$var$isIPv6(ip)) throw Error("Invalid IPv6 format");
  // Start by splitting and normalizing addr and mask
  const [rawAddr, rawMask] = ip.split("/");
  let base10Mask = parseInt(rawMask);
  if (!base10Mask || base10Mask > 128 || base10Mask < 24)
    throw Error("Invalid IPv6 subnet");
  const base10addr = $9e487c419ed1bfee$var$normalizeIP(rawAddr);
  // Get random addr to pad with
  // using Math.random since we're not requiring high level of randomness
  const randomAddr = new Array(8)
    .fill(1)
    .map(() => Math.floor(Math.random() * 0xffff));
  // Merge base10addr with randomAddr
  const mergedAddr = randomAddr.map((randomItem, idx) => {
    // Calculate the amount of static bits
    const staticBits = Math.min(base10Mask, 16);
    // Adjust the bitmask with the staticBits
    base10Mask -= staticBits;
    // Calculate the bitmask
    // lsb makes the calculation way more complicated
    const mask = 0xffff - (2 ** (16 - staticBits) - 1);
    // Combine base10addr and random
    return (base10addr[idx] & mask) + (randomItem & (mask ^ 0xffff));
  });
  // Return new addr
  return mergedAddr.map((x) => x.toString("16")).join(":");
};
// eslint-disable-next-line max-len
const $9e487c419ed1bfee$var$IPV6_REGEX =
  /^(([0-9a-f]{1,4}:)(:[0-9a-f]{1,4}){1,6}|([0-9a-f]{1,4}:){1,2}(:[0-9a-f]{1,4}){1,5}|([0-9a-f]{1,4}:){1,3}(:[0-9a-f]{1,4}){1,4}|([0-9a-f]{1,4}:){1,4}(:[0-9a-f]{1,4}){1,3}|([0-9a-f]{1,4}:){1,5}(:[0-9a-f]{1,4}){1,2}|([0-9a-f]{1,4}:){1,6}(:[0-9a-f]{1,4})|([0-9a-f]{1,4}:){1,7}(([0-9a-f]{1,4})|:))\/(1[0-1]\d|12[0-8]|\d{1,2})$/;
/**
 * Quick check for a valid IPv6
 * The Regex only accepts a subset of all IPv6 Addresses
 *
 * @param {string} ip the IPv6 block in CIDR-Notation to test
 * @returns {boolean} true if valid
 */ const $9e487c419ed1bfee$var$isIPv6 =
  ($9e487c419ed1bfee$export$d8edbef20cc36333 = (ip) =>
    $9e487c419ed1bfee$var$IPV6_REGEX.test(ip));
/**
 * Normalise an IP Address
 *
 * @param {string} ip the IPv6 Addr
 * @returns {number[]} the 8 parts of the IPv6 as Integers
 */ const $9e487c419ed1bfee$var$normalizeIP =
  ($9e487c419ed1bfee$export$73f7dfe1bf8dc8ad = (ip) => {
    // Split by fill position
    const parts = ip.split("::").map((x) => x.split(":"));
    // Normalize start and end
    const partStart = parts[0] || [];
    const partEnd = parts[1] || [];
    partEnd.reverse();
    // Placeholder for full ip
    const fullIP = new Array(8).fill(0);
    // Fill in start and end parts
    for (let i = 0; i < Math.min(partStart.length, 8); i++)
      fullIP[i] = parseInt(partStart[i], 16) || 0;
    for (let i = 0; i < Math.min(partEnd.length, 8); i++)
      fullIP[7 - i] = parseInt(partEnd[i], 16) || 0;
    return fullIP;
  });

var $2cd12ba1b1bd64cd$require$setTimeout = $bFvJb$timers.setTimeout;
/**
 * Sort formats from highest quality to lowest.
 *
 * @param {Object} a
 * @param {Object} b
 * @returns {number}
 */ var $a6a611812c024fb8$export$d9f205bb0c99d6d8;
/**
 * Choose a format depending on the given options.
 *
 * @param {Array.<Object>} formats
 * @param {Object} options
 * @returns {Object}
 * @throws {Error} when no format matches the filter/format rules
 */ var $a6a611812c024fb8$export$b7b4e2cc23c2841b;
/**
 * @param {Array.<Object>} formats
 * @param {Function} filter
 * @returns {Array.<Object>}
 */ var $a6a611812c024fb8$export$9af3ec9872eb3045;
/**
 * @param {Object} format
 * @returns {Object}
 */ var $a6a611812c024fb8$export$60661bdb0a3f990;

var $c7ab7d33f4f12396$exports = {};
/**
 * http://en.wikipedia.org/wiki/YouTube#Quality_and_formats
 */ $c7ab7d33f4f12396$exports = {
  5: {
    mimeType: 'video/flv; codecs="Sorenson H.283, mp3"',
    qualityLabel: "240p",
    bitrate: 250000,
    audioBitrate: 64,
  },
  6: {
    mimeType: 'video/flv; codecs="Sorenson H.263, mp3"',
    qualityLabel: "270p",
    bitrate: 800000,
    audioBitrate: 64,
  },
  13: {
    mimeType: 'video/3gp; codecs="MPEG-4 Visual, aac"',
    qualityLabel: null,
    bitrate: 500000,
    audioBitrate: null,
  },
  17: {
    mimeType: 'video/3gp; codecs="MPEG-4 Visual, aac"',
    qualityLabel: "144p",
    bitrate: 50000,
    audioBitrate: 24,
  },
  18: {
    mimeType: 'video/mp4; codecs="H.264, aac"',
    qualityLabel: "360p",
    bitrate: 500000,
    audioBitrate: 96,
  },
  22: {
    mimeType: 'video/mp4; codecs="H.264, aac"',
    qualityLabel: "720p",
    bitrate: 2000000,
    audioBitrate: 192,
  },
  34: {
    mimeType: 'video/flv; codecs="H.264, aac"',
    qualityLabel: "360p",
    bitrate: 500000,
    audioBitrate: 128,
  },
  35: {
    mimeType: 'video/flv; codecs="H.264, aac"',
    qualityLabel: "480p",
    bitrate: 800000,
    audioBitrate: 128,
  },
  36: {
    mimeType: 'video/3gp; codecs="MPEG-4 Visual, aac"',
    qualityLabel: "240p",
    bitrate: 175000,
    audioBitrate: 32,
  },
  37: {
    mimeType: 'video/mp4; codecs="H.264, aac"',
    qualityLabel: "1080p",
    bitrate: 3000000,
    audioBitrate: 192,
  },
  38: {
    mimeType: 'video/mp4; codecs="H.264, aac"',
    qualityLabel: "3072p",
    bitrate: 3500000,
    audioBitrate: 192,
  },
  43: {
    mimeType: 'video/webm; codecs="VP8, vorbis"',
    qualityLabel: "360p",
    bitrate: 500000,
    audioBitrate: 128,
  },
  44: {
    mimeType: 'video/webm; codecs="VP8, vorbis"',
    qualityLabel: "480p",
    bitrate: 1000000,
    audioBitrate: 128,
  },
  45: {
    mimeType: 'video/webm; codecs="VP8, vorbis"',
    qualityLabel: "720p",
    bitrate: 2000000,
    audioBitrate: 192,
  },
  46: {
    mimeType: 'audio/webm; codecs="vp8, vorbis"',
    qualityLabel: "1080p",
    bitrate: null,
    audioBitrate: 192,
  },
  82: {
    mimeType: 'video/mp4; codecs="H.264, aac"',
    qualityLabel: "360p",
    bitrate: 500000,
    audioBitrate: 96,
  },
  83: {
    mimeType: 'video/mp4; codecs="H.264, aac"',
    qualityLabel: "240p",
    bitrate: 500000,
    audioBitrate: 96,
  },
  84: {
    mimeType: 'video/mp4; codecs="H.264, aac"',
    qualityLabel: "720p",
    bitrate: 2000000,
    audioBitrate: 192,
  },
  85: {
    mimeType: 'video/mp4; codecs="H.264, aac"',
    qualityLabel: "1080p",
    bitrate: 3000000,
    audioBitrate: 192,
  },
  91: {
    mimeType: 'video/ts; codecs="H.264, aac"',
    qualityLabel: "144p",
    bitrate: 100000,
    audioBitrate: 48,
  },
  92: {
    mimeType: 'video/ts; codecs="H.264, aac"',
    qualityLabel: "240p",
    bitrate: 150000,
    audioBitrate: 48,
  },
  93: {
    mimeType: 'video/ts; codecs="H.264, aac"',
    qualityLabel: "360p",
    bitrate: 500000,
    audioBitrate: 128,
  },
  94: {
    mimeType: 'video/ts; codecs="H.264, aac"',
    qualityLabel: "480p",
    bitrate: 800000,
    audioBitrate: 128,
  },
  95: {
    mimeType: 'video/ts; codecs="H.264, aac"',
    qualityLabel: "720p",
    bitrate: 1500000,
    audioBitrate: 256,
  },
  96: {
    mimeType: 'video/ts; codecs="H.264, aac"',
    qualityLabel: "1080p",
    bitrate: 2500000,
    audioBitrate: 256,
  },
  100: {
    mimeType: 'audio/webm; codecs="VP8, vorbis"',
    qualityLabel: "360p",
    bitrate: null,
    audioBitrate: 128,
  },
  101: {
    mimeType: 'audio/webm; codecs="VP8, vorbis"',
    qualityLabel: "360p",
    bitrate: null,
    audioBitrate: 192,
  },
  102: {
    mimeType: 'audio/webm; codecs="VP8, vorbis"',
    qualityLabel: "720p",
    bitrate: null,
    audioBitrate: 192,
  },
  120: {
    mimeType: 'video/flv; codecs="H.264, aac"',
    qualityLabel: "720p",
    bitrate: 2000000,
    audioBitrate: 128,
  },
  127: {
    mimeType: 'audio/ts; codecs="aac"',
    qualityLabel: null,
    bitrate: null,
    audioBitrate: 96,
  },
  128: {
    mimeType: 'audio/ts; codecs="aac"',
    qualityLabel: null,
    bitrate: null,
    audioBitrate: 96,
  },
  132: {
    mimeType: 'video/ts; codecs="H.264, aac"',
    qualityLabel: "240p",
    bitrate: 150000,
    audioBitrate: 48,
  },
  133: {
    mimeType: 'video/mp4; codecs="H.264"',
    qualityLabel: "240p",
    bitrate: 200000,
    audioBitrate: null,
  },
  134: {
    mimeType: 'video/mp4; codecs="H.264"',
    qualityLabel: "360p",
    bitrate: 300000,
    audioBitrate: null,
  },
  135: {
    mimeType: 'video/mp4; codecs="H.264"',
    qualityLabel: "480p",
    bitrate: 500000,
    audioBitrate: null,
  },
  136: {
    mimeType: 'video/mp4; codecs="H.264"',
    qualityLabel: "720p",
    bitrate: 1000000,
    audioBitrate: null,
  },
  137: {
    mimeType: 'video/mp4; codecs="H.264"',
    qualityLabel: "1080p",
    bitrate: 2500000,
    audioBitrate: null,
  },
  138: {
    mimeType: 'video/mp4; codecs="H.264"',
    qualityLabel: "4320p",
    bitrate: 13500000,
    audioBitrate: null,
  },
  139: {
    mimeType: 'audio/mp4; codecs="aac"',
    qualityLabel: null,
    bitrate: null,
    audioBitrate: 48,
  },
  140: {
    mimeType: 'audio/m4a; codecs="aac"',
    qualityLabel: null,
    bitrate: null,
    audioBitrate: 128,
  },
  141: {
    mimeType: 'audio/mp4; codecs="aac"',
    qualityLabel: null,
    bitrate: null,
    audioBitrate: 256,
  },
  151: {
    mimeType: 'video/ts; codecs="H.264, aac"',
    qualityLabel: "720p",
    bitrate: 50000,
    audioBitrate: 24,
  },
  160: {
    mimeType: 'video/mp4; codecs="H.264"',
    qualityLabel: "144p",
    bitrate: 100000,
    audioBitrate: null,
  },
  171: {
    mimeType: 'audio/webm; codecs="vorbis"',
    qualityLabel: null,
    bitrate: null,
    audioBitrate: 128,
  },
  172: {
    mimeType: 'audio/webm; codecs="vorbis"',
    qualityLabel: null,
    bitrate: null,
    audioBitrate: 192,
  },
  242: {
    mimeType: 'video/webm; codecs="VP9"',
    qualityLabel: "240p",
    bitrate: 100000,
    audioBitrate: null,
  },
  243: {
    mimeType: 'video/webm; codecs="VP9"',
    qualityLabel: "360p",
    bitrate: 250000,
    audioBitrate: null,
  },
  244: {
    mimeType: 'video/webm; codecs="VP9"',
    qualityLabel: "480p",
    bitrate: 500000,
    audioBitrate: null,
  },
  247: {
    mimeType: 'video/webm; codecs="VP9"',
    qualityLabel: "720p",
    bitrate: 700000,
    audioBitrate: null,
  },
  248: {
    mimeType: 'video/webm; codecs="VP9"',
    qualityLabel: "1080p",
    bitrate: 1500000,
    audioBitrate: null,
  },
  249: {
    mimeType: 'audio/webm; codecs="opus"',
    qualityLabel: null,
    bitrate: null,
    audioBitrate: 48,
  },
  250: {
    mimeType: 'audio/webm; codecs="opus"',
    qualityLabel: null,
    bitrate: null,
    audioBitrate: 64,
  },
  251: {
    mimeType: 'audio/webm; codecs="opus"',
    qualityLabel: null,
    bitrate: null,
    audioBitrate: 160,
  },
  264: {
    mimeType: 'video/mp4; codecs="H.264"',
    qualityLabel: "1440p",
    bitrate: 4000000,
    audioBitrate: null,
  },
  266: {
    mimeType: 'video/mp4; codecs="H.264"',
    qualityLabel: "2160p",
    bitrate: 12500000,
    audioBitrate: null,
  },
  271: {
    mimeType: 'video/webm; codecs="VP9"',
    qualityLabel: "1440p",
    bitrate: 9000000,
    audioBitrate: null,
  },
  272: {
    mimeType: 'video/webm; codecs="VP9"',
    qualityLabel: "4320p",
    bitrate: 20000000,
    audioBitrate: null,
  },
  278: {
    mimeType: 'video/webm; codecs="VP9"',
    qualityLabel: "144p 30fps",
    bitrate: 80000,
    audioBitrate: null,
  },
  298: {
    mimeType: 'video/mp4; codecs="H.264"',
    qualityLabel: "720p",
    bitrate: 3000000,
    audioBitrate: null,
  },
  299: {
    mimeType: 'video/mp4; codecs="H.264"',
    qualityLabel: "1080p",
    bitrate: 5500000,
    audioBitrate: null,
  },
  300: {
    mimeType: 'video/ts; codecs="H.264, aac"',
    qualityLabel: "720p",
    bitrate: 1318000,
    audioBitrate: 48,
  },
  302: {
    mimeType: 'video/webm; codecs="VP9"',
    qualityLabel: "720p HFR",
    bitrate: 2500000,
    audioBitrate: null,
  },
  303: {
    mimeType: 'video/webm; codecs="VP9"',
    qualityLabel: "1080p HFR",
    bitrate: 5000000,
    audioBitrate: null,
  },
  308: {
    mimeType: 'video/webm; codecs="VP9"',
    qualityLabel: "1440p HFR",
    bitrate: 10000000,
    audioBitrate: null,
  },
  313: {
    mimeType: 'video/webm; codecs="VP9"',
    qualityLabel: "2160p",
    bitrate: 13000000,
    audioBitrate: null,
  },
  315: {
    mimeType: 'video/webm; codecs="VP9"',
    qualityLabel: "2160p HFR",
    bitrate: 20000000,
    audioBitrate: null,
  },
  330: {
    mimeType: 'video/webm; codecs="VP9"',
    qualityLabel: "144p HDR, HFR",
    bitrate: 80000,
    audioBitrate: null,
  },
  331: {
    mimeType: 'video/webm; codecs="VP9"',
    qualityLabel: "240p HDR, HFR",
    bitrate: 100000,
    audioBitrate: null,
  },
  332: {
    mimeType: 'video/webm; codecs="VP9"',
    qualityLabel: "360p HDR, HFR",
    bitrate: 250000,
    audioBitrate: null,
  },
  333: {
    mimeType: 'video/webm; codecs="VP9"',
    qualityLabel: "240p HDR, HFR",
    bitrate: 500000,
    audioBitrate: null,
  },
  334: {
    mimeType: 'video/webm; codecs="VP9"',
    qualityLabel: "720p HDR, HFR",
    bitrate: 1000000,
    audioBitrate: null,
  },
  335: {
    mimeType: 'video/webm; codecs="VP9"',
    qualityLabel: "1080p HDR, HFR",
    bitrate: 1500000,
    audioBitrate: null,
  },
  336: {
    mimeType: 'video/webm; codecs="VP9"',
    qualityLabel: "1440p HDR, HFR",
    bitrate: 5000000,
    audioBitrate: null,
  },
  337: {
    mimeType: 'video/webm; codecs="VP9"',
    qualityLabel: "2160p HDR, HFR",
    bitrate: 12000000,
    audioBitrate: null,
  },
};

// Use these to help sort formats, higher index is better.
const $a6a611812c024fb8$var$audioEncodingRanks = [
  "mp4a",
  "mp3",
  "vorbis",
  "aac",
  "opus",
  "flac",
];
const $a6a611812c024fb8$var$videoEncodingRanks = [
  "mp4v",
  "avc1",
  "Sorenson H.283",
  "MPEG-4 Visual",
  "VP8",
  "VP9",
  "H.264",
];
const $a6a611812c024fb8$var$getVideoBitrate = (format) => format.bitrate || 0;
const $a6a611812c024fb8$var$getVideoEncodingRank = (format) =>
  $a6a611812c024fb8$var$videoEncodingRanks.findIndex(
    (enc) => format.codecs && format.codecs.includes(enc)
  );
const $a6a611812c024fb8$var$getAudioBitrate = (format) =>
  format.audioBitrate || 0;
const $a6a611812c024fb8$var$getAudioEncodingRank = (format) =>
  $a6a611812c024fb8$var$audioEncodingRanks.findIndex(
    (enc) => format.codecs && format.codecs.includes(enc)
  );
/**
 * Sort formats by a list of functions.
 *
 * @param {Object} a
 * @param {Object} b
 * @param {Array.<Function>} sortBy
 * @returns {number}
 */ const $a6a611812c024fb8$var$sortFormatsBy = (a, b, sortBy) => {
  let res = 0;
  for (let fn of sortBy) {
    res = fn(b) - fn(a);
    if (res !== 0) break;
  }
  return res;
};
const $a6a611812c024fb8$var$sortFormatsByVideo = (a, b) =>
  $a6a611812c024fb8$var$sortFormatsBy(a, b, [
    (format) => parseInt(format.qualityLabel),
    $a6a611812c024fb8$var$getVideoBitrate,
    $a6a611812c024fb8$var$getVideoEncodingRank,
  ]);
const $a6a611812c024fb8$var$sortFormatsByAudio = (a, b) =>
  $a6a611812c024fb8$var$sortFormatsBy(a, b, [
    $a6a611812c024fb8$var$getAudioBitrate,
    $a6a611812c024fb8$var$getAudioEncodingRank,
  ]);
$a6a611812c024fb8$export$d9f205bb0c99d6d8 = (a, b) =>
  $a6a611812c024fb8$var$sortFormatsBy(a, b, [
    // Formats with both video and audio are ranked highest.
    (format) => +!!format.isHLS,
    (format) => +!!format.isDashMPD,
    (format) => +(format.contentLength > 0),
    (format) => +(format.hasVideo && format.hasAudio),
    (format) => +format.hasVideo,
    (format) => parseInt(format.qualityLabel) || 0,
    $a6a611812c024fb8$var$getVideoBitrate,
    $a6a611812c024fb8$var$getAudioBitrate,
    $a6a611812c024fb8$var$getVideoEncodingRank,
    $a6a611812c024fb8$var$getAudioEncodingRank,
  ]);
$a6a611812c024fb8$export$b7b4e2cc23c2841b = (formats, options) => {
  if (typeof options.format === "object") {
    if (!options.format.url)
      throw Error("Invalid format given, did you use `ytdl.getInfo()`?");
    return options.format;
  }
  if (options.filter)
    formats = $a6a611812c024fb8$export$9af3ec9872eb3045(
      formats,
      options.filter
    );
  // We currently only support HLS-Formats for livestreams
  // So we (now) remove all non-HLS streams
  if (formats.some((fmt) => fmt.isHLS))
    formats = formats.filter((fmt) => fmt.isHLS || !fmt.isLive);
  let format;
  const quality = options.quality || "highest";
  switch (quality) {
    case "highest":
      format = formats[0];
      break;
    case "lowest":
      format = formats[formats.length - 1];
      break;
    case "highestaudio": {
      formats = $a6a611812c024fb8$export$9af3ec9872eb3045(formats, "audio");
      formats.sort($a6a611812c024fb8$var$sortFormatsByAudio);
      // Filter for only the best audio format
      const bestAudioFormat = formats[0];
      formats = formats.filter(
        (f) =>
          $a6a611812c024fb8$var$sortFormatsByAudio(bestAudioFormat, f) === 0
      );
      // Check for the worst video quality for the best audio quality and pick according
      // This does not loose default sorting of video encoding and bitrate
      const worstVideoQuality = formats
        .map((f) => parseInt(f.qualityLabel) || 0)
        .sort((a, b) => a - b)[0];
      format = formats.find(
        (f) => (parseInt(f.qualityLabel) || 0) === worstVideoQuality
      );
      break;
    }
    case "lowestaudio":
      formats = $a6a611812c024fb8$export$9af3ec9872eb3045(formats, "audio");
      formats.sort($a6a611812c024fb8$var$sortFormatsByAudio);
      format = formats[formats.length - 1];
      break;
    case "highestvideo": {
      formats = $a6a611812c024fb8$export$9af3ec9872eb3045(formats, "video");
      formats.sort($a6a611812c024fb8$var$sortFormatsByVideo);
      // Filter for only the best video format
      const bestVideoFormat = formats[0];
      formats = formats.filter(
        (f) =>
          $a6a611812c024fb8$var$sortFormatsByVideo(bestVideoFormat, f) === 0
      );
      // Check for the worst audio quality for the best video quality and pick according
      // This does not loose default sorting of audio encoding and bitrate
      const worstAudioQuality = formats
        .map((f) => f.audioBitrate || 0)
        .sort((a, b) => a - b)[0];
      format = formats.find((f) => (f.audioBitrate || 0) === worstAudioQuality);
      break;
    }
    case "lowestvideo":
      formats = $a6a611812c024fb8$export$9af3ec9872eb3045(formats, "video");
      formats.sort($a6a611812c024fb8$var$sortFormatsByVideo);
      format = formats[formats.length - 1];
      break;
    default:
      format = $a6a611812c024fb8$var$getFormatByQuality(quality, formats);
      break;
  }
  if (!format) throw Error(`No such format found: ${quality}`);
  return format;
};
/**
 * Gets a format based on quality or array of quality's
 *
 * @param {string|[string]} quality
 * @param {[Object]} formats
 * @returns {Object}
 */ const $a6a611812c024fb8$var$getFormatByQuality = (quality, formats) => {
  let getFormat = (itag) =>
    formats.find((format) => `${format.itag}` === `${itag}`);
  if (Array.isArray(quality))
    return getFormat(quality.find((q) => getFormat(q)));
  else return getFormat(quality);
};
$a6a611812c024fb8$export$9af3ec9872eb3045 = (formats, filter) => {
  let fn;
  switch (filter) {
    case "videoandaudio":
    case "audioandvideo":
      fn = (format) => format.hasVideo && format.hasAudio;
      break;
    case "video":
      fn = (format) => format.hasVideo;
      break;
    case "videoonly":
      fn = (format) => format.hasVideo && !format.hasAudio;
      break;
    case "audio":
      fn = (format) => format.hasAudio;
      break;
    case "audioonly":
      fn = (format) => !format.hasVideo && format.hasAudio;
      break;
    default:
      if (typeof filter === "function") fn = filter;
      else throw TypeError(`Given filter (${filter}) is not supported`);
  }
  return formats.filter((format) => !!format.url && fn(format));
};
$a6a611812c024fb8$export$60661bdb0a3f990 = (format) => {
  format = Object.assign({}, $c7ab7d33f4f12396$exports[format.itag], format);
  format.hasVideo = !!format.qualityLabel;
  format.hasAudio = !!format.audioBitrate;
  format.container = format.mimeType
    ? format.mimeType.split(";")[0].split("/")[1]
    : null;
  format.codecs = format.mimeType
    ? $9e487c419ed1bfee$export$cf95c51b03f10bae(
        format.mimeType,
        'codecs="',
        '"'
      )
    : null;
  format.videoCodec =
    format.hasVideo && format.codecs ? format.codecs.split(", ")[0] : null;
  format.audioCodec =
    format.hasAudio && format.codecs
      ? format.codecs.split(", ").slice(-1)[0]
      : null;
  format.isLive = /\bsource[/=]yt_live_broadcast\b/.test(format.url);
  format.isHLS = /\/manifest\/hls_(variant|playlist)\//.test(format.url);
  format.isDashMPD = /\/manifest\/dash\//.test(format.url);
  return format;
};

/**
 * Get video ID.
 *
 * There are a few type of video URL formats.
 *  - https://www.youtube.com/watch?v=VIDEO_ID
 *  - https://m.youtube.com/watch?v=VIDEO_ID
 *  - https://youtu.be/VIDEO_ID
 *  - https://www.youtube.com/v/VIDEO_ID
 *  - https://www.youtube.com/embed/VIDEO_ID
 *  - https://music.youtube.com/watch?v=VIDEO_ID
 *  - https://gaming.youtube.com/watch?v=VIDEO_ID
 *
 * @param {string} link
 * @return {string}
 * @throws {Error} If unable to find a id
 * @throws {TypeError} If videoid doesn't match specs
 */ var $46e228770841cea1$export$622ec0af9fe46952;
var $46e228770841cea1$export$50ad4c25e09db482;
var $46e228770841cea1$export$1c6e21294c7e6fa;
/**
 * Checks wether the input string includes a valid id.
 *
 * @param {string} string
 * @returns {boolean}
 */ var $46e228770841cea1$export$c6e27db96f1f206c;
const $46e228770841cea1$var$validQueryDomains = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "gaming.youtube.com",
]);
const $46e228770841cea1$var$validPathDomains =
  /^https?:\/\/(youtu\.be\/|(www\.)?youtube\.com\/(embed|v|shorts)\/)/;
$46e228770841cea1$export$622ec0af9fe46952 = (link) => {
  const parsed = new URL(link.trim());
  let id = parsed.searchParams.get("v");
  if ($46e228770841cea1$var$validPathDomains.test(link.trim()) && !id) {
    const paths = parsed.pathname.split("/");
    id = parsed.host === "youtu.be" ? paths[1] : paths[2];
  } else if (
    parsed.hostname &&
    !$46e228770841cea1$var$validQueryDomains.has(parsed.hostname)
  )
    throw Error("Not a YouTube domain");
  if (!id) throw Error(`No video id found: "${link}"`);
  id = id.substring(0, 11);
  if (!$46e228770841cea1$export$1c6e21294c7e6fa(id))
    throw TypeError(
      `Video id (${id}) does not match expected ` +
        `format (${$46e228770841cea1$var$idRegex.toString()})`
    );
  return id;
};
/**
 * Gets video ID either from a url or by checking if the given string
 * matches the video ID format.
 *
 * @param {string} str
 * @returns {string}
 * @throws {Error} If unable to find a id
 * @throws {TypeError} If videoid doesn't match specs
 */ const $46e228770841cea1$var$urlRegex = /^https?:\/\//;
$46e228770841cea1$export$50ad4c25e09db482 = (str) => {
  if ($46e228770841cea1$export$1c6e21294c7e6fa(str)) return str;
  else if ($46e228770841cea1$var$urlRegex.test(str.trim()))
    return $46e228770841cea1$export$622ec0af9fe46952(str);
  else throw Error(`No video id found: ${str}`);
};
/**
 * Returns true if given id satifies YouTube's id format.
 *
 * @param {string} id
 * @return {boolean}
 */ const $46e228770841cea1$var$idRegex = /^[a-zA-Z0-9-_]{11}$/;
$46e228770841cea1$export$1c6e21294c7e6fa = (id) =>
  $46e228770841cea1$var$idRegex.test(id.trim());
$46e228770841cea1$export$c6e27db96f1f206c = (string) => {
  try {
    $46e228770841cea1$export$622ec0af9fe46952(string);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Get video media.
 *
 * @param {Object} info
 * @returns {Object}
 */ var $14887bf853270ad0$export$a854ab43349813f2;
/**
 * Get video author.
 *
 * @param {Object} info
 * @returns {Object}
 */ var $14887bf853270ad0$export$31577d79be25397a;
/**
 * Get related videos.
 *
 * @param {Object} info
 * @returns {Array.<Object>}
 */ var $14887bf853270ad0$export$3ec17fd3fbad9824;
/**
 * Get like count.
 *
 * @param {Object} info
 * @returns {number}
 */ var $14887bf853270ad0$export$eeaff9deba13523b;
/**
 * Get dislike count.
 *
 * @param {Object} info
 * @returns {number}
 */ var $14887bf853270ad0$export$861d87713a29234d;
/**
 * Cleans up a few fields on `videoDetails`.
 *
 * @param {Object} videoDetails
 * @param {Object} info
 * @returns {Object}
 */ var $14887bf853270ad0$export$3136aa54564d3157;
/**
 * Get storyboards info.
 *
 * @param {Object} info
 * @returns {Array.<Object>}
 */ var $14887bf853270ad0$export$6b1f762de6dd360d;
/**
 * Get chapters info.
 *
 * @param {Object} info
 * @returns {Array.<Object>}
 */ var $14887bf853270ad0$export$1cce38d69c579042;

var $b68378607095a1b4$exports = {};
("use strict");
var $b68378607095a1b4$var$__importDefault =
  ($b68378607095a1b4$exports && $b68378607095a1b4$exports.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule
      ? mod
      : {
          default: mod,
        };
  };

const $b68378607095a1b4$var$miniget_1 = $b68378607095a1b4$var$__importDefault(
  parcelRequire("7XA7f")
);

const $b68378607095a1b4$var$m3u8_parser_1 =
  $b68378607095a1b4$var$__importDefault(parcelRequire("eVT2b"));

const $b68378607095a1b4$var$dash_mpd_parser_1 =
  $b68378607095a1b4$var$__importDefault(parcelRequire("dFBuc"));
var $6c385c0aa0b3dca2$exports = {};
("use strict");
Object.defineProperty($6c385c0aa0b3dca2$exports, "__esModule", {
  value: true,
});
$6c385c0aa0b3dca2$exports.Queue = void 0;
class $6c385c0aa0b3dca2$var$Queue {
  /**
   * A really simple queue with concurrency.
   *
   * @param {Function} worker
   * @param {Object} options
   * @param {!number} options.concurrency
   */ constructor(worker, options = {}) {
    this._worker = worker;
    this._concurrency = options.concurrency || 1;
    this.tasks = [];
    this.total = 0;
    this.active = 0;
  }
  /**
   * Push a task to the queue.
   *
   *  @param {T} item
   *  @param {!Function} callback
   */ push(item, callback) {
    this.tasks.push({
      item: item,
      callback: callback,
    });
    this.total++;
    this._next();
  }
  /**
   * Process next job in queue.
   */ _next() {
    if (this.active >= this._concurrency || !this.tasks.length) return;
    const { item: item, callback: callback } = this.tasks.shift();
    let callbackCalled = false;
    this.active++;
    this._worker(item, (err, result) => {
      if (callbackCalled) return;
      this.active--;
      callbackCalled = true;
      callback === null || callback === void 0 || callback(err, result);
      this._next();
    });
  }
  /**
   * Stops processing queued jobs.
   */ die() {
    this.tasks = [];
  }
}
$6c385c0aa0b3dca2$exports.Queue = $6c385c0aa0b3dca2$var$Queue;

var $fKWuu = parcelRequire("fKWuu");
const $b68378607095a1b4$var$supportedParsers = {
  m3u8: $b68378607095a1b4$var$m3u8_parser_1.default,
  "dash-mpd": $b68378607095a1b4$var$dash_mpd_parser_1.default,
};
let $b68378607095a1b4$var$m3u8stream = (playlistURL, options = {}) => {
  const stream = new $bFvJb$stream.PassThrough({
    highWaterMark: options.highWaterMark,
  });
  const chunkReadahead = options.chunkReadahead || 3;
  // 20 seconds.
  const liveBuffer = options.liveBuffer || 20000;
  const requestOptions = options.requestOptions;
  const Parser =
    $b68378607095a1b4$var$supportedParsers[
      options.parser || (/\.mpd$/.test(playlistURL) ? "dash-mpd" : "m3u8")
    ];
  if (!Parser) throw TypeError(`parser '${options.parser}' not supported`);
  let begin = 0;
  if (typeof options.begin !== "undefined")
    begin =
      typeof options.begin === "string"
        ? $fKWuu.humanStr(options.begin)
        : Math.max(options.begin - liveBuffer, 0);
  const forwardEvents = (req) => {
    for (let event of [
      "abort",
      "request",
      "response",
      "redirect",
      "retry",
      "reconnect",
    ])
      req.on(event, stream.emit.bind(stream, event));
  };
  let currSegment;
  const streamQueue = new $6c385c0aa0b3dca2$exports.Queue(
    (req, callback) => {
      currSegment = req;
      // Count the size manually, since the `content-length` header is not
      // always there.
      let size = 0;
      req.on("data", (chunk) => (size += chunk.length));
      req.pipe(stream, {
        end: false,
      });
      req.on("end", () => callback(null, size));
    },
    {
      concurrency: 1,
    }
  );
  let segmentNumber = 0;
  let downloaded = 0;
  const requestQueue = new $6c385c0aa0b3dca2$exports.Queue(
    (segment, callback) => {
      let reqOptions = Object.assign({}, requestOptions);
      if (segment.range)
        reqOptions.headers = Object.assign({}, reqOptions.headers, {
          Range: `bytes=${segment.range.start}-${segment.range.end}`,
        });
      let req = $b68378607095a1b4$var$miniget_1.default(
        new URL(segment.url, playlistURL).toString(),
        reqOptions
      );
      req.on("error", callback);
      forwardEvents(req);
      streamQueue.push(req, (_, size) => {
        downloaded += +size;
        stream.emit(
          "progress",
          {
            num: ++segmentNumber,
            size: size,
            duration: segment.duration,
            url: segment.url,
          },
          requestQueue.total,
          downloaded
        );
        callback(null);
      });
    },
    {
      concurrency: chunkReadahead,
    }
  );
  const onError = (err) => {
    stream.emit("error", err);
    // Stop on any error.
    stream.end();
  };
  // When to look for items again.
  let refreshThreshold;
  let minRefreshTime;
  let refreshTimeout;
  let fetchingPlaylist = true;
  let ended = false;
  let isStatic = false;
  let lastRefresh;
  const onQueuedEnd = (err) => {
    currSegment = null;
    if (err) onError(err);
    else if (
      !fetchingPlaylist &&
      !ended &&
      !isStatic &&
      requestQueue.tasks.length + requestQueue.active <= refreshThreshold
    ) {
      let ms = Math.max(0, minRefreshTime - (Date.now() - lastRefresh));
      fetchingPlaylist = true;
      refreshTimeout = setTimeout(refreshPlaylist, ms);
    } else if (
      (ended || isStatic) &&
      !requestQueue.tasks.length &&
      !requestQueue.active
    )
      stream.end();
  };
  let currPlaylist;
  let lastSeq;
  let starttime = 0;
  const refreshPlaylist = () => {
    lastRefresh = Date.now();
    currPlaylist = $b68378607095a1b4$var$miniget_1.default(
      playlistURL,
      requestOptions
    );
    currPlaylist.on("error", onError);
    forwardEvents(currPlaylist);
    const parser = currPlaylist.pipe(new Parser(options.id));
    parser.on("starttime", (a) => {
      if (starttime) return;
      starttime = a;
      if (typeof options.begin === "string" && begin >= 0) begin += starttime;
    });
    parser.on("endlist", () => {
      isStatic = true;
    });
    parser.on("endearly", currPlaylist.unpipe.bind(currPlaylist, parser));
    let addedItems = [];
    const addItem = (item) => {
      if (!item.init) {
        if (item.seq <= lastSeq) return;
        lastSeq = item.seq;
      }
      begin = item.time;
      requestQueue.push(item, onQueuedEnd);
      addedItems.push(item);
    };
    let tailedItems = [],
      tailedItemsDuration = 0;
    parser.on("item", (item) => {
      let timedItem = Object.assign(
        {
          time: starttime,
        },
        item
      );
      if (begin <= timedItem.time) addItem(timedItem);
      else {
        tailedItems.push(timedItem);
        tailedItemsDuration += timedItem.duration;
        // Only keep the last `liveBuffer` of items.
        while (
          tailedItems.length > 1 &&
          tailedItemsDuration - tailedItems[0].duration > liveBuffer
        ) {
          const lastItem = tailedItems.shift();
          tailedItemsDuration -= lastItem.duration;
        }
      }
      starttime += timedItem.duration;
    });
    parser.on("end", () => {
      currPlaylist = null;
      // If we are too ahead of the stream, make sure to get the
      // latest available items with a small buffer.
      if (!addedItems.length && tailedItems.length)
        tailedItems.forEach((item) => {
          addItem(item);
        });
      // Refresh the playlist when remaining segments get low.
      refreshThreshold = Math.max(1, Math.ceil(addedItems.length * 0.01));
      // Throttle refreshing the playlist by looking at the duration
      // of live items added on this refresh.
      minRefreshTime = addedItems.reduce(
        (total, item) => item.duration + total,
        0
      );
      fetchingPlaylist = false;
      onQueuedEnd(null);
    });
  };
  refreshPlaylist();
  stream.end = () => {
    ended = true;
    streamQueue.die();
    requestQueue.die();
    clearTimeout(refreshTimeout);
    currPlaylist === null || currPlaylist === void 0 || currPlaylist.destroy();
    currSegment === null || currSegment === void 0 || currSegment.destroy();
    $bFvJb$stream.PassThrough.prototype.end.call(stream, null);
    return stream;
  };
  return stream;
};
$b68378607095a1b4$var$m3u8stream.parseTimestamp = $fKWuu.humanStr;
$b68378607095a1b4$exports = $b68378607095a1b4$var$m3u8stream;

var $14887bf853270ad0$require$parseTimestamp =
  $b68378607095a1b4$exports.parseTimestamp;
const $14887bf853270ad0$var$BASE_URL = "https://www.youtube.com/watch?v=";
const $14887bf853270ad0$var$TITLE_TO_CATEGORY = {
  song: {
    name: "Music",
    url: "https://music.youtube.com/",
  },
};
const $14887bf853270ad0$var$getText = (obj) =>
  obj ? (obj.runs ? obj.runs[0].text : obj.simpleText) : null;
$14887bf853270ad0$export$a854ab43349813f2 = (info) => {
  let media = {};
  let results = [];
  try {
    results =
      info.response.contents.twoColumnWatchNextResults.results.results.contents;
  } catch (err) {
    // Do nothing
  }
  let result = results.find((v) => v.videoSecondaryInfoRenderer);
  if (!result) return {};
  try {
    let metadataRows = (
      result.metadataRowContainer ||
      result.videoSecondaryInfoRenderer.metadataRowContainer
    ).metadataRowContainerRenderer.rows;
    for (let row of metadataRows) {
      if (row.metadataRowRenderer) {
        let title = $14887bf853270ad0$var$getText(
          row.metadataRowRenderer.title
        ).toLowerCase();
        let contents = row.metadataRowRenderer.contents[0];
        media[title] = $14887bf853270ad0$var$getText(contents);
        let runs = contents.runs;
        if (runs && runs[0].navigationEndpoint)
          media[`${title}_url`] = new URL(
            runs[0].navigationEndpoint.commandMetadata.webCommandMetadata.url,
            $14887bf853270ad0$var$BASE_URL
          ).toString();
        if (title in $14887bf853270ad0$var$TITLE_TO_CATEGORY) {
          media.category = $14887bf853270ad0$var$TITLE_TO_CATEGORY[title].name;
          media.category_url =
            $14887bf853270ad0$var$TITLE_TO_CATEGORY[title].url;
        }
      } else if (row.richMetadataRowRenderer) {
        let contents = row.richMetadataRowRenderer.contents;
        let boxArt = contents.filter(
          (meta) =>
            meta.richMetadataRenderer.style ===
            "RICH_METADATA_RENDERER_STYLE_BOX_ART"
        );
        for (let { richMetadataRenderer: richMetadataRenderer } of boxArt) {
          let meta = richMetadataRenderer;
          media.year = $14887bf853270ad0$var$getText(meta.subtitle);
          let type = $14887bf853270ad0$var$getText(meta.callToAction).split(
            " "
          )[1];
          media[type] = $14887bf853270ad0$var$getText(meta.title);
          media[`${type}_url`] = new URL(
            meta.endpoint.commandMetadata.webCommandMetadata.url,
            $14887bf853270ad0$var$BASE_URL
          ).toString();
          media.thumbnails = meta.thumbnail.thumbnails;
        }
        let topic = contents.filter(
          (meta) =>
            meta.richMetadataRenderer.style ===
            "RICH_METADATA_RENDERER_STYLE_TOPIC"
        );
        for (let { richMetadataRenderer: richMetadataRenderer } of topic) {
          let meta = richMetadataRenderer;
          media.category = $14887bf853270ad0$var$getText(meta.title);
          media.category_url = new URL(
            meta.endpoint.commandMetadata.webCommandMetadata.url,
            $14887bf853270ad0$var$BASE_URL
          ).toString();
        }
      }
    }
  } catch (err) {
    // Do nothing.
  }
  return media;
};
const $14887bf853270ad0$var$isVerified = (badges) =>
  !!(
    badges && badges.find((b) => b.metadataBadgeRenderer.tooltip === "Verified")
  );
$14887bf853270ad0$export$31577d79be25397a = (info) => {
  let channelId,
    thumbnails = [],
    subscriberCount,
    verified = false;
  try {
    let results =
      info.response.contents.twoColumnWatchNextResults.results.results.contents;
    let v = results.find(
      (v2) =>
        v2.videoSecondaryInfoRenderer &&
        v2.videoSecondaryInfoRenderer.owner &&
        v2.videoSecondaryInfoRenderer.owner.videoOwnerRenderer
    );
    let videoOwnerRenderer =
      v.videoSecondaryInfoRenderer.owner.videoOwnerRenderer;
    channelId = videoOwnerRenderer.navigationEndpoint.browseEndpoint.browseId;
    thumbnails = videoOwnerRenderer.thumbnail.thumbnails.map((thumbnail) => {
      thumbnail.url = new URL(
        thumbnail.url,
        $14887bf853270ad0$var$BASE_URL
      ).toString();
      return thumbnail;
    });
    subscriberCount = $9e487c419ed1bfee$export$f18057c1757876c5(
      $14887bf853270ad0$var$getText(videoOwnerRenderer.subscriberCountText)
    );
    verified = $14887bf853270ad0$var$isVerified(videoOwnerRenderer.badges);
  } catch (err) {
    // Do nothing.
  }
  try {
    let videoDetails =
      info.player_response.microformat &&
      info.player_response.microformat.playerMicroformatRenderer;
    let id =
      (videoDetails && videoDetails.channelId) ||
      channelId ||
      info.player_response.videoDetails.channelId;
    let author = {
      id: id,
      name: videoDetails
        ? videoDetails.ownerChannelName
        : info.player_response.videoDetails.author,
      user: videoDetails
        ? videoDetails.ownerProfileUrl.split("/").slice(-1)[0]
        : null,
      channel_url: `https://www.youtube.com/channel/${id}`,
      external_channel_url: videoDetails
        ? `https://www.youtube.com/channel/${videoDetails.externalChannelId}`
        : "",
      user_url: videoDetails
        ? new URL(
            videoDetails.ownerProfileUrl,
            $14887bf853270ad0$var$BASE_URL
          ).toString()
        : "",
      thumbnails: thumbnails,
      verified: verified,
      subscriber_count: subscriberCount,
    };
    if (thumbnails.length)
      $9e487c419ed1bfee$export$b680e6b2c82f8c2f(
        author,
        "avatar",
        author.thumbnails[0].url,
        "author.avatar",
        "author.thumbnails[0].url"
      );
    return author;
  } catch (err) {
    return {};
  }
};
const $14887bf853270ad0$var$parseRelatedVideo = (details, rvsParams) => {
  if (!details) return;
  try {
    let viewCount = $14887bf853270ad0$var$getText(details.viewCountText);
    let shortViewCount = $14887bf853270ad0$var$getText(
      details.shortViewCountText
    );
    let rvsDetails = rvsParams.find((elem) => elem.id === details.videoId);
    if (!/^\d/.test(shortViewCount))
      shortViewCount = (rvsDetails && rvsDetails.short_view_count_text) || "";
    viewCount = (/^\d/.test(viewCount) ? viewCount : shortViewCount).split(
      " "
    )[0];
    let browseEndpoint =
      details.shortBylineText.runs[0].navigationEndpoint.browseEndpoint;
    let channelId = browseEndpoint.browseId;
    let name = $14887bf853270ad0$var$getText(details.shortBylineText);
    let user = (browseEndpoint.canonicalBaseUrl || "").split("/").slice(-1)[0];
    let video = {
      id: details.videoId,
      title: $14887bf853270ad0$var$getText(details.title),
      published: $14887bf853270ad0$var$getText(details.publishedTimeText),
      author: {
        id: channelId,
        name: name,
        user: user,
        channel_url: `https://www.youtube.com/channel/${channelId}`,
        user_url: `https://www.youtube.com/user/${user}`,
        thumbnails: details.channelThumbnail.thumbnails.map((thumbnail) => {
          thumbnail.url = new URL(
            thumbnail.url,
            $14887bf853270ad0$var$BASE_URL
          ).toString();
          return thumbnail;
        }),
        verified: $14887bf853270ad0$var$isVerified(details.ownerBadges),
        [Symbol.toPrimitive]() {
          console.warn(
            `\`relatedVideo.author\` will be removed in a near future release, ` +
              `use \`relatedVideo.author.name\` instead.`
          );
          return video.author.name;
        },
      },
      short_view_count_text: shortViewCount.split(" ")[0],
      view_count: viewCount.replace(/,/g, ""),
      length_seconds: details.lengthText
        ? Math.floor(
            $14887bf853270ad0$require$parseTimestamp(
              $14887bf853270ad0$var$getText(details.lengthText)
            ) / 1000
          )
        : rvsParams && `${rvsParams.length_seconds}`,
      thumbnails: details.thumbnail.thumbnails,
      richThumbnails: details.richThumbnail
        ? details.richThumbnail.movingThumbnailRenderer.movingThumbnailDetails
            .thumbnails
        : [],
      isLive: !!(
        details.badges &&
        details.badges.find((b) => b.metadataBadgeRenderer.label === "LIVE NOW")
      ),
    };
    $9e487c419ed1bfee$export$b680e6b2c82f8c2f(
      video,
      "author_thumbnail",
      video.author.thumbnails[0].url,
      "relatedVideo.author_thumbnail",
      "relatedVideo.author.thumbnails[0].url"
    );
    $9e487c419ed1bfee$export$b680e6b2c82f8c2f(
      video,
      "ucid",
      video.author.id,
      "relatedVideo.ucid",
      "relatedVideo.author.id"
    );
    $9e487c419ed1bfee$export$b680e6b2c82f8c2f(
      video,
      "video_thumbnail",
      video.thumbnails[0].url,
      "relatedVideo.video_thumbnail",
      "relatedVideo.thumbnails[0].url"
    );
    return video;
  } catch (err) {
    // Skip.
  }
};
$14887bf853270ad0$export$3ec17fd3fbad9824 = (info) => {
  let rvsParams = [],
    secondaryResults = [];
  try {
    rvsParams = info.response.webWatchNextResponseExtensionData.relatedVideoArgs
      .split(",")
      .map((e) => $bFvJb$querystring.parse(e));
  } catch (err) {
    // Do nothing.
  }
  try {
    secondaryResults =
      info.response.contents.twoColumnWatchNextResults.secondaryResults
        .secondaryResults.results;
  } catch (err) {
    return [];
  }
  let videos = [];
  for (let result of secondaryResults || []) {
    let details = result.compactVideoRenderer;
    if (details) {
      let video = $14887bf853270ad0$var$parseRelatedVideo(details, rvsParams);
      if (video) videos.push(video);
    } else {
      let autoplay =
        result.compactAutoplayRenderer || result.itemSectionRenderer;
      if (!autoplay || !Array.isArray(autoplay.contents)) continue;
      for (let content of autoplay.contents) {
        let video = $14887bf853270ad0$var$parseRelatedVideo(
          content.compactVideoRenderer,
          rvsParams
        );
        if (video) videos.push(video);
      }
    }
  }
  return videos;
};
$14887bf853270ad0$export$eeaff9deba13523b = (info) => {
  try {
    let contents =
      info.response.contents.twoColumnWatchNextResults.results.results.contents;
    let video = contents.find((r) => r.videoPrimaryInfoRenderer);
    let buttons =
      video.videoPrimaryInfoRenderer.videoActions.menuRenderer.topLevelButtons;
    let like = buttons.find(
      (b) =>
        b.toggleButtonRenderer &&
        b.toggleButtonRenderer.defaultIcon.iconType === "LIKE"
    );
    return parseInt(
      like.toggleButtonRenderer.defaultText.accessibility.accessibilityData.label.replace(
        /\D+/g,
        ""
      )
    );
  } catch (err) {
    return null;
  }
};
$14887bf853270ad0$export$861d87713a29234d = (info) => {
  try {
    let contents =
      info.response.contents.twoColumnWatchNextResults.results.results.contents;
    let video = contents.find((r) => r.videoPrimaryInfoRenderer);
    let buttons =
      video.videoPrimaryInfoRenderer.videoActions.menuRenderer.topLevelButtons;
    let dislike = buttons.find(
      (b) =>
        b.toggleButtonRenderer &&
        b.toggleButtonRenderer.defaultIcon.iconType === "DISLIKE"
    );
    return parseInt(
      dislike.toggleButtonRenderer.defaultText.accessibility.accessibilityData.label.replace(
        /\D+/g,
        ""
      )
    );
  } catch (err) {
    return null;
  }
};
$14887bf853270ad0$export$3136aa54564d3157 = (videoDetails, info) => {
  videoDetails.thumbnails = videoDetails.thumbnail.thumbnails;
  delete videoDetails.thumbnail;
  $9e487c419ed1bfee$export$b680e6b2c82f8c2f(
    videoDetails,
    "thumbnail",
    {
      thumbnails: videoDetails.thumbnails,
    },
    "videoDetails.thumbnail.thumbnails",
    "videoDetails.thumbnails"
  );
  videoDetails.description =
    videoDetails.shortDescription ||
    $14887bf853270ad0$var$getText(videoDetails.description);
  delete videoDetails.shortDescription;
  $9e487c419ed1bfee$export$b680e6b2c82f8c2f(
    videoDetails,
    "shortDescription",
    videoDetails.description,
    "videoDetails.shortDescription",
    "videoDetails.description"
  );
  // Use more reliable `lengthSeconds` from `playerMicroformatRenderer`.
  videoDetails.lengthSeconds =
    (info.player_response.microformat &&
      info.player_response.microformat.playerMicroformatRenderer
        .lengthSeconds) ||
    info.player_response.videoDetails.lengthSeconds;
  return videoDetails;
};
$14887bf853270ad0$export$6b1f762de6dd360d = (info) => {
  const parts =
    info.player_response.storyboards &&
    info.player_response.storyboards.playerStoryboardSpecRenderer &&
    info.player_response.storyboards.playerStoryboardSpecRenderer.spec &&
    info.player_response.storyboards.playerStoryboardSpecRenderer.spec.split(
      "|"
    );
  if (!parts) return [];
  const url = new URL(parts.shift());
  return parts.map((part, i) => {
    let [
      thumbnailWidth,
      thumbnailHeight,
      thumbnailCount,
      columns,
      rows,
      interval,
      nameReplacement,
      sigh,
    ] = part.split("#");
    url.searchParams.set("sigh", sigh);
    thumbnailCount = parseInt(thumbnailCount, 10);
    columns = parseInt(columns, 10);
    rows = parseInt(rows, 10);
    const storyboardCount = Math.ceil(thumbnailCount / (columns * rows));
    return {
      templateUrl: url
        .toString()
        .replace("$L", i)
        .replace("$N", nameReplacement),
      thumbnailWidth: parseInt(thumbnailWidth, 10),
      thumbnailHeight: parseInt(thumbnailHeight, 10),
      thumbnailCount: thumbnailCount,
      interval: parseInt(interval, 10),
      columns: columns,
      rows: rows,
      storyboardCount: storyboardCount,
    };
  });
};
$14887bf853270ad0$export$1cce38d69c579042 = (info) => {
  const playerOverlayRenderer =
    info.response &&
    info.response.playerOverlays &&
    info.response.playerOverlays.playerOverlayRenderer;
  const playerBar =
    playerOverlayRenderer &&
    playerOverlayRenderer.decoratedPlayerBarRenderer &&
    playerOverlayRenderer.decoratedPlayerBarRenderer
      .decoratedPlayerBarRenderer &&
    playerOverlayRenderer.decoratedPlayerBarRenderer.decoratedPlayerBarRenderer
      .playerBar;
  const markersMap =
    playerBar &&
    playerBar.multiMarkersPlayerBarRenderer &&
    playerBar.multiMarkersPlayerBarRenderer.markersMap;
  const marker =
    Array.isArray(markersMap) &&
    markersMap.find((m) => m.value && Array.isArray(m.value.chapters));
  if (!marker) return [];
  const chapters = marker.value.chapters;
  return chapters.map((chapter) => ({
    title: $14887bf853270ad0$var$getText(chapter.chapterRenderer.title),
    start_time: chapter.chapterRenderer.timeRangeStartMillis / 1000,
  }));
};

// A shared cache to keep track of html5player js functions.
var $ef142356725d92ef$export$69a3209f1a06c04d;
/**
 * Extract signature deciphering and n parameter transform functions from html5player file.
 *
 * @param {string} html5playerfile
 * @param {Object} options
 * @returns {Promise<Array.<string>>}
 */ var $ef142356725d92ef$export$7d4c14593b8a2193;
/**
 * Extracts the actions that should be taken to decipher a signature
 * and tranform the n parameter
 *
 * @param {string} body
 * @returns {Array.<string>}
 */ var $ef142356725d92ef$export$9c5d996785df9521;
/**
 * Apply decipher and n-transform to individual format
 *
 * @param {Object} format
 * @param {vm.Script} decipherScript
 * @param {vm.Script} nTransformScript
 */ var $ef142356725d92ef$export$c106be2e1927d8b5;
/**
 * Applies decipher and n parameter transforms to all format URL's.
 *
 * @param {Array.<Object>} formats
 * @param {string} html5player
 * @param {Object} options
 */ var $ef142356725d92ef$export$343deac558efb5d5;

var $bc60c53823d01114$exports = {};

var $bc60c53823d01114$require$setTimeout = $bFvJb$timers.setTimeout;
// A cache that expires.
$bc60c53823d01114$exports = class Cache extends Map {
  constructor(timeout = 1000) {
    super();
    this.timeout = timeout;
  }
  set(key, value) {
    if (this.has(key)) clearTimeout(super.get(key).tid);
    super.set(key, {
      tid: $bc60c53823d01114$require$setTimeout(
        this.delete.bind(this, key),
        this.timeout
      ).unref(),
      value: value,
    });
  }
  get(key) {
    let entry = super.get(key);
    if (entry) return entry.value;
    return null;
  }
  getOrSet(key, fn) {
    if (this.has(key)) return this.get(key);
    else {
      let value = fn();
      this.set(key, value);
      (async () => {
        try {
          await value;
        } catch (err) {
          this.delete(key);
        }
      })();
      return value;
    }
  }
  delete(key) {
    let entry = super.get(key);
    if (entry) {
      clearTimeout(entry.tid);
      super.delete(key);
    }
  }
  clear() {
    for (let entry of this.values()) clearTimeout(entry.tid);
    super.clear();
  }
};

$ef142356725d92ef$export$69a3209f1a06c04d = new $bc60c53823d01114$exports();
$ef142356725d92ef$export$7d4c14593b8a2193 = (html5playerfile, options) =>
  $ef142356725d92ef$export$69a3209f1a06c04d.getOrSet(
    html5playerfile,
    async () => {
      const body = await $9e487c419ed1bfee$export$cbbbf91b85781804(
        html5playerfile,
        options
      ).text();
      const functions = $ef142356725d92ef$export$9c5d996785df9521(body);
      if (!functions || !functions.length)
        throw Error("Could not extract functions");
      $ef142356725d92ef$export$69a3209f1a06c04d.set(html5playerfile, functions);
      return functions;
    }
  );
$ef142356725d92ef$export$9c5d996785df9521 = (body) => {
  const functions = [];
  const extractManipulations = (caller) => {
    const functionName = $9e487c419ed1bfee$export$cf95c51b03f10bae(
      caller,
      `a=a.split("");`,
      `.`
    );
    if (!functionName) return "";
    const functionStart = `var ${functionName}={`;
    const ndx = body.indexOf(functionStart);
    if (ndx < 0) return "";
    const subBody = body.slice(ndx + functionStart.length - 1);
    return `var ${functionName}=${$9e487c419ed1bfee$export$beb63bc92c294b1d(
      subBody
    )}`;
  };
  const extractDecipher = () => {
    const functionName = $9e487c419ed1bfee$export$cf95c51b03f10bae(
      body,
      `a.set("alr","yes");c&&(c=`,
      `(decodeURIC`
    );
    if (functionName && functionName.length) {
      const functionStart = `${functionName}=function(a)`;
      const ndx = body.indexOf(functionStart);
      if (ndx >= 0) {
        const subBody = body.slice(ndx + functionStart.length);
        let functionBody = `var ${functionStart}${$9e487c419ed1bfee$export$beb63bc92c294b1d(
          subBody
        )}`;
        functionBody = `${extractManipulations(
          functionBody
        )};${functionBody};${functionName}(sig);`;
        functions.push(functionBody);
      }
    }
  };
  const extractNCode = () => {
    let functionName = $9e487c419ed1bfee$export$cf95c51b03f10bae(
      body,
      `&&(b=a.get("n"))&&(b=`,
      `(b)`
    );
    if (functionName.includes("["))
      functionName = $9e487c419ed1bfee$export$cf95c51b03f10bae(
        body,
        `${functionName.split("[")[0]}=[`,
        `]`
      );
    if (functionName && functionName.length) {
      const functionStart = `${functionName}=function(a)`;
      const ndx = body.indexOf(functionStart);
      if (ndx >= 0) {
        const subBody = body.slice(ndx + functionStart.length);
        const functionBody = `var ${functionStart}${$9e487c419ed1bfee$export$beb63bc92c294b1d(
          subBody
        )};${functionName}(ncode);`;
        functions.push(functionBody);
      }
    }
  };
  extractDecipher();
  extractNCode();
  return functions;
};
$ef142356725d92ef$export$c106be2e1927d8b5 = (
  format,
  decipherScript,
  nTransformScript
) => {
  const decipher = (url) => {
    const args = $bFvJb$querystring.parse(url);
    if (!args.s || !decipherScript) return args.url;
    const components = new URL(decodeURIComponent(args.url));
    components.searchParams.set(
      args.sp ? args.sp : "signature",
      decipherScript.runInNewContext({
        sig: decodeURIComponent(args.s),
      })
    );
    return components.toString();
  };
  const ncode = (url) => {
    const components = new URL(decodeURIComponent(url));
    const n = components.searchParams.get("n");
    if (!n || !nTransformScript) return url;
    components.searchParams.set(
      "n",
      nTransformScript.runInNewContext({
        ncode: n,
      })
    );
    return components.toString();
  };
  const cipher = !format.url;
  const url = format.url || format.signatureCipher || format.cipher;
  format.url = cipher ? ncode(decipher(url)) : ncode(url);
  delete format.signatureCipher;
  delete format.cipher;
};
$ef142356725d92ef$export$343deac558efb5d5 = async (
  formats,
  html5player,
  options
) => {
  let decipheredFormats = {};
  let functions = await $ef142356725d92ef$export$7d4c14593b8a2193(
    html5player,
    options
  );
  const decipherScript = functions.length
    ? new $bFvJb$vm.Script(functions[0])
    : null;
  const nTransformScript =
    functions.length > 1 ? new $bFvJb$vm.Script(functions[1]) : null;
  formats.forEach((format) => {
    $ef142356725d92ef$export$c106be2e1927d8b5(
      format,
      decipherScript,
      nTransformScript
    );
    decipheredFormats[format.url] = format;
  });
  return decipheredFormats;
};

const $2cd12ba1b1bd64cd$var$BASE_URL = "https://www.youtube.com/watch?v=";
// Cached for storing basic/full info.
$2cd12ba1b1bd64cd$exports.cache = new $bc60c53823d01114$exports();
$2cd12ba1b1bd64cd$exports.cookieCache = new $bc60c53823d01114$exports(86400000);
$2cd12ba1b1bd64cd$exports.watchPageCache = new $bc60c53823d01114$exports();
// Cache for cver used in getVideoInfoPage
let $2cd12ba1b1bd64cd$var$cver = "2.20210622.10.00";
// Special error class used to determine if an error is unrecoverable,
// as in, ytdl-core should not try again to fetch the video metadata.
// In this case, the video is usually unavailable in some way.
class $2cd12ba1b1bd64cd$var$UnrecoverableError extends Error {}
// List of URLs that show up in `notice_url` for age restricted videos.
const $2cd12ba1b1bd64cd$var$AGE_RESTRICTED_URLS = [
  "support.google.com/youtube/?p=age_restrictions",
  "youtube.com/t/community_guidelines",
];
/**
 * Gets info from a video without getting additional formats.
 *
 * @param {string} id
 * @param {Object} options
 * @returns {Promise<Object>}
 */ $2cd12ba1b1bd64cd$exports.getBasicInfo = async (id, options) => {
  if (options.IPv6Block)
    options.requestOptions = Object.assign({}, options.requestOptions, {
      family: 6,
      localAddress: $9e487c419ed1bfee$export$172352d6ffeaaf22(
        options.IPv6Block
      ),
    });
  const retryOptions = Object.assign(
    {},
    $7XA7f.defaultOptions,
    options.requestOptions
  );
  options.requestOptions = Object.assign({}, options.requestOptions, {});
  options.requestOptions.headers = Object.assign(
    {},
    {
      // eslint-disable-next-line max-len
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.101 Safari/537.36",
    },
    options.requestOptions.headers
  );
  const validate = (info) => {
    let playErr = $9e487c419ed1bfee$export$8d19b782e6cae425(
      info.player_response,
      ["ERROR"],
      $2cd12ba1b1bd64cd$var$UnrecoverableError
    );
    let privateErr = $2cd12ba1b1bd64cd$var$privateVideoError(
      info.player_response
    );
    if (playErr || privateErr) throw playErr || privateErr;
    return (
      info &&
      info.player_response &&
      (info.player_response.streamingData ||
        $2cd12ba1b1bd64cd$var$isRental(info.player_response) ||
        $2cd12ba1b1bd64cd$var$isNotYetBroadcasted(info.player_response))
    );
  };
  let info = await $2cd12ba1b1bd64cd$var$pipeline(
    [id, options],
    validate,
    retryOptions,
    [
      $2cd12ba1b1bd64cd$var$getWatchHTMLPage,
      $2cd12ba1b1bd64cd$var$getWatchJSONPage,
      $2cd12ba1b1bd64cd$var$getVideoInfoPage,
    ]
  );
  Object.assign(info, {
    formats: $2cd12ba1b1bd64cd$var$parseFormats(info.player_response),
    related_videos: $14887bf853270ad0$export$3ec17fd3fbad9824(info),
  });
  // Add additional properties to info.
  const media = $14887bf853270ad0$export$a854ab43349813f2(info);
  const additional = {
    author: $14887bf853270ad0$export$31577d79be25397a(info),
    media: media,
    likes: $14887bf853270ad0$export$eeaff9deba13523b(info),
    dislikes: $14887bf853270ad0$export$861d87713a29234d(info),
    age_restricted: !!(
      media &&
      $2cd12ba1b1bd64cd$var$AGE_RESTRICTED_URLS.some((url) =>
        Object.values(media).some(
          (v) => typeof v === "string" && v.includes(url)
        )
      )
    ),
    // Give the standard link to the video.
    video_url: $2cd12ba1b1bd64cd$var$BASE_URL + id,
    storyboards: $14887bf853270ad0$export$6b1f762de6dd360d(info),
    chapters: $14887bf853270ad0$export$1cce38d69c579042(info),
  };
  info.videoDetails = $14887bf853270ad0$export$3136aa54564d3157(
    Object.assign(
      {},
      info.player_response &&
        info.player_response.microformat &&
        info.player_response.microformat.playerMicroformatRenderer,
      info.player_response && info.player_response.videoDetails,
      additional
    ),
    info
  );
  return info;
};
const $2cd12ba1b1bd64cd$var$privateVideoError = (player_response) => {
  let playability = player_response && player_response.playabilityStatus;
  if (
    playability &&
    playability.status === "LOGIN_REQUIRED" &&
    playability.messages &&
    playability.messages.filter((m) => /This is a private video/.test(m)).length
  )
    return new $2cd12ba1b1bd64cd$var$UnrecoverableError(
      playability.reason || (playability.messages && playability.messages[0])
    );
  else return null;
};
const $2cd12ba1b1bd64cd$var$isRental = (player_response) => {
  let playability = player_response.playabilityStatus;
  return (
    playability &&
    playability.status === "UNPLAYABLE" &&
    playability.errorScreen &&
    playability.errorScreen.playerLegacyDesktopYpcOfferRenderer
  );
};
const $2cd12ba1b1bd64cd$var$isNotYetBroadcasted = (player_response) => {
  let playability = player_response.playabilityStatus;
  return playability && playability.status === "LIVE_STREAM_OFFLINE";
};
const $2cd12ba1b1bd64cd$var$getWatchHTMLURL = (id, options) =>
  `${$2cd12ba1b1bd64cd$var$BASE_URL + id}&hl=${options.lang || "en"}`;
const $2cd12ba1b1bd64cd$var$getWatchHTMLPageBody = (id, options) => {
  const url = $2cd12ba1b1bd64cd$var$getWatchHTMLURL(id, options);
  return $2cd12ba1b1bd64cd$exports.watchPageCache.getOrSet(url, () =>
    $9e487c419ed1bfee$export$cbbbf91b85781804(url, options).text()
  );
};
const $2cd12ba1b1bd64cd$var$EMBED_URL = "https://www.youtube.com/embed/";
const $2cd12ba1b1bd64cd$var$getEmbedPageBody = (id, options) => {
  const embedUrl = `${$2cd12ba1b1bd64cd$var$EMBED_URL + id}?hl=${
    options.lang || "en"
  }`;
  return $9e487c419ed1bfee$export$cbbbf91b85781804(embedUrl, options).text();
};
const $2cd12ba1b1bd64cd$var$getHTML5player = (body) => {
  let html5playerRes =
    /<script\s+src="([^"]+)"(?:\s+type="text\/javascript")?\s+name="player_ias\/base"\s*>|"jsUrl":"([^"]+)"/.exec(
      body
    );
  return html5playerRes ? html5playerRes[1] || html5playerRes[2] : null;
};
const $2cd12ba1b1bd64cd$var$getIdentityToken = (
  id,
  options,
  key,
  throwIfNotFound
) =>
  $2cd12ba1b1bd64cd$exports.cookieCache.getOrSet(key, async () => {
    let page = await $2cd12ba1b1bd64cd$var$getWatchHTMLPageBody(id, options);
    let match = page.match(/(["'])ID_TOKEN\1[:,]\s?"([^"]+)"/);
    if (!match && throwIfNotFound)
      throw new $2cd12ba1b1bd64cd$var$UnrecoverableError(
        "Cookie header used in request, but unable to find YouTube identity token"
      );
    return match && match[2];
  });
/**
 * Goes through each endpoint in the pipeline, retrying on failure if the error is recoverable.
 * If unable to succeed with one endpoint, moves onto the next one.
 *
 * @param {Array.<Object>} args
 * @param {Function} validate
 * @param {Object} retryOptions
 * @param {Array.<Function>} endpoints
 * @returns {[Object, Object, Object]}
 */ const $2cd12ba1b1bd64cd$var$pipeline = async (
  args,
  validate,
  retryOptions,
  endpoints
) => {
  let info;
  for (let func of endpoints)
    try {
      const newInfo = await $2cd12ba1b1bd64cd$var$retryFunc(
        func,
        args.concat([info]),
        retryOptions
      );
      if (newInfo.player_response) {
        newInfo.player_response.videoDetails = $2cd12ba1b1bd64cd$var$assign(
          info && info.player_response && info.player_response.videoDetails,
          newInfo.player_response.videoDetails
        );
        newInfo.player_response = $2cd12ba1b1bd64cd$var$assign(
          info && info.player_response,
          newInfo.player_response
        );
      }
      info = $2cd12ba1b1bd64cd$var$assign(info, newInfo);
      if (validate(info, false)) break;
    } catch (err) {
      if (
        err instanceof $2cd12ba1b1bd64cd$var$UnrecoverableError ||
        func === endpoints[endpoints.length - 1]
      )
        throw err;
      // Unable to find video metadata... so try next endpoint.
    }
  return info;
};
/**
 * Like Object.assign(), but ignores `null` and `undefined` from `source`.
 *
 * @param {Object} target
 * @param {Object} source
 * @returns {Object}
 */ const $2cd12ba1b1bd64cd$var$assign = (target, source) => {
  if (!target || !source) return target || source;
  for (let [key, value] of Object.entries(source))
    if (value !== null && value !== undefined) target[key] = value;
  return target;
};
/**
 * Given a function, calls it with `args` until it's successful,
 * or until it encounters an unrecoverable error.
 * Currently, any error from miniget is considered unrecoverable. Errors such as
 * too many redirects, invalid URL, status code 404, status code 502.
 *
 * @param {Function} func
 * @param {Array.<Object>} args
 * @param {Object} options
 * @param {number} options.maxRetries
 * @param {Object} options.backoff
 * @param {number} options.backoff.inc
 */ const $2cd12ba1b1bd64cd$var$retryFunc = async (func, args, options) => {
  let currentTry = 0,
    result;
  while (currentTry <= options.maxRetries)
    try {
      result = await func(...args);
      break;
    } catch (err) {
      if (
        err instanceof $2cd12ba1b1bd64cd$var$UnrecoverableError ||
        (err instanceof $7XA7f.MinigetError && err.statusCode < 500) ||
        currentTry >= options.maxRetries
      )
        throw err;
      let wait = Math.min(
        ++currentTry * options.backoff.inc,
        options.backoff.max
      );
      await new Promise((resolve) =>
        $2cd12ba1b1bd64cd$require$setTimeout(resolve, wait)
      );
    }
  return result;
};
const $2cd12ba1b1bd64cd$var$jsonClosingChars = /^[)\]}'\s]+/;
const $2cd12ba1b1bd64cd$var$parseJSON = (source, varName, json) => {
  if (!json || typeof json === "object") return json;
  else
    try {
      json = json.replace($2cd12ba1b1bd64cd$var$jsonClosingChars, "");
      return JSON.parse(json);
    } catch (err) {
      throw Error(`Error parsing ${varName} in ${source}: ${err.message}`);
    }
};
const $2cd12ba1b1bd64cd$var$findJSON = (
  source,
  varName,
  body,
  left,
  right,
  prependJSON
) => {
  let jsonStr = $9e487c419ed1bfee$export$cf95c51b03f10bae(body, left, right);
  if (!jsonStr) throw Error(`Could not find ${varName} in ${source}`);
  return $2cd12ba1b1bd64cd$var$parseJSON(
    source,
    varName,
    $9e487c419ed1bfee$export$beb63bc92c294b1d(`${prependJSON}${jsonStr}`)
  );
};
const $2cd12ba1b1bd64cd$var$findPlayerResponse = (source, info) => {
  const player_response =
    info &&
    ((info.args && info.args.player_response) ||
      info.player_response ||
      info.playerResponse ||
      info.embedded_player_response);
  return $2cd12ba1b1bd64cd$var$parseJSON(
    source,
    "player_response",
    player_response
  );
};
const $2cd12ba1b1bd64cd$var$getWatchJSONURL = (id, options) =>
  `${$2cd12ba1b1bd64cd$var$getWatchHTMLURL(id, options)}&pbj=1`;
const $2cd12ba1b1bd64cd$var$getWatchJSONPage = async (id, options) => {
  const reqOptions = Object.assign(
    {
      headers: {},
    },
    options.requestOptions
  );
  let cookie = reqOptions.headers.Cookie || reqOptions.headers.cookie;
  reqOptions.headers = Object.assign(
    {
      "x-youtube-client-name": "1",
      "x-youtube-client-version": $2cd12ba1b1bd64cd$var$cver,
      "x-youtube-identity-token":
        $2cd12ba1b1bd64cd$exports.cookieCache.get(cookie || "browser") || "",
    },
    reqOptions.headers
  );
  const setIdentityToken = async (key, throwIfNotFound) => {
    if (reqOptions.headers["x-youtube-identity-token"]) return;
    reqOptions.headers["x-youtube-identity-token"] =
      await $2cd12ba1b1bd64cd$var$getIdentityToken(
        id,
        options,
        key,
        throwIfNotFound
      );
  };
  if (cookie) await setIdentityToken(cookie, true);
  const jsonUrl = $2cd12ba1b1bd64cd$var$getWatchJSONURL(id, options);
  const body = await $9e487c419ed1bfee$export$cbbbf91b85781804(
    jsonUrl,
    options,
    reqOptions
  ).text();
  let parsedBody = $2cd12ba1b1bd64cd$var$parseJSON("watch.json", "body", body);
  if (parsedBody.reload === "now") await setIdentityToken("browser", false);
  if (parsedBody.reload === "now" || !Array.isArray(parsedBody))
    throw Error("Unable to retrieve video metadata in watch.json");
  let info = parsedBody.reduce((part, curr) => Object.assign(curr, part), {});
  info.player_response = $2cd12ba1b1bd64cd$var$findPlayerResponse(
    "watch.json",
    info
  );
  info.html5player = info.player && info.player.assets && info.player.assets.js;
  return info;
};
const $2cd12ba1b1bd64cd$var$getWatchHTMLPage = async (id, options) => {
  let body = await $2cd12ba1b1bd64cd$var$getWatchHTMLPageBody(id, options);
  let info = {
    page: "watch",
  };
  try {
    $2cd12ba1b1bd64cd$var$cver = $9e487c419ed1bfee$export$cf95c51b03f10bae(
      body,
      '{"key":"cver","value":"',
      '"}'
    );
    info.player_response = $2cd12ba1b1bd64cd$var$findJSON(
      "watch.html",
      "player_response",
      body,
      /\bytInitialPlayerResponse\s*=\s*\{/i,
      "</script>",
      "{"
    );
  } catch (err) {
    let args = $2cd12ba1b1bd64cd$var$findJSON(
      "watch.html",
      "player_response",
      body,
      /\bytplayer\.config\s*=\s*{/,
      "</script>",
      "{"
    );
    info.player_response = $2cd12ba1b1bd64cd$var$findPlayerResponse(
      "watch.html",
      args
    );
  }
  info.response = $2cd12ba1b1bd64cd$var$findJSON(
    "watch.html",
    "response",
    body,
    /\bytInitialData("\])?\s*=\s*\{/i,
    "</script>",
    "{"
  );
  info.html5player = $2cd12ba1b1bd64cd$var$getHTML5player(body);
  return info;
};
const $2cd12ba1b1bd64cd$var$INFO_HOST = "www.youtube.com";
const $2cd12ba1b1bd64cd$var$INFO_PATH = "/get_video_info";
const $2cd12ba1b1bd64cd$var$VIDEO_EURL = "https://youtube.googleapis.com/v/";
const $2cd12ba1b1bd64cd$var$getVideoInfoPage = async (id, options) => {
  const url = new URL(
    `https://${$2cd12ba1b1bd64cd$var$INFO_HOST}${$2cd12ba1b1bd64cd$var$INFO_PATH}`
  );
  url.searchParams.set("video_id", id);
  url.searchParams.set("c", "TVHTML5");
  url.searchParams.set("cver", `7${$2cd12ba1b1bd64cd$var$cver.substr(1)}`);
  url.searchParams.set("eurl", $2cd12ba1b1bd64cd$var$VIDEO_EURL + id);
  url.searchParams.set("ps", "default");
  url.searchParams.set("gl", "US");
  url.searchParams.set("hl", options.lang || "en");
  url.searchParams.set("html5", "1");
  const body = await $9e487c419ed1bfee$export$cbbbf91b85781804(
    url.toString(),
    options
  ).text();
  let info = $bFvJb$querystring.parse(body);
  info.player_response = $2cd12ba1b1bd64cd$var$findPlayerResponse(
    "get_video_info",
    info
  );
  return info;
};
/**
 * @param {Object} player_response
 * @returns {Array.<Object>}
 */ const $2cd12ba1b1bd64cd$var$parseFormats = (player_response) => {
  let formats = [];
  if (player_response && player_response.streamingData)
    formats = formats
      .concat(player_response.streamingData.formats || [])
      .concat(player_response.streamingData.adaptiveFormats || []);
  return formats;
};
/**
 * Gets info from a video additional formats and deciphered URLs.
 *
 * @param {string} id
 * @param {Object} options
 * @returns {Promise<Object>}
 */ $2cd12ba1b1bd64cd$exports.getInfo = async (id, options) => {
  let info = await $2cd12ba1b1bd64cd$exports.getBasicInfo(id, options);
  const hasManifest =
    info.player_response &&
    info.player_response.streamingData &&
    (info.player_response.streamingData.dashManifestUrl ||
      info.player_response.streamingData.hlsManifestUrl);
  let funcs = [];
  if (info.formats.length) {
    info.html5player =
      info.html5player ||
      $2cd12ba1b1bd64cd$var$getHTML5player(
        await $2cd12ba1b1bd64cd$var$getWatchHTMLPageBody(id, options)
      ) ||
      $2cd12ba1b1bd64cd$var$getHTML5player(
        await $2cd12ba1b1bd64cd$var$getEmbedPageBody(id, options)
      );
    if (!info.html5player) throw Error("Unable to find html5player file");
    const html5player = new URL(
      info.html5player,
      $2cd12ba1b1bd64cd$var$BASE_URL
    ).toString();
    funcs.push(
      $ef142356725d92ef$export$343deac558efb5d5(
        info.formats,
        html5player,
        options
      )
    );
  }
  if (hasManifest && info.player_response.streamingData.dashManifestUrl) {
    let url = info.player_response.streamingData.dashManifestUrl;
    funcs.push($2cd12ba1b1bd64cd$var$getDashManifest(url, options));
  }
  if (hasManifest && info.player_response.streamingData.hlsManifestUrl) {
    let url = info.player_response.streamingData.hlsManifestUrl;
    funcs.push($2cd12ba1b1bd64cd$var$getM3U8(url, options));
  }
  let results = await Promise.all(funcs);
  info.formats = Object.values(Object.assign({}, ...results));
  info.formats = info.formats.map($a6a611812c024fb8$export$60661bdb0a3f990);
  info.formats.sort($a6a611812c024fb8$export$d9f205bb0c99d6d8);
  info.full = true;
  return info;
};
/**
 * Gets additional DASH formats.
 *
 * @param {string} url
 * @param {Object} options
 * @returns {Promise<Array.<Object>>}
 */ const $2cd12ba1b1bd64cd$var$getDashManifest = (url, options) =>
  new Promise((resolve, reject) => {
    let formats = {};
    const parser = $1Vc1h.parser(false);
    parser.onerror = reject;
    let adaptationSet;
    parser.onopentag = (node) => {
      if (node.name === "ADAPTATIONSET") adaptationSet = node.attributes;
      else if (node.name === "REPRESENTATION") {
        const itag = parseInt(node.attributes.ID);
        if (!isNaN(itag))
          formats[url] = Object.assign(
            {
              itag: itag,
              url: url,
              bitrate: parseInt(node.attributes.BANDWIDTH),
              mimeType: `${adaptationSet.MIMETYPE}; codecs="${node.attributes.CODECS}"`,
            },
            node.attributes.HEIGHT
              ? {
                  width: parseInt(node.attributes.WIDTH),
                  height: parseInt(node.attributes.HEIGHT),
                  fps: parseInt(node.attributes.FRAMERATE),
                }
              : {
                  audioSampleRate: node.attributes.AUDIOSAMPLINGRATE,
                }
          );
      }
    };
    parser.onend = () => {
      resolve(formats);
    };
    const req = $9e487c419ed1bfee$export$cbbbf91b85781804(
      new URL(url, $2cd12ba1b1bd64cd$var$BASE_URL).toString(),
      options
    );
    req.setEncoding("utf8");
    req.on("error", reject);
    req.on("data", (chunk) => {
      parser.write(chunk);
    });
    req.on("end", parser.close.bind(parser));
  });
/**
 * Gets additional formats.
 *
 * @param {string} url
 * @param {Object} options
 * @returns {Promise<Array.<Object>>}
 */ const $2cd12ba1b1bd64cd$var$getM3U8 = async (url, options) => {
  url = new URL(url, $2cd12ba1b1bd64cd$var$BASE_URL);
  const body = await $9e487c419ed1bfee$export$cbbbf91b85781804(
    url.toString(),
    options
  ).text();
  let formats = {};
  body
    .split("\n")
    .filter((line) => /^https?:\/\//.test(line))
    .forEach((line) => {
      const itag = parseInt(line.match(/\/itag\/(\d+)\//)[1]);
      formats[line] = {
        itag: itag,
        url: line,
      };
    });
  return formats;
};
// Cache get info functions.
// In case a user wants to get a video's info before downloading.
for (let funcName of ["getBasicInfo", "getInfo"]) {
  /**
   * @param {string} link
   * @param {Object} options
   * @returns {Promise<Object>}
   */ const func = $2cd12ba1b1bd64cd$exports[funcName];
  $2cd12ba1b1bd64cd$exports[funcName] = async (link, options = {}) => {
    $9e487c419ed1bfee$export$2e6670267debbbbd();
    let id = await $46e228770841cea1$export$50ad4c25e09db482(link);
    const key = [funcName, id, options.lang].join("-");
    return $2cd12ba1b1bd64cd$exports.cache.getOrSet(key, () =>
      func(id, options)
    );
  };
}
// Export a few helpers.
$2cd12ba1b1bd64cd$exports.validateID = $46e228770841cea1$export$1c6e21294c7e6fa;
$2cd12ba1b1bd64cd$exports.validateURL =
  $46e228770841cea1$export$c6e27db96f1f206c;
$2cd12ba1b1bd64cd$exports.getURLVideoID =
  $46e228770841cea1$export$622ec0af9fe46952;
$2cd12ba1b1bd64cd$exports.getVideoID =
  $46e228770841cea1$export$50ad4c25e09db482;

var $7XA7f = parcelRequire("7XA7f");

var $eebb97b722c83852$require$parseTimestamp =
  $b68378607095a1b4$exports.parseTimestamp;
/**
 * @param {string} link
 * @param {!Object} options
 * @returns {ReadableStream}
 */ const $eebb97b722c83852$var$ytdl = (link, options) => {
  const stream = $eebb97b722c83852$var$createStream(options);
  $eebb97b722c83852$var$ytdl.getInfo(link, options).then((info) => {
    $eebb97b722c83852$var$downloadFromInfoCallback(stream, info, options);
  }, stream.emit.bind(stream, "error"));
  return stream;
};
$eebb97b722c83852$exports = $eebb97b722c83852$var$ytdl;
$eebb97b722c83852$var$ytdl.getBasicInfo =
  $2cd12ba1b1bd64cd$exports.getBasicInfo;
$eebb97b722c83852$var$ytdl.getInfo = $2cd12ba1b1bd64cd$exports.getInfo;
$eebb97b722c83852$var$ytdl.chooseFormat =
  $a6a611812c024fb8$export$b7b4e2cc23c2841b;
$eebb97b722c83852$var$ytdl.filterFormats =
  $a6a611812c024fb8$export$9af3ec9872eb3045;
$eebb97b722c83852$var$ytdl.validateID =
  $46e228770841cea1$export$1c6e21294c7e6fa;
$eebb97b722c83852$var$ytdl.validateURL =
  $46e228770841cea1$export$c6e27db96f1f206c;
$eebb97b722c83852$var$ytdl.getURLVideoID =
  $46e228770841cea1$export$622ec0af9fe46952;
$eebb97b722c83852$var$ytdl.getVideoID =
  $46e228770841cea1$export$50ad4c25e09db482;
$eebb97b722c83852$var$ytdl.cache = {
  sig: $ef142356725d92ef$export$69a3209f1a06c04d,
  info: $2cd12ba1b1bd64cd$exports.cache,
  watch: $2cd12ba1b1bd64cd$exports.watchPageCache,
  cookie: $2cd12ba1b1bd64cd$exports.cookieCache,
};

$eebb97b722c83852$var$ytdl.version = parcelRequire("8ZGq3").version;
const $eebb97b722c83852$var$createStream = (options) => {
  const stream = new $eebb97b722c83852$require$PassThrough({
    highWaterMark: (options && options.highWaterMark) || 524288,
  });
  stream._destroy = () => {
    stream.destroyed = true;
  };
  return stream;
};
const $eebb97b722c83852$var$pipeAndSetEvents = (req, stream, end) => {
  // Forward events from the request to the stream.
  [
    "abort",
    "request",
    "response",
    "error",
    "redirect",
    "retry",
    "reconnect",
  ].forEach((event) => {
    req.prependListener(event, stream.emit.bind(stream, event));
  });
  req.pipe(stream, {
    end: end,
  });
};
/**
 * Chooses a format to download.
 *
 * @param {stream.Readable} stream
 * @param {Object} info
 * @param {Object} options
 */ const $eebb97b722c83852$var$downloadFromInfoCallback = (
  stream,
  info,
  options
) => {
  options = options || {};
  let err = $9e487c419ed1bfee$export$8d19b782e6cae425(info.player_response, [
    "UNPLAYABLE",
    "LIVE_STREAM_OFFLINE",
    "LOGIN_REQUIRED",
  ]);
  if (err) {
    stream.emit("error", err);
    return;
  }
  if (!info.formats.length) {
    stream.emit("error", Error("This video is unavailable"));
    return;
  }
  let format;
  try {
    format = $a6a611812c024fb8$export$b7b4e2cc23c2841b(info.formats, options);
  } catch (e) {
    stream.emit("error", e);
    return;
  }
  stream.emit("info", info, format);
  if (stream.destroyed) return;
  let contentLength,
    downloaded = 0;
  const ondata = (chunk) => {
    downloaded += chunk.length;
    stream.emit("progress", chunk.length, downloaded, contentLength);
  };
  if (options.IPv6Block)
    options.requestOptions = Object.assign({}, options.requestOptions, {
      family: 6,
      localAddress: $9e487c419ed1bfee$export$172352d6ffeaaf22(
        options.IPv6Block
      ),
    });
  // Download the file in chunks, in this case the default is 10MB,
  // anything over this will cause youtube to throttle the download
  const dlChunkSize = options.dlChunkSize || 10485760;
  let req;
  let shouldEnd = true;
  if (format.isHLS || format.isDashMPD) {
    req = $b68378607095a1b4$exports(format.url, {
      chunkReadahead: +info.live_chunk_readahead,
      begin: options.begin || (format.isLive && Date.now()),
      liveBuffer: options.liveBuffer,
      requestOptions: options.requestOptions,
      parser: format.isDashMPD ? "dash-mpd" : "m3u8",
      id: format.itag,
    });
    req.on("progress", (segment, totalSegments) => {
      stream.emit("progress", segment.size, segment.num, totalSegments);
    });
    $eebb97b722c83852$var$pipeAndSetEvents(req, stream, shouldEnd);
  } else {
    const requestOptions = Object.assign({}, options.requestOptions, {
      maxReconnects: 6,
      maxRetries: 3,
      backoff: {
        inc: 500,
        max: 10000,
      },
    });
    let shouldBeChunked =
      dlChunkSize !== 0 && (!format.hasAudio || !format.hasVideo);
    if (shouldBeChunked) {
      let start = (options.range && options.range.start) || 0;
      let end = start + dlChunkSize;
      const rangeEnd = options.range && options.range.end;
      contentLength = options.range
        ? (rangeEnd ? rangeEnd + 1 : parseInt(format.contentLength)) - start
        : parseInt(format.contentLength);
      const getNextChunk = () => {
        if (!rangeEnd && end >= contentLength) end = 0;
        if (rangeEnd && end > rangeEnd) end = rangeEnd;
        shouldEnd = !end || end === rangeEnd;
        requestOptions.headers = Object.assign({}, requestOptions.headers, {
          Range: `bytes=${start}-${end || ""}`,
        });
        req = $7XA7f(format.url, requestOptions);
        req.on("data", ondata);
        req.on("end", () => {
          if (stream.destroyed) return;
          if (end && end !== rangeEnd) {
            start = end + 1;
            end += dlChunkSize;
            getNextChunk();
          }
        });
        $eebb97b722c83852$var$pipeAndSetEvents(req, stream, shouldEnd);
      };
      getNextChunk();
    } else {
      // Audio only and video only formats don't support begin
      if (options.begin)
        format.url += `&begin=${$eebb97b722c83852$require$parseTimestamp(
          options.begin
        )}`;
      if (options.range && (options.range.start || options.range.end))
        requestOptions.headers = Object.assign({}, requestOptions.headers, {
          Range: `bytes=${options.range.start || "0"}-${
            options.range.end || ""
          }`,
        });
      req = $7XA7f(format.url, requestOptions);
      req.on("response", (res) => {
        if (stream.destroyed) return;
        contentLength =
          contentLength || parseInt(res.headers["content-length"]);
      });
      req.on("data", ondata);
      $eebb97b722c83852$var$pipeAndSetEvents(req, stream, shouldEnd);
    }
  }
  stream._destroy = () => {
    stream.destroyed = true;
    req.destroy();
    req.end();
  };
};
/**
 * Can be used to download video after its `info` is gotten through
 * `ytdl.getInfo()`. In case the user might want to look at the
 * `info` object before deciding to download.
 *
 * @param {Object} info
 * @param {!Object} options
 * @returns {ReadableStream}
 */ $eebb97b722c83852$var$ytdl.downloadFromInfo = (info, options) => {
  const stream = $eebb97b722c83852$var$createStream(options);
  if (!info.full)
    throw Error(
      "Cannot use `ytdl.downloadFromInfo()` when called with info from `ytdl.getBasicInfo()`"
    );
  setImmediate(() => {
    $eebb97b722c83852$var$downloadFromInfoCallback(stream, info, options);
  });
  return stream;
};

var $8ee3058fdc6cf74b$exports = {};

$8ee3058fdc6cf74b$exports = parcelRequire("3nKoH");

const $383e46f26d360885$var$FFMPEG_PATH = `/opt/homebrew/Cellar/ffmpeg/5.1.2/bin/ffmpeg`;
$8ee3058fdc6cf74b$exports.setFfmpegPath($383e46f26d360885$var$FFMPEG_PATH);
var $197543ea5cb391e9$exports = {};
("use strict");
var $86f24597cd73de56$exports = {};
("use strict");
$86f24597cd73de56$exports = {
  fromMs: $86f24597cd73de56$var$fromMs,
  fromS: $86f24597cd73de56$var$fromS,
  toMs: $86f24597cd73de56$var$toMs,
  toS: $86f24597cd73de56$var$toS,
};
var $4a7d6b989843093e$exports = {};
/*! zero-fill. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */ /**
 * Given a number, return a zero-filled string.
 * From http://stackoverflow.com/questions/1267283/
 * @param  {number} width
 * @param  {number} number
 * @return {string}
 */ $4a7d6b989843093e$exports = function zeroFill(width, number, pad) {
  if (number === undefined)
    return function (number, pad) {
      return zeroFill(width, number, pad);
    };
  if (pad === undefined) pad = "0";
  width -= number.toString().length;
  if (width > 0)
    return new Array(width + (/\./.test(number) ? 2 : 1)).join(pad) + number;
  return number + "";
};

// Time units with their corresponding values in miliseconds
const $86f24597cd73de56$var$HOUR = 3600000;
const $86f24597cd73de56$var$MINUTE = 60000;
const $86f24597cd73de56$var$SECOND = 1000;
const $86f24597cd73de56$var$TIME_FORMAT_ERRMSG = "Time format error";
// =============================================================================
// Export functions
// =============================================================================
function $86f24597cd73de56$var$fromMs(ms, format = "mm:ss") {
  if (typeof ms !== "number" || Number.isNaN(ms)) throw new Error("NaN error");
  let absMs = Math.abs(ms);
  let negative = ms < 0;
  let hours = Math.floor(absMs / $86f24597cd73de56$var$HOUR);
  let minutes = Math.floor(
    (absMs % $86f24597cd73de56$var$HOUR) / $86f24597cd73de56$var$MINUTE
  );
  let seconds = Math.floor(
    (absMs % $86f24597cd73de56$var$MINUTE) / $86f24597cd73de56$var$SECOND
  );
  let miliseconds = Math.floor(absMs % $86f24597cd73de56$var$SECOND);
  return $86f24597cd73de56$var$formatTime(
    {
      negative: negative,
      hours: hours,
      minutes: minutes,
      seconds: seconds,
      miliseconds: miliseconds,
    },
    format
  );
}
function $86f24597cd73de56$var$fromS(s, format = "mm:ss") {
  if (typeof s !== "number" || Number.isNaN(s)) throw new Error("NaN error");
  let ms = s * $86f24597cd73de56$var$SECOND;
  return $86f24597cd73de56$var$fromMs(ms, format);
}
function $86f24597cd73de56$var$toMs(time, format = "mm:ss") {
  let re;
  if (["mm:ss", "mm:ss.sss", "hh:mm:ss", "hh:mm:ss.sss"].includes(format))
    re = /^(-)?(?:(\d\d+):)?(\d\d):(\d\d)(\.\d+)?$/;
  else if (format === "hh:mm")
    re = /^(-)?(\d\d):(\d\d)(?::(\d\d)(?:(\.\d+))?)?$/;
  else throw new Error($86f24597cd73de56$var$TIME_FORMAT_ERRMSG);
  let result = re.exec(time);
  if (!result) throw new Error();
  let negative = result[1] === "-";
  let hours = result[2] | 0;
  let minutes = result[3] | 0;
  let seconds = result[4] | 0;
  let miliseconds = Math.floor((1000 * result[5]) | 0);
  if (minutes > 60 || seconds > 60) throw new Error();
  return (
    (negative ? -1 : 1) *
    (hours * $86f24597cd73de56$var$HOUR +
      minutes * $86f24597cd73de56$var$MINUTE +
      seconds * $86f24597cd73de56$var$SECOND +
      miliseconds)
  );
}
function $86f24597cd73de56$var$toS(time, format = "mm:ss") {
  let ms = $86f24597cd73de56$var$toMs(time, format);
  return Math.floor(ms / $86f24597cd73de56$var$SECOND);
}
// =============================================================================
// Utility functions
// =============================================================================
function $86f24597cd73de56$var$formatTime(time, format) {
  let showMs;
  let showSc;
  let showHr;
  switch (format.toLowerCase()) {
    case "hh:mm:ss.sss":
      showMs = true;
      showSc = true;
      showHr = true;
      break;
    case "hh:mm:ss":
      showMs = !!time.miliseconds;
      showSc = true;
      showHr = true;
      break;
    case "hh:mm":
      showMs = !!time.miliseconds;
      showSc = showMs || !!time.seconds;
      showHr = true;
      break;
    case "mm:ss":
      showMs = !!time.miliseconds;
      showSc = true;
      showHr = !!time.hours;
      break;
    case "mm:ss.sss":
      showMs = true;
      showSc = true;
      showHr = !!time.hours;
      break;
    default:
      throw new Error($86f24597cd73de56$var$TIME_FORMAT_ERRMSG);
  }
  let hh = $4a7d6b989843093e$exports(2, time.hours);
  let mm = $4a7d6b989843093e$exports(2, time.minutes);
  let ss = $4a7d6b989843093e$exports(2, time.seconds);
  let sss = $4a7d6b989843093e$exports(3, time.miliseconds);
  return (
    (time.negative ? "-" : "") +
    (showHr
      ? showMs
        ? `${hh}:${mm}:${ss}.${sss}`
        : showSc
        ? `${hh}:${mm}:${ss}`
        : `${hh}:${mm}`
      : showMs
      ? `${mm}:${ss}.${sss}`
      : `${mm}:${ss}`)
  );
}

$197543ea5cb391e9$exports = (onProgress, durationMs) => {
  return (event) => {
    let progress = 0;
    try {
      const timestamp = $86f24597cd73de56$exports.toMs(event.timemark);
      progress = timestamp / durationMs;
    } catch (err) {}
    if (isNaN(progress) && !isNaN(event.percent))
      progress = event.percent / 100;
    if (!isNaN(progress)) {
      progress = Math.max(0, Math.min(1, progress));
      onProgress(progress, event);
    }
  };
};

var $2e4fb20ed806f477$exports = {};
$2e4fb20ed806f477$exports = Max;

const $383e46f26d360885$var$logProgress = (progress, event) => {
  // progress is a floating point number from 0 to 1
  $2e4fb20ed806f477$exports.outlet(["videoProgress", progress * 100]);
};
var $05253d56e4ae9c64$exports = {};
$05253d56e4ae9c64$exports = videos;

// .then((data) => (savedVideos = data))
// .catch(() => {
// 	fs.writeFileSync("./videos.json", JSON.stringify({ videos: [] }));
// 	savedVideos = { videos: [] };
// });
$2e4fb20ed806f477$exports.post("AIzaSyBt3p-NYYbLAoqPz3N4v3ZS3OkdwiQKp6Q");
$2e4fb20ed806f477$exports.outlet("ytbApiKeySet", true);
$2e4fb20ed806f477$exports.outlet([
  "savedVideos",
  $05253d56e4ae9c64$exports.videos.sort(),
]);
async function $383e46f26d360885$var$updateYTDLCORE() {}
const $383e46f26d360885$var$searchYTBapi = async (term) =>
  new Promise((resolve, reject) => {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${term}&key=${"AIzaSyBt3p-NYYbLAoqPz3N4v3ZS3OkdwiQKp6Q"}`;
    $bFvJb$https
      .get(url, (res) => {
        let data = [];
        res.on("data", (chunk) => {
          data.push(chunk);
        });
        res.on("end", () => {
          const result = JSON.parse(
            $383e46f26d360885$require$Buffer.concat(data).toString()
          );
          if (result.items) resolve(result.items.map((item) => item.snippet));
          else $2e4fb20ed806f477$exports.post(result);
        });
      })
      .on("error", (err) => {
        $2e4fb20ed806f477$exports.post("Error: " + err.message);
        reject(err);
      });
  });
$383e46f26d360885$var$updateYTDLCORE();
let $383e46f26d360885$var$currentResults = [];
let $383e46f26d360885$var$currentSelected;
const $383e46f26d360885$var$updateVideosJSON = (videosJSON) => {
  let data = JSON.stringify(videosJSON, null, "	");
  $bFvJb$fs.writeFileSync($bFvJb$path.resolve("./videos.json"), data);
};
const $383e46f26d360885$var$getResults = async (term) => {
  if (/^https:\/\/www\.youtube\.com\/watch\?v=/.test(term))
    $383e46f26d360885$var$downloadResult(term);
  else {
    const results = await $383e46f26d360885$var$searchYTBapi(term);
    $383e46f26d360885$var$currentResults = results;
    const thumbnailsDir = "./media/thumbnails";
    if (!$bFvJb$fs.existsSync(thumbnailsDir))
      $bFvJb$fs.mkdirSync(thumbnailsDir);
    $bFvJb$fs.readdir(thumbnailsDir, (err, files) => {
      if (err) throw err;
      for (const file of files)
        $bFvJb$fs.unlink($bFvJb$path.join(thumbnailsDir, file), (err) => {
          if (err) throw err;
        });
    });
    results.forEach((result, index) => {
      try {
        $383e46f26d360885$var$download(
          result.thumbnails.default.url,
          "./media/thumbnails/" +
            index +
            result.title.replace(/(\s+|\:|\/)/gi, "_").toLowerCase() +
            ".jpg",
          () => {}
        );
      } catch (error1) {
        $2e4fb20ed806f477$exports.outlet("error", error1.toString());
      }
    });
  }
};
const $383e46f26d360885$var$download = (url, dest, cb) => {
  const file = $bFvJb$fs.createWriteStream(dest);
  $bFvJb$https.get(url, function (response) {
    response.pipe(file);
    file.on("finish", function () {
      file.end(cb);
      $2e4fb20ed806f477$exports.outlet(["newResults", "bang"]);
    });
  });
};
const $383e46f26d360885$var$convertVideo = (videoPath) => {
  try {
    $2e4fb20ed806f477$exports.post(videoPath);
    const vidId = videoPath.split("/").reverse()[0].split(".")[0];
    const videoStream = new $8ee3058fdc6cf74b$exports(videoPath)
      .withVideoCodec("hap")
      .outputOptions("-format hap_q");
    const audioStream = videoStream.clone();
    let mp3Path = `./media/${vidId}.mp3`;
    let movPath = `./media/${vidId}.mov`;
    // videoStream.on("progress", ffmpegOnProgress(logProgress, duration * 1000));
    videoStream.save($bFvJb$path.resolve(movPath));
    audioStream.on("progress", (progress) => {
      $2e4fb20ed806f477$exports.outlet(["audioProgress", "bang"]);
    });
    audioStream.save($bFvJb$path.resolve(mp3Path));
    audioStream.on("end", () => {
      $05253d56e4ae9c64$exports.videos.push(vidId);
      $383e46f26d360885$var$updateVideosJSON($05253d56e4ae9c64$exports);
      $2e4fb20ed806f477$exports.outlet(["audio", $bFvJb$path.resolve(mp3Path)]);
      $2e4fb20ed806f477$exports.outlet(["video", $bFvJb$path.resolve(movPath)]);
      $2e4fb20ed806f477$exports.outlet([
        "savedVideos",
        $05253d56e4ae9c64$exports.videos,
      ]);
    });
  } catch (error1) {
    $2e4fb20ed806f477$exports.outlet("error", error1.toString());
  }
};
const $383e46f26d360885$var$downloadResult = async (link) => {
  try {
    let info = await $eebb97b722c83852$exports.getInfo(link);
    const videoLength = Number(info.videoDetails.lengthSeconds);
    const format = $eebb97b722c83852$exports.chooseFormat(info.formats, {
      filter: "videoandaudio",
      quality: "highestvideo",
    });
    let vidId =
      info.videoDetails.title.replace(/(\s+|\:)/g, "_").toLowerCase() +
      "_" +
      info.videoDetails.videoId;
    let mp3Path = `./media/${vidId}.mp3`;
    let movPath = `./media/${vidId}.mov`;
    let duration = videoLength;
    const videoStream = new $8ee3058fdc6cf74b$exports({
      source: format.url,
    })
      .withVideoCodec("hap")
      .outputOptions("-format hap_q");
    if (duration > 60) {
      duration = 60;
      videoStream.duration(duration);
    }
    const audioStream = videoStream.clone();
    videoStream.on(
      "progress",
      $197543ea5cb391e9$exports(
        $383e46f26d360885$var$logProgress,
        duration * 1000
      )
    );
    videoStream.save($bFvJb$path.resolve(movPath));
    audioStream.on("progress", (progress) => {
      $2e4fb20ed806f477$exports.outlet(["audioProgress", "bang"]);
    });
    audioStream.save($bFvJb$path.resolve(mp3Path));
    videoStream.on("end", () => {
      $05253d56e4ae9c64$exports.videos.push(vidId);
      $383e46f26d360885$var$updateVideosJSON($05253d56e4ae9c64$exports);
      $2e4fb20ed806f477$exports.outlet(["audio", $bFvJb$path.resolve(mp3Path)]);
      $2e4fb20ed806f477$exports.outlet(["video", $bFvJb$path.resolve(movPath)]);
      $2e4fb20ed806f477$exports.outlet([
        "savedVideos",
        $05253d56e4ae9c64$exports.videos,
      ]);
    });
  } catch (error1) {
    $2e4fb20ed806f477$exports.outlet("error", error1.toString());
  }
};
$2e4fb20ed806f477$exports.addHandler("downloadVid", (index) => {
  $383e46f26d360885$var$downloadResult(
    $383e46f26d360885$var$currentResults[index]
  );
});
$2e4fb20ed806f477$exports.addHandler("convertVid", (path) => {
  $383e46f26d360885$var$convertVideo(path);
});
$2e4fb20ed806f477$exports.addHandler("search", (term) => {
  $383e46f26d360885$var$getResults(term);
});
$2e4fb20ed806f477$exports.addHandler("select", (id) => {
  $383e46f26d360885$var$currentSelected = id;
  $2e4fb20ed806f477$exports.outlet([
    "audio",
    $bFvJb$path.resolve(`./media/${id}.mp3`),
  ]);
  $2e4fb20ed806f477$exports.outlet([
    "video",
    $bFvJb$path.resolve(`./media/${id}.mov`),
  ]);
});
$2e4fb20ed806f477$exports.addHandler("deleteCurrent", () => {
  if ($383e46f26d360885$var$currentSelected) {
    const mp3 = `./media/${$383e46f26d360885$var$currentSelected}.mp3`;
    const mov = `./media/${$383e46f26d360885$var$currentSelected}.mov`;
    [mp3, mov].forEach((path) => {
      $bFvJb$fs.unlink(path, (err) => {
        if (err) {
          $2e4fb20ed806f477$exports.outlet("error", error.toString());
          return;
        }
        //file removed
      });
    });
    $05253d56e4ae9c64$exports.videos = $05253d56e4ae9c64$exports.videos.filter(
      (vid) => vid !== $383e46f26d360885$var$currentSelected
    );
    $383e46f26d360885$var$updateVideosJSON($05253d56e4ae9c64$exports);
    $2e4fb20ed806f477$exports.outlet([
      "savedVideos",
      $05253d56e4ae9c64$exports.videos,
    ]);
  }
});

//# sourceMappingURL=main.js.map
