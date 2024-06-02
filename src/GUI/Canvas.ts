import { Framebuffer } from "../Core/Video/Framebuffer";

export class Canvas {

    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;

    constructor() {
        this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
        this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
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
    }

    public draw(frame: Framebuffer) {        
        this.context.putImageData(
            new ImageData(
                new Uint8ClampedArray(frame.data), frame.width, frame.height
            ), 0, 0
        );
    }
}