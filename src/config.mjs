import * as dotenv from 'dotenv';
dotenv.config(); // Load environment variables

export default {
  ISSUER_URL: process.env.ISSUER_URL || 'https://stg-id.singpass.gov.sg',
  CLIENT_ID: process.env.CLIENT_ID,
  REDIRECT_URI: process.env.REDIRECT_URI || 'https://sp-login-app-backend.onrender.com/callback',
  SCOPES: process.env.SCOPES || 'openid uinfin name',

  PRIVATE_SIG_KEY: {
    alg: 'ES256',
    kty: 'EC',
    x: 'gosQcx5KfTD4m6FC-zjnKK0EnAzXYU_ZCKzAoe7Fk_U',
    y: 'Dv-htpYQR-EOs8qM3Z0dulwYNnO0IsNI48fHggrEZIs',
    crv: 'P-256',
    d: '_h_uTjVw_mQlH1DK37U8mZWg6MLuFLZH74tqWFyzvr8',
    kid: 'my-sig-key',
  },
  PRIVATE_ENC_KEY: {
    alg: 'ECDH-ES+A256KW',
    kty: 'EC',
    x: '2JX0k43IMVnL-y9sCNSBBHW9KYhTzLc3umHiqxAqWZU',
    y: 'PUT YOUR Y VALUE HERE',
    crv: 'P-256',
    d: 'dJv1wdINlUBVIlsA2UJFPhgXzee7l2T2OtfYWUTJNUY',
    kid: 'o_loKmRXP3-kTJCMHxv6Cnj1ahNEJwMQvOWwBURt6Cs',
  },
  PUBLIC_SIG_KEY: {
    alg: 'ES256',
    kty: 'EC',
    x: 'gosQcx5KfTD4m6FC-zjnKK0EnAzXYU_ZCKzAoe7Fk_U',
    y: 'Dv-htpYQR-EOs8qM3Z0dulwYNnO0IsNI48fHggrEZIs',
    crv: 'P-256',
    use: 'sig',
    kid: 'my-sig-key',
  },
  PUBLIC_ENC_KEY: {
    alg: 'ECDH-ES+A256KW',
    kty: 'EC',
    x: '2JX0k43IMVnL-y9sCNSBBHW9KYhTzLc3umHiqxAqWZU',
    y: 'o_loKmRXP3-kTJCMHxv6Cnj1ahNEJwMQvOWwBURt6Cs',
    crv: 'P-256',
    use: 'enc',
    kid: 'my-enc-key',
  },
};

function validateConfig() {
  if (!process.env.CLIENT_ID) throw new Error('CLIENT_ID is missing');
  if (!process.env.PRIVATE_SIG_KEY || !process.env.PRIVATE_ENC_KEY) {
    throw new Error('Private keys are missing in environment variables');
  }
}
