// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

// This shows the HTML page in "ui.html".
figma.showUI(__html__);
// set size of gui to 400/400
figma.ui.resize(320, 300)

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage =  async(msg: {type: string, count: number}) => {
    const collection = figma.variables.createVariableCollection("Max Dynamic Colors")
    collection.renameMode(collection.modes[0].modeId, "Default")
    const id = collection.modes[0].modeId
    
    if (msg.type === 'send-colors') {
        const liveColors = msg.colors.colors.filter((color, index, self) => {
            return (
                color.category === "Live" && 
                color.visibility === "essential" &&
                index === self.findIndex((t) => (
                    t.label === color.label
                ))
            )
        })

        liveColors.forEach(color => {
            const safeLabel = color.label.replace('/', 'or')
            const figmaColor = figma.variables.createVariable(safeLabel, collection, "COLOR")
            const [r, g, b, a] = color.oncolor
            figmaColor.setValueForMode(id, {r, g, b, a})
        })
    }
    figma.closePlugin();
};

function addPaintStyle(name: string, color: string) {
    const colorStyle = figma.createPaintStyle();
    colorStyle.name = name;
    
    let figmaColor, opacity;
    if (color.startsWith('#')) {
        // NOTE: If the color is in HEX format
        figmaColor = {
            r: parseInt(color.substring(1, 3), 16) / 255,
            g: parseInt(color.substring(3, 5), 16) / 255,
            b: parseInt(color.substring(5, 7), 16) / 255,
        };
        opacity = 1;
    } else if (color.startsWith('rgba')) {
        // NOTE: If the color is in RGBA format
        const { r, g, b, a } = rgbaToFigmaColor(color);
        figmaColor = { r, g, b };
        opacity = a;
    } else {
        throw new Error(`Unsupported color format: ${color}`);
    }
    
    colorStyle.paints = [
        {
            type: 'SOLID',
            color: figmaColor,
            opacity: opacity,
        },
    ];
}

function rgbaToFigmaColor(rgba: string) {
    const rgbaValues = rgba
    .substring(5, rgba.length - 1)
    .split(',')
    .map((value) => parseFloat(value.trim()));
    
    return {
        r: rgbaValues[0] / 255,
        g: rgbaValues[1] / 255,
        b: rgbaValues[2] / 255,
        a: rgbaValues.length === 4 ? rgbaValues[3] : 1,
    };
}
