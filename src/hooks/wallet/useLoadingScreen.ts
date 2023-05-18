import { useAppContext } from '@/context';
import { ActionTypes } from '@/context/actions';

const useLoadingScreen = () => {
  const { appState, dispatch } = useAppContext();

  const updateLoadingScreen = (isLoad: boolean) => {
    dispatch({ type: ActionTypes.UpdateLoadingScreen, payload: isLoad });
  };
  return {
    loadingScreen: appState.loadingScreen,
    updateLoadingScreen,
  };
};

export default useLoadingScreen;
