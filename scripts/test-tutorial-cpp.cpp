#include "../src/lib/tutorial/cpp/aho-build.cpp"
#include "../src/lib/tutorial/cpp/aho-search.cpp"
#include "../src/lib/tutorial/cpp/suffix-array.cpp"
#include "../src/lib/tutorial/cpp/kasai.cpp"
#include <cassert>
#include <iostream>
#include <tuple>

int main() {
    vector<string> texts = {"", "banana", "mississippi", "ushers", "zzzz", "she#hers", "aAaa", "he she", "#"};
    for (int n = 1; n <= 8; ++n) {
        for (int mask = 0; mask < (1 << n); ++mask) {
            string s(n, 'a');
            for (int i = 0; i < n; ++i) if (mask >> i & 1) s[i] = 'b';
            texts.push_back(s);
        }
    }
    for (const auto& s : texts) {
        auto sa = suffix_array(s), expected = sa;
        sort(expected.begin(), expected.end(), [&](int a, int b) {
            return s.substr(a) < s.substr(b);
        });
        assert(sa == expected);
        auto lcp = lcp_array(s, sa);
        for (int r = 1; r < (int)sa.size(); ++r) {
            int h = 0, i = sa[r-1], j = sa[r];
            while (i+h < (int)s.size() && j+h < (int)s.size() && s[i+h] == s[j+h]) ++h;
            assert(lcp[r] == h);
        }
    }
    for (const vector<string>& patterns : vector<vector<string>>{
        {"he","she","his","hers"}, {"a","aa","aaa"}, {"a","a","ab"}, {"ab","bab","bc","bca","c","caa"}, {}}) {
        AhoCorasick ac(patterns);
        for (const auto& s : texts) {
            vector<tuple<int,int,int>> actual, expected;
            vector<long long> counts(patterns.size(), 0);
            find_matches(ac, s, [&](int id,int l,int r){actual.emplace_back(id,l,r);});
            for (int id = 0; id < (int)patterns.size(); ++id) {
                for (int i = 0; i + patterns[id].size() <= s.size(); ++i) {
                    if (s.compare(i,patterns[id].size(),patterns[id]) == 0) {
                        expected.emplace_back(id,i,i+(int)patterns[id].size()-1);
                        counts[id]++;
                    }
                }
            }
            sort(actual.begin(),actual.end()); sort(expected.begin(),expected.end());
            assert(actual == expected);
            assert(count_matches(ac,s) == counts);
        }
    }
    for (const string& invalid : vector<string>{"", "A", "a#"}) {
        bool rejected = false;
        try { AhoCorasick invalid_ac({invalid}); }
        catch (const invalid_argument&) { rejected = true; }
        assert(rejected);
    }
    cout << "C++17: SA, LCP, AC output and counts passed on " << texts.size() << " texts; invalid patterns rejected\n";
}
