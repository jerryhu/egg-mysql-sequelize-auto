export declare class StubReader {
    stubPath: string;
    constructor();
    readModelStubContent(): Promise<string>;
    readDefineStubContent(): Promise<string>;
    isFileExisted(filePath: string): Promise<unknown>;
}
