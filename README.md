**Data structure in the requirements pdf was very confusing, too much time took to just adjust it to image provided and 'schema' in text

### What's implemented

* Rows data is generated and stored in json file, 2000 records, sliced to 500 by default(getData(rowsCount = 500) in api.ts)
* Columns visibility toggle implemented
* Custom columns grouping
* Search field with debounce of 500ms and search over all columns' VALUES
* Simple custom row editing with simple controls implemented
* Saving to localStorage and reseting implemented
* Row and Column types are extended a little bit for convinience. Spec provides extremely basic and confusing schemas

### Notes

* No virtualization is used. For large data sets - necessary
* No Context API for props sharing is used, just custom hook on top level. To prevent further props drilling and improve some other things - custom hook may be moved to Context API
* Almost no memoization is implemented, but, of course there's room for it at least at TableCells' level with Context API utilization to help
