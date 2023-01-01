import { initNote } from './note';
import { $dom } from './util';
import './css/base.less'

window.onload = () => {
  console.log("dom ready");
  initNote();
  $dom<HTMLIFrameElement>('frameDom')!.src = './preview.html';
};
