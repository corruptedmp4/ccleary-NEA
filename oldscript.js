import * as THREE from 'three'; // imports

let camera, scene, renderer, playerCube;

// finding keys that are currently pressed
const currentKeysPressed = {};

function onKeyPress(event) {
  currentKeysPressed[event.key] = true;
}
function onKeyUp(event) {
  currentKeysPressed[event.key] = false;
}

window.addEventListener("keydown",onKeyPress);
window.addEventListener("keyup",onKeyUp);


// initialize essential parts of the scene
function init(){
  
  // creating the camera
  const aspectRatio = window.innerWidth / window.innerHeight;
  camera = new THREE.OrthographicCamera(-aspectRatio, aspectRatio, 1, -1, 0.1, 10);
  camera.position.y = 2 * Math.tan(Math.PI / 6);
  camera.position.z = 2;
  camera.position.x = 2;
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

  // creating the composer
  

  // creating objects
  const planeMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2,2),
    new THREE.MeshPhongMaterial({
      color: 0x15ff29
    })
  );
  planeMesh.receiveShadow = true;
  planeMesh.rotation.x = -Math.PI / 2

  playerCube = new THREE.Mesh(
    new THREE.BoxGeometry(0.125,0.25,0.125),
    new THREE.MeshPhongMaterial({
      color: 0x07ffff
    })
  );
  playerCube.position.set(0,0.125,0);
  playerCube.castShadow = true;

  // add objects to scene
  scene.add(planeMesh);
  scene.add(playerCube);
  
  // creating lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.5))

  const directionalLight = new THREE.DirectionalLight(0xfffecd, 1.5);
  directionalLight.position.set(100, 100, 100);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.set(2048, 2048); 

  const spotLight = new THREE.SpotLight(0xffc100, 10, 10, Math.PI / 16, 0.02, 2);
  spotLight.position.set(2, 2, 0);
  const target = spotLight.target;
  scene.add(target);
  target.position.set(0, 0, 0);
  spotLight.castShadow = true;
  scene.add(spotLight);

  
}

function animate(){
  // why does this lag SO HARD
  renderer.render(scene, camera);
  requestAnimationFrame(animate);

  // this shit fucked V
  
  if (currentKeysPressed["w"] && currentKeysPressed["d"]) {
    playerCube.position.z -= 0.000023;
    camera.position.z -= 0.000023;
    
    

  } else if (currentKeysPressed["w"] && currentKeysPressed["a"]) {
    playerCube.position.x -= 0.000023;
    camera.position.x -= 0.000023;
    

  } else if (currentKeysPressed["s"] && currentKeysPressed["d"]) {
    playerCube.position.x += 0.000023;
    camera.position.x += 0.000023;
    
    

  } else if (currentKeysPressed["s"] && currentKeysPressed["a"]) {
    playerCube.position.z += 0.000023;
    camera.position.z += 0.000023;
    
    

  } else if (currentKeysPressed["w"]) {
    playerCube.position.z -= 0.000023;
    camera.position.z -= 0.000023;
    playerCube.position.x -= 0.000023;
    camera.position.x -= 0.000023;
    

  } else if (currentKeysPressed["s"]) {
    playerCube.position.z += 0.000023;
    camera.position.z += 0.000023;
    playerCube.position.x += 0.000023;
    camera.position.x += 0.000023;
    
  } else if (currentKeysPressed["a"]) {
    playerCube.position.z += 0.000023;
    camera.position.z += 0.000023;
    playerCube.position.x -= 0.000023;
    camera.position.x -= 0.000023;
    

  } else if (currentKeysPressed["d"]) {
    playerCube.position.z -= 0.000023;
    camera.position.z -= 0.000023;
    playerCube.position.x += 0.000023;
    camera.position.x += 0.000023;
    
  }
}

init();