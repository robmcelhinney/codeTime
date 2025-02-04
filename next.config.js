/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "export", // Enables static site generation for GitHub Pages
    basePath: "/codeTime",
    assetPrefix: "/codeTime/",
    images: {
        unoptimized: true, // Needed for static site exports
    },
}

module.exports = nextConfig
