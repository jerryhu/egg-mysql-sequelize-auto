"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recase = void 0;
const lodash_1 = __importDefault(require("lodash"));
/**
 * 字符串命名风格转换,将下划线转为驼峰
 * @param val 字符串
 * @param ucfirst 首字母是否大写（驼峰规则）
 */
function recase(val, ucfirst = true) {
    if (ucfirst) {
        return lodash_1.default.upperFirst(lodash_1.default.camelCase(val));
    }
    return lodash_1.default.camelCase(val);
    return val;
}
exports.recase = recase;
//# sourceMappingURL=util.js.map