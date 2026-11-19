# Secret containers and access only. Values are added out of band
# (`firebase apphosting:secrets:set` / `gcloud secrets versions add`) so they never land in state.

locals {
  app_hosting_compute_sa = "serviceAccount:firebase-app-hosting-compute@${var.project_id}.iam.gserviceaccount.com"
  app_hosting_agent      = "serviceAccount:service-${data.google_project.this.number}@gcp-sa-firebaseapphosting.iam.gserviceaccount.com"

  app_hosting_secrets = toset([
    "payload-admin-email",
    "production-auth-password",
    "production-database-uri",
    "production-payload-admin-password",
    "production-payload-secret",
    "production-s3-access-key-id",
    "production-s3-secret",
    "staging-auth-password",
    "staging-database-uri",
    "staging-payload-admin-password",
    "staging-payload-secret",
    "staging-s3-access-key-id",
    "staging-s3-secret",
  ])

  db_backup_secrets = toset([
    "db-backup-r2-access-key-id",
    "db-backup-r2-secret",
    "production-backup-database-uri",
  ])

  # Same grants `firebase apphosting:secrets:grantaccess` creates.
  app_hosting_secret_grants = merge([
    for s in local.app_hosting_secrets : {
      "${s}/accessor"       = { secret = s, role = "roles/secretmanager.secretAccessor", member = local.app_hosting_compute_sa }
      "${s}/viewer"         = { secret = s, role = "roles/secretmanager.viewer", member = local.app_hosting_compute_sa }
      "${s}/versionManager" = { secret = s, role = "roles/secretmanager.secretVersionManager", member = local.app_hosting_agent }
    }
  ]...)
}

data "google_project" "this" {}

resource "google_secret_manager_secret" "this" {
  for_each = setunion(local.app_hosting_secrets, local.db_backup_secrets)

  secret_id = each.value

  replication {
    auto {}
  }

  # Deleting a secret destroys every version, and values are not in Terraform.
  lifecycle {
    prevent_destroy = true
  }

  depends_on = [google_project_service.this]
}

resource "google_secret_manager_secret_iam_member" "app_hosting" {
  for_each = local.app_hosting_secret_grants

  secret_id = google_secret_manager_secret.this[each.value.secret].id
  role      = each.value.role
  member    = each.value.member
}

resource "google_secret_manager_secret_iam_member" "db_backup" {
  for_each = local.db_backup_secrets

  secret_id = google_secret_manager_secret.this[each.value].id
  role      = "roles/secretmanager.secretAccessor"
  member    = google_service_account.db_backup.member
}
