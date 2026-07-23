const map = new maplibregl.Map({
  container: "map",

  style: {
    version: 8,

    sources: {},

    layers: [
      {
        id: "background",
        type: "background",
        paint: {
          "background-color": "#d9d9d9"
        }
      }
    ]
  },

  center: [121, 12],
  zoom: 5
});

map.addControl(new maplibregl.NavigationControl());