// ===============================
// PMTiles protocol
// ===============================

const protocol = new pmtiles.Protocol();
maplibregl.addProtocol("pmtiles", protocol.tile);


// ===============================
// PMTiles URL
// ===============================

const regiUrl =
  "https://phgeodex-data.dimasakajoshua.workers.dev/2020regTaxonomy.pmtiles";


// ===============================
// Map
// ===============================

const map = new maplibregl.Map({
  container: "map",

  style: {
    version: 8,

    sources: {
      regi: {
        type: "vector",
        url: `pmtiles://${regiUrl}`
      }
    },

    layers: [
      {
        id: "regional-fill",
        type: "fill",
        source: "regi",
        "source-layer": "regTaxonomy",

        paint: {
          "fill-color": "#4C78A8",
          "fill-opacity": 0.5
        }
      },

      {
        id: "regional-outline",
        type: "line",
        source: "regi",
        "source-layer": "regTaxonomy",

        paint: {
          "line-color": "#333333",
          "line-width": 1
        }
      }
    ]
  },

  center: [121, 12],
  zoom: 5
});


// ===============================
// Navigation controls
// ===============================

map.addControl(new maplibregl.NavigationControl());


// ===============================
// Click interaction
// ===============================

map.on("click", "regional-fill", (e) => {
  const properties = e.features[0].properties;

  new maplibregl.Popup()
    .setLngLat(e.lngLat)
    .setHTML(`
      <strong>Region</strong><br>
      ${properties.reg_en || "Unknown"}
    `)
    .addTo(map);
});


// ===============================
// Cursor
// ===============================

map.on("mouseenter", "regional-fill", () => {
  map.getCanvas().style.cursor = "pointer";
});

map.on("mouseleave", "regional-fill", () => {
  map.getCanvas().style.cursor = "";
});