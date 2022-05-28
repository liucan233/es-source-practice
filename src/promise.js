/**符合Promise/A+规范的Promise
 * 参考：https://juejin.cn/post/7043758954496655397
 */

/**处理捕获的错误 */
const process = require('process');

process.on('uncaughtException', (err) => {
    console.log(err);
});

/**promise类型标记 */
const PROMISES = Symbol('promise');
/**pending状态 */
const PENDING = 'pending';
/**rejected状态 */
const REJECTED = 'rejected';
/**fulfilled状态 */
const FULFILLED = 'fulfilled';


/**处理规范的[[Resolve]](promise, x)过程
 * 详见：https://liucan233.github.io/promise-a-plus/#the-promise-resolution-procedure
 */
function resolvePromise2(promise2, x, reject, resolve) {
    if (x === promise2) { // 规范2.3.1
        reject(new TypeError('存在循环引用'));
    } else if (x && x._type === PROMISES) { // 规范2.3.2
        if (x._status === PENDING) {
            x.then(_x => {
                return resolvePromise2(promise2, _x, reject, resolve); // 递归优化
            }, reject);
        } else if (x._status === REJECTED) {
            reject(x._result);
        } else {
            resolve(x._result);
        }
    } else if (typeof x === 'function' || x && typeof x === 'object') { // 规范2.3.3
        let then = null;
        try {
            then = x.then;
        } catch (e) {
            reject(e);
        }
        if (typeof then === 'function') {
            let called = false;
            try {
                then.call(x, _x => {
                    if (called) {
                        return;
                    }
                    called = true;
                    return resolvePromise2(promise2, _x, reject, resolve);
                }, _y => {
                    if (called) {
                        return;
                    }
                    called = true;
                    reject(_y);
                })
            } catch (e) {
                if (!called) {
                    called=true;
                    reject(e);
                }
            }
        } else {
            resolve(x);
        }
    } else { // 规范2.3.4
        resolve(x);
    }
}

/**
 * 符合Promise/A+规范的MyPromise类
 */
class MyPromise {
    /**promise的状态 */
    _status = PENDING
    /**promise兑现回调 */
    _onFulfilled = []
    /**promise失败回调 */
    _onRejected = []
    /**promise结果 */
    _result = undefined
    /**promise类型标志 */
    _type = PROMISES

    constructor(executor) {
        try {
            executor(v => {
                this._transformStatus(FULFILLED, v);
            }, e => {
                this._transformStatus(REJECTED, e);
            })
        } catch (e) {
            this._transformStatus(REJECTED, e);
        }
    }
    _transformStatus(to, ans) {
        if (this._status === PENDING) {
            this._result = ans;
            const tasks = (to === FULFILLED) ? this._onFulfilled : this._onRejected;
            setTimeout(()=>{
                this._status = to;
                tasks.forEach(task => task(ans));
            });
        }
    }
    then(onFulfilled, onRejected) {
        const promise2 = new MyPromise((r, e) => {
            const tryResolvePromise2 = function (v) {
                if (typeof onFulfilled === 'function') {
                    try {
                        resolvePromise2(promise2, onFulfilled(v), e, r);
                    } catch (err) {
                        e(err);
                    }
                } else {
                    r(v);
                }
            }
            const tryRejectPromise2 = function (v) {
                if (typeof onRejected === 'function') {
                    try {
                        resolvePromise2(promise2, onRejected(v), e, r);
                    } catch (err) {
                        e(err);
                    }
                } else {
                    e(v);
                }
            }
            if (this._status === PENDING) {
                this._onFulfilled.push(tryResolvePromise2);
                this._onRejected.push(tryRejectPromise2);
            } else if (this._status === FULFILLED) {
                setTimeout(tryResolvePromise2, 0, this._result);
            } else if (this._status === REJECTED) {
                setTimeout(tryRejectPromise2, 0, this._result);
            }
        })
        return promise2;
    }

    static resolve(v) {
        if (v && v._type === PROMISES) {
            return v;
        } else if (v && then in v) {
            return new MyPromise((resolve, reject) => {
                v.then(resolve, reject);
            })
        } else {
            return new MyPromise(r => {
                r(v);
            })
        }
    }

    static reject(v) {
        return new MyPromise((_, e) => {
            e(v);
        });
    }

    static race(arr) {
        return new MyPromise((resolve, reject) => {
            for (const item of arr) {
                Promise.resolve(item).then(resolve, reject);
            }
        })
    }

    static all(arr) {
        return new MyPromise((resolve, reject) => {
            if(!arr || !arr[Symbol.iterator]){
                reject(new TypeError('参数不可迭代'));
            }
            arr = Array.from(arr);
            if(arr.length===0){
                resolve([]);
            }
            let result = new Array(arr.length), cnt = 0;
            arr.forEach((item, index) => {
                if (item._type === PROMISES) {
                    item.then(v => {
                        cnt++;
                        result[index] = v;
                        cnt === arr.length && resolve(result);
                    }, e => {
                        reject(e);
                    })
                } else {
                    cnt++;
                    result[index] = item;
                    cnt === arr.length && resolve(result);
                }
            })
        })
    }

    static deferred() {
        const result = {};
        result.promise = new MyPromise((r, e) => {
            result.reject = e;
            result.resolve = r;
        });

        return result;
    }
}

module.exports = MyPromise;