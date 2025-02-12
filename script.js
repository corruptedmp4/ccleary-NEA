import * as THREE from 'three';
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js"
import * as SkeletonUtils from "three/addons/utils/SkeletonUtils.js"
let camera, scene, renderer, playerCube, previousPlayer, previousCamera, playerCubeHealthIndicator;
let collidableMeshList = [];
let enemyList = [];
let entityList = [];
let projectileList = [];
let worldObjects = [];

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
      [],[],[],[],[],[],[],[],
      [],[],[],[],[],[],[],[],
      [],[],[],[],[],[],[],[],
    ],
    open: false,
    reset: true,
  }
};

let clock = new THREE.Clock();
let delta = 0;
let interval = 1 / 60;

// let models = {
//     player: {url: "assets/models/playermodel.glb"}
// }

const loader = new THREE.TextureLoader();
const tempMaterials = [
    new THREE.MeshPhongMaterial({ map: loadColorTexture("assets/textures/left.png") }),
    new THREE.MeshPhongMaterial({ map: loadColorTexture("assets/textures/right.png") }),
    new THREE.MeshPhongMaterial({ map: loadColorTexture("assets/textures/top.png") }),
    new THREE.MeshPhongMaterial({ map: loadColorTexture("assets/textures/bottom.png") }),
    new THREE.MeshPhongMaterial({ map: loadColorTexture("assets/textures/front.png") }),
    new THREE.MeshPhongMaterial({ map: loadColorTexture("assets/textures/back.png") }),
];

// const gltfLoader = new GLTFLoader();
// // for (const model of Object.values(models)){
// //     gltfLoader.load(model.url, (gltf) => {
// //         model.gltf = gltf
// //     })
// // }
// gltfLoader.load("assets/models/playermodel.glb",
//     function(gltf){
//         gltf.scene.scale.set(0.0365,0.0365,0.0365)
//         let grah = gltf.scene
        
//         playerCube.add(grah);
//         grah.rotation.y = Math.PI/2
//         grah.position.y -= 0.125;
        
//     }
// )

// console.log(models.player)

// function prepAnims(){
//     Object.values(models).forEach( model => {
//         const animsByName = {};
//         model.gltf.animations.forEach((clip) => {
//             animsByName[clip.name] = clip
//         });
//         model.animations = animsByName;
//     })

// }








function loadColorTexture(path) {
    const texture = loader.load(path);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

// keypress 
const currentKeysPressed = {};

// continuous

window.addEventListener("keydown", onKeyPress);
window.addEventListener("keyup", onKeyUp);
window.addEventListener("mousedown", mouseClick);

function mouseClick() { // written up





  if (playerAttributes.ammo != 0 && playerAttributes.canShoot) {
    createProjectile(playerCube);
    playerAttributes.ammo -= 1;
    document.getElementById("ammo").style.width =
      playerAttributes.ammo * 10 + "px";
  } else if (playerAttributes.heldTile != false) {
    playerAttributes.heldTile.mesh.material.opacity = 1;
    playerAttributes.heldTile.mesh.material.castShadow = true;
    collidableMeshList.push(playerAttributes.heldTile.mesh);
    worldObjects.push(playerAttributes.heldTile.mesh)

    playerAttributes.canShoot = true;
    playerAttributes.heldTile = false;
  }
}

window.addEventListener("keydown", onKeyPress);

function onKeyPress(event) {
    currentKeysPressed[event.key.toLowerCase()] = true;
}
function onKeyUp(event) {
    currentKeysPressed[event.key.toLowerCase()] = false;
}



function mouseClick() {
    if(playerAttributes.ammo != 0 && playerAttributes.canShoot){
        createProjectile(playerCube);
        playerAttributes.ammo -= 1;
        document.getElementById("ammo").style.width = (playerAttributes.ammo*10 + "px");
    }
}

class tile {
    constructor(x, y, z, texture) {
        let tile = new THREE.Mesh(
            new THREE.BoxGeometry(0.25, 0.25, 0.25),
            new THREE.MeshPhongMaterial({
                color: texture
            })
        )
        tile.rotation.y = Math.PI / 4;
        tile.position.set(x, y, z)
        collidableMeshList.push(tile)
        scene.add(tile);
    }
}

class entity {
    constructor(x, y, z, texture) {
        let entity = new THREE.Mesh(
            new THREE.BoxGeometry(0.125, 0.125, 0.125),
            new THREE.MeshPhongMaterial({
                color: texture
            })
        )
        entity.position.set(x, y, z)
        enemyList.push(entity)
        scene.add(entity);
    }
    updatePosition(x, y, z) {
        entity.position.set(x, y, z);
    }
}

function createProjectile(parentObj) {

    let proj = new THREE.Mesh(
        new THREE.BoxGeometry(0.1,0.05,0.05),
        new THREE.MeshPhongMaterial({color: 0x0000ff})
    );

    proj.deltaX = (Math.sin(parentObj.rotation.y)*0.25) / 50
    proj.deltaZ = (Math.cos(parentObj.rotation.y)*0.25) / 50

    proj.rotation.y = parentObj.rotation.y;

    proj.position.x = (Math.sin(parentObj.rotation.y)*0.25) + parentObj.position.x;
    proj.position.y = 0.0625
    proj.position.z = (Math.cos(parentObj.rotation.y)*0.25) + parentObj.position.z;

    projectileList.push(proj);
    scene.add(proj)

    setTimeout(function(){
        entityList.splice(proj);
        scene.remove(proj.geometry);
        scene.remove(proj.material);
        scene.remove(proj);
    },2000)
}


// initialise function
function init() {

    // creating the camera
    const aspectRatio = window.innerWidth / window.innerHeight;
    camera = new THREE.OrthographicCamera(-aspectRatio, aspectRatio, 1, -1, 0.1, 10);
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


    // player cube
    playerCube = new THREE.Mesh(
        new THREE.BoxGeometry(0.125, 0.25, 0.125,2,2,2),
        // new THREE.MeshPhongMaterial({
        //     color: 0x07ffff,
        //     transparent: true,
        //     opacity: 0})
        tempMaterials
    );
    playerCube.castShadow = false;
    playerCube.position.y += 0.125
    scene.add(playerCube);

    playerCubeHealthIndicator = new THREE.Mesh(
        new THREE.BoxGeometry(0.125, 0.25, 0.125),
        new THREE.MeshPhongMaterial({
            color: 0xff2200,
            transparent: true,
            opacity: 0
        })
    );
    playerCube.add(playerCubeHealthIndicator)

    // plane
    let planeMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 2),
        new THREE.MeshPhongMaterial({
            color: 0x00dd99
        })
    );
    planeMesh.receiveShadow = true;
    planeMesh.position.set(0, 0, 0);
    planeMesh.rotation.x = -Math.PI / 2;
    planeMesh.rotation.z = Math.PI / 4

    scene.add(planeMesh);

    // spotlight
    let spotLight = new THREE.SpotLight(0xffc100, 10, 10, Math.PI / 16, 0.02, 2);
    spotLight.position.set(2, 2, 0);
    spotLight.castShadow = true;

    let target = spotLight.target;
    target.position.set(0, 0, 0);

    scene.add(spotLight)

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    // prepAnims();
    // Object.values(models).forEach((model, ndx) => {
    //     const clonedScene = SkeletonUtils.clone(model.gltf.scene);
    //     const root = new THREE.Object3D();
    //     root.add(clonedScene);
    //     scene.add(root);
    //     root.position.x = (ndx - 3) * 3;
    //   });

    animate()
};

// animation

// this all needs documenting
function mouseStuff() {
    let betterMouseY = (mousePos.y + 30 - (window.innerHeight / 2)) * -1;
    let betterMouseX = (mousePos.x - (window.innerWidth / 2));

    // betterMouseX = 0;
    // betterMouseY = 0;


    if (betterMouseX > 0 && betterMouseY > 0) {
        //console.log((Math.atan(betterMouseX/betterMouseY))*(180/Math.PI));
        playerCube.rotation.y = -(Math.atan(betterMouseX / betterMouseY));
    }
    if (betterMouseX > 0 && betterMouseY < 0) {
        //console.log((Math.atan(betterMouseX/betterMouseY))*(180/Math.PI) + 180);
        playerCube.rotation.y = -(Math.atan(betterMouseX / betterMouseY)) + Math.PI;
    }
    if (betterMouseX < 0 && betterMouseY < 0) {
        //console.log((Math.atan(betterMouseX/betterMouseY))*(180/Math.PI) + 180);
        playerCube.rotation.y = -(Math.atan(betterMouseX / betterMouseY)) + Math.PI;
    }
    if (betterMouseX < 0 && betterMouseY > 0) {
        //console.log((Math.atan(betterMouseX/betterMouseY))*(180/Math.PI) + 360);
        playerCube.rotation.y = -(Math.atan(betterMouseX / betterMouseY)) + 2 * Math.PI;
    }
}

// movement
function movement(currentKeysPressed) {

    if (currentKeysPressed["w"]) {
        if(!justCheckCollisions()){
            previousPlayer = playerCube.clone();
            previousCamera = camera.clone();

<<<<<<< HEAD
=======
  if (currentKeysPressed["r"]) { // written up
    playerAttributes.canShoot = false;
    setTimeout(function () {
      playerAttributes.ammo = 10;
      document.getElementById("ammo").style.width =
        playerAttributes.ammo * 10 + "px";
      playerAttributes.canShoot = true;
    }, 1500);
  }

  if(currentKeysPressed["e"]){ // written up
    inventoryManagement()
  } else if (!currentKeysPressed["e"]){
    playerAttributes.inventory.reset = true;
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

      let bMenu = document.getElementById("build-menu");
      playerAttributes.canShoot = true;
      tileColourReset()
      playerAttributes.selectedTile = null;
      bMenu.style.visibility = "hidden";
      threeDCursor.scale.set(0, 0, 0)

    } else if (playerAttributes.buildMenu.reset == true && playerAttributes.buildMenu.open == false){
      playerAttributes.buildMenu.open = true;
      playerAttributes.buildMenu.reset = false

      let bMenu = document.getElementById("build-menu");
      playerAttributes.canShoot = false;
      bMenu.style.visibility = "visible";
      threeDCursor.scale.set(1, 1, 1)

    }

  } else if (!currentKeysPressed["b"]){
    playerAttributes.buildMenu.reset = true;
  }

}

/*
    if (playerAttributes.buildMenu) {
      playerAttributes.buildMenu = false;
    }
    let bMenu = document.getElementById("build-menu");
    playerAttributes.buildMenu = true;
*/



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

function justCheckCollisions() { // written up
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
      return true;
    }
  }
}

function enemyManagement() { // written up
  for (let i = 0; i < enemyList.length; i++) {
    let attack1 = false;
    let attack2 = false;

    // move towards

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
        document.getElementById("health").style.width =
          playerAttributes.health * 2 + "px";
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
    delta %= interval;
    composer.render(scene, camera);
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
      if(pInv[i][0] == input[0]){
        pInv[i][1] += input[1];
        noSlotFound = false;
      }
    }
    i++
    if (i == pInv.length){
      
      for(let i = 0; i < pInv.length; i++){
        
        if(pInv[i][0] == undefined){
          pInv[i] = input;
          noSlotFound = false;
          i = pInv.length
>>>>>>> 8997199 (snap building, object harvesting, inventory, etc.)
        }
        playerCube.position.z = Math.round( (playerCube.position.z + 0.005)*1000 )/1000
        camera.position.z = Math.round( (camera.position.z + 0.005)*1000 )/1000
    }
    if (currentKeysPressed["s"]) {
        if(!justCheckCollisions()){
            previousPlayer = playerCube.clone();
            previousCamera = camera.clone();

        }
        playerCube.position.z = Math.round( (playerCube.position.z - 0.005)*1000 )/1000
        camera.position.z = Math.round( (camera.position.z - 0.005)*1000 )/1000
    }
    if (currentKeysPressed["a"]) {
        if(!justCheckCollisions()){
            previousPlayer = playerCube.clone();
            previousCamera = camera.clone();

        }
        playerCube.position.x = Math.round( (playerCube.position.x + 0.005)*1000 )/1000
        camera.position.x = Math.round( (camera.position.x + 0.005)*1000 )/1000
    }
    if (currentKeysPressed["d"]) {
        if(!justCheckCollisions()){
            previousPlayer = playerCube.clone();
            previousCamera = camera.clone();

        }
        playerCube.position.x = Math.round( (playerCube.position.x - 0.005)*1000 )/1000
        camera.position.x = Math.round( (camera.position.x - 0.005)*1000 )/1000
    }

    if (currentKeysPressed["q"]) {
        new entity(0, 0.0625, 0, 0xff0000);
    }
    if (currentKeysPressed["r"]) {
        playerAttributes.canShoot = false;
        setTimeout(function(){
            playerAttributes.ammo = 10;
            document.getElementById("ammo").style.width = (playerAttributes.ammo*10 + "px");
            playerAttributes.canShoot = true;
        },1500)
    }

    if (currentKeysPressed["t"]) {
        new tile(0, 0.125, 0, 0x00ff00);
    }
}

function resetCollisionCheck(){
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

            // just need to make the x,y,z resets independent! thats it! then im done!
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

function enemyManagement() {
    for (let i = 0; i < enemyList.length; i++) {
        let attack1 = false;
        let attack2 = false;

        // move towards

        if (playerCube.position.x > enemyList[i].position.x) {
            if (playerCube.position.x - (enemyList[i].position.x + 0.1) > 0) {
                enemyList[i].position.x += 0.003;
            } else {
                attack1 = true;
            }
        } else {
            if (enemyList[i].position.x - (playerCube.position.x + 0.1) > 0) {
                enemyList[i].position.x -= 0.003;
            } else {
                attack1 = true;
            }
        }
        if (playerCube.position.z > enemyList[i].position.z) {
            if (playerCube.position.z - (enemyList[i].position.z + 0.1) > 0) {
                enemyList[i].position.z += 0.003;
            } else {
                attack2 = true;
            }
        } else {
            if (enemyList[i].position.z - (playerCube.position.z + 0.1) > 0) {
                enemyList[i].position.z -= 0.003;
            } else {
                attack2 = true;
            }
        }
        if (attack1 && attack2) {
            if (playerAttributes.health > 0) {
                playerAttributes.health -= 0.1;
                playerAttributes.health = Math.floor(playerAttributes.health * 10) / 10
                document.getElementById("health").style.width = (playerAttributes.health * 2 + "px");
            }
        }
    }
    checkEnemyHit();
}




function checkEnemyHit() {

    for (let i = 0; i < enemyList.length; i++) {
        for (let j = 0; j < enemyList[i]?.geometry.attributes.position.array.length; j++) {
            let localVertex = new THREE.Vector3().fromBufferAttribute(enemyList[i].geometry.attributes.position, j).clone();
            let globalVertex = localVertex.applyMatrix4(enemyList[i].matrix);
            let directionVector = globalVertex.sub(enemyList[i].position);

            let ray = new THREE.Raycaster(enemyList[i].position, directionVector.clone().normalize());
            let collisionResults = ray.intersectObjects(projectileList);
            if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {
                scene.remove(enemyList[i])

                enemyList.splice(i, 1);
            }
        }
    }
}

function animate() {
    delta += clock.getDelta();
    if (delta > interval) {
        resetCollisionCheck()
        movement(currentKeysPressed)
        mouseStuff();
        enemyManagement();
        for (let i = 0; i < projectileList.length; i++) {
            projectileList[i].position.x += projectileList[i].deltaX;
            projectileList[i].position.z += projectileList[i].deltaZ;
        }
        delta %= interval;
        renderer.render(scene, camera);
    }
}

/* trash heap VVVVVVVV
           


                scene.remove(collisionResults[0]);
// playerCubeHealthIndicator.material.opacity = ((1 / playerAttributes.health)) * 10;
*/

init();