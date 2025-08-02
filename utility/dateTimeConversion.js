import { DateTime } from "luxon";

// Timezone constants
const MALAYSIA_TZ = "Asia/Kuala_Lumpur";

// Converts UTC Date → [day (1–7), "HH:mm"] in Malaysia time
export const utcToTimeString = (utcDate) => {
  const dt = DateTime.fromJSDate(utcDate, { zone: "utc" }).setZone(MALAYSIA_TZ);
  const day = dt.weekday; // 1 = Monday
  const time = dt.toFormat("HH:mm");
  return [day, time];
};

// Converts [day (1–7), "HH:mm"] → UTC Date object
export const timeStringToUTC = ([day, time]) => {
  const now = DateTime.now().setZone(MALAYSIA_TZ);
  const [hour, minute] = time.split(":").map(Number);

  // Set to the specified weekday and time
  let target = now
    .startOf("week")
    .plus({ days: day - 1, hours: hour, minutes: minute });

  // If that time already passed this week, move to next week
  if (target < now) {
    target = target.plus({ weeks: 1 });
  }

  return target.setZone("utc").toJSDate();
};

// Converts UTC Date → Malaysia Date object
export const utcToMalaysiaDate = (utcDate) => {
  return DateTime.fromJSDate(utcDate, { zone: "utc" })
    .setZone(MALAYSIA_TZ)
    .toJSDate();
};

// Converts Malaysia Date → UTC Date
export const malaysiaToUTC = (malaysiaDate) => {
  return DateTime.fromJSDate(malaysiaDate, { zone: MALAYSIA_TZ })
    .setZone("utc")
    .toJSDate();
};
