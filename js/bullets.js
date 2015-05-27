function Bullet(type, richocet, crit, dmg, img, x, y, radius, speed, deltaV, thisFromPlayer, player)
{
	this.radius = radius || 1;
	this.speed = speed || 1;
	this.deltaV = deltaV || new SAT.Vector();
	this.img = img;
	this.collider = new SAT.Circle(new SAT.Vector(x,y), radius);
	this.angle = makeAngle(this.collider.pos.x, this.collider.pos.x + this.deltaV.x, this.collider.pos.y, this.collider.pos.y + this.deltaV.y);
	this.damage = dmg;
	this.crit = crit;
	this.fromPlayer = thisFromPlayer;
	this.angle -= Math.PI/2;
	this.richocetTimes = richocet;
	this.lastPos = new SAT.Vector();

	this.nearTarget = false;
	this.rotationAngle = 0;

	this.type = type;

	this.target = player || null;
	this.freeFloat = false;

}

Bullet.prototype.update = function(deltaTime, id)
{	
	//only for player
	if(this.type == "multishot"){
		var toTarget = Math.sqrt(Math.pow(mouse.x + viewX - this.collider.pos.x,2) + Math.pow(mouse.y + viewY - this.collider.pos.y,2));		

		if(!mouseLeftPressed && !this.freeFloat)
		{
			this.deltaV = new SAT.Vector(this.collider.pos.x - (mouse.x + viewX), this.collider.pos.y - (mouse.y + viewY));
			this.deltaV.normalize();

			this.freeFloat = true;
		}

		if(this.freeFloat)
		{
			this.collider.pos.x += this.deltaV.x * this.speed * deltaTime;
			this.collider.pos.y += this.deltaV.y * this.speed * deltaTime;
		}			
		else
		{
			this.freeFloat = false;

			if(toTarget >= 40){
				this.deltaV = new SAT.Vector(50, 0);

				var angle1 = makeAngle(this.collider.pos.x, mouse.x + viewX, this.collider.pos.y, mouse.y + viewY);

				if (angle1 < 0)
					angle1 = angle1 + Math.PI*2;

				this.deltaV.rotate(angle1)
				this.deltaV.normalize();

				this.collider.pos.x += this.deltaV.x * this.speed * deltaTime;
				this.collider.pos.y += this.deltaV.y * this.speed * deltaTime;
			} 
			else
			{
				this.rotationAngle += Math.PI/30;
				this.collider.pos.x = (mouse.x + viewX) + Math.cos(this.rotationAngle) * 25;
				this.collider.pos.y = (mouse.y + viewY) + Math.sin(this.rotationAngle) * 25;
			}
		}
	}

	if(this.type == "simple" || this.type == "shotgun")
	{
		this.freeFloat = true;

		this.collider.pos.x += this.deltaV.x * this.speed * deltaTime;
		this.collider.pos.y += this.deltaV.y * this.speed * deltaTime;

		//for enemies
		if(!this.fromPlayer)
		{
			var col = SAT.testCircleCircle(player.collider, this.collider);
			if(col)
			{
				player.applyDamage(this.damage);

				var mainColor = {
					r: 255,
					g: 255,
					b: 255,
				};
				var outlineColor = {
					r: 0,
					g: 0,
					b: 0,
				};
				dmgText.push(new FloatingText(player.collider.pos.x, player.collider.pos.y, this.damage, this.crit, mainColor, outlineColor))
				bloodEffectTimer = bloodEffectDuration;
				level.bullets.splice(id, 1);
			}		
		}		
	}

	//richochets
	if(this.freeFloat)
	{
		for(var a = 0; a < level.obstacles.length; a++){

			var response = new SAT.Response();
			var col = SAT.testPolygonCircle(level.obstacles[a].toPolygon(), this.collider, response);
			
			if(col){	
						
				collisonResponse(response, this.collider, level.obstacles[a]);
				var dir = 0;

				//left
				if(this.collider.pos.x <= level.obstacles[a].pos.x && this.collider.pos.y >= level.obstacles[a].pos.y && this.collider.pos.y <= level.obstacles[a].pos.y + level.obstacles[a].h)
				{
					this.deltaV.x *= -1;
					dir = Math.PI;					
				}
				//top
				if(this.collider.pos.y <= level.obstacles[a].pos.y && this.collider.pos.x >= level.obstacles[a].pos.x && this.collider.pos.x <= level.obstacles[a].pos.x + level.obstacles[a].w)
				{
					this.deltaV.y *= -1;
					dir = -Math.PI/2;
				}
				//right
				if(this.collider.pos.x >= level.obstacles[a].pos.x + level.obstacles[a].w && this.collider.pos.y >= level.obstacles[a].pos.y && this.collider.pos.y <= level.obstacles[a].pos.y + level.obstacles[a].h)
				{
					this.deltaV.x *= -1;
					dir = 0;
				}
				//down
				if(this.collider.pos.y >= level.obstacles[a].pos.y + level.obstacles[a].h && this.collider.pos.x >= level.obstacles[a].pos.x && this.collider.pos.x <= level.obstacles[a].pos.x + level.obstacles[a].w)
				{
					this.deltaV.y *= -1;
					dir = Math.PI/2;
				}
			
				var color;
				if(this.fromPlayer)
				{
					color = playerHitParticlesColor;
				}
				else
				{
					color = enemyHitParticlesColor;
				}
				
				var pos = this.collider.pos;
				if(pos.x <= viewX + CANVASW && pos.x + this.collider.r >= viewX &&
				   pos.y <= viewY + CANVASH && pos.y + this.collider.r >= viewY)
				{
					var p = new SAT.Vector(this.collider.pos.x, this.collider.pos.y);
					var gravity = new SAT.Vector(0, 9);	
					particleSystems.push(new ParticleSystem(0.1, p, 10, 5, .1, 0, color, dir, Math.PI/2, 100, 100, gravity));
					//ParticleSystem(                       gL,   p, pPS, s, life, lifeRng, col,    air, adirRng, speed, speedRng, gravity)
				}
				this.richocetTimes--;
				break;
			}	
		}		
	}

	if(this.richocetTimes < 0)
	{
		if(this.fromPlayer)
			score += 0.001;
			
		level.bullets.splice(id, 1);
	}

	this.lastPos = new SAT.Vector(this.collider.pos.x, this.collider.pos.y);

	if(this.freeFloat)
	{		
		for(var a = 0; a < level.wave.enemies.length; a++)
		{
			var col = SAT.testCircleCircle(level.wave.enemies[a].collider, this.collider);
			
			if(col && player.playerAlive)
			{
				if(this.fromPlayer)
				{
					//moving it to bullets variable and based on damage type 
					var mainColor = {
						r: 255,
						g: 255,
						b: 255,
					};
					var outlineColor = {
						r: 0,
						g: 0,
						b: 0,
					};

					dmgText.push(new FloatingText(level.wave.enemies[a].collider.pos.x, level.wave.enemies[a].collider.pos.y, this.damage, this.crit, mainColor, outlineColor))
					level.wave.enemies[a].applyDamage(this.damage);
					if(this.fromPlayer)
						score += 0.001;
					level.bullets.splice(id, 1);
				}

				level.bullets.splice(id, 1);
				break;
			}
		}
	}

	if(this.collider.pos.x < -CANVASW || this.collider.pos.y < -CANVASH || this.collider.pos.x > levelWidth + CANVASW || this.collider.pos.y > levelHeight + CANVASH)
	{
		level.bullets.splice(id, 1);
	}	
}

Bullet.prototype.render = function()
{
	var pos = this.collider.pos;
	if(pos.x <= viewX + CANVASW && pos.x + this.collider.r >= viewX &&
	   pos.y <= viewY + CANVASH && pos.y + this.collider.r >= viewY &&
	   this.freeFloat)
	{
		ctx.save();
		
		if(this.fromPlayer)
		{
			ctx.fillStyle = "green";
			ctx.shadowColor = 'rgba(0, 255, 0, 0.7)';	
		}
		else
		{
			ctx.fillStyle = "orange";
			ctx.shadowColor = 'rgba(255, 204, 0, 0.7)';				
		} 
			
		ctx.shadowBlur = 15;
		ctx.beginPath();
		ctx.arc(this.collider.pos.x - viewX, this.collider.pos.y - viewY, this.collider.r, 0, 2 * Math.PI, false); // Draws a circle
		ctx.fill();		
		ctx.restore();
	}		   
}

Bullet.prototype.multishotDraw = function()
{
	if(!this.freeFloat)
	{
		ctx.save();
		
		if(this.fromPlayer)
		{
			ctx.fillStyle = "red";
			ctx.shadowColor = 'rgba(255, 0, 0, 0.7)';	
		}
		else
		{
			ctx.fillStyle = "orange";
			ctx.shadowColor = 'rgba(255, 204, 0, 0.7)';				
		} 
			
		ctx.shadowBlur = 15;
		ctx.beginPath();
		ctx.arc(this.collider.pos.x - viewX, this.collider.pos.y - viewY, this.collider.r, 0, 2 * Math.PI, false); // Draws a circle
		ctx.fill();		
		ctx.restore();
	}
}