
export function saveFile(id: number, value: string) {
  return fetch('/api/nb/save_file', {
    method: 'POST',
    body: JSON.stringify({id, value}),
    headers: {
      'Content-Type': 'application/json'
    },
  }).then((res) => res.json()).then((data) => {
    return data.data;
  }).catch((err) => {
    console.log(err);
  })
}

export function getFile(id: number) {
  return fetch(`/api/nb/get_file?id=${id}`, {
    method: 'GET'
  }).then(res => res.json()).then((data) => {
    return data.data;
  })
}
