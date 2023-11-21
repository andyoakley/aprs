import { createContext, useContext, useEffect, useReducer } from "react"

export const PacketContext = createContext();

export const PacketProvider = ({children}) => {
    const [state, dispatch ] = useReducer(reducer, initialState);

    useEffect(() => {
        const socket = new WebSocket(process.env.REACT_APP_APRS_WEBSOCKET);
        socket.onmessage = event => {
            const e = JSON.parse(event.data);
            dispatch({type: e.type, packet: e})
        }
        return () => { socket.close(); }
    }, [])

    return (
        <PacketContext.Provider value={state}>
            {children}
        </PacketContext.Provider>
    );
};

export function usePacketProvider() {
    return useContext(PacketContext)
}

export const initialState = {
    position: [],
    message: [],
    status: [],
    beacon: [],
    gps: {}
}

function reducer(prevState, action) {
    switch (action.type) {
        case 'gps':
            const parts = action.packet.raw.split(",")
            return {...prevState, gps: { [parts[0]]: action.packet, ...prevState.gps}}
        case 'position':
            return {...prevState, position: [action.packet, ...prevState.position]}
        case 'message':
            return {...prevState, message: [action.packet, ...prevState.message]}
        case 'status':
            return {...prevState, status: [action.packet, ...prevState.status]}
        case 'beacon':
            return {...prevState, beacon: [action.packet, ...prevState.beacon]}
        default:
            console.log("unknown action ", action.type)
            return prevState;
    }

}
