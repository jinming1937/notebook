import { $dom } from "@/util";
import { IDS } from './ids';

const maxWidth = 360;
const minWidth = 200;

export function initActiveBar() {
  let flag: boolean | null = null;

  const $BarDom = {
    activeBarMask: $dom(IDS.ActiveBarMask)!,
    activeGap: $dom(IDS.ActiveGap)!,
    targetBar: $dom(IDS.TargetBar)!,
    content: $dom(IDS.Content)!
  }

  $BarDom.activeBarMask.addEventListener('mousedown', (e) => {
    flag = true;
    $BarDom.activeGap.className = 'activeGap';
    $BarDom.activeBarMask.className = 'activeBarMask contentMask';
    $BarDom.targetBar.style.left = `${e.clientX - 1}px`;
  });
  $BarDom.activeBarMask.addEventListener('mousemove', (e) => {
    if (flag && e.clientX <= maxWidth && e.clientX >= minWidth) {
      $BarDom.targetBar.style.left = `${e.clientX - 1}px`;
      $BarDom.content.style.width = `${e.clientX + 162}px`;
    }
  });
  $BarDom.activeBarMask.addEventListener('mouseup', (e) => {
    flag = false;
    $BarDom.activeGap.className = 'activeGap hidden';
    $BarDom.activeBarMask.className = 'activeBarMask';
  });
}
