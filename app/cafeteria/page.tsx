import Back from "@/components/back";
import { Coffee, UtensilsCrossed, Sandwich, Apple, Soup, Cookie } from "lucide-react";

interface MenuItem {
  name: string;
  description: string;
  price: number;
  icon: React.ReactNode;
  category: string;
}

const MENU: MenuItem[] = [
  { name: "Американо", description: "Классический чёрный кофе, бодрит и настраивает на рабочий лад", price: 90, icon: <Coffee size={22}/>, category: "Напитки" },
  { name: "Капучино", description: "Эспрессо с нежной молочной пенкой", price: 130, icon: <Coffee size={22}/>, category: "Напитки" },
  { name: "Латте", description: "Мягкий кофе с большим количеством молока", price: 140, icon: <Coffee size={22}/>, category: "Напитки" },
  { name: "Чай зелёный", description: "Лёгкий и освежающий, без кофеина", price: 70, icon: <Coffee size={22}/>, category: "Напитки" },
  { name: "Чай чёрный", description: "Классический крепкий чай с сахаром", price: 70, icon: <Coffee size={22}/>, category: "Напитки" },
  { name: "Какао", description: "Горячий шоколадный напиток, идеально в холодный день", price: 110, icon: <Coffee size={22}/>, category: "Напитки" },
  { name: "Свежевыжатый сок", description: "Апельсиновый или яблочный, по сезону", price: 160, icon: <Apple size={22}/>, category: "Напитки" },
  { name: "Борщ", description: "Наваристый домашний борщ со сметаной и хлебом", price: 180, icon: <Soup size={22}/>, category: "Горячее" },
  { name: "Суп куриный", description: "Лёгкий бульон с лапшой и зеленью", price: 160, icon: <Soup size={22}/>, category: "Горячее" },
  { name: "Гречка с котлетой", description: "Комплексный обед — сытно и вкусно", price: 210, icon: <UtensilsCrossed size={22}/>, category: "Горячее" },
  { name: "Рис с курицей", description: "Отварной рис с запечённым куриным филе", price: 220, icon: <UtensilsCrossed size={22}/>, category: "Горячее" },
  { name: "Паста с соусом", description: "Спагетти с томатным или сливочным соусом", price: 195, icon: <UtensilsCrossed size={22}/>, category: "Горячее" },
  { name: "Бутерброд с сыром", description: "Свежий хлеб, сливочное масло, сыр", price: 60, icon: <Sandwich size={22}/>, category: "Снеки" },
  { name: "Бутерброд с колбасой", description: "Хлеб, масло, варёная колбаса", price: 65, icon: <Sandwich size={22}/>, category: "Снеки" },
  { name: "Круассан", description: "Слоёный круассан с шоколадной начинкой", price: 95, icon: <Cookie size={22}/>, category: "Снеки" },
  { name: "Печенье", description: "Домашнее овсяное печенье, три штуки", price: 55, icon: <Cookie size={22}/>, category: "Снеки" },
  { name: "Йогурт", description: "Натуральный йогурт с фруктами", price: 80, icon: <Apple size={22}/>, category: "Снеки" },
  { name: "Салат «Цезарь»", description: "Хрустящий романо, гренки, соус, пармезан", price: 175, icon: <UtensilsCrossed size={22}/>, category: "Салаты" },
  { name: "Салат овощной", description: "Свежие сезонные овощи с оливковым маслом", price: 130, icon: <UtensilsCrossed size={22}/>, category: "Салаты" },
];

const CATEGORIES = ["Напитки", "Горячее", "Салаты", "Снеки"];

const CATEGORY_COLORS: Record<string, string> = {
  "Напитки": "#7B9EFF",
  "Горячее": "#FF7B5A",
  "Салаты": "#5AFF9E",
  "Снеки": "#FFD95A",
};

export default function CafeteriaPage() {
  return (
    <div className="min-h-screen bg-[#18181B] text-white">
      <Back link="/" />

      <div className="max-w-4xl mx-auto px-5 sm:px-10 pt-20 pb-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tighter mb-3">
            Марочкина Баффет
          </h1>
          <p className="text-white/60 text-base sm:text-lg">
            Кофетерий ИТ.Москва — зарядись, пока не кончились баги
          </p>
        </div>

        {CATEGORIES.map(category => {
          const items = MENU.filter(m => m.category === category);
          const accentColor = CATEGORY_COLORS[category] ?? "#7B9EFF";
          return (
            <section key={category} className="mb-10">
              <h2
                className="text-xl font-bold mb-4 pl-1 border-l-4"
                style={{ borderColor: accentColor, color: accentColor }}
              >
                {category}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {items.map(item => (
                  <div
                    key={item.name}
                    className="flex items-start gap-4 bg-white/5 rounded-2xl px-5 py-4 border border-white/8 hover:bg-white/8 transition-colors"
                  >
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mt-0.5"
                      style={{ backgroundColor: `${accentColor}22`, color: accentColor }}
                    >
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-semibold text-sm sm:text-base">{item.name}</span>
                        <span
                          className="text-sm font-bold shrink-0"
                          style={{ color: accentColor }}
                        >
                          {item.price} ₽
                        </span>
                      </div>
                      <p className="text-white/50 text-xs mt-0.5 leading-snug">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        <p className="text-center text-white/30 text-sm mt-8">
          Меню может меняться. Актуальное меню — у стойки кофетерия.
        </p>
      </div>
    </div>
  );
}
