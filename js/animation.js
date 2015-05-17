/* global SAT */

function Animation (image, x, y, width, height, numberOfFrames, loop, updatePerFrame, scale)
{
	this.image = new Image();
	this.image.src = image;
	this.width = width;
	this.height = height;
	this.numberOfFrames = numberOfFrames || 1;
	this.frameIndex = 0;
	this.updateCount = 0;
	this.updatePerFrame = updatePerFrame || 0;
	this.loop = loop || false;	
	this.scale = scale;
	this.size = new SAT.Vector(this.width / this.numberOfFrames * this.scale, this.height * this.scale);
	this.pos = new SAT.Vector(x - this.size.x/2, y - this.size.y/2);
}

Animation.prototype.update = function(id)
{
	this.updateCount++;
	
	if(this.updateCount > this.updatePerFrame)
	{
		this.updateCount = 0;
		
		if(this.frameIndex <= this.numberOfFrames)
		{
			this.frameIndex++;
		}
		else if(this.loop)
		{
			this.frameIndex = 0;
		}
		else
		{
			animations.splice(id, 1);	
		}
	}
}

Animation.prototype.render = function()
{
	ctx.drawImage(
		this.image,
		this.frameIndex * this.width / this.numberOfFrames,
		0,
		this.width / this.numberOfFrames,
		this.height,
		this.pos.x - viewX,
		this.pos.y - viewY, 
		this.width / this.numberOfFrames * this.scale,
		this.height * this.scale
	);
}