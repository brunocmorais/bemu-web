import { MMU } from "../MMU";
import { Tile } from "./Tile";

export class BackgroundMap {
    private readonly tiles : Tile[][];
    public mmu  : MMU;
    public backgroundMapSelect : number;
    public windowMapSelect : number;
    public tileStartAddress : number;
    public window : boolean;

    constructor(mmu : MMU) {
        this.mmu = mmu;

        this.tiles = new Array<Tile[]>(32);
        
        for (let i = 0; i < this.tiles.length; i++) {
            this.tiles[i] = new Array<Tile>(32);

            for (let j = 0; j < this.tiles[i].length; j++)
                this.tiles[i][j] = new Tile(this, i, j);
        }

        this.backgroundMapSelect = 0;
        this.windowMapSelect = 0;
        this.tileStartAddress = 0;
        this.window = false;
    }

    public getCoordinateFromPadding(padding: number) {
        return Math.floor(padding / 8);
    }

    public get(x: number, y: number) {
        return this.tiles[x][y];
    }
}