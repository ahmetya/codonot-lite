/*
  Warnings:

  - Added the required column `pokeId` to the `Pokemon` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Pokemon" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pokeId" INTEGER NOT NULL,
    "name" TEXT NOT NULL
);
INSERT INTO "new_Pokemon" ("id", "name") SELECT "id", "name" FROM "Pokemon";
DROP TABLE "Pokemon";
ALTER TABLE "new_Pokemon" RENAME TO "Pokemon";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
