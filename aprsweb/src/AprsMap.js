import React, {useEffect, useState, useRef} from 'react'
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css'
import _uniqueId from 'lodash/uniqueId';


function AprsMap(props) {
    const [id] = useState(_uniqueId("map-"));
    const [map, setMap] = useState();
    const mapRef = useRef(null);

    const ws = useRef(null);



    useEffect(() => {
        if (mapRef.current.children.length === 0) {
            setMap(
                new maplibregl.Map({
                    container: id,
                    style: process.env.REACT_APP_MAP_STYLESHEET,
                    center: [-122.32945, 47.60357], // starting position [lng, lat]
                    zoom: 8.65 // starting zoom
                    })
            );
        }
    }, [id]);


    useEffect(() => {
        ws.current = new WebSocket(process.env.REACT_APP_APRS_WEBSOCKET);

        ws.current.onmessage = event => {
            const e = JSON.parse(event.data);


            if (e.type === "position") {
                console.log(map, e);
                var marker = new maplibregl.Popup({closeOnClick: false, closeOnMove: false})
                    .setLngLat([e.longitude, e.latitude])
                    .setHTML(e.source)
                    .addTo(map);

                    /*
                let el = document.createElement("div");
                let content = document.createTextNode(e.raw);
                el.appendChild(content);
                let container = document.getElementById("log");
                container.insertBefore(el, container.firstChild);
                */

                window.setTimeout(() => {
                 //       container.removeChild(el);
                        marker.remove();
                }, 10*60*1000 )
            }
        }

        const same_for_close = ws.current;
        return () => {
            // cleanup
            if (same_for_close.readyState !== WebSocket.CLOSED) 
                same_for_close.close();
        }
    }, [map])
    
    return (<div ref={mapRef} id={id} {...props}>map</div>)

}

export default AprsMap;