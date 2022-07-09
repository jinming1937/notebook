import { IContent } from "@/entity/common";
import { getFile } from "@/net/file";
import { $dom, sendToFrame } from "@/util";
import { IDS } from './ids';

const sender = sendToFrame();
export function readFile(currentFile: IContent) {
  $dom<HTMLInputElement>(IDS.Title)!.value = currentFile.name;
  if (currentFile.type === 'file') {
    getFile<{content: string}>(currentFile.id).then((data) => {
      $dom<HTMLInputElement>(IDS.InputBox)!.value = data ? data.content : '';
      sender(data ? data.content : '')
    });
  } else {
    sender('')
  }
}
