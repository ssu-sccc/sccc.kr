// 앞 코드의 헤더 선언 이후에 작성.
// sa는 s의 올바른 Suffix Array여야 함.
// lcp[r] = LCP(s[sa[r-1]..], s[sa[r]..]), lcp[0] = 0.
vector<int> lcp_array(const string& s, const vector<int>& sa) {
    int n = (int)s.size();
    vector<int> rank(n), lcp(n, 0);
    for (int r = 0; r < n; ++r) rank[sa[r]] = r;

    int h = 0;
    for (int i = 0; i < n; ++i) {
        int r = rank[i];
        if (r == 0) {
            h = 0;
            continue;
        }
        int j = sa[r - 1];
        while (i + h < n && j + h < n && s[i + h] == s[j + h])
            ++h;
        lcp[r] = h;
        h = max(h - 1, 0);
    }
    return lcp;
}
