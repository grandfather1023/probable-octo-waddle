//Shims from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference
Array.prototype.indexOf = function (searchElement, fromIndex) {
    'use strict';
    var k;
    if (this == null) {
      throw new TypeError('"this" is null or not defined');
    }

    var O = Object(this);

    var len = O.length >>> 0;

    // 4. If len is 0, return -1.
    if (len === 0) {
      return -1;
    }


    var n = +fromIndex || 0;

    if (Math.abs(n) === Infinity) {
      n = 0;
    }

    if (n >= len) {
      return -1;
    }


    k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

    // 9. Repeat, while k < len
    while (k < len) {
      var kValue;

      if (k in O && O[k] === searchElement) {
        return k;
      }
      k++;
    }
    return -1;
  };


Array.isArray = function (arg) {
    'use strict';
    return Object.prototype.toString.call(arg) === '[object Array]';
};

Array.prototype.filter = function (fun /*, thisArg */ ) {
    "use strict";

    if (this === void 0 || this === null)
        throw new TypeError();

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== "function")
        throw new TypeError();

    var res = [];
    var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
    for (var i = 0; i < len; i++) {
        if (i in t) {
            var val = t[i];
            if (fun.call(thisArg, val, i, t))
                res.push(val);
        }
    }

    return res;
};


Array.prototype.map = function (callback, thisArg) {
    'use strict';
    var T, A, k;

    if (this == null) {
        throw new TypeError(" this is null or not defined");
    }

    var O = Object(this);
    var len = O.length >>> 0;
    if (typeof callback !== "function") {
        throw new TypeError(callback + " is not a function");
    }
    if (arguments.length > 1) {
        T = thisArg;
    }
    A = new Array(len);
    k = 0;
    while (k < len) {
        var kValue, mappedValue;
        if (k in O) {
            kValue = O[k];
            mappedValue = callback.call(T, kValue, k, O);
            A[k] = mappedValue;
        }

        k++;
    }

    return A;
};