export class LittleEndian {
    
    public static getWordFrom2Bytes(lsb: number, msb: number) {
        return ((msb << 8) | lsb) & 0xFFFF;
    }

    public static get2BytesFromWord(value : number) {
        const msb = ((value & 0xFF00) >> 8) & 0xFF;
        const lsb = ((value & 0xFF)) & 0xFF;
        return [msb, lsb];
    }

    public static get4BytesFromDWord(number: number) {

        return [
            (number & 255) >>> 0,
            (number & 65280) >>> 8,
            (number & 16711680) >>> 16,
            (number & 4278190080) >>> 24,
        ];
    }

    static getDWordFrom4Bytes(bytes: number[]) {
        
        return ((bytes[3] << 24) |
                (bytes[2] << 16) |
                (bytes[1] <<  8) |
                (bytes[0])) >>> 0;
    }
}