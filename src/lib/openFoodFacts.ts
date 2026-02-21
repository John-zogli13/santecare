// Client API pour Open Food Facts
export interface OpenFoodProduct {
  code: string;
  product_name: string;
  brands: string;
  quantity: string;
  nutriments: {
    energy_kcal_100g?: number;
    proteins_100g?: number;
    fat_100g?: number;
    carbohydrates_100g?: number;
    fiber_100g?: number;
    sugars_100g?: number;
    salt_100g?: number;
  };
  nutriscore_grade?: string;
  image_url?: string;
}

export interface SearchResult {
  code: string;
  product_name: string;
  brands: string;
  quantity: string;
  image_url?: string;
}

// Recherche par code-barres
export async function fetchProductByBarcode(barcode: string): Promise<OpenFoodProduct | null> {
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
    const data = await response.json();
    
    if (data.status === 1 && data.product) {
      return {
        code: data.code,
        product_name: data.product.product_name || "Produit inconnu",
        brands: data.product.brands || "",
        quantity: data.product.quantity || "100g",
        nutriments: {
          energy_kcal_100g: data.product.nutriments?.["energy-kcal_100g"],
          proteins_100g: data.product.nutriments?.proteins_100g,
          fat_100g: data.product.nutriments?.fat_100g,
          carbohydrates_100g: data.product.nutriments?.carbohydrates_100g,
          fiber_100g: data.product.nutriments?.fiber_100g,
          sugars_100g: data.product.nutriments?.sugars_100g,
          salt_100g: data.product.nutriments?.salt_100g,
        },
        nutriscore_grade: data.product.nutriscore_grade,
        image_url: data.product.image_url,
      };
    }
    return null;
  } catch (error) {
    console.error("Erreur lors de la récupération du produit:", error);
    return null;
  }
}

// Recherche textuelle (complémentaire)
export async function searchProducts(query: string, page = 1): Promise<SearchResult[]> {
  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&page_size=20&page=${page}&json=1`
    );
    const data = await response.json();
    
    return data.products.map((p: any) => ({
      code: p.code,
      product_name: p.product_name || "Produit sans nom",
      brands: p.brands || "",
      quantity: p.quantity || "100g",
      image_url: p.image_url,
    }));
  } catch (error) {
    console.error("Erreur lors de la recherche:", error);
    return [];
  }
}

// Convertir un produit Open Food Facts en FoodItem
export function toFoodItem(product: OpenFoodProduct): {
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  portion: string;
  brand?: string;
  nutriscore?: string;
} {
  // Valeurs par défaut si les données sont manquantes
  const defaultCalories = 100; // estimation prudente
  
  return {
    name: product.product_name,
    calories: Math.round(product.nutriments.energy_kcal_100g || defaultCalories),
    protein: Math.round((product.nutriments.proteins_100g || 5) * 10) / 10,
    fat: Math.round((product.nutriments.fat_100g || 5) * 10) / 10,
    carbs: Math.round((product.nutriments.carbohydrates_100g || 10) * 10) / 10,
    portion: `100${product.quantity?.includes('g') ? 'g' : 'ml'}`,
    brand: product.brands,
    nutriscore: product.nutriscore_grade,
  };
}