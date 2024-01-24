import { heatBit, login, logout } from "@/net/safe";
import { $dom, sendToFrame } from "@/util"

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

export const initLogin = (loginCb?: () => void, logoutCb?: () => void) => {
  let isLogin = false;
  const sender = sendToFrame()
  const [start, stop] = animate(() => {
    heatBit().then((data) => {
      if (data !== 0) { // 登录态过期
        $dom('mask')!.className = 'mask';
        $dom('pwd')?.focus();
        $dom<HTMLUListElement>('searchResult')!.innerHTML = '';
        stop();
        sender('');
        isLogin = false;
        logoutCb && logoutCb();
      } else {
        if (!isLogin){ // 登录态正常，但是页面未初始化
          isLogin = true;
          $dom('mask')!.className = 'mask hidden';
          loginCb && loginCb();
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
          start()
          loginCb && loginCb();
        } else {
          alert('password was wrong!!');
          $dom<HTMLInputElement>('pwd')!.select();
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
      logoutCb && logoutCb();
      sender('');
      $dom('mask')!.className = 'mask';
      $dom('pwd')?.focus();
      $dom<HTMLUListElement>('searchResult')!.innerHTML = '';
      isLogin = false
    });
  });

  $dom('pwd')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      loginEvent();
    }
  });

  document.addEventListener('visibilitychange', (e) => {
    // if (!isLogin) return;
    if (document.hidden) {
      // 停止
      stop();
    } else {
      // 发送心跳
      start();
    }
  })
}
