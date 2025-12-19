import { useAppContext } from "../../../contexts/Context";
import { takeBack } from "../../../reducer/actions/move";
import "./TakeBack.css";

function TakeBack({ theme }) {
  const {
    appState: { movesList },
    dispatch,
  } = useAppContext();
  return (
    <div>
      {movesList.length > 0 && (
        <button
          onClick={() => dispatch(takeBack())}
          className={theme === "dark" ? "dark" : "light"}
        >
          Take Back
        </button>
      )}
    </div>
  );
}

export default TakeBack;
