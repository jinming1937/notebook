// 安全服务

import { get, IRes, post } from "./http";

/**
 * 心跳检测
 * @returns
 */
export function heatBit() {
  return get<IRes>('/api/nb/heat_bit').then((data) => {
    return data.data;
  })
}

export function logout() {
  return post<IRes>('/api/nb/logout').then((data) => {
    return data.data;
  })
}

export function login(pwd: string) {
  return post<IRes>('/api/nb/login', {pwd}).then((data) => {
    return data.data
  })
}
