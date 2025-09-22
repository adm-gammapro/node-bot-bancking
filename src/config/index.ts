import 'dotenv/config';
export default Object.freeze({
  server: {
    isProduction: process.env.NODE_ENV === 'production' ? true : false,
    port: process.env.PORT,
    key_access: process.env.KEY_ACCESS,
    allowed_ips: process.env.ALLOWED_IPS?.split(',') || [],
    logs_path: process.env.LOGS_PATH,
    service_2captcha: process.env.SERVICE_2CAPTCHA
  },
  portal_bank: {
    bbva_url: process.env.BBVA_URL,
    bcp_url: process.env.BCP_URL
  }
});
