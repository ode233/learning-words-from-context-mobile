import { useEffect, useRef } from 'react';
import { TextInput, StyleSheet, NativeSyntheticEvent, TextInputSelectionChangeEventData } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../../redux/hook';
import { openDictPopup } from '../translate/translatePopupSlice';
import { selectSubtitleText } from './subtitleSlice';
import { VideoController } from '../VideoController';

export interface SubtitleSelectionData {
    text: string;
    sentence: string;
}

export function Subtitle({ videoController }: { videoController: VideoController }) {
    const subtitleText = useAppSelector(selectSubtitleText);
    const dispatch = useAppDispatch();
    const subtitleRef = useRef<TextInput>(null);

    useEffect(() => {
        cancelSelection();
    }, [subtitleText]);

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
        console.log('onSubtitleSelectionChange');
        let text = sentence.slice(start, end);
        if (!isEnWordGroup(text)) {
            return;
        }
        let SubtitleSelectionData: SubtitleSelectionData = {
            text: text,
            sentence: sentence
        };
        videoController.pause();
        dispatch(openDictPopup(SubtitleSelectionData));

        cancelSelection();
    };

    function cancelSelection() {
        subtitleRef.current?.setNativeProps({ selection: { start: 0, end: 0 } });
        setTimeout(() => {
            subtitleRef.current?.blur();
        }, 10);
    }

    return (
        <TextInput
            ref={subtitleRef}
            style={styles.subtitle}
            showSoftInputOnFocus={false}
            multiline={true}
            numberOfLines={3}
            value={subtitleText}
            onTouchStart={() => {
                videoController.pause();
            }}
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
        top: 20,
        margin: 10,
        fontSize: 20,
        textAlign: 'center',
        maxHeight: 100
    }
});
