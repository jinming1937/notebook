import { get, IRes, post } from "./http";

export function saveFile(id: number, value: string) {
  return post<IRes>('/api/nb/save_file', {id, value}).then((data) => {
    return data.data;
  }).catch((err) => {
    console.log(err);
  })
}

export function getFile(id: number) {
  return get<IRes>(`/api/nb/get_file?id=${id}`).then((data) => {
    return data.data;
  })
}
