import { IDataRow, ITableColumnsDef, ITableData } from "./types";
import { useEffect, useMemo, useState } from "react";
import { clearData, getData, groupRowsByColumnId, saveData } from "./api";

export const useApi = () => {
  const [colDefs, setColDefs] = useState<ITableColumnsDef>();
  const [rows, setRows] = useState<IDataRow[]>();
  const [groupByColId, setGroupByColId] = useState<string | undefined>();

  const fetchData = async () => {
    const remoteData = await getData();

    setColDefs(remoteData.colDefs);
    setRows(remoteData.rows);
    setGroupByColId(remoteData.groupByColId);
  };

  const setGroupBy = (colId: string = "") => {
    setGroupByColId(colId);
    saveData({ colDefs: colDefs || [], rows: rows || [], groupByColId: colId });
  };

  const updateData = (rows: IDataRow[]) => {
    setRows(rows);
    saveData({
      colDefs: colDefs || [],
      rows,
      groupByColId: groupByColId || "",
    });
  };

  const updateColumns = (colDefs: ITableColumnsDef) => {
    setColDefs(colDefs);
    saveData({ colDefs, rows: rows || [], groupByColId: groupByColId || "" });
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
  }, [rows, groupByColId]);

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
