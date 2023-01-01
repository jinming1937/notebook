import {md2HTML} from './view/md2html';
import {$dom, $parentDom} from './util';
import './css/preview.less'

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
    if(["http://localhost:9292", "http://localhost:9292/link.html"].indexOf(e.origin) !== -1) {
      if (typeof e.data === 'string') {
        $dom('frameBox')!.innerHTML = md2HTML(e.data || '');

        setTimeout(() => {
          const scriptList = $dom('frameBox')?.querySelectorAll('script');
          if (scriptList && scriptList.length > 0) {
            scriptList?.forEach((scr) => {
              try {
                eval(scr.innerText);
              } catch (error) {
                console.error('eval script error', error);
              }
            });
          }
        }, 300);
      }
    }
  });

  window.parent.postMessage({msg: 'preview page ready'}, '*');

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
