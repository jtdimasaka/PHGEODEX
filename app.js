// =========================================================
// PMTILES PROTOCOL
// =========================================================
const protocol = new pmtiles.Protocol();
maplibregl.addProtocol("pmtiles", protocol.tile);
// =========================================================
// PMTILES URLS
// =========================================================
const regiUrl =
    "https://phgeodex-data.dimasakajoshua.workers.dev/2020regTaxonomy.pmtiles";
const prvUrl =
    "https://phgeodex-data.dimasakajoshua.workers.dev/2020prvTaxonomy.pmtiles";
const munUrl =
    "https://phgeodex-data.dimasakajoshua.workers.dev/2020munTaxonomy.pmtiles";
const brgyUrl =
    "https://phgeodex-data.dimasakajoshua.workers.dev/2020brgyTaxonomy.pmtiles";
// =========================================================
// MATERIAL GROUPS
// =========================================================
const materialGroups = {
    Wood: ["W1W3", "W2", "N"],
    Masonry: ["CHBMWS", "URA", "URM"],
    Concrete: ["CWS", "C1"],
    Steel: ["S1", "S3"],
};
// =========================================================
// BUILDING TYPOLOGY DESCRIPTIONS
// =========================================================
const indicatorDescriptions = {
    W1W3: "Wooden light-frame (small)",
    W2: "Wooden light-frame (large)",
    N: "Makeshift or informal",
    CHBMWS: "Concrete hollow block",
    URA: "Unreinforced adobe walls",
    URM: "Unreinforced masonry walls",
    CWS: "Concrete with steel",
    C1: "Reinforced concrete moment frame",
    S1: "Steel moment frames",
    S3: "Steel light frames",
};
// =========================================================
// INDICATOR ORDER
// =========================================================
const indicatorOrder = [
    "W1W3",
    "W2",
    "N",
    "CHBMWS",
    "URA",
    "URM",
    "CWS",
    "C1",
    "S1",
    "S3",
];
// =========================================================
// JENKS COLORS
// =========================================================
const jenksColors = ["#440154", "#3B528B", "#21918C", "#5EC962", "#FDE725"];
// =========================================================
// GET CURRENT INDICATOR
// =========================================================
function getCurrentIndicator() {
    const material = materialSelect.value;
    const indicator = indicatorSelect.value;
    if (indicator !== "") {
        return {
            type: "indicator",
            key: indicator,
            label: indicator,
        };
    }
    if (material !== "") {
        return {
            type: "material",
            key: material,
            label: material,
        };
    }
    return {
        type: "none",
        key: null,
        label: null,
    };
}
// =========================================================
// GET VALUE FROM FEATURE
// =========================================================
function getFeatureValue(
    properties,
    selection,
) {
    if (!selection || selection.type === "none") {
        return null;
    }
    if (selection.type === "indicator") {
        const value = Number(properties[selection.key]);
        return Number.isFinite(value) ? value : null;
    }
    if (selection.type === "material") {
        const indicators = materialGroups[selection.key];
        if (!indicators) {
            return null;
        }
        let total = 0;
        let hasValidValue = false;
        indicators.forEach((indicator) => {
            const value = Number(properties[indicator]);
            if (Number.isFinite(value)) {
                total += value;
                hasValidValue = true;
            }
        });
        return hasValidValue ? total : null;
    }
    return null;
}
// =========================================================
// CALCULATE JENKS
// =========================================================
function calculateJenks(
    values,
    numberOfClasses = 5,
) {
    const cleanValues = values
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value))
        .sort(
            (
                a,
                b,
            ) => a - b,
        );
    if (cleanValues.length === 0) {
        return [];
    }
    const uniqueValues = [...new Set(cleanValues)];
    if (uniqueValues.length === 1) {
        return [
            uniqueValues[0],
            uniqueValues[0],
            uniqueValues[0],
            uniqueValues[0],
        ];
    }
    if (uniqueValues.length < numberOfClasses) {
        const breaks = [];
        for (let i = 1; i < numberOfClasses; i++) {
            const position = Math.floor(
                (i * uniqueValues.length) / numberOfClasses,
            );
            breaks.push(
                uniqueValues[
                    Math.min(
                        position,
                        uniqueValues.length - 1,
                    )
                ],
            );
        }
        return breaks;
    }
    const n = cleanValues.length;
    const lowerClassLimits = Array.from(
        {
            length: n + 1,
        },
        () => Array(numberOfClasses + 1).fill(0),
    );
    const varianceCombinations = Array.from(
        {
            length: n + 1,
        },
        () => Array(numberOfClasses + 1).fill(Infinity),
    );
    for (let i = 1; i <= numberOfClasses; i++) {
        lowerClassLimits[1][i] = 1;
        varianceCombinations[1][i] = 0;
    }
    for (let l = 2; l <= n; l++) {
        let sum = 0;
        let sumSquares = 0;
        let w = 0;
        let variance = 0;
        for (let m = 1; m <= l; m++) {
            const lowerClassLimit = l - m + 1;
            const value = cleanValues[lowerClassLimit - 1];
            w++;
            sum += value;
            sumSquares += value * value;
            variance = sumSquares - (sum * sum) / w;
            if (lowerClassLimit !== 1) {
                for (let j = 2; j <= numberOfClasses; j++) {
                    if (
                        varianceCombinations[l][j] >=
                        variance +
                            varianceCombinations[lowerClassLimit - 1][j - 1]
                    ) {
                        lowerClassLimits[l][j] = lowerClassLimit;
                        varianceCombinations[l][j] =
                            variance +
                            varianceCombinations[lowerClassLimit - 1][j - 1];
                    }
                }
            }
        }
        lowerClassLimits[l][1] = 1;
        varianceCombinations[l][1] = variance;
    }
    const breaks = Array(numberOfClasses - 1);
    let k = n;
    for (let j = numberOfClasses; j >= 2; j--) {
        const id = lowerClassLimits[k][j] - 2;
        breaks[j - 2] = cleanValues[id];
        k = lowerClassLimits[k][j] - 1;
    }
    return breaks.sort(
        (
            a,
            b,
        ) => a - b,
    );
}
// =========================================================
// CREATE JENKS EXPRESSION
// =========================================================
function createJenksExpression(
    selection,
    breaks,
) {
    if (selection.type === "indicator") {
        return [
            "step",
            ["get", selection.key],
            jenksColors[0],
            breaks[0],
            jenksColors[1],
            breaks[1],
            jenksColors[2],
            breaks[2],
            jenksColors[3],
            breaks[3],
            jenksColors[4],
        ];
    }
    return null;
}
// =========================================================
// MAP
// =========================================================
const map = new maplibregl.Map({
    container: "map",
    style: {
        version: 8,
        sources: {
            basemap: {
                type: "raster",
                tiles: [
                    "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
                ],
                tileSize: 256,
                attribution: "© OpenStreetMap contributors © CARTO",
            },
            regions: {
                type: "vector",
                url: `pmtiles://${regiUrl}`,
            },
            provinces: {
                type: "vector",
                url: `pmtiles://${prvUrl}`,
            },
            municipalities: {
                type: "vector",
                url: `pmtiles://${munUrl}`,
            },
            barangays: {
                type: "vector",
                url: `pmtiles://${brgyUrl}`,
            },
        },
        layers: [
            {
                id: "basemap",
                type: "raster",
                source: "basemap",
            },
            {
                id: "regions-fill",
                type: "fill",
                source: "regions",
                "source-layer": "regions",
                paint: {
                    "fill-color": "#FFFFFF",
                    "fill-opacity": 0,
                },
            },
            {
                id: "regions-outline",
                type: "line",
                source: "regions",
                "source-layer": "regions",
                paint: {
                    "line-color": "#333333",
                    "line-width": 1,
                    "line-opacity": 0,
                },
            },
            {
                id: "provinces-fill",
                type: "fill",
                source: "provinces",
                "source-layer": "provinces",
                paint: {
                    "fill-color": "#FFFFFF",
                    "fill-opacity": 0,
                },
            },
            {
                id: "provinces-outline",
                type: "line",
                source: "provinces",
                "source-layer": "provinces",
                paint: {
                    "line-color": "#333333",
                    "line-width": 1,
                    "line-opacity": 0,
                },
            },
            {
                id: "municipalities-fill",
                type: "fill",
                source: "municipalities",
                "source-layer": "municipalities",
                paint: {
                    "fill-color": "#FFFFFF",
                    "fill-opacity": 0,
                },
            },
            {
                id: "municipalities-outline",
                type: "line",
                source: "municipalities",
                "source-layer": "municipalities",
                paint: {
                    "line-color": "#333333",
                    "line-width": 1,
                    "line-opacity": 0,
                },
            },
            {
                id: "barangays-fill",
                type: "fill",
                source: "barangays",
                "source-layer": "barangays",
                paint: {
                    "fill-color": "#FFFFFF",
                    "fill-opacity": 0,
                },
            },
            {
                id: "barangays-outline",
                type: "line",
                source: "barangays",
                "source-layer": "barangays",
                paint: {
                    "line-color": "#333333",
                    "line-width": 0.5,
                    "line-opacity": 0,
                },
            },
        ],
    },
    center: [
        121,
        12,
    ],
    zoom: 5,
});
// =========================================================
// NAVIGATION CONTROL
// =========================================================
map.addControl(new maplibregl.NavigationControl());
// =========================================================
// SELECTORS
// =========================================================
const materialSelect = document.getElementById("material-select");
const indicatorSelect = document.getElementById("indicator-select");
const regionSelect = document.getElementById("region-select");
const provinceSelect = document.getElementById("province-select");
const municipalitySelect = document.getElementById("municipality-select");
const barangaySelect = document.getElementById("barangay-select");
const showLabelsCheckbox = document.getElementById("show-labels-checkbox");
// =========================================================
// LABEL STORAGE
// =========================================================
let mapLabels = [];
// =========================================================
// ZOOM REQUEST ID
// =========================================================
let zoomRequestId = 0;
// =========================================================
// PHILIPPINES BOUNDS
// =========================================================
const philippinesBounds = [
    [
        116.5,
        4.5,
    ],
    [
        127.0,
        21.5,
    ],
];
// =========================================================
// CLEAR LABELS
// =========================================================
function clearLabels() {
    mapLabels.forEach((marker) => {
        marker.remove();
    });
    mapLabels = [];
}
// =========================================================
// ADD OPTION
// =========================================================
function addOption(
    select,
    value,
    text,
) {
    const option = document.createElement("option");
    option.value = String(value);
    option.textContent = text;
    select.appendChild(option);
}
// =========================================================
// POPULATE BUILDING TYPOLOGIES
// =========================================================
function populateIndicators(material) {
    indicatorSelect.innerHTML = "";
    addOption(
        indicatorSelect,
        "",
        "ALL",
    );
    let indicators = indicatorOrder;
    if (material !== "") {
        indicators = materialGroups[material] || [];
    }
    indicators.forEach((indicator) => {
        addOption(
            indicatorSelect,
            indicator,
            `${indicator}: ${indicatorDescriptions[indicator]}`,
        );
    });
}
// =========================================================
// UPDATE SELECTOR STATES
// =========================================================
function updateSelectorStates() {
    const regionSelected = regionSelect.value !== "";
    const provinceSelected = provinceSelect.value !== "";
    const municipalitySelected = municipalitySelect.value !== "";
    provinceSelect.disabled = !regionSelected;
    municipalitySelect.disabled = !provinceSelected;
    barangaySelect.disabled = !municipalitySelected;
}
// =========================================================
// POPULATE REGIONS
// =========================================================
function populateRegions() {
    regionSelect.innerHTML = "";
    addOption(
        regionSelect,
        "",
        "ALL",
    );
    adminHierarchy.regions.forEach((region) => {
        addOption(
            regionSelect,
            region.adm1_psgc,
            region.adm1_en,
        );
    });
    populateProvinces("");
}
// =========================================================
// POPULATE PROVINCES
// =========================================================
function populateProvinces(regionCode) {
    provinceSelect.innerHTML = "";
    addOption(
        provinceSelect,
        "",
        "ALL",
    );
    municipalitySelect.innerHTML = "";
    addOption(
        municipalitySelect,
        "",
        "ALL",
    );
    barangaySelect.innerHTML = "";
    addOption(
        barangaySelect,
        "",
        "ALL",
    );
    let provinces = adminHierarchy.provinces;
    if (regionCode !== "") {
        provinces = provinces.filter(
            (province) => String(province.adm1_psgc) === String(regionCode),
        );
    }
    provinces.forEach((province) => {
        addOption(
            provinceSelect,
            province.adm2_psgc,
            province.adm2_en,
        );
    });
    updateSelectorStates();
}
// =========================================================
// POPULATE MUNICIPALITIES
// =========================================================
function populateMunicipalities(
    regionCode,
    provinceCode,
) {
    municipalitySelect.innerHTML = "";
    addOption(
        municipalitySelect,
        "",
        "ALL",
    );
    barangaySelect.innerHTML = "";
    addOption(
        barangaySelect,
        "",
        "ALL",
    );
    let municipalities = adminHierarchy.municipalities;
    if (regionCode !== "") {
        municipalities = municipalities.filter(
            (municipality) =>
                String(municipality.adm1_psgc) === String(regionCode),
        );
    }
    if (provinceCode !== "") {
        municipalities = municipalities.filter(
            (municipality) =>
                String(municipality.adm2_psgc) === String(provinceCode),
        );
    }
    municipalities.forEach((municipality) => {
        addOption(
            municipalitySelect,
            municipality.adm3_psgc,
            municipality.adm3_en,
        );
    });
    updateSelectorStates();
}
// =========================================================
// POPULATE BARANGAYS
// =========================================================
function populateBarangays(
    regionCode,
    provinceCode,
    municipalityCode,
) {
    barangaySelect.innerHTML = "";
    addOption(
        barangaySelect,
        "",
        "ALL",
    );
    let barangays = adminHierarchy.barangays;
    if (regionCode !== "") {
        barangays = barangays.filter(
            (barangay) => String(barangay.adm1_psgc) === String(regionCode),
        );
    }
    if (provinceCode !== "") {
        barangays = barangays.filter(
            (barangay) => String(barangay.adm2_psgc) === String(provinceCode),
        );
    }
    if (municipalityCode !== "") {
        barangays = barangays.filter(
            (barangay) =>
                String(barangay.adm3_psgc) === String(municipalityCode),
        );
    }
    barangays.forEach((barangay) => {
        addOption(
            barangaySelect,
            barangay.adm4_psgc,
            barangay.adm4_en,
        );
    });
    updateSelectorStates();
}
// =========================================================
// GET CURRENT MAP LEVEL
// =========================================================
function getCurrentRecords() {
    const regionCode = regionSelect.value;
    const provinceCode = provinceSelect.value;
    const municipalityCode = municipalitySelect.value;
    const barangayCode = barangaySelect.value;
    if (barangayCode !== "") {
        return {
            level: "barangays",
        };
    }
    if (municipalityCode !== "") {
        return {
            level: "barangays",
        };
    }
    if (provinceCode !== "") {
        return {
            level: "municipalities",
        };
    }
    if (regionCode !== "") {
        return {
            level: "provinces",
        };
    }
    return {
        level: "regions",
    };
}
// =========================================================
// UPDATE MAP FILTERS
// =========================================================
function updateMapFilters() {
    const regionCode = regionSelect.value;
    const provinceCode = provinceSelect.value;
    const municipalityCode = municipalitySelect.value;
    const barangayCode = barangaySelect.value;
    map.setFilter(
        "regions-fill",
        null,
    );
    map.setFilter(
        "regions-outline",
        null,
    );
    map.setFilter(
        "provinces-fill",
        regionCode === ""
            ? ["==", ["get", "adm1_psgc"], -999999999]
            : ["==", ["get", "adm1_psgc"], Number(regionCode)],
    );
    map.setFilter(
        "provinces-outline",
        map.getFilter("provinces-fill"),
    );
    map.setFilter(
        "municipalities-fill",
        provinceCode === ""
            ? ["==", ["get", "adm2_psgc"], -999999999]
            : ["==", ["get", "adm2_psgc"], Number(provinceCode)],
    );
    map.setFilter(
        "municipalities-outline",
        map.getFilter("municipalities-fill"),
    );
    if (municipalityCode === "") {
        map.setFilter(
            "barangays-fill",
            ["==", ["get", "adm3_psgc"], -999999999],
        );
        map.setFilter(
            "barangays-outline",
            map.getFilter("barangays-fill"),
        );
    } else if (barangayCode !== "") {
        map.setFilter(
            "barangays-fill",
            ["==", ["get", "adm4_psgc"], Number(barangayCode)],
        );
        map.setFilter(
            "barangays-outline",
            map.getFilter("barangays-fill"),
        );
    } else {
        map.setFilter(
            "barangays-fill",
            ["==", ["get", "adm3_psgc"], Number(municipalityCode)],
        );
        map.setFilter(
            "barangays-outline",
            map.getFilter("barangays-fill"),
        );
    }
}
// =========================================================
// GET ACTIVE FEATURES
// =========================================================
function getActiveRenderedFeatures() {
    const { level } = getCurrentRecords();
    const layer = `${level}-fill`;
    return map.queryRenderedFeatures(
        undefined,
        {
            layers: [layer],
        },
    );
}
// =========================================================
// UPDATE DYNAMIC JENKS
// =========================================================
function updateDynamicJenks() {
    const selection = getCurrentIndicator();
    const activeFillLayer = `${getCurrentRecords().level}-fill`;
    const features = getActiveRenderedFeatures();
    const values = features
        .map((feature) =>
            getFeatureValue(
                feature.properties,
                selection,
            ),
        )
        .filter((value) => Number.isFinite(value));
    if (values.length === 0) {
        return;
    }
    const breaks = calculateJenks(
        values,
        5,
    );
    if (breaks.length !== 4) {
        return;
    }
    if (selection.type === "indicator") {
        map.setPaintProperty(
            activeFillLayer,
            "fill-color",
            createJenksExpression(
                selection,
                breaks,
            ),
        );
    } else if (selection.type === "material") {
        const expression = createMaterialExpression(
            selection,
            activeFillLayer,
            features,
            breaks,
        );
        map.setPaintProperty(
            activeFillLayer,
            "fill-color",
            expression,
        );
    }
    map.setPaintProperty(
        activeFillLayer,
        "fill-opacity",
        1,
    );
    if (barangaySelect.value !== "" && features.length > 0) {
        updateLegendSingleBarangay(
            selection,
            features[0],
        );
    } else {
        updateLegend(
            selection,
            breaks,
            values,
        );
    }
}
// =========================================================
// CREATE MATERIAL EXPRESSION
// =========================================================
function createMaterialExpression(
    selection,
    layer,
    features,
    breaks,
) {
    const expression = ["case"];
    features.forEach((feature) => {
        const properties = feature.properties;
        const code = getFeatureCode(properties);
        const value = getFeatureValue(
            properties,
            selection,
        );
        if (code === null || value === null) {
            return;
        }
        let color = jenksColors[4];
        if (value <= breaks[0]) {
            color = jenksColors[0];
        } else if (value <= breaks[1]) {
            color = jenksColors[1];
        } else if (value <= breaks[2]) {
            color = jenksColors[2];
        } else if (value <= breaks[3]) {
            color = jenksColors[3];
        }
        expression.push(
            ["==", ["get", code.field], code.value],
            color,
        );
    });
    expression.push(jenksColors[0]);
    return expression;
}
// =========================================================
// GET FEATURE CODE
// =========================================================
function getFeatureCode(properties) {
    if (properties.adm4_psgc !== undefined) {
        return {
            field: "adm4_psgc",
            value: Number(properties.adm4_psgc),
        };
    }
    if (properties.adm3_psgc !== undefined) {
        return {
            field: "adm3_psgc",
            value: Number(properties.adm3_psgc),
        };
    }
    if (properties.adm2_psgc !== undefined) {
        return {
            field: "adm2_psgc",
            value: Number(properties.adm2_psgc),
        };
    }
    return {
        field: "adm1_psgc",
        value: Number(properties.adm1_psgc),
    };
}
// =========================================================
// UPDATE MAP
// =========================================================
function updateMap() {
    const { level } = getCurrentRecords();
    const levels = ["regions", "provinces", "municipalities", "barangays"];
    updateMapFilters();
    levels.forEach((currentLevel) => {
        const fillLayer = `${currentLevel}-fill`;
        const outlineLayer = `${currentLevel}-outline`;
        const isActive = currentLevel === level;
        map.setPaintProperty(
            fillLayer,
            "fill-opacity",
            isActive ? 1 : 0,
        );
        map.setPaintProperty(
            outlineLayer,
            "line-opacity",
            isActive ? 1 : 0,
        );
    });
    map.once(
        "idle",
        () => {
            updateDynamicJenks();
            if (showLabelsCheckbox && showLabelsCheckbox.checked) {
                updateMapLabels();
            } else {
                clearLabels();
            }
        },
    );
}
// =========================================================
// GET LABEL LEVEL
// =========================================================
function getLabelLevel() {
    const { level } = getCurrentRecords();
    if (level === "barangays") {
        return {
            layer: "barangays-fill",
            nameField: "adm4_en",
            codeField: "adm4_psgc",
        };
    }
    if (level === "municipalities") {
        return {
            layer: "municipalities-fill",
            nameField: "adm3_en",
            codeField: "adm3_psgc",
        };
    }
    if (level === "provinces") {
        return {
            layer: "provinces-fill",
            nameField: "adm2_en",
            codeField: "adm2_psgc",
        };
    }
    return {
        layer: "regions-fill",
        nameField: "adm1_en",
        codeField: "adm1_psgc",
    };
}
// =========================================================
// POLYGON CENTROID
// =========================================================
function getPolygonCentroid(geometry) {
    let coordinates = [];
    if (geometry.type === "Polygon") {
        coordinates = geometry.coordinates[0];
    } else if (geometry.type === "MultiPolygon") {
        let largestRing = null;
        let largestArea = 0;
        geometry.coordinates.forEach((polygon) => {
            const ring = polygon[0];
            let area = 0;
            for (let i = 0; i < ring.length - 1; i++) {
                const x1 = ring[i][0];
                const y1 = ring[i][1];
                const x2 = ring[i + 1][0];
                const y2 = ring[i + 1][1];
                area += Math.abs(x1 * y2 - x2 * y1);
            }
            if (area > largestArea) {
                largestArea = area;
                largestRing = ring;
            }
        });
        coordinates = largestRing;
    }
    if (!coordinates || coordinates.length === 0) {
        return null;
    }
    let x = 0;
    let y = 0;
    let area = 0;
    for (let i = 0; i < coordinates.length - 1; i++) {
        const x1 = coordinates[i][0];
        const y1 = coordinates[i][1];
        const x2 = coordinates[i + 1][0];
        const y2 = coordinates[i + 1][1];
        const cross = x1 * y2 - x2 * y1;
        area += cross;
        x += (x1 + x2) * cross;
        y += (y1 + y2) * cross;
    }
    area /= 2;
    if (area === 0) {
        return coordinates[0];
    }
    x /= 6 * area;
    y /= 6 * area;
    return [x, y];
}
// =========================================================
// FORMAT LABEL
// =========================================================
function formatLabelText(
    text,
    maxCharacters = 8,
) {
    const normalizedText = String(text).trim().replace(
        /\s+/g,
        " ",
    );
    const regionMatch = normalizedText.match(
        /^Region\s+[IVXLCDM]+(?:\s+.*)?$/i,
    );
    if (regionMatch) {
        return [normalizedText];
    }
    const words = normalizedText.split(" ");
    const lines = [];
    let currentLine = "";
    words.forEach((word) => {
        if (currentLine === "") {
            currentLine = word;
            return;
        }
        const proposedLine = currentLine + " " + word;
        if (proposedLine.length <= maxCharacters) {
            currentLine = proposedLine;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    });
    if (currentLine !== "") {
        lines.push(currentLine);
    }
    return lines;
}
// =========================================================
// CREATE LABEL ELEMENT
// =========================================================
function createLabelElement(name) {
    const labelElement = document.createElement("div");
    labelElement.className = "map-label";
    const lines = formatLabelText(
        name,
        8,
    );
    lines.forEach((line) => {
        const lineElement = document.createElement("div");
        lineElement.className = "map-label-line";
        lineElement.textContent = line;
        labelElement.appendChild(lineElement);
    });
    return labelElement;
}
// =========================================================
// UPDATE MAP LABELS
// =========================================================
function updateMapLabels() {
    if (!showLabelsCheckbox || !showLabelsCheckbox.checked) {
        clearLabels();
        return;
    }
    clearLabels();
    const {
        layer,
        nameField,
        codeField,
    } = getLabelLevel();
    const features = map.queryRenderedFeatures(
        undefined,
        {
            layers: [layer],
        },
    );
    const uniqueFeatures = new Map();
    features.forEach((feature) => {
        const properties = feature.properties;
        const code = String(properties[codeField]);
        if (!uniqueFeatures.has(code)) {
            uniqueFeatures.set(
                code,
                feature,
            );
        }
    });
    uniqueFeatures.forEach((feature) => {
        const properties = feature.properties;
        const name = properties[nameField];
        const center = getPolygonCentroid(feature.geometry);
        if (!center || !name) {
            return;
        }
        const labelElement = createLabelElement(name);
        const marker = new maplibregl.Marker({
            element: labelElement,
            anchor: "center",
        })
            .setLngLat(center)
            .addTo(map);
        mapLabels.push(marker);
    });
}
// =========================================================
// ADMIN HIERARCHY
// =========================================================
let adminHierarchy;
fetch("adminHierarchy.json")
    .then((response) => {
        if (!response.ok) {
            throw new Error("Could not load adminHierarchy.json");
        }
        return response.json();
    })
    .then((data) => {
        adminHierarchy = data;
        populateIndicators(materialSelect.value);
        populateRegions();
        updateMap();
    })
    .catch((error) => {
        console.error(error);
    });
// =========================================================
// REGION CHANGE
// =========================================================
regionSelect.addEventListener(
    "change",
    () => {
        populateProvinces(regionSelect.value);
        updateMap();
        zoomToSelection();
    },
);
// =========================================================
// PROVINCE CHANGE
// =========================================================
provinceSelect.addEventListener(
    "change",
    () => {
        populateMunicipalities(
            regionSelect.value,
            provinceSelect.value,
        );
        updateMap();
        zoomToSelection();
    },
);
// =========================================================
// MUNICIPALITY CHANGE
// =========================================================
municipalitySelect.addEventListener(
    "change",
    () => {
        populateBarangays(
            regionSelect.value,
            provinceSelect.value,
            municipalitySelect.value,
        );
        updateMap();
        zoomToSelection();
    },
);
// =========================================================
// BARANGAY CHANGE
// =========================================================
barangaySelect.addEventListener(
    "change",
    () => {
        updateMap();
        zoomToSelection();
    },
);
// =========================================================
// MATERIAL CHANGE
// =========================================================
materialSelect.addEventListener(
    "change",
    () => {
        indicatorSelect.value = "";
        populateIndicators(materialSelect.value);
        updateMap();
    },
);
// =========================================================
// INDICATOR CHANGE
// =========================================================
indicatorSelect.addEventListener(
    "change",
    () => {
        updateMap();
    },
);
// =========================================================
// LABEL CHECKBOX
// =========================================================
if (showLabelsCheckbox) {
    showLabelsCheckbox.addEventListener(
        "change",
        () => {
            if (showLabelsCheckbox.checked) {
                updateMapLabels();
            } else {
                clearLabels();
            }
        },
    );
}
// =========================================================
// FORMAT LEGEND VALUE
// =========================================================
function formatLegendValue(value) {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) {
        return "";
    }
    if (numericValue === 0) {
        return "0";
    }
    return numericValue
        .toPrecision(4)
        .replace(
            /(?:\.0+|(\.\d+?)0+)(?=e|$)/,
            "$1",
        )
        .replace(
            /e\+?/,
            "e",
        );
}
// =========================================================
// UPDATE LEGEND
// =========================================================
function updateLegend(
    selection,
    breaks,
    values,
) {
    const indicatorTitle = document.getElementById("legend-indicator-title");
    const legendClasses = document.getElementById("legend-classes");
    const legendSingleValue = document.getElementById("legend-single-value");
    const labels = [
        document.getElementById("legend-label-0"),
        document.getElementById("legend-label-1"),
        document.getElementById("legend-label-2"),
        document.getElementById("legend-label-3"),
        document.getElementById("legend-label-4"),
    ];
    if (!selection || selection.type === "none") {
        return;
    }
    if (!values || values.length === 0) {
        return;
    }
    if (legendClasses) {
        legendClasses.style.display = "";
    }
    if (legendSingleValue) {
        legendSingleValue.style.display = "none";
    }
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const mainLine = `Composition of ${selection.label}`;
    const subLine =
        selection.type === "indicator"
            ? `(${indicatorDescriptions[selection.key]})`
            : "";
    if (indicatorTitle) {
        indicatorTitle.innerHTML = subLine
            ? `${mainLine}<br>${subLine}`
            : mainLine;
    }
    const ranges = [
        [minValue, breaks[0]],
        [breaks[0], breaks[1]],
        [breaks[1], breaks[2]],
        [breaks[2], breaks[3]],
        [breaks[3], maxValue],
    ];
    ranges.forEach(
        (
            range,
            index,
        ) => {
            if (labels[index]) {
                labels[index].textContent = `${formatLegendValue(
                    range[0],
                )}% – ${formatLegendValue(range[1])}%`;
            }
        },
    );
}
// =========================================================
// UPDATE LEGEND FOR A SINGLE SELECTED BARANGAY
// =========================================================
function updateLegendSingleBarangay(
    selection,
    feature,
) {
    const indicatorTitle = document.getElementById("legend-indicator-title");
    const legendClasses = document.getElementById("legend-classes");
    const legendSingleValue = document.getElementById("legend-single-value");
    const properties = feature.properties;
    const value = getFeatureValue(
        properties,
        selection,
    );
    const barangayName =
        properties.adm4_en
        ||
        (
            adminHierarchy
            &&
            adminHierarchy.barangays.find(
                (barangay) =>
                    String(barangay.adm4_psgc) === barangaySelect.value,
            )
        )?.adm4_en
        ||
        "";
    const label =
        selection.type === "indicator" ? selection.key : selection.label;
    if (indicatorTitle) {
        indicatorTitle.textContent = barangayName;
    }
    if (legendSingleValue) {
        legendSingleValue.textContent = `${label}: ${
            Number.isFinite(value) ? formatLegendValue(value) + "%" : "N/A"
        }`;
        legendSingleValue.style.display = "block";
    }
    if (legendClasses) {
        legendClasses.style.display = "none";
    }
}
// =========================================================
// COLLAPSIBLE LEGEND
// =========================================================
const legendToggle = document.getElementById("legend-toggle");
const legendContent = document.getElementById("legend-content");
const legendArrow = document.getElementById("legend-arrow");
if (legendToggle && legendContent && legendArrow) {
    legendToggle.addEventListener(
        "click",
        () => {
            const isHidden = legendContent.style.display === "none";
            if (isHidden) {
                legendContent.style.display = "block";
                legendArrow.textContent = "▲";
            } else {
                legendContent.style.display = "none";
                legendArrow.textContent = "▼";
            }
        },
    );
}
// =========================================================
// UPDATE LABELS WHEN MAP MOVES
// =========================================================
map.on(
    "moveend",
    () => {
        if (showLabelsCheckbox && showLabelsCheckbox.checked) {
            updateMapLabels();
        } else {
            clearLabels();
        }
    },
);
// =========================================================
// POPUP ACTIVE LEVEL
// =========================================================
function getActivePopupLayer() {
    const regionCode = regionSelect.value;
    const provinceCode = provinceSelect.value;
    const municipalityCode = municipalitySelect.value;
    const barangayCode = barangaySelect.value;
    if (barangayCode !== "") {
        return {
            layer: "barangays-fill",
            parentField: "adm4_psgc",
            parentCode: Number(barangayCode),
        };
    }
    if (municipalityCode !== "") {
        return {
            layer: "barangays-fill",
            parentField: "adm3_psgc",
            parentCode: Number(municipalityCode),
        };
    }
    if (provinceCode !== "") {
        return {
            layer: "municipalities-fill",
            parentField: "adm2_psgc",
            parentCode: Number(provinceCode),
        };
    }
    if (regionCode !== "") {
        return {
            layer: "provinces-fill",
            parentField: "adm1_psgc",
            parentCode: Number(regionCode),
        };
    }
    return {
        layer: "regions-fill",
        parentField: null,
        parentCode: null,
    };
}
// =========================================================
// POPUP HTML
// =========================================================
function buildMaterialRowHTML(
    label,
    value,
) {
    return `
                <div
                    class="property-row"
                >
                    <strong>
                        ${label}
                    </strong>
                    <span>
                        ${
                            Number.isFinite(value)
                                ? formatLegendValue(value) + "%"
                                : "N/A"
                        }
                    </span>
                </div>
            `;
}
function buildTypologyRowHTML(
    indicator,
    value,
) {
    return `
                <div
                    class="property-row-sub"
                >
                    <em>
                        ${indicator}
                    </em>
                    <span>
                        ${formatLegendValue(value)}%
                    </span>
                </div>
            `;
}
function createPopupHTML(properties) {
    let adminName = "";
    const nameFields = ["adm1_en", "adm2_en", "adm3_en", "adm4_en"];
    for (const field of nameFields) {
        if (properties[field]) {
            adminName = properties[field];
            break;
        }
    }
    const selection = getCurrentIndicator();
    let html = "<div class='popup-content'>";
    if (adminName) {
        html += `
                <div
                    class="popup-admin-name"
                >
                    ${adminName}
                </div>
            `;
    }
    if (selection.type === "indicator") {
        const value = getFeatureValue(
            properties,
            selection,
        );
        html += buildMaterialRowHTML(
            selection.key,
            value,
        );
    } else if (selection.type === "material") {
        const value = getFeatureValue(
            properties,
            selection,
        );
        html += buildMaterialRowHTML(
            selection.key,
            value,
        );
        const subIndicators = materialGroups[selection.key] || [];
        subIndicators.forEach((indicator) => {
            const subValue = Number(properties[indicator]);
            if (Number.isFinite(subValue)) {
                html += buildTypologyRowHTML(
                    indicator,
                    subValue,
                );
            }
        });
    } else {
        Object.keys(materialGroups).forEach((material) => {
            const materialValue = getFeatureValue(
                properties,
                {
                    type: "material",
                    key: material,
                    label: material,
                },
            );
            html += buildMaterialRowHTML(
                material,
                materialValue,
            );
            materialGroups[material].forEach((indicator) => {
                const subValue = Number(properties[indicator]);
                if (Number.isFinite(subValue)) {
                    html += buildTypologyRowHTML(
                        indicator,
                        subValue,
                    );
                }
            });
        });
    }
    html += "</div>";
    return html;
}
// =========================================================
// POPUP CLICK HANDLER
// =========================================================
function handlePopupClick(event) {
    const activePopup = getActivePopupLayer();
    const feature = event.features && event.features[0];
    if (!feature) {
        return;
    }
    const properties = feature.properties;
    if (activePopup.parentField) {
        const featureParentCode = Number(properties[activePopup.parentField]);
        if (featureParentCode !== activePopup.parentCode) {
            return;
        }
    }
    new maplibregl.Popup()
        .setLngLat(event.lngLat)
        .setHTML(createPopupHTML(properties))
        .addTo(map);
}
// =========================================================
// CLICKABLE LAYERS
// =========================================================
const clickableLayers = [
    "regions-fill",
    "provinces-fill",
    "municipalities-fill",
    "barangays-fill",
];
clickableLayers.forEach((layer) => {
    map.on(
        "click",
        layer,
        (event) => {
            const activePopup = getActivePopupLayer();
            if (activePopup.layer !== layer) {
                return;
            }
            handlePopupClick(event);
        },
    );
    map.on(
        "mouseenter",
        layer,
        () => {
            const activePopup = getActivePopupLayer();
            if (activePopup.layer === layer) {
                map.getCanvas().style.cursor = "pointer";
            }
        },
    );
    map.on(
        "mouseleave",
        layer,
        () => {
            map.getCanvas().style.cursor = "";
        },
    );
});
// =========================================================
// ZOOM TARGET
// =========================================================
function getZoomTarget() {
    const regionCode = regionSelect.value;
    const provinceCode = provinceSelect.value;
    const municipalityCode = municipalitySelect.value;
    const barangayCode = barangaySelect.value;
    if (barangayCode !== "") {
        return {
            sourceId: "barangays",
            sourceLayer: "barangays",
            propertyName: "adm4_psgc",
            targetCode: barangayCode,
        };
    }
    if (municipalityCode !== "") {
        return {
            sourceId: "municipalities",
            sourceLayer: "municipalities",
            propertyName: "adm3_psgc",
            targetCode: municipalityCode,
        };
    }
    if (provinceCode !== "") {
        return {
            sourceId: "provinces",
            sourceLayer: "provinces",
            propertyName: "adm2_psgc",
            targetCode: provinceCode,
        };
    }
    if (regionCode !== "") {
        return {
            sourceId: "regions",
            sourceLayer: "regions",
            propertyName: "adm1_psgc",
            targetCode: regionCode,
        };
    }
    return null;
}
// =========================================================
// EXTEND BOUNDS
// =========================================================
function extendBoundsFromGeometry(
    bounds,
    geometry,
) {
    if (!geometry) {
        return;
    }
    if (geometry.type === "Polygon") {
        geometry.coordinates.forEach((ring) => {
            ring.forEach((coordinate) => {
                bounds.extend(coordinate);
            });
        });
    } else if (geometry.type === "MultiPolygon") {
        geometry.coordinates.forEach((polygon) => {
            polygon.forEach((ring) => {
                ring.forEach((coordinate) => {
                    bounds.extend(coordinate);
                });
            });
        });
    }
}
// =========================================================
// FIND SOURCE FEATURES
// =========================================================
function findMatchingSourceFeatures(target) {
    const features = map.querySourceFeatures(
        target.sourceId,
        {
            sourceLayer: target.sourceLayer,
        },
    );
    return features.filter(
        (feature) =>
            String(feature.properties[target.propertyName]) ===
            String(target.targetCode),
    );
}
// =========================================================
// ZOOM TO SELECTION
// =========================================================
function zoomToSelection() {
    const requestId = ++zoomRequestId;
    const target = getZoomTarget();
    if (!target) {
        map.fitBounds(
            philippinesBounds,
            {
                padding: 50,
                duration: 600,
            },
        );
        return;
    }
    function fitToTarget() {
        if (requestId !== zoomRequestId) {
            return;
        }
        const matchingFeatures = findMatchingSourceFeatures(target);
        if (matchingFeatures.length === 0) {
            return;
        }
        const bounds = new maplibregl.LngLatBounds();
        matchingFeatures.forEach((feature) => {
            extendBoundsFromGeometry(
                bounds,
                feature.geometry,
            );
        });
        if (bounds.isEmpty()) {
            return;
        }
        map.fitBounds(
            bounds,
            {
                padding: 60,
                duration: 1200,
                maxZoom: 12,
            },
        );
    }
    const alreadyLoaded = findMatchingSourceFeatures(target);
    if (alreadyLoaded.length > 0) {
        fitToTarget();
        return;
    }
    map.fitBounds(
        philippinesBounds,
        {
            padding: 20,
            duration: 0,
        },
    );
    map.once(
        "idle",
        () => {
            if (requestId !== zoomRequestId) {
                return;
            }
            setTimeout(
                () => {
                    fitToTarget();
                },
                100,
            );
        },
    );
}