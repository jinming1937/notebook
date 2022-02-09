import { $dom, IDS } from "@/util";

export function initActiveBar() {
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
}
