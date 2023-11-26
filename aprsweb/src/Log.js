import { usePacketProvider } from "./PacketProvider";
import './Log.css'
import { useStateProvider } from "./StateProvider";
import AprsIcon from "./AprsIcon";
import GpsClock from "./GpsClock";
import GpsFix from './GpsFix';



export default function PacketLog() {
    const packets = usePacketProvider();
    const [state, dispatch] = useStateProvider();

    return (
        <div className="log">
            <div style={{gridArea: "gps"}}>
                <GpsClock></GpsClock>
                <GpsFix></GpsFix>
            </div>
            <div style={{gridArea: "position"}}>
                <h2>Positions</h2>
                {packets.position.map((packet, i) => <div key={`position-${i}`}>
                    <AprsIcon {...packet}></AprsIcon>
                    <Callsign callsign={packet.source}></Callsign>: 
                    {packet.comment}
                </div>)}
            </div>
            <div style={{gridArea: "beacon"}}>
                <h2>Beacons</h2>
                {packets.beacon.map((packet, i) => <div key={`beacon-${i}`}>
                    <Callsign callsign={packet.source}></Callsign>: {packet.comment}
                </div>)}
            </div>
            <div style={{gridArea: "message"}}>
                <h2>Messages</h2>
                {packets.message.map((packet, i) => <div key={`message-${i}`}>
                    <Callsign callsign={packet.source}></Callsign>: {packet.message}
                </div>)}
            </div>
        </div>
    )
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