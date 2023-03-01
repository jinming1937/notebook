import { FileType, IContent } from "../entity/common";
import { getContentTree, addContent, removeContent, changeContentTitle, moveContent, getFileList } from "../net/content";
import { saveFile } from "../net/file";
import { $dom, debounce, message, randomNumber, sendToFrame } from "../util";
import { clearEditor, clearFile, renderFileList, readFileById } from "./file";
import { setLocalContent, removeLocalContent } from './local';
import { createShadowElement, getItemById, removeShadowElement, renderContent, uploadImgHandler } from './contentLib';

let ROOT_ID = -1;
const list: IContent[] = [];
const AUTO_SAVE_DELAY_TIME = 1000

export function renderContentTree() {
  console.log('render');
  // 获取数据
  getContentTree<IContent>().then((data: IContent) => {
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
  let inputTimeFlag: any = 0;
  const currentFileList: IContent[] = [];
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
      getFileList<IContent[]>(id).then((data) => {
        const item = getItemById(parseInt(id), list);
        if (item) {
          current = item;
          current.active = true;
        }
        currentFileList.push(...data);
        renderFileList(data || []);
      });
      (keyElement)!.className = 'active';
    }
  }
  function addNewFile(name: string, type: FileType) {
    const curr = current || getItemById(ROOT_ID, list);
    if (!curr) return new Promise((resolve, reject) => {
      message('error', 'can not find root');
      reject('error')
    });
    const newContent: IContent = {
      name,     id: randomNumber(),
      type,     serial: 100,
      parent: curr.id,     children: [] as IContent[],
      editing: true
    };
    if (!current) {
      current = curr;
      current.active = true;
    }
    current.children.unshift(newContent);
    return addContent<{id: number}>(newContent.name, newContent.type, current.id).then((data) => {
      if (data.id) {
        newContent.id = data.id;
        if (currentFile) {
          currentFile.editing = false;
          currentFile = null;
        }
        currentFile = newContent;
        $ContentDom.title.value = newContent.name;
        $ContentDom.title.focus();
        $ContentDom.title.select();
        renderFileList(current?.children || []);
        clearEditor()
        sender('');
      } else {
        message('error', 'request add error');
        throw('error request add error');
      }
    });
  }
  function addFileHandler(name = '新建文件') {
    addNewFile(name, 'file')
  }
  function addContentHandler() {
    addNewFile('新建目录', 'content').then(() => renderContent(list))
  }
  $ContentDom.fileList.addEventListener('dragstart', (e: DragEvent) => {
    const key = (e.target as HTMLElement).getAttribute('key');
    moveItem = null;
    if (e.dataTransfer && key) {
      moveItem = getItemById(Number(key), list);
      const img = createShadowElement();
      // (e.target as HTMLElement).appendChild(img);
      e.dataTransfer.setDragImage(img,  -100, -100);
      e.dataTransfer.setData("Text", key);
    }
  });
  $ContentDom.treeContent.addEventListener('dragover', (e) => e.preventDefault());
  $ContentDom.treeContent.addEventListener('drop', (e) => {
    e.preventDefault();
    // console.log(e.target);
    const targetKey = (e.target as HTMLElement).getAttribute('key');
    if (!targetKey) return;
    const newParent = getItemById(Number(targetKey), list);
    // 子元素不能移动到本身所在的父元素，子元素不能移到自身上
    if (e.dataTransfer && newParent && moveItem?.parent !== newParent.id && moveItem?.id !== newParent.id) {
      const data = e.dataTransfer.getData("Text");
      const moveElement = document.querySelector(`#fileList [key="${data}"]`);
      // console.log(moveItem, moveElement);
      if (moveItem && moveElement) {
        (moveElement as HTMLElement).draggable = false;
        console.log('start move');
        const sort = newParent.children.length === 0 ? 100 : (Math.max(...newParent.children.map(i => i.serial)) + 1)
        moveContent(moveItem.id, Number(targetKey), sort).then((data) => {
          if (data) {
            console.log('moving success!!');
            currentFile = null;
            const oldParentId = moveItem?.parent;
            const oldParent = getItemById(Number(oldParentId), list);
            const moveElementIndex = moveElement.getAttribute('index');
            if (oldParent && moveElementIndex) {
              oldParent.children.splice(Number(moveElementIndex), 1);
              renderFileList(oldParent.children || []);
              $ContentDom.title.value = '';
              clearEditor();
              sender('');
            }
            if (moveItem) {
              if (newParent.children) {
                newParent.children.unshift(moveItem); // 位置问题，这样会到最后
              } else {
                newParent.children = [moveItem];
              }
              moveItem.active = false;
              moveItem.editing = false;
              if (moveItem.type === 'content') {
                renderContent(list);
              }
            }
          }
        });
      }
    }
  });
  $ContentDom.treeContent.addEventListener('dragend', removeShadowElement);
  $ContentDom.treeContent.addEventListener('click', treeContentHandler);
  function writing(e: any) {
    if ((e as InputEvent).inputType === "insertFromPaste") return;
    if (currentFile === null) {
      addFileHandler()
    } else {
      $ContentDom.title.value = currentFile.name;
      const id = currentFile.id;
      const needSaveValue = (e.target as HTMLInputElement).value;
      debounce(() => sender(needSaveValue), 300);
      clearTimeout(inputTimeFlag);
      inputTimeFlag = setTimeout(() => {
        saveFile(id, needSaveValue).then((data) => {
          if (data) {
            console.log('save success!');
          } else {
            console.log('save fail!');
          }
        });
      }, AUTO_SAVE_DELAY_TIME);
    }
  }
  $ContentDom.inputBox.addEventListener('input', writing);
  $ContentDom.inputBox.addEventListener('paste', (e) => {
    if (!currentFile) {
      return;
    }
    if (e.clipboardData) {
      const {types, items, files} = e.clipboardData;
      if (types.length > 0 && items.length > 0 && files.length > 0) {
        uploadImgHandler(files, currentFile, (val) => {
          sender(val);
          writing({target: e.target, inputType: ''});
        });
      } else {
        setTimeout(() => {
          writing({target: e.target, inputType: ''})
        }, 0)
      }
    }
  })
  $ContentDom.title.addEventListener('input', (e) => {
    if (!currentFile) {
      debounce(() => {
        addFileHandler((e.target as HTMLInputElement).value);
      }, 500);
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
            renderFileList(currentFileList || []);
          }
        })
      }, 500)
    }
  });
  $ContentDom.title.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      if (currentFile?.type === 'file') {
        $ContentDom.inputBox.focus();
      } else {
        $ContentDom.title.blur();
      }
    }
  })
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
            getFileList<IContent[]>(id).then((data) => renderFileList(data))
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
      clearEditor()
      sender('');
    }
    const itemKey = element.getAttribute('key');
    if (itemKey) {
      const id = parseInt(itemKey);
      const item = currentFileList.find(i => i.id === id);
      if (item) {
        currentFile = item;
        currentFile.editing = true;
        readFileById(id, element.className, element.title);
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
  $ContentDom.addFile.addEventListener('click', () => addFileHandler());
  $ContentDom.addContent.addEventListener('click', () => addContentHandler());
}
