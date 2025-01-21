import * as THREE from 'three';
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js"

import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPixelatedPass } from "three/addons/postprocessing/RenderPixelatedPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

let camera, scene, renderer, playerCube, previousPlayer, previousCamera;

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
    canShoot: true,
    heldTile: false
}


let clock = new THREE.Clock();
let delta = 0;
let interval = 1 / 60;

let composer;

const gltfLoader = new GLTFLoader();

gltfLoader.load("assets/models/playermodel.glb",
    function(gltf){
        gltf.scene.scale.set(0.0365,0.0365,0.0365)
        let grah = gltf.scene
        
        playerCube.add(grah);
        grah.rotation.y = Math.PI/2
        grah.position.y -= 0.125;

    }
)

// keypress 
const currentKeysPressed = {};

// continuous

document.getElementById("cube-button").addEventListener("click", () => {
    console.log("cube")
    playerAttributes.canShoot = false;
    playerAttributes.heldTile = new tile(0,0.125,0);
    scene.add(playerAttributes.heldTile.mesh)
})

document.getElementById("stair-button").addEventListener("click", () => {
    console.log("stair")
    playerAttributes.canShoot = false;
    playerAttributes.heldTile = new slope(-0.0625,0,-0.0625);
    scene.add(playerAttributes.heldTile.mesh)
})

document.getElementById("cylinder-button").addEventListener("click", () => {
    console.log("cylinder")
    playerAttributes.canShoot = false;
    playerAttributes.heldTile = new cylinder(0,0.125,0);
    scene.add(playerAttributes.heldTile.mesh)
})






// playerAttributes.heldTile = new tile(playerCube.position.x,playerCube.position.y,playerCube.position.z, 0x550555)

window.addEventListener("mousedown", mouseClick);

function mouseClick() {
    if(playerAttributes.ammo != 0 && playerAttributes.canShoot){
        createProjectile(playerCube);
        playerAttributes.ammo -= 1;
        document.getElementById("ammo").style.width = (playerAttributes.ammo*10 + "px");

    } else if (playerAttributes.heldTile != false){
        playerAttributes.heldTile.mesh.material.opacity = 1;
        playerAttributes.heldTile.mesh.material.castShadow = true;
        collidableMeshList.push(playerAttributes.heldTile.mesh)
        playerAttributes.heldTile = false;

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

window.addEventListener('mousemove', (event) => {
    mousePos = { x: event.clientX, y: event.clientY };
});

class tile {
    constructor(x, y, z) {
        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(0.25, 0.25, 0.25),
            new THREE.MeshPhongMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.7
            })
        )
        this.mesh.rotation.y = Math.PI / 4;
        this.mesh.position.set(x, y, z)
    }
}

class slope {
    constructor(x,y,z){
        let shape = new THREE.Shape();
        shape.moveTo(0,0);
        shape.lineTo(0,0.25);
        shape.lineTo(0.25,0);
        shape.lineTo(0,0);
        shape.moveTo(0,0)
        let geometry = new THREE.ExtrudeGeometry(shape, 
            {depth: 0.25, bevelEnabled: false}
        );
        this.mesh = new THREE.Mesh(
            geometry,
            new THREE.MeshPhongMaterial({
                color:0xffffff,
                transparent: true,
                opacity: 0.7
            })
        );
        this.mesh.position.set(x,y,z);
        // this.mesh.scale.set(0.25,0.25,0.25)
        this.mesh.rotation.y = (Math.PI/4)
    }
}

class cylinder {
    constructor(x,y,z){
        this.mesh = new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.125, // radtop
                0.125, // radbot
                0.25, // height
                8      // rad segments
            ),
            new THREE.MeshPhongMaterial({
                color:0xffffff,
                transparent: true,
                opacity: 0.7
            })
        );
        this.mesh.position.set(x,y,z);
        this.mesh.rotation.y = (Math.PI/4)
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

    composer = new EffectComposer(renderer);
    let renderPixelatedPass = new RenderPixelatedPass(6,scene,camera);
    composer.addPass(renderPixelatedPass);
    let outputPass = new OutputPass();
    composer.addPass(outputPass);
    renderPixelatedPass.setPixelSize(2);


    // player cube
    playerCube = new THREE.Mesh(
        new THREE.BoxGeometry(0.125, 0.25, 0.125,2,2,2),
        new THREE.MeshPhongMaterial({
            color: 0x07ffff,
            transparent: true,
            opacity: 0})
    );
    playerCube.castShadow = false;
    playerCube.position.y += 0.125
    scene.add(playerCube);

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

    //

    if(playerAttributes.heldTile != false){
        let vector = new THREE.Vector3();
        vector.set(
            (mousePos.x / window.innerWidth) * 2 -1,
            -(mousePos.y / window.innerHeight) * 2 + 2,
            0
            // WHAT THE ACTUAL FUCK
        )

        vector.unproject(camera)

        playerAttributes.heldTile.mesh.position.x = (vector.x)
        playerAttributes.heldTile.mesh.position.z = ((vector.y*2)+0.75+playerCube.position.z)
        console.log("heldtile: ",playerAttributes.heldTile.mesh.position)
        
    }



    //
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
        let tempObject = new tile(0, 0.125, 0, 0x00ff00)
        collidableMeshList.push(tempObject.mesh)
        scene.add(tempObject.mesh)
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
        composer.render(scene, camera);
    }
}

/* trash heap VVVVVVVV




*/

init();