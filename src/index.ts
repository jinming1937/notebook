import {initToolbar, initContent} from './js/note';
import {$dom} from './js/key';
// import './css/base.css';

window.onload = () => {
  console.log("dom ready");
  initToolbar();
  initContent();
  $dom<HTMLIFrameElement>('frameDom')!.src = './preview.html';
};
