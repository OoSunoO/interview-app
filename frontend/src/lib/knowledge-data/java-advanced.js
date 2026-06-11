export const knowledge = {
  泛型: {
    category: "java_basic",
    content:
      "## 泛型（Generics）\n\n> 来源：JavaGuide\n\n### 什么是泛型？\n泛型允许在定义类、接口和方法时使用类型参数，在实例化时指定具体类型，提供编译时类型安全检测。\n\n### 核心优势\n- **编译期类型检查**：将运行时 ClassCastException 提前到编译期。\n- **消除强制类型转换**：从集合取元素时自动推断类型。\n- **通用代码**：一套代码适用于多种类型。\n\n### 泛型擦除\nJava 的泛型是**编译期**特性，运行时通过类型擦除（Type Erasure）移除类型参数信息：\n\n```java\nList<String> list = new ArrayList<>();\n// 编译后变为：List list = new ArrayList();\n```\n- 无界类型参数 <T> 擦除为 Object。\n- 有界类型参数 <T extends Comparable> 擦除为边界类型 Comparable。\n- 可通过反射获取运行时类型信息。\n\n### 泛型通配符\n\n| 通配符 | 含义 | 示例 |\n|--------|------|------|\n| <?> | 无界通配符，表示任意类型 | List<?> |\n| <? extends T> | 上界通配符，T 或 T 的子类 | List<? extends Number> |\n| <? super T> | 下界通配符，T 或 T 的父类 | List<? super Integer> |\n\n**PECS 原则**（Producer Extends, Consumer Super）：生产者用 extends（只读），消费者用 super（只写）。\n\n### 泛型方法\n```java\npublic <T> T getValue(T value) { return value; }\npublic static <T extends Comparable<T>> T max(T a, T b) {\n  return a.compareTo(b) > 0 ? a : b;\n}\n```\n泛型方法独立于泛型类，可在非泛型类中定义。",
    source: "JavaGuide",
    domain: "java",
  },
  反射: {
    category: "java_basic",
    content:
      '## 反射（Reflection）\n\n> 来源：JavaGuide\n\n### 什么是反射？\n反射是 Java 提供的一种运行时机制，允许程序在运行时获取任意类的内部信息（构造方法、成员变量、方法、注解等），并操作对象的属性和方法。\n\n### 获取 Class 对象的三种方式\n```java\n// 1. Class.forName() — 最常用\nClass<?> clazz = Class.forName("java.lang.String");\n\n// 2. 类名.class\nClass<?> clazz = String.class;\n\n// 3. 对象.getClass()\nString s = "hello";\nClass<?> clazz = s.getClass();\n```\n\n### 反射常用 API\n\n```java\n// 获取类信息\nclazz.getName();          // 全限定名\nclazz.getSimpleName();    // 简单类名\nclazz.getModifiers();     // 修饰符\nclazz.getPackage();       // 包信息\n\n// 获取成员（getXxx 获取 public 包括继承，getDeclaredXxx 获取所有包括私有）\nclazz.getFields();               // 所有 public 字段\nclazz.getDeclaredFields();       // 所有字段（包括私有）\nclazz.getMethods();              // 所有 public 方法\nclazz.getDeclaredConstructors(); // 所有构造方法\n\n// 操作私有成员（需 setAccessible(true)）\nField field = clazz.getDeclaredField("name");\nfield.setAccessible(true);\nfield.set(obj, "newValue");\n```\n\n### 优缺点\n- **优点**：运行时动态创建实例和调用方法，提高代码灵活性（Spring IoC、MyBatis 等框架基石）。\n- **缺点**：性能较低（反射调用比普通调用慢数十倍）；破坏封装性；增加复杂度。框架可缓存反射对象（如 Method、Field）缓解性能问题。\n\n### 典型应用场景\nSpring IoC 依赖注入、MyBatis ORM 映射、JUnit 测试框架、动态代理（JDK Proxy）、注解处理器等。',
    source: "JavaGuide",
    domain: "java",
  },
  锁: {
    category: "java_advanced",
    content:
      '## Java 锁机制详解\n\n> 来源：JavaGuide\n\n### 锁的分类\n\n| 维度 | 分类 |\n|------|------|\n| 粒度 | 偏向锁 → 轻量级锁 → 重量级锁（锁升级） |\n| 公平性 | 公平锁（按申请顺序）、非公平锁（允许插队） |\n| 共享性 | 共享锁（读锁）、独占锁（写锁） |\n| 可重入性 | 可重入锁（ReentrantLock/synchronized）、不可重入锁 |\n| 乐观/悲观 | 乐观锁（CAS）、悲观锁（synchronized/ReentrantLock） |\n\n### 死锁（Deadlock）\n\n四个必要条件：\n1. **互斥**：资源一次只能被一个线程占用。\n2. **请求与保持**：线程持有资源时请求其他资源。\n3. **不剥夺**：资源不能被强行剥夺。\n4. **循环等待**：多个线程形成循环等待链。\n\n**预防策略**：\n- 资源顺序化：所有线程按固定顺序申请资源（破坏循环等待）。\n- 一次性申请所有资源（破坏请求与保持）。\n- 超时释放（tryLock 带超时）。\n\n**检测方法**：\n- jstack（Thread Dump）：搜索 "Found one Java-level deadlock"。\n- JConsole 图形化监控。\n- VisualVM 插件分析。\n\n### synchronized（内置锁）\n- 可重入（锁对象关联计数器，同线程可多次获取）。\n- JDK 6+ 锁升级：无锁 → 偏向锁 → 轻量级锁（CAS 自旋）→ 重量级锁（OS 互斥量）。\n- 非公平锁。\n\n### ReentrantLock（显式锁）\n- 支持公平/非公平模式（构造参数）。\n- 提供 tryLock(timeout) 超时获取。\n- 需手动 lock() / unlock()（通常结合 finally 释放）。\n- 底层基于 AQS（AbstractQueuedSynchronizer）。\n\n### synchronized vs ReentrantLock\n| 特性 | synchronized | ReentrantLock |\n|------|-------------|---------------|\n| 使用方式 | 关键字，自动释放 | API，需手动释放 |\n| 可中断 | 不可中断 | lockInterruptibly() 可中断 |\n| 超时 | 不支持 | tryLock(timeout) |\n| 公平性 | 非公平 | 可配置公平/非公平 |\n| 条件等待 | wait/notify（Object 方法） | Condition（支持多条件） |\n| 性能 | JDK 6+ 优化后差距很小 | 高并发场景略优 |',
    source: "JavaGuide",
    domain: "java_advanced",
  },
  Stream: {
    category: "java_basic",
    content:
      '## Stream API\n\n> 来源：JavaGuide\n\n### 什么是 Stream？\nStream（java.util.stream）是 Java 8 引入的、对集合操作进行函数式编程的 API。不会存储数据，而是对数据源执行一系列流水线操作。\n\n### 流的三个步骤\n```java\nList<String> result = list.stream()    // 1. 创建流\n  .filter(s -> s.startsWith("A"))       // 2. 中间操作（多个）\n  .map(String::toUpperCase)\n  .collect(Collectors.toList());        // 3. 终端操作\n```\n\n### 创建流的方式\n```java\n// 从集合\nlist.stream();\nset.parallelStream();  // 并行流\n\n// 从数组\nArrays.stream(arr);\n\n// 从值\nStream.of("a", "b", "c");\n\n// 无限流\nStream.generate(Math::random).limit(5);\nStream.iterate(0, n -> n + 2).limit(10);\n```\n\n### 中间操作（Lazy，不触发执行）\n\n| 操作 | 说明 |\n|------|------|\n| filter(Predicate) | 过滤 |\n| map(Function) | 映射转换 |\n| flatMap(Function) | 扁平化映射（如 List<List> → List） |\n| distinct() | 去重（基于 equals） |\n| sorted() | 排序 |\n| peek(Consumer) | 调试用，保留元素 |\n| limit(n) | 限制个数 |\n| skip(n) | 跳过前 n 个 |\n\n### 终端操作（触发流水线执行）\n\n| 操作 | 说明 |\n|------|------|\n| collect(Collector) | 转换为集合/Map/分组 |\n| toList() | Java 16+ 快捷收集为 List |\n| forEach(Consumer) | 遍历 |\n| reduce(BinaryOperator) | 归纳聚合 |\n| count() | 计数 |\n| anyMatch / allMatch / noneMatch | 匹配检查 |\n| findFirst / findAny | 查找元素 |\n| min / max | 最值 |\n\n### 常用 Collector\n```java\nCollectors.toList() / toSet() / toMap()\nCollectors.joining(",")           // 字符串拼接\nCollectors.groupingBy(Function)  // 分组\nCollectors.partitioningBy(Predicate)  // 分区（true/false）\nCollectors.summarizingInt()      // 统计（count/sum/min/avg/max）\n```\n\n### 注意事项\n- 流不能重复使用（执行终端操作后流关闭）。\n- 并行流 parallelStream 使用 ForkJoinPool 公共线程池，分区执行后合并结果。\n- 避免在并行流中使用有状态的操作或有副作用的行为。',
    source: "JavaGuide",
    domain: "java",
  },
  Lambda: {
    category: "java_basic",
    content:
      '## Lambda 表达式\n\n> 来源：JavaGuide\n\n### 什么是 Lambda？\nLambda 表达式是 Java 8 引入的函数式编程特性，允许将函数作为方法参数传递，使代码更简洁。\n\n### 语法\n```java\n// 完整形式\n(parameters) -> { statements; }\n\n// 省略形式\nx -> x * 2                     // 单个参数省略括号，单条语句省略 return\n(String a, String b) -> a.length() - b.length()  // 参数类型可省略（自动推断）\n() -> System.out.println("")   // 无参需空括号\n```\n\n### 函数式接口\nLambda 的类型是函数式接口（Functional Interface）—— 只有一个抽象方法的接口，用 @FunctionalInterface 注解。\n\nJava 内置四大核心函数式接口：\n\n| 接口 | 参数 | 返回值 | 用途 |\n|------|------|--------|------|\n| Predicate<T> | T | boolean | 断言/过滤 |\n| Consumer<T> | T | void | 消费/打印 |\n| Function<T,R> | T | R | 转换/映射 |\n| Supplier<T> | 无 | T | 生产/提供 |\n\n```java\n// 使用示例\nPredicate<String> nonEmpty = s -> !s.isEmpty();\nConsumer<String> print = s -> System.out.println(s);\nFunction<String, Integer> len = s -> s.length();\nSupplier<Double> random = () -> Math.random();\n```\n\n### 方法引用（Method Reference）\n当 Lambda 体直接调用已有方法时，可用更简洁的方法引用：\n\n| 类型 | 语法 | 等价 Lambda |\n|------|------|-------------|\n| 静态方法 | Class::staticMethod | x -> Class.staticMethod(x) |\n| 实例方法（对象） | obj::instanceMethod | x -> obj.instanceMethod(x) |\n| 实例方法（参数） | Class::instanceMethod | (obj, x) -> obj.instanceMethod(x) |\n| 构造方法 | Class::new | x -> new Class(x) |\n\n### 变量捕获\nLambda 可以访问外部变量，但被引用的局部变量必须是**隐式 final**（或等效 final）—— 即初始化后不改变值。',
    source: "JavaGuide",
    domain: "java",
  },
  注解: {
    category: "java_basic",
    content:
      '## 注解（Annotation）\n\n> 来源：JavaGuide\n\n### 什么是注解？\n注解是 Java 5 引入的元数据机制，为代码提供额外信息，不影响程序本身的执行逻辑，但可被编译器和框架处理。\n\n### 元注解（标注注解的注解）\n\n| 元注解 | 说明 |\n|--------|------|\n| @Target | 注解可用目标（TYPE、FIELD、METHOD、PARAMETER、CONSTRUCTOR、LOCAL_VARIABLE、ANNOTATION_TYPE、PACKAGE） |\n| @Retention | 保留策略：SOURCE（编译丢弃）、CLASS（class 文件保留，运行时不可反射）、RUNTIME（运行时保留，可反射读取） |\n| @Documented | 生成的 JavaDoc 中包含注解 |\n| @Inherited | 子类可继承父类的注解 |\n| @Repeatable | Java 8+，允许在同一声明上重复使用同个注解 |\n\n### 自定义注解\n```java\n@Target(ElementType.METHOD)\n@Retention(RetentionPolicy.RUNTIME)\npublic @interface LogExecutionTime {\n  String value() default "";\n  boolean enabled() default true;\n}\n```\n\n### 核心内置注解\n\n| 注解 | 用途 |\n|------|------|\n| @Override | 重写父类方法（编译期检查） |\n| @Deprecated | 标记过时元素 |\n| @SuppressWarnings | 压制编译器警告 |\n| @FunctionalInterface | 函数式接口标记 |\n| @SafeVarargs | 抑制堆污染警告 |\n\n### 注解处理机制\n\n**编译期处理**（@Retention(SOURCE)）：通过 Annotation Processor（如 Lombok、@Override 检查）在 javac 编译时处理。\n\n**运行时处理**（@Retention(RUNTIME)）：通过反射读取注解信息：\n```java\nif (method.isAnnotationPresent(LogExecutionTime.class)) {\n  LogExecutionTime annotation = method.getAnnotation(LogExecutionTime.class);\n  // 读取注解属性并执行相应处理\n}\n```\n\n### 典型应用\n- **Spring**：@Component、@Autowired、@RequestMapping、@Transactional\n- **JPA/MyBatis**：@Entity、@Table、@Column、@Select\n- **测试框架**：@Test、@Before、@After（JUnit）\n- **Lombok**：@Getter、@Setter、@Builder（编译期处理生成代码）',
    source: "JavaGuide",
    domain: "java",
  },
  单例: {
    category: "java_basic",
    content:
      "## 单例模式（Singleton）\n\n> 来源：JavaGuide\n\n### 什么是单例？\n确保类全局只有一个实例，提供唯一访问点。适用于配置管理器、线程池、数据库连接池等。\n\n### 实现方式对比\n\n**1. 饿汉式（Eager Initialization）**\n```java\npublic class Singleton {\n  private static final Singleton INSTANCE = new Singleton();\n  private Singleton() {}\n  public static Singleton getInstance() { return INSTANCE; }\n}\n```\n- 优点：线程安全（类加载时创建），简单。\n- 缺点：类加载就创建，若从未使用则浪费内存。\n\n**2. 懒汉式（Lazy Initialization）**\n```java\npublic class Singleton {\n  private static Singleton instance;\n  private Singleton() {}\n  public static synchronized Singleton getInstance() {  // 方法级同步\n    if (instance == null) instance = new Singleton();\n    return instance;\n  }\n}\n```\n- 缺点：synchronized 在方法上，每次调用都加锁，性能低。\n\n**3. 双重校验锁（DCL，Double-Checked Locking）** ✅ 推荐\n```java\npublic class Singleton {\n  private static volatile Singleton instance;  // volatile 禁止指令重排\n  private Singleton() {}\n  public static Singleton getInstance() {\n    if (instance == null) {                  // 第一次检查（无锁）\n      synchronized (Singleton.class) {\n        if (instance == null) {              // 第二次检查（加锁）\n          instance = new Singleton();\n        }\n      }\n    }\n    return instance;\n  }\n}\n```\n\n**4. 静态内部类（Initialization-on-demand Holder）** ✅ 推荐\n```java\npublic class Singleton {\n  private Singleton() {}\n  private static class Holder {\n    static final Singleton INSTANCE = new Singleton();\n  }\n  public static Singleton getInstance() { return Holder.INSTANCE; }\n}\n```\n- 利用 JVM 类加载机制保证线程安全，延迟加载，无锁开销。\n\n**5. 枚举（Enum）** ✅ 最佳推荐\n```java\npublic enum Singleton {\n  INSTANCE;\n  public void doSomething() { }\n}\n```\n- 天然防止反射攻击和序列化破坏，最简洁优雅。",
    source: "JavaGuide",
    domain: "java",
  },
  位运算: {
    category: "algorithm",
    content:
      "## 位运算（Bit Manipulation）\n\n> 来源：LeetCode 官方题解 & 算法导论\n\n### 基本位运算符\n| 运算 | 符号 | 示例 | 说明 |\n|------|:----:|:----:|------|\n| 按位与 | & | 5 & 3 = 1 | 两位都为 1 时为 1 |\n| 按位或 | | | 5 | 3 = 7 | 只要有一位为 1 则为 1 |\n| 按位异或 | ^ | 5 ^ 3 = 6 | 相同为 0，不同为 1 |\n| 取反 | ~ | ~5 = -6 | 反转所有位 |\n| 左移 | << | 5 << 1 = 10 | 低位补 0，相当于 ×2 |\n| 有符号右移 | >> | 5 >> 1 = 2 | 高位补符号位，相当于 ÷2 |\n| 无符号右移 | >>> | -5 >>> 1 | 高位补 0 |\n\n### 常用位运算技巧\n\n| 操作 | 表达式 |\n|------|--------|\n| 获取第 i 位 | (n >> i) & 1 |\n| 设置第 i 位为 1 | n | (1 << i) |\n| 清除第 i 位（设为 0） | n & ~(1 << i) |\n| 翻转第 i 位 | n ^ (1 << i) |\n| 取最低位 1（lowbit） | n & -n |\n| 清除最低位 1 | n & (n - 1) |\n| 判断是否为 2 的幂 | n > 0 && (n & (n - 1)) == 0 |\n| 判断奇偶 | (n & 1) == 1（奇数） |\n\n### 异或（XOR）的性质\n- **交换律**：a ^ b = b ^ a\n- **结合律**：a ^ (b ^ c) = (a ^ b) ^ c\n- **自反性**：a ^ a = 0\n- **恒等性**：a ^ 0 = a\n- 应用：找只出现一次的数字、不用临时变量交换两数。\n\n### Bitmask（位掩码）\n- 用整数的二进制位表示集合状态。\n- 每个位表示一个元素的「选/不选」状态。\n- 常用于状态压缩 DP（如旅行商问题 TSP）。\n- 枚举子集：for (int mask = 0; mask < (1 << n); mask++)。",
    source: "LeetCode 官方题解 & 算法导论",
    domain: "algorithm",
  },
  设计模式: {
    category: "java_basic",
    content:
      "## 设计模式概览\n\n> 来源：JavaGuide\n\n### 什么是设计模式？\n设计模式是软件开发中经过验证的、可复用的解决方案，针对特定场景下的常见问题。GoF（Gang of Four）《设计模式》将 23 种模式分为三大类：\n\n### 创建型模式（5 种）\n关注对象创建机制，隐藏创建逻辑：\n\n| 模式 | 核心思想 | JDK/Spring 示例 |\n|------|---------|----------------|\n| **单例** | 全局唯一实例 | Runtime.getRuntime(), Spring Bean 默认作用域 |\n| **工厂方法** | 定义一个创建对象的接口，子类决定实例化哪个类 | Collection.iterator() |\n| **抽象工厂** | 创建一组相关对象 | javax.xml.parsers.DocumentBuilderFactory |\n| **建造者** | 分步构建复杂对象 | StringBuilder, Lombok @Builder |\n| **原型** | 克隆已有对象创建新实例 | Object.clone() |\n\n### 结构型模式（7 种）\n关注类与对象的组合：\n\n| 模式 | 核心思想 | 示例 |\n|------|---------|------|\n| **适配器** | 不兼容接口之间搭桥 | Arrays.asList(), InputStreamReader |\n| **装饰器** | 动态添加职责 | BufferedInputStream, IO 流体系 |\n| **代理** | 为对象提供替代/占位 | JDK Proxy, Cglib, Spring AOP |\n| **外观** | 为子系统提供统一接口 | Spring JDBC JdbcTemplate |\n| **桥接** | 抽象与实现分离 | JDBC DriverManager |\n| **组合** | 将对象组合成树形结构 | Map.putAll() |\n| **享元** | 共享细粒度对象减少创建 | Integer 缓存池, String 常量池 |\n\n### 行为型模式（11 种）\n关注对象间的通信和职责分配：\n\n| 模式 | 核心思想 | 示例 |\n|------|---------|------|\n| **策略** | 定义一系列算法，运行时切换 | Comparator, List.sort() |\n| **观察者** | 一对多依赖，状态变化自动通知 | Spring ApplicationListener |\n| **模板方法** | 定义算法骨架，子类实现细节 | JdbcTemplate, AQS |\n| **责任链** | 多个处理器形成链，依次处理请求 | FilterChain, Spring Interceptor |\n| **迭代器** | 顺序访问集合 | Iterator, List.iterator() |\n| **命令** | 将请求封装为对象 | Runnable, ThreadPoolExecutor |\n| **状态** | 状态变化改变行为 | 有限状态机 |\n| **备忘录** | 捕获和恢复对象状态 | 序列化/反序列化 |\n| **中介者** | 对象间通信通过中介转发 | Message Queue |\n| **解释器** | 定义语言的文法表示 | Pattern.compile() |\n| **访问者** | 不改变元素结构新增操作 | javax.lang.model.element |\n\n### 设计原则（SOLID）\n- **S**（单一职责）：一个类只负责一件事情。\n- **O**（开闭原则）：对扩展开放，对修改关闭。\n- **L**（里氏替换）：子类必须能替换父类。\n- **I**（接口隔离）：接口应该小而专。\n- **D**（依赖倒转）：面向接口编程而非实现。",
    source: "JavaGuide",
    domain: "java",
  },
  代理: {
    category: "java_basic",
    content:
      '## 代理模式（Proxy）\n\n> 来源：JavaGuide\n\n### 什么是代理？\n代理模式为目标对象提供代理对象，通过代理对象控制对目标对象的访问，可以在不修改目标代码的前提下增强功能。\n\n### 静态代理\n在编译期确定代理类，手动编写代理类实现目标接口：\n```java\ninterface Service { void execute(); }\nclass RealService implements Service { public void execute() { ... } }\nclass ProxyService implements Service {\n  private Service target;\n  public void execute() {\n    System.out.println("前置处理");\n    target.execute();\n    System.out.println("后置处理");\n  }\n}\n```\n- 优点：实现简单。\n- 缺点：每个类都需要编写代理类，维护成本高。\n\n### JDK 动态代理\n基于接口，运行时通过反射生成代理类，使用 InvocationHandler 处理：\n```java\nService proxy = (Service) Proxy.newProxyInstance(\n  classLoader,\n  new Class[]{Service.class},\n  (proxyObj, method, args) -> {\n    System.out.println("前置处理");\n    Object result = method.invoke(target, args);\n    System.out.println("后置处理");\n    return result;\n  }\n);\n```\n- 目标类必须实现接口（必须面向接口编程）。\n- 生成的代理类继承了 Proxy 并实现了目标接口。\n- Spring AOP 默认使用 JDK 动态代理（当目标类实现接口时）。\n\n### Cglib 动态代理\n基于继承，通过 ASM 字节码框架生成目标类的子类代理：\n- 目标类不需要实现接口。\n- 通过 MethodInterceptor 实现增强逻辑。\n- 无法代理 final 类和方法。\n- Spring AOP 在目标类未实现接口时自动使用 Cglib。\n- Spring Boot 2.x+ 默认使用 Cglib 代理。\n\n### 对比\n\n| 维度 | JDK 动态代理 | Cglib 动态代理 |\n|------|-------------|---------------|\n| 原理 | 反射 + 接口 | ASM 字节码生成子类 |\n| 目标要求 | 必须实现接口 | 无接口也可 |\n| final 限制 | 无 | 无法代理 final 方法/类 |\n| 性能（创建） | 较慢（反射生成） | 较快（字节码操作） |\n| 性能（调用） | 较好 | 更好 |\n| 使用场景 | Spring AOP（有接口） | Spring AOP（无接口） |',
    source: "JavaGuide",
    domain: "java",
  },
  设计: {
    category: "algorithm",
    content:
      "## 设计题（Design）\n\n> 来源：LeetCode 官方题解 & 各公司面经\n\n### 设计题类型\n设计类题目考察数据结构选型和系统设计能力，常见题型：\n\n| 类型 | 典型题目 | 核心数据结构 |\n|------|----------|-------------|\n| 缓存 | LRU Cache、LFU Cache | 哈希表 + 双向链表 |\n| 数据流 | 数据流中位数、TopK | 双堆、平衡树 |\n| 键值存储 | 设计 Trie、支持增删改查 | Trie、哈希表 |\n| 迭代器 | 扁平化嵌套列表迭代器 | 栈、递归 |\n| 限流器 | 滑动窗口限流 | 队列、时间戳 |\n| 特定功能 | 最小栈、常数时间插入删除随机 | 栈+辅助栈、哈希表+数组 |\n\n### LRU 与 LFU\n- **LRU（最近最少使用）**：淘汰最久未被使用的数据。用哈希表 + 双向链表实现。\n- **LFU（最不经常使用）**：淘汰访问频率最低的数据。用哈希表 + 频率桶（LinkedHashSet）实现。\n\n### 最小栈（Min Stack）\n- 在 O(1) 时间内获取栈中最小元素。\n- **方案一**：辅助栈同步存储当前最小值。\n- **方案二**：单栈中存储差值（节省空间但需处理溢出）。\n\n### 设计题通用思路\n1. **明确功能需求**：什么操作需要支持？时间/空间要求？\n2. **选型数据结构**：需要快速查找（哈希表）？有序（平衡树/堆）？FIFO（队列）？\n3. **组合优化**：常需组合多种数据结构（如 LRU = 哈希表 + 链表）。\n4. **边界处理**：容量限制、空状态、并发场景。\n5. **代码实现**：先写接口，再填充细节。",
    source: "LeetCode 官方题解 & 各公司面经",
    domain: "algorithm",
  },
};
