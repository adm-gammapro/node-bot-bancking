import { Page } from 'puppeteer';
import moment from 'moment';
import logger from '../../utils/logger';

class viewBalance {
  private readonly page: Page;
  private readonly data: any;

  constructor(page: Page, data: any) {
    this.page = page;
    this.data = data;
  }

  formatearAccount(accountNumber: string) {
    // Verifica si la longitud del número es válida
    if (accountNumber.length !== 25) {
      return accountNumber;
    }

    accountNumber = accountNumber.slice(5);

    // Formatea el número insertando guiones en las posiciones adecuadas
    const accountNumberFormateado = `${accountNumber.slice(
      0,
      8
    )}${accountNumber.slice(10, 20)}`;

    return accountNumberFormateado;
  }

  todayInPeriod(periodStart: string, periodEnd: string) {
    const today = moment().format('YYYY-MM-DD');
    if (periodStart == today || periodEnd == today) {
      return true;
    }
    return false;
  }

  formatNumber(amount: string) {
    console.log('typeof amount: ', typeof amount);
    console.log('amount: ', amount);
    return parseFloat(amount.trim().replace(/[\s,]+/g, ''));
  }

  public async execute(): Promise<any> {
    const account_bank = this.data.cuentaBancaria;
    if (!this.page) {
      throw new Error('Page not initialized. Call initialize() first.');
    }

    // CLIC ITEM CUENTA:
    await this.page.evaluate(() => {
      const menuAccount = document.querySelector<HTMLElement>(
        // 'body > app-root > ng-component > div > div > div.dashboard-page__right-side-campaigns > ng-component > module-federation-adapter > ng-component > mft-wc-wrapper > div > ele-saldos-movimientos > app-layout > div > ntlc-menu > div > div > div > bcp-tab-group > div > ul > bcp-tab-header:nth-child(2) > li'
        'body > app-root > ng-component > div > div > div.dashboard-page__right-side-campaigns > ng-component > module-federation-adapter > ng-component > mft-wc-wrapper > div > ele-saldos-movimientos > app-layout > div > ntlc-menu > div > div > div > bcp-tab-group-9nbaaa > div > ul > bcp-tab-header-9nbaaa:nth-child(2) > li'
      ) as HTMLElement;
      if (menuAccount == null) {
        throw new Error(
          'Item <INFORMACIÓN DE CUENTAS> del menu no encontrado.'
        );
      }

      menuAccount.click();
    });

    // TABLA CUENTAS
    // await this.page.waitForSelector('body > app-root > ng-component > div > div > div.dashboard-page__right-side-campaigns > ng-component > module-federation-adapter > ng-component > mft-wc-wrapper > div > ele-saldos-movimientos > app-layout > div > app-accounts-list > div.container-fluid.accounts > div > div > div:nth-child(3) > div > bcp-data-table > div.data-table-container > bcp-table > div', { timeout: 30000 });
    await this.page.waitForSelector('body > app-root > ng-component > div > div > div.dashboard-page__right-side-campaigns > ng-component > module-federation-adapter > ng-component > mft-wc-wrapper > div > ele-saldos-movimientos > app-layout > div > app-accounts-list > div.container-fluid.accounts > div > div > div:nth-child(3) > div > bcp-data-table-9nbaaa > div.data-table-container > bcp-table-9nbaaa > div', { timeout: 30000 });
    
    await new Promise(resolve => setTimeout(resolve, 500));

    // const rows = await this.page.$$('body > app-root > ng-component > div > div > div.dashboard-page__right-side-campaigns > ng-component > module-federation-adapter > ng-component > mft-wc-wrapper > div > ele-saldos-movimientos > app-layout > div > app-accounts-list > div.container-fluid.accounts > div > div > div:nth-child(3) > div > bcp-data-table > div.data-table-container > bcp-table > div > div.cols-center.has-pinned-cols-left > div > bcp-table-row');
    const rows = await this.page.$$('body > app-root > ng-component > div > div > div.dashboard-page__right-side-campaigns > ng-component > module-federation-adapter > ng-component > mft-wc-wrapper > div > ele-saldos-movimientos > app-layout > div > app-accounts-list > div.container-fluid.accounts > div > div > div:nth-child(3) > div > bcp-data-table-9nbaaa > div.data-table-container > bcp-table-9nbaaa > div > div.cols-center.has-pinned-cols-left > div > bcp-table-row-9nbaaa')

    // const textTable = await this.page.evaluate(() => {
    //   const tableContent = document.querySelector(
    //     'body > app-root > ng-component > div > div > div.dashboard-page__right-side > app-base'
    //   );

    //   if (tableContent == null) throw new Error('Tabla no encontrada.');
    //   if (!tableContent.shadowRoot) throw new Error('Tabla no encontrada.');

    //   const table = tableContent.shadowRoot.querySelector(
    //     'app-list-accounts > div.container-fluid.p-t-40.accounts > div > div > div > ntlc-handsome-grid > div > div > table'
    //   );

    //   if (table == null) {
    //     throw new Error('No se encontro la tabla');
    //   }

    //   return table.outerHTML;
    // });

    // logger.info('Tabla extraida...');

    // const cheerio_load = cheerio.load(textTable);
    // const jsonData: any = [];

    // cheerio_load('tr').each((index, element) => {
    //   const row = {};
    //   cheerio_load(element)
    //     .find('td')
    //     .each((index, element) => {
    //       const columnName = `column${index + 1}`;
    //       // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //       // @ts-ignore
    //       row[columnName] = cheerio_load(element).text().trim();
    //     });

    //   jsonData.push(row);
    // });

    // logger.info('Datos extraidos.');

    // const dataAccount = jsonData.slice(1).findIndex((element: any) => {
    //   return (
    //     element['column2'].replace(/-|\n/g, '').substring(0, 13) == account_bank
    //   );
    // });

    // console.log('dataAccount: ', dataAccount);

    // if (dataAccount < 0) {
    //   throw new AutomatorError(`Cuenta ${account_bank} no encontrada.`);
    // }

    for (const row of rows) {
      console.log('row: ', row);
      const cuentaSelectorCol = 'bcp-table-col-9nbaaa:nth-child(2)';
      const cuenta = await row.$eval(cuentaSelectorCol, el => {
        const element = el as HTMLElement;
        return element.innerText.trim().replace(/\D/g, '');
      });

      console.log('cuenta: ', cuenta);
      console.log('account_bank: ', account_bank);

      if (cuenta ===  account_bank) {
        await row.$eval(cuentaSelectorCol, el => {
          const element = el as HTMLElement;
          return element.click();
        });
        break;
      }
    }

    logger.info('Clic a la cuenta en consultar.');
    // CLIC EN CUENTA A CONSULTAR:
    // await this.page.evaluate((idxAccount) => {
    //   const pageContent = document.querySelector<HTMLElement>(
    //     'body > app-root > ng-component > div > div > div.dashboard-page__right-side > app-base'
    //   );

    //   if (pageContent == null) throw new Error('Elemento no encontrado.');
    //   if (!pageContent.shadowRoot) throw new Error('Elemento no encontrado.');

    //   const element = pageContent.shadowRoot.querySelector(
    //     `app-list-accounts > div.container-fluid.p-t-40.accounts > div > div > div > ntlc-handsome-grid > div > div > table > tbody > tr:nth-child(${
    //       idxAccount + 1
    //     }) > td.handsome-grid__body-element.handsome-grid__body-element--relative.handsome-grid__body-element-text-left`
    //   ) as HTMLElement;

    //   if (element == null) {
    //     throw new Error('Item <cuenta> del menu no encontrado.');
    //   }

    //   element.click();
    // }, dataAccount);

    // TODO: VALIDAR EXISTENCIA DEL COMPONENTE
    await new Promise(resolve => setTimeout(resolve, 4000));

    logger.info('Esperando que el loading desaparesca...');
    await this.page.waitForSelector(
      'body > app-root > ntlc-loader > div.loading-area.center',
      {
        hidden: true,
        timeout: 60000
      }
    );
    logger.info('loading desaparecido...');

    await new Promise(resolve => setTimeout(resolve, 1000));

    await this.page.waitForSelector('body > app-root > ng-component > div > div > div.dashboard-page__right-side > ng-component > module-federation-adapter > ng-component > mft-wc-wrapper > div > ele-sym-account-detail > app-layout > app-account-detail > div.container-fluid.account-detail.d-print-none > div:nth-child(4) > div.account-detail__movements > div > app-filter-last-movements > form > div > div.col-12.col-xl-9 > div > div.col-8.col-lg-6.height-fields > bcp-datepicker-range-bpbaaa > div > bcp-datepicker-range-header-bpbaaa > div > div:nth-child(1) > bcp-input-bpbaaa');
    await this.page.click('body > app-root > ng-component > div > div > div.dashboard-page__right-side > ng-component > module-federation-adapter > ng-component > mft-wc-wrapper > div > ele-sym-account-detail > app-layout > app-account-detail > div.container-fluid.account-detail.d-print-none > div:nth-child(4) > div.account-detail__movements > div > app-filter-last-movements > form > div > div.col-12.col-xl-9 > div > div.col-8.col-lg-6.height-fields > bcp-datepicker-range-bpbaaa > div > bcp-datepicker-range-header-bpbaaa > div > div:nth-child(1) > bcp-input-bpbaaa');

    // MENU - Movimientos historicos
    // await this.page.evaluate(() => {
    //   const pageContent = document.querySelector<HTMLElement>(
    //     'body > app-root > ng-component > div > div > div.dashboard-page__right-side > app-base'
    //   );

    //   if (pageContent == null) throw new Error('Elemento no encontrado.');
    //   if (!pageContent.shadowRoot) throw new Error('Elemento no encontrado.');

    //   const element = pageContent.shadowRoot.querySelector(
    //     'app-tab-header > div > div > div:nth-child(2) > bcp-tab-group > div > ul > bcp-tab-header:nth-child(2) > li'
    //   ) as HTMLElement;

    //   if (element == null) {
    //     throw new Error('Item <cuenta> del menu no encontrado.');
    //   }

    //   element.click();
    // });

    // await this.page.waitForTimeout(2000);
    // PRUEBA
    // await this.page.evaluate(() => {
    //   const pageContent = document.querySelector<HTMLElement>(
    //     'body > app-root > ng-component > div > div > div.dashboard-page__right-side > app-base'
    //   );

    //   if (pageContent == null) throw new Error('Elemento no encontrado.');
    //   if (!pageContent.shadowRoot) throw new Error('Elemento no encontrado.');

    //   const element = pageContent.shadowRoot.querySelector(
    //     'app-movements-historical > div.container-fluid.p-t-40.historical-movements > div > bcp-card > div > bcp-card-content > div > div > app-filter-movements > form > div > div.col-8.col-xl-6.height-fields > bcp-datepicker-range > div > bcp-datepicker-range-header > div > div:nth-child(1) > bcp-input > div > input'
    //   ) as HTMLInputElement;

    //   if (element == null) {
    //     throw new Error('Input inicio no encontrado.');
    //   }
    //   element.focus();
    // });

    // await this.page.keyboard.press('Tab');
    // logger.info('TAB 1');
    // await this.page.waitForTimeout(1000);

    // await this.page.keyboard.press('Tab');
    // logger.info('TAB 2');
    // await this.page.waitForTimeout(1000);

    // await this.page.keyboard.press('Tab');
    // logger.info('TAB 2');
    // await this.page.waitForTimeout(1000);

    // await this.page.keyboard.press('Tab');
    // logger.info('TAB 2');
    // await this.page.waitForTimeout(1000);

    // await this.page.keyboard.press('Tab');
    // logger.info('TAB 2');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // SET - FECHA DE INICIO
    await this.page.keyboard.type(
      moment(this.data.fechaInicio, 'YYYY-MM-DD').format('DD/MM/YYYY')
    );

    await new Promise(resolve => setTimeout(resolve, 500));
    await this.page.keyboard.press('Tab');
    await new Promise(resolve => setTimeout(resolve, 500));

    // SET - FECHA DE FIN
    await this.page.keyboard.type(
      moment(this.data.fechaFin, 'YYYY-MM-DD').format('DD/MM/YYYY')
    );

    await new Promise(resolve => setTimeout(resolve, 500));

    await this.page.keyboard.press('Tab');
    await this.page.keyboard.press('Tab');
    await this.page.keyboard.press('Tab');
    logger.info('TAB 3');

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Clic submit
    await this.page.click("body > app-root > ng-component > div > div > div.dashboard-page__right-side > ng-component > module-federation-adapter > ng-component > mft-wc-wrapper > div > ele-sym-account-detail > app-layout > app-account-detail > div.container-fluid.account-detail.d-print-none > div:nth-child(4) > div.account-detail__movements > div > app-filter-last-movements > form > div > div.col-xl-3.text-xl-left.text-right.filter-last-movements__btn-content.col-12 > bcp-button-bpbaaa:nth-child(2)")

    await new Promise(resolve => setTimeout(resolve, 1000));

    // label movimientos
    logger.info('Buscando por los filtros...');

    await this.page.waitForSelector('body > app-root > ng-component > div > div > div.dashboard-page__right-side > ng-component > module-federation-adapter > ng-component > mft-wc-wrapper > div > ele-sym-account-detail > app-layout > app-account-detail > div.container-fluid.account-detail.d-print-none > ntlc-grid > div > div.row.align-items.p-t-b-25 > div.col-12.col-xl-8 > bcp-table-counter-bpbaaa > div > div > bcp-paragraph-bpbaaa:nth-child(2)');

    logger.info('Label cargado correctamente!');    

    const labelContent = await this.page.evaluate(() => {
      const element = document.querySelector(
        'body > app-root > ng-component > div > div > div.dashboard-page__right-side > ng-component > module-federation-adapter > ng-component > mft-wc-wrapper > div > ele-sym-account-detail > app-layout > app-account-detail > div.container-fluid.account-detail.d-print-none > ntlc-grid > div > div.row.align-items.p-t-b-25 > div.col-12.col-xl-8 > bcp-paragraph-bpbaaa > p'
      );

      if (element && element.textContent) {
        return element.textContent
          .toString()
          .replace('movimiento(s)', '')
          .trim();
      }

      return 0;
    });

    logger.info(`Existen [${labelContent}] registros`);

    await new Promise(resolve => setTimeout(resolve, 1000));

    // verifica si hay navegacion de pagina
    const navPage = await this.page.evaluate(() => {
      // TODO: PARA CUANDO TENGA MAS REGISTROS
      // const pageContent = document.querySelector<HTMLElement>(
      //   'body > app-root > ng-component > div > div > div.dashboard-page__right-side > app-base'
      // );

      // if (pageContent == null) throw new Error('Elemento no encontrado.');
      // if (!pageContent.shadowRoot) throw new Error('Elemento no encontrado.');

      // const element = pageContent.shadowRoot.querySelector(
      //   'app-movements-historical > div.container-fluid.p-t-40.historical-movements > div.historical-movements__filter-data > div.row.justify-content-md-center.m-t-b-10 > bcp-pagination > div > div > nav > ul'
      // );
      // if (element) {
      //   const pages = element.querySelectorAll('.page-container p');
      //   return pages.length;
      // }

      return 1;
    });

    logger.info(`Navegacion de la tabla encontrada: ${navPage}`);

    // logger.info(DATA);
    const DATA: any = [];

    // app-movements-historical > div.container-fluid.p-t-40.historical-movements > div.historical-movements__filter-data > ntlc-handsome-grid > div > div > table > tbody:nth-child(3)

    // document.querySelector("body > app-root > ng-component > div > div > div.dashboard-page__right-side > app-base")
    // .shadowRoot.querySelector("app-movements-historical > div.container-fluid.p-t-40.historical-movements > div.historical-movements__filter-data > ntlc-handsome-grid > div > div > table > tbody:nth-child(3)")

    for (let index = 1; index <= navPage; index++) {
      const lines = await this.page.evaluate(() => {

        const elementTbody = document.querySelectorAll(
          'body > app-root > ng-component > div > div > div.dashboard-page__right-side > ng-component > module-federation-adapter > ng-component > mft-wc-wrapper > div > ele-sym-account-detail > app-layout > app-account-detail > div.container-fluid.account-detail.d-print-none > ntlc-grid > div > div:nth-child(2) > div > bcp-data-table-bpbaaa > div.data-table-container > bcp-table-bpbaaa > div > div.cols-center.has-pinned-cols-left > div > bcp-table-row-bpbaaa'
        );
        if (elementTbody == null) throw new Error('Registros no encontrado.');

        const result = [];

        let index = 0;
        for (const record of elementTbody) {

          if (index === 0) { // Omitir la primera fila
            index++; 
            continue;
          }

          console.log('record: ', record);

          // record.style.background = 'red'; 
          const cells = record.querySelectorAll('bcp-table-col-bpbaaa');
          console.log('cells: ', cells);
          result.push({
            date: cells[0].textContent?.replace(/\n/g, '').trim(),
            valuta_date: cells[1].textContent?.replace(/\n/g, '').trim(),
            description: cells[2].textContent?.replace(/\n/g, '').trim(),
            operation: cells[3].textContent?.replace(/\n/g, '').trim(),
            amount: cells[4].textContent
              ?.replace(/\n/g, '')
              .replace(/S\/|,/g, '')
              .trim()
              .toString()
          });
        }

        return result;
      });

      console.log(`!!!!!!! ${index}`);
      console.log('lines: ', lines.length);

      DATA.push(...lines);

      // Clic submit
      // await this.page.evaluate((page) => {
      //   const pageContent = document.querySelector<HTMLElement>(
      //     'body > app-root > ng-component > div > div > div.dashboard-page__right-side > app-base'
      //   );

      //   if (pageContent == null) throw new Error('Elemento no encontrado.');
      //   if (!pageContent.shadowRoot) throw new Error('Elemento no encontrado.');

      //   const element = pageContent.shadowRoot.querySelector(
      //     `app-movements-historical > div.container-fluid.p-t-40.historical-movements > div.historical-movements__filter-data > div.row.justify-content-md-center.m-t-b-10 > bcp-pagination > div > div > nav > ul > li:nth-child(${page})`
      //   ) as HTMLInputElement;

      //   if (element == null) {
      //     throw new Error('Input inicio no encontrado.');
      //   }

      //   element.click();
      // }, index);

      // await this.page.waitForTimeout(5000);

      index++; 
    }

    console.log(JSON.stringify(DATA, null, 4));

    return DATA.map((e: any) => ({
      fecha_operacion: moment(e.date, 'DD/MM/YYYY').format('DD-MM-YYY'),
      fecha_valor: moment(e.date, 'DD/MM/YYYY').format('DD-MM-YYY'),
      concepto: e.description,
      cargo:
        this.formatNumber(e.amount) < 0
          ? Math.abs(this.formatNumber(e.amount))
          : 0,
      abono:
        this.formatNumber(e.amount) > 0
          ? Math.abs(this.formatNumber(e.amount))
          : 0
    }));
  }
}

export default viewBalance;
