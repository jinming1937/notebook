import {md2HTML} from './view/md2html';
import { $dom, $parentDom } from './util';

function timeTheme() {
  const bgFlag = ($parentDom('theme') as HTMLInputElement)!.checked
  if (bgFlag) {
    $dom('frameBox')!.className = 'frameBox dark';
  } else {
    $dom('frameBox')!.className = 'frameBox light';
  }
}

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
    timeTheme();

    $parentDom('theme')!.addEventListener("change", (e) => {
      if ((e.target as HTMLInputElement).checked) {
        $dom('frameBox')!.className = 'frameBox dark';
      } else {
        $dom('frameBox')!.className = 'frameBox light';
      }
    })

    document.addEventListener('visibilitychange', (e) => {
      if (!(document.hidden)) {
        console.log('notebook active!!');
        timeTheme();
      }
    })
  }
};
