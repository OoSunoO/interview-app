export const knowledge = {
  并发: {
    category: "concurrency",
    content: `##线程基础

### 进程 vs 线程
- **进程**：系统资源分配的基本单位，独立地址空间，切换开销大。
- **线程**：CPU 调度的基本单位，共享进程资源，切换开销小。

Java 线程本质上是操作系统线程（一对一映射到内核线程）。

### 线程六种状态
NEW → RUNNABLE → BLOCKED / WAITING / TIMED_WAITING → TERMINATED

### sleep() vs wait()
- sleep() 不释放锁，自动苏醒；wait() 释放锁，需 notify/notifyAll 唤醒。
- sleep() 是 Thread 静态方法；wait() 定义在 Object 上。

### 死锁
四个必要条件：互斥、请求与保持、不剥夺、循环等待。
预防：破坏任一条件，常用资源顺序化。
检测：jstack / JConsole。`,
    source: null,
    domain: "concurrency",
  },
  线程池: {
    category: "concurrency",
    content: `##线程池核心要点

### 优势
降低资源消耗（线程复用）、提高响应速度、提高可管理性。

### 核心参数
- corePoolSize：核心线程数
- maximumPoolSize：最大线程数
- workQueue：任务队列
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
不推荐 Executors 工具类（FixedThreadPool 无界队列可能 OOM，CachedThreadPool 最大线程数 Integer.MAX_VALUE）。推荐通过 ThreadPoolExecutor 构造函数创建。`,
    source: null,
    domain: "concurrency",
  },
  synchronized: {
    category: "concurrency",
    content: `##synchronized 核心要点

### 使用方式
- 修饰实例方法 → 锁当前实例（this）
- 修饰静态方法 → 锁当前 Class 对象
- 修饰代码块 → 锁指定对象

### 底层原理
- 同步语句块：monitorenter + monitorexit 指令。
- 同步方法：ACC_SYNCHRONIZED 标志。
- 本质是获取对象监视器 Monitor。

### 锁升级（JDK 6+）
无锁 → 偏向锁（JDK 15 默认关闭）→ 轻量级锁 → 重量级锁（不可降级）

### vs volatile
| 维度 | volatile | synchronized |
|------|----------|--------------|
| 实现 | 内存屏障 | 操作系统互斥锁 |
| 功能 | 可见性 + 有序性 | 可见性 + 有序性 + 原子性 |
| 读开销 | 几乎与普通变量一样 | 需获取 monitor 锁 |`,
    source: null,
    domain: "concurrency",
  },
  volatile: {
    category: "concurrency",
    content: `## volatile 核心要点

### 保证可见性
每次使用从主存读取，写操作立即刷新到主存。

### 禁止指令重排序
通过插入内存屏障实现：
- volatile 写：前面插入 StoreStore，后面插入 StoreLoad。
- volatile 读：后面插入 LoadLoad + LoadStore。

### 不保证原子性
复合操作（如 i++）需使用 synchronized、Lock 或 AtomicInteger。

### DCL 单例中的必要性
new Singleton() 三步：分配内存、初始化、赋值。不加 volatile 可能发生指令重排（1->3->2），导致线程拿到未初始化对象。`,
    source: null,
    domain: "concurrency",
  },
  CAS: {
    category: "concurrency",
    content: `##CAS（Compare And Swap）核心要点

### 基本原理
三个操作数：V（更新变量）、E（预期值）、N（新值）。仅当 V == E 时才将 V 更新为 N。Java 中通过 Unsafe 类的 native 方法实现。

### 乐观锁 vs 悲观锁
| 维度 | 乐观锁 | 悲观锁 |
|------|--------|--------|
| 核心假设 | 冲突很少 | 冲突必然 |
| 底层原理 | CAS 或版本号 | 互斥锁 |
| 阻塞情况 | 非阻塞，重试 | 排队等待 |
| 适用场景 | 读多写少 | 写多读少 |

### CAS 问题
1. **ABA 问题**：AtomicStampedReference 解决。
2. **循环时间长开销大**：长时间自旋浪费 CPU。
3. **只能保证一个共享变量的原子操作**：AtomicReference 包装多个变量。`,
    source: null,
    domain: "concurrency",
  },
  AQS: {
    category: "concurrency",
    content: `##AQS（AbstractQueuedSynchronizer）

### 概念
JUC 的基石，为 ReentrantLock、Semaphore、CountDownLatch 提供通用框架。核心是 CLH 队列的变体——虚拟双向 FIFO 队列。

### 核心机制
- **state 状态位**：volatile int，通过 CAS 修改。
- **CLH 队列**：未获取锁的线程包装为 Node 节点，CAS 插入队列尾部。
- **独占/共享模式**：独占式（ReentrantLock）vs 共享式（Semaphore）。

### 模板方法
- tryAcquire(int)/tryRelease(int)：独占式获取/释放
- tryAcquireShared(int)/tryReleaseShared(int)：共享式获取/释放`,
    source: null,
    domain: "concurrency",
  },
  并发基础: {
    category: "concurrency",
    content: `## 并发编程基础

### 线程创建方式
1. 继承 Thread 类
2. 实现 Runnable 接口
3. 实现 Callable 接口（配合 FutureTask）
4. 线程池（ExecutorService）

### 线程状态
NEW → RUNNABLE → BLOCKED / WAITING / TIMED_WAITING → TERMINATED

### 三大特性
| 特性 | 定义 | 保障机制 |
|------|------|---------|
| 原子性 | 操作不可分割 | synchronized、Lock、Atomic 类 |
| 可见性 | 修改对其他线程可见 | volatile、synchronized |
| 有序性 | 按代码顺序执行 | volatile（禁止指令重排）、happens-before |

### happens-before 原则
1. 程序顺序规则
2. volatile 规则
3. 锁规则
4. 传递性
5. start 规则
6. join 规则`,
    source: null,
    domain: "concurrency",
  },
  JUC_工具: {
    category: "concurrency",
    content: `## JUC 并发工具

### 锁机制
| 工具 | 特性 |
|------|------|
| ReentrantLock | 可重入、公平/非公平、可中断、超时 |
| ReentrantReadWriteLock | 读读不互斥、读写互斥、写写互斥 |
| StampedLock | JDK 8，乐观读，比读写锁更高效 |

### 并发容器
- **ConcurrentHashMap**：CAS + synchronized（JDK 8）
- **CopyOnWriteArrayList**：写时复制，读无锁，适合读多写少
- **BlockingQueue**：ArrayBlockingQueue、LinkedBlockingQueue、DelayQueue、SynchronousQueue
- **ConcurrentLinkedQueue**：无锁队列（CAS）

### 同步工具
- **CountDownLatch**：等待多个线程完成
- **CyclicBarrier**：多个线程互相等待到达屏障
- **Semaphore**：控制同时访问的线程数
- **Exchanger**：线程间数据交换`,
    source: null,
    domain: "concurrency",
  },
};
