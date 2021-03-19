import { Integrations } from './Integrations';



interface DialobQuestionnaire {
  id: string;
  metadata: {
    status: string;
    formId: string;
  }
}

interface DialobTag {
  id: string;
  name: string;
  formName: string;
}

interface DialobForm {
  _id: string;
  name: string;
  metadata: {
    label: string;
    languages: string[];
  },
  data: Record<string, {
    id: string,
    type: string,
    label?: Record<string, string>, // locale-locale label
  }>;
}

function query<T>(creds: Integrations.Creds, path: string): Promise<T> {
  const init: RequestInit = { method: "GET", headers: { 'x-api-key': creds.dialob.apiKey } };
  const url = creds.dialob.url + path;
  return fetch(url, init).then(response => {
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return response.json();
  })
};

class DialobServiceImpl implements Integrations.DialobService {
  private creds: Integrations.Creds;

  constructor(creds: Integrations.Creds) {
    this.creds = creds;
  }

  async getForm(formId: string): Promise<Integrations.Form> {
    const tags = await query<DialobTag[]>(this.creds, `forms/${formId}/tags`);
    const form = await query<DialobForm>(this.creds, `forms/${formId}`);
    const translations: Record<string, Record<string, string>> = {};
    const fields: Record<string, string> = {};
    
    for(const lang of form.metadata.languages) {
      translations[lang] = { };
    }
    
    for(const field of Object.values(form.data)) {
      fields[field.id] = field.type;
      
      if(!field.label) {
        for(const lang of form.metadata.languages) {
          translations[lang][field.id] = field.id;
        }
        continue;
      }
      
      for(const lang of Object.keys(field.label)) {
        try {
          translations[lang][field.id] = field.label[lang];
        } catch(e) {
          translations[lang][field.id] = field.id;
        }
      }
    }
    
    return {
      id: formId,
      label: form.metadata.label,
      formName: form.name,
      tagName: tags.length === 0 ? 'LATEST' : tags[0].name,
      languages: form.metadata.languages,
      translations: translations,
      fields: fields
    };
  }
  async getQuestionnaires(): Promise<Integrations.Questionnaire[]> {      
    return await query<DialobQuestionnaire[]>(this.creds, "questionnaires")
      .then(values => values.map(v => ({
          id: v.id,
          completed: v.metadata.status === "COMPLETED",
          formId: v.metadata.formId
      })));
  }
  async getAnswers(questionnaireId: string): Promise<Integrations.FormAnswer[]> {
    return query(this.creds, `questionnaires/${questionnaireId}/answers`);
  };
}

export { DialobServiceImpl };