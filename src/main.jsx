import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { LangProvider } from './i18n';
import './index.css';

// For the curious ones with DevTools open:
console.log(
  '%cAh... así que estás viendo el código, ¿eh? 👀',
  'font: 600 16px Sora, sans-serif; color: #ff3c00; padding: 4px 0;'
);
console.log(
  '%cGood taste. Everything here is handmade: React + GSAP + Three.js.\n' +
    'The chip is ~7,000 live triangles, not a video. Poke around.\n' +
    '— Hache · hi.hache.cervera@gmail.com',
  'font: 12px Inter, sans-serif; color: #6b6b6b; line-height: 1.6;'
);

// No StrictMode: its dev-only double-mounting fights GSAP pinned
// ScrollTriggers and the WebGL context lifecycle.
ReactDOM.createRoot(document.getElementById('root')).render(
  <LangProvider>
    <App />
  </LangProvider>
);
