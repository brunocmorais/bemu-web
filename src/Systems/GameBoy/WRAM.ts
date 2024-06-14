import { MMU } from "./MMU";

export class WRAM {
    private mmu : MMU;
    private wramBanks : number[][];
    
    constructor(mmu : MMU) {
        this.wramBanks = new Array<number[]>(8);

        for (let i = 0; i < this.wramBanks.length; i++)
            this.wramBanks[i] = new Array<number>(4096);

        this.mmu = mmu;
    }

    public get(index: number) {
        const bank = (this.svbk === 0 ? 1 : this.svbk) & 0x7;

        if (index < 0x1000)
            return this.wramBanks[0][index]; 
        else
            return this.wramBanks[bank][index - 0x1000];
    }
    public set(index: number, value: number) {
        const bank = (this.svbk === 0 ? 1 : this.svbk) & 0x7;

        if (index < 0x1000)
            this.wramBanks[0][index] = value; 
        else
            this.wramBanks[bank][index - 0x1000] = value;
    }

    public get svbk() {
        return this.mmu.get(0xFF70);
    }
    public set svbk(value: number) { 
        this.mmu.set(0xFF70, value); 
    }
}