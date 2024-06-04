# Isometric Room

Hosting: [isometric-room-vannieuwenhuyse-lien.vercel.app](https://isometric-room-vannieuwenhuyse-lien.vercel.app/)

Add these things extra to the code: 

1. **Within**

**
    gltfLoader.load(**

    "../models/Isometric_Room_VannieuwenhuyseLien.glb",

    gltf=>{

    gltf.scene.traverse(child=> {

    if (child.isMesh) {

    child.material =material1;

    }

    });

    scene.add(gltf.scene);

#  **gltf.scene.scale.set(0.2,0.2,0.2);**

    }

    );
