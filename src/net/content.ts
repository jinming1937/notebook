import {FileType} from "@/entity/common";
import {get, IRes, post} from "./http";

export function addContent<T>(name: string, type: FileType, parentId: number) {
  return post<IRes<T>>('/api/nb/add_content', {name, type, parent_id: parentId}).then((res) => {
    return res.data;
  }).catch((err) => {
    console.log(err);
    return {id: 0};
  })
}

export function removeContent<T>(id: string) {
  return post<IRes<T>>('/api/nb/remove_content', {id}).then((res) => {
    return res.data;
  }).catch((err) => {
    console.log(err);
    return null;
  })
}

export function changeContentTitle(name: string, id: number) {
  return post<{data: any}>('/api/nb/change_content', {name, id}).then((res) => {
    return res.data;
  }).catch((err) => {
    console.log(err);
    return {data: null};
  })
}

export function moveContent(id: number, parentId: number, sort: number) {
  return post<{data: any}>('/api/nb/move_content', {id, parentId, sort: 100}).then((res) => {
    return res.data;
  }).catch((err) => {
    console.log(err);
    return {data: null};
  })
}

export function getAllContent<T>() {
  return get<IRes<T>>('/api/nb/get_content_tree').then((data) => {
    return data.data;
  })
}

export function getFileList<T>() {
  return get<IRes<T>>('/api/nb/get_content_list').then((data) => {
    return data.data;
  })
}

export function uploadImg<T>(params: any) {
  return post<IRes<T>>('/api/upload/img', undefined, {
    body: params,
  }).then(data => {
    return data.data;
  });
}
