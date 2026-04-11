import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const csvPath = path.join(__dirname, '..', 'public', 'Indian_Food_Nutrition_Processed.csv');
const outputPath = path.join(__dirname, '..', 'src', 'data', 'indianFoodDatabase.json');

const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.split(/\r?\n/).filter(line => line.trim());

// Skip header
const header = lines[0];
const dataLines = lines.slice(1);

const categoryKeywords = {
  'Breakfast': ['Poha', 'Idli', 'Dosa', 'Upma', 'Paratha', 'Pancake', 'Porridge', 'Millet', 'Egg', 'Omelette', 'Flake'],
  'Snacks': ['Pakora', 'Samosa', 'Cutlet', 'Vada', 'Sandwich', 'Chips', 'Biscuit', 'Cookies', 'Brittle', 'Roll', 'Kachori', 'Bonda', 'Patties', 'Burger', 'Pizza'],
  'Desserts': ['Kheer', 'Halwa', 'Pudding', 'Cake', 'Pastry', 'Burfi', 'Ladoo', 'Gulab Jamun', 'Ice cream', 'Souffle', 'Mousse', 'Tart', 'Brittle', 'Sweet', 'Jamun', 'Pua', 'Phirni'],
  'Beverages': ['Tea', 'Coffee', 'Juice', 'Milkshake', 'Lassi', 'Sharbat', 'Water', 'Smoothie', 'Nog', 'Cooler', 'Lemonade', 'Chai', 'Cocoa', 'Smoothie'],
  'Mains': ['Curry', 'Rice', 'Pulao', 'Biryani', 'Dal', 'Paneer', 'Chicken', 'Mutton', 'Fish', 'Pasta', 'Spaghetti', 'Lasagne', 'Macroni', 'Soup', 'Stewart', 'Tikka', 'Chowmein', 'Sabzi', 'Roti', 'Naan', 'Chapati', 'Korma', 'Masala', 'Rogan', 'Briyani']
};

function categorize(name) {
  const lowerName = name.toLowerCase();
  for (const [cat, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(k => lowerName.includes(k.toLowerCase()))) {
      return cat;
    }
  }
  return 'Indian Dish';
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

const foods = dataLines.map((line, index) => {
  const parts = parseCSVLine(line);
  if (parts.length < 5) return null;
  
  const name = parts[0].replace(/^"|"$/g, '');
  const calories = parseFloat(parts[1]) || 0;
  const carbs = parseFloat(parts[2]) || 0;
  const protein = parseFloat(parts[3]) || 0;
  const fat = parseFloat(parts[4]) || 0;
  const sugar = parseFloat(parts[5]) || 0;
  const fiber = parseFloat(parts[6]) || 0;
  const sodium = parseFloat(parts[7]) || 0;
  const calcium = parseFloat(parts[8]) || 0;
  const iron = parseFloat(parts[9]) || 0;
  const vitC = parseFloat(parts[10]) || 0;
  const vitB = parseFloat(parts[11]) || 0; // Folate proxy
  
  return {
    id: `ind-csv-${index}`,
    name,
    category: categorize(name),
    region: 'Indian',
    base_calories: calories,
    base_protein: protein,
    base_carbs: carbs,
    base_fat: fat,
    base_sugar: sugar,
    base_fiber: fiber,
    base_sodium: sodium,
    base_calcium: calcium,
    base_iron: iron,
    base_vitC: vitC,
    base_vitB: vitB,
    base_vitA: 0,
    base_vitD: 0,
    base_cholesterol: 0,
    default_serving: 100,
    default_unit: 'g',
    is_verified: true,
    admin_status: 'approved',
    serving_sizes: []
  };
}).filter(Boolean);

fs.writeFileSync(outputPath, JSON.stringify(foods, null, 2));
console.log(`Successfully processed ${foods.length} items to ${outputPath}`);
