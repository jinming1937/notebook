import { IContent } from "@/entity/common";
import { $dom } from "@/util";

const icon = (state: boolean | undefined) => `<span class="file_icon ${state ? 'open': 'close'}"></span>`;
const triangle = (state: boolean | undefined) => `<span class="triangle ${!state ? '' : 'close'}"></span>`;

/**
 * 生成目录树
 * @param list 目录list
 * @returns
 */
function createContentTree (list: IContent[]) {
  let html = ''
  const localActionContent = localStorage.getItem('content_action') || '[]';
  const actions = JSON.parse(localActionContent);
  list.forEach((content: IContent) => {
    content.switch = typeof content.switch === 'undefined' ? (actions.indexOf(`${content.id}`) === -1 ? true : false): content.switch;
    if (content.children && content.children.length > 0 && content.children.filter(item => item.type === 'content').length > 0) {
      const cache = `<ul class="subMenu ${content.switch ? '' : 'hidden'}">${createContentTree(content.children)}</ul>`;
      html+= `<li><div key="${content.id}" class="${content.active ? 'active': ''}">${triangle(content.switch)}${icon(content.switch)}<span>${content.name}</span></div>${cache}</li>`
    } else if (content.type === 'content') {
      html += `<li class="${content.active ? 'active': ''}" key="${content.id}">${icon(false)}<span>${content.name}</span></li>`
    }
  });

  return html;
}

export function renderContent(list: IContent[]) {
  const html_ = createContentTree(list);
  $dom('treeContent')!.innerHTML = html_;
}
