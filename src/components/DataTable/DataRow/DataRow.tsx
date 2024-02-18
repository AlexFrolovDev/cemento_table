import {
  Checkbox,
  IconButton,
  ListItemText,
  MenuItem,
  Select,
  Switch,
  TableCell,
  TableRow,
  TextField,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import { memo, useMemo, useState } from "react";
import { IColumn, IDataRow, ITableColumnsDef } from "../../../types";

type IDataRowProps = {
  row: IDataRow | IDataRow[];
  cols: ITableColumnsDef;
  groupByColId?: string;
  onDataUpdate?: (rowId: string, rowValues: { [key: string]: any }) => void;
  className?: string;
};

const DataRow = (props: IDataRowProps) => {
  const { row, cols, groupByColId, onDataUpdate, className } = props;
  const [open, setOpen] = useState<boolean>(false);
  const [editing, setEditing] = useState(false);
  const [editedCellValues, setEditedCellValues] = useState<{
    [key: string]: any;
  }>({});
  const isGroup = Array.isArray(row);

  const getSummaryCellContent = (col: IColumn, row: IDataRow[]) => {
    let count = 0;
    let cellValue = null;

    switch (col.type) {
      case "string":
      case "list":
        count = row.reduce((total, row) => {
          if (row[col.id].length > 0) {
            return total + 1;
          }
          return total;
        }, 0);

        cellValue = `${count} / ${row.length}`;
        break;

      case "number":
        if (col.summaryAggregation === "sum") {
          count = row.reduce((total, row) => {
            if (parseFloat(row[col.id])) {
              return total + parseFloat(row[col.id]);
            }
            return total;
          }, 0);

          cellValue = `${count}`;
        }
        if (col.summaryAggregation === "total") {
          count = row.reduce((total, row) => {
            if (parseFloat(row[col.id])) {
              return total + 1;
            }
            return total;
          }, 0);

          cellValue = `${count} / ${row.length}`;
        }

        break;

      case "boolean":
        if (col.summaryAggregation === "list") {
          const values = row.reduce(
            (total, row) => {
              total[row[col.id] === true ? 0 : 1]++;
              return total;
            },
            [0, 0]
          );

          cellValue = (
            <div
              style={{
                display: "flex",
                gap: "7px",
                justifyContent: "center",
              }}
            >
              <div>
                <strong
                  style={{
                    display: "inline-block",
                    width: "1em",
                    height: "1em",
                    borderRadius: "50%",
                    background: "green",
                  }}
                ></strong>
                &nbsp;<strong>{values[0]}</strong>
              </div>
              <div>
                <strong
                  style={{
                    display: "inline-block",
                    width: "1em",
                    height: "1em",
                    borderRadius: "50%",
                    background: "red",
                  }}
                ></strong>
                &nbsp;<strong>{values[1]}</strong>
              </div>
            </div>
          );
        }
        break;
    }

    return cellValue;
  };

  const onEditRowToggle = () => {
    if (isGroup) return;

    if (editing) {
      setEditing(false);
      console.log("updating row: ", row.id, editedCellValues);
      onDataUpdate && onDataUpdate(row.id, editedCellValues);
    } else {
      setEditedCellValues({});
      setEditing(true);
    }
  };

  return (
    <>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }} className={className}>
        <TableCell>
          {isGroup ? (
            <IconButton
              aria-label="expand row"
              size="small"
              onClick={() => setOpen(!open)}
            >
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          ) : (
            <IconButton
              aria-label="edit row"
              size="small"
              onClick={onEditRowToggle}
            >
              {editing ? <CheckIcon /> : <EditIcon />}
            </IconButton>
          )}
        </TableCell>
        {cols.map((col) => {
          if (!col.visible) return null;

          let cellValue = null;

          if (isGroup && row.length > 0) {
            if (col.id === groupByColId) {
              cellValue = (
                <div style={{ display: "flex", justifyContent: "center" }}>
                  {row[0][groupByColId]}
                </div>
              );
            } else {
              cellValue = getSummaryCellContent(col, row);
            }
            return <DataTableCell key={col.id} content={cellValue} />; // Wrap with some HOC and components composition later
          } else {
            //console.log('normal row');
            cellValue = (row as IDataRow)[col.id];

            return (
              <DataTableCell
                onChange={(id: string, value: any) =>
                  setEditedCellValues((values) => ({ ...values, [id]: value }))
                }
                editing={col.id !== groupByColId ? editing : false}
                colDef={col}
                key={col.id}
                content={cellValue}
              />
            );
          }
        })}
      </TableRow>
      {isGroup && open
        ? row.map((_row) => {
            return (
              <DataRow
                className='nested-row'
                key={_row.id}
                cols={cols}
                row={_row}
                groupByColId={groupByColId}
                onDataUpdate={onDataUpdate}
              />
            );
          })
        : null}
    </>
  );
};

type ICellProps = {
  content: any;
  onChange?: (id: string, value: any) => void;
  colDef?: IColumn;
  editing?: boolean;
};

// memo doesnt do anthing right now, optimize it
const DataTableCell = memo((props: ICellProps) => {
  const { editing, colDef, content, onChange } = props;
  const [value, setValue] = useState<string | number | boolean>(content);

  const onFieldValueChange = (e: any) => {
    let value: any;
    if (e.target.hasOwnProperty("checked")) {
      value = e.target.checked;
    } else {
      value = e.target.value;
    }
    setValue(value);
    onChange && onChange(colDef?.id || "", value);
  };

  const Component = useMemo(() => {
    if (editing) {
      switch (colDef?.type) {
        case "string":
        case "number":
          return (
            <TextField
              type={colDef.type === "string" ? "text" : "number"}
              size="small"
              value={value}
              onChange={onFieldValueChange}
            />
          );
        case "boolean":
          return (
            <Switch
              checked={value as boolean}
              onChange={onFieldValueChange}
              size="small"
            />
          );
        case "list":
          return (
            <Select
              size="small"
              value={value}
              onChange={onFieldValueChange}
              displayEmpty={true}
            >
              {colDef.listOptions?.map((option) => {
                return (
                  <MenuItem key={option.value} value={option.value}>
                    <ListItemText primary={option.value} />
                  </MenuItem>
                );
              })}
            </Select>
          );
      }
    }

    if (colDef?.type === "boolean") {
      return (
        <div>
          <Checkbox size="small" disabled checked={value as boolean} />
        </div>
      );
    }

    return <div>{content}</div>;
  }, [editing, content, colDef, value]);

  return <TableCell align="center">{Component}</TableCell>;
});

export default DataRow;
