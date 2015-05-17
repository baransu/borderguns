
//canvas tech stuff
var CANVASW,
	CANVASH;
var canvas;
var ctx;
var lastTime = Date.now();

//gradient stuff
var bgGradient = 0;
var calcGradient = true;
var gradientColors = [];
var colors = [
	[62,35,255],
	[60,255,60],
	[255,35,98],
	[45,175,230],
	[255,0,255],
	[255,128,0]];

var step = 0;
var colorIndices = [0,1,2,3];
var gradientSpeed = 0.1;

var titlescreenMusic = new Audio("sounds/lobby.mp3"); 

function load()
{
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");

	//stuff for smooth animations?
	ctx.mozImageSmoothingEnabled = false;
	ctx.webkitImageSmoothingEnabled = false;
	ctx.msImageSmoothingEnabled = false;
	ctx.imageSmoothingEnabled = false;

	if (canvas.requestFullscreen)
	{
	  canvas.requestFullscreen();
	}
	else if (canvas.msRequestFullscreen)
	{
	  canvas.msRequestFullscreen();
	}
	else if (canvas.mozRequestFullScreen)
	{
	  canvas.mozRequestFullScreen();
	}
	else if (canvas.webkitRequestFullscreen)
	{
	  canvas.webkitRequestFullscreen();
	}


	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	CANVASW = canvas.width;
	CANVASH = canvas.height;
	
	titlescreenMusic.addEventListener("ended", function()
	{
	    this.currentTime = 0;
	    this.play();
	}, false);
	
	titlescreenMusic.volume = 0.2;
	titlescreenMusic.play();

	gameLoop();
}

function gameLoop()
{
    var now = Date.now();
    var deltaTime = (now - lastTime) / 1000.0;

    update(deltaTime);
    render();

    lastTime = now;
    window.requestAnimationFrame(gameLoop);
}

function update(deltaTime)
{
	if(bgGradient == 0 && calcGradient == false)
	{
		bgGradient = 1;
		calcGradient = true;
	}
	
	if(bgGradient > 0) bgGradient -= deltaTime;
	if(bgGradient < 0) bgGradient = 0;	
}

function render()
{
	ctx.clearRect(0, 0, CANVASH, CANVASH);		
	
	if(calcGradient)
	{
		var c0_0 = colors[colorIndices[0]];
		var c0_1 = colors[colorIndices[1]];
		var c1_0 = colors[colorIndices[2]];
		var c1_1 = colors[colorIndices[3]];

		var istep = 1 - step;
		var r1 = Math.round(istep * c0_0[0] + step * c0_1[0]);
		var g1 = Math.round(istep * c0_0[1] + step * c0_1[1]);
		var b1 = Math.round(istep * c0_0[2] + step * c0_1[2]);
		gradientColors[0] = "rgb(" + r1 + ", " + g1 + "," + b1 + ")";

		var r2 = Math.round(istep * c1_0[0] + step * c1_1[0]);
		var g2 = Math.round(istep * c1_0[1] + step * c1_1[1]);
		var b2 = Math.round(istep * c1_0[2] + step * c1_1[2]);
		gradientColors[1] = "rgb(" + r2 + ", " + g2 + ", " + b2 + ")";

		step += gradientSpeed;
		if (step >= 1)
		{
			step %= 1;
			colorIndices[0] = colorIndices[1];
			colorIndices[2] = colorIndices[3];

			colorIndices[1] = ( colorIndices[1] + Math.floor( 1 + Math.random() * (colors.length - 1))) % colors.length;
			colorIndices[3] = ( colorIndices[3] + Math.floor( 1 + Math.random() * (colors.length - 1))) % colors.length;
		}
	}
	
	var my_gradient = ctx.createLinearGradient(0, 0, CANVASW/2, CANVASH);
	my_gradient.addColorStop(0, gradientColors[0]);
	my_gradient.addColorStop(1, gradientColors[1]);

	ctx.fillStyle = my_gradient;
	ctx.fillRect(0,0,CANVASW,CANVASH);
}

function button(event)
{
	var e = event.which;
	if(e != 122 && e != 123 && e != 116)
		window.location.href = "game.html";
	//console.log(event.which)
}