// 變數宣告
const sideBar = document.querySelector('#sideBar');
const collapseButton = document.querySelector('#collapseButton');
const countySelection = document.querySelector('#countySelection');
const districtSelection = document.querySelector('#districtSelection');
const sortButton = document.querySelectorAll('.sortButton');
let resArr = [];
let selectedSuppliersArr = [];

// 監聽事件
collapseButton.addEventListener('click', collapseSideBar);
countySelection.addEventListener('change', renderDistrictSelection);
countySelection.addEventListener('change', selectedCounty);
districtSelection.addEventListener('change', selectedDistrict);
sortButton.forEach(button => button.addEventListener('click', switchSortButton));

// Leaflet初始佈局
let backgroudMap = L.map('backgroudMap').setView([25.0238087, 121.5531104], 20);
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
renderDateAndCondition();

// xhr讀取回應完畢後之行為
xhr.onload = function () {
    resArr = JSON.parse(xhr.responseText).features;
    console.log(resArr);

    for (let i = 0; i < resArr.length; i++) {
        markers.addLayer(L.marker([resArr[i].geometry.coordinates[1], resArr[i].geometry.coordinates[0]]).bindPopup(`<h2>${resArr[i].properties.name}</h2>`));
        // if () {
        //     makers.addLayer()
        // } else {

        // }
    }
    backgroudMap.addLayer(markers);

    // 頁面初始佈局（需等待xhr部分）
    renderCountySelection();
    renderDistrictSelection();
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
    let arrCopy = suppliersArr.slice();

    switch (sortBasis) {
        case '不指定':
            arrCopy = suppliersArr;
            break;
        case '成人口罩':
            arrCopy.sort(function (a, b) {
                return b.maskAdult - a.maskAdult;
            });
            break;
        case '兒童口罩':
            arrCopy.sort(function (a, b) {
                return b.maskChild - a.maskChild;
            });
            break;
        default:
            break;
    }

    let str = '';

    for (let i = 0; i < arrCopy.length; i++) {
        str += `
            <li class="supplier">
                    <h3 class="supplierName">
                        ${arrCopy[i].supplierName}
                    </h3>
                    <p class="supplierAddress">
                        <img src="./img/maps-and-flags.png" alt="">
                        ${arrCopy[i].supplierAddress}
                    </p>
                    <p class="supplierPhone">
                        <img src="./img/telephone.png" alt="">
                        ${arrCopy[i].supplierPhone}
                    </p>
                    <div class="maskQuantityBlock">
                        <div class="maskAdultRow">成人口罩 <span class="maskAdultQuantity">${arrCopy[i].maskAdult}</span> 個</div>
                        <div class="maskChildRow">兒童口罩 <span class="maskChildQuantity">${arrCopy[i].maskChild}</span> 個</div>
                    </div>
                </li>`;
    }
    filterList.innerHTML = str;
}

// 函式：點擊Google導航