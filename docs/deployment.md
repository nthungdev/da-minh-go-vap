# Deployment

The app runs on Firebase App Hosting in project `da-minh-go-vap`, region `asia-southeast1`. MongoDB runs on MongoDB Atlas M0 (`SOUTHEASTERN_ASIA_PACIFIC`, projects `dmgv-production` and `dmgv-staging`) over TLS (`mongodb+srv://`).

|                   | Production                                | Staging                                                   |
| ----------------- | ----------------------------------------- | --------------------------------------------------------- |
| Backend           | `da-minh-go-vap`                          | `da-minh-go-vap-staging`                                  |
| Environment name  | `production`                              | `staging`                                                 |
| Config file       | `apphosting.production.yaml`              | `apphosting.staging.yaml`                                 |
| Domain            | https://dongdaminhgovap.org               | https://staging.dongdaminhgovap.org                       |
| Rollouts          | Manual (auto-rollout disabled)            | Auto-rollout from `main`                                  |
| Database          | `da-minh-go-vap` as user `app-production` | `da-minh-go-vap-staging` as user `app-staging`            |
| Media bucket (R2) | `daminhgovap` → `cdn.dongdaminhgovap.org` | `daminhgovap-staging` → `cdn-staging.dongdaminhgovap.org` |
| Analytics         | On                                        | Off                                                       |
| Search indexing   | Allowed                                   | Blocked (`SITE_NOINDEX=true`)                             |

`apphosting.yaml` holds shared settings. Each backend's environment name selects the `apphosting.<environment>.yaml` that overrides it. Do not set environment variables in the Firebase console: console values override the files.

## Releasing to production

Staging deploys every push to `main`. After verifying staging, promote the same commit:

```sh
firebase apphosting:rollouts:create da-minh-go-vap --git-commit <sha> --project da-minh-go-vap
```

Roll back by creating a rollout from the previous good commit.

## Secrets

Credentials live in Cloud Secret Manager and are referenced by name from the YAML files (`staging-*`, `production-*`, plus shared `payload-admin-email`). Both backends run as `firebase-app-hosting-compute@da-minh-go-vap.iam.gserviceaccount.com`.

Add or rotate a secret:

```sh
firebase apphosting:secrets:set <name> --project da-minh-go-vap
firebase apphosting:secrets:grantaccess <name> --backend <backend> --location asia-southeast1 --project da-minh-go-vap
```

Then roll out the backend so the new version is picked up.

- R2 credentials are account-owned Cloudflare API tokens (`app-hosting-staging-r2`, `app-hosting-production-r2`), each scoped to one bucket. The S3 access key ID is the token ID; the secret is the SHA-256 of the token value.
- Rotating `production-payload-secret` logs out all admin sessions.
- `production-auth-password` is the shared password for `/auth/basic` private pages; rotating it locks out everyone who uses it.

## DNS (Cloudflare)

- `dongdaminhgovap.org` and `staging.dongdaminhgovap.org`: A record to App Hosting, **DNS-only**. App Hosting verifies these records continuously and renews its certificate through the `_acme-challenge_*` CNAME records; proxying them breaks that.
- `cdn` and `cdn-staging`: R2 custom domains, proxied. `/cdn-cgi/image` resizing needs the proxy.

## Keep-warm

Both backends scale to zero. Cloud Scheduler job `keep-warm-production` (`asia-southeast1`) requests `https://dongdaminhgovap.org/` every 5 minutes.

## Database backups

A Cloud Run Job (`db-backup`, `asia-southeast1`, running as `db-backup@da-minh-go-vap.iam.gserviceaccount.com`) dumps the production database with `mongodump --archive --gzip` and uploads to R2 bucket `daminhgovap-db-backups` (30-day lifecycle retention).

- **Image**: [docker/db-backup/Dockerfile](file:///Users/hung/orca/workspaces/da-minh-go-vap/migration-phase-2/docker/db-backup/Dockerfile) and [docker/db-backup/backup.sh](file:///Users/hung/orca/workspaces/da-minh-go-vap/migration-phase-2/docker/db-backup/backup.sh).
- **Schedule**: Cloud Scheduler triggers `db-backup` daily at `03:00` `Asia/Ho_Chi_Minh`.
- **Secrets**: `production-backup-database-uri` (Atlas `backup-readonly` user, `read` on `da-minh-go-vap`), `db-backup-r2-access-key-id`, `db-backup-r2-secret`.
- **Verify migration counts**: `pnpm db:verify "<source-uri>" "<target-uri>"` ([scripts/db-verify-counts.sh](file:///Users/hung/orca/workspaces/da-minh-go-vap/migration-phase-2/scripts/db-verify-counts.sh)).
