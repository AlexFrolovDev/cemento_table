/**
 * 'list' column type will be saved
 */
export type IColumnType = "string" | "number" | "boolean" | "list";
export interface IListOption {
  key: string;
  value: any;
}

export interface IColumn {
  id: string; // <- id of the column. Should match the one on he data rows,
  ordinalNo: number; // <- position of the column,
  title: string; // <- name of the column,
  type: IColumnType; // <- type of the data in the column,
  summaryAggregation: 'total' | 'sum' | 'list',
  width?: number; // <- defines the width of the column
  visible?: boolean;
  listOptions?: IListOption[]; // <- list options
}

/**
 * If we can group columns, then by which column, according to GIVEN schema ?
 * What if some column has an ID equal to rowId ????
 */
export interface IDataRow {
  id: string;
  [columnId: string]: any;
}

export type ITableData = IDataRow[];
export type ITableColumnsDef = IColumn[];
