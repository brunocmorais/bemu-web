import { File as FileUtil } from "../Core/Util/File";
import { supportedExtensions } from "../Systems/SystemFactory";

export class FileList {

    private fileList : File[];

    constructor() {
        this.fileList = new Array<File>();
    }

    private set files(fileList : File[]) {

        this.fileList = fileList.filter((item) => {
            const fileName = item.name;
            const extension = FileUtil.getExtension(fileName);
            return (extension && supportedExtensions.indexOf(extension) >= 0)
        }).sort((a, b) => {
            if (a.name < b.name) return -1;
            else if (a.name > b.name) return 1;
            else return 0;
        });
    }

    public fill(files : File[]) {

        this.files = files;

        const filesElement = document.querySelector("#files") as HTMLSelectElement;
        filesElement.replaceChildren();

        let index = 0;

        for (const item of this.fileList) {

            const option = document.createElement("option");
            option.innerText = item.name;
            option.value = (index++).toString();
            
            filesElement.add(option);
        }
        
        filesElement.selectedIndex = 0;
    }

    public getAt(index: number) {
        return this.fileList[index];
    }

    public get length() {
        return this.fileList.length;
    }
}