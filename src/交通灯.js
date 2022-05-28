const createLight = (color, times, signal) => {
    return () => new Promise((resolve) => {
        setTimeout(() => {
            resolve();
            console.log(color);
        }, times);
    });
}

const greenLight = createLight('绿色', 1000),
    yellowLight = createLight('黄色', 1000),
    redLight = createLight('红色', 1000);

const pipe=()=>{
    return greenLight().then(yellowLight).then(redLight).then(pipe);
}

pipe();