export interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  portion: string;
  category: string;
}

export const foodDatabase: FoodItem[] = [
  // Fruits
  { name: "Pomme", calories: 52, protein: 0.3, fat: 0.2, carbs: 14, portion: "1 moyenne (180g)", category: "Fruits" },
  { name: "Banane", calories: 89, protein: 1.1, fat: 0.3, carbs: 23, portion: "1 moyenne (120g)", category: "Fruits" },
  { name: "Orange", calories: 47, protein: 0.9, fat: 0.1, carbs: 12, portion: "1 moyenne (150g)", category: "Fruits" },
  { name: "Fraise", calories: 33, protein: 0.7, fat: 0.3, carbs: 8, portion: "100g", category: "Fruits" },
  { name: "Raisin", calories: 69, protein: 0.7, fat: 0.2, carbs: 18, portion: "100g", category: "Fruits" },
  { name: "Poire", calories: 57, protein: 0.4, fat: 0.1, carbs: 15, portion: "1 moyenne (170g)", category: "Fruits" },
  { name: "Kiwi", calories: 61, protein: 1.1, fat: 0.5, carbs: 15, portion: "1 moyen (75g)", category: "Fruits" },
  { name: "Mangue", calories: 60, protein: 0.8, fat: 0.4, carbs: 15, portion: "100g", category: "Fruits" },

  // Légumes
  { name: "Carotte", calories: 41, protein: 0.9, fat: 0.2, carbs: 10, portion: "1 moyenne (80g)", category: "Légumes" },
  { name: "Tomate", calories: 18, protein: 0.9, fat: 0.2, carbs: 3.9, portion: "1 moyenne (120g)", category: "Légumes" },
  { name: "Brocoli", calories: 34, protein: 2.8, fat: 0.4, carbs: 7, portion: "100g", category: "Légumes" },
  { name: "Épinards", calories: 23, protein: 2.9, fat: 0.4, carbs: 3.6, portion: "100g", category: "Légumes" },
  { name: "Courgette", calories: 17, protein: 1.2, fat: 0.3, carbs: 3.1, portion: "100g", category: "Légumes" },
  { name: "Haricots verts", calories: 31, protein: 1.8, fat: 0.1, carbs: 7, portion: "100g", category: "Légumes" },
  { name: "Salade verte", calories: 15, protein: 1.4, fat: 0.2, carbs: 2.9, portion: "100g", category: "Légumes" },
  { name: "Concombre", calories: 15, protein: 0.7, fat: 0.1, carbs: 3.6, portion: "100g", category: "Légumes" },

  // Protéines
  { name: "Poulet (blanc)", calories: 165, protein: 31, fat: 3.6, carbs: 0, portion: "100g", category: "Protéines" },
  { name: "Bœuf (steak)", calories: 250, protein: 26, fat: 15, carbs: 0, portion: "100g", category: "Protéines" },
  { name: "Saumon", calories: 208, protein: 20, fat: 13, carbs: 0, portion: "100g", category: "Protéines" },
  { name: "Thon", calories: 130, protein: 29, fat: 0.6, carbs: 0, portion: "100g", category: "Protéines" },
  { name: "Œuf", calories: 155, protein: 13, fat: 11, carbs: 1.1, portion: "1 gros (60g)", category: "Protéines" },
  { name: "Tofu", calories: 76, protein: 8, fat: 4.8, carbs: 1.9, portion: "100g", category: "Protéines" },
  { name: "Crevettes", calories: 99, protein: 24, fat: 0.3, carbs: 0.2, portion: "100g", category: "Protéines" },
  { name: "Dinde", calories: 135, protein: 30, fat: 1, carbs: 0, portion: "100g", category: "Protéines" },

  // Féculents
  { name: "Riz blanc (cuit)", calories: 130, protein: 2.7, fat: 0.3, carbs: 28, portion: "100g", category: "Féculents" },
  { name: "Riz complet (cuit)", calories: 123, protein: 2.7, fat: 1, carbs: 26, portion: "100g", category: "Féculents" },
  { name: "Pâtes (cuites)", calories: 131, protein: 5, fat: 1.1, carbs: 25, portion: "100g", category: "Féculents" },
  { name: "Pain blanc", calories: 265, protein: 9, fat: 3.2, carbs: 49, portion: "1 tranche (30g)", category: "Féculents" },
  { name: "Pain complet", calories: 247, protein: 13, fat: 3.4, carbs: 41, portion: "1 tranche (30g)", category: "Féculents" },
  { name: "Pomme de terre", calories: 77, protein: 2, fat: 0.1, carbs: 17, portion: "1 moyenne (150g)", category: "Féculents" },
  { name: "Quinoa (cuit)", calories: 120, protein: 4.4, fat: 1.9, carbs: 21, portion: "100g", category: "Féculents" },
  { name: "Avoine", calories: 389, protein: 17, fat: 6.9, carbs: 66, portion: "100g", category: "Féculents" },

  // Produits laitiers
  { name: "Lait entier", calories: 61, protein: 3.2, fat: 3.3, carbs: 4.8, portion: "100ml", category: "Produits laitiers" },
  { name: "Yaourt nature", calories: 59, protein: 10, fat: 0.7, carbs: 3.6, portion: "1 pot (125g)", category: "Produits laitiers" },
  { name: "Fromage (emmental)", calories: 380, protein: 27, fat: 29, carbs: 0.4, portion: "30g", category: "Produits laitiers" },
  { name: "Fromage blanc", calories: 47, protein: 8, fat: 0.2, carbs: 3.8, portion: "100g", category: "Produits laitiers" },

  // Légumineuses
  { name: "Lentilles (cuites)", calories: 116, protein: 9, fat: 0.4, carbs: 20, portion: "100g", category: "Légumineuses" },
  { name: "Pois chiches (cuits)", calories: 164, protein: 8.9, fat: 2.6, carbs: 27, portion: "100g", category: "Légumineuses" },
  { name: "Haricots rouges (cuits)", calories: 127, protein: 8.7, fat: 0.5, carbs: 22, portion: "100g", category: "Légumineuses" },

  // Noix & graines
  { name: "Amandes", calories: 579, protein: 21, fat: 50, carbs: 22, portion: "30g", category: "Noix" },
  { name: "Noix", calories: 654, protein: 15, fat: 65, carbs: 14, portion: "30g", category: "Noix" },
  { name: "Graines de chia", calories: 486, protein: 17, fat: 31, carbs: 42, portion: "15g", category: "Noix" },

  // Boissons
  { name: "Café noir", calories: 2, protein: 0.3, fat: 0, carbs: 0, portion: "1 tasse (240ml)", category: "Boissons" },
  { name: "Thé vert", calories: 1, protein: 0, fat: 0, carbs: 0.2, portion: "1 tasse (240ml)", category: "Boissons" },
  { name: "Jus d'orange", calories: 45, protein: 0.7, fat: 0.2, carbs: 10, portion: "200ml", category: "Boissons" },

  // Snacks/Autres
  { name: "Chocolat noir (70%)", calories: 598, protein: 7.8, fat: 43, carbs: 46, portion: "30g", category: "Autres" },
  { name: "Miel", calories: 304, protein: 0.3, fat: 0, carbs: 82, portion: "1 c. soupe (20g)", category: "Autres" },
  { name: "Huile d'olive", calories: 884, protein: 0, fat: 100, carbs: 0, portion: "1 c. soupe (15ml)", category: "Autres" },
  { name: "Beurre", calories: 717, protein: 0.9, fat: 81, carbs: 0.1, portion: "10g", category: "Autres" },
  { name: "Avocat", calories: 160, protein: 2, fat: 15, carbs: 9, portion: "1/2 (80g)", category: "Fruits" },
  { name: "Fromage de chèvre", calories: 364, protein: 22, fat: 30, carbs: 0.1, portion: "30g", category: "Produits laitiers" },
];

export function searchFood(query: string): FoodItem[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return foodDatabase.filter(f => f.name.toLowerCase().includes(q));
}

export function getFoodByCategory(category: string): FoodItem[] {
  return foodDatabase.filter(f => f.category === category);
}

export function getCategories(): string[] {
  return [...new Set(foodDatabase.map(f => f.category))];
}
