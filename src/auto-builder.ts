import _, { isDate } from "lodash";
import { TableColumn, TableColumnComment, ModelContent, DefineContent, BuildResult } from './types';
import { StubReader } from './stub-reader';
import { recase } from './util';


export class AutoBuilder {
  stubReader: StubReader;
  tableName: string;
  className: string;
  tableColumns: TableColumn[];
  comments: TableColumnComment[];

  constructor(tableName: string, tableColumns: TableColumn[], comments: TableColumnComment[]) {
    this.stubReader = new StubReader();
    this.tableName = tableName;
    this.tableColumns = tableColumns;
    this.comments = comments;
    this.className = recase(this.tableName, true);
  }

  /**
   * 构建数据
   */
  public async build(): Promise<BuildResult> {
    const modelData = await this.buildModel();
    const defineData = await this.buildDefine();
    return { modelData, defineData};
  }

  /**
   * 构建model类的数据
   */
  private async buildModel(): Promise<string>{
    const modelStub = await this.stubReader.readModelStubContent();

    let i = 0;
    const content: ModelContent = {};
    for (i; i < this.tableColumns.length; i += 1) {
      content[this.tableColumns[i].Field] = {};
      if (this.tableColumns[i].Extra) {
        if (this.tableColumns[i].Extra === 'auto_increment') {
          content[this.tableColumns[i].Field].autoIncrement = true;
        } else {
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
      if(comment){
        content[this.tableColumns[i].Field].comment = comment.comment;
      }
    }
    const json = JSON.stringify(content, null, '\t');

    const parse_content = json.replace(/\"([^\")"]+)\":/g, '$1:').replace(/"(DataTypes.*)"/g, '$1');
    const format = this.render(modelStub, { classname: this.className, tablename: this.tableName, attribute: parse_content });

    return format;
  }

    /**
   * 构建define文件的数据
   */
  private async buildDefine(): Promise<string>{
    const defineStub = await this.stubReader.readDefineStubContent();
    // const data_stub = this.stubs_content['data.stub'];
    const content: DefineContent = {};
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
  }

    /** Get the sequelize type from the Field */
    private getSqType(fieldType: string): string {
      const type: string = fieldType.toLowerCase();
      const length = type.match(/\(\d+\)/);
      const precision = type.match(/\(\d+,\d+\)/);
      let val = null;
      let typematch = null;
  
      if (type === "boolean" || type === "bit(1)" || type === "bit") {
        val = 'DataTypes.BOOLEAN';
      } else if (typematch = type.match(/^(bigint|smallint|mediumint|tinyint|int)/)) {
        // integer subtypes
        val = 'DataTypes.' + (typematch[0] === 'int' ? 'INTEGER' : typematch[0].toUpperCase());
        if (/unsigned/i.test(type)) {
          val += '.UNSIGNED';
        }
        if (/zerofill/i.test(type)) {
          val += '.ZEROFILL';
        }
      } else if (type.match(/n?varchar|string|varying/)) {
        val = 'DataTypes.STRING' + (!_.isNull(length) ? length : '');
      } else if (type.match(/^n?char/)) {
        val = 'DataTypes.CHAR' + (!_.isNull(length) ? length : '');
      } else if (type.match(/^real/)) {
        val = 'DataTypes.REAL';
      } else if (type.match(/text$/)) {
        val = 'DataTypes.TEXT' + (!_.isNull(length) ? length : '');
      } else if (type === "date") {
        val = 'DataTypes.DATEONLY';
      } else if (type.match(/^(date|timestamp)/)) {
        val = 'DataTypes.DATE' + (!_.isNull(length) ? length : '');
      } else if (type.match(/^(time)/)) {
        val = 'DataTypes.TIME';
      } else if (type.match(/^(float|float4)/)) {
        val = 'DataTypes.FLOAT' + (!_.isNull(precision) ? precision : '');
      } else if (type.match(/^decimal/)) {
        val = 'DataTypes.DECIMAL' + (!_.isNull(precision) ? precision : '');
      } else if (type.match(/^money/)) {
        val = 'DataTypes.DECIMAL(19,4)';
      } else if (type.match(/^smallmoney/)) {
        val = 'DataTypes.DECIMAL(10,4)';
      } else if (type.match(/^(float8|double|numeric)/)) {
        val = 'DataTypes.DOUBLE' + (!_.isNull(precision) ? precision : '');
      } else if (type.match(/^uuid|uniqueidentifier/)) {
        val = 'DataTypes.UUID';
      } else if (type.match(/^jsonb/)) {
        val = 'DataTypes.JSONB';
      } else if (type.match(/^json/)) {
        val = 'DataTypes.JSON';
      } else if (type.match(/(binary|image|blob)/)) {
        val = 'DataTypes.BLOB';
      } else if (type.match(/^hstore/)) {
        val = 'DataTypes.HSTORE';
      }
      return val as string;
    }

  private getTypeScriptFieldType(type: string) {
    const fieldType = type.toLowerCase();
    let jsType: string;
    if (this.isString(fieldType)) {
      jsType = 'string';
    } else if (this.isNumber(fieldType)) {
      jsType = 'number';
    } else if (this.isBoolean(fieldType)) {
      jsType = 'boolean';
    } else if (this.isDate(fieldType)) {
      jsType = 'Date';
    } else if (this.isEnum(fieldType)) {
      const values = fieldType.substring(5, fieldType.length - 1).split(',').join(' | ');
      jsType = values;
    } else {
      console.log(`Missing TypeScript type: ${fieldType}`);
      jsType = 'any';
    }
    return jsType;
  }

  private isNumber(fieldType: string): boolean {
    return /^(smallint|mediumint|tinyint|int|bigint|float|money|smallmoney|double|decimal|numeric|real)/.test(fieldType);
  }

  private isBoolean(fieldType: string): boolean {
    return /^(boolean|bit)/.test(fieldType);
  }

  private isDate(fieldType: string): boolean {
    return /^(date|time|timestamp)/.test(fieldType);
  }

  private isString(fieldType: string): boolean {
    return /^(char|nchar|string|varying|varchar|nvarchar|text|longtext|mediumtext|tinytext|ntext|uuid|uniqueidentifier)/.test(fieldType);
  }

  private isArray(fieldType: string): boolean {
    return /^(array)/.test(fieldType);
  }

  private isEnum(fieldType: string): boolean {
    return /^(enum)/.test(fieldType);
  }

  /**
   * 替换模板内容
   * @param stubs 模板内容
   * @param arr 需要替换的内容
   */
  private render(stubs:string, arr:any) {
    const replaceKey:Array<string> = [];
    const str:Array<string> = [];

    for (const key of Object.keys(arr)) {
      replaceKey.push(key);
      let val : string = '';
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