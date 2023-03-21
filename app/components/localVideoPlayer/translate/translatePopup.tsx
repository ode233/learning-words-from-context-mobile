import React, { useEffect, useMemo, useState } from 'react';
import {
    View,
    Button,
    StyleSheet,
    DeviceEventEmitter,
    Modal,
    TouchableOpacity,
    TouchableWithoutFeedback
} from 'react-native';
import { translator } from '../../../userConfig/userConfig';
import { SubtitleSelectionChangeData } from '../subtitle/subtitle';
import { ContextFromVideo } from '../video/localVideoClass';
import { FontAwesome } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import styled from '@emotion/native';
import { openAnkiExportPopup, selectDictAttr } from './translatePopupSlice';
import { useAppDispatch, useAppSelector } from '../../../redux/hook';

const YOUDAO_VOICE_URL = 'https://dict.youdao.com/dictvoice?type=0&audio=';
const DICT_POPUP_WIDTH = 300;
const DICT_POPUP_HEIGHT = 300;

export function TranslatePopup() {
    return (
        <View>
            <DictPopup></DictPopup>
            <AnkiExportPopup></AnkiExportPopup>
        </View>
    );
}

export interface DictAttr {
    text: string;
    textVoiceUrl: string;
    textTranslate: string;
    sentence: string;
    sentenceVoiceUrl: string;
    sentenceTranslate: string;
    contentVoiceDataUrl: string;
    contentImgDataUrl: string;
}

const DictPopup = function DictPopup() {
    const [dictPopupVisible, setDictPopupVisible] = useState(false);
    const [dictAttr, setDictAttr] = useState({} as DictAttr);
    const dispatch = useAppDispatch();

    useEffect(() => {
        DeviceEventEmitter.addListener('onSubtitleSelectionChange', async (data: SubtitleSelectionChangeData) => {
            let newDictAttr = {} as DictAttr;
            newDictAttr.text = data.text;
            newDictAttr.textVoiceUrl = YOUDAO_VOICE_URL + data.text;
            newDictAttr.textTranslate = await translator.translate(data.text);
            newDictAttr.sentence = data.sentence;
            newDictAttr.sentenceVoiceUrl = YOUDAO_VOICE_URL + data.sentence;
            newDictAttr.sentenceTranslate = await translator.translate(data.sentence);
            setDictAttr(newDictAttr);
            setDictPopupVisible(true);
        });

        return () => {
            DeviceEventEmitter.removeAllListeners('onSubtitleSelectionChange');
            DeviceEventEmitter.removeAllListeners('onGetContextFromVideoFinish');
        };
    }, []);

    const exportToAnki = async () => {
        let resolvePromise;
        let promise = new Promise<ContextFromVideo>((resolve) => {
            resolvePromise = resolve;
        });
        // DeviceEventEmitter.emit('getContextFromVideo', resolvePromise);
        // let contextFromVideo = await promise;
        // if (!contextFromVideo.voiceDataUrl) {
        //     alert('Get context from video error');
        //     setTranslatePopupVisible(false);
        //     return;
        // }
        // translateAttrRef.current.contentVoiceDataUrl = contextFromVideo.voiceDataUrl;
        dictAttr.contentVoiceDataUrl = dictAttr.sentenceVoiceUrl;
        dispatch(openAnkiExportPopup(dictAttr));
        setDictPopupVisible(false);
    };

    return (
        <View>
            <Modal
                animationType="slide"
                transparent={true}
                visible={dictPopupVisible}
                onRequestClose={() => {
                    setDictPopupVisible(!dictPopupVisible);
                }}
            >
                <TouchableOpacity
                    style={styles.centeredView}
                    activeOpacity={1}
                    onPressOut={() => {
                        setDictPopupVisible(false);
                    }}
                >
                    <TouchableWithoutFeedback>
                        <View style={styles.dictPopup}>
                            <DictPopupEntry value={dictAttr.text} voiceUrl={dictAttr.textVoiceUrl}></DictPopupEntry>
                            <DictPopupEntry value={dictAttr.textTranslate}></DictPopupEntry>
                            <DictPopupEntry
                                value={dictAttr.sentence}
                                voiceUrl={dictAttr.sentenceVoiceUrl}
                            ></DictPopupEntry>
                            <DictPopupEntry value={dictAttr.sentenceTranslate}></DictPopupEntry>
                            <View style={styles.popupButtons}>
                                <Button title="export" onPress={exportToAnki} />
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const DictEntryContainer = styled.View({
    margin: 10
});

const DictEntryValueContainer = styled.View({
    flexDirection: 'row'
});

const DictiEntryScrollView = styled.ScrollView({
    maxHeight: 55
});

const DictEntryTextInput = styled.TextInput({
    width: '100%'
});

const DictEntryVolumeUp = styled(FontAwesome)({
    right: 0,
    fontSize: 16,
    verticalAlign: 'middle'
});

interface DictPopupEntryProps {
    value: string;
    voiceUrl?: string;
}

function DictPopupEntry({ value, voiceUrl }: DictPopupEntryProps) {
    return (
        <DictEntryContainer>
            <DictEntryValueContainer>
                <DictiEntryScrollView>
                    <DictEntryTextInput value={value} multiline showSoftInputOnFocus={false}></DictEntryTextInput>
                </DictiEntryScrollView>
                {voiceUrl && (
                    <DictEntryVolumeUp
                        name="volume-up"
                        color="black"
                        onPress={() => {
                            playAudio(voiceUrl);
                        }}
                    />
                )}
            </DictEntryValueContainer>
        </DictEntryContainer>
    );
}

export interface AnkiExportAttr {
    text: string;
    textVoiceUrl: string;
    textTranslate: string;
    sentence: string;
    sentenceVoiceUrl: string;
    sentenceTranslate: string;
    contentVoiceDataUrl: string;
    contentImgDataUrl: string;
    remark: string;
    pageIconUrl: string;
    pageTitle: string;
    pageUrl: string;
}

function AnkiExportPopup() {
    const [ankiExportPopupVisible, setAnkiExportPopupVisible] = useState(false);
    const dictAttr = useAppSelector(selectDictAttr);

    const [ankiExportAttr, setAnkiExportAttr] = useState({} as AnkiExportAttr);

    useEffect(() => {
        if (!dictAttr) {
            return;
        }
        setAnkiExportPopupVisible(true);
        setAnkiExportAttr(createAnkiExportAttr(dictAttr));
    }, [dictAttr]);

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={ankiExportPopupVisible}
            onRequestClose={() => {
                setAnkiExportPopupVisible(false);
            }}
        >
            <View style={styles.ankiExportPopup}>
                <AnkiExportPopupEntry
                    title="单词"
                    value={ankiExportAttr.text}
                    onValueChange={(value) => {
                        ankiExportAttr.text = value;
                        setAnkiExportAttr({ ...ankiExportAttr });
                    }}
                    voiceUrl={ankiExportAttr.textVoiceUrl}
                ></AnkiExportPopupEntry>
                <AnkiExportPopupEntry
                    title="翻译"
                    value={ankiExportAttr.textTranslate}
                    onValueChange={(value) => {
                        ankiExportAttr.textTranslate = value;
                        setAnkiExportAttr({ ...ankiExportAttr });
                    }}
                ></AnkiExportPopupEntry>
                <AnkiExportPopupEntry
                    title="上下文"
                    value={ankiExportAttr.sentence}
                    onValueChange={(value) => {
                        ankiExportAttr.sentence = value;
                        setAnkiExportAttr({ ...ankiExportAttr });
                    }}
                    voiceUrl={ankiExportAttr.sentenceVoiceUrl}
                ></AnkiExportPopupEntry>
                <AnkiExportPopupEntry
                    title="翻译"
                    value={ankiExportAttr.sentenceTranslate}
                    onValueChange={(value) => {
                        ankiExportAttr.sentenceTranslate = value;
                        setAnkiExportAttr({ ...ankiExportAttr });
                    }}
                ></AnkiExportPopupEntry>
                <AnkiExportPopupEntry
                    title="备注"
                    value={ankiExportAttr.remark}
                    onValueChange={(value) => {
                        ankiExportAttr.remark = value;
                        setAnkiExportAttr({ ...ankiExportAttr });
                    }}
                ></AnkiExportPopupEntry>
                <AnkiExportPopupEntry
                    title="来源"
                    value={ankiExportAttr.remark}
                    onValueChange={(value) => {
                        ankiExportAttr.remark = value;
                        setAnkiExportAttr({ ...ankiExportAttr });
                    }}
                ></AnkiExportPopupEntry>
                <AnkiExportPopupEntry
                    title="图片"
                    value={ankiExportAttr.remark}
                    onValueChange={(value) => {
                        ankiExportAttr.remark = value;
                        setAnkiExportAttr({ ...ankiExportAttr });
                    }}
                ></AnkiExportPopupEntry>
            </View>
        </Modal>
    );
}

const AnkiEntryContainer = styled.View({
    margin: 15
});
const AnkiEntryTitle = styled.TextInput({
    color: 'rgba(0, 0, 0, 0.6)'
});

const AnkiEntryValueContainer = styled.View({
    flexDirection: 'row',
    borderBottomColor: '#000000',
    borderBottomWidth: 1
});

const AnkiEntryScrollView = styled.ScrollView({
    maxHeight: 55
});

const AnkiEntryTextInput = styled.TextInput({
    width: '100%'
});

const AnkiEntryVolumeUp = styled(FontAwesome)({
    right: 0,
    fontSize: 16,
    verticalAlign: 'middle'
});

interface AnkiExportPopupEntryProps {
    title: string;
    value: string;
    onValueChange: (value: string) => void;
    voiceUrl?: string;
}

function AnkiExportPopupEntry({ title, value, onValueChange, voiceUrl }: AnkiExportPopupEntryProps) {
    return (
        <AnkiEntryContainer style={{ margin: 15 }}>
            <AnkiEntryTitle style={{ color: 'rgba(0, 0, 0, 0.6)' }}>{title}</AnkiEntryTitle>
            <AnkiEntryValueContainer>
                <AnkiEntryScrollView>
                    <AnkiEntryTextInput value={value} onChangeText={onValueChange} multiline></AnkiEntryTextInput>
                </AnkiEntryScrollView>
                {voiceUrl && (
                    <AnkiEntryVolumeUp
                        name="volume-up"
                        color="black"
                        onPress={() => {
                            playAudio(voiceUrl);
                        }}
                    />
                )}
            </AnkiEntryValueContainer>
        </AnkiEntryContainer>
    );
}

function createAnkiExportAttr(dictAttr: DictAttr) {
    let ankiExportAttr = {} as AnkiExportAttr;
    ankiExportAttr.text = dictAttr.text;
    ankiExportAttr.textVoiceUrl = dictAttr.textVoiceUrl;
    ankiExportAttr.textTranslate = dictAttr.textTranslate;
    ankiExportAttr.sentence = dictAttr.sentence;
    ankiExportAttr.sentenceVoiceUrl = dictAttr.sentenceVoiceUrl;
    ankiExportAttr.sentenceTranslate = dictAttr.sentenceTranslate;
    ankiExportAttr.contentVoiceDataUrl = dictAttr.contentVoiceDataUrl;
    ankiExportAttr.contentImgDataUrl = dictAttr.contentImgDataUrl;
    return ankiExportAttr;
}

function playAudio(uri: string) {
    const soundObject = new Audio.Sound();
    soundObject.loadAsync({ uri }).then(() => {
        soundObject.playAsync();
    });
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22
    },
    dictPopup: {
        height: 'auto',
        width: DICT_POPUP_WIDTH,
        margin: 10,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    popupButtons: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        margin: 10
    },
    dictVolumeUpBottom: {
        marginStart: 50,
        fontSize: 16
    },
    ankiExportPopup: {
        flex: 1,
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    ankiExportPopupEntry: {
        margin: 20
    }
});
