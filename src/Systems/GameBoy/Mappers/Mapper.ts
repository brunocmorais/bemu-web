import { MMU } from "../MMU";
import { IMapper } from "./IMapper";


const romBankSize = 16384;

export abstract class Mapper implements IMapper {
    
    protected romBanks : number[][] = [];
    protected ramBanks : number[][] = [];
    protected get rom0() { return this.romBanks[0]; }
    protected abstract get cartRam() : number[];
    protected abstract get ramBankCount() : number;
    protected abstract get externalRamSize() : number;
    protected mmu : MMU;
    protected readonly ram : boolean;

    public constructor(mmu : MMU, ram : boolean) {
        this.mmu = mmu;
        this.ram = ram;
        this.initializeMBC(ram);
    }

    public abstract readROM(addr : number) : number;
    public abstract readCartRAM(addr: number): number;
    public abstract writeCartRAM(addr: number, value: number): void;

    private initializeMBC(ram : boolean) {
        
        if (ram)
            this.initializeRAMBanks();
    }

    public loadProgram(bytes : Uint8Array) {
        this.romBanks = new Array<number[]>(bytes.length / romBankSize);

        for (let i = 0; i < this.romBanks.length; i++)
            this.romBanks[i] = new Array<number>(romBankSize);

        for (let i = 0; i < bytes.length; i++)
            this.romBanks[Math.floor(i / romBankSize)][i % romBankSize] = bytes[i];
    }

    private initializeRAMBanks() {
        this.ramBanks = new Array<number[]>(this.ramBankCount);

        for (let i = 0; i < this.ramBankCount; i++)
            this.ramBanks[i] = new Array<number>(this.externalRamSize);
    }

    public abstract setMode(addr: number, value: number): void;
}