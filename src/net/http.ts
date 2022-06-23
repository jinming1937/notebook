/**
 * http
 */

export interface IConfig {
  method: 'GET' | 'POST';
  body?: string;
}

export type IKeys = {[key: string]: string | number}

export type IRes<T> = {data: T};

function obj2Url(obj: IKeys) {
  let strParams = '';
  Object.entries(obj).forEach(([key, value]) => {
    strParams += '&' + key + '=' + window.encodeURIComponent(value);
  })
  return strParams.replace(/^&/, '?');
}

export function http<T>(url: string, method?: 'GET' | 'POST', params?: IKeys, options?: IKeys) {
  const config: IConfig = {
    method: method || 'GET',
  }
  if (params) {
    if (method === 'GET') {
      url = url.replace(/\?$/, '') + obj2Url(params);
    } else if (method === 'POST') {
      config.body = JSON.stringify(params);
    }
  }
  return new Promise((resolve: (d: T) => void, reject: (s: string) => void) => {
    fetch(url, {
      ...config,
      headers: {
        'Content-Type': 'application/json',
        ...(options || {})
      },
    }).then(res => res.json()).then((data: T) => {
      // 统一处理：失败
      return resolve(data);
    }).catch(() => {
      // 统一处理：异常
      return reject('error');
    })
  })
}

export function get<T>(url: string, params?: IKeys, options?: IKeys) {
  return http<T>(url, 'GET', params, options)
}

export function post<T>(url: string, params?: IKeys, options?: IKeys) {
  return http<T>(url, 'POST', params, options)
}
