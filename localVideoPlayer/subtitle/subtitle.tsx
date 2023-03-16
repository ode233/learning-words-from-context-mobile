import { useEffect, useState } from "react";
import { TextInput, StyleSheet, DeviceEventEmitter } from "react-native";

interface SubtitleSelectionChangeEvent {
  text: string;
  sentence: string;
}

function Subtitle() {
  const [nowSubtitle, setNowSubtitle] = useState("please add subtitle");

  const onSubtitleSelectionChange = async (event: {
    nativeEvent: { selection: { start: number; end: number } };
  }) => {
    let start = event.nativeEvent.selection.start;
    let end = event.nativeEvent.selection.end;
    if (start >= end) {
      return;
    }
    let sentence = nowSubtitle;
    let text = sentence.slice(start, end);
    let selectedSelectionProps: SubtitleSelectionChangeEvent = {
      text: text,
      sentence: sentence,
    };
    DeviceEventEmitter.emit(
      "onSubtitleSelectionChange",
      selectedSelectionProps
    );
  };

  return (
    <TextInput
      style={styles.subtitle}
      showSoftInputOnFocus={false}
      multiline={true}
      numberOfLines={3}
      value={nowSubtitle}
      onSelectionChange={onSubtitleSelectionChange}
    />
  );
}

const styles = StyleSheet.create({
  subtitle: {
    margin: 10,
    fontSize: 20,
    textAlign: "center",
    maxHeight: 100,
  },
});

export { SubtitleSelectionChangeEvent, Subtitle };
