#Usage

The container is simple.  You use define and resolve to manage all dependencies.

https://api.travis-ci.org/llamasantos/nodeject.png

##Todo
- Cyclical dependency detection.
- Better lifetime management, singleton flag is nice, but there are more than just transient and singleton lifetimes.
- Browser script to be used in AMD/CommonJS/POJS(Plain Old Javascript).

###Example
```JavaScript
var container = new Nodeject();

container.define({ name : "module1", type : require("module1") })
         .define({ name : "module2", type : require("module2"), deps: ["module1"] });

 var module2Impl = container.resolve("module2");
```

###define
```JavaScript
//Uses the options pattern to configure an entity.
function define(options) { ... };

container.define({
        name : "module1",           // Must be a unique name in the container.
        type : MyType,              // Can be a Prototype, Power Constructor, String, or Array
        deps : ["module2", "m2"],   // Array of modules configured or to be configured in the container.
        singleton : false           // If a singleton is needed, pass true, default is false.
    });

```



###resolve
```JavaScript
// Resolves with a single module name.
function resolve(moduleName) { ... };

var module1 = container.resolve("moduleName");
```
