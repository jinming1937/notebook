
export function registerBg(bg: HTMLInputElement, page: HTMLDivElement) {
  bg.addEventListener('change', (e: any) => {
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
        console.log('get bg success')
        if (value.toLowerCase().match(/\.(jpe?g|png|gif|webp)$/g)) {
          page.setAttribute('style', `background-image: url(${(ev as any).target.result})`);
          if (!page.classList.contains('backImage')) {
            page.classList.add('backImage');
          }
        }
      }
    }
  });
}
