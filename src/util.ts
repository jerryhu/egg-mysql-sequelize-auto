import _ from "lodash";

/**
 * 字符串命名风格转换,将下划线转为驼峰
 * @param val 字符串
 * @param ucfirst 首字母是否大写（驼峰规则）
 */
export function recase(val: string, ucfirst = true) {
  if(ucfirst){
    return _.upperFirst(_.camelCase(val));
  }
  return _.camelCase(val);
  return val;
}