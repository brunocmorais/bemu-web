export class File {

    public static getExtension(fileName : string) {

        return fileName.substring(fileName.lastIndexOf("."));
    }
}