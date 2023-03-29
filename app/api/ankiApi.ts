import AnkiDroid from 'react-native-ankidroid-forked-by-ode233';
import { MEDIA_MIME_TYPE } from 'react-native-ankidroid-forked-by-ode233/dist/types';
import { AnkiExportAttr } from '../components/localVideoPlayer/translate/translatePopup';
import * as FileSystem from 'expo-file-system';
import { ToastAndroid } from 'react-native';

const ANKI_DECK_NAME = 'Learning words from context';
const ANKI_MODEL_NAME = 'Learning words from context';

// Used to save a reference to this deck in the SharedPreferences (can be any string)
const dbDeckReference = 'com.ode233.learningwordsfromcontextmobile.decks';
// Used to save a reference to this model in the SharedPreferences (can be any string)
const dbModelReference = 'com.ode233.learningwordsfromcontextmobile.models';

// List of card names that will be used in AnkiDroid (one for each direction of learning)
const cardNames = ['Card', ''];

// List of field names that will be used in AnkiDroid model
const modelFields = [
    'Timestamp',
    'Text',
    'TextPhonetic',
    'TextVoice',
    'TextTranslate',
    'Sentence',
    'SentenceVoice',
    'SentenceTranslate',
    'Remark',
    'PageIcon',
    'PageTitle',
    'PageUrl',
    'Img',
    'SentenceCloze'
];

const ANKI_CARD_FRONT_HTML = `
<section>{{cloze:SentenceCloze}}<section>

{{#Remark}}
    <section>{{Remark}}<section>
{{/Remark}}

<section class="srcImg">
{{Img}}
<div class="source">
{{PageIcon}}
<a href="{{PageUrl}}">{{PageTitle}}</a>
</div>
<section>

<section>
<div>{{TextTranslate}} {{TextVoice}} {{TextPhonetic}}</div>
<div>{{SentenceTranslate}} {{SentenceVoice}}</div>
<div>{{type:cloze:SentenceCloze}}</div>
</section>
`;

const ANKI_CARD_BACK_HTML = `
<section>{{cloze:SentenceCloze}}<section>

<section>{{type:cloze:SentenceCloze}}</section>

{{#Remark}}
    <section>{{Remark}}<section>
{{/Remark}}

<section class="srcImg">
{{Img}}
<div class="source">
{{PageIcon}}
<a href="{{PageUrl}}">{{PageTitle}}</a>
</div>
<section>

<section>
<div>{{TextTranslate}} {{TextVoice}} {{TextPhonetic}}</div>
<div>{{SentenceTranslate}} {{SentenceVoice}}</div>
</section>
`;

// eslint-disable-next-line spellcheck/spell-checker
const ANKI_CARD_CSS = `
.card {
    font-family: arial;
    font-size: 20px;
    text-align: center;
    color: #333;
    background-color: white;
  }
  
  a {
    color: #5caf9e;
  }
  
  input {
    border: 1px solid #eee;
  }
  
  section {
    margin: 1em 0;
  }
  
  .trans {
    border: 1px solid #eee;
    padding: 0.5em;
  }
  
  .trans_title {
    display: block;
    font-size: 0.9em;
    font-weight: bold;
  }
  
  .trans_content {
    margin-bottom: 0.5em;
  }
  
  .cloze {
    font-weight: bold;
    color: #f9690e;
  }
  
  .source {
    margin: 0.5em 0;
    position: relative;
    font-size: .8em;
  }
  
  .source img {
    height: .7em;
  }
  
  .source a {
    text-decoration: none;
  }
  
  .typeGood {
    color: #fff;
    background: #1EBC61;
  }
  
  .typeBad {
    color: #fff;
    background: #F75C4C;
  }
  
  .typeMissed {
    color: #fff;
    background: #7C8A99;
  }

  .source img {
    width: inherit;
  }
`;

const questionFormat = [ANKI_CARD_FRONT_HTML, ''];
const answerFormat = [ANKI_CARD_BACK_HTML, ''];

const deckProperties = {
    name: ANKI_DECK_NAME,
    dbReference: dbDeckReference
};

const modelProperties = {
    name: ANKI_MODEL_NAME,
    dbReference: dbModelReference,
    fields: modelFields,
    cardNames,
    questionFormat,
    answerFormat,
    css: ANKI_CARD_CSS
};

const settings = {
    modelId: undefined,
    modelProperties: modelProperties,
    deckId: undefined,
    deckProperties: deckProperties
};

export const testNote = [
    'Timestamp',
    'Text',
    'TextPhonetic',
    'TextVoice',
    'TextTranslate',
    'Sentence',
    'SentenceVoice',
    'SentenceTranslate',
    'Remark',
    'PageIcon',
    'PageTitle',
    'PageUrl',
    'Img',
    'SentenceCloze'
];

let ankiDeck: AnkiDroid;
checkAnkiAvailable().then((isAvailable) => {
    if (isAvailable) {
        initAnkiConfig();
        ToastAndroid.showWithGravity('Anki init success!', ToastAndroid.SHORT, ToastAndroid.BOTTOM);
    }
});

async function checkAnkiAvailable(): Promise<boolean> {
    let isApiAvailable = await AnkiDroid.isApiAvailable();
    if (!isApiAvailable) {
        alert('AnkiDroid API is not available');
        return false;
    }
    await AnkiDroid.requestPermission();
    let permission = await AnkiDroid.checkPermission();
    if (!permission) {
        alert('AnkiDroid API permission is not granted');
        return false;
    }
    return true;
}

async function initAnkiConfig() {
    ankiDeck = new AnkiDroid(settings);
}

export const addNote = async (ankiExportAttr: AnkiExportAttr) => {
    if (!ankiDeck) {
        alert('Please connect anki first');
        return;
    }

    let timestamp = Date.now().toString();

    let text = ankiExportAttr.text;
    let textPhonetic = '';
    let textVoice = await uploadMediaFromUri(ankiExportAttr.textVoiceUrl, `textVoice`, 'audio');
    let textTranslate = ankiExportAttr.textTranslate;

    let sentence = ankiExportAttr.sentence;
    let sentenceVoice = await uploadMediaFromUri(ankiExportAttr.contentVoiceDataUrl, `sentenceVoice`, 'audio');
    let sentenceTranslate = ankiExportAttr.sentenceTranslate;

    let remark = ankiExportAttr.remark;

    let pageIcon = ankiExportAttr.pageIconUrl;
    let pageTitle = ankiExportAttr.pageTitle;
    let pageUrl = ankiExportAttr.pageUrl;

    let img = await uploadMediaFromUri(ankiExportAttr.contentImgDataUrl, `img`, 'image');

    let sentenceCloze = ankiExportAttr.sentence.replaceAll(ankiExportAttr.text, `{{c1::${ankiExportAttr.text}}}`);

    const valueFields = [
        timestamp,
        text,
        textPhonetic,
        textVoice,
        textTranslate,
        sentence,
        sentenceVoice,
        sentenceTranslate,
        remark,
        pageIcon,
        pageTitle,
        pageUrl,
        img,
        sentenceCloze
    ];

    let res = await ankiDeck.addNote(valueFields, modelFields);
    let err = res[0];
    if (err != null) {
        alert('add note error');
        return;
    }
    ToastAndroid.showWithGravity('Note add success!', ToastAndroid.SHORT, ToastAndroid.BOTTOM);
};

async function uploadMediaFromUri(uri: string, preferredName: string, mimeType: MEDIA_MIME_TYPE) {
    if (!uri) {
        return '';
    }
    let fileUri = uri;
    if (uri.startsWith('http')) {
        let res = await FileSystem.downloadAsync(uri, FileSystem.cacheDirectory + preferredName + '.mp3');
        if (res.status != 200) {
            alert(`download meida error: ${uri}, ${res.status}`);
            throw new Error(`download error: ${uri}, ${res.status}`);
        }
        fileUri = res.uri;
    }

    let cUri = await FileSystem.getContentUriAsync(fileUri);
    let res = await AnkiDroid.uploadMediaFromUri(cUri, preferredName, mimeType);

    let err = res[0];
    if (err != null) {
        alert(`upload meida error, file uri:${uri}. please open anki and try again.`);
        throw err;
    }
    let ankiValue = res[1];
    if (!ankiValue) {
        alert(`upload meida error, file uri:${uri}. please open anki and try again.`);
        throw new Error(`upload meida error: ${uri}`);
    }
    console.log(ankiValue);

    return ankiValue;
}
