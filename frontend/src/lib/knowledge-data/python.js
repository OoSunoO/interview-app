export const knowledge = {
  Python: {
    category: "python",
    content: `## Python 核心要点

### 语言特性
- **动态类型**：变量无需声明类型，运行时确定。
- **解释执行**：CPython 将源码编译为字节码（.pyc），再由虚拟机执行。
- **垃圾回收**：引用计数为主，标记-清除和分代回收解决循环引用。
- **GIL（全局解释器锁）**：同一时刻只有一个线程执行字节码。CPU 密集型任务用多进程，I/O 密集型用多线程/协程。

### 常用数据结构
| 类型 | 特点 | 复杂度 |
|------|------|--------|
| list | 动态数组 | O(1) 索引，O(n) 插入/删除 |
| dict | 哈希表 | O(1) 读写 |
| set | 哈希集合 | O(1) 成员检查 |
| tuple | 不可变序列 | O(1) 索引 |

### 函数式特性
- **lambda**：匿名函数。
- **map/filter/reduce**：数据变换。
- **列表推导式**：[x\*2 for x in range(10)]。
- **装饰器**：高阶函数，在函数执行前后添加逻辑。

### 常用标准库
| 模块 | 用途 |
|------|------|
| os / sys | 系统接口 |
| re | 正则表达式 |
| json / csv | 数据序列化 |
| datetime | 日期时间 |
| collections | 扩展容器（deque、Counter、defaultdict） |
| itertools | 迭代器工具 |
| threading / multiprocessing | 并发 |
| asyncio | 异步 I/O |
| unittest / pytest | 测试 |
| logging | 日志 |

### 常见面试题
- **可变 vs 不可变对象**：list/dict/set 可变，int/str/tuple 不可变。
- **深拷贝 vs 浅拷贝**：copy.copy() 浅层，copy.deepcopy() 递归复制。
- **\*args 和 \*\*kwargs**：可变位置参数和可变关键字参数。
- **生成器**：yield 关键字，惰性求值，节省内存。
- **上下文管理器**：with 语句，enter / exit。`,
    source: "综合整理",
    domain: "python",
  },
};
