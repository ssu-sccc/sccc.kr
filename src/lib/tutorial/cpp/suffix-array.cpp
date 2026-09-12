#include <algorithm>
#include <numeric>
#include <string>
#include <utility>
#include <vector>
using namespace std;

// 비어 있지 않은 접미사 N개의 시작 위치. 빈 입력은 빈 배열.
vector<int> suffix_array(const string& s) {
    int n = (int)s.size();
    vector<int> sa(n), rank(n), next_rank(n);
    iota(sa.begin(), sa.end(), 0);
    for (int i = 0; i < n; ++i) rank[i] = (unsigned char)s[i];

    for (long long k = 1; k < n; k *= 2) {
        auto key = [&](int i) {
            return pair<int, int>{rank[i],
                i + k < n ? rank[i + k] : -1};
        };
        sort(sa.begin(), sa.end(), [&](int a, int b) {
            return key(a) < key(b);
        });
        next_rank[sa[0]] = 0;
        for (int r = 1; r < n; ++r) {
            next_rank[sa[r]] = next_rank[sa[r - 1]]
                + (key(sa[r - 1]) != key(sa[r]));
        }
        rank.swap(next_rank);
        if (rank[sa.back()] == n - 1) break;
    }
    return sa;
}
