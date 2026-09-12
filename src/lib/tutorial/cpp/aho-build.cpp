#include <array>
#include <stdexcept>
#include <string>
#include <vector>
using namespace std;

// 입력: 비어 있지 않은 a-z 패턴. 모든 위치는 0-index.
struct AhoCorasick {
    struct Node {
        array<int, 26> next, go;
        int fail = 0, out = -1;
        vector<int> terminal;
        Node() { next.fill(-1); go.fill(0); }
    };
    vector<Node> t = vector<Node>(1);
    vector<int> bfs = {0}, end, length;

    explicit AhoCorasick(const vector<string>& patterns) {
        for (int id = 0; id < (int)patterns.size(); ++id) {
            if (patterns[id].empty())
                throw invalid_argument("empty pattern");
            int v = 0;
            for (char ch : patterns[id]) {
                if (ch < 'a' || ch > 'z')
                    throw invalid_argument("expected a-z");
                int c = ch - 'a';
                if (t[v].next[c] == -1) {
                    int u = (int)t.size();
                    t[v].next[c] = u;
                    t.emplace_back();
                }
                v = t[v].next[c];
            }
            t[v].terminal.push_back(id);
            end.push_back(v);
            length.push_back((int)patterns[id].size());
        }

        // root의 자식은 따로 초기화: fail[u] = 0.
        for (int c = 0; c < 26; ++c) {
            int u = t[0].next[c];
            if (u != -1) {
                t[0].go[c] = u;
                bfs.push_back(u);
            }
        }
        // bfs 벡터를 FIFO 큐로 사용.
        for (int head = 1; head < (int)bfs.size(); ++head) {
            int v = bfs[head], f = t[v].fail;
            t[v].out = !t[f].terminal.empty() ? f : t[f].out;
            for (int c = 0; c < 26; ++c) {
                int u = t[v].next[c];
                if (u == -1) {
                    t[v].go[c] = t[f].go[c];
                } else {
                    t[v].go[c] = u;
                    t[u].fail = t[f].go[c];
                    bfs.push_back(u);
                }
            }
        }
    }
};
