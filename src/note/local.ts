export function setLocalContent(id: string) {
  const actions = localStorage.getItem('content_action') || '[]';
  const newActions: string[] = [];
  try {
    const actionsObj: string[] = JSON.parse(actions);
    actionsObj.push(id);
    const uniqueId = new Set(actionsObj);
    newActions.push(...Array.from(uniqueId));
  } catch (error) {
    console.log(error);
  }
  localStorage.setItem('content_action', JSON.stringify(newActions));
}

export function removeLocalContent(id: string) {
  const actions = localStorage.getItem('content_action') || '[]';
  const newActions: string[] = [];
  try {
    const actionsObj: string[] = JSON.parse(actions);
    const index = actionsObj.indexOf(id);
    if (index !== -1) {
      actionsObj.splice(index, 1);
      newActions.push(...actionsObj);
    }
  } catch (error) {
    console.log(error);
  }
  localStorage.setItem('content_action', JSON.stringify(newActions));
}
