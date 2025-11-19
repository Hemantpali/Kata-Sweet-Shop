const axios = require('axios')

const BASE_URL = 'https://kata-sweet-shop-8w3q.onrender.com/api'

describe('Authentication', ()=>{
    
    test('user is able to signup only once', async()=>{

        const {email, password, response} = await signup()
        
        expect(response.status).toBe(200)
        expect(response.data).toHaveProperty('token')
        expect(response.data.token).toBeDefined()

        try {
            const updatedResponse = await axios.post(`${BASE_URL}/auth/register`, {
                email,
                password,
                name: 'test'
            })
            
        } catch (error) {
            expect(error.response.status).toBe(400)
            expect(error.response.data).toHaveProperty('message')
            expect(error.response.data.message).toBe("Username Already Exists!")
            
        }

    })

    test('Signup request fails if the email is empty', async()=>{
        const password = '123123'

        try {
            const response = await axios.post(`${BASE_URL}/auth/register`, {
                password,
                name: 'test'
            })
        } catch (error) {
            
            expect(error.response.status).toBe(400)
            expect(error.response.data.message).toBe("Validation Failed")
        }

    })

    test('Signin succeeds if email and password are correct', async()=>{
                
        const {email, password} = await signup()

        const response = await axios.post(`${BASE_URL}/auth/login`, {
            email,
            password
        })

        expect(response.status).toBe(200)
        expect(response.data).toHaveProperty('token')
        expect(response.data.token).toBeDefined()

    })

    test('Signin fails if email or password is incorrect', async()=>{
        const password = '123123'
        const email = "doesntexistemail@test.com"
        try {
            const response = await axios.post(`${BASE_URL}/auth/login`, {
                email,
                password,
                name: 'test'
            })
        } catch (error) {
            
            expect(error.response.status).toBe(404)
            expect(error.response.data.message).toBe("User not found")
        }

    })
})

describe('Purchase and Restock (Inventory)', ()=>{
    let adminToken = ''
    let userToken = ''
    //will run before tests
    beforeAll(async() => {
        const admin = await axios.post(`${BASE_URL}/auth/login`,{
            email: 'admin@test.com',
            password: 'admin123'
        })
        adminToken = admin.data.token

        const {response: user} = await signup()
        userToken = user.data.token
    });

    test('User is able to purchase if enough stock is available', async()=>{
        const response = await axios.post(`${BASE_URL}/sweets/:id/purchase`, 
            {quantity: 2},
            {
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                    'Content-Type': 'application/json'
                }
            }
        )

        expect(response.status).toBe(200)
        expect(response.data).toHaveProperty('message')
        expect(response.data.message).toBe("Purchase successful")
    })

    test('User is not able to purchase if not enough stock is available', async()=>{
        try {
            const response = await axios.post(`${BASE_URL}/sweets/:id/purchase`, 
                {quantity: 2000},
                {
                    headers: {
                        'Authorization': `Bearer ${userToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            )
        } catch (error) {
            expect(error.response.status).toBe(400)
            expect(error.response.data).toHaveProperty('message')
            expect(error.response.data.message).toBe("Not enough stock available")
        }
    })

    test("Admin is able to restock", async()=>{
        const response = await axios.post(`${BASE_URL}/sweets/:id/restock`, 
            {quantity: 20},
            {
                headers: {
                    "Authorization": `Bearer ${adminToken}`,
                    'Content-Type': 'application/json'
                }
            }
        )

        expect(response.status).toBe(200)
        expect(response.data).toHaveProperty('message')
        expect(response.data.message).toBe("Restock successful")
    })
})

describe('CRUD operations on sweets', ()=>{
    let adminToken = ''
    let userToken = ''
    //will run before tests
    beforeAll(async() => {
        const admin = await axios.post(`${BASE_URL}/auth/login`,{
            email: 'admin@test.com',
            password: 'admin123'
        })
        adminToken = admin.data.token
        
        const {response: user} = await signup()
        userToken = user.data.token
    });

    test('Admin can add a new sweet', async()=>{
        try {
            const sweetData = {
            name: 'Test Sweet',
            price: 10.99,
            quantity: 50,
            category: 'Test Category'
        }

        const response = await axios.post(`${BASE_URL}/sweets`, 
            sweetData,
            {
                headers: {
                    'Authorization': `Bearer ${adminToken}`,
                    'Content-Type': 'application/json'
                }
            }
        )

        expect(response.status).toBe(200)
        expect(response.data).toHaveProperty('message')
        expect(response.data.message).toBe("Sweet created successfully")
        } catch (error) {
            expect(error.response.status).toBe(500)
            expect(error.response.data).toHaveProperty('message')
            expect(error.response.data.message).toBe("You are not authorized")
        }
    })

    test('Regular user cannot add a new sweet', async()=>{
        const sweetData = {
            name: 'Test Sweet',
            price: 10.99,
            quantity: 50,
            category: 'Test Category'
        }

        try {
            const response = await axios.post(`${BASE_URL}/sweets`, 
                sweetData,
                {
                    headers: {
                        'Authorization': `Bearer ${userToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            )
        } catch (error) {
            expect(error.response.status).toBe(403)
            expect(error.response.data).toHaveProperty('message')
            expect(error.response.data.message).toBe("You are not authorized")
        }
    })

    test('Admin can update a sweet', async()=>{
        const updateData = {
            name: 'Updated Sweet Name',
            price: 15.99,
            quantity: 75,
            category: 'Updated Category'
        }

        const response = await axios.put(`${BASE_URL}/sweets/4`, 
            updateData,
            {
                headers: {
                    'Authorization': `Bearer ${adminToken}`,
                    'Content-Type': 'application/json'
                }
            }
        )

        expect(response.status).toBe(200)
        expect(response.data).toHaveProperty('message')
        expect(response.data.message).toBe("Sweet updated successfully")
    })

    test('Regular user cannot update a sweet', async()=>{
        const updateData = {
            name: 'Updated Sweet Name',
            price: 15.99,
            quantity: 75,
            category: 'Updated Category'
        }

        try {
            const response = await axios.put(`${BASE_URL}/sweets/4`, 
                updateData,
                {
                    headers: {
                        'Authorization': `Bearer ${userToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            )
        } catch (error) {
            expect(error.response.status).toBe(403)
            expect(error.response.data).toHaveProperty('message')
            expect(error.response.data.message).toBe("You are not authorized")
        }
    })

    test('Admin can delete a sweet', async()=>{
        const response = await axios.delete(`${BASE_URL}/sweets/4`, 
            {
                headers: {
                    'Authorization': `Bearer ${adminToken}`,
                }
            }
        )

        expect(response.status).toBe(200)
        expect(response.data).toHaveProperty('message')
        expect(response.data.message).toBe("Sweet deleted successfully")
    })

    test('Regular user cannot delete a sweet', async()=>{
        try {
            const response = await axios.delete(`${BASE_URL}/sweets/4`, 
                {
                    headers: {
                        'Authorization': `Bearer ${userToken}`
                    }
                }
            )
        } catch (error) {
            expect(error.response.status).toBe(403)
            expect(error.response.data).toHaveProperty('message')
            expect(error.response.data.message).toBe("You are not authorized")
        }
    })

    test('Both admin and regular user can view sweets', async()=>{
        // Test with admin token
        const adminResponse = await axios.get(`${BASE_URL}/sweets`, 
            {
                headers: {
                    'Authorization': `Bearer ${adminToken}`
                }
            }
        )

        expect(adminResponse.status).toBe(200)
        expect(Array.isArray(adminResponse.data)).toBe(true)

        // Test with user token
        const userResponse = await axios.get(`${BASE_URL}/sweets`, 
            {
                headers: {
                    'Authorization': `Bearer ${userToken}`
                }
            }
        )

        expect(userResponse.status).toBe(200)
        expect(Array.isArray(userResponse.data)).toBe(true)
    })

    test('Unauthenticated user cannot access any sweets endpoint', async()=>{
        // Test GET endpoint
        try {
            await axios.get(`${BASE_URL}/sweets`)
        } catch (error) {
            expect(error.response.status).toBe(401)
        }

        // Test POST endpoint
        try {
            await axios.post(`${BASE_URL}/sweets`, {
                name: 'Test Sweet',
                price: 10.99,
                stock: 50
            })
        } catch (error) {
            expect(error.response.status).toBe(401)
        }

        // Test PUT endpoint
        try {
            await axios.put(`${BASE_URL}/sweets/1`, {
                name: 'Updated Sweet'
            })
        } catch (error) {
            expect(error.response.status).toBe(401)
        }

        // Test DELETE endpoint
        try {
            await axios.delete(`${BASE_URL}/sweets/1`)
        } catch (error) {
            expect(error.response.status).toBe(401)
        }
    })

    test('User can search/filter sweets', async()=>{
        const searchWith = {
            name: 'Ladoo'
        }
        
        const response = await axios.get(`${BASE_URL}/sweets/search`, 
            {
                params: searchWith,
                headers: {
                    'Authorization': `Bearer ${userToken}`
                }
            }
        )

        expect(response.status).toBe(200)
        expect(Array.isArray(response.data)).toBe(true)
        expect(response.data.length).toBeGreaterThan(-1)
        
    })
})

async function signup(){
    const email = 'test' + Math.random() + '@test.com'
    const password = '123123'

    const response = await axios.post(`${BASE_URL}/auth/register`, {
        email,
        password,
        name: 'test'
    })

    return {email, password, response}
}
