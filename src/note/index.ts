import { initContent } from "./content";
import { initEditor } from "./editor";

export function initNote() {
  // 主题、输入区域等
  initEditor();
  // 目录、文件列表
  initContent();
}
