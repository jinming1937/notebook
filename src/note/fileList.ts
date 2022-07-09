import { IContent } from "@/entity/common";
import { $dom } from "@/util";
import { IDS } from './ids';

export function renderFileList(list: IContent[]) {
  let html = ''
  list.forEach((content: IContent, index: number) => {
    const classList = [];
    let suffix = '';
    if (content.type === 'file') {
      suffix += '.md';
      classList.push('file');
    }
    if (content.editing) {
      classList.push('active');
    }
    html += `<li key="${content.id}" class="${classList.join(' ').trim()}" title="${content.name}">${content.name}${suffix}<s index="${index}">删</s></li>`
  });
  $dom<HTMLDivElement>(IDS.FileList)!.innerHTML = html;
}

export function clearFile() {
  $dom<HTMLDivElement>(IDS.FileList)!.innerHTML = '';
  $dom<HTMLInputElement>(IDS.Title)!.value = '';
  $dom<HTMLInputElement>(IDS.Title)?.blur();
  $dom<HTMLInputElement>(IDS.InputBox)!.value = '';
  $dom<HTMLInputElement>(IDS.InputBox)?.blur();
}
