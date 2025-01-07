import * as THREE from 'three';
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js"

let camera, scene, renderer, playerCube, previousPlayer, previousCamera, playerCubeHealthIndicator;
let collidableMeshList = [];
let enemyList = [];
let entityList = [];
let projectileList = [];
let mousePos = { x: undefined, y: undefined };
let playerAttributes = {
    health: 100,
    stamina: 100,
    ammo: 10,
    speed: 1,
    attackDamage: 1,
    canShoot: true
}

let clock = new THREE.Clock();
let delta = 0;
let interval = 1 / 60;

// let models = {
//     player: {url: "assets/models/playermodel.glb"}
// }

// const loader = new THREE.TextureLoader();
// const tempMaterials = [
//     new THREE.MeshPhongMaterial({ map: loadColorTexture("assets/textures/left.png") }),
//     new THREE.MeshPhongMaterial({ map: loadColorTexture("assets/textures/right.png") }),
//     new THREE.MeshPhongMaterial({ map: loadColorTexture("assets/textures/top.png") }),
//     new THREE.MeshPhongMaterial({ map: loadColorTexture("assets/textures/bottom.png") }),
//     new THREE.MeshPhongMaterial({ map: loadColorTexture("assets/textures/front.png") }),
//     new THREE.MeshPhongMaterial({ map: loadColorTexture("assets/textures/back.png") }),
// ];

const gltfLoader = new GLTFLoader();
// for (const model of Object.values(models)){
//     gltfLoader.load(model.url, (gltf) => {
//         model.gltf = gltf
//     })
// }
gltfLoader.load("assets/models/playermodel.glb",
    function(gltf){
        gltf.scene.scale.set(0.0365,0.0365,0.0365)
        let grah = gltf.scene
        
        playerCube.add(grah);
        grah.rotation.y = Math.PI/2
        grah.position.y -= 0.125;
        
    }
)

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
window.addEventListener('mousemove', (event) => {
    mousePos = { x: event.clientX, y: event.clientY };
});

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
        new THREE.MeshPhongMaterial({
            color: 0x07ffff,
            transparent: true,
            opacity: 0})
        // tempMaterials
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