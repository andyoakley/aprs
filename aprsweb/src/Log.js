import { usePacketProvider } from "./PacketProvider";
import './Log.css'
import { useStateProvider } from "./StateProvider";



export default function PacketLog() {
    const packets = usePacketProvider();
    const [state, dispatch] = useStateProvider();

    return (
        <div className="log">
            <div style={{gridArea: "gps"}}>
                {packets.gps['$GPRMC']?.raw}
                <br />
                {packets.gps['$GPGGA']?.raw}
            </div>
            <div style={{gridArea: "position"}}>
                <h2>Positions</h2>
                {packets.position.map((packet, i) => <div key={`position-${i}`}>
                    <Callsign callsign={packet.source}></Callsign>: {packet.comment}
                </div>)}
            </div>
            <div style={{gridArea: "beacon"}}>
                <h2>Beacons</h2>
                {packets.beacon.map((packet, i) => <div key={`beacon-${i}`}>
                    <Callsign callsign={packet.source}></Callsign>: {packet.comment}
                </div>)}
            </div>
            <div style={{gridArea: "status"}}>
                <ConnectionStatus status={packets.websocket}></ConnectionStatus>
            </div>
        </div>
    )
}

function ConnectionStatus({status}) {
    const bg = status === "open" ? "lightgreen" : "red";
    return (<div style={{backgroundColor: bg, height: "100%"}}>{status}</div>)
}

function Callsign({callsign}) {
    const [state, dispatch] = useStateProvider();

    let selected = false;
    for (let watched of state.selectedCallsigns) {
        if (callsign === watched) { selected = true; break; }
    }

    return (<span
        onMouseEnter={() => dispatch({type:'selectCallsign', callsign: callsign})}
        onMouseLeave={() => dispatch({type:'unselectCallsign', callsign: callsign})}
         style={{fontWeight: selected ? "bold" : "normal"}}>{callsign}</span> );
}