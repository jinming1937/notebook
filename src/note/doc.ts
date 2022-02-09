import { IContent } from "@/entity/common";
import { $dom, getItemById, IDS } from "@/util";


function getFileById(id: number) {
  let content = null;
  try {
    const str = localStorage.getItem(`${id}`) || '';
    const obj = JSON.parse(str);
    if (obj) {
      content = obj;
    }
  } catch (error) {

  }
  return content;
}

export function readFile(id: number, list: IContent[]) {
  const curr = getItemById(id, list);
  if (curr !== null) {
    $dom<HTMLInputElement>(IDS.Title)!.value = curr.name;
    if (curr.type === 'file') {
      const content = getFileById(curr.id);
      if (content) {
        $dom<HTMLInputElement>(IDS.InputBox)!.value = content.text;
      } else {
        $dom<HTMLInputElement>(IDS.InputBox)!.value = '';
      }
    }
  }
}
