# Adopts resources originally created by hand (gcloud / Firebase console).
# Delete this file once `terraform apply` has imported everything.

locals {
  p = "projects/${var.project_id}"
  l = "projects/${var.project_id}/locations/${var.region}"
}

import {
  for_each = local.apis
  to       = google_project_service.this[each.value]
  id       = "${var.project_id}/${each.value}"
}

import {
  for_each = setunion(local.app_hosting_secrets, local.db_backup_secrets)
  to       = google_secret_manager_secret.this[each.value]
  id       = "${local.p}/secrets/${each.value}"
}

import {
  for_each = local.app_hosting_secret_grants
  to       = google_secret_manager_secret_iam_member.app_hosting[each.key]
  id       = "${local.p}/secrets/${each.value.secret} ${each.value.role} ${each.value.member}"
}

import {
  for_each = local.db_backup_secrets
  to       = google_secret_manager_secret_iam_member.db_backup[each.value]
  id       = "${local.p}/secrets/${each.value} roles/secretmanager.secretAccessor serviceAccount:db-backup@${var.project_id}.iam.gserviceaccount.com"
}

import {
  to = google_firebase_app_hosting_backend.production
  id = "${local.l}/backends/da-minh-go-vap"
}

import {
  to = google_firebase_app_hosting_backend.staging
  id = "${local.l}/backends/da-minh-go-vap-staging"
}

import {
  to = google_firebase_app_hosting_traffic.production
  id = "${local.l}/backends/da-minh-go-vap/traffic"
}

import {
  to = google_firebase_app_hosting_traffic.staging
  id = "${local.l}/backends/da-minh-go-vap-staging/traffic"
}

import {
  to = google_firebase_app_hosting_domain.production
  id = "${local.l}/backends/da-minh-go-vap/domains/dongdaminhgovap.org"
}

import {
  to = google_firebase_app_hosting_domain.staging
  id = "${local.l}/backends/da-minh-go-vap-staging/domains/staging.dongdaminhgovap.org"
}

import {
  for_each = local.app_hosting_compute_roles
  to       = google_project_iam_member.app_hosting_compute[each.key]
  id       = "${var.project_id} ${each.key} ${local.app_hosting_compute_sa}"
}

import {
  to = google_service_account.db_backup
  id = "${local.p}/serviceAccounts/db-backup@${var.project_id}.iam.gserviceaccount.com"
}

import {
  to = google_artifact_registry_repository.db_backup
  id = "${local.l}/repositories/db-backup"
}

import {
  to = google_cloud_run_v2_job.db_backup
  id = "${local.l}/jobs/db-backup"
}

import {
  to = google_cloud_run_v2_job_iam_member.db_backup_invoker
  id = "${local.l}/jobs/db-backup roles/run.invoker serviceAccount:db-backup@${var.project_id}.iam.gserviceaccount.com"
}

import {
  to = google_cloud_scheduler_job.db_backup_daily
  id = "${local.l}/jobs/db-backup-daily"
}

import {
  to = google_cloud_scheduler_job.keep_warm_production
  id = "${local.l}/jobs/keep-warm-production"
}
