import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { App } from './App';
import i18n from './i18n';

let container = document.getElementById("app")!;
let root = createRoot(container)
root.render(
  <StrictMode>
    <I18nextProvider i18n={i18n}>
      <App />
    </I18nextProvider>
  </StrictMode>
);
