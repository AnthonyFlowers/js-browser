(this["webpackJsonpjs-browser"]=this["webpackJsonpjs-browser"]||[]).push([[216],{392:function(a,e){!function(a){var e=a.languages.javadoclike={parameter:{pattern:/(^[\t ]*(?:\/{3}|\*|\/\*\*)\s*@(?:param|arg|arguments)\s+)\w+/m,lookbehind:!0},keyword:{pattern:/(^[\t ]*(?:\/{3}|\*|\/\*\*)\s*|\{)@[a-z][a-zA-Z-]+\b/m,lookbehind:!0},punctuation:/[{}]/};Object.defineProperty(e,"addSupport",{value:function(e,n){"string"===typeof e&&(e=[e]),e.forEach((function(e){!function(e,n){var t="doc-comment",r=a.languages[e];if(r){var o=r[t];if(!o){var i={};i[t]={pattern:/(^|[^\\])\/\*\*[^/][\s\S]*?(?:\*\/|$)/,lookbehind:!0,alias:"comment"},o=(r=a.languages.insertBefore(e,"comment",i))[t]}if(o instanceof RegExp&&(o=r[t]={pattern:o}),Array.isArray(o))for(var s=0,p=o.length;s<p;s++)o[s]instanceof RegExp&&(o[s]={pattern:o[s]}),n(o[s]);else n(o)}}(e,(function(a){a.inside||(a.inside={}),a.inside.rest=n}))}))}}),e.addSupport(["java","javascript","php"],e)}(Prism)}}]);
//# sourceMappingURL=216.f2bb6074.chunk.js.map