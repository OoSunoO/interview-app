export const knowledge = {
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
};
