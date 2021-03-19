import React from 'react';
import { Integrations, ExporterContext, Exporter } from '../';
import { ReportTable } from './ReportTable'
import { DownloadView } from './DownloadView'





interface ExporterAuth extends Integrations.Creds { }

interface ExporterListeners extends Exporter.ExportListeners {
  
}

interface ExporterViewProps {
  auth: ExporterAuth;
  listeners: ExporterListeners;
}



const ExporterView: React.FC<ExporterViewProps> = ({ auth, listeners }) => {

  const [selection, setSelection] = React.useState<Exporter.Report>();
  const events = {
    onDownload: (report: Exporter.Report) => {
      setSelection(report);
    },
  }

  return (<ExporterContext.Provider creds={auth} listeners={listeners}>
    { selection ?
      (<DownloadView onClose={() => setSelection(undefined)} selection={selection} />) : 
      null
    }
    <ReportTable events={events} />
  </ExporterContext.Provider>)
}



export { ExporterView }
export type { ExporterViewProps, ExporterAuth, ExporterListeners }
