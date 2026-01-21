/*
  Warnings:

  - You are about to drop the column `city` on the `equipment` table. All the data in the column will be lost.
  - You are about to drop the column `county` on the `equipment` table. All the data in the column will be lost.
  - You are about to drop the column `province` on the `equipment` table. All the data in the column will be lost.
  - Made the column `city_id` on table `equipment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `county_id` on table `equipment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `province_id` on table `equipment` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "equipment" DROP CONSTRAINT "equipment_city_id_fkey";

-- DropForeignKey
ALTER TABLE "equipment" DROP CONSTRAINT "equipment_county_id_fkey";

-- DropForeignKey
ALTER TABLE "equipment" DROP CONSTRAINT "equipment_province_id_fkey";

-- DropIndex
DROP INDEX "equipment_province_city_county_idx";

-- AlterTable
ALTER TABLE "equipment" DROP COLUMN "city",
DROP COLUMN "county",
DROP COLUMN "province",
ALTER COLUMN "city_id" SET NOT NULL,
ALTER COLUMN "county_id" SET NOT NULL,
ALTER COLUMN "province_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_province_id_fkey" FOREIGN KEY ("province_id") REFERENCES "regions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "regions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_county_id_fkey" FOREIGN KEY ("county_id") REFERENCES "regions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
