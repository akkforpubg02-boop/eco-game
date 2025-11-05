// ==================== СОЕДИНЕНИЕ С СЕРВЕРОМ ====================
const socket = io();
let isConnected = false;
let currentRoomId = null;

// Обработчики событий Socket.io
socket.on('connect', () => {
    console.log('✅ Подключено к серверу');
    isConnected = true;
    updateConnectionStatus('connected', '✅ Подключено к серверу');
    showNotification('Подключено к серверу', 'success');
});

socket.on('disconnect', () => {
    console.log('❌ Отключено от сервера');
    isConnected = false;
    updateConnectionStatus('disconnected', '❌ Не подключено к серверу');
    showNotification('Потеряно соединение с сервером', 'error');
});

socket.on('connect_error', (error) => {
    console.log('❌ Ошибка подключения:', error);
    isConnected = false;
    updateConnectionStatus('error', '❌ Ошибка подключения');
});

// Успешное присоединение к комнате
socket.on('join-success', (playerData) => {
    console.log('✅ Успешно присоединились к комнате', playerData);
    initializeGame(playerData);
});

// Ошибка присоединения к комнате
socket.on('room-error', (message) => {
    showNotification(message, 'error');
    // Возвращаем к форме авторизации
    authSection.style.display = 'block';
    gameContent.style.display = 'none';
});

// Обновление состояния комнаты
socket.on('room-update', (roomData) => {
    console.log('🔄 Получено обновление комнаты:', roomData);
    updateRoomState(roomData);
});

// Обновление чата
socket.on('chat-update', (messages) => {
    updateChat(messages);
});

// Функция обновления статуса подключения
function updateConnectionStatus(status, text) {
    const statusElement = document.getElementById('connectionStatus');
    statusElement.textContent = text;
    statusElement.className = 'connection-status';
    
    if (status === 'connected') {
        statusElement.classList.add('connected');
    } else if (status === 'connecting') {
        statusElement.classList.add('connecting');
    }
}

// Игровые данные
const gameData = {
    cities: {
        tver: { 
            name: "Тверь", 
            cells: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], 
            position: 0,
            description: "Стартовый город",
            history: "Тверь — один из древнейших городов России, основанный в 1135 году.",
            problem: "Основные экологические проблемы Твери — загрязнение воздуха промышленными предприятиями.",
            task: "Ваша задача — помочь городу справиться с экологическими проблемами."
        },
        kineshma: { 
            name: "Кинешма", 
            cells: [18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29], 
            position: 1,
            description: "Город на Волге",
            history: "Кинешма — старинный город на Волге, известный с 1504 года.",
            problem: "Главная экологическая проблема Кинешмы — загрязнение Волги.",
            task: "Помогите очистить берега Волги."
        },
        naberezhnye_chelny: { 
            name: "Набережные Челны", 
            cells: [32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43], 
            position: 2,
            description: "Город автомобилестроителей",
            history: "Набережные Челны — молодой город, основанный в 1930 году.",
            problem: "Основные экологические проблемы — загрязнение воздуха автомобильными выбросами.",
            task: "Помогите внедрить экологичные технологии на автозаводе."
        },
        kazan: { 
            name: "Казань", 
            cells: [47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58], 
            position: 3,
            description: "Столица Татарстана",
            history: "Казань — тысячелетний город, столица Республики Татарстан.",
            problem: "Основные экологические проблемы Казани — высокий уровень загрязнения воздуха.",
            task: "Ваша задача — помочь внедрить экологичные технологии."
        },
        volgograd: { 
            name: "Волгоград", 
            cells: [66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77], 
            position: 4,
            description: "Город-герой",
            history: "Волгоград — город-герой с богатой историей.",
            problem: "Волгоград страдает от сильного промышленного загрязнения.",
            task: "Помогите снизить промышленное загрязнение."
        },
        astrakhan: { 
            name: "Астрахань", 
            cells: [81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93], 
            position: 5,
            description: "Конечная точка маршрута",
            history: "Астрахань — древний город в дельте Волги.",
            problem: "Ключевые экологические проблемы Астрахани — снижение биоразнообразия.",
            task: "Ваша финальная задача — помочь сохранить уникальную экосистему."
        }
    },
    tasks: {
        easy: [
            {
                description: "Посадите 3 дерева в парке",
                type: "drag",
                goal: 3,
                items: ["🌳", "🌳", "🌳", "🌳", "🌳"],
                zones: 3
            },
            {
                description: "Сортируйте мусор по контейнерам",
                type: "sort",
                items: [
                    {name: "Бумага", type: "paper", emoji: "📄"},
                    {name: "Пластик", type: "plastic", emoji: "🥤"},
                    {name: "Стекло", type: "glass", emoji: "🍶"},
                    {name: "Батарейки", type: "battery", emoji: "🔋"}
                ]
            },
            {
                description: "Ответьте на вопрос об экологии",
                type: "quiz",
                question: "Какой из этих материалов разлагается дольше всего?",
                options: [
                    {text: "Бумага", correct: false},
                    {text: "Пластиковая бутылка", correct: true},
                    {text: "Банан", correct: false},
                    {text: "Хлопковая футболка", correct: false}
                ]
            }
        ],
        medium: [
            {
                description: "Очистите реку от мусора",
                type: "clean",
                goal: 5,
                items: ["🗑️", "🗑️", "🗑️", "🗑️", "🗑️", "🌿", "🌿", "🌿"]
            },
            {
                description: "Что такое устойчивое развитие?",
                type: "quiz",
                question: "Что такое устойчивое развитие?",
                options: [
                    {text: "Развитие, удовлетворяющее потребности настоящего без ущерба для будущего", correct: true},
                    {text: "Быстрое экономическое развитие", correct: false},
                    {text: "Развитие только сельского хозяйства", correct: false},
                    {text: "Развитие промышленности", correct: false}
                ]
            }
        ],
        hard: [
            {
                description: "Что такое углеродный след?",
                type: "quiz",
                question: "Что такое углеродный след?",
                options: [
                    {text: "Количество парниковых газов, производимых деятельностью человека", correct: true},
                    {text: "След от угля", correct: false},
                    {text: "Количество деревьев для поглощения CO2", correct: false},
                    {text: "Уровень загрязнения воздуха", correct: false}
                ]
            }
        ]
    },
    buildings: [
        {
            name: "Станция переработки",
            cost: 50,
            points: 100,
            description: "Перерабатывает мусор и уменьшает загрязнение"
        },
        {
            name: "Солнечная электростанция",
            cost: 100,
            points: 200,
            description: "Производит чистую энергию из солнечного света"
        },
        {
            name: "Эко-парк",
            cost: 150,
            points: 300,
            description: "Создает зеленую зону для отдыха и очистки воздуха"
        }
    ],
    difficultyRequirements: {
        easy: { level: 1 },
        medium: { level: 5 },
        hard: { level: 10 }
    }
};

// Состояние игры
let gameState = {
    currentPlayer: null,
    currentPlayerId: null,
    players: {},
    roomId: null,
    cityProgress: {},
    currentTask: null,
    currentDifficulty: "easy",
    gameOver: false,
    usedTasks: { easy: [], medium: [], hard: [] },
    nextCity: null,
    askedForChoice: {}
};

// Элементы DOM
const authSection = document.getElementById('authSection');
const gameContent = document.getElementById('gameContent');
const loginTab = document.getElementById('loginTab');
const registerTab = document.getElementById('registerTab');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const mapGrid = document.getElementById('mapGrid');
const citiesGrid = document.getElementById('citiesGrid');
const rollDiceBtn = document.getElementById('rollDiceBtn');
const buildBtn = document.getElementById('buildBtn');
const moveBtn = document.getElementById('moveBtn');
const completeTaskBtn = document.getElementById('completeTaskBtn');
const checkTaskBtn = document.getElementById('checkTaskBtn');
const diceValue = document.getElementById('diceValue');
const taskDescription = document.getElementById('taskDescription');
const currentTask = document.getElementById('currentTask');
const interactiveTask = document.getElementById('interactiveTask');
const taskArea = document.getElementById('taskArea');
const taskResult = document.getElementById('taskResult');
const noTaskMessage = document.getElementById('noTaskMessage');
const playerName = document.getElementById('playerName');
const currentCity = document.getElementById('currentCity');
const currentPosition = document.getElementById('currentPosition');
const coinsCount = document.getElementById('coinsCount');
const cleaningPoints = document.getElementById('cleaningPoints');
const playerLevel = document.getElementById('playerLevel');
const roomNumber = document.getElementById('roomNumber');
const onlinePlayers = document.getElementById('onlinePlayers');
const playersContainer = document.getElementById('playersContainer');
const inviteBtn = document.getElementById('inviteBtn');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendMessageBtn = document.getElementById('sendMessageBtn');
const easyBtn = document.getElementById('easyBtn');
const mediumBtn = document.getElementById('mediumBtn');
const hardBtn = document.getElementById('hardBtn');
const difficultyBtns = document.querySelectorAll('.difficulty-btn');
const logEntries = document.getElementById('logEntries');
const buildingsSection = document.getElementById('buildingsSection');
const notification = document.getElementById('notification');
const cityModal = document.getElementById('cityModal');
const cityModalTitle = document.getElementById('cityModalTitle');
const cityModalSubtitle = document.getElementById('cityModalSubtitle');
const cityModalHistory = document.getElementById('cityModalHistory');
const cityModalProblem = document.getElementById('cityModalProblem');
const cityModalTask = document.getElementById('cityModalTask');
const cityModalCloseBtn = document.getElementById('cityModalCloseBtn');
const gameInfo = document.getElementById('gameInfo');
const cityProgressContainer = document.getElementById('cityProgressContainer');
const buildingsContainer = document.getElementById('buildingsContainer');
const choiceModal = document.getElementById('choiceModal');
const stayBtn = document.getElementById('stayBtn');
const moveForwardBtn = document.getElementById('moveForwardBtn');

// ==================== ФУНКЦИИ СЕРВЕРА ====================

// Функция присоединения к игре
function joinGame(username, roomId, isNewRoom) {
    if (!isConnected) {
        showNotification('Нет подключения к серверу. Попробуйте обновить страницу.', 'error');
        return;
    }
    
    const playerId = 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    gameState.currentPlayerId = playerId;
    gameState.roomId = roomId;
    currentRoomId = roomId;
    
    // Отправляем запрос на присоединение к комнате
    socket.emit('join-room', {
        roomId: roomId,
        playerId: playerId,
        playerName: username,
        isNewRoom: isNewRoom
    });
    
    showNotification('Подключаемся к комнате...', 'info');
}

// Функция инициализации игры после присоединения к комнате
function initializeGame(playerData) {
    gameState.currentPlayer = playerData;
    gameState.currentPlayerId = playerData.id;
    
    // Показываем игровой интерфейс
    authSection.style.display = 'none';
    gameContent.style.display = 'block';
    updatePlayerUI();
    roomNumber.textContent = gameState.roomId;
    
    // Инициализируем игровые компоненты
    createMap();
    createCitiesGrid();
    createBuildingsList();
    updateDifficultyButtons();
    
    showNotification(`Добро пожаловать в игру, ${playerData.name}!`, 'success');
    
    setTimeout(() => {
        showCityModal(gameState.currentPlayer.city);
    }, 1000);
}

// Функция обновления состояния комнаты
function updateRoomState(roomData) {
    // Обновляем список игроков
    gameState.players = {};
    roomData.players.forEach(player => {
        gameState.players[player.id] = player;
    });
    
    // Обновляем прогресс городов
    gameState.cityProgress = roomData.cityProgress || {};
    
    // Обновляем UI
    updatePlayersList();
    updatePlayerMarkers();
    onlinePlayers.textContent = roomData.players.filter(p => p.connected).length;
    
    createCityProgress();
    
    // Синхронизируем данные текущего игрока
    if (gameState.currentPlayerId && gameState.players[gameState.currentPlayerId]) {
        const serverPlayer = gameState.players[gameState.currentPlayerId];
        gameState.currentPlayer = serverPlayer;
        updatePlayerUI();
    }
}

// Функция обновления чата
function updateChat(messages) {
    chatMessages.innerHTML = '';
    messages.forEach(msg => {
        const messageElement = document.createElement('div');
        messageElement.className = `log-entry ${msg.type === 'system' ? 'system' : 'chat'}`;
        
        let icon = '💬';
        if (msg.type === 'system') icon = 'ℹ️';
        
        messageElement.innerHTML = `
            <span style="opacity: 0.7;">${icon} ${msg.sender}:</span> ${msg.message}
        `;
        chatMessages.appendChild(messageElement);
    });
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Функция сохранения состояния игрока на сервере
function savePlayerState() {
    if (!isConnected || !gameState.currentPlayer) return;
    
    socket.emit('player-update', {
        id: gameState.currentPlayerId,
        name: gameState.currentPlayer.name,
        position: gameState.currentPlayer.position,
        city: gameState.currentPlayer.city,
        coins: gameState.currentPlayer.coins,
        cleaningPoints: gameState.currentPlayer.cleaningPoints,
        buildings: gameState.currentPlayer.buildings,
        level: gameState.currentPlayer.level,
        completedTasks: gameState.currentPlayer.completedTasks,
        color: gameState.currentPlayer.color,
        connected: true
    });
}

// Функция отправки сообщения в чат
function sendChatMessage(message) {
    if (isConnected && gameState.currentPlayer) {
        socket.emit('chat-message', {
            playerId: gameState.currentPlayerId,
            message: message
        });
    }
}

// Функция отправки системного сообщения
function sendSystemMessage(message) {
    if (isConnected) {
        socket.emit('system-message', message);
    }
}

// ==================== ОСНОВНЫЕ ФУНКЦИИ ИГРЫ ====================

// Показать уведомление
function showNotification(message, type = 'info') {
    notification.textContent = message;
    notification.className = 'notification';
    
    if (type === 'success') {
        notification.style.background = 'var(--success)';
    } else if (type === 'warning') {
        notification.style.background = 'var(--warning)';
    } else if (type === 'error') {
        notification.style.background = 'var(--accent)';
    } else {
        notification.style.background = 'var(--secondary)';
    }
    
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Создание карты
function createMap() {
    mapGrid.innerHTML = '';
    
    const riverCells = [14, 15, 16, 17, 30, 31, 44, 45, 46, 59, 60, 61, 62, 63, 64, 65, 78, 79, 80];
    const forestCells = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93];
    
    for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
            const cell = document.createElement('div');
            cell.className = 'map-cell';
            
            const cellNumber = row * 10 + col + 1;
            
            if (cellNumber > 94) {
                cell.classList.add('empty');
                cell.textContent = '';
                mapGrid.appendChild(cell);
                continue;
            }
            
            if (cellNumber === 1) {
                cell.classList.add('start');
                cell.textContent = 'Старт';
            } else if (cellNumber === 94) {
                cell.classList.add('finish');
                cell.textContent = 'Финиш';
            } else if (riverCells.includes(cellNumber)) {
                cell.classList.add('river');
                cell.textContent = cellNumber;
            } else if (forestCells.includes(cellNumber)) {
                cell.classList.add('forest');
                cell.textContent = cellNumber;
            } else {
                let isCity = false;
                for (const cityKey in gameData.cities) {
                    if (gameData.cities[cityKey].cells.includes(cellNumber)) {
                        cell.classList.add('city');
                        cell.textContent = cellNumber;
                        isCity = true;
                        break;
                    }
                }
                if (!isCity) {
                    cell.textContent = cellNumber;
                }
            }
            
            mapGrid.appendChild(cell);
        }
    }
    
    updatePlayerMarkers();
}

// Обновление маркеров игроков
function updatePlayerMarkers() {
    document.querySelectorAll('.player-marker').forEach(marker => marker.remove());
    
    for (const playerId in gameState.players) {
        const player = gameState.players[playerId];
        if (!player.connected) continue;
        
        const marker = document.createElement('div');
        marker.className = 'player-marker';
        marker.id = `marker-${playerId}`;
        marker.setAttribute('data-player', player.name);
        
        const cellNumber = player.position || 0;
        const row = Math.floor((cellNumber - 1) / 10);
        const col = (cellNumber - 1) % 10;
        
        marker.style.left = `${(col * 10) + 5}%`;
        marker.style.top = `${(row * 10) + 5}%`;
        marker.style.background = player.color;
        
        // Добавляем иконку для текущего игрока
        if (playerId === gameState.currentPlayerId) {
            marker.innerHTML = '<i class="fas fa-user" style="font-size: 12px;"></i>';
        }
        
        mapGrid.appendChild(marker);
    }
}

// Обновление списка игроков
function updatePlayersList() {
    playersContainer.innerHTML = '';
    
    for (const playerId in gameState.players) {
        const player = gameState.players[playerId];
        const playerItem = document.createElement('div');
        playerItem.className = 'player-item';
        
        if (playerId === gameState.currentPlayerId) {
            playerItem.classList.add('current');
        }
        
        if (!player.connected) {
            playerItem.style.opacity = '0.6';
        }
        
        const statusIcon = player.connected ? '🟢' : '🔴';
        
        playerItem.innerHTML = `
            <span>${statusIcon} ${player.name} 
                ${playerId === gameState.currentPlayerId ? '<span style="color: var(--secondary);">(Вы)</span>' : ''}
            </span>
            <span>${player.cleaningPoints} баллов</span>
        `;
        
        playersContainer.appendChild(playerItem);
    }
}

// Обновление интерфейса игрока
function updatePlayerUI() {
    if (gameState.currentPlayer) {
        playerName.textContent = gameState.currentPlayer.name;
        currentCity.textContent = gameData.cities[gameState.currentPlayer.city]?.name || 'Тверь';
        currentPosition.textContent = gameState.currentPlayer.position;
        coinsCount.textContent = gameState.currentPlayer.coins;
        cleaningPoints.textContent = gameState.currentPlayer.cleaningPoints;
        playerLevel.textContent = gameState.currentPlayer.level;
    }
}

// Создание прогресса для всех городов
function createCityProgress() {
    cityProgressContainer.innerHTML = '';
    
    for (const cityKey in gameData.cities) {
        const city = gameData.cities[cityKey];
        const progress = gameState.cityProgress[cityKey] || 0;
        
        const progressElement = document.createElement('div');
        progressElement.className = 'city-progress';
        progressElement.innerHTML = `
            <div class="city-progress-header">
                <span>${city.name}</span>
                <span>${progress}%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress}%;"></div>
            </div>
        `;
        
        cityProgressContainer.appendChild(progressElement);
    }
}

// Создание сетки городов
function createCitiesGrid() {
    citiesGrid.innerHTML = '';
    
    for (const cityKey in gameData.cities) {
        const city = gameData.cities[cityKey];
        const cityCard = document.createElement('div');
        cityCard.className = 'city-card';
        cityCard.dataset.city = cityKey;
        
        if (cityKey === (gameState.currentPlayer?.city || 'tver')) {
            cityCard.classList.add('active');
        }
        
        cityCard.innerHTML = `
            <div class="city-name">${city.name}</div>
            <div class="city-position">Позиции: ${city.cells[0]}-${city.cells[city.cells.length-1]}</div>
        `;
        
        citiesGrid.appendChild(cityCard);
    }
}

// Создание списка зданий
function createBuildingsList() {
    buildingsContainer.innerHTML = '';
    
    gameData.buildings.forEach((building, index) => {
        const buildingItem = document.createElement('div');
        buildingItem.className = 'building-item';
        buildingItem.innerHTML = `
            <div>
                <div style="font-weight: bold;">${building.name} (${building.cost} монет)</div>
                <div style="font-size: 0.8rem; color: rgba(255,255,255,0.7);">${building.description}</div>
            </div>
            <button class="game-btn buy-btn" data-building="${index}">Купить</button>
        `;
        
        buildingsContainer.appendChild(buildingItem);
    });
    
    document.querySelectorAll('.buy-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const buildingIndex = parseInt(this.dataset.building);
            const building = gameData.buildings[buildingIndex];
            
            if (gameState.currentPlayer.coins >= building.cost) {
                gameState.currentPlayer.coins -= building.cost;
                gameState.currentPlayer.cleaningPoints += building.points;
                gameState.currentPlayer.buildings.push(building.name);
                
                updatePlayerUI();
                
                const currentCityProgress = gameState.cityProgress[gameState.currentPlayer.city] || 0;
                const newProgress = Math.min(100, currentCityProgress + 15);
                updateCityProgress(gameState.currentPlayer.city, newProgress);
                
                addLogEntry(`Вы построили "${building.name}"! Получено ${building.points} баллов очищения.`);
                sendSystemMessage(`Игрок "${gameState.currentPlayer.name}" построил "${building.name}"!`);
                
                savePlayerState();
                
                if (gameState.currentPlayer.position >= 94 && gameState.currentPlayer.buildings.length >= 1) {
                    gameState.gameOver = true;
                    addLogEntry(`🎊 Поздравляем! Вы достигли Астрахани и построили объект! Игра завершена.`);
                    sendSystemMessage(`🎊 Поздравляем! Игрок "${gameState.currentPlayer.name}" достиг Астрахани и построил объект! Игра завершена.`);
                    showNotification(`🎊 Поздравляем! Вы достигли Астрахани и построили объект! Игра завершена.`, 'success');
                }
            } else {
                showNotification(`Недостаточно монет для постройки "${building.name}"!`, 'warning');
            }
        });
    });
}

// Обновление прогресса города
function updateCityProgress(cityKey, progress) {
    gameState.cityProgress[cityKey] = progress;
    createCityProgress();
    savePlayerState();
}

// Показать модальное окно города
function showCityModal(cityKey) {
    const city = gameData.cities[cityKey];
    if (!city) return;
    
    cityModalTitle.textContent = city.name;
    cityModalSubtitle.textContent = city.description;
    cityModalHistory.textContent = city.history;
    cityModalProblem.textContent = city.problem;
    cityModalTask.textContent = city.task;
    
    cityModal.classList.add('active');
}

// Закрыть модальное окно города
function closeCityModal() {
    cityModal.classList.remove('active');
}

// Показать модальное окно выбора
function showChoiceModal(nextCity) {
    gameState.nextCity = nextCity;
    choiceModal.classList.add('active');
}

// Закрыть модальное окно выбора
function closeChoiceModal() {
    choiceModal.classList.remove('active');
}

// Обновление кнопок сложности
function updateDifficultyButtons() {
    const playerLevel = gameState.currentPlayer?.level || 1;
    
    easyBtn.classList.remove('locked');
    
    if (playerLevel >= 5) {
        mediumBtn.classList.remove('locked');
    } else {
        mediumBtn.classList.add('locked');
    }
    
    if (playerLevel >= 10) {
        hardBtn.classList.remove('locked');
    } else {
        hardBtn.classList.add('locked');
    }
}

// Добавление записи в журнал
function addLogEntry(message) {
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerHTML = `<i class="fas fa-info-circle"></i> ${message}`;
    logEntries.appendChild(entry);
    logEntries.scrollTop = logEntries.scrollHeight;
}

// Получение случайного задания
function getRandomTask(difficulty) {
    const availableTasks = gameData.tasks[difficulty];
    if (!availableTasks || availableTasks.length === 0) return null;
    
    if (gameState.usedTasks[difficulty].length >= availableTasks.length) {
        gameState.usedTasks[difficulty] = [];
    }
    
    let randomTask;
    let attempts = 0;
    do {
        randomTask = availableTasks[Math.floor(Math.random() * availableTasks.length)];
        attempts++;
    } while (gameState.usedTasks[difficulty].includes(randomTask.description) && attempts < 20);
    
    if (!gameState.usedTasks[difficulty].includes(randomTask.description)) {
        gameState.usedTasks[difficulty].push(randomTask.description);
    }
    
    return randomTask;
}

// ==================== ОБРАБОТЧИКИ СОБЫТИЙ ====================

// Переключение информации об игре
gameInfo.addEventListener('click', function(e) {
    if (e.target.tagName === 'H3' || e.target.classList.contains('toggle-icon')) {
        gameInfo.classList.toggle('expanded');
    }
});

// Переключение между вкладками авторизации
loginTab.addEventListener('click', () => {
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
});

registerTab.addEventListener('click', () => {
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    registerForm.classList.add('active');
    loginForm.classList.remove('active');
});

// Обработка формы входа
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const room = document.getElementById('loginRoom').value.trim();
    
    if (username && room) {
        if (username.length < 2) {
            showNotification('Имя должно содержать至少 2 символа', 'error');
            return;
        }
        joinGame(username, room, false);
    } else {
        showNotification('Заполните все поля', 'error');
    }
});

// Обработка формы регистрации
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value.trim();
    const room = document.getElementById('registerRoom').value.trim();
    
    if (username && room) {
        if (username.length < 2) {
            showNotification('Имя должно содержать至少 2 символа', 'error');
            return;
        }
        if (room.length < 1) {
            showNotification('Введите номер комнаты', 'error');
            return;
        }
        joinGame(username, room, true);
    } else {
        showNotification('Заполните все поля', 'error');
    }
});

// Бросок кубика
rollDiceBtn.addEventListener('click', () => {
    if (gameState.gameOver) return;
    
    diceValue.classList.add('rolling');
    diceValue.querySelector('.dice-value').textContent = '?';
    rollDiceBtn.disabled = true;
    
    setTimeout(() => {
        const value = Math.floor(Math.random() * 6) + 1;
        
        diceValue.querySelector('.dice-value').textContent = value;
        diceValue.classList.remove('rolling');
        
        gameState.currentPlayer.position += value;
        if (gameState.currentPlayer.position > 94) {
            gameState.currentPlayer.position = 94;
        }
        
        updatePlayerUI();
        updatePlayerCity();
        
        const randomTask = getRandomTask(gameState.currentDifficulty);
        gameState.currentTask = randomTask;
        
        if (randomTask) {
            currentTask.style.display = 'block';
            taskDescription.textContent = randomTask.description;
            noTaskMessage.style.display = 'none';
            completeTaskBtn.disabled = false;
        }
        
        addLogEntry(`Вы бросили кубик и выпало: ${value}. Новое положение: ${gameState.currentPlayer.position}`);
        sendSystemMessage(`Игрок "${gameState.currentPlayer.name}" бросил кубик и выпало: ${value}`);
        
        updatePlayerMarkers();
        savePlayerState();
        
        showNotification(`Вы переместились на ${value} клеток!`, 'success');
    }, 1200);
});

// Обновление города игрока
function updatePlayerCity() {
    const playerPosition = gameState.currentPlayer.position;
    let newCity = gameState.currentPlayer.city;
    
    for (const cityKey in gameData.cities) {
        if (gameData.cities[cityKey].cells.includes(playerPosition)) {
            newCity = cityKey;
            break;
        }
    }
    
    if (newCity !== gameState.currentPlayer.city) {
        const currentProgress = gameState.cityProgress[gameState.currentPlayer.city] || 0;
        const choiceKey = `${gameState.currentPlayer.city}_${newCity}`;
        
        if (currentProgress < 100 && !gameState.askedForChoice[choiceKey]) {
            showChoiceModal(newCity);
            gameState.askedForChoice[choiceKey] = true;
            return;
        }
        
        moveToCity(newCity);
    }
}

// Переход в указанный город
function moveToCity(cityKey) {
    gameState.currentPlayer.city = cityKey;
    updatePlayerUI();
    
    document.querySelectorAll('.city-card').forEach(card => {
        card.classList.remove('active');
        if (card.dataset.city === cityKey) {
            card.classList.add('active');
        }
    });
    
    addLogEntry(`Вы прибыли в город: ${gameData.cities[cityKey].name}`);
    sendSystemMessage(`Игрок "${gameState.currentPlayer.name}" прибыл в ${gameData.cities[cityKey].name}!`);
    
    if (gameState.cityProgress[cityKey] >= 100) {
        moveBtn.disabled = false;
        moveBtn.textContent = "Перейти в следующий город";
    } else {
        moveBtn.disabled = true;
        moveBtn.textContent = "Завершите очищение города";
    }
    
    savePlayerState();
    showNotification(`Вы прибыли в ${gameData.cities[cityKey].name}!`, 'success');
    
    setTimeout(() => {
        showCityModal(cityKey);
    }, 500);
}

// Начало выполнения задания
completeTaskBtn.addEventListener('click', () => {
    currentTask.style.display = 'none';
    interactiveTask.style.display = 'block';
    completeTaskBtn.disabled = true;
    // createInteractiveTask(gameState.currentTask); // Упростим для демонстрации
    taskArea.innerHTML = `
        <p>Задание "${gameState.currentTask.description}"</p>
        <p>Для завершения задания нажмите кнопку "Проверить выполнение"</p>
    `;
});

// Проверка задания
checkTaskBtn.addEventListener('click', () => {
    completeInteractiveTask();
});

// Завершение интерактивного задания
function completeInteractiveTask() {
    let coinsEarned = 0;
    let expEarned = 0;
    
    switch(gameState.currentDifficulty) {
        case 'easy': 
            coinsEarned = 20; 
            expEarned = 1;
            break;
        case 'medium': 
            coinsEarned = 40; 
            expEarned = 3;
            break;
        case 'hard': 
            coinsEarned = 60; 
            expEarned = 5;
            break;
    }
    
    gameState.currentPlayer.coins += coinsEarned;
    gameState.currentPlayer.completedTasks += 1;
    
    const currentCityProgress = gameState.cityProgress[gameState.currentPlayer.city] || 0;
    const newProgress = Math.min(100, currentCityProgress + 10);
    updateCityProgress(gameState.currentPlayer.city, newProgress);
    
    if (gameState.currentPlayer.completedTasks >= 3 && gameState.currentPlayer.completedTasks % 3 === 0) {
        gameState.currentPlayer.level += 1;
        updatePlayerUI();
        addLogEntry(`🎉 Поздравляем! Вы повысили уровень до ${gameState.currentPlayer.level}!`);
        sendSystemMessage(`🎉 Игрок "${gameState.currentPlayer.name}" достиг ${gameState.currentPlayer.level}-го уровня!`);
        updateDifficultyButtons();
        showNotification(`Поздравляем! Вы достигли ${gameState.currentPlayer.level}-го уровня!`, 'success');
    }
    
    interactiveTask.style.display = 'none';
    noTaskMessage.style.display = 'block';
    
    buildBtn.disabled = false;
    rollDiceBtn.disabled = false;
    
    addLogEntry(`Вы выполнили задание и получили ${coinsEarned} монет и ${expEarned} опыта!`);
    sendSystemMessage(`Игрок "${gameState.currentPlayer.name}" выполнил задание!`);
    
    savePlayerState();
    showNotification(`Задание выполнено! Вы получили ${coinsEarned} монет и ${expEarned} опыта!`, 'success');
}

// Выбор сложности задания
difficultyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        if (btn.classList.contains('locked')) {
            const requiredLevel = gameData.difficultyRequirements[btn.id.replace('Btn', '')].level;
            showNotification(`Для этой сложности требуется ${requiredLevel}-й уровень!`, 'warning');
            return;
        }
        
        difficultyBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        gameState.currentDifficulty = btn.classList.contains('easy') ? 'easy' : 
                                    btn.classList.contains('medium') ? 'medium' : 'hard';
        addLogEntry(`Установлена сложность: ${gameState.currentDifficulty}`);
    });
});

// Отправка сообщения в чат
sendMessageBtn.addEventListener('click', () => {
    const message = chatInput.value.trim();
    if (message && gameState.currentPlayer) {
        if (message.length > 200) {
            showNotification('Сообщение слишком длинное (макс. 200 символов)', 'warning');
            return;
        }
        sendChatMessage(message);
        chatInput.value = '';
    }
});

chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessageBtn.click();
    }
});

// Приглашение друзей
inviteBtn.addEventListener('click', () => {
    const roomNumber = gameState.roomId;
    if (roomNumber) {
        const inviteText = `Присоединяйтесь к моей комнате в игре "Юный эколог"! Номер комнаты: ${roomNumber}`;
        
        showNotification(`Номер комнаты: ${roomNumber} (скопировано в буфер обмена)`, 'info');
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(inviteText).then(() => {
                showNotification('Приглашение скопировано в буфер обмена!', 'success');
            }).catch(() => {
                // Fallback для старых браузеров
                const textArea = document.createElement('textarea');
                textArea.value = inviteText;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
            });
        }
    }
});

// Закрытие модальных окон
cityModalCloseBtn.addEventListener('click', closeCityModal);
cityModal.addEventListener('click', (e) => {
    if (e.target === cityModal) closeCityModal();
});

stayBtn.addEventListener('click', () => {
    closeChoiceModal();
    const currentCityData = gameData.cities[gameState.currentPlayer.city];
    const firstCell = currentCityData.cells[0];
    gameState.currentPlayer.position = firstCell;
    updatePlayerUI();
    updatePlayerMarkers();
    addLogEntry(`Вы остались в ${currentCityData.name} и вернулись в начало города.`);
    savePlayerState();
    showNotification(`Вы остались в ${currentCityData.name}!`, 'info');
});

moveForwardBtn.addEventListener('click', () => {
    closeChoiceModal();
    moveToCity(gameState.nextCity);
});

choiceModal.addEventListener('click', (e) => {
    if (e.target === choiceModal) closeChoiceModal();
});

// Перемещение в другой город
moveBtn.addEventListener('click', () => {
    if (gameState.gameOver) return;
    
    const currentCityKey = gameState.currentPlayer.city;
    if (gameState.cityProgress[currentCityKey] < 100) {
        showNotification(`Необходимо достичь 100% прогресса очищения в ${gameData.cities[currentCityKey].name} для перехода!`, 'warning');
        return;
    }
    
    const cityKeys = Object.keys(gameData.cities);
    const currentIndex = cityKeys.indexOf(currentCityKey);
    
    if (currentIndex < cityKeys.length - 1) {
        const nextCity = cityKeys[currentIndex + 1];
        const nextPosition = gameData.cities[nextCity].cells[0];
        gameState.currentPlayer.position = nextPosition;
        moveToCity(nextCity);
        
        if (nextCity === "astrakhan") {
            addLogEntry(`🏁 Вы достигли Астрахани! Постройте объект, чтобы завершить игру.`);
            showNotification(`🏁 Вы достигли Астрахани! Постройте объект, чтобы завершить игру.`, 'success');
        }
    }
});

// Обработчик выхода из игры
window.addEventListener('beforeunload', () => {
    if (isConnected) {
        socket.emit('leave-room');
    }
});

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    updateConnectionStatus('connecting', '🔄 Подключение к серверу...');
    console.log('🎮 Игра "Юный эколог" загружена и готова!');
});