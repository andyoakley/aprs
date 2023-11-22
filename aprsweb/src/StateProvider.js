import { createContext, useContext, useReducer } from "react"

export const StateContext = createContext();
export const DispatchContext = createContext();

export const StateProvider = ({children}) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    return (<StateContext.Provider value={state}>
        <DispatchContext.Provider value={dispatch}>
            {children}
        </DispatchContext.Provider>
    </StateContext.Provider>
    )
};

export function useStateProvider() {
    return [
        useContext(StateContext),
        useContext(DispatchContext)
    ]
}

export const initialState = {
    selectedCallsigns: []
}

function reducer(prevState, action) {
    console.log(action)
    switch (action.type) {
        case 'set':
            return {...prevState, [action.key]: action.value};
        case 'selectCallsign':
            return {...prevState, selectedCallsigns: [...prevState.selectedCallsigns.filter(x => x!==action.callsign), action.callsign]}
        case 'unselectCallsign':
            return {...prevState, selectedCallsigns: [...prevState.selectedCallsigns.filter(x => x!==action.callsign)]}
        default:
            console.error("Unknown action", action)
            break;
    }

}
