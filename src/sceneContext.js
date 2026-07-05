import { createContext, useContext } from 'react';

export const SceneContext = createContext(null);
export const useScene = () => useContext(SceneContext);
