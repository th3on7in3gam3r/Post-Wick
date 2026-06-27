"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useMemo, useState } from "react";
import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Sun,
  type LucideIcon,
} from "lucide-react";
import { AppHeader } from "@/components/app/app-header";
import { greetingForHour, userFirstName } from "@/lib/user-greeting";

type LocalWeather = {
  tempF: number;
  label: string;
  Icon: LucideIcon;
  timeZone: string;
};

function browserTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return undefined;
  }
}

function hourInTimeZone(timeZone: string, date: Date) {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "numeric",
      hourCycle: "h23",
    }).format(date),
  );
  return Number.isFinite(hour) ? hour : date.getHours();
}

function formatDateInTimeZone(timeZone: string, date: Date) {
  return date.toLocaleDateString(undefined, {
    timeZone,
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function weatherFromCode(code: number): Pick<LocalWeather, "label" | "Icon"> {
  if (code === 0) return { label: "Clear skies", Icon: Sun };
  if (code <= 3) return { label: "Partly cloudy", Icon: CloudSun };
  if (code <= 48) return { label: "Foggy", Icon: CloudFog };
  if (code <= 57) return { label: "Drizzle", Icon: CloudRain };
  if (code <= 67) return { label: "Rainy", Icon: CloudRain };
  if (code <= 77) return { label: "Snowy", Icon: CloudSnow };
  if (code <= 82) return { label: "Showers", Icon: CloudRain };
  if (code <= 86) return { label: "Snow showers", Icon: CloudSnow };
  if (code <= 99) return { label: "Stormy", Icon: CloudLightning };
  return { label: "Cloudy", Icon: Cloud };
}

async function fetchLocalWeather(latitude: number, longitude: number): Promise<LocalWeather | null> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set("current", "temperature_2m,weather_code");
  url.searchParams.set("temperature_unit", "fahrenheit");
  url.searchParams.set("timezone", "auto");

  const response = await fetch(url.toString());
  if (!response.ok) return null;

  const data = (await response.json()) as {
    timezone?: string;
    current?: { temperature_2m?: number; weather_code?: number };
  };

  const code = data.current?.weather_code;
  const temp = data.current?.temperature_2m;
  const timeZone = data.timezone ?? browserTimeZone();
  if (code == null || temp == null || !timeZone) return null;

  return {
    tempF: Math.round(temp),
    timeZone,
    ...weatherFromCode(code),
  };
}

export function DashboardHeader({ timeZone: timeZoneProp }: { timeZone?: string }) {
  const { user, isLoaded } = useUser();
  const [now, setNow] = useState(() => new Date());
  const [weather, setWeather] = useState<LocalWeather | null>(null);
  const [geoTimeZone, setGeoTimeZone] = useState<string | undefined>();

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        void fetchLocalWeather(position.coords.latitude, position.coords.longitude).then(
          (result) => {
            if (!result) return;
            setWeather(result);
            setGeoTimeZone(result.timeZone);
          },
        );
      },
      () => {},
      { timeout: 10_000, maximumAge: 30 * 60 * 1000 },
    );
  }, []);

  const activeTimeZone = timeZoneProp ?? geoTimeZone ?? browserTimeZone();
  const greeting = useMemo(() => {
    const hour = activeTimeZone ? hourInTimeZone(activeTimeZone, now) : now.getHours();
    const firstName = isLoaded
      ? userFirstName(user?.firstName, user?.fullName)
      : undefined;
    return greetingForHour(hour, firstName);
  }, [activeTimeZone, now, isLoaded, user?.firstName, user?.fullName]);

  const dateLabel = activeTimeZone
    ? formatDateInTimeZone(activeTimeZone, now)
    : now.toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
  const WeatherIcon = weather?.Icon;

  return (
    <AppHeader
      leading={
        <>
          <h1 className="font-playfair text-2xl italic text-near-black">{greeting}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm text-gray-body">
            <span>{dateLabel}</span>
            {weather && WeatherIcon ? (
              <>
                <span className="text-gray-label" aria-hidden>
                  ·
                </span>
                <WeatherIcon className="h-3.5 w-3.5 shrink-0 text-gold" aria-hidden />
                <span>
                  {weather.label}, {weather.tempF}°
                </span>
              </>
            ) : null}
          </p>
        </>
      }
    />
  );
}
