import { Page } from 'puppeteer';

class viewBalance {
  private readonly page: Page;
  private readonly data: any;

  constructor(page: Page, data: any) {
    this.page = page;
    this.data = data;
  }

  stringToFloat(value: string) {
    const floatValue = parseFloat(value.replace(/,/g, ''));
    return isNaN(floatValue) ? 0 : floatValue;
  }

  public async execute(): Promise<any> {
    const account_bank = this.data.cuentaBancaria;

    if (!this.page) {
      throw new Error('Page not initialized. Call initialize() first.');
    }

    // CLIC ITEM CUENTA:
    await this.page.evaluate(() => {

      const menuAccount = document.querySelector<HTMLElement>(
        "#ntlc-side-nav > ngx-simplebar > div.simplebar-wrapper > div.simplebar-mask > div > div > div > ul > li:nth-child(3) > div > ul > li > a"
      ) as HTMLElement;
      if (menuAccount == null) {
        throw new Error(
          'Item <INFORMACIÓN DE CUENTAS> 1 del menu no encontrado.'
        );
      }

      menuAccount.click();
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    // CLIC ITEM CUENTA:
    await this.page.evaluate(() => {
      const menuAccount = document.querySelector<HTMLElement>(
        //'body > app-root > ng-component > div > div > div.dashboard-page__right-side-campaigns > ng-component > module-federation-adapter > ng-component > mft-wc-wrapper > div > ele-saldos-movimientos > app-layout > div > ntlc-menu > div > div > div > bcp-tab-group > div > ul > bcp-tab-header:nth-child(2) > li'
        "body > app-root > ng-component > div > div > div.dashboard-page__right-side-campaigns > ng-component > module-federation-adapter > ng-component > mft-wc-wrapper > div > ele-saldos-movimientos > app-layout > div > ntlc-menu > div > div > div > bcp-tab-group-9nbaaa > div > ul > bcp-tab-header-9nbaaa:nth-child(2) > li"
      ) as HTMLElement;
      if (menuAccount == null) {
        throw new Error(
          'Item <INFORMACIÓN DE CUENTAS> 2 del menu no encontrado.'
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


    let saldoDisponible = "";
    let saldoContable = "";
    
    for (const row of rows) {
      console.log('row: ', row);

      // const cuentaSelectorCol = 'bcp-table-col:nth-child(2)';
      const cuentaSelectorCol = 'bcp-table-col-9nbaaa:nth-child(2)';
      const cuenta = await row.$eval(cuentaSelectorCol, el => {
        const element = el as HTMLElement;
        return element.innerText.trim().replace(/\D/g, '');
      });

      console.log('cuenta: ', cuenta);
      console.log('account_bank: ', account_bank);

      if (cuenta ===  account_bank) {
        // Encuentra y extrae los valores de las columnas de saldo
        
        saldoDisponible = await row.$eval('bcp-table-col-9nbaaa:nth-child(6)', el => {
          const element = el as HTMLElement;
          return element.innerText.trim();
        });
        saldoContable = await row.$eval('bcp-table-col-9nbaaa:nth-child(8)', el => {
          const element = el as HTMLElement;
          return element.innerText.trim();
        });
  
        console.log('Saldo Disponible:', saldoDisponible);
        console.log('Saldo Contable:', saldoContable);
        break;
      }
    }

    const resultData: object = {
      saldo_contable: this.stringToFloat(
        saldoDisponible.replace(/[^\d.]/g, '')
      ),
      saldo_disponible: this.stringToFloat(
        saldoDisponible.replace(/[^\d.]/g, '')
      )
    };

    return resultData;
  }
}
export default viewBalance;
