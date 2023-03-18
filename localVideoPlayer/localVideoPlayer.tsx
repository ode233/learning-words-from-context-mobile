import * as React from 'react';
import { View, StyleSheet, Button, Text, Platform, StatusBar } from 'react-native';
import { init } from '../userConfig/userConfig';
import { Subtitle } from './subtitle/subtitle';
import { TranslatePopup } from './translate/translatePopup';
import { LocalVideo } from './video/localVideo';

init();

export default function LocalVideoPlayer() {
    setTimeout(() => {}, 1000);

    return (
        <View style={styles.container}>
            <LocalVideo></LocalVideo>
            <Subtitle></Subtitle>
            <TranslatePopup></TranslatePopup>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 10,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
    }
});
