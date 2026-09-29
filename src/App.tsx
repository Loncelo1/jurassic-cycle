import { GameProvider, useGame } from './state/GameContext';
import { StartScreen } from './components/StartScreen';
import { GameScreen } from './components/GameScreen';

function Router() {
  const { screen } = useGame();
  return <div className="app">{screen === 'menu' ? <StartScreen /> : <GameScreen />}</div>;
}

export default function App() {
  return (
    <GameProvider>
      <Router />
    </GameProvider>
  );
}
