var e=`algorithm_extras`,t=[{category:`algorithm_extras`,difficulty:`medium`,type:`short_answer`,title:`快速幂与矩阵快速幂`,content:`请介绍快速幂的原理以及如何推广到矩阵快速幂。`,answer:`答案：快速幂（Binary Exponentiation）用 O(log n) 的时间计算 a^n。

快速幂原理：
- 将 n 写成二进制形式：n = b0*2^0 + b1*2^1 + ... + bk*2^k
- a^n = a^(b0*2^0) × a^(b1*2^1) × ... × a^(bk*2^k)
- 每次迭代：a = a * a（平方），如果当前位为 1 则乘到结果中

实现要点：
- 使用位运算：while n > 0: if n & 1: res *= a; a *= a; n >>= 1
- 注意取模运算：(a * b) % mod
- 处理 n = 0 的情况：结果为 1

矩阵快速幂：
- 同样原理，将 a 从标量换成矩阵
- 矩阵乘法：C[i][j] = sum(A[i][k] * B[k][j])
- 需要实现矩阵乘法函数（O(k³)，k 为矩阵边长）

典型应用（用矩阵快速幂优化递推）：
1. 斐波那契数列：
   - 转移矩阵 [[1,1],[1,0]] 的 n 次方
   - [F[n], F[n-1]] = [F[1], F[0]] × M^(n-1)
2. 线性递推：任意 k 阶线性递推都可以用 k×k 转移矩阵 O(k³ log n) 求第 n 项
3. 图论：邻接矩阵的 k 次方 = 长度为 k 的路径数

复杂度：
- 快速幂：O(log n)
- 矩阵快速幂：O(k³ log n)，k 为矩阵边长

扩展延伸：
- 常系数齐次线性递推可以用 BM 算法（Berlekamp-Massey）求出递推式后再用矩阵快速幂
- 对于大 k（>1000）的递推，线性递推（Linear Recurrence）用多项式技巧（多项式取模）优化到 O(k² log n) 或 O(k log k log n)`,hints:[`快速幂：二进制分解指数，迭代平方，O(log n)`,`矩阵快速幂：将标量乘法替换为矩阵乘法，用于线性递推 O(k³ log n)`,`经典应用：斐波那契数列、线性递推、图论路径计数`],tags:[`算法`,`快速幂`,`矩阵快速幂`,`递推`],content_hash:`ad84cd5e9187`,id:458},{category:`algorithm_extras`,difficulty:`easy`,type:`choice`,title:`二维矩阵搜索策略`,content:`在一个每行从左到右递增且每列从上到下递增的矩阵中搜索目标值，最优算法的复杂度是？`,options:[`A) O(M*N) 暴力搜索`,`B) O(M*logN) 每行二分`,`C) O(M+N) 从右上角开始搜索`,`D) O(log(M*N)) 全局二分`],answer:`答案：C) O(M+N) 从右上角开始搜索

解析：在一个每行从左到右递增、每列从上到下递增的矩阵中搜索目标值，最优策略是从右上角（或左下角）开始。
1）从右上角开始：如果 target > 当前值，向下移动（行+1）；如果 target < 当前值，向左移动（列-1）。每次排除一行或一列，最多走 M+N 步。
2）为什么不是每行二分（O(M log N)）：M 行 × log N 虽然也是可行的，但在最坏情况下 M log N > M + N（当 M 和 N 都较大时）。
3）暴力搜索 O(M×N) 显然是最差的。全局二分不可行——二维矩阵不是完全有序的（只有每行每列各自有序，但行与行之间不是全序）。

这个技巧的另一种视角是「以右上角为根的一棵二叉搜索树」——左子树（向左）值变小，右子树（向下）值变大。`,hints:[`从右上角开始，比目标大向左移，比目标小向下移，每次排除一行或一列`],tags:[`矩阵`,`搜索`,`算法`],content_hash:`6b6369e6a348`,id:459},{category:`algorithm_extras`,difficulty:`hard`,type:`coding`,title:`接雨水 II (Trapping Rain Water II)`,content:`给定一个 m x n 的矩阵，其中的值代表每个单元格的高度。请你计算该矩阵形状能够接住的最大雨水量（三维接雨水）。`,answer:`解题思路：三维接雨水不能直接使用二维接雨水的双指针法，需要使用最小堆（优先队列）从边界向内BFS。

算法步骤：1）将矩阵最外圈的所有单元格加入最小堆（按高度排序），并标记为已访问。2）初始化总水量为0，边界最高水位为堆顶最小高度。3）从堆中弹出最低的单元格，检查其四个方向邻居。4）如果邻居高度低于当前边界水位，则水量 += 边界水位 - 邻居高度；否则更新边界水位。5）将邻居加入堆并标记已访问。6）重复直到堆为空。

关键思路：水从边界向内流，永远从最低的缺口处向外溢。所以用最小堆保证每次处理的是当前所有边界中最矮的点。

复杂度：O(m*n*log(m+n)) 时间，O(m*n) 空间。

\`\`\`java
// BFS + 最小堆解法
public int trapRainWater(int[][] heightMap) {
    if (heightMap == null || heightMap.length == 0) return 0;
    int m = heightMap.length, n = heightMap[0].length;
    boolean[][] visited = new boolean[m][n];
    PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[2] - b[2]);
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            if (i == 0 || i == m-1 || j == 0 || j == n-1) {
                pq.offer(new int[]{i, j, heightMap[i][j]});
                visited[i][j] = true;
            }
        }
    }
    int[][] dirs = {{0,1},{0,-1},{1,0},{-1,0}};
    int res = 0, maxH = 0;
    while (!pq.isEmpty()) {
        int[] cell = pq.poll();
        maxH = Math.max(maxH, cell[2]);
        for (int[] d : dirs) {
            int x = cell[0]+d[0], y = cell[1]+d[1];
            if (x >= 0 && x < m && y >= 0 && y < n && !visited[x][y]) {
                visited[x][y] = true;
                res += Math.max(0, maxH - heightMap[x][y]);
                pq.offer(new int[]{x, y, Math.max(heightMap[x][y], maxH)});
            }
        }
    }
    return res;
}
\`\`\``,hints:[`为什么三维接雨水不能直接复用二维的左右双指针解法`,`最小堆中存储的元素应该包含哪些信息——坐标和高度，为什么高度用于决定水位`],tags:[`算法`,`堆`,`BFS`,`接雨水`],content_hash:`fad9b6a2ab53`,id:463},{category:`algorithm_extras`,difficulty:`hard`,type:`coding`,title:`二叉树的最大宽度`,content:`给定一棵二叉树，求其最大宽度。宽度定义为每一层的节点数，包括中间的空节点（null 节点也要计入位置）。二叉树的最大宽度是所有层的最大宽度。`,answer:`核心思路：对节点进行编号（类似堆的索引），利用 BFS 层序遍历计算每层首个和末尾节点的编号差。

\`\`\`java
public int widthOfBinaryTree(TreeNode root) {
    if (root == null) return 0;
    Queue<Pair<TreeNode, Integer>> queue = new LinkedList<>();
    queue.offer(new Pair<>(root, 1));  // 根节点编号为 1
    int maxWidth = 1;

    while (!queue.isEmpty()) {
        int size = queue.size();
        int left = queue.peek().getValue();  // 当前层最左节点编号
        int right = left;

        for (int i = 0; i < size; i++) {
            Pair<TreeNode, Integer> pair = queue.poll();
            TreeNode node = pair.getKey();
            int idx = pair.getValue();
            right = idx;

            if (node.left != null) {
                queue.offer(new Pair<>(node.left, idx * 2));
            }
            if (node.right != null) {
                queue.offer(new Pair<>(node.right, idx * 2 + 1));
            }
        }
        maxWidth = Math.max(maxWidth, right - left + 1);
    }
    return maxWidth;
}
\`\`\`

时间复杂度 O(n)，空间 O(n)。

关键细节：1）如果树的深度很大（如 1000 层），编号指数级增长会导致整数溢出。解决方案：每层偏移归一化——将最左节点的编号重新映射为 1。2）DFS 解法也通用，用 Map<level, firstIndex> 记录每层第一个节点编号。

扩展延伸：如果题目问的是「二叉树最大宽度（不考虑空节点）」则是简单的每层 BFS 计数。本题的难点在于空节点也计入位置——堆编号法是直观解法。`,hints:[`为什么要用堆编号的方式而不是简单的层节点计数`,`树的深度很大时编号溢出如何解决`],tags:[`二叉树`,`BFS`,`宽度`,`编号`],content_hash:`923a0c166442`,id:464}];export{e as category,t as questions};