/* 
    词法分析器识别五类符号：标识符(包含关键字)，常数，运算符，界限符

    标识符：由大小写字母，还有下划线_,$还有数字组成。开头不允许出现数字。
            正则为：[a-zA-Z_$]  [a-zA-Z_$]?(\w|[a-zA-Z_$])*


    常数(digit)：
        有符号的数字，后面不允许跟随其他字母符号，除了小写的e，科学计数法
        目前先支持整数，之后再添加浮点数
        整数型：[0-9]*  //整数部分由数字0-9组成
        浮点型：.?[0-9]*
        整合：[0-9]*.?[0-9]*||^[0-9]*\.?[0-9]*$   //强制判断是否为数字

    运算符(operationalCharacter):
            ["+","-","*","/","<","<=",">",">=","=","==",
        "!=",";","(",")","^",",","\"","\'","#","&",
        "&&","|","||","%","~","<<",">>","[","]","{",
        "}","\\",".","\?",":","!"]


    界限符：/*,//,(),{,},[,],",",'

*/
require('./addArrayFn')(); //添加一些自定义的数组方法

/* 
    识别数字
*/
const digit = new RegExp('[\-0-9\.]'); //定义常量的正则
function isDigit(str) { //判断是否为数字
    return digit.test(str);
}
const digitType = {
    type: 'digit', //类型
    isType: isDigit, //判断函数
    endString: ' ',
    errString: '', //错误字符
    errFn: function () { //错误处理函数

    },
    getContent: function () {
        /* 自动机，获取内容的函数可能要单独写一个函数，之后传入配置。来进行获取内容和处理内容 */

    }
}

/* 
    识别标识符
*/
const letter = new RegExp('[a-zA-Z_$]'); //定义标识符的正则
const letterSecond = new RegExp('[0-9a-zA-Z_$]'); //标识符第二个开始的字符，
function isLetter(str) {
    return letter.test(str);
}

function isLetterSecond(str) {
    return letterSecond.test(str);
}
const letterType = {
    type: 'letter', //类型
    isType: isLetter, //判断函数
    endString: ' ',
    errString: '', //错误字符
    errFn: function () { //错误处理函数
    },
    callback:function(){
        
    }
}

//关键词的数组和判断函数
const keywordArray = ['break', 'else', 'new', 'var', 'case', 'finally',
    'return', 'void', 'catch', 'for', 'switch',
    'while', 'continue', 'function', 'this', 'with', 'default',
    'if', 'throw', 'delete', 'in',
    'try', 'do', 'instranceof', 'typeof'
];

function isKeyword(str) { //识别关键字
    return keywordArray.isHas(str);
}

/* 
    识别运算符
*/

const operationalCharacter = ["+", "-", "*", "/", "<", "<=", ">", ">=", "=", "==",
    "===", "!=", "+=", "-=", "++", "--", ";", "(", ")", "[", "]", "{", "}", "^", "#", "&",
    "&&", "|", "||", "%", "~", "<<", ">>", "/", ".", "?", ":", "!", ","
]

const isOperationalCharacter = (str) => {
    return operationalCharacter.isHas(str);
}; 

const operationalCharacterType = {
    type: 'operationalCharacter', //类型
    isType: isOperationalCharacter, //判断函数
    endString: ' ',
    errString: '', //错误字符
    errFn: function () { //错误处理函数
    },
    getContent: function () {
    }
}
/* 
    识别界限和包裹符号,加上注释
*/
const delimiterAndWarp = [
    '"', "'", "/*", "*/", "//"
]
function isDelimiter(str) {
    return delimiterAndWarp.isHas(str);
}
const delimiterType = {
    type: 'delimiter', //类型
    isType: isDelimiter, //判断函数
    endString: ' ',
    errString: '', //错误字符
    errFn: function () { //错误处理函数
    },
    getContent: function () {
    }
}

/* 
    识别空格
*/
const tabs = new RegExp('\\n|\\r'); //识别制表符
function isTabs(str) {
    return tabs.test(str);
}

const tabsType = {
    type: 'tabs', //类型
    isType: isTabs, //判断函数
    endString: ' ',
    errString: '', //错误字符
    errFn: function () { //错误处理函数
    },
    getContent: function () {
    }
}

function stringType(str) { //判断传进来的字符类型
    let typeArray = [delimiterType,operationalCharacterType, tabsType, digitType, letterType];
    var type;
    typeArray.forEach(item => {
        if (item.isType(str)) {
            type=item.type;
            return;
        }
    });
    return type;
}

function lexicalAnalysis(data) {
    // console.log("词法分析器获取到的数据", data);
    var tokenArray = [],
        i = -1,
        nowStr;

    function nextChar() { //返回下一个字符
        i++;
        let str = data.charAt(i);
        if (str === '') {
            str = -1;
        }
        return str;
    }

    function saveToken(o) { //保存token
        tokenArray.push(o);
    }

    function autoGetContent(typeObj) { //自动获取内容
        const token={
            type:typeObj.type,
            value:''
        }
        while(true){
            token.value+=nowStr;
            nowStr = nextChar();
            if(!~nowStr||!typeObj.isType(nowStr)){//一直识别，如果不是当前需要的内容，就开始特殊处理
                saveToken(token);
                i--;
                break
            }
        }
    }

    function getWarpContent(endString) {
        //传进来配置，控制这个函数的内容获取
        let o = {
            token: 'annotation', //注释
            value: ''
        }
        if (endString === "*/") {
            while (true) {
                nowStr = nextChar();
                if (!~nowStr) { //如果没有下一个字符，就直接跳出
                    saveToken(o);
                    i--;
                    break;
                }
                if (nowStr === "*") {
                    nowStr = nextChar();
                    if (nowStr == "/") {
                        saveToken(o);
                        i--;
                        break;
                    }
                    o.value += "*";
                }
                o.value += nowStr;
            }
        } else if (endString === "//") {
            while (true) {
                nowStr = nextChar();
                if (!~nowStr) { //如果没有下一个字符，就直接跳出
                    saveToken(o);
                    i--;
                    break;
                }
                if (nowStr === "\\n") {
                    saveToken(o);
                    i--;
                    break;
                }
                o.value += nowStr;
            }
        }
    }

    function doIdentificationChar() { //识别标识符
        if (isLetter.test(nowStr)) { //如果是字母的话，继续获取，直到下一个空格
            let o = {
                token: 'identifier',
                value: ''
            };
            while (true) {
                o.value += nowStr;
                nowStr = nextChar();
                if (!~nowStr) { //如果没有下一个字符，就直接跳出
                    saveToken(o);
                    i--;
                    break;
                }
                if (!isLetterS.test(nowStr)) { //判断字母后面的符号，如果不是我们要的，就直接退出返回
                    i--;
                    if (isKeyword(o.value)) {
                        o.token = "keyword"
                    }
                    saveToken(o);
                    break;
                }
            }
        }
    };

    function doDigit() { //用来识别和处理常量
        let o = {
            token: 'digit',
            value: ''
        }
        while (true) {
            o.value += nowStr;
            nowStr = nextChar();
            if (!~nowStr) { //如果没有下一个字符，就直接跳出
                saveToken(o);
                i--;
                break;
            }
            if (!isDigit.test(nowStr)) {
                if (isLetterS.test(nowStr)) {
                    console.log(tokenArray);
                    throw '语法错误，数字后面不允许跟随标识符 ： ' + nowStr
                }
                saveToken(o);
                i--;
                break;
            }
        }
    }

    function doOperationalCharacter() { //用来识别运算符
        let o = {
            token: 'operational', //运算符
            value: ''
        }
        while (true) {
            o.value += nowStr;
            nowStr = nextChar();
            if (!~nowStr) { //如果没有下一个字符，就直接跳出
                saveToken(o);
                i--;
                break;
            }
            let s = o.value + nowStr;
            if (!isOperationalCharacter(s)) {
                // if(isOperationalCharacter(nowStr)){
                //     throw '运算符语法错误:' + s
                // }
                saveToken(o);
                i--;
                break;
            }
        }
    }

    //运行主函数
    function main() {
        var typeObj={
            'delimiter':delimiterType,
            'operationalCharacter':operationalCharacterType, 
            'tabs':tabsType, 
            'digit':digitType, 
            'letter':letterType
        };
        do {
            nowStr = nextChar();
            // console.log(nowStr);
            if (nowStr === " " || nowStr === -1) {
                continue
            }
            autoGetContent(typeObj[stringType(nowStr)]);
            // if (nowStr == "/") {
            //     nowStr = nextChar();
            //     if (nowStr == "*") {
            //         getWarpContent("*/");
            //     } else if (nowStr == "/") {
            //         getWarpContent("//");
            //     } else {
            //         i--;
            //         nowStr = "/"
            //     }
            // } else if (isLetter.test(nowStr)) { //判断下应该进入什么识别判断
            //     doIdentificationChar();
            // } else if (isDigit.test(nowStr)) { //数字判断与识别
            //     doDigit();
            // } else if (isOperationalCharacter(nowStr)) { //定界符的识别和判断
            //     doOperationalCharacter();
            // } else if (isTabs.test(nowStr)) {
            //     doTabs();
            // } else { //报错输出不能识别的符号
            //     console.log(tokenArray);
            //     throw '不能识别的标识符:' + nowStr
            // }
        } while (!!~nowStr);
        return tokenArray
    }
    return main()
}
module.exports = lexicalAnalysis;