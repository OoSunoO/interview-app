#!/usr/bin/env python3
"""Add final questions to push mq (48→50) and design_network (49→50)."""
import json, os

def q(cat, diff, typ, title, content, answer, hints, tags):
    return dict(category=cat, difficulty=diff, type=typ, title=title,
                content=content, answer=answer, hints=hints, tags=tags)

NEW_MQ = [
    q('mq', 'medium', '问答', 'Kafka 消费者重平衡的深度优化',
      '讨论 Kafka 消费者重平衡（Rebalance）的优化策略。静态消费组（Static Group Membership）通过 group.instance.id 减少不必要的 Rebalance。Cooperative Sticky Assignor 的增量重新分配原理。Session timeout 和 heartbeat 参数的调优。大规模消费者组的 Rebalance 优化实践。',
      'Rebalance 优化：\n\n1. **Static Group Membership**：\n   - 配置 group.instance.id 为消费者实例分配固定 ID\n   - 消费者停止时 group 成员保留（无需 rebalance）\n   - 重启后直接加入（无需触发全组 rebalance）\n\n2. **Cooperative Sticky Assignor**：\n   - 分多轮进行，每轮只 revoked 需要重新分配的分区\n   - 未受影响的分区继续消费（无 Stop-The-World）\n   - 相比 Eager 模式，减少消费中断时间\n\n3. **参数调优**：\n   - session.timeout.ms（默认 45s）：检测消费者故障的超时\n   - heartbeat.interval.ms（默认 3s）：心跳间隔\n   - max.poll.interval.ms（默认 300s）：处理一批消息的最长时间\n   - 优化：适当降低 session.timeout 加快故障检测\n\n4. **大规模优化**：\n   - 分区数 = 消费者数 × 2-3（留有余量）\n   - 避免频繁的消费者加入/离开\n   - 使用 CDC 场景时考虑 Assignor 自定义',
      ['Static Group Membership 避免临时断开触发 rebalance', 'Cooperative Sticky 增量重新分配减少 Stop-The-World', '心跳参数和 session timeout 需要根据网络状况调优'], ['kafka', 'rebalance']),

    q('mq', 'medium', '问答', '消息队列的 Schema 演化与兼容性管理',
      '讨论消息队列中的 Schema 管理。Avro/Protobuf/JSON Schema 在消息队列中的应用。Schema Registry 的工作原理——注册 Schema、兼容性检查（BACKWARD/FORWARD/FULL）、Schema 版本管理。消息体中使用 Schema ID 代替完整 Schema 的优化。',
      'Schema 管理：\n\n1. **序列化格式对比**：\n   - **Avro**：紧凑、Schema 演化支持好、需要 Registry\n   - **Protobuf**：更紧凑、强类型、生成代码\n   - **JSON Schema**：可读性好、Schema 和消息 size 大\n\n2. **Schema Registry 流程**：\n   - 生产者注册 Schema → Registry 分配 Schema ID\n   - 消息体只携带 Schema ID（4 bytes），不包含完整 Schema\n   - 消费者从 Registry 获取 Schema 反序列化\n   - 缓存 Schema 到本地避免每次查询\n\n3. **兼容性检查**：\n   - **BACKWARD**：新 Schema 可读旧数据（默认）\n   - **FORWARD**：旧 Schema 可读新数据\n   - **FULL**：双向兼容\n   - **NONE**：不检查\n\n4. **演化策略**：\n   - 只添加可选字段（向后兼容）\n   - 不删除已存在字段\n   - 修改字段类型需要仔细评估\n   - 使用 Avro 的 default 值避免不兼容',
      ['Schema Registry 通过 Schema ID 代替完整 Schema 减少消息体', '兼容性检查保证消息 Schema 演化的安全性', '只添加可选字段是最安全的演化策略'], ['mq', 'schema-registry']),
]

NEW_DN = [
    q('design_network', 'hard', '问答', 'TCP BBR 拥塞控制算法原理',
      '深入分析 TCP BBR（Bottleneck Bandwidth and Round-trip propagation time）拥塞控制算法。BBR 如何基于带宽和延迟两个维度建模网络？相比 CUBIC 的改进——不依赖丢包判断拥塞。BBR 的四个阶段：Startup/Drain/ProbeBW/ProbeRTT。BBR 在公网和长肥网络中的效果。',
      'BBR 拥塞控制：\n\n1. **核心原理**：\n   - 测量两个关键指标：带宽（BW）和 RTT\n   - **BtlBw（瓶颈带宽）**：路径中的最小带宽\n   - **RTprop（传播延迟）**：路径的最小 RTT（无排队时）\n   - 发送速率 = min(BtlBw, cwnd / RTprop)\n\n2. **与 CUBIC 的区别**：\n   - CUBIC：检测到丢包 → 降速（丢包不一定代表拥塞）\n   - BBR：基于带宽和延迟模型 → 在拥塞发生前减速\n   - BBR 不需要维护队列（降低队列延迟）\n\n3. **四阶段**：\n   - **Startup**：指数增长探测带宽（x2/每 RTT）\n   - **Drain**：探测到瓶颈后降速排空队列\n   - **ProbeBW**：周期性地提升速率探测更多带宽\n   - **ProbeRTT**：降速测量 RTprop（更新基线 RTT）\n\n4. **效果**：\n   - 公网：吞吐量提升 2-10x（相比 CUBIC，特别是有丢包时）\n   - 延迟：排队延迟显著降低\n   - 公平性：与 CUBIC 流共存时可能略不友好',
      ['BBR 基于带宽和延迟建模，不依赖丢包信号（优于 CUBIC）', 'Startup → Drain → ProbeBW → ProbeRTT 四阶段循环', 'BBR 在弱网和长肥网络场景效果显著'], ['tcp', 'bbr', 'congestion-control']),
]

def main():
    base = os.path.join(os.path.dirname(__file__))
    # MQ
    path = os.path.join(base, 'mq.json')
    with open(path) as f:
        data = json.load(f)
    existing = {q['title'] for q in data}
    for q_item in NEW_MQ:
        if q_item['title'] not in existing:
            data.append(q_item)
            existing.add(q_item['title'])
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f'MQ: {len(data)} questions')
    # Design network
    path2 = os.path.join(base, 'design_network.json')
    with open(path2) as f:
        data2 = json.load(f)
    existing2 = {q['title'] for q in data2}
    for q_item in NEW_DN:
        if q_item['title'] not in existing2:
            data2.append(q_item)
            existing2.add(q_item['title'])
    with open(path2, 'w', encoding='utf-8') as f:
        json.dump(data2, f, ensure_ascii=False, indent=2)
    print(f'Design Network: {len(data2)} questions')

if __name__ == '__main__':
    main()
