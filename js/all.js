// Leaflet初始佈局
let backgroudMap = L.map('backgroudMap').setView([25.0238087, 121.5531104], 20);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
}).addTo(backgroudMap);

//Leaflet佈局地圖群組插件（透過新圖層）
let markers = new L.MarkerClusterGroup().addTo(backgroudMap);

// XMLHttpRequest初始佈局
let xhr = new XMLHttpRequest();
xhr.open('get', 'https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json');
xhr.send();

// xhr讀取回應檔案後的行為
xhr.onload = function () {
    let resArr = JSON.parse(xhr.responseText).features;

    for (let i = 0; i < resArr.length; i++) {
        markers.addLayer(L.marker([resArr[i].geometry.coordinates[1], resArr[i].geometry.coordinates[0]]).bindPopup(`<h2>${resArr[i].properties.name}</h2>`));
        // if () {
        //     makers.addLayer()
        // } else {

        // }
    }
    backgroudMap.addLayer(markers);
}
