import 'expo-dev-client';
import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import LocalVideoPlayer from '../localVideoPlayer/localVideoPlayer';

export default function App() {
    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'learning words from context' }} />
            <LocalVideoPlayer></LocalVideoPlayer>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    }
});
