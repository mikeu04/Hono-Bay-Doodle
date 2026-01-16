//**************************************************************************//
//CreativeCommons Attribution NonCommercial ShareAlike
//by Mike L., April 28, 2024

let trueWidth, trueHeight; // actual canvas width & height
let backgroundColor;

let currentTime = new Date();
let lastHour = currentTime.getHours(); // unused variable, prepared for future
let prevNight;
let currNight;
let isDayNightShift;

let textColor, textStrokeColor;

let button, currentButtonColor, currentTextColor, currentShadowColor;

let buttonGap = 30;
let rainButton;
let isRainy = false;
let rainStartHour, rainEndHour, rainDuration;
let rainStrength = 'moderate';
let rainSmoke = {light: 1, moderate: 40, heavy: 80};

let sunFillColor, sunStrokeColor, moonFillColor, moonStrokeColor;

let buildingButton;
let buildingColors = ['#008080', '#933D75', '#747678', '#7F421F']; // Different shades of gray for buildings
let windowStyle = {lightOn: '#FFFF00', lightOff: '#666666', 
									 winStroke: '#4E4E4E', winStrokeWeight: 3, 
									 winLength: 10, winHeight: 16, percentLightOns: 0};
let buildingAngle = 30;
let BD1, BD2, BD3, BD4;

let land;
let ship;
let smoke;
let cloud;

let song;
let songButton;
let isSongPlaying = false;



//preload the song
function preload() {
	song = loadSound("J Boog - Uma.mp3");
}



function setup() {
	const container = document.getElementById("sketch-container");
	trueWidth = container.offsetWidth * 0.9;
	trueHeight = container.offsetHeight;
	const c = createCanvas(trueWidth, trueHeight);
	c.parent("sketch-container");	
	
	land = {ocean: "#476FF2", beach: "#FFC000", opacity: 0.7, 
					 	beachTop: 3.79 * trueHeight / 4, beachBottom: 3.85 * trueHeight / 4, 
						oceanTop: 3.36 * trueHeight / 4, oceanBottom: 3.4 * trueHeight / 4,
				 		waveSpeed: 0.02}; //waveSpeed between 0.01 to 0.1
	
	
	ship = {x: trueWidth + 20, y: land.oceanTop, 
					//color: "#A42D00"
					color: generateRandomColor(), keelColor: "#2D2D2D", speed: 0.3, buildingColor: "#EDE9C6", 
					size: 150, bottomHeight: 150 / 5, windowSize: 150 / 25, buildingHeight: 25, funnelHeight: 15, funnelLength: 15,
					bowAngle: radians(40), sternAngle: radians(80),
				 	upperLeftAngle: radians(50), upperRightAngle: radians(70), funnelAngle: radians(70)};
	
	
	smoke = {color: "#7C7B7B", size: 10, startX: getStartSmoke()[0], startY: getStartSmoke()[1], 
					 locations: {x: [], y: []}, numbers: 3, speedX: [-1.5, 2], speedY: [1, 2]}; //speedX = [min speedX, max speedX]
	
	
	cloud = {color: color("#FFFFFF"), x: -300, y: 5.5/20 * trueHeight, speed: 0.7, size: 100, numSmoke: 0};
	
	
	
	// Increment one minute every 0.5 seconds
  setInterval(incrementOneMinute, 100);
	if (isNight()) {
		prevNight = true;
		currNight = true;
		windowStyle.percentLightOns = 0.7;
	} else {
		prevNight = false;
		currNight = false;
		windowStyle.percentLightOns = 0.3;
	}
	
	
	cloud.x = 0;
	
	backgroundColor = color("#80CBF7");
	sunFillColor = color("rgb(247, 233, 121)");
	sunStrokeColor = color("orange");
	moonFillColor = backgroundColor;
	moonStrokeColor = backgroundColor;

	//For Buildings & their windows:
	BD1 = {x: 0 + 2 * trueWidth/50, y: trueHeight - 20*trueHeight/50, width: 100, 
				 color: buildingColors[int(random(buildingColors.length))], 
				 windows: [], lightOns: []};
	BD2 = {x: 0 + 6 * trueWidth/50, y: trueHeight - 12*trueHeight/50, width: 120, 
				 color: buildingColors[int(random(buildingColors.length))], 
				 windows: [], lightOns: []};
	BD3 = {x: 0 + 8 * trueWidth/50, y: trueHeight - 25*trueHeight/50, width: 80, 
				 color: buildingColors[int(random(buildingColors.length))], 
				 windows: [], lightOns: []};
	BD4 = {x: 0 + 13 * trueWidth/50, y: trueHeight - 15*trueHeight/50, width: 85, 
				 color: buildingColors[int(random(buildingColors.length))], 
				 windows: [], lightOns: []};
	updateWindowsForAllBuildings();
	
	textSize(24);
  	textAlign(CENTER, CENTER);
	
	
	// this creates the Add Hours Button
	setUpAddHoursButton();
	currentButtonColor = color(255);
	currentTextColor = color(255);
	currentShadowColor = color(64);
	
	// this creates the Rainy Button
	setUpRainButton();
	
	// this creates the Light Button
	setUpLightButton();
	
	// this creates the Song Button
	setUpSongButton();
}

function draw() {
	windowResized();
	background(backgroundColor);
	
	//draw the canvas
	drawMoon();
	drawSun();
	drawLand();
	drawSmoke();
	drawBuildings();
	drawCloud();


	//Display the time at the center
	displayCurrentTime();
	
	// Update color styles based on the current time
	isDayNightShift = updateNight(); //update prevNight and currNight and return true if there is a day-night shift
	updateSceneColors(currentTime.getHours());
  updateButtonStyles(currentTime.getHours());
	updateLight();
	//print(windowStyle.percentLightOns);
	
	// Control the rain according to the current time, and display the time the rain will ends.
	//console.log(cloud.numSmoke); //DEBUG
	controlRain();
	displayRainEndTime();
	
	//Notify the user when the song is playing
	displaySong();
}


function windowResized() {
  	if (!isFullscreen) {
	    const container = document.getElementById("sketch-container");
	    trueWidth = container.offsetWidth;
		trueHeight = container.offsetHeight;
	    resizeCanvas(trueWidth, trueHeight);
  	} else {
		trueWidth = windowWidth;
		trueHeight = windowHeight;
		resizeCanvas(trueWidth, trueHeight);
  	}
}


/********************************************************/
/********************************************************/
/********************************************************/
function setUpSongButton() {
	songButton = createButton('Music');
	songButton.parent("sketch-container");
  	songButton.size(80, 40);
  	songButton.position(trueWidth / 2 + 80/2 + buttonGap, trueHeight/2 + 50 + 20 - 40);
	
	songButton.style('color', 'white');
  	songButton.style('background-color', '#882974');
  	songButton.style('border', 'none');
  	songButton.style('border-radius', '70px'); // Make the button circular
  	songButton.style('font-size', '16px');
	songButton.style('box-shadow', '0px 2px 10px 2px rgba(0, 0, 0, 0.2)'); // Add shadow effect
	songButton.mousePressed(function() {
		isSongPlaying = !isSongPlaying;
		if (isSongPlaying) {
			songButton.html('Pause');
			song.play(); //When the song is to the end, the song will restart from the beginning
		}
		else {
			songButton.html('Music');
			song.pause();
		}
	});

	// Apply hover effect
  songButton.style('transition', 'background-color 0.3s ease');
  songButton.style('cursor', 'pointer');
  songButton.style('user-select', 'none');
  
  // Change background color on hover
  songButton.mouseOver(function() {
  	songButton.style('background-color', '#925F88');
  });
  
  // Revert to original color when not hovered
  songButton.mouseOut(function() {
  	songButton.style('background-color', '#882974');
  });
}





/********************************************************/
/********************************************************/
/********************************************************/
function drawSun() {
	if (isNight()) {
		if (currentTime.getMinutes() < 20) {
			sunFillColor = lerpColor(sunFillColor, color("#2D2D2D"), 0.05);
			sunStrokeColor = lerpColor(sunStrokeColor, color("#2D2D2D"), 0.05); 
		} else {
			sunFillColor = backgroundColor;
			sunStrokeColor = backgroundColor; 
		}
	} else {
		sunFillColor = lerpColor(sunFillColor, color("rgb(247, 233, 121)"), 0.05);
		sunStrokeColor = lerpColor(sunStrokeColor, color("orange"), 0.05); 
	}
	fill(sunFillColor);
	stroke(sunStrokeColor);
	strokeWeight(10);
	circle(150, 150, 200);
}

function drawMoon() {
	if (isNight()) {
		moonFillColor = lerpColor(moonFillColor, color("rgb(247, 233, 121)"), 0.05);
		moonStrokeColor = lerpColor(moonStrokeColor, color("#2D2D2D"), 0.05);
	} else {
		if (currentTime.getMinutes() < 20) {
			moonFillColor = lerpColor(moonFillColor, color("#80CBF7"), 0.05);
			moonStrokeColor = lerpColor(moonStrokeColor, color("#80CBF7"), 0.05);
		} else {
			moonFillColor = backgroundColor;
			moonStrokeColor = backgroundColor;
		}
		 
	}
	noStroke();
	fill(moonFillColor);
	circle(width - 200, 150, 200);
	fill(moonStrokeColor);
	circle(width - 250, 120, 200);
}


function drawCloud() {
	cloud.color = lerpColor(cloud.color, getCloudColor(), 0.05);
	cloud.x += cloud.speed;
	if(cloud.x> trueWidth + 100) {
		cloud.x = -300;
	}
	
	fill(cloud.color);
	noStroke();
	circle(cloud.x, cloud.y, 100);
	circle(cloud.x - 60, cloud.y + 50, 90);
	circle(cloud.x + 70, cloud.y + 50, 90);
	circle(cloud.x + 10, cloud.y + 60, 80);	
}


//return the color of the cloud based on the #smoke in the cloud
//larger cloud.numSmoke, darker the color
function getCloudColor() {
  if (cloud.numSmoke == 0) {
    return color("#FFFFFF"); // White color when there's no smoke
  } else if (cloud.numSmoke < rainSmoke.heavy) {
    // Map the number of smoke bubbles to a shade of grey between 200 and 80; larger mappedGrey, lighter the color
    let mappedGrey = map(cloud.numSmoke, 0, rainSmoke.heavy, 200, 80);
    // Ensure the mapped value doesn't exceed the maximum dark grey level
    mappedGrey = max(mappedGrey, 100); // eg. 76 corresponds to 0x4C in hexadecimal, ensuring it's no darker than #4C4C4C
    // Convert the mapped value to hexadecimal format
    return color("#" + Math.floor(mappedGrey).toString(16).repeat(3));
  } else {
    return color("#" + Math.floor(80).toString(16).repeat(3)); // Dark grey color when the number of smoke bubbles exceeds rainSmoke.heavy
  }
}





/********************************************************/
/********************************************************/
/********************************************************/
//Draw the ocean and beach
function drawLand() {
  let beachColor = color(land.beach + Math.floor(land.opacity * 255).toString(16));
	let oceanColor = color(land.ocean + Math.floor(land.opacity * 255).toString(16));
	
	
	//Draw the ocean with waves
	fill(oceanColor);
	noStroke();
	//rect(0, trueHeight - land.oceanHeight, trueWidth, land.oceanHeight);
	beginShape();
  for (let x = 0; x <= trueWidth; x += 1) {
    let y = map(sin(x * 0.01 + frameCount * land.waveSpeed), -1, 1, land.oceanBottom, land.oceanTop);
    vertex(x, y);
  }
  vertex(trueWidth, trueHeight);
  vertex(0, trueHeight);
  endShape(CLOSE);
	
	
	// Draw the ship
	drawShip();
	
	
	//Draw the beach
  fill(beachColor);
  noStroke();
  beginShape();
  for (let x = 0; x <= trueWidth + 20; x += 20) {
    let y = map(sin(x * 0.01), -1, 1, land.beachBottom, land.beachTop);
    vertex(x, y);
  }
  vertex(trueWidth, trueHeight);
  vertex(0, trueHeight);
  endShape(CLOSE);
}



//Draw the ship with y value varies according to the waving ocean
function drawShip() {
	//update the location and color
	ship.x -= ship.speed;
	ship.y = map(sin(frameCount * land.waveSpeed), -1, 1, land.oceanBottom - 2, land.oceanTop - 1);
	if(ship.x < -220) {
		ship.x = trueWidth + 20;
		ship.color = generateRandomColor();
	}
  
	
	
	//draw the bottom part of the ship including the keel
	fill(ship.color);
	stroke(ship.keelColor);
	strokeWeight(2);
	beginShape();
	vertex(ship.x, ship.y);
	vertex(ship.x + ship.size, ship.y);
	vertex(ship.x + ship.size - ship.bottomHeight/tan(ship.sternAngle), ship.y + ship.bottomHeight);
	vertex(ship.x + ship.bottomHeight/tan(ship.bowAngle), ship.y + ship.bottomHeight);
	endShape(CLOSE);
	
	fill(ship.keelColor);
	noStroke();
	beginShape()
	vertex(ship.x + 4/5 * ship.bottomHeight/tan(ship.bowAngle), ship.y + 4/5 * ship.bottomHeight);
	vertex(ship.x + ship.size - 4/5 * ship.bottomHeight/tan(ship.sternAngle), ship.y + 4/5 * ship.bottomHeight);
	vertex(ship.x + ship.size - ship.bottomHeight/tan(ship.sternAngle), ship.y + ship.bottomHeight);
	vertex(ship.x + ship.bottomHeight/tan(ship.bowAngle), ship.y + ship.bottomHeight);
	endShape(CLOSE);
	
	
	//draw 6 windows at the bottom part
	fill("#FFFFFF");
	noStroke();
	circle(ship.x + ship.size / 2 - 30, ship.y + ship.bottomHeight / 2.5, ship.windowSize);
	circle(ship.x + ship.size / 2 - 15, ship.y + ship.bottomHeight / 2.5, ship.windowSize);
	circle(ship.x + ship.size / 2, ship.y + ship.bottomHeight / 2.5, ship.windowSize);
	circle(ship.x + ship.size / 2 + 15, ship.y + ship.bottomHeight / 2.5, ship.windowSize);
	circle(ship.x + ship.size / 2 + 30, ship.y + ship.bottomHeight / 2.5, ship.windowSize);
  circle(ship.x + ship.size / 2 + 45, ship.y + ship.bottomHeight / 2.5, ship.windowSize);
	
	
	//draw the upper building part
	fill(ship.buildingColor);
	stroke(ship.keelColor);
	strokeWeight(2);
	beginShape();
	let addLeftBottomX = ship.buildingHeight/tan(ship.upperLeftAngle);
	let minusRightBottomX = ship.buildingHeight/tan(ship.upperRightAngle);
	
	vertex(ship.x + 30, ship.y);
	vertex(ship.x + 30 + addLeftBottomX, ship.y - ship.buildingHeight);
	vertex(ship.x + 135 - minusRightBottomX, ship.y - ship.buildingHeight)
	vertex(ship.x + 135, ship.y)
	endShape(CLOSE);
	
	fill(ship.color);
	noStroke();
	beginShape();
	vertex(ship.x + 30 + 1/3 * addLeftBottomX, ship.y - 1/3 * ship.buildingHeight);
	vertex(ship.x + 30 + 2/3 * addLeftBottomX, ship.y - 2/3 * ship.buildingHeight);
	vertex(ship.x + 135 - 2/3 * minusRightBottomX, ship.y - 2/3 * ship.buildingHeight);
	vertex(ship.x + 135 - 1/3 * minusRightBottomX, ship.y - 1/3 * ship.buildingHeight);
	endShape(CLOSE);
	
	
	//draw the funnel
	fill(ship.color);
	stroke(ship.keelColor);
	strokeWeight(2);
	beginShape();
	let addFunnelX = ship.funnelHeight/tan(ship.funnelAngle);
	let startFunnelX = ship.x + 30 + ship.buildingHeight/tan(ship.upperLeftAngle) + 30;
	let startFunnelY = ship.y - ship.buildingHeight;
	
	beginShape();
	vertex(startFunnelX, startFunnelY);
	vertex(startFunnelX + addFunnelX, startFunnelY - ship.funnelHeight);
	vertex(startFunnelX + addFunnelX + ship.funnelLength, startFunnelY - ship.funnelHeight);
	vertex(startFunnelX + ship.funnelLength, startFunnelY);
	endShape(CLOSE);
}


//return true if the the user's mouse location is within the ship
function isMouseInShip() {
  // Check if the mouse is within the boundaries of the ship's bottom part
  let inBottom = mouseX >= ship.x && mouseX <= ship.x + ship.size &&
                      mouseY >= ship.y && mouseY <= ship.y + ship.bottomHeight;

  // Check if the mouse is within the boundaries of the ship's building part
  let inBuilding = mouseX >= ship.x + 30 && mouseX <= ship.x + 135 &&
                        mouseY >= ship.y - ship.buildingHeight && mouseY <= ship.y;

  // Check if the mouse is within the boundaries of the ship's funnel part
	let startFunnelX = ship.x + 30 + ship.buildingHeight/tan(ship.upperLeftAngle) + 30;
	let startFunnelY = ship.y - ship.buildingHeight;
  let inFunnel = mouseX >= startFunnelX && mouseX <= startFunnelX + ship.funnelLength &&
                      mouseY >= startFunnelY - ship.funnelHeight &&
                      mouseY <= startFunnelY;

  // Return true if any part of the ship is clicked
  return inBottom || inBuilding || inFunnel;
}





/********************************************************/
/********************************************************/
/********************************************************/
// return the position [startFunnelX, startFunnelY] of the left bottom corner of the funnel
function getStartFunnel() {
		let startFunnelX = ship.x + 30 + ship.buildingHeight/tan(ship.upperLeftAngle) + 30;
		let startFunnelY = ship.y - ship.buildingHeight;
		return [startFunnelX, startFunnelY];
}


//return the position [startSmokeX, startSmokeY] of the smoke coming out from the funnel
function getStartSmoke() {
	// get the left bottom corner of the ship's funnel
	let startFunnel = getStartFunnel();
	let addFunnelX = ship.funnelHeight/tan(ship.funnelAngle);
	
	// the upper left corner of the funnel: (startFunnelX + addFunnelX, startFunnelY - ship.funnelHeight);
	
	let smokeX = startFunnel[0] + addFunnelX + ship.funnelLength / 2;
	let smokeY = startFunnel[1] - ship.funnelHeight;
	
	return [smokeX, smokeY];
}


//update the locations of each smoke bubbles per frame
//if a bubble hits the cloud, the cloud turns grey and it starts raining
function updateSmokeLocations() {
	for (let i = smoke.locations.x.length - 1; i >= 0; i--) {
		smoke.locations.x[i] += random(smoke.speedX[0], smoke.speedX[1]);
		smoke.locations.y[i] -= random(smoke.speedY[0], smoke.speedY[1]);
		
		// remove smoke bubbles that are out of bounds
		if (smoke.locations.y[i] < 0 - smoke.size || 
				smoke.locations.x[i] < 0 - smoke.size || 
				smoke.locations.x[i] > trueWidth + smoke.size || 
				isHitCloud(smoke.locations.x[i], smoke.locations.y[i])) {
			
			//if the bubble hit the cloud, starts raining
			if (isHitCloud(smoke.locations.x[i], smoke.locations.y[i]) && isRainy == false) {
				startRainSmoke();
			}
			
			//remove the bubble
			smoke.locations.x.splice(i, 1);
			smoke.locations.y.splice(i, 1);
			//console.log("bubble is removed!"); //DEBUG
			//console.log(smoke.locations.x.length); //DEBUG
    }
	}
}


function drawSmoke() {
	updateSmokeLocations();
	
	fill(smoke.color);
	noStroke();
	for (let i = 0; i < smoke.locations.x.length; i++) {
		circle(smoke.locations.x[i], smoke.locations.y[i], smoke.size);
	}
}


//update smoke.startX and smoke.startY for new smoke bubbles, and 
//add #smoke.numbers smoke bubbles when the ship is clicked
function addSmoke() {
	// Initiate the locations of all the added smoke bubbles to be [startX, startY]
	smoke.startX = getStartSmoke()[0];
	smoke.startY = getStartSmoke()[1];
	
	for (let i = 0; i < smoke.numbers; i++) {
		smoke.locations.x.push(smoke.startX);
		smoke.locations.y.push(smoke.startY);
	}
}


//return true if the given smoke bubble centered at [x, y] is inside the cloud
function isHitCloud(x, y) {
	if (dist(x, y, cloud.x, cloud. y) < 100/2 - smoke.size || 
			dist(x, y, cloud.x - 60, cloud.y + 50) < 90/2 - smoke.size || 
			dist(x, y, cloud.x + 70, cloud.y + 50) < 90/2 - smoke.size || 
			dist(x, y, cloud.x + 10, cloud.y + 60) < 80/2 - smoke.size) {
		cloud.numSmoke += 1;
		return true;
	} else return false;
}



// return the level of rain as String based on the number of smoke bubbles that hit the cloud
function getRainStrength() {
	if(cloud.numSmoke >= rainSmoke.moderate && cloud.numSmoke < rainSmoke.heavy) {
		return "moderate";
	} else if(cloud.numSmoke >= rainSmoke.heavy) {
		return "heavy";
	} else return "light";
}




/********************************************************/
/********************************************************/
/********************************************************/
//Draw the buildings with random colors and windows
function drawBuildings() {
	//draw building1
	drawBuilding(BD1);
	drawWindows(BD1.windows, BD1.lightOns);
	
	//draw building3
	drawBuilding(BD3);
	drawWindows(BD3.windows, BD3.lightOns);
	
	//draw building2
	drawBuilding(BD2);
	drawWindows(BD2.windows, BD2.lightOns);
	
	//draw building4
	drawBuilding(BD4);
	drawWindows(BD4.windows, BD4.lightOns);
}



function drawBuilding(BD) {
	let x, y, buildingL, buildingColor;

	x = BD.x;
	y = BD.y;
	buildingL = BD.width;
	buildingColor = BD.color;
	
	let buildingW = buildingL/ 3.2;
	
	//from Bird view:
	let bottomLeftCorner = [x, y];
	let bottomRightCorner = [x + buildingL, y];
	let upperLeftCorner = getEndPoints(x, y, buildingW, buildingAngle);
	//upperRightCorner is hidden
	
	fill(buildingColor);
	stroke("#4E4E4E");
	strokeWeight(4);
	
	//draw the front view of the building
	beginShape();
	vertex(bottomLeftCorner[0], bottomLeftCorner[1]);
	vertex(bottomRightCorner[0], bottomRightCorner[1]);
	vertex(bottomRightCorner[0], trueHeight + 20);
	vertex(bottomLeftCorner[0], trueHeight + 20);
	endShape(CLOSE);
	
	
	//draw the side view of the building
	beginShape();
	vertex(bottomLeftCorner[0], bottomLeftCorner[1]);
	vertex(upperLeftCorner[0], upperLeftCorner[1]);
	vertex(upperLeftCorner[0], trueHeight + 20);
	vertex(bottomLeftCorner[0], trueHeight + 20);
	endShape(CLOSE);
}


// return the endpoints [endX, endY] that is to the BOTTOM left angle degree of (x, y)
function getEndPoints(x, y, distance, angle) {
  // Calculate the angle in radians
  angle = radians(angle);
  
  // Calculate the end point coordinates
  let endX = x - distance * cos(angle);
  let endY = y + distance * sin(angle); // Negative because y-axis is flipped in p5.js
  
  return [endX, endY];
}


//return a list containing the locations of all windows of a building
function getWindows(x, y, buildingW) {
	let windows = [];
	for (let i = x + 14; i <= x + buildingW - 20; i += 16) {
		for (let j = y + 20; j <= trueHeight - 20; j += 25) {
			windows.push({x: i, y: j});
		}
	}
	return windows;
}


//draw the light-on windows and the light-dark windows
//BD_windows store all the {x,y} locations of the windows
//BD_LightOns is a random generated int[] that store all the indexes of light-on windows in BD_windows
function drawWindows(BD_Windows, BD_LightOns) {
		for (let i = 0; i < BD_Windows.length; i++) {
    let point = BD_Windows[i];
		stroke(windowStyle.winStroke);
		strokeWeight(windowStyle.winStrokeWeight);
		if(BD_LightOns.includes(i)) {
			fill(windowStyle.lightOn);
		} else {
			fill(windowStyle.lightOff);
		}
    rect(point.x, point.y, windowStyle.winLength, windowStyle.winHeight);
	}
}


//update BD.windows and BD.lightOns for all buildings
function updateWindowsForAllBuildings() {
	//an array for each building that stores the location of the upper left corner of both the Light-on and Light-off windows
	BD1.windows = getWindows(BD1.x, BD1.y, BD1.width);
	BD2.windows = getWindows(BD2.x, BD2.y, BD2.width);
	BD3.windows = getWindows(BD3.x, BD3.y, BD3.width);
	BD4.windows = getWindows(BD4.x, BD4.y, BD4.width);
	
	
	//int[] getRandomUniqueIntegers(total windows of the building, how many percent of windows have its light on)
	BD1.lightOns = getRandomUniqueIntegers(BD1.windows.length, windowStyle.percentLightOns);
	BD2.lightOns = getRandomUniqueIntegers(BD2.windows.length, windowStyle.percentLightOns);
	BD3.lightOns = getRandomUniqueIntegers(BD3.windows.length, windowStyle.percentLightOns);
	BD4.lightOns = getRandomUniqueIntegers(BD4.windows.length, windowStyle.percentLightOns);
}



//return a length-int(l * c) array containing random integers drawn from 0 to int(l * c)
//l is an integer and c is a float ranging from 0 to 1
function getRandomUniqueIntegers(l, c) {
  let length = int(l * c);
	//console.log(l, c, length); //debugging
  let integers = [];
  
  for (let k = 0; k < length; k++) {
    let randomNumber = int(random(l));
    while (integers.includes(randomNumber)) {
      randomNumber = int(random(l));
    }
    integers.push(randomNumber);
  }
	//console.log(integers); //debugging
  return integers;
}


//control the light of windows according to the current time
function updateLight() {
	if (isDayNightShift) {
		windowStyle.percentLightOns = 1 - windowStyle.percentLightOns;
		updateWindowsForAllBuildings();
	}
}


function setUpLightButton() {
  // Create the button
  buildingButton = createButton('Lights');
  buildingButton.parent("sketch-container");
  // Set the building icon (SVG or image)
  //buildingButton.html('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="16" height="6" rx="2" ry="2"></rect><path d="M7 2L17 7V14H7z"></path></svg>');
  buildingButton.position(trueWidth / 2 - 80/2, trueHeight/2 + 50 + 20 - 40);
  buildingButton.size(80, 40);
  buildingButton.style('color', 'white');
  buildingButton.style('background-color', '#91771F');
  buildingButton.style('border', 'none');
  buildingButton.style('border-radius', '70px'); // Make the button circular
  buildingButton.style('font-size', '16px');
	buildingButton.style('box-shadow', '0px 2px 10px 2px rgba(0, 0, 0, 0.2)'); // Add shadow effect
	buildingButton.mousePressed(updateWindowsForAllBuildings); // Change the randomness of the Light-on windows for all buildings

	// Apply hover effect
  buildingButton.style('transition', 'background-color 0.3s ease');
  buildingButton.style('cursor', 'pointer');
  buildingButton.style('user-select', 'none');
  
  // Change background color on hover
  buildingButton.mouseOver(function() {
  	buildingButton.style('background-color', '#9B8B52');
  });
  
  // Revert to original color when not hovered
  buildingButton.mouseOut(function() {
  	buildingButton.style('background-color', '#91771F');
  });
}




/********************************************************/
//Detecting the mouse location is in a building
function isMouseInBuilding(BD) {
	return mouseY >= BD.y && mouseY <= trueHeight && mouseX >= BD.x - BD.width/3.2 && mouseX <= BD.x + BD.width;
}



/********************************************************/
/********************************************************/
/********************************************************/
//return true if the time is between 7pm to 7am
function isNight() {
	return (currentTime.getHours() >= 19 && currentTime.getHours() <= 23) || (currentTime.getHours() >= 0 && currentTime.getHours() <= 6);
}

function updateSceneColors() {
	let targetBackgroundColor;
	
	if (isNight()) {
		targetBackgroundColor = color("#2D2D2D");
	} else {
		targetBackgroundColor = color("#80CBF7");
	}
	
	backgroundColor = lerpColor(backgroundColor, targetBackgroundColor, 0.05);
}


//update currNight and prevNight, and return true if there is a day-night shift
function updateNight() {
	if (isNight()) currNight = true;
	else currNight = false;
	let isDayNightShift = (currNight != prevNight);
	prevNight = currNight;
	return isDayNightShift;
}

function incrementOneMinute() {
	currentTime.setMinutes(currentTime.getMinutes() + 1);
}


function addHours() {
  // Add 2 hours to additional minutes
  currentTime.setHours(currentTime.getHours() + 2);
}

function displayCurrentTime() {
  let formattedHour = nf(currentTime.getHours(), 2);
  let formattedMinute = nf(currentTime.getMinutes(), 2);
  let formattedTime = `${formattedHour}:${formattedMinute}`;
  
  // Set text color based on the current time range
  if (isNight()) {
    // Night mode: dark gray text color with white shadow
    textColor = color(255);
    textStrokeColor = color(64);
  } else {
    // Day mode: white text color with dark gray shadow
		textColor = color(64);
    textStrokeColor = color(255);
  }
  
  // Display the current time at the center of the screen
  textAlign(CENTER, CENTER);
  fill(textColor);
	stroke(textStrokeColor);
	strokeWeight(4);
  textFont('Lucida Console', 80);
	textStyle(NORMAL);
	//textFont('Courier New', 80);
  text(formattedTime, trueWidth / 2, trueHeight / 2 - 100);
}





/********************************************************/
/********************************************************/
/********************************************************/

function setUpAddHoursButton() {
  // Create the button
  button = createButton('+ 2 hours');
  button.position(trueWidth / 2 - 60, trueHeight / 2 - 40);
  button.size(120, 50);
  button.mousePressed(addHours);
  button.style('color', 'black');
  button.style('background-color', '#EEEEEE"');
  button.style('border', 'none');
  button.style('border-radius', '60px');
  button.style('box-shadow', '0px 2px 4px rgba(0, 0, 0, 0.2)');
  button.style('font-size', '20px');
	
	// Apply hover effect
  button.style('transition', 'background-color 0.3s ease');
  button.style('cursor', 'pointer');
  button.style('user-select', 'none');
}

function updateButtonStyles(currentHour) {
  let targetButtonColor;
  let targetTextColor;
  if (isNight()) {
    // Night mode: set target button color to black and text color to white
    targetButtonColor = color(0);
    targetTextColor = color(255);
  } else {
    // Day mode: set target button color to white and text color to black
    targetButtonColor = color("#EEEEEE");
    targetTextColor = color(0);
  }
  
  // Gradually change button color over time
  currentButtonColor = lerpColor(currentButtonColor, targetButtonColor, 0.05);
  button.style('background-color', currentButtonColor.toString('rgb'));

  // Gradually change text color over time
  currentTextColor = lerpColor(currentTextColor, targetTextColor, 0.05);
  button.style('color', currentTextColor.toString('rgb'));
}




/********************************************************/
/********************************************************/
/************************************************************/

// Set up rain button
function setUpRainButton() {
	rainDuration = random(3600000, 36000000);
	
  // Create the button
  rainButton = createButton('Rainy');
  rainButton.parent("sketch-container");
  rainButton.position(trueWidth / 2 - 80/2 - buttonGap - 80, trueHeight/2 + 50 + 20 - 40);
  rainButton.size(80, 40);
  rainButton.style('color', 'white');
  rainButton.style('background-color', '#003D5B');
  rainButton.style('border', 'none');
  rainButton.style('border-radius', '70px'); // Make the button circular
  rainButton.style('font-size', '16px');
	rainButton.style('box-shadow', '0px 2px 10px 2px rgba(0, 0, 0, 0.2)'); // Add shadow effect
	rainButton.mousePressed(startRain); // Call startRain when button is pressed

	// Apply hover effect
  rainButton.style('transition', 'background-color 0.3s ease');
  rainButton.style('cursor', 'pointer');
  rainButton.style('user-select', 'none');
  
  // Change background color on hover
  rainButton.mouseOver(function() {
  rainButton.style('background-color', '#30638E');
  });
  
  // Revert to original color when not hovered
  rainButton.mouseOut(function() {
    rainButton.style('background-color', '#003D5B');
  });
}


// Function to start rain
function startRain() {
	// rain last from 1 to 4 hours
	rainDuration = int(random(1, 5));
	rainStartHour = currentTime.getHours();
  rainEndHour = (currentTime.getHours() + rainDuration) % 24;
	isRainy = true;
	rainStrength = random(['light', 'moderate', 'heavy']);
	if (rainStrength == 'light') cloud.numSmoke = rainSmoke.light;
	else if (rainStrength == 'moderate') cloud.numSmoke = rainSmoke.moderate;
	else if (rainStrength == 'heavy') cloud.numSmoke = rainSmoke.heavy;
}

//Function to start rain when smoke bubbles hit the cloud
function startRainSmoke() {
	// rain last from 1 to 4 hours
	rainDuration = int(random(1, 5));
	rainStartHour = currentTime.getHours();
  rainEndHour = (currentTime.getHours() + rainDuration) % 24;
	isRainy = true;
	rainStrength = getRainStrength(cloud.numSmoke);
}


function getRain(rainStrength) {
	// Set variable values according to rainStrength of int [0, 1, 2]
	// the smaller the addi value, the heavier the rain looks like
	let addi;
	let dropLength;
	let dropAngle;
	if (rainStrength == 'light') {
		addi = 200;
		dropLength = 20;
		dropAngle = 3/4;
	} else if (rainStrength == 'moderate') {
		addi = 80;
		dropLength = 20;
		dropAngle = 2/3;
	} else {
		addi = 20;
		dropLength = 30;
		dropAngle = 3/5;
	}
	
	
  // Set rain drop color and line width
	if (isNight()) {
		stroke(255);
	} else {
		stroke(0);
	}
  strokeWeight(1.5);
  
  // Draw rain drops (thin line segments falling at a 120-degree angle)
  for (let i = 0; i < trueWidth; i += addi) {
    // Calculate starting point for raindrop
    let startX = random(trueWidth);
    let startY = random(trueHeight); // Start raindrop above the canvas
    
    // Calculate end point for raindrop (falling in a 120-degree angle)
    let endX = startX + dropLength * cos(PI * dropAngle); // Adjust length of raindrop
    let endY = startY + dropLength * sin(PI * dropAngle); // Adjust length of raindrop
    
    // Draw raindrop
    line(startX, startY, endX, endY);
  }
}


function controlRain() {
	let rainyHours; // how many hours has the rain lasts for
	if (currentTime.getHours() < rainStartHour) { //eg. current time 1:xx; rain starts at 23:xx and ends at 3:xx
		rainyHours = currentTime.getHours() + 24 - rainStartHour;
	} else {
		rainyHours = currentTime.getHours() - rainStartHour;
	}
	
	rainStrength = getRainStrength();
	
	if (currentTime.getHours() == rainEndHour) {
		if (currentTime.getMinutes() >= 20 && currentTime.getMinutes() < 40) {
			rainStrength = 'moderate';
			cloud.numSmoke = rainSmoke.moderate;
		} else {
			rainStrength = 'light';
			cloud.numSmoke = rainSmoke.light;
		}
	} 
	
	if(rainyHours > rainDuration) isRainy = false;
	if(isRainy) {
		getRain(rainStrength);
	} else { //isRainy = false
		cloud.numSmoke = 0;
	}
}

function displayRainEndTime() {
	if (!isRainy) return;
	let formattedTime = `${rainStrength} rain will stop at approximately ${rainEndHour} : 59.`;
	let formattedSmoke = `Thickness of the Cloud: ${cloud.numSmoke}`;
	
  textAlign(CENTER, CENTER);
  fill(textColor);
	stroke(textStrokeColor);
	strokeWeight(3);
	textStyle(NORMAL);
	
	// Display the approximate time the rain will end
  textFont('Lucida Console', 24);
  text(formattedTime, trueWidth / 2, trueHeight / 2 + 160);
	
	// Display the number of smoke bubbles that hit the cloud
	textFont('Lucida Console', 18);
  text(formattedSmoke, trueWidth / 2, trueHeight / 2 + 200);
}


/********************************************************/
//Notify the user when the song is playing
function displaySong() {
	if(!isSongPlaying) return;
	textAlign(CENTER, CENTER);
	stroke(textStrokeColor);
  fill(textColor);
	strokeWeight(1);
	
	let formattedSong = `♩ ♪ "Uma" by J Boog, 11 Aug 2023 ♫ ♬`;
  textFont('Lucida Console', 16);
	textStyle(ITALIC);
  text(formattedSong, trueWidth / 2, 9/10 * trueHeight);
}



/********************************************************/
/********************************************************/
//*************************************************************************//
/**
 * Called by the browser when our special button is clicked
 */
function buttonPressed() {
	// Change the weather
	backgroundColor = "#6C6C6C";
}

function mouseClicked() {	
	//Foreground to background: BD4 -> BD2 -> BD3 -> BD1 -> Ship
	/* //refresh each building individually
	if(isMouseInBuilding(BD4)) BD4.color = generateADifferentColor(BD4.color, buildingColors);
	else if(isMouseInBuilding(BD2)) BD2.color = generateADifferentColor(BD2.color, buildingColors);
	else if(isMouseInBuilding(BD3)) BD3.color = generateADifferentColor(BD3.color, buildingColors);
	else if(isMouseInBuilding(BD1)) BD1.color = generateADifferentColor(BD1.color, buildingColors);
	*/
	
	//refresh all building colors
	if (isMouseInBuilding(BD4) || isMouseInBuilding(BD2) || 
			isMouseInBuilding(BD3) || isMouseInBuilding(BD1)) {
		BD1.color = buildingColors[int(random(buildingColors.length))];
		BD2.color = buildingColors[int(random(buildingColors.length))];
		BD3.color = buildingColors[int(random(buildingColors.length))];
		BD4.color = buildingColors[int(random(buildingColors.length))];
	}
	
	else if (isMouseInShip()) {
    // Do something when the ship is clicked
    //console.log("Ship clicked!"); //DEBUG
		//console.log(smoke.locations.x.length); //DEBUG
		addSmoke();
  }
}

function generateRandomColor() {
  // Generate random values for red, green, and blue channels
  let red = Math.floor(Math.random() * 256);
  let green = Math.floor(Math.random() * 256);
  let blue = Math.floor(Math.random() * 256);

  // Convert the decimal values to hexadecimal and format them
  let redHex = red.toString(16).padStart(2, '0');
  let greenHex = green.toString(16).padStart(2, '0');
  let blueHex = blue.toString(16).padStart(2, '0');

  // Combine the hexadecimal values to form the color code
  let colorCode = `#${redHex}${greenHex}${blueHex}`;

  return colorCode;
}


//Given an array of colors String[], generate a new color from the array which is different to the current color
//arr.splice(index, length) remove the elements from arr starting from arr[index] to arr[index + length - 1], 
//and returns an array containing the removed elements
function generateADifferentColor(currentColor, colors) {
	let indexOfCurrentColor = colors.indexOf(currentColor);

	//use colors.slice() to create a copy of colors so that colors won't be modified when calling .splice(index, removedLength)
	let differentColors = colors.slice();
	differentColors.splice(indexOfCurrentColor, 1);
	return differentColors[int(random(differentColors.length))];
}
	
