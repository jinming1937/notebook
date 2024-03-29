import { initActiveBar } from "./activeSide";
import { initContent, renderContentTree } from "./content";
import { initEditor } from "./editor";
import { clearContent, clearFile } from './file';
import { initLogin } from "./login";

export function initNote() {
  // 主题、输入区域等
  initEditor();
  // 目录、文件列表
  initContent();
  // 目录调整宽度
  initActiveBar();
  // 安全管理
  initLogin(() => {
    console.log('login')
    clearFile();
    renderContentTree();
  }, () => {
    clearFile();
    clearContent();
  });
}
