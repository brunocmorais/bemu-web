import { Framebuffer } from "../Core/Video/Framebuffer";

export class Canvas {

    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private imageData : ImageData;

    constructor() {
        this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
        this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
        this.imageData = new ImageData(1, 1);
    }

    public resize(width : number, height : number) {
        
        this.canvas.width = width;
        this.canvas.height = height;

        const ratio = width / height;
        const wh = window.innerHeight;
        const panelLeft = (document.getElementById("panel-left") as HTMLDivElement)
            .getBoundingClientRect();

        const maxWidth = panelLeft.width - 60;
        const maxHeight = wh - 50;

        let desW = Math.min(maxHeight * ratio, maxWidth);
        let desH = Math.min(maxWidth / ratio, maxHeight);

        this.canvas.style.width = desW + "px";
        this.canvas.style.height = desH + "px";

        this.imageData = new ImageData(width, height);
    }

    public draw(frame: Framebuffer) {
        this.imageData.data.set(frame.data);
        this.context.putImageData(this.imageData, 0, 0);
    }
}