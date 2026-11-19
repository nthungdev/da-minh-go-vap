# Runtime config (env, scaling) lives in apphosting*.yaml, not here.
# The Cloud Run services and the firebaseapphosting-images repository are managed by App Hosting itself.

locals {
  app_hosting_compute_roles = toset([
    "roles/developerconnect.readTokenAccessor",
    "roles/firebase.sdkAdminServiceAgent",
    "roles/firebaseapphosting.computeRunner",
  ])
  github_repository = "projects/${var.project_id}/locations/${var.region}/connections/apphosting-github-conn-b7ro1rt/gitRepositoryLinks/nthungdev-da-minh-go-vap"
}

resource "google_firebase_app_hosting_backend" "production" {
  backend_id       = "da-minh-go-vap"
  location         = var.region
  app_id           = "1:209549284638:web:1f2b8db0bf41a423eee50f"
  environment      = "production"
  serving_locality = "GLOBAL_ACCESS"
  service_account  = trimprefix(local.app_hosting_compute_sa, "serviceAccount:")

  codebase {
    repository     = local.github_repository
    root_directory = "/"
  }

  lifecycle {
    prevent_destroy = true
  }
}

resource "google_firebase_app_hosting_backend" "staging" {
  backend_id       = "da-minh-go-vap-staging"
  location         = var.region
  app_id           = "" # Staging has no linked Firebase web app.
  environment      = "staging"
  serving_locality = "GLOBAL_ACCESS"
  service_account  = trimprefix(local.app_hosting_compute_sa, "serviceAccount:")

  codebase {
    repository     = local.github_repository
    root_directory = "/"
  }

  lifecycle {
    prevent_destroy = true
  }
}

# Production rolls out manually; staging auto-deploys from main.
resource "google_firebase_app_hosting_traffic" "production" {
  backend  = google_firebase_app_hosting_backend.production.backend_id
  location = var.region

  rollout_policy {
    codebase_branch = "main"
    disabled        = true
  }
}

resource "google_firebase_app_hosting_traffic" "staging" {
  backend  = google_firebase_app_hosting_backend.staging.backend_id
  location = var.region

  rollout_policy {
    codebase_branch = "main"
  }
}

resource "google_firebase_app_hosting_domain" "production" {
  backend   = google_firebase_app_hosting_backend.production.backend_id
  location  = var.region
  domain_id = "dongdaminhgovap.org"

  lifecycle {
    prevent_destroy = true
  }
}

resource "google_firebase_app_hosting_domain" "staging" {
  backend   = google_firebase_app_hosting_backend.staging.backend_id
  location  = var.region
  domain_id = "staging.dongdaminhgovap.org"

  lifecycle {
    prevent_destroy = true
  }
}

resource "google_project_iam_member" "app_hosting_compute" {
  for_each = local.app_hosting_compute_roles

  project = var.project_id
  role    = each.value
  member  = local.app_hosting_compute_sa
}
