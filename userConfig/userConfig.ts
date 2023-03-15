import {
  CaiyunTranslator,
  YoudaoFreeTranslator,
} from "../localVideoPlayer/translate/translator";

class UserConfig {
  public caiyunToken = "";
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
  if (userConfig.caiyunToken) {
    translator = new CaiyunTranslator({ token: userConfig.caiyunToken });
  } else {
    translator = new YoudaoFreeTranslator();
  }
}

async function initAnkiConfig() {
  // TODO: initAnkiConfig
}

let translator = new YoudaoFreeTranslator();

function init() {
  initUserConfig();
  initAnkiConfig();
}

export { init, translator };
