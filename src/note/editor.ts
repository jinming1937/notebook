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
