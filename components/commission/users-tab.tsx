'use client';

import {useEffect, useState, useMemo} from "react";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Search, ArrowUpDown, ArrowUp, ArrowDown, RefreshCw, Loader2, Users} from "lucide-react";
import {formatDate} from "@/lib/utils";
import DataTable, {type Column} from "./data-table";

interface UserData {
  _id: string;
  name: string;
  phone: string | null;
  quiz: {
    directions: Record<string, number>;
    top: string[];
    completedAt: string;
  } | null;
  coins: number;
}

type SortField = "name" | "phone" | "quizResult" | "quizDate" | "quizCoin";
type SortDir = "asc" | "desc";

export default function UsersTab() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/commission/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return users;
    return users.filter(u =>
      u.name.toLowerCase().includes(q) ||
      (u.phone && u.phone.includes(q)) ||
      (u.quiz?.top?.[0]?.toLowerCase().includes(q))
    );
  }, [users, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      switch (sortField) {
        case "name":
          return dir * a.name.localeCompare(b.name, "ru");
        case "phone":
          return dir * (a.phone || "").localeCompare(b.phone || "");
        case "quizResult":
          return dir * (a.quiz?.top?.[0] || "").localeCompare(b.quiz?.top?.[0] || "");
        case "quizDate":
          return dir * ((a.quiz?.completedAt || "").localeCompare(b.quiz?.completedAt || ""));
        default:
          return 0;
      }
    });
  }, [filtered, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const SortIcon = ({field}: {field: SortField}) => {
    if (sortField !== field) return <ArrowUpDown size={14} className="text-muted-foreground/50"/>;
    return sortDir === "asc"
      ? <ArrowUp size={14} className="text-primary"/>
      : <ArrowDown size={14} className="text-primary"/>;
  };

  const columns: Column<UserData>[] = [
    {
      header: (
        <button onClick={() => toggleSort("name")} className="flex items-center gap-1 font-medium">
          Имя <SortIcon field="name"/>
        </button>
      ),
      cell: (u) => <span className="font-medium">{u.name}</span>,
    },
    {
      header: (
        <button onClick={() => toggleSort("phone")} className="flex items-center gap-1 font-medium">
          Телефон <SortIcon field="phone"/>
        </button>
      ),
      cell: (u) => <span className="text-muted-foreground">{u.phone || <span className="text-muted-foreground/50">&mdash;</span>}</span>,
    },
    {
      header: (
        <button onClick={() => toggleSort("quizResult")} className="flex items-center gap-1 font-medium">
          Результат профтеста <SortIcon field="quizResult"/>
        </button>
      ),
      cell: (u) => u.quiz?.top?.[0]
        ? <Badge variant="secondary">{u.quiz.top[0]}</Badge>
        : <span className="text-muted-foreground/50">&mdash;</span>,
    },
    {
      header: (
        <button onClick={() => toggleSort("quizDate")} className="flex items-center gap-1 font-medium">
          Дата прохождения <SortIcon field="quizDate"/>
        </button>
      ),
      cell: (u) => <span className="text-muted-foreground">
        {u.quiz?.completedAt
          ? formatDate(u.quiz.completedAt)
          : <span className="text-muted-foreground/50">&mdash;</span>
        }
      </span>,
    },
    {
      header: (
        <button onClick={() => toggleSort("quizCoin")} className="flex items-center gap-1 font-medium">
          Монеты <SortIcon field="quizCoin"/>
        </button>
      ),
      cell: (u) => <span className="text-muted-foreground">{u.coins}</span>,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold">Данные абитуриентов</h2>
        <div className="flex gap-2">
          <div className="relative flex-1 sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
            <Input
              placeholder="Поиск по имени, телефону, направлению..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="icon" onClick={fetchUsers} disabled={loading}>
            {loading ? <Loader2 size={16} className="animate-spin"/> : <RefreshCw size={16}/>}
          </Button>
        </div>
      </div>

      <DataTable
        data={sorted}
        columns={columns}
        keyField="_id"
        loading={loading}
        emptyIcon={<Users size={24}/>}
        emptyMessage={search ? "Ничего не найдено" : "Нет данных"}
      />

      <p className="text-sm text-muted-foreground">
        Всего: {sorted.length} {search && `из ${users.length}`}
      </p>
    </div>
  );
}
