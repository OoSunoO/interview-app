#!/usr/bin/env python3
"""Expand ai_agent.json with 30 additional questions (20→50)."""
import json, os

def q(cat, diff, typ, title, content, answer, hints, tags):
    return dict(category=cat, difficulty=diff, type=typ, title=title,
                content=content, answer=answer, hints=hints, tags=tags)

NEW = [
    # ---- Agent 架构与设计模式 ----
    q('ai_agent', 'medium', '问答', 'Agent 的记忆系统：短期、长期与工作记忆',
      '讨论 Agent 记忆中短期记忆（Short-term）、长期记忆（Long-term）与工作记忆（Working Memory）的区别与实现方式。如何利用向量数据库（如 Chroma、Pinecone）实现 RAG 记忆检索？什么是记忆的"遗忘"机制？',
      'Agent 记忆系统：\n\n1. **短期记忆**：Context Window 内的信息（提示词 + 当前对话），容量有限但延迟最低。\n\n2. **长期记忆**：\n   - 存储在向量数据库中，通过嵌入索引\n   - 关键环节：记忆编码 → 存储 → 检索 → 重排序\n   - 检索策略：语义相似度、时间衰减加权、Mermaid 索引\n\n3. **工作记忆**：\n   - 当前任务的临时存储空间\n   - 用于多步推理中的中间结果\n   - 典型实现：基于 MCP 的文件系统或内部 dict\n\n4. **遗忘机制**：\n   - 时间衰减：旧记忆权重降低\n   - 重要性衰减：不重要信息优先丢弃\n   - 基于容量限制的缓存淘汰（LRU/LFU）\n\n5. **最佳实践**：\n   - 分层记忆：热点数据在内存、冷数据在向量库\n   - 记忆压缩：多条相关记忆合并为摘要\n   - 记忆反思：Agent 定期回顾和重组记忆',
      ['短期记忆 ≈ 上下文窗口、长期记忆 ≈ 向量数据库、工作记忆 ≈ 临时存储', '遗忘机制防止记忆膨胀和检索噪声', '记忆压缩和反思提升记忆质量'], ['agent', 'memory']),

    q('ai_agent', 'hard', '问答', 'Agent 的反思（Reflection）与自我改进',
      '解释 Agent 反思机制在 LLM Agent 中的作用。如何让 Agent 对自己的推理结果进行评估和修正？实现反思的关键技术包括：Self-Consistency、Self-Critique、Reflexion 模式、以及基于环境反馈的闭环学习。讨论这些方案各自的优劣。',
      'Agent 反思机制：\n\n1. **Self-Consistency**：\n   - 多次推理 → 投票选取最一致结果\n   - 简单有效但计算成本高\n\n2. **Self-Critique**：\n   - Agent 评估自己的输出（LLM as Judge）\n   - 检查逻辑漏洞、事实正确性、完整性\n   - 根据评估结果修正输出\n\n3. **Reflexion（反射）**：\n   - 执行 → 反馈 → 反思 → 记忆 → 下一轮\n   - 将失败经验写入短期/长期记忆\n   - 下次遇到类似任务避免同样错误\n\n4. **闭环学习**：\n   - 环境（env）执行 Agent 的动作 → 返回观察结果\n   - Agent 根据观察调整后续策略\n   - DPO/RLHF 微调使模型从错误中学习\n\n5. **方案对比**：\n   - Self-Consistency：不需要训练，适合一次性推理\n   - Reflexion：适合需要迭代改进的任务\n   - DPO 微调：最彻底的改进但需要数据收集\n   - 组合使用：Reflexion 做运行时改进、DPO 做长期固化',
      ['Reflexion 是执行→反馈→反思→改进的闭环', 'Self-Consistency 依赖多次推理投票', '运行时反思 + DPO 微调是完整的改进路径'], ['agent', 'reflection']),

    q('ai_agent', 'hard', '问答', 'Agent 的 Tool-Using 能力与 Function Calling 设计',
      '详细分析 LLM Agent 的 Tool-Using（工具使用）机制。Function Calling/Tool Call 在全训练和上下文学习两种方案中的实现差异。如何设计 Tool 的 Schema（参数定义、描述编写、结果格式）以提升 LLM 的调用准确率？',
      'Tool-Using 机制：\n\n1. **训练方案**：\n   - 在微调阶段注入 Tool 调用示例\n   - 模型学会在需要时输出特定格式的 Tool Call\n   - 代表：Gorilla、Toolformer\n   - 优势：调用更自然，不消耗上下文\n   - 劣势：不支持动态添加新工具\n\n2. **上下文方案**：\n   - 在 System Prompt 中定义 Tool Schema（OpenAI Function Calling、Anthropic Tool Use）\n   - 模型在需要调用工具时输出结构化 JSON\n   - 优势：动态工具集、零样本泛化\n   - 劣势：消耗上下文、调用准确率依赖 Schema 设计\n\n3. **Tool Schema 设计原则**：\n   - **描述清晰**：用完整的自然语言描述工具做什么、什么时候用\n   - **参数精简**：最少必要参数，避免冗余\n   - **命名语义化**：getUserWeather 好于 processData\n   - **结果结构化**：返回格式固定，方便后续解析\n   - **错误信息**：工具返回有帮助的错误描述\n\n4. **提高准确率的技术**：\n   - Semantic Router：根据用户意图预过滤工具\n   - Few-Shot 示例：在 Schema 中嵌入调用示例\n   - 结果验证：正则/JSON Schema 验证调用参数\n   - 重试策略：参数错误时返回具体错误信息让 Agent 修正',
      ['Tool Schema 描述质量是 LLM 调用准确率的关键', 'Function Calling 比训练方案更灵活（动态工具集）', 'Semantic Router 预过滤可大幅提升调用准确率'], ['agent', 'tool-use', 'function-calling']),

    q('ai_agent', 'medium', '问答', 'Agent 的多步骤规划（Multi-step Planning）',
      '探讨 LLM Agent 的多步骤规划能力。常见的规划策略有哪些：Chain-of-Thought、ReAct、Plan-and-Solve、Tree-of-Thoughts、Graph-of-Thoughts？各自适用于什么类型的任务？规划失败时的降级策略。',
      '多步骤规划：\n\n1. **CoT（Chain-of-Thought）**：\n   - 逐步推理，每一步基于上一步\n   - 适合：数学推理、逻辑推理\n   - 局限：线性，无法回溯\n\n2. **ReAct**：\n   - 推理（Thought）+ 行动（Action）+ 观察（Observation）循环\n   - 适合：需要外部交互的任务（搜索、执行命令）\n   - 优势：能根据环境反馈调整\n\n3. **Plan-and-Solve**：\n   - 先制定完整计划，再逐步执行\n   - 适合：复合任务（写代码、写文档）\n   - 优势：全局视野，避免局部最优\n\n4. **Tree-of-Thoughts**：\n   - 多条推理路径并行探索，回溯剪枝\n   - 适合：需要探索多个分支的任务（数学证明、创意写作）\n   - 优势：更好的全局搜索能力\n\n5. **Graph-of-Thoughts**：\n   - 非线性的推理图，支持分支合并\n   - 适合：需要综合多条思路的任务\n\n6. **降级策略**：\n   - 规划失败 → 重新规划（更换策略）\n   - 部分失败 → 子任务回滚重试\n   - 全部失败 → 退化为单步 ReAct',
      ['简单任务 CoT 足够，复杂任务 ToT/GoT 更好', 'Plan-and-Solve 适合已知步骤的复合任务', '规划系统需要内建错误恢复和降级策略'], ['agent', 'planning']),

    q('ai_agent', 'medium', '问答', 'Agent 与 RAG 系统的融合设计',
      '讨论 Agent 与 RAG（Retrieval-Augmented Generation）的结合方式。Agentic RAG 相比传统 RAG 有哪些改进？常见的集成模式：自我质疑 RAG（Self-querying）、自适应检索、多源检索融合、以及 Agent 作为检索路由器的设计。',
      'Agentic RAG：\n\n1. **传统 RAG 局限**：\n   - 固定检索策略（每次查）\n   - 无法判断是否需要检索\n   - 无法选择最佳数据源\n\n2. **Agentic RAG**：\n   - Agent 决定是否需要检索、查什么、查哪个源\n   - 支持多次检索 + 迭代优化\n   - 根据检索结果可能继续提问或变换策略\n\n3. **集成模式**：\n   - **Self-querying**：Agent 动态构造查询语句（含过滤器）\n   - **自适应检索**：确定已有知识够用就不再检索\n   - **多源融合**：从多个向量库/搜索引擎获取结果，Agent 综合判断\n   - **Router RAG**：Agent 作为路由——将问题分类到不同的检索管道\n\n4. **关键挑战**：\n   - 检索延迟：多次检索增加端到端耗时\n   - 信息冲突：不同源信息矛盾时如何仲裁\n   - 上下文窗口：检索结果过多挤占上下文\n   - 幻觉放大：错误的检索结果被 Agent 当作事实传播\n\n5. **最佳实践**：\n   - 检索时机：Agent 判断知识不足时才检索\n   - 检索结果压缩：Reranker + 摘要过滤\n   - 引用溯源：每个检索结果标注来源',
      ['Agentic RAG 比传统 RAG 更灵活——Agent 决定检索时机和策略', 'Self-querying 实现精细化检索，自适应检索降低延迟', '多源融合需要 Agent 仲裁机制处理信息冲突'], ['agent', 'rag', 'retrieval']),

    q('ai_agent', 'hard', '问答', 'Agent 的推理加速：Speculative Decoding 与 KV-Cache 优化',
      '讨论 Agent 应用中的推理加速技术。Speculative Decoding（推测解码）的原理是什么？KV-Cache 在 Agent 多轮交互中的作用和优化策略。Agent 流式输出对端到端延迟的影响以及如何利用流式处理加速推理。',
      'Agent 推理加速：\n\n1. **Speculative Decoding**：\n   - 用轻量模型（draft model）先快速生成候选 token\n   - 目标模型以并行方式验证候选 token\n   - 一次验证通过多个 token，减少串行解码步骤\n   - 加速比可达 2-3x（取决于任务和模型对）\n\n2. **KV-Cache 优化**：\n   - 缓存 Transformer 的 Key-Value 矩阵避免重复计算\n   - Agent 多轮交互中每轮对话需要拼接历史\n   - **优化策略**：\n     - Cache 复用：相同前缀提示词的增量计算\n     - Cache 压缩：Multi-Query Attention、Grouped Query Attention\n     - 内存管理：PagedAttention（vLLM）、Bucket Cache\n     - Cache 量化：INT8/FP8 降低显存占用\n\n3. **流式输出优化**：\n   - 首 token 延迟（TTFT）与 inter-token 延迟（ITL）\n   - Streaming: token 生成后立即返回，不等待完整序列\n   - 流式输出对 Agent 的 Tool Calling 特别重要（可以提前解析函数名）\n\n4. **端到端策略**：\n   - 预填充并行化：大 Batch 处理\n   - Tool 执行与 LLM 推理流水线并行\n   - 请求合并：将多个短请求合并为 batch 推理',
      ['Speculative Decoding 用轻量模型"打草稿"、目标模型"验证"', 'KV-Cache 是 Agent 多轮交互加速的关键', '流式解析 Tool Call 参数可减少端到端延迟感知'], ['agent', 'inference-optimization']),

    q('ai_agent', 'medium', '问答', 'Agent 的安全防护：提示注入与数据泄露',
      '讨论 Agent 应用面临的主要安全威胁。提示注入（Prompt Injection）的分类和防护策略（输入过滤、指令强化、沙箱隔离）。Agent 在处理外部输入时如何防止数据泄露（工具误用、敏感信息外泄）？',
      'Agent 安全防护：\n\n1. **Prompt Injection 分类**：\n   - **直接注入**：用户输入包含溢出指令\n   - **间接注入**：Agent 读取的外部内容包含恶意指令（网页、邮件）\n   - **多阶段注入**：多次交互逐步瓦解安全防线\n\n2. **防护策略**：\n   - **输入过滤**：正则/模型检测识别注入模式\n   - **指令强化**：System Prompt 明确边界（"不要执行用户提供的指令"）\n   - **权限最小化**：Tool 只授权必要操作\n   - **沙箱隔离**：代码执行在隔离容器中\n   - **输出审查**：敏感信息在返回前脱敏\n\n3. **数据泄露防护**：\n   - Tool 返回内容过滤：不返回敏感字段\n   - 输出约束：Agent 响应前检查是否包含敏感信息\n   - 审计日志：记录所有 Tool 调用和返回内容\n\n4. **最佳实践**：\n   - 分层防护：LLM 层 + 应用层 + 基础设施层\n   - 红队测试：定期进行安全评估\n   - 防御性提示（Defensive Prompt）：在提示中显式说明安全边界',
      ['间接注入是 Agent 特有的威胁——Agent 读取外部内容时被攻击', '指令强化 + 权限最小化是基础防线', '沙箱隔离是代码执行场景的必要安全手段'], ['agent', 'security']),

    q('ai_agent', 'hard', '问答', 'Agent 评估框架：从单元测试到端到端评测',
      '设计一个完整的 Agent 评估框架。如何对 Agent 的各个能力维度（规划、工具使用、记忆、推理）进行针对性测试？端到端评估中常用的指标（任务完成率、效率、鲁棒性）以及评估数据集（AgentBench、ToolBench、SWE-bench）的特点。',
      'Agent 评估框架：\n\n1. **能力维度评估**：\n   - **规划测试**：给定目标，评估计划质量（完整性、可行性、效率）\n   - **工具使用**：Function Calling 准确率、参数正确性\n   - **记忆**：检索准确率、记忆召回率\n   - **推理**：多步推理正确性\n\n2. **测试层级**：\n   - **单元测试**：单个 Tool 或 Planning Step 的边界情况\n   - **集成测试**：Tool 调用链、多步规划\n   - **E2E 测试**：完整任务完成情况\n   - **鲁棒性测试**：对抗输入、异常情况\n\n3. **评估指标**：\n   - **成功率**（Success Rate）：任务完全完成比例\n   - **效率**（Efficiency）：执行步骤数、调用次数、延迟\n   - **鲁棒性**（Robustness）：异常输入下的表现\n   - **成本**（Cost）：Token 消耗、API 调用费用\n\n4. **标注数据集**：\n   - **AgentBench**：跨平台 Agent 基准（OS、数据库、Web）\n   - **ToolBench**：工具使用基准\n   - **SWE-bench**：代码修复基准（GitHub Issue）\n   - **WebArena**：Web 任务基准\n\n5. **评估流程**：\n   - 离线评估（模拟环境）→ 在线评估（真实环境）\n   - 需要有 ground truth 或 agreement 标注\n   - 自动化评估 + 人工抽检',
      ['Agent 评估需要多维度：规划、工具使用、记忆、推理', 'SWE-bench 是代码 Agent 的事实标准', '离线评估 + 在线评估 + 人工抽检是完整方案'], ['agent', 'evaluation']),

    q('ai_agent', 'medium', '问答', 'Agent 的自我纠错（Self-Correction）机制',
      '分析 Agent 自我纠错能力的实现方式。何时应该自我纠错？（检测到错误 → 尝试修复 → 验证修复。）常见的纠错策略：重试（Retry）、回溯（Backtracking）、求助（Ask for Help）、回退到安全模式。实现自我纠错的关键挑战：循环检测。',
      '自我纠错机制：\n\n1. **纠错触发**：\n   - 运行时错误（Tool 返回异常、执行超时）\n   - 逻辑错误（推理结果与事实矛盾）\n   - 外部反馈（用户否认、系统拒绝）\n\n2. **纠错策略**：\n   - **Retry**：最简单，修正参数或步骤后重试\n   - **Backtracking**：回到上一步/上几步重新规划\n   - **Ask for Help**：向用户或更高级 Agent 求助\n   - **Fallback**：回到安全默认状态或简化版本\n\n3. **实现难点**：\n   - **循环检测**：Agent 反复尝试相同失败策略\n     - 解法1：限制最大重试次数\n     - 解法2：检测"重复模式"（相同的动作和结果）\n     - 解法3：引入随机扰动打破循环\n\n4. **最佳实践**：\n   - 每次纠错后记录到记忆（下次避免）\n   - 设置纠错次数上限防止无限循环\n   - 纠错后调整策略而非原样重试\n   - 复杂的纠错请求人类确认\n\n5. **循环检测实现**：\n   - 维护 (action, observation) 历史\n   - 检测 N 步内是否重复相同模式\n   - 检测到循环 → 切换策略（plan-and-solve → manual）',
      ['自我纠错需要检测循环防止无限重试', '每次纠错都应调整策略，不是原样重试', 'Backtracking + Retry + Ask for Help 形成纠错层级'], ['agent', 'self-correction']),

    q('ai_agent', 'hard', '问答', '多 Agent 辩论（Debate）与协作策略',
      '深入讨论多 Agent 系统中的辩论与协作模式。Agent 之间如何通过辩论提升决策质量？（SocraSynth、ChatEval 方法）。多 Agent 的投票机制（Majority Voting、Weighted Voting）与共识达成算法。辩论模式的成本与收益分析。',
      '多 Agent Debate：\n\n1. **Debate 模式**：\n   - **SocraSynth**：多 Agent 从不同角度辩论，主持人综合\n   - **ChatEval**：Agent 互相评估对方的推理\n   - **格式**：主张 → 反驳 → 辩护 → 综合\n   - **关键**：Agent 需要扮演不同角色（正/反/中立）\n\n2. **投票机制**：\n   - **Majority Voting**：每个 Agent 投票，取多数。简单但忽略专业度\n   - **Weighted Voting**：各 Agent 权重不同（基于专业领域/历史准确率）\n   - **Consensus Building**：多次辩论逐步收敛到共识\n   - **Ranked Voting**：排列偏好，综合排序\n\n3. **成本分析**：\n   - Token：N 个 Agent × 每个 Agent 的推理步骤\n   - 延迟：辩论轮次 × 每轮时间\n   - 收益：质量提升 ≈ 5-30%（任务复杂度越高收益越大）\n\n4. **实用建议**：\n   - 2-3 个 Agent 辩论 1-2 轮是性价比最优\n   - 对高风险决策使用 Debate（代码审阅、方案评审）\n   - 简单任务不需要 Debate\n   - 不同 Agent 配置不同模型/角色提升多样性',
      ['多 Agent Debate 通过角色扮演和反驳提升决策质量', '2-3 Agent × 1-2 轮辩论是性价比最优配置', 'Weighted Voting 比 Majority Voting 更适合专业领域'], ['agent', 'debate', 'multi-agent']),

    q('ai_agent', 'hard', '问答', 'Agent 编排框架：LangGraph 状态机核心原理',
      '分析 LangGraph 的底层实现原理。LangGraph 如何构建基于状态机的 Agent 工作流？StateGraph 的节点（Node）和边（Edge）机制、条件边（ConditionalEdge）实现动态路由、以及 Checkpointing 的持久化原理。对比 LangGraph 与 AutoGen 的异步消息传递机制。',
      'LangGraph 原理：\n\n1. **StateGraph**：\n   - **状态（State）**：全局的 TypedDict，在所有节点间传递\n   - **节点（Node）**：处理函数（接收 state → 返回 state 的部分更新）\n   - **边（Edge）**：节点间的连接\n   - **条件边（ConditionalEdge）**：根据当前状态/上一步输出路由到不同节点\n\n2. **工作流**：\n   - 构建图（add_node + add_edge）→ 编译（compile）→ 调用\n   - 编译时做拓扑排序检测\n   - 执行时通过 State 对象传递数据\n\n3. **Checkpointing**：\n   - 每步执行后自动保存状态快照\n   - 支持故障恢复和回退\n   - 存储 Channel 中的数据和 Config\n\n4. **与 AutoGen 对比**：\n   - AutoGen：基于 AssistantAgent → UserProxy 的消息循环\n   - LangGraph：显式的状态机图定义\n   - AutoGen 更灵活、LangGraph 更可预测\n   - LangGraph 适合确定性工作流，AutoGen 适合自由对话\n\n5. **关键特性**：\n   - **并行执行**：Fan-out 节点支持\n   - **循环**：有向图中的循环实现迭代\n   - **中断/恢复**：Human-in-the-Loop 支持',
      ['LangGraph 的核心是 StateGraph——一个有状态的有限状态机', '条件边实现基于结果的路由（如：成功→下一步，失败→重试）', 'Checkpointing 提供持久化和故障恢复能力'], ['agent', 'langgraph', 'orchestration']),

    q('ai_agent', 'medium', '问答', 'Agent 的 Reward 与反馈学习机制',
      '讨论 Agent 如何从反馈中学习。基于人类反馈的强化学习（RLHF）在 Agent 训练中的应用。DPO（Direct Preference Optimization）相比 RLHF 的优势。Agent 在运行时如何从环境反馈（成功/失败信号）中学习？',
      'Agent 反馈学习：\n\n1. **RLHF**：\n   - SFT → 收集人类偏好数据 → 训练 Reward Model → PPO 优化\n   - Agent 场景：偏好数据需要对 Agent 完整轨迹评分\n   - 局限：Reward Model 训练成本高、PPO 不稳定\n\n2. **DPO**：\n   - 直接优化偏好（不需要 Reward Model）\n   - 损失函数直接表达"好的回答概率 > 差的回答概率"\n   - 训练更稳定、资源需求更低\n   - 适合 Agent 场景的分段 DPO（对不同轨迹段分别优化）\n\n3. **环境反馈学习**：\n   - 交互时：执行 → 成功/失败信号 → 记录轨迹\n   - 离线学习：从成功/失败轨迹中提取教训\n   - 在线学习：在允许的环境中试错\n\n4. **实现方式**：\n   - Trajectory-level：整条轨迹评分\n   - Step-level：每步评分\n   - Outcome-based：只看最终结果\n   - Process-based：每步的中间结果也参与评分\n\n5. **生产实践**：\n   - 收集用户对 Agent 回复的点赞/踩\n   - 定期用收集的数据做 DPO 微调\n   - 记录失败轨迹作为测试用例',
      ['DPO 比 RLHF 更简单稳定（不需要 Reward Model）', 'Trajectory-level 和 Step-level 反馈各有适用场景', '运行时失败轨迹是最有价值的训练数据'], ['agent', 'rlhf', 'dpo']),

    q('ai_agent', 'medium', '问答', 'Agent 系统的可观测性架构',
      '设计一个 Agent 系统的可观测性架构。需要监控的关键指标：LLM 调用延迟与 Token 消耗、Tool 执行成功/失败率、Agent 步数与规划质量、端到端任务完成率。如何通过 OpenTelemetry 实现 LLM 调用的 Tracing？',
      'Agent 可观测性：\n\n1. **关键指标**：\n   - **LLM**：延迟（TTFT/ITL）、Token 消耗、可用性、Error Rate\n   - **Tool**：调用次数、成功/失败率、执行时间\n   - **Agent**：步数、规划时间、状态转换\n   - **业务**：任务完成率、用户满意度\n\n2. **OpenTelemetry 实现**：\n   - LLM 调用：Span（LLM Span）记录请求/响应、Token 数\n   - Tool 调用：Span 记录 Tool 执行\n   - Agent 步骤：嵌套 Span 关联 LLM 调用和 Tool 执行\n   - 传播：Trace ID 贯穿用户请求到 Agent 完整执行\n\n3. **日志结构化**：\n   - 每个 Agent step 记录：Thought、Action、Observation\n   - JSON 格式日志含 trace_id、step_number、cost、latency\n   - 错误详情：错误类型、堆栈、上下文\n\n4. **告警策略**：\n   - 延迟告警：P99 LLM 延迟 > 阈值\n   - 错误告警：Tool 失败率 > 5%\n   - 业务告警：任务完成率下降\n   - 成本告警：Token 消耗异常增长\n\n5. **工具选型**：\n   - Tracing：OpenTelemetry → Jaeger/Tempo\n   - Metrics：Prometheus + Grafana\n   - Logging：ELK/Loki\n   - Agent-specific：LangSmith、Weights & Biases Prompts',
      ['嵌套 Span（LLM Span → Tool Span → Agent Step）提供完整调用链', 'Agent 步数和规划质量是系统健康的核心指标', 'LangSmith 等专用工具比通用可观测性更适合 Agent 调试'], ['agent', 'observability']),

    q('ai_agent', 'medium', '问答', 'Agent 的上下文压缩与关键信息提炼',
      '分析 Agent 在长对话/长任务场景下的上下文管理。如何压缩和提炼历史信息以控制 Token 消耗？常见策略：滑动窗口、摘要压缩、结构化记忆、以及对过去步骤的自动摘要。对比各种方案的 Recall 质量与 Token 节省比。',
      '上下文压缩策略：\n\n1. **滑动窗口**：\n   - 保留最近 N 轮对话，丢弃更早的\n   - 简单但丢失早期重要信息\n   - Token 节省：固定比例（取决于窗口大小）\n\n2. **摘要压缩**：\n   - 定期将早轮对话压缩为摘要\n   - 摘要策略：extractive（提取关键句）vs abstractive（重新概括）\n   - Token 节省：50-80%，但可能丢失细节\n\n3. **结构化记忆**：\n   - 将历史信息分类存储（决策、事实、偏好）\n   - 每类只保留最新/最重要的\n   - 查询时按需检索相关历史\n\n4. **自动摘要**：\n   - Agent 每完成一个子任务，生成任务摘要\n   - 后续步骤只保留摘要 + 完整上下文 2 选 1\n   - 推荐：摘要保留80%关键信息，节省60% Token\n\n5. **对比**：\n   - 滑动窗口：Recall < 30%，Token 节省可预测\n   - 摘要压缩：Recall 60-80%，Token 节省 50-80%\n   - 结构化记忆：Recall 70-90%，实现复杂\n   - 最佳实践：混合策略（窗口 + 摘要 + 结构化记忆）',
      ['没有免费午餐——压缩率越高信息损失越大', '混合策略：最近 N 轮用窗口 + 更早的用摘要 + 关键事实结构化', '定期（每 N 步或 Agent 判断上下文紧张时）执行压缩'], ['agent', 'context-management']),

    q('ai_agent', 'medium', '问答', 'Agent 的决策可解释性与推理透明度',
      '讨论如何提高 Agent 决策过程的透明度。解释 Agent 的"为什么这样做"的技术：Chain-of-Thought 输出、决策树可视化、Tool 调用链路展示。Agent 如何向用户提供可信赖的解释？XAI（可解释 AI）技术在 Agent 系统中的应用。',
      'Agent 可解释性：\n\n1. **运行时可解释**：\n   - **CoT 输出**：Agent 展示推理过程（"我在分析……"）\n   - **Tool 调用展示**：显示调用的工具和参数\n   - **中间结果**：展示步骤间的状态变化\n\n2. **事后可解释**：\n   - **决策树**：将 Agent 的选择过程可视化为决策树\n   - **关键节点**：标注影响决策的关键步骤\n   - **反事实解释**："如果……结果会不同"的分析\n\n3. **Tool 调用链路**：\n   - 展示调用顺序、输入输出\n   - 链路可视化（DAG 图）\n   - 归因分析：找到哪个工具调用决定了最终结果\n\n4. **XAI 技术**：\n   - LIME：局部近似解释单次决策\n   - SHAP：量化每个步骤的贡献\n   - Counterfactual：对比不同的决策路径\n\n5. **用户信任**：\n   - 透明 ≠ 可信——解释需要简洁易懂\n   - 过度解释降低用户体验\n   - 核心原则：对关键决策提供简明的 Why + How',
      ['CoT 输出是最直接的可解释性手段', 'Tool 调用链路展示让用户理解 Agent 的行动过程', '简洁的解释比完整的透明更能建立信任'], ['agent', 'explainability', 'xai']),

    q('ai_agent', 'medium', '问答', 'Agent 的定价与成本建模',
      '如何为 Agent 系统建立成本模型？分析 Agent 每次交互的成本构成：LLM 调用（输入/输出 Token 成本）、Tool 执行、向量数据库查询。如何优化 Agent 的 Token 消耗？介绍缓存策略（语义缓存、KV-Cache 复用）、Prompt 压缩技术、以及模型选择策略。',
      'Agent 成本建模：\n\n1. **成本构成**：\n   - LLM 成本：输入 Token + 输出 Token（占总成本 60-80%）\n   - Tool 成本：API 调用费、计算资源\n   - 基础设施：向量库、数据库、网络\n   - 每 Agent 交互 ≈ 5,000-50,000 Token\n\n2. **Token 优化策略**：\n   - **语义缓存**：相似请求命中缓存（如 Redis）\n   - **Prompt 压缩**：精简 System Prompt、移除冗余\n   - **KV-Cache 复用**：共享前缀的推理请求\n   - **模型选择**：简单任务用小模型（如 Haiku/Flash 替代 Sonnet/Pro）\n   - **Batch 处理**：非实时请求批量推理\n\n3. **模型选择策略**：\n   - 路由（Semantic Router）：简单任务 → 小模型、复杂任务 → 大模型\n   - Cascade：先小模型尝试，失败/不自信时升级大模型\n   - 成本收益：小模型成本是大模型的 1/10-1/20\n\n4. **成本优化案例**：\n   - 缓存命中率 30% → 整体成本降低 20-25%\n   - 小模型处理 50% 请求 → 成本降低 35-40%\n   - 成本优化不能牺牲核心质量：关键路径用大模型',
      ['LLM 调用占 Agent 成本 60-80%', '语义缓存 + 模型路由是最有效的降本手段', '成本优化需要在核心路径保证质量（关键路径用大模型）'], ['agent', 'cost-optimization']),

    q('ai_agent', 'hard', '问答', 'Agent 的动作空间设计与约束',
      '讨论 Agent 动作空间（Action Space）的限制与约束。连续动作空间 vs 离散动作空间在 Agent 设计中的权衡。如何通过动作约束（Action Masking/Constrained Decoding）确保 Agent 只能执行合法操作？实现约束解码的技术方案：JSON 模式输出、正则约束、Pydantic 验证。',
      'Agent 动作空间：\n\n1. **动作空间类型**：\n   - **离散动作**：有限选择（点击按钮、选择菜单项）\n   - **连续动作**：连续值（输入坐标、滑动条、文本输入）\n   - **组合动作**：离散 + 连续参数（函数调用）\n\n2. **动作约束**：\n   - **Schema 约束**：每个工具定义参数 Schema（JSON Schema）\n   - **JSON 模式输出**：强制 LLM 输出符合 JSON 格式\n   - **Constrained Decoding**：解码时只采样合法 Token（如 Outlines、JsonFormer）\n   - **Pydantic 验证**：工具调用后做类型和值范围验证\n\n3. **Constrained Decoding 实现**：\n   - Outlines：用 FSM 约束解码路径\n   - JsonFormer：CFG 引导合法 JSON 输出\n   - Guidance：模板引擎约束输出格式\n   - 优势：语法保证、无需重试\n   - 劣势：降低解码速度、不支持所有模型后端\n\n4. **设计原则**：\n   - 动作粒度：太粗（单一 API）不灵活，太细（原子操作）步骤过多\n   - 可选参数：尽量少，降低 LLM 决策维度\n   - 错误反馈：动作非法 → 返回具体的合法范围',
      ['Constrained Decoding 从生成层面保证动作合法性', '动作粒度需要在灵活性和效率间平衡', 'Pydantic/JSON Schema 验证是运行时保证（后置）'], ['agent', 'action-space']),

    q('ai_agent', 'hard', '问答', 'Agent 的持续学习与自适应能力',
      '讨论 Agent 如何在生产环境中持续学习和适应新环境。Online Learning（在线学习）、Experience Replay（经验回放）、以及 Few-shot Adaptation（少样本适应）在 Agent 场景中的应用。Agent 如何从成功的轨迹中提取"经验"并迁移到类似任务？',
      'Agent 持续学习：\n\n1. **在线学习**：\n   - 运行时收集交互数据（状态、动作、结果）\n   - 成功轨迹作为正样本、失败轨迹作为负样本\n   - 定期用新数据微调\n   - 局限：灾难性遗忘（Catastrophic Forgetting）\n\n2. **经验回放**：\n   - 存储多条轨迹\n   - 训练时随机采样混合新旧数据\n   - 缓解灾难性遗忘\n   - Buffer 管理：优先级采样（更多失败经验）\n\n3. **少样本适应**：\n   - 提供 2-3 个新领域的成功示例\n   - Agent 从示例中推断策略\n   - 不需要梯度更新，适用于所有模型\n\n4. **经验迁移**：\n   - 从成功轨迹中提取"经验片段"（短动作序列）\n   - 存储到长期记忆\n   - 新任务中检索相似经验\n   - RAG for Agent：用向量库索引经验\n\n5. **实践方案**：\n   - 生产收集轨迹 → 离线评估 → 人工标注 → 差异化微调\n   - 冷启动：seed examples → 热启动：自我改进循环',
      ['经验回放 + 优先级采样是缓解灾难性遗忘的常用方法', '少样本适应通过示例引导 Agent 行为，不需要梯度更新', 'RAG for Agent 用向量索引实现经验的跨任务迁移'], ['agent', 'continual-learning']),

    q('ai_agent', 'medium', '问答', 'Agent 的用户意图理解与任务推断',
      '探讨 Agent 如何理解用户的真实意图。当用户指令模糊或不完整时，Agent 应如何澄清和推断？常见的意图理解技术：任务分解猜测、上下文补全、主动提问。设计一个 Agent 在处理模糊指令时的交互流程。',
      '用户意图理解：\n\n1. **模糊指令处理**：\n   - **缺乏参数**：识别缺少的关键信息，主动提问\n   - **目标模糊**：请求范围，提供几个可能的解释\n   - **隐含假设**：基于上下文推断合理假设（可以确认）\n\n2. **任务分解猜测**：\n   - 将模糊目标分解为可能的子任务\n   - 对每个子任务评估可行性和合理性\n   - 向用户展示分解结果确认\n\n3. **上下文补全**：\n   - 历史对话补全：引用之前讨论过的信息\n   - 环境上下文：当前访问的页面/文件/项目\n   - 用户画像：已知的用户偏好和习惯\n\n4. **交互流程建议**：\n   - 尝试理解 → 列出关键假设 → 请求确认\n   - 不要猜测不合理的细节\n   - 提供 2-3 个可能方案让用户选择\n   - 允许用户在过程中修正\n\n5. **设计原则**：\n   - Agent 应在不确定时主动澄清，而不是猜测\n   - 过多的确认询问降低体验（需要平衡）\n   - 对确定性高的推断可以直接执行并在结果中说明假设\n   - 从用户的修正反馈中学习偏好',
      ['Agent 在不清晰时应主动澄清而非猜测', '提供 2-3 个可能解释让用户选择是效率最高的澄清方式', '高确定性推断可直接执行但需说明假设'], ['agent', 'intent-understanding']),

    q('ai_agent', 'medium', '问答', 'Agent 的 Token 经济：高效利用上下文窗口',
      '讨论 Agent 如何高效管理 Token 预算。System Prompt 压缩、历史对话摘要、工具描述精简的技术。Context Window 满时的处理策略：滑动窗口丢弃 vs 关键信息提炼 vs 多轮摘要。Token 预算在 Agent 各组件间的合理分配。',
      'Token 经济：\n\n1. **Token 预算分配**：\n   - System Prompt：15-20%（核心指令+工具定义）\n   - 历史对话：40-50%（压缩后的历史）\n   - 当前输入：10%（用户当前请求）\n   - 中间推理：20-30%（CoT + 上下文）\n\n2. **System Prompt 压缩**：\n   - 精简角色描述（去掉冗余修饰）\n   - 工具定义用简洁描述（去掉多余参数说明）\n   - 使用 Token 更少的表述\n   - 可节省 30-50% 的 System Prompt Token\n\n3. **历史处理策略**：\n   - **滑动窗口** + 摘要：近 5 轮完整保留，更早的摘要\n   - **分块摘要**：按任务分块，每块一个摘要\n   - **关键事实抽取**：只保留影响未来决策的事实\n\n4. **工具描述精简**：\n   - 移除"safe to use"等冗余描述\n   - 参数描述使用最短语义表达\n   - Group 相关工具减少 Schema 重复\n\n5. **满窗口处理**：\n   - 触发压缩（自动或 Agent 判断）\n   - → 生成当前状态的摘要\n   - → 丢弃最旧最不相关的部分\n   - → 通知用户"信息已压缩"',
      ['System Prompt + 工具描述是最容易优化的 Token 消耗点', '滑动窗口 + 摘要的混合策略是 Token 节省和 recall 的最佳平衡', 'Token 预算需要在各组件间合理分配'], ['agent', 'token-economy']),

    q('ai_agent', 'hard', '问答', 'Agent 的时间感知与任务调度',
      '如何让 Agent 理解时间约束并进行任务调度？Agent 的时间感知能力（理解"立即"、"每 5 分钟"、"下周二"等时间概念），定时任务的调度机制（类似 Cron 的 Agent 调度），以及任务依赖关系的管理。讨论 Agentic Scheduler 的设计。',
      'Agent 时间感知：\n\n1. **时间理解**：\n   - 自然语言时间解析："next Monday" → 具体日期\n   - 相对时间："in 2 hours" → 绝对时间戳\n   - 循环时间："every weekday at 9 am" → Cron 表达式\n   - Agent 需要内置时间解析器和时区处理\n\n2. **任务调度架构**：\n   - **Scheduler Agent**：负责任务编排和触发\n   - **任务队列**：待调度的任务\n   - **触发器**：时间触发、事件触发、条件触发\n   - **执行器**：Worker Agent 执行具体任务\n\n3. **依赖管理**：\n   - DAG 依赖：任务 A → 任务 B → 任务 C\n   - 并行调度：无依赖的任务并行执行\n   - 重试策略：失败后间隔重试\n\n4. **Agentic Scheduler 设计**：\n   - Scheduler 本身也是一个 Agent\n   - 接收用户的自然语言调度请求\n   - 解析时间/条件 → 创建定时任务\n   - 执行时唤醒 Worker Agent\n\n5. **生产实践**：\n   - 用 APScheduler / Celery Beat 做底层调度引擎\n   - Agent 层做自然语言转调度配置\n   - 支持暂停/取消/修改等运行时管理',
      ['时间感知需要自然语言时间表达 → 绝对时间戳的解析能力', 'Agentic Scheduler 本身就是 Agent，解析自然语言调度请求', '底层用 APScheduler/Celery + 上层 Agent 语义层'], ['agent', 'scheduling']),

    q('ai_agent', 'medium', '问答', 'Agent 的版本管理与回滚策略',
      '讨论 Agent 应用的版本管理。Agent 的行为由 System Prompt、Tools、Model 共同决定，如何对这三者进行版本管理？Agent 的 A/B 测试方案（Prompt 变更 → 效果评估 → 灰度发布）。出现问题时如何快速回滚？',
      'Agent 版本管理：\n\n1. **版本组成**：\n   - **System Prompt 版本**：指令变更 → 行为变化\n   - **Tool 版本**：API 变化 → Agent 调用方式适配\n   - **Model 版本**：模型更新 → 输出质量变化\n\n2. **版本管理方案**：\n   - **Prompt 版本控制**：存储在 Git 中，每个 PR 审查\n   - **配置管理**：用 Config Center（Apollo/Consul）管理 Agent 配置\n   - **Schema Registry**：Tool Schema 注册和版本化（类似 Avro Schema Registry）\n   - **Model 固定**：生产环境固定模型版本（不自动升级）\n\n3. **A/B 测试**：\n   - 流量切分：10% 新版本 vs 90% 老版本\n   - 评估指标：成功率、用户满意度、Token 成本\n   - 统计显著后才全量切换\n   - 需要完善的埋点和评估系统\n\n4. **回滚方案**：\n   - **快照回滚**：每次发布备份完整配置\n   - **权重回滚**：负载均衡器切回老版本\n   - **Shadow 部署**：新版本处理真实请求但不对用户展示\n\n5. **最佳实践**：\n   - 所有配置变更走代码审查流程\n   - 灰度周期至少 24-48 小时\n   - 保留 N-2 版本的快速回滚能力',
      ['Agent 的版本 = System Prompt + Tool Schema + Model 三元组', 'Prompt 变更必须有灰度验证，不能直接全量', '固定生产模型版本，避免意外行为变化'], ['agent', 'versioning']),

    q('ai_agent', 'medium', '问答', 'Agent 的系统提示工程最佳实践',
      '讨论为 Agent 设计 System Prompt 的最佳实践。Agent 的 System Prompt 与普通 Chat 应用的 System Prompt 有何不同？如何定义 Agent 的身份、能力边界、行为规则？工具描述如何组织以提升 LLM 工具选择的准确率？',
      'Agent System Prompt：\n\n1. **Agent vs Chat Prompt 差异**：\n   - Agent 需要更结构化的指令（状态、动作、工具）\n   - 需要明确决策边界（什么自己做、什么用工具）\n   - 需要多轮交互的上下文管理指令\n\n2. **Prompt 结构**：\n   - 身份定义：你是谁、你的能力边界\n   - 行为规则：如何处理不确定性、何时求助\n   - 工具使用指南：每个工具何时使用、参数说明\n   - 输出格式：结构化输出要求\n   - 安全约束：不可做什么\n\n3. **工具描述优化**：\n   - 按使用频率/业务领域分组\n   - 每个工具以"用途：一句话说明"开头\n   - 参数描述包含类型、范围、示例\n   - 明确参数依赖关系（A 参数和 B 参数互斥）\n\n4. **常见错误**：\n   - 过度约束：太多规则让 Agent 无所适从\n   - 自相矛盾：不同规则之间冲突\n   - 不够具体："be helpful" vs "当用户问代码问题时给出示例"\n\n5. **测试方法**：\n   - Prompt 变更后回归测试工具调用准确率\n   - 使用 Prompt 测试框架评估响应质量\n   - Edge Case 注入测试边界行为',
      ['Agent Prompt 比 Chat Prompt 需要更多的结构化和行为边界', '工具描述的质量 > 工具的数量', 'Prompt 变更必须有回归测试验证工具调用准确率'], ['agent', 'prompt-engineering']),

    q('ai_agent', 'hard', '问答', 'Agent 的知识库集成与实时信息查询',
      '讨论 Agent 如何高效集成多个知识源。静态知识（文档）用 RAG 检索，动态知识（API）用实时查询，结构化知识（数据库）用 SQL 查询。Multi-source Knowledge Integration 的设计模式：知识路由器、结果融合、冲突解决。',
      'Agent 知识集成：\n\n1. **知识分类**：\n   - **静态知识**：文档、FAQ、知识库 → RAG（向量检索）\n   - **动态知识**：天气、股票、新闻 → API 调用\n   - **结构化知识**：用户数据、订单 → DB 查询（Tool）\n   - **经验知识**：历史成功案例 → 经验检索\n\n2. **Multi-source 架构**：\n   - **知识路由器（Knowledge Router）**：Agent 根据问题类型选择数据源\n   - **结果融合（Result Fusion）**：多个来源结果组合：Reciprocal Rank Fusion\n   - **冲突解决**：不同来源信息矛盾 → 按来源可信度排序\n\n3. **查询策略**：\n   - **先路由再查询**：确定最佳源 → 只查该源（高效）\n   - **并行查询**：同时查多个源 → 综合最优结果（全面）\n   - **层级查询**：先查快速源 → 不满足再查深度源\n\n4. **实时性保证**：\n   - 缓存策略：静态知识长 TTL、动态知识短 TTL\n   - Cache-Aside：先查缓存 → 不命中查源 → 更新缓存\n   - 预缓存：预测可能需要的信息提前加载\n\n5. **最佳实践**：\n   - 明确标注信息来源（用户感知可靠性）\n   - 知识检索超时设置 + 优雅降级\n   - 定期评估各数据源的准确率和召回率',
      ['知识路由器根据问题类型选择最优数据源', 'RRF（Reciprocal Rank Fusion）是多源融合的标准方法', '来源标注增强用户对 Agent 回答的信任'], ['agent', 'knowledge-base']),

    q('ai_agent', 'medium', '问答', 'Agent 的多模态输入处理',
      '讨论 Agent 处理多模态输入（文字、图片、音频、代码）的能力。多模态 LLM（GPT-4V、Claude-3 Vision）如何集成到 Agent 中？Agent 如何根据不同输入类型选择不同的处理策略？多模态输入在 Tool 调用中的作用。',
      '多模态 Agent：\n\n1. **输入类型处理**：\n   - **图片**：截图识别、流程图理解、UI 元素定位\n   - **音频**：语音指令、会议记录处理、语音搜索\n   - **代码**：代码理解、diff 分析、结构化代码修改\n   - **文档**：PDF/Word 解析、表格提取\n\n2. **多模态 LLM 集成**：\n   - 模型选择：支持 Vision 的模型（GPT-4V、Claude-3 Sonnet/Opus、Gemini）\n   - 图片编码：Base64 或图片 URL\n   - 多模态 Token 消耗：一张图片 ≈ 几百到几千 Token\n\n3. **处理策略**：\n   - **类型检测**：Agent 先识别输入类型\n   - **分流处理**：图片 → Vision 模型解析、代码 → 语法分析工具\n   - **综合输出**：Agent 整合各模态结果\n\n4. **Tool 多模态**：\n   - Tool 可以接受图片作为参数\n   - 截图 Tool → 获取 UI 截图 → Agent 分析截图 → 决定下一步\n   - Agent 调用 OCR Tool → 提取图片文字\n\n5. **场景案例**：\n   - UI Agent：截图 + DOM 分析 → 操作浏览器\n   - 数据分析 Agent：图表图片 + 数据表 → 综合分析\n   - 文档 Agent：扫描 PDF → 提取结构化信息',
      ['多模态 Token 成本较高（一张图 ≈ 数百 Token）', 'Vision 能力使 Agent 能理解 UI 截图、图表、流程图', '多模态 Agent 需要根据不同输入类型路由到不同的处理管道'], ['agent', 'multimodal']),

    q('ai_agent', 'medium', '问答', 'Agent 的异常处理与优雅降级策略',
      '设计 Agent 的异常处理框架。当 Agent 依赖的服务（LLM、Tool、数据库）不可用或返回错误时，如何优雅降级？讨论重试策略、退避机制、替代方案（Fallback）和人工介入触发的设计模式。给出一个完整的异常处理层级。',
      'Agent 异常处理：\n\n1. **异常层级**：\n   - L1 — 瞬时错误：自动重试（网络超时、5xx）→ 3 次退避重试\n   - L2 — 部分失败：替代方案（一个 Tool 失败 → 换另一个 Tool）\n   - L3 — 持续失败：人工介入（标记为需人工处理）\n   - L4 — 灾难降级：返回友好的降级信息\n\n2. **重试策略**：\n   - 网络错误：立即重试 → 500ms → 2s → 5s（指数退避 + 抖动）\n   - 限流错误：等待 Retry-After header\n   - 认证错误：不重试，直接告警\n\n3. **降级模式**：\n   - **功能降级**：复杂功能 → 简单版本\n   - **数据降级**：实时数据 → 缓存数据\n   - **交互降级**：自主 → 确认每一步\n   - **结果降级**：精确回答 → "我无法完成，原因如下……"\n\n4. **监控与告警**：\n   - 降级次数统计\n   - 降级持续时间\n   - 触发人工介入的条件\n\n5. **实现要点**：\n   - 重试需要有上限（防止无限循环）\n   - 不同异常类型不同处理策略\n   - 降级后需要恢复机制（恢复检测 → 恢复正常模式）',
      ['四级异常体系：重试 → 替换 → 人工 → 降级', '指数退避 + 随机抖动是标准重试策略', '降级后需要有自动恢复机制'], ['agent', 'error-handling']),

    q('ai_agent', 'medium', '问答', 'Agent 与外部系统的认证与授权',
      '讨论 Agent 如何安全地集成外部系统。Agent 的认证凭据管理（API Key、OAuth Token、Session）如何在系统中存储和传递？Agent 的权限模型——Agent 能做什么不能做什么？最小权限原则在 Agent 设计中如何落地？',
      'Agent 认证授权：\n\n1. **凭据管理**：\n   - **存储**：使用密钥管理服务（Vault、AWS Secrets Manager）\n   - **不在 Prompt 中硬编码凭据**\n   - **临时凭据**：短期 Token（STS）而不是长期 API Key\n   - **凭据注入**：运行时注入环境变量或 Tool 参数\n\n2. **权限模型**：\n   - **Agent 角色**：每个 Agent 关联一个角色（reader/writer/admin）\n   - **Tool 权限**：每个 Tool 定义最低所需权限\n   - **资源隔离**：Agent 只能访问授权的数据\n   - **操作审计**：所有跨系统操作记录审计日志\n\n3. **OAuth 流程**：\n   - Agent 启动时请求用户授权\n   - 使用 OAuth Device Code Flow（无浏览器场景）\n   - 或预配置服务账号\n\n4. **最小权限原则**：\n   - 默认拒绝（Deny by Default）\n   - Agent 只获得当前任务需要的权限\n   - 任务完成后回收权限\n   - 重要操作需要额外授权（HITL）\n\n5. **安全建议**：\n   - Token 不能出现在 Agent 的对话历史和日志中\n   - 定期轮换凭据\n   - 每次 Tool 调用前验证权限',
      ['凭据存储用 Vault/Secrets Manager，不在 Prompt 中硬编码', '最小权限 = 默认拒绝 + 任务级授权 + 用完回收', 'OAuth Device Code Flow 是无浏览器 Agent 的标准授权方式'], ['agent', 'auth', 'security']),

    q('ai_agent', 'hard', '问答', 'Agent 的容错与自愈架构',
      '设计一个容错的 Agent 系统。Agent 运行时的故障检测（心跳、超时、异常）、故障隔离（舱壁模式 Bulkhead）、自愈策略（重启、回退、重建上下文）。讨论 Circuit Breaker（断路器）在 Agent Tool 调用中的实现。',
      'Agent 容错架构：\n\n1. **故障检测**：\n   - **心跳**：Agent 定期发送健康检查信号\n   - **超时**：每步执行设置超时限（LLM 调用、Tool 执行）\n   - **异常检测**：异常输出模式、无限循环检测、状态异常\n   - **阈值熔断**：错误率超过阈值触发熔断\n\n2. **故障隔离**：\n   - **Bulkhead（舱壁）**：不同 Agent 实例使用独立的资源池\n   - **线程隔离**：Agent 占用独立线程/进程\n   - **状态隔离**：Agent 状态的故障不影响其他 Agent\n\n3. **自愈策略**：\n   - **重启**：Agent 进程崩溃 → 自动重启 + 从 Checkpoint 恢复\n   - **回退**：长时间运行 Agent → 定期 Checkpoint → 失败回退到最近 Checkpoint\n   - **重建上下文**：Context 损坏 → 从记忆系统重建\n\n4. **Circuit Breaker（Tool 调用）**：\n   - **Closed**：正常调用\n   - **Open**：连续失败超过阈值 → 立即拒绝调用\n   - **Half-Open**：等待恢复时间 → 放行一个请求测试\n   - 状态变化发出事件\n\n5. **实现要点**：\n   - 所有的外部调用都需要超时设置\n   - 无状态 Agent 更容易容错\n   - 幂等 Tool 调用使重试安全',
      ['Bulkhead 隔离 Agent 实例避免故障传播', 'Circuit Breaker 防止连续 Tool 调用失败放大问题', 'Checkpoint + Rebuild 是 Agent 自愈的核心手段'], ['agent', 'fault-tolerance']),

    q('ai_agent', 'medium', '问答', 'Agent 的用户交互模式：Push vs Pull',
      '讨论 Agent 与用户的交互模式。Push 模式（Agent 主动推送信息）和 Pull 模式（用户主动发起）的适用场景。Agent 何时应该主动建议？何时应该静默等待？设计一个智能的交互触发策略——基于上下文重要性和紧急度判断。',
      'Agent 交互模式：\n\n1. **Push 模式**：\n   - Agent 主动推送通知、建议、告警\n   - 适用：定时任务完成、异常检测、重要提醒\n   - 风险：过度推送干扰用户\n\n2. **Pull 模式**：\n   - 用户主动发起对话或查询\n   - 适用：按需查询、指令执行\n   - 优势：用户控制节奏\n\n3. **智能触发策略**：\n   - **重要性**：高 → Push，低 → 静默\n   - **紧急度**：紧急 → Push（甚至打断），不紧急 → 非同步通知\n   - **上下文**：用户在专注工作 → 延迟推送\n   - **频率控制**：短时间多次触发 → 合并通知\n\n4. **交互设计原则**：\n   - 允许用户设置推送偏好\n   - 重要操作执行前确认（不是所有操作都推送）\n   - 推送消息提供快速操作入口\n   - 支持安静时段（Do Not Disturb）\n\n5. **实现**：\n   - Push：WebSocket、消息推送服务\n   - Pull：用户发起对话\n   - 混合：Agent 在有重要更新时推送摘要，用户拉取详情',
      ['Push 适合紧急/重要场景，Pull 适合按需查询', '智能触发基于重要度 + 紧急度 + 用户上下文', '允许用户设置推送偏好和安静时段'], ['agent', 'interaction']),

    q('ai_agent', 'hard', '问答', 'Agent 的 Graph 化工作流与 DAG 执行引擎',
      '讨论基于有向无环图（DAG）的 Agent 工作流引擎。与线性链式 Agent 相比，DAG 工作流在哪些场景有优势？如何设计 Agent 的 DAG 执行引擎——节点类型（Task/Decision/Parallel/Merge）、执行调度（Topological Sort）、条件分支和并行执行的实现。',
      'DAG Agent 工作流：\n\n1. **DAG 优势**：\n   - **并行**：无依赖的节点同时执行\n   - **条件分支**：根据中间结果选择路径\n   - **动态扩展**：可随时插入新节点\n   - **可观测性**：每一步的状态和执行时间清晰\n\n2. **节点类型**：\n   - **Task**：执行具体操作（LLM 调用、Tool 调用）\n   - **Decision**：条件判断 → 选择分支\n   - **Parallel**：分发到多个子任务\n   - **Merge**：合并多个分支结果\n   - **Transform**：数据转换和映射\n\n3. **执行调度**：\n   - 拓扑排序确定执行顺序\n   - 入度为 0 的节点可立即执行\n   - 节点完成 → 更新下游节点依赖计数\n   - 所有节点完成 → 工作流结束\n\n4. **引擎设计**：\n   - **定义时**：构建 DAG（Python DSL / YAML / UI）\n   - **运行时**：调度器 + 执行器 + 状态管理\n   - **持久化**：每步状态持久化到 DB（故障恢复）\n\n5. **框架对比**：\n   - **LangGraph**：状态机模型，支持循环\n   - **Temporal**：生产级 DAG 引擎，支持重试和超时\n   - **Prefect**：Python 原生 DAG，适合数据管道\n   - **Dify**：可视化 AI 工作流',
      ['DAG 工作流适合有并行/条件分支的复杂 Agent 任务', '拓扑排序 + 依赖计数是 DAG 执行的核心调度逻辑', 'LangGraph 和 Temporal 分别覆盖了灵活和生产级场景'], ['agent', 'dag', 'workflow']),

    q('ai_agent', 'medium', '问答', 'Agent 的资源管理与容器化部署',
      '讨论 Agent 应用的资源管理和部署策略。Agent 的内存使用分析（上下文窗口 → 内存增长模式）、CPU/GPU 资源需求（LLM 推理资源 vs Tool 执行资源）、以及如何利用容器（Docker/K8s）实现 Agent 的弹性部署和扩缩容。',
      'Agent 资源管理：\n\n1. **内存模型**：\n   - **上下文内存**：Prompt + 历史（随轮次增长）\n   - **状态内存**：Agent 运行时状态\n   - **缓存内存**：KV-Cache（推理占用）\n   - **外部队存**：向量库和知识库\n\n2. **资源评估**：\n   - 推理：GPU 显存（大模型需要 16-80GB）\n   - CPU：Tool 执行、数据处理（一般 2-8 核）\n   - 内存：Agent 实例（2-8GB）\n   - 存储：Checkpoint 和日志\n\n3. **容器化**：\n   - **Docker**：打包 Agent 及其依赖\n   - **K8s**：Deployment（无状态推理）+ StatefulSet（有状态 Agent）\n   - **资源限制**：requests/limits 防止资源争抢\n   - **水平自动扩缩**：HPA 基于 CPU/Memory/自定义指标\n\n4. **部署拓扑**：\n   - LLM 推理集群（GPU）＋ Agent 执行集群（CPU）\n   - 推理缓存（Redis）减少重复计算\n   - 消息队列解耦 Agent 步骤\n\n5. **成本优化**：\n   - GPU 实例竞价实例\n   - Agent 空闲时释放资源\n   - 推理请求 batch 处理提高 GPU 利用率',
      ['Agent 内存随对话轮次线性增长，需要压缩机制', '部署分离：GPU 推理集群 + CPU Agent 执行集群', 'HPA + 竞价实例是 Agent 弹性部署的标准方案'], ['agent', 'deployment']),

    q('ai_agent', 'medium', '问答', 'Agent 的合规与审计日志设计',
      '讨论 Agent 系统的合规要求。Agent 的决策日志如何设计以满足审计需求？日志需要记录哪些信息（决策理由、数据访问、修改操作、时间戳、操作人/Agent）？GDPR 等数据保护法规对 Agent 系统的要求。',
      'Agent 合规审计：\n\n1. **审计日志内容**：\n   - **身份**：用户 ID、Agent ID、Session ID\n   - **操作**：Tool 调用、参数、返回结果\n   - **数据访问**：读取/修改了哪些数据\n   - **决策理由**：为什么做这个操作（Thought 的一部分）\n   - **时间戳**：精确到毫秒\n   - **血缘**：当前操作由哪个上游请求触发\n\n2. **日志格式**：\n   - 结构化日志（JSON lines）\n   - 不可篡改（Append-only + 权限保护）\n   - 定期轮转和归档\n\n3. **GDPR 要求**：\n   - 用户有权查看 Agent 如何处理其数据\n   - 用户有权要求删除其数据（日志脱敏/删除）\n   - Agent 不能将用户数据传输到未批准的第三方\n   - 数据处理记录\n\n4. **安全实践**：\n   - **最小日志**：只记录必要信息，敏感数据脱敏\n   - **日志访问控制**：只有审计人员可查看完整日志\n   - **日志加密**：传输加密 + 存储加密\n   - **保留策略**：按法规要求设置保留期（如 90 天）\n\n5. **隐私设计**：\n   - Agent 不记录用户的原始输入（除非必要）\n   - PII（个人身份信息）自动检测和脱敏\n   - 用户可查看和导出 Agent 持有的个人信息',
      ['审计日志需要记录"谁在什么时候做了什么以及为什么"', '日志脱敏和访问控制是 Agent 合规的基础', 'GDPR 要求用户有权查看和删除 Agent 处理的个人数据'], ['agent', 'compliance', 'audit']),

    q('ai_agent', 'medium', '问答', 'Agent 模型的微调与适配',
      '讨论为特定 Agent 任务微调（Fine-tuning）基础模型的策略。什么时候应该微调？什么时候应该用 Prompt Engineering 就够了？微调 Agent 模型的数据构建（从成功/失败轨迹中提取训练数据）、LoRA 等高效微调技术、以及微调后的评估。',
      'Agent 微调策略：\n\n1. **微调 vs Prompt Engineering**：\n   - Prompt Engineering 够用 → 先用 Prompt（快速、低成本）\n   - 需要微调的场景：\n     - 复杂的工具调用格式需要固化\n     - Agent 需要特定领域的专业知识\n     - Agent 需要学习特定的交互模式\n     - 需要降低 Token 消耗（精简 Prompt）\n\n2. **数据构建**：\n   - **成功轨迹**：完整的 Agent 执行路径（输入 → 推理 → 工具调用 → 结果）\n   - **失败轨迹**：错误路径 + 正确的纠正\n   - **数据格式**：对话格式（role = system/user/assistant/tool）\n   - **数据增强**：对成功轨迹做变体\n\n3. **微调方法**：\n   - **全参数微调**：效果最好但成本最高\n   - **LoRA**：低秩适配，只训练 0.1-1% 参数\n   - **QLoRA**：量化 LoRA，单 GPU 可微调\n   - **Agent 微调**：关注 Tool Calling 格式和推理链\n\n4. **评估**：\n   - **工具调用准确率**：参数正确性\n   - **推理质量**：逻辑一致性、步骤完整性\n   - **任务完成率**：端到端成功率\n   - **Token 效率**：完成任务所需的步数和 Token 数',
      ['先 Prompt Engineering → Prompt 无法解决时再微调', 'LoRA/QLoRA 使 Agent 微调在单 GPU 上可行', '训练数据来自生产环境的成功/失败轨迹'], ['agent', 'fine-tuning']),
]

def main():
    path = os.path.join(os.path.dirname(__file__), 'ai_agent.json')
    with open(path) as f:
        data = json.load(f)
    before = len(data)
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
