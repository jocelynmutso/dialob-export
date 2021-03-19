import React from 'react';
import { Exporter, ExporterServiceImpl } from '../Exporter';
import { Integrations } from '../Integrations';

type ContextType = {
  service: Exporter.ExportService;
  reports?: Exporter.Report[];
  refresh: () => void;
}

const fakeExporter = {} as Exporter.ExportService;

const Context = React.createContext<ContextType>({
  service: fakeExporter,
  reports: [],
  refresh: () => { }
})


interface ProviderProps {
  children: React.ReactNode;
  creds: Integrations.Creds;
  listeners: Exporter.ExportListeners;
}

const Provider: React.FC<ProviderProps> = (props) => {
  const [reports, setReports] = React.useState<Exporter.Report[]>();
  const service: Exporter.ExportService = React.useMemo(() => new ExporterServiceImpl(props.creds, props.listeners), [props.creds]);
  const refresh = React.useMemo(() => () => {
    setReports(undefined);
    service.getReports().then(setReports);
  }, [setReports, service]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <Context.Provider value={{ service, reports, refresh }}>
      {props.children}
    </Context.Provider>
  )
}

const useContext = () => {
  const contextValue: ContextType = React.useContext(Context)
  return contextValue;
}

const useService = () => {
  const { service }: ContextType = React.useContext(Context)
  return service;
}

const useReports = () => {
  const { reports }: ContextType = React.useContext(Context)
  return reports;
}
const useRefresh = () => {
  const { refresh }: ContextType = React.useContext(Context)
  return refresh;
}

export { Provider, useContext, useService, useReports, useRefresh }

