const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname));

// Odaların ve oyuncuların tutulduğu sunucu hafıza objesi
const rooms = {};

io.on('connection', (socket) => {
    let currentRoom = null;

    socket.on('joinRoom', (data) => {
        const roomName = data.room;
        currentRoom = roomName;

        // Oda yoksa oluştur
        if (!rooms[roomName]) {
            rooms[roomName] = {
                players: { player1: null, player2: null },
                p1Data: null,
                p2Data: null
            };
        }

        const room = rooms[roomName];

        // Boş yuvalara oyuncuları yerleştir
        if (!room.players.player1) {
            room.players.player1 = socket.id;
            room.p1Data = { username: data.username, avatar: data.avatar };
            socket.join(roomName);
            console.log(`[Oda-${roomName}] Player 1 Katıldı: ${data.username}`);
        } else if (!room.players.player2) {
            room.players.player2 = socket.id;
            room.p2Data = { username: data.username, avatar: data.avatar };
            socket.join(roomName);
            console.log(`[Oda-${roomName}] Player 2 Katıldı: ${data.username}`);
        } else {
            // Oda dolu uyarısı fırlatılabilir
            socket.emit('roomFull');
            return;
        }

        // Odadaki herkese güncel oyuncu verilerini hemen fırlat (Anlık senkronizasyon)
        io.to(roomName).emit('roomStatus', {
            p1Data: room.p1Data,
            p2Data: room.p2Data
        });
    });

    socket.on('disconnect', () => {
        if (currentRoom && rooms[currentRoom]) {
            const room = rooms[currentRoom];
            
            if (room.players.player1 === socket.id) {
                console.log(`Player 1 ayrıldı.`);
                room.players.player1 = null;
                room.p1Data = null;
            } else if (room.players.player2 === socket.id) {
                console.log(`Player 2 ayrıldı.`);
                room.players.player2 = null;
                room.p2Data = null;
            }

            // Odada kimse kalmadıysa hafızadan tamamen sil
            if (!room.players.player1 && !room.players.player2) {
                delete rooms[currentRoom];
                console.log(`[Oda-${currentRoom}] Boşaldığı için silindi.`);
            } else {
                // Kalan oyuncuya durumu bildir
                io.to(currentRoom).emit('roomStatus', {
                    p1Data: room.p1Data,
                    p2Data: room.p2Data
                });
            }
        }
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Sunucu şanlı korsanlar için ${PORT} portunda yayında!`);
});