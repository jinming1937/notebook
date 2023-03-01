import { encodeText } from "@/util";
import { get, IRes, post } from "./http";

export function saveFile<T>(id: number, value: string) {
  return post<IRes<T>>('/api/nb/save_file', {id, value: encodeText(value)}).then((data) => {
    return data.data;
  }).catch((err) => {
    console.log(err);
  })
}
/**
 * 跟据目录下关联的目录id查找文件
 * @param id id
 * @returns
 */
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
