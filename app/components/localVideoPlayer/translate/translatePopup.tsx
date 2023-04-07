import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Button,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TouchableWithoutFeedback,
    ActivityIndicator
} from 'react-native';
import { translator } from '../../../userConfig/userConfig';
import { SubtitleSelectionData } from '../subtitle/Subtitle';
import { FontAwesome } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import styled from '@emotion/native';
import { openAnkiExportPopup, selectDictAttr, selectSubtitleSelectionData } from './translatePopupSlice';
import { useAppDispatch, useAppSelector } from '../../../redux/hook';
import { addNote } from '../../../api/ankiApi';
import { VideoController } from '../VideoController';

const YOUDAO_VOICE_URL = 'https://dict.youdao.com/dictvoice?type=0&audio=';
const DICT_POPUP_WIDTH = 300;
const DICT_POPUP_HEIGHT = 300;

export function TranslatePopup({ videoController }: { videoController: VideoController }) {
    return (
        <View>
            <DictPopup videoController={videoController}></DictPopup>
            <AnkiExportPopup videoController={videoController}></AnkiExportPopup>
        </View>
    );
}

function Loading() {
    return (
        <Modal transparent={true} onRequestClose={() => {}}>
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.2)'
                }}
            >
                <ActivityIndicator size="large" />
            </View>
        </Modal>
    );
}

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

const DictPopup = function DictPopup({ videoController }: { videoController: VideoController }) {
    const [dictPopupVisible, setDictPopupVisible] = useState(false);

    const subtitleSelectionData = useAppSelector(selectSubtitleSelectionData);
    const dispatch = useAppDispatch();

    const dictAttrRef = useRef({} as DictAttr);

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!subtitleSelectionData) {
            return;
        }
        setIsLoading(true);
        setDictAttrAsync(dictAttrRef.current, subtitleSelectionData).then(() => {
            setDictPopupVisible(true);
            setIsLoading(false);
        });
    }, [subtitleSelectionData]);

    const openAnkiPopup = async () => {
        setIsLoading(true);
        let contextFromVideo = await videoController.getContextFromVideo();
        if (!contextFromVideo.voiceDataUrl) {
            alert('Get context from video error');
            setIsLoading(false);
            return;
        }
        dictAttrRef.current.contentVoiceDataUrl = contextFromVideo.voiceDataUrl;
        dictAttrRef.current.contentImgDataUrl = contextFromVideo.imgDataUrl;
        setDictPopupVisible(false);
        dispatch(openAnkiExportPopup({ ...dictAttrRef.current }));
        setIsLoading(false);
    };

    return (
        <View>
            {isLoading && <Loading></Loading>}
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
                        videoController.play();
                        setDictPopupVisible(false);
                    }}
                >
                    <TouchableWithoutFeedback>
                        <View style={styles.dictPopup}>
                            <DictPopupEntry
                                value={dictAttrRef.current.text}
                                voiceUrl={dictAttrRef.current.textVoiceUrl}
                            ></DictPopupEntry>
                            <DictPopupEntry value={dictAttrRef.current.textTranslate}></DictPopupEntry>
                            <DictPopupEntry
                                value={dictAttrRef.current.sentence}
                                voiceUrl={dictAttrRef.current.sentenceVoiceUrl}
                            ></DictPopupEntry>
                            <DictPopupEntry value={dictAttrRef.current.sentenceTranslate}></DictPopupEntry>
                            <View style={styles.popupButtons}>
                                <Button title="export" onPress={openAnkiPopup} />
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

async function setDictAttrAsync(dictAttr: DictAttr, subtitleSelectionData: SubtitleSelectionData) {
    dictAttr.text = subtitleSelectionData.text;
    dictAttr.textVoiceUrl = YOUDAO_VOICE_URL + dictAttr.text;
    dictAttr.textTranslate = await translator.translate(dictAttr.text);
    dictAttr.sentence = subtitleSelectionData.sentence;
    dictAttr.sentenceVoiceUrl = YOUDAO_VOICE_URL + dictAttr.sentence;
    dictAttr.sentenceTranslate = await translator.translate(dictAttr.sentence);
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

function AnkiExportPopup({ videoController }: { videoController: VideoController }) {
    const [ankiExportPopupVisible, setAnkiExportPopupVisible] = useState(false);
    const [ankiExportAttr, setAnkiExportAttr] = useState({} as AnkiExportAttr);

    const dictAttr = useAppSelector(selectDictAttr);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (!dictAttr) {
            return;
        }
        setAnkiExportPopupVisible(true);
        createAnkiExportAttr(dictAttr, videoController.videoName!).then((ankiExportAttr) => {
            setAnkiExportAttr(ankiExportAttr);
        });
    }, [dictAttr]);

    function closeAnkiExportPopup() {
        setAnkiExportPopupVisible(false);
        videoController.play();
    }

    async function exportToAnki() {
        await addNote(ankiExportAttr);
        closeAnkiExportPopup();
    }

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={ankiExportPopupVisible}
            onRequestClose={() => {
                closeAnkiExportPopup();
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
                    voiceUrl={ankiExportAttr.contentVoiceDataUrl}
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
                    value={ankiExportAttr.pageTitle}
                    onValueChange={() => {}}
                ></AnkiExportPopupEntry>
                <AnkiExportPopupEntry
                    title="图片"
                    value={ankiExportAttr.remark}
                    onValueChange={() => {}}
                ></AnkiExportPopupEntry>
                <View style={styles.popupButtons}>
                    <View style={styles.popupButton}>
                        <Button title="close" onPress={closeAnkiExportPopup} />
                    </View>
                    <View style={styles.popupButton}>
                        <Button title="confirm" onPress={exportToAnki} />
                    </View>
                </View>
            </View>
        </Modal>
    );
}

async function createAnkiExportAttr(dictAttr: DictAttr, videoName: string) {
    let ankiExportAttr = {} as AnkiExportAttr;
    ankiExportAttr.text = dictAttr.text;
    ankiExportAttr.textVoiceUrl = dictAttr.textVoiceUrl;
    ankiExportAttr.textTranslate = dictAttr.textTranslate;
    ankiExportAttr.sentence = dictAttr.sentence;
    ankiExportAttr.sentenceVoiceUrl = dictAttr.sentenceVoiceUrl;
    ankiExportAttr.sentenceTranslate = dictAttr.sentenceTranslate;
    ankiExportAttr.contentVoiceDataUrl = dictAttr.contentVoiceDataUrl;
    ankiExportAttr.contentImgDataUrl = dictAttr.contentImgDataUrl;
    ankiExportAttr.remark = '';
    ankiExportAttr.pageIconUrl =
        '<img src="https://raw.githubusercontent.com/ode233/learning-words-from-context-mobile/main/assets/favicon.png"/>';
    ankiExportAttr.pageTitle = videoName;
    ankiExportAttr.pageUrl = '#';
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
    popupButton: {
        width: 100
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
