import { IContent } from "@/entity/common";

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

let flag: any = 0;
export function debounce(callback: () => void, timeFlag: number) {
  clearTimeout(flag);
  flag = setTimeout(() => {
    callback && callback()
  }, timeFlag);
}
