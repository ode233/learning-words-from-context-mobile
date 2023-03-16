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
import { Subtitle } from "./subtitle/subtitle";
import { Popup } from "./translate/popup";
import { LocalVideo } from "./video/localVideo";
import { LocalVideoClass } from "./video/localVideoClass";
import { SubtitleClass } from "./subtitle/subtitleClass";

init();

export default function LocalVideoPlayer() {
  let localVideoClass = new LocalVideoClass();
  let subtitleClass = new SubtitleClass();

  console.log(localVideoClass.video);
  setTimeout(() => {
    console.log(localVideoClass.video);
  }, 1000);

  return (
    <View style={styles.container}>
      <LocalVideo
        localVideoClass={localVideoClass}
        subtitleClass={subtitleClass}
      ></LocalVideo>
      <Subtitle></Subtitle>
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
});
