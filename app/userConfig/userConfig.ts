import { CaiyunTranslator, YoudaoFreeTranslator } from './translator';

class UserConfig {
    public caiyunToken = '';
}

/**
 * get user config
 * @returns {UserConfig}
 */
function getUserConfig() {
    // TODO: getUserConfig
    return new UserConfig();
}

/**
 * set user config
 * @param {UserConfig} config
 * @returns {void}
 */
function setUserConfig(config: UserConfig) {
    // TODO: setUserConfig
}

function initUserConfig() {
    // init user config
    let userConfig = getUserConfig();
    userConfig.caiyunToken = '7yboofgmqoa5cbp2flgn';
    if (userConfig.caiyunToken) {
        translator = new CaiyunTranslator({ token: userConfig.caiyunToken });
    } else {
        translator = new YoudaoFreeTranslator();
    }
}

export let translator = new YoudaoFreeTranslator();

export function init() {
    initUserConfig();
}
