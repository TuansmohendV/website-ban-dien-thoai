import React from 'react';
import { Filter, Trash2 } from 'lucide-react';

// LAPTOP BRANDS
const laptopBrands = [
  { name: 'Apple', logo: '/brands/apple.png' },
  { name: 'MSI', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2026/03/09/msi-logo-horiz-cmyk-blk-for-screen.png' },
  { name: 'ASUS', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2021/11/11/asu-logo.png' },
  { name: 'DELL', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2023/06/08/dell-logo.png' },
  { name: 'HP', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2021/11/18/oooo.png' },
  { name: 'Lenovo', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2023/06/08/lenovo-logo-png-1_638218133437530990.png' },
  { name: 'LG', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2021/01/18/logo-lg.png' },
  { name: 'Acer', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2022/05/30/logo-acer-inkythuatso-2-01-27-15-50-00.jpg' },
  { name: 'Mobell', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/mobell.gif' }
];

// PHONE BRANDS
const phoneBrands = [
  { name: 'Apple', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/apple1.gif' },
  { name: 'Samsung', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/samsung.gif' },
  { name: 'Xiaomi', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/23/xiaomi.gif' },
  { name: 'Huawei', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/huawei.gif' },
  { name: 'Garmin', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/12/23/garmin.png' },
  { name: 'Oppo', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/oppo.gif' },
  { name: 'Asus', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/asus.gif' },
  { name: 'Honor', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/honor.gif' },
  { name: 'Tecno', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/23/techno.gif' },
  { name: 'Lenovo', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/lenovo.gif' },
  { name: 'LG', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/lg.gif' },
  { name: 'MSI', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2026/03/09/msi-logo-horiz-cmyk-blk-for-screen.png' },
  { name: 'Dell', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/dell.gif' },
  { name: 'Mophie', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/mophie.gif' },
  { name: 'HP', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/hp.gif' },
  { name: 'Vivo', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/vivo.gif' },
  { name: 'Realme', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/realme.gif' },
  { name: 'Soundpeats', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/soundpeats.gif' },
  { name: 'Harman Kardon', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/12/23/haman-kadon.png' },
  { name: 'TCL', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/tcl.gif' },
  { name: 'Viewsonic', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/23/viewsonic.gif' },
  { name: '9Fit', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/23/9fit.gif' },
  { name: 'Sony', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/sony.gif' },
  { name: 'Innostyle', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/innostyle.gif' },
  { name: 'Nubia', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/23/nubia.gif' },
  { name: 'JBL', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/jbl.gif' },
  { name: 'Energizer', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/energizer.gif' },
  { name: 'Amazfit', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/amazfit.gif' },
  { name: 'Itel', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/itel1.gif' },
  { name: 'Baseus', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/23/baseus.gif' },
  { name: 'Belkin', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/23/belkin.gif' },
  { name: 'Masstel', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/masstel.gif' },
  { name: 'Acer', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/acer.gif' },
  { name: 'Myalo', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/myalo.gif' },
  { name: 'Infinix', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/23/infinix.gif' },
  { name: 'Inoi', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/22/inoi.png' },
  { name: 'Oscal', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/12/23/logo-oscal.png' },
  { name: 'Riversong', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2025/01/24/riversong.png' },
  { name: 'ZTE', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2023/12/08/zte-logo-svg-1.png' },
  { name: 'Nokia', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/nokia.gif' },
  { name: 'Zagg', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/23/zagg.gif' },
  { name: 'Kieslect', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/23/kieslect.gif' },
  { name: 'VSP', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/22/vsp.png' },
  { name: 'Gloryfit', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/22/gloryfit.png' },
  { name: 'HTC', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/htc.gif' },
  { name: 'Mobell', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/mobell.gif' },
  { name: 'Pisen', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/pisen.gif' },
  { name: 'Totolink', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/totolink.gif' },
  { name: 'Logitech', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/23/logitech.gif' },
  { name: 'Golf', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2025/03/17/golf.png' },
  { name: 'Bagi', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/23/bagi.gif' },
  { name: 'Havit', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/23/havit.gif' },
  { name: 'Alpha Works', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/23/alpha-works.gif' },
  { name: 'Xphone', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/10/03/xphone-logo.png' },
  { name: 'Mibro', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2025/04/09/mibro-logo.png' },
  { name: 'Motorola', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/motorola.gif' },
  { name: 'Philips', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/phillips.gif' },
  { name: 'Goly', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/12/24/logo-goly.png' },
  { name: 'Viettel', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/12/17/viettel-logo-2021-svg.png' },
  { name: 'Tomtoc', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/23/tomtoc.gif' },
  { name: 'Sennheiser', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/sennheiser.gif' },
  { name: 'DJI', logo: '' },
  { name: 'Marshall', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/marshall.gif' },
  { name: 'MyKid', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/mykid.gif' },
  { name: 'Daikin', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/daikin.gif' },
  { name: 'Arirang', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2025/01/11/arirang1.png' },
  { name: 'TPLink', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/23/tplink.gif' },
  { name: 'Microsoft', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/23/microsoft.gif' },
  { name: 'Pioneer', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/23/pioneer.gif' },
  { name: 'Clair', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/23/clair.gif' },
  { name: 'Monster', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/23/monster.gif' },
  { name: 'Rapoo', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/23/rapoo.gif' },
  { name: 'Foomee', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/23/foomee.gif' },
  { name: 'Poco', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/22/poco.png' },
  { name: 'Sounarc', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/22/sounarc.png' },
  { name: 'Ecovacs', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/22/ecovacs.png' },
  { name: 'Zobo', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/12/24/zobo.png' },
  { name: 'HPRT', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/22/hprt.png' },
  { name: 'Genius', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/12/24/genius.png' },
  { name: 'Yeslink', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/22/yeslink.png' },
  { name: 'Macaron', logo: '' },
  { name: 'UEELR', logo: '' },
  { name: 'Benco', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2025/04/09/benco-logo.png' },
  { name: 'Earfun', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2025/05/14/earfun-logo.png' },
  { name: 'Nakamichi', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2026/01/30/nakamichi-logo.png' }
];

// TABLET BRANDS
const tabletBrands = [
  { name: 'Apple', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/apple1.gif' },
  { name: 'Samsung', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2020/11/30/samsung-logo-transparent.png' },
  { name: 'Xiaomi', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2023/07/18/xiaomi-logo.png' },
  { name: 'Redmagic', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/23/redmagic.gif' },
  { name: 'Nokia', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2021/10/23/nokia-wordmark-svg.png' },
  { name: 'TCL', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2023/06/02/tcl.png' },
  { name: 'Honor', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2023/06/19/honor-logo-2022-svg.png' },
  { name: 'Lenovo', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2023/06/08/lenovo-logo-png-1_638218133437530990.png' },
  { name: 'Oppo', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2021/11/20/whatsapp-image-2021-11-18-at-16-20-33-1.jpeg' },
  { name: 'Huawei', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/huawei.gif' },
  { name: 'HTC', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2023/08/22/htc-new-logo-svg.png' }
];

// CONFIGURATION MAPPING FOR ALL CATEGORIES
const categoryConfigs = {
  'dien-thoai': {
    brands: phoneBrands,
    priceRanges: [
      '1 đến 3 triệu', 'Dưới 1 triệu', '3 đến 5 triệu', '5 đến 10 triệu',
      '10 đến 15 triệu', '15 đến 20 triệu', '20 đến 25 triệu',
      '25 đến 30 triệu', '30 đến 50 triệu', '50 đến 85 triệu', 'Trên 85 triệu'
    ],
    sections: ['network', 'ram', 'rom', 'nfc', 'refreshRate', 'battery', 'screenSize']
  },
  'laptop': {
    brands: laptopBrands,
    priceRanges: ['Dưới 5 triệu', '10 đến 15 triệu', '15 đến 20 triệu', '20 đến 30 triệu', '30 đến 50 triệu', '50 đến 85 triệu', 'Trên 85 triệu'],
    sections: ['features', 'gpu', 'cpu', 'ram', 'storage', 'refreshRate']
  },
  'tablet': {
    brands: tabletBrands,
    priceRanges: [
      '2 đến 3 triệu', '3 đến 5 triệu', '5 đến 8 triệu', '8 đến 10 triệu',
      '10 đến 12 triệu', '12 đến 15 triệu', '15 đến 20 triệu',
      '20 đến 30 triệu', '30 đến 50 triệu'
    ],
    sections: ['rom', 'refreshRate', 'screenSize']
  },
  'man-hinh': {
    brands: [
      { name: 'MSI', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/03/07/msi-logo-500x281-1.png' },
      { name: 'Xiaomi', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2023/07/18/xiaomi.png' },
      { name: 'ASUS', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2021/11/11/asu-logo.png' },
      { name: 'Dell', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2020/11/07/logo-dell.png' },
      { name: 'Samsung', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2020/10/30/logo-samsung.png' },
      { name: 'EDra', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/07/29/logo-edra.png' },
      { name: 'LG', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2020/11/07/logo-lg.png' },
      { name: 'AOC', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2022/10/26/aoi.png' },
      { name: 'ViewSonic', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2022/10/26/vietxonix.png' },
      { name: 'Lenovo', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2020/11/07/logo-lenovo.png' },
      { name: 'Gigabyte', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2022/09/21/logo-gygabyte.png' },
      { name: 'Acer', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2020/11/07/logo-acer.png' },
      { name: 'VSP', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/02/19/vsp.png' }
    ],
    priceRanges: ['1 đến 2 triệu', '2 đến 3 triệu', '3 đến 4 triệu', '4 đến 5 triệu', 'Trên 5 triệu'],
    sections: ['refreshRate', 'screenSize', 'resolution', 'panelType']
  },
  'dong-ho': {
    brands: [
      { name: 'Apple', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2022/09/07/logoooooooooooooooo.png' },
      { name: 'Samsung', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2020/11/30/samsung-logo-transparent.png' },
      { name: 'Garmin', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2025/01/30/logo-garmin.png' },
      { name: 'Huawei', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/huawei.gif' },
      { name: 'Xiaomi', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2023/07/18/xiaomi.png' },
      { name: 'Amazfit', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2021/05/12/amfit.PNG' },
      { name: 'Kieslect', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2023/04/28/screenshot-2023-04-28-084045.png' },
      { name: 'GloryFit', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/06/03/gloryfit_638530307371129954.png' },
      { name: 'Honor', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/honor.gif' },
      { name: 'Oppo', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2023/12/13/oppo-logo-2019-svg.png' },
      { name: 'Riversong', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2025/01/24/riversong.png' },
      { name: 'Zobo', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/12/24/zobo.png' },
      { name: 'Kospet', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/10/14/kospet.png' },
      { name: 'Masstel', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2020/11/07/logo-masstel.png' },
      { name: 'Realme', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2020/09/14/brand%20(6).png' },
      { name: 'Soundpeats', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/soundpeats.gif' },
      { name: 'Fitbit', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2020/12/09/fitbit-logo.png' },
      { name: 'Mibro', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2025/04/09/mibro-logo.png' },
      { name: 'Đồng hồ trẻ em', logo: '' }
    ],
    priceRanges: [
      '1 đến 3 triệu', 'Dưới 1 triệu', '3 đến 5 triệu', '5 đến 10 triệu',
      '10 đến 15 triệu', '20 đến 25 triệu', '25 đến 30 triệu'
    ],
    sections: ['screenTech', 'wristSize', 'watchFace', 'batteryLife', 'strapMaterial']
  },
  'am-thanh': {
    brands: [
      { name: 'Nakamichi', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2026/01/30/nakamichi-logo.png' },
      { name: 'Soul', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/soul.gif' },
      { name: 'Xiaomi', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2023/07/18/xiaomi.png' },
      { name: 'Sony', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/sony.gif' },
      { name: 'JBL', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/jbl.gif' },
      { name: 'Harman Kardon', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/12/23/haman-kadon.png' },
      { name: 'Arirang', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2025/01/11/arirang1.png' },
      { name: 'Marshall', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/marshall.gif' },
      { name: 'Samsung', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/samsung.gif' },
      { name: 'Monster', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2025/01/22/monster-logo.png' },
      { name: 'Havit', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/23/havit.gif' },
      { name: 'Alpha Works', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2021/01/18/alpha-logo.png' },
      { name: 'Sounarc', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/22/sounarc.png' },
      { name: 'Olike', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/23/olike.gif' },
      { name: 'NOWGO', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2025/01/24/nowgo.png' },
      { name: 'Edifier', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2021/11/20/edifier.png' },
      { name: 'Energizer', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/energizer.gif' },
      { name: 'LG', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/lg.gif' },
      { name: 'Soundpeats', logo: 'https://cdn.hoanghamobile.vn/i/cat_logo_filter/Uploads/2024/11/25/soundpeats.gif' },
      { name: 'MIC', logo: '' }
    ],
    priceRanges: [
      '1 đến 3 triệu', 'Dưới 1 triệu', '3 đến 5 triệu', '5 đến 10 triệu',
      '10 đến 15 triệu', 'Trên 15 triệu'
    ],
    sections: ['audioUsage', 'headphoneType']
  },
  'smart-home': {
    brands: [],
    priceRanges: [
      'Dưới 5 triệu', 'Dưới 7 triệu', '1 đến 2 triệu', '1 đến 3 triệu', 'Dưới 1 triệu',
      'Từ 0-200k', 'Từ 200-500k', 'Từ 500-1000k', '2 đến 3 triệu', '3 đến 4 triệu',
      '3 đến 5 triệu', '4 đến 5 triệu', '5 đến 10 triệu', '5 đến 6 triệu',
      '5 đến 7 triệu', '5 đến 8 triệu', 'Trên 5 triệu', '6 đến 8 triệu',
      '7 đến 10 triệu', '7 đến 9 triệu', '8 đến 10 triệu', '9 đến 12 triệu',
      '10 đến 12 triệu', '10 đến 15 triệu', '12 đến 15 triệu', '15 đến 20 triệu',
      'Trên 15 triệu', '20 đến 25 triệu', '20 đến 30 triệu', 'Trên 20 triệu',
      '25 đến 30 triệu', 'Trên 30 triệu', '40 đến 100 triệu', '50 đến 85 triệu'
    ],
    sections: []
  },
  'linh-kien-may-tinh': {
    brands: [], // Hide brands
    priceRanges: [
      'Dưới 1 triệu', 'Dưới 5 triệu', 'Dưới 7 triệu', '1 đến 2 triệu', '1 đến 3 triệu',
      'Từ 0-200k', 'Từ 200-500k', 'Từ 500-1000k', '2 đến 3 triệu', '3 đến 4 triệu', '3 đến 5 triệu', '3 đến 4 triệu'
    ],
    sections: [] // Remove all other sections
  },
  'sua-chua': {
    brands: [
      { name: 'Pisen', logo: '' },
      { name: 'Xiaomi', logo: '' },
      { name: 'Tomtoc', logo: '' },
      { name: 'Energizer', logo: '' },
      { name: 'Innostyle', logo: '' },
      { name: 'realme', logo: '' },
      { name: 'Wiwu', logo: '' },
      { name: 'iWalk', logo: '' },
      { name: 'Aukey', logo: '' }
    ],
    prices: { min: 0, max: 9500000 },
    priceRanges: [
      'Dưới 5 triệu', 'Dưới 7 triệu', '1 đến 2 triệu', '1 đến 3 triệu', 'Dưới 1 triệu',
      'Từ 0-200k', 'Từ 200-500k', 'Từ 500-1000k', '2 đến 3 triệu', '3 đến 4 triệu',
      '3 đến 5 triệu', '3 đến 4 triệu', '4 đến 5 triệu', '5 đến 10 triệu', '5 đến 6 triệu',
      '5 đến 7 triệu', '5 đến 8 triệu', 'Trên 5 triệu', '6 đến 8 triệu',
      '7 đến 10 triệu', '7 đến 9 triệu', '8 đến 10 triệu', '9 đến 12 triệu',
      '10 đến 12 triệu', '10 đến 15 triệu', '12 đến 15 triệu', '15 đến 20 triệu',
      'Trên 15 triệu', '20 đến 25 triệu', '20 đến 30 triệu', 'Trên 20 triệu',
      '25 đến 30 triệu', 'Trên 30 triệu', '40 đến 100 triệu', '50 đến 85 triệu'
    ],
    sections: []
  },
  'sim': {
    brands: [],
    prices: { min: 1000000, max: 2000000 },
    priceRanges: ['1 đến 2 triệu'],
    sections: []
  },
  'dich-vu': {
    brands: [],
    prices: { min: 1000000, max: 2000000 },
    priceRanges: ['1 đến 2 triệu'],
    sections: []
  },
  'goi-cuoc': {
    brands: [],
    prices: { min: 1000000, max: 2000000 },
    priceRanges: ['1 đến 2 triệu'],
    sections: []
  },
  'dich-vu-goi-cuoc': {
    brands: [],
    prices: { min: 1000000, max: 2000000 },
    priceRanges: [
      '1 đến 2 triệu'
    ],
    sections: []
  },
  'search': {
    brands: phoneBrands,
    priceRanges: [
      'Dưới 1 triệu', '1 đến 3 triệu', '3 đến 5 triệu', '5 đến 10 triệu',
      '10 đến 20 triệu', '20 đến 30 triệu', 'Trên 30 triệu'
    ],
    sections: ['category', 'availability']
  }
};

const FilterSidebar = ({ category, filters, setFilters, onToggleFilter, onSetSingleFilter, counts = {} }) => {
  const [expandedSections, setExpandedSections] = React.useState({
    category: true, brand: true, price: true, availability: true, features: true,
    screenSize: true, gpu: true, cpu: true, ram: true, storage: true, refreshRate: true,
    componentType: true,
    // phone fields
    network: true, rom: true, nfc: true, battery: true
  });

  const [priceRange, setPriceRange] = React.useState([100000, 153400000]);
  const [showAllPrices, setShowAllPrices] = React.useState(false);
  const [showAllBrands, setShowAllBrands] = React.useState(false);

  const currentConfig = categoryConfigs[category] || categoryConfigs['dien-thoai'];

  // Update priceRange when category or config changes
  React.useEffect(() => {
    const min = currentConfig.prices?.min !== undefined ? currentConfig.prices.min : 3000000;
    const max = currentConfig.prices?.max !== undefined ? currentConfig.prices.max : 153400000;
    setPriceRange([min, max]);
  }, [category]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const isActive = (key, value) => filters[key] === value;

  const getDisplayCount = (key, value) => {
    if (!counts || !counts[key]) return 0;
    return counts[key][value] || 0;
  };

  const FilterHeader = ({ title, section, isExpanded }) => (
    <div
      className="flex justify-between items-center py-4 cursor-pointer group select-none"
      onClick={() => toggleSection(section)}
    >
      <h4 className="text-[15px] font-black text-gray-800 tracking-tighter">{title}</h4>
      <div className="w-6 h-6 flex items-center justify-center text-gray-300 font-bold text-xl transition-transform group-hover:scale-110">
        {isExpanded ? '−' : '+'}
      </div>
    </div>
  );

  const currentBrands = currentConfig.brands;

  const renderFilterList = (key, options) => (
    <div className="pb-6 space-y-2.5">
      {options.map((opt) => {
        const count = getDisplayCount(key, opt);
        const active = isActive(key, opt);
        return (
          <label key={opt} className={`flex items-center justify-between cursor-pointer group transition-all ${count === 0 && !active ? 'opacity-40' : 'opacity-100'}`}>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={active}
                onChange={() => onToggleFilter(key, opt)}
                className="w-4.5 h-4.5 accent-[#008d71] border-gray-300 rounded cursor-pointer"
              />
              <span className={`text-[14px] font-medium transition-colors ${active ? 'text-[#008d71] font-bold' : 'text-gray-600 group-hover:text-[#008d71]'}`}>{opt}</span>
            </div>
            <span className="text-[12px] text-gray-300 font-medium tracking-tight">[{count}]</span>
          </label>
        );
      })}
    </div>
  );

  return (
    <aside className="w-full sticky top-[60px] pb-10 select-none">
      <button className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#008d71] text-white rounded-xl mb-4 shadow-md font-bold uppercase tracking-wider">
        <Filter size={18} />
        <span className="text-[15px]">Danh sách sản phẩm</span>
      </button>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 divide-y divide-gray-100">

        {/* Loại sản phẩm */}
        <div>
          <FilterHeader title="Loại sản phẩm" section="category" isExpanded={expandedSections.category} />
          {expandedSections.category && (
            <div className="pb-6 space-y-2">
              {[
                { name: 'Điện thoại', slug: 'dien-thoai' },
                { name: 'Laptop', slug: 'laptop' },
                { name: 'Tablet', slug: 'tablet' },
                { name: 'Đồng hồ', slug: 'dong-ho' },
                { name: 'Âm thanh', slug: 'am-thanh' },
                { name: 'Smart Home', slug: 'smart-home' },
                { name: 'Phụ kiện', slug: 'phu-kien' }
              ].map((cat) => (
                <label key={cat.slug} className="flex items-center gap-3 cursor-pointer group py-1">
                  <input
                    type="checkbox"
                    checked={filters.category === cat.slug || category === cat.slug}
                    onChange={() => onSetSingleFilter('category', cat.slug)}
                    className="w-4.5 h-4.5 accent-[#008d71] border-gray-300 rounded cursor-pointer"
                  />
                  <span className={`text-[14px] font-medium transition-colors ${filters.category === cat.slug || category === cat.slug ? 'text-[#008d71] font-bold' : 'text-gray-600 group-hover:text-[#008d71]'}`}>
                    {cat.name}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Hãng */}
        {currentBrands && currentBrands.length > 0 && (
          <div>
            <FilterHeader title="Thương hiệu" section="brand" isExpanded={expandedSections.brand} />
            {expandedSections.brand && (
              <div className="pb-6">
                <div className="grid grid-cols-2 gap-2">
                  {(() => {
                    const displayedBrands = showAllBrands ? currentBrands : currentBrands.slice(0, 10);
                    return displayedBrands.map((m) => (
                      <div
                        key={m.name}
                        onClick={() => onToggleFilter('brand', m.name)}
                        className={`flex items-center justify-center border rounded-lg h-[54px] transition-all cursor-pointer group p-1 ${isActive('brand', m.name) ? 'border-[#008d71] bg-white relative' : 'border-gray-300 hover:border-[#008d71]/60'
                          }`}
                      >
                        {m.logo ? (
                          <img src={m.logo} alt={m.name} className="max-h-[30px] w-auto transition-all group-hover:scale-105 mix-blend-multiply" />
                        ) : (
                          <span className={`text-[13px] font-bold text-center leading-tight ${isActive('brand', m.name) ? 'text-[#008d71]' : 'text-gray-700'}`}>
                            {m.name}
                          </span>
                        )}
                        {isActive('brand', m.name) && (
                          <div className="absolute bottom-1 right-1 w-4 h-4 bg-[#008d71] rounded flex items-center justify-center">
                            <span className="text-white text-[10px]">✓</span>
                          </div>
                        )}
                      </div>
                    ));
                  })()}
                </div>
                {currentBrands.length > 10 && (
                  <button
                    onClick={() => setShowAllBrands(!showAllBrands)}
                    className="w-full mt-3 py-2.5 flex items-center justify-center border border-gray-300 rounded-lg text-[13px] font-bold text-red-500 bg-white hover:bg-gray-50 transition-all uppercase tracking-wide gap-1"
                  >
                    {showAllBrands ? 'THU GỌN' : 'XEM THÊM'}
                    <span className="transform -translate-y-0.5">{showAllBrands ? '⌃' : '⌄'}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Mức giá */}
        <div>
          <FilterHeader title="Mức giá" section="price" isExpanded={expandedSections.price} />
          {expandedSections.price && (
          <div className="pb-6">
              <div className="flex flex-col gap-2 mt-4">
                {(() => {
                  const allRanges = currentConfig.priceRanges || [];
                  const displayedRanges = showAllPrices ? allRanges : allRanges.slice(0, 5);

                  return (
                    <>
                      {displayedRanges.map((range) => (
                        <button
                          key={range}
                          onClick={() => setFilters(prev => ({
                            ...prev,
                            priceRange: prev.priceRange === range ? null : range
                          }))}
                          className={`py-2.5 px-3 rounded-xl text-[15px] border transition-all text-center ${filters.priceRange === range
                              ? 'bg-[#008d71] text-white border-[#008d71] font-bold shadow-md'
                              : 'bg-[#f5f5f5] text-gray-600 border-transparent hover:border-[#008d71] hover:text-[#008d71]'
                            }`}
                        >
                          {range}
                        </button>
                      ))}

                      {allRanges.length > 5 && (
                        <button
                          onClick={() => setShowAllPrices(!showAllPrices)}
                          className="w-full mt-3 py-2.5 flex items-center justify-center gap-2 border border-gray-300 rounded-lg text-[15px] font-bold text-[#11559c] bg-white hover:bg-gray-50 transition-all"
                        >
                          {showAllPrices ? (
                            <>THU GỌN <span className="text-[12px] transform -translate-y-0.5 font-sans">^</span></>
                          ) : (
                            <>XEM THÊM <span className="text-[12px] transform translate-y-0.5 font-sans">v</span></>
                          )}
                        </button>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>

        {/* Các phần lọc động dựa trên category config */}
        {currentConfig.sections && currentConfig.sections.map(section => {
          const sectionTitles = {
            network: 'Mạng di động',
            rom: 'Bộ nhớ trong (ROM)',
            ram: 'Bộ nhớ RAM',
            nfc: 'Tính năng NFC',
            refreshRate: 'Tần số quét',
            battery: 'Dung lượng Pin',
            screenSize: 'Kích thước màn hình',
            cpu: 'Vi xử lý (CPU)',
            storage: 'Ổ cứng (SSD/HDD)',
            gpu: 'Card đồ họa (GPU)',
            resolution: 'Độ phân giải',
            panelType: 'Loại tấm nền',
            features: 'Tính năng đặc biệt',
            availability: 'Tình trạng hàng'
          };

          const sectionOptions = {
            network: ['5G', '4G'],
            rom: ['32GB', '64GB', '128GB', '256GB', '512GB', '1TB'],
            ram: ['4GB', '8GB', '12GB', '16GB', '32GB', '64GB'],
            nfc: ['Có', 'Không'],
            refreshRate: ['60Hz', '90Hz', '120Hz', '144Hz', '165Hz', '240Hz'],
            battery: ['Dưới 4000mAh', '4000mAh - 5000mAh', 'Trên 5000mAh'],
            screenSize: ['Dưới 6 inch', 'Trên 6 inch', 'Trên 10 inch', '13-14 inch', '15-16 inch'],
            cpu: ['Apple M1/M2/M3', 'Intel Core i3', 'Intel Core i5', 'Intel Core i7', 'Intel Core i9', 'AMD Ryzen 5', 'AMD Ryzen 7'],
            storage: ['128GB SSD', '256GB SSD', '512GB SSD', '1TB SSD'],
            gpu: ['NVIDIA GeForce RTX', 'Intel Iris Xe', 'AMD Radeon'],
            resolution: ['Full HD', '2K/QHD', '4K/UHD'],
            panelType: ['IPS', 'OLED/AMOLED', 'TN', 'VA'],
            features: ['Nhận diện khuôn mặt', 'Vân tay dưới màn hình', 'Sạc siêu nhanh', 'Kháng nước, kháng bụi'],
            availability: ['Hàng mới', 'Hàng cũ', 'Hàng sắp về']
          };

          if (!sectionOptions[section]) return null;

          return (
            <div key={section}>
              <FilterHeader title={sectionTitles[section]} section={section} isExpanded={expandedSections[section]} />
              {expandedSections[section] && renderFilterList(section, sectionOptions[section])}
            </div>
          );
        })}

        <div className="pt-6">
          <button
            onClick={() => setFilters({
              brand: null,
              priceRange: 'Tất cả',
              os: null,
              batteryTier: 'Tất cả',
              network: null,
              nfc: false,
              memoryCard: 'Tất cả',
              screenSize: 'Tất cả',
              rom: null,
              ram: null,
              cpu: null,
              refreshRate: null,
              storage: null,
              sortBy: 'relate'
            })}
            className="w-full flex items-center justify-center gap-2 py-4 text-[12px] font-black text-red-500 border-2 border-dashed border-red-50 rounded-xl hover:bg-red-50 transition-all uppercase"
          >
            <Trash2 size={16} />
            Làm mới toàn bộ
          </button>
        </div>
      </div>
    </aside>
  );
};

export default FilterSidebar;
