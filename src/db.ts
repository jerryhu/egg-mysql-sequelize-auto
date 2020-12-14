import mysql = require('mysql');
import {TableColumn,TableColumnComment } from './types';


export class Db {
  public connection: mysql.Connection;

  constructor(host:string, database:string, username:string, password:string, port: number) {
    this.connection = mysql.createConnection({
      host,
      // 端口号
      port: port,
      // 用户名
      user: username,
      // 密码
      password,
      // 数据库名
      database: database,
    });
  }

  private query<T>(sql:string, params: any):Promise<Array<T>> {
    // 返回一个 Promise
    return new Promise((resolve, reject) => {
      this.connection.query(sql, params, (err, results: T[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }


  public async getTableColumns(tableName:string):Promise<Array<TableColumn>> {
    return await this.query(`desc ${tableName}`, []);
  }

  public async getComments(dbName:string, tableName:string):Promise<Array<TableColumnComment>> {
    const sql = `select COLUMN_NAME as name,COLUMN_COMMENT as comment from INFORMATION_SCHEMA.Columns where TABLE_SCHEMA=? AND TABLE_NAME = ?`
    return await this.query(sql, [dbName, tableName]);
  }

}
