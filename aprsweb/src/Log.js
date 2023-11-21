import { usePacketProvider } from "./PacketProvider";

export default function PacketLog() {
    const packets = usePacketProvider();

    return (
        <div className="log">
            <div style={{gridArea: "position"}}>
                <h2>Positions</h2>
                {packets.position.map(packet => <div>
                    {packet.source}: {packet.comment}
                </div>)}
            </div>
            <div style={{gridArea: "beacon"}}>
                <h2>Beacons</h2>
                {packets.beacon.map(packet => <div>
                    {packet.source}: {packet.comment}
                </div>)}
            </div>
        </div>
    )
}