(this["webpackJsonpjs-browser"]=this["webpackJsonpjs-browser"]||[]).push([[217],{393:function(e,n){!function(e){var n=e.languages.javadoclike={parameter:{pattern:/(^[\t ]*(?:\/{3}|\*|\/\*\*)\s*@(?:param|arg|arguments)\s+)\w+/m,lookbehind:!0},keyword:{pattern:/(^[\t ]*(?:\/{3}|\*|\/\*\*)\s*|\{)@[a-z][a-zA-Z-]+\b/m,lookbehind:!0},punctuation:/[{}]/};Object.defineProperty(n,"addSupport",{value:function(n,a){"string"==typeof n&&(n=[n]),n.forEach((function(n){!function(n,a){var t="doc-comment",r=e.languages[n];if(r){var o=r[t];if(!o){o=(r=e.languages.insertBefore(n,"comment",{"doc-comment":{pattern:/(^|[^\\])\/\*\*[^/][\s\S]*?(?:\*\/|$)/,lookbehind:!0,alias:"comment"}}))[t]}if(o instanceof RegExp&&(o=r[t]={pattern:o}),Array.isArray(o))for(var i=0,s=o.length;i<s;i++)o[i]instanceof RegExp&&(o[i]={pattern:o[i]}),a(o[i]);else a(o)}}(n,(function(e){e.inside||(e.inside={}),e.inside.rest=a}))}))}}),n.addSupport(["java","javascript","php"],n)}(Prism)}}]);
//# sourceMappingURL=217.afb195a0.chunk.js.map