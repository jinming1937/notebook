
export function registerFont(fontSize: HTMLSelectElement, inputBox: HTMLTextAreaElement) {

  fontSize!.addEventListener('change', (e) => {
    inputBox!.style.fontSize = (e.target as HTMLSelectElement)!.value;
  });
}

export function setDefFont(fontSize: HTMLSelectElement, inputBox: HTMLTextAreaElement) {
  fontSize!.value = '14px';
  inputBox!.style.fontSize = fontSize!.value
}
