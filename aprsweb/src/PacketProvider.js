import { createContext, useContext, useEffect, useReducer } from "react"

export const PacketContext = createContext();

export const PacketProvider = ({children}) => {
    const [state, dispatch ] = useReducer(reducer, initialState);

    useEffect(() => {
        const socket = new WebSocket(process.env.REACT_APP_APRS_WEBSOCKET);
        
        socket.addEventListener("message", event => {
            const e = JSON.parse(event.data);
            dispatch({type: e.type, packet: e})
        });

        socket.addEventListener("open", event => {
            dispatch({type: "websocket", state: "open"})
        })
        socket.addEventListener("error", event => {
            dispatch({type: "websocket", state: "error"})
        })
        socket.addEventListener("close", event => {
            dispatch({type: "websocket", state: "close"})
        })

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
    gps: {},
    websocket: null
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
        case 'websocket':
            return {...prevState, websocket: action.state}
        default:
            console.log("unknown action ", action.type, action)
            return prevState;
    }

}
