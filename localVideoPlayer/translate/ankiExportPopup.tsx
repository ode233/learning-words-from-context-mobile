import { useState } from 'react';
import { View, StyleSheet, Text, TextInput, StatusBar, Modal } from 'react-native';

class AnkiAttr {
    public text = '';
    public textVoiceUrl = '';
    public textTranslate = '';
    public sentence = '';
    public sentenceVoiceUrl = '';
    public sentenceTranslate = '';
    public contentVoiceDataUrl = '';
    public contentImgDataUrl = '';
}

export default function AnkiExportPopup() {
    let ankiAttr = new AnkiAttr();
    const [modalVisible, setModalVisible] = useState(false);

    return (
        <View style={styles.container}>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <View style={styles.entry}>
                            <Text>单词</Text>
                            <TextInput></TextInput>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    entry: {
        margin: 20
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        margin: 10
    },
    volumeUpBottom: {
        marginStart: 50,
        fontSize: 16
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    }
});
