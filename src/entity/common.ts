
export type FileType = 'content' | 'file';
export type IContent = {
  /**
   * 文件名
  */
  name: string;
  /**
   * 文件ID
  */
  id: number;
  /**
   * 文件类型
  */
  type: FileType;
  /**
   * 文件/夹 的父文件ID
  */
  parent: number;
  /**
   * 文件夹的子文件/夹
  */
  children: IContent[];
  /**
   * 排序
   */
  serial: number;
  /**
   * for文件夹：选中激活
  */
  active?: boolean;
  /**
   * for文件：选中激活
   */
  editing?: boolean;
  /**
   * TODO:只读文件/夹
  */
  readonly?: boolean;
  /**
   * 文件夹：展开、收起
   */
  switch?: boolean;
}
