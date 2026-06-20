CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'INSTRUCTOR', 'ADMIN');

CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'STUDENT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "courses" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category_id" INTEGER NOT NULL,
    "thumbnail" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "enrollments" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "enrolled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "progress" DECIMAL(5,2) NOT NULL DEFAULT 0,
    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "lessons" (
    "id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "video_url" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");
CREATE UNIQUE INDEX "uq_enrollments_user_course" ON "enrollments"("user_id", "course_id");
CREATE UNIQUE INDEX "uq_lessons_course_order" ON "lessons"("course_id", "order");

CREATE INDEX "idx_users_created_at" ON "users"("created_at");
CREATE INDEX "idx_courses_category_id" ON "courses"("category_id");
CREATE INDEX "idx_courses_created_at" ON "courses"("created_at");
CREATE INDEX "idx_enrollments_course_id" ON "enrollments"("course_id");
CREATE INDEX "idx_enrollments_user_id" ON "enrollments"("user_id");
CREATE INDEX "idx_lessons_course_id" ON "lessons"("course_id");

ALTER TABLE "courses"
ADD CONSTRAINT "courses_category_id_fkey"
FOREIGN KEY ("category_id") REFERENCES "categories"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "enrollments"
ADD CONSTRAINT "enrollments_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "enrollments"
ADD CONSTRAINT "enrollments_course_id_fkey"
FOREIGN KEY ("course_id") REFERENCES "courses"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "lessons"
ADD CONSTRAINT "lessons_course_id_fkey"
FOREIGN KEY ("course_id") REFERENCES "courses"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

CREATE OR REPLACE FUNCTION get_course_enrollment_count(p_course_id INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    enrollment_total INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO enrollment_total
    FROM "enrollments"
    WHERE "course_id" = p_course_id;

    RETURN enrollment_total;
END;
$$;

CREATE OR REPLACE FUNCTION get_course_progress(p_user_id INTEGER, p_course_id INTEGER)
RETURNS DECIMAL(5,2)
LANGUAGE plpgsql
AS $$
DECLARE
    course_progress DECIMAL(5,2);
BEGIN
    SELECT COALESCE("progress", 0)
    INTO course_progress
    FROM "enrollments"
    WHERE "user_id" = p_user_id
      AND "course_id" = p_course_id;

    RETURN COALESCE(course_progress, 0);
END;
$$;
