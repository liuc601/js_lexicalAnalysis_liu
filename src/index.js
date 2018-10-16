// import {readF,writeF} from "./../my_modules/readAndWrite";
const {readF,writeF}= require("./../my_modules/readAndWrite");
const la=require("../my_modules/lexicalAnalysis");
var lexicalArray;
readF("./source_program/test.txt").then(data=>{
    lexicalArray=la(data);
    console.log("词法分析得到的结果",lexicalArray);
    writeF("./dist/test.txt",JSON.stringify(lexicalArray)).then(msg=>{
        console.log(msg);
    });
});