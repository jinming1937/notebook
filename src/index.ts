import { initNote } from './note';
import { $dom } from './util';

window.onload = () => {
  console.log("dom ready");
  initNote();
  $dom<HTMLIFrameElement>('frameDom')!.src = './preview.html';
};
