/**
 * Runs before React hydrates so the Translate toolbar does not flash or sit above the navbar.
 * Kept as a plain string for next/script strategy="beforeInteractive".
 */
export const googleTranslateEarlyScript = `(function(){
  var WIDGET_ID="google_translate_element";
  function strip(el){
    if(!el||!el.style)return;
    var p=[["display","none"],["visibility","hidden"],["height","0"],["max-height","0"],["min-height","0"],
      ["overflow","hidden"],["opacity","0"],["margin","0"],["padding","0"],["pointer-events","none"]];
    for(var i=0;i<p.length;i++)el.style.setProperty(p[i][0],p[i][1],"important");
  }
  function classStr(el){
    var c=el.className;
    return (c&&c.baseVal!==undefined)?String(c.baseVal):String(c||"");
  }
  function hide(){
    try{
      var w=document.getElementById(WIDGET_ID);
      var b=document.body;
      if(!b)return;
      var kids=b.children;
      for(var i=0;i<kids.length;i++){
        var el=kids[i];
        if(!(el instanceof HTMLElement))continue;
        if(w&&w.contains(el))continue;
        var cs=classStr(el);
        if(cs.indexOf("skiptranslate")>=0||cs.indexOf("VIpgJd")>=0)strip(el);
      }
      var ifs=document.querySelectorAll("iframe");
      for(var j=0;j<ifs.length;j++){
        var f=ifs[j];
        if(w&&w.contains(f))continue;
        var src=f.getAttribute("src")||"";
        var fc=classStr(f);
        if(fc.indexOf("goog-te-banner-frame")>=0||fc.indexOf("goog-te-menu-frame")>=0||fc.indexOf("goog-te-ftab-frame")>=0){strip(f);continue;}
        if(f.classList&&f.classList.contains("skiptranslate")&&/translate\\.google|translate\\.googleapis\\.com/i.test(src))strip(f);
      }
      // Avoid setting styles on document.documentElement here (pre-React hydration mismatch vs SSR).
      b.style.setProperty("top","0","important");
      b.style.setProperty("margin-top","0","important");
      b.style.setProperty("padding-top","0","important");
      b.style.setProperty("position","static","important");
    }catch(e){}
  }
  function start(){
    hide();
    var mo=new MutationObserver(hide);
    mo.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:["style","class"]});
    setInterval(hide,250);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});
  else start();
})();`;
