import { usePacketProvider } from "./PacketProvider";
import './ConnectionStatus.css'

export default function ConnectionStatus() {
    const packets = usePacketProvider();

    const bg = packets.websocket === "open" ? "lightgreen" : "red";
    return (<div className={`conn_status ${packets.websocket}`}>&nbsp;</div>)
}