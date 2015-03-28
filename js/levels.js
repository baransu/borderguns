function Level(){
	this.id = 0;
	this.numOfWaves = 5;
	this.waveDif = 1;
	this.wave = null;
	this.obstacles = [];
	this.bullets = [];

	this.init = function(){
		//obstacles add
		this.obstacles = obstacles;
		this.wave = new Wave(1);
	};

	this.init();

};
Level.prototype.update = function(deltaTime){	

	//checking player collision - move to player class?
	for(var a = 1; a < this.obstacles.length; a++){

		var response = new SAT.Response();
		var col = SAT.testPolygonCircle(this.obstacles[a].toPolygon(), player.collider, response)

		if(col){

			collisonResponse(response, player, this.obstacles[a]);
			player.pos.x = player.collider.pos.x;
			player.pos.y = player.collider.pos.y;

		} else {

			player.collider.pos.x = player.pos.x;
			player.collider.pos.y = player.pos.y;
			
		}			
	}

	//bullets update
	for(var a = 0; a < this.bullets.length; a++){
		this.bullets[a].update(deltaTime, a);
	}

	//waves update
	if(this.wave.enemies.length == 0){
		gun.richocetCount++;
		player.health = player.maxHealth;
		this.waveDif += 1;
		this.wave = null;
		this.wave = new Wave(this.waveDif);
	}

	this.wave.update(deltaTime);

	//add player update

};
Level.prototype.draw = function(){

	//bullets draw
	for(var a = 0; a < this.bullets.length; a++){
		this.bullets[a].draw()
	}
	
	//obstacles draw
	for(var a = 1; a < this.obstacles.length; a++){

		renderStrokeColliderBox(a, this.obstacles[a], "black", viewX, viewY);
	
	}

	//waves draw - mainly enemies
	this.wave.draw();
	
	//multishot bullets
	for(var a = 0; a < this.bullets.length; a++){
		this.bullets[a].multishotDraw();
	}

};
