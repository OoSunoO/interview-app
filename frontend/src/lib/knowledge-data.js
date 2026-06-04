/**
 * Knowledge Point Content Data
 *
 * Each entry: { title, content, source }
 * - content: full local markdown with explanations
 * - source: null (reserved for future external reference)
 */

export const knowledgeContent = {
  // Java basics group
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

  // Java collections group
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
  HashMap: {
    category: "java_collections",
    content: `##HashMap 核心要点

- **数据结构**：JDK1.8 后为数组+链表+红黑树，默认初始容量 16，负载因子 0.75，扩容为 2 倍。
- **树化条件**：链表长度 >= 8 且数组长度 >= 64，否则优先扩容。树转链表阈值为 6。
- **扰动函数**：JDK1.8 简化为 (h = key.hashCode()) ^ (h >>> 16)，减少碰撞。
- **put 流程**：计算桶位 → 桶为空直接放入 → 桶非空则遍历链表/红黑树 → 同 key 覆盖 → 不同 key 插入 → 检查扩容。
- **扩容机制**：JDK1.8 尾插法避免死循环；通过 (e.hash & oldCap) == 0 判断是否保持原索引。
- **线程不安全**：多线程并发可能导致数据丢失或死循环（JDK1.7 头插法）。
- 容量始终为 2 的幂次，通过 (n-1) & hash 快速定位桶。
- 允许 key 最多一个 null，value 可以有多个 null。
`,
    source: null,
  },
  ConcurrentHashMap: {
    category: "java_collections",
    content: `##ConcurrentHashMap 线程安全机制

**JDK 7 实现**：分段锁（Segment 继承 ReentrantLock），将数据分为多个 Segment，每个 Segment 独立加锁，理论上支持 16 个线程并发写（默认 16 个 Segment）。

**JDK 8 实现**：放弃分段锁，使用 CAS + synchronized 实现。
- 插入时若对应桶为空，用 CAS 无锁插入；
- 若桶非空，使用 synchronized 锁住链表/红黑树的头节点；
- 树化阈值为 8，最小树化容量为 64。

**核心优势**：
- JDK 8 实现更精细的锁粒度（锁住单个桶而非整个 Segment），并发度更高。
- 读操作通常不加锁（volatile 保证可见性）。
- 相比 Hashtable（全表锁），性能大幅提升。
- 支持高并发场景下的安全读写。
`,
    source: null,
  },
  ArrayList: {
    category: "java_collections",
    content: `##ArrayList 要点

- **底层结构**：Object[] 数组，支持动态扩容。
- **默认容量**：JDK1.8 后懒加载，首次 add 时初始化为 10。
- **扩容机制**：新容量 = 旧容量 * 1.5（oldCapacity + (oldCapacity >> 1)）。
- **时间复杂度**：尾部插入不扩容 O(1)，尾部插入需扩容 O(n)，指定位置插入 O(n)，尾部删除 O(1)，头部删除 O(n)。
- **特性**：允许 null 值（不建议添加，易 NPE），线程不安全，实现 RandomAccess 接口支持快速随机访问。
- **对比 LinkedList**：ArrayList 内存连续，尾部操作快；LinkedList 双向链表，头尾操作 O(1)，中间操作 O(n)，每个节点额外存储前后指针，内存占用更大。
- Joshua Bloch（作者）自述从未使用过 LinkedList，实际开发优先选用 ArrayList。
`,
    source: null,
  },
  LinkedList: {
    category: "java_collections",
    content: `##LinkedList 要点

- **底层结构**：双向链表（JDK1.7 开始非循环），内部节点存储前后指针。
- **时间复杂度**：头部插入/删除 O(1)，尾部插入/删除 O(1)，指定位置插入/删除 O(n)（需遍历到该位置，平均 n/4 个元素）。
- **未实现 RandomAccess**：内存不连续，只能通过指针遍历，无法实现快速随机访问。
- **适用场景**：头尾频繁插入/删除；双向队列操作。
- **对比 ArrayList**：
  - ArrayList 尾部操作快，LinkedList 头尾操作都快。
  - LinkedList 内存占用更大（每个节点额外存储 prev 和 next 指针）。
  - ArrayList 支持快速随机访问，LinkedList 需要遍历。
- 实际开发大多优先使用 ArrayList，仅在头部频繁操作时考虑 LinkedList。
`,
    source: null,
  },

  // JVM group
  JVM: {
    category: "java_advanced",
    content: `##JVM 运行时内存区域

- **程序计数器**（线程私有）：指向当前线程执行的字节码行号。
- **虚拟机栈**（线程私有）：每个方法对应一个栈帧，存储局部变量表、操作数栈、动态链接、方法出口。
- **本地方法栈**（线程私有）：为 native 方法服务。
- **堆**（线程共享）：存放对象实例，GC 主要区域。分新生代（Eden + Survivor 0/1）和老年代。
- **方法区**（线程共享）：存储类信息、常量、静态变量、JIT 编译后的代码。JDK 8+ 用元空间（直接内存）替代永久代。

## 类加载过程

加载 → 验证 → 准备 → 解析 → 初始化 → 使用 → 卸载。

## 双亲委派模型

启动类加载器 → 扩展类加载器 → 应用类加载器。自底向上检查类是否已加载，自顶向下尝试加载。

### 内存管理
- **对象分配**：大多数对象优先在新生代 Eden 区分配，大对象直接进入老年代（-XX:PretenureSizeThreshold）。
- **TLAB（Thread Local Allocation Buffer）**：每个线程在 Eden 区分配一小块私有缓冲区，减少线程同步竞争。
- **栈上分配 + 标量替换**：JIT 编译阶段将未逃逸的对象分配到栈上（栈帧中），方法结束自动销毁，减少 GC 压力。
- **内存泄漏**：对象已无用但仍被 GC Roots 引用导致无法回收。常见原因：静态集合类（如 static List）、未关闭资源、ThreadLocal 未 remove()、内部类持有外部类引用。

### 堆内存结构
| 区域 | 说明 | GC 行为 |
|------|------|---------|
| 新生代（Young） | 存放新创建对象 | Minor GC 频繁 |
| ├ Eden | 大多数对象首次分配位置 | 首次存活复制到 Survivor |
| ├ Survivor 0 (From) | 年龄 1 的对象 | 每次 GC 年龄+1，复制到另一个 S |
| └ Survivor 1 (To) | 年龄 1 的对象 | 同上，S0/S1 交替角色 |
| 老年代（Old） | 存放长生命周期对象 | Major GC / Full GC |
| 元空间（Metaspace） | 类元数据（JDK 8+） | 触发 Full GC 回收 |

**OOM（OutOfMemoryError）常见类型**：
- **Java heap space**：堆内存不足（对象泄漏或堆太小）。
- **Metaspace**：元空间不足（类加载过多，如热部署场景）。
- **Direct buffer memory**：直接内存不足（NIO 分配过多）。
- **GC overhead limit exceeded**：GC 花费 >98% 时间回收 <2% 堆空间。
- **Unable to create new native thread**：线程数超过操作系统限制。
- **StackOverflowError**（非 OOM）：栈深度超出限制（递归过深）。`,
    source: null,
  },
  GC: {
    category: "java_advanced",
    content: `##垃圾回收核心要点

### 对象存活判断
- **引用计数法**：无法解决循环引用，不为主流使用。
- **可达性分析**：从 GC Roots（虚拟机栈引用、静态属性、常量引用、JNI 引用等）开始搜索，不可达对象可回收。

### 引用类型
| 类型 | 回收时机 | 场景 |
|------|---------|------|
| 强引用 | 永不回收 | 普通对象 |
| 软引用 | 内存不足时回收 | 缓存 |
| 弱引用 | 下次 GC 时回收 | WeakHashMap |
| 虚引用 | 任何时候 | 跟踪对象回收 |

### 垃圾收集算法
- **标记-清除**：基础算法，产生内存碎片。
- **复制**：新生代使用，将内存分为两块，每次使用一块。
- **标记-整理**：老年代使用，无碎片但效率低。
- **分代收集**：新生代用复制，老年代用标记-整理/清除。

### 主流垃圾收集器
- **G1**（JDK 9+ 默认）：Region 化，可预测停顿，无碎片。
- **ZGC**（JDK 15+）：暂停 < 几毫秒，不受堆大小影响，最大支持 16TB。
- **CMS**（JDK 9 标记过期，JDK 14 移除）：最短停顿时间，标记-清除，产生碎片。
`,
    source: null,
  },

  // Java concurrent group
  并发: {
    category: "java_advanced",
    content: `##线程基础

- **进程**：程序的一次执行过程，系统资源分配的基本单位。
- **线程**：CPU 调度的基本单位。同一进程的多个线程共享堆和方法区，私有程序计数器、虚拟机栈、本地方法栈。
- Java 线程本质就是操作系统线程（JDK 1.2 后采用原生线程模型，一对一映射到内核线程）。
- 严格来说只有一种创建线程的方式：new Thread().start()。其他方式（实现 Runnable/Callable、线程池）都是使用模式。

### 线程六种状态
NEW → RUNNABLE → BLOCKED（等待锁）/ WAITING（等待通知）/ TIMED_WAITING（带超时等待）→ TERMINATED。

### sleep() vs wait()
- sleep() 不释放锁，自动苏醒；wait() 释放锁，需 notify/notifyAll 唤醒。
- sleep() 是 Thread 的静态方法；wait() 定义在 Object 上。

### 死锁
- 四个必要条件：互斥、请求与保持、不剥夺、循环等待。
- 预防：破坏任一条件，常用资源顺序化（按固定顺序申请资源）。
- 检测：jstack / JConsole。

### 线程深入
- **创建线程的四种方式**：继承 Thread、实现 Runnable（无返回值）、实现 Callable（有返回值，Future 获取）、线程池。
- **线程优先级**：1~10，默认 5。优先级依赖操作系统实现（Windows 固定 7 级），不建议依赖优先级控制执行顺序。
- **守护线程（Daemon）**：JVM 中所有非守护线程结束时退出。守护线程不能持有需关闭的资源（如 IO）。
- **yield()**：暗示调度器让出 CPU，但调度器可以忽略。
- **join()**：等待目标线程终止。底层通过 wait/notify 实现。
- **中断机制**：interrupt() 设置中断标志，被中断线程通过检查标志或捕获 InterruptedException 响应。
`,
    source: null,
  },
  线程池: {
    category: "java_advanced",
    content: `##线程池核心要点

### 优势
降低资源消耗（线程复用）、提高响应速度（避免创建线程延迟）、提高可管理性（统一控制并发量）。

### 核心参数
- corePoolSize：核心线程数
- maximumPoolSize：最大线程数
- workQueue：任务队列（LinkedBlockingQueue、SynchronousQueue、ArrayBlockingQueue 等）
- keepAliveTime：非核心线程空闲存活时间
- handler：拒绝策略

### 拒绝策略
| 策略 | 行为 |
|------|------|
| AbortPolicy | 抛出 RejectedExecutionException（默认） |
| CallerRunsPolicy | 调用者线程执行任务 |
| DiscardPolicy | 直接丢弃新任务 |
| DiscardOldestPolicy | 丢弃最早未处理的任务 |

### 处理流程
1. 运行线程 < corePoolSize → 新建线程执行
2. 队列未满 → 放入队列
3. 队列满且线程数 < maxPoolSize → 新建线程
4. 队列满且线程数 = maxPoolSize → 执行拒绝策略

### 注意事项
- Executors 工具类不推荐：FixedThreadPool 使用无界队列可能 OOM；CachedThreadPool 最大线程数 Integer.MAX_VALUE 可能 OOM。
- 推荐通过 ThreadPoolExecutor 构造函数创建。
- 线程数设置：CPU 密集型 N+1，I/O 密集型 2N（N 为 CPU 核心数）。
`,
    source: null,
  },
  synchronized: {
    category: "java_advanced",
    content: `##synchronized 核心要点

### 使用方式
- 修饰实例方法 → 锁当前实例（this）
- 修饰静态方法 → 锁当前 Class 对象
- 修饰代码块 → 锁指定对象或类
- 静态与非静态 synchronized 方法互不互斥（锁对象不同）

### 底层原理
- **同步语句块**：monitorenter + monitorexit 字节码指令。
- **同步方法**：ACC_SYNCHRONIZED 标志。
- 本质都是获取对象监视器 Monitor（基于 C++ ObjectMonitor）。

### 锁升级（JDK 6+）
无锁 → 偏向锁（JDK 15 默认关闭，JDK 18 废弃）→ 轻量级锁 → 重量级锁（不可降级）。

### vs volatile
| 维度 | volatile | synchronized |
|------|----------|--------------|
| 实现 | 内存屏障 | 操作系统互斥锁 |
| 功能 | 仅保证可见性和有序性 | 可见性 + 有序性 + 原子性 |
| 读开销 | 几乎与普通变量一样 | 需获取 monitor 锁 |
| 适用 | 状态标志、DCL 单例 | 复合操作（如 i++） |
`,
    source: null,
  },
  volatile: {
    category: "java_advanced",
    content: `##volatile 核心要点

### 1. 保证可见性
声明为 volatile 后，每次使用都从主存读取，禁用 CPU 缓存。写操作立即刷新到主存，读操作从主存读取最新值。

### 2. 禁止指令重排序
通过插入内存屏障实现：
- volatile 写：前面插入 StoreStore，后面插入 StoreLoad。
- volatile 读：后面插入 LoadLoad + LoadStore。

### 3. 不保证原子性
inc++ 是复合操作（读、加、写），volatile 无法确保原子性。需用 synchronized、Lock 或 AtomicInteger。

### 4. DCL 单例中的必要性
uniqueInstance = new Singleton() 三步：分配内存、初始化、赋值。不加 volatile 可能发生指令重排（1->3->2），导致线程拿到未初始化对象。

### 5. happens-before 规则
对 volatile 变量的写 happens-before 后续对该变量的读。保证写之前的所有修改对读之后的操作可见。
`,
    source: null,
  },
  CAS: {
    category: "java_advanced",
    content: `##CAS（Compare And Swap）核心要点

### 基本原理
三个操作数：V（更新变量）、E（预期值）、N（新值）。仅当 V == E 时才将 V 更新为 N，否则不操作。Java 中通过 Unsafe 类的 compareAndSwapInt 等 native 方法（C++ 内联汇编）实现。

### 乐观锁 vs 悲观锁
| 维度 | 乐观锁 | 悲观锁 |
|------|--------|--------|
| 核心假设 | 冲突很少，提交时验证 | 冲突必然，读取时加锁 |
| 底层原理 | CAS 或版本号 | 操作系统互斥锁 |
| 阻塞情况 | 非阻塞，失败重试 | 阻塞，排队等待 |
| Java 代表 | AtomicInteger、LongAdder | synchronized、ReentrantLock |
| 适用场景 | 多读少写，冲突概率低 | 多写少读，一致性要求高 |

### CAS 存在的问题
1. **ABA 问题**：可用版本号/时间戳解决（AtomicStampedReference）。
2. **循环时间长开销大**：长时间自旋浪费 CPU，可用 pause 指令优化。
3. **只能保证一个共享变量的原子操作**：可用 AtomicReference 包装多个变量。
`,
    source: null,
  },
  AQS: {
    category: "java_advanced",
    content: `##AQS（AbstractQueuedSynchronizer）核心要点

### 概念
AQS 是 Java 并发包（JUC）的基石，为同步器（如 ReentrantLock、Semaphore、CountDownLatch）提供通用框架。核心是 CLH 锁队列的变体——虚拟双向队列（FIFO），通过自旋 + CAS 实现。

### 核心机制
- **state 状态位**：volatile int 类型，通过 CAS 修改。ReentrantLock 中 state=0 表示无锁，state>0 表示已锁定（可重入计数）。
- **CLH 队列**：未获取到锁的线程包装为 Node 节点，通过 CAS 插入队列尾部，自旋等待前驱节点释放锁。
- **独占/共享模式**：独占式（如 ReentrantLock）同一时刻只有一个线程持有锁；共享式（如 Semaphore、CountDownLatch）允许多个线程同时持有。

### 模板方法模式
子类需重写的方法：
- tryAcquire(int)/tryRelease(int)：独占式获取/释放
- tryAcquireShared(int)/tryReleaseShared(int)：共享式获取/释放
- isHeldExclusively()：是否独占模式

### 常见同步器
ReentrantLock、ReentrantReadWriteLock、Semaphore、CountDownLatch 等。
`,
    source: null,
  },

  // Java IO group
  IO: {
    category: "java_advanced",
    content: `##Java IO 模型

IO 操作需经过两个步骤：内核等待设备准备好数据 + 内核将数据从内核空间拷贝到用户空间。

### Java 中 3 种常见 IO 模型

**BIO（Blocking I/O）**：同步阻塞。应用程序发起 read 调用后一直阻塞，直到数据从内核拷贝到用户空间。连接数不高时可用，高并发场景下无能为力。

**NIO（Non-blocking/New I/O）**：Java 1.4 引入，对应 java.nio 包。可看作 I/O 多路复用模型。核心组件：
- **Buffer**：缓冲区，读写操作的媒介。
- **Channel**：通道，双向传输数据。
- **Selector**：多路复用器，单线程管理多个客户端连接。
- NIO 通过减少无效系统调用，降低 CPU 资源消耗。

**AIO（NIO 2）**：Java 7 引入，异步 IO 模型，基于事件和回调机制。目前应用不广泛，Netty 曾尝试使用但放弃（Linux 性能提升不明显）。

### IO 流体系
字节流（InputStream/OutputStream）、字符流（Reader/Writer）、缓冲流（BufferedXxx）、随机访问文件（RandomAccessFile）。大量使用装饰器模式。

### 文件和 IO 操作

**File 类**：文件和目录路径名的抽象表示，操作文件元数据（创建、删除、重命名、权限检查），不涉及文件内容读写。

| 常用方法 | 说明 |
|----------|------|
| exists() / isFile() / isDirectory() | 检查状态 |
| createNewFile() / delete() / mkdirs() | 创建/删除 |
| list() / listFiles() | 列出目录内容 |

**文件输入流**：
| 类 | 说明 |
|----|------|
| FileInputStream | 从文件读取字节数据 |
| FileOutputStream | 向文件写入字节数据 |
| FileReader | 从文件读取字符数据（便捷包装） |
| FileWriter | 向文件写入字符数据 |

**NIO（New I/O，Java 1.4+）**：
- **Path**：替代 File 的路径表示，支持更丰富的路径操作。
- **Files**：工具类，提供 readAllBytes()、write()、copy()、move() 等静态方法简化文件操作。
- **FileChannel**：与 Buffer 配合，支持 transferTo/transferFrom 实现零拷贝。
|- **WatchService**：监听文件系统变更事件。
||- **内存映射文件**（MappedByteBuffer）：直接操作内存映射区域，适合大文件读写。
`,
    source: null,
  },

  // Spring group
  Spring: {
    category: "java_advanced",
    content: `##Spring 核心概念

### IoC（控制反转）
将对象的创建和管理权交给 IoC 容器，对象通过容器获取而非直接 new。降低耦合度，资源容易管理。

### AOP（面向切面编程）
将日志、事务、权限等与业务无关的逻辑封装。实现机制：
- 有接口 → JDK Proxy
- 无接口 → Cglib

### Bean 生命周期
创建实例 -> 属性赋值（处理 @Autowired）-> 初始化（Aware 接口 -> BeanPostProcessor -> InitializingBean -> init-method）-> 销毁。

### Bean 作用域
- singleton（默认）：唯一实例
- prototype：每次获取创建新实例
- request/session/application/websocket（Web 场景）

### Spring、Spring MVC、Spring Boot 关系
- Spring Framework 核心是 IoC + AOP
- Spring MVC 是 Spring 中的 MVC 框架（Model-View-Controller）
- Spring Boot 简化 Spring 配置，开箱即用，内部仍使用 Spring MVC 等模块

### @Autowired vs @Resource
- @Autowired：Spring 内置，默认 byType，通过 @Qualifier 指定名称
- @Resource：JDK JSR-250，默认 byName，通过 name 属性指定
- 推荐 @Resource（减少 Spring 耦合）或构造器注入 + @Autowired
`,
    source: null,
  },

  // CS basics: OS
  操作系统: {
    category: "cs_basics",
    content: `##操作系统核心概念

### 进程 vs 线程
- **进程**：资源分配的基本单位，独立地址空间，创建/切换开销大。
- **线程**：CPU 调度的基本单位，共享所属进程资源，创建/切换开销小。一个线程崩溃可能导致整个进程崩溃。

### 用户态 vs 内核态
- 用户态：低权限，只能访问用户程序数据。
- 内核态：高权限，可访问任何资源。
- 切换方式：系统调用（主动）、中断（外部设备触发）、异常（程序自身错误）。

### 进程间通信方式
管道、有名管道（FIFO）、信号、消息队列、信号量、共享内存、套接字。

### 死锁四个必要条件
互斥、占有并等待、非抢占、循环等待。破坏任一则可预防。

### 进程调度算法
FCFS（先来先服务）、SJF（短作业优先）、RR（时间片轮转）、MFQ（多级反馈队列，平衡长短作业）。

### 虚拟内存
将物理内存抽象为逻辑地址空间，通过分页/分段实现。页面置换算法：FIFO、LRU、时钟算法等。

### 内存管理
- **分页**：将虚拟内存和物理内存划分为固定大小的页（4KB），通过页表映射。多级页表减少页表占用。
- **分段**：按逻辑段（代码段、数据段、堆、栈）管理内存，段大小可变。
- **段页式**：先分段，每段内再分页，兼具分段逻辑清晰和分页无碎片优势。
- **内存碎片**：外部碎片（分段导致，无法连续分配）通过紧凑技术解决；内部碎片（分页导致，页内未用完空间），现代 OS 主要用分页。
- **页面置换算法**：最佳置换（OPT，理论最优）、FIFO（先进先出，Belady 异常）、LRU（最近最少使用，栈实现）、时钟算法（近似 LRU，效率高）。
- **写时复制（Copy-on-Write）**：fork() 创建子进程时共享物理内存，仅写入时复制，节省内存。
`,
    source: null,
  },
  网络: {
    category: "cs_basics",
    content: `##计算机网络核心概念

### TCP/IP 四层模型
应用层 -> 传输层 -> 网络层 -> 网络接口层（OSI 七层精简版）。

### HTTP vs HTTPS
- HTTP 端口 80，明文传输；HTTPS 端口 443，SSL/TLS 加密。

### HTTP/1.1 vs HTTP/2.0
- 多路复用：HTTP/2.0 在同一连接上并行传输多个请求/响应。
- 二进制帧：更紧凑高效。
- 头部压缩：HPACK 算法。
- 服务器推送。

### HTTP/3.0
改用 QUIC 协议（基于 UDP），0-RTT 或 1-RTT 握手，解决 TCP 队头阻塞问题。

### GET vs POST
| 维度 | GET | POST |
|------|-----|------|
| 语义 | 获取/查询资源 | 创建/修改资源 |
| 幂等性 | 幂等 | 非幂等 |
| 参数 | URL 中（querystring） | 请求体中 |
| 缓存 | 可缓存 | 不应缓存 |

### 状态码分类
2xx 成功、3xx 重定向、4xx 客户端错误、5xx 服务端错误。
`,
    source: null,
  },
  TCP: {
    category: "cs_basics",
    content: `##TCP 核心概念

### TCP vs UDP
| 特性 | TCP | UDP |
|------|-----|-----|
| 连接性 | 面向连接（三次握手/四次挥手） | 无连接 |
| 可靠性 | 可靠（序列号、ACK、重传、流量/拥塞控制） | 不可靠（尽力交付） |
| 传输形式 | 面向字节流 | 面向报文 |
| 首部开销 | 20-60 字节 | 8 字节 |
| 通信模式 | 点对点（单播） | 单播、多播、广播 |
| 典型应用 | HTTP/HTTPS, FTP, SMTP, SSH | DNS, DHCP, 音视频, 在线游戏 |

### 三次握手
1. 客户端发送 SYN（seq=x）
2. 服务端回复 SYN+ACK（seq=y, ack=x+1）
3. 客户端发送 ACK（ack=y+1）

### 四次挥手
客户端发送 FIN -> 服务端回复 ACK -> 服务端发送 FIN -> 客户端回复 ACK。客户端需等待 2MSL 才进入 CLOSED 状态。

### 可靠性保障机制
序列号与确认应答、超时重传、流量控制（滑动窗口）、拥塞控制（慢启动、拥塞避免、快重传、快恢复）。
`,
    source: null,
  },
  HTTP: {
    category: "cs_basics",
    content: `##HTTP 核心要点

### 状态码
- **2xx** 成功：200 OK、201 Created、204 No Content
- **3xx** 重定向：301 Moved Permanently、302 Found、304 Not Modified
- **4xx** 客户端错误：400 Bad Request、401 Unauthorized、403 Forbidden、404 Not Found
- **5xx** 服务端错误：500 Internal Server Error、502 Bad Gateway、503 Service Unavailable

### HTTP/1.0 vs HTTP/1.1
| 特性 | HTTP/1.0 | HTTP/1.1 |
|------|----------|----------|
| 连接 | 短连接 | 长连接（持久连接） |
| 缓存 | If-Modified-Since, Expires | 增加 Entity tag, If-None-Match |
| 带宽 | 不支持范围请求 | 支持 Range 头（206 Partial Content） |
| Host 头 | 无 | 支持虚拟主机 |

### HTTP/2.0 vs HTTP/3.0
| 维度 | HTTP/2.0 | HTTP/3.0 |
|------|----------|----------|
| 传输协议 | TCP | QUIC（基于 UDP） |
| 连接建立 | 约 3 RTT（TCP + TLS） | 0-RTT 或 1-RTT |
| 队头阻塞 | TCP 层队头阻塞 | 独立数据流，降低阻塞 |
| 连接迁移 | 四元组改变失效 | 64 位 ID，网络切换不中断 |

### WebSocket vs HTTP
WebSocket 全双工通信，服务端可主动推送数据；HTTP 半双工，需客户端发起请求。
`,
    source: null,
  },

  // Database group
  MySQL: {
    category: "database",
    content: `##MySQL 核心要点

### MyISAM vs InnoDB
| 特性 | MyISAM | InnoDB |
|------|--------|--------|
| 行级锁 | 不支持（只有表锁） | 支持 |
| 事务 | 不支持 | 支持 ACID（默认 REPEATABLE-READ） |
| 外键 | 不支持 | 支持 |
| 崩溃恢复 | 不支持 | 支持（redo log） |
| MVCC | 不支持 | 支持 |

### 索引
- **B+Tree 索引**：InnoDB 和 MyISAM 都使用 B+Tree。非叶子节点只存键，扇出大、树矮（千万数据 3-4 层），范围查询高效。
- **聚簇索引**：InnoDB 的数据文件即索引（主键索引），叶子节点存完整行数据。
- **覆盖索引**：索引包含查询所需所有字段，无需回表。
- **联合索引最左前缀匹配**：从最左列开始匹配，遇到范围查询（>, <）停止。

### 事务
ACID 特性：原子性（undo log）、一致性、隔离性（MVCC + 锁）、持久性（redo log）。

### MVCC
多版本并发控制，通过隐藏字段（DB_TRX_ID、DB_ROLL_PTR）和 undo log 实现。REPEATABLE-READ 通过间隙锁（Next-Key Lock）防止幻读。
`,
    source: null,
  },
  Redis: {
    category: "database",
    content: `##Redis 核心要点

### 为什么快？
1. 纯内存操作（纳秒级 vs 磁盘毫秒级）
2. 单线程事件循环 + I/O 多路复用（避免上下文切换和锁竞争）
3. 优化的内部数据结构（根据数据大小动态选择编码：ziplist、quicklist、skiplist 等）
4. 简洁的 RESP 协议

### 5 种基础数据类型
String（二进制安全）、List（双向链表）、Set（无序唯一）、Hash（字段映射）、Zset（有序集合，基于跳表）。

### 特殊类型
HyperLogLog（基数统计，固定12KB，误差0.81%）、Bitmap（位图）、Geospatial（地理位置）。

### 持久化
- **RDB**：定时快照，文件紧凑，恢复快，但可能丢失数据。
- **AOF**：追加写命令，可每秒/每次写同步，数据可靠性高，文件大。

### Redis 6.0 多线程
- 仅网络 IO 读写使用多线程（解决 IO 瓶颈），命令执行仍是单线程。
- 配置：io-threads（默认禁用）。

### 过期删除策略
惰性删除（访问时检查） + 定期删除（每秒 hz 次，随机抽查 20 个 key）。

### 应用场景
缓存、分布式锁（Redisson）、限流（Redis + Lua）、消息队列（Stream）、排行版（Zset）、UV 统计（HyperLogLog）。
`,
    source: null,
  },
  事务: {
    category: "database",
    content: `##MySQL 事务要点

### ACID 特性
- **原子性**（Atomicity）：事务不可分割，全部成功或全部回滚。通过 undo log 实现回滚。
- **一致性**（Consistency）：事务前后数据满足所有约束。
- **隔离性**（Isolation）：并发事务之间互不干扰。通过 MVCC 和锁机制实现。
- **持久性**（Durability）：事务提交后对数据的修改永久保存。通过 redo log 保证崩溃恢复。

### 四种隔离级别
| 级别 | 脏读 | 不可重复读 | 幻读 |
|------|------|-----------|------|
| READ UNCOMMITTED | 可能 | 可能 | 可能 |
| READ COMMITTED | 不会 | 可能 | 可能 |
| REPEATABLE READ（InnoDB 默认） | 不会 | 不会 | 不会（Next-Key Lock 防幻读） |
| SERIALIZABLE | 不会 | 不会 | 不会 |

### MVCC 实现
通过隐藏字段 DB_TRX_ID（最后修改事务ID）和 DB_ROLL_PTR（回滚指针），结合 undo log 实现多版本并发控制。REPEATABLE-READ 通过间隙锁（Next-Key Lock = 行锁 + 间隙锁）防止幻读。

### 日志
- **redo log**：物理日志，保证事务持久性（WAL 机制）。
- **undo log**：逻辑日志，保证事务原子性和 MVCC。
- **binlog**：二进制日志，用于主从复制和数据恢复。
`,
    source: null,
  },

  // DevOps
  Docker: {
    category: "devops",
    content: `##Docker 核心概念

### 什么是容器？
容器是将软件打包成标准化单元，用于开发、交付和部署。容器镜像是轻量、可执行的独立软件包，包含代码、运行时、系统工具、库和设置。

### 容器 vs 虚拟机
| 特性 | 容器 | 虚拟机 |
|------|------|--------|
| 抽象层 | 应用层（虚拟化操作系统） | 物理硬件层 |
| 占用空间 | 小（镜像通常几十兆） | 大 |
| 启动速度 | 瞬间 | 缓慢（需启动完整 OS） |
| 内核 | 共享宿主机内核 | 每个 VM 包含完整 OS |
| 隔离性 | 进程级隔离 | 彻底隔离运行环境 |

### 三大基本概念
- **镜像（Image）**：特殊文件系统，分层存储（基于 Union FS），不可变。
- **容器（Container）**：镜像运行时的实体，本质是进程，运行于独立命名空间。删除容器存储层数据丢失，应使用数据卷（Volume）。
- **仓库（Repository）**：集中存放镜像的地方（如 Docker Hub）。

### Docker Compose
通过 YAML 文件配置多容器服务，一条命令 docker-compose up 启动所有服务。

### 核心技术
基于 Linux 内核的 CGroup（资源限制）和 namespace（命名空间隔离），以及 UnionFS（联合文件系统），实现操作系统层面的虚拟化。
`,
    source: null,
  },
  // K8s
  K8s: {
    category: "devops",
    content: `## Kubernetes 核心概念

> 来源：JavaGuide

### 核心架构
Kubernetes（K8s）是 Google 开源的容器编排平台，用于自动部署、扩展和管理容器化应用。

- **Master 组件**：API Server（集群入口）、Scheduler（调度 Pod）、Controller Manager（维护集群状态）、etcd（分布式键值存储）。
- **Node 组件**：kubelet（管理 Pod 生命周期）、kube-proxy（网络代理与负载均衡）、容器运行时（如 Docker/containerd）。

### 核心资源对象

| 资源 | 作用 |
|------|------|
| **Pod** | 最小调度单元，包含一个或多个共享网络的容器 |
| **Service** | 提供稳定的网络端点，通过 Label Selector 关联 Pod，实现负载均衡 |
| **Deployment** | 声明式更新 Pod 和 ReplicaSet，支持滚动更新和回滚 |
| **ConfigMap / Secret** | 配置管理，Secret 用 Base64 编码存储敏感信息 |
| **Ingress** | 七层负载均衡，将外部 HTTP/HTTPS 路由到集群内 Service |
| **Namespace** | 虚拟集群隔离，多租户支持 |

### kubectl 常用命令

\`\`\`bash
# 获取资源
kubectl get pods -n <namespace>
kubectl get deploy,svc --all-namespaces

# 排查排错
kubectl describe pod <name>
kubectl logs -f <pod-name>
kubectl exec -it <pod-name> -- /bin/sh

# 发布管理
kubectl apply -f deployment.yaml
kubectl rollout status deploy/<name>
kubectl rollout undo deploy/<name>
\`\`\`

### Pod 生命周期
Pending → Running → Succeeded/Failed → Unknown。Init 容器先于主容器启动；Readiness Probe 通过后才加入 Service 端点；Liveness Probe 失败则重启容器。

### 关键特性
- **自动恢复**：故障 Pod 自动重建，保证期望副本数。
- **水平扩缩**：HPA 根据 CPU/内存自动调整副本数。
- **服务发现**：DNS 解析 Service 名到 Cluster IP。
- **存储卷**：支持 emptyDir、hostPath、PVC、ConfigMap 等多种卷类型。`,
    source: "JavaGuide",
  },

  // React
  React: {
    category: "react",
    content: `## React 核心概念

> 来源：JavaGuide

### 虚拟 DOM（Virtual DOM）
虚拟 DOM 是真实 DOM 的 JavaScript 对象表示。当状态变化时，React 先在虚拟 DOM 上计算差异（Diffing），然后批量更新真实 DOM（Reconciliation），减少直接操作 DOM 的开销。

- **Diff 算法**：同级比较，类型不同则重建整个子树；key 属性优化列表 diff 性能。
- **Fiber 架构**（React 16+）：将协调过程拆分为可中断的工作单元，实现增量渲染，避免阻塞主线程。

### JSX
JSX 是 JavaScript 的语法扩展，最终被 Babel 编译为 React.createElement() 调用。JSX 中：
- 表达式用 {} 包裹
- 属性名采用驼峰命名（className, onClick 等）
- 行内样式接收对象而非字符串

### 组件生命周期（React 16.3+）

| 阶段 | 类组件方法 | Hook 替代 |
|------|-----------|-----------|
| 挂载 | constructor → render → componentDidMount | useEffect(fn, []) |
| 更新 | shouldComponentUpdate → render → componentDidUpdate | useEffect(fn, [deps]) |
| 卸载 | componentWillUnmount | useEffect(() => fn, []) 的返回函数 |

### 状态管理
- **useState**：函数组件内状态管理
- **useReducer**：复杂状态逻辑，类似 Redux 模式
- **Context API**：跨层级组件通信，避免 props drilling
- **外部状态库**：Redux（单一 store）、Zustand（轻量）、Jotai（原子化）

### 组件通信
- 父→子：Props
- 子→父：回调函数 Props
- 兄弟：提升状态到共同父组件
- 跨层级：Context API 或全局状态库`,
    source: "JavaGuide",
  },
  Hooks: {
    category: "react",
    content: `## React Hooks 详解

> 来源：JavaGuide

React 16.8 引入 Hooks，让函数组件拥有状态和副作用能力，不再需要类组件。

### 常用 Hooks

**useState** — 状态管理
\`\`\`jsx
const [count, setCount] = useState(0);
\`\`\`
- 参数为初始值，返回 [值, 更新函数] 数组
- 更新函数传入函数以基于旧值更新：setCount(prev => prev + 1)

**useEffect** — 副作用处理
\`\`\`jsx
useEffect(() => {
  // 副作用逻辑（订阅、请求、DOM 操作）
  return () => { /* 清理函数，组件卸载时执行 */ };
}, [dependencies]);
\`\`\`
- 依赖数组为空：仅在挂载和卸载时执行
- 依赖数组变化：每次依赖变化时执行旧清理 + 新副作用
- 无依赖数组：每次渲染后执行（不推荐）

**useContext** — 跨组件共享数据
\`\`\`jsx
const value = useContext(MyContext);
\`\`\`
- 避免 props drilling，配合 Context.Provider 使用

**useRef** — 引用 DOM 或保留可变值
\`\`\`jsx
const inputRef = useRef(null);
<input ref={inputRef} />;
\`\`\`
- 返回的 ref 对象在整个组件生命周期内保持不变
- 修改 .current 不会触发重新渲染

**useMemo / useCallback** — 性能优化
- useMemo 缓存计算结果，useCallback 缓存函数引用
- 仅在依赖变化时重新计算

### 自定义 Hooks
将组件逻辑提取为可复用的函数，以 use 开头：
\`\`\`jsx
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return width;
}
\`\`\`

### Hooks 规则
1. 只能在函数组件或自定义 Hook 顶层调用（不能在循环/条件/嵌套函数中）
2. 只能在 React 函数组件或自定义 Hook 中调用`,
    source: "JavaGuide",
  },

  // AI Agent
  Agent: {
    category: "agent",
    content: `## AI Agent 核心概念

> 来源：JavaGuide

### 什么是 Agent？
AI Agent（智能体）是一种能够**感知环境、制定规划、执行行动**的智能系统。与传统 LLM 的一次性问答不同，Agent 可以自主完成多步骤任务。

### 感知-规划-行动循环

1. **感知（Perception）**：从环境中获取信息——用户输入、传感器数据、API 返回、工具结果等。
2. **规划（Planning）**：基于当前状态和目标，制定行动方案。常用方法：
   - **ReAct**（Reasoning + Acting）：交替推理和行动，将思考过程记录为 Chain-of-Thought。
   - **Plan-and-Solve**：先制定完整计划，再逐一执行。
   - **Tree-of-Thoughts**：探索多条推理路径，评估最优选择。
3. **行动（Action）**：执行具体操作，如调用 API、运行代码、查询数据库、发送消息等。行动结果反馈到感知，形成闭环。

### 工具使用（Tool Use）
Agent 通过调用外部工具扩展能力边界：
- **Function Calling**：LLM 输出结构化 JSON，触发预注册的函数调用来完成任务（如天气查询、文件操作）。
- **代码解释器**：执行 Python/JS 代码处理计算和数据分析。
- **RAG 检索**：从外部知识库获取实时信息补充上下文。
- **Web 搜索**：获取最新互联网信息。

### Agent 关键能力
- **记忆（Memory）**：短期（会话上下文）和长期（向量数据库持久化）。
- **自我反思（Self-reflection）**：评估行动结果，调整策略，迭代改进。`,
    source: "JavaGuide",
  },
  "Multi-Agent": {
    category: "agent",
    content: `## 多 Agent 协作

> 来源：JavaGuide

### 为什么需要多 Agent？
单个 Agent 在处理复杂任务时面临上下文窗口限制、专业知识不足、缺乏分工协作等瓶颈。多 Agent 系统通过多个专门 Agent 的协同配合，提升整体能力和鲁棒性。

### 多 Agent 协作模式

| 模式 | 描述 | 代表案例 |
|------|------|---------|
| 主从模式 | 一个 Orchestrator Agent 协调多个 Worker Agent | AutoGen、CrewAI |
| 辩论模式 | 多个 Agent 对同一问题辩论，互相质疑和修正 | ChatDev（程序员+审查员） |
| 管道模式 | 任务拆分为多个步骤，每个步骤由专门 Agent 处理 | 代码生成（设计→编码→测试→部署） |
| 分层模式 | Agent 按层级组织，上层 Agent 向下层分配子任务 | 组织架构模拟 |

### 通信协议

- **消息队列**：通过消息中间件异步通信，解耦 Agent 节点。
- **共享记忆**：所有 Agent 读写共享向量数据库或结构化存储。
- **函数调用**：Agent 之间通过标准 API 互相调用服务。
- **结构化对话**：预定义通信格式（JSON/Protocol Buffers），确保消息解析一致性。

### 角色分工设计

典型的多 Agent 系统包含以下角色：
- **Orchestrator（协调者）**：任务解析、拆解和调度，汇总最终结果。
- **Searcher（搜索者）**：检索知识库、网络搜索、收集信息。
- **Coder（编码者）**：编写和调试代码。
- **Reviewer（审查者）**：代码审查、质量检测、安全审计。
- **Planner（规划者）**：长期规划、依赖管理和资源分配。

### 挑战
- **幻觉传播**：一个 Agent 的错误可能被其他 Agent 采纳放大。
- **通信开销**：Agent 间消息量随数量平方增长。
- **收敛困难**：多轮辩论难以达成一致。`,
    source: "JavaGuide",
  },

  // AI basics
  LLM: {
    category: "ai",
    content: `## 大型语言模型（LLM）核心概念

> 来源：JavaGuide

### 什么是 LLM？
大型语言模型（Large Language Model）是基于 Transformer 架构、在海量文本上预训练的深度学习模型，能够理解和生成自然语言。典型代表：GPT-4、Claude、Gemini、DeepSeek 等。

### Transformer 架构核心

Transformer 的核心是**自注意力机制（Self-Attention）**：

1. **Attention（缩放点积注意力）**：对输入序列每个位置计算与其他位置的关联权重。
   - Query（Q）、Key（K）、Value（V）三个向量矩阵
   - Attention(Q,K,V) = softmax(QK^T / √d_k) × V
   - √d_k 缩放因子防止梯度消失

2. **Multi-Head Attention**：多头并行计算注意力，捕获不同子空间信息。

3. **位置编码**：因 Self-Attention 无顺序感知，需注入位置信息（Sinusoidal 位置编码或可学习位置嵌入）。

4. **FFN（前馈神经网络）**：每个 Attention 层后接两层全连接网络（ReLU/GELU 激活）。

5. **残差连接 + 层归一化**：缓解深层网络梯度消失，加速训练。

### 训练流程

1. **预训练（Pre-training）**：在海量无标注语料上通过自监督学习训练，学习语言知识和世界知识。损失函数为下一个 Token 预测（Autoregressive LM）。

2. **指令微调（Instruction Tuning）**：在高质量的指令-回答数据上微调，让模型学会遵循人类指令。

3. **RLHF（基于人类反馈的强化学习）**：
   - SFT（监督微调）→ RM（训练奖励模型）→ PPO（强化学习优化策略）
   - 让模型输出更符合人类偏好（有用、诚实、无害）

### 关键参数
- **Context Window**：模型一次能处理的最大 Token 数（GPT-4 128K, Claude 200K）。
- **Temperature**：控制输出随机性，越低越确定，越高越多样。
- **Top-p / Top-k**：采样策略，控制生成质量。`,
    source: "JavaGuide",
  },
  RAG: {
    category: "ai",
    content: `## 检索增强生成（RAG）

> 来源：JavaGuide

### 什么是 RAG？
检索增强生成（Retrieval-Augmented Generation）是一种将信息检索与 LLM 生成相结合的技术范式。在回答问题时，先从外部知识库检索相关文档片段，再将检索结果作为上下文输入给 LLM 生成答案。

### 为什么需要 RAG？
- **解决知识过时**：LLM 训练数据有截止日期，RAG 可引入实时知识。
- **缓解幻觉**：基于检索到的真实文档回答，减少编造。
- **引入私有知识**：企业文档、产品手册等非公开数据可注入 RAG 系统。
- **可溯源**：答案可追溯到具体文档，提升可信度。

### RAG 核心流程

1. **索引阶段**
   - **文档切分（Chunking）**：将长文档切分为合适大小的片段（通常 256-1024 token）。
   - **向量化**：使用 Embedding 模型将每个 Chunk 转为向量。
   - **存储**：将向量存入向量数据库（Milvus、Pinecone、Chroma、Weaviate）。

2. **检索阶段**
   - **查询向量化**：将用户问题使用相同 Embedding 模型向量化。
   - **相似度搜索**：在向量数据库中检索 Top-K 最相似 Chunk（余弦相似度或欧式距离）。

3. **生成阶段**
   - **拼接 Prompt**：将检索到的 Chunk 作为上下文 + 用户问题组成 Prompt。
   - **LLM 生成**：大模型基于上下文回答问题。

### 关键优化策略

| 策略 | 说明 |
|------|------|
| **分块策略** | 滑动窗口/语义分割/层级分块，保持语义完整性 |
| **混合检索** | 向量相似度 + BM25 关键词检索互补 |
| **重排序（Rerank）** | 检索后用小模型对结果二次排序 |
| **HyDE** | 用 LLM 生成假设文档后再检索 |
| **多路召回** | 从多个不同知识源并发检索后融合 |
| **查询改写** | 对模糊问题重写后再检索 |

### 向量数据库选型

| 数据库 | 特点 |
|--------|------|
| Milvus | 分布式、高可用、适合生产 |
| Chroma | 轻量嵌入式，适合原型开发 |
| Pinecone | 全托管云服务 |
| Weaviate | 支持混合搜索和 GraphQL |`,
    source: "JavaGuide",
  },

  // Frontend
  JavaScript: {
    category: "frontend",
    content: `## JavaScript 核心要点

> 来源：JavaGuide

### 原型与原型链
JavaScript 通过原型链实现继承：
- 每个对象有一个 __proto__ 隐式原型指向其构造函数的 prototype。
- 属性查找沿原型链向上搜索，直到找到或到达 null（Object.prototype.__proto__ = null）。
- \`\`\`js
  function Person(name) { this.name = name; }
  Person.prototype.sayHello = function() { console.log('Hello'); };
  const p = new Person('Alice');
  // p → Person.prototype → Object.prototype → null
  \`\`\`

### 闭包（Closure）
函数访问其外部作用域中变量的能力，即使外部函数已执行完毕。
- 用途：数据私有化、创建模块、防抖节流、柯里化。
- 注意：不当使用闭包会导致内存泄漏（引用的对象无法 GC）。

### 事件循环（Event Loop）
JavaScript 是单线程语言，通过事件循环实现异步：
1. **调用栈（Call Stack）**：执行同步代码。
2. **任务队列（Task Queue）**：宏任务（setTimeout、setInterval、I/O）放入宏任务队列，微任务（Promise.then、MutationObserver、queueMicrotask）放入微任务队列。
3. **执行顺序**：调用栈清空 → 执行所有微任务 → 取一个宏任务执行 → 重复。

\`\`\`js
console.log(1);                // 同步
setTimeout(() => console.log(2), 0);  // 宏任务
Promise.resolve().then(() => console.log(3));  // 微任务
console.log(4);                // 同步
// 输出：1, 4, 3, 2
\`\`\`

### ES6+ 核心特性

| 特性 | 说明 |
|------|------|
| let / const | 块级作用域，无变量提升（暂时性死区） |
| 箭头函数 | 无 this 绑定、无 arguments、不能作构造函数 |
| 解构赋值 | const { a, b } = obj; const [x, y] = arr; |
| 模板字面量 | 反引号 + \${expression} |
| Promise | 异步编程终极方案，链式调用 then/catch |
| async/await | 基于 Promise 的语法糖，使异步代码同步化 |
| 模块（ES Module） | import/export，静态分析支持 tree-shaking |
| 展开运算符 | ... 展开数组/对象，替代 apply/concat/assign |
| Map / Set | 比 Object 更适合作为字典/集合 |
| Symbol | 唯一值，用于私有属性名 |
| Proxy | 拦截对象操作，Vue 3 响应式基础 |`,
    source: "JavaGuide",
  },
  CSS: {
    category: "frontend",
    content: `## CSS 核心要点

> 来源：JavaGuide

### 盒模型（Box Model）
每个元素由 content（内容）→ padding（内边距）→ border（边框）→ margin（外边距）组成。

- **content-box**（默认）：width/height 只包含 content，实际占位 = width + padding + border。
- **border-box**（推荐）：width/height 包含 content + padding + border，布局更易计算。
\`\`\`css
*, *::before, *::after { box-sizing: border-box; }
\`\`\`

### Flexbox 布局
一维布局模型，适合行/列方向的排列。

**容器属性**：
- display: flex → 启用 Flex 布局
- flex-direction: row | column | row-reverse | column-reverse
- justify-content: flex-start | center | space-between | space-around | space-evenly（主轴对齐）
- align-items: stretch | center | flex-start | flex-end | baseline（交叉轴对齐）
- flex-wrap: wrap | nowrap（是否换行）
- gap: 10px（子项间距）

**子项属性**：
- flex: 1 → flex-grow: 1, flex-shrink: 1, flex-basis: 0%
- align-self → 覆盖容器的 align-items
- order → 调整显示顺序

### Grid 布局
二维布局模型，同时控制行和列。

\`\`\`css
.container {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;  /* 三列，中间两倍宽 */
  grid-template-rows: auto 200px;
  gap: 16px;
}
\`\`\`

- fr 单位：剩余空间按比例分配
- repeat(3, 1fr) → 重复三列均分
- grid-area / grid-column / grid-row → 元素占据指定网格区域

### 定位（Position）

| 值 | 参考对象 | 是否脱离文档流 |
|------|---------|:------------:|
| static | 不适用（默认） | 否 |
| relative | 自身原始位置 | 否（保留占位） |
| absolute | 最近的非 static 祖先元素 | 是 |
| fixed | 视口（viewport） | 是 |
| sticky | 滚动容器 + 阈值 | 混合 |

### 响应式设计

1. **媒体查询（Media Queries）**：
   \`\`\`css
   @media (max-width: 768px) { /* 移动端样式 */ }
   @media (min-width: 1024px) { /* 桌面端样式 */ }
   \`\`\`

2. **相对单位**：rem（根元素字体大小）、em（父元素字体大小）、vh/vw（视口百分比）、%（父元素百分比）。

3. **移动优先**：先写移动端样式（基础），再用 min-width 媒体查询渐进增强。

### 层叠与继承
- **层叠**：选择器权重决定样式优先级，!important > 内联 > ID > 类/属性/伪类 > 元素/伪元素。
- **继承**：部分属性（color、font、line-height）自动继承父元素。`,
    source: "JavaGuide",
  },

  // Java detailed topics
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
  类加载: {
    category: "java_advanced",
    content: `## 类加载机制

> 来源：《深入理解 Java 虚拟机》

### 类加载的七个阶段

\`\`\`
加载 → 验证 → 准备 → 解析 → 初始化 → 使用 → 卸载
\`\`\`

1. **加载（Loading）**：通过全限定类名获取类的二进制字节流，将其转化为方法区运行时数据结构，在堆中生成 Class 对象。
2. **验证（Verification）**：确保字节流符合 JVM 规范（文件格式、元数据、字节码、符号引用验证）。
3. **准备（Preparation）**：为类变量（static）在方法区分配内存并设零值（如 int=0，引用=null，final static 直接赋值）。
4. **解析（Resolution）**：将常量池中的符号引用替换为直接引用（指向内存地址的指针）。
5. **初始化（Initialization）**：执行类构造器 <clinit>() 方法，按代码顺序赋值 static 变量和 static 块。
6. **使用**：对象实例化和调用。
7. **卸载**：类被 GC 回收（需满足三个条件：所有实例被回收、ClassLoader 被回收、无反射引用）。

### 双亲委派模型

\`\`\`
启动类加载器（Bootstrap ClassLoader）
    ↕
扩展类加载器（Extension ClassLoader）
    ↕
应用类加载器（Application ClassLoader）
\`\`\`

**工作原理**：
- 自底向上检查类是否已加载（findLoadedClass）。
- 自顶向下尝试加载（父加载器加载失败才轮到子加载器）。

**优势**：
- 避免核心 API 被篡改（如用户自定义 java.lang.String 不会被加载）。
- 保证 Java 类库的安全性。

**破坏双亲委派**：
- 继承 ClassLoader 并重写 loadClass() 方法。
- 典型场景：Tomcat 的 WebAppClassLoader（优先加载 Web 应用类）、SPI 机制（ServiceLoader 使用线程上下文类加载器）。`,
    source: "JavaGuide",
  },
  JMM: {
    category: "java_advanced",
    content: `## Java 内存模型（JMM）

> 来源：《深入理解 Java 虚拟机》

### 什么是 JMM？
JMM（Java Memory Model）是一种规范，定义了多线程程序中共享变量的访问规则，保证并发场景下的可见性、有序性和原子性。

### 主存与工作内存
- **主内存**：所有线程共享，存储所有变量（实例字段、静态字段、数组元素）。
- **工作内存**：每个线程私有，存储从主内存拷贝的变量副本。

线程不能直接操作主内存，必须先将变量从主内存拷贝到工作内存，修改后再写回主内存。

### happens-before 原则
如果两个操作满足 happens-before 关系，则前一个操作的结果对后一个操作可见。

**关键规则**：
1. **程序顺序规则**：线程内每个操作 happens-before 后续操作。
2. **volatile 规则**：volatile 变量的写 happens-before 后续对该变量的读。
3. **锁规则**：解锁 happens-before 后续的加锁。
4. **传递性**：A happens-before B, B happens-before C → A happens-before C。
5. **start 规则**：线程 start() happens-before 该线程的任何操作。
6. **join 规则**：线程的所有操作 happens-before 其他线程对该线程的 join() 返回。

### 三大特性

| 特性 | 定义 | 保障机制 |
|------|------|---------|
| **原子性** | 一个或多个操作不可分割 | 基本类型读写（除 long/double）、synchronized、Lock、Atomic 类 |
| **可见性** | 一个线程修改共享变量，其他线程能立即看到 | volatile、synchronized（解锁前刷新到主存）、final |
| **有序性** | 程序按代码顺序执行 | volatile（禁止指令重排）、synchronized（同一锁串行执行）、happens-before 规则 |

### 指令重排序
编译器和处理器为优化性能对指令重新排序，但必须遵守 **as-if-serial 语义**（单线程内不影响结果）。

**内存屏障**（Memory Barrier）：
- LoadLoad：禁止读-读重排序。
- StoreStore：禁止写-写重排序。
- LoadStore：禁止读-写重排序。
- StoreLoad：禁止写-读重排序（最重开销最大，volatile 写插入）。`,
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

  // Additional lowercase tags for match reliability
  jvm: {
    category: "java_advanced",
    content: `## JVM 核心知识点概览

### JVM 运行时数据区域
- **程序计数器**（线程私有）：指向当前线程执行的字节码行号地址。
- **Java 虚拟机栈**（线程私有）：每个方法对应一个栈帧，存储局部变量表、操作数栈、动态链接和方法出口。
- **本地方法栈**（线程私有）：为 native 方法服务，HotSpot 中与 Java 虚拟机栈合二为一。
- **堆**（线程共享）：存放对象实例，GC 主要作用的区域。分为新生代（Eden + Survivor）和老年代。
- **方法区/元空间**（线程共享）：存储类信息、常量、静态变量。JDK 8+ 用元空间（本地内存）替代永久代。

### 垃圾回收
- 判断对象存活：引用计数法（无法解决循环引用）和可达性分析（从 GC Roots 出发）。
- 引用类型：强引用（永不回收）、软引用（内存不足回收）、弱引用（下次 GC 回收）、虚引用（跟踪回收）。
- 垃圾收集算法：标记-清除（有碎片）、标记-复制（无碎片但浪费空间）、标记-整理（无碎片但效率低）。
- 常见垃圾收集器：G1（JDK 9+ 默认）、ZGC（暂停 < 几毫秒）、CMS（JDK 14 移除）。

### 类加载机制
- 七个阶段：加载 → 验证 → 准备 → 解析 → 初始化 → 使用 → 卸载。
- 双亲委派模型：启动类加载器 → 扩展类加载器 → 应用类加载器。自底向上检查，自顶向下加载。
`,
    source: "JavaGuide",
  },
  concurrency: {
    category: "java_advanced",
    content: `## 并发编程核心知识点概览

### 线程基础
- Java 线程在 JDK 1.2 后基于原生线程（Native Threads）实现，一对一映射到内核线程。
- 六种状态：NEW → RUNNABLE → BLOCKED / WAITING / TIMED_WAITING → TERMINATED。
- sleep() 不释放锁，自动苏醒；wait() 释放锁，需 notify/notifyAll 唤醒。

### synchronized
- 修饰实例方法锁 this，修饰静态方法锁 Class 对象，修饰代码块锁指定对象。
- 底层原理：同步语句块使用 monitorenter + monitorexit 字节码指令。
- 锁升级（JDK 6+）：无锁 → 偏向锁 → 轻量级锁 → 重量级锁（不可降级）。

### volatile
- 保证可见性：每次使用从主存读取，写操作立即刷新到主存。
- 禁止指令重排序：通过插入内存屏障（StoreStore、StoreLoad、LoadLoad、LoadStore）实现。
- 不保证原子性：复合操作（如 i++）需使用 synchronized 或 AtomicInteger。

### CAS（Compare And Swap）
- 三个操作数：V（更新变量）、E（预期值）、N（新值）。
- 乐观锁实现，非阻塞，失败后自旋重试。
- 问题：ABA、长时间自旋浪费 CPU、只能保证单个变量的原子操作。

### AQS（AbstractQueuedSynchronizer）
- JUC 的基石，为 ReentrantLock、Semaphore、CountDownLatch 等同步器提供框架。
- 核心：volatile int state + CLH FIFO 队列，通过 CAS 修改 state。

### 线程池
- 核心参数：corePoolSize、maximumPoolSize、keepAliveTime、workQueue、threadFactory、handler。
- 处理流程：核心线程 → 任务队列 → 最大线程 → 拒绝策略。
- 不推荐 Executors 工具类（可能 OOM），推荐 ThreadPoolExecutor 构造函数。
`,
    source: "JavaGuide",
  },

  // === NEW ENTRIES (Java Basic) ===
  数组: {
    category: "java_basic",
    content: `## 数组（Array）

> 来源：JavaGuide

### 数组概述
数组是存储固定大小同类型元素的容器，数组对象在堆上分配，数组长度不可变。

### 声明与初始化
\`\`\`java
// 声明
int[] arr;          // 推荐
int arr[];          // 不推荐（C 风格）

// 初始化
int[] a = new int[5];        // 默认值 0
int[] b = new int[]{1,2,3};  // 显式
int[] c = {1,2,3};           // 简写（仅声明时可用）
\`\`\`

### 特点
- 数组是对象，使用前必须初始化（分配内存）。
- length 是属性而非方法。
- 默认值：数值类型 0，boolean false，char '\\\\u0000'，引用类型 null。

### 多维数组
\`\`\`java
int[][] matrix = new int[3][4];          // 矩形数组
int[][] ragged = new int[3][];           // 不规则数组
ragged[0] = new int[2];
ragged[1] = new int[4];
\`\`\`
- Java 中多维数组本质是数组的数组。

### Arrays 工具类
| 方法 | 说明 |
|------|------|
| sort() | 排序（Dual-Pivot Quicksort） |
| binarySearch() | 二分查找（需先排序） |
| fill() | 填充值 |
| copyOf() / copyOfRange() | 数组拷贝 |
| equals() / deepEquals() | 比较（deep 用于多维） |
| toString() / deepToString() | 转字符串 |
| asList(T...) | 转为 List（固定大小，不支持 add/remove） |
| stream() | Java 8+ 转为 Stream |
`,
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

  // === NEW ENTRIES (Java Advanced) ===
  异步: {
    category: "java_advanced",
    content: `## 异步编程（Asynchronous）

> 来源：JavaGuide

### Future 与 Callable
- **Callable**：与 Runnable 类似，但可以返回结果和抛出异常。
- **Future**：表示异步计算的结果。get() 阻塞直到获取结果，cancel() 取消任务。
- **FutureTask**：同时实现 Runnable 和 Future，可作为任务提交到线程池。

\`\`\`java
ExecutorService executor = Executors.newFixedThreadPool(2);
Future<Integer> future = executor.submit(() -> {
  Thread.sleep(1000);
  return 42;
});
Integer result = future.get();  // 阻塞等待结果
\`\`\`

### CompletableFuture（Java 8+）
CompletableFuture 是 Java 8 引入的函数式异步编程工具，支持异步任务的编排和组合。

\`\`\`java
CompletableFuture.supplyAsync(() -> fetchData())
  .thenApply(data -> process(data))
  .thenAccept(result -> save(result))
  .exceptionally(ex -> { log.error(ex); return null; });
\`\`\`

**常用方法**：
| 方法 | 说明 |
|------|------|
| supplyAsync() / runAsync() | 异步执行（默认 ForkJoinPool.commonPool()） |
| thenApply() / thenAccept() | 串行转换/消费 |
| thenCompose() | 扁平化组合（避免嵌套 Future） |
| thenCombine() | 合并两个 Future 结果 |
| allOf() / anyOf() | 等待所有/任意任务完成 |
| exceptionally() | 异常恢复 |
| complete() / completeExceptionally() | 手动完成 |

### ForkJoinPool
- Java 7 引入的工作窃取线程池，适合分治任务。
- 任务拆分为子任务（fork），等待子任务结果（join）。
- 每个工作线程有双端队列，空闲线程可"窃取"其他队列尾部的任务。
`,
    source: "JavaGuide",
  },
  Java8: {
    category: "java_advanced",
    content: `## Java 8 / JDK 新特性

> 来源：JavaGuide

### Java 8 核心新特性

| 特性 | 说明 |
|------|------|
| **Lambda 表达式** | 函数式编程，将函数作为参数传递 |
| **Stream API** | 集合流水线操作，支持并行处理 |
| **函数式接口** | @FunctionalInterface，四大核心接口 |
| **Optional** | 优雅处理空值，减少 NPE |
| **CompletableFuture** | 异步编程编排 |
| **新日期时间 API** | LocalDate / LocalTime / LocalDateTime |
| **接口默认/静态方法** | default 和 static 方法 |
| **方法引用** | :: 操作符，简化 Lambda |
| **Nashorn JavaScript 引擎** | 在 JVM 运行 JS（JDK 15 移除） |

### 日期时间 API（java.time）
- **LocalDate**：日期（2024-01-15），不可变。
- **LocalTime**：时间（14:30:00），不可变。
- **LocalDateTime**：日期+时间。
- **Instant**：时间戳（纳秒精度）。
- **Duration / Period**：时间间隔/日期间隔。
- **DateTimeFormatter**：线程安全的格式化和解析。

### JDK 9-17 重要特性
| 版本 | 特性 |
|------|------|
| JDK 9 | 模块化系统（JPMS）、JShell、Collection 工厂方法（List.of()） |
| JDK 10 | 局部变量类型推断（var） |
| JDK 11 | HttpClient 标准化、String.lines() / repeat() |
| JDK 12-13 | Switch 表达式（预览） |
| JDK 14 | Records（预览）、Pattern Matching for instanceof |
| JDK 15 | Text Blocks、ZGC 正式版 |
| JDK 16 | Records 正式版、密封类（预览） |
| JDK 17（LTS） | 密封类正式版、FP16 浮点 |
`,
    source: "JavaGuide",
  },
  分布式: {
    category: "java_advanced",
    content: `## 分布式系统基础

> 来源：JavaGuide

### 什么是分布式系统？
分布式系统是由多台计算机通过网络通信协作完成任务的系统，对外表现为一个整体。

### CAP 定理
分布式系统只能同时满足以下三个中的两个：
| 特性 | 说明 |
|------|------|
| **C**（一致性） | 所有节点同一时刻看到相同数据 |
| **A**（可用性） | 每次请求都能获得正常响应 |
| **P**（分区容错） | 网络分区时系统仍能工作 |

- CP 系统（ZooKeeper、etcd）：牺牲可用性保证一致性。
- AP 系统（Eureka、Cassandra）：牺牲一致性保证可用性。
- CA 系统：实际不存在（网络分区必然发生）。

### BASE 理论
- **Basically Available**（基本可用）：允许部分功能降级。
- **Soft State**（软状态）：允许中间状态。
- **Eventually Consistent**（最终一致性）：经过一段时间数据趋于一致。

### 常见分布式技术
| 领域 | 技术 |
|------|------|
| 服务发现 | ZooKeeper、Eureka、Nacos、Consul |
| 配置中心 | Apollo、Nacos Config |
| 分布式锁 | Redis Redisson、ZooKeeper |
| 消息队列 | Kafka、RocketMQ、RabbitMQ |
| 分布式事务 | Seata（AT/TCC/Saga）、2PC/3PC |
| 负载均衡 | Nginx、Spring Cloud Gateway |
| 远程调用 | Dubbo、gRPC、Feign |
`,
    source: "JavaGuide",
  },
  安全: {
    category: "java_advanced",
    content: `## Java 安全基础

> 来源：JavaGuide

### 常见安全漏洞

**SQL 注入**：拼接 SQL 字符串导致攻击者注入恶意 SQL。
- 防御：使用 PreparedStatement（参数化查询）、MyBatis #{} 占位符。

**XSS（跨站脚本）**：攻击者在页面注入恶意脚本。
- 防御：输出编码（HTML Entity）、Content-Security-Policy 头。

**CSRF（跨站请求伪造）**：利用用户已登录状态发起恶意请求。
- 防御：CSRF Token、SameSite Cookie 属性、验证 Referer。

**SSRF（服务端请求伪造）**：服务端发起请求时被引导访问内网资源。
- 防御：白名单 URL、禁用协议（file://）、内网地址过滤。

**敏感信息泄露**：密码、密钥、Token 硬编码在代码中。
- 防御：环境变量、配置中心（Nacos）、密钥管理（Vault）、.gitignore。

### 认证与授权
- **认证（Authentication）**：验证身份（你是谁）。常见：JWT、Session-Cookie、OAuth2、SSO。
- **授权（Authorization）**：验证权限（你能做什么）。常见：RBAC（基于角色）、ABAC（基于属性）。

### Spring Security 基础
- 认证过滤器链：UsernamePasswordAuthenticationFilter → BasicAuthenticationFilter → ... 
- 常见配置：formLogin()、oauth2Login()、csrf().disable()（需谨慎）。
- BCryptPasswordEncoder：推荐密码加密方式，自动加盐。
`,
    source: "JavaGuide",
  },

  // === NEW ENTRIES (Algorithm) ===
  哈希: {
    category: "algorithm",
    content: `## 哈希表（Hash Table）

> 来源：JavaGuide

### 什么是哈希？
哈希表通过哈希函数将键映射到存储位置，实现 O(1) 的平均查找/插入/删除时间。

### 哈希函数
将任意大小的输入映射到固定大小的输出（哈希值）。好的哈希函数应：
- 均匀分布：减少碰撞。
- 计算快速。
- 确定性：相同输入产生相同哈希。

### 哈希冲突处理
| 方法 | 说明 | 优缺点 |
|------|------|--------|
| **链地址法** | 每个桶存储链表/红黑树 | 简单，最常用（HashMap） |
| **开放地址法** | 冲突后找下一个空位（线性探测/二次探测/双重哈希） | 空间利用率高，删除复杂 |
| **再哈希法** | 使用多个哈希函数 | 计算开销大 |
| **公共溢出区** | 冲突元素放入溢出表 | 简单，额外空间 |

### 负载因子与扩容
- 负载因子 = 元素数量 / 桶数量。
- 负载因子越大，碰撞概率越高，性能下降。
- HashMap 默认负载因子 0.75，超过时扩容为 2 倍并 rehash。

### 一致性哈希
分布式场景下，一致性哈希将哈希值空间组织成环，减少节点增减时的数据迁移量。引入虚拟节点解决分布不均。
`,
    source: "JavaGuide",
  },
  排序: {
    category: "algorithm",
    content: `## 排序算法

> 来源：JavaGuide

### 排序算法对比

| 算法 | 平均时间 | 最坏时间 | 空间 | 稳定 |
|------|---------|---------|:----:|:----:|
| 冒泡排序 | O(n²) | O(n²) | O(1) | ✅ |
| 选择排序 | O(n²) | O(n²) | O(1) | ❌ |
| 插入排序 | O(n²) | O(n²) | O(1) | ✅ |
| 希尔排序 | O(n^1.3) | O(n²) | O(1) | ❌ |
| 归并排序 | O(n log n) | O(n log n) | O(n) | ✅ |
| 快速排序 | O(n log n) | O(n²) | O(log n) | ❌ |
| 堆排序 | O(n log n) | O(n log n) | O(1) | ❌ |
| 计数排序 | O(n+k) | O(n+k) | O(k) | ✅ |
| 桶排序 | O(n+k) | O(n²) | O(n) | ✅ |
| 基数排序 | O(d*(n+k)) | O(d*(n+k)) | O(n+k) | ✅ |

### 快速排序（Java Arrays.sort() 默认）
- 分治思想：选基准（pivot），小于 pivot 放左边，大于放右边，递归排序两边。
- 优化：三数取中、随机 pivot、小数组切换插入排序（Java 中阈值 47）。
- 最坏 O(n²)：数组已有序且选最左为 pivot。

### 归并排序
- 分治思想：不断二分，两两合并有序数组。
- 空间 O(n)：需要额外数组存储合并结果。
- Java 中 Arrays.sort(Object[]) 使用归并排序（TimSort — 优化版归并 + 插入）。

### 选择依据
- 数据量小（<50）：插入排序。
- 数据量大、需稳定：归并排序。
- 数据量大、不要求稳定：快速排序。
- 数据范围有限：计数排序（O(n)）。
`,
    source: "JavaGuide",
  },
  树: {
    category: "algorithm",
    content: `## 树（Tree）数据结构

> 来源：JavaGuide

### 基本概念
- **节点**：树的组成单元，根节点无父节点，叶子节点无子节点。
- **度**：节点拥有的子树数。
- **深度/高度**：根节点深度为 0，叶子节点高度为 0。
- **二叉树**：每个节点最多有两个子节点（左/右）。

### 二叉树的遍历
| 方式 | 顺序 | 用途 |
|------|------|------|
| 前序遍历 | 根→左→右 | 复制树 |
| 中序遍历 | 左→根→右 | 二叉搜索树排序输出 |
| 后序遍历 | 左→右→根 | 删除树、计算树大小 |
| 层序遍历 | 逐层从左到右 | 广度优先搜索 |

### 二叉搜索树（BST）
- 左子树所有节点 < 根节点 < 右子树所有节点。
- 查找/插入/删除平均 O(log n)，最坏 O(n)（倾斜树）。

### 平衡二叉树
| 类型 | 规则 | 平衡因子 |
|------|------|---------|
| **AVL 树** | 任意节点左右子树高度差 ≤ 1 | 高度差 |
| **红黑树** | 5 条规则（根黑、叶黑、红不连、黑同路） | 颜色约束 |

- 红黑树应用广泛：TreeMap、TreeSet、JDK 8+ HashMap 的树化。
- AVL 树比红黑树更严格平衡，查找更快但插入/删除更慢。

### B 树与 B+ 树
- **B 树**：多路搜索树，每个节点可包含多个键值，适合磁盘存储。
- **B+ 树**：B 树的变体，非叶子节点只存键，叶子节点存数据且用链表连接。MySQL InnoDB 索引结构。
`,
    source: "JavaGuide",
  },

  // === NEW ENTRIES (Algorithm - Extended) ===
  数组: {
    category: "algorithm",
    content: `## 数组（Array）

> 来源：LeetCode 官方题解 & 算法导论

### 基本操作
- **随机访问**：通过索引可在 O(1) 时间内访问任意元素。
- **插入**：在数组中间插入需移动后续所有元素，平均 O(n)。
- **删除**：同插入，需移动后续元素。
- **Java 中的数组**：int[] arr = new int[n]；默认值为 0/0.0/false。

### 二维数组
- 即数组的数组，常用于矩阵操作、动态规划。
- 遍历方式：先行后列（行优先）通常比先列后行更缓存友好。

### 前缀和（Prefix Sum）
- **定义**：pre[i] = nums[0] + nums[1] + ... + nums[i-1]
- **用途**：快速求子数组和 sum[l..r] = pre[r+1] - pre[l]
- 时间复杂度：预处理 O(n)，查询 O(1)。
- 典型题目：区域和检索 - 数组不可变、和为 K 的子数组。

### 差分数组（Difference Array）
- **定义**：diff[i] = nums[i] - nums[i-1]（i ≥ 1），diff[0] = nums[0]
- **用途**：对区间 [l, r] 同时加 val → diff[l] += val, diff[r+1] -= val
- 对差分数组求前缀和即可还原原数组。
- 典型题目：航班预订统计、拼车。
`,
    source: "LeetCode 官方题解 & 算法导论",
  },
  栈: {
    category: "algorithm",
    content: `## 栈（Stack）

> 来源：LeetCode 官方题解 & 算法导论

### 栈的特性
- **后进先出（LIFO, Last In First Out）**：最后入栈的元素最先出栈。
- 主要操作：push（入栈）、pop（出栈）、peek（查看栈顶元素）。
- Java 中推荐使用 ArrayDeque 替代 Stack（Stack 继承自 Vector，性能较差）。

### 应用场景
| 场景 | 示例 |
|------|------|
| 括号匹配 | 检查括号是否成对 |
| 表达式求值 | 中缀转后缀、计算器 |
| 函数调用栈 | 递归调用模拟 |
| 单调栈 | 接雨水、下一个更大元素 |
| 撤销操作 | 编辑器 Undo 功能 |

### 单调栈（Monotonic Stack）
- 栈内元素保持单调递增或递减。
- **递增单调栈**：找到下一个更小的元素（栈底到栈顶递增）。
- **递减单调栈**：找到下一个更大的元素（栈底到栈顶递减）。
- 典型题目：接雨水、柱状图中最大的矩形、每日温度。

### 括号匹配原理
遍历字符串，遇到左括号入栈，遇到右括号时检查栈顶是否匹配，匹配则出栈，否则返回 false。遍历结束后栈为空说明完全匹配。

### 表达式求值
- 中缀表达式（人习惯的写法，如 3 + 4 * 2）需通过运算符优先级和栈转换为后缀表达式（逆波兰式）。
- 后缀表达式求值：遇到数字入栈，遇到运算符弹出两个数字计算结果后入栈。
`,
    source: "LeetCode 官方题解 & 算法导论",
  },
  队列: {
    category: "algorithm",
    content: `## 队列（Queue）

> 来源：LeetCode 官方题解 & 算法导论

### 队列的特性
- **先进先出（FIFO, First In First Out）**：最先入队的元素最先出队。
- 主要操作：offer/add（入队）、poll/remove（出队）、peek/element（查看队首）。
- Java 中 Queue 是接口，常用实现：LinkedList、ArrayDeque、PriorityQueue。

### 常用类型对比
| 类型 | 特点 | Java 实现 |
|------|------|-----------|
| 普通队列 | FIFO | LinkedList |
| 双端队列 | 两端都可插入/删除 | ArrayDeque |
| 优先队列 | 按优先级出队（堆实现） | PriorityQueue |
| 阻塞队列 | 线程安全，满/空时阻塞 | LinkedBlockingQueue |
| 延迟队列 | 元素到期才出队 | DelayQueue |

### 双端队列（Deque）
- 支持在头部和尾部进行插入/删除操作，全部 O(1)。
- 常用方法：addFirst/addLast、removeFirst/removeLast、getFirst/getLast。
- 应用：滑动窗口最大值（配合单调队列）、回文检查。

### 优先队列（PriorityQueue）
- 底层为二叉堆（默认小顶堆），插入和删除 O(log n)。
- 自定义排序：new PriorityQueue<>((a,b) -> b - a) 转为大顶堆。
- 应用：TopK 问题、合并 K 个有序链表、数据流中位数。

### 单调队列
- 队列内元素保持单调性，常与滑动窗口结合。
- 典型题目：滑动窗口最大值——用双端队列维护窗口内递减下标。`,
    source: "LeetCode 官方题解 & 算法导论",
  },
  链表: {
    category: "algorithm",
    content: `## 链表（Linked List）

> 来源：LeetCode 官方题解 & 算法导论

### 基本概念
- **单向链表**：每个节点包含 val 和 next 指针。
- **双向链表**：每个节点包含 val、prev、next 指针。
- **循环链表**：尾节点指向头节点形成环。
- 优点：插入/删除 O(1)（已知位置），动态大小。
- 缺点：随机访问 O(n)，额外存储指针的空间开销。

### 常见操作与技巧
| 技巧 | 说明 | 典型题目 |
|------|------|----------|
| **快慢指针** | 快指针走两步，慢指针走一步 | 环形链表检测、链表中点 |
| **反转链表** | 迭代/递归反转 | 反转链表、K个一组翻转 |
| **哨兵节点** | dummy 节点简化边界 | 合并有序链表、删除倒数第N个 |
| **归并排序** | 找中点+排序合并 | 排序链表 |

### 快慢指针详解
- **环检测**：快慢指针在环内必然相遇。相遇点证明有环。
- **找中点**：快指针到末尾时，慢指针在中点。
- **找倒数第 k 个**：快指针先走 k 步，然后快慢同时走，快指针到末尾时慢指针即为目标。

### 环检测进阶
- **确定环入口**：快慢指针相遇后，将慢（或快）指针移回头节点，两指针每次各走一步，相遇点即为环入口（数学推导有证明）。

### LRU 缓存（Least Recently Used）
- 哈希表 + 双向链表：哈希表 O(1) 查找，双向链表 O(1) 移动节点到头部。
- get(key)：存在则移动到头部；不存在返回 -1。
- put(key, value)：存在则更新并移动到头部；不存在则插入头部，若超出容量则删除尾部节点。`,
    source: "LeetCode 官方题解 & 算法导论",
  },
  图: {
    category: "algorithm",
    content: `## 图（Graph）

> 来源：LeetCode 官方题解 & 算法导论

### 基本概念
- 图由顶点（Vertex）和边（Edge）组成：G = (V, E)。
- **有向图 vs 无向图**：边是否有方向。
- **有权图 vs 无权图**：边是否有权重。
- **连通图**：任意两点间都有路径。
- 表示方式：邻接矩阵（稠密图）、邻接表（稀疏图，常用）。

### DFS（深度优先搜索）
- 从起点出发，沿一条路径走到底再回溯。
- 时间复杂度 O(V+E)，空间复杂度 O(V)（递归栈）。
- 应用：连通分量、拓扑排序（后序）、路径搜索。
- 代码模板：递归函数 + visited 集合。

### BFS（广度优先搜索）
- 从起点出发，逐层向外扩展。
- 时间复杂度 O(V+E)，空间复杂度 O(V)（队列）。
- **BFS 可找到无权图的最短路径**（首次到达即为最短）。
- 代码模板：队列 + visited 集合。

### 拓扑排序（Topological Sort）
- 只适用于有向无环图（DAG）。
- **Kahn 算法**（BFS）：统计入度，入度为 0 的节点入队，出队时更新邻接节点入度。
- **DFS 后序遍历**：DFS 完成后将节点加入结果列表，最后反转即得拓扑序。

### 最短路径算法
| 算法 | 场景 | 复杂度 |
|------|------|--------|
| Dijkstra | 单源正权图 | O((V+E) log V) |
| Bellman-Ford | 单源含负权 | O(VE) |
| Floyd-Warshall | 全源 | O(V³) |
| SPFA | 单源负权优化 | 平均 O(E)，最坏 O(VE) |

### 并查集（Union-Find）
- 用于动态连通性问题，支持 union(x,y) 和 find(x)。
- **路径压缩**：find 时将节点直接指向根节点。
- **按秩合并**：将较矮的树挂到较高的树下。
- 优化后几乎 O(1) 均摊时间复杂度。
- 典型应用：岛屿数量（并查集版本）、朋友圈、等式方程的可满足性。

### 二分图检测
- 用两种颜色给图着色，相邻顶点颜色必须不同。
- 用 DFS/BFS 进行染色，出现冲突则不是二分图。`,
    source: "LeetCode 官方题解 & 算法导论",
  },
  动态规划: {
    category: "algorithm",
    content: `## 动态规划（Dynamic Programming）

> 来源：LeetCode 官方题解 & 算法导论

### 核心思想
动态规划通过**把原问题分解为相对简单的子问题**来解决复杂问题。适用于具有**最优子结构**和**重叠子问题**性质的问题。

### 三个基本条件
| 条件 | 说明 |
|------|------|
| **最优子结构** | 问题的最优解包含子问题的最优解 |
| **重叠子问题** | 子问题被重复求解（非分治的独特之处） |
| **无后效性** | 某阶段状态一旦确定，不受之后决策影响 |

### 解题四步法
1. **定义状态**：如 dp[i] 表示前 i 个元素的最优解。
2. **状态转移方程**：找出 dp[i] 与 dp[i-1], dp[i-2] 等的关系。
3. **初始化（Base Case）**：确定初始状态的值。
4. **遍历顺序**：一维从小到大，二维按行/对角遍历。

### 经典题型

**1. 背包问题**
- **0-1 背包**：每个物品选或不选。dp[i][j] = max(dp[i-1][j], dp[i-1][j-w[i]] + v[i])
- **完全背包**：每种物品无限取。内层循环正序遍历 j。
- **多重背包**：每种物品有数量限制。二进制优化分组。

**2. 区间 DP**
- 涉及区间合并/分割，如矩阵链乘、戳气球。
- dp[i][j] 表示区间 [i,j] 的最优解，按长度从小到大计算。

**3. 数位 DP**
- 统计满足某条件的数字个数，常问「1~n 中有多少不包含 49 的数字」。
- 按位递归，用状态参数表示是否达到上界、前导零等。

**4. 状态压缩 DP**
- 用二进制位表示集合状态，常用于 NP 问题的小规模求解。
- 如旅行商问题（TSP）：dp[mask][i] 表示当前访问集合为 mask，最后在 i 点的最短路径。

### 记忆化搜索 vs 递推 DP
- **记忆化搜索**：自顶向下（递归+缓存），直观但可能栈溢出。
- **递推 DP**：自底向上（循环迭代），效率高且无栈溢出风险。
- 两者本质相同，差别在写法。`,
    source: "LeetCode 官方题解 & 算法导论",
  },
  贪心: {
    category: "algorithm",
    content: `## 贪心算法（Greedy Algorithm）

> 来源：LeetCode 官方题解 & 算法导论

### 核心思想
每一步都选择当前看起来最优的选择（局部最优），期望最终得到全局最优解。贪心不像 DP 那样需要考虑所有子问题，因此实现更简单，但正确性需证明。

### 与动态规划的区别
| 维度 | 贪心 | 动态规划 |
|------|------|----------|
| 决策方式 | 只考虑当前最优 | 考虑所有子问题 |
| 状态依赖 | 无后顾之忧（做了就不改） | 需要对比不同子问题的结果 |
| 适用条件 | 贪心选择性质 + 最优子结构 | 最优子结构 + 重叠子问题 |
| 正确性 | 需要严格证明 | 保证正确 |
| 典型场景 | 区间调度、哈夫曼编码 | 背包问题、序列问题 |

### 区间调度问题
- **最多不重叠区间**：按结束时间排序，贪心选择最早结束的区间。
- **最少箭头射气球**：等价于最多不重叠区间问题。
- **会议室 II**：最少会议室数量 = 最大重叠数量，用扫描线/堆解决。

### 排序贪心
- **分发饼干**：小孩和饼干都排序，用最小的饼干满足最能满足的小孩。
- **加油站**：总油量 ≥ 总消耗时一定有解，从累计油量最低点的下一个站出发。
- **跳跃游戏 II**：在能跳到的范围内选择下一跳能到最远的位置。

### 证明方法
1. **交换论证法（Exchange Argument）**：证明任何最优解可以通过一系列交换变为贪心解而不变差。
2. **归纳法**：证明贪心选择后剩余子问题可继续用贪心。
3. **反证法**：假设贪心不是最优，导出矛盾。

### 经典应用
- **哈夫曼编码**：每次合并频率最小的两个字符。
- **Dijkstra 最短路径**：每次选距离最小的未访问节点。
- **Prim 最小生成树**：每次选连接已选集合的最小边。
- **Kruskal 最小生成树**：每次选不构成环的最小边（配合并查集）。`,
    source: "LeetCode 官方题解 & 算法导论",
  },
  回溯: {
    category: "algorithm",
    content: `## 回溯（Backtracking）

> 来源：LeetCode 官方题解 & 算法导论

### 核心思想
回溯是一种通过**试错**来搜索所有可能解的算法。当尝试某条路径发现不满足条件时，**回溯**（撤销上一步的选择）尝试其他路径。

### 算法模板
\`\`\`java
void backtrack(选择列表, 路径, 结果集) {
    if (满足结束条件) {
        结果集.add(new 路径);
        return;
    }
    for (选择 in 选择列表) {
        做选择 (加入路径);
        backtrack(选择列表, 路径, 结果集);
        撤销选择 (从路径移除);
    }
}
\`\`\`

### 回溯三件套
| 题目 | 关键约束 | 回溯差异 |
|------|----------|----------|
| **全排列** | 所有排列，顺序重要 | 使用 used[] 标记是否已选 |
| **子集** | 所有组合，顺序不重要 | 使用 start 参数避免回头 |
| **组合总和** | 元素可重复使用 | start = i（允许重复） |

### 剪枝优化
通过提前终止不满足条件的路径来大幅提升效率：
- **排序 + 提前终止**：如果当前和已超过目标，后续更大值无需尝试。
- **重复元素去重**：排序后如果当前元素和前一个相同且前一个未被使用，跳过。
- **可行性剪枝**：剩余元素数量不够时直接返回。

### 经典题目
- **N 皇后**：逐行放置皇后，检查列和对角线冲突。
- **数独求解**：遍历空格，尝试放 1-9，检查行/列/宫是否合法。
- **括号生成**：左括号数 < n 可加左括号，右括号数 < 左括号数可加右括号。
- **单词搜索**：在网格中搜索单词，四方向 DFS，用 visited 或改值标记已走。

### 复杂度分析
- 时间复杂度通常为 O(分支数^深度)，如全排列 O(n!)。
- 剪枝可大幅优化，但最坏情况下指数级复杂度仍然是回溯的固有限制。
- 空间复杂度主要为递归深度 O(n)。`,
    source: "LeetCode 官方题解 & 算法导论",
  },
  二分搜索: {
    category: "algorithm",
    content: `## 二分搜索（Binary Search）

> 来源：LeetCode 官方题解 & 算法导论

### 经典二分
在有序数组中查找目标值：
\`\`\`java
int left = 0, right = n - 1;
while (left <= right) {
    int mid = left + (right - left) / 2;  // 防溢出
    if (nums[mid] == target) return mid;
    else if (nums[mid] < target) left = mid + 1;
    else right = mid - 1;
}
return -1;
\`\`\`
时间复杂度 O(log n)，空间复杂度 O(1)。

### 二分边界问题
| 场景 | 搜索区间 | mid 偏向 | 循环条件 |
|------|----------|----------|----------|
| 标准查找 | [left, right] | 左中 | left ≤ right |
| 左边界（第一个≥target） | [left, right] | 左中 | left < right |
| 右边界（最后一个≤target） | [left, right] | 右中 | left < right |

**左边界模板**（第一个 >= target 的位置）：
\`\`\`java
int left = 0, right = n; // 注意 right = n
while (left < right) {
    int mid = left + (right - left) / 2;
    if (nums[mid] >= target) right = mid;
    else left = mid + 1;
}
return left; // 如果 left == n 说明不存在
\`\`\`

### 二分答案
- 当问题具有**单调性**（可行性与参数大小单调相关）时，可对答案进行二分。
- 典型应用：爱吃香蕉的珂珂、分割数组的最大值、最小化最大值问题。
- 步骤：确定答案范围 → 实现 check(mid) 函数 → 在范围内二分查找。

### 旋转数组问题
- **搜索旋转数组**：先判断哪半段有序，在有序段内判断 target 是否在其中。
- **寻找旋转点**（最小值）：比较 nums[mid] 与 nums[right] 判断旋转点在左还是右。

### 二分查找的变种
- **浮点数二分**：使用 while (right - left > eps) 控制精度，迭代固定次数也可。
- **二分近邻**：查找最接近 target 的元素，更新答案时记录最接近值。`,
    source: "LeetCode 官方题解 & 算法导论",
  },
  字符串: {
    category: "algorithm",
    content: `## 字符串（String）

> 来源：LeetCode 官方题解 & 算法导论

### 字符串基础
- Java 中的 String 是不可变对象（final char[]/byte[]），每次修改都会创建新对象。
- 频繁拼接使用 StringBuilder（单线程）或 StringBuffer（多线程）。
- 常用 API：charAt()、substring()、indexOf()、toCharArray()、split()。

### KMP 算法
- 用于字符串匹配，时间复杂度 O(m+n)。
- **核心思想**：当匹配失败时，利用已匹配部分的信息，将模式串向右移动尽可能远，避免从头匹配。
- **next 数组**（也叫 failure function）：记录模式串各位置的最长公共前后缀长度。
- 构建 next 数组 O(m)，匹配过程 O(n)。

### Trie（前缀树）
- 以空间换时间的字符串检索结构。
- 每个节点包含子节点数组（通常 26 个字母）和结束标记。
- 插入和查询都是 O(len(word))。
- 应用：自动补全、拼写检查、路由匹配。

### 回文串
- **中心扩展法**：以每个位置和每两个位置为中心向两边扩展 O(n²)。
- **Manacher 算法**：利用回文的对称性，在 O(n) 时间内找到最长回文子串。
- **判断回文**：双指针从两端向中间比较。

### 滑动窗口
解决「最长/最短子串」类问题的通用技巧：
1. 右指针不断扩展窗口。
2. 当窗口满足条件时，尝试移动左指针缩小窗口。
3. 在过程中更新答案。
- 典型题目：无重复字符的最长子串、最小覆盖子串、找到字符串中所有字母异位词。`,
    source: "LeetCode 官方题解 & 算法导论",
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
  堆: {
    category: "algorithm",
    content: `## 堆（Heap）

> 来源：LeetCode 官方题解 & 算法导论

### 基本概念
- 堆是**完全二叉树**，分为大顶堆（堆顶最大）和小顶堆（堆顶最小）。
- 通常用数组存储：根节点为 arr[0]，arr[i] 的子节点为 arr[2i+1] 和 arr[2i+2]。
- 主要操作：
  - 插入：O(log n)，从底部向上调整（上浮）。
  - 删除堆顶：O(log n)，将末尾元素移到堆顶后向下调整（下沉）。
  - 获取堆顶：O(1)。
  - 建堆：O(n)。

### 堆排序
1. 建堆：从最后一个非叶子节点开始下沉，构建大顶堆。
2. 排序：依次将堆顶（最大值）与末尾元素交换，堆长度减 1，重新下沉。
- 时间复杂度 O(n log n)，空间复杂度 O(1)，**不稳定**。

### Java 中的堆：PriorityQueue
- 默认小顶堆：new PriorityQueue<>()
- 大顶堆：new PriorityQueue<>((a,b) -> b - a)
- 常用方法：offer()、poll()、peek()、size()、isEmpty()。

### Top K 问题
| 场景 | 解法 | 复杂度 |
|------|------|--------|
| 找最大/最小的 K 个元素 | 堆：最小堆找 TopK 大，最大堆找 TopK 小 | O(n log k) |
| 找第 K 大 | 快速选择（Quick Select） | 平均 O(n) |
| 海量数据 TopK | 堆 + 分批处理 | O(n log k) |

### 双堆技巧
- **数据流中位数**：用最大堆存较小的一半，最小堆存较大的一半，保持两堆大小平衡。
- **滑动窗口中位数**：双堆 + 延迟删除。
- **IPO（最大资本）**：按资本排序后将可用项目加入最大堆。

### 堆 vs 快速选择
- 堆适用于流式数据（实时 TopK）和海量数据。
- 快速选择适用于一次性查找第 K 大/小元素，效率更高（平均 O(n)）。`,
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
  递归: {
    category: "algorithm",
    content: `## 递归（Recursion）

> 来源：LeetCode 官方题解 & 算法导论

### 递归三要素
1. **终止条件（Base Case）**：递归何时停止，防止无限递归。
2. **递推公式**：将大问题分解为更小的子问题，即 f(n) 与 f(n-1) 的关系。
3. **返回值**：子问题的返回值如何组合成原问题的解。

### 递归 vs 迭代
| 维度 | 递归 | 迭代 |
|------|:----:|:----:|
| 代码量 | 少（简洁） | 多（需手动维护状态） |
| 理解难度 | 需要递归思维 | 直观 |
| 空间复杂度 | O(n)（系统栈） | 通常 O(1) |
| 性能 | 有函数调用开销 | 快 |
| 适用场景 | 树、分治、回溯 | 循环、动态规划 |

### 递归的本质
- 递归本质上是**函数调用自身**，每次调用都会在系统栈上压入一个栈帧。
- 递归过程分为**递**（向下递入）和**归**（向上返回）两个阶段。
- 系统栈的深度就是递归深度，过深会导致 **StackOverflowError**。

### 分治（Divide and Conquer）
分治算法是递归的重要应用，三步走：
1. **分解（Divide）**：将问题拆分为规模更小的子问题。
2. **解决（Conquer）**：递归求解子问题。
3. **合并（Combine）**：将子问题的解组合成原问题的解。

### 归并排序（Merge Sort）
- 分治思想：不断二分数组，两两合并有序子数组。
- 时间复杂度 O(n log n)，空间复杂度 O(n)（需额外数组）。
- 稳定排序，适合链表排序。

### 快速排序（Quick Sort）
- 分治思想：选基准（pivot），将数组分成小于和大于两部分，递归排序。
- 平均 O(n log n)，最坏 O(n²)，空间 O(log n)（递归栈）。
- **不稳定**排序，但通常比归并快（缓存友好）。

### 尾递归优化
- 尾递归指递归调用是整个函数体中的最后一步。
- 某些编译器/语言（如 Scala、Kotlin）可将尾递归优化为迭代。
- Java 不支持尾递归优化。`,
    source: "LeetCode 官方题解 & 算法导论",
  },

  // === NEW ENTRIES (Java Collections) ===
  List: {
    category: "java_collections",
    content: `## List 接口

> 来源：JavaGuide

### List 概述
List 是有序可重复的集合，继承自 Collection。主要实现：ArrayList、LinkedList、Vector。

### ArrayList
- 基于 Object[] 动态数组，JDK 8 懒加载（首次 add 时初始化容量 10）。
- 扩容为 1.5 倍（oldCapacity + (oldCapacity >> 1)）。
- 尾部操作 O(1)，指定位置插入/删除 O(n)。
- 实现 RandomAccess 接口，支持快速随机访问。
- 线程不安全，迭代时修改会抛 ConcurrentModificationException。

### LinkedList
- 基于双向链表（JDK 7+ 非循环），每个节点存储前后指针。
- 头尾操作 O(1)，中间操作 O(n)。
- 未实现 RandomAccess。
- 可实现队列/双端队列功能（实现了 Deque 接口）。

### Vector（已过时）
- 与 ArrayList 类似，但方法用 synchronized 修饰（线程安全）。
- 扩容为 2 倍（ArrayList 1.5 倍）。
- 性能低于 ArrayList，建议用 Collections.synchronizedList() 或 CopyOnWriteArrayList 替代。
- Stack 继承自 Vector，已不推荐使用（建议 Deque）。
`,
    source: "JavaGuide",
  },
  Queue: {
    category: "java_collections",
    content: `## Queue（队列）

> 来源：JavaGuide

### Queue 接口
Queue 是一种先进先出（FIFO）的数据结构，继承自 Collection。

| 操作 | 抛异常 | 返回特殊值 |
|------|:------:|:----------:|
| 插入 | add(e) | offer(e) |
| 移除 | remove() | poll() |
| 查看 | element() | peek() |

### Deque（双端队列）
Deque 支持两端插入和移除，实现 Queue 和 Stack 的功能。
- **作为队列（FIFO）**：addLast()/offerLast() + removeFirst()/pollFirst()
- **作为栈（LIFO）**：addFirst()/offerFirst() + removeFirst()/pollFirst()
- 主要实现：ArrayDeque（推荐）、LinkedList

### PriorityQueue
- 基于 Object[] 小顶堆实现，按自然顺序或 Comparator 排序。
- 插入 O(log n)，获取队首 O(1)，删除 O(log n)。
- 不允许 null，线程不安全。

### 阻塞队列（BlockingQueue）
| 实现 | 特性 |
|------|------|
| ArrayBlockingQueue | 有界，数组实现，公平/非公平 |
| LinkedBlockingQueue | 可选有界，链表实现 |
| SynchronousQueue | 容量为 0，直接传递 |
| PriorityBlockingQueue | 优先级排序 |
| DelayQueue | 延迟出队 |
| LinkedTransferQueue | 支持 transfer() 方法 |
`,
    source: "JavaGuide",
  },
  TreeMap: {
    category: "java_collections",
    content: `## TreeMap / TreeSet / HashSet

> 来源：JavaGuide

### TreeMap
- 基于红黑树（Red-Black Tree）实现的有序 Map，按键的自然顺序或 Comparator 排序。
- 操作时间复杂度 O(log n)。
- 键不能为 null（允许 Comparator 处理 null，但自然排序抛 NPE）。
- 线程不安全。

### TreeSet
- 基于 TreeMap 实现的 Set，使用 TreeMap 的 key 存储元素。
- 有序、去重，元素必须实现 Comparable 或传入 Comparator。
- 基于红黑树，操作 O(log n)。

### HashSet
- 基于 HashMap 实现的 Set，使用 HashMap 的 key 存储元素，value 为常量 PRESENT。
- 无序、去重，依赖元素的 hashCode() 和 equals()。
- 操作 O(1)（平均），迭代顺序不可预测。
- 允许 null（最多一个）。

### Set 体系对比
| 实现 | 数据结构 | 顺序 | 时间复杂度 |
|------|---------|------|-----------|
| HashSet | HashMap | 无序 | O(1) |
| LinkedHashSet | LinkedHashMap | 插入顺序 | O(1) |
| TreeSet | 红黑树 | 自然/Comparator 排序 | O(log n) |
| ConcurrentSkipListSet | 跳表 | 自然/Comparator 排序 | O(log n) |
`,
    source: "JavaGuide",
  },

  // === NEW ENTRIES (System Design) ===
  缓存: {
    category: "system_design",
    content: `## 缓存（Caching）

> 来源：JavaGuide

### 缓存的作用
- **降低延迟**：从内存读取（纳秒级）远快于数据库（毫秒级）。
- **降低负载**：避免重复计算/查询。
- **缓解峰值**：抵抗瞬时高流量（缓存雪崩/击穿防护）。

### 缓存分层
| 层级 | 说明 | 示例 |
|------|------|------|
| L1（本地缓存） | 应用进程内缓存 | Caffeine、Guava Cache、Ehcache |
| L2（分布式缓存） | 独立缓存服务 | Redis、Memcached |
| 客户端缓存 | 浏览器/CDN 缓存 | HTTP Cache、CDN |

### 缓存模式
| 模式 | 策略 | 适用 |
|------|------|------|
| **Cache Aside（旁路缓存）** | 读时先查缓存，未命中查 DB 再写缓存；写时先更新 DB 再删除缓存 | 最常用 |
| **Read Through** | 缓存代理 DB 查询 | 数据一致性要求高 |
| **Write Through** | 写操作同时更新缓存和 DB | 双写保证 |
| **Write Behind** | 先更新缓存，异步批量写 DB | 高写入吞吐 |
| **Refresh Ahead** | 缓存过期前自动刷新 | 热点数据 |

### 缓存问题
| 问题 | 现象 | 解决方案 |
|------|------|---------|
| **缓存穿透** | 查询不存在的数据，跳过缓存直接打 DB | 布隆过滤器、缓存空值 |
| **缓存击穿** | 热点 key 过期，大量请求同时打 DB | 互斥锁、永不过期+异步刷新 |
| **缓存雪崩** | 大量 key 同时过期或缓存宕机 | 随机过期时间、多级缓存、限流降级 |
`,
    source: "JavaGuide",
  },
  架构: {
    category: "system_design",
    content: `## 系统架构设计

> 来源：JavaGuide

### 架构模式

**单体架构**：所有功能打包在一个应用中。
- 优点：开发简单，部署单一。
- 缺点：团队协作困难，难以扩展，牵一发而动全身。

**分层架构**：将系统分为展示层、业务层、持久层等。
- 每层职责明确，上层依赖下层。
- 典型代表：Spring MVC（Controller → Service → DAO）。

**微服务架构**：将应用拆分为一系列小的、独立的服务。
- 每个服务独立开发、部署、扩展。
- 优点：技术多样性、独立部署、容错隔离。
- 挑战：服务治理（发现/配置/网关）、数据一致性（分布式事务）、运维复杂度。

**事件驱动架构**：组件通过事件异步通信。
- 松耦合、高扩展、支持 CQRS 和 Event Sourcing。
- 典型：Kafka、RabbitMQ。

### 分层设计原则
- **单一职责**：每层只关注自己的职责。
- **依赖倒置**：上层不直接依赖下层实现，依赖抽象接口。
- **接口隔离**：不强迫调用者依赖不需要的方法。
- **无环依赖**：避免循环依赖（A→B→A）。
`,
    source: "JavaGuide",
  },

  // === NEW ENTRIES (AI) ===
  深度学习: {
    category: "ai",
    content: `## 深度学习基础

> 来源：JavaGuide

### 什么是深度学习？
深度学习是机器学习的一个子领域，基于深层神经网络（DNN），通过多层非线性变换学习数据的层次化特征表示。

### 核心网络结构

**CNN（卷积神经网络）**：适合图像和空间数据。
- 卷积层：用卷积核提取局部特征。
- 池化层：下采样减少参数（Max Pooling / Average Pooling）。
- 全连接层：全局特征组合。
- 典型模型：LeNet、AlexNet、ResNet、VGG。

**RNN（循环神经网络）**：适合序列数据（文本、语音）。
- 隐藏状态传递序列信息。
- 问题：长距离依赖时梯度消失/爆炸。
- 改进：LSTM（长短时记忆网络，门控机制）、GRU（简化版 LSTM）。

**Transformer**：基于自注意力机制，替代 RNN 处理序列。
- 核心：Self-Attention + Multi-Head Attention + FFN + 位置编码。
- 并行计算，解决 RNN 串行瓶颈。
- 代表：BERT（编码器）、GPT（解码器）、T5（编码器-解码器）。

### 训练关键技术
- **反向传播**：计算梯度，更新网络参数。
- **激活函数**：ReLU（解决梯度消失）、Sigmoid/Tanh（二分类/归一化）。
- **正则化**：Dropout（随机丢弃神经元）、L1/L2 正则、Batch Normalization。
- **优化器**：SGD、Adam（自适应学习率）、RMSProp。
- **损失函数**：交叉熵（分类）、MSE（回归）。
`,
    source: "JavaGuide",
  },
  机器学习: {
    category: "ai",
    content: `## 机器学习基础

> 来源：JavaGuide

### 什么是机器学习？
机器学习是让计算机从数据中自动学习模式和规律，无需显式编程。分为三大类：

**监督学习**：有标签数据，学习输入→输出的映射。
| 任务 | 算法 | 场景 |
|------|------|------|
| 分类 | 逻辑回归、SVM、决策树、随机森林、KNN | 垃圾邮件检测、图像分类 |
| 回归 | 线性回归、岭回归、Lasso | 房价预测、销量预测 |

**无监督学习**：无标签数据，发掘数据内在结构。
| 任务 | 算法 | 场景 |
|------|------|------|
| 聚类 | K-Means、DBSCAN、层次聚类 | 用户分群、异常检测 |
| 降维 | PCA、t-SNE | 数据可视化、特征压缩 |

**强化学习**：智能体通过与环境交互学习最优策略（奖励最大化）。
- 经典算法：Q-Learning、Deep Q-Network（DQN）、PPO。
- 应用：游戏（AlphaGo）、机器人控制、推荐系统。

### 模型评估

| 指标 | 公式 | 说明 |
|------|------|------|
| 准确率（Accuracy） | (TP+TN)/(P+N) | 整体正确率，不平衡数据不准确 |
| 精确率（Precision） | TP/(TP+FP) | 预测为正例中的正确率 |
| 召回率（Recall） | TP/(TP+FN) | 正例被正确识别的比例 |
| F1 Score | 2*P*R/(P+R) | 精确率和召回率的调和平均 |
| AUC-ROC | 面积 | 分类器在不同阈值下的综合表现 |

### 过拟合与欠拟合
- **过拟合**：模型记住训练数据噪声，泛化能力差。解决：增加数据、降低模型复杂度、正则化、早停。
- **欠拟合**：模型未学到数据规律。解决：增加特征、增加模型复杂度、减少正则化。
`,
    source: "JavaGuide",
  },

  // === NEW ENTRIES (Product / Management) ===
  产品思维: {
    category: "product",
    content: `## 产品思维

> 来源：JavaGuide

### 什么是产品思维？
产品思维是一种以用户为中心、以价值为导向的思考方式，关注"做什么"和"为什么做"多于"怎么做"。

### 核心要素
- **用户导向**：从用户真实需求出发，而非技术实现便利。
- **价值驱动**：每个功能必须回答"为用户/业务创造了什么价值"。
- **数据验证**：用数据验证假设（A/B 测试、用户行为分析）。
- **迭代优化**：小步快跑，MVP 快速上线，根据反馈持续迭代。
- **全局视角**：考虑技术、商业、运营、市场等多维度平衡。

### 产品思维 vs 项目思维
| 维度 | 产品思维 | 项目思维 |
|------|---------|---------|
| 目标 | 长期价值创造 | 按时按预算交付 |
| 范围 | 持续演进 | 固定范围 |
| 驱动 | 用户需求 + 数据 | 需求文档 + 计划 |
| 成功标准 | 用户满意度、业务指标 | 完成度、交付时间 |

### MVP（最小可行产品）
- 用最小的成本验证核心假设。
- 核心问题：最简化的产品形态能否解决用户的核心痛点？
- 常见误区：把 MVP 想得太复杂。
`,
    source: "JavaGuide",
  },
  敏捷: {
    category: "project_mgmt",
    content: `## 敏捷开发（Agile / Scrum）

> 来源：JavaGuide

### 敏捷开发宣言
1. **个体和互动** 高于 流程和工具。
2. **可工作的软件** 高于 详尽的文档。
3. **客户合作** 高于 合同谈判。
4. **响应变化** 高于 遵循计划。

### Scrum 框架
Scrum 是最流行的敏捷框架，核心角色和事件：

**角色**：
- **Product Owner**：定义需求并排序（Product Backlog），最大化产品价值。
- **Scrum Master**：保障 Scrum 流程执行，移除障碍，非传统管理者。
- **开发团队**：自组织、跨职能，3-9 人，共同完成 Sprint 目标。

**事件**：
| 事件 | 频率 | 时长 | 目的 |
|------|------|:----:|------|
| Sprint 计划 | 每 Sprint 开始 | 2-4h | 确定 Sprint Backlog 和目标 |
| 每日站会 | 每天 | 15min | 同步进度，暴露阻塞 |
| Sprint 评审 | 每 Sprint 结束 | 1-2h | 展示完成功能，收集反馈 |
| Sprint 回顾 | Sprint 评审后 | 1-1.5h | 反思过程，制定改进计划 |

**制品**：
- **Product Backlog**：按优先级排序的需求列表。
- **Sprint Backlog**：当前 Sprint 要完成的任务。
- **增量（Increment）**：Sprint 结束时交付的可工作产品。

### Kanban（看板）
- 可视化工作流（TODO → In Progress → Done）。
- 限制在制品（WIP）数量，防止过载。
- 无固定迭代周期，持续交付。

### 技术实践
- **CI/CD**：持续集成 + 持续部署，自动构建、测试、部署。
- **TDD（测试驱动开发）**：先写测试，再写实现代码。
- **代码评审**：确保代码质量和知识共享。
`,
    source: "JavaGuide",
  },

  // ── Network ─────────────────────────────────────────
  TCP_IP: {
    category: "network",
    content: `## TCP/IP 协议栈

### 四层模型
- **应用层**：HTTP、FTP、SMTP、DNS — 为用户提供网络应用服务。
- **传输层**：TCP、UDP — 端到端通信，提供可靠或不可靠传输。
- **网络层**：IP、ICMP — 路由寻址、分组转发。
- **链路层**：以太网、Wi-Fi — 相邻节点间的帧传输。

### TCP 核心特性
| 特性 | 说明 |
|------|------|
| 面向连接 | 三次握手建立连接，四次挥手释放连接 |
| 可靠传输 | 确认重传（ARQ）、序列号、校验和 |
| 流量控制 | 滑动窗口机制，防止发送方过快 |
| 拥塞控制 | 慢开始、拥塞避免、快重传、快恢复 |

### 三次握手
1. **SYN**：客户端发送 SYN=1, seq=x → 服务端
2. **SYN+ACK**：服务端回复 SYN=1, ACK=1, seq=y, ack=x+1 → 客户端
3. **ACK**：客户端发送 ACK=1, seq=x+1, ack=y+1 → 服务端

**为什么是三次？** 防止已失效的连接请求到达服务端，避免资源浪费。

### 四次挥手
1. **FIN**：客户端发送 FIN=1 → 服务端（不再发送数据）
2. **ACK**：服务端回复 ACK（半关闭状态，客户端→服务端通道关闭）
3. **FIN**：服务端数据发送完毕，发送 FIN=1 → 客户端
4. **ACK**：客户端回复 ACK，等待 2MSL 后关闭

**为什么 TIME_WAIT 需要 2MSL？** 确保最后一个 ACK 被收到，以及让过期的报文段在网络中消失。

### UDP 特点
- 无连接，不可靠
- 头部仅 8 字节（TCP 20-60 字节）
- 支持广播和多播
- 适用于 DNS、视频通话、直播等实时场景
`,
    source: null,
  },
  HTTP: {
    category: "network",
    content: `## HTTP 协议

### HTTP 版本演进
| 版本 | 特点 |
|------|------|
| HTTP/1.0 | 短连接，每次请求新建 TCP 连接 |
| HTTP/1.1 | 持久连接（Keep-Alive）、管道化、Host 头 |
| HTTP/2 | 多路复用、二进制分帧、头部压缩（HPACK）、服务端推送 |
| HTTP/3 | 基于 QUIC（UDP）、0-RTT 握手、无队头阻塞 |

### HTTP 方法
- **GET**：幂等，安全（只读），可缓存
- **POST**：非幂等，不安全，通常不可缓存
- **PUT**：幂等，更新资源
- **DELETE**：幂等，删除资源
- **PATCH**：部分更新
- **HEAD**：类似 GET 但只返回响应头

### 状态码
- 1xx：信息性 — 100 Continue
- 2xx：成功 — 200 OK, 201 Created, 204 No Content
- 3xx：重定向 — 301 Moved Permanently, 302 Found, 304 Not Modified
- 4xx：客户端错误 — 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found
- 5xx：服务端错误 — 500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable

### HTTPS = HTTP + TLS
- **非对称加密**：客户端用服务端公钥加密对称密钥，服务端用私钥解密
- **数字证书**：CA 签发，验证服务端身份
- **TLS 握手**：ClientHello → ServerHello + 证书 + 密钥交换 → 完成
`,
    source: null,
  },

  // ── JVM ────────────────────────────────────────────
  JVM_内存模型: {
    category: "jvm",
    content: `## JVM 内存模型

### 运行时数据区
| 区域 | 线程共享 | 作用 |
|------|----------|------|
| 堆（Heap） | 是 | 存放对象实例，GC 主要区域 |
| 方法区（Method Area） | 是 | 类信息、常量、静态变量 |
| 虚拟机栈（VM Stack） | 否 | 局部变量表、操作数栈、方法出口 |
| 本地方法栈（Native Stack） | 否 | 本地方法调用 |
| 程序计数器（PC） | 否 | 当前线程执行的字节码行号 |

### 堆内存划分
- **新生代（Young）**：Eden + Survivor0 + Survivor1（默认 8:1:1）
  - 对象优先分配在 Eden
  - Minor GC 后存活对象移入 Survivor
  - 经过多次 GC 仍存活 → 移入老年代
- **老年代（Old）**：存放长期存活的对象（Major GC / Full GC）
- **元空间（Metaspace）**：JDK 8+ 替代永久代，使用本地内存

### GC 算法
| 算法 | 原理 | 适用 |
|------|------|------|
| 标记-清除 | 标记存活对象 → 回收未标记对象 | 老年代（有碎片） |
| 标记-复制 | 将存活对象复制到另一块空间 | 新生代（效率高） |
| 标记-整理 | 标记存活 → 向一端移动 → 清理边界外 | 老年代（无碎片） |

### 常用 GC 收集器
- **Serial**：单线程，Stop-The-World，客户端模式
- **Parallel**：多线程，关注吞吐量，JDK 8 默认
- **CMS**：并发标记清除，低延迟，有碎片问题
- **G1**：分区式，可预测停顿时间，JDK 9+ 默认
- **ZGC**：JDK 15+，极低延迟（<10ms），超大堆
`,
    source: null,
  },
  类加载机制: {
    category: "jvm",
    content: `## 类加载机制

### 类加载过程
1. **加载（Loading）**：通过全类名获取二进制字节流，在堆中生成 Class 对象
2. **验证（Verification）**：文件格式、元数据、字节码、符号引用验证
3. **准备（Preparation）**：为静态变量分配内存并设零值
4. **解析（Resolution）**：将符号引用替换为直接引用
5. **初始化（Initialization）**：执行类构造器 <clinit>() 方法

### 双亲委派模型
- Bootstrap ClassLoader → Extension ClassLoader → Application ClassLoader → 自定义
- **工作流程**：加载类时先委派给父加载器，父加载器无法加载才自己尝试
- **优点**：避免核心类被篡改（如 java.lang.String 始终由 Bootstrap 加载）
- **打破双亲委派**：自定义 ClassLoader 重写 loadClass()，或使用线程上下文类加载器（如 JDBC SPI）
`,
    source: null,
  },

  // ── Concurrency ────────────────────────────────────
  并发基础: {
    category: "concurrency",
    content: `## 并发编程基础

### 线程 vs 进程
| | 进程 | 线程 |
|--|------|------|
| 资源 | 独立内存空间 | 共享进程内存 |
| 切换开销 | 大（切换地址空间） | 小 |
| 通信 | IPC（管道、Socket等） | 共享变量 |

### Java 线程创建方式
1. 继承 Thread 类
2. 实现 Runnable 接口（无返回值）
3. 实现 Callable 接口（有返回值，配合 FutureTask）
4. 线程池（ExecutorService）

### 线程状态（6种）
NEW → RUNNABLE → BLOCKED / WAITING / TIMED_WAITING → TERMINATED

### synchronized 原理
- 基于监视器（Monitor），每个对象关联一个 Monitor
- 同步代码块使用 monitorenter/monitorexit 指令
- JDK 6 优化：偏向锁 → 轻量级锁 → 重量级锁（锁升级）

### volatile 关键字
- **可见性**：写操作立即刷新到主存，读操作从主存读取
- **禁止指令重排序**：内存屏障（Memory Barrier）
- **不保证原子性**：i++ 操作需要加锁

### CAS（Compare-And-Swap）
- 乐观锁机制：比较当前值 → 相等则更新
- ABA 问题：加版本号（AtomicStampedReference）
- 底层：Unsafe 类的 compareAndSwap 方法（CPU 原子指令）
`,
    source: null,
  },
  JUC_工具: {
    category: "concurrency",
    content: `## JUC（java.util.concurrent）

### 锁机制
| 工具 | 特性 |
|------|------|
| ReentrantLock | 可重入、公平/非公平、可中断、超时 |
| ReentrantReadWriteLock | 读读不互斥、读写互斥、写写互斥 |
| StampedLock | JDK 8，乐观读，比读写锁更高效 |

### 线程池（ThreadPoolExecutor）
- **核心参数**：corePoolSize, maxPoolSize, keepAliveTime, workQueue, handler
- **工作流程**：核心线程 → 工作队列 → 最大线程 → 拒绝策略
- **拒绝策略**：Abort（抛异常）、Discard（丢弃）、DiscardOldest（丢弃最旧）、CallerRuns（调用者执行）
- **Executors 工厂方法**：newFixedThreadPool, newCachedThreadPool, newSingleThreadExecutor, newScheduledThreadPool

### 并发容器
- **ConcurrentHashMap**：分段锁 / CAS + synchronized（JDK 8）
- **CopyOnWriteArrayList**：写时复制，读无锁，适合读多写少
- **BlockingQueue**：ArrayBlockingQueue, LinkedBlockingQueue, DelayQueue, SynchronousQueue
- **ConcurrentLinkedQueue**：无锁队列（CAS）
`,
    source: null,
  },

  // ── Redis ──────────────────────────────────────────
  Redis_基础: {
    category: "redis",
    content: `## Redis 核心要点

### 数据结构
| 类型 | 底层实现 | 用途 |
|------|----------|------|
| String | SDS（动态字符串） | 缓存、计数器、分布式锁 |
| Hash | dict（哈希表）+ ziplist | 对象存储 |
| List | quicklist | 消息队列、最新列表 |
| Set | intset + hashtable | 标签、去重 |
| Sorted Set | skiplist + dict | 排行榜、延时队列 |
| Bitmap | 位数组 | 签到统计 |
| HyperLogLog | 概率数据结构 | UV 统计 |
| GEO | geohash + zset | 地理位置 |

### 持久化
| | RDB | AOF |
|--|-----|-----|
| 方式 | 快照（全量） | 追加写命令 |
| 性能 | 高（子进程写） | 较低（实时写） |
| 数据安全 | 可能丢最近一次快照后的数据 | 可配 always/everysec/no |
| 恢复速度 | 快 | 慢 |
| 推荐 | 结合使用：RDB 做快照 + AOF 做增量 |

### 高可用
- **主从复制**：全量同步（RDB）+ 增量同步（命令传播）
- **哨兵（Sentinel）**：监控、选主、通知
- **集群（Cluster）**：16384 个槽位，分片存储，无中心化

### 缓存策略
- **过期策略**：定期删除 + 惰性删除
- **淘汰策略**：volatile-lru, allkeys-lru, volatile-ttl, volatile-random, allkeys-random, noeviction
- **缓存穿透**：查不存在的数据绕过缓存 → 布隆过滤器
- **缓存击穿**：热点 key 过期 → 互斥锁 / 逻辑过期
- **缓存雪崩**：大量 key 同时过期 → 过期时间加随机值 / 降级限流
`,
    source: null,
  },
  微服务架构: {
    category: "microservices",
    content: `## 微服务架构核心概念

### 什么是微服务？
将单体应用拆分为多个独立部署的小服务，每个服务围绕特定业务能力构建，拥有独立的数据库、部署流水线和运维边界。

### 微服务 vs 单体

| 维度 | 单体架构 | 微服务架构 |
|------|---------|-----------|
| 部署 | 单一部署单元 | 独立部署，服务间通过 API 通信 |
| 扩展 | 整体水平扩展 | 按需扩展单个服务 |
| 开发 | 统一技术栈 | 服务可选用不同技术栈 |
| 团队 | 按功能分层协作 | 按业务领域组织（康威定律） |
| 测试 | 端到端测试较简单 | 需契约测试、服务桩 |
| 运维 | 单一监控和日志 | 分布式追踪、集中式日志 |

### 服务拆分原则
- **领域驱动设计（DDD）**：按限界上下文（Bounded Context）拆分
- **单一职责**：每个服务只负责一个业务能力
- **无共享**：数据库不共享，通过 API 交换数据
- **自治性**：服务可独立开发、测试、部署、扩展

### 服务通信
- **同步**：REST / gRPC。简单直接，但会产生调用链依赖和级联故障
- **异步**：消息队列（Kafka / RabbitMQ）。解耦削峰，但增加最终一致性复杂度
- **gRPC**：基于 HTTP/2 + Protocol Buffers，高效双向流，适合内部服务间通信

### 微服务痛点

| 问题 | 解决方案 |
|------|---------|
| 配置管理 | 配置中心（Nacos / Apollo / Consul） |
| 服务发现 | Eureka / Nacos / Consul / Kubernetes Service |
| 负载均衡 | Ribbon / Spring Cloud LoadBalancer / K8s Service |
| 熔断降级 | Hystrix / Sentinel / Resilience4j |
| 分布式事务 | Seata（AT / TCC / Saga） |
| 分布式追踪 | Jaeger / Zipkin / Skywalking |
| 日志聚合 | ELK / Loki + Grafana |
| 监控告警 | Prometheus + Grafana |

### 微服务设计模式
- **服务注册与发现**：新服务启动时注册，客户端从注册中心获取地址
- **API 网关**：统一入口，负责路由、认证、限流、协议转换
- **熔断器（Circuit Breaker）**：快速失败防止级联雪崩
- **舱壁隔离（Bulkhead）**：将资源池隔离，防止一个服务耗尽所有线程
- **重试与超时**：设置合理的重试策略和超时时间
- **Sidecar**：将服务治理能力剥离到独立进程（Istio / Linkerd）
- **Saga**：长事务拆分为本地事务 + 补偿操作

### 容器化与编排
- **Docker**：将服务和依赖打包为容器镜像
- **Kubernetes**：容器编排平台，提供自动部署、伸缩、服务管理
- **Service Mesh**：将通信逻辑从业务代码中剥离到 Sidecar 代理（Istio 数据面为 Envoy）
`,
    source: "综合整理",
  },

  系统设计: {
    category: "system_design",
    content: `## 系统设计核心要点

### 设计流程
1. **需求澄清**：功能需求 + 非功能需求（QPS、延迟、可用性、一致性要求）
2. **估算**：QPS、存储量、带宽。例如日活 1 亿，每个用户每天 10 条消息 → QPS ≈ 10^8*10/86400 ≈ 11500
3. **数据模型设计**：ER 图，选择存储系统（关系型 / NoSQL / 缓存 / 对象存储）
4. **高层设计**：系统架构图，核心模块划分
5. **详细设计**：深入关键组件，权衡取舍

### 关键指标

| 指标 | 说明 | 目标参考 |
|------|------|---------|
| QPS | 每秒查询数 | 单机 ~1k-2k（MySQL），~5-10k（Redis） |
| 延迟 | 请求响应时间 | <100ms 优秀，<500ms 可接受 |
| P99 延迟 | 99% 请求的延迟上界 | <200ms 优秀 |
| 可用性 | 系统正常运行时间比 | 99.9%（3 个 9）≈ 8.7h/年 故障 |
| SLA | 服务等级协议 | 99.99%（4 个 9）≈ 52min/年 故障 |

### 常见系统设计题

#### 短链服务（TinyURL）
- 核心操作：create(长链) → 短链；访问短链 → 302 重定向
- 发号器：自增 ID（雪花算法 / Redis incr）→ Base62 编码（6-7 位）
- 读写比 ≈ 1:10000，缓存热点短链
- 预估：每日 1 亿新短链，QPS 约 1150（写） + 1150w（读）

#### 分布式 KV 存储
- 一致性哈希解决数据分片和扩缩容
- 虚拟节点减少数据倾斜
- Gossip 协议维护集群成员
- Vector Clock / CRDT 处理冲突
- Hinted Handoff + Read Repair 保证最终一致性

#### 实时消息系统
- WebSocket 长连接保持实时推送
- 消息可靠性：至少一次 / 最多一次 / 恰好一次
- 消息有序性：单分区/单线程保证顺序
- 离线消息：消息持久化 + 拉取模式
- 大规模连接管理：连接池 + 心跳检测

#### 限流设计
- 令牌桶：固定速率放入令牌，突发时消耗累积令牌
- 漏桶：固定速率流出，超出的请求排队或丢弃
- 滑动窗口：在时间窗口内计数，更平滑的限流
- 分布式限流：Redis + Lua 脚本实现原子计数

### 数据库扩展策略
- **读写分离**：主库写，从库读（只对读多写少场景有效）
- **分库分表**：按业务分库（垂直），按 ID 范围/哈希分表（水平）
- **CQRS**：命令和查询分离，写模型和读模型使用不同数据结构

### 缓存策略
- **旁路缓存（Cache-Aside）**：读时先查缓存，miss 则查 DB 并回填
- **穿透缓存（Read-Through）**：缓存层代为查询 DB
- **写回缓存（Write-Back）**：先写缓存，异步写 DB
- **缓存更新**：先写 DB 再删缓存（Cache Aside Pattern）

### 一致性方案
- **强一致性**：分布式事务（2PC / 3PC），性能低
- **最终一致性**：消息队列 + 重试 + 对账
- **补偿事务**：Saga（Choreography / Orchestration）
- **共识算法**：Paxos / Raft，用于配置同步和选主
`,
    source: "综合整理",
  },

  消息队列: {
    category: "mq",
    content: `## 消息队列核心概念

### 什么是消息队列
消息队列（Message Queue）是分布式系统中的异步通信中间件，生产者发送消息到队列，消费者从队列拉取或接收推送。解耦生产者和消费者，实现削峰填谷、异步处理。

### 主流消息队列对比

| 特性 | Kafka | RabbitMQ | RocketMQ | Pulsar |
|------|-------|---------|---------|--------|
| 性能 | 最高（百万级/秒） | 中等（万级/秒） | 高（十万级/秒） | 高（十万级/秒） |
| 吞吐 | 日志、流处理场景 | 低延迟业务场景 | 金融级事务场景 | 云原生、多租户 |
| 消息模型 | 分区日志（Pub/Sub） | 队列 + Exchange | Topic + Queue | Topic + 分层存储 |
| 顺序消息 | 分区内有序 | 单队列有序 | 分区有序 | 分区有序 |
| 消息可靠性 | ACK + ISR 副本 | 持久化 + 确认 | 同步刷盘 + 同步复制 | BookKeeper 持久化 |
| 延迟消息 | 不支持原生 | 支持（插件） | 支持（内置） | 支持 |
| 死信队列 | 支持 | 支持 | 支持 | 支持 |
| 事务消息 | 支持（2PC） | 不支持 | 支持 | 支持 |

### Kafka 核心概念
- **Topic**：消息的逻辑分类
- **Partition**：Topic 的分片，每个 Partition 是有序的日志文件
- **Producer**：消息生产者，可指定 partition key
- **Consumer Group**：消费者组，组内消费者分摊分区消费
- **Broker**：Kafka 服务器节点，每个节点管理多个 Partition
- **Offset**：消息在 Partition 内的偏移量，消费者通过 offset 追踪消费位置
- **ISR（In-Sync Replica）**：与 Leader 保持同步的副本集合

#### Kafka 关键特性
- **顺序写磁盘**：利用磁盘顺序 I/O（≈600MB/s），远快于随机 I/O
- **零拷贝**：利用 sendfile() 系统调用，数据直接从 PageCache → 网卡，绕过应用程序内存
- **批量压缩**：批量发送消息，支持 gzip / snappy / lz4 / zstd 压缩
- **分区自平衡**：新增或下线 Broker 时自动触发 Rebalance

#### Kafka 消息可靠性
- **acks=0**：不等待确认，可能丢消息（最快）
- **acks=1**：Leader 写入即确认（默认）
- **acks=-1(all)**：所有 ISR 写入后确认（最可靠）
- **min.insync.replicas**：设定最小同步副本数，配合 acks=all 保证不丢

### RabbitMQ 核心概念
- **Exchange**：交换机，决定消息路由到哪些队列
  - Direct：精确匹配 routing key
  - Topic：通配符匹配 routing key（\* 匹配一个词，# 匹配零或多个词）
  - Fanout：广播到所有绑定队列
  - Headers：根据消息头属性匹配
- **Binding**：Exchange 和 Queue 之间的绑定规则
- **Virtual Host**：逻辑隔离，多租户支持

### RocketMQ 核心概念
- **NameServer**：注册中心，维护 Topic 路由信息
- **Producer Group**：生产者分组，事务消息回查
- **Consumer Group**：消费者分组，消费进度管理
- **消息类型**：普通消息、顺序消息、事务消息、延时消息

### 消息可靠性保证
- **生产端**：发送确认 + 重试机制
- **服务端**：持久化存储 + 多副本同步
- **消费端**：手动 ACK + 幂等消费
- **最终一致性**：事务消息 + 本地事务表

### 使用场景
- **异步处理**：用户注册后异步发送邮件和短信
- **流量削峰**：秒杀请求先入队列，后端按能力消费
- **日志收集**：各服务日志 → Kafka → 实时计算 + 归档
- **事件驱动**：订单状态变更 → 发送事件 → 下游服务响应
- **系统解耦**：上下游服务通过 MQ 通信，变更不影响对方
`,
    source: "综合整理",
  },

  行为面试: {
    category: "behavioral",
    content: `## 行为面试核心方法论

### STAR 法则
行为面试的黄金框架，几乎所有问题都可以用 STAR 组织回答：

| 要素 | 说明 | 回答要点 |
|------|------|---------|
| **S**ituation | 当时面临什么背景 | 简要描述项目/团队/时间背景，1-2 句话 |
| **T**ask | 你需要完成什么任务 | 你的职责和目标是什么，你负责的部分 |
| **A**ction | 你具体做了什么 | **核心部分**：你的思考、决策、行动、技术方案 |
| **R**esult | 最终结果如何 | 量化结果（性能提升 X%、节省 Y 人天、营收增长 Z） |

### 常见问题分类

#### 项目经验类
- "介绍一个你最有成就感的项目"
- "你遇到的最难的技术挑战是什么"
- "你在项目中扮演什么角色"

回答策略：选择有技术深度的项目，重点放在你的**技术判断**和**关键决策**上。

#### 冲突协作类
- "和同事/产品经理意见不合怎么办"
- "如何推动跨部门合作"
- "带过新人吗？怎么带的"

回答策略：展示**同理心** + **理据** + **共赢思维**，不要说"我坚持己见"或"我让步了"。

#### 失败与成长类
- "介绍一次线上事故"
- "你犯过最大的错误是什么"
- "如果重来一次你会怎么做"

回答策略：选择**不太严重但学到了重要教训**的案例，重点在于反思和改进措施。

#### 目标规划类
- "你未来 3-5 年的职业规划"
- "为什么想加入我们公司"
- "你为什么离开上一家公司"

回答策略：目标要具体可行（如"在 XXX 方向达到资深水平"），与公司发展契合。

### 软技能准备

| 能力 | 面试官想看到 | 反面例子 |
|------|------------|---------|
| **技术判断力** | 对技术选型有明确理由，权衡过取舍 | "大家都用 Spring 所以我们也用" |
| **沟通能力** | 能把复杂问题讲清楚，有结构地表达 | 回答跳跃、细节过多、抓不住重点 |
| **主动性** | 主动发现问题并推动解决 | "等产品给需求" |
| **学习能力** | 从实践中总结方法论 | 同样的错误反复犯 |
| **领导力** | 技术影响力，能带动团队变好 | 只顾自己写代码不关心团队 |

### 回答注意事项
- **避免背台词**：面试官能感觉出来，准备要点但现场组织语言
- **避免过度谦虚**：不说"我运气好"，而是"我判断 XXX 方向更可行"
- **避免负面评价**：不说前公司的坏话，说"技术栈方向不匹配"
- **量化结果**：用数据说话比泛泛而谈有力 10 倍
- **准备反问**：面试结尾的反问展示了你的思考层次
`,
    source: "综合整理",
  },

  职业发展: {
    category: "career",
    content: `## 职业发展核心要点

### 求职准备流程
1. **简历优化**：STAR 原则写项目经历，量化成果（提升 X%，减少 Y%），关键词匹配目标岗位 JD
2. **刷题策略**：按频率排序 Top 100 热题 + 你目标公司的高频题，不要盲目刷 500+
3. **系统设计准备**：准备 5-6 道经典设计题（短链、秒杀、新闻流、聊天系统、打车系统）
4. **行为面试准备**：准备 6-8 个 STAR 案例覆盖项目、冲突、失败、领导力
5. **目标公司调研**：技术栈、业务模式、面试风格、团队方向

### 技术面试流程

| 阶段 | 考察重点 | 准备方法 |
|------|---------|---------|
| 简历筛选 | 匹配度、关键词、项目影响力 | 定制简历，突出硬技能和量化成果 |
| 技术一面 | 算法 + 数据结构 | LeetCode 热题 100 + 周赛 |
| 技术二面 | 系统设计 / 架构 | 经典设计题 + 白板练习 |
| 技术三面 | 项目深度 + 技术判断 | 深挖简历项目，准备技术选型理由 |
| HR 面 | 软技能、薪资期望、文化匹配 | 准备行为面试案例 + 市场行情 |
| 交叉面 | 综合能力 | 不同视角考察技术视野和沟通能力 |

### 技术成长阶段

| 年限 | 典型职级 | 核心能力 |
|------|---------|---------|
| 0-2 年 | 初级工程师 | 能独立完成任务，写好代码，掌握常用框架 |
| 2-5 年 | 中级工程师 | 能独立负责模块设计，理解技术原理，Code Review 他人 |
| 5-8 年 | 高级/资深 | 跨系统架构设计，技术选型决策，指导团队技术方向 |
| 8+ 年 | 专家/架构师 | 跨团队影响，战略级技术决策，行业影响力 |

### 薪资谈判
- **不先出价**：让面试官先提范围，或在最后一轮才谈薪资
- **了解行情**：脉脉/OfferShow/一亩三分地了解目标公司薪资结构
- **package 视角**：关注总包（base + 奖金 + 股票/期权），不只是月薪
- **跳槽涨幅**：通常 15-30%，能力强或抢手时可到 50%+（含股票）
- **谈判筹码**：已有 Offer 是最强的谈判杠杆

### 持续学习路径
- **技术广度**：关注业界趋势（云原生、AI Infra、大数据）、读技术博客
- **技术深度**：源码阅读（Spring / Redis / Kafka）、做开源贡献
- **软技能**：写作（技术博客）、演讲（内部分享）、英语（面试 + 文档）
- **社区参与**：参加技术大会、混技术社区、建立人脉网络

### 大厂面试要点
- **字节**：重视算法（白板 coding），项目经验问得深，文化面看"字节范"
- **阿里**：重视技术深度和项目影响力，常问源码和原理
- **腾讯**：产品思维 + 技术深度并重，面试轮次多
- **美团**：业务理解 + 技术实现，问落地细节
- **外企**：重视系统设计（白板）+ 英语沟通，流程长但体验好
`,
    source: "综合整理",
  },

  AI_基础设施: {
    category: "ai_infra",
    content: `## AI 基础设施核心概念

### AI 技术栈分层

| 层级 | 技术组件 | 说明 |
|------|---------|------|
| 硬件层 | GPU（NVIDIA A100/H100/B200）、TPU、网络（InfiniBand/RoCE）、存储（NVMe/NFS） | 算力底座 |
| 集群层 | Slurm / Kubernetes + Volcano / Ray | 任务调度、资源管理 |
| 训练层 | PyTorch / JAX / TensorFlow + DeepSpeed / Megatron / FSDP | 分布式训练框架 |
| 推理层 | vLLM / TensorRT-LLM / Triton Inference Server / TGI | 模型推理优化 |
| 模型层 | GPT / LLaMA / Claude / Qwen 等基础模型 + LoRA 微调 | 模型本身 |
| 应用层 | LangChain / LlamaIndex / RAG 框架 + Agent 框架 | 上层应用 |

### GPU 选型对比

| GPU | FP8 TFLOPS | HBM | 互联 | 典型用途 |
|-----|-----------|-----|------|---------|
| A100 (80G) | 624 | 80GB HBM2e | NVLink 600GB/s | 训练 + 推理（上一代主力） |
| H100 (80G) | 1979 | 80GB HBM3 | NVLink 900GB/s | 训练 + 推理（当前主力） |
| H200 (141G) | 1979 | 141GB HBM3e | NVLink 900GB/s | 大模型推理（显存优先） |
| B200 | 4500 | 192GB HBM3e | NVLink 1800GB/s | 旗舰训练 + 推理 |

### 分布式训练策略

- **数据并行（DP/DDP）**：每个 GPU 一份完整模型，分 batch 训练，梯度同步
- **模型并行（MP）**：将模型分层切分到不同 GPU，按序执行
- **张量并行（TP）**：将单个 Transformer block 内矩阵拆到多个 GPU 计算
- **流水线并行（PP）**：不同 GPU 处理不同 micro-batch，交错执行减少 bubble
- **FSDP（Fully Sharded Data Parallel）**：参数、梯度、优化器状态分片到各 GPU，通信计算重叠

#### ZeRO 优化三阶段
- **ZeRO-1**：优化器状态分片
- **ZeRO-2**：优化器状态 + 梯度分片
- **ZeRO-3**：优化器状态 + 梯度 + 模型参数分片（最省显存，通信量最大）

### 推理优化技术

| 技术 | 原理 | 效果 |
|------|------|------|
| **量化** | FP16 → INT8/INT4，减少显存占用和计算量 | 显存减半，速度 2-4x |
| **KV Cache** | 缓存 attention 的 K/V 矩阵，避免重复计算 | 自回归生成加速 10x+ |
| **Flash Attention** | 分块计算 + 重计算，减少 HBM 读写 | 训练加速 2-4x，显存 O(N) → O(√N) |
| **Speculative Decoding** | 小模型生成草稿 → 大模型验证 | 推理加速 2-3x |
| **Continuous Batching** | 推理引擎动态合并请求为 batch | 吞吐提升 5-20x |
| **PagedAttention** | 类似虚拟内存管理 KV Cache，消除碎片 | 显存利用率提升 4x（vLLM 核心） |

### RAG 技术栈

| 组件 | 技术选型 | 说明 |
|------|---------|------|
| Embedding | text-embedding-3-small / BGE / E5 | 将文本转为向量 |
| 向量数据库 | Milvus / Pinecone / Qdrant / Weaviate / Chroma | 存储和检索向量 |
| 分块策略 | RecursiveCharacterTextSplitter / Semantic Chunking | 文档分块策略 |
| 检索增强 | Hybrid Search（向量 + BM25） + Rerank | 提升检索质量 |
| Prompt 优化 | Context 压缩 + 动态 Few-shot | 减少 Token 消耗 |

### MLOps 工具链
- **实验追踪**：MLflow / Weights & Biases / Neptune / Aim
- **模型注册**：MLflow Model Registry / Hugging Face Hub
- **特征存储**：Feast / Tecton
- **数据标注**：Label Studio / Scale AI
- **模型监控**：WhyLabs / Arize / Evidently
- **A/B 测试**：自建实验平台 / LaunchDarkly
`,
    source: "综合整理",
  },

  Linux: {
    category: "linux",
    content: `## Linux 核心要点

### 常用命令分类

#### 文件操作
- \`ls -la\`：列出文件详情（-a 包含隐藏文件，-l 长格式）
- \`find . -name "*.log" -mtime +7\`：查找 7 天前的 .log 文件
- \`grep -r "error" --include="*.java"\`：递归搜索 Java 文件中的 error
- \`awk '{print \$1, \$NF}'\`：打印每行第一列和最后一列
- \`sed -i 's/old/new/g' file\`：原地替换文本
- \`tar -czf archive.tar.gz dir/\`：压缩目录

#### 进程管理
- \`ps aux --sort=-%mem\`：按内存降序查看所有进程
- \`top -o %CPU\`：实时查看 CPU 占用最高的进程
- \`htop\`：增强版 top（需安装）
- \`kill -15 PID\`：优雅终止进程（SIGTERM）
- \`kill -9 PID\`：强制终止（SIGKILL，谨慎使用）
- \`nohup command &\`：后台运行，退出终端不终止
- \`systemctl start/stop/status/restart\`：systemd 服务管理

#### 网络
- \`netstat -tlnp\` / \`ss -tlnp\`：查看监听端口
- \`curl -v http://example.com\`：调试 HTTP 请求详情
- \`ping -c 5 host\`：网络连通性测试
- \`traceroute host\` / \`mtr host\`：路由跟踪
- \`tcpdump -i eth0 port 80\`：抓包分析
- \`lsof -i :8080\`：查看端口被哪个进程占用

#### 磁盘与内存
- \`df -h\`：磁盘分区使用情况
- \`du -sh *\`：当前目录各项目大小
- \`iostat -x 1\`：磁盘 I/O 性能监控（每秒刷新）
- \`free -h\`：内存使用情况
- \`vmstat 1\`：虚拟内存、CPU、I/O 综合统计

### Linux 内核关键概念

#### 进程与线程
- Linux 不区分进程和线程——都使用 \`task_struct\` 表示
- 线程是共享地址空间的进程（通过 clone 系统调用创建）
- 调度器基于 CFS（Completely Fair Scheduler），时间复杂度 O(log n)

#### 文件系统
- 一切皆文件：普通文件、目录、设备、socket、pipe 都是 fd
- inode 存储元数据（权限、大小、时间戳），不存储文件名
- 硬链接共享同一个 inode（\`ln source target\`）
- 符号链接是独立的 inode 指向目标路径（\`ln -s source target\`）

#### I/O 模型

| 模型 | 特点 | 系统调用 |
|------|------|---------|
| 阻塞 I/O | 进程休眠等待 | read / write |
| 非阻塞 I/O | 立即返回，轮询检查 | O_NONBLOCK |
| I/O 多路复用 | 单线程监控多个 fd | select / poll / epoll |
| 信号驱动 I/O | fd 就绪时发信号通知 | SIGIO |
| 异步 I/O | 内核完成 I/O 后通知 | io_uring |

#### epoll 进阶
- \`epoll_create\`：创建 epoll 实例
- \`epoll_ctl\`：注册/修改/删除关心的 fd
- \`epoll_wait\`：等待事件就绪
- **水平触发（LT）**：fd 还有数据未读就会继续通知（默认）
- **边缘触发（ET）**：fd 状态变化时才通知一次，需配合非阻塞 I/O 循环读取
- epoll 相比 select/poll 的优势：O(1) 复杂度，无 1024 fd 上限，无需拷贝 fd 集合

### 性能排查常用命令

| 场景 | 命令 | 关注点 |
|------|------|--------|
| CPU 高 | \`top\` / \`perf top\` | 哪个进程/函数占 CPU |
| 内存高 | \`free -h\` / \`ps aux --sort=-%mem\` | 内存泄漏嫌疑进程 |
| IO 高 | \`iostat -x 1\` / \`iotop\` | await, %util |
| 网络慢 | \`ss -ti\` / \`ping\` / \`mtr\` | 延迟、丢包率 |
| 文件句柄泄漏 | \`lsof -p PID | wc -l\` | fd 数量是否持续增长 |
| 上下文切换高 | \`vmstat 1\` / \`pidstat -w\` | cs（context switch）列 |
`,
    source: "综合整理",
  },
};

/**
 * Get knowledge metadata for a tag, or null if not defined.
 * Returns { category, content, source } or null.
 */
export function getKnowledgeForTag(tag) {
  return knowledgeContent[tag] || null;
}

/**
 * Build a map of tag → { knowledgeContent, related question IDs } with
 * relatedQuestionIds filled from the actual question data (imported lazily).
 */
export function buildKnowledgeMap(questions) {
  const map = Object.create(null);

  // First pass: accumulate question IDs per tag
  for (const q of questions) {
    if (!q.tags) continue;
    for (const t of q.tags) {
      if (!map[t]) {
        map[t] = {
          questionIds: [],
          ...(knowledgeContent[t] || { category: q.category || "" }),
        };
      }
      map[t].questionIds.push(q.id);
    }
  }

  // Merge with pre-stored content for tags that have no associated questions
  for (const [tag, content] of Object.entries(knowledgeContent)) {
    if (!map[tag]) {
      map[tag] = { ...content, questionIds: [] };
    }
  }

  return map;
}
