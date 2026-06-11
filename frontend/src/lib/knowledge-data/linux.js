export const knowledge = {
  "Linux 基础命令": {
    category: "linux",
    domain: "linux",
    source: "综合整理",
    content: `## Linux 基础命令

> 来源：综合整理

### 文件操作
- \`ls -la\`：列出文件详情（含隐藏文件）
- \`cp -r\`：递归复制目录
- \`mv\`：移动/重命名
- \`rm -rf\`：强制递归删除（危险操作）
- \`find . -name '*.js'\`：递归查找文件
- \`tar -czf archive.tar.gz dir/\`：压缩
- \`tar -xzf archive.tar.gz\`：解压

### 文本处理
- \`grep -E 'pattern' file\`：扩展正则搜索
- \`sed -i 's/old/new/g' file\`：原地替换
- \`awk '{print $1}' file\`：按列切割
- \`sort -rh\`：按人类可读大小排序
- \`uniq -c\`：去重计数
- \`head -n 10\` / \`tail -n 10\`：首尾行

### 进程管理
- \`ps aux | grep java\`：查找进程
- \`top -p PID\`：监控特定进程
- \`kill PID\`：优雅终止（SIGTERM）
- \`kill -9 PID\`：强制终止（SIGKILL）
- \`nohup command &\`：后台运行
- \`jobs\` / \`fg\` / \`bg\`：作业控制`,
  },
  "Shell 编程": {
    category: "linux",
    domain: "linux",
    source: "综合整理",
    content: `## Shell 编程

> 来源：综合整理

### 变量
- \`name="value"\`：赋值（等号两侧无空格）
- \`\$\{name:-default\}\`：默认值
- \`\$(command)\`：命令替换

### 条件判断
\`\`\`bash
if [ -f "\$file" ]; then
  echo "文件存在"
elif [ -d "\$dir" ]; then
  echo "目录存在"
fi
\`\`\`

### 循环
\`\`\`bash
# for 循环
for f in *.txt; do
  echo "\$f"
done

# while 读文件
while IFS= read -r line; do
  echo "\$line"
done < file.txt
\`\`\`

### 常用测试
- \`-f file\`：是否为普通文件
- \`-d dir\`：是否为目录
- \`-z str\`：字符串是否为空
- \`-n str\`：字符串非空
- \`\$? \`：上条命令退出码（0=成功）

### 安全实践
- 始终用双引号包裹变量：\`"\$var"\`（防止分词和通配符展开）
- \`set -e\`：出错即退出
- \`set -u\`：使用未定义变量时报错
- \`trap 'cleanup' EXIT\`：确保清理`,
  },
  "Linux 三剑客": {
    category: "linux",
    domain: "linux",
    source: "Linux man 手册",
    content: `## Linux 三剑客：grep、sed、awk

> 来源：Linux man 手册

### grep
- \`grep 'pattern' file\`：搜索匹配行
- \`grep -r 'pattern' dir/\`：递归搜索
- \`grep -E 'pattern'\`：扩展正则（同 egrep）
- \`grep -v\`：反向匹配
- \`grep -l\`：只输出文件名

### sed
- \`sed 's/old/new/g' file\`：全局替换
- \`sed -n '1,10p' file\`：打印 1-10 行
- \`sed -i '' 's/old/new/g' file\`（macOS 需空参数）
- \`sed '/pattern/d'\`：删除匹配行

### awk
- \`awk '{print \$1, \$3}'\`：打印第 1、3 列
- \`awk -F: '{print \$1}'\`：指定分隔符
- \`awk '\$3 > 100 {print}'\`：条件过滤
- \`awk 'END{print NR}'\`：统计行数
- 内置变量：\`NR\`（行号）、\`NF\`（列数）、\`\$0\`（整行）`,
  },
  "Linux 性能排查": {
    category: "linux",
    domain: "linux",
    source: "RHCSA/RHCE 考点",
    content: `## Linux 性能排查

> 来源：RHCSA/RHCE 考点

### CPU
- \`top\` / \`htop\`：实时 CPU 占用
- \`mpstat -P ALL 1\`：每个 CPU 核的利用率
- \`perf top\`：热点函数（需要符号表）
- 排查思路：us（用户态）高 → 应用问题；sy（内核态）高 → 系统调用频繁；wa（I/O 等待）高 → 磁盘瓶颈

### 内存
- \`free -h\`：总/已用/可用内存
- \`vmstat 1\`：内存、交换、IO 统计
- \`smem\`：PSS（更准确的内存占用）
- \`cat /proc/meminfo\`：详细内存信息
- OOM Killer：dmesg | grep -i oom

### 磁盘
- \`iostat -xz 1\`：磁盘 IOPS 和延迟
- \`iotop\`：每个进程的 IO 使用
- \`df -h\`：磁盘空间
- \`du -sh *\`：目录大小
- 关键指标：await（IO 等待时间，<10ms 正常）、%util（磁盘饱和度）

### 网络
- \`netstat -tlnp\`：端口监听
- \`ss -tlnp\`：更快的 netstat
- \`sar -n DEV 1\`：网络吞吐量
- \`tcpdump -i eth0 port 80\`：抓包
- \`nslookup\` / \`dig\`：DNS 查询`,
  },
};
