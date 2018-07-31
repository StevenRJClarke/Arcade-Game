// Enemies our player must avoid
var Enemy = function() {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // Horizontal position of bug
    this.x;

    // Vertical position of bug (in one of three lanes) chooses randomly
    const yPositions = [60, 145, 230];
    this.y;

    // Speed of bug chosen randomly
    this.speed;

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.

    // While the bug is on-screen, move the bug right. Bugs move
    // at different speeds.
    if(this.x < 606) {
        this.x = this.x + this.speed*dt;
    }

    // When the bug reaches the other side of the screen,
    // reset the bug's speed and position
    if(this.x > 606)
        this.reset();
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Reset the randomly chosen speed and position of the bugs
Enemy.prototype.reset = function() {
    // Move the bug back to the left of the screen
    this.x = -100;

    // Change the bug's position
    const yPositions = [60, 145, 230];
    this.y = yPositions[Math.floor(Math.random()*3)];

    // Change the bug's speed
    this.speed = Math.floor(5 + Math.random()*(250 - 50 + 1));
};

// Write a class for extra items, such as gems and hearts,
// which are used to increase the player's score and regain
// lives
var Item = function() {
    this.x;
    this.y;

    this.image = 'images/Gem Blue.png';
}

// Update the item, so that it disappears when the player collects it,
// required method for game
Item.prototype.update = function() {

}

// Draw the item on the screen, required method for game
Item.prototype.render = function() {
    ctx.drawImage(Resources.get(this.image), this.x, this.y, 75, 128);
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function() {
    this.x;
    this.y;

    this.sprite;
}

// Update the player's position, required method for game
Player.prototype.update = function(move) {
    switch(move) {
        // Move the player depending on the key press.
        // Make sure the player can't go off the screen.
        case 'left':
        if(this.x >= 0)
            this.x -= 101;
        break;
        case 'right':
        if(this.x <= 350)
            this.x += 101;
        break;
        case 'up':
        if(this.y >= 0)
            this.y -= 83;
        break;
        case 'down':
        if(this.y <= 350)
            this.y += 83;
        break;
    }
};

// Draw the player on the screen, required method for game
Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Handle the key presses, required method for game
Player.prototype.handleInput = function(keyCode) {
    // Pass the key code to the update function, as long
    // as the key code is defined
    if(keyCode != undefined)
        this.update(keyCode);
};

// Now instantiate your objects.
    // Place all enemy objects in an array called allEnemies
    // Place the player object in a variable called player
let player = new Player();


// The enemy objects and items will be instantiated in engine.js, but the array
// will be defined here. We will also define the variables which store
// the chose sprite for the player and the chose difficulty level

let allEnemies = [], allItems = [], chosenSprite, chosenDifficulty;


// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});