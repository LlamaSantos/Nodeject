var assert = require("assert"),
    Nodeject = require("../lib/index.js");
    types = require("./types.js");

var Mine = types.Mine,
    Theirs = types.Theirs,
    Other = types.Other,
    Singleton = types.Singleton;

describe("Nodeject", function (){
    describe("Defining a dependency", function (){
        var container = null;
        beforeEach(function (){
            container = new Nodeject;
        });

        it ("should show up in the dependency cache", function (){
            container.define({
                name : "Mine",
                type : Mine
            });

            assert(container.cache["Mine"], "Not adding Mine to the dependency cache.");
        });

        it ("should keep the prototype of the original", function (){
            container.define({
                name : "Mine",
                type : Mine
            });

            var obj = new container.cache["Mine"].fn(['a', 'b']);
            assert.ok(obj instanceof Mine);
        });

        it ("should configure a string", function (){
            container.define({
                name : "a",
                type : "a string"
            });

            var obj = container.cache["a"].fn;
            assert.ok(obj, "a string");
        });

        it ("should configure an array", function (){
            container.define({
                name : "a",
                type : [1,2,3,4,5]
            });

            var obj = container.cache["a"].fn;
            assert.equal(Object.prototype.toString.call(obj), "[object Array]");
            for(var i = 0; i < 5; i = i + 1){
                assert.ok(obj[i], (i + 1), "Values are not properly configured in an array in the container.");
            }
        });
    });

    describe("Resolving a dependency", function (){
        var container = null;
        beforeEach(function (){
            container = new Nodeject();
            container.define({ name : 'a', type : 'a value' })
                .define({ name : 'b',           type : 'b value'})
                .define({ name : 'c',           type : ['d', 'e', 'f']})
                .define({ name : 'Mine',        type : Mine,            deps: ['a', 'b'] })
                .define({ name : 'Theirs',      type : Theirs,          deps: ['Mine'] })
                .define({ name : 'Other',       type : Other.create,    deps: ['Theirs', "c"]})
                .define({ name : "Singleton",   type: Singleton,        singleton : true});
        });

        it ("should resolve a string type", function (){
            var a = container.resolve("a");
            assert.equal(a, 'a value', 'The "a" dependency is not configured correctly.');
        });

        it ("should resolve a string type when multiple are configured", function (){
            var b = container.resolve("b");
            assert.equal(b, 'b value', 'The "b" dependency is not configured correctly.');
        });

        it ("should resolve an array type", function(){
            var c = container.resolve("c");

            var val = (Object.prototype.toString.call(c) === '[object Array]');
            assert(val, 'The "c" dependency is not configured correctly.');
            assert.equal(c.length, 3, "Missing elements from the array configured in 'c'");
        });

        it ("should resolve a prototype that takes strings as creation args.", function (){
            var mine = container.resolve("Mine");

            assert.equal(mine.a, "a value", "'A' is missing it's value.");
            assert.equal(mine.b, "b value", "'B' is missing it's value.");
        });

        it ("should resolve a prototype that takes a prototype as a construction arg", function (){
            var theirs = container.resolve("Theirs");

            assert(theirs.mine, "The 'Mine' dependency is missing from the constructed object.");
            assert(theirs.mine.a, "a value", "'A' is missing it's value on Mine.");
            assert(theirs.mine.b, "b value", "'B' is missing it's value on Mine.");
        });

        it ("should resolve when a power constructor has dependencies supplied.", function (){
            var other = container.resolve("Other");

            assert(other.theirs.mine.a, "a value", "'A' is missing from it's value on Theirs.Mine.A");
            assert.equal(other.arr.length, 3, 'Missing values from the arr array.');
        });

        it ("should create only 1 copy of a singleton", function (){
            var s1 = container.resolve("Singleton");
            assert.equal(s1.value, 1, "Singleton is not configured correctly.");

            var s2 = container.resolve("Singleton");
            assert.equal(s2.value, 1, "Singleton is being created more than once.");
        });
    });
});
