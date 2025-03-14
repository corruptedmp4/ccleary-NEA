import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPixelatedPass } from "three/addons/postprocessing/RenderPixelatedPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

let camera,
  scene,
  renderer,
  playerCube,
  previousPlayer,
  previousCamera,
  threeDCursor;

let collidableMeshList = [];
let enemyList = [];
let entityList = [];
let projectileList = [];
let worldObjects = [];
let turretList = [];

let worldObjectCounter = 0;

let mousePos = { x: undefined, y: undefined };


 
 
let playerAttributes = { 
  health: 100, 
  stamina: 100, 
  ammo: 10, 
  speed: 1, 
  attackDamage: 1, 
  canShoot: true, 
  heldTile: false, 
  selectedTile: null, 
  buildMenu: { 
    open: false,
    reset: true,
  },
  inventory: {
    contents: [
      [],[],[],[],[],[],[],[],
      [],[],[],[],[],[],[],[],
      [],[],[],[]
    ],
    open: false,
    reset: true,
  },
  craftingMenu: {
    open: false,
    reset: true,
  }
};

let clock = new THREE.Clock();
let delta = 0;
let interval = 1 / 60
let composer;

let loadingComplete = false;

let models = {
  baseTile: { url: "/assets/models/baseTile.glb" },
  tree: { url: "/assets/models/tree.glb" },
  twoTree: { url: "/assets/models/twoTree.glb" },
  rocks: { url: "/assets/models/rocks.glb" },
  turret: { url: "/assets/models/turret.glb" },
  playerModel: { url: "/assets/models/playermodel.glb" },
  toaster: { url: "/assets/models/toaster.glb" },
};

let manager = new THREE.LoadingManager();
manager.onLoad = function(){
  loadingComplete = true;

}

let gltfLoader = new GLTFLoader(manager);

for (let model of Object.values(models)) {
  gltfLoader.load(model.url, (gltf) => {
    model.gltf = gltf;
    console.log(model.gltf)
    // console.log(model.gltf)
  });
}

// keypress
const currentKeysPressed = {};

// continuous

document.getElementById("settings-menu").addEventListener("click", () => {
  console.log("FUCKKKK PANIC")
})


document.getElementById("cube-button").addEventListener("click", () => {
  console.log("cube-button")
  if(inventoryRemove(["cube",1])){
    console.log("cube");
    playerAttributes.canShoot = false;
    playerAttributes.heldTile = new tile(0, 0.125, 0);
    scene.add(playerAttributes.heldTile.mesh);
  }
});

document.getElementById("stair-button").addEventListener("click", () => {
  if(inventoryRemove(["stair",1])){
    console.log("stair");
    playerAttributes.canShoot = false;
    playerAttributes.heldTile = new slope(-0.0625, 0, -0.0625);
    scene.add(playerAttributes.heldTile.mesh);
  }
});

document.getElementById("cylinder-button").addEventListener("click", () => {
  if(inventoryRemove(["cylinder",1])){
    console.log("cylinder");
    playerAttributes.canShoot = false;
    playerAttributes.heldTile = new cylinder(0, 0.125, 0);
    scene.add(playerAttributes.heldTile.mesh);
  }
});

document.getElementById("turret-button").addEventListener("click", () => {
  console.log("turret-button")
  if(inventoryRemove(["turret",1])){
    console.log("turret");
    playerAttributes.canShoot = false;
    playerAttributes.heldTile = models.turret.gltf.scene.clone()
    playerAttributes.heldTile.mesh = models.turret.gltf.scene.clone()
    playerAttributes.heldTile.name = "turret"
    playerAttributes.heldTile.mesh.scale.set(0.25,0.25,0.25)
    playerAttributes.heldTile.mesh.position.set(0, 0, 0);
    playerAttributes.heldTile.mesh.rotation.y = Math.PI / 4;
    scene.add(playerAttributes.heldTile.mesh)
  }

  
});

document.getElementById("start-button").addEventListener("click", () => {
  if(loadingComplete){
    document.getElementById("main-menu").style.visibility = "hidden";
    init()
    let slider = document.getElementById("audio-slider");
    let mainMusic = new Howl({
      src:"/assets/sounds/ccleary-music.wav",
      loop: true,
      volume: slider.value/100
    })
    mainMusic.play()
    //this is where audio should start playing
  }
})

document.getElementById("settings-exit-button").addEventListener("click", () => {
  document.getElementById("settings-menu").style.visibility = "hidden";
})

document.getElementById("settings-button").addEventListener("click", () => {
  document.getElementById("settings-menu").style.visibility = "visible";
})


window.addEventListener("mousedown", mouseClick);

function mouseClick() { // written up
  console.log("mouse clicked")

  if (playerAttributes.ammo != 0 && playerAttributes.canShoot) {
    createProjectile(playerCube);
    playerAttributes.ammo -= 1;
    document.getElementById("ammo").style.width = playerAttributes.ammo * 5 + "%";

  } else if (playerAttributes.heldTile.name != false) {
    console.log(playerAttributes.heldTile.name)
    if(playerAttributes.heldTile.mesh.name != "turret"){
      try{
        playerAttributes.heldTile.mesh.material.opacity = 1;
        playerAttributes.heldTile.mesh.material.castShadow = true;
      } catch {
        playerAttributes.heldTile.mesh.ready = true;
        turretList.push(playerAttributes.heldTile.mesh)
        console.log(turretList)
      }
      collidableMeshList.push(playerAttributes.heldTile.mesh);
      worldObjects.push(playerAttributes.heldTile.mesh)
  
      playerAttributes.canShoot = true;
      playerAttributes.heldTile = false;
      console.log(playerAttributes.canShoot,playerAttributes.heldTile)
    }
  }
}

window.addEventListener("keydown", onKeyPress);

function onKeyPress(event) {
  currentKeysPressed[event.key.toLowerCase()] = true;
}

window.addEventListener("keyup", onKeyUp);

function onKeyUp(event) {
  currentKeysPressed[event.key.toLowerCase()] = false;
}

window.addEventListener("mousemove", (event) => {
  mousePos = { x: event.clientX, y: event.clientY };
});

class tile { // written up
  constructor(x, y, z) {
    this.mesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.25, 0.25, 0.25),
      new THREE.MeshPhongMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.4,
      })
    );
    this.mesh.rotation.y = Math.PI / 4;
    this.mesh.position.set(x, y, z);
  }
}

class slope { // written up
  constructor(x, y, z) {
    let shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(0, 0.25);
    shape.lineTo(0.25, 0);
    shape.lineTo(0, 0);
    shape.moveTo(0, 0);
    let geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 0.25,
      bevelEnabled: false,
    });
    this.mesh = new THREE.Mesh(
      geometry,
      new THREE.MeshPhongMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.7,
      })
    );
    this.mesh.position.set(x, y, z);
    // this.mesh.scale.set(0.25,0.25,0.25)
    this.mesh.rotation.y = Math.PI / 4;
  }
}

class cylinder { // written up
  constructor(x, y, z) {
    this.mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.125, // radtop
        0.125, // radbot
        0.25, // height
        8 // rad segments
      ),
      new THREE.MeshPhongMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.7,
      })
    );
    this.mesh.position.set(x, y, z);
    this.mesh.rotation.y = Math.PI / 4;
  }
}

class enemy{
    constructor(x,y,z){
        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(0.0625,0.0625,0.0625),
            new THREE.MeshPhongMaterial({color:770000})
        )
        this.mesh.position.set(x,y,z);   
        enemyList.push(this.mesh)
        scene.add(this.mesh)
    }
}

class gltfObject { // written up
  constructor(tile, x, y, z) {
    /*@type {THREE.Mesh} */
    this.mesh = models[tile].gltf.scene.clone();

    if (tile == "rocks") {
      let bTile = models.baseTile.gltf.scene.clone();
      bTile.position.y -= 0.2;
      y += 0.1;

      this.mesh.add(bTile);
    } else if (tile == "tree") {
      let bTile = models.baseTile.gltf.scene.clone();
      bTile.position.y -= 0.2;
      y += 0.1;

      this.mesh.add(bTile);
    } else if (tile == "twoTree") {
      y -= 0.0001;
    }

    this.mesh.rotation.y += Math.PI / 4;
    this.mesh.position.set(x, y - 0.1, z);
    this.mesh.scale.set(0.25, 0.5, 0.25);
  }
}

function createProjectile(parentObj) { // written up
  let proj = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 0.05, 0.05),
    new THREE.MeshPhongMaterial({ color: 0x0000ff })
  );

  proj.deltaX = (Math.sin(parentObj.rotation.y) * 0.25) / 50;
  proj.deltaZ = (Math.cos(parentObj.rotation.y) * 0.25) / 50;

  proj.rotation.y = parentObj.rotation.y;

  proj.position.x =
    Math.sin(parentObj.rotation.y) * 0.25 + parentObj.position.x;
  proj.position.y = 0.0625;
  proj.position.z =
    Math.cos(parentObj.rotation.y) * 0.25 + parentObj.position.z;

  projectileList.push(proj);
  scene.add(proj);

  setTimeout(function () {
    entityList.splice(proj);
    scene.remove(proj.geometry);
    scene.remove(proj.material);
    scene.remove(proj);
  }, 2000);
}

// initialise function
function init() { // written up
  // creating the camera
  const aspectRatio = window.innerWidth / window.innerHeight;
  camera = new THREE.OrthographicCamera(
    -aspectRatio,
    aspectRatio,
    1,
    -1,
    0.1,
    10
  );
  camera.position.y = 2 * Math.tan(Math.PI / 6);
  camera.position.z = -2;
  camera.position.x = 0;
  camera.lookAt(0, 0, 0);

  // creating the scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x151729);

  // creating the renderer
  renderer = new THREE.WebGLRenderer();
  renderer.shadowMap.enabled = true;
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animate);
  document.body.appendChild(renderer.domElement);

  composer = new EffectComposer(renderer);
  let renderPixelatedPass = new RenderPixelatedPass(6, scene, camera);
  composer.addPass(renderPixelatedPass);
  let outputPass = new OutputPass();
  composer.addPass(outputPass);
  renderPixelatedPass.setPixelSize(2);

  // player cube
  playerCube = new THREE.Mesh(
    new THREE.BoxGeometry(0.125, 0.25, 0.125, 2, 2, 2),
    new THREE.MeshPhongMaterial({
      color: 0x07ffff,
      transparent: true,
      opacity: 0,
    })
  );
  playerCube.castShadow = false;
  scene.add(playerCube);

  playerCube.position.y += 0.125;

  let playerModel = models.playerModel.gltf.scene;

  playerCube.add(playerModel);
  playerModel.scale.set(0.0365, 0.0365, 0.0365);
  playerModel.rotation.y = Math.PI / 2;
  playerModel.position.y = -0.125;

  threeDCursor = new THREE.Mesh(
    new THREE.BoxGeometry(0.01, 0.12, 0.25),
    new THREE.MeshPhongMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.2,
    })
  );
  threeDCursor.position.y = 0.11;

  scene.add(threeDCursor);

  threeDCursor.scale.set(0, 0, 0)

  // spotlight
  let spotLight = new THREE.SpotLight(0xffc100, 10, 10, Math.PI / 2, 0.02, 2);
  spotLight.position.set(1, 2, 0);
  spotLight.castShadow = true;

  let target = spotLight.target;
  target.position.set(0, 0, 0);

  scene.add(spotLight);

  scene.add(new THREE.AmbientLight(0xffffff, 0.5));

  for (let xPos = -5; xPos < 5; xPos++) {
    for (let zPos = -5; zPos < 5; zPos++) {
      let randObj = randomObject();
      worldObjects[worldObjectCounter] = new gltfObject(
        randObj,
        0.35 * xPos,
        0,
        0.35 * zPos
      ).mesh;
      scene.add(worldObjects[worldObjectCounter]);
      // collidableMeshList.push(worldObjects[worldObjectCounter].mesh)
      worldObjectCounter++;
    }
  }

  for (let xPos = -5; xPos < 5; xPos++) {
    for (let zPos = -5; zPos < 5; zPos++) {
      worldObjects[worldObjectCounter] = new gltfObject(
        randomObject(),
        0.35 * xPos + 0.175,
        0,
        0.35 * zPos + 0.175
      ).mesh;
      scene.add(worldObjects[worldObjectCounter]);

      worldObjectCounter++;
    }
  }



  // let boundingBox = new THREE.Mesh(
  //     new THREE.CylinderGeometry(
  //         1,
  //         1,
  //         0.25,
  //         8
  //     ),
  //     new THREE.MeshPhongMaterial({
  //         color: 0xff00ff,
  //         transparent: true,
  //         opacity: 0.1
  //     })
  // )
  // sillyTurret.add(boundingBox)
  // boundingBox.scale.set(4,4,4)
  // sillyTurret.ready = true;
  // turretList.push(sillyTurret)




  animate();
}
// animation

function mouseStuff() { // written up
  let betterMouseY = (mousePos.y + 30 - window.innerHeight / 2) * -1;
  let betterMouseX = mousePos.x - window.innerWidth / 2;

  // betterMouseX = 0;
  // betterMouseY = 0;

  if (betterMouseX > 0 && betterMouseY > 0) {
    //console.log((Math.atan(betterMouseX/betterMouseY))*(180/Math.PI));
    playerCube.rotation.y = -Math.atan(betterMouseX / betterMouseY);
  }
  if (betterMouseX > 0 && betterMouseY < 0) {
    //console.log((Math.atan(betterMouseX/betterMouseY))*(180/Math.PI) + 180);
    playerCube.rotation.y = -Math.atan(betterMouseX / betterMouseY) + Math.PI;
  }
  if (betterMouseX < 0 && betterMouseY < 0) {
    //console.log((Math.atan(betterMouseX/betterMouseY))*(180/Math.PI) + 180);
    playerCube.rotation.y = -Math.atan(betterMouseX / betterMouseY) + Math.PI;
  }
  if (betterMouseX < 0 && betterMouseY > 0) {
    //console.log((Math.atan(betterMouseX/betterMouseY))*(180/Math.PI) + 360);
    playerCube.rotation.y =
      -Math.atan(betterMouseX / betterMouseY) + 2 * Math.PI;
  }
  if (playerAttributes.buildMenu.open) {
    threeDCursorStuff();
  }


  if (playerAttributes.heldTile != false) {
    playerAttributes.heldTile.mesh.position.x =
      (Math.round((threeDCursor.position.x / 17.5) * 100) / 100) * 17.5;
    playerAttributes.heldTile.mesh.position.z =
      (Math.round((threeDCursor.position.z / 17.5) * 100) / 100) * 17.5;
  }

  //
}

// movement
function movement(currentKeysPressed) { // written up
  if (currentKeysPressed["w"]) {
    if (!justCheckCollisions(playerCube)) {
      previousPlayer = playerCube.clone();
      previousCamera = camera.clone();
    }
    playerCube.position.z =
      Math.round((playerCube.position.z + 0.005) * 1000) / 1000;
    camera.position.z = Math.round((camera.position.z + 0.005) * 1000) / 1000;
  }
  if (currentKeysPressed["s"]) { // written up
    if (!justCheckCollisions(playerCube)) {
      previousPlayer = playerCube.clone();
      previousCamera = camera.clone();
    }
    playerCube.position.z =
      Math.round((playerCube.position.z - 0.005) * 1000) / 1000;
    camera.position.z = Math.round((camera.position.z - 0.005) * 1000) / 1000;
  }
  if (currentKeysPressed["a"]) { // written up
    if (!justCheckCollisions(playerCube)) {
      previousPlayer = playerCube.clone();
      previousCamera = camera.clone();
    }
    playerCube.position.x =
      Math.round((playerCube.position.x + 0.005) * 1000) / 1000;
    camera.position.x = Math.round((camera.position.x + 0.005) * 1000) / 1000;
  }
  if (currentKeysPressed["d"]) { // written up
    if (!justCheckCollisions(playerCube)) {
      previousPlayer = playerCube.clone();
      previousCamera = camera.clone();
    }
    playerCube.position.x =
      Math.round((playerCube.position.x - 0.005) * 1000) / 1000;
    camera.position.x = Math.round((camera.position.x - 0.005) * 1000) / 1000;
  }

  if (currentKeysPressed["q"]) {
    let randX = 1.5-Math.random()*3;
    let randZ = 1.5-Math.random()*3;


    new enemy(randX, 0.0625, randZ);
  }

  if (currentKeysPressed["r"]) { // written up
    playerAttributes.canShoot = false;
    
    setTimeout(function () {
      playerAttributes.ammo = 10;
      document.getElementById("ammo").style.width =
        playerAttributes.ammo * 5 + "%";
      playerAttributes.canShoot = true;
    }, 1500);
  }

  if(currentKeysPressed["e"]){ // written up
    inventoryManagement()
  } else if (!currentKeysPressed["e"]){
    playerAttributes.inventory.reset = true;
  }

  if(currentKeysPressed["g"]){
    craftingMenuManagement();
  } else if (!currentKeysPressed["g"]){
    playerAttributes.craftingMenu.reset = true;
  }

  if (currentKeysPressed["t"]) {
  }

  if (currentKeysPressed["x"]) { // written up
    if (playerAttributes.selectedTile != null && !playerAttributes.heldTile && playerAttributes.buildMenu.open) {
      harvest();
      playerAttributes.selectedTile.scale.set(0, 0, 0)
      playerAttributes.selectedTile = null;
    }
  }

  if (currentKeysPressed["b"]) { // written up
    if (playerAttributes.buildMenu.reset == true && playerAttributes.buildMenu.open == true){
      playerAttributes.buildMenu.open = false;
      playerAttributes.buildMenu.reset = false;

      let bMenu = document.getElementById("build-menu-container");
      playerAttributes.canShoot = true;
      tileColourReset()
      playerAttributes.selectedTile = null;
      bMenu.style.visibility = "hidden";
      threeDCursor.scale.set(0, 0, 0)

    } else if (playerAttributes.buildMenu.reset == true && playerAttributes.buildMenu.open == false){
      playerAttributes.buildMenu.open = true;
      playerAttributes.buildMenu.reset = false

      let bMenu = document.getElementById("build-menu-container");
      playerAttributes.canShoot = false;
      bMenu.style.visibility = "visible";
      threeDCursor.scale.set(1, 1, 1)

    }

  } else if (!currentKeysPressed["b"]){
    playerAttributes.buildMenu.reset = true;
  }

}

function craftingMenuManagement(){
  let pMenu = playerAttributes.craftingMenu;

  if(pMenu.reset == true && pMenu.open == true){
    pMenu.open = false;
    pMenu.reset = false;
    
    document.getElementById("crafting-container").style.visibility = "hidden";

// turret cube stair cylinder ammo health

  } else if(pMenu.reset == true && pMenu.open == false){
    pMenu.open = true;
    pMenu.reset = false;

    document.getElementById("crafting-container").style.visibility = "visible";


    document.getElementById("craft-1").addEventListener("click", () => {
      console.log("craft turret")
      if(inventoryRemove(["rock",12])){
        inventoryAdd(["turret",1])
      } else {
        console.log("not crafted")
      }
    })


    document.getElementById("craft-2").addEventListener("click", () => {
      console.log("craft cube")
      if(inventoryRemove(["rock",3])){
        inventoryAdd(["cube",1])
      } else {
        console.log("crafted")
      }
    })


    document.getElementById("craft-3").addEventListener("click", () => {
      console.log("craft stair")
      if(inventoryRemove(["rock",3])){
        inventoryAdd(["stair",1])
      } else {
        console.log("crafted")
      }
    })


    document.getElementById("craft-4").addEventListener("click", () => {
      console.log("craft cylinder")
      if(inventoryRemove(["rock",3])){
        inventoryAdd(["cylinder",1])
      } else {
        console.log("crafted")
      }
    })


    document.getElementById("craft-5").addEventListener("click", () => {
      console.log("craft ammo")
    })


    document.getElementById("craft-6").addEventListener("click", () => {
      console.log("craft health")
    })


    //

    
  }

}


function threeDCursorStuff() { // written up
  let vector = new THREE.Vector3();
  vector.set(
    (mousePos.x / window.innerWidth) * 2 - 1,
    -(mousePos.y / window.innerHeight) * 2 + 2,
    0
    // WHAT THE ACTUAL FUCK
  );

  vector.unproject(camera);

  // console.log("collidables: ",collidableMeshList[0]);
  // console.log("worldObj: ",worldObjects[0])

  threeDCursor.position.x = vector.x;
  threeDCursor.position.z = vector.y * 2 + 0.75 + playerCube.position.z;

  for (
    let vertexIndex = 0;
    vertexIndex < threeDCursor.geometry.attributes.position.array.length;
    vertexIndex++
  ) {
    let localVertex = new THREE.Vector3()
      .fromBufferAttribute(
        threeDCursor.geometry.attributes.position,
        vertexIndex
      )
      .clone();
    let globalVertex = localVertex.applyMatrix4(threeDCursor.matrix);
    let directionVector = globalVertex.sub(threeDCursor.position);

    let ray = new THREE.Raycaster(
      threeDCursor.position,
      directionVector.clone().normalize()
    );
    let collisionResults = ray.intersectObjects(worldObjects);
    if (
      collisionResults.length > 0 &&
      collisionResults[0].distance < directionVector.length()
    ) {
      let intersectedObject = collisionResults[0].object;
      if (!intersectedObject.hasMaterialBeenCloned) {

        intersectedObject.material = intersectedObject.material.clone();
        intersectedObject.hasMaterialBeenCloned = true;
      }

      if (playerAttributes.selectedTile != null) {
        // console.log(" CRAWLLLLLINNGGG INNNNNN MY SKINNNNNN",playerAttributes.selectedTile.material.color)
        // playerAttributes.selectedTile.material.color.set(0xffffff);

        tileColourReset();
      }

      //   intersectedObject.material.color.set(0xff0000);
      playerAttributes.selectedTile = intersectedObject;
      intersectedObject.material.color.set(0xff0000)
    }
  }
}

function resetCollisionCheck() { // written up
  let shitCube = playerCube.clone();
  for (
    let vertexIndex = 0;
    vertexIndex < shitCube.geometry.attributes.position.array.length;
    vertexIndex++
  ) {
    let localVertex = new THREE.Vector3()
      .fromBufferAttribute(shitCube.geometry.attributes.position, vertexIndex)
      .clone();
    let globalVertex = localVertex.applyMatrix4(shitCube.matrix);
    let directionVector = globalVertex.sub(shitCube.position);

    let ray = new THREE.Raycaster(
      shitCube.position,
      directionVector.clone().normalize()
    );
    let collisionResults = ray.intersectObjects(collidableMeshList);
    if (
      collisionResults.length > 0 &&
      collisionResults[0].distance < directionVector.length()
    ) {
      playerCube.position.x = previousPlayer.position.x;
      playerCube.position.y = previousPlayer.position.y;
      playerCube.position.z = previousPlayer.position.z;

      camera.position.x = previousCamera.position.x;
      camera.position.y = previousCamera.position.y;
      camera.position.z = previousCamera.position.z;

      // just need to make the x,y,z resets independent! thats it! then im done!
    }
  }
}

function justCheckCollisions(input) { // written up
  let shitCube = input.clone();
  for (
    let vertexIndex = 0;
    vertexIndex < shitCube.geometry.attributes.position.array.length;
    vertexIndex++
  ) {
    let localVertex = new THREE.Vector3()
      .fromBufferAttribute(shitCube.geometry.attributes.position, vertexIndex)
      .clone();
    let globalVertex = localVertex.applyMatrix4(shitCube.matrix);
    let directionVector = globalVertex.sub(shitCube.position);

    let ray = new THREE.Raycaster(
      shitCube.position,
      directionVector.clone().normalize()
    );
    let collisionResults = ray.intersectObjects(collidableMeshList);
    if (
      collisionResults.length > 0 &&
      collisionResults[0].distance < directionVector.length()
    ) {
      return true;
    }
  }
}

function enemyManagement() { // written up
  for (let i = 0; i < enemyList.length; i++) {
    let attack1 = false;
    let attack2 = false;

    let tempEnemyPos = enemyList[i].position.clone();

    // move towards
    // how tf do i make it go round or even recognize objects
    if (playerCube.position.x > enemyList[i].position.x) {
      if (playerCube.position.x - (enemyList[i].position.x + 0.1) > 0) {
        enemyList[i].position.x += 0.0015 + Math.floor((Math.random()-0.5)*180)/10000;
      } else {
        attack1 = true;
      }
    } else {
      if (enemyList[i].position.x - (playerCube.position.x + 0.1) > 0) {
        enemyList[i].position.x -= 0.0015 + Math.floor((Math.random()-0.5)*180)/10000;
      } else {
        attack1 = true;
      }
    }
    if (playerCube.position.z > enemyList[i].position.z) {
      if (playerCube.position.z - (enemyList[i].position.z + 0.1) > 0) {
        enemyList[i].position.z += 0.0015 + Math.floor((Math.random()-0.5)*180)/10000;
      } else {
        attack2 = true;
      }
    } else {
      if (enemyList[i].position.z - (playerCube.position.z + 0.1) > 0) {
        enemyList[i].position.z -= 0.0015 + Math.floor((Math.random()-0.5)*60)/10000;
      } else {
        attack2 = true;
      }
    }
    if (attack1 && attack2) {
      if (playerAttributes.health > 0) {
        playerAttributes.health -= 0.1;
        playerAttributes.health = Math.floor(playerAttributes.health * 10) / 10;
        document.getElementById("health").style.width = playerAttributes.health*0.5 + "%";

        if(playerAttributes.health <= 0){
          document.getElementById("game-over").style.visibility = "visible";
        }

      }
    }

    // run collision check
    // if colliding enemyList[i].position = tempEnemyPos.clone();
    // else nothing
    if(justCheckCollisions(enemyList[i])){
      enemyList[i].position.x = tempEnemyPos.x;
      enemyList[i].position.y = tempEnemyPos.y;
      enemyList[i].position.z = tempEnemyPos.z;
    } else {
      console.log("all good heree yes siree")
    }

    for(let j = 0; j < turretList.length; j++){
      try{
        if(enemyList[i].position != undefined){
          if(enemyList[i].position.distanceTo(turretList[j].position) < 1){
            if(turretList[j].ready == true){
                turretList[j].ready = false;
                scene.remove(enemyList[i].geometry)
                scene.remove(enemyList[i].material)
                scene.remove(enemyList[i])
                enemyList.splice(i,1)
                setTimeout(function(){
                    turretList[j].ready = true;
                },500)
            }
          }
        }
      } catch(error){
      }

    }
  }
  checkEnemyHit();
}

function checkEnemyHit() { // written up
  for (let i = 0; i < enemyList.length; i++) {
    for (
      let j = 0;
      j < enemyList[i]?.geometry.attributes.position.array.length;
      j++
    ) {
      let localVertex = new THREE.Vector3()
        .fromBufferAttribute(enemyList[i].geometry.attributes.position, j)
        .clone();
      let globalVertex = localVertex.applyMatrix4(enemyList[i].matrix);
      let directionVector = globalVertex.sub(enemyList[i].position);

      let ray = new THREE.Raycaster(
        enemyList[i].position,
        directionVector.clone().normalize()
      );
      let collisionResults = ray.intersectObjects(projectileList);
      if (
        collisionResults.length > 0 &&
        collisionResults[0].distance < directionVector.length()
      ) {
        scene.remove(enemyList[i]);
        enemyList.splice(i, 1);
      }
    }
  }
}
//

function animate() { // written up
  delta += clock.getDelta();
  if (delta > interval) {
    resetCollisionCheck();
    movement(currentKeysPressed);
    mouseStuff();
    enemyManagement();
    for (let i = 0; i < projectileList.length; i++) {
      projectileList[i].position.x += projectileList[i].deltaX;
      projectileList[i].position.z += projectileList[i].deltaZ;
    }

    for (let i = 0; i < turretList.length; i++){
      turretList[i].rotation.y += Math.PI/128
    }
    delta %= interval;
    composer.render(scene, camera);
    // renderer.render(scene,camera)
  }
}

function randomObject() { // written up
  let randNum = Math.floor(Math.random() * 15);
  let tile;

  if (randNum == 0) {
    tile = "tree";
  } else if (randNum == 1) {
    tile = "twoTree";
  } else if (randNum == 2) {
    tile = "rocks";
  } else {
    tile = "baseTile";
  }
  return tile;
}

function tileColourReset() { // written up
  if (playerAttributes.selectedTile != null) {
    if (playerAttributes.selectedTile.name == "Mesh_tree") {
      playerAttributes.selectedTile.material.color.set(0x8ddbc4)

    } else if (playerAttributes.selectedTile.name == "Mesh_tree_1") {
      playerAttributes.selectedTile.material.color.set(0xf1c1a2)

    } else if (playerAttributes.selectedTile.name == "Mesh_tree_2") {
      playerAttributes.selectedTile.material.color.set(0x8ddbc4)

    } else if (playerAttributes.selectedTile.name == "Mesh_tree_3") {
      playerAttributes.selectedTile.material.color.set(0xf1c1a2)

    } else if (playerAttributes.selectedTile.name == "detail_rocks") {
      playerAttributes.selectedTile.material.color.set(0xd4edf2)

    } else if (playerAttributes.selectedTile.name == "Mesh_detail_tree") {
      playerAttributes.selectedTile.material.color.set(0x8ddbc4)

    } else if (playerAttributes.selectedTile.name == "Mesh_detail_tree_1") {
      playerAttributes.selectedTile.material.color.set(0xf1c1a2)
    } else if (playerAttributes.selectedTile.name == "Mesh_weapon_blaster"){
      playerAttributes.selectedTile.material.color.set(0xa8d7e2)

    } else if (playerAttributes.selectedTile.name == "Mesh_weapon_blaster_1"){
      playerAttributes.selectedTile.material.color.set(0xd65b5b)
    } else if (playerAttributes.selectedTile.name == "Mesh_weapon_blaster_2"){
      playerAttributes.selectedTile.material.color.set(0x789ba3)

    } else {
      
      playerAttributes.selectedTile.material.color.set(0xffffff)
    }

  }

}



// harvesting
function harvest() { // written up
  if (playerAttributes.selectedTile != null) {
    if (playerAttributes.selectedTile.name == "Mesh_tree") {
      inventoryAdd(["wood",1])

    } else if (playerAttributes.selectedTile.name == "Mesh_tree_1") {
      inventoryAdd(["wood",1])

    } else if (playerAttributes.selectedTile.name == "Mesh_tree_2") {
      inventoryAdd(["wood",1])

    } else if (playerAttributes.selectedTile.name == "Mesh_tree_3") {
      inventoryAdd(["wood",1])

    } else if (playerAttributes.selectedTile.name == "detail_rocks") {
      inventoryAdd(["rock",1])

    } else if (playerAttributes.selectedTile.name == "Mesh_detail_tree") {
      inventoryAdd(["wood",1])

    } else if (playerAttributes.selectedTile.name == "Mesh_detail_tree_1") {
      inventoryAdd(["wood",1])

    }
  }
}

function inventoryManagement(){ // written up
  let pInv = playerAttributes.inventory

  if(pInv.reset == true && pInv.open == true){
    pInv.open = false;
    pInv.reset = false;
    document.getElementById("inventory-container").style.visibility = "hidden";

  } else if(pInv.reset == true && pInv.open == false){
    pInv.open = true;
    pInv.reset = false;

    for(let i = 0; i < pInv.contents.length; i++){
      if(i != undefined){
        document.getElementById("slot-"+i).innerHTML = pInv.contents[i];
      } else {
        document.getElementById("slot-"+i).innerHTML = "_";
      }
    }

    document.getElementById("inventory-container").style.visibility = "visible"
  }


}


function inventoryAdd(input){ // written up
  let pInv = playerAttributes.inventory.contents;
  let noSlotFound = true;
  let i = 0;

  while(noSlotFound){
    if(pInv[i][0] != undefined){
      if(pInv[i][0] == input[0]){ // if the current index item = what needs to be added
        pInv[i][1] += input[1];
        noSlotFound = false;
      }
    }
    i++
    if (i == pInv.length){ // if cant find
      
      for(let i = 0; i < pInv.length; i++){
        
        if(pInv[i][0] == undefined){
          pInv[i] = input; // asign to an empty slot
          noSlotFound = false;
          i = pInv.length
        }
      }
      noSlotFound = false;
    }
  }
  
}

function inventoryRemove(input){
  let pInv = playerAttributes.inventory.contents;
  let noSlotFound = true;
  let i = 0;

  while(noSlotFound){
    if(pInv[i][0] != undefined){
      if(pInv[i][0] == input[0]){ // if the current index item = what needs to be added

        let remainingValue = pInv[i][1] - input[1]

        console.log(remainingValue)

        if(remainingValue >= 0){ // if the amount of resources after removal >= 0
          pInv[i][1] -= input[1]; // remove the resources
          //add one to turret storage 
          return true // can craft / place
        } else {
          console.log("not removed") // not enough resources to craft / place
          return false;
        }
      }
    }

    i++

    if (i == pInv.length){ // if cant find
      return false; //  cant craft / place
    }
  }
  
}


/* trash heap VVVVVVVV



*/

// EXPORT
/*















    





*/
