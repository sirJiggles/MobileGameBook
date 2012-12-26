
var canvas = document.getElementById('game');
var ctx = canvas.getContext && canvas.getContext('2d');

if (!ctx){
    alert ('unable to get context, update browser!');
}else{
    startGame();
}

function startGame(){
    
    spriteSheet.load({
        ship: {sx:0, sy:0, w:38, h:42, frames:2}
    }, function(){
       spriteSheet.draw(ctx, 'ship', 0, 0);
       spriteSheet.draw(ctx, 'ship', 100, 5); 
       spriteSheet.draw(ctx, 'ship', 150, 100); 
    });
}

