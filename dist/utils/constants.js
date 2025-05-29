"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_VALUES = exports.MAGIC_NUMBERS = exports.API_INTEGRATION = exports.SERVER = exports.DB_COLUMNS = void 0;
// TODO: Need to make DB_COLUMNS a type
exports.DB_COLUMNS = {
    PROJECT: {
        UUID: 'uuid',
        NAME: 'name',
        DESCRIPTION: 'description',
        DUE_DATE: 'dueDate',
        COLOR: 'color',
        CREATED_AT: 'createdAt',
        UPDATED_AT: 'updatedAt',
        STATUS_UUID: 'statusUuid',
    },
    STATUS: {
        UUID: 'uuid',
        NAME: 'name',
        COLOR: 'color',
        CREATED_AT: 'createdAt',
        UPDATED_AT: 'updatedAt',
    },
};
exports.SERVER = {
    DEVELOPMENT: 'development',
    PRODUCTION: 'production',
    TRUST_PROXY: 'trust proxy',
    DEFAULT_PORT_NUMBER: 8000,
    LOCALHOST_URLS: ['http://localhost:3000'],
};
exports.API_INTEGRATION = {
    GOOGLE: {
        USER_INFO_SCOPES: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email',
        ],
        USER_INFO_URL: 'https://www.googleapis.com/oauth2/v2/userinfo',
    },
    GITHUB: {
        TOKEN_URL: 'https://github.com/login/oauth/access_token',
        USER_INFO_URL: 'https://api.github.com/user',
        EMAILS_URL: 'https://api.github.com/user/emails',
        REVOKE_URL: (clientId) => `https://api.github.com/applications/${clientId}/token`,
    },
};
exports.MAGIC_NUMBERS = {
    ONE_MINUTE_IN_MILLISECONDS: 60 * 1000,
    ONE_DAY_IN_MILLISECONDS: 24 * 60 * 60 * 1000,
    ONE_WEEK_IN_MILLISECONDS: 7 * 24 * 60 * 60 * 1000,
    ONE_MONTH_IN_MILLISECONDS: 30 * 24 * 60 * 60 * 1000,
    FIFTEEN_MINUTES_IN_MILLISECONDS: 15 * 60 * 1000,
    THIRTY_SECONDS_IN_MILLISECONDS: 30 * 1000,
    ONE_DAY_IN_SECONDS: 24 * 60 * 60,
    FIVE_MINUTES_IN_SECONDS: 5 * 60,
    FIFTEEN_MINUTES_IN_SECONDS: 15 * 60,
    MAX_FILE_SIZE: 5 * 1024 * 1024,
    OTP_LENGTH: 6,
    NUMBER_OF_BYTES: 32,
    MAX_NUMBER_OF_ALLOWED_REQUESTS: {
        ONE: 1,
        TEN: 10,
    },
};
exports.DEFAULT_VALUES = {
    PROJECTS: {
        name: '🚀 First Launch',
        description: 'Every great journey begins with a single step. Use this project to plan and achieve your first milestone!',
        color: '#007bff',
    },
    TASKS: {
        name: '📅 Plan Your Week',
        description: 'Add your top three priorities for the week and start managing your time effectively',
    },
};
