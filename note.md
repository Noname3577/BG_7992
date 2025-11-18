รูปแบบ API (TradingView History)
https://api.bitkub.com/tradingview/history
### **Parameters**
| Name           | Type   | Required | Description                       |
| -------------- | ------ | -------- | --------------------------------- |
| **symbol**     | string | ✔        | เช่น `BTC_THB`                    |
| **resolution** | string | ✔        | เช่น `1, 5, 15, 60, 240, 1D`      |
| **from**       | int    | ✔        | timestamp เริ่มต้น (Unix seconds) |
| **to**         | int    | ✔        | timestamp สิ้นสุด (Unix seconds)  |
---
# ✔ ตัวอย่าง CURL ใช้งานจริง
ดึงกราฟ BTC/THB ย้อนหลัง 1 ชั่วโมง (resolution = 1 นาที)
```bash
curl -X GET "https://api.bitkub.com/tradingview/history?symbol=BTC_THB&resolution=1&from=1731900000&to=1731903600"
```
---
# ✔ ตัวอย่างผลลัพธ์ที่ API จะส่งกลับ
```json
{
  "t": [1731900000, 1731900060, 1731900120],
  "c": [2300000, 2302000, 2301500],
  "o": [2299000, 2300000, 2302000],
  "h": [2303000, 2302500, 2302500],
  "l": [2298000, 2300000, 2301000],
  "v": [1.2, 0.5, 0.8],
  "s": "ok"
}
```
**ข้อมูลหมายถึง**

* `t` = time (timestamp)
* `o` = open
* `h` = high
* `l` = low
* `c` = close
* `v` = volume