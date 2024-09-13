import * as THREE from 'three';

let camera, scene, renderer, playerCube;

const currentKeysPressed = {};

function onKeyPress(event) {
    currentKeysPressed[event.key] = true;
  }
  function onKeyUp(event) {
    currentKeysPressed[event.key] = false;
  }
  
  window.addEventListener("keydown",onKeyPress);
  window.addEventListener("keyup",onKeyUp);

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
    renderer.setAnimationLoop(animate);
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

// collision test cube
     let collisionCube = new THREE.Mesh(
        new THREE.BoxGeometry(0.125, 0.125, 0.125),
        new THREE.MeshPhongMaterial({
            color: 0xff5500
        })
    );
    collisionCube.position.set(-0.25,0.05125,0.1)
    collisionCube.castShadow = true;

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


// adding objects to scene
    scene.add(collisionCube)
    scene.add(planeMesh);
    scene.add(playerCube);
    scene.add(ambient);
    scene.add(target);
    scene.add(spotLight);

};

// animation
function animate() {
    renderer.render(scene, camera);

    if (currentKeysPressed["w"] && currentKeysPressed["a"]) {
        playerCube.position.z += 0.0035
        playerCube.position.x += 0.0035
    } else if (currentKeysPressed["w"] && currentKeysPressed["d"]) {
        playerCube.position.z += 0.0035
        playerCube.position.x -= 0.0035
    } else if (currentKeysPressed["s"] && currentKeysPressed["a"]) {
        playerCube.position.z -= 0.0035
        playerCube.position.x += 0.0035
    } else if (currentKeysPressed["s"] && currentKeysPressed["d"]) {
        playerCube.position.z -= 0.0035
        playerCube.position.x -= 0.0035
    } else if (currentKeysPressed["w"]) {
        playerCube.position.z += 0.005;
    } else if (currentKeysPressed["a"]) {
        playerCube.position.x += 0.005;
    } else if (currentKeysPressed["s"]) {
        playerCube.position.z -= 0.005;
    } else if (currentKeysPressed["d"]) {
        playerCube.position.x -= 0.005;
    }



}


init();


