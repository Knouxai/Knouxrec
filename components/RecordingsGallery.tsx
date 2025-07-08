
import React, { useState } from 'react';
import { Recording } from '../types';
import { PlayIcon, DownloadIcon, DeleteIcon, TagIcon, InfoIcon, LoadingSpinner, CutIcon } from './icons';

interface RecordingsGalleryProps {
  recordings: Recording[];
  onDelete: (id: string) => void;
  onUpdateRecording: (updatedRecording: Recording) => void;
  onSelectForPreview: (recording: Recording) => void;
}

const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const RecordingCard = ({ rec, onPlay, onDelete, onUpdateRecording }: { rec: Recording, onPlay: (rec: Recording) => void, onDelete: (id: string) => void, onUpdateRecording: (rec: Recording) => void }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleNameChange = (newName: string) => {
        onUpdateRecording({...rec, name: newName});
    }

    return (
        <div className="interactive-card p-3 rounded-lg flex flex-col gap-2 hover:border-knoux-neon-blue transition-all duration-300">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    {rec.trim && <span className="flex-shrink-0" title={`Trimmed: ${rec.trim.start.toFixed(1)}s - ${rec.trim.end.toFixed(1)}s`}><CutIcon className="w-4 h-4 text-knoux-neon-blue/80" /></span>}
                    <input 
                      type="text" 
                      value={rec.name} 
                      onChange={(e) => handleNameChange(e.target.value)}
                      disabled={rec.isProcessing}
                      className="bg-transparent w-full text-[var(--primary-text)] font-semibold truncate focus:ring-0 focus:outline-none focus:border-b-2 focus:border-knoux-neon-blue transition disabled:opacity-70"
                    />
                </div>
                <div className="text-xs text-[var(--secondary-text)] mt-1 flex items-center flex-wrap gap-x-4 gap-y-1 pl-6">
                  <span>{rec.date.toLocaleString()}</span>
                  <span>{formatBytes(rec.size)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                {rec.isProcessing ? (
                    <div className="flex items-center gap-2 text-knoux-neon-blue/80 text-sm p-2">
                        <LoadingSpinner className="w-5 h-5" />
                        <span>Analyzing...</span>
                    </div>
                ) : (
                    <>
                        {rec.summary && (
                             <button onClick={() => setIsExpanded(p => !p)} title="Show Details" className="p-2 rounded-full text-[var(--icon-color)] hover:bg-knoux-neon-blue/20 transition"><InfoIcon className="w-5 h-5"/></button>
                        )}
                        <button onClick={() => onPlay(rec)} title="Play" className="p-2 rounded-full text-knoux-neon-blue hover:bg-knoux-neon-blue/20 transition"><PlayIcon className="w-5 h-5"/></button>
                        <a href={rec.url} download={rec.name} title="Download" className="p-2 rounded-full text-[var(--icon-color)] hover:bg-knoux-neon-blue/20 transition"><DownloadIcon className="w-5 h-5"/></a>
                        <button onClick={() => onDelete(rec.id)} title="Delete" className="p-2 rounded-full text-knoux-red hover:bg-red-500/20 transition"><DeleteIcon className="w-5 h-5"/></button>
                    </>
                )}
              </div>
            </div>
            {isExpanded && !rec.isProcessing && (
                <div className="pl-2 pr-2 pb-2 mt-2 border-t border-[var(--card-border)] pt-3 animate-fade-in space-y-2">
                    {rec.summary && <p className="text-sm text-[var(--secondary-text)]">{rec.summary}</p>}
                    {rec.keywords && rec.keywords.length > 0 && (
                        <div className="flex items-center flex-wrap gap-2 pt-2">
                            <TagIcon className="w-4 h-4 text-knoux-neon-blue flex-shrink-0"/>
                            {rec.keywords.map(kw => (
                                <span key={kw} className="text-xs bg-knoux-neon-blue/10 text-knoux-neon-blue rounded-full px-2 py-0.5">{kw}</span>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

const RecordingsGallery = ({ recordings, onDelete, onUpdateRecording, onSelectForPreview }: RecordingsGalleryProps) => {
  return (
    <div className="p-4 glass-card rounded-xl">
      <h3 className="text-lg font-bold font-orbitron mb-4 text-knoux-purple">GALLERY</h3>
      {recordings.length === 0 ? (
        <div className="text-center py-10 text-[var(--secondary-text)]">
          <p>No recordings yet.</p>
          <p className="text-sm">Your completed recordings will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {recordings.map(rec => (
            <RecordingCard 
                key={rec.id}
                rec={rec}
                onPlay={onSelectForPreview}
                onDelete={onDelete}
                onUpdateRecording={onUpdateRecording}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RecordingsGallery;
