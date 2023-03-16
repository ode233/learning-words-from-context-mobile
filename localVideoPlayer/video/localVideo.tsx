import {
  AVPlaybackStatus,
  AVPlaybackStatusSuccess,
  ResizeMode,
  Video,
} from "expo-av";
import { useRef, useState } from "react";
import { Button, View, StyleSheet, Text } from "react-native";
import { LocalVideoClass } from "./localVideoClass";
import * as DocumentPicker from "expo-document-picker";
import { SubtitleClass } from "../subtitle/SubtitleClass";

interface LocalVideoProps {
  localVideoClass: LocalVideoClass;
  subtitleClass: SubtitleClass;
}

function LocalVideo({ localVideoClass, subtitleClass }: LocalVideoProps) {
  const video = useRef<Video>(null);
  const [videoName, setVideoName] = useState("wait for play");
  const [status, setStatus] = useState({} as AVPlaybackStatus);
  localVideoClass.init(video.current!);

  const selectMedia = () => {
    DocumentPicker.getDocumentAsync({ type: "audio/mpeg" }).then((result) => {
      if (result.type === "success") {
        video.current!.loadAsync({
          uri: result.uri,
        });
        setVideoName(result.name);
      }
    });
  };

  const selectSubtitle = () => {
    DocumentPicker.getDocumentAsync({ type: "text/plain" }).then((result) => {
      if (result.type === "success") {
        result.file?.text().then((text) => {
          subtitleClass.init(text);
        });
      }
    });
  };

  return (
    <View>
      <Text style={styles.videoName}>{videoName}</Text>
      <Video
        ref={video}
        style={styles.video}
        source={{
          uri: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
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
              title={
                (status as AVPlaybackStatusSuccess).isPlaying ? "Pause" : "Play"
              }
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
            <Button title="media" onPress={selectMedia} />
          </View>
          <View style={styles.videoButton}>
            <Button title="subtitle" onPress={selectSubtitle} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  videoName: {
    alignSelf: "center",
    margin: 10,
  },
  video: {
    alignSelf: "center",
    width: 350,
    height: 200,
    backgroundColor: "#000000",
    margin: 10,
  },
  videoButtons: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    margin: 10,
  },
  videoButton: {
    width: 100,
  },
});

export { LocalVideo };
