// Global type declarations for KNOUX REC

declare module 'lamejs' {
  export class Mp3Encoder {
    constructor(channels: number, sampleRate: number, kbps: number);
    encodeBuffer(left: Int16Array, right?: Int16Array): Int8Array;
    flush(): Int8Array;
  }
}

declare module 'onnxruntime-web' {
  export interface InferenceSession {
    run(feeds: Record<string, any>): Promise<Record<string, any>>;
  }
  
  export interface SessionOptions {
    executionProviders?: string[];
    graphOptimizationLevel?: string;
  }
  
  export class InferenceSession {
    static create(path: string, options?: SessionOptions): Promise<InferenceSession>;
  }
  
  export interface Tensor {
    data: Float32Array | Int32Array | Uint8Array;
    dims: number[];
    type: string;
  }
  
  export class Tensor {
    constructor(type: string, data: Float32Array | Int32Array | Uint8Array, dims: number[]);
  }
}

declare module 'fft-js' {
  export function fft(signal: number[]): number[][];
  export function ifft(signal: number[]): number[][];
  export function util: {
    fftMag(signal: number[][]): number[];
    fftFreq(signal: number[][], sampleRate: number): number[];
  };
}

declare module 'jimp' {
  export interface Jimp {
    bitmap: {
      data: Buffer;
      width: number;
      height: number;
    };
    resize(width: number, height: number): Jimp;
    quality(quality: number): Jimp;
    getBufferAsync(mime: string): Promise<Buffer>;
    clone(): Jimp;
    blur(radius: number): Jimp;
    brightness(brightness: number): Jimp;
    contrast(contrast: number): Jimp;
    crop(x: number, y: number, width: number, height: number): Jimp;
  }
  
  export function read(path: string | Buffer): Promise<Jimp>;
  export function create(width: number, height: number, color?: string): Jimp;
  
  export const MIME_PNG: string;
  export const MIME_JPEG: string;
}

declare module 'ml-matrix' {
  export class Matrix {
    constructor(rows: number, columns: number);
    static from2DArray(array: number[][]): Matrix;
    multiply(other: Matrix): Matrix;
    transpose(): Matrix;
    to2DArray(): number[][];
    get(row: number, column: number): number;
    set(row: number, column: number, value: number): void;
  }
}

declare module 'opus-recorder' {
  export interface OpusRecorderOptions {
    encoderPath?: string;
    encoderSampleRate?: number;
    encoderApplication?: number;
    streamPages?: boolean;
    recordingGain?: number;
    numberOfChannels?: number;
    encoderBitRate?: number;
    maxBuffersPerPage?: number;
    encoderComplexity?: number;
    resampleQuality?: number;
    bufferLength?: number;
    monitorGain?: number;
    recordingGain?: number;
  }
  
  export class Recorder {
    constructor(options?: OpusRecorderOptions);
    start(): Promise<void>;
    stop(): Promise<void>;
    pause(): void;
    resume(): void;
    addEventListener(event: string, callback: Function): void;
    removeEventListener(event: string, callback: Function): void;
  }
}

declare module 'fast-xml-parser' {
  export interface XMLParserOptions {
    ignoreAttributes?: boolean;
    attributeNamePrefix?: string;
    allowBooleanAttributes?: boolean;
    parseNodeValue?: boolean;
    parseAttributeValue?: boolean;
    trimValues?: boolean;
  }
  
  export class XMLParser {
    constructor(options?: XMLParserOptions);
    parse(xml: string): any;
  }
  
  export class XMLBuilder {
    constructor(options?: XMLParserOptions);
    build(data: any): string;
  }
}

// Extend MediaTrackConstraints to include cursor
declare global {
  interface MediaTrackConstraints {
    cursor?: "always" | "motion" | "never";
  }
}

export {};