import { Page } from 'puppeteer';

import AutomatorError from '../automatorError';
import logger from '../../utils/logger';

const validateSessionActive = async (page: Page) => {
  if (!page) throw new Error('Page not initialized. Call initialize() first.');

  const hasComponent = await page.evaluate(() => {
    const empresa = document.querySelector('#empresa');
    const usuario = document.querySelector('#usuario');
    const clave_acceso = document.querySelector('#clave_acceso');
    const btnSubmit = document.querySelector('#aceptar');

    if (empresa || usuario || clave_acceso || btnSubmit) {
      return true;
    }
  });

  if (hasComponent) {
    throw new AutomatorError('Se finalizo la session por parte de BBVA');
  }
};

const goHome = async (page: Page) => {
  if (!page) {
    throw new Error('Page not initialized. Call initialize() first.');
  }
  await validateSessionActive(page);
  try {
    logger.info('Go home BCP');
    await page.evaluate(() => {
      const menuAccount = document.querySelector(
        "#ntlc-side-nav > ngx-simplebar > div.simplebar-wrapper > div.simplebar-mask > div > div > div > ul > li:nth-child(3) > div > ul > li > a"
      ) as HTMLElement;

      if (menuAccount == null) {
        throw new Error(
          'Item <INFORMACIÓN DE CUENTAS> del menu no encontrado.'
        );
      }

      menuAccount.click();
    });
    await new Promise(resolve => setTimeout(resolve, 2000));
    logger.info('Navigating to home...');
  } catch (error) {
    logger.info(error);
    throw new AutomatorError(
      'Ocurrio un error al ir a la pantalla principal de la web BBVA.'
    );
  }
};

export default goHome;
