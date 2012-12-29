// function to load and draw the spritesheet
var SpriteSheet = new function(){
    
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
        SpriteSheet.load(spriteData, callback);
    };
    
    // Setup the key inputs
    var KEY_CODES = {37:'left', 39:'right', 32:'fire', 38:'up', 40:'down'};
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

//Sprite function (empty because each sprite has its own constructor function)
var Sprite = function(){}

Sprite.prototype.setup = function(sprite, props){
    this.sprite = sprite;
    this.merge(props);
    this.frame = this.frame || 0;
    this.w = SpriteSheet.map[this.sprite].w;
    this.h = SpriteSheet.map[this.sprite].h;
}

// merge method used in setup method on sprite function
Sprite.prototype.merge = function(props){
    if(props){
        for(var prop in props){
            this[prop] = props[prop];
        }
    }
}

// Draw meths for the sprite function
Sprite.prototype.draw = function(ctx){
    SpriteSheet.draw(ctx, this.sprite, this.x, this.y, this.frame);
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
    
    // if the bottom level then we add black background in with the stars, if
    // we did not do this we would still see the stars at thier previous position on draw
    // this makes it look like we are in hyperspace!
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
    
    // Scrolling background draws the top row first then moves it down then
    // then draws remaining this way when section of image is chopped of it knows 
    // where to start from at the top creating a never ending background
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
        ctx.font = 'bold 40px bangers';
        ctx.fillText(title, Game.width/2, Game.height/2);
        // draw the subtitle
        ctx.font = 'bold 20px bangers';
        ctx.fillText(subtitle, Game.width/2, Game.height/2 + 40);
        
    }
}

//function for the players ship
var PlayerShip = function(){
    
    // call the setup methods in the sprite class (extended)
    this.setup('ship', {vx:0, vy:0, frame:0, reloadTime: 0.25, maxVel: 100});
    
    this.x = Game.width / 2 - this.w / 2;
    this.y = Game.height - 10 - this.h;
    
    // time left before reload (set to 0.25 to prevent fire when the game starts)
    this.reload = this.reloadTime;
    
    this.step = function(dt){
        if(Game.keys['left']){
            this.vx = -this.maxVel;
        }else if(Game.keys['right']){
            this.vx = this.maxVel;
        }else if(Game.keys['up']){
            this.vy = -this.maxVel;
        }else if(Game.keys['down']){
            this.vy = this.maxVel;
        }else{
            this.vx = 0;
            this.vy = 0;
        }
        
        this.x += this.vx * dt;
        
        if (this.x < 0) {
            this.x =0;
        }else if (this.x > Game.width - this.w){
            this.x = Game.width - this.w;
        }
        
        this.y += this.vy * dt;
        
        if (this.y < 0) {
            this.y = 0;
        }else if (this.y > Game.height - this.h){
            this.y = Game.height - this.h;
        }
        
        
        //this.reload = this.reload - dt
        this.reload -= dt;
        // if user clicked fire and reload time passed
        if(Game.keys['fire'] && this.reload < 0){
            //reset fire to false
            Game.keys['fire'] = false;
            //reset reload time
            this.reload = this.reloadTime;
            // add a couple of missiles to the board 
            // this.board is the objctes ref to the board in this case it was given to the payer ship
            // when it itself was added to the board and in adding the missiles to the board they to 
            // will now have access to the board methods in this this.board property
            this.board.add(new PlayerMissile(this.x, this.y+this.h/2));
            this.board.add(new PlayerMissile(this.x+this.w, this.y+this.h/2));
        }
    }
}

// Extend the sprite class here
PlayerShip.prototype = new Sprite();


// Game board, responsible for keeping track of objects on the board and collisions
var GameBoard = function(){

    // current objects
    this.objects = [];
    this.cnt = [];
    
    // add objects to the list funtion
    this.add = function(obj){
        // add a ref to the board its on, this enables us to add aditional objects like 
        // missiles / explosions and remove itself when dead
        obj.board = this;
        this.objects.push(obj);
        // init count to 0 if required using or condition, then increment by 1
        // this is to keep track of number of objects by type on the board
        this.cnt[obj.type] = (this.cnt[obj.type] || 0 ) +1;
        return obj;
    }
    
    // mark objects for removal function (after all objects had thier turn so not to mess
    // up the loop)
    this.remove = function(obj){
        // check of the object to be removed is in the list if not add it
        var wasStillAlive = this.removed.indexOf(obj) != -1;
        if (wasStillAlive){
            this.removed.push(obj);
        }
        return wasStillAlive;
    }
    
    //Reset list of removed objects
    this.resetRemoved = function(){this.removed = [];}
    
    // Remove objects marked for removal from the list
    this.finalizeRemoved = function(){
        // loop through the list of objects to be removed, if found splice the ojects out of
        // the list and decrement the count of that type of object in the cnt array
        for (var i=0, len=this.removed.length;i<len;i++){
            var idx = this.objects.indexOf(this.removed[i]);
            if(idx != -1){
                this.cnt[this.removed[i].type] --;
                this.objects.splice(idx, 1);
            }
        }
    }
    
    // Irerate function, to run on all objects in the object list
    this.iterate = function(funcName){
        // get an array of rhe arguments passed to this function (value of funcName)
        // but we want it as an array so use the prototype call to convert and splice
        var args = Array.prototype.slice.call(arguments, 1);
        // loop through all the objects and call the inbuilt apply function in javascript
        for (var i=0,len=this.objects.length;i<len;i++){
            var obj = this.objects[i];
            // apply changes the reference to this in the function that we are calling,
            // it is the same as call but apply requires the second arg to be an array
            obj[funcName].apply(obj, args);
        }
    };
    
    // Detect function, find the first object for which func is returned as true
    this.detect = function(funcName){
        for (var i=0,val=null,len=this.objects.length;i<len;i++){
            if(funcName.call(this.objects[i])){
                return this.objects[i];
            }
        }
        return false;
    };
    
    // Step and draw functions
    this.step = function(dt){
        this.resetRemoved();
        this.iterate('step', dt);
        this.finalizeRemoved();
    }
    
    this.draw = function(ctx){
        this.iterate('draw', ctx);
    }
    
    /* condition is true of objects could not collide then negate to find out if they
     * overlap. To calculate this first check if the bottom right of 
     * 
     * !true if 
     *  (A bottom is to the right of B OR A bottom is to the left of B) 
     *      OR 
     *  (A top to the right of B top OR A top to the left of B top)
     */
    this.overlap = function(o1, o2){
        return !((o1.y+o1.h-1<o2.y) || (o1.y>o2.y+o2.h-1) || (o1.x+o1.w-1<o2.x) || (o1.x>o2.x+o2.w-1));
    }
    
    // Now the function to check for collision
    this.collide = function(obj, type){
        // return true if this instance collides with any other obj
        return this.detect(function(){
            if(obj != this){
                // collision = if (!type sent OR this.type == type (bitwise and) ) AND overlap call returns true for obj and this
                var col = (!type || this.type & type) && board.overlap(obj, this);
                //if colision true return this else false
                return col ? this : false;
            }
        })
    }
};

var PlayerMissile = function(x,y){
    this.setup('missile', {vy:-700});
    // Center the missile on x (middle)
    this.x = x - this.w/2;
    // y is passed in y - the height of the missle so, bottom of the missle
    this.y = y - this.h;
};

PlayerMissile.prototype = new Sprite();

// Step and draw done with prototype because this is faster
PlayerMissile.prototype.step = function(dt){
    this.y += this.vy * dt;
    if(this.y < -this.h){
        this.board.remove(this);
    }
}



// Enemy function, this again will use prototype for step and draw as it is faster
var Enemy = function(blueprint, override){
    
    this.merge(this.baseParams);
    this.setup(blueprint.sprite, blueprint);
    this.merge(override);
}

// extend sprite
Enemy.prototype = new Sprite();

// set a property baseParams with some base params for the enemy class
// used in sprite merge in the constructor for this class creating here prevents
// the need to create the object for each enemy obj
Enemy.prototype.baseParams = {A:0, B:0, C:0, D:0,E:0, F:0, G:0, H:0, t:0};

// Step method for enemy
Enemy.prototype.step = function(dt){
    this.t = dt;
    // calculation to move the enemy (use sin to create nice arc movements)
    this.vx = this.A + this.B * Math.sin(this.C * this.t + this.D);
    this.vy = this.E + this.F * Math.sin(this.G * this.t + this.H);
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    //if off the board, remove
    if(this.y > Game.height || this.x < -this.w || this.x > Game.width){
        this.board.remove(this);
    }
}