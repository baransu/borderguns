function Bullet(type, richocet, crit, dmg, img, x, y, radius, speed, deltaV, thisFromPlayer, player){
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

};
Bullet.prototype.exist = function(deltaTime, id){
	
	//only for player
	if(this.type == "multishoot"){
		var toTarget = Math.sqrt(Math.pow(mouse.x + viewX - this.collider.pos.x,2) + Math.pow(mouse.y + viewY - this.collider.pos.y,2));		

		if(!mouseLeftPressed){

			this.deltaV = new SAT.Vector(this.collider.pos.x - (mouse.x + viewX), this.collider.pos.y - (mouse.y + viewY));
			this.deltaV.normalize();

			this.collider.pos.x += this.deltaV.x * this.speed * deltaTime;
			this.collider.pos.y += this.deltaV.y * this.speed * deltaTime;
		}
		else {
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
			else {
				this.rotationAngle += 0.02;
				this.collider.pos.x = (mouse.x + viewX) + Math.cos(this.rotationAngle) * 25;
				this.collider.pos.y = (mouse.y + viewY) + Math.sin(this.rotationAngle) * 25;
			}
		}
	}

	if(this.type == "simple" || this.type == "shotgun"){

		this.collider.pos.x += this.deltaV.x * this.speed * deltaTime;
		this.collider.pos.y += this.deltaV.y * this.speed * deltaTime;

		//for enemies
		if(!this.fromPlayer){
			
			var col = SAT.testCircleCircle(player.collider, this.collider)
			if(col){
				player.health -= this.damage;
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
				bullets.splice(id, 1);
			}		
		}

		//richochets
		for(var a = 0; a < obstacles.length; a++){

			if(this.collider.pos.x <= obstacles[a].pos.x + obstacles[a].w && this.collider.pos.x >= obstacles[a].pos.x &&
			   this.collider.pos.y <= obstacles[a].pos.y + obstacles[a].h && this.collider.pos.y >= obstacles[a].pos.y){

				//left
				if(this.lastPos.x <= obstacles[a].pos.x && this.lastPos.y >= obstacles[a].pos.y && this.lastPos.y <= obstacles[a].pos.y + obstacles[a].h){
					this.deltaV.x *= -1;
				}
				//top
				if(this.lastPos.y <= obstacles[a].pos.y && this.lastPos.x >= obstacles[a].pos.x && this.lastPos.x <= obstacles[a].pos.x + obstacles[a].w){
					this.deltaV.y *= -1;
				}
				//right
				if(this.lastPos.x >= obstacles[a].pos.x + obstacles[a].w && this.lastPos.y >= obstacles[a].pos.y && this.lastPos.y <= obstacles[a].pos.y + obstacles[a].h){
					this.deltaV.x *= -1;
				}
				//down
				if(this.lastPos.y >= obstacles[a].pos.y + obstacles[a].h && this.lastPos.x >= obstacles[a].pos.x && this.lastPos.x <= obstacles[a].pos.x + obstacles[a].w){
					this.deltaV.y *= -1;
				}

				this.richocetTimes--;
				break;
			}	
		}

		if(this.richocetTimes < 0){
			bullets.splice(id, 1);
		}

		this.lastPos = new SAT.Vector(this.collider.pos.x, this.collider.pos.y);
	}

	for(var a = 0; a < enemies.length; a++){

		var col = SAT.testCircleCircle(enemies[a].collider, this.collider);
		
		if(col && playerAlive){
			if(this.fromPlayer){
				bullets.splice(id, 1);
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

	if(this.collider.pos.x < 0 || this.collider.pos.y < 0 || this.collider.pos.x > 2000 || this.collider.pos.y > 2000){
		bullets.splice(id, 1);
	}

	

};
Bullet.prototype.draw = function(){
	//drawRotatedImg(this.img, 0, 0, 32, 32, this.collider.pos.x - viewX - 16, this.collider.pos.y - viewY - 16, 32, 32, this.angle);
	if(this.fromPlayer)
		renderStrokeColliderCircle(this.collider, "red", viewX, viewY);
	else
		renderStrokeColliderCircle(this.collider, "yellow", viewX, viewY);
};
Bullet.prototype.obstacleCollide = function(){

};