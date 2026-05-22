import { useEffect, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import useGameStore from './store/gameStore.js'
import { useIdleTimer } from './hooks/useIdleTimer.js'
import IdleWarningModal from './components/ui/IdleWarningModal.jsx'
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
import EmployeeRegistrationScreen from './components/screens/EmployeeRegistrationScreen.jsx'
import CertificationScreen  from './components/screens/CertificationScreen.jsx'
import CertificateViewScreen from './components/screens/CertificateViewScreen.jsx'
import LeaderboardScreen from './components/screens/LeaderboardScreen.jsx'
import UserTypeScreen        from './components/screens/UserTypeScreen.jsx'
import CompanyLoginScreen    from './components/screens/CompanyLoginScreen.jsx'
import IndividualSignupScreen from './components/screens/IndividualSignupScreen.jsx'

const AUTH_SCREENS = new Set(['userType', 'companyLogin', 'individualSignup'])
const NO_HEADER    = new Set(['landing', 'username', 'userType', 'companyLogin', 'individualSignup'])

export default function App() {
  const { screen, theme, restoreSession, isAuthenticated, username, logout } = useGameStore()

  useEffect(() => {
    document.body.className = theme ? `theme-${theme}` : ''
  }, [theme])

  // Validate stored session token on every app load
  useEffect(() => {
    restoreSession()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Idle logout timer ──────────────────────────────────────────────────────
  const handleIdleLogout = useCallback(async () => { await logout() }, [logout])

  const { showWarning, secondsLeft, keepAlive } = useIdleTimer({
    onLogout: handleIdleLogout,
    enabled:  isAuthenticated,
  })

  return (
    <div className="min-h-screen bg-bg-primary relative">
      <div className="scanlines" />
      <Starfield />

      {!NO_HEADER.has(screen) && <Header />}

      {/* Idle session warning — only shown after 25 min of inactivity */}
      {showWarning && (
        <IdleWarningModal
          secondsLeft={secondsLeft}
          username={username}
          onKeepAlive={keepAlive}
          onLogout={logout}
        />
      )}

      <AnimatePresence mode="wait">
        {screen === 'landing'  && <LandingScreen  key="landing"  />}
        {screen === 'levelMap' && <LevelMapScreen key="levelMap" />}
        {screen === 'game'     && <GameScreen     key="game"     />}
        {screen === 'boss'     && <BossScreen     key="boss"     />}
        {screen === 'results'  && <ResultsScreen  key="results"  />}
        {screen === 'badges'   && <BadgeShelfScreen key="badges"   />}
        {screen === 'villains' && <VillainsScreen   key="villains" />}
        {screen === 'username'       && <UsernameScreen             key="username"      />}
        {screen === 'register'       && <EmployeeRegistrationScreen key="register"      />}
        {screen === 'stats'          && <AnalyticsScreen             key="stats"         />}
        {screen === 'certifications' && <CertificationScreen         key="certifications"/>}
        {screen === 'certificate'    && <CertificateViewScreen       key="certificate"   />}
        {screen === 'leaderboard'    && <LeaderboardScreen           key="leaderboard"   />}
        {screen === 'userType'       && <UserTypeScreen              key="userType"      />}
        {screen === 'companyLogin'   && <CompanyLoginScreen          key="companyLogin"  />}
        {screen === 'individualSignup' && <IndividualSignupScreen    key="signup"        />}
      </AnimatePresence>
    </div>
  )
}
