import * as React from "react";
import { useRef } from "react";
import { useState } from "react";
import {
  View,
  StyleSheet,
  Button,
  Text,
  Platform,
  StatusBar,
} from "react-native";
import {
  Video,
  AVPlaybackStatus,
  ResizeMode,
  AVPlaybackStatusSuccess,
} from "expo-av";
import { init } from "../userConfig/userConfig";
import { SubtitleContainer } from "./subtitle/subtitleContainer";
import { Popup } from "./translate/popup";

init();

export default function LocalVideoPlayer() {
  const video = useRef<Video>(null);
  const [status, setStatus] = useState({} as AVPlaybackStatus);
  const [videoName, setVideoName] = useState("wait for play");

  return (
    <View style={styles.container}>
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
            <Button title="media" />
          </View>
          <View style={styles.videoButton}>
            <Button title="subtitle" />
          </View>
        </View>
      </View>
      <SubtitleContainer></SubtitleContainer>
      <Popup></Popup>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 10,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
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
