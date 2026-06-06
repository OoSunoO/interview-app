export const knowledge = {
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
};
