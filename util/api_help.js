// * app.post('/admin/login', adminLogin)
// * TAKES AS A PAYLOAD:
/*
    {
        "email": "test@gmail.com",
        "password": "123456"
    }
*/
// * RETURNS:
/*
    {
        "token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjgzYTczOGUyMWI5MWNlMjRmNDM0ODBmZTZmZWU0MjU4Yzg0ZGI0YzUiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vYWx1bW5paXVzIiwiYXVkIjoiYWx1bW5paXVzIiwiYXV0aF90aW1lIjoxNTg2MDI1NzI2LCJ1c2VyX2lkIjoiWUR0MWhZclh1a1lvcmxpQVBxcDJQdnNsc2dwMSIsInN1YiI6IllEdDFoWXJYdWtZb3JsaUFQcXAyUHZzbHNncDEiLCJpYXQiOjE1ODYwMjU3MjYsImV4cCI6MTU4NjAyOTMyNiwiZW1haWwiOiJ0ZXN0QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJlbWFpbCI6WyJ0ZXN0QGdtYWlsLmNvbSJdfSwic2lnbl9pbl9wcm92aWRlciI6InBhc3N3b3JkIn19.btLZh5Q06kaev2bxhRc5B_Yhc35QeH9ASWemaP5jZ7Gg21K24HFc_VKZMmGP-vF8isN1JAjkxpafksEOP55ExUgDn-1cKZFQplp3W4wa0FATRlMLynu8tO_dhWLo5Hn-zgumexL6tUVQXqjLhxol88regLCOUZ2Cpf6Vj8QQkLSToTQDZoY-CQHdXQCbFW_2eOFSuzYf4oUtNY_I2F_QBGDcCtsske3HB7AGwARVFulS8L5ZxuwFF66mDeWjxTCClZ9YKizoz_LGCHDv6KYBWMNcwbGyI-k_sW0qSo1U-qAPuTbSIlFG969Wcd5lmkRQw_6yV1esVkBI8v0JQVC6Yg"
    }
*/

// * app.post('/admin/change-password', auth, changePassword)
// * TAKES AS A PAYLOAD:
/*
    {
        "email": "test@gmail.com",
        "password": "123456",
        "newPassword": "12345678",
        "newPasswordConfirm": "12345678"
    }
*/
// * RETURNS:
/*
    { message: 'Password successfully changed!' }
*/

// * app.post('/admin/add-student', auth, addStudent)
// * TAKES AS A PAYLOAD:
/*
    {
        "name": "Muhammed",
        "surname": "Musanovic",
        "graduated": "22/4/2022",
        "description": "Senior Software Engineer at Tesla Inc.",
        "location": {
            "title": "Sarajevo, BiH",
            "coordinates": [23.1121, 123.4321],
            "type": "Point"
        }
    }
*/
// * RETURNS:
/*
    { message: 'New student successfully added!' }
*/

// * app.put('/admin/edit-student', auth, editStudent)
// * TAKES AS A PAYLOAD:
/*
    {
        "studentId": "BdrMIFDMYWDjrIENYANn",
        "name": "Muhammed",
        "surname": "Musanovic",
        "graduated": "22/4/2022",
        "description": "Senior Software Engineer at Tesla Inc.",
        "location": {
            "title": "Sarajevo, BiH",
            "coordinates": [23.1121, 123.4321],
            "type": "Point"
        }
    }
*/
// * RETURNS:
/*
    { message: 'Student info successfully updated!' }
*/

// * app.delete('/admin/delete-student', auth, deleteStudent)
// * TAKES AS A PAYLOAD:
/*
    {
        "studentId": "BdrMIFDMYWDjrIENYANn"
    }
*/
// * RETURNS:
/*
    { message: 'Student successfully deleted!' }
*/

// * app.get('/admin/load', auth, adminLoad)
// * TAKES NOTHING -> SIMPLE GET REQUEST
// * RETURNS:
/*
    {
        "isAuthenticated": "true"
    }
*/

// * app.get('/students/locations', getStudentsLocations)
// * TAKES NOTHING -> SIMPLE GET REQUEST
// * RETURNS:
/*
    [
        {
            "studentId": "BdrMIFDMYWDjrIENYANn",
            "coordinates": [
                23.1121,
                123.4321
            ]
        },
        {
            "studentId": "rYLJtKqMgUzQBYNSE6TB",
            "coordinates": [
                42.2121,
                84.3212
            ]
        }
    ]
*/

// * app.get('/students/list-all/:page_no/:item_limit', getAllStudents)
// * TAKES NOTHING -> SIMPLE GET REQUEST
// * RETURNS:
/*
    {
        "pages_number": 10,
        "current_page": 3,
        "data": [
            {
                "studentId": "BdrMIFDMYWDjrIENYANn",
                "location": {
                    "title": "Sarajevo, BiH",
                    "coordinates": [
                        23.1121,
                        123.4321
                    ],
                    "type": "Point"
                },
                "name": "Muhammed",
                "surname": "Musanovic",
                "description": "Senior Software Engineer at Tesla Inc.",
                "graduated": "22/4/2022"
            },
            {
                "studentId": "rYLJtKqMgUzQBYNSE6TB",
                "name": "Harun",
                "surname": "Tucakovic",
                "description": "Senior Software Engineer at Google LLC",
                "graduated": "22/4/2022",
                "location": {
                    "coordinates": [
                        42.2121,
                        84.3212
                    ],
                    "type": "Point",
                    "title": "Chicago, Illinois, USA"
                }
            }
        ]
    }
*/

// * app.get('/student/:studentId', getStudentById)
// * TAKES "studentId" as argument in URL
// * RETURNS:
/*
    {
        "studentId": "BdrMIFDMYWDjrIENYANn",
        "location": {
            "coordinates": [
                23.1121,
                123.4321
            ],
            "type": "Point",
            "title": "Sarajevo, BiH"
        },
        "name": "Muhammed",
        "surname": "Musanovic",
        "description": "Senior Software Engineer at Tesla Inc.",
        "graduated": "22/4/2022"
    }
*/

// * app.get('/students/stats', getStudnetsStats)
// * TAKES NOTHING -> SIMPLE GET REQUEST
// * RETURNS:
/*
    {
        "numberOfStudents": 9,
        "locations": [
            [
                "Tuzla, BiH",
                3
            ],
            [
                "Istanbul, Turkey",
                2
            ],
            [
                "Sarajevo, BiH",
                2
            ],
            [
                "Ankara, Turkey",
                1
            ],
            [
                "Hrasnica, Ilidza",
                1
            ]
        ]
    }
*/
// NOTE for getStudentsStats:
// Returns top 5 locations, if there is less then 5 than it returns all locations
// Locations are sorted in descending order (just like in the example above!)

// ? NEW ROUTE
// * app.post('/admin/register', auth, ...)
// * TAKES AS PAYLOAD:
/*{
    "email": "admin",
    "password": "123456"
}*/
// * RETURNS:
/*
{
    "message": "..."
}
*/

// ? NEW ROUTE
// * app.get('/admin/delete-account', auth, ...)
// * TAKES NOTHING -> SIMPLE GET REQUEST
// * RETURNS:
// { message: 'Account successfully deleted!' }

// ? NEW ROUTE
// * app.get('/admin/accounts', auth, ...)
// * TAKES NOTHING -> SIMPLE GET REQUEST
// * RETURNS:
/*[
    {
    "account_id": "...",
    "username": "..."
    }
]*/
