// Define the different types of objects (these are to the power of 2 for efficiency
// to allow us to use bitwise operations)
var OBJECT_PLAYER = 1,
    OBJECT_PLAYER_MISSILE = 2,
    OBJECT_ENEMY = 3,
    OBJECT_ENEMY_MISSILE = 4,
    OBJECT_POWERUP = 5;

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
        
        // Add the touch controls
        this.setBoard(4, new TouchControls());
        
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
            if(!e){
                e = window.event;
            }
            var key = e.keyCode || e.charCode;
            if(KEY_CODES[key]){
                Game.keys[KEY_CODES[key]] = true;
                e.preventDefault();
            }
        }, false);
        window.addEventListener('keyup', function(e){
            if(!e){
                e = window.event;
            }
            var key = e.keyCode || e.charCode;
            if(KEY_CODES[key]){
                Game.keys[KEY_CODES[key]] = false;
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
                boards[i].draw(Game.ctx);
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

// Hit function for the sprites
Sprite.prototype.hit = function(damage){
    this.health -= damage;
    if(this.health <= 0){
        if(!this.board.remove(this)){
            // add an explosion to the board centered at the point we removed the item
            this.board.add(new Explosion(this.x + this.w/2, this.y + this.h/2));
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
    this.setup('ship', {vx:0, vy:0, reloadTime: 0.25, maxVel: 100});
    
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
PlayerShip.prototype.type = OBJECT_PLAYER;

//extend the existing hit function from sprite
PlayerShip.prototype.hit = function(damage){
    // if removed
    if(!this.board.remove(this)){
        loseGame();
    }
}


// Game board, responsible for keeping track of objects on the board and collisions
var GameBoard = function(){
    
    var board = this;
    
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
        if (!wasStillAlive){
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
        // for all the objects in the object list (on the board)
        for (var i=0,val=null,len=this.objects.length;i<len;i++){
            // run call (in built to JS) to call the function passed
            // by using call we change the ref to this to be what we pass in as the arg
            // if result of that call was true return the item that made it true
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
    this.collide = function(obj, typeToColideWith){
        // detect will run the following function for each element on the board
        // and return true for the the first one it finds to be true
        return this.detect(function(){
            // if the object we are looking at is not the one that called detect colision
            if(obj != this){
                // col = if(typePassed not set OR the type of obj currently being looked at is the 
                // same as the one we want to check for collisions against  AND there is an overlap
                // between the object that called collsion check and the current obj we are looking at then col is true
                // in which case we return the obj that collided with our object (more than likely so we can remove it)
                var col = (!typeToColideWith || this.type == typeToColideWith) && board.overlap(obj, this);
                //if col true return this else return false
                return col ? this : false;
            }
        })
    }
};

// Player missile class
var PlayerMissile = function(x,y){
    this.setup('missile', {vy:-700, damage:10});
    // Center the missile on x (middle)
    this.x = x - this.w/2;
    // y is passed in y - the height of the missle so, bottom of the missle
    this.y = y - this.h;
};

PlayerMissile.prototype = new Sprite();
PlayerMissile.prototype.type = OBJECT_PLAYER_MISSILE;

// Step and draw done with prototype because this is faster
PlayerMissile.prototype.step = function(dt){
    this.y += this.vy * dt;
    // collision is true if this object overlaps with objects of type ENEMY
    var collision = this.board.collide(this, OBJECT_ENEMY);
    if (collision){
        // run the hit method that the object will have via Sprite extension
        collision.hit(this.damage);
        //remove the missile
        this.board.remove(this);
    }
    else if(this.y < -this.h){
        this.board.remove(this);
    }
}



// Enemy class, this again will use prototype for step and draw as it is faster
var Enemy = function(blueprint, override){
    
    this.merge(this.baseParams);
    this.setup(blueprint.sprite, blueprint);
    this.merge(override);
}

// extend sprite
Enemy.prototype = new Sprite();
Enemy.prototype.type = OBJECT_ENEMY;

// set a property baseParams with some base params for the enemy class
// used in sprite merge in the constructor for this class creating here prevents
// the need to create the object for each enemy obj
Enemy.prototype.baseParams = {A:0, B:0, C:0, D:0,E:0, F:0, G:0, H:0, t:0, damage:10};

// Step method for enemy
Enemy.prototype.step = function(dt){
    this.t = dt;
    
    // detect if collision with player ship
    var collision = this.board.collide(this, OBJECT_PLAYER);
    if (collision){
        // run the hit method that the object will have via Sprite extension
        collision.hit(this.damage);
        //remove the missile
        this.board.remove(this);
    }
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

//The explosion class
var Explosion = function(x, y){
    this.setup('explosion', {frame:0});
    // move position to top left corner
    this.x = x -this.w/2;
    this.y = y - this.h/2;
    this.subFrame = 0;
}
// Extend the sprite class
Explosion.prototype = new Sprite();

Explosion.prototype.step = function(dt){
    this.frame = Math.floor(this.subFrame++);
    if(this.subFrame > 36){
        this.board.remove(this);
    }
}


// Level class
var Level = function(levelData, callback){
    this.levelData = [];
    for(var i=0; i<levelData.length; i++){
        this.levelData.push(Object.create(levelData[i]));
    }
    this.t = 0;
    this.callback = callback;
}

// Step method for the level, this is going to keep track of time and drop 
// enemies onto that page when required
Level.prototype.step = function(dt){
    var idx = 0, remove = [], curShip = null;
    
    //update the current time offset
    this.t += dt * 1000;
    
    // SAMPLE DATA
    /*
     start,  End,   Gap, Type,   Override
    [18200,   20000, 500, 'straight', {x:150}],
    [22000,   25000, 400, 'wiggle', {x:300}], 
     */
    
    // curShip = next index in lvl data, && curship[start] < time + 2000
    while( (curShip = this.levelData[idx]) && (curShip[0] < this.t + 2000) ){
        // check if past the end time
        if(this.t > curShip[1]){
            remove.push(curShip);
        //else if curShip[start] less than time
        }else if(curShip[0] < this.t){
            // Get enemy definition blueprint
            var enemy = enemies[curShip[3]];
            var override = curShip[4];
            // Add enemy with blueprint and override
            this.board.add(new Enemy(enemy, override));
            //Increment the start time by the gap
            curShip[0] += curShip[2];
        }
        idx ++;
    }
    
    // Remove any objects from the level data that have passed
    for(var i = 0, len=remove.length;i<len;i++){
        var idx = this.levelData.indexOf(remove[i]);
        if(idx != -1){
            this.levelData.splice(idx, 1);
        }
    }
    
    // If there are no more enemies on the board the level is done
    if(this.levelData.length == 0 && this.board.cnt[OBJECT_ENEMY] == 0){
        if(this.callback){
            this.callback();
        }
    }
}

Level.prototype.draw = function(ctx){
    // do nothing
}

// Touch screen controls class
var TouchControls = function(){
    var gutterWidth = 10;
    var unitWidth = Game.width / 5;
    var blockWidth = unitWidth - gutterWidth;
    
    this.drawSquare = function(ctx, x, y, txt, on){
        // if on is true the button has less opacity (being pressed)
        ctx.globalAlpha = on ? 0.9 : 0.6;
        ctx.fillStyle = '#CCC';
        // draw the rectagle for the button
        ctx.fillRect(x, y, blockWidth, blockWidth);
        
        // draw the text on the button (arrows)
        ctx.fillStyle = '#FFF';
        ctx.textAlign = 'center';
        ctx.globalAlpha = 1.0;
        ctx.font = 'bold '+ (3*unitWidth/4) + 'px arial';

        ctx.fillText(txt, x+blockWidth/2, y + blockWidth - 12);

    }
    
    this.draw = function(ctx){
        // save the context (prevent the opacity changes effecting the context elsewhere)
        ctx.save();
        
        // Y location to start buttons is unitwidth from the bottom
        var yLoc = Game.height - unitWidth;
        
        // Draw the left arrow for touch screen
        this.drawSquare(ctx, gutterWidth, yLoc, '\u25C0', Game.keys['left']);
        
        // Draw the right button
        this.drawSquare(ctx, unitWidth + gutterWidth, yLoc, '\u25B6', Game.keys['right']);
        
        // Draw the fire button
        this.drawSquare(ctx, 4*unitWidth, yLoc, '\u25A9', Game.keys['fire']);
        
        // restore the context (prevent the opacity changes effecting the context elsewhere)
        ctx.restore();
    }
    
    this.step = function(dt){
        // do nothing
    }
    
    // Add the actual touch detection
    this.trackTouch = function(e){
        var touch, x;

        // get event and prevent default
        if(!e){e = window.event;}
        e.preventDefault();
        
        // set the left and right keys to false
        Game.keys['left'] = false;
        Game.keys['right'] = false;
        
        //for all the touches that are going on
        for(var i=0;i<e.targetTouches.length;i++){
            touch = e.targetTouches[i];
            x = touch.pageX / Game.canvasMultiplier - Game.canvas.offsetLeft;
            console.log(x);
            if(x < unitWidth){
                Game.keys['left'] = true;
            }
            if(x > unitWidth && x < 2*unitWidth){
                Game.keys['right'] = true;
            }   
        }
        
        // if it is a touch start or end only (enabling us to set fire to true constantly until the
        // finger is removed / started , only then do we action if it is on or off 
        if(e.type == 'touchstart' || e.type == 'touchend'){
            for(var i=0;i<e.changedTouches.length;i++){
                // get the touch event
                touch = e.changedTouches[i];
                x = touch.pageX / Game.canvasMultiplier - Game.canvas.offsetLeft;
                
                //if we are in the last col of the page
                if(x > 4*unitWidth){
                    // only set to fire if the event is start not end
                    Game.keys['fire'] = (e.type == 'touchstart');
                }   
            }
        }
    }
    
    Game.canvas.addEventListener('touchstart', this.trackTouch, true);
    Game.canvas.addEventListener('touchmove', this.trackTouch, true);
    Game.canvas.addEventListener('touchend', this.trackTouch, true);
    Game.playerOffset = unitWidth + 20;
}