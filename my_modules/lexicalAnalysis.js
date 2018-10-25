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
        nowStr;
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
        errFn: function () { //错误处理函数
        },
        callback: function (obj) { //识别结束之后的回调函数
            if (isKeyword(obj.value)) {
                obj.type = "keyword";
            }
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
        errFn(str) { //错误处理函数
            throw '语法错误'+str
        },
        before(obj, nowStr) { //验证
            // if(obj.type=='operationalCharacter'){
                // console.log("识别到全等福",obj.value);
            if (obj.value.length == 2) {
                if (obj.value == '==') {
                    return nowStr
                } else {
                    return -1
                }
            } else if (obj.value.length >= 3 ) {
                if(obj.value=='==='){
                    return nowStr
                }else{
                    this.errFn(obj.value[obj.value.length-1]);
                }
            } else {
                return nowStr
            }
            // }
        },
        callback(obj) { //识别结束之后的回调函数
            if (obj.value == "/*") { //注释符开始
                obj.value = '';
                while (true) {
                    nowStr = nextChar();
                    if (!~nowStr) return;
                    if (nowStr == "*") {
                        nowStr = nextChar();
                        if (nowStr == '/') {
                            obj.type = "annotation";
                            // console.log('?????',tokenArray);
                            // saveToken(obj);
                            // console.log('?????',tokenArray);
                            break;
                        }
                        nowStr = '*'
                        i--;
                    }
                    obj.value += nowStr;
                }
            } else if (obj.value == "//") {
                obj.value = '';
                while (true) {
                    nowStr = nextChar();
                    // console.log("sssss",nowStr == "\r");
                    if (!~nowStr) return;
                    if (nowStr == "\r") {
                        nowStr = nextChar();
                        if (nowStr == '\n') {
                            obj.type = "annotation";
                            // saveToken(obj);
                            break;
                        }
                        nowStr = '\r'
                        i--;
                    }
                    obj.value += nowStr;
                }
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
        getContent: function () {}
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
        getContent: function () {}
    }

    function stringType(str) { //判断传进来的字符类型
        let typeArray = [delimiterType, operationalCharacterType, tabsType, digitType, letterType];
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
        console.log(typeObj.type);
        //判断一个字符是什么类型之后，就进入这个函数，这个函数根据传进来的类型进行识别
        // console.log('1111');
        const token = {
            type: typeObj.type,
            value: ''
        }
        while (true) {
            token.value += nowStr;
            nowStr = nextChar();
            nowStr = typeObj.before == undefined ? nowStr : typeObj.before(token, nowStr); //调用回调函数
            if (!~nowStr || !typeObj.isType(nowStr, 'while')) { //一直识别，如果不是当前需要的内容，就开始特殊处理
                saveToken(token);
                i--;
                typeObj.callback && typeObj.callback(token); //调用回调函数
                // console.log('这样子就没了？');
                break
            }
        }
    }

    //运行主函数
    function main() {
        var typeObj = {
            'delimiter': delimiterType,
            'operationalCharacter': operationalCharacterType,
            'tabs': tabsType,
            'digit': digitType,
            'letter': letterType
        };
        do {
            nowStr = nextChar();
            if (nowStr === " " || nowStr === -1) {
                continue
            }
            autoGetContent(typeObj[stringType(nowStr)]);
        } while (!!~nowStr);
        return tokenArray
    }
    return main()
}
module.exports = lexicalAnalysis;