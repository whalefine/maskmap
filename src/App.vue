<template>
  <div class="row no-gutters">
    <a class="show-icon" @click="isShow = !isShow">
      <i :class="[isShow ? toggleClass.classA : toggleClass.classB]"></i>
    </a>
    <loading :active.sync="isLoading"></loading>
    <div class="col-sm-6 col-md-5 col-lg-4 col-xl-3 position-absolute fixed-top content vh-100 overflow-auto" :class="{show:isShow}">
      <div class="topnav p-3 sticky-top">
        <div class="form-group d-flex">
          <label for="city" class="mr-2 col-form-label text-right">縣市</label>
          <div class="flex-fill">
            <select id="city" class="form-control" v-model="select.city" @change="select.area = '';">
              <option disabled value="">-- 選擇縣市 --</option>
              <option :value="item.CityName" v-for="item in cityName" :key="item.CityName">
                {{ item.CityName }}
              </option>
            </select>
          </div>
        </div>
        <div class="form-group d-flex">
          <label for="area" class="mr-2 col-form-label text-right">地區</label>
          <div class="flex-fill">
            <select id="area" class="form-control" v-if="select.city"
              v-model="select.area" @change="changeSelect">
              <option disabled value="">-- 選擇區 --</option>
              <option :value="item.AreaName" v-for="item in cityName.find((city) => city.CityName === select.city).AreaList"
                :key="item.AreaName">
                {{ item.AreaName }}
              </option>
            </select>
          </div>
        </div>
        <p class="mb-0 color-white text-right">
          <i class="fas fa-circle "></i> 還有口罩 | 
          <i class="fas fa-circle"></i> 沒有口罩
        </p>
      </div>

      <ul class="list-group"> <!--藥局資訊-->
        <template v-for="(item, key) in data">
          <div class="list-group-item text-left item" :key="key" v-if="item.properties.county === select.city && item.properties.town === select.area" @click="goto(item)">
            <h3>{{ item.properties.name }}</h3>
            <div class="d-flex mb-3">
              <div class="border rounded-pill p-2 w-50 mr-3 text-center d-flex justify-content-around maskCount" :class="{ 'haveMask': item.properties.mask_adult}">
                <span>成人口罩  </span>
                <span>{{ item.properties.mask_adult}}</span>
              </div>
              <div class="border rounded-pill p-2 w-50 mr-3 text-center d-flex justify-content-around maskCount" :class="{ 'haveMask': item.properties.mask_child}">
                <span>兒童口罩  </span>
                <span>{{ item.properties.mask_child}}</span>
              </div><br>
            </div>
            <p class="mb-0">地址：<a :href="`https://www.google.com.tw/maps/place/${item.properties.address}`" target="_blank" title="Google Map">
              {{ item.properties.address }}</a>
            </p>
          </div>
        </template>
      </ul>
    </div>
    <div class="col-sm">
      <div id="map"></div>
    </div>
  </div>
</template>

<script>
import L from 'leaflet';
import cityName from './assets/CityCountyData.json'; //縣市、區域名稱
let maskMap = {}; //地圖

const icons = {//地圖地標顏色
  blue: new L.Icon({ //有口罩
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }),
  grey: new L.Icon({ //沒口罩
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }),
};
console.log(icons);
// console.log(cityName);
export default {
  name: 'home',
  data: () => ({
    cityName,  //台灣地區地名
    data: {},  //各地區藥局資料
    select: {  //使用者選擇的區域
      city: '臺北市',
      area: '中正區',
    },
    isLoading:false,//loading動畫
    isShow:false,   //顯示列表
    toggleClass:{   //是否顯示列表的按鈕
      classA:'fas fa-list-ul',
      classB:'fas fa-map-marked-alt',
    },
  }),
  methods: {
    updateMarker() {//變更地區時，變更地標
      //判斷是否為當地的藥局
      const pharmacies = this.data.filter((pharmacy) => {
        return pharmacy.properties.county === this.select.city && pharmacy.properties.town === this.select.area;
      });
      pharmacies.forEach((pharmacy) => {  //增加每個藥局地標
        this.addMarker( pharmacy.geometry.coordinates[0], pharmacy.geometry.coordinates[1], pharmacy.properties);
      });
      this.goto(pharmacies[0]);
    },
    addMarker(x, y, item) { //增加地標
      const icon = item.mask_adult || item.mask_child ? icons.blue : icons.grey;//設定顏色
      L.marker([y, x], {
        icon:icon,
        }).addTo(maskMap).bindPopup(
        `<ul>
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
      </ul>`);
    },

    removeLastMarker() { //刪除上一群地標
      maskMap.eachLayer((marker) => {
        if(marker instanceof L.Marker) {
          maskMap.removeLayer(marker);
        }
      });
    },
    goto(pharmacy) {  //畫面移動到所選地標
      const icon = pharmacy.properties.mask_adult || pharmacy.properties.mask_child ? icons.blue : icons.grey; //顏色
      maskMap.panTo(new L.LatLng(pharmacy.geometry.coordinates[1], pharmacy.geometry.coordinates[0]));
      // maskMap.setView([y, x], 17, { animation: true }); //移動畫面
      L.marker([pharmacy.geometry.coordinates[1], pharmacy.geometry.coordinates[0]], {
        icon:icon,
      }).addTo(maskMap).bindPopup(
      `<ul>
        <li><strong>${pharmacy.properties.name}</strong></li> <br>
        <li><i class="fas fa-map-marked-alt"></i> <a href="https://www.google.com.tw/maps/place/${pharmacy.properties.address}" target="_blank">${pharmacy.properties.address}</a></li><br>
        <li><i class="fas fa-phone"></i> ${pharmacy.properties.phone}</li><br>
        <li><div class="d-flex mb-3">
          <div class="border rounded-pill p-2 w-50 mr-2 text-center d-flex justify-content-around">
            <span>成人  </span>
            <span>${pharmacy.properties.mask_adult}</span>
          </div>
          <div class="border rounded-pill p-2 w-50 mr-2 text-center d-flex justify-content-around">
            <span>兒童  </span>
            <span>${pharmacy.properties.mask_child}</span>
          </div><br>
        </div></li>
        <li class="text-right"><small>最後更新時間: ${pharmacy.properties.updated}</small></li>
      </ul>`).openPopup();
    },

    changeSelect() { //使用者更改地區
      this.removeLastMarker();
      this.updateMarker();
    },
  },
  mounted() {
    this.isLoading = true; //loading動畫，給時間拉資料
    
    maskMap = L.map('map', { // 製作map
      center: [25.03, 121.55],
      zoom: 14,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '<a target="_blank" href="https://www.openstreetmap.org/">© OpenStreetMap 貢獻者</a>',
      maxZoom: 20,
    }).addTo(maskMap);
    this.$http.get('https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json')
      .then((response) => {
        this.isLoading = false; //拉完資料，loading動畫消失
        this.data = response.data.features;//取得藥局資料
        this.updateMarker();
      });
  },
};
</script>

<style lang="scss">
@import '~bootstrap/scss/bootstrap';
#map {
  height: 100vh;
}

.show-icon{
  display:block;
  position: absolute;
  right:30px;
  bottom:30px;
  z-index:9999;
  font-size:60px;
  cursor: pointer;
  color:#73C0D8;
  filter: drop-shadow(3px 4px 3px rgba(0,0,0,.3));
}
.show-icon:hover{
  color:#FFA573;
}
.topnav{
  background-color: #FFA573;
  color:white;
}
.content{
  transition:all .2s;
}
.content.show{
  left:-100%;
}
.maskCount{
  background-color: #A5A5A5;
  color:white;
}
.haveMask {
  background:#73C0D8;
}
.scrollbox a{
  cursor: pointer;
}
.item{
  cursor:pointer;
  transition: all .3s;
}
.item:hover{
  background-color: rgba(239, 248, 251,.9);
}
ul{
  list-style: none;
  padding:0;
  margin:0;
}
.fa-circle:nth-child(1){
  color: #73C0D8;
}
.fa-circle:nth-child(2){
  color: #A5A5A5;
}
</style>