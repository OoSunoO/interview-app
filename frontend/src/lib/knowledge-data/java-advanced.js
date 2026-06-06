export const knowledge = {
  泛型: {
    category: "java_basic",
    content: `## 泛型（Generics）

> 来源：JavaGuide

### 什么是泛型？
泛型允许在定义类、接口和方法时使用类型参数，在实例化时指定具体类型，提供编译时类型安全检测。

### 核心优势
- **编译期类型检查**：将运行时 ClassCastException 提前到编译期。
- **消除强制类型转换**：从集合取元素时自动推断类型。
- **通用代码**：一套代码适用于多种类型。

### 泛型擦除
Java 的泛型是**编译期**特性，运行时通过类型擦除（Type Erasure）移除类型参数信息：

\`\`\`java
List<String> list = new ArrayList<>();
// 编译后变为：List list = new ArrayList();
\`\`\`
- 无界类型参数 <T> 擦除为 Object。
- 有界类型参数 <T extends Comparable> 擦除为边界类型 Comparable。
- 可通过反射获取运行时类型信息。

### 泛型通配符

| 通配符 | 含义 | 示例 |
|--------|------|------|
| <?> | 无界通配符，表示任意类型 | List<?> |
| <? extends T> | 上界通配符，T 或 T 的子类 | List<? extends Number> |
| <? super T> | 下界通配符，T 或 T 的父类 | List<? super Integer> |

**PECS 原则**（Producer Extends, Consumer Super）：生产者用 extends（只读），消费者用 super（只写）。

### 泛型方法
\`\`\`java
public <T> T getValue(T value) { return value; }
public static <T extends Comparable<T>> T max(T a, T b) {
  return a.compareTo(b) > 0 ? a : b;
}
\`\`\`
泛型方法独立于泛型类，可在非泛型类中定义。`,
    source: "JavaGuide",
  },
  反射: {
    category: "java_basic",
    content: `## 反射（Reflection）

> 来源：JavaGuide

### 什么是反射？
反射是 Java 提供的一种运行时机制，允许程序在运行时获取任意类的内部信息（构造方法、成员变量、方法、注解等），并操作对象的属性和方法。

### 获取 Class 对象的三种方式
\`\`\`java
// 1. Class.forName() — 最常用
Class<?> clazz = Class.forName("java.lang.String");

// 2. 类名.class
Class<?> clazz = String.class;

// 3. 对象.getClass()
String s = "hello";
Class<?> clazz = s.getClass();
\`\`\`

### 反射常用 API

\`\`\`java
// 获取类信息
clazz.getName();          // 全限定名
clazz.getSimpleName();    // 简单类名
clazz.getModifiers();     // 修饰符
clazz.getPackage();       // 包信息

// 获取成员（getXxx 获取 public 包括继承，getDeclaredXxx 获取所有包括私有）
clazz.getFields();               // 所有 public 字段
clazz.getDeclaredFields();       // 所有字段（包括私有）
clazz.getMethods();              // 所有 public 方法
clazz.getDeclaredConstructors(); // 所有构造方法

// 操作私有成员（需 setAccessible(true)）
Field field = clazz.getDeclaredField("name");
field.setAccessible(true);
field.set(obj, "newValue");
\`\`\`

### 优缺点
- **优点**：运行时动态创建实例和调用方法，提高代码灵活性（Spring IoC、MyBatis 等框架基石）。
- **缺点**：性能较低（反射调用比普通调用慢数十倍）；破坏封装性；增加复杂度。框架可缓存反射对象（如 Method、Field）缓解性能问题。

### 典型应用场景
Spring IoC 依赖注入、MyBatis ORM 映射、JUnit 测试框架、动态代理（JDK Proxy）、注解处理器等。`,
    source: "JavaGuide",
  },
  锁: {
    category: "java_advanced",
    content: `## Java 锁机制详解

> 来源：JavaGuide

### 锁的分类

| 维度 | 分类 |
|------|------|
| 粒度 | 偏向锁 → 轻量级锁 → 重量级锁（锁升级） |
| 公平性 | 公平锁（按申请顺序）、非公平锁（允许插队） |
| 共享性 | 共享锁（读锁）、独占锁（写锁） |
| 可重入性 | 可重入锁（ReentrantLock/synchronized）、不可重入锁 |
| 乐观/悲观 | 乐观锁（CAS）、悲观锁（synchronized/ReentrantLock） |

### 死锁（Deadlock）

四个必要条件：
1. **互斥**：资源一次只能被一个线程占用。
2. **请求与保持**：线程持有资源时请求其他资源。
3. **不剥夺**：资源不能被强行剥夺。
4. **循环等待**：多个线程形成循环等待链。

**预防策略**：
- 资源顺序化：所有线程按固定顺序申请资源（破坏循环等待）。
- 一次性申请所有资源（破坏请求与保持）。
- 超时释放（tryLock 带超时）。

**检测方法**：
- jstack（Thread Dump）：搜索 "Found one Java-level deadlock"。
- JConsole 图形化监控。
- VisualVM 插件分析。

### synchronized（内置锁）
- 可重入（锁对象关联计数器，同线程可多次获取）。
- JDK 6+ 锁升级：无锁 → 偏向锁 → 轻量级锁（CAS 自旋）→ 重量级锁（OS 互斥量）。
- 非公平锁。

### ReentrantLock（显式锁）
- 支持公平/非公平模式（构造参数）。
- 提供 tryLock(timeout) 超时获取。
- 需手动 lock() / unlock()（通常结合 finally 释放）。
- 底层基于 AQS（AbstractQueuedSynchronizer）。

### synchronized vs ReentrantLock
| 特性 | synchronized | ReentrantLock |
|------|-------------|---------------|
| 使用方式 | 关键字，自动释放 | API，需手动释放 |
| 可中断 | 不可中断 | lockInterruptibly() 可中断 |
| 超时 | 不支持 | tryLock(timeout) |
| 公平性 | 非公平 | 可配置公平/非公平 |
| 条件等待 | wait/notify（Object 方法） | Condition（支持多条件） |
| 性能 | JDK 6+ 优化后差距很小 | 高并发场景略优 |`,
    source: "JavaGuide",
  },
  Stream: {
    category: "java_basic",
    content: `## Stream API

> 来源：JavaGuide

### 什么是 Stream？
Stream（java.util.stream）是 Java 8 引入的、对集合操作进行函数式编程的 API。不会存储数据，而是对数据源执行一系列流水线操作。

### 流的三个步骤
\`\`\`java
List<String> result = list.stream()    // 1. 创建流
  .filter(s -> s.startsWith("A"))       // 2. 中间操作（多个）
  .map(String::toUpperCase)
  .collect(Collectors.toList());        // 3. 终端操作
\`\`\`

### 创建流的方式
\`\`\`java
// 从集合
list.stream();
set.parallelStream();  // 并行流

// 从数组
Arrays.stream(arr);

// 从值
Stream.of("a", "b", "c");

// 无限流
Stream.generate(Math::random).limit(5);
Stream.iterate(0, n -> n + 2).limit(10);
\`\`\`

### 中间操作（Lazy，不触发执行）

| 操作 | 说明 |
|------|------|
| filter(Predicate) | 过滤 |
| map(Function) | 映射转换 |
| flatMap(Function) | 扁平化映射（如 List<List> → List） |
| distinct() | 去重（基于 equals） |
| sorted() | 排序 |
| peek(Consumer) | 调试用，保留元素 |
| limit(n) | 限制个数 |
| skip(n) | 跳过前 n 个 |

### 终端操作（触发流水线执行）

| 操作 | 说明 |
|------|------|
| collect(Collector) | 转换为集合/Map/分组 |
| toList() | Java 16+ 快捷收集为 List |
| forEach(Consumer) | 遍历 |
| reduce(BinaryOperator) | 归纳聚合 |
| count() | 计数 |
| anyMatch / allMatch / noneMatch | 匹配检查 |
| findFirst / findAny | 查找元素 |
| min / max | 最值 |

### 常用 Collector
\`\`\`java
Collectors.toList() / toSet() / toMap()
Collectors.joining(",")           // 字符串拼接
Collectors.groupingBy(Function)  // 分组
Collectors.partitioningBy(Predicate)  // 分区（true/false）
Collectors.summarizingInt()      // 统计（count/sum/min/avg/max）
\`\`\`

### 注意事项
- 流不能重复使用（执行终端操作后流关闭）。
- 并行流 parallelStream 使用 ForkJoinPool 公共线程池，分区执行后合并结果。
- 避免在并行流中使用有状态的操作或有副作用的行为。`,
    source: "JavaGuide",
  },
  Lambda: {
    category: "java_basic",
    content: `## Lambda 表达式

> 来源：JavaGuide

### 什么是 Lambda？
Lambda 表达式是 Java 8 引入的函数式编程特性，允许将函数作为方法参数传递，使代码更简洁。

### 语法
\`\`\`java
// 完整形式
(parameters) -> { statements; }

// 省略形式
x -> x * 2                     // 单个参数省略括号，单条语句省略 return
(String a, String b) -> a.length() - b.length()  // 参数类型可省略（自动推断）
() -> System.out.println("")   // 无参需空括号
\`\`\`

### 函数式接口
Lambda 的类型是函数式接口（Functional Interface）—— 只有一个抽象方法的接口，用 @FunctionalInterface 注解。

Java 内置四大核心函数式接口：

| 接口 | 参数 | 返回值 | 用途 |
|------|------|--------|------|
| Predicate<T> | T | boolean | 断言/过滤 |
| Consumer<T> | T | void | 消费/打印 |
| Function<T,R> | T | R | 转换/映射 |
| Supplier<T> | 无 | T | 生产/提供 |

\`\`\`java
// 使用示例
Predicate<String> nonEmpty = s -> !s.isEmpty();
Consumer<String> print = s -> System.out.println(s);
Function<String, Integer> len = s -> s.length();
Supplier<Double> random = () -> Math.random();
\`\`\`

### 方法引用（Method Reference）
当 Lambda 体直接调用已有方法时，可用更简洁的方法引用：

| 类型 | 语法 | 等价 Lambda |
|------|------|-------------|
| 静态方法 | Class::staticMethod | x -> Class.staticMethod(x) |
| 实例方法（对象） | obj::instanceMethod | x -> obj.instanceMethod(x) |
| 实例方法（参数） | Class::instanceMethod | (obj, x) -> obj.instanceMethod(x) |
| 构造方法 | Class::new | x -> new Class(x) |

### 变量捕获
Lambda 可以访问外部变量，但被引用的局部变量必须是**隐式 final**（或等效 final）—— 即初始化后不改变值。`,
    source: "JavaGuide",
  },
  注解: {
    category: "java_basic",
    content: `## 注解（Annotation）

> 来源：JavaGuide

### 什么是注解？
注解是 Java 5 引入的元数据机制，为代码提供额外信息，不影响程序本身的执行逻辑，但可被编译器和框架处理。

### 元注解（标注注解的注解）

| 元注解 | 说明 |
|--------|------|
| @Target | 注解可用目标（TYPE、FIELD、METHOD、PARAMETER、CONSTRUCTOR、LOCAL_VARIABLE、ANNOTATION_TYPE、PACKAGE） |
| @Retention | 保留策略：SOURCE（编译丢弃）、CLASS（class 文件保留，运行时不可反射）、RUNTIME（运行时保留，可反射读取） |
| @Documented | 生成的 JavaDoc 中包含注解 |
| @Inherited | 子类可继承父类的注解 |
| @Repeatable | Java 8+，允许在同一声明上重复使用同个注解 |

### 自定义注解
\`\`\`java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface LogExecutionTime {
  String value() default "";
  boolean enabled() default true;
}
\`\`\`

### 核心内置注解

| 注解 | 用途 |
|------|------|
| @Override | 重写父类方法（编译期检查） |
| @Deprecated | 标记过时元素 |
| @SuppressWarnings | 压制编译器警告 |
| @FunctionalInterface | 函数式接口标记 |
| @SafeVarargs | 抑制堆污染警告 |

### 注解处理机制

**编译期处理**（@Retention(SOURCE)）：通过 Annotation Processor（如 Lombok、@Override 检查）在 javac 编译时处理。

**运行时处理**（@Retention(RUNTIME)）：通过反射读取注解信息：
\`\`\`java
if (method.isAnnotationPresent(LogExecutionTime.class)) {
  LogExecutionTime annotation = method.getAnnotation(LogExecutionTime.class);
  // 读取注解属性并执行相应处理
}
\`\`\`

### 典型应用
- **Spring**：@Component、@Autowired、@RequestMapping、@Transactional
- **JPA/MyBatis**：@Entity、@Table、@Column、@Select
- **测试框架**：@Test、@Before、@After（JUnit）
- **Lombok**：@Getter、@Setter、@Builder（编译期处理生成代码）`,
    source: "JavaGuide",
  },
  单例: {
    category: "java_basic",
    content: `## 单例模式（Singleton）

> 来源：JavaGuide

### 什么是单例？
确保类全局只有一个实例，提供唯一访问点。适用于配置管理器、线程池、数据库连接池等。

### 实现方式对比

**1. 饿汉式（Eager Initialization）**
\`\`\`java
public class Singleton {
  private static final Singleton INSTANCE = new Singleton();
  private Singleton() {}
  public static Singleton getInstance() { return INSTANCE; }
}
\`\`\`
- 优点：线程安全（类加载时创建），简单。
- 缺点：类加载就创建，若从未使用则浪费内存。

**2. 懒汉式（Lazy Initialization）**
\`\`\`java
public class Singleton {
  private static Singleton instance;
  private Singleton() {}
  public static synchronized Singleton getInstance() {  // 方法级同步
    if (instance == null) instance = new Singleton();
    return instance;
  }
}
\`\`\`
- 缺点：synchronized 在方法上，每次调用都加锁，性能低。

**3. 双重校验锁（DCL，Double-Checked Locking）** ✅ 推荐
\`\`\`java
public class Singleton {
  private static volatile Singleton instance;  // volatile 禁止指令重排
  private Singleton() {}
  public static Singleton getInstance() {
    if (instance == null) {                  // 第一次检查（无锁）
      synchronized (Singleton.class) {
        if (instance == null) {              // 第二次检查（加锁）
          instance = new Singleton();
        }
      }
    }
    return instance;
  }
}
\`\`\`

**4. 静态内部类（Initialization-on-demand Holder）** ✅ 推荐
\`\`\`java
public class Singleton {
  private Singleton() {}
  private static class Holder {
    static final Singleton INSTANCE = new Singleton();
  }
  public static Singleton getInstance() { return Holder.INSTANCE; }
}
\`\`\`
- 利用 JVM 类加载机制保证线程安全，延迟加载，无锁开销。

**5. 枚举（Enum）** ✅ 最佳推荐
\`\`\`java
public enum Singleton {
  INSTANCE;
  public void doSomething() { }
}
\`\`\`
- 天然防止反射攻击和序列化破坏，最简洁优雅。`,
    source: "JavaGuide",
  },
  位运算: {
    category: "java_basic",
    content: `## 位运算

> 来源：JavaGuide

### 基本位运算符

| 运算符 | 名称 | 说明 |
|--------|------|------|
| & | 按位与 | 同 1 则 1 |
| \\| | 按位或 | 有 1 则 1 |
| ^ | 按位异或 | 不同则 1 |
| ~ | 按位取反 | 1 变 0，0 变 1 |
| << | 左移 | 高位丢弃，低位补 0，相当于 ×2^n |
| >> | 右移 | 高位补符号位，低位丢弃，相当于 ÷2^n（向下取整） |
| >>> | 无符号右移 | 高位补 0，对于负数结果变正 |

### 常见位运算技巧

| 操作 | 表达式 | 说明 |
|------|--------|------|
| 判断奇偶 | (n & 1) == 1 | 奇数返回 true |
| 取第 k 位 | (n >> k) & 1 | 获取 n 的二进制第 k 位 |
| 置第 k 位为 1 | n \\|= (1 << k) | |
| 置第 k 位为 0 | n &= ~(1 << k) | |
| 交换两数 | a ^= b; b ^= a; a ^= b; | 无需临时变量 |
| 2 的幂检测 | (n & (n-1)) == 0 | n > 0 |
| 最低位 1 | n & (-n) | 保留最低位的 1 |
| 消除最低位 1 | n & (n-1) | 将最低位的 1 变 0 |

### 实际应用

**权限掩码**：
\`\`\`java
final int READ = 1 << 0;   // 0001
final int WRITE = 1 << 1;  // 0010
int perm = READ | WRITE;   // 0011
boolean hasWrite = (perm & WRITE) != 0;  // true
\`\`\`

**集合运算**：HashMap 用 (n-1) & hash 替代取模运算定位桶位（需 n 为 2 的幂次），位运算远快于 % 取模。

**性能优化**：乘除 2 的幂次用 << 和 >>，如 x * 2 → x << 1（JVM JIT 编译器通常会自动优化）。`,
    source: "JavaGuide",
  },
  设计模式: {
    category: "java_basic",
    content: `## 设计模式概览

> 来源：JavaGuide

### 什么是设计模式？
设计模式是软件开发中经过验证的、可复用的解决方案，针对特定场景下的常见问题。GoF（Gang of Four）《设计模式》将 23 种模式分为三大类：

### 创建型模式（5 种）
关注对象创建机制，隐藏创建逻辑：

| 模式 | 核心思想 | JDK/Spring 示例 |
|------|---------|----------------|
| **单例** | 全局唯一实例 | Runtime.getRuntime(), Spring Bean 默认作用域 |
| **工厂方法** | 定义一个创建对象的接口，子类决定实例化哪个类 | Collection.iterator() |
| **抽象工厂** | 创建一组相关对象 | javax.xml.parsers.DocumentBuilderFactory |
| **建造者** | 分步构建复杂对象 | StringBuilder, Lombok @Builder |
| **原型** | 克隆已有对象创建新实例 | Object.clone() |

### 结构型模式（7 种）
关注类与对象的组合：

| 模式 | 核心思想 | 示例 |
|------|---------|------|
| **适配器** | 不兼容接口之间搭桥 | Arrays.asList(), InputStreamReader |
| **装饰器** | 动态添加职责 | BufferedInputStream, IO 流体系 |
| **代理** | 为对象提供替代/占位 | JDK Proxy, Cglib, Spring AOP |
| **外观** | 为子系统提供统一接口 | Spring JDBC JdbcTemplate |
| **桥接** | 抽象与实现分离 | JDBC DriverManager |
| **组合** | 将对象组合成树形结构 | Map.putAll() |
| **享元** | 共享细粒度对象减少创建 | Integer 缓存池, String 常量池 |

### 行为型模式（11 种）
关注对象间的通信和职责分配：

| 模式 | 核心思想 | 示例 |
|------|---------|------|
| **策略** | 定义一系列算法，运行时切换 | Comparator, List.sort() |
| **观察者** | 一对多依赖，状态变化自动通知 | Spring ApplicationListener |
| **模板方法** | 定义算法骨架，子类实现细节 | JdbcTemplate, AQS |
| **责任链** | 多个处理器形成链，依次处理请求 | FilterChain, Spring Interceptor |
| **迭代器** | 顺序访问集合 | Iterator, List.iterator() |
| **命令** | 将请求封装为对象 | Runnable, ThreadPoolExecutor |
| **状态** | 状态变化改变行为 | 有限状态机 |
| **备忘录** | 捕获和恢复对象状态 | 序列化/反序列化 |
| **中介者** | 对象间通信通过中介转发 | Message Queue |
| **解释器** | 定义语言的文法表示 | Pattern.compile() |
| **访问者** | 不改变元素结构新增操作 | javax.lang.model.element |

### 设计原则（SOLID）
- **S**（单一职责）：一个类只负责一件事情。
- **O**（开闭原则）：对扩展开放，对修改关闭。
- **L**（里氏替换）：子类必须能替换父类。
- **I**（接口隔离）：接口应该小而专。
- **D**（依赖倒转）：面向接口编程而非实现。`,
    source: "JavaGuide",
  },
  代理: {
    category: "java_basic",
    content: `## 代理模式（Proxy）

> 来源：JavaGuide

### 什么是代理？
代理模式为目标对象提供代理对象，通过代理对象控制对目标对象的访问，可以在不修改目标代码的前提下增强功能。

### 静态代理
在编译期确定代理类，手动编写代理类实现目标接口：
\`\`\`java
interface Service { void execute(); }
class RealService implements Service { public void execute() { ... } }
class ProxyService implements Service {
  private Service target;
  public void execute() {
    System.out.println("前置处理");
    target.execute();
    System.out.println("后置处理");
  }
}
\`\`\`
- 优点：实现简单。
- 缺点：每个类都需要编写代理类，维护成本高。

### JDK 动态代理
基于接口，运行时通过反射生成代理类，使用 InvocationHandler 处理：
\`\`\`java
Service proxy = (Service) Proxy.newProxyInstance(
  classLoader,
  new Class[]{Service.class},
  (proxyObj, method, args) -> {
    System.out.println("前置处理");
    Object result = method.invoke(target, args);
    System.out.println("后置处理");
    return result;
  }
);
\`\`\`
- 目标类必须实现接口（必须面向接口编程）。
- 生成的代理类继承了 Proxy 并实现了目标接口。
- Spring AOP 默认使用 JDK 动态代理（当目标类实现接口时）。

### Cglib 动态代理
基于继承，通过 ASM 字节码框架生成目标类的子类代理：
- 目标类不需要实现接口。
- 通过 MethodInterceptor 实现增强逻辑。
- 无法代理 final 类和方法。
- Spring AOP 在目标类未实现接口时自动使用 Cglib。
- Spring Boot 2.x+ 默认使用 Cglib 代理。

### 对比

| 维度 | JDK 动态代理 | Cglib 动态代理 |
|------|-------------|---------------|
| 原理 | 反射 + 接口 | ASM 字节码生成子类 |
| 目标要求 | 必须实现接口 | 无接口也可 |
| final 限制 | 无 | 无法代理 final 方法/类 |
| 性能（创建） | 较慢（反射生成） | 较快（字节码操作） |
| 性能（调用） | 较好 | 更好 |
| 使用场景 | Spring AOP（有接口） | Spring AOP（无接口） |`,
    source: "JavaGuide",
  },
  位运算: {
    category: "algorithm",
    content: `## 位运算（Bit Manipulation）

> 来源：LeetCode 官方题解 & 算法导论

### 基本位运算符
| 运算 | 符号 | 示例 | 说明 |
|------|:----:|:----:|------|
| 按位与 | & | 5 & 3 = 1 | 两位都为 1 时为 1 |
| 按位或 | \| | 5 \| 3 = 7 | 只要有一位为 1 则为 1 |
| 按位异或 | ^ | 5 ^ 3 = 6 | 相同为 0，不同为 1 |
| 取反 | ~ | ~5 = -6 | 反转所有位 |
| 左移 | << | 5 << 1 = 10 | 低位补 0，相当于 ×2 |
| 有符号右移 | >> | 5 >> 1 = 2 | 高位补符号位，相当于 ÷2 |
| 无符号右移 | >>> | -5 >>> 1 | 高位补 0 |

### 常用位运算技巧

| 操作 | 表达式 |
|------|--------|
| 获取第 i 位 | (n >> i) & 1 |
| 设置第 i 位为 1 | n \| (1 << i) |
| 清除第 i 位（设为 0） | n & ~(1 << i) |
| 翻转第 i 位 | n ^ (1 << i) |
| 取最低位 1（lowbit） | n & -n |
| 清除最低位 1 | n & (n - 1) |
| 判断是否为 2 的幂 | n > 0 && (n & (n - 1)) == 0 |
| 判断奇偶 | (n & 1) == 1（奇数） |

### 异或（XOR）的性质
- **交换律**：a ^ b = b ^ a
- **结合律**：a ^ (b ^ c) = (a ^ b) ^ c
- **自反性**：a ^ a = 0
- **恒等性**：a ^ 0 = a
- 应用：找只出现一次的数字、不用临时变量交换两数。

### Bitmask（位掩码）
- 用整数的二进制位表示集合状态。
- 每个位表示一个元素的「选/不选」状态。
- 常用于状态压缩 DP（如旅行商问题 TSP）。
- 枚举子集：for (int mask = 0; mask < (1 << n); mask++)。`,
    source: "LeetCode 官方题解 & 算法导论",
  },
  设计: {
    category: "algorithm",
    content: `## 设计题（Design）

> 来源：LeetCode 官方题解 & 各公司面经

### 设计题类型
设计类题目考察数据结构选型和系统设计能力，常见题型：

| 类型 | 典型题目 | 核心数据结构 |
|------|----------|-------------|
| 缓存 | LRU Cache、LFU Cache | 哈希表 + 双向链表 |
| 数据流 | 数据流中位数、TopK | 双堆、平衡树 |
| 键值存储 | 设计 Trie、支持增删改查 | Trie、哈希表 |
| 迭代器 | 扁平化嵌套列表迭代器 | 栈、递归 |
| 限流器 | 滑动窗口限流 | 队列、时间戳 |
| 特定功能 | 最小栈、常数时间插入删除随机 | 栈+辅助栈、哈希表+数组 |

### LRU 与 LFU
- **LRU（最近最少使用）**：淘汰最久未被使用的数据。用哈希表 + 双向链表实现。
- **LFU（最不经常使用）**：淘汰访问频率最低的数据。用哈希表 + 频率桶（LinkedHashSet）实现。

### 最小栈（Min Stack）
- 在 O(1) 时间内获取栈中最小元素。
- **方案一**：辅助栈同步存储当前最小值。
- **方案二**：单栈中存储差值（节省空间但需处理溢出）。

### 设计题通用思路
1. **明确功能需求**：什么操作需要支持？时间/空间要求？
2. **选型数据结构**：需要快速查找（哈希表）？有序（平衡树/堆）？FIFO（队列）？
3. **组合优化**：常需组合多种数据结构（如 LRU = 哈希表 + 链表）。
4. **边界处理**：容量限制、空状态、并发场景。
5. **代码实现**：先写接口，再填充细节。`,
    source: "LeetCode 官方题解 & 各公司面经",
  },
};
