
    
// Define the sprite objects
var sprites = {
    ship: {sx:0, sy:0, w:38, h:42, frames:2},
    missile: {sx:0, sy:30, w:2, h:10, frames: 1},
    enemy_purple: {sx:37, sy:0, w:42, h:43, frames:1},
    enemy_bee: {sx:79, sy:0, w:37, h:43, frames:1},
    enemy_ship: {sx:116, sy:0, w:42, h:43, frames:1},
    ememy_circle: {sx:158, sy:0, w:32, h:33, frames:1},
    explosion: {sx:0, sy:64, w:64, h:64, frames:12}
}

// Define all the enemies, what sprite they use and how they move
var enemies = {
    straight: {x:0, y:-50, sprite:'enemy_ship', health:10, E:100},
    ltr: {x:0, y:-100, sprite:'enemy_purple', health:10, B:200, C:1, E:200},
    circle: {x:400, y:-50, sprite:'ememy_circle', health:10, A:0, B:-200, c:1, E:20, F:200, G:1, H:Math.PI/2},
    wiggle: {x:100, y:-50, sprite:'enemy_bee', health:20, B:100, C:4, E:100},
    step: {x:0, y:-50, sprite:'ememy_circle', health:10, B:300, C:1.5, E:60}
}

// Definition mapping for enimies for level one
var level1 = [
  //start,  End,   Gap, Type,   Override 
  [0,       4000,  500, 'step' ],
  [6000,    13000, 800, 'ltr' ],
  [12000,   16000, 400, 'circle' ],
  [18200,   20000, 500, 'straight', {x:150}],
  [18200,   20000, 500, 'straight', {x:100}],
  [18400,   20000, 500, 'straight', {x:200}],
  [22000,   25000, 400, 'wiggle', {x:300}],
  [22000,   25000, 400, 'wiggle', {x:200}]
];

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
    // add new level to the board with the callback
    board.add(new Level(level1, winGame));
    board.add(new PlayerShip());
    Game.setBoard(3, board);
}

var winGame = function(){
    Game.setBoard(3, new TitleScreen('YOU ROCK', 'press space to play again', playGame));
}

var loseGame = function(){
    Game.setBoard(3, new TitleScreen('You Lose', 'press space to try again', playGame));
}

window.addEventListener('load', function(){
    // start the game pass the sprites and the callback arround
    Game.initialize('canvasElement', sprites, startGame);
})

