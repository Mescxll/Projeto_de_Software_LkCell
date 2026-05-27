/*
  Warnings:

  - The values [ATIVA] on the enum `status_venda_enum` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "status_venda_enum_new" AS ENUM ('EFETUADA', 'CANCELADA');
ALTER TABLE "public"."venda" ALTER COLUMN "status_venda" DROP DEFAULT;
ALTER TABLE "venda" ALTER COLUMN "status_venda" TYPE "status_venda_enum_new" USING ("status_venda"::text::"status_venda_enum_new");
ALTER TYPE "status_venda_enum" RENAME TO "status_venda_enum_old";
ALTER TYPE "status_venda_enum_new" RENAME TO "status_venda_enum";
DROP TYPE "public"."status_venda_enum_old";
COMMIT;

-- AlterTable
ALTER TABLE "venda" ALTER COLUMN "status_venda" DROP DEFAULT;
