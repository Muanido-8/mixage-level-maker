const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
    transpileDependencies: true,
    pluginOptions: {
        electronBuilder: {
            builderOptions: {
                productName: "Blox Level Maker",
                appId: 'mixage.level.maker',
                win: {
                    "target": [
                        "nsis"
                    ],
                    icon: 'public/favicon.png'
                },
                "nsis": {
                    "installerIcon": "public/favicon.ico",
                    "uninstallerIcon": "public/favicon.ico",
                }
            },
        }
    }
})
