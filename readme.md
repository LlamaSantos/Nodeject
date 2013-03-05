#Usage
```JavaScript
var container = new Nodeject();

container.define({ name : "module1", type : require("module1") })
         .define({ name : "module2", type : require("module2"), deps: ["module1"] });
```