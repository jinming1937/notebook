
export type FileType = 'content' | 'file';
export type IContent = {
  name: string;
  id: number;
  type: FileType;
  readonly?: boolean;
  active?: boolean;
  children?: IContent[];
  parent: number;
}
