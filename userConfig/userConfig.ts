import {
  CaiyunTranslator,
  YoudaoFreeTranslator,
} from "../localVideoPlayer/translate/translator";

import AnkiDroid from "react-native-ankidroid";

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
  let isApiAvailable = await AnkiDroid.isApiAvailable();
  console.log(isApiAvailable);
  await AnkiDroid.requestPermission();
  let permission = await AnkiDroid.checkPermission();
  console.log(permission);
  let deckList = await AnkiDroid.getDeckList();
  console.log(deckList);
  let modelList = await AnkiDroid.getModelList();
  console.log(modelList);
}

let translator = new YoudaoFreeTranslator();

function init() {
  initUserConfig();
  initAnkiConfig();
}

export { init, translator };
