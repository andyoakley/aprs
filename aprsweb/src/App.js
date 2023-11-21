import './App.css';
import AprsMap from './AprsMap';
import Log from './Log'

function App() {
  return (
    <div className="App">
      <header>N7APO APRS map</header>
      <AprsMap></AprsMap>    
      <Log></Log>
    </div>
  );
}

export default App;
