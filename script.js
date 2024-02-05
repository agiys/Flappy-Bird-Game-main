// Скорость движения игрового персонажа
let move_speed = 3;

// Значения гравитации для разных уровней сложности
let gravityValues = {
    'easy': 0.25,
    'normal': 0.3,
    'hard': 0.45
};

// Получение элементов из DOM
let bird = document.querySelector('.bird');
let img = document.getElementById('bird-1');
let sound_point = new Audio('sounds effect/point.mp3');
let sound_die = new Audio('sounds effect/die.mp3');

// Получение начальных координат игровой птицы и фона
let bird_props = bird.getBoundingClientRect();
let background = document.querySelector('.background').getBoundingClientRect();

// Элементы для отображения текущего счета и рекорда
let score_val = document.querySelector('.score_val');
let highscore_val = document.querySelector('.highscore_val');

// Элементы для отображения сообщения о конце игры и заголовков счета и рекорда
let message = document.querySelector('.message');
let score_title = document.querySelector('.score_title');
let highscore_title = document.querySelector('.highscore_title');

// Изначальное состояние игры
let game_state = 'Start';

// Скрытие изображения птицы при старте игры
img.style.display = 'none';

// Добавление стилей для сообщения о конце игры
message.classList.add('messageStyle');

// Изначальная сложность - легкая
let difficulty = 'easy';
let gravity = gravityValues[difficulty];

// Функция для изменения уровня сложности
function changeDifficulty(newDifficulty) {
    difficulty = newDifficulty;
    gravity = gravityValues[difficulty];
}

// Функция для начала новой игры с выбранной сложностью
function startGame(difficulty) {
    document.querySelectorAll('.pipe_sprite').forEach((e) => {
        e.remove();
    });
    img.style.display = 'block';
    bird.style.top = '40vh';
    game_state = 'Play';
    message.innerHTML = '';
    score_title.innerHTML = 'Score : ';
    score_val.innerHTML = '0';
    message.classList.remove('messageStyle');
    changeDifficulty(difficulty);
    play();
}

// Событие нажатия клавиши Enter для начала новой игры
document.addEventListener('keydown', (e) => {
    if (e.key == 'Enter') {
        if (game_state === 'End') {
            startGame(difficulty);
        }
    }
});

// Загрузка рекорда из JSON при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    loadHighscore();
});

// Сохранение рекорда в JSON
function saveHighscore() {
    const currentHighscore = parseInt(highscore_val.innerHTML);
    const highscoreData = { highscore: currentHighscore };
    localStorage.setItem('highscoreData', JSON.stringify(highscoreData));
}

// Загрузка рекорда из JSON
function loadHighscore() {
    const highscoreDataString = localStorage.getItem('highscoreData');
    if (highscoreDataString) {
        const highscoreData = JSON.parse(highscoreDataString);
        const savedHighscore = highscoreData.highscore;
        highscore_val.innerHTML = savedHighscore;
    }
}

// Обновление рекорда при достижении нового рекорда
function updateHighscore() {
    const currentScore = parseInt(score_val.innerHTML);
    const currentHighscore = parseInt(highscore_val.innerHTML);

    if (currentScore > currentHighscore) {
        highscore_val.innerHTML = currentScore;
        saveHighscore();
    }
}

// Основная функция игры
function play() {
    // Функция для движения труб
    function move() {
        if (game_state != 'Play') return;

        let pipe_sprite = document.querySelectorAll('.pipe_sprite');
        pipe_sprite.forEach((element) => {
            let pipe_sprite_props = element.getBoundingClientRect();
            bird_props = bird.getBoundingClientRect();

            if (pipe_sprite_props.right <= 0) {
                element.remove();
            } else {
                if (bird_props.left < pipe_sprite_props.left + pipe_sprite_props.width && bird_props.left + bird_props.width > pipe_sprite_props.left && bird_props.top < pipe_sprite_props.top + pipe_sprite_props.height && bird_props.top + bird_props.height > pipe_sprite_props.top) {
                    // При столкновении с трубой игра завершается
                    game_state = 'End';
                    message.innerHTML = 'Игра окончена'.fontcolor('red') + '<br>Нажмите Enter для рестарта';
                    message.classList.add('messageStyle');
                    img.style.display = 'none';
                    sound_die.play();
                    updateHighscore();
                    return;
                } else {
                    if (pipe_sprite_props.right < bird_props.left && pipe_sprite_props.right + move_speed >= bird_props.left && element.increase_score == '1') {
                        // При прохождении через трубу увеличиваем счет
                        score_val.innerHTML =+ score_val.innerHTML + 1;
                        sound_point.play();
                        updateHighscore();
                    }
                    element.style.left = pipe_sprite_props.left - move_speed + 'px';
                }
            }
        });
        requestAnimationFrame(move);
    }
    requestAnimationFrame(move);

    // Функция для применения гравитации к птице
    let bird_dy = 0;
    function apply_gravity() {
        if (game_state != 'Play') return;
        bird_dy = bird_dy + gravity;

        document.addEventListener('keydown', (e) => {
            if (e.key == 'ArrowUp' || e.key == ' ') {
                // При нажатии клавиши вверх изменяем изображение птицы и применяем силу, чтобы подпрыгнуть
                img.src = 'images/Bird-2.png';
                bird_dy = -7.6;
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.key == 'ArrowUp' || e.key == ' ') {
                // При отпускании клавиши вверх возвращаем изображение птицы
                img.src = 'images/Bird.png';
            }
        });

        if (bird_props.top <= 0 || bird_props.bottom >= background.bottom) {
            // При выходе за границы экрана игра завершается
            game_state = 'End';
            message.style.left = '28vw';
            window.location.reload();
            message.classList.remove('messageStyle');
            return;
        }
        bird.style.top = bird_props.top + bird_dy + 'px';
        bird_props = bird.getBoundingClientRect();
        requestAnimationFrame(apply_gravity);
    }
    requestAnimationFrame(apply_gravity);

    // Функция для создания труб
    let pipe_separation = 0;
    let pipe_gap = 35;

    function create_pipe() {
        if (game_state != 'Play') return;

        if (pipe_separation > 115) {
            pipe_separation = 0;

            let pipe_posi = Math.floor(Math.random() * 43) + 8;
            let pipe_sprite_inv = document.createElement('div');
            pipe_sprite_inv.className = 'pipe_sprite';
            pipe_sprite_inv.style.top = pipe_posi - 70 + 'vh';
            pipe_sprite_inv.style.left = '100vw';

            document.body.appendChild(pipe_sprite_inv);
            let pipe_sprite = document.createElement('div');
            pipe_sprite.className = 'pipe_sprite';
            pipe_sprite.style.top = pipe_posi + pipe_gap + 'vh';
            pipe_sprite.style.left = '100vw';
            pipe_sprite.increase_score = '1';

            document.body.appendChild(pipe_sprite);
        }
        pipe_separation++;
        requestAnimationFrame(create_pipe);
    }
    requestAnimationFrame(create_pipe);
}
