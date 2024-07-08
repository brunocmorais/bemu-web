import { Framebuffer } from "../Framebuffer";
import { ScaledPixel } from "../ScaledPixel";
import { Filter } from "./Filter";
import { FilterType } from "./FilterType";
import { Util } from "./Util";

export class SuperEagle extends Filter {
    
    constructor(framebuffer : Framebuffer) {
        super(framebuffer, 2);
    }

    public update(): void {
        
        let scaled = new ScaledPixel(2);

        let color4 : number, color5 : number, color6 : number,
            color1 : number, color2 : number, color3 : number,
            colorA0 : number, colorA1 : number, colorA2 : number, colorA3 : number,
            colorB0 : number, colorB1 : number, colorB2 : number, colorB3 : number,
            colorS1 : number, colorS2 : number,
            product1a : number, product1b : number,
            product2a : number, product2b : number;

            for (let x = 0; x < this.framebuffer.width; x++) {
                for (let y = 0; y < this.framebuffer.height; y++) {

                    colorB0 = this.get(x - 1, y - 1);
                    colorB1 = this.get(x, y - 1);
                    colorB2 = this.get(x + 1, y - 1);
                    colorB3 = this.get(x + 2, y - 1);

                    color4  = this.get(x - 1, y);
                    color5  = this.get(x, y);
                    color6  = this.get(x + 1, y);
                    colorS2 = this.get(x + 2, y);

                    color1  = this.get(x - 1, y + 1);
                    color2  = this.get(x, y + 1);
                    color3  = this.get(x + 1, y + 1);
                    colorS1 = this.get(x + 2, y + 1);

                    colorA0 = this.get(x - 1, y + 2);
                    colorA1 = this.get(x, y + 2);
                    colorA2 = this.get(x + 1, y + 2);
                    colorA3 = this.get(x + 2, y + 2);

                    if (color2 == color6 && color5 != color3) {
                        product1b = product2a = color2;
                        if ((color1 == color2 && color6 == colorS2) ||
                            (color2 == colorA1 && color6 == colorB2)) {
                            product1a = Util.interpolate (color2, color5);
                            product1a = Util.interpolate (color2, product1a);
                            product2b = Util.interpolate (color2, color3);
                            product2b = Util.interpolate (color2, product2b);
                        } else {
                            product1a = Util.interpolate (color5, color6);
                            product2b = Util.interpolate (color2, color3);
                        }
                    } else {
                        if (color5 == color3 && color2 != color6) {
                            product2b = product1a = color5;
                            if ((colorB1 == color5 && color3 == colorA2) ||
                                (color4 == color5 && color3 == colorS1)) {
                                product1b = Util.interpolate (color5, color6);
                                product1b = Util.interpolate (color5, product1b);
                                product2a = Util.interpolate (color5, color2);
                                product2a = Util.interpolate (color5, product2a);
                            } else {
                                product1b = Util.interpolate (color5, color6);
                                product2a = Util.interpolate (color2, color3);
                            }
                        } else {
                            if (color5 == color3 && color2 == color6 && color5 != color6) {
                                let r = 0;

                                r += Util.getResult1 (color6, color5, color1, colorA1);
                                r += Util.getResult1 (color6, color5, color4, colorB1);
                                r += Util.getResult1 (color6, color5, colorA2, colorS1);
                                r += Util.getResult1 (color6, color5, colorB2, colorS2);

                                if (r > 0) {
                                    product1b = product2a = color2;
                                    product1a = product2b = Util.interpolate (color5, color6);
                                }
                                else {
                                    if (r < 0) {
                                        product2b = product1a = color5;
                                        product1b = product2a = Util.interpolate (color5, color6);
                                    } else {
                                        product2b = product1a = color5;
                                        product1b = product2a = color2;
                                    }
                                }
                            } else {
                                if ((color2 == color5) || (color3 == color6)) {
                                    product1a = color5;
                                    product2a = color2;
                                    product1b = color6;
                                    product2b = color3;
                                } else {
                                    product1b = product1a = Util.interpolate (color5, color6);
                                    product1a = Util.interpolate (color5, product1a);
                                    product1b = Util.interpolate (color6, product1b);

                                    product2a = product2b = Util.interpolate (color2, color3);
                                    product2a = Util.interpolate (color2, product2a);
                                    product2b = Util.interpolate (color3, product2b);
                                }
                            }
                        }
                    }

                scaled.set(0, 0, product1a);
                scaled.set(1, 0, product1b);
                scaled.set(0, 1, product2a);
                scaled.set(1, 1, product2b);

                this.scaled.setScaledPixel(scaled, x, y);
            }
        }
    }

    public get type(): FilterType {
        return FilterType.SuperEagle;
    }
}