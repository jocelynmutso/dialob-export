import React from 'react';
import Select from '@material-ui/core/Select';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';

import { transforms, parse } from 'json2csv';
import fileDownload from 'js-file-download';


import { Exporter, Intl, ExporterContext } from '../';


const useStylesStep1 = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "100%",
    },
    preview: {
      margin: theme.spacing(2),
    },
    buttons: {
      margin: theme.spacing(2),
    },
  }),
);

interface Step0Props {
  report: Exporter.Report;
  onComplete: (data: Exporter.ExportData) => void
}

const Step0: React.FC<Step0Props> = ({ report, onComplete}) => {
  const service = ExporterContext.useService();
  const [current, setCurrent] = React.useState(0);
  const [completed, setCompleted] = React.useState(false);
  
  React.useEffect(() => {
    if(completed) {
      return;
    }
    let counter = 0;
    service.getExportData(report, () => setCurrent(++counter)).then((data) => {
      setCompleted(true);
      onComplete(data);
    }).catch(e => {
      console.error(e);
      setCompleted(true);
    });


  }, [setCurrent, report, onComplete, completed, setCompleted])

  
  return (
    <div>
      <Intl id="de.download.progress" values={{ current, total: report.rows.completed.length }} />
    </div>);
}


interface Step1Props {
  report: Exporter.Report;
  data: Exporter.ExportData;
  onComplete: (data: Exporter.Export) => void;
}

const Step1: React.FC<Step1Props> = ({ report, data, onComplete }) => {
  const [labels, setLabels] = React.useState('identifiers');
  const [ready, setReady] = React.useState<Exporter.Export>();
  const classes = useStylesStep1();
  const service = ExporterContext.useService();

  
  React.useEffect(() => {
    if(ready) {
      return;
    }
    service.createExport(report, data, { updateable: false, lang: labels }).then((data) => {
      onComplete(data);
      setReady(data);
    });
  }, [report, data, ready]);
  
  let helperId = "de.download.naming.helper.none"
  if (labels === 'identifiers') {
    helperId = "de.download.naming.helper.identifiers"
  } else if (labels) {
    helperId = "de.download.naming.helper.locales"
  }
  
  const onCsvDownload = () => {        
    if(ready) {       
      const parsed = parse(ready.rows, { transforms: [
        transforms.unwind({ blankOut: false }),
        transforms.flatten({ separator: '_', arrays: true, objects: true })] })
      fileDownload(parsed, `${report.name}-${report.tag}.csv`, "text/csv")
    }
  } 
  const onSchemaDownload = () => {
    fileDownload(JSON.stringify(ready?.schema, null, 2), `${report.name}-${report.tag}-schema.json`, "text/json")
  } 
  const onJsonDownload = () => {               
    fileDownload(JSON.stringify(ready?.rows, null, 2), `${report.name}-${report.tag}-data.json`, "text/json")
  }
  
  return (<div className={classes.root}>
    <FormControl fullWidth>
      <InputLabel id="set-labels"><Intl id="de.download.naming.label" /></InputLabel>

      <Select labelId="set-labels" id="set-labels-helper" fullWidth
        value={labels}
        onChange={({ target }) => {
          setLabels(target.value as string);
          setReady(undefined);
        }}
      >
        <MenuItem value={'identifiers'}>
          <em><Intl id="de.download.naming.identifiers" /></em>
        </MenuItem>

        {Object.keys(report.lang).map((locale, index) => (
          <MenuItem key={index} value={locale}>
            <Intl id="de.download.naming.locale" values={{ locale }} />
          </MenuItem>))}

      </Select>
      <FormHelperText>
        <Intl id={helperId} values={{ locale: labels }} />
      </FormHelperText>
    </FormControl>
    
    <Grid container justify="center" className={classes.preview}>
      <Typography variant="h6"><Intl id="de.download.helper.preview"/></Typography>
    </Grid>
    <Grid container justify="center" className={classes.buttons}>    
      <ButtonGroup color="primary" variant="text" disabled={!ready}>
        <Button onClick={() => onCsvDownload()}><Intl id="de.download.button.csv"/></Button>
        <Button onClick={() => onJsonDownload()}><Intl id="de.download.button.json"/></Button>
        <Button onClick={() => onSchemaDownload()}><Intl id="de.download.button.schema"/></Button>
      </ButtonGroup>
    </Grid>
  </div>);
}

export { Step0, Step1 }