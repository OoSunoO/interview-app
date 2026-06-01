/**
 * Knowledge Point Content Data
 * Pre-stored knowledge explanations for each tag.
 * Maps tag name → { content, category, relatedQuestionIds }
 *
 * Content is Markdown. Empty content means the knowledge point has no
 * pre-written explanation (just shows related questions).
 */
export const knowledgeContent = {
  // ── Java 基础 ──
  基础: {
    category: "java_basic",
    content: `## Java 基础

Java 是一种面向对象、跨平台的编程语言，核心特性包括：

### 跨平台原理
Java 源码编译为字节码（.class），由 JVM（Java Virtual Machine）解释执行。"一次编写，到处运行"靠的是不同平台上的 JVM 实现。

### 基本数据类型
- **整数型**：byte（1B）、short（2B）、int（4B）、long（8B）
- **浮点型**：float（4B）、double（8B）
- **字符型**：char（2B，Unicode）
- **布尔型**：boolean（理论上1位，实际取决于JVM实现）

### 关键字
- \`final\`：不可变（类、方法、变量）
- \`static\`：类级别共享
- \`volatile\`：保证可见性，禁止指令重排序
- \`transient\`：不参与序列化
- \`synchronized\`：同步锁

### 常见陷阱
1. Integer 缓存范围 -128~127，超出此范围用 \`==\` 比较会返回 false，应使用 \`.equals()\`
2. switch 支持的数据类型：int、char、byte、short、enum、String（Java 7+）
3. 浮点数精度问题：使用 BigDecimal 处理金额计算`,
    relatedQuestionIds: [],
  },
  面向对象: {
    category: "java_basic",
    content: `## 面向对象（OOP）

三大特性：**封装**、**继承**、**多态**。

### 封装
- 将数据和操作数据的方法绑定在一起
- 通过访问控制修饰符（private、default、protected、public）隐藏内部实现
- getter/setter 是封装的标准实践

### 继承
- 使用 \`extends\` 关键字
- Java 只支持单继承（一个类只能有一个直接父类）
- 通过接口实现多继承的效果
- \`super\` 关键字引用父类对象
- 构造方法不被继承，子类必须通过 \`super()\` 调用父类构造器

### 多态
- 同一个方法在不同对象上有不同的行为
- 实现条件：继承（或实现接口）+ 方法重写 + 父类引用指向子类对象
- 编译看左边（声明类型），运行看右边（实际类型）
- 重载（Overload）：编译时多态，同名不同参
- 重写（Override）：运行时多态，子类重新定义父类方法`,
    relatedQuestionIds: [],
  },
  集合: {
    category: "java_collections",
    content: `## Java 集合框架

Java 集合框架分为两大体系：**Collection** 和 **Map**。

### Collection 接口体系
- **List**：有序可重复
  - ArrayList：数组实现，查询快 O(1)，插入慢 O(n)
  - LinkedList：双向链表实现，插入快 O(1)，查询慢 O(n)
  - Vector：线程安全（已过时，用 Collections.synchronizedList 替代）
- **Set**：无序不可重复
  - HashSet：基于 HashMap，O(1) 查找
  - LinkedHashSet：可保持插入顺序
  - TreeSet：基于 TreeMap，红黑树，元素自动排序 O(log n)
- **Queue**：队列，FIFO
  - PriorityQueue：优先队列，堆实现

### Map 接口
- **HashMap**：数组+链表+红黑树，允许 null key/value
- **LinkedHashMap**：双向链表保持插入/访问顺序
- **TreeMap**：红黑树排序
- **ConcurrentHashMap**：线程安全，分段锁/CAS

### ArrayList vs LinkedList
| 维度 | ArrayList | LinkedList |
|------|-----------|------------|
| 底层 | Object[] 数组 | 双向链表 |
| 随机访问 | O(1) | O(n) |
| 插入中间 | O(n) | O(1)（已知位置） |
| 内存 | 紧凑 | 每个元素有额外指针开销 |

### HashMap 核心原理
1. 默认容量 16，负载因子 0.75
2. key 的 hashCode 决定桶位置
3. 哈希冲突用链表存储（拉链法）
4. 链表长度 ≥ 8 且数组长度 ≥ 64 时转为红黑树
5. 扩容为原容量的 2 倍，rehash 所有元素`,
    relatedQuestionIds: [],
  },
  HashMap: {
    category: "java_collections",
    content: `## HashMap 深度解析

### 数据结构
JDK 1.8+：数组 + 链表 + 红黑树

### 核心参数
- 初始容量（capacity）：16（必须为 2 的幂）
- 负载因子（load factor）：0.75
- 树化阈值：8（链表长度 ≥ 8 且数组长度 ≥ 64 转红黑树）
- 退化阈值：6（红黑树元素 ≤ 6 转回链表）

### put 流程
1. 计算 key.hashCode()，二次扰动（高16位异或低16位）
2. hash & (n-1) 取模定位桶
3. 桶为空 → 直接插入
4. 桶不为空 → 遍历链表/红黑树
   - key 已存在 → 覆盖 value
   - key 不存在 → 尾插法追加
5. 插入后检查是否超过阈值（cap × loadFactor），超则扩容

### 扩容机制
- 新建 2 倍大小数组
- 重新计算每个元素位置
- 元素在新数组中的位置：原位置 或 原位置+旧容量

### 线程安全问题
- JDK 1.7 头插法会导致死循环（环形链表）
- JDK 1.8 尾插法修复了死循环，但仍有数据覆盖问题
- 并发场景用 ConcurrentHashMap`,
    relatedQuestionIds: [],
  },
  ConcurrentHashMap: {
    category: "java_collections",
    content: `## ConcurrentHashMap

线程安全的 HashMap 实现，采用分段锁和 CAS 机制。

### JDK 1.7 实现
- **分段锁（Segment）**：将数据分为多个 Segment，每个 Segment 是一把锁
- 默认 16 个 Segment，最多 16 个线程并发写
- put 操作：先定位 Segment，再在 Segment 内加锁 put

### JDK 1.8+ 实现
- 放弃分段锁，改用 **CAS + synchronized**
- CAS：空桶时直接 CAS 插入
- synchronized：桶有元素时锁住链表/红黑树头节点
- 并发度更高，粒度更细

### 关键特性
- 不允许 null key 和 null value
- size() 方法：先无锁累加，不一致则加锁重试
- 扩容支持多线程协助（transfer 任务拆分）
- Node 的 val 和 next 用 volatile 保证可见性

### 与 Hashtable 的区别
- Hashtable 对所有方法加 synchronized 锁
- ConcurrentHashMap 锁粒度更细，并发性能更好`,
    relatedQuestionIds: [],
  },
  ArrayList: {
    category: "java_collections",
    content: `## ArrayList 解析

### 数据结构
Object[] 数组实现，支持动态扩容。

### 核心方法
- **add(E e)**：追加到末尾，O(1) 摊销；数组满时扩容 1.5 倍
- **add(int index, E e)**：插入指定位置，需要移动元素 O(n)
- **get(int index)**：直接数组取元素 O(1)
- **remove(int index)**：删除后元素前移 O(n)
- **size()**：返回实际元素个数

### 扩容机制
\`grow()\` 方法：新容量 = 旧容量 + (旧容量 >> 1)（1.5 倍）
如果新容量不够，直接扩容到 minCapacity

### vs LinkedList
- ArrayList 随机访问更快
- LinkedList 头尾插入更快
- ArrayList 内存更紧凑
- 频繁插入/删除中间元素用 LinkedList

### 注意事项
- ArrayList 不是线程安全的
- 遍历时删除元素用 Iterator.remove() 避免 ConcurrentModificationException
- subList() 返回的是视图，修改会影响原列表`,
    relatedQuestionIds: [],
  },
  LinkedList: {
    category: "java_collections",
    content: `## LinkedList 解析

### 数据结构
双向链表实现，节点包含 prev、item、next 三个字段。

### 核心方法
- **add(E e)**：追加到末尾 O(1)
- **addFirst/Last**：头尾插入 O(1)
- **get(int index)**：遍历到指定位置 O(n)
- **remove()**：默认删除头节点 O(1)
- **remove(int index)**：先遍历到位置再删除 O(n)

### 作为 Queue/Deque
LinkedList 实现了 Deque 接口，可同时作队列和双端队列使用：
- offer/poll/peek：队列操作
- push/pop：栈操作

### vs ArrayList
LinkedList 在内存开销上更大（每个节点存 3 个引用），但插入删除操作更高效（不涉及数组拷贝）。`,
    relatedQuestionIds: [],
  },
  String: {
    category: "java_basic",
    content: `## String 解析

### 不可变性
String 被 \`final\` 修饰，底层 char[] 也由 \`final\` 修饰。
一旦创建就不能改变，所有"修改"操作都返回新对象。

### 字符串常量池
- JVM 维护一个 String Pool（字符串常量池）
- 字面量创建（\`"abc"\`）先从池中查找，有则直接引用
- \`new String("abc")\` 会在堆中创建新对象，池中也有
- \`intern()\` 方法将字符串加入池中并返回池中引用

### String vs StringBuilder vs StringBuffer
| 类 | 线程安全 | 性能 | 场景 |
|---|---|---|---|
| String | 安全（不可变） | 拼接慢 | 不常变化的字符串 |
| StringBuilder | 不安全 | 快 | 单线程大量拼接 |
| StringBuffer | 安全（synchronized） | 较慢 | 多线程字符串操作 |

### 常见面试题
- \`new String("ab") + new String("cd")\` 创建几个对象？答：6 个（2个String对象+2个char[]+StringBuilder+结果）
- 字符串比较用 \`equals()\` 而非 \`==\`
- String 的 hashCode() 缓存策略：首次计算后缓存`,
    relatedQuestionIds: [],
  },
  JVM: {
    category: "java_advanced",
    content: `## JVM（Java Virtual Machine）

### 内存区域（运行时数据区）

**线程私有：**
- **程序计数器**：当前线程执行的字节码行号
- **虚拟机栈**：方法调用栈，每个方法对应一个栈帧
- **本地方法栈**：Native 方法调用

**线程共享：**
- **堆**：对象实例、数组，GC 主要区域
- **方法区**（元空间/Metaspace）：类信息、常量、静态变量、JIT 编译代码

### 垃圾回收（GC）

**判断对象存活：**
- 引用计数法（主流 JVM 不用）
- 可达性分析（GC Roots 向下搜索）

**GC 算法：**
- 标记-清除（Mark-Sweep）：有碎片
- 标记-复制（Copying）：无碎片，浪费空间
- 标记-整理（Mark-Compact）：无碎片，效率低

**分代收集：**
- 年轻代：Minor GC 频繁，用复制算法
  - Eden : Survivor0 : Survivor1 = 8:1:1
- 老年代：Major GC 较少，用标记-整理/清除
- 元空间：存储类元数据

### GC 收集器
- Serial：单线程，暂停所有用户线程（Stop The World）
- Parallel：多线程并行，关注吞吐量
- CMS：并发标记清除，关注低延迟
- G1：分区堆，可预测停顿时间（JDK 9+ 默认）
- ZGC：低延迟大堆，JDK 11+`,
    relatedQuestionIds: [],
  },
  GC: {
    category: "java_advanced",
    content: `## 垃圾回收（GC）详解

### GC Roots
可作为 GC Roots 的对象：
1. 虚拟机栈中引用的对象
2. 方法区中类静态属性引用的对象
3. 方法区中常量引用的对象
4. Native 方法引用的对象

### 触发条件
- **Minor GC**：Eden 区满
- **Major GC/Full GC**：老年代满、System.gc()、元空间不足、晋升失败（HandlePromotionFailure）

### 对象晋升
- 对象在 Eden 出生
- 经过第一次 Minor GC 存活 → Survivor 区，age+1
- 每熬过一次 Minor GC age+1
- age ≥ 15（默认）→ 晋升到老年代
- 大对象直接进入老年代（-XX:PretenureSizeThreshold）

### Stop The World
所有 GC 算法都会暂停应用线程。暂停时间取决于：
- 存活对象数量
- 堆大小
- GC 算法设计`,
    relatedQuestionIds: [],
  },
  并发: {
    category: "java_advanced",
    content: `## Java 并发编程

### 线程基础
- 创建方式：继承 Thread、实现 Runnable、实现 Callable（有返回值）、线程池
- 线程状态：NEW → RUNNABLE → BLOCKED/WAITING/TIMED_WAITING → TERMINATED

### synchronized
- 对象锁（实例方法）、类锁（静态方法）、代码块锁
- 原理：monitorenter/monitorexit 指令
- JDK 6 优化：偏向锁 → 轻量级锁（CAS自旋） → 重量级锁（操作系统互斥量）

### volatile
- 保证可见性：写操作立即刷新到主内存
- 禁止指令重排序（内存屏障）
- 不保证原子性

### Lock 体系
- ReentrantLock：可重入、公平/非公平、可中断、支持 Condition
- ReadWriteLock：读写分离，读读不互斥
- AQS（AbstractQueuedSynchronizer）：CLH 队列 + 状态位，Lock 的基石

### 线程池
ThreadPoolExecutor 核心参数：
- corePoolSize：核心线程数
- maximumPoolSize：最大线程数
- keepAliveTime：非核心线程存活时间
- workQueue：任务等待队列
- 拒绝策略：AbortPolicy（抛异常）、DiscardPolicy（丢弃）、DiscardOldestPolicy（丢弃最旧）、CallerRunsPolicy（调用者执行）`,
    relatedQuestionIds: [],
  },
  线程池: {
    category: "java_advanced",
    content: `## 线程池详解

### ThreadPoolExecutor 七大参数
1. **corePoolSize**：核心线程数（一直存活）
2. **maximumPoolSize**：最大线程数
3. **keepAliveTime**：非核心线程最大空闲时间
4. **unit**：时间单位
5. **workQueue**：阻塞队列（如 LinkedBlockingQueue、ArrayBlockingQueue、SynchronousQueue）
6. **threadFactory**：线程工厂
7. **handler**：拒绝策略

### 执行流程
1. 线程数 < corePoolSize → 创建新线程执行
2. 线程数 ≥ corePoolSize → 任务入队
3. 队列满 & 线程数 < maxPoolSize → 创建新线程执行
4. 队列满 & 线程数 = maxPoolSize → 执行拒绝策略

### 常用线程池
- **newCachedThreadPool**：核心 0，最大 Integer.MAX_VALUE，队列 SynchronousQueue
- **newFixedThreadPool**：核心=最大，队列 LinkedBlockingQueue
- **newSingleThreadExecutor**：单线程，保证顺序执行
- **newScheduledThreadPool**：支持定时/周期任务

### 拒绝策略
- AbortPolicy（默认）：抛 RejectedExecutionException
- CallerRunsPolicy：调用者线程执行
- DiscardPolicy：直接丢弃
- DiscardOldestPolicy：丢弃队头最旧任务`,
    relatedQuestionIds: [],
  },
  synchronized: {
    category: "java_advanced",
    content: `## synchronized 深度解析

### 使用方式
1. **实例方法**：锁的是当前实例对象（this）
2. **静态方法**：锁的是 Class 对象
3. **代码块**：锁的是指定对象

### 底层原理
- 字节码层面：monitorenter / monitorexit 指令
- 每个对象有一个 monitor（管程）关联
- monitorenter 尝试获取 monitor 所有权（计数器+1）
- monitorexit 释放所有权（计数器-1）

### 锁升级（JDK 6+ 优化）
无锁 → 偏向锁 → 轻量级锁 → 重量级锁（不可逆）

1. **偏向锁**：只有一个线程访问时，CAS 记录线程 ID，无需同步
2. **轻量级锁**：多线程交替访问时，CAS 自旋获取锁
3. **重量级锁**：多线程竞争激烈时，挂起阻塞线程

### vs ReentrantLock
| 特性 | synchronized | ReentrantLock |
|------|-------------|---------------|
| 可重入 | ✓ | ✓ |
| 公平性 | 非公平 | 可配置 |
| 尝试获取 | ✗ | tryLock() |
| 可中断 | ✗ | lockInterruptibly() |
| Condition | wait/notify | Condition 对象 |
| 性能 | JVM 持续优化 | 早期更好，现差异不大 |`,
    relatedQuestionIds: [],
  },
  volatile: {
    category: "java_advanced",
    content: `## volatile 关键字

### 作用
1. **保证可见性**：对 volatile 变量的写操作立即刷新到主内存，读取时从主内存读取
2. **禁止指令重排序**：通过内存屏障（Memory Barrier）实现
3. **不保证原子性**：i++ 这类复合操作仍然有线程安全问题

### 实现原理
- 写 volatile 变量时，JVM 插入 StoreStore 屏障 + StoreLoad 屏障
- 读 volatile 变量时，JVM 插入 LoadLoad 屏障 + LoadStore 屏障
- 内存屏障：一种 CPU 指令，防止 CPU 或编译器对指令重排序

### Happens-Before 规则
volatile 变量规则：对一个 volatile 域的写，happens-before 于任意后续对这个 volatile 域的读

### 使用场景
1. 状态标志（boolean running）
2. 双重检查锁定（DCL）中的 instance 声明
3. 需要保证可见性的单一读写操作`,
    relatedQuestionIds: [],
  },
  CAS: {
    category: "java_advanced",
    content: `## CAS（Compare And Swap）

### 原理
CAS 是乐观锁的核心实现，包含三个操作数：内存位置 V、预期原值 A、新值 B。
仅当 V 的值等于 A 时，将 V 更新为 B，否则不操作。

### 底层实现
- CPU 层面：cmpxchg 指令（x86），通过 lock 前缀保证原子性
- Java 层面：Unsafe 类提供 compareAndSwapObject/Int/Long 方法
- JUC 包：AtomicInteger、AtomicReference 等基于 CAS

### ABA 问题
CAS 只检查值是否相同，不关心期间是否被修改过又改回原值。
解决方案：AtomicStampedReference（带版本号）

### 自旋开销
- CAS 失败时会不断重试（自旋）
- 高竞争场景下 CPU 开销很大
- JVM 自适应自旋：根据历史成功率动态调整自旋次数

### vs synchronized
| 特性 | CAS | synchronized |
|------|-----|-------------|
| 类型 | 乐观锁 | 悲观锁 |
| 阻塞 | 不阻塞（自旋） | 阻塞 |
| 适用 | 低竞争 | 高竞争 |
| 开销 | 用户态 | 用户态+内核态切换 |`,
    relatedQuestionIds: [],
  },
  IO: {
    category: "java_advanced",
    content: `## Java IO 体系

### 分类
**按方向：** 输入流（InputStream/Reader）、输出流（OutputStream/Writer）
**按单位：** 字节流（Stream）、字符流（Reader/Writer）
**按功能：** 节点流（直接操作数据源）、处理流（包装节点流）

### 字节流 vs 字符流
- 字节流读取原始字节（图片、视频等二进制文件）
- 字符流处理文本（考虑编码、解码）
- InputStreamReader/OutputStreamWriter 是字节流到字符流的桥梁

### 常用类
- **FileInputStream/FileOutputStream**：文件字节流
- **BufferedInputStream/BufferedOutputStream**：带缓冲，提高性能
- **BufferedReader/BufferedWriter**：带缓冲的字符流，支持 readLine()
- **DataInputStream/DataOutputStream**：读写基本数据类型
- **ObjectInputStream/ObjectOutputStream**：对象序列化

### NIO（New IO）
- **Channel**：双向通道（FileChannel、SocketChannel）
- **Buffer**：缓冲区（ByteBuffer、CharBuffer）
- **Selector**：多路复用，单线程处理多个 Channel
- 非阻塞 IO，适用于高并发网络编程

### BIO vs NIO vs AIO
- BIO：同步阻塞，每个连接一个线程
- NIO：同步非阻塞，Selector 多路复用
- AIO：异步非阻塞，回调通知`,
    relatedQuestionIds: [],
  },
  AQS: {
    category: "java_advanced",
    content: `## AQS（AbstractQueuedSynchronizer）

### 定义
AQS 是 Java 并发包（JUC）的基石，提供了一个基于 FIFO 等待队列的同步框架。
ReentrantLock、Semaphore、CountDownLatch、ReentrantReadWriteLock 等都基于 AQS 实现。

### 核心组件
1. **state**（volatile int）：同步状态，由子类定义含义
   - ReentrantLock：0 表示未锁定，>0 表示重入次数
   - Semaphore：可用许可数
2. **CLH 队列**：FIFO 双向链表，存储等待获取锁的线程
3. **独占/共享模式**
   - 独占：tryAcquire/tryRelease（如 ReentrantLock）
   - 共享：tryAcquireShared/tryReleaseShared（如 Semaphore）

### 实现原理
- acquire()：尝试获取 → 失败则入队 → 阻塞（park）
- release()：尝试释放 → 成功则唤醒队首（unpark）
- 支持可中断、超时、条件等待

### 自定义同步器
只需重写 tryAcquire/tryRelease（独占）或 tryAcquireShared/tryReleaseShared（共享），
AQS 自动管理队列和阻塞/唤醒逻辑。`,
    relatedQuestionIds: [],
  },

  // ── 计算机基础 ──
  操作系统: {
    category: "cs_basics",
    content: `## 操作系统基础知识

### 进程 vs 线程
- **进程**：资源分配的最小单位，独立地址空间
- **线程**：CPU 调度的最小单位，共享进程资源
- 进程间通信（IPC）：管道、消息队列、共享内存、信号量、Socket
- 线程同步：互斥锁、读写锁、条件变量、信号量

### 进程调度算法
- FCFS（先来先服务）：简单，但平均等待时间长
- SJF（短作业优先）：平均等待时间最短，但长作业可能饥饿
- 优先级调度：低优先级可能饥饿
- 时间片轮转（RR）：公平，但上下文切换开销
- 多级反馈队列：兼顾响应时间和吞吐量（Linux 默认）

### 内存管理
- 分页：固定大小，避免外部碎片
- 分段：逻辑分段，支持共享保护
- 虚拟内存：按需调入，页表 + TLB（快表）
- 页面置换算法：FIFO、LRU（最久未使用）、Clock（近似 LRU）

### 死锁
- 必要条件：互斥、持有并等待、不可剥夺、循环等待
- 银行家算法：避免死锁
- 鸵鸟策略：忽略（大部分现代 OS）`,
    relatedQuestionIds: [],
  },
  网络: {
    category: "cs_basics",
    content: `## 计算机网络基础

### OSI 七层模型
1. 物理层 → 2. 数据链路层 → 3. 网络层 → 4. 传输层 → 5. 会话层 → 6. 表示层 → 7. 应用层

### TCP/IP 四层模型
1. **网络接口层**（以太网、WiFi）
2. **网络层**（IP、ICMP、ARP）
3. **传输层**（TCP、UDP）
4. **应用层**（HTTP、DNS、FTP、SMTP）

### TCP vs UDP
| 特性 | TCP | UDP |
|------|-----|-----|
| 连接 | 面向连接 | 无连接 |
| 可靠 | 可靠（确认重传） | 不可靠 |
| 有序 | 保证顺序 | 不保证 |
| 速度 | 慢（三次握手、拥塞控制） | 快（无额外开销） |
| 场景 | 网页、文件传输 | 视频直播、DNS、游戏 |

### 三次握手
1. Client → Server：SYN（seq=x）
2. Server → Client：SYN+ACK（seq=y, ack=x+1）
3. Client → Server：ACK（seq=x+1, ack=y+1）

### 四次挥手
1. Client → Server：FIN
2. Server → Client：ACK
3. Server → Client：FIN
4. Client → Server：ACK（TIME_WAIT 2MSL）`,
    relatedQuestionIds: [],
  },
  TCP: {
    category: "cs_basics",
    content: `## TCP 详解

### 三次握手（建立连接）
1. **SYN**：客户端发送 SYN（seq=x），进入 SYN_SENT
2. **SYN+ACK**：服务端回复 SYN+ACK（seq=y, ack=x+1），进入 SYN_RCVD
3. **ACK**：客户端发送 ACK（seq=x+1, ack=y+1），进入 ESTABLISHED
4. 服务端收到 ACK 后也进入 ESTABLISHED

**为什么是三次？** 防止已失效的连接请求到达服务器（网络延迟导致旧的 SYN 被服务器误认为新请求）。

### 四次挥手（断开连接）
1. **FIN**：主动方发送 FIN，进入 FIN_WAIT_1
2. **ACK**：被动方回复 ACK，进入 CLOSE_WAIT（主动方进入 FIN_WAIT_2）
3. **FIN**：被动方发送 FIN，进入 LAST_ACK
4. **ACK**：主动方回复 ACK，进入 TIME_WAIT（2MSL 后关闭）

**为什么是四次？** TCP 是全双工的，双方需要各自关闭自己的方向。
**为什么 TIME_WAIT 要 2MSL？** 保证最后一个 ACK 到达，防止旧连接数据干扰新连接。

### 流量控制
- **滑动窗口机制**：接收方通过窗口大小告知发送方发送量
- 避免接收方来不及处理导致丢包

### 拥塞控制
1. **慢启动**：窗口从 1 开始指数增长，到阈值后转为拥塞避免
2. **拥塞避免**：窗口线性增长
3. **快重传**：收到 3 个重复 ACK 立即重传
4. **快恢复**：快重传后窗口减半，进入拥塞避免`,
    relatedQuestionIds: [],
  },
  HTTP: {
    category: "cs_basics",
    content: `## HTTP 协议

### HTTP 方法
- GET：获取资源，幂等
- POST：创建资源（或触发操作），不幂等
- PUT：更新/替换资源，幂等
- DELETE：删除资源，幂等
- PATCH：部分更新资源
- HEAD：获取响应头（无 body）
- OPTIONS：查询支持的方法

### 状态码
- 1xx：信息（101 Switching Protocols）
- 2xx：成功（200 OK, 201 Created, 204 No Content）
- 3xx：重定向（301 永久, 302 临时, 304 未修改）
- 4xx：客户端错误（400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found）
- 5xx：服务端错误（500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable）

### HTTP/1.1 vs HTTP/2 vs HTTP/3
| 特性 | HTTP/1.1 | HTTP/2 | HTTP/3 |
|------|----------|--------|--------|
| 传输 | TCP | TCP | QUIC (UDP) |
| 复用 | 顺序（队头阻塞） | 多路复用（有队头阻塞） | 多路复用（无队头阻塞） |
| 头部 | 明文 | HPACK 压缩 | QPACK 压缩 |
| 推送 | ✗ | 服务器推送 | 服务器推送 |

### HTTPS
HTTP + TLS/SSL 加密传输
- 混合加密：非对称密钥交换对称密钥，对称密钥加密数据
- CA 证书验证身份`,
    relatedQuestionIds: [],
  },

  // ── 数据库 ──
  MySQL: {
    category: "database",
    content: `## MySQL

### 存储引擎对比
| 特性 | InnoDB | MyISAM |
|------|--------|--------|
| 事务 | 支持 | 不支持 |
| 行锁 | 支持（MVCC） | 表锁 |
| 外键 | 支持 | 不支持 |
| 全文索引 | 支持（5.6+） | 支持 |
| 场景 | OLTP 业务 | 读多写少的分析 |

### 索引
- **B+ Tree**：InnoDB 默认索引结构，叶子节点存数据/主键
- **聚簇索引**：主键索引，叶子节点存完整行数据
- **二级索引**：叶子节点存主键值（回表查询）
- **联合索引**：最左前缀原则
- **覆盖索引**：索引包含所有查询字段，无需回表
- **索引下推（ICP）**：MySQL 5.6+，在索引层过滤数据

### 事务与隔离级别
- ACID 特性：原子性（Atomicity）、一致性（Consistency）、隔离性（Isolation）、持久性（Durability）
- 隔离级别（由低到高）：READ UNCOMMITTED → READ COMMITTED → REPEATABLE READ（MySQL 默认） → SERIALIZABLE
- 脏读、不可重复读、幻读（MVCC + Gap Lock 解决）

### 锁
- 行锁：Record Lock、Gap Lock、Next-Key Lock
- 表锁：意向锁、MDL 锁
- 死锁检测：等待图算法`,
    relatedQuestionIds: [],
  },
  Redis: {
    category: "database",
    content: `## Redis

### 数据结构
- **String**：字符串，最大 512MB
- **Hash**：哈希表，适合存对象
- **List**：双向链表，LPUSH/RPOP 实现队列
- **Set**：无序集合，支持交并差操作
- **Sorted Set（ZSet）**：有序集合，跳表实现
- **Bitmap**：位图，适合统计
- **HyperLogLog**：基数统计
- **Stream**：消息队列（5.0+）

### 持久化
- **RDB**：快照，定期全量保存，文件紧凑恢复快，可能丢数据
- **AOF**：追加日志，每个写操作记录，文件大恢复慢，数据更安全
- **混合持久化（4.0+）**：RDB 做全量 + AOF 做增量

### 过期策略
- 定期删除（每隔 100ms 随机检查一批）
- 惰性删除（访问时检查过期）
- 内存淘汰：volatile-lru、allkeys-lru、volatile-ttl、noeviction

### 主从 + 哨兵 + 集群
- 主从复制：异步复制
- 哨兵：监控、自动故障转移
- Cluster：分片，16384 个哈希槽

### 缓存问题
- 缓存穿透：布隆过滤器
- 缓存击穿：互斥锁、热点数据永不过期
- 缓存雪崩：过期时间加随机值`,
    relatedQuestionIds: [],
  },
  事务: {
    category: "database",
    content: `## 数据库事务

### ACID 特性
- **Atomicity（原子性）**：事务要么全部成功，要么全部回滚（Undo Log）
- **Consistency（一致性）**：事务前后数据完整性约束一致
- **Isolation（隔离性）**：并发事务互不干扰（MVCC + 锁）
- **Durability（持久性）**：提交后永久保存（Redo Log）

### 隔离级别
1. **READ UNCOMMITTED**（读未提交）：可能脏读
2. **READ COMMITTED**（读已提交）：可能不可重复读（Oracle 默认）
3. **REPEATABLE READ**（可重复读）：可能幻读（MySQL InnoDB 默认，MVCC+Next-Key 解决）
4. **SERIALIZABLE**（串行化）：性能最低，无并发问题

### MVCC（多版本并发控制）
- 每行数据有多个版本（隐藏列 DB_TRX_ID、DB_ROLL_PTR）
- 每个事务有 ReadView（活跃事务列表）
- 一致性非锁定读：读快照版本，不加锁
- RC 级别每次查询生成新 ReadView，RR 级别第一次查询时生成

### 锁分类
- 共享锁（S Lock）/ 排他锁（X Lock）
- 意向共享锁（IS）/ 意向排他锁（IX）
- 记录锁（Record Lock）/ 间隙锁（Gap Lock）/ Next-Key Lock`,
    relatedQuestionIds: [],
  },

  // ── React ──
  React: {
    category: "react",
    content: `## React 核心概念

### 组件
- 函数组件 vs 类组件
- JSX：JavaScript 的语法扩展
- Props：从父组件传入，不可修改
- State：组件内部状态，变化触发重渲染

### 生命周期（类组件）
- constructor → render → componentDidMount → componentDidUpdate → componentWillUnmount

### Hooks（函数组件，16.8+）
- **useState**：声明状态
- **useEffect**：副作用（替代生命周期）
- **useContext**：上下文
- **useReducer**：复杂状态管理
- **useMemo/useCallback**：性能优化
- **useRef**：引用 DOM 或存储可变值

### 虚拟 DOM 与 Diff
- Virtual DOM：JavaScript 对象表示 UI
- Diff 算法：同层比较、key 优化
- Reconciliation：对比新旧 VNode 更新真实 DOM

### 数据流
- 单向数据流：父 → 子
- 状态提升（Lifting State Up）
- Context API：跨层级传递
- Redux/Zustand：全局状态管理`,
    relatedQuestionIds: [],
  },
  Hooks: {
    category: "react",
    content: `## React Hooks 详解

### 规则
1. 只在最顶层调用 Hooks（不能在循环、条件、嵌套函数中）
2. 只在 React 函数组件或自定义 Hook 中调用

### useState
\`\`\`js
const [state, setState] = useState(initialValue);
\`\`\`
- setState 推动重新渲染
- 更新函数：setState(prev => prev + 1)

### useEffect
\`\`\`js
useEffect(() => {
  // 副作用代码
  return () => { /* 清理 */ };
}, [dependencies]);
\`\`\`
- []：仅在 mount/unmount 执行
- [dep]：dep 变化时执行
- 不传：每次渲染后执行

### useRef
- 保存可变值，变化不触发重渲染
- 访问 DOM：\`<div ref={myRef}>\`

### useMemo / useCallback
- \`useMemo\`：缓存计算结果
- \`useCallback\`：缓存函数引用
- 配合 React.memo 使用避免不必要的子组件渲染

### 自定义 Hook
将组件逻辑提取为可复用的函数，以 \`use\` 开头命名。`,
    relatedQuestionIds: [],
  },

  // ── AI Agent ──
  Agent: {
    category: "agent",
    content: `## AI Agent

### 定义
AI Agent（智能体）是能感知环境、自主决策并执行行动的智能系统。

### 核心特征
1. **自主性**：无需人类持续干预
2. **感知能力**：观察环境状态
3. **决策能力**：规划行动方案
4. **工具使用**：调用外部工具完成任务

### ReAct 范式
**推理（Reasoning）+ 行动（Acting）** 交织进行：
1. Thought：分析当前状态和思考下一步
2. Action：执行一个动作（调用工具）
3. Observation：观察执行结果
4. 循环直到任务完成

### Agent vs 传统 AI
| 维度 | 传统 AI | Agent |
|------|---------|-------|
| 输出 | 单次推理 | 多步循环 |
| 工具 | 无 | 可调用外部工具 |
| 记忆 | 无 | 有（短期+长期） |
| 目标 | 回答问题 | 完成任务 |

### 记忆系统
- **短期记忆**：上下文窗口
- **长期记忆**：外部存储（向量数据库 RAG）
- **工作记忆**：当前任务相关`,
    relatedQuestionIds: [],
  },
  "Multi-Agent": {
    category: "agent",
    content: `## Multi-Agent 系统

### 协作模式
1. **主从模式**：一个主 Agent 协调多个子 Agent
2. **辩论模式**：多个 Agent 各自推理，交叉验证
3. **流水线模式**：分阶段处理，每个 Agent 负责一段

### 优势
- 分工明确，专业化
- 并行处理，提高效率
- 交叉验证，减少幻觉

### 挑战
- 通信开销
- 协调复杂度
- 错误传播（幻觉放大）

### 通信协议
- 标准化消息格式
- 异步 vs 同步通信
- 共享记忆 vs 私有记忆`,
    relatedQuestionIds: [],
  },
  LLM: {
    category: "ai",
    content: `## 大语言模型（LLM）

### 基本原理
基于 Transformer 架构，通过海量文本预训练学习语言规律。
通过"下一个词预测"任务学习语言分布。

### Transformer 核心
- **Self-Attention**：每个词关注序列中所有其他词
- **多头注意力（Multi-Head Attention）**：多个注意力头学习不同关系
- **位置编码**：注入序列位置信息
- **Feed-Forward Network**：非线性变换

### 训练流程
1. 预训练（Pre-training）：海量无标注数据，学习通用知识
2. SFT（Supervised Fine-Tuning）：有标注数据，对齐人类偏好
3. RLHF（Reinforcement Learning from Human Feedback）：强化学习优化

### Prompt Engineering
- Few-shot：给示例
- Chain-of-Thought：引导推理过程
- System Prompt：设定角色和行为准则`,
    relatedQuestionIds: [],
  },
  RAG: {
    category: "ai",
    content: `## RAG（Retrieval-Augmented Generation）

### 基本流程
1. **索引**：文档分块 → 向量化 → 存入向量数据库
2. **检索**：用户问题 → 向量化 → 搜索相似文档块
3. **生成**：问题 + 检索结果 → LLM → 生成答案

### 优势
- 知识实时更新，无需重新训练
- 减少幻觉（基于事实检索）
- 可追溯信息来源

### 常见技术
- **Chunk 策略**：固定大小、语义分块、递归拆分
- **Embedding 模型**：BGE、text-embedding-ada
- **检索优化**：HyDE（假设文档嵌入）、RAG-Fusion（多查询融合）
- **重排序（Re-ranking）**：精排优化检索结果`,
    relatedQuestionIds: [],
  },

  // ── DevOps ──
  Docker: {
    category: "devops",
    content: `## Docker

### 核心概念
- **镜像（Image）**：只读模版，包含应用和依赖
- **容器（Container）**：镜像的运行实例
- **Dockerfile**：构建镜像的指令文件
- **仓库（Registry）**：存储分发镜像

### 常用命令
- docker build：构建镜像
- docker run：启动容器
- docker ps：查看运行中的容器
- docker exec：进入容器
- docker-compose：管理多容器应用

### Dockerfile 指令
- FROM：基础镜像
- RUN：构建时执行命令
- COPY/ADD：拷贝文件
- CMD/ENTRYPOINT：容器启动命令
- EXPOSE：暴露端口
- WORKDIR：工作目录`,
    relatedQuestionIds: [],
  },
  K8s: {
    category: "devops",
    content: `## Kubernetes（K8s）

### 核心组件
- **Pod**：最小部署单元，一个或多个容器
- **Deployment**：声明式更新 Pod 和 ReplicaSet
- **Service**：Pod 的网络抽象，负载均衡
- **ConfigMap / Secret**：配置管理
- **Ingress**：HTTP 路由规则

### 架构
- **Master 节点**：API Server、Scheduler、Controller Manager、etcd
- **Worker 节点**：Kubelet、Kube-proxy、Container Runtime

### 核心能力
- **自动伸缩**：HPA（Horizontal Pod Autoscaler）
- **服务发现**：DNS + Service
- **存储编排**：PV/PVC
- **滚动更新**：零停机部署
- **自愈**：故障自动重启 Pod`,
    relatedQuestionIds: [],
  },

  // ── 其他 ──
  JavaScript: {
    category: "frontend",
    content: `## JavaScript 基础

### 数据类型
- **基本类型**：string、number、boolean、null、undefined、symbol、bigint
- **引用类型**：object（包括 array、function、date 等）
- typeof 运算符：typeof null → "object"（历史遗留问题）

### 作用域与闭包
- 全局作用域、函数作用域、块级作用域（let/const）
- 闭包：函数 + 函数创建时的词法环境的引用
- 闭包用途：数据私有化、柯里化、回调函数

### this 指向
- 默认绑定：全局对象（严格模式 undefined）
- 隐式绑定：调用对象
- 显式绑定：call/apply/bind
- new 绑定：新创建的对象
- 箭头函数：继承外层 this（定义时确定）

### 事件循环（Event Loop）
- 同步代码 → microtask（Promise.then、MutationObserver） → macrotask（setTimeout、I/O）
- async/await 是 Promise 的语法糖`,
    relatedQuestionIds: [],
  },
  CSS: {
    category: "frontend",
    content: `## CSS 基础

### 盒模型
- content-box：width = content
- border-box：width = content + padding + border
- box-sizing: border-box 更符合直觉

### 布局
- **Flexbox**：一维布局
- **Grid**：二维布局
- **Position**：static、relative、absolute、fixed、sticky
- **Float**：旧式布局

### 选择器优先级
!important > 内联样式 > ID > 类/属性/伪类 > 元素/伪元素

### 常用属性
- display：block、inline、inline-block、flex、grid、none
- visibility：visible、hidden（占据空间）
- opacity：透明度`,
    relatedQuestionIds: [],
  },
  Spring: {
    category: "java_advanced",
    content: `## Spring 框架

### IoC（控制反转）
- 将对象的创建和管理交给 Spring 容器
- 依赖注入（DI）：构造器注入、Setter 注入、字段注入

### AOP（面向切面编程）
- 切面（Aspect）：横切关注点（日志、事务、安全）
- 连接点（Join Point）：方法执行
- 通知（Advice）：@Before、@After、@Around
- 切点（Pointcut）：匹配连接点的表达式

### Spring Bean 生命周期
实例化 → 属性赋值 → Aware 接口 → BeanPostProcessor(before) → init-method/@PostConstruct → BeanPostProcessor(after) → 就绪 → DisposableBean/destroy-method

### 常用注解
- @Component/@Service/@Repository/@Controller
- @Autowired/@Resource
- @Configuration/@Bean
- @Transactional`,
    relatedQuestionIds: [],
  },
};

/**
 * Get knowledge content for a tag, or empty placeholder if not defined.
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
          ...(knowledgeContent[t] || { content: "", category: q.category || "" }),
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
