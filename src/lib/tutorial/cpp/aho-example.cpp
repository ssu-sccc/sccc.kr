#include <iostream>
#include "aho-build.cpp"
#include "aho-search.cpp"

int main() {
    vector<string> patterns = {"he", "she", "his", "hers"};
    string text = "ushers";
    AhoCorasick ac(patterns);
    find_matches(ac, text, [&](int id, int l, int r) {
        cout << patterns[id] << " [" << l << ", " << r << "]\n";
    });
    auto counts = count_matches(ac, text);
    for (int id = 0; id < (int)patterns.size(); ++id)
        cout << patterns[id] << ": " << counts[id] << '\n';
}
