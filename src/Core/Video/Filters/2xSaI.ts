import { Framebuffer } from "../Framebuffer";
import { ScaledPixel } from "../ScaledPixel";
import { Filter } from "./Filter";
import { FilterType } from "./FilterType";
import { Util } from "./Util";

export class _2xSaI extends Filter {

    constructor(framebuffer : Framebuffer) {
        super(framebuffer, 2);
    }

    public update(): void {

        let scaled = new ScaledPixel(2);

        let colorA : number, colorB : number, colorC : number, colorD : number,
            colorE : number, colorF : number, colorG : number, colorH : number,
            colorI : number, colorJ : number, colorK : number, colorL : number,
            colorM : number, colorN : number, colorO : number, colorP : number;

        let product : number, product1 : number, product2 : number;
        
        for (let x = 0; x < this.framebuffer.width; x++) {
            for (let y = 0; y < this.framebuffer.height; y++) {

                colorI = this.get(x - 1, y - 1);
                colorE = this.get(x, y - 1);
                colorF = this.get(x + 1, y - 1);
                colorJ = this.get(x + 2, y - 1);

                colorG = this.get(x - 1, y);
                colorA = this.get(x, y);
                colorB = this.get(x + 1, y);
                colorK = this.get(x + 2, y);

                colorH = this.get(x - 1, y + 1);
                colorC = this.get(x, y + 1);
                colorD = this.get(x + 1, y + 1);
                colorL = this.get(x + 2, y + 1);

                colorM = this.get(x - 1, y + 2);
                colorN = this.get(x, y + 2);
                colorO = this.get(x + 1, y + 2);
                colorP = this.get(x + 2, y + 2);

                if ((colorA == colorD) && (colorB != colorC)) {
                    if ( ((colorA == colorE) && (colorB == colorL)) ||
                        ((colorA == colorC) && (colorA == colorF) && (colorB != colorE) && (colorB == colorJ)) )
                        product = colorA;
                    else
                        product = Util.interpolate(colorA, colorB);

                    if (((colorA == colorG) && (colorC == colorO)) ||
                        ((colorA == colorB) && (colorA == colorH) && (colorG != colorC) && (colorC == colorM)) )
                        product1 = colorA;
                    else
                        product1 = Util.interpolate(colorA, colorC);

                    product2 = colorA;
                } else {
                    if ((colorB == colorC) && (colorA != colorD)) {
                        if (((colorB == colorF) && (colorA == colorH)) ||
                            ((colorB == colorE) && (colorB == colorD) && (colorA != colorF) && (colorA == colorI)) )
                            product = colorB;
                        else
                            product = Util.interpolate(colorA, colorB);

                        if (((colorC == colorH) && (colorA == colorF)) ||
                            ((colorC == colorG) && (colorC == colorD) && (colorA != colorH) && (colorA == colorI)) )
                            product1 = colorC;
                        else
                            product1 = Util.interpolate(colorA, colorC);
                        product2 = colorB;
                    } else {
                        if ((colorA == colorD) && (colorB == colorC)) {
                            if (colorA == colorB) {
                                product = colorA;
                                product1 = colorA;
                                product2 = colorA;
                            } else {
                                let r = 0;
                                product1 = Util.interpolate(colorA, colorC);
                                product = Util.interpolate(colorA, colorB);

                                r += Util.getResult1 (colorA, colorB, colorG, colorE/*, colorI*/);
                                r += Util.getResult2 (colorB, colorA, colorK, colorF/*, colorJ*/);
                                r += Util.getResult2 (colorB, colorA, colorH, colorN/*, colorM*/);
                                r += Util.getResult1 (colorA, colorB, colorL, colorO/*, colorP*/);

                                if (r > 0) {
                                    product2 = colorA;
                                } else {
                                    if (r < 0)
                                        product2 = colorB;
                                    else
                                        product2 = Util.qInterpolate(colorA, colorB, colorC, colorD);
                                }
                            }
                        } else {
                            product2 = Util.qInterpolate(colorA, colorB, colorC, colorD);

                            if ((colorA == colorC) && (colorA == colorF) && (colorB != colorE) && (colorB == colorJ)) {
                                product = product1 = colorA;
                            } else {
                                if ((colorB == colorE) && (colorB == colorD) && (colorA != colorF) && (colorA == colorI))
                                    product = colorB;
                                else
                                    product = Util.interpolate(colorA, colorB);

                                if ((colorA == colorB) && (colorA == colorH) && (colorG != colorC) && (colorC == colorM)) {
                                    product1 = colorA;
                                } else {
                                    if ((colorC == colorG) && (colorC == colorD) && (colorA != colorH) && (colorA == colorI))
                                        product1 = colorC;
                                    else
                                        product1 = Util.interpolate(colorA, colorC);
                                }
                            }
                        }
                    }
                }

                scaled.set(0, 0, colorA);
                scaled.set(1, 0, product);
                scaled.set(0, 1, product1);
                scaled.set(1, 1, product2);

                this.scaled.setScaledPixel(scaled, x, y);
            }
        }
    }

    public get type(): FilterType {
        return FilterType._2xSaI;
    }


}