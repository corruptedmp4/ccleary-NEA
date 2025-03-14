import * as THREE from 'three';

let enemyList = [];
let turretList = [];

let camera, scene, renderer;
let clock = new THREE.Clock();
let delta = 0;
let interval = 1 / 60;


// initialise function
function init() {
    worldSetup();

    let sillyTurret = new THREE.Mesh(
        new THREE.CylinderGeometry(
        0.125, // radtop
        0.125, // radbot
        0.25, // height
        8 // rad segments
        ),
        new THREE.MeshPhongMaterial({
        color: 0x44ff11,
        transparent: true,
        opacity: 1,
        })
    )
    sillyTurret.position.set(0, 0.125, 0);
    sillyTurret.rotation.y = Math.PI / 4;
    scene.add(sillyTurret)

    let boundingBox = new THREE.Mesh(
        new THREE.CylinderGeometry(
            1,
            1,
            0.25,
            8
        ),
        new THREE.MeshPhongMaterial({
            color: 0xff00ff,
            transparent: true,
            opacity: 0.1
        })
    )
    sillyTurret.add(boundingBox)
    sillyTurret.ready = true;
    turretList.push(sillyTurret)

    new enemy(2,0.03125,2)
    new enemy(2,0.03125,2)
    new enemy(2,0.03125,2)

    new enemy(2,0.03125,0)
    new enemy(0,0.03125,2)
    new enemy(2,0.03125,0)

    new enemy(-2,0.03125,-2)
    new enemy(-2,0.03125,-2)
    new enemy(-2,0.03125,2)


    

    






    

    
    animate()
};

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


function animate() {
    delta += clock.getDelta();
    if (delta > interval) {
        delta %= interval;
        renderer.render(scene, camera);
    }

    enemyMovement()
}

function enemyMovement(){
    for(let i = 0; i < enemyList.length; i++){
        if(enemyList[i].position.x < 0){
            enemyList[i].position.x += 0.0015 + Math.floor((Math.random()-0.5)*180)/10000;
        } else {
            enemyList[i].position.x -= 0.0015 + Math.floor((Math.random()-0.5)*180)/10000;
        }

        if(enemyList[i].position.z < 0){
            enemyList[i].position.z += 0.0015 + Math.floor((Math.random()-0.5)*180)/10000;
        } else {
            enemyList[i].position.z -= 0.0015 + Math.floor((Math.random()-0.5)*180)/10000;
        }



    }
}



function worldSetup(){
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
    
        let plane = new THREE.Mesh(new THREE.PlaneGeometry(3,3), new THREE.MeshPhongMaterial({
            color:0x666666
        }))
        plane.rotation.x = -Math.PI/2
        plane.rotation.z = Math.PI/4
        scene.add(plane)

}



init()

// EXPORT 
/*
    
*/