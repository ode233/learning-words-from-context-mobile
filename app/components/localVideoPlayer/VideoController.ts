import { Video } from 'expo-av';
import { FFmpegKit, ReturnCode } from 'ffmpeg-kit-react-native';
import * as FileSystem from 'expo-file-system';
import { SubtitleController } from './SubtitleController';

interface ContextFromVideo {
    voiceDataUrl: string;
    imgDataUrl: string;
}

export class VideoController {
    public video?: Video;
    public videoUri?: string;
    public videoName?: string;
    public subtitleController?: SubtitleController;

    public constructor() {}

    public async seek(time: number) {
        await this.video?.setPositionAsync(time * 1000);
    }
    public async play() {
        await this.video?.playAsync();
    }
    public async pause() {
        await this.video?.pauseAsync();
    }
    public async getCurrentTime(): Promise<number | null> {
        let status = await this.video!.getStatusAsync();
        if (status.isLoaded) {
            return status.positionMillis / 1000;
        }
        return null;
    }

    public setOntimeupdate(f: any): void {
        this.video?.setOnPlaybackStatusUpdate(f);
    }

    // all time unit is second
    public async seekAndPlay(time: number | null | undefined) {
        if (!time) {
            return;
        }
        await this.seek(time);
        await this.play();
    }

    public async initSubtitleController(text: string) {
        this.subtitleController = new SubtitleController(text);
    }

    public playNext() {
        const time = this.subtitleController?.getNextSubtitleTime();
        this.seekAndPlay(time);
    }

    public playPrev() {
        const time = this.subtitleController?.getPrevSubtitleTime();
        this.seekAndPlay(time);
    }

    public async getContextFromVideo(): Promise<ContextFromVideo> {
        let contextFromVideo: ContextFromVideo = {
            voiceDataUrl: '',
            imgDataUrl: ''
        };
        let nowSubtitleNode = this.subtitleController?.getNowSubtitleNode();
        if (!nowSubtitleNode) {
            return contextFromVideo;
        }
        let begin = nowSubtitleNode?.begin;
        let end = nowSubtitleNode?.end;
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
        const duration = end - begin;

        let targetSentenceVoicePath = FileSystem.cacheDirectory + 'sentenceVoice.aac';
        let session = await FFmpegKit.execute(
            `-y -i ${this.videoUri} -ss ${begin} -t ${duration} -vn -ar 44100 -b:a 128k -c:a aac ${targetSentenceVoicePath}`
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
