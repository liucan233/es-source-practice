// 立即执行版
function debounce1(task, delay) {
    let taskId = 0;
    return () => {
        if (taskId ===0){
            task();
        } else {
            clearTimeout(taskId);
        }
        taskId = setTimeout(() => {
            taskId = 0;
        },delay);
    }
}

// 非立即执行版
function debounce2(task,delay){
    let taskId=0;
    return ()=>{
        if(taskId){
            clearTimeout(taskId);
            taskId=0;
        }
        taskId=setTimeout(task,delay);
    }
}

const c={
    test(){
        console.log(2333)
    }
}

const test=debounce(c.test,1000);
test();

setTimeout(test,100);
setTimeout(test,900);
setTimeout(test,1800);
setTimeout(test,2700);
setTimeout(test,3600);
test();