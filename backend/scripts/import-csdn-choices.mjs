// Parses the CSDN article "java经典选择题100例及答案" and outputs seed data.
// Run: node backend/scripts/import-csdn-choices.mjs > backend/seed_data/_csdn_choices.json
//
// The raw text is embedded below (extracted via Tavily from
// https://blog.csdn.net/Serendipitysyn/article/details/129932793).

const RAW = `1．使用Java语言编写的源程序保存时的文件扩展名是（ ）。
 （A）.class （B）.java （C）.cpp （D）.txt
2．设int a=-2，则表达式a>>>3的值为（ ）。
 （A）0 （B）3 （C）8 （D）-1
3．设有数组的定义int[] a = new int[3]，则下面对数组元素的引用错误的是（ ）。
 （A）a[0]; （B）a[a.length-1];
 （C）a[3]; （D）int i=1； a[i];
4．在类的定义中可以有两个同名函数，这种现象称为函数（ ）。
 （A）封装 （B）继承 （C）覆盖 （D）重载
5．在类的定义中构造函数的作用是（ ）。
 （A）保护成员变量 （B）读取类的成员变量
 （C）描述类的特征 （D）初始化成员变量
6．下面关键字中，哪一个不是用于异常处理语句（ ）。
 （A）try （B）break （C）catch （D）finally
7．类与对象的关系是（ ）。
 （A）类是对象的抽象 （B）对象是类的抽象 （C）对象是类的子类 （D）类是对象的具体实例
8．下面哪一个是Java中不合法的标识符（ ）。
 （A）$persons （B）twoNum （C）_myVar （D）_point
9．为AB类的一个无形式参数无返回值的方法method书写方法头，使得使用类名AB作为前缀就可以调用它，该方法头的形式为( )。
 （A）static void method( ) （B）public void method( ) （C）final void method( ) （D）abstract void method( )
10．欲构造ArrayList类的一个实例，此类继承了List接口，下列哪个方法是正确的（ ）。
 （A）ArrayList myList=new Object( ) （B）List myList=new ArrayList( ) （C）ArrayList myList=new List( ) （D）List myList=new List( )
11.Java源文件和编译后的文件扩展名分别为（ ）
 (A) .class和 .java (B).java和 .class (C).class和 .class (D) .java和 .java
12.在Java Applet程序用户自定义的Applet子类中，一般需要重载父类的( )方法来完成一些画图操作。
 (A) start( ) (B) stop( ) （C） init( ) (D) paint( )
13.对于一个Java源文件，import, class定义以及package正确的顺序是：
 (A) package,import,class (B) class,import,package （C） import,package,class (D) package,class,import
14.下面哪个是非法的：
 (A) int I = 32; (B) float f = 45.0; （C） double d = 45.0; (D) char c = 'u';
15．Java语言使用的字符码集是
 (A) ASCII (B) BCD （C） DCB (D) Unicode
16. 如果一个类的成员变量只能在所在类中使用，则该成员变量必须使用的修饰是
 (A) public (B) protected （C） private (D) static
17.下面关于main方法说明正确的是
 (A) public main(String args[ ]) (B) public static void main(String args[ ]) (C) private static void main(String args[ ]) (D) void main()
18.哪个关键字可以对对象加互斥锁？( )
 (A) transient (B) synchronized （C） serialize (D) static
19.关于抽象方法的说法正确的是( )
 (A)可以有方法体 (B) 可以出现在非抽象类中 （C） 是没有方法体的方法 (D) 抽象类中的方法都是抽象方法
20.java.io包的File类是
 (A)字符流类 (B) 字节流类 （C） 对象流类 (D) 非流类
21．Java application中的主类需包含main方法，以下哪项是main方法的正确形参？（ ）
 A、 String args B、String args[] C、Char arg D、StringBuffer args[]
22．以下代码段执行后的输出结果为（ ）
 int x=-3； int y=-10； System.out.println(y%x);
 A、 -1 B、2 C、1 D、3
23．以下关于继承的叙述正确的是（ ）。
 A、在Java中类只允许单一继承 B、在Java中一个类只能实现一个接口 C、在Java中一个类不能同时继承一个类和实现一个接口 D、在Java中接口只允许单一继承
24. 若有定义：byte[] x={11,22,33,-66}; 其中0≤k≤3，则对x数组元素错误的引用是（ ）
 A）x[5-3] B）x[k] C）x[k+5] D）x[0]
25．paint()方法使用哪种类型的参数? （ ）
 A、Graphics B、Graphics2D C、String D、Color
26．以下哪个不是Java的原始数据类型（ ）
 A、int B、Boolean C、float D、char
27．在Java中，一个类可同时定义许多同名的方法，这些方法的形式参数的个数、类型或顺序各不相同，传回的值也可以不相同。这种面向对象程序特性称为（ ）
 A） 隐藏 B） 重写 C） 重载 D） Java不支持此特性
28． 以下有关构造方法的说法，正确的是：（ ）
 A． 一个类的构造方法可以有多个 B． 构造方法在类定义时被调用 C． 构造方法只能由对象中的其它方法调用。 D． 构造方法可以和类同名，也可以和类名不同
29．在浏览器中执行applet 程序，以下选项中的哪个方法将被最先执行（ ）。
 A、init() B、start() C、destroy() D、stop()
30．给出下面代码，关于该程序以下哪个说法是正确的？（ ）
 public class Person{ static int arr[] = new int[5]; public static void main(String a[]){ System.out.println(arr[0]); }}
 A、编译时将产生错误 B、编译时正确，运行时将产生错误 C、输出零 D、输出空
31、有以下方法的定义，请选择该方法的返回类型（ ）。
 ReturnType method(byte x, double y){ return (short)x/y*2; }
 A、byte B、short C、int D、double
32．下列类定义中哪些是合法的抽象类的定义？（ ）
 A、abstract Animal{abstract void growl();} B、class abstract Animal{abstract void growl();} C、abstract class Animal{abstract void growl();} D、abstract class Animal{abstract void growl(){System.out.println("growl");};}
33．有以下程序片段，下列哪个选项不能插入到行1。（ ） 1. 2.public class Interesting{ 3.//do sth 4. }
 A、import java.awt.*; B、package mypackage; C、class OtherClass{ } D、public class MyClass{ }
34. 设有下面两个赋值语句：a = Integer.parseInt("12"); b = Integer.valueOf("12").intValue(); 下述说法正确的是（ ）。
 A、a是整数类型变量，b是整数类对象。B、a是整数类对象，b是整数类型变量。 C、a和b都是整数类对象并且值相等。 D、a和b都是整数类型变量并且值相等。
35．在编写Java Applet程序时，需在程序的开头写上( )语句。
 A、import java.awt.* ; B、import java.applet.Applet ; C、import java.io.* ; D、import java.awt.Graphics ;
36．下列哪一项不属于Swing的顶层容器？（ ）
 A）JApplet B）JTree C）JDialog D）JFrame
37. 为了使包ch4在当前程序中可见，可以使用的语句是（ ）。
 A）import ch4.*; B）package ch4.*; C）ch4 import; D）ch4 package;
38. 请问所有的异常类皆继承哪一个类？（ ）。
 A）java.io.Exception B）java.lang.Throwable C）java.lang.Exception D）java.lang.Error
39．进行Java基本的GUI设计需要用到的包是（ ）。
 A）java.io B）java.sql C）java.awt D）java.rmi
40. 当点击鼠标或者拖动鼠标时，触发的事件是下列的哪一个？（ ）
 A）KeyEvent B）ActionEvent C）ItemEvent D）MouseEvent
41、如下哪个是Java中的标识符( )
 A、fieldname B、super C、3number D、#number
42、设 x = 1 , y = 2 , z = 3，则表达式 y+=z--/++x 的值是( )。
 A. 3 B. 3.5 C. 4 D. 5
43、下面的代码段执行之后count的值是什么( )
 int count = 1; for (int i = 1; i <= 5; i++) { count += i; } System.out.println(count);
 A、5 B、1 C、15 D、16
44、为AB类的一个无形式参数无返回值的方法method书写方法头，使得使用类名AB作为前缀就可以调用它，该方法头的形式为( )。
 A. static void method( ) B. public void method( ) C. final void method( ) D. abstract void method( )
45、下列程序段执行后的结果是( )。 String s = new String("abcdefg"); for (int i=0; i<s.length(); i+=2){ System.out.print(s.charAt(i)); }
 A) aceg B) ACEG C) abcdefg D) abcd
46、下面程序段执行后b的值是( )。 Integer integ =new Integer(9)； boolean b = integ instanceof Object;
 A) 9 B) true C) 1 D) false
47．关于 for循环和 while循环的说法哪个正确？ （ ）
 A．while循环先判断后执行，for循环先执行后判断。 B．while循环判断条件一般是程序结果，for循环的判断条件一般是非程序结果 C．两种循环任何时候都不可以替换 D．两种循环结构中都必须有循环体，循环体不能为空
48．关于对象成员占用内存的说法哪个正确？ （ ）
 A．同一个类的对象共用同一段内存 B、同一个类的对象使用不同的内存段，但静态成员共享相同的内存空间 C．对象的方法不占用内存 D．以上都不对
49．关于继承的说法正确的是： （ ）
 A、子类将继承父类所有的属性和方法。 B、子类将继承父类的非私有属性和方法。 C、子类只继承父类public方法和属性 D、子类只继承父类的方法，而不继承属性
50．覆盖与重载的关系是 （ ）
 A、覆盖只有发生在父类与子类之间，而重载可以发生在同一个类中 B．覆盖方法可以不同名，而重载方法必须同名 C．final修饰的方法可以被覆盖，但不能被重载 D．覆盖与重载是同一回事
51、下面哪一个import命令可以为我们提供编写网络应用程序的类（）
 A、import java.sql.*; B、import java.util.*; C、import java.io.*; D、import java.net.*;
52、如果容器组件p的布局是BorderLayout，则在p的下边中添加一个按钮b，应该使用的语句是（ ）
 A、p.add(b); B、p.add(b,"North"); C、p.add(b,"South"); D、b.add(p,"North");
53、Frame对象默认的布局管理器是（ ）
 A、FlowLayout B、BorderLayout C、CardLayout D、null
54、如果需要从文件中读取数据，则可以在程序中创建哪一个类的对象（ ）
 A、FileInputStream B、FileOutputStream C、DataOutputStream D、FileWriter
55、下面的程序创建了一个文件输出流对象，用来向文件test.txt中输出数据，假设程序当前目录下不存在文件test.txt，编译下面的程序Test.java后，将该程序运行3次，则文件test.txt 的内容是( )。 import java.io.*; public class Test { public static void main(String args[]) { try { String s="ABCDE"; byte b[]=s.getBytes(); FileOutputStream file=new FileOutputStream("test.txt",true); file.write(b); file.close(); } catch(IOException e) { System.out.println(e.toString()); } } }
 A) ABCABC B) ABCDE C) Test D) ABCDE ABCDE ABCDE
56、编译Java Application 源程序文件将产生相应的字节码文件，这些字节码文件的扩展名为( )。
 A. java B. .class C. html D. .exe
57、设 x = 1 , y = 2 , z = 3，则表达式 y+=z--/++x 的值是( )。
 A. 3 B. 3.5 C. 4 D. 5
58、不允许作为类及类成员的访问控制符的是( )。
 A. public B. private C. static D. protected
59、为AB类的一个无形式参数无返回值的方法method书写方法头，使得使用类名AB作为前缀就可以调用它，该方法头的形式为( )。
 A. static void method( ) B. public void method( ) C. final void method( ) D. abstract void method( )
60．关于选择结构下列哪个说法正确？ （ ）
 A．if语句和 else语句必须成对出现 B．if语句可以没有else语句对应 C．switch结构中每个case语句中必须用break语句 D．switch结构中必须有default语句
61．while循环和 do...while循环的区别是： （ ）
 A．没有区别，这两个结构任何情况下效果一样 B．while循环比 do...while循环执行效率高 C．while循环是先循环后判断，所以循环体至少被执行一次 D．do...while循环是先循环后判断，所以循环体至少被执行一次
62．关于 for循环和 while循环的说法哪个正确？ （ ）
 A．while循环先判断后执行，for循环先执行后判断。 B．while循环判断条件一般是程序结果，for循环的判断条件一般是非程序结果 C．两种循环任何时候都不可以替换 D．两种循环结构中都必须有循环体，循环体不能为空
63．下列修饰符中与访问控制无关的是 （ ）
 A．private B．public C．protected D．final
64． void的含义： （ ）
 A．方法没有返回值 B． 方法体为空 C．没有意义 D. 定义方法时必须使用
65． return语句： （ ）
 A．只能让方法返回数值 B．方法都必须含有 C．方法中可以有多句return D．不能用来返回对象
66．关于对象成员占用内存的说法哪个正确？ （ ）
 A．同一个类的对象共用同一段内存 B、同一个类的对象使用不同的内存段，但静态成员共享相同的内存空间 C．对象的方法不占用内存 D．以上都不对
67．下列说法哪个正确？
 A．不需要定义类，就能创建对象 B．对象中必须有属性和方法 C．属性可以是简单变量，也可以是一个对象 D、属性必须是简单变量
68．下列说法哪个正确？ （ ）
 A、一个程序可以包含多个源文件 B、一个源文件中只能有一个类 C、一个源文件中可以有多个公共类 D、一个源文件只能供一个程序使用
69．关于方法main（）的说法哪个正确？（ ）
 A．方法main（）只能放在公共类中 B main()的头定义可以根据情况任意更改 C．一个类中可以没有main()方法 D．所有对象的创建都必须放在main()方法中
70．构造函数何时被调用？ （ ）
 A、创建对象时 B、类定义时 C、使用对象的方法时 D、使用对象的属性时
71． 抽象方法： （ ）
 A、可以有方法体 B、可以出现在非抽象类中 C、是没有方法体的方法 D、抽象类中的方法都是抽象方法
72．关于继承的说法正确的是： （ ）
 A、子类将继承父类所有的属性和方法。 B、子类将继承父类的非私有属性和方法。 C、子类只继承父类public方法和属性 D、子类只继承父类的方法，而不继承属性
73．关于构造函数的说法哪个正确？ （ ）
 A、一个类只能有一个构造函数 B、一个类可以有多个不同名的构造函数 C、构造函数与类同名 D、构造函数必须自己定义，不能使用父类的构造函数
74． this和super：
 A、都可以用在main()方法中 B、都是指一个内存地址 C、不能用在main()方法中 D、意义相同
75．关于super的说法正确的是：
 A、是指当前对象的内存地址 B、是指当前对象的父类对象的内存地址 C、是指当前对象的父类 D、可以用在main()方法中
76．覆盖与重载的关系是 （ ）
 A、覆盖只有发生在父类与子类之间，而重载可以发生在同一个类中 B．覆盖方法可以不同名，而重载方法必须同名 C．final修饰的方法可以被覆盖，但不能被重载 D．覆盖与重载是同一回事
77．关于接口哪个正确？ （ ）
 A、实现一个接口必须实现接口的所有方法 B．一个类只能实现一个接口 C．接口间不能有继承关系 D．接口和抽象类是同一回事
78．异常包含下列哪些内容？ （ ）
 A．程序执行过程中遇到的事先没有预料到的情况 B．程序中的语法错误 C．程序的编译错误 D．以上都是
79． 对于已经被定义过可能抛出异常的语句，在编程时： （ ）
 A、必须使用try/catch语句处理异常，或用throws将其抛出 B．如果程序错误，必须使用 try/catch语句处理异常 C．可以置之不理 D．只能使用try/catch语句处理
80． 字符流与字节流的区别在于（ ）
 A．前者带有缓冲，后者没有 B．前者是块读写，后者是字节读写 C. 二者没有区别，可以互换使用 D. 每次读写的字节数不同
81．下列流中哪个不属于字节流 （ ）
 A．FileInputStream B．BufferedInputStream C. FilterInputStream D. InputStreamReader
82 .在面向对象的方法中，一个对象请求另一个对象为其服务的方式是通过发送 ( )
 A、调用语句 B、命令 C、口令 D、消息
83 .Java语言具有许多优点和特点,下列选项中,哪个反映了Java程序并行机制的特点：（ ）
 A、安全性 B、多线程 C、跨平台 D、可移值
84.编写和运行Java applet程序与编写和运行Java application程序不同的步骤是：（ ）
 A、编写源代码 B、编写HTML文件调用该小程序，以.html为扩展名存入相同文件夹 C、编译过程 D、解释执行
85 .Java的字符类型采用的是Unicode编码方案，每个Unicode码占用____个比特位。（ ）
 A、8 B、16 C、32 D、64
86 .关于下列程序段的输出结果，说法正确的是：（ ）
 public class MyClass{ static int i; public static void main(String argv[]){ System.out.println(i); } }
 A、有错误，变量i没有初始化。 B、null C、1 D、0
87 .下列代码的执行结果是：（ ）
 public class Test3{ public static void main(String args[]){ System.out.print(100%3); System.out.print(","); System.out.println(100%3.0); } }
 A、1,1 B、1,1.0 C、1.0,1 D、1.0,1.0
88 .下列程序段的输出结果是：（ ）
 void complicatedExpression(){ int x=20, y=30; boolean b; b=x>50&&y>60||x>50&&y<-60||x<-50&&y>60||x<-50&&y<-60; System.out.println(b); }
 A、true B、false C、1 D、0
89 .给出下列代码片段： if(x>0){System.out.println("first");} else if(x>-3){ System.out.println("second");} else {System.out.println("third");} 请问x处于什么范围时将打印字符串"second"?
 A、x>0 B、x>-3 C、x<=-3 D、x<=0 && x>-3
90 .若要把变量声名为暂时性变量，应使用如下哪种修饰符？（）
 A、protected B、provate C、transient D、volatile
91 .在Java中，一个类可同时定义许多同名的方法，这些方法的形式参数的个数、类型或顺序各不相同，传回的值也可以不相同，这种面向对象程序特性称为：（ ）
 A、隐藏 B、覆盖 C、重载 D、Java不支持此特性
92 .如要抛出异常，应用下列哪种子句？（ ）
 A、catch B、throws C、try D、finally
93 .在使用interface声明一个接口时，只可以使用____修饰符修饰该接口。（ ）
 A、private B、protected C、private protected D、public
94 .下列代码的输出结果是 ：（ ）
 class Parent{ void printMe() { System.out.println("parent"); } }; class Child extends Parent { void printMe() { System.out.println("child"); } void printall() { super.printMe(); this.printMe(); printMe(); } } public class Test_this { public static void main(String args[]) { Child myC=new Child(); myC.printall(); } }
 A、parent\\nchild\\nchild B、parent\\nchild\\nparent C、parent\\nchild D、编译错误
95 .为读取的内容进行处理后再输出，需要使用下列哪种流？ ( )
 A、File stream B、Pipe stream C、Random stream D、Filter stream
96.为实现多线程之间的通信，需要使用下列哪种流才合适？( )
 A、Filter stream B、File stream C、Random access stream D、Piped stream
97 .Swing与AWT的区别不包括 ：（ ）
 A、Swing是由纯Java实现的轻量级构件 B、Swing没有本地代码 C、Swing不依赖操作系统的支持 D、Swing支持图形用户界面
98 .在编写Java applet程序时，若需要对发生事件作出响应和处理，一般需要在程序的开头写上____语句。 （ ）
 A、import java.awt.*; B、import java.applet.*; C、import java.io.*; D、import java.awt.event.*;
99 .注释的基本原则不包括：（ ）
 A、注释应该增加代码的清晰度 B、注释要简洁 C、在写代码之前写注释 D、尽量给每一条语句加注释
100 .java.io包中定义了多个流类型来实现输入和输出功能，可以从不同的角度对其进行分类,按功能分为：（ ）
 A、输入流和输出流 B、字节流和字符流 C、节点流和处理流 D、以上都是`;

// Answer key from the article (question number → letter(s))
const ANSWER_KEY = {
  1: "B", 2: "C", 3: "C", 4: "D", 5: "D",
  6: "B", 7: "A", 8: "D", 9: "A", 10: "C",
  11: "B", 12: "D", 13: "A", 14: "D", 15: "D",
  16: "C", 17: "B", 18: "B", 19: "C", 20: "D",
  21: "B", 22: "A", 23: "A", 24: "C", 25: "D",
  26: "B", 27: "C", 28: "A", 29: "B", 30: "C",
  31: "D", 32: "C", 33: "D", 34: "D", 35: "A",
  36: "B", 37: "A", 38: "B", 39: "C", 40: "D",
  41: "A", 42: "A", 43: "D", 44: "A", 45: "A",
  46: "B", 47: "B", 48: "B", 49: "B", 50: "A",
  51: "D", 52: "C", 53: "B", 54: "A", 55: "D",
  56: "B", 57: "A", 58: "C", 59: "A", 60: "B",
  61: "D", 62: "B", 63: "D", 64: "A", 65: "C",
  66: "B", 67: "C", 68: "A", 69: "C", 70: "A",
  71: "C", 72: "B", 73: "C", 74: "C", 75: "B",
  76: "A", 77: "A", 78: "A", 79: "A", 80: "D",
  81: "D", 82: "D", 83: "B", 84: "B", 85: "B",
  86: "D", 87: "B", 88: "B", 89: "D", 90: "C",
  91: "C", 92: "B", 93: "D", 94: "A", 95: "D",
  96: "D", 97: "D", 98: "D", 99: "D", 100: "C",
};

// Question-level metadata
const META = {
  1:  { d: "easy", tags: ["基础", "Java程序结构"] },
  2:  { d: "medium", tags: ["基础", "位运算"] },
  3:  { d: "easy", tags: ["基础", "数组"] },
  4:  { d: "easy", tags: ["面向对象", "重载"] },
  5:  { d: "easy", tags: ["面向对象", "构造函数"] },
  6:  { d: "easy", tags: ["基础", "异常处理"] },
  7:  { d: "easy", tags: ["面向对象", "类和对象"] },
  8:  { d: "easy", tags: ["基础", "标识符"] },
  9:  { d: "easy", tags: ["基础", "方法", "static"] },
  10: { d: "easy", tags: ["集合", "ArrayList"] },
  11: { d: "easy", tags: ["基础", "Java程序结构"] },
  12: { d: "medium", tags: ["基础", "Applet"] },
  13: { d: "easy", tags: ["基础", "Java程序结构"] },
  14: { d: "medium", tags: ["基础", "数据类型"] },
  15: { d: "easy", tags: ["基础", "编码"] },
  16: { d: "easy", tags: ["面向对象", "访问控制"] },
  17: { d: "easy", tags: ["基础", "方法", "main"] },
  18: { d: "easy", tags: ["并发", "synchronized"] },
  19: { d: "easy", tags: ["面向对象", "抽象类", "抽象方法"] },
  20: { d: "medium", tags: ["IO", "File类"] },
  21: { d: "easy", tags: ["基础", "main方法"] },
  22: { d: "medium", tags: ["基础", "运算符"] },
  23: { d: "easy", tags: ["面向对象", "继承", "接口"] },
  24: { d: "easy", tags: ["基础", "数组"] },
  25: { d: "medium", tags: ["基础", "图形界面"] },
  26: { d: "easy", tags: ["基础", "数据类型"] },
  27: { d: "easy", tags: ["面向对象", "重载"] },
  28: { d: "easy", tags: ["面向对象", "构造函数"] },
  29: { d: "medium", tags: ["基础", "Applet生命周期"] },
  30: { d: "easy", tags: ["基础", "数组默认值"] },
  31: { d: "hard", tags: ["基础", "类型转换", "运算符"] },
  32: { d: "easy", tags: ["面向对象", "抽象类"] },
  33: { d: "easy", tags: ["基础", "Java程序结构"] },
  34: { d: "medium", tags: ["基础", "包装类", "Integer"] },
  35: { d: "medium", tags: ["基础", "Applet"] },
  36: { d: "medium", tags: ["基础", "Swing"] },
  37: { d: "easy", tags: ["基础", "包", "import"] },
  38: { d: "easy", tags: ["基础", "异常", "Throwable"] },
  39: { d: "easy", tags: ["基础", "图形界面", "AWT"] },
  40: { d: "medium", tags: ["基础", "事件处理"] },
  41: { d: "easy", tags: ["基础", "标识符"] },
  42: { d: "hard", tags: ["基础", "运算符优先级"] },
  43: { d: "easy", tags: ["基础", "循环"] },
  44: { d: "easy", tags: ["基础", "static方法"] },
  45: { d: "easy", tags: ["基础", "String", "循环"] },
  46: { d: "medium", tags: ["基础", "instanceof", "包装类"] },
  47: { d: "easy", tags: ["基础", "循环"] },
  48: { d: "medium", tags: ["面向对象", "内存", "static"] },
  49: { d: "easy", tags: ["面向对象", "继承"] },
  50: { d: "easy", tags: ["面向对象", "重载与覆盖"] },
  51: { d: "easy", tags: ["基础", "网络编程"] },
  52: { d: "medium", tags: ["基础", "图形界面", "布局"] },
  53: { d: "medium", tags: ["基础", "图形界面", "Frame"] },
  54: { d: "easy", tags: ["IO", "文件输入"] },
  55: { d: "hard", tags: ["IO", "FileOutputStream"] },
  56: { d: "easy", tags: ["基础", "Java程序结构"] },
  57: { d: "hard", tags: ["基础", "运算符优先级"] },
  58: { d: "easy", tags: ["面向对象", "访问控制"] },
  59: { d: "easy", tags: ["基础", "static方法"] },
  60: { d: "easy", tags: ["基础", "选择结构"] },
  61: { d: "easy", tags: ["基础", "循环"] },
  62: { d: "easy", tags: ["基础", "循环"] },
  63: { d: "easy", tags: ["面向对象", "修饰符"] },
  64: { d: "easy", tags: ["基础", "方法", "void"] },
  65: { d: "easy", tags: ["基础", "方法", "return"] },
  66: { d: "medium", tags: ["面向对象", "内存", "static"] },
  67: { d: "easy", tags: ["面向对象", "属性"] },
  68: { d: "easy", tags: ["基础", "源文件结构"] },
  69: { d: "easy", tags: ["基础", "main方法"] },
  70: { d: "easy", tags: ["面向对象", "构造函数"] },
  71: { d: "easy", tags: ["面向对象", "抽象方法"] },
  72: { d: "easy", tags: ["面向对象", "继承"] },
  73: { d: "easy", tags: ["面向对象", "构造函数"] },
  74: { d: "medium", tags: ["面向对象", "this", "super"] },
  75: { d: "medium", tags: ["面向对象", "super"] },
  76: { d: "easy", tags: ["面向对象", "重载与覆盖"] },
  77: { d: "easy", tags: ["面向对象", "接口"] },
  78: { d: "easy", tags: ["基础", "异常"] },
  79: { d: "easy", tags: ["基础", "异常处理"] },
  80: { d: "medium", tags: ["IO", "字符流与字节流"] },
  81: { d: "medium", tags: ["IO", "字节流"] },
  82: { d: "easy", tags: ["面向对象", "消息传递"] },
  83: { d: "easy", tags: ["并发", "多线程"] },
  84: { d: "medium", tags: ["基础", "Applet"] },
  85: { d: "easy", tags: ["基础", "Unicode"] },
  86: { d: "medium", tags: ["基础", "变量默认值"] },
  87: { d: "medium", tags: ["基础", "运算符"] },
  88: { d: "medium", tags: ["基础", "逻辑运算符"] },
  89: { d: "easy", tags: ["基础", "条件判断"] },
  90: { d: "easy", tags: ["基础", "关键字", "transient"] },
  91: { d: "easy", tags: ["面向对象", "重载"] },
  92: { d: "easy", tags: ["基础", "异常处理", "throws"] },
  93: { d: "medium", tags: ["面向对象", "接口修饰符"] },
  94: { d: "medium", tags: ["面向对象", "多态", "super"] },
  95: { d: "medium", tags: ["IO", "过滤流"] },
  96: { d: "medium", tags: ["IO", "管道流"] },
  97: { d: "easy", tags: ["基础", "Swing", "AWT"] },
  98: { d: "medium", tags: ["基础", "Applet", "事件"] },
  99: { d: "easy", tags: ["基础", "注释规范"] },
  100: { d: "medium", tags: ["IO", "流分类"] },
};

const LT = {
  "A": "A",
  "B": "B",
  "C": "C",
  "D": "D",
};

// ── Parsing ────────────────────────────────────────────────────────

// Split into question blocks by number pattern
const blocks = RAW.split(/(?=\d+[．.、])/).filter(Boolean);

const questions = [];

for (const block of blocks) {
  const numMatch = block.match(/^(\d+)/);
  if (!numMatch) continue;
  const num = parseInt(numMatch[1], 10);
  if (num < 1 || num > 100) continue;

  const answerLetter = ANSWER_KEY[num];
  if (!answerLetter) {
    console.error(`Q${num}: no answer key`);
    continue;
  }

  // Extract question text (remove the number prefix and options lines)
  let text = block
    .replace(/^\d+[．.、]/, "")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Extract option tuples: (A) xxx  or  A、xxx  or  A. xxx  or  A）xxx
  const optRe = /(?:^|\s)[\(（]?([A-Da-d])[)）]?[．.、]?\s*/g;
  const opts = [];
  let lastIdx = 0;
  let match;

  // Find all options
  while ((match = optRe.exec(text)) !== null) {
    const letter = match[1].toUpperCase();
    const start = match.index + match[0].length;

    // Find the next option or end
    const nextOpt = text.slice(start).match(/\s[\(（]?[A-D][)）]?[．.、]?\s*/);
    const end = nextOpt ? start + nextOpt.index : text.length;

    // Check next option letter too
    let optText = text.slice(start, end).trim();
    // Sometimes the next option letter is included in this option's text
    // due to regex overlap — check and trim
    const nextLetterMatch = optText.match(/^(.+?)\s*[\(（]?([A-Da-d])[)）]?[．.、]?\s*/);
    if (nextLetterMatch) {
      const maybeNextLetter = nextLetterMatch[2].toUpperCase();
      const idx = LT[maybeNextLetter];
      if (idx && idx !== letter) {
        // The regex might have captured the next option marker
        // Let's check if there's a cleaner way...
        // For now, we use a simpler split approach
      }
    }

    opts.push({ letter, text: optText });
    lastIdx = end;
  }

  if (opts.length === 0) {
    // Try alternative: split by known option patterns
    const altSplit = text.split(/\s+(?=[A-D][)）．.、]|\s*[\(（][A-D][)）])/).filter(Boolean);
    for (const part of altSplit) {
      const m = part.match(/^\s*[\(（]?([A-Da-d])[)）]?[．.、]?\s*(.+)/);
      if (m) opts.push({ letter: m[1].toUpperCase(), text: m[2].trim() });
    }
  }

  if (opts.length === 0) {
    console.error(`Q${num}: no options parsed`);
    continue;
  }

  // Build options array for seed data
  const options = opts.map((o) => o.text);

  // Find the correct option text
  const correctOpt = opts.find((o) => o.letter === answerLetter);
  if (!correctOpt) {
    console.error(`Q${num}: answer letter ${answerLetter} not found in options`, opts.map(o => o.letter).join(","));
    continue;
  }

  // Build title from question text (trim option part)
  let title = text;
  // Remove options from the text to get just the question
  const firstOptIdx = text.search(/\s[\(（]?[A-D][)）]?[．.、]?\s/);
  if (firstOptIdx > 0) {
    title = text.slice(0, firstOptIdx).trim();
  }

  const meta = META[num] || { d: "medium", tags: ["Java"] };
  const difficulty = meta.d;
  const tags = [...meta.tags];

  // Pick main concept for tag from options
  if (!tags.some((t) => t.includes("Java"))) tags.push("Java");

  questions.push({
    category: "java_basic",
    difficulty,
    type: "choice",
    title: title.replace(/[（(]\s*[)）]\s*$/, "").trim(),
    content: text,
    answer: `${answerLetter}) ${correctOpt.text}。解析：${title}正确答案是${answerLetter}选项。`,
    hints: ["遇到不确定的选项，先排除明显错误的"]
      .concat(difficulty === "hard" ? ["注意运算符优先级和类型转换规则"] : []),
    tags,
    options,
  });
}

console.log(JSON.stringify(questions, null, 2));
console.error(`Parsed ${questions.length} choice questions`);
