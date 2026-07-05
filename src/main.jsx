import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// No StrictMode: its dev-only double-mounting fights GSAP pinned
// ScrollTriggers and the WebGL context lifecycle.
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
