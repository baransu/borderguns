function Map(canvas, ctx)
{
	this.canvas = canvas;
	this.canvas.height = this.canvas.width;
	this.ctx = ctx;
	this.MAPW = this.canvas.width;
	this.MAPH = this.canvas.height;
}

Map.prototype.update = function()
{
	
}

Map.prototype.render = function()
{
	this.ctx.clearRect(0, 0, this.MAPW, this.MAPH);
	
	//minimap render
	this.ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
	this.ctx.fillRect(0, 0, this.MAPW, this.MAPH);
	
	this.ctx.lineWidth = 5;
	this.ctx.strokeStyle = "black";
	this.ctx.strokeRect(0, 0, this.MAPW, this.MAPH);
	
	var scale = levelWidth/this.MAPW;
	
	for(var i = 0; i < level.bullets.length; i++)
	{
		this.ctx.beginPath();
		this.ctx.arc(level.bullets[i].collider.pos.x/scale, level.bullets[i].collider.pos.y/scale, level.bullets[i].collider.r/scale * 2, 0, 2 * Math.PI, false);
		
		if(level.bullets[i].fromPlayer)
			this.ctx.fillStyle = "black";		
		else			
			this.ctx.fillStyle = "brown";
					
		this.ctx.fill();
	}
	
	
	for(var i = 0; i < level.obstacles.length; i++)
	{
		this.ctx.fillStyle = "black";
		this.ctx.fillRect(level.obstacles[i].pos.x/scale, level.obstacles[i].pos.y/scale, level.obstacles[i].w/scale, level.obstacles[i].h/scale);
	}	
	
	for(var i = 0; i < level.wave.enemies.length; i++)
	{
		this.ctx.beginPath();
		this.ctx.arc(level.wave.enemies[i].collider.pos.x/scale, level.wave.enemies[i].collider.pos.y/scale, level.wave.enemies[i].collider.r/scale * 3, 0, 2 * Math.PI, false);
		
		if(level.wave.enemies[i].enemyType == "melee")
			this.ctx.fillStyle = "red";
		else
			this.ctx.fillStyle = "orange";
			
		this.ctx.fill();
	}
	
	this.ctx.beginPath();
	this.ctx.arc(player.collider.pos.x/scale, player.collider.pos.y/scale, player.collider.r/scale * 3, 0, 2 * Math.PI, false);

	this.ctx.fillStyle = "green";		
	this.ctx.fill();
	
}
//ctx.beginPath();
//ctx.arc(collider.pos.x, collider.pos.y, collider.r, 0, 2 * Math.PI, false);
//ctx.strokeStyle = "black";
//ctx.lineWidth = 5;
//ctx.stroke();
//ctx.fillStyle = color;
//ctx.fill();