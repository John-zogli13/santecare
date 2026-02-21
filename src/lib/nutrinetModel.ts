import * as tf from '@tensorflow/tfjs';

// Modèle personnalisé pour l'analyse nutritionnelle
export class NutriNet {
  private model: tf.LayersModel | null = null;
  
  // Données nutritionnelles pour chaque catégorie d'aliment
  private nutritionDatabase: Record<string, {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    fiber?: number;
    sugar?: number;
    portion: string;
  }> = {
    'apple pie': { calories: 237, protein: 2.4, fat: 11, carbs: 34, fiber: 1.8, sugar: 16, portion: '100g' },
    'baby back ribs': { calories: 320, protein: 25, fat: 24, carbs: 0, portion: '100g' },
    'baklava': { calories: 430, protein: 6, fat: 24, carbs: 48, sugar: 24, portion: '100g' },
    'beef carpaccio': { calories: 160, protein: 22, fat: 7, carbs: 1, portion: '100g' },
    'beef tartare': { calories: 200, protein: 24, fat: 11, carbs: 1, portion: '100g' },
    'beet salad': { calories: 85, protein: 2.5, fat: 4, carbs: 11, fiber: 3, sugar: 7, portion: '100g' },
    'beignets': { calories: 350, protein: 6, fat: 18, carbs: 41, sugar: 15, portion: '100g' },
    'bibimbap': { calories: 150, protein: 8, fat: 5, carbs: 19, fiber: 2, portion: '100g' },
    'bread pudding': { calories: 230, protein: 6, fat: 9, carbs: 32, sugar: 18, portion: '100g' },
    'breakfast burrito': { calories: 220, protein: 12, fat: 12, carbs: 17, fiber: 2, portion: '100g' },
    'bruschetta': { calories: 180, protein: 5, fat: 8, carbs: 22, fiber: 2, sugar: 3, portion: '100g' },
    'caesar salad': { calories: 150, protein: 5, fat: 12, carbs: 6, fiber: 2, portion: '100g' },
    'cannoli': { calories: 280, protein: 6, fat: 14, carbs: 32, sugar: 18, portion: '100g' },
    'caprese salad': { calories: 150, protein: 8, fat: 12, carbs: 3, fiber: 1, portion: '100g' },
    'carrot cake': { calories: 325, protein: 3, fat: 16, carbs: 44, sugar: 32, fiber: 2, portion: '100g' },
    'ceviche': { calories: 95, protein: 15, fat: 2, carbs: 5, fiber: 1, portion: '100g' },
    'cheesecake': { calories: 320, protein: 6, fat: 22, carbs: 26, sugar: 18, portion: '100g' },
    'cheese plate': { calories: 380, protein: 22, fat: 32, carbs: 1.5, portion: '100g' },
    'chicken curry': { calories: 180, protein: 18, fat: 10, carbs: 6, fiber: 2, portion: '100g' },
    'chicken quesadilla': { calories: 250, protein: 15, fat: 13, carbs: 19, fiber: 2, portion: '100g' },
    'chicken wings': { calories: 320, protein: 22, fat: 25, carbs: 0, portion: '100g' },
    'chocolate cake': { calories: 370, protein: 5, fat: 18, carbs: 50, sugar: 35, portion: '100g' },
    'chocolate mousse': { calories: 280, protein: 5, fat: 18, carbs: 25, sugar: 20, portion: '100g' },
    'churros': { calories: 380, protein: 4, fat: 20, carbs: 45, sugar: 20, portion: '100g' },
    'clam chowder': { calories: 85, protein: 5, fat: 4, carbs: 8, portion: '100g' },
    'club sandwich': { calories: 220, protein: 12, fat: 10, carbs: 22, fiber: 2, portion: '100g' },
    'crab cakes': { calories: 180, protein: 15, fat: 10, carbs: 8, portion: '100g' },
    'creme brulee': { calories: 330, protein: 5, fat: 22, carbs: 28, sugar: 26, portion: '100g' },
    'croque madame': { calories: 280, protein: 14, fat: 16, carbs: 20, portion: '100g' },
    'cup cakes': { calories: 360, protein: 4, fat: 16, carbs: 52, sugar: 38, portion: '100g' },
    'deviled eggs': { calories: 220, protein: 10, fat: 18, carbs: 2, portion: '100g' },
    'donuts': { calories: 420, protein: 5, fat: 22, carbs: 50, sugar: 25, portion: '100g' },
    'dumplings': { calories: 180, protein: 8, fat: 6, carbs: 24, portion: '100g' },
    'edamame': { calories: 120, protein: 11, fat: 5, carbs: 9, fiber: 5, portion: '100g' },
    'eggs benedict': { calories: 250, protein: 14, fat: 18, carbs: 8, portion: '100g' },
    'escargots': { calories: 130, protein: 16, fat: 6, carbs: 2, portion: '100g' },
    'falafel': { calories: 320, protein: 13, fat: 17, carbs: 31, fiber: 5, portion: '100g' },
    'filet mignon': { calories: 270, protein: 26, fat: 18, carbs: 0, portion: '100g' },
    'fish and chips': { calories: 280, protein: 15, fat: 15, carbs: 22, fiber: 2, portion: '100g' },
    'foie gras': { calories: 460, protein: 12, fat: 45, carbs: 3, portion: '100g' },
    'french fries': { calories: 310, protein: 3.5, fat: 15, carbs: 41, fiber: 3.8, portion: '100g' },
    'french onion soup': { calories: 50, protein: 3, fat: 2, carbs: 6, portion: '100g' },
    'french toast': { calories: 230, protein: 7, fat: 11, carbs: 26, sugar: 8, portion: '100g' },
    'fried calamari': { calories: 220, protein: 15, fat: 12, carbs: 14, portion: '100g' },
    'fried rice': { calories: 160, protein: 5, fat: 5, carbs: 24, fiber: 1, portion: '100g' },
    'frozen yogurt': { calories: 120, protein: 4, fat: 3, carbs: 20, sugar: 16, portion: '100g' },
    'garlic bread': { calories: 320, protein: 8, fat: 16, carbs: 38, fiber: 2, portion: '100g' },
    'gnocchi': { calories: 180, protein: 5, fat: 3, carbs: 34, fiber: 2, portion: '100g' },
    'greek salad': { calories: 100, protein: 3, fat: 7, carbs: 6, fiber: 2, portion: '100g' },
    'grilled cheese sandwich': { calories: 300, protein: 12, fat: 16, carbs: 28, portion: '100g' },
    'grilled salmon': { calories: 200, protein: 22, fat: 12, carbs: 0, portion: '100g' },
    'guacamole': { calories: 150, protein: 2, fat: 13, carbs: 8, fiber: 5, portion: '100g' },
    'gyoza': { calories: 180, protein: 8, fat: 6, carbs: 24, portion: '100g' },
    'hamburger': { calories: 250, protein: 15, fat: 12, carbs: 22, fiber: 1, portion: '100g' },
    'hot and sour soup': { calories: 40, protein: 3, fat: 1, carbs: 5, portion: '100g' },
    'hot dog': { calories: 280, protein: 12, fat: 22, carbs: 8, portion: '100g' },
    'huevos rancheros': { calories: 160, protein: 9, fat: 10, carbs: 10, fiber: 2, portion: '100g' },
    'hummus': { calories: 170, protein: 5, fat: 12, carbs: 12, fiber: 4, portion: '100g' },
    'ice cream': { calories: 200, protein: 3, fat: 11, carbs: 23, sugar: 21, portion: '100g' },
    'lasagna': { calories: 150, protein: 8, fat: 7, carbs: 14, fiber: 2, portion: '100g' },
    'lobster bisque': { calories: 90, protein: 5, fat: 5, carbs: 6, portion: '100g' },
    'lobster roll': { calories: 220, protein: 12, fat: 12, carbs: 16, portion: '100g' },
    'macaroni and cheese': { calories: 160, protein: 6, fat: 7, carbs: 18, portion: '100g' },
    'macarons': { calories: 380, protein: 5, fat: 16, carbs: 55, sugar: 48, portion: '100g' },
    'miso soup': { calories: 35, protein: 2.5, fat: 1, carbs: 4, portion: '100g' },
    'mussels': { calories: 85, protein: 12, fat: 2, carbs: 4, portion: '100g' },
    'nachos': { calories: 280, protein: 8, fat: 15, carbs: 28, fiber: 3, portion: '100g' },
    'omelette': { calories: 150, protein: 10, fat: 11, carbs: 1, portion: '100g' },
    'onion rings': { calories: 350, protein: 4, fat: 20, carbs: 38, fiber: 2, portion: '100g' },
    'oysters': { calories: 70, protein: 8, fat: 2, carbs: 4, portion: '100g' },
    'pad thai': { calories: 180, protein: 8, fat: 6, carbs: 25, fiber: 2, portion: '100g' },
    'paella': { calories: 150, protein: 10, fat: 4, carbs: 20, fiber: 1, portion: '100g' },
    'pancakes': { calories: 220, protein: 6, fat: 8, carbs: 33, sugar: 8, portion: '100g' },
    'panna cotta': { calories: 280, protein: 4, fat: 20, carbs: 22, sugar: 18, portion: '100g' },
    'peking duck': { calories: 250, protein: 18, fat: 18, carbs: 4, portion: '100g' },
    'pho': { calories: 70, protein: 5, fat: 2, carbs: 9, portion: '100g' },
    'pizza': { calories: 266, protein: 11, fat: 10, carbs: 33, fiber: 2.5, portion: '100g' },
    'pork chop': { calories: 240, protein: 25, fat: 15, carbs: 0, portion: '100g' },
    'poutine': { calories: 280, protein: 10, fat: 18, carbs: 20, portion: '100g' },
    'prime rib': { calories: 320, protein: 25, fat: 24, carbs: 0, portion: '100g' },
    'pulled pork sandwich': { calories: 240, protein: 16, fat: 10, carbs: 24, portion: '100g' },
    'ramen': { calories: 90, protein: 5, fat: 3, carbs: 12, portion: '100g' },
    'ravioli': { calories: 150, protein: 7, fat: 5, carbs: 20, portion: '100g' },
    'red velvet cake': { calories: 360, protein: 4, fat: 18, carbs: 48, sugar: 35, portion: '100g' },
    'risotto': { calories: 140, protein: 4, fat: 5, carbs: 20, portion: '100g' },
    'samosa': { calories: 260, protein: 5, fat: 15, carbs: 27, fiber: 2, portion: '100g' },
    'sashimi': { calories: 120, protein: 22, fat: 3, carbs: 2, portion: '100g' },
    'scallops': { calories: 110, protein: 20, fat: 1, carbs: 5, portion: '100g' },
    'seaweed salad': { calories: 60, protein: 2, fat: 3, carbs: 7, fiber: 3, portion: '100g' },
    'shrimp and grits': { calories: 170, protein: 12, fat: 8, carbs: 14, portion: '100g' },
    'spaghetti bolognese': { calories: 140, protein: 8, fat: 5, carbs: 17, portion: '100g' },
    'spaghetti carbonara': { calories: 220, protein: 10, fat: 12, carbs: 18, portion: '100g' },
    'spring rolls': { calories: 150, protein: 4, fat: 6, carbs: 20, fiber: 2, portion: '100g' },
    'steak': { calories: 270, protein: 25, fat: 18, carbs: 0, portion: '100g' },
    'strawberry shortcake': { calories: 250, protein: 4, fat: 12, carbs: 33, sugar: 20, portion: '100g' },
    'sushi': { calories: 140, protein: 6, fat: 3, carbs: 24, portion: '100g' },
    'tacos': { calories: 180, protein: 10, fat: 8, carbs: 18, fiber: 2, portion: '100g' },
    'takoyaki': { calories: 180, protein: 6, fat: 8, carbs: 21, portion: '100g' },
    'tiramisu': { calories: 320, protein: 6, fat: 18, carbs: 34, sugar: 24, portion: '100g' },
    'tuna tartare': { calories: 140, protein: 18, fat: 6, carbs: 3, portion: '100g' },
    'waffles': { calories: 280, protein: 6, fat: 12, carbs: 38, sugar: 8, portion: '100g' }
  };

  async loadModel() {
    try {
      console.log('Loading NutriNet model...');
      
      // Créer un modèle simple pour l'analyse nutritionnelle
      // Ce modèle pourrait être entraîné sur des données réelles
      this.model = tf.sequential({
        layers: [
          tf.layers.dense({ units: 128, activation: 'relu', inputShape: [100] }),
          tf.layers.dropout({ rate: 0.2 }),
          tf.layers.dense({ units: 64, activation: 'relu' }),
          tf.layers.dense({ units: 32, activation: 'relu' }),
          tf.layers.dense({ units: 5, activation: 'linear' }) // calories, protein, fat, carbs, fiber
        ]
      });
      
      this.model.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'meanSquaredError',
        metrics: ['accuracy']
      });

      console.log('✓ NutriNet model initialized');
      return true;
    } catch (error) {
      console.error('Failed to load NutriNet:', error);
      return false;
    }
  }

  getNutritionForFood(foodName: string): {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    fiber?: number;
    sugar?: number;
    portion: string;
  } | null {
    // Nettoyer le nom de l'aliment
    const cleanName = foodName.toLowerCase().trim();
    
    // Chercher une correspondance exacte
    if (this.nutritionDatabase[cleanName]) {
      return this.nutritionDatabase[cleanName];
    }

    // Chercher une correspondance partielle
    for (const [key, value] of Object.entries(this.nutritionDatabase)) {
      if (cleanName.includes(key) || key.includes(cleanName)) {
        return value;
      }
    }

    return null;
  }

  async estimateNutrition(foodName: string, detectedFeatures?: number[]): Promise<{
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    fiber?: number;
    sugar?: number;
  }> {
    // Vérifier d'abord la base de données
    const dbMatch = this.getNutritionForFood(foodName);
    if (dbMatch) {
      return dbMatch;
    }

    // Sinon, utiliser le modèle pour estimer
    if (this.model && detectedFeatures) {
      const input = tf.tensor2d([detectedFeatures]);
      const prediction = this.model.predict(input) as tf.Tensor;
      const values = await prediction.data();
      
      input.dispose();
      prediction.dispose();

      return {
        calories: Math.round(values[0] * 100),
        protein: Math.round(values[1] * 10) / 10,
        fat: Math.round(values[2] * 10) / 10,
        carbs: Math.round(values[3] * 10) / 10,
        fiber: Math.round(values[4] * 10) / 10,
      };
    }

    // Estimation par défaut basée sur le type de nourriture
    if (foodName.includes('salad')) {
      return { calories: 120, protein: 4, fat: 8, carbs: 10, fiber: 3 };
    } else if (foodName.includes('soup')) {
      return { calories: 75, protein: 3, fat: 2, carbs: 10, fiber: 2 };
    } else if (foodName.includes('sandwich') || foodName.includes('burger')) {
      return { calories: 250, protein: 12, fat: 10, carbs: 28, fiber: 2 };
    } else if (foodName.includes('rice') || foodName.includes('pasta')) {
      return { calories: 130, protein: 4, fat: 1, carbs: 28, fiber: 1 };
    } else {
      return { calories: 150, protein: 6, fat: 6, carbs: 18, fiber: 2 };
    }
  }
}