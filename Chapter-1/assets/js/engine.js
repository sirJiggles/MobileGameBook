// function to load and draw the spritesheet
var spriteSheet = new function(){
    
    this.map = {};
    
    this.load = function(spriteData, callback){
        this.map = spriteData;
        this.image = new Image();
        this.image.onload = callback;
        this.image.src = 'assets/img/sprites.png';
    };
    
    this.draw = function(ctx, sprite, x, y, frame){
        var s = this.map[sprite];
        if(!frame){
            frame = 0;
        }
        ctx.drawImage(this.image, 
                        s.sx + frame * s.w, 
                        s.sy,
                        s.w, 
                        s.h,
                        x,
                        y,
                        s.w,
                        s.h);
    };
}

// function for the main game
var Game = new function(){
    
    // init the game 
    this.initialize = function(canvasId, spriteData, callback){
        
        this.canvas = document.getElementById(canvasId);
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // setup the context
        this.ctx = this.canvas.getContext && this.canvas.getContext('2d');
        
        if(!this.ctx){
            return alert('browser does not support canvas 2D');
        }
        // set up the input
        this.setupInput();
        
        // start the game loop
        this.loop();
        
        // load the sprite sheet and pass the callback
        spriteSheet.load(spriteData, callback);
    };
    
    // Setup the key inputs
    var KEY_CODES = { 37:'left', 39:'right', 32:'fire'};
    this.keys = {};
    
    this.setupInput = function(){
        window.addEventListener('keydown', function(e){
            if(KEY_CODES[event.keyCode]){
                Game.keys[KEY_CODES[event.keyCode]] = true;
                e.preventDefault();
            }
        }, false);
        window.addEventListener('keyup', function(e){
            if(KEY_CODES[event.keyCode]){
                Game.keys[KEY_CODES[event.keyCode]] = false;
                e.preventDefault();
            }
        }, false);
    }
    
    // Game loop
    var boards = [];
    this.loop = function(){
        var dt = 30 / 1000;
        for(var i = 0, len = boards.length; i < len; i++){
            if(boards[i]){
                boards[i].step(dt);
                boards[i] && boards[i].draw(Game.ctx);
            }
        }
        setTimeout(Game.loop, 30);
    };
    
    // change an active game board
    this.setBoard = function(num, board){
        boards[num] = board;
    };
    
}

