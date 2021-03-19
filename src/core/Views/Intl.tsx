import React from 'react';
import { FormattedMessage } from 'react-intl';


interface IntlProps {
  id: string,
  values?: {},
}

const Intl: React.FC<IntlProps> = ({id, values}) => {
  return (
    <FormattedMessage id={id} values={values} />
  )
}


export {Intl}