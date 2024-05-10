-- CreateTable
CREATE TABLE "customers" (
    "customerId" TEXT NOT NULL,
    "email" VARCHAR(256) NOT NULL,
    "name" VARCHAR(180),
    "password" VARCHAR(256) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("customerId")
);

-- CreateTable
CREATE TABLE "admins" (
    "adminId" TEXT NOT NULL,
    "email" VARCHAR(256) NOT NULL,
    "name" VARCHAR(180) NOT NULL,
    "password" VARCHAR(256) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("adminId")
);

-- CreateTable
CREATE TABLE "bookings" (
    "bookingId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "bookingName" VARCHAR(256) NOT NULL,
    "address" VARCHAR(256) NOT NULL,
    "imageUrlArr" TEXT[],
    "availableRoomsArr" TEXT[],

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("bookingId")
);

-- CreateTable
CREATE TABLE "customer_reservations" (
    "customerReservationId" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "selectedRoomsArr" TEXT[],
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_reservations_pkey" PRIMARY KEY ("customerReservationId")
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_email_key" ON "customers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_bookingName_key" ON "bookings"("bookingName");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_address_key" ON "bookings"("address");

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins"("adminId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_reservations" ADD CONSTRAINT "customer_reservations_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("customerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_reservations" ADD CONSTRAINT "customer_reservations_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("bookingId") ON DELETE RESTRICT ON UPDATE CASCADE;
