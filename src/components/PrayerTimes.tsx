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

function getPakistanHijriDate(date: Date) {
  const pakistanDate = new Date(date);
  pakistanDate.setHours(pakistanDate.getHours() + 3);
  return toHijri(pakistanDate.getFullYear(), pakistanDate.getMonth() + 1, pakistanDate.getDate());
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
    const hijri = coords && coords.latitude >= 23.5 && coords.latitude <= 37.1 && coords.longitude >= 60 && coords.longitude <= 77
      ? getPakistanHijriDate(displayDate)
      : toHijri(displayDate.getFullYear(), displayDate.getMonth() + 1, displayDate.getDate());
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
    const todayTimes = getPrayerTimesForDate(displayDate, coords, madhhab);
    const tomorrow = new Date(displayDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowTimes = getPrayerTimesForDate(tomorrow, coords, madhhab);

    const upcoming = PRAYER_ORDER.map((key) => ({ key, time: todayTimes[key] }))
      .filter(({ time }) => time.getTime() > displayDate.getTime());

    const nextPrayer = upcoming.length > 0 ? upcoming[0] : { key: "fajr" as PrayerKey, time: tomorrowTimes.fajr };

    let currentStage: FlowKey = "tahajjud";
    const nowTime = displayDate.getTime();

    const flow = [
      { key: "tahajjud" as const, start: todayTimes.isha.getTime() + 45 * 60000, end: tomorrowTimes.fajr.getTime() },
      { key: "fajr" as const, start: todayTimes.fajr.getTime(), end: todayTimes.sunrise.getTime() },
      { key: "sunrise" as const, start: todayTimes.sunrise.getTime(), end: todayTimes.sunrise.getTime() + 20 * 60000 },
      { key: "ishraq" as const, start: todayTimes.sunrise.getTime() + 20 * 60000, end: todayTimes.dhuhr.getTime() },
      { key: "dhuhr" as const, start: todayTimes.dhuhr.getTime(), end: todayTimes.asr.getTime() },
      { key: "asr" as const, start: todayTimes.asr.getTime(), end: todayTimes.maghrib.getTime() },
      { key: "maghrib" as const, start: todayTimes.maghrib.getTime(), end: todayTimes.isha.getTime() },
      { key: "isha" as const, start: todayTimes.isha.getTime(), end: todayTimes.isha.getTime() + 45 * 60000 },
    ] as const;

    const activeStep = flow.find((step) => nowTime >= step.start && nowTime < step.end);
    currentStage = activeStep ? activeStep.key : "tahajjud";

    const currentStep = flow.find((step) => step.key === currentStage) ?? flow[0];
    const currentStart = currentStep.start;
    const currentEnd = currentStep.end;
    const remainingMs = Math.max(0, currentEnd - displayDate.getTime());
    const progress = currentEnd > currentStart ? Math.min(1, Math.max(0, (displayDate.getTime() - currentStart) / (currentEnd - currentStart))) : 0;

    const nextStep = flow.find((step) => step.start > nowTime) ?? flow[flow.length - 1];
    const nextPrayerFromNow = Math.max(0, nextStep.start - displayDate.getTime());
    const nextPrayerWindowMs = Math.max(1, nextStep.end - nextStep.start);
    const nextPrayerProgress = Math.min(1, Math.max(0, 1 - nextPrayerFromNow / Math.max(nextPrayerWindowMs, 1)));

    const specialTimes = [
      { key: "sunrise", label: "Sunrise", time: todayTimes.sunrise, color: "text-amber-600", note: "Start of the day" },
      { key: "ishraq", label: "Ishraq / Chasht", time: new Date(todayTimes.sunrise.getTime() + 20 * 60000), color: "text-cyan-700", note: "A recommended post-sunrise window" },
      { key: "zawal", label: "Zawal", time: todayTimes.dhuhr, color: "text-orange-600", note: "Avoided for Sunnah" },
      { key: "tahajjud", label: "Tahajjud", time: new Date(todayTimes.fajr.getTime() - 90 * 60000), color: "text-emerald-700", note: "Night prayer" },
      { key: "witr", label: "Witr", time: new Date(todayTimes.isha.getTime() + 30 * 60000), color: "text-fuchsia-700", note: "Final night prayer" },
    ].filter((item) => item.time.getTime() >= displayDate.getTime());

    const nextEvent = specialTimes.length > 0 ? specialTimes[0] : { key: "fajr", label: "Fajr", time: tomorrowTimes.fajr, color: "text-cyan-700" };

    const listWindows = [
      { key: "tahajjud", label: FLOW_LABELS.tahajjud, start: new Date(todayTimes.isha.getTime() + 45 * 60000), end: new Date(tomorrowTimes.fajr.getTime()) },
      { key: "fajr", label: PRAYER_LABELS.fajr, start: todayTimes.fajr, end: todayTimes.sunrise },
      { key: "sunrise", label: FLOW_LABELS.sunrise, start: todayTimes.sunrise, end: new Date(todayTimes.sunrise.getTime() + 20 * 60000) },
      { key: "ishraq", label: FLOW_LABELS.ishraq, start: new Date(todayTimes.sunrise.getTime() + 20 * 60000), end: todayTimes.dhuhr },
      { key: "dhuhr", label: PRAYER_LABELS.dhuhr, start: todayTimes.dhuhr, end: todayTimes.asr },
      { key: "asr", label: PRAYER_LABELS.asr, start: todayTimes.asr, end: todayTimes.maghrib },
      { key: "maghrib", label: PRAYER_LABELS.maghrib, start: todayTimes.maghrib, end: todayTimes.isha },
      { key: "isha", label: PRAYER_LABELS.isha, start: todayTimes.isha, end: new Date(todayTimes.isha.getTime() + 45 * 60000) },
    ];

    return {
      times: todayTimes,
      currentStage,
      currentStageLabel: FLOW_LABELS[currentStage],
      nextPrayer,
      remaining: formatRemaining(remainingMs),
      progress,
      currentStartedAt: new Date(currentStart),
      currentWindowEnd: new Date(currentEnd),
      nextEvent,
      specialTimes,
      nextPrayerProgress,
      listWindows,
    };
  }, [coords, now, madhhab]);

  return (
    <section id="prayers" className="relative overflow-hidden py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 geo-lattice opacity-[0.18]" />
      <div className="relative mx-auto max-w-6xl px-6">
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
