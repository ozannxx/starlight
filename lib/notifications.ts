import { AGENDA_KEY, TASKS_KEY, VACATION_KEY, readJSON, addDays, type AgendaEvent, type Task, type Vacation } from "./storage";

let timers: ReturnType<typeof setTimeout>[] = [];

export function notifReady(): boolean {
  return typeof Notification !== "undefined" && Notification.permission === "granted" && localStorage.getItem("starlight-notifications") === "1";
}

export async function enableNotifications(): Promise<boolean> {
  if (typeof Notification === "undefined") return false;
  const p = await Notification.requestPermission();
  const ok = p === "granted";
  localStorage.setItem("starlight-notifications", ok ? "1" : "0");
  if (ok) scheduleReminders();
  return ok;
}

export function disableNotifications() {
  localStorage.setItem("starlight-notifications", "0");
  timers.forEach(clearTimeout); timers = [];
}

export function scheduleReminders() {
  timers.forEach(clearTimeout); timers = [];
  if (!notifReady()) return;
  if (readJSON<Vacation>(VACATION_KEY, { active: false }).active) return;
  const tomorrow = addDays(1);
  const items = [
    ...readJSON<AgendaEvent[]>(AGENDA_KEY, []).filter((e) => e.date === tomorrow).map((e) => e.title),
    ...readJSON<Task[]>(TASKS_KEY, []).filter((t) => t.column !== "done" && t.due === tomorrow).map((t) => t.title),
  ];
  if (!items.length) return;
  const now = new Date();
  const at = (h: number, m: number, dayOffset = 0) => { const d = new Date(); d.setDate(d.getDate() + dayOffset); d.setHours(h, m, 0, 0); return d.getTime(); };
  const evening = at(19, 0), morning = at(7, 30, 1);
  const fire = (ts: number, title: string) => timers.push(setTimeout(() => {
    if (Notification.permission === "granted") new Notification(title, { body: items.join("\n· "), icon: "/icon.svg" });
  }, ts - now.getTime()));
  if (evening > now.getTime()) fire(evening, "📅 Demain");
  fire(morning, "☀️ Ta journée de demain");
}