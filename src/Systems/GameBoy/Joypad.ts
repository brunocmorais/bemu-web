export class Joypad {
    private activeColumn : number;
    public column1 : number;
    public column2 : number;

    constructor() {
        this.column1 = 0xF;
        this.column2 = 0xF;
        this.activeColumn = 0;
    }

    public setJoypadColumn(column : number) {
        this.activeColumn = (column & 0x30) & 0xFF;
    }

    public getJoypadInfo() {
        
        if (this.activeColumn === 0x10)
            return this.column1;
        if (this.activeColumn === 0x20)
            return this.column2;

        return 0;
    }

    public update(keys : string[]) {

        if (keys.indexOf("z") >= 0)
            this.column1 &= 0xE;
        if (keys.indexOf("x") >= 0)
            this.column1 &= 0xD;
        if (keys.indexOf("RightShift") >= 0)
            this.column1 &= 0xB;
        if (keys.indexOf("Return") >= 0)
            this.column1 &= 0x7;
        if (keys.indexOf("ArrowRight") >= 0)
            this.column2 &= 0xE;
        if (keys.indexOf("ArrowLeft") >= 0)
            this.column2 &= 0xD;
        if (keys.indexOf("ArrowUp") >= 0)
            this.column2 &= 0xB;
        if (keys.indexOf("ArrowDown") >= 0)
            this.column2 &= 0x7;

        if (keys.indexOf("z") >= 0)
            this.column1 |= 0x1;
        if (keys.indexOf("x") >= 0)
            this.column1 |= 0x2;
        if (keys.indexOf("RightShift") >= 0)
            this.column1 |= 0x4;
        if (keys.indexOf("Return") >= 0)
            this.column1 |= 0x8;
        if (keys.indexOf("ArrowRight") >= 0)
            this.column2 |= 0x1;
        if (keys.indexOf("ArrowLeft") >= 0)
            this.column2 |= 0x2;
        if (keys.indexOf("ArrowUp") >= 0)
            this.column2 |= 0x4;
        if (keys.indexOf("ArrowDown") >= 0)
            this.column2 |= 0x8;
    }
}