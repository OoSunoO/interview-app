export const knowledge = {
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
};
