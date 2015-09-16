require("setimmediate");
var cc = require('../index.js'),
    Promise = require('es6-promise').Promise,
    fs = require('fs'),
    readFile = curry(fs.readFile);


cc(function * (v){
    v = yield ++v;
    v = yield ++v;
    return 'number '+v;
})(1).then(console.log);

cc(function * (){
    var a = yield {
        hi: doHello(),
        css: readFile('thing.css', 'utf8'),
        hi2: doHello()
    };

    return a;
})().then(console.log);

cc(function * (){
    var a = yield {
        async: doAsync(),
        hi: doHello()
    },
    b = yield [
        doAsync(),
        doHello(),
        'regular value'
    ];

    return [a, b, yield doHello()];
})().then(console.log);


cc(function * (){
    var i = -1;
    while(yield sleep(1000)){
        console.log(yield 'awake');
        if(++i > 3) return;
    }

})().then(function(){
    console.log('fully awake');
    //failedExec();
});

cc(function * (){
    var a = yield {
        async: doAsync(),
        hi: doHello()
    };

    return new Promise.resolve(a);
})().then(function(value){
    console.log(value);
});



function sleep(ms){
    return function(cb){
        setTimeout(function(){
            cb(ms);
        }, ms);
    };
}


function doAsync(){
    return function(cb){
        setTimeout(function(){
            var y = Math.floor(Math.random() * (2 - 1 + 1)) + 1,
                z = Math.floor(Math.random() * (10 - 1 + 1)) + 1;
            //Sometimes pass an error
            if(y < 8)
                z = 1;
            cb(z === 1 ? 'hello curry' : new TypeError('we got an error.'));
        });
    };
}

function doHello(v){
    v = v || 'world!';
    return new Promise(function(resolve, reject){
        resolve('hello '+v);
    });
}

function curry(fn){
    return function(){
        var a = Array.prototype.slice.call(arguments);
        return function(cb){
            fn.apply(null, a.concat([cb]));
        };
    };
}
