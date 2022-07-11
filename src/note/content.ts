import { FileType, IContent } from "../entity/common";
import { getAllContent, addContent, removeContent, changeContentTitle, uploadImg } from "../net/content";
import { saveFile } from "../net/file";
import { $dom, debounce, randomNumber, sendToFrame } from "../util";
import { readFile } from "./doc";
import { clearFile, renderFileList } from "./fileList";
import { setLocalContent, removeLocalContent } from './local';
import { renderContent } from './contentTree';

let ROOT_ID = -1;
const list: IContent[] = [];

function getItemById(id: number, list: IContent[]): IContent | null {
  let target: IContent | null = null;
  list.forEach((item) => {
    if (target !== null) return;
    if (id === item.id) {
      target = item;
    } else if (item.children && item.children.length > 0) {
      target = getItemById(id, item.children);
    }
  });

  return target;
}

function uploadImgHandler(files: FileList, currentFile: IContent, sender: (v: string) => void) {
  const file = files[0];
  if (['image/png', 'image/jpeg'].indexOf(file.type) !== -1) {
    // 是一张图片
    if (file.type.toLowerCase().match(/(jpe?g|png|gif|webp)/g)) {
      const formData = new FormData()
      formData.append('img', file);
      uploadImg<{data: string[]}>(formData).then((data) => {
        if (data && currentFile) {
          const value = insertImg(data[0]);
          const id = currentFile.id;
          saveFile(id, value).then((data) => {
            if (data) {
              sender(value);
              console.log('save success!');
            } else {
              console.log('save fail!');
            }
          });
        }
      }).catch((error) => {
        console.log(error);
      });
    }
  }
}

function insertImg(img: string) {
  const host = 'http://localhost:9960';
  const path = '/api/soft/static/';
  const index = $dom<HTMLTextAreaElement>('inputBox')?.selectionStart;
  const str = $dom<HTMLTextAreaElement>('inputBox')!.value
  const value = str.slice(0, index) + `![图片](${host}${path}${img})` + str.slice(index);
  $dom<HTMLTextAreaElement>('inputBox')!.value = value;
  return value;
}

export function renderContentTree() {
  console.log('render');
  // 获取数据
  getAllContent<IContent>().then((data: IContent) => {
    if (data) {
      list.length = 0;
      list.push(data);
      ROOT_ID = data.id;
      renderContent(list);
    }
  });
}

export function initContent () {
  let current: IContent | null = null;
  let currentFile: IContent | null = null;
  let moveItem: IContent | null = null;
  const $ContentDom = {
    treeContent: $dom('treeContent')!, // 树区域
    fileList: $dom('fileList')!,
    inputBox: $dom<HTMLTextAreaElement>('inputBox')!,
    uploadImage: $dom<HTMLInputElement>('uploadImage')!,
    title: $dom<HTMLInputElement>('title')!,
    addFile: $dom<HTMLInputElement>('addFile')!,
    addContent: $dom<HTMLInputElement>('addContent')!
  }
  const sender = sendToFrame()
  renderContentTree()

  function treeContentHandler(e: MouseEvent | TouchEvent) {
    const element = e.target as HTMLElement;
    if (element.className.match('triangle') !== null) {
      const id = element.parentElement?.getAttribute('key') || '';
      const item = getItemById(parseInt(id), list);
      item!.switch = !item?.switch;
      const parentDom = document.querySelector(`[key="${id}"]`);
      const close = item?.switch ? 'close': '';
      parentDom!.querySelector('.triangle')!.className = `triangle ${close}`;
      parentDom!.querySelector('.file_icon')!.className = `file_icon ${item?.switch ? 'open': 'close'}`;
      parentDom!.parentElement!.querySelector('.subMenu')!.className = `subMenu ${item?.switch ? '' : 'hidden' }`;
      if (!close) {
        setLocalContent(id);
      } else {
        removeLocalContent(id);
      }
      return;
    }
    $ContentDom.treeContent.querySelectorAll('[key]').forEach((target) => {
      // 清除dom && 清除 list 对象树上的active
      target.className = '';
      const key = target.getAttribute('key') || '';
      const cur = getItemById(parseInt(key), list);
      if (cur && cur.active) {
        cur.active = false;
      }
    });
    $ContentDom.fileList.querySelectorAll('[key]').forEach((target) => {
      // 清除 file list dom
      target.className = '';
    });
    clearFile();
    sender('');
    if (current) {
      current.active = false;
      current = null;
    }
    if (currentFile) {
      currentFile.editing = false;
      currentFile = null;
    }
    // 处理点击元素
    const keyElement = element.getAttribute('key') ? element : element.parentElement;
    if (keyElement?.getAttribute('key')) {
      const id = (keyElement)!.getAttribute('key') || '';
      const item = getItemById(parseInt(id), list);
      if (item) {
        current = item;
        current.active = true;
        renderFileList(item.children || []);
      }
      (keyElement)!.className = 'active';
    }
  }
  $ContentDom.fileList.addEventListener('dragstart', (e: DragEvent) => {
    const key = (e.target as HTMLElement).getAttribute('key');
    moveItem = null;
    if (e.dataTransfer && key) {
      moveItem = getItemById(Number(key), list);
      e.dataTransfer.setData("Text", key);
    }
  });
  $ContentDom.treeContent.addEventListener('dragover', (e) => {
    e.preventDefault();
  });
  $ContentDom.treeContent.addEventListener('drop', (e) => {
    e.preventDefault();
    console.log(e);
    const parentKey = (e.target as HTMLElement).getAttribute('key');
    if (e.dataTransfer && parentKey) {
      const data = e.dataTransfer.getData("Text");
      const moveElement = document.querySelector(`[key="${data}"]`);
      console.log(moveItem);
      if (moveItem && moveItem.type === 'content' && moveElement) {
        (e.target as HTMLElement).appendChild(moveElement);
      }

    }
  });
  $ContentDom.treeContent.addEventListener('click', (e) => {
    treeContentHandler(e);
  });
  let inputTimeFlag: any = 0;
  $ContentDom.inputBox.addEventListener('input', (e) => {
    if ((e as InputEvent).inputType === "insertFromPaste") return;
    if (currentFile === null) {
      currentFile = {
        name: '新建文件',
        id: randomNumber(),
        type: 'file',
      } as IContent
      if (!current) {
        current = getItemById(ROOT_ID, list);
        if (current) {
          current.active = true;
          currentFile.parent = current.id;
          current.children?.unshift(currentFile);
        }
      } else {
        currentFile.parent = current.id;
        if (current.children) {
          current.children.unshift(currentFile);
        } else {
          current.children = [currentFile];
        }
      }
      currentFile.editing = true;
      addContent<{id: number}>(currentFile.name, currentFile.type, currentFile.parent).then((data) => {
        if (data.id) {
          currentFile!.id = data.id;
          renderFileList(current?.children || []);
          renderContent(list);
        } else {
          console.log('error', data);
        }
      });
    } else {
      $ContentDom.title.value = currentFile.name;
      const id = currentFile.id;
      clearTimeout(inputTimeFlag);
      inputTimeFlag = setTimeout(() => {
        sender((e.target as HTMLInputElement).value);
        saveFile(id, (e.target as HTMLInputElement).value).then((data) => {
          if (data) {
            console.log('save success!');
          } else {
            console.log('save fail!');
          }
        });
      }, 500);
    }
  });
  // $ContentDom.uploadImage.addEventListener('change', (e) => {
  //   if (e.target) {
  //     const files = (e.target as HTMLInputElement).files;
  //     if (!files || !currentFile) {
  //       return;
  //     }
  //     uploadImgHandler(files, currentFile, sender);
  //   }
  // });
  $ContentDom.inputBox.addEventListener('paste', (e) => {
    if (!currentFile) {
      return;
    }
    if (e.clipboardData) {
      const {types, items, files} = e.clipboardData;
      if (types.length > 0 && items.length > 0 && files.length > 0) {
        uploadImgHandler(files, currentFile, sender);
      } else if (types.indexOf('text/plain') !== -1) {
        setTimeout(() => {
          sender((e.target as HTMLInputElement).value);
        }, 0);
      }
    }
  })
  $ContentDom.title.addEventListener('input', (e) => {
    if (!currentFile) {
      currentFile = {
        name: '新建文件',
        id: randomNumber(),
        type: 'file',
        editing: true,
      } as IContent;
      if (!current) {
        current = getItemById(ROOT_ID, list);
        if (current) {
          current.active = true;
          currentFile.parent = current.id;
          current.children?.unshift(currentFile);
        }
      } else {
        currentFile.parent = current.id;
        if (current.children) {
          current.children.unshift(currentFile);
        } else {
          current.children = [currentFile];
        }
      }
      addContent<{id: number}>(currentFile.name, currentFile.type, currentFile.parent).then((data) => {
        if (data.id) {
          currentFile!.id = data.id;
          renderFileList(current?.children || []);
          renderContent(list);
        } else {
          console.log('error', data);
        }
      });
    } else {
      currentFile.name = (e.target as HTMLInputElement).value
      currentFile.editing = true;
      if (!current) {
        current = getItemById(ROOT_ID, list);
        if (current) {
          current.active = true;
        }
      }
      debounce(() => {
        changeContentTitle(currentFile!.name, currentFile!.id).then((data) => {
          if (data) {
            console.log('success');
            renderContent(list);
            renderFileList(current?.children || []);
          }
        })
      }, 500)
    }
  });
  $ContentDom.fileList.addEventListener('click', (e) => {
    const element = e.target as HTMLElement;
    if ((element as HTMLElement).nodeName === 'S') {
      const index = (element as HTMLElement).getAttribute('index') || '0';
      const id = (element!.parentNode as HTMLDivElement)!.getAttribute('key') || '';
      const currentNode = getItemById(parseInt(id), list);
      const parentNode = getItemById(currentNode?.parent || ROOT_ID, list);
      const confirm = window.confirm(`Do you want to delete the file:[${currentNode?.name}] ?`);
      if (!confirm) {
        return;
      }
      if (parentNode && parentNode.children) {
        if (current) current = parentNode;
        if (currentFile) {
          currentFile = null;
          $ContentDom.title.value = '';
        }
        parentNode.children.splice(parseInt(index), 1);

        removeContent(id).then((data) => {
          if (data) {
            renderFileList(current?.children || []);
            if (parentNode.type === 'content') {
              renderContent(list);
            }
          }
        });
        return;
      }
    }
    $ContentDom.fileList.querySelectorAll('[key]').forEach((target) => {
      target.className = target.className?.replace('active', '').trim();
      if ((target as HTMLElement).draggable) {
        (target as HTMLElement).draggable = false;
      }
    });
    if (currentFile) {
      currentFile.editing = false;
    }
    const itemKey = element.getAttribute('key');
    if (itemKey) {
      const item = getItemById(parseInt(itemKey), list);
      if (item) {
        currentFile = item;
        currentFile.editing = true;
        // renderFileList(current?.children || []);
        readFile(currentFile);
      }
      const classList = [];
      if (item?.type === 'file') {
        classList.push('file');
      }
      if (item?.editing) {
        classList.push('active');
      }
      element.className = classList.join(' ');
      element.draggable = true;
    }
  });
  $ContentDom.addFile.addEventListener('click', (e) => {
    const newFile = {name: '新建文件', id: randomNumber(), type: 'file', editing: true};
    if (current) {
      (newFile as IContent).parent = current.id;
      if (current.children) {
        current.children.unshift(newFile as IContent);
      } else {
        current.children = [(newFile as IContent)];
      }
      if (currentFile) {
        currentFile.editing = false;
        currentFile = null;
        currentFile = newFile as IContent;
        currentFile.editing = true;
      } else {
        currentFile = newFile as IContent;
      }
      addContent<{id: number}>(newFile.name, newFile.type as FileType, current.id).then((data) => {
        if (data.id) {
          newFile.id = data.id;
          renderFileList(current?.children || []);
          $ContentDom.title.value = newFile.name;
        } else {
          console.log('error', data);
        }
      });;
    } else {
      alert('error !!! not found root!!!');
    }
  });
  $ContentDom.addContent.addEventListener('click', (e) => {
    const newContent = {name: '新建目录', id: randomNumber(), type: "content"};
    if (current) {
      (newContent as IContent).parent = current.id;
      if (current.children) {
        current.children.unshift(newContent as IContent);
      } else {
        current.children = [newContent as IContent];
      }
    } else {
      current = getItemById(ROOT_ID, list);
      if (current) {
        current.active = true;
        (newContent as IContent).parent = current.id;
        current.children?.unshift(newContent as IContent);
      } else {
        alert('error !!! not found root!!!');
        return;
      }
    }
    addContent<{id: number}>(newContent.name, newContent.type as FileType, current?.id || ROOT_ID).then((data) => {
      if (data.id) {
        newContent.id = data.id;
        renderFileList(current?.children || []);
        renderContent(list);
      } else {
        console.log('error', data);
      }
    });
  });
}
