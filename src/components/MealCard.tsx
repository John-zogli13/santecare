import { motion } from "framer-motion";
import { Flame, Beef, Droplets, Wheat } from "lucide-react";

interface MealCardProps {
  name: string;
  description?: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  image?: string;
  isMain?: boolean;
  onPress?: () => void;
}

const MealCard = ({ 
  name, 
  description, 
  calories, 
  protein, 
  carbs, 
  fat, 
  image,
  isMain = false,
  onPress 
}: MealCardProps) => {
  if (isMain) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full h-64 rounded-3xl overflow-hidden mb-4"
      >
        {/* Image de fond */}
        <div className="absolute inset-0 bg-gradient-to-br from-food/80 to-food/30" />
        
        {/* Contenu */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h2 className="text-2xl font-bold mb-1">{name}</h2>
          {description && (
            <p className="text-white/90 text-sm mb-3">{description}</p>
          )}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Flame className="h-4 w-4" />
              <span className="font-semibold">{calories} kcal</span>
            </div>
            <button 
              onClick={onPress}
              className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium active:scale-95 transition-transform"
            >
              Analyser
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      onClick={onPress}
      className="bg-card rounded-2xl p-4 border border-border cursor-pointer"
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-card-foreground">{name}</h3>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        <span className="text-lg font-bold text-food">{calories} kcal</span>
      </div>

      {(protein || carbs || fat) && (
        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
          {protein && (
            <span className="flex items-center gap-1">
              <Beef className="h-3 w-3" /> {protein}g
            </span>
          )}
          {carbs && (
            <span className="flex items-center gap-1">
              <Wheat className="h-3 w-3" /> {carbs}g
            </span>
          )}
          {fat && (
            <span className="flex items-center gap-1">
              <Droplets className="h-3 w-3" /> {fat}g
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default MealCard;