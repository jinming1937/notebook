import { IContent } from "@/entity/common";
import { getFile } from "@/net/file";
import { $dom, IDS, sendToFrame } from "@/util";

const sender = sendToFrame();
export function readFile(currentFile: IContent) {
  $dom<HTMLInputElement>(IDS.Title)!.value = currentFile.name;
  if (currentFile.type === 'file') {
    getFile(currentFile.id).then((data) => {
      $dom<HTMLInputElement>(IDS.InputBox)!.value = data.content || '';
      sender(data.content || '')
    });
  } else {
    sender('')
  }
}
