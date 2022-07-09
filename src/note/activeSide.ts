import { $dom } from "@/util";
import { IDS } from './ids';

const maxWidth = 360;
const minWidth = 200;

export function initActiveBar() {
  let flag: boolean | null = null;
  $dom(IDS.ActiveBarMask)!.addEventListener('mousedown', (e) => {
    flag = true;
    $dom(IDS.ActiveGap)!.className = 'activeGap';
    $dom(IDS.ActiveBarMask)!.className = 'activeBarMask contentMask';
    $dom(IDS.TargetBar)!.style.left = `${e.clientX - 1}px`;
  });
  $dom(IDS.ActiveBarMask)!.addEventListener('mousemove', (e) => {
    // && e.clientX <= maxWidth && e.clientX >= minWidth
    if (flag) {
      $dom(IDS.TargetBar)!.style.left = `${e.clientX - 1}px`;
      $dom(IDS.Content)!.style.width = `${e.clientX + 162}px`;
    }
  });
  $dom(IDS.ActiveBarMask)!.addEventListener('mouseup', (e) => {
    flag = false;
    $dom(IDS.ActiveGap)!.className = 'activeGap hidden';
    $dom(IDS.ActiveBarMask)!.className = 'activeBarMask';
  });
}
