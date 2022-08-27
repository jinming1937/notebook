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
  tool.title.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      tool.inputBox.focus();
    }
  })
  tool.inputBox.addEventListener('keydown', (e) => {
    e.stopPropagation();
    if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 's' || e.key.toLowerCase() === 'meta')) {
      console.log('auto saved');
      e.preventDefault();
      return false;
    }
    if (e.key.toLowerCase() === 'tab') {
      e.preventDefault();
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
