document.addEventListener('DOMContentLoaded', () => {

    const canvas = document.getElementById('gameCanvas');

    const context = canvas.getContext('2d');

    context.scale(30, 30); // Scale up for better visibility


    const nextCanvas = document.getElementById('nextCanvas');

    const nextContext = nextCanvas.getContext('2d');

    nextContext.scale(30, 30);


    const arena = createEmptyMatrix(10, 20);

    const player = {

        pos: { x: 0, y: 0 },

        matrix: null,

        score: 0,

        nextPieces: []

    };


    const colors = [

        null,

        'cyan',

        'yellow',

        'purple',

        'green',

        'red',

        'blue',

        'orange'

    ];


    let paused = false;


    function createEmptyMatrix(width, height) {

        const matrix = [];

        while (height--) {

            matrix.push(new Array(width).fill(0));

        }

        return matrix;

    }


    function generatePiece(type) {

        switch (type) {

            case 'I':

                return [

                    [0, 1, 0, 0],

                    [0, 1, 0, 0],

                    [0, 1, 0, 0],

                    [0, 1, 0, 0],

                ];

            case 'L':

                return [

                    [0, 2, 0],

                    [0, 2, 0],

                    [0, 2, 2],

                ];

            case 'J':

                return [

                    [0, 3, 0],

                    [0, 3, 0],

                    [3, 3, 0],

                ];

            case 'O':

                return [

                    [4, 4],

                    [4, 4],

                ];

            case 'Z':

                return [

                    [5, 5, 0],

                    [0, 5, 5],

                    [0, 0, 0],

                ];

            case 'S':

                return [

                    [0, 6, 6],

                    [6, 6, 0],

                    [0, 0, 0],

                ];

            case 'T':

                return [

                    [0, 7, 0],

                    [7, 7, 7],

                    [0, 0, 0],

                ];

            default:

                throw new Error(`Unknown piece type: ${type}`);

        }

    }


    function renderMatrix(matrix, offset, ctx) {

        matrix.forEach((row, y) => {

            row.forEach((value, x) => {

                if (value !== 0) {

                    ctx.fillStyle = colors[value];

                    ctx.fillRect(x + offset.x, y + offset.y, 1, 1);

                }

            });

        });

    }


    function renderGame() {

        context.fillStyle = '#F8F8FF';

        context.fillRect(0, 0, canvas.width, canvas.height);

        renderMatrix(arena, { x: 0, y: 0 }, context);

        renderMatrix(player.matrix, player.pos, context);

        renderNextPieces();

    }


    function integratePlayerWithArena() {

        player.matrix.forEach((row, y) => {

            row.forEach((value, x) => {

                if (value !== 0) {

                    arena[y + player.pos.y][x + player.pos.x] = value;

                }

            });

        });

    }


    function initializePlayer() {

        if (player.nextPieces.length === 0) {

            player.nextPieces = generatePieceQueue();

        }

        player.matrix = player.nextPieces.shift();

        player.nextPieces.push(generatePiece(randomPieceType()));

        player.pos.y = 0;

        player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);


        if (isCollision(arena, player)) {

            arena.forEach(row => row.fill(0));

            player.score = 0;

            updateScoreDisplay();

        }

    }


    function generatePieceQueue() {

        const pieces = 'TJLOSZI'.split('');

        return pieces.sort(() => Math.random() - 0.5).map(piece => generatePiece(piece));

    }


    function randomPieceType() {

        const pieces = 'TJLOSZI';

        return pieces[pieces.length * Math.random() | 0];

    }


    function renderNextPieces() {

        nextContext.fillStyle = '#F8F8FF';

        nextContext.fillRect(0, 0, nextCanvas.width, nextCanvas.height);

        player.nextPieces.forEach((piece, index) => {

            renderMatrix(piece, { x: 0, y: index * 4 }, nextContext);

        });

    }


    function isCollision(arena, player) {

        const [m, o] = [player.matrix, player.pos];

        for (let y = 0; y < m.length; ++y) {

            for (let x = 0; x < m[y].length; ++x) {

                if (m[y][x] !== 0 &&

                    (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {

                    return true;

                }

            }

        }

        return false;

    }


    function dropPlayer() {

        player.pos.y++;

        if (isCollision(arena, player)) {

            player.pos.y--;

            integratePlayerWithArena();

            initializePlayer();

            clearFullRows();

            updateScoreDisplay();

        }

        dropCounter = 0;

    }


    function movePlayer(direction) {

        player.pos.x += direction;

        if (isCollision(arena, player)) {

            player.pos.x -= direction;

        }

    }


    function rotatePlayer(direction) {

        const pos = player.pos.x;

        let offset = 1;

        rotateMatrix(player.matrix, direction);

        while (isCollision(arena, player)) {

            player.pos.x += offset;

            offset = -(offset + (offset > 0 ? 1 : -1));

            if (offset > player.matrix[0].length) {

                rotateMatrix(player.matrix, -direction);

                player.pos.x = pos;

                return;

            }

        }

    }


    function rotateMatrix(matrix, direction) {

        for (let y = 0; y < matrix.length; ++y) {

            for (let x = 0; x < y; ++x) {

                [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];

            }

        }

        if (direction > 0) {

            matrix.forEach(row => row.reverse());

        } else {

            matrix.reverse();

        }

    }


    function clearFullRows() {

        outer: for (let y = arena.length - 1; y > 0; --y) {

            for (let x = 0; x < arena[y].length; ++x) {

                if (arena[y][x] === 0) {

                    continue outer;

                }

            }


            const row = arena.splice(y, 1)[0].fill(0);

            arena.unshift(row);

            ++y;


            player.score += 10;

        }

    }


    function updateScoreDisplay() {

        document.getElementById('score').innerText = player.score;

    }


    let dropCounter = 0;

    let dropInterval = 1000;


    let lastUpdateTime = 0;


    function updateGame(time = 0) {

        if (paused) {

            return;

        }


        const deltaTime = time - lastUpdateTime;

        lastUpdateTime = time;


        dropCounter += deltaTime;

        if (dropCounter > dropInterval) {

            dropPlayer();

        }


        renderGame();

        requestAnimationFrame(updateGame);

    }


    function togglePause() {

        paused = !paused;

        if (!paused) {

            lastUpdateTime = performance.now(); // Reset last update time to avoid jump in deltaTime

            updateGame();

        }

    }


    // controller.js

    document.addEventListener('keydown', event => {

        handleKeyPress(event);

    });


    function handleKeyPress(event) {

        switch (event.key) {

            case 'ArrowLeft':

                movePlayer(-1);

                break;

            case 'ArrowRight':

                movePlayer(1);

                break;

            case 'ArrowDown':

                dropPlayer();

                break;

            case 'ArrowUp':

            case 'x':

                rotatePlayer(1);

                break;

            case 'z':

            case 'Control':

                rotatePlayer(-1);

                break;

            case 'Shift':

            case 'c':

                holdPiece();

                break;

            case 'Space':

                hardDrop();

                break;

            case 'Escape':

            case 'F1':

                togglePause();

                break;

            default:

                break;

        }

    }


    initializePlayer();

    updateScoreDisplay();

    updateGame();

});