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

window.onload = (ev) => {
  console.log('frame ready');
  //子页面接收消息，并且做出回应
  window.addEventListener('message', function(e) {
    console.log(e);
    if(["http://localhost:8080", "http://localhost:8080/link.html"].indexOf(e.origin) !== -1) {
      // console.log(e.data); //可以对数据进行处理
      if (typeof e.data === 'string') {
        $dom('frameBox')!.innerHTML = md2HTML(e.data || '');
      }
    }
  });

  window.parent.postMessage({name: '给父页面发消息'}, '*');

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
};
