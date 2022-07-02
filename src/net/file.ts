import { get, IRes, post } from "./http";

export function saveFile<T>(id: number, value: string) {
  return post<IRes<T>>('/api/nb/save_file', {id, value}).then((data) => {
    return data.data;
  }).catch((err) => {
    console.log(err);
  })
}

export function getFile<T>(id: number) {
  return get<IRes<T>>(`/api/nb/get_file?id=${id}`).then((data) => {
    return data.data;
  })
}

export function getFileById<T>(id: string) {
  return get<IRes<T>>(`/api/nb/get_file_by_file_id?id=${id}`).then((data) => {
    return data.data;
  })
}

export function searchFileByKey<T>(key: string) {
  return get<IRes<T>>(`/api/nb/search?key=${key}`).then((data) => {
    return data.data;
  })
}
