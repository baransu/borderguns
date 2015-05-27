/* global SAT */
/* global Level */
/* global input */
/* global Bullet */
/* global Graph */
/* global Player */

//canvas tech stuff
var CANVASW,
	CANVASH;
var canvas;
var ctx;
var lastTime = Date.now();
var mapCanvas;
var mapCtx;
//input
var mouse = {};
var mouseLeftPressed = false;
var mouseRightPressed = false;
var mouseMiddlePressed = false;
var inputTimer = 0;
var inputCooldown = 0.3;
var leftX,
	leftY,
	rightX,
	rightY;
var rightTrigger;
var buttonX;
var buttonY;
var gamepadRightOffset = 0.15;

//player
var player;
var speed = 500;
var bullets = [];
var bulletTimer = 0;
var mouseToPlayerAngle = 0;
var meleeAttackTimer = 0;
var meleeAttackCooldown = 0.5;
var playerAlive = true;
var playerStartPos = new SAT.Vector();
var playerHealthPercentage;
var levelBarPercentage;
//level exp
var playerLevelFrames = [
	0, 100, 200, 300, 400, 500,
];
var canLevel = true;
var playerForward = new SAT.Vector();
var useGamepad = false;

//ai/ pathfinding
var pathfindingNodes = [];
var pathfindingNodesScale = 30;

var TILESIZE = 64;

var levelWidth = TILESIZE * 100;
var levelHeight = TILESIZE * 100;

var nSizeX = levelWidth/pathfindingNodesScale;
var nSizeY = levelHeight/pathfindingNodesScale;
var pathfindingGraph;
var AIWallOffsetL1 = 2;
var AIWallOffsetL2 = 1;

//rendering stuff
var viewX = 0, viewY = 0;
var bloodEffect = false;
var bloodEffectTimer = 0;
var bloodEffectDuration = 0.1;
var dmgText = [];
var crosshairPosition = new SAT.Vector();

//gradient stuff
var bgGradient = 0;
var calcGradient = true;
var gradientColors = [];
var colors = [
	[62,35,255],
	[60,255,60],
	[255,35,98],
	[45,175,230],
	[255,0,255],
	[255,128,0]
	];

var step = 0;
var colorIndices = [0,1,2,3];
var gradientSpeed = 0.02;

//enemies
var enemies = [];
var enemiesData = [];

//enemies waypoint tolernace
var toPointOffset = 2 * pathfindingNodesScale;

//global / other
var meleeRange = 75;
var obstacles = [];
var win = false;
var critChance = 15;
var gravity = 0.981;

//only for development
var gizomos = false;
var postE = false;

//images
var crosshair = new Image();
var character = new Image();
var bullet = new Image();
var floor = new Image();
var walls = new Image();

var followEnemy;
var isFollowing = false;
var toLastEnemy = 0;

var distanceToEnemies = [];

var followSearch = false;

var gun = {
	bulletType: "simple", //shotgun // multishot
	richocetCount: 0,
	bulletSpawnCooldown: 0,
	bulletSpeed: 1500,
	shotgunBullets: 5,
	bulletSize: 2,
};

var enemiesTypes = [
	"ranged",
	"melee",
];

var wave;

var waveLevel = 0;

var enemiesCrit = 5;

var canWave = true;

var ls = localStorage;

var enemiesSizeScale = 30;

var level = null;

var wallSize = 64;

var animations = [];

var backgroundMusic;

var miniMap;

var particleSystems = [];

var playerHitParticlesColor = {
		start : {r : 255, g : 255, b : 255},
		end : {r : 0, g : 255, b : 0},
	}
	
var enemyHitParticlesColor = {
	start : {r : 255, g : 255, b : 255},
	end : {r : 255, g : 204, b : 0},
}

var enemiesSum = 0;

var jsonData;

var score = 0;

function load()
{
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");
	mapCanvas = document.getElementById("mapCanvas");
	mapCtx = mapCanvas.getContext("2d");
	
	//stuff for smooth animations?
	ctx.mozImageSmoothingEnabled = false;
	ctx.webkitImageSmoothingEnabled = false;
	ctx.msImageSmoothingEnabled = false;
	ctx.imageSmoothingEnabled = false;
	
	if (canvas.requestFullscreen)
	{
	  canvas.requestFullscreen();
	}
	else if (canvas.msRequestFullscreen)
	{
	  canvas.msRequestFullscreen();
	}
	else if (canvas.mozRequestFullScreen)
	{
	  canvas.mozRequestFullScreen();
	}
	else if (canvas.webkitRequestFullscreen)
	{
	  canvas.webkitRequestFullscreen();
	}
	

	document.addEventListener('mousemove', function(e)
	{
		if(!isFollowing)
		{			
			mouse.x = e.clientX || e.pageX; 
			mouse.y = e.clientY || e.pageY;
		}

	}, false);

	document.addEventListener('mousedown', function(e)
	{
		switch (e.which)
		{
	        case 1:
	       		mouseLeftPressed = true;
	            break;
	        case 2:
	            mouseMiddlePressed = true;
	            break;
	        case 3:
	            mouseRightPressed = true;
	            break;
	        default:
	            break;
    	}
	}, false);

	document.addEventListener('mouseup', function(e)
	{
		mouseLeftPressed = false;
		mouseRightPressed = false;
		mouseMiddlePressed = false;
	}, false);

	document.addEventListener('contextmenu', function(e)
	{
		e.preventDefault();
	}, false);	

	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	
	CANVASW = canvas.width;
	CANVASH = canvas.height;	

	//images links
	floor.src = "img/level_floor.png";
	walls.src = "img/level_walls.png";
	bullet.src = "img/bullet.png";
	crosshair.src = "img/crosshair.png";
	character.src = "img/character.png";	

	obstacles = [
		//fake collider to fix bug !!!
		new SAT.Box(new SAT.Vector( 0, 0), 1, 1),

		//walls
		new SAT.Box(new SAT.Vector( 0, 0), wallSize, levelHeight),
		new SAT.Box(new SAT.Vector( wallSize, levelHeight - wallSize), levelHeight - wallSize, wallSize),
		new SAT.Box(new SAT.Vector( levelWidth - wallSize, wallSize), wallSize, levelHeight - wallSize),
		new SAT.Box(new SAT.Vector( wallSize, 0), levelHeight - wallSize, wallSize),
		
	];
	
	
	loadJSON("level.json", function(response) {

		jsonData = JSON.parse(response);	
				
		var abc = jsonData.length;		
		for(var i = 0; i < abc; i++)
		{
			var o = new SAT.Box(new SAT.Vector( jsonData[i].wall.x, jsonData[i].wall.y), jsonData[i].wall.w, jsonData[i].wall.h);
			obstacles.push(o);
		}
		
		
		for(var a = 0; a < obstacles.length; a++) obstacles[a].isHeavy = true;
	
		pathfindingFunction();
	
		//player start pos
		playerStartPos = new SAT.Vector(2417,2779);
	
		//adding player
		player = new Player(playerStartPos.x, playerStartPos.y);
	
		//diagonal pathfinding
		pathfindingGraph = new Graph(pathfindingNodes);
		pathfindingGraph.diagonal = true;
	
		//enemies data standard so far
		//types of enemies
		enemiesData[0] = {
			startPos: new SAT.Vector(500,300),
			radius: 30,
			waypoints: [
				new SAT.Vector(900,300),
				new SAT.Vector(900,500)
			],
			hp: 1000,
		}
	
		if(enemies.length > 0)
		{
			var toPlayerX = enemies[0].collider.pos.x - player.collider.pos.x;
			var toPlayerY = enemies[0].collider.pos.y - player.collider.pos.y;
			toLastEnemy = Math.sqrt(Math.pow(toPlayerX,2) + Math.pow(toPlayerY,2));
		}
		
		level = new Level(0);
	
		//start game 
		if(ls.getItem("base") == null)
			ls.setItem("base", 0);
	
		if(getRandomBool())
		{
			backgroundMusic = new Audio("sounds/background1.mp3"); 
		}
		else
		{
			backgroundMusic = new Audio("sounds/background2.mp3"); 
		}
	
		backgroundMusic.addEventListener("ended", function()
		{
		    this.currentTime = 0;
		    this.play();
		}, false);
		
		backgroundMusic.volume = 0.2;
		backgroundMusic.play();	
		
		miniMap = new Map(mapCanvas, mapCtx);
	 	
		gameLoop();
		
	});	
}

function gameLoop()
{
    var now = Date.now();
    var deltaTime = (now - lastTime) / 1000.0;

    handleInput(deltaTime);
    update(deltaTime);
    render();

    lastTime = now;
    window.requestAnimationFrame(gameLoop);
}

function update(deltaTime)
{
	level.update(deltaTime);

	player.update(deltaTime);

	
	//animations update
	for(var i = 0; i < animations.length; i++) animations[i].update(i);

	//dmgtext
	for(var i = 0; i < dmgText.length; i++) dmgText[i].update(deltaTime, i);
	
	for(var i = 0; i < particleSystems.length; i++)	particleSystems[i].update(deltaTime, i);
	
	//gradient stuff
	if(bgGradient == 0 && calcGradient == false)
	{
		bgGradient = 1;
		calcGradient = true;
	}
	
	//variable to render object in right position
	viewX = player.pos.x - CANVASW/2;
	viewY = player.pos.y - CANVASH/2;

	//timers		
	if(bulletTimer > 0) bulletTimer -= deltaTime;
	if(bulletTimer < 0) bulletTimer = 0;
	
	if(bgGradient > 0) bgGradient -= deltaTime;
	if(bgGradient < 0) bgGradient = 0;

	if(inputTimer > 0) inputTimer -= deltaTime;
	if(inputTimer < 0) inputTimer = 0;

	if(bloodEffectTimer > 0)
	{
		bloodEffect = true;
		bloodEffectTimer -= deltaTime;
	}
	
	if(bloodEffectTimer < 0)
	{
		bloodEffect = false;
		bloodEffectTimer = 0;
	}

	if(bloodEffectTimer == 0) bloodEffect = false;	
}

function render()
{
	//clearing canvas
	ctx.clearRect(0, 0, CANVASH, CANVASH);		
	
	//changing background gradient color
	if(calcGradient)
	{
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
		if (step >= 1)
		{
			step %= 1;
			colorIndices[0] = colorIndices[1];
			colorIndices[2] = colorIndices[3];

			colorIndices[1] = ( colorIndices[1] + Math.floor( 1 + Math.random() * (colors.length - 1))) % colors.length;
			colorIndices[3] = ( colorIndices[3] + Math.floor( 1 + Math.random() * (colors.length - 1))) % colors.length;
		}
	}
	
	//still gradient stuff
	var my_gradient = ctx.createLinearGradient(0, 0, CANVASW/2, CANVASH);
	my_gradient.addColorStop(0, gradientColors[0]);
	my_gradient.addColorStop(1, gradientColors[1]);

	//background
	ctx.fillStyle = my_gradient;
	
	//ctx.fillStyle = "grey";
	ctx.fillRect(0,0,CANVASW,CANVASH);

	//floor
	ctx.fillStyle = "#2C322B";
	ctx.fillRect(0 - viewX, 0 - viewY, levelWidth, levelHeight);
	//ctx.drawImage(floor, viewX, viewY, CANVASW, CANVASH, 0, 0, CANVASW, CANVASH)

	//debuging stuff / to delete at the end
	if(gizomos)
	{
		ctx.lineWidth = 1;
		for(var a = 0; a < nSizeX; a++)
		{
			for(var b = 0; b < nSizeY; b++)
			{
				if(pathfindingNodes[a][b] == 1)
					ctx.strokeStyle = "magenta";
				else if(pathfindingNodes[a][b] == 2)
					ctx.strokeStyle = "teal";
				else if(pathfindingNodes[a][b] == 5)
					ctx.strokeStyle = "maroon";
				else
					ctx.strokeStyle = "black";

				ctx.strokeRect(a * pathfindingNodesScale - viewX, b * pathfindingNodesScale - viewY, pathfindingNodesScale,pathfindingNodesScale);
			}
		}			
	}	

	//enviroment
	level.render();
	//player
	player.render();	
	
	//animations
	for(var i = 0; i < animations.length; i++) animations[i].render();
	//particles
	for(var i = 0; i < particleSystems.length; i++)	particleSystems[i].render();
	
	//GUI STUFF
	//cool effects :3
	if(postE) postEffects();
	
	//dmgtext draw
	for(var i = 0; i < dmgText.length; i++)	dmgText[i].render();
	
	ctx.lineWidth = 1;

	if(!win && player.playerAlive)
	{
		//hp bar
		ctx.save();
		//ctx.strokeStyle = "white";
		//ctx.strokeRect(CANVASW/2 - 250/2, CANVASH - 50, 250, 50);
		ctx.shadowColor = "black";
		ctx.shadowBlur = 20;
		ctx.fillStyle = "black";
		ctx.fillRect(CANVASW/2 - 250/2, CANVASH - 50, 250, 50);
		ctx.fillStyle = "red";
		ctx.fillRect(CANVASW/2 - 250/2, CANVASH - 50, 250 * player.playerHealthPercentage, 50);
		ctx.restore();

		//hp bar text
		ctx.fillStyle = "white";
		ctx.font="30px Pixel";
		ctx.strokeStyle = "black";
		ctx.textAlign = "center";
		ctx.strokeText("" + player.health + "/" + player.maxHealth + "", CANVASW/2, CANVASH - 30);
		ctx.fillText(player.health + "/" + player.maxHealth, CANVASW/2, CANVASH - 30);
		ctx.textAlign = "left";
		//crosshair
		ctx.drawImage(crosshair, crosshairPosition.x - 16, crosshairPosition.y - 16);
	}
	
	//game over
	if(!player.playerAlive)
	{
		ctx.save();
		ctx.fillStyle = "rgba(0,0,0,0.7)";
		ctx.font = "50px Pixel";
		ctx.fillStyle = "white";
		ctx.textAlign = "center";
		ctx.shadowColor = "black";
		ctx.shadowBlur = 20;
		ctx.fillText("Press R to try again", CANVASW/2, CANVASH/2);		
		
		ctx.fillStyle = 'white';
		var abc = parseFloat(ls.getItem("base"));
		if(score > abc)
			ls.setItem("base", score.toFixed(3));
		
		ctx.font = "20px Pixel";
		ctx.fillText("Best: " + abc.toFixed(3), CANVASW/2, 100);
		
		ctx.font = "20px Pixel";
		ctx.fillText("Your score: " + score.toFixed(3), CANVASW/2, 80);
		ctx.restore();
	}	

	//win
	if(win)
	{
		ctx.save();
		ctx.fillStyle = "rgba(0,0,0,0.7)";
		ctx.font = "50px Pixel";
		ctx.fillStyle = "white";
		ctx.strokeStyle = "back";	
		ctx.textAlign = "center";
		ctx.shadowColor = "black";
		ctx.shadowBlur = 20;
		ctx.fillText("You won! Po press R play again", CANVASW/2, CANVASH/2);
		ctx.textAlign = "left";
		ctx.restore();
	}
	
	miniMap.render();	
}

function lerp(a, b, u)
{
    return (1 - u) * a + u * b;
}

function shootBullet(origin, direction)
{
	//damage calculation and spawning bullets
	var dmg = 0;
	var crit = false;
	dmg = 0 + rollDice(10, 10);
	dmg = Math.min(dmg, 0 + rollDice(10, 10));
	dmg = Math.max(dmg, 0 + rollDice(10, 10));
	if (random(100) < critChance)
	{
	    dmg += 0 + rollDice(10, 10);
		crit = true;
	}
	
	if(gun.bulletType == "shotgun")
	{
		var bCount = Math.floor(Math.abs(gun.shotgunBullets)/2);
		if(bCount % 2 == 0)
			bCount--;
		for(var a = -bCount; a <= bCount; a++)
		{

			var dir = new SAT.Vector(50, 0);
			var angle1 = makeAngle(CANVASW/2, mouse.x, CANVASH/2, mouse.y);

			angle1 += Math.PI/18 * a;

			if (angle1 < 0)	angle1 = angle1 + Math.PI*2;

			dir.rotate(angle1);
			dir.normalize();

			level.bullets.push(new Bullet(gun.bulletType, gun.richocetCount, crit, dmg, bullet, origin.x, origin.y, gun.bulletSize, gun.bulletSpeed, new SAT.Vector(dir.x, dir.y), true, player));

		}
	}
	else
	{
		level.bullets.push(new Bullet(gun.bulletType, gun.richocetCount, crit, dmg, bullet, origin.x, origin.y, gun.bulletSize, gun.bulletSpeed, new SAT.Vector(direction.x, direction.y), true, player));
	}

	bulletTimer = gun.bulletSpawnCooldown;
}

function postEffects()
{
	for(var a = 0; a < CANVASH/5; a++)
	{
		ctx.fillStyle = "rgba(0,0,0,"+ (Math.random() * (0.035- 0) + 0) +")";
		ctx.fillRect(0,a * 5,CANVASW,5);
		ctx.strokeStyle = "rgba(0,0,0,"+ (Math.random() * (0.05 - 0) + 0) +")";
		ctx.strokeRect(0,a * 5,CANVASW,5);
	}
	
	if(bloodEffect || !player.playerAlive)
		gradientCircleFilterBlood(player.collider.pos.x - viewX, player.collider.pos.y - viewY, CANVASW, "255,0,0");
	else
		gradientCircleFilter(player.collider.pos.x - viewX, player.collider.pos.y - viewY, CANVASW, "0,0,0");
}

function gradientCircleFilter(x, y, r, c)
{
    ctx.beginPath();
    var rad = ctx.createRadialGradient(x, y, 1, x, y, r);
    rad.addColorStop(0, 'rgba('+c+',0)');
    rad.addColorStop(1, 'rgba('+c+',0.5)');
    //rad.addColorStop(1, 'rgba('+c+',1)');
    ctx.fillStyle = rad;
    ctx.arc(x, y, r, 0, Math.PI*2, false);
    ctx.fill();
}

function gradientCircleFilterBlood(x, y, r, c)
{
    ctx.beginPath();
    var rad = ctx.createRadialGradient(x, y, 1, x, y, r);
    rad.addColorStop(0, 'rgba('+c+',0)');
    rad.addColorStop(1, 'rgba('+c+',0.5)');
    ctx.fillStyle = rad;
    ctx.arc(x, y, r, 0, Math.PI*2, false);
    ctx.fill();
}

function handleInput(deltaTime)
{		
	if(player.playerInput)
	{
		if(useGamepad)
		{
			var gp = navigator.getGamepads()[0];
		    leftX = gp.axes[0];
		    leftY = gp.axes[1];

		    rightX = gp.axes[2];
		    rightY = gp.axes[3];

		    rightTrigger = gp.buttons[7];

		    buttonX = gp.buttons[2];

		    if(leftX > 0.2 || leftX < -0.2)
	  			player.pos.x += leftX * deltaTime * speed;

	  		if(leftY > 0.2 || leftY < -0.2)
	  			player.pos.y += leftY * deltaTime * speed; 

  			playerForward = new SAT.Vector(leftX, leftY);
		}

		//up 87
		if(input.isDown("w"))
		{
			player.pos.y -= speed * deltaTime;
		}
		//down 83
		if(input.isDown("s"))
		{
			player.pos.y += speed * deltaTime;	
		}
		//left 65
		if(input.isDown("a"))
		{
			player.pos.x -= speed * deltaTime;
		}
		//right 68
		if(input.isDown("d"))
		{
			player.pos.x += speed * deltaTime;	
		}
		
	}
	//simple
	if(input.isDown("1") && inputTimer == 0)
	{
		gun.bulletType = "simple";
		gun.bulletSpawnCooldown = 0.02;
		inputTimer = inputCooldown;
	}
	//multishot
	if(input.isDown("2") && inputTimer == 0)
	{
		gun.bulletType = "multishot";
		gun.bulletSpawnCooldown = 0.05;
		inputTimer = inputCooldown;
	}
	//shotgun
	if(input.isDown("3") && inputTimer == 0)
	{
		gun.bulletType = "shotgun";
		gun.bulletSpawnCooldown = 0.05;
		inputTimer = inputCooldown;
	}
	

	if(input.isDown("z") && inputTimer === 0)
	{
		gizomos = !gizomos;
		inputTimer = inputCooldown;
	}

	if(input.isDown("e") && postE && inputTimer === 0)
	{
			postE = false;
			inputTimer = inputCooldown;
	}
	
	if(input.isDown("e") && !postE && inputTimer === 0)
	{
			postE = true;
			inputTimer = inputCooldown;
	}
	
	if(input.isDown("q") && !postE && inputTimer === 0 && !followSearch)
	{
			followSearch = true;
			inputTimer = inputCooldown;
	}
	
	if(input.isDown("r") && inputTimer === 0)
	{
		inputTimer = inputCooldown;
		levelRestart();
	}
	
	if((input.isDown("f") || (useGamepad && buttonX.pressed == true)) && inputTimer === 0)
	{
		inputTimer = inputCooldown;
		var abc = Math.floor(Math.random() * 2);
		var radius = enemiesData[0].hp/enemiesSizeScale
		level.wave.enemies.push(new Enemy(enemiesTypes[abc], enemiesData[0].startPos.x, enemiesData[0].startPos.y, radius, enemiesData[0].waypoints, enemiesData[0].hp));
	}
}

function makeAngle(x1,x2,y1,y2)
{
	return Math.atan2(y2 - y1,x2 - x1);	
}

function random(int)
{
	return Math.floor(Math.random() * int);
}

function rollDice(N, S)
{
    var value = 0;    
    for(var a = 0; a < N; a++) value += random(S + 1);    
    return value;
}

function getRandFloatInRange(min, max)
{
 	return Math.random() * (max - min) + min;
}

function drawRotatedImg(source, sX, sY, sWidth, sHeight, x, y, width, height, angle)
{
	ctx.save();		
	ctx.translate(x + width/2, y + height/2);
	ctx.rotate(angle);
	ctx.drawImage(source, sX, sY, sWidth, sHeight, -(width/2), -(height/2), width, height);
	ctx.restore();
}

function renderStrokeColliderBox(collider, color, viewX, viewY)
{
	ctx.fillStyle = color;
	ctx.fillRect(collider.pos.x - viewX, collider.pos.y - viewY, collider.w, collider.h);
	//ctx.strokeStyle = color;
	//ctx.strokeRect(collider.pos.x - viewX, collider.pos.y - viewY, collider.w, collider.h);
	//ctx.font = "20px Georgia";
	//ctx.fillText(name, collider.pos.x - viewX, collider.pos.y + 20 - viewY);
}

function renderStrokeColliderCircle(collider, color, viewX, viewY)
{
	ctx.beginPath();
	ctx.arc(collider.pos.x - viewX, collider.pos.y - viewY, collider.r, 0, 2 * Math.PI, false);
	ctx.strokeStyle = "black";
 	ctx.lineWidth = 5;
	ctx.stroke();
	ctx.fillStyle = color;
	ctx.fill();
}

function renderStrokeColliderPolygon(collider, color, viewX, viewY)
{
	ctx.fillStyle = color;
	//ctx.strokeStyle = color;
	ctx.beginPath();
	ctx.moveTo(collider.calcPoints[0].x + collider.pos.x - viewX, collider.calcPoints[0].y + collider.pos.y - viewY);
	
	for(var a = 1; a < collider.calcPoints.length; a++)
	{
		ctx.lineTo(collider.calcPoints[a].x + collider.pos.x - viewX, collider.calcPoints[a].y + collider.pos.y - viewY);
	}
	
	ctx.closePath();
	//ctx.stroke();
	ctx.fill();
}

function collisonResponse(response, obj1, obj2)
{
	if (obj2.isHeavy) {
		response.overlapV.scale(1.001)
		obj1.pos.add(response.overlapV);
	} else if (obj1.isHeavy) {
		obj2.pos.sub(response.overlapV);
	} else {
		obj2.pos.sub(response.overlapV);
		obj1.pos.add(response.overlapV);
	}
}

function levelRestart()
{
	//player
	delete player;
	player = new Player(playerStartPos.x, playerStartPos.y);

	//enemies
	level.wave.enemies = [];
	
	level.waveDif = 0;
	
	isFollowing = false;
	followSearch = false;
	followEnemy = null;

	//bullets
	level.bullets = [];

	//is player alive?
	player.playerAlive = true;
	
	//can player control his character?
	player.playerInput = true;

	//is game won
	win = false;
}

function pathfindingFunction()
{
	for(var a = 0; a < nSizeX;a++)
	{
		pathfindingNodes[a]=[];
		for(var b = 0; b < nSizeY; b++)
			pathfindingNodes[a][b] = 1;
	}

	//creating pathfinding nodes
	for(var z = 1; z < obstacles.length; z++)
	{	
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
	for(var a = 0; a < nSizeX; a++)
	{
		for(var b = 0; b < nSizeY; b++)
		{
			if(pathfindingNodes[a][b] == 0)
			{
				for (var xx = -AIWallOffsetL1; xx <= AIWallOffsetL1; xx++)
				{
                    for (var yy = -AIWallOffsetL1; yy <= AIWallOffsetL1; yy++)
					{
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
	for(var a = 0; a < nSizeX; a++)
	{
		for(var b = 0; b < nSizeY; b++)
		{
			if(pathfindingNodes[a][b] == 0)
			{
				for (var xx = -AIWallOffsetL2; xx <= AIWallOffsetL2; xx++)
				{
                    for (var yy = -AIWallOffsetL2; yy <= AIWallOffsetL2; yy++)
					{
                        var pom1 = xx + a;
                        var pom2 = yy + b;
                        
                        if ((pom1 >= 0) && (pom1 < nSizeX) && (pom2 >= 0) && (pom2 < nSizeY) && pathfindingNodes[pom1][pom2] != 0)
                            pathfindingNodes[pom1][pom2] = 5;

                    }
                }
			}
		}
	}
}

function getRandomInt(min, max)
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomBool()
{
    if(Math.random() < 0.5)
	{
		return true;
	}
	else
	{
		return false;
	}
}

function loadJSON(file, callback) {

		var xobj = new XMLHttpRequest();
		xobj.overrideMimeType("application/json");
		xobj.open('GET', file, true);
		xobj.onreadystatechange = function ()
		{
			if (xobj.readyState == 4 && xobj.status == "200")
			{
				callback(xobj.responseText);
			}
		}
		
		xobj.send(null);	
	}

//################ CODE NAME: BORDERGUNS ###################
//################ v 0.1.0 ###################
//################ WIP/IDEAS/TO DO/THOUGHTS ###################

//in development 128 dni
//linijek: 2496 (mojego)
//edytor do poziomow