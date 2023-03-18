import { useEffect, useState } from 'react';
import { TextInput, StyleSheet, DeviceEventEmitter } from 'react-native';
import { SubtitleTextChangeEvent } from '../video/localVideo';

export interface SubtitleSelectionChangeEvent {
    text: string;
    sentence: string;
}

const PLEASE_ADD_SUBTITLE = 'please add subtitle';

export function Subtitle() {
    const [subtitleText, setSubtitleText] = useState<string>(PLEASE_ADD_SUBTITLE);

    useEffect(() => {
        DeviceEventEmitter.addListener('onSubtitleTextChange', async (event: SubtitleTextChangeEvent) => {
            setSubtitleText(event.subtitleText);
        });

        return () => {
            DeviceEventEmitter.removeAllListeners('onSubtitleTextChange');
        };
    }, []);

    const onSubtitleSelectionChange = async (event: { nativeEvent: { selection: { start: number; end: number } } }) => {
        let sentence = subtitleText;
        if (!sentence) {
            return;
        }
        let start = event.nativeEvent.selection.start;
        let end = event.nativeEvent.selection.end;
        if (start >= end) {
            return;
        }
        let text = sentence.slice(start, end);
        if (!isEnWordGroup(text)) {
            return;
        }
        let subtitleSelectionChangeEvent: SubtitleSelectionChangeEvent = {
            text: text,
            sentence: sentence
        };
        DeviceEventEmitter.emit('onSubtitleSelectionChange', subtitleSelectionChangeEvent);
    };

    return (
        <TextInput
            style={styles.subtitle}
            showSoftInputOnFocus={false}
            multiline={true}
            numberOfLines={3}
            value={subtitleText}
            onSelectionChange={onSubtitleSelectionChange}
        />
    );
}

let isEnWordGroupRegex = /^[a-zA-Z ]+$/;

function isEnWordGroup(sentence: string): boolean {
    if (!sentence) {
        return false;
    }
    let newSentence = sentence.trim();
    if (isEnWordGroupRegex.test(newSentence)) {
        return true;
    }
    return false;
}

const styles = StyleSheet.create({
    subtitle: {
        margin: 10,
        fontSize: 20,
        textAlign: 'center',
        maxHeight: 100
    }
});
