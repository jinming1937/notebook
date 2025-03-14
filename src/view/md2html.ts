/**
 * MD to HTML
 */
import { randomNum } from "@/util"
import { regCheckBoxFalse, regCheckBoxTrue, regCode, regCodeEnd, regCodeStart, regContent, regCrossbar, regGCheckBoxFalse, regGCheckBoxTrue, regGCode, regGContent, regGImg, regGLink, regImg, regLink, regMark, regNumber, regSharp, TagMap } from "./regexp"
import { controlSaveWord, attributeSaveWord, declareSaveWord, savedWords } from "@/util/keyWords";

type IFormater = {
  html: string;
  tag: string;
  ct: string;
  macher: string;
  doubleSpace?: boolean;
}

const allMatch = new RegExp('(?=\\b(' + controlSaveWord.join('|') + ')\\b|\\b(' + declareSaveWord.join('|') + ')\\b|\\b(' + attributeSaveWord.join('|') + ')\\b)', 'ig');
const savedWordsMatch = new RegExp('\\b(' + savedWords.join('|')  + ')\\b', 'ig');

function getTextFromTag(codeStr: string) {
  const div = document.createElement('div');
  div.innerHTML = codeStr;
  const result = div.innerText.trim();
  return result.replace(/^\/(\/.*|[*].*[*]\/$)/g, ''); // 去掉注释
}

function superCode(content: string, codeType: string = '') {
  if (!content) return '';
  // if (['js', 'javascript'].indexOf(codeType.toLocaleLowerCase()) !== -1) {
  // }
  const text = content.replace(/[<]/g, '&lt;').replace(/[>]/g, '&gt;')
    .replace(savedWordsMatch, (matchWord) => {
      if (controlSaveWord.indexOf(matchWord) !== -1) return `<span class="pink">${matchWord}</span>`
      if (declareSaveWord.indexOf(matchWord) !== -1) return `<span class="blue">${matchWord}</span>`
      if (attributeSaveWord.indexOf(matchWord) !== -1) return `<span class="purple">${matchWord}</span>`
      return '';
    // .replace(allMatch, ($1, $2, $3) => {
    //   if ($1) return `<var class="pink">${$1}</var>`
    //   if ($2) return `<span class="blue">${$2}</span>`
    //   if ($3) return `<var class="purple">${$3}</var>`
    //   return '';
    })
  if (!text) return '';
  return '<code><pre>' + text + '</pre></code>';
}

function format(content: string) {
  let strHtml = '';
  [regContent, regLink, regImg, regCode, regCheckBoxTrue, regCheckBoxFalse].forEach((item, indexer) => {
    const result = content.match(item);
    if (result) {
      const tag = result[1] as keyof typeof TagMap;
      const textOrLink = result[2]
      const index = result.index || 0;

      const prefix = content.slice(0, index);
      const suffix = content.slice(index + result[0].length);

      if (TagMap[tag]) {
        strHtml = `${prefix}<${TagMap[tag]}>${textOrLink}</${TagMap[tag]}>${suffix}`;
      } else {
        if (result.input?.match(regImg)) {
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
  if (!mdStr || !(mdStr.trim())) return [''];
  /** 按行切分 */
  const strList = mdStr.trim().replace(/((^[\r\n])|([\r\n]$))/g, '').split(/[\r\n]/g);
  /** store */
  let htmlObj: { [key: string]: string[] } = {};
  /** 游标：html tag */
  let lastHtmlTag = '';
  /** 游标：匹配 */
  let lastMatcher = '';
  /** 游标：code tag */
  let lastCodeTag = '';
  /** random key */
  let key = 0;
  /** code type: js\ts\css\text etc. */
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
        htmlObj[`${lastCodeTag}-${key}`].push(html); // 不知为啥包个div了 T_T
      } else {
        lastCodeTag = 'code';
        key = randomNum();
        htmlObj[`${lastCodeTag}-${key}`] = [];
        (htmlObj[`${lastCodeTag}-${key}`] as unknown as { codeType: string }).codeType = codeType;
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

  // console.log(htmlObj);
  const codeList: string[] = [];
  let result = '';
  Object.keys(htmlObj).forEach((key) => {
    const [tag, nKey, matcher] = key.split('-');
    if (tag === 'ul') {
      result += `<ul>${htmlObj[key].join('')}</ul>`;
    } else if (tag === 'ol') {
      result += `<ol start="${matcher}">${htmlObj[key].join('')}</ol>`;
    } else if (tag === 'code') {
      const data = htmlObj[key];
      const codeType = (htmlObj[key] as unknown as { codeType: string }).codeType;
      const isJsCode = ['js', 'javascript'].indexOf(codeType.toLocaleLowerCase()) !== -1;
      const isCssCode = ['css'].indexOf(codeType.toLocaleLowerCase())!== -1;
      let codeStr = '';
      let codeIndex = -1;
      const tBody = data.map((item: string, index: number) => {
        isJsCode || isCssCode ? codeStr += getTextFromTag(item) : '';
        return `<tr><td class="codeNo">${index + 1}</td><td class="codeText">${item}</td></tr>`;
      }).join('');
      if (codeStr) {
        codeIndex = codeList.length;
        codeList.push(codeStr)
      }
      const table = `
      <div class="${codeType}-code">
        <table class="code">
          <colgroup>
            <col width="30">
            <col>
          </colgroup>
          <tbody>
            ${tBody}
          </tbody>
        </table>
        ${isJsCode && codeStr ? `<a class="code-run-btn" data-codeindex="${codeIndex}">Run</a>` : ''}
        ${isCssCode && codeStr ? `<style>${codeStr}</style>` : ''}
      </div>`
      // css style 标签注入风险: background-image url等
      result += table;
    } else if (!tag.match(/^h\d/)) { // 不是hx
      result += `<${tag}>${htmlObj[key].join('')}</${tag}>`
    } else {
      const dom = htmlObj[key][0];
      result += dom;
    }
  })
  codeList.unshift(result);
  return codeList;
}
