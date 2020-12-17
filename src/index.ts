
import { Db } from './db';
import { AutoBuilder } from './auto-builder';
import { AutoWriter } from './auto-writer';

export class SequelizeAuto {
  db: Db;
  tableName: string;
  dbName: string;
  directory: string;
  overwrite: boolean;

  constructor(host: string, database: string, username: string, password: string, table: string, port: number, directory: string, overwrite: boolean) {
    this.tableName = table;
    this.dbName = database;
    this.directory = directory;
    this.overwrite = overwrite;
    this.db = new Db(host, database, username, password, port);
  }

  public async run() {
    try{
      this.db.connection.connect();

      const tableColumns = await this.db.getTableColumns(this.tableName);
      const tableComments = await this.db.getComments(this.dbName, this.tableName);
  
      const buildResult = await new AutoBuilder(this.tableName, tableColumns, tableComments).build();
      await new AutoWriter(buildResult, this.directory, this.tableName, this.overwrite).write();
    }
    catch(err){
      console.error('Generate model error', err);
    }
    finally{
      this.db.connection.end();
    }
  }
}

module.exports = SequelizeAuto;
module.exports.SequelizeAuto = SequelizeAuto;
module.exports.default = SequelizeAuto;