const WIDTH = 2598 / 100, HEIGHT = 3626 / 100;

class Playground {
    public static CreateScene(engine: BABYLON.Engine, canvas: HTMLCanvasElement): BABYLON.Scene {

        // This creates a basic Babylon Scene object (non-mesh)
        const scene = new BABYLON.Scene(engine);

        // This creates and positions a free camera (non-mesh)
        //const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);
        const camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI / 2, Math.PI / 2, 3, BABYLON.Vector3.Zero(), scene);

        // This targets the camera to scene origin
        //camera.setTarget(BABYLON.Vector3.Zero());
        camera.setTarget(new BABYLON.Vector3(WIDTH / 2, 0, 0));

        // This attaches the camera to the canvas
        camera.attachControl(canvas, true);

        // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
        const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
        const light2 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, -1, 0), scene);

        this.createFold(
            "base", 
            "https://ghcdn.rawgit.org/agoldstein03/HUGS/main/layers/Page_10_materials_0003s_0000_Color-Fill-14.png", 
            0, 
            0, 
            scene);

        this.showAxis(5, scene);

        return scene;
    }

    private static createFold(label: string, url: string, offsetY: number, offsetZ: number, scene: BABYLON.Scene, width: number = WIDTH, height: number = HEIGHT) {
        const mat1 = new BABYLON.StandardMaterial(`${label} mat`, scene);
        mat1.diffuseTexture = new BABYLON.Texture(url, scene);
        
        const plane = BABYLON.MeshBuilder.CreatePlane(`${label} plane 0`, {
            frontUVs: new BABYLON.Vector4(0, 0.5, 1, 0), 
            backUVs: new BABYLON.Vector4(0, 0.5, 1, 0), 
            width: WIDTH, 
            height: HEIGHT / 2, 
            sideOrientation: BABYLON.Mesh.DOUBLESIDE
        }, scene);
        plane.material = mat1;
        plane.rotateAround(BABYLON.Vector3.Zero(), BABYLON.Vector3.Right(), Math.PI / 2);
        plane.position = new BABYLON.Vector3(WIDTH / 2, offsetY, (HEIGHT / 4) + offsetZ);

        const plane2 = BABYLON.MeshBuilder.CreatePlane(`${label} plane 1`, {
            frontUVs: new BABYLON.Vector4(0, 0.5, 1, 1), 
            backUVs: new BABYLON.Vector4(0, 0.5, 1, 1), 
            width: WIDTH, 
            height: HEIGHT / 2, 
            sideOrientation: BABYLON.Mesh.DOUBLESIDE
        }, scene);
        plane2.material = mat1;
        plane2.position = new BABYLON.Vector3(WIDTH / 2, (HEIGHT / 4) + offsetY, offsetZ);
    }

    private static showAxis(size: number, scene: BABYLON.Scene): void {
        function makeTextPlane(text: string, color: string, size: number): BABYLON.Mesh {
            const dynamicTexture = new BABYLON.DynamicTexture("DynamicTexture", 50, scene, true);
            dynamicTexture.hasAlpha = true;
            dynamicTexture.drawText(text, 5, 40, "bold 36px Arial", color , "transparent", true);
            const plane = BABYLON.MeshBuilder.CreatePlane("TextPlane", {size, updatable: true}, scene);
            const material = new BABYLON.StandardMaterial("TextPlaneMaterial", scene);
            material.backFaceCulling = false;
            material.specularColor = new BABYLON.Color3(0, 0, 0);
            material.diffuseTexture = dynamicTexture;
            plane.material = material;
            return plane;
        };
    
        const axisX = BABYLON.MeshBuilder.CreateLines("axisX", {points: [
            BABYLON.Vector3.Zero(), new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, 0.05 * size, 0), 
            new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, -0.05 * size, 0)
            ]}, scene);
        axisX.color = new BABYLON.Color3(1, 0, 0);
        const xChar = makeTextPlane("X", "red", size / 10);
        xChar.position = new BABYLON.Vector3(0.9 * size, -0.05 * size, 0);
        const axisY = BABYLON.MeshBuilder.CreateLines("axisY", {points: [
            BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3( -0.05 * size, size * 0.95, 0), 
            new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3( 0.05 * size, size * 0.95, 0)
            ]}, scene);
        axisY.color = new BABYLON.Color3(0, 1, 0);
        const yChar = makeTextPlane("Y", "green", size / 10);
        yChar.position = new BABYLON.Vector3(0, 0.9 * size, -0.05 * size);
        const axisZ = BABYLON.MeshBuilder.CreateLines("axisZ", {points: [
            BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3( 0 , -0.05 * size, size * 0.95),
            new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3( 0, 0.05 * size, size * 0.95)
            ]}, scene);
        axisZ.color = new BABYLON.Color3(0, 0, 1);
        const zChar = makeTextPlane("Z", "blue", size / 10);
        zChar.position = new BABYLON.Vector3(0, 0.05 * size, 0.9 * size);
    };



}



