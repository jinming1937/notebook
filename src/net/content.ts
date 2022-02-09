import {FileType} from "@/entity/common";

export function addContent(name: string, type: FileType, parentId: number) {
  return fetch('/api/nb/add_content', {
    method: 'POST',
    body: JSON.stringify({name, type, parent_id: parentId}),
    headers: {
      'Content-Type': 'application/json'
    },
  }).then(res => res.json()).then((res) => {
    return res.data;
  }).catch((err) => {
    console.log(err);
  })
}

export function removeContent(id: string) {
  return fetch('/api/nb/remove_content', {
    method: 'POST',
    body: JSON.stringify({id}),
    headers: {
      'Content-Type': 'application/json'
    },
  }).then(res => res.json()).then((res) => {
    return res.data;
  }).catch((err) => {
    console.log(err);
  })
}

export function changeContentTitle(name: string, id: number) {
  return fetch('/api/nb/change_content', {
    method: 'POST',
    body: JSON.stringify({name, id}),
    headers: {
      'Content-Type': 'application/json'
    },
  }).then(res => res.json()).then((res) => {
    return res.data;
  }).catch((err) => {
    console.log(err);
  })
}

export function getAllContent() {
  return fetch('/api/nb/get_content_tree', {
    method: 'GET'
  }).then(res => res.json()).then((data) => {
    console.log('目录数据', data.data);
    return data.data;
  })
}
