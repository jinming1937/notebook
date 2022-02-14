/**
 * MD to HTML
 */
import { randomNum } from "@/util"

// 匹配开头符号
const regMark = /^(.+?)\s/
// 匹配 # 开头
const regSharp = /^\#/
// 匹配 无序列表 -
const regCrossbar = /^\-/
// 匹配 有序列表 1. 2.
const regNumber = /^\d/
// 匹配行内：加粗，删除，下划线，颜色
const regContent = /([*~+=]{2})(.+?)\1/
const regGContent = /([*~+=]{2})(.+?)\1/g
// 行内 map
const TagMap = {
  '**': 'strong',
  '~~': 'del',
  '++': 'u',
  '==': 'span',
}
// 匹配行内链接
const regLink = /[\[](.+?)[\]][\(](.+?)[\)]/
const regGLink = /[\[](.+?)[\]][\(](.+?)[\)]/g

function format(content: string) {
  let strHtml = '';
  [regContent, regLink].forEach((item) => {
    const result = content.match(item);
    if (result) {
      const tag = result[1]
      const textOrLink = result[2]
      const index = result.index || 0;

      const prefix = content.slice(0, index);
      const suffix = content.slice(index + result[0].length);

      if (TagMap[tag]) {
        strHtml = `${prefix}<${TagMap[tag]}>${textOrLink}</${TagMap[tag]}>${suffix}`;
      } else {
        strHtml = `${prefix}<a href="${textOrLink}" target="_blank">${tag}</a>${suffix}`;
      }
    }
  });
  return strHtml;
}

function matchInline(content: string) {
  let formatContent = content;
  [regGContent, regGLink].forEach((item) => {
    const result = content.match(item);
    if (Array.isArray(result)) {
      result.forEach((time) => {
        formatContent = format(formatContent);
      });
    }
  });
  return formatContent;
}

function formatLine(lineStr: string) {
  if (lineStr === '') return ['', ''];
  const matchedTitle = lineStr.match(regMark);
  if (matchedTitle) {
    const mark = matchedTitle[1]
    const input = matchedTitle.input || ''
    const htmlList: string[] = [];
    [regSharp, regCrossbar, regNumber].forEach((item, index) => {
      // 匹配开头的，所以只会有一个test 成功！
      if (item.test(mark)) {
        const tag = index === 0 ? `h${mark.length}` : 'li'; // 转换成h1 h2等
        const tagContent = input.replace(regMark, "");

        const inner = matchInline(tagContent);
        htmlList.push(`<${tag}>${inner}</${tag}>`, tag);
      }
    });
    if (htmlList.length > 0) {
      return htmlList;
    }
  }

  const inline = matchInline(lineStr);
  if (inline.length > 0) {
    return [inline, 'p'];
  }

  // if (lineStr.match(/^```/)) {
  //   console.log('1122');
  //   return [`<code>`, 'code'];
  // }

  return [`<div>${lineStr}</div>`, 'div'];
}

export function md2HTML(mdStr = '') {
  if (!mdStr) return '';
  const strList = mdStr.trim().replace(/(^[\r\n]|[\r\n]$)/g, '').split(/[\r\n]/g);
  let htmlObj = {};
  let lastHtmlTag = '';
  let key = 0;
  strList.forEach((item) => {
    const [html, tag] = formatLine(item);
    if (!tag) {
      // no tag
      lastHtmlTag = '';
    } else if (tag === 'li') {
      if (lastHtmlTag === 'ul') {
        htmlObj[`${lastHtmlTag}-${key}`].push(html);
      } else {
        lastHtmlTag = 'ul';
        key = randomNum();
        htmlObj[`${lastHtmlTag}-${key}`] = [html];
      }
    } else {
      lastHtmlTag = tag;
      htmlObj[`${tag}-${randomNum()}`] = [html];
    }
  });

  let result = '';

  Object.keys(htmlObj).forEach((key) => {
    const [tag] = key.split('-');
    if (tag === 'ul') {
      result += `<ul>${htmlObj[key].join('')}</ul>`;
    } else {
      const dom = htmlObj[key][0];
      result += dom;
    }
  })

  return result;
}
