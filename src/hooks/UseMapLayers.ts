import { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import OSM from 'ol/source/OSM';
import MousePosition from 'ol/control/MousePosition';
import { toLonLat } from 'ol/proj';
import { Style, Fill, Stroke } from 'ol/style';
import { get as getProjection } from 'ol/proj';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import ObservableVectorSource from '../ObservableVectorSource';
import { wfsConfig } from '../config/wfs';

const defaultProjection = 'EPSG:28992';

proj4.defs(
  defaultProjection,
  '+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +units=m +no_defs'
);
register(proj4);

const rdProjection = getProjection(defaultProjection)!;

type LayerState = {
  isLoading: boolean;
  error: string | null;
  vectorLayer: VectorLayer | null;
  visible: boolean;
  opacity: number;
};

const useMapLayers = () => {
  const mapRef = useRef<HTMLDivElement>(null);

  const [layersState, setLayersState] = useState<Record<string, LayerState>>(() =>
    wfsConfig.reduce((acc, wfs) => {
      acc[wfs.id] = {
        isLoading: false,
        error: null,
        vectorLayer: null,
        visible: true,
        opacity: 1,
      };
      return acc;
    }, {} as Record<string, LayerState>)
  );

  useEffect(() => {
    if (!mapRef.current) return;

    const baseLayer = new TileLayer({
      source: new OSM(),
    });

    const createdLayers = wfsConfig.map((wfs) => {
      const source = new ObservableVectorSource(wfs);

      source.on('featuresloadstart', () => {
        setLayersState((prev) => ({
          ...prev,
          [wfs.id]: { ...prev[wfs.id], isLoading: true, error: null },
        }));
      });

      source.on('featuresloadend', () => {
        setLayersState((prev) => ({
          ...prev,
          [wfs.id]: { ...prev[wfs.id], isLoading: false },
        }));
      });

      source.on('featuresloaderror', (e: any) => {
        setLayersState((prev) => ({
          ...prev,
          [wfs.id]: {
            ...prev[wfs.id],
            isLoading: false,
            error: e?.message || 'Unknown error',
          },
        }));
      });

      const layer = new VectorLayer({
        source,
        visible: true,
        opacity: 0.7,
        style: (feature) => {
          const type = feature.get(wfs.featureType);
          const color = wfs.colorMap[type] || 'rgba(0, 0, 0, 0.2)';
          return new Style({
            fill: new Fill({ color }),
            stroke: new Stroke({ color: '#000', width: 1 }),
          });
        },
      });

      return { id: wfs.id, layer };
    });

    const map = new Map({
      target: mapRef.current,
      layers: [baseLayer, ...createdLayers.map((l) => l.layer)],
      view: new View({
        projection: rdProjection,
        center: [155000, 463000],
        zoom: 10,
      }),
      controls: [],
    });

    const mousePosition = new MousePosition({
      coordinateFormat: (coord) => {
        if (!coord) return 'Position not available';
        const [lon, lat] = toLonLat(coord, defaultProjection);
        return `Lat: ${lat.toFixed(5)}, Lon: ${lon.toFixed(5)}`;
      },
      projection: defaultProjection,
      className: 'absolute top-4 right-4 text-sm bg-white/80 px-3 py-1 rounded shadow z-10',
      target: document.getElementById('mouse-position')!,
    });

    map.addControl(mousePosition);

    setLayersState((prev) => {
      const updated = { ...prev };
      createdLayers.forEach(({ id, layer }) => {
        updated[id] = { ...updated[id], vectorLayer: layer };
      });
      return updated;
    });

    return () => {
      map.setTarget(undefined);
    };
  }, []);

  useEffect(() => {
    Object.entries(layersState).forEach(([id, layerState]) => {
      const layer = layerState.vectorLayer;
      if (!layer) return;

      if (layer.getVisible() !== layerState.visible) {
        layer.setVisible(layerState.visible);
        const source = layer.getSource();
        source?.refresh();
      }

      if (layer.getOpacity() !== layerState.opacity) {
        layer.setOpacity(layerState.opacity);
      }
    });
  }, [layersState]);

  const reloadLayer = (id: string) => {
    const layer = layersState[id];
    if (!layer.visible){
        setLayersState((prev) => ({
            ...prev,
            [id]: { ...prev[id], isLoading: false, error: null },
        }));
        return;
    };
    if (layer?.vectorLayer) {
      const source = layer.vectorLayer.getSource();
      if (source) {
        source.refresh();
      }
    }
  };

  return {
    layersState,
    setLayersState,
    reloadLayer,
    mapRef,
  };
};

export default useMapLayers;