export class LittleEndian {
    
    public static getWordFrom2Bytes(lsb: number, msb: number) {
        return ((msb << 8) | lsb) & 0xFFFF;
    }

    public static get2BytesFromWord(value : number) {
        const msb = ((value & 0xFF00) >> 8) & 0xFF;
        const lsb = ((value & 0xFF)) & 0xFF;
        return [msb, lsb];
    }
}