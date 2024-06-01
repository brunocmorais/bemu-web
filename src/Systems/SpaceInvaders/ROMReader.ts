import * as JSZip from "jszip";
import { GameInfo, map } from "./GameInfo";

export class ROMReader {

    public static async read(zip : Uint8Array) {
        
        const bytes = new Uint8Array(0x10000);
        const jszip = new JSZip();
        const zipFile = await jszip.loadAsync(zip);
        const gameInfo = this.findGameInfo(zipFile);

        if (!gameInfo)
            throw new Error("Unknown or unsupported ROM, can't proceed!");  
        
        for (let i = 0; i < gameInfo.files.length; i++) {
        
            const fileName = gameInfo.files[i];
            const address = gameInfo.addr[i];
            const file = zipFile.file(fileName);

            if (file === null)
                throw new Error("Unknown or unsupported ROM, can't proceed!");

            const fileBytes = await file.async("uint8array");

            for (let j = 0; j < fileBytes.length; j++)
                bytes[j + address] = fileBytes[j];
        }

        return bytes;
    }

    private static findGameInfo(zipFile : JSZip) {

        var gameInfos = map;
        let gameInfo : GameInfo | undefined;

        zipFile.forEach((_path, file) => {
            gameInfo = gameInfos.find(g => g.files.indexOf(file.name) >= 0);
        });

        return gameInfo;
    }
}