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
  const scriptList: string[] = [];
  //子页面接收消息，并且做出回应
  window.addEventListener('message', function(e) {
    const origin = window.parent.location.origin;
    if([origin, `${origin}/link.html`].indexOf(e.origin) !== -1) {
      console.log('收到父页面消息：', e.data ? e.data.slice(0, 10) + '...' : '');
      if (typeof e.data === 'string') {
        scriptList.length = 0; // 清空
        const [htmlString, ...codeStringArray] = md2HTML(e.data || '');
        scriptList.push(...codeStringArray);
        $dom('frameBox')!.innerHTML = htmlString;
      }
    }
  });

  window.parent.postMessage({msg: 'preview page ready'}, location.origin);

  timeTheme();

  $dom('frameBox')?.addEventListener("click", (e) => {
    const runScriptIndex: number = Number(e.target && (e.target as HTMLElement).getAttribute('data-codeindex') || '-1') ?? -1;
    if (runScriptIndex !== -1 && Array.isArray(scriptList) && scriptList[runScriptIndex]) {
      const code = scriptList[runScriptIndex];
      new Promise(() => {
        console.log('code:', code);
        eval(code);
      }).catch((error) => {
        console.error('eval script error', error, '\n', code);
      })
    }
    // const scriptList = $dom('frameBox')?.querySelectorAll('script');
    // if (scriptList && scriptList.length > 0) {
    //   scriptList?.forEach((scr) => {
    //     if (scr.innerText) {
    //       new Promise(() => {
    //         const div = document.createElement('div');
    //         div.innerHTML = scr.innerText;
    //         const code = div.innerText; // 过滤标签
    //         eval(code);
    //       }).catch((error) => {
    //         console.error('eval script error', error);
    //       })
    //     }
    //   });
    // }
  })

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
