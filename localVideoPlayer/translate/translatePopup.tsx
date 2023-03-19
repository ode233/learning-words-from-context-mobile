import React, { useEffect, useRef, useState } from 'react';
import {
    ScrollView,
    View,
    Text,
    Button,
    StyleSheet,
    DeviceEventEmitter,
    StyleProp,
    ViewStyle,
    Modal,
    Dimensions
} from 'react-native';
import { translator } from '../../userConfig/userConfig';
import { SubtitleSelectionChangeData } from '../subtitle/subtitle';
import { ContextFromVideo } from '../video/localVideoClass';
import { FontAwesome } from '@expo/vector-icons';
import { Audio } from 'expo-av';

const YOUDAO_VOICE_URL = 'https://dict.youdao.com/dictvoice?type=0&audio=';
const DICT_POPUP_WIDTH = 300;
const DICT_POPUP_HEIGHT = 300;

export class TranslateAttr {
    public text = '';
    public textVoiceUrl = '';
    public textTranslate = '';
    public sentence = '';
    public sentenceVoiceUrl = '';
    public sentenceTranslate = '';
    public contentVoiceDataUrl = '';
    public contentImgDataUrl = '';
}

export function TranslatePopup() {
    const [dictPopupVisible, setDictPopupVisible] = useState(false);
    const translateAttrRef = useRef(new TranslateAttr());
    useEffect(() => {
        DeviceEventEmitter.addListener('onSubtitleSelectionChange', async (data: SubtitleSelectionChangeData) => {
            translateAttrRef.current.text = data.text;
            translateAttrRef.current.textVoiceUrl = YOUDAO_VOICE_URL + data.text;
            translateAttrRef.current.textTranslate = await translator.translate(data.text);
            translateAttrRef.current.sentence = data.sentence;
            translateAttrRef.current.sentenceVoiceUrl = YOUDAO_VOICE_URL + data.sentence;
            translateAttrRef.current.sentenceTranslate = await translator.translate(data.sentence);
            setDictPopupVisible(true);
        });

        return () => {
            DeviceEventEmitter.removeAllListeners('onSubtitleSelectionChange');
            DeviceEventEmitter.removeAllListeners('onGetContextFromVideoFinish');
        };
    }, []);

    const exportToAnki = async () => {
        // let resolvePromise;
        // let promise = new Promise<ContextFromVideo>((resolve) => {
        //     resolvePromise = resolve;
        // });
        // DeviceEventEmitter.emit('getContextFromVideo', resolvePromise);
        // let contextFromVideo = await promise;
        // console.log(contextFromVideo);
        // translateAttrRef.current.contentVoiceDataUrl = contextFromVideo.voiceDataUrl;
    };

    return (
        <View>
            <Modal
                style={styles.dictPopup}
                animationType="slide"
                transparent={true}
                visible={dictPopupVisible}
                onRequestClose={() => {
                    setDictPopupVisible(!dictPopupVisible);
                }}
            >
                <View style={styles.centeredView}>
                    <View style={styles.dictPopup}>
                        <ScrollView>
                            <Text>
                                {translateAttrRef.current.text}
                                &nbsp;&nbsp;&nbsp;&nbsp;
                                <FontAwesome
                                    style={styles.volumeUpBottom}
                                    name="volume-up"
                                    color="black"
                                    onPress={() => {
                                        playAudio(translateAttrRef.current.textVoiceUrl);
                                    }}
                                />
                            </Text>
                        </ScrollView>
                        <ScrollView>
                            <Text>{translateAttrRef.current.textTranslate}</Text>
                        </ScrollView>
                        <ScrollView>
                            <Text>
                                {translateAttrRef.current.sentence}
                                &nbsp;&nbsp;&nbsp;&nbsp;
                                <FontAwesome
                                    style={styles.volumeUpBottom}
                                    name="volume-up"
                                    color="black"
                                    onPress={() => {
                                        playAudio(translateAttrRef.current.sentenceVoiceUrl);
                                    }}
                                />
                            </Text>
                        </ScrollView>
                        <ScrollView>
                            <Text>{translateAttrRef.current.sentenceTranslate}</Text>
                        </ScrollView>
                        <View style={styles.popupButtons}>
                            <Button title="export" onPress={exportToAnki} />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
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
        height: DICT_POPUP_HEIGHT,
        width: DICT_POPUP_WIDTH,
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        justifyContent: 'center',
        // alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    popupEntry: {
        margin: 5
    },
    popupButtons: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        margin: 10
    },
    volumeUpBottom: {
        marginStart: 50,
        fontSize: 16
    }
});
