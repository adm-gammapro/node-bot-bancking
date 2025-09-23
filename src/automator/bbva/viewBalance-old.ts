import { Page } from 'puppeteer';
import cheerio from 'cheerio';

import logger from '../../utils/logger';
import AutomatorError from '../automatorError';

class viewBalance {
  private readonly page: Page;
  private readonly data: any;

  constructor(page: Page, data: any) {
    this.page = page;
    this.data = data;
  }

  public async execute(): Promise<any> {
    const account_bank = this.data.cuentaBancaria;

    if (!this.page) {
      throw new Error('Page not initialized. Call initialize() first.');
    }

    logger.info('Navigating in the menu to the view...');

    // Dirigirse a la vista en el menu
    await this.page.evaluate(() => {
      const menuOption000000200A = document.querySelector<HTMLElement>(
        '#kyop-menuOption-000000200A-menuLeft'
      );

      if (menuOption000000200A == null) {
        throw new Error(
          'Item <INFORMACIÓN DE CUENTAS> del menu no encontrado.'
        );
      }

      menuOption000000200A.click();

      const opcionMenuHijam000000323E = document.querySelector<HTMLElement>(
        '#kyop-opcionMenuHija_m_000000323E-menuLeft'
      );

      if (opcionMenuHijam000000323E == null) {
        throw new Error('Item <Saldos Contables> del menu no encontrado.');
      }

      opcionMenuHijam000000323E.click();
    });

    //Click al hipervinculo Consulta de Estado de Cuenta
    await this.page.evaluate(() => {
      const menuOption000000200A = document.querySelector<HTMLElement>(
        '#kyop-otherlevel-0 > div > div > ul > li > a'
      );

      if (menuOption000000200A == null) {
        throw new Error(
          'Elemento <Consulta de Estado de Cuenta> en la vista no encontrado.'
        );
      }

      menuOption000000200A.click();
    });

    // navegando en la vista
    const elementHandleFrame = await this.page.waitForSelector(
      '#kyop-central-load-area'
    );
    if (!elementHandleFrame) throw new Error('FRAME NO CARGADO');

    const frame = await elementHandleFrame.contentFrame();
    if (!frame) throw new Error('Error al buscar el frame');

    // Seleccionar cuenta del combo
    await frame.waitForSelector('#AsuntoPropio');
    const selectElement = await frame.$('#AsuntoPropio');
    if (!selectElement) throw new Error('Select no ubicado');

    logger.info('Select encontrado');

    await new Promise(resolve => setTimeout(resolve, 3000));

    const selectOptions = await selectElement.$$('option');

    // Encuentra la opción que contiene la palabra "carro" (puedes ajustar la búsqueda según tus necesidades).
    let optionToSelect;
    for (const option of selectOptions) {
      const optionText = await option.evaluate((node) => node.value);
      if (optionText && optionText.includes(account_bank)) {
        optionToSelect = optionText;
        break;
      }
    }

    if (optionToSelect) {
      // Selecciona la opción encontrada.
      logger.info('Seleccionando cuenta...');
      await frame.select('#AsuntoPropio', optionToSelect);
    } else {
      throw new AutomatorError(
        `La cuenta ${account_bank}, no fue encontrada en la plataforma de BBVA.`
      );
    }

    await new Promise(resolve => setTimeout(resolve, 1500));

    await frame.evaluate(() => {
      const btnAceptar = document.querySelector<HTMLButtonElement>('#b1');
      if (btnAceptar == null) {
        throw new Error('Boton no encontrado');
      }
      btnAceptar.click();
    });

    await new Promise(resolve => setTimeout(resolve, 3000));

    logger.info('Accediendo a vista de la cuenta');

    const textTable = await frame.evaluate(() => {
      const tableContent = document.querySelector<HTMLTableElement>(
        'body > div.caja_tabla > table:nth-child(8)'
      );
      if (tableContent == null) {
        throw new Error('No se encontro la tabla');
      }

      return tableContent.outerHTML;
    });

    logger.info('Tabla extraida...');

    const cheerio_load = cheerio.load(textTable);
    const jsonData: any = [];

    cheerio_load('tr').each((index, element) => {
      const row = {};
      cheerio_load(element)
        .find('td')
        .each((index, element) => {
          const columnName = `column${index + 1}`;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          row[columnName] = cheerio_load(element).text().trim();
        });

      jsonData.push(row);
    });

    logger.info('Datos extraidos.');

    const resultData: object = {
      en_contra: jsonData[1]['column4'],
      a_favor: jsonData[1]['column5']
    };
    // await this.page.waitForTimeout(3600000);
    return resultData;
  }
}
//
//PEN - 001104860100193411
//USD - 001104860100164047
export default viewBalance;
