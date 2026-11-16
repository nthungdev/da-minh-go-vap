# Terraform

Manages GCP infrastructure for project `da-minh-go-vap` that is not covered by `apphosting*.yaml`.

| File           | Resource                                                                      |
| -------------- | ----------------------------------------------------------------------------- |
| `keep_warm.tf` | Cloud Scheduler job `keep-warm-production` (pings production every 5 minutes) |

## Prerequisites

- Terraform >= 1.7
- `gcloud auth application-default login`, with access to `da-minh-go-vap`

## First-time setup

State lives in GCS. Create the bucket once:

```sh
gcloud storage buckets create gs://da-minh-go-vap-tfstate \
  --project=da-minh-go-vap --location=asia-southeast1 \
  --uniform-bucket-level-access --public-access-prevention
gcloud storage buckets update gs://da-minh-go-vap-tfstate --versioning
```

## Usage

```sh
cd infra/terraform
terraform init
terraform plan
terraform apply
```

The first apply imports the existing `keep-warm-production` job (the `import` block in `keep_warm.tf`) and changes nothing. Remove the `import` block afterwards.

## Notes

- Do not set `http_target.headers.User-Agent`: Cloud Scheduler sets it itself and the provider reports permanent drift.
- `db-backup-daily` is not managed here yet.
