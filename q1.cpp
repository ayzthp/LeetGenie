#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    vector<string> partitionString(string s) {
        set<string> a;
        vector<string> r;
        int i=0,n=s.size();
        while(i<n){
            string t="";
            for(int j=i;j<n;j++){
                t+=s[j];
                if(a.count(t)){
                   i++; break;
                }
                if(j==n-1||a.count(t+s[j+1])){
                    r.push_back(t);
                    a.insert(t);
                    i=j+1;
                    break;
                }
            
            }
        }
        return r;
    }
};

int main() {
    Solution sol;
    string s = "aaaa";
    vector<string> result = sol.partitionString(s);
    for (const string& str : result) {
        cout << str << " ";
    }
    return 0;
}