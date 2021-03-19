import React from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Grid from '@material-ui/core/Grid';
import DialogTitle from '@material-ui/core/DialogTitle';

import { Intl, Exporter, ExporterContext } from '../';
import { Step0, Step1 } from './DownloadSteps';


const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "900px",
      height: "600px"
    },
    content: {
      marginTop: theme.spacing(2)
    }
  }),
);

interface DownloadViewProps {
  selection: Exporter.Report;
  onClose: () => void;
}

const DownloadView: React.FC<DownloadViewProps> = ({ selection, onClose }) => {
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);
  const [stepCompleted, setStepCompleted] = React.useState(false);
  const [exportData, setExportData] = React.useState<Exporter.ExportData>();
  const [exportReport, setExportReport] = React.useState<Exporter.Export>();
  const service = ExporterContext.useService();

  const handleNext = () => {
    setStepCompleted(false);
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };


  const handleComplete = () => {
    if(exportReport) {
      service.saveExport(exportReport).then(() => onClose());
    }
  };


  const finalStep = activeStep === 1;
  let stepContent: React.ReactChild = <></>;
  if (activeStep === 0) {
    stepContent = <Step0 report={selection} onComplete={(data) => {
      setStepCompleted(true)
      setExportData(data);
    }} />

  } else if (activeStep === 1) {
    stepContent = <Step1 report={selection} data={exportData ? exportData : {}}
      onComplete={(data: Exporter.Export) => {
        setStepCompleted(true);
        setExportReport(data);
      }} />
  }

  return (
    <Dialog open={true} onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      PaperProps={{ className: classes.root }}>

      <DialogTitle id="alert-dialog-title"><Intl id="de.download.title" /></DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} alternativeLabel>
          <Step><StepLabel><Intl id="de.download.step0.label" /></StepLabel></Step>
          <Step><StepLabel><Intl id="de.download.step1.label" /></StepLabel></Step>
        </Stepper>

        <Grid container justify="center" className={classes.content}>
          {stepContent}
        </Grid>
      </DialogContent>
      <DialogActions>
        {activeStep > 0 ?
          (<>
            <Button variant="contained" color="primary" onClick={handleBack}>
              <Intl id="de.download.stepper.back" />
            </Button></>) : (<></>)
        }

        {finalStep ?
          (<Button variant="contained" color="primary" onClick={handleComplete}>
            <Intl id="de.download.stepper.complete" />
          </Button>)
          :
          (<Button variant="contained" color="primary" disabled={!stepCompleted} onClick={handleNext}>
            <Intl id="de.download.stepper.next" />
          </Button>)
        }
      </DialogActions>

    </Dialog>
  );

}


export { DownloadView }



