export interface SalaryLevel {
  level: "Junior" | "Middle" | "Senior";
  salary: number;
  experience: string;
}

export interface SpecialtySalary {
  id: string;
  title: string;
  levels: SalaryLevel[];
}

export const salaryData: SpecialtySalary[] = [
  {
    id: "web",
    title: "Веб-разработка",
    levels: [
      {level: "Junior", salary: 60000, experience: "до 1 года"},
      {level: "Middle", salary: 150000, experience: "1–3 года"},
      {level: "Senior", salary: 300000, experience: "5+ лет"},
    ],
  },
  {
    id: "security",
    title: "Информационная безопасность",
    levels: [
      {level: "Junior", salary: 70000, experience: "до 1 года"},
      {level: "Middle", salary: 160000, experience: "1–3 года"},
      {level: "Senior", salary: 320000, experience: "5+ лет"},
    ],
  },
  {
    id: "gamedev",
    title: "Разработка игр",
    levels: [
      {level: "Junior", salary: 55000, experience: "до 1 года"},
      {level: "Middle", salary: 140000, experience: "1–3 года"},
      {level: "Senior", salary: 280000, experience: "5+ лет"},
    ],
  },
  {
    id: "systems",
    title: "Системное программирование",
    levels: [
      {level: "Junior", salary: 65000, experience: "до 1 года"},
      {level: "Middle", salary: 170000, experience: "1–3 года"},
      {level: "Senior", salary: 350000, experience: "5+ лет"},
    ],
  },
  {
    id: "networks",
    title: "Сетевое администрирование",
    levels: [
      {level: "Junior", salary: 50000, experience: "до 1 года"},
      {level: "Middle", salary: 120000, experience: "1–3 года"},
      {level: "Senior", salary: 250000, experience: "5+ лет"},
    ],
  },
  {
    id: "intelligent",
    title: "Интеллектуальные системы",
    levels: [
      {level: "Junior", salary: 80000, experience: "до 1 года"},
      {level: "Middle", salary: 200000, experience: "1–3 года"},
      {level: "Senior", salary: 400000, experience: "5+ лет"},
    ],
  },
  {
    id: "design",
    title: "Дизайн",
    levels: [
      {level: "Junior", salary: 50000, experience: "до 1 года"},
      {level: "Middle", salary: 130000, experience: "1–3 года"},
      {level: "Senior", salary: 260000, experience: "5+ лет"},
    ],
  },
  {
    id: "transport",
    title: "Транспорт и автоматизация",
    levels: [
      {level: "Junior", salary: 55000, experience: "до 1 года"},
      {level: "Middle", salary: 130000, experience: "1–3 года"},
      {level: "Senior", salary: 270000, experience: "5+ лет"},
    ],
  },
];
