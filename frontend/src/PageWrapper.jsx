import React from 'react';
import { modulePageStyle } from './styles/moduleStyles';

const PageWrapper = ({ children }) => {
  return (
    <div style={modulePageStyle}>
      {children}
    </div>
  );
};

export default PageWrapper;
