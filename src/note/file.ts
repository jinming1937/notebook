import { IContent } from "@/entity/common";
import { getFile } from "@/net/file";
import { $dom, decodeText, sendToFrame } from "@/util";
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
    html += `<li key="${content.id}" index="${index}" class="${classList.join(' ').trim()}" title="${content.name}">${content.name}${suffix}<s index="${index}">删</s></li>`
  });
  $dom<HTMLDivElement>(IDS.FileList)!.innerHTML = html;
}

export function clearFile() {
  $dom<HTMLDivElement>(IDS.FileList)!.innerHTML = '';
  $dom<HTMLInputElement>(IDS.Title)!.value = '';
  $dom<HTMLInputElement>(IDS.Title)?.blur();
  clearEditor()
}

export function clearEditor() {
  $dom<HTMLInputElement>(IDS.InputBox)!.value = '';
  $dom<HTMLInputElement>(IDS.InputBox)?.blur();
}

export function clearContent() {
  $dom<HTMLDivElement>(IDS.TreeContent)!.innerHTML = '';
}


const sender = sendToFrame();
export function readFile(currentFile: IContent) {
  $dom<HTMLInputElement>(IDS.Title)!.value = currentFile.name;
  if (currentFile.type === 'file') {
    getFile<{content: string}>(currentFile.id).then((data) => {
      const text = decodeText(data ? data.content : '');
      $dom<HTMLInputElement>(IDS.InputBox)!.value = text;
      sender(text)
    });
  } else {
    sender('')
  }
}
