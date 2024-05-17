import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DragControls } from 'three/addons/controls/DragControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xDCDCDC); 
addLighting();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const loader = new GLTFLoader();
let currentSelection = null;
let id = 0;
const renderer = new THREE.WebGLRenderer( { antialias : true } ); 
renderer.domElement.id = 'threeCanvas';
renderer.setSize( window.innerWidth, 
window.innerHeight
);

document.body.appendChild(renderer.domElement); 
document.getElementById("file_import").addEventListener("change", importFile, false);
document.getElementById("export-button").addEventListener("click", () => {
    const json = scene.toJSON();
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(json));
    var dlAnchorElem = document.getElementById('download-element');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "scene.json");
    dlAnchorElem.click();
});

document.getElementById("import-button").addEventListener("click", () => {
    document.getElementById("file_import").click();
});
const elements = [];

addPrimitive("Cube", new THREE.MeshPhongMaterial({color: 0x00ff00}), {x: -50, y: 50, z: 50});
addPrimitive("Cylinder", new THREE.MeshPhongMaterial({color: 0x0000ff}), {x: 10, y: 50, z: 0});

initMenu();

var gridHelper = new THREE.GridHelper( 90, 9 );
gridHelper.colorGrid = 0xE8E8E8;
scene.add( gridHelper );


var ah = new THREE.AxesHelper(50);
ah.position.y -= 0.1;  
scene.add( ah );

camera.position.set( 75, 75, 75 );
camera.lookAt(new THREE.Vector3(0, 0, 0));

const orbitControls = new OrbitControls( camera, renderer.domElement ); 
orbitControls.enableDamping = true;
orbitControls.dampingFactor = 1.0;
orbitControls.enableZoom = true;

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
    document.getElementById(event.object.userData.id).classList.add("highlight");
});

dControls.addEventListener("hoveroff", (event) => {
    event.object.material.wireframe = false;
    document.getElementById(event.object.userData.id).classList.remove("highlight");
});

dControls.addEventListener("drag", (event) => {
    clearCurrentInformation();
    displayObjectInformation(event.object);
    document.getElementById(event.object.userData.id).classList.add("highlight");
});

dControls.addEventListener("dragstart", (event) => {
    orbitControls.enabled = false;
    event.object.material.wireframe = false;
});

dControls.addEventListener("dragend", (event) => {
    orbitControls.enabled = true;
    document.getElementById(event.object.userData.id).classList.remove("highlight");
});

render();

function initMenu() {
    const menuContainer = document.querySelector(".menu-container");
    for(let i = 0; i < elements.length; i++){
        const menuItem = document.createElement("div");
        menuItem.classList.add("menu-item");
        menuItem.innerHTML = elements[i].name;
        menuItem.id = elements[i].userData.id;
        menuContainer.appendChild(menuItem);
    }
}

function addPrimitive(type, material, pos) {
    let object;
    if(type == "Cube"){
        object = new THREE.BoxGeometry(12, 12, 12);
    }
    else if(type == "Cylinder"){
        object = new THREE.CylinderGeometry(10, 10, 10);
    }
    let mesh = new THREE.Mesh(object, material);
    mesh.position.set(pos.x, pos.y, pos.z);
    mesh.name = type;
    mesh.userData.id = id;
    id++;
    elements.push(mesh);
    scene.add(mesh);
}

function importFile(event) {
    const file = event.target.files[0];
    let loader = null;
    if (!file) {
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
        let content = e.target.result;
        if(file.name.endsWith(".obj")){
            loader = new OBJLoader();
            const decoder = new TextDecoder();
            content = decoder.decode(content);
        }
        else if(file.name.endsWith(".glb")){
            loader = new GLTFLoader();
        }
        else if(file.name.endsWith(".fbx")){
            loader = new FBXLoader();
        }
        else {
            alert("File type not supported.");
            return;
        }
        const object = loader.parse(content).children[0];
        object.material = new THREE.MeshPhongMaterial({color: 0x00ff00});
        object.userData.id = id;
        id++;
        object.scale.set(15,15,15);
        object.position.set(0, 0, 0);
        elements.push(object);
        clearCurrentInformation();
        scene.add(object);
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
    });
    properties.forEach((prop) => {
        let menuItem = document.createElement("div");
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

function addLighting() {
    const hmLight = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.5);
    const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.5);
    directionalLight.position.set(0, 80, 0);
    scene.add(ambientLight, directionalLight, hmLight);
}
