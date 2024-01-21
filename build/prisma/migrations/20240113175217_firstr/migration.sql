-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "last_login" TEXT;

-- AlterTable
ALTER TABLE "Inbox" ADD COLUMN     "title" TEXT,
ALTER COLUMN "date" DROP NOT NULL,
ALTER COLUMN "date" SET DATA TYPE TEXT,
ALTER COLUMN "message" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Notifications" (
    "id" TEXT NOT NULL,
    "notification" TEXT,
    "link" TEXT,
    "user_id" TEXT,
    "date" TEXT,

    CONSTRAINT "Notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visitor" (
    "id" TEXT NOT NULL,
    "isvistor" BOOLEAN,
    "count" INTEGER NOT NULL,

    CONSTRAINT "Visitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contactus" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "message" TEXT NOT NULL,

    CONSTRAINT "Contactus_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
