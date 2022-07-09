let flag: any = 0;
export function debounce(callback: () => void, timeFlag: number) {
  clearTimeout(flag);
  flag = setTimeout(() => {
    callback && callback()
  }, timeFlag);
}

export function sendToFrame() {
  //主页面发送消息
  const myFrame = document.getElementById("frameDom");//获取框架

  window.addEventListener('message', function(e) {
    console.log('收到子页面消息：', e.data.msg);
  })
  return (value: string) => {
    (myFrame as HTMLIFrameElement)?.contentWindow?.postMessage(value, location.href);
  }
}
