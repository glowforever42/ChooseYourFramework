// This file is a collection of annoying hacks to get the deployed site working.
// Eventually this will all be handled by shenanigans-manager:
// https://github.com/FullScreenShenanigans/EightBittr/tree/main/packages/shenanigans-manager
//
// Most importantly, it fixes up node_modules import paths.
// It also minifies CSS+HTML and tweaks some visuals.

const minifyCss = require("cssmin");
const fs = require("fs-extra");
const { minify: minifyHtml } = require("html-minifier");
const path = require("path");

const distDir = path.join(__dirname, "dist");
const indexCssPath = path.join(distDir, "index.css");
const indexHtmlPath = path.join(distDir, "index.html");

// 1. Mess with dist/index.html...
fs.writeFileSync(
    indexHtmlPath,
    minifyHtml(fs.readFileSync(indexHtmlPath).toString(), {
        collapseWhitespace: true,
    })
        // Replace "../node_modules/"" paths with "./" in index.html
        .replaceAll("../node_modules/", "./")
        // Mess with dist/index.html: improve the messaging a bit
        .replace(
            `<section id="explanation" class="section-text"></section>`,
            `<section id="explanation" class="section-text">
    Have you ever felt choosing a modern JavaScript UI framework was a lot like picking a starter Pokemon?
    <br />
    Most of us don't deeply understand how they compare.
    We pick one and spend the next few years convinced it was the best choice.
</section>
`
        )
        .replaceAll("ChooseYourFramework,", "Choose Your Framework,")
        .replaceAll(">ChooseYourFramework<", ">Choose Your Framework<")
        // Use the minified require.js, pending shenanigans-manager adding that
        .replaceAll("requirejs/require.js", "requirejs/require.min.js")
        // Get rid of the pesky extra spaces, too...
        // (I'm really counting the kB here - at this point it was 251...!)
        .replaceAll("    ", "")
);

// 3. Mess with dist/index.css...
fs.writeFileSync(
    indexCssPath,
    minifyCss(
        fs
            .readFileSync(indexCssPath)
            .toString()
            // Fix game height, pending shenanigans-manager settings
            .replace(`210px`, `515px`) +
            // Fix responsive header height, pending shenanigans-manager settings
            `
        header {
            height: 3.5rem;
        }
        
        @media (min-width: 688px) {
            header {
                height: 1.5rem;
            }
        }
        `
    )
);

// 4. Copy required node_modules/* packages into dist/
const nodeModulesToCopy = ["requirejs", "preact"];

for (const packageName of nodeModulesToCopy) {
    const source = path.join(__dirname, "node_modules", packageName);
    const destination = path.join(distDir, packageName);
    console.log("Will attempt to copy", source, "to", destination);

    fs.copySync(source, destination, {
        filter: (src) => !src.includes(".bin"),
    });
}
