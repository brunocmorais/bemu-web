
export class ColorPalette { 
    public readonly backgroundPalettes : number[];
    public readonly spritePalettes : number[];
    private backgroundPaletteIndex : number;
    private spritePaletteIndex : number;

    constructor() {
        this.backgroundPalettes = new Array<number>(64);

        for (let i = 0; i < this.backgroundPalettes.length; i++)
            this.backgroundPalettes[i] = 0xFF;
        
        this.spritePalettes = new Array<number>(64);
        this.backgroundPaletteIndex = 0;
        this.spritePaletteIndex = 0;
    }

    private get bcps() {
         return this.backgroundPaletteIndex; 
    }

    private set bcps(value: number) {
        this.backgroundPaletteIndex = value;
    }

    private get bcpd() {
        return this.backgroundPalettes[this.bcps & 0x3F]; 
    }

    private set bcpd(value: number) {
        this.backgroundPalettes[this.bcps & 0x3F] = value;

        if ((this.bcps & 0x80) == 0x80)
            this.bcps = (0x80 | ((this.bcps & 0x3F) + 1)) & 0xFF;
    }

    private get ocps() {
        return this.spritePaletteIndex; 
    }

    private set ocps(value: number) { 
        this.spritePaletteIndex = value;
    }

    private get ocpd() {
        return this.spritePalettes[this.ocps & 0x3F]; 
    }

    private set ocpd(value: number) {
        this.spritePalettes[this.ocps & 0x3F] = value;

        if ((this.ocps & 0x80) == 0x80)
            this.ocps = (0x80 | ((this.ocps + 1) & 0x3F)) & 0xFF;
    }

    public get(index: number) {
        switch (index) {
            case 0xFF68: return this.bcps;
            case 0xFF69: return this.bcpd;
            case 0xFF6A: return this.ocps;
            case 0xFF6B: return this.ocpd;
            default: return 0;
        }
    }

    public set(index: number, value: number) {
        switch (index) {
            case 0xFF68: this.bcps = value; break;
            case 0xFF69: this.bcpd = value; break;
            case 0xFF6A: this.ocps = value; break;
            case 0xFF6B: this.ocpd = value; break;
        }
    }
}
