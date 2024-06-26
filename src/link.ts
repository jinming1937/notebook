import { $dom, encodeText, sendToFrame } from './util';
import { initLogin } from './note/login';
import { getFile, getFileById, searchFileByKey } from './net/file';
import { registerTheme, setTimeTheme } from '@/component/theme';
import { registerBg } from '@/component/background';
import './css/link.less'

window.addEventListener('load', () => {
  console.log('load ready');
  const sender = sendToFrame();

  $dom<HTMLIFrameElement>('frameDom')!.src = './preview.html';

  const tool = {
    page: $dom<HTMLDivElement>('page')!,
    frame: $dom<HTMLDivElement>("page")!,
    theme: $dom<HTMLInputElement>("theme")!,
    bg: $dom<HTMLInputElement>('upload')!,
  }

  // 安全管理
  initLogin(() => {
    console.log('login success');
    if(location.search.includes('id=')) {
      const id = location.search.split('id=')[1];
      getFile<{content: string}>(Number(id)).then((data) => {
        const text = decodeURI(data ? data.content : '');
        sender(text);
      });
    }
  }, () => {
    $dom<HTMLUListElement>('searchResult')!.innerHTML = '';
  });
  registerTheme(tool.frame, tool.theme);
  registerBg(tool.bg, tool.page);

  setTimeTheme(tool.frame, tool.theme);

  $dom('searchBookMarks')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const key = (e.target as HTMLInputElement).value;
      if (key) {
        searchFileByKey<{id: number; content: string}[]>(encodeText(key)).then((data) => {
          if (Array.isArray(data)) {
            let html = '';
            data.forEach((item) => {
              html += `<li key="${item.id}">${decodeURI(item.content).slice(0, 30)}...</li>`;
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
        const text = decodeURI(data ? data.content : '');
        sender(text)
      });
    }
  });
});
