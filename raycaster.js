var height = 0;
var width = 0;
var canvasX = 0;
var canvasY = 0;
var midX = 0;
var midY = 0;

var scale = 1/1; //4
var resolution = width*scale;
var column = width/resolution;

var holdingCTRL = false;
var holdingSHIFT = false;

var lastTick = new Timestamp();
var tickSpeed = 16;
var TimeoutID = 0;
var tickCount = 0;
var paused = true;
var FPStimestamp = new Timestamp();
var frameCount = 0;
var FPS = 0;

var posX = 0;
var posZ = 0;
var dir = 0;
var camDist = 0.5;
var camSize = 0.001*column;
var rayDist = 500;

var playerSpeed = 0.1;
var walkSpeed = 0.05;
var runSpeed = 0.2;
var mouseSensitivity = 0.8;

var gravity = 20;
var jumpHeight = 10;
var posY = 0;
var motionY = 0;

var objs = [];

//--------------------------------------


$(document).ready(function() {
	//resize canvas to window
	$(window).on("resize", function() {
		ctx.canvas.height = $(window).height();
		ctx.canvas.width = $(window).width();
		width = canvas.width;
		height = canvas.height;
		midX = width/2;
		midY = height/2;
		resolution = width*scale;
		column = width/resolution;
		camSize = 0.001*column;
		ctx.textAlign="center";
		ctx.textBaseline="middle";
		ctx.translate(canvasX, canvasY);
		render();
	});
	
	function drawCircle(x, y, radius, color, outline, outlineWidth) {
		ctx.fillStyle = color;
		if(outline) {
			ctx.strokeStyle = outline;
			ctx.lineWidth = outlineWidth;
			ctx.stroke();
		}
		ctx.beginPath();
		ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
		ctx.fill();
	}
	
	function drawLine(startX, startY, endX, endY, color, width) {
		ctx.lineWidth = width;
		ctx.strokeStyle = color;
		ctx.beginPath();
		ctx.moveTo(startX, startY);
		ctx.lineTo(endX, endY);
		ctx.stroke();
	}
	
	function drawRect(startX, startY, endX, endY, color, outline, outlineWidth) {
		ctx.beginPath();
		ctx.fillStyle=color;
		if(outline) {
			ctx.strokeStyle=outline;
			ctx.lineWidth=outlineWidth;
			ctx.stroke();
		}
		ctx.rect(startX, startY, endX-startX, endY-startY);
		ctx.fill();
	}
	
	function drawPixel(x, y, color) {
		ctx.fillStyle=color;
		ctx.fillRect(x, y, 1, 1);
	}
	
	function drawText(x, y, text, color, size) {
		ctx.fillStyle=color;
		ctx.font = size+"px Arial";
		ctx.beginPath();
		ctx.fillText(text, x, y);
	}
	
	function clear() {
		ctx.clearRect(-canvasX, -canvasY, width, height);
	}

	/*-----------------------------SETUP-------------------------------------------------------------*/
	
	var canvas = document.getElementById("canvas");
	var ctx = canvas.getContext("2d");
	
	createWall(20,-10, 20,-0.8, 2, 0, RGB(192,0,0));//left half
	createWall(20,0.8, 20,10, 2, 0, RGB(0,192,0));//right half
	createWall(20,-10, 20,10, 2, 2, RGB(20,20,20));//ceiling
	
	createWall(19.99,-0.8, 19.99,0.8, 2, 0, RGB(100,100,100));//moveable door
	
	createWall(0,20, 10,20, 2, 0, RGB(0,0,255), function() {//rotating wall
		if(typeof this.angle !== "number") this.angle = 0;
		else this.angle+=1;
		this.angle = this.angle%360;
		var mX = (this.x1+this.x2)/2;
		var mZ = (this.z1+this.z2)/2;
		var r = G.GetDist(this.x1, this.z1, mX, mZ);
		var new1 = G.PointAtAngle(mX, mZ, this.angle, r);
		var new2 = G.PointAtAngle(mX, mZ, this.angle+180, r);
		this.x1 = new1.x;
		this.z1 = new1.y;
		this.x2 = new2.x;
		this.z2 = new2.y;
		this.y = Math.abs(Math.sin(Math.toRad(this.angle*2)))*2;
	});
	createWall(5,15, 5,25, 2, 0, RGB(0,0,192), function() {//rotating wall
		if(typeof this.angle !== "number") this.angle = 0;
		else this.angle+=1;
		this.angle = this.angle%360;
		var mX = (this.x1+this.x2)/2;
		var mZ = (this.z1+this.z2)/2;
		var r = G.GetDist(this.x1, this.z1, mX, mZ);
		var new1 = G.PointAtAngle(mX, mZ, this.angle+90, r);
		var new2 = G.PointAtAngle(mX, mZ, this.angle+270, r);
		this.x1 = new1.x;
		this.z1 = new1.y;
		this.x2 = new2.x;
		this.z2 = new2.y;
		this.y = Math.abs(Math.sin(Math.toRad(this.angle*2)))*2;
	});
	
	createWall(0,-10, 10,-10, 2, -2, RGB(0,0,0)); //window
	createWall(0,-10, 3.5,-10, 2.1, 0, RGB(0,0,0));
	createWall(6.5,-10, 10,-10, 2.1, 0, RGB(0,0,0));
	createWall(0,-10, 10,-10, 2, 2, RGB(0,0,0));
	
	
	//table
	createWall(-10,-13, -3,-13, 0.5, -0.25, RGB(120,60,30)); //barF
	createWall(-10,-13, -10,-15, 0.5, -0.25, RGB(110,50,20)); //barL
	createWall(-3,-13, -3,-15, 0.5, -0.25, RGB(110,50,20)); //barR
	createWall(-10,-15, -3,-15, 0.5, -0.25, RGB(120,60,30)); //barB
	
	createWall(-9.5,-13.5, -8.5,-13.5, 1, -0.75, RGB(115,55,25)); //leg1F
	createWall(-9.5,-13.5, -9.5,-14.5, 1, -0.75, RGB(110,50,20)); //leg1L
	createWall(-8.5,-13.5, -8.5,-14.5, 1, -0.75, RGB(110,50,20)); //leg1R
	createWall(-9.5,-14.5, -8.5,-14.5, 1, -0.75, RGB(115,55,25)); //leg1B
	
	createWall(-4.5,-13.5, -3.5,-13.5, 1, -0.75, RGB(115,55,25)); //leg2F
	createWall(-4.5,-13.5, -4.5,-14.5, 1, -0.75, RGB(110,50,20)); //leg2L
	createWall(-3.5,-13.5, -3.5,-14.5, 1, -0.75, RGB(110,50,20)); //leg2R
	createWall(-4.5,-14.5, -3.5,-14.5, 1, -0.75, RGB(115,55,25)); //leg2B
	
	
	/*for(var i=0; i<10; i++) {
		createWall(i*2-0.01,-10, i*2-0.01,10, 0.05, -1.025, RGB(120,60,30));
	}*/
	
	/* //random walls
	for(var i=0; i<20; i++) {
		var range = 20;
		var x = Math.RandomRange(-50, 50);
		var z = Math.RandomRange(-50, 50);
		createWall(
			x,
			z,
			Math.RandomRange(x-range, x+range),
			Math.RandomRange(z-range, z+range),
			Math.RandomRangeFloat(0.2, 20), //height
			Math.RandomRangeFloat(-10,10), //yPos
			RGB(Math.RandomRange(0,256), Math.RandomRange(0,256), Math.RandomRange(0,256))
		);
	}*/
	
	var newLineStart = false;
	var newLineX;
	var newLineZ;
	
	
	
	$(window).trigger("resize");
	
	/*-----------------------------GAME--------------------------------------------------------------*/
	
	var mouseLook = new Input.Event.MouseMove({disabled:true}, function(x,y,e) {
		dir+=(e.originalEvent.movementX/width)*mouseSensitivity*1000;
		dir = dir%360;
		if(dir<0) dir = 360-dir;
	});
	
	var awaitingPointerLock = new Input.Event.MouseClick({button:"left"}, function(b, e) {
		canvas.requestPointerLock();
	});
	
	document.addEventListener("pointerlockchange", function(){
		if(awaitingPointerLock.disabled) {
			mouseLook.Disable();
			spawnWall.Disable();
			stop();
			awaitingPointerLock.Enable();
		}
		else {
			mouseLook.Enable();
			spawnWall.Enable();
			start();
			awaitingPointerLock.Disable();
		}
	}, false);
	
	
	
	//Track CTRL/SHIFT state
	$(document).on("keyup", function(key) {
		var keyID = parseInt(key.which, 10);
		if(keyID===17) holdingCTRL = false;
		else if(keyID===16) holdingSHIFT = false;
	});
	
	var walkForward = new Input.Event.KeyPress({button:"w", repeat:tickSpeed}, function() {
		var dirV = new Vector(dir);
		dirV = dirV.Multiply(playerSpeed);
		posX+=dirV.x;
		posZ+=dirV.y;
	});
	
	var walkLeft = new Input.Event.KeyPress({button:"a", repeat:tickSpeed}, function() {
		var dirV = new Vector(dir);
		dirV = dirV.Perpendicular(true).Multiply(playerSpeed);
		posX+=dirV.x;
		posZ+=dirV.y;
	});
	
	var walkRight = new Input.Event.KeyPress({button:"d", repeat:tickSpeed}, function() {
		var dirV = new Vector(dir);
		dirV = dirV.Perpendicular(false).Multiply(playerSpeed);
		posX+=dirV.x;
		posZ+=dirV.y;
	});
	
	var walkBackward = new Input.Event.KeyPress({button:"s", repeat:tickSpeed}, function() {
		var dirV = new Vector(dir);
		dirV = dirV.Reverse().Multiply(playerSpeed);
		posX+=dirV.x;
		posZ+=dirV.y;
	});
	
	var changePlayerSpeed = new Input.Event.KeyPress({button:"shift"}, function() {
		playerSpeed = runSpeed;
	}, function() {
		playerSpeed = walkSpeed;
	});
	
	var spawnWall = new Input.Event.MouseClick({button:"left", disabled:true, preventDefault:true}, function() {
		if(newLineStart) {
			newLineStart = false;
			createWall(
				newLineX,
				newLineZ,
				posX,
				posZ,
				Math.RandomRangeFloat(0.2, 5),
				0,
				RGB(Math.RandomRange(0,256), Math.RandomRange(0,256), Math.RandomRange(0,256))
			);
		}
		else {
			newLineX = posX;
			newLineZ = posZ;
			newLineStart = true;
		}
	});
	
	var jump = new Input.Event.KeyPress({button:"space", preventDefault:true}, function() {
		if(posY===0) motionY = jumpHeight;
	});
	
	
	var debugPlus = new Input.Event.KeyPress({button:"num+", repeat:tickSpeed}, function() {
		objs[3].y+=0.1;
	});
	var debugMinus = new Input.Event.KeyPress({button:"num-", repeat:tickSpeed}, function() {
		objs[3].y-=0.1;
	});
	
	
	
	
	
	
	
	
	
	function createWall(x1, z1, x2, z2, height, posY, color, tickFunc) {
		objs.push({
			x1:x1,
			z1:z1,
			x2:x2,
			z2:z2,
			y:posY,
			height:height,
			color:color,
			tick:tickFunc
		});
	}
	
	
	
	
	
	
	
	function stop() {
		clearTimeout(TimeoutID);
	}
	
	function start() {
		TimeoutID = setTimeout(Tick, tickSpeed);
	}
	
	function Tick() {
		TimeoutID = setTimeout(Tick, tickSpeed);
		var tickTime = lastTick.since()/1000;
		lastTick = new Timestamp();
		
		//wall animations
		for(var i=0; i<objs.length; i++) {
			if(typeof objs[i].tick === "function") objs[i].tick();
		}
		
		//jumping
		if(posY>0 || motionY!==0) {
			motionY-=gravity*tickTime;
			posY+=motionY*tickTime;
		}
		if(posY<0) {
			posY=0;
			motionY = 0;
		}
		
		render();
		tickCount++;
	}
	
	function render() {
		clear();
		for(var x=0; x<resolution; x++) {
			var pixel = G.PointAtAngle(posX, posZ, dir, camDist);
			var v = new Vector(posX, posZ, pixel.x, pixel.y);
			v = v.Perpendicular(true).Normalize().Multiply((resolution/2 - x)*camSize);
			var ray = new Vector(posX, posZ, pixel.x + v.x, pixel.y + v.y);
			var fullRay = ray.Normalize().Multiply(rayDist);
			fullRay.x += posX;
			fullRay.y += posZ;
			
			var intersects = [];
			for(var i = 0; i<objs.length; i++) {
				var obj = objs[i];
				var result = G.IntersectLineLine(posX, posZ, fullRay.x, fullRay.y, obj.x1, obj.z1, obj.x2, obj.z2);
				if(result!==false) {
					var dist = G.GetDist(posX, posZ, result.x, result.y);
					if(dist>=camDist) intersects.push({dist:dist, wall:obj});
				}
			}
			if(intersects.length!==0) {
				intersects.sort(function(a, b) {
					return b.dist-a.dist;
				});
				for(var i = 0; i<intersects.length; i++) {
					var obj = intersects[i];
					var baseHeight = height/(obj.dist*Math.cos(Math.toRad(ray.Angle()-dir)));
					var wallHeight = obj.wall.height*baseHeight;
					var offset = (obj.wall.y-posY)*baseHeight;
					drawRect(x*column, (height-wallHeight)/2-offset, x*column+column, height-(height-wallHeight)/2-offset, obj.wall.color);
				}
			}
		}
		
		//FPS & display
		frameCount++;
		if(FPStimestamp.since()>=1000) {
			FPS = 1000*frameCount/FPStimestamp.since();
			FPStimestamp = new Timestamp();
			frameCount = 0;
		}
		drawText(midX, 20, "Walls: "+objs.length, RGB(128,128,128), 14);
		drawText(midX, 40, "FPS: "+FPS.fixedTo(1), RGB(128,128,128), 14);
		
		drawText(35, 20, "X: "+posX.fixedTo(2), RGB(255,0,0), 14);
		drawText(35, 40, "Z: "+posZ.fixedTo(2), RGB(0,0,255), 14);
		drawText(35, 60, "dir: "+dir.fixedTo(1)+"°", RGB(128,128,128), 14);
		
	}
	render();
});