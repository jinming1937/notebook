import { download } from '@/util';

export function registerDownload (down: HTMLInputElement, title: HTMLInputElement, inputBox: HTMLTextAreaElement) {

  down.addEventListener('click', () => {
    if (!inputBox!.value || !title!.value) {
      alert('please type [title] or [text] on the box!');
      return;
    }
    download(title!.value + '.md', inputBox!.value);
  });
}
