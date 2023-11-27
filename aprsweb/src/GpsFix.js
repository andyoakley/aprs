import { usePacketProvider } from "./PacketProvider";
import { forward } from 'mgrs'

export default function GpsFix() {
    const packets = usePacketProvider();

    const gpgga = packets.gps['$GPGGA']?.raw
    if (!gpgga) {
        return "No fix"
    }

    const parts = gpgga.split(",")

    if (parts[6] !== "1") {
        return <div>No fix</div>
    }

    const lats = parts[2]
    const lons = parts[4]
    const lat = (parts[3]==="N"?1:-1) * (parseFloat(lats.substring(0, 2)) + (parseFloat(lats.substring(2))/60.0))
    const lon = (parts[3]==="E"?1:-1) * (parseFloat(lons.substring(0, 3)) + (parseFloat(lats.substring(3))/60.0))
    
    const mgrs_pos = forward([lon, lat])

    return (<>
        <div>{lat.toFixed(3)},{lon.toFixed(3)} {mgrs_pos} ({parts[7]}🛰)</div>
    </>)
}