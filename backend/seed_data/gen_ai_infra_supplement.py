#!/usr/bin/env python3
"""Supplement ai_infra.json from 89 to 100+ questions."""
import json, os

def q(cat, diff, typ, title, content, answer, hints, tags):
    return dict(category=cat, difficulty=diff, type=typ, title=title,
                content=content, answer=answer, hints=hints, tags=tags)

NEW = [
    q('ai_infra', 'hard', 'short_answer',
      'GPU 集群管理：SLURM / Ray 与资源编排',
      '讨论 GPU 集群的作业调度和资源管理方案。SLURM 在高性能计算集群中的 GPU 分配机制。Ray Cluster 的弹性调度和分布式任务管理。GPU 资源的队列管理和优先级策略。分配策略对比：独占 vs 共享 vs 动态抢占。',
      'GPU 集群管理方案：\n\n1. **SLURM（Simple Linux Utility for Resource Management）**：\n   - HPC 领域标准的集群管理工具\n   - GPU 资源通过 GRES（Generic Resource）插件管理\n   - 命令：salloc（交互式）、sbatch（批处理）、srun（直接运行）\n   - 分配策略：节点独占、GPU 独占、GPU 共享\n   - 优先级：多级优先队列（fairshare + 优先级权重）\n   - 限制：不支持动态扩缩容，作业排队等待\n\n2. **Ray Cluster**：\n   - 面向 AI 和分布式 Python 的原生集群框架\n   - 动态弹性：根据任务需求自动扩缩 worker 节点\n   - 自动故障恢复：节点故障后自动重新调度任务\n   - 对象存储：分布式共享内存（Ray Object Store）\n   - 适合场景：分布式训练、模型 serving、AutoML\n   - 与 K8s 集成：Ray on Kubernetes（KubeRay）\n\n3. **GPU 分配策略**：\n   - 独占分配：一个 GPU 只服务一个任务（隔离性好，利用率低）\n   - 共享分配：MIG/MPS 分区共享（利用率高，隔离性中等）\n   - 动态抢占：高优任务抢占低优任务的 GPU（利用率最高，需要 Checkpoint）\n\n4. **选择建议**：\n   - 传统 HPC + 训练 → SLURM\n   - 动态 AI 工作负载 → Ray Cluster\n   - 云原生 + 微服务 → Kubernetes + Volcano/Kueue\n   - 大规模多团队共享 → SLURM + 优先级队列',
      ['SLURM 适合 HPC 风格训练作业，Ray 适合动态弹性 AI 工作负载', 'GPU 独占（隔离性好）vs 共享（利用率高）vs 动态抢占（最灵活）'],
      ['GPU', 'SLURM', 'Ray', '集群管理']),

    q('ai_infra', 'medium', 'short_answer',
      'AI 模型注册表与模型版本管理实践',
      '讨论 AI 模型注册表的核心功能和最佳实践。MLflow Model Registry 的版本管理和阶段转换。DVC（Data Version Control）的模型版本控制。模型的存储格式和元数据管理。模型从开发到生产的版本流转。',
      '模型注册表：\n\n1. **MLflow Model Registry**：\n   - 模型版本管理：每次注册生成新版本号\n   - 阶段转换：None → Staging → Production → Archived\n   - 模型描述：算法说明、超参数、数据集信息\n   - 审批流程：阶段转换需要审批或 CI 验证\n   - Web UI：版本对比、阶段查看、部署触发\n\n2. **DVC（Data Version Control）**：\n   - 基于 Git 的模型和数据版本控制\n   - 模型文件存储在远程存储（S3/GCS/MinIO）\n   - Git 中保存指针文件（.dvc 文件）\n   - 支持模型版本的回滚和分支管理\n   - 与 ML 流水线集成（dvc repro）\n\n3. **模型元数据**：\n   - 基础信息：模型名称、版本、创建时间\n   - 训练信息：框架、硬件、训练时长\n   - 评估指标：准确率、延迟、吞吐\n   - 输入输出 Schema：特征列名、类型、输出格式\n   - 血缘信息：数据集版本、代码 commit、训练配置\n\n4. **最佳实践**：\n   - 每次部署前在注册表创建新版本\n   - Staging 环境自动部署最新版本\n   - Production 版本需要审批或自动化验证通过\n   - 保留至少 N 个历史版本用于回滚\n   - 模型文件 + 元数据 + 评估结果一同注册',
      ['MLflow Registry 管理版本和阶段转换，DVC 基于 Git 做模型文件版本控制', '每次部署前注册新版本 + 保留历史版本 = 可回滚的模型管理'],
      ['模型注册表', 'MLflow', 'DVC', '版本管理']),

    q('ai_infra', 'medium', 'short_answer',
      'LLM 多层缓存体系：Redis / 语义缓存 / 前缀缓存对比',
      '对比 LLM 推理的三种缓存策略。Redis 缓存：完全匹配的请求-响应缓存，TTL 和淘汰策略。语义缓存：基于向量相似度的近似匹配，适合含义相同但表述不同的查询。前缀缓存（Prefix Caching）：复用共享 prompt 前缀的 KV-Cache。各自的适用场景和效果。',
      'LLM 缓存策略对比：\n\n1. **Redis 缓存（精确匹配）**：\n   - 缓存 key：prompt + 参数的哈希值\n   - 缓存 value：模型的完整输出\n   - 命中条件：请求完全一致（包括 system prompt 和参数）\n   - 淘汰策略：LRU/LFU/TTL\n   - 延迟收益：命中时延迟降低 90%+（跳过整个推理过程）\n   - 适用场景：高频重复请求、固定模板查询\n\n2. **语义缓存（近似匹配）**：\n   - 将 prompt 转为 embedding，存入向量数据库\n   - 新请求先做向量相似度搜索（余弦相似度）\n   - 相似度超过阈值则返回缓存结果\n   - 延迟收益：命中时延迟降低 80%+（只需 embedding + 搜索）\n   - 适用场景：FAQ、客服、含义相同但表述不同的查询\n   - 挑战：相似度阈值的选择（过松 → 质量下降，过严 → 命中率低）\n\n3. **前缀缓存（Prefix Caching）**：\n   - 缓存共享 prompt 前缀的 KV-Cache（不是最终输出）\n   - 新请求如果前缀相同，跳过 Prefill 阶段\n   - vLLM 的 Automatic Prefix Caching 自动检测共享前缀\n   - 延迟收益：首 token 延迟降低 50-80%（跳过 Prefill）\n   - 适用场景：共享 System Prompt 的对话、固定 Few-shot 模板\n\n4. **分层缓存策略**：\n   - 第一层：Redis 精确匹配（最快）\n   - 第二层：语义缓存（近似匹配）\n   - 第三层：前缀缓存（加速 Prefill）\n   - 兜底：完整推理\n   - 综合命中率可达 40-60%，大幅降低推理成本和延迟',
      ['Redis = 精确匹配（最快），语义缓存 = 近似匹配（灵活），前缀缓存 = 加速 Prefill', '三层缓存组合可实现 40-60% 的缓存命中率'],
      ['Redis', '语义缓存', '前缀缓存', '缓存策略']),

    q('ai_infra', 'hard', 'short_answer',
      'AI 模型容器化与 Triton Inference Server 部署',
      '讨论 AI 模型的容器化打包和推理服务部署。Docker 镜像构建：CUDA 基础镜像、Python 依赖、模型文件打包。Triton Inference Server 的架构和模型仓库配置。模型并发、动态批处理和模型流水线。多模型管理和 GPU 资源分配。',
      '模型容器化与 Triton 部署：\n\n1. **Docker 镜像构建**：\n   - 基础镜像：nvidia/cuda:12.x-runtime（推理不需要完整 CUDA toolkit）\n   - Python 依赖：miniconda 或 poetry 管理虚拟环境\n   - 模型文件：直接打包或挂载卷（推荐挂载，避免镜像过大）\n   - 多阶段构建：build 阶段安装依赖，runtime 阶段最小化\n   - 镜像大小优化：删除缓存和不需要的工具\n\n2. **Triton Inference Server**：\n   - NVIDIA 的多框架推理服务器\n   - 支持框架：TensorRT、PyTorch、ONNX Runtime、TensorFlow\n   - 模型仓库：文件系统或 S3 上的模型目录结构\n   - 模型配置：model.pbtxt 定义输入输出格式和调度策略\n\n3. **Triton 核心功能**：\n   - Dynamic Batching：自动合并请求成 batch（提高吞吐）\n   - 并发模型：同一 GPU 加载多个模型\n   - 模型流水线（Ensemble/BLS）：多个模型串联推理\n   - GPU 资源分配：每个模型指定 GPU 和显存限制\n\n4. **部署架构**：\n   - 单模型单容器（简单但资源利用率低）\n   - 多模型单容器（Triton 多模型并发，资源利用率高）\n   - K8s 部署：Triton + ServiceMonitor 监控\n\n5. **最佳实践**：\n   - 模型预热（warmup）：启动后发 dummy 请求预热\n   - 优雅关闭：等待进行中请求完成\n   - 滚动更新：不中断服务的模型版本升级',
      ['Triton 支持多框架（TensorRT/PyTorch/ONNX）+ 动态 Batching + 模型流水线', '模型文件挂载（避免镜像过大）+ 多模型共享 GPU（提高利用率）'],
      ['容器化', 'Triton', 'Docker', '推理部署']),

    q('ai_infra', 'hard', 'short_answer',
      'AI 基础设施的 CI/CD 流水线设计与实践',
      '讨论 AI 项目的持续集成和持续部署流水线。训练流水线：代码检查 → 数据验证 → 训练 → 评估 → 模型注册。推理部署流水线：模型验证 → 容器构建 → 灰度发布 → 生产部署。数据触发 vs 定时触发 vs 手动触发。流水线编排工具对比。',
      'AI CI/CD 流水线：\n\n1. **训练流水线（CI for Training）**：\n   - 步骤：代码检查（lint+type）→ 单元测试 → 数据验证 → 训练 → 评估 → 模型注册\n   - 数据验证：Schema 校验、分布检查、异常值检测\n   - 训练验证：loss 收敛检查、过拟合检测\n   - 评估验证：测试集指标对比（新模型 vs 当前生产模型）\n   - 输出：注册新模型版本到 Model Registry\n\n2. **部署流水线（CD for Inference）**：\n   - 步骤：模型拉取 → 容器构建 → 集成测试 → 灰度发布 → 生产部署\n   - 模型验证：延迟基准、吞吐测试、质量评估\n   - 安全扫描：镜像漏洞扫描、依赖检查\n   - 部署策略：金丝雀发布（5% → 25% → 100% 逐步切流）\n\n3. **触发方式**：\n   - 代码触发：git push 触发训练流水线\n   - 数据触发：新数据到达触发重训\n   - 调度触发：定时任务（每周重训基线模型）\n   - 手动触发：人工审核后触发部署\n\n4. **编排工具**：\n   - **Argo Workflows**：Kubernetes 原生，适合 GPU 任务\n   - **Kubeflow Pipelines**：ML 专有，组件可复用\n   - **GitHub Actions / GitLab CI**：轻量级，适合小团队\n   - **Jenkins + MLflow**：传统企业方案\n\n5. **最佳实践**：\n   - 训练和推理流水线分离（不同触发条件、不同资源）\n   - 每次部署前自动运行回测（避免模型退化）\n   - 失败的部署自动回滚到上一个版本',
      ['训练流水线：代码 → 数据 → 训练评估 → 注册；部署流水线：验证 → 打包 → 灰度 → 生产', 'Argo Workflows + Kubeflow = K8s 上标准的 ML CI/CD 方案'],
      ['CI/CD', 'MLOps', 'Argo Workflows', 'Kubeflow']),

    q('ai_infra', 'medium', 'short_answer',
      'AI 基础设施的灾难恢复与容灾架构',
      '讨论 AI 系统的灾难恢复策略。模型文件的备份和异地存储。训练中断的恢复：从 Checkpoint 恢复训练。推理服务的高可用：多可用区部署。数据集的备份和版本还原。灾难恢复演练和 RTO/RPO 目标。',
      'AI 灾难恢复：\n\n1. **模型文件备份**：\n   - 模型权重备份到对象存储（S3/GCS）并跨区域复制\n   - 模型注册表的多区域同步\n   - 备份策略：每次新版本自动备份 + 定期全量备份\n   - 保留策略：保留所有版本（回滚需要）\n\n2. **训练中断恢复**：\n   - 定期 Checkpoint：每 N 步保存一次（N=500-2000）\n   - Checkpoint 异地存储：本地 SSD + 远程对象存储\n   - 恢复流程：检测故障 → 加载最新 Checkpoint → 验证状态 → 继续训练\n   - 训练容错：Elastic Training（动态增删 GPU 节点）\n\n3. **推理服务高可用**：\n   - 多可用区部署：至少 2-3 个可用区\n   - 负载均衡 + 健康检查：故障节点自动摘除\n   - 跨区域灾备：主区域故障时切换到备用区域\n   - 模型预热池：灾备区域预加载核心模型\n\n4. **数据集备份**：\n   - 原始数据：对象存储 + 多版本（DVC 或 S3 版本控制）\n   - 处理后数据：定期备份预处理后的数据集\n   - 血缘记录：记录数据来源和处理流程（方便重建）\n\n5. **RTO/RPO**：\n   - RTO（恢复时间目标）：训练 < 30 分钟，推理 < 5 分钟\n   - RPO（恢复点目标）：训练 < 1 个 Checkpoint 间隔，推理 = 0（只丢正在处理的请求）\n   - 定期演练：每季度一次故障切换演练',
      ['模型文件 + Checkpoint + 数据集 = 三层备份体系', '多可用区部署 + 跨区域灾备 = 推理服务高可用'],
      ['灾备', '高可用', 'Checkpoint', '备份']),

    q('ai_infra', 'hard', 'short_answer',
      '模型验证流水线：数据验证 / 模型评估 / 性能门禁',
      '讨论 AI 模型从训练到部署之间的验证流程。数据验证：Schema 检查、数据漂移检测、异常值识别。模型评估：测试集评估、对比基线、公平性验证。性能门禁：延迟基准、吞吐测试、显存占用检查。通过/拒绝的门禁策略。',
      '模型验证流水线：\n\n1. **数据验证**：\n   - Schema 验证：特征列名、数据类型、值范围\n   - 统计验证：均值/方差/分位数 与训练数据一致\n   - 漂移检测：KS 检验 / PSI 检测数据分布变化\n   - 异常检测：缺失值比例、异常值比例、重复数据\n   - 工具：Great Expectations、TensorFlow Data Validation\n\n2. **模型评估**：\n   - 离线评估：在保留测试集上计算指标\n   - 基线对比：与当前生产模型对比（必须不低于基线）\n   - 细分评估：按用户群/场景/难度分组评估\n   - 公平性验证：不同群体间的指标差异\n   - 鲁棒性测试：对抗样本、输入扰动测试\n\n3. **性能门禁**：\n   - 延迟门禁：P50 < 100ms, P99 < 500ms（具体取决于场景）\n   - 吞吐门禁：单 GPU 吞吐 >= 基线值的 90%\n   - 显存门禁：峰值显存 <= 可用显存的 80%\n   - 并发门禁：目标 QPS 下延迟不超标\n\n4. **门禁策略**：\n   - 硬门禁：指标不达标 → 阻断进入下一阶段\n   - 软门禁：指标不达标 → 告警但允许继续（需人工审核）\n   - 渐进门禁：staging 阈值 < production 阈值\n\n5. **自动化集成**：\n   - CI 流水线中自动运行验证\n   - 结果写入 Model Registry 作为模型元数据\n   - 验证报告自动通知相关团队',
      ['数据验证（漂移检测）+ 模型评估（基线对比）+ 性能门禁（延迟/吞吐）= 三层验证', '硬门禁阻断 + 软门禁告警 + 渐进策略 = 灵活可控的验证体系'],
      ['模型验证', '数据验证', '性能门禁', 'MLOps']),

    q('ai_infra', 'medium', 'short_answer',
      'AI 训练推理的弹性成本优化：Spot 实例与预留容量',
      '讨论大规模 AI 训练推理的成本优化策略。Spot 实例：折扣比例、中断处理、Checkpoint 恢复。预留容量：1 年/3 年预留的折扣、容量保证。GPU 自动扩缩容：根据负载动态调整 GPU 数量。按资源类型（训练/推理/开发）的成本分配。',
      '弹性成本优化：\n\n1. **Spot 实例**：\n   - 折扣比例：70-90% vs 按需价格\n   - 中断风险：资源回收时 30 秒通知\n   - 适用场景：可中断训练、批量推理、开发测试\n   - 不适用场景：在线推理服务（中断影响用户体验）\n   - 中断处理方案：定期 Checkpoint + 自动恢复训练\n\n2. **预留容量**：\n   - 1 年预留：约 40-50% 折扣\n   - 3 年预留：约 60-70% 折扣\n   - 容量保证：预留实例有确定的资源可用性\n   - 适用场景：稳定的训练集群、核心推理服务\n   - 混合策略：预留实例承载基线负载 + Spot 处理弹性需求\n\n3. **自动扩缩容**：\n   - 推理扩缩：根据 QPS 或队列长度动态调整副本数\n   - 训练扩缩：训练开始创建 GPU 集群，完成后释放\n   - 闲置检测：GPU 利用率 < 20% 持续 30 分钟 → 缩容\n   - Karpenter / Cluster Autoscaler：K8s 节点级弹性\n\n4. **按工作负载优化**：\n   - 训练：预留（稳定）+ Spot（实验和超参搜索）\n   - 推理：预留（核心）+ 按需（波动）\n   - 开发测试：Spot 或 T4 低成本 GPU\n   - CI/CD：抢占式实例\n\n5. **优化效果**：\n   - 混合策略综合节省 40-60%\n   - Spot 训练可节省 70%+（带 Checkpoint 恢复）\n   - 自动扩缩容消除闲置浪费（30%+ 节省）',
      ['预留（基线）+ Spot（弹性）+ 自动扩缩容 = 综合节省 40-60%', 'Spot 适合训练（带 Checkpoint），不适合在线推理服务'],
      ['成本优化', 'Spot', '预留容量', '弹性伸缩']),

    q('ai_infra', 'hard', 'short_answer',
      'A100 / H100 / B200 / TPU 对比与选型指南',
      '全面对比主流 AI 加速芯片的架构和性能差异。A100（Ampere，2020）：HBM2e 显存、MIG 支持。H100（Hopper，2022）：HBM3、FP8 Tensor Core、Transformer Engine。B200（Blackwell，2024）：FP4、HBM3e、NVLink 5.0。TPU v5p：Google 的矩阵处理器。针对训练和推理的选型建议。',
      'AI 加速芯片对比：\n\n1. **NVIDIA A100（Ampere 架构）**：\n   - 制程：7nm\n   - 显存：40/80GB HBM2e（2TB/s 带宽）\n   - Tensor Core：第三代（BF16/TF32）\n   - 关键特性：MIG（Multi-Instance GPU，最多 7 实例）\n   - FP16 算力：312 TFLOPS（稀疏 624 TFLOPS）\n   - INT8 算力：624 TOPS（稀疏 1248 TOPS）\n   - 互连：NVLink 3（600GB/s）\n\n2. **NVIDIA H100（Hopper 架构）**：\n   - 制程：4nm\n   - 显存：80GB HBM3（3.35TB/s 带宽）\n   - Tensor Core：第四代（FP8 + Transformer Engine）\n   - 关键特性：DPX 指令集、FP8 训练、第二代 MIG\n   - FP16 算力：989 TFLOPS（稀疏 1979 TFLOPS）\n   - FP8 算力：1979 TFLOPS（稀疏 3958 TFLOPS）\n   - 互连：NVLink 4（900GB/s）\n\n3. **NVIDIA B200（Blackwell 架构）**：\n   - 制程：台积电 4NP（两颗 die 拼接）\n   - 显存：192GB HBM3e（8TB/s 带宽）\n   - Tensor Core：第五代（FP4/FP6）\n   - 关键特性：第二代 Transformer Engine、解压缩引擎\n   - FP16 算力：2.25 PFLOPS（单颗）\n   - FP4 算力：9 PFLOPS\n   - 互连：NVLink 5（1.8TB/s）\n\n4. **Google TPU v5p**：\n   - 架构：MXU（Matrix Multiply Unit）专用矩阵乘法\n   - 显存：HBM（95GB，4.8TB/s 带宽）\n   - 精度：BF16（主要训练精度）\n   - 互连：ICI（Inter-Chip Interconnect，定制高速网络）\n   - 优势：大规模集群训练效率高（Pod 级别调度）\n   - 劣势：仅可用于 GCP、不支持通用 GPU 计算\n\n5. **选型建议**：\n   - 训练：H100（性价比高）→ B200（旗舰）→ TPU（Google 生态）\n   - 推理：H100（吞吐优先）→ L40S（性价比）→ A100（成熟稳定）\n   - 预算有限：A100 + 量化方案\n   - 超大规模训练：TPU Pod（Google 生态）或 H100 集群',
      ['H100 是目前训练和推理的最佳平衡选择，B200 面向超大规模旗舰训练', 'TPU 在 Google 生态中集群效率高但不可移植到其他云'],
      ['GPU', 'A100', 'H100', 'B200']),

    q('ai_infra', 'hard', 'short_answer',
      'AI 基础设施网络安全与审计日志',
      '讨论 AI 基础设施的多层安全防护策略。网络隔离：VPC 分割、GPU 集群的南北向和东西向流量控制。模型访问控制：身份认证、API Key 管理、RBAC 权限。审计日志：推理请求日志、模型访问追踪、异常行为检测。合规要求和数据主权。',
      'AI 基础设施安全：\n\n1. **网络隔离**：\n   - GPU 集群网络隔离：独立 VPC/子网，不与公网直接联通\n   - 南北向流量：API Gateway 统一入口 + WAF 防护\n   - 东西向流量：GPU 节点间通信在隔离网络内（NVLink/RoCE）\n   - 推理服务网络：仅暴露必要的 API 端口\n   - 训练网络：完全内部网络，不暴露到公网\n\n2. **模型访问控制**：\n   - 身份认证：OAuth2/OIDC 集成、API Key 认证\n   - 授权：RBAC（基于角色的访问控制）\n     - 管理员：模型注册、部署、配置\n     - 开发者：训练、评估、实验\n     - 调用者：推理 API 调用\n   - 模型加密：存储加密（AES-256）和传输加密（TLS）\n\n3. **审计日志**：\n   - 推理日志：请求来源、请求内容、响应时间、模型版本\n   - 管理日志：谁在什么时候部署了什么模型\n   - 异常检测：异常请求频率、异常访问模式\n   - 日志存储：集中式日志系统（ELK/Loki）至少保留 90 天\n\n4. **安全最佳实践**：\n   - 最小权限原则：每个服务/用户只有完成任务所需的最小权限\n   - 密钥轮换：API Key 和证书定期轮换\n   - 依赖扫描：镜像和依赖包的漏洞扫描（Trivy/Snyk）\n   - 模型安全：对抗攻击防护、输出内容过滤\n\n5. **合规要求**：\n   - 数据主权：训练数据和推理数据不能跨境\n   - 隐私保护：PII 数据脱敏、差分隐私\n   - SOC2/ISO 27001：合规审计',
      ['网络隔离（GPU 集群独立 VPC）+ 访问控制（RBAC）+ 审计日志 = 三层安全', '最小权限 + 密钥轮换 + 漏洞扫描 = 持续安全运维'],
      ['网络安全', '访问控制', '审计日志', '合规']),

    q('ai_infra', 'medium', 'short_answer',
      'ML 特征存储：Feast / Tecton 与在线离线特征服务',
      '讨论 ML 特征存储（Feature Store）的架构设计。特征存储的核心功能：特征定义、特征计算、特征服务。在线特征服务：低延迟获取实时特征。离线特征服务：批量特征计算用于训练。Feast 和 Tecton 的架构对比。特征一致性的重要性。',
      '特征存储（Feature Store）：\n\n1. **核心功能**：\n   - **特征注册**：统一定义特征名称、类型、来源\n   - **特征计算**：批处理和流处理两种计算方式\n   - **特征存储**：在线（Redis/DynamoDB）和离线（Parquet/Delta Lake）\n   - **特征服务**：在线低延迟获取 + 离线批量导出\n   - **特征血缘**：记录特征的数据来源和转换逻辑\n\n2. **Feast（开源 Feature Store）**：\n   - **架构**：Feature Registry（元数据）+ Online Store + Offline Store\n   - **数据源**：支持 BigQuery、Snowflake、Redshift、文件\n   - **在线存储**：Redis、Firestore、DynamoDB\n   - **离线存储**：Parquet 文件、数据仓库\n   - **API**：Python SDK + gRPC 服务\n   - 部署：可自托管在 K8s 上\n\n3. **Tecton（商业 Feature Store）**：\n   - 基于 Feast 的商业版本（由 Feast 创始团队开发）\n   - 自动特征工程：时序特征聚合、回看窗口计算\n   - 特征监控：特征漂移检测、新鲜度监控\n   - 数据血缘：自动追踪特征来源\n   - 相比 Feast：更完整的企业功能但需要付费\n\n4. **在线 vs 离线特征**：\n   - **在线特征**：低延迟（<10ms），支持实时计算，用于推理\n   - **离线特征**：高吞吐，批量计算，用于训练\n   - **关键**：在线和离线的特征计算逻辑必须一致（训练和推理的特征值一致）\n\n5. **特征一致性**：\n   - 训练时计算的特征值和推理时计算的特征值必须一致\n   - 时间旅行：离线特征使用历史时间点计算（避免数据泄露）\n   - Feast 的 point-in-time join 保证训练数据的正确性',
      ['Feast（开源）vs Tecton（商业）= 特征注册 + 在线服务 + 离线导出', '训练推理特征一致性（point-in-time join）是 Feature Store 的核心价值'],
      ['Feature Store', 'Feast', 'Tecton', '特征工程']),

    q('ai_infra', 'medium', 'short_answer',
      'AI 基础设施事故响应与 On-Call 流程',
      '讨论 AI 基础设施的事故响应机制。常见 AI 事故类型：GPU 故障、模型退化、推理延迟飙升、训练中断。告警分级和 On-Call 轮值。事故处理 Runbook 的编写和维护。事故复盘和改进追踪。',
      'AI 事故响应：\n\n1. **常见事故类型**：\n   - **GPU 故障**：Xid 错误、ECC 错误、GPU 掉卡\n   - **模型退化**：推理质量下降、漂移检测告警\n   - **延迟飙升**：GPU 利用率异常、请求排队、OOM\n   - **训练中断**：NCCL 超时、节点故障、OOM\n   - **数据问题**：数据源不可用、Schema 变更\n\n2. **告警分级**：\n   - **P0（严重）**：核心推理服务不可用 → 立即响应（<5 分钟）\n   - **P1（高）**：部分用户受影响、训练中断 → 快速响应（<30 分钟）\n   - **P2（中）**：功能降级、延迟增加 → 当日处理\n   - **P3（低）**：告警信息、非关键问题 → 本周处理\n\n3. **On-Call 流程**：\n   - 轮值安排：每周轮换，确保有备份人员\n   - 告警通知：PagerDuty/OpsGenie 自动通知\n   - 升级机制：5 分钟未确认 → 升级到备份 On-Call\n   - 交接流程：轮值交接时同步当前状态和已知问题\n\n4. **Runbook 编写**：\n   - 每个故障类型有对应的 Runbook\n   - Runbook 内容：故障症状 → 诊断步骤 → 修复步骤 → 验证步骤\n   - Runbook 存储在团队 Wiki / Git 仓库\n   - 定期演练：每季度运行 Runbook 验证有效性\n\n5. **事故复盘**：\n   - 时间线记录：发现 → 诊断 → 修复 → 恢复的时间点\n   - 根因分析：5 Whys 方法定位根因\n   - 改进措施：短期（直接修复）+ 长期（系统改进）\n   - 跟踪：改进项排入迭代，验收后关闭',
      ['P0（5 分钟响应）+ Runbook（标准操作流程）+ 复盘（根因分析）= 事故响应闭环', '每个故障类型都要有 Runbook + 定期演练（季度）'],
      ['事故响应', 'On-Call', 'Runbook', 'SRE']),

    q('ai_infra', 'hard', 'short_answer',
      '训练数据管道：DVC 数据版本控制与血缘追踪',
      '讨论大规模训练数据的管线和治理实践。数据版本控制（DVC）：存储后端、版本标记、数据回滚。数据血缘追踪：记录数据来源、转换步骤、使用场景。数据质量检查：完整性、一致性、时效性验证。数据管道的自动触发和调度。',
      '训练数据管道：\n\n1. **DVC 数据版本控制**：\n   - 存储后端：S3、GCS、MinIO、HDFS\n   - 工作流：dvc add（添加数据）→ dvc push（上传远程）→ dvc pull（下载）\n   - 版本标记：Git tag + DVC 文件版本对应\n   - 数据回滚：git checkout 旧版本 + dvc checkout 恢复对应数据\n   - 适用场景：数据集版本化、实验可复现、团队协作\n\n2. **数据血缘追踪**：\n   - 来源追踪：原始数据从哪里来（爬虫、API、第三方）\n   - 转换追踪：每个数据经过了哪些清洗和处理步骤\n   - 使用追踪：哪些模型版本使用了哪些数据集版本\n   - 工具：DVC 管道（dvc.yaml）、MLflow Tracking、Marquez\n   - 价值：问题定位（模型退化 → 回溯到数据问题）\n\n3. **数据质量检查**：\n   - **完整性**：无缺失列、行数在预期范围\n   - **一致性**：数据类型正确、值范围合法、格式统一\n   - **时效性**：数据新鲜度符合要求、延迟在阈值内\n   - **唯一性**：无重复记录（或重复率在容忍范围内）\n   - **工具**：Great Expectations、DVC 的 dvc.yaml 集成验证步骤\n\n4. **管道调度**：\n   - 定时调度：每天/每周批量处理新数据\n   - 事件触发：新数据到达自动触发处理\n   - 增量处理：只处理新增数据（减少计算量）\n   - 全量重建：定期全量重算（保证数据一致性）\n\n5. **最佳实践**：\n   - 每个数据集版本对应一个 Git commit（完全可复现）\n   - 数据质量检查作为管道的必经门禁\n   - 数据血缘记录元数据（谁、什么、何时、为什么）\n   - 增量为主 + 定期全量 = 效率与一致性的平衡',
      ['DVC 基于 Git 管理数据版本（dvc add/push/pull + git tag），支持回滚', '数据血缘（Marquez/DVC Pipeline）+ 质量门禁（Great Expectations）= 可靠数据管道'],
      ['DVC', '数据版本控制', '数据血缘', '数据质量']),
]

DATA_DIR = os.path.dirname(os.path.abspath(__file__))
path = os.path.join(DATA_DIR, 'ai_infra.json')
with open(path, 'r', encoding='utf-8') as f:
    data = json.load(f)

existing = {q['title'] for q in data}
added = 0
for qq in NEW:
    if qq['title'] not in existing:
        data.append(qq)
        added += 1

with open(path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print(f'Added {added} questions')
print(f'Total ai_infra questions: {len(data)}')
