import React from 'react'

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import RefreshIcon from '@material-ui/icons/Refresh';
import GetAppIcon from '@material-ui/icons/GetApp';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import LinearProgress from '@material-ui/core/LinearProgress';


import { Exporter, ExporterContext, Intl } from '../'


interface Column {
  id: 'label' | 'tag' | 'lang' | 'rows';
  minWidth?: number;
  renderer: (report: Exporter.Report) => string;
}

const columns: Column[] = [
  { id: 'label', minWidth: 200, renderer: (value: Exporter.Report) => value.label },
  { id: 'tag', minWidth: 50, renderer: (value: Exporter.Report) => value.tag },
  {
    id: 'lang',
    minWidth: 50,
    renderer: (value: Exporter.Report) => Object.keys(value.lang).join(", "),
  },
  {
    id: 'rows',
    minWidth: 170,
    renderer: (value: Exporter.Report) => `${value.rows.completed.length} / ${value.rows.open.length}`,
  },
];



interface ReportTableProps {
  events: {
    onDownload: (report: Exporter.Report) => void;
  }
}

const ReportTable: React.FC<ReportTableProps> = ({ events }) => {
  const reports = ExporterContext.useReports();
  const refresh = ExporterContext.useRefresh();

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };


  return (
    <>
      <TableContainer>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              <TableCell>
                 <Tooltip title={<Intl id="de.table.button.refresh" />}>
                  <IconButton onClick={() => refresh()}>
                    <RefreshIcon aria-label="refresh data"  />
                  </IconButton>
                </Tooltip>
              </TableCell>
              {columns.map((column) => (
                <TableCell align='left'
                  key={column.id}
                  style={{ minWidth: column.minWidth }}
                >
                  <Intl id={`de.table.header.${column.id}`} />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>


          <TableBody>
            { !reports ? 
              (<TableRow>
                <TableCell colSpan={5}>
                  <LinearProgress />
                </TableCell>
              </TableRow>) :
              reports.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (

                <TableRow hover role="hover" tabIndex={-1} key={row.id}>
                  <TableCell >
                    <Tooltip title={<Intl id="de.table.button.download" />}>
                      <IconButton onClick={() => events.onDownload(row)}>
                        <GetAppIcon aria-label="download" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>

                  {
                    columns.map((column) => (
                      <TableCell key={column.id} align='left'>
                        { column.renderer( row )}
                      </TableCell>)
                    )
                  }

                </TableRow>
              ))
            }
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        labelRowsPerPage={<Intl id="table.pagination.labelRowsPerPage"/>}
        labelDisplayedRows={(values) => <Intl id="table.pagination.labelDisplayedRows" values={values}/>}
        
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={reports ? reports.length : 0}
        rowsPerPage={rowsPerPage}
        page={page}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />
    </>
  )
}


export { ReportTable }