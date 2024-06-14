
export interface IMapper { 
    readROM(addr : number) : number;
    loadProgram(bytes : Uint8Array) : void;
    readCartRAM(addr: number): number;
    writeCartRAM(addr: number, value: number): void;
    setMode(addr : number, value : number) : void;
}
