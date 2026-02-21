import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

export class SimpleFoodClassifier {
  private model: mobilenet.MobileNet | null = null;

  async loadModel() {
    console.log('Loading MobileNet model...');
    this.model = await mobilenet.load();
    console.log('✓ MobileNet model loaded');
  }

  async classify(imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<Array<{
    className: string;
    probability: number;
  }>> {
    if (!this.model) {
      throw new Error('Model not loaded');
    }

    const predictions = await this.model.classify(imageElement);
    
    // Filtrer pour ne garder que les prédictions avec une bonne confiance
    return predictions
      .filter(p => p.probability > 0.1)
      .map(p => ({
        className: p.className.split(',')[0], // Prendre la première partie
        probability: p.probability
      }));
  }
}