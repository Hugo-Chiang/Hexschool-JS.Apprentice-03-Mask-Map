// 變數宣告
const sideBar = document.querySelector('#sideBar');
const collapseButton = document.querySelector('#collapseButton');
const countySelection = document.querySelector('#countySelection');
const districtSelection = document.querySelector('#districtSelection');
const sortButton = document.querySelectorAll('.sortButton');
const filterList = document.querySelector('#filterList');

let blueIcon = new L.Icon({
    iconUrl: './img/marker-icon-blue.png',
    shadowUrl: './img/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

let redIcon = new L.Icon({
    iconUrl: './img/marker-icon-2x-red.png',
    shadowUrl: './img/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

let yellowIcon = new L.Icon({
    iconUrl: './img/marker-icon-2x-yellow.png',
    shadowUrl: './img/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

let greyIcon = new L.Icon({
    iconUrl: './img/marker-icon-2x-grey.png',
    shadowUrl: './img/marker-shadow.png',
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
backgroudMap.setView([25.0238087, 121.5531104], 18);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
}).addTo(backgroudMap);

//Leaflet地圖群組插件（透過新圖層）
let markers = new L.MarkerClusterGroup({ disableClusteringAtZoom: 18 }).addTo(backgroudMap);

// XMLHttpRequest初始佈局
let xhr = new XMLHttpRequest();
xhr.open('get', 'https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json');
xhr.send();

// 頁面初始佈局（無需等待xhr部分）
navigator.geolocation.getCurrentPosition(getUserLocationSucess);
renderDateAndCondition();

// xhr讀取回應完畢後之行為
xhr.onload = function () {
    // 解析回傳資料並裝入陣列
    resArr = JSON.parse(xhr.responseText).features;

    // 根據回傳資料於Leaflet放置圖釘
    for (let i = 0; i < resArr.length; i++) {
        markers.addLayer(L.marker([resArr[i].geometry.coordinates[1], resArr[i].geometry.coordinates[0]],
            (resArr[i].properties.mask_adult == 0 && resArr[i].properties.mask_child == 0) ? { icon: greyIcon, title: resArr[i].properties.id } :
                (resArr[i].properties.mask_adult != 0 && resArr[i].properties.mask_child != 0) ? { icon: blueIcon, title: resArr[i].properties.id } :
                    (resArr[i].properties.mask_adult !== 0 && resArr[i].properties.mask_child == 0) ? { icon: yellowIcon, title: resArr[i].properties.id } : { icon: redIcon, title: resArr[i].properties.id })
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

// 函式：下拉選單選擇縣市
function selectedCounty() {
    filterList.innerHTML = '';
    if (countySelection.value == 'default' && districtSelection.value == 'default') backgroudMap.setView([25.0238087, 121.5531104], 18);
}

// 函式：下拉選單選擇行政區
function selectedDistrict() {
    filterList.innerHTML = '';

    let selectedCounty = countySelection.value;
    let selectedDistrict = districtSelection.value;
    updateSuppliersList(selectedCounty, selectedDistrict);

    sortFilterList('不指定', selectedSuppliersArr);

    if (selectedSuppliersArr.length !== 0) backgroudMap.setView([selectedSuppliersArr[0].supplierLatitude, selectedSuppliersArr[0].supplierLongitude], 18);
}

// 函式：根據所選行政區更新所選供應商清單
function updateSuppliersList(county, district) {
    selectedSuppliersArr = [];

    for (let i = 0; i < resArr.length; i++) {
        let resTown = resArr[i].properties.town;
        let resCounty = resArr[i].properties.county;

        if (district == resTown && county == resCounty) {
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
}

// 函式：側邊欄選擇特定供應商
function selectedSupplier(e) {
    if (e.target.classList.contains('supplierName')) {
        let listBoost = document.querySelector('#listBoost')
        let supplierItem = e.target.closest('li.supplier');

        if (!!listBoost) listBoost.remove();

        for (let i = 0; i < selectedSuppliersArr.length; i++) {
            if (supplierItem.dataset.id == selectedSuppliersArr[i].supplierId) {
                backgroudMap.setView([selectedSuppliersArr[i].supplierLatitude, selectedSuppliersArr[i].supplierLongitude], 18);
                topTheSupplier(i);

                let markersPane = document.querySelectorAll('div.leaflet-marker-pane')[0];
                let markersGenerated = markersPane.querySelectorAll('img.leaflet-marker-icon');

                for (let i = 0; i < markersGenerated.length; i++) {
                    if (supplierItem.dataset.id == markersGenerated[i].title) markersGenerated[i].click();
                }
            }
        }
    }
}

// 函式：地圖上選擇特定圖釘
function selectedMarker(e) {
    if (e.target.classList.contains('leaflet-marker-icon')) {
        for (let i = 0; i < resArr.length; i++) {
            if (e.target.title == resArr[i].properties.id) {
                countySelection.value = resArr[i].properties.county;
                renderDistrictSelection();
                districtSelection.value = resArr[i].properties.town;
                updateSuppliersList(countySelection.value, districtSelection.value);
                let sortedArr = sortFilterList('不指定', selectedSuppliersArr);

                backgroudMap.setView([resArr[i].geometry.coordinates[1], resArr[i].geometry.coordinates[0]], 18);

                for (let j = 0; j < sortedArr.length; j++) {
                    if (e.target.title == sortedArr[j].supplierId) topTheSupplier(j);
                }
            }
        }
    }
}

// 函式：切換排序按鈕
function switchSortButton(e) {
    e.preventDefault();

    sortButton.forEach((sortButton) => sortButton.classList.remove('-selected'));
    e.target.classList.add('-selected');

    if (countySelection.value != 'default' && districtSelection.value != 'default') {
        let sortedArr = sortFilterList(e.target.value, selectedSuppliersArr);
        if (sortedArr.length !== 0) backgroudMap.setView([sortedArr[0].supplierLatitude, sortedArr[0].supplierLongitude], 18);
    }

    sortedArr = [];
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
    filterList.scroll(0, 0);

    return copyArr;
}

// 函式：置頂所選供應商
function topTheSupplier(scrollQuantity) {
    let SuppliersQuantity = selectedSuppliersArr.length + 1;
    let scrollHeight = scrollQuantity * 160;

    console.log(SuppliersQuantity - scrollQuantity);

    if (SuppliersQuantity - scrollQuantity < 5) {
        let boostQuantity = Math.abs(SuppliersQuantity - scrollQuantity - 1 - 4);
        let boostDOM = document.createElement('li');

        boostDOM.setAttribute('id', 'listBoost');
        boostDOM.style.width = '100%';
        boostDOM.style.height = `${boostQuantity * 160}px`;

        filterList.insertAdjacentElement('beforeend', boostDOM)
    }

    filterList.scroll(0, scrollHeight);
}