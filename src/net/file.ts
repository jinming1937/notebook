
export function addFile(id: number, value: string) {
  return fetch('/api/nb/add_file', {
    method: 'POST',
    body: JSON.stringify({id, value}),
    headers: {
      'Content-Type': 'application/json'
    },
  }).then((res) => {
    console.log(res);
    return res.json();
  }).catch((err) => {
    console.log(err);
  })
}

export function saveFile(id: number, value: string) {
  return fetch('/api/nb/save_file', {
    method: 'POST',
    body: JSON.stringify({id, value}),
    headers: {
      'Content-Type': 'application/json'
    },
  }).then((res) => {
    console.log(res);
    return res.json();
  }).catch((err) => {
    console.log(err);
  })
}
