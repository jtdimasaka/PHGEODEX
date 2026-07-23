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
// JENKS BREAKS
// =========================================================

const jenksBreaks = {

  C1: [
    12,
    28,
    47,
    71
  ],

  CHBMWS: [
    10,
    25,
    45,
    70
  ],

  CWS: [
    10,
    25,
    45,
    70
  ],

  N: [
    10,
    25,
    45,
    70
  ],

  S1: [
    10,
    25,
    45,
    70
  ],

  S3: [
    10,
    25,
    45,
    70
  ],

  URA: [
    10,
    25,
    45,
    70
  ],

  URM: [
    10,
    25,
    45,
    70
  ],

  W1W3: [
    10,
    25,
    45,
    70
  ],

  W2: [
    10,
    25,
    45,
    70
  ]

};


// =========================================================
// CREATE JENKS COLOR EXPRESSION
// =========================================================

function createJenksExpression(

  indicator

) {

  const breaks =
    jenksBreaks[indicator];


  return [

    "step",

    [

      "get",

      indicator

    ],

    "#440154",

    breaks[0],
    "#3B528B",

    breaks[1],
    "#21918C",

    breaks[2],
    "#5EC962",

    breaks[3],
    "#FDE725"

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
              createJenksExpression(

                "C1"

              ),

            "fill-opacity":
              0.7

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

            "line-opacity":
              0.8,

            "line-width":
              1

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

          layout: {

            visibility:
              "none"

          },

          paint: {

            "fill-color":
              createJenksExpression(

                "C1"

              ),

            "fill-opacity":
              0.7

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

          layout: {

            visibility:
              "none"

          },

          paint: {

            "line-color":
              "#333333",

            "line-opacity":
              0.8,

            "line-width":
              1

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

          layout: {

            visibility:
              "none"

          },

          paint: {

            "fill-color":
              createJenksExpression(

                "C1"

              ),

            "fill-opacity":
              0.7

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

          layout: {

            visibility:
              "none"

          },

          paint: {

            "line-color":
              "#333333",

            "line-opacity":
              0.8,

            "line-width":
              1

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

          layout: {

            visibility:
              "none"

          },

          paint: {

            "fill-color":
              createJenksExpression(

                "C1"

              ),

            "fill-opacity":
              0.7

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

          layout: {

            visibility:
              "none"

          },

          paint: {

            "line-color":
              "#333333",

            "line-opacity":
              0.8,

            "line-width":
              0.5

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
// LEGEND SELECTORS
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


const legendIndicatorTitle =
  document.getElementById(

    "legend-indicator-title"

  );


const legendLabel0 =
  document.getElementById(

    "legend-label-0"

  );


const legendLabel1 =
  document.getElementById(

    "legend-label-1"

  );


const legendLabel2 =
  document.getElementById(

    "legend-label-2"

  );


const legendLabel3 =
  document.getElementById(

    "legend-label-3"

  );


const legendLabel4 =
  document.getElementById(

    "legend-label-4"

  );


// =========================================================
// LEGEND TOGGLE
// =========================================================

legendToggle.addEventListener(

  "click",

  () => {


    const isVisible =

      legendContent.style.display !==
      "none";


    if (

      isVisible

    ) {


      legendContent.style.display =
        "none";


      legendArrow.textContent =
        "▼";

    }


    else {


      legendContent.style.display =
        "block";


      legendArrow.textContent =
        "▲";

    }

  }

);


// =========================================================
// UPDATE LEGEND
// =========================================================

function updateLegend(

  indicator

) {


  const breaks =
    jenksBreaks[indicator];


  if (

    !breaks

  ) {

    return;

  }


  legendIndicatorTitle.textContent =
    indicator;


  legendLabel0.textContent =
    `0–${breaks[0]}%`;


  legendLabel1.textContent =
    `${breaks[0]}–${breaks[1]}%`;


  legendLabel2.textContent =
    `${breaks[1]}–${breaks[2]}%`;


  legendLabel3.textContent =
    `${breaks[2]}–${breaks[3]}%`;


  legendLabel4.textContent =
    `>${breaks[3]}%`;

}


// =========================================================
// ADMINISTRATIVE HIERARCHY
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


      populateProvinces(

        ""

      );


      populateMunicipalities(

        "",

        ""

      );


      populateBarangays(

        "",

        "",

        ""

      );


      showInitialMap();

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
// SET LAYER VISIBILITY
// =========================================================

function setLayerVisibility(

  level,

  visibility

) {


  map.setLayoutProperty(

    `${level}-fill`,

    "visibility",

    visibility

  );


  map.setLayoutProperty(

    `${level}-outline`,

    "visibility",

    visibility

  );

}


// =========================================================
// SET LAYER OPACITY
// =========================================================

function setLayerOpacity(

  level,

  fillOpacity,

  lineOpacity

) {


  map.setPaintProperty(

    `${level}-fill`,

    "fill-opacity",

    fillOpacity

  );


  map.setPaintProperty(

    `${level}-outline`,

    "line-opacity",

    lineOpacity

  );

}


// =========================================================
// SET FILTER
// =========================================================

function setLevelFilter(

  level,

  filter

) {


  map.setFilter(

    `${level}-fill`,

    filter

  );


  map.setFilter(

    `${level}-outline`,

    filter

  );

}


// =========================================================
// CLEAR ALL FILTERS
// =========================================================

function clearAllFilters() {


  const levels = [

    "regions",

    "provinces",

    "municipalities",

    "barangays"

  ];


  levels.forEach(

    level => {


      setLevelFilter(

        level,

        null

      );

    }

  );

}


// =========================================================
// INITIAL MAP
// =========================================================

function showInitialMap() {


  clearAllFilters();


  setLayerVisibility(

    "regions",

    "visible"

  );


  setLayerVisibility(

    "provinces",

    "none"

  );


  setLayerVisibility(

    "municipalities",

    "none"

  );


  setLayerVisibility(

    "barangays",

    "none"

  );


  setLayerOpacity(

    "regions",

    0.7,

    0.8

  );


  fitToAllRegions();

}


// =========================================================
// REGION CHANGE
// =========================================================

regionSelect.addEventListener(

  "change",

  event => {


    const regionCode =
      String(

        event.target.value

      );


    populateProvinces(

      regionCode

    );


    clearAllFilters();


    if (

      regionCode === ""

    ) {


      setLayerVisibility(

        "regions",

        "visible"

      );


      setLayerVisibility(

        "provinces",

        "none"

      );


      setLayerVisibility(

        "municipalities",

        "none"

      );


      setLayerVisibility(

        "barangays",

        "none"

      );


      setLayerOpacity(

        "regions",

        0.7,

        0.8

      );


      fitToAllRegions();


      return;

    }


    setLayerVisibility(

      "regions",

      "visible"

    );


    setLayerVisibility(

      "provinces",

      "visible"

    );


    setLayerVisibility(

      "municipalities",

      "none"

    );


    setLayerVisibility(

      "barangays",

      "none"

    );


    setLayerOpacity(

      "regions",

      0.35,

      0.5

    );


    setLayerOpacity(

      "provinces",

      0.7,

      0.8

    );


    setLevelFilter(

      "provinces",

      [

        "==",

        [

          "to-string",

          [

            "get",

            "adm1_psgc"

          ]

        ],

        regionCode

      ]

    );


    const selectedRegion =

      adminHierarchy.regions.find(

        region =>


          String(

            region.adm1_psgc

          )

          ===

          regionCode

      );


    if (

      selectedRegion &&

      selectedRegion.bbox

    ) {


      fitToBBox(

        selectedRegion.bbox

      );

    }

  }

);


// =========================================================
// PROVINCE CHANGE
// =========================================================

provinceSelect.addEventListener(

  "change",

  event => {


    const regionCode =
      String(

        regionSelect.value

      );


    const provinceCode =
      String(

        event.target.value

      );


    populateMunicipalities(

      regionCode,

      provinceCode

    );


    clearAllFilters();


    if (

      provinceCode === ""

    ) {


      if (

        regionCode !== ""

      ) {


        setLayerVisibility(

          "regions",

          "visible"

        );


        setLayerVisibility(

          "provinces",

          "visible"

        );


        setLayerVisibility(

          "municipalities",

          "none"

        );


        setLayerVisibility(

          "barangays",

          "none"

        );


        setLayerOpacity(

          "regions",

          0.35,

          0.5

        );


        setLayerOpacity(

          "provinces",

          0.7,

          0.8

        );


        setLevelFilter(

          "provinces",

          [

            "==",

            [

              "to-string",

              [

                "get",

                "adm1_psgc"

              ]

            ],

            regionCode

          ]

        );


        const selectedRegion =

          adminHierarchy.regions.find(

            region =>


              String(

                region.adm1_psgc

              )

              ===

              regionCode

          );


        if (

          selectedRegion &&

          selectedRegion.bbox

        ) {


          fitToBBox(

            selectedRegion.bbox

          );

        }

      }


      else {


        showInitialMap();

      }


      return;

    }


    setLayerVisibility(

      "regions",

      "visible"

    );


    setLayerVisibility(

      "provinces",

      "visible"

    );


    setLayerVisibility(

      "municipalities",

      "visible"

    );


    setLayerVisibility(

      "barangays",

      "none"

    );


    setLayerOpacity(

      "regions",

      0.35,

      0.5

    );


    setLayerOpacity(

      "provinces",

      0.35,

      0.5

    );


    setLayerOpacity(

      "municipalities",

      0.7,

      0.8

    );


    setLevelFilter(

      "provinces",

      [

        "==",

        [

          "to-string",

          [

            "get",

            "adm2_psgc"

          ]

        ],

        provinceCode

      ]

    );


    setLevelFilter(

      "municipalities",

      [

        "==",

        [

          "to-string",

          [

            "get",

            "adm2_psgc"

          ]

        ],

        provinceCode

      ]

    );


    const selectedProvince =

      adminHierarchy.provinces.find(

        province =>


          String(

            province.adm2_psgc

          )

          ===

          provinceCode

      );


    if (

      selectedProvince &&

      selectedProvince.bbox

    ) {


      fitToBBox(

        selectedProvince.bbox

      );

    }

  }

);


// =========================================================
// MUNICIPALITY CHANGE
// =========================================================

municipalitySelect.addEventListener(

  "change",

  event => {


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

        event.target.value

      );


    populateBarangays(

      regionCode,

      provinceCode,

      municipalityCode

    );


    clearAllFilters();


    if (

      municipalityCode === ""

    ) {


      if (

        provinceCode !== ""

      ) {


        setLayerVisibility(

          "regions",

          "visible"

        );


        setLayerVisibility(

          "provinces",

          "visible"

        );


        setLayerVisibility(

          "municipalities",

          "visible"

        );


        setLayerVisibility(

          "barangays",

          "none"

        );


        setLayerOpacity(

          "regions",

          0.35,

          0.5

        );


        setLayerOpacity(

          "provinces",

          0.35,

          0.5

        );


        setLayerOpacity(

          "municipalities",

          0.7,

          0.8

        );


        setLevelFilter(

          "provinces",

          [

            "==",

            [

              "to-string",

              [

                "get",

                "adm2_psgc"

              ]

            ],

            provinceCode

          ]

        );


        setLevelFilter(

          "municipalities",

          [

            "==",

            [

              "to-string",

              [

                "get",

                "adm2_psgc"

              ]

            ],

            provinceCode

          ]

        );


        const selectedProvince =

          adminHierarchy.provinces.find(

            province =>


              String(

                province.adm2_psgc

              )

              ===

              provinceCode

          );


        if (

          selectedProvince &&

          selectedProvince.bbox

        ) {


          fitToBBox(

            selectedProvince.bbox

          );

        }

      }


      else {


        showInitialMap();

      }


      return;

    }


    setLayerVisibility(

      "regions",

      "visible"

    );


    setLayerVisibility(

      "provinces",

      "visible"

    );


    setLayerVisibility(

      "municipalities",

      "visible"

    );


    setLayerVisibility(

      "barangays",

      "visible"

    );


    setLayerOpacity(

      "regions",

      0.35,

      0.5

    );


    setLayerOpacity(

      "provinces",

      0.35,

      0.5

    );


    setLayerOpacity(

      "municipalities",

      0.35,

      0.5

    );


    setLayerOpacity(

      "barangays",

      0.7,

      0.8

    );


    setLevelFilter(

      "municipalities",

      [

        "==",

        [

          "to-string",

          [

            "get",

            "adm3_psgc"

          ]

        ],

        municipalityCode

      ]

    );


    setLevelFilter(

      "barangays",

      [

        "==",

        [

          "to-string",

          [

            "get",

            "adm3_psgc"

          ]

        ],

        municipalityCode

      ]

    );


    const selectedMunicipality =

      adminHierarchy.municipalities.find(

        municipality =>


          String(

            municipality.adm3_psgc

          )

          ===

          municipalityCode

      );


    if (

      selectedMunicipality &&

      selectedMunicipality.bbox

    ) {


      fitToBBox(

        selectedMunicipality.bbox

      );

    }

  }

);


// =========================================================
// BARANGAY CHANGE
// =========================================================

barangaySelect.addEventListener(

  "change",

  event => {


    const barangayCode =
      String(

        event.target.value

      );


    clearAllFilters();


    if (

      barangayCode === ""

    ) {

      return;

    }


    setLayerVisibility(

      "regions",

      "visible"

    );


    setLayerVisibility(

      "provinces",

      "visible"

    );


    setLayerVisibility(

      "municipalities",

      "visible"

    );


    setLayerVisibility(

      "barangays",

      "visible"

    );


    setLayerOpacity(

      "regions",

      0.35,

      0.5

    );


    setLayerOpacity(

      "provinces",

      0.35,

      0.5

    );


    setLayerOpacity(

      "municipalities",

      0.35,

      0.5

    );


    setLayerOpacity(

      "barangays",

      0.7,

      0.8

    );


    setLevelFilter(

      "barangays",

      [

        "==",

        [

          "to-string",

          [

            "get",

            "adm4_psgc"

          ]

        ],

        barangayCode

      ]

    );


    const selectedBarangay =

      adminHierarchy.barangays.find(

        barangay =>


          String(

            barangay.adm4_psgc

          )

          ===

          barangayCode

      );


    if (

      selectedBarangay &&

      selectedBarangay.bbox

    ) {


      fitToBBox(

        selectedBarangay.bbox

      );

    }

  }

);


// =========================================================
// FIT TO ALL REGIONS
// =========================================================

function fitToAllRegions() {


  const bboxes =

    adminHierarchy.regions

      .filter(

        region =>

          region.bbox

      )

      .map(

        region =>

          region.bbox

      );


  if (

    bboxes.length ===
    0

  ) {

    return;

  }


  let minLon =
    Infinity;


  let minLat =
    Infinity;


  let maxLon =
    -Infinity;


  let maxLat =
    -Infinity;


  bboxes.forEach(

    bbox => {


      minLon =
        Math.min(

          minLon,

          bbox[0]

        );


      minLat =
        Math.min(

          minLat,

          bbox[1]

        );


      maxLon =
        Math.max(

          maxLon,

          bbox[2]

        );


      maxLat =
        Math.max(

          maxLat,

          bbox[3]

        );

    }

  );


  fitToBBox(

    [

      minLon,

      minLat,

      maxLon,

      maxLat

    ]

  );

}


// =========================================================
// FIT TO BBOX
// =========================================================

function fitToBBox(

  bbox

) {


  if (

    !bbox ||

    bbox.length <
    4

  ) {

    return;

  }


  map.fitBounds(

    [

      [

        bbox[0],

        bbox[1]

      ],

      [

        bbox[2],

        bbox[3]

      ]

    ],

    {

      padding:
        40,

      duration:
        1000

    }

  );

}


// =========================================================
// INDICATOR SWITCHER
// =========================================================

indicatorSelect.addEventListener(

  "change",

  event => {


    const indicator =
      event.target.value;


    const fillLayers = [

      "regions-fill",

      "provinces-fill",

      "municipalities-fill",

      "barangays-fill"

    ];


    fillLayers.forEach(

      layer => {


        map.setPaintProperty(

          layer,

          "fill-color",

          createJenksExpression(

            indicator

          )

        );

      }

    );


    updateLegend(

      indicator

    );

  }

);


// =========================================================
// INITIAL LEGEND
// =========================================================

updateLegend(

  indicatorSelect.value

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