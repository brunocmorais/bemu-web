import { Canvas } from "./GUI/Canvas";
import { SystemFactory } from "./Systems/SystemFactory";
import { File as FileUtil } from "./Core/Util/File";
import { ISystem } from "./Core/System/ISystem";
import { FilterType } from "./Core/Video/Filters/FilterType";
import { Factory as FilterFactory } from "./Core/Video/Filters/Factory";
import { Filter } from "./Core/Video/Filters/Filter";
import { FileList as FilesList } from "./GUI/FileList";
import { GamePad } from "./GUI/GamePad";
import { Elements } from "./GUI/Elements";
import { ImageType } from "./Core/Image/ImageType";
import { Factory as ImageFactory } from "./Core/Image/Factory";

class App {

    private static readonly canvas = new Canvas();
    private static readonly fileList = new FilesList();
    private static system : ISystem;
    private static updateInterval : NodeJS.Timeout;
    private static filter : Filter;

    public static start() {
        GamePad.start();
        
        Elements.defineEvents(
            App.selectFile, App.selectROM, App.pause, 
            App.reset, App.selectFilter, App.resize,
            () => App.onCapture(ImageType.BMP),
            () => App.onCapture(ImageType.QOI)
        );
    }

    private static resize() {
        if (App.system)
            App.canvas.resize(App.system.width, App.system.height);
    }

    private static selectFile(event : Event) {
        const target = event.target as HTMLInputElement;
        const files = Array.from(target.files as FileList);

        App.fileList.fill(files);

        if (App.fileList.length === 1)
            App.selectROM();

        Elements.removeFocus();
    }

    private static async selectROM() {

        const file = App.fileList.getAt(Elements.files.selectedIndex);        
        App.system = await SystemFactory.get(
            FileUtil.getExtension(file.name), 
            new Uint8Array(await file.arrayBuffer())
        );
        
        if (!App.updateInterval)
            App.updateInterval = setInterval(App.update, 16);

        const filter = FilterFactory.get(App.filter?.type ?? 0, App.system.framebuffer);
        App.filter = filter;

        App.canvas.resize(filter.width, filter.height);
        Elements.removeFocus();
    }

    private static selectFilter() {

        const filterType : FilterType = parseInt(Elements.filters.value);
        const filter = FilterFactory.get(filterType, App.system.framebuffer);
        App.filter = filter;
        
        App.canvas.resize(filter.width, filter.height);
        Elements.removeFocus();
    }

    private static update() {

        const debug =  (document.querySelector("#debug") as HTMLElement);

        let d1 = performance.now();
        App.system.update(GamePad.keys);
        let d2 = performance.now();
        
        debug.innerText = " Update: " + (d2 - d1).toFixed(2).toString();

        d1 = performance.now();

        if (App.system.draw)
            App.filter.update();

        d2 = performance.now();

        if (App.system.draw)
            App.canvas.draw(App.filter.scaled);
        
        debug.innerText += " Scaler: " + (d2 - d1).toFixed(2).toString();
    }

    private static pause() {
        App.system.pause();
        Elements.removeFocus();
    }

    private static reset() {
        App.system.reset();
        Elements.removeFocus();
    }

    private static onCapture(type: ImageType) {
        const image = ImageFactory.get(type, App.filter._scaled);
        const a = document.createElement("a");
        const fileName = `screenshot_${new Date().toISOString()}${image.extension}`;

        a.href = URL.createObjectURL(new Blob([(image.toBytes())]));
        a.setAttribute("download", fileName);
        a.click();
    }
}

App.start();