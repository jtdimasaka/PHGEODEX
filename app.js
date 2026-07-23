// =========================================================
// PMTILES PROTOCOL
// =========================================================

const protocol =
    new pmtiles.Protocol();


maplibregl.addProtocol(
    "pmtiles",
    protocol.tile
);


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
// JENKS COLORS
// =========================================================

const jenksColors = [
    "#440154",
    "#3B528B",
    "#21918C",
    "#5EC962",
    "#FDE725"
];


// =========================================================
// CALCULATE JENKS NATURAL BREAKS
// =========================================================

function calculateJenks(
    values,
    numberOfClasses = 5
) {

    const cleanValues =
        values
            .map(
                value =>
                    Number(value)
            )
            .filter(
                value =>
                    Number.isFinite(value)
            )
            .sort(
                (a, b) =>
                    a - b
            );


    if (
        cleanValues.length === 0
    ) {

        return [];

    }


    const uniqueValues =
        [
            ...new Set(cleanValues)
        ];


    if (
        uniqueValues.length === 1
    ) {

        return [
            uniqueValues[0],
            uniqueValues[0],
            uniqueValues[0],
            uniqueValues[0]
        ];

    }


    if (
        uniqueValues.length <
        numberOfClasses
    ) {

        const breaks = [];


        for (
            let i = 1;
            i < numberOfClasses;
            i++
        ) {

            const position =
                Math.floor(
                    (
                        i *
                        uniqueValues.length
                    )
                    /
                    numberOfClasses
                );


            breaks.push(
                uniqueValues[
                    Math.min(
                        position,
                        uniqueValues.length - 1
                    )
                ]
            );

        }


        return breaks;

    }


    const n =
        cleanValues.length;


    const lowerClassLimits =
        Array.from(
            {
                length:
                    n + 1
            },
            () =>
                Array(
                    numberOfClasses + 1
                )
                .fill(0)
        );


    const varianceCombinations =
        Array.from(
            {
                length:
                    n + 1
            },
            () =>
                Array(
                    numberOfClasses + 1
                )
                .fill(Infinity)
        );


    for (
        let i = 1;
        i <= numberOfClasses;
        i++
    ) {

        lowerClassLimits[1][i] =
            1;

        varianceCombinations[1][i] =
            0;

    }


    for (
        let l = 2;
        l <= n;
        l++
    ) {

        let sum =
            0;

        let sumSquares =
            0;

        let w =
            0;

        let variance =
            0;


        for (
            let m = 1;
            m <= l;
            m++
        ) {

            const lowerClassLimit =
                l -
                m +
                1;


            const value =
                cleanValues[
                    lowerClassLimit - 1
                ];


            w++;


            sum +=
                value;


            sumSquares +=
                value *
                value;


            variance =
                sumSquares -
                (
                    sum *
                    sum
                )
                /
                w;


            if (
                lowerClassLimit !== 1
            ) {

                for (
                    let j = 2;
                    j <= numberOfClasses;
                    j++
                ) {

                    if (
                        varianceCombinations[l][j]
                        >=
                        variance
                        +
                        varianceCombinations[
                            lowerClassLimit - 1
                        ][j - 1]
                    ) {

                        lowerClassLimits[l][j] =
                            lowerClassLimit;


                        varianceCombinations[l][j] =
                            variance
                            +
                            varianceCombinations[
                                lowerClassLimit - 1
                            ][j - 1];

                    }

                }

            }

        }


        lowerClassLimits[l][1] =
            1;


        varianceCombinations[l][1] =
            variance;

    }


    const breaks =
        Array(
            numberOfClasses - 1
        );


    let k =
        n;


    for (
        let j = numberOfClasses;
        j >= 2;
        j--
    ) {

        const id =
            lowerClassLimits[k][j] -
            2;


        breaks[j - 2] =
            cleanValues[id];


        k =
            lowerClassLimits[k][j] -
            1;

    }


    return breaks.sort(
        (a, b) =>
            a - b
    );

}


// =========================================================
// CREATE JENKS COLOR EXPRESSION
// =========================================================

function createJenksExpression(
    indicator,
    breaks
) {

    return [
        "step",

        [
            "get",
            indicator
        ],

        jenksColors[0],

        breaks[0],
        jenksColors[1],

        breaks[1],
        jenksColors[2],

        breaks[2],
        jenksColors[3],

        breaks[3],
        jenksColors[4]
    ];

}


// =========================================================
// MAP
// =========================================================

const map =
    new maplibregl.Map({

        container:
            "map",

        style: {

            version:
                8,


            sources: {

                basemap: {

                    type:
                        "raster",

                    tiles: [

                        "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"

                    ],

                    tileSize:
                        256,

                    attribution:
                        "© OpenStreetMap contributors © CARTO"

                },


                regions: {

                    type:
                        "vector",

                    url:
                        `pmtiles://${regiUrl}`

                },


                provinces: {

                    type:
                        "vector",

                    url:
                        `pmtiles://${prvUrl}`

                },


                municipalities: {

                    type:
                        "vector",

                    url:
                        `pmtiles://${munUrl}`

                },


                barangays: {

                    type:
                        "vector",

                    url:
                        `pmtiles://${brgyUrl}`

                }

            },


            layers: [

                {
                    id:
                        "basemap",

                    type:
                        "raster",

                    source:
                        "basemap"
                },


                {
                    id:
                        "regions-fill",

                    type:
                        "fill",

                    source:
                        "regions",

                    "source-layer":
                        "regions",

                    paint: {

                        "fill-color":
                            "#FFFFFF",

                        "fill-opacity":
                            0

                    }

                },


                {
                    id:
                        "regions-outline",

                    type:
                        "line",

                    source:
                        "regions",

                    "source-layer":
                        "regions",

                    paint: {

                        "line-color":
                            "#333333",

                        "line-width":
                            1,

                        "line-opacity":
                            0

                    }

                },


                {
                    id:
                        "provinces-fill",

                    type:
                        "fill",

                    source:
                        "provinces",

                    "source-layer":
                        "provinces",

                    paint: {

                        "fill-color":
                            "#FFFFFF",

                        "fill-opacity":
                            0

                    }

                },


                {
                    id:
                        "provinces-outline",

                    type:
                        "line",

                    source:
                        "provinces",

                    "source-layer":
                        "provinces",

                    paint: {

                        "line-color":
                            "#333333",

                        "line-width":
                            1,

                        "line-opacity":
                            0

                    }

                },


                {
                    id:
                        "municipalities-fill",

                    type:
                        "fill",

                    source:
                        "municipalities",

                    "source-layer":
                        "municipalities",

                    paint: {

                        "fill-color":
                            "#FFFFFF",

                        "fill-opacity":
                            0

                    }

                },


                {
                    id:
                        "municipalities-outline",

                    type:
                        "line",

                    source:
                        "municipalities",

                    "source-layer":
                        "municipalities",

                    paint: {

                        "line-color":
                            "#333333",

                        "line-width":
                            1,

                        "line-opacity":
                            0

                    }

                },


                {
                    id:
                        "barangays-fill",

                    type:
                        "fill",

                    source:
                        "barangays",

                    "source-layer":
                        "barangays",

                    paint: {

                        "fill-color":
                            "#FFFFFF",

                        "fill-opacity":
                            0

                    }

                },


                {
                    id:
                        "barangays-outline",

                    type:
                        "line",

                    source:
                        "barangays",

                    "source-layer":
                        "barangays",

                    paint: {

                        "line-color":
                            "#333333",

                        "line-width":
                            0.5,

                        "line-opacity":
                            0

                    }

                }

            ]

        },


        center:
            [
                121,
                12
            ],

        zoom:
            5

    });


// =========================================================
// NAVIGATION CONTROL
// =========================================================

map.addControl(
    new maplibregl.NavigationControl()
);


// =========================================================
// SELECTORS
// =========================================================

const regionSelect =
    document.getElementById(
        "region-select"
    );

const provinceSelect =
    document.getElementById(
        "province-select"
    );

const municipalitySelect =
    document.getElementById(
        "municipality-select"
    );

const barangaySelect =
    document.getElementById(
        "barangay-select"
    );

const indicatorSelect =
    document.getElementById(
        "indicator-select"
    );

const showLabelsCheckbox =
    document.getElementById(
        "show-labels-checkbox"
    );


// =========================================================
// LABEL STORAGE
// =========================================================

let mapLabels = [];


// =========================================================
// ZOOM REQUEST ID
// =========================================================
//
// This prevents an old pending zoom from
// overriding a newer selection.
//

let zoomRequestId =
    0;


// =========================================================
// PHILIPPINES DEFAULT BOUNDS
// =========================================================

const philippinesBounds = [

    [
        116.5,
        4.5
    ],

    [
        127.0,
        21.5
    ]

];


// =========================================================
// CLEAR MAP LABELS
// =========================================================

function clearLabels() {

    mapLabels.forEach(
        marker => {
            marker.remove();
        }
    );

    mapLabels = [];

}


// =========================================================
// GET CURRENT LABEL LEVEL
// =========================================================

function getLabelLevel() {

    const regionCode =
        regionSelect.value;

    const provinceCode =
        provinceSelect.value;

    const municipalityCode =
        municipalitySelect.value;

    const barangayCode =
        barangaySelect.value;


    if (
        barangayCode !== ""
    ) {

        return {

            layer:
                "barangays-fill",

            nameField:
                "adm4_en",

            codeField:
                "adm4_psgc"

        };

    }


    if (
        municipalityCode !== ""
    ) {

        return {

            layer:
                "barangays-fill",

            nameField:
                "adm4_en",

            codeField:
                "adm4_psgc"

        };

    }


    if (
        provinceCode !== ""
    ) {

        return {

            layer:
                "municipalities-fill",

            nameField:
                "adm3_en",

            codeField:
                "adm3_psgc"

        };

    }


    if (
        regionCode !== ""
    ) {

        return {

            layer:
                "provinces-fill",

            nameField:
                "adm2_en",

            codeField:
                "adm2_psgc"

        };

    }


    return {

        layer:
            "regions-fill",

        nameField:
            "adm1_en",

        codeField:
            "adm1_psgc"

    };

}


// =========================================================
// POLYGON CENTROID
// =========================================================

function getPolygonCentroid(
    geometry
) {

    let coordinates = [];


    if (
        geometry.type ===
        "Polygon"
    ) {

        coordinates =
            geometry.coordinates[0];

    }


    else if (
        geometry.type ===
        "MultiPolygon"
    ) {

        let largestRing =
            null;

        let largestArea =
            0;


        geometry.coordinates.forEach(
            polygon => {

                const ring =
                    polygon[0];

                let area =
                    0;


                for (
                    let i = 0;
                    i < ring.length - 1;
                    i++
                ) {

                    const x1 =
                        ring[i][0];

                    const y1 =
                        ring[i][1];

                    const x2 =
                        ring[i + 1][0];

                    const y2 =
                        ring[i + 1][1];


                    area +=
                        Math.abs(
                            x1 * y2 -
                            x2 * y1
                        );

                }


                if (
                    area >
                    largestArea
                ) {

                    largestArea =
                        area;

                    largestRing =
                        ring;

                }

            }
        );


        coordinates =
            largestRing;

    }


    if (
        !coordinates ||
        coordinates.length === 0
    ) {

        return null;

    }


    let x =
        0;

    let y =
        0;

    let area =
        0;


    for (
        let i = 0;
        i < coordinates.length - 1;
        i++
    ) {

        const x1 =
            coordinates[i][0];

        const y1 =
            coordinates[i][1];

        const x2 =
            coordinates[i + 1][0];

        const y2 =
            coordinates[i + 1][1];


        const cross =
            x1 * y2 -
            x2 * y1;


        area +=
            cross;


        x +=
            (
                x1 +
                x2
            )
            *
            cross;


        y +=
            (
                y1 +
                y2
            )
            *
            cross;

    }


    area /=
        2;


    if (
        area === 0
    ) {

        return coordinates[0];

    }


    x /=
        6 * area;


    y /=
        6 * area;


    return [
        x,
        y
    ];

}


// =========================================================
// FORMAT LABEL TEXT
// =========================================================
//
// Words are never split.
// "Region III" remains on one line.
//

function formatLabelText(
    text,
    maxCharacters = 8
) {

    const normalizedText =
        String(text)
            .trim()
            .replace(
                /\s+/g,
                " "
            );


    const regionMatch =
        normalizedText.match(
            /^Region\s+[IVXLCDM]+(?:\s+.*)?$/i
        );


    if (
        regionMatch
    ) {

        return [
            normalizedText
        ];

    }


    const words =
        normalizedText.split(
            " "
        );


    const lines =
        [];


    let currentLine =
        "";


    words.forEach(
        word => {

            if (
                currentLine === ""
            ) {

                currentLine =
                    word;

                return;

            }


            const proposedLine =
                currentLine
                +
                " "
                +
                word;


            if (
                proposedLine.length <=
                maxCharacters
            ) {

                currentLine =
                    proposedLine;

            }


            else {

                lines.push(
                    currentLine
                );

                currentLine =
                    word;

            }

        }
    );


    if (
        currentLine !== ""
    ) {

        lines.push(
            currentLine
        );

    }


    return lines;

}


// =========================================================
// CREATE LABEL ELEMENT
// =========================================================

function createLabelElement(
    name
) {

    const labelElement =
        document.createElement(
            "div"
        );


    labelElement.className =
        "map-label";


    const lines =
        formatLabelText(
            name,
            8
        );


    lines.forEach(
        line => {

            const lineElement =
                document.createElement(
                    "div"
                );


            lineElement.className =
                "map-label-line";


            lineElement.style.whiteSpace =
                "nowrap";


            lineElement.style.wordBreak =
                "normal";


            lineElement.style.overflowWrap =
                "normal";


            lineElement.textContent =
                line;


            labelElement.appendChild(
                lineElement
            );

        }
    );


    return labelElement;

}


// =========================================================
// UPDATE MAP LABELS
// =========================================================

function updateMapLabels() {

    if (
        !showLabelsCheckbox
        ||
        !showLabelsCheckbox.checked
    ) {

        clearLabels();

        return;

    }


    clearLabels();


    const {
        layer,
        nameField,
        codeField
    } =
        getLabelLevel();


    const features =
        map.queryRenderedFeatures(
            undefined,
            {
                layers:
                    [
                        layer
                    ]
            }
        );


    const uniqueFeatures =
        new Map();


    features.forEach(
        feature => {

            const properties =
                feature.properties;


            const code =
                String(
                    properties[
                        codeField
                    ]
                );


            if (
                !uniqueFeatures.has(
                    code
                )
            ) {

                uniqueFeatures.set(
                    code,
                    feature
                );

            }

        }
    );


    uniqueFeatures.forEach(
        feature => {

            const properties =
                feature.properties;


            const name =
                properties[
                    nameField
                ];


            const center =
                getPolygonCentroid(
                    feature.geometry
                );


            if (
                !center ||
                !name
            ) {

                return;

            }


            const labelElement =
                createLabelElement(
                    name
                );


            const marker =
                new maplibregl.Marker(
                    {
                        element:
                            labelElement,

                        anchor:
                            "center"
                    }
                )
                .setLngLat(
                    center
                )
                .addTo(
                    map
                );


            mapLabels.push(
                marker
            );

        }
    );

}


// =========================================================
// ADMIN HIERARCHY
// =========================================================

let adminHierarchy;


fetch(
    "adminHierarchy.json"
)

    .then(
        response => {

            if (
                !response.ok
            ) {

                throw new Error(
                    "Could not load adminHierarchy.json"
                );

            }


            return response.json();

        }
    )

    .then(
        data => {

            adminHierarchy =
                data;


            populateRegions();


            updateMap();

        }
    )

    .catch(
        error => {

            console.error(
                error
            );

        }
    );


// =========================================================
// ADD OPTION
// =========================================================

function addOption(
    select,
    value,
    text
) {

    const option =
        document.createElement(
            "option"
        );


    option.value =
        String(
            value
        );


    option.textContent =
        text;


    select.appendChild(
        option
    );

}


// =========================================================
// UPDATE SELECTOR STATES
// =========================================================

function updateSelectorStates() {

    const regionSelected =
        regionSelect.value !== "";


    const provinceSelected =
        provinceSelect.value !== "";


    const municipalitySelected =
        municipalitySelect.value !== "";


    provinceSelect.disabled =
        !regionSelected;


    municipalitySelect.disabled =
        !provinceSelected;


    barangaySelect.disabled =
        !municipalitySelected;

}


// =========================================================
// POPULATE REGIONS
// =========================================================

function populateRegions() {

    regionSelect.innerHTML =
        "";


    addOption(
        regionSelect,
        "",
        "ALL"
    );


    adminHierarchy.regions.forEach(
        region => {

            addOption(
                regionSelect,
                region.adm1_psgc,
                region.adm1_en
            );

        }
    );


    provinceSelect.innerHTML =
        "";

    addOption(
        provinceSelect,
        "",
        "ALL"
    );


    municipalitySelect.innerHTML =
        "";

    addOption(
        municipalitySelect,
        "",
        "ALL"
    );


    barangaySelect.innerHTML =
        "";

    addOption(
        barangaySelect,
        "",
        "ALL"
    );


    updateSelectorStates();

}


// =========================================================
// POPULATE PROVINCES
// =========================================================

function populateProvinces(
    regionCode
) {

    provinceSelect.innerHTML =
        "";


    addOption(
        provinceSelect,
        "",
        "ALL"
    );


    municipalitySelect.innerHTML =
        "";

    addOption(
        municipalitySelect,
        "",
        "ALL"
    );


    barangaySelect.innerHTML =
        "";

    addOption(
        barangaySelect,
        "",
        "ALL"
    );


    let provinces =
        adminHierarchy.provinces;


    if (
        regionCode !== ""
    ) {

        provinces =
            provinces.filter(
                province =>

                    String(
                        province.adm1_psgc
                    )
                    ===
                    String(
                        regionCode
                    )
            );

    }


    provinces.forEach(
        province => {

            addOption(
                provinceSelect,
                province.adm2_psgc,
                province.adm2_en
            );

        }
    );


    updateSelectorStates();

}


// =========================================================
// POPULATE MUNICIPALITIES
// =========================================================

function populateMunicipalities(
    regionCode,
    provinceCode
) {

    municipalitySelect.innerHTML =
        "";


    addOption(
        municipalitySelect,
        "",
        "ALL"
    );


    barangaySelect.innerHTML =
        "";


    addOption(
        barangaySelect,
        "",
        "ALL"
    );


    let municipalities =
        adminHierarchy.municipalities;


    if (
        regionCode !== ""
    ) {

        municipalities =
            municipalities.filter(
                municipality =>

                    String(
                        municipality.adm1_psgc
                    )
                    ===
                    String(
                        regionCode
                    )
            );

    }


    if (
        provinceCode !== ""
    ) {

        municipalities =
            municipalities.filter(
                municipality =>

                    String(
                        municipality.adm2_psgc
                    )
                    ===
                    String(
                        provinceCode
                    )
            );

    }


    municipalities.forEach(
        municipality => {

            addOption(
                municipalitySelect,
                municipality.adm3_psgc,
                municipality.adm3_en
            );

        }
    );


    updateSelectorStates();

}


// =========================================================
// POPULATE BARANGAYS
// =========================================================

function populateBarangays(
    regionCode,
    provinceCode,
    municipalityCode
) {

    barangaySelect.innerHTML =
        "";


    addOption(
        barangaySelect,
        "",
        "ALL"
    );


    let barangays =
        adminHierarchy.barangays;


    if (
        regionCode !== ""
    ) {

        barangays =
            barangays.filter(
                barangay =>

                    String(
                        barangay.adm1_psgc
                    )
                    ===
                    String(
                        regionCode
                    )
            );

    }


    if (
        provinceCode !== ""
    ) {

        barangays =
            barangays.filter(
                barangay =>

                    String(
                        barangay.adm2_psgc
                    )
                    ===
                    String(
                        provinceCode
                    )
            );

    }


    if (
        municipalityCode !== ""
    ) {

        barangays =
            barangays.filter(
                barangay =>

                    String(
                        barangay.adm3_psgc
                    )
                    ===
                    String(
                        municipalityCode
                    )
            );

    }


    barangays.forEach(
        barangay => {

            addOption(
                barangaySelect,
                barangay.adm4_psgc,
                barangay.adm4_en
            );

        }
    );


    updateSelectorStates();

}


// =========================================================
// GET CURRENT MAP LEVEL
// =========================================================

function getCurrentRecords() {

    const regionCode =
        String(
            regionSelect.value
        );


    const provinceCode =
        String(
            provinceSelect.value
        );


    const municipalityCode =
        String(
            municipalitySelect.value
        );


    const barangayCode =
        String(
            barangaySelect.value
        );


    if (
        barangayCode !== ""
    ) {

        return {

            level:
                "barangays",

            records:
                []

        };

    }


    if (
        municipalityCode !== ""
    ) {

        return {

            level:
                "barangays",

            records:
                []

        };

    }


    if (
        provinceCode !== ""
    ) {

        return {

            level:
                "municipalities",

            records:
                []

        };

    }


    if (
        regionCode !== ""
    ) {

        return {

            level:
                "provinces",

            records:
                []

        };

    }


    return {

        level:
            "regions",

        records:
            []

    };

}


// =========================================================
// UPDATE DYNAMIC JENKS
// =========================================================

function updateDynamicJenks() {

    const indicator =
        indicatorSelect.value;


    const {
        level
    } =
        getCurrentRecords();


    const activeFillLayer =
        `${level}-fill`;


    const features =
        map.queryRenderedFeatures(
            undefined,
            {
                layers:
                    [
                        activeFillLayer
                    ]
            }
        );


    const values =
        features
            .map(
                feature =>
                    Number(
                        feature.properties[
                            indicator
                        ]
                    )
            )
            .filter(
                value =>
                    Number.isFinite(
                        value
                    )
            );


    if (
        values.length === 0
    ) {

        console.warn(
            "No valid values found for dynamic Jenks."
        );

        return;

    }


    const breaks =
        calculateJenks(
            values,
            5
        );


    if (
        breaks.length !== 4
    ) {

        console.warn(
            "Jenks did not return four breaks."
        );

        return;

    }


    const expression =
        createJenksExpression(
            indicator,
            breaks
        );


    map.setPaintProperty(
        activeFillLayer,
        "fill-color",
        expression
    );


    map.setPaintProperty(
        activeFillLayer,
        "fill-opacity",
        1.0
    );


    updateLegend(
        indicator,
        breaks,
        values
    );

}


// =========================================================
// UPDATE MAP FILTERS
// =========================================================

function updateMapFilters() {

    const regionCode =
        String(
            regionSelect.value
        );


    const provinceCode =
        String(
            provinceSelect.value
        );


    const municipalityCode =
        String(
            municipalitySelect.value
        );


    const barangayCode =
        String(
            barangaySelect.value
        );


    map.setFilter(
        "regions-fill",
        null
    );


    map.setFilter(
        "regions-outline",
        null
    );


    if (
        regionCode === ""
    ) {

        map.setFilter(
            "provinces-fill",
            [
                "==",
                [
                    "get",
                    "adm1_psgc"
                ],
                -999999999
            ]
        );


        map.setFilter(
            "provinces-outline",
            [
                "==",
                [
                    "get",
                    "adm1_psgc"
                ],
                -999999999
            ]
        );

    }


    else {

        map.setFilter(
            "provinces-fill",
            [
                "==",
                [
                    "get",
                    "adm1_psgc"
                ],
                Number(
                    regionCode
                )
            ]
        );


        map.setFilter(
            "provinces-outline",
            [
                "==",
                [
                    "get",
                    "adm1_psgc"
                ],
                Number(
                    regionCode
                )
            ]
        );

    }


    if (
        provinceCode === ""
    ) {

        map.setFilter(
            "municipalities-fill",
            [
                "==",
                [
                    "get",
                    "adm2_psgc"
                ],
                -999999999
            ]
        );


        map.setFilter(
            "municipalities-outline",
            [
                "==",
                [
                    "get",
                    "adm2_psgc"
                ],
                -999999999
            ]
        );

    }


    else {

        map.setFilter(
            "municipalities-fill",
            [
                "==",
                [
                    "get",
                    "adm2_psgc"
                ],
                Number(
                    provinceCode
                )
            ]
        );


        map.setFilter(
            "municipalities-outline",
            [
                "==",
                [
                    "get",
                    "adm2_psgc"
                ],
                Number(
                    provinceCode
                )
            ]
        );

    }


    if (
        municipalityCode === ""
    ) {

        map.setFilter(
            "barangays-fill",
            [
                "==",
                [
                    "get",
                    "adm3_psgc"
                ],
                -999999999
            ]
        );


        map.setFilter(
            "barangays-outline",
            [
                "==",
                [
                    "get",
                    "adm3_psgc"
                ],
                -999999999
            ]
        );

    }


    else if (
        barangayCode !== ""
    ) {

        map.setFilter(
            "barangays-fill",
            [
                "==",
                [
                    "get",
                    "adm4_psgc"
                ],
                Number(
                    barangayCode
                )
            ]
        );


        map.setFilter(
            "barangays-outline",
            [
                "==",
                [
                    "get",
                    "adm4_psgc"
                ],
                Number(
                    barangayCode
                )
            ]
        );

    }


    else {

        map.setFilter(
            "barangays-fill",
            [
                "==",
                [
                    "get",
                    "adm3_psgc"
                ],
                Number(
                    municipalityCode
                )
            ]
        );


        map.setFilter(
            "barangays-outline",
            [
                "==",
                [
                    "get",
                    "adm3_psgc"
                ],
                Number(
                    municipalityCode
                )
            ]
        );

    }

}


// =========================================================
// UPDATE MAP
// =========================================================

function updateMap() {

    const {
        level
    } =
        getCurrentRecords();


    const levels = [

        "regions",
        "provinces",
        "municipalities",
        "barangays"

    ];


    updateMapFilters();


    levels.forEach(
        currentLevel => {

            const fillLayer =
                `${currentLevel}-fill`;


            const outlineLayer =
                `${currentLevel}-outline`;


            const isActive =
                currentLevel ===
                level;


            map.setPaintProperty(
                fillLayer,
                "fill-opacity",
                isActive
                    ? 1.0
                    : 0
            );


            map.setPaintProperty(
                outlineLayer,
                "line-opacity",
                isActive
                    ? 1.0
                    : 0
            );

        }
    );


    map.once(
        "idle",
        () => {

            updateDynamicJenks();


            if (
                showLabelsCheckbox
                &&
                showLabelsCheckbox.checked
            ) {

                updateMapLabels();

            }

            else {

                clearLabels();

            }

        }
    );

}


// =========================================================
// GET CURRENT ZOOM TARGET
// =========================================================

function getZoomTarget() {

    const regionCode =
        String(
            regionSelect.value
        );


    const provinceCode =
        String(
            provinceSelect.value
        );


    const municipalityCode =
        String(
            municipalitySelect.value
        );


    const barangayCode =
        String(
            barangaySelect.value
        );


    if (
        barangayCode !== ""
    ) {

        return {

            sourceId:
                "barangays",

            sourceLayer:
                "barangays",

            propertyName:
                "adm4_psgc",

            targetCode:
                barangayCode

        };

    }


    if (
        municipalityCode !== ""
    ) {

        return {

            sourceId:
                "municipalities",

            sourceLayer:
                "municipalities",

            propertyName:
                "adm3_psgc",

            targetCode:
                municipalityCode

        };

    }


    if (
        provinceCode !== ""
    ) {

        return {

            sourceId:
                "provinces",

            sourceLayer:
                "provinces",

            propertyName:
                "adm2_psgc",

            targetCode:
                provinceCode

        };

    }


    if (
        regionCode !== ""
    ) {

        return {

            sourceId:
                "regions",

            sourceLayer:
                "regions",

            propertyName:
                "adm1_psgc",

            targetCode:
                regionCode

        };

    }


    return null;

}


// =========================================================
// EXTEND BOUNDS FROM GEOMETRY
// =========================================================

function extendBoundsFromGeometry(
    bounds,
    geometry
) {

    if (
        !geometry
    ) {

        return;

    }


    if (
        geometry.type ===
        "Polygon"
    ) {

        geometry.coordinates.forEach(
            ring => {

                ring.forEach(
                    coordinate => {

                        bounds.extend(
                            coordinate
                        );

                    }
                );

            }
        );

    }


    else if (
        geometry.type ===
        "MultiPolygon"
    ) {

        geometry.coordinates.forEach(
            polygon => {

                polygon.forEach(
                    ring => {

                        ring.forEach(
                            coordinate => {

                                bounds.extend(
                                    coordinate
                                );

                            }
                        );

                    }
                );

            }
        );

    }

}


// =========================================================
// FIND SOURCE FEATURES
// =========================================================

function findMatchingSourceFeatures(
    target
) {

    const features =
        map.querySourceFeatures(
            target.sourceId,
            {
                sourceLayer:
                    target.sourceLayer
            }
        );


    return features.filter(
        feature =>

            String(
                feature.properties[
                    target.propertyName
                ]
            )
            ===
            target.targetCode
    );

}


// =========================================================
// ZOOM TO SELECTION
// =========================================================
//
// Important:
//
// 1. Cancel old zoom request.
// 2. First try currently loaded source tiles.
// 3. If target is not loaded, briefly reset to
//    the Philippines extent.
// 4. Wait for the new source tiles.
// 5. Find the new target.
// 6. Fit bounds to the new target.
//
// This prevents the previous region's bounds
// from being reused.
//

function zoomToSelection() {

    const requestId =
        ++zoomRequestId;


    const target =
        getZoomTarget();


    if (
        !target
    ) {

        map.fitBounds(
            philippinesBounds,
            {
                padding:
                    50,

                duration:
                    600
            }
        );


        return;

    }


    function fitToTarget() {

        if (
            requestId !==
            zoomRequestId
        ) {

            return;

        }


        const matchingFeatures =
            findMatchingSourceFeatures(
                target
            );


        if (
            matchingFeatures.length === 0
        ) {

            console.warn(
                "Target feature not currently loaded."
            );

            return;

        }


        const bounds =
            new maplibregl.LngLatBounds();


        matchingFeatures.forEach(
            feature => {

                extendBoundsFromGeometry(
                    bounds,
                    feature.geometry
                );

            }
        );


        if (
            bounds.isEmpty()
        ) {

            console.warn(
                "Target feature has empty bounds."
            );

            return;

        }


        map.fitBounds(
            bounds,
            {

                padding:
                    60,

                duration:
                    1200,

                maxZoom:
                    12

            }
        );

    }


    // First try the currently loaded tiles.
    const alreadyLoaded =
        findMatchingSourceFeatures(
            target
        );


    if (
        alreadyLoaded.length > 0
    ) {

        fitToTarget();

        return;

    }


    // The new selection may be outside the
    // currently loaded viewport.
    //
    // Move immediately to the Philippines
    // extent to force the relevant PMTiles
    // source tiles to load.
    map.fitBounds(
        philippinesBounds,
        {
            padding:
                20,

            duration:
                0
        }
    );


    map.once(
        "idle",
        () => {

            if (
                requestId !==
                zoomRequestId
            ) {

                return;

            }


            // Allow the PMTiles source one
            // additional render cycle.
            setTimeout(
                () => {

                    if (
                        requestId !==
                        zoomRequestId
                    ) {

                        return;

                    }


                    fitToTarget();

                },
                100
            );

        }
    );

}


// =========================================================
// REGION CHANGE
// =========================================================

regionSelect.addEventListener(
    "change",
    () => {

        populateProvinces(
            regionSelect.value
        );


        updateMap();


        zoomToSelection();

    }
);


// =========================================================
// PROVINCE CHANGE
// =========================================================

provinceSelect.addEventListener(
    "change",
    () => {

        populateMunicipalities(
            regionSelect.value,

            provinceSelect.value
        );


        updateMap();


        zoomToSelection();

    }
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

            municipalitySelect.value
        );


        updateMap();


        zoomToSelection();

    }
);


// =========================================================
// BARANGAY CHANGE
// =========================================================

barangaySelect.addEventListener(
    "change",
    () => {

        updateMap();


        zoomToSelection();

    }
);


// =========================================================
// INDICATOR CHANGE
// =========================================================

indicatorSelect.addEventListener(
    "change",
    () => {

        updateMap();

    }
);


// =========================================================
// LABEL CHECKBOX
// =========================================================

if (
    showLabelsCheckbox
) {

    showLabelsCheckbox.addEventListener(
        "change",
        () => {

            if (
                showLabelsCheckbox.checked
            ) {

                updateMapLabels();

            }

            else {

                clearLabels();

            }

        }
    );

}


// =========================================================
// UPDATE LEGEND
// =========================================================

function updateLegend(
    indicator,
    breaks,
    values
) {

    const indicatorTitle =
        document.getElementById(
            "legend-indicator-title"
        );


    const labels = [

        document.getElementById(
            "legend-label-0"
        ),

        document.getElementById(
            "legend-label-1"
        ),

        document.getElementById(
            "legend-label-2"
        ),

        document.getElementById(
            "legend-label-3"
        ),

        document.getElementById(
            "legend-label-4"
        )

    ];


    if (
        !values
        ||
        values.length === 0
        ||
        !breaks
        ||
        breaks.length !== 4
    ) {

        return;

    }


    const minValue =
        Math.min(
            ...values
        );


    const maxValue =
        Math.max(
            ...values
        );


    if (
        indicatorTitle
    ) {

        indicatorTitle.textContent =
            indicator;

    }


    if (
        labels[0]
    ) {

        labels[0].textContent =
            `${formatLegendValue(
                minValue
            )}% – ${formatLegendValue(
                breaks[0]
            )}%`;

    }


    if (
        labels[1]
    ) {

        labels[1].textContent =
            `${formatLegendValue(
                breaks[0]
            )}% – ${formatLegendValue(
                breaks[1]
            )}%`;

    }


    if (
        labels[2]
    ) {

        labels[2].textContent =
            `${formatLegendValue(
                breaks[1]
            )}% – ${formatLegendValue(
                breaks[2]
            )}%`;

    }


    if (
        labels[3]
    ) {

        labels[3].textContent =
            `${formatLegendValue(
                breaks[2]
            )}% – ${formatLegendValue(
                breaks[3]
            )}%`;

    }


    if (
        labels[4]
    ) {

        labels[4].textContent =
            `${formatLegendValue(
                breaks[3]
            )}% – ${formatLegendValue(
                maxValue
            )}%`;

    }

}


// =========================================================
// FORMAT LEGEND VALUE
// =========================================================

function formatLegendValue(
    value
) {

    const numericValue =
        Number(
            value
        );


    if (
        !Number.isFinite(
            numericValue
        )
    ) {

        return "";

    }


    if (
        numericValue === 0
    ) {

        return "0";

    }


    return numericValue
        .toPrecision(
            4
        )
        .replace(
            /(?:\.0+|(\.\d+?)0+)(?=e|$)/,
            "$1"
        )
        .replace(
            /e\+?/,
            "e"
        );

}


// =========================================================
// COLLAPSIBLE LEGEND
// =========================================================

const legendToggle =
    document.getElementById(
        "legend-toggle"
    );


const legendContent =
    document.getElementById(
        "legend-content"
    );


const legendArrow =
    document.getElementById(
        "legend-arrow"
    );


if (
    legendToggle
    &&
    legendContent
    &&
    legendArrow
) {

    legendToggle.addEventListener(
        "click",
        () => {

            const isHidden =
                legendContent.style.display ===
                "none";


            if (
                isHidden
            ) {

                legendContent.style.display =
                    "block";


                legendArrow.textContent =
                    "▲";

            }


            else {

                legendContent.style.display =
                    "none";


                legendArrow.textContent =
                    "▼";

            }

        }
    );

}


// =========================================================
// UPDATE LABELS WHEN MAP MOVES
// =========================================================

map.on(
    "moveend",
    () => {

        if (
            showLabelsCheckbox
            &&
            showLabelsCheckbox.checked
        ) {

            updateMapLabels();

        }

        else {

            clearLabels();

        }

    }
);


// =========================================================
// POPUPS
// =========================================================

const clickableLayers = [

    "regions-fill",

    "provinces-fill",

    "municipalities-fill",

    "barangays-fill"

];


clickableLayers.forEach(
    layer => {


        map.on(
            "click",
            layer,
            event => {

                const feature =
                    event.features[0];


                if (
                    !feature
                ) {

                    return;

                }


                const properties =
                    feature.properties;


                let html =
                    "<div class='popup-content'>";


                for (
                    const key in properties
                ) {

                    html += `

                        <div class="property-row">

                            <strong>

                                ${key}

                            </strong>

                            <span>

                                ${properties[key]}

                            </span>

                        </div>

                    `;

                }


                html +=
                    "</div>";


                new maplibregl.Popup()

                    .setLngLat(
                        event.lngLat
                    )

                    .setHTML(
                        html
                    )

                    .addTo(
                        map
                    );

            }
        );


        map.on(
            "mouseenter",
            layer,
            () => {

                map.getCanvas().style.cursor =
                    "pointer";

            }
        );


        map.on(
            "mouseleave",
            layer,
            () => {

                map.getCanvas().style.cursor =
                    "";

            }
        );

    }
);