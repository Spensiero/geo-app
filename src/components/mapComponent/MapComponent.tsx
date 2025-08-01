import React from 'react';
import { LoaderCircle, X } from 'lucide-react';
import Legend from './Legend';
import useMapLayers from '../../hooks/UseMapLayers';

const MapComponent: React.FC = () => {
  const { layersState, setLayersState, reloadLayer, mapRef } = useMapLayers();
  const isAnyLoading = Object.values(layersState).some(state => state.isLoading);

  return (
    <div className="relative w-full h-full">

      {isAnyLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-20 pointer-events-none">
          <LoaderCircle className="w-8 h-8 animate-spin" />
        </div>
      )}

      {Object.entries(layersState).map(([id, state]) =>
        state.error ? (
          <div
            key={`error-${id}`}
            className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-20 flex items-center gap-2"
          >
            <span>{state.error}</span>
            <button onClick={() => reloadLayer(id)} className="text-red-700 hover:text-red-900 font-bold">
              <X aria-label="Close" className="w-4 h-4" />
            </button>
          </div>
        ) : null
      )}

      <Legend
        layersState={layersState}
        setLayersState={setLayersState}
      />

      <div ref={mapRef} className="w-full h-full" />
      <div id="mouse-position" />
    </div>
  )
};

export default MapComponent;
