

var sprites = {
    ship: {sx:0, sy:0, w:38, h:42, frames:2}
};

var startGame = function(){
    spriteSheet.draw(Game.ctx, 'ship', 100, 100, 0);
    
    // Add the starfield boards to the game
    Game.setBoard(0, new Starfield(20, 0.4, 100, true));
    Game.setBoard(1, new Starfield(50, 0.6, 100));
    Game.setBoard(2, new Starfield(100, 1.0, 50));
    
    // Add the title board to the game 
    Game.setBoard(3, new TitleScreen('Gareth Rocks!', 'press fire to begin', playGame));
}

// play game function (when fire pressed, callback)
var playGame = function(){
    Game.setBoard(3, new TitleScreen('Gareth Rocks!', 'Game begun'));
}

window.addEventListener('load', function(){
    Game.initialize('canvasElement', sprites, startGame)   
});

