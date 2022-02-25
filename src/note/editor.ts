import { $dom, down } from "@/util";

function timeTheme () {
  const frame = $dom<HTMLDivElement>("page");
  const theme = $dom<HTMLInputElement>("theme");
  const nowHours = new Date().getHours();
  if (nowHours > 6 && nowHours < 18) {
    frame!.className = "light";
    theme!.checked = false;
  } else {
    frame!.className = "dark";
    theme!.checked = true;
  }
}

function registerTheme() {
  const frame = $dom<HTMLDivElement>("page");
  $dom<HTMLInputElement>('theme')!.addEventListener("change", (e) => {
    if ((e.target as HTMLInputElement)!.checked) {
      frame!.className = "dark";
    } else {
      frame!.className = "light";
    }
  });
}

export function initEditor() {
  timeTheme();

  const inputBox = $dom<HTMLInputElement>('inputBox');
  const spellcheck = $dom<HTMLInputElement>('spellcheck');
  const fontSize = $dom<HTMLSelectElement>('fontSize');
  const downDom = $dom<HTMLInputElement>('down');
  const title = $dom<HTMLInputElement>('title');

  downDom!.addEventListener('click', () => {
    if (!inputBox!.value || !title!.value) {
      alert('please type [title] or [text] on the box!');
      return;
    }
    down(title!.value + '.md', inputBox!.value);
  });

  spellcheck!.addEventListener('change', (e: Event) => {
    if((e.target as HTMLInputElement)!.checked) {
      inputBox!.spellcheck = true;
    } else {
      inputBox!.spellcheck = false;
    }
  });

  {
    spellcheck!.checked = false;
    inputBox!.spellcheck = false;

    fontSize!.value = '14px';
    inputBox!.style.fontSize = fontSize!.value
  }

  fontSize!.addEventListener('change', (e) => {
    inputBox!.style.fontSize = (e.target as HTMLSelectElement)!.value;
  });

  registerTheme();

  document.addEventListener('visibilitychange', (e) => {
    if (!(document.hidden)) {
      console.log('notebook active!!');
      timeTheme();
    }
  })
}
