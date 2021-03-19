import { Integrations, Exporter, DialobServiceImpl } from '../'
import generator from 'bigquery-schema-generator';

import sanitize from './Sanitizer';


class ExporterServiceImpl implements Exporter.ExportService {
  private _dialob: Integrations.DialobService;
  private _listeners: Exporter.ExportListeners; 

  constructor(creds: Integrations.Creds, listeners: Exporter.ExportListeners) {
    this._dialob = new DialobServiceImpl(creds);
    this._listeners = listeners;
  }
  async getReports(): Promise<Exporter.Report[]> {
    const questionnaires: Record<string, Integrations.Questionnaire[]> = {};
    const forms: Integrations.Form[] = [];
    const formIds: string[] = [];

    for (const questionnaire of await this._dialob.getQuestionnaires()) {
      if (!formIds.includes(questionnaire.formId)) {
        forms.push(await this._dialob.getForm(questionnaire.formId))
        formIds.push(questionnaire.formId)
      }
      if (!questionnaires[questionnaire.formId]) {
        questionnaires[questionnaire.formId] = [];
      }
      questionnaires[questionnaire.formId].push(questionnaire);

    }

    const reports: Exporter.Report[] = [];
    for (const form of forms) {
      reports.push({
        id: form.id,
        label: form.label,
        name: form.formName,
        tag: form.tagName,
        lang: form.translations,
        fields: form.fields,
        externalId: '',
        rows: {
          completed: questionnaires[form.id].filter(q => q.completed).map(q => q.id),
          open: questionnaires[form.id].filter(q => !q.completed).map(q => q.id)
        }
      })
    }
    return reports;
  }
  
  async getExportData(report: Exporter.Report, onEntryLoaded: () => void): Promise<Exporter.ExportData> {
    const data: Exporter.ExportData = {};
    for (const questionnaireId of report.rows.completed) {
      const answers = await this._dialob.getAnswers(questionnaireId);
      onEntryLoaded();
      data[questionnaireId] = answers;
    }
    return data;
  }

  async createExport(report: Exporter.Report, data: Exporter.ExportData, options: Exporter.ExportOptions): Promise<Exporter.Export> {
    const rows:{_questionnaireId: string}[] = [];
    let schemaTester = {};
    
    for(const questionnaireId of Object.keys(data)) {
      const answers = data[questionnaireId];
      const cleanObject = sanitize({id: questionnaireId, report: report, answers, locale: options.lang});
      rows.push(cleanObject);
      schemaTester = Object.assign(schemaTester, cleanObject);
    }
    const schema = generator(schemaTester);
    const labels: Record<string, string> = {};
    labels["formId"] = report.id;
    labels["formName"] = report.name;
    labels["formLabel"] = report.label;
    labels["formTag"] = report.tag;
    labels["formLang"] = options.lang;
    
    return {
      id: report.id + '-' + report.tag + '-' + options.lang,
      from: report,
      src: data,
      lang: options.lang ? options.lang : 'identifiers',
      rows: rows,
      labels: labels,
      schema: schema,
      updateable: false
    };
  }

  async saveExport(data: Exporter.Export): Promise<void> {
    this._listeners.onSave(data);
  }
}


export { ExporterServiceImpl };