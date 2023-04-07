import { AVPlaybackStatus, ResizeMode, Video } from 'expo-av';
import { useEffect, useRef, useState } from 'react';
import { Button, View, StyleSheet, Text } from 'react-native';
import { LocalVideoClass } from './localVideoClass';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { SubtitleClass } from '../subtitle/subtitleClass';
import { useAppDispatch } from '../../../redux/hook';
import { updateSubtitleText } from '../subtitle/subtitleSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_RECORD_STORAGE_KEY = 'lastRecord';
const LAST_RECORD_TIME_STORAGE_KEY = 'lastRecordTime';

interface Record {
    videoName: string;
    videoUri: string;
    subtitleUri: string;
}

export function LocalVideo({ localVideoClass }: { localVideoClass: LocalVideoClass }) {
    const videoRef = useRef<Video>(null);
    const recordRef = useRef<Record>({} as Record);

    const [videoName, setVideoName] = useState('wait for play');

    const dispatch = useAppDispatch();

    useEffect(() => {
        localVideoClass.video = videoRef.current!;
        loadRecord();

        async function loadRecord() {
            let recordJsonValue = await AsyncStorage.getItem(LAST_RECORD_STORAGE_KEY);
            let recordTime = await AsyncStorage.getItem(LAST_RECORD_TIME_STORAGE_KEY);
            if (!recordJsonValue) {
                return;
            }
            let record: Record = JSON.parse(recordJsonValue);
            if (!record.videoUri) {
                return;
            }
            await loadMedia(record.videoUri, record.videoName);
            localVideoClass.seek(Number(recordTime));
            await loadSubtitle(record.subtitleUri);
        }
    }, []);

    async function selectMedia() {
        let result = await DocumentPicker.getDocumentAsync({ type: ['audio/*', 'video/*'] });
        if (result.type !== 'success') {
            return;
        }

        loadMedia(result.uri, result.name);
    }

    async function loadMedia(uri: string, name: string) {
        await videoRef.current!.loadAsync({
            uri: uri
        });
        localVideoClass.videoUri = uri;
        localVideoClass.videoName = name;

        recordRef.current.videoName = name;
        recordRef.current.videoUri = uri;
        AsyncStorage.setItem(LAST_RECORD_STORAGE_KEY, JSON.stringify(recordRef.current));

        setVideoName(name);
    }

    async function selectSubtitle() {
        if (!localVideoClass.video) {
            alert('please select media first');
            return;
        }
        let result = await DocumentPicker.getDocumentAsync({ type: 'application/x-subrip' });
        if (result.type !== 'success') {
            return;
        }
        loadSubtitle(result.uri);
    }

    async function loadSubtitle(uri: string) {
        let text = await FileSystem.readAsStringAsync(uri);
        localVideoClass.subtitleClass = new SubtitleClass(text);
        localVideoClass.setOntimeupdate((status: AVPlaybackStatus) => {
            if (!status.isLoaded || !localVideoClass.subtitleClass) {
                return;
            }
            let time = status.positionMillis / 1000;
            let subtitleText = localVideoClass.subtitleClass.nowSubtitleText;
            localVideoClass.subtitleClass.updateSubtitle(time);
            let newSubtitleText = localVideoClass.subtitleClass.nowSubtitleText;
            if (newSubtitleText !== subtitleText) {
                dispatch(updateSubtitleText(newSubtitleText));
            }

            // save record time
            AsyncStorage.setItem(LAST_RECORD_TIME_STORAGE_KEY, time.toString());
        });
        dispatch(updateSubtitleText('subtitle is loaded'));

        recordRef.current.subtitleUri = uri;
        AsyncStorage.setItem(LAST_RECORD_STORAGE_KEY, JSON.stringify(recordRef.current));
    }

    return (
        <View>
            <Text style={styles.videoName}>{videoName}</Text>
            <Video
                ref={videoRef}
                style={styles.video}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                status={{ androidImplementation: 'MediaPlayer' }}
            />
            <View>
                <View style={styles.videoButtons}>
                    <View style={styles.videoButton}>
                        <Button title="media" onPress={selectMedia} />
                    </View>
                    <View style={styles.videoButton}>
                        <Button title="subtitle" onPress={selectSubtitle} />
                    </View>
                </View>
                <View style={styles.videoButtons}>
                    <View style={styles.videoButton}>
                        <Button title="backward" onPress={localVideoClass.playPrev} />
                    </View>
                    <View style={styles.videoButton}>
                        <Button
                            title="Play"
                            onPress={async () => {
                                let status = await videoRef.current?.getStatusAsync();
                                if (!status || !status.isLoaded) {
                                    return;
                                }
                                if (status.isPlaying) {
                                    localVideoClass.pause();
                                } else {
                                    localVideoClass.play();
                                }
                            }}
                        />
                    </View>
                    <View style={styles.videoButton}>
                        <Button title="forward" onPress={localVideoClass.playNext} />
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    videoName: {
        alignSelf: 'center',
        margin: 10
    },
    video: {
        alignSelf: 'center',
        width: 350,
        height: 200,
        backgroundColor: '#000000',
        margin: 10
    },
    videoButtons: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        margin: 10
    },
    videoButton: {
        width: 100
    }
});
