#!/usr/bin/env python3
"""Generate Java basic choice/true_false seed data from structured input."""
import json

# Each question: (title, content, options, correct_idx, difficulty, tags)
# correct_idx: which option (0-based) is correct

QUESTIONS = [
    # Q1-Q10: Java Basics - Language fundamentals
    ("Java源程序的文件扩展名",
     "使用Java语言编写的源程序保存时的文件扩展名是？",
     [".class", ".java", ".cpp", ".txt"], 1, "easy", ["基础", "Java程序结构"]),

    ("表达式a>>>3的值",
     "设int a=-2，则表达式a>>>3的值为？",
     ["0", "3", "8", "-1"], 0, "medium", ["基础", "位运算"]),

    ("数组元素引用错误的是",
     "设有数组的定义int[] a = new int[3]，则下面对数组元素的引用错误的是？",
     ["a[0]", "a[a.length-1]", "a[3]", "int i=1; a[i]"], 2, "easy", ["基础", "数组"]),

    ("类中可以有两个同名函数的现象称为",
     "在类的定义中可以有两个同名函数，这种现象称为函数什么？",
     ["封装", "继承", "覆盖", "重载"], 3, "easy", ["面向对象", "重载"]),

    ("构造函数的作用是",
     "在类的定义中构造函数的作用是？",
     ["保护成员变量", "读取类的成员变量", "描述类的特征", "初始化成员变量"], 3, "easy", ["面向对象", "构造函数"]),

    ("哪一个不是异常处理关键字",
     "下面关键字中，哪一个不是用于异常处理语句？",
     ["try", "break", "catch", "finally"], 1, "easy", ["基础", "异常处理"]),

    ("类与对象的关系是",
     "类与对象的关系是？",
     ["类是对象的抽象", "对象是类的抽象", "对象是类的子类", "类是对象的具体实例"], 0, "easy", ["面向对象", "类和对象"]),

    ("Java中不合法的标识符是",
     "下面哪一个是Java中不合法的标识符？",
     ["$persons", "twoNum", "_myVar", "_point"], 0, "easy", ["基础", "标识符"]),

    ("使用类名AB作为前缀就可以调用的方法",
     "为AB类的一个无形式参数无返回值的方法method书写方法头，使得使用类名AB作为前缀就可以调用它，该方法头的形式为？",
     ["static void method()", "public void method()", "final void method()", "abstract void method()"], 0, "easy", ["基础", "static方法"]),

    ("构造ArrayList实例的正确方法是",
     "欲构造ArrayList类的一个实例，此类继承了List接口，下列哪个方法是正确的？",
     ["ArrayList myList=new Object()", "List myList=new ArrayList()", "ArrayList myList=new List()", "List myList=new List()"], 1, "easy", ["集合", "ArrayList"]),

    # Q11-Q20
    ("Java源文件和编译后的文件扩展名",
     "Java源文件和编译后的文件扩展名分别为？",
     [".class和.java", ".java和.class", ".class和.class", ".java和.java"], 1, "easy", ["基础", "Java程序结构"]),

    ("Applet中完成画图操作需要重载的方法",
     "在Java Applet程序用户自定义的Applet子类中，一般需要重载父类的哪个方法来完成一些画图操作？",
     ["start()", "stop()", "init()", "paint()"], 3, "medium", ["基础", "Applet"]),

    ("Java源文件中import, class和package的正确顺序",
     "对于一个Java源文件，import, class定义以及package正确的顺序是？",
     ["package,import,class", "class,import,package", "import,package,class", "package,class,import"], 0, "easy", ["基础", "包和导入"]),

    ("下面哪个变量声明是非法的",
     "下面哪个是非法的变量声明？",
     ["int i = 32;", "float f = 45.0;", "double d = 45.0;", "char c = 'u';"], 1, "medium", ["基础", "数据类型"]),

    ("Java语言使用的字符码集是",
     "Java语言使用的字符码集是？",
     ["ASCII", "BCD", "DCB", "Unicode"], 3, "easy", ["基础", "Unicode"]),

    ("成员变量只能在所在类中使用的修饰符",
     "如果一个类的成员变量只能在所在类中使用，则该成员变量必须使用的修饰是？",
     ["public", "protected", "private", "static"], 2, "easy", ["面向对象", "访问控制"]),

    ("main方法说明正确的是",
     "下面关于main方法说明正确的是？",
     ["public main(String args[])", "public static void main(String args[])", "private static void main(String args[])", "void main()"], 1, "easy", ["基础", "main方法"]),

    ("可以对对象加互斥锁的关键字",
     "哪个关键字可以对对象加互斥锁？",
     ["transient", "synchronized", "serialize", "static"], 1, "easy", ["并发", "synchronized"]),

    ("关于抽象方法的说法正确的是",
     "关于抽象方法的说法正确的是？",
     ["可以有方法体", "可以出现在非抽象类中", "是没有方法体的方法", "抽象类中的方法都是抽象方法"], 2, "easy", ["面向对象", "抽象方法"]),

    ("java.io包的File类是",
     "java.io包的File类是？",
     ["字符流类", "字节流类", "对象流类", "非流类"], 3, "medium", ["IO", "File类"]),

    # Q21-Q30
    ("main方法的正确形参是",
     "Java application中的主类需包含main方法，以下哪项是main方法的正确形参？",
     ["String args", "String args[]", "Char arg", "StringBuffer args[]"], 1, "easy", ["基础", "main方法"]),

    ("代码段y%x的输出结果为",
     "int x=-3；int y=-10；System.out.println(y%x);的输出结果为？",
     ["-1", "2", "1", "3"], 0, "medium", ["基础", "取模运算"]),

    ("关于继承的叙述正确的是",
     "以下关于继承的叙述正确的是？",
     ["在Java中类只允许单一继承", "在Java中一个类只能实现一个接口", "在Java中一个类不能同时继承一个类和实现一个接口", "在Java中接口只允许单一继承"], 0, "easy", ["面向对象", "继承"]),

    ("对byte数组元素错误的引用是",
     "若有定义byte[] x={11,22,33,-66}; 0≤k≤3，则对x数组元素错误的引用是？",
     ["x[5-3]", "x[k]", "x[k+5]", "x[0]"], 2, "easy", ["基础", "数组"]),

    ("paint()方法使用的参数类型是",
     "paint()方法使用哪种类型的参数？",
     ["Graphics", "Graphics2D", "String", "Color"], 0, "medium", ["基础", "图形界面"]),

    ("以下哪个不是Java的原始数据类型",
     "以下哪个不是Java的原始数据类型？",
     ["int", "Boolean", "float", "char"], 1, "easy", ["基础", "数据类型"]),

    ("一个类可定义许多同名的方法称为",
     "在Java中，一个类可同时定义许多同名的方法，这些方法的形式参数的个数、类型或顺序各不相同，传回的值也可以不相同。这种面向对象程序特性称为？",
     ["隐藏", "重写", "重载", "Java不支持此特性"], 2, "easy", ["面向对象", "重载"]),

    ("有关构造方法的说法正确的是",
     "以下有关构造方法的说法，正确的是？",
     ["一个类的构造方法可以有多个", "构造方法在类定义时被调用", "构造方法只能由对象中的其它方法调用", "构造方法可以和类同名，也可以和类名不同"], 0, "easy", ["面向对象", "构造函数"]),

    ("Applet中最先被执行的方法是",
     "在浏览器中执行applet程序，以下选项中的哪个方法将被最先执行？",
     ["init()", "start()", "destroy()", "stop()"], 0, "medium", ["基础", "Applet生命周期"]),

    ("int数组默认值的输出结果",
     "public class Person{static int arr[]=new int[5];public static void main(String a[]){System.out.println(arr[0]);}} 输出结果是？",
     ["编译时将产生错误", "编译时正确，运行时将产生错误", "输出零", "输出空"], 2, "easy", ["基础", "数组默认值"]),

    # Q31-Q40
    ("方法返回类型正确的是",
     "ReturnType method(byte x, double y){return (short)x/y*2;} 该方法的返回类型是？",
     ["byte", "short", "int", "double"], 3, "hard", ["基础", "类型转换"]),

    ("合法的抽象类定义是",
     "下列类定义中哪些是合法的抽象类的定义？",
     ["abstract Animal{abstract void growl();}", "class abstract Animal{abstract void growl();}", "abstract class Animal{abstract void growl();}", "abstract class Animal{abstract void growl(){}}"], 2, "easy", ["面向对象", "抽象类"]),

    ("哪个选项不能插入到行1",
     "有以下程序片段：1.public class Interesting{//do sth} 下列哪个选项不能插入到行1？",
     ["import java.awt.*;", "package mypackage;", "class OtherClass{}", "public class MyClass{}"], 3, "easy", ["基础", "Java文件结构"]),

    ("Integer.parseInt和Integer.valueOf的说法正确的是",
     "a = Integer.parseInt(\"12\"); b = Integer.valueOf(\"12\").intValue(); 下述说法正确的是？",
     ["a是整数类型变量，b是整数类对象", "a是整数类对象，b是整数类型变量", "a和b都是整数类对象并且值相等", "a和b都是整数类型变量并且值相等"], 3, "medium", ["基础", "包装类"]),

    ("编写Java Applet程序需要导入的包",
     "在编写Java Applet程序时，需在程序的开头写上什么语句？",
     ["import java.awt.*;", "import java.applet.Applet;", "import java.io.*;", "import java.awt.Graphics;"], 1, "medium", ["基础", "Applet"]),

    ("不属于Swing顶层容器的是",
     "下列哪一项不属于Swing的顶层容器？",
     ["JApplet", "JTree", "JDialog", "JFrame"], 1, "medium", ["基础", "Swing"]),

    ("使包ch4在当前程序中可见的语句",
     "为了使包ch4在当前程序中可见，可以使用的语句是？",
     ["import ch4.*;", "package ch4.*;", "ch4 import;", "ch4 package;"], 0, "easy", ["基础", "import语句"]),

    ("所有的异常类皆继承自",
     "请问所有的异常类皆继承哪一个类？",
     ["java.io.Exception", "java.lang.Throwable", "java.lang.Exception", "java.lang.Error"], 1, "easy", ["基础", "异常体系"]),

    ("Java基本的GUI设计需要用到的包",
     "进行Java基本的GUI设计需要用到的包是？",
     ["java.io", "java.sql", "java.awt", "java.rmi"], 2, "easy", ["基础", "AWT"]),

    ("点击鼠标时触发的事件",
     "当点击鼠标或者拖动鼠标时，触发的事件是下列的哪一个？",
     ["KeyEvent", "ActionEvent", "ItemEvent", "MouseEvent"], 3, "medium", ["基础", "事件处理"]),

    # Q41-Q50
    ("Java中的标识符",
     "如下哪个是Java中的合法标识符？",
     ["fieldname", "super", "3number", "#number"], 0, "easy", ["基础", "标识符"]),

    ("表达式y+=z--/++x的值",
     "设x=1,y=2,z=3，则表达式y+=z--/++x的值是？",
     ["3", "3.5", "4", "5"], 0, "hard", ["基础", "运算符优先级"]),

    ("循环后count的值",
     "int count=1;for(int i=1;i<=5;i++){count+=i;}System.out.println(count); 执行之后count的值是？",
     ["5", "1", "15", "16"], 3, "easy", ["基础", "循环"]),

    ("使用类名作为前缀就可以调用它",
     "为AB类的一个无形式参数无返回值的方法method书写方法头，使得使用类名AB作为前缀就可以调用它，该方法头的形式为？",
     ["static void method()", "public void method()", "final void method()", "abstract void method()"], 0, "easy", ["基础", "static方法"]),

    ("String循环输出结果",
     "String s=new String(\"abcdefg\"); for(int i=0;i<s.length();i+=2){System.out.print(s.charAt(i));} 输出结果是？",
     ["aceg", "ACEG", "abcdefg", "abcd"], 0, "easy", ["基础", "String"]),

    ("instanceof运算结果",
     "Integer integ=new Integer(9); boolean b=integ instanceof Object; 程序段执行后b的值是？",
     ["9", "true", "1", "false"], 1, "medium", ["基础", "instanceof"]),

    ("for循环和while循环的说法哪个正确",
     "关于for循环和while循环的说法哪个正确？",
     ["while先判断后执行，for先执行后判断", "while判断条件一般是程序结果，for的判断条件一般是非程序结果", "两种循环任何时候都不可以替换", "两种循环结构中都必须有循环体，循环体不能为空"], 1, "easy", ["基础", "循环"]),

    ("关于对象成员占用内存的说法哪个正确",
     "关于对象成员占用内存的说法哪个正确？",
     ["同一个类的对象共用同一段内存", "同一个类的对象使用不同的内存段，但静态成员共享相同的内存空间", "对象的方法不占用内存", "以上都不对"], 1, "medium", ["面向对象", "静态成员"]),

    ("关于继承的说法正确的是",
     "关于继承的说法正确的是？",
     ["子类将继承父类所有的属性和方法", "子类将继承父类的非私有属性和方法", "子类只继承父类public方法和属性", "子类只继承父类的方法，而不继承属性"], 1, "easy", ["面向对象", "继承"]),

    ("覆盖与重载的关系是",
     "覆盖与重载的关系是？",
     ["覆盖只有发生在父类与子类之间，而重载可以发生在同一个类中", "覆盖方法可以不同名，而重载方法必须同名", "final修饰的方法可以被覆盖，但不能被重载", "覆盖与重载是同一回事"], 0, "easy", ["面向对象", "重载与覆盖"]),

    # Q51-Q60
    ("提供编写网络应用程序类的包",
     "下面哪一个import命令可以为我们提供编写网络应用程序的类？",
     ["import java.sql.*;", "import java.util.*;", "import java.io.*;", "import java.net.*;"], 3, "easy", ["基础", "网络编程"]),

    ("BorderLayout布局下在下方添加按钮",
     "如果容器组件p的布局是BorderLayout，则在p的下边中添加一个按钮b，应该使用的语句是？",
     ["p.add(b);", "p.add(b,\"North\");", "p.add(b,\"South\");", "b.add(p,\"North\");"], 2, "medium", ["基础", "布局管理"]),

    ("Frame对象默认的布局管理器是",
     "Frame对象默认的布局管理器是？",
     ["FlowLayout", "BorderLayout", "CardLayout", "null"], 1, "medium", ["基础", "Frame"]),

    ("从文件中读取数据需要创建哪个类的对象",
     "如果需要从文件中读取数据，则可以在程序中创建哪一个类的对象？",
     ["FileInputStream", "FileOutputStream", "DataOutputStream", "FileWriter"], 0, "easy", ["IO", "文件输入"]),

    ("FileOutputStream运行3次后文件内容",
     "程序创建FileOutputStream(\"test.txt\",true)对象写入\"ABCDE\"，运行3次后文件内容是什么？",
     ["ABCABC", "ABCDE", "Test", "ABCDEABCDEABCDE"], 3, "hard", ["IO", "FileOutputStream"]),

    ("字节码文件的扩展名为",
     "编译Java Application源程序文件将产生相应的字节码文件，这些字节码文件的扩展名为？",
     [".java", ".class", ".html", ".exe"], 1, "easy", ["基础", "字节码"]),

    ("表达式y+=z--/++x的值（第二次出现）",
     "设x=1,y=2,z=3，则表达式y+=z--/++x的值是？",
     ["3", "3.5", "4", "5"], 0, "hard", ["基础", "运算符"]),

    ("不允许作为类及类成员的访问控制符",
     "不允许作为类及类成员的访问控制符的是？",
     ["public", "private", "static", "protected"], 2, "easy", ["面向对象", "访问控制"]),

    ("使用类名AB作为前缀就可以调用它（第三次出现）",
     "为AB类的一个方法method书写方法头，使得使用类名AB作为前缀就可以调用它，该方法头的形式为？",
     ["static void method()", "public void method()", "final void method()", "abstract void method()"], 0, "easy", ["基础", "static方法"]),

    ("关于选择结构的说法哪个正确",
     "关于选择结构下列哪个说法正确？",
     ["if语句和else语句必须成对出现", "if语句可以没有else语句对应", "switch结构中每个case语句中必须用break语句", "switch结构中必须有default语句"], 1, "easy", ["基础", "条件语句"]),

    # Q61-Q70
    ("while和do...while循环的区别",
     "while循环和do...while循环的区别是？",
     ["没有区别，任何情况下效果一样", "while循环比do...while循环执行效率高", "while循环是先循环后判断，循环体至少被执行一次", "do...while循环是先循环后判断，循环体至少被执行一次"], 3, "easy", ["基础", "循环"]),

    ("关于for循环和while循环的说法哪个正确",
     "关于for循环和while循环的说法哪个正确？",
     ["while先判断后执行，for先执行后判断", "while判断条件一般是程序结果，for的判断条件一般是非程序结果", "两种循环任何时候都不可以替换", "两种循环结构中都必须有循环体，循环体不能为空"], 1, "easy", ["基础", "循环"]),

    ("与访问控制无关的修饰符",
     "下列修饰符中与访问控制无关的是？",
     ["private", "public", "protected", "final"], 3, "easy", ["面向对象", "修饰符"]),

    ("void的含义",
     "void的含义是？",
     ["方法没有返回值", "方法体为空", "没有意义", "定义方法时必须使用"], 0, "easy", ["基础", "void"]),

    ("关于return语句的说法正确的是",
     "关于return语句的说法正确的是？",
     ["只能让方法返回数值", "方法都必须含有", "方法中可以有多句return", "不能用来返回对象"], 2, "easy", ["基础", "return"]),

    ("关于对象成员占用内存的说法哪个正确（重复）",
     "关于对象成员占用内存的说法哪个正确？",
     ["同一个类的对象共用同一段内存", "同一个类的对象使用不同的内存段，但静态成员共享相同的内存空间", "对象的方法不占用内存", "以上都不对"], 1, "medium", ["面向对象", "静态成员"]),

    ("下列说法哪个正确",
     "下列说法哪个正确？",
     ["不需要定义类，就能创建对象", "对象中必须有属性和方法", "属性可以是简单变量，也可以是一个对象", "属性必须是简单变量"], 2, "easy", ["面向对象", "类和对象"]),

    ("关于源文件的说法哪个正确",
     "下列说法哪个正确？",
     ["一个程序可以包含多个源文件", "一个源文件中只能有一个类", "一个源文件中可以有多个公共类", "一个源文件只能供一个程序使用"], 0, "easy", ["基础", "源文件结构"]),

    ("关于main()方法的说法哪个正确",
     "关于方法main()的说法哪个正确？",
     ["方法main()只能放在公共类中", "main()的头定义可以根据情况任意更改", "一个类中可以没有main()方法", "所有对象的创建都必须放在main()方法中"], 2, "easy", ["基础", "main方法"]),

    ("构造函数何时被调用",
     "构造函数何时被调用？",
     ["创建对象时", "类定义时", "使用对象的方法时", "使用对象的属性时"], 0, "easy", ["面向对象", "构造函数"]),

    # Q71-Q80
    ("关于抽象方法的说法正确的是（重复）",
     "关于抽象方法的说法正确的是？",
     ["可以有方法体", "可以出现在非抽象类中", "是没有方法体的方法", "抽象类中的方法都是抽象方法"], 2, "easy", ["面向对象", "抽象方法"]),

    ("关于继承的说法正确的是（重复）",
     "关于继承的说法正确的是？",
     ["子类将继承父类所有的属性和方法", "子类将继承父类的非私有属性和方法", "子类只继承父类public方法和属性", "子类只继承父类的方法，而不继承属性"], 1, "easy", ["面向对象", "继承"]),

    ("关于构造函数的说法哪个正确",
     "关于构造函数的说法哪个正确？",
     ["一个类只能有一个构造函数", "一个类可以有多个不同名的构造函数", "构造函数与类同名", "构造函数必须自己定义，不能使用父类的构造函数"], 2, "easy", ["面向对象", "构造函数"]),

    ("this和super的说法正确的是",
     "关于this和super的说法正确的是？",
     ["都可以用在main()方法中", "都是指一个内存地址", "不能用在main()方法中", "意义相同"], 2, "medium", ["面向对象", "this和super"]),

    ("关于super的说法正确的是",
     "关于super的说法正确的是？",
     ["是指当前对象的内存地址", "是指当前对象的父类对象的内存地址", "是指当前对象的父类", "可以用在main()方法中"], 1, "medium", ["面向对象", "super"]),

    ("覆盖与重载的关系是（重复）",
     "覆盖与重载的关系是？",
     ["覆盖只有发生在父类与子类之间，而重载可以发生在同一个类中", "覆盖方法可以不同名，而重载方法必须同名", "final修饰的方法可以被覆盖，但不能被重载", "覆盖与重载是同一回事"], 0, "easy", ["面向对象", "重载与覆盖"]),

    ("关于接口的说法哪个正确",
     "关于接口哪个说法正确？",
     ["实现一个接口必须实现接口的所有方法", "一个类只能实现一个接口", "接口间不能有继承关系", "接口和抽象类是同一回事"], 0, "easy", ["面向对象", "接口"]),

    ("异常包含哪些内容",
     "异常包含下列哪些内容？",
     ["程序执行过程中遇到的事先没有预料到的情况", "程序中的语法错误", "程序的编译错误", "以上都是"], 0, "easy", ["基础", "异常"]),

    ("对于可能抛出异常的语句的处理方式",
     "对于已经被定义过可能抛出异常的语句，在编程时应该？",
     ["必须用try/catch处理异常或用throws抛出", "如果程序错误，必须用try/catch处理", "可以置之不理", "只能使用try/catch处理"], 0, "easy", ["基础", "异常处理"]),

    ("字符流与字节流的区别在于",
     "字符流与字节流的区别在于？",
     ["前者带有缓冲，后者没有", "前者是块读写，后者是字节读写", "二者没有区别，可以互换使用", "每次读写的字节数不同"], 3, "medium", ["IO", "流分类"]),

    # Q81-Q90
    ("下列流中不属于字节流的是",
     "下列流中哪个不属于字节流？",
     ["FileInputStream", "BufferedInputStream", "FilterInputStream", "InputStreamReader"], 3, "medium", ["IO", "字节流"]),

    ("一个对象请求另一个对象为其服务的方式",
     "在面向对象的方法中，一个对象请求另一个对象为其服务的方式是通过发送什么？",
     ["调用语句", "命令", "口令", "消息"], 3, "easy", ["面向对象", "消息传递"]),

    ("反映Java程序并行机制的特点",
     "Java语言具有许多优点和特点，下列选项中哪个反映了Java程序并行机制的特点？",
     ["安全性", "多线程", "跨平台", "可移植"], 1, "easy", ["并发", "多线程"]),

    ("编写Java applet程序与Java application不同的步骤是",
     "编写和运行Java applet程序与编写和运行Java application程序不同的步骤是？",
     ["编写源代码", "编写HTML文件调用该小程序", "编译过程", "解释执行"], 1, "medium", ["基础", "Applet"]),

    ("每个Unicode码占用的比特位",
     "Java的字符类型采用的是Unicode编码方案，每个Unicode码占用多少个比特位？",
     ["8", "16", "32", "64"], 1, "easy", ["基础", "Unicode"]),

    ("int类型成员变量的默认值",
     "public class MyClass{static int i;public static void main(String argv[]){System.out.println(i);}} 输出结果是？",
     ["有错误，变量i没有初始化", "null", "1", "0"], 3, "medium", ["基础", "变量默认值"]),

    ("100%3和100%3.0的输出结果",
     "System.out.print(100%3);System.out.print(\",\");System.out.println(100%3.0); 输出结果是？",
     ["1,1", "1,1.0", "1.0,1", "1.0,1.0"], 1, "medium", ["基础", "取模运算"]),

    ("复杂逻辑表达式的结果",
     "int x=20,y=30;boolean b=x>50&&y>60||x>50&&y<-60||x<-50&&y>60||x<-50&&y<-60; b的值是？",
     ["true", "false", "1", "0"], 1, "medium", ["基础", "逻辑运算"]),

    ("打印字符串second时x的范围",
     "if(x>0){\"first\"}else if(x>-3){\"second\"}else{\"third\"} x处于什么范围时将打印\"second\"?",
     ["x>0", "x>-3", "x<=-3", "x<=0 && x>-3"], 3, "easy", ["基础", "条件判断"]),

    ("声明暂时性变量应使用的修饰符",
     "若要把变量声名为暂时性变量，应使用如下哪种修饰符？",
     ["protected", "provate", "transient", "volatile"], 2, "easy", ["基础", "关键字"]),

    # Q91-Q100
    ("一个类可定义许多同名的方法称为（重复）",
     "在Java中，一个类可同时定义许多同名的方法，参数个数类型或顺序各不相同，这种特性称为？",
     ["隐藏", "覆盖", "重载", "Java不支持此特性"], 2, "easy", ["面向对象", "重载"]),

    ("抛出异常应使用的子句",
     "如要抛出异常，应用下列哪种子句？",
     ["catch", "throws", "try", "finally"], 1, "easy", ["基础", "异常处理"]),

    ("声明接口时使用的修饰符",
     "在使用interface声明一个接口时，只可以使用什么修饰符修饰该接口？",
     ["private", "protected", "private protected", "public"], 3, "medium", ["面向对象", "接口"]),

    ("多态情况下printall()的输出结果",
     "class Parent{void printMe(){print(\"parent\")}} class Child extends Parent{void printMe(){print(\"child\")} void printall(){super.printMe();this.printMe();printMe();}} new Child().printall()输出？",
     ["parent\\nchild\\nchild", "parent\\nchild\\nparent", "parent\\nchild", "编译错误"], 0, "medium", ["面向对象", "多态"]),

    ("为读取的内容进行处理后再输出应使用的流",
     "为读取的内容进行处理后再输出，需要使用下列哪种流？",
     ["File stream", "Pipe stream", "Random stream", "Filter stream"], 3, "medium", ["IO", "过滤流"]),

    ("实现多线程之间的通信应使用的流",
     "为实现多线程之间的通信，需要使用下列哪种流才合适？",
     ["Filter stream", "File stream", "Random access stream", "Piped stream"], 3, "medium", ["IO", "管道流"]),

    ("Swing与AWT的区别不包括",
     "Swing与AWT的区别不包括？",
     ["Swing是由纯Java实现的轻量级构件", "Swing没有本地代码", "Swing不依赖操作系统的支持", "Swing支持图形用户界面"], 3, "easy", ["基础", "Swing"]),

    ("Applet事件处理需要导入的包",
     "在编写Java applet程序时，若需要对发生事件作出响应和处理，需要在程序开头写上什么语句？",
     ["import java.awt.*;", "import java.applet.*;", "import java.io.*;", "import java.awt.event.*;"], 3, "medium", ["基础", "Applet事件"]),

    ("注释的基本原则不包括",
     "注释的基本原则不包括？",
     ["注释应该增加代码的清晰度", "注释要简洁", "在写代码之前写注释", "尽量给每一条语句加注释"], 3, "easy", ["基础", "注释规范"]),

    ("java.io包的流按功能分为",
     "java.io包中定义的流类型按功能分为？",
     ["输入流和输出流", "字节流和字符流", "节点流和处理流", "以上都是"], 2, "medium", ["IO", "流分类"]),
]

# Answer explanations for key questions
EXPLANATIONS = {
    1: "Java源文件的扩展名是.java，编译后生成.class字节码文件。",
    2: "a>>>3是无符号右移操作。int-2的二进制是0xFFFFFFFE，右移3位高位补0，结果为0x1FFFFFFF，即536870911。",
    3: "数组长度为3，有效索引为0,1,2。a[3]超出数组范围，会抛出ArrayIndexOutOfBoundsException。",
    6: "break用于跳出循环，不是异常处理关键字。try/catch/finally才是异常处理结构。",
    8: "Java标识符可以由字母、数字、下划线、美元符号组成，但不能以数字开头，不能是关键字。$persons以$开头是合法的。",
    9: "static方法可以通过类名直接调用，无需创建对象。这是static方法的特征。",
    12: "paint()方法用于绘制Applet界面内容，需要重写该方法来完成自定义绘图。",
    14: "float f=45.0;非法，因为45.0是double字面量，赋值给float需要强制转换或加f后缀。",
    18: "synchronized关键字用于实现线程同步，可以对对象加互斥锁。",
    25: "paint()方法接收Graphics对象作为参数，用于绘制图形界面。",
    26: "Boolean（大写B）是包装类，不是原始数据类型。原始数据类型是boolean（小写b）。",
    42: "z--/++x = 3/2 = 1（整数除法），y+=1 = 3。注意运算符优先级：后缀自增最高，前缀自增次之，除法再次之，赋值最低。",
    45: "循环i从0开始，每次+2，输出索引0,2,4,6位置的字符：a,c,e,g。",
    55: "FileOutputStream第二个参数true表示追加模式，每次运行追加\"ABCDE\"，运行3次后内容为\"ABCDEABCDEABCDE\"。",
    62: "while循环先判断后执行，for循环也是先判断后执行，两者可以互相转换。",
    89: "x>0打印first，x<=0&&x>-3打印second，x<=-3打印third。",
    94: "super.printMe()调用父类方法输出parent，this.printMe()和printMe()都调用子类方法输出child。多态特性。",
}

OPTION_LETTERS = ["A", "B", "C", "D"]

result = []
for i, (title, content, options, correct_idx, difficulty, tags) in enumerate(QUESTIONS, 1):
    q_num = i
    correct_letter = OPTION_LETTERS[correct_idx]
    correct_text = options[correct_idx]
    expl = EXPLANATIONS.get(q_num, f"正确答案是{correct_letter}选项。")

    result.append({
        "category": "java_basic",
        "difficulty": difficulty,
        "type": "choice",
        "title": title,
        "content": content,
        "answer": f"{correct_letter}) {correct_text}。解析：{expl}",
        "hints": ["先排除明显错误的选项"] + (["注意运算符优先级和类型转换规则"] if difficulty == "hard" else []),
        "tags": tags,
        "options": options,
    })

print(json.dumps(result, ensure_ascii=False, indent=2))
print(f"\n--- Total: {len(result)} questions ---", file=__import__("sys").stderr)
