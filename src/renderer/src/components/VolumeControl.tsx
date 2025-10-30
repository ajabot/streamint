interface VolumeControlProps {
  volume: number
  onVolumeChange: (volume: number) => void
}

function VolumeControl({ volume, onVolumeChange }: VolumeControlProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center space-x-4">
        <span className="text-gray-400 text-sm w-16">Volume</span>
        <input
          type="range"
          min="0"
          max="100"
          value={volume * 100}
          onChange={(e) => onVolumeChange(Number(e.target.value) / 100)}
          className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
        />
        <span className="text-white font-semibold w-12 text-right">
          {Math.round(volume * 100)}%
        </span>
      </div>
    </div>
  )
}

export default VolumeControl
