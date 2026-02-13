'use client';

import {useEffect, useState, useMemo} from "react";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Search, ArrowUpDown, ArrowUp, ArrowDown, RefreshCw, Loader2} from "lucide-react";

interface UserData {
  _id: string;
  name: string;
  phone: string | null;
  coins: number;
}

type SortField = "name" | "phone" | "coins";
type SortDir = "asc" | "desc";

export default function CoinsTab() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("coins");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

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
      (u.phone && u.phone.includes(q))
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
        case "coins":
          return dir * ((a.coins ?? 0) - (b.coins ?? 0));
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold">Монетки абитуриентов</h2>
        <div className="flex gap-2">
          <div className="relative flex-1 sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
            <Input
              placeholder="Поиск по имени, телефону..."
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

      <Card className="bg-background/70 overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>
                  <button onClick={() => toggleSort("name")} className="flex items-center gap-1 font-medium">
                    Имя <SortIcon field="name"/>
                  </button>
                </TableHead>
                <TableHead>
                  <button onClick={() => toggleSort("phone")} className="flex items-center gap-1 font-medium">
                    Телефон <SortIcon field="phone"/>
                  </button>
                </TableHead>
                <TableHead>
                  <button onClick={() => toggleSort("coins")} className="flex items-center gap-1 font-medium">
                    Монетки <SortIcon field="coins"/>
                  </button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8">
                    <Loader2 size={20} className="animate-spin mx-auto text-muted-foreground"/>
                  </TableCell>
                </TableRow>
              ) : sorted.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    {search ? "Ничего не найдено" : "Нет данных"}
                  </TableCell>
                </TableRow>
              ) : (
                sorted.map(user => (
                  <TableRow key={user._id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.phone || <span className="text-muted-foreground/50">&mdash;</span>}
                    </TableCell>
                    <TableCell>{user.coins ?? 0}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        Всего: {sorted.length} {search && `из ${users.length}`}
      </p>
    </div>
  );
}
