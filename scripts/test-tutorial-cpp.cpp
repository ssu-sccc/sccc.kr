#include "../src/lib/tutorial/cpp/aho-build.cpp"
#include "../src/lib/tutorial/cpp/aho-search.cpp"
#include "../src/lib/tutorial/cpp/suffix-array.cpp"
#include "../src/lib/tutorial/cpp/kasai.cpp"
#include "../src/lib/tutorial/cpp/suffix-query.cpp"
#include <cassert>
#include <iostream>
#include <tuple>
#include <set>

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
        SuffixIndex index(s);
        auto sa = suffix_array(s), expected = sa;
        sort(expected.begin(), expected.end(), [&](int a, int b) {
            return s.substr(a) < s.substr(b);
        });
        assert(sa == expected);
        auto lcp = lcp_array(s, sa);
        assert(index.sa == sa && index.lcp == lcp);
        for (int r = 1; r < (int)sa.size(); ++r) {
            int h = 0, i = sa[r-1], j = sa[r];
            while (i+h < (int)s.size() && j+h < (int)s.size() && s[i+h] == s[j+h]) ++h;
            assert(lcp[r] == h);
        }
        int n = (int)s.size();
        for (int i=0;i<n;++i) for(int j=0;j<n;++j) {
            int h=0;
            while(i+h<n && j+h<n && s[i+h]==s[j+h]) ++h;
            assert(index.lcp_suffix(i,j)==h);
        }
        for(int l=0;l<n;++l) for(int r=l+1;r<=n;++r)
            assert(index.rmq.query(l,r)==*min_element(lcp.begin()+l,lcp.begin()+r));
        set<string> unique;
        for(int a=0;a<=n;++a) for(int b=a;b<=n;++b) {
            if(a<b) unique.insert(s.substr(a,b-a));
            for(int c=0;c<=n;++c) for(int d=c;d<=n;++d) {
                int raw=s.substr(a,b-a).compare(s.substr(c,d-c));
                assert(index.compare_substrings(a,b,c,d)==(raw>0)-(raw<0));
            }
        }
        long long distinct=1LL*n*(n+1)/2;
        for(int h:lcp) distinct-=h;
        assert(distinct==(long long)unique.size());
        vector<string> patterns(unique.begin(),unique.end());
        patterns.insert(patterns.end(),{"z","zzzzzzzzzzzz","ana","aa","#","A"});
        for(const auto& p:patterns) {
            auto [l,r]=index.pattern_range(p);
            int lo=0,hi=0;
            while(lo<n && s.substr(sa[lo],p.size())<p) ++lo;
            hi=lo;
            while(hi<n && s.substr(sa[hi],p.size())==p) ++hi;
            assert(l==lo && r==hi);
        }
        bool rejected=false;
        try { index.pattern_range(""); } catch(const invalid_argument&) { rejected=true; }
        assert(rejected);
        rejected=false;
        try { index.lcp_suffix(n,0); } catch(const out_of_range&) { rejected=true; }
        assert(rejected);
        rejected=false;
        try { index.rmq.query(0,0); } catch(const out_of_range&) { rejected=true; }
        assert(rejected);
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
    cout << "C++17: SA, LCP, all suffix/substring/RMQ queries, search, distinct substrings, AC outputs/counts passed on " << texts.size() << " texts; invalid inputs rejected\n";
}
