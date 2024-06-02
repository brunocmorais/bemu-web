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

class App {

    private static readonly canvas = new Canvas();
    private static readonly fileList = new FilesList();
    private static system : ISystem;
    private static updateInterval : NodeJS.Timeout;
    private static drawInterval : NodeJS.Timeout;
    private static filter : Filter;

    public static start() {
        GamePad.start();
        
        Elements.defineEvents(
            App.selectFile, App.selectROM, App.pause, 
            App.reset, App.selectFilter, App.resize
        );
    }

    private static resize() {
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

        if (!App.drawInterval)
            App.drawInterval = setInterval(App.draw, 16);

        const filter = FilterFactory.get(App.filter?.type ?? 0, App.system.width, App.system.height);
        App.filter = filter;

        App.canvas.resize(filter.width, filter.height);
        Elements.removeFocus();
    }

    private static selectFilter() {

        const filterType : FilterType = parseInt(Elements.filters.value);
        const filter = FilterFactory.get(filterType, App.system.width, App.system.height);
        App.filter = filter;
        
        App.canvas.resize(filter.width, filter.height);
        Elements.removeFocus();
    }

    private static update() {
        App.system.update(GamePad.keys);
    }

    private static draw() {
        App.filter.frame = App.system.getCurrentFrame();
        App.canvas.draw(App.filter.update());
    }

    private static pause() {
        App.system.pause();
        Elements.removeFocus();
    }

    private static reset() {
        App.system.reset();
        Elements.removeFocus();
    }
}

App.start();