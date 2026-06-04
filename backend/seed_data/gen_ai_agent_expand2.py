#!/usr/bin/env python3
"""Expand ai_agent.json from 53 to ~100 questions."""
import json, os

def q(cat, diff, typ, title, content, answer, hints, tags):
    return dict(category=cat, difficulty=diff, type=typ, title=title,
                content=content, answer=answer, hints=hints, tags=tags)

NEW = [
    q('ai_agent', 'hard', 'short_answer', 'Agent 的规划能力：分层规划与动态规划',
      '深入分析 Agent 的规划机制。分层规划（Hierarchical Planning）——高层目标分解到底层任务。动态规划（Replanning）——执行中根据反馈调整。Plan-ahead vs Realtime Planning。任务依赖图的拓扑排序执行。规划器的评估和回退。',
      'Agent 规划机制：\n\n1. **分层规划**：\n   - 高层：战略目标（如「完成市场分析报告」）\n   - 中层：阶段任务（搜集数据 → 分析趋势 → 撰写报告）\n   - 低层：原子动作（调用搜索工具 → 读取结果 → 写入文件）\n   - 上层规划结果作为下层目标\n\n2. **动态规划**：\n   - 初始 Plan → 执行第一步 → 观察结果 → 更新 Plan\n   - 工具调用失败 → 重试/降级/另辟蹊径\n   - **ReAct 模式**：Thought → Action → Observation → Thought\n\n3. **任务依赖**：\n   - DAG（有向无环图）表示任务依赖\n   - 拓扑排序：没有依赖的先执行\n   - 并行任务组：无依赖的可同时进行\n\n4. **Planner 评估**：\n   - 计划完成率（Plan Completion Rate）\n   - 计划修改频率（反映计划质量）\n   - 最终结果是否达到目标\n\n5. **回退策略**：\n   - 子任务失败 → 重试 / 跳过 / 替代方案\n   - 计划阻塞 → 请求用户帮助\n   - 长任务 → 保存中间结果（断点续做）',
      ['分层规划 = 战略→战术→动作三层分解', '动态规划通过 ReAct 模式持续修正计划'], ['agent', 'planning']),

    q('ai_agent', 'hard', 'short_answer', 'Agent 的反思与自我纠错机制',
      '深入 Agent 的反思（Reflection）模式。Simple Reflection——Agent 检查自己的输出是否满足要求。强化反思（Self-Critique）——Agent 评价自己的思考过程并修正。ReAct 中的纠错时机。Reflexion 框架——Agent 从错误中学习的能力。',
      'Agent 反思机制：\n\n1. **Simple Reflection**：\n   - 生成输出后检查：格式是否正确、参数是否完整\n   - 工具调用后验证结果格式\n   - **检查清单**：Tool call valid? Output matches schema? Task done?\n\n2. **Self-Critique**：\n   - 分析自己的思考链：前提是否正确、推理是否有跳跃\n   - 发现问题 → 修正推理\n   - 类似人类的「我刚刚说了什么」「让我重新想想」\n\n3. **ReAct 纠错时机**：\n   - Thought 阶段：检查之前的 Observation 是否被正确理解\n   - Action 阶段：确认 Action 参数是否合理\n   - Observation 阶段：结果是否符合预期\n\n4. **Reflexion**：\n   - Agent 将失败经验存入 Memory\n   - 下次遇到类似情况 → 从记忆中检索经验\n   - 支持短期反思（当前轮次）和长期反思（跨会话）\n\n5. **纠错策略**：\n   - 错误类型分类 → 对应处理策略\n   - 重试：临时错误（网络超时）→ 指数退避\n   - 降级：功能缺失 → 使用替代方案\n   - 求助：多次重试仍失败 → 请求用户介入',
      ['Reflection = 输出检查，Self-Critique = 推理过程检查', 'Reflexion 将失败经验持久化记忆避免重复犯错'], ['agent', 'reflection', 'self-correction']),

    q('ai_agent', 'medium', 'short_answer', 'Agent 的工具定义与函数调用模式',
      '讨论 Agent 的工具定义最佳实践。工具描述的精确性——名字 + 描述 + 参数对 LLM 理解的影响。参数设计——必选/可选、枚举类型、参数间依赖。工具的版本管理。工具调用的错误恢复。多工具的优先级和选择策略。',
      'Agent 工具定义：\n\n1. **描述原则**：\n   - 函数名：动宾结构（search_files、send_email）\n   - 描述：清晰说明何时使用此工具\n   - 参数名和类型：自解释 + 描述\n   - 示例：`search(query: str, limit: int) — 搜索文件系统`\n\n2. **参数设计**：\n   - **必选参数**：最小必要\n   - **可选参数**：提供默认值\n   - **枚举类型**：给出所有选项\n   - 参数间依赖：文档说明\n\n3. **版本管理**：\n   - 工具 Schema 版本号\n   - 向后兼容：新增字段用 optional\n   - 废弃工具：保留但不推荐（标记 deprecated）\n\n4. **错误处理**：\n   - Tool Call 格式错误 → 提示 LLM 修正\n   - 参数校验失败 → 友好的错误信息\n   - 执行失败 → 区分：临时错误（可重试）vs 永久错误\n\n5. **选择策略**：\n   - 最匹配优先（通过语义匹配）\n   - 多个工具可完成 → 选择精确度最高的\n   - 工具数量 > 50 → 需要考虑分组和路由',
      ['工具描述直接影响 LLM 调用的准确率', '错误信息越友好，Agent 自动恢复越快'], ['agent', 'tool-use', 'function-calling']),

    q('ai_agent', 'hard', 'short_answer', '多 Agent 协作：通信协议与任务分配',
      '讨论多 Agent 系统的协作模式。Agent 间通信协议——消息队列 vs 共享内存 vs 直接调用。任务分解和分配——Master-Worker 模式。辩论（Debate）模式——多个 Agent 做不同角色讨论决策。市场机制——Agent 竞争任务。',
      '多 Agent 协作：\n\n1. **通信模式**：\n   - **消息队列**：异步、持久化、解耦（MQ/Bus）\n   - **共享内存**：共享状态高效、但协调复杂\n   - **gRPC 调用**：同步、低延迟、适合实时协作\n\n2. **Master-Worker**：\n   - Master 分解任务 → Worker 执行 → 结果回传\n   - Worker 独立运行、可水平扩展\n   - Master 需要监控 Worker 进度\n   - **问题**：Master 单点瓶颈\n\n3. **Debate 模式**：\n   - 多个 Agent 分配不同角色（正方/反方/评审）\n   - 各 Agent 从自己的角度分析\n   - 汇总后综合决策\n   - **应用**：代码审查、设计评审、风险评估\n\n4. **市场机制**：\n   - 任务发布 → Agent 投标 → 选最优者\n   - 竞标依据：能力匹配度、当前负载、历史成功率\n   - **优势**：去中心化、负载均衡\n\n5. **协调挑战**：\n   - 死锁：两个 Agent 互相等待\n   - 冲突：不一致的决策\n   - 通信开销：Agent 越多同步消耗越大',
      ['Master-Worker 简单高效（但 Master 有单点问题）', 'Debate 模式通过多角色辩论提升决策质量'], ['agent', 'multi-agent', 'collaboration']),

    q('ai_agent', 'hard', 'short_answer', 'Agent 的记忆管理：分层记忆与检索',
      '深入 Agent 的长期记忆架构。记忆的层次：工作记忆（上下文窗口）→ 短期记忆（当前会话）→ 长期记忆（跨会话）。记忆的向量检索——Embedding + 向量数据库。记忆的压缩和摘要。记忆的遗忘机制。',
      'Agent 记忆管理：\n\n1. **三层记忆**：\n   - **工作记忆**：LLM 上下文窗口（当前指令 + 最新交互）\n   - **短期记忆**：当前会话内的交互记录\n   - **长期记忆**：跨会话的经验和知识\n\n2. **向量检索**：\n   - Embedding 编码记忆 → 存入向量库\n   - 检索时：Query Embedding → 相似度搜索 → Top-K 结果\n   - 使用 RAG 技术增强上下文\n\n3. **记忆压缩**：\n   - **摘要**：对话 → LLM 生成摘要\n   - **结构化**：提取关键信息（实体、关系、决策）\n   - **分层**：详细记忆 → 摘要 → 元数据\n\n4. **遗忘机制**：\n   - 时间衰减：久未访问的记忆降低优先级\n   - 重要性评分：自动评估记忆价值\n   - **策略**：LRU 淘汰 / 重要性淘汰 / 混合策略\n\n5. **最佳实践**：\n   - 关键决策和结果存入长期记忆\n   - 最近 5 轮交互作为工作记忆\n   - 定期总结中间结果',
      ['三层记忆架构 = 工作（当前）→ 短期（会话）→ 长期（跨会话）', '向量检索 + 重要性评估 + 时间衰减 = 高效回忆'], ['agent', 'memory', 'rag']),

    q('ai_agent', 'medium', 'short_answer', 'Agent 的安全防护：提示注入防御',
      '讨论 Agent 面临的安全威胁和防御。提示注入（Prompt Injection）——间接注入（外部内容）和直接注入（用户输入）。输出安全——敏感信息过滤。工具调用权限的最小化。沙箱执行环境。安全审计和监控。',
      'Agent 安全：\n\n1. **提示注入类型**：\n   - **直接注入**：用户输入伪装为系统指令\n   - **间接注入**：外部内容（网页、文档）中隐藏恶意指令\n   - 注出（Exfiltration）：诱导 Agent 发送敏感信息到外部\n\n2. **防御策略**：\n   - **输入净化**：过滤可疑指令格式\n   - **上下文隔离**：分隔系统指令和用户输入\n   - **指令前缀**：`以下是非指令内容：`\n   - **权限限制**：工具调用受限\n\n3. **输出安全**：\n   - 禁止输出 API Key/Token\n   - 敏感信息脱敏\n   - 输出内容安全检查\n\n4. **沙箱执行**：\n   - 代码执行：容器沙箱 / 限制网络访问\n   - 限制 Agent 对文件系统的访问范围\n   - 禁止执行高危命令\n\n5. **监控**：\n   - 记录所有 Agent 行为\n   - 异常行为检测\n   - 敏感操作审批',
      ['间接注入（外部内容藏指令）比直接注入更难防御', '最小权限 + 沙箱 + 审计 = Agent 安全基石'], ['agent', 'security', 'prompt-injection']),

    q('ai_agent', 'medium', 'short_answer', 'Agent 的成本控制与 Token 优化',
      '讨论 Agent 系统的成本策略。Token 消耗的拆解——系统提示 + 工具定义 + 上下文 + 历史。减少 Token 消耗的方法——压缩历史、精简工具描述。缓存策略——重复的 LLM 调用缓存。模型路由——简单任务用小模型、复杂任务用大模型。',
      'Agent 成本优化：\n\n1. **Token 消耗拆解**：\n   - System Prompt：10-30% 总消耗\n   - Tool Definition：工具越多消耗越大\n   - Conversation History：随轮次增加\n   - Output：生成内容\n\n2. **压缩策略**：\n   - 历史摘要：压缩旧轮次为摘要（提取关键信息）\n   - 动态工具选择：只加载当前任务相关的工具\n   - 精简 prompt：移除不必要的指令\n\n3. **缓存**：\n   - 相同请求 → 直接返回缓存结果\n   - Prompt Cache（Anthropic）：缓存 System Prompt 长前缀\n   - 查询结果缓存（避免多次相同查询）\n\n4. **模型路由**：\n   - 分类器判断任务难度\n   - 简单（翻译/格式化）→ Haiku/Sonnet\n   - 复杂（推理/代码）→ Opus/Sonnet\n   - 路由节省 40-60% 成本\n\n5. **预算控制**：\n   - 每次调用设置 max_tokens\n   - 每轮/每月 Token 配额\n   - 超量告警自动降级',
      ['历史摘要 + 动态工具加载 = 最有效的 Token 压缩', '模型路由节省 40-60%（简单任务用小模型）'], ['agent', 'cost', 'optimization']),

    q('ai_agent', 'hard', 'short_answer', 'Agent 评估基准与测试框架',
      '讨论 Agent 的评估方法论。基准测试：GAIA、AgentBench、WebArena 的测试范围和局限性。评估维度：任务完成率 + 效率 + 安全性 + 稳定性。自动评估 vs 人工评估。测试框架的实现——环境模拟 + 断言 + 评分。',
      'Agent 评估：\n\n1. **基准测试**：\n   - **GAIA**：多步推理和工具调用（真实世界任务）\n   - **AgentBench**：操作系统 + Web + 代码 + 游戏\n   - **WebArena**：Web 任务（购物/论坛/项目管理）\n   - **SWE-bench**：软件工程任务\n\n2. **评估维度**：\n   - **任务完成率**：成功完成的比例\n   - **效率**：步骤数、工具调用次数、Token 消耗\n   - **安全性**：安全违规次数\n   - **稳定性**：相同任务的一致性\n   - **鲁棒性**：对抗干扰的表现\n\n3. **自动评估**：\n   - 规则判断（确定性结果比对）\n   - LLM-as-Judge：用另一个 LLM 评分\n   - 工具调用轨迹分析\n\n4. **人工评估**：\n   - 用户满意度评分\n   - 结果质量评级\n   - 错误分类\n\n5. **框架**：\n   - LangSmith / LangFuse\n   - Weights & Biases Prompts\n   - 测试矩阵：多模型 × 多任务 × 多配置',
      ['GAIA 测试多步推理，WebArena 测试 Web 交互', '自动评估（LLM-as-Judge）+ 人工评估 = 完整评估体系'], ['agent', 'evaluation', 'benchmark']),

    q('ai_agent', 'medium', 'short_answer', 'Agent 的流式输出与实时交互',
      '讨论 Agent 的流式输出机制。LLM 的流式输出——SSE（Server-Sent Events）协议。工具调用前的流式思考过程。流式输出中的工具调用处理——思考流 + 工具调用分隔。客户端实时展示 Agent 思考过程的设计。',
      'Agent 流式输出：\n\n1. **SSE 协议**：\n   - `data: {"type": "text", "content": "正在思考..."`\n   - `data: {"type": "tool_call", "name": "search", "args": "..."`\n   - `data: {"type": "tool_result", "content": "..."`\n   - `data: [DONE]`\n\n2. **思考过程流式**：\n   - Agent 生成思考内容 → 实时推送给用户\n   - 用户看到「Agent 正在…」→ 更好的透明度\n   - 流式思考时可以中断 Agent\n\n3. **工具调用处理**：\n   - 思考文本流式输出（用户可见思考过程）\n   - 工具调用参数收集（对用户透明）\n   - 工具执行后 → 结果流式返回\n\n4. **客户端展示**：\n   - 思考气泡 + 工具调用卡片 + 结果展示\n   - 工具调用可以折叠/展开\n   - 支持用户反馈（中止、重新执行）\n\n5. **挑战**：\n   - 流式中的格式化（Markdown 解析）\n   - 工具调用和思考的时序对齐\n   - 连接断开恢复',
      ['SSE 流式输出让 Agent 思考过程透明', '思考 + 工具调用 + 结果分阶段展示提升用户体验'], ['agent', 'streaming', 'realtime']),

    q('ai_agent', 'hard', 'short_answer', 'Agent 的观察与行动日志分析',
      '讨论 Agent 日志分析和调试方法。Agent 执行的完整日志——Thinking Chain + Tool Calls + Results。日志的结构化存储。Agent 执行的回放（Replay）——逐步回放排查问题。常见失败模式的日志特征。',
      'Agent 日志分析：\n\n1. **日志结构**：\n   - 每轮：Thought → Action → Observation\n   - 完整请求-响应记录\n   - Token 消耗和时间戳\n   - 错误信息和异常\n\n2. **结构化存储**：\n   - JSONL 格式（每行一个事件）\n   - 关联 Trace ID\n   - 存入日志系统（ELK/Loki）\n\n3. **执行回放**：\n   - 读取日志 → 在界面上逐步展示\n   - 支持慢速/快速播放\n   - 查看任意步骤的 LLM 响应\n\n4. **失败模式**：\n   - **循环**：重复发出相同工具调用\n   - **幻觉**：工具调用参数错误/不存在\n   - **上下文丢失**：工具结果太长被截断\n   - **超时**：Agent 长时间无响应\n\n5. **调试工具**：\n   - 搜索引擎：按 Trace ID/错误类型检索\n   - 统计面板：成功率、平均步骤数、失败原因分布\n   - **对比**：相同任务不同模型的执行轨迹',
      ['Think → Act → Observe 的结构化日志是调试基础', '回放工具让你逐步检查 Agent 的每一步'], ['agent', 'observability', 'logging']),

    q('ai_agent', 'medium', 'short_answer', 'Agent 的上下文窗口管理策略',
      '讨论长上下文管理。上下文的组成：System Prompt + Tools + History + New Input。上下文窗口溢出的问题。滑动窗口——保留最新 N 轮。摘要压缩——将历史摘要填入上下文。结构化上下文——固定位置存储关键信息，历史滚动。',
      '上下文窗口管理：\n\n1. **窗口组成**：\n   - System Prompt（固定位置）\n   - Tool Definitions（工具描述）\n   - Conversation History（交互历史）\n   - Current Input（新输入）\n\n2. **滑动窗口**：\n   - 保留最近 N 轮完整对话\n   - 旧轮次 → 摘要压缩\n   - 窗口大小根据模型上下文长度动态调整\n\n3. **摘要压缩**：\n   - 旧轮次 → LLM 生成摘要\n   - 保留关键信息：目标、已完成的步骤、结果、未解决的问题\n   - 摘要 + 最近的 K 轮完整内容\n\n4. **结构化上下文**：\n   - 固定区域：目标、已获取的关键信息、当前计划\n   - 滚动区域：最近交互、工具调用结果\n   - 分离：重要的不丢失，不重要的可丢弃\n\n5. **技巧**：\n   - 工具结果太长 → 截断到合适长度\n   - 中间结果 → 存入外部存储（文件/DB）\n   - 定期刷新上下文: 重建摘要',
      ['滑动窗口 + 摘要压缩 = 最实用的上下文管理', '结构化上下文分离固定区域（目标/计划）和滚动区域（历史）'], ['agent', 'context-window']),

    q('ai_agent', 'hard', 'short_answer', 'Agent 的 Embodiment: 浏览器自动化',
      '讨论 Agent 在浏览器环境中的交互。Playwright/Puppeteer 的浏览器工具集成。DOM 提取和交互——Accessibility Tree vs DOM Tree。视觉 grounding——截图 + 元素的坐标定位。Page 级别的操作抽象（点击/输入/滚动/导航）。',
      'Agent 浏览器自动化：\n\n1. **工具抽象**：\n   - `navigate(url)`、`click(element)`、`type(text)`\n   - `extract_text(selector)`、`extract_table(selector)`\n   - `scroll(direction)`、`screenshot()`\n\n2. **DOM 交互方式**：\n   - **Accessibility Tree**：语义化、更简洁、交互友好\n   - **DOM Tree**：完整但冗长（需要精简化）\n   - **视觉**：截图 + OCR/元素定位\n\n3. **元素定位**：\n   - 通过文本匹配（最可靠）\n   - XPath/CSS Selector 定位\n   - 视觉定位（点击屏幕坐标）\n   - 多种策略结合\n\n4. **页面状态管理**：\n   - 等待元素可见 → 操作\n   - 处理弹窗/跳转\n   - 多 Tab/Frame 切换\n\n5. **挑战**：\n   - SPA（单页应用）的动态 DOM\n   - Modal/Dialog 的遮挡\n   - 反爬虫检测\n   - 页面加载超时',
      ['Accessibility Tree 比 DOM Tree 更适合 Agent（简洁语义化）', '多策略定位：文本匹配 > 视觉定位 > CSS 选择器'], ['agent', 'browser-automation']),

    q('ai_agent', 'hard', 'short_answer', 'Agent 的多模态感知与视觉推理',
      '讨论多模态 Agent 的视觉处理能力。图片输入——截图/图表/文档的多模态理解。视觉推理——从图片中提取信息 + 推理。截图 grounding——Agent 在截图上定位目标和操作。多模态 Agent 的视频理解。',
      '多模态 Agent：\n\n1. **图片理解**：\n   - 截图分析：UI 布局、按钮状态\n   - 图表理解：柱状图/折线图/饼图数据提取\n   - 文档 OCR：扫描文档的文字提取\n\n2. **视觉推理**：\n   - 图表 → 总结趋势（「Q2 收入增长 20%」）\n   - 对比多张图 → 识别差异\n   - 流程图 → 提取步骤\n\n3. **屏幕定位**：\n   - Agent 看到截图 → 标记目标区域\n   - 坐标映射到实际屏幕\n   - 支持：点击坐标、输入文字、拖拽\n\n4. **Video**：\n   - 关键帧提取 → 多帧分析\n   - 视频内容总结\n   - 实时摄像头流的推理\n\n5. **局限**：\n   - 图片分辨率（Token 消耗大）\n   - 小文字难以识别\n   - 复杂图表可能误读',
      ['多模态 Agent = 视觉输入 + 文本推理 + 基于坐标的互动', '截图 grounding 实现屏幕上的精确定位和操作'], ['agent', 'multimodal', 'vision']),

    q('ai_agent', 'hard', 'short_answer', 'Agent 细粒度路由与子 Agent 调度',
      '讨论 Agent 的调度架构。路由 Agent——根据任务类型分派给子 Agent。子 Agent（Specialist Agent）的注册和发现。任务队列和优先级调度。Agent 的路由策略——基于规则 vs 基于语义。调度系统的监控和负载均衡。',
      'Agent 调度：\n\n1. **路由架构**：\n   - **入口 Agent**：分析任务类型、复杂度、领域\n   - **路由策略**：\n     - 规则路由：关键词/正则匹配 → 子 Agent\n     - 语义路由：Embedding + 匹配阈值\n     - 混合路由：规则兜底 + 语义判断\n\n2. **子 Agent 注册**：\n   - Agent 描述：`name + 能力描述 + 适用场景`\n   - 支持动态注册和下线\n   - 子 Agent 的能力声明\n\n3. **任务队列**：\n   - 优先级队列（urgent > normal > background）\n   - 并发控制（单个 Agent 最大任务数）\n   - 超时处理\n\n4. **调度策略**：\n   - **最少负载**：分配给当前最空闲的子 Agent\n   - **能力匹配**：选择最匹配的\n   - **亲和性**：同一任务类型分配到同一 Agent（缓存命中率高）\n\n5. **监控**：\n   - 各子 Agent 的负载、成功率、响应时间\n   - 自动扩缩容\n   - 降级策略（子 Agent 不可用 → 走备选）',
      ['路由 Agent + Specialist Agent = 细粒度分工', '混合路由（规则 + 语义）平衡效率和灵活性'], ['agent', 'routing', 'orchestration']),

    q('ai_agent', 'medium', 'short_answer', 'Agent 的代码解释器（Code Interpreter）',
      '讨论 Agent 的代码执行沙箱。代码解释器的架构——Python 沙箱 + 文件系统 + 网络限制。Jupyter 内核的集成——代码 + 输出的迭代执行。数据分析和可视化的代码执行。代码安全——禁止敏感操作。',
      'Code Interpreter：\n\n1. **沙箱架构**：\n   - **容器化**：Docker 隔离（推荐）\n   - **限制**：CPU/内存/时间/网络\n   - **文件**：临时文件系统（用完即焚）\n   - **Python 版本**：常用库预装\n\n2. **Jupyter 内核**：\n   - 代码块 + 输出（文本/图片/表格）\n   - 状态跨代码块保持（变量共享）\n   - 编译和运行的分离\n\n3. **数据场景**：\n   - Pandas 分析数据\n   - Matplotlib/Plotly 画图\n   - 支持 pip install 额外包\n\n4. **安全限制**：\n   - 禁用：subprocess/open/socket/requests\n   - 限制：文件系统读写权限\n   - 超时：单代码块执行时间\n   - 危险库：禁止导入\n\n5. **应用场景**：\n   - 数据分析 Agent\n   - 自动报告生成\n   - 数学计算和可视化',
      ['容器化沙箱 + 预装库 + 文件隔离 = Code Interpreter 基础', 'Jupyter 内核让代码分段执行并保持状态'], ['agent', 'code-interpreter']),

    q('ai_agent', 'medium', 'short_answer', 'Agent 的偏好学习与个性化',
      '讨论 Agent 学习用户偏好的机制。显式偏好——用户主动设置的规则。隐式偏好——从交互历史中学习。个性化策略库——存储用户特有的处理方式。偏好冲突的解决。多用户的个性化隔离。',
      'Agent 个性化：\n\n1. **显式偏好**：\n   - 用户设置规则：`每次回复用中文`、`代码示例用 Python`\n   - 偏好配置文件\n   - 交互式问答建立偏好\n\n2. **隐式学习**：\n   - 分析用户历史交互\n   - 用户纠正过的错误 → 记住\n   - 用户常用的格式和风格\n\n3. **策略存储**：\n   - 用户 ID → 偏好向量 | 规则列表\n   - 偏好优先级：显式 > 隐式 > 默认\n   - 偏好权重：根据使用频率调整\n\n4. **冲突处理**：\n   - 显式规则矛盾 → 优先最新设置\n   - 隐式和显式冲突 → 显式优先\n   - 不确定时询问用户\n\n5. **隐私考虑**：\n   - 偏好数据本地存储\n   - 用户可查看和删除偏好\n   - 不共享用户的个性化数据',
      ['显式规则（用户设置）> 隐式学习（历史分析）> 默认', '个性化数据隐私保护：本地存储 + 用户控制'], ['agent', 'personalization', 'preference']),

    q('ai_agent', 'hard', 'short_answer', 'Agent 的事件驱动与异步执行模型',
      '讨论 Agent 的异步和事件驱动执行。事件驱动架构——Agent 监听事件并响应。异步任务队列——任务提交 → Agent 后台执行。Webhook/回调机制——任务完成后通知。事件来源（Event Source）的多样性。长时间运行任务的进度推送。',
      'Agent 异步执行：\n\n1. **事件驱动**：\n   - Agent 订阅事件（文件变更/定时触发/消息到达）\n   - 事件 → Agent 判断处理\n   - 支持过滤和路由\n\n2. **异步队列**：\n   - 任务提交到队列（Redis/Celery/MQ）\n   - Agent Worker 消费执行\n   - 队列管理：优先级、重试、死信\n   - **优势**：解耦、水平扩展、持久化\n\n3. **回调通知**：\n   - 任务状态变更 → Webhook 通知\n   - 支持：进度更新、任务完成、错误\n   - 回调地址可在提交时指定\n\n4. **事件来源**：\n   - 定时（Cron）\n   - 文件系统（Watch）\n   - 消息队列\n   - Webhook\n   - 用户消息\n\n5. **长时间任务**：\n   - 进度轮询 API\n   - WebSocket 实时推送\n   - SSE 进度流\n   - 任务取消/暂停/恢复',
      ['事件驱动 + 异步队列 = 可扩展的 Agent 架构', 'Webhook 回调通知任务状态（进度/完成/错误）'], ['agent', 'async', 'event-driven']),

    q('ai_agent', 'medium', 'short_answer', 'Agent 的 RAG 与非结构化知识检索',
      '讨论 Agent 与 RAG 的深度集成。文档切分策略——按段落/章节/语义边界。检索策略——Hybrid Search（向量 + 关键词）。检索结果的重排序（Re-ranking）。Agent 与 RAG 交互——Agent 决定何时检索、检索什么。',
      'Agent + RAG：\n\n1. **文档处理**：\n   - 切分：段落（固定大小）、章节（按标题）、语义（embedding 聚类）\n   - 元数据：来源、日期、类型\n   - 索引：向量索引 + 关键词索引（BM25）\n\n2. **检索策略**：\n   - **向量搜索**：语义相似度\n   - **关键词搜索**：精确匹配（BM25/Elasticsearch）\n   - **Hybrid Search**：两者加权融合\n   - **Re-ranking**：第一次检索后重排\n\n3. **Agent 检索行为**：\n   - 自主决定：何时需要检索、搜索什么\n   - 多轮检索：先宽后窄（先概览再深入）\n   - 检索结果评估：是否有用、是否需要重新搜索\n\n4. **上下文注入**：\n   - 检索结果注入 LLM 上下文\n   - 多段结果的合并和去重\n   - 限制总 token 数\n\n5. **优化**：\n   - 查询扩展：重写为更好的搜索词\n   - 分块大小：根据文档类型调整\n   - 缓存：高频查询结果缓存',
      ['Hybrid Search（向量 + 关键词）优于单一检索方式', 'Agent 自主决定检索策略（多轮 + 评估）'], ['agent', 'rag', 'retrieval']),

    q('ai_agent', 'hard', 'short_answer', 'Agent 的强化学习与反馈循环',
      '讨论 Agent 通过 RLHF/DPO 的用户反馈学习。用户隐式反馈——是否修改 Agent 输出、是否重试。显式反馈——点赞/点踩、评分。反馈数据的收集和存储。反馈驱动的 Agent 行为改进。在线 vs 离线学习的平衡。',
      'Agent 反馈学习：\n\n1. **隐式反馈**：\n   - 用户修改输出 → 偏好修正\n   - 重新生成 → 之前版本不好\n   - 超时未操作 → 默认接受？不确定\n   - 复用一种输出风格 → 用户偏好\n\n2. **显式反馈**：\n   - 👍/👎 评分\n   - 星级评价\n   - 文字反馈\n\n3. **数据收集**：\n   - 交互 + 反馈 = 训练数据\n   - 存储：用户 ID + Agent 输出 + 反馈\n   - 隐私：去标识化\n\n4. **改进方法**：\n   - **Prompt 调整**：根据反馈优化 prompt\n   - **模型微调**：RLHF/DPO 批量训练\n   - **规则更新**：用户偏好加入规则库\n\n5. **在线 vs 离线**：\n   - 在线：实时调整行为（偏好规则立即生效）\n   - 离线：批量训练模型更新\n   - 混合：规则实时 + 模型定期',
      ['隐式反馈（修改/重试）比显式反馈（评分）更丰富但更难解析', '规则实时生效 + 模型定期微调 = 双重反馈循环'], ['agent', 'reinforcement-learning', 'feedback']),

    q('ai_agent', 'medium', 'short_answer', 'Agent 的系统提示（System Prompt）设计',
      '讨论 Agent System Prompt 的设计原则。System Prompt 的结构：角色定义 + 能力边界 + 行为规则 + 输出格式。Prompt 的版本管理。Prompt 注入防护。Prompt 性能测试（A/B 测试）。不同场景的 Prompt 模板管理。',
      'System Prompt 设计：\n\n1. **结构框架**：\n   - **角色定义**：你是谁、能做什么、不能做什么\n   - **能力边界**：明确工具列表和使用时机\n   - **行为规则**：如何处理错误、何时求助、回复风格\n   - **输出格式**：JSON/Markdown/Tool Call 格式\n\n2. **版本管理**：\n   - Prompt 版本号（git 管理）\n   - 变更日志（什么改了、为什么改）\n   - 多版本 A/B 测试\n\n3. **防护**：\n   - 指令和输入隔离（标记用户输入）\n   - 安全规则在 Prompt 首尾重复\n   - 输出过滤约束\n\n4. **A/B 测试**：\n   - 同一任务对比不同 Prompt\n   - 指标：任务完成率、Token 消耗、用户满意度\n   - 统计显著性检验\n\n5. **模板管理**：\n   - 按使用场景分类：通用对话/编程/数据分析\n   - 变量替换：{user_name}, {context}\n   - 条件分支：按任务类型选择模板段',
      ['System Prompt = 角色 + 边界 + 规则 + 格式', '版本管理 + A/B 测试驱动 Prompt 优化'], ['agent', 'prompt-engineering']),

    q('ai_agent', 'hard', 'short_answer', 'Agent 的长时任务与断点续做',
      '讨论长时间运行 Agent 任务的保存和恢复。任务状态快照——关键中间状态的序列化。检查点（Checkpoint）机制——定时保存 Agent 状态。断点续做——Agent 从检查点恢复执行。暂停和恢复 API。长时任务的超时处理。',
      'Agent 长时任务：\n\n1. **状态快照**：\n   - 当前目标 + 已完成步骤 + 中间结果\n   - Agent 的思考链和决策历史\n   - 工具调用的返回结果\n\n2. **Checkpoint 机制**：\n   - 每完成一个子任务保存快照\n   - 快照持久化到存储（DB/文件）\n   - 恢复时：加载最近快照 + 重建上下文\n\n3. **断点续做**：\n   - 从快照恢复 → 重建上下文\n   - 验证已完成步骤（结果是否仍有效）\n   - 继续未完成计划\n\n4. **暂停/恢复 API**：\n   - POST /tasks/{id}/pause → 保存快照 + 停止执行\n   - POST /tasks/{id}/resume → 加载快照 + 继续\n   - GET /tasks/{id}/status → 查看进度\n\n5. **超时处理**：\n   - 单任务最大执行时间\n   - 空闲超时（Agent 循环等待）\n   - 超时 → 保存当前进度 + 通知用户\n   - 支持用户决定「继续等待」还是「放弃」',
      ['Checkpoint 快照 = 目标 + 进度 + 中间结果 + 思考链', 'Pause/Resume API 让用户控制长任务的执行节奏'], ['agent', 'long-running', 'checkpoint']),

    q('ai_agent', 'hard', 'short_answer', 'Agent 的 Guardrails 与约束系统',
      '讨论 Agent 行为约束（Guardrails）的实现。Guardrails 的类型：输入校验 + 输出校验 + 行为约束。Guardrails 的执行时机——调用前/调用后。Guardrail 的规则引擎。Guardrail 违规的处理策略。',
      'Agent Guardrails：\n\n1. **Guardrail 类型**：\n   - **输入 Guardrail**：检查用户输入是否安全\n   - **输出 Guardrail**：检查生成内容是否合规\n   - **行为 Guardrail**：检查工具调用是否在权限内\n   - **上下文 Guardrail**：检查 Agent 是否偏离话题\n\n2. **执行时机**：\n   - 调用前：输入通过 Guardrail 再传给 LLM\n   - 调用后：LLM 输出通过 Guardrail 再返回\n   - 工具调用后：检查工具调用结果\n\n3. **规则引擎**：\n   - 关键词/正则规则\n   - LLM-as-Judge 评估\n   - 策略决策树\n   - 优先级：拒绝 > 警告 > 记录\n\n4. **违规处理**：\n   - **拒绝**：阻断执行（安全违规）\n   - **替换**：脱敏敏感信息\n   - **警告**：记录但允许执行\n   - **记录**：仅日志\n\n5. **实现方案**：\n   - Guardrails AI、NeMo Guardrails\n   - 自定义规则 JSON\n   - 分级策略（宽松/严格/自定义）',
      ['Guardrails = 输入校验 + 输出校验 + 行为约束', '违规处理：拒绝 > 替换 > 警告 > 记录'], ['agent', 'guardrails', 'safety']),

    q('ai_agent', 'medium', 'short_answer', 'Agent 的工作流引擎与 DAG 编排',
      '讨论 Agent 的工作流引擎。DAG（有向无环图）定义 Agent 工作流——节点（步骤）+ 边（依赖）。工作流引擎的调度——并行执行条件分支。工作流的状态管理。工作流的可视化和监控。工作流重试和补偿。',
      'Agent 工作流：\n\n1. **DAG 表示**：\n   - 节点：Agent 的原子操作（工具调用、LLM 生成、条件判断）\n   - 边：执行依赖关系\n   - **示例**：搜索 → [解析结果 → 摘要生成]（并行）→ 报告生成\n\n2. **调度执行**：\n   - 拓扑排序 → 无依赖的节点并行\n   - 条件分支：if/else 选择后续\n   - 循环：重复执行直到条件满足\n\n3. **状态管理**：\n   - 每个节点状态：pending/running/completed/failed/skipped\n   - 全局变量在节点间传递\n   - 分支合并（Join）的变量聚合\n\n4. **可视化**：\n   - DAG 图展示工作流\n   - 实时进度：已执行/执行中/待执行\n   - 错误高亮\n\n5. **可靠性**：\n   - 节点重试（可配置次数）\n   - 错误处理：跳过/重试/终止\n   - 补偿节点：失败时执行清理\n   - 框架：LangGraph、Temporal、Dagster',
      ['DAG 工作流 = 并行 + 条件分支 + 循环 + 状态管理', 'LangGraph/Temporal 是主流 Agent 工作流框架'], ['agent', 'workflow', 'dag']),

    q('ai_agent', 'medium', 'short_answer', 'Agent 的人机协作（Human-in-the-Loop）',
      '讨论 Agent 与人类的协作模式。Human-in-the-Loop 的触发条件——高风险操作/需要人类判断。Agent 暂停等待人类输入。人类审批流程。Agent 建议 + 人类决策的模式。协作界面设计。',
      'Human-in-the-Loop：\n\n1. **触发时机**：\n   - 高风险操作（删除文件、发送邮件、支付）\n   - 需要人类判断（选方案、确认内容）\n   - 信息不足需要补充\n   - 多次重试失败\n\n2. **暂停机制**：\n   - Agent 暂停执行 → 等待人类响应\n   - 超时时间（默认等待后自动回退）\n   - 人类可以查看当前上下文\n\n3. **审批流程**：\n   - 单审：一人通过即可\n   - 会签：需要多人审批\n   - 条件审批：特定条件下需要审批\n\n4. **协作模式**：\n   - **监督**：人类监控，Agent 执行\n   - **顾问**：Agent 建议，人类决策\n   - **助手**：人类执行，Agent 辅助\n\n5. **界面设计**：\n   - 审批请求卡片（什么操作 + 什么风险）\n   - 一键通过/拒绝\n   - 修改后审批',
      ['Human-in-the-Loop 在「高风险+低频率」场景最有效', '审批流：单审 > 会签 > 条件审批（按风险等级）'], ['agent', 'human-in-the-loop']),

    q('ai_agent', 'hard', 'short_answer', 'Agent 的幻觉检测与事实核查',
      '讨论 Agent 输出的事实核查。幻觉类型：事实错误、逻辑矛盾、来源捏造。检索增强事实核查——将输出与知识库对比。外部工具验证——搜索验证、代码执行验证。Agent 的自检查和修正。',
      'Agent 幻觉检测：\n\n1. **幻觉类型**：\n   - **事实错误**：陈述与实际不符\n   - **来源捏造**：引用不存在的论文/URL\n   - **逻辑矛盾**：前提和结论不一致\n   - **时间错误**：过时/未来信息\n\n2. **检索增强验证**：\n   - Agent 输出 → 提取事实陈述 → 检索知识库 → 比对\n   - 不一致 → 标记可疑\n   - 多重验证：同一事实从多个来源确认\n\n3. **外部验证**：\n   - 引用链接 → 访问验证\n   - 代码 → 执行验证\n   - 数据 → 计算验证\n   - 统计 → 交叉验证\n\n4. **自检查**：\n   - Agent 检查自己的输出\n   - 「断案式」检查：反过来质疑自己的结论\n   - 输出置信度评分\n\n5. **用户交互**：\n   - 标注不确定的内容\n   - 提供来源链接\n   - 允许用户报告错误\n   - 错误 → 学习（避免类似的幻觉）',
      ['事实核查 = 检索验证 + 外部确认 + 自检查', 'Agent 标注不确定内容 + 提供来源 = 用户信任关键'], ['agent', 'hallucination', 'fact-checking']),

    q('ai_agent', 'medium', 'short_answer', 'Agent 的 prompt 链与思维链',
      '讨论 Agent 的推理增强技术。Chain-of-Thought（CoT）——引导 LLM 逐步推理。Tree-of-Thought（ToT）——多分支推理 + 评估 + 回溯。ReAct 框架——推理 + 行动的交替。Self-Consistency——多路推理 + 投票。',
      'Agent 推理增强：\n\n1. **Chain-of-Thought（CoT）**：\n   - 让 LLM 写出推理步骤\n   - Few-shot CoT：提供几个推理示例\n   - Zero-shot CoT：`Let us think step by step`\n   - **效果**：数学/逻辑问题提升 10-30%\n\n2. **Tree-of-Thought（ToT）**：\n   - 每一步生成多个可能的推理分支\n   - 评估每条分支的可行性\n   - 回溯：无效分支退回重试\n   - 适合需要探索的问题\n\n3. **ReAct 框架**：\n   - Thought → Action → Observation 循环\n   - Action 是工具调用\n   - Observation 是工具返回结果\n   - Agent 核心的推理-执行模式\n\n4. **Self-Consistency**：\n   - 多次推理同一问题（温度 > 0）\n   - 收集多个答案 → 投票/选择最一致的\n   - 提高推理稳定性\n\n5. **应用场景**：\n   - CoT：数学、逻辑推理、规划\n   - ToT：创意写作、问题求解\n   - ReAct：需要与外部交互的任务',
      ['CoT（逐步推理）+ ReAct（推理+行动）= Agent 推理核心', 'ToT 多分支探索适合开放性问题'], ['agent', 'reasoning', 'cot']),

    q('ai_agent', 'hard', 'short_answer', 'Agent 的知识库：结构化管理与增量更新',
      '讨论 Agent 知识库的设计。知识库的层级：全局知识（通用）→ 领域知识（专业）→ 用户知识（个性化）。知识的增量更新——不重建索引的添加。知识的自动爬取和清洗。知识库的版本管理。',
      'Agent 知识库：\n\n1. **层级结构**：\n   - **全局知识**：通用知识、百科、常识\n   - **领域知识**：技术文档、产品手册、行业报告\n   - **用户知识**：个人文档、笔记、偏好\n\n2. **增量更新**：\n   - 新文档 → 切分 → 向量化 → 添加到索引\n   - 不需要重新索引所有数据\n   - 删除文档时标记删除\n\n3. **自动爬取**：\n   - 定时爬取指定源（技术博客、文档站点）\n   - 去重和清洗\n   - 格式转换（HTML → Markdown）\n\n4. **版本管理**：\n   - 知识库版本号\n   - 回滚：恢复到旧版本\n   - 变更追踪：什么知识变了\n\n5. **质量保证**：\n   - 重复文档检测\n   - 过期内容标记\n   - 冲突知识标记供人工审核',
      ['全局 → 领域 → 用户：三层知识库覆盖不同范围', '增量更新支撑实时知识同步'], ['agent', 'knowledge-base']),

    q('ai_agent', 'hard', 'short_answer', 'Agent 的 MCP（Model Context Protocol）集成',
      '讨论 Agent 通过 MCP 协议与外部系统集成。MCP 的架构——Client（Agent）→ MCP Server（工具提供者）。MCP 的工具发现和能力声明。MCP 的认证和安全模型。MCP Server 的开发和部署。MCP 与 Function Calling 的对比。',
      'Agent MCP 协议：\n\n1. **MCP 架构**：\n   - **Client**：Agent（发起请求）\n   - **Server**：工具提供者（声明能力和工具）\n   - 通信：JSON-RPC over stdio/HTTP\n   - 每个 MCP Server 提供一组工具\n\n2. **工具发现**：\n   - Agent 连接 MCP Server → 获取工具列表\n   - 工具描述：名称 + 参数 Schema + 说明\n   - 工具按需加载（不使用时可以不加载）\n\n3. **安全模型**：\n   - 权限声明：MCP Server 声明需要哪些资源\n   - 用户审批：敏感操作需要用户批准\n   - 沙箱隔离：不同 MCP Server 间不共享状态\n\n4. **开发部署**：\n   - 任意语言实现（Python/JS/Go）\n   - 本地 stdio 或远程 HTTP\n   - 配置文件声明 MCP Server\n\n5. **MCP vs Function Calling**：\n   - Function Calling：LLM API 内置（参数 Schema）\n   - MCP：协议层工具管理（发现、认证、权限）\n   - MCP 更灵活（动态工具发现、热加载）\n   - 两者可以互补',
      ['MCP = Agent 的通用工具协议（发现 + 调用 + 认证）', '基于 MCP 的工具可以动态加载（不需要修改 Agent 代码）'], ['agent', 'mcp', 'protocol']),

    q('ai_agent', 'medium', 'short_answer', 'Agent 的语义缓存与结果复用',
      '讨论 Agent 对 LLM 调用结果和工具调用结果的缓存。语义缓存的匹配——语义相似度判断缓存命中。结果缓存的生命周期——TTL 和更新。缓存命中率的优化。Agent 缓存 vs 常规数据缓存的差异。',
      'Agent 语义缓存：\n\n1. **语义匹配**：\n   - Query Embedding → 向量库查相似\n   - 相似度 > 阈值 → 缓存命中\n   - 阈值调整：高 = 准确但少命中，低 = 多命中但可能不相关\n\n2. **缓存内容**：\n   - LLM 回答：相同问题的回答可直接复用\n   - 工具结果：相同查询的搜索结果可直接复用\n   - 摘要：文档摘要缓存\n\n3. **生命周期**：\n   - TTL：时间到期失效\n   - 事件失效：源变更 → 缓存失效\n   - 版本关联：缓存关联数据版本号\n\n4. **命中率优化**：\n   - 归一化查询（去除无关词）\n   - 多级缓存（精确 + 语义）\n   - 缓存预热（高频查询预加载）\n\n5. **Agent 缓存特色**：\n   - 工具结果缓存：相同参数 → 相同结果\n   - 推理缓存：相同问题 → 相似答案\n   - 对延迟敏感：缓存命中省 50-80% 时间',
      ['语义缓存通过向量相似度匹配近似问题', 'LLM 结果缓存 + 工具结果缓存 = 双重加速'], ['agent', 'caching']),

    q('ai_agent', 'medium', 'short_answer', 'Agent 的惩罚与奖励模型设计',
      '讨论 Agent 的奖励机制。任务级别奖励：完成率 + 质量 + 效率。步骤级别奖励：中间结果的正确性。惩罚机制——错误工具调用、循环检测、安全违规。奖励的规模化——多指标的归一化和加权。',
      'Agent 奖励模型：\n\n1. **任务完成奖励**：\n   - 二进制：完成/未完成（0/1）\n   - 完成度：部分完成的比例\n   - 质量评分：LLM-as-Judge 评分\n\n2. **效率奖励**：\n   - 步骤数：少步完成奖励高\n   - Token 消耗：低消耗奖励高\n   - 时间：快速完成奖励高\n\n3. **惩罚**：\n   - 无效工具调用：扣分\n   - 循环（不断重复失败）：扣分\n   - 安全违规：严重扣分（甚至标记失败）\n   - 帮助请求：适度惩罚（鼓励自主解决）\n\n4. **多维度聚合**：\n   - 加权和：完成率 × 0.5 + 质量 × 0.3 + 效率 × 0.2\n   - 归一化：每个指标标准化到 [0, 1]\n   - 阈值：低于阈值 → 任务失败\n\n5. **应用**：\n   - RLHF 训练数据\n   - Agent 行为评估\n   - Prompt 优化目标',
      ['奖励 = 完成率 + 质量 + 效率的加权组合', '惩罚循环和无效调用防止 Agent 浪费计算资源'], ['agent', 'reward-model']),

    q('ai_agent', 'hard', 'short_answer', 'Agent 与向量数据库的深度整合',
      '讨论 Agent 如何使用向量数据库增强知识管理。向量数据库的选择——Pinecone/Weaviate/Qdrant/Milvus vs Chroma。向量索引类型——IVF、HNSW 的对比。支持 Embedding 模型的集成。元数据过滤和混合搜索。Agent 自主创建和管理向量集合。',
      'Agent 向量数据库：\n\n1. **向量库对比**：\n   - **Pinecone**：全托管、简单、贵\n   - **Weaviate**：自托管、内建 GraphQL、混合搜索\n   - **Qdrant**：Rust 实现、高性能\n   - **Milvus**：大规模、分布式\n   - **Chroma**：轻量嵌入式\n\n2. **索引类型**：\n   - **IVF**：聚类 + 搜索最近聚类（高效但精度略低）\n   - **HNSW**：层级导航小世界图（高精度、内存大）\n   - **Flat**：暴力搜索（100% 精度、慢、小数据集）\n\n3. **Embedding 集成**：\n   - OpenAI Embeddings（text-embedding-3-*）\n   - 本地模型（BGE、E5）\n   - 多模态 Embedding（CLIP）\n\n4. **混合搜索**：\n   - 向量相似度 × 关键词匹配的加权结果\n   - 元数据过滤：按时间/来源/类型过滤\n   - Agent 可以组合过滤条件\n\n5. **Agent 自主操作**：\n   - 动态创建 collection\n   - 自主决定使用哪个向量库\n   - 管理索引参数',
      ['HNSW 高精度 vs IVF 高效率 = 索引选择核心权衡', '混合搜索（向量 + 元数据过滤）比纯向量搜索更精准'], ['agent', 'vector-database']),

    q('ai_agent', 'medium', 'short_answer', 'Agent 延迟优化：Prefill 与 Speculative Decoding',
      '讨论 Agent 感知延迟的优化技术。Prefill（Prompt 处理）加速——KV-Cache 复用。Speculative Decoding——用小模型草稿 + 大模型验证。Agent 的流式输出减少首 token 延迟。Agent 的并行工具调用。',
      'Agent 延迟优化：\n\n1. **KV-Cache 复用**：\n   - 系统 Prompts 的 KV-Cache 缓存\n   - 增量更新：只处理新增的输入\n   - 减少 Prefill 阶段 50-80% 延迟\n\n2. **Speculative Decoding**：\n   - 小模型生成草稿（快速）\n   - 大模型验证草稿（并行）\n   - 接受正确的 token（跳过重复生成）\n   - 加速 2-3x（要求小模型和大模型 vocab 一致）\n\n3. **首 Token 优化**：\n   - 流式：首 token 尽快到达\n   - Prompt 压缩（减少 prefill 数据量）\n   - 4-bit 量化减少推理延迟\n\n4. **并行工具调用**：\n   - 无依赖的工具同时调用\n   - 减少等待时间\n   - 模型输出多工具调用请求\n\n5. **延迟预算**：\n   - 每次 LLM 调用的时间预算\n   - 超时 → 降级策略\n   - 根据任务紧急程度动态调整',
      ['KV-Cache 复用减少 Prefill 延迟 50-80%', 'Speculative Decoding 用小模型加速大模型推理 2-3x'], ['agent', 'latency', 'optimization']),

    q('ai_agent', 'hard', 'short_answer', 'Agent 的决策透明度与可解释性',
      '讨论 Agent 的决策可解释性。思考链（Chain-of-Thought）的展示——Agent 的推理过程透明化。决策归因——Agent 为什么做这个选择。置信度评估——Agent 对结果的确信程度。可解释性对用户信任的影响。',
      'Agent 可解释性：\n\n1. **过程透明**：\n   - Agent 展示：目标 → 当前计划 → 执行进度\n   - 思考链（Thought）：Agent 的推理过程\n   - 工具调用：为什么用这个工具、参数是什么\n   - 结果评估：工具返回的结果如何被使用\n\n2. **决策归因**：\n   - 引用来源：`根据文档 X 的 Y 章节`\n   - 推理路径：从输入到结论的步骤链\n   - 备选方案：考虑了哪些其他可能\n\n3. **置信度**：\n   - 概率估计：`我 80% 确定这个方案可行`\n   - 不确定性来源标记：数据不足/假设前提\n   - 信息缺口：缺什么信息\n\n4. **用户信任影响**：\n   - 透明 → 用户理解 → 信任\n   - 解释错误 → 信任下降（比不解释更糟）\n   - 过度解释 → 信息过载\n   - 平衡点：展示关键推理 + 可展开详情\n\n5. **技术实现**：\n   - 结构化日志\n   - 可视化 DAG（依赖和决策路径）\n   - 自然语言解释生成',
      ['思考链展示 + 来源引用 + 置信度 = 可解释性三角', '过度解释比不解释更糟（信息过载）'], ['agent', 'explainability']),
]

def main():
    path = os.path.join(os.path.dirname(__file__), 'ai_agent.json')
    with open(path) as f:
        data = json.load(f)
    existing_titles = {q['title'] for q in data}
    added = 0
    for q_item in NEW:
        if q_item['title'] not in existing_titles:
            data.append(q_item)
            existing_titles.add(q_item['title'])
            added += 1
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f'Added {added} questions to {path}')
    print(f'Total ai_agent questions: {len(data)}')

if __name__ == '__main__':
    main()
