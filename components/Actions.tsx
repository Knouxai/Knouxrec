

import React from 'react';
import { RecordIcon, StopIcon, PauseIcon, PlayIcon, ScreenshotIcon, SpeedometerIcon } from './icons';
import { RecordingState, Hotkeys } from '../types';

interface ActionsProps {
  recordingState: RecordingState;
  onStart: () => void;
  onStop: () => void;
  onPause: () => void;
  onResume: () => void;
  onScreenshot: () => void;
  disabled: boolean;
  timer: string;
  fps: number;
  scheduleStatus: string;
  hotkeys: Hotkeys;
}

const formatHotkeyForDisplay = (hotkey: string) => {
    if (!hotkey) return null;
    return hotkey.split('+').map((key, index) => (
      <React.Fragment key={key}>
        {index > 0 && ' + '}
        <kbd className="font-sans border border-gray-500/50 rounded-sm px-1.5 py-0.5 text-xs bg-[var(--card-bg)] shadow-sm">{key}</kbd>
      </React.Fragment>
    ));
};

const Actions = ({ recordingState, onStart, onStop, onPause, onResume, onScreenshot, disabled, timer, fps, scheduleStatus, hotkeys }: ActionsProps) => {
  return (
    <div className="p-4 glass-card rounded-xl flex flex-col items-center gap-4">
        <div className="w-full flex justify-center items-center space-x-4">
            {recordingState === 'IDLE' && (
                <button
                    onClick={onStart}
                    disabled={disabled}
                    className="flex-1 flex items-center justify-center gap-3 px-6 py-4 text-xl md:text-2xl font-bold font-orbitron bg-knoux-red text-white rounded-lg shadow-[0_0_20px_theme(colors.red.500)] hover:bg-red-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none hover:shadow-[0_0_30px_theme(colors.red.400)]"
                >
                    <RecordIcon className="w-8 h-8" />
                    START RECORDING
                </button>
            )}

            {recordingState !== 'IDLE' && (
                <>
                    <div className="flex-1 flex items-center justify-center bg-black/50 border border-[var(--card-border)] rounded-lg p-4">
                        <span className="text-3xl font-orbitron text-knoux-red animate-pulse tracking-widest">{timer}</span>
                        {fps > 0 && (
                          <>
                            <div className="w-px h-8 bg-[var(--card-border)] mx-4"></div>
                            <div className="flex items-center gap-2 text-knoux-neon-blue" title="Frames Per Second">
                                <SpeedometerIcon className="w-6 h-6" />
                                <span className="text-xl font-orbitron">{fps} FPS</span>
                            </div>
                          </>
                        )}
                    </div>

                    <button onClick={onScreenshot} title={`Take Screenshot (${hotkeys.screenshot})`} className="p-4 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-knoux-neon-blue hover:text-knoux-neon-blue transition-all">
                        <ScreenshotIcon className="w-8 h-8" />
                    </button>

                    {recordingState === 'RECORDING' && (
                        <button onClick={onPause} title={`Pause Recording (${hotkeys.pauseResume})`} className="p-4 rounded-lg bg-yellow-500/80 hover:bg-yellow-400 text-white shadow-[0_0_15px_theme(colors.yellow.500)] hover:shadow-[0_0_20px_theme(colors.yellow.400)] transition-all">
                            <PauseIcon className="w-8 h-8" />
                        </button>
                    )}
                    {recordingState === 'PAUSED' && (
                        <button onClick={onResume} title={`Resume Recording (${hotkeys.pauseResume})`} className="p-4 bg-green-500/80 rounded-lg shadow-[0_0_15px_theme(colors.green.500)] hover:bg-green-400 transition-all">
                            <PlayIcon className="w-8 h-8" />
                        </button>
                    )}
                    <button onClick={onStop} title={`Stop Recording (${hotkeys.startStop})`} className="p-4 bg-knoux-red/80 rounded-lg shadow-[0_0_15px_theme(colors.red.500)] hover:bg-knoux-red transition-all">
                        <StopIcon className="w-8 h-8" />
                    </button>
                </>
            )}
        </div>
        {recordingState === RecordingState.Idle && (
            scheduleStatus ? (
                <p className="text-center text-sm text-knoux-neon-blue/80 animate-pulse h-5">{scheduleStatus}</p>
            ) : (
                 <p className="text-center text-xs text-[var(--secondary-text)] h-5 flex items-center justify-center gap-1.5">
                    Use {formatHotkeyForDisplay(hotkeys.startStop)} to start/stop recording.
                </p>
            )
        )}
    </div>
  );
};

export default Actions;