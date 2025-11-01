import { RadioStation } from '../types'

interface StationListProps {
  stations: RadioStation[]
  currentStation: RadioStation | null
  onStationSelect: (station: RadioStation) => void
}

function StationList({ stations, currentStation, onStationSelect }: StationListProps) {
  if (stations.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <p className="text-gray-400 mb-4">No radio stations configured yet.</p>
        <p className="text-sm text-gray-500">
          Add stations to <code className="bg-gray-700 px-2 py-1 rounded">~/.streamint/config.json</code>
        </p>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Stations</h2>
      <div className="space-y-2">
        {stations.map((station) => (
          <button
            key={station.id}
            onClick={() => onStationSelect(station)}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
              currentStation?.id === station.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{station.name}</span>
              {station.favorite && <span className="text-yellow-400">⭐</span>}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default StationList
