export interface ModelContent{
  [key:string]: ModelContentItem
}

export interface ModelContentItem{
  autoIncrement?:boolean,
  primaryKey?:boolean,
  allowNull?:any,
  type?:any,
  comment?:string,
  defaultValue?:any
  [Key:string]:any
}

export interface DefineContent{
  [key:string]: string
}

export interface TableColumn {
  Field:string,
  Type:string,
  Null:string,
  Key?:string,
  Default?:null|string|number,
  Extra:string
}

export interface TableColumnComment{
  name: string,
  comment: string
}

export interface BuildResult{
  modelData: string,
  defineData: string
}