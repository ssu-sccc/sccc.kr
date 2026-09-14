// suffix-array.cpp, kasai.cpp 정의 이후에 포함.
#include <stdexcept>

struct SparseMin {
    int n;
    vector<int> lg;
    vector<vector<int>> st;

    explicit SparseMin(const vector<int>& a) : n((int)a.size()), lg(n+1) {
        for (int i = 2; i <= n; ++i) lg[i] = lg[i/2] + 1;
        if (n == 0) return;
        st.assign(lg[n]+1, vector<int>(n));
        st[0] = a;
        for (int k = 1; k <= lg[n]; ++k) {
            int len = 1 << k, half = len / 2;
            for (int i = 0; i <= n-len; ++i)
                st[k][i] = min(st[k-1][i], st[k-1][i+half]);
        }
    }

    // 비어 있지 않은 반열린 구간 [l, r).
    int query(int l, int r) const {
        if (l < 0 || l >= r || r > n) throw out_of_range("RMQ range");
        int k = lg[r-l];
        return min(st[k][l], st[k][r-(1 << k)]);
    }
};

struct SuffixIndex {
    string s;
    vector<int> sa, rank, lcp;
    SparseMin rmq;

    explicit SuffixIndex(string text)
        : s(std::move(text)), sa(suffix_array(s)), rank(s.size()),
          lcp(lcp_array(s, sa)), rmq(lcp) {
        for (int r = 0; r < (int)sa.size(); ++r) rank[sa[r]] = r;
    }

    int lcp_suffix(int i, int j) const {
        int n = (int)s.size();
        if (i < 0 || j < 0 || i >= n || j >= n)
            throw out_of_range("suffix position");
        if (i == j) return n-i;
        int a = rank[i], b = rank[j];
        if (a > b) swap(a,b);
        return rmq.query(a+1,b+1);
    }

    // S[l1,r1)와 S[l2,r2) 비교: -1 / 0 / 1. 빈 구간 허용.
    int compare_substrings(int l1, int r1, int l2, int r2) const {
        int n = (int)s.size();
        if (l1 < 0 || l1 > r1 || r1 > n || l2 < 0 || l2 > r2 || r2 > n)
            throw out_of_range("substring range");
        int a = r1-l1, b = r2-l2;
        if (a == 0 || b == 0) return (a>b)-(a<b);
        int h = min({lcp_suffix(l1,l2),a,b});
        if (h == min(a,b)) return (a>b)-(a<b);
        return (unsigned char)s[l1+h] < (unsigned char)s[l2+h] ? -1 : 1;
    }

    // 비어 있지 않은 패턴의 매칭 순위 구간 [left, right).
    pair<int,int> pattern_range(const string& p) const {
        if (p.empty()) throw invalid_argument("empty pattern");
        auto cmp = [&](int i) {
            size_t h = 0, remain = s.size()-i;
            while (h < p.size() && h < remain && s[i+h] == p[h]) ++h;
            if (h == p.size()) return 0; // 패턴 전체가 접두사로 일치
            if (h == remain) return -1; // 접미사가 먼저 끝남
            return (unsigned char)s[i+h] < (unsigned char)p[h] ? -1 : 1;
        };
        auto bound = [&](bool upper) {
            int l = 0, r = (int)sa.size();
            while (l < r) {
                int m = l + (r-l)/2, c = cmp(sa[m]);
                if (c < 0 || (upper && c == 0)) l = m+1;
                else r = m;
            }
            return l;
        };
        return {bound(false),bound(true)};
    }
};
