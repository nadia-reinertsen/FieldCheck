import { useState } from 'react';
import Landing from './components/Landing';
import Map from './components/Map';

function App() {
  const [showMap, setShowMap] = useState(false);

  return showMap ? <Map /> : <Landing onEnter={() => setShowMap(true)} />;
}

export default App;
