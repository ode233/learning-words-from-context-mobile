import { Video } from 'expo-av';

interface ContextFromVideo {
    voiceDataUrl: string;
    imgDataUrl: string;
}

export class LocalVideoClass {
    public video: Video;

    public constructor(video: Video) {
        this.video = video;
    }

    public seek(time: number): void {
        this.video.setPositionAsync(time * 1000);
    }
    public play(): void {
        this.video.playAsync;
    }
    public pause(): void {
        this.video.pauseAsync();
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
    public seekAndPlay(time: number | null) {
        if (!time) {
            return;
        }
        this.seek(time);
        this.play();
    }

    public async getContextFromVideo(begin: number, end: number): Promise<ContextFromVideo> {
        let contextFromVideo: ContextFromVideo = {
            voiceDataUrl: '',
            imgDataUrl: ''
        };
        this.pause();
        contextFromVideo.imgDataUrl = this.captureVideo(begin);
        contextFromVideo.voiceDataUrl = await this.captureAudio(begin, end);
        this.pause();
        return contextFromVideo;
    }

    // capture video
    private captureVideo(time: number): string {
        //　TODO: capture video
        return '';
    }

    private async captureAudio(begin: number, end: number): Promise<string> {
        // TODO: capture audio
        return '';
    }
}
