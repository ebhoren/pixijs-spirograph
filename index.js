import interpolate from 'color-interpolate';
import rgbHex from 'rgb-hex';
import anime from 'animejs';
import drawRoundedPolygon from './utils/pixijs-roundedPolygon';

const aqua = '#31cbc1',
	  blue = '#08556f',
	  red  = '#e8203e',
	  yellow = '#e5be06',
	  peach = '#dd5a55',
	  purple = '#8524d7';

const settings = {
	width: window.innerWidth,
	height: window.innerHeight,
};
const params = {
	shape: 'Pentagon',
	size: 200,
	quantity: 12,
	startColor: purple,
	endColor: aqua,
	startAngle: 0, 
	arc: 30,
	shadowAlpha: 0.15,
	shadowAngle: 0,
	shadowArc: 30,
	shadowScale: 1.05,
	shadow: {
		alpha: 0.15,
		scale: 1.05,
	},
	ellipse: {
		ratio: 0.6,
	},
	rect: {
		radius: 16,
	},
	pentagon: {
		radius: 12,
	},
	triangle: {
		radius: 12,
	},
	square: {
		radius: 30,
		offset: -0.4,
	},
	petal: {
		innerX: 0.15, 
		innerY: 0.15,
		outerX: 0.15,
		outerY: 0.15,
	},
};


const app 	 		= new PIXI.Application(settings.width, settings.height, { antialias: true });
const shadows 		= new PIXI.Container();
const container 	= new PIXI.Container();
const renderer 		= app.renderer;
const items 		= [];
const shadowItems 	= [];
const pool 			= [];

document.body.appendChild(app.view);
app.stage.addChild(shadows, container);

// Creating a GUI and a subfolder.
const gui = new dat.GUI({name: 'Params'});
	  gui.add(params, 'shape', ['Rectangle', 'Pentagon', 'Ellipse', 'Triangle', 'Square', 'Petal']).onChange( onShapeChange );
	  gui.add(params, 'quantity', 1, 100, 1).onChange( refreshGraphics );
	  gui.add(params, 'size', 100, 500, 5).onChange( refreshGraphics );
	  gui.add(params, 'startAngle', 0, 360).onChange( refreshGraphics );
	  gui.add(params, 'arc', 0, 180).onChange( refreshGraphics );
	  gui.addColor(params, 'startColor').onChange( refreshGraphics );
	  gui.addColor(params, 'endColor').onChange( refreshGraphics );

const shadow = gui.addFolder('Shadow');
	  shadow.add(params.shadow, 'alpha', 0, 1, 0.05).onChange( refreshGraphics );
	  shadow.add(params.shadow, 'scale', 0.1, 2, 0.05).onChange( refreshGraphics );

const ellipse = gui.addFolder('Ellipse');
	  ellipse.add(params.ellipse, 'ratio', -1, 1, 0.1).onChange( refreshGraphics );

const rectangle = gui.addFolder('Rectangle');
	  rectangle.add(params.rect, 'radius', 1, 100).onChange( refreshGraphics );

const pentagon = gui.addFolder('Pentagon');
	  pentagon.add(params.pentagon, 'radius', 1, 100).onChange( refreshGraphics );

const triangle = gui.addFolder('Triange');
	  triangle.add(params.triangle, 'radius', 1, 100).onChange( refreshGraphics );

const square = gui.addFolder('Square');
	  square.add(params.square, 'radius', 1, 200).onChange( refreshGraphics );
	  square.add(params.square, 'offset', -1, 1, 0.1).onChange( refreshGraphics );

const petal = gui.addFolder('Petal');
	  petal.add(params.petal, 'innerX', 0.05, 1, 0.01).onChange( refreshGraphics );
	  petal.add(params.petal, 'innerY', 0.05, 1, 0.01).onChange( refreshGraphics );
	  petal.add(params.petal, 'outerX', 0.05, 1, 0.01).onChange( refreshGraphics );
	  petal.add(params.petal, 'outerY', 0.05, 1, 0.01).onChange( refreshGraphics );



function onShapeChange() {
	ellipse.close();
	rectangle.close();
	pentagon.close();
	triangle.close();
	square.close();
	petal.close();

	switch(params.shape) {
		case 'Rectangle': rectangle.open(); break;
		case 'Pentagon': pentagon.open(); break;
		case 'Ellipse': ellipse.open(); break;
		case 'Triangle': triangle.open(); break;
		case 'Square': square.open(); break;
		case 'Petal': petal.open(); break;
	};

	refreshGraphics();
};


function drawEllipse(graphics, width, height, rotation = 0, color = 0xffffff) {
	graphics.rotation = rotation * PIXI.DEG_TO_RAD;
	graphics.clear();
	graphics.lineStyle(1, color, 1);
	graphics.drawEllipse(0, 0, width, height);
};

function drawRoundedRect(graphics, width, rotation = 0, color = 0xffffff) {
	graphics.rotation = rotation * PIXI.DEG_TO_RAD;
	graphics.clear();
	graphics.lineStyle(1, color, 1);
	graphics.drawRoundedRect(width * -0.5, width * -0.5, width, width, params.rect.radius);
};

function drawPentagone(graphics, width, rotation = 0, color = 0xffffff) {
    const { radius } = params.pentagon;
	const pentagon = [];

    const step  = 2 * Math.PI / 5; //Precalculate step value
    const shift = (Math.PI / 180.0) * -18; //Quick fix ;)

    for (let i = 0, currentStep; i < 5; i++) {
    	currentStep = i * step + shift;
    	pentagon.push( new PIXI.Point(width * Math.cos(currentStep), width * Math.sin(currentStep)) );
    }

	graphics.rotation = rotation * PIXI.DEG_TO_RAD;
	graphics.clear();
	graphics.lineStyle(1, color, 1);

	drawRoundedPolygon(graphics, pentagon, radius);
};

function drawTriangle(graphics, width, rotation = 0, color = 0xffffff) {
	const { radius } = params.triangle;
	const triangle = [
		new PIXI.Point(0, width * -0.5),
		new PIXI.Point(width * 0.5, width * 0.5),
		new PIXI.Point(width * -0.5, width * 0.5),
	];

	graphics.rotation = rotation * PIXI.DEG_TO_RAD;
	graphics.clear();
	graphics.lineStyle(1, color, 1);

	drawRoundedPolygon(graphics, triangle, radius);
};

function drawSquare(graphics, width, rotation = 0, color = 0xffffff, radius = 30) {
	const halfRadius = radius * 0.5;
	const { offset } = params.square;

	graphics.rotation = rotation * PIXI.DEG_TO_RAD;
	graphics.clear();
	graphics.lineStyle(1, color, 1);
	graphics.moveTo(width * -0.5 + halfRadius, width * -0.5); // top-left
	graphics.quadraticCurveTo(0, width * offset, width * 0.5 - halfRadius, width * -0.5); // top
	graphics.quadraticCurveTo(width * 0.5, width * -0.5, width * 0.5, width * -0.5 + halfRadius); // top-right
	graphics.quadraticCurveTo(width * -offset, 0, width * 0.5, width * 0.5 - halfRadius); // right
	graphics.quadraticCurveTo(width * 0.5, width * 0.5, width * 0.5 - halfRadius, width * 0.5); // right-bottom
	graphics.quadraticCurveTo(0, width * -offset, width * -0.5 + halfRadius, width * 0.5); // bottom
	graphics.quadraticCurveTo(width * -0.5, width * 0.5, width * -0.5, width * 0.5 - halfRadius); // bottom-left
	graphics.quadraticCurveTo(width * offset, 0, width * -0.5, width * -0.5 + halfRadius); // left
	graphics.quadraticCurveTo(width * -0.5, width * -0.5, width * -0.5 + halfRadius, width * -0.5); // top-left
};

function drawPetal(graphics, width, rotation = 0, color = 0xffffff) {
	const { innerX, innerY, outerX, outerY } = params.petal;

	graphics.rotation = rotation * PIXI.DEG_TO_RAD;
	graphics.clear();
	graphics.lineStyle(1, color, 1);
	graphics.moveTo(0, width * -0.5); // top
	graphics.quadraticCurveTo(width * outerX, width * -0.5, width * innerX, width * -innerY);
	graphics.quadraticCurveTo(width * 0.5, width * -outerY, width * 0.5, 0);
	graphics.quadraticCurveTo(width * 0.5, width * outerY, width * innerX, width * innerY);
	graphics.quadraticCurveTo(width * outerX, width * 0.5, 0, width * 0.5);
	graphics.quadraticCurveTo(width * -outerX, width * 0.5, width * -innerX, width * innerY);
	graphics.quadraticCurveTo(width * -0.5, width * outerY, width * -0.5, 0);
	graphics.quadraticCurveTo(width * -0.5, width * -outerY, width * -innerX, width * -innerY);
	graphics.quadraticCurveTo(width * -outerX, width * -0.5, 0, width * -0.5);
};


function refreshGraphics() {
	const { shape, size, quantity, startColor, endColor, startAngle, arc } = params;
	const colormap = interpolate([startColor, endColor]);
	const shadowScale = params.shadow.scale;

	shadows.alpha = params.shadow.alpha;

	for(let i = 0; i<quantity; i++) {
		let angle  		= startAngle + arc * (i / quantity);
		let color 		= '0x' + rgbHex( colormap((i + 1) / quantity) );

		// get current item or used pooled one if necessary
		let graphics 	= items[i] || pool.shift();
		let shadow 		= shadowItems[i] || pool.shift();

		// if current item doesn't exists and pool is empty, create a new one
		if( !graphics ) {
			graphics = new PIXI.Graphics();
			container.addChild(graphics);

			items.push(graphics);
		}

		// if current shadow doesn't exists and pool is empty, create a new one
		if( !shadow ) {
			shadow = new PIXI.Graphics();
			shadows.addChild(shadow);

			shadowItems.push(shadow);
		}

		// draw graphics
		if( shape === 'Rectangle') {
			drawRoundedRect(graphics, size, angle, color);
			drawRoundedRect(shadow, size * shadowScale, angle, color);
		}
		else if ( shape === 'Pentagon' ) {
			drawPentagone(graphics, size, angle, color);
			drawPentagone(shadow, size * shadowScale, angle, color);
		}
		else if ( shape === 'Ellipse' ) {
			drawEllipse(graphics, size * params.ellipse.ratio, size, angle, color);
			drawEllipse(shadow, size * shadowScale * params.ellipse.ratio, size * shadowScale, angle, color);
		}
		else if ( shape === 'Triangle' ) {
			drawTriangle(graphics, size, angle, color);
			drawTriangle(shadow, size * shadowScale, angle, color);
		}
		else if ( shape === 'Square' ) {
			drawSquare(graphics, size, angle, color, params.square.radius);
			drawSquare(shadow, size * shadowScale, angle, color, params.square.radius * shadowScale);
		}
		else if ( shape === 'Petal' ) {
			drawPetal(graphics, size, angle, color);
			drawPetal(shadow, size * shadowScale, angle, color);
		}
	}

	// pool useless graphics
	for(let i = items.length, n = quantity; i>n; i--) {
		let graphics = items.pop();
		let shadow = shadowItems.pop();

		pool.push(graphics, shadow);

		container.removeChild( graphics );
		shadows.removeChild( shadow );
	}	
};
/*
function animateRectangles() {
	app.ticker.add(() => {
		delta += 0.08;
		//trails.unshift( 35 * Math.cos( delta ) );
		trails.unshift( delta );

		if( trails.length > settings.num_rectangles ) trails.pop();

		for(var i = 0, n = settings.num_rectangles, rect, graphic; i<n; i++) {
			rect 		= rectangles[i];
			graphic 	= rect.graphics;
			//graphic.y 	= 35 * Math.cos( trails[i] );
			graphic.rotation = rect.rotation + PIXI.DEG_TO_RAD * 45 * Math.cos( trails[i] );
		}
	});
}
*/

//animateRectangles();


function onResize() {
	settings.width  = window.innerWidth;
	settings.height = window.innerHeight;

	container.x = shadows.x = settings.width * 0.5;
	container.y = shadows.y = settings.height * 0.5;

	renderer.resize(settings.width, settings.height);
}

window.addEventListener('resize', onResize);


onShapeChange();
onResize();





if (module.hot) {
  module.hot.accept(function () {
    window.location.reload();
  });
}