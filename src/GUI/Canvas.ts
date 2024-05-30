import { Framebuffer } from "../Core/Video/Framebuffer";

export class Canvas {

    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;

    constructor() {
        this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
        this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
        this.context.fillStyle = "black";
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    public resize(width : number, height : number) {

        const ratio = width / height;

        this.canvas.width = width;
        this.canvas.height = height;

        if (ratio > 1.0) {
            this.canvas.style.width = "100%";
            this.canvas.style.height = `${(this.canvas.getBoundingClientRect().width / ratio)}px`;
        } else {
            this.canvas.style.height = "100%";
            this.canvas.style.width = `${(this.canvas.getBoundingClientRect().height / ratio)}px`;
        }
    }

    public draw(frame: Framebuffer) {

        const imageData = new ImageData(new Uint8ClampedArray(frame.data), frame.width, frame.height);
        this.context.imageSmoothingEnabled = false;
        this.context.putImageData(imageData, 0, 0);
    }
}