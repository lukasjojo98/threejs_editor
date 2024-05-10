import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene(); 

const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000); 


const renderer = new THREE.WebGLRenderer( { antialias : true } ); 
renderer.domElement.id = 'threeCanvas';
renderer.setSize( window.innerWidth, 
window.innerHeight
);

const raycaster = new THREE.Raycaster();
document.body.appendChild(renderer.domElement); 

var geometry = new THREE.BoxGeometry(12,12,12); 

var material = new THREE.MeshPhongMaterial({color: 0x00ff00}); 

var cube = new THREE.Mesh(geometry, material); 
cube.position.set( 12, 12, 12 );

scene.add(cube); 

const pointLight = new THREE.AmbientLight(0xFFFFFF);

pointLight.position.x = 10;
pointLight.position.y = 50;
pointLight.position.z = 130;

scene.add( pointLight );

var gridHelper = new THREE.GridHelper( 90, 9 );
gridHelper.colorGrid = 0xE8E8E8;
scene.add( gridHelper );


var ah = new THREE.AxesHelper(50);
ah.position.y -= 0.1;  
scene.add( ah );

camera.position.set( 75, 75, 75 );
camera.lookAt( cube.position );

const orbitControls = new OrbitControls( camera, renderer.domElement ); 
orbitControls.addEventListener( 'change', 
function() { pointLight.position.copy(camera.position); } 
);
orbitControls.enableDamping = true;
orbitControls.dampingFactor = 1.0;
orbitControls.enableZoom = true;
orbitControls.target.copy( cube.position );  

const render = function () { 
    requestAnimationFrame(render); 
    renderer.render(scene, camera); 
}; 

render();


function onClick(event) {
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;

        if (intersectedObject === cube) {
            cube.position.set(1,1,1);
        }
    }
}

window.addEventListener('click', onClick);