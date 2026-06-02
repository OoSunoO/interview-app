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
- 使用自定义异常更好表达业务语义。`,
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
