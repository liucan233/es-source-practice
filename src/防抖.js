// 立即执行版
function debounce1(task, delay) {
  let awaitId = null;
  return function () {
    if (awaitId === null) {
      task.apply(this, arguments);
    } else {
      clearTimeout(awaitId);
    }
    awaitId = setTimeout(() => {
      awaitId = null;
    }, delay);
  };
}

// 非立即执行版
function debounce2(task, delay) {
  let taskId = null;
  return function () {
    if (taskId) {
      clearTimeout(taskId);
    }
    taskId = setTimeout(task.bind(this, ...arguments), delay);
  };
}

const task=function(msg){
    console.log(this)
    console.log('executed '+msg)
}

const test = {
  exec1: debounce1(task,1500),
  exec2: debounce2(task,1500)
};

test.exec2(1)
test.exec2(2)
test.exec2(3)

setTimeout(test.exec2.bind({tmp:3},3), 100);
setTimeout(test.exec2.bind({tmp:4},4), 900);
setTimeout(test.exec2.bind({tmp:5},5), 1100);
