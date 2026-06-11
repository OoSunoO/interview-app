export const knowledge = {
  Spring: {
    category: "java_advanced",
    content:
      "##Spring 核心概念\n\n### IoC（控制反转）\n将对象的创建和管理权交给 IoC 容器，对象通过容器获取而非直接 new。降低耦合度，资源容易管理。\n\n### AOP（面向切面编程）\n将日志、事务、权限等与业务无关的逻辑封装。实现机制：\n- 有接口 → JDK Proxy\n- 无接口 → Cglib\n\n### Bean 生命周期\n创建实例 -> 属性赋值（处理 @Autowired）-> 初始化（Aware 接口 -> BeanPostProcessor -> InitializingBean -> init-method）-> 销毁。\n\n### Bean 作用域\n- singleton（默认）：唯一实例\n- prototype：每次获取创建新实例\n- request/session/application/websocket（Web 场景）\n\n### Spring、Spring MVC、Spring Boot 关系\n- Spring Framework 核心是 IoC + AOP\n- Spring MVC 是 Spring 中的 MVC 框架（Model-View-Controller）\n- Spring Boot 简化 Spring 配置，开箱即用，内部仍使用 Spring MVC 等模块\n\n### @Autowired vs @Resource\n- @Autowired：Spring 内置，默认 byType，通过 @Qualifier 指定名称\n- @Resource：JDK JSR-250，默认 byName，通过 name 属性指定\n- 推荐 @Resource（减少 Spring 耦合）或构造器注入 + @Autowired\n",
    source: null,
    domain: "java_advanced",
  },
};
