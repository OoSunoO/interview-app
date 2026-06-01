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
- **OOP vs POP**：OOP 将业务抽象为对象交互，易维护、易复用、易扩展。

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
`,
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
    source: null,
  },

  // React
  React: {
    category: "react",
    source: null,
  },
  Hooks: {
    category: "react",
    source: null,
  },

  // AI Agent
  Agent: {
    category: "agent",
    source: null,
  },
  "Multi-Agent": {
    category: "agent",
    source: null,
  },

  // AI basics
  LLM: {
    category: "ai",
    source: null,
  },
  RAG: {
    category: "ai",
    source: null,
  },

  // Frontend
  JavaScript: {
    category: "frontend",
    source: null,
  },
  CSS: {
    category: "frontend",
    source: null,
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
  const map = {};

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
