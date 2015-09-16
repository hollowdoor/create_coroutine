require("setimmediate");
var cc = require('../index.js'),
    yieldon = cc.yieldon,
    Promise = require('es6-promise').Promise;

cc(function * (){
    var output = document.getElementById('output'),
        clicked = $$('#clickme').on('click'),//'click', document.getElementById('clickme')),
        index = 0,
        event;

    while(event = yield clicked){
        console.log(yield 'clicked ' + index);
        output.innerHTML = output.innerHTML + index + '\n';
        if(++index > 3)
            return 'done';
    }
})().then(function(value){
    console.log(value);
}, console.log);
