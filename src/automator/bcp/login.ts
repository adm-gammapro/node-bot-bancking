import { Page } from 'puppeteer';

import logger from '../../utils/logger';
import config from '../../config/';
import AutomatorError from '../automatorError';
import { Solver } from '2captcha';
import QuerySelectors from './querySelectors';
import { configLoader } from 'tsconfig-paths/lib/config-loader';

const solver = new Solver(String(config.server.service_2captcha));

class Login {
  private readonly page: Page;
  private readonly data: any;

  constructor(page: Page, data: any) {
    this.page = page;
    this.data = data;
  }

  async _login() {
    if (!this.page) {
      throw new Error('Page not initialized. Call initialize() first.');
    }

    logger.info('Logging in...');
    await this.page.waitForTimeout(5000);

    logger.info('Ingresando tarjeta...');
    await this.page.waitForSelector(QuerySelectors.inputLogin);
    await this.page.type(QuerySelectors.inputLogin, '');
    await this.page.type(QuerySelectors.inputLogin, this.data.codigoUsuario);

    await this.page.keyboard.press('Tab');
    await this.page.keyboard.press('Tab');

    await this.page.waitForTimeout(2000);

    

    

    
    logger.info('Mapeando selector para ingresar la clave...');
    // CODE : POSITION 1 - 10
    const key_map: any = {};
    for (let index = 1; index <= 10; index++) {
      // const query_selector_key = `document.querySelector("#passbc").shadowRoot.querySelector("div.input-password > div > bcp-keyboard > div > div > bcp-keyboard-key:nth-child(${index}) > div > bcp-title > h3")`;
      const query_selector_key = `document.querySelector("body > app-root > ciam-session-card > div > div > div > div.col.session-card__content > div.row.session-card__form > div > ciam-form-session-card > div > div > form > div.card-form__password > div > div > bcp-input-password").shadowRoot.querySelector("div.input-password > div > bcp-keyboard > div > div > bcp-keyboard-key:nth-child(${index}) > div > bcp-title > h3")`;
      console.log('query_selector_key: ', query_selector_key);
      const aHandle = await this.page.evaluateHandle(query_selector_key);
      console.log('aHandle: ', aHandle);
      const resultHandle = await this.page.evaluateHandle((body: any) => {
        return body.innerHTML;
      }, aHandle);
      console.log('resultHandle: ', resultHandle);
      const content = await resultHandle.jsonValue();
      key_map[parseInt(content).toString()] = index;
    }

    logger.info(key_map);

    logger.info('Ingresando clave...');

    for (const digit of this.data.claveAcceso) {
      logger.info(`${digit} -> key_map[digit]`)
      logger.info(`${digit} -> ${key_map[digit]}`)
      // const digit_selector = `document.querySelector("#passbc").shadowRoot.querySelector("div.input-password > div > bcp-keyboard > div > div > bcp-keyboard-key:nth-child(${key_map[digit]})")`;
      const digit_selector = `document.querySelector("body > app-root > ciam-session-card > div > div > div > div.col.session-card__content > div.row.session-card__form > div > ciam-form-session-card > div > div > form > div.card-form__password > div > div > bcp-input-password").shadowRoot.querySelector("div.input-password > div > bcp-keyboard > div > div > bcp-keyboard-key:nth-child(${key_map[digit]})")`;
      const button = await (
        await this.page.evaluateHandle(digit_selector)
      ).asElement();

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      button.click();

      await this.page.waitForTimeout(200);
    }

    

    logger.info('Obteniendo captcha...');

    const img_selector = `document.querySelector("body > app-root > ciam-session-card > div > div > div > div.col.session-card__content > div.row.session-card__form > div > ciam-form-session-card > div > div > form > div.card-form__captcha > div > div > bcp-captcha > div > bcp-img > img")`;
    const aHandle = await this.page.evaluateHandle(img_selector);
    // console.log('aHandle: ', aHandle);
    const resultHandle = await this.page.evaluateHandle((body: any) => {
      return body.src;
    }, aHandle);
    const content_img = await resultHandle.jsonValue();
    // console.log('content_img: ', content_img);

    // logger.info('Ingresa el captcha!!!!!!!');
    // await this.page.waitForTimeout(10000);

    if (!config.server.service_2captcha) {
      throw new Error('Servicio 2captcha no proporcionado.');
    }

    // NOTE: DESCOMENTAR
    const img_captcha = content_img.replace(
      'data:image/jpeg;charset=utf-8;base64,',
      ''
    );

    const response = await solver.imageCaptcha(img_captcha);

    // const response = {
    //   data: 'FAEWQW'
    // };

    logger.info(
      `SERVICE 2CAPTCHA RESPONSE: ${JSON.stringify(response, null, 4)}`
    );
    

    if (response.data) {
      await this.page.type(
        'body > app-root > ciam-session-card > div > div > div > div.col.session-card__content > div.row.session-card__form > div > ciam-form-session-card > div > div > form > div.card-form__captcha > div > div > bcp-captcha > div > div.bcp-ffw-col.input-container > bcp-input > div > input',
        response.data
      );
    } else {
      logger.error('No se pudo procesar captcha');
    }
    await this.page.waitForTimeout(1000);


    // TEST
    // logger.info("INGRESA CAPTCHAAA!!!!")
    // await this.page.waitForTimeout(10000);
    // END TEST

    await this.page.click(
      'body > app-root > ciam-session-card > div > div > div > div.col.session-card__content > div.row.session-card__form > div > ciam-form-session-card > div > div > form > div.card-form__button > div > div > bcp-button > button'
    );

    logger.info('Logging submit!...');

    await this.page.waitForTimeout(2000);

    const errorLogin = await this.page.evaluate(() => {
      const titleError = document.querySelector<HTMLElement>(
        'body > app-root > app-card-login > div > div > div.col > div.alertConf > bcp-alert > div'
      );
      if (titleError && titleError.innerText) {
        const msgError = document.querySelector<HTMLElement>(
          'body > app-root > app-card-login > div > div > div.col > div.alertConf > bcp-alert > div > div > bcp-paragraph > p'
        );

        if (msgError && msgError.innerText) {
          return msgError.innerText;
        }
      }
      return false;
    });

    if (errorLogin) {
      logger.error(errorLogin);
      if (errorLogin == 'El captcha ingresado es incorrecto.') {
        this._login();
      } else {
        throw new AutomatorError(errorLogin);
      }
    }

    await this.page.waitForNavigation();

    logger.info('Pagina cargada...');

    // TODO: Realizar mas pruebas
    await this.page.waitForTimeout(3000);

    logger.info('Esperando que el loading desaparesca...');
    // document.querySelector(
    //   'body > app-root > ntlc-loader > div.loading-area.center'
    // );

    // document.querySelector('body > app-root > app-loader');

    // await this.page.waitForSelector('body > app-root > app-loader', {
    //   hidden: true
    // });
    await this.page.waitForSelector(
      'body > app-root > ntlc-loader > div.loading-area.center',
      {
        hidden: true,
        timeout: 60000
      }
    );

    const menuSearched = await this.page
      .waitForSelector('#ntlc-side-nav', { timeout: 10000 })
      .then(() => true)
      .catch(() => false);

    if (!menuSearched) {
      throw new AutomatorError(
        'Ocurrio un error al buscar el menu en la pagina'
      );
    }
  }

  public async execute(): Promise<any> {
    await this._login();
  }
}

export default Login;
