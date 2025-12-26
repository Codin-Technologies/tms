import { pgTable, serial, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  plateNumber: text("plate_number").notNull().unique(),
  make: text("make"),
  model: text("model"),
  category: text("category"),
  year: integer("year"),
  currentMileage: integer("current_mileage").notNull().default(0),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const skus = pgTable("skus", {
  id: serial("id").primaryKey(),
  skuCode: text("sku_code").notNull().unique(),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  size: text("size").notNull(),
  plyRating: text("ply_rating"),
  patternType: text("pattern_type"),
  category: text("category"), // Steer / Drive / Trailer
  retreadable: boolean("retreadable").default(true),
  maxRetreadCycles: integer("max_retread_cycles").default(3),
  expectedMileage: integer("expected_mileage"),
  minTreadDepth: integer("min_tread_depth").default(4), // mm

  // Inventory Rules
  reorderPoint: integer("reorder_point").default(0),
  minStockLevel: integer("min_stock_level").default(0),
  preferredWarehouse: text("preferred_warehouse"),
  leadTimeDays: integer("lead_time_days").default(0),

  // Financial
  avgUnitCost: integer("avg_unit_cost").default(0),
  budgetCategory: text("budget_category"),

  status: text("status").notNull().default("active"), // active / inactive
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tyres = pgTable("tyres", {
  id: serial("id").primaryKey(),
  serialNumber: text("serial_number").notNull().unique(),
  skuId: integer("sku_id").references(() => skus.id),
  brand: text("brand"), // Keeping for fallback/legacy
  model: text("model"),
  size: text("size"),
  type: text("type"),
  plyRating: text("ply_rating"),
  purchaseDate: text("purchase_date"),
  purchaseCost: integer("purchase_cost").default(0),
  totalKm: integer("total_km").default(0),
  remainingTreadMm: integer("remaining_tread_mm").default(0),
  condition: text("condition").default("good"),
  status: text("status").default("instock"), // instock / issued / inspection / quarantine / scrapped
  currentWarehouse: text("current_warehouse"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const tyreAssignments = pgTable("tyre_assignments", {
  id: serial("id").primaryKey(),
  tyreId: integer("tyre_id")
    .notNull()
    .references(() => tyres.id, { onDelete: "cascade" }),
  vehicleId: integer("vehicle_id")
    .notNull()
    .references(() => vehicles.id, { onDelete: "cascade" }),
  position: text("position").notNull(),
  assignedDate: timestamp("assigned_date").notNull().defaultNow(),
  removedDate: timestamp("removed_date"),
  assignedOdometer: integer("assigned_odometer").notNull(),
  removedOdometer: integer("removed_odometer"),
  notes: text("notes")
});

export const tireInspections = pgTable("tire_inspections", {
  id: serial("id").primaryKey(),

  tyreId: integer("tyre_id")
    .notNull()
    .references(() => tyres.id, { onDelete: "cascade" }),

  vehicleId: integer("vehicle_id")
    .notNull()
    .references(() => vehicles.id, { onDelete: "cascade" }),

  assignmentId: integer("assignment_id")
    .references(() => tyreAssignments.id, { onDelete: "set null" }),

  inspector: text("inspector").notNull(),
  date: timestamp("date").defaultNow().notNull(),

  status: text("status").notNull(),        // passed / failed / pending
  treadDepthMm: integer("tread_depth_mm"),
  pressurePsi: integer("pressure_psi"),
  issues: text("issues"),                  // Low tread, uneven wear, crack, etc.
  remarks: text("remarks")
});

export const skuRelations = relations(skus, ({ many }) => ({
  tyres: many(tyres),
}));

export const tyreRelations = relations(tyres, ({ one }) => ({
  sku: one(skus, {
    fields: [tyres.skuId],
    references: [skus.id],
  }),
}));