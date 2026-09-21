#include <algorithm>
#include <functional>
#include <tuple>
#include <vector>
using namespace std;

// Exact counts fit in long long for 0 <= n <= 91.
long long stairs_bottom_up(int n) {
    vector<long long> dp(n + 1);
    dp[0] = 1; // one empty path
    for (int i = 1; i <= n; ++i) {
        dp[i] = dp[i - 1];                  // i-1 -> i
        if (i >= 2) dp[i] += dp[i - 2];     // i-2 -> i
    }
    return dp[n];
}

long long stairs_top_down(int n) {
    vector<long long> memo(n + 1, -1);
    function<long long(int)> solve = [&](int i) -> long long {
        if (memo[i] != -1) return memo[i];
        if (i == 0) return memo[i] = 1;
        long long answer = solve(i - 1);
        if (i >= 2) answer += solve(i - 2);
        return memo[i] = answer; // finalize after predecessors return
    };
    return solve(n);
}

// Vertices 0..n-1 are already in topological order: every edge u < v.
// All finite path sums have absolute value < INF/2.
vector<long long> dag_min_cost(
    int n, const vector<tuple<int,int,long long>>& edges
) {
    const long long INF = 1LL << 60;
    vector<vector<pair<int,long long>>> incoming(n);
    for (auto [u,v,c] : edges) incoming[v].push_back({u,c});
    vector<long long> dp(n, INF);
    dp[0] = 0;
    for (int v = 1; v < n; ++v)
        for (auto [u,c] : incoming[v])
            if (dp[u] != INF)
                dp[v] = min(dp[v], dp[u] + c); // u --c--> v
    return dp;
}

// n,m >= 1; counts modulo MOD, no blocked cells.
long long grid_paths(int n, int m) {
    const long long MOD = 1000000007;
    vector<vector<long long>> dp(n, vector<long long>(m));
    dp[0][0] = 1;
    for (int r = 0; r < n; ++r)
        for (int c = 0; c < m; ++c) {
            if (r > 0) dp[r][c] += dp[r - 1][c]; // above -> current
            if (c > 0) dp[r][c] += dp[r][c - 1]; // left  -> current
            dp[r][c] %= MOD;
        }
    return dp[n - 1][m - 1];
}
