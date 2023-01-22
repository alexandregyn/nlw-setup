-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_habitweekdays" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "habit_id" TEXT NOT NULL,
    "week_day" INTEGER NOT NULL,
    CONSTRAINT "habitweekdays_habit_id_fkey" FOREIGN KEY ("habit_id") REFERENCES "habits" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_habitweekdays" ("habit_id", "id", "week_day") SELECT "habit_id", "id", "week_day" FROM "habitweekdays";
DROP TABLE "habitweekdays";
ALTER TABLE "new_habitweekdays" RENAME TO "habitweekdays";
CREATE UNIQUE INDEX "habitweekdays_habit_id_week_day_key" ON "habitweekdays"("habit_id", "week_day");
CREATE TABLE "new_dayhabits" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "day_id" TEXT NOT NULL,
    "habit_id" TEXT NOT NULL,
    CONSTRAINT "dayhabits_day_id_fkey" FOREIGN KEY ("day_id") REFERENCES "days" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "dayhabits_habit_id_fkey" FOREIGN KEY ("habit_id") REFERENCES "habits" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_dayhabits" ("day_id", "habit_id", "id") SELECT "day_id", "habit_id", "id" FROM "dayhabits";
DROP TABLE "dayhabits";
ALTER TABLE "new_dayhabits" RENAME TO "dayhabits";
CREATE UNIQUE INDEX "dayhabits_day_id_habit_id_key" ON "dayhabits"("day_id", "habit_id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
