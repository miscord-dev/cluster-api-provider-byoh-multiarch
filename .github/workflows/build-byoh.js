module.exports = async () => {
    const byohVersion = 
        `${process.env.GITHUB_REF}`.match(/(v\d+\.\d+\.\d+)/)[0] ?? 
        "v0.3.1";

    const byohDir = `./byoh`;

    await $`git clone https://github.com/vmware-tanzu/cluster-api-provider-bringyourownhost.git -b ${byohVersion} --depth=1 ${byohDir}`

    await $`cp metadata.yaml ./${byohDir}/metadata.yaml`
    await $`cd ${byohDir} && IMG="ghcr.io/miscord-win/cluster-api-byoh-controller:${byohVersion}" make build-release-artifacts`

    await $`cat << EOF >> ./${byohDir}/Makefile

host-agent-binaries-arm64: ## Builds the binaries for the host-agent
\tRELEASE_BINARY=./byoh-hostagent GOOS=linux GOARCH=arm64 GOLDFLAGS="\\$(LDFLAGS) \\$(STATIC)" \\
\tHOST_AGENT_DIR=./\\$(HOST_AGENT_DIR) \\$(MAKE) host-agent-binary
EOF`
    await $`cat ${byohDir}/Makefile`
    await $`cd ${byohDir} && make host-agent-binaries-arm64 && cp bin/byoh-hostagent* ./_dist`

    await $`ls ${byohDir}/_dist`
}