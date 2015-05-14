function Player(x,y,width,height)
{
	this.width = 64;
	this.height = 64;
	this.pos = new SAT.Vector(x - this.width/2, y - this.height/2);
	this.playerStartPos = new SAT.Vector();	
	
	this.collider = new SAT.Circle(this.pos, (this.width/2) * Math.sqrt(2));	
	this.idHeavy = false;
	this.toNodes = new SAT.Vector();

	this.maxHealth = 1000;
	this.health = 1000;
	this.playerHealthPercentage = 100;

	this.playerInput = true;
	this.playerAlive = true;
}

Player.prototype.update = function(deltaTime)
{
	//hp
	this.playerHealthPercentage = this.health/this.maxHealth;

	mouseToPlayerAngle = makeAngle(CANVASW/2, mouse.x, CANVASH/2, mouse.y);

	//calculation crosshair position
	if(useGamepad )
	{
		if(rightX > gamepadRightOffset || rightX < -gamepadRightOffset || rightY > gamepadRightOffset || rightY < -gamepadRightOffset)
		{
			var crosshairAngle = makeAngle(CANVASW/2, CANVASW/2 + rightX, CANVASH/2, CANVASH/2 + rightY);
		}
		else
		{
			var crosshairAngle = makeAngle(CANVASW/2, CANVASW/2 + leftX, CANVASH/2, CANVASH/2 + leftY);
		}
		
		var tempX = CANVASW/2 + Math.cos(crosshairAngle) * 250;
		var tempY = CANVASH/2 + Math.sin(crosshairAngle) * 250;
		crosshairPosition = new SAT.Vector(tempX, tempY);
	}
	else
	{
		crosshairPosition = new SAT.Vector(mouse.x, mouse.y);
	}


	//gamepad shooting
	if(useGamepad && rightTrigger.pressed === true && bulletTimer === 0 && playerInput)
	{
		var temp = new SAT.Vector();

		if(rightX > gamepadRightOffset || rightX < -gamepadRightOffset || rightY > gamepadRightOffset || rightY < -gamepadRightOffset)
		{
			temp = new SAT.Vector(rightX, rightY);
		}
		else
			temp = playerForward;

		temp.normalize();
		shootBullet(this.collider.pos, temp);
	}

	//mouse shooting
	if(mouseLeftPressed && bulletTimer === 0 && this.playerInput)
	{
		var temp = new SAT.Vector((mouse.x - CANVASW/2), (mouse.y - CANVASH/2));
		temp.normalize();

		shootBullet(this.collider.pos, temp);
	}

	//hp check
	if(this.health < 0) this.health = 0;
	if(this.health > this.maxHealth) this.health = this.maxHealth;
	if(this.health == 0) this.die();

}

Player.prototype.draw = function()
{
	drawRotatedImg(character, 0, 0, 128, 128, CANVASW/2 - 128/2, CANVASH/2 - 128/2, 128, 128, mouseToPlayerAngle);
	renderStrokeColliderCircle(this.collider, "green", viewX, viewY);
	//renderStrokeColliderBox(player)
}

Player.prototype.toNode = function()
{
	for(var a = 0; a < nSizeX; a++)
	{			
		for(var b = 0; b < nSizeY; b++)
		{
			var boxX = a * pathfindingNodesScale;
			var boxY = b * pathfindingNodesScale;
			if (boxX <= this.collider.pos.x && boxX + pathfindingNodesScale >= this.collider.pos.x &&
				boxY <= this.collider.pos.y && boxY + pathfindingNodesScale >= this.collider.pos.y)
			{
				this.toNodes = new SAT.Vector(a,b);
			}
		}
	}
	return this.toNodes;
}

Player.prototype.die = function()
{
	this.playerInput = false;
	this.playerAlive = false;
}