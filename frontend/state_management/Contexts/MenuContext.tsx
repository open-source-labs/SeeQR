import { createContext, Dispatch } from 'react';
import { initialMenuState, MenuState } from '../Reducers/MenuReducers';
import MenuActions from '../Actions/MenuActions';

type MenuContextType = { state: MenuState; dispatch: Dispatch<MenuActions> };

const MenuContext = createContext<MenuContextType>({
  state: initialMenuState,
  dispatch: () => {},
});

export default MenuContext;
