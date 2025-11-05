const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

// ✅ КРИТИЧЕСКИ ВАЖНО: Статические файлы
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Корневой маршрут
app.get('/', (req, res) => {
    console.log('📄 Запрос главной страницы');
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ✅ Fallback для SPA
app.get('*', (req, res) => {
    console.log('🔄 Fallback для:', req.path);
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Socket.io настройки
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    transports: ['websocket', 'polling']
});

console.log('✅ Express настройки завершены');

// Хранилище лобби
const lobbies = new Map();

// Генератор ID лобби
function generateLobbyId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Цвета для игроков
function getPlayerColor(index) {
    const colors = ['#4ecdc4', '#ff6b6b', '#2ecc71', '#f39c12', '#9b59b6', '#3498db'];
    return colors[index % colors.length];
}

// Обработчики Socket.io
io.on('connection', (socket) => {
    console.log('🔗 Новое подключение:', socket.id);

    // Получить список лобби
    socket.on('get_lobbies', () => {
        const lobbyList = Array.from(lobbies.entries()).map(([id, lobby]) => ({
            id,
            playerCount: Object.keys(lobby.players).length,
            maxPlayers: 6,
            created: lobby.created,
            players: Object.values(lobby.players).map(p => p.name)
        }));
        
        socket.emit('lobby_list', lobbyList);
        console.log('📋 Отправлен список лобби:', lobbyList.length);
    });

    // Присоединиться к лобби
    socket.on('join_lobby', (data) => {
        const { lobbyId, playerName, createNew = false } = data;
        console.log('🎮 Попытка присоединения:', playerName, 'к лобби', lobbyId);
        
        if (!playerName || playerName.trim().length < 2) {
            socket.emit('join_error', 'Имя должно содержать минимум 2 символа');
            return;
        }

        let targetLobbyId = lobbyId;
        
        // Создать новое лобби
        if (createNew || !lobbies.has(lobbyId)) {
            targetLobbyId = generateLobbyId();
            lobbies.set(targetLobbyId, {
                players: {},
                cityProgress: { 
                    tver: 0, kineshma: 0, naberezhnye_chelny: 0, 
                    kazan: 0, volgograd: 0, astrakhan: 0 
                },
                created: new Date().toISOString(),
                maxPlayers: 6
            });
            console.log('🆕 Создано лобби:', targetLobbyId);
        }

        const lobby = lobbies.get(targetLobbyId);
        
        // Проверить лимит игроков
        if (Object.keys(lobby.players).length >= lobby.maxPlayers) {
            socket.emit('join_error', 'Лобби заполнено');
            return;
        }

        const playerId = socket.id;
        const player = {
            id: playerId,
            name: playerName.trim(),
            position: 0,
            city: "tver",
            coins: 100,
            cleaningPoints: 0,
            buildings: [],
            level: 1,
            completedTasks: 0,
            color: getPlayerColor(Object.keys(lobby.players).length),
            currentTask: null,
            currentDifficulty: "easy"
        };

        // Добавить игрока
        lobby.players[playerId] = player;
        socket.playerId = playerId;
        socket.lobbyId = targetLobbyId;
        socket.playerName = playerName;
        
        socket.join(targetLobbyId);
        
        // Успешное присоединение
        socket.emit('join_success', {
            lobbyId: targetLobbyId,
            playerId: playerId,
            player: player
        });

        // Отправить состояние лобби
        socket.emit('lobby_state', {
            players: lobby.players,
            cityProgress: lobby.cityProgress
        });

        // Уведомить других игроков
        socket.to(targetLobbyId).emit('player_joined', {
            playerId,
            player
        });

        console.log(`✅ ${playerName} присоединился к лобби ${targetLobbyId}`);
    });

    // Чат
    socket.on('chat_message', (data) => {
        if (socket.lobbyId) {
            io.to(socket.lobbyId).emit('new_chat_message', {
                playerId: socket.playerId,
                playerName: socket.playerName,
                message: data.message,
                timestamp: new Date().toISOString()
            });
        }
    });

    // Отключение
    socket.on('disconnect', (reason) => {
        console.log('❌ Отключение:', socket.id, reason);
        
        if (socket.lobbyId && socket.playerId) {
            const lobby = lobbies.get(socket.lobbyId);
            if (lobby && lobby.players[socket.playerId]) {
                const playerName = lobby.players[socket.playerId].name;
                delete lobby.players[socket.playerId];
                
                socket.to(socket.lobbyId).emit('player_left', {
                    playerId: socket.playerId,
                    playerName: playerName
                });

                console.log(`🚪 ${playerName} покинул лобби ${socket.lobbyId}`);
            }
        }
    });

    // Пинг
    socket.on('ping', (cb) => {
        if (typeof cb === 'function') {
            cb({ pong: Date.now(), status: 'ok' });
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log('🚀 СЕРВЕР ЗАПУЩЕН!');
    console.log(`📍 Порт: ${PORT}`);
    console.log(`🌐 Режим: ${process.env.NODE_ENV || 'development'}`);
    console.log('='.repeat(60));
});
