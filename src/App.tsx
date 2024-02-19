import { useCallback, useMemo } from "react";
import { useApi } from "./useApi";
import ColumnsFilter from "./components/ColumnsFilter/ColumnsFilter";
import { Button, Grid } from "@mui/material";
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
  align-items: center;
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
    setSearch,
  } = useApi();

  const onRowUpdate = useCallback(
    (rowId: string, rowValues: { [key: string]: any }) => {
      //console.log("saving row: ", rowValues);
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
    if (!colDefs) return null;

    let data;

    if (!groupByColId) {
      data = rows || [];
    } else {
      data = groupedByColIdRows;
    }

    console.log(groupByColId);

    return (
      <DataTable
        rows={data}
        cols={colDefs}
        groupByColId={groupByColId}
        onRowUpdate={onRowUpdate}
      />
    );
  }, [rows, colDefs, groupByColId, groupedByColIdRows, onRowUpdate]);

  return (
    <Wrapper>
      {colDefs && rows ? (
        <>
          <Header>
            <ColumnsFilter
              colDefs={colDefs}
              onVisibleColumnsChange={updateColumns}
              groupByColumnId={groupByColId}
              onGroupBy={setGroupBy}
              onSearchUpdate={setSearch}
            />

            <Button onClick={clearSavedData}>Clear Local Data</Button>
            <span>
              <strong>Total rows: {rows.length}</strong>
            </span>
          </Header>
          <Main>{MemoizedTable}</Main>
        </>
      ) : null}
    </Wrapper>
  );
}

export default App;
