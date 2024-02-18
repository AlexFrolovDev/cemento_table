import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useApi } from "./useApi";
import ColumnsFilter from "./components/ColumnsFilter/ColumnsFilter";
import { Button, Grid, IconButton, TableCell, TableRow } from "@mui/material";
import DataTable from "./components/DataTable/DataTable";
import styled from "styled-components";
import { IDataRow } from "./types";

const Wrapper = styled(Grid)`
  &.MuiGrid-root {
    flex-direction: column;
    display: flex;
    height: 100vh;
    padding: 2em;
    gap: 2em;
  }
`;

const Header = styled(Grid)`
  display: flex;
  gap: 1em;
`;

const Main = styled(Grid)`
  flex: 1;
  overflow: auto;
`;

function App() {
  const {
    colDefs,
    rows,
    groupByColId,
    setGroupBy,
    groupedByColIdRows,
    updateData,
    updateColumns,
    clearSavedData,
  } = useApi();
  const [editing, setEditing] = useState<
    { row: string; column: string } | undefined
  >();

  const onRowUpdate = useCallback(
    (rowId: string, rowValues: { [key: string]: any }) => {
      console.log("saving row: ", rowValues);
      const _newRows = rows?.map((row) => {
        if (row.id === rowId) {
          return { ...row, ...rowValues };
        }
        return { ...row };
      });
      updateData(_newRows as IDataRow[]);
    },
    [rows, updateData]
  );

  const MemoizedTable = useMemo(() => {
    const data =
      groupByColId && groupedByColIdRows.length > 0
        ? groupedByColIdRows
        : rows || [];
    return colDefs ? (
      <DataTable
        rows={data}
        cols={colDefs}
        groupByColId={groupByColId}
        onRowUpdate={onRowUpdate}
      />
    ) : null;
  }, [rows, colDefs, groupByColId, groupedByColIdRows, onRowUpdate]);

  return (
    <Wrapper>
      <Header>
        {colDefs ? (
          <ColumnsFilter
            disabled={!!editing}
            colDefs={colDefs}
            onVisibleColumnsChange={updateColumns}
            groupByColumnId={groupByColId}
            onGroupBy={setGroupBy}
          />
        ) : null}
        <Button onClick={clearSavedData}>Clear Local Data</Button>
      </Header>
      <Main>{MemoizedTable}</Main>
    </Wrapper>
  );
}

export default App;
