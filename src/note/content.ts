import { FileType, IContent } from "../entity/common";
import { getAllContent, addContent, removeContent, changeContentTitle } from "../net/content";
import { saveFile } from "../net/file";
import { $dom, debounce, getItemById, IDS, randomNumber } from "../util";
import { readFile } from "./doc";
import { clearFile, renderFileList } from "./fileList";
let ROOT_ID = -1;

function createContentTree (list: IContent[]) {
  let html = ''
  list.forEach((content: IContent) => {
    if (content.children && content.children.length > 0 && content.children.filter(item => item.type === 'content').length > 0) {
      const cache = `<ul class="subMenu">${createContentTree(content.children)}</ul>`;
      html+= `<li><div key="${content.id}" class="${content.active ? 'active': ''}">${content.name}</div>${cache}</li>`
    } else if (content.type === 'content') {
      html += `<li class="${content.active ? 'active': ''}" key="${content.id}">${content.name}</li>`
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
  // 获取数据
  getAllContent().then((data: IContent) => {
    if (data) {
      list.push(data);
      ROOT_ID = data.id;
      renderContent(list);
    }
  });

  $dom(IDS.TreeContent)!.addEventListener('click', (e) => {
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
    if (current) {
      current.active = false;
      current = null;
    }
    if (currentFile) {
      currentFile.active = false;
      currentFile = null;
    }
    if ((e.target as HTMLLIElement | HTMLDivElement)!.getAttribute('key')) {
      const id = (e.target as HTMLLIElement | HTMLDivElement)!.getAttribute('key') || '';
      const item = getItemById(parseInt(id), list);
      if (item) {
        current = item;
        current.active = true;
        renderFileList(item.children || []);
      }
      (e.target as HTMLLIElement | HTMLDivElement)!.className = 'active';
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
          // currentFile.id = current.id + '_' + currentFile.id
          currentFile.parent = current.id;
          current.children?.push(currentFile);
        }
      } else {
        // currentFile.id = current.id + '_' + currentFile.id
        currentFile.parent = current.id;
        if (current.children) {
          current.children.push(currentFile);
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
        // renderContent(list);
        // renderFileList(current?.children || []);
      });
    } else {
      $dom<HTMLInputElement>(IDS.Title)!.value = currentFile.name;
      const id = currentFile.id;
      clearTimeout(inputTimeFlag);
      inputTimeFlag = setTimeout(() => {
        saveFile(id, (e.target as HTMLInputElement).value);
        console.log('save success!');
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
          current.children?.push(currentFile);
        }
      } else {
        currentFile.parent = current.id;
        if (current.children) {
          current.children.push(currentFile);
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
      // const parentIdList = id.split('_');
      // parentIdList.pop();
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
        readFile(currentFile.id, list);
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
      // newFile.id = current.id + '_' + newFile.id;
      (newFile as IContent).parent = current.id;
      if (current.children) {
        current.children.push(newFile as IContent);
      } else {
        current.children = [(newFile as IContent)];
      }
      if (currentFile) {
        currentFile.active = false;
        currentFile = null;
        currentFile = newFile as IContent;
        currentFile.active = true;
      }
      // renderFileList(current.children);
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
        current.children.push(newContent as IContent);
      } else {
        current.children = [newContent as IContent];
      }
      // renderFileList(current.children);
    } else {
      current = getItemById(ROOT_ID, list);
      if (current) {
        current.active = true;
        (newContent as IContent).parent = current.id;
        current.children?.push(newContent as IContent);
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
