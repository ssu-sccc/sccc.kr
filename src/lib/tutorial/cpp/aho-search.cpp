// 앞의 AhoCorasick 정의 이후에 작성.
// emit(id, start, finish): 양 끝을 포함한 매칭 구간.
template <class Emit>
void find_matches(const AhoCorasick& ac, const string& text,
                  Emit emit) {
    int v = 0;
    for (int i = 0; i < (int)text.size(); ++i) {
        char ch = text[i];
        // 패턴 알파벳 밖의 문자는 어떤 패턴에도 포함되지 않음.
        v = ('a' <= ch && ch <= 'z') ? ac.t[v].go[ch - 'a'] : 0;
        for (int u = v; u != -1; u = ac.t[u].out) {
            for (int id : ac.t[u].terminal)
                emit(id, i - ac.length[id] + 1, i);
        }
    }
}

// 위치 출력이 필요 없으면 별도 순회로 횟수만 계산.
vector<long long> count_matches(const AhoCorasick& ac,
                                const string& text) {
    vector<long long> cnt(ac.t.size(), 0);
    int v = 0;
    for (char ch : text) {
        v = ('a' <= ch && ch <= 'z') ? ac.t[v].go[ch - 'a'] : 0;
        ++cnt[v];
    }
    // root는 자기 자신에게 누적하지 않음.
    for (int k = (int)ac.bfs.size() - 1; k > 0; --k) {
        int u = ac.bfs[k];
        cnt[ac.t[u].fail] += cnt[u];
    }
    vector<long long> result;
    for (int u : ac.end) result.push_back(cnt[u]);
    return result;
}
