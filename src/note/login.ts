import { heatBit, login, logout } from "@/net/safe";
import { $dom, sendToFrame } from "@/util"
import { renderContentTree } from "./content";
import { clearFile } from "./fileList";

function animate(callback: () => void, timeGap: number, immediately: boolean) {
  let nowTime = Date.now();
  let flag = 0;
  const fn = () => {
    return window.requestAnimationFrame(() => {
      if (Date.now() - nowTime > timeGap) {
        nowTime = Date.now();
        console.log('heat bit');
        callback();
      }
      start();
    });
  }

  const stop = () => {
    window.cancelAnimationFrame(flag);
  };
  const start = () => {
    stop()
    flag = fn();
  }
  if (immediately) {
    callback();
    start()
  }
  return [start, stop];
}

export const initLogin = () => {
  let isLogin = false;
  const sender = sendToFrame()
  const [start, stop] = animate(() => {
    heatBit().then((data) => {
      if (data !== 0) { // 登录态过期
        $dom('mask')!.className = 'mask';
        $dom('pwd')?.focus();
        stop();
        clearFile();
        sender('');
        isLogin = false;
      } else {
        if (!isLogin){ // 登录态正常，但是页面未初始化
          isLogin = true;
          $dom('mask')!.className = 'mask hidden';
        }
      }
    });
  }, 10000, true);

  function loginEvent() {
    const pwd = $dom<HTMLInputElement>('pwd')!.value;
    if (pwd) {
      login(pwd).then((data) => {
        if (data) {
          $dom('mask')!.className = 'mask hidden';
          $dom<HTMLInputElement>('pwd')!.value = '';
          isLogin = true;
          renderContentTree();
          start()
        } else {
          alert('password was wrong!!');
        }
      });
    } else {
      alert('please input password!!');
    }
  }

  $dom('login')?.addEventListener('click', (e) => {
    loginEvent();
  });

  $dom('logout')?.addEventListener('click', (e) => {
    logout().then(() => {
      stop();
      clearFile();
      sender('');
      $dom('mask')!.className = 'mask';
      $dom('pwd')?.focus();
      isLogin = false
    });
  });

  $dom('pwd')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      loginEvent();
    }
  });

  document.addEventListener('visibilitychange', (e) => {
    if (!isLogin) return;
    if (document.hidden) {
      // 停止
      stop();
    } else {
      // 发送心跳
      start();
    }
  })
}
