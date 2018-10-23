function addArrayFn(){
    Array.prototype.isHas=function(item){
        return !!~this.indexOf(item);
    }
}
module.exports = addArrayFn;