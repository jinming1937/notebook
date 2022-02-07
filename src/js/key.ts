export function randomNum() {
  return new Date().getTime() + parseInt((Math.random() * 1000).toFixed(0));
}

export const $dom = <T extends HTMLElement>(str: string) => {
  const dom = document.getElementById(str);
  if (dom) {
    return dom as T;
  } else {
    return null;
  }
};

export const $parentDom = <T extends HTMLElement>(str: string) => {
  const dom = window.parent.document.getElementById(str);
  if (dom) {
    return dom as T;
  } else {
    return null;
  }
}
