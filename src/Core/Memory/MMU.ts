export abstract class MMU {
    protected ram: number[];

    constructor(size: number) {
        this.ram = new Array<number>(size).fill(0);
    }

    public get(address: number) {
        return this.ram[address];
    }

    public set(address: number, value: number) {
        this.ram[address] = value;
    }

    public loadProgram(bytes: Uint8Array, startAddress : number) {
        
        if ((bytes.length + startAddress) > this.ram.length)
            throw new Error("Programa não cabe na memória!");

        for (let i = 0; i < bytes.length; i++)
            this.ram[i + startAddress] = bytes[i];
    }
}