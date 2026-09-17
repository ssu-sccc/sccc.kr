#include <cassert>
#include <iostream>
#include <queue>
#include "../src/lib/tutorial/cpp/dp-basics.cpp"
#include "../src/lib/tutorial/cpp/dp-tsp.cpp"
#include "../src/lib/tutorial/cpp/dp-profile.cpp"
#include "../src/lib/tutorial/cpp/dp-tree.cpp"
#include "../src/lib/tutorial/cpp/dp-reroot.cpp"
#include "../src/lib/tutorial/cpp/dp-reconstruction.cpp"
int main() {
    for(int n=0;n<=30;n++) assert(stairs_bottom_up(n)==stairs_top_down(n));
    assert(stairs_bottom_up(5)==8);
    assert(grid_paths(3,4)==10);
    vector<tuple<int,int,long long>> edges={{0,1,3},{0,2,1},{1,2,1},{1,3,4},{2,3,1},{2,4,2},{3,4,3},{3,5,1},{4,5,3}};
    assert((dag_min_cost(6,edges)==vector<long long>{0,3,1,2,3,3}));
    auto [value,path]=shortest_with_path(6,edges,5);
    assert(value==3 && (path==vector<int>{0,2,3,5}));
    assert(shortest_with_path(3,{},2).second.empty());
    assert((shortest_with_path(1,{},0).second==vector<int>{0}));
    assert(tsp_cycle({{0,10,15,20},{10,0,35,25},{15,35,0,30},{20,25,30,0}})==80);
    assert(tsp_cycle({{0}})==0);
    for(int n=1;n<=3;n++)for(int m=1;m<=4;m++) {
        long long expected=0;
        for(int mask=0;mask<(1<<(n*m));mask++) {
            bool ok=true;
            for(int p=0;p<n*m;p++)if(mask>>p&1) {
                if(p%m && (mask>>(p-1)&1))ok=false;
                if(p>=m && (mask>>(p-m)&1))ok=false;
            }
            expected+=ok;
        }
        assert(grid_independent_sets(n,m)==expected);
    }
    for(int n=1;n<=10;n++) {
        vector<vector<int>> g(n);vector<long long>w(n);
        for(int v=0;v<n;v++){w[v]=v*7%11-3;if(v){int p=(v-1)/2;g[p].push_back(v);g[v].push_back(p);}}
        vector<long long> best(n+1,-(1LL<<60));
        for(int mask=0;mask<(1<<n);mask++) {
            int k=0;long long sum=0;bool ok=true;
            for(int v=0;v<n;v++)if(mask>>v&1){k++;sum+=w[v];for(int u:g[v])if(mask>>u&1)ok=false;}
            if(ok)best[k]=max(best[k],sum);
        }
        assert(tree_independent_set(g,w)==*max_element(best.begin(),best.end()));
        for(int k=0;k<=n;k++)assert(tree_exact_k(g,w,k)==best[k]);
        auto sums=all_distance_sums(g);
        for(int root=0;root<n;root++) {
            vector<int>d(n,-1);queue<int>q;q.push(root);d[root]=0;long long sum=0;
            while(!q.empty()){int v=q.front();q.pop();sum+=d[v];for(int u:g[v])if(d[u]<0){d[u]=d[v]+1;q.push(u);}}
            assert(sums[root]==sum);
        }
    }
    std::cout << "DP C++ examples and exhaustive small cases passed\n";
}
