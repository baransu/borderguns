function Player(x,y,width,height){
	this.pos = new SAT.Vector(x,y);
	this.width = 64;
	this.height = 64;
	this.collider = new SAT.Circle(this.pos, (this.width * Math.sqrt(2))/2);
	this.idHeavy = false;
	this.toNodes = new SAT.Vector();

	this.maxHealth = 1000;
	this.health = 1000;

};
Player.prototype.toNode = function(){
	for(var a = 0; a < nSizeX; a++){			
		for(var b = 0; b < nSizeY; b++){
			var boxX = a * pathfindingNodesScale;
			var boxY = b * pathfindingNodesScale;
			if (boxX <= this.collider.pos.x && boxX + pathfindingNodesScale >= this.collider.pos.x &&
				boxY <= this.collider.pos.y && boxY + pathfindingNodesScale >= this.collider.pos.y) {

				this.toNodes = new SAT.Vector(a,b);
			}
		}
	}
	return this.toNodes;
};
Player.prototype.die = function(){
	playerInput = false;
	playerAlive = false;

};