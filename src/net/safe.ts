// 安全服务

import { get, IRes, post } from "./http";

/**
 * 心跳检测
 * @returns
 */
export function heatBit<T>() {
  return get<IRes<T>>('/api/nb/heat_bit').then((data) => {
    return data.data;
  })
}

export function logout<T>() {
  return post<IRes<T>>('/api/nb/logout').then((data) => {
    return data.data;
  })
}

export function login<T>(pwd: string) {
  return post<IRes<T>>('/api/nb/login', {pwd, user: 'jm'}).then((data) => {
    return data.data
  })
}
