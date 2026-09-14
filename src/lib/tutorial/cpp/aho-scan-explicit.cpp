// 앞의 AhoCorasick 구조체로 Trie, fail, out을 구성한 뒤 사용.
// go 대신 실제 next 간선과 fail을 사용해 탐색 과정을 그대로 표현.
template <class Emit>
void scan_with_failure(const AhoCorasick& ac, const string& text,
                       Emit emit) {
    int v = 0;
    for (int i = 0; i < (int)text.size(); ++i) {
        char ch = text[i];
        if (ch < 'a' || ch > 'z') {
            v = 0;              // 어떤 패턴에도 없는 문자: 소비하고 root
            continue;
        }
        int c = ch - 'a';

        // 아직 text[i]를 소비하지 않음. 같은 c를 더 짧은 후보에 시도.
        while (v != 0 && ac.t[v].next[c] == -1)
            v = ac.t[v].fail;

        int u = ac.t[v].next[c];
        v = (u == -1 ? 0 : u);   // 여기서 text[i] 소비 완료

        // v는 유지하고 u만 움직여, 이번 위치에서 끝나는 패턴을 출력.
        for (u = v; u != -1; u = ac.t[u].out)
            for (int id : ac.t[u].terminal)
                emit(id, i - ac.length[id] + 1, i);
        // 본문 위치 i는 바깥 for에서만 증가. 매칭 후에도 v를 유지.
    }
}
