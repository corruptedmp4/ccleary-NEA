import * as THREE from 'three';
let camera, scene, renderer, playerCube;
let clock = new THREE.Clock();
let delta = 0;
let interval = 1 / 60;

const currentKeysPressed = {}
let collidableMeshList = [];

let previousPlayer;
let previousCamera;

window.addEventListener("keydown", onKeyPress);
window.addEventListener("keyup", onKeyUp);

function onKeyPress(event) {
    currentKeysPressed[event.key.toLowerCase()] = true;
}
function onKeyUp(event) {
    currentKeysPressed[event.key.toLowerCase()] = false;
}

// initialise function
function init(){

// creating the camera
    const aspectRatio = window.innerWidth / window.innerHeight;
    camera = new THREE.OrthographicCamera(-aspectRatio, aspectRatio, 1, -1, 0.1, 10);
    camera.position.y = 2 * Math.tan(Math.PI / 6);
    camera.position.z = -2;
    camera.position.x = 0;
    camera.lookAt(0,0,0);

// creating the scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x151729);

// creating the renderer
    renderer = new THREE.WebGLRenderer();
    renderer.shadowMap.enabled = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);


// playerCube
    playerCube = new THREE.Mesh(
        new THREE.BoxGeometry(0.125,0.25,0.125),
        new THREE.MeshPhongMaterial({
            color: 0x07ffff
        })
    );
    playerCube.castShadow = true;
    playerCube.position.y += 0.125

// plane
    let planeMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(2,2),
        new THREE.MeshPhongMaterial({
            color: 0xffffff
        })
    );
    planeMesh.receiveShadow = true;
    planeMesh.position.set(0,0,0)
    planeMesh.rotation.x = -Math.PI / 2

// lighting
    const spotLight = new THREE.SpotLight(0xffc100, 10, 10, Math.PI / 16, 0.02, 2);
    spotLight.position.set(2, 2, 0);
    spotLight.castShadow = true;
    const target = spotLight.target;
    target.position.set(0, 0, 0);

    const ambient = new THREE.AmbientLight(0xffffff, 0.5)

// testcube
    let collisionTestCube = new THREE.Mesh(
        new THREE.BoxGeometry(0.125,0.125,0.125),
        new THREE.MeshPhongMaterial({color: 0xff0000}),
    )
    collisionTestCube.position.set(0.5,0.0625,0);
    collidableMeshList.push(collisionTestCube);
    scene.add(collisionTestCube);


// adding objects to scene
    scene.add(planeMesh);
    scene.add(playerCube);
    scene.add(ambient);
    scene.add(target);
    scene.add(spotLight);
    previousPlayer = playerCube.clone();
    previousCamera = camera.clone();
    console.log("playerclone")
    animate()
};

// animation
function animate() {
    requestAnimationFrame(animate);
    delta += clock.getDelta();
    if(delta > interval){
        
        delta %= interval;
        sigmaCollisionCheck()
        
        movement(currentKeysPressed)
        renderer.render(scene, camera);
    }
    
   
}

// Math.floor(playerAttributes.health * 10) / 10
function movement(currentKeysPressed) {
    if (currentKeysPressed["w"]) {
        if(!justCheckCollisions()){
            previousPlayer = playerCube.clone();
            previousCamera = camera.clone();
            console.log("playerclone")
        }
        playerCube.position.z = Math.round( (playerCube.position.z + 0.005)*1000 )/1000
        camera.position.z = Math.round( (camera.position.z + 0.005)*1000 )/1000
    }
    if (currentKeysPressed["s"]) {
        if(!justCheckCollisions()){
            previousPlayer = playerCube.clone();
            previousCamera = camera.clone();
            console.log("playerclone")
        }
        playerCube.position.z = Math.round( (playerCube.position.z - 0.005)*1000 )/1000
        camera.position.z = Math.round( (camera.position.z - 0.005)*1000 )/1000
    }
    if (currentKeysPressed["a"]) {
        if(!justCheckCollisions()){
            previousPlayer = playerCube.clone();
            previousCamera = camera.clone();
            console.log("playerclone")
        }
        playerCube.position.x = Math.round( (playerCube.position.x + 0.005)*1000 )/1000
        camera.position.x = Math.round( (camera.position.x + 0.005)*1000 )/1000
    }
    if (currentKeysPressed["d"]) {
        if(!justCheckCollisions()){
            previousPlayer = playerCube.clone();
            previousCamera = camera.clone();
            console.log("playerclone")
        }
        playerCube.position.x = Math.round( (playerCube.position.x - 0.005)*1000 )/1000
        camera.position.x = Math.round( (camera.position.x - 0.005)*1000 )/1000
    }
    if (currentKeysPressed["q"]) {

    }
}



function sigmaCollisionCheck(){
    let shitCube = playerCube.clone();

    for (let vertexIndex = 0; vertexIndex < shitCube.geometry.attributes.position.array.length; vertexIndex++){       
        let localVertex = new THREE.Vector3().fromBufferAttribute(shitCube.geometry.attributes.position, vertexIndex).clone();
        let globalVertex = localVertex.applyMatrix4(shitCube.matrix);
        let directionVector = globalVertex.sub( shitCube.position );
    
        let ray = new THREE.Raycaster( shitCube.position, directionVector.clone().normalize() );
        let collisionResults = ray.intersectObjects( collidableMeshList );
        if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() ) 
        {
            playerCube.position.x = previousPlayer.position.x;
            playerCube.position.y = previousPlayer.position.y;
            playerCube.position.z = previousPlayer.position.z;

            camera.position.x = previousCamera.position.x;
            camera.position.y = previousCamera.position.y;
            camera.position.z = previousCamera.position.z;

        }
    }
}

function justCheckCollisions(){
    let shitCube = playerCube.clone();
    

    for (let vertexIndex = 0; vertexIndex < shitCube.geometry.attributes.position.array.length; vertexIndex++){       
        let localVertex = new THREE.Vector3().fromBufferAttribute(shitCube.geometry.attributes.position, vertexIndex).clone();
        let globalVertex = localVertex.applyMatrix4(shitCube.matrix);
        let directionVector = globalVertex.sub( shitCube.position );
    
        let ray = new THREE.Raycaster( shitCube.position, directionVector.clone().normalize() );
        let collisionResults = ray.intersectObjects( collidableMeshList );
        if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() ) 
        {
            return true;
        }
    }
}











init();
