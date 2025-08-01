import React, { useState } from 'react';
import { ArrowLeftFromLine, ArrowRightFromLine, Blend, Eye, EyeOff } from 'lucide-react';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import { Geometry } from 'ol/geom';
import { wfsConfig } from '../../config/wfs';

type TLayerState = {
    isLoading: boolean;
    error: string | null;
    vectorLayer: VectorLayer<VectorSource<Feature<Geometry>>> | null;
    visible: boolean;
    opacity: number;
}

interface ILegendProps {
    layersState: Record<string, TLayerState>;
    setLayersState: React.Dispatch<React.SetStateAction<Record<string, TLayerState>>>;
}

const Legend: React.FC<ILegendProps> = ({
    layersState,
    setLayersState,
}) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleToggleVisible = (id: string, visible: boolean) => {
        setLayersState((prev) => ({
            ...prev,
            [id]: { ...prev[id], visible },
        }))
    }

    const handleChangeOpacity = (id: string, opacity: number) => {
        setLayersState((prev) => ({
            ...prev,
            [id]: { ...prev[id], opacity },
        }))
    }

    return (
        <div
            className={`absolute top-4 left-4 bg-white rounded-lg shadow text-sm z-10 overflow-hidden transition-all duration-300 ease-in-out ${isCollapsed ? 'w-24 p-2' : 'w-80 p-4 max-h-[90vh] overflow-auto'
                }`}
        >
            <div className="flex items-center justify-between">
                <h2 className="font-semibold">Legend</h2>
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-1 hover:bg-gray-100 rounded"
                    aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {isCollapsed ? (
                        <ArrowRightFromLine className="w-4 h-4" aria-label="Expand sidebar" />
                    ) : (
                        <ArrowLeftFromLine className="w-4 h-4" aria-label="Collapse sidebar" />
                    )}
                </button>
            </div>
            {!isCollapsed &&
                wfsConfig.map(({ id, label, legendItems }) => {
                    const layer = layersState[id];
                    if (!layer) return null;
                    return (
                        <div key={id} className="mb-4">
                            <label className="flex items-center gap-2 font-semibold mb-1">
                                {layer.visible ? (
                                    <Eye className="w-4 h-4" aria-label="Show" />
                                ) : (
                                    <EyeOff className="w-4 h-4" aria-label="Hide" />
                                )}
                                <input
                                    className="hidden"
                                    type="checkbox"
                                    checked={layer.visible}
                                    onChange={() => handleToggleVisible(id, !layer.visible)}
                                    aria-label={`Toggle ${label} visibility`}
                                />
                                {label}
                            </label>

                            <div className="flex items-center gap-2">
                                <Blend className="w-4 h-4" aria-label="Opacity" />
                                <input
                                    type="range"
                                    min={0}
                                    max={1}
                                    step={0.01}
                                    value={layer.opacity}
                                    onChange={(e) => handleChangeOpacity(id, parseFloat(e.target.value))}
                                    aria-label={`Adjust ${label} opacity`}
                                    className="w-full"
                                />
                            </div>

                            <div className="mt-2 flex flex-wrap gap-2">
                                {legendItems.map(({ color, label }) => (
                                    <div key={label} className="flex items-center gap-1">
                                        <span
                                            className="w-4 h-4 rounded border border-black"
                                            style={{ backgroundColor: color }}
                                        />
                                        <span>{label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
        </div>
    );
};

export default Legend;