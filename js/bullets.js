function Bullet(crit, dmg, img, x, y, radius, speed, deltaV){
	this.radius = radius || 1;
	this.speed = speed || 1;
	this.deltaV = deltaV || new SAT.Vector();
	this.img = img;
	this.collider = new SAT.Circle(new SAT.Vector(x,y), radius);
	this.angle = makeAngle(this.collider.pos.x, this.collider.pos.x + this.deltaV.x, this.collider.pos.y, this.collider.pos.y + this.deltaV.y);
	this.damage = dmg;
	this.crit = crit;

};
Bullet.prototype.exist = function(deltaTime, id){
	
	this.collider.pos.x += this.deltaV.x * this.speed * deltaTime;
	this.collider.pos.y += this.deltaV.y * this.speed * deltaTime;
	
	for(var a = 0; a < enemies.length; a++){

		var col = SAT.testCircleCircle(enemies[a].collider, this.collider);
		
		if(col){
			enemies[a].health -= this.damage;
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
			dmgText.push(new FloatingText(enemies[a].collider.pos.x, enemies[a].collider.pos.y, this.damage, this.crit, mainColor, outlineColor))
			bullets.splice(id, 1);
			break;
		}
	}

	for(var a = 0; a < obstacles.length; a++){

		var col = SAT.testPolygonCircle(obstacles[a].toPolygon(), this.collider);
		
		if(col){
			bullets.splice(id, 1);
			break;
		}
	}

	if(this.collider.pos.x < 0 || this.collider.pos.y < 0 || this.collider.pos.x > 2000 || this.collider.pos.y > 2000){
		bullets.splice(id, 1);
		return;
	}
};
Bullet.prototype.draw = function(){
	drawRotatedImg(this.img, 0, 0, 300, 250, this.collider.pos.x - viewX, this.collider.pos.y - viewY, 10, 10, this.angle);
};