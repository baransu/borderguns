function Bullet(crit, dmg, img, x, y, radius, speed, deltaV, thisFromPlayer){
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
	this.lifetime = 25;
	this.decreaseLife = false;
	this.calcPos = true;
	this.lastPos = new SAT.Vector();

};
Bullet.prototype.exist = function(deltaTime, id){
	

	for(var a = 0; a < enemies.length; a++){

		var col = SAT.testCircleCircle(enemies[a].collider, this.collider);
		
		if(col){
			if(this.fromPlayer){
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
				
			}

			bullets.splice(id, 1);
			break;
		}
	}

	for(var a = 0; a < obstacles.length; a++){


		
		//if(col){
		if(this.collider.pos.x <= obstacles[a].pos.x + obstacles[a].w && this.collider.pos.x >= obstacles[a].pos.x &&
		   this.collider.pos.y <= obstacles[a].pos.y + obstacles[a].h && this.collider.pos.y >= obstacles[a].pos.y){

			var toLeftTop = Math.sqrt(Math.pow(this.lastPos.x - obstacles[a].pos.x,2) + Math.pow(this.lastPos.y - obstacles[a].pos.y,2));
			var toRigthTop = Math.sqrt(Math.pow(this.lastPos.x - (obstacles[a].pos.x + obstacles[a].w),2) + Math.pow(this.lastPos.y - obstacles[a].pos.y,2));
			var toRightDown = Math.sqrt(Math.pow(this.lastPos.x - (obstacles[a].pos.x + obstacles[a].w),2) + Math.pow(this.lastPos.y - (obstacles[a].pos.y + obstacles[a].h),2));
			var toLeftDown = Math.sqrt(Math.pow(this.lastPos.x - obstacles[a].pos.x,2) + Math.pow(this.lastPos.y - (obstacles[a].pos.y + obstacles[a].h),2));

			var angle1 = makeAngle(obstacles[a].pos.x, this.lastPos.x, obstacles[a].pos.y, this.lastPos.y);
			var angle2 = makeAngle(obstacles[a].pos.x, obstacles[a].pos.x + obstacles[a].w, obstacles[a].pos.y,obstacles[a].pos.y + obstacles[a].h);
			

			//left
			if(this.lastPos.x <= obstacles[a].pos.x && this.lastPos.y >= obstacles[a].pos.y && this.lastPos.y <= obstacles[a].pos.y + obstacles[a].h){
				//console.log("left");
				this.deltaV.x *= -1;
			}
			//top
			if(this.lastPos.y <= obstacles[a].pos.y && this.lastPos.x >= obstacles[a].pos.x && this.lastPos.x <= obstacles[a].pos.x + obstacles[a].w){
				//console.log("top");
				this.deltaV.y *= -1;
			}
			//right
			if(this.lastPos.x >= obstacles[a].pos.x + obstacles[a].w && this.lastPos.y >= obstacles[a].pos.y && this.lastPos.y <= obstacles[a].pos.y + obstacles[a].h){
				//console.log("right");
				this.deltaV.x *= -1;
			}
			//down
			if(this.lastPos.y >= obstacles[a].pos.y + obstacles[a].h && this.lastPos.x >= obstacles[a].pos.x && this.lastPos.x <= obstacles[a].pos.x + obstacles[a].w){
				//console.log("down");
				this.deltaV.y *= -1;
			}

			this.decreaseLife = true;
			/*
			if(angle1 > 0){
				this.deltaV.y *= -1;
				//console.log("top");
				this.collider.pos.y = obstacles[a].pos.y - this.radius;
				
			}
			if(angle1 < -Math.PI/2){
				this.deltaV.x *= -1;
				//console.log("left");
				this.collider.pos.x = obstacles[a].pos.x - this.radius;
				
			}
			if(angle2 < angle1 && angle1 < 0){
				this.deltaV.x *= -1;
				//console.log("right");
				this.collider.pos.x = obstacles[a].pos.x + obstacles[a].w + this.radius;
				
			}
			if(angle1 < angle2 && angle1 > -Math.PI/2){
				this.deltaV.y *= -1;
				//console.log("down");
				this.collider.pos.y = obstacles[a].pos.y + obstacles[a].h + this.radius;
			}

			/*
			//rigth
			if(toLeftTop < toRigthTop && toLeftDown < toRightDown){
				console.log("right", a)
				
			}
			//left
			else if(toRigthTop < toLeftTop && toRightDown < toLeftDown) {
				console.log("left", a)
				
			}
			//top
			else if(toLeftTop < toLeftDown && toRigthTop < toRightDown){
				console.log("top", a)
				
			}
			//down
			else if(toLeftDown < toLeftTop && toRightDown < toRigthTop){
				console.log("down", a)
				
			}
			*/
			//console.log(toLeftTop, toRigthTop, toRightDown, toLeftDown)

			//this.calcPos = true;
		}

		

			

		//console.log(this.deltaV.y);
		//this.decreaseLife = true;
		//break;
		//}
	}

	if(this.decreaseLife){
		this.lifetime -= deltaTime;

		if(this.lifetime < 0)
			bullets.splice(id, 1);
	}

	if(this.collider.pos.x < 0 || this.collider.pos.y < 0 || this.collider.pos.x > 2000 || this.collider.pos.y > 2000){
		bullets.splice(id, 1);
		return;
	}

	this.lastPos = new SAT.Vector(this.collider.pos.x, this.collider.pos.y);
	this.calcPos = false;

	this.collider.pos.x += this.deltaV.x * this.speed * deltaTime;
	this.collider.pos.y += this.deltaV.y * this.speed * deltaTime;

};
Bullet.prototype.draw = function(){
	drawRotatedImg(this.img, 0, 0, 32, 32, this.collider.pos.x - viewX - 16, this.collider.pos.y - viewY - 16, 32, 32, this.angle);
	//renderStrokeColliderCircle(this.collider, "pink", viewX, viewY);
};