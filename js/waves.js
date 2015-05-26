function Wave(difficulty)
{
	this.difficulty = difficulty;
	this.enemies = [];

	this.spawns = [
		new SAT.Vector(500,300),
		new SAT.Vector(1000,300),
		new SAT.Vector(500,800),
		new SAT.Vector(1000,800),
	];	
	this.enemiesCount = 0;
}

Wave.prototype.update = function(deltaTime)
{
	if(this.enemiesCount < this.difficulty - 1)
	{
		var abc = Math.floor(Math.random() * 2);
		var s = Math.floor(Math.random() * this.spawns.length);
		var hp = Math.floor(Math.random() * (1000 * this.difficulty/2)) + 100;
		var size = hp/enemiesSizeScale;
	
		if(size > 50) size = 50;
	
		this.enemies.push(new Enemy(enemiesTypes[abc], this.spawns[s].x, this.spawns[s].y, size, enemiesData[0].waypoints, hp));
		this.enemiesCount++;
	}
	
	for(var i = 0; i < this.enemies.length; i++) this.enemies[i].update(deltaTime, i);
}

Wave.prototype.render = function()
{	
	for(var a = 0; a < this.enemies.length; a++) this.enemies[a].render();

	//move to info GUI class
	ctx.font = "20px Pixel";
	ctx.fillText("Wave:" + (this.difficulty - 1), 0,20);
	ctx.fillText("Enemies: " + this.enemies.length + " / " + (this.difficulty - 1), 0, 40);
}