import {FileType} from "@/entity/common";
import { get, IRes, post } from "./http";

export function addContent(name: string, type: FileType, parentId: number) {
  return post<IRes>('/api/nb/add_content', {name, type, parent_id: parentId}).then((res) => {
    return res.data;
  }).catch((err) => {
    console.log(err);
  })
}

export function removeContent(id: string) {
  return post<IRes>('/api/nb/remove_content', {id}).then((res) => {
    return res.data;
  }).catch((err) => {
    console.log(err);
  })
}

export function changeContentTitle(name: string, id: number) {
  return post<{data: any}>('/api/nb/change_content', {name, id}).then((res) => {
    return res.data;
  }).catch((err) => {
    console.log(err);
  })
}

export function getAllContent() {
  return get<{data: any}>('/api/nb/get_content_tree').then((data) => {
    console.log('目录数据', data.data);
    return data.data;
  })
}

export function getFileList() {
  return get<IRes>('/api/nb/get_content_list').then((data) => {
    console.log('目录数据', data.data);
    return data.data;
  })
}
