import { AVPlaybackStatus, AVPlaybackStatusSuccess, ResizeMode, Video, Audio } from 'expo-av';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, View, StyleSheet, Text, DeviceEventEmitter } from 'react-native';
import { LocalVideoClass } from './localVideoClass';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { SubtitleClass } from '../subtitle/subtitleClass';

export function LocalVideo() {
    const video = useRef({} as Video);
    const [videoName, setVideoName] = useState('wait for play');
    const [status, setStatus] = useState({} as AVPlaybackStatus);
    const localVideoClass = useRef<LocalVideoClass>();
    const subtitleClass = useRef<SubtitleClass>({} as SubtitleClass);

    useEffect(() => {
        localVideoClass.current = new LocalVideoClass(video.current!);
        DeviceEventEmitter.addListener('getContextFromVideo', async (resolvePromise) => {
            let nowSubtitleNode = subtitleClass.current.getNowSubtitleNode();
            if (!nowSubtitleNode) {
                return;
            }
            resolvePromise(localVideoClass.current!.getContextFromVideo(nowSubtitleNode?.begin, nowSubtitleNode?.end));
        });
        return () => {
            DeviceEventEmitter.removeAllListeners('getContextFromVideo');
        };
    }, []);

    const selectMedia = useRef(() => {
        DocumentPicker.getDocumentAsync({ type: 'audio/*' }).then(async (result) => {
            if (result.type === 'success') {
                await video.current.loadAsync({
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
                        DeviceEventEmitter.emit('onSubtitleTextChange', newSubtitleText);
                    }
                });
            }
        });
    });

    const playNext = useRef(() => {
        if (!localVideoClass.current || !subtitleClass.current) {
            return;
        }
        const time = subtitleClass.current.getNextSubtitleTime();
        localVideoClass.current.seekAndPlay(time);
    });

    const playPrev = useRef(() => {
        if (!localVideoClass.current || !subtitleClass.current) {
            return;
        }
        const time = subtitleClass.current.getPrevSubtitleTime();
        localVideoClass.current.seekAndPlay(time);
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
                onPlaybackStatusUpdate={(status) => {
                    // TODO: frequncy render
                    setStatus(() => status);
                }}
                status={{ androidImplementation: 'MediaPlayer' }}
            />
            <View>
                <View style={styles.videoButtons}>
                    <View style={styles.videoButton}>
                        <Button title="backward" onPress={playPrev.current} />
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
                        <Button title="forward" onPress={playNext.current} />
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
