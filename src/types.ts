/**
 * 'list' column type will be saved
 */
export type IColumnType = "string" | "number" | "boolean" | "list";

export interface IColumn {
  id: string; // <- id of the column. Should match the one on he data rows,
  ordinalNo: number; // <- position of the column,
  title: string; // <- name of the column,
  type: string; // <- type of the data in the column,
  width?: number; // <- defines the width of the column
}

export interface IDataRow {
  id: string;
  [columnId: string]: any;
}

export type ITableData = IDataRow[];
