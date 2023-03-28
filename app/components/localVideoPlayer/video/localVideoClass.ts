import { Video, Audio } from 'expo-av';
import { FFmpegKit, ReturnCode } from 'ffmpeg-kit-react-native';
import * as FileSystem from 'expo-file-system';

export interface ContextFromVideo {
    voiceDataUrl: string;
    imgDataUrl: string;
}

export class LocalVideoClass {
    public video: Video;

    public constructor(video: Video) {
        this.video = video;
    }

    public async seek(time: number) {
        await this.video.setPositionAsync(time * 1000);
    }
    public async play() {
        await this.video.playAsync();
    }
    public async pause() {
        await this.video.pauseAsync();
    }
    public async getCurrentTime(): Promise<number | null> {
        let status = await this.video!.getStatusAsync();
        if (status.isLoaded) {
            return status.positionMillis / 1000;
        }
        return null;
    }

    public setOntimeupdate(f: any): void {
        this.video.setOnPlaybackStatusUpdate(f);
    }

    // all time unit is second
    public async seekAndPlay(time: number | null) {
        if (!time) {
            return;
        }
        await this.seek(time);
        await this.play();
    }

    public async getContextFromVideo(begin: number, end: number): Promise<ContextFromVideo> {
        let contextFromVideo: ContextFromVideo = {
            voiceDataUrl: '',
            imgDataUrl: ''
        };
        contextFromVideo.imgDataUrl = this.captureVideo(begin);
        contextFromVideo.voiceDataUrl = await this.captureAudio(begin, end);
        return contextFromVideo;
    }

    // capture video
    private captureVideo(time: number): string {
        //　TODO: capture video
        return '';
    }

    private async captureAudio(begin: number, end: number): Promise<string> {
        const timeExtend = 200;
        const duration = (end - begin) * 1000 + timeExtend;

        let videoPath = this.video.props.source;
        let targetSentenceVoicePath = FileSystem.documentDirectory + 'sentenceVoice.mp3';
        console.log(videoPath, targetSentenceVoicePath);
        let session = await FFmpegKit.execute(
            `-i ${videoPath} -ss ${begin} -t ${duration} -acodec copy ${targetSentenceVoicePath}`
        );
        const returnCode = await session.getReturnCode();
        if (ReturnCode.isSuccess(returnCode)) {
            // SUCCESS
            return targetSentenceVoicePath;
        } else if (ReturnCode.isCancel(returnCode)) {
            // CANCEL
            alert('captureAudio canceled');
            throw new Error('captureAudio canceled');
        } else {
            // ERROR
            alert('captureAudio error');
            throw new Error('captureAudio error');
        }
    }
}
