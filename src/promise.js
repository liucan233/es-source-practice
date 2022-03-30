/**符合Promise/A+规范的Promise
 * 参考：https://juejin.cn/post/7043758954496655397
 */

/**处理捕获的错误 */
const process = require('process');

process.on('uncaughtException', (err) => {
    console.log(err);
});

/**promise符号 */
const PROMISES = Symbol('promise');
/**pending状态 */
const PENDING = 'pending';
/**pending状态 */
const FULLFILLED = 'fulfilled';
/**pending状态 */
const REJECTED = 'rejected';

/**处理规范的[[Resolve]](promise, x)过程
 * 详见：https://liucan233.github.io/promise-a-plus/#the-promise-resolution-procedure
 */
function resolvePromise(promise, x, resolve, reject) {
    if (x === promise) { // 规范2.3.1
        reject(new TypeError('x与原promise引用相同，不符合规范2.3.1'));
    } else if (x && x._type === PROMISES) { // 规范2.3.2
        if (x._status === PENDING) {
            x.then(y => {
                resolvePromise(promise, y, resolve, reject);
            }, reject);
        } else if (x._status === FULLFILLED) {
            resolve(x._result);
        } else if (x._status === REJECTED) {
            reject(x._result);
        } else {
            throw new TypeError('MyPromise存在错误');
        }
    } else if (typeof x === 'function' || (x && typeof x === 'object')) { // 规范2.3.3
        let then = null;
        try { // 尝试访问then属性
            then = x.then;
        } catch (e) {
            reject(e);
        }
        if (typeof then === 'function') { // 如果then是函数
            let called = false;
            try {
                then.call(x, (y) => {
                    if (called) {
                        return;
                    }
                    called = true;
                    resolvePromise(promise, y, resolve, reject);
                }, (e) => {
                    if (called) return;
                    called = true;
                    reject(e);
                });
            } catch (e) {
                if (!called) {
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
    /**promise状态 */
    _status = PENDING;
    /**兑现时的回调列表 */
    _onFulfilled = [];
    /**失败时的回调列表 */
    _onRejected = []
    /**标记为promise类型 */
    _type = PROMISES;
    /**状态转换时的结果 */
    _result = undefined;

    constructor(executor) {
        try {
            executor(
                this._resolve.bind(this),
                this._reject.bind(this)
            );
        } catch (e) {
            this._reject(e);
        }
    }

    _resolve(value) {
        this._shiftStatus(FULLFILLED,value);
    }

    _reject(err) {
        this._shiftStatus(REJECTED,err);
    }

    _shiftStatus(to, value) {
        if (this._status === PENDING) {
            const success=(to===FULLFILLED);
            setTimeout(() => {
                this._result = value;
                this._status = to;
                this._runTasks(success?this._onFulfilled:this._onRejected);
            });
        }
    }

    _runTasks(tasks) {
        const result = this._result;
        tasks.forEach(task => {
            task(result);
        });
    }

    then(onFulfilled, onRejected) {
        const promise2 = new MyPromise((resolve, reject) => {
            const tryResolvePromise2 = value => {
                if(typeof onFulfilled==='function'){
                    try {
                        const x = onFulfilled(value);
                        resolvePromise(promise2, x, resolve, reject);
                    } catch (e) {
                        reject(e);
                    }
                } else {
                    resolve(value);
                }
            }
            const tryRejectPromise2 = err => {
                if(typeof onRejected==='function'){
                    try {
                        const x = onRejected(err);
                        resolvePromise(promise2, x, resolve, reject);
                    } catch (e) {
                        reject(e);
                    }
                } else {
                    reject(err);
                }
            };
            if (this._status === PENDING) {
                this._onFulfilled.push(tryResolvePromise2);
                this._onRejected.push(tryRejectPromise2);
            } else if (this._status === FULLFILLED) {
                const result = this._result;
                setTimeout(function () {
                    tryResolvePromise2(result);
                });
            } else if (this._status === REJECTED) {
                const result = this._result;
                setTimeout(function () {
                    tryRejectPromise2(result);
                });
            }
        });
        return promise2;
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