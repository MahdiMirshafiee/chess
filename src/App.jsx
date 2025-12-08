import { useReducer } from "react";
import "./App.css";
import Board from "./components/Board/Board";
import AppContext from "./contexts/Context";
import { reducer } from "./reducer/reducer";
import { initGameState } from "./constant";

function App() {
  const [appState, dispatch] = useReducer(reducer, initGameState);

  const providerState = {
    appState,
    dispatch,
  };

  return (
    <AppContext.Provider value={providerState}>
      <div className="App">
        <Board />
      </div>
    </AppContext.Provider>
  );
}

export default App;
