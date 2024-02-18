import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { IDataRow, ITableColumnsDef } from "../../types";
import DataRow from "./DataRow/DataRow";

type IDataTableProps = {
  rows: IDataRow[] | IDataRow[][];
  cols: ITableColumnsDef;
  groupByColId?: string;
  onRowUpdate: (rowId: string, rowValues: { [key: string]: any }) => void;
};

const DataTable = (props: IDataTableProps) => {
  const { rows, cols, groupByColId, onRowUpdate } = props;

  return (
    <TableContainer component={Paper} style={{ height: "100%" }}>
      {rows.length > 0 ? (
        <Table aria-label="collapsible table" stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell />
              {cols.map((colDef) => {
                return colDef.visible ? (
                  <TableCell
                    align="center"
                    style={{
                      backgroundColor: colDef.id === groupByColId ? "grey" : "",
                      fontWeight:
                        colDef.id === groupByColId ? "bold" : "normal",
                    }}
                    key={colDef.id}
                  >
                    {colDef.title}
                  </TableCell>
                ) : null;
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, idx) => (
              <DataRow
                key={row.hasOwnProperty("id") ? (row as IDataRow).id : idx}
                onDataUpdate={onRowUpdate}
                row={row}
                cols={cols}
                groupByColId={groupByColId}
              />
            ))}
          </TableBody>
        </Table>
      ) : null}
    </TableContainer>
  );
};

export default DataTable;
