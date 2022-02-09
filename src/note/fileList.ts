import { IContent } from "@/entity/common";
import { $dom, IDS } from "@/util";

export function renderFileList(list: IContent[]) {
  let html = ''
  list.forEach((content: IContent, index: number) => {
    const classList = [];
    let suffix = '';
    if (content.type === 'file') {
      suffix += '.md';
      classList.push('file');
    }
    if (content.active) {
      classList.push('active');
    }
    html += `<li key="${content.id}" class="${classList.join(' ').trim()}">${content.name}${suffix}<s index="${index}">删</s></li>`
  });
  $dom('fileList')!.innerHTML = html;
}

export function clearFile() {
  $dom<HTMLInputElement>(IDS.Title)!.value = '';
  $dom<HTMLInputElement>(IDS.InputBox)!.value = '';
}
