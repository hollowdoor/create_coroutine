create-coroutine
================

Install
-------

`npm install create-coroutine`

Usage
-----

### Regular

```javascript
var cc = require('create-coroutine'),
    fs = require('fs');

function readFile(){
    return new Promise(function(resolve, reject){
        fs.readFile(name, 'utf8', function(e, str){
            if(e) return reject(e);
            resolve(str);
        });
    });
}

var routine = cc(function * function(){
    var text1 = yield readFile('stuff.txt'),
        text2 = yield readFile('script.js');

    return [text1, text2];
});

routine().then(function(value){
    //value is the return value from the generator.
});
```

Or run your function right away:

```javascript
cc.run(function * function(){
    var text1 = yield readFile('stuff.txt'),
        text2 = yield readFile('script.js');

    return [text1, text2];
}).then(function(value){
    //value is the return value from the generator.
});
```

### Streams

```javascript
var cc = require('create-coroutine'),
    fs = require('fs');

function readFile(){
    return new Promise(function(resolve, reject){
        fs.readFile(name, 'utf8', function(e, str){
            if(e) return reject(e);
            resolve(str);
        });
    });
}

var routine = cc(function * function(){
    //Ready to do streaming.
    yield [
        fs.createReadStream('sourcefile'),
        fs.createWriteStream('destination')
    ];

    //Read the fresh contents of destination.
    var text = yield readFile('destination');

    //This will return after everything else is done.
    return text;
});

routine().then(function(value){
    //value = returned text
});
```

About
-----

create-coroutine takes a single generator function as an argument. It processes your yielded values so asynchronous operations can be mixed with synchronous ones.

### Yieldables

-	Primitives (String, Number, Boolean, Undefined, Null)
-	Promises (The main type of yieldable)
-	Arrays of Promises (Resolves them in parallel)
-	Objects of Promises (Resolves them in parallel)
-	Functions that accept one callback argument
-	Arrays of streams (Pipes them in order)
-	Other generators
-	Anything with a then method.

### A Note About Streams

If you use the **array of streams** functionality keep in mind that only streams can be in that array. You can mix values only when they aren't streams. Mixing streams, and other values might create undefined behavior. You can put as many streams in the array as you want, but they must be in the correct order. For example:

```javascript
//Pseudo code.
yield [
        Readable,
        Duplex/Through/Transform,
        Duplex/Through/Transform,
        ...,
        Writable/Duplex/Through/Transform
    ];
```

### Modules That Work Well

-	[https://www.npmjs.com/package/thunkify](thunkify) (For funcitons of one arity)
-	Any kind of promise library (bluebird?)
-	ES6 Promises (Not always a module)
-	[https://www.npmjs.com/package/highland](Highland.js) (A funky stream lib)
