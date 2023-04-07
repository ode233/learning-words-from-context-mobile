import { View, StyleSheet } from 'react-native';
import { init } from '../../userConfig/userConfig';
import { Subtitle } from './subtitle/subtitle';
import { TranslatePopup } from './translate/translatePopup';
import { LocalVideo } from './video/localVideo';
import { LocalVideoClass } from './video/localVideoClass';

init();

export default function LocalVideoPlayer() {
    let localVideoClass = new LocalVideoClass();
    return (
        <View style={styles.container}>
            <LocalVideo localVideoClass={localVideoClass}></LocalVideo>
            <Subtitle localVideoClass={localVideoClass}></Subtitle>
            <TranslatePopup localVideoClass={localVideoClass}></TranslatePopup>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        width: '100%'
    }
});
