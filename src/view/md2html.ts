/**
 * MD to HTML
 */
import { randomNum } from "@/util"
import { regCodeEnd, regCodeStart, regContent, regCrossbar, regGContent, regGImg, regGLink, regImg, regLink, regMark, regNumber, regSharp, TagMap } from "@/util/regexp"
import { controlSaveWord, attributeSaveWord, declareSaveWord } from "@/util/keyWords";

const allMatch = new RegExp('\\b((' + controlSaveWord.join('|') + ')|(' + declareSaveWord.join('|') + ')|(' + attributeSaveWord.join('|') + '))\\b', 'ig');

function superCode(content: string) {
  if (!content) return '';

  const text = content
    .replace(allMatch, ($1, $2, $3) => {
      if ($1) return `<var class="pink">${$1}</var>`
      if ($2) return `<var class="blue">${$2}</var>`
      if ($3) return `<var class="purple">${$3}</var>`
      return '';
    })
  if (!text) return '';
  return '<code><pre>' + text + '</pre></code>';
}

function format(content: string) {
  let strHtml = '';
  [regContent, regLink, regImg].forEach((item) => {
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
        if (result.input?.match(/^\!/)) {
          strHtml = `${prefix.replace(/\!$/, '')}<img src="${textOrLink}" alt="${tag}" />${suffix}`;
        } else {
          strHtml = `${prefix}<a href="${textOrLink}" target="_blank" ref="noreferrer noopener nofollow">${tag}</a>${suffix}`;
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

function formatLine(lineStr: string, codeText: boolean) {

  if (lineStr.match(regCodeEnd)) {
    return ['', 'eCode'];
  }

  if (codeText) return [superCode(lineStr), 'sCode'];

  if (lineStr.match(regCodeStart)) {
    return ['', 'sCode'];
  }

  if (lineStr === '') return ['', ''];

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
    if (tag !== 'li') {
      lastHtmlTag = '';
    }
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
  Object.keys(htmlObj).forEach((key) => {
    const [tag] = key.split('-');
    if (tag === 'ul') {
      result += `<ul>${htmlObj[key].join('')}</ul>`;
    } else if (tag === 'ol') {
      result += `<ol>${htmlObj[key].join('')}</ol>`;
    } else if (tag === 'code') {
      const tBody = htmlObj[key].map((item: string, index: number) => {
        return `<tr><td class="codeNo">${index + 1}</td><td class="codeText">${item}</td></tr>`;
      }).join('');
      const table = `
        <table class="code">
          <colgroup>
            <col width="30">
            <col>
          </colgroup>
          <tbody>
            ${tBody}
          </tbody>
        </table>
      `
      result += table;
    } else if (tag) {
      result += `${htmlObj[key][0]}`
    } else {
      const dom = htmlObj[key][0];
      result += dom;
    }
  })

  return result;
}
