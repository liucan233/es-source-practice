function throttle(task,delay){
    let taskId=0;
    return ()=>{
        if(taskId===0){
            taskId=setTimeout(()=>{
                taskId=0;
                task();
            },delay);
        }
    }
}