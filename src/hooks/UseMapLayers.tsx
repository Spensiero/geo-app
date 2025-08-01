import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';
import MousePosition from 'ol/control/MousePosition';
import { get as getProjection, toLonLat } from 'ol/proj';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import 'ol/ol.css';
import { Style, Fill, Stroke } from 'ol/style';
import type { FeatureLike } from 'ol/Feature';
import { useState, useEffect, useRef } from 'react';
import { wfsConfig } from '../config/wfs';

const defaultProjection = 'EPSG:28992'

proj4.defs(
    defaultProjection,
    '+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +units=m +no_defs'
);
register(proj4);

const rdProjection = getProjection(defaultProjection)!;

const useMapLayers = () => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [layersState, setLayersState] = useState(() =>
        wfsConfig.reduce((acc, wfs) => {
            acc[wfs.id] = {
                isLoading: true,
                error: null as string | null,
                vectorLayer: null as VectorLayer<VectorSource> | null,
                visible: true,
                opacity: 1,
            };
            return acc;
        }, {} as Record<string, {
            isLoading: boolean;
            error: string | null;
            vectorLayer: VectorLayer<VectorSource> | null;
            visible: boolean;
            opacity: number;
        }>)
    )

    useEffect(() => {
        if (!mapRef.current) return;

        const baseLayer = new TileLayer({
            source: new OSM(),
        });

        const createdLayers = wfsConfig.map((wfsConf) => {
            const vectorSource = new VectorSource({
                format: new GeoJSON(),
                loader: (extent, _resolution, projection) => {
                    setLayersState((prev) => ({
                        ...prev,
                        [wfsConf.id]: { ...prev[wfsConf.id], isLoading: true, error: null },
                    }));

                    const url = `https://service.pdok.nl${wfsConf.wfsUrl}?service=WFS&version=2.0.0&request=GetFeature&typeName=${wfsConf.typeName}&outputFormat=application/json&srsName=${defaultProjection}&bbox=${extent.join(',')},${defaultProjection}`;

                    fetch(url)
                        .then(async (response) => {
                            if (!response.ok) {
                                const text = await response.text()
                                const match = text.match(/<ows:ExceptionText[^>]*>([\s\S]*?)<\/ows:ExceptionText>/)
                                const exceptionText = match ? match[1] : text
                                throw new Error(exceptionText || `HTTP error ${response.status}`)
                            }
                            return response.json();
                        })
                        .then((json: any) => {
                            const features = vectorSource.getFormat()?.readFeatures(json, {
                                dataProjection: defaultProjection,
                                featureProjection: projection,
                            }) || [];
                            vectorSource.clear(true);
                            if (features.length > 0) {
                                vectorSource.addFeatures(features);
                            }
                            setLayersState((prev) => ({
                                ...prev,
                                [wfsConf.id]: { ...prev[wfsConf.id], isLoading: false, error: null },
                            }));
                        })
                        .catch((err: Error) => {
                            setLayersState((prev) => ({
                                ...prev,
                                [wfsConf.id]: { ...prev[wfsConf.id], isLoading: false, error: `Failed to load WFS data: ${err.message}` },
                            }));
                            console.error(`WFS Load Error for ${wfsConf.id}:`, err);
                        });
                },
                strategy: bboxStrategy,
            })

            const styleFunction = (feature: FeatureLike) => {
                const type = feature.get(wfsConf.featureType);
                const color = wfsConf.colorMap[type] || 'rgba(0, 0, 0, 0.2)';
                return new Style({
                    fill: new Fill({
                        color,
                    }),
                    stroke: new Stroke({
                        color: '#000',
                        width: 1,
                    }),
                });
            };

            const vectorLayer = new VectorLayer({
                source: vectorSource,
                visible: true,
                opacity: 0.7,
                style: styleFunction,
            });

            return { id: wfsConf.id, vectorLayer };
        });

        const mapInstance = new Map({
            target: mapRef.current,
            layers: [baseLayer, ...createdLayers.map((l) => l.vectorLayer)],
            view: new View({
                projection: rdProjection,
                center: [155000, 463000],
                zoom: 10,
            }),
            controls: [],
        });

        const mousePosition = new MousePosition({
            coordinateFormat: (coord) => {
                if (!coord) return 'Position not available'
                const [lon, lat] = toLonLat(coord, defaultProjection)
                return `Lat: ${lat.toFixed(5)}, Lon: ${lon.toFixed(5)}`
            },
            projection: defaultProjection,
            className: 'absolute top-4 right-4 text-sm bg-white/80 px-3 py-1 rounded shadow z-10',
            target: document.getElementById('mouse-position')!,
        });

        mapInstance.addControl(mousePosition);

        setLayersState((prev) => {
            const newState = { ...prev }
            createdLayers.forEach(({ id, vectorLayer }) => {
                newState[id] = { ...newState[id], vectorLayer }
            })
            return newState;
        });

        return () => mapInstance.setTarget(undefined);
    }, []);

    useEffect(() => {
        Object.values(layersState).forEach((layer) => {
            if (!layer.vectorLayer) return;

            const isVisible = layer.visible ?? true;
            const currentOpacity = layer.opacity ?? 1;

            if (layer.vectorLayer.getVisible() !== isVisible) {
                layer.vectorLayer.setVisible(isVisible);
            };

            if (layer.visible && layer.vectorLayer.getOpacity() !== currentOpacity) {
                layer.vectorLayer.setOpacity(currentOpacity);
            }
        });
    }, [layersState]);

    const reloadLayer = (id: string) => {
        const layer = layersState[id];
        if (layer.vectorLayer) {
            setLayersState((prev) => ({
                ...prev,
                [id]: { ...prev[id], isLoading: true, error: null },
            }));
            try {
                layer.vectorLayer.getSource()?.refresh();
                setLayersState((prev) => ({
                    ...prev,
                    [id]: { ...prev[id], isLoading: false },
                }));
            } catch (err) {
                setLayersState((prev) => ({
                    ...prev,
                    [id]: {
                        ...prev[id],
                        error: `Failed to reload data: ${err instanceof Error ? err.message : 'Unknown error'}`,
                        isLoading: false,
                    },
                }));
            }
        }
    }

    return {
        layersState,
        setLayersState,
        reloadLayer,
        mapRef,
    };
}
export default useMapLayers;
