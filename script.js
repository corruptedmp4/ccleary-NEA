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


// player cube
    playerCube = new THREE.Mesh(
        new THREE.BoxGeometry(0.125,0.25,0.125),
        new THREE.MeshPhongMaterial({
            color: 0x07ffff
        })
    );

    scene.add(playerCube)
    scene.add(new THREE.AmbientLight(0xffffff, 0.5))


};

// animation
function animate() {
    renderer.render(scene, camera);

    if (currentKeysPressed["w"]) {
        playerCube.position.z += 0.001
    }
}


init();


