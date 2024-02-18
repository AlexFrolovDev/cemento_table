import {
  Box,
  Collapse,
  IconButton,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { memo, useState } from "react";
import { IDataRow, ITableColumnsDef } from "../../../types";

type IDataRowProps = {
  row: IDataRow | IDataRow[];
  cols: ITableColumnsDef;
  groupByColId?: string;
};

const DataRow = (props: IDataRowProps) => {
  const { row, cols, groupByColId } = props;
  const [open, setOpen] = useState<boolean>(false);
  const isGroup = Array.isArray(row);

  return (
    <>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {isGroup &&
              (open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />)}
          </IconButton>
        </TableCell>
        {/* <TableCell component="th" scope="row">
          {row.name}
        </TableCell>
        <TableCell align="right">{row.calories}</TableCell>
        <TableCell align="right">{row.fat}</TableCell>
        <TableCell align="right">{row.carbs}</TableCell>
        <TableCell align="right">{row.protein}</TableCell> */}
        {cols.map((col) => {
          if (!col.visible) return null;

          /* if (row.children?.length) {
            switch (col.type) {
              case "string":
                const count = row.children?.reduce((total, row) => {
                  if (row[col.id].length > 0) {
                    return total + 1;
                  }
                  return total;
                }, 0);

                text = `${count} / ${row.children.length}`;
            }
          } */

          let cellValue = null;

          if (isGroup && row.length > 0) {
            cellValue = col.id === groupByColId ? row[0][groupByColId] : null;
          } else {
            //console.log('normal row');
            cellValue = (row as IDataRow)[col.id];
          }

          return <DataTableCell key={col.id} content={cellValue} />;
        })}
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <pre>{JSON.stringify(row, null, 2)}</pre>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

type ICellProps = {
  content: any;
};
const DataTableCell = memo((props: ICellProps) => {
  return <TableCell>{props.content}</TableCell>;
});

export default DataRow;
