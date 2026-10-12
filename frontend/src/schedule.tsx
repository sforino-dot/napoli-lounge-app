import { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

import { base44 } from "@/src/base44";

export type Program = { id?: string; day: number; start_time: string; title: string; host?: string | null };

export type OnAir = {
  current: Program | null;
  start: number; // minuti (può essere negativo / > 1440)
  end: number;
  next: Program | null;
  nowMin: number;
};

const toMin = (s: string) => {
  const [h, m] = String(s).split(":").map((x) => parseInt(x, 10));
  return (h || 0) * 60 + (m || 0);
};

export const fmtMin = (min: number) => {
  const m = ((Math.round(min) % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
};

/** Algoritmo del brief: sequenza di tre giorni (precedente −1440, corrente 0, successivo +1440). */
export function computeOnAir(programs: Program[], date: Date): OnAir {
  const nowMin = date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60;
  const byDay: Program[][] = [[], [], [], [], [], [], []];
  for (const p of programs) {
    const d = Number(p.day);
    if (d >= 0 && d <= 6) byDay[d].push(p);
  }
  byDay.forEach((list) => list.sort((a, b) => toMin(a.start_time) - toMin(b.start_time)));

  const d = date.getDay();
  const seq: { p: Program; start: number }[] = [];
  [
    [(d + 6) % 7, -1440],
    [d, 0],
    [(d + 1) % 7, 1440],
  ].forEach(([day, off]) => byDay[day].forEach((p) => seq.push({ p, start: toMin(p.start_time) + off })));

  for (let i = 0; i < seq.length; i++) {
    const end = i + 1 < seq.length ? seq[i + 1].start : seq[i].start + 240;
    if (seq[i].start <= nowMin && nowMin < end) {
      return { current: seq[i].p, start: seq[i].start, end, next: seq[i + 1]?.p ?? null, nowMin };
    }
  }
  return { current: null, start: 0, end: 0, next: null, nowMin };
}

const ScheduleContext = createContext<Program[]>([]);

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const loading = useRef(false);

  useEffect(() => {
    const load = async () => {
      if (loading.current) return;
      loading.current = true;
      try {
        const res = await base44.entities.Program.list("start_time", 500);
        if (Array.isArray(res)) setPrograms(res as unknown as Program[]);
      } catch (e: any) {
        const status = e?.status ?? e?.response?.status;
        if (status === 401 || status === 403) {
          console.warn(`[Base44] Program.list ha risposto ${status}: lettura non pubblica.`);
        }
        // Altrimenti: si tengono gli ultimi dati, nessun errore a schermo.
      } finally {
        loading.current = false;
      }
    };
    load();
    const id = setInterval(load, 60_000);
    const sub = AppState.addEventListener("change", (s) => s === "active" && load());
    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, []);

  return <ScheduleContext.Provider value={programs}>{children}</ScheduleContext.Provider>;
}

export const usePrograms = () => useContext(ScheduleContext);

/** Orologio locale aggiornato ogni secondo, nessuna chiamata di rete. */
export function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export function useOnAir() {
  const programs = usePrograms();
  const now = useNow();
  return { now, onAir: computeOnAir(programs, now) };
}
