import fs from "fs";
import path from "path";
import util from "util";
const mkdirp = require('mkdirp');
import { BuildResult } from './types';
import { recase } from './util';

export class AutoWriter {
  buildResult: BuildResult;
  directory: string;
  tableName: string;
  overwrite: boolean
  constructor(buildResult: BuildResult, directory: string, tableName: string, overwrite: boolean) {
    this.buildResult = buildResult;
    this.directory = directory;
    this.tableName = tableName;
    this.overwrite = overwrite;
  }

  /**
   * 生成文件
   */
  async write() {
    if(!this.overwrite){
      const modelCreated = await this.isModelCreated();
      if(modelCreated){
        console.error('### Model file was created. Please remove the old files and try again ###')
        return;
      }
    }

    mkdirp.sync(path.resolve(this.directory || "./model"));
    mkdirp.sync(path.resolve(this.directory + '/define' || "./model/define"));

    const promises = [];
    const modelWritePromise = this.createModelFile(this.buildResult.modelData);
    const defineWritePromise = this.createDefineFile(this.buildResult.defineData);

    promises.push(modelWritePromise);
    promises.push(defineWritePromise);

    return Promise.all(promises).then(o => {
      console.log("Done!");
    });
  }

  /**
   * 写入model文件
   * @param content 内容
   */
  private createModelFile(content: string) {
    const fileName = recase(this.tableName, true);
    const filePath = path.join(this.directory, fileName + '.ts');

    const writeFile = util.promisify(fs.writeFile);
    return writeFile(path.resolve(filePath), content);
  }

  /**
   * 写入define文件
   * @param content 内容
   */
  private createDefineFile(content: string) {
    const fileName = recase(this.tableName, true);
    const filePath = path.join(this.directory + '/define', fileName + '.d.ts');

    const writeFile = util.promisify(fs.writeFile);
    return writeFile(path.resolve(filePath), content);
  }

  /**
   * 判断model文件是否已生成
   */
  private isModelCreated() : Promise<boolean>{
    const fileName = recase(this.tableName, true);
    const filePath = path.join(this.directory, fileName + '.ts');
    return new Promise(resolve => {
      fs.access(filePath, function(err) {
        if(err && err.code == "ENOENT"){
          resolve(false);
        }
        resolve(true);
      });
    });
  }
}
