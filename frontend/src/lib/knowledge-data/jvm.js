export const knowledge = {
  JVM: {
    category: "jvm",
    content: `##JVM 运行时内存区域

- **程序计数器**（线程私有）：指向当前线程执行的字节码行号。
- **虚拟机栈**（线程私有）：每个方法对应一个栈帧，存储局部变量表、操作数栈、动态链接、方法出口。
- **本地方法栈**（线程私有）：为 native 方法服务。
- **堆**（线程共享）：存放对象实例，GC 主要区域。分新生代（Eden + Survivor 0/1）和老年代。
- **方法区**（线程共享）：存储类信息、常量、静态变量、JIT 编译后的代码。JDK 8+ 用元空间（直接内存）替代永久代。

### 内存管理
- **对象分配**：大多数对象优先在新生代 Eden 区分配，大对象直接进入老年代。
- **TLAB**：每个线程在 Eden 区分配一小块私有缓冲区，减少线程同步竞争。
- **栈上分配 + 标量替换**：JIT 编译阶段将未逃逸对象分配到栈上，方法结束自动销毁。
- **内存泄漏**：静态集合类、未关闭资源、ThreadLocal 未 remove()、内部类持有外部类引用。

### 堆内存结构
| 区域 | 说明 | GC 行为 |
|------|------|---------|
| 新生代（Young） | 存放新创建对象 | Minor GC 频繁 |
| ├ Eden | 大多数对象首次分配 | 首次存活复制到 Survivor |
| ├ Survivor 0 | 年龄 1 的对象 | 每次 GC 年龄+1 |
| └ Survivor 1 | 年龄 1 的对象 | 与 S0 交替角色 |
| 老年代（Old） | 长生命周期对象 | Major GC / Full GC |
| 元空间 | 类元数据（JDK 8+） | 触发 Full GC 回收 |

**OOM 常见类型**：Java heap space、Metaspace、Direct buffer memory、GC overhead limit exceeded、Unable to create new native thread、StackOverflowError`,
    source: null,
    domain: "jvm",
  },
  GC: {
    category: "jvm",
    content: `##垃圾回收核心要点

### 对象存活判断
- **引用计数法**：无法解决循环引用。
- **可达性分析**：从 GC Roots 开始搜索，不可达对象可回收。

### 引用类型
| 类型 | 回收时机 | 场景 |
|------|---------|------|
| 强引用 | 永不回收 | 普通对象 |
| 软引用 | 内存不足时回收 | 缓存 |
| 弱引用 | 下次 GC 时回收 | WeakHashMap |
| 虚引用 | 任何时候 | 跟踪对象回收 |

### 垃圾收集算法
- **标记-清除**：基础算法，产生内存碎片。
- **标记-复制**：新生代使用。
- **标记-整理**：老年代使用，无碎片。

### 主流垃圾收集器
- **G1**（JDK 9+ 默认）：Region 化，可预测停顿。
- **ZGC**（JDK 15+）：暂停 < 几毫秒，最大支持 16TB。
- **CMS**（JDK 14 移除）：最短停顿时间，标记-清除，产生碎片。`,
    source: null,
    domain: "jvm",
  },
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
- **新生代**：Eden + Survivor0 + Survivor1（默认 8:1:1）
- **老年代**：存放长期存活的对象
- **元空间**：JDK 8+ 替代永久代，使用本地内存

### GC 算法
| 算法 | 原理 | 适用 |
|------|------|------|
| 标记-清除 | 标记存活 → 回收未标记 | 老年代（有碎片） |
| 标记-复制 | 存活对象复制到另一空间 | 新生代（效率高） |
| 标记-整理 | 标记存活 → 向一端移动 | 老年代（无碎片） |

### 常用 GC 收集器
- **Serial**：单线程，STW，客户端模式
- **Parallel**：多线程，关注吞吐量，JDK 8 默认
- **CMS**：并发标记清除，低延迟，有碎片
- **G1**：分区式，可预测停顿，JDK 9+ 默认
- **ZGC**：JDK 15+，极低延迟（<10ms）`,
    source: null,
    domain: "jvm",
  },
  类加载: {
    category: "jvm",
    content: `## 类加载机制

### 类加载的七个阶段
加载 → 验证 → 准备 → 解析 → 初始化 → 使用 → 卸载

1. **加载**：通过全限定类名获取二进制字节流，在堆中生成 Class 对象。
2. **验证**：文件格式、元数据、字节码、符号引用验证。
3. **准备**：为 static 变量分配内存并设零值。
4. **解析**：将符号引用替换为直接引用。
5. **初始化**：执行 <clinit>() 方法，按顺序赋值 static 变量。

### 双亲委派模型
启动类加载器 → 扩展类加载器 → 应用类加载器 → 自定义类加载器

- **工作流程**：自底向上检查已加载，自顶向下尝试加载。
- **优势**：避免核心 API 被篡改。
- **破坏双亲委派**：重写 loadClass()，或线程上下文类加载器（JDBC SPI 等）。`,
    source: "JavaGuide",
    domain: "jvm",
  },
  IO: {
    category: "jvm",
    content: `##Java IO 模型

### BIO（Blocking I/O）
同步阻塞。应用程序发起 read 调用后阻塞直到数据从内核拷贝到用户空间。连接数不高时可用。

### NIO（Non-blocking I/O）
Java 1.4 引入，核心组件：
- **Buffer**：缓冲区，读写操作的媒介。
- **Channel**：通道，双向传输数据。
- **Selector**：多路复用器，单线程管理多个连接。
- NIO 通过减少无效系统调用降低 CPU 消耗。

### AIO（NIO 2）
Java 7 引入，异步 IO 模型，基于事件和回调机制。目前应用不广泛。

### 文件 IO
- **FileInputStream/FileOutputStream**：字节流。
- **FileReader/FileWriter**：字符流。
- **BufferedXxx**：缓冲流，减少系统调用。
- **FileChannel**：支持 transferTo/transferFrom 零拷贝。
- **MappedByteBuffer**：内存映射文件，适合大文件。`,
    source: null,
    domain: "jvm",
  },
};
