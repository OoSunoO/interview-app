export const knowledge = {
  Agent: {
    category: "agent",
    content: `## AI Agent 核心概念

> 来源：JavaGuide

### 什么是 Agent？
AI Agent（智能体）是一种能够**感知环境、制定规划、执行行动**的智能系统。与传统 LLM 的一次性问答不同，Agent 可以自主完成多步骤任务。

### 感知-规划-行动循环

1. **感知（Perception）**：从环境中获取信息——用户输入、传感器数据、API 返回、工具结果等。
2. **规划（Planning）**：基于当前状态和目标，制定行动方案。常用方法：
   - **ReAct**（Reasoning + Acting）：交替推理和行动，将思考过程记录为 Chain-of-Thought。
   - **Plan-and-Solve**：先制定完整计划，再逐一执行。
   - **Tree-of-Thoughts**：探索多条推理路径，评估最优选择。
3. **行动（Action）**：执行具体操作，如调用 API、运行代码、查询数据库、发送消息等。行动结果反馈到感知，形成闭环。

### 工具使用（Tool Use）
Agent 通过调用外部工具扩展能力边界：
- **Function Calling**：LLM 输出结构化 JSON，触发预注册的函数调用来完成任务（如天气查询、文件操作）。
- **代码解释器**：执行 Python/JS 代码处理计算和数据分析。
- **RAG 检索**：从外部知识库获取实时信息补充上下文。
- **Web 搜索**：获取最新互联网信息。

### Agent 关键能力
- **记忆（Memory）**：短期（会话上下文）和长期（向量数据库持久化）。
- **自我反思（Self-reflection）**：评估行动结果，调整策略，迭代改进。`,
    source: "JavaGuide",
  },
  LLM: {
    category: "ai",
    content: `## 大型语言模型（LLM）核心概念

> 来源：JavaGuide

### 什么是 LLM？
大型语言模型（Large Language Model）是基于 Transformer 架构、在海量文本上预训练的深度学习模型，能够理解和生成自然语言。典型代表：GPT-4、Claude、Gemini、DeepSeek 等。

### Transformer 架构核心

Transformer 的核心是**自注意力机制（Self-Attention）**：

1. **Attention（缩放点积注意力）**：对输入序列每个位置计算与其他位置的关联权重。
   - Query（Q）、Key（K）、Value（V）三个向量矩阵
   - Attention(Q,K,V) = softmax(QK^T / √d_k) × V
   - √d_k 缩放因子防止梯度消失

2. **Multi-Head Attention**：多头并行计算注意力，捕获不同子空间信息。

3. **位置编码**：因 Self-Attention 无顺序感知，需注入位置信息（Sinusoidal 位置编码或可学习位置嵌入）。

4. **FFN（前馈神经网络）**：每个 Attention 层后接两层全连接网络（ReLU/GELU 激活）。

5. **残差连接 + 层归一化**：缓解深层网络梯度消失，加速训练。

### 训练流程

1. **预训练（Pre-training）**：在海量无标注语料上通过自监督学习训练，学习语言知识和世界知识。损失函数为下一个 Token 预测（Autoregressive LM）。

2. **指令微调（Instruction Tuning）**：在高质量的指令-回答数据上微调，让模型学会遵循人类指令。

3. **RLHF（基于人类反馈的强化学习）**：
   - SFT（监督微调）→ RM（训练奖励模型）→ PPO（强化学习优化策略）
   - 让模型输出更符合人类偏好（有用、诚实、无害）

### 关键参数
- **Context Window**：模型一次能处理的最大 Token 数（GPT-4 128K, Claude 200K）。
- **Temperature**：控制输出随机性，越低越确定，越高越多样。
- **Top-p / Top-k**：采样策略，控制生成质量。`,
    source: "JavaGuide",
  },
  RAG: {
    category: "ai",
    content: `## 检索增强生成（RAG）

> 来源：JavaGuide

### 什么是 RAG？
检索增强生成（Retrieval-Augmented Generation）是一种将信息检索与 LLM 生成相结合的技术范式。在回答问题时，先从外部知识库检索相关文档片段，再将检索结果作为上下文输入给 LLM 生成答案。

### 为什么需要 RAG？
- **解决知识过时**：LLM 训练数据有截止日期，RAG 可引入实时知识。
- **缓解幻觉**：基于检索到的真实文档回答，减少编造。
- **引入私有知识**：企业文档、产品手册等非公开数据可注入 RAG 系统。
- **可溯源**：答案可追溯到具体文档，提升可信度。

### RAG 核心流程

1. **索引阶段**
   - **文档切分（Chunking）**：将长文档切分为合适大小的片段（通常 256-1024 token）。
   - **向量化**：使用 Embedding 模型将每个 Chunk 转为向量。
   - **存储**：将向量存入向量数据库（Milvus、Pinecone、Chroma、Weaviate）。

2. **检索阶段**
   - **查询向量化**：将用户问题使用相同 Embedding 模型向量化。
   - **相似度搜索**：在向量数据库中检索 Top-K 最相似 Chunk（余弦相似度或欧式距离）。

3. **生成阶段**
   - **拼接 Prompt**：将检索到的 Chunk 作为上下文 + 用户问题组成 Prompt。
   - **LLM 生成**：大模型基于上下文回答问题。

### 关键优化策略

| 策略 | 说明 |
|------|------|
| **分块策略** | 滑动窗口/语义分割/层级分块，保持语义完整性 |
| **混合检索** | 向量相似度 + BM25 关键词检索互补 |
| **重排序（Rerank）** | 检索后用小模型对结果二次排序 |
| **HyDE** | 用 LLM 生成假设文档后再检索 |
| **多路召回** | 从多个不同知识源并发检索后融合 |
| **查询改写** | 对模糊问题重写后再检索 |

### 向量数据库选型

| 数据库 | 特点 |
|--------|------|
| Milvus | 分布式、高可用、适合生产 |
| Chroma | 轻量嵌入式，适合原型开发 |
| Pinecone | 全托管云服务 |
| Weaviate | 支持混合搜索和 GraphQL |`,
    source: "JavaGuide",
  },
  深度学习: {
    category: "ai",
    content: `## 深度学习基础

> 来源：JavaGuide

### 什么是深度学习？
深度学习是机器学习的一个子领域，基于深层神经网络（DNN），通过多层非线性变换学习数据的层次化特征表示。

### 核心网络结构

**CNN（卷积神经网络）**：适合图像和空间数据。
- 卷积层：用卷积核提取局部特征。
- 池化层：下采样减少参数（Max Pooling / Average Pooling）。
- 全连接层：全局特征组合。
- 典型模型：LeNet、AlexNet、ResNet、VGG。

**RNN（循环神经网络）**：适合序列数据（文本、语音）。
- 隐藏状态传递序列信息。
- 问题：长距离依赖时梯度消失/爆炸。
- 改进：LSTM（长短时记忆网络，门控机制）、GRU（简化版 LSTM）。

**Transformer**：基于自注意力机制，替代 RNN 处理序列。
- 核心：Self-Attention + Multi-Head Attention + FFN + 位置编码。
- 并行计算，解决 RNN 串行瓶颈。
- 代表：BERT（编码器）、GPT（解码器）、T5（编码器-解码器）。

### 训练关键技术
- **反向传播**：计算梯度，更新网络参数。
- **激活函数**：ReLU（解决梯度消失）、Sigmoid/Tanh（二分类/归一化）。
- **正则化**：Dropout（随机丢弃神经元）、L1/L2 正则、Batch Normalization。
- **优化器**：SGD、Adam（自适应学习率）、RMSProp。
- **损失函数**：交叉熵（分类）、MSE（回归）。
`,
    source: "JavaGuide",
  },
  机器学习: {
    category: "ai",
    content: `## 机器学习基础

> 来源：JavaGuide

### 什么是机器学习？
机器学习是让计算机从数据中自动学习模式和规律，无需显式编程。分为三大类：

**监督学习**：有标签数据，学习输入→输出的映射。
| 任务 | 算法 | 场景 |
|------|------|------|
| 分类 | 逻辑回归、SVM、决策树、随机森林、KNN | 垃圾邮件检测、图像分类 |
| 回归 | 线性回归、岭回归、Lasso | 房价预测、销量预测 |

**无监督学习**：无标签数据，发掘数据内在结构。
| 任务 | 算法 | 场景 |
|------|------|------|
| 聚类 | K-Means、DBSCAN、层次聚类 | 用户分群、异常检测 |
| 降维 | PCA、t-SNE | 数据可视化、特征压缩 |

**强化学习**：智能体通过与环境交互学习最优策略（奖励最大化）。
- 经典算法：Q-Learning、Deep Q-Network（DQN）、PPO。
- 应用：游戏（AlphaGo）、机器人控制、推荐系统。

### 模型评估

| 指标 | 公式 | 说明 |
|------|------|------|
| 准确率（Accuracy） | (TP+TN)/(P+N) | 整体正确率，不平衡数据不准确 |
| 精确率（Precision） | TP/(TP+FP) | 预测为正例中的正确率 |
| 召回率（Recall） | TP/(TP+FN) | 正例被正确识别的比例 |
| F1 Score | 2*P*R/(P+R) | 精确率和召回率的调和平均 |
| AUC-ROC | 面积 | 分类器在不同阈值下的综合表现 |

### 过拟合与欠拟合
- **过拟合**：模型记住训练数据噪声，泛化能力差。解决：增加数据、降低模型复杂度、正则化、早停。
- **欠拟合**：模型未学到数据规律。解决：增加特征、增加模型复杂度、减少正则化。
`,
    source: "JavaGuide",
  },
  AI_基础设施: {
    category: "ai_infra",
    content: `## AI 基础设施核心概念

### AI 技术栈分层

| 层级 | 技术组件 | 说明 |
|------|---------|------|
| 硬件层 | GPU（NVIDIA A100/H100/B200）、TPU、网络（InfiniBand/RoCE）、存储（NVMe/NFS） | 算力底座 |
| 集群层 | Slurm / Kubernetes + Volcano / Ray | 任务调度、资源管理 |
| 训练层 | PyTorch / JAX / TensorFlow + DeepSpeed / Megatron / FSDP | 分布式训练框架 |
| 推理层 | vLLM / TensorRT-LLM / Triton Inference Server / TGI | 模型推理优化 |
| 模型层 | GPT / LLaMA / Claude / Qwen 等基础模型 + LoRA 微调 | 模型本身 |
| 应用层 | LangChain / LlamaIndex / RAG 框架 + Agent 框架 | 上层应用 |

### GPU 选型对比

| GPU | FP8 TFLOPS | HBM | 互联 | 典型用途 |
|-----|-----------|-----|------|---------|
| A100 (80G) | 624 | 80GB HBM2e | NVLink 600GB/s | 训练 + 推理（上一代主力） |
| H100 (80G) | 1979 | 80GB HBM3 | NVLink 900GB/s | 训练 + 推理（当前主力） |
| H200 (141G) | 1979 | 141GB HBM3e | NVLink 900GB/s | 大模型推理（显存优先） |
| B200 | 4500 | 192GB HBM3e | NVLink 1800GB/s | 旗舰训练 + 推理 |

### 分布式训练策略

- **数据并行（DP/DDP）**：每个 GPU 一份完整模型，分 batch 训练，梯度同步
- **模型并行（MP）**：将模型分层切分到不同 GPU，按序执行
- **张量并行（TP）**：将单个 Transformer block 内矩阵拆到多个 GPU 计算
- **流水线并行（PP）**：不同 GPU 处理不同 micro-batch，交错执行减少 bubble
- **FSDP（Fully Sharded Data Parallel）**：参数、梯度、优化器状态分片到各 GPU，通信计算重叠

#### ZeRO 优化三阶段
- **ZeRO-1**：优化器状态分片
- **ZeRO-2**：优化器状态 + 梯度分片
- **ZeRO-3**：优化器状态 + 梯度 + 模型参数分片（最省显存，通信量最大）

### 推理优化技术

| 技术 | 原理 | 效果 |
|------|------|------|
| **量化** | FP16 → INT8/INT4，减少显存占用和计算量 | 显存减半，速度 2-4x |
| **KV Cache** | 缓存 attention 的 K/V 矩阵，避免重复计算 | 自回归生成加速 10x+ |
| **Flash Attention** | 分块计算 + 重计算，减少 HBM 读写 | 训练加速 2-4x，显存 O(N) → O(√N) |
| **Speculative Decoding** | 小模型生成草稿 → 大模型验证 | 推理加速 2-3x |
| **Continuous Batching** | 推理引擎动态合并请求为 batch | 吞吐提升 5-20x |
| **PagedAttention** | 类似虚拟内存管理 KV Cache，消除碎片 | 显存利用率提升 4x（vLLM 核心） |

### RAG 技术栈

| 组件 | 技术选型 | 说明 |
|------|---------|------|
| Embedding | text-embedding-3-small / BGE / E5 | 将文本转为向量 |
| 向量数据库 | Milvus / Pinecone / Qdrant / Weaviate / Chroma | 存储和检索向量 |
| 分块策略 | RecursiveCharacterTextSplitter / Semantic Chunking | 文档分块策略 |
| 检索增强 | Hybrid Search（向量 + BM25） + Rerank | 提升检索质量 |
| Prompt 优化 | Context 压缩 + 动态 Few-shot | 减少 Token 消耗 |

### MLOps 工具链
- **实验追踪**：MLflow / Weights & Biases / Neptune / Aim
- **模型注册**：MLflow Model Registry / Hugging Face Hub
- **特征存储**：Feast / Tecton
- **数据标注**：Label Studio / Scale AI
- **模型监控**：WhyLabs / Arize / Evidently
- **A/B 测试**：自建实验平台 / LaunchDarkly
`,
    source: "综合整理",
  },
};
