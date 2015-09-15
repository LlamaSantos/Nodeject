(function (module) {
  'use strict';

  /*The following is the data format of a cache element
   name        : Name of the dependency
   singleton   : true/false
   fn          : Function constructor, can be a prototype or function.
   deps        : Array of dependencies where the names correspond to other named dependencies
   instance    : The instance of an element, can be pre constructed and passed in or constructed by fn.
   */

  var isArray = function isArray(o) { return Object.prototype.toString.call(o) === '[object Array]'; };
  var isString = function isString(s) { return Object.prototype.toString.call(s) === '[object String]'; };
  var isNull = function isNull(n) { return Object.prototype.toString.call(n) === '[object Null]'; };
  var isUndefined = function isUndefined(u) { return Object.prototype.toString.call(u) === '[object Undefined]'; };
  var isObject = function isObject(o) { return Object.prototype.toString.call(o) === '[object Object]'; };

  function factory(type, aspects) {
    if (isString(type)) {
      return type;
    } else if (isArray(type)) {
      return type;
    } else {
      var tmp = function (args) {
        return type.apply(this, args);
      };

      // -- Newer browsers have a safer method of inheritance; sorry IE*.
      if ('create' in Object) {
        tmp.prototype = Object.create(type.prototype, {
          constructor: {
            value: tmp,
            enumerable: false,
            writable: true,
            configurable: true
          }
        });
      } else {
        tmp.prototype = type.prototype;
      }

      if (aspects) {
        for (var c in aspects) {
          if (aspects.hasOwnProperty(c)) {
            tmp = aspects[c](tmp);
          }
        }
      }

      return tmp;
    }
  }

  function addCategory(categories, category, name) {
    (category in categories) ?
      (categories[category].push(name)) :
      (categories[category] = [name]);
  }

  function wrap(name) {
    return function (obj) {
      return obj[name];
    };
  }

  function wrapGlobal(obj) {
    return function () {
      return obj;
    };
  }

  var Nodeject = function Nodeject(options) {
    this.config = options;
    this.cache = {};
    this.categories = {};

    // -- Create global default of Singleton
    this.singleton = (!!options && !!options.singleton) ? options.singleton : false;
  };

  Nodeject.prototype.registerAspect = function (attribute, aspect) {
    this.aspects = this.aspects || {};
    this.aspects[attribute] = this.aspects[attribute] || [];
    this.aspects[attribute].push(aspect);
  };

  Nodeject.prototype.define = function (options) {
    if (!(options.name)) { throw new Error("Name is not found or is empty as part of the definition."); }
    //if (!options.type){ throw "Type isn't found or is empty as part of the definition."; }

    if (!('name' in this.cache)) {
      if ('wrap' in options) {
        var obj = options.wrap;
        var opts = {
          name: options.name,
          category: options.category,
          type: (obj.context ? wrap : wrapGlobal).call(this, obj.resolve),
          singleton: (!!options.singleton) ? options.singleton : this.singleton,
          deps: [obj.context]
        };

        if (isUndefined(obj.context)) {
          delete opts.deps;
        }

        return this.define(opts);
      } else {
        if (isNull(options.type) || isUndefined(options.type)) {
          this.cache[options.name] = {
            singleton: this.singleton,
            isEmpty: true,
            instance: options.type
          };
          return this;
        }
        var toApply;
        if (options.attrbs && this.aspects) {
          toApply = [];
          for (var x in options.attrbs) {
            var twork = this.aspects[options.attrbs[x]];
            for (var d in twork) {
              toApply.push(twork[d]);
            }
          }
        }
        this.cache[options.name] = {
          singleton: options.singleton || this.singleton,
          fn: factory(options.type, toApply),
          deps: options.deps || [],
          instance: null,
          requiresNew: !(isString(options.type) || isArray(options.type))
        };

        if (options.category) {
          var arr = options.category || [];
          if (isArray(arr)) {
            for (var i = 0; i < arr.length; i = i + 1) {
              addCategory(this.categories, arr[i], options.name);
            }
          }
          else {
            addCategory(this.categories, arr, options.name);
          }
        }
      }
    }
    else {
      throw "Type or type name already defined in the container.";
    }

    return this;
  };

  Nodeject.prototype.resolve = function (options) {
    var name = '', category = '', singleton = this.singleton;

    // -- Marshall incoming parameters to resolve the type.
    if (isString(options)) { name = options; }
    else if (options.name) { name = options.name || ''; }
    else if (options.category && isString(options.category)) { category = options.category; }
    else { throw "Cannot resolve"; }

    if (name in this.cache && this.cache[name].isEmpty) {
      return this.cache[name].instance;
    }

    var deps, i;
    if (name in this.cache) {
      var type = this.cache[name];
      singleton = options.singleton || type.singleton || this.singleton;

      // Resolve dependencies.
      deps = [];
      for (i = 0; i < type.deps.length; i = i + 1) {
        var subtype = this.resolve(type.deps[i]);
        deps.push(subtype);
      }

      if (singleton) {
        type.instance = type.instance || (type.requiresNew ? new type.fn(deps) : type.fn);
        return type.instance;
      }

      return type.requiresNew ? new type.fn(deps) : type.fn;
    } else if (category in this.categories) {
      var types = this.categories[category] || [];
      var format = options.format || 'array';
      if (format === 'literal') {
        deps = {};
        for (i = 0; i < types.length; i = i + 1) {
          deps[types[i]] = this.resolve(types[i]);
        }
      } else {
        deps = [];
        for (i = 0; i < types.length; i = i + 1) {
          deps.push(this.resolve(types[i]));
        }
      }
      return deps;
    } else {
      var eMessage = "The type '" + name + "' is not configured in the container.";
      throw new Error(eMessage);
    }
  };

  module.exports = Nodeject;
})(module);
