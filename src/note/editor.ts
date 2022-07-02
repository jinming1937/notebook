import { $dom, down } from "@/util";

function timeTheme () {
  const frame = $dom<HTMLDivElement>("page");
  const theme = $dom<HTMLInputElement>("theme");
  const nowHours = new Date().getHours();
  const className = frame!.className || 'light';
  if ($dom<HTMLInputElement>('upload')!.value) {
    return;
  }
  if (nowHours > 6 && nowHours < 20) {
    frame!.className = className.replace("dark", "light");
    theme!.checked = false;
  } else {
    frame!.className = className.replace("light","dark");
    theme!.checked = true;
  }
}

export function registerTheme() {
  const frame = $dom<HTMLDivElement>("page");
  $dom<HTMLInputElement>('theme')!.addEventListener("change", (e) => {
    const className = frame!.className;
    if ((e.target as HTMLInputElement)!.checked) {
      frame!.className = className.replace("light","dark");
    } else {
      frame!.className = className.replace("dark", "light");
    }
  });
}

export function setBg() {
  const upload = $dom<HTMLInputElement>('upload')
  upload!.addEventListener('change', (e: any) => {
    const value = e.target?.value;
    if (value) {
      // 是一张图片
      const file = e.target?.files[0];
      // 创建一个新的FileReader对象，用来读取文件信息
      var reader = new FileReader();
      // 读取用户上传的图片的路径
      reader.readAsDataURL(file);

      // 读取完毕之后，将图片的src属性修改成用户上传的图片的本地路径
      reader.onload = function (ev) {
        // $('#tipsContent').addClass('hide');
        console.log('upload success')
        if (value.toLowerCase().match(/\.(jpe?g|png|gif|webp)$/g)) {
          // $('#viewVideo').addClass('hide')
          // $('#viewImage').removeClass('hide').attr('src', reader.target.result);
          $dom('page')?.setAttribute('style', `background-image: url(${(ev as any).target.result})`);
          // const className = $dom('page')?.className;
          // $dom('page')?.setAttribute('class', className + ' ' + 'backImage');
          if (!$dom('page')?.classList.contains('backImage')) {
            $dom('page')?.classList.add('backImage');
          }
        // } else if (value.toLowerCase().match(/\.(mp4|mov)$/g)) {
          // $('#viewImage').addClass('hide');
          // $('#viewVideo').removeClass('hide').attr('src', reader.target.result);
        }
      }
    }
    // upload!.value = '';
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

  setBg();
}
