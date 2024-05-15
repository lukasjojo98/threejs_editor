import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { DragControls } from 'three/addons/controls/DragControls.js';

const scene = new THREE.Scene(); 

const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000); 
let currentSelection = null;
const renderer = new THREE.WebGLRenderer( { antialias : true } ); 
renderer.domElement.id = 'threeCanvas';
renderer.setSize( window.innerWidth, 
window.innerHeight
);

const raycaster = new THREE.Raycaster();
const elements = [];
document.body.appendChild(renderer.domElement); 

var cubeGeometry = new THREE.BoxGeometry(12,12,12); 
var cylinderGeometry = new THREE.CylinderGeometry(10,10,10);
var cubeMaterial = new THREE.MeshPhongMaterial({color: 0x00ff00}); 
var cylinderMaterial = new THREE.MeshPhongMaterial({color: 0x0000ff}); 

var cube = new THREE.Mesh(cubeGeometry, cubeMaterial); 
cube.position.set( 12, 12, 12 );

var cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
cylinder.position.set(10,50,0);
cube.name = "Cube";
cylinder.name = "Cylinder";
elements.push(cube, cylinder);
scene.add(cube, cylinder); 

initMenu();
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
orbitControls.addEventListener('change', 
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

const dControls = new DragControls([cube, cylinder], camera, renderer.domElement);
dControls.addEventListener("hoveron", (event) => {
    currentSelection = event.object;
    event.object.material.wireframe = true;
    clearCurrentInformation();
    displayObjectInformation(event.object);
    highlightSelectedObject(event.object);
});

dControls.addEventListener("hoveroff", (event) => {
    event.object.material.wireframe = false;
    removeHighligh(event.object);
});

dControls.addEventListener("drag", (event) => {
    clearCurrentInformation();
    displayObjectInformation(event.object);
});

dControls.addEventListener("dragstart", (event) => {
    orbitControls.enabled = false;
    event.object.material.wireframe = false;
});

dControls.addEventListener("dragend", (event) => {
    orbitControls.enabled = true;
});

render();

function initMenu() {
    const menuContainer = document.querySelector(".menu-container");
    for(var i = 0; i < elements.length; i++){
        const menuItem = document.createElement("div");
        menuItem.classList.add("menu-item");
        menuItem.innerHTML = elements[i].name;
        menuContainer.appendChild(menuItem);
    }
}
function clearCurrentInformation() {
    const menuContainer = document.querySelector(".menu-container");
    menuContainer.innerHTML = "";
    initMenu();
}

function updateObjectFromInput(inputField) {
    const value = inputField.value;
    const name = inputField.name;
    if(name == "location-x"){
        currentSelection.position.x = value;
    }
    else if(name == "location-y"){
        currentSelection.position.y = value;
    }
    else if(name == "location-z"){
        currentSelection.position.z = value;
    }
    else if(name == "scale-x"){
        currentSelection.scale.x = value;
    }
    else if(name == "scale-y"){
        currentSelection.scale.y = value;
    }
    else if(name == "scale-z"){
        currentSelection.scale.z = value;
    }
}

function displayObjectInformation(object) {
    const menuContainer = document.querySelector(".menu-container");
    let menuItem = document.createElement("div");
    menuItem.classList.add("menu-item","property");
    menuItem.innerHTML = "<label>Location X:</label><input type='text' value='" + object.position.x + "' name='location-x'>";
    menuContainer.appendChild(menuItem);

    menuItem = document.createElement("div");
    menuItem.classList.add("menu-item","property");
    menuItem.innerHTML = "<label>Location Y:</label><input type='text' value='" + object.position.y + "' name='location-y'>";
    menuContainer.appendChild(menuItem);

    menuItem = document.createElement("div");
    menuItem.classList.add("menu-item","property");
    menuItem.innerHTML = "<label>Location Z:</label><input type='text' value='" + object.position.z + "' name='location-z'>";
    menuContainer.appendChild(menuItem);

    menuItem = document.createElement("div");
    menuItem.classList.add("menu-item","property");
    menuItem.innerHTML = "<label>Scale X:</label><input type='text' value='" + object.scale.x + "' name='scale-x'>";
    menuContainer.appendChild(menuItem);

    menuItem = document.createElement("div");
    menuItem.classList.add("menu-item","property");
    menuItem.innerHTML = "<label>Scale Y:</label><input type='text' value='" + object.scale.y + "' name='scale-y'>";
    menuContainer.appendChild(menuItem);

    menuItem = document.createElement("div");
    menuItem.classList.add("menu-item","property");
    menuItem.innerHTML = "<label>Scale Z:</label><input type='text' value='" + object.scale.z + "' name='scale-z'>";
    menuContainer.appendChild(menuItem);

    const input = document.querySelectorAll("input");
    for(var i = 0; i < input.length; i++){
        input[i].addEventListener("keyup", (event) => {
            updateObjectFromInput(event.target);
        });
    }
}
// window.addEventListener('click', onClick);