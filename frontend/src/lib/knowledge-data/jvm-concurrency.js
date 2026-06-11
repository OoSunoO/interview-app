export const knowledge = {
  JVM: {
    category: "java_advanced",
    content:
      "##JVM 运行时内存区域\n\n- **程序计数器**（线程私有）：指向当前线程执行的字节码行号。\n- **虚拟机栈**（线程私有）：每个方法对应一个栈帧，存储局部变量表、操作数栈、动态链接、方法出口。\n- **本地方法栈**（线程私有）：为 native 方法服务。\n- **堆**（线程共享）：存放对象实例，GC 主要区域。分新生代（Eden + Survivor 0/1）和老年代。\n- **方法区**（线程共享）：存储类信息、常量、静态变量、JIT 编译后的代码。JDK 8+ 用元空间（直接内存）替代永久代。\n\n## 类加载过程\n\n加载 → 验证 → 准备 → 解析 → 初始化 → 使用 → 卸载。\n\n## 双亲委派模型\n\n启动类加载器 → 扩展类加载器 → 应用类加载器。自底向上检查类是否已加载，自顶向下尝试加载。\n\n### 内存管理\n- **对象分配**：大多数对象优先在新生代 Eden 区分配，大对象直接进入老年代（-XX:PretenureSizeThreshold）。\n- **TLAB（Thread Local Allocation Buffer）**：每个线程在 Eden 区分配一小块私有缓冲区，减少线程同步竞争。\n- **栈上分配 + 标量替换**：JIT 编译阶段将未逃逸的对象分配到栈上（栈帧中），方法结束自动销毁，减少 GC 压力。\n- **内存泄漏**：对象已无用但仍被 GC Roots 引用导致无法回收。常见原因：静态集合类（如 static List）、未关闭资源、ThreadLocal 未 remove()、内部类持有外部类引用。\n\n### 堆内存结构\n| 区域 | 说明 | GC 行为 |\n|------|------|---------|\n| 新生代（Young） | 存放新创建对象 | Minor GC 频繁 |\n| ├ Eden | 大多数对象首次分配位置 | 首次存活复制到 Survivor |\n| ├ Survivor 0 (From) | 年龄 1 的对象 | 每次 GC 年龄+1，复制到另一个 S |\n| └ Survivor 1 (To) | 年龄 1 的对象 | 同上，S0/S1 交替角色 |\n| 老年代（Old） | 存放长生命周期对象 | Major GC / Full GC |\n| 元空间（Metaspace） | 类元数据（JDK 8+） | 触发 Full GC 回收 |\n\n**OOM（OutOfMemoryError）常见类型**：\n- **Java heap space**：堆内存不足（对象泄漏或堆太小）。\n- **Metaspace**：元空间不足（类加载过多，如热部署场景）。\n- **Direct buffer memory**：直接内存不足（NIO 分配过多）。\n- **GC overhead limit exceeded**：GC 花费 >98% 时间回收 <2% 堆空间。\n- **Unable to create new native thread**：线程数超过操作系统限制。\n- **StackOverflowError**（非 OOM）：栈深度超出限制（递归过深）。",
    source: null,
    domain: "java_advanced",
  },
  GC: {
    category: "java_advanced",
    content:
      "##垃圾回收核心要点\n\n### 对象存活判断\n- **引用计数法**：无法解决循环引用，不为主流使用。\n- **可达性分析**：从 GC Roots（虚拟机栈引用、静态属性、常量引用、JNI 引用等）开始搜索，不可达对象可回收。\n\n### 引用类型\n| 类型 | 回收时机 | 场景 |\n|------|---------|------|\n| 强引用 | 永不回收 | 普通对象 |\n| 软引用 | 内存不足时回收 | 缓存 |\n| 弱引用 | 下次 GC 时回收 | WeakHashMap |\n| 虚引用 | 任何时候 | 跟踪对象回收 |\n\n### 垃圾收集算法\n- **标记-清除**：基础算法，产生内存碎片。\n- **复制**：新生代使用，将内存分为两块，每次使用一块。\n- **标记-整理**：老年代使用，无碎片但效率低。\n- **分代收集**：新生代用复制，老年代用标记-整理/清除。\n\n### 主流垃圾收集器\n- **G1**（JDK 9+ 默认）：Region 化，可预测停顿，无碎片。\n- **ZGC**（JDK 15+）：暂停 < 几毫秒，不受堆大小影响，最大支持 16TB。\n- **CMS**（JDK 9 标记过期，JDK 14 移除）：最短停顿时间，标记-清除，产生碎片。\n",
    source: null,
    domain: "java_advanced",
  },
  并发: {
    category: "java_advanced",
    content:
      "##线程基础\n\n- **进程**：程序的一次执行过程，系统资源分配的基本单位。\n- **线程**：CPU 调度的基本单位。同一进程的多个线程共享堆和方法区，私有程序计数器、虚拟机栈、本地方法栈。\n- Java 线程本质就是操作系统线程（JDK 1.2 后采用原生线程模型，一对一映射到内核线程）。\n- 严格来说只有一种创建线程的方式：new Thread().start()。其他方式（实现 Runnable/Callable、线程池）都是使用模式。\n\n### 线程六种状态\nNEW → RUNNABLE → BLOCKED（等待锁）/ WAITING（等待通知）/ TIMED_WAITING（带超时等待）→ TERMINATED。\n\n### sleep() vs wait()\n- sleep() 不释放锁，自动苏醒；wait() 释放锁，需 notify/notifyAll 唤醒。\n- sleep() 是 Thread 的静态方法；wait() 定义在 Object 上。\n\n### 死锁\n- 四个必要条件：互斥、请求与保持、不剥夺、循环等待。\n- 预防：破坏任一条件，常用资源顺序化（按固定顺序申请资源）。\n- 检测：jstack / JConsole。\n\n### 线程深入\n- **创建线程的四种方式**：继承 Thread、实现 Runnable（无返回值）、实现 Callable（有返回值，Future 获取）、线程池。\n- **线程优先级**：1~10，默认 5。优先级依赖操作系统实现（Windows 固定 7 级），不建议依赖优先级控制执行顺序。\n- **守护线程（Daemon）**：JVM 中所有非守护线程结束时退出。守护线程不能持有需关闭的资源（如 IO）。\n- **yield()**：暗示调度器让出 CPU，但调度器可以忽略。\n- **join()**：等待目标线程终止。底层通过 wait/notify 实现。\n- **中断机制**：interrupt() 设置中断标志，被中断线程通过检查标志或捕获 InterruptedException 响应。\n",
    source: null,
    domain: "java_advanced",
  },
  线程池: {
    category: "java_advanced",
    content:
      "##线程池核心要点\n\n### 优势\n降低资源消耗（线程复用）、提高响应速度（避免创建线程延迟）、提高可管理性（统一控制并发量）。\n\n### 核心参数\n- corePoolSize：核心线程数\n- maximumPoolSize：最大线程数\n- workQueue：任务队列（LinkedBlockingQueue、SynchronousQueue、ArrayBlockingQueue 等）\n- keepAliveTime：非核心线程空闲存活时间\n- handler：拒绝策略\n\n### 拒绝策略\n| 策略 | 行为 |\n|------|------|\n| AbortPolicy | 抛出 RejectedExecutionException（默认） |\n| CallerRunsPolicy | 调用者线程执行任务 |\n| DiscardPolicy | 直接丢弃新任务 |\n| DiscardOldestPolicy | 丢弃最早未处理的任务 |\n\n### 处理流程\n1. 运行线程 < corePoolSize → 新建线程执行\n2. 队列未满 → 放入队列\n3. 队列满且线程数 < maxPoolSize → 新建线程\n4. 队列满且线程数 = maxPoolSize → 执行拒绝策略\n\n### 注意事项\n- Executors 工具类不推荐：FixedThreadPool 使用无界队列可能 OOM；CachedThreadPool 最大线程数 Integer.MAX_VALUE 可能 OOM。\n- 推荐通过 ThreadPoolExecutor 构造函数创建。\n- 线程数设置：CPU 密集型 N+1，I/O 密集型 2N（N 为 CPU 核心数）。\n",
    source: null,
    domain: "java_advanced",
  },
  synchronized: {
    category: "java_advanced",
    content:
      "##synchronized 核心要点\n\n### 使用方式\n- 修饰实例方法 → 锁当前实例（this）\n- 修饰静态方法 → 锁当前 Class 对象\n- 修饰代码块 → 锁指定对象或类\n- 静态与非静态 synchronized 方法互不互斥（锁对象不同）\n\n### 底层原理\n- **同步语句块**：monitorenter + monitorexit 字节码指令。\n- **同步方法**：ACC_SYNCHRONIZED 标志。\n- 本质都是获取对象监视器 Monitor（基于 C++ ObjectMonitor）。\n\n### 锁升级（JDK 6+）\n无锁 → 偏向锁（JDK 15 默认关闭，JDK 18 废弃）→ 轻量级锁 → 重量级锁（不可降级）。\n\n### vs volatile\n| 维度 | volatile | synchronized |\n|------|----------|--------------|\n| 实现 | 内存屏障 | 操作系统互斥锁 |\n| 功能 | 仅保证可见性和有序性 | 可见性 + 有序性 + 原子性 |\n| 读开销 | 几乎与普通变量一样 | 需获取 monitor 锁 |\n| 适用 | 状态标志、DCL 单例 | 复合操作（如 i++） |\n",
    source: null,
    domain: "java_advanced",
  },
  volatile: {
    category: "java_advanced",
    content:
      "##volatile 核心要点\n\n### 1. 保证可见性\n声明为 volatile 后，每次使用都从主存读取，禁用 CPU 缓存。写操作立即刷新到主存，读操作从主存读取最新值。\n\n### 2. 禁止指令重排序\n通过插入内存屏障实现：\n- volatile 写：前面插入 StoreStore，后面插入 StoreLoad。\n- volatile 读：后面插入 LoadLoad + LoadStore。\n\n### 3. 不保证原子性\ninc++ 是复合操作（读、加、写），volatile 无法确保原子性。需用 synchronized、Lock 或 AtomicInteger。\n\n### 4. DCL 单例中的必要性\nuniqueInstance = new Singleton() 三步：分配内存、初始化、赋值。不加 volatile 可能发生指令重排（1->3->2），导致线程拿到未初始化对象。\n\n### 5. happens-before 规则\n对 volatile 变量的写 happens-before 后续对该变量的读。保证写之前的所有修改对读之后的操作可见。\n",
    source: null,
    domain: "java_advanced",
  },
  CAS: {
    category: "java_advanced",
    content:
      "##CAS（Compare And Swap）核心要点\n\n### 基本原理\n三个操作数：V（更新变量）、E（预期值）、N（新值）。仅当 V == E 时才将 V 更新为 N，否则不操作。Java 中通过 Unsafe 类的 compareAndSwapInt 等 native 方法（C++ 内联汇编）实现。\n\n### 乐观锁 vs 悲观锁\n| 维度 | 乐观锁 | 悲观锁 |\n|------|--------|--------|\n| 核心假设 | 冲突很少，提交时验证 | 冲突必然，读取时加锁 |\n| 底层原理 | CAS 或版本号 | 操作系统互斥锁 |\n| 阻塞情况 | 非阻塞，失败重试 | 阻塞，排队等待 |\n| Java 代表 | AtomicInteger、LongAdder | synchronized、ReentrantLock |\n| 适用场景 | 多读少写，冲突概率低 | 多写少读，一致性要求高 |\n\n### CAS 存在的问题\n1. **ABA 问题**：可用版本号/时间戳解决（AtomicStampedReference）。\n2. **循环时间长开销大**：长时间自旋浪费 CPU，可用 pause 指令优化。\n3. **只能保证一个共享变量的原子操作**：可用 AtomicReference 包装多个变量。\n",
    source: null,
    domain: "java_advanced",
  },
  AQS: {
    category: "java_advanced",
    content:
      "##AQS（AbstractQueuedSynchronizer）核心要点\n\n### 概念\nAQS 是 Java 并发包（JUC）的基石，为同步器（如 ReentrantLock、Semaphore、CountDownLatch）提供通用框架。核心是 CLH 锁队列的变体——虚拟双向队列（FIFO），通过自旋 + CAS 实现。\n\n### 核心机制\n- **state 状态位**：volatile int 类型，通过 CAS 修改。ReentrantLock 中 state=0 表示无锁，state>0 表示已锁定（可重入计数）。\n- **CLH 队列**：未获取到锁的线程包装为 Node 节点，通过 CAS 插入队列尾部，自旋等待前驱节点释放锁。\n- **独占/共享模式**：独占式（如 ReentrantLock）同一时刻只有一个线程持有锁；共享式（如 Semaphore、CountDownLatch）允许多个线程同时持有。\n\n### 模板方法模式\n子类需重写的方法：\n- tryAcquire(int)/tryRelease(int)：独占式获取/释放\n- tryAcquireShared(int)/tryReleaseShared(int)：共享式获取/释放\n- isHeldExclusively()：是否独占模式\n\n### 常见同步器\nReentrantLock、ReentrantReadWriteLock、Semaphore、CountDownLatch 等。\n",
    source: null,
    domain: "java_advanced",
  },
  IO: {
    category: "java_advanced",
    content:
      "##Java IO 模型\n\nIO 操作需经过两个步骤：内核等待设备准备好数据 + 内核将数据从内核空间拷贝到用户空间。\n\n### Java 中 3 种常见 IO 模型\n\n**BIO（Blocking I/O）**：同步阻塞。应用程序发起 read 调用后一直阻塞，直到数据从内核拷贝到用户空间。连接数不高时可用，高并发场景下无能为力。\n\n**NIO（Non-blocking/New I/O）**：Java 1.4 引入，对应 java.nio 包。可看作 I/O 多路复用模型。核心组件：\n- **Buffer**：缓冲区，读写操作的媒介。\n- **Channel**：通道，双向传输数据。\n- **Selector**：多路复用器，单线程管理多个客户端连接。\n- NIO 通过减少无效系统调用，降低 CPU 资源消耗。\n\n**AIO（NIO 2）**：Java 7 引入，异步 IO 模型，基于事件和回调机制。目前应用不广泛，Netty 曾尝试使用但放弃（Linux 性能提升不明显）。\n\n### IO 流体系\n字节流（InputStream/OutputStream）、字符流（Reader/Writer）、缓冲流（BufferedXxx）、随机访问文件（RandomAccessFile）。大量使用装饰器模式。\n\n### 文件和 IO 操作\n\n**File 类**：文件和目录路径名的抽象表示，操作文件元数据（创建、删除、重命名、权限检查），不涉及文件内容读写。\n\n| 常用方法 | 说明 |\n|----------|------|\n| exists() / isFile() / isDirectory() | 检查状态 |\n| createNewFile() / delete() / mkdirs() | 创建/删除 |\n| list() / listFiles() | 列出目录内容 |\n\n**文件输入流**：\n| 类 | 说明 |\n|----|------|\n| FileInputStream | 从文件读取字节数据 |\n| FileOutputStream | 向文件写入字节数据 |\n| FileReader | 从文件读取字符数据（便捷包装） |\n| FileWriter | 向文件写入字符数据 |\n\n**NIO（New I/O，Java 1.4+）**：\n- **Path**：替代 File 的路径表示，支持更丰富的路径操作。\n- **Files**：工具类，提供 readAllBytes()、write()、copy()、move() 等静态方法简化文件操作。\n- **FileChannel**：与 Buffer 配合，支持 transferTo/transferFrom 实现零拷贝。\n|- **WatchService**：监听文件系统变更事件。\n||- **内存映射文件**（MappedByteBuffer）：直接操作内存映射区域，适合大文件读写。\n",
    source: null,
    domain: "java_advanced",
  },
  类加载: {
    category: "java_advanced",
    content:
      "## 类加载机制\n\n> 来源：《深入理解 Java 虚拟机》\n\n### 类加载的七个阶段\n\n```\n加载 → 验证 → 准备 → 解析 → 初始化 → 使用 → 卸载\n```\n\n1. **加载（Loading）**：通过全限定类名获取类的二进制字节流，将其转化为方法区运行时数据结构，在堆中生成 Class 对象。\n2. **验证（Verification）**：确保字节流符合 JVM 规范（文件格式、元数据、字节码、符号引用验证）。\n3. **准备（Preparation）**：为类变量（static）在方法区分配内存并设零值（如 int=0，引用=null，final static 直接赋值）。\n4. **解析（Resolution）**：将常量池中的符号引用替换为直接引用（指向内存地址的指针）。\n5. **初始化（Initialization）**：执行类构造器 <clinit>() 方法，按代码顺序赋值 static 变量和 static 块。\n6. **使用**：对象实例化和调用。\n7. **卸载**：类被 GC 回收（需满足三个条件：所有实例被回收、ClassLoader 被回收、无反射引用）。\n\n### 双亲委派模型\n\n```\n启动类加载器（Bootstrap ClassLoader）\n    ↕\n扩展类加载器（Extension ClassLoader）\n    ↕\n应用类加载器（Application ClassLoader）\n```\n\n**工作原理**：\n- 自底向上检查类是否已加载（findLoadedClass）。\n- 自顶向下尝试加载（父加载器加载失败才轮到子加载器）。\n\n**优势**：\n- 避免核心 API 被篡改（如用户自定义 java.lang.String 不会被加载）。\n- 保证 Java 类库的安全性。\n\n**破坏双亲委派**：\n- 继承 ClassLoader 并重写 loadClass() 方法。\n- 典型场景：Tomcat 的 WebAppClassLoader（优先加载 Web 应用类）、SPI 机制（ServiceLoader 使用线程上下文类加载器）。",
    source: "JavaGuide",
    domain: "java_advanced",
  },
  JMM: {
    category: "java_advanced",
    content:
      "## Java 内存模型（JMM）\n\n> 来源：《深入理解 Java 虚拟机》\n\n### 什么是 JMM？\nJMM（Java Memory Model）是一种规范，定义了多线程程序中共享变量的访问规则，保证并发场景下的可见性、有序性和原子性。\n\n### 主存与工作内存\n- **主内存**：所有线程共享，存储所有变量（实例字段、静态字段、数组元素）。\n- **工作内存**：每个线程私有，存储从主内存拷贝的变量副本。\n\n线程不能直接操作主内存，必须先将变量从主内存拷贝到工作内存，修改后再写回主内存。\n\n### happens-before 原则\n如果两个操作满足 happens-before 关系，则前一个操作的结果对后一个操作可见。\n\n**关键规则**：\n1. **程序顺序规则**：线程内每个操作 happens-before 后续操作。\n2. **volatile 规则**：volatile 变量的写 happens-before 后续对该变量的读。\n3. **锁规则**：解锁 happens-before 后续的加锁。\n4. **传递性**：A happens-before B, B happens-before C → A happens-before C。\n5. **start 规则**：线程 start() happens-before 该线程的任何操作。\n6. **join 规则**：线程的所有操作 happens-before 其他线程对该线程的 join() 返回。\n\n### 三大特性\n\n| 特性 | 定义 | 保障机制 |\n|------|------|---------|\n| **原子性** | 一个或多个操作不可分割 | 基本类型读写（除 long/double）、synchronized、Lock、Atomic 类 |\n| **可见性** | 一个线程修改共享变量，其他线程能立即看到 | volatile、synchronized（解锁前刷新到主存）、final |\n| **有序性** | 程序按代码顺序执行 | volatile（禁止指令重排）、synchronized（同一锁串行执行）、happens-before 规则 |\n\n### 指令重排序\n编译器和处理器为优化性能对指令重新排序，但必须遵守 **as-if-serial 语义**（单线程内不影响结果）。\n\n**内存屏障**（Memory Barrier）：\n- LoadLoad：禁止读-读重排序。\n- StoreStore：禁止写-写重排序。\n- LoadStore：禁止读-写重排序。\n- StoreLoad：禁止写-读重排序（最重开销最大，volatile 写插入）。",
    source: "JavaGuide",
    domain: "java_advanced",
  },
  jvm: {
    category: "java_advanced",
    content:
      "## JVM 核心知识点概览\n\n### JVM 运行时数据区域\n- **程序计数器**（线程私有）：指向当前线程执行的字节码行号地址。\n- **Java 虚拟机栈**（线程私有）：每个方法对应一个栈帧，存储局部变量表、操作数栈、动态链接和方法出口。\n- **本地方法栈**（线程私有）：为 native 方法服务，HotSpot 中与 Java 虚拟机栈合二为一。\n- **堆**（线程共享）：存放对象实例，GC 主要作用的区域。分为新生代（Eden + Survivor）和老年代。\n- **方法区/元空间**（线程共享）：存储类信息、常量、静态变量。JDK 8+ 用元空间（本地内存）替代永久代。\n\n### 垃圾回收\n- 判断对象存活：引用计数法（无法解决循环引用）和可达性分析（从 GC Roots 出发）。\n- 引用类型：强引用（永不回收）、软引用（内存不足回收）、弱引用（下次 GC 回收）、虚引用（跟踪回收）。\n- 垃圾收集算法：标记-清除（有碎片）、标记-复制（无碎片但浪费空间）、标记-整理（无碎片但效率低）。\n- 常见垃圾收集器：G1（JDK 9+ 默认）、ZGC（暂停 < 几毫秒）、CMS（JDK 14 移除）。\n\n### 类加载机制\n- 七个阶段：加载 → 验证 → 准备 → 解析 → 初始化 → 使用 → 卸载。\n- 双亲委派模型：启动类加载器 → 扩展类加载器 → 应用类加载器。自底向上检查，自顶向下加载。\n",
    source: "JavaGuide",
    domain: "java_advanced",
  },
  concurrency: {
    category: "java_advanced",
    content:
      "## 并发编程核心知识点概览\n\n### 线程基础\n- Java 线程在 JDK 1.2 后基于原生线程（Native Threads）实现，一对一映射到内核线程。\n- 六种状态：NEW → RUNNABLE → BLOCKED / WAITING / TIMED_WAITING → TERMINATED。\n- sleep() 不释放锁，自动苏醒；wait() 释放锁，需 notify/notifyAll 唤醒。\n\n### synchronized\n- 修饰实例方法锁 this，修饰静态方法锁 Class 对象，修饰代码块锁指定对象。\n- 底层原理：同步语句块使用 monitorenter + monitorexit 字节码指令。\n- 锁升级（JDK 6+）：无锁 → 偏向锁 → 轻量级锁 → 重量级锁（不可降级）。\n\n### volatile\n- 保证可见性：每次使用从主存读取，写操作立即刷新到主存。\n- 禁止指令重排序：通过插入内存屏障（StoreStore、StoreLoad、LoadLoad、LoadStore）实现。\n- 不保证原子性：复合操作（如 i++）需使用 synchronized 或 AtomicInteger。\n\n### CAS（Compare And Swap）\n- 三个操作数：V（更新变量）、E（预期值）、N（新值）。\n- 乐观锁实现，非阻塞，失败后自旋重试。\n- 问题：ABA、长时间自旋浪费 CPU、只能保证单个变量的原子操作。\n\n### AQS（AbstractQueuedSynchronizer）\n- JUC 的基石，为 ReentrantLock、Semaphore、CountDownLatch 等同步器提供框架。\n- 核心：volatile int state + CLH FIFO 队列，通过 CAS 修改 state。\n\n### 线程池\n- 核心参数：corePoolSize、maximumPoolSize、keepAliveTime、workQueue、threadFactory、handler。\n- 处理流程：核心线程 → 任务队列 → 最大线程 → 拒绝策略。\n- 不推荐 Executors 工具类（可能 OOM），推荐 ThreadPoolExecutor 构造函数。\n",
    source: "JavaGuide",
    domain: "java_advanced",
  },
  JVM_内存模型: {
    category: "jvm",
    content:
      "## JVM 内存模型\n\n### 运行时数据区\n| 区域 | 线程共享 | 作用 |\n|------|----------|------|\n| 堆（Heap） | 是 | 存放对象实例，GC 主要区域 |\n| 方法区（Method Area） | 是 | 类信息、常量、静态变量 |\n| 虚拟机栈（VM Stack） | 否 | 局部变量表、操作数栈、方法出口 |\n| 本地方法栈（Native Stack） | 否 | 本地方法调用 |\n| 程序计数器（PC） | 否 | 当前线程执行的字节码行号 |\n\n### 堆内存划分\n- **新生代（Young）**：Eden + Survivor0 + Survivor1（默认 8:1:1）\n  - 对象优先分配在 Eden\n  - Minor GC 后存活对象移入 Survivor\n  - 经过多次 GC 仍存活 → 移入老年代\n- **老年代（Old）**：存放长期存活的对象（Major GC / Full GC）\n- **元空间（Metaspace）**：JDK 8+ 替代永久代，使用本地内存\n\n### GC 算法\n| 算法 | 原理 | 适用 |\n|------|------|------|\n| 标记-清除 | 标记存活对象 → 回收未标记对象 | 老年代（有碎片） |\n| 标记-复制 | 将存活对象复制到另一块空间 | 新生代（效率高） |\n| 标记-整理 | 标记存活 → 向一端移动 → 清理边界外 | 老年代（无碎片） |\n\n### 常用 GC 收集器\n- **Serial**：单线程，Stop-The-World，客户端模式\n- **Parallel**：多线程，关注吞吐量，JDK 8 默认\n- **CMS**：并发标记清除，低延迟，有碎片问题\n- **G1**：分区式，可预测停顿时间，JDK 9+ 默认\n- **ZGC**：JDK 15+，极低延迟（<10ms），超大堆\n",
    source: null,
    domain: "jvm",
  },
  类加载机制: {
    category: "jvm",
    content:
      "## 类加载机制\n\n### 类加载过程\n1. **加载（Loading）**：通过全类名获取二进制字节流，在堆中生成 Class 对象\n2. **验证（Verification）**：文件格式、元数据、字节码、符号引用验证\n3. **准备（Preparation）**：为静态变量分配内存并设零值\n4. **解析（Resolution）**：将符号引用替换为直接引用\n5. **初始化（Initialization）**：执行类构造器 <clinit>() 方法\n\n### 双亲委派模型\n- Bootstrap ClassLoader → Extension ClassLoader → Application ClassLoader → 自定义\n- **工作流程**：加载类时先委派给父加载器，父加载器无法加载才自己尝试\n- **优点**：避免核心类被篡改（如 java.lang.String 始终由 Bootstrap 加载）\n- **打破双亲委派**：自定义 ClassLoader 重写 loadClass()，或使用线程上下文类加载器（如 JDBC SPI）\n",
    source: null,
    domain: "jvm",
  },
  并发基础: {
    category: "concurrency",
    content:
      "## 并发编程基础\n\n### 线程 vs 进程\n| | 进程 | 线程 |\n|--|------|------|\n| 资源 | 独立内存空间 | 共享进程内存 |\n| 切换开销 | 大（切换地址空间） | 小 |\n| 通信 | IPC（管道、Socket等） | 共享变量 |\n\n### Java 线程创建方式\n1. 继承 Thread 类\n2. 实现 Runnable 接口（无返回值）\n3. 实现 Callable 接口（有返回值，配合 FutureTask）\n4. 线程池（ExecutorService）\n\n### 线程状态（6种）\nNEW → RUNNABLE → BLOCKED / WAITING / TIMED_WAITING → TERMINATED\n\n### synchronized 原理\n- 基于监视器（Monitor），每个对象关联一个 Monitor\n- 同步代码块使用 monitorenter/monitorexit 指令\n- JDK 6 优化：偏向锁 → 轻量级锁 → 重量级锁（锁升级）\n\n### volatile 关键字\n- **可见性**：写操作立即刷新到主存，读操作从主存读取\n- **禁止指令重排序**：内存屏障（Memory Barrier）\n- **不保证原子性**：i++ 操作需要加锁\n\n### CAS（Compare-And-Swap）\n- 乐观锁机制：比较当前值 → 相等则更新\n- ABA 问题：加版本号（AtomicStampedReference）\n- 底层：Unsafe 类的 compareAndSwap 方法（CPU 原子指令）\n",
    source: null,
    domain: "concurrency",
  },
  JUC_工具: {
    category: "concurrency",
    content:
      "## JUC（java.util.concurrent）\n\n### 锁机制\n| 工具 | 特性 |\n|------|------|\n| ReentrantLock | 可重入、公平/非公平、可中断、超时 |\n| ReentrantReadWriteLock | 读读不互斥、读写互斥、写写互斥 |\n| StampedLock | JDK 8，乐观读，比读写锁更高效 |\n\n### 线程池（ThreadPoolExecutor）\n- **核心参数**：corePoolSize, maxPoolSize, keepAliveTime, workQueue, handler\n- **工作流程**：核心线程 → 工作队列 → 最大线程 → 拒绝策略\n- **拒绝策略**：Abort（抛异常）、Discard（丢弃）、DiscardOldest（丢弃最旧）、CallerRuns（调用者执行）\n- **Executors 工厂方法**：newFixedThreadPool, newCachedThreadPool, newSingleThreadExecutor, newScheduledThreadPool\n\n### 并发容器\n- **ConcurrentHashMap**：分段锁 / CAS + synchronized（JDK 8）\n- **CopyOnWriteArrayList**：写时复制，读无锁，适合读多写少\n- **BlockingQueue**：ArrayBlockingQueue, LinkedBlockingQueue, DelayQueue, SynchronousQueue\n- **ConcurrentLinkedQueue**：无锁队列（CAS）\n",
    source: null,
    domain: "concurrency",
  },
};
