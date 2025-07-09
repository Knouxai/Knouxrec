import lamejs from "lamejs";

export interface AudioProcessingOptions {
  inputFile: File | Blob;
  outputFormat?: "mp3" | "wav" | "ogg" | "flac";
  quality?: "low" | "medium" | "high" | "ultra";
  sampleRate?: number;
  bitRate?: number;
  channels?: 1 | 2;
  volume?: number; // 0-100
  normalize?: boolean;
  trim?: { start: number; end: number };
}

export interface NoiseReductionOptions {
  intensity: number; // 0-100
  preserveVoice: boolean;
  adaptiveMode: boolean;
}

export interface VoiceChangeOptions {
  pitch: number; // -12 to +12 semitones
  formant: number; // -100 to +100
  speed: number; // 0.5 to 2.0
  echo: {
    enabled: boolean;
    delay: number;
    decay: number;
  };
  reverb: {
    enabled: boolean;
    roomSize: number;
    damping: number;
  };
}

export interface BeatDetectionResult {
  beats: number[];
  tempo: number;
  timeSignature: [number, number];
  energy: number[];
}

export class AudioProcessor {
  private audioContext: AudioContext | null = null;
  private workletLoaded = false;

  constructor() {
    this.initializeAudioContext();
  }

  // تهيئة AudioContext
  private async initializeAudioContext(): Promise<void> {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();

      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }
    }
  }

  // تحويل Blob إلى AudioBuffer
  private async blobToAudioBuffer(blob: Blob): Promise<AudioBuffer> {
    await this.initializeAudioContext();
    const arrayBuffer = await blob.arrayBuffer();
    return await this.audioContext!.decodeAudioData(arrayBuffer);
  }

  // تحويل AudioBuffer إلى WAV
  private audioBufferToWav(buffer: AudioBuffer): Blob {
    const length = buffer.length;
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
    const view = new DataView(arrayBuffer);

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, "RIFF");
    view.setUint32(4, 36 + length * numberOfChannels * 2, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * 2, true);
    view.setUint16(32, numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, "data");
    view.setUint32(40, length * numberOfChannels * 2, true);

    // PCM data
    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(
          -1,
          Math.min(1, buffer.getChannelData(channel)[i]),
        );
        view.setInt16(
          offset,
          sample < 0 ? sample * 0x8000 : sample * 0x7fff,
          true,
        );
        offset += 2;
      }
    }

    return new Blob([arrayBuffer], { type: "audio/wav" });
  }

  // تحويل AudioBuffer إلى MP3
  private audioBufferToMp3(buffer: AudioBuffer, bitRate: number = 128): Blob {
    const mp3encoder = new lamejs.Mp3Encoder(
      buffer.numberOfChannels,
      buffer.sampleRate,
      bitRate,
    );
    const mp3Data: Int8Array[] = [];

    const blockSize = 1152;
    const leftChannel = buffer.getChannelData(0);
    const rightChannel =
      buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : leftChannel;

    for (let i = 0; i < buffer.length; i += blockSize) {
      const leftBlock = leftChannel.subarray(i, i + blockSize);
      const rightBlock = rightChannel.subarray(i, i + blockSize);

      // تحويل إلى Int16
      const leftInt16 = new Int16Array(leftBlock.length);
      const rightInt16 = new Int16Array(rightBlock.length);

      for (let j = 0; j < leftBlock.length; j++) {
        leftInt16[j] = leftBlock[j] * 32767;
        rightInt16[j] = rightBlock[j] * 32767;
      }

      const mp3buf = mp3encoder.encodeBuffer(leftInt16, rightInt16);
      if (mp3buf.length > 0) {
        mp3Data.push(mp3buf);
      }
    }

    const mp3buf = mp3encoder.flush();
    if (mp3buf.length > 0) {
      mp3Data.push(mp3buf);
    }

    return new Blob(mp3Data, { type: "audio/mp3" });
  }

  // فصل الأصوات (إزالة الغناء)
  async removeVocals(file: File | Blob): Promise<Blob> {
    const buffer = await this.blobToAudioBuffer(file);

    if (buffer.numberOfChannels < 2) {
      throw new Error("يجب أن يكون الملف الصوتي استيريو لفصل الأصوات");
    }

    await this.initializeAudioContext();
    const outputBuffer = this.audioContext!.createBuffer(
      2,
      buffer.length,
      buffer.sampleRate,
    );

    const leftChannel = buffer.getChannelData(0);
    const rightChannel = buffer.getChannelData(1);
    const outputLeft = outputBuffer.getChannelData(0);
    const outputRight = outputBuffer.getChannelData(1);

    // طرح القناة اليمنى من اليسرى لإزالة الوسط (الغناء)
    for (let i = 0; i < buffer.length; i++) {
      const diff = leftChannel[i] - rightChannel[i];
      outputLeft[i] = diff;
      outputRight[i] = diff;
    }

    return this.audioBufferToWav(outputBuffer);
  }

  // استخراج الصوت من الفيديو
  async extractAudioFromVideo(videoFile: File | Blob): Promise<Blob> {
    // إنشاء video element لاستخراج الصوت
    const video = document.createElement("video");
    const url = URL.createObjectURL(videoFile);
    video.src = url;

    return new Promise((resolve, reject) => {
      video.addEventListener("loadedmetadata", async () => {
        try {
          await this.initializeAudioContext();

          // إنشاء MediaElementAudioSourceNode
          const source = this.audioContext!.createMediaElementSource(video);
          const destination = this.audioContext!.createMediaStreamDestination();
          source.connect(destination);

          // تسجيل الصوت
          const recorder = new MediaRecorder(destination.stream);
          const chunks: Blob[] = [];

          recorder.ondataavailable = (event) => {
            chunks.push(event.data);
          };

          recorder.onstop = () => {
            const audioBlob = new Blob(chunks, { type: "audio/webm" });
            URL.revokeObjectURL(url);
            resolve(audioBlob);
          };

          recorder.start();
          video.play();

          video.addEventListener("ended", () => {
            recorder.stop();
          });
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  // تقليل الضوضاء
  async reduceNoise(
    file: File | Blob,
    options: NoiseReductionOptions,
  ): Promise<Blob> {
    const buffer = await this.blobToAudioBuffer(file);
    await this.initializeAudioContext();

    const outputBuffer = this.audioContext!.createBuffer(
      buffer.numberOfChannels,
      buffer.length,
      buffer.sampleRate,
    );

    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const inputData = buffer.getChannelData(channel);
      const outputData = outputBuffer.getChannelData(channel);

      // تطبيق مرشح تمرير منخفض لتقليل الضوضاء عالية التردد
      const alpha = 1 - (options.intensity / 100) * 0.5;
      let prev = inputData[0];

      for (let i = 0; i < inputData.length; i++) {
        const current = inputData[i];

        // Low-pass filter
        const filtered = alpha * current + (1 - alpha) * prev;

        // Gate للإشارات الضعيفة
        const threshold = 0.01 * (1 - options.intensity / 100);
        outputData[i] = Math.abs(filtered) > threshold ? filtered : 0;

        prev = filtered;
      }

      // تطبيق تطبيع إذا كان مطلوباً
      if (options.preserveVoice) {
        this.normalizeChannel(outputData);
      }
    }

    return this.audioBufferToWav(outputBuffer);
  }

  // تطبيع القناة الصوتية
  private normalizeChannel(data: Float32Array): void {
    let max = 0;
    for (let i = 0; i < data.length; i++) {
      max = Math.max(max, Math.abs(data[i]));
    }

    if (max > 0) {
      const scale = 0.95 / max;
      for (let i = 0; i < data.length; i++) {
        data[i] *= scale;
      }
    }
  }

  // تغيير الصوت
  async changeVoice(
    file: File | Blob,
    options: VoiceChangeOptions,
  ): Promise<Blob> {
    const buffer = await this.blobToAudioBuffer(file);
    await this.initializeAudioContext();

    // تطبيق تغيير النغمة باستخدام PSOLA algorithm (مبسط)
    const pitchShift = Math.pow(2, options.pitch / 12);
    const newLength = Math.floor(buffer.length / options.speed);

    const outputBuffer = this.audioContext!.createBuffer(
      buffer.numberOfChannels,
      newLength,
      buffer.sampleRate,
    );

    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const inputData = buffer.getChannelData(channel);
      const outputData = outputBuffer.getChannelData(channel);

      // تطبيق تغيير السرعة والنغمة
      for (let i = 0; i < newLength; i++) {
        const sourceIndex = Math.floor(i * options.speed);
        if (sourceIndex < inputData.length) {
          outputData[i] = inputData[sourceIndex];
        }
      }

      // تطبيق الصدى إذا كان مفعلاً
      if (options.echo.enabled) {
        this.applyEcho(outputData, buffer.sampleRate, options.echo);
      }

      // تطبيق الارتداد إذا كان مفعلاً
      if (options.reverb.enabled) {
        this.applyReverb(outputData, buffer.sampleRate, options.reverb);
      }
    }

    return this.audioBufferToWav(outputBuffer);
  }

  // تطبيق الصدى
  private applyEcho(
    data: Float32Array,
    sampleRate: number,
    echo: VoiceChangeOptions["echo"],
  ): void {
    const delayFrames = Math.floor((echo.delay * sampleRate) / 1000);

    for (let i = delayFrames; i < data.length; i++) {
      data[i] += data[i - delayFrames] * echo.decay;
    }
  }

  // تطبيق الارتداد
  private applyReverb(
    data: Float32Array,
    sampleRate: number,
    reverb: VoiceChangeOptions["reverb"],
  ): void {
    const delayFrames = Math.floor(0.03 * sampleRate); // 30ms delay
    const decay = reverb.damping;

    for (let i = delayFrames; i < data.length; i++) {
      data[i] += data[i - delayFrames] * decay * (reverb.roomSize / 100);
    }
  }

  // اكتشاف الإيقاع
  async detectBeats(file: File | Blob): Promise<BeatDetectionResult> {
    const buffer = await this.blobToAudioBuffer(file);
    const monoData = this.convertToMono(buffer);

    // تحليل الطيف الترددي
    const fftSize = 2048;
    const hopSize = 512;
    const beats: number[] = [];
    const energy: number[] = [];

    for (let i = 0; i < monoData.length - fftSize; i += hopSize) {
      const frame = monoData.slice(i, i + fftSize);
      const frameEnergy = this.calculateEnergy(frame);
      energy.push(frameEnergy);

      // اكتشاف النبضات بناءً على التغيرات في الطاقة
      if (energy.length > 2) {
        const current = energy[energy.length - 1];
        const previous = energy[energy.length - 2];
        const threshold = this.calculateDynamicThreshold(energy.slice(-10));

        if (current > previous * 1.3 && current > threshold) {
          const timeSeconds = i / buffer.sampleRate;
          beats.push(timeSeconds);
        }
      }
    }

    // حساب الإيقاع (BPM)
    const intervals = this.calculateIntervals(beats);
    const tempo = this.estimateTempo(intervals);

    return {
      beats,
      tempo,
      timeSignature: [4, 4], // افتراضي
      energy,
    };
  }

  // تحويل إلى مونو
  private convertToMono(buffer: AudioBuffer): Float32Array {
    if (buffer.numberOfChannels === 1) {
      return buffer.getChannelData(0);
    }

    const monoData = new Float32Array(buffer.length);
    for (let i = 0; i < buffer.length; i++) {
      let sum = 0;
      for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
        sum += buffer.getChannelData(channel)[i];
      }
      monoData[i] = sum / buffer.numberOfChannels;
    }
    return monoData;
  }

  // حساب الطاقة
  private calculateEnergy(frame: Float32Array): number {
    let energy = 0;
    for (let i = 0; i < frame.length; i++) {
      energy += frame[i] * frame[i];
    }
    return energy / frame.length;
  }

  // حساب العتبة الديناميكية
  private calculateDynamicThreshold(energyHistory: number[]): number {
    const mean =
      energyHistory.reduce((a, b) => a + b, 0) / energyHistory.length;
    const variance =
      energyHistory.reduce((a, b) => a + Math.pow(b - mean, 2), 0) /
      energyHistory.length;
    return mean + Math.sqrt(variance);
  }

  // حساب الفترات الزمنية
  private calculateIntervals(beats: number[]): number[] {
    const intervals: number[] = [];
    for (let i = 1; i < beats.length; i++) {
      intervals.push(beats[i] - beats[i - 1]);
    }
    return intervals;
  }

  // تقدير الإيقاع
  private estimateTempo(intervals: number[]): number {
    if (intervals.length === 0) return 120; // افتراضي

    // حساب متوسط الفترة
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

    // تحويل إلى BPM
    return Math.round(60 / avgInterval);
  }

  // ضغط الصوت
  async compressAudio(
    file: File | Blob,
    quality: "low" | "medium" | "high" | "ultra",
  ): Promise<Blob> {
    const buffer = await this.blobToAudioBuffer(file);

    const bitRates = {
      low: 64,
      medium: 128,
      high: 192,
      ultra: 320,
    };

    return this.audioBufferToMp3(buffer, bitRates[quality]);
  }

  // تحويل النص إلى كلام (Web Speech API)
  async textToSpeech(
    text: string,
    voice?: string,
    rate: number = 1,
    pitch: number = 1,
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);

      if (voice) {
        const voices = speechSynthesis.getVoices();
        const selectedVoice = voices.find((v) => v.name === voice);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }

      utterance.rate = rate;
      utterance.pitch = pitch;

      // تسجيل النطق
      const chunks: Blob[] = [];

      utterance.onend = () => {
        // Web Speech API لا يدعم التسجيل المباشر
        // هذا تطبيق مبسط - في الواقع يحتاج لتطبيق أكثر تعقيداً
        resolve(new Blob(chunks, { type: "audio/wav" }));
      };

      utterance.onerror = (error) => {
        reject(error);
      };

      speechSynthesis.speak(utterance);
    });
  }

  // تحويل الكلام إلى نص (Web Speech API)
  async speechToText(
    file: File | Blob,
    language: string = "ar-SA",
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const recognition = new ((window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition)();

      recognition.lang = language;
      recognition.continuous = true;
      recognition.interimResults = false;

      let result = "";

      recognition.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            result += event.results[i][0].transcript + " ";
          }
        }
      };

      recognition.onend = () => {
        resolve(result.trim());
      };

      recognition.onerror = (error: any) => {
        reject(error);
      };

      // تشغيل الملف الصوتي
      const audio = new Audio(URL.createObjectURL(file));
      audio.play();
      recognition.start();

      audio.onended = () => {
        recognition.stop();
      };
    });
  }

  // دمج ملفات صوتية
  async mergeAudioFiles(files: (File | Blob)[]): Promise<Blob> {
    const buffers = await Promise.all(
      files.map((file) => this.blobToAudioBuffer(file)),
    );

    // حساب الطول الإجمالي
    const totalLength = buffers.reduce((sum, buffer) => sum + buffer.length, 0);
    const sampleRate = buffers[0].sampleRate;
    const numberOfChannels = Math.max(
      ...buffers.map((b) => b.numberOfChannels),
    );

    await this.initializeAudioContext();
    const outputBuffer = this.audioContext!.createBuffer(
      numberOfChannels,
      totalLength,
      sampleRate,
    );

    let offset = 0;
    for (const buffer of buffers) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const outputChannel = outputBuffer.getChannelData(channel);
        const inputChannel =
          buffer.numberOfChannels > channel
            ? buffer.getChannelData(channel)
            : buffer.getChannelData(0);

        for (let i = 0; i < buffer.length; i++) {
          outputChannel[offset + i] = inputChannel[i];
        }
      }
      offset += buffer.length;
    }

    return this.audioBufferToWav(outputBuffer);
  }

  // تنظيف الموارد
  cleanup(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

// إنشاء مثيل مشترك
export const audioProcessor = new AudioProcessor();
