# website-ban-dien-thoai

## Cloudinary setup

Backend da co san API upload anh:

- `POST /api/uploads/image`

API nay yeu cau dang nhap. Neu upload anh san pham thi tai khoan phai la `admin`.

### 1. Tao tai khoan Cloudinary

Dang ky tai `https://cloudinary.com/` va vao Dashboard de lay:

- `cloud name`
- `api key`
- `api secret`

### 2. Cau hinh backend

Tao file `backend/.env` hoac bo sung vao file hien co mot trong hai cach:

```env
CLOUDINARY_URL=cloudinary://your_api_key:your_api_secret@your_cloud_name
```

hoac:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Ban co the copy mau tu [backend/.env.example](C:/Users/hau45/OneDrive/Desktop/DACS/DACSTT/website-ban-dien-thoai/backend/.env.example).

### 3. Restart backend

Neu dang chay `node server.js` thi restart server.
Neu dang chay `nodemon` thi backend se tu reload.

### 4. Test upload bang Postman

Request:

```http
POST http://localhost:8080/api/uploads/image
Authorization: Bearer <adminToken>
Content-Type: application/json
```

Body:

```json
{
  "fileData": "data:image/png;base64,iVBORw0KGgoAAA...",
  "target": "product",
  "publicId": "honor-phone-main"
}
```

Response thanh cong se co:

```json
{
  "message": "Upload hinh anh thanh cong.",
  "file": {
    "url": "https://res.cloudinary.com/.../image/upload/v.../honor-phone-main.png",
    "publicId": "mobile-shop/products/honor-phone-main"
  }
}
```

Lay `file.url` gan vao field `image` hoac `images` khi tao product.

### 5. Dung trong frontend

Frontend da co helper:

- `uploadService.uploadProductImage(fileOrDataUrl, { publicId })`

File:

- [Frontend/src/services/shopApi.js](C:/Users/hau45/OneDrive/Desktop/DACS/DACSTT/website-ban-dien-thoai/Frontend/src/services/shopApi.js)
