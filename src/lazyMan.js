function LazyMan(name){
    const tasks=[()=>console.log(`Hi This is ${name}!`)];

    const createSleepTask=(times)=>{
        return ()=>{
            return new Promise(r=>{
                setTimeout(()=>{
                    r();
                    console.log(`Wake up after ${times}`);
                },times*1000)
            });
        }
    }

    setTimeout(()=>{
        tasks.reduce((pre,cur)=>{
            return pre.then(cur);
        },Promise.resolve());
    });
    return {
        sleep(times){
            tasks.push(createSleepTask(times));
            return this;
        },
        sleepFirst(times){
            tasks.unshift(createSleepTask(times))
            return this;
        },
        eat(food){
            tasks.push(()=>{
                console.log(`Eat ${food} ~`)
            })
            return this;
        }
    }
}

// LazyMan("Hank")
// 打印：Hi! This is Hank!

LazyMan("Hank").sleep(10).eat("dinner")
// 打印：Hi! This is Hank!
// 等待了 10 秒后
// 打印：Wake up after 10
// 打印：Eat dinner~

// LazyMan("Hank").eat("dinner").eat("supper")
// 打印：Hi This is Hank!
// 打印：Eat dinner~
// 打印：Eat supper~

// LazyMan("Hank").sleepFirst(5).eat("supper")
// 等待了 5 秒后
// 打印：Wake up after 5
// 打印：Hi This is Hank!
// 打印：Eat supper

// LazyMan("Hank").eat("supper").sleepFirst(5)
// 等待了 5 秒后
// 打印：Wake up after 5
// 打印：Hi This is Hank!
// 打印：Eat supper