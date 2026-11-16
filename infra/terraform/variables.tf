variable "project_id" {
  type    = string
  default = "da-minh-go-vap"
}

variable "region" {
  type    = string
  default = "asia-southeast1"
}

variable "production_url" {
  type    = string
  default = "https://dongdaminhgovap.org/"
}

variable "db_backup_image" {
  description = "Image for the db-backup Cloud Run Job, built from docker/db-backup."
  type        = string
  default     = "asia-southeast1-docker.pkg.dev/da-minh-go-vap/db-backup/db-backup:latest"
}
