import { AVPlaybackStatus, AVPlaybackStatusSuccess, ResizeMode, Video, Audio } from 'expo-av';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, View, StyleSheet, Text, DeviceEventEmitter } from 'react-native';
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

export function LocalVideo() {
    const videoRef = useRef<Video>(null);
    const localVideoClassRef = useRef<LocalVideoClass>();
    const subtitleClassRef = useRef<SubtitleClass>();

    const dispatch = useAppDispatch();
    // TODO: the re-render is not necessary, can only listen the change?
    const getContextFromVideoTrigger = useAppSelector(selectContextFromVideoTrigger);
    const isPlaying = useAppSelector(selectIsPlaying);
    const videoName = useAppSelector(selectVideoName);

    useEffect(() => {
        localVideoClassRef.current = new LocalVideoClass(videoRef.current!);
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

    const selectMediaRef = useRef(() => {
        DocumentPicker.getDocumentAsync({ type: 'audio/*' }).then(async (result) => {
            if (result.type === 'success') {
                await videoRef.current!.loadAsync({
                    uri: result.uri
                });
                dispatch(updateVideoName(result.name));
            }
        });
    });

    const selectSubtitleRef = useRef(() => {
        if (!localVideoClassRef.current) {
            alert('please select media first');
            return;
        }
        DocumentPicker.getDocumentAsync({ type: 'application/x-subrip' }).then(async (result) => {
            if (result.type === 'success') {
                let text = await FileSystem.readAsStringAsync(result.uri);
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
                });
            }
        });
    });

    const playNextRef = useRef(() => {
        if (!localVideoClassRef.current || !subtitleClassRef.current) {
            return;
        }
        const time = subtitleClassRef.current.getNextSubtitleTime();
        localVideoClassRef.current.seekAndPlay(time);
    });

    const playPrevRef = useRef(() => {
        if (!localVideoClassRef.current || !subtitleClassRef.current) {
            return;
        }
        const time = subtitleClassRef.current.getPrevSubtitleTime();
        localVideoClassRef.current.seekAndPlay(time);
    });

    return (
        <View>
            <Text style={styles.videoName}>{videoName}</Text>
            <Video
                ref={videoRef}
                style={styles.video}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                onPlaybackStatusUpdate={(status) => {
                    if (!status.isLoaded) {
                        return;
                    }
                    dispatch(updateIsPlaying(status.isPlaying));
                }}
                status={{ androidImplementation: 'MediaPlayer' }}
            />
            <View>
                <View style={styles.videoButtons}>
                    <View style={styles.videoButton}>
                        <Button title="backward" onPress={playPrevRef.current} />
                    </View>
                    <View style={styles.videoButton}>
                        <Button
                            title={isPlaying ? 'Pause' : 'Play'}
                            onPress={() => dispatch(updateIsPlaying(!isPlaying))}
                        />
                    </View>
                    <View style={styles.videoButton}>
                        <Button title="forward" onPress={playNextRef.current} />
                    </View>
                </View>
                <View style={styles.videoButtons}>
                    <View style={styles.videoButton}>
                        <Button title="media" onPress={selectMediaRef.current} />
                    </View>
                    <View style={styles.videoButton}>
                        <Button title="subtitle" onPress={selectSubtitleRef.current} />
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
