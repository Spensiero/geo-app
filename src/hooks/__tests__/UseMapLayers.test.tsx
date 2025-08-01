import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import useMapLayers from '../UseMapLayers';
import { wfsConfig } from '../../config/wfs';

// Mock the VectorLayer to track visibility changes
vi.mock('ol/layer/Vector', () => ({
  __esModule: true,
  default: vi.fn().mockImplementation(() => ({
    setVisible: vi.fn(),
    getVisible: vi.fn().mockReturnValue(true),
  })),
}));

describe('useMapLayers', () => {
  it('should initialize with the correct initial state', () => {
    // Render the hook
    const { result } = renderHook(() => useMapLayers());

    // Check if mapRef is initialized as null
    expect(result.current.mapRef.current).toBeNull();

    // Check if all layers from wfsConfig are initialized with the correct default state
    wfsConfig.forEach(config => {
      const layerState = result.current.layersState[config.id];
      
      expect(layerState).toEqual({
        isLoading: true,
        error: null,
        vectorLayer: null,
        visible: true,
        opacity: 1
      });
    });
  });

  it('should update layer state when setLayersState is called', () => {
    // Render the hook
    const { result } = renderHook(() => useMapLayers());
    
    // Get the first layer ID from the config
    const firstLayerId = wfsConfig[0].id;
    
    // Initial state
    const initialLayerState = result.current.layersState[firstLayerId];
    expect(initialLayerState.visible).toBe(true);
    
    // Update the layer state
    act(() => {
      result.current.setLayersState(prev => ({
        ...prev,
        [firstLayerId]: {
          ...prev[firstLayerId],
          visible: false,
          opacity: 0.5
        }
      }));
    });
    
    // Check if the state was updated correctly
    const updatedLayerState = result.current.layersState[firstLayerId];
    expect(updatedLayerState.visible).toBe(false);
    expect(updatedLayerState.opacity).toBe(0.5);
  });
});