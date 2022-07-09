import { $dom } from '@/util/key';

export function setTimeTheme (frame: HTMLDivElement, theme: HTMLInputElement) {
  const nowHours = new Date().getHours();
  const className = frame!.className || 'light';
  if ($dom<HTMLInputElement>('upload')!.value) {
    return;
  }
  if (nowHours > 6 && nowHours < 19) {
    frame.className = className.replace("dark", "light");
    theme.checked = false;
  } else {
    frame.className = className.replace("light","dark");
    theme.checked = true;
  }
}

export function registerTheme(frame: HTMLDivElement, theme: HTMLInputElement) {
  theme.addEventListener("change", (e) => {
    const className = frame.className;
    if ((e.target as HTMLInputElement).checked) {
      frame.className = className.replace("light","dark");
    } else {
      frame.className = className.replace("dark", "light");
    }
  });

  document.addEventListener('visibilitychange', (e) => {
    if (!(document.hidden)) {
      console.log('notebook active!!');
      setTimeTheme(frame, theme);
    }
  })
}
