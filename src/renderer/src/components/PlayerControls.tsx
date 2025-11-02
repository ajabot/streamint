import { RadioStation } from '../types'

interface PlayerControlsProps {
  currentStation: RadioStation | null
  isPlaying: boolean
  onPlay: () => void
  onStop: () => void
  volume: number
  onVolumeChange: (volume: number) => void
  stationEmoji: string
}

function PlayerControls({
  currentStation,
  isPlaying,
  onPlay,
  onStop,
  volume,
  onVolumeChange,
  stationEmoji
}: PlayerControlsProps) {
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onVolumeChange(parseFloat(e.target.value))
  }

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 mb-6 shadow-2xl">
      <div className="flex flex-col md:flex-row gap-6 items-center">
        {/* Album Art */}
        <div className="flex-shrink-0">
          <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-xl flex items-center justify-center text-5xl md:text-6xl shadow-lg shadow-accent-glow">
            {stationEmoji}
          </div>
        </div>

        {/* Now Playing Info */}
        <div className="flex-1 text-center md:text-left w-full">
          <div className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">
            Now Playing
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-3 leading-tight">
            {currentStation ? currentStation.name : 'No station selected'}
          </h2>
          <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
            {currentStation && (
              <>
                <span className="bg-accent-primary text-white px-4 py-1.5 rounded-full font-bold text-xs md:text-sm">
                  LIVE
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-400 text-sm md:text-base">Streaming</span>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mb-4 justify-center md:justify-start">
            <button
              onClick={isPlaying ? onStop : onPlay}
              disabled={!currentStation}
              className={`w-12 h-12 rounded-full font-semibold transition-all flex items-center justify-center text-xl shadow-lg ${
                !currentStation
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-accent-primary hover:bg-accent-secondary text-white hover:scale-105 shadow-accent-glow'
              }`}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
            {currentStation?.favorite && (
              <button className="px-4 py-2 rounded-full border-2 border-accent-primary text-accent-primary font-semibold text-xs transition-all hover:scale-105">
                ♥ Favorite
              </button>
            )}
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-3 max-w-xs mx-auto md:mx-0">
            <span className="text-gray-400 text-lg">🔊</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="flex-1 slider h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer"
            />
            <span className="text-gray-400 text-sm min-w-[3rem] text-right">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlayerControls
