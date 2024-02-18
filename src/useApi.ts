import { IDataRow, ITableColumnsDef, ITableData } from "./types";
import { useEffect, useMemo, useState } from "react";
import { clearData, getData, groupRowsByColumnId, saveData } from "./api";

export const useApi = () => {
  const [colDefs, setColDefs] = useState<ITableColumnsDef>();
  const [rows, setRows] = useState<IDataRow[]>();
  const [groupByColId, setGroupByColId] = useState<string | undefined>();

  const fetchData = async () => {
    const remoteData = await getData();

    console.log(remoteData);

    setColDefs(remoteData.colDefs);
    setRows(remoteData.rows);
    setGroupByColId(remoteData.groupBy);
  };

  const setGroupBy = (colId?: string) => {
    setGroupByColId(colId);
    
  };

  const updateData = (rows: IDataRow[]) => {
    setRows(rows);
    saveData({ colDefs: colDefs || [], rows });
  };

  const updateColumns = (colDefs: ITableColumnsDef) => {
    setColDefs(colDefs);
    saveData({ colDefs, rows: rows || [] });
  };

  const clearSavedData = () => {
    clearData();
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  const groupedByColIdRows: IDataRow[][] = useMemo(() => {
    return groupRowsByColumnId(rows || [], groupByColId || "");
  }, [groupByColId]);

  return {
    colDefs,
    rows,
    groupByColId,
    groupedByColIdRows,
    setGroupBy,
    updateData,
    updateColumns,
    clearSavedData,
  };
};
