import { useState, useEffect, useRef } from 'react'
import { Howl } from 'howler'
import { RadioStation, Config } from './types'
import StationList from './components/StationList'
import PlayerControls from './components/PlayerControls'
import Header from './components/Header'

function App() {
  const [config, setConfig] = useState<Config | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.5)
  const [activeTab, setActiveTab] = useState<'all' | 'favorites' | 'recent'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const soundRef = useRef<Howl | null>(null)

  // Emoji mapping based on station ID hash
  const getStationEmoji = (station: RadioStation): string => {
    const emojis = ['📻', '🎵', '🎸', '🎹', '🎤', '🎧', '🎺', '🎷', '🥁', '🎻', '🌍', '⭐']
    let hash = 0
    for (let i = 0; i < station.id.length; i++) {
      hash = station.id.charCodeAt(i) + ((hash << 5) - hash)
    }
    return emojis[Math.abs(hash) % emojis.length]
  }

  useEffect(() => {
    loadConfig()
  }, [])

  useEffect(() => {
    // Update Howler global volume when volume state changes
    if (soundRef.current) {
      soundRef.current.volume(volume)
    }
  }, [volume])

  const loadConfig = async () => {
    try {
      const data = await window.electronAPI.config.read()
      setConfig(data)
      setVolume(data.settings.volume)

      // Load last played station if available
      if (data.settings.lastStation) {
        const lastStation = data.stations.find(s => s.id === data.settings.lastStation)
        if (lastStation) {
          setCurrentStation(lastStation)
        }
      }
    } catch (error) {
      console.error('Failed to load config:', error)
      await window.electronAPI.dialog.showError('Error', 'Failed to load configuration')
    } finally {
      setLoading(false)
    }
  }

  const saveConfig = async (updates: Partial<Config['settings']>) => {
    if (!config) return

    const updatedConfig = {
      ...config,
      settings: {
        ...config.settings,
        ...updates
      }
    }

    try {
      await window.electronAPI.config.write(updatedConfig)
      setConfig(updatedConfig)
    } catch (error) {
      console.error('Failed to save config:', error)
    }
  }

  const handleStationSelect = (station: RadioStation) => {
    // Stop current playback before switching
    if (soundRef.current) {
      soundRef.current.unload()
      soundRef.current = null
    }

    setCurrentStation(station)
    setIsPlaying(false)
    saveConfig({ lastStation: station.id })

    // Automatically start playing the new station
    playStation(station)
  }

  const playStation = (station: RadioStation) => {
    try {
      // Create new Howl instance for the stream
      soundRef.current = new Howl({
        src: [station.url],
        html5: true, // Enable streaming mode
        format: ['mp3', 'aac'],
        volume: volume,
        onloaderror: (_id, error) => {
          console.error('Stream load error:', error)
          window.electronAPI.dialog.showError(
            'Playback Error',
            `Failed to load stream: ${station.name}`
          )
          setIsPlaying(false)
        },
        onplayerror: (_id, error) => {
          console.error('Stream play error:', error)
          window.electronAPI.dialog.showError(
            'Playback Error',
            `Failed to play stream: ${station.name}`
          )
          setIsPlaying(false)
        }
      })

      soundRef.current.play()
      setIsPlaying(true)
    } catch (error) {
      console.error('Failed to start playback:', error)
      window.electronAPI.dialog.showError('Error', 'Failed to start playback')
    }
  }

  const handlePlay = () => {
    if (!currentStation) return
    playStation(currentStation)
  }

  const handleStop = () => {
    if (soundRef.current) {
      soundRef.current.unload()
      soundRef.current = null
    }
    setIsPlaying(false)
  }

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    saveConfig({ volume: newVolume })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gradient-to-b from-gray-900 to-black text-white overflow-hidden">
      <div className="container mx-auto px-6 md:px-8 py-4 max-w-7xl h-full flex flex-col">
        <Header activeTab={activeTab} onTabChange={setActiveTab} />

        <PlayerControls
          currentStation={currentStation}
          isPlaying={isPlaying}
          onPlay={handlePlay}
          onStop={handleStop}
          volume={volume}
          onVolumeChange={handleVolumeChange}
          stationEmoji={currentStation ? getStationEmoji(currentStation) : '📻'}
        />

        <div className="flex-1 overflow-y-auto">
          <StationList
            stations={config?.stations || []}
            currentStation={currentStation}
            onStationSelect={handleStationSelect}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            getStationEmoji={getStationEmoji}
          />
        </div>
      </div>
    </div>
  )
}

export default App
