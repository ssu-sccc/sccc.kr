#include <algorithm>
#include <cstdlib>
#include <string>
#include <utility>
#include <vector>
using namespace std;

// Frog 1: heights are indexed from 0; recover a minimum-cost path too.
pair<long long, vector<int>> frog_path(const vector<int>& h) {
    int n = (int)h.size(); // n >= 1
    vector<long long> dp(n, 1LL << 60);
    vector<int> parent(n, -1);
    dp[0] = 0;
    for (int i = 1; i < n; ++i)
        for (int j = max(0, i - 2); j < i; ++j) {
            long long candidate = dp[j] + abs(h[i] - h[j]);
            if (candidate < dp[i]) {
                dp[i] = candidate;
                parent[i] = j;
            }
        }
    vector<int> path;
    for (int v = n - 1; v != -1; v = parent[v]) path.push_back(v);
    reverse(path.begin(), path.end());
    return {dp[n - 1], path};
}

// Knapsack 1: each (positive weight, value) item can be used at most once.
long long knapsack01(const vector<pair<int,long long>>& items, int W) {
    vector<long long> dp(W + 1, 0); // capacity AT MOST w
    for (auto [weight, value] : items)
        for (int w = W; w >= weight; --w)
            dp[w] = max(dp[w], dp[w - weight] + value);
    return dp[W];
}

// LCS: table values are lengths; the returned object is a subsequence.
string lcs_string(const string& s, const string& t) {
    int n = (int)s.size(), m = (int)t.size();
    vector<vector<int>> dp(n + 1, vector<int>(m + 1));
    for (int i = 1; i <= n; ++i)
        for (int j = 1; j <= m; ++j) {
            dp[i][j] = max(dp[i - 1][j], dp[i][j - 1]);
            if (s[i - 1] == t[j - 1])
                dp[i][j] = max(dp[i][j], dp[i - 1][j - 1] + 1);
        }
    string answer;
    int i = n, j = m;
    while (i && j) {
        if (s[i - 1] == t[j - 1] && dp[i][j] == dp[i - 1][j - 1] + 1) {
            answer += s[i - 1]; --i; --j;
        } else if (dp[i - 1][j] >= dp[i][j - 1]) --i;
        else --j;
    }
    reverse(answer.begin(), answer.end());
    return answer;
}
