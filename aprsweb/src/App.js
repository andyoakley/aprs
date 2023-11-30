import './App.css';
import AprsMap from './AprsMap';
import ConnectionStatus from './ConnectionStatus';
import Log from './Log'

import { useEffect } from "react";
import { useWakeLock } from 'react-screen-wake-lock';

export default function App() {

  // keep screen on
  const { isSupported, released, request, release } = useWakeLock();
  useEffect(() => {
      request()
      return () => release();
  }, []);

  return (
    <div className="App">
      <header>N7APO APRS map</header>
      <AprsMap></AprsMap>    
      <Log></Log>
      <ConnectionStatus></ConnectionStatus>
    </div>
  );
}