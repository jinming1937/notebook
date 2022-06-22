/**
 * MD to HTML
 */
import { randomNum } from "@/util"
import { regCodeEnd, regCodeStart, regContent, regCrossbar, regGContent, regGImg, regGLink, regImg, regLink, regMark, regNumber, regSharp, TagMap } from "@/util/regexp"

function format(content: string) {
  let strHtml = '';
  [regContent, regLink, regImg].forEach((item) => {
    const result = content.match(item);
    if (result) {
      const tag = result[1]
      console.log(result, tag);
      const textOrLink = result[2]
      const index = result.index || 0;

      const prefix = content.slice(0, index);
      const suffix = content.slice(index + result[0].length);

      if (TagMap[tag]) {
        strHtml = `${prefix}<${TagMap[tag]}>${textOrLink}</${TagMap[tag]}>${suffix}`;
      } else {
        if (result.input?.match(/^\!/)) {
          strHtml = `${prefix.replace(/\!$/, '')}<img src="${textOrLink}" alt="${tag}" />${suffix}`;
        } else {
          strHtml = `${prefix}<a href="${textOrLink}" target="_blank">${tag}</a>${suffix}`;
        }
      }
    }
  });
  return strHtml;
}

function matchInline(content: string) {
  let formatContent = content;
  [regGContent, regGLink, regGImg].forEach((item) => {
    const result = content.match(item);
    if (Array.isArray(result)) {
      result.forEach((time) => {
        formatContent = format(formatContent);
      });
    }
  });
  return formatContent;
}

function formatLine(lineStr: string, singleText: boolean) {
  if (lineStr === '') return ['', ''];

  if (lineStr.match(regCodeEnd)) {
    console.log('1122');
    return ['', 'eCode'];
  }

  if (singleText) return [lineStr, 'sCode'];

  if (lineStr.match(regCodeStart)) {
    console.log('1122');
    return ['', 'sCode'];
  }

  const matchedTitle = lineStr.match(regMark);
  if (matchedTitle) {
    const mark = matchedTitle[1]
    const input = matchedTitle.input || ''
    const htmlList: string[] = [];
    [regSharp, regCrossbar, regNumber].forEach((item, index) => {
      // 匹配开头的，所以只会有一个test 成功！
      if (item.test(mark)) {
        const tag = index === 0 ? `h${mark.length}`
          :
          index === 1 ? 'li' : 'lx'; // 转换成h1 h2等
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

  return [`<div>${lineStr}</div>`, 'div'];
}

export function md2HTML(mdStr = '') {
  if (!mdStr || !(mdStr.trim())) return '';
  const strList = mdStr.trim().replace(/((^[\r\n])|([\r\n]$))/g, '').split(/[\r\n]/g);
  let htmlObj = {};
  let lastHtmlTag = '';
  let lastCodeTag = '';
  let key = 0;
  strList.forEach((item, index) => {
    const [html, tag] = formatLine(item, lastCodeTag === 'code');
    if (!tag) {
      // no tag
      lastHtmlTag = '';
      lastCodeTag = '';
    } else if (tag === 'li') {
      if (lastHtmlTag === 'ul') {
        htmlObj[`${lastHtmlTag}-${key}`].push(html);
      } else {
        lastHtmlTag = 'ul';
        key = randomNum();
        htmlObj[`${lastHtmlTag}-${key}`] = [html];
      }
    } else if (tag === 'lx') {
      const __html = html.replace('lx', 'li');
      if (lastHtmlTag === 'ol') {
        htmlObj[`${lastHtmlTag}-${key}`].push(__html);
      } else {
        lastHtmlTag = 'ol';
        key = randomNum();
        htmlObj[`${lastHtmlTag}-${key}`] = [__html];
      }
    } else if (tag === 'sCode') {
      if (lastCodeTag === 'code') {
        htmlObj[`${lastCodeTag}-${key}`].push(`<div>${html}</div>`);
      } else {
        lastCodeTag = 'code';
        key = randomNum();
        htmlObj[`${lastCodeTag}-${key}`] = [];
      }
    } else if (tag === 'eCode') {
      lastCodeTag = '';
    } else {
      lastHtmlTag = tag;
      htmlObj[`${tag}-${randomNum()}`] = [html];
    }
  });

  let result = '';
  // console.log(htmlObj);
  Object.keys(htmlObj).forEach((key) => {
    const [tag] = key.split('-');
    if (tag === 'ul') {
      result += `<ul>${htmlObj[key].join('')}</ul>`;
    } else if (tag === 'ol') {
      result += `<ol>${htmlObj[key].join('')}</ol>`;
    } else if (tag === 'code') {
      result += `<code>${htmlObj[key].join('')}</code>`;
    } else if (tag) {
      result += `<${tag}>${htmlObj[key][0]}</${tag}>`
    } else {
      const dom = htmlObj[key][0];
      result += dom;
    }
  })

  return result;
}
