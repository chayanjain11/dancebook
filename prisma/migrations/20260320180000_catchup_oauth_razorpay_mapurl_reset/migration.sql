-- AlterTable: User - add Google OAuth fields, make passwordHash optional
ALTER TABLE "User" ADD COLUMN     "googleId" TEXT,
ADD COLUMN     "image" TEXT;
ALTER TABLE "User" ALTER COLUMN "passwordHash" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- AlterTable: Workshop - add new fields
ALTER TABLE "Workshop" ADD COLUMN     "ageLimit" INTEGER,
ADD COLUMN     "durationMinutes" INTEGER,
ADD COLUMN     "mapUrl" TEXT,
ADD COLUMN     "reminderSent" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable: Booking - add Razorpay fields, change unique to index
ALTER TABLE "Booking" ADD COLUMN     "razorpayOrderId" TEXT,
ADD COLUMN     "razorpayPaymentId" TEXT;

CREATE UNIQUE INDEX "Booking_razorpayOrderId_key" ON "Booking"("razorpayOrderId");
CREATE UNIQUE INDEX "Booking_razorpayPaymentId_key" ON "Booking"("razorpayPaymentId");

-- Drop unique constraint and replace with index
ALTER TABLE "Booking" DROP CONSTRAINT IF EXISTS "Booking_userId_workshopId_key";
DROP INDEX IF EXISTS "Booking_userId_workshopId_key";
CREATE INDEX "Booking_userId_workshopId_idx" ON "Booking"("userId", "workshopId");

-- AlterTable: BookingGuest - add whatsapp, ticketToken, attended
ALTER TABLE "BookingGuest" ADD COLUMN     "attended" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ticketToken" TEXT,
ADD COLUMN     "whatsapp" TEXT;

-- Backfill ticketToken for existing rows before adding unique constraint
UPDATE "BookingGuest" SET "ticketToken" = "id" WHERE "ticketToken" IS NULL;

CREATE UNIQUE INDEX "BookingGuest_ticketToken_key" ON "BookingGuest"("ticketToken");

-- CreateTable: PasswordResetToken
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");
CREATE INDEX "PasswordResetToken_email_idx" ON "PasswordResetToken"("email");

-- CreateTable: WorkshopNotification
CREATE TABLE "WorkshopNotification" (
    "id" TEXT NOT NULL,
    "workshopId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkshopNotification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "WorkshopNotification_workshopId_idx" ON "WorkshopNotification"("workshopId");

-- AddForeignKey
ALTER TABLE "WorkshopNotification" ADD CONSTRAINT "WorkshopNotification_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "Workshop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
