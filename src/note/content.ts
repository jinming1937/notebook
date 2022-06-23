import { FileType, IContent } from "../entity/common";
import { getAllContent, addContent, removeContent, changeContentTitle } from "../net/content";
import { saveFile } from "../net/file";
import { $dom, debounce, getItemById, IDS, randomNumber, sendToFrame } from "../util";
import { readFile } from "./doc";
import { clearFile, renderFileList } from "./fileList";
import { setLocalContent, removeLocalContent } from './local';
import { renderContent } from './contentTree';

let ROOT_ID = -1;
const list: IContent[] = [];

export function renderContentTree() {
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
  const sender = sendToFrame()

  renderContentTree();

  $dom(IDS.TreeContent)!.addEventListener('click', (e) => {
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
    $dom(IDS.TreeContent)!.querySelectorAll('[key]').forEach((target) => {
      target.className = '';
      const key = target.getAttribute('key') || '';
      const cur = getItemById(parseInt(key), list);
      if (cur && cur.active) {
        cur.active = false;
      }
    });
    $dom(IDS.FileList)!.querySelectorAll('[key]').forEach((target) => {
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
  });

  let inputTimeFlag: any = 0;
  $dom(IDS.InputBox)!.addEventListener('input', (e) => {
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
      $dom<HTMLInputElement>(IDS.Title)!.value = currentFile.name;
      const id = currentFile.id;
      clearTimeout(inputTimeFlag);
      inputTimeFlag = setTimeout(() => {
        sender((e.target as HTMLInputElement).value);
        saveFile(id, (e.target as HTMLInputElement).value).then((data) => {
          // console.log(data);
          if (data) {
            console.log('save success!');
          } else {
            console.log('save fail!');
          }
        });
      }, 500);
    }
  });

  $dom(IDS.Title)!.addEventListener('input', (e) => {
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
        console.log(data);
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

  $dom(IDS.FileList)!.addEventListener('click', (e) => {
    // console.log(e.target);
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
          $dom<HTMLInputElement>(IDS.Title)!.value = '';
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
    $dom(IDS.FileList)!.querySelectorAll('[key]').forEach((target) => {
      target.className = target.className?.replace('active', '').trim();
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
        renderFileList(current?.children || []);
        readFile(currentFile);
      }
      element.className = 'active';
    }
  });

  $dom(IDS.AddFile)!.addEventListener('click', (e) => {
    const newFile = {
      name: '新建文件',
      id: randomNumber(),
      type: 'file',
      editing: true,
    };
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
        console.log(data);
        if (data.id) {
          newFile.id = data.id;
          renderFileList(current?.children || []);
          $dom<HTMLInputElement>(IDS.Title)!.value = newFile.name;
        } else {
          console.log('error', data);
        }
      });;
    } else {
      alert('error !!! not found root!!!');
    }
  });
  $dom(IDS.AddContent)!.addEventListener('click', (e) => {
    const newContent = {
      name: '新建目录',
      id: randomNumber(),
      type: "content"
    };
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
      console.log(data);
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
