(this["webpackJsonpjs-browser"]=this["webpackJsonpjs-browser"]||[]).push([[133],{309:function(e,n){var r;(r=Prism).languages.erb=r.languages.extend("ruby",{}),r.languages.insertBefore("erb","comment",{delimiter:{pattern:/^<%=?|%>$/,alias:"punctuation"}}),r.hooks.add("before-tokenize",(function(e){r.languages["markup-templating"].buildPlaceholders(e,"erb",/<%=?(?:[^\r\n]|[\r\n](?!=begin)|[\r\n]=begin\s(?:[^\r\n]|[\r\n](?!=end))*[\r\n]=end)+?%>/gm)})),r.hooks.add("after-tokenize",(function(e){r.languages["markup-templating"].tokenizePlaceholders(e,"erb")}))}}]);
//# sourceMappingURL=133.59671f0f.chunk.js.map