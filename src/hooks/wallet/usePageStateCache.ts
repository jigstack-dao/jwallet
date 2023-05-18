import { useWallet } from '@/ui/utils';
import { useHistory } from 'react-router-dom';

const usePageStateCache = () => {
  const wallet = useWallet();
  const history = useHistory();

  const updateCacheState = async (newState: Record<string, any>) => {
    wallet.setPageStateCache({
      path: history.location.pathname,
      params: {},
      states: newState,
    });
  };

  const saveCachePatch = async () => {
    const cache = await wallet.getPageStateCache();
    wallet.setPageStateCache({
      ...cache,
      path: history.location.pathname,
    });
  };

  const clearCachePage = async () => {
    wallet.clearPageStateCache();
  };

  const getCacheState = async () => {
    const _cache = await wallet.getPageStateCache();
    if (_cache && _cache.path === history.location.pathname) {
      return _cache.states;
    }
    return undefined;
  };

  return { updateCacheState, saveCachePatch, clearCachePage, getCacheState };
};

export default usePageStateCache;
