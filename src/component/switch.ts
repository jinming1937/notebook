export function registerSwitch(dom: HTMLInputElement, cb: (val: boolean) => void) {
  dom.addEventListener('change', (e) => {
    cb((e.target as HTMLInputElement).checked);
  })
}
