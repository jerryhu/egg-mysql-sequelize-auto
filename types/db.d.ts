import mysql = require('mysql');
import { TableColumn, TableColumnComment } from './types';
export declare class Db {
    connection: mysql.Connection;
    constructor(host: string, database: string, username: string, password: string, port: number);
    private query;
    getTableColumns(tableName: string): Promise<Array<TableColumn>>;
    getComments(dbName: string, tableName: string): Promise<Array<TableColumnComment>>;
}
