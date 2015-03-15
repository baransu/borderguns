function Enemy(type, x, y, radius, waypoints, exp){
	this.enemyType = type;

	this.radius = radius;
	this.speed = 4;
	this.collider = new SAT.Circle(new SAT.Vector(x,y), radius);
	this.isHeavy = false;
	this.angle = 0;
	this.waypoints = waypoints || null;
	this.deltaV = new SAT.Vector();
	this.curWay = 0;
	this.curPath = 0;
	this.forward = new SAT.Vector();
	this.radarLength = CANVASW/2;
	this.toPlayerRadar;
	this.toPlayerCollision = true;
	this.playerIsInRange = false;

	this.useWaypoints = true;

	this.waypointsToNode = null;
	this.toNodes = new SAT.Vector();
	this.path = null;

	this.lastPlayerPos = new SAT.Vector();
	this.lastPlayerPos = player.toNode();

	this.curWaypointToNode = new SAT.Vector();

	this.state = "created";

	this.lastDeltaV = new SAT.Vector();

	this.attackTimer = 0;
	this.attackCooldown = 1;

	this.die = false;

	this.maxHealth = 1000;
	this.health = 1000;

	this.healthPercentage = 1;

	this.exp = exp || 0;

};
Enemy.prototype.exist = function(deltaTime, id){

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
					else {
						this.playerIsInRange = true;
					}
				}
			}
		}
	}

	//follow player
	if(this.playerIsInRange){
		if(this.enemyType == "melee"){
			this.state = "follow player"
			this.useWaypoints = false;
			this.toNodes = this.toNode(this.collider.pos)

			this.lastPlayerPos = player.toNode();

			this.makePath(this.lastPlayerPos);

			this.deltaV = this.deltaFromPath();	
		}
	
	}

	/*
	//moving to player last pos
	if(!this.playerIsInRange && !this.useWaypoints){

		this.state = "moving to player last pos"

		var toPlayerLast = Math.sqrt(Math.pow(((this.lastPlayerPos.x * pathfindingNodesScale) - this.collider.pos.x),2) + Math.pow(((this.lastPlayerPos.y * pathfindingNodesScale) - this.collider.pos.y),2));	
	
		if(toPlayerLast <= toPointOffset)
			this.backToWaypoint = true;

		this.deltaV = this.deltaFromPath();	

	}
	*/

	var meleeContact = SAT.testCircleCircle(this.collider, player.collider)

	//got ya
	if(meleeContact){
		this.deltaV = new SAT.Vector();

		if(this.attackTimer === 0 && playerAlive){
			this.deltaV = new SAT.Vector();

			var dmg = 0
			var critChance = 15;
			dmg = 0 + rollDice(10, 10)
			dmg = Math.min(dmg, 0 + rollDice(10, 10))
			dmg = Math.max(dmg, 0 + rollDice(10, 10))
			if (random(100) < critChance){
			    dmg += 0 + rollDice(10, 10)
			}



			this.meleeDamage = dmg;
			player.health -= this.meleeDamage;
			bloodEffectTimer = bloodEffectDuration;

			this.attackTimer = this.attackCooldown;
		}
	}

	this.collisionCheck();

	this.deltaV.scale(this.speed);
	this.collider.pos.add(this.deltaV);

	this.forward.x = this.collider.pos.x + this.deltaV.x;
	this.forward.y = this.collider.pos.y + this.deltaV.y;


	//enemy death
	if(this.health <= 0){
		if(canLevel)
			player.exp += this.exp;
		
		enemies.splice(id, 1);
		
		console.log(player.exp);
	}

	//hp bar math
	this.healthPercentage = this.health/this.maxHealth;
	
	if(this.health < 0) this.health = 0;
	if(this.health > this.maxHealth) this.health = this.maxHealth;

	//TIMERS
	if(this.knockBackTimer > 0) this.knockBackTimer -= deltaTime;
	if(this.knockBackTimer < 0) this.knockBackTimer = 0;
	if(this.knockBackTimer === 0) this.isKnockBack = false;

	if(this.attackTimer > 0) this.attackTimer -= deltaTime;
	if(this.attackTimer < 0) this.attackTimer = 0;


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
	if(obstacles != null){

		for(var a = 0; a < obstacles.length; a++){

			var responseEnemy = new SAT.Response();
			var collideEnemy = SAT.testPolygonCircle(obstacles[a].toPolygon(), this.collider, responseEnemy)

			if(collideEnemy){

				collisonResponse(responseEnemy, this.collider, obstacles[a]);

			}		
		}
	}
}
Enemy.prototype.draw = function(){
	
	if(this.path != null && gizomos)
		for(var a = 0; a < this.path.length; a++){
			ctx.fillStyle = "black"
			ctx.fillRect(this.path[a].x * pathfindingNodesScale - viewX, this.path[a].y * pathfindingNodesScale - viewY, pathfindingNodesScale, pathfindingNodesScale)
		}

	renderStrokeColliderCircle(this.collider, "yellow", viewX, viewY);

	if(gizomos){		
		ctx.fillStyle = "black"
		for(var a = 0; a < this.waypoints.length; a++){
			ctx.fillRect(this.waypoints[a].x - viewX, this.waypoints[a].y - viewY, 5,5);
		}
	}

	//hp bar
	ctx.lineWidth = 2; 
	ctx.strokeStyle = "white";
	ctx.strokeRect(this.collider.pos.x - 100/2 - viewX, this.collider.pos.y - this.radius - 15*2 - viewY, 100, 15)
	ctx.fillStyle = "red";
	ctx.fillRect(this.collider.pos.x - 100/2  - viewX, this.collider.pos.y - this.radius - 15*2 - viewY, 100 * this.healthPercentage, 15)

		
}