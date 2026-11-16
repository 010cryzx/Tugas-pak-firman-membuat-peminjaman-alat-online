import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export interface HardwareSpecs {
  cpu?: string;
  ram?: string;
  gpu?: string;
  storage?: string;
  display?: string;
  os?: string;
  serialNumber?: string;
  [key: string]: string | number | undefined;
}

export interface SoftwareSpecs {
  version?: string;
  licenseType?: string;
  platform?: string;
  vendor?: string;
  activationMode?: string;
  [key: string]: string | number | undefined;
}

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  username: text('username').notNull(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull().default('peminjam'), // 'admin' | 'petugas' | 'peminjam'
  department: text('department').notNull().default('Teknik Informatika'),
  identityNumber: text('identity_number').notNull().default('-'),
  phone: text('phone').notNull().default('-'),
  isActive: boolean('is_active').notNull().default(true),
  deletedAt: text('deleted_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  assetType: text('asset_type').notNull(), // 'hardware' | 'software'
  description: text('description').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const items = pgTable('items', {
  id: serial('id').primaryKey(),
  assetCode: text('asset_code').notNull().unique(),
  name: text('name').notNull(),
  brand: text('brand').notNull(),
  model: text('model').notNull(),
  categoryId: integer('category_id')
    .references(() => categories.id)
    .notNull(),
  assetType: text('asset_type').notNull(), // 'hardware' | 'software'
  specs: jsonb('specs').$type<HardwareSpecs & SoftwareSpecs>().notNull(),
  condition: text('condition').notNull().default('baik'), // 'baik' | 'rusak_ringan' | 'rusak_berat'
  status: text('status').notNull().default('tersedia'), // 'tersedia' | 'dipinjam' | 'maintenance' | 'kedaluwarsa'
  seatsTotal: integer('seats_total').notNull().default(1),
  seatsAvailable: integer('seats_available').notNull().default(1),
  expiryDate: text('expiry_date'),
  imageUrl: text('image_url').notNull(),
  qrPayload: text('qr_payload').notNull(),
  deletedAt: text('deleted_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const loans = pgTable('loans', {
  id: serial('id').primaryKey(),
  loanCode: text('loan_code').notNull().unique(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  itemId: integer('item_id')
    .references(() => items.id)
    .notNull(),
  borrowDate: text('borrow_date').notNull(), // YYYY-MM-DD
  dueDate: text('due_date').notNull(), // YYYY-MM-DD
  purpose: text('purpose').notNull(),
  status: text('status').notNull().default('menunggu'), // 'menunggu' | 'disetujui' | 'ditolak' | 'dipinjam' | 'dikembalikan' | 'terlambat' | 'dibatalkan'
  approvedBy: integer('approved_by'),
  approvedAt: text('approved_at'),
  rejectionReason: text('rejection_reason'),
  extendedCount: integer('extended_count').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

export const returns = pgTable('returns', {
  id: serial('id').primaryKey(),
  loanId: integer('loan_id')
    .references(() => loans.id)
    .notNull(),
  returnedAt: text('returned_at').notNull(), // YYYY-MM-DD
  processedBy: integer('processed_by'),
  conditionAfter: text('condition_after').notNull().default('baik'), // 'baik' | 'rusak_ringan' | 'rusak_berat'
  lateDays: integer('late_days').notNull().default(0),
  fineAmount: integer('fine_amount').notNull().default(0),
  finePaid: boolean('fine_paid').notNull().default(false),
  damageNotes: text('damage_notes').notNull().default(''),
  createdAt: timestamp('created_at').defaultNow(),
});

export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id'),
  userName: text('user_name').notNull(),
  userRole: text('user_role').notNull(),
  action: text('action').notNull(),
  module: text('module').notNull(),
  description: text('description').notNull(),
  ipAddress: text('ip_address').notNull().default('10.24.0.12'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').notNull().default('info'), // 'info' | 'success' | 'warning' | 'danger'
  isRead: boolean('is_read').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const settings = pgTable('settings', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  loans: many(loans),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  items: many(items),
}));

export const itemsRelations = relations(items, ({ one, many }) => ({
  category: one(categories, {
    fields: [items.categoryId],
    references: [categories.id],
  }),
  loans: many(loans),
}));

export const loansRelations = relations(loans, ({ one, many }) => ({
  user: one(users, {
    fields: [loans.userId],
    references: [users.id],
  }),
  item: one(items, {
    fields: [loans.itemId],
    references: [items.id],
  }),
  returns: many(returns),
}));

export const returnsRelations = relations(returns, ({ one }) => ({
  loan: one(loans, {
    fields: [returns.loanId],
    references: [loans.id],
  }),
}));
