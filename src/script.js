import GUI from 'lil-gui'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

/**
 * Base
 */
// Debug
const gui = new GUI({
    width: 400
})

gui.close();
gui.hide();

if(window,location.hash === '#debug'){
    gui.show()
}

const debugObject = {};

const loadingBarBackground = document.querySelector('.loading-background')
const loadingBarElement = document.querySelector('.loading-bar')
const percentage = document.querySelector('.percentage')

let sceneReady = false
const loadingManager = new THREE.LoadingManager(
    // Loaded
    () =>
    {
        // ...
        window.setTimeout(() =>
        {
            loadingBarBackground.classList.add('ended')
            loadingBarBackground.style.transform = ''
            loadingBarElement.classList.add('ended')
            percentage.classList.add('ended')
            loadingBarElement.style.transform = ''
            percentage.style.transform = ''
            window.setTimeout(() =>
            {
                loadingBarBackground.remove();
                loadingBarElement.remove();
                percentage.remove();
            }, 5000);
        }, 500);
        window.setTimeout(() =>
        {
            sceneReady = true
        }, 3500)
    },
    (itemUrl, itemsLoaded, itemsTotal) =>
        {
            const progressRatio = itemsLoaded / itemsTotal
            loadingBarElement.style.transform = `scaleX(${progressRatio})`
            percentage.innerText = (progressRatio * 100).toFixed(0) + ' %'
        }

    // ...
)


// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader(loadingManager)

// Draco loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('draco/')

// GLTF loader
const gltfLoader = new GLTFLoader(loadingManager)
gltfLoader.setDRACOLoader(dracoLoader)


/**
 * Textures
 */
const bakedTexture1 = textureLoader.load('/textures/baked2.jpg');
bakedTexture1.flipY = false;
bakedTexture1.colorSpace = THREE.SRGBColorSpace;

/**
 * Materials
 */

//Baked Material

const material1 = new THREE.MeshBasicMaterial({
    map: bakedTexture1
})


let mixer;
let animationObject = {
    actions: {},

};


gltfLoader.load(
  "../models/Isometric_Room_VannieuwenhuyseLien.glb",
    (gltf) => {
       
        


    gltf.scene.traverse(child => {
      if (child.isMesh) {
        child.material = material1;
      }
    });

        mixer = new THREE.AnimationMixer(gltf.scene);
        animationObject.actions = gltf.animations.map((clip) => {
            mixer.clipAction(clip).play();
        });
        
      scene.add(gltf.scene);
      gltf.scene.scale.set(0.4, 0.4, 0.4);
  }
);



/**
 * POI
 */

const points = [
    {
        position: new THREE.Vector3(-1.3, 1.4, -1.3),
        element: document.querySelector('.point-0')
    },
    {
        position: new THREE.Vector3(-1.7, 1.1, -0.2),
        element: document.querySelector('.point-1')
    },
    {
        position: new THREE.Vector3(-0.3, 1.2, -0.9),
        element: document.querySelector('.point-2')
    }
]

debugObject.poi = true;
gui.add(debugObject, 'poi').onChange((val) => {
        for(const point of points) {
            if(!val){
                point.element.classList.remove('visible')
            }
            else{
                point.element.classList.add('visible')
            }
        }
}).name('Points of Interest')


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 4
camera.position.y = 5  
camera.position.z = 4
scene.add(camera)



// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


    
/**
 * Animate
 */
const raycaster = new THREE.Raycaster()

const clock = new THREE.Clock()
let previousTime = 0    

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
        const deltaTime = elapsedTime - previousTime
        previousTime = elapsedTime
   
            // Update mixer
            if (mixer) {
                mixer.update(deltaTime);
            }

    // Update controls
    controls.update()

    if (mixer) {
        mixer.update(deltaTime);
    }

    if (sceneReady) {
        
        for(const point of points)
            {
                const screenPosition = point.position.clone()
                screenPosition.project(camera)
    
                raycaster.setFromCamera(screenPosition, camera)
                const intersects = raycaster.intersectObjects(scene.children, true)
    
                if(intersects.length === 0 && debugObject.poi)
                    {
                        point.element.classList.add('visible')
                    }
                    else
                    {
                        const intersectionDistance = intersects[0].distance
                        const pointDistance = point.position.distanceTo(camera.position)
            
                        if(intersectionDistance < pointDistance)
                        {
                            point.element.classList.remove('visible')
                        }
                        else if(intersectionDistance > pointDistance && debugObject.poi)
                        {
                            point.element.classList.add('visible')
                        }
                    
                
                    }
        
                const translateX = screenPosition.x * sizes.width * 0.5
                const translateY = - screenPosition.y * sizes.height * 0.5
                point.element.style.transform = `translateX(${translateX}px) translateY(${translateY}px)`
        }
       
    }
    

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()