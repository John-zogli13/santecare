import * as tf from '@tensorflow/tfjs';
import { loadGraphModel } from '@tensorflow/tfjs-converter';

// Modèle Food-101 pré-entraîné (101 catégories d'aliments)
export class Food101Classifier {
  private model: tf.GraphModel | null = null;
  private readonly modelUrl = 'https://storage.googleapis.com/tfjs-models/tfjs/food101/model.json';
  private readonly labels: string[] = [
    'apple_pie', 'baby_back_ribs', 'baklava', 'beef_carpaccio', 'beef_tartare',
    'beet_salad', 'beignets', 'bibimbap', 'bread_pudding', 'breakfast_burrito',
    'bruschetta', 'caesar_salad', 'cannoli', 'caprese_salad', 'carrot_cake',
    'ceviche', 'cheesecake', 'cheese_plate', 'chicken_curry', 'chicken_quesadilla',
    'chicken_wings', 'chocolate_cake', 'chocolate_mousse', 'churros', 'clam_chowder',
    'club_sandwich', 'crab_cakes', 'creme_brulee', 'croque_madame', 'cup_cakes',
    'deviled_eggs', 'donuts', 'dumplings', 'edamame', 'eggs_benedict',
    'escargots', 'falafel', 'filet_mignon', 'fish_and_chips', 'foie_gras',
    'french_fries', 'french_onion_soup', 'french_toast', 'fried_calamari', 'fried_rice',
    'frozen_yogurt', 'garlic_bread', 'gnocchi', 'greek_salad', 'grilled_cheese_sandwich',
    'grilled_salmon', 'guacamole', 'gyoza', 'hamburger', 'hot_and_sour_soup',
    'hot_dog', 'huevos_rancheros', 'hummus', 'ice_cream', 'lasagna',
    'lobster_bisque', 'lobster_roll', 'macaroni_and_cheese', 'macarons', 'miso_soup',
    'mussels', 'nachos', 'omelette', 'onion_rings', 'oysters',
    'pad_thai', 'paella', 'pancakes', 'panna_cotta', 'peking_duck',
    'pho', 'pizza', 'pork_chop', 'poutine', 'prime_rib',
    'pulled_pork_sandwich', 'ramen', 'ravioli', 'red_velvet_cake', 'risotto',
    'samosa', 'sashimi', 'scallops', 'seaweed_salad', 'shrimp_and_grits',
    'spaghetti_bolognese', 'spaghetti_carbonara', 'spring_rolls', 'steak', 'strawberry_shortcake',
    'sushi', 'tacos', 'takoyaki', 'tiramisu', 'tuna_tartare',
    'waffles'
  ];

  async loadModel() {
    try {
      console.log('Loading Food-101 model...');
      this.model = await loadGraphModel(this.modelUrl);
      console.log('✓ Food-101 model loaded');
      return true;
    } catch (error) {
      console.error('Failed to load Food-101 model:', error);
      return false;
    }
  }

  async classify(imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<Array<{
    className: string;
    probability: number;
    nutritionInfo?: any;
  }>> {
    if (!this.model) {
      throw new Error('Model not loaded');
    }

    // Prétraitement de l'image
    const tensor = tf.tidy(() => {
      const image = tf.browser.fromPixels(imageElement);
      const resized = tf.image.resizeBilinear(image, [224, 224]);
      const normalized = resized.toFloat().div(tf.scalar(255));
      const batched = normalized.expandDims(0);
      return batched;
    });

    // Inférence
    const predictions = await this.model.predict(tensor) as tf.Tensor;
    const probabilities = await predictions.data();

    // Nettoyage
    tensor.dispose();
    predictions.dispose();

    // Récupérer les top 5 prédictions
    const results = Array.from(probabilities)
      .map((prob, index) => ({
        className: this.labels[index].replace(/_/g, ' '),
        probability: prob,
      }))
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 5)
      .filter(item => item.probability > 0.1);

    return results;
  }
}