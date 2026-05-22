import { useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import useGameStore from './store/gameStore.js'
import Starfield from './components/ui/Starfield.jsx'
import Header from './components/ui/Header.jsx'
import LandingScreen  from './components/screens/LandingScreen.jsx'
import LevelMapScreen from './components/screens/LevelMapScreen.jsx'
import GameScreen     from './components/screens/GameScreen.jsx'
import BossScreen     from './components/screens/BossScreen.jsx'
import ResultsScreen  from './components/screens/ResultsScreen.jsx'
import BadgeShelfScreen  from './components/screens/BadgeShelfScreen.jsx'
import VillainsScreen    from './components/screens/VillainsScreen.jsx'
import UsernameScreen    from './components/screens/UsernameScreen.jsx'
import AnalyticsScreen   from './components/screens/AnalyticsScreen.jsx'

export default function App() {
  const { screen, theme } = useGameStore()

  useEffect(() => {
    document.body.className = theme ? `theme-${theme}` : ''
  }, [theme])

  const showHeader = screen !== 'landing' && screen !== 'username'

  return (
    <div className="min-h-screen bg-bg-primary relative">
      {/* Subtle CRT scanlines */}
      <div className="scanlines" />

      {/* Starfield background */}
      <Starfield />

      {/* Header */}
      {showHeader && <Header />}

      {/* Screens */}
      <AnimatePresence mode="wait">
        {screen === 'landing'  && <LandingScreen  key="landing"  />}
        {screen === 'levelMap' && <LevelMapScreen key="levelMap" />}
        {screen === 'game'     && <GameScreen     key="game"     />}
        {screen === 'boss'     && <BossScreen     key="boss"     />}
        {screen === 'results'  && <ResultsScreen  key="results"  />}
        {screen === 'badges'   && <BadgeShelfScreen key="badges"   />}
        {screen === 'villains' && <VillainsScreen   key="villains" />}
        {screen === 'username' && <UsernameScreen   key="username" />}
        {screen === 'stats'    && <AnalyticsScreen  key="stats"    />}
      </AnimatePresence>
    </div>
  )
}
