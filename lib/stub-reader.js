"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StubReader = void 0;
const fs = require("fs-extra");
const path = require("path");
class StubReader {
    constructor() {
        this.stubPath = path.resolve(__dirname, '../stubs/') + '/';
    }
    readModelStubContent() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                fs.readFile(this.stubPath + "model.stub", 'utf8', function (err, data) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(data);
                    }
                });
            });
        });
    }
    readDefineStubContent() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                fs.readFile(this.stubPath + "define.stub", 'utf8', function (err, data) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(data);
                    }
                });
            });
        });
    }
    isFileExisted(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise(resolve => {
                fs.access(filePath, function (err) {
                    if (err) {
                        resolve('not existed');
                    }
                    else {
                        resolve('existed');
                    }
                });
            });
        });
    }
}
exports.StubReader = StubReader;
//# sourceMappingURL=stub-reader.js.map