/*
  Warnings:

  - Added the required column `hubMemberId` to the `ProjectMember` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProjectMember" ADD COLUMN     "hubMemberId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "ProjectMember_hubMemberId_idx" ON "ProjectMember"("hubMemberId");

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_hubMemberId_fkey" FOREIGN KEY ("hubMemberId") REFERENCES "HubMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
