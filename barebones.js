import * as THREE from 'three';
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js"

let manager = new THREE.LoadingManager();
manager.onLoad = init;

let gltfLoader = new GLTFLoader(manager);

let models = {
    baseTile: {url:"/assets/models/baseTile.glb"},
    tree: {url:"/assets/models/tree.glb"},
    twoTree: {url:"/assets/models/twoTree.glb"},
    rocks: {url:"/assets/models/rocks.glb"},
    turret: {url:"/assets/models/turret.glb"},
    playerModel: {url:"/assets/models/playermodel.glb"},
}

let worldObjects = [];
let worldObjectCounter = 0;

for (let model of Object.values(models)) {
    gltfLoader.load(model.url, (gltf) => {
        model.gltf = gltf;
        console.log(model.gltf)
    })
}






let playerCube;
let camera, scene, renderer;
let clock = new THREE.Clock();
let delta = 0;
let interval = 1 / 60;


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
    // spotlight
    let spotLight = new THREE.SpotLight(0xffc100, 10, 10, Math.PI / 2, 0.02, 2);
    spotLight.position.set(0, 2, 0);
    spotLight.castShadow = true;
    let target = spotLight.target;
    target.position.set(0, 0, 0);
    scene.add(spotLight)
    scene.add(new THREE.AmbientLight(0xffffff, 1));



    for(let xPos = -5; xPos < 5; xPos++){
        for(let zPos = -5; zPos < 5; zPos++){
            worldObjects[worldObjectCounter] = new gltfObject(randomObject(),(0.35*xPos),0,0.35*zPos)
            scene.add(worldObjects[worldObjectCounter].mesh)
            worldObjectCounter++
        }
    }
    for(let xPos = -5; xPos < 5; xPos++){
        for(let zPos = -5; zPos < 5; zPos++){
            worldObjects[worldObjectCounter] = new gltfObject(randomObject(),(0.35*xPos)+0.175,0,(0.35*zPos)+0.175)
            scene.add(worldObjects[worldObjectCounter].mesh)
            worldObjectCounter++
        }
    }

    
    
    animate()
};



function animate() {
    delta += clock.getDelta();
    if (delta > interval) {
        delta %= interval;
        renderer.render(scene, camera);
    }
}

function randomObject(){
    let randNum = Math.floor(Math.random()*15);
    console.log(randNum)
    let tile;

    if(randNum == 0){
        tile = "tree"
    } else if (randNum == 1){
        tile = "twoTree"
    } else if (randNum == 2){
        tile = "rocks"
    } else {
        tile = "baseTile"
    }
    return tile;
}

class gltfObject{
    constructor(tile,x,y,z){

        this.mesh = models[tile].gltf.scene.clone();
        if(tile == "rocks"){
            let bTile = models.baseTile.gltf.scene.clone()
            bTile.position.y -= 0.25
            y += 0.0625
            
            this.mesh.add(bTile)


        } else if(tile == "tree"){
            let bTile = models.baseTile.gltf.scene.clone()
            bTile.position.y -= 0.25
            y += 0.0625
            
            this.mesh.add(bTile)
            
        }

        this.mesh.rotation.y = Math.PI/4;
        this.mesh.position.set(x,y,z);
        this.mesh.scale.set(0.25,0.25,0.25);
    }
}

// EXPORT 
/*
    
*/