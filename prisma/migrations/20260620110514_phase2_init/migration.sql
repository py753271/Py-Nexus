-- AlterTable
ALTER TABLE "users" ADD COLUMN     "batch_id" INTEGER,
ADD COLUMN     "internship_stage" TEXT NOT NULL DEFAULT 'Applied',
ADD COLUMN     "program_id" INTEGER;

-- CreateTable
CREATE TABLE "internship_programs" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "duration" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "internship_programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "internship_batches" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "program_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "internship_batches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "internship_programs_name_key" ON "internship_programs"("name");

-- CreateIndex
CREATE UNIQUE INDEX "internship_batches_name_key" ON "internship_batches"("name");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "internship_programs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "internship_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internship_batches" ADD CONSTRAINT "internship_batches_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "internship_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
