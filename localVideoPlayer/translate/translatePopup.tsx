import { useEffect, useRef, useState } from 'react';
import { ScrollView, View, Text, Button, StyleSheet, DeviceEventEmitter } from 'react-native';
import { translator } from '../../userConfig/userConfig';
import { SubtitleSelectionChangeData } from '../subtitle/subtitle';
import { ContextFromVideo } from '../video/localVideoClass';

class TranslatePopupAttrs {
    public dictLoading = true;
    public dictDisplay: 'none' | 'flex' = 'none';
    public dictLeft = 0;
    public dictTop = 0;
    public text = '';
    public textPhonetic = '';
    public textVoiceUrl = '';
    public textTranslate = '';
    public sentence = '';
    public sentenceVoiceUrl = '';
    public sentenceTranslate = '';
    public remark = '';
    public pageIconUrl = '';
    public pageTitle = '';
    public pageUrl = '';
    public contentVoiceDataUrl = '';
    public contentImgDataUrl = '';
    public ankiOpen = false;
    public isLoadingAnki = false;
}

export function TranslatePopup() {
    const [popupAttrs, setPopupAttrs] = useState(new TranslatePopupAttrs());
    useEffect(() => {
        DeviceEventEmitter.addListener('onSubtitleSelectionChange', async (data: SubtitleSelectionChangeData) => {
            let newPopupAttrs = new TranslatePopupAttrs();
            newPopupAttrs.text = data.text;
            newPopupAttrs.textTranslate = await translator.translate(newPopupAttrs.text);
            newPopupAttrs.sentence = data.sentence;
            newPopupAttrs.sentenceTranslate = await translator.translate(newPopupAttrs.sentence);
            newPopupAttrs.dictDisplay = 'flex';
            setPopupAttrs(newPopupAttrs);
        });

        DeviceEventEmitter.addListener('onGetContextFromVideoFinish', async (data: ContextFromVideo) => {
            let newPopupAttrs = new TranslatePopupAttrs();
            console.log(data.voiceDataUrl);
        });

        return () => {
            DeviceEventEmitter.removeAllListeners('onSubtitleSelectionChange');
            DeviceEventEmitter.removeAllListeners('onGetContextFromVideoFinish');
        };
    }, []);

    const exportToAnki = useRef(async () => {
        let resolvePromise;
        let promise = new Promise<ContextFromVideo>((resolve) => {
            resolvePromise = resolve;
        });
        DeviceEventEmitter.emit('getContextFromVideo', resolvePromise);
        let contextFromVideo = await promise;
        console.log(contextFromVideo);
    });

    return (
        <View style={[styles.popup, { display: popupAttrs.dictDisplay }]}>
            <ScrollView>
                <Text>{popupAttrs.text}</Text>
            </ScrollView>
            <ScrollView>
                <Text>{popupAttrs.textTranslate}</Text>
            </ScrollView>
            <ScrollView>
                <Text>{popupAttrs.sentence}</Text>
            </ScrollView>
            <ScrollView>
                <Text>{popupAttrs.sentenceTranslate}</Text>
            </ScrollView>
            <View style={styles.popupButtons}>
                <Button title="export" onPress={exportToAnki.current} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    popup: {
        margin: 10,
        height: 300
    },
    popupEntry: {
        margin: 5
    },
    popupButtons: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        margin: 10
    }
});
