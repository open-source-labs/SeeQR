import React, { useRef, useEffect } from 'react';
import { ForceGraph3D } from 'react-force-graph';
import * as THREE from 'three';
import * as d3 from 'd3';

const EricasoParanoidUniverse = ( {dbTables} ) => {
  const graphRef = useRef(null);
  const containerRef = React.useRef(null);
  console.log(dbTables);

  useEffect(() => {
    const maxContainerWidth = window.innerWidth * 0.9 - 275; 
    const width = Math.min(window.innerWidth, maxContainerWidth);
    const maxContainerHeight = window.innerHeight - 40;
    const height = Math.min(window.innerHeight, maxContainerHeight);

    let renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    containerRef.current.appendChild(renderer.domElement);

    let camera = new THREE.PerspectiveCamera(100, width / height, 1, 1000);
    camera.position.set(0, 50, 50);

    const scene = new THREE.Scene();

    var starsGeometry = new THREE.BufferGeometry();

    ////////////////////////////////////////////////// stars in universe ////////////////////////////////////////////
    // var positions = [];
    // var colors = [];

    // d3.range(10000).map((d, i) => {
    //   var x = 1000 * (Math.random() - 0.5);
    //   var y = 1000 * (Math.random() - 0.5);
    //   var z = Math.random() * 2000;

    //   positions.push(x, y, z);
    //   colors.push(1, 1, 1);
    // });

    // starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    // starsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    // var starsMaterial = new THREE.PointsMaterial({ vertexColors: true });
    // var starField = new THREE.Points(starsGeometry, starsMaterial);
    // scene.add(starField);
    
    var positions = [];
    var colors = [];

    d3.range(20000).map((d, i) => {

    const arr = getRandomInRange(-2500, 2500);
    var x = arr[0];
    var y = arr[1];
    var z = arr[2];

    positions.push(x, y, z);
    colors.push(1, 1, 1);
    });

    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    starsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    var starsMaterial = new THREE.PointsMaterial({ vertexColors: true });
    var starField = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starField);

    function getRandomInRange(min, max) {
        const arr = [];
        arr[0] = Math.random() * (max - min) + min;
        arr[1] = Math.random() * (max - min) + min;
        arr[2] = Math.random() * (max - min) + min;
        if(Math.sqrt((arr[0]*arr[0]) + (arr[1]*arr[1]) + (arr[2]*arr[2]))  < 550 ){
            return getRandomInRange(min, max);
        }
        return arr;
    }
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //////////Destructure dbTables////////////
    // const databaseCache = {};
    // for(let i = 0; i < dbTables.length; i++){
    //     databaseCache[dbTables[i].table_name] = [];
    //     for(let j = 0; j < dbTables[i].columns.length; j++){
    //         databaseCache[dbTables[i].table_name].push(dbTables[i].columns[j].column_name);
    //     };
    // }
    // //////////////////////////////////////////
    // const nodes = [];
    // const edges = [];
    
    // // Create nodes and edges
    // Object.keys(databaseCache).forEach((prop) => {
    //   const sourceNode = { id: prop, x: Math.random() - 0.5, y: Math.random() - 0.5, z: Math.random() - 0.5 };
    //   nodes.push(sourceNode);
    
    //   const targetIds = databaseCache[prop];
    //   targetIds.forEach((targetId) => {
    //     const targetNode = { id: targetId, x: Math.random() - 0.5, y: Math.random() - 0.5, z: Math.random() - 0.5 };
    //     nodes.push(targetNode);
    
    //     edges.push({ source: sourceNode, target: targetNode });
    //   });
    // });
    
    // console.log("--------nodes: ", nodes);
    // console.log("---------edges: ", edges);
    
    // // Create the simulation
    // const simulation = d3.forceSimulation(nodes)
    //   .force('link', d3.forceLink(edges).id((d) => d.id).distance(50).strength(1))
    //   .force('charge', d3.forceManyBody().strength(-50))
    //   .force('center', d3.forceCenter());
    
    // simulation.on('tick', update);
    
    // // Create node materials and objects
    // const nodeMaterials = [];
    // const nodeObjects = nodes.map((node) => {
    //   const nodeGeometry = new THREE.SphereGeometry(1.5);
    //   const nodeMaterial = new THREE.MeshBasicMaterial({ color: 'rgb(225, 225, 225)' });
    //   nodeMaterials.push(nodeMaterial);
    //   const object = new THREE.Mesh(nodeGeometry, nodeMaterial);
    //   scene.add(object);
    //   return object;
    // });
    
    // // Create edge material and objects
    // const edgeMaterial = new THREE.LineBasicMaterial({ color: 'rgb(225, 225, 225)', linewidth: 5 });
    // const edgeObjects = edges.map((edge) => {
    //   const geometry = new THREE.BufferGeometry().setFromPoints([
    //     new THREE.Vector3(0, 0, 0),
    //     new THREE.Vector3(0, 0, 0),
    //   ]);
    //   const object = new THREE.Line(geometry, edgeMaterial);
    //   scene.add(object);
    //   return object;
    // });
    
    // // Update function
    // function update() {
    //   edgeObjects.forEach((object, i) => {
    //     const sourceNode = edges[i].source;
    //     const targetNode = edges[i].target;
    
    //     if (sourceNode && targetNode) {
    //       object.geometry.setFromPoints([
    //         new THREE.Vector3(sourceNode.x, sourceNode.y, sourceNode.z),
    //         new THREE.Vector3(targetNode.x, targetNode.y, targetNode.z),
    //       ]);
    //       object.geometry.verticesNeedUpdate = true;
    //     }
    //   });
    
    //   nodeObjects.forEach((object, i) => {
    //     object.position.set(nodes[i].x, nodes[i].y, nodes[i].z);
    //   });
    // }
    
    



    // // // // // // // // // // // // // // // // // // // // // // // // // // // // 
    //Graph data (sample)
    const nodes = [
        { id: 'node1', x: 0, y: 0, z: 0 },
        { id: 'node2', x: 3, y: 3, z: 3 },
        { id: 'node3', x: 5, y: 5, z: 5 },
        // ...
    ];
    const edges = [
        { source: 'node1', target: 'node2' },
        // ...
    ];
      


      // Create nodes
      // THREE.SphereGeometry(radius of number)
      const nodeGeometry = new THREE.SphereGeometry(0.5);
      // THREE.MeshBasicMaterial({ color: a string of the color of the ball/nodes })
      const nodeMaterial = new THREE.MeshBasicMaterial({ color: 'rgba(200, 200, 200, 1)' });
      nodes.forEach(node => {
        const nodeMesh = new THREE.Mesh(nodeGeometry, nodeMaterial);
        nodeMesh.position.set(node.x, node.y, node.z);
        scene.add(nodeMesh);
      });
  
    // Create edges
    const edgeMaterial = new THREE.LineBasicMaterial({ color: 'rgba(255, 255, 150, 0.75)'  });
    edges.forEach(edge => {
    const sourceNode = nodes.find(node => node.id === edge.source);
    const targetNode = nodes.find(node => node.id === edge.target);
    if (sourceNode && targetNode) {
        const edgeGeometry = new THREE.BufferGeometry();
        const vertices = [
        sourceNode.x, sourceNode.y, sourceNode.z,
        targetNode.x, targetNode.y, targetNode.z
        ];
        edgeGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        const edgeLine = new THREE.Line(edgeGeometry, edgeMaterial);
        scene.add(edgeLine);
    }
    });
  // // // // // // // // // // // // // // // // // // // // // // // // // // // //   
    

    const animate = () => {
      requestAnimationFrame(animate);
      // simulation.tick();
      // update();
      renderer.render(scene, camera);
    };

    animate();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////Viewr's / Player's action controller/////////////////////////////////////////////////////////////////
    // Define the domElement variable
    const domElement = containerRef.current;
    const PlayerAction = function (camera, domElement) {

        this.object = camera;
        this.mouseBtn = {LeftMouseBtn: THREE.MOUSE.LEFT, RightMouseBtn: THREE.MOUSE.RIGHT};
        this.domElement = (domElement !== undefined) ? domElement : document;

        //cache target for 'around'
        this.target = new THREE.Vector3();

        //clone/copy the property for reset 
        this.targetClone = this.target.clone();
        this.positionClone = this.object.position.clone();

        this.reset = () => {
            scope.target.copy(scope.targetClone);
            scope.object.position.copy(scope.positionClone);
            scope.object.updateProjectionMatrix();
            scope.dispatchEvent(changeEvent);
            scope.update();
            currentStatus = generalStatus.NONE;
        };

        this.update = function () {
            const offset = new THREE.Vector3();
            const qqq = new THREE.Quaternion().setFromUnitVectors( camera.up, new THREE.Vector3( 0, 1, 0 ) );
            const qqqInverse = qqq.clone().invert();

		    return function update(){

			var position = scope.object.position;

			offset.copy(position).sub(scope.target);
			offset.applyQuaternion(qqq);
			spherical.setFromVector3(offset);
			spherical.theta += sphericalDelta.theta;
			spherical.phi += sphericalDelta.phi;

            /////////////////////////////////////////Rotate Restriction//////////////////////////////////////////////////////////////
	        //Rotate Up and Down / Rotate vertical
            //This is polar angle    v0: SmallestAngle  
			spherical.phi = Math.max(0, Math.min(Math.PI, spherical.phi));
            //                                   ^^^^^^Math.PI: LargestAngle
            //Restricts the polar angle phi to be between 0.000001 and pi - 0.000001.
			spherical.makeSafe();

            //Rotate Left and Right / Rotate horizontal
            //This is equator angle     vvvvvv-Infinity: SmallestAngle  
            spherical.theta = Math.max(-Infinity, Math.min(Infinity, spherical.theta));
            //                                              ^^^^^^Infinity: LargestAngle

            //This is the reference: https://en.wikipedia.org/wiki/Spherical_coordinate_system
            /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

			spherical.radius = Math.max(0, Math.min(Infinity, spherical.radius));

			scope.target.add(movingOffset);
			offset.setFromSpherical( spherical );
			offset.applyQuaternion(qqqInverse);
			position.copy(scope.target).add(offset);
            //let camera staring at the subject in order to "around" the subject
			scope.object.lookAt(scope.target);
			sphericalDelta.set(0, 0, 0);
			movingOffset.set(0, 0, 0);
			return false;
		};
	}();
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////Back up event listener removal for react///////////////////////////////////////////
    /*
	this.dispose = function () {
		scope.domElement.removeEventListener('contextmenu', preventEventDefault, false);
		scope.domElement.removeEventListener('mousedown', onMouseDown, false);
		scope.domElement.removeEventListener('mousemove', onMouseMove, false);
		scope.domElement.removeEventListener('mouseup', onMouseUp, false);
	};
    */
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	const scope = this;
    const generalStatus = { NONE: 123, 
                            ROTATE: 456, 
                            MOVING: 789 };
	const changeEvent = {type: 'change'};
	const startEvent = {type: 'start'};
	const endEvent = {type: 'end'};


	var currentStatus = generalStatus.NONE;

	//declaring the current loaction
	var spherical = new THREE.Spherical();
	var sphericalDelta = new THREE.Spherical();
	var movingOffset = new THREE.Vector3();

	const getDomElement = () => {
		return scope.domElement === document ? scope.domElement.body : scope.domElement;
	}

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////Left Mouse Button Rotate///////////
    var rotateStart = new THREE.Vector2();
	var rotateEnd = new THREE.Vector2();
	var rotateDelta = new THREE.Vector2();
    //////////////////////////////////////////////////////////////////
    const rotateRL = (input) => {
		sphericalDelta.theta -= input;
	}
	const rotateUD = (input) => {
		sphericalDelta.phi -= input;
	}
	const handleMouseDown_Rotate = (event) => {
		rotateStart.set(event.clientX, event.clientY);
	}
	const handleMouseMove_Rotate = (event) => {
		rotateEnd.set(event.clientX, event.clientY);
		rotateDelta.subVectors(rotateEnd, rotateStart);
		var element = getDomElement();
		//Rotate left and Right
		rotateRL(2 * Math.PI * rotateDelta.x / element.clientWidth);
		//Rotate up and down
		rotateUD(2 * Math.PI * rotateDelta.y / element.clientHeight);
		rotateStart.copy( rotateEnd );
        //updating at any moment when you are rotating...
		scope.update();
	}
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////Right Mouse Button Moving///////////
    var movingStart = new THREE.Vector2();
	var movingEnd = new THREE.Vector2();
	var movingDelta = new THREE.Vector2();
    //////////////////////////////////////////////////////////////////
    const handleMouseDown_Moving = (event) => {
		movingStart.set(event.clientX, event.clientY);
	}
	const handleMouseMove_Moving = (event) => {
		movingEnd.set(event.clientX, event.clientY);
		movingDelta.subVectors(movingEnd, movingStart);
		moving(movingDelta.x, movingDelta.y);
		movingStart.copy(movingEnd);
         //updating at any moment when you are moving...
		scope.update();
	}
    const movingRightAndLeft = function(){
		let aaa = new THREE.Vector3();
		return function movingRightAndLeft(distance, X0_Y1_Z2){
			aaa.setFromMatrixColumn(X0_Y1_Z2, 0);
			aaa.multiplyScalar(distance);
			movingOffset.add(aaa);
		};
	}();
	const movingUpAndDown = function(){
		let aaa = new THREE.Vector3();
		return function movingUpAndDown(distance, X0_Y1_Z2){
            console.log(distance);
			aaa.setFromMatrixColumn(X0_Y1_Z2, 2);
			aaa.multiplyScalar(distance);
			movingOffset.add(aaa);
		};
	}();
    const moving = function(){
		let offset = new THREE.Vector3();
		return function moving(deltaX, deltaY) {
			const element = getDomElement();
			if(scope.object instanceof THREE.PerspectiveCamera){
				let position = scope.object.position;
				offset.copy(position).sub(scope.target);
				let targetDistance = offset.length();
				targetDistance *= Math.tan((scope.object.fov / 2) * Math.PI / 180);
				movingRightAndLeft(2 * deltaX * targetDistance / element.clientHeight, scope.object.matrix);
				movingUpAndDown(2 * deltaY * targetDistance / element.clientHeight, scope.object.matrix);
			} 
            else if(scope.object instanceof THREE.OrthographicCamera){
				movingRightAndLeft(deltaX * ( scope.object.right - scope.object.left ) / element.clientWidth, scope.object.matrix);
				movingUpAndDown(deltaY * ( scope.object.top - scope.object.bottom ) / element.clientHeight, scope.object.matrix);
			}
		};
	}();
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////The eventlistener after clicking the mouse/////////////////////////////////////////////////////////////
    const onMouseUp = () => {
		document.removeEventListener('mousemove', onMouseMove, false);
		document.removeEventListener('mouseup', onMouseUp, false);
		scope.dispatchEvent(endEvent);
		currentStatus = generalStatus.NONE;
	}
	const onMouseDown = (event) => {
	    event.preventDefault();
		if(event.button === scope.mouseBtn.LeftMouseBtn){
			handleMouseDown_Rotate(event);
			currentStatus = generalStatus.ROTATE;
		} 
        else if(event.button === scope.mouseBtn.RightMouseBtn){
			handleMouseDown_Moving(event);
			currentStatus = generalStatus.MOVING;
		}
		if(currentStatus !== generalStatus.NONE){
			document.addEventListener('mousemove', onMouseMove, false);
			document.addEventListener('mouseup', onMouseUp, false);
			scope.dispatchEvent(startEvent);
		}
	}
	const onMouseMove = (event) => {
        event.preventDefault();
		if(currentStatus === generalStatus.ROTATE){
			handleMouseMove_Rotate(event);
		} 
        else if(currentStatus === generalStatus.MOVING){
			handleMouseMove_Moving(event);
		}
	}

	const preventEventDefault = (e) => {
		e.preventDefault();
	}

	scope.domElement.addEventListener('contextmenu', preventEventDefault, false);
	scope.domElement.addEventListener('mousedown', onMouseDown, false);
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Updating the Canvas
	this.update();
    }
    PlayerAction.prototype = Object.create(THREE.EventDispatcher.prototype);
    const playerAction = new PlayerAction(camera, domElement);
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
    

    return () => {
        ///aaaa////
    };
  }, []);


  return (
    <div ref={containerRef} />
  );
};

export default EricasoParanoidUniverse;