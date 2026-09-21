#include <algorithm>
#include <vector>
using namespace std;

// Count independent sets of an n*m grid, modulo MOD. n >= 1, 1 <= m <= 20.
long long grid_independent_sets(int n, int m) {
    const long long MOD = 1000000007;
    int size = 1 << m;
    vector<long long> dp(size), next(size);
    dp[0] = 1; // before the grid: m virtual unselected cells
    for (int r = 0; r < n; ++r)
        for (int c = 0; c < m; ++c) {
            fill(next.begin(), next.end(), 0);
            for (int mask = 0; mask < size; ++mask) {
                int shifted = (mask << 1) & (size - 1);
                // Choose 0 at the current cell.
                next[shifted] = (next[shifted] + dp[mask]) % MOD;
                bool above = (mask >> (m - 1)) & 1;
                bool left = c > 0 && (mask & 1);
                // Choose 1 only when both past neighbors are unselected.
                if (!above && !left)
                    next[shifted | 1] = (next[shifted | 1] + dp[mask]) % MOD;
            }
            dp.swap(next); // advance position; do not reuse this cell
        }
    long long answer = 0;
    for (auto count : dp) answer = (answer + count) % MOD;
    return answer; // every final mask is allowed
}
