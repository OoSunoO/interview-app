# -*- coding: utf-8 -*-
import json

questions = []

def q(cat, diff, typ, title, content, answer, hints, tags):
    questions.append({
        "category": cat,
        "difficulty": diff,
        "type": typ,
        "title": title,
        "content": content,
        "answer": answer,
        "hints": hints,
        "tags": tags
    })

# ==================== LLM Serving Infrastructure ====================

q("ai_infra", "hard", "short_answer",
  "LLM 推理引擎架构：vLLM / TensorRT-LLM",
  "LLM 推理引擎（vLLM、TensorRT-LLM、llama.cpp）的核心优化技术有哪些？PagedAttention 如何解决 KV Cache 的内存碎片问题？Continuous Batching 的原理是什么？",
  "LLM 推理引擎的核心优化目标：提高吞吐（throughput）和降低首 token 延迟（TTFT）。\n\nPagedAttention（vLLM 的核心创新）：传统 LLM 推理为每个请求的 KV Cache 预先分配连续内存（max_seq_len × hidden_dim × layers × 2），但实际请求的长度和内存使用高度可变→ 内部碎片严重（内部碎片平均约 60%）。PagedAttention 将 KV Cache 分页管理（类似 OS 的分页）：KV Cache 以固定大小的 Block（page）存储，非连续物理内存，按需分配。Block Table 管理逻辑 page → 物理 block 的映射。效果：内存利用率从 ~40% 提升到 ~95%，支持更大的 batch size 和更长的 context。\n\nContinuous Batching（持续批处理）：传统批处理：收集固定窗口的请求→全部完成生成→返回结果（等待所有序列完成）。Continuous Batching：一个序列完成生成后立即返回，让出 GPU 算力给下一个请求（不需要等待整个 batch）。Iteration-level scheduling：每个迭代（decode step）动态决定哪些序列参与 batch。效果：吞吐提升 2-4x（vs 静态 batching）。实现：每个序列维护自己的 KV Cache block table，调度器在每个 iteration 选择 ready 的序列加入 batch。\n\nTensorRT-LLM（NVIDIA）的额外优化：1）In-flight Batching——类似 Continuous Batching，但更灵活（支持抢占和优先级）。2）INT4/INT8/FP8 量化——使用 Weight-Only Quantization（W4A16、W8A16）在推理时动态反量化。3）Attention 优化——FlashAttention-2、PageAttention、Multi-Query Attention 实现。4）多 GPU 张量并行（Tensor Parallelism）——QKV 矩阵按 head 维度切分到多个 GPU。\n\nllama.cpp（CPU/边缘设备推理）：1）使用 GGUF 量化格式（比 GPTQ 更适合 CPU）。2）MMAP 加载模型——内存映射文件，模型加载零拷贝。3）针对 ARM NEON / x86 AVX2 优化的矩阵乘实现。\n\n扩展延伸：KV Cache 量化——将 KV Cache 从 FP16 量化为 INT8（减少 50% 内存），精度损失在 1-2% 以内。推测解码（Speculative Decoding）——用小模型 draft 若干个 token，大模型一次性验证，加速 2-3x。",
  ["PagedAttention 的 Block Table 映射——类似 OS 的分页机制解决 KV Cache 碎片", "Continuous Batching 为什么能提升吞吐——iteration-level 的动态调度"],
  ["vLLM", "推理", "PagedAttention", "LLM", "优化"])

q("ai_infra", "hard", "short_answer",
  "LLM 量化技术：GPTQ / AWQ / GGUF",
  "LLM 量化的原理是什么？PTQ（Post-Training Quantization）和 QAT（Quantization-Aware Training）的区别是什么？GPTQ、AWQ、GGUF 三种量化方案的各自特点和适用场景？",
  "LLM 量化将模型权重和激活从高精度（FP16/BF16）映射到低精度（INT8/INT4），减少内存占用和计算量。\n\n量化原理：浮点数 → 整数映射：x_int = round(x_float / scale) + zero_point。scale 决定映射范围，zero_point 处理非对称分布。PTQ（训练后量化）——模型训练完成后做量化，不需要重新训练。QAT（量化感知训练）——在训练过程中模拟量化效果（Forward 时做伪量化操作 Forward + FakeQuant），模型学习适应低精度，精度更好但需要重新训练。\n\nGPTQ（Post-Training Quantization for GPT，2023）：基于 Optimal Brain Quantization（OBQ）的改进。对每层权重逐列（column-wise）做量化，基于 Hessian 矩阵衡量每个权重的重要性（量化误差最小的权重先量化）。量化某一权重后，调整（update）剩余未量化权重来补偿量化误差（Optimal Brain Surgeon 思想）。主流量化级别：W4A16（4bit 权重，16bit 激活），在 WikiText2 perplexity 损失约 0.5-1.0。适用：GPU 推理（GPU 反量化速度快），HuggingFace Transformers 生态。\n\nAWQ（Activation-Aware Weight Quantization，2023）：观察发现权重中的 1% 的 salience channels（10% 左右的 channel）对量化精度影响最大。AWQ 不量化这些关键 channel（保留 FP16），只量化非关键 channel。通过 per-channel scaling 保护重要 channel。效果：在同等位宽下比 GPTQ 精度更好（尤其是在 W4A16 场景），在 WizardCoder、LLaMA、Vicuna 等模型上验证。适用：需要更高精度的 GPU 量化推理。\n\nGGUF（GGML Universal Format，llama.cpp 生态）：不是量化算法（是模型格式），但支持多种量化类型。支持 2-8 bit 的对称/非对称量化（q2_k、q3_k_m、q4_k_m、q5_k_m、q6_k、q8_0 等）。特点：CPU 推理优化（通过 llama.cpp），支持 MMAP（零拷贝加载），ARM NEON / x86 向量指令加速。适用：CPU 推理、边缘设备、Apple Silicon（M 系列芯片）、大模型的本地部署。\n\n选择建议：GPU 推理 → AWQ（精度更好）或 GPTQ（生态更成熟）。CPU 推理 → GGUF。多框架部署 → 考虑使用统一推理引擎（如 llama.cpp 支持 GPU/CPU）。注意：量化后的模型使用 FP16 时速度的 xx%-xx% 吞吐并非等同（取决于推理引擎的内存带宽是否成为瓶颈）。内存带宽受限的推理场景（长 context、小 batch size），INT4 比 FP16 有 2-3x 的吞吐提升。",
  ["GPTQ 的 Optimal Brain Quantization——量化后补偿未量化权重", "AWQ 的保护 salience channels——激活值大的权重通道保留 FP16"],
  ["量化", "GPTQ", "AWQ", "GGUF", "LLM"])

q("ai_infra", "hard", "short_answer",
  "GPU 架构与 AI 计算核心",
  "NVIDIA GPU 的架构演进（Ampere → Hopper → Blackwell）对 AI 训练和推理有什么影响？Tensor Core 的作用是什么？HBM 带宽和计算能力的权衡？NVLink 和 InfiniBand 在分布式训练中的作用？",
  "GPU 架构的演进直接影响大模型的训练和推理效率。\n\n架构演进要点：1）Ampere（A100，2020）——关键特性：第三代 Tensor Core（支持 BF16、TF32）、Multi-Instance GPU（MIG，将 A100 切为 7 个独立实例）、40/80GB HBM2e 内存。2）Hopper（H100，2022）——关键特性：第四代 Tensor Core（支持 FP8、Transformer Engine）、HBM3 内存（3.35TB/s 带宽）、DPX 指令集加速动态规划算法。3）Blackwell（B200，2024）——关键特性：第五代 Tensor Core（支持 FP4/FP6）、192GB HBM3e、NVLink 5.0（双向 1.8TB/s）、第二代 Transformer Engine（高级精度管理）、解压缩引擎（加速数据加载）。\n\nTensor Core：GPU 上的专用矩阵乘累加单元（不是 CUDA Core）。一个 Tensor Core 一个时钟周期执行 4x4 矩阵乘加 D = A × B + C。Volta(2017) 引入 FP16 Tensor Core，Ampere 引入 TF32/BF16，Hopper 引入 FP8。FP8 Tensor Core 使 Transformer 训练速度提升 2x（在 Hopper 上）——在保持模型精度的同时将训练吞吐翻倍。\n\nHBM（High Bandwidth Memory） vs 计算能力：LLM 推理是内存带宽受限的（尤其是 decode 阶段权重矩阵的读取）。H100 HBM3 理论带宽 3.35TB/s，A100 HBM2e 2TB/s。推理吞吐 ≈ 总带宽 / 每 token 需要的权重读取量。在 decode 阶段（batch=1），LLaMA-70B 每次生成需要读取 70B × 2bytes（FP16）= 140GB。H100 理论最大 token/s ≈ 3350GB/s / 140GB ≈ 23.9 tokens/s（实际因计算和内存访问重叠而不同，大概 15-22 tok/s）。\n\nNVLink vs InfiniBand：NVLink——GPU 间高速互联（NVIDIA 私有协议）：A100 NVLink 3: 600GB/s（双向）。H100 NVLink 4: 900GB/s。B200 NVLink 5: 1800GB/s。适用：GPU 间通信（张量并行 TP、流水线并行 PP），延迟极低（几百纳秒）。InfiniBand——节点间高速网络（跨服务器通信）：HDR(200Gbps)/NDR(400Gbps)，典型延迟 1-2μs。适用：数据并行 DP/FSDP 的梯度 AllReduce、跨节点通信。选型指导：单机 8 卡用 NVLink（多卡互联）+ 跨机用 InfiniBand（节点互联）。没有 NVLink 时，小规模训练可以通过 PCIe 通信（P2P 带宽约 50-60 GB/s），显著低于 NVLink。",
  ["GPU 推理的瓶颈通常是内存带宽——H100 的理论 token/s 计算", "NVLink（GPU 间） vs InfiniBand（节点间）——各自的通信模式"],
  ["GPU", "NVIDIA", "Tensor Core", "HBM", "分布式训练"])

q("ai_infra", "medium", "short_answer",
  "AI 推理中的 Prefix Caching 与语义缓存",
  "LLM 推理中的 Prefix Caching（前缀缓存）和 Semantic Caching（语义缓存）有什么区别？RadixTree 在 Prefix Caching 中的作用是什么？SGLang 的 RadixAttention 如何工作？",
  "在 LLM 推理中，系统 Prompt、Few-shot Examples、对话历史等前缀在多个请求中重复出现时，重复计算这些 prefix 的 KV Cache 浪费了大量 GPU 算力。\n\nPrefix Caching（精确前缀缓存）：缓存已计算的 Prefix 的 KV Cache。当新请求的 Token 前缀与已缓存的请求相同时，复用 KV Cache 避免重复计算。实现：1）vLLM 的 Automatic Prefix Caching（APC）——将每个请求的 Token 序列的 KV Cache 以 Page 粒度缓存。新请求到达时，检查 Token ID 序列的前缀是否命中缓存中的 Page（精确匹配 Token ID）。命中则直接从缓存 Page 开始做 Prefill。2）RadixTree（基树）——所有 Token 的 Key 存储在 RadixTree 中，便于前缀的最长匹配查找（Longest Prefix Matching）。树中每个节点对应一段连续 Token 的 KV Cache block。节点可被共享（多个 sequence 共享同一个 prefix）。3）LRU 淘汰——有限的 GPU 内存中，缓存满时淘汰最近最少使用的 KV Cache block。\n\nSemantic Caching（语义缓存，适用于 LLM 应用）：基于语义相似度匹配缓存（不要求精确的 Token 匹配）。用户输入通过 Embedding 模型转成向量 → 在向量数据库中查找语义相似的已缓存结果（如相似度 > 0.95）。命中则返回之前生成的结果（不调用 LLM），大幅降低延迟和成本。适用场景：FAQ 问答、代码生成（常见代码段的模板）、翻译和总结（高频输入场景）。限制：需要设置相似度阈值（误判会返回不相关结果）；不适合需要精确回答的问题（需要 LLM 重新推理会更好）。\n\nSGLang 的 RadixAttention：SGLang（2024，斯坦福）将 Prefix Caching 与编程模型结合。1）程序化前端——用户用 Python 定义 LLM 程序（包含 Control Flow），SGLang 在运行时自动检测和缓存前缀。2）RadixAttention——自动管理 KV Cache 的共享，不使用传统的 hash-based prefix matching，而通过 RadixTree 感知数据结构（如 Multi-Turn 对话的 System Prompt 共享、Few-shot Example 的 Task Description 共享）。3）性能——在多轮对话场景中，比传统 Prefix Caching 减少 3-5x 的 Prefill 计算。\n\n扩展延伸：Prompt 优化与缓存策略的配合——将不变的 System Prompt 拆分为独立的 Prompt 段让 Prefix Caching 更高效。DPO 训练后模型的系统 Prompt 固定不变 → Prefix Caching 最有效。Semantic Caching 适合内容生成类（摘要、翻译）而非精确查询类。",
  ["Prefix Caching 的精确匹配 vs Semantic Caching 的语义匹配", "RadixTree 在最长前缀匹配中的作用"],
  ["LLM", "缓存", "Prefix Caching", "Semantic Caching", "RadixAttention"])

# ==================== AI Infrastructure Operations ====================

q("ai_infra", "hard", "short_answer",
  "LLM 应用的可观测性",
  "LLM 应用的可观测性需要采集哪些指标？与传统 Web 服务的 Observability 有什么不同？Token Usage、Latency Breakdown、Quality Metrics 如何采集和监控？LangSmith / LangFuse / Helicone 等工具的架构区别？",
  "LLM 应用的可观测性在传统 RPC 监控（RED 指标：Rate、Error、Duration）基础上，增加了模型质量、Token 消耗、Prompt/Response 内容分析等 AI 特有的维度。\n\n核心指标：1）Token Usage（用量）——Input Tokens、Output Tokens、Total Tokens。监控维度：每用户/应用/模型的总 Token 消耗、Cost Tracking（按模型单价 × Token 数计算成本）。2）Latency Breakdown（延迟分解）——TTFT（Time to First Token，首 token 延迟），TPOT（Time Per Output Token，每输出 token 延迟）。细分延迟：Embedding 延迟（RAG 场景）、LLM 推理延迟、工具调用延迟。3）Quality Metrics（质量指标）——用户反馈（Thumbs Up/Down）、自动评估（LLM-as-Judge 打分：相关性、事实性、安全性）、RAG 检索质量（检索的 Precision、Recall）。4）Safety & Guardrails——通过 Guardrails 的请求/拦截数、PII 检测告警、毒性检测。5）Trace——完整的 LLM 调用链路：Prompt → LLM Call → Tool Calls → Output。\n\n与 Web 可观测性不同：LLM 的可观测性注重内容分析（不只看延迟和错误率，还需要采样 Prompt/Response 做质量评估和审计）。在传统 Web Observability 的基础上增加了语义层面（Prompt 和 Response 的内容）的监控和评估。\n\n工具对比：1）LangSmith（LangChain 生态）——深度集成 LangChain/LangGraph，提供 Tracing 和 Playground，Prompt 版本管理和 A/B 测试能力。适合使用 LangChain 的 LLM 应用。2）LangFuse（开源）——开源 LLM 可观测平台，提供 Tracing、评估、Prompt 管理。架构：自托管（Docker）+ Postgres + ClickHouse（高性能事件存储）。提供 Python/JS SDK 手动追踪（@observe() 装饰器）。3）Helicone（API Gateway for LLM）——专注于代理层监控（Proxy 架构），所有 LLM API 请求经过 Helicone Proxy 转发。提供请求记录、缓存、重试、成本管理。不需要修改应用代码（但所有 LLM API 调用需要路由到 Helicone Proxy）。4）MLflow（传统 ML 平台）——从 MLflow 2.6+ 开始支持 LLM（Evaluate、Tracing、Model Registry）。适合已有 MLflow 基础设施的团队。\n\n生产实践：1）采样——所有请求记录（不用采样），因为 LLM 请求的每次调用都可能携带未调试过的行为（和质量问题）。可以在存储层采样（比如只存 Prompt/Response 的 10% 用于审计和评估，所有请求的 Token 计数和延迟 100% 记录）。2）Prompt 版本与 Trace 的关联——记录每次调用使用的 Prompt Template 和版本，方便回溯问题。3）评估流水线——在线评估（用户实时反馈） + 离线评估（定期跑测试集评估）。4）告警——Token 消耗突增（可能被滥用）、延迟异常升高（推理引擎有问题）、错误类型分布（API Key 过期、Rate Limit、模型服务不可用）。",
  ["LLM Observability 新增的维度——Token、质量评估、内容审计", "Helicone 的 Proxy 架构 vs LangSmith 的 SDK 架构——无侵入 vs 深度集成"],
  ["LLM", "可观测性", "LangSmith", "LangFuse", "监控"])

q("ai_infra", "medium", "short_answer",
  "AI Gateway 架构设计",
  "AI Gateway（如 Portkey、Helicone、Azure API Management for AI）的核心功能是什么？AI Gateway 如何实现多模型路由、Fallback、Rate Limiting 和 Cost Management？AI Gateway 与通用 API Gateway 的区别？",
  "AI Gateway 是专门为 LLM API 调用设计的代理层（Proxy），提供 LLM 特有的流量管理和可观测性能力。\n\n核心功能：1）多模型路由（Multi-Model Router）——单个请求可以根据规则路由到不同模型：按模型能力路由（简单 query → 便宜的 Claude Haiku，复杂 query → Claude Opus）、按成本路由（配额用完后降级到便宜模型）、按延迟路由（需要低延迟的查询路由到快速模型）。2）Fallback（降级）——主模型不可用时自动切换到备用模型（如 Claude 不可用 → 自动切到 GPT-4）。重试机制：指数退避 + 不同的 API Key 重试（应对 API Rate Limit）。3）Rate Limiting & Quota Management——按用户/API Key/模型的 Token 配额管理。统一管理所有 LLM 提供商的 Rate Limit（OpenAI 10000 RPM、Anthropic 5000 RPM 等）。请求排队（防止突发流量超出上游配额）。4）Cost Management——Token 使用追踪（按用户/团队/应用），成本分配（Cost Allocation / Showback），Budget 告警（月度预算超限时告警或自动切换模型）。5）缓存——语义缓存（见上一问）或精确缓存（相同请求返回缓存结果）。\n\nAI Gateway vs 通用 API Gateway：通用 API Gateway（Kong / APISIX / Spring Cloud Gateway）不感知 LLM 请求语义——无法做 Token 级别的 Rate Limit、不能做多模型路由、不能记录 Prompt/Response 内容。AI Gateway 是应用层代理（理解 LLM 的 Content Type 和请求的语义结构），通用 API Gateway 工作在请求-响应层（不解析 Message Body 的内容）。\n\n部署模式：1）Proxy 模式（SaaS）——Helicone、Portkey Cloud，请求转发到 SaaS Gateway，由 SaaS 管理日志和缓存。适合中小团队（快速上手，不需要自建）。安全注意：Prompt/Response 经过第三方服务，需要检查数据合规。2）自托管模式（Self-hosted）——Portkey Self-hosted、LiteLLM Proxy（开源）。在自有基础设施上部署 Gateway 代理，数据不离开本地。适合对数据隐私有要求的企业。3）Sidecar 模式——AI Gateway 以 Sidecar（如 Istio Envoy 的 LLM Filter）与业务应用部署在一起。这是新的方向（Kong 和 Envoy 在扩展 LLM Filter）。\n\n注意：AI Gateway 的引入增加了一层网络延迟（约 5-10ms 额外延迟）。加入缓存可以抵消延迟影响（缓存命中时延迟 < 1ms）。需要 Gateway 自身的高可用部署（多副本 + 负载均衡）。",
  ["AI Gateway 的核心价值——多模型路由 + Token 级 Rate Limit + 语义缓存", "AI Gateway 自托管 vs SaaS 的选择——数据隐私 vs 运维成本"],
  ["AI Gateway", "LLM", "路由", "成本管理", "代理"])

q("ai_infra", "medium", "short_answer",
  "RAG 基础设施：Embedding 模型与向量数据库",
  "RAG（Retrieval-Augmented Generation）架构中的基础设施组件有哪些？Embedding Model 的选型考虑因素是什么？向量数据库（Pinecone / Weaviate / Milvus）的核心指标和选型对比？",
  "RAG 系统的三个核心组件：Embedding 模型（文本→向量） + 向量数据库（存储和检索） + LLM（基于上下文生成回答）。\n\nEmbedding Model 选型：1）维度（Dimensions）——高维度（1536/3072 如 text-embedding-3-large）保留更多语义信息的但查询延迟高。低维度（384/768 如 all-MiniLM-L6-v2）查询更快但语义精度略低。2）模型大小——小模型（MiniLM: 22M 参数，768维，适合批量生产）vs 大模型（BGE-Large: 335M 参数，1024维，精度略高）。3）多语言支持——检索中文文档优先考虑 BGE（BAAI/bge-large-zh-v1.5）或 m3e（Moka），或者 OpenAI text-embedding-3-large（多语言效果好）。4）对比：开放模型（BGE、E5、Instructor）可自托管（数据不出去），商业模型（OpenAI、Cohere）API 调用更方便。\n\n向量数据库对比：1）Pinecone（SaaS 托管）——完全托管（不需要自建），自动扩缩容，支持命名空间隔离（多租户），支持稀疏-稠密混合检索（Hybrid Search）。限制：数据必须发送到 Pinecone 服务端，数据量大的时候成本较高。2）Weaviate（开源/云托管）——同时支持向量 + 结构化字段过滤（如 WHERE price > 100）。内置模块化向量化（不需要自建 Embedding Pipeline），支持 GraphQL API。性能：单节点每秒约 1500-5000 向量查询。3）Milvus（开源，Zilliz Cloud 托管）——专业向量数据库（性能最强）。支持磁盘索引（DiskANN），可以在 TB 级向量数据集上工作。GPU 加速索引构建（IVF_PQ、HNSW 等索引类型）。性能：分布式架构（分片+副本），支持每秒数万 QPS 的向量检索。4）Chroma / Qdrant——轻量级向量数据库，适合原型和小规模生产。\n\nRAG 检索优化：1）Chunking（分块策略）——固定大小分块（256 tokens）vs 语义分块（按段落/句子）。重叠窗口（Overlap Window）避免切碎语义边界。2）Hybrid Search——向量搜索（语义相似度）+ 关键词搜索（BM25/TF-IDF）的结合。Weaviate 和 Elasticsearch 原生支持。3）Metadata Filtering——先按 Metadata（日期、类别、文档来源）过滤再向量搜索（缩小搜索范围提高相关性）。4）Re-ranking——向量检索返回 Top-K 后，用 Cross-Encoder 模型做二次排序（更精确但更慢）。\n\n生产建议：起步阶段用 SaaS 向量数据库（Pinecone 或 Weaviate Cloud），降低运维成本。数据量 > 1 亿向量且需要精细性能调优时迁移到自建 Milvus。Embedding 推荐 BGE（自托管）+ OpenAI text-embedding-3-large 做 Fallback。",
  ["Embedding 模型维度对检索精度和速度的权衡", "向量数据库中的 Hybrid Search（向量+关键词）的应用场景"],
  ["RAG", "向量数据库", "Embedding", "Milvus", "检索"])

# ==================== Fine-Tuning Infrastructure ====================

q("ai_infra", "hard", "short_answer",
  "LoRA / QLoRA 微调基础设施",
  "LoRA（Low-Rank Adaptation）和 QLoRA 的微调原理是什么？LoRA 的 Rank 参数如何影响微调效果？QLoRA 的 NF4 量化 + Double Quantization + Paged Optimizer 如何降低显存需求？实战中 LoRA 的训练配置选型？",
  "LoRA（Low-Rank Adaptation，2021）通过向预训练权重矩阵注入低秩矩阵来微调（只训练注入的低秩矩阵，冻结原有权重）。核心思想：权重更新 ΔW 的秩是低的（rank << d_model），分解为 A（d_model × r）× B（r × d_model），r 是超参。\n\nLoRA 原理：原始权重 W ∈ R^(d×k)，前向计算 h = Wx + ΔWx = Wx + BAx。A 用随机高斯初始化，B 用零矩阵初始化（初始时 ΔW=0）。训练时只更新 A 和 B（参数量 d×r + r×k）。r=8 时，LLaMA-7B 的可训练参数从 7B 降到约 4.2M（0.06%）。\n\nRank 参数的影响：r 控制微调的表达能力和内存占用（r 越大，可训练参数量越大）。规律：r=8 时在大多数任务上已经足够（LoRA 论文推荐 r=8 或 16）。简单任务（分类）可用 r=4-8。复杂任务（代码生成、数学推理）需要 r=16-32 甚至 r=64。r 太大（r > 64）带来的收益递减（低秩假设失效）。\n\nQLoRA（Quantized LoRA，2023）：在 LoRA 基础上对预训练权重做 4-bit 量化。技术要点：1）NF4（Normal Float 4-bit）——设计了针对正态分布权重的 4-bit 数据类型（NormalFloat4，比普通 INT4 更好的前向传播精度）。2）Double Quantization——对量化常数（scale）再做一次 8-bit 量化。额外节省约 0.5 bits/参数。3）Paged Optimizer——使用 NVIDIA Unified Memory（分页内存）在 CPU 和 GPU 之间交换 Optimizer State。当 GPU 显存不足时将优化器状态换出到 CPU 内存，GPU 不够时自动 page out。\n\nQLoRA 的显存降低（以 LLaMA-7B 为例）：FP16 全参数微调需要约 112GB（4 × A100 80GB）。LoRA（r=8）+ FP16 Base：约 24GB（大幅降低）。QLoRA（r=8）+ NF4 Base：只需约 12GB（单张 RTX 3090/4090 24GB GPU 可微调 7B 模型）。\n\n实战配置：r=8-16（大部分任务）+ target_modules（选择 q_proj, k_proj, v_proj, o_proj 等模块微调）+ lora_alpha（缩放因子，通常设为 r 的 2 倍）+ 学习率（1e-4 到 5e-4）+ scheduler（cosine）。训练卡推荐：7B 模型单卡 A100 80GB（LoRA BF16）/ 单卡 RTX 4090（QLoRA NF4）。13B 模型双卡 A100（张量并行 + LoRA）/ 单卡 A100 80GB（QLoRA）。70B 模型 4 卡 A100（LoRA）或 2 卡 A100（QLoRA）。",
  ["LoRA 的 r（Rank）参数对微调效果和参数量的影响", "QLoRA 的 NF4 量化 + Double Quantization 如何降低 2-4x 显存需求"],
  ["LoRA", "QLoRA", "微调", "量化", "显存"])

q("ai_infra", "hard", "short_answer",
  "分布式训练框架：DeepSpeed ZeRO / FSDP",
  "DeepSpeed ZeRO（Zero Redundancy Optimizer）的三个阶段（Stage 1/2/3）分别优化了什么？FSDP（Fully Sharded Data Parallel）和 ZeRO Stage 3 的异同？张量并行（TP）和流水线并行（PP）分别解决什么问题？",
  "大模型训练中单个 GPU 显存放不下模型参数、梯度、优化器状态，需要将模型状态（参数 + 梯度 + 优化器状态）切分到多个 GPU。\n\nDeepSpeed ZeRO 的三个阶段（从节省显存到全切分）：Stage 1（Optimizer State Partitioning）——优化器状态（Adam 的 momentum + variance）切分到各 GPU，每卡只维护自己的分片。节省显存：2x reduction（以 FP16 Adam 为例，每个参数从 16 bytes 降到 8 bytes）。Stage 2（Gradient Partitioning）——梯度也切分，每卡只维护自己的梯度分片。计算完梯度后 AllReduce 变为 ReduceScatter + AllGather（通信量从 O(N) 降到 O(N) 但通信模式优化，实际的梯度 AllReduce 被拆分）。节省：额外 2x reduction。Stage 3（Parameter Partitioning）——模型参数也切分到各 GPU。前向计算时 AllGather 获取参数，反向传播时重新 AllGather。通信量最大（每个训练 step 需要两次 AllGather = 完整参数量 × 2）。节省显存最显著（显存占用随 GPU 数线性减少），但通信量最大。\n\nFSDP（Fully Sharded Data Parallel，PyTorch 原生，2022）：与 ZeRO Stage 3 本质相同——将参数、梯度、优化器状态都分片。不同之处：1）FSDP 是 PyTorch 官方实现（更易与 HuggingFace Trainer 集成）。2）通信策略更灵活——FSDP 支持 ZERO-2 和 ZERO-3 模式通过 auto_wrap_policy 配置 Transformer Layer 的包装策略。3）性能——ZeRO Stage 3 的通信优化（通信与计算重叠）稍好一些（FSDP 在 Pytorch 2.0+ 追赶），但 ZeRO 需要 deepspeed 库。\n\n张量并行（Tensor Parallelism，TP）和流水线并行（Pipeline Parallelism，PP）：1）TP——将单层的矩阵计算拆到多个 GPU（如 QKV 投影的 4096×4096 矩阵分为 2 个 4096×2048）。通信量极大（每个 forward + backward 都需 AllReduce），需要 NVLink 高速互联。适用：单 GPU 放不下一层的超大模型（> 100B 参数）。2）PP——将模型不同层分配到不同 GPU（Layer 1-10 在 GPU0，Layer 11-20 在 GPU1）。通信量小（只需传递 hidden state），但存在流水线气泡（bubble，GPU 等待前一个 GPU 计算完成）。通过 Micro-batching 减少气泡。适用：模型层数很多但每层能放下的场景。3）3D Parallelism——TP + PP + DP（ZeRO）组合，用于训练超大规模模型（如 GPT-4, LLaMA-3-405B）。典型配置：TP=8（单机 8 卡 NVLink），PP=2（2 节点流水线），DP=ZeRO（数据并行 + ZeRO Stage 1）。",
  ["ZeRO Stage 3 对通信量的影响——两次 AllGather 每 step", "TP（单层跨 GPU 切分） vs PP（层间跨 GPU 切分）——通信量和适用场景"],
  ["DeepSpeed", "ZeRO", "FSDP", "分布式训练", "并行"])

# ==================== MLOps & Pipeline ====================

q("ai_infra", "hard", "short_answer",
  "LLM Evaluation Pipeline 设计",
  "LLM 评估（Evaluation）的自动化 Pipeline 如何设计？LLM-as-Judge、Benchmark 评估、人工评估三种方式的优劣势？如何设计针对特定场景的评估数据集和评估指标？RegreSSIon Testing（回归测试）如何持续运行？",
  "LLM 评估是 AI 工程化中最容易被低估的环节。没有好的评估，Prompt 修改和模型升级的效果是盲目的。\n\n三种评估方式：1）Benchmark 评估（标准化测试集）——MMLU（知识推理）、HellaSwag（常识推理）、GSM8K（数学）、HumanEval（代码生成）、MT-Bench（对话质量）。优势：标准化，结果可对比。劣势：与真实业务场景有差距，测试集可能被污染（模型见过测试数据）。2）LLM-as-Judge——用强 LLM（如 GPT-4/Claude）评估弱模型的输出。评估维度：相关性（是否回答了用户的 query）、事实性（是否有幻觉）、安全性（是否有有害内容）、完整性（是否覆盖了所有要点）。优势：自动可扩展，不需要人工标注。劣势：Judge LLM 本身的偏见（偏好自己的输出风格），可能对细微的事实错误不敏感。3）人工评估——标注员对模型输出打分或 A/B 比较。优势：最准确（人类能捕捉机器遗漏的细微问题）。劣势：昂贵、慢、不一致（不同的标注员标准不同）。\n\n评估 Pipeline 设计：1）测试集构建——收集真实用户 query（匿名化），按场景分类（FAQ、推理、代码、翻译等）。黄金答案（Golden Answer）——每个测试样本由专家写出标准答案（作为 Ground Truth）。对抗样本——常见的失败 case（边缘 case、歧义 query、指令冲突）。2）执行流程——CI/CD 触发评估 Pipeline（Git push 时自动运行）。依次执行：加载数据集 → 调用模型/Agent 推理 → 收集结果 → 运行评估（LLM-as-Judge + 自动指标 + 人工抽样）。3）自动指标——Answer Correctness（与 Golden Answer 的语义相似度）、Latency（P50/P95/P99）、Token Efficiency（Output/Input 比例，反映模型是否啰嗦）、Safety Score（PII 检测、毒性检测 Pass Rate）。\n\nRegression Testing（回归测试）：1）每次模型升级/Prompt 修改后，运行全量的 Regression Suite。2）检测指标退化（Accuracy 下降 > 1% 时告警）。3）Human-in-the-loop——自动评估判断不明确的 case，交由人工仲裁。4）Golden Dataset 的持续更新——从线上收集新的失败 case，加入测试集。\n\n生产建议：CI 环节运行轻量测试（小数据集 + 快速评估），CD 前运行全量评估（大数据集 + 详细报告）。评估结果的可视化——对比视图（旧模型 vs 新模型的输出）便于 Reviewer 快速判断。Track 每次提交的 Score（Embedding 在 Dashboards 中展示趋势图）。",
  ["LLM-as-Judge 的偏见问题——Judge 更喜欢自己的输出风格", "评估 Pipeline 在 CI/CD 中的集成——轻量测试 vs 全量评估"],
  ["LLM", "评估", "Eval", "Pipeline", "回归测试"])

q("ai_infra", "medium", "short_answer",
  "LLM 缓存策略：从 Prompt Cache 到 Semantic Cache",
  "LLM 应用的缓存层次有哪些？KV Cache Prefix Caching（GPU 级）、Response Cache（应用级）、Semantic Cache（语义级）分别解决什么问题？GPTCache 和 Redis + 向量搜索的实现差异？",
  "LLM 应用的缓存分为三个层次，分别对应不同的相似度匹配粒度和延迟优化目标。\n\n1）KV Cache Prefix Caching（GPU 级，vLLM / SGLang）——缓存 LLM 推理过程中生成的 Key-Value Cache。匹配粒度：精确 Token ID 匹配（前缀完全一致）。命中时节省：Prefill 阶段的计算时间（占首 token 延迟的 60-80%）。适用场景：共享 System Prompt 的多轮对话、批处理相同前缀的请求。\n\n2）Response Cache（应用级，精确匹配）——完全相同的请求返回缓存的完整 LLM 回复。匹配粒度：精确字符串匹配（请求完全相同）。命中时节省：完整 LLM 调用（零推理延迟 + 零成本）。实现：Redis + TTL（key = 请求文本 hash + 模型名，value = 响应内容）。适用场景：相同的用户 query 重复出现（如 FAQ、常用问答）。\n\n3）Semantic Cache（语义级）——语义相似的请求返回缓存的相同响应。匹配粒度：语义相似度 > 阈值（如 0.95）。命中时节省：完整 LLM 调用 + Embedding 模型调用。实现：用户 query 通过 Embedding 模型转为向量 → 查询向量数据库（Pinecone / Milvus / Chroma）找最相似已缓存 query → 如果相似度 > 阈值 → 返回缓存响应。\n\nGPTCache（开源语义缓存库）——用 Embedding Model + 向量存储实现语义缓存。架构：cache server（接收请求 → 向量化 → 查询缓存 → 命中直接返回 / 未命中调用 LLM → 缓存后返回）。存储后端支持：SQLite（小规模）、Milvus（大规模）、Pinecone。GPTCache 适合：低频变化的 Query（如翻译模板、格式化输出）、高重复度场景。Redis 方案——用 Redis Stack（RediSearch + RedisJSON）实现：Embedding 向量存成 HNSW 索引。比 GPTCache 轻量（不依赖外部向量数据库）。\n\n缓存层次的组合：先行 Response Cache（精确匹配，最快） → 未命中则查 Semantic Cache（语义匹配） → 未命中则执行 LLM 推理（同时 Prefix Caching 在 GPU 级加速推理）+ 缓存结果。\n\n注意：语义缓存的挑战——1）阈值选择：太高（0.99）几乎等于精确匹配，太低（0.8）会返回不相关的 cache。需要 tune。2）时效性：时间敏感的 query（今天天气怎么样）不适合缓存。3）多轮对话：缓存的 context 不能包含当前轮的上下文依赖。4）Cache Chaining：缓存了某个 User Query 但没有缓存后续的 Follow-up Query。",
  ["Response Cache（精确匹配） vs Semantic Cache（语义匹配）的延迟差异", "GPTCache 的向量搜索开销（Embedding + 数据库查询）可能超过 LLM 调用本身"],
  ["LLM", "缓存", "Semantic Cache", "KV Cache", "延迟优化"])

# Write properly (with safety guard)
result = json.dumps(questions, ensure_ascii=False, indent=2)
outpath = '/Users/petersun/DEV/labs/interview-app/backend/seed_data/ai_infra.json'
try:
    with open(outpath, 'r') as f:
        existing = json.load(f)
    print(f'⚠️  目标文件已有 {len(existing)} 题，本次将写入 {len(questions)} 题（覆盖）')
    confirm = input('确认覆盖？(y/N): ')
    if confirm.lower() != 'y':
        print('已取消')
        exit()
except FileNotFoundError:
    pass

with open(outpath, 'w') as f:
    f.write(result)
print(f'Written: {len(questions)} questions to {outpath}')
