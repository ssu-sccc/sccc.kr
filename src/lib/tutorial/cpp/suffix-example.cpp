#include <iostream>
#include "suffix-array.cpp"
#include "kasai.cpp"
#include "suffix-query.cpp"

int main() {
    SuffixIndex index("banana");
    auto print = [](const char* label, const vector<int>& a) {
        cout << label;
        for (int x : a) cout << ' ' << x;
        cout << '\n';
    };
    print("SA:", index.sa);
    print("rank:", index.rank);
    print("LCP:", index.lcp);
    cout << "lcp(1,3): " << index.lcp_suffix(1,3) << '\n';
    cout << "compare [1,4), [3,6): "
         << index.compare_substrings(1,4,3,6) << '\n';
    auto [l,r] = index.pattern_range("ana");
    cout << "ana positions (SA order):";
    for (int k = l; k < r; ++k) cout << ' ' << index.sa[k];
    cout << '\n';
    long long n = index.s.size(), distinct = n*(n+1)/2;
    int repeated = 0;
    for (int h : index.lcp) {
        distinct -= h;
        repeated = max(repeated,h);
    }
    cout << "distinct: " << distinct << '\n';
    cout << "longest repeated: " << repeated << '\n';
}
