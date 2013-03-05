(function (module){
    "use strict";

    /*The following is the data format of a cache element
     name        : Name of the dependency
     singleton   : true/false
     fn          : Function constructor, can be a prototype or function.
     deps        : Array of dependencies where the names correspond to other named dependencies
     instance    : The instance of an element, can be pre constructed and passed in or constructed by fn.
     */

    var isArray = function isArray(o) { return Object.prototype.toString.call(o) === '[object Array]'; };
    var isString = function isString(s) { return Object.prototype.toString.call(s) == '[object String]'; };

    function factory (type){
        if (isString(type)){
            return type;
        }
        else if (isArray(type)){
            return type;
        }
        else {
            var tmp = function (args) {
                return type.apply(this, args);
            };
            tmp.prototype = type.prototype;
            return tmp;
        }
    };

    var Nodeject = function Nodeject(options){
        this.config = options;
        this.cache = {};
    };

    Nodeject.prototype.define = function (options){
        if (!(options.name)){ throw "Name is not found or is empty as part of the definition."; }
        if (!options.type){ throw "Type isn't found or is empty as part of the definition."; }

        if (!('name' in this.cache)){
            this.cache[options.name] = {
                singleton   : options.singleton || false,
                fn          : factory(options.type),
                deps        : options.deps || [],
                instance    : null,
                requiresNew : !(isString(options.type) || isArray(options.type))
            };
        }
        else { throw "Type or type name already defined in the container."; }

        return this;
    };

    Nodeject.prototype.resolve = function (options){
        var name = '', singleton = false;

        // -- Marshall incoming parameters to resolve the type.
        if (isString(options)){ name = options; }
        else if(options.name){ name = options.name || ''; }
        else { throw "Cannot resolve"; }

        if (name in this.cache){
            var type = this.cache[name];
            singleton = options.singleton || type.singleton || false;

            // Resolve dependencies.
            var deps = [];
            for(var i = 0; i < type.deps.length; i = i + 1){
                var subtype = this.resolve(type.deps[i]);
                deps.push(subtype);
            }

            if (singleton){
                type.instance = type.instance || (type.requiresNew ? new type.fn(deps) : type.fn);
                return type.instance;
            }

            var obj = type.requiresNew ? new type.fn(deps) : type.fn;
            return obj;
        }
        else {
            throw "The type '" + name + "' is not configured in the container.";
        }
    };



    module.exports = Nodeject;

})(module)

















