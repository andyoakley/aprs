import React, {useEffect, useState, useRef} from 'react'
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css'
import _uniqueId from 'lodash/uniqueId';
import { usePacketProvider } from './PacketProvider';


export default function AprsMap(props) {
    const [map, setMap] = useState();
    const mapRef = useRef(null);
    const [markers, setMarkers] = useState([])
    const packets = usePacketProvider();

    useEffect(() => {
        if (mapRef.current.children.length === 0) {
            setMap(
                new maplibregl.Map({
                    container: "aprsmap", 
                    style: process.env.REACT_APP_MAP_STYLESHEET,
                    center: [-122.32945, 47.60357], // starting position [lng, lat]
                    zoom: 8.65 // starting zoom
                    })
            );
        }
    }, []);

    useEffect(() => {
        if (map) {
            // TODO: clear and add is primitive, should do changes only here
            for (let oldmarker of markers) {
                oldmarker.remove();
            }

            for (let packet of packets.position) {
                var marker = new maplibregl.Popup({closeOnClick: false, closeOnMove: false})
                    .setLngLat([packet.longitude, packet.latitude])
                    .setHTML(packet.source)
                    .addTo(map);
                setMarkers(old => [...old, marker])
            }
        }
    }, [packets.position])
    
    return (<div ref={mapRef} id="aprsmap"  {...props}>map</div>)

}