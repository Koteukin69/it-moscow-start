export interface Course {
  id: string;
  title: string;
  mosCode: string;
  venue: string;
  address: string;
  schedule: string;
  time: string;
  teacher: string;
  age: string;
}

export const courses: Course[] = [
  {
    id: "gamestart",
    title: "Геймстарт",
    mosCode: "2415091",
    venue: "Центр программирования и кибербезопасности",
    address: "ул. Академика Миллионищикова, д. 20",
    schedule: "среда, пятница",
    time: "17:00–17:45",
    teacher: "Пынзарь Е.Н.",
    age: "12–18 лет",
  },
  {
    id: "networks",
    title: "Мастерская технологий: сети и системы изнутри",
    mosCode: "2415162",
    venue: "Центр городских технологий",
    address: "ул. Судостроительная, д. 48",
    schedule: "вторник, среда",
    time: "17:00–17:45",
    teacher: "Дубровин О.М.",
    age: "12–18 лет",
  },
  {
    id: "design-kolomenskaya",
    title: "Лаборатория дизайна: основы визуального мышления",
    mosCode: "2415078",
    venue: "Дизайн колледж",
    address: "ул. Коломенская, д. 5, корп. 3",
    schedule: "понедельник, вторник",
    time: "16:20–17:05",
    teacher: "Голомуздова С.А.",
    age: "12–18 лет",
  },
  {
    id: "design-biryulevo",
    title: "Лаборатория дизайна: основы визуального мышления",
    mosCode: "2417064",
    venue: "IT Бирюлево",
    address: "Харьковский проезд, д. 5А",
    schedule: "понедельник, вторник",
    time: "16:20–17:05",
    teacher: "Жарова Д.Д.",
    age: "12–18 лет",
  },
  {
    id: "web",
    title: "Веб-разработка: с нуля до сайта",
    mosCode: "2415113",
    venue: "Центр программирования и кибербезопасности",
    address: "ул. Академика Миллионищикова, д. 20",
    schedule: "понедельник, среда",
    time: "17:00–17:45",
    teacher: "Сенькина Д.С.",
    age: "12–18 лет",
  },
  {
    id: "python",
    title: "Код будущего: программирование на Python",
    mosCode: "2415107",
    venue: "Центр программирования и кибербезопасности",
    address: "ул. Академика Миллионищикова, д. 20",
    schedule: "вторник, четверг",
    time: "17:30–18:15",
    teacher: "Ахмерова Н.Д.",
    age: "9–11 лет",
  },
  {
    id: "photo",
    title: "Искусство кадра",
    mosCode: "2415122",
    venue: "Дизайн колледж",
    address: "ул. Коломенская, д. 5, корп. 3",
    schedule: "понедельник, среда",
    time: "17:00–17:45",
    teacher: "Аверкин Ю.А.",
    age: "12–18 лет",
  },
];
