// An IIFE ("Iffy") - see the notes in mycourses
(function(){
	"use strict";

	// cell data
	var cell = {
		isAlive: false,
		tempR: 0,
		tempG: 0,
		tempB: 0,
		tempA: 0,
		r: 0,
		g: 0,
		b: 0,
		a: 0,
		neighbours: 0,
		isSpawner: false,
		sampleNum: 0,
		energized: false,
		energizedNeighbours: 0
	};

	// grid data
	var grid = {
		size: 0,
		cells: undefined,
		geometries:[],
		lights:[],
  		shaders:[],
  		mouseControls: null,
  		view3D: false,
		updateRate: 0,
		init: function(size){
			// create 2d matrix (x,y)
			this.size = size;
			this.cells = [];

			// set up 3d view
			this.setup();

			var sampleNumber = 0;

			for(var x = 0; x<size; x++){
				this.cells.push([]);
				for(var y = 0; y<size; y++){
					this.cells[x].push(Object.create(cell));
					//if(x > 0)this.createBox(x, y);
					this.createBox(x, y);
					// set color spawn locations
					if((x%3 == 2) && (y%6 == 3)){
						this.cells[x][y].r = getRandomInt(100,255);
						this.cells[x][y].g = getRandomInt(100,255);
						this.cells[x][y].b = getRandomInt(100,255);
						this.cells[x][y].isSpawner = true;
						this.cells[x][y].isAlive = true;
						this.cells[x][y].sampleNum = sampleNumber;
						sampleNumber++;
					}
				}
			}

			this.createLights();
			let composer = this.setupEffectsComposer();
			this.shader();
		},
		setup: function() {
			this.scene = new THREE.Scene();

			this.camera = new THREE.PerspectiveCamera(
			75, // field of view
			1 / 1, //aspect ratio
			.1, // near plane
			1000 // far plane
			);
			
			this.camera.position.z = 51;

			this.renderer = new THREE.WebGLRenderer({canvas: document.querySelector('#canvas3D')});

			
			//brakes tracklist......
			this.mouseControls = new THREE.OrbitControls(grid.camera , this.renderer.domElement, this.renderer.domElement);
			console.log(this.mouseControls);
			grid.mouseControls.addEventListener('change', function(){
				grid.composer.render();
			});
			
			this.renderer.setSize( 640, 640 );
		},
		createLights: function(){
			if( this.lights.length > 1 ) return;

			var ambientLight = new THREE.AmbientLight(0xFFFFFF);

			var pointLight = new THREE.PointLight( 0xFFFFFF );
			pointLight.position.x = 100;
			pointLight.position.y = 100;
			pointLight.position.z = -130;

			var pointLight2 = new THREE.PointLight( 0x666666 );
			pointLight2.position.x = 0;
			pointLight2.position.y = 0;
			pointLight2.position.z = 260;

			this.lights.push( ambientLight, pointLight, pointLight2 );

			this.scene.add( ambientLight );
			this.scene.add( pointLight );
			this.scene.add( pointLight2 );
		},
		setupEffectsComposer: function(){
			this.composer = new THREE.EffectComposer( this.renderer );

			this.renderScene = new THREE.RenderPass( this.scene, this.camera );

			this.renderScene.clear = true;
			this.renderScene.renderToScreen = true;

			this.composer.addPass( this.renderScene );

			return this.composer
		},
		shader: function() {
			var shader = new THREE.ShaderPass( THREE.CopyShader );
			shader.renderToScreen = true;

			this.shaders.push( shader );
			this.composer.addPass( shader );
		},
		createBox: function(x, y){
			var box = new THREE.BoxGeometry( 1,1,1 ); // x,y,z scale

			var mat = new THREE.MeshPhongMaterial( { color: 0xFFFFFF, shading: THREE.FlatShading, shininess: 50 } );
			//let mat = new THREE.MeshBasicMaterial({ color:color })
			mat.transparent = true;
			var cube = new THREE.Mesh( box, mat );
			cube.position.x = (x*1.5) - 36.5;
			cube.position.y = (y*1.5) - 36.5;
			this.geometries.push( cube );
			this.scene.add( cube );
		},
		draw: function(mouse, selectedCell, tintColor){
			for(var x = 0; x<this.size; x++){
				for(var y = 0; y<this.size; y++){
					ctx.fillStyle = makeColor(this.cells[x][y].r, this.cells[x][y].g, this.cells[x][y].b, this.cells[x][y].a);
					ctx.strokeStyle = '#C0C0C0';
					if(this.cells[x][y].isSpawner === true && this.cells[x][y].isAlive === false){
							ctx.strokeRect(x*640/this.size , y*640/this.size , 640/this.size, 640/this.size);
					}
					if(this.cells[x][y].isSpawner === true && this.cells[x][y].isAlive === true){
							ctx.fillRect(x*640/this.size , y*640/this.size , 640/this.size, 640/this.size);
							ctx.strokeRect(x*640/this.size , y*640/this.size , 640/this.size, 640/this.size);
							if(this.cells[x][y].energized === true) {
								ctx.fillStyle = tintColor;
								ctx.fillRect(x*640/this.size , y*640/this.size , 640/this.size, 640/this.size);
							}
						}
					else{
						if(this.cells[x][y].isAlive === true){
							ctx.fillRect(x*640/this.size , y*640/this.size , 640/this.size, 640/this.size);

							if(this.cells[x][y].energized === true){
								ctx.fillStyle = tintColor;
								ctx.fillRect(x*640/this.size , y*640/this.size , 640/this.size, 640/this.size);
							}
						}
					}
				}
			}

			//highlight the cell that the mouse is on
			var cellX = Math.floor(mouse.x/12.8);
			var cellY = Math.floor(mouse.y/12.8);

			// highlight the selected cell
			if(selectedCell.x != -1){
				ctx.strokeStyle = 'red';
				ctx.strokeRect(selectedCell.x*640/this.size , selectedCell.y*640/this.size , 640/this.size, 640/this.size);
			}

			// draw a green outline on the firts selected cell
			if(firstCellChosen === true){
				ctx.strokeStyle = 'rgb(0, 255, 0)';
				ctx.strokeRect(firstCellPos.x*640/grid.size , firstCellPos.y*640/grid.size , 640/grid.size, 640/grid.size);
			}
		},
		updateSpawners: function(data){
			for(var x = 0; x<this.size; x++){
				for(var y = 0; y<this.size; y++){
					if(this.cells[x][y].isSpawner === true){
						var num = this.cells[x][y].sampleNum;
						if(data[num] == 0){
							this.cells[x][y].isAlive = false;
						}
						else{
							this.cells[x][y].isAlive = true;
							this.cells[x][y].a = data[num]/255;
						}
						if(data[num] > thresholdSlider.value){
							this.cells[x][y].energized = true;
						}
						else{
							this.cells[x][y].energized = false;
						}
					}
				}
			}
		},
		checkNeighbours: function(){
			for(var x = 0; x<this.size; x++){
				for(var y = 0; y<this.size; y++){
					// check neighbours of non-spawner cells
					if(this.cells[x][y].isSpawner === false){
						// top left corner
						if(x === 0 && y === 0){
							if(this.cells[1][0].isAlive === true) {
								this.cells[0][0].neighbours++;
								this.cells[0][0].tempR += (this.cells[1][0].r * this.cells[1][0].a);
								this.cells[0][0].tempG += (this.cells[1][0].g * this.cells[1][0].a);
								this.cells[0][0].tempB += (this.cells[1][0].b * this.cells[1][0].a);
								this.cells[0][0].tempA += this.cells[1][0].a;
							}
							if(this.cells[1][1].isAlive === true) {
								this.cells[0][0].neighbours++;
								this.cells[0][0].tempR += (this.cells[1][1].r * this.cells[1][1].a);
								this.cells[0][0].tempG += (this.cells[1][1].g * this.cells[1][1].a);
								this.cells[0][0].tempB += (this.cells[1][1].b * this.cells[1][1].a);
								this.cells[0][0].tempA += this.cells[1][1].a;
							}
							if(this.cells[0][1].isAlive === true) {
								this.cells[0][0].neighbours++;
								this.cells[0][0].tempR += (this.cells[0][1].r * this.cells[0][1].a);
								this.cells[0][0].tempG += (this.cells[0][1].g * this.cells[0][1].a);
								this.cells[0][0].tempB += (this.cells[0][1].b * this.cells[0][1].a);
								this.cells[0][0].tempA += this.cells[0][1].a;
							}

							if(this.cells[1][0].energized === true) this.cells[0][0].energizedNeighbours++;
							if(this.cells[1][1].energized === true) this.cells[0][0].energizedNeighbours++;
							if(this.cells[0][1].energized === true) this.cells[0][0].energizedNeighbours++;
						}
						// bottom left corner
						else if(x === 0 && y === (this.size - 1)){
							if(this.cells[1][this.size-1].isAlive === true) {
								this.cells[0][this.size-1].neighbours++;
								this.cells[0][this.size-1].tempR+= (this.cells[1][this.size-1].r * this.cells[1][this.size-1].a);
								this.cells[0][this.size-1].tempG+= (this.cells[1][this.size-1].g * this.cells[1][this.size-1].a);
								this.cells[0][this.size-1].tempB+= (this.cells[1][this.size-1].b * this.cells[1][this.size-1].a);
								this.cells[0][this.size-1].tempA+= this.cells[1][this.size-1].a;
							}
							if(this.cells[1][this.size-2].isAlive === true) {
								this.cells[0][this.size-1].neighbours++;
								this.cells[0][this.size-1].tempR += (this.cells[1][this.size-2].r * this.cells[1][this.size-2].a);
								this.cells[0][this.size-1].tempG += (this.cells[1][this.size-2].g * this.cells[1][this.size-2].a);
								this.cells[0][this.size-1].tempB += (this.cells[1][this.size-2].b * this.cells[1][this.size-2].a);
								this.cells[0][this.size-1].tempA += this.cells[1][this.size-2].a;
							}
							if(this.cells[0][this.size-2].isAlive === true) {
								this.cells[0][this.size-1].neighbours++;
								this.cells[0][this.size-1].tempR += (this.cells[0][this.size-2].r * this.cells[0][this.size-2].a);
								this.cells[0][this.size-1].tempG += (this.cells[0][this.size-2].g * this.cells[0][this.size-2].a);
								this.cells[0][this.size-1].tempB += (this.cells[0][this.size-2].b * this.cells[0][this.size-2].a);
								this.cells[0][this.size-1].tempA += this.cells[0][this.size-2].a;
							}

							if(this.cells[1][this.size-1].energized === true) this.cells[0][this.size-1].energizedNeighbours++;
							if(this.cells[1][this.size-2].energized === true) this.cells[0][this.size-1].energizedNeighbours++;
							if(this.cells[0][this.size-2].energized === true) this.cells[0][this.size-1].energizedNeighbours++;
						} 
						// top right corner
						else if(x == (this.size - 1) && y === 0){
							if(this.cells[this.size-2][0].isAlive === true) {
								this.cells[this.size-1][0].neighbours++;
								this.cells[this.size-1][0].tempR += (this.cells[this.size-2][0].r * this.cells[this.size-2][0].a);
								this.cells[this.size-1][0].tempG += (this.cells[this.size-2][0].g * this.cells[this.size-2][0].a);
								this.cells[this.size-1][0].tempB += (this.cells[this.size-2][0].b * this.cells[this.size-2][0].a);
								this.cells[this.size-1][0].tempA += this.cells[this.size-2][0].a;
							}
							if(this.cells[this.size-2][1].isAlive === true) {
								this.cells[this.size-1][0].neighbours++;
								this.cells[this.size-1][0].tempR += (this.cells[this.size-2][1].r * this.cells[this.size-2][1].a);
								this.cells[this.size-1][0].tempG += (this.cells[this.size-2][1].g * this.cells[this.size-2][1].a);
								this.cells[this.size-1][0].tempB += (this.cells[this.size-2][1].b * this.cells[this.size-2][1].a);
								this.cells[this.size-1][0].tempA += this.cells[this.size-2][1].a;
							}
							if(this.cells[this.size-1][1].isAlive === true) {
								this.cells[this.size-1][0].neighbours++;
								this.cells[this.size-1][0].tempR += (this.cells[this.size-1][1].r * this.cells[this.size-1][1].a);
								this.cells[this.size-1][0].tempG += (this.cells[this.size-1][1].g * this.cells[this.size-1][1].a);
								this.cells[this.size-1][0].tempB += (this.cells[this.size-1][1].b * this.cells[this.size-1][1].a);
								this.cells[this.size-1][0].tempA += this.cells[this.size-1][1].a;
							}

							if(this.cells[this.size-2][0].energized === true) this.cells[this.size-1][0].energizedNeighbours++;
							if(this.cells[this.size-2][1].energized === true) this.cells[this.size-1][0].energizedNeighbours++;
							if(this.cells[this.size-1][1].energized === true) this.cells[this.size-1][0].energizedNeighbours++;
						} 
						// bottom right corner
						else if(x == (this.size - 1) && y == (this.size - 1)){
							if(this.cells[this.size-2][this.size-1].isAlive === true) {
								this.cells[this.size-1][this.size-1].neighbours++;
								this.cells[this.size-1][this.size-1].tempR += (this.cells[this.size-2][this.size-1].r * this.cells[this.size-2][this.size-1].a);
								this.cells[this.size-1][this.size-1].tempG += (this.cells[this.size-2][this.size-1].g * this.cells[this.size-2][this.size-1].a);
								this.cells[this.size-1][this.size-1].tempB += (this.cells[this.size-2][this.size-1].b * this.cells[this.size-2][this.size-1].a);
								this.cells[this.size-1][this.size-1].tempA += this.cells[this.size-2][this.size-1].a;
							}
							if(this.cells[this.size-2][this.size-2].isAlive === true) {
								this.cells[this.size-1][this.size-1].neighbours++;
								this.cells[this.size-1][this.size-1].tempR += (this.cells[this.size-2][this.size-2].r * this.cells[this.size-2][this.size-2].a);
								this.cells[this.size-1][this.size-1].tempG += (this.cells[this.size-2][this.size-2].g * this.cells[this.size-2][this.size-2].a);
								this.cells[this.size-1][this.size-1].tempB += (this.cells[this.size-2][this.size-2].b * this.cells[this.size-2][this.size-2].a);
								this.cells[this.size-1][this.size-1].tempA += this.cells[this.size-2][this.size-2].a;

							}
							if(this.cells[this.size-1][this.size-2].isAlive === true) {
								this.cells[this.size-1][this.size-1].neighbours++;
								this.cells[this.size-1][this.size-1].tempR += (this.cells[this.size-1][this.size-2].r * this.cells[this.size-1][this.size-2].a);
								this.cells[this.size-1][this.size-1].tempG += (this.cells[this.size-1][this.size-2].g * this.cells[this.size-1][this.size-2].a);
								this.cells[this.size-1][this.size-1].tempB += (this.cells[this.size-1][this.size-2].b * this.cells[this.size-1][this.size-2].a);
								this.cells[this.size-1][this.size-1].tempA += this.cells[this.size-1][this.size-2].a;
							}

							if(this.cells[this.size-2][this.size-1].energized === true) this.cells[this.size-1][this.size-1].energizedNeighbours++;
							if(this.cells[this.size-2][this.size-2].energized === true) this.cells[this.size-1][this.size-1].energizedNeighbours++;
							if(this.cells[this.size-1][this.size-2].energized === true) this.cells[this.size-1][this.size-1].energizedNeighbours++;
						}
						// top side
						else if(y === 0){
							if(this.cells[x-1][y].isAlive === true) {
								this.cells[x][y].neighbours++;
								this.cells[x][y].tempR += (this.cells[x-1][y].r * this.cells[x-1][y].a);
								this.cells[x][y].tempG += (this.cells[x-1][y].g * this.cells[x-1][y].a);
								this.cells[x][y].tempB += (this.cells[x-1][y].b * this.cells[x-1][y].a);
								this.cells[x][y].tempA += this.cells[x-1][y].a;
							}
							if(this.cells[x-1][y+1].isAlive === true) {
								this.cells[x][y].neighbours++;
								this.cells[x][y].tempR += (this.cells[x-1][y+1].r * this.cells[x-1][y+1].a);
								this.cells[x][y].tempG += (this.cells[x-1][y+1].g * this.cells[x-1][y+1].a);
								this.cells[x][y].tempB += (this.cells[x-1][y+1].b * this.cells[x-1][y+1].a);
								this.cells[x][y].tempA += this.cells[x-1][y+1].a;
							}
							if(this.cells[x][y+1].isAlive === true) {
								this.cells[x][y].neighbours++;
								this.cells[x][y].tempR += (this.cells[x][y+1].r * this.cells[x][y+1].a);
								this.cells[x][y].tempG += (this.cells[x][y+1].g * this.cells[x][y+1].a);
								this.cells[x][y].tempB += (this.cells[x][y+1].b * this.cells[x][y+1].a);
								this.cells[x][y].tempA += this.cells[x][y+1].a;
							}
							if(this.cells[x+1][y+1].isAlive === true) {
								this.cells[x][y].neighbours++;
								this.cells[x][y].tempR += (this.cells[x+1][y+1].r * this.cells[x+1][y+1].a);
								this.cells[x][y].tempG += (this.cells[x+1][y+1].g * this.cells[x+1][y+1].a);
								this.cells[x][y].tempB += (this.cells[x+1][y+1].b * this.cells[x+1][y+1].a);
								this.cells[x][y].tempA += this.cells[x+1][y+1].a;
							}
							if(this.cells[x+1][y].isAlive === true) {
								this.cells[x][y].neighbours++;
								this.cells[x][y].tempR += (this.cells[x+1][y].r * this.cells[x+1][y].a);
								this.cells[x][y].tempG += (this.cells[x+1][y].g * this.cells[x+1][y].a);
								this.cells[x][y].tempB += (this.cells[x+1][y].b * this.cells[x+1][y].a);
								this.cells[x][y].tempA += this.cells[x+1][y].a;
							}

							if(this.cells[x-1][y].energized === true) this.cells[x][y].energizedNeighbours++;
							if(this.cells[x-1][y+1].energized === true) this.cells[x][y].energizedNeighbours++;
							if(this.cells[x][y+1].energized === true) this.cells[x][y].energizedNeighbours++;
							if(this.cells[x+1][y+1].energized === true) this.cells[x][y].energizedNeighbours++;
							if(this.cells[x+1][y].energized === true) this.cells[x][y].energizedNeighbours++;
						}
						// left side
						else if(x === 0){
							if(this.cells[x][y+1].isAlive === true) {
								this.cells[x][y].neighbours++;
								this.cells[x][y].tempR += (this.cells[x][y+1].r * this.cells[x][y+1].a);
								this.cells[x][y].tempG += (this.cells[x][y+1].g * this.cells[x][y+1].a);
								this.cells[x][y].tempB += (this.cells[x][y+1].b * this.cells[x][y+1].a);
								this.cells[x][y].tempA += this.cells[x][y+1].a;
							}
							if(this.cells[x+1][y+1].isAlive === true) {
								this.cells[x][y].neighbours++;
								this.cells[x][y].tempR += (this.cells[x+1][y+1].r * this.cells[x+1][y+1].a);
								this.cells[x][y].tempG += (this.cells[x+1][y+1].g * this.cells[x+1][y+1].a);
								this.cells[x][y].tempB += (this.cells[x+1][y+1].b * this.cells[x+1][y+1].a);
								this.cells[x][y].tempA += this.cells[x+1][y+1].a;
							}
							if(this.cells[x+1][y].isAlive === true) {
								this.cells[x][y].neighbours++;
								this.cells[x][y].tempR+= (this.cells[x+1][y].r * this.cells[x+1][y].a);
								this.cells[x][y].tempG+= (this.cells[x+1][y].g * this.cells[x+1][y].a);
								this.cells[x][y].tempB+= (this.cells[x+1][y].b * this.cells[x+1][y].a);
								this.cells[x][y].tempA+= this.cells[x+1][y].a;
							}
							if(this.cells[x+1][y-1].isAlive === true) {
								this.cells[x][y].neighbours++;
								this.cells[x][y].tempR += (this.cells[x+1][y-1].r * this.cells[x+1][y-1].a);
								this.cells[x][y].tempG += (this.cells[x+1][y-1].g * this.cells[x+1][y-1].a);
								this.cells[x][y].tempB += (this.cells[x+1][y-1].b * this.cells[x+1][y-1].a);
								this.cells[x][y].tempA += this.cells[x+1][y-1].a;
							}
							if(this.cells[x][y-1].isAlive === true) {
								this.cells[x][y].neighbours++;
								this.cells[x][y].tempR += (this.cells[x][y-1].r * this.cells[x][y-1].a);
								this.cells[x][y].tempG += (this.cells[x][y-1].g * this.cells[x][y-1].a);
								this.cells[x][y].tempB += (this.cells[x][y-1].b * this.cells[x][y-1].a);
								this.cells[x][y].tempA += this.cells[x][y-1].a;
							}

							if(this.cells[x][y+1].energized === true) this.cells[x][y].energizedNeighbours++;
							if(this.cells[x+1][y+1].energized === true) this.cells[x][y].energizedNeighbours++;
							if(this.cells[x+1][y].energized === true) this.cells[x][y].energizedNeighbours++;
							if(this.cells[x+1][y-1].energized === true) this.cells[x][y].energizedNeighbours++;
							if(this.cells[x][y-1].energized === true) this.cells[x][y].energizedNeighbours++;
						}
						// right side
						else if(x == this.size - 1){
							if(this.cells[x][y+1].isAlive === true) {
								this.cells[x][y].neighbours++;
								this.cells[x][y].tempR += (this.cells[x][y+1].r * this.cells[x][y+1].a);
								this.cells[x][y].tempG += (this.cells[x][y+1].g * this.cells[x][y+1].a);
								this.cells[x][y].tempB += (this.cells[x][y+1].b * this.cells[x][y+1].a);
								this.cells[x][y].tempA += this.cells[x][y+1].a;
							}
							if(this.cells[x-1][y+1].isAlive === true) {
								this.cells[x][y].neighbours++;
								this.cells[x][y].tempR += (this.cells[x-1][y+1].r * this.cells[x-1][y+1].a);
								this.cells[x][y].tempG += (this.cells[x-1][y+1].g * this.cells[x-1][y+1].a);
								this.cells[x][y].tempB += (this.cells[x-1][y+1].b * this.cells[x-1][y+1].a);
								this.cells[x][y].tempA += this.cells[x-1][y+1].a;
							}
							if(this.cells[x-1][y].isAlive === true) {
								this.cells[x][y].neighbours++;
								this.cells[x][y].tempR += (this.cells[x-1][y].r * this.cells[x-1][y].a);
								this.cells[x][y].tempG += (this.cells[x-1][y].g * this.cells[x-1][y].a);
								this.cells[x][y].tempB += (this.cells[x-1][y].b * this.cells[x-1][y].a);
								this.cells[x][y].tempA += this.cells[x-1][y].a;
							}
							if(this.cells[x-1][y-1].isAlive === true) {
								this.cells[x][y].neighbours++;
								this.cells[x][y].tempR += (this.cells[x-1][y-1].r * this.cells[x-1][y-1].a);
								this.cells[x][y].tempG += (this.cells[x-1][y-1].g * this.cells[x-1][y-1].a);
								this.cells[x][y].tempB += (this.cells[x-1][y-1].b * this.cells[x-1][y-1].a);
								this.cells[x][y].tempA += this.cells[x-1][y-1].a;
							}
							if(this.cells[x][y-1].isAlive === true) {
								this.cells[x][y].neighbours++;
								this.cells[x][y].tempR += (this.cells[x][y-1].r * this.cells[x][y-1].a);
								this.cells[x][y].tempG += (this.cells[x][y-1].g * this.cells[x][y-1].a);
								this.cells[x][y].tempB += (this.cells[x][y-1].b * this.cells[x][y-1].a);
								this.cells[x][y].tempA += this.cells[x][y-1].a;
							}

							if(this.cells[x][y+1].energized === true) this.cells[x][y].energizedNeighbours++;
							if(this.cells[x-1][y+1].energized === true) this.cells[x][y].energizedNeighbours++;
							if(this.cells[x-1][y].energized === true) this.cells[x][y].energizedNeighbours++;
							if(this.cells[x-1][y-1].energized === true) this.cells[x][y].energizedNeighbours++;
							if(this.cells[x][y-1].energized === true) this.cells[x][y].energizedNeighbours++;
						}
						// bottom side
						else if(y == this.size - 1){
							if(this.cells[x-1][y].isAlive === true) {
								this.cells[x][y].neighbours++;
								this.cells[x][y].tempR += (this.cells[x-1][y].r * this.cells[x-1][y].a);
								this.cells[x][y].tempG += (this.cells[x-1][y].g * this.cells[x-1][y].a);
								this.cells[x][y].tempB += (this.cells[x-1][y].b * this.cells[x-1][y].a);
								this.cells[x][y].tempA += this.cells[x-1][y].a;
							}
							if(this.cells[x-1][y-1].isAlive === true) {
								this.cells[x][y].neighbours++;
								this.cells[x][y].tempR += (this.cells[x-1][y-1].r * this.cells[x-1][y-1].a);
								this.cells[x][y].tempG += (this.cells[x-1][y-1].g * this.cells[x-1][y-1].a);
								this.cells[x][y].tempB += (this.cells[x-1][y-1].b * this.cells[x-1][y-1].a);
								this.cells[x][y].tempA += this.cells[x-1][y-1].a;
							}
							if(this.cells[x][y-1].isAlive === true) {
								this.cells[x][y].neighbours++;
								this.cells[x][y].tempR += (this.cells[x][y-1].r * this.cells[x][y-1].a);
								this.cells[x][y].tempG += (this.cells[x][y-1].g * this.cells[x][y-1].a);
								this.cells[x][y].tempB += (this.cells[x][y-1].b * this.cells[x][y-1].a);
								this.cells[x][y].tempA += this.cells[x][y-1].a;
							}
							if(this.cells[x+1][y-1].isAlive === true) {
								this.cells[x][y].neighbours++;
								this.cells[x][y].tempR += (this.cells[x+1][y-1].r * this.cells[x+1][y-1].a);
								this.cells[x][y].tempG += (this.cells[x+1][y-1].g * this.cells[x+1][y-1].a);
								this.cells[x][y].tempB += (this.cells[x+1][y-1].b * this.cells[x+1][y-1].a);
								this.cells[x][y].tempA += this.cells[x+1][y-1].a;
							}
							if(this.cells[x+1][y].isAlive === true) {
								this.cells[x][y].neighbours++;
								this.cells[x][y].tempR += (this.cells[x+1][y].r * this.cells[x+1][y].a);
								this.cells[x][y].tempG += (this.cells[x+1][y].g * this.cells[x+1][y].a);
								this.cells[x][y].tempB += (this.cells[x+1][y].b * this.cells[x+1][y].a);
								this.cells[x][y].tempA += this.cells[x+1][y].a;
							}

							if(this.cells[x-1][y].energized === true) this.cells[x][y].energizedNeighbours++;
							if(this.cells[x-1][y-1].energized === true) this.cells[x][y].energizedNeighbours++;
							if(this.cells[x][y-1].energized === true) this.cells[x][y].energizedNeighbours++;
							if(this.cells[x+1][y-1].energized === true) this.cells[x][y].energizedNeighbours++;
							if(this.cells[x+1][y].energized === true) this.cells[x][y].energizedNeighbours++;
						}
						// mid parts
						else{
							if(this.cells[x-1][y-1].isAlive === true) {
								this.cells[x][y].neighbours++;
								this.cells[x][y].tempR += (this.cells[x-1][y-1].r * this.cells[x-1][y-1].a);
								this.cells[x][y].tempG += (this.cells[x-1][y-1].g * this.cells[x-1][y-1].a);
								this.cells[x][y].tempB += (this.cells[x-1][y-1].b * this.cells[x-1][y-1].a);
								this.cells[x][y].tempA += this.cells[x-1][y-1].a;
							}
							if(this.cells[x][y-1].isAlive === true) {
								this.cells[x][y].neighbours++;
								this.cells[x][y].tempR += (this.cells[x][y-1].r * this.cells[x][y-1].a);
								this.cells[x][y].tempG += (this.cells[x][y-1].g * this.cells[x][y-1].a);
								this.cells[x][y].tempB += (this.cells[x][y-1].b * this.cells[x][y-1].a);
								this.cells[x][y].tempA += this.cells[x][y-1].a;
							}
							if(this.cells[x+1][y-1].isAlive === true) {
								this.cells[x][y].neighbours++;
								this.cells[x][y].tempR += (this.cells[x+1][y-1].r * this.cells[x+1][y-1].a);
								this.cells[x][y].tempG += (this.cells[x+1][y-1].g * this.cells[x+1][y-1].a);
								this.cells[x][y].tempB += (this.cells[x+1][y-1].b * this.cells[x+1][y-1].a);
								this.cells[x][y].tempA += this.cells[x+1][y-1].a;
							}
							if(this.cells[x+1][y].isAlive === true) {
								this.cells[x][y].neighbours++;
								this.cells[x][y].tempR += (this.cells[x+1][y].r * this.cells[x+1][y].a);
								this.cells[x][y].tempG += (this.cells[x+1][y].g * this.cells[x+1][y].a);
								this.cells[x][y].tempB += (this.cells[x+1][y].b * this.cells[x+1][y].a);
								this.cells[x][y].tempA += this.cells[x+1][y].a;
							}
							if(this.cells[x+1][y+1].isAlive === true) {
								this.cells[x][y].neighbours++;
								this.cells[x][y].tempR += (this.cells[x+1][y+1].r * this.cells[x+1][y+1].a);
								this.cells[x][y].tempG += (this.cells[x+1][y+1].g * this.cells[x+1][y+1].a);
								this.cells[x][y].tempB += (this.cells[x+1][y+1].b * this.cells[x+1][y+1].a);
								this.cells[x][y].tempA += this.cells[x+1][y+1].a;
							}
							if(this.cells[x][y+1].isAlive === true) {
								this.cells[x][y].neighbours++;
								this.cells[x][y].tempR += (this.cells[x][y+1].r * this.cells[x][y+1].a);
								this.cells[x][y].tempG += (this.cells[x][y+1].g * this.cells[x][y+1].a);
								this.cells[x][y].tempB += (this.cells[x][y+1].b * this.cells[x][y+1].a);
								this.cells[x][y].tempA += this.cells[x][y+1].a;
							}
							if(this.cells[x-1][y+1].isAlive === true) {
								this.cells[x][y].neighbours++;
								this.cells[x][y].tempR += (this.cells[x-1][y+1].r * this.cells[x-1][y+1].a);
								this.cells[x][y].tempG += (this.cells[x-1][y+1].g * this.cells[x-1][y+1].a);
								this.cells[x][y].tempB += (this.cells[x-1][y+1].b * this.cells[x-1][y+1].a);
								this.cells[x][y].tempA += this.cells[x-1][y+1].a;
							}
							if(this.cells[x-1][y].isAlive === true) {
								this.cells[x][y].neighbours++;
								this.cells[x][y].tempR += (this.cells[x-1][y].r * this.cells[x-1][y].a);
								this.cells[x][y].tempG += (this.cells[x-1][y].g * this.cells[x-1][y].a);
								this.cells[x][y].tempB += (this.cells[x-1][y].b * this.cells[x-1][y].a);
								this.cells[x][y].tempA += this.cells[x-1][y].a;
							}

							if(this.cells[x-1][y-1].energized === true) this.cells[x][y].energizedNeighbours++;
							if(this.cells[x][y-1].energized === true) this.cells[x][y].energizedNeighbours++;
							if(this.cells[x+1][y-1].energized === true) this.cells[x][y].energizedNeighbours++;
							if(this.cells[x+1][y].energized === true) this.cells[x][y].energizedNeighbours++;
							if(this.cells[x+1][y+1].energized === true) this.cells[x][y].energizedNeighbours++;
							if(this.cells[x][y+1].energized === true) this.cells[x][y].energizedNeighbours++;
							if(this.cells[x-1][y+1].energized === true) this.cells[x][y].energizedNeighbours++;
							if(this.cells[x-1][y].energized === true) this.cells[x][y].energizedNeighbours++;
						}
					}
				}
			}
		},
		updateCells: function(){
			for(var x = 0; x<this.size; x++){
				for(var y = 0; y<this.size; y++){
					// only update non-spawner cells
					if(this.cells[x][y].isSpawner === false){
						// update the color and alpha of cell
						if(this.cells[x][y].neighbours > 0){
							this.cells[x][y].isAlive = true;
						}

						if(this.cells[x][y].isAlive === true && this.cells[x][y].neighbours != 0){
							this.cells[x][y].tempR /= this.cells[x][y].neighbours;
							this.cells[x][y].tempG /= this.cells[x][y].neighbours;
							this.cells[x][y].tempB /= this.cells[x][y].neighbours;
							this.cells[x][y].tempA /= (this.cells[x][y].neighbours*2);

							this.cells[x][y].r = Math.round(this.cells[x][y].tempR);
							this.cells[x][y].g = Math.round(this.cells[x][y].tempG);
							this.cells[x][y].b = Math.round(this.cells[x][y].tempB);
							this.cells[x][y].a += this.cells[x][y].tempA;
							
							if(this.cells[x][y].a > 1){
								this.cells[x][y].a = 1;
							}

							this.cells[x][y].tempR = 0;
							this.cells[x][y].tempG = 0;
							this.cells[x][y].tempB = 0;
							this.cells[x][y].tempA = 0;
						}

						// decay value
						if(this.updateRate == 0 || this.updateRate == 5)
						{
							if(this.cells[x][y].isAlive === true){
								this.cells[x][y].r -= 1;
								this.cells[x][y].g -= 1;
								this.cells[x][y].b -= 1;
								if(this.cells[x][y].r < 0) this.cells[x][y].r = 0;
								if(this.cells[x][y].g < 0) this.cells[x][y].g = 0;
								if(this.cells[x][y].b < 0) this.cells[x][y].b = 0; 
							}
						}

						// check if it should die
						if( ((this.cells[x][y].r + this.cells[x][y].g + this.cells[x][y].b) <= 10 && this.cells[x][y].isAlive === true) || (this.cells[x][y].neighbours == 0 && this.cells[x][y].isAlive === true)){
							this.cells[x][y].r = 0;
							this.cells[x][y].g = 0;
							this.cells[x][y].b = 0;
							this.cells[x][y].a = 0;
							this.cells[x][y].isAlive = false;
							this.cells[x][y].energized = false;
						}
						
						if(this.updateRate == 0 && this.cells[x][y].isAlive === true){
							//energy related
							if(this.cells[x][y].energizedNeighbours == 0 && this.cells[x][y].energized === true){
								this.cells[x][y].energized = false;
							}
							else if(this.cells[x][y].energizedNeighbours == 2 && this.cells[x][y].energized === true){
								this.cells[x][y].energized = false;
							}
							else if(this.cells[x][y].energizedNeighbours >= 4 && this.cells[x][y].energizedNeighbours <= 8 && this.cells[x][y].energized === true){
								this.cells[x][y].energized = false;
							}

							if(this.cells[x][y].energizedNeighbours == 1 && this.cells[x][y].energized === false){
								this.cells[x][y].energized = true;
							}
						}
						this.cells[x][y].neighbours = 0;
						this.cells[x][y].energizedNeighbours = 0;
					}
				}
			}

		},
		updateGeometries: function(){
			var count = 0;
			for(var x = 0; x<this.size; x++){
				for(var y = 0; y<this.size; y++){
					if(this.cells[x][y].energized === true) {
								var newR = this.cells[x][y].r + Math.round(rTintSlider.value*aTintSlider.value);
								var newG = this.cells[x][y].g + Math.round(gTintSlider.value*aTintSlider.value);
								var newB = this.cells[x][y].b + Math.round(bTintSlider.value*aTintSlider.value);
								grid.geometries[count].material.color =  new THREE.Color('rgb(' + newR + ',' + newG + ',' + newB +')');
					}
					else{
						grid.geometries[count].material.color =  new THREE.Color('rgb(' + this.cells[x][y].r + ',' + this.cells[x][y].g + ',' + this.cells[x][y].b +')');
					}
					grid.geometries[count].material.opacity =  this.cells[x][y].a;
					count++;
				}
			}

			this.composer.render();
		},
		updateAll: function(data, mouse, selectedCell, tintColor){
			grid.updateSpawners(data);
			grid.checkNeighbours();
			grid.updateCells();
			if(grid.view3D === false){
				grid.draw(mouse, selectedCell, tintColor);
			}
			else{
				grid.updateGeometries();
			}
			grid.updateRate++;

			if(grid.updateRate > 10){
				grid.updateRate = 0;
			}
		},
		getCellData: function(selectedCell){
			return this.cells[selectedCell.x][selectedCell.y];
		}
	};

	var NUM_SAMPLES = 256;

	var SOUND_1 = 'media/Koharu Biyori.mp3'; // by Toshio Masuda - Mushishi Zoku's OST
	var SOUND_2 = 'media/Ghostly Orchestra PG-Mix.mp3'; // by Kuroneko Lounge - House set of Perfect Cherry Blossom
	var SOUND_3 = 'media/Flawless Clothing of the Celestials.mp3'; // by Kitsune Workshop
	var SOUND_4 = 'media/Just a Dream.mp3'; // by Approaching Nirvana - Cinematic Soundscapes Vol.2
	var paused = false;
	var canvas,ctx;

	//Audio
	var audioElement, analyserNode, drawFrequency = true;

	//Sliders
	var rSlider, gSlider, bSlider;
	var rTintSlider, gTintSlider, bTintSlider, aTintSlider, thresholdSlider;

	//Tools
	var changeColor = false;
	var changePos = false;
	var firstCellChosen = false;
	var firstCellPos = {
		x: 0, 
		y: 0
	};
	var getColor = false;
	var tintColor;

	// Mouse location
	var mouseDown = false;
	var mouse = {};
	mouse.x = 0;
	mouse.y = 0;

	var selectedCell = {
		x: -1,
		y: -1
	};

	var frameCounter = 0;

	function init(){
		// set up canvas stuff
		canvas = document.querySelector('#canvas');
		ctx = canvas.getContext("2d");

		// get reference to <audio> element on page
		audioElement = document.querySelector('audio');
		
		// function to get an analyser node
		analyserNode = createWebAudioContextWithAnalyserNode(audioElement);

		// get sound track <select> and Full Screen button working
		setupUI();
		
		// load and play default sound into audio element
		playStream(audioElement,SOUND_1);

		// set up grid
		grid.init(50);

		// start animation loop
		update();
	}
	
	
	function createWebAudioContextWithAnalyserNode(audioElement) {
		var audioCtx, analyserNode, sourceNode;

		// create new AudioContext
		audioCtx = new (window.AudioContext || window.webkitAudioContext);
		
		// create an analyser node
		analyserNode = audioCtx.createAnalyser();

		// fft stands for Fast Fourier Transform
		analyserNode.fftSize = NUM_SAMPLES;
		
		// hook up the <audio> element to the analyserNode
		sourceNode = audioCtx.createMediaElementSource(audioElement); 
		sourceNode.connect(analyserNode);

		// connect to the destination i.e. speakers
		analyserNode.connect(audioCtx.destination);
		return analyserNode;
	}
	
	// setup all UI related elements
	function setupUI(){
		canvas.onmousemove = doMousemove;

		rSlider = document.querySelector("#rSlider");
		gSlider = document.querySelector("#gSlider");
		bSlider = document.querySelector("#bSlider");

		rTintSlider = document.querySelector("#rTintSlider");
		gTintSlider = document.querySelector("#gTintSlider");
		bTintSlider = document.querySelector("#bTintSlider");
		aTintSlider = document.querySelector("#aTintSlider");
		thresholdSlider = document.querySelector("#thresholdSlider");

		document.querySelector("#canvas").onclick  = function(e){
			 if(getColor === true){
			 	rSlider.value = grid.cells[selectedCell.x][selectedCell.y].r;
			 	gSlider.value = grid.cells[selectedCell.x][selectedCell.y].g;
			 	bSlider.value = grid.cells[selectedCell.x][selectedCell.y].b;
			 }
			 if(changePos === true){
			 	if(firstCellChosen === false){
			 		firstCellPos.x = selectedCell.x;
			 		firstCellPos.y = selectedCell.y;
			 		firstCellChosen = true;
			 	}
			 	else{
			 		var secondCellInfo = grid.getCellData(selectedCell);
			 		console.log(firstCellPos);
			 		console.log(selectedCell);
			 		grid.cells[selectedCell.x][selectedCell.y] = grid.getCellData(firstCellPos);
			 		grid.cells[firstCellPos.x][firstCellPos.y] = secondCellInfo;
			 		firstCellChosen = false;
			 	}
			 }
		};
		document.querySelector("#canvas").onmousedown = function(e){
			 mouseDown = true;
		};
		document.querySelector("#canvas").onmouseup  = function(e){
			 mouseDown = false;
		};

		document.querySelector("#trackSelect").onchange = function(e){
			playStream(audioElement, e.target.value);
		};

		document.querySelector("#changeColorButton").onclick = function(){
			changeColor = true;
			changePos = false;
			firstCellChosen = false;
			getColor = false;
			document.querySelector("#changeColorButton").style.backgroundColor = '#696969';
			document.querySelector("#changePosButton").style.backgroundColor = '#A9A9A9';
			document.querySelector("#getColorButton").style.backgroundColor = '#A9A9A9';
			document.querySelector("#toolInfo").innerHTML = "Hold the mouse down to add color to the selected cell";
		};
		document.querySelector("#changePosButton").onclick = function(){
			changeColor = false;
			changePos = true;
			firstCellChosen = false;
			getColor = false;
			document.querySelector("#changeColorButton").style.backgroundColor = '#A9A9A9';
			document.querySelector("#changePosButton").style.backgroundColor = '#696969';
			document.querySelector("#getColorButton").style.backgroundColor = '#A9A9A9';
			document.querySelector("#toolInfo").innerHTML = "Click on the cell and then click on another to swap their positions.";
		};
		document.querySelector("#getColorButton").onclick = function(){
			changeColor = false;
			changePos = false;
			firstCellChosen = false;
			getColor = true;
			document.querySelector("#changeColorButton").style.backgroundColor = '#A9A9A9';
			document.querySelector("#changePosButton").style.backgroundColor = '#A9A9A9';
			document.querySelector("#getColorButton").style.backgroundColor = '#696969';
			document.querySelector("#toolInfo").innerHTML = "Click on a cell to get the cells color";
		};
		document.querySelector("#view3DCheck").onchange = function(e){
			grid.view3D = e.target.checked;
			changeColor = false;
			changePos = false;
			firstCellChosen = false;
			getColor = false;
			document.querySelector("#changeColorButton").style.backgroundColor = '#A9A9A9';
			document.querySelector("#changePosButton").style.backgroundColor = '#A9A9A9';
			document.querySelector("#getColorButton").style.backgroundColor = '#A9A9A9';
			if(e.target.checked){
				document.querySelector('#canvas3D').style.display = 'block';
				document.querySelector('#canvas').style.display = 'none';
				document.querySelector("#toolInfo").innerHTML = "Hold left mouse button to rotate camera view <br> Hold middle mouse button to zoom in and out <br> Hold right mouse button to move camera";
			}
			else{
				document.querySelector('#canvas3D').style.display = 'none';
				document.querySelector('#canvas').style.display = 'block';
				document.querySelector("#toolInfo").innerHTML = "Click on a cell to get the cells color";
			}
		};
	}
	
	function playStream(audioElement,path){
		audioElement.src = path;
		audioElement.play();
		audioElement.volume = 0.75;
		document.querySelector('#status').innerHTML = "Now playing: " + path;
	}
	
	function update() { 
		// schedules a call to the update() method
		requestAnimationFrame(update);

		// for displaying cell data
		if(selectedCell.x != -1){
			var cellData = grid.getCellData(selectedCell);
			var cellDataString = "<p>R: " + cellData.r + "</p>"; 
			cellDataString += "<p>G: " + cellData.g + "</p>"; 
			cellDataString += "<p>B: " + cellData.b + "</p>";

			if(cellData.energized) cellDataString += "<p>Energized: True </p>";
			else cellDataString += "<p>Energized: False </p>";

			document.querySelector("#cellData").innerHTML = cellDataString;
			document.querySelector("#cellColor").style.backgroundColor = makeColor(cellData.r, cellData.g, cellData.b, 1);
		}

		selectedCell.x = Math.floor(mouse.x/12.8);
		selectedCell.y = Math.floor(mouse.y/12.8);

		// make sure the cursor cant get out of canvas data
		if( selectedCell.x < 0 ) selectedCell.x = 0;
		if( selectedCell.y < 0 ) selectedCell.y = 0;
		if( selectedCell.x > 49 ) selectedCell.x = 49;
		if( selectedCell.y > 49 ) selectedCell.y = 49;

		// changes the color of the cell the mouse is on
		if(changeColor === true && mouseDown === true){
			grid.cells[selectedCell.x][selectedCell.y].r = rSlider.value;
			grid.cells[selectedCell.x][selectedCell.y].g = gSlider.value;
			grid.cells[selectedCell.x][selectedCell.y].b = bSlider.value;
			grid.cells[selectedCell.x][selectedCell.y].a = 1;
			grid.cells[selectedCell.x][selectedCell.y].isAlive = true;

		}

		// for displaying slider data
		document.querySelector("#rValue").innerHTML = rSlider.value;
		document.querySelector("#gValue").innerHTML = gSlider.value;
		document.querySelector("#bValue").innerHTML = bSlider.value;
		document.querySelector("#newColor").style.backgroundColor = makeColor(rSlider.value, gSlider.value, bSlider.value, 1);

		document.querySelector("#rTintValue").innerHTML = rTintSlider.value;
		document.querySelector("#gTintValue").innerHTML = gTintSlider.value;
		document.querySelector("#bTintValue").innerHTML = bTintSlider.value;
		document.querySelector("#aTintValue").innerHTML = aTintSlider.value;
		document.querySelector("#thresholdValue").innerHTML = thresholdSlider.value;
		document.querySelector("#newTintColor").style.backgroundColor = makeColor(rTintSlider.value, gTintSlider.value, bTintSlider.value, aTintSlider.value);
		tintColor = makeColor(rTintSlider.value, gTintSlider.value, bTintSlider.value, aTintSlider.value);
	
		// create a new array of 8-bit integers (0-255)
		var data = new Uint8Array(NUM_SAMPLES/2); 

		// populate the array with the frequency data
		if(drawFrequency && paused != true){
			analyserNode.getByteFrequencyData(data);
		}

		// clear draw
		ctx.clearRect(0,0,640,640); 

		// update grid
		grid.updateAll(data, mouse, selectedCell, tintColor);

		// draw circle on mouse location
		ctx.beginPath();
		ctx.fillStyle = 'rgba('+ rSlider.value + ', '+ gSlider.value + ', '+ bSlider.value + ', 1)';
		ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
		ctx.arc(mouse.x, mouse.y, 4, Math.PI * 2, false);
		ctx.fill();
		ctx.stroke();
		ctx.closePath();
	} 
	

	function doMousemove(e) {
		// get location of mouse in canvas coordinates
		mouse = getMouse(e);
	}

	// Function Name: getMouse()
	// returns mouse position in local coordinate system of element
	// Author: Tony Jefferson
	// Last update: 3/1/2014
	function getMouse(e){
		var mouse = {};
		mouse.x = e.pageX - e.target.offsetLeft;
		mouse.y = e.pageY - e.target.offsetTop;
		return mouse;
	}

	// Utilities
	function makeColor(red, green, blue, alpha){
			var color='rgba('+red+','+green+','+blue+', '+alpha+')';
			return color;
	}
	
	function getRandomInt(min, max) {
  		return Math.floor(Math.random() * (max - min) + min);
	}
	
	window.addEventListener("load",init);
}());
	