import {existsSync, mkdirSync, readFileSync, writeFileSync} from "fs";

export const createFolder = (path: string) => {
    if (!existsSync(path)){
        mkdirSync(path);
    }
}

export const readJson = (path: string, def: () => any): any => {
    if (existsSync(path)) {
        const data = readFileSync(path);
        return JSON.parse(data.toString());
    } else {
        return def();
    }
}

export const writeJson = (path: string, obj: any) => {
    const json = JSON.stringify(obj);
    writeFileSync(path, Buffer.from(json))
}

export const computeIfNotExist = (map: any, key: string, value: (k: string) => any): any => {
    if (!map[key]) {
        map[key] = value(key);
    }

    return map[key];
}