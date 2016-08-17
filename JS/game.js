/**
 * Connect 4 Game.
 * Frameworks Used: 
 *       JQuery  (Feature Rich Javascript Library)
 *       Pixi.JS (2DWebGL renderer with Canvas Fallback)
 *       Tween.JS (Tween Engine plugin for PIXI.js)
 *       
 * This is solution to the Test by Gluck Game Studios.
 *  
 * Author: Ashutosh Rautela
 * Email: arautela2772@gmail.com    
 * Contact: 8080981324
 * Website: www.visionashutosh.com
 */

/*
    All the Global Variables are Defined Here
    */
//Create a container object called the `stage`
var stage = new PIXI.Container();       // Creating the main Stage
var myBoard = new PIXI.Container();     // Creating an empty container, just to group all the other objects inside the container
var CANVAS_WIDTH = 800;
var CANVAS_HEIGHT = 600;
var bgSprite;                                   // PixiJS BGSprite
var whitePawns = [];                            // Array to store all the White Pawns/Tiles
var blackPawns = [];    
var pawns = [[9,9,9,9,9,9,9],                // A 2D Board Array used to record the current status of the Game Board 
             [9,9,9,9,9,9,9],                // 9 Indicates an Empty Space
             [9,9,9,9,9,9,9],                // 1 Indicates space occupied by White Tile/ Player 1
             [9,9,9,9,9,9,9],                // 0 Indicates space occupied by Black Tile/ Player 2
             [9,9,9,9,9,9,9],
             [9,9,9,9,9,9,9]
            ];                        // Array to store all the Black Pawns/Tiles
var downArrow;                                  // Arrow PIXI Sprite indicating the current column where the player is referring to
var triggers = [];                              // Invisible/Transparent PIXI Graphics Shapes used as Triggers for Columns
var playerTurn = "p1";
var board = [   [9,9,9,9,9,9,9],                // A 2D Board Array used to record the current status of the Game Board 
                [9,9,9,9,9,9,9],                // 9 Indicates an Empty Space
                [9,9,9,9,9,9,9],                // 1 Indicates space occupied by White Tile/ Player 1
                [9,9,9,9,9,9,9],                // 0 Indicates space occupied by Black Tile/ Player 2
                [9,9,9,9,9,9,9],
                [9,9,9,9,9,9,9]
            ];
var columnInfo = [5,5,5,5,5,5,5];               // Array to record the Column Info
var columnHeight = [40,120,200,280,360,440];
var columnPos = [46,137.5,229,320.5,412,503,592];
var gameOverScreen;
var gameFeedbackText;
var playerGameInformation;
var gameOverDisplay
//Create the renderer
var renderer = PIXI.autoDetectRenderer(CANVAS_WIDTH, CANVAS_HEIGHT,{backgroundColor:0xffd87f}); /* Detecting a PIXI Auto renderer 
                                                                                It will return WebGL for Supported Browsers 
                                                                                and canvas for non-Supported Browsers.
                                                                                WebGL is fast and has less-CPU Overhead */

//Add the canvas to the HTML document
document.body.appendChild(renderer.view);             /* Appending the Canvas Element to the Body 


/*
  JQuery Document Ready Function. Just made sure the DOM is ready for my Javascript to execute.
  Loaded all the Sprites in Pixi.JS 
 */
$('document').ready(function(){    
    PIXI.loader                                    //As recommeded by PIXI, 
    .add("Sprites/connect4_bg.png")
    .add("Sprites/white_circle.png")
    .add("Sprites/black_circle.png")  
    .add("Sprites/downArrow.png")  
    .load(setup);
});

function setup() {  
    bgSprite = new PIXI.Sprite(PIXI.loader.resources["Sprites/connect4_bg.png"].texture);   //Intiailizing the Main BG Sprite
    myBoard.addChild(bgSprite);                  // Adding the BG as a child of the main Board                                       

    for (var i = 0; i < 3; i ++){
        for (var j = 0; j < 7;j++){  
            var whitePawn = new whiteDotObj();   //Creating a Pool for While Tiles. Instead of Creating and Destroying the object,
            whitePawn.UpdateScale(0.25,0.25);    // I prefer creating an Object Pool. Instantiate Once and reuse them in the whole                 
            whitePawn.SetGridPos(i,j);           // game.
            whitePawn.SetActive(false);         
            whitePawns.push(whitePawn);              //Pushing the tile to the array for later reference.
            pawns[i][j] = whitePawn;

            var blackPawn = new blackDotObj();   // Again Creating a pool for Black Tiles.
            blackPawn.UpdateScale(0.25,0.25);         //Updating the Tile Scale 
            blackPawn.SetGridPos(i,j); 
            blackPawn.SetActive(false);             //Pushing the tile to the array for late reference.
            blackPawns.push(blackPawn);
            pawns[i][j] = blackPawn;               
        }
    }
    
    downArrow = new downArrowObj();              //Creating a Down Arrow
    downArrow.UpdatePosition(10,-100);
    downArrow.UpdateScale(0.2,0.2);

/*   
    Creating 7 Triggers Here. To detect the trigger according the Column Clicked.  The Triggers are invisible and
    are used to detect the mouse click.
    The Triggers are created using the PIXI Graphics. They are directly drawn to the canvas as Pixels.
*/

    for (var i = 0; i < 7 ; i ++ ){
            triggers[i] = new PIXI.Graphics();
            triggers[i].beginFill(0xdddddd);
            triggers[i].lineStyle(1, 0xa0a0a0, 1);
            triggers[i].drawRect(0,0,92,480);
            triggers[i].endFill();
            triggers[i].interactive = true;      
            triggers[i].alpha = 0;
            triggers[i].position.set(i * 92, 0);
            triggers[i].id = i;       
            myBoard.addChild(triggers[i]); 
    }

    /*
        Registering the Events to the Triggers created in the previous Loop
     */

    for(var m = 0; m < 7 ; m ++){     
        triggers[m].mouseover = function(mouseData)
        {            
                downArrow.UpdatePosition(columnPos[this.id],0);    // Updating the arrow indicating the current column focused on
        };            
        triggers[m].click = function(mouseData)           // Using the mouse click event and Inserting a New Tile.
        {                                                // Updated the Board Information and Tiles Information in their respective 
                                                          //2D Arrays
            var index = this.id;    
            var heightValue = columnHeight[columnInfo[index]];   
            var tileName;
            var boardValue = 0;
            if(playerTurn == 'p1'){
                tileName = "WhiteTile";
                boardValue = 1;
            }
            else if(playerTurn == 'p2'){
               tileName = "BlackTile";
               boardValue = 0;
            }  
            var spawnedTile = SpawnTile(tileName,columnPos[index],-50,0.25);   //Setting Up the Spawned Tile
            spawnedTile.TweenPosition(columnPos[index],heightValue,25 );        // Positioning the Tile
            spawnedTile.gridRow = columnInfo[index];                           //Assigning properties for later reference
            spawnedTile.gridColumn = index;                          
            board[columnInfo[index]][index] = boardValue;                      //Updating the Board
            pawns[columnInfo[index]][index] = spawnedTile;                      //Updating the Pawn Referencees
            CheckWinCondition(tileName,columnInfo[index],index);                //Check Winning Condition
            columnInfo[index] = columnInfo[index] - 1;                        //Recoring the row as per the column
            UpdateDOM();                                   // Calling DOM updation
            }
        }
    }

function UpdateDOM(){       // Just additionally updated the Player information on the DOM as well.
    if(playerTurn == 'p1'){ 
        playerTurn = "p2";
        $("#currentPlayer").html("Player 2 Turn");
    }else if(playerTurn == 'p2'){        
        playerTurn = "p1";
        $("#currentPlayer").html("Player 1 Turn");
    }
}

/*
    Function Determining the wining condition.
 */
function CheckWinCondition(playerType, playerRow, playerColumn){
    var valueTocheck = 9;
    if(playerType == "WhiteTile")
    {
        $("#winLooseInfo").html("White Player Wins");
        valueTocheck = 1;
        playerGameInformation = "Player 1 Wins";
    }
    else if(playerType == 'BlackTile'){
        $("#winLooseInfo").html("Black Player Wins");
        valueTocheck = 0;
        playerGameInformation = "Player 2 Wins";
    }
    var elementsOnLeft = Elements_OnLeft(valueTocheck, playerRow, playerColumn);    // No of paws which are left to current pawn 
    var elementsOnRight = Elements_OnRight(valueTocheck, playerRow, playerColumn);  // No of paws which are right to current pawn
    var elementsOnBottom = Elements_OnBottom(valueTocheck, playerRow, playerColumn); // No of paws which are bottom to current pawn
    // var elementsOnTop = Elements_OnUp(valueTocheck, playerRow, playerColumn);
    var elementsOnDiagonalRightUp = Elements_OnDiagonally_RightUp(valueTocheck, playerRow, playerColumn); // No of paws which are On Upper Right Diagonal to current pawn
    var elementsOnDiagonalLeftUp = Elements_OnDiagonally_LeftUp(valueTocheck, playerRow, playerColumn);  // No of paws which are On Upper Left Diagonal to current pawn
    var elementsOnDiagonalRightBottom = Elements_OnDiagonally_RightBottom(valueTocheck, playerRow, playerColumn); // No of paws which are On Bottom Right Diagonal to current pawn
    var elementsOnDiagonalLeftBottom = Elements_OnDiagonally_LeftBottom(valueTocheck, playerRow, playerColumn);    // No of paws which are On Bottom Left Diagonal to current pawn
   
    if((elementsOnLeft + elementsOnRight + 1) >= 4){             // HORIZONTAL - scaling the elements matched     
        pawns[playerRow][playerColumn].TweenScale(0.15,50);      
        var k = 0;
        while(k < elementsOnLeft){
            pawns[playerRow][playerColumn - (k + 1)].TweenScale(0.15,50);
            k ++;
        }
        k = 0;
        while(k < elementsOnRight){
            pawns[playerRow][playerColumn + (k + 1)].TweenScale(0.15,50);
            k++;
        }
        window.setTimeout(GameOver_DisplayInfo,250);
    }
    if((elementsOnBottom + 1) >= 4){                  // VERTICAL -  scaling the elements matched
        pawns[playerRow][playerColumn].TweenScale(0.15,50);      
        var k = 0;      
        while(k < elementsOnBottom){
            pawns[playerRow + (k + 1)][playerColumn].TweenScale(0.15,50);
            k++;
        }
        window.setTimeout(GameOver_DisplayInfo,250);
    }
    if((elementsOnDiagonalLeftUp + elementsOnDiagonalRightBottom + 1) >= 4){        //LEFT DIAGONAL -  Scaling the elements matches
        pawns[playerRow][playerColumn].TweenScale(0.15,50);
        var k = 0;
        while(k < elementsOnDiagonalLeftUp){
            pawns[playerRow - (k + 1)][playerColumn - (k + 1)].TweenScale(0.15,50);
            k++;
        }
        k = 0;
        while(k < elementsOnDiagonalRightBottom){
            pawns[playerRow + (k + 1)][playerColumn + (k + 1)].TweenScale(0.15,50);
            k++;
        }
        window.setTimeout(GameOver_DisplayInfo,250);
    }
    if((elementsOnDiagonalLeftBottom + elementsOnDiagonalRightUp + 1) >= 4){      //RIGHT DIAGONAL - Scaling the elements matched
        pawns[playerRow][playerColumn].TweenScale(0.15,50); 
        var k = 0;
        while(k < elementsOnDiagonalLeftBottom){
            pawns[playerRow + (k + 1)][playerColumn - (k + 1)].TweenScale(0.15,50);
            k++;
        }
        k = 0;
        while(k < elementsOnDiagonalRightUp){
            pawns[playerRow - (k + 1)][playerColumn + (k + 1)].TweenScale(0.15,50);
            k++;
        }
        window.setTimeout(GameOver_DisplayInfo,250);
    }
}

function GameOver_DisplayInfo(){                  // Displaying the Game Over Screen
    gameOverDisplay = new gameOverHUD();
    gameOverDisplay.UpdatePlayerInfo(playerGameInformation);
}

function Game_Replay(){                          // Function Restarts the Games.     
    for (var i = 0 ; i < 6 ; i ++){               // Resets the Pool, board record, pawns record.
        for (var j = 0 ; j < 7 ; j ++){           // Hides the Game Over Screen
            pawns[i][j] = 9;
            board[i][j] = 9;            
        }
    }
    for(var i = 0 ; i < columnInfo.length ; i ++){
        columnInfo[i] = 5;
    }
    for (var  i = 0 ; i < whitePawns.length ; i++){
        whitePawns[i].SetActive(false);
        blackPawns[i].SetActive(false);
    }
    gameOverDisplay.SetActive(false);
}

function Elements_OnDiagonally_LeftUp(valueTocheck, playerRow, playerColumn){    // Calculating Matched elements on Left Up Diagonal
    var number = 0;
    while(playerColumn >= 1 && playerRow >= 1)
    {
        if(board[playerRow - 1][playerColumn - 1] == valueTocheck){
            number += 1;
            playerRow = playerRow - 1;
            playerColumn = playerColumn - 1;
        }
        else{
            break;
        }
    }
    return number;
}

function Elements_OnDiagonally_RightUp(valueTocheck, playerRow, playerColumn){  // Calculating Matched elements on Right Up Diagonal
    var number = 0;
    while(playerColumn <= 5 && playerRow >= 1)
    {
        if(board[playerRow - 1][playerColumn + 1] == valueTocheck){
            number += 1;
            playerRow = playerRow - 1;
            playerColumn = playerColumn + 1;
        }
        else{
            break;
        }
    }
    return number;
}

function Elements_OnDiagonally_LeftBottom(valueTocheck, playerRow, playerColumn){  // Calculating Matched elements on Left Bottom Diagonal
    var number = 0;
    while(playerColumn >= 1 && playerRow <= 4)
    {
        if(board[playerRow + 1][playerColumn - 1] == valueTocheck){
            number += 1;
            playerRow = playerRow + 1;
            playerColumn = playerColumn - 1;
        }
        else{
            break;
        }
    }
    return number;
}

function Elements_OnDiagonally_RightBottom(valueTocheck, playerRow, playerColumn){  // Calculating Matched elements on Right Up Diagonal
    var number = 0;
    while(playerColumn <= 5 && playerRow <= 4)
    {
        if(board[playerRow + 1][playerColumn + 1] == valueTocheck){
            number += 1;
            playerRow = playerRow + 1;
            playerColumn = playerColumn + 1;
        }
        else{
            break;
        }
    }
    return number;
}

function Elements_OnLeft(valueTocheck, playerRow, playerColumn){  // Calculating Matched elements on Left
    var number = 0;      
    while (playerColumn >= 1) {
        if(board[playerRow][playerColumn - 1] == valueTocheck){
            number = number + 1;
            playerColumn = playerColumn - 1;
        }            
        else{
            break;
        }
    }
    return number;
}

function Elements_OnRight(valueTocheck, playerRow, playerColumn){ // Calculating Matched elements on Right
    var number = 0;
    while (playerColumn <= 5) {
        if(board[playerRow][playerColumn + 1] == valueTocheck){
            number = number + 1;   
            playerColumn += 1;
        }            
        else{
            break;
        }
    }    
    return number;
}

function Elements_OnBottom(valueTocheck, playerRow, playerColumn){  // Calculating Matched elements on Bottom
    var number = 0;
    while (playerRow <= 4) {
        if(board[playerRow + 1][playerColumn] == valueTocheck){
            number = number + 1;   
            playerRow = playerRow + 1;             
        }  
        else{
            break;
        }      
    }
    return number;
}


myBoard.pivot.x = 310;                                 //Position, Scaling the board as per comfort.
myBoard.pivot.y = 240;
myBoard.scale.x = 0.9;
myBoard.scale.y = 0.9;

stage.addChild(myBoard);                   // adding Board to the Stage

myBoard.x = 400;
myBoard.y = 350;

gameLoop();
function gameLoop(){                               // The Main Game Loop
    requestAnimationFrame(gameLoop);            // Default function of the browser. Updated every frame.
    
    Tween.runTweens();                             // Update Tween as per the framerate
    renderer.render(stage);              // Updated the canvas. Clears previous elements and updates every frame.
}

function SpawnTile(objectType, objectPosX, objectPosY, objectScaleFactor){      //Function to Spawn Tiles
    var objectName = objectType;                                                 
    var spawnedObject;
    if(objectName == "WhiteTile"){       
        spawnedObject = GetAWhiteTile();                // Get a Free WhiteTile from the Object Pool
    }
    else if(objectName == "BlackTile"){        
        spawnedObject = GetABlackTile();         // Get a Free WhiteTile from the Object Pool
    }
    spawnedObject.UpdatePosition(objectPosX, objectPosY);            // Update the Tile's Position
    spawnedObject.UpdateScale(objectScaleFactor,objectScaleFactor);  // Update the Tile's Scale
    return spawnedObject;    
}


function GetAWhiteTile(){
    for(var  i = 0 ; i < whitePawns.length; i++){              // Search a free White Tile from the Pool and return it
        if(!whitePawns[i].active){          
            whitePawns[i].SetActive(true);
            return whitePawns[i];            
        }
    }
}

function GetABlackTile(){                                     // Search a free Black Tile from the Pool and return it
    for(var  i = 0 ; i < blackPawns.length; i++){
        if(!blackPawns[i].active){           
            blackPawns[i].SetActive(true);
            return blackPawns[i];            
        }
    }
}

var gameOverHUD = function GameOverHUD(){                     // Creating a Game Over Class and defining all the properties and functionalities
    this.gameOverContainer = new PIXI.Container();          // Creating an Empty Container
    this.go_hud = new PIXI.Graphics();                      // Creating the BG 
    this.go_hud.beginFill(0x0052b7);
    this.go_hud.lineStyle(1, 0xa0a0a0, 1);
    this.go_hud.drawRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
    this.go_hud.endFill();    
    // this.go_hud.interactive = true;      
    this.go_hud.visible = true;   
    this.go_hud.alpha = 0;
    this.go_hud.position.set(0, 0);    
    this.gameOverText = new PIXI.Text('Game Over',{font : '72px Arial', fill : 0x04ff00});   //Creating the Game Over Text
    this.gameOverText.x = CANVAS_WIDTH/2-200;
    this.gameOverText.y = -50;
    this.gameOverText.text = "Game Over";

    this.playerInfo = new PIXI.Text('Who Wins?',{font : '24px Arial', fill : 0x61ff5e});    // Winner Info Declare Text
    this.playerInfo.scale.x = 0;
    this.playerInfo.scale.y = 0;
    this.playerInfo.anchor.x = 0.5;
    this.playerInfo.anchor.y = 0.5;
    this.playerInfo.x = CANVAS_WIDTH/2 - 20;
    this.playerInfo.y = CANVAS_HEIGHT/2 - 50;

    this.playerInfo.text = "Who Wins?";

    this.restartButton = new PIXI.Graphics();      // Creating the Restart Button Here. Ideally it should be a sprite.
    this.restartButton.beginFill(0x00ff2e);
    this.restartButton.lineStyle(1, 0xa0a0a0, 1);
    this.restartButton.drawRect(0,0,180,65);
    this.restartButton.endFill();   
    this.restartButton.x = CANVAS_WIDTH/2 - 100;
    this.restartButton.y = CANVAS_HEIGHT/2 + 60;

    this.restartButtonInfo = new PIXI.Text('REPLAY',{font : '24px Arial', fill : 0x000000});
    this.restartButton.addChild(this.restartButtonInfo);
    this.restartButtonInfo.x = 45;
    this.restartButtonInfo.y = 20;

    this.restartButton.interactive = true;
    this.restartButton.click = function(){
        // console.log("Mouse Over on the Restart Button");
        Game_Replay();
    };

    this.gameOverContainer.addChild(this.go_hud);
    this.gameOverContainer.addChild(this.playerInfo);
    this.gameOverContainer.addChild(this.gameOverText);
    this.gameOverContainer.addChild(this.restartButton);  
    this.TweenEntry();
    stage.addChild(this.gameOverContainer);    
}

gameOverHUD.prototype.TweenEntry = function(){   // Game Over Entry Animations.

     new Tween(this.go_hud,"alpha",0.95,30,true);    
     new Tween(this.gameOverText,"x",CANVAS_WIDTH/2 -200,30,true).outElastic;
     new Tween(this.gameOverText,"y",CANVAS_HEIGHT/2 - 200,30,true).outElastic    

     new Tween(this.playerInfo, 'scale.x', 1, 30,true).outElastic;
     new Tween(this.playerInfo, 'scale.y', 1, 30,true).outElastic;     
}

gameOverHUD.prototype.UpdatePlayerInfo = function(playerWinInfo){    // Updating Winner Information
    this.playerInfo.text = playerWinInfo;
}

gameOverHUD.prototype.SetActive = function(activate){
    if(activate){
        this.gameOverContainer.visible = true;
    }
    else{
        this.gameOverContainer.visible = false;
    }
}

var downArrowObj = function(){             //Creating the Arrow Indicator Class
    this.downArrowSprite = new PIXI.Sprite(PIXI.loader.resources["Sprites/downArrow.png"].texture); 
    this.downArrowSprite.anchor.x = 0.5;
    this.downArrowSprite.anchor.y = 1;
    this.active = true;

    myBoard.addChild(this.downArrowSprite);    
}

downArrowObj.prototype.UpdatePosition = function(x , y){
    this.downArrowSprite.x = x;
    this.downArrowSprite.y = y;
}

downArrowObj.prototype.UpdateScale = function(x, y){
    this.downArrowSprite.scale.x = x;
    this.downArrowSprite.scale.y = y;
}

downArrowObj.prototype.SetActive = function(activate){
    this.active = activate;
}

var blackDotObj = function(){            // Black Tile Class
    this.blackDotSprite = new PIXI.Sprite(PIXI.loader.resources["Sprites/black_circle.png"].texture);
    this.gridRow = 0;
    this.gridColumn = 0;
    this.active = true;
    this.blackDotSprite.anchor.x = 0.5;
    this.blackDotSprite.anchor.y = 0.5;
    this.tween;
    this.color = "black";
    myBoard.addChild(this.blackDotSprite);   
}

blackDotObj.prototype.SetGridPos = function(row , column){
    this.gridRow = row;
    this.gridColumn = column;
}

blackDotObj.prototype.UpdatePosition = function(x , y){
    this.blackDotSprite.x = x;
    this.blackDotSprite.y = y;
}

blackDotObj.prototype.UpdateScale = function(x, y){
    this.blackDotSprite.scale.x = x;
    this.blackDotSprite.scale.y = y;
}

blackDotObj.prototype.SetActive = function(activate){
    this.active = activate;
    if(this.active){
        this.blackDotSprite.visible = true;
    }
    else{
        this.blackDotSprite.visible = false;
    }
}

blackDotObj.prototype.TweenPosition = function(xPos, yPos, tweenTime){
    this.tween1 = new Tween(this.blackDotSprite, "x", xPos, tweenTime, true );
    this.tween2 = new Tween(this.blackDotSprite, "y", yPos, tweenTime, true );
}

blackDotObj.prototype.TweenScale = function(scaleFactor, tweenTime){
    this.tweenScaleX = new Tween(this.blackDotSprite,"scale.x",scaleFactor,tweenTime, true);
    this.tweenScaleY = new Tween(this.blackDotSprite,"scale.y",scaleFactor,tweenTime, true);
}

//White Dot Object
var whiteDotObj = function(){         // White Tile Class
    this.whiteDotSprite = new PIXI.Sprite(PIXI.loader.resources["Sprites/white_circle.png"].texture);
    this.gridRow = 0;
    this.gridColumn = 0;
    this.active = true;
    this.whiteDotSprite.anchor.x = 0.5;
    this.whiteDotSprite.anchor.y = 0.5;
    myBoard.addChild(this.whiteDotSprite);   
    this.color = "white";
}

whiteDotObj.prototype.SetGridPos = function(row , column){
    this.gridRow = row;
    this.gridColumn = column;
}

whiteDotObj.prototype.UpdatePosition = function(x , y){
    this.whiteDotSprite.x = x;
    this.whiteDotSprite.y = y;
}

whiteDotObj.prototype.UpdateScale = function(x, y){
    this.whiteDotSprite.scale.x = x;
    this.whiteDotSprite.scale.y = y;
}

whiteDotObj.prototype.SetActive = function(activate){
    this.active = activate;
    if(this.active){
        this.whiteDotSprite.visible = true;
    }
    else{
        this.whiteDotSprite.visible = false;
    }
}

whiteDotObj.prototype.TweenPosition = function(xPos, yPos, tweenTime){
    this.tween1 = new Tween(this.whiteDotSprite, "x", xPos, tweenTime, true );
    this.tween2 = new Tween(this.whiteDotSprite, "y", yPos, tweenTime, true );
}


whiteDotObj.prototype.TweenScale = function(scaleFactor, tweenTime){
    this.tweenScaleX = new Tween(this.whiteDotSprite,"scale.x",scaleFactor,tweenTime, true);
    this.tweenScaleY = new Tween(this.whiteDotSprite,"scale.y",scaleFactor,tweenTime, true);
}