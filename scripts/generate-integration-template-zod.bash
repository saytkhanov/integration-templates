#!/bin/bash

pushd () {
    command pushd "$@" > /dev/null
}

popd () {
    command popd "$@" > /dev/null
}

# if no npm_config_integrations then throw an error
if [ -z "$npm_config_integration" ]; then
    echo "npm_config_integration must be set"
    exit 1
fi

integrations=("$npm_config_integration/")

cd integrations

for d in "${integrations[@]}" ; do
    integration=$(echo $d | sed 's/\///g')

    # Check if the integration directory exists (in case of single integration)
    if [ ! -d "$integration" ]; then
        echo "Integration directory $integration does not exist. Skipping..."
        continue
    fi

    mkdir -p "$integration/nango-integrations/$integration"

    # Copy everything except the nango-integrations directory
    rsync -av --exclude='nango-integrations' "$integration/" "$integration/nango-integrations/$integration" --quiet

    pushd "$integration/nango-integrations"

    mv "$integration/nango.yaml" .

    npx nango generate && npx ts-to-zod .nango/schema.ts $integration/schema.zod.ts

    popd

    # Delete everything except the nango-integrations directory
    find "$integration"/* -maxdepth 0 -name 'nango-integrations' -prune -o -exec rm -rf {} +
done
