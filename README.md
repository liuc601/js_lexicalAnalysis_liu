# 词法分析器

# 目录解释
     my_modules  自己编写的一些模块，读取文件和写入文件的函数，用于将分析的结果放在生成的文件中
     source_program  需要分析的源码程序，放在这个文件夹
     src  程序运行的主文件和逻辑代码   
    
# 思路解释
##前期工作
    使用node进行文件的读取，经过词法分析后，将分析后的结果再写入到文件中
##识别规则
    字母 letter
        正则表达式：/[a-zA-Z]/

    数字 digit
        正则表达式：/[0-9]/

    保留字
        var reservedKeyArray = [
                'break', 'else', 'new', 'var', 'case', 'finally',
                'return', 'void', 'catch', 'for', 'switch',
                'while', 'continue', 'function', 'this', 'with', 'default',
                'if', 'throw', 'delete', 'in',
                'try', 'do', 'instranceof', 'typeof'
            ]
        

### 1，确定标识符和运算符啥的，还有确定关键字
    a,标识符(字母开头，后面可以拼接各种字母或者数字)
        letter(letter | digit)*  无穷集
    b,常数(即数字，可以识别整数和浮点数，正数和负数，还有指数)
        digit*

### 2，确定需要用的函数，还有需要识别的一些数据的类型