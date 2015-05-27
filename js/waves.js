function Wave(difficulty)
{
	this.difficulty = difficulty;
	this.enemies = [];

	this.spawns = [
		new SAT.Vector(2530, 2435),
		new SAT.Vector(4112, 827),
		new SAT.Vector(5197, 1818),
		new SAT.Vector(5389, 3305),
		new SAT.Vector(4889, 4349),
		new SAT.Vector(2938, 5541),
		new SAT.Vector(2319, 2435),
		new SAT.Vector(2530, 4781),
		new SAT.Vector(274, 3731),
		new SAT.Vector(2214, 951),
		new SAT.Vector(1032, 1788),
		new SAT.Vector(690, 5487),
		new SAT.Vector(141, 168),
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

	ctx.save()
	//move to info GUI class
	ctx.font = "20px Pixel";
	ctx.textAlign = "center";
	ctx.fillText("Wave:" + (this.difficulty - 1), CANVASW/2,20);
	ctx.fillText("Enemies: " + this.enemies.length + " / " + (this.difficulty - 1), CANVASW/2, 40);
	ctx.fillText("Score: " + score.toFixed(3), CANVASW/2, 60);
	ctx.restore();
}