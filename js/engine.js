/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine makes the canvas' context (ctx) object globally available to make
 * writing app.js a little simpler to work with.
 */

 var Engine = (function(global) {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */
     var doc = global.document,
     win = global.window,
     canvas = doc.createElement('canvas'),
     ctx = canvas.getContext('2d'),
     requestID,
     lastTime,
     victory = false,
     lose = false,
     score = 0,
     lives = 3;

     canvas.width = 505;
     canvas.height = 606;
     doc.body.appendChild(canvas);

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
     function main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
         var now = Date.now(),
         dt = (now - lastTime) / 1000.0;

        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
         update(dt);
         render();

        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
         lastTime = now;

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */

         if(!(victory || lose))
            requestID = win.requestAnimationFrame(main);
        else {
            win.cancelAnimationFrame(requestID);
            reset()
        }
    }

   /* This function shows the start screen which provides instructions for
      the game.
      */
      function startScreen() {
        const startScreen = doc.getElementById('start-screen');
        startScreen.classList.remove('hide');

        const nextButton = doc.getElementById('next-button');
        nextButton.focus();
        nextButton.addEventListener('click', function() {
            startScreen.classList.add('hide');
            selectScreen();
        }, {once: true});
    }

    /* This function shows the character and difficulty selection screen */
    function selectScreen() {

        /* Show the new game modal */
        const selectGame = doc.getElementById('select-screen');
        selectGame.classList.remove('hide');

        /* Make each character selectable */
        const characterList = Array.from(doc.getElementsByClassName('character'));

        for(character of characterList) {
            let sprite = character.classList.item(1);

            character.addEventListener('click', function() {
                const selectedList = Array.from(doc.querySelectorAll('.character-list > .selected'));
                for(let item of selectedList) {
                    item.classList.remove('selected');
                }
                this.classList.add('green-background', 'selected');
                chosenSprite = sprite;
            })
        }

        /* Make the difficulty selectable */
        const difficultyList = Array.from(doc.getElementsByClassName('difficulty'));

        for(difficulty of difficultyList) {
            let difficult = difficulty.classList.item(1);

            difficulty.addEventListener('click', function() {
                const selectedList = Array.from(doc.querySelectorAll('.difficulty-list > .selected'));
                for(let item of selectedList) {
                    item.classList.remove('selected');
                }
                this.classList.add('green-background', 'selected');
                chosenDifficulty = difficult;
            })
        }

        /* When a character and a difficulty have been selected, show the
        'Start Game' button allowing the game to start */
        waitForSelection();
    }

    /* This function waits for the character and difficulty to be selected before
    allowing the user to start the game */
    function waitForSelection() {
        const selectGame = doc.getElementById('select-screen');

        if(!(chosenSprite != undefined && chosenDifficulty != undefined))
            win.setTimeout(waitForSelection, 500)
        else {
            const startButton = doc.getElementById('start-button');

            startButton.classList.remove('blank');
            startButton.focus();

            /* Pressing the 'Start Game' button will start the game */
            startButton.addEventListener('click', function() {
                selectGame.classList.add('hide');
                createPlayer();

            /* Remove the selected formatting from the chosen sprite and
               difficulty
               */
               const selectedList = Array.from(doc.querySelectorAll('.selected'));
               for(let item of selectedList) {
                item.classList.remove('selected');
            }
        }, {once: true});
        }
    }


   /* This function instantiates the player, depending on
      the user's selection
      */
      function createPlayer() {

        /* Instantiate the player sprite */
        player.sprite = `images/${chosenSprite}.png`;

        /* Place player in bottom center of screen */
        player.x = 200;
        player.y = 380;

        /* Undefine the chosen sprite so that it can be chosen
           again when a new game is started
           */
           chosenSprite = undefined;

           createEnemies();
       }

    /* This function instantiates the bugs, depending on
       the user's selection
       */
       function createEnemies() {

    /* The difficulty level chooses the number of bugs that the
    player has to avoid */
    let numBugs;

    switch(chosenDifficulty) {
        case 'easy': numBugs = 3;
        break;

        case 'medium': numBugs = 5;
        break;

        case 'hard': numBugs = 7;
        break;
    }

    for(let i = 0; i < numBugs; i++) {
        allEnemies[i] = new Enemy();
    }

    /* Randomise the position of each enemy and its speed */
    for(enemy of allEnemies) {
        enemy.x = Math.floor(Math.random()*600);

        const yPositions = [60, 145, 230];
        enemy.y = yPositions[Math.floor(Math.random()*3)];

        enemy.speed = Math.floor(50 + Math.random()*(250 - 50 + 1));
    }

    /* Undefine the chosen difficulty so that it can be chosen
       again when a new game is started
       */
       chosenDifficulty = undefined;

       /* Hide the start button */
       const startButton = doc.getElementById('start-button');
       startButton.classList.add('blank');

       createItems();
   }

   /* This function places items on the game screen which the player can collect
      for points. The player should aim to get as high a score as possible.
         */
     function createItems() {
        /* Randomly choose how many items to place */
        let numItems = Math.floor(Math.random()*(5 - 3) + 3);

        /* Items can have the following images */
        let itemImages = ['Gem Blue', 'Gem Green', 'Gem Orange', 'Heart', 'Key', 'Star'];

        /* Items can only be placed at set positions */
        let itemPositions = [[12, 83], [113, 83], [214, 83], [315, 83], [416, 83],
        [12, 166], [113, 166], [214, 166], [315, 166], [416, 166],
        [12, 249], [113, 249], [214, 249], [315, 249], [416, 249]];


        /* Instantiate the items and give them their position */
        for(let i = 0; i < numItems; i++) {
            let item = new Item();

            /* Choose a position from the itemImages array. Give the item this image.
            */
            let imageIndex = Math.floor(Math.random()*itemImages.length); //Choose index randomly
            item.image = `images/${itemImages[imageIndex]}.png`;

            /* Choose a position from the itemPositions array. Place the item at this
               position. Make each position unique.
               */
            let positionIndex = Math.floor(Math.random()*itemPositions.length); //Choose index randomly
            item.x = itemPositions[positionIndex][0]; // Choose position from. Take x position...
            item.y = itemPositions[positionIndex][1]; // ...Take y position.
            itemPositions.splice(positionIndex, 1); //Remove chosen position from array so it cannot be chosen again

            allItems.push(item);
        }


        init();
    }

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
     function init() {
        /* Reset lives and score */
        reset();

        /* Place score in the score section */
        let scoreIcon = doc.querySelector('.score-icon');
        scoreIcon.innerText = score;

        /* Places 3 heart icons in the lives section*/
        let livesIcon = doc.querySelector('.lives-icon');
        for (let i = 0; i < lives; i++) {
            let heart = doc.createElement('i');
            heart.classList.add('fas', 'fa-heart');
            livesIcon.append(heart);
        }

        lastTime = Date.now();

        /* Start game loop */
        main();
    }

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data. Based on how
     * you implement your collision detection (when two entities occupy the
     * same space, for instance when your character should die), you may find
     * the need to add an additional function call here. For now, we've left
     * it commented out - you may or may not want to implement this
     * functionality this way (you could just implement collision detection
     * on the entities themselves within your app.js file).
     */
     function update(dt) {
        updateEntities(dt);
        checkCollisions();
        checkWin();
    }

    /* This is called by the update function and loops through all of the
     * objects within your allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for your
     * player object. These update methods should focus purely on updating
     * the data/properties related to the object. Do your drawing in your
     * render methods.
     */
     function updateEntities(dt) {
        /* Update enemies */
        allEnemies.forEach(function(enemy) {
            enemy.update(dt);  //This is the objects update() function, not that above.
        });

        /* Update items */
        allItems.forEach(function(item) {
            item.update(); //This is the items update() function, not that above.
        })

    }

    /* This function checks for collisions between the player and an enemy.
     * If a player and an enemy occupy the same space, a collision is detected
     * and the game is lost.
     */
     function checkCollisions() {

        /* Check each enemy */
        for(enemy of allEnemies) {

            /* Check that there is a horizontal collision. That a bug and the
            * player are occupying the same horizontal space */
            const horizontalCollision = Math.abs(player.x - enemy.x) < 80;

            /* Check that there is a vertical collision. That a bug and the
            * player are occupying the same vertical space */
            const verticalCollision = Math.abs(player.y - enemy.y) < 30;

            if(horizontalCollision && verticalCollision) {
                /* Reduce number of lives by 1 */
                lives--;

                /* Remove the last heart icon so there are as many hearts as
                the player has lives */
                let heartIcons = doc.querySelectorAll('.lives-icon > .fa-heart');
                let lastHeart = heartIcons.item(lives);
                lastHeart.classList.remove('fas');
                lastHeart.classList.add('far');

                /* Send the player back to starting position when hit by a bug*/
                player.x = 200;
                player.y = 380;

                /* When the player runs out of lives, you lose the game */
                if(lives == 0) {
                    lost = true;

                    /* Show the losing modal */
                    const loseModal = doc.getElementById('lose');
                    loseModal.classList.remove('hide');

                    /* Clicking the button will start the game again */
                    const loseButton = doc.getElementById('lose-button');
                    loseButton.focus();

                    loseButton.addEventListener('click', function() {
                        loseModal.classList.add('hide');
                        startScreen();
                    }, {once: true})
                }
            }
        }

        /* Check each item */
        for(let i=0; i<allItems.length; i++) {
            /* Check that there is a horizontal collision. That an item and the
            * player are occupying the same horizontal space */
            const horizontalCollision = Math.abs(player.x - allItems[i].x) < 15;

            /* Check that there is a vertical collision. That an item and the
            * player are occupying the same vertical space */
            const verticalCollision = Math.abs(player.y - allItems[i].y) < 40;


            if(horizontalCollision && verticalCollision) {
                /* Remove item */
                allItems.splice(i, 1);

                /* Increase score */
                score += 10;

                /* Place score in the score section */
                let scoreIcon = doc.querySelector('.score-icon');
                scoreIcon.innerText = score;
            }
        }
    }

    /* This function checks whether the player has reached the water, thus
     * winning the game
     */
     function checkWin() {
        if(player.y < 0) {
            victory = true;

            /* Show the winning modal */
            const winModal = doc.getElementById('win');
            winModal.classList.remove('hide');

            /* Add score and lives to screen */
            const info = doc.createElement('p');
            const infoText = doc.createTextNode(`You won the game with a score of ${score} and with ${lives} lives left!`);
            const winButton = doc.getElementById('win-button');

            info.appendChild(infoText);
            winModal.insertBefore(info, winButton);

            /* Clicking the button will start the game again */

            winButton.focus();

            winButton.addEventListener('click', function() {
                winModal.classList.add('hide');
                startScreen();
            }, {once: true})
        }
    }


    /* This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
     function render() {
        /* This array holds the relative URL to the image used
         * for that particular row of the game level.
         */
         var rowImages = [
                'images/water-block.png',   // Top row is water
                'images/stone-block.png',   // Row 1 of 3 of stone
                'images/stone-block.png',   // Row 2 of 3 of stone
                'images/stone-block.png',   // Row 3 of 3 of stone
                'images/grass-block.png',   // Row 1 of 2 of grass
                'images/grass-block.png'    // Row 2 of 2 of grass
                ],
                numRows = 6,
                numCols = 5,
                row, col;

        // Before drawing, clear existing canvas
        ctx.clearRect(0,0,canvas.width,canvas.height)

        /* Loop through the number of rows and columns we've defined above
         * and, using the rowImages array, draw the correct image for that
         * portion of the "grid"
         */
         for (row = 0; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                /* The drawImage function of the canvas' context element
                 * requires 3 parameters: the image to draw, the x coordinate
                 * to start drawing and the y coordinate to start drawing.
                 * We're using our Resources helpers to refer to our images
                 * so that we get the benefits of caching these images, since
                 * we're using them over and over.
                 */
                 ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
             }
         }

         renderEntities();
     }

    /* This function is called by the render function and is called on each game
     * tick. Its purpose is to then call the render functions you have defined
     * on your enemy and player entities within app.js
     */
     function renderEntities() {
        /* Loop through all of the objects within the allEnemies array and call
         * the render function you have defined.
         */
         allEnemies.forEach(function(enemy) {
            enemy.render();
        });

         allItems.forEach(function(item) {
            item.render();
        });

         player.render();
     }

    /* This function does nothing but it could have been a good place to
     * handle game reset states - maybe a new game menu or a game over screen
     * those sorts of things. It's only called once by the init() method.
     */
     function reset() {
        /* Reset victory and lose conditions */
        victory = false;
        lose = false;

        /* Reset number of lives */
        lives = 3;

        /* Remove the hearts */
        let heartIcons = doc.querySelectorAll('.lives-icon > .fa-heart');
        heartIcons.forEach(function(item){
            item.remove()
        });

    }

    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
     Resources.load([
        'images/stone-block.png',
        'images/water-block.png',
        'images/grass-block.png',
        'images/enemy-bug.png',
        'images/char-boy.png',
        'images/char-cat-girl.png',
        'images/char-horn-girl.png',
        'images/char-pink-girl.png',
        'images/char-princess-girl.png',
        'images/Gem Blue.png',
        'images/Gem Green.png',
        'images/Gem Orange.png',
        'images/Heart.png',
        'images/Key.png',
        'images/Star.png'
        ]);
     Resources.onReady(startScreen);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developers can use it more easily
     * from within their app.js files.
     */
     global.ctx = ctx;
 })(this);
