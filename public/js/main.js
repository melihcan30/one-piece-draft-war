window.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    
    // Değişkenler
    let secilenAvatar = "🍖";
    const characters = ["Luffy", "Zoro", "Nami", "Usopp", "Sanji", "Chopper", "Robin", "Franky", "Brook", "Jinbe"]; // Çark Karakterleri
    
    // DOM Elementleri
    const lobbyScreen = document.getElementById('lobby-screen');
    const gameScreen = document.getElementById('game-screen');
    const joinBtn = document.getElementById('join-btn');
    const roomInput = document.getElementById('room-input');
    const usernameInput = document.getElementById('username-input');
    const canvas = document.getElementById('wheelCanvas');
    const ctx = canvas?.getContext('2d');

    // 1. Avatar Seçme Mantığı
    document.querySelectorAll('.avatar-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.avatar-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            secilenAvatar = item.getAttribute('data-avatar');
        });
    });

    // 2. Odaya Bağlanma Tetikleyicisi
    if (joinBtn) {
        joinBtn.addEventListener('click', () => {
            const roomName = roomInput.value.trim();
            const username = usernameInput.value.trim() || 'Bilinmeyen Korsan';

            if (!roomName) {
                alert('Lütfen geçerli bir oda numarası gir kaptan!');
                return;
            }

            // Sunucuya ismi, odayı ve avatarı paket yapıp atıyoruz
            socket.emit('joinRoom', { 
                room: roomName, 
                username: username, 
                avatar: secilenAvatar 
            });

            // Ekran değiştirme animasyonu
            lobbyScreen.classList.add('hidden');
            gameScreen.classList.remove('hidden');
        });
    }

    // 3. Sunucudan Gelen Oda Durumunu (İsim & Avatar) Dinleme ve Ekrana Basma
    socket.on('roomStatus', (data) => {
        // P1 Ataması
        if (data.p1Data) {
            document.getElementById('p1-name-display').innerText = data.p1Data.username;
            document.getElementById('p1-avatar-display').innerText = data.p1Data.avatar;
        } else {
            document.getElementById('p1-name-display').innerText = "Korsan 1 Aranıyor...";
            document.getElementById('p1-avatar-display').innerText = "🏴‍☠️";
        }

        // P2 Ataması
        if (data.p2Data) {
            document.getElementById('p2-name-display').innerText = data.p2Data.username;
            document.getElementById('p2-avatar-display').innerText = data.p2Data.avatar;
        } else {
            document.getElementById('p2-name-display').innerText = "Korsan 2 Aranıyor...";
            document.getElementById('p2-avatar-display').innerText = "🏴‍☠️";
        }
    });

    // 4. Garanti Çark Çizim Fonksiyonu (Karakterlerin görünmesini sağlayan motor)
    function drawWheel() {
        if (!canvas || !ctx) return;
        const numSegments = characters.length;
        const arcSize = (2 * Math.PI) / numSegments;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < numSegments; i++) {
            const angle = i * arcSize;
            
            // Çark Dilimleri Alternatif Renkleri
            ctx.fillStyle = (i % 2 === 0) ? '#26190e' : '#3a2515';
            
            ctx.beginPath();
            ctx.moveTo(canvas.width / 2, canvas.height / 2);
            ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, angle, angle + arcSize);
            ctx.lineTo(canvas.width / 2, canvas.height / 2);
            ctx.fill();
            ctx.strokeStyle = '#bba06b';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Karakter Yazılarını Çizme
            ctx.save();
            ctx.fillStyle = '#f7e6c4';
            ctx.font = 'bold 13px sans-serif';
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(angle + arcSize / 2);
            ctx.textAlign = 'right';
            ctx.fillText(characters[i], canvas.width / 2 - 20, 5);
            ctx.restore();
        }
    }

    // Çarkı ilk açılışta çizdiriyoruz
    drawWheel();
});