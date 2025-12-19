import { useReducer, useState } from "react";
import "./App.css";
import Board from "./components/Board/Board";
import AppContext from "./contexts/Context";
import { reducer } from "./reducer/reducer";
import { initGameState } from "./constant";
import Control from "./components/Control/Control";
import MovesList from "./components/Control/bits/MovesList";
import TakeBack from "./components/Control/bits/TakeBack";

function App() {
  const [theme, setTheme] = useState(document.cookie.split("=")[1] || "light");
  const [appState, dispatch] = useReducer(reducer, initGameState);

  const providerState = {
    appState,
    dispatch,
  };

  return (
    <AppContext.Provider value={providerState}>
      <div className="App">
        <Board theme={theme} setTheme={setTheme} />
        <Control>
          <MovesList theme={theme} />
          <TakeBack theme={theme} />
        </Control>
      </div>
    </AppContext.Provider>
  );
}

export default App;
