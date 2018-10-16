const fs = require('fs');
function readF(src){
    return new Promise(function(resolve,reject){
       return  fs.readFile(src, 'utf-8', function (err, data) {
            if (err) {
                console.log(err);
            } else {
                resolve(data)
            }
        });
    })
}
function writeF(src,data){
    return  new Promise(function(resolve,reject){
       return  fs.writeFile(src, data, function (err) {
            if (err) {
                console.log(err);
            } else {
                resolve('文件写入成功！')
            }
        });
    })
}
module.exports={
    readF,writeF
}