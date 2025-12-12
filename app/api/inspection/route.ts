
import { db } from "@/app/db";
import { tireInspections, tyreAssignments, tyres, vehicles } from "@/app/db/schema";
import { and, eq, ilike, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

// GET /api/inspections?page=1&limit=10&status=failed&search=TRK
export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const page = Number(params.get("page") ?? 1);
  const limit = Number(params.get("limit") ?? 10);

  const offset = (page - 1) * limit;

  const search = params.get("search");
  const status = params.get("status"); // passed/failed/pending
  const inspector = params.get("inspector");
  const vehicleType = params.get("vehicleType"); // truck, bus, trailer etc.

  const filters = [];

  if (status) filters.push(eq(tireInspections.status, status));
  if (inspector) filters.push(ilike(tireInspections.inspector, `%${inspector}%`));
  if (vehicleType) filters.push(eq(vehicles.category, vehicleType));
  if (search)
    filters.push(
      sql`(${vehicles.plateNumber} ILIKE ${`%${search}%`} 
         OR ${tireInspections.inspector} ILIKE ${`%${search}%`})`
    );

  const records = await db
    .select({
      id: tireInspections.id,
      date: tireInspections.date,
      status: tireInspections.status,
      issues: tireInspections.issues,

      vehiclePlate: vehicles.plateNumber,
      vehicleMake: vehicles.make,
      vehicleModel: vehicles.model,

      tyreSerial: tyres.serialNumber,
      tyrePosition: tyreAssignments.position,

      inspector: tireInspections.inspector,
    })
    .from(tireInspections)
    .leftJoin(tyreAssignments, eq(tyreAssignments.id, tireInspections.assignmentId))
    .leftJoin(vehicles, eq(vehicles.id, tireInspections.vehicleId))
    .leftJoin(tyres, eq(tyres.id, tireInspections.tyreId))
    .where(and(...filters))
    .orderBy(sql`${tireInspections.date} DESC`)
    .limit(limit)
    .offset(offset);

  const totalCount = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(tireInspections)
    .where(and(...filters));

  return NextResponse.json({
    page,
    limit,
    total: Number(totalCount[0].count),
    data: records,
  });
}
