import { EPX } from "./EPX";
import { Eagle } from "./Eagle";
import { Empty } from "./Empty";
import { Filter } from "./Filter";
import { FilterType } from "./FilterType";
import { Nearest } from "./Nearest";

export class Factory {

    public static get(type : FilterType, width: number, height: number) : Filter {

        switch (type) {
            case FilterType.None: return new Empty(width, height);
            case FilterType.Eagle: return new Eagle(width, height);
            case FilterType.EPX: return new EPX(width, height);
            case FilterType.Nearest: return new Nearest(width, height);
            case FilterType.Scale2x: throw new Error("Unimplemented");
            case FilterType.Scale3x: throw new Error("Unimplemented");
            case FilterType.Bilinear: throw new Error("Unimplemented");
            case FilterType.SuperEagle: throw new Error("Unimplemented");
            case FilterType._2xSaI: throw new Error("Unimplemented");
            case FilterType.Super2xSaI: throw new Error("Unimplemented");
        }
    }
}