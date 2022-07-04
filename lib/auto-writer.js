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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoWriter = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const util_1 = __importDefault(require("util"));
const mkdirp = require('mkdirp');
const util_2 = require("./util");
class AutoWriter {
    constructor(buildResult, directory, tableName, overwrite) {
        this.buildResult = buildResult;
        this.directory = directory;
        this.tableName = tableName;
        this.overwrite = overwrite;
    }
    /**
     * 生成文件
     */
    write() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.overwrite) {
                const modelCreated = yield this.isModelCreated();
                if (modelCreated) {
                    console.error('### Model file was created. Please remove the old files and try again ###');
                    return;
                }
            }
            mkdirp.sync(path_1.default.resolve(this.directory || "./model"));
            mkdirp.sync(path_1.default.resolve(this.directory + '/define' || "./model/define"));
            const promises = [];
            const modelWritePromise = this.createModelFile(this.buildResult.modelData);
            const defineWritePromise = this.createDefineFile(this.buildResult.defineData);
            promises.push(modelWritePromise);
            promises.push(defineWritePromise);
            return Promise.all(promises).then(o => {
                console.log("Done!");
            });
        });
    }
    /**
     * 写入model文件
     * @param content 内容
     */
    createModelFile(content) {
        const fileName = (0, util_2.recase)(this.tableName, true);
        const filePath = path_1.default.join(this.directory, fileName + '.ts');
        const writeFile = util_1.default.promisify(fs_1.default.writeFile);
        return writeFile(path_1.default.resolve(filePath), content);
    }
    /**
     * 写入define文件
     * @param content 内容
     */
    createDefineFile(content) {
        const fileName = (0, util_2.recase)(this.tableName, true);
        const filePath = path_1.default.join(this.directory + '/define', fileName + '.d.ts');
        const writeFile = util_1.default.promisify(fs_1.default.writeFile);
        return writeFile(path_1.default.resolve(filePath), content);
    }
    /**
     * 判断model文件是否已生成
     */
    isModelCreated() {
        const fileName = (0, util_2.recase)(this.tableName, true);
        const filePath = path_1.default.join(this.directory, fileName + '.ts');
        return new Promise(resolve => {
            fs_1.default.access(filePath, function (err) {
                if (err && err.code == "ENOENT") {
                    resolve(false);
                }
                resolve(true);
            });
        });
    }
}
exports.AutoWriter = AutoWriter;
//# sourceMappingURL=auto-writer.js.map