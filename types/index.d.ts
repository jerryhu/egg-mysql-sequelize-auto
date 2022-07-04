import { Db } from './db';
export declare class SequelizeAuto {
    db: Db;
    tableName: string;
    dbName: string;
    directory: string;
    overwrite: boolean;
    constructor(host: string, database: string, username: string, password: string, table: string, port: number, directory: string, overwrite: boolean);
    run(): Promise<void>;
}
