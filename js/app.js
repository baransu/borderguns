var CANVASW,
	CANVASH;
var canvas, canvas1;
var ctx, ctx1;
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

var moveDoor;

var doorTimer = 0;
var doorCooldown = 0.5;

var len1 = 0; len2 = 0;
var tempAngle = 0;

var viewX = 0, viewY = 0;

var doors = [];

var pathfindingNodes = [];
var pathfindingNodesScale = 20
var nSizeX = 1920/pathfindingNodesScale;
var nSizeY = 1080/pathfindingNodesScale;

var pathfindingGraph;

var AIWallOffsetL1 = 2;
var AIWallOffsetL2 = 1

var gizomos = true;
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

var postE = false;

var toPointOffset = 2 * pathfindingNodesScale

var playerAlive = true;

var meleeRange = 75;
// * Math.sqrt(2);

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
	

	//fake collider to fix bug
	obstacles[0] = new SAT.Box(new SAT.Vector( 0, 0), 1, 1);

	//walls
	obstacles[1] = new SAT.Box(new SAT.Vector( 0, 40), 40, 1000);
	obstacles[2] = new SAT.Box(new SAT.Vector( 40, 1040), 1820, 40);
	obstacles[3] = new SAT.Box(new SAT.Vector( 1860, 40), 60, 1000);
	obstacles[4] = new SAT.Box(new SAT.Vector( 40, 1), 1820, 40);

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


	doorsData[0] = {
		pos: new SAT.Vector(1,1),
		width: 5,
		height: 5,
		angle: 0,
	}
	doorsData[1] = {
		pos: new SAT.Vector(305,160),
		width: 105,
		height: 10,
		angle: Math.PI/2,
	}
	doorsData[2] = {
		pos: new SAT.Vector(975,320),
		width: 105,
		height: 10,
		angle: Math.PI/2,
	}

	for(var a = 0; a < doorsData.length; a++){
		doors.push(new Door(doorsData[a].pos.x, doorsData[a].pos.y, doorsData[a].width, doorsData[a].height, doorsData[a].angle));
	}

	playerStartPos = new SAT.Vector(1100,100);

	player = new Player(playerStartPos.x,playerStartPos.y);
	
	pathfindingGraph = new Graph(pathfindingNodes)
	pathfindingGraph.diagonal = true;
	
	enemiesData[0] = {
		startPos: new SAT.Vector(500,300),
		radius: 30,
		waypoints: [
			new SAT.Vector(900,300),
			new SAT.Vector(900,500)
		],
		img: img,
	}

	enemies.push(new Enemy(enemiesData[0].img, enemiesData[0].startPos.x,enemiesData[0].startPos.y, enemiesData[0].radius, enemiesData[0].waypoints))

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

	if(inputTimer > 0) inputTimer -= deltaTime;
	if(inputTimer < 0) inputTimer = 0;

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

	for(var a = 1; a < doors.length; a++){
		doors[a].exist(deltaTime);
	}

	//enemies melee range
	for(var a = 0; a < enemies.length; a++){
		var toEnemy = Math.sqrt(Math.pow((enemies[a].collider.pos.x - player.collider.pos.x),2) + Math.pow((enemies[a].collider.pos.y - player.collider.pos.y),2));
		if(toEnemy < meleeRange && mouseLeftPressed && meleeAttackTimer === 0) {
			enemies[a].die = true;
			meleeAttackTimer = meleeAttackCooldown;
		}
	}

	if(mouseLeftPressed && meleeAttackTimer === 0){
		meleeAttackTimer = meleeAttackCooldown;
	}

	mouseToPlayerAngle = makeAngle(CANVASW/2, mouse.x, CANVASH/2, mouse.y);

	if(mouseRightPressed && bulletTimer === 0 && playerInput){
		var temp = new SAT.Vector((mouse.x - CANVASW/2), (mouse.y - CANVASH/2));
		temp.normalize();
		bullets.push(new Bullet(bullet, player.collider.pos.x, player.collider.pos.y, 5, bulletsSpeed, new SAT.Vector(temp.x, temp.y)));
		bulletTimer = bulletCooldown;
	}

	//calculating bullets
	if(bullets != null){
		for(var a = 0; a < bullets.length; a++){
			bullets[a].exist(deltaTime, a);
		}
	}

	if(bgGradient == 0 && calcGradient == false){
		bgGradient = 1;
		calcGradient = true;
	}

	if(bulletTimer > 0) bulletTimer -= deltaTime;
	if(bulletTimer < 0) bulletTimer = 0;
	if(bgGradient > 0) bgGradient -= deltaTime;
	if(bgGradient < 0) bgGradient = 0;

	if(meleeAttackTimer > 0) meleeAttackTimer -= deltaTime;
	if(meleeAttackTimer < 0) meleeAttackTimer = 0;
	
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
		gradientColors[0] = "rgb("+r1+","+g1+","+b1+")";

		var r2 = Math.round(istep * c1_0[0] + step * c1_1[0]);
		var g2 = Math.round(istep * c1_0[1] + step * c1_1[1]);
		var b2 = Math.round(istep * c1_0[2] + step * c1_1[2]);
		gradientColors[1] = "rgb("+r2+","+g2+","+b2+")";

		  
		step += gradientSpeed;
		if (step >= 1){
			step %= 1;
			colorIndices[0] = colorIndices[1];
			colorIndices[2] = colorIndices[3];

			colorIndices[1] = ( colorIndices[1] + Math.floor( 1 + Math.random() * (colors.length - 1))) % colors.length;
			colorIndices[3] = ( colorIndices[3] + Math.floor( 1 + Math.random() * (colors.length - 1))) % colors.length;

		}
	}
	var my_gradient = ctx.createLinearGradient(0,0,CANVASW/2,CANVASH);
	my_gradient.addColorStop(0,gradientColors[0]);
	my_gradient.addColorStop(1,gradientColors[1]);

	ctx.fillStyle=my_gradient;
	ctx.fillRect(0,0,CANVASW,CANVASH);

	//floor
	ctx.drawImage(floor, viewX, viewY, CANVASW, CANVASH, 0, 0, CANVASW, CANVASH)

	if(gizomos){

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
	drawRotatedImg(img, 0, 0, 300, 250, CANVASW/2 - 25, CANVASH/2 - 25, 50, 50, mouseToPlayerAngle);
	
	//walls
	//ctx.drawImage(walls, player.pos.x - CANVASW/2, player.pos.y - CANVASH/2, CANVASW, CANVASH, 0, 0, CANVASW, CANVASH)

	//bullets
	for(var a = 0; a < bullets.length; a++){
		bullets[a].draw();
	}

	//COLLIDERS
	for(var a = 1; a < obstacles.length; a++)
		renderStrokeColliderBox(a, obstacles[a], "red", viewX, viewY);

	for(var a = 1; a < doors.length; a++){

		doors[a].draw();		
		//ctx.fillRect(doors[a].pos.x - viewX, doors[a].pos.y - viewY, 5,5)
	}
	
	renderStrokeColliderCircle(player.collider, "green", viewX, viewY);


	for(var a = 0; a < enemies.length; a++){
		enemies[a].draw();
	}

	//ctx.fillStyle = "black";
	//ctx.fillRect(player.pos.x - viewX, player.pos.y - viewY, 5,5)  
	
	//HD EFFECTS xD
	if(postE)
		postEffects();
	
};
function postEffects(){

	for(var a = 0; a < CANVASH/5; a++){
		ctx.fillStyle = "rgba(0,0,0,"+ (Math.random() * (0.035- 0) + 0) +")";
		ctx.fillRect(0,a * 5,CANVASW,5);
		ctx.strokeStyle = "rgba(0,0,0,"+ (Math.random() * (0.05 - 0) + 0) +")";
		ctx.strokeRect(0,a * 5,CANVASW,5);
	}

	//lighting aka canvas global gradient
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


};
function makeAngle(x1,x2,y1,y2){
	return Math.atan2(y2 - y1,x2 - x1);	
};
function drawRotatedImg(source, sX, sY, sWidth, sHeight, x, y, width, height, angle){
	ctx.save();		
	ctx.translate(x + width/2, y + height/2);
	ctx.rotate(angle);
	ctx.drawImage(source, sX, sY, sWidth, sHeight, -(width/2), -(height/2), width, height);
	ctx.restore();
};
function renderStrokeColliderBox(name, collider, color, viewX, viewY){
	//ctx.fillStyle = color;
	ctx.strokeStyle = color;
	ctx.strokeRect(collider.pos.x - viewX, collider.pos.y - viewY, collider.w, collider.h);
	ctx.font = "20px Georgia"
	ctx.fillText(name, collider.pos.x - viewX, collider.pos.y + 20 - viewY);
};
function renderStrokeColliderCircle(collider, color, viewX, viewY){
	ctx.beginPath();
	ctx.arc(collider.pos.x - viewX, collider.pos.y - viewY, collider.r, 0, 2 * Math.PI, false);
	ctx.strokeStyle = color;
	ctx.stroke();
	//ctx.fillStyle = color;
	//ctx.fill();
};
function renderStrokeColliderPolygon(collider, color, viewX, viewY){
	//ctx.fillStyle = color;
	ctx.strokeStyle = color;
	ctx.beginPath();
	ctx.moveTo(collider.calcPoints[0].x + collider.pos.x - viewX, collider.calcPoints[0].y + collider.pos.y - viewY);
	for(var a = 1; a < collider.calcPoints.length; a++){
		ctx.lineTo(collider.calcPoints[a].x + collider.pos.x - viewX, collider.calcPoints[a].y + collider.pos.y - viewY);
	}
	ctx.closePath();
	ctx.stroke();
	//ctx.fill();
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
function Player(x,y,width,height){
	this.pos = new SAT.Vector(x,y);
	this.width = 50;
	this.height = 50;
	this.collider = new SAT.Circle(this.pos, (this.width * Math.sqrt(2))/2);
	this.idHeavy = false;
	this.toNodes = new SAT.Vector();

};
Player.prototype.toNode = function(){
	for(var a = 0; a < nSizeX; a++){			
		for(var b = 0; b < nSizeY; b++){
			var boxX = a * pathfindingNodesScale;
			var boxY = b * pathfindingNodesScale;
			if (boxX <= this.collider.pos.x && boxX + pathfindingNodesScale >= this.collider.pos.x &&
				boxY <= this.collider.pos.y && boxY + pathfindingNodesScale >= this.collider.pos.y) {

				this.toNodes = new SAT.Vector(a,b);
			}
		}
	}
	return this.toNodes;
};
function Bullet(img, x, y, radius, speed, deltaV){
	this.radius = radius || 1;
	this.speed = speed || 1;
	this.deltaV = deltaV || new SAT.Vector();
	this.img = img;
	this.collider = new SAT.Circle(new SAT.Vector(x,y), radius);
	this.angle = makeAngle(this.collider.pos.x, this.collider.pos.x + this.deltaV.x, this.collider.pos.y, this.collider.pos.y + this.deltaV.y);

};
Bullet.prototype.exist = function(deltaTime, id){
	this.collider.pos.x += this.deltaV.x * this.speed * deltaTime;
	this.collider.pos.y += this.deltaV.y * this.speed * deltaTime;
	
	for(var a = 0; a < enemies.length; a++){

		var col = SAT.testCircleCircle(enemies[a].collider, this.collider);
		
		if(col){
			enemies[a].die = true;
			bullets.splice(id, 1);
			break;
		}
	}

	for(var a = 0; a < obstacles.length; a++){

		var col = SAT.testPolygonCircle(obstacles[a].toPolygon(), this.collider);
		
		if(col){
			bullets.splice(id, 1);
			break;
		}
	}

	for(var a = 0; a < doors.length; a++){

		var col = SAT.testPolygonCircle(doors[a].collider, this.collider);
		
		if(col){
			bullets.splice(id, 1);
			break;
		}
	}

	

	if(this.collider.pos.x < 0 || this.collider.pos.y < 0 || this.collider.pos.x > 2000 || this.collider.pos.y > 2000){
		bullets.splice(id, 1);
		return;
	}
};
Bullet.prototype.draw = function(){
	drawRotatedImg(this.img, 0, 0, 300, 250, this.collider.pos.x - viewX, this.collider.pos.y - viewY, 10, 10, this.angle);
};
function Enemy(img, x, y, radius, waypoints){
	this.img = img;
	this.radius = radius;
	this.normalSpeed = 2;
	this.followPlayerSpeed = 5;
	this.collider = new SAT.Circle(new SAT.Vector(x,y), radius);
	this.isHeavy = false;
	this.angle = 0;
	this.waypoints = waypoints || null;
	this.deltaV = new SAT.Vector();
	this.curWay = 0;
	this.curPath = 0;
	this.forward = new SAT.Vector();

	this.radarLength = 500;
	this.toPlayerRadar;
	this.toPlayerCollision = true;
	this.playerIsInRange = false;

	this.useWaypoints = true;

	this.waypointsToNode = null;
	this.toNodes = new SAT.Vector();
	this.path = null;

	this.lastPlayerPos = new SAT.Vector();
	this.lastPlayerPos = player.toNode();

	this.knockBackTimer = 0;

	this.backToWaypoint = false;

	this.curWaypointToNode = new SAT.Vector();

	this.state = "created";

	this.lastDeltaV = new SAT.Vector();

	this.attackTimer = 0;
	this.attackLagTimer = 0;
	this.attackLag = 0.5;
	this.attackCooldown = 1;;

	this.attack = false;

	this.canAttack = false;

	this.die = false;

};
Enemy.prototype.exist = function(deltaTime, id){

	if(!this.isKnockBack){
		if(this.waypoints != null && this.useWaypoints){

			var toNext = Math.sqrt(Math.pow((this.waypoints[this.curWay].x - this.collider.pos.x),2) + Math.pow((this.waypoints[this.curWay].y - this.collider.pos.y),2));	
			
			if(toNext <= toPointOffset){
				if((this.curWay + 1) != this.waypoints.length)
					this.curWay++;
				else
					this.curWay = 0;
			}

			var deltaX = this.waypoints[this.curWay].x - this.collider.pos.x;
			var deltaY = this.waypoints[this.curWay].y - this.collider.pos.y;

			this.deltaV = new SAT.Vector(deltaX, deltaY).normalize();
			this.deltaV.scale(this.normalSpeed)

		}

		//make angle
		this.angle = makeAngle(this.collider.pos.x, this.forward.x, this.collider.pos.y, this.forward.y)

		if(playerAlive){
			//look for player
			var toPlayerX = player.collider.pos.x - this.collider.pos.x;
			var toPlayerY = -(player.collider.pos.y - this.collider.pos.y);
			var toPlayer = Math.sqrt(Math.pow(toPlayerX,2) + Math.pow(toPlayerY,2));

			if(toPlayer <= this.radarLength){

				var toPointX = this.forward.x - this.collider.pos.x;
				var toPointY = -(this.forward.y - this.collider.pos.y);

				var dot = (toPointX * toPlayerX) + (toPointY * toPlayerY);

				var toPoint = Math.sqrt(Math.pow(toPointX,2) + Math.pow(toPointY,2))

				var cos = dot/(toPoint*toPlayer);

				var acos = Math.acos(cos);

				if(acos < Math.PI/2){

					this.toPlayerRadar = new SAT.Polygon(new SAT.Vector(this.collider.pos.x, this.collider.pos.y),[
						new SAT.Vector(),
						new SAT.Vector(player.collider.pos.x - this.collider.pos.x, player.collider.pos.y - this.collider.pos.y),
						new SAT.Vector(player.collider.pos.x - this.collider.pos.x + 20, player.collider.pos.y - this.collider.pos.y + 20),
						new SAT.Vector(20,20),
					]);

					var obstaclesCol = true;
					var obstaclesCount = 0;
					for(var a = 1; a < obstacles.length; a++){
						this.toPlayerCollision = SAT.testPolygonPolygon(this.toPlayerRadar, obstacles[a].toPolygon())
						if(this.toPlayerCollision) {
							break;					
						}
						else{
							obstaclesCount++;						
						}
					}

					if(obstaclesCount == obstacles.length - 1)
						obstaclesCol = false;

					var doorCol = true;
					var doorCount = 0;
					for(var a = 1; a < doors.length; a++){
						this.toPlayerCollision = SAT.testPolygonPolygon(this.toPlayerRadar, doors[a].collider)
						if(this.toPlayerCollision) {
							break;					
						}
						else{
							doorCount++;
						}
					}
					if(doorCount == doors.length - 1)
						doorCol = false;

					if(!obstaclesCol && !doorCol){
						this.playerIsInRange = true;
					}
					else{
						this.playerIsInRange = false;
					}
				}

			}
		}
		

		//follow player
		if(this.playerIsInRange){
			this.state = "follow player"
			this.useWaypoints = false;
			this.backToWaypoint = false;
			this.toNodes = this.toNode(this.collider.pos)

			this.lastPlayerPos = player.toNode();

			this.makePath(this.lastPlayerPos);

			this.deltaV = this.deltaFromPath();		
			this.deltaV.scale(this.followPlayerSpeed);

		}

		//moving to player last pos
		if(!this.playerIsInRange && !this.useWaypoints && !this.backToWaypoint){

			this.state = "moving to player last pos"
			var toPlayerLast = Math.sqrt(Math.pow(((this.lastPlayerPos.x * pathfindingNodesScale) - this.collider.pos.x),2) + Math.pow(((this.lastPlayerPos.y * pathfindingNodesScale) - this.collider.pos.y),2));	
		
			if(toPlayerLast <= toPointOffset)
				this.backToWaypoint = true;

			this.deltaV = this.deltaFromPath();		
			this.deltaV.scale(this.followPlayerSpeed);

		}


		//back to waypoint system
		if(!this.playerIsInRange && this.backToWaypoint && !this.useWaypoints){
			this.state = "back to waypoint system"
			var toCur = Math.sqrt(Math.pow((this.waypoints[this.curWay].x - this.collider.pos.x),2) + Math.pow((this.waypoints[this.curWay].y - this.collider.pos.y),2));	
			
			if(toCur <= toPointOffset){
				this.backToWaypoint = false;
				this.useWaypoints = true;
			}

			this.toNodes = this.toNode(this.collider.pos)
			this.curWaypointToNode = this.toNode(this.waypoints[this.curWay]);

			//follow path
			this.makePath(this.curWaypointToNode);

			this.deltaV = this.deltaFromPath();		
			this.deltaV.scale(this.normalSpeed);

		}


		var meleeContact = SAT.testCircleCircle(this.collider, player.collider)

		//got ya
		if(meleeContact){
			
			if(this.attackLagTimer == 0)
				this.attackLagTimer = this.attackLag;
			
			this.deltaV = new SAT.Vector();

			this.canAttack = true;
		}

		if(this.attack && this.attackTimer === 0){
			var toPlayerLength = Math.sqrt(Math.pow((player.collider.pos.x - this.collider.pos.x),2) + Math.pow((player.collider.pos.y - this.collider.pos.y),2));	
			
			if(toPlayerLength < meleeRange){
				playerAlive = false;
				playerInput = false;

				this.playerIsInRange = false;
				this.backToWaypoint = true;
				this.useWaypoints = false;
				this.attack = false;
				this.canAttack = false;
				this.attackTimer = this.attackCooldown;
			}
		}

		this.collisionCheck();
	
		//add deltaV/walk
		this.collider.pos.add(this.deltaV);

		this.forward.x = this.collider.pos.x + this.deltaV.x;
		this.forward.y = this.collider.pos.y + this.deltaV.y;

	}	


	//enemy death
	if(this.die)
		enemies.splice(id, 1);




	if(this.knockBackTimer > 0) this.knockBackTimer -= deltaTime;
	if(this.knockBackTimer < 0) this.knockBackTimer = 0;
	if(this.knockBackTimer === 0) this.isKnockBack = false;

	if(this.attackLagTimer > 0) this.attackLagTimer -= deltaTime;
	if(this.attackLagTimer < 0) this.attackLagTimer = 0;
	if(this.attackLagTimer === 0 && this.canAttack) this.attack = true;

	if(this.attackTimer > 0) this.attackTimer -= deltaTime;
	if(this.attackTimer < 0) this.attackTimer = 0;

	//console.log(this.state);

//lost player and back to last waypoint after losing player

//see player player -> set bool for follow to true
//when lost -> set bool for follow to false
//when lost -> path to cur waypoint

//##############################################################
//enemy combat melee first

};
Enemy.prototype.knockBack = function(response){

	if(!this.isKnockBack){
		response.overlapV.normalize();
		response.overlapV.scale(50);
		this.collider.pos.add(response.overlapV)
		this.knockBackTimer = 3.14;	
		this.isKnockBack = true;
		this.backToWaypoint = true;	
		this.attackTimer = 0;
		this.attackLagTimer = 0;
		this.attack = false;
		this.canAttack = false;
	}

};
Enemy.prototype.makePath = function(target){
	var pathEnd = pathfindingGraph.grid[target.x][target.y]
	var pathStart = pathfindingGraph.grid[this.toNodes.x][this.toNodes.y];
	this.path = astar.search(pathfindingGraph, pathStart, pathEnd, {
        closest: true,
    });

    this.curPath = 0;
};
Enemy.prototype.toNode = function(target){
	for(var a = 0; a < nSizeX; a++){			
		for(var b = 0; b < nSizeY; b++){
			var boxX = a * pathfindingNodesScale;
			var boxY = b * pathfindingNodesScale;
			if (boxX <= target.x && boxX + pathfindingNodesScale >= target.x &&
				boxY <= target.y && boxY + pathfindingNodesScale >= target.y) {

				return new SAT.Vector(a,b);
			}
		}
	}
};
Enemy.prototype.deltaFromPath = function(){

	if(this.path[this.curPath + 1] != undefined){

		
		var curEnemyXTemp = this.path[this.curPath].x * pathfindingNodesScale;
		var curEnemyYTemp = this.path[this.curPath].y * pathfindingNodesScale;

		var nextEnemyXTemp = this.path[this.curPath + 1].x * pathfindingNodesScale;
		var nextEnemyYTemp = this.path[this.curPath + 1].y * pathfindingNodesScale;

		var toCurLng = Math.sqrt(Math.pow((this.collider.pos.x - curEnemyXTemp),2) + Math.pow((this.collider.pos.y - curEnemyYTemp),2));
		var toNextLng = Math.sqrt(Math.pow((this.collider.pos.x - nextEnemyXTemp),2) + Math.pow((this.collider.pos.y - nextEnemyYTemp),2));

		
		var deltaX = (this.path[this.curPath + 1].x * pathfindingNodesScale + pathfindingNodesScale/2) - this.collider.pos.x;
		var deltaY = (this.path[this.curPath + 1].y * pathfindingNodesScale + pathfindingNodesScale/2) - this.collider.pos.y;
		
		if(toCurLng >= toNextLng)
			this.curPath++;	
		
		this.lastDeltaV = new SAT.Vector(deltaX, deltaY).normalize();
		return new SAT.Vector(deltaX, deltaY).normalize();

	}
	else{
		return this.lastDeltaV;
	}

};
Enemy.prototype.collisionCheck = function(){
	if(obstacles != null)
		for(var a = 0; a < obstacles.length; a++){

			var responseEnemy = new SAT.Response();
			var collideEnemy = SAT.testPolygonCircle(obstacles[a].toPolygon(), this.collider, responseEnemy)

			if(collideEnemy){

				collisonResponse(responseEnemy, this.collider, obstacles[a]);

			}		
		}
}
Enemy.prototype.draw = function(){
	
	if(this.path != null && gizomos)
		for(var a = 0; a < this.path.length; a++){
			ctx.fillStyle = "black"
			ctx.fillRect(this.path[a].x * pathfindingNodesScale - viewX, this.path[a].y * pathfindingNodesScale - viewY, pathfindingNodesScale, pathfindingNodesScale)
		}

	drawRotatedImg(this.img, 0, 0, 300, 250, this.collider.pos.x - viewX - 25, this.collider.pos.y - viewY - 25, 50, 50, this.angle);
	renderStrokeColliderCircle(this.collider, "red", viewX, viewY);

	ctx.fillStyle = "black"
	for(var a = 0; a < this.waypoints.length; a++){
		ctx.fillRect(this.waypoints[a].x - viewX, this.waypoints[a].y - viewY, 5,5);
	}

	//ctx.knockBackTimer

	if(this.toPlayerRadar != null)
		if(this.toPlayerCollision)
			renderStrokeColliderPolygon(this.toPlayerRadar, "yellow", viewX, viewY);
		else
			renderStrokeColliderPolygon(this.toPlayerRadar, "red", viewX, viewY);

	ctx.fillText(this.knockBackTimer, this.collider.pos.x - viewX, this.collider.pos.y - viewY);

		
}
function Door(x,y,width, height, angle, img){
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.collider = new SAT.Box(new SAT.Vector(x,y), width, height).toPolygon();
	this.isHeavy = true;
	this.img = img || null;
	this.timer = 0;

	this.tempAngle = 0;		

	this.len1 = 0;
	this.len2 = 0;

	this.move = false;
	this.fromPlayer = false;

	this.collider.rotate(0,0, angle)

	this.angle = 0;



}
Door.prototype.exist = function(deltaTime){

		var response = new SAT.Response();
		var collide = SAT.testPolygonCircle(this.collider, player.collider)
		if(collide){

			this.tempAngle = makeAngle(this.collider.pos.x, this.collider.pos.x - player.collider.pos.x, this.collider.pos.y, this.collider.pos.y - player.collider.pos.y);

			response.overlapV.scale(1.001)
			player.pos.add(response.overlapV);
			player.collider.pos.add(response.overlapV);

			var temp1X = this.collider.calcPoints[1].x + this.collider.pos.x
			var temp1Y = this.collider.calcPoints[1].y + this.collider.pos.y

			var temp2X = this.collider.calcPoints[2].x + this.collider.pos.x
			var temp2Y = this.collider.calcPoints[2].y + this.collider.pos.y

			this.len1 = Math.sqrt(Math.pow((player.collider.pos.x - temp1X),2) + Math.pow((player.collider.pos.y - temp1Y),2));
			this.len2 = Math.sqrt(Math.pow((player.collider.pos.x - temp2X),2) + Math.pow((player.collider.pos.y - temp2Y),2));		
			this.move = true;
			this.doorTimer = doorCooldown;
			this.fromPlayer = true;
		}
		else{
			this.move = false;
		}

		if(this.doorTimer > 0 || this.move){

			for(var a = 0; a < obstacles.length; a++){

				var col = SAT.testPolygonPolygon(this.collider, obstacles[a].toPolygon())	
				if(col){
					this.tempAngle = -this.tempAngle;
					if(this.len1 > this.len2){
						this.collider.rotate(0 - 5,0, (this.collider.angle + this.tempAngle) * deltaTime * this.doorTimer);
					}
					else{
						this.collider.rotate(0 - 5,0, (this.collider.angle - this.tempAngle) * deltaTime * this.doorTimer);
					}
				}
			}
		}

		for(var a = 0; a < enemies.length; a++){

			var responseE = new SAT.Response();
			var collideE = SAT.testPolygonCircle(this.collider, enemies[a].collider, responseE)
			if(collideE){

				if(this.fromPlayer)
					enemies[a].knockBack(responseE);

				this.tempAngle = makeAngle(this.collider.pos.x, this.collider.pos.x - enemies[a].collider.pos.x, this.collider.pos.y, this.collider.pos.y - enemies[a].collider.pos.y);

				responseE.overlapV.scale(1.001)
				enemies[a].collider.pos.add(responseE.overlapV);

				var temp1X = this.collider.calcPoints[1].x + this.collider.pos.x
				var temp1Y = this.collider.calcPoints[1].y + this.collider.pos.y

				var temp2X = this.collider.calcPoints[2].x + this.collider.pos.x
				var temp2Y = this.collider.calcPoints[2].y + this.collider.pos.y

				this.len1 = Math.sqrt(Math.pow((enemies[a].collider.pos.x - temp1X),2) + Math.pow((enemies[a].collider.pos.y - temp1Y),2));
				this.len2 = Math.sqrt(Math.pow((enemies[a].collider.pos.x - temp2X),2) + Math.pow((enemies[a].collider.pos.y - temp2Y),2));		
				this.move = true;
				this.doorTimer = doorCooldown
			}
			else 
				this.move = false;

			if(this.doorTimer > 0 || this.move){
				for(var b = 0; b < obstacles.length; b++){
					var responseD = new SAT.Response();
					var colllideD = SAT.testPolygonPolygon(this.collider, obstacles[b].toPolygon(), responseD)	
					if(colllideD){
						tempAngle = -tempAngle;
						if(this.len1 > this.len2)
							this.collider.rotate(0 - 5,0, (this.collider.angle + this.tempAngle) * deltaTime * this.doorTimer);
						else
							this.collider.rotate(0 - 5,0, (this.collider.angle - this.tempAngle) * deltaTime * this.doorTimer);
					}
				}
				
				if(this.len1 > this.len2)
					this.collider.rotate(0 - 5,0, (this.collider.angle + this.tempAngle) * deltaTime * 5 * this.doorTimer);
				else
					this.collider.rotate(0 - 5,0, (this.collider.angle - this.tempAngle) * deltaTime * 5 * this.doorTimer);
			}
			else{
				this.fromPlayer = false;
			}
		}
	

		if(this.doorTimer > 0) this.doorTimer -= deltaTime;
		if(this.doorTimer === 0){
			this.doorTimer = doorCooldown;
			
		} 

};
Door.prototype.draw = function(){
	renderStrokeColliderPolygon(this.collider, "red", viewX, viewY);
}
function levelRestart(){

	//player
	delete player;
	player = new Player(playerStartPos.x,playerStartPos.y);

	//enemies
	enemies = [];
	for(var a = 0; a < enemiesData.length; a++){
		enemies.push(new Enemy(enemiesData[a].img, enemiesData[a].startPos.x,enemiesData[a].startPos.y, enemiesData[a].radius, enemiesData[a].waypoints))
	}

	//doors
	doors = [];
	for(var a = 0; a < doorsData.length; a++){
		doors.push(new Door(doorsData[a].pos.x, doorsData[a].pos.y, doorsData[a].width, doorsData[a].height, doorsData[a].angle));
	}

	//bullets
	bullets = [];

	//is player alive?
	playerAlive = true;
	
	//can player control his character?
	playerInput = true;

}

//############ PATH NTOTES - 09.03.15 ################
//	- fixed path following
//	- better pathfinding - enemy don't stick to walls now
//	- better player death and better level restart
//	- better enemy melee attack
//	- fixed enemy knockback
//	- fixed enemy lost attention when I hide behind doors
//	- fixed enemy attack after knockback

//############ ROADMAP ################
//	- ability to kill enemies
//	- player melee
//	- level goal
//	- enemies guns
//	- level goal (you win after killing all enemies)
//	- better doors rotation math



//player have 2 weapons - left hand knife (left mouse button) and right hand pistol (right mouse button)
//2 types of enemies - melee and gun(may be 2 types - rifle and pistol?)
//
