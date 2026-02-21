import { useState, useMemo, useEffect } from "react";
import PageShell from "@/components/PageShell";
import { searchFood, getCategories, getFoodByCategory, type FoodItem } from "@/lib/foodDatabase";
import { saveFoodEntry, getTodayFoodEntries, getToday, type FoodEntry } from "@/lib/storage";
import {
  UtensilsCrossed, Search, Plus, Minus, Trash2, ChevronDown, ChevronUp,
  Flame, Beef, Droplets, Wheat, Camera, Barcode, ScanLine, X, Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BarcodeScanner from "@/components/BarcodeScanner";
import CameraCapture from "@/components/CameraCapture";
import { fetchProductByBarcode, toFoodItem } from "@/lib/openFoodFacts";
import { getAIFoodAnalyzer } from "@/lib/aiFoodAnalyzer";
import { toast } from "sonner";

interface AIAnalysisResult {
  name: string; calories: number; protein: number;
  fat: number; carbs: number; portion: string; confidence: number;
}

// ─── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  card:   "rgba(255,255,255,0.035)",
  border: "rgba(255,255,255,0.07)",
  muted:  "#475569",
  dimmed: "#334155",
  text:   "#ffffff",
  green:  "#22c55e",
  red:    "#ef4444",
  amber:  "#f59e0b",
  cyan:   "#22d3ee",
  purple: "#a855f7",
};

// ─── Macro circle ──────────────────────────────────────────────────────────────
const MacroCircle = ({ value, max, label, unit, color, icon: Icon, size = 76 }: {
  value: number; max: number; label: string; unit: string; color: string; icon: any; size?: number;
}) => {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / Math.max(max, 1), 1);
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
      <div style={{ position:"relative", width:size, height:size }}>
        <svg width={size} height={size} style={{ position:"absolute", inset:0, transform:"rotate(-90deg)" }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6}/>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6}
            strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ*(1-pct)}
            style={{ transition:"stroke-dashoffset 0.8s cubic-bezier(0.34,1.56,0.64,1)", filter:`drop-shadow(0 0 6px ${color}88)` }}/>
        </svg>
        <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
          <Icon size={11} style={{ color, marginBottom:1 }}/>
          <span style={{ fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:800, color:T.text, lineHeight:1 }}>{Math.round(value)}</span>
          <span style={{ fontSize:9, color:T.muted, lineHeight:1 }}>{unit}</span>
        </div>
      </div>
      <span style={{ fontSize:10, fontWeight:600, color:T.muted, textTransform:"uppercase" as const, letterSpacing:"0.07em" }}>{label}</span>
    </div>
  );
};

// ─── Health score ──────────────────────────────────────────────────────────────
const HealthScore = ({ score }: { score: number }) => {
  const c = score >= 7 ? T.green : score >= 4 ? T.amber : T.red;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
      <span style={{ fontSize:11, color:T.muted, whiteSpace:"nowrap" }}>Score santé</span>
      <div style={{ flex:1, height:5, borderRadius:3, background:"rgba(255,255,255,0.06)", overflow:"hidden" }}>
        <motion.div initial={{ width:0 }} animate={{ width:`${score*10}%` }} transition={{ duration:0.9, ease:"easeOut" }}
          style={{ height:"100%", borderRadius:3, background:`linear-gradient(90deg,${c}88,${c})`, boxShadow:`0 0 12px ${c}66` }}/>
      </div>
      <span style={{ fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:800, color:c, minWidth:36, textAlign:"right" as const }}>{score}/10</span>
    </div>
  );
};

// ─── Food result card ──────────────────────────────────────────────────────────
const FoodResultCard = ({ food, onAdd, isScanResult = false, confidence }: {
  food: FoodItem; onAdd: (food: FoodItem, qty: number) => void; isScanResult?: boolean; confidence?: number;
}) => {
  const [qty, setQty] = useState(1);
  return (
    <motion.div initial={{ y:10, opacity:0 }} animate={{ y:0, opacity:1 }}
      style={{ borderRadius:16, overflow:"hidden", background:isScanResult?"rgba(34,197,94,0.05)":T.card, border:`1px solid ${isScanResult?"rgba(34,197,94,0.3)":T.border}` }}>
      {isScanResult && (
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"7px 14px", background:"rgba(34,197,94,0.08)", borderBottom:"1px solid rgba(34,197,94,0.15)" }}>
          <span style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:T.green, fontWeight:600 }}>
            <ScanLine size={11}/> Résultat IA
          </span>
          {confidence && (
            <span style={{ fontSize:10, color:T.green, background:"rgba(34,197,94,0.12)", padding:"2px 8px", borderRadius:100, border:"1px solid rgba(34,197,94,0.2)" }}>
              {Math.round(confidence*100)}% confiance
            </span>
          )}
        </div>
      )}
      <div style={{ padding:"14px 16px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:700, color:T.text }}>{food.name}</div>
            <div style={{ fontSize:11, color:T.dimmed, marginTop:2 }}>{food.portion}</div>
          </div>
          <div style={{ textAlign:"right" as const }}>
            <span style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, color:T.green }}>{Math.round(food.calories*qty)}</span>
            <span style={{ fontSize:11, color:T.muted, marginLeft:2 }}>kcal</span>
          </div>
        </div>
        <div style={{ display:"flex", gap:8, marginBottom:14 }}>
          {([
            { label:`${(food.protein*qty).toFixed(1)}g`, tag:"P", color:T.red,   Icon:Beef     },
            { label:`${(food.fat*qty).toFixed(1)}g`,     tag:"L", color:T.amber, Icon:Droplets },
            { label:`${(food.carbs*qty).toFixed(1)}g`,   tag:"G", color:T.cyan,  Icon:Wheat    },
          ] as const).map(({ label, tag, color, Icon }) => (
            <div key={tag} style={{ display:"flex", alignItems:"center", gap:5, padding:"4px 10px", borderRadius:100, background:`${color}12`, border:`1px solid ${color}25`, fontSize:11, color }}>
              <Icon size={11}/>{label}
            </div>
          ))}
        </div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:4, background:"rgba(255,255,255,0.05)", borderRadius:100, padding:4, border:`1px solid ${T.border}` }}>
            <button onClick={()=>setQty(Math.max(1,qty-1))} style={{ width:30, height:30, borderRadius:"50%", border:"none", background:"rgba(255,255,255,0.06)", color:"#94a3b8", display:"grid", placeItems:"center", cursor:"pointer" }}><Minus size={12}/></button>
            <span style={{ fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:700, color:T.text, width:24, textAlign:"center" as const }}>{qty}</span>
            <button onClick={()=>setQty(qty+1)} style={{ width:30, height:30, borderRadius:"50%", border:"none", background:"rgba(255,255,255,0.06)", color:"#94a3b8", display:"grid", placeItems:"center", cursor:"pointer" }}><Plus size={12}/></button>
          </div>
          <button onClick={()=>{ onAdd(food,qty); setQty(1); }}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"10px 18px", borderRadius:100, border:"none", background:`linear-gradient(135deg,#16a34a,${T.green})`, color:"white", fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:700, cursor:"pointer", boxShadow:"0 4px 20px rgba(34,197,94,0.3)" }}>
            <Plus size={14}/> Ajouter
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Diary item ────────────────────────────────────────────────────────────────
const DiaryItem = ({ entry, onDelete }: { entry: FoodEntry; onDelete: () => void }) => (
  <motion.div layout initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:10 }}
    style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 14px", borderRadius:12, background:"rgba(255,255,255,0.025)", border:`1px solid ${T.border}` }}>
    <div style={{ width:7, height:7, borderRadius:"50%", flexShrink:0, background:T.green, boxShadow:"0 0 8px rgba(34,197,94,0.5)" }}/>
    <div style={{ flex:1, minWidth:0 }}>
      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:600, color:T.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{entry.name}</div>
      <div style={{ fontSize:11, color:T.dimmed, marginTop:1 }}>{entry.time} · {entry.portion}</div>
    </div>
    <div style={{ textAlign:"right" as const, flexShrink:0 }}>
      <span style={{ fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:700, color:T.green }}>{entry.calories}</span>
      <span style={{ fontSize:10, color:T.muted, marginLeft:2 }}>kcal</span>
      <div style={{ fontSize:10, color:T.dimmed, marginTop:1 }}>P{entry.protein}g · L{entry.fat}g · G{entry.carbs}g</div>
    </div>
    <button onClick={onDelete} style={{ background:"none", border:"none", color:T.dimmed, cursor:"pointer", padding:4, borderRadius:6, display:"grid", placeItems:"center", transition:"color 0.15s" }}
      onMouseEnter={e=>(e.currentTarget.style.color=T.red)} onMouseLeave={e=>(e.currentTarget.style.color=T.dimmed)}>
      <Trash2 size={14}/>
    </button>
  </motion.div>
);

// ─── Loading overlay ───────────────────────────────────────────────────────────
const LoadingOverlay = ({ message = "Analyse en cours..." }: { message?: string }) => (
  <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
    style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(12px)", display:"flex", alignItems:"center", justifyContent:"center" }}>
    <div style={{ background:"rgba(15,20,30,0.96)", border:"1px solid rgba(34,197,94,0.2)", borderRadius:20, padding:"36px 32px", display:"flex", flexDirection:"column", alignItems:"center", gap:16, boxShadow:"0 0 60px rgba(34,197,94,0.12)" }}>
      <div style={{ position:"relative" }}>
        <Loader2 size={48} style={{ color:T.green, animation:"spin 0.8s linear infinite" }}/>
        <div style={{ position:"absolute", inset:0, borderRadius:"50%", background:"radial-gradient(circle,rgba(34,197,94,0.15),transparent)", animation:"ping 1.5s ease infinite" }}/>
      </div>
      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:700, color:T.text, textAlign:"center" as const }}>{message}</div>
      <div style={{ fontSize:12, color:T.muted }}>Veuillez patienter…</div>
    </div>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes ping{0%{opacity:1;transform:scale(0.9)}100%{opacity:0;transform:scale(1.6)}}`}</style>
  </motion.div>
);

// ─── Multiple results selector ─────────────────────────────────────────────────
const MultipleResultsSelector = ({ results, onSelect, onClose }: {
  results: AIAnalysisResult[]; onSelect: (f: AIAnalysisResult) => void; onClose: () => void;
}) => (
  <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
    style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(12px)", display:"flex", alignItems:"flex-end", justifyContent:"center" }}
    onClick={onClose}>
    <motion.div initial={{ y:100 }} animate={{ y:0 }} exit={{ y:100 }}
      style={{ background:"rgba(12,18,28,0.98)", borderTop:"1px solid rgba(255,255,255,0.08)", borderRadius:"24px 24px 0 0", width:"100%", maxWidth:480, padding:24, maxHeight:"80vh", overflowY:"auto" }}
      onClick={e=>e.stopPropagation()}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
        <span style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:800, color:T.text }}>Sélectionnez l'aliment</span>
        <button onClick={onClose} style={{ background:"none", border:"none", color:T.muted, cursor:"pointer" }}><X size={20}/></button>
      </div>
      <p style={{ fontSize:13, color:T.muted, marginBottom:16 }}>Notre IA a détecté plusieurs possibilités :</p>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {results.map((r,i) => (
          <button key={i} onClick={()=>onSelect(r)}
            style={{ width:"100%", textAlign:"left" as const, padding:"14px 16px", borderRadius:14, background:T.card, border:`1px solid ${T.border}`, cursor:"pointer", transition:"all 0.2s" }}
            onMouseEnter={e=>{ e.currentTarget.style.background="rgba(34,197,94,0.06)"; e.currentTarget.style.borderColor="rgba(34,197,94,0.25)"; }}
            onMouseLeave={e=>{ e.currentTarget.style.background=T.card; e.currentTarget.style.borderColor=T.border; }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:700, color:T.text }}>{r.name}</div>
                <div style={{ fontSize:11, color:T.muted, marginTop:2 }}>{Math.round(r.confidence*100)}% de confiance</div>
              </div>
              <div style={{ textAlign:"right" as const }}>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:800, color:T.green }}>{r.calories} kcal</div>
                <div style={{ fontSize:10, color:T.dimmed }}>P{r.protein} · L{r.fat} · G{r.carbs}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  </motion.div>
);

// ─── Main page ─────────────────────────────────────────────────────────────────
const FoodPage = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string|null>(null);
  const [diaryOpen, setDiaryOpen] = useState(true);
  const [, forceUpdate] = useState(0);
  const [scanMode, setScanMode] = useState<"none"|"barcode"|"camera">("none");
  const [scanning, setScanning] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [scanError, setScanError] = useState<string|null>(null);
  const [scanResults, setScanResults] = useState<FoodItem[]>([]);
  const [multipleResults, setMultipleResults] = useState<AIAnalysisResult[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(()=>{ setTimeout(()=>setMounted(true),50); },[]);

  const todayEntries = getTodayFoodEntries();
  const categories = getCategories();
  const targets = { calories:2000, protein:120, fat:70, carbs:250 };

  const totals = useMemo(()=>({
    calories: todayEntries.reduce((s,e)=>s+e.calories,0),
    protein:  todayEntries.reduce((s,e)=>s+e.protein,0),
    fat:      todayEntries.reduce((s,e)=>s+e.fat,0),
    carbs:    todayEntries.reduce((s,e)=>s+e.carbs,0),
  }),[todayEntries]);

  const healthScore = useMemo(()=>{
    if(!todayEntries.length) return 0;
    let s=5;
    const cp=totals.calories/targets.calories;
    if(cp>=0.8&&cp<=1.1) s+=2; else if(cp>1.3) s-=2;
    if(totals.protein/targets.protein>=0.8) s+=1.5;
    if(totals.fat/targets.fat<=1.1) s+=1;
    if(todayEntries.length>=3) s+=0.5;
    return Math.max(0,Math.min(10,Math.round(s)));
  },[totals,todayEntries.length]);

  const handleSearch = (q:string) => {
    setQuery(q); setSelectedCategory(null); setScanResults([]);
    setResults(q.length>=2 ? searchFood(q) : []);
  };

  const handleCategory = (cat:string) => {
    setSelectedCategory(cat===selectedCategory?null:cat);
    setQuery(""); setScanResults([]);
    setResults(cat===selectedCategory ? [] : getFoodByCategory(cat));
  };

  const handleBarcodeScan = async (barcode:string) => {
    setScanning(true); setScanError(null);
    try {
      const product = await fetchProductByBarcode(barcode);
      setScanMode("none");
      if(product){
        const fi=toFoodItem(product);
        setScanResults([{ name:fi.name, calories:fi.calories, protein:fi.protein, fat:fi.fat, carbs:fi.carbs, portion:fi.portion, category:"scanné", tags:product.brand?[product.brand]:[] }]);
        toast.success(`${fi.name} scanné avec succès !`);
      } else { setScanError("Produit non trouvé dans la base de données"); toast.error("Produit non trouvé"); }
    } catch { setScanError("Erreur lors de la recherche du produit"); toast.error("Erreur lors du scan"); }
    finally { setScanning(false); }
  };

  const handleCameraCapture = async (imageFile:File) => {
    setAnalyzing(true); setScanning(true); setScanError(null);
    try {
      const analyzer = await getAIFoodAnalyzer();
      const result = await analyzer.analyzeImage(imageFile);
      setScanMode("none");
      if(!result.foods.length){ toast.info("Aucun aliment détecté. Veuillez réessayer."); }
      else if(result.foods.length===1){
        const f=result.foods[0];
        setScanResults([{ name:f.name, calories:f.nutritionalInfo.calories, protein:f.nutritionalInfo.protein, fat:f.nutritionalInfo.fat, carbs:f.nutritionalInfo.carbs, portion:f.nutritionalInfo.portion||'100g', category:"ia-detection", tags:[`confiance-${Math.round(f.confidence*100)}%`] }]);
        toast.success(`${f.name} détecté !`,{ description:`Confiance: ${Math.round(f.confidence*100)}%` });
      } else {
        setMultipleResults(result.foods.map(f=>({ name:f.name, calories:f.nutritionalInfo.calories, protein:f.nutritionalInfo.protein, fat:f.nutritionalInfo.fat, carbs:f.nutritionalInfo.carbs, portion:f.nutritionalInfo.portion||'100g', confidence:f.confidence })));
        toast.success(`${result.foods.length} aliments détectés`,{ description:`Total: ${result.totalNutrition.calories} kcal` });
      }
    } catch { setScanError("Erreur lors de l'analyse de l'image"); toast.error("Erreur lors de l'analyse"); }
    finally { setAnalyzing(false); setScanning(false); }
  };

  const handleSelectFromMultiple = (sel:AIAnalysisResult) => {
    setScanResults([{ name:sel.name, calories:sel.calories, protein:sel.protein, fat:sel.fat, carbs:sel.carbs, portion:sel.portion, category:"ia-detection", tags:[`confiance-${Math.round(sel.confidence*100)}%`] }]);
    setMultipleResults([]); toast.success(`${sel.name} sélectionné`);
  };

  const addFood = (food:FoodItem, qty:number) => {
    saveFoodEntry({
      date:getToday(),
      time:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}),
      name:food.name+(qty>1?` ×${qty}`:""),
      calories:Math.round(food.calories*qty),
      protein:Math.round(food.protein*qty*10)/10,
      fat:Math.round(food.fat*qty*10)/10,
      carbs:Math.round(food.carbs*qty*10)/10,
      portion:food.portion,
    });
    setScanResults([]); setMultipleResults([]); setQuery(""); setResults([]); setSelectedCategory(null);
    forceUpdate(n=>n+1); toast.success("Aliment ajouté au journal");
  };

  const deleteEntry = (index:number) => {
    const all=JSON.parse(localStorage.getItem("health_food")||"[]") as FoodEntry[];
    const today=getToday();
    const idxs=all.map((e,i)=>e.date===today?i:-1).filter(i=>i>=0);
    if(idxs[index]!==undefined){ all.splice(idxs[index],1); localStorage.setItem("health_food",JSON.stringify(all)); forceUpdate(n=>n+1); toast.success("Aliment retiré du journal"); }
  };

  const calPct = Math.min(totals.calories/targets.calories,1);
  const calColor = calPct>1.1?T.red:calPct>=0.8?T.green:T.amber;

  const fade = (delay=0) => ({
    opacity:mounted?1:0, transform:mounted?"translateY(0)":"translateY(20px)",
    transition:`opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
  });

  return (
    <PageShell title="Nutrition" icon={<UtensilsCrossed className="h-5 w-5 text-food"/>}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap');
        html, body, #__next, #root { background: #000000 !important; color: #ffffff !important; }
        .food-input{width:100%;padding:13px 13px 13px 44px;border-radius:14px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.04);color:#ffffff;font-family:'DM Sans',sans-serif;font-size:14px;outline:none;transition:border-color .2s,box-shadow .2s;}
        .food-input::placeholder{color:#334155;}
        .food-input:focus{border-color:rgba(34,197,94,.3);box-shadow:0 0 0 3px rgba(34,197,94,.08);}
        .cats{display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;scrollbar-width:none;}
        .cats::-webkit-scrollbar{display:none;}
        .cpill{white-space:nowrap;padding:7px 14px;border-radius:100px;border:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.03);color:#94a3b8;font-size:12px;font-weight:500;cursor:pointer;flex-shrink:0;transition:all .2s cubic-bezier(.34,1.56,.64,1);}
        .cpill.on{background:rgba(34,197,94,.15);border-color:rgba(34,197,94,.4);color:#22c55e;transform:scale(1.04);box-shadow:0 0 16px rgba(34,197,94,.12);}
        .sbtn{flex:1;display:flex;flex-direction:column;align-items:center;gap:8px;padding:16px 12px;border-radius:16px;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.07);cursor:pointer;transition:all .2s;}
        .sbtn:hover{transform:translateY(-2px);}
        .dtoggle{width:100%;display:flex;align-items:center;justify-content:space-between;padding:15px 18px;background:none;border:none;cursor:pointer;transition:background .15s;border-radius:18px 18px 0 0;}
        .dtoggle:hover{background:rgba(255,255,255,.02);}
        .trow{display:flex;align-items:flex-start;gap:10px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.04);font-size:12px;color:#94a3b8;line-height:1.5;}
        .trow:last-child{border-bottom:none;}
      `}</style>

      <div style={{ display:"flex", flexDirection:"column", gap:14, paddingBottom:8, background:"#000000", minHeight:"100vh", color:"#ffffff" }}>

        {/* Summary */}
        <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:18, padding:20, ...fade(60) }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
            <span style={{ fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:700, color:"#ffffff" }}>Aujourd'hui</span>
            <span style={{ fontSize:11, color:T.dimmed }}>{todayEntries.length} aliment{todayEntries.length!==1?"s":""}</span>
          </div>
          <div style={{ display:"flex", justifyContent:"space-around", paddingBottom:16 }}>
            <MacroCircle value={totals.calories} max={targets.calories} label="Calories"  unit="kcal" color={T.green} icon={Flame}   />
            <MacroCircle value={totals.protein}  max={targets.protein}  label="Protéines" unit="g"   color={T.red}   icon={Beef}    />
            <MacroCircle value={totals.fat}      max={targets.fat}      label="Lipides"   unit="g"   color={T.amber} icon={Droplets}/>
            <MacroCircle value={totals.carbs}    max={targets.carbs}    label="Glucides"  unit="g"   color={T.cyan}  icon={Wheat}   />
          </div>
          <div style={{ height:1, background:"rgba(255,255,255,0.05)", marginBottom:14 }}/>
          <HealthScore score={healthScore}/>
          <div style={{ marginTop:12 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
              <span style={{ fontSize:11, color:T.muted }}>Objectif calorique</span>
              <span style={{ fontSize:11, color:calColor, fontWeight:600 }}>{Math.round(totals.calories)} / {targets.calories} kcal</span>
            </div>
            <div style={{ height:5, borderRadius:3, background:"rgba(255,255,255,0.06)", overflow:"hidden" }}>
              <div style={{ height:"100%", borderRadius:3, width:`${calPct*100}%`, background:`linear-gradient(90deg,${calColor}88,${calColor})`, boxShadow:`0 0 10px ${calColor}55`, transition:"width 1s cubic-bezier(0.34,1.56,0.64,1)" }}/>
            </div>
          </div>
        </div>

        {/* Scan buttons */}
        <div style={{ display:"flex", gap:10, ...fade(140) }}>
          {([
            { mode:"barcode" as const, Icon:Barcode, label:"Code-barres", sub:"Scan produit",   color:T.cyan   },
            { mode:"camera"  as const, Icon:Camera,  label:"Photo ",    sub:"Détection auto", color:T.purple },
          ]).map(({ mode, Icon, label, sub, color }) => (
            <button key={mode} className="sbtn" onClick={()=>setScanMode(mode)}
              onMouseEnter={e=>{ e.currentTarget.style.background=`${color}10`; e.currentTarget.style.borderColor=`${color}30`; }}
              onMouseLeave={e=>{ e.currentTarget.style.background="rgba(255,255,255,0.035)"; e.currentTarget.style.borderColor=T.border; }}>
              <div style={{ width:44, height:44, borderRadius:13, background:`${color}18`, border:`1px solid ${color}30`, display:"grid", placeItems:"center" }}>
                <Icon size={20} style={{ color }}/>
              </div>
              <div style={{ textAlign:"center" as const }}>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:700, color:"#ffffff" }}>{label}</div>
                <div style={{ fontSize:10, color:T.dimmed, marginTop:2 }}>{sub}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Scan error */}
        <AnimatePresence>
          {scanError && (
            <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
              style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 14px", borderRadius:12, background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)", fontSize:13, color:T.red }}>
              <X size={14}/><span style={{ flex:1 }}>{scanError}</span>
              <button onClick={()=>setScanError(null)} style={{ background:"none", border:"none", color:T.red, cursor:"pointer" }}><X size={14}/></button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scan results */}
        <AnimatePresence>
          {scanResults.length>0 && (
            <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }} exit={{ opacity:0, height:0 }} style={{ overflow:"hidden" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <span style={{ fontSize:11, color:T.muted, textTransform:"uppercase" as const, letterSpacing:"0.07em" }}>Résultat du scan</span>
                <button onClick={()=>setScanResults([])} style={{ background:"none", border:"none", color:T.dimmed, cursor:"pointer" }}><X size={14}/></button>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {scanResults.map((food,i) => {
                  const ct=food.tags?.find(t=>t.includes("confiance"));
                  const conf=ct?parseInt(ct.replace("confiance-","").replace("%",""))/100:undefined;
                  return <FoodResultCard key={`scan-${i}`} food={food} onAdd={addFood} isScanResult confidence={conf}/>;
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search */}
        <div style={{ position:"relative", ...fade(200) }}>
          <Search size={16} style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:T.dimmed, pointerEvents:"none" }}/>
          <input type="text" placeholder="Rechercher un aliment…" value={query} onChange={e=>handleSearch(e.target.value)} className="food-input"/>
        </div>

        {/* Categories */}
        <div className="cats" style={{ ...fade(260) }}>
          {categories.map(cat=>(
            <button key={cat} className={`cpill${selectedCategory===cat?" on":""}`} onClick={()=>handleCategory(cat)}>{cat}</button>
          ))}
        </div>

        {/* Search results */}
        <AnimatePresence>
          {results.length>0 && (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <span style={{ fontSize:11, color:T.muted, textTransform:"uppercase" as const, letterSpacing:"0.07em" }}>
                {results.length} résultat{results.length>1?"s":""}
              </span>
              {results.map((food,i)=><FoodResultCard key={food.name+i} food={food} onAdd={addFood}/>)}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Diary */}
        <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:18, overflow:"hidden", ...fade(320) }}>
          <button className="dtoggle" onClick={()=>setDiaryOpen(!diaryOpen)}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:16 }}>📋</span>
              <span style={{ fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:700, color:"#ffffff" }}>Journal du jour</span>
              {todayEntries.length>0 && (
                <span style={{ fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:100, background:"rgba(34,197,94,0.12)", border:"1px solid rgba(34,197,94,0.2)", color:T.green }}>{todayEntries.length}</span>
              )}
            </div>
            {diaryOpen?<ChevronUp size={16} style={{ color:T.dimmed }}/>:<ChevronDown size={16} style={{ color:T.dimmed }}/>}
          </button>
          <AnimatePresence>
            {diaryOpen && (
              <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }} style={{ overflow:"hidden" }}>
                <div style={{ padding:"0 14px 14px", display:"flex", flexDirection:"column", gap:8 }}>
                  {todayEntries.length===0
                    ? <div style={{ textAlign:"center" as const, padding:"24px 0", fontSize:13, color:T.dimmed }}>Aucun aliment enregistré aujourd'hui</div>
                    : todayEntries.map((entry,i)=><DiaryItem key={i} entry={entry} onDelete={()=>deleteEntry(i)}/>)
                  }
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tips */}
        {todayEntries.length>0 && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
            style={{ background:"rgba(255,255,255,0.025)", border:`1px solid ${T.border}`, borderRadius:18, padding:18 }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:13, fontWeight:700, color:"#ffffff", marginBottom:10 }}>💡 Conseils du jour</div>
            {totals.protein<targets.protein*0.6 && <div className="trow"><span>🥩</span><span>Ajoutez une source de protéines (poulet, œuf, tofu)</span></div>}
            {totals.carbs>targets.carbs*1.2   && <div className="trow"><span>🍞</span><span>Réduisez les glucides raffinés au prochain repas</span></div>}
            {totals.fat>targets.fat*1.2       && <div className="trow"><span>🫒</span><span>Privilégiez les bonnes graisses (olive, avocat)</span></div>}
            <div className="trow"><span>🥗</span><span>Ajoutez des légumes à chaque repas</span></div>
            <div className="trow"><span>💧</span><span>Buvez de l'eau entre les repas</span></div>
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {scanning && <LoadingOverlay message={analyzing?"Notre IA analyse votre aliment...":"Recherche du produit..."}/>}
      </AnimatePresence>
      {scanMode==="barcode" && <BarcodeScanner onScan={handleBarcodeScan} onClose={()=>setScanMode("none")}/>}
      {scanMode==="camera"  && <CameraCapture  onCapture={handleCameraCapture} onClose={()=>setScanMode("none")}/>}
      <AnimatePresence>
        {multipleResults.length>0 && (
          <MultipleResultsSelector results={multipleResults} onSelect={handleSelectFromMultiple} onClose={()=>setMultipleResults([])}/>
        )}
      </AnimatePresence>
    </PageShell>
  );
};

export default FoodPage;