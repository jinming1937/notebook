import {down} from './down';
import {randomNum, $dom} from './key';

type FileType = 'content' | 'file';
type IContent = {
  name: string;
  id: string;
  type: FileType;
  readonly?: boolean;
  active?: boolean;
  children?: IContent[];
}

const ROOT_ID = '000000';

const IDS = {
  /**
   * 目录盒子
   */
  Content: 'content',
  /**
   * 文件树
   */
  TreeContent: 'treeContent',
  /**
   * 蒙层
   */
  ActiveBarMask: 'activeBarMask',
  /**
   * 移动条
   */
  TargetBar: 'targetBar',
  /**
   * 文件盒子
   */
  FileList: 'fileList',
  /**
   * 标题
   */
  Title: 'title',
  /**
   * 正文输入
   */
  InputBox: 'inputBox'
}

function bgTool () {
  const frame = $dom<HTMLDivElement>("page");
  const theme = $dom<HTMLInputElement>("theme");
  const nowHours = new Date().getHours();
  if (nowHours > 6 && nowHours < 18) {
    frame!.className = "light";
  } else {
    frame!.className = "dark";
    theme!.checked = true;
  }
}

export function initToolbar() {
  bgTool();

  const inputBox = $dom<HTMLInputElement>('inputBox');
  const spellcheck = $dom<HTMLInputElement>('spellcheck');
  const fontSize = $dom<HTMLSelectElement>('fontSize');
  const downDom = $dom<HTMLInputElement>('down');
  const title = $dom<HTMLInputElement>('title');

  // title.value = `${new Date().toLocaleDateString('zh-cn', {
  //   year: 'numeric',
  //   month: '2-digit',
  //   day: '2-digit',
  //   hour: '2-digit',
  //   minute: '2-digit',
  //   second: '2-digit',
  //   hour12: false,
  // }).replace(/\s/, '_').slice(0, 10)}`;

  downDom!.addEventListener('click', () => {
    if (!inputBox!.value || !title!.value) {
      alert('please type [title] or [text] on the box!');
      return;
    }
    down(title!.value + '.md', inputBox!.value);
  });

  spellcheck!.addEventListener('change', (e: Event) => {
    if((e.target as HTMLInputElement)!.checked) {
      inputBox!.spellcheck = true;
    } else {
      inputBox!.spellcheck = false;
    }
  });

  {
    spellcheck!.checked = false;
    inputBox!.spellcheck = false;

    fontSize!.value = '14px';
    inputBox!.style.fontSize = fontSize!.value
  }

  fontSize!.addEventListener('change', (e) => {
    inputBox!.style.fontSize = (e.target as HTMLSelectElement)!.value;
  });

  initTheme();
}

function initTheme() {
  const frame = $dom<HTMLDivElement>("page");
  $dom<HTMLInputElement>('theme')!.addEventListener("change", (e) => {
    if ((e.target as HTMLInputElement)!.checked) {
      frame!.className = "dark";
    } else {
      frame!.className = "light";
    }
  });
}

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

function renderFileList(list: IContent[]) {
  let html = ''
  list.forEach((content: IContent, index: number) => {
    const classList = [];
    let suffix = '';
    if (content.type === 'file') {
      suffix += '.md';
      classList.push('file');
    }
    if (content.active) {
      classList.push('active');
    }
    html += `<li key="${content.id}" class="${classList.join(' ').trim()}">${content.name}${suffix}<s index="${index}">删</s></li>`
  });
  $dom('fileList')!.innerHTML = html;
}

function getItemById(id: string, list: IContent[]): IContent | null {
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

function fetchData(key: string, defaultData: IContent[] = []) {
  let data = [];
  try {
    const str = localStorage.getItem(key) || '[]';
    data = JSON.parse(str);
  } catch (error) {
    data = [];
  }
  if (!data || !Array.isArray(data) || data.length <= 0) {
    data = defaultData;
  }
  return data;
}

function postData(key: string, value: string) {
  localStorage.setItem(key, value);
}

function save(list: IContent[]) {
  postData('get_content_tree', JSON.stringify(list).replace(/("active"):true/g, "$1:false"));
}

function renderContent(list: IContent[]) {
  const html_ = createContentTree(list);
  $dom('treeContent')!.innerHTML = html_;
}

function getFileById(id: string) {
  let content = null;
  try {
    const str = localStorage.getItem(id) || '';
    const obj = JSON.parse(str);
    if (obj) {
      content = obj;
    }
  } catch (error) {

  }
  return content;
}

function readFile(id: string, list: IContent[]) {
  const curr = getItemById(id, list);
  if (curr !== null) {
    $dom<HTMLInputElement>(IDS.Title)!.value = curr.name;
    if (curr.type === 'file') {
      const content = getFileById(curr.id);
      if (content) {
        $dom<HTMLInputElement>(IDS.InputBox)!.value = content.text;
      } else {
        $dom<HTMLInputElement>(IDS.InputBox)!.value = '';
      }
    }
  }
}

function postFile(id: string, value: string) {
  localStorage.setItem(`${id}`, JSON.stringify({
    create_time: Date.now(),
    text: value,
  }));
}

function clearFile() {
  $dom<HTMLInputElement>(IDS.Title)!.value = '';
  $dom<HTMLInputElement>(IDS.InputBox)!.value = '';
}

export function initContent () {
  const list = fetchData('get_content_tree', [{
    name: 'Root',
    id: ROOT_ID,
    type: 'content',
    readonly: true,
    active: true,
    children: [],
  }]);
  console.log(list);
  let current: IContent | null = null;
  let currentFile: IContent | null = null;
  renderContent(list);

  $dom(IDS.TreeContent)!.addEventListener('click', (e) => {
    $dom(IDS.TreeContent)!.querySelectorAll('[key]').forEach((target) => {
      target.className = '';
      const key = target.getAttribute('key') || '';
      const cur = getItemById(key, list);
      if (cur && cur.active) {
        cur.active = false;
      }
    });
    $dom(IDS.FileList)!.querySelectorAll('[key]').forEach((target) => {
      target.className = '';
      // const key = target.getAttribute('key');
      // const cur = getItemById(key);
      // if (cur && cur.active) {
      //   cur.active = false;
      // }
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
      const item = getItemById(id, list);
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
        id: `${randomNum()}`,
        type: 'file',
      } as IContent
      if (!current) {
        current = getItemById(ROOT_ID, list);
        if (current) {
          current.active = true;
          currentFile.id = current.id + '_' + currentFile.id
          current.children?.push(currentFile);
        }
      } else {
        currentFile.id = current.id + '_' + currentFile.id
        if (current.children) {
          current.children.push(currentFile);
        } else {
          current.children = [currentFile];
        }
      }
      currentFile.active = true;
      renderContent(list);
      renderFileList(current?.children || []);
      save(list);
    } else {
      $dom<HTMLInputElement>(IDS.Title)!.value = currentFile.name;
      const id = currentFile.id;
      clearTimeout(inputTimeFlag);
      inputTimeFlag = setTimeout(() => {
        postFile(id, (e.target as HTMLInputElement).value);
        console.log('save success!');
      }, 500);
    }
  });

  $dom(IDS.Title)!.addEventListener('input', (e) => {
    // TODO debounce
    if (!currentFile) {
      currentFile = {
        name: '新建文件',
        id: `${randomNum()}`,
        type: 'file',
        active: true,
      }
      if (!current) {
        current = getItemById(ROOT_ID, list);
        if (current) {
          current.active = true;
          currentFile.id = current.id + '_' + currentFile.id
          current.children?.push(currentFile);
        }
      } else {
        currentFile.id = current.id + '_' + currentFile.id

        if (current.children) {
          current.children.push(currentFile);
        } else {
          current.children = [currentFile];
        }
      }
      currentFile.active = true;
      renderContent(list);
      renderFileList(current?.children || []);
      save(list);
    } else {
      currentFile.name = (e.target as HTMLInputElement).value
      if (!current) {
        current = getItemById(ROOT_ID, list);
        if (current) {
          current.active = true;
        }
      }
      renderContent(list);
      renderFileList(current?.children || []);
      save(list);
    }
  });

  $dom(IDS.FileList)!.addEventListener('click', (e) => {
    // console.log(e.target);
    const element = e.target as HTMLElement;
    if ((element as HTMLElement).nodeName === 'S') {
      const index = (element as HTMLElement).getAttribute('index') || '0';
      const id = (element!.parentNode as HTMLDivElement)!.getAttribute('key') || '';
      const currentNode = getItemById(id, list);
      const parentIdList = id.split('_');
      parentIdList.pop();
      const parentNode = getItemById(parentIdList.join("_"), list);
      console.log(parentIdList);
      const confirm = window.confirm(`Do you want to delete the file:[${currentNode?.name}] ?`);
      if (!confirm) {
        return;
      }
      if (parentNode && parentNode.children) {
        if (current) current = parentNode;
        if (currentFile) currentFile = null;
        window.localStorage.removeItem(id);
        parentNode.children.splice(parseInt(index), 1);

        renderFileList(current?.children || []);
        if (parentNode.type === 'content') {
          renderContent(list);
        }
        save(list);
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
      const item = getItemById(itemKey, list);
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
    const newFile: IContent = {
      name: '新建文件',
      id: `${randomNum()}`,
      type: 'file',
    };
    if (current) {
      newFile.id = current.id + '_' + newFile.id;
      if (current.children) {
        current.children.push(newFile);
      } else {
        current.children = [newFile];
      }
      if (currentFile) {
        currentFile.active = false;
        currentFile = null;
        currentFile = newFile;
        currentFile.active = true;
      }
      renderFileList(current.children);
      save(list);
    } else {
      alert('error !!! not found root!!!');
    }
  });
  $dom('addContent')!.addEventListener('click', (e) => {
    const newContent: IContent = {
      name: '新建目录',
      id: `${randomNum()}`,
      type: "content",
      children: [],
    };
    if (current) {
      newContent.id = current.id + '_' + newContent.id;
      if (current.children) {
        current.children.push(newContent);
      } else {
        current.children = [newContent];
      }
      renderFileList(current.children);
    } else {
      current = getItemById(ROOT_ID, list);
      if (current) {
        current.active = true;
        newContent.id = current.id + '_' + newContent.id;
        current.children?.push(newContent);
        renderFileList(current.children || []);
      } else {
        alert('error !!! not found root!!!');
      }
    }
    renderContent(list);
    save(list);
  });
  let flag: boolean | null = null;
  $dom(IDS.ActiveBarMask)!.addEventListener('mousedown', (e) => {
    flag = true;
    $dom(IDS.ActiveBarMask)!.className = 'activeBarMask mask';
    $dom(IDS.TargetBar)!.style.left = `${e.clientX - 10}px`;
  });
  $dom(IDS.ActiveBarMask)!.addEventListener('mousemove', (e) => {
    if (flag) {
      $dom(IDS.TargetBar)!.style.left = `${e.clientX - 10}px`;
      $dom(IDS.Content)!.style.width = `${e.clientX + 165}px`;
    }
  });
  $dom(IDS.ActiveBarMask)!.addEventListener('mouseup', (e) => {
    flag = false;
    $dom(IDS.ActiveBarMask)!.className = 'activeBarMask';
  });

  window.onunload = () => {
    // save(list);
  }
}
