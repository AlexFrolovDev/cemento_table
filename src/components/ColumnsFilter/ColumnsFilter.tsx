import React, { useEffect, useMemo, useState } from "react";
import OutlinedInput from "@mui/material/OutlinedInput";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";
import { ITableColumnsDef } from "../../types";
import { Grid, TextField } from "@mui/material";
import styled from "styled-components";

const Wrapper = styled(Grid)`
  display: flex;
  gap: 2em;
`;

const Group = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5em;
`;

type IColumnsFilterProps = {
  disabled?: boolean;
  colDefs: ITableColumnsDef;
  groupByColumnId?: string;
  onVisibleColumnsChange: (colDefs: ITableColumnsDef) => void;
  onGroupBy: (id: string | undefined) => void;
  onSearchUpdate: (search: string) => void;
};

const ColumnsFilter = (props: IColumnsFilterProps) => {
  const {
    disabled,
    colDefs,
    groupByColumnId = "",
    onVisibleColumnsChange,
    onGroupBy,
    onSearchUpdate,
  } = props;

  const [_searchQuery, _setSearchQuery] = useState<string>("");

  const onSearchQueryChange = (e: any) => {
    _setSearchQuery(e.target.value);
  };

  const handleVisibilityChange = (event: SelectChangeEvent<string[]>) => {
    const {
      target: { value },
    } = event;

    onVisibleColumnsChange(
      (colDefs || []).map((def) => {
        return { ...def, visible: value.indexOf(def.id) > -1 };
      })
    );
  };

  const onGroupByChange = (event: SelectChangeEvent<string>) => {
    const {
      target: { value },
    } = event;

    //console.log(value);

    onGroupBy(value);
  };

  const selectedColumnsIds: string[] = useMemo(() => {
    const ids: string[] = [];

    colDefs?.forEach((def) => {
      def.visible && ids.push(def.id);
    });

    return ids;
  }, [colDefs]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearchUpdate(_searchQuery);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [_searchQuery, onSearchUpdate]);

  return (
    <Wrapper>
      <Group>
        <strong>Visibility:</strong>&nbsp;
        <Select
          disabled={disabled}
          multiple
          value={selectedColumnsIds}
          onChange={handleVisibilityChange}
          input={<OutlinedInput label="Column" />}
          renderValue={(selected) => {
            const titles = selectedColumnsIds.map((id) => {
              return colDefs?.find((def) => def.id === id)?.title;
            });

            return titles.join(", ");
          }}
        >
          {colDefs?.map((def) => (
            <MenuItem key={def.id} value={def.id}>
              <Checkbox checked={selectedColumnsIds.indexOf(def.id) > -1} />
              <ListItemText primary={def.title} />
            </MenuItem>
          ))}
        </Select>
      </Group>
      <Group>
        <strong>GroupBy: </strong>&nbsp;
        <Select
          size="small"
          disabled={disabled}
          value={groupByColumnId}
          onChange={onGroupByChange}
          input={<OutlinedInput label="Column" />}
          placeholder="N/A"
          displayEmpty={true}
        >
          <MenuItem value={""}>
            <ListItemText primary={"N/A"} />
          </MenuItem>
          {colDefs?.map((def) => (
            <MenuItem key={def.id} value={def.id}>
              <ListItemText primary={def.title} />
            </MenuItem>
          ))}
        </Select>
      </Group>
      <Group>
        <TextField
          placeholder="Search Text"
          size="small"
          type="text"
          value={_searchQuery}
          onChange={onSearchQueryChange}
        />
      </Group>
    </Wrapper>
  );
};

export default ColumnsFilter;
