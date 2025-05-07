import { BadRequestException, Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import fs = require('fs');
import { existsSync } from 'fs';
import { join } from 'path';

import { compressImage, handlerError } from "../../common/utils";

export interface CloudComputingOptions {
    file?: Express.Multer.File;
    path?: string;
    name?: string;
    bucket?: string;
    key?: string;
    contentType?: string;
    contentDisposition?: string;
}

export interface CloudComputingResponse {
    path: string;
    url: string;
}

export interface CloudComputing {
    uploadFile(fileOptions: CloudComputingOptions): Promise<CloudComputingResponse>;
    deleteFile(fileOptions: CloudComputingOptions): Promise<boolean>;
    getFile(fileOptions: CloudComputingOptions): Promise<Buffer>;
}

@Injectable()
export class LocalStorageService implements CloudComputing {

    private readonly logger = new Logger('LocalStorageService');

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    constructor() { }

    async uploadFile(fileOptions: CloudComputingOptions): Promise<CloudComputingResponse> {
        try {
            const { path, file } = fileOptions;
            let nameFile = file.originalname.toLowerCase().split(' ').join('_');

            const fileCompressed = await compressImage({ buffer: file.buffer, quality: 60 });
            nameFile = nameFile.split('.').slice(0, -1).join('.') + '.webp';

            nameFile = this.existFileNamed({ path, name: nameFile }) ? new Date().getTime() + '_' + nameFile : nameFile;
            const pathResponse = path + '/' + nameFile;

            // save file
            const imagenPath = join(__dirname, '..', '..', '..', 'files', path);
            if (!fs.existsSync(imagenPath)) fs.mkdirSync(imagenPath, { recursive: true });
            fs.writeFileSync(join(imagenPath, nameFile), fileCompressed);


            return Promise.resolve({
                url: process.env.APP_URL + '/api/files/' + pathResponse,
                path: pathResponse
            });
        } catch (error) {
            handlerError(error, this.logger);
        }

    }

    async deleteFile(fileOptions: CloudComputingOptions): Promise<boolean> {
        try {
            const { path } = fileOptions;
            const file = join(__dirname, '..', '..', '..', 'files', path);
            if (fs.existsSync(file)) fs.unlinkSync(file);
            return true;
        } catch (error) {
            handlerError(error, this.logger);
        }
    }

    async getFile(fileOptions: CloudComputingOptions): Promise<Buffer> {
        throw new InternalServerErrorException('Method not implemented.');
    }

    verifyFileExist(fileOptions: CloudComputingOptions): string {
        try {
            const { path, name } = fileOptions;
            const pathFile = join(__dirname, '..', '..', '..', 'files', path, name);
            if (!existsSync(pathFile)) throw new BadRequestException(`No product found with image ${name}`);
            return pathFile;
        } catch (error) {
            handlerError(error, this.logger);
        }
    }

    existFileNamed(fileOptions: CloudComputingOptions): boolean {
        try {
            const { path, name } = fileOptions;
            const pathFile = join(__dirname, '..', '..', '..', 'files', path, name);
            if (!existsSync(pathFile)) return false;
            return true;
        } catch (error) {
            handlerError(error, this.logger);
        }
    }

    //create a folder and file
    async createFolderAndFile(path: string, name: string, file: any): Promise<string> {
        try {
            const folderPath = join(__dirname, '..', '..', '..', path);
            const folderPathFile = join(__dirname, '..', '..', '..', path, name);
            if (!existsSync(folderPathFile)) {
                fs.mkdirSync(folderPath, { recursive: true });
                fs.writeFileSync(join(folderPath, name), file);
            }
            return Promise.resolve(
                '/api/' + path + '/' + name
            );
        } catch (error) {
            handlerError(error, this.logger);
        }
    }
}