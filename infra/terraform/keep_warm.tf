# Production backend scales to zero (apphosting.yaml minInstances: 0); this ping reduces cold starts.
resource "google_cloud_scheduler_job" "keep_warm_production" {
  name             = "keep-warm-production"
  description      = "Keep App Hosting production instance warm"
  region           = var.region
  schedule         = "*/5 * * * *"
  time_zone        = "Etc/UTC"
  attempt_deadline = "30s"

  retry_config {
    min_backoff_duration = "5s"
    max_backoff_duration = "3600s"
    max_doublings        = 5
    max_retry_duration   = "0s"
  }

  http_target {
    http_method = "GET"
    uri         = var.production_url
  }
}
