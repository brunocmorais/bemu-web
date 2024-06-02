export class Elements {

    public static defineEvents(
        onFile : (event: Event) => void,
        onROMSelect : () => void,
        onPause: () => void,
        onReset: () => void,
        onChangeFilter: () => void,
        onResize: () => void,
    ) {
        Elements.input.addEventListener("change", onFile);
        Elements.files.addEventListener("change", onROMSelect);
        Elements.pause.addEventListener("click", onPause);
        Elements.reset.addEventListener("click", onReset);
        Elements.filters.addEventListener("change", onChangeFilter);
        window.addEventListener("resize", onResize);
    }

    private static element<T>(selector : string) {
        return document.querySelector(selector) as T;
    }

    public static get canvas() {
        return this.element<HTMLCanvasElement>("#canvas");
    }

    public static get files() { 
        return this.element<HTMLSelectElement>("#files");
    }

    public static get input() { 
        return this.element<HTMLInputElement>("#input");
    }

    public static get pause() { 
        return this.element<HTMLButtonElement>("#pause");
    }

    public static get reset() { 
        return this.element<HTMLButtonElement>("#reset");
    }

    public static get filters() { 
        return this.element<HTMLSelectElement>("#filters");
    }

    public static removeFocus() {
        (document.activeElement as HTMLElement)?.blur();
    }
}