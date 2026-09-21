#include <functional>
#include <vector>
using namespace std;

struct Message { long long count, sum; };
Message merge_message(Message a, Message b) {
    return {a.count + b.count, a.sum + b.sum};
}
Message lift_message(Message a) {
    return {a.count, a.sum + a.count}; // cross one unit-length edge
}
// g: nonempty undirected tree, unit edges. Output sum of distances for each root.
vector<long long> all_distance_sums(const vector<vector<int>>& g) {
    int n = (int)g.size();
    vector<Message> down(n), up(n, {0,0});
    vector<long long> answer(n);
    function<void(int,int)> gather = [&](int v,int p) {
        down[v] = {1,0}; // self
        for (int c : g[v]) if (c != p) {
            gather(c,v);
            down[v] = merge_message(down[v],lift_message(down[c]));
        }
    };
    function<void(int,int)> distribute = [&](int v,int p) {
        int d = (int)g[v].size();
        vector<Message> incoming(d), prefix(d+1,{0,0}), suffix(d+1,{0,0});
        for (int i = 0; i < d; ++i) {
            int u = g[v][i];
            incoming[i] = (u == p ? up[v] : lift_message(down[u]));
            prefix[i+1] = merge_message(prefix[i],incoming[i]);
        }
        for (int i = d-1; i >= 0; --i)
            suffix[i] = merge_message(incoming[i],suffix[i+1]);
        answer[v] = merge_message({1,0},prefix[d]).sum;
        for (int i = 0; i < d; ++i) {
            int c = g[v][i];
            if (c == p) continue;
            Message without_c = merge_message({1,0},
                merge_message(prefix[i],suffix[i+1]));
            up[c] = lift_message(without_c);
            distribute(c,v);
        }
    };
    gather(0,-1);
    distribute(0,-1);
    return answer;
}
