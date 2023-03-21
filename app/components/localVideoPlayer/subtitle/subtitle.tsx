import { useEffect, useRef, useState } from 'react';
import {
    TextInput,
    StyleSheet,
    DeviceEventEmitter,
    NativeSyntheticEvent,
    TextInputSelectionChangeEventData
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../../../redux/hook';
import { openDictPopup } from '../translate/translatePopupSlice';
import { stopVideo } from '../video/localVideoSlice';
import { selectSubtitleText } from './subtitleSlice';

export interface SubtitleSelectionData {
    text: string;
    sentence: string;
}

export function Subtitle() {
    const subtitleText = useAppSelector(selectSubtitleText);
    const dispatch = useAppDispatch();

    const onSubtitleSelectionChange = async (event: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
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
        let SubtitleSelectionData: SubtitleSelectionData = {
            text: text,
            sentence: sentence
        };
        dispatch(stopVideo());
        dispatch(openDictPopup(SubtitleSelectionData));
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