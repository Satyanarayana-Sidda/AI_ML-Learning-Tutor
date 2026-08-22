/**
 * Utility for tracking daily study activity and calculating streak dynamics.
 */

export function recordStudyActivity(hours: number = 1): void {
  try {
    let dailyData = [0, 0, 0, 0, 0, 0, 0];
    const parsed = JSON.parse(localStorage.getItem("dailyStudyData") || "[0,0,0,0,0,0,0]");
    if (Array.isArray(parsed) && parsed.length === 7) {
      dailyData = parsed;
    }
    const todayIndex = (new Date().getDay() + 6) % 7; // Monday = 0 ... Sunday = 6
    dailyData[todayIndex] = Math.max(dailyData[todayIndex], hours);
    localStorage.setItem("dailyStudyData", JSON.stringify(dailyData));
    localStorage.setItem("lastStudyDate", new Date().toISOString().split("T")[0]);
  } catch (e) {
    console.error("Failed to record study activity", e);
  }
}

export function calculateStreak(): number {
  try {
    let dailyData = [0, 0, 0, 0, 0, 0, 0];
    const parsed = JSON.parse(localStorage.getItem("dailyStudyData") || "[0,0,0,0,0,0,0]");
    if (Array.isArray(parsed) && parsed.length === 7) {
      dailyData = parsed;
    }

    const todayIndex = (new Date().getDay() + 6) % 7; // Monday = 0 ... Sunday = 6
    let streak = 0;
    let checkIndex = todayIndex;

    // If no study recorded for today yet, check yesterday to preserve an active streak
    if (dailyData[todayIndex] === 0) {
      checkIndex = (todayIndex - 1 + 7) % 7;
    }

    for (let i = 0; i < 7; i++) {
      if (dailyData[checkIndex] > 0) {
        streak++;
        checkIndex = (checkIndex - 1 + 7) % 7;
      } else {
        break;
      }
    }
    return streak;
  } catch (e) {
    return 0;
  }
}
