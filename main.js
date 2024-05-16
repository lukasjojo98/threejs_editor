import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DragControls } from 'three/addons/controls/DragControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


const scene = new THREE.Scene(); 
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const loader = new GLTFLoader();
let currentSelection = null;
const renderer = new THREE.WebGLRenderer( { antialias : true } ); 
renderer.domElement.id = 'threeCanvas';
renderer.setSize( window.innerWidth, 
window.innerHeight
);

document.body.appendChild(renderer.domElement); 
document.getElementById("file_import").addEventListener("change", importFile, false);
const elements = [];
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

const dControls = new DragControls(elements, camera, renderer.domElement);
dControls.addEventListener("hoveron", (event) => {
    currentSelection = event.object;
    event.object.material.wireframe = true;
    clearCurrentInformation();
    displayObjectInformation(event.object);
    document.getElementById(event.object.uuid).classList.add("highlight");
});

dControls.addEventListener("hoveroff", (event) => {
    event.object.material.wireframe = false;
    document.getElementById(event.object.uuid).classList.remove("highlight");
});

dControls.addEventListener("drag", (event) => {
    clearCurrentInformation();
    displayObjectInformation(event.object);
    document.getElementById(event.object.uuid).classList.add("highlight");
});

dControls.addEventListener("dragstart", (event) => {
    orbitControls.enabled = false;
    event.object.material.wireframe = false;
});

dControls.addEventListener("dragend", (event) => {
    orbitControls.enabled = true;
    document.getElementById(event.object.uuid).classList.remove("highlight");
});

render();

function initMenu() {
    const menuContainer = document.querySelector(".menu-container");
    for(let i = 0; i < elements.length; i++){
        const menuItem = document.createElement("div");
        menuItem.classList.add("menu-item");
        menuItem.innerHTML = elements[i].name;
        menuItem.id = elements[i].uuid;
        menuContainer.appendChild(menuItem);
    }
}

function importFile(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const contents = e.target.result;
        const loader = new GLTFLoader();
        loader.parse(contents, '', function(gltf) {
            const model = gltf.scene;
            model.traverse((child) => {
                if (child.isMesh) {
                    var material = new THREE.MeshPhongMaterial({color: 0x00ff00});
                    child.material = material;
                }
            });
            model.scale.set(15,15,15);
            model.position.set(10,20,30);
            elements.push(model);
            clearCurrentInformation();
            scene.add(model);
        }, function(error) {
            console.error('Error loading model:', error);
        });
    };
    reader.readAsArrayBuffer(file);
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
    const properties = ["x", "y", "z"];
    properties.forEach((prop) => {
        let menuItem = document.createElement("div");
        menuItem.classList.add("menu-item", "property");
        menuItem.innerHTML = `<label>Location ${prop.toUpperCase()}:</label><input type='text' value='${object.position[prop]}' name='location-${prop}'>`;
        menuContainer.appendChild(menuItem);

        menuItem = document.createElement("div");
        menuItem.classList.add("menu-item", "property");
        menuItem.innerHTML = `<label>Scale ${prop.toUpperCase()}:</label><input type='text' value='${object.scale[prop]}' name='scale-${prop}'>`;
        menuContainer.appendChild(menuItem);
    });

    const inputs = document.querySelectorAll("input");
    inputs.forEach((input) => {
        input.addEventListener("keyup", (event) => {
            updateObjectFromInput(event.target);
        });
    });
}