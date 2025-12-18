-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "metrics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "unit" TEXT DEFAULT '',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "user_id" TEXT NOT NULL,
    CONSTRAINT "metrics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "metric_values" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "value" REAL NOT NULL,
    "recorded_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metric_id" TEXT NOT NULL,
    CONSTRAINT "metric_values_metric_id_fkey" FOREIGN KEY ("metric_id") REFERENCES "metrics" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "alert_rules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "operator" TEXT NOT NULL,
    "threshold" REAL NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "metric_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    CONSTRAINT "alert_rules_metric_id_fkey" FOREIGN KEY ("metric_id") REFERENCES "metrics" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "alert_rules_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "alert_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "metric_value" REAL NOT NULL,
    "triggered_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alert_rule_id" TEXT NOT NULL,
    CONSTRAINT "alert_events_alert_rule_id_fkey" FOREIGN KEY ("alert_rule_id") REFERENCES "alert_rules" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "metrics_user_id_idx" ON "metrics"("user_id");

-- CreateIndex
CREATE INDEX "metrics_name_idx" ON "metrics"("name");

-- CreateIndex
CREATE UNIQUE INDEX "metrics_user_id_name_key" ON "metrics"("user_id", "name");

-- CreateIndex
CREATE INDEX "metric_values_metric_id_recorded_at_idx" ON "metric_values"("metric_id", "recorded_at" DESC);

-- CreateIndex
CREATE INDEX "metric_values_recorded_at_idx" ON "metric_values"("recorded_at" DESC);

-- CreateIndex
CREATE INDEX "alert_rules_metric_id_idx" ON "alert_rules"("metric_id");

-- CreateIndex
CREATE INDEX "alert_rules_user_id_idx" ON "alert_rules"("user_id");

-- CreateIndex
CREATE INDEX "alert_rules_is_active_idx" ON "alert_rules"("is_active");

-- CreateIndex
CREATE INDEX "alert_events_alert_rule_id_triggered_at_idx" ON "alert_events"("alert_rule_id", "triggered_at" DESC);

-- CreateIndex
CREATE INDEX "alert_events_triggered_at_idx" ON "alert_events"("triggered_at" DESC);
