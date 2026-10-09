// Delegating to main.js for responsive slider and interactive platform features
const script = document.createElement("script");
const isSub = window.location.pathname.includes("/html codes/") || window.location.pathname.includes("/html%20codes/");
script.src = isSub ? "../JS codes/main.js" : "JS codes/main.js";
if (!document.querySelector('script[src*="main.js"]')) {
  document.head.appendChild(script);
}
