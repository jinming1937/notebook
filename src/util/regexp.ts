// 匹配开头符号
export const regMark = /^([-#0-9*~+=.]+?)\s/
// 匹配 # 开头
export const regSharp = /^\#/
// 匹配 无序列表 -
export const regCrossbar = /^\-/
// 匹配 有序列表 1. 2.
export const regNumber = /^\d\./
// 匹配行内：加粗，删除，下划线，颜色
export const regContent = /([*~+=]{2})(.+?)\1/
export const regGContent = /([*~+=]{2})(.+?)\1/g
// 行内 map
export const TagMap = {
  '**': 'strong',
  '~~': 'del',
  '++': 'u',
  '==': 'span',
}
// 匹配行内链接
export const regLink = /[\[](.+?)[\]][\(](.+?)[\)]/
export const regGLink = /[\[](.+?)[\]][\(](.+?)[\)]/g

export const regCodeStart = /^`{3}[a-zA-Z]*/
export const regCodeEnd = /^`{3}$/
