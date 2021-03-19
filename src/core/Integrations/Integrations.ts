declare namespace Integrations {
  
  interface Creds {
    dialob: {url: string, apiKey: string};
  }
  
  interface Form {
    id: string;
    label: string
    formName: string;
    tagName: string;
    languages: string[];
    fields: Record<string, string>;
    translations: Record<string, Record<string, string>> // locale - translations
  }
  
  interface Questionnaire {
    id: string;
    formId: string;
    completed: boolean;
  }

  interface FormAnswer {
    id: string;
    value?: string;
    type: string;
  }
  
  interface DialobService {
    getForm(id: string): Promise<Form>;
    getQuestionnaires: () => Promise<Questionnaire[]>; // all questionnaires per formid
    getAnswers: (questionnaireId: string) => Promise<FormAnswer[]>; //returns questionnaire answers
  }
}

export type { Integrations }
