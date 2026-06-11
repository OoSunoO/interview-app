export const knowledge = {
  React: {
    category: "react",
    content:
      "## React 核心概念\n\n> 来源：JavaGuide\n\n### 虚拟 DOM（Virtual DOM）\n虚拟 DOM 是真实 DOM 的 JavaScript 对象表示。当状态变化时，React 先在虚拟 DOM 上计算差异（Diffing），然后批量更新真实 DOM（Reconciliation），减少直接操作 DOM 的开销。\n\n- **Diff 算法**：同级比较，类型不同则重建整个子树；key 属性优化列表 diff 性能。\n- **Fiber 架构**（React 16+）：将协调过程拆分为可中断的工作单元，实现增量渲染，避免阻塞主线程。\n\n### JSX\nJSX 是 JavaScript 的语法扩展，最终被 Babel 编译为 React.createElement() 调用。JSX 中：\n- 表达式用 {} 包裹\n- 属性名采用驼峰命名（className, onClick 等）\n- 行内样式接收对象而非字符串\n\n### 组件生命周期（React 16.3+）\n\n| 阶段 | 类组件方法 | Hook 替代 |\n|------|-----------|-----------|\n| 挂载 | constructor → render → componentDidMount | useEffect(fn, []) |\n| 更新 | shouldComponentUpdate → render → componentDidUpdate | useEffect(fn, [deps]) |\n| 卸载 | componentWillUnmount | useEffect(() => fn, []) 的返回函数 |\n\n### 状态管理\n- **useState**：函数组件内状态管理\n- **useReducer**：复杂状态逻辑，类似 Redux 模式\n- **Context API**：跨层级组件通信，避免 props drilling\n- **外部状态库**：Redux（单一 store）、Zustand（轻量）、Jotai（原子化）\n\n### 组件通信\n- 父→子：Props\n- 子→父：回调函数 Props\n- 兄弟：提升状态到共同父组件\n- 跨层级：Context API 或全局状态库",
    source: "JavaGuide",
    domain: "react",
  },
  Hooks: {
    category: "react",
    content:
      "## React Hooks 详解\n\n> 来源：JavaGuide\n\nReact 16.8 引入 Hooks，让函数组件拥有状态和副作用能力，不再需要类组件。\n\n### 常用 Hooks\n\n**useState** — 状态管理\n```jsx\nconst [count, setCount] = useState(0);\n```\n- 参数为初始值，返回 [值, 更新函数] 数组\n- 更新函数传入函数以基于旧值更新：setCount(prev => prev + 1)\n\n**useEffect** — 副作用处理\n```jsx\nuseEffect(() => {\n  // 副作用逻辑（订阅、请求、DOM 操作）\n  return () => { /* 清理函数，组件卸载时执行 */ };\n}, [dependencies]);\n```\n- 依赖数组为空：仅在挂载和卸载时执行\n- 依赖数组变化：每次依赖变化时执行旧清理 + 新副作用\n- 无依赖数组：每次渲染后执行（不推荐）\n\n**useContext** — 跨组件共享数据\n```jsx\nconst value = useContext(MyContext);\n```\n- 避免 props drilling，配合 Context.Provider 使用\n\n**useRef** — 引用 DOM 或保留可变值\n```jsx\nconst inputRef = useRef(null);\n<input ref={inputRef} />;\n```\n- 返回的 ref 对象在整个组件生命周期内保持不变\n- 修改 .current 不会触发重新渲染\n\n**useMemo / useCallback** — 性能优化\n- useMemo 缓存计算结果，useCallback 缓存函数引用\n- 仅在依赖变化时重新计算\n\n### 自定义 Hooks\n将组件逻辑提取为可复用的函数，以 use 开头：\n```jsx\nfunction useWindowWidth() {\n  const [width, setWidth] = useState(window.innerWidth);\n  useEffect(() => {\n    const handler = () => setWidth(window.innerWidth);\n    window.addEventListener('resize', handler);\n    return () => window.removeEventListener('resize', handler);\n  }, []);\n  return width;\n}\n```\n\n### Hooks 规则\n1. 只能在函数组件或自定义 Hook 顶层调用（不能在循环/条件/嵌套函数中）\n2. 只能在 React 函数组件或自定义 Hook 中调用",
    source: "JavaGuide",
    domain: "react",
  },
  JavaScript: {
    category: "frontend",
    content:
      "## JavaScript 核心要点\n\n> 来源：JavaGuide\n\n### 原型与原型链\nJavaScript 通过原型链实现继承：\n- 每个对象有一个 __proto__ 隐式原型指向其构造函数的 prototype。\n- 属性查找沿原型链向上搜索，直到找到或到达 null（Object.prototype.__proto__ = null）。\n- ```js\n  function Person(name) { this.name = name; }\n  Person.prototype.sayHello = function() { console.log('Hello'); };\n  const p = new Person('Alice');\n  // p → Person.prototype → Object.prototype → null\n  ```\n\n### 闭包（Closure）\n函数访问其外部作用域中变量的能力，即使外部函数已执行完毕。\n- 用途：数据私有化、创建模块、防抖节流、柯里化。\n- 注意：不当使用闭包会导致内存泄漏（引用的对象无法 GC）。\n\n### 事件循环（Event Loop）\nJavaScript 是单线程语言，通过事件循环实现异步：\n1. **调用栈（Call Stack）**：执行同步代码。\n2. **任务队列（Task Queue）**：宏任务（setTimeout、setInterval、I/O）放入宏任务队列，微任务（Promise.then、MutationObserver、queueMicrotask）放入微任务队列。\n3. **执行顺序**：调用栈清空 → 执行所有微任务 → 取一个宏任务执行 → 重复。\n\n```js\nconsole.log(1);                // 同步\nsetTimeout(() => console.log(2), 0);  // 宏任务\nPromise.resolve().then(() => console.log(3));  // 微任务\nconsole.log(4);                // 同步\n// 输出：1, 4, 3, 2\n```\n\n### ES6+ 核心特性\n\n| 特性 | 说明 |\n|------|------|\n| let / const | 块级作用域，无变量提升（暂时性死区） |\n| 箭头函数 | 无 this 绑定、无 arguments、不能作构造函数 |\n| 解构赋值 | const { a, b } = obj; const [x, y] = arr; |\n| 模板字面量 | 反引号 + ${expression} |\n| Promise | 异步编程终极方案，链式调用 then/catch |\n| async/await | 基于 Promise 的语法糖，使异步代码同步化 |\n| 模块（ES Module） | import/export，静态分析支持 tree-shaking |\n| 展开运算符 | ... 展开数组/对象，替代 apply/concat/assign |\n| Map / Set | 比 Object 更适合作为字典/集合 |\n| Symbol | 唯一值，用于私有属性名 |\n| Proxy | 拦截对象操作，Vue 3 响应式基础 |",
    source: "JavaGuide",
    domain: "frontend_basics",
  },
  CSS: {
    category: "frontend",
    content:
      "## CSS 核心要点\n\n> 来源：JavaGuide\n\n### 盒模型（Box Model）\n每个元素由 content（内容）→ padding（内边距）→ border（边框）→ margin（外边距）组成。\n\n- **content-box**（默认）：width/height 只包含 content，实际占位 = width + padding + border。\n- **border-box**（推荐）：width/height 包含 content + padding + border，布局更易计算。\n```css\n*, *::before, *::after { box-sizing: border-box; }\n```\n\n### Flexbox 布局\n一维布局模型，适合行/列方向的排列。\n\n**容器属性**：\n- display: flex → 启用 Flex 布局\n- flex-direction: row | column | row-reverse | column-reverse\n- justify-content: flex-start | center | space-between | space-around | space-evenly（主轴对齐）\n- align-items: stretch | center | flex-start | flex-end | baseline（交叉轴对齐）\n- flex-wrap: wrap | nowrap（是否换行）\n- gap: 10px（子项间距）\n\n**子项属性**：\n- flex: 1 → flex-grow: 1, flex-shrink: 1, flex-basis: 0%\n- align-self → 覆盖容器的 align-items\n- order → 调整显示顺序\n\n### Grid 布局\n二维布局模型，同时控制行和列。\n\n```css\n.container {\n  display: grid;\n  grid-template-columns: 1fr 2fr 1fr;  /* 三列，中间两倍宽 */\n  grid-template-rows: auto 200px;\n  gap: 16px;\n}\n```\n\n- fr 单位：剩余空间按比例分配\n- repeat(3, 1fr) → 重复三列均分\n- grid-area / grid-column / grid-row → 元素占据指定网格区域\n\n### 定位（Position）\n\n| 值 | 参考对象 | 是否脱离文档流 |\n|------|---------|:------------:|\n| static | 不适用（默认） | 否 |\n| relative | 自身原始位置 | 否（保留占位） |\n| absolute | 最近的非 static 祖先元素 | 是 |\n| fixed | 视口（viewport） | 是 |\n| sticky | 滚动容器 + 阈值 | 混合 |\n\n### 响应式设计\n\n1. **媒体查询（Media Queries）**：\n   ```css\n   @media (max-width: 768px) { /* 移动端样式 */ }\n   @media (min-width: 1024px) { /* 桌面端样式 */ }\n   ```\n\n2. **相对单位**：rem（根元素字体大小）、em（父元素字体大小）、vh/vw（视口百分比）、%（父元素百分比）。\n\n3. **移动优先**：先写移动端样式（基础），再用 min-width 媒体查询渐进增强。\n\n### 层叠与继承\n- **层叠**：选择器权重决定样式优先级，!important > 内联 > ID > 类/属性/伪类 > 元素/伪元素。\n- **继承**：部分属性（color、font、line-height）自动继承父元素。",
    source: "JavaGuide",
    domain: "frontend_basics",
  },
};
