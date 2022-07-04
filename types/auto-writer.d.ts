import { BuildResult } from './types';
export declare class AutoWriter {
    buildResult: BuildResult;
    directory: string;
    tableName: string;
    overwrite: boolean;
    constructor(buildResult: BuildResult, directory: string, tableName: string, overwrite: boolean);
    /**
     * 生成文件
     */
    write(): Promise<void>;
    /**
     * 写入model文件
     * @param content 内容
     */
    private createModelFile;
    /**
     * 写入define文件
     * @param content 内容
     */
    private createDefineFile;
    /**
     * 判断model文件是否已生成
     */
    private isModelCreated;
}
