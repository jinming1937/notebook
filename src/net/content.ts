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

export function getAllContent<T>() {
  return get<IRes<T>>('/api/nb/get_content_tree').then((data) => {
    console.log('目录数据', data.data);
    return data.data;
  })
}

export function getFileList<T>() {
  return get<IRes<T>>('/api/nb/get_content_list').then((data) => {
    console.log('目录数据', data.data);
    return data.data;
  })
}

export function uploadImg<T>(params: any) {
  return post<IRes<T>>('/api/upload/img', undefined, {
    body: params,
  }, {
    // 'Content-Type': 'multipart/form-data; charset:utf-8'
  }).then(data => {
    console.log(data);
    return data.data;
  });
}
