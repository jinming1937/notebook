// 匹配开头符号
export const regMark = /^([-#0-9*~+=.]+?)\s/
// 匹配 # 开头
export const regSharp = /^\#/
// 匹配 无序列表 -
export const regCrossbar = /^(\-|\*)/
// 匹配 有序列表 1. 2.
export const regNumber = /^\d+\./
// 匹配行内：加粗，删除，下划线，颜色
export const regContent = /([*~+=]{2})(.+?)\1/
export const regGContent = /([*~+=]{2})(.+?)\1/g
// 匹配行内code
export const regCode = /([`]{3})(.+?)\1/
export const regGCode = /([`]{3})(.+?)\1/g
// 行内 map
export const TagMap = {
  '**': 'strong',
  '~~': 'del',
  '++': 'u',
  '==': 'b',
  '```': 'samp',
}
// 匹配行内链接
/**
 * [xxx](xxxx)
 * 后行断言：先是[]()结构，再到 不是!
*/
export const regLink = /(?<!\!)[\[](.*?)[\]][\(](.*?)[\)]/
/**
 * ![xxx](xxxx)
 * !后是 []()
*/
export const regImg = /(?<=\!)[\[](.+?)[\]][\(](.+?)[\)]/
export const regCheckBoxFalse = /\[\]/;
export const regCheckBoxTrue = /\[x\]/;
// 匹配行内链接
/**
 * G
 * [xxx](xxxx)
*/
export const regGLink = /(?<!\!)[\[](.+?)[\]][\(](.+?)[\)]/g
/**
 * G
 * ![xxx](xxxx)
*/
export const regGImg = /(?<=\!)[\[](.+?)[\]][\(](.+?)[\)]/g
export const regGCheckBoxFalse = /\[\]/g;
export const regGCheckBoxTrue = /\[x\]/g;

export const regCodeStart = /^`{3}[a-zA-Z]*$/
export const regCodeEnd = /^`{3}$/
