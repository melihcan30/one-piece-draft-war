import { sesCal } from './sesMotoru.js';

// --- DIŞ KÜTÜPHANE VE GELİŞMİŞ HAKİ STİLLERİ ---
const confettiScript = document.createElement('script');
confettiScript.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js';
document.head.appendChild(confettiScript);

const fxStyles = document.createElement('style');
fxStyles.innerHTML = `
    /* İlk patlama anı ve 14 saniyelik karanlık atmosfer */
    @keyframes haki-epic-cycle {
        0% { background-color: rgba(255, 10, 10, 0.9); opacity: 1; }
        2% { background-color: rgba(0, 0, 0, 0.95); }
        4% { background-color: rgba(255, 10, 10, 0.85); }
        6% { background-color: rgba(0, 0, 0, 0.95); }
        8% { background-color: rgba(20, 0, 0, 0.88); }
        95% { background-color: rgba(15, 0, 0, 0.92); opacity: 1; }
        100% { opacity: 0; }
    }
    
    /* 14 saniye boyunca sürecek sarsıntı efekti */
    @keyframes screen-shake-long {
        0% { transform: translate(0, 0) rotate(0deg); }
        10% { transform: translate(-8px, 6px) rotate(-0.5deg); }
        20% { transform: translate(8px, -6px) rotate(0.5deg); }
        30% { transform: translate(-10px, -3px) rotate(-1deg); }
        40% { transform: translate(10px, 4px) rotate(1deg); }
        50% { transform: translate(-5px, 5px) rotate(0deg); }
        60% { transform: translate(6px, -4px) rotate(0.5deg); }
        70% { transform: translate(-7px, 2px) rotate(-0.5deg); }
        80% { transform: translate(5px, -5px) rotate(0.5deg); }
        90% { transform: translate(-3px, 4px) rotate(0deg); }
        100% { transform: translate(0, 0) rotate(0deg); }
    }
    
    @keyframes poster-stamp {
        0% { transform: scale(2.8); filter: brightness(2) contrast(1.5); box-shadow: 0 0 50px rgba(255,159,67,1); }
        100% { transform: scale(1.03); filter: brightness(1) contrast(1); box-shadow: 0 0 10px rgba(212, 175, 55, 0.4); }
    }
    
    /* Şimşeklerin anlık çakıp sönme animasyonu */
    @keyframes lightning-strike {
        0% { opacity: 0; stroke-dashoffset: 500; }
        15% { opacity: 1; stroke-dashoffset: 0; }
        30% { opacity: 1; filter: drop-shadow(0 0 15px #ff0022) brightness(1.5); }
        80% { opacity: 0.8; }
        100% { opacity: 0; stroke-width: 0; }
    }

    .haki-active {
        animation: screen-shake-long 0.15s ease-in-out infinite !important;
    }
    
    .haki-overlay {
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        z-index: 99998; pointer-events: none;
        box-shadow: inset 0 0 150px rgba(255, 0, 0, 0.6);
        animation: haki-epic-cycle 14s cubic-bezier(0.1, 0.8, 0.2, 1) forwards;
    }

    /* One Piece Tarzı Siyah-Kırmızı Şimşek Konteyneri */
    .haki-lightning-svg {
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        z-index: 99999; pointer-events: none;
    }

    /* İçi kapkara, dışı parlayan kalın şimşek çizgileri */
    .lightning-bolt {
        stroke: #000000; /* İçi saf siyah */
        stroke-width: 6;
        fill: none;
        stroke-linecap: round;
        stroke-linejoin: round;
        filter: drop-shadow(0 0 6px #ff0011) drop-shadow(0 0 12px #b30006); /* Dışı kırmızı aura */
        stroke-dasharray: 1000;
        animation: lightning-strike 0.28s linear forwards;
    }
    
    .slot[data-filled="true"] .wanted-poster {
        animation: poster-stamp 0.38s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards !important;
    }
`;
document.head.appendChild(fxStyles);

// --- RASTGELE JAGGED (ZİKZAKLI) ŞİMŞEK YOLU ÜRETİCİ ---
function generateLightningPath() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    
    // Şimşekler ekranın rastgele bir yerinden başlasın
    let startX = Math.random() * w;
    let startY = Math.random() * h;
    
    let path = `M ${startX} ${startY}`;
    let segments = 4 + Math.floor(Math.random() * 5); // 4 ila 8 arası kırılma noktası
    
    let currentX = startX;
    let currentY = startY;
    
    for (let i = 0; i < segments; i++) {
        // One Piece şimşekleri agresif ve geniş açılı kırılır
        let angle = Math.random() * Math.PI * 2;
        let length = 80 + Math.random() * 150; 
        
        currentX += Math.cos(angle) * length;
        currentY += Math.sin(angle) * length;
        
        path += ` L ${currentX} ${currentY}`;
    }
    return path;
}

export function triggerHakiLightning() {
    sesCal('haki'); // 🔊 14 saniyelik Haki sesi başlar
    
    // 1. Ekran karartma ve sarsıntı efektlerini devreye sok
    const overlay = document.createElement('div');
    overlay.className = 'haki-overlay';
    document.body.appendChild(overlay);
    document.body.classList.add('haki-active');
    
    // 2. Şimşeklerin çizileceği SVG alanını oluştur
    const svgNS = "http://www.w3.org/2000/svg";
    const svgContainer = document.createElementNS(svgNS, "svg");
    svgContainer.setAttribute("className", "haki-lightning-svg");
    // Klasör isimlendirmesinde bazen class sıkıntısı olmaması için direkt style ve class tanımlıyoruz
    svgContainer.style.position = "fixed";
    svgContainer.style.top = "0";
    svgContainer.style.left = "0";
    svgContainer.style.width = "100vw";
    svgContainer.style.height = "100vh";
    svgContainer.style.zIndex = "99999";
    svgContainer.style.pointerEvents = "none";
    document.body.appendChild(svgContainer);

    // 3. 14 saniye boyunca durmaksızın çakacak şimşek döngüsü (Her 90ms'de bir yeni şimşekler)
    const lightningInterval = setInterval(() => {
        // Her döngüde tek tek değil, aynı anda 2-3 koldan şimşek çaksın ki kaos büyüsün
        const boltCount = 2 + Math.floor(Math.random() * 2);
        
        for (let i = 0; i < boltCount; i++) {
            const pathElement = document.createElementNS(svgNS, "path");
            pathElement.setAttribute("d", generateLightningPath());
            pathElement.setAttribute("class", "lightning-bolt");
            svgContainer.appendChild(pathElement);
            
            // Performans için işi biten (sönen) her tekil çizgiyi 300ms sonra DOM'dan temizle
            setTimeout(() => {
                pathElement.remove();
            }, 300);
        }
    }, 90);

    // 4. 14 Saniye (14000ms) Sonra Fırtınayı Bitir ve Temizle
    setTimeout(() => {
        clearInterval(lightningInterval);
        overlay.remove();
        svgContainer.remove();
        document.body.classList.remove('haki-active');
    }, 14000);
}

export function triggerWinnerConfetti(kazananOyuncu) {
    sesCal('victory'); // 🔊 Zafer Müziği!
    
    if (typeof window.confetti === 'function') {
        if (kazananOyuncu === 1) {
            // 🎉 1. Oyuncu (SOL) Kazandı: Soldan sağa doğru coşkulu çift patlama
            window.confetti({
                particleCount: 150,
                angle: 60,
                spread: 70,
                origin: { x: 0, y: 0.6 }
            });
            window.confetti({
                particleCount: 100,
                angle: 45,
                spread: 60,
                origin: { x: 0, y: 0.8 }
            });
        } else if (kazananOyuncu === 2) {
            // 🎉 2. Oyuncu (SAĞ) Kazandı: Sağdan sola doğru coşkulu çift patlama
            window.confetti({
                particleCount: 150,
                angle: 120,
                spread: 70,
                origin: { x: 1, y: 0.6 }
            });
            window.confetti({
                particleCount: 100,
                angle: 135,
                spread: 60,
                origin: { x: 1, y: 0.8 }
            });
        } else {
            // 🤝 Beraberlik Durumu: Eski düzende ortadan patlama
            window.confetti({
                particleCount: 180,
                spread: 80,
                origin: { y: 0.6 }
            });
        }
    }
}