let flag: any = 0;

// 防抖
export function debounce(callback: () => void, timeFlag: number) {
  clearTimeout(flag);
  flag = setTimeout(() => {
    callback && callback()
  }, timeFlag);
}
// 节流 
export function throttle(callback: (e: any) => void, timeFlag: number = 0) {
  let now = Date.now();
  return (e: any) => {
    if (now + timeFlag < Date.now()) {
      now = Date.now();
      callback(e)
    }
  }
}
let flagListener = false;
let listenerCounter = 0;
function oneListener() {
  if (flagListener) return;
  flagListener = true;
  function listener(e: MessageEvent<any>) {
    // TODO: 重复消息
    if (e.data?.msg) {
      console.log('收到子页面消息：', e.data?.msg);
    } else {
      console.log('收到子页面消息?：', e.data);
    }
  }
  listenerCounter += 1;
  console.log('注册子页面监听', listenerCounter);
  window.removeEventListener('message', listener);
  window.addEventListener('message', listener);
}

export function sendToFrame() {
  oneListener();
  //主页面发送消息
  const myFrame = document.getElementById("frameDom");//获取框架
  return (value: string) => {
    console.log('发送消息给子页面：', value ? value.slice(0, 10) + '...' : '');
    (myFrame as HTMLIFrameElement)?.contentWindow?.postMessage(value, location.href);
  }
}

export function message(type: 'error'| 'info', msg: string) {
  console.log(msg);
}

export function encodeText(str = '') {
  return str ? encodeURI(str) : '';
}
export function decodeText(str = '', time = '') {
  return str ? decodeURI(str) : '';
}
