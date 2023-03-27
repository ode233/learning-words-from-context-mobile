import { Video, Audio } from 'expo-av';

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
        await this.seek(begin);
        await this.pause();
        await Audio.requestPermissionsAsync();
        await Audio.setAudioModeAsync({});
        const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
        this.play();
        return new Promise((resolve) => {
            setTimeout(async () => {
                await this.pause();
                await recording.stopAndUnloadAsync();
                const uri = recording.getURI();
                if (uri === null) {
                    throw new Error('uri is null');
                }
                resolve(uri);
            }, duration);
        });
    }
}
