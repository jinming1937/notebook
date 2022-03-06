import {md2HTML} from './view/md2html';
import { $dom, $parentDom } from './util';
import { getFile } from './net/file';
import { getFileList } from './net/content';
import { IContent } from './entity/common';

window.addEventListener('load', () => {
  console.log('load ready');

  getFileList().then((data: IContent[]) =>  {
    if (Array.isArray(data) && data.length > 0) {
      data.forEach((item) => {
        if (item.type === 'file') {
          const option = document.createElement('option');
          option.innerText = item.name;
          option.value = String(item.id);
          console.log(item);
          $dom('fileContent')!.appendChild(option);
        }
      })
    }
  })

  // $dom('hiddenHeader')!.className = 'selectHeader';
  // $dom('frameBox')!.className = 'frameBox viewPage';
  // $dom('fileContent')!.addEventListener('change', (e) => {
  //   const id = (e.target as HTMLSelectElement)?.value;
  //   if (id && id !== '-1') {
  //     getFile(parseInt(id)).then((data) => {
  //       if (data) {
  //         $dom('frameBox')!.innerHTML = md2HTML(data.content || '');
  //       } else {
  //         $dom('frameBox')!.innerHTML = md2HTML('');
  //       }
  //     });
  //   }
  // })
});
