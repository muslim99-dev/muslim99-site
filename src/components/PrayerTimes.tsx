"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Coordinates,
  CalculationMethod,
  Madhab,
  PrayerTimes as AdhanPrayerTimes,
} from "adhan";
import { toHijri } from "hijri-converter";
import { MapPin, Sparkles } from "lucide-react";

const PRAYER_ORDER = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;
const HIJRI_MONTHS = [
  "Muharram",
  "Safar",
  "Rabi' al-Awwal",
  "Rabi' al-Thani",
  "Jumada al-Ula",
  "Jumada al-Thaniyah",
  "Rajab",
  "Sha'ban",
  "Ramadan",
  "Shawwal",
  "Dhu al-Qi'dah",
  "Dhu al-Hijjah",
] as const;
const MADHAB_OPTIONS = [
  { value: "shafi", label: "Shafi" },
  { value: "hanafi", label: "Hanafi" },
] as const;
const PRAYER_LABELS: Record<typeof PRAYER_ORDER[number], { name: string; arabic: string }> = {
  fajr: { name: "Fajr", arabic: "الفجر" },
  dhuhr: { name: "Dhuhr", arabic: "الظهر" },
  asr: { name: "Asr", arabic: "العصر" },
  maghrib: { name: "Maghrib", arabic: "المغرب" },
  isha: { name: "Isha", arabic: "العشاء" },
};
const FLOW_ORDER = ["fajr", "sunrise", "ishraq", "dhuhr", "asr", "maghrib", "isha", "tahajjud"] as const;
const FLOW_LABELS: Record<typeof FLOW_ORDER[number], { name: string; arabic: string; note: string }> = {
  fajr: { name: "Fajr", arabic: "الفجر", note: "The start of the day" },
  sunrise: { name: "Sunrise", arabic: "الشروق", note: "The sun appears" },
  ishraq: { name: "Ishraq / Chasht", arabic: "الإشراق / الششت", note: "A quiet window after sunrise" },
  dhuhr: { name: "Dhuhr", arabic: "الظهر", note: "Midday prayer" },
  asr: { name: "Asr", arabic: "العصر", note: "Afternoon prayer" },
  maghrib: { name: "Maghrib", arabic: "المغرب", note: "Sunset prayer" },
  isha: { name: "Isha", arabic: "العشاء", note: "Night prayer" },
  tahajjud: { name: "Tahajjud", arabic: "التهجد", note: "Late-night devotion" },
};

type PrayerKey = typeof PRAYER_ORDER[number];
type FlowKey = typeof FLOW_ORDER[number];
type MadhhabOption = typeof MADHAB_OPTIONS[number]["value"];

type PrayerTimesRecord = Record<PrayerKey, Date> & { sunrise: Date };

function formatTime(date: Date) {
  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatRemaining(ms: number) {
  if (ms <= 0) {
    return "Now";
  }
  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${remainingMinutes}m`;
}

// The Hijri day begins at Maghrib, not midnight — once the sun has set
// locally, the Islamic date has already advanced to tomorrow's Gregorian
// date everywhere, not just in one region. Falls back to a plain midnight
// rollover only until the user's location (and therefore actual local
// Maghrib time) is known.
function getHijriDate(date: Date, coords: Coordinates | null) {
  let effectiveDate = date;
  if (coords) {
    const todayMaghrib = new AdhanPrayerTimes(coords, date, CalculationMethod.MuslimWorldLeague()).maghrib;
    if (date.getTime() >= todayMaghrib.getTime()) {
      effectiveDate = new Date(date.getTime() + 24 * 60 * 60000);
    }
  }
  return toHijri(effectiveDate.getFullYear(), effectiveDate.getMonth() + 1, effectiveDate.getDate());
}

function getPrayerTimesForDate(date: Date, coords: Coordinates, madhhab: MadhhabOption) {
  const params = CalculationMethod.MuslimWorldLeague();
  params.madhab = madhhab === "hanafi" ? Madhab.Hanafi : Madhab.Shafi;
  const times = new AdhanPrayerTimes(coords, date, params);

  return {
    fajr: times.fajr,
    dhuhr: times.dhuhr,
    asr: times.asr,
    maghrib: times.maghrib,
    isha: times.isha,
    sunrise: times.sunrise,
  } as PrayerTimesRecord;
}

export default function PrayerTimes() {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState<Date>(() => new Date());
  const [madhhab, setMadhhab] = useState<MadhhabOption>("hanafi");

  useEffect(() => {
    const currentTime = new Date();
    setNow(currentTime);
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setCoords(new Coordinates(21.4225, 39.8262));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords(new Coordinates(position.coords.latitude, position.coords.longitude));
      },
      () => {
        setError("Location access denied. Default prayer times are shown.");
        setCoords(new Coordinates(21.4225, 39.8262));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  const islamicCalendar = useMemo(() => {
    if (!now) {
      return null;
    }

    const displayDate = now;
    const hijri = getHijriDate(displayDate, coords);
    const monthName = HIJRI_MONTHS[hijri.hm - 1] ?? "Islamic Month";
    const gregorian = displayDate.toLocaleDateString([], {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    return {
      gregorian,
      hijriDay: hijri.hd,
      hijriMonth: monthName,
      hijriYear: hijri.hy,
      summary: `${hijri.hd} ${monthName} ${hijri.hy}`,
      focus: hijri.hm === 9 ? "Ramadan is in progress — increase your fasting and dua." : "A blessed day to renew your intention and remembrance.",
    };
  }, [coords, now]);

  const prayerData = useMemo(() => {
    if (!coords || !now) {
      return null;
    }

    const displayDate = now;
    const nowTime = displayDate.getTime();
    const ISHRAQ_OFFSET = 20 * 60000;
    const TAHAJJUD_START_OFFSET = 45 * 60000; // after Isha
    const WITR_OFFSET = 30 * 60000;

    const yesterday = new Date(displayDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(displayDate);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const yesterdayTimes = getPrayerTimesForDate(yesterday, coords, madhhab);
    const todayTimes = getPrayerTimesForDate(displayDate, coords, madhhab);
    const tomorrowTimes = getPrayerTimesForDate(tomorrow, coords, madhhab);

    // One continuous, strictly chronological sequence spanning yesterday's
    // Isha through tomorrow's Fajr, so "now" always lands in exactly one
    // window — crucially including the early-morning hours before today's
    // Fajr. Those hours previously matched nothing (the old Tahajjud window
    // was only ever computed from *today's* Isha and *tomorrow's* Fajr,
    // both still hours in the future at 3am), so the countdown/current-stage
    // silently fell back to a stale ~26-hour-away window.
    const flow = [
      { key: "tahajjud" as const, start: yesterdayTimes.isha.getTime() + TAHAJJUD_START_OFFSET, end: todayTimes.fajr.getTime() },
      { key: "fajr" as const, start: todayTimes.fajr.getTime(), end: todayTimes.sunrise.getTime() },
      { key: "sunrise" as const, start: todayTimes.sunrise.getTime(), end: todayTimes.sunrise.getTime() + ISHRAQ_OFFSET },
      { key: "ishraq" as const, start: todayTimes.sunrise.getTime() + ISHRAQ_OFFSET, end: todayTimes.dhuhr.getTime() },
      { key: "dhuhr" as const, start: todayTimes.dhuhr.getTime(), end: todayTimes.asr.getTime() },
      { key: "asr" as const, start: todayTimes.asr.getTime(), end: todayTimes.maghrib.getTime() },
      { key: "maghrib" as const, start: todayTimes.maghrib.getTime(), end: todayTimes.isha.getTime() },
      { key: "isha" as const, start: todayTimes.isha.getTime(), end: todayTimes.isha.getTime() + TAHAJJUD_START_OFFSET },
      { key: "tahajjud" as const, start: todayTimes.isha.getTime() + TAHAJJUD_START_OFFSET, end: tomorrowTimes.fajr.getTime() },
    ];

    const activeStep = flow.find((step) => nowTime >= step.start && nowTime < step.end) ?? flow[0];
    const currentStage: FlowKey = activeStep.key;
    const currentStart = activeStep.start;
    const currentEnd = activeStep.end;
    const remainingMs = Math.max(0, currentEnd - nowTime);
    const progress = currentEnd > currentStart ? Math.min(1, Math.max(0, (nowTime - currentStart) / (currentEnd - currentStart))) : 0;

    // The single "Tahajjud" window relevant right now — before today's Fajr
    // that's tonight's leftover from yesterday's Isha; after today's Isha
    // it's tonight's window running into tomorrow's Fajr. Used for the list
    // below so its highlighted card always matches `currentStage` exactly.
    const tahajjudWindow =
      nowTime < todayTimes.fajr.getTime()
        ? { start: new Date(yesterdayTimes.isha.getTime() + TAHAJJUD_START_OFFSET), end: new Date(todayTimes.fajr.getTime()) }
        : { start: new Date(todayTimes.isha.getTime() + TAHAJJUD_START_OFFSET), end: new Date(tomorrowTimes.fajr.getTime()) };

    // Always the *next* occurrence of each marker — once today's has
    // passed, roll forward to tomorrow's rather than dropping it from the
    // list for the rest of the day.
    const nextOccurrence = (todayTime: Date, tomorrowTime: Date) => (todayTime.getTime() >= nowTime ? todayTime : tomorrowTime);

    const specialTimes = [
      { key: "sunrise", label: "Sunrise", time: nextOccurrence(todayTimes.sunrise, tomorrowTimes.sunrise), color: "text-amber-600", note: "Start of the day" },
      {
        key: "ishraq",
        label: "Ishraq / Chasht",
        time: nextOccurrence(new Date(todayTimes.sunrise.getTime() + ISHRAQ_OFFSET), new Date(tomorrowTimes.sunrise.getTime() + ISHRAQ_OFFSET)),
        color: "text-cyan-700",
        note: "A recommended post-sunrise window",
      },
      { key: "zawal", label: "Zawal", time: nextOccurrence(todayTimes.dhuhr, tomorrowTimes.dhuhr), color: "text-orange-600", note: "Avoided for Sunnah" },
      {
        key: "tahajjud",
        label: "Tahajjud",
        time: nextOccurrence(new Date(todayTimes.fajr.getTime() - 90 * 60000), new Date(tomorrowTimes.fajr.getTime() - 90 * 60000)),
        color: "text-emerald-700",
        note: "Night prayer",
      },
      {
        key: "witr",
        label: "Witr",
        time: nextOccurrence(new Date(todayTimes.isha.getTime() + WITR_OFFSET), new Date(tomorrowTimes.isha.getTime() + WITR_OFFSET)),
        color: "text-fuchsia-700",
        note: "Final night prayer",
      },
    ];

    // "Next up" must follow the real prayer sequence (Dhuhr → Asr → ...),
    // not whichever of the side special-times markers (which include Witr
    // and Tahajjud, both hours away) happens to be soonest — that showed
    // "Witr" as next up while Dhuhr was still current, skipping Asr entirely.
    const nextFlowStep = flow.find((step) => step.start > nowTime) ?? flow[flow.length - 1];
    const nextEvent = { key: nextFlowStep.key, label: FLOW_LABELS[nextFlowStep.key].name, time: new Date(nextFlowStep.start) };

    // Matches FLOW_ORDER's chronological sequence — Tahajjud (the last third
    // of the night) comes last, after Isha, not first.
    const listWindows = [
      { key: "fajr", label: PRAYER_LABELS.fajr, start: todayTimes.fajr, end: todayTimes.sunrise },
      { key: "sunrise", label: FLOW_LABELS.sunrise, start: todayTimes.sunrise, end: new Date(todayTimes.sunrise.getTime() + ISHRAQ_OFFSET) },
      { key: "ishraq", label: FLOW_LABELS.ishraq, start: new Date(todayTimes.sunrise.getTime() + ISHRAQ_OFFSET), end: todayTimes.dhuhr },
      { key: "dhuhr", label: PRAYER_LABELS.dhuhr, start: todayTimes.dhuhr, end: todayTimes.asr },
      { key: "asr", label: PRAYER_LABELS.asr, start: todayTimes.asr, end: todayTimes.maghrib },
      { key: "maghrib", label: PRAYER_LABELS.maghrib, start: todayTimes.maghrib, end: todayTimes.isha },
      { key: "isha", label: PRAYER_LABELS.isha, start: todayTimes.isha, end: new Date(todayTimes.isha.getTime() + TAHAJJUD_START_OFFSET) },
      { key: "tahajjud", label: FLOW_LABELS.tahajjud, start: tahajjudWindow.start, end: tahajjudWindow.end },
    ];

    return {
      times: todayTimes,
      currentStage,
      currentStageLabel: FLOW_LABELS[currentStage],
      remaining: formatRemaining(remainingMs),
      progress,
      currentStartedAt: new Date(currentStart),
      currentWindowEnd: new Date(currentEnd),
      nextEvent,
      specialTimes,
      listWindows,
    };
  }, [coords, now, madhhab]);

  return (
    <section id="prayers" className="relative overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 geo-lattice opacity-[0.18]" />
      <div className="relative mx-auto max-w-[1200px] px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center justify-center gap-2 rounded-full border border-current/10 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm backdrop-blur-sm dark:bg-slate-950/80 dark:text-slate-100">
            <MapPin size={16} /> Prayer times by location
          </p>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-[2.6rem]" style={{ color: "var(--text)" }}>
            Your next prayer, calculated for where you are now.
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed" style={{ color: "var(--muted)" }}>
            The app detects your location and shows the five daily prayer times with the current prayer and remaining time until the next Salah.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Madhhab</span>
          <div className="inline-flex rounded-full border border-slate-200 bg-white/80 p-1 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/80">
            {MADHAB_OPTIONS.map((option) => {
              const active = madhhab === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setMadhhab(option.value)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? "bg-cyan-600 text-white shadow-sm"
                      : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
            className="relative overflow-hidden rounded-4xl border border-current/10 bg-white/95 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:bg-slate-950/85 dark:border-white/5"
          >
            <div className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-cyan-500/15 via-transparent to-transparent" />
            <div className="relative z-10">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Now</p>
                  <h3 className="mt-1 text-3xl font-semibold tracking-tight" style={{ color: "var(--text)" }}>
                    {prayerData?.currentStageLabel ? prayerData.currentStageLabel.name : "Loading…"}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {prayerData?.currentStageLabel
                      ? prayerData.currentStageLabel.arabic
                      : "Waiting for location…"}
                  </p>
                </div>
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-cyan-500 to-teal-600 text-white shadow-xl shadow-cyan-500/20">
                  <Sparkles size={28} />
                </div>
              </div>

              <div className="mt-8 rounded-[1.75rem] border border-slate-200/80 bg-slate-100 p-5 text-slate-800 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Remaining</p>
                    <p className="mt-2 text-4xl font-semibold leading-none" style={{ color: "var(--text)" }}>
                      {prayerData?.remaining ?? "..."}
                    </p>
                  </div>
                  <div className="rounded-3xl bg-white/90 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm dark:bg-slate-950/90 dark:text-slate-100">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Next up</p>
                    <p className="mt-1 text-lg font-semibold" style={{ color: "var(--text)" }}>
                      {prayerData?.nextEvent ? prayerData.nextEvent.label : "..."}
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl bg-slate-50 p-4 text-slate-700 dark:bg-slate-900 dark:text-slate-100">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Started at</p>
                      <p className="mt-2 text-sm font-semibold" style={{ color: "var(--text)" }}>
                        {prayerData?.currentStartedAt ? formatTime(prayerData.currentStartedAt) : "--:--"}
                      </p>
                    </div>
                    <div className="rounded-3xl bg-slate-50 p-4 text-slate-700 dark:bg-slate-900 dark:text-slate-100">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Ends at</p>
                      <p className="mt-2 text-sm font-semibold" style={{ color: "var(--text)" }}>
                        {prayerData?.currentWindowEnd ? formatTime(prayerData.currentWindowEnd) : "--:--"}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-3xl bg-white/90 p-3 dark:bg-slate-950/90">
                    <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                      <span>Current window</span>
                      <span>{prayerData ? `${Math.round(prayerData.progress * 100)}%` : "0%"}</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: prayerData ? `${prayerData.progress * 100}%` : "0%" }}
                        transition={{ duration: 0.9, ease: "easeOut" }}
                        className="h-3 rounded-full bg-linear-to-r from-cyan-500 to-teal-500"
                      />
                    </div>

                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                      Ends at <span className="font-semibold text-slate-900 dark:text-white">{prayerData?.currentWindowEnd ? formatTime(prayerData.currentWindowEnd) : "--:--"}</span> · Next: <span className="font-semibold text-slate-900 dark:text-white">{prayerData?.nextEvent ? prayerData.nextEvent.label : "..."}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {prayerData?.specialTimes.map((item) => (
                <div key={item.key} className="rounded-[1.25rem] border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/70">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">{item.label}</p>
                  <p className={`mt-1 text-sm font-semibold ${item.color}`}>
                    {formatTime(item.time)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.note}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-3xl border border-amber-200/70 bg-amber-50/80 p-4 text-sm text-amber-900 dark:border-amber-400/20 dark:bg-amber-900/10 dark:text-amber-200">
              <p className="font-semibold">Not allowed right now</p>
              <p className="mt-1">Avoid regular Sunnah prayers during the prohibited window around sunrise and just after midday. Chasht (Duha) is best prayed from about 15–20 minutes after sunrise until just before Zawal, especially once the sun is fully risen and the day is warm.</p>
            </div>

            {error ? (
              <p className="mt-6 rounded-3xl border border-amber-300/40 bg-amber-50/80 px-4 py-3 text-sm text-amber-900 dark:border-amber-400/20 dark:bg-amber-900/10 dark:text-amber-200">
                {error}
              </p>
            ) : null}
          </motion.div>

          <div className="grid gap-4">
            {(prayerData?.listWindows ?? []).map((item, index) => (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: index * 0.06 }}
                className={`rounded-[1.75rem] border p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md ${
                  prayerData?.currentStage === item.key
                    ? "border-teal-400/25 bg-teal-50 dark:bg-teal-950/30"
                    : "border-current/10 bg-white/90 dark:border-white/5 dark:bg-slate-950/80"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                      {item.label.name}
                    </p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {item.label.arabic}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                      {formatTime(item.start)}
                    </div>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      End {formatTime(item.end)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.15 }}
          className="mt-8 rounded-[2rem] border border-current/10 bg-white/95 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:bg-slate-950/85 dark:border-white/5"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Islamic calendar</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight" style={{ color: "var(--text)" }}>
                Today in the Hijri calendar
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {islamicCalendar?.gregorian}
              </p>
            </div>
            <div className="rounded-3xl border border-cyan-200/70 bg-cyan-50 px-4 py-3 text-cyan-900 dark:border-cyan-400/20 dark:bg-cyan-950/20 dark:text-cyan-200">
              <p className="text-[10px] uppercase tracking-[0.3em]">Hijri date</p>
              <p className="mt-1 text-lg font-semibold">{islamicCalendar?.summary}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.25rem] border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
              <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Islamic month</p>
              <p className="mt-2 text-lg font-semibold" style={{ color: "var(--text)" }}>
                {islamicCalendar?.hijriMonth}
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">A meaningful month for reflection and remembrance.</p>
            </div>
            <div className="rounded-[1.25rem] border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
              <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Today’s focus</p>
              <p className="mt-2 text-lg font-semibold" style={{ color: "var(--text)" }}>
                Daily intention
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{islamicCalendar?.focus}</p>
            </div>
            <div className="rounded-[1.25rem] border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/70">
              <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Suggested remembrance</p>
              <p className="mt-2 text-lg font-semibold" style={{ color: "var(--text)" }}>
                Dhikr & dua
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Keep your heart attached to Allah through salah, dhikr, and sincere supplication.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
