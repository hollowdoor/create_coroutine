require('setimmediate');
var Promise = require('es6-promise').Promise,
    polysolve = require('polysolve');

module.exports = cc;

function cc(cb){

    return function(){
        var ctx = this,
            gen = 'next' in cb ? cb : cb.apply(ctx, arguments),
            primitive = ['number', 'string', 'boolean', 'undefined'],
            compound = ['function', '[object Object]', '[object Array]'],
            type, temp;

        return new Promise(function(resolve, reject){
            function fn(next){


                if(next.done){
                    try{
                        return resolve(next.value || undefined);
                    }catch(e){
                        return reject(e);
                    }
                }

                temp = null;

                if((type = typeof next.value) === 'object')
                    type = Object.prototype.toString.call(next.value);

                if(primitive.indexOf(type) !== -1 || next.value === null){
                    //Why wrap primitives when just sending is faster?
                    try{
                        return fn(gen.next(next.value));
                    }catch(error){
                        return fn(gen.throw(error));
                    }
                }else if(compound.indexOf(type) !== -1){

                    if(typeof next.value.pipe === 'function'){
                        //Can't do streams because they could be any kind of data.
                        try{
                            return fn(gen.next(next.value));
                        }catch(error){
                            return fn(gen.throw(error));
                        }

                    }

                    else if(next.value.constructor){
                        //It's a generator recurse it.
                        if('GeneratorFunction' === next.value.constructor.name ||
                            'GeneratorFunction' === next.value.constructor.displayName ||
                            typeof next.value.next === 'function' && typeof next.value.throw === 'function'){
                                temp = cc(next.value).call(ctx);
                            }

                    }

                    return polysolve(temp || next.value).then(function(value){
                        fn(gen.next(value));
                    }, function(error){
                        fn(gen.throw(error));
                    });
                }
            }

            fn(gen.next());

        });
    };

}

cc.run = function(cb){
    return cc(cb)();
};



/*
function crow(cb){

    if(typeof cb !== 'function')
        if(!('next' in cb))
            throw new TypeError('First argument is not a function, or generator.');

    return function(){

        var ctx = this,
            args = Array.prototype.slice.call(arguments),
            gen = 'next' in cb ? cb : cb.apply(ctx, args),
            prim = ['[object Number]', '[object String]'];

        return new Promise(function(resolve, reject){

            function fn(next){

                if(next.done)
                    return resolve(next.value);

                var type = Object.prototype.toString.call(next.value),
                    value, i;

                if(prim.indexOf(type) !== -1)
                    return fn(gen.next(next.value));


                if(type === '[object Function]'){

                    if('next' in next.value.prototype)
                        return execPromise(crow(next.value).call(this));

                    return execThunk(next.value);
                }

                else if(type === '[object Object]'){

                    if('then' in next.value){
                        return execPromise(next.value);
                    }else{

                        keys = Object.keys(next.value);
                        value = [];
                        for(i=0; i<keys.length; i++)
                            value[i] = next.value[keys[i]];
                        value = execArray(value);

                        return execPromise(Promise.all(value), function(list){
                            var c = {};
                            for(var i=0; i<keys.length; i++)
                                c[keys[i]] = list[i];
                            return fn(gen.next(c));
                        });

                    }
                }else if(type === '[object Array]'){
                    value = execArray(next.value);
                    execPromise(Promise.all(value));
                }


            }

            fn(gen.next());

            function isPromise(v){
                return Object.prototype.toString.call(v) === '[object Object]' && then in v;
            }

            function execThunk(t){

                return t.call(ctx, function(a, b){
                    try{
                        if(b === undefined)
                            return fn(a instanceof Error ? gen.throw(a) : gen.next(a));
                        else
                            if(a === null)
                                return fn(gen.next(b));
                            else if(a instanceof Error)
                                return fn(gen.throw(a));

                    }catch(e){
                        return resolve(Promise.reject(e));
                    }
                });
            }

            function execPromise(p, success){
                success = success || function(v){
                    try{
                        return fn(gen.next(v));
                    }catch(e){
                        return resolve(Promise.reject(e));
                    }
                };

                return p.then(success, function(e){
                    try{
                        return fn(gen.throw(e));
                    }catch(err){
                        return resolve(Promise.reject(err));
                    }
                });
            }

            function execArray(arr){
                var value = [];
                for(i=0; i<arr.length; i++)
                    if(typeof arr[i] === 'function')
                        value.push(thunkToPromise(arr[i]));
                    else
                        value.push(arr[i]);
                return value;
            }

            function thunkToPromise(t){
                return new Promise(function(res, rej){
                    t.call(ctx, function(a, b){
                        try{
                            if(b === undefined)
                                return a instanceof Error ? rej(a) : res(a);
                            else
                                if(a === null)
                                    return res(b);
                            else if(a instanceof Error)
                                return rej(a);
                        }catch(e){
                            return resolve(Promise.reject(e));
                        }
                    });
                });
            }



        });
    };
}*/
