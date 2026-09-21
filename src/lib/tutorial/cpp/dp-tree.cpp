#include <algorithm>
#include <array>
#include <functional>
#include <utility>
#include <vector>
using namespace std;

// g is a nonempty undirected tree; sums fit in long long.
long long tree_independent_set(const vector<vector<int>>& g,
                               const vector<long long>& weight) {
    vector<array<long long,2>> dp(g.size());
    function<void(int,int)> dfs = [&](int v, int p) {
        dp[v] = {0, weight[v]};
        for (int c : g[v]) if (c != p) {
            dfs(c,v); // child -> parent dependency
            dp[v][0] += max(dp[c][0], dp[c][1]);
            dp[v][1] += dp[c][0];
        }
    };
    dfs(0,-1);
    return max(dp[0][0],dp[0][1]);
}

// Maximum weight of an independent set with EXACTLY K vertices.
// NEG means impossible. All valid sums have absolute value < 2^59.
long long tree_exact_k(const vector<vector<int>>& g,
                       const vector<long long>& weight, int K) {
    const long long NEG = -(1LL << 60);
    using Table = array<vector<long long>,2>;
    function<Table(int,int)> dfs = [&](int v,int p) -> Table {
        Table a = {vector<long long>(K+1,NEG), vector<long long>(K+1,NEG)};
        a[0][0] = 0;
        if (K >= 1) a[1][1] = weight[v];
        for (int c : g[v]) if (c != p) {
            Table b = dfs(c,v);
            Table next = {vector<long long>(K+1,NEG), vector<long long>(K+1,NEG)};
            for (int s = 0; s < 2; ++s)
                for (int x = 0; x <= K; ++x)
                    for (int y = 0; x+y <= K; ++y) {
                        long long child = s ? b[0][y] : max(b[0][y],b[1][y]);
                        if (a[s][x] == NEG || child == NEG) continue;
                        next[s][x+y] = max(next[s][x+y], a[s][x]+child);
                    }
            a = std::move(next); // each child is used exactly once
        }
        return a;
    };
    auto root = dfs(0,-1);
    return max(root[0][K],root[1][K]);
}
