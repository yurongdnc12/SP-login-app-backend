import config from './config.mjs';
import { Issuer, generators, custom } from 'openid-client';
import * as crypto from 'crypto';
import Router from 'koa-router';

// This demo uses panva/node-openid-client, an off-the-shelf OIDC client.
const singpassIssuer = await Issuer.discover(config.ISSUER_URL);
const singpassClient = new singpassIssuer.Client(
  {
    client_id: config.CLIENT_ID,
    response_types: ['code'],
    token_endpoint_auth_method: 'private_key_jwt',
    // ID Token Configuration (Encrypted)
    // ID Token Configuration
    id_token_signed_response_alg: 'ES256', // For signed ID tokens
    id_token_encrypted_response_alg: 'ECDH-ES+A256KW', // For encrypted ID tokens
    id_token_encrypted_response_enc: 'A256CBC-HS512', // Encryption method
    // Userinfo Configuration
    userinfo_signed_response_alg: 'ES256', // For signed userinfo responses
    userinfo_encrypted_response_alg: 'ECDH-ES+A256KW', // For encrypted userinfo responses
    userinfo_encrypted_response_enc: 'A256GCM', // Encryption method
  },
  { keys: [config.KEYS.PRIVATE_SIG_KEY, config.KEYS.PRIVATE_ENC_KEY] }
);

custom.setHttpOptionsDefaults({
  timeout: 15000,
});

// This demo uses Koa for routing.

const router = new Router();

router.get('/.well-known/jwks.json', function getJwks(ctx) {
  ctx.body = { keys: [config.KEYS.PUBLIC_SIG_KEY, config.KEYS.PUBLIC_ENC_KEY] };
});

router.get('/login', async function handleLogin(ctx) {
  const code_verifier = generators.codeVerifier();
  const code_challenge = generators.codeChallenge(code_verifier);
  const nonce = crypto.randomUUID();
  const state = crypto.randomBytes(16).toString('hex');
  ctx.session.auth = { code_verifier, nonce, state };

  // Authorization request
  const authorizationUrl = singpassClient.authorizationUrl({
    redirect_uri: config.REDIRECT_URI,
    code_challenge_method: 'S256',
    code_challenge,
    nonce,
    state,
    scope: config.SCOPES,
  });
  ctx.redirect(authorizationUrl);
});

router.get('/callback', async function handleSingpassCallback(ctx) {
  try {
    const receivedQueryParams = ctx.request.query;
    console.error('receivedQueryParams', receivedQueryParams);
    const { code_verifier, nonce, state } = ctx.session.auth; // Could possibly be hardcoded.
    console.error('ctx.session.auth', ctx.session.auth);
    console.error('config.KEYS.PRIVATE_ENC_KEY', config.KEYS.PRIVATE_ENC_KEY);
    // Token request
    const tokenSet = await singpassClient.callback(config.REDIRECT_URI, receivedQueryParams, {
      code_verifier,
      nonce,
      state,
    });

    console.error('These are the claims in the ID token:');
    console.error('Raw ID Token:', tokenSet.id_token);
    console.error(tokenSet.claims());

    // Userinfo request (available only to apps with additional allowed scopes, beyond just 'openid').
    // const userInfo = await singpassClient.userinfo(tokenSet); // -- OG
    const userInfo = await singpassClient.userinfo(tokenSet.access_token, {
      key: config.KEYS.PRIVATE_ENC_KEY, // Decrypt using the private encryption key
    });

    console.error('This is the user info returned:');
    console.error(userInfo);

    ctx.session.user = { ...tokenSet.claims(), ...userInfo };
    ctx.redirect(process.env.FRONTEND_URL || 'https://yr-learningmonth24.netlify.app/');
  } catch (err) {
    console.error('[ACTUAL ERROR]', err);
    ctx.status = 401;
  }
});

router.get('/user', function getUser(ctx) {
  if (ctx.session.user) {
    ctx.body = ctx.session.user;
  } else {
    ctx.status = 401;
  }
  // start temp
  console.log('Session ID:', ctx.cookies.get('koa:sess'));
  console.log('Session Data:', ctx.session);
  // end temp
});

router.get('/logout', function handleLogout(ctx) {
  ctx.session = null;
  ctx.redirect(process.env.FRONTEND_URL || 'https://yr-learningmonth24.netlify.app/');
});

export { router };
