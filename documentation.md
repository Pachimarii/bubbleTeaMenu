
# PROJECT NAME

---

Name: Minhui Xie

Date: 10/27/2019

Project Topic: Bubble Tea Menu

URL: 

---


### 1. Data Format and Storage

Data point fields:
- `Field 1`: id            `Type: Number`
- `Field 2`: name          `Type: String`
- `Field 3`: ingredients   `Type: [string]`
- `Field 4`: toppings      `Type: [String]`
- `Field 5`: notes         `Type: String`
- `Field 6`: rating        `Type: Number`

Schema: 
```javascript
{
  id: Number,
  name: String,
  ingredients: [String],
  toppings: [String],
  notes: String,
  rating: Number
}
```

### 2. Add New Data

HTML form route: `/newdrink`

POST endpoint route: `/api/addBubbleTea`

Example Node.js POST request to endpoint: 
```javascript
var request = require("request");

var options = { 
    method: 'POST',
    url: 'http://localhost:3000/api/addBubbleTea',
    headers: { 
        'content-type': 'application/x-www-form-urlencoded' 
    },
    form: { 
      name: "my bubble tea",
      ingredients: ["black tea","milk"],
      toppings: ["grass jelly","pudding"],
      notes: "my standard bubble tea"
    } 
};

request(options, function (error, response, body) {
  if (error) throw new Error(error);

  console.log(body);
});
```

### 3. View Data

GET endpoint route: `/api/getFullMenu`

### 4. Search Data

Search Field: `name`

### 5. Navigation Pages

Navigation Filters
1. Alphabetical -> `/alphabetical`
2. By Rating -> `/rating`
3. Tapioca Pearls Only -> `/pearls_only`
4. Non Tea Drinks -> `/nontea`
5. Random 3 Drinks -> `/random3`

