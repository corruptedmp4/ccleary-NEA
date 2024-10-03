import * as THREE from 'three';


let camera, scene, renderer, playerCube;
let collidableMeshList = [];

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

// collision test cubes

    // red cube
    makeCollisionBox(0.125,0.125,0.125,-0.25,0.05125,0.1,0xff5500);


    // green cube
    makeCollisionBox(0.125,0.125,0.125,0.25,0.05125,-0.1,0x00ff00);

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
    scene.add(planeMesh);
    scene.add(playerCube);
    scene.add(ambient);
    scene.add(target);
    scene.add(spotLight);



};

// animation
function animate() {
    renderer.render(scene, camera);
    playerCube.position.x = (Math.floor(playerCube.position.x /0.0005)) * 0.0005
    playerCube.position.y = (Math.floor(playerCube.position.y /0.0005)) * 0.0005
    playerCube.position.z = (Math.floor(playerCube.position.z /0.0005)) * 0.0005


    if (currentKeysPressed["w"] && currentKeysPressed["a"]) {
        if(!collisionCheckX(0.0035)){
            playerCube.position.x += 0.0035;
        }
        if(!collisionCheckZ(0.0035)){
            playerCube.position.z += 0.0035;
        }

    } else if (currentKeysPressed["w"] && currentKeysPressed["d"]) {
        if(!collisionCheckX(-0.0035)){
            playerCube.position.x -= 0.0035;
        }
        if(!collisionCheckZ(0.0035)){
            playerCube.position.z += 0.0035;
        }

    } else if (currentKeysPressed["s"] && currentKeysPressed["a"]) {
        if(!collisionCheckX(0.0035) && !collisionCheckZ(-0.0035)){
            playerCube.position.x += 0.0035
        }
        if(!collisionCheckZ(-0.0035)){
            playerCube.position.z -= 0.0035
        }

    } else if (currentKeysPressed["s"] && currentKeysPressed["d"]) {
        if(!collisionCheckX(-0.0035)){
            playerCube.position.x -= 0.0035
        }
        if(!collisionCheckZ(-0.0035)){
            playerCube.position.z -= 0.0035
        }

    } else if (currentKeysPressed["w"]) {
        if(!collisionCheckZ(0.005)){
            playerCube.position.z += 0.005;
        }

    } else if (currentKeysPressed["a"]) {
        if(!collisionCheckX(0.005)){
            playerCube.position.x += 0.005;
        }
    } else if (currentKeysPressed["s"]) {
        if(!collisionCheckZ(-0.005)){
            playerCube.position.z -= 0.005;
        }

    } else if (currentKeysPressed["d"]) {
        if(!collisionCheckX(-0.005)){
            playerCube.position.x -= 0.005;
        }
    }

    if(currentKeysPressed["o"]) {
        console.log(playerCube.position)
    }

// if the distance from playerCube to collision object would get smaller, then dont move

}
// for write up
function collisionCheckX(deltaX) {
    // copy the vertex positions from the playercube, transform them by the future transformation?
    if(deltaX == null){
        deltaX = 0;
    }


    let tempCube = playerCube.clone()

    tempCube.position.x += deltaX;
    
    for (let vertexIndex = 0; vertexIndex < tempCube.geometry.attributes.position.array.length; vertexIndex++) {       
        let localVertex = new THREE.Vector3().fromBufferAttribute(tempCube.geometry.attributes.position, vertexIndex).clone();
        let globalVertex = localVertex.applyMatrix4(tempCube.matrix);
        let directionVector = globalVertex.sub( tempCube.position );
        
        let ray = new THREE.Raycaster( tempCube.position, directionVector.clone().normalize() );
        let collisionResults = ray.intersectObjects( collidableMeshList );

        

        if ( collisionResults.length > 0 && collisionResults[0].distance <= directionVector.length() ) {
            playerCube.position.x -= deltaX;
            console.log(directionVector.length())
            if(directionVector.length() != 0.15112081259707413) {
                console.log("broken!!")
                playerCube.position.x += 2*deltaX;
            }
            return true;

        } 
    }



}

function collisionCheckY(deltaY){
    if(deltaY == null){
        deltaY = 0;
    }
    let tempCube = playerCube.clone()

    tempCube.position.y += deltaY;

    for (let vertexIndex = 0; vertexIndex < tempCube.geometry.attributes.position.array.length; vertexIndex++) {       
        let localVertex = new THREE.Vector3().fromBufferAttribute(tempCube.geometry.attributes.position, vertexIndex).clone();
        let globalVertex = localVertex.applyMatrix4(tempCube.matrix);
        let directionVector = globalVertex.sub( tempCube.position );
        
        let ray = new THREE.Raycaster( tempCube.position, directionVector.clone().normalize() );
        let collisionResults = ray.intersectObjects( collidableMeshList );

       

        if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() ) {
            playerCube.position.y -= deltaY;
            if(directionVector.length() != 0.15112081259707413) {
                console.log("broken!!")
                playerCube.position.y += 2*deltaY;
            }
            return true;
        } 
    }

}

function collisionCheckZ(deltaZ){
    if(deltaZ == null){
        deltaZ = 0;
    }
    let tempCube = playerCube.clone()


    tempCube.position.z += deltaZ;

    for (let vertexIndex = 0; vertexIndex < tempCube.geometry.attributes.position.array.length; vertexIndex++) {       
        let localVertex = new THREE.Vector3().fromBufferAttribute(tempCube.geometry.attributes.position, vertexIndex).clone();
        let globalVertex = localVertex.applyMatrix4(tempCube.matrix);
        let directionVector = globalVertex.sub( tempCube.position );
        
        let ray = new THREE.Raycaster( tempCube.position, directionVector.clone().normalize() );
        let collisionResults = ray.intersectObjects( collidableMeshList );

        

        if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() ) {
            playerCube.position.z -= deltaZ
            console.log(directionVector.length())
            if(directionVector.length() != 0.15112081259707413) {
                console.log("broken!!")
                playerCube.position.z += 2*deltaZ;
            }
            return true;
        } 
    }

}


// needs to be written up
function makeCollisionBox(width, height, depth, x, y, z, colour, rotation){
    if (colour == null){
        console.log("colour not read!")
        colour = 0x0000ff;
    }
    if (rotation == null){
        rotation = 0;
    }
    let material = new THREE.MeshPhongMaterial({
        color: colour
    })
    let geometry = new THREE.BoxGeometry(width,height,depth);
    let cube = new THREE.Mesh(geometry,material);
    cube.castShadow = true;
    cube.position.set(x,y,z);
    cube.rotation.y = rotation;
    scene.add(cube);
    collidableMeshList.push(cube);
}



// https://stackoverflow.com/questions/11473755/how-to-detect-collision-in-three-js
init();
