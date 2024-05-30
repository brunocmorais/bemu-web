import { Canvas } from "./GUI/Canvas";
import { SystemFactory, supportedExtensions } from "./Systems/SystemFactory";
import { File as FileUtil } from "./Core/Util/File";
import { ISystem } from "./Core/System/ISystem";

class App {

    private static readonly canvas = new Canvas();
    private static system : ISystem;
    private static interval : NodeJS.Timeout;
    private static fileList : File[];
    private static pressedKeys : string[] = [];

    public static start() {
        const filesElement = document.querySelector("#files") as HTMLSelectElement;
        const inputElement = document.querySelector("#input") as HTMLInputElement;

        inputElement.addEventListener('change', App.onFile);
        filesElement.addEventListener("change", App.onROMSelect);
        window.addEventListener("resize", App.onResize);

        document.onkeydown = App.onKeyDown;
        document.onkeyup = App.onKeyUp;
    }

    private static onResize() {
        App.canvas.resize(App.system.width, App.system.height);
    }

    private static onFile(event : Event) {
        const target = event?.target as HTMLInputElement;
        const array = Array.from(target?.files as FileList);

        App.fileList = array.filter((item) => {
            const fileName = item.name;
            const extension = FileUtil.getExtension(fileName);
            return (extension && supportedExtensions.indexOf(extension) >= 0)
        }).sort((a, b) => {
            if (a.name < b.name) return -1;
            else if (a.name > b.name) return 1;
            else return 0;
        });

        App.fillFileList();
    }

    private static async onROMSelect() {

        const filesElement = document.querySelector("#files") as HTMLSelectElement;
        const file = App.fileList[filesElement.selectedIndex];
        const buffer = await file.arrayBuffer();
        const extension = FileUtil.getExtension(file.name);
        
        App.system = SystemFactory.get(extension, new Uint8Array(buffer));
        App.canvas.resize(App.system.width, App.system.height);

        if (App.interval)
            clearInterval(App.interval);

        App.interval = setInterval(App.run, 16);
        filesElement.blur();
    }

    private static onKeyDown(event : KeyboardEvent) {
        if (App.pressedKeys.indexOf(event.key) === -1) {
            App.pressedKeys.push(event.key);
            console.log(App.pressedKeys);
        }
    }

    private static onKeyUp(event : KeyboardEvent) {
        const index = App.pressedKeys.indexOf(event.key);
        App.pressedKeys.splice(index, 1);
        console.log(App.pressedKeys);
    }

    private static fillFileList() {

        const filesElement = document.querySelector("#files") as HTMLSelectElement;
        filesElement.replaceChildren();

        let index = 0;

        for (const item of App.fileList) {

            const option = document.createElement("option");
            option.innerText = item.name;
            option.value = (index++).toString();
            
            filesElement.add(option);
        }
    }

    private static run() {
        App.system.update(App.pressedKeys);
        const frame = App.system.getCurrentFrame();

        if (frame)
            App.canvas.draw(frame);
    }
}

App.start();