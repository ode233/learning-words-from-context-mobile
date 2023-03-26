import AnkiDroid from 'react-native-ankidroid';
import { MEDIA_MIME_TYPE } from 'react-native-ankidroid/dist/types';
import { AnkiExportAttr } from '../components/localVideoPlayer/translate/translatePopup';
import * as FileSystem from 'expo-file-system';

const ANKI_DECK_NAME = 'test233';
const ANKI_MODEL_NAME = 'test233';

// Used to save a reference to this deck in the SharedPreferences (can be any string)
const dbDeckReference = 'com.ode233.learningwordsfromcontextmobile.decks';
// Used to save a reference to this model in the SharedPreferences (can be any string)
const dbModelReference = 'com.ode233.learningwordsfromcontextmobile.models';

// List of card names that will be used in AnkiDroid (one for each direction of learning)
const cardNames = ['Card', ''];

// List of field names that will be used in AnkiDroid model
export const modelFields = [
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

export const createAnkiDeck = () => {
    const ankiDeck = new AnkiDroid(settings);
    return ankiDeck;
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

export const addNote = async (ankiDeck: AnkiDroid, ankiExportAttr: AnkiExportAttr) => {
    // TODO: file provider
    console.log('addNote', ankiExportAttr);

    let timestamp = Date.now().toString();
    let sentenceVoiceCUri = await FileSystem.getContentUriAsync(ankiExportAttr.contentVoiceDataUrl);
    let sentenceVoice = await uploadMediaFromUri(sentenceVoiceCUri, `${timestamp}_sentenceVoice.mp3`, 'audio');
    let text = ankiExportAttr.text;
    let textPhonetic = '';
    let textVoice = await uploadMediaFromUri(ankiExportAttr.textVoiceUrl, `${timestamp}_textVoice.mp3`, 'audio');
    let textTranslate = ankiExportAttr.textTranslate;
    let sentence = ankiExportAttr.sentence;
    let sentenceTranslate = ankiExportAttr.sentenceTranslate;
    let remark = ankiExportAttr.remark;
    let pageIcon = await uploadMediaFromUri(
        'https://raw.githubusercontent.com/ode233/learning-words-from-context/main/src/assets/icons/icon.png',
        `localVideoPlayer.ico`,
        'image'
    );
    let pageTitle = ankiExportAttr.pageTitle;
    let pageUrl = ankiExportAttr.pageUrl;
    let img = await uploadMediaFromUri(ankiExportAttr.contentImgDataUrl, `${timestamp}_img.jpeg`, 'image');
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
    await ankiDeck.addNote(valueFields, modelFields);
};

async function uploadMediaFromUri(uri: string, preferredName: string, mimeType: MEDIA_MIME_TYPE) {
    console.log(uri, preferredName, mimeType);
    let res = await AnkiDroid.uploadMediaFromUri(uri, preferredName, mimeType);
    console.log('uploadMediaFromUri', res);

    let err = res[0];
    if (err != null) {
        alert('upload media error: ' + err.message);
        throw err;
    }
    let name = res[1];
    if (!name) {
        alert('upload media error: ' + name);
        throw new Error('upload media error: ' + name);
    }

    return name;
}

function getPageIconName(pageIconUrl: string): string {
    let pageIconName;
    if (pageIconUrl.includes('chrome-extension://')) {
        pageIconName = 'localVideoPlayer.ico';
    } else {
        pageIconName = pageIconUrl.replaceAll('/favicon.ico', '');
        pageIconName = pageIconName.replaceAll('https://', '');
        pageIconName = pageIconName.replaceAll('http://', '');
        pageIconName = pageIconName.replaceAll('.', '-');
        pageIconName = pageIconName + '.ico';
    }
    return pageIconName;
}
