// 變數宣告
const sideBar = document.querySelector('#sideBar');
const collapseButton = document.querySelector('#collapseButton');
const countySelection = document.querySelector('#countySelection');
const districtSelection = document.querySelector('#districtSelection');
const sortButton = document.querySelectorAll('.sortButton');
const filterList = document.querySelector('#filterList');
let greyIcon = new L.Icon({
    iconUrl: '../img/marker-icon-2x-grey.png',
    shadowUrl: '../img/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
let resArr = [];
let selectedSuppliersArr = [];
let userLocation = [];

// 監聽事件（無需等待xhr部分）
collapseButton.addEventListener('click', collapseSideBar);
countySelection.addEventListener('change', renderDistrictSelection);
countySelection.addEventListener('change', selectedCounty);
districtSelection.addEventListener('change', selectedDistrict);
sortButton.forEach(button => button.addEventListener('click', switchSortButton));

// Leaflet初始佈局
let backgroudMap = L.map('backgroudMap');
backgroudMap.setView([25.0238087, 121.5531104], 20);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
}).addTo(backgroudMap);

//Leaflet地圖群組插件（透過新圖層）
let markers = new L.MarkerClusterGroup().addTo(backgroudMap);

// XMLHttpRequest初始佈局
let xhr = new XMLHttpRequest();
xhr.open('get', 'https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json');
xhr.send();

// 頁面初始佈局（無需等待xhr部分）
navigator.geolocation.getCurrentPosition(getUserLocationSucess);
renderDateAndCondition();

// xhr讀取回應完畢後之行為
xhr.onload = function () {
    resArr = JSON.parse(xhr.responseText).features;
    console.log(resArr);

    // resArr = resArr.slice(0, 1);
    // resArr[0].properties.mask_adult = 0;
    // resArr[0].properties.mask_child = 0;

    for (let i = 0; i < resArr.length; i++) {
        markers.addLayer(L.marker([resArr[i].geometry.coordinates[1], resArr[i].geometry.coordinates[0]],
            (resArr[i].properties.mask_adult == 0 && resArr[i].properties.mask_child == 0) ? { icon: greyIcon, title: resArr[i].properties.id } : { title: resArr[i].properties.id })
            .bindPopup(`
                <li class="supplier" data-id="${resArr[i].properties.id}" data-name="${resArr[i].properties.name}" data-county="${resArr[i].properties.county}" 
                data-district="${resArr[i].properties.town}" data-latitude="${resArr[i].geometry.coordinates[1]}" data-longitude="${resArr[i].geometry.coordinates[0]}"->
                    <h3 class="supplierName">
                    ${resArr[i].properties.name}
                    </h3>
                    <p class="supplierAddress">
                        <img src="./img/maps-and-flags.png" alt="">
                        ${resArr[i].properties.address}
                    </p>
                    <p class="supplierPhone">
                        <img src="./img/telephone.png" alt="">
                        ${resArr[i].properties.phone}
                    </p>
                    <div class="maskQuantityBlock">
                        <div class="maskAdultRow ${resArr[i].properties.mask_adult == 0 ? '-soldOut' : ''}">成人口罩 <span class="maskAdultQuantity">${resArr[i].properties.mask_adult}</span> 個</div>
                        <div class="maskChildRow ${resArr[i].properties.mask_child == 0 ? '-soldOut' : ''}">兒童口罩 <span class="maskChildQuantity">${resArr[i].properties.mask_child}</span> 個</div>
                    </div>
                    <a href="https://www.google.com/maps/dir/${userLocation.length == 0 ? '' : `${userLocation[0]},${userLocation[1]}`}/${resArr[i].properties.name}" target="_blank">
                        <input type="button" value="Google路線導航">
                    </a>
                </li>`));
    }
    backgroudMap.addLayer(markers);

    // 頁面初始佈局（需等待xhr部分）
    renderCountySelection();
    renderDistrictSelection();

    // 監聽事件（需等待xhr部分）
    filterList.addEventListener('click', selectedSupplier);
    document.addEventListener('click', selectedMarker);
}

// 函式：獲知使用者位置成功
function getUserLocationSucess(location) {
    userLocation = [location.coords.latitude, location.coords.longitude];
}

// 函式：側邊攔伸縮
function collapseSideBar() {
    let direction = document.querySelector('#direction');

    sideBar.classList.toggle('-show');
    collapseButton.classList.toggle('-extend');
    direction.classList.toggle('-reverse');
}

// 函式：渲染日期與領貨條件
function renderDateAndCondition() {
    let toDay = new Date();
    let year = toDay.getFullYear();
    let month = toDay.getMonth();
    let date = toDay.getDate();
    let day = toDay.getDay();
    let dateTitle = document.querySelector('#date')
    let dayOfWeekTitle = document.querySelector('#dayOfWeek')
    let condition = document.querySelector('#condition');
    let dayInChineseArr = ['一', '二', '三', '四', '五', '六', '日'];

    dateTitle.textContent = `${year}-${month + 1}-${date}`;
    dayOfWeekTitle.textContent = `星期${dayInChineseArr[day - 1]}`;

    if (day == 0) {
        condition.innerHTML = '今日不限證號，皆可購買';
    } else if (day % 2 == 0) {
        condition.querySelector('span').textContent = '0，2，4，6，8';
    } else {
        condition.querySelector('span').textContent = '1，3，5，7，9';
    }
}

// 函式：渲染縣市下拉選單
function renderCountySelection() {
    for (let i = 0; i < resArr.length; i++) {
        let county = resArr[i].properties.county;

        if (countySelection.textContent.search(county) == -1) {
            countySelection.innerHTML += `
        <option value="${county}" class="countyOption">${county}</option>`
        }
    }
}

// 函式：渲染行政區下拉選單
function renderDistrictSelection() {
    let selectedCounty = countySelection.value;
    districtSelection.innerHTML = `
    <option value="default">--請選擇行政區--</option>`;

    for (let i = 0; i < resArr.length; i++) {
        let county = resArr[i].properties.county;
        let town = resArr[i].properties.town;

        if (county == selectedCounty && districtSelection.textContent.search(town) == -1) {
            districtSelection.innerHTML += `
            <option value="${town}">${town}</option>`;
        }
    }
}

// 函式：已選擇縣市
function selectedCounty() {
    filterList.innerHTML = '';
    if (countySelection.value == 'default' && districtSelection.value == 'default') backgroudMap.setView([25.0238087, 121.5531104], 20);
}

// 函式：已選擇行政區
function selectedDistrict() {
    filterList.innerHTML = '';

    let selectedDistrict = districtSelection.value;

    selectedSuppliersArr = [];

    for (let i = 0; i < resArr.length; i++) {
        let town = resArr[i].properties.town;

        if (selectedDistrict == town) {
            let selectedSupplier = {
                supplierLatitude: resArr[i].geometry.coordinates[1],
                supplierLongitude: resArr[i].geometry.coordinates[0],
                supplierId: resArr[i].properties.id,
                supplierCounty: resArr[i].properties.county,
                supplierDistrict: resArr[i].properties.town,
                supplierName: resArr[i].properties.name,
                supplierAddress: resArr[i].properties.address,
                supplierPhone: resArr[i].properties.phone,
                maskAdult: resArr[i].properties.mask_adult,
                maskChild: resArr[i].properties.mask_child
            };

            selectedSuppliersArr.push(selectedSupplier);
        }
    }

    sortFilterList('不指定', selectedSuppliersArr);

    if (selectedSuppliersArr.length !== 0) backgroudMap.setView([selectedSuppliersArr[0].supplierLatitude, selectedSuppliersArr[0].supplierLongitude], 20);
}

// 函式：已選擇特定供應商
function selectedSupplier(e) {
    console.log(selectedSuppliersArr);

    if (e.target.classList.contains('supplierName')) {
        let supplierItem = e.target.closest('li.supplier');

        for (let i = 0; i < selectedSuppliersArr.length; i++) {
            if (supplierItem.dataset.id == selectedSuppliersArr[i].supplierId) {
                backgroudMap.setView([selectedSuppliersArr[i].supplierLatitude, selectedSuppliersArr[i].supplierLongitude], 20);

                let markersPane = document.querySelectorAll('div.leaflet-marker-pane')[0];
                let markerClusters = markersPane.querySelectorAll('div.marker-cluster');
                let markersGenerated = markersPane.querySelectorAll('img.leaflet-marker-icon');

                console.log(markersPane);
                console.log(markerClusters);
                console.log(markersGenerated);

                for (let j = 0; j < markersGenerated.length; j++) {
                    if (supplierItem.dataset.id == markersGenerated[j].title) markersGenerated[j].click();
                }

                searchingInClusters:
                for (let j = 0; j < markerClusters.length; j++) {
                    markerClusters[j].click();
                    let markersGenerated = markersPane.querySelectorAll('img.leaflet-marker-icon');

                    for (let k = 0; k < markersGenerated.length; k++) {
                        if (supplierItem.dataset.id == markersGenerated[k].title) {
                            markersGenerated[k].click();
                            break searchingInClusters;
                        }
                    }
                }
            }
        }
    }
}

// 函式：已選擇特定圖釘
function selectedMarker(e) {
    if (e.target.classList.contains('img.leaflet-marker-icon')) {
        // console.log(`hello there, i am ${e.target.title}`);



    }
}

// 函式：切換排序按鈕
function switchSortButton(e) {
    e.preventDefault();

    sortButton.forEach((sortButton) => sortButton.classList.remove('-selected'));
    e.target.classList.add('-selected');

    sortFilterList(e.target.value, selectedSuppliersArr);
}

// 函式：更新清單排序
function sortFilterList(sortBasis, suppliersArr) {
    filterList.innerHTML = '';
    let copyArr = suppliersArr.slice();

    switch (sortBasis) {
        case '不指定':
            copyArr = suppliersArr;
            break;
        case '成人口罩':
            copyArr.sort(function (a, b) {
                return b.maskAdult - a.maskAdult;
            });
            break;
        case '兒童口罩':
            copyArr.sort(function (a, b) {
                return b.maskChild - a.maskChild;
            });
            break;
        default:
            break;
    }

    let str = '';

    for (let i = 0; i < copyArr.length; i++) {
        str += `
                <li class="supplier" data-id="${copyArr[i].supplierId}"  data-name="${copyArr[i].supplierName}" data-county="${copyArr[i].supplierCounty}" 
                data-district="${copyArr[i].supplierDistrict}" data-latitude="${copyArr[i].supplierLatitude}" data-longitude="${copyArr[i].supplierLongitude}">
                    <h3 class="supplierName">
                        ${copyArr[i].supplierName}
                    </h3>
                    <p class="supplierAddress">
                        <img src="./img/maps-and-flags.png" alt="">
                        ${copyArr[i].supplierAddress}
                    </p>
                    <p class="supplierPhone">
                        <img src="./img/telephone.png" alt="">
                        ${copyArr[i].supplierPhone}
                    </p>
                    <div class="maskQuantityBlock">
                        <div class="maskAdultRow ${copyArr[i].maskAdult == 0 ? '-soldOut' : ''}">成人口罩 <span class="maskAdultQuantity">${copyArr[i].maskAdult}</span> 個</div>
                        <div class="maskChildRow ${copyArr[i].maskChild == 0 ? '-soldOut' : ''}">兒童口罩 <span class="maskChildQuantity">${copyArr[i].maskChild}</span> 個</div>
                    </div>
                </li>`;
    }
    filterList.innerHTML = str;


    if (copyArr.length !== 0) backgroudMap.setView([copyArr[0].supplierLatitude, copyArr[0].supplierLongitude], 20);
}