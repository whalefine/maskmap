<template>
  <div class="row no-gutters">
    <a
      class="show-icon"
      @click="isShow = !isShow"
    >
      <i :class="[isShow ? toggleClass.classA : toggleClass.classB]"></i>
    </a>
    <loading :active.sync="isLoading"></loading>
    <div class="col-sm">
      <Map
        :markers="markers"
        ref="Map"
      ></Map>
    </div>
    <div
      class="col-sm-6 col-md-5 col-lg-4 col-xl-3 position-absolute fixed-top content"
      :class="{show:isShow}"
    >
      <div class="topnav p-3 sticky-top">
        <BelongsToSelect
          :optionList="areaList"
          :textKey="area.textKey"
          :value="select.area"
          @input="$_onInput('area',$event)"
          label="縣市"
        ></BelongsToSelect>
        <BelongsToSelect
          :optionList="_areaSectionList"
          :textKey="areaSection.textKey"
          :value="select.areaSection"
          @input="$_onInput('areaSection',$event)"
          label="地區"
        ></BelongsToSelect>
        <p class="mb-0 color-white text-right">
          <i class="fas fa-circle"></i> 還有口罩 |
          <i class="fas fa-circle"></i> 沒有口罩
        </p>
      </div>
      <ul class="list-group">
        <!--藥局資訊-->
        <template v-for="(item, key) in data">
          <div
            class="list-group-item text-left item"
            :key="key"
            v-if="item.properties.county === select.area && item.properties.town === select.areaSection"
            @click="goto(item)"
          >
            <h3>{{ item.properties.name }}</h3>
            <div class="d-flex mb-3">
              <div
                class="border rounded-pill p-2 w-50 mr-3 text-center d-flex justify-content-around maskCount"
                :class="{ 'haveMask': item.properties.mask_adult}"
              >
                <span>成人口罩 </span>
                <span>{{ item.properties.mask_adult}}</span>
              </div>
              <div
                class="border rounded-pill p-2 w-50 mr-3 text-center d-flex justify-content-around maskCount"
                :class="{ 'haveMask': item.properties.mask_child}"
              >
                <span>兒童口罩 </span>
                <span>{{ item.properties.mask_child}}</span>
              </div><br>
            </div>
            <p class="mb-0">地址：<a
                :href="`https://www.google.com.tw/maps/place/${item.properties.address}`"
                target="_blank"
                title="Google Map"
              >
                {{ item.properties.address }}</a>
            </p>
          </div>
        </template>
      </ul>
    </div>

  </div>
</template>

<script>
import L from "leaflet";
import areaList from "./assets/CityCountyData.json"; //縣市、區域名稱
import Map from "@/components/Map.vue";
import BelongsToSelect from "@/components/BelongsToSelect";
export default {
  name: "home",
  components: {
    Map,
    BelongsToSelect,
  },
  data: () => ({
    areaList, //台灣地區地名
    data: {}, //各地區藥局資料
    select: {
      //使用者選擇的區域
      area: "臺北市",
      areaSection: "中正區",
    },
    textKey: "AreaName",
    areaSection: {
      textKey: "AreaName",
    },
    area: {
      textKey: "CityName",
    },
    isLoading: false, //loading動畫
    isShow: false, //顯示列表
    toggleClass: {
      //是否顯示列表的按鈕
      classA: "fas fa-list-ul",
      classB: "fas fa-map-marked-alt",
    },
    markers: [],
    icons: {
      //地圖地標顏色
      blue: new L.Icon({
        //有口罩
        iconUrl:
          "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      }),
      grey: new L.Icon({
        //沒口罩
        iconUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      }),
    },
  }),
  methods: {
    updateMarker() {
      //變更地區時，變更地標
      //判斷是否為當地的藥局
      const pharmacies = this.data.filter((pharmacy) => {
        return (
          pharmacy.properties.county === this.select.area &&
          pharmacy.properties.town === this.select.areaSection
        );
      });
      pharmacies.forEach((pharmacy) => {
        //增加每個藥局地標
        this.addMarker(
          pharmacy.geometry.coordinates[0],
          pharmacy.geometry.coordinates[1],
          pharmacy.properties
        );
      });
    },
    addMarker(lng, lat, item) {
      //增加地標
      const icon =
        item.mask_adult || item.mask_child ? this.icons.blue : this.icons.grey; //設定顏色
      this.markers.push({
        id: item.id,
        latlng: [lat, lng],
        icon: icon,
        content: `<ul>
        <li><strong>${item.name}</strong></li> <br>
        <li><i class="fas fa-map-marked-alt"></i> <a href="https://www.google.com.tw/maps/place/${item.address}" target="_blank">${item.address}</a></li><br>
        <li><i class="fas fa-phone"></i> ${item.phone}</li><br>
        <li><div class="d-flex mb-3">
          <div class="border rounded-pill p-2 w-50 mr-2 text-center d-flex justify-content-around">
            <span>成人  </span>
            <span>${item.mask_adult}</span>
          </div>
          <div class="border rounded-pill p-2 w-50 mr-2 text-center d-flex justify-content-around">
            <span>兒童  </span>
            <span>${item.mask_child}</span>
          </div><br>
        </div></li>
        <li class="text-right"><small>最後更新時間: ${item.updated}</small></li>
      </ul>`,
      });
    },

    clearMarker() {
      //刪除上一群地標
      this.markers = [];
    },
    goto(pharmacy) {
      //畫面移動到所選地標
      this.$refs.Map.$_goto(
        pharmacy.geometry.coordinates[1],
        pharmacy.geometry.coordinates[0]
      );
      const _index = this.markers.findIndex(
        (e) => e.id === pharmacy.properties.id
      );
      if (_index > -1) {
        this.$refs.Map.$refs.marker[_index].mapObject.openPopup();
      }
    },

    changeSelect() {
      //使用者更改地區
      this.clearMarker();
      this.updateMarker();
    },
    async $_fetchData() {
      try {
        this.isLoading = true; //loading動畫，給時間拉資料
        await this.$http
          .get(
            "https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json"
          )
          .then((response) => {
            this.data = response.data.features; //取得藥局資料
            this.updateMarker(); //初始顯示地標
            this.isLoading = false; //拉完資料，loading動畫消失
          });
      } catch (err) {
        console.log(err);
        this.isLoading = false; //拉完資料，loading動畫消失
      }
    },
    $_onInput(key, $event) {
      this.select[key] = $event;
      if (key === "area") {
        this.select.areaSection = this._areaSectionList[0].AreaName;
      }
      this.changeSelect();
    },
  },
  computed: {
    _areaSectionList() {
      if (this.select.area) {
        let findArea = this.areaList.find((city) => {
          return city.CityName === this.select.area;
        });
        return findArea.AreaList;
      } else {
        return this.areaList[0].AreaList;
      }
    },
  },
  mounted() {
    this.$_fetchData();
    this.select = {
      area: areaList[0].CityName,
      areaSection: areaList[0].AreaList[0].AreaName,
    };
  },
};
</script>

<style lang="scss">
@import "~bootstrap/scss/bootstrap";
#map {
  height: 100vh;
}

.show-icon {
  display: block;
  position: absolute;
  right: 30px;
  bottom: 30px;
  z-index: 9999;
  font-size: 60px;
  cursor: pointer;
  color: #73c0d8;
  filter: drop-shadow(3px 4px 3px rgba(0, 0, 0, 0.3));
}
.show-icon:hover {
  color: #ffa573;
}
.topnav {
  background-color: #ffa573;
  color: white;
}
.content {
  transition: all 0.2s;
  max-height: 100vh;
}
.content.show {
  left: -100%;
}
.list-group {
  max-height: calc(100vh - 164px);
  overflow-y: scroll;
}
.maskCount {
  background-color: #a5a5a5;
  color: white;
}
.haveMask {
  background: #73c0d8;
}
.scrollbox a {
  cursor: pointer;
}
.item {
  cursor: pointer;
  transition: all 0.3s;
}
.item:hover {
  background-color: rgba(239, 248, 251, 0.9);
}
ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.fa-circle:nth-child(1) {
  color: #73c0d8;
}
.fa-circle:nth-child(2) {
  color: #a5a5a5;
}
</style>