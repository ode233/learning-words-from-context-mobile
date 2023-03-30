import { AVPlaybackStatus, ResizeMode, Video } from 'expo-av';
import { useEffect, useRef } from 'react';
import { Button, View, StyleSheet, Text } from 'react-native';
import { ContextFromVideo, LocalVideoClass } from './localVideoClass';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { SubtitleClass } from '../subtitle/subtitleClass';
import { useAppDispatch, useAppSelector } from '../../../redux/hook';
import { updateSubtitleText } from '../subtitle/subtitleSlice';
import {
    selectContextFromVideoTrigger,
    selectIsPlaying,
    selectVideoName,
    updateContextFromVideo,
    updateIsPlaying,
    updateVideoName
} from './localVideoSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_RECORD_STORAGE_KEY = 'lastRecord';
const LAST_RECORD_TIME_STORAGE_KEY = 'lastRecordTime';

interface Record {
    videoName: string;
    videoUri: string;
    subtitleUri: string;
}

export function LocalVideo() {
    const videoRef = useRef<Video>(null);
    const localVideoClassRef = useRef<LocalVideoClass>();
    const subtitleClassRef = useRef<SubtitleClass>();
    const recordRef = useRef<Record>({} as Record);

    const dispatch = useAppDispatch();
    // TODO: the re-render is not necessary, can only listen the change?
    const getContextFromVideoTrigger = useAppSelector(selectContextFromVideoTrigger);
    const isPlaying = useAppSelector(selectIsPlaying);
    const videoName = useAppSelector(selectVideoName);

    useEffect(() => {
        localVideoClassRef.current = new LocalVideoClass(videoRef.current!);
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
            localVideoClassRef.current?.seek(Number(recordTime));
            await loadSubtitle(record.subtitleUri);
        }
    }, []);

    useEffect(() => {
        if (isPlaying === undefined) {
            return;
        }
        if (isPlaying) {
            localVideoClassRef.current?.play();
        } else {
            localVideoClassRef.current?.pause();
        }
    }, [isPlaying]);

    useEffect(() => {
        if (getContextFromVideoTrigger === undefined) {
            return;
        }
        let nowSubtitleNode = subtitleClassRef.current?.getNowSubtitleNode();
        if (!nowSubtitleNode) {
            dispatch(updateContextFromVideo({} as ContextFromVideo));
            return;
        }
        localVideoClassRef
            .current!.getContextFromVideo(nowSubtitleNode?.begin, nowSubtitleNode?.end)
            .then((contextFromVideo) => {
                dispatch(updateContextFromVideo(contextFromVideo));
            });
    }, [getContextFromVideoTrigger]);

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
        localVideoClassRef.current!.videoUri = uri;
        dispatch(updateVideoName(name));

        recordRef.current.videoName = name;
        recordRef.current.videoUri = uri;
        AsyncStorage.setItem(LAST_RECORD_STORAGE_KEY, JSON.stringify(recordRef.current));
    }

    async function selectSubtitle() {
        if (!localVideoClassRef.current) {
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
        subtitleClassRef.current = new SubtitleClass(text);
        localVideoClassRef.current!.setOntimeupdate((status: AVPlaybackStatus) => {
            if (!status.isLoaded || !subtitleClassRef.current) {
                return;
            }
            let time = status.positionMillis / 1000;
            let subtitleText = subtitleClassRef.current.nowSubtitleText;
            subtitleClassRef.current.updateSubtitle(time);
            let newSubtitleText = subtitleClassRef.current.nowSubtitleText;
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

    function playNext() {
        if (!localVideoClassRef.current || !subtitleClassRef.current) {
            return;
        }
        const time = subtitleClassRef.current.getNextSubtitleTime();
        localVideoClassRef.current.seekAndPlay(time);
    }

    function playPrev() {
        if (!localVideoClassRef.current || !subtitleClassRef.current) {
            return;
        }
        const time = subtitleClassRef.current.getPrevSubtitleTime();
        localVideoClassRef.current.seekAndPlay(time);
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
                        <Button title="backward" onPress={playPrev} />
                    </View>
                    <View style={styles.videoButton}>
                        <Button
                            title={isPlaying ? 'Pause' : 'Play'}
                            onPress={() => dispatch(updateIsPlaying(!isPlaying))}
                        />
                    </View>
                    <View style={styles.videoButton}>
                        <Button title="forward" onPress={playNext} />
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
