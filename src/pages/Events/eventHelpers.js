// Times are saved as "08:00", "08:00:00" or "8:00 AM", depending on the source.
export const formatEventTime = (value) => {
  const match = /^\s*(\d{1,2}):(\d{2})(?::\d{2})?\s*([AaPp][Mm])?\s*$/.exec(
    value || ""
  );
  if (!match) return value || "";

  let hour = Number(match[1]);
  const period = match[3]?.toLowerCase();
  if (period === "pm" && hour < 12) hour += 12;
  if (period === "am" && hour === 12) hour = 0;

  return new Date(2000, 0, 1, hour, Number(match[2])).toLocaleTimeString(
    "en-GB",
    { hour: "numeric", minute: "2-digit", hour12: true }
  );
};

// Some events save only the day in eventEndDate, with the time held separately.
export const isEventOver = (event) => {
  const end = new Date(event.eventEndDate);
  const match = /^\s*(\d{1,2}):(\d{2}).*?([AaPp])?[Mm]?\s*$/.exec(
    event.eventEndTime || ""
  );

  if (match) {
    const hour = Number(match[1]);
    const period = match[3]?.toLowerCase();
    const hours = !period ? hour : hour % 12 + (period === "p" ? 12 : 0);
    end.setHours(hours, Number(match[2]), 0, 0);
  } else {
    end.setHours(23, 59, 59, 999);
  }
  return end < new Date();
};

export const eventTiming = (event) => {
  const now = new Date();
  const start = new Date(event.eventStartDate);

  if (isEventOver(event)) return { label: "Ended", color: "secondary" };
  if (start <= now) return { label: "Live now", color: "success" };

  const days = Math.round(
    (new Date(start).setHours(0, 0, 0, 0) -
      new Date(now).setHours(0, 0, 0, 0)) /
      (24 * 60 * 60 * 1000)
  );
  if (days === 0) return { label: "Today", color: "primary" };
  if (days === 1) return { label: "Tomorrow", color: "primary" };
  return { label: `In ${days} days`, color: "dark" };
};
