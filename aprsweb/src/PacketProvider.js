import { createContext, useRef, useContext, useState, useEffect, useReducer } from "react"

export const PacketContext = createContext();

export const PacketProvider = ({children}) => {
    const [state, dispatch ] = useReducer(reducer, initialState);

    const socketHandleRef = useRef();
    const timeoutHandleRef = useRef();

    const socketOpenListener = event => {
        dispatch({type: "websocket", state: "open"})

        // success, can cancel timeout
        if (timeoutHandleRef.current) { 
            clearTimeout(timeoutHandleRef.current);
            timeoutHandleRef.current = null;
        }
    }

    const socketMessageListener = event => {
        const e = JSON.parse(event.data);
        dispatch({type: e.type, packet: e})
    }

    const timeoutHandler = () => {
        clearTimeout(timeoutHandleRef.current);
        timeoutHandleRef.current = null;

        if (socketHandleRef.current) {
            socketHandleRef.current.close();
            socketHandleRef.current = null;
        }

        tryOpenSocket();
    }

    const closeHandler = () => {
        // time handler will retry when it expires, don't want to try and open it twice
        if (timeoutHandleRef.current) return;

        // otherwise, we got closed when it was actually open, so retry opening it.
        tryOpenSocket();
    }

    const tryOpenSocket = event => {
        dispatch({type: "websocket", state: "close"})

        const th = setTimeout(timeoutHandler, 5000);
        timeoutHandleRef.current = th;

        const socket = new WebSocket(process.env.REACT_APP_APRS_WEBSOCKET);
        socketHandleRef.current = socket;

        socket.addEventListener("open", socketOpenListener);
        socket.addEventListener("message", socketMessageListener);
        socket.addEventListener("close", closeHandler);
    }

    useEffect(() => {
        tryOpenSocket();
        return () => {
            if (socketHandleRef.current) { socketHandleRef.current.close();  }
            if (timeoutHandleRef.current) { clearTimeout(timeoutHandleRef.current); }
        }
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
