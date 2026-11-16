# Terraform

GCP infrastructure for project `da-minh-go-vap`. App runtime config (env vars, scaling) stays in `apphosting*.yaml`.

| File             | Resources                                                                                            |
| ---------------- | ---------------------------------------------------------------------------------------------------- |
| `apis.tf`        | Enabled APIs the stack depends on                                                                    |
| `app_hosting.tf` | App Hosting backends (production, staging), rollout policy, custom domains, compute SA project roles |
| `secrets.tf`     | Secret Manager secrets (containers only) and access grants                                           |
| `db_backup.tf`   | `db-backup` service account, Artifact Registry repo, Cloud Run Job, daily Cloud Scheduler trigger    |
| `keep_warm.tf`   | Cloud Scheduler job `keep-warm-production`                                                           |

## Not managed here

- **Secret values.** Add with `firebase apphosting:secrets:set` or `gcloud secrets versions add`, so values never enter state.
- **Resources App Hosting manages itself**: its Cloud Run services and the `firebaseapphosting-images` repository.
- **Developer Connect GitHub connection** (`apphosting-github-conn-b7ro1rt`): holds OAuth credentials; created through the Firebase console.
- **The `db-backup` image.** Built and pushed from `docker/db-backup`; the job runs the `:latest` tag.
- **Cloudflare** (DNS, R2 buckets, R2 custom domains): not yet migrated.
- **The state bucket** itself (chicken-and-egg).

## Prerequisites

- Terraform >= 1.7
- `gcloud auth application-default login`, with Owner on `da-minh-go-vap`

## Usage

State is in `gs://da-minh-go-vap-tfstate` (versioned, created by hand on 2026-11-16).

```sh
cd infra/terraform
terraform init
terraform plan
terraform apply
```

Resources were created by hand and adopted with `import` blocks on 2026-11-16 (see git history). To adopt another existing resource, add an `import` block, apply, then remove it.

## Notes

- Backends, domains and secrets have `prevent_destroy`. It does not apply if the resource block or `for_each` key is removed: to retire one on purpose, use a `removed { lifecycle { destroy = false } }` block or `terraform state rm`.
- Do not set `http_target.headers.User-Agent` on scheduler jobs: Cloud Scheduler sets it itself and the provider reports permanent drift.
- `firebase apphosting:secrets:grantaccess` creates the same grants as `secrets.tf`. For a new secret, add it to `local.app_hosting_secrets` instead.
