import { IDataRow, ITableColumnsDef, ITableData } from "./types";
import { useEffect, useMemo, useState } from "react";
import {
  applySearchToData,
  clearData,
  getData,
  groupRowsByColumnId,
  saveData,
} from "./api";

export const useApi = () => {
  const [colDefs, setColDefs] = useState<ITableColumnsDef>();
  const [rows, setRows] = useState<IDataRow[]>();
  const [groupByColId, setGroupByColId] = useState<string | undefined>();
  const [search, setSearch] = useState<string>("");

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

  const filteredDataRows: IDataRow[] = useMemo(() => {
    const _rows = applySearchToData(rows || [], search);
    //console.log('search applied: ', _rows);
    return _rows;
  }, [rows, search]);

  const groupedByColIdRows: IDataRow[][] = useMemo(() => {
    return groupRowsByColumnId(filteredDataRows || [], groupByColId || "");
  }, [filteredDataRows, groupByColId]);

  return {
    colDefs,
    rows: filteredDataRows,
    groupByColId,
    groupedByColIdRows,
    setGroupBy,
    updateData,
    updateColumns,
    clearSavedData,
    setSearch,
  };
};
