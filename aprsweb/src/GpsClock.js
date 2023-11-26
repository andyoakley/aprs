import { usePacketProvider } from "./PacketProvider";

export default function GpsClock() {
    const packets = usePacketProvider();

    const gpgga = packets.gps['$GPGGA']?.raw
    if (!gpgga) {
        return "No fix"
    }

    const parts = gpgga.split(",")
    if (parts.length<1) return;
    
    const h = parts[1].substring(0, 2)
    const m = parts[1].substring(2, 4)
    const s = parts[1].substring(4, 6)
    const ms = parts[1].substring(7, 10)

    var utc = new Date(Date.UTC(0, 0, 0, h, m, s, ms));

    return (<div>
        <span>Local {utc.toLocaleTimeString('en', {hour12: false})}</span>
        {" "}
        <span>UTC {utc.toLocaleTimeString('en', {timeZone: 'UTC', hour12: false})}</span>
    </div>)

}