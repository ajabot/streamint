import { RadioStation } from '../types'

interface StationListProps {
  stations: RadioStation[]
  currentStation: RadioStation | null
  onStationSelect: (station: RadioStation) => void
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
  getStationEmoji: (station: RadioStation) => string
}

function StationList({
  stations,
  currentStation,
  onStationSelect,
  viewMode,
  onViewModeChange,
  getStationEmoji
}: StationListProps) {
  if (stations.length === 0) {
    return (
      <div className="bg-gray-800 rounded-xl p-8 text-center">
        <p className="text-gray-400 mb-4">No radio stations configured yet.</p>
        <p className="text-sm text-gray-500">
          Add stations to <code className="bg-gray-700 px-2 py-1 rounded">~/.streamint/config.json</code>
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Header with view toggle */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl md:text-2xl font-bold">All Stations</h2>
        <div className="flex gap-2 bg-gray-900 p-1 rounded-lg">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`px-4 py-2 rounded-md font-semibold text-sm transition-all ${
              viewMode === 'grid' ? 'bg-gray-800 text-white' : 'bg-transparent text-gray-400'
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`px-4 py-2 rounded-md font-semibold text-sm transition-all ${
              viewMode === 'list' ? 'bg-gray-800 text-white' : 'bg-transparent text-gray-400'
            }`}
          >
            List
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 pb-4">
          {stations.map((station) => {
            const emoji = getStationEmoji(station)
            return (
              <div
                key={station.id}
                onClick={() => onStationSelect(station)}
                className="bg-gray-900 rounded-xl p-3 cursor-pointer transition-all hover:bg-gray-800 group"
              >
                {/* Card Image with hover play button */}
                <div className="relative mb-2">
                  <div className="w-full aspect-square bg-gradient-to-br from-accent-primary to-accent-secondary rounded-lg flex items-center justify-center text-3xl md:text-4xl shadow-lg">
                    {emoji}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onStationSelect(station)
                    }}
                    className="absolute bottom-1 right-1 w-8 h-8 bg-accent-primary rounded-full flex items-center justify-center text-white text-sm shadow-lg opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0 transition-all hover:bg-accent-secondary hover:scale-105"
                  >
                    ▶
                  </button>
                </div>

                {/* Card Info */}
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold text-xs truncate flex-1">
                    {station.name}
                  </h3>
                  {station.favorite && (
                    <span className="text-accent-primary ml-1 flex-shrink-0 text-xs">♥</span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <span
                    className="w-1 h-1 bg-accent-primary rounded-full"
                    style={{ animation: 'pulse 2s infinite' }}
                  ></span>
                  <span>Live</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-2 pb-4">
          {stations.map((station) => {
            const emoji = getStationEmoji(station)
            const isActive = currentStation?.id === station.id
            return (
              <button
                key={station.id}
                onClick={() => onStationSelect(station)}
                className={`w-full text-left p-4 rounded-xl transition-all flex items-center gap-4 ${
                  isActive ? 'bg-gray-800' : 'bg-gray-900 hover:bg-gray-800'
                }`}
              >
                {/* Thumbnail */}
                <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-lg flex items-center justify-center text-2xl md:text-3xl flex-shrink-0">
                  {emoji}
                </div>

                {/* Station Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm md:text-base truncate">
                    {station.name}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-400">Streaming</p>
                </div>

                {/* Status and Favorite */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <span
                      className="w-1.5 h-1.5 bg-accent-primary rounded-full"
                      style={{ animation: 'pulse 2s infinite' }}
                    ></span>
                    <span className="hidden md:inline">Live</span>
                  </div>
                  {station.favorite && (
                    <span className="text-accent-primary text-lg">♥</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default StationList
