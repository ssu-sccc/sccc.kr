#include <algorithm>
#include <tuple>
#include <utility>
#include <vector>
using namespace std;

// Same DAG as the basic lesson: every edge u < v; source 0.
// Finite path sums have absolute value < INF/2. n >= 1.
pair<long long,vector<int>> shortest_with_path(
    int n, const vector<tuple<int,int,long long>>& edges, int target
) {
    const long long INF = 1LL << 60;
    vector<vector<pair<int,long long>>> incoming(n);
    for (auto [u,v,c] : edges) incoming[v].push_back({u,c});
    vector<long long> dp(n,INF);
    vector<int> parent(n,-1);
    dp[0] = 0;
    for (int v = 1; v < n; ++v)
        for (auto [u,c] : incoming[v]) {
            if (dp[u] == INF) continue;
            if (dp[u]+c < dp[v]) {
                dp[v] = dp[u]+c;
                parent[v] = u; // keep the witness with its value
            }
        }
    if (dp[target] == INF) return {INF,{}};
    vector<int> path;
    for (int v = target; v != -1; v = parent[v]) path.push_back(v);
    reverse(path.begin(),path.end());
    return {dp[target],path};
}
