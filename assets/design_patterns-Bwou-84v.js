var e=`design_patterns`,t=[{category:`design_patterns`,difficulty:`easy`,type:`short_answer`,title:`依赖注入与控制反转`,content:`控制反转（IoC）和依赖注入（DI）的核心思想是什么？它们如何降低系统耦合度？Spring 的 IoC 容器如何工作？`,answer:`答案：控制反转（IoC）将对象的创建和生命周期管理从业务代码中反转给容器。依赖注入（DI）是 IoC 的具体实现——对象通过构造函数、Setter 或接口被动接收依赖而非自己创建依赖。Spring IoC 容器通过反射创建 Bean、管理依赖关系，支持单例/原型等作用域。

解析：传统做法——class Service { private Repository repo = new Repository(); } —— 高层直接依赖低层具体实现，耦合高、难以测试。DI 做法——class Service { private Repository repo; public Service(Repository repo) { this.repo = repo; } } —— 依赖从外部注入，不关心具体实现。三种注入方式——1）构造函数注入（推荐）：依赖在构造时确定，对象创建后不可变。2）Setter 注入：可选依赖，支持运行时切换。3）接口注入（不常用）：通过接口方法注入依赖。

扩展延伸：IoC 容器的工作原理——1）扫描：扫描指定包路径下的类（@Component、@Service）。2）注册：将 Bean 定义注册到 BeanFactory。3）解析依赖：分析每个 Bean 的构造参数和字段，递归创建依赖的 Bean。4）生命周期管理：初始化（@PostConstruct）→ 代理生成（AOP）→ 使用 → 销毁（@PreDestroy）。

DI 的优点——1）解耦：依赖接口而非实现。2）可测试性：用 Mock 对象替换真实依赖。3）灵活性：切换实现类无需修改代码（配置文件或注解）。不要过度 DI——如果某个依赖永远不会被替换也不需要在测试中 Mock，硬编码创建也未尝不可。`,hints:[`构造函数注入 vs Setter 注入——为什么构造函数注入更推荐`,`Spring 的单例 Bean 和原型 Bean 分别适用于什么场景`],tags:[`设计模式`,`DI`,`IoC`,`Spring`],content_hash:`cb1236bb6b32`,id:1257},{category:`design_patterns`,difficulty:`easy`,type:`short_answer`,title:`MVC 与 MVVM 架构模式`,content:`MVC（Model-View-Controller）和 MVVM（Model-View-ViewModel）的架构区别是什么？各自在什么框架中应用？为什么前端框架从 MVC 转向了 MVVM？`,answer:`答案：MVC 中 Controller 接收用户输入并更新 Model，View 从 Model 读取数据。MVVM 中 ViewModel 通过数据绑定（Data Binding）自动同步 View 和 Model，不需要 Controller 中介。前端从 MVC 转向 MVVM 是因为数据绑定减少了大量 DOM 操作代码，使关注点分离更清晰，测试更方便。

解析：MVC——1）Model：数据和业务逻辑。2）View：用户界面（展示数据）。3）Controller：接收输入、调用 Model、选择 View。经典实现：后端（Spring MVC、Ruby on Rails）中 Controller 是核心。前端 MVC（Backbone.js）中 View 既监 Model 也处理事件，职责混乱。MVVM——1）Model：同 MVC。2）View：界面，通过 Data Binding（如 {{name}}）声明式绑定到 ViewModel。3）ViewModel：View 的抽象，包含展示逻辑和状态，通过双向绑定自动同步。

扩展延伸：MVVM 的前端实现——Vue（响应式数据绑定 + 模板编译）、Angular（Zone.js 脏检查）、React 的「单向数据流」本质上是另一种模式：View → Action → Reducer → Store → View。比起 MVVM 更像 Flux/Redux 架构。MVVM 的关键优势——1）声明式 UI：不需要手动操作 DOM。2）可测试：ViewModel 是纯 JS 对象，不需要 DOM 环境即可测试。3）双向绑定减少样板代码。注意：双向绑定在复杂场景下可能造成性能问题（大量 Watcher）。优化的方式：不可变数据 + 虚拟 DOM（React 的选择）。`,hints:[`为什么前端 MVC 模式逐渐被 MVVM/Flux 取代——DOM 操作和双向绑定的演进`,`React 是 MVC 还是 MVVM——Flux 单向数据流架构的本质`],tags:[`设计模式`,`MVC`,`MVVM`,`架构`],content_hash:`2ac0a7278228`,id:1258},{category:`design_patterns`,difficulty:`easy`,type:`short_answer`,title:`分层架构（Layered Architecture）`,content:`分层架构（Layered/N-tier Architecture）的核心原则是什么？传统三层架构（Controller-Service-DAO）的优缺点？DDD 的分层架构有何不同？`,answer:`答案：分层架构的核心原则是每层只依赖相邻的下层，上层调用下层服务，下层不知道上层的存在。传统三层架构（Controller-Service-DAO）实现简单，但在业务复杂时 Service 层变成上帝类（God Class）。DDD 的分层架构增加 Domain 层（核心业务逻辑），Infrastructure 层（技术实现），Application 层（用例编排），领域层不依赖基础设施。

解析：传统三层架构——1）表现层（Controller）：处理 HTTP 请求、参数校验、视图选择。2）业务层（Service）：业务逻辑编排、事务管理。3）持久层（DAO/Repository）：数据库操作。问题：Service 层越写越厚，业务逻辑和技术逻辑混在一起，领域知识的表达模糊。DDD 的四层架构——1）Interface（接口层）：Controller、DTO。2）Application（应用层）：Service（薄层，做任务协调，没有业务规则）。3）Domain（领域层）：Entity、Value Object、Domain Service（核心业务逻辑，与技术无关）。4）Infrastructure（基础设施层）：数据库、消息队列、外部 API 的技术实现。

扩展延伸：分层架构的演化——1）端口适配器架构（Ports and Adapters / Hexagonal Architecture）：应用核心通过 Port 接口与外界通信，Adapter 是实现 Port 的具体技术（如 MySQLAdapter、RedisAdapter）。核心完全不依赖技术细节，可测试性极强。2）整洁架构（Clean Architecture）：依赖规则——依赖指向内层，外层依赖内层抽象（依赖倒置）。3）选型建议：简单 CRUD 应用用三层架构就够了。复杂业务系统用 DDD/六边形架构。过度设计的分层比不分层更糟糕（不必要的抽象增加复杂度）。`,hints:[`为什么三层架构在业务复杂时 Service 层会膨胀——缺乏领域层抽象`,`依赖倒置原则在端口适配器架构中的体现——核心层定义接口，基础设施实现接口`],tags:[`设计模式`,`分层`,`架构`,`DDD`],content_hash:`dc3aa0880ed8`,id:1259},{category:`design_patterns`,difficulty:`easy`,type:`short_answer`,title:`CQRS 模式`,content:`CQRS（Command Query Responsibility Segregation）的核心思想是什么？什么时候应该引入 CQRS？它的优缺点和实现挑战？`,answer:`答案：CQRS 将数据的写操作（Command）和读操作（Query）分离到不同的模型中。Command 使用适合写入的模型（通常是领域对象），Query 使用专门优化的读模型（通常是非规范化视图）。CQRS 适用于读写负载差异大、读写关注点完全不同、或者需要为读端优化性能的场景。

解析：为什么需要 CQRS——传统 CRUD 使用同一个模型处理读写。但随着业务复杂，读写需求差异越来越大：写端需要业务规则校验、工作流和事件发布；读端需要多层关联、聚合计算和灵活的查询方式。用同一个模型兼顾两者的结果就是——既不能很好地处理复杂写逻辑，也不能高效查询。CQRS 的分离——Command 端：处理 Update/Delete，只有行为（方法），不返回数据（void），执行时发布事件。Query 端：处理 Select，使用独立的读模型（轻量级 DTO），不包含业务逻辑。

扩展延伸：CQRS 的挑战——1）数据一致性：写端和读端数据异步同步，读取可能读到旧数据（最终一致性）。需要在业务层面接受这一点。2）实现复杂度：需要维护两套模型和同步机制。3）不适用于简单 CRUD——如果读写逻辑差异不大，CQRS 只是徒增复杂度。CQRS + 事件溯源——CQRS 通常与事件溯源（Event Sourcing）搭配使用。写端存储领域事件序列而不是当前状态，读端从事件流「投影」出读模型。组合的优势：完整的审计日志、可以重建任意历史状态的读模型、事件可用于其他系统。适用综合决策原则：优先用普通 CRUD，只在明确需要时才引入 CQRS（写多读多且逻辑不同、需要独立扩展读写端）。`,hints:[`CQRS 和普通 CRUD 的核心差异——从共享模型到读写分离模型`,`为什么 CQRS 经常和事件溯源（Event Sourcing）配合使用`],tags:[`设计模式`,`CQRS`,`架构`,`读写分离`],content_hash:`130392486867`,id:1260},{category:`design_patterns`,difficulty:`hard`,type:`short_answer`,title:`事件驱动架构（EDA）`,content:`事件驱动架构（Event-Driven Architecture）的核心概念是什么？事件、命令、消息的区别？事件溯源（Event Sourcing）和 EDA 的关系？`,answer:`答案：EDA 中系统组件通过发布和消费事件来进行异步通信。事件（Event）表示「已经发生的事情」（过去时，不可变），命令（Command）表示「想要做的事情」（祈使句，可拒绝），消息（Message）是传输层概念。事件溯源（Event Sourcing）是 EDA 的一种特化——以事件序列作为系统状态的唯一真相源（Source of Truth），当前状态由重放事件推导而来。

解析：事件驱动架构的核心角色——1）事件生产者（Producer）：发生某些事情时发布事件（如 OrderCreated）。2）事件通道（Event Channel/ Broker）：传输事件，如 Kafka、RabbitMQ。3）事件消费者（Consumer）：订阅并处理事件。4）事件存储（Event Store）：持久化事件序列（可选，ES 需要）。事件 vs 命令——事件是事实（「订单已创建」），命令是请求（「创建订单」）。命令可能被拒绝（如库存不足），事件不会。事件通常以过去时命名（OrderCreated、PaymentReceived）。

扩展延伸：EDA 的优势——1）松耦合：组件间不直接依赖，通过事件通道间接通信。2）可扩展：可以独立扩缩容不同的消费者。3）可演化：新增消费者不影响现有系统——仅需订阅已有事件。EDA 的挑战——1）最终一致性：事件异步传播，系统不保证立即一致。2）调试困难：事件链可能跨越多个服务，追踪复杂。3）事件 Schema 演化：事件消费者依赖事件的格式，需做好版本管理。事件溯源（ES）——不是存储当前状态（更新记录），而是存储所有状态变更事件。查询当前状态 = 重放所有事件。优点：完整审计日志、时间旅行调试、可以构建任意读模型。缺点：查询性能依赖快照、事件 Schema 演进困难、学习曲线陡峭。选型建议：EDA 适合跨服务异步通信（订单→支付→库存→物流）；ES 只在需要完整审计和事件重放能力时引入。`,hints:[`事件（Event）和命令（Command）在命名和行为上的本质差异`,`事件溯源如何解决传统 CRUD 中丢失了「为什么」的问题`],tags:[`设计模式`,`EDA`,`事件驱动`,`Event Sourcing`],content_hash:`498ab0fc69c5`,id:1261},{category:`design_patterns`,difficulty:`hard`,type:`short_answer`,title:`事件溯源（Event Sourcing）`,content:`事件溯源（Event Sourcing）是存储当前状态还是存储状态变更？和传统 CRUD 相比有什么本质不同？事件溯源的主要挑战是什么？`,answer:`答案：事件溯源不存储对象的当前状态，而是存储导致状态变更的所有事件序列。当前状态通过重放事件推导出来。与传统 CRUD 保存最新快照不同，事件溯源保留了完整的变更历史——不仅知道「现在是什么」，还知道「为什么变成现在这样」。

解析：核心概念——1）事件（Event）是不可变的事实：OrderCreated、ItemAddedToCart、PaymentProcessed。2）聚合根（Aggregate Root）的事件流：一个聚合的所有事件按顺序存储。3）投影（Projection）：从事件流构建出当前状态或读模型的过程。4）快照（Snapshot）：事件量太大时定期保存当前状态，后续重放从最近快照开始而非从零开始。与 CRUD 的对比——CRUD：UPDATE 语句直接修改数据库中的行，旧数据被覆盖丢失。ES：追加写入事件存储（append-only），不支持修改或删除事件（仅能追加补偿事件如 OrderCancelled）。

扩展延伸：Event Sourcing 的主要挑战——1）事件 Schema 的演进：事件定义会随时间变化。策略：事件版本化（OrderCreatedV1、OrderCreatedV2，消费者处理多个版本）、向上兼容（新事件兼容旧事件的字段）。2）查询性能：对当前状态的查询需要重放大量事件。策略：定期创建快照（snapshot），配合 CQRS 构建专用的读模型。3）一致性和并发：同一时间只能有一个线程写入一个聚合的事件流（单写入器原则），通过乐观锁（事件流版本号）控制并发。4）删除事件：GDPR 要求删除用户数据，但 ES 的事件是不可变的。策略：事件屏蔽（event masking）或加密 + 密钥销毁。5）事件量大时的存储和处理：需要高效的事件存储（EventStoreDB、Kafka）、异步投影框架。`,hints:[`事件溯源为什么需要配合快照（Snapshot）使用——避免从头重放所有事件`,`ES 中如何满足合规要求——事件不可删除与 GDPR 的矛盾`],tags:[`设计模式`,`Event Sourcing`,`CQRS`,`架构`],content_hash:`b26582e8a83c`,id:1262},{category:`design_patterns`,difficulty:`easy`,type:`short_answer`,title:`仓储模式（Repository Pattern）`,content:`仓储模式（Repository Pattern）的作用是什么？它和数据访问对象（DAO）有什么区别？Repository 如何处理复杂查询？`,answer:`答案：Repository 模式在领域层和数据映射层之间提供抽象接口，使领域层不依赖具体的数据访问技术。与 DAO 的区别：Repository 是领域驱动设计的概念，操作的是「聚合根」（业务概念），DAO 是数据访问层的概念，操作的是数据表（技术概念）。复杂查询通过在 Repository 上提供专门的查询方法或结合规范模式（Specification Pattern）实现。

解析：Repository 的核心价值——1）封装数据访问：业务逻辑不需要知道数据来自数据库、缓存还是外部 API。2）可测试：业务逻辑单元测试时 Mock Repository 接口。3）集中管理查询逻辑：共享和复用的查询条件。DAO vs Repository——DAO：对应一张表（UserDao 对应 user 表），操作是 CRUD（insert、update、delete、findById）。Repository：对应一个聚合根（OrderRepository 操作 Order 聚合，包含 Order 下的 OrderItem），操作是业务方法（findActiveOrdersByCustomer、save）。

扩展延伸：复杂查询的策略——1）在 Repository 上定义专门的查询方法：findByCustomerAndStatus(customerId, status, pageable)。简单直接，但查询组合多时方法数量爆炸。2）规范模式（Specification Pattern）：查询条件抽象为 Predicate 对象。repository.findAll(OrderSpecs.isActive().and(OrderSpecs.fromLastMonth()))。3）CQRS 读模型：复杂查询绕过 Repository 直接用 Query 对象查询专用的读数据库。Repository 的实现选择——Spring Data JPA 用接口声明方法名自动生成实现（如 findByLastNameAndAgeBetween）。MyBatis 通过 XML 映射手动写 SQL。选型建议：简单的 CRUD 用 Spring Data JPA 的 Repository。复杂查询用 MyBatis/JOOQ。`,hints:[`Repository 操作的是聚合根而不是单张表——理解 Repository 的粒度`,`规范模式（Specification）如何避免 Repository 方法数量爆炸`],tags:[`设计模式`,`Repository`,`DAO`,`DDD`],content_hash:`e4197b527a94`,id:1263},{category:`design_patterns`,difficulty:`easy`,type:`short_answer`,title:`工作单元（Unit of Work）`,content:`工作单元（Unit of Work）模式解决了什么问题？如何实现？JPA 的 EntityManager 和 MyBatis 的 SqlSession 是如何体现 UoW 的？`,hints:[`EntityManager 的 flush() 和 commit() 有什么区别——flush 生成 SQL，commit 提交事务`,`事务的 ACID 和 UoW 的关系——UoW 是保证事务一致性的设计模式`],tags:[`设计模式`,`Unit of Work`,`事务`,`JPA`],answer:`答案：工作单元模式在一个事务中跟踪所有数据变更，在事务提交时将变更一次性刷新到数据库。它解决了「部分成功部分失败」的不一致问题——要么全部成功，要么全部回滚。JPA 的 EntityManager 通过持久化上下文（Persistence Context）跟踪实体的状态变化（新增/修改/删除），flush() 时将变化一次写入。MyBatis 的 SqlSession 类似——批量操作在 commit() 时提交。

解析：UoW 的核心机制——1）注册（Register）：追踪在其作用域内所有被修改的对象。2）变更集（Change Set）：记录哪些对象是新增、修改、删除的。3）提交（Commit）：将变更集一次写入数据库（在一个事务中）。4）回滚（Rollback）：事务失败时丢弃所有未提交的变更。JPA 的 EntityManager——persist() 将实体注册为新建；merge() 注册为修改；remove() 注册为删除。flush() 生成 SQL 并执行但未提交事务（commit() 提交事务并关闭 EntityManager）。

扩展延伸：UoW 的实现模式——1）显式 UoW：代码显式控制 UoW 的生命周期。优点：控制精确。缺点：需要手动管理。2）隐式 UoW（如 Open Session In View，OSIV）：在 HTTP 请求开始打开 Session、请求结束关闭。优点：开发方便，延迟加载不会出错。缺点：长事务可能造成数据库连接池耗尽。Spring 通过 @Transactional 注解管理 UoW——1）方法开始时开启事务并创建 EntityManager。2）方法执行中通过 AOP 拦截 EntityManager 操作，变更自动注册到当前 UoW。3）方法结束时 commit()，异常时 rollback()。

UoW 的边界设计——1）事务应当尽可能短（减少锁定时间）。2）不要在事务中做远程调用或长时间计算。3）一个 HTTP 请求通常对应一个 UoW，但复杂业务可能需要多个 UoW。`,content_hash:`f19db26c906d`,id:1264},{category:`design_patterns`,difficulty:`medium`,type:`short_answer`,title:`数据映射器 vs 活动记录`,content:`数据映射器（Data Mapper）和活动记录（Active Record）两种模式的区别是什么？Hibernate/JPA 和 MyBatis 分别属于哪种模式？各自的优缺点？`,answer:`答案：活动记录（Active Record）让领域对象直接操作数据库（对象自己负责 CRUD），数据映射器（Data Mapper）使用独立的映射层分离领域对象和数据库。Active Record 简单直接，适合小型项目（Ruby on Rails、MyBatis 接近此模式）。Data Mapper 让领域对象纯粹（无持久化关注点），适合复杂业务（Hibernate/JPA）。

解析：Active Record——class User extends ActiveRecord { public $name; } 然后 $user->save()、$user->find(1)。领域对象和数据库记录一一对应，领域逻辑和持久化逻辑混合在同一个类中。优点：开发快速（一个类搞定），简单 CRUD 场景效率高。缺点：持久化逻辑污染领域对象，违反 SRP（单一职责），复杂业务逻辑难以组织。数据映射器——User 是纯粹的领域对象（只有属性和业务方法，不含数据库操作代码）。独立的 UserMapper 类负责 User 对象和数据库表之间的双向映射。领域对象的创建和持久化被完全分离。

扩展延伸：Hibernate/JPA 是 Data Mapper 实现——Entity 是纯 POJO（没有继承特定基类），通过独立的 EntityManager + Repository 操作持久化。领域对象可以做纯单元测试（不需要数据库）。MyBatis 介于两者之间——SQL 写在 XML 映射器中（类似 Data Mapper），但返回的对象是普通的 POJO（不依赖 MyBatis 框架）。但 MyBatis 的结果对象通常和表结构一一对应（类似 Active Record 的结构但无持久化方法）。选型建议——Active Record 适合：快速原型、Rails 风格开发、CRUD 主导的简单业务。Data Mapper 适合：复杂业务逻辑（DDD）、领域对象需要纯净（不依赖框架）、需要多数据库支持。`,hints:[`Active Record 的 save() 方法违反了 SRP（单一职责原则）——持久化和业务逻辑混合`,`Hibernate 的 POJO Entity 如何实现纯净的领域对象——完全不知道数据库的存在`],tags:[`设计模式`,`Data Mapper`,`Active Record`,`ORM`],content_hash:`f66bb0afd268`,id:1265},{category:`design_patterns`,difficulty:`medium`,type:`short_answer`,title:`生产者消费者模式`,content:`生产者消费者模式解决什么问题？在多线程和分布式环境下分别如何实现？Java 中 BlockingQueue 的作用？`,answer:`答案：生产者消费者模式通过一个共享缓冲区解耦生产者和消费者。生产者将数据放入缓冲区，消费者从缓冲区取出处理。两者不直接交互，可以有不同的数量和速率。多线程环境下用 BlockingQueue（阻塞队列，如 ArrayBlockingQueue）实现——队列满时生产者阻塞，队列空时消费者阻塞。分布式环境下用消息队列（Kafka、RabbitMQ）实现。

解析：解耦的价值——生产者不需要知道谁在消费、消费速度多快、有多少消费者。消费者不需要知道数据来源、生产速度。两者独立变化。速率匹配——缓冲区吸收生产速率和消费速率的瞬时波动。如果生产持续快于消费，缓冲区会满（需要反压 Backpressure）。BlockingQueue 的实现原理——ArrayBlockingQueue：基于循环数组 + ReentrantLock + Condition。put() 时如果队列满，在 notFull Condition 上等待；take() 时如果队列空，在 notEmpty Condition 上等待。put() 成功后 signal notEmpty，take() 成功后 signal notFull。

扩展延伸：分布式环境的生产者消费者——Kafka：Producer 发送消息到 Topic（缓冲区），Consumer Group 订阅消费。Topic 的分区实现了并行和顺序保证。RabbitMQ：生产者发送到 Exchange，路由到 Queue，消费者订阅 Queue。反压机制——当消费速度远小于生产速度时：1）丢弃：丢弃最老的消息（如 Kafka 的日志保留策略）。2）限流：速率限制生产者（如消息队列的消费者预取计数 prefetch count 限制）。3）降级：消费者返回降级结果。实际应用——日志收集（生产者=应用服务器，消费者=日志处理系统）、订单处理（生产者=前端下单，消费者=订单处理 Worker）。`,hints:[`BlockingQueue 的 put() 和 offer() 在队列满时的行为差异——阻塞 vs 返回 false`,`Kafka 的分区机制如何实现多个消费者并行消费`],tags:[`设计模式`,`生产者-消费者`,`并发`,`BlockingQueue`],content_hash:`826f10901b63`,id:1266},{category:`design_patterns`,difficulty:`medium`,type:`short_answer`,title:`管道过滤器模式（Pipes and Filters）`,content:`管道过滤器模式（Pipes and Filters）的核心思想是什么？它和职责链模式的区别？实际系统中有哪些经典实现？`,answer:`答案：管道过滤器模式将处理过程拆分为一系列独立的过滤器（Filter），通过管道（Pipe）连接。每个过滤器接收输入、处理、产生输出，过滤器间通过管道的标准接口通信。与职责链的区别：职责链每个节点可以选择处理或传递给下一个，通常只有一个节点处理；管道过滤器每个节点都会处理并对数据进行转换。

解析：管道过滤器的特点——1）每个过滤器是独立的处理单元（高内聚、低耦合）。2）过滤器只通过标准数据接口通信（松耦合）。3）过滤器顺序可重新组合（灵活）。4）新增过滤器不影响其他过滤器（可扩展）。与职责链的区别——职责链：每个处理器决定是否处理请求，可以中断传递。如 Java Web 的 FilterChain 中一个 Filter 可以阻断请求不再传递。管道过滤器：每个过滤器对数据做变换，不跳过（如 Unix 命令中的 sort、uniq、wc，每个都处理全部数据流）。

扩展延伸：经典实现——1）Unix 管道：ps aux | grep python | awk '{print $2}'（文本流经过每个命令处理）。2）Java Servlet Filter：每个 Filter 处理请求和响应（更像职责链，但可以看作管道变体）。3）Apache Camel/Spring Integration：企业集成管道和过滤器。4）Webpack Loader：source -> babel-loader -> css-loader -> style-loader（顺序处理）。5）数据工程 ETL：Extract → Transform → Load 的每个阶段内部可能进一步拆分为过滤器。设计原则——每个过滤器做一件事（单一职责）。管道中的数据格式尽量简单（JSON、流）。过滤器间不共享状态——管道过滤器天然适合分布式处理（每个过滤器可以部署在独立的机器上通过消息队列连接）。`,hints:[`管道过滤器模式如何支持并行处理——不同过滤器可以部署在不同节点`,`Unix 管道（|）和 Java 的 Stream API 的相似性——链式数据处理`],tags:[`设计模式`,`管道过滤器`,`架构`,`数据处理`],content_hash:`fd207952de1a`,id:1267},{category:`design_patterns`,difficulty:`medium`,type:`short_answer`,title:`对象池模式（Object Pool）`,content:`对象池模式（Object Pool）解决什么问题？数据库连接池和线程池的实现原理是什么？如何正确设计对象池？`,answer:`答案：对象池通过重用创建成本高的对象（数据库连接、线程、HTTP 连接）来减少频繁创建和销毁的开销。数据库连接池维护一组已创建的连接，请求时从池中借出，使用完归还——避免每次请求都创建新连接（TCP 握手 + MySQL 认证的开销）。线程池维护一组工作线程，任务提交到队列，空闲线程从队列取任务执行——避免频繁创建/销毁线程（系统调用 + 栈分配的开销）。核心设计：池容量、借出/归还机制、空闲清理、最大等待时间。

解析：对象池的核心接口——1）borrowObject()：从池中获取空闲对象。如果池为空且未达最大大小，创建新对象；否则等待其他线程归还。2）returnObject()：使用完后归还对象到池中。需要重置对象状态（如关闭未提交的事务、清除临时数据）。3）validateObject()：验证对象是否仍可用（如数据库连接是否断开）。断开的连接自动移除并创建新连接。HikariCP（数据库连接池）的参数——maximumPoolSize（最大连接数）、minimumIdle（最小空闲数）、connectionTimeout（等待超时，默认 30 秒）、idleTimeout（空闲超时）、maxLifetime（连接最大存活时间）。

扩展延伸：线程池——Java 的 ThreadPoolExecutor：corePoolSize（核心线程数）、maximumPoolSize（最大线程数）、keepAliveTime（空闲线程存活时间）、workQueue（任务队列）。执行策略：1）线程数 < corePoolSize → 新建线程。2）≥ corePoolSize → 任务入队。3）队列满且线程数 < maxPoolSize → 新建临时线程。4）队列满且已达 maxPoolSize → 拒绝策略。Common Pool 的失效策略——空闲对象超时自动销毁、借用时验证对象可用性、连接泄漏检测（HikariCP 的 leakDetectionThreshold，借出超时未归还会触发告警）。

注意：对象池适用于创建开销大的资源。创建开销小的对象（如 ArrayList、普通 POJO）不需要池化——GC 的优化效果比对象池更好。`,hints:[`为什么 ArrayList 或 POJO 不需要池化——GC 的逃逸分析和 TLAB 的优化`,`HikariCP 的 leakDetectionThreshold 如何检测连接泄漏`],tags:[`设计模式`,`对象池`,`连接池`,`线程池`],content_hash:`985c706f7e58`,id:1268},{category:`design_patterns`,difficulty:`medium`,type:`short_answer`,title:`空对象模式（Null Object）`,content:`空对象模式（Null Object）解决什么问题？如何实现？它和 Optional 的区别？`,answer:`答案：空对象模式用一个不做事（或返回安全默认值）的对象替代 null 引用，避免每次使用时都需要做 null 检查（if (obj != null)）。实现方式：定义一个实现了目标接口的空对象类，所有方法返回默认值或不做操作。Optional 是一个容器，用于表示值存在或不存在，明确提示调用者需要处理「不存在」的情况。空对象模式是让代码自然处理「无」的情况，Optional 是强制调用者处理缺失。

解析：空对象模式的典型实现——interface Logger { void log(String msg); }。class ConsoleLogger implements Logger { void log(String msg) { System.out.println(msg); } }。class NullLogger implements Logger { void log(String msg) { /* no-op */ } }。使用：private Logger logger = new NullLogger(); // 默认不打印，调用处无需 null 检查。Optional——Optional 是一个包装类：Optional<User> findUser(String id);。调用者必须显式处理：findUser(id).ifPresent(user -> ...)。Optional 不会消除 null 检查，而是强迫你面对。

扩展延伸：空对象模式的应用场景——1）日志：NullLogger 避免无日志配置时的 NPE。2）命令模式中的空命令：UI 按钮在未绑定命令时返回 NoCommand（无操作对象）。3）集合中的空迭代器：返回空集合而不是 null（public List<Item> getItems() { return Collections.emptyList(); }）。4）树结构的叶子节点：在组合模式中，叶子节点可以视为「空节点」的一种。空对象模式的注意事项——1）空对象应该是不可变的（单例）。2）空对象的行为应该对系统无害——不写日志、不抛异常、返回安全默认值。3）空对象模式掩盖了本应被注意的 null 返回——如果你需要区分「这个用户不存在」和「系统出错」，空对象不适合，应使用异常或 Optional。`,hints:[`Optional 和 Null Object 的设计哲学差异——Optional 强制处理，Null Object 透明跳过`,`Collections.emptyList() 为什么比返回 null 更好——调用者可以直接遍历无需检查`],tags:[`设计模式`,`Null Object`,`Optional`,`空安全`],content_hash:`69f40baf19c9`,id:1269},{category:`design_patterns`,difficulty:`easy`,type:`short_answer`,title:`值对象与 DTO`,content:`值对象（Value Object）和 DTO（Data Transfer Object）有什么区别？各自的使用场景？不可变对象在设计中的好处？`,answer:`答案：值对象（VO）用属性值本身来标识（没有 ID），两个 VO 如果属性值全部相同则视为同一个。DTO 是纯粹的数据容器，用于在不同层或系统间传输数据，不含业务逻辑。本质区别：VO 是领域驱动设计的概念，有业务含义（如 Money、Address）。DTO 是技术性的，按需定义。不可变对象的优点：线程安全（不需要同步）、可缓存、可分享、行为可预测。

解析：值对象——class Money { private BigDecimal amount; private Currency currency; }。两个 Money(100, USD) 实例视为相等（通过 equals/hashCode 比较所有属性）。VO 应该被设计为不可变——每次「修改」返回新对象：money.add(otherMoney) → 返回新的 Money 而不是修改自身。DTO——class UserDTO { private String name; private int age; }。DTO 通常是可变或不严格的，为了方便序列化（JSON/XML）。DTO 不需要业务方法，只是数据的封装。

扩展延伸：DTO vs VO in 实际项目——1）DTO：用于 API 请求/响应。特点：与外部接口契约绑定、可能聚合多个领域对象的数据、可以包含冗余数据。2）VO：用于领域层内部的业务计算。特点：业务不可变（如 TimeRange）、保证自身完整性（负数金额不合法）。3）DO（Data Object / PO）：ORM 实体，与数据库表结构对应。不可变对象的好处——1）不需要防御性拷贝（defensive copy）。2）作为 Map 的 Key 时不会改变 hashCode。3）构建复杂对象时推荐使用 Builder 模式。Lombok 的 @Value（生成不可变类）、@Builder、@Data 帮助快速创建 VO/DTO。不要滥用 DTO——在简单的、不会变化的层级之间过度使用 DTO 会导致大量的样板代码（每个层都要做对象转换）。`,hints:[`值对象（VO）和 JPA 实体（Entity/DO）的生命周期差异——VO 没有 ID，比较全部属性`,`为什么不推荐在领域层以外使用领域对象——DTO 的隔离作用`],tags:[`设计模式`,`值对象`,`DTO`,`不可变`],content_hash:`3e541d970f7c`,id:1270},{category:`design_patterns`,difficulty:`hard`,type:`short_answer`,title:`防腐层（Anti-Corruption Layer）`,content:`什么是防腐层（Anti-Corruption Layer，ACL）？在什么场景下需要引入 ACL？ACL 的实现模式有哪些？`,answer:`答案：防腐层是在两个系统之间引入的转换层，防止外部系统的概念和模型「污染」内部核心域。ACL 将外部系统的接口翻译为内部系统理解的接口，确保内部核心域的纯净。在集成遗留系统、第三方服务、异构系统时引入。实现模式：外观（Facade）+ 适配器（Adapter）+ 转换器（Translator）。

解析：为什么需要 ACL——新系统有自己的领域模型和业务规则。外部系统（如老系统的 Customer 对象有 50 个字段，字段含义模糊）如果直接映射到新系统的领域模型，会导致领域模型被外部概念污染、新系统的业务逻辑被迫理解旧系统的诡异设计。ACL 的实现——1）Facade：封装对外部系统的调用（隐藏通信协议、API 细节）。2）Adapter：将外部系统的接口适配为内部系统期望的接口。3）Translator：转换数据结构（ExternalCustomer → InternalCustomer），字段名映射、值转换、数据补充。

扩展延伸：ACL 的具体实现——class ExternalCustomerService { CustomerDTO fetch(String id); }。class CustomerTranslator { InternalCustomer translate(ExternalCustomerDTO dto) { return InternalCustomer.builder().id(dto.getCustomerId()).name(dto.getFullName().trim()).build(); } }。class InternalCustomerService { private final ExternalCustomerService external; private final CustomerTranslator translator; InternalCustomer getCustomer(String id) { var dto = external.fetch(id); return translator.translate(dto); } }。ACL 的层次——1）接口层 ACL：REST API 的 DTO 转换（入站/出站）。2）基础设施层 ACL：消息队列的消息格式转换。3）领域层 ACL：领域事件的转换。设计权衡——ACL 本身的维护成本：如果外部系统频繁变更，ACL 需要同步更新。完全隔离可能带来过度复杂，需要根据外部系统稳定性和影响范围决定 ACL 的覆盖程度。`,hints:[`防腐层（ACL）和适配器模式的本质联系——ACL = Facade + Adapter + Translator`,`在微服务架构中 ACL 如何防止服务间模型耦合`],tags:[`设计模式`,`DDD`,`防腐层`,`ACL`],content_hash:`c2e993324b6e`,id:1271},{category:`design_patterns`,difficulty:`medium`,type:`short_answer`,title:`领域事件（Domain Event）`,content:`什么是领域事件（Domain Event）？它和普通事件/MQ 消息的区别？领域事件在 DDD 中的角色？如何保证领域事件的可靠性？`,answer:`答案：领域事件是领域层中发生的、对业务有意义的过去事件（如 OrderSubmitted、PaymentReceived）。领域事件表达的是业务概念，不是技术概念。和 MQ 消息的区别：领域事件是业务语义的（「订单已提交」），MQ 消息是技术实现的（「有新的 JSON 消息在 topic-order」）。领域事件在 DDD 中用于聚合间的通信——一个聚合的变更通过事件通知其他聚合。可靠性通过「事件先存储到事件表 → 然后发布到消息队列 → 消费者处理」的模式（Outbox Pattern）保证。

解析：领域事件的使用——1）聚合边界通信：同一限界上下文（Bounded Context）内，聚合 A 发布事件，聚合 B 订阅处理（通常在同一事务中或最终一致）。2）限界上下文间通信：上下文 A 发布事件，上下文 B 订阅（通过消息队列，异步，最终一致）。3）发布副作用：如「订单已提交」后发送邮件通知。领域事件命名约定——使用过去时：OrderSubmitted、ItemShipped、PaymentRefunded。包含事件 ID、聚合 ID、时间戳、事件数据。

扩展延伸：事件发布的可靠性——Outbox Pattern：1）领域事件先写入数据库的 outbox 表（与业务数据在同一事务中）。2）单独的消息发布器定时扫描 outbox 表，将事件发布到消息队列。3）发布成功后标记事件为已发送。通过这种方式保证「业务操作成功 = 事件必发」（Exactly-once 或至少一次）。事务性发件箱（Transactional Outbox）的关键——业务操作和事件存储在同一数据库事务中，确保原子性。事件版本管理——随着业务演进，事件定义会变化：1）事件 Schema 版本号（event_version）。2）兼容性原则：新增字段可选（默认值）、不删除已有字段、不改变已有字段语义。`,hints:[`为什么领域事件比直接调用另一个聚合的方法更好——解耦和最终一致性`,`Outbox Pattern 如何解决「业务成功但事件没发出去」的问题`],tags:[`设计模式`,`领域事件`,`DDD`,`Outbox`],content_hash:`58e2c7ef51b8`,id:1272},{category:`design_patterns`,difficulty:`medium`,type:`short_answer`,title:`聚合（Aggregate）模式`,content:`DDD 中聚合（Aggregate）是什么？聚合根（Aggregate Root）的选择原则？聚合应该多大？为什么聚合是事务一致性的边界？`,answer:`答案：聚合是一组相关对象的集群，聚合根是聚合内唯一可以被外部引用的实体。聚合是事务一致性的边界——聚合内强一致性（同一个事务），聚合间最终一致性（通过领域事件）。聚合大小的原则：尽量小（小聚合提高并发性），但必须保证业务一致性不分裂。聚合根的选择：在聚合中找有全局标识的实体。

解析：聚合的例子——订单聚合：Order（聚合根）+ OrderItem（聚合内部实体）+ ShippingAddress（值对象）。OrderRepository 只操作 Order 聚合根。外部不能直接引用 OrderItem（必须通过 Order 访问）。为什么聚合是事务边界——「一个事务只修改一个聚合实例」是 DDD 的核心原则。如果一个事务同时修改了 Order 和 Customer 两个聚合，就需要同时锁定两条数据，影响扩展性和并发性。正确做法：Order 发布事件（OrderSubmitted），Customer 订阅事件异步更新（最终一致）。

扩展延伸：聚合的设计原则——1）聚合根有全局唯一标识（ID），内部实体只有本地标识（在聚合内唯一）。2）聚合边界内保护业务不变量（Invariant）。例如订单聚合保证所有 OrderItem 的 total 等于 Order 的 total。3）通过聚合根访问内部对象——不直接暴露内部集合（返回不可变副本或 Immutable 集合）。4）聚合的大小不是由数据量决定的，而是由事务一致性的边界决定的。聚合大小的常见问题——1）过大（上帝聚合）：一个聚合包含太多实体，事务时间长、并发冲突高。2）过小（实体碎片化）：不应该用聚合的地方用了聚合。如果实体 A 和 B 不在同一个事务中修改就无所谓，那它们就不应该放在同一个聚合里。`,hints:[`为什么 DDD 强调「一个事务只修改一个聚合」——事务一致性和扩展性的平衡`,`聚合根和普通实体的关键区别——对外部世界的访问权限`],tags:[`设计模式`,`DDD`,`聚合`,`领域驱动设计`],content_hash:`849666fe271a`,id:1273},{category:`design_patterns`,difficulty:`hard`,type:`short_answer`,title:`规格模式（Specification）`,content:`规格模式（Specification Pattern）解决什么问题？如何实现？在什么场景下特别有用？`,answer:`答案：规格模式将业务规则封装为可组合、可复用的谓词对象（Predicate），替代散落在代码中的 if-else 判断。核心思想：业务规则（规格）是领域概念，应该显式建模为对象。实现方式：定义 Specification<T> 接口（isSatisfiedBy 方法），组合规格通过 and/or/not 方法实现。在复杂查询、业务规则组合、验证逻辑场景下特别有用。

解析：规格模式的实现——interface Specification<T> { boolean isSatisfiedBy(T candidate); Specification<T> and(Specification<T> other); Specification<T> or(Specification<T> other); Specification<T> not(); }。具体规格：class PremiumCustomerSpec implements Specification<Order> { boolean isSatisfiedBy(Order order) { return order.getTotal() > 1000; } }。组合使用：Specification<Order> eligible = new PremiumCustomerSpec().and(new WithinDateRangeSpec('2024-01-01', '2024-12-31')).or(new VIPCustomerSpec())。

扩展延伸：规格模式的应用场景——1）业务验证：if (spec.isSatisfiedBy(order)) { applyDiscount(); }。2）内存筛选：orders.stream().filter(order -> spec.isSatisfiedBy(order))。3）数据库查询：规格可以转换为 JPA Criteria 或 SQL WHERE 子句（通过 toQuery() 或 JPA Specification 接口）。规格模式 vs 策略模式——规格模式是复合的谓词（判断真/假），策略模式是封装的算法（可以做任何事情）。规格模式天生支持 and/or/not 组合。性能注意事项——内存过滤适合小数据集。大数据集需要在数据库层执行（Specification → SQL WHERE）。Spring Data JPA 的 JpaSpecificationExecutor 直接支持 Specification 接口。`,hints:[`规格模式（Specification）如何通过 and/or/not 实现业务规则的组合`,`What 和 How 的分离在规格模式中的体现——规格描述条件，框架负责执行`],tags:[`设计模式`,`规格`,`Specification`,`DDD`],content_hash:`5261b03eddc8`,id:1274},{category:`design_patterns`,difficulty:`medium`,type:`short_answer`,title:`服务定位器（Service Locator）`,content:`服务定位器模式是什么？它和依赖注入（DI）的区别？为什么很多人认为服务定位器是反模式？什么场景下仍可使用？`,answer:`答案：服务定位器提供一个全局访问点（静态方法），客户端通过服务名称或类型获取依赖实例。与 DI 的区别：DI 是被动的（依赖由容器注入），服务定位器是主动的（代码主动 get 依赖）。服务定位器被认为是反模式的原因：隐藏依赖关系（只看方法签名不知道依赖了什么）、难以测试（全局状态）、违反 DIP（依赖具体定位器而非抽象）。在遗留系统迁移和框架代码中仍有使用场景。

解析：服务定位器的实现——class ServiceLocator { private static Map<Class, Object> services = new HashMap<>(); public static <T> T get(Class<T> clazz) { return (T) services.get(clazz); } public static <T> void register(Class<T> clazz, T instance) { services.put(clazz, instance); } }。使用：UserService service = ServiceLocator.get(UserService.class)。问题分析——1）依赖关系不透明：只看方法签名不知道这个类需要 UserService。构造函数注入——构造参数明确表达了依赖。2）全局状态：services map 是全局的，测试之间互相污染。3）运行时错误：如果某个服务未注册，get() 在运行时才失败（DI 在容器启动时就能发现）。

扩展延伸：为什么算反模式——Martin Fowler 本人提出过服务定位器，但也指出优于直接硬编码依赖。DI 被认为是更好的选择，原因：依赖显式化（构造函数声明依赖）、可测试性好、编译时检查（IDE 可以发现未配置的依赖）。服务定位器仍可用的场景——1）遗留系统迁移：已有代码大量使用静态工厂或全局单例，无法一夜间迁移到 DI。2）框架代码：在 DI 容器不可用的位置（如 JPA 的 AttributeConverter）获取服务。3）性能关键的极简场景：减少 DI 容器的反射开销。注意：即使在可用场景下，也建议将服务定位器封装在内部，不在公共 API 中暴露。`,hints:[`为什么服务定位器被称为「比全局变量稍好一点的全局变量」——隐藏依赖和测试困难`,`构造函数注入如何通过方法签名就暴露了类的所有依赖`],tags:[`设计模式`,`Service Locator`,`DI`,`反模式`],content_hash:`7af614e95dc9`,id:1275},{category:`design_patterns`,difficulty:`hard`,type:`short_answer`,title:`不可变对象模式`,content:`不可变对象（Immutable Object）的核心设计原则是什么？Java 中 String 和 Integer 是如何实现不可变的？不可变对象有哪些优缺点？`,answer:`答案：不可变对象创建后状态不可修改。核心原则：不提供 Setter、所有字段声明为 final、类声明为 final（防止子类破坏）、不暴露对象内部的可变引用（防御性拷贝）、在构造函数中完成所有初始化。String 类不可变——char[] 字段是 final 的，所有修改操作（concat、substring）返回新 String。Integer 也是不可变的——int 值通过构造函数设置后不可改变。优点：线程安全（不需要同步）、可缓存、可用作 Map 的 Key。缺点：创建对象多（GC 压力）、修改频繁时性能差。

解析：不可变对象的实现——public final class Point { private final int x; private final int y; public Point(int x, int y) { this.x = x; this.y = y; } public Point move(int dx, int dy) { return new Point(x + dx, y + dy); } }。move() 不修改自身，返回新 Point。防御性拷贝——如果构造函数接收的是可变对象引用（如 Date、List），需要创建副本：public Period(Date start, Date end) { this.start = new Date(start.getTime()); this.end = new Date(end.getTime()); }。String 的不可变性——内部 private final char value[]。substring() 在 Java 7+ 中复制字符数组而非共享（避免内存泄漏）。

扩展延伸：不可变对象在并发中的优势——多个线程同时读取不可变对象时不需要任何同步措施（没有竞态条件）。这也是函数式编程的核心优势之一（引用透明性）。不可变对象的性能优化——1）享元模式：共享相同的不可变实例（如 Integer 缓存 -128 到 127）。2）Builder 模式：在构建阶段使用可变 Builder，build() 后转为不可变对象。3）String Pool：字符串常量池共享相同字面量的 String。不可变对象的替代方案——1）Record（Java 16+）：自动生成不可变数据载体：record Point(int x, int y) {}。2）@With（Lombok）：生成 withXxx 方法，返回修改了指定属性后的新副本。`,hints:[`为什么防御性拷贝在不可变对象的构造函数中是必要的——外部仍持有可变引用`,`不可变对象在多线程中为什么不需要同步——没有状态变更 = 没有竞态条件`],tags:[`设计模式`,`不可变`,`Immutable`,`线程安全`],content_hash:`ccbd3dde498e`,id:1276},{category:`design_patterns`,difficulty:`medium`,type:`short_answer`,title:`读取器写入器锁（Read-Write Lock）`,content:`读取器写入器锁（Read-Write Lock）和普通互斥锁的区别？Java 的 ReadWriteLock 和 StampedLock 有什么不同？读写锁在什么场景下性能更好？`,answer:`答案：读写锁允许多个读取器同时访问共享资源，但写入器需要独占访问（与读取器和其他写入器互斥）。普通互斥锁在任何时刻只允许一个线程访问。Java ReadWriteLock 读锁可重入，写入时读取器等待；StampedLock 支持乐观读（不加锁读取，写入后版本号变化，通过 validate 检测冲突）。读写锁在读多写少的场景下性能比普通互斥锁好得多。

解析：ReadWriteLock（读写锁）——读锁（readLock().lock()）：多个线程可同时持有。写锁（writeLock().lock()）：独占，必须等待所有读锁释放。问题：如果有大量读者持续持有读锁，写入器可能一直得不到机会（写入饥饿）。读写锁适合读操作远多于写操作的场景（如配置缓存读取）。StampedLock（Java 8+）——三种访问模式：1）读锁（readLock()）：传统读锁。2）写锁（writeLock()）：传统写锁。3）乐观读（tryOptimisticRead()）：不加锁读取，通过 stamp.validate() 检测是否有写入。如果检测到写入，升级为传统读锁或重试。

扩展延伸：性能对比——在读多写少的场景下，ReadWriteLock 比 synchronized 有 2-5 倍性能提升，StampedLock 乐观读又比 ReadWriteLock 快 2-3 倍（乐观读不需要 CAS 操作）。StampedLock 的限制——1）不可重入（与 ReadWriteLock 不同）。2）不支持 Condition。3）不支持锁降级（ReadWriteLock 支持写锁→读锁降级）。4）使用模式需要谨慎：乐观读后必须用 stamp 验证。乐观读的正确使用模式——long stamp = sl.tryOptimisticRead(); int x = stateX; int y = stateY; if (!sl.validate(stamp)) { stamp = sl.readLock(); try { x = stateX; y = stateY; } finally { sl.unlockRead(stamp); } }。`,hints:[`ReadWriteLock 的写入饥饿问题——长时间读操作导致写入器永远拿不到写锁`,`StampedLock 的乐观读为什么不需要阻塞——版本号验证机制`],tags:[`设计模式`,`读写锁`,`并发`,`StampedLock`],content_hash:`6b5eff3adcab`,id:1277},{category:`design_patterns`,difficulty:`hard`,type:`short_answer`,title:`两阶段终止模式（Two-Phase Termination）`,content:`什么是两阶段终止模式（Two-Phase Termination）？它解决什么问题？Java 中如何安全地停止线程？`,answer:`答案：两阶段终止模式提供一种优雅停止线程的方法——第一阶段发通知（信号），第二阶段做清理（资源释放）。它解决线程被强制中断时资源泄漏的问题（锁未释放、文件未关闭、连接未归还）。线程安全停止的推荐方式：使用中断信号（interrupt）或 volatile 标志，让线程自己终止，而非强制 stop()。

解析：为什么需要两阶段终止——Thread.stop() 被废弃的原因：强制停止线程会导致监视器（锁）突然释放，被锁保护的数据处于不一致状态。两阶段终止的原则：不主动杀死线程，而是通知线程「该停了」，让线程自己决定何时、在安全的位置停止。实现方式（使用中断标志）——第一阶段（发出终止信号）：targetThread.interrupt()（设置中断标志）。第二阶段（线程响应终止）：在 Runnable 的 run() 或循环中检查 Thread.currentThread().isInterrupted()。在 sleep()/wait()/join() 的 InterruptedException 捕获中恢复中断标志。

扩展延伸：使用 volatile 标志——private volatile boolean stopped = false;。线程中 while (!stopped) { process(); }。调用 stopped = true 终止。相比 interrupt 方式的优劣：优点——不依赖 JVM 的中断机制，没有 InterruptedException 处理问题。缺点——线程阻塞在 wait()/sleep()/take() 时无法响应标志变化（需要用 interrupt 或在阻塞方法上设置超时）。ExecutorService 的 shutdown()——调用 shutdown() 后不再接受新任务，已提交任务继续执行。awaitTermination() 等待已提交任务完成（可以设置超时）。shutdownNow() 尝试中断正在执行的任务（设置中断标志），返回未开始的任务列表。

实际的线程池优雅关闭——1）第一阶段：shutdown() 拒绝新任务。2）第二阶段：awaitTermination(30, TimeUnit.SECONDS) 等待现有任务完成。3）超时后 shutdownNow() 强制中断未完成的任务。4）再次 awaitTermination() 等清理完成。注意：线程的清理工作（finally 块释放资源）应该由业务代码保证，不依赖终止模式。`,hints:[`为什么 Thread.stop() 被废弃——释放监视器导致数据不一致`,`interrupt() 和 volatile 标志在停止线程时的互补关系——中断能唤醒阻塞的线程`],tags:[`设计模式`,`线程`,`终止`,`并发`],content_hash:`3ae2f4265adc`,id:1278},{category:`design_patterns`,difficulty:`medium`,type:`short_answer`,title:`微内核架构（Microkernel Architecture）`,content:`微内核架构（Microkernel/Plugin Architecture）的核心思想是什么？它和插件系统、SPI 机制的关系？业务系统中的实际应用？`,answer:`答案：微内核架构的核心系统（内核）只包含最小功能集，其他功能通过插件扩展。内核提供核心服务和扩展点（Extension Point），插件实现扩展接口。Java 的 SPI（Service Provider Interface）是微内核思想在 JDK 中的体现（JDBC Driver、日志框架绑定）。业务系统中的应用：工作流引擎（核心调度 + 各种 Action 插件）、IDE（Eclipse/VS Code 的插件体系）、规则引擎。

解析：微内核的组成——1）核心系统：系统启动、插件管理、扩展点定义、基础服务。核心不包含任何业务逻辑，只提供扩展机制。2）插件：实现扩展点的模块，可以独立开发、部署、升级。3）通信契约（Contract）：核心和插件之间的接口协议。Java SPI 机制——META-INF/services/接口全限定名 文件内容为实现类全限定名。ServiceLoader 加载所有实现。JDBC DriverManager 使用 SPI 加载数据库驱动。

扩展延伸：微内核的优缺点——优点：1）可扩展性强——新增插件不需要修改核心。2）隔离性好——不同插件可以独立开发和发布。3）灵活性——用户可以按需组合插件（如 IDE 的插件市场）。缺点：1）设计复杂度高——正确设计扩展点非常困难（扩展点设计难改）。2）插件间通信困难——插件 A 和插件 B 如何交互？需要核心提供插件协作机制。3）性能开销——插件调用需要间接路由。

业务系统的实际应用——1）支付系统：核心处理路由和清算，插件处理各渠道（支付宝、微信、银联）。2）报表系统：核心处理渲染和导出，插件处理数据源（SQL、CSV、API）。3）校验框架：Bean Validation（JSR 380）的 ConstraintValidator 是一种插件架构。4）Spring Factories：spring.factories 机制（自动配置）。设计扩展点的注意事项：扩展点一旦定义就难以修改（所有下游插件需要适配），建议在扩展点设计时预留足够的灵活性。`,hints:[`Java SPI（ServiceLoader）和 Spring Factories 在插件加载机制上的异同`,`为什么微内核的扩展点设计是架构决策中的高风险事项——接口一旦发布难以修改`],tags:[`设计模式`,`微内核`,`架构`,`SPI`],content_hash:`dc1c90f95e90`,id:1279},{category:`design_patterns`,difficulty:`medium`,type:`short_answer`,title:`模块模式（Module Pattern）`,content:`模块模式的核心思想是什么？Java 9 的模块系统（JPMS）解决了什么问题？和传统包（Package）机制的区别？`,answer:`答案：模块模式将相关代码组织为高内聚、低耦合的独立单元，只暴露有限接口。Java 9 的模块系统（JPMS，Project Jigsaw）解决了 JAR 地狱（Classpath 无边界、类冲突、缺少封装）的问题——模块显式声明依赖（requires）和导出（exports），运行时强制封装。传统 package 没有访问控制（public 对整个 classpath 可见），JPMS 的模块将未 export 的 package 完全封装在模块内部（强制信息隐藏）。

解析：模块模式的要素——1）接口（Interface）：模块对外暴露的 API。2）实现（Implementation）：模块内部的实现，对外不可见。3）依赖（Dependency）：模块依赖的其他模块。JPMS 的 module-info.java——module com.example.myapp { requires com.example.mylib; exports com.example.myapp.api; provides com.example.spi.MyService with com.example.impl.MyServiceImpl; }。未在 exports 中列出的 package 外部完全不可见（即使是 public 类）。

扩展延伸：模块化 vs 微服务——模块是代码组织层面的概念（编译时），微服务是部署层面的概念（运行时）。模块化系统可以通过 JPMS 实现代码层面的强封装。传统 Spring Boot 应用的模块化通常通过多模块 Maven/Gradle 项目实现：parent/app-core/app-api/app-impl。使用 Maven 模块的依赖管理进行编译时隔离。JPMS 的关键优势——1）强封装：public 不再意味着全局可见。2）明确依赖：requires 声明明确模块依赖。3）运行时检查：启动时验证模块依赖完整性。JPMS 的采用度有限——大多数 Java 项目仍使用传统 classpath，因为迁移成本高（需要使用模块化的第三方库、split package 问题）。Spring Boot 等框架也没有强制使用 JPMS。模块化的实际指导——在多模块 Maven/Gradle 项目中通过依赖管理和包命名约定来实现模块化，比 JPMS 更实用。`,hints:[`Java 9 JPMS 的 exports 和 open 关键字区别——exports 只允许编译时访问，open 允许运行时反射`,`为什么 JPMS 在工业界采用率不高——迁移成本高和 split package 问题`],tags:[`设计模式`,`模块`,`JPMS`,`架构`],content_hash:`b9e39c3df1f7`,id:1280},{category:`design_patterns`,difficulty:`medium`,type:`short_answer`,title:`服务网格与 Sidecar 模式`,content:`Sidecar 模式在微服务架构中的作用是什么？服务网格（Service Mesh）如何利用 Sidecar 实现流量管理和可观测性？`,answer:`答案：Sidecar 模式将微服务的附加功能（日志、监控、配置、网络代理）从主应用中剥离，以独立的 Sidecar 进程形式部署在同一个 Pod/主机中。服务网格（如 Istio、Linkerd）通过 Sidecar 代理（如 Envoy）代理所有进出流量，实现熔断、重试、负载均衡、流量分割、可观测性（Tracing、Metrics），无需修改业务代码。

解析：Sidecar 模式的结构——主应用容器 + Sidecar 容器共享同一个 Pod（Kubernetes 中）。Sidecar 拦截所有进出流量（通过 iptables 规则透明引流），应用无感知。典型 Sidecar 功能——1）服务发现：Envoy 从控制平面（Istiod）获取服务列表。2）流量管理：权重路由、版本灰度、故障注入。3）可观测性：自动生成 Metrics（请求量、延迟、错误率）和 Distributed Tracing。4）安全：mTLS 自动加密服务间通信、策略执行。

扩展延伸：控制平面和数据平面——服务网格分为控制平面（Istiod：管理规则、证书、配置下发）和数据平面（Envoy Sidecar：执行流量转发和策略）。Sidecar 模式的优缺点——优点：1）业务代码与技术关注点完全分离。2）多语言支持——Sidecar 不限制主应用的语言。3）透明升级——Sidecar 版本独立于应用升级。缺点：1）增加延迟——每次服务调用多一次代理跳转（1-3ms 额外延迟）。2）资源开销——每个 Pod 多一个 Sidecar 容器（内存 50-200MB）。3）调试复杂度——流量路径中多了一个代理层。

不使用服务网格时的替代——需要每个微服务自身实现熔断（Hystrix/Resilience4j）、重试、负载均衡等。Sidecar 模式将这些统一下沉到基础设施层。选型建议：微服务数量 < 10 需要服务网格的收益不大。数量 > 20 且多语言时服务网格的收益显著。`,hints:[`Sidecar 代理的透明流量拦截原理——iptables 流量重定向到 Envoy`,`服务网格的 mTLS 如何在不修改代码的情况下实现服务间加密通信`],tags:[`设计模式`,`Sidecar`,`服务网格`,`微服务`],content_hash:`6feb3a5791e5`,id:1281},{category:`design_patterns`,difficulty:`medium`,type:`short_answer`,title:`Strangler Fig 模式（绞杀者模式）`,content:`绞杀者模式（Strangler Fig Pattern）解决什么问题？在遗留系统迁移中有哪些具体实现策略？`,answer:`答案：绞杀者模式通过渐进式替换来迁移遗留系统——在新系统中逐步实现旧系统的功能，每次替换一个模块，直到旧系统完全被新系统取代。得名于绞杀榕（Strangler Fig）逐渐缠绕并取代宿主树的生长方式。具体策略：路由层拦截（按 URL/用户/功能将请求分发到新旧系统）、数据同步（新旧系统数据双写逐步迁移）、功能切换（Feature Flag 控制切换）。

解析：实施步骤——1）识别边界：在遗留系统中识别可以独立替换的模块（通常按照业务功能或 API 端点）。2）建立拦截层：在遗留系统前增加反向代理或路由网关，拦截特定请求到新系统。3）渐进替换：每次选取一个 API 端点或模块，在新系统中实现，通过路由层切流量。4）数据迁移：如果涉及数据，需要双写或异步同步。5）清理：旧功能完全替换后，删除旧代码。

扩展延伸：路由策略——1）按 URL 路由：/api/v2/** 走新系统，/api/** 走旧系统。2）按用户分组：部分用户走新系统（金丝雀发布）。3）按功能：通过 Feature Flag 控制特定功能走新系统。数据迁移策略——1）双写（Dual Write）：新旧系统同时写入，确保两边数据一致（需要解决冲突）。2）数据同步：旧系统数据通过 CDC（Change Data Capture，如 Debezium）同步到新系统。3）批量迁移：分批将旧数据迁移到新系统（按用户/时间/范围分批）。

绞杀者模式的优势——低风险（逐步替换、随时回退）、渐进交付（每个模块替换完成即可交付）、不影响现有用户。挑战——1）数据同步复杂度：新旧数据一致性和冲突处理。2）拦截层耦合：路由逻辑可能变得越来越复杂（新旧系统的 URL 映射关系）。3）周期长——完全替换大型系统可能需要数年，团队需要保持长期投入的决心。`,hints:[`绞杀者模式和重写（Big Bang Rewrite）相比为什么风险更低——渐进替换、随时回退`,`双写（Dual Write）在数据迁移中的一致性挑战——分布式事务 vs 最终一致性`],tags:[`设计模式`,`Strangler Fig`,`迁移`,`遗留系统`],content_hash:`f5f40a098050`,id:1282},{category:`design_patterns`,difficulty:`medium`,type:`short_answer`,title:`Backend for Frontend（BFF）模式`,content:`BFF（Backend for Frontend）模式解决什么问题？BFF 和 API Gateway 的关系？BFF 的优缺点和适用场景？`,answer:`答案：BFF 是为每种客户端（Web、iOS、Android、第三方 API）创建专属的轻量级后端服务，直接针对该客户端的 UI 需求优化的数据聚合和转换层。BFF 解决的是「通用 API 无法同时满足不同客户端需求」的问题——Web 需要完整 HTML 页面，移动端需要精简 JSON，各自需要差异化的数据格式和内容。

解析：为什么需要 BFF——传统方案：一个通用 API 服务同时服务于 Web 和移动端。问题：1）Web 需要返回更多字段（浏览器端渲染），移动端只需要少量字段（带宽敏感），同一 API 无法兼顾。2）Web 需要在一个请求中获取更多数据（减少 HTTP 请求），移动端需要更精细的端点控制。3）移动端的日志、认证和错误处理策略与 Web 不同。BFF 的方案：Web BFF 聚合数据返回 HTML 或适配 Web 渲染的 JSON；Mobile BFF 返回轻量数据、支持离线缓存、适配慢网络。

扩展延伸：BFF 和 API Gateway——API Gateway 是统一的入口网关（路由、限流、认证、日志），BFF 是客户端的专属后端。通常部署模式：客户端 → API Gateway（公共能力）→ BFF（客户端专属逻辑）→ 后端服务（业务逻辑）。BFF 也可以直接作为 Gateway 的扩展。BFF 的挑战——1）代码重复：不同 BFF 之间可能有相似的数据聚合逻辑。2）维护成本：每个客户端需要一个 BFF 服务，团队需要维护多个服务。3）版本管理：BFF 和对应的客户端需要同步发布（特别在移动端）。适用场景——大型多端应用（Web + iOS + Android + 第三方）。小团队或单一客户端不需要 BFF（增加复杂度但收益不大）。GraphQL 是 BFF 的一种替代方案——客户端自主查询所需数据，由单个 GraphQL 服务聚合多后端。`,hints:[`BFF 和 GraphQL 在解决客户端数据需求差异时的不同思路——BFF 预设视图 vs GraphQL 客户端自主查询`,`为什么小团队不应该使用 BFF——多服务维护成本和团队规模的匹配`],tags:[`设计模式`,`BFF`,`架构`,`微服务`],content_hash:`de979f074529`,id:1283},{category:`design_patterns`,difficulty:`medium`,type:`short_answer`,title:`工厂模式在主流框架中的实战应用`,content:`Spring、MyBatis、SLF4J 等主流框架中如何实现工厂模式？如何通过工厂模式设计可扩展的插件体系？`,answer:`答案：Spring 的 BeanFactory 是所有 IoC 容器的根接口；MyBatis 的 SqlSessionFactory 创建 SqlSession；SLF4J 的 LoggerFactory 按 Logger 名称创建 Logger。工厂模式实现插件体系的核心机制是「工厂接口 + SPI 注册 + 反射加载」的组合。

解析：框架中的工厂模式——1）Spring BeanFactory：最基础的容器接口，getBean() 通过反射或工厂方法创建实例。FactoryBean 接口自定义创建逻辑（如 FeignClientFactoryBean、MapperFactoryBean）。抽象工厂——BeanDefinitionRegistryPostProcessor 批量注册 BeanDefinition。2）MyBatis SqlSessionFactory：通过 SqlSessionFactoryBuilder 解析配置构建，openSession() 每次打开会话。SqlSessionFactory 是工厂方法，MyBatis-Spring 整合时用 @MapperScan 扫描接口注册 MapperFactoryBean。3）SLF4J LoggerFactory：getLogger(Class) 返回 Logger 实例，底层绑定通过 SPI 查找具体实现（logback/log4j2）。插件化架构模式：定义扩展点接口 → SPI 声明实现 → ServiceLoader 或 @Autowired 注入集合 → 按类型选择实现。Spring 中 @Autowired List<Extension> 自动收集所有扩展实现。

扩展延伸：策略 + 工厂组合模式——Map<String, Strategy> @Autowired 自动注入，通过 getStrategy(type) 选择。在支付网关（微信/支付宝/银联）、审批流（多级别审批策略）、消息推送（短信/邮件/推送）中广泛使用。MyBatis Mapper 动态代理——不是静态工厂而是 JDK Proxy 动态代理，Spring + MyBatis 整合时将 Mapper 接口代理注入为 Bean。`,hints:[`FactoryBean 和 BeanFactory 有什么区别`,`为什么 MyBatis 选择动态代理而非静态工厂创建 Mapper`],tags:[`设计模式`,`工厂`,`Spring`,`MyBatis`,`SPI`],content_hash:`2420d1f5b943`,id:1284},{category:`design_patterns`,difficulty:`medium`,type:`short_answer`,title:`观察者模式与事件驱动架构的演化`,content:`观察者模式和发布-订阅模式有什么区别？观察者模式如何演变为现代事件驱动架构？Spring 的事件机制是如何实现的？`,answer:`答案：观察者模式中观察者直接注册到主题（一对多，紧耦合）。发布-订阅模式通过消息代理解耦发布者和订阅者。观察者模式是事件驱动架构的雏形。现代 EDA 通过事件总线/消息队列实现异步解耦。Spring 事件机制基于 ApplicationEvent + ApplicationListener + ApplicationEventPublisher，支持同步/异步事件驱动。

解析：观察者模式结构——Subject（维护观察者列表，notify 遍历调用）→ Observer（update 接口）。缺点：Subject 持有 Observer 引用，耦合强，通知均为同步阻塞。发布-订阅演进——引入消息代理（Event Channel/Broker）：Publisher → Broker → Subscriber。优点：完全解耦（Publisher 不知道 Subscriber 存在）、支持异步、支持消息过滤和路由（Topic/Exchange）。Spring 事件机制——1）定义事件类（继承 ApplicationEvent 或使用 GenericApplicationEvent）。2）@EventListener 注解方法（或实现 ApplicationListener 接口）。3）ApplicationEventPublisher.publishEvent() 发布。4）默认同步（同一线程），@Async 实现异步。5）@TransactionalEventListener 支持事务阶段（AFTER_COMMIT/AFTER_ROLLBACK）。

扩展延伸：观察者模式在 GUI 编程中广泛应用（Swing/AWT 的 Listener，JS 的 addEventListener）。现代事件驱动演进路线：观察者模式 → 事件总线（Guava EventBus/Spring Events）→ 消息队列（RabbitMQ/Kafka）→ 事件溯源（Event Sourcing）+ CQRS。微服务中观察者模式升级为服务间事件驱动通信——通过 Kafka/RocketMQ 实现跨服务事件通知和最终一致性。注意：观察者不适用于一对多的强依赖场景（一个 observer 失败影响全部），应改用 CompletableFuture 异步编排或消息队列。`,hints:[`Spring 的 @TransactionalEventListener 有什么用`,`观察者模式升级到消息队列解决了哪些问题`],tags:[`设计模式`,`观察者`,`发布订阅`,`Spring`,`事件驱动`],content_hash:`07174b366362`,id:1285},{category:`design_patterns`,difficulty:`medium`,type:`short_answer`,title:`建造者模式与流式 API 设计`,content:`建造者模式如何解决构造器参数过多的问题？Lombok @Builder 的底层实现原理是什么？如何在 API 设计中实现流畅的链式调用？`,answer:`答案：建造者模式将复杂对象的构建拆分为多个步骤，实现参数灵活组合、对象不可变、代码可读性高。Lombok @Builder 在编译期生成静态内部 Builder 类（Javac Annotation Processor），每个字段生成同名方法返回 Builder 自身，最后 build() 创建目标对象。流式 API 核心：每个方法返回 this，提供终端方法结束链式调用。

解析：传统方案对比——1）重叠构造器（Telescoping Constructor）：参数数量组合爆炸，类型易混淆。2）JavaBean 模式（无参构造 + setter）：对象可能进入不一致状态（设置一半），final 约束丢失。3）建造者模式：构造器 private，Builder 内部类负责校验和构建。优点：对象不可变（所有字段 final）/ 可分步设置 / 构建前完成校验。Lombok @Builder 原理：APT 在编译时生成 XXXBuilder 内部类，每个字段对应方法返回 Builder，build() 调用全参构造器。核心注解 @Builder.Default 处理默认值。流式 API 设计要点——方法名用 and/with 前缀，提供终端操作（build/execute/collect）结束链式调用，支持条件链式构造（带 if 判断的 addIf）。

扩展延伸：建造者模式在 Java 标准库中的应用——StringBuilder（链式 append）、Stream API（map/filter 链式）、Optional（map/orElse 链式）、OkHttp's Request.Builder。Jackson JsonNodeBuilder。建造者模式与 Lombok @Builder 配合陷阱——@Builder 生成全参构造器，手动写构造器需加 @AllArgsConstructor 或 @Builder.ObtainVia。级联 Builder（子类继承时）需用 self() 返回子类 Builder 类型。Guava 的 ImmutableList.Builder 也是经典实现。`,hints:[`建造者模式如何保证构造出的对象是不可变的`,`Lombok @Builder 和 @AllArgsConstructor 的关系`],tags:[`设计模式`,`建造者`,`Lombok`,`流式API`,`Builder`],content_hash:`e96c62b74081`,id:1286},{category:`design_patterns`,difficulty:`medium`,type:`short_answer`,title:`适配器模式与 SLF4J 门面设计`,content:`适配器模式和门面模式（外观模式）有什么区别？SLF4J 作为日志门面如何统一多种日志框架？实际项目中适配器模式的应用场景有哪些？`,answer:`答案：适配器模式解决接口不兼容——将一个接口转为客户端期望的另一个接口。门面模式为子系统提供统一高层接口。SLF4J 通过 SPI 加载底层绑定（logback/log4j2/java.util.logging），每种框架实现 SLF4J 的 Binding 适配器。适配器应用场景：接口兼容（旧系统迁移）、三方库包装、遗留系统集成、分页适配。

解析：适配器模式结构——Target（目标接口）、Adaptee（被适配者）、Adapter（转换器，持有 Adaptee 引用实现 Target 接口）。两种形式：1）类适配器（继承 Adaptee，不推荐，Java 单继承限制）。2）对象适配器（组合 Adaptee，推荐）。SLF4J 架构——SLF4J API（Logger/LoggerFactory）→ SPI 选择绑定 → 具体适配器（logback-classic/log4j-slf4j-impl/jul-to-slf4j）→ 底层日志框架。SLF4J 作为门面（Facade）的优点：1）应用代码只依赖 SLF4J，不依赖具体框架。2）切换日志框架只需替换 jar 包，代码零改动。3）通过桥接 jar（jcl-over-slf4j/log4j-over-slf4j）统一项目中多种日志依赖。门面模式与适配器区别——门面提供新接口简化使用（例如 JdbcTemplate 封装 JDBC 操作），适配器转换已有接口保持兼容。

扩展延伸：适配器在 Spring 中的经典实现——1）HandlerAdapter：MVC 中不同控制器（@Controller/HttpRequestHandler）通过适配器统一调用。2）AOP AdvisorAdapter：将不同通知类型适配到统一拦截器链。门面在 Spring 中的体现——RestTemplate（封装 HTTP 客户端）、JdbcTemplate（封装 JDBC）、TransactionTemplate（声明事务）。适配器 vs 装饰器：装饰器增强功能（BufferedInputStream 增强 FileInputStream），适配器转换接口形式（Arrays.asList 转换数组到 List）。设计原则——适配器模式是「开闭原则」的典型实践：通过适配器扩展而非修改原有类。`,hints:[`SLF4J 的桥接 jar（jcl-over-slf4j）和绑定 jar 有什么区别`,`适配器模式和装饰器模式在结构上相似，如何区分它们`],tags:[`设计模式`,`适配器`,`门面`,`SLF4J`,`Spring MVC`],content_hash:`59e946133710`,id:1287},{category:`design_patterns`,difficulty:`medium`,type:`short_answer`,title:`状态模式（State Pattern）`,content:`什么是状态模式？它解决什么问题？与策略模式有什么区别？请结合状态机的例子说明状态模式的应用。`,answer:`答案：状态模式允许对象在内部状态改变时改变其行为，看起来就像对象本身的类变了。它通过将每个状态的行为封装到独立的状态类中，消除大量的条件判断语句。

解析：状态模式的结构——1）Context（上下文）：持有当前状态对象的引用，将行为委托给状态对象处理。2）State（抽象状态）：定义所有状态下的行为接口。3）ConcreteState（具体状态）：实现特定状态下的行为，并负责在合适的时候切换到下一个状态。关键区别 vs 策略模式——状态模式的状态之间有关联和流转，状态的切换由状态对象或 Context 管理。策略模式的策略之间独立，由客户端（调用方）选择和切换策略。状态模式的行为变化是自动的（由内部状态驱动），策略模式的行为变化是主动的（由外部选择）。

扩展延伸：经典应用——1）TCP 连接状态机：ESTABLISHED（收发数据）、CLOSE_WAIT（等待关闭）、TIME_WAIT（等待确认）。每个状态对 open/close/acknowledge 等操作有不同的响应。2）订单状态流转：待支付->已支付->已发货->已收货->已完成。每个状态下对「取消」「退款」「修改地址」等操作有不同的处理逻辑。3）游戏角色状态：普通->狂暴->眩晕->隐身，不同状态下移动、攻击等行为不同。状态模式的优点：状态转换逻辑集中管理，新增状态不影响现有代码（开闭原则）。缺点：状态类数量会膨胀。`,hints:[`状态模式和策略模式的结构很像但意图不同——关键在于状态之间是否可以转换`,`状态模式如何消除大量的 if-else 或 switch-case`],tags:[`状态模式`,`State Pattern`,`设计模式`,`GoF`],content_hash:`bc712dcb53b8`,id:1288},{category:`design_patterns`,difficulty:`easy`,type:`short_answer`,title:`策略模式（Strategy Pattern）`,content:`什么是策略模式？它的使用场景是什么？如何在运行时动态切换策略？请以支付方式或排序算法为例说明。`,answer:`答案：策略模式定义一系列算法（策略），将每个算法封装在独立的策略类中，使它们可以互相替换。客户端可以在运行时选择不同的策略，而不用修改使用策略的上下文代码。

解析：策略模式的结构——1）Strategy（抽象策略）：定义所有策略必须实现的方法。2）ConcreteStrategy（具体策略）：实现具体的算法或行为。3）Context（上下文）：持有一个策略引用，在运行时可以切换策略。运行时切换策略——Context 暴露 setStrategy() 方法，客户端根据条件选择策略并注入。示例：支付系统——策略接口 PayStrategy.processPayment(amount)。具体策略：AlipayStrategy、WechatPayStrategy、CreditCardStrategy。Context（OrderService）保存策略引用，用户选择支付方式时调用 setStrategy(payStrategy) 切换，结算时调用 strategy.processPayment(total)。

扩展延伸：策略模式的典型应用——1）Java Comparator 接口：Collections.sort(list, comparator) 传入不同比较器即不同排序策略。2）Spring ResourceLoader：根据资源类型（classpath:/、file:/、http://）使用不同策略加载资源。3）线程池拒绝策略：AbortPolicy、DiscardPolicy、CallerRunsPolicy 等都是策略模式的体现。与状态模式的区别：策略之间互相独立，没有状态流转（状态模式的状态之间有因果关系）。优点：消除条件判断、符合开闭原则、策略可独立测试和复用。缺点：客户端需要了解不同策略的区别（违反最少知识原则）。`,hints:[`Comparator 接口本身就是策略模式的最佳案例`,`为什么策略模式和状态模式结构相似但意图完全不同`],tags:[`策略模式`,`Strategy Pattern`,`设计模式`,`GoF`],content_hash:`33daf8e66c15`,id:1289},{category:`design_patterns`,difficulty:`easy`,type:`short_answer`,title:`模板方法模式（Template Method Pattern）`,content:`什么是模板方法模式？它如何实现「好莱坞原则」（Don't call us, we'll call you）？在框架设计中为什么模板方法模式非常重要？`,answer:`答案：模板方法模式在父类中定义一个操作中的算法骨架（模板方法），将一些步骤延迟到子类中实现。子类可以重新定义算法的某些特定步骤而不改变算法的结构。好莱坞原则体现了「父类调用子类」的控制反转思想。

解析：模板方法模式的结构——1）AbstractClass（抽象类）：定义模板方法（通常是 final，不可重写），其中包含一系列步骤调用。步骤分为两类：抽象方法（子类必须实现）和钩子方法（Hook，子类可选覆盖）。2）ConcreteClass（具体类）：实现抽象方法，可选覆盖钩子方法来控制模板流程中的特定步骤。好莱坞原则——父类（框架）控制算法的整体流程，在适当的时候调用子类（用户代码）的方法。子类不决定何时被调用，而是被动地等待父类调用。

扩展延伸：模板方法模式的经典应用——1）Spring 中的 JdbcTemplate：query() 方法定义了「获取连接->创建 Statement->执行 SQL->处理 ResultSet->关闭连接」的骨架，用户只需实现 RowMapper 回调来处理结果集。2）Servlet 中的 doGet()/doPost()：service() 模板方法处理 HTTP 请求分发，子类覆盖 doGet() 实现具体逻辑。3）Java 的 AbstractList：定义了一系列公共操作，子类只需实现 get() 和 size()。4）JUnit：TestCase 的 runBare() 定义了 setUp()->runTest()->tearDown() 的测试执行骨架。优点：代码复用、扩展方便（修改公共行为只需改父类）。缺点：限制了灵活性（子类必须遵循父类的算法骨架）。`,hints:[`模板方法模式中的钩子（Hook）方法有什么作用——子类如何控制父类算法的执行`,`JdbcTemplate 是模板方法模式还是策略模式`],tags:[`模板方法`,`Template Method`,`设计模式`,`好莱坞原则`],content_hash:`e69449748cc6`,id:1290},{category:`design_patterns`,difficulty:`medium`,type:`short_answer`,title:`命令模式（Command Pattern）`,content:`什么是命令模式？它解决了什么设计问题？命令模式如何实现操作的撤销（Undo）、重做（Redo）和队列化？`,answer:`答案：命令模式将请求封装为对象，使请求的发送者（调用者）和接收者（执行者）解耦。命令对象可以参数化、队列化、持久化、支持撤销和重做。

解析：命令模式的结构——1）Command（抽象命令）：声明 execute() 方法，可选 undo() 方法。2）ConcreteCommand（具体命令）：持有接收者（Receiver）的引用，在 execute() 中调用接收者的业务方法。3）Invoker（调用者）：持有命令对象，在需要时调用 command.execute()。4）Receiver（接收者）：实际执行请求的业务逻辑。撤销和重做——1）每个命令保存执行前的状态（快照或增量），undo() 方法恢复该状态。2）历史记录栈（Undo Stack）：每次 execute() 将命令压栈，撤销时弹栈并调用 undo()。3）重做（Redo）栈：撤销时从 Undo 栈弹出并压入 Redo 栈，重做时从 Redo 栈弹出并重新 execute()。

扩展延伸：命令模式的经典应用——1）编辑器撤销/重做：每个编辑操作（插入字符、删除、替换格式）都是一个命令，保存执行前后的文档快照或操作记录。2）Java Runnable：将代码封装为 Runnable 对象，可提交到线程池执行（线程池是 Invoker）。3）事务回滚：数据库事务中每个写操作记录 undo 日志，回滚时依次执行 undo（Command 模式的工程实践）。4）任务队列和定时执行：将任务封装为命令对象，放入队列异步执行或定时调度。命令模式 vs 策略模式：命令模式关注「做什么」（将操作封装为对象），策略模式关注「怎么做」（将算法封装为对象）。`,hints:[`Undo 操作需要保存哪些信息——快照方式 vs 增量方式各有什么优劣`,`Java 的 Runnable 接口是命令模式吗——它缺少什么`],tags:[`命令模式`,`Command Pattern`,`设计模式`,`Undo/Redo`],content_hash:`0ec1725e9058`,id:1291},{category:`design_patterns`,difficulty:`medium`,type:`short_answer`,title:`责任链模式（Chain of Responsibility）`,content:`什么是责任链模式？它如何实现请求发送者和接收者的解耦？请结合 Servlet Filter 或拦截器的例子分析。`,answer:`答案：责任链模式将多个处理对象连成一条链，沿着链传递请求直到有对象处理它。每个处理对象决定自己是否处理以及是否将请求传递给下一个处理者。发送者不需要知道哪个接收者会处理请求。

解析：责任链模式的结构——1）Handler（抽象处理者）：定义处理请求的接口，持有下一个处理者的引用。2）ConcreteHandler（具体处理者）：检查请求是否符合自己的处理条件，符合则处理并终止传递（或继续传递），不符合则传递给下一个。链的构建——可以是链表结构（每个 Handler 持有 next 指针），也可以是集合结构（遍历 Handler 列表逐一尝试）。两种传递模式：纯责任链（一个处理者处理后就终止），不纯责任链（请求经过每个处理者，每个处理者都执行自己的逻辑后再传递，如 Servlet Filter）。

扩展延伸：经典应用——1）Servlet Filter：javax.servlet.Filter 的 doFilter(ServletRequest, ServletResponse, FilterChain) ——每个 Filter 在 doFilter() 中执行前置逻辑，调用 chain.doFilter() 交给下一个 Filter，返回时执行后置逻辑。典型的 AOP 拦截器模式。2）Spring Security Filter Chain：每个 SecurityFilter 负责一种安全检查（认证、授权、CORS、CSRF 等），全部通过后才到达 Controller。3）Java Logger：logger.trace() -> logger.debug() -> logger.info() -> logger.warn() -> logger.error()，每个级别决定是否输出。4）审批流：请假审批——直属主管 -> 部门经理 -> HR -> CEO，每个节点根据自己的权限决定审批或转交。责任链优点：降低耦合、灵活组合处理顺序。缺点：调试困难（请求最终处理者不易跟踪）、过长的链影响性能。`,hints:[`Servlet Filter 与责任链模式的关系——doFilter() 调用 chain.doFilter() 的执行流程`,`纯责任链和不纯责任链的区别——Spring Security Filter 属于哪一种`],tags:[`责任链模式`,`Chain of Responsibility`,`设计模式`,`Filter`],content_hash:`c73c07bb9e9d`,id:1292},{category:`design_patterns`,difficulty:`hard`,type:`short_answer`,title:`策略模式与工厂模式的组合应用`,content:`如何将策略模式（Strategy）和工厂模式（Factory）组合使用？这种组合在支付渠道路由、审批流程等场景中如何消除 if-else 分支？请给出具体的代码设计。`,answer:`答案：策略模式定义了算法族并使其可互换，工厂模式负责创建策略实例。两者组合时——工厂根据上下文（如支付方式、审批金额）创建对应的策略实例，调用方无需关心具体是哪个策略。组合的核心是「策略注册表 + 策略工厂」：策略实现类通过注解或配置注册到工厂，工厂根据入参查表返回策略。

解析：组合设计的结构——1）策略接口（PaymentStrategy）：定义 execute() 方法。2）具体策略（AlipayStrategy、WechatStrategy、CardStrategy）：各自实现支付逻辑。3）策略工厂（PaymentStrategyFactory）：持有 Map<String, PaymentStrategy> 映射（如 payType → Strategy Bean）。4）调用方注入工厂，根据 payType 获取策略：factory.getStrategy(payType).execute(order)。Spring 中的实现——1）@Autowired private Map<String, PaymentStrategy> strategyMap；Spring 自动将 PaymentStrategy 的所有实现类注入进来（key 为 Bean 名称）。2）通过策略的 getSupportedType() 方法返回支持的类型，工厂建立类型→Bean 的映射。3）完美消除 if-else：新增支付方式时只需新增一个策略实现类，无需修改任何业务代码（开闭原则）。

扩展延伸：高级组合——1）+ 模板方法：策略中的通用逻辑（如日志记录、事务管理）用模板方法抽象到基类。2）+ 策略链：一个请求可能匹配多个策略（如多个优惠活动叠加），用责任链包装策略。3）+ 注解驱动：通过 @PaymentType('alipay') 注解标注在策略实现类上，启动时自动扫描注册（如通过 Spring 的 BeanPostProcessor）。策略 + 工厂 + 模板方法三组合的典型应用——Spring Security 的 AuthenticationProvider 体系：provider 是策略（多种认证方式），ProviderManager 是工厂（管理 provider 列表）。Spring Cloud LoadBalancer 的 ReactorLoadBalancer 也是策略 + 工厂组合的体现。注意：策略模式消除了调用方的 if-else，但策略注册本身仍需要 if-else 或反射/注解扫描——工厂只是把「选择逻辑」从业务代码集中到了工厂内部，更易于维护。`,hints:[`Spring 中 @Autowired Map 如何实现策略的自动注册`,`策略模式 + 工厂组合后新增策略需要修改哪些代码`],tags:[`设计模式`,`策略模式`,`工厂模式`,`组合`],content_hash:`5ce70cd48290`,id:1293},{category:`design_patterns`,difficulty:`hard`,type:`short_answer`,title:`中间件模式：装饰器与责任链的组合`,content:`Web 框架中的中间件（Middleware）机制是装饰器模式和责任链模式的组合应用。请解释这种组合的原理，以及它如何实现请求/响应的横切关注点处理。`,answer:`答案：中间件模式将装饰器模式（增强功能）和责任链模式（链式传递）结合。每个中间件既是责任链上的一环（决定是否继续传递），又是装饰器（在请求处理前后添加行为）。核心结构是 Pipeline——每个中间件持有下一个中间件的引用（或 next 函数），形成链式调用。

解析：中间件的结构——1）中间件接口：Middleware(Context ctx, NextFunction next) → Response。2）每个中间件在调用 next(ctx) 之前执行「前置处理」，调用 next(ctx) 之后执行「后置处理」。3）链路组织：中间件列表按顺序组成链，最后一个中间件之后是真正的业务处理 Handler。责任链的体现——每个中间件决定是否继续传递给下一个（调用 next 或不调用），中间件可以中断链路（如认证失败直接返回 401，不调用 next）。装饰器的体现——每个中间件在 next 前后添加行为（如日志中间件在 next 前记录请求，next 后记录响应时间），多个中间件嵌套装饰。经典实现——1）Express/Koa（Node.js）：app.use(middleware) 添加中间件，洋葱模型（Koa）使得中间件可穿过整个链再回来。2）Spring Boot Filter/Interceptor：FilterChain 调用 doFilter(request, response, chain) 传递，多个 Filter 形成链。3）Go net/http：Handler 接口的 ServeHTTP 包装实现。

扩展延伸：洋葱模型（Koa）——1）从外到内执行所有中间件的「前置代码」，到达业务 Handler。2）从内到外执行所有中间件的「后置代码」。3）执行顺序：中间件 1 前置 → 中间件 2 前置 → … → Handler → … → 中间件 2 后置 → 中间件 1 后置。实际应用——1）日志中间件（前置：打印请求参数，后置：计算耗时）。2）认证中间件（前置：验证 Token，失败后不调用 next 直接返回）。3）限流中间件（前置：检查速率限制）。4）异常处理中间件（用 try-catch 包裹 next(ctx)，捕获所有下游异常）。组合模式 vs 单一模式——如果只用责任链（不 return 给上一层），中间件只能做前置处理（如 Java Filter 默认不做返回路径处理）。如果只用装饰器（层层包装），无法实现「中断」逻辑（如认证失败跳过后续处理）。中间件模式恰好融合了两者。`,hints:[`洋葱模型中请求和响应分别经过中间件链的什么路径`,`装饰器不提供中断机制，责任链不提供返回路径处理——中间件如何同时支持两者`],tags:[`设计模式`,`中间件`,`装饰器`,`责任链`,`洋葱模型`],content_hash:`8dad4ac893a0`,id:1294},{category:`design_patterns`,difficulty:`medium`,type:`short_answer`,title:`代理模式：虚拟代理、保护代理与远程代理`,content:`请介绍代理模式（Proxy）的三种常见变体——虚拟代理、保护代理和远程代理。它们各自解决什么问题？动态代理和静态代理有什么区别？`,answer:`答案：代理模式为另一个对象提供一个替身以控制对该对象的访问。三种常见变体——虚拟代理（延迟加载开销大的对象）、保护代理（控制访问权限）、远程代理（屏蔽远程通信细节）。Java 中的动态代理（JDK Proxy、CGLIB）是实现代理模式的常用技术。

解析：虚拟代理（Virtual Proxy）——1）场景：加载图片、大文件、Hibernate 懒加载。2）原理：代理对象先创建（消耗小），真正需要时再创建真实对象。3）例子：图片查看器中，先显示占位图，代理在后台线程加载高清图，加载完成后替换。保护代理（Protection Proxy）——1）场景：权限控制、访问限制。2）原理：代理在调用真实对象前检查权限，符合条件才放行。3）与装饰器的区别：保护代理控制访问（可以拒绝），装饰器只增强功能（不拒绝）。远程代理（Remote Proxy）——1）场景：RPC 调用（gRPC、Dubbo）、WebService。2）原理：客户端调用本地代理的方法，代理将调用序列化为网络请求，远程服务端反序列化执行并返回结果。3）隐藏了网络通信、序列化/反序列化、异常处理等细节。

扩展延伸：静态代理 vs 动态代理——1）静态代理：手动编写代理类，每个被代理类都需要一个代理类（类爆炸）。2）JDK 动态代理：基于接口，通过 Proxy.newProxyInstance() 在运行时生成代理类，通过 InvocationHandler 统一处理所有方法调用（适合面向接口编程）。3）CGLIB 动态代理：基于继承，通过 Enhancer 在运行时生成被代理类的子类作为代理（不需接口，通过 ASM 字节码技术）。Spring AOP 的选择规则——有接口时用 JDK 动态代理，没有接口时用 CGLIB（可强制使用 CGLIB）。代理的缺陷——调用方法走代理链路有性能开销；CGLIB 代理的 final 方法无法被拦截（final 方法不能被覆盖）。`,hints:[`虚拟代理和惰性初始化（Lazy Initialization）的区别`,`JDK 动态代理和 CGLIB 的底层实现差异`],tags:[`设计模式`,`代理模式`,`动态代理`,`AOP`],content_hash:`7f42aec1e706`,id:1295},{category:`design_patterns`,difficulty:`medium`,type:`short_answer`,title:`享元模式：String 常量池与 Integer 缓存`,content:`请解释享元模式（Flyweight）的原理以及它在 Java 中的实践——String 常量池、Integer 缓存和线程池。享元模式如何通过对象共享减少内存占用？`,answer:`答案：享元模式通过共享相同状态的细粒度对象来减少内存使用。核心是区分内部状态（Intrinsic State——可共享、不变）和外部状态（Extrinsic State——随上下文变化、由调用方传入）。Java 标准库中的 String 常量池、Integer 缓存（-128 到 127）、线程池和连接池都是享元模式的经典应用。

解析：Flyweight 的结构——1）Flyweight（享元接口）：定义业务方法，接受外部状态作为参数。2）ConcreteFlyweight（具体享元）：存储内部状态，实现享元接口。3）FlyweightFactory（享元工厂）：维护享元池（通常是一个 ConcurrentHashMap），根据 key 返回已存在的享元对象，不存在则创建。Java 中的实现——1）String 常量池：String s1 = "hello"; String s2 = "hello"; s1 == s2 为 true。编译期字符串字面量被 intern 在常量池中。2）Integer 缓存：Integer a = 127; Integer b = 127; a == b 为 true（因 -128 到 127 范围内的 Integer 被缓存重用）。3）线程池：ThreadPoolExecutor 复用空闲线程，避免频繁创建销毁线程的开销。

扩展延伸：享元模式的适用条件——1）系统中有大量细粒度对象。2）这些对象的大部分状态可以外部化（存入共享池）。3）对象创建和销毁成本高。何时享元失效——1）如果对象的内部状态占大部分、外部状态很少，共享收益有限。2）如果共享对象需要频繁加锁，可能得不偿失。3）如果外部状态计算复杂，把外部状态传入享元的成本可能超过不共享。享元模式与单例的区别——单例：某个类只有一个实例（全局唯一）。享元：某个类的实例在特定条件下共享复用（可以有多个不同的实例，每个实例代表一组不同的内部状态）。两者的共同点是「复用对象减少创建」。`,hints:[`享元模式的内部状态和外部状态如何划分`,`Integer 缓存的范围为什么是 -128 到 127`],tags:[`设计模式`,`享元模式`,`Flyweight`,`JVM`,`缓存`],content_hash:`d788b78bc351`,id:1296},{category:`design_patterns`,difficulty:`hard`,type:`short_answer`,title:`中介者模式：MVC 控制器与消息代理`,content:`请解释中介者模式（Mediator）的原理。MVC 架构中的 Controller 和消息中间件（如 Kafka）如何体现中介者模式？中介者模式与观察者模式有何区别？`,answer:`答案：中介者模式通过引入一个中介对象来封装一组对象的交互，使对象间不再显式引用彼此，从而降低耦合度。中介者承担了「多对多」的交互到「一对多」的转化（Mediator ↔ 各 Colleague）。MVC 中的 Controller 是典型的中介者——它协调 View 和 Model 之间的交互。消息中间件（Kafka/RabbitMQ）是分布式系统中的中介者——生产者/消费者不直接通信，通过 Broker 中介。

解析：中介者模式的结构——1）Mediator（中介者接口）：定义通信方法。2）ConcreteMediator（具体中介者）：协调同事对象之间的交互。3）Colleague（同事接口）：每个同事只知道中介者，不知道其他同事。4）同事之间的所有通信都通过中介者转发。MVC 中的 Mediator——1）View 触发事件（用户点击按钮）→ Controller 接收 → 更新 Model → Model 变化通知 View 更新。2）Controller 就是 View 和 Model 之间的中介。如果不经过 Controller，View 需要直接知道 Model 的结构（紧耦合），或 Model 需要知道 View（也不合理）。消息中间件的 Mediator——1）生产者（Producer）将消息发送到 Broker（Topic/Exchange），不关心哪些消费者会消费。2）消费者（Consumer）从 Broker 订阅消息，不关心消息从哪个生产者来。3）Broker 就是中介者，解耦了生产者和消费者。

扩展延伸：观察者模式 vs 中介者模式——1）观察者模式：一对多通信，被观察者直接通知观察者（Subject ↔ Observer）。2）中介者模式：多对多通信，各同事之间通过中介者间接通信，不直接依赖。3）区别：观察者模式建立了 Subject 到 Observer 的直接通知关系；中介者模式切断了同事之间的直接依赖，「引入了中介者来承接交互责任」。4）两者经常一起使用——中介者内部可以用观察者模式实现事件分发。什么时候用中介者——1）当对象间的交互关系复杂且耦合度高时。2）当交互逻辑经常变化，集中在中介者中修改比分散修改各对象更可控。过度使用的问题——中介者可能变成上帝对象（God Object），承载了过多的交互逻辑导致臃肿、难以维护，称为「中介者膨胀（Mediator Bloat）」。`,hints:[`MVC 中的 Controller 充当什么模式角色`,`中介者模式如何避免上帝对象（God Object）问题`],tags:[`设计模式`,`中介者`,`MVC`,`消息队列`,`Mediator`],content_hash:`f564c473feee`,id:1297},{category:`design_patterns`,difficulty:`hard`,type:`short_answer`,title:`访问者模式（Visitor Pattern）`,content:`请解释访问者模式（Visitor Pattern）的核心概念。它适用于哪些场景（如编译器 AST 遍历、税计算引擎）？访问者模式如何实现在不修改已有类的情况下增加新操作？它的优缺点是什么？`,answer:`答案：访问者模式将数据结构和对数据的操作分离，允许在不修改已有类的情况下增加新的操作。核心是定义 Visitor 接口（声明各种元素类型的访问方法），ConcreteVisitor 实现具体操作，Element 接口声明 accept(Visitor) 方法。

解析：经典结构——1）Visitor（访问者接口）：为每个具体的元素类声明一个 visit 方法（如 visitConcreteElementA()、visitConcreteElementB()）。2）ConcreteVisitor（具体访问者）：实现每个 visit 方法，定义对元素的具体操作。3）Element（元素接口）：声明 accept(Visitor visitor) 方法。4）ConcreteElement（具体元素）：实现 accept 方法——调用 visitor.visit(this)，将自身传递给访问者。5）ObjectStructure（对象结构）：持有元素的集合（如 List），遍历所有元素调用 accept。双分派（Double Dispatch）——访问者模式的核心机制：accept 调用由元素类型决定（第一次分派），visit 调用由访问者类型决定（第二次分派）。

扩展延伸：应用场景——1）编译器 AST 遍历：编译器将源代码解析为 AST（抽象语法树，由不同节点类型组成——IfStatement、WhileStatement、VariableDeclaration 等）。每种节点类型的处理逻辑（代码生成、类型检查、优化）可以封装在不同的 Visitor 中。新增一种编译器优化——只需要新增一个 Visitor，不需要修改所有 AST 节点类。2）税计算引擎：不同国家/地区、不同商品类型的税率计算逻辑不同。TaxCalculatorVisitor 访问商品对象，根据商品类型和国家计算税额。新增国家税制时只需新增 Visitor。3）文件系统操作：ArchiveVisitor（压缩文件）、PrintVisitor（打印文件树）、SearchVisitor（搜索文件），每种操作作为一个 Visitor，不需要修改 File/Directory 类。缺点——1）新增元素类需要修改所有 Visitor 接口（修改 Visitor 接口的 visit 方法），违反开闭原则。2）违反依赖倒置原则：Visitor 依赖于具体元素类而非抽象。3）Visitor 需要能访问元素的内部状态（可能破坏封装）。`,hints:[`为什么访问者模式需要双分派（Double Dispatch）——两次分派分别由什么决定`,`新增元素类型 vs 新增操作——访问者模式在哪一个方向上更容易扩展`],tags:[`设计模式`,`访问者`,`Visitor`,`双分派`,`AST`],content_hash:`297eab181067`,id:1298},{category:`design_patterns`,difficulty:`medium`,type:`short_answer`,title:`桥接模式（Bridge Pattern）`,content:`请解释桥接模式（Bridge Pattern）的核心概念。桥接模式如何将抽象和实现解耦？JDBC 驱动和 SLF4J 日志框架中桥接模式是如何应用的？`,answer:`答案：桥接模式将抽象部分和实现部分分离，使两者可以独立变化。核心思想是「用组合代替继承」，通过抽象持有实现的引用来桥接两者。

解析：经典结构——1）Abstraction（抽象类）：定义抽象接口，持有 Implementor 的引用。2）RefinedAbstraction（扩展抽象类）：扩展 Abstraction 定义的功能。3）Implementor（实现接口）：定义实现类的接口，通常比 Abstraction 更细粒度。4）ConcreteImplementor（具体实现类）：实现 Implementor 接口，提供具体实现。JDBC 中的桥接模式——1）DriverManager 是 Abstraction，提供 getConnection() 统一的接口。2）Driver 是 Implementor 接口（java.sql.Driver），定义 connect() 方法。3）不同数据库厂商提供具体实现（MySQL Driver、PostgreSQL Driver、Oracle Driver）。4）客户端通过 DriverManager.getConnection() 获取连接，无需知道底层是哪个数据库。新增数据库类型时只需实现 Driver 接口注册到 DriverManager。

扩展延伸：SLF4J 中的桥接模式——1）SLF4J（Simple Logging Facade for Java）是 Abstraction，提供统一的日志接口（Logger、LoggerFactory）。2）不同的日志框架是 Implementor（Logback、Log4j、java.util.logging）。3）SLF4J 使用桥接模块（如 slf4j-log4j12、log4j-slf4j-impl）桥接到具体的日志实现。4）应用程序只需面向 SLF4J 编程，切换日志框架时不需要修改代码。桥接模式与适配器模式的区别——1）桥接模式在设计阶段使用，目的是让抽象和实现独立演化。2）适配器模式在后期使用，目的是让不兼容的接口协同工作（事后补救）。桥接模式的优点——1）分离抽象和实现，各自独立扩展。2）符合开闭原则（新增抽象或实现不需要修改另一侧）。3）组合替代继承，避免类爆炸（如果没有桥接模式，N 种抽象 × M 种实现 = N×M 个类）。`,hints:[`JDBC Driver 接口为什么是桥接模式的典型应用——数据库厂商各自实现 Driver 接口`,`桥接模式和适配器模式的核心区别——设计阶段 vs 补救阶段`],tags:[`设计模式`,`桥接`,`Bridge`,`JDBC`,`解耦`],content_hash:`86565de051d4`,id:1299},{category:`design_patterns`,difficulty:`medium`,type:`short_answer`,title:`组合模式（Composite Pattern）`,content:`请解释组合模式（Composite Pattern）的核心概念。它如何让客户端一致地处理单个对象和组合对象？在 UI 组件树和文件系统中组合模式是如何应用的？`,answer:`答案：组合模式将对象组合成树形结构以表示「部分-整体」的层次结构，让客户端用一致的方式处理单个对象和组合对象。核心是定义统一的 Component 接口，Leaf（叶子节点）和 Composite（组合节点）都实现该接口。

解析：经典结构——1）Component（组件接口）：声明所有子类共有的操作（如 display()、getName()）。可以定义 add()、remove()、getChild() 等管理子组件的方法。2）Leaf（叶子节点）：没有子节点的具体组件，实现 Component 接口的业务方法（如 File 的 display() 显示文件大小和名称）。3）Composite（组合节点）：有子节点的具体组件，维护子组件列表（List），实现业务方法时递归调用子组件的方法（如 Folder 的 display() 先显示自身，再遍历子组件调用 display()）。4）客户端（Client）：通过 Component 接口操作对象，不需要区分是 Leaf 还是 Composite。

扩展延伸：应用场景——1）UI 组件树（Java AWT/Swing、React/Vue 的虚拟 DOM）：Window 包含 Panel，Panel 包含 Button 和 TextField。调用 repaint() 时，窗口递归重绘所有子组件。React 的组件树也是组合模式——父组件渲染子组件，客户端不需要区分是原生 DOM 节点还是自定义组件。2）文件系统：File（叶子节点，具体文件）和 Directory（组合节点，文件夹）。计算文件夹大小时递归遍历所有子文件和子文件夹。删除文件夹时递归删除所有内容。3）组织结构：Employee（叶子，普通员工）和 Department（组合，部门），计算部门总工资时递归统计所有员工。4）XML/JSON 解析：Element（组合，包含子元素）和 TextNode（叶子，纯文本）。遍历时一致处理。安全组合 vs 透明组合——1）透明组合：Component 接口声明了 add/remove/getChild 等管理方法，Leaf 类也需要实现但抛出 UnsupportedOperationException。优点：客户端一致对待。2）安全组合：Component 接口不声明管理方法，Composite 单独提供。优点：Leaf 类不需要处理无用方法。缺点：客户端需要 instanceof 判断。`,hints:[`安全组合和透明组合的区别——客户端是否需要 instanceof 判断`,`React 组件树为什么也属于组合模式——父组件递归渲染子组件`],tags:[`设计模式`,`组合`,`Composite`,`树结构`,`UI组件`],content_hash:`4066a58b8554`,id:1300},{category:`design_patterns`,difficulty:`hard`,type:`short_answer`,title:`外观模式（Facade Pattern）`,content:`请解释外观模式（Facade Pattern）的核心概念。外观模式如何为复杂子系统提供统一的简化接口？Spring Data JPA 和 SLF4J 中外观模式是如何应用的？`,answer:`答案：外观模式为子系统中的一组接口提供一个统一的高层接口，使子系统更易使用。核心思想是「封装复杂性，提供简化视图」——客户端只需要与外观对象交互，不需要了解子系统的内部细节。

解析：经典结构——1）Facade（外观类）：提供简化的方法，内部将请求委托给子系统的各个组件处理。外观类知道哪些子系统类负责哪些请求。2）Subsystem Classes（子系统类）：实现子系统的功能，处理 Facade 委托的任务。子系统类不知道 Facade 的存在（不持有 Facade 的引用）。3）Client（客户端）：只与 Facade 交互，不再直接调用子系统类。Spring Data JPA 中的外观模式——1）客户端只需定义 Repository 接口（如 UserRepository extends JpaRepository<User, Long>）。2）Spring Data JPA 的底层处理由多个子系统协作完成：EntityManager（ORM 核心）、JPQL Query 生成器、事务管理器、数据源连接池、代理生成器（JDK 动态代理/CGLIB）。3）客户端通过 Repository 接口调用 save()、findAll() 等方法时，外观层封装了 EntityManager 的 persist()、JPQL 生成、事务开启/提交、异常转换等复杂流程。

扩展延伸：SLF4J 的外观模式——1）SLF4J 提供统一日志接口（Logger.info()、Logger.error()），封装了日志框架初始化和桥接等细节。2）客户端调用 logger.info('msg') 时，外观层处理：消息格式化、调用底层日志框架（Logback/Log4j）、处理日志级别过滤、输出到配置的 Appender。3）如果哪天需要切换日志框架，只需改依赖，代码不需要修改。外观模式的优点——1）降低客户端使用复杂度（一个方法代替一系列调用）。2）实现客户端与子系统的松耦合（客户端只依赖 Facade）。3）提供了子系统使用的入口点，有助于分层架构中的层次划分。外观模式 vs 中介者模式——1）外观模式：单向关系（客户端 → Facade → 子系统），Facade 封装复杂度。2）中介者模式：多向关系（同事对象之间通过 Mediator 通信），Mediator 协调交互。外观模式的注意事项——1）外观不应该成为上帝类（God Class），不要把子系统的所有功能都通过外观暴露，应该只提供客户端需要的方法。2）客户端仍然可以绕过 Facade 直接访问子系统（门面模式不限制直接访问，这与适配器模式不同）。`,hints:[`外观模式和中介者模式的核心区别——单向封装 vs 多向协调`,`SLF4J 如何通过外观模式实现日志框架的可切换性`],tags:[`设计模式`,`外观`,`Facade`,`SLF4J`,`封装`],content_hash:`ca4e149b6d93`,id:1301},{category:`design_patterns`,difficulty:`hard`,type:`short_answer`,title:`DAO 与 Repository 模式辨析`,content:`DAO（Data Access Object）和 Repository 模式有什么区别？两者都是数据访问抽象，但它们的设计意图和使用场景有何不同？DDD 中的 Repository 和传统 DAO 有什么本质区别？`,answer:`答案：DAO（Data Access Object）是数据持久化的底层抽象，负责封装对数据源的访问（CRUD 操作），使业务层不需要知道底层存储的具体实现。Repository 是领域驱动设计（DDD）中的概念，在集合的语义上操作领域对象，是领域层的一部分。两者的核心区别在于抽象层次和设计意图——DAO 面向数据表（Table），Repository 面向领域集合（Collection）。

解析：DAO 模式——1）每个 DAO 对应一个数据表（如 UserDAO → user 表），提供 insert、update、delete、findById 等方法。2）DAO 是纯粹的数据访问层技术，不知道业务逻辑的存在。3）DAO 返回的数据通常是数据传输对象（DTO）或数据实体，不包含业务行为。4）典型实现：MyBatis 的 Mapper、Spring JDBC Template 封装的 DAO 类。Repository 模式——1）Repository 是领域对象的集合，提供像集合一样的操作接口（add、remove、get），客户端不关心底层是数据库、内存还是外部 API。2）Repository 是领域层的组成部分，可以包含业务规则（如 findAvailableRooms() 包含可用房间的业务判断逻辑）。3）Repository 返回的是领域对象（Aggregate Root），包含业务行为。4）Repository 的接口定义在领域层，实现放在基础设施层（依赖倒置）。

扩展延伸：何时使用哪种模式——1）简单 CRUD 应用、表结构驱动的开发：使用 DAO（如 MyBatis Mapper）。2）复杂业务逻辑、DDD 项目：使用 Repository。3）Repository 的实现内部可以包含 DAO——Repository 是更高层的抽象，调用 DAO 来完成实际的数据库操作。4）Spring Data JPA 中 @Repository 注解的接口实际上是 Repository 模式（通过 JPA EntityManager 实现），但很多人把它当作 DAO 使用。5）测试角度：Repository 更容易 Mock（领域层定义接口，测试时用 Mock 实现），DAO 的 Mock 仍然暴露了数据访问的实现细节。实用建议：在中小型项目中直接使用 DAO 或 Spring Data JPA Repository 就足够了。只有在业务逻辑复杂、需要领域模型驱动设计时才需要引入 DDD 风格的 Repository。`,hints:[`DAO 面向数据表（Table），Repository 面向领域集合（Collection）——抽象层次不同`,`为什么 Repository 的接口定义在领域层，实现在基础设施层——依赖倒置原则`],tags:[`设计模式`,`DAO`,`Repository`,`DDD`,`数据访问`],content_hash:`a7c77e99f2a9`,id:1302},{category:`design_patterns`,difficulty:`hard`,type:`short_answer`,title:`观察者模式与发布订阅`,content:`请介绍观察者模式（Observer）和发布订阅模式（Pub/Sub）的区别。两者在实现消息通知和解耦方面有什么不同？Java 的 Observable 和 Spring 的 ApplicationEvent 如何使用？`,answer:`答案：观察者和发布订阅都用于实现事件驱动的松耦合通信，但 Pub/Sub 更彻底。

观察者模式：
- 主题（Subject）维护观察者列表，状态变化时直接通知所有观察者
- 主题知道有哪些观察者（有引用关系）
- 同步通信：主题直接调用观察者的 update() 方法
- 耦合：主题和观察者之间有直接引用（虽然是通过接口）
- 适用于：同一进程内的通知（Java awt/Swing 事件、JavaFX 属性绑定）

发布订阅模式（Pub/Sub）：
- 发布者和订阅者之间通过事件总线/消息代理通信
- 发布者和订阅者不知道对方的存在（完全解耦）
- 异步通信：事件通过消息队列传递
- 可以跨进程、跨网络通信
- 适用于：微服务消息（Kafka/RabbitMQ）、EventBus（Guava）、领域事件

Java 的 Observer/Observable（JDK 9 已弃用）：
class WeatherData extends Observable {
    void setMeasurements(float temp) {
        setChanged();  // 标记状态已变化
        notifyObservers(temp);  // 通知所有观察者
    }
}

class Display implements Observer {
    public void update(Observable o, Object arg) {
        // 收到通知后处理
    }
}

Spring ApplicationEvent（观察者模式实现）：
// 事件类
class OrderCreatedEvent extends ApplicationEvent {
    Long orderId;
}

// 发布事件
applicationEventPublisher.publishEvent(new OrderCreatedEvent(orderId));

// 监听事件（@EventListener 注解）
@Component
class OrderNotificationListener {
    @EventListener
    public void handleOrderCreated(OrderCreatedEvent event) {
        // 异步处理（需要 @Async 注解或 @EnableAsync）
    }
}

观察者 vs Pub/Sub 对比：
- 耦合度：观察者（直接引用）> Pub/Sub（完全解耦）
- 通信方式：观察者（同步）> Pub/Sub（异步，可通过 MQ 或 EventBus）
- 错误隔离：观察者（观察者异常影响主题）> Pub/Sub（事件总线隔离）
- 适用场景：观察者适合单进程内事件，Pub/Sub 适合分布式事件

扩展延伸：响应式编程（RxJava / Reactor）——观察者模式的增强版（背压 + 操作符 + 异步）。Spring Cloud Stream——基于 Pub/Sub 的微服务消息驱动框架。Guava EventBus——Google 的进程内 Pub/Sub 实现。`,hints:[`观察者 = Subject→Observer 直接通知（有引用，同步，单进程内）`,`Pub/Sub = 发布者↔EventBus/消息队列↔订阅者（完全解耦，异步，跨进程）`],tags:[`设计模式`,`观察者`,`Pub/Sub`,`事件驱动`],content_hash:`dcb52a6495d7`,id:1303},{category:`design_patterns`,difficulty:`easy`,type:`short_answer`,title:`工厂模式家族`,content:`请介绍简单工厂、工厂方法（Factory Method）和抽象工厂（Abstract Factory）三种模式的区别。什么时候使用工厂方法而不是抽象工厂？`,answer:`答案：三种工厂模式逐步提升抽象层次。

简单工厂（Simple Factory）：
- 一个工厂类，一个静态方法，根据参数创建不同的产品
- 不是 GoF 的正式模式，但最常用
- 示例：DocumentFactory.createDocument("PDF") → PDFDocument / WordDocument
- 缺点：添加新产品需要修改工厂类（违反开闭原则）

工厂方法（Factory Method）：
- 定义一个创建对象的接口，让子类决定实例化哪个类
- Creator（抽象的工厂类）→ ConcreteCreator（具体的工厂子类）→ Product（产品）
- 每个产品对应一个工厂（每个工厂只创建一种产品）
- 添加新产品只需要增加新的工厂子类（符合开闭原则）
- 示例：
  interface DocumentFactory { Document create(); }
  class PDFFactory implements DocumentFactory { public Document create() { return new PDFDocument(); } }
  class WordFactory implements DocumentFactory { public Document create() { return new WordDocument(); } }

抽象工厂（Abstract Factory）：
- 创建一组相关的产品（产品族），不需指定具体类
- 一个工厂可以创建多种产品（同一产品族的所有产品）
- 示例（GUI 跨平台）：
  interface GUIFactory { Button createButton(); TextField createTextField(); }
  class WinFactory implements GUIFactory { Button createButton() { return new WinButton(); } TextField createTextField() { return new WinTextField(); } }
  class MacFactory implements GUIFactory { Button createButton() { return new MacButton(); } TextField createTextField() { return new MacTextField(); } }

工厂方法 vs 抽象工厂：
- 工厂方法：一个工厂创建一种产品（继承层次）
- 抽象工厂：一个工厂创建一整套产品（产品族）
- 工厂方法使用继承（子类重写工厂方法）
- 抽象工厂使用组合（通过参数选择工厂实现）
- 选择：如果需要创建的产品总是成组出现（如不同主题的 UI 控件），用抽象工厂
  如果需要灵活扩展产品类型，用工厂方法

扩展延伸：Spring 的 BeanFactory——IoC 容器的工厂模式实现。建造者模式（Builder）——工厂模式创建对象后，Builder 模式进一步设置对象的复杂属性。依赖注入（DI）——工厂模式的进化版（不用自己写工厂，由 IoC 容器负责）。`,hints:[`简单工厂（一个类，根据参数创建不同产品）→ 工厂方法（每种产品一个工厂子类）→ 抽象工厂（创建一整套产品族）`,`工厂方法适合单产品扩展，抽象工厂适合产品族（同一主题的成套产品）`],tags:[`设计模式`,`工厂`,`抽象工厂`,`创建型`],content_hash:`1518fd520303`,id:1304},{category:`design_patterns`,difficulty:`hard`,type:`short_answer`,title:`单例模式的多种实现方式`,content:`请介绍单例模式（Singleton）的多种实现方式及其优缺点。`,answer:`答案：单例模式确保一个类只有一个实例并提供全局访问点。

饿汉式（Eager Initialization）：

实现：
\`\`\`java
public class Singleton {
    private static final Singleton INSTANCE = new Singleton();
    private Singleton() {}
    public static Singleton getInstance() { return INSTANCE; }
}
\`\`\`
优点：简单、线程安全
缺点：类加载时就创建，可能造成资源浪费

懒汉式（Lazy Initialization）：

实现：
\`\`\`java
public class Singleton {
    private static Singleton instance;
    private Singleton() {}
    public static synchronized Singleton getInstance() {
        if (instance == null) instance = new Singleton();
        return instance;
    }
}
\`\`\`
优点：延迟创建
缺点：synchronized 方法造成性能开销

双重检查锁定（Double-Checked Locking）：

实现：
\`\`\`java
public class Singleton {
    private static volatile Singleton instance;
    private Singleton() {}
    public static Singleton getInstance() {
        if (instance == null) {
            synchronized (Singleton.class) {
                if (instance == null) instance = new Singleton();
            }
        }
        return instance;
    }
}
\`\`\`
关键：volatile 禁止指令重排序（new 对象不是原子操作）

静态内部类（Bill Pugh）：

\`\`\`java
public class Singleton {
    private Singleton() {}
    private static class Holder {
        static final Singleton INSTANCE = new Singleton();
    }
    public static Singleton getInstance() { return Holder.INSTANCE; }
}
\`\`\`
优点：延迟加载（Holder 类在 getInstance 时才加载）、线程安全

枚举实现：

\`\`\`java
public enum Singleton {
    INSTANCE;
    // 添加方法
}
\`\`\`
最安全的方式：防止反射攻击、序列化安全、天然单例

对比：
| 方式 | 延迟加载 | 线程安全 | 防反射 | 序列化安全 |
|------|----------|----------|--------|------------|
| 饿汉式 | 否 | 是 | 否 | 否 |
| 懒汉式 | 是 | 是（锁）| 否 | 否 |
| DCL | 是 | 是（volatile）| 否 | 否 |
| 静态内部类 | 是 | 是 | 否 | 否 |
| 枚举 | 否 | 是 | 是 | 是 |

扩展延伸：现代框架中单例模式被依赖注入容器（Spring IoC）管理，无需手动实现单例。Spring 默认 Bean 的作用域就是 singleton。框架层面的单例管理更灵活（可以随时切换为 prototype 作用域）。`,hints:[`五种实现：饿汉式（简单但无延迟）、懒汉式（有延迟但需同步）、DCL（volatile 防重排）`,`最推荐：静态内部类（延迟+线程安全）和枚举（防反射+序列化安全）`,`框架层面：Spring IoC 默认单例，比手动单例更灵活`],tags:[`设计模式`,`单例模式`,`Java`,`多线程`],content_hash:`5ff3116b19be`,id:1305},{category:`design_patterns`,difficulty:`hard`,type:`short_answer`,title:`代理模式与装饰器模式`,content:`请介绍代理模式（Proxy）和装饰器模式（Decorator）的区别及其应用场景。`,answer:`答案：代理模式和装饰器模式结构相似（都包装了目标对象），但目的不同。

代理模式（Proxy）：

意图：控制对目标对象的访问。

结构：
- Subject（抽象接口）：定义代理和真实对象的共同接口
- RealSubject（真实对象）：实际执行业务的对象
- Proxy（代理）：持有 RealSubject 引用，控制对其的访问

\`\`\`java
interface Image {
    void display();
}
class RealImage implements Image {
    private String filename;
    public RealImage(String filename) {
        this.filename = filename;
        loadFromDisk();  // 昂贵的操作
    }
    public void display() { /* 显示图片 */ }
}
class ImageProxy implements Image {
    private RealImage realImage;
    private String filename;
    public ImageProxy(String filename) { this.filename = filename; }
    public void display() {
        if (realImage == null) realImage = new RealImage(filename);
        realImage.display();
    }
}
\`\`\`

常见类型：
1. 虚拟代理（Virtual Proxy）：延迟加载（图片懒加载）
2. 保护代理（Protection Proxy）：权限控制
3. 远程代理（Remote Proxy）：RPC/RMI
4. 智能引用代理（Smart Reference）：引用计数、日志

装饰器模式（Decorator）：

意图：动态为对象添加功能，而不影响其他对象。

结构：
- Component（组件接口）：定义对象的接口
- ConcreteComponent（具体组件）：基础对象
- Decorator（装饰器）：持有一个 Component 引用，实现相同接口
- ConcreteDecorator（具体装饰器）：添加具体功能

\`\`\`java
interface Coffee {
    double cost();
    String description();
}
class SimpleCoffee implements Coffee {
    public double cost() { return 10; }
    public String description() { return "咖啡"; }
}
abstract class CoffeeDecorator implements Coffee {
    protected Coffee coffee;
    public CoffeeDecorator(Coffee coffee) { this.coffee = coffee; }
}
class MilkDecorator extends CoffeeDecorator {
    public double cost() { return coffee.cost() + 3; }
    public String description() { return coffee.description() + " + 牛奶"; }
}
\`\`\`

核心区别：
| 维度 | 代理模式 | 装饰器模式 |
|------|----------|------------|
| 目的 | 控制访问（限制、增强、延迟） | 添加功能（扩展行为） |
| 创建时机 | 代理在编译时确定 | 装饰器在运行时动态组合 |
| 关系 | 代理和真实对象的关系固定 | 装饰器可以多层嵌套 |
| 客户端感知 | 客户端不知道代理的存在 | 客户端知道（需要传入被装饰对象） |

扩展延伸：Spring AOP 的 JDK 动态代理和 CGLIB 代理是代理模式的经典应用。Java I/O 流是装饰器模式的经典应用（BufferedInputStream -> FileInputStream 的多层嵌套）。实际工程中代理模式负责横切关注点（日志、事务、安全），装饰器负责纵向功能扩展（缓存、校验、格式化）。`,hints:[`代理模式：控制访问——延迟加载、权限控制、远程代理（编译时确定，客户端无感知）`,`装饰器模式：动态扩展功能——多层嵌套组合（运行时组合，客户端知道在装饰）`,`经典应用：代理=Spring AOP，装饰器=Java I/O 流（BufferedInputStream 包装 FileInputStream）`],tags:[`设计模式`,`代理模式`,`装饰器模式`,`结构型`],content_hash:`ed9bab71ae06`,id:1306},{category:`design_patterns`,difficulty:`hard`,type:`short_answer`,title:`组合模式的透明性与安全性的取舍`,content:`组合模式（Composite Pattern）有两种常见的设计变体——透明组合（Transparent Composite）和安全组合（Safe Composite）。请解释它们的区别、各自的优缺点和适用场景。在 Java AWT/Swing、React 组件树、文件系统 API 等实际框架中分别采用了哪种变体？`,answer:`答案：透明组合在抽象 Component 接口中声明所有管理子组件的方法（add、remove、getChild），叶子节点也必须继承这些方法（通常抛出 UnsupportedOperationException）。安全组合只在 Composite 类中声明管理子组件的方法，Component 接口只包含业务方法。透明组合追求「客户端统一对待」，安全组合追求「接口隔离和编译时安全」。

解析：透明组合（Transparent Composite）——Component 接口包含所有方法：业务方法（如 display()）和管理方法（add()、remove()、getChild()）。Leaf 类实现管理方法时抛出 UnsupportedOperationException 或空操作。

优点：1）客户端完全不需要区分 Leaf 和 Composite，所有操作通过 Component 接口完成。2）新增节点类型不需要修改客户端代码。3）非常适合递归遍历场景（如遍历 UI 组件树统一调用 repaint()）。

缺点：1）Leaf 被迫实现它不需要的方法，违反接口隔离原则（ISP）。2）客户端在编译时无法捕获对 Leaf 调用 add() 的错误（运行时才抛出异常）。3）Component 接口承担了过多职责。

安全组合（Safe Composite）——Component 接口只声明业务方法（如 display()、getName()）。add()、remove()、getChild() 只在 Composite 类中定义。Leaf 类没有管理子节点的方法，对 Leaf 调用 add() 会在编译时报错。

优点：1）符合接口隔离原则，Leaf 只包含它需要的方法。2）类型安全——错误在编译时即可发现。3）接口职责清晰。

缺点：1）客户端需要使用 instanceof 或类型转换来区分 Leaf 和 Composite 才能调用管理方法，破坏了组合模式「统一对待」的核心价值。2）遍历操作变得更繁琐（需要 if-else 分支处理不同类型）。

实际框架的选择——

1）Java AWT/Swing：采用透明组合。java.awt.Component 类直接定义了 add() 和 remove() 方法。Button（叶子）可以调用 add()，虽然实际上没有效果。这使得容器（Container）和组件可以统一操作。

2）React/Vue 组件树：更接近安全组合。React 中函数组件和类组件不共享相同的子节点管理 API。父组件通过 children prop 访问子节点，子组件自身没有 addChild 方法。这种设计在编译时就区分了容器组件和展示组件。

3）java.nio.file.FileVisitor：采用安全组合。Files.walkFileTree() 的 FileVisitor 接口为文件和目录提供了不同的回调方法：visitFile() 处理普通文件，preVisitDirectory() 和 postVisitDirectory() 处理目录，调用者自己根据上下文区分类型。

4）XML/JSON DOM 解析器：通常采用透明组合。Node 接口统一了 Element（有子节点）和 TextNode（叶子节点），appendChild() 等方法在 TextNode 上抛出 DOMException。

扩展延伸：

折中方案——在工程实践中，常采用以下折中：1）Component 接口包含最常用的稳定方法（如 getParent()），不常用的管理方法放在 Composite 中。2）使用 Visitor 模式来避免客户端 instanceof 判断，由 Visitor 双分派机制自动区分节点类型。3）在 Component 接口中提供默认实现（Java 8 的 default 方法）——leaf.add(child) 默认抛出异常，composite 重写此方法。

选择决策树——如果系统的核心操作是遍历树并对所有节点执行统一操作（如 UI 渲染），选择透明组合。如果核心操作是安全地构建和修改树结构（如 IDE 的项目文件浏览器），选择安全组合。如果是框架/类库设计（不确定下游如何使用），优先考虑透明组合加默认实现。`,hints:[`透明组合的「统一对待」vs 安全组合的「编译时安全」——这是接口设计中的经典取舍`,`Java AWT 的 Component.add() 方法为什么在 Button 上可用但不做任何事——透明组合的设计代价`],tags:[`设计模式`,`组合模式`,`Composite`,`结构型`,`接口设计`],content_hash:`707e646db888`,id:1307},{category:`design_patterns`,difficulty:`hard`,type:`short_answer`,title:`访问者模式的双分派机制`,content:`访问者模式（Visitor Pattern）的核心机制是双分派（Double Dispatch）。请解释什么是单分派和双分派，Java 为什么需要访问者模式来模拟双分派，accept/visit 的双层调用是如何实现双分派的，以及双分派解决了什么设计问题。`,answer:`答案：双分派是访问者模式的核心机制——第一次分派由 element.accept(visitor) 根据 Element 的实际运行时类型决定调用哪个 accept 实现；第二次分派由 visitor.visit(this) 根据 Visitor 的实际类型和 this 的编译时类型决定调用哪个 visit 重载方法。双分派解决了「操作依赖于两个对象的具体类型」的问题——即方法的行为同时取决于 Element 的类型和 Visitor 的类型。

解析：单分派的局限——Java 是单分派语言：方法调用时，只有接收者（receiver）参与动态分派。例如 shape.draw() 调用哪个 draw() 只取决于 shape 的实际类型（Circle 或 Rectangle）。方法参数的重载选择是编译时根据参数的静态类型决定的——不是动态分派。因此，如果直接写 visitor.visit(shape)（其中 shape 是 Element 类型），即使 visitor 是 PDFExporter，也只会调用 visit(Element) 而不会调用 visit(Circle)——因为参数的静态类型是 Element。

访问者模式的双分派实现——分为两步：

第一次分派（Element.accept）：客户端调用 element.accept(visitor)。Java 的多态机制根据 element 的实际运行类型（Circle / Rectangle）动态分派到正确的 accept 方法。关键代码：Circle.accept(Visitor v) 被调用。

第二次分派（Visitor.visit）：在 accept 方法内部，元素调用 visitor.visit(this)。此时 this 的编译时类型是具体的 Element 子类型（在 Circle.accept 中 this 是 Circle 类型）。Java 的重载方法选择是在编译时根据参数的静态类型决定的——visit(Circle c) 被选中（不是 visit(Element e)）。同时 Visitor 的类型被动态分派——如果 visitor 是 PDFExporter，则 PDFExporter.visit(Circle c) 被执行。

代码模拟双分派的完整路径：
客户端 → element.accept(visitor) → [动态分派] → Circle.accept(visitor) → visitor.visit(this) → [visit 方法重载在编译时绑定到 visit(Circle)，动态分派到 PDFExporter.visit(Circle)]

如果没有访问者模式——要实现「用 PDFExporter 导出 Circle」和「用 JSONExporter 导出 Circle」的组合（2 种元素 × 2 种导出器 = 4 种行为），需要写 instanceof 判断：if (e instanceof Circle) { if (v instanceof PDFExporter) ... }。组合爆炸。

扩展延伸：

双分派解决的核心问题——「操作」和「数据结构」的双向扩展。在传统 OOP 中，新增一种 Element 子类是容易的（只需要修改相应的 visit 方法），但新增一种操作需要修改所有 Element——违反开闭原则。访问者模式的精巧之处在于它反转了这种依赖：新增一种操作（新增 Visitor 子类）不需要修改任何 Element 类。代价是新增一种 Element 子类需要修改所有 Visitor 接口。

其他语言中的多分派——1）C++ 通过 dynamic_cast 手动实现多分派，或使用 std::visit + std::variant 实现编译期多分派。2）C# 4.0+ 使用 dynamic 关键字实现动态分派。3）Common Lisp 的 CLOS 原生支持多分派（方法根据所有参数的类型分派）。4）Kotlin 的 when 表达式 + sealed class 提供了另一种解决思路。

Visitor 的设计代价——1）双向扩展的不对称：新增 Element 困难（需要修改所有 Visitor），新增 Visitor 容易。因此访问者模式适用于 Element 层次结构相对稳定、操作频繁变化的场景（如编译器 AST 遍历）。2）破坏封装：Visitor 需要访问 Element 的内部状态才能完成操作，这意味着 Element 需要暴露内部细节。3）循环依赖：Element 依赖 Visitor 接口，Visitor 依赖具体 Element 类，可能形成双向依赖。

实际应用——ANTLR 的 AST 遍历、ASM 字节码框架的 ClassVisitor/MethodVisitor、Spring 的 BeanDefinitionVisitor、Jackson 的 JsonSerializer/JsonDeserializer 体系。所有这些场景的共同特征：数据结构（AST 节点/字节码元素）相对固定，而操作（代码生成/类型检查/序列化方式）频繁新增和变动。`,hints:[`Java 的方法重载是编译时根据参数静态类型绑定的——v.visit(e) 不会根据 e 的实际类型动态分派，这是为什么需要 accept 做第一次分派的原因`,`双分派的本质就是两次单分派叠加——第一次用 accept 的动态分派确定 Element 类型，第二次用 visit 的重载+分派确定 Visitor 类型和 Element 具体类型的组合`],tags:[`设计模式`,`访问者模式`,`Visitor`,`双分派`,`行为型`],content_hash:`ed45e6e7dad6`,id:1308},{category:`design_patterns`,difficulty:`hard`,type:`short_answer`,title:`桥接模式在 JDBC 驱动中的应用`,content:`JDBC（Java Database Connectivity）是桥接模式（Bridge Pattern）的经典工程实现。请详细分析 JDBC 架构中 DriverManager、Driver、Connection、Statement、ResultSet 等核心组件如何体现桥接模式的角色映射，以及这种设计如何实现了「抽象与实现独立变化」。JDBC 的四种驱动类型（Type 1-4）在桥接模式中的实现差异是什么？`,answer:`答案：JDBC 架构是桥接模式在工业界的经典落地——DriverManager 和 JDBC 标准接口（Connection、Statement、ResultSet）构成抽象部分，各数据库厂商实现的 Driver 和对应的具体连接库构成实现部分。桥接模式使应用程序面向 JDBC 标准接口编程，底层数据库实现（MySQL/Oracle/PostgreSQL）可以独立切换和演进，抽象层次和实现层次通过 Driver 接口桥接。

解析：JDBC 中的桥接模式角色映射：

1）Abstraction（抽象部分）——DriverManager 类是桥接的抽象侧入口。它提供了统一的高层接口 getConnection(url, user, password)，内部维护已注册的 Driver 列表。DriverManager 不依赖具体数据库——它遍历所有已注册的 Driver，调用 driver.connect(url) 直到某个 Driver 成功返回 Connection。

2）RefinedAbstraction（扩展抽象）——Connection、Statement、ResultSet 等 JDBC 标准接口构成了抽象层次的扩展。Connection 负责会话管理（事务、元数据），Statement 负责 SQL 执行，ResultSet 负责结果集遍历。应用程序基于这些接口编写数据访问代码，不依赖任何数据库特有的 API。实际框架（如 MyBatis、Hibernate）进一步扩展了这些抽象，提供了连接池、ORM 映射等高级功能。

3）Implementor（实现接口）——java.sql.Driver 接口定义了实现侧的统一契约。核心方法：connect(String url, Properties info) 建立连接；acceptsURL(String url) 判断该 Driver 是否能处理该 URL；getMajorVersion() / getMinorVersion() 返回版本信息。每个数据库厂商必须实现这个接口。

4）ConcreteImplementor（具体实现）——各数据库厂商的驱动实现：com.mysql.cj.jdbc.Driver、org.postgresql.Driver、oracle.jdbc.OracleDriver 等。每个 Driver 实现类负责：解析 JDBC URL、建立 TCP 连接、完成数据库握手认证协议、返回 Connection 实现类的实例（如 JDBC4Connection 包装了 MySQL 协议实现）。

完整的桥接工作流程：1）驱动加载阶段：通过 Class.forName() 或 Java SPI（META-INF/services/java.sql.Driver）加载 Driver 实现类，每个 Driver 在静态初始化块中调用 DriverManager.registerDriver(this) 完成注册。2）连接建立阶段：应用程序调用 DriverManager.getConnection(url)。DriverManager 遍历已注册的 Driver 列表，调用每个 driver.acceptsURL(url) 筛选出能处理该 URL 的 Driver，然后调用 driver.connect(url, info) 建立连接。3）操作执行阶段：返回的 Connection 实际是 MySQLConnection 或 PostgreSQLConnection 等具体实现，但应用程序通过 JDBC 标准接口操作——createStatement() 返回具体 Statement，executeQuery() 返回具体 ResultSet。

扩展延伸：

JDBC 四种驱动类型与桥接模式——

Type 1（JDBC-ODBC Bridge）：过时的桥接实现。JDBC 接口桥接到 ODBC（C 语言 API），再通过 ODBC 驱动访问数据库。性能差、需要配置 ODBC 数据源、已不推荐使用。

Type 2（Native API Driver，部分 Java 实现）：桥接模式的适配器变体。Java 的 JDBC 接口通过 JNI 桥接到数据库厂商的原生 C/C++ 客户端库（如 Oracle OCI）。优点：性能较好。缺点：需要安装平台相关库。

Type 3（Network Protocol Driver，纯 Java 客户端 + 中间件）：三层桥接。客户端 JDBC 驱动通过纯 Java socket 连接到中间件服务器（如 Sequoia、Athena），中间件再将请求转发到数据库。优点：中间件可以做连接池、读写分离、结果集缓存。缺点：多一次网络跃迁，延迟增加。

Type 4（Pure Java Driver，纯 Java 直连）：最纯粹的桥接模式实现。纯 Java 实现，直接通过 TCP Socket 实现数据库通信协议（MySQL Protocol、PG Protocol）。优点：纯 Java、无依赖、性能最好。缺点：每个数据库有自己的协议实现。

桥接模式的收益在 JDBC 架构中的体现——1）数据库厂商可独立实现 Driver——Oracle 不需要知道 MySQL 的实现，只要遵守 Driver 接口契约即可。2）应用代码零改动切换数据库——只需要替换驱动 jar（Classpath）和修改连接 URL，业务代码不需要任何修改。3）JDBC 标准可独立演进——JDBC 3.0→4.0→4.2 增加了批量更新、ROWID、National Character Set 等新特性，各驱动厂商分别适配即可，应用层有计划地升级。4）Connection/Statement/ResultSet 三个抽象接口各自有独立的实现层次，细分了桥接模式中的实现职责——Connection 负责会话生命周期、Statement 负责 SQL 执行策略、ResultSet 负责结果集遍历。`,hints:[`JDBC 的桥接角色映射：DriverManager=Abstraction 入口、Driver=Implementor 接口、各厂商 Driver=ConcreteImplementor、Connection/Statement/ResultSet=RefinedAbstraction`,`Type 4 驱动（纯 Java 直连）是最纯粹的桥接模式实现——它不需要任何平台相关库，完全在 Java 层面桥接 JDBC 抽象和数据库协议`],tags:[`设计模式`,`桥接模式`,`JDBC`,`Bridge`,`结构型`],content_hash:`1693686cff58`,id:1309},{category:`design_patterns`,difficulty:`hard`,type:`short_answer`,title:`中介者模式 vs 观察者模式的事件分发对比`,content:`中介者模式（Mediator）和观察者模式（Observer）都用于对象间的通信和事件分发，但它们的通信拓扑结构、耦合程度和控制流程有本质差异。请对比这两种模式在事件分发机制上的核心区别，分析各自的优缺点，并说明在实际系统（如 MVC、消息队列、Redux）中它们各自的应用形式。`,answer:`答案：观察者模式采用「一对多」的直接通知拓扑——Subject 持有 Observer 引用列表，状态变化时直接遍历通知。中介者模式采用「多对多」的间接通信拓扑——Colleague 之间不直接通信，通过 Mediator 中转转发。核心区别：观察者模式建立了 Subject 到 Observer 的固定订阅关系，发布者知道自己在通知谁；中介者模式的 Colleague 之间互不知晓，所有通信经过 Mediator 协调和转发。

解析：通信拓扑的差异——观察者模式：星形拓扑变体。Subject 是中心，Observer 是外围节点。事件方向固定（Subject→Observer），不支持 Observer 向 Subject 主动通信（如果需要，则需要额外的机制）。中介者模式：完全的中心化拓扑。Mediator 作为唯一枢纽，所有 Colleague 之间的通信必须经过 Mediator。通信方向完全双向——Colleague A 可以通过 Mediator 向 Colleague B 发送消息，也可以从 Colleague B 接收消息。

耦合程度的差异——观察者模式：Subject 通过抽象 Observer 接口引用 Observer，两者之间存在编译期依赖。Subject 知道自己在通知哪些 Observer（虽然通过接口而非具体类）。Observer 注册和注销需要 Subject 的公共接口支持。中介者模式：Colleague 只依赖 Mediator 接口，不依赖其他 Colleague。Colleague 之间没有任何直接引用关系——完全解耦。但 Mediator 承担了所有的通信协调逻辑，Mediator 因此依赖所有 Colleague 接口（耦合从 Colleague 之间转移到了 Mediator 上）。

控制流程的差异——观察者模式：Subject 发布事件后同步（或通过事件总线异步）通知所有注册的 Observer。每个 Observer 收到完整事件数据，独立处理。Subject 不关心 Observer 的处理顺序和结果（fire-and-forget）。中介者模式：Mediator 收到消息后可以执行复杂的协调逻辑——决定消息的路由目标、转换消息格式、编排多个 Colleague 的执行顺序（如先验证→再存储→后通知）、条件判断是否传递消息。Mediator 是控制流的决策者。

可扩展性的差异——观察者模式：新增 Observer 只需注册到 Subject，Subject 不需要修改（符合开闭原则）。Observer 之间互相独立，新增一个不影响其他。中介者模式：新增 Colleague 可能需要修改 Mediator（如果通信规则涉及新 Colleague）。随着 Colleague 数量增多，Mediator 可能膨胀为 God Object。

扩展延伸：

实际系统中的应用对比——

1）MVC 架构中的 Controller（中介者模式）：Controller 协调 View 和 Model 的交互。View 触发事件→Controller 接收→更新 Model→Model 变化通过观察者机制通知 View 更新。Controller 是 Mediator，Model 和 View 之间的数据绑定（数据变化自动更新 UI）则是观察者模式。两者在这里是互补使用的。

2）消息队列 Kafka/RabbitMQ（中介者模式）：Broker 充当 Mediator，Producer 和 Consumer 完全不直接通信。Broker 负责消息的路由（Topic/Exchange）、持久化、负载均衡和故障转移。Producer 和 Consumer 都可以独立扩缩容。

3）Redux（中介者 + 观察者结合）：Store 是 Mediator——Component dispatch Action → Store 转发给 Reducer → 更新 State → Component 通过 subscribe 观察 State 变化。Store 协调了 Action 的分发和 State 的管理，Component 则通过观察者模式订阅所需的状态片段。

4）Spring ApplicationEvent（观察者模式）：@EventListener 注解的 Bean 作为 Observer，ApplicationEventPublisher 作为 Subject。发布者和监听者通过事件类型解耦，但本质是一对多通知。

5）GUI 对话框（中介者模式）：对话框中的 UI 组件（下拉框、输入框、按钮）不直接交互。选择省份→Mediator 协调→刷新城市下拉框→Mediator 协调→更新区县列表。每个组件只和 Mediator 通信，Mediator 集中管理组件间的协作逻辑。

性能与维护权衡——观察者模式：一对多通知的性能取决于 Observer 数量和单个处理时间。同步模式下慢速 Observer 可能阻塞整个通知链。事件总线（异步观察者）可以缓解此问题。中介者模式：Mediator 成为通信瓶颈和单点故障（SPOF）。Mediator 的逻辑复杂度随 Colleague 数量非线性增长——需要持续重构或拆分 Mediator 的职责。

选择原则——如果通信模式是「一个事件源→多个独立接收者」，选择观察者模式（更轻量）。如果通信需要双向交互、复杂编排或条件路由，选择中介者模式（控制力更强）。在大型系统中，两者通常共存：中介者负责编排流程，观察者负责状态同步通知。`,hints:[`观察者模式的通信是预先建立好的订阅关系（发布者知道自己通知谁），中介者模式的通信经过中心枢纽转发（通信双方互不知晓）`,`MVC 中的 Controller 是中介者（协调 View 和 Model），而 Model 变化通知 View 是观察者——这两种模式在 MVC 中是互补共存的`],tags:[`设计模式`,`中介者模式`,`观察者模式`,`Mediator`,`行为型`],content_hash:`36baa5f02ad9`,id:1310},{category:`design_patterns`,difficulty:`hard`,type:`short_answer`,title:`命令模式实现撤销重做`,content:`如何用命令模式（Command Pattern）实现一个支持撤销（Undo）和重做（Redo）的操作系统？请说明核心组件和工作流程。`,answer:"答案：命令模式的核心思想是将一个请求封装为一个对象，从而使你可以用不同的请求对客户端进行参数化。\\n组件：\\n1. Command 接口：定义 `execute()` 和 `undo()` 方法。\\n2. ConcreteCommand：实现具体的操作逻辑和对应的撤销逻辑。\\n3. Invoker：维护一个命令历史栈 `undoStack` 和一个重做栈 `redoStack`。\\n4. Receiver：实际执行操作的对象（如文本编辑器中的 Document）。\\n工作流程：\\n- 每次执行一个命令时，调用 `command.execute()`，然后将该命令压入 `undoStack`，同时清空 `redoStack`（因为新操作后重做历史无效）。\\n- 撤销时，从 `undoStack` 弹出顶部命令，调用 `command.undo()`，然后将该命令压入 `redoStack`。\\n- 重做时，从 `redoStack` 弹出顶部命令，调用 `command.execute()`，再压回 `undoStack`。\\n- 约束：`undoStack` 需要设置最大深度（如 100 步），防止内存溢出。\\n示例（伪代码）：\\n```\\nclass TextEditorCommand implements Command {\\n    execute() { insertText(text); }\\n    undo() { deleteText(length); }\\n}\\nInvoker {\\n    Stack undoStack, redoStack;\\n    void executeCommand(cmd) {\\n        cmd.execute();\\n        undoStack.push(cmd);\\n        redoStack.clear();\\n    }\\n    void undo() {\\n        cmd = undoStack.pop(); cmd.undo(); redoStack.push(cmd);\\n    }\\n    void redo() {\\n        cmd = redoStack.pop(); cmd.execute(); undoStack.push(cmd);\\n    }\\n}\\n```",hints:[`关键在于每个命令同时封装了「执行」和「撤销」两个操作`,`redo 栈在每次新操作时被清空——这是常见的设计决策`],tags:[`命令模式`,`撤销重做`,`行为型模式`],content_hash:`f085804f9ead`,id:1311},{category:`design_patterns`,difficulty:`medium`,type:`short_answer`,title:`原型模式与深浅拷贝`,content:`原型模式（Prototype Pattern）中，浅拷贝（Shallow Copy）和深拷贝（Deep Copy）的区别是什么？分别适用什么场景？Java 中如何实现？`,answer:"答案：原型模式通过复制一个已有对象来创建新对象，而非通过 new 调用构造器。核心是 Java 中的 `Cloneable` 接口和 `clone()` 方法。\\n浅拷贝：\\n- 复制基本类型字段的值和引用类型字段的引用地址。\\n- 复制后的对象和原对象共享引用类型字段指向的同一个实例。\\n- Java 默认的 `super.clone()` 就是浅拷贝。\\n- 适用于：对象只包含基本类型和不可变对象（如 String、Integer），或者你明确希望共享内部状态。\\n深拷贝：\\n- 递归复制所有引用类型字段指向的对象，创建完全独立的副本。\\n- 修改副本的内部状态不会影响原对象。\\n- 实现方式：a) 重写 `clone()` 方法，手动 clone 所有可变引用字段；b) 序列化 + 反序列化；c) 手动构造器（copy constructor）。\\n- 适用于：对象包含可变引用类型，且需要完全隔离的副本。\\n- 问题：深拷贝在对象图复杂时可能引发循环引用问题（A 引用 B，B 引用 A），此时需要手动处理。\\n注意：数组的 `clone()` 是浅拷贝——数组元素如果是引用类型，复制的是引用而非对象本身。\\n最佳实践：实现了 `Cloneable` 却不重写 `clone()` 为 public 是常见的错误。更推荐使用 copy constructor 或 factory method 替代 `Cloneable`。",hints:[`Java 的 Cloneable 是一个标记接口（marker interface），不重写 clone() 会抛 CloneNotSupportedException`,`深拷贝在性能敏感场景中可能成为瓶颈——考虑是否需要完全隔离`],tags:[`原型模式`,`深浅拷贝`,`创建型模式`],content_hash:`584528f61447`,id:1312},{category:`design_patterns`,difficulty:`hard`,type:`short_answer`,title:`策略模式在支付场景中的实战应用`,content:`一个支付系统需要支持微信支付、支付宝、银联三种支付方式，每种方式的支付流程、回调处理、退款逻辑都不同。请用代码结构说明策略模式如何组织这些支付方式，以及策略模式与简单工厂模式如何配合使用。`,answer:`答案：策略模式将每种支付方式封装为独立的策略类，通过统一的接口调用。工厂模式负责根据条件选择具体的策略实现。

代码结构示意：

\`\`\`
// 策略接口
interface PaymentStrategy {
    PaymentResult pay(PayRequest request);
    CallbackResult handleCallback(CallbackData data);
    RefundResult refund(RefundRequest request);
}

// 具体策略
class WechatPayStrategy implements PaymentStrategy { /* 微信支付逻辑 */ }
class AlipayStrategy implements PaymentStrategy { /* 支付宝逻辑 */ }
class UnionPayStrategy implements PaymentStrategy { /* 银联逻辑 */ }

// 策略工厂
class PaymentStrategyFactory {
    private Map<String, PaymentStrategy> strategies = new HashMap<>();
    
    public PaymentStrategyFactory() {
        strategies.put("wechat", new WechatPayStrategy());
        strategies.put("alipay", new AlipayStrategy());
        strategies.put("unionpay", new UnionPayStrategy());
    }
    
    public PaymentStrategy getStrategy(String type) {
        PaymentStrategy strategy = strategies.get(type);
        if (strategy == null) throw new IllegalArgumentException("不支持的支付方式");
        return strategy;
    }
}

// 使用方（业务代码无需知道具体支付逻辑）
class PaymentService {
    private PaymentStrategyFactory factory;
    
    public PaymentResult pay(String type, PayRequest request) {
        PaymentStrategy strategy = factory.getStrategy(type);
        return strategy.pay(request);
    }
}
\`\`\`

如果不用策略模式而用 if-else，代码会变成：
\`\`\`
if ("wechat".equals(type)) {
    // 30 行微信支付逻辑
} else if ("alipay".equals(type)) {
    // 30 行支付宝逻辑
} else if ("unionpay".equals(type)) {
    // 30 行银联逻辑
}
\`\`\`

每增加一种支付方式就要修改现有代码（违反开闭原则），且 if-else 中的逻辑无法独立测试。

策略模式的优点：
1）开闭原则——新增支付方式只需增加新的策略类，无需修改现有代码。
2）独立测试——每种支付策略可以独立单元测试。
3）运行时切换——可以在运行时根据条件切换策略。
4）消除条件判断——业务代码从「根据 type 做不同的事」变成「让策略对象做它的事」。

解析：策略模式+工厂模式是实际项目中最常用的组合之一，广泛用于支付、通知、配送、优惠券等「多路分支」场景。注意：如果策略数量少且不太可能扩展（如只有 2 种且确定不会新增），用 if-else 反而更简单——模式不是银弹，引入复杂度需要理由。

扩展延伸：策略模式的高级用法——策略枚举（Enum Strategy）：把策略定义在枚举中（结合 enum 的 constant-specific method implementation），减少类数量。Spring 中通过 @Autowired Map<String, Strategy> 自动注入所有策略 Bean，连工厂都不需要手写。`,hints:[`策略模式解决的是「多个类做同一件事但方式不同」的问题`,`工厂模式和策略模式组合使用时，工厂负责「选」策略，策略负责「做」`,`开闭原则：对扩展开放、对修改关闭——策略模式让新增支付方式不用改现有代码`],tags:[`设计模式`,`策略模式`,`工厂模式`,`支付`,`开闭原则`],content_hash:`82b582c56322`,id:1313},{category:`design_patterns`,difficulty:`hard`,type:`short_answer`,title:`状态模式与策略模式的区别和选型判断`,content:`状态模式（State Pattern）和策略模式（Strategy Pattern）的类图几乎一样——都使用组合 + 接口多态。但两者的目的和适用场景完全不同。请通过一个「订单状态流转」的例子说明状态模式的本质（状态之间的迁移和上下文相关行为切换），对比策略模式（算法独立替换，不关心上下文状态），并总结一段代码出现什么特征时说「这里应该用 State 而不是 Strategy」。`,answer:`答案：State 和 Strategy 结构相同但意图相反——State 是「内在状态驱动行为切换」，Strategy 是「外部注入算法替换」。

订单状态流转的例子（State Pattern）：

订单有多个状态：待支付、已支付/待发货、已发货/待收货、已收货/已完成、已取消。每个状态下，相同操作的行为不同：
- 「取消」操作：待支付状态可以取消（退款），已发货状态不能取消（只能退货）, 已完成状态不能取消。
- 「支付回调」操作：待支付状态下处理支付结果，已支付状态下不应该再来支付回调。

State Pattern 的实现：
\`\`\`
interface OrderState {
    void pay(OrderContext context, PayData data);     // 支付
    void cancel(OrderContext context);                 // 取消
    void ship(OrderContext context);                   // 发货
    void confirmReceive(OrderContext context);         // 确认收货
}

class PendingPaymentState implements OrderState {
    void pay(OrderContext context, PayData data) {
        // 处理支付逻辑
        context.setState(new PaidState());  // → 状态迁移到已支付
    }
    void cancel(OrderContext context) {
        // 处理取消逻辑（退款）
        context.setState(new CancelledState());  // → 状态迁移到已取消
    }
    void ship(OrderContext context) {
        throw new IllegalStateException("未支付不能发货");
    }
    // ...
}
\`\`\`
关键特征：状态对象知道下一个状态是什么（状态迁移逻辑封装在状态类中），Context 根据当前状态委托行为，行为执行后可能切换到新状态。

对比 Strategy Pattern：
\`\`\`
interface SortStrategy {
    void sort(int[] data);
}
class QuickSort implements SortStrategy { /* 快速排序算法 */ }
class MergeSort implements SortStrategy { /* 归并排序算法 */ }

class Sorter {
    private SortStrategy strategy;
    void setStrategy(SortStrategy strategy) { this.strategy = strategy; }
    void sort(int[] data) { strategy.sort(data); }
}
// 使用方决定用什么策略：sorter.setStrategy(new QuickSort());
\`\`\`
关键特征：策略不关心 Context 的状态，不会改变 Context 的状态，策略之间没有迁移关系。使用方从外部决定用哪个策略。

判断标准——出现以下特征时用 State 而不是 Strategy：
1）同一个操作在不同「场景/状态」下行为不同——「取消」在待支付时可以，已支付时需要额外扣费，已发货时不能。
2）行为执行后会改变后续行为——支付后「取消」的行为变了，说明状态发生了迁移。
3）对象有明确的「状态生命周期」——状态的流转有方向和约束（待支付→已支付→已发货→已完成，不能跳转）。
4）你发现代码中有大量的 if/switch 判断「当前是什么状态然后做什么」——这是典型的「状态模式引入信号」：\`if (state == PENDING) { ... } else if (state == PAID) { ... }\`

如果只是「我想让算法可以自由替换，算法之间没有顺序和迁移关系」，用 Strategy。
如果行为根据对象的内在状态不同，且行为会改变状态，用 State。

解析：一句话总结——Strategy 是「怎么做的选择」（算法替换），State 是「什么时候做什么」（状态驱动的行为切换）。选错的话，用 Strategy 实现订单状态会变成在 Strategy 里维护全量的 if-else 判断，失去了模式的意义。`,hints:[`State 模式中状态对象知道下一个状态是什么（迁移逻辑在状态类中），Strategy 中策略不知道其他策略的存在`,`代码中出现大量 switch(state) 说明你应该用 State 模式了`,`Strategy 是行为选择（怎么做），State 是行为变更（什么时候做什么）`],tags:[`设计模式`,`状态模式`,`策略模式`,`State`,`Strategy`],content_hash:`9256e0966da3`,id:1314},{category:`design_patterns`,difficulty:`medium`,type:`short_answer`,title:`策略模式与模板方法模式的选择`,content:`在你的支付系统中，不同的支付渠道（微信/支付宝/银联）有相同的流程骨架（验证 → 扣款 → 回调 → 通知），但每个步骤的具体实现不同。你会用策略模式还是模板方法模式？为什么？`,answer:`答案：优先使用模板方法模式（Template Method Pattern）。因为支付渠道的流程结构是固定的，变化的是每个步骤的实现——这正是模板方法模式的适用场景。

解析：两者的核心区别在于控制反转的方向：

1）模板方法模式——父类定义算法骨架（固定流程），子类重写特定步骤（差异化实现）。控制权在父类。
适用场景：不同实现共享相同的流程结构，且流程几乎不变。
你的支付案例：validateOrder() → deductMoney() → handleCallback() → sendNotification() 是固定流程，不同渠道只需要重写各步骤的具体逻辑。

2）策略模式——定义策略接口，客户端选择具体策略注入上下文。控制权在客户端。
适用场景：算法可以完全互换，且流程可能变化。
如果不同渠道不仅实现不同，连流程步骤都可能不一样（如某些渠道不需要回调、某些渠道需要额外步骤），策略模式更合适。

扩展延伸：组合使用——抽象工厂 + 模板方法：用抽象工厂创建各支付渠道的策略族，用模板方法定义执行流程。实际项目中，Spring 的 JdbcTemplate、RestTemplate 都是模板方法模式的体现——固定流程（打开连接 → 执行 SQL → 处理结果 → 关闭连接），变化的步骤通过回调接口（Callback）注入，这是一种结合了策略和模板方法的变体。选型建议：如果未来可能新增支付渠道，模板方法模式更易扩展（新增一个子类即可）。如果未来可能改变流程（新增步骤或调整顺序），策略模式更灵活。`,hints:[`模板方法——「骨架固定、步骤可变」；策略模式——「算法可互换、流程可变化」`,`如果流程结构未来可能变化，选策略模式；如果结构固定但实现变化，选模板方法`],tags:[`设计模式`,`策略模式`,`模板方法`,`支付`],content_hash:`9a10838e2224`,id:1315},{category:`design_patterns`,difficulty:`medium`,type:`short_answer`,title:`观察者模式的现代替代方案`,content:`你的系统需要在用户下单后执行一系列动作（发送邮件、更新库存、通知物流、记录日志）。传统方案是用观察者模式（Observer Pattern）实现事件通知。在现代 Java/Spring 架构中，以下哪种方案更推荐？

A) 继续使用观察者模式——定义一个 Subject 接口，所有观察者注册到 Subject 上
B) 使用 Spring 的 ApplicationEvent / EventListener 机制实现观察者
C) 使用消息队列（RabbitMQ/Kafka）解耦所有后置动作
D) 在一个事务中同步调用所有后置服务`,answer:`答案：正确答案：B

解析：Spring 的 ApplicationEvent / @EventListener 本质上就是观察者模式的标准实现，但比手写观察者更好——它利用 IoC 容器自动管理观察者注册，支持异步执行（@Async），且与事务同步（TransactionEventListener）。

A 选项的问题：手写观察者模式在 Spring 生态中属于重复造轮子。Spring 已经提供了完整的实现，包括同步/异步、事务绑定、异常处理。

C 选项的问题：引入消息队列的复杂度远高于当前需求——需要部署和维护消息中间件、处理消息幂等性和顺序问题。消息队列适合跨服务、跨进程的事件驱动架构，不适合单体应用内的服务间通信。

D 选项的问题：在同一个事务中同步调用所有后置服务会导致：1）主流程被后置动作阻塞（用户要等到邮件发送完毕才能看到下单成功）；2）任何一个后置服务失败都会导致主事务回滚（邮件发送失败导致订单取消）。

扩展延伸：实际项目的推荐分层：1）同进程内的后置动作（日志记录、缓存更新）→ 用 Spring Event（同步或异步）；2）同服务但跨聚合的事件（订单完成→通知库存预留）→ 用 Spring Event + @Async 或 @TransactionalEventListener；3）跨服务的事件（订单完成→物流系统发货）→ 用消息队列 + 事件总线。观察者模式的现代演变是从「类级别的硬编码通知」到「框架级别的声明式事件驱动」。勿过度设计——在单一应用内引入消息队列来解决「下单后发邮件」的问题是大炮打蚊子。`,hints:[`Spring Event 是观察者模式的现代实现——利用 IoC 容器管理观察者注册`,`同进程内用 Spring Event，跨服务用消息队列——选型取决于是否需要跨服务解耦`],tags:[`设计模式`,`观察者`,`Spring`,`事件驱动`],content_hash:`53a8551fa1d3`,id:1316},{category:`design_patterns`,difficulty:`medium`,type:`short_answer`,title:`SAGA 模式编排 vs  choreography 选型`,content:`在微服务架构中实现分布式事务，你有两个 SAGA 模式的实现选项：编排（Choreography，每个服务发布事件驱动下一个服务）和协编（Orchestration，一个协调器调用各服务）。你在什么场景下选择编排、什么场景下选择协编？`,answer:`答案：编排适合流程简单、服务数量少且变化不频繁的场景；协编适合流程复杂、服务多、需要集中管理和监控的场景。

解析：编排模式（Choreography）：
- 实现方式：每个服务完成自己的本地事务后发布领域事件，下一个服务监听事件并执行自己的步骤。如果某个步骤失败，各服务发布补偿事件回滚。
- 优点：松耦合（服务间不知道彼此存在）、架构简单（不需要协调器）、适合事件驱动架构。
- 缺点：流程逻辑分散在各服务中（难以看到全局流程）、新增步骤需要修改多个服务的监听逻辑、调试困难（事件链分散）。
- 适合场景：服务 3-5 个且流程稳定、团队对事件驱动有经验、异步最终一致性可接受。

协编模式（Orchestration）：
- 实现方式：一个 Saga 协调器（Orchestrator）负责告诉每个服务做什么、并在失败时告诉各服务做什么补偿。协调器通常是有状态的服务（存储 Saga 执行状态）。
- 优点：流程逻辑集中（一个地方看到全貌）、变更影响可控（只改协调器）、易监控和调试（Saga 执行状态可追踪）。
- 缺点：协调器成为耦合点（需要知道所有服务的接口）、协调器本身是单点（需要高可用）。
- 适合场景：服务 5 个以上、流程频繁变化、需要严格监控和治理的分布式事务。

扩展延伸：实际项目中的折中方案——混合使用：用编排处理简单分支（发布事件驱动下游），用协编处理核心链路（订单主流程用协调器控制）。工具选型：编排型可选 Axon Framework、Eventuate；协编型可选 Camunda（BPMN 工作流引擎）、Temporal（微服务编排平台）、Seata。编排和协编不是非此即彼，同一个系统里可以两者共存。关键判断：如果你需要「一眼看到整个事务流程」——用协编；如果你更关注服务间的解耦——用编排。`,hints:[`编排 = 服务间通过事件链式驱动；协编 = 一个协调器集中指挥所有服务`,`编排更松耦合但流程不透明；协编更集中可控但耦合度高`],tags:[`设计模式`,`Saga`,`分布式事务`,`微服务`,`编排`],content_hash:`91cea613ef8d`,id:1317},{category:`design_patterns`,difficulty:`hard`,type:`short_answer`,title:`Bridge 模式 vs Adapter 模式区分`,content:`你需要为一个消息推送系统做设计。系统需要支持多种消息类型（文本/图片/富媒体）和多种推送渠道（短信/邮件/App Push）。你希望新增消息类型或推送渠道时不影响已有的代码。以下哪个模式组合最适合这个需求？

A) Adapter 模式——为每个渠道写一个适配器
B) Bridge 模式——将消息抽象和推送实现分离为两个独立的维度
C) Factory 模式——根据参数创建不同的推送对象
D) Facade 模式——为推送系统提供一个统一的简化接口`,answer:`答案：正确答案：B

解析：这个需求有两个独立变化的维度——消息类型和推送渠道。Bridge 模式专门解决多维度的组合问题：将抽象部分（消息类型）与实现部分（推送渠道）分离，各自可以独立变化和扩展。

A 选项的问题：Adapter 模式是让不兼容的接口能够一起工作（如封装第三方 SDK 的差异接口），它不解决多维组合问题。

C 选项的问题：Factory 模式解决的是对象创建的问题，虽然可以和 Bridge 组合使用（工厂创建具体的 Message + Sender 组合），但不解决维度扩展。

D 选项的问题：Facade 模式是提供简化接口，隐藏子系统复杂性，不解决可变维度的扩展。

扩展延伸：Bridge 模式的典型实现：

\`\`\`java
// 实现维度：推送渠道
interface MessageSender { void send(String content); }
class EmailSender implements MessageSender { ... }
class SmsSender implements MessageSender { ... }

// 抽象维度：消息类型
abstract class Message {
    protected MessageSender sender;
    abstract void send();
}
class TextMessage extends Message { ... }
class RichMediaMessage extends Message { ... }
\`\`\`

新增消息类型 → 新增 Message 子类；新增推送渠道 → 新增 MessageSender 实现类。两者互不干扰。Bridge 模式在跨平台 GUI 框架（不同操作系统 × 不同 UI 组件）和 JDBC 驱动（不同数据库 × 不同 SQL 操作）中都有广泛应用。`,hints:[`当你有两个独立变化的维度时——用 Bridge 模式`,`Bridge = 抽象（消息类型）和实现（推送渠道）分离，各自独立变化`],tags:[`设计模式`,`Bridge`,`Adapter`,`架构`],content_hash:`9d68affdd37d`,id:1318},{category:`design_patterns`,difficulty:`hard`,type:`short_answer`,title:`Transaction Outbox 模式实现细节`,content:`你的订单服务需要在创建订单后向消息队列发送事件。但直接发送 MQ 存在风险——订单创建成功但消息没发出去（网络闪断），或消息发了但事务回滚了（幽灵消息）。Transaction Outbox 模式如何解决这些问题？有哪些实现方式？`,answer:`答案：Transaction Outbox 模式将事件先写入数据库（与业务操作在同一事务中），再由独立的进程（Message Relay）异步将事件发布到消息队列。核心思路——「业务操作和事件存储在一个本地事务中，保证两者原子性」。

解析：标准实现流程：

1）订单服务在同一个数据库事务中完成两件事：a) 写入订单表（业务操作）；b) 写入 outbox 表（事件记录，状态=待发送）。

2）一个独立的消息发布进程（可以是单独的微服务或同一个应用的后台线程）定时或通过 CDC（Change Data Capture）扫描 outbox 表。

3）发现状态=待发送的事件时，将其发布到消息队列，发布成功后将状态更新为已发送（或直接删除该记录）。

三种实现方式：

方式一：定时轮询 Polling Publisher——后台线程每 N 秒扫描 outbox 表。实现简单，但存在轮询延迟和重复扫描。

方式二：CDC（Change Data Capture）——使用 Debezium 等工具监听数据库的 binlog（MySQL）/ WAL（PostgreSQL），当 outbox 表有新记录时实时捕获并推送给消息队列。延迟低，不侵入业务代码，适合高吞吐场景。

方式三：Transactional outbox + Kafka Connect——结合 Kafka Connect 的 JDBC Sink Connector 直接读取数据库 outbox 表写入 Kafka。

扩展延伸：注意事项：1）幂等性——消息可能重复发送（Publisher 在发送成功后崩溃，重新扫描时又重新发送了一次），消费者需要做幂等处理。2）event_id 唯一索引——outbox 表的事件 ID 使用唯一索引或 UUID，防止重复插入。3）清理过期数据——定期清理已发送的 outbox 记录（保留 3-7 天用于排查）。4）消息顺序——如果需要消息的严格顺序（FIFO），单分区 + 单线程 Publisher + 事件按序写入。Transaction Outbox 模式是目前业界解决「本地事务 + 消息发送一致性」的标准方案，在订单、支付、财务等场景中被广泛使用。`,hints:[`核心思想——业务操作和事件存储放在同一个本地事务中`,`CDC（如 Debezium）是比定时轮询更优雅的实现方式`],tags:[`设计模式`,`Outbox`,`消息`,`一致性`,`微服务`],content_hash:`f1744e51d596`,id:1319},{category:`design_patterns`,difficulty:`medium`,type:`short_answer`,title:`解释器模式在 DSL 设计中的应用`,content:`请详细解释解释器模式（Interpreter Pattern）的核心结构和适用场景。解释器模式适合解决什么样的问题？它与 Visitor 模式有什么区别和联系？结合 Spring SpEL（Spring Expression Language）或 SQL 解析的场景，说明解释器模式的具体设计方式以及它的局限性（性能问题、文法复杂度爆炸）。`,answer:`答案：解释器模式（Interpreter Pattern）为语言文法定义表达式类层次结构，每个文法规则对应一个表达式类，通过递归组合解析语法树。

解析：解释器模式的结构包括 AbstractExpression（抽象表达式，定义 interpret 方法）、TerminalExpression（终结符表达式——文法中的最小单元）、NonterminalExpression（非终结符表达式——由子表达式组合而成）、Context（上下文——存储解析过程中的全局状态）。

经典示例：四则运算解析。文法：expression ::= number | expression '+' expression | expression '-' expression | expression '*' expression | expression '/' expression。每个规则映射为一个类：NumberExpression（终结符）、AddExpression/SubtractExpression/MultiplyExpression/DivideExpression（非终结符）。\`3 + 5 * 2\` 解析为 AddExpression(Number(3), MultiplyExpression(Number(5), Number(2)))。

与 Visitor 模式的对比：Visitor 模式在固定的类结构上增加新的操作（操作易扩展，结构难扩展），Interpreter 模式在固定的操作上增加新的表达式（结构易扩展，操作难扩展）。实际中两者经常组合——用 Interpreter 解析文法构建 AST，用 Visitor 遍历 AST 执行语义分析。

适用场景：1）DSL 解析（Spring SpEL、JPQL、Liquibase 的变更日志 DSL）——文法简单且变化不频繁时非常适合；2）配置文件解析（如正则表达式引擎）；3）计算公式引擎（如业务规则引擎中的公式求值）。

局限性：1）文法规则多时类数量爆炸——每个规则一个类；2）性能问题——递归解释深度大时效率低（大量虚函数调用和对象创建）；3）维护困难——文法复杂后解释器代码极难调试。

实际建议：简单的 DSL 用 Interpreter 模式清晰可控；复杂的语言解析请直接用 ANTLR/PEG 解析器生成器，不要手写解释器模式。`,hints:[`Interpreter 模式和 Visitor 模式在 AST 处理中如何分工——Interpreter 建树、Visitor 遍历`,`解释器模式的性能瓶颈在哪里——递归深度大时的对象创建开销和虚函数调用`],tags:[`解释器模式`,`Interpreter`,`DSL`,`设计模式`],content_hash:`31694e9e91a2`,id:1320},{category:`design_patterns`,difficulty:`medium`,type:`short_answer`,title:`注册模式（Registry）的设计与实战`,content:`请解释注册模式的设计目的和实现方式。注册模式和享元模式（Flyweight）有什么关联和区别？与 Service Locator 有什么区别？结合 MyBatis 的 TypeAliasRegistry 或 Spring 的 Singleton Bean 注册表，说明注册模式的实际应用。`,answer:`答案：注册模式（Registry）提供一个全局的、集中式的对象存储和查找机制，允许通过键（Key）快速获取共享实例。核心功能是「登记 + 查找」。

解析：注册模式的核心结构非常简单——一个全局 Map，key 为标识（字符串/Class/枚举），value 为共享对象实例。

\`\`\`java
public class ServiceRegistry {
    private final Map<String, Object> services = new ConcurrentHashMap<>();
    public void register(String name, Object service) { services.put(name, service); }
    @SuppressWarnings("unchecked")
    public <T> T get(String name) { return (T) services.get(name); }
}
\`\`\`

与享元模式的关系：Registry 是实现享元模式的核心基础设施。享元模式通过 Registry 管理共享的享元对象池，确保相同的外部状态对象不被重复创建。区别：Registry 是一种结构型/创建型模式（专注于存储和查找），Flyweight 是一种优化模式（专注于内存节省）。

与 Service Locator 的区别：Service Locator 是 Registry 的演进版——除了查询功能外还封装了创建逻辑（如果找不到则创建并注册）。Registry 被动接收注册，Service Locator 主动管理生命周期。

实战案例：1）MyBatis TypeAliasRegistry——registerAlias("integer", Integer.class) 将类型别名注册到 Map；2）Spring 的 DefaultSingletonBeanRegistry——三级缓存解决循环依赖；3）枚举 Registry——CommandRegistry 注册命令处理器，避免庞大的 switch-case。

设计考量：1）Registry 本质上是全局状态（有点像全局变量），过度使用会破坏依赖清晰度；2）线程安全——ConcurrentHashMap 是标配；3）初始化时机——静态初始化块 / Spring @PostConstruct。`,hints:[`Registry 和 Service Locator 的区别——Registry 只管查询，Service Locator 还能自动创建`,`Registry 的全局状态问题是它的最大缺点——依赖关系变得隐式`],tags:[`注册模式`,`Registry`,`Service Locator`,`设计模式`],content_hash:`fd1158bf0d0f`,id:1321},{category:`design_patterns`,difficulty:`hard`,type:`short_answer`,title:`备忘录模式与事务回滚设计`,content:`请深入解释备忘录模式（Memento Pattern）的设计结构和应用场景。备忘录模式如何实现「不破坏封装性的前提下保存和恢复对象内部状态」？它和命令模式（Command Pattern）在实现撤销（Undo）时的分工合作是怎样的？在数据库事务回滚或分布式 Saga 补偿事务中，如何借鉴备忘录模式的设计思想？`,answer:`答案：备忘录模式在不暴露对象内部实现的前提下捕获并外部化其内部状态，以便之后可以将对象恢复到之前的状态。

解析：三角色结构——1）Originator（原发器）：需要保存状态的对象，负责创建 Memento 和从 Memento 恢复状态；2）Memento（备忘录）：存储 Originator 内部状态的不透明对象（对外只暴露窄接口，对 Originator 暴露宽接口）；3）Caretaker（管理者）：负责保存 Memento 但不操作其内容。

\`\`\`java
// 窄接口——对外部可见
public interface Memento {}
// 宽接口——仅 Originator 使用
class ConcreteMemento implements Memento {
    private final String state;
    ConcreteMemento(String state) { this.state = state; }
    String getState() { return state; }
}
class Originator {
    private String state;
    public Memento save() { return new ConcreteMemento(state); }
    public void restore(Memento m) { state = ((ConcreteMemento) m).getState(); }
}
\`\`\`

与命令模式的协作：Command 模式存储「操作」，Memento 模式存储「状态」。实现支持撤销的命令时，Command 在执行前调用 Originator.save() 保存状态到 Memento，撤销时调用 Originator.restore(memento) 恢复。Caretaker 维护一个 Memento 栈实现多级撤销。

在事务回滚中的应用：1）本地事务——数据库的 Undo Log 本质上是 Memento 模式的实现（保存修改前的数据映像）；2）Saga 补偿事务——每个 Saga 步骤记录补偿操作（State Memento），失败时从 Memento 栈中依次执行逆操作。

设计考量：1）Memento 可能很大（如包含整个对象图的快照）——可用差异存储（只保存变化的部分）或增量快照优化；2）封装性——Java 中用包级访问权限或内部类确保只有 Originator 能访问 Memento 内部状态。`,hints:[`Memento 的「宽窄接口」设计如何保证封装——Originator 能读写，Caretaker 只能存`,`数据库 Undo Log 是备忘录模式的思想体现——记录修改前的状态用于回滚`],tags:[`备忘录模式`,`Memento`,`事务回滚`,`Undo`,`设计模式`],content_hash:`bd5cc1f3bf14`,id:1322},{category:`design_patterns`,difficulty:`hard`,type:`short_answer`,title:`惰性初始化模式（Lazy Initialization）`,content:`请详细解释惰性初始化（Lazy Initialization Pattern）的核心设计思想、实现方式以及适用场景。延迟初始化和单例模式结合时需要注意什么问题？在 Spring 中 @Lazy 注解的工作原理是什么？MyBatis 的延迟加载（Lazy Loading）是如何实现的？`,answer:`答案：惰性初始化模式将对象的创建从「类加载时」推迟到「首次使用时」，以节省资源、减少启动时间。核心思想是将创建开销从初始化阶段平摊到首次使用时刻。

解析：基本实现方式——1）简单延迟初始化（非线程安全）：判断引用是否为 null，为 null 则创建；2）同步延迟初始化（synchronized）：线程安全但每次访问都有锁开销；3）双重检查锁定（Double-Checked Locking）；4）Holder 模式（Class Holder Idiom）——利用 JVM 类加载机制，静态内部类在首次被引用时才加载和初始化。

\`\`\`java
public class LazySingleton {
    private LazySingleton() {}
    private static class Holder {
        static final LazySingleton INSTANCE = new LazySingleton();
    }
    public static LazySingleton getInstance() {
        return Holder.INSTANCE;
    }
}
\`\`\`

与单例模式结合的问题：饿汉式单例在类加载时立即创建实例，即使从未使用。懒汉式单例（延迟初始化 + 单例）可以避免这种浪费，但必须处理线程安全。建议使用 Holder 模式或枚举类实现线程安全的懒加载单例。

Spring @Lazy 注解：1）作用于 @Bean 时——Bean 不在容器启动时创建，在首次注入时才创建；2）作用于 @Configuration 时——该配置类中所有 @Bean 都延迟初始化；3）作用于 @Component 时——该组件延迟初始化；4）作用于 @Autowired/@Inject 时——创建代理对象注入，首次调用代理时才真正解析依赖。底层通过 CglibSubclassingInstantiationStrategy + LazyResolutionProxyFactoryBean 实现。

MyBatis 延迟加载：配置 lazyLoadingEnabled=true 后，MyBatis 为关联对象（如 association/collection）创建 Javassist 或 Cglib 代理对象。首次访问关联属性时，代理触发 SQL 查询填充实际对象。

注意事项：1）延迟初始化不适合「首次访问延迟敏感」的场景（如在请求处理路径中触发耗时的初始化）；2）内存泄漏风险——延迟创建的对象持有上下文引用可能导致 GC 无法回收。`,hints:[`Holder 模式为什么既是线程安全的又能延迟初始化——JVM 保证静态内部类的类加载线程安全`,`Spring @Lazy 创建的代理对象在首次调用时才解析依赖，这是如何实现的`],tags:[`惰性初始化`,`Lazy Initialization`,`性能优化`,`多线程`],content_hash:`d034b23614cb`,id:1323},{category:`design_patterns`,difficulty:`hard`,type:`short_answer`,title:`双重检查锁定（DCL）的正确实现与陷阱`,content:`双重检查锁定（Double-Checked Locking, DCL）是一种在延迟初始化场景中减少锁竞争的优化手段。为什么在 Java 中 DCL 的「经典写法」是错误的？volatile 关键字如何修复 DCL？在 JDK 9+ 中 VarHandle 对 DCL 有什么影响？为什么 Holder 模式和枚举单例通常比 DCL 更推荐？`,answer:`答案：经典 DCL 写法 \`if (instance == null) { synchronized(this) { if (instance == null) { instance = new Instance(); } } }\` 在 Java 5 之前是错的，问题根源在于「指令重排序」。

解析：\`instance = new Instance()\` 在 JVM 中分解为三个步骤：1）分配内存空间（allocate）；2）调用构造方法初始化对象（initialize）；3）将引用指向分配的内存地址（assign）。在不做特殊处理的情况下，JVM 可能将步骤 2 和 3 重排序——另一个线程在第 3 步完成后、第 2 步完成前获取到引用，读到的是「部分构造的对象」（部分字段为默认值而非构造方法设置的值）。

修复方案：将 instance 声明为 volatile。Java 5 之后 volatile 语义增强，volatile 写操作会插入 Store-Store 和 Store-Load 屏障，禁止步骤 2 和 3 的重排序。同时 volatile 保证可见性——一个线程修改后其他线程立即可见。

\`\`\`java
public class CorrectDCL {
    private static volatile CorrectDCL instance;
    public static CorrectDCL getInstance() {
        CorrectDCL result = instance;
        if (result == null) {
            synchronized (CorrectDCL.class) {
                result = instance;
                if (result == null) {
                    instance = result = new CorrectDCL();
                }
            }
        }
        return result;
    }
}
\`\`\`
注意：方法内将 instance 赋值给局部变量 result 可以避免每次访问都读 volatile（减少约 25% 的 volatile 读开销）。

JDK 9+ VarHandle：VarHandle 提供了更底层的语义——MethodHandles.lookup().findStaticVarHandle(X.class, "instance", X.class).getAcquire() 和 .setRelease(o) 可以替代 volatile 实现更细粒度的内存排序语义。

为什么 Holder 模式和枚举单例更推荐：1）Holder 模式利用 JVM 类加载的线程安全机制——<clinit> 在类首次被引用时由 JVM 保证线程安全地执行；2）枚举单例（enum Singleton { INSTANCE }）——JVM 保证枚举实例的线程安全创建，天然防止反射攻击和序列化破坏。DCL 代码复杂、容易出错，除非需要精细控制初始化时机，否则优先选 Holder 或枚举。`,hints:[`DCL 问题的本质是「指令重排序」——构造方法在引用赋值之后才执行`,`volatile 如何修复 DCL——Java 5 之后 volatile 写禁止与之前的普通写重排序`],tags:[`双重检查锁定`,`DCL`,`并发`,`JMM`,`volatile`],content_hash:`b9f92382fa57`,id:1324},{category:`design_patterns`,difficulty:`easy`,type:`choice`,title:`抽象工厂 vs 工厂方法`,content:`以下关于抽象工厂模式（Abstract Factory）和工厂方法模式（Factory Method）的对比，正确的是？`,options:[`A) 抽象工厂是工厂方法的一种`,`B) 工厂方法通过继承创建对象，抽象工厂通过组合创建对象`,`C) 工厂方法创建一个产品，抽象工厂创建一系列相关产品`,`D) 抽象工厂比工厂方法更简单`],answer:`C) 抽象工厂模式与工厂方法的区别在于产品族维度：工厂方法模式适用于单一产品等级结构（一个工厂生产一种产品），抽象工厂模式适用于多个产品等级结构（一个工厂生产一簇相关产品）。

解析：工厂方法模式——定义一个创建对象的接口，让子类决定实例化哪个类。每个具体工厂只能创建一种产品。优点：符合单一职责，新增产品不需要修改现有代码。抽象工厂模式——提供一个创建一系列相关/依赖对象的接口，无需指定具体类。每个具体工厂可以创建一整个产品族（如 Windows 工厂创建 Windows Button + Windows TextBox）。优点：保证同一产品族的产品兼容，新增产品族容易。

对比：工厂方法侧重「单个产品」的创建延迟，抽象工厂侧重「产品族」的整体创建。工厂方法使用继承（子类重写工厂方法），抽象工厂使用组合（多个工厂方法组合在一起）。实际项目中，抽象工厂通常持有多个工厂方法。`,hints:[`工厂方法（虚构造器）定义一个创建对象的接口，子类决定实例化哪个类。抽象工厂创建产品族`],tags:[`设计模式`,`工厂`,`创建型`],content_hash:`eea2c4bcbbd7`,id:1325},{category:`design_patterns`,difficulty:`medium`,type:`true_false`,title:`单例模式与多线程安全`,content:`懒加载的 Singleton 单例模式如果不加同步控制，在多线程环境下可能创建多个实例，违反单例原则。`,answer:`正确

解析：懒汉式单例（Lazy Singleton）延迟实例化：if (instance == null) { instance = new Instance(); }。两个线程同时通过 null 检查可能导致各创建一个实例。解决方案：
（1）synchronized getInstance() —— 性能差。（2）双重检查锁定（Double-Checked Locking）+ volatile：两次 null 检查+同步块，volatile 防止指令重排。（3）静态内部类（Bill Pugh）：利用 JVM 类加载机制保证线程安全。（4）枚举单例（Effective Java 推荐）：最简洁且防反射/序列化攻击。`,hints:[`指令重排可能导致 DCL 问题`,`枚举单例为什么被认为是最好实现？`],tags:[`单例`,`线程安全`,`设计模式`],content_hash:`a17b6f987220`,id:1326},{category:`design_patterns`,difficulty:`easy`,type:`fill_in_blank`,title:`设计模式三大分类`,content:`GoF 设计模式按目的分为三类：________ 模式（如工厂、单例）负责对象创建；________ 模式（如适配器、装饰器）负责类/对象的组合；________ 模式（如观察者、策略）负责对象间的通信和行为分配。`,answer:`{"correct": [["创建型", "Creational", "创建"], ["结构型", "Structural", "结构"], ["行为型", "Behavioral", "行为"]], "distractors": ["生成型", "组合型", "交互型", "架构型"]}`,hints:[`工厂、单例、建造者属于哪一类？`,`观察者、策略、命令属于哪一类？`],tags:[`设计模式`,`GoF`,`分类`],content_hash:`c49e6ec8f5fa`,id:1327}];export{e as category,t as questions};