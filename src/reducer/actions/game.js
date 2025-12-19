import { initGameState } from "../../constant";
import actionTypes from "./actionTypes";

export const updateCastling = (direction) => {
  return {
    type: actionTypes.CAN_CASTLE,
    payload: direction,
  };
};

export const detectStalemate = () => {
  return {
    type: actionTypes.STALEMATE,
  };
};

export const detectInSufficientMaterial = () => {
  return {
    type: actionTypes.INSUFFICIENT_MATERIAL,
  };
};

export const setupNewGame = () => {
  return {
    type: actionTypes.NEW_GAME,
    payload: initGameState,
  };
};
