

var sprites = {
    ship: {sx:0, sy:0, w:38, h:42, frames:2}
};

var startGame = function(){
    spriteSheet.draw(Game.ctx, 'ship', 100, 100, 0);
}

window.addEventListener('load', function(){
    Game.initialize('canvasElement', sprites, startGame)   
})
