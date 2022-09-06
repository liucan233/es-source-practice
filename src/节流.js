/**立即执行版 */
function throttle(executor, delay) {
  let awaiting = false;
  return function (...args){
    if (awaiting === false) {
      awaiting = true;
      setTimeout(() => {
        awaiting = false;
      }, delay);
      executor.apply(this, args);
    }
  };
}

const test = {
  exec: throttle(function (msg){
    console.log(this);
    console.log("executed " + msg);
  }, 1000),
};

test.exec(1);
test.exec();

setTimeout(test.exec, 900);
setTimeout(test.exec.bind({tmp:2}), 1100, 2);
