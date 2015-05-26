function ParticleSystem(globalLife, pos, particlesPerSecond, size, lifeTime, lifeTimeVariation, color, angle, angleVariation, speed, speedVariation, gravity)
{
	this.pos = pos;
	this.particlesPerSecond = particlesPerSecond;
	this.size = size;
	this.lifeTime = lifeTime;
	this.lifeTimeVariation = lifeTimeVariation;
	this.color = color;
	this.angle = angle;
	this.angleVariation = angleVariation;
	this.speed = speed;
	this.speedVariation = speedVariation;
	this.gravity = gravity;
	
	this.particles = [];
	this.stop = false;
	
	this.globalLife = globalLife;
	if(this.globalLife == 0)
	{
		this.loop = true;
	}
	else
	{
		this.loop = false;
	}
}

ParticleSystem.prototype.update = function(deltaTime, id)
{
	if(!this.stop)
	{
		var newParticlesCount = this.particlesPerSecond * deltaTime;
		for(var i = 0; i < newParticlesCount; i++)
		{
			var angle = this.angle + getRandFloatInRange(0, this.angleVariation);
			var offset = ((1 + i) / newParticlesCount * deltaTime);
			var speed = this.speed + 0 + getRandFloatInRange(0, this.speedVariation);
			var lifeTime = this.lifeTime + getRandFloatInRange(-this.lifeTimeVariation, this.lifeTimeVariation);
			this.particles.push(new Particle(this.pos.x, this.pos.y, speed, angle, this.gravity, lifeTime, this.color));
		}
		
		if(!this.loop)
		{
			this.globalLife -= deltaTime;
			if(this.globalLife < 0) this.stop = true;
		}
	}
	else if(this.particles.lenght == 0)
	{
		particleSystems.splice(id, 1);
	}
		
	
	for(var i = 0; i < this.particles.length; i++) this.particles[i].update(deltaTime, i);
}

ParticleSystem.prototype.render = function()
{
	for(var i = 0; i < this.particles.length; i++)
	{
		var pos = this.particles[i].pos;
		if(pos.x <= viewX + CANVASW && pos.x + this.size >= viewX &&
		   pos.y <= viewY + CANVASH && pos.y + this.size >= viewY)
		{
			ctx.fillStyle = "rgba(" + this.particles[i].color.r + "," + this.particles[i].color.g + "," + this.particles[i].color.b + "," + this.particles[i].transparency/this.particles[i].lifeTime + ")";
			ctx.fillRect(pos.x - viewX, pos.y - viewY, this.size, this.size);
		}
	}
}

function Particle(x, y, speed, angle, gravity, lifeTime, color)
{
	this.pos = new SAT.Vector(x,y);
	var tempX = Math.cos(angle) * speed;
	var tempY = Math.sin(angle) * speed;
	this.direction = new SAT.Vector(tempX, tempY);
	this.gravity = gravity;
	this.lifeTime = lifeTime;
	this.currentLife = 0;
	this.c = color;
	this.transparency = lifeTime;
	this.color = {
		r: 0,
		g: 0,
		b: 0,
	}
}

Particle.prototype.update = function(deltaTime, id)
{
	this.direction.x += this.gravity.x * deltaTime;
	this.direction.y += this.gravity.y * deltaTime;
	this.pos.x += this.direction.x * deltaTime;
	this.pos.y += this.direction.y * deltaTime;
    this.currentLife += deltaTime;
	this.transparency -= deltaTime;
	
	if(this.currentLife > this.lifeTime)
	{
		particleSystems[0].particles.splice(id, 1);
	}
	
	var time = this.currentLife/this.lifeTime;
	this.color.r = Math.round(lerp(this.c.start.r, this.c.end.r, time));
	this.color.g = Math.round(lerp(this.c.start.g, this.c.end.g, time));
	this.color.b = Math.round(lerp(this.c.start.b, this.c.end.b, time));
}