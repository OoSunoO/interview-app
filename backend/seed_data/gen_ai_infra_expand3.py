#!/usr/bin/env python3
"""Expand ai_infra.json from 53 to ~100 questions."""
import json, os

def q(cat, diff, typ, title, content, answer, hints, tags):
    return dict(category=cat, difficulty=diff, type=typ, title=title,
                content=content, answer=answer, hints=hints, tags=tags)

NEW = [
    q('ai_infra', 'hard', 'short_answer', 'AI 训练与推理的基础设施对比',
      '全面对比 AI 训练和推理的基础设施需求。训练对算力的需求：高吞吐计算 + 高带宽通信。推理对延迟的要求：低延迟 + 高并发。GPU 选型：训练用 H100/B200 vs 推理用 L40S/A10。CPU/内存/网络的差异。',
      '训练 vs 推理基础设施：\n\n1. **训练需求**：\n   - 核心：高算力 + 高带宽（NVLink/NVSwitch）\n   - 网络：800Gbps+（AllReduce 通信）\n   - 内存：大显存（LLM 参数 + 优化器状态）\n   - 批量：大 batch size（吞吐优先）\n\n2. **推理需求**：\n   - 核心：低延迟 + 高并发\n   - 网络：低延迟（不需要大带宽）\n   - 内存：KV-Cache 占用（seq_len × batch × layers）\n   - 批量：动态 batch（延迟优先）\n\n3. **GPU 选型**：\n   - **训练**：H100（80GB）、B200（144GB）\n   - **推理**：L40S（48GB）、A10（24GB）、T4（16GB）\n   - **性价比**：推理选中端卡，训练选旗舰卡\n\n4. **CPU/内存**：\n   - 训练：CPU 用于数据加载和预处理\n   - 推理：CPU 用于数据预处理和 routing\n   - 内存：训练需要加载全量数据\n\n5. **部署**：\n   - 训练：计划性任务（可等待）\n   - 推理：在线服务（需要 HA）',
      ['训练 = 算力优先（H100），推理 = 延迟优先（L40S）', '训练需要 NVLink 高带宽，推理不需要'], ['ai-infra', 'training', 'inference']),

    q('ai_infra', 'hard', 'short_answer', 'GPU 集群网络拓扑与 AllReduce 通信',
      '深入分析 GPU 集群的网络拓扑对分布式训练的影响。AllReduce 的 Ring 和 Tree 算法对比。NVLink + NVSwitch 的域内通信。跨节点的 NCCL 通信（RoCE 或 InfiniBand）。网络拓扑设计——fat-tree 与 3D-Torus。',
      'GPU 集群网络：\n\n1. **AllReduce 算法**：\n   - **Ring AllReduce**：Scatter Reduce + AllGather\n   - 通信量：O(2(n-1)/n * data_size)\n   - **Tree AllReduce**：归约树，通信量 O(log n * data_size)\n   - NCCL 自动选择最优算法\n\n2. **NVLink + NVSwitch**：\n   - NVLink：GPU 直连（900GB/s H100）\n   - NVSwitch：NVLink 交换（8 GPU 全互联）\n   - 域内（8 GPU）通信无 PCIe 瓶颈\n\n3. **跨节点通信**：\n   - **InfiniBand**：高带宽（400/800Gbps）、RDMA\n   - **RoCE**：基于以太网的 RDMA、性价比高\n   - NCCL 自动选择通信路径\n\n4. **网络拓扑**：\n   - **Fat-Tree**：Clos 网络、全带宽、扩展性好\n   - **3D-Torus**：三维环形、适合特定模式\n\n5. **性能关键**：\n   - Bandwidth：AllReduce 通信需要高带宽\n   - Latency：同步点间延迟\n   - 拥塞控制：避免 incast 问题',
      ['NCCL 自动选择最优 AllReduce 算法（Ring/Tree）', 'Fat-Tree + RoCE/InfiniBand = 标准 GPU 集群网络'], ['ai-infra', 'networking', 'nccl']),

    q('ai_infra', 'hard', 'short_answer', '分布式训练的并行策略选择与权衡',
      '深入对比分布式训练的并行策略。数据并行（DP/FSDP）——每 GPU 完整模型 + 分片数据。张量并行（TP）——单层切分到多 GPU。流水线并行（PP）——层间切分。序列并行（SP）——长序列切分。Expert Parallelism——MoE 的 EP。组合策略（3D/4D 并行）。',
      '并行策略对比：\n\n1. **Data Parallelism**：\n   - 每个 GPU 完整模型、分片数据\n   - **FSDP**（Fully Sharded Data Parallel）：参数/梯度/优化器状态分片\n   - 通信：AllReduce 梯度同步\n   - 适合：模型能放进单 GPU 的场景\n\n2. **Tensor Parallelism（TP）**：\n   - 层内切分：注意力头/线性层切分到多 GPU\n   - 通信：每层前向/反向都有 AllReduce\n   - 适合：GPU 间高带宽（NVLink）\n\n3. **Pipeline Parallelism（PP）**：\n   - 模型层分组到不同 GPU\n   - 通信：组间传输 activations\n   - 问题：GPU 空闲（bubble）\n\n4. **Sequence Parallelism（SP）**：\n   - 长序列切分到多 GPU\n   - 适合训练长上下文模型\n\n5. **组合策略**：\n   - **3D 并行**：DP + TP + PP\n   - **4D 并行**：DP + TP + PP + SP\n   - 平衡：减少通信开销 vs 提高 GPU 利用率',
      ['FSDP 是最易用的数据并行方案（自动参数分片）', 'TP 需要高带宽（NVLink），PP 有 bubble 损耗'], ['ai-infra', 'parallelism', 'distributed-training']),

    q('ai_infra', 'medium', 'short_answer', 'AI 训练 Checkpoint 策略与故障恢复',
      '讨论分布式训练 Checkpoint 的策略。Checkpoint 的内容——模型权重 + 优化器状态 + 训练配置。全量 Checkpoint vs 增量 Checkpoint。异步 Checkpoint——不阻塞训练。训练故障的恢复流程。Checkpoint 存储和版本管理。',
      '训练 Checkpoint：\n\n1. **Checkpoint 内容**：\n   - **模型权重**：所有参数\n   - **优化器状态**：Adam 的 momentum/variance\n   - **训练状态**：epoch、step、learning rate\n   - **RNG 状态**：随机数生成器状态\n\n2. **全量 vs 增量**：\n   - 全量保存：全部参数（稳定但慢）\n   - 增量保存：只保存变化的部分\n   - 建议：定期全量 + 间隔增量\n\n3. **异步 Checkpoint**：\n   - 主训练不阻塞\n   - 后台线程/进程保存\n   - 内存中保持一份\n   - **PyTorch Distributed Checkpoint**（异步 API）\n\n4. **故障恢复**：\n   - 检测故障 → 加载最近的 Checkpoint\n   - 验证 Checkpoint 完整性\n   - 恢复训练状态\n   - 损失检查：验证恢复后的 loss 正常\n\n5. **存储管理**：\n   - 保留策略：Last-N + best-N\n   - 对象存储（S3）是常用的远程存储\n   - 训练自动备份',
      ['异步 Checkpoint 不阻塞训练（但需要足够内存）', '定期全量 + 间隔增量 = 保存效率和恢复速度的平衡'], ['ai-infra', 'checkpoint', 'training']),

    q('ai_infra', 'hard', 'short_answer', 'AI 推理引擎的算子融合与图优化',
      '讨论推理引擎（TensorRT/vLLM/TGI）的图优化技术。算子融合（Kernel Fusion）——将多个小算子合并为大算子减少 kernel launch 开销。内存优化——In-place 操作、内存复用。计算图优化——消除冗余计算、常量折叠。',
      '推理引擎优化：\n\n1. **算子融合**：\n   - 减少 kernel launch 次数\n   - **融合模式**：\n     - QKV 投影融合（3 个 linear → 1 个）\n     - LayerNorm + residual + activation 融合\n     - FlashAttention 融合 attention 计算\n\n2. **内存优化**：\n   - **In-place 操作**：输出可以覆盖输入\n   - **内存复用**：相同大小的 tensor 复用 buffer\n   - **PagedAttention**：vLLM 的 KV-Cache 分页管理（减少碎片）\n\n3. **图优化**：\n   - **常量折叠**：编译期计算常量\n   - **表达式化简**：消除冗余计算\n   - **死代码消除**：删除不用的节点\n   - **INT8/FP8 量化**：减少计算量\n\n4. **TensorRT 流程**：\n   - ONNX → TensorRT Builder → Optimized Engine\n   - 自动选择最佳 kernel\n   - 支持动态 shape\n\n5. **性能收益**：\n   - 算子融合：1.5-2x 加速\n   - 量化：2x 加速 + 50% 显存减少\n   - PagedAttention：90%+ KV-Cache 利用率',
      ['Kernel Fusion 减少 launch 次数（1.5-2x 加速）', 'PagedAttention 解决 KV-Cache 显存碎片问题'], ['ai-infra', 'inference', 'optimization']),

    q('ai_infra', 'hard', 'short_answer', 'LLM Serving 的 Continuous Batching 机制',
      '深入分析 Continuous Batching（连续批处理）的原理。Static Batching（传统）vs Dynamic Batching（排队）vs Continuous Batching。Decoding 阶段如何动态添加/移除请求。Iteration-level Scheduling——每步都检查能否加新请求。对 GPU 利用率的影响。',
      'Continuous Batching：\n\n1. **Batching 演进**：\n   - **Static Batching**：固定 batch，同时开始同时结束\n   - **Dynamic Batching**：攒批，达到时间/大小后执行\n   - **Continuous Batching**：每步都动态添加/移除\n\n2. **原理**：\n   - 每个请求在不同 decode 阶段\n   - 请求 decode 完成 → 移出 batch\n   - 新请求 prefilling → 加入 batch\n   - 每步 decode 时 batch 动态变化\n\n3. **Iteration-level Scheduling**：\n   - 每步（iteration）检查：\n   - 是否有请求完成 → 移出\n   - 是否有请求等待 → 加入\n   - 调整注意力 mask\n\n4. **GPU 利用率**：\n   - 传统：batch 固定，尾部请求利用率低\n   - Continuous：始终满 batch，GPU 充分使用\n   - 提升 2-3x 吞吐\n\n5. **实现**：\n   - vLLM、TGI、TensorRT-LLM 支持\n   - 需要 PageAttention 或类似的内存管理\n   - 支持优先级调度',
      ['Continuous Batching = 每步动态调整 batch（无等待）', '相比 Static Batching 提升 2-3x 吞吐'], ['ai-infra', 'batching', 'serving']),

    q('ai_infra', 'medium', 'short_answer', 'GPU 显存优化：激活重计算与卸载',
      '讨论训练和推理中的显存优化技术。激活重计算（Activation Checkpointing/Recomputation）——用计算换显存。ZeRO 优化器——参数/梯度/优化器状态分片。CPU Offload——参数卸载到 CPU 内存。显存 vs 计算 vs 通信的权衡。',
      '显存优化：\n\n1. **Activation Checkpointing**：\n   - 前向计算时不保存激活值\n   - 反向时重新计算\n   - 内存减少 50-70%\n   - 增加 20-30% 计算量\n\n2. **ZeRO 优化器**：\n   - **ZeRO-1**：优化器状态分片\n   - **ZeRO-2**：优化器状态 + 梯度分片\n   - **ZeRO-3**：分片所有（参数 + 梯度 + 优化器）\n   - 内存减少：ZeRO-3 在 64 GPU 集群上减少 64x\n\n3. **CPU Offload**：\n   - **ZeRO-Offload**：优化器状态和梯度卸载到 CPU\n   - 参数和计算在 GPU\n   - **ZeRO-Infinity**：所有状态卸载\n   - 适合 GPU 显存不足的场景\n\n4. **权衡**：\n   - Activation Checkpointing：计算 ↑ 显存 ↓\n   - ZeRO：通信 ↑ 显存 ↓\n   - CPU Offload：延迟 ↑ 显存 ↓\n\n5. **选择策略**：\n   - 显存够 → 不优化\n   - 显存轻度不足 → Activation Checkpointing\n   - 显存严重不足 → ZeRO-3 + CPU Offload',
      ['Activation Checkpointing = 20% 计算换 50% 显存', 'ZeRO-3 在 64 GPU 上减少 64x 内存（增加通信）'], ['ai-infra', 'memory', 'optimization']),

    q('ai_infra', 'medium', 'short_answer', 'LLM 推理的 Prefix Caching 与 KV-Cache',
      '讨论 LLM 推理中 KV-Cache 的优化技术。KV-Cache 的作用——避免重复计算历史 token 的键值。Prefix Caching（自动回归前缀）——相同 prompt 前缀的 KV-Cache 复用。KV-Cache 的显存管理——分页/压缩/量化。',
      'KV-Cache 优化：\n\n1. **KV-Cache 原理**：\n   - Decoder 每步计算新的 Key/Value\n   - 老的 KV 重复使用（不需要重新计算）\n   - 每次 decode 时 KV-Cache 增大\n   - 内存占用：2 × seq_len × hidden_size × layers × bytes\n\n2. **Prefix Caching**：\n   - 相同 prompt 前缀共享 KV-Cache\n   - 例如：系统 prompt 部分的 KV-Cache 可复用\n   - 命中率：共享前缀越长命中率越高\n   - vLLM 的 Automatic Prefix Caching\n\n3. **KV-Cache 显存管理**：\n   - **PagedAttention**：分块管理（类比操作系统分页）\n   - **KV-Cache 压缩**：INT8/FP8 量化 KV-Cache\n   - **KV-Cache offload**：卸载到 CPU\n\n4. **KV-Cache 量化**：\n   - FP16 → INT8：显存减半，精度影响小\n   - K 和 V 可以不同量化精度\n   - 需要 calibration\n\n5. **性能影响**：\n   - 命中 Prefix Cache：首 token 延迟减少 50-80%\n   - KV-Cache 量化：显存减少 50%\n   - PagedAttention：显存利用率从 20-40% → 95%+',
      ['Prefix Caching 让共享前缀的请求免费复用 KV-Cache', 'PagedAttention 将显存利用率从 20% 提升到 95%+'], ['ai-infra', 'kv-cache', 'optimization']),

    q('ai_infra', 'medium', 'short_answer', 'GPU 调度与编排：Kubernetes 上的 AI 负载',
      '讨论 GPU 在 K8s 上的调度。GPU 资源的声明（nvidia.com/gpu）。GPU 共享和 MPS 配置。Node 选择和亲和性。GPU 拓扑感知调度。Volcano/Kueue 的批调度。GPU 空闲资源的利用率问题。',
      'K8s GPU 调度：\n\n1. **GPU 资源声明**：\n   - `resources.limits.nvidia.com/gpu: 1`\n   - 需要 nvidia-device-plugin DaemonSet\n   - 默认独占 GPU（不能共享）\n\n2. **GPU 共享**：\n   - **MPS**：NVIDIA Multi-Process Service\n   - **MIG**：A100/H100 的 GPU 分区\n   - **Time-slicing**：时间片共享\n\n3. **拓扑感知**：\n   - 8 GPU 节点的 NVLink 全互联\n   - GPU 间通信效率：同 Node > 同机架 > 跨机架\n   - 通过 NodeLabel + affinity 控制\n\n4. **批调度**：\n   - **Volcano**：Gang Scheduling（多 Pod 同时启动）\n   - **Kueue**：队列管理 + 配额\n   - 解决：所有 GPU 都准备好了才开始训练\n\n5. **GPU 利用率**：\n   - 推理：利用率较低（需要动态扩缩容）\n   - 训练：GPU 利用率 > 90%\n   - 优化：Karpenter 等弹性伸缩',
      ['Volcano 的 Gang Scheduling 确保多 GPU 任务同时启动', 'GPU 共享（MPS/MIG）提高推理场景的资源利用率'], ['ai-infra', 'kubernetes', 'gpu']),

    q('ai_infra', 'hard', 'short_answer', '模型量化技术全览：PTQ、QAT 与量化感知训练',
      '全面分析模型量化技术。权重量化（Weight-only）——W4A16/W8A16。权重+激活量化——W8A8（INT8/FP8）。量化方法：RTN（Round-to-Nearest）、GPTQ、AWQ、SmoothQuant。量化感知训练（QAT）——在训练中模拟量化。量化校准数据集。',
      '模型量化：\n\n1. **量化类型**：\n   - **Weight-only**：权重 INT4/INT8，激活 FP16\n     - 代表：GPTQ、AWQ\n   - **Weight+Activation**：权重+激活 INT8/FP8\n     - 代表：SmoothQuant、FP8 训练\n\n2. **量化方法**：\n   - **RTN**：最简单的 round-to-nearest\n   - **GPTQ**：基于 Hessian 矩阵的权重量化\n   - **AWQ**：基于激活尺度的权重缩放\n   - **SmoothQuant**：平滑激活异常值\n\n3. **量化感知训练（QAT）**：\n   - 前向：模拟量化（FakeQuant）\n   - 反向：直通估计器（STE）\n   - 精度比 PTQ 更好但需要训练\n   - 适用：小模型（<7B）对精度敏感的场景\n\n4. **Calibration**：\n   - 选一个小数据集\n   - 统计激活分布\n   - 确定缩放因子（scale）和零点（zero-point）\n\n5. **效果**：\n   - FP16 → INT8：显存减半 + 2x 加速\n   - FP16 → INT4：显存减少 75% + 3-4x 加速\n   - 精度：INT8 基本无损失，INT4 有轻微损失',
      ['Weight-only（GPTQ/AWQ）INT4 权重 + FP16 激活是最流行的推理量化', 'QAT 精度最优但需要训练（大模型 PTQ 够用）'], ['ai-infra', 'quantization']),

    q('ai_infra', 'hard', 'short_answer', '混合精度训练：FP16/BF16/FP8 的策略',
      '深入分析混合精度训练的数值精度策略。FP16（16-bit）的数值范围问题——溢出和下溢。BF16（bfloat16）——更大的指数范围。混合精度的 Loss Scaling。FP8（E4M3/E5M2）训练。梯度裁剪和数值稳定性。',
      '混合精度训练：\n\n1. **FP16（IEEE half）**：\n   - 5 位指数 + 10 位尾数\n   - 范围：2^-24 ~ 65504\n   - **问题**：容易下溢（梯度值 < 2^-24 → 0）\n   - 需要 Loss Scaling 放大梯度\n\n2. **BF16（bfloat16）**：\n   - 8 位指数 + 7 位尾数（和 FP32 相同指数范围）\n   - 范围：2^-126 ~ 3.4e38\n   - 无下溢风险（不需要 Loss Scaling）\n   - **推荐**：AI 训练首选（A100+ 支持）\n\n3. **Loss Scaling**：\n   - 训练开始时：scale = 2^16\n   - 梯度溢出 → 跳过步骤 + 降低 scale\n   - 稳定增长 scale\n   - 动态 loss scale（自动调整）\n\n4. **FP8（H100+）**：\n   - **E4M3**：前向计算用（4 指数 + 3 尾数）\n   - **E5M2**：反向梯度用（5 指数 + 2 尾数）\n   - 训练精度接近 BF16\n   - 显存减半 + 2x 吞吐\n\n5. **AMP（Automatic Mixed Precision）**：\n   - PyTorch `torch.cuda.amp` 或 `torch.amp`\n   - 自动选择 FP16/BF16 和 FP32 的混合\n   - 参数和优化器状态 FP32\n   - 前向/反向用 FP16/BF16',
      ['BF16 比 FP16 更适合训练（更大的指数范围，无下溢）', 'FP8 训练是 H100+ 的下一代技术（显存减半）'], ['ai-infra', 'mixed-precision', 'training']),

    q('ai_infra', 'medium', 'short_answer', '模型压缩：剪枝、蒸馏与稀疏化',
      '讨论模型压缩技术的原理和效果。结构化剪枝（Structured Pruning）——去除整层/整头。非结构化剪枝——去除单个权重（稀疏矩阵）。知识蒸馏（Knowledge Distillation）——大模型教小模型。稀疏化——利用权重和激活的稀疏性加速。',
      '模型压缩：\n\n1. **剪枝（Pruning）**：\n   - **非结构化剪枝**：权重矩阵中零元素比例增加\n     - 需要稀疏矩阵硬件支持（NVIDIA 的 2:4 稀疏）\n     - Ampere 架构支持 2:4 稀疏（2x 加速）\n   - **结构化剪枝**：移除注意力头、FFN 层\n     - 直接加速（不需要特殊硬件）\n\n2. **知识蒸馏**：\n   - Teacher 模型训练 → Student 模型模仿\n   - 蒸馏损失：KL 散度（soft label）+ 交叉熵（hard label）\n   - **温度 T**：控制 softmax 平滑度\n   - 效果：小模型达到接近大模型的性能\n\n3. **稀疏化**：\n   - 权重稀疏：训练中保持稀疏\n   - 激活稀疏：ReLU 后的零值\n   - 专家稀疏：MoE 的稀疏激活\n\n4. **NVIDIA 2:4 稀疏**：\n   - 每 4 个权重保留 2 个非零\n   - 需要 fine-tuning 恢复精度\n   - 2x 矩阵乘法加速\n\n5. **组合应用**：\n   - 蒸馏 + 量化 = 最常用的组合\n   - 剪枝 + 量化 = 更激进的压缩\n   - 一步到位：Distill + Prune + Quant',
      ['NVIDIA 2:4 稀疏 = 结构化稀疏 + 2x 加速', '蒸馏 + 量化是生产中最常用的模型压缩组合'], ['ai-infra', 'compression', 'pruning']),

    q('ai_infra', 'hard', 'short_answer', 'vLLM 推理架构与 PagedAttention',
      '深入分析 vLLM 的推理架构。PagedAttention 的原理——KV-Cache 分块管理（类比虚拟内存）。Block Manager 的分配和回收。vLLM 的调度器——Continuous Batching + 优先级。vLLM 的 prefix caching。vLLM 的多节点推理。',
      'vLLM 架构：\n\n1. **PagedAttention**：\n   - KV-Cache 分成固定大小的 Block（默认 16 tokens）\n   - Block Table：逻辑块 → 物理块映射\n   - 按需分配物理块（不用预留一整段显存）\n   - 显存利用率：~95%（vs 传统 20-40%）\n\n2. **Block Manager**：\n   - 管理所有物理块分配和释放\n   - Copy-on-Write：同一 prefix 共享块\n   - 请求完成 → 块回收\n\n3. **Scheduler**：\n   - 每步检查等待队列和运行队列\n   - max_num_seqs 控制并发数\n   - 支持请求优先级\n   - 抢占：长请求被短请求抢占\n\n4. **Prefix Caching**：\n   - 自动检测相同的前缀\n   - 共享前缀的 KV-Cache\n   - 无需人工指定\n\n5. **多节点推理**：\n   - Tensor Parallelism + Pipeline Parallelism\n   - 支持多 GPU 部署\n   - Ray 分布式调度',
      ['PagedAttention 将 KV-Cache 显存利用率从 20% 提升到 95%+', 'Block Table 实现灵活分配 + Copy-on-Write + 共享前缀'], ['ai-infra', 'vllm', 'inference']),

    q('ai_infra', 'hard', 'short_answer', 'MoE（混合专家模型）的分布式训练',
      '深入分析 MoE 模型的分布式训练挑战。Expert Parallelism——不同专家在不同 GPU。Token Routing——Token 分配到专家的负载均衡。Top-K 路由的 All-to-All 通信。负载不均问题——Experts 的 Skill 不平衡和丢弃策略。MoE 训练的显存优化。',
      'MoE 分布式训练：\n\n1. **Expert Parallelism（EP）**：\n   - 每个专家分配到特定 GPU\n   - Token 路由到对应的 Expert GPU\n   - All-to-All 通信模式\n\n2. **Token Routing**：\n   - Top-2：每个 token 选择 2 个专家\n   - **Softmax routing**：gate 网络的输出\n   - **负载均衡损失**（auxiliary loss）：鼓励均匀分配\n\n3. **All-to-All 通信**：\n   - Token 发送到专家所在的 GPU\n   - 专家结果回传\n   - 通信量：token 数 × hidden_size\n   - 需要高带宽网络\n\n4. **负载不均衡**：\n   - 部分专家成为「热门」→ 过载\n   - 丢弃策略：超过容量限制的 token 跳过专家\n   - 辅助损失（aux_loss）鼓励均匀路由\n\n5. **显存优化**：\n   - 专家参数只在 EP 组内分片\n   - 配合 FSDP + TP\n   - 通信和计算的 overlap',
      ['MoE 的 All-to-All 通信是分布式训练的核心瓶颈', '辅助损失（aux_loss）是平衡专家负载的关键'], ['ai-infra', 'moe', 'distributed-training']),

    q('ai_infra', 'medium', 'short_answer', 'AI 推理的冷启动与模型加载优化',
      '讨论 AI 推理服务的冷启动问题。模型加载时间——从 S3/HDFS 下载模型。模型预热——warmup 请求填充 KV-Cache。模型分片加载——边加载边服务。模型缓存——本地缓存模型文件。模型加载的并行化和流水线。',
      '推理冷启动：\n\n1. **模型加载时间**：\n   - 100B 模型 ≈ 200GB（FP16）\n   - 从 S3 加载：10Gbps → ~160s\n   - 从本地 SSD 加载：2GB/s → ~100s\n\n2. **预热（Warmup）**：\n   - 服务启动后发一批 dummy 请求\n   - 触发编译和缓存\n   - 预热后才接收真实流量\n   - 预热时间：10-60s\n\n3. **分片加载**：\n   - 模型按 shard 分布\n   - 每个 GPU 加载自己的分片\n   - 分片间异步加载\n   - 配合 TP/PP 的分片\n\n4. **模型缓存**：\n   - 本地磁盘缓存模型（SSD）\n   - 频繁使用的模型常驻\n   - 缓存淘汰策略（LRU）\n\n5. **优化策略**：\n   - 模型预热池（预加载 + 预热）\n   - 滚动更新（不中断服务）\n   - 模型快捷切换（同时加载新旧模型）',
      ['模型加载 + 预热 = AI 推理冷启动的主要延迟', '预热池 + 滚动更新 = 生产部署最佳实践'], ['ai-infra', 'cold-start', 'model-loading']),

    q('ai_infra', 'hard', 'short_answer', 'AI 训练的数据加载与预处理管线',
      '讨论大规模训练的数据加载优化。DataLoader 的多进程预取。数据存储（对象存储 vs 分布式文件系统 vs 本地 SSD）。数据预处理（清洗/Tokenize/Shuffle）的流水线。数据加载的瓶颈定位。TFRecord/MMap 和 WebDataset 的高效格式。',
      '数据加载：\n\n1. **DataLoader 优化**：\n   - **num_workers**：多进程预取\n   - **prefetch_factor**：每个 worker 预取批数\n   - **pin_memory**：固定内存页（加速 GPU 拷贝）\n   - 瓶颈：CPU 预处理跟不上 GPU 训练\n\n2. **存储方案**：\n   - **本地 SSD**：最快（适合中小规模）\n   - **分布式文件系统**：Lustre、GPFS\n   - **对象存储**：S3（需要高吞吐访问模式）\n\n3. **预处理管线**：\n   - 清洗 → Shuffle → Tokenize → Batch\n   - Tokenize 可离线完成\n   - Shuffle 需要全局打乱（不是每个文件内打乱）\n\n4. **高效格式**：\n   - **TFRecord**：TensorFlow 格式\n   - **MMap**：内存映射文件（零拷贝加载）\n   - **WebDataset**：tar 格式的流式数据集\n   - **MosaicDS**：流式 + 全局 shuffle\n\n5. **瓶颈定位**：\n   - GPU 不排队 → 数据加载瓶颈\n   - nvidia-smi 的 GPU 利用率 < 90%\n   - 解决方案：增大 num_workers、改进存储、离线预处理',
      ['数据加载管线的目标：让 GPU 不等待（利用率 > 90%）', '离线 Tokenize + MMap/WebDataset 流式 = 最优数据管线'], ['ai-infra', 'data-loading', 'training']),

    q('ai_infra', 'medium', 'short_answer', 'LLM 推理的 Speculative Decoding',
      '深入分析 Speculative Decoding 加速推理的原理。自回归解码的瓶颈——每步一个 token。Draft Model（草稿模型）+ Target Model（验证模型）的协作。草稿模型的候选 token 生成。验证阶段的并行接受。Speculative Decoding 的性能提升。',
      'Speculative Decoding：\n\n1. **瓶颈**：\n   - 自回归每步 1 个 token\n   - 显存带宽限制（计算不是瓶颈）\n   - 需要多次模型调用\n\n2. **流程**：\n   - 小 dratf 模型快速生成 K 个候选 token\n   - 大 target 模型并行验证\n   - 接受一致的部分\n   - 不一致的重新生成\n\n3. **Draft 模型选择**：\n   - 同模型的小版本（参数少）\n   - 同模型的浅层（前几层）\n   - Medusa（在模型上添加多 head）\n\n4. **验证阶段**：\n   - Target 模型一次前向计算 K 个候选\n   - 对比概率：target 和 draft 一致 → 接受\n   - 从第一个不一致的位置重新生成\n\n5. **性能**：\n   - 加速比：1.5-3x（取决于 draft 质量）\n   - 高质量 draft → 更多 token 被接受\n   - 无精度损失（数学等价）\n   - **适用场景**：批量小、延迟敏感',
      ['Speculative Decoding = 小模型草稿 + 大模型验证', '无损加速 1.5-3x（数学等价于原始解码）'], ['ai-infra', 'speculative-decoding', 'inference']),

    q('ai_infra', 'medium', 'short_answer', 'AI 实验跟踪与模型管理（MLflow/W&B）',
      '讨论 AI 实验管理和模型注册。实验跟踪的维度：超参数 + 指标 + artifact + code version。MLflow 的 Tracking Server + Model Registry。Weights & Biases 的云端实验管理。实验对比和可视化。模型版本管理和部署审批。',
      '实验管理：\n\n1. **实验跟踪内容**：\n   - **超参数**：learning rate、batch size、优化器\n   - **指标**：train/val loss、accuracy、perplexity\n   - **Artifacts**：模型权重、checkpoints、日志\n   - **Code Version**：git commit hash\n\n2. **MLflow**：\n   - **Tracking Server**：记录实验数据\n   - **Model Registry**：模型版本管理\n   - **MLflow Projects**：可复现运行\n   - 自部署（开源）\n\n3. **W&B**：\n   - 云端服务（SaaS）\n   - 自动记录超参数和指标\n   - 丰富的可视化\n   - Sweep：超参数搜索\n\n4. **实验对比**：\n   - 并行可视化多组实验\n   - 筛选对比关键指标\n   - 确定最优配置\n\n5. **模型注册**：\n   - 版本号管理\n   - 审批流程：Staging → Production\n   - 模型描述和标签\n   - 部署回滚',
      ['实验跟踪 = 超参数 + 指标 + Artifacts + Code Version', 'MLflow（自部署）vs W&B（SaaS）取决于合规需求'], ['ai-infra', 'mlops', 'experiment-tracking']),

    q('ai_infra', 'medium', 'short_answer', 'AI 部署的 A/B 测试与金丝雀发布',
      '讨论 AI 模型的生产部署策略。模型 A/B 测试——流量分桶对比。金丝雀发布——渐进式切流。模型路由——按用户/场景路由到不同模型。模型回滚策略。在线评估指标和监控。',
      'AI 部署策略：\n\n1. **A/B 测试**：\n   - 流量分 2 组：A（旧模型）vs B（新模型）\n   - 指标对比：延迟、质量、用户反馈\n   - 统计显著性验证后再全量\n\n2. **金丝雀发布**：\n   - 5% → 25% → 50% → 100%\n   - 每个阶段验证指标\n   - 发现问题 → 回滚\n   - 自动回滚：错误率阈值\n\n3. **模型路由**：\n   - 按用户：VIP 用户用更大模型\n   - 按场景：简单分类用小模型\n   - 按内容：敏感内容走安全模型\n\n4. **回滚策略**：\n   - 蓝绿部署：两套模型随时切换\n   - 版本回滚：保留前 N 个版本\n   - 模型快照：部署前的模型权重备份\n\n5. **在线指标**：\n   - 延迟：p50/p95/p99\n   - 吞吐：QPS\n   - 错误率：超时/异常\n   - 质量：用户反馈评分',
      ['金丝雀发布（5%→100%）是 AI 模型的标准安全部署策略', '蓝绿部署保证即时回滚能力'], ['ai-infra', 'deployment', 'canary']),

    q('ai_infra', 'hard', 'short_answer', 'Prefill-Decomposition（预填充-解码分离）架构',
      '深入分析 Prefill-Decode 分离的推理架构。Prefill 阶段（计算密集型）和 Decode 阶段（显存带宽密集型）的特征。为什么分离可以优化资源利用。分离后的调度——Prefill Worker 和 Decode Worker。跨阶段通信和延迟优化。',
      'Prefill-Decode 分离：\n\n1. **两阶段差异**：\n   - **Prefill**：计算密集型（GEMM 为主）\n     - 高算力需求、低显存带宽需求\n     - 一次处理整个 prompt\n   - **Decode**：显存带宽密集型\n     - 低算力需求、高显存带宽需求\n     - 逐 token 生成\n\n2. **分离动机**：\n   - 传统：同一 GPU 同时处理 prefill 和 decode\n   - **冲突**：prefill 占 GPU 计算 → decode 延迟增加\n   - **分离**：prefill 专用 GPU + decode 专用 GPU\n\n3. **架构**：\n   - **Prefill Worker**：大算力 GPU（H100）\n   - **Decode Worker**：高内存带宽 GPU（适中的）\n   - 中间 KV-Cache 传输\n\n4. **调度**：\n   - 请求到达 → Prefill Worker 处理\n   - Prefill 完成 → KV-Cache → Decode Worker\n   - Decode Worker 逐 token 生成\n   - 均衡 prefill 和 decode 的负载\n\n5. **收益**：\n   - Decode 延迟降低（不受 prefill 影响）\n   - GPU 利用率提高（专用资源）\n   - 吞吐提升 2-3x',
      ['Prefill = 算力密集，Decode = 带宽密集（分离避免互相干扰）', '分离架构提升吞吐 2-3x（尤其混合 workload 场景）'], ['ai-infra', 'prefill-decode', 'inference-architecture']),

    q('ai_infra', 'hard', 'short_answer', 'AI 推理中的显存墙与解决方案',
      '讨论 LLM 推理的显存墙问题。单 GPU 显存限制——4090 24GB / A100 80GB / H100 80GB。超过显存时的方案：模型并行（TP/PP）+ KV-Cache 优化 + 量化。FlashAttention 减少显存占用。显存——计算——延迟的三角权衡。',
      '显存墙：\n\n1. **显存限制**：\n   - 模型权重：70B × 2 bytes（FP16）= 140GB\n   - KV-Cache：seq_len × layers × 2 × 2 bytes × batch\n   - 需要多 GPU 分布式推理\n\n2. **模型并行**：\n   - **TP**：层内切分（需要高带宽）\n   - **PP**：按层分组（减少带宽需求）\n   - 组合：TP + PP 实现任意大小模型\n\n3. **KV-Cache 优化**：\n   - PagedAttention：减少碎片\n   - KV-Cache 量化：FP16 → INT8（减半）\n   - KV-Cache 共享：Prefix caching\n   - **Multi-Query Attention（MQA）**：多个 query 共享 KV\n\n4. **FlashAttention**：\n   - 将 attention 计算分块\n   - 减少 HBM 读写（显存带宽）\n   - 不需要完整 attention 矩阵\n   - 显存：O(N) 而不是 O(N²)\n\n5. **三角权衡**：\n   - 量化（显存↓ 质量↓）\n   - 模型并行（显存↓ 通信↑）\n   - FlashAttention（显存↓ 计算稍有增加）\n   - 根据场景选择最佳组合',
      ['FlashAttention 将 attention 显存从 O(N²) 降到 O(N)', 'TP + PP + KV-Cache INT8 = 大模型推理的标准显存解'], ['ai-infra', 'memory-wall', 'flashattention']),

    q('ai_infra', 'medium', 'short_answer', 'MLOps 持续集成与持续训练（CT）',
      '讨论 MLOps 的 CI/CD/CT 实践。数据验证——数据漂移和 Schema 检查。模型验证——精度 + 性能 + 安全测试。持续训练（CT）——自动触发训练。模型部署——自动发布的流水线。AI 系统的监控和告警。',
      'MLOps 流水线：\n\n1. **数据验证**：\n   - 数据 Schema 检查\n   - 分布漂移检测（KS 检验、PSI）\n   - 缺失值/异常值检测\n   - 工具：Great Expectations、TFX\n\n2. **模型验证**：\n   - **精度验证**：在测试集上评估\n   - **性能验证**：延迟和吞吐基准\n   - **安全验证**：对抗攻击测试\n   - **公平性验证**：偏差检测\n\n3. **持续训练（CT）**：\n   - 新数据到达 → 自动触发训练\n   - 计划任务：每周/每天训练\n   - 条件触发：精度下降到阈值\n\n4. **部署流水线**：\n   - 模型打包（Docker 镜像）\n   - 蓝绿/金丝雀部署\n   - 自动回滚\n\n5. **监控**：\n   - 预测分布监控\n   - 数据漂移监控\n   - 模型退化告警\n   - 业务指标关联',
      ['CI（代码）+ CT（模型）+ CD（部署）= 完整 MLOps', '数据漂移监控 + 自动重训 = 模型精度保证'], ['ai-infra', 'mlops', 'pipeline']),

    q('ai_infra', 'hard', 'short_answer', 'DPO/RLHF 训练的基础设施挑战',
      '讨论 RLHF/DPO 训练的特殊基础设施需求。RLHF 的四模型：Policy/Reference/ Reward/Critic。PPO 训练的 KL 散度和奖励信号。Inference 和 Training 交替的调度。RLHF 的显存开销（4 个模型同时加载）。DPO 简化后的优势。',
      'RLHF 基础设施：\n\n1. **RLHF 四模型**：\n   - **Policy 模型**：要训练的模型\n   - **Reference 模型**：参考（冻结）\n   - **Reward 模型**：打分\n   - **Critic 模型**：价值函数（可选）\n   - 显存：4 个模型同时加载\n\n2. **PPO 训练步骤**：\n   - 采样：Policy 生成回答\n   - 打分：Reward 模型评分\n   - 计算：Advantage + KL 散度\n   - 更新：Policy + Critic\n\n3. **Inference + Training 交替**：\n   - 采样阶段：推理模式（Policy 生成）\n   - 学习阶段：训练模式（梯度更新）\n   - 需要灵活切换\n\n4. **显存优化**：\n   - Policy 和 Reference 可以共享部分\n   - LoRA：只训练 adapter\n   - ZeRO-3 优化\n\n5. **DPO 简化**：\n   - 不需要 Reward 和 Critic 模型\n   - 直接对比偏好数据优化\n   - 显存减半\n   - 更易训练',
      ['RLHF 需要同时加载 4 个模型（显存压力巨大）', 'DPO 简化 RLHF（去掉 Reward/Critic 模型）'], ['ai-infra', 'rlhf', 'training']),

    q('ai_infra', 'medium', 'short_answer', '模型服务框架对比：vLLM vs TGI vs Triton',
      '对比三大推理服务框架。vLLM——PagedAttention + Continuous Batching。TGI（Hugging Face）——Text Generation Inference。Triton Inference Server——NVIDIA 的多框架服务。性能、功能和支持模型的对比。',
      '推理框架对比：\n\n1. **vLLM**：\n   - 核心特性：PagedAttention、Continuous Batching、Prefix Caching\n   - 支持：大多数开源 LLM\n   - 语言：Python\n   - **性能**：吞吐最高（PagedAttention 优势）\n\n2. **TGI（Text Generation Inference）**：\n   - Hugging Face 官方\n   - 特性：Continous Batching、FlashAttention、SafeTensors\n   - 支持：HuggingFace 模型\n   - **集成**：HuggingFace 生态\n\n3. **Triton Inference Server**：\n   - NVIDIA 官方\n   - 多框架：TensorRT、PyTorch、ONNX、TensorFlow\n   - 特性：Dynamic Batching、模型串联、并发模型\n   - **适用**：企业级多模型服务\n\n4. **对比**：\n   - **吞吐**：vLLM > TGI > Triton（LLM 场景）\n   - **延迟**：TGI < vLLM < Triton\n   - **灵活性**：Triton > vLLM > TGI\n\n5. **选型建议**：\n   - LLM 专用 → vLLM 或 TGI\n   - 多模型服务 → Triton\n   - 快速部署 → TGI（开箱即用）',
      ['vLLM 吞吐最高（PagedAttention），TGI HuggingFace 集成最好', 'Triton 适合企业级多模型混合部署'], ['ai-infra', 'serving', 'comparison']),

    q('ai_infra', 'medium', 'short_answer', 'AI 模型的安全沙箱与内容审核',
      '讨论 AI 推理服务的安全措施。输入过滤——恶意提示检测。输出过滤——敏感内容拦截。模型安全——对抗攻击防护。推理沙箱——进程隔离和资源限制。内容审核——分类器 + 规则引擎。',
      'AI 安全沙箱：\n\n1. **输入过滤**：\n   - 提示注入检测\n   - 越狱 prompt 识别\n   - 敏感信息检测\n   - 黑名单/正则匹配\n\n2. **输出过滤**：\n   - 敏感内容分类器\n   - 个人身份信息（PII）检测\n   - 代码安全检查\n   - 幻觉标记\n\n3. **模型防护**：\n   - Prompt Shield（对抗 prompt）\n   - 模型微调（对齐训练）\n   - Guardrails 限制输出范围\n\n4. **沙箱执行**：\n   - 进程级隔离（每个请求独立进程）\n   - 资源限制（CPU/内存/时间）\n   - 文件系统隔离\n   - 网络访问限制\n\n5. **内容审核系统**：\n   - 多级审核：规则 → 分类器 → 人工\n   - 实时审核 + 异步抽检\n   - 分级处理：拒绝/标记/替换/放行',
      ['输入（注入检测）+ 输出（敏感内容过滤）+ 进程隔离 = 三层防护', '多级审核：规则（实时）→ 分类器（准确）→ 人工（兜底）'], ['ai-infra', 'security', 'safety']),

    q('ai_infra', 'hard', 'short_answer', 'AI 训练中的通信与计算重叠',
      '深入分析分布式训练中通信与计算的重叠技术。通信隐藏（Communication Overlap）——在计算时同时通信。AllReduce 与反向传播的 overlap——梯度计算完立刻通信。Fusion Buffer——合并小通信包减少次数。通信拓扑感知的调度。',
      '通信-计算 Overlap：\n\n1. **Overlap 原理**：\n   - 反向传播：从后向前计算梯度\n   - 每层计算完后：该层的梯度可以立刻开始通信\n   - 计算下一层时 → 同时通信已完成的梯度\n\n2. **梯度 AllReduce 重叠**：\n   - 分层 AllReduce：每层梯度准备好就发起 reduce\n   - 不需要等所有层都计算完\n   - **Bubble 减少**：通信时间部分被计算覆盖\n\n3. **Fusion Buffer**：\n   - 小梯度合并为大的 buffer\n   - 减少通信次数\n   - 增加单次通信体积\n   - 平衡：太大 → 等待时间长；太小 → 通信次数多\n\n4. **通信拓扑感知**：\n   - 同节点（NVLink）：快 → 不同策略\n   - 跨节点（RoCE/IB）：慢 → 更需要 overlap\n\n5. **性能收益**：\n   - 理想：通信完全重叠（零额外开销）\n   - 实际：减少 50-80% 通信可见开销\n   - 瓶颈：不能完全重叠时通信仍然是瓶颈',
      ['分层 AllReduce = 每层梯度计算完立刻通信（不用等全部）', '理想状态 = 通信完全被计算掩盖（零开销）'], ['ai-infra', 'communication', 'distributed-training']),

    q('ai_infra', 'medium', 'short_answer', 'Prompt 工程对推理效率的影响',
      '讨论 Prompt 设计对推理延迟和成本的影响。System Prompt 长度对 Prefill 的影响。Few-shot 示例数量的权衡。Prompt 模板的 KV-Cache 复用。长 Prompt 的首 token 延迟优化。减短 Prompt 的压缩技术。',
      'Prompt 效率：\n\n1. **System Prompt 影响**：\n   - Prefill 时间 ∝ Prompt 长度\n   - 长 System Prompt → 首 token 延迟增加\n   - 优化：精简 System Prompt\n\n2. **Few-shot 权衡**：\n   - 更多示例 → 更好的输出质量\n   - 但 prefill 时间增加\n   - **建议**：选择最相关的 2-3 个示例\n\n3. **KV-Cache 复用**：\n   - 共享 Prompt 前缀 → KV-Cache 可复用\n   - 例如：System Prompt + 固定 Few-shot\n   - 减少 Prefill 计算 50-80%\n\n4. **长 Prompt 优化**：\n   - 首 token 延迟受 Prompt 长度影响\n   - 考虑 prompt 与 chat history 分离\n   - System Prompt 存入 KV-Cache 前缀\n\n5. **压缩技术**：\n   - 关键信息提取（LLM 压缩）\n   - 删除冗余内容\n   - 结构化格式（比自然语言更高效）',
      ['System Prompt 的每个 token 都增加 Prefill 延迟', '共享前缀 KV-Cache 复用减少 Prefill 计算 50-80%'], ['ai-infra', 'prompt-optimization', 'efficiency']),

    q('ai_infra', 'medium', 'short_answer', 'AI 集群的 FinOps 与成本优化',
      '讨论 AI 基础设施的成本管理。GPU 的单位成本（$/GPU-hour）。预留实例 vs 按需 vs Spot 实例。训练 vs 推理的成本构成差异。成本优化——GPU 利用率提升、模型压缩、任务调度。成本监控和预算管理。',
      'AI FinOps：\n\n1. **GPU 成本**：\n   - H100 按需：~$4/GPU-hour（云上）\n   - A100 按需：~$2/GPU-hour\n   - 预留：~50-70% 折扣\n   - Spot：~70-90% 折扣（但可能被回收）\n\n2. **成本构成**：\n   - **训练**：GPU + 网络（NVLink）+ 存储（Checkpoint）\n   - **推理**：GPU + CPU + 内存 + 网络带宽\n   - 存储：模型文件 + 数据集 + Checkpoint\n\n3. **训练优化**：\n   - GPU 利用率 > 90%（减少浪费）\n   - 使用 Spot 实例进行实验和重训\n   - Checkpoint 压缩和增量保存\n   - 自动关机（任务完成释放资源）\n\n4. **推理优化**：\n   - 模型量化（显存减半）\n   - Batch 和缓存（提高吞吐）\n   - 弹性伸缩（根据负载）\n   - 闲置 → 缩容到 0\n\n5. **预算管理**：\n   - 按项目/团队分配预算\n   - 预算告警\n   - 异常消费检测',
      ['预留实例节省 50%+，Spot 节省 70%+（但要容忍中断）', '训练优化 GPU 利用率，推理优化每 token 成本'], ['ai-infra', 'finops', 'cost']),

    q('ai_infra', 'hard', 'short_answer', '长序列模型的训练优化：Ring Attention 与 FlashAttention',
      '讨论长序列（Long Context）训练的技术挑战和解决方案。标准 Attention 的 O(N²) 计算和显存。FlashAttention——分块计算 + 显存优化。Ring Attention——多 GPU 的序列并行。ALiBI/RoPE 的位置编码对序列扩展的影响。',
      '长序列训练：\n\n1. **Attention 复杂度**：\n   - 标准 Attention：O(N²) 计算 + O(N²) 显存\n   - N=128K → 16B 显存（仅 attention 矩阵）\n   - 不可行\n\n2. **FlashAttention**：\n   - 分块计算：将 Q/K/V 分块到 SRAM\n   - 减少 HBM 读写\n   - **效果**：O(N²) 显存 → O(N)\n   - 加速 2-10x（长序列）\n\n3. **Ring Attention**：\n   - 序列分布到多个 GPU（序列并行）\n   - 每个 GPU 处理序列的一部分\n   - Ring 拓扑：每个 GPU 从上一个获取 K/V 块\n   - 计算和通信重叠\n\n4. **位置编码**：\n   - **RoPE**（Rotary Position Embedding）：相对位置编码\n   - **ALiBI**：基于偏移的线性偏置\n   - 两者都支持长度外推（训练之外的更长序列）\n\n5. **Sequence Parallelism**：\n   - 序列维度的分布式训练\n   - 配合 TP/PP 使用\n   - 支持百万级 token 训练',
      ['FlashAttention 将显存从 O(N²) 降到 O(N)', 'Ring Attention 通过序列并行实现无限长上下文'], ['ai-infra', 'long-context', 'attention']),

    q('ai_infra', 'medium', 'short_answer', '推理服务的高可用与负载均衡',
      '讨论 AI 推理服务的生产级高可用架构。多副本部署 + 负载均衡。请求级别的故障切换。模型推理的超时和重试策略。推理服务的优雅关闭。监控和告警指标。',
      '推理高可用：\n\n1. **多副本部署**：\n   - 多个推理实例（replica）\n   - 负载均衡器分发请求\n   - 故障实例自动摘除\n\n2. **故障切换**：\n   - 单个请求超时 → 重试其他副本\n   - 副本健康检查 → 摘除故障实例\n   - 跨可用区部署\n\n3. **超时策略**：\n   - 推理超时（根据模型 P99 延迟 × 2）\n   - 连接超时（GPU 初始化时间）\n   - 重试策略：最多 3 次 + 指数退避\n\n4. **优雅关闭**：\n   - SIGTERM → 停止接收新请求\n   - 处理完进行中的请求\n   - 等待配置的时间 → 强制退出\n\n5. **监控指标**：\n   - **延迟**：p50/p95/p99\n   - **吞吐**：每分钟请求数\n   - **错误率**：4xx/5xx/超时\n   - **GPU 利用率**：计算 + 显存',
      ['多副本 + 健康检查 + 重试 = 推理高可用基础', '超时和重试策略按模型的 P99 延迟配置'], ['ai-infra', 'high-availability', 'serving']),

    q('ai_infra', 'hard', 'short_answer', '训练作业的任务调度与资源仲裁',
      '讨论 GPU 集群的作业调度策略。作业排队和优先级调度。公平调度（Fair Scheduling）——多团队共享 GPU 集群。Gang Scheduling——所有 GPU 同时就绪。作业抢占——高优先级任务抢占资源。碎片整理——GPU 资源碎片。',
      'GPU 作业调度：\n\n1. **排队系统**：\n   - 作业队列：按提交时间排序\n   - 优先级队列：高优任务插队\n   - 资源预留：根据请求的 GPU 数量\n\n2. **公平调度**：\n   - 多团队共享集群\n   - 保证最小资源 + 公平竞争剩余资源\n   - **DRF**（Dominant Resource Fairness）：主导资源公平\n   - **YARN/Kubernetes**：支持层次队列\n\n3. **Gang Scheduling**：\n   - 分布式训练需要所有 GPU 同时启动\n   - 资源不够 → 等待（不能部分分配）\n   - **Volcano**：Kubernetes 的 Gang Scheduling\n\n4. **作业抢占**：\n   - 高优 → 抢占低优任务的 GPU\n   - 保存 Checkpoint → 释放资源\n   - 低优任务释放后重新排队\n\n5. **碎片整理**：\n   - 小型任务占用 GPU → 大任务需要时整理\n   - GPU 拓扑对齐\n   - 资源预留（reservation）',
      ['Gang Scheduling 确保分布式训练所有 GPU 同时就绪', 'DRF 公平调度实现多团队共享 GPU 集群的资源公平分配'], ['ai-infra', 'scheduling', 'resource-management']),

    q('ai_infra', 'medium', 'short_answer', 'GPU 虚拟化：MIG 与 vGPU',
      '讨论 GPU 虚拟化技术。MIG（Multi-Instance GPU）——A100/H100 的硬件分区。MIG 的分区方案（1g.10gb / 2g.20gb / 3g.40gb / 7g.80gb）。vGPU（NVIDIA 虚拟 GPU）——vSphere 环境。MIG vs 时间片共享的隔离性对比。MIG 的限制。',
      'GPU 虚拟化：\n\n1. **MIG（Multi-Instance GPU）**：\n   - 硬件级隔离（A100/H100）\n   - 每个分区独立显存 + Cache + 内存控制器\n   - 故障隔离（一个分区崩溃不影响其他）\n   - **分区方案**：\n     - 1g.10gb：1 个 GPC + 10GB 显存\n     - 2g.20gb：2 个 GPC + 20GB\n     - 3g.40gb：3 个 GPC + 40GB\n     - 7g.80gb：7 个 GPC + 80GB（整卡）\n\n2. **MIG 用途**：\n   - 单卡跑多个推理服务\n   - 开发和测试环境共用 GPU\n   - 资源隔离\n\n3. **vGPU**：\n   - NVIDIA 虚拟 GPU（VMware 环境）\n   - GPU 时间片共享\n   - 显存虚拟化\n   - **不是硬件隔离**（时间片切换有开销）\n\n4. **MIG vs 时间片**：\n   - MIG：硬件隔离（强隔离）\n   - 时间片：软件共享（有切换开销）\n   - MIG 适合多租户安全场景\n\n5. **MIG 限制**：\n   - 只支持 A100/H100\n   - 不支持训练（不支持 NCCL）\n   - 分区不可动态调整（需重置 GPU）',
      ['MIG（硬件隔离）vs 时间片（软件共享）', 'MIG 适合推理多租户但分区不可动态调整'], ['ai-infra', 'gpu-virtualization', 'mig']),

    q('ai_infra', 'hard', 'short_answer', 'AI 基础设施的容量规划与扩展',
      '讨论 AI 基础设施的容量规划。训练容量的估算——模型大小 × token 数 × FLOPS 利用率。推理容量的估算——QPS × 延迟要求。GPU 池化——训练/推理共享。未来需求的趋势预测。扩缩容策略——弹性和计划性。',
      'AI 容量规划：\n\n1. **训练容量**：\n   - 公式：所需 GPU 数 = (模型参数量 × 6 × token 数) / (GPU FLOPS × 利用率 × 时间)\n   - 6 = 每个 token 的前向 (2) + 反向 (4) 计算量\n   - 示例：70B 模型、3T token、50% FLOPS 利用率\n   - H100 训练：~50 GPU 天\n\n2. **推理容量**：\n   - 公式：所需 GPU 数 = QPS × 延迟 × (1 + 冗余因子)\n   - 每个 GPU 吞吐：~1000 tokens/s（70B FP16）\n   - 需要考虑峰值和冗余\n\n3. **GPU 池化**：\n   - 训练和推理使用不同的 GPU 类型\n   - 空闲训练 GPU 可临时用于批量推理\n   - 弹性伸缩\n\n4. **趋势预测**：\n   - 每 2 年模型大小增长 10x\n   - 推理 token 消耗增长 > 训练\n   - 规划时要留有余量\n\n5. **扩展策略**：\n   - 水平扩展：增加 GPU 节点\n   - 垂直扩展：升级到更强 GPU\n   - 混合：预留 + Spot',
      ['训练容量 = 模型 × token × 6 / (FLOPS × 利用率 × 时间)', '推理容量 = QPS × 延迟要求 + 冗余'], ['ai-infra', 'capacity-planning', 'scaling']),

    q('ai_infra', 'medium', 'short_answer', '模型 Fine-tuning 的平台与流程',
      '讨论 Fine-tuning 的平台和工具。参数高效微调——LoRA/QLoRA/Adapter。微调流程——数据准备 → 训练 → 评估 → 部署。微调平台——HuggingFace PEFT、Axolotl、Unsloth。QLoRA——4-bit 量化的低秩适配微调。',
      'Fine-tuning：\n\n1. **参数高效微调（PEFT）**：\n   - **LoRA**：低秩适配矩阵（训练 rank ≤ 64 的矩阵）\n   - **QLoRA**：4-bit LoRA（显存减少 4x）\n   - **Adapter**：插入小网络层\n   - 效果：微调参数只有 0.1-1% 的全量参数\n\n2. **LoRA 原理**：\n   - 原始权重冻结 W ∈ R^{d×k}\n   - 增加低秩适配 B×A (B ∈ R^{d×r}, A ∈ R^{r×k})\n   - 输出 = Wx + BAx\n   - r 通常 = 8/16/32/64\n\n3. **QLoRA**：\n   - 预训练权重 4-bit NormalFloat 量化\n   - LoRA 适配器保持 FP16\n   - 通过 double quantization 减少显存\n   - **效果**：65B 模型微调只需要 48GB 显存\n\n4. **微调平台**：\n   - **HuggingFace PEFT**：LoRA/QLoRA 的一站式库\n   - **Axolotl**：配置驱动的微调框架\n   - **Unsloth**：加速的 LoRA 微调\n\n5. **流程**：\n   - 数据准备：清洗 → 格式化 → 拆分\n   - 训练：配置 LoRA rank + learning rate + epoch\n   - 评估：验证集 loss、人工评估\n   - 部署：合并权重或分离加载',
      ['LoRA 只训练 0.1-1% 的参数（显存和训练时间减少 99%）', 'QLoRA 让 65B 模型微调只需要 48GB 显存（单卡 A100）'], ['ai-infra', 'fine-tuning', 'lora']),

    q('ai_infra', 'hard', 'short_answer', 'AI 模型的 ONNX 导出与跨平台部署',
      '讨论模型的 ONNX 导出和跨平台推理。ONNX 的算子集和版本兼容性。PyTorch → ONNX 导出的注意事项——动态轴、控制流。ONNX Runtime 的推理优化——执行提供者（CPU/CUDA/TensorRT）。ONNX 的限制和替代方案。',
      'ONNX 部署：\n\n1. **ONNX 格式**：\n   - 中间表示（不是框架特定）\n   - **算子集（opset）**：版本管理的算子定义\n   - 计算图的序列化\n\n2. **PyTorch → ONNX**：\n   - `torch.onnx.export(model, dummy_input, "model.onnx")`\n   - **动态轴**：batch size / seq len 动态定义\n   - **控制流**：if/loop 需要 traced 或 script\n   - **注意事项**：不支持所有 PyTorch 操作\n\n3. **ONNX Runtime**：\n   - **Execution Provider（EP）**：\n     - CPU：通用\n     - CUDA：NVIDIA GPU\n     - TensorRT：NVIDIA 优化推理\n     - OpenVINO：Intel 设备\n   - 自动选择最优 EP\n\n4. **优化**：\n   - 图优化（常量折叠 + 节点融合）\n   - 量化（ONNX Runtime 训练后量化）\n   - INT8 量化\n\n5. **限制与替代**：\n   - 复杂模型导出困难（transformer/attention）\n   - 替代：PyTorch JIT、TensorRT 直接优化、CoreML\n   - **推荐**：ONNX 用于 CPU/移动端，TensorRT 用于 GPU',
      ['ONNX = 模型中间表示（多框架互通）', 'ONNX Runtime 的 Execution Provider 支持 CPU/CUDA/TensorRT'], ['ai-infra', 'onnx', 'deployment']),

    q('ai_infra', 'medium', 'short_answer', 'AI 模型的持续监控与退化检测',
      '讨论 AI 模型的在线监控和退化检测。数据漂移（Data Drift）——输入分布变化。概念漂移（Concept Drift）——输入-输出关系变化。模型退化检测——准确率/延迟/异常。监控告警和自动重训触发。',
      'AI 模型监控：\n\n1. **数据漂移（Data Drift）**：\n   - 输入特征分布变化\n   - 检测方法：KS 检验、PSI（Population Stability Index）\n   - 类别分布变化\n   - 原因：用户行为变化、新数据源\n\n2. **概念漂移（Concept Drift）**：\n   - 输入到输出的映射关系变化\n   - 更难检测（没有 ground truth）\n   - 代理指标：用户反馈、下游指标\n\n3. **监测指标**：\n   - **输入**：特征分布、缺失率\n   - **输出**：预测分布、置信度\n   - **性能**：延迟、吞吐\n   - **业务**：转化率、点击率\n\n4. **退化检测**：\n   - 置信度下降（模型不确定）\n   - 预测分布偏移\n   - 异常请求增多\n   - 延迟增加\n\n5. **告警和自动处理**：\n   - 漂移阈值告警\n   - 自动回滚到旧模型\n   - 自动触发重新训练',
      ['数据漂移（输入变化）+ 概念漂移（关系变化）= 模型退化的两大原因', 'PSI 和 KS 检验是检测分布漂移的标准统计方法'], ['ai-infra', 'monitoring', 'drift-detection']),
]

def main():
    path = os.path.join(os.path.dirname(__file__), 'ai_infra.json')
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
    print(f'Total ai_infra questions: {len(data)}')

if __name__ == '__main__':
    main()
