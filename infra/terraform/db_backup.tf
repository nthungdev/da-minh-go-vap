# Daily mongodump of production to R2. Image source: docker/db-backup.

resource "google_service_account" "db_backup" {
  account_id   = "db-backup"
  display_name = "Database Backup Job"
}

resource "google_artifact_registry_repository" "db_backup" {
  repository_id = "db-backup"
  location      = var.region
  format        = "DOCKER"
  description   = "Database backup job images"

  depends_on = [google_project_service.this]
}

resource "google_cloud_run_v2_job" "db_backup" {
  name     = "db-backup"
  location = var.region

  template {
    task_count = 1

    template {
      service_account       = google_service_account.db_backup.email
      timeout               = "600s"
      max_retries           = 1
      execution_environment = "EXECUTION_ENVIRONMENT_GEN2"

      containers {
        image = var.db_backup_image

        resources {
          limits = {
            cpu    = "1000m"
            memory = "512Mi"
          }
        }

        env {
          name  = "R2_ENDPOINT"
          value = "https://e1f0f771e8517f9b38e89867592e826a.r2.cloudflarestorage.com"
        }
        env {
          name  = "R2_BUCKET"
          value = "daminhgovap-db-backups"
        }
        env {
          name  = "BACKUP_PREFIX"
          value = "production"
        }

        dynamic "env" {
          for_each = {
            DATABASE_URI         = "production-backup-database-uri"
            R2_ACCESS_KEY_ID     = "db-backup-r2-access-key-id"
            R2_SECRET_ACCESS_KEY = "db-backup-r2-secret"
          }
          content {
            name = env.key
            value_source {
              secret_key_ref {
                secret  = google_secret_manager_secret.this[env.value].secret_id
                version = "latest"
              }
            }
          }
        }
      }
    }
  }

  # Set by gcloud on creation; irrelevant to behavior.
  lifecycle {
    ignore_changes = [client, client_version]
  }

  depends_on = [google_secret_manager_secret_iam_member.db_backup]
}

# Scheduler calls the job's :run endpoint as the job's own service account.
resource "google_cloud_run_v2_job_iam_member" "db_backup_invoker" {
  name     = google_cloud_run_v2_job.db_backup.name
  location = var.region
  role     = "roles/run.invoker"
  member   = google_service_account.db_backup.member
}

resource "google_cloud_scheduler_job" "db_backup_daily" {
  name             = "db-backup-daily"
  region           = var.region
  schedule         = "0 3 * * *"
  time_zone        = "Asia/Ho_Chi_Minh"
  attempt_deadline = "180s"

  retry_config {
    min_backoff_duration = "5s"
    max_backoff_duration = "3600s"
    max_doublings        = 5
    max_retry_duration   = "0s"
  }

  http_target {
    http_method = "POST"
    uri         = "https://run.googleapis.com/v2/projects/${var.project_id}/locations/${var.region}/jobs/${google_cloud_run_v2_job.db_backup.name}:run"

    oauth_token {
      service_account_email = google_service_account.db_backup.email
      scope                 = "https://www.googleapis.com/auth/cloud-platform"
    }
  }
}
