/**
 * 传入一个任务列表，和最大并发数去执行任务，并返回结果
 * @param taskList 任务列表，每个元素是函数
 * @returns 返回任务执行的结果
 */
function executeTasks(taskList = [], limit = 3) {
    return new Promise((resolve, reject) => {
        if (Array.isArray(taskList)) {
            if (taskList.length === 0) {
                resolve([]);
            } else {
                const result = new Array(taskList.length);
                let executedCnt = 0,nextTask=0;
                function handleRes(index,status,value){
                    result[index]={
                        status,
                        value
                    };
                    executedCnt++;
                    if(executedCnt===result.length){
                        resolve(result);
                    } else {
                        handleTask(nextTask);
                    }
                }

                function handleTask(index = -1){
                    nextTask++;
                    if(index>-1 && index<result.length){
                        console.log('执行任务'+index);
                        let task=taskList[index];
                        if(typeof task==='function'){
                            task=task();
                        }
                        Promise.resolve(task).then(res => {
                            handleRes(index,'success',res);
                        }).catch((err) => {
                            handleRes(index,'error',err);
                        });
                    }
                }
                for(let i=0;i<limit;i++){
                    handleTask(i);
                }
            }
        } else {
            reject(new TypeError('taskList不是数组'));
        }
    });
}

function createTask(delay,response=1,result='resolve'){
    return new Promise((resolve,reject)=>{
        setTimeout(result==='resolve'? resolve:reject,delay,response);
    })
}

executeTasks([
    createTask.bind(null,1000,1,'resolve'),
    createTask.bind(null,1000,2,'resolve'),
    createTask.bind(null,1000,3,'resolve'),
    createTask.bind(null,5000,4,'resolve'),
    createTask.bind(null,1000,5,'error'),
    createTask.bind(null,1000,6,'resolve'),
    createTask.bind(null,1000,7,'resolve'),
],3).then(res=>{
    console.log(res)
})