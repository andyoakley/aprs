import React, {useEffect, useState, useRef} from 'react'
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css'
import { usePacketProvider } from './PacketProvider';
import { useStateProvider } from './StateProvider';
import "./AprsMap.css"
import ReactDomServer from 'react-dom/server'
import AprsIcon from './AprsIcon';


export default function AprsMap(props) {
    const [map, setMap] = useState();
    const mapRef = useRef(null);
    const [markers, setMarkers] = useState([])
    const packets = usePacketProvider();
    const [state, dispatch] = useStateProvider();

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
        console.log(packets);
        if (map) {
            // TODO: clear and add is primitive, should do changes only here
            for (let oldmarker of markers) {
                oldmarker.remove();
            }


            for (let packet of packets.position) {
                const html = ReactDomServer.renderToStaticMarkup(
                    <div style={{backgroundColor: (state.selectedCallsigns.includes(packet.source)?"green":"")}}>
                        <AprsIcon {...packet}></AprsIcon>
                        {packet.source}
                    </div>
                );

                const marker = new maplibregl.Popup({closeOnClick: false, closeOnMove: false})
                    .setLngLat([packet.longitude, packet.latitude])
                    .setHTML(html)
                    .addTo(map);
                setMarkers(old => [...old, marker])
            }
        }
    // map will change on each render
    // eslint-disable-next-line 
    }, [packets.position, state.selectedCallsigns])
    
    return (<div ref={mapRef} id="aprsmap"  {...props}>map</div>)

}