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

const isLetter = new RegExp('[a-zA-Z_$]'); //字母识别正则，
const isLetterS = new RegExp('[0-9a-zA-Z_$]'); //字母识别正则，
const keywordArray = ['break', 'else', 'new', 'var', 'case', 'finally',
    'return', 'void', 'catch', 'for', 'switch',
    'while', 'continue', 'function', 'this', 'with', 'default',
    'if', 'throw', 'delete', 'in',
    'try', 'do', 'instranceof', 'typeof'
]
const isDigit = new RegExp('[0-9]'); //常量识别的正则
const operationalCharacter = ["+", "-", "*", "/", "<", "<=", ">", ">=", "=", "==",
    "!=", ";", "(", ")", "^", ",", '"', "'", "#", "&",
    "&&", "|", "||", "%", "~", "<<", ">>", "[", "]", "{",
    "}", "/", ".", "?", ":", "!"
]
const isOperationalCharacter = (str) => {
    let flag = false;
    operationalCharacter.forEach(item => {
        if (item === str) {
            flag = true;
            return
        }
    });
    return flag;
}; //用正则来判断是否为运算符



function lexicalAnalysis(data) {
    console.log("词法分析器获取到的数据", data);
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

    function isKeyword(str) { //识别关键字
        let flag = false;
        keywordArray.forEach(item => {
            if (item === str) {
                flag = true;
            }
        });
        return flag;
    }

    function doDigit() { //用来识别和处理常量
        let o = {
            token: 'operationalAndDelimiter',
            value: ''
        }
        while (true) {
            o.value += nowStr;
            nowStr = nextChar();
            if (!~nowStr) { //如果没有下一个字符，就直接跳出
                break;
            }
            if (!isOperationalCharacter(nowStr)) {
                saveToken(o);
                i--;
                break;
            }
        }
    }
    function doOperationalCharacter() { //用来识别运算符
        let o = {
            token: 'operationalAndDelimiter',
            value: ''
        }
        while (true) {
            o.value += nowStr;
            nowStr = nextChar();
            if (!~nowStr) { //如果没有下一个字符，就直接跳出
                break;
            }
            if (!isOperationalCharacter(nowStr)) {
                saveToken(o);
                i--;
                break;
            }
        }
    }

    do {
        nowStr = nextChar();
        if (nowStr === " " || nowStr === -1) {
            continue
        }
        if (isLetter.test(nowStr)) { //判断下应该进入什么识别判断
            doIdentificationChar();
        } else if (isDigit.test(nowStr)) {
            i++
        } else if (isOperationalCharacter(nowStr)) {
            doOperationalCharacter();
        } else {
            console.log(tokenArray);
            throw '不能识别的标识符: ' + nowStr
        }
    } while (!!~nowStr);
    return tokenArray
}
module.exports = lexicalAnalysis;