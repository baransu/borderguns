function Wave(difficulty){
	this.difficulty = difficulty;
	this.enemies = [];

	//init function
	this.init = function(){
		var spawns = [
			new SAT.Vector(500,300),
			new SAT.Vector(1000,300),
			new SAT.Vector(500,800),
			new SAT.Vector(1000,800),
		];	
	
		for(var a = 0; a < this.difficulty; a++){
			var abc = Math.floor(Math.random() * 2)
			var s = Math.floor(Math.random() * spawns.length);
			var hp = Math.floor(Math.random() * (1000 * this.difficulty/2)) + 100
			var size = hp/enemiesSizeScale;

			if(size > 50)
				size = 50;

			this.enemies.push(new Enemy(enemiesTypes[abc], spawns[s].x, spawns[s].y, size, enemiesData[0].waypoints, hp))
		}
	};

	this.init();
}
Wave.prototype.update = function(deltaTime){

	//enemies update
	for(var a = 0; a < this.enemies.length; a++){
		this.enemies[a].update(deltaTime, a);
	}

};
Wave.prototype.draw = function(){
	
	//enemies draw
	for(var a = 0; a < this.enemies.length; a++){
		this.enemies[a].draw();
	}

	//move to info GUI class
	ctx.font = "20px Pixel";
	ctx.fillText("Wave:" + this.difficulty, 0,20);
	ctx.fillText("Enemies: " + this.enemies.length + " / " + this.difficulty, 0, 40);

}

