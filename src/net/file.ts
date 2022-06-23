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
