import { AVPlaybackStatus, AVPlaybackStatusSuccess, ResizeMode, Video } from 'expo-av';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, View, StyleSheet, Text, DeviceEventEmitter } from 'react-native';
import { LocalVideoClass } from './localVideoClass';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { SubtitleClass } from '../subtitle/subtitleClass';

export interface SubtitleTextChangeEvent {
    subtitleText: string;
}

export function LocalVideo() {
    const video = useRef<Video>(null);
    const [videoName, setVideoName] = useState('wait for play');
    const [status, setStatus] = useState({} as AVPlaybackStatus);

    const localVideoClass = useRef<LocalVideoClass>();
    const subtitleClass = useRef<SubtitleClass>();

    useEffect(() => {
        localVideoClass.current = new LocalVideoClass(video.current!);
    }, []);

    const selectMedia = useRef(() => {
        DocumentPicker.getDocumentAsync({ type: 'audio/mpeg' }).then((result) => {
            if (result.type === 'success') {
                video.current!.loadAsync({
                    uri: result.uri
                });
                setVideoName(result.name);
            }
        });
    });

    const selectSubtitle = useRef(() => {
        DocumentPicker.getDocumentAsync({ type: 'application/x-subrip' }).then(async (result) => {
            if (result.type === 'success') {
                let text = await FileSystem.readAsStringAsync(result.uri);
                subtitleClass.current = new SubtitleClass(text);
                localVideoClass.current!.setOntimeupdate((status: AVPlaybackStatus) => {
                    if (!status.isLoaded || !subtitleClass.current) {
                        return;
                    }
                    let time = status.positionMillis / 1000;
                    console.log('setOntimeupdate', time);
                    let subtitleText = subtitleClass.current.nowSubtitleText;
                    subtitleClass.current.updateSubtitle(time);
                    let newSubtitleText = subtitleClass.current.nowSubtitleText;
                    if (newSubtitleText !== subtitleText) {
                        let subtitleTextChangeEvent: SubtitleTextChangeEvent = {
                            subtitleText: newSubtitleText
                        };
                        DeviceEventEmitter.emit('onSubtitleTextChange', subtitleTextChangeEvent);
                    }
                });
            }
        });
    });

    return (
        <View>
            <Text style={styles.videoName}>{videoName}</Text>
            <Video
                ref={video}
                style={styles.video}
                source={{
                    uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
                }}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                isLooping
                onPlaybackStatusUpdate={(status) => setStatus(() => status)}
            />
            <View>
                <View style={styles.videoButtons}>
                    <View style={styles.videoButton}>
                        <Button title="backward" />
                    </View>
                    <View style={styles.videoButton}>
                        <Button
                            title={(status as AVPlaybackStatusSuccess).isPlaying ? 'Pause' : 'Play'}
                            onPress={() =>
                                (status as AVPlaybackStatusSuccess).isPlaying
                                    ? video.current!.pauseAsync()
                                    : video.current!.playAsync()
                            }
                        />
                    </View>
                    <View style={styles.videoButton}>
                        <Button title="forward" />
                    </View>
                </View>
                <View style={styles.videoButtons}>
                    <View style={styles.videoButton}>
                        <Button title="media" onPress={selectMedia.current} />
                    </View>
                    <View style={styles.videoButton}>
                        <Button title="subtitle" onPress={selectSubtitle.current} />
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
