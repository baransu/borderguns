var CANVASW,
	CANVASH;
var canvas;
var ctx;
var lastTime;
var img;
var mouseToPlayerAngle = 0;
var mouse = {};
var player;
var speed = 320;
var bulletsSpeed = 1200;
var keyInterval;
var mouseLeftPressed = false;
var mouseRightPressed = false;
var bullets = [];

var bulletTimer = 0;
var bulletCooldown = 0.1;

var meleeAttackTimer = 0;
var meleeAttackCooldown = 0.5;

var collide = false;

var obstacles = [];

var floor, walls, door;

var tempAngle = 0;

var viewX = 0, viewY = 0;

var pathfindingNodes = [];
var pathfindingNodesScale = 20
var nSizeX = 1920/pathfindingNodesScale;
var nSizeY = 1080/pathfindingNodesScale;

var pathfindingGraph;

var AIWallOffsetL1 = 2;
var AIWallOffsetL2 = 1

var inputTimer = 0;
var inputCooldown = 0.3;

var bgGradient = 0;
var calcGradient = true;
var gradientColors = [];
var colors = [
	[62,35,255],
	[60,255,60],
	[255,35,98],
	[45,175,230],
	[255,0,255],
	[255,128,0]];

var step = 0;

var colorIndices = [0,1,2,3];

var gradientSpeed = 0.02;

var tempImg;

var enemies = [];

var playerStartPos = new SAT.Vector();

var enemiesData = [];
var doorsData = [];

var playerInput = true;

var toPointOffset = 2 * pathfindingNodesScale

var playerAlive = true;

var meleeRange = 75;

var playerHealthPercentage;

var playerLevelFrames = [
	0, 100, 200, 300, 400, 500,
]

var canLevel = true;

//only for development
var gizomos = false;
var postE = true;

var bloodEffect = false;
var bloodEffectTimer = 0;
var bloodEffectDuration = 0.5;

var win = false;

// function to initizalize whole game
function init(){
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");

	document.addEventListener('mousemove', function(e){
		mouse.x = e.clientX || e.pageX; 
		mouse.y = e.clientY || e.pageY;

	}, false);

	document.addEventListener('mousedown', function(e){
		switch (event.which) {
	        case 1:
	       		mouseLeftPressed = true;
	            break;
	        case 2:
	            //middle mouse button pressed
	            break;
	        case 3:
	            mouseRightPressed = true;
	            break;
	        default:
	            break;
    	}
	}, false);

	document.addEventListener('mouseup', function(e){
		mouseLeftPressed = false;
		mouseRightPressed = false;
	}, false);

	document.addEventListener('contextmenu', function(e){
		e.preventDefault();
	}, false);	

	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	CANVASW = canvas.width;
	CANVASH = canvas.height;

	img = new Image();
	bullet = new Image();
	floor = new Image();
	walls = new Image();
	floor.src = "img/level_floor.png";
	walls.src = "img/level_walls.png";
	bullet.src = "img/pobrane.jpg";
	//img.src = "http://www.html5canvastutorials.com/demos/assets/darth-vader.jpg";
	

	//fake collider to fix bug !!!
	obstacles[0] = new SAT.Box(new SAT.Vector( 0, 0), 1, 1);

	//walls
	obstacles[1] = new SAT.Box(new SAT.Vector( 0, 40), 40, 1000);
	obstacles[2] = new SAT.Box(new SAT.Vector( 40, 1040), 1820, 40);
	obstacles[3] = new SAT.Box(new SAT.Vector( 1860, 40), 60, 1000);
	obstacles[4] = new SAT.Box(new SAT.Vector( 40, 1), 1820, 40);

	/*
	//inner walls
	obstacles[5] = new SAT.Box(new SAT.Vector( 40, 270), 235, 50);
	obstacles[6] = new SAT.Box(new SAT.Vector( 285, 30), 30, 110);
	obstacles[7] = new SAT.Box(new SAT.Vector( 280, 270), 50, 280);
	obstacles[8] = new SAT.Box(new SAT.Vector( 1650, 590), 210, 50);

	obstacles[9] = new SAT.Box(new SAT.Vector( 1150, 50), 50, 580);
	obstacles[10] = new SAT.Box(new SAT.Vector( 1200, 590), 255, 50);
	obstacles[11] = new SAT.Box(new SAT.Vector( 950, 430), 50, 140);
	obstacles[12] = new SAT.Box(new SAT.Vector( 750, 560), 240, 50);

	obstacles[13] = new SAT.Box(new SAT.Vector( 40, 580), 630, 50);
	obstacles[14] = new SAT.Box(new SAT.Vector( 620, 650), 50, 200);
	obstacles[15] = new SAT.Box(new SAT.Vector( 620, 935), 50, 100);
	obstacles[16] = new SAT.Box(new SAT.Vector( 795, 935), 50, 100);

	obstacles[17] = new SAT.Box(new SAT.Vector( 795, 735), 50, 100);
	obstacles[18] = new SAT.Box(new SAT.Vector( 790, 700), 350, 50);
	obstacles[19] = new SAT.Box(new SAT.Vector( 1300, 935), 50, 100);
	obstacles[20] = new SAT.Box(new SAT.Vector( 1300, 745), 50, 110);

	obstacles[21] = new SAT.Box(new SAT.Vector( 950, 50), 50, 260);
	*/
		
	for(var a = 0; a < obstacles.length; a++){
		obstacles[a].isHeavy = true;		
	}

	for(var a = 0; a < nSizeX;a++){
		pathfindingNodes[a]=[];
		for(var b = 0; b < nSizeY; b++)
			pathfindingNodes[a][b] = 1
	}

	for(var z = 1; z < obstacles.length; z++){	
		for(var a = 0; a < nSizeX; a++){			
			for(var b = 0; b < nSizeY; b++){
				var boxX = a * pathfindingNodesScale;
				var boxY = b * pathfindingNodesScale;
				if (boxX < obstacles[z].pos.x + obstacles[z].w && boxX + pathfindingNodesScale > obstacles[z].pos.x &&
					boxY < obstacles[z].pos.y + obstacles[z].h && boxY + pathfindingNodesScale > obstacles[z].pos.y) {

					pathfindingNodes[a][b] = 0;
				}
			}
		}
	}

	//adding hight values to pathfinding near walls
	for(var a = 0; a < nSizeX; a++){
		for(var b = 0; b < nSizeY; b++){
			if(pathfindingNodes[a][b] == 0){
				for (var xx = -AIWallOffsetL1; xx <= AIWallOffsetL1; xx++) {
                    for (var yy = -AIWallOffsetL1; yy <= AIWallOffsetL1; yy++) {
                        var pom1 = xx + a;
                        var pom2 = yy + b;
                        
                        if ((pom1 >= 0) && (pom1 < nSizeX) && (pom2 >= 0) && (pom2 < nSizeY) && pathfindingNodes[pom1][pom2] != 0)
                            pathfindingNodes[pom1][pom2] = 2;

                    }
                }
			}
		}
	}

	//adding lesser (but higher than normal) values to pathfinding 
	for(var a = 0; a < nSizeX; a++){
		for(var b = 0; b < nSizeY; b++){
			if(pathfindingNodes[a][b] == 0){
				for (var xx = -AIWallOffsetL2; xx <= AIWallOffsetL2; xx++) {
                    for (var yy = -AIWallOffsetL2; yy <= AIWallOffsetL2; yy++) {
                        var pom1 = xx + a;
                        var pom2 = yy + b;
                        
                        if ((pom1 >= 0) && (pom1 < nSizeX) && (pom2 >= 0) && (pom2 < nSizeY) && pathfindingNodes[pom1][pom2] != 0)
                            pathfindingNodes[pom1][pom2] = 5;

                    }
                }
			}
		}
	}

	playerStartPos = new SAT.Vector(1800,100);

	player = new Player(playerStartPos.x, playerStartPos.y);
	
	pathfindingGraph = new Graph(pathfindingNodes)
	pathfindingGraph.diagonal = true;
	
	var standardExp = 1000;

	//ENEMIES DATA FOR LV1
	enemiesData[0] = {
		startPos: new SAT.Vector(500,300),
		radius: 30,
		waypoints: [
			new SAT.Vector(900,300),
			new SAT.Vector(900,500)
		],
		enemyType: "melee",
		exp: standardExp,
	}
	/*
	enemiesData[1] = {
		startPos: new SAT.Vector(500,300),
		radius: 30,
		waypoints: [
			new SAT.Vector(800,300),
			new SAT.Vector(1000,500)
		],
		enemyType: "melee",
		exp: standardExp,
	}
	enemiesData[2] = {
		startPos: new SAT.Vector(500,300),
		radius: 40,
		waypoints: [
			new SAT.Vector(700,300),
			new SAT.Vector(900,500)
		],
		enemyType: "melee",
		exp: standardExp,
	}
	enemiesData[3] = {
		startPos: new SAT.Vector(500,300),
		radius: 20,
		waypoints: [
			new SAT.Vector(800,1000),
			new SAT.Vector(1000,500)
		],
		enemyType: "melee",
		exp: standardExp,
	}
	*/
	for(var a = 0; a < enemiesData.length; a++){
		enemies.push(new Enemy(enemiesData[a].enemyType, enemiesData[a].startPos.x, enemiesData[a].startPos.y, enemiesData[a].radius, enemiesData[a].waypoints, enemiesData[a].exp))
	}

	//start game 
	gameLoop();
};
//game loop
function gameLoop() {
    var now = Date.now();
    var deltaTime = (now - lastTime) / 1000.0;

    update(deltaTime);
    render();

    lastTime = now;
    window.requestAnimationFrame(gameLoop);
};
// function to update everything
function update(deltaTime){

	handleInput(deltaTime);

	//enemies exist
	for(var a = 0; a < enemies.length; a++){
		enemies[a].exist(deltaTime, a);
	}
	
	//obstacles collisions
	for(var a = 1; a < obstacles.length; a++){

		var response = new SAT.Response();
		collide = SAT.testPolygonCircle(obstacles[a].toPolygon(), player.collider, response)

		if(collide){

			collisonResponse(response, player, obstacles[a]);
			player.pos.x = player.collider.pos.x;
			player.pos.y = player.collider.pos.y;

		}
		else {
			player.collider.pos.x = player.pos.x;
			player.collider.pos.y = player.pos.y;
			
		}			
	}

	//playerstuff
	playerHealthPercentage = player.health/player.maxHealth;

	//
	mouseToPlayerAngle = makeAngle(CANVASW/2, mouse.x, CANVASH/2, mouse.y);

	if(mouseLeftPressed && bulletTimer === 0 && playerInput){
		var temp = new SAT.Vector((mouse.x - CANVASW/2), (mouse.y - CANVASH/2));
		temp.normalize();
		
		//damage calculation
		var dmg = 0
		var critChance = 15;
		var crit = "no crit"
		dmg = 0 + rollDice(10, 10)
		dmg = Math.min(dmg, 0 + rollDice(10, 10))
		dmg = Math.max(dmg, 0 + rollDice(10, 10))
		if (random(100) < critChance){
		    dmg += 0 + rollDice(10, 10)
			crit = "crit"
		}

		//console.log(dmg , crit);

		//console.log(dmg)
		bullets.push(new Bullet(dmg, bullet, player.collider.pos.x, player.collider.pos.y, 5, bulletsSpeed, new SAT.Vector(temp.x, temp.y)));
		bulletTimer = bulletCooldown;
	}

	//exp
	if(player.level == playerLevelFrames.length - 1){
		player.exp = 0;
		canLevel = false;
		
	}

	if(player.exp > playerLevelFrames[player.level] && canLevel){
		var tempExp = player.exp - playerLevelFrames[player.level];	
		player.level++;
		player.exp = 0;
		player.exp += tempExp;
	}

	//hp
	if(player.health < 0) player.health = 0;
	if(player.health > player.maxHealth) player.health = player.maxHealth;
	if(player.health == 0) player.die();


	/*
	//game win
	if(enemies.length == 0){
		win = true;
		playerInput = false;
	}
	*/

	//calculating bullets
	if(bullets != null){
		for(var a = 0; a < bullets.length; a++){
			bullets[a].exist(deltaTime, a);
		}
	}

	//gradient stuff
	if(bgGradient == 0 && calcGradient == false){
		bgGradient = 1;
		calcGradient = true;
	}

	//timers
	if(bulletTimer > 0) bulletTimer -= deltaTime;
	if(bulletTimer < 0) bulletTimer = 0;
	
	if(bgGradient > 0) bgGradient -= deltaTime;
	if(bgGradient < 0) bgGradient = 0;

	if(inputTimer > 0) inputTimer -= deltaTime;
	if(inputTimer < 0) inputTimer = 0;

	if(bloodEffectTimer > 0){
		bloodEffect = true;
		bloodEffectTimer -= deltaTime;
	}
	if(bloodEffectTimer < 0){
		bloodEffect = false;
		bloodEffectTimer = 0;
	}

	if(bloodEffectTimer == 0) bloodEffect = false;
	
};
// function to render everything
function render(){

	viewX = player.pos.x - CANVASW/2;
	viewY = player.pos.y - CANVASH/2;
	//render x-xView(position in vieport)
	ctx.clearRect(0, 0, CANVASW, CANVASH);	

	//changing background gradient color
	if(calcGradient){

		var c0_0 = colors[colorIndices[0]];
		var c0_1 = colors[colorIndices[1]];
		var c1_0 = colors[colorIndices[2]];
		var c1_1 = colors[colorIndices[3]];

		var istep = 1 - step;
		var r1 = Math.round(istep * c0_0[0] + step * c0_1[0]);
		var g1 = Math.round(istep * c0_0[1] + step * c0_1[1]);
		var b1 = Math.round(istep * c0_0[2] + step * c0_1[2]);
		gradientColors[0] = "rgb(" + r1 + ", " + g1 + "," + b1 + ")";

		var r2 = Math.round(istep * c1_0[0] + step * c1_1[0]);
		var g2 = Math.round(istep * c1_0[1] + step * c1_1[1]);
		var b2 = Math.round(istep * c1_0[2] + step * c1_1[2]);
		gradientColors[1] = "rgb(" + r2 + ", " + g2 + ", " + b2 + ")";

		  
		step += gradientSpeed;
		if (step >= 1){
			step %= 1;
			colorIndices[0] = colorIndices[1];
			colorIndices[2] = colorIndices[3];

			colorIndices[1] = ( colorIndices[1] + Math.floor( 1 + Math.random() * (colors.length - 1))) % colors.length;
			colorIndices[3] = ( colorIndices[3] + Math.floor( 1 + Math.random() * (colors.length - 1))) % colors.length;

		}
	}
	var my_gradient = ctx.createLinearGradient(0, 0, CANVASW/2, CANVASH);
	my_gradient.addColorStop(0, gradientColors[0]);
	my_gradient.addColorStop(1, gradientColors[1]);

	ctx.fillStyle = my_gradient;
	ctx.fillRect(0,0,CANVASW,CANVASH);

	//floor
	ctx.fillStyle = "#2C322B"
	ctx.fillRect(0 - viewX, 0 - viewY, 1920, 1080);
	//ctx.drawImage(floor, viewX, viewY, CANVASW, CANVASH, 0, 0, CANVASW, CANVASH)

	if(gizomos){
		ctx.lineWidth = 1;
		for(var a = 0; a < nSizeX; a++)
			for(var b = 0; b < nSizeY; b++){
				if(pathfindingNodes[a][b] == 1)
					ctx.strokeStyle = "magenta"
				else if(pathfindingNodes[a][b] == 2)
					ctx.strokeStyle = "teal";
				else if(pathfindingNodes[a][b] == 5)
					ctx.strokeStyle = "maroon";
				else
					ctx.strokeStyle = "black";

				ctx.strokeRect(a * pathfindingNodesScale - viewX, b * pathfindingNodesScale - viewY, pathfindingNodesScale,pathfindingNodesScale)

				//ctx.font = "5px Georgia"
				//ctx.fillText( a + "|" + b, a * pathfindingNodesScale - viewX + 5, b * pathfindingNodesScale + 5 - viewY);
			}
	}
	

	//player
	//drawRotatedImg(img, 0, 0, 300, 250, CANVASW/2 - 25, CANVASH/2 - 25, 50, 50, mouseToPlayerAngle);
	
	//walls
	//ctx.drawImage(walls, player.pos.x - CANVASW/2, player.pos.y - CANVASH/2, CANVASW, CANVASH, 0, 0, CANVASW, CANVASH)

	//bullets
	for(var a = 0; a < bullets.length; a++){
		bullets[a].draw();
	}

	//COLLIDERS
	for(var a = 1; a < obstacles.length; a++)
		renderStrokeColliderBox(a, obstacles[a], "black", viewX, viewY);

	
	renderStrokeColliderCircle(player.collider, "green", viewX, viewY);


	for(var a = 0; a < enemies.length; a++){
		enemies[a].draw();
	}

	//ctx.fillStyle = "black";
	//ctx.fillRect(player.pos.x - viewX, player.pos.y - viewY, 5,5)  
	
	//HD EFFECTS xD
	if(postE)
		postEffects();
	
	if(!win && playerAlive){
		//hp bar
		ctx.strokeStyle = "white";
		ctx.strokeRect(CANVASW/2 - 250/2, CANVASH - 50, 250, 50)
		ctx.fillStyle = "red";
		ctx.fillRect(CANVASW/2 - 250/2, CANVASH - 50, 250 * playerHealthPercentage, 50)

		//hp bar text
		ctx.fillStyle = "white";
		ctx.font="20px Georgia";
		ctx.fillText("" + player.health + "/" + player.maxHealth + "", CANVASW/2 - 250/2.1 ,CANVASH - 50/2.5);
	}

	if(win || !playerAlive){

		//credits
		ctx.fillStyle = "white";
		ctx.font="10px Georgia";
		ctx.fillText("LA-Hotline/Borderguns project by Tomasz Cichocinski. Version: 0.1 (in development)", 0,CANVASH - 5);
	}

	//game over
	if(!playerAlive){
		ctx.fillStyle = "rgba(0,0,0,0.7)"
		ctx.fillRect(CANVASW/2 - 240, CANVASH/2 - 65, 500, 100)
		ctx.font = "50px Georgia"
		ctx.fillStyle = "white";
		ctx.fillText("Press R to try again", CANVASW/2 - 200, CANVASH/2)		
	}

	//win
	if(win){
		ctx.fillStyle = "rgba(0,0,0,0.7)";
		ctx.fillRect(CANVASW/2 - 330, CANVASH/2 - 65, 730, 100);
		ctx.font = "50px Georgia";
		ctx.fillStyle = "white";
		ctx.fillText("You won! Press R to play again", CANVASW/2 - 300, CANVASH/2)
	}
	
};
function postEffects(){

	for(var a = 0; a < CANVASH/5; a++){
		ctx.fillStyle = "rgba(0,0,0,"+ (Math.random() * (0.035- 0) + 0) +")";
		ctx.fillRect(0,a * 5,CANVASW,5);
		ctx.strokeStyle = "rgba(0,0,0,"+ (Math.random() * (0.05 - 0) + 0) +")";
		ctx.strokeRect(0,a * 5,CANVASW,5);
	}
	if(bloodEffect || !playerAlive)
		gradientCircleFilterBlood(player.collider.pos.x - viewX, player.collider.pos.y - viewY, CANVASW, "255,0,0")
	else
		gradientCircleFilter(player.collider.pos.x - viewX, player.collider.pos.y - viewY, CANVASW, "0,0,0")
}
function gradientCircleFilter(x, y, r, c) {
    ctx.beginPath();
    var rad = ctx.createRadialGradient(x, y, 1, x, y, r);
    rad.addColorStop(0, 'rgba('+c+',0)');
    rad.addColorStop(0.6, 'rgba('+c+',1)');
    rad.addColorStop(1, 'rgba('+c+',1)');
    ctx.fillStyle = rad;
    ctx.arc(x, y, r, 0, Math.PI*2, false);
    ctx.fill();
};
function gradientCircleFilterBlood(x, y, r, c) {
    ctx.beginPath();
    var rad = ctx.createRadialGradient(x, y, 1, x, y, r);
    rad.addColorStop(0, 'rgba('+c+',0)');
    rad.addColorStop(1, 'rgba('+c+',0.5)');
    ctx.fillStyle = rad;
    ctx.arc(x, y, r, 0, Math.PI*2, false);
    ctx.fill();
};
function handleInput(deltaTime){

	if(playerInput){

		//up 87
		if(input.isDown("w")){
			player.pos.y -= speed * deltaTime;
		}
		//down 83
		if(input.isDown("s")){
			player.pos.y += speed * deltaTime;	
		}
		//left 65
		if(input.isDown("a")){
			player.pos.x -= speed * deltaTime;
		}
		//right 68
		if(input.isDown("d")){
			player.pos.x += speed * deltaTime;	
		}
	}

	if(input.isDown("q") && gizomos && inputTimer === 0){
			gizomos = false;
			inputTimer = inputCooldown;
	}
	if(input.isDown("q") && !gizomos && inputTimer === 0){
			gizomos = true;
			inputTimer = inputCooldown;
	}

	if(input.isDown("e") && postE && inputTimer === 0){
			postE = false;
			inputTimer = inputCooldown;
	}
	if(input.isDown("e") && !postE && inputTimer === 0){
			postE = true;
			inputTimer = inputCooldown;
	}

	if(input.isDown("r") && inputTimer === 0){
		inputTimer = inputCooldown;
		levelRestart();
	}

	if(input.isDown("f") && inputTimer === 0){
		inputTimer = inputCooldown;
		enemies.push(new Enemy(enemiesData[0].enemyType, enemiesData[0].startPos.x, enemiesData[0].startPos.y, enemiesData[0].radius, enemiesData[0].waypoints, enemiesData[0].exp))
	
	}
};
function makeAngle(x1,x2,y1,y2){
	return Math.atan2(y2 - y1,x2 - x1);	
};
function random(int){
	return Math.floor(Math.random() * int);
};
function rollDice(N, S){
    var value = 0
    
    for(var a = 0; a < N; a++)
        value += random(S + 1)
    
    return value
};
function drawRotatedImg(source, sX, sY, sWidth, sHeight, x, y, width, height, angle){
	ctx.save();		
	ctx.translate(x + width/2, y + height/2);
	ctx.rotate(angle);
	ctx.drawImage(source, sX, sY, sWidth, sHeight, -(width/2), -(height/2), width, height);
	ctx.restore();
};
function renderStrokeColliderBox(name, collider, color, viewX, viewY){
	ctx.fillStyle = color;
	//ctx.strokeStyle = color;
	ctx.fillRect(collider.pos.x - viewX, collider.pos.y - viewY, collider.w, collider.h);
	ctx.font = "20px Georgia"
	ctx.fillText(name, collider.pos.x - viewX, collider.pos.y + 20 - viewY);
};
function renderStrokeColliderCircle(collider, color, viewX, viewY){
	ctx.beginPath();
	ctx.arc(collider.pos.x - viewX, collider.pos.y - viewY, collider.r, 0, 2 * Math.PI, false);
	ctx.strokeStyle = "black";
 	ctx.lineWidth = 5;
	ctx.stroke();
	ctx.fillStyle = color;
	ctx.fill();
};
function renderStrokeColliderPolygon(collider, color, viewX, viewY){
	ctx.fillStyle = color;
	//ctx.strokeStyle = color;
	ctx.beginPath();
	ctx.moveTo(collider.calcPoints[0].x + collider.pos.x - viewX, collider.calcPoints[0].y + collider.pos.y - viewY);
	for(var a = 1; a < collider.calcPoints.length; a++){
		ctx.lineTo(collider.calcPoints[a].x + collider.pos.x - viewX, collider.calcPoints[a].y + collider.pos.y - viewY);
	}
	ctx.closePath();
	//ctx.stroke();
	ctx.fill();
};
function collisonResponse(response, obj1, obj2){
	if (obj2.isHeavy) {
		response.overlapV.scale(1.001)
		obj1.pos.add(response.overlapV);
	} else if (obj1.isHeavy) {
		obj2.pos.sub(response.overlapV);
	} else {
		obj2.pos.sub(response.overlapV);
		obj1.pos.add(response.overlapV);
	}
};
function levelRestart(){

	//player
	delete player;
	player = new Player(playerStartPos.x,playerStartPos.y);

	//enemies
	enemies = [];
	for(var a = 0; a < enemiesData.length; a++){
		enemies.push(new Enemy(enemiesData[a].enemyType, enemiesData[a].startPos.x, enemiesData[a].startPos.y, enemiesData[a].radius, enemiesData[a].waypoints, enemiesData[a].exp))
	}

	//bullets
	bullets = [];

	//is player alive?
	playerAlive = true;
	
	//can player control his character?
	playerInput = true;

	//is game won
	win = false;

};

//################ CODE NAME BORDERGUNS BRANCH ###################

//################ v 0.1 in development ###################

// - Player can walking and shooting
// - Enemies follow our player when in fieldview
// - Enemies react to bullets (die)
// - Enemies attack player when in melee range
// - Player never lost enemies attantion
// - Player can die
// - Level restart
// - Added health bars for enemies nad player
// - Player now can level up (no effect to anything just exist)

//################ WIP/IDEAS/TO DO/THOUGHTS ###################
//Adding types of enemies
//2 types of enemies (range and melee) so far 
//melee run toward player and dodge
//range shoot to player and use cover/dodge
//damage calculation system
//damage draw system
//enemies impact to bullets
//loot 
//crosshair cursor
//enemies cover system
//enemies dodge system
//story :D
//created world but procedural generated dungeons
//cover - dynamic cover nodes list
//player stats system
//weapons stats system
//ammo system
//leveling system
//player can restore hp
//shields
//lots of bullets
//money system
//kick enemies asses
//player melee knockback (knockbacking enemies in melee range)
//table covers

//################ OPTIONALS FEATURE ###################
//elemental weapons
//game save
//player can reset save
//node js 