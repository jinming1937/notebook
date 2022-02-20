import { FileType, IContent } from "../entity/common";
import { getAllContent, addContent, removeContent, changeContentTitle } from "../net/content";
import { saveFile } from "../net/file";
import { $dom, debounce, getItemById, IDS, randomNumber, sendToFrame } from "../util";
import { readFile } from "./doc";
import { clearFile, renderFileList } from "./fileList";
let ROOT_ID = -1;

const icon = (state: boolean | undefined) => `<span class="file_icon ${state ? 'open': 'close'}"></span>`;
const triangle = (state: boolean | undefined) => `<span class="triangle ${!state ? '' : 'close'}"></span>`;
function createContentTree (list: IContent[]) {
  let html = ''
  list.forEach((content: IContent) => {
    content.switch = typeof content.switch === 'undefined' ? true: content.switch;
    if (content.children && content.children.length > 0 && content.children.filter(item => item.type === 'content').length > 0) {
      const cache = `<ul class="subMenu ${content.switch ? '' : 'hidden'}">${createContentTree(content.children)}</ul>`;
      html+= `<li><div key="${content.id}" class="${content.active ? 'active': ''}">${triangle(content.switch)}${icon(content.switch)}<span>${content.name}</span></div>${cache}</li>`
    } else if (content.type === 'content') {
      html += `<li class="${content.active ? 'active': ''}" key="${content.id}">${icon(false)}<span>${content.name}</span></li>`
    }
  });

  return html;
}

function renderContent(list: IContent[]) {
  const html_ = createContentTree(list);
  $dom('treeContent')!.innerHTML = html_;
}

export function initContent () {
  const list: IContent[] = [];
  let current: IContent | null = null;
  let currentFile: IContent | null = null;
  const sender = sendToFrame()
  // 获取数据
  getAllContent().then((data: IContent) => {
    if (data) {
      list.push(data);
      ROOT_ID = data.id;
      renderContent(list);
    }
  });

  $dom(IDS.TreeContent)!.addEventListener('click', (e) => {
    const element = e.target as HTMLElement;
    if (element.className.match('triangle') !== null) {
      const id = element.parentElement?.getAttribute('key') || '';
      const item = getItemById(parseInt(id), list);
      item!.switch = !item?.switch;
      const parentDom = document.querySelector(`[key="${id}"]`);
      parentDom!.querySelector('.triangle')!.className = `triangle ${item?.switch ? 'close': ''}`;
      parentDom!.querySelector('.file_icon')!.className = `file_icon ${item?.switch ? 'open': 'close'}`;
      parentDom!.parentElement!.querySelector('.subMenu')!.className = `subMenu ${item?.switch ? '' : 'hidden' }`;
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
      currentFile.active = false;
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
      currentFile.active = true;
      addContent(currentFile.name, currentFile.type, currentFile.parent).then((data) => {
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
        active: true,
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
      addContent(currentFile.name, currentFile.type, currentFile.parent).then((data) => {
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
      currentFile.active = true;
      if (!current) {
        current = getItemById(ROOT_ID, list);
        if (current) {
          current.active = true;
        }
      }
      debounce(() => {
        changeContentTitle(currentFile!.name, currentFile!.id).then((data) => {
          if (data) {
            console.log('success')
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
        if (currentFile) currentFile = null;
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
      currentFile.active = false;
    }
    const itemKey = element.getAttribute('key');
    if (itemKey) {
      const item = getItemById(parseInt(itemKey), list);
      if (item) {
        currentFile = item;
        currentFile.active = true;
        renderFileList(current?.children || []);
        readFile(currentFile);
      }
      element.className = 'active';
    }
  });

  $dom('addFile')!.addEventListener('click', (e) => {
    const newFile = {
      name: '新建文件',
      id: randomNumber(),
      type: 'file',
    };
    if (current) {
      (newFile as IContent).parent = current.id;
      if (current.children) {
        current.children.unshift(newFile as IContent);
      } else {
        current.children = [(newFile as IContent)];
      }
      if (currentFile) {
        currentFile.active = false;
        currentFile = null;
        currentFile = newFile as IContent;
        currentFile.active = true;
      }
      addContent(newFile.name, newFile.type as FileType, current.id).then((data) => {
        console.log(data);
        if (data.id) {
          newFile.id = data.id;
          renderFileList(current?.children || []);
        } else {
          console.log('error', data);
        }
      });;
    } else {
      alert('error !!! not found root!!!');
    }
  });
  $dom('addContent')!.addEventListener('click', (e) => {
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
    addContent(newContent.name, newContent.type as FileType, current?.id || ROOT_ID).then((data) => {
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
