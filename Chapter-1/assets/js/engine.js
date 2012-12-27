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

//function to create the star field (scrolling background)
var Starfield = function(speed, opacity, numStars, clear){
    //create a new canvas dom element
    var stars = document.createElement('canvas');
    stars.width = Game.width;
    stars.height = Game.height;
    
    /// get context
    var starsCtx = stars.getContext('2d');
    var offset = 0;
    
    if(clear){
        starsCtx.fillStyle = '#000';
        starsCtx.fillRect(0, 0, stars.width, stars.height);
    }
    
    // draw random 2 px rectangles onto the offscreen canvas
    starsCtx.fillStyle = '#fff';
    starsCtx.globalAlpha = opacity;
    
    // Create all the stars in the for loop
    for(var i=0; i<numStars; i++){
        starsCtx.fillRect(  Math.floor(Math.random() * stars.width), 
                            Math.floor(Math.random() * stars.height), 
                            2, 2);
    }
    
    this.draw = function(ctx){
        var intOffset = Math.floor(offset);
        var remaining = stars.height - intOffset;
        
        if(intOffset > 0){
            ctx.drawImage(stars, 0, remaining, stars.width, intOffset, 0, 0, stars.width, intOffset);
        }
        if (remaining > 0){
            ctx.drawImage(stars, 0, 0, stars.width, remaining, 0, intOffset, stars.width, remaining);
        }
    }
    
    this.step = function(dt){
        offset += dt * speed; 
        offset = offset % stars.height;
    }
}


// function for the title sreen
var TitleScreen = function(title, subtitle, callback){
    this.step = function(dt){
        if(Game.keys['fire'] && callback){
            callback();
        }
    }
    
    this.draw = function(ctx){
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        // draw the title
        ctx.font = 'bold, 40px bangers';
        ctx.fillText(title, Game.width/2, Game.height/2);
        // draw the subtitle
        ctx.font = 'bold 20px bangers';
        ctx.fillText(subtitle, Game.width/2, Game.height/2 + 40);
        
    }
}

