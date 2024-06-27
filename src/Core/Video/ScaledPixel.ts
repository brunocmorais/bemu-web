export class ScaledPixel {

    private readonly pixels: number[][];
    public readonly scale: number;

    constructor(scale: number, defaultValue?: number) {
        this.scale = scale;
        this.pixels = new Array<number[]>(scale);

        for (let i = 0; i < this.pixels.length; i++)
            this.pixels[i] = new Array<number>(scale);

        if (defaultValue)
            this.setAll(defaultValue);
    }

    public get = (x: number, y: number) => this.pixels[y][x];
    public set = (x: number, y: number, value: number) => this.pixels[y][x] = value;
    
    public setAll(value: number) {

        for (let i = 0; i < this.pixels.length; i++)
            for (let j = 0; j < this.pixels[i].length; j++)
                this.pixels[i][j] = value;
    }
}