const colorMask = 0xFEFEFEFF;
const lowPixelMask = 0x010101FF;
const qcolorMask = 0xFCFCFCFF;
const qlowpixelMask = 0x030303FF;

export class Util {

    public static getResult1(a: number, b: number, c: number, d: number) {

        let x = 0; 
        let y = 0;
        let r = 0;

        if (a === c) x++; 
        else if (b === c) y++;
        
        if (a === d) x++; 
        else if (b === d) y++;

        if (x <= 1) r++; 
        if (y <= 1) r--;

        return r;
    }

    public static getResult2(a: number, b: number, c: number, d: number) {
        
        let x = 0; 
        let y = 0;
        let r = 0;

        if (a === c) x++; 
        else if (b === c) y++;
        
        if (a === d) x++; 
        else if (b === d) y++;
        
        if (x <= 1) r--; 
        if (y <= 1) r++;
        
        return r;
    }

    public static interpolate(a: number, b: number) {

        if (a !== b)
            return ((((a & colorMask) >> 1) + ((b & colorMask) >> 1) + (a & b & lowPixelMask)));

        return a;
    }

    public static qInterpolate(a: number, b: number, c: number, d: number) {

        let x = ((a & qcolorMask) >> 2) +
            ((b & qcolorMask) >> 2) +
            ((c & qcolorMask) >> 2) +
            ((d & qcolorMask) >> 2);
        let y = (a & qlowpixelMask) +
            (b & qlowpixelMask) +
            (c & qlowpixelMask) +
            (d & qlowpixelMask);

        y = (y >> 2) & qlowpixelMask;

        return (x + y);
    }

    public static lerp = (s: number, e: number, t: number) => s + (e - s) * t; 
    public static blerp = (c00: number, c10: number, c01: number, c11: number, tx: number, ty: number) => 
        this.lerp(this.lerp(c00, c10, tx), this.lerp(c01, c11, tx), ty);
}