// Original small teaching inputs; not copied judge samples.
export const frogHeights=[8,15,6,12,9];
export function frogExample(h=frogHeights){const dp=h.map(()=>Infinity),parent=h.map(()=>-1);dp[0]=0;for(let i=1;i<h.length;i++)for(let j=Math.max(0,i-2);j<i;j++){const value=dp[j]+Math.abs(h[i]-h[j]);if(value<dp[i]){dp[i]=value;parent[i]=j;}}return{dp,parent};}
export const vacationPoints=[[4,7,2],[6,3,8],[5,9,4]];
export function vacationExample(p=vacationPoints){return p.reduce((rows,row,i)=>[...rows,row.map((x,a)=>x+(i?Math.max(...rows[i-1].filter((_,b)=>a!==b)):0))],[]);}
export const knapsackItems=[[2,3],[3,5],[4,6]];
export function knapsackExample(items=knapsackItems,W=5){const rows=[Array(W+1).fill(0)];for(const [weight,value] of items){const prev=rows.at(-1);rows.push(prev.map((x,w)=>Math.max(x,w>=weight?prev[w-weight]+value:0)));}return rows;}
export function lcsExample(s='ACBA',t='CABA'){const dp=Array.from({length:s.length+1},()=>Array(t.length+1).fill(0));for(let i=1;i<=s.length;i++)for(let j=1;j<=t.length;j++)dp[i][j]=Math.max(dp[i-1][j],dp[i][j-1],s[i-1]===t[j-1]?dp[i-1][j-1]+1:0);return dp;}
export const matchingMatrix=[[1,1,0],[0,1,1],[1,0,1]];
export function matchingExample(a=matchingMatrix){const n=a.length,dp=Array(1<<n).fill(0);dp[0]=1;for(let mask=0;mask<dp.length-1;mask++){const i=mask.toString(2).replaceAll('0','').length;for(let j=0;j<n;j++)if(!(mask>>j&1)&&a[i][j])dp[mask|1<<j]+=dp[mask];}return dp;}
