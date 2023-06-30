THREE.PlayerAction = function (camera, domElement) {

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
		const qqqInverse = qqq.clone().inverse();

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
};

THREE.PlayerAction.prototype = Object.create(THREE.EventDispatcher.prototype);