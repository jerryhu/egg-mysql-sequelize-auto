import fs = require('fs-extra');
import path = require('path');


export class StubReader {

  public stubPath:string;

  constructor() {
    this.stubPath = path.resolve(__dirname, '../stubs/') + '/';
  }

  public async readModelStubContent() : Promise<string>{
    return new Promise((resolve, reject) => {
      fs.readFile(this.stubPath + "model.stub", 'utf8', function(err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  public async readDefineStubContent() : Promise<string>{
    return new Promise((resolve, reject) => {
      fs.readFile(this.stubPath + "define.stub", 'utf8', function(err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  public async isFileExisted(filePath:string) {
    return new Promise(resolve => {
      fs.access(filePath, function(err) {
        if (err) {
          resolve('not existed');
        } else {
          resolve('existed');
        }
      });
    });
  }

}
