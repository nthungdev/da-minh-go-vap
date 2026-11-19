locals {
  apis = toset([
    "artifactregistry.googleapis.com",
    "cloudscheduler.googleapis.com",
    "developerconnect.googleapis.com",
    "firebaseapphosting.googleapis.com",
    "run.googleapis.com",
    "secretmanager.googleapis.com",
  ])
}

resource "google_project_service" "this" {
  for_each = local.apis

  service            = each.value
  disable_on_destroy = false
}
