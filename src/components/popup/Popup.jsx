import { Status } from "../../constant";
import { useAppContext } from "../../contexts/Context";
import { closePopup } from "../../reducer/actions/popup";
import "./Popup.css";
import PromotionBox from "./PromotionBox/PromotionBox";

function Popup({ theme }) {
  const { appState, dispatch } = useAppContext();
  if (appState.status === Status.ongoing) return null;

  const onClosePopup = () => {
    dispatch(closePopup());
  };

  return (
    <div className="popup">
      <PromotionBox theme={theme} onClosePopup={onClosePopup} />
    </div>
  );
}

export default Popup;
