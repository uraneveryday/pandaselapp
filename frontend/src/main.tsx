// main.tsx
// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from "./App";
import "./styles/tailwind.css";
import "./styles/theme.css";
import "./styles/fonts.css";
import "./i18n";

const rootElement = document.getElementById('root');

if (rootElement) {
    // 하나로 합쳐서 한 번만 렌더링합니다.
    createRoot(rootElement).render(
        // <StrictMode>
        //     <App />
        // </StrictMode>
        <App />
    );
} else {
    console.error("❌ 'root' 요소를 찾을 수 없습니다! index.html에 id='root'인 div가 있는지 확인하세요.");
}