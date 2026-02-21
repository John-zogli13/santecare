import * as tf from '@tensorflow/tfjs';
import { SimpleFoodClassifier } from './foodClassifierSimple'; // Changement ici
import { NutriNet } from './nutrinetModel';
import { createWorker } from 'tesseract.js';

export interface DetectedFood {
  name: string;
  confidence: number;
  nutritionalInfo: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    fiber?: number;
    sugar?: number;
    portion?: string;
  };
}

export interface AnalysisResult {
  foods: DetectedFood[];
  totalNutrition: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    fiber: number;
    sugar: number;
  };
  confidence: number;
  source: 'image' | 'barcode';
}

export class AIFoodAnalyzer {
  private foodClassifier: SimpleFoodClassifier; // Changement ici
  private nutrinet: NutriNet;
  private ocrWorker: any = null;
  private isInitialized = false;

  constructor() {
    this.foodClassifier = new SimpleFoodClassifier(); // Changement ici
    this.nutrinet = new NutriNet();
  }

  async initialize() {
    if (this.isInitialized) return;

    console.log('🚀 Initializing AI Food Analyzer...');
    
    // Initialiser TensorFlow.js
    await tf.ready();
    console.log('✓ TensorFlow.js ready');

    // Charger les modèles
    await this.foodClassifier.loadModel();
    await this.nutrinet.loadModel();

    // Initialiser Tesseract pour l'OCR (optionnel)
    try {
      this.ocrWorker = await createWorker('eng+fra');
      console.log('✓ OCR worker initialized');
    } catch (error) {
      console.log('OCR non disponible, continuation sans OCR');
    }

    this.isInitialized = true;
    console.log('✅ AI Food Analyzer ready!');
  }

  async analyzeImage(imageFile: File): Promise<AnalysisResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Créer une image HTML à partir du fichier
    const imageUrl = URL.createObjectURL(imageFile);
    const image = new Image();
    
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
      image.src = imageUrl;
    });

    // 1. Classification avec MobileNet
    console.log('📸 Classifying image...');
    const classifications = await this.foodClassifier.classify(image);
    console.log('Classifications:', classifications);

    // 2. OCR pour lire les étiquettes (si disponible)
    let ocrText = '';
    if (this.ocrWorker) {
      try {
        const { data: { text } } = await this.ocrWorker.recognize(imageFile);
        ocrText = text;
        console.log('OCR text:', text);
      } catch (error) {
        console.log('OCR failed');
      }
    }

    // 3. Enrichir avec les données nutritionnelles
    const detectedFoods: DetectedFood[] = [];

    for (const cls of classifications) {
      const nutritionInfo = await this.nutrinet.estimateNutrition(cls.className);
      
      detectedFoods.push({
        name: cls.className,
        confidence: cls.probability,
        nutritionalInfo: {
          calories: nutritionInfo.calories,
          protein: nutritionInfo.protein,
          fat: nutritionInfo.fat,
          carbs: nutritionInfo.carbs,
          fiber: nutritionInfo.fiber,
          sugar: nutritionInfo.sugar,
          portion: '100g'
        }
      });
    }

    // 4. Extraire les infos nutritionnelles du texte OCR
    if (ocrText) {
      const ocrNutrition = this.extractNutritionFromOCR(ocrText);
      if (ocrNutrition && detectedFoods.length > 0) {
        detectedFoods[0].nutritionalInfo = {
          ...detectedFoods[0].nutritionalInfo,
          ...ocrNutrition
        };
      }
    }

    // 5. Calculer la nutrition totale
    const totalNutrition = this.calculateTotalNutrition(detectedFoods);

    // Nettoyer
    URL.revokeObjectURL(imageUrl);

    return {
      foods: detectedFoods,
      totalNutrition,
      confidence: detectedFoods.length > 0 
        ? detectedFoods.reduce((acc, f) => acc + f.confidence, 0) / detectedFoods.length
        : 0,
      source: 'image'
    };
  }

  async analyzeBarcode(barcode: string): Promise<AnalysisResult> {
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
      const data = await response.json();

      if (data.status === 1 && data.product) {
        const product = data.product;
        
        const nutritionalInfo = {
          calories: product.nutriments?.['energy-kcal_100g'] || 0,
          protein: product.nutriments?.proteins_100g || 0,
          fat: product.nutriments?.fat_100g || 0,
          carbs: product.nutriments?.carbohydrates_100g || 0,
          fiber: product.nutriments?.fiber_100g,
          sugar: product.nutriments?.sugars_100g,
          portion: product.serving_size || '100g'
        };

        const detectedFood: DetectedFood = {
          name: product.product_name || 'Unknown product',
          confidence: 1.0,
          nutritionalInfo
        };

        return {
          foods: [detectedFood],
          totalNutrition: {
            calories: nutritionalInfo.calories,
            protein: nutritionalInfo.protein,
            fat: nutritionalInfo.fat,
            carbs: nutritionalInfo.carbs,
            fiber: nutritionalInfo.fiber || 0,
            sugar: nutritionalInfo.sugar || 0
          },
          confidence: 1.0,
          source: 'barcode'
        };
      }
    } catch (error) {
      console.error('Barcode analysis error:', error);
    }

    throw new Error('Product not found');
  }

  private extractNutritionFromOCR(text: string): Partial<DetectedFood['nutritionalInfo']> | null {
    const result: Partial<DetectedFood['nutritionalInfo']> = {};
    
    const patterns = {
      calories: /(\d+)\s*kcal/i,
      protein: /protéines?\s*[:\s]+(\d+)[,\s]*g/i,
      fat: /(lipides|matières?\s*grasses?)\s*[:\s]+(\d+)[,\s]*g/i,
      carbs: /(glucides|carbohydrates)\s*[:\s]+(\d+)[,\s]*g/i,
      fiber: /(fibres?|fiber)\s*[:\s]+(\d+)[,\s]*g/i,
      sugar: /(sucres?|sugar)\s*[:\s]+(\d+)[,\s]*g/i,
    };

    for (const [key, pattern] of Object.entries(patterns)) {
      const match = text.match(pattern);
      if (match) {
        result[key as keyof typeof result] = parseInt(match[1], 10);
      }
    }

    return Object.keys(result).length > 0 ? result : null;
  }

  private calculateTotalNutrition(foods: DetectedFood[]): AnalysisResult['totalNutrition'] {
    const total = {
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
      fiber: 0,
      sugar: 0
    };

    for (const food of foods) {
      total.calories += food.nutritionalInfo.calories || 0;
      total.protein += food.nutritionalInfo.protein || 0;
      total.fat += food.nutritionalInfo.fat || 0;
      total.carbs += food.nutritionalInfo.carbs || 0;
      total.fiber += food.nutritionalInfo.fiber || 0;
      total.sugar += food.nutritionalInfo.sugar || 0;
    }

    return total;
  }

  async dispose() {
    if (this.ocrWorker) {
      await this.ocrWorker.terminate();
    }
  }
}

// Singleton
let analyzerInstance: AIFoodAnalyzer | null = null;

export async function getAIFoodAnalyzer(): Promise<AIFoodAnalyzer> {
  if (!analyzerInstance) {
    analyzerInstance = new AIFoodAnalyzer();
    await analyzerInstance.initialize();
  }
  return analyzerInstance;
}