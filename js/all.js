// Leaflet初始佈局
let backgroudMap = L.map('backgroudMap').setView([25.0238087, 121.5531104], 16);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
}).addTo(backgroudMap);

//Leaflet佈局地圖群組插件（透過新圖層）
let makers = new L.MarkerClusterGroup().addTo(backgroudMap);

// XMLHttpRequest初始佈局
let xhr = new XMLHttpRequest();
xhr.open('get', 'https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json');
xhr.send();
xhr.onload = function () {
    let resArr = JSON.parse(xhr.responseText).features;
    console.log(resArr);

    for (let i = 0; i < resArr.length; i++) {
        // if () {
        //     makers.addLayer()
        // } else {

        // }
    }

}

// L.marker([25.0238087, 121.5531104]).addTo(backgroudMap).bindPopup('<h2>這是六張犁站</h2>');

