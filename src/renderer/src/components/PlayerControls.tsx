import { RadioStation } from '../types'

interface PlayerControlsProps {
  currentStation: RadioStation | null
  isPlaying: boolean
  onPlay: () => void
  onStop: () => void
}

function PlayerControls({ currentStation, isPlaying, onPlay, onStop }: PlayerControlsProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="mb-4">
        <h3 className="text-sm text-gray-400 mb-1">Now Playing</h3>
        <p className="text-xl font-semibold">
          {currentStation ? currentStation.name : 'No station selected'}
        </p>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={onPlay}
          disabled={!currentStation || isPlaying}
          className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
            !currentStation || isPlaying
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {isPlaying ? 'Playing...' : 'Play'}
        </button>
        <button
          onClick={onStop}
          disabled={!isPlaying}
          className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
            !isPlaying
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          Stop
        </button>
      </div>
    </div>
  )
}

export default PlayerControls
