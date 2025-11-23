interface HeaderProps {
  activeTab: 'all' | 'favorites' | 'recent'
  onTabChange: (tab: 'all' | 'favorites' | 'recent') => void
  onAddStationClick: () => void
}

function Header({ activeTab, onTabChange, onAddStationClick }: HeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="logo">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-br from-accent-primary to-accent-secondary bg-clip-text text-transparent">
          Streamint
        </h1>
      </div>
      <div className="flex gap-6">
        <button
          onClick={() => onTabChange('all')}
          className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${
            activeTab === 'all'
              ? 'bg-gray-800 text-white'
              : 'bg-transparent text-gray-400 hover:text-white'
          }`}
        >
          All Stations
        </button>
        <button
          onClick={() => onTabChange('favorites')}
          className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${
            activeTab === 'favorites'
              ? 'bg-gray-800 text-white'
              : 'bg-transparent text-gray-400 hover:text-white'
          }`}
        >
          Favorites
        </button>
        <button
          onClick={() => onTabChange('recent')}
          className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${
            activeTab === 'recent'
              ? 'bg-gray-800 text-white'
              : 'bg-transparent text-gray-400 hover:text-white'
          }`}
        >
          Recently Played
        </button>
        <button
          onClick={onAddStationClick}
          className="flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm bg-amber-500 hover:bg-amber-400 text-black transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Station
        </button>
      </div>
    </div>
  )
}

export default Header
