import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import './lib/service-worker';

createRoot(document.getElementById('root')!).render(<App />);
