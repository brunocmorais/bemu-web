export class Byte {

    public static toSignedByte(value : number) {

        value &= 0xFF;

        if (value < 0x80)
            return value;

        return value - 0x100;
    }
}