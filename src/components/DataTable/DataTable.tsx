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
};

const DataTable = (props: IDataTableProps) => {
  const { rows, cols, groupByColId } = props;

  return (
    <TableContainer component={Paper} style={{ height: "100%" }}>
      {rows.length > 0 ? (
        <Table aria-label="collapsible table" stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell />
              {cols.map((colDef) => {
                return colDef.visible ? (
                  <TableCell align="center" style={{backgroundColor: colDef.id === groupByColId ? 'grey' : ''}} key={colDef.id}>{colDef.title}</TableCell>
                ) : null;
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, idx) => (
              <DataRow key={idx} row={row} cols={cols} groupByColId={groupByColId} />
            ))}
          </TableBody>
        </Table>
      ) : null}
    </TableContainer>
  );
};

export default DataTable;
