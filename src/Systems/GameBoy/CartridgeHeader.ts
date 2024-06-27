
export class CartridgeHeader {
    public readonly nintendoLogo: number[];
    public readonly title: string;
    public readonly manufacturerCode: string;
    public readonly gbcFlag: number;
    public readonly newLicenseeCode: string;
    public readonly sgbFlag: number;
    public readonly cartridgeType: number;
    public readonly romSize: number;
    public readonly ramSize: number;
    public readonly japanese: boolean;
    public readonly oldLicenseeCode: number;
    public readonly maskROMVersionNumber: number;
    public readonly headerCheckSum: number;
    public readonly globalChecksum: number;

    constructor(nintendoLogo: number[], title: string, manufacturerCode: string,
        gbcFlag: number, newLicenseeCode: string, sgbFlag: number, cartridgeType: number,
        romSize: number, ramSize: number, japanese: boolean, oldLicenseeCode: number,
        maskROMVersionNumber: number, headerCheckSum: number, globalChecksum: number) {
        this.nintendoLogo = nintendoLogo;
        this.title = title;
        this.manufacturerCode = manufacturerCode;
        this.gbcFlag = gbcFlag;
        this.newLicenseeCode = newLicenseeCode;
        this.sgbFlag = sgbFlag;
        this.cartridgeType = cartridgeType;
        this.romSize = romSize;
        this.ramSize = ramSize;
        this.japanese = japanese;
        this.oldLicenseeCode = oldLicenseeCode;
        this.maskROMVersionNumber = maskROMVersionNumber;
        this.headerCheckSum = headerCheckSum;
        this.globalChecksum = globalChecksum;
    }

    public static read(rom : Uint8Array) {

        const bytes = rom.slice(0x100);
            
        const nintendoLogo = bytes.slice(0x004, 0x033);
        const title = String.fromCharCode(...bytes.slice(0x034, 0x043));
        const manufacturerCode = String.fromCharCode(...bytes.slice(0x03F, 0x042));
        const gbcFlag = bytes[0x043];
        const newLicenseeCode = String.fromCharCode(...bytes.slice(0x044, 0x045));
        const sgbFlag = bytes[0x046];
        const cartridgeType = bytes[0x047];
        const romSize = 32 << bytes[0x048];
        const ramSize = this.getRAMSize(bytes[0x049]);
        const japanese = bytes[0x04A] == 0;
        const oldLicenseeCode = bytes[0x04B];
        const maskROMVersionNumber = bytes[0x04C];
        const headerCheckSum = bytes[0x04D];
        const globalChecksum = ((bytes[0x04E] << 8) | bytes[0x04F]) & 0xFFFF;

        return new CartridgeHeader([...nintendoLogo], title, manufacturerCode, 
            gbcFlag, newLicenseeCode, sgbFlag, cartridgeType, romSize, 
            ramSize, japanese, oldLicenseeCode, maskROMVersionNumber, 
            headerCheckSum, globalChecksum);
    }

    private static getRAMSize(value: number) {
        
        switch (value) {
            case 0: return 0;
            case 1: return 2;
            case 2: return 8;
            case 3: return 32;
            case 4: return 128;
            case 5: return 64;
            default: return 0;
        }
    }
}
