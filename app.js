// =========================================================
// PMTILES PROTOCOL
// =========================================================

const protocol = new pmtiles.Protocol();

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
                    Number(
                        value
                    )
            )

            .filter(
                value =>
                    Number.isFinite(
                        value
                    )
            )

            .sort(
                (
                    a,
                    b
                ) =>
                    a - b
            );


    // =====================================================
    // NO VALID VALUES
    // =====================================================

    if (
        cleanValues.length === 0
    ) {

        return [];

    }


    // =====================================================
    // UNIQUE VALUES
    // =====================================================

    const uniqueValues =
        [
            ...new Set(
                cleanValues
            )
        ];


    // =====================================================
    // ONLY ONE UNIQUE VALUE
    // =====================================================

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


    // =====================================================
    // FEWER THAN 5 UNIQUE VALUES
    // =====================================================

    if (
        uniqueValues.length <
        numberOfClasses
    ) {


        const breaks =
            [];


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


    // =====================================================
    // JENKS OPTIMIZATION
    // =====================================================

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
                .fill(
                    0
                )

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
                .fill(
                    Infinity
                )

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
                l - m + 1;


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
                sumSquares
                -
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
        let j =
            numberOfClasses;

        j >= 2;

        j--
    ) {


        const id =
            lowerClassLimits[k][j]
            -
            2;


        breaks[j - 2] =
            cleanValues[id];


        k =
            lowerClassLimits[k][j]
            -
            1;

    }


    return breaks.sort(

        (
            a,
            b
        ) =>
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


                // =================================================
                // LIGHT GRAY BASEMAP
                // =================================================

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


                // =================================================
                // REGIONS
                // =================================================

                regions: {

                    type:
                        "vector",


                    url:
                        `pmtiles://${regiUrl}`

                },


                // =================================================
                // PROVINCES
                // =================================================

                provinces: {

                    type:
                        "vector",


                    url:
                        `pmtiles://${prvUrl}`

                },


                // =================================================
                // MUNICIPALITIES
                // =================================================

                municipalities: {

                    type:
                        "vector",


                    url:
                        `pmtiles://${munUrl}`

                },


                // =================================================
                // BARANGAYS
                // =================================================

                barangays: {

                    type:
                        "vector",


                    url:
                        `pmtiles://${brgyUrl}`

                }

            },


            layers: [


                // =================================================
                // BASEMAP
                // =================================================

                {

                    id:
                        "basemap",


                    type:
                        "raster",


                    source:
                        "basemap"

                },


                // =================================================
                // REGIONS
                // =================================================

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


                // =================================================
                // PROVINCES
                // =================================================

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


                // =================================================
                // MUNICIPALITIES
                // =================================================

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


                // =================================================
                // BARANGAYS
                // =================================================

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


        center: [

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


    // =====================================================
    // BARANGAY SELECTED
    // =====================================================

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


    // =====================================================
    // MUNICIPALITY SELECTED
    // =====================================================

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


    // =====================================================
    // PROVINCE SELECTED
    // =====================================================

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


    // =====================================================
    // REGION SELECTED
    // =====================================================

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


    // =====================================================
    // ALL SELECTED
    // =====================================================

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


    // =====================================================
    // GET ACTUAL VISIBLE FEATURES
    // =====================================================

    const features =
        map.queryRenderedFeatures(

            undefined,

            {

                layers: [

                    activeFillLayer

                ]

            }

        );


    // =====================================================
    // GET INDICATOR VALUES
    // =====================================================

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


    console.log(
        "ACTIVE LEVEL:",
        level
    );


    console.log(
        "ACTIVE INDICATOR:",
        indicator
    );


    console.log(
        "VISIBLE FEATURES:",
        features.length
    );


    console.log(
        "VALUES USED FOR JENKS:",
        values
    );


    // =====================================================
    // NO VALUES
    // =====================================================

    if (
        values.length === 0
    ) {


        console.warn(

            "No valid values found for dynamic Jenks."

        );


        return;

    }


    // =====================================================
    // CALCULATE JENKS
    // =====================================================

    const breaks =
        calculateJenks(

            values,

            5

        );


    console.log(

        "DYNAMIC JENKS BREAKS:",

        breaks

    );


    if (

        breaks.length !== 4

    ) {


        console.warn(

            "Jenks did not return four breaks."

        );


        return;

    }


    // =====================================================
    // CREATE COLOR EXPRESSION
    // =====================================================

    const expression =
        createJenksExpression(

            indicator,

            breaks

        );


    // =====================================================
    // APPLY COLOR EXPRESSION
    // =====================================================

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


    // =====================================================
    // UPDATE LEGEND
    // =====================================================

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


    // =====================================================
    // REGIONS
    // =====================================================

    map.setFilter(

        "regions-fill",

        null

    );


    map.setFilter(

        "regions-outline",

        null

    );


    // =====================================================
    // PROVINCES
    // =====================================================

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


    // =====================================================
    // MUNICIPALITIES
    // =====================================================

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


    // =====================================================
    // BARANGAYS
    // =====================================================

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


    // =====================================================
    // APPLY FILTERS FIRST
    // =====================================================

    updateMapFilters();


    // =====================================================
    // SHOW ONLY ACTIVE ADMINISTRATIVE LEVEL
    // =====================================================

    levels.forEach(

        currentLevel => {


            const fillLayer =
                `${currentLevel}-fill`;


            const outlineLayer =
                `${currentLevel}-outline`;


            const isActive =
                currentLevel === level;


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


    // =====================================================
    // WAIT FOR FILTERS TO RENDER
    // =====================================================

    map.once(

        "idle",

        () => {


            updateDynamicJenks();

        }

    );

}


// =========================================================
// ZOOM TO SELECTION
// =========================================================

function zoomToSelection() {


    const {

        level

    } =
        getCurrentRecords();


    let layerId;


    let targetCode;


    let propertyName;


    // =====================================================
    // REGION SELECTED
    // =====================================================

    if (

        level === "provinces"

    ) {


        layerId =
            "regions-fill";


        targetCode =
            String(

                regionSelect.value

            );


        propertyName =
            "adm1_psgc";

    }


    // =====================================================
    // PROVINCE SELECTED
    // =====================================================

    else if (

        level === "municipalities"

    ) {


        layerId =
            "provinces-fill";


        targetCode =
            String(

                provinceSelect.value

            );


        propertyName =
            "adm2_psgc";

    }


    // =====================================================
    // MUNICIPALITY OR BARANGAY
    // =====================================================

    else if (

        level === "barangays"

    ) {


        if (

            barangaySelect.value !== ""

        ) {


            layerId =
                "barangays-fill";


            targetCode =
                String(

                    barangaySelect.value

                );


            propertyName =
                "adm4_psgc";

        }


        else {


            layerId =
                "municipalities-fill";


            targetCode =
                String(

                    municipalitySelect.value

                );


            propertyName =
                "adm3_psgc";

        }

    }


    // =====================================================
    // ALL PHILIPPINES
    // =====================================================

    else {


        map.fitBounds(

            [

                [

                    116.5,

                    4.5

                ],

                [

                    127.0,

                    21.5

                ]

            ],

            {

                padding:
                    50,


                duration:
                    1200

            }

        );


        return;

    }


    // =====================================================
    // QUERY VISIBLE FEATURE
    // =====================================================

    const features =
        map.queryRenderedFeatures(

            undefined,

            {

                layers: [

                    layerId

                ]

            }

        );


    const matchingFeatures =
        features.filter(

            feature =>


                String(

                    feature.properties[
                        propertyName
                    ]

                )

                ===

                targetCode

        );


    if (

        matchingFeatures.length === 0

    ) {


        console.warn(

            "No matching feature found for zoom."

        );


        return;

    }


    const bounds =
        new maplibregl.LngLatBounds();


    matchingFeatures.forEach(

        feature => {


            const geometry =
                feature.geometry;


            if (

                geometry.type === "Polygon"

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

                geometry.type === "MultiPolygon"

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

    );


    if (

        !bounds.isEmpty()

    ) {


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

        !values ||

        values.length === 0 ||

        !breaks ||

        breaks.length !== 4

    ) {


        return;

    }


    // =====================================================
    // ACTUAL MINIMUM AND MAXIMUM OF CURRENT MAP FEATURES
    // =====================================================

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


    return Number(

        value

    ).toFixed(

        1

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

    legendToggle &&

    legendContent &&

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