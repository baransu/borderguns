function Wave(id, level){
	this.id = id;
	this.level = level;
}

Wave.prototype.init = function(){
	
	var spawns = [
		new SAT.Vector(500,300),
		new SAT.Vector(1000,300),
		new SAT.Vector(500,800),
		new SAT.Vector(1000,800),
	];
	
	
	for(var a = 0; a < this.level; a++){
		var abc = Math.floor(Math.random() * 2)
		var s = Math.floor(Math.random() * spawns.length);
		enemies.push(new Enemy(enemiesTypes[abc], spawns[s].x, spawns[s].y, enemiesData[0].radius, enemiesData[0].waypoints, enemiesData[0].exp))
	}
	
}
Wave.prototype.draw = function(){
	ctx.font = "20px Pixel";
	ctx.fillText("Wave:" + this.level, 0,20);
	ctx.fillText("Enemies: " + enemies.length + " / " + this.level, 0, 40);

}

