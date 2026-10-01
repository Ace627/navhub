/**
 * 判断值是否为布尔类型
 * @param value 待校验的值
 * @returns 是布尔值（含 Boolean 包装对象，如 new Boolean(false)）时返回 true
 */
export function isBoolean(value: any): value is boolean {
  return typeof value === 'boolean' || value instanceof Boolean
}

/**
 * 判断值是否为字符串类型
 * @param value 待校验的值
 * @returns 是字符串（含 String 包装对象，如 new String('x')）时返回 true
 */
export function isString(value: any): value is string {
  return typeof value === 'string' || value instanceof String
}
