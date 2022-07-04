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
exports.SequelizeAuto = void 0;
const db_1 = require("./db");
const auto_builder_1 = require("./auto-builder");
const auto_writer_1 = require("./auto-writer");
class SequelizeAuto {
    constructor(host, database, username, password, table, port, directory, overwrite) {
        this.tableName = table;
        this.dbName = database;
        this.directory = directory;
        this.overwrite = overwrite;
        this.db = new db_1.Db(host, database, username, password, port);
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.db.connection.connect();
                const tableColumns = yield this.db.getTableColumns(this.tableName);
                const tableComments = yield this.db.getComments(this.dbName, this.tableName);
                const buildResult = yield new auto_builder_1.AutoBuilder(this.tableName, tableColumns, tableComments).build();
                yield new auto_writer_1.AutoWriter(buildResult, this.directory, this.tableName, this.overwrite).write();
            }
            catch (err) {
                console.error('Generate model error', err);
            }
            finally {
                this.db.connection.end();
            }
        });
    }
}
exports.SequelizeAuto = SequelizeAuto;
module.exports = SequelizeAuto;
module.exports.SequelizeAuto = SequelizeAuto;
module.exports.default = SequelizeAuto;
//# sourceMappingURL=index.js.map