-- AlterTable
ALTER TABLE "equipment" ADD COLUMN     "city_id" INTEGER,
ADD COLUMN     "county_id" INTEGER,
ADD COLUMN     "province_id" INTEGER,
ALTER COLUMN "province" DROP NOT NULL,
ALTER COLUMN "city" DROP NOT NULL,
ALTER COLUMN "county" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "equipment_province_id_city_id_county_id_idx" ON "equipment"("province_id", "city_id", "county_id");

-- AddForeignKey
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_province_id_fkey" FOREIGN KEY ("province_id") REFERENCES "regions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "regions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_county_id_fkey" FOREIGN KEY ("county_id") REFERENCES "regions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
