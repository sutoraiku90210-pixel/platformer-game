// Основной файл игры
document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const resetBtn = document.getElementById('resetBtn');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const soundToggle = document.getElementById('soundToggle');
    const startModal = document.getElementById('startModal');
    const closeModal = document.getElementById('closeModal');
    
    // Игровые переменные
    let gameRunning = false;
    let gamePaused = false;
    let lastTime = 0;
    let score = 0;
    let lives = 3;
    let level = 1;
    
    // Размеры игрового мира
    const GAME_WIDTH = 800;
    const GAME_HEIGHT = 500;
    
    // Объекты игры
    const player = {
        x: 100,
        y: 400,
        width: 40,
        height: 60,
        color: '#0ea5e9',
        velocityX: 0,
        velocityY: 0,
        speed: 5,
        jumpPower: 15,
        grounded: false,
        jumping: false
    };
    
    // Платформы
    const platforms = [
        {x: 0, y: 450, width: 200, height: 50, color: '#10b981'},
        {x: 250, y: 400, width: 150, height: 50, color: '#10b981'},
        {x: 450, y: 350, width: 150, height: 50, color: '#10b981'},
        {x: 650, y: 300, width: 150, height: 50, color: '#10b981'},
        {x: 350, y: 250, width: 200, height: 50, color: '#10b981'},
        {x: 100, y: 200, width: 150, height: 50, color: '#10b981'},
        {x: 600, y: 150, width: 200, height: 50, color: '#10b981'}
    ];
    
    // Монеты
    const coins = [
        {x: 120, y: 380, collected: false, color: '#fbbf24'},
        {x: 300, y: 350, collected: false, color: '#fbbf24'},
        {x: 500, y: 300, collected: false, color: '#fbbf24'},
        {x: 700, y: 250, collected: false, color: '#fbbf24'},
        {x: 400, y: 200, collected: false, color: '#fbbf24'},
        {x: 150, y: 150, collected: false, color: '#fbbf24'}
    ];
    
    // Враги
    const enemies = [
        {x: 400, y: 420, width: 40, height: 40, color: '#ef4444', direction: 1, speed: 2},
        {x: 200, y: 320, width: 40, height: 40, color: '#ef4444', direction: 1, speed: 1.5}
    ];
    
    // Ключи
    const keys = {};
    
    // Инициализация игры
    function init() {
        // Показать модальное окно при запуске
        startModal.style.display = 'flex';
        
        // Обновить UI
        updateUI();
        
        // Начать игровой цикл
        requestAnimationFrame(gameLoop);
    }
    
    // Игровой цикл
    function gameLoop(timestamp) {
        // Вычислить дельту времени
        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;
        
        // Очистить канвас
        ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        
        // Нарисовать фон
        drawBackground();
        
        // Обновить и отрисовать игровые объекты если игра запущена
        if (gameRunning && !gamePaused) {
            // Обновить физику
            updatePhysics(deltaTime);
            
            // Проверить коллизии
            checkCollisions();
            
            // Обновить врагов
            updateEnemies(deltaTime);
        }
        
        // Отрисовать игровые объекты
        drawPlatforms();
        drawCoins();
        drawEnemies();
        drawPlayer();
        
        // Отрисовать UI поверх всего
        drawGameUI();
        
        // Продолжить цикл
        requestAnimationFrame(gameLoop);
    }
    
    // Нарисовать фон
    function drawBackground() {
        // Градиентный фон
        const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
        gradient.addColorStop(0, '#0f172a');
        gradient.addColorStop(1, '#1e293b');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        
        // Звезды
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * GAME_WIDTH;
            const y = Math.random() * GAME_HEIGHT * 0.7;
            const size = Math.random() * 2 + 1;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Горы на заднем плане
        ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
        ctx.beginPath();
        ctx.moveTo(0, GAME_HEIGHT);
        ctx.lineTo(0, GAME_HEIGHT * 0.6);
        ctx.lineTo(GAME_WIDTH * 0.3, GAME_HEIGHT * 0.5);
        ctx.lineTo(GAME_WIDTH * 0.5, GAME_HEIGHT * 0.7);
        ctx.lineTo(GAME_WIDTH * 0.8, GAME_HEIGHT * 0.4);
        ctx.lineTo(GAME_WIDTH, GAME_HEIGHT * 0.6);
        ctx.lineTo(GAME_WIDTH, GAME_HEIGHT);
        ctx.closePath();
        ctx.fill();
    }
    
    // Нарисовать платформы
    function drawPlatforms() {
        platforms.forEach(platform => {
            ctx.fillStyle = platform.color;
            ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            
            // Текстура платформы
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            for (let i = 0; i < platform.width; i += 20) {
                ctx.fillRect(platform.x + i, platform.y, 10, platform.height);
            }
        });
    }
    
    // Нарисовать монеты
    function drawCoins() {
        coins.forEach(coin => {
            if (!coin.collected) {
                ctx.fillStyle = coin.color;
                ctx.beginPath();
                ctx.arc(coin.x, coin.y, 10, 0, Math.PI * 2);
                ctx.fill();
                
                // Блик на монете
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.beginPath();
                ctx.arc(coin.x - 3, coin.y - 3, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }
    
    // Нарисовать врагов
    function drawEnemies() {
        enemies.forEach(enemy => {
            ctx.fillStyle = enemy.color;
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            
            // Глаза врага
            ctx.fillStyle = 'white';
            ctx.fillRect(enemy.x + 10, enemy.y + 10, 8, 8);
            ctx.fillRect(enemy.x + 22, enemy.y + 10, 8, 8);
            
            ctx.fillStyle = 'black';
            ctx.fillRect(enemy.x + 12, enemy.y + 12, 4, 4);
            ctx.fillRect(enemy.x + 24, enemy.y + 12, 4, 4);
        });
    }
    
    // Нарисовать игрока
    function drawPlayer() {
        // Тело игрока
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.width, player.height);
        
        // Глаза
        ctx.fillStyle = 'white';
        ctx.fillRect(player.x + 10, player.y + 15, 8, 8);
        ctx.fillRect(player.x + 22, player.y + 15, 8, 8);
        
        // Зрачки
        ctx.fillStyle = 'black';
        ctx.fillRect(player.x + 12, player.y + 17, 4, 4);
        ctx.fillRect(player.x + 24, player.y + 17, 4, 4);
        
        // Улыбка
        ctx.beginPath();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.arc(player.x + 20, player.y + 30, 10, 0.2, Math.PI - 0.2);
        ctx.stroke();
    }
    
    // Нарисовать игровой UI
    function drawGameUI() {
        // Пауза
        if (gamePaused) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
            
            ctx.font = '40px "Press Start 2P"';
            ctx.fillStyle = '#0ea5e9';
            ctx.textAlign = 'center';
            ctx.fillText('ПАУЗА', GAME_WIDTH / 2, GAME_HEIGHT / 2);
            
            ctx.font = '20px "Press Start 2P"';
            ctx.fillStyle = 'white';
            ctx.fillText('Нажмите P для продолжения', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50);
        }
        
        // Game Over
        if (lives <= 0) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
            
            ctx.font = '40px "Press Start 2P"';
            ctx.fillStyle = '#ef4444';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', GAME_WIDTH / 2, GAME_HEIGHT / 2);
            
            ctx.font = '20px "Press Start 2P"';
            ctx.fillStyle = 'white';
            ctx.fillText(`Очки: ${score}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50);
            
            ctx.fillText('Нажмите R для рестарта', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 100);
        }
    }
    
    // Обновить физику
    function updatePhysics(deltaTime) {
        // Гравитация
        player.velocityY += 0.5;
        
        // Движение по горизонтали
        if (keys['ArrowLeft'] || keys['KeyA']) {
            player.velocityX = -player.speed;
        } else if (keys['ArrowRight'] || keys['KeyD']) {
            player.velocityX = player.speed;
        } else {
            player.velocityX *= 0.8; // Трение
        }
        
        // Прыжок
        if ((keys['Space'] || keys['ArrowUp'] || keys['KeyW']) && player.grounded) {
            player.velocityY = -player.jumpPower;
            player.grounded = false;
            player.jumping = true;
        }
        
        // Применить скорость
        player.x += player.velocityX;
        player.y += player.velocityY;
        
        // Границы экрана
        if (player.x < 0) player.x = 0;
        if (player.x + player.width > GAME_WIDTH) player.x = GAME_WIDTH - player.width;
        if (player.y > GAME_HEIGHT) {
            player.y = 100;
            player.velocityY = 0;
            loseLife();
        }
        
        // Коллизии с платформами
        player.grounded = false;
        platforms.forEach(platform => {
            if (player.x < platform.x + platform.width &&
                player.x + player.width > platform.x &&
                player.y < platform.y + platform.height &&
                player.y + player.height > platform.y) {
                
                // Определить сторону коллизии
                const bottom = player.y + player.height;
                const top = player.y;
                const platformTop = platform.y;
                
                if (bottom > platformTop && top < platformTop && player.velocityY > 0) {
                    player.y = platformTop - player.height;
                    player.velocityY = 0;
                    player.grounded = true;
                    player.jumping = false;
                }
            }
        });
    }
    
    // Обновить врагов
    function updateEnemies(deltaTime) {
        enemies.forEach(enemy => {
            enemy.x += enemy.speed * enemy.direction;
            
            // Проверить границы платформы
            let onPlatform = false;
            platforms.forEach(platform => {
                if (enemy.x >= platform.x && 
                    enemy.x + enemy.width <= platform.x + platform.width &&
                    enemy.y + enemy.height >= platform.y &&
                    enemy.y + enemy.height <= platform.y + 10) {
                    onPlatform = true;
                }
            });
            
            // Развернуть если достиг края платформы или стены
            if (!onPlatform || enemy.x <= 0 || enemy.x + enemy.width >= GAME_WIDTH) {
                enemy.direction *= -1;
            }
        });
    }
    
    // Проверить коллизии
    function checkCollisions() {
        // Коллизии с монетами
        coins.forEach(coin => {
            if (!coin.collected &&
                player.x < coin.x + 10 &&
                player.x + player.width > coin.x - 10 &&
                player.y < coin.y + 10 &&
                player.y + player.height > coin.y - 10) {
                
                coin.collected = true;
                score += 100;
                updateUI();
                
                // Проверить все ли монеты собраны
                const allCollected = coins.every(c => c.collected);
                if (allCollected) {
                    levelUp();
                }
            }
        });
        
        // Коллизии с врагами
        enemies.forEach(enemy => {
            if (player.x < enemy.x + enemy.width &&
                player.x + player.width > enemy.x &&
                player.y < enemy.y + enemy.height &&
                player.y + player.height > enemy.y) {
                
                // Игрок сверху врага
                if (player.velocityY > 0 && 
                    player.y + player.height - enemy.y < 20) {
                    // Убить врага
                    enemy.y = 1000; // Убрать с экрана
                    player.velocityY = -player.jumpPower * 0.8; // Отскок
                    score += 200;
                    updateUI();
                } else {
                    // Игрок получает урон
                    loseLife();
                    // Отбросить игрока
                    player.velocityY = -10;
                    player.velocityX = (player.x < enemy.x) ? -10 : 10;
                }
            }
        });
    }
    
    // Увеличить уровень
    function levelUp() {
        level++;
        score += 1000;
        
        // Сбросить монеты
        coins.forEach(coin => {
            coin.collected = false;
        });
        
        // Добавить больше врагов на следующих уровнях
        if (level === 2) {
            enemies.push({x: 500, y: 220, width: 40, height: 40, color: '#ef4444', direction: 1, speed: 2});
        }
        
        updateUI();
    }
    
    // Потерять жизнь
    function loseLife() {
        lives--;
        updateUI();
        
        if (lives <= 0) {
            gameRunning = false;
        } else {
            // Респаун игрока
            player.x = 100;
            player.y = 400;
            player.velocityX = 0;
            player.velocityY = 0;
        }
    }
    
    // Обновить UI
    function updateUI() {
        document.getElementById('score').textContent = score;
        document.getElementById('lives').textContent = lives;
        document.getElementById('level').textContent = level;
        
        // Обновить задачи
        const collectedCount = coins.filter(coin => coin.collected).length;
        const tasks = document.querySelectorAll('#tasksList li');
        
        if (tasks.length > 0) {
            tasks[0].innerHTML = `<i class="far ${collectedCount >= 10 ? 'fa-check-circle' : 'fa-circle'}"></i> Собрать 10 монет (${collectedCount}/10)`;
        }
    }
    
    // События клавиатуры
    window.addEventListener('keydown', function(e) {
        keys[e.code] = true;
        
        // Пауза по P
        if (e.code === 'KeyP') {
            togglePause();
        }
        
        // Рестарт по R
        if (e.code === 'KeyR') {
            restartGame();
        }
    });
    
    window.addEventListener('keyup', function(e) {
        keys[e.code] = false;
    });
    
    // Функции управления игрой
    function startGame() {
        gameRunning = true;
        gamePaused = false;
        startBtn.innerHTML = '<i class="fas fa-play"></i> Игра идет...';
        startBtn.disabled = true;
        pauseBtn.disabled = false;
    }
    
    function togglePause() {
        if (!gameRunning) return;
        
        gamePaused = !gamePaused;
        pauseBtn.innerHTML = gamePaused ? 
            '<i class="fas fa-play"></i> Продолжить' : 
            '<i class="fas fa-pause"></i> Пауза';
    }
    
    function restartGame() {
        // Сброс переменных
        score = 0;
        lives = 3;
        level = 1;
        
        // Сброс игрока
        player.x = 100;
        player.y = 400;
        player.velocityX = 0;
        player.velocityY = 0;
        
        // Сброс монет
        coins.forEach(coin => {
            coin.collected = false;
        });
        
        // Сброс врагов
        enemies.length = 2;
        
        // Обновить UI
        updateUI();
        
        // Запустить игру
        gameRunning = true;
        gamePaused = false;
        startBtn.innerHTML = '<i class="fas fa-play"></i> Игра идет...';
        startBtn.disabled = true;
        pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Пауза';
        pauseBtn.disabled = false;
    }
    
    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            canvas.requestFullscreen().catch(err => {
                console.log(`Ошибка при включении полноэкранного режима: ${err.message}`);
            });
            fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i> Обычный экран';
        } else {
            document.exitFullscreen();
            fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i> На весь экран';
        }
    }
    
    // Обработчики событий
    startBtn.addEventListener('click', startGame);
    pauseBtn.addEventListener('click', togglePause);
    resetBtn.addEventListener('click', restartGame);
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    
    soundToggle.addEventListener('click', function(e) {
        e.preventDefault();
        const icon = this.querySelector('i');
        const text = this.querySelector('span') || this;
        
        if (icon.classList.contains('fa-volume-up')) {
            icon.classList.remove('fa-volume-up');
            icon.classList.add('fa-volume-mute');
            text.textContent = 'Звук: Выкл';
        } else {
            icon.classList.remove('fa-volume-mute');
            icon.classList.add('fa-volume-up');
            text.textContent = 'Звук: Вкл';
        }
    });
    
    closeModal.addEventListener('click', function() {
        startModal.style.display = 'none';
        startGame();
    });
    
    // Закрыть модальное окно по клику вне его
    window.addEventListener('click', function(e) {
        if (e.target === startModal) {
            startModal.style.display = 'none';
            startGame();
        }
    });
    
    // Инициализировать игру
    init();
});