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

function lexicalAnalysis(data) {
    // console.log("词法分析器获取到的数据", data);
    var tokenArray = [],
        i = -1,
        nowChar;
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
        getContent: function (token) {
            while (true) {
                nextChar();
                if (nowChar == -1 || !isDigit(nowChar)) {
                    token.type = "digit"
                    saveToken(token);
                    i--;
                    break;
                }
                token.value += nowChar;
            }
        }
    }
    /* 
        识别标识符
    */
    const letter = new RegExp('[a-zA-Z_$]'); //定义标识符的正则
    const letterSecond = new RegExp('[0-9a-zA-Z_$]'); //标识符第二个开始的字符，
    function isLetter(str, state) {
        if (state == undefined) {
            return letter.test(str);
        } else if (state == 'while') {
            return letterSecond.test(str);
        }
    }

    function isLetterSecond(str) {
        return letterSecond.test(str);
    }
    const letterType = {
        type: 'letter', //类型
        isType: isLetter, //判断函数
        endString: ' ',
        errString: '', //错误字符
        getContent(token) {
            while (true) {
                nextChar();
                if (nowChar == -1 || !isLetterSecond(nowChar)) {
                    if (isKeyword(token.value)) {
                        token.type = "keyword"
                    } else {
                        token.type = "letter"
                    }
                    saveToken(token);
                    i--;
                    break;
                }
                token.value += nowChar;
            }
        },
        errFn: function () { //错误处理函数
        },
    }

    //关键词的数组和判断函数
    const keywordArray = ['break', 'else', 'new', 'var', 'case', 'finally',
        'return', 'void', 'catch', 'for', 'switch',
        'while', 'continue', 'function', 'this', 'with', 'default',
        'if', 'throw', 'delete', 'in', 'require',
        'try', 'do', 'instranceof', 'typeof','exports'
    ];

    function isKeyword(str) { //识别关键字
        return keywordArray.isHas(str);
    }

    /* 
        识别运算符
    */

    const operationalCharacter = ["+", "-", "*", "/", "<", "<=", ">", ">=", "=", "==",
        "===", "!=", "+=", "-=", "++", "--", ";", "(", ")", "[", "]", "{", "}", "^", "#", "&",
        "&&", "|", "||", "%", "~", "<<", ">>", "/", ".", "?", ":", "!", ",", '"', "'"
    ]

    const isOperationalCharacter = (str) => {
        return operationalCharacter.isHas(str);
    };

    const operationalCharacterType = {
        type: 'operationalCharacter', //类型
        isType: isOperationalCharacter, //判断函数
        endString: ' ',
        errString: '', //错误字符
        errFn(str) { //错误处理函数
            console.log(tokenArray);
            throw '语法错误,不能识别的符号：' + str
        },
        getContent(token) {
            if (token.value == '/') {
                nextChar();
                if (nowChar == '*') {
                    token.value = '';
                    while (true) {
                        nextChar();
                        if (nowChar == '*') {
                            nextChar();
                            if (nowChar == '/') {
                                token.type = "annotation"
                                saveToken(token);
                                break;
                            } else {
                                i--;
                                nowChar = '*'
                            }
                        }
                        token.value += nowChar;
                    }
                } else if (nowChar == '/') {
                    token.value = '';
                    while (true) {
                        nextChar();
                        if (nowChar == -1 || nowChar == '\r') {
                            token.type = "annotation"
                            saveToken(token);
                            break;
                        }
                        token.value += nowChar;
                    }
                } else {
                    i--;
                    saveToken(token);
                }
            } else if (token.value == "'") {
                token.value = '';
                while (true) {
                    nextChar();
                    if (nowChar == -1) {
                        throw '字符串没有结尾';
                    }
                    if (nowChar == "'") {
                        token.type = "string"
                        saveToken(token);
                        break;
                    }
                    token.value += nowChar;
                }
            } else if (token.value == '"') {
                token.value = '';
                while (true) {
                    nextChar();
                    if (nowChar == -1) {
                        throw '字符串没有结尾';
                    }
                    if (nowChar == '"') {
                        token.type = "string"
                        saveToken(token);
                        break;
                    }
                    token.value += nowChar;
                }
            } else {
                while (true) {
                    let a = '';
                    nextChar();
                    if (!isOperationalCharacter(nowChar)) {
                        saveToken(token);
                        i--;
                        break;
                    }
                    a = token.value + nowChar
                    if (!isOperationalCharacter(a)) {
                        saveToken(token);
                        i--;
                        break;
                    }
                    token.value = a;

                }
            }
        },
        before(obj, nowChar) { //验证
            //所有进入操作符的判断都要进行边界符的判断
        },
        callback(obj) { //识别结束之后的回调函数
            if (!this.isType(obj.value)) {
                this.errFn(obj.value);
            }
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
        before(obj, nowChar) { //验证
            if (obj.value == '/*' || obj.value == '//' || obj.value == '"' || obj.value == "'") {
                return -1
            } else {
                return nowChar
            }
        },
        callback() { //识别结束之后的回调函数
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
        getContent: function (token) {
            while (true) {
                nextChar();
                if (nowChar == -1 || !isTabs(nowChar)) {
                    token.type = "tabs"
                    saveToken(token);
                    i--;
                    break;
                }
                token.value += nowChar;
            }
        }
    }

    function stringType(str) { //判断传进来的字符类型
        let typeArray = [operationalCharacterType, tabsType, digitType, letterType];
        var type;
        typeArray.forEach(item => {
            if (item.isType(str)) {
                type = item.type;
                return;
            }
        });
        return type;
    }

    function nextChar() { //返回下一个字符
        i++;
        nowChar = data.charAt(i);
        if (nowChar === '') {
            nowChar = -1;
        }
    }

    function saveToken(o) { //保存token
        tokenArray.push(o);
    }

    function autoGetContent(typeObj) { //自动获取内容
        //判断一个字符是什么类型之后，就进入这个函数，这个函数根据传进来的类型进行识别
        const token = {
            type: typeObj.type,
            value: nowChar
        }
        typeObj.getContent(token);
    }

    //运行主函数
    function main() {
        var typeObj = {
            'operationalCharacter': operationalCharacterType,
            'tabs': tabsType,
            'digit': digitType,
            'letter': letterType
        };
        do {
            nextChar();
            if (nowChar === " " || nowChar === -1) {
                continue
            }
            autoGetContent(typeObj[stringType(nowChar)]);
        } while (!!~nowChar);
        return tokenArray
    }
    return main()
}
module.exports = lexicalAnalysis;