import 'expo-dev-client';
import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Provider } from 'react-redux';
import LocalVideoPlayer from './components/localVideoPlayer/localVideoPlayer';
import { store } from './redux/store';
import { RootSiblingParent } from 'react-native-root-siblings';

export default function App() {
    return (
        <Provider store={store}>
            <RootSiblingParent>
                <View style={styles.container}>
                    <Stack.Screen options={{ title: 'learning words from context' }} />
                    <LocalVideoPlayer></LocalVideoPlayer>
                </View>
            </RootSiblingParent>
        </Provider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    }
});
