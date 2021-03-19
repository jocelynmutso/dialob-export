import * as StringSanitizer from "string-sanitizer";
import { Integrations, Exporter } from '../'


interface DialobSanitizer {
  visit(): {_questionnaireId: string };
  visitAnswer(answer: Exporter.ExportDataEntry): void;
  visitValue(answer: Exporter.ExportDataEntry): void;
  visitLast(path: string[], answer: Exporter.ExportDataEntry): {}; 
  visitId(id: string, answer: Integrations.FormAnswer): string;
}

class DialobSanitizerImpl implements DialobSanitizer {
  private _report: Exporter.Report;
  private _locale: string;
  private _id: string;
  private _answers: Exporter.ExportDataEntry[];
  private _result: { _questionnaireId: string };
  
  constructor(
    id: string,
    report: Exporter.Report, 
    answers: Exporter.ExportDataEntry[], 
    locale: string) {
    
    this._id = id;
    this._report = report;
    this._locale = locale;
    this._answers = answers;
    this._result = { _questionnaireId: this._id };
  }
  
  visit() {
    this._answers.forEach(a => this.visitAnswer(a));
    return this._result;
  }
  visitAnswer(answer: Exporter.ExportDataEntry) {
    if(answer.type === 'rowgroup' || this._report.fields[answer.id] === 'rowgroup') {
      return;
    }
    if(!answer.value) {
      return;
    }
    
    this.visitValue(answer);
  }
  visitValue(answer: Exporter.ExportDataEntry) {
    const path = answer.id.split(".");    
    const last = this.visitId(path[path.length-1], answer);
    if(path.length > 1) {
      this.visitLast(path.slice(0, path.length-1), answer)[last] = answer.value;
    } else {
      this._result[last] = answer.value;
    }    
  }
  
  visitLast(path: string[], answer: Exporter.ExportDataEntry): {} {
    let last = this._result;
    
    const isInt = (value: string) => !isNaN(Number(value));
    
    for(let index = 0; index < path.length; index++) {
      const id = path[index];      
      if(isInt(id)) {
        const arrayPos = Number.parseInt(id);
        if(!last[arrayPos]) {
          last[arrayPos] = {};
        }  
        last = last[arrayPos]; 
      } else {
        const nextIsArray = index + 1 < path.length && isInt(path[index + 1]);
        const objectPos = this.visitId(id, answer);
        if(!last[objectPos]) {
          last[objectPos] = nextIsArray ? [] : {};
        }  
        last = last[objectPos]; 
      }
    }
    return last;
  }
  
  visitId(id: string, answer: Integrations.FormAnswer): string {
    const translations = this._report.lang[this._locale];
    if(translations) {        
      const replacement = translations[id];
      const finalValue = replacement ? StringSanitizer.sanitize.addUnderscore(replacement) : id;
      console.log("REPLACING IDS: '" + id + "' => " + finalValue);
      return finalValue; 
    }
    return id;

  }
}

const sanitize = (props: {
  id: string,
  report: Exporter.Report, 
  answers: Exporter.ExportDataEntry[], 
  locale: string
}) => {
  
  return new DialobSanitizerImpl(props.id, props.report, props.answers, props.locale).visit();
}

export default sanitize;