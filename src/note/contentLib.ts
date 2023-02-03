import { IContent } from "@/entity/common";
import { uploadImg } from "@/net/content";
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
      html+= `<li><div key="${content.id}" class="${content.active ? 'active': ''}" ${content.active ? 'draggable="true"' : ''}>${
        triangle(content.switch)
      }${icon(content.switch)}<span>${content.name}</span></div>${cache}</li>`
    } else if (content.type === 'content') {
      html += `<li class="${content.active ? 'active': ''}" ${content.active ? 'draggable="true"' : ''} key="${content.id}">${icon(false)}<span>${content.name}</span></li>`
    }
  });

  return html;
}

export function renderContent(list: IContent[]) {
  const html_ = createContentTree(list);
  $dom<HTMLDivElement>('treeContent')!.innerHTML = html_;
}

export function getItemById(id: number, list: IContent[]): IContent | null {
  let target: IContent | null = null;
  list.forEach((item) => {
    if (target !== null) return;
    if (id === item.id) {
      target = item;
    } else if (item.children && item.children.length > 0) {
      target = getItemById(id, item.children);
    }
  });

  return target;
}
export function uploadImgHandler(files: FileList, currentFile: IContent, callback: (v: string) => void) {
  const file = files[0];
  if (['image/png', 'image/jpeg'].indexOf(file.type) !== -1) {
    // 是一张图片
    if (file.type.toLowerCase().match(/(jpe?g|png|gif|webp)/g)) {
      const formData = new FormData()
      formData.append('img', file);
      uploadImg<{data: string[]}>(formData).then((data) => {
        if (data && currentFile) {
          const value = insertImg(data[0]);
          callback(value);
        }
      }).catch((error) => {
        console.log(error);
      });
    }
  }
}
export function insertImg(img: string) {
  const host = 'http://m.lit.cn'; // 需要代理成127.0.0.1:9960,or Analysis图片服务
  const path = '/api/soft/static/';
  const index = $dom<HTMLTextAreaElement>('inputBox')?.selectionStart;
  const str = $dom<HTMLTextAreaElement>('inputBox')!.value
  const value = str.slice(0, index) + `![图片](${host}${path}${img})` + str.slice(index);
  $dom<HTMLTextAreaElement>('inputBox')!.value = value;
  return value;
}
export function createShadowElement() {
  var element = document.createElement("div");
  element.className = "shadow";
  element.id = "shadowElement";
  return element;
}
export function removeShadowElement() {
  var element = document.querySelectorAll(".shadow");
  if (element.length > 0) {
    element.forEach((item) => {
      item.parentElement?.removeChild(item);
    })
  }
}
