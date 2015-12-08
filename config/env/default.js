'use strict';

module.exports = {
  app: {
    title: 'analytics.sproutup.co',
    description: 'Analytics server',
    keywords: 'mysql, redis, express, angularjs, node.js, bookshelf, passport',
    googleAnalyticsTrackingID: process.env.GOOGLE_ANALYTICS_TRACKING_ID || 'GOOGLE_ANALYTICS_TRACKING_ID'
  },
  port: process.env.PORT || 3000,
  templateEngine: 'swig',
  // Session details
  // session expiration is set by default to 24 hours
  sessionExpiration: 24 * (60 * 1000),
  // sessionSecret should be changed for security measures and concerns
  sessionSecret: 'MEAN',
  // sessionKey is set to the generic sessionId key used by PHP applications
  // for obsecurity reasons
  sessionKey: 'sessionId',
  sessionCollection: 'sessions',
  logo: 'modules/core/img/brand/logo.png',
  favicon: 'modules/core/img/brand/favicon.ico',
  flyway: false,
  twitter: {
    clientID: process.env.TWITTER_CONSUMER_KEY || 'CONSUMER_KEY',
    clientSecret: process.env.TWITTER_CONSUMER_SECRET || 'CONSUMER_SECRET',
    accessID: process.env.TWITTER_ACCESS_TOKEN || 'ACCESS_TOKEN',
    accessSecret: process.env.TWITTER_ACCESS_SECRET || 'ACCESS_SECRET',
    callbackURL: process.env.OAUTH_1_CALLBACK || 'http://localhost:9000/oauth/1/callback',
    requestURL: 'https://api.twitter.com/oauth/request_token',
    authorizeURL: 'https://api.twitter.com/oauth/authorize',
    accessTokenURL: 'https://api.twitter.com/oauth/access_token'
  },
  facebook: {
    clientID: process.env.FACEBOOK_ID || 'APP_ID',
    clientSecret: process.env.FACEBOOK_SECRET || 'APP_SECRET',
    baseURL: 'https://',
    callbackURL: process.env.OAUTH_2_CALLBACK || 'http://localhost:9000/oauth2callback',
    requestURL: 'www.facebook.com/v2.0/dialog/oauth',
    authorizeURL: 'www.facebook.com/v2.0/dialog/oauth',
    accessTokenURL: 'graph.facebook.com/v2.0/oauth/access_token',
    scope: 'user_friends email public_profile user_likes', // 'email user_likes user_about_me user_posts read_insights'
    grant: 'authorization_code'
  },
  instagram: {
    clientID: process.env.INSTAGRAM_ID || 'APP_ID',
    clientSecret: process.env.INSTAGRAM_SECRET || 'APP_SECRET',
    baseURL: 'https://api.instagram.com',
    callbackURL: process.env.OAUTH_2_CALLBACK || 'http://localhost:9000/oauth/2/callback',
//    requestURL: 'https://api.instagram.com/oauth/authorize',
//    authorizeURL: 'oauth/access_token',
//    accessTokenURL: '/oauth/access_token',
    scope: 'basic', // 'comments relationships likes',
    grant: 'authorization_code'
  },
  pinterest: {
    clientID: process.env.PINTEREST_ID || 'APP_ID',
    clientSecret: process.env.PINTEREST_SECRET || 'APP_SECRET',
    baseURL: 'https://api.pinterest.com',
    requestURL: '/oauth',
    accessTokenURL: '/v1/oauth/token',
    callbackURL: process.env.OAUTH_2_CALLBACK || 'https://localhost:9000/oauth/2/callback',
//    requestURL: 'https://api.pinterest.com/oauth/',
    authorizeURL: 'https://api.pinterest.com/v1/oauth/token',
    scope: 'read_public write_public read_relationships write_relationships',
    grant: 'authorization_code'
  },
  google: {
    clientID: process.env.GOOGLE_ID || 'APP_ID',
    clientSecret: process.env.GOOGLE_SECRET || 'APP_SECRET',
    baseURL: 'https://',
    callbackURL: process.env.OAUTH_2_CALLBACK || 'http://localhost:9000/oauth/2/callback',
    requestURL: 'accounts.google.com/o/oauth2/auth',
    accessTokenURL: 'www.googleapis.com/oauth2/v3/token',
    revokeURL: '/o/oauth2/revoke',
    scope: {
      yt: 'profile email https://www.googleapis.com/auth/yt-analytics.readonly https://www.googleapis.com/auth/youtube.readonly',
      ga: 'profile email https://www.googleapis.com/auth/analytics.readonly'
    },
    grant: 'authorization_code'
  },
  ga: {
  },
  linkedin: {
    clientID: process.env.LINKEDIN_ID || 'APP_ID',
    clientSecret: process.env.LINKEDIN_SECRET || 'APP_SECRET',
    callbackURL: process.env.OAUTH_2_CALLBACK || '/api/auth/linkedin/callback'
  },
  github: {
    clientID: process.env.GITHUB_ID || 'APP_ID',
    clientSecret: process.env.GITHUB_SECRET || 'APP_SECRET',
    callbackURL: process.env.OAUTH_2_CALLBACK || '/api/auth/github/callback'
  },
  paypal: {
    clientID: process.env.PAYPAL_ID || 'CLIENT_ID',
    clientSecret: process.env.PAYPAL_SECRET || 'CLIENT_SECRET',
    callbackURL: '/api/auth/paypal/callback',
    sandbox: true
  },
  mailer: {
    from: process.env.MAILER_FROM || 'MAILER_FROM',
    options: {
      service: process.env.MAILER_SERVICE_PROVIDER || 'MAILER_SERVICE_PROVIDER',
      auth: {
        user: process.env.MAILER_EMAIL_ID || 'MAILER_EMAIL_ID',
        pass: process.env.MAILER_PASSWORD || 'MAILER_PASSWORD'
      }
    }
  }
};
