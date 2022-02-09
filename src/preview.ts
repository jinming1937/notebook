import {md2HTML} from './view/md2html';
import { $dom, $parentDom } from './util';

window.onload = (e) => {
  console.log('frame ready');
  let flag: any = 0;
  $parentDom('inputBox')!.addEventListener("input", (e) => {
    clearTimeout(flag);
    flag = setTimeout(() => {
      console.log('debounce');
      $dom('frameBox')!.innerHTML = md2HTML((e.target as HTMLInputElement).value);
    }, 380);
  });
  $parentDom('inputBox')!.addEventListener("change", (e) => {
    console.log('change');
    clearTimeout(flag);
    flag = setTimeout(() => {
      console.log('debounce');
      $dom('frameBox')!.innerHTML = md2HTML((e.target as HTMLInputElement).value);
    }, 100);
  });
  {
    // console.log($parentDom('theme')!.checked);
    const bgFlag = ($parentDom('theme') as HTMLInputElement)!.checked
    if (bgFlag) {
      $dom('frameBox')!.className = 'frameBox dark';
    } else {
      $dom('frameBox')!.className = 'frameBox light';
    }
  }

  $parentDom('theme')!.addEventListener("change", (e) => {
    if ((e.target as HTMLInputElement).checked) {
      $dom('frameBox')!.className = 'frameBox dark';
    } else {
      $dom('frameBox')!.className = 'frameBox light';
    }
  })
};
