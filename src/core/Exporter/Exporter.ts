declare namespace Exporter {

  interface Export {
    id: string;
    from: Report;
    src: ExportData;
    lang: string;
    updateable: boolean;
    labels: Record<string, string>;
    schema: ExportSchema;
    rows: { _questionnaireId: string }[];
  }
  
  type ExportData = Record<string, ExportDataEntry[]>;
  
  interface ExportDataEntry {
    id: string;
    type: string; 
    value?: any;
  }
  
  interface ExportOptions {
    lang: string;
    updateable: boolean;
  }
  
  type ExportSchema = {
    name: string;
    type: string;
    mode: string;
    fields?: ExportSchema;
  } [];
  
  interface Report {
    id: string;
    externalId?: string;
    name: string;
    label: string;
    tag: string;
    lang: Record<string, Record<string, string>>; //locale - fieldId - label;
    fields: Record<string, string>; // id - type
    rows: { 
      completed: string[], open: string[] 
    };
  }
  
  interface ExportListeners {
    onSave: (data: Export) => void;
  }

  interface ExportService {
    getReports: () => Promise<Report[]>;
    getExportData: (report: Report, onEntryLoaded: () => void) => Promise<ExportData>;
    createExport: (report: Report, data: ExportData, options: ExportOptions) => Promise<Export>;
    saveExport: (data: Export) => Promise<void>;
  }
}

export type { Exporter }
