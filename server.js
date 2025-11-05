const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Статические файлы
app.use(express.static('public'));

// Корневой маршрут
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Простой тестовый маршрут
app.get('/api/status', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Сервер работает!',
        timestamp: new Date().toISOString()
    });
});

// Socket.io
const io = socketIo(server, {
    cors: { origin: "*" }
});

// Простые лобби
const rooms = new Map();

io.on('connection', (socket) => {
    console.log('🔗 Подключение:', socket.id);

    socket.on('create_room', (playerName) => {
        const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
        const room = {
            players: { [socket.id]: { id: socket.id, name: playerName, color: '#4ecdc4' } },
            created: new Date().toISOString()
        };
        rooms.set(roomId, room);
        
        socket.join(roomId);
        socket.emit('room_created', { roomId, players: room.players });
        console.log(`🆕 Создана комната ${roomId} игроком ${playerName}`);
    });

    socket.on('join_room', (data) => {
        const { roomId, playerName } = data;
        const room = rooms.get(roomId);
        
        if (!room) {
            socket.emit('error', 'Комната не найдена');
            return;
        }

        room.players[socket.id] = { id: socket.id, name: playerName, color: '#ff6b6b' };
        socket.join(roomId);
        
        // Уведомляем всех в комнате
        io.to(roomId).emit('player_joined', { 
            players: room.players,
            newPlayer: { id: socket.id, name: playerName }
        });
        
        console.log(`🎮 ${playerName} присоединился к комнате ${roomId}`);
    });

    socket.on('chat_message', (data) => {
        socket.to(data.roomId).emit('new_message', {
            player: data.playerName,
            message: data.message,
            time: new Date().toLocaleTimeString()
        });
    });

    socket.on('disconnect', () => {
        console.log('❌ Отключение:', socket.id);
        // Удаляем игрока из всех комнат
        for (const [roomId, room] of rooms.entries()) {
            if (room.players[socket.id]) {
                delete room.players[socket.id];
                socket.to(roomId).emit('player_left', { playerId: socket.id });
                
                // Удаляем пустые комнаты
                if (Object.keys(room.players).length === 0) {
                    rooms.delete(roomId);
                }
            }
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log('🚀 СЕРВЕР ЗАПУЩЕН!');
    console.log(`📍 Порт: ${PORT}`);
    console.log(`🌐 Доступен по: https://ваш-проект.onrender.com`);
    console.log('='.repeat(50));
});
