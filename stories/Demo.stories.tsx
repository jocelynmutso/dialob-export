import * as React from 'react';
import { IntlProvider } from 'react-intl';

import { ExporterView, ExporterAuth, Exporter } from '../src'
import { testAuth } from './auth';
import en from './en';

const messages: { [key: string]: any } = {
  en
};

export default { title: 'Exporter stories' };

export const showExportGrid = () => {
  const auth: ExporterAuth = testAuth;
  return (

    <IntlProvider locale={'en'} messages={{ ...messages['en'] }}>
      <ExporterView auth={auth} listeners={{
        onSave: (data: Exporter.Export) => console.log(data)
      }} />
    </IntlProvider>
  );
};



