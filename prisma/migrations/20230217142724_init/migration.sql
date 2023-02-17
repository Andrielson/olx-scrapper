-- CreateTable
CREATE TABLE "anuncio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "link" TEXT NOT NULL,
    "title" TEXT,
    "rentAmount" DECIMAL,
    "condominiumFee" DECIMAL,
    "taxAmount" DECIMAL,
    "area" DECIMAL,
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "garages" INTEGER,
    "postalCode" TEXT,
    "city" TEXT,
    "neighborhood" TEXT,
    "address" TEXT,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "anuncio_link_key" ON "anuncio"("link");
