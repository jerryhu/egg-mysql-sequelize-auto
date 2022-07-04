import { TableColumn, TableColumnComment, BuildResult } from './types';
import { StubReader } from './stub-reader';
export declare class AutoBuilder {
    stubReader: StubReader;
    tableName: string;
    className: string;
    tableColumns: TableColumn[];
    comments: TableColumnComment[];
    constructor(tableName: string, tableColumns: TableColumn[], comments: TableColumnComment[]);
    /**
     * 构建数据
     */
    build(): Promise<BuildResult>;
    /**
     * 构建model类的数据
     */
    private buildModel;
    /**
   * 构建define文件的数据
   */
    private buildDefine;
    /** Get the sequelize type from the Field */
    private getSqType;
    private getTypeScriptFieldType;
    private isNumber;
    private isBoolean;
    private isDate;
    private isString;
    private isArray;
    private isEnum;
    /**
     * 替换模板内容
     * @param stubs 模板内容
     * @param arr 需要替换的内容
     */
    private render;
}
