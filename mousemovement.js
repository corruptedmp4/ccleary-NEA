import * as THREE from 'three';
let camera, scene, renderer, playerCube;
let collidableMeshList = [];
let enemyList;
let entityList = [];
let mousePos = { x: undefined, y: undefined };


let clock = new THREE.Clock();
let delta = 0;
let interval = 1 / 60;

// keypress 
const currentKeysPressed = {};

function onKeyPress(event) {
    currentKeysPressed[event.key] = true;
}
function onKeyUp(event) {
    currentKeysPressed[event.key] = false;
}
function mouseClick(){
    createProjectile();
}

window.addEventListener("keydown",onKeyPress);
window.addEventListener("keyup",onKeyUp);
window.addEventListener("mousedown",mouseClick);
window.addEventListener('mousemove', (event) => {
    mousePos = { x: event.clientX, y: event.clientY };
});



const loader = new THREE.TextureLoader();
const tempMaterials = [
    new THREE.MeshPhongMaterial({map: loadColorTexture("New Piskel/left.png")}),
    new THREE.MeshPhongMaterial({map: loadColorTexture("New Piskel/right.png")}),
    new THREE.MeshPhongMaterial({map: loadColorTexture("New Piskel/top.png")}),
    new THREE.MeshPhongMaterial({map: loadColorTexture("New Piskel/bottom.png")}),
    new THREE.MeshPhongMaterial({map: loadColorTexture("New Piskel/front.png")}),
    new THREE.MeshPhongMaterial({map: loadColorTexture("New Piskel/back.png")}),
];

function loadColorTexture( path ){
    const texture = loader.load(path);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}


class tile{
    constructor(x,y,z,texture){
        let tile = new THREE.Mesh(
            new THREE.BoxGeometry(0.25,0.25,0.25),
            new THREE.MeshPhongMaterial({
                color: texture
            })
        )
        tile.rotation.y = Math.PI/4;
        tile.position.set(x,y,z)
        collidableMeshList.push(tile)
        scene.add(tile);
    }
}

class entity{
    constructor(name){
        this.name = name;
    }
    createThreeBox(baseName,width,height,depth,x,y,z,deltaX,deltaY,deltaZ,rotation,colour){
        baseName = new THREE.Mesh(
            new THREE.BoxGeometry(width,height,depth),
            new THREE.MeshPhongMaterial({
                color: colour
            })
        )
        baseName.deltaX = deltaX;
        baseName.deltaY = deltaY;
        baseName.deltaZ = deltaZ;
        baseName.position.x = x;
        baseName.position.y = y;
        baseName.position.z = z;
        baseName.rotation.y = rotation;
        baseName.name = +(entityList.length + 1);
        baseName.castShadow = true;

        entityList.push(baseName);
        scene.add(baseName);

        setTimeout(function(){
            scene.remove(scene.getObjectByName(baseName.name));

        },2000)
        
    }
}

 class EnemyBase extends entity{
    constructor(health,damage,speed,range){
        this.obj = new THREE.Mesh(
            new THREE.BoxGeometry(0.125,0.125,0.125),
            new THREE.MeshPhongMaterial({color: 0xff0022})
        )
        this.health = health;
        this.damage = damage;
        this.speed = speed;
        this.range = range;
        
    }
    
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
    renderer.setAnimationLoop(animate);
    document.body.appendChild(renderer.domElement);


// player cube
    playerCube = new THREE.Mesh(
        new THREE.BoxGeometry(0.125,0.25,0.125),
        // new THREE.MeshPhongMaterial({
        //     color: 0x07ffff})
        tempMaterials
    );
    playerCube.castShadow = true;
    playerCube.position.y += 0.125
    // createCollisionCylinder(0,0,0,0.07,0.25,"playerCollision")
    scene.add(playerCube);

// plane
    let planeMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(2,2),
        new THREE.MeshPhongMaterial({
            color: 0x00dd99
        })
    );
    planeMesh.receiveShadow = true;
    planeMesh.position.set(0,0,0);
    planeMesh.rotation.x = -Math.PI / 2;
    planeMesh.rotation.z = Math.PI/4

    scene.add(planeMesh);

// spotlight
    let spotLight = new THREE.SpotLight(0xffc100,10,10, Math.PI / 16, 0.02,2);
    spotLight.position.set(2,2,0);
    spotLight.castShadow = true;

    let target = spotLight.target;
    target.position.set(0,0,0);

    scene.add(spotLight)

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    animate()
};

// animation



// this all needs documenting
function mouseStuff(){
    let betterMouseY = (mousePos.y + 30 - (window.innerHeight / 2))*-1;
    let betterMouseX = (mousePos.x - (window.innerWidth / 2));

    if(betterMouseX > 0 && betterMouseY > 0 ){
        //console.log((Math.atan(betterMouseX/betterMouseY))*(180/Math.PI));
        playerCube.rotation.y = -(Math.atan(betterMouseX/betterMouseY));
    }
    if(betterMouseX > 0 && betterMouseY < 0 ){
        //console.log((Math.atan(betterMouseX/betterMouseY))*(180/Math.PI) + 180);
        playerCube.rotation.y = -(Math.atan(betterMouseX/betterMouseY)) + Math.PI;
    }
    if(betterMouseX < 0 && betterMouseY < 0 ){
        //console.log((Math.atan(betterMouseX/betterMouseY))*(180/Math.PI) + 180);
        playerCube.rotation.y = -(Math.atan(betterMouseX/betterMouseY)) + Math.PI;
    }
    if(betterMouseX < 0 && betterMouseY > 0 ){
        //console.log((Math.atan(betterMouseX/betterMouseY))*(180/Math.PI) + 360);
        playerCube.rotation.y = -(Math.atan(betterMouseX/betterMouseY)) + 2 * Math.PI;
    }
}

// movement
function movement(currentKeysPressed){
    if(currentKeysPressed["w"] && !collisionCheck(0,0,0.005)){
        playerCube.position.z += 0.005*Math.cos(Math.atan(betterMouseX/betterMouseY));
        camera.position.z += 0.005;
    }
    if(currentKeysPressed["s"] && !collisionCheck(0,0,-0.005)){
        playerCube.position.z -= 0.005;
        camera.position.z -= 0.005
    }
    if(currentKeysPressed["a"] && !collisionCheck(0.005,0,0)){
        playerCube.position.x += 0.005;
        camera.position.x += 0.005;
    }
    if(currentKeysPressed["d"] && !collisionCheck(-0.005,0,0)){
        playerCube.position.x -= 0.005;
        camera.position.x -= 0.005;
    }
    if(currentKeysPressed["e"]){
        createProjectile();
    }
    if(currentKeysPressed["q"]){
        console.log("live objects: " + scene.children.length)
    }
    if(currentKeysPressed["t"]){
        new tile(0,0.125,0,0x00ff00)
    }
}

function createProjectile(){

    let proj = null;
    proj = new entity("testObject");
  
    proj.x = (Math.sin(playerCube.rotation.y)*0.25) + playerCube.position.x;
    proj.z = (Math.cos(playerCube.rotation.y)*0.25) + playerCube.position.z;

    proj.deltaX = (proj.x - playerCube.position.x) / 50; // the 50 is a projectile speed dampener thing
    proj.deltaZ = (proj.z - playerCube.position.z) / 50;

    proj.createThreeBox(proj,
        0.1,0.1,0.1,
        proj.x,playerCube.position.y,proj.z,
        proj.deltaX,0,proj.deltaZ,playerCube.rotation.y,0x007777
    );
}

function collisionCheck(deltaX,deltaY,deltaZ){

    let tempCube = playerCube.clone()
    tempCube.position.x += deltaX;
    tempCube.position.y += deltaY;
    tempCube.position.z += deltaZ;

    for (let vertexIndex = 0; vertexIndex < tempCube.geometry.attributes.position.array.length; vertexIndex++) {   
            
        let localVertex = new THREE.Vector3().fromBufferAttribute(tempCube.geometry.attributes.position, vertexIndex).clone();
        let globalVertex = localVertex.applyMatrix4(tempCube.matrix);
        let directionVector = globalVertex.sub( tempCube.position );
        
        let ray = new THREE.Raycaster( tempCube.position, directionVector.clone().normalize() );
        let collisionResults = ray.intersectObjects( collidableMeshList );

        if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() ) {

            console.log("collision")
            playerCube.position.x -= deltaX/2;
            camera.position.x -= deltaX/2;
            playerCube.position.y -= deltaY/2;
            camera.position.y -= deltaY/2;
            playerCube.position.z -= deltaZ/2;
            camera.position.z -= deltaZ/2;
            
            return true;
        }
    }
}



function animate() {
    delta += clock.getDelta();
    if(delta > interval){
        console.log("frame");
        renderer.render(scene, camera);
        movement(currentKeysPressed)
        mouseStuff();
        //everything to do with entities needs documenting

        for(let i = 0;i < entityList.length;i++){
            entityList[i].position.x += entityList[i].deltaX;
            entityList[i].position.z += entityList[i].deltaZ;
        }
        delta %= interval;
    }
}


init();