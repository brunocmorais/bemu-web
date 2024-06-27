import { MMU } from "../MMU";

export class VRAM {
    
    public readonly bank0 : number[];
    public readonly bank1 : number[];
    private mmu : MMU;
    private startAddress = 0;
    private active = false;

    constructor(mmu : MMU) {
        this.mmu = mmu;
        this.bank0 = new Array<number>(8192);
        this.bank1 = new Array<number>(8192);
    }

    private get dmaSourceAddr() {
        return ((this.mmu.io[0x51] << 8) | (this.mmu.io[0x52] & 0xF0)) & 0xFFFF;
    }
    private get dmaDestinationAddr() {
        return (((this.mmu.io[0x53] & 0xF) << 8) | (this.mmu.io[0x54] & 0xF0)) & 0xFFFF;
    }

    public get hdma5()  {
        if (this.active) 
            return (this.mmu.io[0x55] & 0x7F) & 0xFF; 
        else
            return (this.mmu.io[0x55] | 0x80) & 0xFF;
    }
        
    public set hdma5(value: number) {
        this.mmu.io[0x55] = value; 
    }

    private resetDMAFlags() {
        this.mmu.io[0x51] = 0xFF;
        this.mmu.io[0x52] = 0xFF;
        this.mmu.io[0x53] = 0xFF;
        this.mmu.io[0x54] = 0xFF;
        this.mmu.io[0x55] = 0xFF;
    }

    private get isHBlankDMAActive() {
        return this.active && (this.hdma5 & 0x80) !== 0x80 && 
        this.mmu.io[0x51] !== 0xFF && this.mmu.io[0x52] != 0xFF &&
        this.mmu.io[0x53] !== 0xFF && this.mmu.io[0x54] != 0xFF;
    }

    public get vbk() {
        return ((this.mmu.io[0x4F] & 0x1) === 0x1) && this.mmu.isInGBCMode;
    }

    public set vbk(value: boolean) { 
        this.mmu.io[0x4F] = (value ? 0x1 : 0x0); 
    }
        
    public get(index : number) {
        return this.vbk ? this.bank1[index] : this.bank0[index]; 
    }

    public set(index: number, value: number)  {
        if (this.vbk)
            this.bank1[index] = value;
        else
            this.bank0[index] = value;
    }

    public startDMATransfer(value : number) {
        this.hdma5 = value;

        const length = ((this.hdma5 & 0x7F) + 1) << 4;
        const hblankDMA = (value & 0x80) == 0x80;

        if (!hblankDMA) {
            if (this.active) { // interromper DMA ativo 
                this.active = false;
                this.hdma5 = ((this.hdma5 & 0x7F));
            }
            else
                this.startGeneralDMATransfer(length);
        }
        else
            this.active = true;
    }

    private startGeneralDMATransfer(length : number) {
        for (let i = 0; i < length; i++) {
            this.set(this.dmaDestinationAddr + i, this.mmu.get(this.dmaSourceAddr + i));

            if (i % 0x10 == 0)
                this.hdma5 = ((((length - i) >> 4) - 1) & 0x7F);
        }

        this.resetDMAFlags();
    }

    public executeHBlankDMATransfer() {

        if (!this.isHBlankDMAActive) // hblank não ativo
            return;
        
        if (this.startAddress === 0)
            this.startAddress = this.dmaSourceAddr;

        const padding = (this.startAddress - this.dmaSourceAddr);

        for (let i = 0; i < 0x10; i++)
            this.set(this.dmaDestinationAddr + i + padding, this.mmu.get(this.dmaSourceAddr + i + padding));
        
        this.startAddress += 0x10;

        if ((this.hdma5 & 0x7F) === 0) {
            this.active = false;
            this.resetDMAFlags();
        }
        else
            this.hdma5--;
    }
}