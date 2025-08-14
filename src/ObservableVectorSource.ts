import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';
import type { Feature } from 'ol';
import type { ProjectionLike } from 'ol/proj';
import type { Geometry } from 'ol/geom';

export type WFSConfig = {
  wfsUrl: string;
  typeName: string;
};

export default class ObservableVectorSource extends VectorSource<Feature<Geometry>> {
  private wfsConfig: WFSConfig;
  private format: GeoJSON;

  constructor(wfsConfig: WFSConfig) {
    super({
      format: new GeoJSON(),
      strategy: bboxStrategy,
      loader: () => {},
    });

    this.wfsConfig = wfsConfig;
    this.format = new GeoJSON();

    this.setCustomLoader();
  }

  private setCustomLoader() {
    this.setLoader((extent, resolution, projection) => {
      const defaultProjection = projection.getCode();
      const url = `https://service.pdok.nl${this.wfsConfig.wfsUrl}?service=WFS&version=2.0.0&request=GetFeature&typeName=${this.wfsConfig.typeName}&outputFormat=application/json&srsName=${defaultProjection}&bbox=${extent.join(',')},${defaultProjection}`;

      this.dispatchEvent('featuresloadstart');

      fetch(url)
        .then(async (response) => {
          if (!response.ok) {
            const text = await response.text();
            const match = text.match(/<ows:ExceptionText[^>]*>([\s\S]*?)<\/ows:ExceptionText>/);
            const exceptionText = match ? match[1] : text;
            throw new Error(exceptionText || `HTTP error ${response.status}`);
          }
          return response.json();
        })
        .then((json) => {
          const features = this.format.readFeatures(json, {
            dataProjection: defaultProjection,
            featureProjection: projection as ProjectionLike,
          });

          this.clear(true);
          if (features.length > 0) {
            this.addFeatures(features);
          }

          this.dispatchEvent('featuresloadend');
        })
        .catch((err: Error) => {
          this.dispatchEvent({
            type: 'featuresloaderror',
            message: err.message,
          } as any);
        });
    });
  }
}