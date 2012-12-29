
// Define the different types of objects


// Define the sprite objects
var sprites = {
    ship: {sx:0, sy:0, w:38, h:42, frames:2},
    missile: {sx:0, sy:30, w:2, h:10, frames: 1},
    enemy_purple: {sx:37, sy:0, w:42, h:43, frames:1},
    enemy_bee: {sx:79, sy:0, w:37, h:43, frames:1},
    enemy_ship: {sx:116, sy:0, w:42, h:43, frames:1},
    ememy_circle: {sx:158, sy:0, w:32, h:33, frames:1}
}

var enemies = {
    basic: {x:100, y:-50, sprite:'enemy_purple', B:100, C:2, E:100}
}

var startGame = function(){

    // Add the starfield boards to the game
    Game.setBoard(0, new Starfield(20, 0.4, 100, true));
    Game.setBoard(1, new Starfield(50, 0.6, 100));
    Game.setBoard(2, new Starfield(100, 1.0, 50));
    
    // Add the title board to the game 
    Game.setBoard(3, new TitleScreen('Gareth Rocks!', 'press space to begin', playGame));
}

// play game function (when fire pressed, callback)
var playGame = function(){
    var board = new GameBoard();
    board.add(new Enemy(enemies.basic));
    board.add(new Enemy(enemies.basic, {x:150}));
    board.add(new PlayerShip());
    Game.setBoard(3, board);
}

window.addEventListener('load', function(){
    // start the game pass the sprites and the callback arround
    Game.initialize('canvasElement', sprites, startGame);
})

