import { $dom, sendToFrame } from './util';
import { initLogin } from './note/login';
import { getFileById, searchFileByKey } from './net/file';
import { registerTheme, setBg } from './note/editor';

window.addEventListener('load', () => {
  console.log('load ready');
  const sender = sendToFrame();

  $dom<HTMLIFrameElement>('frameDom')!.src = './preview.html';

  // 安全管理
  initLogin(() => {});

  registerTheme();
  setBg();

  $dom('search')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const key = (e.target as HTMLInputElement).value;
      if (key) {
        searchFileByKey<{id: number; content: string}[]>(key).then((data) => {
          if (Array.isArray(data)) {
            let html = '';
            data.forEach((item) => {
              html += `<li key="${item.id}">${item.content.slice(0, 30)}...</li>`;
            })
            $dom<HTMLUListElement>('searchResult')!.innerHTML = html;
          }
        });
      }
    }
  });

  $dom<HTMLUListElement>('searchResult')?.addEventListener('click', (e) => {
    const dom = e.target;
    if (dom && (dom as HTMLLIElement).getAttribute('key')?.match(/\d+/)) {
      const id = (dom as HTMLLIElement).getAttribute('key') || '';
      getFileById<{content: string}>(id).then((data) => {
        sender(data ? data.content : '')
      });
    }
  })
});
