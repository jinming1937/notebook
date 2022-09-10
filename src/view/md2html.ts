/**
 * MD to HTML
 */
import { randomNum } from "@/util"
import { regCheckBoxFalse, regCheckBoxTrue, regCode, regCodeEnd, regCodeStart, regContent, regCrossbar, regGCheckBoxFalse, regGCheckBoxTrue, regGCode, regGContent, regGImg, regGLink, regImg, regLink, regMark, regNumber, regSharp, TagMap } from "@/util/regexp"
import { controlSaveWord, attributeSaveWord, declareSaveWord } from "@/util/keyWords";

type IFormater = {
  html: string;
  tag: string;
  ct: string;
  macher: string;
  doubleSpace?: boolean;
}

const allMatch = new RegExp('\\b((' + controlSaveWord.join('|') + ')|(' + declareSaveWord.join('|') + ')|(' + attributeSaveWord.join('|') + '))\\b', 'ig');

function superCode(content: string, codeType: string = '') {
  if (!content) return '';
  // if (codeType.toLocaleLowerCase() === 'html') {
  //   return '<code><pre>' + content.replace(/[<]/g, '&lt;').replace(/[>]/g, '&gt;') + '</pre></code>';
  // }
  const text = content.replace(/[<]/g, '&lt;').replace(/[>]/g, '&gt;')
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
  [regContent, regLink, regImg, regCode, regCheckBoxTrue, regCheckBoxFalse].forEach((item, indexer) => {
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
        } else if (indexer === 4 || indexer === 5) {
          strHtml = `${prefix}<input type="checkbox" readonly ${indexer === 4 ? 'checked': ''} />${suffix}`
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
  [regGContent, regGLink, regGImg, regGCode, regGCheckBoxTrue, regGCheckBoxFalse].forEach((item) => {
    const result = content.match(item);
    if (Array.isArray(result)) {
      result.forEach((time) => {
        formatContent = format(formatContent);
      });
    }
  });
  return formatContent;
}


function formatLine(lineStr: string, codeText: boolean, codeType: string): IFormater {

  if (lineStr.match(regCodeEnd)) return {html: '', tag: 'eCode', ct: '', macher: ''};

  if (codeText) return {html: superCode(lineStr, codeType), tag: 'sCode', ct: '', macher: ''};

  if (lineStr.match(regCodeStart)) return {html: '', tag: 'sCode', ct: lineStr.replace(/^`{3}([a-zA-Z]+)$/, '$1'), macher: ''};

  if (lineStr === '') return {html: '', tag: '', ct: '', macher: ''};

  const matchedTitle = lineStr.match(regMark);
  if (matchedTitle) {
    const mark = matchedTitle[1]
    const input = matchedTitle.input || ''
    const htmlList: string[] = [];
    const formater: IFormater = {
      html: '',
      tag: '',
      ct: '',
      macher: mark
    };
    [regSharp, regCrossbar, regNumber].forEach((item, index) => {
      // 匹配开头的，所以只会有一个test 成功！
      if (item.test(mark)) {
        const tag = index === 0 ? `h${mark.length}`  // 转换成h1 h2等
          :
          index === 1 ? 'li' : 'lx';

        const tagContent = input.replace(regMark, "");

        const inner = matchInline(tagContent);
        htmlList.push(`<${tag}>${inner}</${tag}>`, tag);
        formater.html = `<${tag}>${inner}</${tag}>`;
        formater.tag = tag;
        formater.macher = mark;
      }
    });
    if (htmlList.length > 0) {
      return formater;
    }
  }

  const inline = matchInline(lineStr);
  if (inline.length > 0) {
    return {html: inline, tag: 'p', ct: '', macher: '', doubleSpace: !!inline.match(/[\u0020]{2}$/)}; // 空格x2
  }

  return {html: `<div>${lineStr}</div>`, tag: 'div', ct: '', macher: ''};
}

export function md2HTML(mdStr = '') {
  if (!mdStr || !(mdStr.trim())) return '';
  const strList = mdStr.trim().replace(/((^[\r\n])|([\r\n]$))/g, '').split(/[\r\n]/g);
  let htmlObj = {};
  let lastHtmlTag = '';
  let lastMatcher = '';
  let lastCodeTag = '';
  let key = 0;
  let codeType = ''
  strList.forEach((item, index) => {
    const {html, tag, ct, macher, doubleSpace} = formatLine(item, lastCodeTag === 'code', codeType);
    if (tag !== 'li' && lastHtmlTag === 'ul' || tag !== 'lx' && lastHtmlTag === 'ol') {
      lastHtmlTag = '';
      lastMatcher = '';
    }
    if (!tag) {
      // no tag
      lastHtmlTag = '';
      lastCodeTag = '';
      lastMatcher = '';
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
        htmlObj[`${lastHtmlTag}-${key}-${lastMatcher}`].push(__html);
      } else {
        lastHtmlTag = 'ol';
        lastMatcher = macher.replace(/\.$/, '');
        key = randomNum();
        htmlObj[`${lastHtmlTag}-${key}-${lastMatcher}`] = [__html];
      }
    } else if (tag === 'sCode') {
      codeType = codeType || ct || '';
      if (lastCodeTag === 'code') {
        htmlObj[`${lastCodeTag}-${key}`].push(`<div>${html}</div>`);
      } else {
        lastCodeTag = 'code';
        key = randomNum();
        htmlObj[`${lastCodeTag}-${key}`] = [];
      }
    } else if (tag === 'eCode') {
      lastCodeTag = '';
      codeType = '';
    } else if (tag === 'p' && !doubleSpace) {
      if (lastHtmlTag === 'p' && htmlObj[`${tag}-${key}`]) {
        htmlObj[`${tag}-${key}`].push(html);
      } else {
        lastHtmlTag = tag;
        key = randomNum();
        htmlObj[`${tag}-${key}`] = [html];
      }
    } else {
      lastHtmlTag = '';
      htmlObj[`${tag}-${randomNum()}`] = [html];
    }
  });

  let result = '';
  Object.keys(htmlObj).forEach((key) => {
    const [tag, nKey, matcher] = key.split('-');
    if (tag === 'ul') {
      result += `<ul>${htmlObj[key].join('')}</ul>`;
    } else if (tag === 'ol') {
      result += `<ol start="${matcher}">${htmlObj[key].join('')}</ol>`;
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
      result += `<${tag}>${htmlObj[key].join('')}</${tag}>`
    } else {
      const dom = htmlObj[key][0];
      result += dom;
    }
  })

  return result;
}
