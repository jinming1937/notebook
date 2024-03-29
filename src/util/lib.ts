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

export function sendToFrame() {
  //主页面发送消息
  const myFrame = document.getElementById("frameDom");//获取框架

  window.addEventListener('message', function(e) {
    console.log('收到子页面消息：', e.data?.msg);
  })
  return (value: string) => {
    (myFrame as HTMLIFrameElement)?.contentWindow?.postMessage(value, location.href);
  }
}

export function notification(girlFrame: HTMLIFrameElement) {
  return (msg: string | {content: string, type: 'warning' | 'error' | 'info'}) => {
    if (typeof msg === 'string') {
      (girlFrame as HTMLIFrameElement)?.contentWindow?.postMessage({msg, type: 'tooltip'}, location.href)
    }
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
