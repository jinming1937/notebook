import {md2HTML} from './view/md2html';
import { $dom, $parentDom } from './util';
import { getFile } from './net/file';
import { getFileList } from './net/content';
import { IContent } from './entity/common';

window.onload = (e) => {
  console.log('frame ready');
  // let flag: any = 0;
  if ($parentDom('inputBox')) {

    //子页面接收消息，并且做出回应
    window.addEventListener('message', function(e) {
      if(e.origin == "http://localhost:8080") {
        // console.log(e.data);//可以对数据进行处理
        if (typeof e.data === 'string') {
          $dom('frameBox')!.innerHTML = md2HTML(e.data || '');
        }
        // e.source?.postMessage("确认收到消息", {targetOrigin: "http://localhost:8080"});
      }
    });
    {
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
  } else {

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

    $dom('hiddenHeader')!.className = 'selectHeader';
    $dom('frameBox')!.className = 'frameBox viewPage';
    $dom('fileContent')!.addEventListener('change', (e) => {
      const id = (e.target as HTMLSelectElement)?.value;
      if (id && id !== '-1') {
        getFile(parseInt(id)).then((data) => {
          if (data) {
            $dom('frameBox')!.innerHTML = md2HTML(data.content || '');
          } else {
            $dom('frameBox')!.innerHTML = md2HTML('');
          }
        });
      }
    })
  }
};
