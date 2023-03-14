import * as React from "react";
import { useEffect, useRef } from "react";
import { useState } from "react";
import {
  View,
  StyleSheet,
  Button,
  Text,
  Platform,
  StatusBar,
  TextInput,
  ScrollView,
} from "react-native";
import {
  Video,
  AVPlaybackStatus,
  ResizeMode,
  AVPlaybackStatusSuccess,
} from "expo-av";

class PopupAttrs {
  public dictLoading = true;
  public dictDisplay = "none";
  public dictLeft = 0;
  public dictTop = 0;
  public text = "";
  public textPhonetic = "";
  public textVoiceUrl = "";
  public textTranslate = "";
  public sentence = "";
  public sentenceVoiceUrl = "";
  public sentenceTranslate = "";
  public remark = "";
  public pageIconUrl = "";
  public pageTitle = "";
  public pageUrl = "";
  public contentVoiceDataUrl = "";
  public contentImgDataUrl = "";
  public ankiOpen = false;
  public isLoadingAnki = false;
}

export default function LocalVideoPlayer() {
  const video = useRef<Video>(null);
  const [status, setStatus] = useState({} as AVPlaybackStatus);
  const [videoName, setVideoName] = useState("wait for play");
  const [nowSubtitle, setNowSubtitle] = useState("please add subtitle");
  const [popupAttrs, setPopupAttrs] = useState(new PopupAttrs());

  const onSubtitleSelectionChange = (event: {
    nativeEvent: { selection: { start: number; end: number } };
  }) => {
    let start = event.nativeEvent.selection.start;
    let end = event.nativeEvent.selection.end;
    if (start >= end) {
      return;
    }
    let text = nowSubtitle.slice(start, end);
    let newPopupAttrs = new PopupAttrs();
    newPopupAttrs.text = text;
    newPopupAttrs.textTranslate = text;
    newPopupAttrs.sentence = nowSubtitle;
    newPopupAttrs.sentenceTranslate = nowSubtitle;
    setPopupAttrs(newPopupAttrs);
    setNowSubtitle(
      "<i>run by people whose dreams</i><i>were crushed years ago…</i><i>run by people whose dreams</i><i>were crushed years ago…</i><i>run by people whose dreams</i><i>were crushed years ago…</i><i>run by people whose dreams</i><i>were crushed years ago…</i><i>run by people whose dreams</i><i>were crushed years ago…</i><i>run by people whose dreams</i><i>were crushed years ago…</i><i>run by people whose dreams</i><i>were crushed years ago…</i>"
    );
  };
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
      <TextInput
        style={styles.subtitle}
        showSoftInputOnFocus={false}
        multiline={true}
        numberOfLines={3}
        value={nowSubtitle}
        onSelectionChange={onSubtitleSelectionChange}
      />
      <View style={styles.popup}>
        <ScrollView style={[styles.popupEntry, { maxHeight: 100 }]}>
          <Text>{popupAttrs.text}</Text>
        </ScrollView>
        <ScrollView style={[styles.popupEntry, { maxHeight: 100 }]}>
          <Text>{popupAttrs.textTranslate}</Text>
        </ScrollView>
        <ScrollView style={[styles.popupEntry, { maxHeight: 100 }]}>
          <Text>{popupAttrs.sentence}</Text>
        </ScrollView>
        <ScrollView style={[styles.popupEntry, { maxHeight: 100 }]}>
          <Text>{popupAttrs.sentenceTranslate}</Text>
        </ScrollView>
        <View style={styles.popupButtons}>
          <Button title="export" />
        </View>
      </View>
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
  subtitle: {
    margin: 10,
    fontSize: 20,
    textAlign: "center",
    maxHeight: 100,
  },
  popup: {
    margin: 10,
  },
  popupEntry: {
    margin: 5,
  },
  popupButtons: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    margin: 10,
  },
});
