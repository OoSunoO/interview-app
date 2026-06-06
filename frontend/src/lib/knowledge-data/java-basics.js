export const knowledge = {
  基础: {
    category: "java_basic",
    content: `## Java 语言核心特性

- **面向对象**：封装、继承、多态三大特征，支持类单继承、接口多继承。
- **平台无关**：通过 JVM 实现「一次编译，随处运行」，字节码（.class）不面向特定处理器。
- **编译与解释并存**：源代码 → 字节码 → JVM 解释器逐行执行（慢）→ JIT 编译器将热点代码编译为机器码（快）。
- **自动内存管理**：GC 垃圾回收，无需手动释放内存。JVM 负责对象分配和回收，减少内存泄漏风险。
- **8 种基本数据类型**：byte（1B）、short（2B）、int（4B）、long（8B）、float（4B）、double（8B）、char（2B）、boolean。包装类型有缓存机制（Integer 缓存 [-128,127]）。
- **重载 vs 重写**：重载在同一个类、方法名相同但参数列表不同；重写在父子类、方法签名完全相同。
- **== 与 equals()**：基本类型比较值，引用类型比较内存地址；equals() 默认比较地址，String 等类重写为比较值。
|- **OOP vs POP**：OOP 将业务抽象为对象交互，易维护、易复用、易扩展。

### Java 程序结构
一个 Java 源文件（.java）包含：
- **package 声明**：可选，定义包名（目录结构对应）。
- **import 语句**：导入其他包中的类。
- **类/接口/枚举定义**：一个源文件只能有一个 public 类（与文件名相同），可有多个非 public 类。
- 编译后每个类生成独立的 .class 字节码文件。

### Java 文件结构规范
- 源文件编码为 UTF-8（Java 18+ 默认）。
- 类名首字母大写，方法/变量首字母小写（驼峰命名）。
- 一个 .java 文件对应一个 public 类，文件名必须与类名一致。
- 若有 package 声明，必须是文件第一行代码（注释除外）。
`,
    source: null,
  },
  面向对象: {
    category: "java_basic",
    content: `## 面向对象三大特征

- **封装**：隐藏对象内部属性，通过公共方法（getter/setter）对外暴露操作接口，提高安全性。
- **继承**：子类拥有父类所有属性和方法（包括私有的，但无法直接访问），可扩展。子类拥有父类私有成员，但不能直接访问。
- **多态**：父类引用指向子类实例，方法调用的具体实现在运行时确定。子类重写的方法优先执行，无法调用子类特有方法。

## 接口 vs 抽象类

| 特性 | 接口 | 抽象类 |
|------|------|--------|
| 设计目的 | 对行为进行约束（有什么能力） | 代码复用（强调所属关系） |
| 继承/实现 | 类可实现多个接口；接口可多重继承 | 类只能继承一个抽象类 |
| 成员变量 | 只能是 public static final 常量 | 可以是任何修饰符 |
| 方法 | Java 8+ 支持 default/static；Java 9+ 支持 private | 可包含抽象和具体方法 |

## 深拷贝 vs 浅拷贝

- **引用拷贝**：两个引用指向同一对象。
- **浅拷贝**：在堆上创建新对象，但复制内部对象的引用地址，新旧对象共享内部对象（实现 Cloneable 并重写 clone()）。
- **深拷贝**：完全复制整个对象，包括内部对象，新旧对象完全独立。

`,
    source: null,
  },
  String: {
    category: "java_basic",
    content: `##String、StringBuffer、StringBuilder 对比

| 特性 | String | StringBuffer | StringBuilder |
|------|--------|-------------|---------------|
| 可变性 | 不可变（final 类，char[] 被 private final 修饰） | 可变 | 可变 |
| 线程安全 | 安全（不可变） | 安全（方法使用 synchronized） | 不安全 |
| 性能 | 最低（每次修改创建新对象） | 中等（同步开销） | 最高 |
| 推荐场景 | 字符串常量，少量操作 | 多线程大量拼接 | 单线程大量拼接 |

## String 为什么不可变？

1. 保存字符串的 char[]（Java 9 后改为 byte[]）被 private final 修饰，类未暴露修改方法。
2. String 类本身被 final 修饰，防止子类破坏不可变性。
3. Java 9 改用 byte[] 以节省内存：大部分字符可用 Latin-1（单字节）表示，节省一半空间；否则用 UTF-16（双字节）。

## new String("abc") 创建了几个对象？

- 常量池中若无 "abc"：创建 2 个对象（常量池中的 "abc" + 堆中的 String 对象）。
- 常量池中已有 "abc"：创建 1 个对象（仅堆中的 String 对象）。

`,
    source: null,
  },
  集合: {
    category: "java_collections",
    content: `##集合框架概览

两大接口：**Collection**（存放单一元素，子接口 List、Set、Queue）和 **Map**（存放键值对）。

### 主要实现底层数据结构
| 实现类 | 数据结构 |
|--------|----------|
| ArrayList | Object[] 数组 |
| LinkedList | 双向链表 |
| HashMap | JDK1.8 前：数组+链表；JDK1.8 后：数组+链表+红黑树 |
| HashSet | 基于 HashMap |
| PriorityQueue | Object[] 数组实现小顶堆 |

### 选用原则
- 需要键值映射 → Map（排序选 TreeMap，不排序选 HashMap，线程安全选 ConcurrentHashMap）
- 只需存放元素 → Collection（唯一性选 Set，否则选 List）
- 需要排队/阻塞 → Queue 系列

### fail-fast vs fail-safe
- **fail-fast**（java.util 包）：通过 modCount 记录修改次数，迭代时并发修改抛出 ConcurrentModificationException。
- **fail-safe**（java.util.concurrent 包）：如 CopyOnWriteArrayList，通过写时复制避免并发修改。
`,
    source: null,
  },
  包装类: {
    category: "java_basic",
    content: `## 包装类（Wrapper Class）

> 来源：JavaGuide

### 基本类型与包装类对应

| 基本类型 | 包装类 | 默认值 | 大小 |
|---------|--------|--------|------|
| byte | Byte | 0 | 1B |
| short | Short | 0 | 2B |
| int | Integer | 0 | 4B |
| long | Long | 0L | 8B |
| float | Float | 0.0f | 4B |
| double | Double | 0.0d | 8B |
| char | Character | '\\u0000' | 2B |
| boolean | Boolean | false | 未明确定义 |

### 自动装箱与拆箱
- **装箱**：int → Integer（调用 Integer.valueOf()）
- **拆箱**：Integer → int（调用 Integer.intValue()）
\`\`\`java
Integer a = 10;  // 自动装箱：Integer.valueOf(10)
int b = a;       // 自动拆箱：a.intValue()
\`\`\`

### 缓存机制
包装类型有缓存池（享元模式），默认缓存某些区间的值：

| 包装类 | 缓存范围 |
|--------|---------|
| Integer | -128 ~ 127（可配置：-Djava.lang.Integer.IntegerCache.high=xxx） |
| Long | -128 ~ 127 |
| Short | -128 ~ 127 |
| Byte | -128 ~ 127（全部） |
| Character | 0 ~ 127（ASCII） |
| Boolean | true / false |

\`\`\`java
Integer a = 100, b = 100;
System.out.println(a == b);  // true（缓存命中，同一对象）

Integer c = 200, d = 200;
System.out.println(c == d);  // false（超过缓存范围，不同对象）

// 正确比较方式
System.out.println(c.equals(d));  // true
\`\`\`

### 注意事项
- 包装类对象不可变（final 修饰）。
- new Integer(100) 强制创建新对象（与 valueOf 不同）。
- 算术运算自动拆箱（可能抛 NPE：null + 1）。
- 比较用 equals()，不用 ==（除非确定在缓存范围内）。`,
    source: "JavaGuide",
  },
  异常: {
    category: "java_basic",
    content: `## Java 异常体系

> 来源：JavaGuide

### 异常分类

\`\`\`
Throwable
├── Error（不可恢复，无需捕获）
│   ├── OutOfMemoryError
│   ├── StackOverflowError
│   └── NoClassDefFoundError
└── Exception（可处理）
    ├── 受检异常（Checked Exception）
    │   ├── IOException
    │   ├── SQLException
    │   └── ClassNotFoundException
    └── 非受检异常（RuntimeException）
        ├── NullPointerException
        ├── IllegalArgumentException
        ├── ClassCastException
        ├── IndexOutOfBoundsException
        └── ArithmeticException
\`\`\`

### 受检 vs 非受检异常

| 特性 | 受检异常（Checked） | 运行时异常（Runtime/Unchecked） |
|------|-------------------|-------------------------------|
| 编译检查 | 必须处理（try-catch 或 throws） | 不强制处理 |
| 继承 | Exception 的直接子类（不含 RuntimeException） | RuntimeException 的子类 |
| 典型代表 | IOException, SQLException | NPE, IllegalArgumentException |
| 触发场景 | 外部因素（文件不存在、网络断开） | 程序 Bug（逻辑错误、参数错误） |

### try-catch-finally 与 try-with-resources

**try-catch-finally**：
- finally 块总能执行（除非 System.exit() 或 JVM 崩溃）。
- finally 中 return 会覆盖 try 中的 return。

**try-with-resources**（JDK 7+）：
\`\`\`java
try (FileInputStream fis = new FileInputStream("file.txt")) {
  // 使用流
} // 自动关闭，无需 finally
\`\`\`
- 资源类必须实现 AutoCloseable 接口。
- 比 finally 更简洁，异常抑制机制不会丢失原始异常。

### 最佳实践
- 只捕获能处理的异常，否则向上抛出。
- 异常粒度细化，不捕获 Exception 或 Throwable。
- finally 中不要返回值或抛异常（会覆盖 try 中的异常）。
- 使用自定义异常更好表达业务语义。

### 异常处理最佳实践（补充）
- **异常不要用来控制流程**：异常成本高（创建堆栈），用 if-else 处理可预料的状态。
- **不要忽略异常**：空的 catch 块会隐藏问题，至少打日志。
- **抛出具体的异常**：throw new FileNotFoundException() 优于 throw new Exception()。
- **异常封装**：将低层异常包装为高层业务异常（如 DaoException → ServiceException）。
- **资源释放**：优先使用 try-with-resources（JDK 7+），确保 AutoCloseable 资源自动关闭。`,
    source: "JavaGuide",
  },
  序列化: {
    category: "java_basic",
    content: `## Java 序列化

> 来源：JavaGuide

### 什么是序列化？
序列化（Serialization）将 Java 对象转换为字节序列，便于存储或网络传输；反序列化将字节序列恢复为 Java 对象。

### 实现方式

**1. 原生 Serializable 接口**
\`\`\`java
public class User implements Serializable {
  private static final long serialVersionUID = 1L;
  private String name;
  private transient int age;  // transient 字段不被序列化
}
\`\`\`

**2. Externalizable 接口**
- 需实现 writeExternal() 和 readExternal() 自定义序列化逻辑。
- 性能优于 Serializable，但需手动编码。

### serialVersionUID 作用
- 用于反序列化时验证版本一致性。
- 显式声明可避免因类结构变更导致 InvalidClassException：
  - 修改了类字段、方法等结构 → serialVersionUID 变化。
  - 不显式声明时 JVM 自动生成（不同编译器实现可能不同）。

### transient 关键字
- 标识的字段不参与序列化（反序列化后为默认值）。
- 适用于敏感信息（密码）或不需持久化的字段（缓存引用）。

### 注意事项
- 静态变量不属于对象状态，不参与序列化。
- 反序列化不调用构造方法，通过 Unsafe 或反射直接创建对象。
- 若父类未实现 Serializable，父类字段需有无参构造方法（反序列化时调用）。
- 序列化会递归序列化所有引用的对象（需全部实现 Serializable）。
- 推荐使用 JSON（Jackson/Gson）替代 Java 原生序列化——跨语言、可读性好、安全性高。`,
    source: "JavaGuide",
  },
  内部类: {
    category: "java_basic",
    content: `## 内部类（Inner Class）

> 来源：JavaGuide

### 什么是内部类？
Java 内部类（Inner Class）是定义在另一个类内部的类。内部类可以访问外部类的所有成员（包括 private），外部类也可访问内部类实例的私有成员。

### 四种内部类

**1. 成员内部类（Member Inner Class）**
\`\`\`java
class Outer {
  private int x = 1;
  class Inner {
    void print() { System.out.println(x); }  // 访问外部类私有成员
  }
}
// 使用：Outer.Inner in = new Outer().new Inner();
\`\`\`
- 不能定义静态成员（final static 常量除外）。

**2. 静态内部类（Static Nested Class）**
\`\`\`java
class Outer {
  static class StaticInner { }
}
// 使用：Outer.StaticInner obj = new Outer.StaticInner();
\`\`\`
- 不持有外部类引用，不依赖外部类实例。
- 可访问外部类的静态成员（包括 private static）。
- 推荐用于辅助类（如 HashMap.Node、Integer.IntegerCache）。

**3. 局部内部类（Local Inner Class）**
- 定义在方法或作用域内，仅在当前作用域可见。
- 访问外部变量需变量为 final 或等效 final。

**4. 匿名内部类（Anonymous Inner Class）**
\`\`\`java
new Runnable() {
  @Override
  public void run() { System.out.println("run"); }
};
\`\`\`
- 没有名称，同时定义并实例化类。
- 常用于事件监听（Swing/Android）和创建接口/抽象类的实例。
- Java 8 后多数匿名内部类可被 Lambda 替代。

### 各内部类对比

| 类型 | 持有外部类引用 | 访问外部实例成员 | 定义位置 |
|------|:-------------:|:---------------:|----------|
| 成员内部类 | ✅ | ✅ | 类内部 |
| 静态内部类 | ❌ | 仅静态成员 | 类内部（static） |
| 局部内部类 | ✅ | ✅ | 方法/作用域内 |
| 匿名内部类 | ✅ | ✅ | 表达式中 |`,
    source: "JavaGuide",
  },
  枚举: {
    category: "java_basic",
    content: `## 枚举（Enum）

> 来源：JavaGuide

### 什么是枚举？
enum 是 Java 5 引入的关键字，用于定义一组命名常量。枚举类隐式继承 java.lang.Enum。

### 基本用法
\`\`\`java
public enum Color {
  RED, GREEN, BLUE;
}
// 使用：Color c = Color.RED;
\`\`\`

### 枚举扩展用法
枚举可以有字段、构造方法、方法和抽象方法：
\`\`\`java
public enum Operation {
  PLUS("+") { public double apply(double x, double y) { return x + y; } },
  MINUS("-") { public double apply(double x, double y) { return x - y; } };

  private final String symbol;
  Operation(String symbol) { this.symbol = symbol; }
  public abstract double apply(double x, double y);

  @Override public String toString() { return symbol; }
}
\`\`\`

### 枚举的隐含方法

| 方法 | 说明 |
|------|------|
| values() | 返回枚举常量数组 |
| valueOf(String) | 按名称返回枚举常量 |
| ordinal() | 返回枚举常量的序数（从 0 开始，谨慎使用） |
| name() | 返回枚举常量名称字符串 |

### 枚举 vs 常量（public static final）

| 维度 | 枚举 | 常量 |
|------|------|------|
| 类型安全 | ✅ 编译期检查 | ❌ 可传入任意 int |
| 可读性 | 强（自带 toString） | 弱（打印数值） |
| 功能扩展 | 支持字段、方法、接口实现 | 无 |
| 单例保证 | 天然单例 | 手动实现 |
| switch 支持 | ✅ | ❌（需 if-else） |

### 枚举最佳实践
- 结合 switch 使用（编译器检查是否覆盖所有枚举值）。
- 用 EnumSet 和 EnumMap 替代 HashSet/HashMap（性能更高）。
- 使用枚举实现单例模式（防止反射攻击和序列化破坏）。
- 使用枚举实现策略模式（每个常量实现不同行为）。`,
    source: "JavaGuide",
  },
  Optional: {
    category: "java_basic",
    content: `## Optional 类

> 来源：JavaGuide

### 什么是 Optional？
Optional<T> 是 Java 8 引入的容器类，代表一个可能包含也可能不包含值的对象。旨在减少 NullPointerException，提供更优雅的空值处理方式。

### 创建 Optional
\`\`\`java
Optional<String> empty = Optional.empty();                  // 空 Optional
Optional<String> of = Optional.of("hello");                 // 值非空（null 抛 NPE）
Optional<String> nullable = Optional.ofNullable(someValue); // 值可为 null
\`\`\`

### 常用方法

| 方法 | 说明 |
|------|------|
| isPresent() | 值是否存在 |
| isEmpty() | Java 11+，值是否为空 |
| ifPresent(Consumer) | 值存在时执行操作 |
| ifPresentOrElse(Consumer, Runnable) | Java 9+，值存在/不存在分别处理 |
| orElse(T) | 值存在返回自身，否则返回默认值 |
| orElseGet(Supplier) | 值存在返回自身，否则执行 Supplier 获取值（延迟计算） |
| orElseThrow(Supplier) | 值不存在时抛出自定义异常 |
| map(Function) | 值存在时执行转换，返回 Optional |
| flatMap(Function) | 值存在时执行转换（返回 Optional），避免嵌套 |
| filter(Predicate) | 值存在且满足条件时保留，否则返回 Optional.empty() |
| stream() | Java 9+，将 Optional 转为 Stream |

### 正确使用方式
\`\`\`java
// ❌ 错误：仍然用 isPresent + get（和 if-null 检查没区别）
if (opt.isPresent()) { String val = opt.get(); }

// ✅ 正确：使用函数式 API
opt.ifPresent(v -> System.out.println(v));

String result = opt.orElse("default");
User user = opt.orElseThrow(() -> new NoSuchElementException("User not found"));

// ✅ 链式调用
String city = Optional.ofNullable(user)
  .map(User::getAddress)
  .map(Address::getCity)
  .orElse("未知");
\`\`\`

### 使用建议
- 不要在字段、方法参数、集合元素中使用 Optional（增加了序列化成本和复杂性）。
- 仅作为方法返回类型，表示"可能为空"的返回值。
- 不要用 Optional 替代所有的 null 检查，仅用于流式链式调用场景。
- 与 Stream 配合效果最好：stream.filter(...).findFirst().map(...).orElse(...)。`,
    source: "JavaGuide",
  },
  BigDecimal: {
    category: "java_basic",
    content: `## BigDecimal 精度控制

> 来源：JavaGuide

### 浮点数精度问题
\`\`\`java
double d = 0.1 + 0.2;
System.out.println(d);  // 0.30000000000000004
\`\`\`
float 和 double 使用二进制浮点数，无法精确表示 0.1、0.2 等十进制小数。

### 使用 BigDecimal 解决
\`\`\`java
BigDecimal a = new BigDecimal("0.1");
BigDecimal b = new BigDecimal("0.2");
BigDecimal sum = a.add(b);
System.out.println(sum);  // 0.3
\`\`\`

### ⚠️ 构造方法陷阱
\`\`\`java
// ❌ 错误：double 参数仍存在精度问题
new BigDecimal(0.1);  // 结果: 0.100000000000000005551115123125...

// ✅ 正确：使用字符串参数
new BigDecimal("0.1");

// ✅ 或者使用 BigDecimal.valueOf()（内部使用 Double.toString()）
BigDecimal.valueOf(0.1);
\`\`\`

### 算术运算（返回新对象，BigDecimal 不可变）
\`\`\`java
BigDecimal a = new BigDecimal("10.5");
BigDecimal b = new BigDecimal("3");

a.add(b);              // 加
a.subtract(b);         // 减
a.multiply(b);         // 乘
a.divide(b, 2, RoundingMode.HALF_UP);  // 除（需指定精度和舍入模式）
a.setScale(2, RoundingMode.HALF_UP);   // 设置小数位
\`\`\`

### 舍入模式

| 模式 | 说明 |
|------|------|
| HALF_UP | 四舍五入（最常用） |
| HALF_DOWN | 五舍六入 |
| HALF_EVEN | 银行家舍入（5 时进到偶数） |
| UP | 远离零方向舍入 |
| DOWN | 向零方向舍入（截断） |
| CEILING | 向正无穷方向 |
| FLOOR | 向负无穷方向 |

### 比较方式
\`\`\`java
// ❌ equals 比较值 + 精度（0.0 和 0.00 不等）
new BigDecimal("0.0").equals(new BigDecimal("0.00")); // false

// ✅ compareTo 只比较数值
new BigDecimal("0.0").compareTo(new BigDecimal("0.00")); // 0（相等）
\`\`\`

### 最佳实践
1. 构造 BigDecimal 始终使用 String 参数。
2. 除法运算必须指定 scale 和 roundingMode。
3. 比较使用 compareTo() 而非 equals()。
4. Java 中金额计算必须使用 BigDecimal。`,
    source: "JavaGuide",
  },
  引用: {
    category: "java_advanced",
    content: `## Java 引用类型

> 来源：《深入理解 Java 虚拟机》

### 四种引用类型
Java 提供了四种引用类型，控制对象的可达性和 GC 回收时机：

**1. 强引用（Strong Reference）**
\`\`\`java
Object obj = new Object();
\`\`\`
- 最常见的引用类型。
- 只要强引用存在，被引用的对象永远不会被 GC 回收。
- 即使内存不足抛 OOM，也不会回收强引用对象。

**2. 软引用（Soft Reference）**
\`\`\`java
SoftReference<Object> softRef = new SoftReference<>(new Object());
Object obj = softRef.get();  // 可能为 null
\`\`\`
- JVM 内存充足时不回收，**内存不足时（即将 OOM 前）**回收。
- 适合实现内存敏感缓存（如图片缓存、数据缓存）。
- JDK 各版本对软引用 GC 策略有差异。

**3. 弱引用（Weak Reference）**
\`\`\`java
WeakReference<Object> weakRef = new WeakReference<>(new Object());
Object obj = weakRef.get();  // 可能为 null（下次 GC 后）
\`\`\`
- 无论内存是否充足，只要发生 GC 就回收。
- 典型应用：WeakHashMap（key 为弱引用，GC 后自动清除键值对）。
- ThreadLocal 的 Entry 使用弱引用引用 ThreadLocal 对象。

**4. 虚引用（Phantom Reference）**
\`\`\`java
ReferenceQueue<Object> queue = new ReferenceQueue<>();
PhantomReference<Object> phantomRef = new PhantomReference<>(new Object(), queue);
phantomRef.get();  // 始终返回 null
\`\`\`
- 最弱的引用类型，无法通过虚引用获取对象实例。
- 唯一目的是在对象被 GC 时收到通知（关联 ReferenceQueue）。
- 用于跟踪对象回收（如 NIO DirectByteBuffer 的堆外内存释放）。

### 对比总结

| 引用类型 | 回收时机 | 获取对象 | 典型场景 |
|---------|---------|---------|---------|
| 强引用 | 永不回收（OOM 也不回收） | 直接获取 | 普通 new 对象 |
| 软引用 | 内存不足时回收 | get() 可能为 null | 缓存 |
| 弱引用 | 下次 GC 即回收 | get() 可能为 null | WeakHashMap |
| 虚引用 | 任何时候 | 始终 null | 对象回收跟踪 |

### 引用队列（ReferenceQueue）
- 软引用、弱引用、虚引用可关联 ReferenceQueue。
- 对象被回收后，对应的 Reference 对象会加入队列。
- 可通过轮询队列，在对象被回收后执行清理逻辑。`,
    source: "JavaGuide",
  },
  数据类型: {
    category: "java_basic",
    content: `## Java 数据类型

> 来源：JavaGuide

### 基本类型（Primitive Types）
Java 有 8 种基本数据类型，存储在栈上（局部变量）或堆中（实例字段），值直接存储。

| 类型 | 大小 | 默认值 | 取值范围 |
|------|------|--------|---------|
| byte | 1B | 0 | -128 ~ 127 |
| short | 2B | 0 | -32768 ~ 32767 |
| int | 4B | 0 | -2^31 ~ 2^31-1 |
| long | 8B | 0L | -2^63 ~ 2^63-1 |
| float | 4B | 0.0f | 约 ±3.4E-38 ~ ±3.4E+38 |
| double | 8B | 0.0d | 约 ±4.9E-324 ~ ±1.8E+308 |
| char | 2B | '\\\\u0000' | 0 ~ 65535（Unicode） |
| boolean | 未明确定义 | false | true / false |

### 引用类型（Reference Types）
- 类（Class）、接口（Interface）、数组（Array）、枚举（Enum）。
- 引用变量存储对象的堆内存地址，默认值为 null。
- String 是引用类型，但具有不可变性和常量池特殊优化。

### 类型转换
- **自动转换（小→大）**：byte→short→int→long→float→double，char→int。
- **强制转换（大→小）**：可能丢失精度，需显式转型。
- **数值提升**：表达式中 byte/short/char 自动提升为 int。

### 基本类型 vs 引用类型
| 维度 | 基本类型 | 引用类型 |
|------|---------|---------|
| 存储 | 栈（局部）或堆中直接存值 | 存堆地址 |
| 默认值 | 具体零值 | null |
| 赋值 | 拷贝值 | 拷贝引用（浅拷贝） |
| == 比较 | 比较值 | 比较引用地址 |
`,
    source: "JavaGuide",
  },
  接口: {
    category: "java_basic",
    content: `## 接口（Interface）

> 来源：JavaGuide

### 什么是接口？
接口是 Java 中的引用类型，定义一组方法签名（行为契约），实现类必须实现接口中所有抽象方法。Java 8 后接口可以有默认方法和静态方法。

### 接口特性
- 用 interface 关键字定义，类用 implements 实现。
- 一个类可以实现多个接口（Java 多继承的替代方案）。
- 接口的成员变量默认为 public static final（常量）。
- 接口方法默认 public abstract（Java 8 前）。

### Java 8+ 接口新特性
- **default 方法**：提供默认实现，子类可选择重写。用于接口演化（如 Collection.stream()）。
- **static 方法**：接口工具方法，通过接口名直接调用（如 Comparator.comparing()）。
- **private 方法**（Java 9+）：辅助 default/static 方法，不对外暴露。

### 接口 vs 抽象类
| 维度 | 接口 | 抽象类 |
|------|------|--------|
| 设计目的 | 行为契约（有什么能力） | 代码复用（是什么关系） |
| 多继承 | 类可实现多个接口 | 类只能继承一个抽象类 |
| 构造方法 | 不能有 | 可以有 |
| 成员变量 | public static final | 任何修饰符 |
| 方法 | 抽象/default/static/private | 抽象+具体方法 |
| 状态 | 不能有实例状态 | 可以有实例字段 |
`,
    source: "JavaGuide",
  },
  继承: {
    category: "java_basic",
    content: `## 继承（Inheritance）

> 来源：JavaGuide

### 什么是继承？
继承是面向对象三大特征之一，子类通过 extends 关键字继承父类的属性和方法，形成 IS-A 关系。Java 只支持单继承（一个类只能有一个直接父类）。

### 继承要点
- 子类继承父类所有非 private 成员，但无法直接访问 private 成员（可通过 protected 方法间接访问）。
- 子类可以重写（Override）父类方法，运行时多态。
- **构造方法不可继承**：子类构造方法首行必须调用父类构造方法（super()），未显式调用则编译器自动插入 super()。
- 父类引用可指向子类实例（向上转型），子类引用不能指向父类实例。

### super 关键字
| 用途 | 示例 |
|------|------|
| 调用父类构造方法 | super() / super(args) |
| 访问父类成员 | super.field / super.method() |

### 组合 vs 继承
- **继承**：IS-A 关系（Dog extends Animal），耦合度高，父类变化影响子类。
- **组合**：HAS-A 关系（Car has Engine），耦合度低，优先使用。
`,
    source: "JavaGuide",
  },
  抽象类: {
    category: "java_basic",
    content: `## 抽象类（Abstract Class）

> 来源：JavaGuide

### 什么是抽象类？
用 abstract 关键字修饰的类，不能实例化。可以包含抽象方法（无方法体）和具体方法（有实现）。用于定义子类的通用模板。

### 抽象方法
- 用 abstract 关键字修饰，只有声明没有方法体。
- 子类必须实现所有抽象方法（除非子类也是抽象类）。
- 抽象方法不能是 private、static、final（需被子类重写）。

### 抽象类特性
- 可以有构造方法（子类通过 super() 调用）。
- 可以有实例变量、静态变量、常量。
- 可以有具体方法、静态方法、final 方法。
- 没有抽象方法也可以声明为抽象类（防止实例化）。
- 不能是 final 类（final 禁止继承，抽象类必须继承）。

### 使用场景
- 多个子类有公共的字段和行为，提取到抽象类中避免重复代码。
- 定义模板方法模式（Template Method）：在抽象类中定义算法骨架，子类实现细节。如 JdbcTemplate、AQS。
`,
    source: "JavaGuide",
  },
  静态成员: {
    category: "java_basic",
    content: `## 静态成员（Static Members）

> 来源：JavaGuide

### static 关键字
static 表示类级别的成员，不依赖任何实例，类加载时初始化，所有实例共享。

### 静态变量（类变量）
- 属于类，所有实例共享同一份副本。
- 类加载的准备阶段分配内存并赋零值，初始化阶段按代码顺序赋值。
- 通过类名直接访问（ClassName.staticField）。

### 静态方法
- 属于类，通过类名调用。
- **不能访问非静态成员**（没有 this 引用）。
- 静态方法不能被重写（Override），只能被隐藏（Shadow）。
- 工具类通常将构造方法私有化，所有方法声明为 static（如 Math、Arrays）。

### 静态代码块
\`\`\`java
class MyClass {
  static {
    // 类加载时执行一次，用于初始化静态资源
    System.out.println("类加载了");
  }
}
\`\`\`
- 多个静态块按代码顺序执行。
- 父类静态块优先于子类。

### 静态导入
\`\`\`java
import static java.lang.Math.PI;
import static java.lang.Math.sqrt;
// 直接使用 PI 和 sqrt，无需 Math. 前缀
\`\`\`
- 适度使用，过度会降低代码可读性。
`,
    source: "JavaGuide",
  },
  重载: {
    category: "java_basic",
    content: `## 重载（Overloading）

> 来源：JavaGuide

### 什么是重载？
重载（Overloading）发生在同一个类中，允许存在多个同名方法，但参数列表必须不同（参数个数、类型、顺序不同）。

\`\`\`java
public class Calculator {
  public int add(int a, int b) { return a + b; }
  public int add(int a, int b, int c) { return a + b + c; }    // 参数个数不同
  public double add(double a, double b) { return a + b; }      // 参数类型不同
}
\`\`\`

### 重载的判定规则
1. 方法名必须相同。
2. 参数列表必须不同（个数、类型、顺序至少一项不同）。
3. **返回值类型不能区分重载**：仅返回值不同的两个方法不能同时存在。
4. **访问修饰符不影响重载判定**。
5. 重载方法在编译期确定（静态多态）。

### 重载 vs 重写（Override）
| 维度 | 重载（Overloading） | 重写（Override） |
|------|-------------------|-----------------|
| 范围 | 同一个类中 | 父子类之间 |
| 方法签名 | 参数列表必须不同 | 签名必须完全相同 |
| 返回值 | 可不同 | 必须相同（或协变返回类型） |
| 异常 | 无限制 | 不能抛出更宽泛的异常 |
| 访问权限 | 无限制 | 不能降低访问权限 |
| 多态类型 | 编译期（静态多态） | 运行期（动态多态） |

### 重载与覆盖（Overload vs Overwrite）
- **覆盖（Overwrite）** 即重写（Override），子类重新定义父类方法。
- 重载是编译期的，重写是运行期的。
`,
    source: "JavaGuide",
  },
  访问控制: {
    category: "java_basic",
    content: `## 访问控制（Access Modifiers）

> 来源：JavaGuide

### 四种访问修饰符

| 修饰符 | 同一类 | 同一包 | 子类（不同包） | 任意 |
|--------|:-----:|:-----:|:-------------:|:----:|
| private | ✅ | ❌ | ❌ | ❌ |
| default（无修饰符） | ✅ | ✅ | ❌ | ❌ |
| protected | ✅ | ✅ | ✅ | ❌ |
| public | ✅ | ✅ | ✅ | ✅ |

### 使用规则
- **类**：只能用 public 或 default（外部类），内部类可用任何修饰符。
- **构造方法**：可用任何修饰符（私有构造用于单例模式、工具类）。
- **成员变量**：推荐 private（封装），通过 getter/setter 暴露。
- **成员方法**：对外暴露的方法用 public，内部辅助方法用 private。
- **局部变量**：不能用访问修饰符（只在方法内可见）。

### 最佳实践
- **最小权限原则**：用尽可能是最低的访问级别。
- 对外 API 用 public，内部实现用 private（可测试性允许 default/package-private）。
- protected 谨慎使用（破坏封装，增加维护负担），仅用于需被子类扩展的场景。
`,
    source: "JavaGuide",
  },
  参数传递: {
    category: "java_basic",
    content: `## 参数传递（Parameter Passing）

> 来源：JavaGuide

### Java 只有值传递
Java 中的参数传递始终是**值传递**（Pass-by-Value），不存在引用传递。

- **基本类型**：传递的是值的副本，方法内修改不影响实参。
- **引用类型**：传递的是引用地址的副本（也是值），方法内通过引用修改对象状态会影响原对象，但修改引用本身（重新赋值）不影响实参。

\`\`\`java
// 基本类型
int x = 1;
change(x);
System.out.println(x);  // 1（不会改变）

// 引用类型
StringBuilder sb = new StringBuilder("Hello");
appendHello(sb);
System.out.println(sb); // "Hello World"（对象内容被改变）

changeRef(sb);
System.out.println(sb); // "Hello World"（引用未被改变）
\`\`\`

### 常见误区
- **"Java 引用类型是引用传递"** 是错的。传递的是引用值的副本，不是引用本身。
- **String 的特殊性**：String 不可变，所有修改操作都是创建新对象，原引用不变。
- **数组也是引用类型**：传递数组引用副本，可通过索引修改数组元素。
`,
    source: "JavaGuide",
  },
};
