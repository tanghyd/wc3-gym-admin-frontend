# Deploy commands for the admin frontend. The image is built by the "Staging image" workflow on
# every push to main and pushed to GHCR; the recipes here inspect that result, pin the Azure
# staging box to a tag, and build locally only when the workflow has not produced the image.
# The box itself belongs to the backend repo (`just terraform`, `just azure` there). Put its host
# in .env.local (gitignored): AZURE_STAGING_HOST=<`just terraform output fqdn` in the backend repo>.

set shell := ["bash", "-euo", "pipefail", "-c"]
set dotenv-filename := ".env.local"

registry_image := "ghcr.io/tanghyd/gnl-admin-frontend"
host := env("AZURE_STAGING_HOST", "")
box := "azureuser@" + host

default:
    @just --list

# Fail with the fix when the host is not set.
_host:
    @[ -n "{{ host }}" ] || { echo "set AZURE_STAGING_HOST in .env.local: just terraform output fqdn, in the backend repo" >&2; exit 1; }

# List the tags published on GHCR.
tags:
    #!/usr/bin/env bash
    set -euo pipefail
    token=$(curl -fsS "https://ghcr.io/token?scope=repository:tanghyd/gnl-admin-frontend:pull&service=ghcr.io" \
        | node -p 'JSON.parse(require("fs").readFileSync(0)).token')
    curl -fsS -H "Authorization: Bearer $token" "https://ghcr.io/v2/tanghyd/gnl-admin-frontend/tags/list" \
        | node -p 'JSON.parse(require("fs").readFileSync(0)).tags.join("\n")'

# Fail unless the tag can be pulled anonymously. This is what the box does at deploy.
check-image-exists tag="staging":
    #!/usr/bin/env bash
    set -euo pipefail
    token=$(curl -fsS "https://ghcr.io/token?scope=repository:tanghyd/gnl-admin-frontend:pull&service=ghcr.io" \
        | node -p 'JSON.parse(require("fs").readFileSync(0)).token')
    code=$(curl -fsS -o /dev/null -w '%{http_code}' -H "Authorization: Bearer $token" \
        -H 'Accept: application/vnd.oci.image.index.v1+json,application/vnd.docker.distribution.manifest.v2+json,application/vnd.oci.image.manifest.v1+json' \
        "https://ghcr.io/v2/tanghyd/gnl-admin-frontend/manifests/{{ tag }}")
    [ "$code" = "200" ] || { echo "{{ registry_image }}:{{ tag }} is not anonymously pullable (HTTP $code)" >&2; exit 1; }
    echo "{{ registry_image }}:{{ tag }} is pullable"

# Print the sha tag main builds to, for pinning or rollback.
current-tag:
    @git fetch origin --quiet && echo "sha-$(git rev-parse --short=8 origin/main)"

# Build the image locally, tagged with the commit and with staging.
build-image:
    docker build -t "{{ registry_image }}:sha-$(git rev-parse --short=8 HEAD)" -t "{{ registry_image }}:staging" .

# Push a locally built image. Needs a token with write:packages.
upload-image:
    gh auth token | docker login ghcr.io -u tanghyd --password-stdin
    docker push "{{ registry_image }}:sha-$(git rev-parse --short=8 HEAD)"
    docker push "{{ registry_image }}:staging"

# Run the "Staging image" workflow and wait for it. Use after a merge if you do not want to wait.
ci:
    #!/usr/bin/env bash
    set -euo pipefail
    gh workflow run staging-image.yml
    sleep 5
    run=$(gh run list --workflow=staging-image.yml --limit 1 --json databaseId --jq '.[0].databaseId')
    gh run watch "$run" --exit-status

# Pin the box to a published image tag and restart the frontend. The backend line in /opt/gnl/.env is left alone.
deploy tag="staging": _host (check-image-exists tag)
    #!/usr/bin/env bash
    set -euo pipefail
    image="{{ registry_image }}:{{ tag }}"
    ssh {{ box }} bash -s <<REMOTE
    set -euo pipefail
    cd /opt/gnl
    sudo touch .env
    grep -q '^FRONTEND_IMAGE=' .env && sudo sed -i 's#^FRONTEND_IMAGE=.*#FRONTEND_IMAGE=$image#' .env \
        || echo 'FRONTEND_IMAGE=$image' | sudo tee -a .env >/dev/null
    sudo docker compose config | grep -q "image: $image" \
        || { echo 'compose.yaml does not read FRONTEND_IMAGE from .env; run: just azure sync, in the backend repo' >&2; exit 1; }
    sudo docker compose pull -q frontend && sudo docker compose up -d frontend
    sudo docker image prune -f >/dev/null
    REMOTE
    for _ in $(seq 1 30); do
        curl -fsS -o /dev/null "http://{{ host }}/" 2>/dev/null && break
        sleep 3
    done
    curl -fsS -o /dev/null -w 'dashboard http://{{ host }} %{http_code}\n' "http://{{ host }}/"

# Show the pinned image and the frontend container.
status: _host
    @echo "dashboard http://{{ host }}"
    ssh {{ box }} 'grep ^FRONTEND_IMAGE /opt/gnl/.env; cd /opt/gnl && sudo docker compose ps frontend'

# Follow the frontend log on the box.
logs: _host
    ssh -t {{ box }} "cd /opt/gnl && sudo docker compose logs -f --tail=200 frontend"
