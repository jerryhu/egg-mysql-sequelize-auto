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
exports.AutoBuilder = void 0;
const lodash_1 = __importDefault(require("lodash"));
const stub_reader_1 = require("./stub-reader");
const util_1 = require("./util");
class AutoBuilder {
    constructor(tableName, tableColumns, comments) {
        this.stubReader = new stub_reader_1.StubReader();
        this.tableName = tableName;
        this.tableColumns = tableColumns;
        this.comments = comments;
        this.className = (0, util_1.recase)(this.tableName, true);
    }
    /**
     * 构建数据
     */
    build() {
        return __awaiter(this, void 0, void 0, function* () {
            const modelData = yield this.buildModel();
            const defineData = yield this.buildDefine();
            return { modelData, defineData };
        });
    }
    /**
     * 构建model类的数据
     */
    buildModel() {
        return __awaiter(this, void 0, void 0, function* () {
            const modelStub = yield this.stubReader.readModelStubContent();
            let i = 0;
            const content = {};
            for (i; i < this.tableColumns.length; i += 1) {
                content[this.tableColumns[i].Field] = {};
                if (this.tableColumns[i].Extra) {
                    if (this.tableColumns[i].Extra === 'auto_increment') {
                        content[this.tableColumns[i].Field].autoIncrement = true;
                    }
                    else {
                        content[this.tableColumns[i].Field][this.tableColumns[i].Extra] = true;
                    }
                }
                if (this.tableColumns[i].Key === 'PRI') {
                    content[this.tableColumns[i].Field].primaryKey = true;
                }
                content[this.tableColumns[i].Field].allowNull = this.tableColumns[i].Null !== 'NO';
                // if (this.tableColumns[i].Type.indexOf('varchar') === 0) {
                //   content[this.tableColumns[i].Field].type = 'DataTypes.STRING(' + this.tableColumns[i].Type.replace(/[^0-9]/ig, '') + ')';
                // }
                // if (this.tableColumns[i].Type.indexOf('int') === 0 || this.tableColumns[i].Type.indexOf('tinyint') === 0) {
                //   content[this.tableColumns[i].Field].type = 'DataTypes.INTEGER';
                // }
                // if (this.tableColumns[i].Type.indexOf('longtext') === 0) {
                //   content[this.tableColumns[i].Field].type = 'LONGTEXT';
                // }
                content[this.tableColumns[i].Field].type = this.getSqType(this.tableColumns[i].Type);
                if (this.tableColumns[i].Default) {
                    content[this.tableColumns[i].Field].defaultValue = isNaN(Number(this.tableColumns[i].Default)) ? this.tableColumns[i].Default : Number(this.tableColumns[i].Default);
                }
                const comment = this.comments.find(o => o.name === this.tableColumns[i].Field);
                if (comment) {
                    content[this.tableColumns[i].Field].comment = comment.comment;
                }
            }
            const json = JSON.stringify(content, null, '\t');
            const parse_content = json.replace(/\"([^\")"]+)\":/g, '$1:').replace(/"(DataTypes.*)"/g, '$1');
            const format = this.render(modelStub, { classname: this.className, tablename: this.tableName, attribute: parse_content });
            return format;
        });
    }
    /**
   * 构建define文件的数据
   */
    buildDefine() {
        return __awaiter(this, void 0, void 0, function* () {
            const defineStub = yield this.stubReader.readDefineStubContent();
            // const data_stub = this.stubs_content['data.stub'];
            const content = {};
            let i = 0;
            for (i; i < this.tableColumns.length; i += 1) {
                const name = this.tableColumns[i].Field + '?';
                let value = '';
                // if (this.tableColumns[i].Type.indexOf('varchar') === 0) {
                //   value = 'string';
                // }
                // if (this.tableColumns[i].Type.indexOf('int') === 0 || this.tableColumns[i].Type.indexOf('tinyint') === 0) {
                //   value = 'number';
                // }
                // if (this.tableColumns[i].Type.indexOf('longtext') === 0) {
                //   value = 'any';
                // }
                content[name] = this.getTypeScriptFieldType(this.tableColumns[i].Type);
            }
            const json = JSON.stringify(content, null, '\t');
            const parse_content = json.replace(/\"([^(\")"]+)\":/g, '$1:').replace(/"([^(\")"]+)"/g, '$1').replace(/,/g, ';');
            return this.render(defineStub, { classname: this.className, attribute: parse_content });
        });
    }
    /** Get the sequelize type from the Field */
    getSqType(fieldType) {
        const type = fieldType.toLowerCase();
        const length = type.match(/\(\d+\)/);
        const precision = type.match(/\(\d+,\d+\)/);
        let val = null;
        let typematch = null;
        if (type === "boolean" || type === "bit(1)" || type === "bit") {
            val = 'DataTypes.BOOLEAN';
        }
        else if (typematch = type.match(/^(bigint|smallint|mediumint|tinyint|int)/)) {
            // integer subtypes
            val = 'DataTypes.' + (typematch[0] === 'int' ? 'INTEGER' : typematch[0].toUpperCase());
            if (/unsigned/i.test(type)) {
                val += '.UNSIGNED';
            }
            if (/zerofill/i.test(type)) {
                val += '.ZEROFILL';
            }
        }
        else if (type.match(/n?varchar|string|varying/)) {
            val = 'DataTypes.STRING' + (!lodash_1.default.isNull(length) ? length : '');
        }
        else if (type.match(/^n?char/)) {
            val = 'DataTypes.CHAR' + (!lodash_1.default.isNull(length) ? length : '');
        }
        else if (type.match(/^real/)) {
            val = 'DataTypes.REAL';
        }
        else if (type.match(/text$/)) {
            val = 'DataTypes.TEXT' + (!lodash_1.default.isNull(length) ? length : '');
        }
        else if (type === "date") {
            val = 'DataTypes.DATEONLY';
        }
        else if (type.match(/^(date|timestamp)/)) {
            val = 'DataTypes.DATE' + (!lodash_1.default.isNull(length) ? length : '');
        }
        else if (type.match(/^(time)/)) {
            val = 'DataTypes.TIME';
        }
        else if (type.match(/^(float|float4)/)) {
            val = 'DataTypes.FLOAT' + (!lodash_1.default.isNull(precision) ? precision : '');
        }
        else if (type.match(/^decimal/)) {
            val = 'DataTypes.DECIMAL' + (!lodash_1.default.isNull(precision) ? precision : '');
        }
        else if (type.match(/^money/)) {
            val = 'DataTypes.DECIMAL(19,4)';
        }
        else if (type.match(/^smallmoney/)) {
            val = 'DataTypes.DECIMAL(10,4)';
        }
        else if (type.match(/^(float8|double|numeric)/)) {
            val = 'DataTypes.DOUBLE' + (!lodash_1.default.isNull(precision) ? precision : '');
        }
        else if (type.match(/^uuid|uniqueidentifier/)) {
            val = 'DataTypes.UUID';
        }
        else if (type.match(/^jsonb/)) {
            val = 'DataTypes.JSONB';
        }
        else if (type.match(/^json/)) {
            val = 'DataTypes.JSON';
        }
        else if (type.match(/(binary|image|blob)/)) {
            val = 'DataTypes.BLOB';
        }
        else if (type.match(/^hstore/)) {
            val = 'DataTypes.HSTORE';
        }
        return val;
    }
    getTypeScriptFieldType(type) {
        const fieldType = type.toLowerCase();
        let jsType;
        if (this.isString(fieldType)) {
            jsType = 'string';
        }
        else if (this.isNumber(fieldType)) {
            jsType = 'number';
        }
        else if (this.isBoolean(fieldType)) {
            jsType = 'boolean';
        }
        else if (this.isDate(fieldType)) {
            jsType = 'Date';
        }
        else if (this.isEnum(fieldType)) {
            const values = fieldType.substring(5, fieldType.length - 1).split(',').join(' | ');
            jsType = values;
        }
        else {
            console.log(`Missing TypeScript type: ${fieldType}`);
            jsType = 'any';
        }
        return jsType;
    }
    isNumber(fieldType) {
        return /^(smallint|mediumint|tinyint|int|bigint|float|money|smallmoney|double|decimal|numeric|real)/.test(fieldType);
    }
    isBoolean(fieldType) {
        return /^(boolean|bit)/.test(fieldType);
    }
    isDate(fieldType) {
        return /^(date|time|timestamp)/.test(fieldType);
    }
    isString(fieldType) {
        return /^(char|nchar|string|varying|varchar|nvarchar|text|longtext|mediumtext|tinytext|ntext|uuid|uniqueidentifier)/.test(fieldType);
    }
    isArray(fieldType) {
        return /^(array)/.test(fieldType);
    }
    isEnum(fieldType) {
        return /^(enum)/.test(fieldType);
    }
    /**
     * 替换模板内容
     * @param stubs 模板内容
     * @param arr 需要替换的内容
     */
    render(stubs, arr) {
        const replaceKey = [];
        const str = [];
        for (const key of Object.keys(arr)) {
            replaceKey.push(key);
            let val = '';
            val = arr[key];
            str.push(val);
        }
        let format = stubs;
        for (let i = 0; i < replaceKey.length; i++) {
            const reg = new RegExp('\\${' + replaceKey[i] + '}', 'g');
            format = format.replace(reg, str[i]);
        }
        return format;
    }
}
exports.AutoBuilder = AutoBuilder;
//# sourceMappingURL=auto-builder.js.map