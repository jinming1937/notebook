
export function registerSpell(spellcheck: HTMLInputElement, inputBox: HTMLTextAreaElement) {

  spellcheck!.addEventListener('change', (e: Event) => {
    if((e.target as HTMLInputElement)!.checked) {
      inputBox!.spellcheck = true;
    } else {
      inputBox!.spellcheck = false;
    }
  });
}

export function setDefSpell(spellcheck: HTMLInputElement, inputBox: HTMLTextAreaElement) {
  spellcheck!.checked = false;
  inputBox!.spellcheck = false;
}
