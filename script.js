import * as THREE from 'three';

let camera, scene, renderer;

// initialise function
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
    document.body.appendChild(renderer.domElement);


// test cube
    let testCube = new THREE.Mesh(
        new THREE.BoxGeometry(0.125,0.125,0.125),
        new THREE.MeshPhongMaterial({
            color: 0x07ffff
        })
    );

    scene.add(testCube)
    scene.add(new THREE.AmbientLight(0xffffff, 0.5))

    // RENDER
    renderer.render(scene, camera);
};

init();
