# Usage

The container is simple.  You use define and resolve to manage all dependencies.

[![Build Status](https://travis-ci.org/LlamaSantos/Nodeject.png?branch=master)](https://travis-ci.org/LlamaSantos/Nodeject)

## Todo
- Cyclical dependency detection.
- Better lifetime management, singleton flag is nice, but there are more than just transient and singleton lifetimes.
- Browser script to be used in AMD/CommonJS/POJS(Plain Old Javascript).

### Example
```JavaScript
var container = new Nodeject();

container.define({ name : "module1", type : require("module1") })
         .define({ name : "module2", type : require("module2"), deps: ["module1"] });

 var module2Impl = container.resolve("module2");
```

### define
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



### resolve
```JavaScript
// Resolves with a single module name.
function resolve(moduleName) { ... };

var module1 = container.resolve("moduleName");
```

### wrap
Nodeject now supports wrapping of global entities along with resolving a field off of another bound entity.
```JavaScript
// Wrapping a global or other entity
container.define({ name : '$',
    wrap : {
        resolve : jQuery
    }
});
var $ = container.resolve('$');

// Binding a field to a resolvable name
container.define({ name : "app",
    type : function (){
        return {
            bus : {
                on : function (){ "..."; }
            }
        };
    }
});
container.define({ name : 'bus',
    wrap : {
        resolve : 'bus',
        context : 'app'
    }
});
var bus = container.resolve('bus');

```

### categories
Categories are a way of configuring multiple items and resolving them under a single name.  This is helpful when configuring
controllers or presenters where initialization needs to occur in bulk.
```JavaScript
// Configure the container with entities having a common category
container
  .define({
    name : "module1",
    type : MyType,
    category : "category1"
  })
  .define({
    name : "module2",
    type : MyOtherType,
    category : "category1"
  });

var entities = container.resolve({ category : "category1" });
assert.ok (entities[0] instanceof MyType);          // asserts true
assert.ok (entities[1] instanceof MyOtherType);     // asserts true

var entities = container.resolve({ category : "category1", format : "literal" });
assert.ok ("module1" in entities);                  // asserts true
assert.ok ("module2" in entities);                  // asserts true
```

### compound keys
```JavaScript
// In order to enable compound keys feature you have to specify compoundKeys/delimiter option
var container = new Nodeject({
  singleton: true,
  compoundKeys: {
    delimiter: '::'
  }
});

// Configure the container with two identical names in two different categories
container
  .define({
    name : "main",
    category : "moduleOne",
    type : MyType
  })
  .define({
    name : "main",
    category : "moduleTwo",
    type : MyOtherType
  });

var moduleOneMain = container.resolve('moduleOne::main');
// what is the same as
moduleOneMain = container.resolve({ category: 'moduleOne', name: 'main' });
// and now you can use compound keys when you define deps
container.define({
  name: 'aggr',
  type: AggrType,
  deps: ['moduleOne::main', 'moduleTwo::main']
});
```
