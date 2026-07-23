const protocol = new pmtiles.Protocol();

maplibregl.addProtocol("pmtiles", protocol.tile);

const regiUrl =
  "https://phgeodex-data.dimasakajoshua.workers.dev/2020regTaxonomy.pmtiles";

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
        "source-layer": "2020regTaxonomy",

        paint: {
          "fill-color": "#4C78A8",
          "fill-opacity": 0.6
        }
      },

      {
        id: "regional-outline",
        type: "line",
        source: "regi",
        "source-layer": "2020regTaxonomy",

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

map.addControl(new maplibregl.NavigationControl());