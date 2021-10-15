//import * as dat from 'dat.gui';

// Type definitions for dat.GUI 0.7
// Project: https://github.com/dataarts/dat.gui
// Definitions by: Satoru Kimura <https://github.com/gyohk>, ZongJing Lu <https://github.com/sonic3d>, Richard Roylance <https://github.com/rroylance>, Nahuel Scotti <https://github.com/singuerinc>, Teoxoy <https://github.com/teoxoy>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare namespace dat {

    export interface GUIParams {
        /**
         * Handles GUI's element placement for you.
         * @default true
         */
        autoPlace?: boolean | undefined;
        /**
         * If true, starts closed.
         * @default false
         */
        closed?: boolean | undefined;
        /**
         * If true, close/open button shows on top of the GUI.
         * @default false
         */
        closeOnTop?: boolean | undefined;
        /**
         * If true, GUI is closed by the "h" keypress.
         * @default false
         */
        hideable?: boolean | undefined;
        /**
         * JSON object representing the saved state of this GUI.
         */
        load?: any;
        /**
         * The name of this GUI.
         */
        name?: string | undefined;
        /**
         * The identifier for a set of saved values.
         */
        preset?: string | undefined;
        /**
         * The width of GUI element.
         */
        width?: number | undefined;
    }

    export class GUI {
        static CLASS_AUTO_PLACE: string
        static CLASS_AUTO_PLACE_CONTAINER: string
        static CLASS_MAIN: string
        static CLASS_CONTROLLER_ROW: string
        static CLASS_TOO_TALL: string
        static CLASS_CLOSED: string
        static CLASS_CLOSE_BUTTON: string
        static CLASS_CLOSE_TOP: string
        static CLASS_CLOSE_BOTTOM: string
        static CLASS_DRAG: string
        static DEFAULT_WIDTH: number
        static TEXT_CLOSED: string
        static TEXT_OPEN: string

        constructor(option?: GUIParams);

        __controllers: GUIController[];
        __folders: {[folderName: string]: GUI};
        domElement: HTMLElement;

        add(target: Object, propName:string, min?: number, max?: number, step?: number): GUIController;
        add(target: Object, propName:string, status: boolean): GUIController;
        add(target: Object, propName:string, items:string[]): GUIController;
        add(target: Object, propName:string, items:number[]): GUIController;
        add(target: Object, propName:string, items:Object): GUIController;

        addColor(target: Object, propName:string): GUIController;

        remove(controller: GUIController): void;
        destroy(): void;

        addFolder(propName:string): GUI;
        removeFolder(subFolder:GUI):void;

        open(): void;
        close(): void;
        hide(): void;
        show(): void;

        remember(target: Object, ...additionalTargets: Object[]): void;
        getRoot(): GUI;

        getSaveObject(): Object;
        save(): void;
        saveAs(presetName:string): void;
        revert(gui:GUI): void;

        listen(controller: GUIController): void;
        updateDisplay(): void;

        // gui properties in dat/gui/GUI.js
        readonly parent: GUI;
        readonly scrollable: boolean;
        readonly autoPlace: boolean;
        preset: string;
        width: number;
        name: string;
        closed: boolean;
        readonly load: Object;
        useLocalStorage: boolean;
    }

    export class GUIController {
        domElement: HTMLElement;
        object: Object;
        property: string;

        constructor(object: Object, property: string);

        options(option: any): GUIController;
        name(name: string): GUIController;

        listen(): GUIController;
        remove(): GUIController;

        onChange(fnc: (value?: any) => void): GUIController;
        onFinishChange(fnc: (value?: any) => void): GUIController;

        setValue(value: any): GUIController;
        getValue(): any;

        updateDisplay(): GUIController;
        isModified(): boolean;

        // NumberController
        min(n: number): GUIController;
        max(n: number): GUIController;
        step(n: number): GUIController;

        // FunctionController
        fire(): GUIController;
    }

}

type Fold = {
    data: {
        offset: number;
        top: boolean;
    };
    remove(): void;
}

const SCALE = 100, WIDTH = 2598 / SCALE, HEIGHT = 3626 / SCALE;

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

        const axes = this.createAxes(5, scene);
        this.setVisibility(axes, false);

        const oldgui = document.getElementById("datGUI");
        if (oldgui != null){
            oldgui.remove();
        }

        const gui = new dat.GUI();	
        gui.domElement.style.marginTop = "100px";
        gui.domElement.id = "datGUI";

        const folds: Fold[] = [];

        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.multiple = true;
        fileInput.addEventListener('change', () => {
            for (const fold of folds) {
                fold.remove();
            }
            folds.length = 0;
            for (let i = fileInput.files.length - 1; i >= 0; i--) {
                const file = fileInput.files[i];
                folds.push(this.createFold(
                    scene, 
                    gui, 
                    URL.createObjectURL(file), 
                    true, 
                    file.name, 
                ));
            }
        })
        gui.add({ load: () => {fileInput.click();} }, 'load').name('Upload');

        gui.add({ show: false }, 'show').name('Show axes?').onChange((show: boolean) => {
            this.setVisibility(axes, show);
        });

        /*folds.push(this.createFold(
            scene,
            gui,
            "https://ghcdn.rawgit.org/agoldstein03/HUGS/main/layers/Page_10_materials_0003s_0000_Color-Fill-14.png", 
        ));*/

        return scene;
    }

    private static createFold(
        scene: BABYLON.Scene, 
        gui: dat.GUI,
        path: string, 
        top: boolean = true,
        label: string = path.match(/[A-Za-z0-9_\-\.]+\.[A-Za-z0-9]+$/)?.[0], 
        offset: number = 0, 
        width: number = WIDTH, 
        halfHeight: number = HEIGHT / 2, 
    ): Fold {
        const mat1 = new BABYLON.StandardMaterial(`${label} mat`, scene);
        mat1.diffuseTexture = new BABYLON.Texture(path, scene);
        mat1.diffuseTexture.hasAlpha = true;
        
        const plane = BABYLON.MeshBuilder.CreatePlane(`${label} plane 0`, {
            frontUVs: new BABYLON.Vector4(1, 0.5, 0, 0), 
            backUVs: new BABYLON.Vector4(1, 0.5, 0, 0), 
            width, 
            height: halfHeight, 
            sideOrientation: BABYLON.Mesh.DOUBLESIDE
        }, scene);
        plane.material = mat1;
        plane.rotateAround(BABYLON.Vector3.Zero(), BABYLON.Vector3.Right(), Math.PI / 2);

        const plane2 = BABYLON.MeshBuilder.CreatePlane(`${label} plane 1`, {
            frontUVs: new BABYLON.Vector4(1, 0.5, 0, 1), 
            backUVs: new BABYLON.Vector4(1, 0.5, 0, 1), 
            width: WIDTH, 
            height: HEIGHT / 2, 
            sideOrientation: BABYLON.Mesh.DOUBLESIDE
        }, scene);
        plane2.material = mat1;

        const folder = gui.addFolder(label),
            data = { offset, top, visible: true };

        const hiddenGui = folder.add(data, 'visible').name('Visible?').onChange((visible: boolean) => {
            const code = visible ? 1 : 0
            plane.visibility = code;
            plane2.visibility = code;
        });
        const topGui = folder.add(data, "top", 0, HEIGHT / 4).name('Top?').onChange(onChange);
        const offsetGui = folder.add(data, "offset", 0, HEIGHT / 4).name('Offset').onChange(onChange);

        function onChange(): void {
            let offsetY = data.top ? 0 : data.offset,
                offsetZ = data.top ? data.offset : 0;
            plane.position = new BABYLON.Vector3(WIDTH / 2, offsetY, (halfHeight / 2) + offsetZ);
            plane2.position = new BABYLON.Vector3(width / 2, (halfHeight / 2) + offsetY, offsetZ);
        }

        onChange();

        return {
            data,
            remove() {
                for (const obj of [mat1, plane, plane2]) {
                    obj.dispose(false, true);
                }
                folder.remove(topGui);
                folder.remove(offsetGui);
                //gui.removeFolder(folder);
            },
        }

    }

    private static createAxes(size: number, scene: BABYLON.Scene): BABYLON.Mesh[] {
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
        return [axisX, xChar, axisY, yChar, axisZ, zChar];
    };

    private static setVisibility(meshes: BABYLON.Mesh[], show: boolean): void {
        for (const mesh of meshes) {
            mesh.visibility = show ? 1 : 0;
        }
    }

}



