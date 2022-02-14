
export type FileType = 'content' | 'file';
export type IContent = {
  name: string;
  id: number;
  type: FileType;
  parent: number;
  active?: boolean;
  children?: IContent[];
  readonly?: boolean;
  switch?: boolean;
}
