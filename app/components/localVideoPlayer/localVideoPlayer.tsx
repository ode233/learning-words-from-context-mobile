import { View, StyleSheet } from 'react-native';
import { init } from '../../userConfig/userConfig';
import { Subtitle } from './subtitle/Subtitle';
import { TranslatePopup } from './translate/TranslatePopup';
import { VideoController } from './VideoController';
import { LocalVideo } from './video/LocalVideo';

init();

export default function LocalVideoPlayer() {
    let videoController = new VideoController();
    return (
        <View style={styles.container}>
            <LocalVideo videoController={videoController}></LocalVideo>
            <Subtitle videoController={videoController}></Subtitle>
            <TranslatePopup videoController={videoController}></TranslatePopup>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        width: '100%'
    }
});
