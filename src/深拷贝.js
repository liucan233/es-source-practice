function deepClone(target){
    let result=target;
    if(target!==null && typeof target==='object'){
        if(target instanceof Set){
            result=new Set();
            for(const i of target){
                result.add(deepClone(i));
            }
        } else if(target instanceof Map){
            result=new Map();
            for(const [k,v] of target){
                result.add(k,deepClone(v));
            }
        } else if(Array.isArray(target)){
            result=target.map(i=>deepClone(i))
        } else if(target instanceof RegExp){
            result=new RegExp(target);
        } else if(Object.getPrototypeOf(target)===Object.prototype){
            result={}
        }
    }
    return result;
}