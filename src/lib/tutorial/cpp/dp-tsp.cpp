#include <algorithm>
#include <vector>
using namespace std;

// Complete directed graph, 1 <= n <= 20, |cost[v][u]| <= 10^12.
long long tsp_cycle(const vector<vector<long long>>& cost) {
    int n = (int)cost.size(), full = (1 << n) - 1;
    if (n == 1) return 0; // empty tour
    const long long INF = 1LL << 60;
    vector<vector<long long>> dp(1 << n, vector<long long>(n, INF));
    dp[1][0] = 0; // visited {0}, endpoint 0
    for (int mask = 1; mask <= full; ++mask)
        for (int v = 0; v < n; ++v) {
            if (dp[mask][v] == INF) continue;
            for (int u = 0; u < n; ++u) {
                if (mask & (1 << u)) continue;
                int nmask = mask | (1 << u); // visited set + city u
                dp[nmask][u] = min(dp[nmask][u],
                                  dp[mask][v] + cost[v][u]);
            }
        }
    long long answer = INF;
    for (int v = 1; v < n; ++v)
        answer = min(answer, dp[full][v] + cost[v][0]);
    return answer;
}
