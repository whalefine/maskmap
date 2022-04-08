<template>
  <div id="map">
    <l-map
      style="height: 100vh;width: 100vw"
      :zoom="zoom"
      :center="center"
      :options="options"
    >
      <l-tile-layer
        :url="url"
        :attribution="attribution"
      ></l-tile-layer>
      <l-marker
        v-for="(markerItem,markerIndex) in markers"
        :key="markerIndex"
        ref="marker"
        :lat-lng="markerItem.latlng"
        :icon="markerItem.icon"
        @click="$_markerClick($event,markerIndex)"
      >
        <l-popup
          v-if="markerItem.content"
          :content="markerItem.content"
          :options="popupOption"
        >
        </l-popup>
      </l-marker>
    </l-map>
  </div>
</template>
<script>
import { LMap, LTileLayer, LMarker, LIcon, LPopup } from "vue2-leaflet";
export default {
  name: "Map",
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LIcon,
    LPopup,
  },
  data() {
    return {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution:
        '&copy; <a target="_blank" href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      zoom: 14,
      center: [25.03, 121.55],
      bounds: null,
      options: {
        zoomControl: false,
      },
      icon: L.icon({
        iconUrl:
          "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      }),
    };
  },
  methods: {
    $_markerClick($event, index) {
      this.$_goto($event.latlng.lat, $event.latlng.lng);
      this.$emit("selected", { ...$event, index: index });
    },
    $_goto(lat, lng) {
      this.center = [lat, lng];
    },
  },
  computed: {},
  watch: {
    markers: {
      handler() {
        if (this.markers && this.markers.length) {
          const markerLength = this.markers.length;
          let lng = 0;
          let lat = 0;
          this.markers.forEach((item) => {
            lng += item.latlng[1];
            lat += item.latlng[0];
          });
          this.$_goto(lat / markerLength, lng / markerLength);
        }
      },
    },
  },
  props: {
    markers: {
      type: Array,
    },
    popupOption: {
      type: Object,
    },
  },
};
</script>