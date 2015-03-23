function FloatingText(x, y, text, crit, color1, color2){
	this.x = x;
	this.y = y;
	this.text =  text || "";
	this.crit = crit || false;
	this.color1 = color1;
	this.color2 = color2;
	this.size = parseInt(this.text)/2;
	this.lifeTime = 1;
	this.transparency = 1;

	this.vx = Math.random() * 10 - 5;
  	this.vy = Math.random() * 10 - 2;
}

FloatingText.prototype.exist = function(deltaTime, id){

	this.lifeTime -= deltaTime;
	this.transparency -= deltaTime;

	this.x += this.vx * deltaTime * 10;
	this.y += this.vy * deltaTime * 10;

	this.vy += gravity * deltaTime * 10;

	if(this.lifeTime < 0) dmgText.splice(id, 1);

};

FloatingText.prototype.draw = function (){
	if(this.crit){
		ctx.fillStyle = "rgba(" + 255 + "," + 0 + "," + 0 + "," + this.transparency + ")";
	}
	else {
		ctx.fillStyle = "rgba(" + this.color1.r + "," + this.color1.g + "," + this.color1.b + "," + this.transparency + ")";

		
	}

	ctx.strokeStyle = "rgba(" + this.color2.r + "," + this.color2.g + "," + this.color2.b + "," + this.transparency + ")";
	ctx.font = this.size + "px Pixel";
	ctx.strokeText(this.text, this.x - viewX, this.y - viewY);
	ctx.fillText(this.text, this.x - viewX, this.y - viewY);
};