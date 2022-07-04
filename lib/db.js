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
exports.Db = void 0;
const mysql = require("mysql");
class Db {
    constructor(host, database, username, password, port) {
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
    query(sql, params) {
        // 返回一个 Promise
        return new Promise((resolve, reject) => {
            this.connection.query(sql, params, (err, results) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(results);
                }
            });
        });
    }
    getTableColumns(tableName) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.query(`desc \`${tableName}\``, []);
        });
    }
    getComments(dbName, tableName) {
        return __awaiter(this, void 0, void 0, function* () {
            const sql = `select COLUMN_NAME as name,COLUMN_COMMENT as comment from INFORMATION_SCHEMA.Columns where TABLE_SCHEMA=? AND TABLE_NAME = ?`;
            return yield this.query(sql, [dbName, tableName]);
        });
    }
}
exports.Db = Db;
//# sourceMappingURL=db.js.map