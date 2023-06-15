import { registerTheme, setTimeTheme } from '@/component/theme';
import { registerBg } from '@/component/background';
import { registerDownload } from '@/component/down';
import { registerFont, setDefFont } from '@/component/font';
import { registerSpell, setDefSpell } from '@/component/spellcheck';
import { $dom } from '@/util';
import { registerSwitch } from '@/component/switch';

export function initEditor() {

  const tool = {
    page: $dom<HTMLDivElement>('page')!,
    inputBox: $dom<HTMLTextAreaElement>('inputBox')!,
    fontSize: $dom<HTMLSelectElement>('fontSize')!,
    spellcheck: $dom<HTMLInputElement>('fontSize')!,
    frame: $dom<HTMLDivElement>("page")!,
    theme: $dom<HTMLInputElement>("theme")!,
    down: $dom<HTMLInputElement>('down')!,
    title: $dom<HTMLInputElement>('title')!,
    bg: $dom<HTMLInputElement>('upload')!,
    isEditor: $dom<HTMLInputElement>('editorSwitch')!,
    editorInputBox: $dom<HTMLInputElement>('editorInputBox')!,
  }
  tool.inputBox.addEventListener('keydown', (e) => {
    e.stopPropagation();
    const lowerKey = e.key.toLowerCase();
    // TODO window 全局应该增加该拦截
    if ((e.ctrlKey || e.metaKey) && (lowerKey === 's' || lowerKey === 'meta')) {
      console.log('auto saved');
      e.preventDefault();
      return false;
    }
    if (lowerKey === 'tab') {
      e.preventDefault();
      if (e.shiftKey) { // 左缩进
        const strList = tool.inputBox.value.split(/\n/);
        const strSelectionIndex: number[] = [];
        const selectionStartIndex = tool.inputBox.selectionStart;
        const selectionEndIndex = tool.inputBox.selectionEnd;
        let length = 0;
        if (selectionStartIndex === selectionEndIndex) {
          strList.forEach((item, index) => {
            if (length <= selectionStartIndex && length + item.length + 1 >= selectionStartIndex) {
              strSelectionIndex.push(index);
            }
            length += item.length + 1;
          })
        } else {
          strList.forEach((item, index) => {
            if (length <= selectionStartIndex && length + item.length + 1 >= selectionStartIndex) {
              strSelectionIndex.push(index);
            }
            if (length <= selectionEndIndex && length + item.length + 1 >= selectionEndIndex) {
              strSelectionIndex.push(index);
            }
            length += item.length + 1;
          })
        }
        const res: string[] = [];
        const isSelectRange = strSelectionIndex.length === 2;
        strList.forEach((item, index) => {
          if (strSelectionIndex.length === 1 && strSelectionIndex[0] === index) {
            item = item.replace(/^\s{2}/, '');
          } else if (strSelectionIndex.length === 2 && (strSelectionIndex[0] <= index || strSelectionIndex[1] >= index)) {
            item = item.replace(/^\s{2}/, '');
          }
          res.push(item);
        });
        console.log(res.join('\n'));
        tool.inputBox.value = res.join('\n');
        // tool.inputBox.select
        tool.inputBox.blur()
        setTimeout(() => {
          tool.inputBox.selectionStart = selectionStartIndex - 2
          if (isSelectRange) {
            tool.inputBox.selectionEnd = selectionEndIndex - 2 * (strSelectionIndex[1] - strSelectionIndex[0] + 1)
          } else {
            tool.inputBox.selectionEnd = selectionStartIndex - 2;
          }
          tool.inputBox.focus()
          // TODO save
        }, 0);

      } else {
        const index = tool.inputBox.selectionStart;
        const str = tool.inputBox.value;
        const val = str.slice(0, index) + '  ' + str.slice(index);
        tool.inputBox.value = val;
        // tool.inputBox.select
        tool.inputBox.blur()
        setTimeout(() => {
          tool.inputBox.selectionStart = index + 2
          tool.inputBox.selectionEnd = index + 2
          tool.inputBox.focus()
          // TODO save
        }, 0);
      }
    }
  }, false);
  registerSwitch(tool.isEditor, (val: boolean) => {
    if (val) {
      tool.editorInputBox.className = 'editorInput';
    } else {
      tool.editorInputBox.className = 'editorInput hidden';
    }
  });
  registerTheme(tool.frame, tool.theme);
  registerBg(tool.bg, tool.page);
  registerDownload(tool.down, tool.title, tool.inputBox);
  registerFont(tool.fontSize, tool.inputBox);
  registerSpell(tool.spellcheck, tool.inputBox);

  setTimeTheme(tool.frame, tool.theme);
  setDefFont(tool.fontSize, tool.inputBox);
  setDefSpell(tool.spellcheck, tool.inputBox);
}
